#!/usr/bin/env bash
# Fetches all SIP Triaging tickets for Inventory & Purchasing squad from Jira
# Outputs normalized JSON to public/tickets.json

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$HOME/buildops/inventory-mcp/.env"
OUTPUT="$PROJECT_DIR/public/tickets.json"

# Load env
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: $ENV_FILE not found" >&2
  exit 1
fi
export $(grep -E '^(ATLASSIAN_USERNAME|ATLASSIAN_API_TOKEN|JIRA_URL)=' "$ENV_FILE" | xargs)

JQL='project = SIP AND status = Triaging AND "Squad (Multi-Select)[Select List (multiple choices)]" = "Inventory & Purchasing" AND type not in ("Product Question", "Feature Escalation Request") ORDER BY created ASC'
FIELDS='summary,status,assignee,priority,issuetype,created,updated,description,issuelinks'

echo "Fetching SIP tickets from Jira..."

ALL_ISSUES="[]"
NEXT_TOKEN=""
PAGE=0

while true; do
  PAGE=$((PAGE + 1))

  PARAMS=(
    --data-urlencode "jql=$JQL"
    --data-urlencode "fields=$FIELDS"
    --data-urlencode "maxResults=100"
  )

  if [[ -n "$NEXT_TOKEN" ]]; then
    PARAMS+=(--data-urlencode "nextPageToken=$NEXT_TOKEN")
  fi

  RESPONSE=$(curl -s -u "$ATLASSIAN_USERNAME:$ATLASSIAN_API_TOKEN" \
    "$JIRA_URL/rest/api/3/search/jql" \
    -G "${PARAMS[@]}" \
    -H "Accept: application/json")

  COUNT=$(echo "$RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('issues',[])))")
  echo "  Page $PAGE: $COUNT issues"

  # Normalize and append issues
  ALL_ISSUES=$(echo "$RESPONSE" | python3 -c "
import json, sys
existing = json.loads('$ALL_ISSUES') if '$ALL_ISSUES' != '[]' else []
# Read from file to avoid shell escaping issues
" 2>/dev/null || echo "$ALL_ISSUES")

  # Actually, let's just save raw pages and normalize at the end
  echo "$RESPONSE" > "/tmp/sip_page_${PAGE}.json"

  NEXT_TOKEN=$(echo "$RESPONSE" | python3 -c "import json,sys; print(json.load(sys.stdin).get('nextPageToken',''))" 2>/dev/null)

  if [[ -z "$NEXT_TOKEN" ]] || [[ "$COUNT" -eq 0 ]]; then
    break
  fi
done

# Combine all pages and normalize
python3 << PYEOF
import json, glob, os

all_issues = []
for i in range(1, $PAGE + 1):
    path = f"/tmp/sip_page_{i}.json"
    with open(path) as f:
        data = json.load(f)
    all_issues.extend(data.get("issues", []))

# Normalize
normalized = []
for issue in all_issues:
    f = issue["fields"]

    # Extract plain text from ADF description
    desc_text = ""
    if f.get("description") and isinstance(f["description"], dict):
        for block in f["description"].get("content", []):
            for inline in block.get("content", []):
                if inline.get("type") == "text":
                    desc_text += inline.get("text", "")
            desc_text += " "
    elif isinstance(f.get("description"), str):
        desc_text = f["description"]

    # Extract linked issue keys from issuelinks
    linked_keys = []
    for link in f.get("issuelinks", []):
        if "inwardIssue" in link:
            linked_keys.append(link["inwardIssue"]["key"])
        elif "outwardIssue" in link:
            linked_keys.append(link["outwardIssue"]["key"])

    normalized.append({
        "key": issue["key"],
        "summary": f.get("summary", ""),
        "priority": f["priority"]["name"] if f.get("priority") else "None",
        "status": f["status"]["name"] if f.get("status") else "Unknown",
        "assignee": (f["assignee"]["displayName"] if f.get("assignee") else "Unassigned"),
        "type": f["issuetype"]["name"] if f.get("issuetype") else "Unknown",
        "created": f.get("created", "")[:10],
        "updated": f.get("updated", "")[:10],
        "description": desc_text.strip()[:500],
        "linkedKeys": linked_keys,
    })

# Compute refCount: how many other tickets in the set link to each ticket
all_keys = {t["key"] for t in normalized}
ref_counts = {}
for t in normalized:
    for lk in t["linkedKeys"]:
        if lk in all_keys:
            ref_counts[lk] = ref_counts.get(lk, 0) + 1

for t in normalized:
    t["refCount"] = ref_counts.get(t["key"], 0)

with open("$OUTPUT", "w") as out:
    json.dump(normalized, out, indent=2)

print(f"Wrote {len(normalized)} tickets to $OUTPUT")
PYEOF

# Cleanup temp files
rm -f /tmp/sip_page_*.json

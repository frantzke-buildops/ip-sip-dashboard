const JQL =
  'project = SIP AND status = Triaging AND "Squad (Multi-Select)[Select List (multiple choices)]" = "Inventory & Purchasing" AND type not in ("Product Question", "Feature Escalation Request") ORDER BY created ASC';

const FIELDS =
  "summary,status,assignee,priority,issuetype,created,updated,description,issuelinks";

function extractDescription(description) {
  if (!description) return "";
  if (typeof description === "string") return description;
  let text = "";
  for (const block of description.content ?? []) {
    for (const inline of block.content ?? []) {
      if (inline.type === "text") text += inline.text ?? "";
    }
    text += " ";
  }
  return text.trim().slice(0, 500);
}

function normalizeIssue(issue) {
  const f = issue.fields;
  const linkedKeys = (f.issuelinks ?? []).map(
    (link) => (link.inwardIssue ?? link.outwardIssue)?.key
  ).filter(Boolean);

  return {
    key: issue.key,
    summary: f.summary ?? "",
    priority: f.priority?.name ?? "None",
    status: f.status?.name ?? "Unknown",
    assignee: f.assignee?.displayName ?? "Unassigned",
    type: f.issuetype?.name ?? "Unknown",
    created: (f.created ?? "").slice(0, 10),
    updated: (f.updated ?? "").slice(0, 10),
    description: extractDescription(f.description),
    linkedKeys,
  };
}

function computeRefCounts(tickets) {
  const allKeys = new Set(tickets.map((t) => t.key));
  const counts = {};
  for (const t of tickets) {
    for (const lk of t.linkedKeys) {
      if (allKeys.has(lk)) counts[lk] = (counts[lk] ?? 0) + 1;
    }
  }
  return tickets.map((t) => ({ ...t, refCount: counts[t.key] ?? 0 }));
}

export async function fetchTickets() {
  const allIssues = [];
  let nextPageToken = "";

  while (true) {
    const params = new URLSearchParams({
      jql: JQL,
      fields: FIELDS,
      maxResults: "100",
    });
    if (nextPageToken) params.set("nextPageToken", nextPageToken);

    const res = await fetch(`/api/jira/search/jql?${params}`);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Jira API error ${res.status}: ${text}`);
    }

    const data = await res.json();
    const issues = data.issues ?? [];
    allIssues.push(...issues);

    nextPageToken = data.nextPageToken ?? "";
    if (!nextPageToken || issues.length === 0) break;
  }

  const normalized = allIssues.map(normalizeIssue);
  return computeRefCounts(normalized);
}

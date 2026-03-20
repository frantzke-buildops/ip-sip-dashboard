# IP SIP Dashboard — Build Session Notes

**Date**: 2026-03-20
**Repo**: https://github.com/frantzke-buildops/ip-sip-dashboard.git

## What Was Built

A React dashboard for SIP (Support Issue in Production) Jira tickets assigned to the Inventory & Purchasing squad. The app visualizes triaging-queue tickets with filtering, search, and linked-ticket analysis.

## Tech Stack

- **Vite + React 18** (no CRA, no component library)
- **Plain CSS** with CSS custom properties for theming
- **Canvas API** for donut chart (no chart library)
- **Pre-fetched JSON strategy**: `scripts/fetch-tickets.sh` calls Jira API, saves to `public/tickets.json` (gitignored)

## Key Features

1. **Stats row** — Total Tickets, High Priority, Medium Priority cards (clickable to filter table)
2. **Priority donut chart** — Canvas-based, shows high/medium breakdown
3. **Theme grouping** — Filter buttons to group tickets by theme/category
4. **Sortable table** — Columns: key, summary, priority, created date, refs (linked tickets)
5. **Live search** — Filters table in real-time
6. **Linked work items** — `refCount` computed by cross-referencing which tickets in the set link to each other
7. **Dark mode toggle** — Icon button next to Refresh; uses `data-theme="dark"` on `<html>`
8. **Spaceship/HUD theme** — Frosted glass panels, cyan accents, JetBrains Mono font, grid background

## Architecture Decisions

- **Static totals on filter**: When filtering by priority, Total and other priority counts stay fixed (computed from `rawTickets`). Only the table and donut chart reflect the active filter.
- **Canvas dark mode**: Canvas ignores CSS variables. `darkMode` is passed as a React prop to `DonutChart` and included in the `useEffect` dependency array so text colors update on theme change.
- **Jira pagination**: Uses REST API v3 `/rest/api/3/search/jql` with `nextPageToken` pagination.
- **JQL**: `project = SIP AND status = Triaging AND "Squad..." = "Inventory & Purchasing" AND type not in (...) ORDER BY created ASC`

## File Structure

```
ip-sip-dashboard/
  index.html              — Google Fonts (JetBrains Mono), favicon
  public/favicon.svg      — Rocket icon in cyan/red/amber
  public/tickets.json     — Fetched data (gitignored)
  scripts/fetch-tickets.sh — Jira fetch + Python normalization + refCount computation
  src/
    index.css             — CSS variables, dark mode overrides, grid background
    App.css               — Spaceship theme: frosted panels, accent borders, table styles
    App.jsx               — Main app state, dark mode toggle, filtering logic
    components/
      StatsRow.jsx        — 3 stat cards (Total, High, Medium), clickable for filtering
      DonutChart.jsx      — Canvas donut with darkMode prop support
      TicketTable.jsx     — Sortable table with Refs column, search integration
```

## Lessons / Gotchas

- **Canvas + CSS variables don't mix**: Canvas rendering happens in JS; CSS `data-theme` attribute styling has no effect. Must pass theme state as a prop and use it directly in the draw function.
- **`useEffect` deps matter for canvas**: Forgetting to add `darkMode` to the dependency array means the chart won't re-render on theme toggle.
- **Jira v2 search is deprecated**: `/rest/api/2/search` returns 410. Use `/rest/api/3/search/jql` instead.
- **`issuelinks` field**: Contains `inwardIssue` and `outwardIssue` objects; need to extract keys from both to compute cross-references within the fetched ticket set.

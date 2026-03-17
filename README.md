# SIP Mission Control

A React dashboard for triaging SIP (Support Issue in Production) Jira tickets assigned to the Inventory & Purchasing squad.

## Prerequisites

- Node.js 18+
- Access to BuildOps Jira (Atlassian credentials)

## Setup

**1. Install dependencies**

```bash
npm install
```

**2. Configure credentials**

```bash
cp example.env .env
```

Then open `.env` and fill in your values:

```
JIRA_URL=https://buildops.atlassian.net
ATLASSIAN_USERNAME=your-email@buildops.com
ATLASSIAN_API_TOKEN=your-api-token
```

Your API token can be generated at [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens).

> **Note:** `.env` is gitignored. Credentials are only used by the Vite dev server proxy — they are never sent to the browser.

**3. Run**

```bash
npm run dev
```

Opens at `http://localhost:5173`. Tickets are fetched live from Jira on startup.

## Features

- **Stats row** — Total tickets, High count, Medium count, average age (days). Click High/Medium cards to filter by priority.
- **Priority donut chart** — Canvas-based High vs Medium breakdown.
- **Theme classification** — Tickets are auto-classified into 17 themes by keyword matching on the summary. Each ticket can match multiple themes. Click theme buttons to filter the table.
- **Sortable table** — Columns: Key (linked to Jira), Refs, Priority, Summary, Themes, Created. Sorting by Theme with no active filter groups rows under theme headers.
- **Reference count** — "Refs" column shows how many other triaging tickets link to each ticket, surfacing hotspot issues.
- **Search** — Live search across ticket key, summary, and assignee.
- **Priority filter** — Dropdown or stat card click to filter by High/Medium.
- **Refresh button** — Re-fetches all tickets from Jira without reloading the page.

## How It Works

The Vite dev server proxies `/api/jira/*` to the Jira REST API, injecting Basic auth headers from your `.env`. The browser never sees your credentials. Tickets are fetched on page load and on each Refresh.

## Project Structure

```
example.env                     # Template — copy to .env and fill in values
vite.config.js                  # Vite config + Jira proxy setup
scripts/
  fetch-tickets.sh              # Legacy shell fetcher (pre-proxy approach)
src/
  App.jsx                       # Main app with state management
  App.css                       # All styles
  themes.js                     # Theme definitions + keyword classifier
  components/
    StatsRow.jsx                # Stat cards (clickable priority filter)
    DonutChart.jsx              # Canvas priority donut chart
    ThemeFilter.jsx             # Theme filter buttons
    TicketTable.jsx             # Sortable ticket table with grouping
    SearchBar.jsx               # Search input + priority dropdown
  utils/
    fetchTickets.js             # Live Jira fetcher + ref-count computation
    dateUtils.js                # Age calculation and date formatting
```

## Tech Stack

- Vite + React 18
- Plain CSS (no component library)
- Canvas API for the donut chart
- No external chart or UI dependencies

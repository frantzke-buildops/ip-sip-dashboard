# SIP Dashboard

A React dashboard for triaging SIP (Support Issue in Production) Jira tickets assigned to the Inventory & Purchasing squad.

## Prerequisites

- Node.js 18+
- Access to BuildOps Jira (Atlassian credentials)
- Credentials stored in `~/buildops/inventory-mcp/.env`:
  ```
  JIRA_URL=https://buildops.atlassian.net
  ATLASSIAN_USERNAME=your-email@example.com
  ATLASSIAN_API_TOKEN=your-api-token
  ```

## Setup

```bash
npm install
```

## Fetch Ticket Data

The dashboard reads from a pre-fetched `public/tickets.json` file. Run the fetch script to pull the latest tickets from Jira:

```bash
./scripts/fetch-tickets.sh
```

This queries all SIP tickets in "Triaging" status for the Inventory & Purchasing squad, paginates through all results, and writes normalized JSON to `public/tickets.json`.

Re-run this script whenever you want to refresh the data.

## Run

```bash
npm run dev
```

Opens at `http://localhost:5173`.

## Features

- **Stats row** — Total tickets, High count, Medium count, average age. Click High/Medium cards to filter by priority.
- **Priority donut chart** — Canvas-based High vs Medium breakdown.
- **Theme classification** — Tickets are auto-classified into 17 themes by keyword matching on the summary. Each ticket can match multiple themes. Click theme buttons to filter the table.
- **Sortable table** — Columns: Key (linked to Jira), Priority, Summary, Themes (color tags), Created. Sorting by Theme with no active filter groups rows under theme headers.
- **Search** — Live search across ticket key, summary, and assignee.
- **Priority filter** — Dropdown or stat card click to filter by High/Medium.

## Project Structure

```
scripts/
  fetch-tickets.sh        # Jira data fetcher (curl + Python normalizer)
public/
  tickets.json            # Pre-fetched ticket data (gitignored)
src/
  App.jsx                 # Main app with state management
  App.css                 # All styles
  themes.js               # Theme definitions + keyword classifier
  components/
    StatsRow.jsx           # Stat cards (clickable priority filter)
    DonutChart.jsx         # Canvas priority donut chart
    ThemeFilter.jsx        # Theme filter buttons
    TicketTable.jsx        # Sortable ticket table with grouping
    SearchBar.jsx          # Search input + priority dropdown
  utils/
    dateUtils.js           # Age calculation and date formatting
```

## Tech Stack

- Vite + React 18
- Plain CSS (no component library)
- Canvas API for the donut chart
- No external chart or UI dependencies

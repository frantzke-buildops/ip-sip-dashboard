import { useState } from "react";
import { getThemeById, getAllThemes } from "../themes";
import { formatDate, ageDays } from "../utils/dateUtils";

const JIRA_BASE = "https://buildops.atlassian.net/browse/";

const COLUMNS = [
  { key: "key", label: "Key", sortable: true },
  { key: "priority", label: "Priority", sortable: true },
  { key: "summary", label: "Summary", sortable: true },
  { key: "themes", label: "Themes", sortable: true },
  { key: "created", label: "Created", sortable: true },
];

function sortTickets(tickets, sortConfig) {
  if (!sortConfig) return tickets;

  const { key, direction } = sortConfig;
  const sorted = [...tickets].sort((a, b) => {
    let aVal, bVal;

    if (key === "themes") {
      aVal = a.themes[0] || "";
      bVal = b.themes[0] || "";
    } else if (key === "priority") {
      // High before Medium
      aVal = a.priority === "High" ? 0 : 1;
      bVal = b.priority === "High" ? 0 : 1;
    } else {
      aVal = a[key] || "";
      bVal = b[key] || "";
    }

    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });

  return sorted;
}

function groupByTheme(tickets) {
  const allThemes = getAllThemes();
  const groups = {};

  for (const ticket of tickets) {
    // Use first theme for grouping
    const themeId = ticket.themes[0] || "other";
    if (!groups[themeId]) {
      groups[themeId] = [];
    }
    groups[themeId].push(ticket);
  }

  // Sort groups by count descending
  return Object.entries(groups)
    .sort(([, a], [, b]) => b.length - a.length)
    .map(([themeId, tickets]) => ({
      theme: getThemeById(themeId),
      tickets,
    }));
}

function TicketRow({ ticket }) {
  return (
    <tr>
      <td>
        <a
          href={`${JIRA_BASE}${ticket.key}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ticket-key"
        >
          {ticket.key}
        </a>
      </td>
      <td>
        <span className={`priority-badge priority-${ticket.priority.toLowerCase()}`}>
          {ticket.priority}
        </span>
      </td>
      <td className="summary-cell">{ticket.summary}</td>
      <td>
        <div className="theme-tags">
          {ticket.themes.map((themeId) => {
            const theme = getThemeById(themeId);
            return (
              <span
                key={themeId}
                className="theme-tag"
                style={{
                  background: `${theme.color}18`,
                  color: theme.color,
                  borderColor: `${theme.color}40`,
                }}
              >
                {theme.label}
              </span>
            );
          })}
        </div>
      </td>
      <td className="date-cell">
        <span title={`${ageDays(ticket.created)} days ago`}>
          {formatDate(ticket.created)}
        </span>
      </td>
    </tr>
  );
}

export default function TicketTable({ tickets, activeTheme }) {
  const [sortConfig, setSortConfig] = useState({
    key: "created",
    direction: "asc",
  });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const sorted = sortTickets(tickets, sortConfig);
  const shouldGroup =
    sortConfig?.key === "themes" && activeTheme === null;

  return (
    <div className="table-container">
      <table className="ticket-table">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                className={col.sortable ? "sortable" : ""}
              >
                {col.label}
                {sortConfig?.key === col.key && (
                  <span className="sort-arrow">
                    {sortConfig.direction === "asc" ? " \u2191" : " \u2193"}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shouldGroup
            ? groupByTheme(sorted).map(({ theme, tickets: groupTickets }) => (
                <GroupRows
                  key={theme.id}
                  theme={theme}
                  tickets={groupTickets}
                />
              ))
            : sorted.map((ticket) => (
                <TicketRow key={ticket.key} ticket={ticket} />
              ))}
        </tbody>
      </table>
      {tickets.length === 0 && (
        <div className="empty-state">No tickets match the current filters.</div>
      )}
    </div>
  );
}

function GroupRows({ theme, tickets }) {
  return (
    <>
      <tr className="group-header-row">
        <td colSpan={5}>
          <span
            className="group-dot"
            style={{ background: theme.color }}
          />
          {theme.label} ({tickets.length})
        </td>
      </tr>
      {tickets.map((ticket) => (
        <TicketRow key={ticket.key} ticket={ticket} />
      ))}
    </>
  );
}

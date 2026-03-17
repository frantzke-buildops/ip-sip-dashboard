import { useState, useMemo, useCallback } from "react";
import { classifyTicket } from "./themes";
import { fetchTickets } from "./utils/fetchTickets";
import StatsRow from "./components/StatsRow";
import DonutChart from "./components/DonutChart";
import ThemeFilter from "./components/ThemeFilter";
import TicketTable from "./components/TicketTable";
import SearchBar from "./components/SearchBar";
import "./App.css";

export default function App() {
  const [rawTickets, setRawTickets] = useState([]);
  const [error, setError] = useState(null);

  // Filters
  const [activeTheme, setActiveTheme] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadTickets = useCallback(() => {
    setError(null);
    return fetchTickets()
      .then((data) => {
        const classified = data.map((t) => ({
          ...t,
          themes: classifyTicket(t.summary),
        }));
        setRawTickets(classified);
      })
      .catch((err) => setError(err.message));
  }, []);

  function handleRefresh() {
    setRefreshing(true);
    loadTickets().then(() => setRefreshing(false));
  }

  // Filtered tickets
  const filtered = useMemo(() => {
    let result = rawTickets;

    if (activeTheme) {
      result = result.filter((t) => t.themes.includes(activeTheme));
    }

    if (priorityFilter !== "all") {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.key.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          (t.assignee && t.assignee.toLowerCase().includes(q))
      );
    }

    return result;
  }, [rawTickets, activeTheme, priorityFilter, searchQuery]);

  if (refreshing) {
    return (
      <div className="loading">
        <div className="spinner" />
        Loading tickets...
      </div>
    );
  }

  return (
    <div className="app">
      {error && (
        <div className="error">
          <h2>Error loading data</h2>
          <p>{error}</p>
          <p>
            Check that JIRA_URL, ATLASSIAN_USERNAME, and ATLASSIAN_API_TOKEN are
            set in .env
          </p>
        </div>
      )}

      <header className="app-header">
        <h1>SIP Mission Control</h1>
        <span className="subtitle">
          Inventory &amp; Purchasing // Triaging Queue
        </span>
        <button
          className="refresh-btn"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      <StatsRow
        tickets={filtered}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
      />

      <div className="chart-and-filters">
        <DonutChart tickets={filtered} />
        <ThemeFilter
          tickets={rawTickets}
          activeTheme={activeTheme}
          onThemeChange={setActiveTheme}
        />
      </div>

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
      />

      <TicketTable tickets={filtered} activeTheme={activeTheme} />
    </div>
  );
}

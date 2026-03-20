import { useState, useMemo, useCallback, useEffect } from "react";
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
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("sip-theme") === "dark",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "";
    localStorage.setItem("sip-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

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

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

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
          (t.assignee && t.assignee.toLowerCase().includes(q)),
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
          Inventory &amp; Purchasing // Ready for Triage Queue
        </span>
        <button
          className="refresh-btn"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
        <button
          className="theme-toggle-btn"
          onClick={() => setDarkMode((d) => !d)}
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="8"
                cy="8"
                r="3.5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <line
                x1="8"
                y1="1"
                x2="8"
                y2="2.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="8"
                y1="13.5"
                x2="8"
                y2="15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="1"
                y1="8"
                x2="2.5"
                y2="8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="13.5"
                y1="8"
                x2="15"
                y2="8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="2.93"
                y1="2.93"
                x2="3.99"
                y2="3.99"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="12.01"
                y1="12.01"
                x2="13.07"
                y2="13.07"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="2.93"
                y1="13.07"
                x2="3.99"
                y2="12.01"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="12.01"
                y1="3.99"
                x2="13.07"
                y2="2.93"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </header>

      <StatsRow
        tickets={rawTickets}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
      />

      <div className="chart-and-filters">
        <DonutChart tickets={filtered} darkMode={darkMode} />
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

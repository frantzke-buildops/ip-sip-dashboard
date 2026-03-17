export default function StatsRow({ tickets, priorityFilter, onPriorityChange }) {
  const total = tickets.length;
  const high = tickets.filter((t) => t.priority === "High").length;
  const medium = tickets.filter((t) => t.priority === "Medium").length;

  const stats = [
    { label: "Total Tickets", value: total, className: "stat-total", filter: "all" },
    { label: "High Priority", value: high, className: "stat-high", filter: "High" },
    { label: "Medium Priority", value: medium, className: "stat-medium", filter: "Medium" },
  ];

  return (
    <div className="stats-row">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`stat-card ${s.className} clickable${priorityFilter === s.filter ? " active" : ""}`}
          onClick={() => onPriorityChange(priorityFilter === s.filter ? "all" : s.filter)}
        >
          <div className="stat-value">{s.value}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

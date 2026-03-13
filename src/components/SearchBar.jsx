export default function SearchBar({
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityChange,
}) {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search by key, summary, or assignee..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="search-input"
      />
      <select
        value={priorityFilter}
        onChange={(e) => onPriorityChange(e.target.value)}
        className="priority-select"
      >
        <option value="all">All Priorities</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
      </select>
    </div>
  );
}

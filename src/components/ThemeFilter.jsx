import { getAllThemes, getThemeById } from "../themes";

export default function ThemeFilter({
  tickets,
  activeTheme,
  onThemeChange,
}) {
  const allThemes = getAllThemes();

  // Count tickets per theme
  const themeCounts = {};
  for (const theme of allThemes) {
    themeCounts[theme.id] = 0;
  }
  for (const ticket of tickets) {
    for (const themeId of ticket.themes) {
      if (themeCounts[themeId] !== undefined) {
        themeCounts[themeId]++;
      }
    }
  }

  // Sort by count descending, but keep "other" at the end
  const sorted = allThemes
    .filter((t) => themeCounts[t.id] > 0)
    .sort((a, b) => {
      if (a.id === "other") return 1;
      if (b.id === "other") return -1;
      return themeCounts[b.id] - themeCounts[a.id];
    });

  return (
    <div className="theme-filter">
      <h3 className="section-title">Themes</h3>
      <div className="theme-buttons">
        <button
          className={`theme-btn ${activeTheme === null ? "active" : ""}`}
          onClick={() => onThemeChange(null)}
        >
          <span className="theme-dot" style={{ background: "#666" }} />
          All Themes
          <span className="theme-count">{tickets.length}</span>
        </button>
        {sorted.map((theme) => (
          <button
            key={theme.id}
            className={`theme-btn ${activeTheme === theme.id ? "active" : ""}`}
            onClick={() =>
              onThemeChange(activeTheme === theme.id ? null : theme.id)
            }
          >
            <span className="theme-dot" style={{ background: theme.color }} />
            {theme.label}
            <span className="theme-count">{themeCounts[theme.id]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

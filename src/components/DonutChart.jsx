import { useEffect, useRef } from "react";

export default function DonutChart({ tickets }) {
  const canvasRef = useRef(null);

  const high = tickets.filter((t) => t.priority === "High").length;
  const medium = tickets.filter((t) => t.priority === "Medium").length;
  const total = high + medium;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || total === 0) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const size = 220;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const outerR = 90;
    const innerR = 55;

    const slices = [
      { count: high, color: "#e74c3c", label: "High" },
      { count: medium, color: "#f39c12", label: "Medium" },
    ];

    ctx.clearRect(0, 0, size, size);

    let startAngle = -Math.PI / 2;
    for (const slice of slices) {
      if (slice.count === 0) continue;
      const sliceAngle = (slice.count / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle, endAngle);
      ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();

      // Label
      const midAngle = startAngle + sliceAngle / 2;
      const labelR = (outerR + innerR) / 2;
      const lx = cx + Math.cos(midAngle) * labelR;
      const ly = cy + Math.sin(midAngle) * labelR;

      ctx.fillStyle = "#fff";
      ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(slice.count, lx, ly);

      startAngle = endAngle;
    }

    // Center text
    ctx.fillStyle = "#333";
    ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(total, cx, cy - 8);

    ctx.fillStyle = "#888";
    ctx.font = "12px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("tickets", cx, cy + 14);
  }, [high, medium, total]);

  return (
    <div className="donut-container">
      <h3 className="section-title">Priority Breakdown</h3>
      <div className="donut-wrapper">
        <canvas ref={canvasRef} />
        <div className="donut-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ background: "#e74c3c" }} />
            High ({high})
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: "#f39c12" }} />
            Medium ({medium})
          </div>
        </div>
      </div>
    </div>
  );
}

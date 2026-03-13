export const THEMES = [
  {
    id: "receipt",
    label: "Receipt Issues",
    color: "#e74c3c",
    keywords: ["receipt", "receiving", "auto-receive"],
  },
  {
    id: "cost-pricing",
    label: "Cost & Pricing",
    color: "#e67e22",
    keywords: [
      "cost",
      "pricing",
      "price",
      "unit cost",
      "unit price",
      "markup",
      "subtotal",
      "total",
      "amount",
      "calculation",
    ],
  },
  {
    id: "bill-invoice",
    label: "Bill & Invoice",
    color: "#9b59b6",
    keywords: ["bill", "invoice", "invoic", "billing"],
  },
  {
    id: "job-costing",
    label: "Job & Project Costing",
    color: "#2ecc71",
    keywords: [
      "job report",
      "job costing",
      "project cost",
      "committed cost",
      "actual cost",
      "finance tab",
      "wip report",
      "revenue",
    ],
  },
  {
    id: "tax",
    label: "Tax & Rates",
    color: "#1abc9c",
    keywords: ["tax", "rate ", "rates ", "taxable", "sales tax", "tax rate"],
  },
  {
    id: "inventory",
    label: "Inventory & Warehouse",
    color: "#3498db",
    keywords: ["inventory", "warehouse", "stock", "quantity", "refrigerant"],
  },
  {
    id: "data-discrepancy",
    label: "Data Discrepancy",
    color: "#e91e63",
    keywords: [
      "duplicate",
      "discrepancy",
      "mismatch",
      "negative",
      "incorrect",
      "missing",
    ],
  },
  {
    id: "pdf-display",
    label: "PDF & Display",
    color: "#795548",
    keywords: [
      "pdf",
      "display",
      "showing",
      "visible",
      "cutoff",
      "cut off",
      "misalignment",
      "logo",
    ],
  },
  {
    id: "po-status",
    label: "PO Status & Fulfillment",
    color: "#ff9800",
    keywords: [
      "fulfilled",
      "partially fulfilled",
      "fulfillment",
      "po status",
      "status revert",
      "status showing",
      "status still",
    ],
  },
  {
    id: "sync",
    label: "Sync & Integration",
    color: "#607d8b",
    keywords: [
      "sync",
      "intacct",
      "quickbooks",
      "qb",
      "qbo",
      "qbd",
      "integration",
      "export",
      "accounting",
    ],
  },
  {
    id: "line-items",
    label: "PO Line Items",
    color: "#00bcd4",
    keywords: ["line item", "line items", "po line", "order line"],
  },
  {
    id: "delete-void",
    label: "Delete & Void",
    color: "#f44336",
    keywords: ["delete", "void", "remove", "deactivate"],
  },
  {
    id: "cost-codes",
    label: "Cost Codes & Attributes",
    color: "#8bc34a",
    keywords: [
      "cost code",
      "cost type",
      "cost attribute",
      "default",
      "defaulting",
    ],
  },
  {
    id: "search-filters",
    label: "Search & Filters",
    color: "#673ab7",
    keywords: ["search", "filter", "keyword", "loading", "drag and drop"],
  },
  {
    id: "api-errors",
    label: "API & Technical Errors",
    color: "#455a64",
    keywords: [
      "api",
      "error 500",
      "internal server error",
      "timeout",
      "react",
      "error 500",
    ],
  },
  {
    id: "vendor",
    label: "Vendor Issues",
    color: "#cddc39",
    keywords: ["vendor"],
  },
];

/**
 * Classify a ticket by matching summary keywords against theme definitions.
 * Returns array of matching theme IDs.
 */
export function classifyTicket(summary) {
  const lower = summary.toLowerCase();
  const matched = [];

  for (const theme of THEMES) {
    if (theme.keywords.some((kw) => lower.includes(kw))) {
      matched.push(theme.id);
    }
  }

  // If no themes matched, tag as "other"
  if (matched.length === 0) {
    matched.push("other");
  }

  return matched;
}

// Fallback theme for unclassified tickets
export const OTHER_THEME = {
  id: "other",
  label: "PO Management (Other)",
  color: "#9e9e9e",
  keywords: [],
};

/**
 * Get all themes including the "other" fallback.
 */
export function getAllThemes() {
  return [...THEMES, OTHER_THEME];
}

/**
 * Get a theme by ID (including "other").
 */
export function getThemeById(id) {
  if (id === "other") return OTHER_THEME;
  return THEMES.find((t) => t.id === id) || OTHER_THEME;
}

/* ─────────────────────────────────────────────────────────────
   ExportMenuItem.jsx
   Reusable menu item for the export dropdown.
───────────────────────────────────────────────────────────── */

const ExportMenuItem = ({
  icon,
  label,
  hint,
  hovered,
  disabled,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) => (
  <button
    type="button"
    className={[
      "export-item",
      hovered  ? "export-item--hovered"  : "",
      disabled ? "export-item--disabled" : "",
    ].join(" ").trim()}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    onClick={onClick}
    disabled={disabled}
  >
    <span className="export-item__icon">{icon}</span>
    <span className="export-item__text">
      <span className="export-item__label">{label}</span>
      <span className="export-item__hint">{hint}</span>
    </span>
  </button>
);

export default ExportMenuItem;
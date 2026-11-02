/* ─────────────────────────────────────────────────────────────
   exportToast.js
   Lightweight toast notification utility for export feedback.
   No external dependencies.
───────────────────────────────────────────────────────────── */

const COLORS = {
  success: "#185FA5",
  error:   "#B91C1C",
  info:    "#374151",
};

const ICONS = {
  success: "✓",
  error:   "✕",
  info:    "ℹ",
};

const DURATIONS = {
  success: 3000,
  error:   5000,
  info:    8000,
};

/**
 * Displays a toast notification at the top-right of the screen.
 * Any existing toast is removed before showing a new one.
 *
 * @param {string} message - Text to display
 * @param {'success'|'error'|'info'} type - Visual variant
 */
export const showToast = (message, type = "success") => {
  // Remove any existing toast before showing a new one
  document.querySelector(".export-toast")?.remove();

  const toast = document.createElement("div");
  toast.className = "export-toast";
  toast.innerHTML = `
    <span style="font-size:15px;line-height:1">${ICONS[type] ?? ICONS.info}</span>
    <span>${message}</span>
  `;

  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    background: ${COLORS[type] ?? COLORS.info};
    color: white;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-weight: 500;
    z-index: 100001;
    max-width: 320px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.18);
    opacity: 0;
    transform: translateY(-8px);
    transition: opacity 0.22s ease, transform 0.22s ease;
  `;

  document.body.appendChild(toast);

  // Trigger enter animation on next frame
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  // Trigger exit animation then remove from DOM
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-8px)";
    setTimeout(() => toast.remove(), 300);
  }, DURATIONS[type] ?? DURATIONS.info);
};
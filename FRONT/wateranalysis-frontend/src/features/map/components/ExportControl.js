/* ─────────────────────────────────────────────────────────────
   ExportControl.jsx
   Map export dropdown control (PNG screenshot + GeoJSON).
   Positioned absolute within the map wrapper (bottom-right).
───────────────────────────────────────────────────────────── */

import { useState, useRef, useEffect } from "react";

import { exportMap }    from "../../../services/exportService";
import { showToast }    from "../../../components/export/exportToast.js";
import ExportMenuItem   from "../../../components/export/ExportMenuitem.js";

import "../../../styles/ExportControl.css";

/* ─── Icons ─────────────────────────────────────────────────── */
const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2v8M5 7l3 3 3-3" />
    <rect x="3" y="12.5" width="10" height="1.2" rx="0.6" fill="currentColor" stroke="none" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg
    width="11" height="11" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
    style={{
      transition: "transform 0.22s cubic-bezier(.4,0,.2,1)",
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
      opacity: 0.5,
    }}
  >
    <path d="M4 6l4 4 4-4" />
  </svg>
);

const PngIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="12" height="12" rx="2.5" />
    <circle cx="5.5" cy="6" r="1.2" fill="currentColor" stroke="none" />
    <path d="M2 11l3.5-3.5 2.5 2.5 2-2 3 3" />
  </svg>
);

const GeoJsonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="5.5" />
    <path d="M2.5 8h11M8 2.5c-1.8 1.8-1.8 7.2 0 11M8 2.5c1.8 1.8 1.8 7.2 0 11" />
  </svg>
);

/* ─── Helpers ────────────────────────────────────────────────── */

/** Returns true if at least one active layer has vector features. */
const hasVisibleVectorLayer = (activeLayers, layers) => {
  if (!Array.isArray(activeLayers) || !activeLayers.length) return false;
  return activeLayers.some((layer) => {
    const key  = layer.layerKey || layer;
    const data = layer.data || layers?.[key];
    return Array.isArray(data?.features) && data.features.length > 0;
  });
};

/** Returns a date-stamped filename string. */
const timestampedFilename = (prefix) =>
  `${prefix}_${new Date().toISOString().split("T")[0]}`;

/* ─── Component ─────────────────────────────────────────────── */

/**
 * @param {React.RefObject} mapContainerRef - Ref to the map wrapper div
 * @param {Array}           activeLayers    - Currently active layer descriptors
 * @param {Object}          layers          - All layer data keyed by layer name
 */
const ExportControl = ({ mapContainerRef, activeLayers, layers }) => {
  const [isOpen,      setIsOpen]      = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [btnPressed,  setBtnPressed]  = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const menuRef = useRef(null);
  const btnRef  = useRef(null);

  // Resolve the exact DOM element to capture / pass to GeoJSON export
  const wrapper         = mapContainerRef?.current;
  const targetContainer = document.getElementById("map-capture-zone");

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        btnRef.current  && !btnRef.current.contains(e.target)
      ) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  /* ── Export handlers ────────────────────────────────────────── */

  const handleExportPNG = async () => {
    setIsOpen(false);

    if (!targetContainer) {
      showToast("Map container not found.", "error");
      return;
    }
    if (!navigator.mediaDevices?.getDisplayMedia) {
      showToast("Screenshot not supported. Use Chrome 94+ or Edge 94+.", "error");
      return;
    }

    setIsCapturing(true);
    showToast("Select the current tab in the window that opens…", "info");

    try {
      await exportMap(
        "screenshot",
        targetContainer,
        activeLayers,
        layers,
        timestampedFilename("Map_Export_WNA")
      );
      showToast("Exportation PNG réussie !", "success");
    } catch (err) {
      console.error("[ExportControl] PNG export error:", err);
      showToast(`Error: ${err.message}`, "error");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleExportGeoJSON = () => {
    setIsOpen(false);

    if (!hasVisibleVectorLayer(activeLayers, layers)) {
      showToast("Aucune couche active sélectionnée.", "error");
      return;
    }

    try {
      exportMap(
        "geojson",
        targetContainer,
        activeLayers,
        layers,
        timestampedFilename("Layer_Export_WNA")
      );
      showToast("Exportation GeoJSON réussie !", "success");
    } catch (err) {
      console.error("[ExportControl] GeoJSON export error:", err);
      showToast(err.message, "error");
    }
  };

  // Do not render until the map wrapper is mounted
  if (!wrapper) return null;

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="export-root" onClick={(e) => e.stopPropagation()}>

      {/* Dropdown — opens above the trigger button */}
      <div
        ref={menuRef}
        className={`export-menu${isOpen ? " export-menu--open" : ""}`}
        aria-hidden={!isOpen}
      >
        <div className="export-menu-inner">
          <ExportMenuItem
            icon={<PngIcon />}
            label="PNG Image"
            hint="Native screenshot"
            hovered={hoveredItem === "png" && !isCapturing}
            disabled={isCapturing}
            onMouseEnter={() => setHoveredItem("png")}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={handleExportPNG}
          />
          <div className="export-divider" />
          <ExportMenuItem
            icon={<GeoJsonIcon />}
            label="GeoJSON"
            hint="Vector layers"
            hovered={hoveredItem === "geo"}
            onMouseEnter={() => setHoveredItem("geo")}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={handleExportGeoJSON}
          />
        </div>
      </div>

      {/* Trigger button */}
      <button
        ref={btnRef}
        className={[
          "export-btn",
          isOpen      ? "export-btn--open"      : "",
          btnPressed  ? "export-btn--pressed"   : "",
          isCapturing ? "export-btn--capturing" : "",
        ].join(" ").trim()}
        onClick={toggleMenu}
        onMouseDown={() => setBtnPressed(true)}
        onMouseUp={() => setBtnPressed(false)}
        onMouseLeave={() => setBtnPressed(false)}
        aria-label="Export map"
        aria-expanded={isOpen}
        disabled={isCapturing}
      >
        <span className="export-btn__icon">
          {isCapturing
            ? <span className="export-spinner" aria-hidden="true" />
            : <DownloadIcon />
          }
        </span>
        <span className="export-btn__label">
          {isCapturing ? "Capturing…" : "Export"}
        </span>
        {!isCapturing && (
          <span className="export-btn__chevron">
            <ChevronIcon open={isOpen} />
          </span>
        )}
      </button>

    </div>
  );
};

export default ExportControl;
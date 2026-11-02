# WaterNetworkWebMapping — Frontend

Vue d'ensemble
-------------
Application frontend React + Leaflet pour visualiser, analyser et exporter des données des réseaux d'eau à Madagascar. Fournit contrôle des calques GeoJSON, heatmaps, outils de dessin, dashboard analytique et export (CSV / GeoJSON).

Principales fonctionnalités
---------------------------
- Carte interactive (Leaflet / react-leaflet) : basemaps, zoom, centrage.
- Multi-calques GeoJSON : conduites, réservoirs, stations, limites administratives.
- Heatmaps et graphiques temporels (D3 / Recharts).
- Outils de sélection et dessin (Leaflet-Draw).
- Lazy-load, pagination/tiling et mise en cache côté client pour les gros jeux de données.
- Sidebar dynamique, modales (date-picker) et export GeoJSON/CSV.
- Tests : Jest + React Testing Library. Linting : ESLint + Prettier.

Prérequis
---------
- Node.js >= 16, npm ou yarn
- (Optionnel) Backend API disponible (par défaut attendu sur http://localhost:8000)

Installation & démarrage
------------------------
```bash
cd frontend
npm install
# développement
npm start        # http://localhost:3000
# tests
npm test
# build production
npm run build
# lint
npm run lint
```

Variables d'environnement
-------------------------
Fichier recommandé : .env.local (à la racine de /frontend)
Exemples :
```
REACT_APP_API_URL=http://localhost:8000
```

Structure principale
--------------------
- public/
  - geoJson/ — jeux de données GeoJSON (déposer ici pour chargement direct)
  - index.html
- src/
  - App.js — point d'entrée
  - features/map/MapView.js — logique Leaflet
  - services/geoJSONService.js — loaders / fetchers GeoJSON
  - services/api.js — appels REST (Axios)
  - hooks/ — useMapLayers, useMapStyles, etc.
  - components/ — LayerController, Sidebar, modals, boutons

API (endpoints fréquents)
-------------------------
- GET  /api/heatmap/consumption?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
- POST /api/zones/consumption  — { zones: [...], dateDeb, dateFin, type }

Résumé
------
Ce frontend est conçu pour être modulaire et extensible : centraliser les styles dans les hooks, charger les données depuis public/geoJson ou API, et couvrir toute nouvelle UI par des tests.
# FEATURE — WaterNetworkWebMapping (Frontend)

## But
Application cartographique interactive pour visualiser, analyser et exporter des données des réseaux d'eau à Madagascar.

## Public cible
- Opérateurs terrain
- Ingénieurs réseau
- Analystes et planificateurs
- Gestionnaires de données géospatiales

## Principales fonctionnalités
1. Carte interactive
   - Basemap (tuiles raster) et contrôles de navigation (zoom, centrage).
   - Multi-calques GeoJSON (conduites, réservoirs, stations, zones administratives).
   - Heatmaps pour indicateurs (consommation, incidents).

2. Gestion des calques
   - Activation/désactivation par couche.
   - Lazy-load des calques volumineux et découpage par région.
   - Styles configurables (couleurs, épaisseur, opacité).
   - Légende dynamique et filtre par attribut.

3. Interaction et sélection
   - Clic pour afficher fiche entité (propriétés).
   - Sélection multiple et export GeoJSON.
   - Outils de dessin (polygone / rectangle) pour analyses locales.
   - Sélection temporelle via modale/date-picker.

4. Tableaux et visualisations
   - Dashboard synthétique (longueur totale, nombre réservoirs actifs, débit).
   - Graphiques temporels (D3 / Recharts) intégrés dans la sidebar.
   - Export CSV / GeoJSON des jeux filtrés.

5. Intégration API
   - Chargement dynamique depuis API (Axios).
   - Endpoint configurable en environnement (.env).
   - Webhooks / polling pour mises à jour temps réel (optionnel).

6. Performance & fiabilité
   - Pagination / tiling pour GeoJSON volumineux.
   - Mise en cache côté client (sessionStorage / indexedDB).
   - Gestion d'erreurs et messages utilisateur (toast).

7. Accessibilité & UI
   - Sidebar rétractable, contrôles clavier, focus visible.
   - Thème clair/sombre (option).
   - UI responsive mobile/tablette/desktop.

8. Tests et qualité
   - Tests unitaires et d'intégration : Jest + React Testing Library.
   - Linting : ESLint + Prettier.
   - CI (pipeline) : tests + build + lint.

## Flux de données (résumé)
- Sources : public/geoJson/, API backend (ex: http://localhost:8000), fichiers statiques.
- Services : src/services/geoJSONService.js pour loaders, src/services/api.js pour appels REST.
- Hooks : useMapLayers, useMapStyles pour orchestrer chargement & styles.
- Composants : MapView (Leaflet), LayerControl, Sidebar, Modals.

## Architecture (composer)
- React (component-driven)
- Leaflet / react-leaflet
- Turf.js pour opérations spatiales
- D3 / Recharts pour graphiques
- Tailwind / CSS modules pour styles

## Cas d'utilisation (scénarios rapides)
- Filtrer conduites par année d'installation et exporter le GeoJSON.
- Générer heatmap de consommation et isoler zones à haute demande.
- Dessiner zone d'intervention et calculer longueur totale des conduites dans la zone.

## Bonnes pratiques pour contributeurs
- Ajouter GeoJSON → déposer dans public/geoJson/ + enregistrer loader dans geoJSONService.
- Styles centralisés dans useMapStyles.
- Nouveaux composants UI couvrir par tests (jest).
- Variables d'environnement dans .env.local (REACT_APP_API_URL).

## Déploiement local
1. cd frontend
2. npm install
3. npm start (http://localhost:3000)
4. Pour build : npm run build

## Roadmap (sujets prioritaires)
- Authentification + rôles (lecture/édition).
- Analyse spatiale avancée (routing, vulnérabilité).
- Editeur d'attributs et versioning GeoJSON.
- Support tuiles vectorielles (Mapbox GL / Tippecanoe).

## Fichiers clés
- src/App.js — point d'entrée
- src/features/map/MapView.js — logique Leaflet
- src/services/geoJSONService.js — loaders GeoJSON
- src/hooks/useMapLayers.js, src/hooks/useMapStyles.js
- src/components/LayerController/*, src/components/modal/*

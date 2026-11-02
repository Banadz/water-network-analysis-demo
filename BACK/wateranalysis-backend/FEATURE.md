# Spécification de fonctionnalité — Backend MadaAtlas

Version : 1.0

Résumé
-------
Ce document décrit les fonctionnalités principales, les exigences fonctionnelles et non-fonctionnelles, les cas d'utilisation et les critères d'acceptation pour le backend MadaAtlas — une API Spring Boot qui gère les données spatiales liées au captage, traitement, distribution et consommation d'eau.

But
----
Fournir une API REST sécurisée et performante permettant :
- l'ingestion et la consultation des données d'eau (captage, eau traitée, eau distribuée),
- l'exécution de requêtes spatiales (polygones/GeoJSON) pour agréger la consommation et la production par zone,
- la livraison de sorties prêtes pour cartographie (GeoJSON),
- la documentation OpenAPI/Swagger pour faciliter l'intégration frontend.

Acteurs
--------
- Utilisateur interne (analyste) : exécute requêtes analytiques et exporte résultats
- Frontend cartographique : requêtes pour affichage GeoJSON
- Administrateur système : déploie et configure la base de données

Principales fonctionnalités
---------------------------
1. Requêtes de consommation par zone
   - Endpoint GET/POST permettant d'obtenir la consommation totale et moyenne par zone.
   - Filtrage par période (date début/fin).

2. Requêtes d'eau distribuée et eau traitée par zone
   - Endpoints POST acceptant une liste de zones (polygones GeoJSON ou coordonnées), plages de dates et quantités minimales.
   - Retourne des DTO agrégés (sommes, moyennes, nombre d'enregistrements) et/ou listes d'enregistrements détaillés.

3. GeoJSON pour couches cartographiques
   - Endpoints GET retournant FeatureCollection pour les entités géographiques (canalisations, stations, captages).

4. Documentation automatique (OpenAPI/Swagger)
   - Génération via springdoc; UI accessible pour tester les endpoints.

5. Gestion d'erreurs et validations
   - Validation des DTO d'entrée (dates, géométries, quantités).
   - Gestion centralisée des exceptions renvoyant des erreurs HTTP standardisées.

Exigences fonctionnelles (détaillées)
------------------------------------
FR-01 : Récupérer consommation par zone
- Entrée : identifiant de zone OU polygone GeoJSON, dateDebut, dateFin
- Sortie : { zoneId, periode, sommeConsommation, moyenneConsommation, count }

FR-02 : Requête agrégée eau distribuée
- Entrée : liste de QueryRequestDTO = [{ zoneId, coordinates (polygone), dateDebut, dateFin, quantiteMin }]
- Sortie : Liste d'EauDistribueDTO (ou agrégation par zone)

FR-03 : Requête agrégée eau traitée
- Même structure que FR-02 mais pour la production d'eau traitée (EauTraite)

FR-04 : Export GeoJSON
- Entrée : filtres optionnels (zone, date)
- Sortie : GeoJSON FeatureCollection

FR-05 : Documentation API
- OpenAPI JSON et Swagger UI exposés automatiquement

Exigences non-fonctionnelles
---------------------------
NFR-01 : Scalabilité
- Le backend doit supporter des requêtes d'agrégation sur de grands jeux de données en utilisant des indexes PostGIS et des requêtes paginées si nécessaire.

NFR-02 : Sécurité
- CORS configuré pour les domaines frontaux autorisés.
- Prévoir authentification (JWT/OAuth) comme amélioration future.

NFR-03 : Robustesse
- Validation des entrées et gestion centralisée des erreurs.

Modèle de données (résumé)
--------------------------
- Captage : localisation, capacité; entité géographique
- Commune : entité administrative (nom, géométrie)
- StationTraitement : localisation, capacité, paramètres
- EauDistribue : date, quantité, zone/point source, geometry
- EauTraite : date, quantité, station, geometry

DTOs importants
----------------
- QueryRequestDTO { zoneId, coordinates (liste de listes de points), dateDebut, dateFin, quantiteMin }
- EauDistribueDTO { id, date, quantite, geometry, source }
- EauTraiteDTO { id, date, quantite, stationId }
- ComparaisonDTO { zoneA, zoneB, periode, metric, valueA, valueB }

Endpoints (proposition et mapping probable)
------------------------------------------
- GET  /api/consumption/zone
- POST /api/eaudistribue/zone/query
- POST /api/eautraite/zone/query
- GET  /api/canalisations/geojson

Exemples de requêtes
--------------------
POST /api/eaudistribue/zone/query
Request body :
```
[
  {
    "zoneId": "zoneA",
    "coordinates": [ [[1.0,1.0],[2.0,1.0],[2.0,2.0],[1.0,2.0],[1.0,1.0]] ],
    "dateDebut": "2023-01-01",
    "dateFin": "2023-01-31",
    "quantiteMin": 100.5
  }
]
```

Critères d'acceptation
-----------------------
- CA-01 : Pour une zone et une période données, l'endpoint retourne la somme correcte (comparée à un jeu d'exemple connu).
- CA-02 : Les requêtes malformées retournent 4xx avec message d'erreur clair.
- CA-03 : Les endpoints GeoJSON renvoient un FeatureCollection valide.

Cas limites et remarques
------------------------
- Zones imbriquées ou chevauchantes : définir règle (fusion/partition) — par défaut, agréger par zone fournie.
- Dates manquantes : appliquer comportement par défaut (ex. dernier mois) ou renvoyer 400.
- Quantités négatives : invalider la requête.

Sécurité & conformité
---------------------
- Prévoir d'ajouter un middleware d'authentification (JWT) avant exposition publique.
- Protéger les endpoints d'administration et de modification des données.

Performance et optimisation
--------------------------
- Indexer les colonnes géométriques (GIST) et les colonnes temporelles.
- Prévoir pagination pour les endpoints qui retournent des listes détaillées.

Déploiement
-----------
- Conteneuriser l'application (Dockerfile) et déployer avec orchestrateur (Kubernetes) si nécessaire.
- Variables d'environnement pour configuration DB et profiles Spring.

Roadmap / Améliorations futures
-------------------------------
- Authentification & rôle (admin / analyst)
- Endpoints d'ingestion par lot (bulk import CSV/GeoJSON)
- Dashboards d'agrégations pré-calculées (caching)

Annexes
-------
- Se référer aux DTO et contrôleurs existants sous `src/main/java/com/example/backend` pour les noms exacts et le mapping.

---

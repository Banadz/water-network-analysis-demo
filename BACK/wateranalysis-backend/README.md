# MadaAtlas — Backend de Gestion et d'Analyse des Réseaux d'Eau

Résumé
-------
Ce projet est le backend d'une plateforme d'analyse et de cartographie des réseaux d'eau (captage, traitement, distribution, consommation). Il est développé en Java avec Spring Boot et expose des API REST pour consulter et filtrer des données spatiales et temporelles. La persistance utilise PostgreSQL avec l'extension PostGIS pour stocker et interroger des géométries.

Tech stack
----------
- Java 17, Spring Boot
- Build : Gradle
- Base de données : PostgreSQL + PostGIS
- Persistance : Spring Data JPA / Hibernate (+ hibernate-spatial)
- Geo : LocationTech JTS
- Docs API : springdoc / Swagger UI

Fichiers importants
--------------------
- `build.gradle` — configuration Gradle et dépendances
- `src/main/java/com/example/backend/` — code source (controllers, services, repository, dto, config)
- `src/main/resources/application.properties` — configuration (DB, ports, profils)

Prérequis
---------
- JDK 17+
- Docker (optionnel, pour Postgres/PostGIS) ou PostgreSQL + PostGIS installé localement
- Gradle wrapper (fourni : `./gradlew`)

Quick start (local)
-------------------
1. Cloner le dépôt et aller dans le dossier `backend` :

```bash
git clone <url_du_dépôt>
cd backend
```

2. Lancer une base PostgreSQL/PostGIS (ex. via Docker) :

```bash
docker run --name pg-postgis -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=waterdb -p 5432:5432 -d postgis/postgis
```

3. Configurer la connexion dans `src/main/resources/application.properties` (ou via variables d'environnement) :

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/waterdb
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.spatial.dialect.postgis.PostgisDialect
```

4. Construire et lancer l'application :

```bash
./gradlew clean build -x test
java -jar build/libs/backend-0.0.1-SNAPSHOT.jar
```

L'application démarre par défaut sur le port 8080.

Documentation API
-----------------
La documentation OpenAPI est exposée automatiquement (springdoc). Une fois l'application démarrée :

- Swagger UI : http://localhost:8080/swagger-ui.html
- OpenAPI JSON : http://localhost:8080/v3/api-docs

Endpoints (extraits)
--------------------
- `GET  /api/consumption/zone` — consommation agrégée par zone
- `POST /api/eaudistribue/zone/query` — requêtes filtrées d'eau distribuée (liste de zones, dates, quantités)
- `POST /api/eautraite/zone/query` — requêtes filtrées d'eau traitée
- `GET  /api/canalisations/geojson` — GeoJSON des canalisations

Structure du projet
-------------------
`com.example.backend`
- `config` — `SwaggerConfig`, `WebConfig` (CORS, web) 
- `domain.model` — entités JPA : `Captage`, `Commune`, `EauDistribue`, `EauTraite`, `StationTraitement`, etc.
- `domain.repository` — repositories et implémentations personnalisées
- `dto` — objets de transfert (`QueryRequestDTO`, `EauDistribueDTO`, `EauTraiteDTO`, `ComparaisonDTO`, ...)
- `presentation.controller` — contrôleurs REST (`ConsommationController`, etc.)
- `handler` — `GlobalExceptionHandler`

Développement & Tests
---------------------
- Lancer les tests : `./gradlew test`
- Exécuter en mode développement (avec rechargement) : `./gradlew bootRun`

Bonnes pratiques
----------------
- Utiliser des variables d'environnement ou un `application-{profile}.properties` pour les secrets
- Vérifier la configuration PostGIS et le dialecte Hibernate
- Documenter les nouveaux endpoints via les annotations OpenAPI

---
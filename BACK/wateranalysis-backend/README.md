# MadaAtlas Backend

The backend provides REST APIs for mapping and analysing water infrastructure data, including water sources, treatment, distribution, and consumption. It is built with Java and Spring Boot and uses PostgreSQL/PostGIS for persistence and spatial queries.

## Technology Stack

- Java 17 and Spring Boot 3
- Gradle Wrapper
- PostgreSQL with PostGIS
- Spring Data JPA, Hibernate Spatial, and LocationTech JTS
- springdoc OpenAPI and Swagger UI

## Requirements

- JDK 17 or newer for local development
- PostgreSQL with PostGIS, or Docker for a database container
- The included Gradle Wrapper (`./gradlew`)

The repository-root `compose.yaml` can build and start the database, backend, and frontend together. See the root [README](../../README.md) for the recommended setup.

## Local Development

1. Start a PostgreSQL/PostGIS database and configure the connection in `src/main/resources/application.properties` or through Spring datasource environment variables.
2. From this directory, build and run the backend:

	```bash
	./gradlew test
	./gradlew bootRun
	```

	On Windows PowerShell, use `gradlew.bat` instead of `./gradlew`.

The application listens on port `8080` by default.

## API Documentation

Once the backend is running:

- Swagger UI: <http://localhost:8080/swagger-ui.html>
- OpenAPI JSON: <http://localhost:8080/api-docs>

Examples of API routes include:

- `GET /api/consumption/zone` for zone-level consumption
- `POST /api/eaudistribue/zone/query` for filtered distributed-water queries
- `POST /api/eautraite/zone/query` for filtered treated-water queries
- `GET /api/canalisations/geojson` for pipeline GeoJSON

## Source Layout

The main Java package is `com.example.backend`:

- `config` contains web, CORS, and API documentation configuration.
- `domain.model` contains JPA entities such as `Captage`, `Commune`, `EauDistribue`, and `EauTraite`.
- `domain.repository` contains data repositories and custom implementations.
- `dto` contains API request and response types.
- `presentation.controller` contains REST controllers.
- `handler` contains global exception handling.

## Configuration Notes

- Keep database credentials and other secrets in environment variables or an untracked local configuration file.
- Ensure the database has the PostGIS extension available when spatial features are used.
- Document new endpoints with OpenAPI annotations.

---
# Water Network Analysis (WNA)

Water Network Analysis is a web platform for mapping and analysing drinking-water infrastructure and related spatial data. The project includes a React/Leaflet frontend and a Spring Boot REST API backed by PostgreSQL/PostGIS.

## Features

- Explore administrative areas and water-network GeoJSON layers on an interactive map.
- Import GeoJSON layers and export visible map layers or screenshots.
- Request and visualise production, consumption, and heatmap data through the API.
- Build charts for selected zones and export chart data.

## Demo Video

Video link: `https://drive.google.com/file/d/1MYhkEYFRbh_aQR5WkX7ACcNOz5s-Ud_W/view?usp=drive_link`

## Requirements

For the recommended container-based setup:

- Docker Desktop on Windows/macOS, or Docker Engine and the Docker Compose v2 plugin on Linux.
- On Windows, run the script from Git Bash or WSL with Docker Desktop running.
- Git to clone the repository.

Node.js, Java, Gradle, and PostgreSQL do not need to be installed on the host for the Docker workflow. Docker downloads the required base images and builds the application images.

## Quick Start

1. Clone the repository and enter its root directory:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Start Docker Desktop (Windows/macOS) or the Docker service (Linux).

3. Run the launcher from the repository root:

   ```bash
   bash ./start.sh
   ```

   On first run, the script creates `.env` from `.env.example`, builds the frontend and backend images, downloads the required images and dependencies, then starts PostgreSQL/PostGIS, the API, and the frontend. Review `.env` before running the stack on a network or using it for anything other than local development.

4. Open the application:

   - Frontend: <http://localhost:3000>
   - Backend Swagger UI: <http://localhost:8080/swagger-ui.html>
   - Backend OpenAPI document: <http://localhost:8080/api-docs>

The local database starts empty. The repository includes map layers under `FRONT/wateranalysis-frontend/public/geoJson`, but it does not include a database dump or the legacy schema required by consumption and heatmap queries (`quartier`, `point_de_distribution`, and `noeud_consommation`). Those API views require the compatible schema and records to be supplied separately; the Compose stack does not import production data.

Prediction routes also require a separate Python prediction API, which is not included in this repository. Set `PYTHON_API_URL` in `.env` to the root URL of that service (for example, `http://host.docker.internal:8000` when it runs on the host). Prediction requests will not work until that service is running.

## Configuration

Edit `.env` in the repository root before starting the stack. `.env` is ignored by Git; `.env.example` is the tracked template.

- `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` configure the local database.
- `FRONTEND_PORT` and `BACKEND_PORT` change the host ports if 3000 or 8080 are already in use.
- `REACT_APP_API_URL` is compiled into the frontend image and should be a URL reachable by the user's browser, including the `/api` path.
- `REACT_APP_MAPBOX_TOKEN` is optional.

For example, if the backend port is changed to `8081`, also change `REACT_APP_API_URL` to `http://localhost:8081/api`, then rebuild and restart:

```bash
docker compose up --build -d
```

The default database credentials are for local development only. Do not expose the database or use these values in a production deployment.

## Managing the Stack

Run these commands from the repository root:

```bash
# View service status
docker compose ps

# Follow all service logs
docker compose logs -f

# Stop services; keep database data
docker compose down

# Stop services and permanently delete the database volume
docker compose down --volumes
```

Database files persist in the `postgres_data` Docker volume across normal stops and restarts. The final command permanently deletes that data.

## Run Without Docker

The Docker workflow is recommended. For local development without containers, install Java 17+, Node.js 18+, and PostgreSQL with PostGIS, then:

1. Configure the database connection in `BACK/wateranalysis-backend/src/main/resources/application.properties` or provide the matching Spring datasource environment variables.
2. Start the API from `BACK/wateranalysis-backend`:

   ```bash
   ./gradlew bootRun
   ```

   On Windows PowerShell, use `gradlew.bat bootRun`.

3. Set `REACT_APP_API_URL=http://localhost:8080/api` in the frontend environment and start the frontend from `FRONT/wateranalysis-frontend`:

   ```bash
   npm install
   npm start
   ```

The development frontend runs at <http://localhost:3000>. API documentation is available at <http://localhost:8080/swagger-ui.html>.

## Project Structure

```text
BACK/wateranalysis-backend/       Spring Boot API and Gradle wrapper
FRONT/wateranalysis-frontend/     React application, map layers, and Dockerfile
compose.yaml                      Local PostgreSQL/PostGIS, API, and frontend stack
start.sh                          Bash launcher for the Docker setup
.env.example                      Local environment template
```

See [the backend README](BACK/wateranalysis-backend/README.md) for backend-specific details and API examples. See [the frontend server configuration guide](FRONT/wateranalysis-frontend/CONFIG_SERVER.md) for the existing GitHub-to-server deployment notes.

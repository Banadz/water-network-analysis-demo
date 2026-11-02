# --- Étape 1 : Build de l'application ---
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

# Copier les fichiers de configuration Gradle pour mettre en cache les dépendances
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Normaliser les fins de ligne Windows puis rendre le wrapper exécutable
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew

# Télécharger les dépendances (sans builder le projet pour optimiser le cache Docker)
RUN ./gradlew dependencies --no-daemon

# Copier le code source
COPY src src

# Build du jar (on ignore les tests pour accélérer le déploiement CI/CD)
RUN ./gradlew clean build -x test --no-daemon

# --- Étape 2 : Image d'exécution (Runtime) ---
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copier le JAR généré depuis l'étape précédente
# Note : Adaptez le nom du JAR si votre projet ne s'appelle pas "backend-0.0.1-SNAPSHOT"
COPY --from=build /app/build/libs/*-SNAPSHOT.jar app.jar

# Port exposé par défaut pour Spring Boot
EXPOSE 8080

# Optimisations JVM pour les environnements conteneurisés
ENTRYPOINT ["java", "-jar", "-Djava.security.egd=file:/dev/./urandom", "app.jar"]
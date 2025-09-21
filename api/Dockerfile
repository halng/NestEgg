# ---- Build Stage ----
FROM eclipse-temurin:24-jdk-alpine AS build
WORKDIR /app

# Copy Gradle wrapper & config first
COPY gradlew gradlew.bat build.gradle settings.gradle ./
COPY gradle gradle

# Pre-fetch dependencies (layer caching)
RUN ./gradlew dependencies --no-daemon || return 0

# Copy source code and build
COPY . .
RUN ./gradlew clean bootJar -x test --no-daemon

# ---- Runtime Stage ----
FROM eclipse-temurin:24-jre-alpine
WORKDIR /app

# Copy only the built JAR
COPY --from=build /app/build/libs/*.jar app.jar

# Run with dev profile
ENTRYPOINT ["java","-Dspring.profiles.active=dev","-jar","app.jar"]
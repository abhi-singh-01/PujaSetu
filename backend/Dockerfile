FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -DskipTests clean package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/pujasetu-backend-1.0.0.jar app.jar
EXPOSE 5000
ENV PORT=5000
ENTRYPOINT ["java", "-jar", "app.jar"]

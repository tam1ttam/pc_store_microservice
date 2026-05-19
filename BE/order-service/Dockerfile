FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache curl
COPY target/*.jar app.jar
ENTRYPOINT ["sh", "-c", "exec java ${JAVA_OPTS} -jar /app.jar"]

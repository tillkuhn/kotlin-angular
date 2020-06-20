# https://docs.docker.com/engine/reference/builder/#understand-how-arg-and-from-interact
# default can be overwritten by --build-arg
ARG FROM_TAG=11-jre-slim
FROM openjdk:$FROM_TAG
# should be passed in from git describe --abbrev=0
ARG LATEST_REPO_TAG=latest
# https://vsupalov.com/docker-build-time-env-values/ so we can use at runtime
ENV VERSION=$LATEST_REPO_TAG
#ENV JAVA_OPTS ""
VOLUME /tmp
EXPOSE 8080
COPY ./build/libs/app.jar /app.jar
## what about heap ? https://medium.com/faun/docker-sizing-java-application-326d39992592
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","/app.jar"]

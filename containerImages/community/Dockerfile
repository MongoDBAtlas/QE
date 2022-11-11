ARG HOST_ARCH
FROM ${HOST_ARCH}/ubuntu:bionic

COPY mongodb.conf /home/root/

ARG DB_PATH
RUN sed -i "s _DB_PATH_ ${DB_PATH} g" /home/root/mongodb.conf && \
    apt update -y && apt install -y wget gnupg && \
    apt install --reinstall tzdata && \
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add - && \
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list && \
    apt update -y && \
    apt install -y mongodb-org
ARG HOST_ARCH
FROM ${HOST_ARCH}/ubuntu:bionic

COPY mongodb.conf /root/

RUN apt update -y && apt install -y wget gnupg && \
    apt install --reinstall tzdata && \
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add - && \
    echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.com/apt/ubuntu bionic/mongodb-enterprise/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-enterprise.list && \
    apt update -y && \
    apt install -y mongodb-enterprise
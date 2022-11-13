ARG HOST_ARCH
FROM ${HOST_ARCH}/ubuntu:bionic

COPY node1.conf node2.conf node3.conf rs_launch.js /home/root/

ARG DB_PATH
RUN sed -i "s _DB_PATH_ ${DB_PATH} g" /home/root/node1.conf && \
    sed -i "s _DB_PATH_ ${DB_PATH} g" /home/root/node2.conf && \
    sed -i "s _DB_PATH_ ${DB_PATH} g" /home/root/node3.conf && \
    bash -c "mkdir -p ${DB_PATH}/{node1,node2,node3}" && \
    apt update -y && apt install -y wget gnupg && \
    apt install --reinstall tzdata && \
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add - && \
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list && \
    apt update -y && \
    apt install -y mongodb-org

ENTRYPOINT [ "/bin/bash", "-c", "\
        su root && cd /home/root && \
        echo -e 'never' > /sys/kernel/mm/transparent_hugepage/enabled && \
        echo -e 'never' > /sys/kernel/mm/transparent_hugepage/defrag && \
        ulimit -n 64000 && \
        mongod -f node1.conf && \
        mongod -f node2.conf && \
        mongod -f node3.conf && \
        mongosh mongodb://localhost:27017 --eval < rs_launch.js && \
        sleep infinity \
        "\
    ]
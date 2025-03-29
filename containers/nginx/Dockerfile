
FROM nginx:1.27

COPY ./frontend /var/www/html

# no default config
RUN rm -rf /etc/nginx/conf.d/default.conf && \
    apt-get update && \
    apt-get install -y npm && \
    # compile typescript
    cd /var/www/html && \
    npm install && \
    ./node_modules/typescript/bin/tsc *.ts

# copy in all our configs
COPY ./conf /etc/nginx/

COPY ./scripts/gen-ssl.sh /docker-entrypoint.d
RUN chmod 777 /docker-entrypoint.d/gen-ssl.sh

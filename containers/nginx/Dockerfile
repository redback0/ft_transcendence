
FROM nginx:1.27

# COPY ./frontend /var/www/html

# no default config
RUN rm -rf /etc/nginx/conf.d/default.conf && \
    apt-get update && \
    apt-get install --no-install-recommends -y npm
    # compile typescript

# copy in all our configs
COPY ./conf /etc/nginx/

COPY ./scripts/gen-ssl.sh /docker-entrypoint.d
COPY ./scripts/compile-typescript.sh /docker-entrypoint.d
RUN chmod 755 /docker-entrypoint.d/gen-ssl.sh /docker-entrypoint.d/compile-typescript.sh

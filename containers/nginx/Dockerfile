
FROM nginx:1.27

# no default config
RUN rm -rf /etc/nginx/conf.d/default.conf && \
    mkdir -p /etc/nginx/nginxconfig.io/

# copy in all our configs
COPY ./conf/*.template /etc/nginx/templates/
COPY ./conf/*.conf /etc/nginx/nginxconfig.io/

COPY ./scripts/gen-ssl.sh /docker-entrypoint.d
RUN chmod 777 /docker-entrypoint.d/gen-ssl.sh

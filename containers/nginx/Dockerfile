
FROM nginx:1.27

# no default config
RUN rm -rf /etc/nginx/conf.d/default.conf

# copy in all our configs
COPY ./conf/*.template /etc/nginx/templates/

COPY ./scripts/gen-ssl.sh /docker-entrypoint.d
RUN chmod 777 /docker-entrypoint.d/gen-ssl.sh

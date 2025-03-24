
# FROM alpine:3.21

# RUN apk update && apk add \
#     php82 \
#     php82-fpm

# RUN printf 'access.log = /dev/stdout\n[global]\nerror_log = /dev/stderr\n' >> /etc/php82/php-fpm.conf
# RUN sed -i "s/listen = 127\.0\.0\.1\:9000/listen = 9000/" /etc/php82/php-fpm.d/www.conf

# CMD [ "php-fpm82", "-F" ]

FROM node:23.10-alpine3.21

COPY ./website /var/www/html

RUN cd /var/www/html && \
    npm init -y && \
    npm install fastify tailwindcss @tailwindcss/cli

CMD [ "node", "/var/www/html/server" ]

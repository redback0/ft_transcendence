
FROM node:23.10-alpine3.21

RUN apk add --no-cache sqlite

# COPY ./backend /backend

# RUN cd /backend && \
#     npm install && \
#     ./node_modules/typescript/bin/tsc

# CMD [ "node", "/backend/server" ]

COPY ./scripts/docker-entrypoint.sh /

RUN chmod 755 /docker-entrypoint.sh

ENTRYPOINT [ "/docker-entrypoint.sh" ]
CMD [ "node", "/backend/js/server" ]


FROM node:23.10-alpine3.21

COPY ./backend /backend

RUN cd /backend && \
    npm install && \
    ./node_modules/typescript/bin/tsc

CMD [ "node", "/backend/server" ]

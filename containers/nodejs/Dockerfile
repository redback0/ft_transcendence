
FROM node:23.10-alpine3.21

COPY ./backend /backend

RUN cd /backend && \
    npm init -y && \
    npm install && \
    tsc *.ts

CMD [ "node", "/backend/server" ]

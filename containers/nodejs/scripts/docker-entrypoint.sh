#!/bin/sh

if [ ! -f /database/pong.db ]; then
    sqlite3 /database/pong.db <  /database/sqlite_setup.sql
    chmod 666 /database/pong.db
fi

cd /backend
npm install
./node_modules/typescript/bin/tsc

exec "$@"

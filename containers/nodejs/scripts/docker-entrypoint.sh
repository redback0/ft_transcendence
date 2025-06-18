#!/bin/sh

if [ ! -f /backend/database/pong.db ]; then
    sqlite3 /backend/database/pong.db <  /backend/database/sqlite_setup.sql
fi

cd /backend
npm install
./node_modules/typescript/bin/tsc

exec "$@"

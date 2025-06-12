#!/bin/sh


if [ ! -f /database/db_file/pong.db ]; then
    sqlite3 /database/db_file/pong.db <  /database/db_file/sqlite_setup.sql
fi


cd /database
npm install

# Development:
npm run start

# Production:
# npm run build
# exec "$@"

#!/bin/sh

cd /backend
npm install
./node_modules/typescript/bin/tsc

exec "$@"

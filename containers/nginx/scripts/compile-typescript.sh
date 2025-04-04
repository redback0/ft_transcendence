#!/bin/sh

cd /var/www/html
npm install
./node_modules/typescript/bin/tsc

#!/bin/sh

cd /var/www
npm install
npx tsc
npx @tailwindcss/cli -i html/css/main.css -o html/css/output.css

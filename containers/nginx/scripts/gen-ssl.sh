
if [ ! -f /etc/ssl/website_ssl.key ]; then
    openssl req -newkey rsa:2048 -noenc\
        -keyout /etc/ssl/website_ssl.key -x509 -days 365\
        -out /etc/ssl/certs/website_ssl.csr\
        -subj '/CN='${SERVER_NAME}'' > /dev/null 2>&1 && \
        echo "key generated" || echo "key error"
fi

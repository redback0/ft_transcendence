
if [ ! -f /etc/ssl/inception_private_key.key ]; then
    openssl req -newkey rsa:2048 -noenc\
        -keyout /etc/ssl/website_ssl.key -x509 -days 365\
        -out /etc/ssl/certs/website_ssl.csr\
        -subj '/CN='${SERVER_NAME}'' > /dev/null
fi

find trellinator* -name "*.js" | grep -v murphy | xargs jsdoc -c ~/jsdoc_conf.json
rm -rf /srv/www/www.trellinator.com/landing-promo/docs
mv out/ /srv/www/www.trellinator.com/landing-promo/docs

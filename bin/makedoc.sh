find trellinator* -name "*.js" | grep -v murphy | xargs jsdoc -c ~/jsdoc_conf.json trellinator/README.md
rm -rf /srv/www/www.trellinator.com/landing-promo/docs
mv out/ /srv/www/www.trellinator.com/landing-promo/docs
cp ~/manual.docs.theprocedurepeople.com-Trellinator\ Hello\ World.pdf /srv/www/www.trellinator.com/landing-promo/docs/trellinator_hello_world.pdf

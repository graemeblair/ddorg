#!/bin/bash
wget -qO- 'https://github.com/netlify/netlifyctl/releases/download/v0.4.0/netlifyctl-linux-amd64-0.4.0.tar.gz' | tar xvz

ls -laR ./content
ls -laR ./public

deploy_url=$(./netlifyctl deploy --draft --publish-directory "public" --site-id "$NETLIFY_SITE_ID" --access-token "$NETLIFY_ACCESS_TOKEN" | grep 'thirsty-morse-aa29ed')

node js/post_preview_link.js "$1" "$2" "$3" "$deploy_url"

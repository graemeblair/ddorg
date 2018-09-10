#!/bin/bash

deploy_url=$(./netlifyctl deploy --draft --publish-directory "public" --site-id "$NETLIFY_SITE_ID" --access-token "$NETLIFY_ACCESS_TOKEN" | grep 'thirsty-morse-aa29ed')

node js/post_preview_link.js "$1" "$2" "$3" "$deploy_url"

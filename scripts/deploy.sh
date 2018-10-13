#!/bin/bash

ls -laR ./content
ls -laR ./public

deploy_url=$(netlify deploy --dir=public | grep 'Live Draft Url')

# Pass in the API key, pull request number, current package, and our deploy URL.
node js/post_preview_link.js "$1" "$2" "$3" "$deploy_url"

#!/bin/bash
set -e

temporary_directory=$(mktemp --directory)
pushd "$temporary_directory"

pwd

URLS=$'https://api.github.com/repos/DeclareDesign/DeclareDesign/tarball
https://api.github.com/repos/DeclareDesign/randomizr/tarball
https://api.github.com/repos/DeclareDesign/fabricatr/tarball
https://api.github.com/repos/DeclareDesign/estimatr/tarball
https://api.github.com/repos/DeclareDesign/designs/tarball'

echo "$URLS" | tr '\n' '\0' | xargs --max-args=1 --max-procs=8 --null wget --header="Authorization: token ${GITHUB_API_TOKEN}" # Passes the URLs to wget one at a time (--max-args=1). Runs a maximum of 8 wgets in parallel (--max-procs=8).


for tar_file in tarball*; do
  tar xf "$tar_file"
done

for package in {DeclareDesign,randomizr,fabricatr,estimatr,designs}; do
  mv  DeclareDesign-${package}* "${package}_github"
done

popd

pwd

Rscript 'R/hackdown.R' "$temporary_directory"
Rscript 'R/downloadDesigns.R' "$temporary_directory"

find "${temporary_directory}/designs/inst/doc" -type f -name "*.html" -exec node cleanHtml.js '{}' ';' -exec cp '{}' ./content/library ';'
find "${temporary_directory}/designs/vignettes" -type f -name "*.RDS" -exec cp '{}' ./content/library ';'
cp ${temporary_directory}/designs/README.Rmd ./content/library

Rscript 'R/superBuild.R'

find ./public -type f -name 'readme.html'
find ./public -type f -name 'readme.html' -execdir mv '{}' 'index.html' ';'
mv ./public/blog.html ./public/blog/index.html # By hand adjustments
rm ./public/categories.html ./public/conduct.html ./public/idea.html ./public/library.html ./public/r.html # By hand adjustments
mkdir -p ./public/r/estimatr/vignettes && cp ./public/r/estimatr/articles/lm_speed.png ./public/r/estimatr/articles/lm_speed_covars.png ./public/r/estimatr/vignettes # By hand adjustments
cp '_redirects' './public/_redirects'

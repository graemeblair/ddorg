#!/bin/bash
set -e

# Cleanup This is important because if a file is removed from the real package,
# it will not automatically be removed from our content folder unless we clean
# it out ourselves.
rm -rf 'content/r' 'public/' 'content/library'
mkdir -p 'content/r' 'public/' 'content/library'

declare -A packages

packages=(
[randomizr]='public/r/randomizr'
[fabricatr]='public/r/fabricatr'
[estimatr]='public/r/estimatr'
[DeclareDesign]='public/r/declaredesign'
[DesignLibrary]='public/library')

temporary_directory=$(mktemp --directory)
pushd "$temporary_directory"

pwd

for package in "${!packages[@]}"; do
  URLS+="https://api.github.com/repos/DeclareDesign/${package}/tarball"
  URLS+=$'\n'
done

printf "${URLS}" | xargs --max-args=1 --max-procs=8 -d '\n' wget --header="Authorization: token ${GITHUB_API_TOKEN}" # Passes the URLs to wget one at a time (--max-args=1). Runs a maximum of 8 wgets in parallel (--max-procs=8).


for tar_file in tarball*; do
  tar xf "$tar_file"
done

for package in "${!packages[@]}"; do
  mv DeclareDesign-${package}* "${package}_github"
done

popd

pwd

Rscript 'R/hackdown.R' "$temporary_directory"

# Rename the reference index pages because right now they are named index.html.
# index.html files have a special meaning to Hugo. Leaving reference index pages
# as index.html will mess up Hugo's build process.
find ./content/ -type f -name 'index.html' -execdir mv '{}' 'readme.html' ';'

Rscript -e 'blogdown::build_site()'

find ./public -type f -name 'readme.html'
find ./public -type f -name 'readme.html' -execdir mv '{}' 'index.html' ';'
mv ./public/blog.html ./public/blog/index.html # By hand adjustments
rm ./public/categories.html ./public/conduct.html ./public/idea.html  ./public/r.html  ./public/about.html ./public/library.html # By hand adjustments
mkdir -p ./public/r/estimatr/vignettes && cp ./public/r/estimatr/articles/lm_speed.png ./public/r/estimatr/articles/lm_speed_covars.png ./public/r/estimatr/vignettes # By hand adjustments

cp '_redirects' './public/_redirects'

node create_library_table.js "$(pwd)/${packages[DesignLibrary]}/reference/index.html" "${temporary_directory}/DesignLibrary_github/man" "${temporary_directory}/DesignLibrary_github/vignettes"

IFS=$'\n'; set -f
for file in $(find $(pwd)/public -type f -name '*.html'); do
  echo "Cleaning $file"
  node clean_nonlibrary_pages.js "$file"
done
unset IFS; set +f

for package in "${!packages[@]}"; do
  echo "Running add_authors.js $(pwd)/${packages[$package]}/index.html ${package} $(pwd)/authors.yml"
  node add_authors.js "$(pwd)/${packages[$package]}/index.html" "${package}" "$(pwd)/authors.yml"
done

#!/bin/bash
set -e

# Cleanup This is important because if a file is removed from the real package,
# it will not automatically be removed from our content folder unless we clean
# it out ourselves.
rm -rf 'content/r' 'content/stata' 'public/' 'content/library' 'static/designs'
mkdir -p 'content/r' 'content/stata' 'public/' 'content/library' 'static/designs'

declare -A packages

packages=(
[randomizr]='public/r/randomizr'
[fabricatr]='public/r/fabricatr'
[estimatr]='public/r/estimatr'
[DeclareDesign]='public/r/declaredesign'
[DesignLibrary]='public/library'
[strandomizr]='public/stata/randomizr')

temporary_directory=$(mktemp --directory)
pushd "$temporary_directory"

pwd

for package in "${!packages[@]}"; do
  if [[ "$package" == "strandomizr" ]]; then
    URLS+="https://api.github.com/repos/DeclareDesign/${package}/tarball/web" # TODO: Remove once on main branch.
    URLS+=$'\n'
  else
    URLS+="https://api.github.com/repos/DeclareDesign/${package}/tarball"
    URLS+=$'\n'
  fi
done

printf "${URLS}" | xargs --max-args=1 --max-procs=8 -d '\n' wget --header="Authorization: token ${GITHUB_API_TOKEN}" # Passes the URLs to wget one at a time (--max-args=1). Runs a maximum of 8 wgets in parallel (--max-procs=8).


for tar_file in tarball*; do
  tar xf "$tar_file"
done

tar xf "web" # TODO: Remove once on main branch.

for package in "${!packages[@]}"; do
  mv DeclareDesign-${package}* "${package}_github"
done

popd

pwd

Rscript 'R/create_rdata.R'
Rscript 'R/hackdown.R' "$temporary_directory"

# Rename the reference index pages because right now they are named index.html.
# index.html files have a special meaning to Hugo. Leaving reference index pages
# as index.html will mess up Hugo's build process.
find ./content/ -type f -name 'index.html' -execdir mv '{}' 'readme.html' ';'

Rscript -e 'blogdown::build_site()'

find ./public -type f -name 'readme.html'
find ./public -type f -name 'readme.html' -execdir mv '{}' 'index.html' ';'
mv ./public/blog.html ./public/blog/index.html # By hand adjustments
rm ./public/categories.html ./public/conduct.html ./public/idea.html  ./public/r.html  ./public/about.html ./public/library.html ./public/stata.html # By hand adjustments
mkdir -p ./public/r/estimatr/vignettes && cp ./public/r/estimatr/articles/lm_speed.png ./public/r/estimatr/articles/lm_speed_covars.png ./public/r/estimatr/vignettes # By hand adjustments

cp '_redirects' './public/_redirects'

node js/create_library_table.js "$(pwd)/${packages[DesignLibrary]}/reference/index.html" "${temporary_directory}/DesignLibrary_github/man" "${temporary_directory}/DesignLibrary_github/vignettes" "${temporary_directory}/DesignLibrary_github/data/overview.csv"

IFS=$'\n'; set -f
for file in $(find $(pwd)/public -type f -name '*.html'); do
  echo "Cleaning $file"
  node js/clean_nonlibrary_pages.js "$file"
done
unset IFS; set +f

# Add authors

echo "Running add_authors.js $(pwd)/index.html 'Home' $(pwd)/authors.yml Authors"
node js/add_authors.js "$(pwd)/index.html" 'Home' "$(pwd)/authors.yml" 'Authors'

for package in "${!packages[@]}"; do
  echo "Running add_authors.js $(pwd)/${packages[$package]}/index.html ${package} $(pwd)/authors.yml Developers"
  node js/add_authors.js "$(pwd)/${packages[$package]}/index.html" "${package}" "$(pwd)/authors.yml" 'Developers'
done

# Temporary hack until the final Design Library homepage vignette is ready...
cp ./public/library/reference/index.html ./public/library/index.html

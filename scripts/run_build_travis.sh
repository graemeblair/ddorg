#!/usr/bin/env bash

# This line causes all errors in Bash to fail the build. If we didn't have this line then Travis will
# keep running even if there were an error somewhere else in the rest of the script.
set -e

# Cleanup This is important because if a file is removed from the real package,
# it will not automatically be removed from our content folder unless we clean
# it out ourselves. Also, adding the folder back is important because other parts
# of the script will error out, complaining that they can't find the right folders.
for content_folder in $CONTENT_FOLDERS; do
  echo "Removing $content_folder"
  rm -rf "$content_folder"
done

for content_folder in $CONTENT_FOLDERS; do
  echo "Creating $content_folder"
  mkdir -p "$content_folder"
done

if [ -n "$PACKAGE" ]; then
  # When building a package, remove the blog posts and other folders in the content
  # folder (e.g., the about page, the code of conduct, etc.) so that they are not built.
  # This prevents a bad blog post from causing the build of a package to fail.
  echo "Removing content folders"
  rm -rf "${CONTENT_FOLDER}"/*/

  # Downloads and untars one package into a temporary directory.
  temporary_directory=$(mktemp --directory)

  pushd "$temporary_directory"
  pwd

  echo "Downloading and untarring package ${PACKAGE}"
  wget --header="Authorization: token ${GITHUB_API_TOKEN}" -qO- "https://api.github.com/repos/${GITHUB_OWNER}/${PACKAGE}/tarball/${BRANCH}" | tar xz

  # All GitHub tar files begin with the name of the GitHub owner of the repository (e.g., DeclareDesign or Nick-Rivera),
  # followed by a dash, followed by the name of the package, and then followed by some junk characters. This line finds
  # the right tar file, then untars it to a folder that starts with the name of the page and ends with the suffix _github.
  # This suffix helps us to find the untarred folder in the R script. The suffix used to be important because we used to downloaded one package
  # from multiple sources. I'm leaving it in just in case we need to download the packages from multiple sources again.
  mv "${GITHUB_OWNER}-${PACKAGE}"* "${PACKAGE}_github"

  popd
  pwd

  echo 'Installing package dependencies...'
  Rscript 'R/install_dependencies.R' "$temporary_directory"

  # Runs the R script that builds the reference pages using pkgdown.
  Rscript 'R/hackdown.R' "$temporary_directory" "$PACKAGE" "${CONTENT_FOLDER}/${HOME_FOLDER}" "$PKGDOWN_TEMPLATES"


  # Rename the reference index pages because right now they are named index.html.
  # index.html files have a special meaning to Hugo. Leaving reference index pages
  # as index.html will mess up Hugo's build process.
  find "./${CONTENT_FOLDER}/" -type 'f' -name 'index.html' -execdir mv '{}' 'readme.html' ';'
else
  echo 'Installing package dependencies for the blog...'
  Rscript 'R/install_dependencies.R' ''
fi

Rscript -e 'blogdown::build_site()'

# Changes all the readme.html packages back to index.html.
find "./${PUBLISH_FOLDER}" -type f -name 'readme.html'
find "./${PUBLISH_FOLDER}" -type f -name 'readme.html' -execdir mv '{}' 'index.html' ';'

# If we are building the blog and not a package, move the blog's index page into place.
if [ -z "$PACKAGE" ]; then
  # Hugo puts its generated index.html page for the blog in a strange place. We're copying it here
  # so that users land on the blog page when they go to https://declaredesign.org/blog/.
  # If we didn't make this move, then users would have to go to https://declaredesign.org/blog.html instead.
  # Leave the original blog.html file intact because the built-in pagination expects that file to exist.
  echo "Moving blog index page..."
  cp "./${PUBLISH_FOLDER}/${BLOG_FOLDER}.html" "./${PUBLISH_FOLDER}/${BLOG_FOLDER}/index.html"
fi

for toplevel_folder in $TOPLEVEL_FOLDERS; do
  # Remove these files that Hugo autogenerates so that our pretty URLs work.
  rm -f "${PUBLISH_FOLDER}/${toplevel_folder}.html"
done


# Runs custom steps for individual packages.
# For example, the Design Library package uses a custom script to build its interactive library table.
if [ -n "$CUSTOM_SCRIPT" ]; then
  source "scripts/${CUSTOM_SCRIPT}"
fi

# Finds all .html files in our content folder and runs the clean_pages.js script on them. This script
# (1) Adds Bootstrap styling to all tables
# (2) Fixes code blocks on reference pages
# (3) Creates the table of contents on all pages
# The goofy IFS=$'\n'; set -f line prevents problems when using the find command with for loops in bash.
# See https://stackoverflow.com/a/5247919.
IFS=$'\n'; set -f
for file in $(find $(pwd)/"${PUBLISH_FOLDER}" -type f -name '*.html'); do
  echo "Cleaning $file"
  node js/clean_pages.js "$file" "$BASE_URL"
done
unset IFS; set +f

# Adds authors to the homepage of the entire website (i.e. https://declaredesign.org/index.html).
# This is a little bit of a cheat. I'm running the same script as I run for all the homepages of the other packages,
# except instead of passing in the name of a package to the script, I pass in the string 'Home'. In the author.yml
# file I have a section titled Home, which has the authors' university affiliations for the home page.
echo "Running add_authors.js $(pwd)/${PUBLISH_FOLDER}/index.html 'Home' $(pwd)/authors.yml Authors"
node js/add_authors.js "$(pwd)/${PUBLISH_FOLDER}/index.html" 'Home' "$(pwd)/authors.yml" 'Authors'

# Adds developer names to each of the package homepages. Edit these names in the authors.yml file.
echo "Running add_authors.js $(pwd)/${PUBLISH_FOLDER}/${HOME_FOLDER}/index.html ${PACKAGE} $(pwd)/authors.yml Developers"
node js/add_authors.js "$(pwd)/${PUBLISH_FOLDER}/${HOME_FOLDER}/index.html" "${PACKAGE}" "$(pwd)/authors.yml" 'Developers'

# Move pill badges to a sidebar on the package homepages.
echo "Running js/move_pill_badges.js $(pwd)/${PUBLISH_FOLDER}/${HOME_FOLDER}/index.html"
node js/move_pill_badges.js "$(pwd)/${PUBLISH_FOLDER}/${HOME_FOLDER}/index.html"

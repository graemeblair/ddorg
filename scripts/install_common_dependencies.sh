#!/usr/bin/env bash

# This line causes all errors in Bash to fail the build. If we didn't have this line then Travis will
# keep running even if there were an error somewhere else in the rest of the script.
set -e

start=$SECONDS

echo 'Entering the script to install common dependencies...'
Rscript 'R/install_common_dependencies.R'
Rscript -e 'blogdown::install_hugo()'

# If it took longer than 2 minutes (120 seconds) to install the dependencies, kill the
# build so that the cache has a chance to upload.
duration=$(( SECONDS - start ))
if [ "$duration" -gt "120" ]; then
  echo "Killing the build to upload dependencies. Please rerun to actually render the files."
  exit 1
fi

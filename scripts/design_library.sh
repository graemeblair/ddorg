# We've altered the reference page index template (content-reference-index.html) in DesignLibrary_pkgdown_templates.
# We've removed the table that pkgdown normally creates, and we added our own instead. The text that comes before the
# table also comes from that template. The script below creates the table.

node js/create_library_table.js "$(pwd)/${PUBLISH_FOLDER}/${HOME_FOLDER}/reference/index.html" "${temporary_directory}/${PACKAGE}_github/man" "${temporary_directory}/${PACKAGE}_github/vignettes" "${temporary_directory}/${PACKAGE}_github/inst/extdata/overview.csv"

# Temporary hack until the final Design Library homepage vignette is ready...
cp "${PUBLISH_FOLDER}/${HOME_FOLDER}/reference/index.html" "${PUBLISH_FOLDER}/${HOME_FOLDER}/index.html"

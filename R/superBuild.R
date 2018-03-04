source("R/hackdown.R")

get_package_reference_files()

reference_index_pages <-
  list.files("content/R",
             pattern = "index.html",
             full.names = TRUE,
             recursive = TRUE)

# Rename the reference index pages because right now they are named index.html.
# index.html files have a special meaning to Hugo. Leaving reference index pages
# as index.html will mess up Hugo's build process.
sapply(reference_index_pages, function(file_name)
{
 file.rename(
    from = file_name,
    to = sub(pattern = "index.html", replacement = "README.html", file_name)
  )
})

blogdown::build_site()

all_index_pages <-
  list.files("public/R",
             pattern = "readme.html",
             full.names = TRUE,
             recursive = TRUE)

sapply(all_index_pages, function(file_name)
{
  file.rename(
    from = file_name,
    to = sub(pattern = "readme.html", replacement = "index.html", file_name)
  )
})

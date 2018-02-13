source("R/hackdown.R")

get_package_reference_files()

index_pages <-
  list.files("content/page/package",
             pattern = "index.html",
             full.names = TRUE,
             recursive = TRUE)

for (index_page in index_pages)
{
  package_name <- gsub("content/page/package/(.*)/index.html", "\\1", index_page)
  contents <- readLines(index_page)
 fixed_contents <- gsub('href="(.*?)\\.html"', paste0('href="/page/package/', package_name, '/\\1/"'), contents)
 cat(fixed_contents, file = index_page, sep = "\n")

}

sapply(index_pages, function(file_name)
{
  file.rename(
    from = file_name,
    to = sub(pattern = "index.html", replacement = "home.html", file_name)
  )
})

blogdown::build_site()


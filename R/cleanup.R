fix_output <- function() {
  print("E")
  print("CONTENT")
  print(list.files("content/R/DeclareDesign"))
  print("-----")
  print("-----")
  print("-----")
  
  print("PUBLIC")
  print(list.files("public"))
  print("-----")
  print(list.files("public/R"))
  print("-----")
  print(list.files("public/R/DeclareDesign"))
  print("-----")
  all_index_pages <-
    list.files("public/R",
               pattern = "readme.html",
               full.names = TRUE,
               recursive = TRUE)
  print("F")
  print(all_index_pages)
  print("-----")
  sapply(all_index_pages, function(file_name)
  {
    print(file_name)
    file.rename(
      from = file_name,
      to = sub(pattern = "readme.html", replacement = "index.html", file_name)
    )
  })
}

fix_output()
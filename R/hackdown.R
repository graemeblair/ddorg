get_package_reference_files <- function()
{
  requireNamespace("pkgdown")
  requireNamespace("blogdown") # using requireNamespace, they have conflicting functions
  out <- tempdir()
  
  
  pkgs <-   c("DeclareDesign","estimatr","fabricatr","randomizr")
  packages <- download.packages(
    pkgs,
    destdir = out,
    repos="https://declaredesign.github.io",
    type = "source"
  )
  
  
  
  rownames(packages) <- pkgs
  colnames(packages) <- c("pkg", "tar")
  
  # untar all
  mapply(untar, tarfile=packages[,2], exdir=out)
  
  # Cleanup
  # This is important because if a file is removed from the real package, it will not automatically
  # be removed from our content folder unless we clean it out ourselves.
  unlink("content/R", recursive = TRUE)
  unlink("public", recursive = TRUE)

  for (pkg in pkgs)
  {
    zipped_folder_name <- file.path(out, paste0(pkg,"_github.tar.gz"))
    folder_name <- file.path(out, paste0(pkg,"_github"))
    file_url <- paste0("https://api.github.com/repos/DeclareDesign/", pkg, "/tarball")
    download.file(url = file_url, destfile = zipped_folder_name, method = "wget", extra = "--user-agent='DeclareDesign'")
    
    system(sprintf("mkdir %s && tar xf %s -C %s --strip-components 1", folder_name, zipped_folder_name, folder_name))
  }
  
  
  for (pkg in pkgs) {
    
    exdir <- file.path(out, packages[pkg,1])
    github_dir <- file.path(out, paste0(pkg, "_github"))
    
    # Put the reference pages and vignettes in their own folders under the main package folder.
    main_outdir <- file.path(getwd(), "content", "R", pkg)
    pkgdown_outdir_reference <- file.path(getwd(), "content", "R", pkg, "reference")
    pkgdown_outdir_vignettes <- file.path(getwd(), "content", "R", pkg, "articles")
    
    system(sprintf("cp -r _pkgdown.yml pkgdown_templates/* %s", exdir))
    
    # We want pkgdown to build the references, but do not let it build the vignettes.
    # Blogdown will take care of them, so just copy them over without touching them.
    pkgdown::build_reference(exdir[1],  path=pkgdown_outdir_reference)
    system(sprintf("cp -r %s %s", file.path(github_dir, "vignettes"), pkgdown_outdir_vignettes))
    system(sprintf("cp %s %s", file.path(github_dir, "README.Rmd"), main_outdir))
    
  }
  
  
  print("B")
  reference_index_pages <-
    list.files(
      "content/R",
      pattern = "index.html",
      full.names = TRUE,
      recursive = TRUE
    )
  print("C")
  # Rename the reference index pages because right now they are named index.html.
  # index.html files have a special meaning to Hugo. Leaving reference index pages
  # as index.html will mess up Hugo's build process.
  sapply(reference_index_pages, function(file_name)
  {
    print(file_name)
    file.rename(
      from = file_name,
      to = sub(pattern = "index.html", replacement = "README.html", file_name)
    )
  })
  print("D")
  blogdown::build_site()
}


fix_output <- function() {
  print("E")
  print("CONTENT")
  print(list.files("content/R/DeclareDesign"), full.names = TRUE, all.files = TRUE)
  print("-----")
  print("-----")
  print("-----")
  
  print("PUBLIC")
  print(list.files("public"), full.names = TRUE, all.files = TRUE)
  print("-----")
  print(list.files("public/R"), full.names = TRUE, all.files = TRUE)
  print("-----")
  print(list.files("public/R/DeclareDesign"), full.names = TRUE, all.files = TRUE)
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
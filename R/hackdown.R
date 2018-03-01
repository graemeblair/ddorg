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
   unlink("public", recursive = TRUE)
   for (pkg in pkgs)
   {
     unlink(file.path("content", pkg), recursive = TRUE)
   }
  
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
    main_outdir <- file.path(getwd(), "content", pkg)
    pkgdown_outdir_reference <- file.path(getwd(), "content", pkg, "reference")
    pkgdown_outdir_vignettes <- file.path(getwd(), "content", pkg, "articles")
    
    system(sprintf("cp -r _pkgdown.yml pkgdown_templates/* %s", exdir))
    
    # We want pkgdown to build the references, but do not let it build the vignettes.
    # Blogdown will take care of them, so just copy them over without touching them.
    pkgdown::build_reference(exdir[1],  path=pkgdown_outdir_reference)
    system(sprintf("cp -r %s %s", file.path(github_dir, "vignettes"), pkgdown_outdir_vignettes))
    system(sprintf("cp %s %s", file.path(github_dir, "README.Rmd"), main_outdir))
    
  }
}

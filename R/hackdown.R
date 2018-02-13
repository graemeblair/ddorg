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
  
  unlink("content/pages/package", recursive = TRUE)
  
  for (pkg in pkgs) {
    
    exdir=file.path(out, packages[pkg,1])
    
    pkgdown_outdir <- file.path(getwd(), "content", "page", "package", pkg)
    system(sprintf("cp -r _pkgdown.yml pkgdown_templates/* %s", exdir))
    
    pkgdown::build_reference(exdir[1],  path=pkgdown_outdir)
    
  }
}

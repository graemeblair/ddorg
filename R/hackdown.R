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
  
  unlink("content/page/package", recursive = TRUE)
  
  for (pkg in pkgs) {
    
    exdir=file.path(out, packages[pkg,1])
    
    # Put the reference pages and vignettes in their own folders under the main package folder.
    pkgdown_outdir_reference <- file.path(getwd(), "content", "page", "package", pkg, "reference")
    pkgdown_outdir_vignettes <- file.path(getwd(), "content", "page", "package", pkg)
    
    system(sprintf("cp -r _pkgdown.yml pkgdown_templates/* %s", exdir))
    
    # We want pkgdown to build the references, but do not let it build the vignettes.
    # Blogdown will take care of them, so just copy them over without touching them.
    pkgdown::build_reference(exdir[1],  path=pkgdown_outdir_reference)
    system(sprintf("cp -r %s %s", file.path(exdir, "vignettes"), pkgdown_outdir_vignettes))
    
  }
}

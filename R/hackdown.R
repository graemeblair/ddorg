requireNamespace("pkgdown")
requireNamespace("blogdown") # Using requireNamespace because pkgdown and blogdown have conflicting functions.

build_package <- function(pkg, out, parent_directory, pkgdown_templates)
{
  github_dir <- file.path(out, paste0(pkg, "_github"))

  # It is very, very, very important to keep all folder names lowercase.
  # Uppercase filenames create bad bugs when building on Travis. When Hugo runs
  # on Travis and there are uppercase folder names, Hugo will create two
  # directories in the public directory for each folder in the content
  # directory: One folder has its original name, and the other folder has the
  # same name but in lowercase. This is bad because we do not want these weird
  # duplicate folders.
  pkg_original_case <- pkg
  pkg <- tolower(pkg)

  # Put the reference pages and vignettes in their own folders under the main package folder.
  main_outdir <- file.path(getwd(), parent_directory)
  outdir_reference <- file.path(getwd(), parent_directory, "reference")
  outdir_vignettes <- file.path(getwd(), parent_directory, "articles")

  # We use pkgdown to render the reference pages for packages. For most
  # packages, the default options and templates for pkgdown are OK. These
  # options are in the folder pkgdown_templates. For some packages, we want more
  # customization. These packages will have custom pkgdown options and templates
  # in a special folder with the naming scheme MyPackageName_pkgdown_templates.
  system(sprintf("cp -r %s/* %s", pkgdown_templates, github_dir))


  # We want pkgdown to build the references, but do not let it build the
  # vignettes. Blogdown will take care of them, so just copy them over without
  # touching them.
  pkgdown::build_reference(github_dir,  path = outdir_reference)
  system(sprintf("cp -r %s %s",file.path(github_dir, "vignettes"),outdir_vignettes))
  system(sprintf("cp %s %s", file.path(github_dir, "README.Rmd"), main_outdir))
}

arguments <- commandArgs(trailingOnly = TRUE)
out <- arguments[1] # Folder with our downloaded and untarred packages.
pkg <- arguments[2]
parent_directory <- arguments[3] # Folder where we'll save rendered markdown files.
pkgdown_templates <- arguments[4]

devtools::install_cran("DesignLibrary", keep_source = TRUE, force = TRUE)

build_package(pkg, out, parent_directory, pkgdown_templates)

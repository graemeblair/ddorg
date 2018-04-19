arguments <- commandArgs(trailingOnly = TRUE)
out <- arguments[1] # Folder with our downloaded and untarred packages.

requireNamespace("pkgdown")
requireNamespace("blogdown") # using requireNamespace, they have conflicting functions

print(out)
pkgs <-   c("randomizr","fabricatr","estimatr","DeclareDesign")

# Cleanup
# This is important because if a file is removed from the real package, it will not automatically
# be removed from our content folder unless we clean it out ourselves.
unlink("content/r", recursive = TRUE)
unlink("public", recursive = TRUE)
unlink("content/library/", recursive = TRUE)

for (pkg in pkgs)
{
  github_dir <- file.path(out, paste0(pkg, "_github"))
  
  # It is very, very, very important to keep all folder names lowercase.
  # Uppercase filenames create bad bugs when building on Travis. When Hugo
  # runs on Travis and there are uppercase folder names, Hugo will create
  # two directories in the public directory for each folder in the content directory:
  # One folder has its original name, and the other folder has the same name but in
  # lowercase. This is bad because we do not want these weird duplicate folders.
  pkg <- tolower(pkg)
  
  # Put the reference pages and vignettes in their own folders under the main package folder.
  main_outdir <- file.path(getwd(), "content", "r", pkg)
  outdir_reference <- file.path(getwd(), "content", "r", pkg, "reference")
  outdir_vignettes <- file.path(getwd(), "content", "r", pkg, "articles")
  
  system(sprintf("cp -r _pkgdown.yml pkgdown_templates/* %s", github_dir))
  
  # We want pkgdown to build the references, but do not let it build the vignettes.
  # Blogdown will take care of them, so just copy them over without touching them.
  pkgdown::build_reference(github_dir,  path=outdir_reference)
  system(sprintf("cp -r %s %s", file.path(github_dir, "vignettes"), outdir_vignettes))
  system(sprintf("cp %s %s", file.path(github_dir, "README.Rmd"), main_outdir))
}

dir.create("content/library")
outdir_library <- file.path(getwd(), "content", "library")
github_dir <- file.path(out, paste0("designs", "_github"))
template_location <- file.path(github_dir, "R")

template_files <- list.files(template_location, pattern = ".+[.]R$", full.names = TRUE, recursive = FALSE)
designs_environment = new.env()

for (template_file in template_files)
{
  source(template_file, local = designs_environment, keep.source = TRUE)
}

template_functions <- ls(designs_environment, pattern = ".+_template$")

for (template_function in template_functions)
{
  template_code <- designs::template_text(get(template_function, pos = designs_environment, inherits = FALSE))
  file_name <- paste0(template_function, ".R")
  file_path <- file.path(outdir_library, file_name)
  writeLines(template_code, file_path)
}

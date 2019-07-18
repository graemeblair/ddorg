library(checkpoint)

arguments <- commandArgs(trailingOnly = TRUE)
out <- arguments[1] # Folder with our downloaded and untarred packages.

if (out == "")
{
  # If we didn't download a package, only scan the local directories
  # (i.e. we're building the blog).
  out <- "."
}

found_packages <- scanForPackages(out, use.knitr = TRUE)$pkgs
found_packages <- unique(found_packages)

not_installed_packages <- found_packages[!found_packages %in% installed.packages()]

if (length(not_installed_packages) > 0)
{
  install.packages(not_installed_packages, repos = "https://cloud.r-project.org")
}

library(checkpoint)

arguments <- commandArgs(trailingOnly = TRUE)
out <- arguments[1] # Folder with our downloaded and untarred packages.

found_packages <- scanForPackages(".", use.knitr = TRUE)$pkgs

# If we downloaded a package, search it for dependencies.
if (out != "")
{
  found_packages <- c(found_packages, scanForPackages(out, use.knitr = TRUE)$pkgs)
  found_packages <- unique(found_packages)
}

not_installed_packages <- found_packages[!found_packages %in% installed.packages()]

if (length(not_installed_packages) > 0)
{
  install.packages(not_installed_packages)
}

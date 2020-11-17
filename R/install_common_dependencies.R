# packages <- c(
#   "blogdown",
#   "checkpoint",
#   "devtools",
#   "diffobj",
#   "formatR",
#   "testthat",
#   "texreg",
#   "broom",
#   "pkgdown"
# )
# 
# packages_github <- c(
#   "gibbonscharlie/bfe",
#   "Nick-Rivera/pkgdown"
# )
# 
# not_installed_packages <- packages[!packages %in% installed.packages()]
# not_installed_packages_github <- packages_github[!packages_github %in% installed.packages()]
# 
# if (length(not_installed_packages) > 0)
# {
#   print("Installing common dependencies from CRAN...")
#   install.packages(not_installed_packages, repos = "https://cloud.r-project.org", lib = "~/R/Library")
# }
# 
# update.packages(ask = FALSE, repos = "https://cloud.r-project.org", lib = "~/R/Library")
# 
# if (length(not_installed_packages_github) > 0)
# {
#   print("Installing common dependencies from GitHub...")
#   for(pkg in not_installed_packages_github)
#     remotes::install_github(pkg)
# }

arguments <- commandArgs(trailingOnly = TRUE)
out <- arguments[1] # Folder with our downloaded and untarred packages.

packages <- download.packages(
  "designs",
  destdir = out,
  repos="https://declaredesign.github.io",
  type = "source"
)

rownames(packages) <- "designs"
colnames(packages) <- c("pkg", "tar")
mapply(untar, tarfile=packages[,2], exdir = out)
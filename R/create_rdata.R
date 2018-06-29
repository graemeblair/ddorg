library(DesignLibrary)

functions <- ls("package:DesignLibrary")
designers <- functions[grepl("_designer\\b", functions)]

for (designer in designers)
{
  cat("Creating the rdata file for ", designer, "\n")
  the_designer <- get(x = designer)
  design_name <- gsub("_designer\\b", "_design", designer)
  assign(x = design_name, value = the_designer())
  file_path <- file.path("content", "library", "designs", paste0(design_name, ".rda"))

  save(list = design_name, file = file_path)
}

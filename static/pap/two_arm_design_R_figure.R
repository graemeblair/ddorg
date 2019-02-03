## ----setup, include=FALSE------------------------------------------------
knitr::opts_chunk$set(message = FALSE, warning = FALSE)

## ------------------------------------------------------------------------
library(DeclareDesign)
library(tidyverse)
library(texreg)
library(knitr)
set.seed(343)

## ------------------------------------------------------------------------
sample_size    <- 100
effect_size    <- 0.5
number_treated <- 50

two_arm_design <-
  
  # M: Model
  declare_population(N = sample_size, u = rnorm(N)) +
  declare_potential_outcomes(Y ~ effect_size * Z + u) +
  
  # I: Inquiry
  declare_estimand(ATE = mean(Y_Z_1 - Y_Z_0)) +
  
  # D: Data Strategy
  declare_assignment(m = number_treated) +
  declare_reveal(Y, Z) +
  
  # A: Answer Strategy
  declare_estimator(Y ~ Z, model = lm_robust, estimand = "ATE")

## ------------------------------------------------------------------------
one_run <- draw_data(two_arm_design)

one_run <-
  one_run %>%
  mutate(treatment = factor(Z, levels = 0:1, labels = c("Control", "Treatment")))

summary_df <- 
  one_run %>%
  group_by(treatment) %>%
  do(tidy(lm_robust(Y ~ 1, data = .))) %>%
  mutate(Y = estimate)

gg <- ggplot(summary_df, aes(treatment, Y)) +
  geom_point(size = 3) +
  geom_errorbar(aes(ymin = conf.low, ymax = conf.high), width = 0) +
  geom_point(data = one_run, position = position_jitter(width = 0.1), alpha = 0.2) +
  theme_bw() +
  theme(axis.title.x = element_blank()) +
  ylab("Outcome") +
  ggtitle("Comparison of Control and Treatment Group Means", "Simulated Data")

ggsave("../figures/two_arm_design_R.png", gg, width = 7, height = 7)


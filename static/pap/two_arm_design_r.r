library(DeclareDesign)

sample_size    <- 100
effect_size    <- 0.5
number_treated <- 50

two_arm_design <-
  
  # M: Model
  declare_population(N = sample_size, noise = rnorm(N)) +
  declare_potential_outcomes(Y ~ effect_size * Z + noise) +
  
  # I: Inquiry
  declare_estimand(ATE = mean(Y_Z_1 - Y_Z_0)) +
  
  # D: Data Strategy
  declare_assignment(m = number_treated) +
  declare_reveal(Y, Z) +
  
  # A: Answer Strategy
  declare_estimator(Y ~ Z, model = lm_robust, estimand = "ATE")
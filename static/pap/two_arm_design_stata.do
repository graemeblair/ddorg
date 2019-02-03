program two_arm_design, rclass

syntax [, sample_size(integer 100) effect_size(real .5) number_treated(integer 50)]

drop _all

* // Model

* Population

set obs `sample_size'
  
  gen noise = rnormal(0, 1)
  
  * Potential outcomes
  
  gen Y_Z_0 = noise
  gen Y_Z_1 = noise + `effect_size'

* // Inquiry 

return scalar estimand = `effect_size'
  
  * // Data strategy
  
  * Assignment strategy
  
  complete_ra Z, m(`number_treated')

* Reveal outcomes

gen     Y = Y_Z_0 
replace Y = Y_Z_1 if Z == 1

* // Answer strategy

reg Y Z, vce(hc2)

matrix b = e(b)

return scalar estimate = b[1, 1]

return scalar p_value = 2 * ttail(e(df_r), abs(_b[Z]/_se[Z]))

end
import numpy as np
import scipy as sp
import statsmodels.api as sm
import statsmodels.formula.api as smf
import pandas as pd
import numpy as np

def draw_data(sample_size = 100, effect_size = 0.5, number_treated = 50):  
    # Model
    
    # Population
    pop = pd.DataFrame({
      'noise' : sp.stats.norm(loc = 0, scale = 1).rvs(sample_size)})

    # Potential outcomes
    pop['Y_Z_0'] = pop['noise']
    pop['Y_Z_1'] = pop['noise'] + effect_size
     
    # Data Strategy
    
    # Assignment strategy
    pop['Z'] = np.random.choice(np.concatenate(([1] * 50, [0] * 50)), sample_size, replace = False)
     
    # Reveal outcomes
    pop['Y'] = pop['Y_Z_0'] * (1 - pop['Z']) + pop['Y_Z_1'] * pop['Z']
    
    return pop;


def fit_model(data):
    # Answer strategy
    model_fit = smf.ols('Y ~ Z', data = data).fit()

    fit = model_fit.get_robustcov_results(cov_type='HC2')
    
    return fit;





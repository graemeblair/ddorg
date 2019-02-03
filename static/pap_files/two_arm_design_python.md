---
title: "Example Design Declaration and Diagnosis for Preanalysis Plans in Python"
---

This document shows some things researchers may wish to add to their preanalysis plans using design declaration and diagnosis.  

# Setup

```{python}
import numpy as np
import scipy as sp
import statsmodels.api as sm
import statsmodels.formula.api as smf
import pandas as pd
import numpy as np
import seaborn as sns
```


# Declare the Design

```{python}
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

def diagnose_design(sims = 500):
    
    p_values = []
    
    for x in range(sims):
        
        data = draw_data()
        
        fit = fit_model(data)
        
        p_values = np.append(p_values, fit.pvalues[1])
        
    power = np.mean(p_values < .05)
    
    return power;
```

# Mock Figure

```{python}
df = draw_data()
df['treatment'] = np.where(df['Z']==1, 'treatment', 'control')

one_run = draw_data()
one_run['treatment'] = np.where(one_run['Z']==1, 'treatment', 'control')

sns_plot = sns.catplot(x = "treatment", y = "Y", data = df)
sns_plot.savefig("figures/two_arm_design_stata.png")
fig.save
sns.catplot(x = "treatment", y = "Y", data = df, kind = 'point')
```



# Mock Regression Table

```{python}
fit_model(one_run).summary()
```



# Diagnosis

```{python}
diagnose_design(sims = 500)
```



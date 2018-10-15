# DeclareDesign project web site - declaredesign.org

[![Build Status](https://travis-ci.org/DeclareDesign/declaredesign.org.svg?branch=master)](https://travis-ci.org/DeclareDesign/declaredesign.org)

# How do I run the build script locally?

Steps for running locally on macOS:

First, `cd` into the declaredesign.org directory:

```sh
cd ~/Downloads/declaredesign.org
```

Then, get your Python environment set up in that directory:

```sh
# Update your Python packages.
python3 -m pip install --upgrade pip setuptools wheel virtualenv

# Create a new virtual environment.
virtualenv venv
source venv/bin/activate

# Install the required package for the script to run.
python3 -m pip install pyyaml

```

Next, add your GitHub API token to the top of the file `run_build.py` on the line `GITHUB_API_TOKEN = ""`.

Now, run that scrip with Python:

```sh
python3 run_build.py
```

Don't forget that you will also have to install any R packages that are necessary to build the website.
These are listed in the `DESCRIPTION` file.
import http.server
import os
import socketserver
import subprocess
import yaml

GITHUB_API_TOKEN = ""
PORT = 8000


def parse_environment_variables(environment_variable_list):
    """
    Turns your list of environment variables into a map of environment variables.

    :param environment_variable_list: A list of environment variables for one package.
    :return: A map that holds a key-value pair for each environment variable.
    """
    environment_variable_map = {}

    for variable in environment_variable_list:
        variable = variable.split("=", maxsplit=1)

        variable_identifier = variable[0]
        variable_value = variable[1].strip("'")

        environment_variable_map[variable_identifier] = variable_value

    return environment_variable_map


if not GITHUB_API_TOKEN:
    raise ValueError("Don't forget to add your GitHub API token at the top of this file.")

# Gets a copy of the user's path to give to the build script environment.
# This makes sure that the build script uses the right programs when it runs (e.g. it looks up the correct version of
# Node.js or coreutils from the user's path).
user_environment_variables = os.environ.copy()
user_path = user_environment_variables["PATH"]

with open(".travis.yml") as travis_yml:
    travis_environment_variables = yaml.load(travis_yml)

global_environment_variables = travis_environment_variables["env"]["global"]
package_environment_variables = travis_environment_variables["env"]["matrix"]

# Split up the list of environment variables into one list of environment variables per package.
package_environment_variables = [x.split(" ") for x in package_environment_variables]

for index, package_to_build in enumerate(package_environment_variables):
    package_name = parse_environment_variables(package_to_build)["PACKAGE"]

    if not package_name:
        package_name = "Blog Pages"

    print(f"{index}: {package_name}")

user_choice = input("Which package would you like to build: ")
package_to_build = package_environment_variables[int(user_choice)]

parsed_global_variables = parse_environment_variables(global_environment_variables)
parsed_package_variables = parse_environment_variables(package_to_build)

all_variables = {**parsed_global_variables, **parsed_package_variables}
all_variables["GITHUB_API_TOKEN"] = GITHUB_API_TOKEN
all_variables["PATH"] = user_environment_variables["PATH"]

subprocess.run(["./scripts/run_build_travis.sh"], env=all_variables)

# Serve the site!
os.chdir("public/")
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("serving at port", PORT)
    httpd.serve_forever()

"use strict";

const request = require("request");

const API_KEY             = process.argv[2];
const PULL_REQUEST_NUMBER = process.argv[3];
const CURRENT_PACKAGE     = process.argv[4] === "" ? "Blog Pages" : process.argv[4]; // An empty package name means
let PREVIEW_URL           = process.argv[5];                                         // that we're building the blog
                                                                                     // pages.

// Extract the preview URL from whatever garbage is before and after it.
PREVIEW_URL = PREVIEW_URL.replace(/.*(https.*\.com).*/, "$1");

console.log("CURRENT_PACKAGE:", CURRENT_PACKAGE);
console.log("PREVIEW_URL:", PREVIEW_URL);
console.log("PULL_REQUEST_NUMBER:", PULL_REQUEST_NUMBER);

// If we were not passed a preview URL, there was a problem.
if (!PREVIEW_URL)
{
    throw new Error("No preview URL was given. There was a problem uploading the files to Netlify.")
}

// If this build is not for a pull request, then the pull request number will be equal to the string `false`.
if (PULL_REQUEST_NUMBER === "false")
{
    console.log("No pull request number was given, so no preview link will be posted to GitHub.");
    return;
}

const options = {
    url: `https://api.github.com/repos/DeclareDesign/declaredesign.org/issues/${PULL_REQUEST_NUMBER}/comments`,
    headers: {
        "User-Agent": "DeclareDesign",
        "Accept": "application/vnd.github.v3+json",
        "Authorization": `token ${API_KEY}`
    },
    body: {
        "body": `### ${CURRENT_PACKAGE}\n[Preview link](${PREVIEW_URL})`
    },
    json: true
};

function callback(error, response, body)
{
    if (!error && response.statusCode === 201)
    {
        console.log("Successfully posted the preview URL on GitHub.");
    }
    else
    {
        throw new Error(`Could not post the URL preview as a comment on GitHub. Failed with response code ${response.statusCode}.`);
    }
}

request.post(options, callback);

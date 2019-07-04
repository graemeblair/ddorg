"use strict";

const yaml    = require("js-yaml");
const fs      = require("fs");
const cheerio = require("cheerio");


const html_file_name = process.argv[2];
const web_page       = fs.readFileSync(html_file_name, "utf8");

const $ = cheerio.load(web_page);

const package_name = process.argv[3];


const authors_file_name = process.argv[4];
const authors_yaml      = fs.readFileSync(authors_file_name, "utf8");
const authors           = yaml.safeLoad(authors_yaml);
const header_text       = process.argv[5];


if (!authors[package_name])
{
    return; // There are no authors given for the current package.
}

if (!$("#toc_column").length)
{
    // Shrink the size of the main column so that the author names can fit.
    $("#content_column").toggleClass("col-lg-12 col-lg-8");

    // Create the table of contents column, which will take up 3 units.
    $("#content_column").after("<div class='col-lg-3 d-none d-lg-block' id='toc_column'></div>");
}

const authors_list = $(`<div>
    <p class="h2">${header_text}</p>
    <ul class='list-unstyled' id="developers_list"></ul>
</div>
`);

for (const value of Object.values(authors[package_name]))
{
    const roles = Array.isArray(value["role"]) ? value["role"].join(", ") : value["role"];

    $("#developers_list", authors_list).append(`<li>
    <ul class="list-unstyled">
        <li><a href="${value["contact"]}">${value["given"]} ${value["family"]}</a></li>
        <li class="small role_text"> ${roles || ""}</li>
    </ul>
</li>`);
}

$("#toc_column").append(authors_list);

fs.writeFileSync(html_file_name, $.html());

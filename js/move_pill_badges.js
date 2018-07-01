"use strict";

const fs      = require("fs");
const cheerio = require("cheerio");

const html_file_name = process.argv[2];
const web_page       = fs.readFileSync(html_file_name, "utf8");

const $ = cheerio.load(web_page);

const pill_badges = $("a > img");
if (pill_badges.length === 0)
{
    return; // There are no pill badges.
}

const dev_status = $(`<div>
    <p class="h2" id="dev_status">Dev Status</p>
</div>`);

pill_badges.addClass("pill_badge");

const pill_parent_paragraph = pill_badges.eq(0).parents("p");
pill_parent_paragraph.appendTo(dev_status);

// Run this if the table of contents does not exist.
if ($("#toc_column").length === 0)
{
    // Shrink the size of the main column so that the author names can fit.
    $("#content_column").toggleClass("col-lg-12 col-lg-8");

    // Create the table of contents column, which will take up 3 units.
    $("#content_column").after("<div class='col-lg-3 d-none d-lg-block' id='toc_column'></div>");
}


dev_status.appendTo("#toc_column");

fs.writeFileSync(html_file_name, $.html());

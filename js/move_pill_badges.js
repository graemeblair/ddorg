"use strict";

const fs      = require("fs");
const cheerio = require("cheerio");

const html_file_name = process.argv[2];
const web_page       = fs.readFileSync(html_file_name, "utf8");

const $ = cheerio.load(web_page);

const pill_badges = $("p > a > img");
if (!pill_badges.length)
{
    return; // There are no pill badges.
}

const dev_status = $(`<div>
    <p class="h2" id="dev_status">Dev Status</p>
</div>`);

pill_badges.addClass("pill_badge");

const pill_parent_paragraph = pill_badges.eq(0).parents("p");
pill_parent_paragraph.appendTo(dev_status);

dev_status.appendTo("#toc_column");

fs.writeFileSync(html_file_name, $.html());

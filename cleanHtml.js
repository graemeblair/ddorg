const fs = require("fs");
const cheerio = require("cheerio");

const htmlFileName = process.argv[2];
const webPage = fs.readFileSync(htmlFileName, "utf8");

const $ = cheerio.load(webPage);
const pageTitle = $("title").text();

$("body").find("*").removeAttr("style");
$("body").find("style, script").remove();

let bodyHtml = $("body").html();
bodyHtml = bodyHtml.trim();

const header = `---
title: "${pageTitle}"
---

`;

fs.writeFileSync(htmlFileName, header + bodyHtml);
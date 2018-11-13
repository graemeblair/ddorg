"use strict";

const fs      = require("fs");
const cheerio = require("cheerio");

const HTML_FILE_NAME = process.argv[2];
const BASE_URL       = process.argv[3];

const WEB_PAGE = fs.readFileSync(HTML_FILE_NAME, "utf8");
const $        = cheerio.load(WEB_PAGE);

function clean_tables()
{
    $("table").addClass("table table-striped");
}

function clean_code_blocks()
{
    const code_blocks = $(".article-content .examples, .article-content .usage");

    code_blocks.find(".input, .output").each(function ()
    {
        // Each piece of code on a reference page is inside a span tag. Inside each span tag are input and output
        // blocks of R code. Inside each input and output block is a mess of span tags. We are getting the code from
        // inside each input and output block and stripping out all its inner tags, except link elements. We keep link
        // elements because they link to other parts of our reference files straight from the sample code.

        const input_output_block = $(this);
        const non_link_elements  = input_output_block.find("*").not("a");

        // Move from the most inner element to the most outer element.
        for (let i = non_link_elements.length - 1; i >= 0; i--)
        {
            const element         = $(non_link_elements[i]);
            const element_content = element.html();
            element.replaceWith(element_content);
        }
    });

    // Manually trigger code highlighting.
    code_blocks.each(function ()
    {
        const code_block = $(this);
        code_block.addClass("r");
    });
}

function create_toc()
{
    // Count the number of items that would be in the TOC. If there’s one or fewer items,
    // don't create a TOC. Just create one column of length 12 that will hold our article.
    if ($("li", "#TOC").length <= 1)
    {
        $("#TOC").remove();
        $(".article").wrap("<div class='row justify-content-between'><div class='col-lg-12' id='content_column'></div>");
        return;
    }

    // Create the main content column, which will be 8 units big.
    $(".article").wrap("<div class='row justify-content-between'><div class='col-lg-8' id='content_column'></div>");

    // Create the table of contents column, which will take up 3 units.
    $("#content_column").after("<div class='col-lg-3 d-none d-lg-block' id='toc_column'></div>");

    // Move the table of contents into the second column
    $("#TOC").appendTo("#toc_column");
    $("#TOC").addClass("mb-3"); // Add some spacing below the TOC.

    // Add all the properties Bootstrap expects to be on the column
    $("#TOC > ul").wrap("<nav class='navbar navbar-light bg-light'></nav>");
    $("#TOC > nav > ul").before("<a class='navbar-brand' href='#'>Table of Contents</a>");
    $("#TOC ul").addClass("nav nav-pills flex-column");
    $("#TOC ul > li").addClass("nav-item");
    $("#TOC ul > li > a").addClass("nav-link ");
    $("#TOC > nav > ul ul > li").addClass("ml-3"); // Only add an indent to level 2 links.
}

function add_twitter_cards()
{
    const page_title         = $("title").text();
    const first_image        = $("img", ".article-content").eq(0);
    const first_image_source = first_image.attr("src");

    const link_starts_with_domain_name = /^https/.test(first_image_source);

    const card_type  = `<meta name="twitter:card"  content="summary">`;
    const card_title = `<meta name="twitter:title" content="${page_title}">`;
    const card_image = `<meta name="twitter:image" content="${BASE_URL + first_image_source}">`;

    const page_head = $("head");

    page_head.append(card_type);
    page_head.append(card_title);

    // If a link starts with the domain name, it indicates that the image is not part of our content but is
    // instead an image from someone else (e.g. a Travis build pill badge).
    if (first_image_source && !link_starts_with_domain_name)
    {
        page_head.append(card_image);
    }
}

clean_tables();
clean_code_blocks();
create_toc();
add_twitter_cards();

fs.writeFileSync(HTML_FILE_NAME, $.html());

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

function add_twitter_card_image()
{
    const first_image                = $("img", ".article-content").eq(0);
    const first_image_source         = first_image.attr("src");
    const does_link_have_domain_name = /^https/.test(first_image_source);

    // Don't include an image in the Twitter preview if the image's link has the domain name.
    // The reason is that if the link has a domain name, it indicates that the image is not part of our content but is
    // instead an image from someone else (e.g. a Travis build pill badge).
    if (first_image_source && !does_link_have_domain_name)
    {
        const page_head  = $("head");
        const card_image = `<meta name="twitter:image" content="${BASE_URL + first_image_source}">`;

        page_head.append(card_image);
    }
}

clean_tables();
clean_code_blocks();
add_twitter_card_image();

fs.writeFileSync(HTML_FILE_NAME, $.html());

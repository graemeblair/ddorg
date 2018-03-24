"use strict";

function fix_code_blocks()
{
    const code_blocks = jQuery(".article-content .examples, .article-content .usage");

    code_blocks.find(".input, .output").each(function ()
    {
        // Each piece of code on a reference page is inside a span tag. Inside each span tag are input and output
        // blocks of R code. Inside each input and output block is a mess of span tags. We are getting the code from
        // inside each input and output block and stripping out all its inner tags, except link elements. We keep link
        // elements because they link to other parts of our reference files straight from the sample code.

        const input_output_block = jQuery(this);
        const non_link_elements  = input_output_block.find("*").not("a");

        // Move from the most inner element to the most outer element.
        for (let i = non_link_elements.length - 1; i >= 0; i--)
        {
            const element         = jQuery(non_link_elements[i]);
            const element_content = element.html();
            element.replaceWith(element_content);
        }
    });

    // Manually trigger code highlighting.
    code_blocks.each(function ()
    {
        const code_block = jQuery(this);
        code_block.addClass("r");
        hljs.highlightBlock(this);
    });
}

jQuery(fix_code_blocks);

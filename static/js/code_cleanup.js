"use strict";

function fix_code_blocks()
{
    const code_blocks = jQuery(".article-content .examples, .article-content .usage");

    code_blocks.find(".input, .output").each(function ()
    {
        // Each piece of code on a reference page is inside a span tag. Inside each span tag are input and output
        // blocks of R code. Inside each input and output block is a mess of span tags. We are getting the code from
        // inside each input and output block and stripping out all its inner tags.
        const code_block   = jQuery(this);
        const code_content = code_block.text();

        // It is important to put a newline between input and output blocks so that adjacent input and output blocks do
        // not squish together into one unreadable mess.
        code_block.replaceWith(code_content + "\n");
    });

    code_blocks.each(function ()
    {
        // Now that we have cleaned up the code inside the input/output blocks, strip out the tags that distinguish the
        // input/output blocks themselves because we do not need those tags anymore.
        const code_block   = jQuery(this);
        const code_content = code_block.text();

        code_block.text(code_content.trim());
        code_block.addClass("r");
        hljs.highlightBlock(this);
    });
}

jQuery(fix_code_blocks);

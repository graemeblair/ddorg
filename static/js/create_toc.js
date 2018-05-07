function create_toc()
{
    // Create the main content column
    jQuery(".article").wrap("<div class='row justify-content-between'><div class='col-lg-8' id='content_column'></div>");

    // Create the table of contents column
    jQuery(".row").append("<div class='col-lg-3 d-none d-lg-block' id='toc_column'></div>");

    // Move the table of contents into the second column
    jQuery("#TOC").appendTo("#toc_column");

    // Add all the properties Bootstrap expects to be on the column
    jQuery("#TOC ul").wrap("<nav class='navbar navbar-light bg-light'></nav>");
    jQuery("#TOC ul").prepend("<a class='navbar-brand' href='#'>Table of Contents</a>");
    jQuery("#TOC ul").addClass("nav nav-pills flex-column");
    jQuery("#TOC ul li").addClass("nav-item");
    jQuery("#TOC ul li a").addClass("nav-link ");
}

jQuery(create_toc);

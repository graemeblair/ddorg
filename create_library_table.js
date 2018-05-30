"use strict";

const fs      = require("fs");
const path    = require("path");
const cheerio = require("cheerio");


const man_page_directory = process.argv[3];
const vignette_directory = process.argv[4];

// The file name of one of HTML pages on the website. After we create a list of all the design library functions, we'll
// stick the table into this HTML page.
const library_file_name = process.argv[2];
const library_file_text = fs.readFileSync(library_file_name);
const $                 = cheerio.load(library_file_text);

// These hold one object per vignette/man page. Each object has information about its respective vignette/man page.
const man_pages = new Map();
const vignettes = new Map();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Process the man pages
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function get_text_from_document(your_regex, text, capturing_group_number)
{
    const regex_result = your_regex.exec(text);
    if (regex_result)
    {
        return regex_result[capturing_group_number].trim();
    }

    return null;
}

const man_page_file_names = fs.readdirSync(man_page_directory);

for (const man_page of man_page_file_names)
{
    const man_page_file_info = fs.statSync(path.join(man_page_directory, man_page));
    if (man_page_file_info.isDirectory() || !man_page.endsWith(".Rd"))
    {
        continue;
    }

    // IMPORTANT: Designs and designers need to end with the suffix _design and _designer, respectively. Why? If
    // there's a design named regression_design and a designer named regression_designer, the only way that I can tell
    // that the design and designer should be associated with each is by looking at their names. In the future, we can
    // find another way to specify that a design and designer should be linked together.
    const get_design_name_regex = /^(.*)_(.*)$/;
    let design_name             = get_text_from_document(get_design_name_regex, man_page, 1);
    if (!design_name)
    {
        // IMPORTANT: A page needs to end with the suffix _designer or _design, otherwise I have no way to tell if a
        // file is a designer or a design.
        continue;
    }

    if (!man_pages.has(design_name))
    {
        man_pages.set(design_name, {});
    }

    const design_info = man_pages.get(design_name);

    const is_designer = man_page.endsWith("designer.Rd");

    if (is_designer)
    {
        design_info.designer_file = man_page;
    }
    else
    {
        design_info.design_example_file = man_page;
    }

    let man_page_text = fs.readFileSync(path.join(man_page_directory, man_page), "utf8");
    man_page_text     = man_page_text.replace(/[\n\t]/g, " ");

    const get_title_regex   = /\\title{\s*(.*?)\s*}/;
    const get_author_regex  = /\\author{\s*\\href{(.*?)}\s*{(.*?)}\s*}/;
    const get_concept_regex = /\\concept{\s*(.*?)\s*}/;

    const title = get_text_from_document(get_title_regex, man_page_text, 1);
    if (!is_designer && title) // Only get the titles from _design files.
    {
        design_info.title = title;
    }

    const author         = get_text_from_document(get_author_regex, man_page_text, 2);
    const author_website = get_text_from_document(get_author_regex, man_page_text, 1);
    if (author)
    {
        design_info.author = author;
    }
    if (author_website)
    {
        design_info.author_website = author_website;
    }

    let concept = get_text_from_document(get_concept_regex, man_page_text, 1);
    if (concept)
    {
        concept = concept.replace(/\s+/g, ",");
        design_info.concept = concept.replace(/,/g, ", ");
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Process the vignettes pages
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const vignette_file_names = fs.readdirSync(vignette_directory);

for (const vignette of vignette_file_names)
{
    const vignette_file_info = fs.statSync(path.join(vignette_directory, vignette));
    if (vignette_file_info.isDirectory() || !vignette.endsWith(".Rmd"))
    {
        continue;
    }

    if (!vignettes.has(vignette))
    {
        vignettes.set(vignette, {});
    }

    const vignette_info = vignettes.get(vignette);

    const vignette_page = fs.readFileSync(path.join(vignette_directory, vignette), "utf8");

    vignette_info.vignette_file = vignette;

    const get_title_regex          = /title: *?"(.*?)"/;
    const get_designer_regex       = /designer: *?"(.*?)"/;
    const get_example_design_regex = /example-design: *?"(.*?)"/;

    const title = get_text_from_document(get_title_regex, vignette_page, 1);
    if (title)
    {
        vignette_info.title = title;
    }

    const designer = get_text_from_document(get_designer_regex, vignette_page, 1);
    if (designer)
    {
        vignette_info.designer_file = designer;
    }

    const design_example = get_text_from_document(get_example_design_regex, vignette_page, 1);
    if (design_example)
    {
        vignette_info.design_example_file = design_example;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Check for associations between the vignettes and the man pages
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

for (const vignette of vignettes.values())
{
    for (const man_page of man_pages.values())
    {
        if (vignette.designer_file === man_page.designer_file)
        {
            vignette.concept        = man_page.concept;
            vignette.author         = man_page.author;
            vignette.author_website = man_page.author_website;

            man_page.has_associated_vignette = true;
        }

        if (vignette.design_example_file === man_page.design_example_file)
        {
            man_page.has_associated_vignette = true;
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Create and fill in the table
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const table = $(`<table id="design_library_list">
    <thead>
    <tr>
        <th>Design</th>
        <th>Designer</th>
        <th>Author</th>
        <th>Keywords</th>
        <th>Example Design</th>
    </tr>
    </thead>
    <tbody>
    </tbody>
</table>`);

$("body > div > main > article").append(table);


function add_design_to_table(man_page_or_vignette, is_vignette, $)
{
    let vignette_file_without_extension = path.parse(man_page_or_vignette.vignette_file || "").name;

    let design_example_without_extension = path.parse(man_page_or_vignette.design_example_file || "").name;
    let design_example_readable          = design_example_without_extension.replace(/_/g, " ");
    design_example_readable              = design_example_readable.charAt(0).toUpperCase() + design_example_readable.slice(1);

    let designer_without_extension = path.parse(man_page_or_vignette.designer_file || "").name;
    let designer_readable          = designer_without_extension.replace(/_/g, " ");
    designer_readable              = designer_readable.charAt(0).toUpperCase() + designer_readable.slice(1);


    const table_row = $(`<tr></tr>`);
    if (is_vignette)
    {
        table_row.append(`<td><a href="/library/articles/${vignette_file_without_extension}.html">${man_page_or_vignette.title}</a></td>`);
    }
    else
    {
        table_row.append(`<td>${man_page_or_vignette.title}</a></td>`);
    }

    if (man_page_or_vignette.designer_file)
    {
        table_row.append(`<td><a href="/library/reference/${designer_without_extension}.html">${designer_readable}</a></td>`);
    }
    else
    {
        table_row.append(`<td></td>`);
    }

    if (man_page_or_vignette.author_website && man_page_or_vignette.author)
    {
        table_row.append(`<td><a href="${man_page_or_vignette.author_website}">${man_page_or_vignette.author}</a></td>`)
    }
    else
    {
        table_row.append(`<td>${man_page_or_vignette.author || ""}</td>`);
    }

    table_row.append(`<td>${man_page_or_vignette.concept || ""}</td>`);

    if (man_page_or_vignette.design_example_file)
    {
        table_row.append(`<td><a href="/library/reference/${design_example_without_extension}.html">${design_example_readable}</a></td>`);
    }
    else
    {
        table_row.append(`<td></td>`);
    }

    $("#design_library_list > tbody").append(table_row);
}


for (const vignette of vignettes.values())
{
    add_design_to_table(vignette, true, $);
}

for (const man_page of man_pages.values())
{
    if (!man_page.has_associated_vignette)
    {
        add_design_to_table(man_page, false, $);
    }
}

fs.writeFileSync(library_file_name, $.html());

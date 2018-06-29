"use strict";

const fs      = require("fs");
const path    = require("path");
const cheerio = require("cheerio");
const parse   = require("csv-parse/lib/sync");


const man_page_directory     = process.argv[3];
const vignette_directory     = process.argv[4];
const library_table_location = process.argv[5];
const library_table_rows     = parse(fs.readFileSync(library_table_location), {columns: true});

// The file name of one of HTML pages on the website. After we create a list of all the design library functions, we'll
// stick the table into this HTML page.
const library_file_name = process.argv[2];
const library_file_text = fs.readFileSync(library_file_name);
const $                 = cheerio.load(library_file_text);

// These hold one object per vignette/man page. Each object has information about its respective vignette/man page.
const designs_and_designers = new Map();
const vignettes             = new Map();

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

function extract_keywords(keywords, separator)
{
    if (!keywords)
    {
        return [];
    }

    keywords = keywords.split(separator);
    keywords = keywords.filter(keyword => keyword !== "");
    return keywords;
}

const man_page_file_names = fs.readdirSync(man_page_directory);

for (const man_page of man_page_file_names)
{
    const man_page_file_info = fs.statSync(path.join(man_page_directory, man_page));
    if (man_page_file_info.isDirectory() || !man_page.endsWith(".Rd"))
    {
        continue;
    }

    const metadata = {};

    const man_page_text_original = fs.readFileSync(path.join(man_page_directory, man_page), "utf8");
    let man_page_text            = man_page_text_original.replace(/[\n\t]/g, " ");

    const get_title_regex   = /\\title{\s*(.*?)\s*}/;
    const get_author_regex  = /\\author{\s*\\href{(.*?)}\s*{(.*?)}\s*}/;
    const get_concept_regex = /\\concept{\s*(.*?)\s*}/;

    metadata.title          = get_text_from_document(get_title_regex, man_page_text, 1);
    metadata.author         = get_text_from_document(get_author_regex, man_page_text, 2);
    metadata.author_website = get_text_from_document(get_author_regex, man_page_text, 1);

    // Replace all newlines and tabs within the original document with commas. This way, if there is a space character
    // within a keyword (e.g. "regression discontinuity), I can tell the difference between a newline in the original
    // document and a space within a keyword.
    man_page_text    = man_page_text_original.replace(/[\n\t]/g, ",");
    metadata.concept = extract_keywords(get_text_from_document(get_concept_regex, man_page_text, 1), ",");

    designs_and_designers.set(path.parse(man_page).name, metadata);
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


    const metadata = {};

    const vignette_page_text = fs.readFileSync(path.join(vignette_directory, vignette), "utf8");

    const get_title_regex = /title: *?"(.*?)"/;

    metadata.title = get_text_from_document(get_title_regex, vignette_page_text, 1);

    vignettes.set(path.parse(vignette).name, metadata);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Create and fill in the table
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function prettify_title(title)
{
    // Replace all spaces with underscores.
    title = title.replace(/_/g, " ");

    // Capitalize the first word of the title.
    title = title.charAt(0).toUpperCase() + title.slice(1);

    return title;
}

const table = $(`<table id="design_library_list">
    <thead>
    <tr>
        <th>Design</th>
        <th>Vignette</th>
        <th>Designer</th>
        <th>Design Inspector</th>
        <th>Example Design</th>
        <th>Contributor</th>
        <th>Keywords</th>
    </tr>
    </thead>
    <tbody>
    </tbody>
</table>`);

$("body > div > main > article").append(table);


function add_design_to_table(row)
{
    const table_row = $(`<tr></tr>`);


    // Add the DESIGN column.
    if (row.vignette)
    {
        table_row.append(`<td>${vignettes.get(row.vignette).title}</td>`);
    }
    else if (row.design)
    {
        table_row.append(`<td>${prettify_title(row.design)}</td>`);
    }
    else
    {
        table_row.append(`<td></td>`);
    }

    // Add the VIGNETTE column.
    if (row.vignette)
    {
        table_row.append(`<td class="text-center"><a href="/library/articles/${row.vignette}.html" data-toggle="tooltip" title="Read description of design"><span class="fab fa-readme fa-lg"></span></a></td>`);
    }
    else
    {
        table_row.append(`<td></td>`);
    }

    // Add the DESIGNER column.
    if (row.designer)
    {
        table_row.append(`<td class="text-center"><a href="/library/reference/${row.designer}.html" data-toggle="tooltip" title="Open designer function documentation"><span class="fas fa-pencil-alt fa-lg"></span></a></td>`);
    }
    else
    {
        table_row.append(`<td></td>`);
    }

    // Add the DESIGN INSPECTOR column.
    if (row.shiny)
    {
        table_row.append(`<td class="text-center"><a href="https://eos.wzb.eu/ipi/DDinspector/?import_library=${row.shiny}" data-toggle="tooltip" title="Go to design inspector"><span class="fas fa-info-circle fa-lg"></span></a></td>`);
    }
    else
    {
        table_row.append(`<td></td>`);
    }

    // Add the EXAMPLE DESIGN column.
    if (row.design)
    {
        table_row.append(`<td class="text-center"><a href="/library/designs/${row.design}.rda" data-toggle="tooltip" title="Download design"><span class="fas fa-download fa-lg"></span></a></td>`);
    }
    else
    {
        table_row.append(`<td></td>`);
    }

    // Add the CONTRIBUTOR column.
    if (row.author && row.author_url)
    {
        table_row.append(`<td><a href="${row.author_url}">${row.author}</a></td>`)
    }
    else
    {
        table_row.append(`<td>${row.author || ""}</td>`);
    }

    // Add the KEYWORDS column.
    // Combine all keywords from the CSV file, the designer, and the design. Adding and then immediately
    // extracting the keywords from the set is a trick to remove all duplicate keywords.
    const row_keywords    = extract_keywords(row.keywords, ",");
    let designer_keywords = [];

    if (designs_and_designers.get(row.designer))
    {
        designer_keywords = designs_and_designers.get(row.designer).concept;
    }

    let all_keywords = [...new Set(row_keywords.concat(designer_keywords))];
    all_keywords     = all_keywords.filter(keyword => keyword !== "");
    all_keywords     = all_keywords.join(", ");

    table_row.append(`<td>${all_keywords}</td>`);




    $("#design_library_list > tbody").append(table_row);
}


for (const row of library_table_rows)
{
    add_design_to_table(row);
}


fs.writeFileSync(library_file_name, $.html());

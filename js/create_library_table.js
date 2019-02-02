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
    const get_concept_regex = /\\concept{\s*(.*?)\s*}/g; // Global regex because there might be multiple matches.

    metadata.title          = get_text_from_document(get_title_regex, man_page_text, 1);
    metadata.author         = get_text_from_document(get_author_regex, man_page_text, 2);
    metadata.author_website = get_text_from_document(get_author_regex, man_page_text, 1);

    // Replace all newlines and tabs within the original document with commas. This way, if there is a space character
    // within a keyword (e.g. "regression discontinuity), I can tell the difference between a newline in the original
    // document and a space within a keyword.
    man_page_text    = man_page_text_original.replace(/[\n\t]/g, ",");
    metadata.concept = extract_keywords_from_array(get_text_from_document_multiple_matches(get_concept_regex, man_page_text, 1), ",");

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

const table = $(`<table id="design_library_list">
    <thead>
    <tr>
        <th>Design</th>
        <th>Vignette</th>
        <th>Designer</th>
        <th>Design Inspector</th>
        <th>Contributor</th>
        <th>Keywords</th>
    </tr>
    </thead>
    <tbody>
    </tbody>
</table>`);

$("body > div > main > article").append(table);

for (const row of library_table_rows)
{
    try
    {
        add_design_to_table(row);
    }
    catch (exception)
    {
        console.log("Something went wrong when building the library table. " +
            "See the documentation on the DeclareDesign.org GitHub wiki for tips on how to fix the problem.");
        throw exception;
    }

}

// Add a title to the reference page.
$("body > div > main > article").prepend(`<h1 class="article-title design_library_title">DesignLibrary</h1>`);

fs.writeFileSync(library_file_name, $.html());

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Helper Functions
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

function get_text_from_document_multiple_matches(your_regex, text, capturing_group_number)
{
    let regex_match;
    const all_matches = [];

    do
    {
        regex_match = your_regex.exec(text);
        if (regex_match)
        {
            all_matches.push(regex_match[capturing_group_number].trim());
        }
    } while (regex_match);

    return all_matches;
}

function extract_keywords_from_string(keywords, separator)
{
    if (!keywords)
    {
        return [];
    }

    keywords = keywords.split(separator);
    keywords = keywords.map(keyword => keyword.trim());
    keywords = keywords.filter(keyword => keyword !== "");
    return keywords;
}

function extract_keywords_from_array(keywords)
{
    if (!keywords)
    {
        return [];
    }

    keywords = keywords.map(keyword => keyword.trim());
    keywords = keywords.filter(keyword => keyword !== "");
    return keywords;
}

function add_design_to_table(row)
{
    const table_row = $(`<tr></tr>`);

    console.log(`Adding this row from the CSV file to the library table:
     ${JSON.stringify(row)}`);

    // Add the DESIGN column.
    console.log("Adding the DESIGN column.");

    if (row.design)
    {
        console.log("A design was specified. Using the name of the design for this column...");
        table_row.append(`<td>${title_caps(row.design)}</td>`);
    }
    else
    {
        console.log("No design was specified. This column will be empty.");
        table_row.append(`<td></td>`);
    }

    // Add the VIGNETTE column.
    console.log("Adding the VIGNETTE column.");

    if (row.vignette)
    {
        console.log("A vignette was specified. Adding a link to the vignette in this column...");
        table_row.append(`<td class="text-center"><a href="/library/articles/${row.vignette}.html" data-toggle="tooltip" title="Read description of design"><span class="fab fa-readme fa-lg"></span></a></td>`);
    }
    else
    {
        console.log("No vignette was specified.");
        table_row.append(`<td></td>`);
    }

    // Add the DESIGNER column.
    console.log("Adding the DESIGNER column.");

    if (row.designer)
    {
        console.log("A designer was specified. Adding a link to the designer in this column...");
        table_row.append(`<td class="text-center"><a href="/library/reference/${row.designer}.html" data-toggle="tooltip" title="Open designer function documentation"><span class="fas fa-pencil-alt fa-lg"></span></a></td>`);
    }
    else
    {
        console.log("No designer was specified.");
        table_row.append(`<td></td>`);
    }

    // Add the DESIGN INSPECTOR column.
    console.log("Adding the DESIGN INSPECTOR column.");

    if (row.shiny)
    {
        console.log("A link to the shiny app was specified. Adding the link in this column...");
        table_row.append(`<td class="text-center"><a href="https://eos.wzb.eu/ipi/DDinspector/?import_library=${row.shiny}" data-toggle="tooltip" title="Go to design inspector"><span class="fas fa-info-circle fa-lg"></span></a></td>`);
    }
    else
    {
        console.log("No link to the shiny app was specified.");
        table_row.append(`<td></td>`);
    }

    // Add the CONTRIBUTOR column.
    console.log("Adding the CONTRIBUTOR column.");

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
    console.log("Adding the KEYWORDS column.");

    const row_keywords    = extract_keywords_from_string(row.keywords, ",");
    let designer_keywords = [];

    if (designs_and_designers.get(row.designer))
    {
        designer_keywords = designs_and_designers.get(row.designer).concept;
    }

    let all_keywords = [...new Set(row_keywords.concat(designer_keywords))];
    all_keywords     = all_keywords.join(", ");

    table_row.append(`<td>${all_keywords}</td>`);


    $("#design_library_list > tbody").append(table_row);
}

/*
 * Title Caps
 *
 * Ported to JavaScript By John Resig - http://ejohn.org/ - 21 May 2008
 * Original by John Gruber - http://daringfireball.net/ - 10 May 2008
 * License: http://www.opensource.org/licenses/mit-license.php
 */

function title_caps(title)
{
    // First, replace all underscores with spaces.
    title = title.replace(/_/g, " ");

    const small = "(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|v[.]?|via|vs[.]?)";
    const punct = "([!\"#$%&'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]*)";

    const parts = [];
    const split = /[:.;?!] |(?: |^)["Ò]/g;
    let index   = 0;

    while (true)
    {
        const m = split.exec(title);

        parts.push(title.substring(index, m ? m.index : title.length)
                        .replace(/\b([A-Za-z][a-z.'Õ]*)\b/g, all => /[A-Za-z]\.[A-Za-z]/.test(all) ? all : upper(all))
                        .replace(RegExp("\\b" + small + "\\b", "ig"), lower)
                        .replace(RegExp("^" + punct + small + "\\b", "ig"), (all, punct, word) => punct + upper(word))
                        .replace(RegExp("\\b" + small + punct + "$", "ig"), upper));

        index = split.lastIndex;

        if (m)
        {
            parts.push(m[0]);
        }
        else
        {
            break;
        }
    }

    return parts.join("").replace(/ V(s?)\. /ig, " v$1. ")
                .replace(/(['Õ])S\b/ig, "$1s")
                .replace(/\b(AT&T|Q&A|IV)\b/ig, all => all.toUpperCase()); // Add abbreviations that you want to be
                                                                           // upper case here!

}

function lower(word)
{
    return word.toLowerCase();
}

function upper(word)
{
    return word.substr(0, 1).toUpperCase() + word.substr(1);
}
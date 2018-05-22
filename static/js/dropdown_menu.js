"use strict";

// Adapted from https://stackoverflow.com/a/48935028
function handle_dropdown(event)
{
    const dropdown = jQuery(event.target).closest('.dropdown');
    const menu     = jQuery('.dropdown-menu', dropdown);

    dropdown.addClass('show');
    menu.addClass('show');

    // In 300 milliseconds, check whether the mouse is over the menu. If it is, keep showing the menu with the
    // "show" class. If it's not, remove the "show" class. This prevents the menu from looking jittery.
    setTimeout(function ()
    {
        if (dropdown.is(':hover'))
        {
            dropdown.addClass("show");
            menu.addClass("show");
        }
        else
        {
            dropdown.removeClass("show");
            menu.removeClass("show");
        }

    }, 300);
}

// Add the "dropdown" class to the nav-item that you want to drop down.
jQuery(function ()
{
    jQuery("body").on("mouseenter mouseleave", ".dropdown", handle_dropdown);
});

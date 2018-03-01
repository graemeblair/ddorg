"use strict";

// Adapted from http://cssmenumaker.com/menu/responsive-flat-menu

function initializeMenu(options)
{
    const defaultOptions = {
        title: "Menu",
        format: "dropdown",
        sticky: false
    };

    const cssmenu  = jQuery("#cssmenu");
    const settings = jQuery.extend(defaultOptions, options); // Overwrite the default settings with our own options.

    // This code adds a hamburger menu button that shows up when the window becomes really narrow.
    cssmenu.prepend('<div id="menu-button">' + settings.title + '</div>');
    cssmenu.find("#menu-button").on("click", function ()
    {
        jQuery(this).toggleClass("menu-opened");

        const mainmenu = jQuery(this).next("ul");

        if (mainmenu.hasClass("open"))
        {
            mainmenu.hide();
            mainmenu.removeClass("open");
        }
        else
        {
            mainmenu.show();
            mainmenu.addClass("open");

            if (settings.format === "dropdown")
            {
                mainmenu.find("ul").show();
            }
        }
    });

    // This code sets up hiding and showing submenus.
    cssmenu.find("li ul").parent().addClass("has-sub");

    function multiTg()
    {
        cssmenu.find(".has-sub").prepend('<span class="submenu-button"></span>');
        cssmenu.find(".submenu-button").on("click", function ()
        {
            jQuery(this).toggleClass("submenu-opened");

            if (jQuery(this).siblings("ul").hasClass("open"))
            {
                jQuery(this).siblings("ul").removeClass("open").hide();
            }
            else
            {
                jQuery(this).siblings("ul").addClass("open").show();
            }
        });
    }

    if (settings.format === "multitoggle")
    {
        multiTg();
    }
    else
    {
        cssmenu.addClass("dropdown");
    }

    if (settings.sticky === true)
    {
        cssmenu.css("position", "fixed");
    }

    function resizeFix()
    {
        if (jQuery(window).width() > 768)
        {
            cssmenu.find("ul").show();
        }

        if (jQuery(window).width() <= 768)
        {
            cssmenu.find("ul").hide().removeClass("open");
        }
    }

    resizeFix();

    return jQuery(window).on("resize", resizeFix);
}


jQuery(function ()
{
    initializeMenu({title: "Menu", format: "multitoggle"});
});
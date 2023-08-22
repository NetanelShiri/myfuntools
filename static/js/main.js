(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Sidebar Toggler
    $(document).ready(function() {
        // Check if the sidebar has the 'start-closed' class
        if ($('.sidebar').hasClass('start-closed')) {
            // If it does, toggle the sidebar to the closed state
            $('.sidebar, .content').toggleClass("open");

        }

        // Sidebar Toggler
        $('.sidebar-toggler').click(function () {
            $('.sidebar, .content').toggleClass("open");
            $('footer').toggleClass('without-sidebar');

            return false;
        });



    });


})(jQuery);


<?php
/**
 * Template part for Working With Us - Tab Menu Navigation
 **/
?>
<script type="text/javascript">
jQuery(document).ready(function() {
        function open_tab() {
            if(window.location.hash){
                jQuery('li.tabs-title a').each(function(){
                    var hash = '#' + jQuery(this).attr('href').split('#')[1];
                    if(hash === window.location.hash){
                        jQuery(this).click();
                        jQuery(".nano").nanoScroller({ scroll: 'top' });
                    }
                });
            }
        }

        jQuery(window).bind('hashchange', function() {
            open_tab();
        });

        jQuery("li.tabs-title a").click(function(){
            var hash =jQuery(this).attr('href').split('#')[1];
            window.location.hash = hash;
            jQuery(".show-for-small-only li.accordion-item.is-active > a").click();
        });

        open_tab();
    });
</script>

<div class="row">
    <div class="tabs-wrap medium-4 columns">
        <div class="tab-accordion show-for-small-only">
            <ul class="accordion" data-accordion data-allow-all-closed="true">
                <li class="accordion-item is-active" data-accordion-item>
                    <a href="#" class="accordion-title"><h3><?php the_title();?><i class="fa fa-chevron-down"></i></h3></a>
                        <div class="accordion-content" data-tab-content>
                          <ul class="tabs vertical" data-tabs id="working-with-us">
                            <li class="tabs-title is-active"><a href="#working-with-us-overview" aria-selected="true">Working With Us<i class="fa fa-chevron-right"></i></a></li>
                            <li class="tabs-title"><a href="#college-counseling">College Counseling<i class="fa fa-chevron-right"></i></a></li>
                            <li class="tabs-title"><a href="#coxswain-program">Coxswain Program<i class="fa fa-chevron-right"></i></a></li>
                            <li class="tabs-title"><a href="#international-applicants">International Applicants<i class="fa fa-chevron-right"></i></a></li>
                            <li class="tabs-title"><a href="#gap-year-advising">Gap Year Advising<i class="fa fa-chevron-right"></i></a></li>
                            <li class="tabs-title"><a href="#reports-from-the-front">Reports From The Front<i class="fa fa-chevron-right"></i></a></li>
                            <li class="tabs-title"><a href="#our-approach">Our Approach<i class="fa fa-chevron-right"></i></a></li>
                            <li class="tabs-title"><a href="#counseling-testimonials">Counseling Testimonials<i class="fa fa-chevron-right"></i></a></li>
                            <li class="tabs-title"><a href="#rowing-camp-testimonials">Camp Testimonials<i class="fa fa-chevron-right"></i></a></li>
                            <li class="tabs-title"><a href="#coxswain-testimonials">Coxswain Testimonials<i class="fa fa-chevron-right"></i></a></li>
                          </ul>
                        </div>
                </li>
            </ul>
        </div>

        <div class="hide-for-small-only">
          <h3><?php the_title();?></h3>
          <ul class="tabs vertical" data-tabs id="working-with-us">
            <li class="tabs-title is-active"><a href="#working-with-us-overview" aria-selected="true">Working With Us<i class="fa fa-chevron-right"></i></a></li>
            <li class="tabs-title"><a href="#college-counseling">College Counseling<i class="fa fa-chevron-right"></i></a></li>
            <li class="tabs-title"><a href="#coxswain-program">Coxswain Program<i class="fa fa-chevron-right"></i></a></li>
            <li class="tabs-title"><a href="#international-applicants">International Applicants<i class="fa fa-chevron-right"></i></a></li>
            <li class="tabs-title"><a href="#gap-year-advising">Gap Year Advising<i class="fa fa-chevron-right"></i></a></li>
            <li class="tabs-title"><a href="#reports-from-the-front">Reports From The Front<i class="fa fa-chevron-right"></i></a></li>
            <li class="tabs-title"><a href="#our-approach">Our Approach<i class="fa fa-chevron-right"></i></a></li>
            <li class="tabs-title"><a href="#counseling-testimonials">Counseling Testimonials<i class="fa fa-chevron-right"></i></a></li>
            <li class="tabs-title"><a href="#rowing-camp-testimonials">Camp Testimonials<i class="fa fa-chevron-right"></i></a></li>
            <li class="tabs-title"><a href="#coxswain-testimonials">Coxswain Testimonials<i class="fa fa-chevron-right"></i></a></li>
          </ul>
        </div>
    </div>

    <div class="nano has-scrollbar tabs-content vertical medium-8 columns" data-tabs-content="working-with-us">
        <div class="nano-content">

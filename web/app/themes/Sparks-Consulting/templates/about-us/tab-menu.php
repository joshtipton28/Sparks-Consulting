<?php
/**
 * Template part for About Us - Tab Menu Navigation
 **/
?>
<div class="row">
    <div class="tabs-wrap medium-4 columns">
        <div class="tab-accordion show-for-small-only">
            <ul class="accordion" data-accordion  data-allow-all-closed="true">
                <li class="accordion-item is-active" data-accordion-item>
                    <a href="#" class="accordion-title"><h3><?php the_title();?><i class="fa fa-chevron-down"></i></h3></a>
                        <div class="accordion-content" data-tab-content>
                          <ul class="tabs vertical" data-tabs id="about-us">
                            <li class="tabs-title is-active"><a href="#overview" aria-selected="true">Overview<i class="fa fa-chevron-right"></i></a></li>
                            <li class="tabs-title"><a href="#leadership">Leadership<i class="fa fa-chevron-right"></i></a></li>
                            <li class="tabs-title"><a href="#counseling-associates">Counseling Associates<i class="fa fa-chevron-right"></i></a></li>
                            <li class="tabs-title"><a href="#coxing-associates">Coxing Associates<i class="fa fa-chevron-right"></i></a></li>
                            <li class="tabs-title"><a href="#international-associates">International Associates<i class="fa fa-chevron-right"></i></a></li>
                            <li class="tabs-title"><a href="#administrative-associates">Administrative Associates<i class="fa fa-chevron-right"></i></a></li>
                          </ul>
                        </div>
                </li>
            </ul>
        </div>

        <div class="hide-for-small-only">
            <h3 class="dark"><?php the_title();?></h3>
              <ul class="tabs vertical" data-tabs id="about-us">
                <li class="tabs-title is-active"><a href="#overview" aria-selected="true">Overview<i class="fa fa-chevron-right"></i></a></li>
                <li class="tabs-title"><a href="#leadership">Leadership<i class="fa fa-chevron-right"></i></a></li>
                <li class="tabs-title"><a href="#counseling-associates">Counseling Associates<i class="fa fa-chevron-right"></i></a></li>
                <li class="tabs-title"><a href="#coxing-associates">Coxing Associates<i class="fa fa-chevron-right"></i></a></li>
                <li class="tabs-title"><a href="#international-associates">International Associates<i class="fa fa-chevron-right"></i></a></li>
                <li class="tabs-title"><a href="#administrative-associates">Administrative Associates<i class="fa fa-chevron-right"></i></a></li>
              </ul>
        </div>
    </div>
    <div class="nano has-scrollbar tabs-content vertical medium-8 columns" data-tabs-content="about-us">
        <div class="nano-content">
<?php
/**
 * The template for displaying pages
 *
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages and that
 * other "pages" on your WordPress site will use a different template.
 *
 * @package WordPress
 * @subpackage FoundationPress
 * @since FoundationPress 1.0.0
 */

 get_header(); ?>


 <?php do_action( 'foundationpress_before_content' ); ?>
  <?php while ( have_posts() ) : the_post(); ?>

  <div class="full-bg">
    <?php if ( has_post_thumbnail() ) {
    the_post_thumbnail('full', array('class' => 'full-bg-img'));
    } ?>
  </div>
  <div class="page-wrap">

    <div class="row">
      <div class="nano has-scrollbar page-default large-8 large-centered columns">
            <div class="nano-content">
              <h2><?php the_title();?></h2>
                <hr>
              <?php the_content();?>

            </div>
          </div>
      </div>

  </div>
  
  <?php endwhile;?>

 <?php do_action( 'foundationpress_after_content' ); ?>

 <?php get_footer(); ?>

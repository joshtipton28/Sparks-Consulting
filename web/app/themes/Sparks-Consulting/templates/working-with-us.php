<?php
/*
Template Name: Working With Us
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
        
        <?php include(locate_template('templates/working-with-us/tab-menu.php' )); ?>
        <?php include(locate_template('templates/working-with-us/working-with-us.php' )); ?>
        <?php include(locate_template('templates/working-with-us/college-counseling.php' )); ?>
        <?php include(locate_template('templates/working-with-us/coxswain-program.php' )); ?>  
        <?php include(locate_template('templates/working-with-us/intl-applicants.php' )); ?> 
        <?php include(locate_template('templates/working-with-us/gap-year-advising.php' )); ?> 
        <?php include(locate_template('templates/working-with-us/reports-from-front.php' )); ?> 
        <?php include(locate_template('templates/working-with-us/our-approach.php' )); ?> 
        <?php include(locate_template('templates/working-with-us/counseling-testimonials.php' )); ?> 
        <?php include(locate_template('templates/working-with-us/camp-testimonials.php' )); ?> 
        <?php include(locate_template('templates/working-with-us/coxswain-testimonials.php' )); ?>    

    </div>
    
  <?php endwhile;?>

<?php do_action( 'foundationpress_after_content' ); ?>

<?php get_footer(); ?>
<?php
/*
Template Name: About Us
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
	    
	    <?php include(locate_template('templates/about-us/tab-menu.php' )); ?>
	    <?php include(locate_template('templates/about-us/overview.php' )); ?>
	    <?php include(locate_template('templates/about-us/leadership.php' )); ?>
	    <?php include(locate_template('templates/about-us/counseling-associates.php' )); ?>  
	    <?php include(locate_template('templates/about-us/coxing-associates.php' )); ?> 
	    <?php include(locate_template('templates/about-us/intl-associates.php' )); ?> 
	    <?php include(locate_template('templates/about-us/admin-associates.php' )); ?>   
	</div> 
    
  <?php endwhile;?>

<?php do_action( 'foundationpress_after_content' ); ?>


<?php get_footer(); ?>
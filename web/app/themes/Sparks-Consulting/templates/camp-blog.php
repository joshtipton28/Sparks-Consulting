<?php
/*
Template Name: Camp Blog
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
		  <?php include(locate_template('templates/camp-blog/tab-menu.php' )); ?>
		  <?php include(locate_template('templates/camp-blog/all-posts.php' )); ?>
		  <?php include(locate_template('templates/camp-blog/holland.php' )); ?>
		  <?php include(locate_template('templates/camp-blog/sparks-summer-camp.php' )); ?>
		  <?php include(locate_template('templates/camp-blog/coxswains-only.php' )); ?>
		  <?php include(locate_template('templates/camp-blog/florida-winter-camps.php' )); ?>
		  <?php include(locate_template('templates/camp-blog/new-zealand.php' )); ?>
		  <?php include(locate_template('templates/camp-blog/advanced-physiology.php' )); ?>
		</div>

  	<?php endwhile;?>

<?php do_action( 'foundationpress_after_content' ); ?>


<?php get_footer(); ?>
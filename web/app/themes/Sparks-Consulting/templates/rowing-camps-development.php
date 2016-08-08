<?php
/*
Template Name: Rowing Camps - Development Program
*/
get_header(); ?>	

<?php while ( have_posts() ) : the_post(); ?>

<div class="full-bg">
	<?php if ( has_post_thumbnail() ) {
	the_post_thumbnail('full', array('class' => 'full-bg-img'));
	} ?>
</div>

<div class="page-wrap">

	<div class="row">

		<?php include(locate_template('parts/rowing-camps-menu.php' )); ?>

		<div class="nano has-scrollbar tabs-content large-8 columns">
	        <div class="nano-content tab-block">
	        	<h2><?php the_title(); ?></h2>
	        		<hr>
	        	<?php the_content(); ?>

	        </div>
        </div>
    </div>

</div>

  <?php endwhile;?>
<?php do_action( 'foundationpress_after_content' ); ?>


<?php get_footer(); ?>

<?php
/*
Template Name: Affiliates
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
		<div class="nano has-scrollbar page-default large-8 large-centered columns">
	        <div class="nano-content">
	        	<h2><?php the_title(); ?></h2>
	        		<hr>
	        	<?php the_content(); ?>

	        	<?php

					// check if the repeater field has rows of data
					if( have_rows('afilliates_repeater') ):

					 	// loop through the rows of data
					    while ( have_rows('afilliates_repeater') ) : the_row(); ?>
							
							<hr>

					        <h3>
					        	<a href="<?php the_sub_field('affiliate_url'); ?>" target="_blank">
					        		<?php the_sub_field('affiliate_title'); ?>
					        	</a>
					        </h3>

					        <?php the_sub_field('affiliate_description'); ?>

					    <?php endwhile;

					else :

					    // no rows found

					endif;

				?>

	        </div>
        </div>
    </div>

</div>

  <?php endwhile;?>
<?php do_action( 'foundationpress_after_content' ); ?>


<?php get_footer(); ?>

<?php
/*
Template Name: Rowing Camps
*/
get_header(); ?>
	<div class="full-bg">
		<?php if ( has_post_thumbnail() ) {
		the_post_thumbnail('full', array('class' => 'full-bg-img'));
		} ?>
	</div>
	<div class="page-wrap">

	  <div class="row">
	    <?php include(locate_template('parts/rowing-camps-menu.php' )); ?>

	    	<?php if ( have_posts() ) : ?>
				<?php while ( have_posts() ) : the_post(); ?>
					<?php $content = get_the_content(); ?>
					<?php if (!empty($content) ): ?>
			        	<div class="camps-tab tabs-content nano has-scrollbar large-8 columns end" data-tabs-content="rowing-camp-tabs">
					        <div class="nano-content">
					        	<h2><?php the_title(); ?></h2>
					        	<hr>

									<?php the_content(); ?>

					        </div>
				        </div>
				    <?php endif; ?>
		    	<?php endwhile; ?>
			<?php endif; ?>


	</div>

<?php do_action( 'foundationpress_after_content' ); ?>

<?php get_footer(); ?>

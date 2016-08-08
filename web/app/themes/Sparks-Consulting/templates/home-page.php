<?php
/*
Template Name: Home Page
*/
get_header(); ?>

<?php do_action( 'foundationpress_before_content' ); ?>
<?php while ( have_posts() ) : the_post(); ?>
	<div class="full-bg">

		<?php
	    $smallsrc = wp_get_attachment_image_src( get_post_thumbnail_id($post->ID), 'large' );
	    $largesrc = wp_get_attachment_image_src( get_post_thumbnail_id($post->ID), 'full-bg-img' );
		?>

		<img src="<?php $smallsrc[0]; ?>" data-interchange="[<?php echo $smallsrc[0]; ?>, small], [<?php echo $largesrc[0]; ?>, medium]">

	</div>
	<div class="page-wrap">
		<?php do_action( 'foundationpress_page_before_entry_content' ); ?>
			<div class="row">
				<div class="jumbotron">
					<h1><?php the_field('page_heading'); ?></h1>
				</div>
				<div class="home-blurb large-3 small-10 small-offset-1 columns end">
					<?php the_content(); ?>
				</div>
			</div>
	</div>
<?php endwhile;?>
<?php do_action( 'foundationpress_after_content' ); ?>


<?php get_footer(); ?>

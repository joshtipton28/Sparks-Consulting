<?php
/**
 * The template for displaying all single posts and attachments
 * Individual templates are located in templates/rowing-camps
 */

get_header(); ?>

<div class="full-bg">
    <?php echo get_the_post_thumbnail( '7', 'full' ); ?>
        <img src="<?php header_image(); ?>" width="<?php echo HEADER_IMAGE_WIDTH; ?>" height="<?php echo HEADER_IMAGE_HEIGHT; ?>" class="full-bg-img" alt="<?php the_title();?>" />
</div>

<div class="page-wrap">
	<div class="row">
		<?php include(locate_template('templates/reports-from-the-front/tab-menu.php' )); ?>
		<?php include(locate_template('templates/reports-from-the-front/rff-single.php' )); ?>
	</div>
</div>

<?php get_footer(); ?>

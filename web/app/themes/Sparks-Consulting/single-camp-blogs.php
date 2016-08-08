<?php
/**
 * The template for displaying all single posts and attachments
 * Individual templates are located in templates/rowing-camps
 */

get_header(); ?>

<div class="full-bg">
        <?php echo get_the_post_thumbnail( '4794', 'full' ); ?>
            <img src="<?php header_image(); ?>" width="<?php echo HEADER_IMAGE_WIDTH; ?>" height="<?php echo HEADER_IMAGE_HEIGHT; ?>" class="full-bg-img" alt="<?php the_title();?>" />
    </div>

<div class="page-wrap">

	<?php include(locate_template('templates/camp-blog/single-tab-menu.php' )); ?>
	<?php include(locate_template('templates/camp-blog/camp-blog-single.php' )); ?>

</div>

<?php get_footer(); ?>
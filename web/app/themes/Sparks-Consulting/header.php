<?php
/**
 * The template for displaying the header
 *
 * Displays all of the head element and everything up until the "container" div.
 *
 * @package WordPress
 * @subpackage FoundationPress
 * @since FoundationPress 1.0.0
 */

?>
<!doctype html>
<html class="no-js" <?php language_attributes(); ?> >
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<link rel="icon" href="<?php echo get_stylesheet_directory_uri(); ?>/assets/images/icons/favicon.ico" type="image/x-icon">
		<link rel="apple-touch-icon-precomposed" sizes="144x144" href="<?php echo get_stylesheet_directory_uri(); ?>/assets/images/icons/apple-touch-icon-144x144-precomposed.png">
		<link rel="apple-touch-icon-precomposed" sizes="114x114" href="<?php echo get_stylesheet_directory_uri(); ?>/assets/images/icons/apple-touch-icon-114x114-precomposed.png">
		<link rel="apple-touch-icon-precomposed" sizes="72x72" href="<?php echo get_stylesheet_directory_uri(); ?>/assets/images/icons/apple-touch-icon-72x72-precomposed.png">
		<link rel="apple-touch-icon-precomposed" href="<?php echo get_stylesheet_directory_uri(); ?>/assets/images/icons/apple-touch-icon-precomposed.png">
		<link href='https://fonts.googleapis.com/css?family=Open+Sans:400,300,600,700|Roboto+Slab:400,700|Days+One' rel='stylesheet' type='text/css'>

		<script>
	        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	         (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

	        ga('create', 'UA-13277703-1', 'auto');
	        ga('send', 'pageview');
        </script>

		<?php wp_head(); ?>
	</head>
	<body <?php body_class(); ?>>
	<?php do_action( 'foundationpress_after_body' ); ?>

	<?php if ( get_theme_mod( 'wpt_mobile_menu_layout' ) == 'offcanvas' ) : ?>
	<div class="off-canvas-wrapper">
		<div class="off-canvas-wrapper-inner" data-off-canvas-wrapper>
		<?php get_template_part( 'parts/mobile-off-canvas' ); ?>
	<?php endif; ?>

	<?php do_action( 'foundationpress_layout_start' ); ?>

	<?php if (is_page_template( 'templates/journal-home.php' ))
				get_template_part( 'parts/journal-nav' );
			elseif (is_singular('journal-article'))
				get_template_part( 'parts/journal-nav' );
			elseif (is_page_template('templates/journal-category.php'))
				get_template_part( 'parts/journal-nav' );
			else
				get_template_part( 'parts/main-nav' );?>

	<section class="container">
		<?php do_action( 'foundationpress_after_header' ); ?>

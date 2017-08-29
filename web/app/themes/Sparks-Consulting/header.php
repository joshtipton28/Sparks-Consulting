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
		<link rel="icon" href="/app/themes/Sparks-Consulting/assets/images/icons/favicon.ico" type="image/x-icon">
		<link rel="apple-touch-icon-precomposed" sizes="144x144" href="/app/themes/Sparks-Consulting/assets/images/icons/apple-touch-icon-144x144-precomposed.png">
		<link rel="apple-touch-icon-precomposed" sizes="114x114" href="/app/themes/Sparks-Consulting/assets/images/icons/apple-touch-icon-114x114-precomposed.png">
		<link rel="apple-touch-icon-precomposed" sizes="72x72" href="/app/themes/Sparks-Consulting/assets/images/icons/apple-touch-icon-72x72-precomposed.png">
		<link rel="apple-touch-icon-precomposed" href="/app/themes/Sparks-Consulting/assets/images/icons/apple-touch-icon-precomposed.png">

    <!-- Google Fonts: Open Sans -->
    <link href='https://fonts.googleapis.com/css?family=Open+Sans:400,300,600,700|Roboto+Slab:400,700|Days+One' rel='stylesheet' type='text/css'>

		<!-- Google Tag Manager -->
                <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-M39MQGP');</script>
                <!-- End Google Tag Manager -->

		<?php wp_head(); ?>
	</head>
	<body <?php body_class(); ?>>
            <!-- Google Tag Manager (noscript) -->
            <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-M39MQGP"
            height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
            <!-- End Google Tag Manager (noscript) -->
            
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

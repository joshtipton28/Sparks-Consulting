<?php
/**
 * Template part for RowingDB
 *
 * @package WordPress
 * @subpackage FoundationPress
 * @since FoundationPress 1.0.0
 */

?>

<div class="rowingdb-header header-container">
	<div class="row">
		<header id="masthead" class="site-header" role="banner">
			<div class="title-bar" data-responsive-toggle="site-navigation">
				<button class="menu-icon" type="button" data-toggle="offCanvas"></button>
				<div class="title-bar-title">
					<a href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home">Rowing <span>Database</span></a>
				</div>
			</div>

			<nav id="site-navigation" class="main-navigation top-bar" role="navigation">
				<div class="top-bar-left">
					<a href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home">
						<img class="rowingdb-sparks-logo" src="<?php echo get_stylesheet_directory_uri();?>/assets/images/rowingdb-sparks-logo.png" alt="Sparks Consulting">
					</a>
					<a href="<?php echo esc_url( home_url( '/rowingdb' ) ); ?>" rel="home">
						<img class="rowingdb-logo" src="<?php echo get_stylesheet_directory_uri();?>/assets/images/rowingdb-logo.png" alt="Sparks Rowing Database">
					</a>
				</div>
				<div class="top-bar-right journal-nav">
				<?php foundationpress_top_bar_r();?>

					<?php if ( ! get_theme_mod( 'wpt_mobile_menu_layout' ) || get_theme_mod( 'wpt_mobile_menu_layout' ) == 'topbar' ) : ?>
						<?php get_template_part( 'parts/mobile-top-bar' ); ?>
					<?php endif; ?>
					<a class="journal-learn-more" data-open="journal-learn-more">Learn More</a>
				</div>
			</nav>
		</header>
	</div>
</div>
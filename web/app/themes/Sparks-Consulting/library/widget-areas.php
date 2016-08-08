<?php
/**
 * Register widget areas
 *
 * @package WordPress
 * @subpackage FoundationPress
 * @since FoundationPress 1.0.0
 */

if ( ! function_exists( 'foundationpress_sidebar_widgets' ) ) :
function foundationpress_sidebar_widgets() {
	register_sidebar(array(
	  'id' => 'sidebar-widgets',
	  'name' => __( 'Sidebar widgets', 'foundationpress' ),
	  'description' => __( 'Drag widgets to this sidebar container.', 'foundationpress' ),
	  'before_widget' => '<article id="%1$s" class="row widget %2$s"><div class="small-12 columns">',
	  'after_widget' => '</div></article>',
	  'before_title' => '<h6>',
	  'after_title' => '</h6>',
	));

	register_sidebar(array(
	  'id' => 'footer-widgets',
	  'name' => __( 'Footer widgets', 'foundationpress' ),
	  'description' => __( 'Drag widgets to this footer container', 'foundationpress' ),
	  'before_widget' => '<article id="%1$s" class="footer-widget widget %2$s">',
	  'after_widget' => '</article>',
	  'before_title' => '<h6>',
	  'after_title' => '</h6>',
	));

	register_sidebar(array(
	  'id' => 'summer-menu',
	  'name' => __( 'Summer Camps Menu', 'foundationpress' ),
	  'description' => __( 'Drag widgets to this container', 'foundationpress' ),
	  'before_widget' => '<div class="camps-menu accordion-content" data-tab-content>',
	  'after_widget' => '</div>',
	  'before_title' => '<a class="accordion-title">',
	  'after_title' => '</a>',
	));

	register_sidebar(array(
	  'id' => 'winter-menu',
	  'name' => __( 'Winter Camps Menu', 'foundationpress' ),
	  'description' => __( 'Drag widgets to this container', 'foundationpress' ),
	  'before_widget' => '<div class="camps-menu accordion-content" data-tab-content>',
	  'after_widget' => '</div>',
	  'before_title' => '<a class="accordion-title">',
	  'after_title' => '</a>',
	));

	register_sidebar(array(
	  'id' => 'development-programs-menu',
	  'name' => __( 'Development Programs Menu', 'foundationpress' ),
	  'description' => __( 'Drag widgets to this container', 'foundationpress' ),
	  'before_widget' => '<div class="camps-menu accordion-content" data-tab-content>',
	  'after_widget' => '</div>',
	  'before_title' => '<a class="accordion-title">',
	  'after_title' => '</a>',
	));
}

add_action( 'widgets_init', 'foundationpress_sidebar_widgets' );
endif;
?>

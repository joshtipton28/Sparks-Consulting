<?php
/**
 * Register Custom Taxonomies Used for Sparksconsult.com
 **/

add_action( 'init', 'sparks_settings_camp_blog_category' );
function sparks_settings_camp_blog_category() {
	$labels = array(
		"name" => __( 'Camp Blog Categories', '' ),
		"singular_name" => __( 'Camp Blog Category', '' ),
		);

	$args = array(
		"label" => __( 'Camp Blog Categories', '' ),
		"labels" => $labels,
		"public" => true,
		"hierarchical" => true,
		"label" => "Camp Blog Categories",
		"show_ui" => true,
		"show_in_menu" => true,
		"show_in_nav_menus" => true,
		"query_var" => true,
		"rewrite" => array( 'slug' => 'camp-blog', 'with_front' => true, ),
		"show_admin_column" => false,
		"show_in_rest" => false,
		"rest_base" => "",
		"show_in_quick_edit" => true,
	);
	register_taxonomy( "camp-blog-category", array( "camp-blogs" ), $args );
}

//Taxonomies for Sparks Journal

add_action( 'init', 'sparks_settings_journal_category' );
function sparks_settings_journal_category() {
	$labels = array(
		"name" => __( 'Journal Categories', '' ),
		"singular_name" => __( 'Journal Category', '' ),
		);

	$args = array(
		"label" => __( 'Journal Categories', '' ),
		"labels" => $labels,
		"public" => true,
		"hierarchical" => true,
		"label" => "Journal Categories",
		"show_ui" => true,
		"show_in_menu" => true,
		"show_in_nav_menus" => true,
		"query_var" => true,
		"rewrite" => array( 'slug' => 'journal-category', 'with_front' => true, ),
		"show_admin_column" => false,
		"show_in_rest" => false,
		"rest_base" => "",
		"show_in_quick_edit" => false,
	);
	register_taxonomy( "journal-category", array( "journal-article" ), $args );
}

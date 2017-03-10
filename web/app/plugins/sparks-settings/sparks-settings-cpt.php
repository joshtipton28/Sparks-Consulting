<?php
/**
 * Register Custom Post Types Used for Sparks Consulting Site Settings
 **/

add_action( 'init', 'sparks_settings_cpts_camp_blogs' );
function sparks_settings_cpts_camp_blogs() {
	$labels = array(
		"name" => __( 'Camp Blogs', '' ),
		"singular_name" => __( 'Camp Blog', '' ),
		);

	$args = array(
		"label" => __( 'Camp Blogs', '' ),
		"labels" => $labels,
		"description" => "",
		"public" => true,
		"publicly_queryable" => false,
		"show_ui" => true,
		"show_in_rest" => false,
		"rest_base" => "",
		"has_archive" => false,
		"show_in_menu" => false,
		"exclude_from_search" => false,
		"capability_type" => "post",
		"map_meta_cap" => true,
		"hierarchical" => false,
		"rewrite" => array( "slug" => "camp-blogs", "with_front" => true ),
		"query_var" => true,
		"supports" => array( "title", "editor", "thumbnail", "revisions", "author" ),
		"taxonomies" => array( "category", "post_tag", "camp-blog-category" ),
			);
	register_post_type( "camp-blogs", $args );
}

add_action( 'init', 'sparks_settings_cpts_rff' );
function sparks_settings_cpts_rff() {
	$labels = array(
		"name" => __( 'Reports From The Front', '' ),
		"singular_name" => __( 'Report From The Front', '' ),
		"menu_name" => __( 'RFF', '' ),
		);

	$args = array(
		"label" => __( 'Reports From The Front', '' ),
		"labels" => $labels,
		"description" => "",
		"public" => true,
		"publicly_queryable" => false,
		"show_ui" => true,
		"show_in_rest" => false,
		"rest_base" => "",
		"has_archive" => false,
		"show_in_menu" => false,
		"exclude_from_search" => false,
		"capability_type" => "post",
		"map_meta_cap" => true,
		"hierarchical" => false,
		"rewrite" => array( "slug" => "reports-from-the-front", "with_front" => true ),
		"query_var" => true,
		"supports" => array( "title", "editor", "revisions", "author" ),
		"taxonomies" => array( "category", "post_tag" ),
			);
	register_post_type( "rff", $args );
}

// Sparks Journal Custom Post Type
add_action( 'init', 'sparks_settings_cpts_journal_article' );
function sparks_settings_cpts_journal_article() {
	$labels = array(
		"name" => __( 'Journal Articles', '' ),
		"singular_name" => __( 'Journal Article', '' ),
		"menu_name" => __( 'Sparks Journal', '' ),
		);

	$args = array(
		"label" => __( 'Journal Articles', '' ),
		"labels" => $labels,
		"description" => "",
		"public" => true,
//		"publicly_queryable" => false,
		"show_ui" => true,
		"show_in_rest" => false,
		"rest_base" => "",
		"has_archive" => false,
		"show_in_menu" => false,
		"exclude_from_search" => false,
		"capability_type" => "post",
		"map_meta_cap" => true,
		"hierarchical" => true,
		"rewrite" => array( "slug" => "journal/article", "with_front" => true ),
		"query_var" => true,
		"supports" => array( "title", "editor", "thumbnail", "trackbacks", "revisions", "author" ),
		"taxonomies" => array( "category", "post_tag", "journal-category" ),
			);
	register_post_type( "journal-article", $args );
}

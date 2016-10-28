<?php
/**
 * Register Custom Post Types Used for Rowing Camps App Functionality on Sparksconsult.com
 **/

add_action( 'init', 'rowing_camps_cpts_rowing_camp' );
function rowing_camps_cpts_rowing_camp() {
	$labels = array(
		"name" => __( 'Rowing Camps', '' ),
		"singular_name" => __( 'Rowing Camp', '' ),
		"menu_name" => __( 'Rowing Camps', '' ),
		"all_items" => __( 'All Camp Listings', '' ),
		);

	$args = array(
		"label" => __( 'Rowing Camps', '' ),
		"labels" => $labels,
		"description" => "",
		"public" => true,
		"publicly_queryable" => true,
		"show_ui" => true,
		"show_in_rest" => false,
		"rest_base" => "",
		"has_archive" => false,
		"show_in_menu" => true,
		'menu_icon'         	=> 'dashicons-megaphone',
		"exclude_from_search" => false,
		"capability_type" => "post",
		"map_meta_cap" => true,
		"hierarchical" => false,
		"rewrite" => array( "slug" => "rowing-camps", "with_front" => true ),
		"query_var" => true,
		"supports" => array( "title", "revisions", "author", "editor" ),
		"taxonomies" => array( "" ),
			);
	register_post_type( "rowing-camp", $args );
}

//Adding Camp Staff Post Type
add_action( 'init', 'rowing_camps_cpts_camp_staff' );
function rowing_camps_cpts_camp_staff() {
	$labels = array(
		"name" => __( 'Camp Staff', '' ),
		"singular_name" => __( 'Camp Staff', '' ),
		);

	$args = array(
		"label" => __( 'Camp Staff', '' ),
		"labels" => $labels,
		"description" => "",
		"public" => true,
		"publicly_queryable" => false,
		"show_ui" => true,
		"show_in_rest" => false,
		"rest_base" => "",
		"has_archive" => false,
		"show_in_menu" => 'edit.php?post_type=rowing-camp',
		"exclude_from_search" => false,
		"capability_type" => "post",
		"map_meta_cap" => true,
		"hierarchical" => false,
		"rewrite" => array( "slug" => "camp_staff", "with_front" => true ),
		"query_var" => true,
		"supports" => array( "title", "editor", "thumbnail", "revisions" ),					);
	register_post_type( "camp_staff", $args );
}

//Adding Camp Schedule Post Type
add_action( 'init', 'rowing_camps_cpts_camp_schedule' );
function rowing_camps_cpts_camp_schedule() {
	$labels = array(
		"name" => __( 'Camp Schedules', '' ),
		"singular_name" => __( 'Camp Schedule', '' ),
		);

	$args = array(
		"label" => __( 'Camp Schedule', '' ),
		"labels" => $labels,
		"description" => "",
		"public" => true,
		"publicly_queryable" => false,
		"show_ui" => true,
		"show_in_rest" => false,
		"rest_base" => "",
		"has_archive" => false,
		"show_in_menu" => 'edit.php?post_type=rowing-camp',
		"exclude_from_search" => false,
		"capability_type" => "post",
		"map_meta_cap" => true,
		"hierarchical" => false,
		"rewrite" => array( "slug" => "camp_schedule", "with_front" => true ),
		"query_var" => true,
		"supports" => array( "title", "editor", "thumbnail", "revisions" ),					);
	register_post_type( "camp_schedule", $args );
}

//Adding Camp Details Post Type
add_action( 'init', 'rowing_camps_cpts_camp_details' );
function rowing_camps_cpts_camp_details() {
	$labels = array(
		"name" => __( 'Camp Details', '' ),
		"singular_name" => __( 'Camp Details', '' ),
		);

	$args = array(
		"label" => __( 'Camp Details', '' ),
		"labels" => $labels,
		"description" => "",
		"public" => true,
		"publicly_queryable" => false,
		"show_ui" => true,
		"show_in_rest" => false,
		"rest_base" => "",
		"has_archive" => false,
		"show_in_menu" => 'edit.php?post_type=rowing-camp',
		"exclude_from_search" => false,
		"capability_type" => "post",
		"map_meta_cap" => true,
		"hierarchical" => false,
		"rewrite" => array( "slug" => "camp_details", "with_front" => true ),
		"query_var" => true,
		"supports" => array( "title", "editor", "thumbnail", "revisions" ),					);
	register_post_type( "camp_details", $args );
}
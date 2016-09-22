<?php
/**
 * Register Custom Taxonomies Used for Rowing Database App
 **/

function rowdb_register_taxonomies() {

	$singular = 'Men\'s Division';
	$plural = 'Men\'s Divisions';

	$labels = array(
		'name'              => _x( $plural, 'taxonomy general name', 'textdomain' ),
		'singular_name'     => _x( $singular, 'taxonomy singular name', 'textdomain' ),
		'search_items'      => __( 'Search ' . $plural, 'textdomain' ),
		'all_items'         => __( 'All ' . $plural, 'textdomain' ),
		'parent_item'       => __( 'Parent ' . $singular, 'textdomain' ),
		'parent_item_colon' => __( 'Parent ' . $singular . ':', 'textdomain' ),
		'edit_item'         => __( 'Edit ' . $singular, 'textdomain' ),
		'update_item'       => __( 'Update ' . $singular, 'textdomain' ),
		'add_new_item'      => __( 'Add New ' . $singular, 'textdomain' ),
		'new_item_name'     => __( 'New ' . $singular, 'textdomain' ),
		'menu_name'         => __( $plural, 'textdomain' ),
	);

	$args = array(
		'hierarchical'      => true,
		'labels'            => $labels,
		'show_ui'           => true,
		'show_in_menu'		=> false,
		'show_admin_column' => true,
		'query_var'         => true,
		'rewrite'           => array( 'slug' => 'rowingdb/division' ),
	);

	register_taxonomy( 'mens-division', array( 'school' ), $args );

	$singular = 'Women\'s Division';
	$plural = 'Women\'s Divisions';

	$labels = array(
		'name'              => _x( $plural, 'taxonomy general name', 'textdomain' ),
		'singular_name'     => _x( $singular, 'taxonomy singular name', 'textdomain' ),
		'search_items'      => __( 'Search ' . $plural, 'textdomain' ),
		'all_items'         => __( 'All ' . $plural, 'textdomain' ),
		'parent_item'       => __( 'Parent ' . $singular, 'textdomain' ),
		'parent_item_colon' => __( 'Parent ' . $singular . ':', 'textdomain' ),
		'edit_item'         => __( 'Edit ' . $singular, 'textdomain' ),
		'update_item'       => __( 'Update ' . $singular, 'textdomain' ),
		'add_new_item'      => __( 'Add New ' . $singular, 'textdomain' ),
		'new_item_name'     => __( 'New ' . $singular, 'textdomain' ),
		'menu_name'         => __( $plural, 'textdomain' ),
	);

	$args = array(
		'hierarchical'      => true,
		'labels'            => $labels,
		'show_ui'           => true,
		'show_in_menu'		=> false,
		'show_admin_column' => true,
		'query_var'         => true,
		'rewrite'           => array( 'slug' => 'rowingdb/division' ),
	);

	register_taxonomy( 'womens-division', array( 'school' ), $args );

	// Environments Taxonomy

	$singular = 'Environment';
	$plural = 'Environments';

	$labels = array(
		'name'              => _x( $plural, 'taxonomy general name', 'textdomain' ),
		'singular_name'     => _x( $singular, 'taxonomy singular name', 'textdomain' ),
		'search_items'      => __( 'Search ' . $plural, 'textdomain' ),
		'all_items'         => __( 'All ' . $plural, 'textdomain' ),
		'parent_item'       => __( 'Parent ' . $singular, 'textdomain' ),
		'parent_item_colon' => __( 'Parent ' . $singular . ':', 'textdomain' ),
		'edit_item'         => __( 'Edit ' . $singular, 'textdomain' ),
		'update_item'       => __( 'Update ' . $singular, 'textdomain' ),
		'add_new_item'      => __( 'Add New ' . $singular, 'textdomain' ),
		'new_item_name'     => __( 'New ' . $singular, 'textdomain' ),
		'menu_name'         => __( $plural, 'textdomain' ),
	);

	$args = array(
		'hierarchical'      => true,
		'labels'            => $labels,
		'show_ui'           => true,
		'show_in_menu'		=> false,
		'show_admin_column' => true,
		'query_var'         => true,
		'rewrite'           => array( 'slug' => 'rowingdb/environment' ),
	);

	register_taxonomy( 'environment', array( 'school' ), $args );

	// Selectivity Taxonomy

	$singular = 'Selectivity';
	$plural = 'Selectivities';

	$labels = array(
		'name'              => _x( $plural, 'taxonomy general name', 'textdomain' ),
		'singular_name'     => _x( $singular, 'taxonomy singular name', 'textdomain' ),
		'search_items'      => __( 'Search ' . $plural, 'textdomain' ),
		'all_items'         => __( 'All ' . $plural, 'textdomain' ),
		'parent_item'       => __( 'Parent ' . $singular, 'textdomain' ),
		'parent_item_colon' => __( 'Parent ' . $singular . ':', 'textdomain' ),
		'edit_item'         => __( 'Edit ' . $singular, 'textdomain' ),
		'update_item'       => __( 'Update ' . $singular, 'textdomain' ),
		'add_new_item'      => __( 'Add New ' . $singular, 'textdomain' ),
		'new_item_name'     => __( 'New ' . $singular, 'textdomain' ),
		'menu_name'         => __( $plural, 'textdomain' ),
	);

	$args = array(
		'hierarchical'      => true,
		'labels'            => $labels,
		'show_ui'           => true,
		'show_in_menu'		=> false,
		'show_admin_column' => true,
		'query_var'         => true,
		'rewrite'           => array( 'slug' => 'rowingdb/selectivity' ),
	);

	register_taxonomy( 'selectivity', array( 'school' ), $args );

	// Religious Affiliations Taxonomy

	$singular = 'Religious Affiliation';
	$plural = 'Religious Affiliations';

	$labels = array(
		'name'              => _x( $plural, 'taxonomy general name', 'textdomain' ),
		'singular_name'     => _x( $singular, 'taxonomy singular name', 'textdomain' ),
		'search_items'      => __( 'Search ' . $plural, 'textdomain' ),
		'all_items'         => __( 'All ' . $plural, 'textdomain' ),
		'parent_item'       => __( 'Parent ' . $singular, 'textdomain' ),
		'parent_item_colon' => __( 'Parent ' . $singular . ':', 'textdomain' ),
		'edit_item'         => __( 'Edit ' . $singular, 'textdomain' ),
		'update_item'       => __( 'Update ' . $singular, 'textdomain' ),
		'add_new_item'      => __( 'Add New ' . $singular, 'textdomain' ),
		'new_item_name'     => __( 'New ' . $singular, 'textdomain' ),
		'menu_name'         => __( $plural, 'textdomain' ),
	);

	$args = array(
		'hierarchical'      => true,
		'labels'            => $labels,
		'show_ui'           => true,
		'show_in_menu'		=> false,
		'show_admin_column' => true,
		'query_var'         => true,
		'rewrite'           => array( 'slug' => 'rowingdb/religious-affiliation' ),
	);

	register_taxonomy( 'religion', array( 'school' ), $args );

	// College Majors Taxonomy

	$singular = 'Major';
	$plural = 'Majors';

	$labels = array(
		'name'              => _x( $plural, 'taxonomy general name', 'textdomain' ),
		'singular_name'     => _x( $singular, 'taxonomy singular name', 'textdomain' ),
		'search_items'      => __( 'Search ' . $plural, 'textdomain' ),
		'all_items'         => __( 'All ' . $plural, 'textdomain' ),
		'parent_item'       => __( 'Parent ' . $singular, 'textdomain' ),
		'parent_item_colon' => __( 'Parent ' . $singular . ':', 'textdomain' ),
		'edit_item'         => __( 'Edit ' . $singular, 'textdomain' ),
		'update_item'       => __( 'Update ' . $singular, 'textdomain' ),
		'add_new_item'      => __( 'Add New ' . $singular, 'textdomain' ),
		'new_item_name'     => __( 'New ' . $singular, 'textdomain' ),
		'menu_name'         => __( $plural, 'textdomain' ),
	);

	$args = array(
		'hierarchical'      => true,
		'labels'            => $labels,
		'show_ui'           => true,
		'show_in_menu'		=> false,
		'show_admin_column' => true,
		'query_var'         => true,
		'rewrite'           => array( 'slug' => 'rowingdb/major' ),
	);

	register_taxonomy( 'major', array( 'school' ), $args );

	// Food Services Taxonomy

	$singular = 'Food Service';
	$plural = 'Food Services';

	$labels = array(
		'name'              => _x( $plural, 'taxonomy general name', 'textdomain' ),
		'singular_name'     => _x( $singular, 'taxonomy singular name', 'textdomain' ),
		'search_items'      => __( 'Search ' . $plural, 'textdomain' ),
		'all_items'         => __( 'All ' . $plural, 'textdomain' ),
		'parent_item'       => __( 'Parent ' . $singular, 'textdomain' ),
		'parent_item_colon' => __( 'Parent ' . $singular . ':', 'textdomain' ),
		'edit_item'         => __( 'Edit ' . $singular, 'textdomain' ),
		'update_item'       => __( 'Update ' . $singular, 'textdomain' ),
		'add_new_item'      => __( 'Add New ' . $singular, 'textdomain' ),
		'new_item_name'     => __( 'New ' . $singular, 'textdomain' ),
		'menu_name'         => __( $plural, 'textdomain' ),
	);

	$args = array(
		'hierarchical'      => true,
		'labels'            => $labels,
		'show_ui'           => true,
		'show_in_menu'		=> false,
		'show_admin_column' => true,
		'query_var'         => true,
		'rewrite'           => array( 'slug' => 'rowingdb/food-service' ),
	);

	register_taxonomy( 'food', array( 'school' ), $args );

	// Housing Type Taxonomy

	$singular = 'Housing Type';
	$plural = 'Housing Types';

	$labels = array(
		'name'              => _x( $plural, 'taxonomy general name', 'textdomain' ),
		'singular_name'     => _x( $singular, 'taxonomy singular name', 'textdomain' ),
		'search_items'      => __( 'Search ' . $plural, 'textdomain' ),
		'all_items'         => __( 'All ' . $plural, 'textdomain' ),
		'parent_item'       => __( 'Parent ' . $singular, 'textdomain' ),
		'parent_item_colon' => __( 'Parent ' . $singular . ':', 'textdomain' ),
		'edit_item'         => __( 'Edit ' . $singular, 'textdomain' ),
		'update_item'       => __( 'Update ' . $singular, 'textdomain' ),
		'add_new_item'      => __( 'Add New ' . $singular, 'textdomain' ),
		'new_item_name'     => __( 'New ' . $singular, 'textdomain' ),
		'menu_name'         => __( $plural, 'textdomain' ),
	);

	$args = array(
		'hierarchical'      => true,
		'labels'            => $labels,
		'show_ui'           => true,
		'show_in_menu'		=> false,
		'show_admin_column' => true,
		'query_var'         => true,
		'rewrite'           => array( 'slug' => 'rowingdb/housing-type' ),
	);

	register_taxonomy( 'housing-type', array( 'school' ), $args );

	// Housing Sub-Type Taxonomy

	$singular = 'Housing Sub-Type';
	$plural = 'Housing Sub-Type';

	$labels = array(
		'name'              => _x( $plural, 'taxonomy general name', 'textdomain' ),
		'singular_name'     => _x( $singular, 'taxonomy singular name', 'textdomain' ),
		'search_items'      => __( 'Search ' . $plural, 'textdomain' ),
		'all_items'         => __( 'All ' . $plural, 'textdomain' ),
		'parent_item'       => __( 'Parent ' . $singular, 'textdomain' ),
		'parent_item_colon' => __( 'Parent ' . $singular . ':', 'textdomain' ),
		'edit_item'         => __( 'Edit ' . $singular, 'textdomain' ),
		'update_item'       => __( 'Update ' . $singular, 'textdomain' ),
		'add_new_item'      => __( 'Add New ' . $singular, 'textdomain' ),
		'new_item_name'     => __( 'New ' . $singular, 'textdomain' ),
		'menu_name'         => __( $plural, 'textdomain' ),
	);

	$args = array(
		'hierarchical'      => true,
		'labels'            => $labels,
		'show_ui'           => true,
		'show_in_menu'		=> false,
		'show_admin_column' => true,
		'query_var'         => true,
		'rewrite'           => array( 'slug' => 'rowingdb/housing-sub-type' ),
	);

	register_taxonomy( 'housing-sub-type', array( 'school' ), $args );


}

// hook into the init action and call rowdb_register_taxonomies when it fires
add_action( 'init', 'rowdb_register_taxonomies', 0 );
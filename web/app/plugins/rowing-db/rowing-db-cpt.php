<?php
/**
 * Register Custom Post Types Used for Rowing Database App
 **/

function rowdb_register_post_type() {

	$singular = 'School';
	$plural = 'Schools';

	$labels = array(
		'name' 					=> 	'Rowing Database',
		'singular_name' 		=> 	$singular,
		'add_name' 				=> 	'Add New' . $singular,
		'add_new_item' 			=> 	'Add New ' . $singular,
		'edit' 					=>	'Edit',
		'edit_item'				=> 	'Edit ' . $singular,
		'new_item'				=> 	'New ' . $singular,
		'view'					=> 	'View ' . $singular,
		'view_item'				=>	'View ' . $singular,
		'search_term'			=>	'Search ' . $plural,
		'parent'				=> 	'Parent ' . $singular,
		'not_found'				=>	'No ' . $plural . ' found',
		'not_found_in_trash'	=>	'No' . $plural . ' in Trash'
	);

	$args = array(
		'labels'            	=> $labels,
		'public'            	=> true,
		'publicly_queryable'	=> true,
		'exclude_from_search'	=> false,
		'show_in_nav_menus' 	=> false,
		'show_ui'           	=> true,
		'show_in_menu'			=> true,
		'show_in_admin_bar' 	=> true,
		'menu_position'     	=> 20,
		'show_in_rest'       => true,
  		'rest_base'          => 'schools-api',
		'menu_icon'         	=> 'dashicons-welcome-learn-more',
		'query_var'         	=> true,
		'hierarchical'      	=> true,
		'has_archive'       	=> false,
		'capability_type'		=> 'post',
		'rewrite'           	=> array(
			'slug' 		 => 'rowingdb/rowing-teams',
			'with_front' => 'true'
		),
		'supports'          	=> array(
			'title',
			'thumbnail',
			'editor'
		)
	);

	register_post_type( 'school', $args );
}

add_action( 'init', 'rowdb_register_post_type' );
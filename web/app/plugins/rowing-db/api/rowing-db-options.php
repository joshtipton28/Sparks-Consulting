<?php
//Adding Submenu page for all Search Filter Terms
add_action('admin_menu', 'register_submenu_page');

function register_submenu_page() {
    add_submenu_page(
    	'edit.php?post_type=school',
    	'Search Filters',
    	'Search Filters',
    	'manage_options',
    	'rowing-db\rowing-db-options.php',
		'myplugin_admin_page'
    );
}

function myplugin_admin_page(){
	?>
	<div class="wrap">
		<h2>Select a Filter to Edit</h2>

		<a href="/wp-admin/edit-tags.php?taxonomy=mens-division&post_type=school">View/Add Men's Divisions
		</a>
		<br>
		<a href="/wp-admin/edit-tags.php?taxonomy=womens-division&post_type=school">View/Add Women's Divisions
		</a>
		<br>
		<a href="/wp-admin/edit-tags.php?taxonomy=environment&post_type=school">View/Add Environments
		</a>
		<br>
		<a href="/wp-admin/edit-tags.php?taxonomy=selectivity&post_type=school">View/Add Selectivities
		</a>
		<br>
		<a href="/wp-admin/edit-tags.php?taxonomy=religion&post_type=school">View/Add Religious Affiliations
		</a>
		<br>
		<a href="/wp-admin/edit-tags.php?taxonomy=major&post_type=school">View/Add Majors
		</a>
		<br>
		<a href="/wp-admin/edit-tags.php?taxonomy=food&post_type=school">View/Add Food Services
		</a>
		<br>
		<a href="/wp-admin/edit-tags.php?taxonomy=housing-type&post_type=school">View/Add Housing Types
		</a>
		<br>
		<a href="/wp-admin/edit-tags.php?taxonomy=housing-sub-type&post_type=school">View/Add Housing Sub-Types
		</a>
	</div>
	<?php
}

// Setting up ACF fields in REST API
add_filter('json_prepare_post', 'json_api_encode_acf');

function json_api_encode_acf($post) {

    $acf = get_fields($post['ID']);

    if (isset($post)) {
      $post['acf'] = $acf;
    }

    return $post;

}

<?php
/**
 * Custom Functions and Features for Sparksconsult.com
 **/

//Custom Menu for Sparks Blogs
add_action('admin_menu', 'sparks_settings_register_blogs_menu_page');

function sparks_settings_register_blogs_menu_page() {
    add_menu_page(
    	__( 'Sparks Blogs', 'textdomain' ),
    	'Sparks Blogs',
    	'manage_options',
    	'sparks-blogs',
    	'sparks_blogs_admin_page',
		'dashicons-welcome-write-blog',
		2
    );
}

function sparks_blogs_admin_page(){
	?>
	<div class="wrap">
		<h2>Please Select Blog from the Sub-Menus</h2>
	</div>
	<?php
}

// Submenu for Sparks Blogs
add_action('admin_menu', 'sparks_settings_register_submenu_page');
function sparks_settings_register_submenu_page() {
    add_submenu_page(
    	'sparks-blogs',
    	'Reports From the Front',
    	'Reports From the Front',
    	'manage_options',
    	'edit.php?post_type=rff',
		''
    );

    add_submenu_page(
    	'sparks-blogs',
    	'Camp Blogs',
    	'Camp Blogs',
    	'manage_options',
    	'edit.php?post_type=camp-blogs',
		''
    );
    add_submenu_page(
    	'sparks-blogs',
    	'Sparks Journal',
    	'Sparks Journal',
    	'manage_options',
    	'edit.php?post_type=journal-article',
		''
    );
}

//Removing Clutter from WP Admin Menu
add_action( 'admin_menu', 'sparks_remove_menus', 999);

function sparks_remove_menus(){

  //remove_menu_page( 'index.php' );                  //Dashboard
  remove_menu_page( 'jetpack' );                    //Jetpack*
  remove_menu_page( 'edit.php' );                   //Posts
  //remove_menu_page( 'upload.php' );                 //Media
  //remove_menu_page( 'edit.php?post_type=page' );    //Pages
  remove_menu_page( 'edit-comments.php' );          //Comments
  //remove_menu_page( 'themes.php' );                 //Appearance
  //remove_menu_page( 'plugins.php' );                //Plugins
  //remove_menu_page( 'users.php' );                  //Users
  //remove_menu_page( 'tools.php' );                  //Tools
  //remove_menu_page( 'options-general.php' );        //Settings
  remove_submenu_page( 'sparks-blogs', 'sparks-blogs' ); //Unneeded Menu Item
  remove_menu_page( 'essb_options' );   //Easy Social Share Menu Link
  remove_menu_page( 'all-in-one-seo-pack/aioseop_class.php' );   //SEO Plugin
}
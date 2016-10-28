<?php
/**
 * Plugin Name: Rowing Camps
 * Plugin URI: http://blue-bot.com
 * Description: This plugin provides all functionality for the Rowing Camps App
 * Author: Josh Tipton
 * Author URI: http://blue-bot.com
 * Version: 1.0
 * License: GPLv2
 */

//Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
require ( plugin_dir_path(__FILE__) . 'rowing-camps-terms.php' );
require ( plugin_dir_path(__FILE__) . 'rowing-camps-cpt.php' );
<?php
/**
 * Plugin Name: Sparks Consulting Settings
 * Plugin URI: http://blue-bot.com
 * Description: This plugin provides custom functionality for Sparksconsult.com.
 * Author: Josh Tipton
 * Author URI: http://blue-bot.com
 * Version: 1.0
 * License: GPLv2
 */

//Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
require ( plugin_dir_path(__FILE__) . 'sparks-settings-terms.php' );
require ( plugin_dir_path(__FILE__) . 'sparks-settings-cpt.php' );
require ( plugin_dir_path(__FILE__) . 'sparks-settings-options.php' );
require ( plugin_dir_path(__FILE__) . 'sparks-settings-duplicator.php' );
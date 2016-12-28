<?php

if ( ! defined( 'ABSPATH' ) ) {
	die( '-1' );
}


if (!function_exists('essb_manager')) {
	function essb_manager() {
		return ESSB_Manager::getInstance();
	}
}

if (!function_exists('essb_core')) {
	function essb_core() {
		return essb_manager()->essb();
	}
}

if (!function_exists('essb_resource_builder')) {
	function essb_resource_builder() {
		return essb_manager()->resourceBuilder();
	}
}

if (!function_exists('easy_share_deactivate')) {
	function easy_share_deactivate() {
		essb_manager()->deactiveExecution();
	}
}

if (!function_exists('easy_share_reactivate')) {
	function easy_share_reactivate() {
		essb_manager()->reactivateExecution();
	}
}

if (!function_exists('essb_native_privacy')) {
	function essb_native_privacy() {
		return essb_manager()->privacyNativeButtons();
	}
}

if (!function_exists ('essb_options_value')) {
	function essb_options_value($param, $default = '') {
		return essb_option_value($param);
	}
}

if (!function_exists('essb_options_bool_value')) {
	function essb_options_bool_value($param) {
		return essb_option_bool_value($param);
	}
}

if (!function_exists('essb_options')) {
	function essb_options() {
		return essb_manager()->essbOptions();
	}
}

if (!function_exists('essb_followers_counter')) {
	function essb_followers_counter() {
		return essb_manager()->socialFollowersCounter();
	}
}

if (!function_exists('essb_is_mobile')) {
	function essb_is_mobile() {
		return essb_manager()->isMobile();
	}
}

if (!function_exists('essb_is_tablet')) {
	function essb_is_tablet() {
		return essb_manager()->isTablet();
	}
}

if (!function_exists('essb_is_plugin_activated_on')) {
	function essb_is_plugin_activated_on() {
		if (is_admin()) {
			return;
		}
		
		//display_deactivate_on
		$is_activated = false;
		$display_include_on = essb_options_value('display_include_on');
		if ($display_include_on != "") {
			$excule_from = explode(',', $display_include_on);
	
			$excule_from = array_map('trim', $excule_from);
			if (in_array(get_the_ID(), $excule_from, false)) {
				$is_activated = true;
			}
		}
		return $is_activated;
	}
}

if (!function_exists('essb_is_plugin_deactivated_on')) {
	function essb_is_plugin_deactivated_on() {
		if (is_admin()) {
			return;
		}
		
		//display_deactivate_on
		$is_deactivated = false;
		$display_deactivate_on = essb_options_value('display_deactivate_on');
		if ($display_deactivate_on != "") {
			$excule_from = explode(',', $display_deactivate_on);
				
			$excule_from = array_map('trim', $excule_from);
			if (in_array(get_the_ID(), $excule_from, false)) {
				$is_deactivated = true;
			}
		}
		
		return $is_deactivated;
	}
}

if (!function_exists('essb_is_module_deactivated_on')) {
	function essb_is_module_deactivated_on($module = 'share') {
		if (is_admin()) {
			return;
		}
		
		$is_deactivated = false;
		$exclude_from = essb_options_value( 'deactivate_on_'.$module);
		if (!empty($exclude_from)) {
			$excule_from = explode(',', $exclude_from);
		
			$excule_from = array_map('trim', $excule_from);
			if (in_array(get_the_ID(), $excule_from, false)) {
				$is_deactivated = true;
			}
		}
		return $is_deactivated;
	}
}

if (!function_exists('essb_option_bool_value')) {
	function essb_option_bool_value($param, $options = null) {
		global $essb_options;
		
		if (!$options || !is_array($options)) {
			$options = $essb_options;
		}
		
		$value = isset ( $options [$param] ) ? $options [$param]  : 'false';
		
		if ($value == "true") {
			return true;
		}
		else {
			return false;
		}
	}
}

if (!function_exists('essb_option_value')) {
	function essb_option_value($param, $options = null) {
		global $essb_options;

		if (!$options || !is_array($options)) {
			$options = $essb_options;
		}

		return isset($options[$param]) ? $options[$param] : '';
	}
}

if (!function_exists('essb_object_value')) {
	function essb_object_value($object, $param, $default = '') {
		return isset($object[$param]) ? $object[$param] : ($default != '' ? $default : '');
	}
}

if (!function_exists('essb_is_test')) {
	function essb_is_test() {
		$automated_test = isset($_REQUEST['P3_NOCACHE']) ? $_REQUEST['P3_NOCACHE'] : '';
		if ($automated_test != '') {
			return true;
		}
		else {
			return false;
		}
	}
}

if (!function_exists('essb_depend_load_function')) {
	function essb_depend_load_function($function, $path) {
		if (!function_exists($function)) {
			include_once ESSB3_PLUGIN_ROOT.$path;
		}
	}
}

if (!function_exists('essb_depend_load_class')) {
	function essb_depend_load_class($class, $path) {
		if (!class_exists($class)) {
			include_once ESSB3_PLUGIN_ROOT.$path;
		}
	}
}

if (!function_exists('essb_installed_wpml')) {
	function essb_installed_wpml() {
		if (class_exists ( "SitePress" ))
			return (true);
		else
			return (false);
	}
}

if (!function_exists('essb_installed_polylang')) {
	function essb_installed_polylang() {
		if (function_exists('pll_languages_list')) {
			return true;
		}
		else {
			return false;
		}
	}
}
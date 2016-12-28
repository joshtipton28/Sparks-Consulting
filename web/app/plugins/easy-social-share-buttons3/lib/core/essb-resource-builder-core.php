<?php

// building custom filters for handling everytime loaded resources;
define('ESSB_RESOURCE_BUILDER_FOLDER', ESSB3_PLUGIN_ROOT . 'lib/core/resource-snippets/');

add_filter('essb_js_buffer_head', 'essb_js_build_admin_ajax_access_code');
add_filter('essb_js_buffer_footer', 'essb_js_build_window_open_code');

// CSS filters
add_filter('essb_css_buffer_footer', 'essb_css_build_footer_css');
add_filter('essb_css_buffer_head', 'essb_css_build_customizer');
add_filter('essb_css_buffer_head', 'essb_css_build_compile_display_locations_code');


function essb_css_build_compile_display_locations_code($buffer) {
	$custom_sidebarpos = essb_option_value('sidebar_fixedtop');
	$custom_appearance_pos = essb_option_value('sidebar_leftright_percent');
	$custom_sidebar_leftright = essb_option_value('sidebar_fixedleft');

    $snippet = '';

	if ($custom_sidebarpos != '') {
		$snippet .= ('.essb_displayed_sidebar_right, .essb_displayed_sidebar { top: '.$custom_sidebarpos.' !important;}');
	}
	if ($custom_appearance_pos != '') {
		$snippet .= ('.essb_displayed_sidebar_right, .essb_displayed_sidebar { display: none; -webkit-transition: all 0.5s; -moz-transition: all 0.5s;-ms-transition: all 0.5s;-o-transition: all 0.5s;transition: all 0.5s;}');
	}
	if ($custom_sidebar_leftright != '') {
		$snippet .= '.essb_displayed_sidebar { left: '.$custom_sidebar_leftright.'px !important; } .essb_displayed_sidebar_right { right: '.$custom_sidebar_leftright.'!important;}';
	}

	// topbar customizations
	$topbar_top_pos = essb_option_value('topbar_top');
	$topbar_top_loggedin = essb_option_value('topbar_top_loggedin');

	$topbar_bg_color = essb_option_value('topbar_bg');
	$topbar_bg_color_opacity = essb_option_value('topbar_bg_opacity');
	$topbar_maxwidth = essb_option_value('topbar_maxwidth');
	$topbar_height = essb_option_value('topbar_height');
	$topbar_contentarea_width = essb_option_value('topbar_contentarea_width');
	if ($topbar_contentarea_width == '' && essb_option_bool_value('topbar_contentarea')) {
		$topbar_contentarea_width = '30';
	}

	$topbar_top_onscroll = essb_option_value('topbar_top_onscroll');

	if (is_user_logged_in() && $topbar_top_loggedin != '') {
		$topbar_top_pos = $topbar_top_loggedin;
	}

	if ($topbar_bg_color_opacity != '' && $topbar_bg_color == '') {
		$topbar_bg_color = '#ffffff';
	}

	if ($topbar_top_pos != '') {
		$snippet .= (sprintf('.essb_topbar { top: %1$spx !important; }', $topbar_top_pos));
	}
	if ($topbar_bg_color != '') {
		if ($topbar_bg_color_opacity != '') {
			$topbar_bg_color = essb_hex2rgba($topbar_bg_color, $topbar_bg_color_opacity);
		}
		$snippet .= (sprintf('.essb_topbar { background: %1$s !important; }', $topbar_bg_color));
	}
	if ($topbar_maxwidth != '') {
		$snippet .= (sprintf('.essb_topbar .essb_topbar_inner { max-width: %1$spx; margin: 0 auto; padding-left: 0px; padding-right: 0px;}', $topbar_maxwidth));
	}
	if ($topbar_height != '') {
		$snippet .= (sprintf('.essb_topbar { height: %1$spx; }', $topbar_height));
	}
	if ($topbar_contentarea_width != '') {
		$topbar_contentarea_width = str_replace('%', '', $topbar_contentarea_width);
		$topbar_contentarea_width = intval($topbar_contentarea_width);
			
		$topbar_buttonarea_width = 100 - $topbar_contentarea_width;
		$snippet .= (sprintf('.essb_topbar .essb_topbar_inner_buttons { width: %1$s; }', $topbar_buttonarea_width.'%'));
		$snippet .= (sprintf('.essb_topbar .essb_topbar_inner_content { width: %1$s; }', $topbar_contentarea_width.'%'));
	}

	if ($topbar_top_onscroll != '') {
		$snippet .= ('.essb_topbar { margin-top: -200px; }');
	}

	// end: topbar customizations

	// bottombar customizations

	$topbar_bg_color = essb_option_value('bottombar_bg');
	$topbar_bg_color_opacity = essb_option_value('bottombar_bg_opacity');
	$topbar_maxwidth = essb_option_value('bottombar_maxwidth');
	$topbar_height = essb_option_value('bottombar_height');
	$topbar_contentarea_width = essb_option_value('bottombar_contentarea_width');
	if ($topbar_contentarea_width == '' && essb_option_bool_value('bottombar_contentarea')) {
		$topbar_contentarea_width = '30';
	}

	$topbar_top_onscroll = essb_option_value('bottombar_top_onscroll');

	if ($topbar_bg_color_opacity != '' && $topbar_bg_color == '') {
		$topbar_bg_color = '#ffffff';
	}

	if ($topbar_bg_color != '') {
		if ($topbar_bg_color_opacity != '') {
			$topbar_bg_color = essb_hex2rgba($topbar_bg_color, $topbar_bg_color_opacity);
		}
		$snippet .= (sprintf('.essb_bottombar { background: %1$s !important; }', $topbar_bg_color));
	}
	if ($topbar_maxwidth != '') {
		$snippet .= (sprintf('.essb_bottombar .essb_bottombar_inner { max-width: %1$spx; margin: 0 auto; padding-left: 0px; padding-right: 0px;}', $topbar_maxwidth));
	}
	if ($topbar_height != '') {
		$snippet .= (sprintf('.essb_bottombar { height: %1$spx; }', $topbar_height));
	}
	if ($topbar_contentarea_width != '') {
		$topbar_contentarea_width = str_replace('%', '', $topbar_contentarea_width);
		$topbar_contentarea_width = intval($topbar_contentarea_width);

		$topbar_buttonarea_width = 100 - $topbar_contentarea_width;
		$snippet .= (sprintf('.essb_bottombar .essb_bottombar_inner_buttons { width: %1$s; }', $topbar_buttonarea_width.'%'));
		$snippet .= (sprintf('.essb_bottombar .essb_bottombar_inner_content { width: %1$s; }', $topbar_contentarea_width.'%'));
	}

	if ($topbar_top_onscroll != '') {
		$snippet .= ('.essb_bottombar { margin-bottom: -200px; }');
	}

	// end: bottombar customizations

	// float from top customizations
	$top_pos = essb_option_value('float_top');
	$float_top_loggedin = essb_option_value('float_top_loggedin');

	$bg_color = essb_option_value('float_bg');
	$bg_color_opacity = essb_option_value('float_bg_opacity');
	$float_full = essb_option_value('float_full');
	$float_remove_margin = essb_option_value('float_remove_margin');
	$float_full_maxwidth = essb_option_value('float_full_maxwidth');

	if (is_user_logged_in() && $float_top_loggedin != '') {
		$top_pos = $float_top_loggedin;
	}

	if ($bg_color_opacity != '' && $bg_color == '') {
		$bg_color = '#ffffff';
	}

	if ($top_pos != '') {
		$snippet .= (sprintf('.essb_fixed { top: %1$spx !important; }', $top_pos));
	}
	if ($bg_color != '') {
		if ($bg_color_opacity != '') {
			$bg_color = essb_hex2rgba($bg_color, $bg_color_opacity);
		}
		$snippet .= (sprintf('.essb_fixed { background: %1$s !important; }', $bg_color));
	}

	if ($float_full == 'true') {
		$snippet .= ('.essb_fixed { left: 0; width: 100%; min-width: 100%; padding-left: 10px; }');
	}
	if ($float_remove_margin == 'true') {
		$snippet .= ('.essb_fixed { margin: 0px !important; }');
	}

	if ($float_full_maxwidth != '') {
		$snippet .= (sprintf('.essb_fixed.essb_links ul { max-width: %1$spx; margin: 0 auto !important; } .essb_fixed { padding-left: 0px; }', $float_full_maxwidth));
	}
	// end: float from top

	// postfloat

	$postfloat_marginleft = essb_option_value('postfloat_marginleft');
	$postfloat_margintop = essb_option_value('postfloat_margintop');
	$postfloat_top = essb_option_value('postfloat_top');
	$postfloat_percent = essb_option_value('postfloat_percent');
	$postfloat_initialtop = essb_option_value('postfloat_initialtop');

	if ($postfloat_marginleft != '') {
		$snippet .= (sprintf('.essb_displayed_postfloat { margin-left: %1$spx !important; }', $postfloat_marginleft));
	}
	if ($postfloat_margintop != '') {
		$snippet .= (sprintf('.essb_displayed_postfloat { margin-top: %1$spx !important; }', $postfloat_margintop));
	}
	if ($postfloat_top != '') {
		$snippet .= (sprintf('.essb_displayed_postfloat.essb_postfloat_fixed { top: %1$spx !important; }', $postfloat_top));
	}
	if ($postfloat_initialtop != '') {
		$snippet .= (sprintf('.essb_displayed_postfloat { top: %1$spx !important; }', $postfloat_initialtop));
	}
	if ($postfloat_percent != '') {
		$snippet .= ('.essb_displayed_postfloat { opacity: 0; }');
	}

	// end: postfloat

	return $buffer.$snippet;
}


function essb_css_build_customizer($buffer) {
		
	$is_active = essb_option_bool_value('customizer_is_active');
	
	$snippet = '';
	if ($is_active) {
		if (!function_exists('essb_rs_css_build_customizer')) {
			include_once (ESSB_RESOURCE_BUILDER_FOLDER . 'essb_rs_css_build_customizer.php');
		}
			
		$snippet .= essb_rs_css_build_customizer();
	}
	
	$is_active_subscribe = essb_option_bool_value('activate_mailchimp_customizer');
	$is_active_subscribe2 = essb_option_bool_value( 'activate_mailchimp_customizer2');
	$is_active_subscribe3 = essb_option_bool_value('activate_mailchimp_customizer3');
	$is_active_subscribe4 = essb_option_bool_value('activate_mailchimp_customizer4');
	$is_active_subscribe5 = essb_option_bool_value('activate_mailchimp_customizer5');
	$is_active_subscribe6 = essb_option_bool_value('activate_mailchimp_customizer6');
	$is_active_subscribe7 = essb_option_bool_value('activate_mailchimp_customizer7');
	if ($is_active_subscribe || $is_active_subscribe2 || $is_active_subscribe3 || $is_active_subscribe4 ||
			$is_active_subscribe5 || $is_active_subscribe6 || $is_active_subscribe7) {
		if (!function_exists('essb_rs_css_build_customizer_mailchimp')) {
			include_once (ESSB_RESOURCE_BUILDER_FOLDER . 'essb_rs_css_build_customizer_mailchimp.php');
		}
	
		$snippet .= (essb_rs_css_build_customizer_mailchimp(array("design1" => $is_active_subscribe,
				"design2" => $is_active_subscribe2,
				"design3" => $is_active_subscribe3,
				"design4" => $is_active_subscribe4,
				"design5" => $is_active_subscribe5,
				"design6" => $is_active_subscribe6,
				"design7" => $is_active_subscribe7)));
	}
	
	
	$global_user_defined_css = essb_option_value('customizer_css');
	
	
	if ($global_user_defined_css != '') {
		$global_user_defined_css = stripslashes ( $global_user_defined_css );
		$snippet .= $global_user_defined_css;
	}
	
	
	return $buffer.$snippet;
}

function essb_css_build_footer_css($buffer) {

	$global_user_defined_css = essb_option_value('customizer_css_footer');
	if ($global_user_defined_css != '') {
		$global_user_defined_css = stripslashes ( $global_user_defined_css );
	}
	return $buffer.$global_user_defined_css;
}

function essb_js_build_admin_ajax_access_code($buffer) {
	$code_options = array();
	$code_options['ajax_url'] = admin_url ('admin-ajax.php');
	$code_options['essb3_nonce'] = wp_create_nonce('essb3_ajax_nonce');
	$code_options['essb3_plugin_url'] = ESSB3_PLUGIN_URL;
	$code_options['essb3_facebook_total'] = essb_option_bool_value('facebooktotal');
	$code_options['essb3_admin_ajax'] = essb_option_bool_value('force_counters_admin');
	$code_options['essb3_internal_counter'] = essb_option_bool_value('active_internal_counters');
	$code_options['essb3_stats'] = essb_option_bool_value('stats_active');
	$code_options['essb3_ga'] = essb_option_bool_value('activate_ga_tracking');
	$code_options['essb3_ga_mode'] = essb_option_value('ga_tracking_mode');
	$code_options['essb3_counter_button_min'] = intval(essb_option_value('button_counter_hidden_till'));
	$code_options['essb3_counter_total_min'] = intval(essb_option_value('total_counter_hidden_till'));
	$code_options['blog_url'] = get_site_url().'/';
	$code_options['ajax_type'] = essb_option_value('force_counters_admin_type');
	$code_options['essb3_postfloat_stay'] = essb_option_bool_value('postfloat_always_visible');
	$code_options['essb3_no_counter_mailprint'] = essb_option_bool_value('deactive_internal_counters_mail');
	$code_options['essb3_single_ajax'] = essb_option_bool_value('force_counters_admin_single');
	$code_options['twitter_counter'] = essb_option_value('twitter_counters');
	$code_options['post_id'] = get_the_ID();

	$postfloat_top = essb_option_value('postfloat_top');
	if (!empty($postfloat_top)) {
		$code_options['postfloat_top'] = $postfloat_top;
	}

	$hide_float_from_top = essb_option_value('float_top_disappear');
	if (!empty($hide_float_from_top)) {
		$code_options['hide_float'] = $hide_float_from_top;
	}
	$top_pos = essb_option_value('float_top');
	$float_top_loggedin = essb_option_value('float_top_loggedin');
	if (is_user_logged_in() && $float_top_loggedin != '') {
		$top_pos = $float_top_loggedin;
	}
	if (!empty($top_pos)) {
		$code_options['float_top'] = $top_pos;
	}

	$output = 'var essb_settings = '.json_encode($code_options).';';

	if (defined('ESSB3_CACHED_COUNTERS')) {
		if (ESSBGlobalSettings::$cached_counters_cache_mode) {
			$update_url = essb_get_current_page_url();
			$output .= 'var essb_buttons_exist = !!document.getElementsByClassName("essb_links"); if(essb_buttons_exist == true) { document.addEventListener("DOMContentLoaded", function(event) { var ESSB_CACHE_URL = "'.$update_url.'"; if(ESSB_CACHE_URL.indexOf("?") > -1) { ESSB_CACHE_URL += "&essb_counter_cache=rebuild"; } else { ESSB_CACHE_URL += "?essb_counter_cache=rebuild"; }; var xhr = new XMLHttpRequest(); xhr.open("GET",ESSB_CACHE_URL,true); xhr.send(); });}';
		}
	}

	return $buffer.$output;
}

function essb_js_build_window_open_code($buffer) {
	$script = '
	var essb_window = function(oUrl, oService, oInstance) {
	var element = jQuery(\'.essb_\'+oInstance);
	var instance_post_id = jQuery(element).attr("data-essb-postid") || "";
	var instance_position = jQuery(element).attr("data-essb-position") || "";
	var wnd;
	var w = 800 ; var h = 500;
	if (oService == "twitter") {
	w = 500; h= 300;
}
var left = (screen.width/2)-(w/2);
var top = (screen.height/2)-(h/2);

if (oService == "twitter") {
wnd = window.open( oUrl, "essb_share_window", "height=300,width=500,resizable=1,scrollbars=yes,top="+top+",left="+left );
}
else {
wnd = window.open( oUrl, "essb_share_window", "height=500,width=800,resizable=1,scrollbars=yes,top="+top+",left="+left );
}

if (typeof(essb_settings) != "undefined") {
if (essb_settings.essb3_stats) {
if (typeof(essb_handle_stats) != "undefined") {
essb_handle_stats(oService, instance_post_id, oInstance);
}
}

if (essb_settings.essb3_ga) {
essb_ga_tracking(oService, oUrl, instance_position);
}
}
essb_self_postcount(oService, instance_post_id);
if (typeof(essb_abtesting_logger) != "undefined") {
	essb_abtesting_logger(oService, instance_post_id, oInstance);
}

var pollTimer = window.setInterval(function() {
if (wnd.closed !== false) {
window.clearInterval(pollTimer);
essb_smart_onclose_events(oService, instance_post_id);
}
}, 200);
};

var essb_self_postcount = function(oService, oCountID) {
if (typeof(essb_settings) != "undefined") {
oCountID = String(oCountID);

jQuery.post(essb_settings.ajax_url, {
\'action\': \'essb_self_postcount\',
\'post_id\': oCountID,
\'service\': oService,
\'nonce\': essb_settings.essb3_nonce
}, function (data) { if (data) {
	
}},\'json\');
}
};

var essb_smart_onclose_events = function(oService, oPostID) {
if (oService == "subscribe" || oService == "comments") return;
if (typeof (essbasc_popup_show) == \'function\') {
essbasc_popup_show();
}
if (typeof essb_acs_code == \'function\') {
essb_acs_code(oService, oPostID);
}
if (typeof(after_share_easyoptin) != "undefined") {
	essb_toggle_subscribe(after_share_easyoptin);
}
};

var essb_tracking_only = function(oUrl, oService, oInstance, oAfterShare) {
var element = jQuery(\'.essb_\'+oInstance);

if (oUrl == "") {
oUrl = document.URL;
}

var instance_post_id = jQuery(element).attr("data-essb-postid") || "";
var instance_position = jQuery(element).attr("data-essb-position") || "";

if (typeof(essb_settings) != "undefined") {
if (essb_settings.essb3_stats) {
if (typeof(essb_handle_stats) != "undefined") {
essb_handle_stats(oService, instance_post_id, oInstance);
}
}

if (essb_settings.essb3_ga) {
essb_ga_tracking(oService, oUrl, instance_position);
}
}
essb_self_postcount(oService, instance_post_id);

if (oAfterShare) {
essb_smart_onclose_events(oService, instance_post_id);
}
};

var essb_pinterest_picker = function(oInstance) {
essb_tracking_only(\'\', \'pinterest\', oInstance);
var e=document.createElement(\'script\');
e.setAttribute(\'type\',\'text/javascript\');
e.setAttribute(\'charset\',\'UTF-8\');
e.setAttribute(\'src\',\'//assets.pinterest.com/js/pinmarklet.js?r=\'+Math.random()*99999999);document.body.appendChild(e);
};
';
	$script = trim(preg_replace('/\s+/', ' ', $script));
	return $buffer.$script;
}


function essb_hex2rgba($color, $opacity = false) {

	$default = 'rgb(0,0,0)';

	//Return default if no color provided
	if(empty($color))
		return $default;

	//Sanitize $color if "#" is provided
	if ($color[0] == '#' ) {
		$color = substr( $color, 1 );
	}

	//Check if color has 6 or 3 characters and get values
	if (strlen($color) == 6) {
		$hex = array( $color[0] . $color[1], $color[2] . $color[3], $color[4] . $color[5] );
	} elseif ( strlen( $color ) == 3 ) {
		$hex = array( $color[0] . $color[0], $color[1] . $color[1], $color[2] . $color[2] );
	} else {
		return $default;
	}

	//Convert hexadec to rgb
	$rgb =  array_map('hexdec', $hex);

	//Check if opacity is set(rgba or rgb)
	if($opacity){
		if(abs($opacity) > 1)
			$opacity = 1.0;
		$output = 'rgba('.implode(",",$rgb).','.$opacity.')';
	} else {
		$output = 'rgb('.implode(",",$rgb).')';
	}

	//Return rgb(a) color string
	return $output;
}
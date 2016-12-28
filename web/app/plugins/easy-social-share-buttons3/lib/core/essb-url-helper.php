<?php

function essb_attach_tracking_code($url, $code = '') {
	$posParamSymbol = strpos($url, '?');

	$code = str_replace('&', '%26', $code);

	if ($posParamSymbol === false) {
		$url .= '?';
	}
	else {
		$url .= "%26";
	}

	$url .= $code;
		
	return $url;
}

function essb_generate_affiliatewp_referral_link ($permalink) {
	global $essb_options;

	if ( ! ( is_user_logged_in() && affwp_is_affiliate() ) ) {
		return $permalink;
	}

	$affwp_active_mode = essb_options_value('affwp_active_mode');
	$affwp_active_pretty = essb_options_bool_value('affwp_active_pretty');

	// append referral variable and affiliate ID to sharing links in ESSB
	if ($affwp_active_mode == 'name') {
		if ($affwp_active_pretty) {
			$permalink .= affiliate_wp()->tracking->get_referral_var().'/'.affwp_get_affiliate_username();
		}
		else {
			$permalink = add_query_arg( affiliate_wp()->tracking->get_referral_var(), affwp_get_affiliate_username(), $permalink );
		}
	}
	else {
		if ($affwp_active_pretty) {
			$permalink .= affiliate_wp()->tracking->get_referral_var().'/'.affwp_get_affiliate_id();
		}
		else {
			$permalink = add_query_arg( affiliate_wp()->tracking->get_referral_var(), affwp_get_affiliate_id(), $permalink );
		}
	}
	return $permalink;
}

function essb_get_current_url($mode = 'base') {

	$url = 'http' . (is_ssl () ? 's' : '') . '://' . $_SERVER ['HTTP_HOST'] . $_SERVER ['REQUEST_URI'];

	$return_url = $url;
	
	switch ($mode) {
		case 'raw' :
			$return_url = $url;
			break;
		case 'base' :
			$return_url = reset ( explode ( '?', $url ) );
			break;
		case 'uri' :
			$exp = explode ( '?', $url );
			$return_url = trim ( str_replace ( home_url (), '', reset ( $exp ) ), '/' );
			break;
		default :
			$return_url = '';
	}
	
	$return_url = esc_url(sanitize_text_field($return_url));
	
	return $return_url;
}


function essb_get_current_page_url() {
	$pageURL = 'http';
	if(isset($_SERVER["HTTPS"]))
		if ($_SERVER["HTTPS"] == "on") {
		$pageURL .= "s";
	}
	$pageURL .= "://";
	$current_request_uri = $_SERVER['REQUEST_URI'];
	
	// this is made to escape possible blocking share parameters. We honor query string but those parameters
	// will block sharing
	$current_request_uri = str_replace('&u=', '&u0=', $current_request_uri);
	$current_request_uri = str_replace('&t=', '&t0=', $current_request_uri);
	$current_request_uri = str_replace('&title=', '&title0=', $current_request_uri);
	$current_request_uri = str_replace('&url=', '&url0=', $current_request_uri);
		
		
	if ($_SERVER["SERVER_PORT"] != "80" && $_SERVER["SERVER_PORT"] != "443") {
		$pageURL .= $_SERVER["SERVER_NAME"] . ":" . $_SERVER["SERVER_PORT"] . $current_request_uri;
	} else {
		$pageURL .= $_SERVER["SERVER_NAME"] . $current_request_uri;
	}
	
	$pageURL = esc_url(sanitize_text_field($pageURL));
	return $pageURL;
}
?>
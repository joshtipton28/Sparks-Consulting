<?php
if (!function_exists('essb_rs_js_build_ga_tracking_code')) {
	add_filter('essb_js_buffer_footer', 'essb_rs_js_build_ga_tracking_code');
	
	function essb_rs_js_build_ga_tracking_code($buffer) {
	$script = '
	var essb_ga_tracking = function(oService, oPosition, oURL) {
	var essb_ga_type = essb_settings.essb3_ga_mode;

	if ( \'ga\' in window && window.ga !== undefined && typeof window.ga === \'function\' ) {
	if (essb_ga_type == "extended") {
	ga(\'send\', \'event\', \'social\', oService + \' \' + oPosition, oURL);
}
else {
ga(\'send\', \'event\', \'social\', oService, oURL);
}
}
};
';
	$script = trim(preg_replace('/\s+/', ' ', $script));
	return $buffer.$script;
	}
}
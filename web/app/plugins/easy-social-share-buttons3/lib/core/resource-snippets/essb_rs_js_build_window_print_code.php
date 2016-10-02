<?php
if (!function_exists('essb_rs_js_build_window_print_code')) {
	add_filter('essb_js_buffer_footer', 'essb_rs_js_build_window_print_code');
	function essb_rs_js_build_window_print_code($buffer) {
		$script = '
		var essb_print = function (oInstance) {
		essb_tracking_only(\'\', \'print\', oInstance);
		window.print();
		};
		';
		$script = trim(preg_replace('/\s+/', ' ', $script));
		return $buffer.$script;
	}
}
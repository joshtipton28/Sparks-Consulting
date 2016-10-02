<?php
/**
 * Love This button
 *
 * @since 4.0
 *
 * @package EasySocialShareButtons
 * @author  appscreo <http://codecanyon.net/user/appscreo/portfolio>
 */

function essb_love_generate_js_code() {
	global $essb_options;

	// localization of messages;
	$message_loved = isset($essb_options['translate_love_loved']) ? $essb_options['translate_love_loved'] : '';
	$message_thanks = isset($essb_options['translate_love_thanks'])? $essb_options['translate_love_thanks'] : '';

	if ($message_loved == "") {
		$message_loved = __("You already love this today.", ESSB3_TEXT_DOMAIN);
	}
	if ($message_thanks == "") {
		$message_thanks = "Thank you for loving this.";
	}


	$output_code = '';

	$output_code .= '
	var essb_clicked_lovethis = false;
	var essb_love_you_message_thanks = "'.$message_thanks.'";
	var essb_love_you_message_loved = "'.$message_loved.'";

	var essb_lovethis = function(oInstance) {
	if (essb_clicked_lovethis) {
	alert(essb_love_you_message_loved);
	return;
}

var element = jQuery(\'.essb_\'+oInstance);

if (!element.length) { return; }
var instance_post_id = jQuery(element).attr("data-essb-postid") || "";

var cookie_set = essb_get_lovecookie("essb_love_"+instance_post_id);
if (cookie_set) {
alert(essb_love_you_message_loved);
return;
}

if (typeof(essb_settings) != "undefined") {
jQuery.post(essb_settings.ajax_url, {
\'action\': \'essb_love_action\',
\'post_id\': instance_post_id,
\'service\': \'love\',
\'nonce\': essb_settings.essb3_nonce
}, function (data) { if (data) {
alert(essb_love_you_message_thanks);
}},\'json\');
}

essb_tracking_only(\'\', \'love\', oInstance, true);
};

var essb_get_lovecookie = function(name) {
var value = "; " + document.cookie;
var parts = value.split("; " + name + "=");
if (parts.length == 2) return parts.pop().split(";").shift();
};
';

	return $output_code;

}

essb_resource_builder()->add_js(essb_love_generate_js_code(), true, 'essb-loveyou-code');
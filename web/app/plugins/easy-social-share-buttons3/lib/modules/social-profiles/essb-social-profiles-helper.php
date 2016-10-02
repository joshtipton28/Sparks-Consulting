<?php
class ESSBSocialProfilesHelper {
	
	public static function get_active_networks() {
		$network_list = essb_option_value('profile_networks');
	
		return $network_list;
	}
	
	public static function get_active_networks_order() {
		$network_order = essb_option_value('profile_networks_order');
	
		$network_order = self::simplify_order_list($network_order);
	
		return $network_order;
	}
	
	public static function simplify_order_list($order) {
		$result = array();
		foreach ($order as $network) {
			$network_details = explode('|', $network);
			$result[] = $network_details[0];
		}
	
		return $result;
	}
	
	public static function available_social_networks() {
		$socials = array ();
		$socials['facebook'] = 'Facebook';
		$socials['twitter'] = 'Twitter';
		$socials['google'] = 'Google';
		$socials['pinterest'] = 'Pinterest';
		$socials['linkedin'] = 'LinkedIn';
		$socials['github'] = 'GitHub';
		$socials['vimeo'] = 'Vimeo';
		$socials['dribbble'] = 'Dribbble';
		$socials['envato'] = 'Envato';
		$socials['soundcloud'] = 'SoundCloud';
		$socials['behance'] = 'Behance';
		$socials['foursquare'] = 'Foursquare';
		$socials['forrst'] = 'Forrst';
		$socials['mailchimp'] = 'MailChimp';
		$socials['delicious'] = 'Delicious';
		$socials['instagram'] = 'Instagram';
		$socials['youtube'] = 'YouTube';
		$socials['vk'] = 'VK';
		$socials['rss'] = 'RSS';
		$socials['vine'] = 'Vine';
		$socials['tumblr'] = 'Tumblr';
		$socials['slideshare'] = 'SlideShare';
		$socials['500px'] = '500px';
		$socials['flickr'] = 'Flickr';
		$socials['audioboo'] = 'Audioboo';
		$socials['steamcommunity'] = 'Steam';
		$socials['weheartit'] = 'WeHeartit';
		$socials['feedly'] = 'Feedly';
		$socials['love'] = 'Love Counter';
		$socials['mailpoet'] = 'MailPoet';
		$socials['mymail'] = 'myMail';
		$socials['spotify'] = 'Spotify';
		$socials['twitch'] = 'Twitch';
		
		return $socials;
	}
	
	public static function available_templates() {
		$templates = array('color' => 'Color icons', 'roundcolor' => 'Round Color Icons', 'outlinecolor' => 'Outline Color Icons', 'grey' => 'Grey icons', 'roundgrey' => 'Round Grey Icons', 'outlinegrey' => 'Outline Grey Icons', 'light' => 'Light Icons', 'roundlight' => 'Round Light Icons', 'outlinelight' => 'Outline Light Icons', 'metro' => 'Metro', 'flat' => 'Flat', 'dark' => 'Dark', 'tinycolor' => 'Tiny Color', 'tinygrey' => 'Tiny Grey', 'tinylight' => 'Tiny Light', 'modern' => "Modern");
		
		return $templates;
	}
	
	public static function available_animations() {
		$animations = array('' => 'Without animation', 'pulse' => "Pulse", "down" => "Down", "up" => "Up", "pulse-grow" => "Pulse Grow", "pop" => "Pop", "wobble-horizontal" => "Wobble Horizontal", "wobble-vertical" => "Wobble Vertical", "buzz-out" => "Buzz Out");
		
		return $animations;
	}
}
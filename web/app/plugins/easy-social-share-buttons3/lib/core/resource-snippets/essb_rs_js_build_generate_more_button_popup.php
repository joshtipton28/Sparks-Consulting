<?php
if (!function_exists('essb_rs_js_build_generate_more_button_popup')) {
	add_filter('essb_js_buffer_footer', 'essb_rs_js_build_generate_more_button_popup');
	
	function essb_rs_js_build_generate_more_button_popup($buffer) {
		$output = 'var essb_morepopup_opened = false;';
		
		$output .= 'function essb_toggle_more_popup(unique_id) {
			jQuery.fn.extend({
				center: function () {
					return this.each(function() {
						var top = (jQuery(window).height() - jQuery(this).outerHeight()) / 2;
						var left = (jQuery(window).width() - jQuery(this).outerWidth()) / 2;
						jQuery(this).css({position:\'fixed\', margin:0, top: (top > 0 ? top : 0)+\'px\', left: (left > 0 ? left : 0)+\'px\'});
					});
				},
				centerH: function (bottom_position) {
					return this.each(function() {
						var left = (jQuery(window).width() - jQuery(this).outerWidth()) / 2;
						jQuery(this).css({position:\'fixed\', margin:0, bottom: (bottom_position > 0 ? bottom_position : 0)+\'px\', left: (left > 0 ? left : 0)+\'px\'});
					});
				}
			});
			
			if (essb_morepopup_opened) {
				essb_toggle_less_popup(unique_id);
				return;
			}
			
			if (jQuery(".essb_morepopup_"+unique_id).hasClass("essb_morepopup_inline")) {
				essb_toggle_more_inline(unique_id);
				return;
			}
			
			var is_from_mobilebutton = false;
			var height_of_mobile_bar = 0;
			if (jQuery(".essb-mobile-sharebottom").length) {
				is_from_mobilebutton = true;
				height_of_mobile_bar = jQuery(".essb-mobile-sharebottom").outerHeight();
			}
			
			
			var win_width = jQuery( window ).width();
			var win_height = jQuery(window).height();
			var doc_height = jQuery(\'document\').height();
			
			var base_width = 550;
			if (!is_from_mobilebutton) {
				base_width = 660;
			}
			
			if (win_width < base_width) { base_width = win_width - 30; }
			var height_correction = is_from_mobilebutton ? 10 : 80;
			
			var instance_mobile = false;
			
			var element_class = ".essb_morepopup_"+unique_id;
			var element_class_shadow = ".essb_morepopup_shadow_"+unique_id;
			var alignToBottom = false;
			
			if (jQuery(element_class).hasClass("essb_morepopup_sharebottom")) alignToBottom = true; 
			
			if (jQuery(element_class).hasClass("essb_morepopup_modern") && !is_from_mobilebutton) height_correction = 100;
			
			jQuery(element_class).css( { width: base_width+\'px\'});
			
			
			var element_content_class = ".essb_morepopup_content_"+unique_id;
			var popup_height = jQuery(element_class).outerHeight();
			if (popup_height > (win_height - 30)) {
				var additional_correction = 0;		
				if (is_from_mobilebutton) {
					jQuery(element_class).css( { top: \'5px\'});
					additional_correction += 30;
				}				
				jQuery(element_class).css( { height: (win_height - height_of_mobile_bar - height_correction - additional_correction)+\'px\'});
				jQuery(element_content_class).css( { height: (win_height - height_of_mobile_bar - additional_correction - (height_correction+30))+\'px\', "overflowY" :"auto"});
			}
			
			jQuery(element_class_shadow).css( { height: (win_height - height_of_mobile_bar)+\'px\'});
			if (!alignToBottom)
				jQuery(element_class).center();
			else {
				var left = (jQuery(window).width() - jQuery(element_class).outerWidth()) / 2;
				jQuery(element_class).css( { left: left+"px", position:\'fixed\', margin:0, bottom: (height_of_mobile_bar + height_correction) + "px" });
			}
			jQuery(element_class).fadeIn(400);
			jQuery(element_class_shadow).fadeIn(200);
			essb_morepopup_opened = true;
		};
		
		function essb_toggle_less_popup(unique_id) {
			var element_class = ".essb_morepopup_"+unique_id;
			var element_class_shadow = ".essb_morepopup_shadow_"+unique_id;
			jQuery(element_class).fadeOut(200);
			jQuery(element_class_shadow).fadeOut(200);
			essb_morepopup_opened = false;
		};
		
		function essb_toggle_more_inline(unique_id) {
		
		
			var buttons_element = jQuery(".essb_"+unique_id);
			if (!buttons_element.length) return;
			var element_class = ".essb_morepopup_"+unique_id;						
			
			var appear_y = jQuery(buttons_element).position().top + jQuery(buttons_element).outerHeight(true);
			var appear_x = jQuery(buttons_element).position().left;
			var appear_position = "absolute";
			
			
			var appear_at_bottom = false;
			
			if (jQuery(buttons_element).css("position") === "fixed") 
				appear_position = "fixed";
							
			if (jQuery(buttons_element).hasClass("essb_displayed_bottombar"))
				appear_at_bottom = true;
				
			if (appear_at_bottom) {
				appear_y = jQuery(buttons_element).position().top - jQuery(element_class).outerHeight(true);
				var pointer_element = jQuery(element_class).find(".modal-pointer");
				if (jQuery(pointer_element).hasClass("modal-pointer-up-left")) {
					jQuery(pointer_element).removeClass("modal-pointer-up-left");
					jQuery(pointer_element).addClass("modal-pointer-down-left");
				}
			}
				
			var more_button = jQuery(buttons_element).find(".essb_link_more");
			if (!jQuery(more_button).length)
			    more_button = jQuery(buttons_element).find(".essb_link_more_dots"); 
			if (jQuery(more_button).length) 
				appear_x = (appear_position != "fixed") ? jQuery(more_button).position().left - 5 : (appear_x + jQuery(more_button).position().left - 5);

			var share_button = jQuery(buttons_element).find(".essb_link_share");
			if (jQuery(share_button).length) 
				appear_x = (appear_position != "fixed") ? jQuery(share_button).position().left - 5 : (appear_x + jQuery(share_button).position().left - 5);

			
				
			jQuery(element_class).css( { left: appear_x+"px", position: appear_position, margin:0, top: appear_y + "px" });
			
			jQuery(element_class).fadeIn(200);
			essb_morepopup_opened = true;
			
		}
		
		';
		
		$output = trim(preg_replace('/\s+/', ' ', $output));
		return $buffer.$output;
	}
}
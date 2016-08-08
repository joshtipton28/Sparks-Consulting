<?php
/**
 * Entry meta information for posts
 *
 * @package WordPress
 * @subpackage FoundationPress
 * @since FoundationPress 1.0.0
 */

if ( ! function_exists( 'foundationpress_entry_meta' ) ) :
	function foundationpress_entry_meta() {
		echo '<p class="byline author">' . '<span class="avatar-img">' . get_avatar( get_the_author_meta( 'ID' ), 54) . '</span>' . __( 'By', 'foundationpress' ) .' <a href="'. get_the_author_meta('user_url') .'" rel="author" class="fn" target="_blank">'. get_the_author() .'</a> | ';
		echo '<time class="updated" datetime="'. get_the_time( 'c' ) .'">'. sprintf( __( '%s %s', 'foundationpress' ), get_the_date(), get_the_time() ) .'</time></p>';
	}
endif;
?>

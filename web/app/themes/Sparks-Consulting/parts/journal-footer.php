<?php
/**
 * The template for displaying the footer
 *
 * Contains the closing of the "off-canvas-wrap" div and all content after.
 *
 * @package WordPress
 * @subpackage FoundationPress
 * @since FoundationPress 1.0.0
 */

?>

		<div class="medium reveal fast" id="journal-learn-more" data-reveal data-overlay="false" data-animation-in="slide-in-up" data-animation-out="slide-out-down">
			<?php echo do_shortcode('[gravityform id="2" title="false" description="false"]'); ?>

			<button class="close-button" data-close aria-label="Close modal" type="button">
			  <span aria-hidden="true">&times;</span>
			</button>
		</div>

		</section>
		<div class="journal-footer">
			<div class="row">
				<footer id="footer" class="large-6 columns large-centered">
					<?php do_action( 'foundationpress_before_footer' ); ?>
					<?php dynamic_sidebar( 'footer-widgets' ); ?>
					<?php do_action( 'foundationpress_after_footer' ); ?>
				</footer>
			</div>
		</div>


		<?php do_action( 'foundationpress_layout_end' ); ?>

<?php if ( get_theme_mod( 'wpt_mobile_menu_layout' ) == 'offcanvas' ) : ?>
		</div><!-- Close off-canvas wrapper inner -->
	</div><!-- Close off-canvas wrapper -->
</div><!-- Close off-canvas content wrapper -->
<?php endif; ?>


<?php wp_footer(); ?>
<?php do_action( 'foundationpress_before_closing_body' ); ?>
</body>
</html>

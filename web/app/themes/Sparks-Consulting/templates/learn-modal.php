<?php /*
Template Name: Sparks Modal Iframe
*/
?>
<!doctype html>
<html class="no-js" <?php language_attributes(); ?> >
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />

		<?php wp_head(); ?>
	</head>
	<body style="background:transparent !important;">

		<?php while ( have_posts() ) : the_post(); ?>
			<?php the_content(); ?>
		<?php endwhile; ?>

		<?php wp_footer(); ?>
		<?php do_action( 'foundationpress_before_closing_body' ); ?>

	</body>
</html>

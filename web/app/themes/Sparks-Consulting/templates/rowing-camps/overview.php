<?php
/**
 * Template part for off canvas menu
 **/
//Get Media
$overviewImage = get_field('featured_image');
$overviewVideo = get_field('featured_video');

?>
	<div class="tabs-panel is-active" id="camp-overview">
		<h1><?php echo $campTitle;?> <em><?php the_field('camp_name');?> Overview</em></h1>

		<div class="featured-media">
			<?php

				if(!empty($overviewImage)) : ?>

				<img src="<?php echo $overviewImage['url']; ?>" alt="<?php echo $overviewImage['alt']; ?>" >

			<?php endif; ?>

			<?php

				if(!empty($overviewVideo)): ?>

					<p> <?php echo $overviewVideo; ?> </p>

				<?php endif; ?>

		</div>

		<?php the_field('overview_content'); ?>
	</div>
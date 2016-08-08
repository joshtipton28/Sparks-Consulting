<?php
/**
 * Template part for About Us - Leadership
 **/
?>

<div class="tabs-panel" id="leadership">
	<h2>Leadership</h2>
			<?php if( have_rows('leadership_leaders') ): ?>

			    <?php while( have_rows('leadership_leaders') ): the_row(); ?>

			        <?php

				        $leaderName = get_sub_field('leaders_name');
				        $leaderLocation = get_sub_field('leaders_location');
				        $leaderBio = get_sub_field('leaders_bio');
				        $leaderImg = get_sub_field('leaders_photo');

			        ?>
			        <hr>
			        <div class="about-leaders tab-block">
				    	<h5>
				    		<?php echo $leaderName; ?>

				    			<?php if (!empty($leaderLocation) ): ?>
				    				<span>
					    				<?php echo "/&nbsp;" . $leaderLocation; ?>
				    				 </span>
				    			<?php endif; ?>

				    	</h5>

				    	<?php if( !empty($leaderImg) ): ?>

							<img src="<?php echo $leaderImg['url']; ?>" alt="<?php echo $leaderImg['alt']; ?>" />

						<?php endif; ?>

						<?php echo $leaderBio;?>

			        </div>

			    <?php endwhile; ?>

		<?php endif; ?>
</div>
<?php
/**
 * Template part for About Us - Counseling Associates
 **/
?>

<div class="tabs-panel" id="counseling-associates">
	<h2>Counseling Associates</h2>
		<?php if( have_rows('counseling_associates') ): ?>

		    <?php while( have_rows('counseling_associates') ): the_row(); ?>

		        <?php

			        $counselAssocName = get_sub_field('counseling_associates_name');
			        $counselAssocLocation = get_sub_field('counseling_associates_location');
			        $counselAssocBio = get_sub_field('counseling_associates_bio');
			        $counselAssocImg = get_sub_field('counseling_associates_photo');

		        ?>
		        <hr>
		        <div class="about-counsel-assoc tab-block">
			    	<h5>
			    		<?php echo $counselAssocName; ?>

		    			<?php if (!empty($counselAssocLocation) ): ?>
		    				<span>
			    				<?php echo "/&nbsp;" . $counselAssocLocation; ?>
		    				 </span>
		    			<?php endif; ?>

			    	</h5>

			    	<?php if( !empty($counselAssocImg) ): ?>

						<img src="<?php echo $counselAssocImg['url']; ?>" alt="<?php echo $counselAssocImg['alt']; ?>" />

					<?php endif; ?>

					<?php echo $counselAssocBio;?>

		        </div>

		    <?php endwhile; ?>

		<?php endif; ?>
</div>
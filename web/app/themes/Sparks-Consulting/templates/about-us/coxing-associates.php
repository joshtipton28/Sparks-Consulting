<?php
/**
 * Template part for About Us - Coxing Associates
 **/
?>

<div class="tabs-panel" id="coxing-associates">
	<h2>Coxing Associates</h2>
		<?php if( have_rows('coxing_associates') ): ?>

		    <?php while( have_rows('coxing_associates') ): the_row(); ?>

		        <?php

			        $coxingAssocName = get_sub_field('coxing_associates_name');
			        $coxingAssocLocation = get_sub_field('coxing_associates_ocation');
			        $coxingAssocBio = get_sub_field('coxing_associates_bio');
			        $coxingAssocImg = get_sub_field('coxing_associates_photo');

		        ?>
		        <hr>
		        <div class="about-coxingAssocs tab-block">
			    	<h5>
			    		<?php echo $coxingAssocName; ?>

		    			<?php if (!empty($coxingAssocLocation) ): ?>
		    				<span>
			    				<?php echo "/&nbsp;" . $coxingAssocLocation; ?>
		    				 </span>
		    			<?php endif; ?>

			    	</h5>

			    	<?php if( !empty($coxingAssocImg) ): ?>

						<img src="<?php echo $coxingAssocImg['url']; ?>" alt="<?php echo $coxingAssocImg['alt']; ?>" />

					<?php endif; ?>

					<?php echo $coxingAssocBio;?>

		        </div>

		    <?php endwhile; ?>

		<?php endif; ?>
</div>
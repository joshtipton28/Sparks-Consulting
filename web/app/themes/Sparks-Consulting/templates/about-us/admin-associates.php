<?php
/**
 * Template part for About Us - Administrative Associates
 * Includes closing tags for Tab Panels
 **/
?>

			<div class="tabs-panel" id="administrative-associates">
			<h2>Administrative Associates</h2>
				<?php if( have_rows('administrative_associates') ): ?>

				    <?php while( have_rows('administrative_associates') ): the_row(); ?>

				        <?php

					        $adminAssocName = get_sub_field('administrative_associates_name');
					        $adminAssocLocation = get_sub_field('administrative_associates_location');
					        $adminAssocBio = get_sub_field('administrative_associates_bio');
					        $adminAssocImg = get_sub_field('administrative_associates_photo');

				        ?>
				        <hr>
				        <div class="about-admin-assoc tab-block">
					    	<h5>
					    		<?php echo $adminAssocName; ?>

				    			<?php if (!empty($adminAssocLocation) ): ?>
				    				<span>
					    				<?php echo "/&nbsp;" . $adminAssocLocation; ?>
				    				 </span>
				    			<?php endif; ?>

					    	</h5>

					    	<?php if( !empty($adminAssocImg) ): ?>

								<img src="<?php echo $adminAssocImg['url']; ?>" alt="<?php echo $adminAssocImg['alt']; ?>" />

							<?php endif; ?>

							<?php echo $adminAssocBio;?>

				        </div>

				    <?php endwhile; ?>

				<?php endif; ?>
			</div>

		</div><!--closing tags for tab panels-->
	</div><!--closing tags for tab panels-->
</div><!--closing tags for tab panels-->
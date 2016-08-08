<?php
/**
 * Template part for Rowing Camps Custom Post Type
 * Camp Forms Template
 **/
?>
<div class="tabs-panel" id="camp-forms">

	<h2>Camp Forms</h2>
		<hr>

	<?php the_field('form_instructions'); ?>


	<?php if( have_rows('packet_repeater') ): ?>

	    <?php while ( have_rows('packet_repeater') ) : the_row(); ?>
	    	<?php
	    		$packetType = get_sub_field('packet_type');
	    		$pdfPacket = get_sub_field('select_pdf');
	    		$customPacket = get_sub_field('packet_url');
	    		$packetTitle = get_sub_field('packet_title');
	    		$packetDescription = get_sub_field('packet_description');
	    	?>

	    	<ul class="form-packet">

		        <?php if ($packetType == 1 ): ?>

		        	<?php if( $pdfPacket ): ?>
		        		<li>
							<a href="<?php echo $pdfPacket['url']; ?>" target="_blank"><?php echo $packetTitle; ?></a> -- <?php echo $packetDescription; ?>
						</li>
					<?php endif; ?>

		        <?php elseif ($packetType == 2 ): ?>
		        	<li>
						<a href="<?php echo $customPacket; ?>" target="_blank"><?php echo $packetTitle; ?></a> -- <?php echo $packetDescription; ?>
					</li>
		 		<?php endif; ?>

		 	</ul>

	    <?php endwhile; ?>

	<?php else : ?>


	<?php endif; ?>

	<?php $campGravityForms = the_field('camp_gravity_forms'); ?>

	<?php if ( !empty($campGravityForms) ) : ?>

		<div class="camp-gravity-forms">
			<?php echo $campGravityForms; ?>
		</div>

	<?php endif; ?>

</div>
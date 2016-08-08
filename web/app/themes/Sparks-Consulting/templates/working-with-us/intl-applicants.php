<?php
/**
 * Template part for Working With Us - International Applicants
 **/
?>

<div class="tabs-panel" id="international-applicants">
    <h2>International Applicants</h2>
    <hr>

	<?php if( have_rows('intl_info_block') ): ?>

	    <?php while( have_rows('intl_info_block') ): the_row(); ?>
	        
	        <?php 
	        
		        $intlInfoHeading = get_sub_field('intl_info_heading'); 
		        $intlInfoBlurb = get_sub_field('intl_info_blurb');
		        $intlInfoImg = get_sub_field('intl_info_img');
	        
	        ?>

	        <div class="ww-intl tab-block">
		        <h3><?php echo $intlInfoHeading;?></h3>
		        
		        <?php if( !empty($intlInfoImg) ): ?>

					<img src="<?php echo $intlInfoImg['url']; ?>" alt="<?php echo $intlInfoImg['alt']; ?>" />

				<?php endif; ?>

				<?php echo $intlInfoBlurb;?>

	        </div>
	        
	    <?php endwhile; ?>

	<?php endif; ?>
</div>
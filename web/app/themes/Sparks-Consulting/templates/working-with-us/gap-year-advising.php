<?php
/**
 * Template part for Working With Us - Gap Year Advising
 **/
?>

<div class="tabs-panel" id="gap-year-advising">
    <h2>Is a Gap Year Advisable?</h2>
    <hr>

	<?php if( have_rows('gapyr_info_block') ): ?>

	    <?php while( have_rows('gapyr_info_block') ): the_row(); ?>
	        
	        <?php 
	        
		        $gapyrInfoHeading = get_sub_field('gapyr_info_heading'); 
		        $gapyrInfoBlurb = get_sub_field('gapyr_info_blurb');
		        $gapyrInfoImg = get_sub_field('gapyr_info_img');
	        
	        ?>

	        <div class="ww-gapyr tab-block">
		        <h3><?php echo $gapyrInfoHeading;?></h3>
		        
		        <?php if( !empty($gapyrInfoImg) ): ?>

					<img src="<?php echo $gapyrInfoImg['url']; ?>" alt="<?php echo $gapyrInfoImg['alt']; ?>" />

				<?php endif; ?>

				<?php echo $gapyrInfoBlurb;?>

	        </div>
	        
	    <?php endwhile; ?>

	<?php endif; ?>
</div>
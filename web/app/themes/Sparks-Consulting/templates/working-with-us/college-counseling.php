<?php
/**
 * Template part for Working With Us - College Counseling
 **/
?>

<div class="tabs-panel" id="college-counseling">
    <h1>College Counseling</h1>
    <hr>

	<?php if( have_rows('counseling_info_block') ): ?>

	    <?php while( have_rows('counseling_info_block') ): the_row(); ?>
	        
	        <?php 
	        
		        $counselingInfoHeading = get_sub_field('counseling_info_heading'); 
		        $counselingInfoBlurb = get_sub_field('counseling_info_blurb');
		        $counselingInfoImg = get_sub_field('counseling_info_img');
	        
	        ?>

	        <div class="ww-ccounsel tab-block">

	        	<h3><?php echo $counselingInfoHeading;?></h3>

	        	<?php if( !empty($counselingInfoImg) ): ?>

					<img src="<?php echo $counselingInfoImg['url']; ?>" alt="<?php echo $counselingInfoImg['alt']; ?>"/>

				<?php endif; ?>

		        <?php echo $counselingInfoBlurb;?>
		        
	        </div>
	        
	    <?php endwhile; ?>

	<?php endif; ?>

</div>
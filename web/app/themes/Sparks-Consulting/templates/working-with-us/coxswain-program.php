<?php
/**
 * Template part for Working With Us - Coxswains Program
 **/
?>

<div class="tabs-panel" id="coxswain-program">
    <h2>Coxswain Program</h2>
    <hr>

	<?php if( have_rows('coxswain_info_block') ): ?>

	    <?php while( have_rows('coxswain_info_block') ): the_row(); ?>
	        
	        <?php 
	        
		        $coxswainInfoHeading = get_sub_field('coxswain_info_heading'); 
		        $coxswainInfoBlurb = get_sub_field('coxswain_info_blurb');
		        $coxswainInfoImg = get_sub_field('coxswain_info_img');
	        
	        ?>

	        <div class="ww-coxprog tab-block">
		        <h3><?php echo $coxswainInfoHeading;?></h3>

		        <?php if( !empty($coxswainInfoImg) ): ?>

					<img src="<?php echo $coxswainInfoImg['url']; ?>" alt="<?php echo $coxswainInfoImg['alt']; ?>" />

				<?php endif; ?>
		        
		        <?php echo $coxswainInfoBlurb;?>

	        </div>
	        
	    <?php endwhile; ?>

	<?php endif; ?>

</div>
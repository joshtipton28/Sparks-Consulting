<?php
/**
 * Template part for Working With Us - Counseling Testimonials
 **/
?>

<div class="tabs-panel" id="counseling-testimonials">
  	<h2>Counseling Testimonials</h2>
  	<?php if( have_rows('counsel_testimonial_block') ): ?>

	    <?php while( have_rows('counsel_testimonial_block') ): the_row(); ?>
	        
	        <?php 
	        
		        $counselTestimonialBody = get_sub_field('counsel_testimonial_body'); 
		        $counselTestimonialSource = get_sub_field('counsel_testimonial_source');
	        
	        ?>
	        <hr>
	        <div class="ww-countest tab-block">
		        <p>"<?php echo $counselTestimonialBody;?>"</p>
		        <em>—&nbsp;<?php echo $counselTestimonialSource;?></em>

	        </div>
	        
	    <?php endwhile; ?>

	<?php endif; ?>
</div>
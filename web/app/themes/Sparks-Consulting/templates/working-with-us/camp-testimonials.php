<?php
/**
 * Template part for Working With Us - Camp Testimonials
 **/
?>

<div class="tabs-panel" id="rowing-camp-testimonials">
  	<h2>Camp Testimonials</h2>
  	<?php if( have_rows('camp_testimonial_block') ): ?>

	    <?php while( have_rows('camp_testimonial_block') ): the_row(); ?>
	        
	        <?php 
	        
		        $campTestimonialBody = get_sub_field('camp_testimonial_body'); 
		        $campTestimonialSource = get_sub_field('camp_testimonial_source');
	        
	        ?>
	        <hr>
	        <div class="ww-camptest tab-block">
		        <p>"<?php echo $campTestimonialBody;?>"</p>
		        <em>—&nbsp;<?php echo $campTestimonialSource;?></em>

	        </div>
	        
	    <?php endwhile; ?>

	<?php endif; ?>
</div>
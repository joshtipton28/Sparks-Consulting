<?php
/**
 * Template part for Working With Us - Coxwain Testimonials
 **/
?>
			<div class="tabs-panel" id="coxswain-testimonials">
			  	<h2>Coxswain Testimonials</h2>
			  	<?php if( have_rows('coxswain_testimonial_block') ): ?>

				    <?php while( have_rows('coxswain_testimonial_block') ): the_row(); ?>
				        
				        <?php 
				        
					        $coxTestimonialBody = get_sub_field('coxswain_testimonial_body'); 
					        $coxTestimonialSource = get_sub_field('coxswain_testimonial_source');
				        
				        ?>
				        <hr>
				        <div class="ww-coxtest tab-block">
					        <p>"<?php echo $coxTestimonialBody;?>"</p>
					        <em>—&nbsp;<?php echo $coxTestimonialSource;?></em>

				        </div>
				        
				    <?php endwhile; ?>

				<?php endif; ?>
			</div>
		</div><!--end nano-content-->
	</div><!--end nano-->
</div><!--end row-->
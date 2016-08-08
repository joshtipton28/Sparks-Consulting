<?php
/**
 * Template part for Working With Us - Reports From the Front
 **/
?>

<?php $reportsImg = get_field('reports_featured_image');?>

<div class="rff-archive tabs-panel tab-block" id="reports-from-the-front">
	<h2>Reports From the Front</h2>
	<hr>
	
   <?php if( !empty($reportsImg) ): ?>

		<img src="<?php echo $reportsImg['url']; ?>" alt="<?php echo $reportsImg['alt']; ?>" />

	<?php endif; ?>
   <?php the_field('reports_body');?>

   	<?php 
	   	$args = array( 'post_type' => 'rff', 'posts_per_page' => 100 );
		$loop = new WP_Query( $args );?>

		<hr>

		<h3>All Posts:</h3>

		<ul>

			<?php while ( $loop->have_posts() ) : $loop->the_post();?>
				
				<li>
					<a href="<?php the_permalink();?>"><?php the_title();?></a>  
				</li>
					
			<?php endwhile;?>
		
		</ul>

		<?php wp_reset_postdata(); // reset to the original page data
	?>
</div>
<?php
/**
 * Template part for Camp Map - Middletown Camps
 **/
?>

<?php if( have_rows('middletown_details') ):?>

	<div class="map-camp <?php  the_field('middletown_season');?>-camp middletown-camp clearfix">

	 	<a class="tooltip-link" data-toggle="middletown-tip"><i class="map-pin"></i><?php the_field('middletown_label');?></a>

		<div class="dropdown-pane" id="middletown-tip" data-dropdown data-hover="true" data-hover-pane="true">

		 	<?php while ( have_rows('middletown_details') ) : the_row();?>

		 		<a class="camp-link" href="<?php the_sub_field('camp_url');?>">
			        
			        <strong><?php the_sub_field('camp_title');?></strong>
			        <strong><?php the_sub_field('camp_date');?></strong>

		        </a>

			<?php endwhile;?>

		</div>
	</div>
	
<?php endif;?>
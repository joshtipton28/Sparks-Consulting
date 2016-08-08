<?php
/**
 * Template part for Camp Map - Holland Camps
 **/
?>

<?php if( have_rows('holland_details') ):?>

	<div class="map-camp <?php  the_field('holland_season');?>-camp holland-camp clearfix">

		<a class="tooltip-link" data-toggle="holland-tip"><i class="map-pin"></i><?php the_field('holland_label');?></a>

		<div class="dropdown-pane" id="holland-tip" data-dropdown data-hover="true" data-hover-pane="true">

		 	<?php while ( have_rows('holland_details') ) : the_row();?>

		 		<a class="camp-link" href="<?php the_sub_field('camp_url');?>">
			        
			        <strong><?php the_sub_field('camp_title');?></strong>
			        <strong><?php the_sub_field('camp_date');?></strong>

		        </a>

			<?php endwhile;?>

		</div>
	</div>
	
<?php endif;?>
<?php
/**
 * Template part for Camp Map - New Zealand Camps
 **/
?>

<?php if( have_rows('nz_details') ):?>

	<div class="map-camp <?php  the_field('nz_season');?>-camp nz-camp pin-right clearfix">

		<a class="tooltip-link" data-toggle="nz-tip"><i class="map-pin"></i><?php the_field('nz_label');?></a>

		<div class="dropdown-pane" id="nz-tip" data-dropdown data-hover="true" data-hover-pane="true">

		 	<?php while ( have_rows('nz_details') ) : the_row();?>

		 		<a class="camp-link" href="<?php the_sub_field('camp_url');?>">
			        
			        <strong><?php the_sub_field('camp_title');?></strong>
			        <strong><?php the_sub_field('camp_date');?></strong>

		        </a>

			<?php endwhile;?>

		</div>
	</div>
	
<?php endif;?>
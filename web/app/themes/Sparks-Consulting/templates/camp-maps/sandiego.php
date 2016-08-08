<?php
/**
 * Template part for Camp Map - San Diego Camps
 **/
?>

<?php if( have_rows('sandiego_details') ):?>

	<div class="map-camp <?php  the_field('sandiego_season');?>-camp sandiego-camp pin-right clearfix">

		<a class="tooltip-link" data-toggle="sandiego-tip"><i class="map-pin"></i><?php the_field('sandiego_label');?></a>

		<div class="dropdown-pane" id="sandiego-tip" data-dropdown data-hover="true" data-hover-pane="true">

		 	<?php while ( have_rows('sandiego_details') ) : the_row();?>

		 		<a class="camp-link" href="<?php the_sub_field('camp_url');?>">

			        <strong><?php the_sub_field('camp_title');?></strong>
			        <strong><?php the_sub_field('camp_date');?></strong>

		        </a>

			<?php endwhile;?>

		</div>
	</div>

<?php endif;?>
<?php
/**
 * Template part for Camp Map - Seattle Camps
 **/
?>

<?php if( have_rows('seattle_details') ):?>

	<div class="map-camp <?php the_field('seattle_season');?>-camp seattle-camp pin-right clearfix">

		<a class="tooltip-link" data-toggle="seattle-tip"><i class="map-pin"></i><?php the_field('seattle_label');?></a>

		<div class="dropdown-pane" id="seattle-tip" data-dropdown data-hover="true" data-hover-pane="true">

		 	<?php while ( have_rows('seattle_details') ) : the_row();?>

		 		<a class="camp-link" href="<?php the_sub_field('camp_url');?>">
			        
			        <strong><?php the_sub_field('camp_title');?></strong>
			        <?php the_sub_field('camp_date');?>

		        </a>

			<?php endwhile;?>

		</div>
	</div>

<?php endif;?>
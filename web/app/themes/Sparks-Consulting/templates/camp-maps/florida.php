<?php
/**
 * Template part for Camp Map - Florida Camps
 **/
?>

<?php if( have_rows('fl_details') ):?>

	<div class="map-camp <?php  the_field('fl_season');?>-camp fl-camp clearfix">

		<a class="tooltip-link" data-toggle="fl-tip"><i class="map-pin"></i><?php the_field('fl_label');?></a>

		<div class="dropdown-pane" id="fl-tip" data-dropdown data-hover="true" data-hover-pane="true">

		 	<?php while ( have_rows('fl_details') ) : the_row();?>

		 		<a class="camp-link" href="<?php the_sub_field('camp_url');?>">
			        
			        <strong><?php the_sub_field('camp_title');?></strong>
			        <strong><?php the_sub_field('camp_date');?></strong>

		        </a>

			<?php endwhile;?>

		</div>
	</div>
	
<?php endif;?>
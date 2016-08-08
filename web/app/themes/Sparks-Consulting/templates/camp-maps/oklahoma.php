<?php
/**
 * Template part for Camp Map - Oklahoma Camps
 **/
?>

<?php if( have_rows('ok_details') ):?>

	<div class="map-camp <?php  the_field('ok_season');?>-camp ok-camp pin-top clearfix">

		<a class="tooltip-link" data-toggle="ok-tip"><i class="map-pin"></i><?php the_field('ok_label');?></a>

		<div class="dropdown-pane" id="ok-tip" data-dropdown data-hover="true" data-hover-pane="true">


		 	<?php while ( have_rows('ok_details') ) : the_row();?>

		 		<a class="camp-link" href="<?php the_sub_field('camp_url');?>">
			        
			        <strong><?php the_sub_field('camp_title');?></strong>
			        <strong><?php the_sub_field('camp_date');?></strong>

		        </a>

			<?php endwhile;?>

		</div>
	</div>
	
<?php endif;?>
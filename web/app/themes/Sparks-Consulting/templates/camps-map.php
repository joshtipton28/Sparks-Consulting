<?php
/*
Template Name: Camps Map Page
*/
get_header(); ?>

<?php do_action( 'foundationpress_before_content' ); ?>
<?php while ( have_posts() ) : the_post(); ?>
	<div class="full-bg">
		<?php if ( has_post_thumbnail() ) {
		the_post_thumbnail('full', array('class' => 'full-bg-img'));
		} ?>

		<div class="bg-caption">
			<?php $bgCaption =  get_post(get_post_thumbnail_id())->post_excerpt; ?>
			<?php if (!empty($bgCaption) ): ?>
				<p><?php echo $bgCaption; ?></p>
			<?php endif; ?>
		</div>
	</div>
	<div class="page-wrap map-page">
		<?php do_action( 'foundationpress_page_before_entry_content' ); ?>
			<div class="map-wrap row">

				<div class="camp-map large-12 columns">
					<img src="/app/themes/Sparks-Consulting/assets/images/map-of-rowing-camps.png" alt="Map of Rowing Camp Locations and Dates">

					<?php if( have_rows('rowing_camp_locations') ): ?>

					    <?php while ( have_rows('rowing_camp_locations') ) : the_row(); ?>

					    	<?php //Variables for Camps Map

					    		$location = get_sub_field('camp_location');
					    		$season = get_sub_field('camp_season');
					    		$pinPositionX = get_sub_field('pin_position_x');
					    		$pinPositionY = get_sub_field('pin_position_y');
					    		$pinOrientation = get_sub_field('pin_orientation');

					    	?>

					        
					        <div class="map-camp <?php echo $season; ?>-camp pin-<?php echo $pinOrientation; ?> clearfix" style="top:<?php echo $pinPositionY; ?>%; left:<?php echo $pinPositionX; ?>%;">

								<a class="tooltip-link" data-toggle="<?php echo $location;?>-tip"><i class="map-pin"></i><?php echo $location;?></a>

								<div class="dropdown-pane" id="<?php echo $location;?>-tip" data-dropdown data-hover="true" data-hover-pane="true">
									<?php if ( have_rows('camp_details') ) : ?>
									 	<?php while ( have_rows('camp_details') ) : the_row();?>

									 		<a class="camp-link" href="<?php the_sub_field('camp_url');?>" target="_blank">
										        
										        <strong><?php the_sub_field('camp_title');?></strong>
										        <?php the_sub_field('camp_date');?>

									        </a>

										<?php endwhile;?>
									<?php endif; ?>
								</div>

							</div>
					        
					    <?php endwhile; ?>

					<?php else : ?>

					<?php endif; ?>

					<div class="map-title map-camp">
						<h1><?php the_title();?></h1>
					</div>

					<div class="map-key map-camp">
					<h4>Map Key</h4>
						<h6 class="summer-camp"><i class="map-pin"></i>Summer Camps</h6>
						<h6 class="winter-camp"><i class="map-pin"></i>Winter Camps</h6>
					</div>
				</div>
			</div>
			<div class="row">

					<a href="javascript:history.back();" class="sparks-back"><i class="fa fa-chevron-left"></i> Back</a>

			</div>
	</div>
<?php endwhile;?>
<?php do_action( 'foundationpress_after_content' ); ?>

<?php /*Hiding Footer*/?>

		</section>

		<?php do_action( 'foundationpress_layout_end' ); ?>

<?php if ( get_theme_mod( 'wpt_mobile_menu_layout' ) == 'offcanvas' ) : ?>
		</div><!-- Close off-canvas wrapper inner -->
	</div><!-- Close off-canvas wrapper -->
</div><!-- Close off-canvas content wrapper -->
<?php endif; ?>


<?php wp_footer(); ?>
<?php do_action( 'foundationpress_before_closing_body' ); ?>
</body>
</html>

<?php
/**
 * Template part for Rowing Camps Custom Post Type
 **/

?>
<div class="tabs-panel" id="camp-staff">
	<h2><?php echo $campTitle;?>
		<em>
			<?php echo $campLocation;?>

			<?php
				if ($programType == 'program') echo 'Program Staff';
                else echo 'Coaching Staff'; ?>

		</em>
	</h2>

    	<?php $staff = get_field('staff'); ?>
			<?php if ($staff) : ?>

    		<?php foreach ($staff as $s) : ?>

    			<?php
    				$coachName = get_the_title( $s->ID );
	    			$coachCreds = get_field('staff_credentials', $s->ID);
			        $coachBio = get_field('staff_bio', $s->ID);
			        $coachPic = get_field('staff_photo', $s->ID);
			    ?>

    			<div class="coaching-staff">

			        <h4><?php echo $coachName; ?></h4>


			        <?php if( !empty($coachPic) ): ?>

						<img src="<?php echo $coachPic['url']; ?>" alt="<?php echo $coachPic['alt']; ?>" />

					<?php endif; ?>

					<h5><?php echo $coachCreds;?></h5>

					<p><?php echo $coachBio;?></p>

		        </div>

		        <hr>

    		<?php endforeach; ?>
    	<?php endif; ?>

</div>
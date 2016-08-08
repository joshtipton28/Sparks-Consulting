<?php
/**
 * Template part for Rowing Camps Custom Post Type
 **/
?>

<div class="tabs-panel camp-schedule" id="camp-schedule">
	<h2><?php echo $campTitle . '<em> ' . $campLocation . ' '; ?>Schedule</em></h2>


	<table class="stack">
		<thead>
			<tr>
				<?php if (have_rows('schedule_headings') ): ?>
					<?php while (have_rows('schedule_headings') ): the_row(); ?>
						<th><?php the_sub_field('schedule_th');?></th>
					<?php endwhile; ?>
				<?php endif;?>
			</tr>
		</thead>
		<tbody>
			<?php if (have_rows('schedule_content') ): $rowID = 0;?>
				<?php while (have_rows('schedule_content') ): the_row(); ?>
					<tr>
						<?php if (have_rows('schedule_column') ): $colID = 0; ?>
							<?php while (have_rows('schedule_column') ): the_row(); ?>
								<?php
									$rowSpan = get_sub_field('rowspan');
									$showDropdown = get_sub_field('display_dropdown');
									$rowID++;
									$colID++;
									$dropdownID = $rowID . $colID;
								?>

									<td rowspan="<?php echo $rowSpan;?>"

										<?php if ($showDropdown == "yes") : ?>
											data-toggle="column-<?php echo $dropdownID; ?>">

											<div class="dropdown-pane <?php if ($colID >= 3) echo "left";?>" id="column-<?php echo $dropdownID; ?>" data-dropdown data-hover="true" data-hover-pane="true">
												<?php the_sub_field('dropdown_content');?>
											</div>

										<?php else: ?>
											>
										<?php endif;?>

										<?php the_sub_field('table_content');?>

									</td>
							<?php endwhile; ?>
						<?php endif;?>
					</tr>
				<?php endwhile; ?>
			<?php endif; ?>

		</tbody>
		<tfoot>
			<tr>
				<?php if (have_rows('schedule_headings') ): ?>
					<?php while (have_rows('schedule_headings') ): the_row(); ?>
						<th><?php the_sub_field('schedule_th');?></th>
					<?php endwhile; ?>
				<?php endif;?>
			</tr>
		</tfoot>
	</table>

</div>


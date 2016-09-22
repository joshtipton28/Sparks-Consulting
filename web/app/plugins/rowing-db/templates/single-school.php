<?php get_header();

//Variables
$schoolUrl = get_field ( 'school_website_url' );
$womensPrograms = get_field ( 'womens_programs' );
$womensUrl = get_field ( 'womens_program_url' );
$mensPrograms = get_field ( 'mens_programs' );
$mensUrl = get_field ( 'mens_program_url' );
$sparksReport = get_field ( 'sparks_report_url' );
$enrollment = get_field ( 'enrollment_count' );
$tuition = get_field ( 'tuition' );
$instateTuition = get_field ( 'instate_tuition' );
$schoolCity = get_field ( 'school_city' );
$schoolState = get_field ( 'school_state' );
$location = $schoolCity . ', ' . $schoolState;
$stRatio = get_field ( 'st_ratio' );
$getEnvironment = get_term( get_field ( 'environment' ) );
$environmentName = $getEnvironment->name;
$getselectivity= get_term( get_field ( 'selectivity' ) );
$selectivityName = $getselectivity->name;
$financialAid = get_field ( 'financial_aid_score' );
$schoolPrivacy = get_field ( 'school_privacy' );
$getReligion= get_term( get_field ( 'religion' ) );
$religionName = $getReligion->name;
$foodServices = get_field ( 'food_services' );
$housingTypes = get_field ( 'housing_types' );
$housingAlcohol = get_field ( 'housing_alcohol' );
$housingSubTypes = get_field ( 'housing_sub_types' );
$majors = get_field ( 'school_majors' );

?>

<div class="row">
	<div class="large-6 small-12 columns">
		<h2><?php the_title(); ?></h2>
		<a href="<?php echo $schoolUrl; ?>" target="_blank">School Website</a>
		<table>
			<?php if (!empty($womensPrograms)): ?>
				<tr>
					<th>Women's Program(s):</th>
					<td>
						<?php

							$total = count($womensPrograms);
							$i=0;
							foreach ($womensPrograms as $program)
							{
								$i++;
								$programID = get_term( $program );
								$programName = $programID->name;
								echo $programName;
								if ($i != $total) echo ', ';
							}
						?>
						<a href="<?php echo $womensUrl; ?>">Women's Rowing Program Website</a>
					</td>
				</tr>
			<?php endif; ?>
			<?php if (!empty($mensPrograms)): ?>
				<tr>
					<th>Men's Program(s):</th>
					<td>
						<?php

							$total = count($mensPrograms);
							$i=0;
							foreach ($mensPrograms as $program)
							{
								$i++;
								$programID = get_term( $program );
								$programName = $programID->name;
								echo $programName;
								if ($i != $total) echo ', ';
							}
						?>
						<a href="<?php echo $mensUrl; ?>">Men's Rowing Program Website</a>
					</td>
				</tr>
			<?php endif; ?>
			<?php if (!empty($sparksReport)): ?>
				<tr>
					<th>Sparks Report:</th>
					<td>
						<a href="<?php echo $sparksReport; ?>" target="_blank">Click Here</a>
					</td>
				</tr>
			<?php endif; ?>
			<?php if (!empty($location)): ?>
				<tr>
					<th>Location:</th>
					<td>
						<a href="https://www.google.com/maps?q=<?php the_title(); ?>,+<?php echo $schoolCity; ?>,+<?php echo $schoolState; ?>" target="_blank"><?php echo $location; ?></a>
					</td>
				</tr>
			<?php endif; ?>
			<?php if (!empty($enrollment)): ?>
				<tr>
					<th>Enrollment:</th>
					<td>
						<?php echo number_format( $enrollment ); ?>
					</td>
				</tr>
			<?php endif; ?>
			<?php if (!empty($tuition)): ?>
				<tr>
					<th>Tuition:</th>
					<td>
						$<?php echo number_format( $tuition ); ?>
					</td>
				</tr>
			<?php endif; ?>
			<?php if (!empty($instateTuition)): ?>
				<tr>
					<th>In-State Tuition:</th>
					<td>
						$<?php echo number_format( get_field ( $instateTuition ) ); ?>
					</td>
				</tr>
			<?php endif; ?>
			<?php if (!empty($stRatio)): ?>
				<tr>
					<th>Classroom Ratio:</th>
					<td>
						<?php echo  $stRatio . ':1'; ?>
					</td>
				</tr>
			<?php endif; ?>
			<?php if (!empty($environmentName)): ?>
				<tr>
					<th>Environment:</th>
					<td>
						<?php  echo $environmentName ?>
					</td>
				</tr>
			<?php endif; ?>
			<?php if (!empty($selectivityName)): ?>
				<tr>
					<th>Selectivity:</th>
					<td>
						<?php echo $selectivityName; ?>
					</td>
				</tr>
			<?php endif; ?>
			<?php if (!empty($financialAid)): ?>
				<tr>
					<th>Financial Aid Score:</th>
					<td>
						<?php echo $financialAid; ?>
					</td>
				</tr>
			<?php endif; ?>
			<?php if (!empty($schoolPrivacy)): ?>
				<tr>
					<th>Private/Public:</th>
					<td>
						<?php if ( $schoolPrivacy == 1 ):
								echo 'Public';
							elseif ($schoolPrivacy == 2 ):
								echo 'Private';
							endif;
						?>
					</td>
				</tr>
			<?php endif; ?>
			<?php if (!empty($religionName)): ?>
				<tr>
					<th>Religious Affiliation:</th>
					<td>
						<?php echo $religionName; ?>
					</td>
				</tr>
			<?php endif; ?>
			<?php if (!empty($foodServices)): ?>
				<tr>
					<th>Food Services:</th>
					<td>
						<?php

							$total = count($foodServices);
							$i=0;
							foreach ($foodServices as $foodService)
							{
								$i++;
								$selectivityID = get_term( $foodService );
								$selectivityName = $selectivityID->name;
								echo $selectivityName;
								if ($i != $total) echo ', ';
							}
						?>
					</td>
				</tr>
			<?php endif; ?>
			<?php if (!empty($housingTypes)): ?>
				<tr>
					<th>Housing, Types:</th>
					<td>
						<?php

							$total = count($housingTypes);
							$i=0;
							foreach ($housingTypes as $housingType)
							{
								$i++;
								$housingID = get_term( $housingType );
								$housingName = $housingID->name;
								echo $housingName;
								if ($i != $total) echo ', ';
							}
						?>
					</td>
				</tr>
			<?php endif; ?>
			<?php if (!empty($housingAlcohol)): ?>
				<tr>
					<th>Housing, Alcohol:</th>
					<td>
						<?php if ( $housingAlcohol == 1 ):
								echo 'Allowed';
							elseif ($housingAlcohol == 2 ):
								echo 'Not Allowed';
							endif;
						?>
					</td>
				</tr>
			<?php endif; ?>
			<?php if (!empty($housingSubTypes)): ?>
				<tr>
					<th>Housing, Sub-types:</th>
					<td>
						<?php

							$total = count($housingSubTypes);
							$i=0;
							foreach ($housingSubTypes as $housingSubType)
							{
								$i++;
								$housingID = get_term( $housingSubType );
								$housingName = $housingID->name;
								echo $housingName;
								if ($i != $total) echo ', ';
							}
						?>
					</td>
				</tr>
			<?php endif; ?>
		</table>
	</div>

	<div class="large-6 small-12 columns">
		<a class="button">Back to Search Results</a>
		<a href="<?php echo $schoolUrl; ?>" target="_blank">
			<?php if ( has_post_thumbnail() ) {
				the_post_thumbnail();
			} ?>
		</a>

		<h4>Related Info: <a href="<?php the_field ( 'row2k_url' ); ?>" target="_blank">Row2k</a> | <a href="http://ope.ed.gov/athletic" target="_blank">Equity in Athletics</a>
		</h4>
		<hr>
		<?php if (!empty($majors)): ?>
			<h4>Majors:</h4>
				<?php
					$total = count($majors);
					$i=0;
					foreach ($majors as $major)
					{
						$i++;
						$majorID = get_term( $major );
						$majorName = $majorID->name;
						echo $majorName;
						if ($i != $total) echo ', ';
					}
				?>
		<?php endif; ?>
	</div>
</div>


<?php get_footer();
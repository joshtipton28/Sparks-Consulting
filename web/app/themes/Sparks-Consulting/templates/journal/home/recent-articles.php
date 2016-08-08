<div class="journal-container">
	<div id="journal-recent" class="journal-recent row">
		<div class="large-8 small-12 columns">
			<?php
				$paged = (get_query_var('paged')) ? get_query_var('paged') : 1;
				$args = array(
				    'post_type' => array('journal-article'),
				    'posts_per_page' => "6",
				    'paged' => $paged
				);
				$loop = new WP_Query( $args );



				while ( $loop->have_posts() ) : $loop->the_post();

				$journalCat = get_the_terms(0, 'journal-category'); //Get custom taxonomy
				$author = get_the_author(); ?>

				<div class="journal-home-article">

					<?php if ( has_post_thumbnail() ):?>
						<a class="feat-journal-img" href="<?php the_permalink();?>">
							<?php the_post_thumbnail('recent-journal'); ?>
						</a>

						<?php if ($journalCat):
							foreach ($journalCat as $custom_tax): ?>
								<div class="category-tag">
									<strong>
	    								<?php echo $custom_tax->name; ?>
	    							</strong>
	    						</div>
							<?php endforeach; ?>
						<?php endif; // End Custom Taxonomy?>
					<?php endif; // End Post Thumbnail?>

					<h4 class="recent-title">
						<a href="<?php the_permalink(); ?>">
							<?php the_title(); ?>
						</a>
					</h4>

					<h6><?php foundationpress_entry_meta(); ?></h6>
					<div class="journal-single-content">
						<?php the_excerpt();?>
					</div>

					<a class="journal-read-more" href="<?php the_permalink(); ?>">Read More</a>

				</div>

			<?php endwhile; ?>

			<?php /* Display navigation to next/previous pages when applicable */ ?>
			<?php if ( function_exists( 'foundationpress_pagination' ) ) { foundationpress_pagination(); } else if ( is_paged() ) : ?>
				<nav id="post-nav">
					<div class="post-previous"><?php next_posts_link( __( '&larr; Older posts', 'foundationpress' ) ); ?></div>
					<div class="post-next"><?php previous_posts_link( __( 'Newer posts &rarr;', 'foundationpress' ) ); ?></div>
				</nav>
			<?php endif; ?>

			<?php wp_reset_postdata(); // reset to the original page data ?>
		</div>

		<?php include(locate_template('templates/journal/home/sidebar.php' )); //Journal Home Sidebar?>

	</div>
</div>
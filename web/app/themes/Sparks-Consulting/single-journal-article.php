<?php
/**
 * The template for displaying all single posts and attachments
 *
 * @package WordPress
 * @subpackage FoundationPress
 * @since FoundationPress 1.0.0
 */

$journalCat = get_the_terms(0, 'journal-category'); //Get custom taxonomy

get_header(); ?>
<div class="journal-container">
	<div id="single-post" role="main" class="row single-post">

	<?php do_action( 'foundationpress_before_content' ); ?>
	<?php while ( have_posts() ) : the_post(); ?>
		<article class="journal-single small-12 large-8 columns" id="post-<?php the_ID(); ?>">

			<?php do_action( 'foundationpress_post_before_entry_content' ); ?>

			<?php $featuredVideo = get_field('featured_video');?>

			<?php if (!empty($featuredVideo) ):
					echo $featuredVideo;

				else:
					 if ( has_post_thumbnail() ) : ?>

					<?php the_post_thumbnail( '', array('class' => 'th') ); ?>

					<?php if ($journalCat):
							foreach ($journalCat as $custom_tax): ?>
								<div class="category-tag">
									<strong>
	    								<?php echo $custom_tax->name; ?>
	    							</strong>
	    						</div>
							<?php endforeach; ?>
						<?php endif; // End Custom Taxonomy?>

				<?php endif; ?>
			<?php endif; ?>

				<header>
					<h1 class="entry-title"><?php the_title(); ?></h1>
					<?php foundationpress_entry_meta(); ?>
				</header>
				<div class="journal-single-content">
					<?php the_content(); ?>
				</div>

				<footer>
					<?php wp_link_pages( array('before' => '<nav id="page-nav"><p>' . __( 'Pages:', 'foundationpress' ), 'after' => '</p></nav>' ) ); ?>
					<p><?php the_tags(); ?></p>
				</footer>

		</article>
	<?php endwhile;?>

	<?php do_action( 'foundationpress_after_content' ); ?>

	<?php include(locate_template('templates/journal/home/sidebar.php' )); //Journal Home Sidebar?>

	</div>
</div>

<?php include(locate_template('parts/journal-footer.php' )); ?>

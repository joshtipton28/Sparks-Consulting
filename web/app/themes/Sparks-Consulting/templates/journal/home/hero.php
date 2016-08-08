<?php while ( have_posts() ) : the_post(); ?>
	<div class="journal-hero">
		<div class="journal-hero-img">
			<?php if ( has_post_thumbnail() ) {
			the_post_thumbnail('full', array('class' => 'full-bg-img'));
			} ?>
		</div>

		<div class="journal-hero-content">
			<div class="row">
				<h1><?php the_field("blurb_title"); ?></h1>
					<div class="journal-blurb large-4 small-10 columns end">
						<?php the_content(); ?>
						<a class="hero-more scroll" href="#journal-recent"></a>
					</div>

			</div>
		</div>
	</div>
<?php endwhile;?>
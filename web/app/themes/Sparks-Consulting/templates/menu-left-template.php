<?php
/*
Template Name: Tab Menu Left
*/
get_header();?>

<?php //vars
	$pageID = get_the_ID();
?>

<?php do_action( 'foundationpress_before_content' ); ?>
  <?php while ( have_posts() ) : the_post(); ?>

<div class="full-bg">
	<?php if ( has_post_thumbnail() ) {
	the_post_thumbnail('full', array('class' => 'full-bg-img'));
	} ?>
</div>

<div class="page-wrap">
<div class="row">
	<?php if( have_rows('content_tabs') ): ?>
	<?php $tabCount = 0; ?>
		<div class="tabs-wrap medium-4 columns">
			<h3><?php the_title();?></h3>
			<ul class="tabs vertical" data-tabs id="<?php echo $pageID; ?>">
			<?php while ( have_rows('content_tabs') ) : the_row(); ?>
			<?php $tabCount++; ?>
				<li class="tabs-title" id="link-<?php echo $tabCount; ?>"><a href="#panel-<?php echo$tabCount; ?>"><?php the_sub_field('menu_title'); ?><i class="fa fa-chevron-right"></i></a></li>
			<?php endwhile; ?>
			</ul>
		</div>
	<?php endif; ?>
	<?php if( have_rows('content_tabs') ): ?>
	<?php $tabCount = 0; ?>
	    <div class="nano has-scrollbar tabs-content vertical medium-8 columns" data-tabs-content="<?php echo $pageID; ?>">
	        <div class="nano-content">
	        <?php while ( have_rows('content_tabs') ) : the_row(); ?>
	        	<?php $tabCount++; ?>
	        	<div class="tabs-panel" id="panel-<?php echo$tabCount; ?>">
	        		<?php the_sub_field('tab_content'); ?>
	        	</div>
	        <?php endwhile; ?>
	        </div>
	    </div>
	<?php endif; ?>
</div>
</div>

  <?php endwhile;?>

<?php do_action( 'foundationpress_after_content' ); ?>

<?php get_footer(); ?>
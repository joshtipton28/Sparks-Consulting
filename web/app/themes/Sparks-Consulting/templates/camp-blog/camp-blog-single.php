<?php
/**
 * Template part for Camp Blog - Single Post Template
 **/
?>
<div class="rff-single tabs-panel is-active" id="single-camp-blog">
	<?php while ( have_posts() ) : the_post(); ?>
    <h2><?php the_title();?></h2>
    <hr>
    <?php the_content();?>
   	<?php endwhile;?>

</div><!--tab panels-->
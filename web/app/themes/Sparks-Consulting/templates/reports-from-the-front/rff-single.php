<?php
/**
 * Template part for Reports from the Front - Single Article
 **/
?>
<div class="nano has-scrollbar tabs-content medium-8 columns">
    <div class="rff-single nano-content">
      <?php while ( have_posts() ) : the_post(); ?>

        <h2>
          <span>Reports From the Front</span>
          <?php the_title();?>
        </h2>

        <hr>

        <?php the_content();?>

        <br>

        <a class="sparks-back" href="<?php echo home_url();?>/working-with-us/#reports-from-the-front">
          <i class="fa fa-chevron-left"></i> Back
        </a>

  <?php endwhile;?>
    </div>
</div>

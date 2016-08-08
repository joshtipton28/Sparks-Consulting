<?php
/**
 * Template part for Camp Blog - All Posts
 **/
?>

<?php

    $args = array( 'post_type' => 'camp-blogs', 'posts_per_page' => -1 );
    $allPosts = new WP_Query( $args );
    $cur_month = 0;
    $cur_year = 0;

?>

<div class="tabs-panel is-active rff-archive" id="all-posts">
    <h2>All Camp Blog Posts</h2>
    <hr>

    <?php while ( $allPosts->have_posts() ) : $allPosts->the_post();?>

  <?php

    $post_month = get_the_date('F');
      $post_year = get_the_date('Y');

        if($cur_month != $post_month || $cur_year != $post_year) {
           echo $cur_year != 0 ? '</ul><hr>' : '';
           echo '<h3>' . $post_month . ' ' . $post_year . '</h3><ul>';
           $cur_month = $post_month;
           $cur_year = $post_year;
    }?>

    <li><a href="<?php the_permalink();?>" title="<?php the_title();?>"><?php the_title();?></a></li>

    <?php endwhile;?>

<?php wp_reset_postdata();?>
</div><!--tab panels-->
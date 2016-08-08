<?php
/**
 * Template part for Camp Blog - Advanced Physiology
 **/

	$tax = array(
		'posts_per_page' => -1,
		'tax_query' => array(
			array(
				'taxonomy' => 'camp-blog-category',
				'field' => 'slug',
				'terms' => 'advanced-physiology'
			)
		)
	);

	$physioCampBlog = new WP_Query( $tax );

?>


            <div class="tabs-panel rff-archive" id="advanced-physiology-camp">
                <h2>Advanced Physiology Camp</h2>

				<?php while ( $physioCampBlog->have_posts() ) : $physioCampBlog->the_post();?>

					<?php $test = get_the_terms(); echo $test;?>

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
        </div><!--nano-content-->
    </div><!--nano-->
</div><!--row-->
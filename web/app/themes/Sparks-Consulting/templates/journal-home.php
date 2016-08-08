<?php
/*
Template Name: Journal Home
*/
get_header(); ?>

<?php do_action( 'foundationpress_before_content' ); ?>

<?php include(locate_template('templates/journal/home/hero.php' )); ?>

<?php include(locate_template('templates/journal/home/recent-articles.php' )); ?>

<?php do_action( 'foundationpress_after_content' ); ?>


<?php include(locate_template('parts/journal-footer.php' )); ?>

<?php

add_action ('rowing_db_single', 'rowing_db_single_layout_begin', 1);

function rowing_db_single_layout_begin(){ ?>
	<div class="row">
		<div class="large-6 small-12 columns">
		<h2><?php the_title(); ?></h2>
		<a href="<?php echo $schoolUrl; ?>" target="_blank">School Website</a>
		<table>
<?php }


add_action ('rowing_db_single', 'rowing_db_single_layout_end', 200);

function rowing_db_single_layout_end(){ ?>
		</div>
	</div>
<?php }
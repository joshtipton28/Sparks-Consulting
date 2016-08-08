<?php
/**
 * Template part for Rowing Camps Custom Post Type
 **/
?>
<div class="tabs-panel camp-details" id="camp-details">
	<h2><?php echo $campTitle . '<em> ' . $campLocation . ' ';?>Details</em></h2>
<?php if( have_rows('camp_details') ): ?>
    
    <ul>
 
    <?php while( have_rows('camp_details') ): the_row(); ?>
        
        <?php 
        
	        $detailType = get_sub_field('detail_type'); 
	        $detailContent = get_sub_field('detail_content');
            
        ?>

    	<li>
            <strong><?php echo $detailType; ?>:&nbsp;</strong>
            <?php echo $detailContent; ?>
        </li>
    
    <?php endwhile; ?>

    </ul>
 
<?php endif; ?>
</div>
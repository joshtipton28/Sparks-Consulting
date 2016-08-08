<?php
/**
 * Template part for Rowing Camps Custom Post Type
 * Navigation for Tab Menus and opening HTML
 **/
?>
<script type="text/javascript">
jQuery(document).ready(function() {
        function open_tab() {
            if(window.location.hash){
                jQuery('li.tabs-title a').each(function(){
                    var hash = '#' + jQuery(this).attr('href').split('#')[1];
                    if(hash === window.location.hash){
                        jQuery(this).click();
                        jQuery(".nano").nanoScroller({ scroll: 'top' });
                    }
                });
            }
        }

        jQuery(window).bind('hashchange', function() {
            open_tab();
        });

        jQuery("li.tabs-title a").click(function(){
            var hash =jQuery(this).attr('href').split('#')[1];
            window.location.hash = hash;

        });

        open_tab();
    });
</script>

<?php
	$showSchedule = get_field('show_schedule');
	$campTitle = get_field('camp_title');
	$campName = get_field('camp_name');
	$campLocation = get_field('camp_location');
?>

	<div class="camps-tab tabs-content nano has-scrollbar large-8 columns end" data-tabs-content="rowing-camp-tabs">
        <div class="nano-content">
            <ul class="tabs" data-tabs id="rowing-camp-tabs">
                <li class="horizontal tabs-title is-active"><a href="#camp-overview" aria-selected="true">Camp Overview</a></li>
                <li class="horizontal tabs-title">
                    <a href="#camp-staff">
                    <?php if ($programType == 'program')
                            echo 'Program Staff';
                            else echo 'Coaching Staff'; ?>
                    </a>
                </li>
                <li class="horizontal tabs-title"><a href="#camp-details">Details</a></li>
                <li class="horizontal tabs-title">
                    <a class="register-button" href="#camp-registration">
                        <?php if ($programType == 'program')
                            echo 'Apply';
                            else echo 'Registration'; ?>
                    </a>
                </li>

                <?php /**Conditional for Camp Type**/
                if ($programType == 'camp') : ?>
                    <li class="horizontal tabs-title"><a href="#camp-schedule">Schedule</a></li>
                <?php endif ?>

                <?php /**Conditional for Camp Forms**/
                if (get_field('display_forms_tab') == 1 ) : ?>

                    <li class="horizonal tabs-title"><a href="#camp-forms">Camp Forms</a></li>

                <?php endif; ?>
            </ul>

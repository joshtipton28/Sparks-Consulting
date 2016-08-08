<script type="text/javascript">
    jQuery(document).ready(function() {
       jQuery(".show-for-large ul li.active").parents('li.accordion-item').find('a').click();
    });
</script>
<div class="camp-accordion large-3 columns end">

  <?php /*Mobile Accordion Menu */ ?>
  <div class="tab-accordion hide-for-large">
    <ul class="accordion" data-accordion  data-allow-all-closed="true">
      <li class="accordion-item <?php if(get_the_title() == 'Rowing Camps') { ?>is-active<?php } ?>" data-accordion-item>
        <a href="#" class="accordion-title"><h3><?php the_title();?><i class="fa fa-chevron-down"></i></h3></a>
          <div class="accordion-content" data-tab-content>
            <ul class="menu vertical nested accordion" data-accordion data-allow-all-closed="true">
              <li class="accordion-item" data-accordion-item>
                <a class="accordion-title">Summer Camps<i class="fa fa-chevron-right"></i></a>

                    <?php dynamic_sidebar('summer-menu'); ?>

              </li>
              <li class="accordion-item" data-accordion-item>
                <a class="accordion-title">Winter Camps<i class="fa fa-chevron-right"></i></a>

                    <?php dynamic_sidebar('winter-menu'); ?>

              </li>
              <li class="accordion-item" data-accordion-item>
                <a class="accordion-title">International Programs<i class="fa fa-chevron-right"></i></a>

                    <?php dynamic_sidebar('development-programs-menu'); ?>
              </li>

            </ul>
            <ul class="menu vertical nested accordion">
              <li class="accordion-item">
                <a class="accordion-title map-button" href="<?php echo get_home_url(); ?>/map-of-camp-locations">
                  Camp Dates and Locations<i class="fa fa-chevron-right"></i>
                </a>
              </li>
            </ul>
          </div>
      </li>
    </ul>
  </div>


  <?php /*Desktop Menu*/ ?>
  <div class="show-for-large">
    <h3><?php the_title();?></h3>
      <ul class="accordion" data-accordion data-allow-all-closed="true">
        <li class="accordion-item" data-accordion-item>
          <a class="accordion-title">Summer Camps<i class="fa fa-chevron-right"></i></a>

              <?php dynamic_sidebar('summer-menu'); ?>

        </li>
        <li class="accordion-item" data-accordion-item>
          <a class="accordion-title">Winter Camps<i class="fa fa-chevron-right"></i></a>

              <?php dynamic_sidebar('winter-menu'); ?>

        </li>
        <li class="accordion-item" data-accordion-item>
          <a class="accordion-title">International Programs<i class="fa fa-chevron-right"></i></a>

              <?php dynamic_sidebar('development-programs-menu'); ?>
        </li>

      </ul>
      <ul class="accordion">
        <li class="accordion-item">
          <a class="accordion-title map-button" href="<?php echo get_home_url(); ?>/map-of-camp-locations">
            Camp Dates and Locations<i class="fa fa-chevron-right"></i>
          </a>
        </li>
      </ul>
  </div>
</div>
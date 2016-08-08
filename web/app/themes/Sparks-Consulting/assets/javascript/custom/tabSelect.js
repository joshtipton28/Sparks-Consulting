/* Enable deep linking from external pages */

if(window.location.hash) {
  var hash = window.location.hash;
  $('.accordion a[href="' + hash + '"]').trigger('click');
  $('.tabs a[href="' + hash + '"]').trigger('click');
}

function open_tab(tab_id,panel) {
  $("#"+tab_id).foundation("selectTab",$("#"+panel));
}


/*Enabling On-page deep-linking
*
* Add internal link class to each on page internal link that you create.
*
*/


function changeTabHandler(tabGroupId, tabId) {
  return function(e) {
    e.preventDefault();
    var ret = $(tabGroupId).foundation("selectTab", $(tabId));
    return false;
  }
}

$(".college-counseling").on('click',changeTabHandler("#working-with-us","#college-counseling"));
$(".coxswain-program").on('click',changeTabHandler("#working-with-us","#coxswain-program"));
$(".internal-applicants").on('click',changeTabHandler("#working-with-us","#internal-applicants"));
$(".gap-year-advising").on('click',changeTabHandler("#working-with-us","#gap-year-advising"));
$(".reports-from-the-front").on('click',changeTabHandler("#working-with-us","#reports-from-the-front"));
$(".our-approach").on('click',changeTabHandler("#working-with-us","#our-approach"));
$(".counseling-testimonials").on('click',changeTabHandler("#working-with-us","#counseling-testimonials"));
$(".rowing-camp-testimonials").on('click',changeTabHandler("#working-with-us","#rowing-camp-testimonials"));
$(".coxswain-testimonials").on('click',changeTabHandler("#working-with-us","#coxswain-testimonials"));

//Rowing Camp Internal Deep Linking
$(".camp-overview").on('click',changeTabHandler("#rowing-camp-tabs","#camp-overview"));
$(".camp-staff").on('click',changeTabHandler("#rowing-camp-tabs","#camp-staff"));
//$(".camp-details").on('click',changeTabHandler("#rowing-camp-tabs","#camp-details"));
$(".camp-registration").on('click', changeTabHandler('#rowing-camp-tabs','#camp-registration'));
$(".camp-schedule").on('click',changeTabHandler("#rowing-camp-tabs","#camp-schedule"));

//About Us Internal Deep Linking
$(".overview").on('click',changeTabHandler("#about-us","#overview"));
$(".leadership").on('click',changeTabHandler("#about-us","#leadership"));
$(".counseling-associates").on('click',changeTabHandler("#about-us","#counseling-associates"));
$(".coxing-associates").on('click',changeTabHandler("#about-us","#coxing-associates"));
$(".international-associates").on('click',changeTabHandler("#about-us","#international-associates"));
$(".administrative-associates").on('click',changeTabHandler("#about-us","#administrative-associates"));
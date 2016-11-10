<div class="filter-bar-wrapper">
  <div class="filter-bar large-4 columns" ng-controller="SidebarController">
    <h3>Filters:</h3>
    <a ng-click='reset()'>Reset</a>
    <ul ng-controller="FilterCtrl">
      <li><a>Program Type</a></li>
      <li><a ng-click='open("enrollment_count")'>Enrollment</a></li>
      <li><a ng-click='open("tuition")'>Tuition</a></li>
      <li><a ng-click='open("financial_aid_score")'>Financial Aid Score</a></li>
      <li><a ng-click='open("st_ratio")'>Classroom Ratio</a></li>
      <li><a ng-click='open("environment")'>Environment</a></li>
      <li><a>Location</a></li>
      <li><a>Selectivity</a></li>
      <li><a ng-click='open("academic_intensity")'>Academic Intensity</a></li>
      <li><a ng-click='open("school_privacy")'>Private/Public</a></li>
      <li><a>Religious Affiliation</a></li>
      <li><a>Majors</a></li>
      <li><a>Food Service</a></li>
      <li><a>Housing, Types</a></li>
      <li><a>Housing, Sub-types</a></li>
      <li><a ng-click='open("housing_alcohol")'>Housing, Alcohol</a></li>
    </ul>
    <!--<ng-include src="getReligion()"></ng-include>
    <ng-include src="getProgram()"></ng-include>-->
    <ng-include src="getEnrollment()"></ng-include>
  </div>
</div>

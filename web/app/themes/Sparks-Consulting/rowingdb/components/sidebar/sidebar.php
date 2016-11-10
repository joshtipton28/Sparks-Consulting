<div class="filter-bar-wrapper">
  <div class="filter-bar large-4 columns" ng-controller="SidebarController">
    <h3>Filters:</h3>
    <a ng-click='reset()'>Reset</a>
    <ul>
      <li><a ng-controller="ProgramFilter" ng-click='open()'>Program Type</a></li>
      <li><a ng-controller="EnrollmentFilter" ng-click='open()'>Enrollment</a></li>
      <li><a>Tuition</a></li>
      <li><a>Financial Aid Score</a></li>
      <li><a>Classroom Ratio</a></li>
      <li><a>Environment</a></li>
      <li><a>Location</a></li>
      <li><a>Selectivity</a></li>
      <li><a>Academic Intensity</a></li>
      <li><a>Private/Public</a></li>
      <li><a ng-controller="ReligionFilter" ng-click='open()'>Religious Affiliation</a></li>
      <li><a>Majors</a></li>
      <li><a>Food Service</a></li>
      <li><a>Housing, Types</a></li>
      <li><a>Housing, Sub-types</a></li>
      <li><a>Housing, Alcohol</a></li>
    </ul>
    <ng-include src="getReligion()"></ng-include>
    <ng-include src="getProgram()"></ng-include>
    <ng-include src="getEnrollment()"></ng-include>
  </div>
</div>

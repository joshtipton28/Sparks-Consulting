<div class="filter-bar-wrapper">
  <div class="filter-bar large-4 columns" ng-controller="SidebarController">
    <h3>Filters:</h3>
    <a ng-click='reset()'>Reset</a>
    <ul ng-controller="FilterCtrl">
      <li ng-repeat="(type_id, type) in filter.types_map">
        <a ng-click='open(type_id)'
           ng-class='{"filters[type_id]": "lead"}'>
          {{ type.title }}
        </a>
      </li>
    </ul>
    <!--<ng-include src="getReligion()"></ng-include>
    <ng-include src="getProgram()"></ng-include>-->
    <ng-include src="getEnrollment()"></ng-include>
  </div>
</div>

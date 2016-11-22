<div class="filter-bar-wrapper">
  <div class="filter-bar" ng-controller="SidebarController">
    <h3>Filters:</h3>
    <a class="rdb-reset" ng-click='reset()'>Reset</a>
    <ul ng-controller="FilterCtrl">
      <li ng-repeat="(type_id, type) in filter.types_map">
        <a class="filter-link" ng-click='open(type_id)'
           ng-class="{'sidebar-filter-active': filterIsActive(filter.filters[type_id])}">
          {{ type.title }}
        </a>
      </li>
    </ul>
    <!--<ng-include src="getReligion()"></ng-include>
    <ng-include src="getProgram()"></ng-include>-->
    <ng-include src="getEnrollment()"></ng-include>
  </div>
</div>

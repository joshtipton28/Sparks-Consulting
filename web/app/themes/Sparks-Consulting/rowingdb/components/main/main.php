<ng-include src="getSidebar()"></ng-include>

<div class="rowing-priorities-wrapper">
  <div class="map large-8 columns">
    <header class="rowing-priorities-header">
      <h5>My Priorities:</h5>
      <div class="rowing-priorities">
        <select class="rowing-priority large-4 columns" ng-model="filter.priority">
          <option value="Enrollment">Enrollment</option>
          <option value="Religion">Religious Affiliation</option>
        </select>
        <select class="rowing-priority large-4 columns">
          <option>Secondary</option>
        </select>
        <select class="rowing-priority large-4 columns">
          <option>Tertiary</option>
        </select>
      </div>
    </header>
    <div class="rowing-map map">
      <!-- Start Debugging -->
      <div style="border: 2px white dotted;">
        <h4>query</h4>
        <pre>{{ query | json }}</pre>
      </div>

      <div style="border: 2px white dotted;">
        <h4>filter</h4>
        <pre>{{ filter | json }}</pre>
      </div>

      <div style="border: 2px white inset;"
           ng-repeat="college in colleges | filter:filter.religion | filter:query | limitTo:2">
        <h4>college</h4>
        <pre>{{ college | json }}</pre>
      </div>
      <!-- End Debugging -->

      <h1>{{filtered.length}} Colleges</h1>
      <a ui-sref="listing">Show Schools</a>

      <ul>
        <li ng-repeat="college in colleges | filter:filter.religion | filter:query as filtered">
          {{college.acf.school_zip}}
        </li>
      </ul>
    </div>
  </div>
</div>

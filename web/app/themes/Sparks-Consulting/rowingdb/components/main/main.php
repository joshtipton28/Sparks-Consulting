<ng-include src="getSidebar()"></ng-include>

<div class="rowing-priorities-wrapper">
  <div class="map large-8 columns">
    <header class="rowing-priorities-header">
      <h5>My Priorities:</h5>
      <div class="rowing-priorities">
        <select class="rowing-priority large-4 columns"
                ng-repeat="priority_idx in [0,1,2]"
                ng-model="filter.priority[priority_idx]">
          <option ng-repeat="priority in priorities"
                  value="{{ priority.id }}">
            {{ priority.name }}
          </option>
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
      <!-- <a ui-sref="listing">Show Schools</a> -->
      <table>
        <tr>
          <td>School Name</td>

        </tr>
      </table>

      <ul>
        <li ng-repeat="college in colleges | filter:filter.religion | filter:query as filtered">
          {{college.acf.school_zip}}
        </li>
      </ul>
    </div>
  </div>
</div>

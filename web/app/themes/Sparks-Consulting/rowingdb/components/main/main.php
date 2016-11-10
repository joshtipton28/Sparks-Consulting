<ng-include src="getSidebar()"></ng-include>

<div class="rowing-priorities-wrapper">
  <div class="map large-8 columns">
    <header class="rowing-priorities-header">
      <h5>My Priorities:</h5>
      <div class="rowing-priorities">
        <select class="rowing-priority large-4 columns"
                ng-repeat="priority_idx in [0,1,2]"
                ng-model="filter.priority[priority_idx]">
          <option ng-repeat="priority in priorities | filter:prioritiesFilter(priority_idx)"
                  value="{{ priority.id }}">
            {{ priority.name }}
          </option>
        </select>
      </div>
    </header>
    <div class="rowing-map map">
      <!-- Start Debugging -->
      <div style="border: 2px white inset;"
           ng-repeat="college in colleges | limitTo:3">
        <h4>college</h4>
        <pre>{{ college | json }}</pre>
      </div>
      <!-- End Debugging -->

      <h1>{{filtered.length}} Colleges</h1>
      <!-- <a ui-sref="listing">Show Schools</a> -->
      <table class="hover">
        <thead>
          <tr>
            <th>School Name</th>
            <th ng-repeat="priority in get_priorities()">
              {{ priority.name }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr ng-repeat="college in colleges | filter:filter.religion | filter:query as filtered">
            <td>{{ college.title.rendered }}</td>
            <td ng-repeat="priority in get_priorities()"
                ng-bind-html="render_acf_text(priority, college.acf)">
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

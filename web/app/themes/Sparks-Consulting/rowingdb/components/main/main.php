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
      <!-- Link to listing results -->
      <a ui-sref="listing">View Results</a>

      <h1>{{filtered.length}} Colleges</h1>

      <!-- Dynamic map -->
      <ng-map zoom="4" center="[41.850033, -87.6500523]">
        <marker ng-repeat="college in colleges | filter:masterFilter | filter:hasLocationFilter"
                position="{{college.acf.school_city}}, {{college.acf.school_state}}"
                style="height:400px;"></marker>
      </ng-map>

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
          <tr ng-repeat="college in colleges | filter:masterFilter as filtered">
            <td ng-bind-html="trustHtml(college.title.rendered)"></td>
            <td ng-repeat="priority in get_priorities()">
              {{ render_acf_text(priority, college.acf) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

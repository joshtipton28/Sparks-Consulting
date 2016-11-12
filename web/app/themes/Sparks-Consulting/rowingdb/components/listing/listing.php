<div class="rowing-priorities-wrapper">
  <div class="map large-12 columns college-results">
    <header class="colleges-list-header">
      <h5>
        Results (Showing {{filtered.length}} colleges)
      </h5>
      <div style="float: right; padding-top: 15px;">
        <button type="button"
                class="button"
                style="margin-right: 10px;"
                ng-click="go('home')">
          Modify Filters
        </button>
        <button type="button"
                class="button"
                ng-click="resetFilters(); go('home')">
          Start Over
        </button>

      </div>
    </header>

    <div class="colleges-list">
      <!-- Start Debugging -->
      <div style="border: 2px white dotted;">
        <h4>filters</h4>
        <pre>{{ filter.filters | json }}</pre>
      </div>
      <div style="border: 2px white inset;"
           ng-repeat="college in colleges | limitTo:2">
        <h4>college</h4>
        <pre>{{ college | json }}</pre>
      </div>
      <!-- End Debugging -->

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

<div class="rowing-priorities-wrapper">
  <div class="map large-12 columns college-results">
    <header class="colleges-list-header">
      <h5>
        Results(Showing {{filtered.length}} colleges)
      </h5>
      <div style="float: right;">
        <a ui-sref="home" class="button">Modify Filters</a>
        <a ui-sref="home" class="button">Start Over</a>
      </div>
    </header>
    <div class="colleges-list map">
      <!-- Start Debugging -->
      <div style="border: 2px white dotted;">
        <h4>filters</h4>
        <pre>{{ filter.filters | json }}</pre>
      </div>
      <div style="border: 2px white inset;"
           ng-repeat="college in colleges | limitTo:1">
        <h4>college</h4>
        <pre>{{ college | json }}</pre>
      </div>
      <!-- End Debugging -->

      <h1>{{filtered.length}} Colleges</h1>
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

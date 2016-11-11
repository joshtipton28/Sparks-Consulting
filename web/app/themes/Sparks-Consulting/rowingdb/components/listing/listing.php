<div class="rowing-priorities-wrapper">
  <div class="map large-12 columns college-results">
    <header class="colleges-list-header">
      <h5>
        Results (Showing {{filtered.length}} colleges)
      </h5>
      <div style="float: right; padding-top: 15px;">
        <a ui-sref="home" class="button" style="margin-right: 10px;">
          Modify Filters
        </a>
        <a ui-sref="home" class="button">
          Start Over
        </a>
      </div>
    </header>
    <div class="colleges-list">
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

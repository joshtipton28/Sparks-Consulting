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
      <!--<div style="border: 2px white dotted;">
        <h4>filters</h4>
        <pre>{{ filter.filters | json }}</pre>
      </div>
      <div style="border: 2px white inset;"
           ng-repeat="college in colleges | limitTo:2">
        <h4>college</h4>
        <pre>{{ college | json }}</pre>
      </div>-->
      <!-- End Debugging -->

      <table class="hover">
        <thead>
          <tr>
            <th>
              <a href="#" ng-click="setSort('name')">
                School Name
                <span ng-show="sort.priority == 'title.slug'"
                      class="fa"
                      ng-class="{'fa-caret-up': sort.direction,
                                 'fa-caret-down': !sort.direction}">
                </span>
              </a>
            </th>
            <th ng-repeat="priority in get_priorities()">
              <a href="#" ng-click="setSort('acf.' + priority.id)">
                {{ priority.name }}
                <span ng-show="sort.priority == 'acf.' + priority.id"
                      class="fa"
                      ng-class="{'fa-caret-up': sort.direction,
                                 'fa-caret-down': !sort.direction}">
                </span>
              </a>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr ng-repeat="college in colleges | filter:masterFilter | orderBy:sort.priority:sort.direction as filtered">
            <td>
              <a ng-href="rowing-teams/{{college.slug}}"
                 ng-bind-html="trustHtml(college.title.rendered)">

              </a>
            </td>
            <td ng-repeat="priority in get_priorities()">
              {{ college.acf[priority.id] }} {{ render_acf_text(priority, college.acf) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

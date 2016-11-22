<div class="rowing-priorities-wrapper">
  <div class="map large-12 columns college-results">
    <header class="colleges-list-header">
      <h5>
        Results (Showing {{filtered.length}} colleges)
      </h5>
      <div class="listing-controls">
        <button type="button"
                class="btn btn-info"
                ng-click="go('home')">
          Modify Filters
        </button>
        <button type="button"
                class="btn btn-info"
                ng-click="resetFilters(); go('home')">
          Start Over
        </button>

      </div>
    </header>

    <div class="colleges-list">
      <table class="hover">
        <thead>
          <tr>
            <th>
              <a href="#" ng-click="setSort('title.slug')">
                School Name
                <span ng-show="sort.priority == 'title.slug'"
                      class="fa"
                      ng-class="{'fa-caret-down': sort.direction,
                                 'fa-caret-up': !sort.direction}">
                </span>
              </a>
            </th>
            <th ng-repeat="priority in get_priorities()">
              <a href="#" ng-click="setSort('norm.' + priority.id)">
                {{ priority.name }}
                <span ng-show="sort.priority == 'norm.' + priority.id"
                      class="fa"
                      ng-class="{'fa-caret-down': sort.direction,
                                 'fa-caret-up': !sort.direction}">
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
              {{ render_acf_text(priority, college) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

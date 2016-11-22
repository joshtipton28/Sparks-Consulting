<script type="text/ng-template" id="enrollment-filter">
  <h4>{{ data.title }}</h4>
  <p>{{ data.content }}</p>

  <select ng-model="data.model" ng-if="data.type === 'dropdown'">
    <option id="{{item}}"
            value="{{item}}"
            name="{{item}}"
            ng-repeat="item in data.items">
      {{ item }}
    </option>
  </select>


  <label ng-if="data.type === 'checklist'"
         ng-repeat="item in data.items">
    <input type="checkbox"
           checklist-model="data.model"
           checklist-value="item"> {{item}}
  </label>

  <div class="row" ng-if="data.type === 'checklist_program_type'">
    <div class="large-6 columns">
      <label ng-repeat="item in data.items | filter:programTypeMen">
        <input type="checkbox"
               checklist-model="data.model"
               checklist-value="item"> {{item}}
      </label>
    </div>
    <div class="large-6 columns">
      <label ng-repeat="item in data.items | filter:programTypeWomen">
        <input type="checkbox"
               checklist-model="data.model"
               checklist-value="item"> {{item}}
      </label>
    </div>
  </div>

  <div ng-if="data.type === 'location'">
    Within
    <select ng-model="data.model.distance">
      <option id="{{item}}"
              value="{{item}}"
              name="{{item}}"
              ng-repeat="item in data.items">
        {{ item }}
      </option>
    </select>
    miles of Zip Code:<br />
    <input type="text"
           pattern="[0-9]{5}"
           title="Zip code"
           ng-model="data.model.zip" />
  </div>

  <div class="filter-controls" align="center">
    <button class="btn btn-info" ng-click='cancel()'>Clear</button>
    <button class="btn btn-save" ng-click='ok()' type="button">Save</button>
  </div>
</script>

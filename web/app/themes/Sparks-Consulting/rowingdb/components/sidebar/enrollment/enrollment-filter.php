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

  <button class="button" ng-click='cancel()'>Clear</button>
  <button class="button" ng-click='ok()' type="button">Save</button>
</script>

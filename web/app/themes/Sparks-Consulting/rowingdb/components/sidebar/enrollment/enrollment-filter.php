<script type="text/ng-template" id="enrollment-filter">
  <h4>Enrollment</h4>
  <p>Select the size of school you're interested in. Numbers pertain to undergraduate enrollment.</p>

  <select ng-model="data.model">
    <option id="{{item.id}}"
            value="{{item.name}}"
            name="{{item.name}}"
            ng-repeat="item in data.items">
      {{ item.name }}
    </option>
  </select>

  <button class="button" ng-click='cancel()'>Clear</button>
  <button class="button" ng-click='ok()' type="button">Save</button>
</script>

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
      <div class="colleges-map-wrapper">
        <div class="map-overlay">
          {{filtered.length}} Colleges
        </div>
        <ng-map class="map"
                zoom="4"
                center="[39.095962936305476, -94.8779296875]"
                disable-default-u-i="true"
                draggable="false"
                dragging-cursor="move"
                keyboard-shortcuts="false"
                style="height:100%;">
          <marker ng-repeat="college in colleges | filter:masterFilter | filter:hasLocationFilter"
                  position="{{college.acf.school_city}}, {{college.acf.school_state}}"></marker>
        </ng-map>
      </div>
    </div>
  </div>
</div>

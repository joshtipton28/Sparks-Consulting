<div ng-controller="EnrollmentFilter">
	<script type="text/ng-template" id="enrollment-filter">
	    <h4>Enrollment</h4>
		<p>Select the size of school you're interested in. Numbers pertain to undergraduate enrollment.</p>

				<select ng-model="filter.enrollment">
					<option id="{{enrollment.id}}" value="{{enrollment.name}}" name="{{enrollment.name}}" ng-repeat="enrollment in enrollments">
					{{enrollment.name}}
				</select>

			<button class="button" ng-click='cancel()'>Clear</button>
		  	<button class="button" ng-click='ok()' type="button">Save</button>
	</script>
</div>
<div ng-controller="ReligionFilter">
	<script type="text/ng-template" id="religion-filter">
	    <h4>Religious Affiliation</h4>
		<p>Please make a selection. Religious Affiliation doesn't exclude folks of different faiths, but is based in what faith the school was founded upon.</p>

				<label ng-repeat="religion in religions">
					<input type="radio" id="{{religion.id}}" value="{{religion.name}}"" name="{{religion.name}}" ng-model="filter.religion">
					{{religion.name}}
				</label>

			<button class="button" ng-click='cancel()'>Clear</button>
		  	<button class="button" ng-click='ok()' type="button">Save</button>
	</script>
</div>
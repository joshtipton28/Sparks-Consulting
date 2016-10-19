<div ng-controller="ProgramFilter">
	<script type="text/ng-template" id="program-filter">
	    <h4>Program Type</h4>
		<p>Select the Division you'd like to search. Currently, we're only working with varsity programs and a smattering of clubs, though we'd like to be complete in the near future.</p>
			<fieldset>
				<strong>Women's Programs</strong>
				<span ng-repeat="wProgram in womensPrograms">
					<label for="{{wProgram.id}}">
						<input type="checkbox" id="{{wProgram.id}}" value="{{wProgram.name}}" name="{{wProgram.name}}" ng-model="filter.wProgram[wProgram.id]">
						{{wProgram.name}}
					</label>
				</span>
			</fieldset>
			<fieldset>
				<strong>Men's Programs</strong>
				<span ng-repeat="mProgram in mensPrograms">
					<label for="{{mProgram.id}}">
						<input type="checkbox" id="{{mProgram.id}}" value="{{mProgram.name}}" name="{{mProgram.name}}" ng-model="filter.mProgram[mProgram.id]">
						{{mProgram.name}}
					</label>
				</span>
			</fieldset>

			<button class="button" ng-click='cancel()'>Clear</button>
		  	<button class="button" ng-click='ok()' type="button">Save</button>
	</script>
</div>
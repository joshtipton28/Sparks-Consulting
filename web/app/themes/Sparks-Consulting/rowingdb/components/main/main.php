<ng-include src="getSidebar()"></ng-include>
<div class="map large-8 columns">
	<header>
		<h5>My Priorities:</h5>
		<select ng-model="filter.priority">
			<option value="Enrollment">Enrollment</option>
			<option value="Religion">Religious Affiliation</option>
		</select>
		<select>
			<option>Secondary</option>
		</select>
		<select>
			<option>Tertiary</option>
		</select>
	</header>
	<div class="map">
	<h1>{{filtered.length}} Colleges</h1>
	<a ui-sref="listing">Show Schools</a>
	<ul ng-repeat="college in colleges | filter:filter.religion | filter:query as filtered">
		<li>
			{{college.acf.school_zip}}
		</li>
	</ul>
	</div>

</div>
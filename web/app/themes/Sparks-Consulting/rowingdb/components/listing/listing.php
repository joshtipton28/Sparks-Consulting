<div class="college-results large-12 columns">
	<header>
		<h2>Results(Showing {{filtered.length}} colleges)</h2>
		<a ui-sref="home">Modify Filters</a>
	</header>

	<table>
		<thead>
			<tr>
				<th>School name</th>
				<th>{{filter.priority}}</th>
				<th>Tuition</th>
				<th>Location</th>
			</tr>
		</thead>

		<tbody>
			<tr ng-repeat="college in colleges | filter:filter.religion | filter:query as filtered">
				<td><a ng-href="{{college.link}}" ng-bind-html="college.title.rendered"></a></td>
				<td ng-if="filter.priority == 'Religion'">
					{{college.acf.religion.name}}
				</td>
				<td ng-if="filter.priority == 'Enrollment'">
					{{college.acf.enrollment_count | number:0}}
				</td>
				<td>{{ college.acf.tuition | currency:"$":0}}</td>
				<td>{{college.acf.school_city}}, {{college.acf.school_state}}</td>
			</tr>
		</tbody>
	</table>
</div>
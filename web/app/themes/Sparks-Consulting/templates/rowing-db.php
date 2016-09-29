<?php
/*
Template Name: Rowing DB
*/
get_header(); ?>

<style>
body, th{
	color: #000;
}
.rowing-db{
	background: #fff;
	margin-top:200px;
}
h1, h2, h3, h4, h5, h6{
	color:#000;
}
table{
	border:1px solid #000;
}
</style>


<div class="rowing-db row">
	<div id="app">
		<router-view></router-view>
	</div>
</div>

<template id="school-filter-template">
	<div v-if="view.toggle == 1" >
	<div class="filter-bar large-4 columns">
		<h3>Filters: {{getcolleges}}</h3>
		<ul>
			<li><a>Program Type</a></li>
			<li><a>Enrollment</a></li>
			<li><a>Tuition</a></li>
			<li><a>Financial Aid Score</a></li>
			<li><a>Classroom Ratio</a></li>
			<li><a>Environment</a></li>
			<li><a>Location</a></li>
			<li><a>Selectivity</a></li>
			<li><a>Academic Intensity</a></li>
			<li><a>Private/Public</a></li>
			<li><a data-open="religion">Religious Affiliation</a></li>
			<li><a>Majors</a></li>
			<li><a>Food Service</a></li>
			<li><a>Housing, Types</a></li>
			<li><a>Housing, Sub-types</a></li>
			<li><a>Housing, Alcohol</a></li>
		</ul>

	</div>
	<div class="map large-8 columns">
		<header>
			<h5>My Priorities:</h5>
			<select>
				<option>Primary</option>
			</select>
			<select>
				<option>Secondary</option>
			</select>
			<select>
				<option>Tertiary</option>
			</select>
		</header>
		<h1>{{colleges.length}} Colleges</h1>
		<a @click="view.toggle = 2" >Show Schools</a>
	</div>
	</div>
	<div v-if="view.toggle == 2" class="college-results large-12 columns">
		<header>
			<h2>Results(Showing {{colleges.length}} colleges) {{religionFilter}}</h2>
			<a @click="view.toggle = 1">Modify Filters</a>
		</header>

		<table>
			<thead>
				<tr>
					<th>School name</th>
					<th>Enrollment</th>
					<th>Tuition</th>
					<th>Location</th>
					<th>Religion</th>
				</tr>
			</thead>

			<tbody>
				<tr v-for="college in colleges | filterBy religionFilter in 'acf' 'religion'">
					<td><a href="{{college.link}}">{{{college.title.rendered}}}</a></td>
					<td>{{college.acf.enrollment_count | numberFormat}}</td>
					<td>{{ college.acf.tuition | currency '$' 0 }}</td>
					<td>{{college.acf.school_city}}, {{college.acf.school_state}}</td>
					<td>{{college.acf.religion.name}}</td>
				</tr>
			</tbody>
		</table>
	</div>
	<div class="reveal" id="religion" data-reveal>
		<h4>Religious Affiliation</h4>
		<p>Please make a selection. Religious Affiliation doesn't exclude folks of different faiths, but is based in what faith the school was founded upon.</p>
  			<label>
  				<input type="checkbox" id="40" value="Roman Catholic" v-model="religionFilter">
  				Roman Catholic
  			</label>
  			<label>
  				<input type="checkbox" id="44" value="Jesuit" v-model="religionFilter">
  				Jesuit
  			</label>
		  <button class="button" data-close aria-label="Close modal" type="button">
		    Save
		  </button>
		  <button class="button" @click="religionFilter = ''">Clear</button>
		</div>
</template>

<script src="https://cdnjs.cloudflare.com/ajax/libs/vue/1.0.26/vue.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/vue-resource/1.0.2/vue-resource.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/vue-router/0.7.13/vue-router.js"></script>
<script type="text/javascript" src="<?php bloginfo('template_url'); ?>/js/rowingdb.js"></script>

<?php get_footer();
<div class="row college-single-wrapper">
  <header class="college-single-header">
    <h1 ng-bind-html="trustHtml(college.title.rendered)"></h1>

    <button type="button"
            class="btn btn-info back-button"
            ng-click="go('listing')">
      Back to Search Results
    </button>

    <a ng-href="{{ college.acf.school_website_url }}" target="_blank">School Website</a>

  </header>

  <div class="college-single-stats-list left-col">
    <table>
      <tbody>
        <tr ng-if="college.acf.programs_available.indexOf('Women\'s') > -1">
          <th>Women's Program(s):</th>
          <td>
            <p class="programs-available">
              <span ng-repeat="womens_program in college.acf.womens_programs">
                {{ womens_program.label }}<span ng-if="!$last">, </span>
              </span>
            </p>
            <a class="program-url" ng-href="{{college.acf.womens_program_url}}">
              Women's Rowing Program Website
            </a>
          </td>
        </tr ng-if="college.acf.programs_available.indexOf('Men\'s') > -1">
        <tr>
          <th>Men's Program(s):</th>
          <td>
            <p class="programs-available">
              <span ng-repeat="mens_program in college.acf.mens_programs">
                {{ mens_program.label }}<span ng-if="!$last">, </span>
              </span>
            </p>
            <a class="programs-url" ng-href="{{college.acf.mens_program_url}}">
              Men's Rowing Program Website
            </a>
          </td>
        </tr>
        <tr ng-if="college.acf.sparks_report_url">
          <th>Sparks Report:</th>
          <td>
            <a ng-href="{{college.acf.sparks_report_url}}">
              Click Here
            </a>
          </td>
        </tr>
        <tr>
          <th>Location:</th>
          <td>
            <a ng-href="http://maps.google.com/maps?q={{trustHtml(college.title.rendered)}},+{{render_acf_text('location', college)}}">
              {{ render_acf_text('location', college) }}
            </a>
          </td>
        </tr>
        <tr ng-if="college.norm.enrollment_count">
          <th>Enrollment:</th>
          <td>
            {{ render_acf_text('enrollment_count', college) }}
            <span class="rdb-tooltip"><span class="rdb-tooltip-link">?</span>
              <span class="tooltiptext">Enrollment is given as total number of students, both undergraduate and graduate. The 'size' filter on the main page accurately differentiates general school size, however finite inconsistencies may occur as this is an annually updated free service.</span>
            </span>
          </td>
        </tr>
        <tr>
          <th>Tuition:</th>
          <td>
            {{ render_acf_text('tuition', college) }}
            <span class="rdb-tooltip"><span class="rdb-tooltip-link">?</span>
              <span class="tooltiptext">Tuition is given as fees for instruction; board or extra fees are not included. The 'tuition' filter on the main page accurately differentiate serious differences in tuition, however finite inconsistencies may occur as this is an annually updated free service.</span>
            </span>
          </td>
        </tr>
        <tr ng-if="college.norm.st_ratio">
          <th>Classroom Ratio:</th>
          <td>
            {{ render_acf_text('st_ratio', college) }}
          </td>
        </tr>
        <tr ng-if="college.norm.environment">
          <th>Environment:</th>
          <td>
            {{ render_acf_text('environment', college) }}
          </td>
        </tr>
        <tr ng-if="college.norm.selectivity">
          <th>Selectivity:</th>
          <td>
            {{ render_acf_text('selectivity', college) }}
          </td>
        </tr>
        <tr ng-if="college.norm.financial_aid_score">
          <th>Financial Aid Score:</th>
          <td>
            {{ render_acf_text('financial_aid_score', college) }}
          </td>
        </tr>
        <tr ng-if="college.acf.school_privacy">
          <th>Private/Public:</th>
          <td>
            {{ render_acf_text('school_privacy', college) }}
          </td>
        </tr>
        <tr ng-if="college.norm.religion">
          <th>Religious Affiliation:</th>
          <td>
            {{ render_acf_text('religion', college) || 'None' }}
          </td>
        </tr>
        <tr ng-if="college.norm.food_services">
          <th>Food Services:</th>
          <td>
            {{ render_acf_text('food_services', college) }}
          </td>
        </tr>
        <tr ng-if="college.norm.housing_types">
          <th>Housing Types:</th>
          <td>
            {{ render_acf_text('housing_types', college) }}
          </td>
        </tr>
        <tr ng-if="college.norm.housing_alcohol">
          <th>Housing Alcohol:</th>
          <td>
            {{ render_acf_text('housing_alcohol', college) }}
          </td>
        </tr>
        <tr ng-if="college.norm.housing_sub_types">
          <th>Housing Sub-types:</th>
          <td>
            {{ render_acf_text('housing_sub_types', college) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="college-single-stats-list right-col">
    <div ng-if="college.norm.featured_image"
       class="college-single-image">
      <a ng-href="{{ college.acf.school_website_url }}" target="_blank">
        <img ng-src="{{college.norm.featured_image}}">
      </a>
    </div>

    <table>
      <tbody>
        <tr class="related-info">
          <th><h4>Related Info:</h4></th>
          <td>
            <a ng-href="{{college.acf.row2k_url}} target="_blank">
              Row2k
            </a>
            <span class="rdb-tooltip"><span class="rdb-tooltip-link">?</span>
              <span class="tooltiptext">Links offsite to Row2k's college HQ, which works to carry coaches' commentary on their current seasons & teams.</span>
            </span>
            <span class="pipe">|</span>
            <a ng-href="http://ope.ed.gov/athletics/" target="_blank">Equity in Athletics</a>
            <span class="rdb-tooltip"><span class="rdb-tooltip-link">?</span>
              <span class="tooltiptext">Equity in Athletics provides data on operational expenses, coaching salaries, and other numbers for specific programs and athletic departments. A separate search is required.<br /> <br /> <strong>Strong caution is advised with these numbers:</strong> for clarification, <a href="http://sparksconsult.com/reports-from-the-front/college-program-budgets-why-they-matter/">click here</a></span>
            </span>
          </td>
        </tr>
        <tr class="majors-list" ng-if="college.acf.school_majors">
          <th>Majors:</th>
          <td>
            <span ng-repeat="major in college.acf.school_majors">
              {{ major.name }}<span ng-if="!$last">, </span>
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
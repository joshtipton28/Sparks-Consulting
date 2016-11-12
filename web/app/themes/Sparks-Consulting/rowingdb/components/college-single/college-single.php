<div class="row college-single-wrapper">
  <div class="large-12 columns">
    <header class="college-single-header">
      <h5 ng-bind-html="trustHtml(college.title.rendered)"></h5>

      <div style="float: right; padding-top: 15px;">
        <button type="button"
                class="button"
                style="margin-right: 10px;"
                ng-click="go('listing')">
          Back to Search Results
        </button>
      </div>
    </header>
  </div>

  <div class="large-6 columns">
    <div class="college-single-stats-list">
      <table>
        <tbody>
          <tr ng-if="college.acf.womens_program_url">
            <td>Women's Program(s):</td>
            <td>
              <a ng-href="{{college.acf.womens_program_url}}">
                Women's Rowing Program Website
              </a>
            </td>
          </tr ng-if="college.acf.mens_program_url">
          <tr>
            <td>Men's Program(s):</td>
            <td>
              <a ng-href="{{college.acf.mens_program_url}}">
                Men's Rowing Program Website
              </a>
            </td>
          </tr>
          <tr ng-if="college.acf.sparks_report_url">
            <td>Sparks Report:</td>
            <td>
              <a ng-href="{{college.acf.sparks_report_url}}">
                Click Here
              </a>
            </td>
          </tr>
          <tr>
            <td>Location:</td>
            <td>
              <a ng-href="http://maps.google.com/maps?q={{trustHtml(college.title.rendered)}},+{{render_acf_text('location', college.acf)}}">
                {{ render_acf_text('location', college.acf) }}
              </a>
            </td>
          </tr>
          <tr ng-if="college.acf.enrollment_count">
            <td>Enrollment:</td>
            <td>
              {{ render_acf_text('enrollment_count', college.acf) }}
            </td>
          </tr>
          <tr>
            <td>Tuition:</td>
            <td>
              {{ render_acf_text('tuition', college.acf) }}
            </td>
          </tr>
          <tr ng-if="college.acf.st_ratio">
            <td>Classroom Ratio:</td>
            <td>
              {{ render_acf_text('st_ratio', college.acf) }}
            </td>
          </tr>
          <tr ng-if="college.acf.environment">
            <td>Environment:</td>
            <td>
              {{ render_acf_text('environment', college.acf) }}
            </td>
          </tr>
          <tr>
            <td>Selectivity:</td>
            <td>
              PLACEHOLDER
            </td>
          </tr>
          <tr ng-if="college.acf.financial_aid_score">
            <td>Financial Aid Score:</td>
            <td>
              {{ render_acf_text('financial_aid_score', college.acf) }}
            </td>
          </tr>
          <tr ng-if="college.acf.school_privacy">
            <td>Private/Public:</td>
            <td>
              {{ render_acf_text('school_privacy', college.acf) }}
            </td>
          </tr>
          <tr>
            <td>Religious Affiliation:</td>
            <td>
              PLACEHOLDER
            </td>
          </tr>
          <tr>
            <td>Food Services:</td>
            <td>
              PLACEHOLDER
            </td>
          </tr>
          <tr>
            <td>Housing Types:</td>
            <td>
              {{ render_acf_text('housing_types', college.acf) }}
            </td>
          </tr>
          <tr ng-if="college.acf.housing_alcohol">
            <td>Housing Alcohol:</td>
            <td>
              {{ render_acf_text('housing_alcohol', college.acf) }}
            </td>
          </tr>
          <tr>
            <td>Housing Sub-types:</td>
            <td>
              PLACEHOLDER
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="large-6 columns">
    <div class="college-single-image">
      Image goes here
    </div>

    <div class="college-single-stats-list">
      <table>
        <tbody>
          <tr>
            <td>Related Info:</td>
            <td>
              <a ng-href="{{college.acf.row2k_url}}">
                Row2k
              </a>
            </td>
          </tr>
          <tr ng-if="college.acf.school_majors">
            <td>Majors:</td>
            <td>
              <span ng-repeat="major in college.acf.school_majors">
                {{ major }}<span ng-if="!$last">, </span>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

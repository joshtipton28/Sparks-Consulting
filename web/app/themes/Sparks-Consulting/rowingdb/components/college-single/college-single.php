<div class="row college-single-wrapper">
  <div class="large-12 columns">
    <header class="college-single-header">
      <h5 ng-bind-html="trustHtml(college.title.rendered)"></h5>

      <div style="float: right; padding-top: 15px;">
        <button type="button"
                class="button"
                style="margin-right: 10px;"
                ng-click="go('home')">
          Back to Search Results
        </button>
      </div>
    </header>
  </div>

  <div class="large-6 columns">
    <div class="college-single-stats-list">
      <table>
        <tbody>
          <tr>
            <td>Women's Program(s):</td>
            <td>
              <a ng-href="{{college.acf.womens_program_url}}">
                Women's Rowing Program Website
              </a>
            </td>
          </tr>
          <tr>
            <td>Men's Program(s):</td>
            <td>
              <a ng-href="{{college.acf.mens_program_url}}">
                Men's Rowing Program Website
              </a>
            </td>
          </tr>
          <tr>
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
          <tr>
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
        </tbody>
      </table>
    </div>
  </div>

  <div class="large-6 columns">
    <div class="college-single-image">
      Image goes here
    </div>

    <div class="college-single-related-info">
      Related Info goes here
    </div>

    <div class="college-single-majors">
      Majors goes here
    </div>
  </div>
</div>

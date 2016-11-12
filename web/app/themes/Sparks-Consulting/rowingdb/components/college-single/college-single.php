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
            <tr>
              <a ng-href="{{college.acf.womens_program_url}}">
                Women's Rowing Program Website
              </a>
            </tr>
          </tr>
          <tr>
            <td>Men's Program(s):</td>
            <tr>
              <a ng-href="{{college.acf.mens_program_url}}">
                Men's Rowing Program Website
              </a>
            </tr>
          </tr>
          <tr>
            <td>Sparks Report:</td>
            <tr>
              <a ng-href="{{college.acf.sparks_report_url}}">
                Click Here
              </a>
            </tr>
          </tr>
          <tr>
            <td>Location:</td>
            <tr>
              <a ng-href="http://maps.google.com/maps?q={{trustHtml(college.title.rendered)}},+{{render_acf_text('location', college.acf)}}">
                {{ render_acf_text('location', college.acf) }}
              </a>
            </tr>
          </tr>
          <tr>
            <td>Enrollment:</td>
            <tr>
              {{ render_acf_text('enrollment_count', college.acf) }}
            </tr>
          </tr>
          <tr>
            <td>Tuition:</td>
            <tr>
              {{ render_acf_text('tuition', college.acf) }}
            </tr>
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

function generateHtml(el){
    var content = `<form autocomplete="off" id="mf" name="userinfo">
    <fieldset id="profile" class="row" >
      <h6 class="col s12 teal white-text">My Profile</h6>
        <div>
          <label>Name</label>
          <div class="output">
            <input readonly disabled id="name" value="${geg_user.name}"/>
          </div>
        </div>
        <div>
        <label>Email</label>
          <div class="output">
            <input readonly disabled id="email" value="${geg_user.email}"/>
          </div>
        </div>
       <div>
         <label>School</label>
         <div class="output">
            <input readonly disabled id="school" value="${window.geg_profile.school.schoolname}"/>
         </div>
       </div>
       <div>
         <label for="personalemail">Personal Email</label>
         <div class="input">
           <input id="personalemail" name="personalemail" data-col="personalemail" type="text" value="${geg_profile.personalemail}"/>
         </div>
       </div>
       <div>
         <label for="twitter">Twitter ID (<i>We ♡ to tweet when our participants get certified</i>)</label>
         <div class="input">
           <input id="twitter" name="twitter" data-col="sociallinks" value="${geg_profile.sociallinks}" type="text"/>
         </div>
       </div>
       <div>
         <label for="nid">National ID No. / Passport No.</label><input id="nid" name="nid" value="${geg_profile.nid}" data-col="nid" type="text"/>
      </div>
       <div>
         <label for="phone">Phone/Contact Number</label><input id="phone" value="${geg_profile.phone}" name="phone" data-col="phone" type="number"/>
      </div>
       <div>
         <label>Gender</label>
         <div class="input">
           <label for="male"><input class="with-gap" type="radio" id="male" ${geg_profile.gender == 'male' ? 'checked=checked':''} data-col="gender" name="gender" value="male"><span>Male </span></label>
           <label for="female"><input class="with-gap" type="radio" id="female" ${geg_profile.gender == 'female' ? 'checked=checked':''} name="gender" value="female"><span>Female </span></label>
         </div>
      </div>
    </fieldset>
    <fieldset id="exams" class="row" >
     <h6 class="col s12 teal white-text">My Exam Attempts</h6>
     <div id="exams-wrapper"></div>
     <button type="button" data-exam="add-exam" class="add-exam btn waves-effect btn-small">Add Exam Attempt</button>
     <button type="button" data-exam="del-exam" class="del-exam btn waves-effect btn-small orange darken-4">Remove Last Exam Attempt</button>
    </fieldset>
    <fieldset id="training" class="row" >
     <h6 class="col s12 teal white-text">My Training Summary</h6>
     <div>
       <label for="fundamentals-units">How many units of the <a target="_blank" href="https://skillshop.exceedlms.com/student/path/30509-fundamentals-training">Fundamentals Training</a> have you completed?</label>
       <div class="input" id="fundamentals-progress">
         <progress data-col="fundamentalunits" value="${geg_profile.fundamentalunits}" max="13"></progress>
         <output>Completed ${geg_profile.fundamentalunits}/13 Units</output><br>
         <button class="btn waves-effect btn-small" type="button" data-step="-1">&lt;&lt;</button>
         <input readonly disabled type="text" name="fundamentalunits" id="fund-progress" value="${geg_profile.fundamentalunits}" min="0" max="13"/>
         <button class="btn waves-effect btn-small" type="button" data-step="1">&gt;&gt;</button><br/>
       </div>
     </div>
     <hr>
     <div>
       <div class="input training-completion">  
          <label for="completed-training">
            <input type="checkbox" class="filled-in" ${geg_profile.trainingcompletedon.length > 8 ? 'checked=checked':''} name="completed-training" id="completed-training"/>
            <span>I have completed my training</span>
          </label>
          <br/><label class="tip">First specify how competent you are with the indicators below</label>
          <br/><br/><label for="trainingcompletedon">Specify the date of training completion</label>
          <br/><input class="datepicker" id="trainingcompletedon" data-col="trainingcompletedon" value="${geg_profile.trainingcompletedon}" name="trainingcompletedon" type="date" />
       </div>
     </div>
     <datalist id="result-list">
        <option value="Certified"/>
        <option value="Failed"/>
    </datalist>
    </fieldset>
    <fieldset id="competencies" class="row" >
      <h6 class="col s12 teal white-text">My Competencies</h6>
      <p>Check if you are confident in the following indicators. Once you are confident that you can do all the tasks below, and completed the 13 Units of fundamentals training, you are ready for the Google Certification Exam. Good Luck</p>
    </fieldset>
    </form>`;
    el.innerHTML = content;
    }

    var exam_html = `<div class="exam-attempt row card teal lighten-4">
    <div class="exam-field-box input-field col s4">
      <p class="exam_date" >Attempted Date: </p>
      <input class="datepicker exam_date" data-exam="date" type="date"/>
    </div>
    <div class="exam-field-box input-field col s4">
      <p class="exam_level">Certification Level: </p>
      <select class="browser-default exam_level" data-exam="level">
        <option value="gce_l1">Educator Level 1</option>
        <option value="gce_l2">Educator Level 2</option>
      </select>
    </div>
    <div class="exam-field-box input-field col s4">
      <p class="exam_result">Exam Result:</p>
      <select class="browser-default exam_result" data-exam="result" value="certified">
        <option value="certified" selected="selected">Certified</option>
        <option value="failed">Failed</option>
      </select>
    </div>
    <div class="exam-field-box input-field col s12">
      <p class="cert_url">If Certified, specify the certificate URL. <a href="https://www.credential.net/retrieve-credentials" target="_blank">Click here to check if you are certified</a></p>
      <input type="url" class="cert_url" data-exam="cert" placeholder="https://credential.net/...." >
    </div>
  </div>`;



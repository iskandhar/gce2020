function onSignIn(googleUser) {
    showModal("Waiting for Authorization", "Please hold while we check for authorization",false,true);
    window.geg_jwt = googleUser.getAuthResponse().id_token;
    window.geg_errors = [];
    fetch('https://asia-east2-gce-dashboard-277717.cloudfunctions.net/gce-app-v2/authorize', {method: 'POST', body: window.geg_jwt})
      .then(response => response.json())
      .then(data => {
        if('error' in data){
          window.bad_user = data;
          console.log(data.error);
          showModal("Error", "<b class='red-text'>Please make sure you logged in with School email</b>", false, false)
        }
        else {
            updateModal("Verified","Please wait while we get your profile and training information");
            sessionStorage.setItem("user", b64EncodeUnicode(JSON.stringify(data)))
            window.geg_user = {};
            ["iss", "sub", "hd", "email", "name", "at_hash", "exp", "jti", "ukey"].forEach(key => {
              window.geg_user[key] = data[key];
            });
            
            console.log("verified domain: " + data.hd);
            let promisesArray = [
                fetchData('https://asia-east2-gce-dashboard-277717.cloudfunctions.net/gce-app-v2/getprofile', window.geg_user),
                fetchData('https://asia-east2-gce-dashboard-277717.cloudfunctions.net/gce-app-v2/getindicators', window.geg_user),
                fetchData('https://asia-east2-gce-dashboard-277717.cloudfunctions.net/gce-app-v2/getdomains', window.geg_user)
            ];
            Promise.all(promisesArray).then((results) => {
                // console.log(results[2])
                window.geg_profile = results[0];
                window.geg_profile.fname = geg_user.name;
                geg_profile.school = results[2].schools.find(school => school.domain == window.geg_user.hd)

                window.geg_indicators = results[1];
            
                update_user_menu(data);
                renderCheck();
                if(results[2].domains.includes(window.geg_user.hd)) loadScript('/tutorial.js');
                closeModal();
           }).catch((err) => {
               console.error(err)
               console.error("An Error Occured. Check your connection");
           });
        }
    })
}
function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        auth2.disconnect();
        // reload();
        // console.log('User signed out.');
    });
}

function reload(){window.location.reload();}

function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
      return String.fromCharCode(parseInt(p1, 16))
  }))
}
function b64DecodeUnicode(str) {
  return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join(''))
}
function action_events(){
    // document.getElementById("save").addEventListener("click", updateInfo);
    document.getElementById("signout").addEventListener("click", signOut);
    }
function update_user_menu(google_user){
    var user_menu_html = `<span class='dropdown-trigger' data-target='user_menu'>
        <img src="${google_user.picture}">
    </span>
    <ul id='user_menu' style='width: auto !important;' class='dropdown-content'>
    <li><span>${google_user.name}</span></li>
    <li><span>${window.geg_profile.school.schoolname}</span></li>
    <li><span class="grey-text">TRAINER: ${window.geg_profile.school.trainer}</span></li>
    <li class="divider" tabindex="-1"></li>
    <li><a id="signout" href="">SIGN OUT</a></li>
  </ul>
  <button class="edit-save-btn btn waves-effect waves-light" type="submit" onclick="save_edit_action()" name="action">
    Save<i class="material-icons right">send</i>
  </button>`;
  var usermenuEl = document.createElement("div");
  usermenuEl.classList.add("col", "s3");
  usermenuEl.setAttribute("id", "user_info");
  usermenuEl.innerHTML = user_menu_html;
  document.querySelector(".glogin").replaceWith(usermenuEl);
  window.user_menu = M.Dropdown.init(document.querySelector(".dropdown-trigger",{constrainWidth: false, coverTrigger: false }));
  window.user_menu.options.constrainWidth = false;
  
}

function renderCheck(){
    console.log("render checking");
    if(window.geg_indicators && geg_user){
        'schoolData' in window.localStorage ? render() : loadScript('/schools.js', render);
    } else {
        console.error("Some content not loaded properly");
    }
}

const render = function() {
    generateHtml(document.getElementById("tab1"));
    action_events();
    exam_events(); progress_events();
    create_gtool_wrappers(document.getElementById("competencies"));
    geg_indicators.forEach(createIndicator);
    try { if(geg_profile.examattempts.length > 10) appendExamAttempts(geg_profile.examattempts);
    } catch(err) {console.log(err);}
    if(geg_profile.competencies.length) geg_profile.competencies.split(",").forEach(markIndicator);
 };

function loadScript(url, callback)
{
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    if(!callback == undefined){ script.onreadystatechange = callback;
    script.onload = callback; }
    document.body.appendChild(script);
    console.log("script loaded");
}
async function fetchData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    console.log("fetched: "+url);
    return response.json();
}
async function updateUserCompetencies(competencies){
    let data = window.geg_user;
    data.competencies = competencies;
    return await fetchData('https://asia-east2-gce-dashboard-277717.cloudfunctions.net/gce-app-v2/updatecompetencies', data);
}
function update_fund_unit_output(unit){
    document.querySelector("#fundamentals-progress output").innerHTML = `Completed <b>${unit} out of 13 Units</b>`;
    document.querySelector("#fundamentals-progress progress").value = unit;
  }
function progress_events(){
    document.querySelectorAll("#fundamentals-progress button[data-step]").forEach(el =>{
      el.addEventListener('click', (event) => {
        var currentVal = parseInt(document.getElementById("fund-progress").value);
        var newVal = currentVal + parseInt(event.target.dataset.step);
        if(newVal >=0 && newVal <= 13){
          document.getElementById("fund-progress").value = newVal; update_fund_unit_output(newVal);
        } else if (document.getElementById("fund-progress").value == "") { document.getElementById("fund-progress").value = 0; }
      });
    });
}

function exam_events(){
    document.querySelector(".add-exam").addEventListener("click", function(){
      document.getElementById("exams-wrapper").insertAdjacentHTML('beforeend',exam_html)
    });
  
    document.querySelector(".del-exam").addEventListener("click", function(){
      document.querySelector(".exam-attempt:last-child").remove()
    });
}
function showPrivacy(){
  var content = `Any information you provide via this page is collected to a Google Sheet located in a Google Shared Drive which is owned by the National Institute of Education. This sheet is viewable by staff on NIE, MoE and the selected Trainers.`;
  showModal("Privacy Information", content, true, false)
}
function create_gtool_wrappers(el){
    var arr = [
      ['drive', 'Drive'],
      ['docs', 'Docs'],
      ['sheets', 'Sheets'],
      ['forms', 'Forms'],
      ['slides', 'Slides'],
      ['classroom', 'Classroom'],
      ['gmail', 'Gmail'],
      ['google-groups', 'Google Groups'],
      ['hangouts-chat-google-chat', 'Hangouts Chat/Google Chat'],
      ['hangouts-meet-google-meet', 'Hangouts Meet/Google Meet'],
      ['google-calendar', 'Google Calendar'],
      ['google-tasks', 'Google Tasks'],
      ['google-keep', 'Google Keep'],
      ['google-sites', 'Google Sites'],
      ['google-chrome', 'Google Chrome'],
      ['google-search', 'Google Search'],
      ['youtube', 'YouTube'],
      ['google-help', 'Google Help'],
      ['digital-citizenship', 'Digital Citizenship']
    ];
    var htmldata = "";
    arr.forEach(item => {
      htmldata += `<div class="col s12 gtool ${item[0]}">
      <h6><label class="open-gtool" for="open-${item[0]}">${item[1]}</label></h6>
      <input style="display:hidden" type="radio" id="open-${item[0]}" name="open-gtool">
      <div class="checklist row"></div>
    </div>`;
    })
  el.insertAdjacentHTML('beforeend', htmldata);
}
  
function createIndicator(indicator){
      var el = document.querySelector("#competencies .gtool."+indicator.gsx$gtoolid.$t+" .checklist");
      el.insertAdjacentHTML('beforeend', `<label class="col s12" for="${indicator.gsx$indicatorid.$t}"><input class="filled-in" type="checkbox" name="${indicator.gsx$indicatorid.$t}" id="${indicator.gsx$indicatorid.$t}"/><span>${indicator.gsx$indicatordescription.$t}</span></label>`);
}
function markIndicator(id){
    document.querySelector("#competencies .checklist #"+id).setAttribute("checked", "checked");
}
function appendExamAttempts(str){
    str.split("++").forEach(attempt => {
      var fields = attempt.split("||");
      html = `<div class="exam-attempt row card teal lighten-3">
      <div class="exam-field-box input-field col s4">
        <p class="exam_date" >Attempted Date: </p>
        <input class="exam_date" data-exam="date" type="date" value="${fields[0]}"/>
      </div>
      <div class="exam-field-box input-field col s4">
        <p class="exam_level">Certification Level: </p>
        <select class="browser-default exam_level" data-exam="level" value="${fields[1]}">
          <option value="gce_l1" ${fields[1]=='gce_l1'? "selected='selected'": ""}>Educator Level 1</option>
          <option value="gce_l2" ${fields[1]=='gce_l2'? "selected='selected'": ""}>Educator Level 2</option>
        </select>
      </div>
      <div class="exam-field-box input-field col s4">
        <p class="exam_result">Exam Result:</p>
        <select class="browser-default exam_result" data-exam="result" value="${fields[2]}">
          <option value="certified" ${fields[2]=='certified'? "selected='selected'": ""}>Certified</option>
          <option value="failed" ${fields[2]=='failed'? "selected='selected'": ""}>Failed</option>
        </select>
      </div>
      <div class="exam-field-box input-field col s12">
        <p class="cert_url">If Certified, specify the certificate URL. <a href="https://www.credential.net/retrieve-credentials" target="_blank">Click here to check if you are certified</a></p>
        <input type="url" class="cert_url" data-exam="cert" placeholder="https://credential.net/...." value="${fields[3]}">
      </div>
    </div>`;
    document.getElementById("exams-wrapper").insertAdjacentHTML('beforeend', html);
    })
}

function showModal(title, content, close = false, loader = false){
    var el = document.getElementById("modal");
    if (window.modal.isOpen) window.modal.close()
    el.querySelector("h6").innerHTML = title;
    el.querySelector("p").innerHTML = content;
    loader ? el.querySelector(".loader").style.display = "block" : el.querySelector(".loader").style.display = "none";
    close ? el.querySelector(".modal-footer").style.display = "block" : el.querySelector(".modal-footer").style.display = "none"
    window.modal = M.Modal.init(el, {dismissible: close});
    window.modal.open();
}
function updateModal(title, content, ){
    var el = document.getElementById("modal");
    el.querySelector("h6").innerHTML = title;
    el.querySelector("p").innerHTML = content;
}

function closeModal(){
    window.modal.close();
}
function checkFormErrors(){
  let errors = 0;
  var exams = document.querySelectorAll(".exam-attempt");
  var cert_url_regex = /[(http(s)?):\/\/(www\.)?a-z]{10,22}\.[credential\.net\/]{3,6}\b([-a-zA-Z0-9\-]{18})/g;
  for(var i = 0; i < exams.length; i++){
    var certlink = exams[i].querySelector("input.cert_url");
    var examdate = exams[i].querySelector("input.exam_date");
    var examres = exams[i].querySelector("select.exam_result")
    if(!cert_url_regex.test(certlink.value) && examres.value == 'certified'){
      certlink.classList.add("invalid"); errors++;
    } else {
      certlink.classList.remove("invalid");
    }
    if(examres.value == 'failed') certlink.value = "no-certificate"
    if(examdate.value.length){
      new Date(examdate.value) > new Date() ? examdate.classList.add("invalid") : examdate.classList.remove("invalid");
    } else {
      examdate.classList.add("invalid"); errors++
    }
  }
  return errors;
}
function updateLocal(){
    var exams = [];
    document.querySelectorAll(".exam-attempt").forEach(attempt => {
      exams.push([
          attempt.querySelector("input.exam_date").value,
          attempt.querySelector("select.exam_level").value,
          attempt.querySelector("select.exam_result").value,
          attempt.querySelector("input.cert_url").value,
      ].join("||"));
    });
    var examstr = exams.join("++");
    var competencies = [];
    document.forms.userinfo.competencies.querySelectorAll("input:checked").forEach(el => {competencies.push(el.name)});
    var compstr = competencies.join(",");

    geg_profile.personalemail = document.forms.userinfo.elements.personalemail.value;
    geg_profile.nid = document.forms.userinfo.elements.nid.value;
    geg_profile.gender = document.forms.userinfo.elements.gender.value;
    geg_profile.phone = document.forms.userinfo.elements.phone.value;
    geg_profile.sociallinks = document.forms.userinfo.elements.twitter.value;
    geg_profile.trainingcompletedon = document.forms.userinfo.elements.trainingcompletedon.value;
    geg_profile.fundamentalunits = document.forms.userinfo.elements.fundamentalunits.value;
    geg_profile.examattempts = examstr;
    geg_profile.competencies = compstr;
  }
async function save_edit_action(){
    let act = 'save';
    if(act == 'edit'){
      //todo: lock form and unlock here
    }
    if( act = 'save'){
      let errors =  checkFormErrors();
      if(errors == 0){
        showModal("Saving...","Please wait while your profile is updated", false, true);
        updateLocal();
        let data = window.geg_user;
        data.profile = window.geg_profile;
        let saveUrl = "https://asia-east2-gce-dashboard-277717.cloudfunctions.net/gce-app-v2/updateprofile";
        fetch(saveUrl, {
          method: 'POST',
          mode: 'cors',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(data)
        }).then(data => data.json())
        .then(data => {showModal("Message",data.status, true, false)})
      } else {
        showModal("Errors found","Some errors were found, they are highlighted in red. Try again after correctin", true, false);
      }
    }
}
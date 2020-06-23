function onSignIn(googleUser) {
    console.info("initiating verification") /* log*/
    showToast('Signed in. Please wait for verification', 'info', true);
    window.gjwt = googleUser.getAuthResponse().id_token;
    fetch('http://localhost:8080/verifyauth', {method: 'POST', body: gjwt})
      .then(response => response.json())
      .then(data => {
          if(!'error' in data){
              window.geg_user = data;
              fetch('http://localhost:8080/getprofile',{
                  method: 'POST', 
                  body: JSON.stringify(window.geg_user),
                  mode:  'cors',
                  headers: {
                      'Content-Type': 'application/json'
                  }
              })
              .then(data => data.json())
              .then(obj => {
                //All in well
                console.log(window.geg_user.email+" \x76\x65\x72\x69\x66\x69\x65\x64");
                window.userdata = obj;
              } )
              .catch(err => {
                  console.log(err);
                  showToast('Error: Could not get your profile. Check network');
                  })
          } else {
            showToast(data.error, 'warn', true);
            console.error(data.error);
          }
      })
      .catch((error) => {
        console.error('Error:', error);
        showToast("Unexped Error");
      });
}


function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      auth2.disconnect();
      reload();
      // console.log('User signed out.');
    });
}

function reload(){window.location.reload();}

async function fetchData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });
  return response.json();
}

function showToast(msg, type, loader){
  let toast = document.getElementById("toast");
  if(type == undefined) type = 'warn';
  let p = toast.children[0];
  loader ? p.innerHTML = `${msg} <span class='loader'></span>`: p.innerHTML = msg;
  var typecolors = {
    error: '#e53935',
    warn: '#ef6c00',
    success: '#2e7d32',
    info: '#1565c0'
  }
  p.style.backgroundColor = typecolors[type];
  toast.style.display = 'block';
}
function hideToast(){document.getElementById("toast").style.display = 'none'}








window.addEventListener('load', function(){
  var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
  if (!isChrome){
    document.body.innerHTML = "<h2>Please use Google Chrome to visit this website</h2>";
  }
})

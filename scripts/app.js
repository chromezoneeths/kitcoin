/*jshint esversion: 6, loopfunc: true*/


//Variables
var user;
var token;
var idToken;
var displayName;
var photoURL;
var uid;
var providerData;
var email;
var currentRole;

var googleuser;
//GAPI setup for auth
gapi.load('auth2', function() {
  auth2 = gapi.auth2.init({
    client_id: '2422563589-0mipesu3hk6e4nh9352k2es78375hmk8.apps.googleusercontent.com',
    scope: 'profile email https://www.googleapis.com/auth/classroom.rosters.readonly https://www.googleapis.com/auth/classroom.courses.readonly'

  });
  auth2.attachClickHandler(document.getElementById('login'), {}, onSignIn);

  auth2.isSignedIn.listen(signinChanged);
  auth2.currentUser.listen(userChanged);
});
//Update user when changed
var userChanged = function(u) {
  if (u.getId()) {
    user = firebase.auth().currentUser;
  }
};
//Change sign in button state when sign sign in state changed
function signinChanged(v) {
  if (!v) {
    document.getElementById('landing').style.display = 'block';
    document.getElementById('app').style.display = 'none';
  } else {
    document.getElementById('landing').style.display = 'none';
    document.getElementById('app').style.display = 'block';
  }
}

// Firebase setup
var provider = new firebase.auth.GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/classroom.courses.readonly');
provider.addScope('https://www.googleapis.com/auth/classroom.rosters.readonly');
provider.addScope('https://www.googleapis.com/auth/classroom.profiles.emails');
var database = firebase.database();

//Sign Out Funcition
function signOut() {
  auth2.signOut().then(function() {
    console.log('User signed out.');
  });
  firebase.auth().signOut().then(function() {
    window.location.reload();
  }).catch(function(error) {
    // An error happened.
  });
}


//Runs when user is signed in
function onSignIn(googleUser) {
  var options = new gapi.auth2.SigninOptionsBuilder({
    'scope': 'email https://www.googleapis.com/auth/classroom.rosters.readonly https://www.googleapis.com/auth/classroom.courses.readonly'
  });
  googleUser.grant(options);
  googleuser = googleUser;

  //Link with firebase user
  var unsubscribe = firebase.auth().onAuthStateChanged(function(firebaseUser) {
    unsubscribe();
    // Check if we are already signed-in Firebase with the correct user.
    if (!isUserEqual(googleUser, firebaseUser)) {
      // Build Firebase credential with the Google ID token.
      var credential = firebase.auth.GoogleAuthProvider.credential(
        googleUser.getAuthResponse().id_token);
      // Sign in with credential from the Google user.
      firebase.auth().signInAndRetrieveDataWithCredential(credential).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
      });
    } else {
      console.log('User already signed-in Firebase.');
    }
  });
}

//function for above
function isUserEqual(googleUser, firebaseUser) {
  if (firebaseUser) {
    var providerData = firebaseUser.providerData;
    for (var i = 0; i < providerData.length; i++) {
      if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
        providerData[i].uid === googleUser.getBasicProfile().getId()) {
        // We don't need to reauth the Firebase connection.
        return true;
      }
    }
  }
  return false;
}
//NOT USED ANYMORE
firebase.auth().getRedirectResult().then(function(result) {
  if (result.credential) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    token = result.credential.accessToken;
    idToken = result.credential.idToken;
    fbData('/users/' + result.user.uid + '/tokens', 'access', token);
    fbData('/users/' + result.user.uid + '/tokens', 'id', idToken);


    gapi.auth2.getAuthInstance();
    // ...
  }
  // The signed-in user info.
  user = result.user;
}).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // The email of the user's account used.
  var email = error.email;
  // The firebase.auth.AuthCredential type that was used.
  var credential = error.credential;
  // ...
});

//Runs when user is signed in and state is changed
firebase.auth().onAuthStateChanged(function(u) {
  if (u) {
    //set global user variabled
    user = u;

    if (user.email.split('@')[1] !== 'eths202.org') {
      firebase.auth().currentUser.delete();
      alert('Please log in with your @eths202.org email address. You logged in with the domain \"' + user.email.split('@')[1] + '\".');
      signOut();
    }
    //set GAPI stuff
    gapi.auth2.getAuthInstance();

    //Check if student id is set
    //if not, ask for id and put info in database
    fbData('/users/' + user.uid + '/userData', 'id').then(function(data) {
      var id = data.val();
      if (id == undefined) {
        id = prompt('Please enter your ETHS ID number');
        fbData('/users/' + user.uid + '/userData', 'id', id);
        fbData('/users/' + user.uid + '/userData', 'username', user.email.split('@')[0]);
        fbData('/users/' + user.uid + '/userData', 'email', user.email);
        fbData('/users/' + user.uid + '/userData', 'name', user.displayName);
        fbData('/users/' + user.uid + '/userData', 'role', 'student');
        fbData('/users/' + user.uid + '/restricted', 'kitCoin', 0);


        fbData('/lookup/id/', id, user.uid);
        fbData('/lookup/username/', user.email.split('@')[0], user.uid);
      }
    });
    fbData('/users/' + user.uid + '/restricted', 'kitCoin').then(function(coin) {
      fbData('/users/' + user.uid + '/userData', 'role').then(function(role) {
        currentRole = role.val();
        document.getElementById('role-' + role.val()).style.display = '';
        document.getElementById('user-name').innerHTML = user.displayName;
        if (role.val() == 'student') {
          document.getElementById('student-coin').innerHTML = coin.val();
        }
      });
    });
  } else {
    // User is signed out.
    console.log('No User');

    if (document.getElementById('app').style.display !== 'block') {
      document.getElementById('other').style.display = '';
      document.getElementById('loginwrapper').style.display = '';
    }

  }

});

//Runs when the give function is run

//step 1a
function giveSubmit(where) {
  if (where == 'a') {
    giveCoin(document.getElementById('admin-identifier').value, document.getElementById('admin-amount').value);
  } else {
    giveCoin(document.getElementById('staff-identifier').value, document.getElementById('staff-amount').value);
  }
  return false;
}

//Runs when the take function is run

//step 1b
function takeSubmit(where) {
  if (where == 'a') {
    giveCoin(document.getElementById('admin-take-identifier').value, 0 - parseInt(document.getElementById('admin-take-amount').value));
  } else {
    giveCoin(document.getElementById('staff-take-identifier').value, 0 - parseInt(document.getElementById('staff-take-amount').value));
  }
  return false;
}

//step two
function giveCoin(identifier, quantity) {
  var lookupType;
  if (identifier.length == 6 && typeof parseInt(identifier) == 'number') {
    lookupType = 'id';
  } else if (identifier.indexOf('@eths202.org') !== -1) {
    lookupType = 'username';
    identifier = identifier.split('@')[0];
  } else {
    lookupType = 'username';
  }
  fbData('/lookup/' + lookupType, identifier).then(function(data) {
    var uuid = data.val();
    if (uuid !== null) {
      addCoin(uuid, quantity);
    } else {
      displayAlert('Cannot find a user with the given information.', '#f44336', 4);
    }
  });
}

//step three
function addCoin(uuid, quantity) {
  fbData('/users/' + uuid + '/restricted', 'kitCoin').then(function(data) {
    if (data.val() !== null) {
      fbData('/users/' + uuid + '/restricted', 'kitCoin', parseInt(data.val()) + parseInt(quantity));
      fbData('/users/' + uuid + '/userData', 'name').then(function(data2) {
        displayAlert('Sent ' + numberWithCommas(quantity) + ' KitCoin to ' + data2.val() + '. ' + data2.val().split(' ')[0] + ' now has ' + numberWithCommas(parseInt(data.val()) + parseInt(quantity)) + ' KitCoin', '#2196fe', 4);
      });
    } else {
      displayAlert('Cannot find a user with the given information.', '#f44336', 4);
    }
  });
}

//Gets the user info when the funcion is run

//step one
function getInfo(where) {
  if (where == 'a') {
    getUserInfo(document.getElementById('admin-info-identifier').value);
  } else {
    getUserInfo(document.getElementById('staff-info-identifier').value);
  }
  return false;
}

//step two
function getUserInfo(identifier) {
  var lookupType;
  if (identifier.length == 6 && typeof parseInt(identifier) == 'number') {
    lookupType = 'id';
  } else if (identifier.indexOf('@eths202.org') !== -1) {
    lookupType = 'username';
    identifier = identifier.split('@')[0];
  } else {
    lookupType = 'username';
  }
  fbData('/lookup/' + lookupType, identifier).then(function(data) {
    var uuid = data.val();
    if (uuid !== null) {
      searchInfo(uuid);
    } else {
      displayAlert('Cannot find a user with the given information.', '#f44336', 4);
    }
  });
}

//step 3
function searchInfo(uuid) {
  fbData('/users/', uuid).then(function(data) {
    if (data.val() !== null) {
      var main = data.val();
      var restricted = main.restricted;
      var userData = main.userData;
      var coin = restricted.kitCoin;
      var email = userData.email;
      var id = userData.id;
      var name = userData.name;
      var role = userData.role;
      var username = userData.username;
      document.getElementById(currentRole + '-setinfo-identifier').value =
        document.getElementById(currentRole + '-info-identifier').value;
      document.getElementById(currentRole + '-setinfo-coin').value = coin;
      document.getElementById(currentRole + '-setinfo-email').value = email;
      document.getElementById(currentRole + '-setinfo-id').value = id;
      document.getElementById(currentRole + '-setinfo-name').value = name;
      document.getElementById(currentRole + '-setinfo-role').value = role;
      document.getElementById(currentRole + '-setinfo-username').value = username;
      fbData('/users/' + uuid + '/userData', 'name').then(function(data) {
        displayAlert('Fetched the user info of ' + data.val() + '.', '#4caf50', 4);
      });
    } else {
      displayAlert('Cannot find a user with the given information.', '#f44336', 4);
    }
  });
}

// Runs when set info is run

//step one
function setInfo() {
  var identifier = document.getElementById('admin-setinfo-identifier').value;
  var lookupType;
  if (identifier.length == 6 && typeof parseInt(identifier) == 'number') {
    lookupType = 'id';
  } else if (identifier.indexOf('@eths202.org') !== -1) {
    lookupType = 'username';
    identifier = identifier.split('@')[0];
  } else {
    lookupType = 'username';
  }
  fbData('/lookup/' + lookupType, identifier).then(function(data) {
    var uuid = data.val();
    if (uuid !== null) {
      setUserInfo(uuid);
    } else {
      displayAlert('Cannot find a user with the given information.', '#f44336', 4);
    }
  });
}

//step two
function setUserInfo(uuid) {
  if (document.getElementById('admin-setinfo-coin').value !== '') {
    fbData('/users/' + uuid + '/restricted', 'kitCoin', parseInt(document.getElementById('admin-setinfo-coin').value));
  }
  if (document.getElementById('admin-setinfo-email').value !== '') {
    fbData('/users/' + uuid + '/userData', 'email', document.getElementById('admin-setinfo-email').value);
  }
  if (document.getElementById('admin-setinfo-id').value !== '') {
    fbData('/users/' + uuid + '/userData', 'id', document.getElementById('admin-setinfo-id').value);
  }
  if (document.getElementById('admin-setinfo-name').value !== '') {
    fbData('/users/' + uuid + '/userData', 'name', document.getElementById('admin-setinfo-name').value);
  }
  if (document.getElementById('admin-setinfo-role').value !== '') {
    fbData('/users/' + uuid + '/userData', 'role', document.getElementById('admin-setinfo-role').value);
  }
  if (document.getElementById('admin-setinfo-username').value !== '') {
    fbData('/users/' + uuid + '/userData', 'username', document.getElementById('admin-setinfo-username').value);
  }
  fbData('/users/' + uuid + '/userData', 'name').then(function(data) {
    displayAlert('Updated the user info of ' + data.val() + '.', '#4caf50', 4);
  });
}



//guiding function for firebase database operations
function fbData(path, obj, value) {
  var firebasePath;
  var endData;
  if (value == undefined) {
    firebasePath = firebase.database().ref(path + '/' + obj);
    return firebasePath.once('value');
  } else {
    firebasePath = firebase.database().ref(path + '/');
    return firebasePath.update({
      [obj]: value
    });
  }
}
var clearAlert;
var alert = document.getElementById('alert');


//displays toast
function displayAlert(txt, bg, duration) {
  alert.innerHTML = txt + `<a id="close" onclick="alert.style.left = 'calc(-40px - 100%)'; clearTimeout(clearAlert);">&times;</a>`;
  alert.style.backgroundColor = bg;
  alert.style.left = '10px';
  clearAlert = setTimeout(function() {
    alert.style.left = 'calc(-40px - 100%)';
  }, duration * 1000 + 500);
}

//commaify number
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


//get class list
var classList;
var classroomId;

//step 1
function getClassList() {
  gapi.client.classroom.userProfiles.get({
    userId: 'me'
  }).then(function(u) {
    classroomId = u.result.id;
    gapi.client.classroom.courses.list().then(function(res) {
      classList = res.result.courses;
      isUserStudent(classList);
    });
  });
}

var teacherArrayStudent = [];
var teacherArrayStaff = [];

//step 2
function isUserStudent(classList) {
  var currentStarter;
  for (var i = 0; i < classList.length; i++) {
    if (classList[i].courseState == "ACTIVE") {
      gapi.client.classroom.courses.teachers.list({
        courseId: classList[i].id
      }).then(function(res) {
        var currentClass = res.result.teachers[0].courseId;
        var currentTeachers = res.result.teachers;
        var currentUserIds = [];
        for (var j = 0; j < currentTeachers.length; j++) {
          currentUserIds.push(currentTeachers[j].userId);
        }
        if (currentUserIds.indexOf(classroomId) == -1) {
          teacherArrayStudent.push(currentClass);
        } else {
          teacherArrayStaff.push(currentClass);
        }
        fbData('/users/' + user.uid, 'classes').then(function(data) {

        });
        fbData('/classes/' + currentClass, user.email.split('@')[0], user.displayName);
      });
    }
  }
}

//Hide loading bar
document.onreadystatechange = function() {
  if (document.readyState === "complete") {
    //document.getElementById('app').style.display = 'block';
    document.getElementById("PreLoaderBar").style.display = "none";
  }
};
/*jshint esversion: 6*/
var provider = new firebase.auth.GoogleAuthProvider();
var database = firebase.database();

var user;
var token;
var displayName;
var photoURL;
var uid;
var providerData;
var email;

function signOut() {
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
    window.location.reload();

  }).catch(function(error) {
    // An error happened.
  });
}

function signIn() {
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(function() {
      // In memory persistence will be applied to the signed in Google user
      // even though the persistence was set to 'none' and a page redirect
      // occurred.
      return firebase.auth().signInWithRedirect(provider);
    })
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
    });
}

firebase.auth().getRedirectResult().then(function(result) {
  if (result.credential) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    token = result.credential.accessToken;
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

firebase.auth().onAuthStateChanged(function(u) {
  if (u) {
    user = u;
    document.getElementById('login').style.display = 'none';
    document.getElementById('signout').style.display = 'block';

    fbData('/users/' + user.uid + '/userData', 'id').then(function(data) {
      var id = data.val();
      if (id == undefined) {
        id = prompt('Please enter your ETHS ID number');
        fbData('/users/' + user.uid + '/userData', 'id', id);
        fbData('/users/' + user.uid + '/userData', 'username', user.username);
        fbData('/users/' + user.uid + '/userData', 'email', user.email);
        fbData('/users/' + user.uid + '/userData', 'role', 'student');
      }
    });
  } else {
    // User is signed out.
    // ...
    console.log('No User');
    document.getElementById('login').style.display = 'block';
    document.getElementById('signout').style.display = 'none';
  }

});

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

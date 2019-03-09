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

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    displayName = user.displayName;
    photoURL = user.photoURL;
    uid = user.uid;
    email = user.email;
    providerData = user.providerData;
    // ...
    console.log(user);
    var id = getUserData('id');
    if (id == null) {
      id = prompt('What\'s your ETHS student ID?');
      firebase.database().ref('users/' + userId).set({
        username: email.split("@")[0],
        email: email,
        id: id
      });
    }
    console.log(getUserData('id'));
    console.log(getUserData('username'));
    console.log(getUserData('email'));
  } else {
    // User is signed out.
    // ...
    console.log('No User');
  }
});

function getUserData(data) {
  var userId = firebase.auth().currentUser.uid;
  return firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
    var id = (snapshot.val() && snapshot.val()[data]) || null;
    // ...
  });
}

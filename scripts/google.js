/*jshint esversion: 6*/
var provider = new firebase.auth.GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/classroom.courses.readonly');
provider.addScope('https://www.googleapis.com/auth/classroom.rosters.readonly');
var database = firebase.database();

var user;
var token;
var idToken;
var displayName;
var photoURL;
var uid;
var providerData;
var email;
var currentRole;

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
        idToken = result.credential.idToken;
        fbData('/users/' + result.user.uid + '/tokens', 'access', token);
        fbData('/users/' + result.user.uid + '/tokens', 'id', idToken);


        gapi.auth.setToken({
            access_token: token
        });
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

gapi.load('client', gapiStart);

function gapiStart() {
    gapi.client.init({
        apiKey: "AIzaSyDczvnhoOkundtOWD1lcsJZSwRDGSXiZGc",
        clientId: "2422563589-0mipesu3hk6e4nh9352k2es78375hmk8.apps.googleusercontent.com",
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/classroom/v1/rest"],
        scope: ["https://www.googleapis.com/auth/classroom.rosters.readonly", 'https://www.googleapis.com/auth/classroom.courses.readonly']
    });
}


firebase.auth().onAuthStateChanged(function(u) {
    if (u) {

        user = u;
        document.getElementById('login').style.display = 'none';
        document.getElementById('signout').style.display = 'block';

        if (token == null) {
            fbData('/users/' + user.uid + '/tokens', 'id').then(function(t) {
                token = t.val();
                gapi.auth.setToken({
                    access_token: token
                });
            });
        } else {
            gapi.auth.setToken({
                access_token: token
            });
        }

        fbData('/users/' + user.uid + '/userData', 'id').then(function(data) {
            var id = data.val();
            if (id == undefined) {
                id = prompt('Please enter your ETHS ID number');
                fbData('/users/' + user.uid + '/userData', 'id', id);
                fbData('/users/' + user.uid + '/userData', 'username', user.email.split('@')[0]);
                fbData('/users/' + user.uid + '/userData', 'email', user.email);
                fbData('/users/' + user.uid + '/userData', 'email', user.displayName);
                fbData('/users/' + user.uid + '/userData', 'role', 'student');
                fbData('/users/' + user.uid + '/restricted', 'kitCoin', '0');


                fbData('/lookup/id/', id, user.uid);
                fbData('/lookup/username/', user.email.split('@')[0], user.uid);
            }
        });
        fbData('/users/' + user.uid + '/restricted', 'kitCoin').then(function(coin) {
            fbData('/users/' + user.uid + '/userData', 'role').then(function(role) {
                currentRole = role.val();
                document.getElementById('role-' + role.val()).style.display = '';
                document.getElementById(role.val() + '-name').innerHTML = user.displayName;
                if (role.val() == 'student') {
                    document.getElementById('student-coin').innerHTML = coin.val();
                }
            });
        });
    } else {
        // User is signed out.
        // ...
        console.log('No User');
        document.getElementById('login').style.display = 'block';
        document.getElementById('signout').style.display = 'none';
    }

});

function giveSubmit(where) {
    if (where == 'a') {
        giveCoin(document.getElementById('admin-identifier').value, document.getElementById('admin-amount').value);
    } else {
        giveCoin(document.getElementById('staff-identifier').value, document.getElementById('staff-amount').value);
    }
    return false;
}

function takeSubmit(where) {
    if (where == 'a') {
        giveCoin(document.getElementById('admin-take-identifier').value, 0 - parseInt(document.getElementById('admin-take-amount').value));
    } else {
        giveCoin(document.getElementById('staff-take-identifier').value, 0 - parseInt(document.getElementById('staff-take-amount').value));
    }
    return false;
}

function getInfo(where) {
    if (where == 'a') {
        getUserInfo(document.getElementById('admin-info-identifier').value);
    } else {
        getUserInfo(document.getElementById('staff-info-identifier').value);
    }
    return false;
}

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

function displayAlert(txt, bg, duration) {
    alert.innerHTML = txt + `<a id="close" onclick="alert.style.left = 'calc(-40px - 100%)'; clearTimeout(clearAlert);">&times;</a>`;
    alert.style.backgroundColor = bg;
    alert.style.left = '10px';
    clearAlert = setTimeout(function() {
        alert.style.left = 'calc(-40px - 100%)';
    }, duration * 1000 + 500);
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

console.log(decodeURI(window.location.hash.substr(1)));
var data = JSON.parse(decodeURI(window.location.hash.substr(1)))
window.sessionStorage.setItem('uuid', data.uuid)
window.location = data.redirect

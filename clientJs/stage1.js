console.log(decodeURI(window.location.hash.slice(1)));
const data = JSON.parse(decodeURI(window.location.hash.slice(1)));
window.sessionStorage.setItem('uuid', data.uuid);
window.location = data.redirect;

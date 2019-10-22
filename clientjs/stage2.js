var uuid = window.sessionStorage.getItem('uuid')
console.log(window.location.toString().replace("oauthstage2", "oauthstage3") + `&uuid=${uuid}`);
window.location = window.location.toString().replace("oauthstage2", "oauthstage3") + `&uuid=${uuid}`

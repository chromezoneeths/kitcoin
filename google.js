// This file contains abstractions for Google APIs.
const conf = require('./config') // gotta have them inconsistent semicolons amirite
const uuid = require('uuid/v4');
const url = require('url');
const oauthKeys = require('./oauth_info') // This won't be in the repository; make your own keys in the Google Developer Console.
const oauthScopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.profile.emails'
]
const {google} = require('googleapis');
var pendingOAuthCallbacks = []
exports.prepare = (socket) => { // Blocks until user consents, otherwise doesn't do anything
  return new Promise((resolve)=>{
    var thisOAuthID = uuid()
    var oAuthClient = new google.auth.OAuth2(
      oauthKeys.clientId,
      oauthKeys.clientSecret,
      `${conf.oauthCallbackUrl}/oauthstage2`
    )
    var thisPendingOAuth = {id:thisOAuthID,reslve:resolve,client:oAuthClient}
    const url = `${conf.oauthCallbackUrl}/oauthstage1#${JSON.stringify({
      redirect: oAuthClient.generateAuthUrl({scope: oauthScopes}),
      uuid: thisOAuthID
    })}`
    pendingOAuthCallbacks.push(thisPendingOAuth)
    console.log(`Sending login message ${thisOAuthID}`);
    socket.send(JSON.stringify({
      action: "login",
      url: url
    }))
  })
}
exports.callback = async (req, res) => {
  if(req.url.startsWith("/oauthstage1")){
        res.writeHead(200)
        res.end(`<script src="stage1.js"></script>`)
        // const qs = new url.URL(req.url, conf.oauthCallbackUrl)
        //       .searchParams;
        // for(var i in pendingOAuthCallbacks){
        //   if(pendingOAuthCallbacks[i].id == qs.get(`uuid`)){
        //     console.log(`Received login message ${pendingOAuthCallbacks[i].id}`);
        //     const {tokens} = await pendingOAuthCallbacks[i].client.getToken(qs.get('code'));
        //     res.writeHead(200)
        //     res.end("<script>setTimeout(()=>{window.close()},300)</script>")
        //     pendingOAuthCallbacks[i].client.credentials = tokens
        //     pendingOAuthCallbacks[i].reslve({auth:pendingOAuthCallbacks[i].client})
        //   }
        // }
      }
      else if(req.url.startsWith("/oauthstage2")){
        res.writeHead(200)
        res.end(`<script src="stage2.js"></script>`)
      }
      else if(req.url.startsWith("/oauthstage3")){
        const qs = new url.URL(req.url, conf.oauthCallbackUrl)
              .searchParams;
        for(var i in pendingOAuthCallbacks){
          if(pendingOAuthCallbacks[i].id == qs.get(`uuid`)){
            const {tokens} = await pendingOAuthCallbacks[i].client.getToken(qs.get('code'));
            res.writeHead(200)
            res.end("<script>setTimeout(()=>{window.close()},300)</script>")
            pendingOAuthCallbacks[i].client.credentials = tokens
            pendingOAuthCallbacks[i].reslve({auth:pendingOAuthCallbacks[i].client})
          }
        }
      }
}
exports.getCourses = (classroom) => {
  return new Promise(async (r)=>{
    classroom.courses.list({pageSize:0}, (err, res)=>{
      r({err, res})
    })
  })
}
exports.getStudents = (classroom, id)=>{
  return new Promise(async (r)=>{
    classroom.courses.students.list({courseId:id,pageSize:0}, (err,res)=>{
      r({err,res})
    })
  })
}

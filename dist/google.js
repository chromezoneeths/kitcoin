"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// This file contains abstractions for Google APIs.
var conf = __importStar(require("./config"));
var uuid_1 = require("uuid");
var urllib = __importStar(require("url"));
var db = __importStar(require("./db"));
var oauthKeys = {
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET
};
var oauthScopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.rosters.readonly',
    'https://www.googleapis.com/auth/classroom.profile.emails'
];
var googleapis_1 = require("googleapis");
var pendingOAuthCallbacks = [];
function prepare(socket) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    var oAuthClient = new googleapis_1.google.auth.OAuth2(oauthKeys.clientId, oauthKeys.clientSecret, conf.oauthCallbackUrl + "/oauthstage2");
                    function h(raw) {
                        return __awaiter(this, void 0, void 0, function () {
                            var message, _a, thisOAuthID, thisPendingOAuth, url, refresh;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        message = JSON.parse(raw);
                                        _a = message.action;
                                        switch (_a) {
                                            case 'google': return [3 /*break*/, 1];
                                            case 'secret': return [3 /*break*/, 2];
                                        }
                                        return [3 /*break*/, 4];
                                    case 1:
                                        { // User doesn't have a secret and wants to sign in with Google
                                            thisOAuthID = uuid_1.v4();
                                            thisPendingOAuth = {
                                                id: thisOAuthID,
                                                reslve: resolve,
                                                client: oAuthClient
                                            };
                                            url = conf.oauthCallbackUrl + "/oauthstage1#" + JSON.stringify({
                                                redirect: oAuthClient.generateAuthUrl({
                                                    scope: oauthScopes,
                                                    access_type: 'online'
                                                }),
                                                uuid: thisOAuthID
                                            });
                                            pendingOAuthCallbacks.push(thisPendingOAuth);
                                            console.log("Sending login message " + thisOAuthID);
                                            socket.send(JSON.stringify({
                                                action: 'login',
                                                url: url
                                            }));
                                            return [3 /*break*/, 5];
                                        }
                                        _b.label = 2;
                                    case 2: return [4 /*yield*/, db.getSession(message.secret).catch(function () {
                                            return { token: '' };
                                        })];
                                    case 3:
                                        refresh = (_b.sent());
                                        if (refresh.token === '') { // If there is no token found in database for secret, tell the user to discard it.
                                            socket.send(JSON.stringify({
                                                action: 'secret',
                                                result: false
                                            }));
                                            socket.once('message', h);
                                        }
                                        else { // If the session is present, load it and tell the user to continue.
                                            oAuthClient.setCredentials({
                                                refresh_token: refresh.token
                                            });
                                            socket.send(JSON.stringify({
                                                action: 'secret',
                                                result: true
                                            }));
                                            oAuthClient.once('tokens', function (tokens) {
                                                if (tokens.refresh_token) {
                                                    resolve({
                                                        refresh: tokens.refresh_token,
                                                        auth: tokens.access_token
                                                    });
                                                }
                                            });
                                        }
                                        return [3 /*break*/, 5];
                                    case 4:
                                        console.error('user fricked up');
                                        _b.label = 5;
                                    case 5: return [2 /*return*/];
                                }
                            });
                        });
                    }
                    socket.once('message', h);
                })];
        });
    });
}
exports.prepare = prepare;
function callback(request, response, url) {
    return __awaiter(this, void 0, void 0, function () {
        var qs_1, _i, pendingOAuthCallbacks_1, i, tokens;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("OAUTH ROUTER GET " + url);
                    if (!url.startsWith('/oauthstage1')) return [3 /*break*/, 1];
                    response.writeHead(200);
                    response.end('<script src="stage1.js"></script>');
                    return [3 /*break*/, 6];
                case 1:
                    if (!url.startsWith('/oauthstage2')) return [3 /*break*/, 2];
                    response.writeHead(200);
                    response.end('<script src="stage2.js"></script>');
                    return [3 /*break*/, 6];
                case 2:
                    if (!url.startsWith('/oauthstage3')) return [3 /*break*/, 6];
                    qs_1 = new urllib.URL(url, conf.oauthCallbackUrl)
                        .searchParams;
                    _i = 0, pendingOAuthCallbacks_1 = pendingOAuthCallbacks;
                    _a.label = 3;
                case 3:
                    if (!(_i < pendingOAuthCallbacks_1.length)) return [3 /*break*/, 6];
                    i = pendingOAuthCallbacks_1[_i];
                    if (!(pendingOAuthCallbacks[i].id === qs_1.get('uuid'))) return [3 /*break*/, 5];
                    return [4 /*yield*/, pendingOAuthCallbacks[i].client.getToken(qs_1.get('code'))];
                case 4:
                    tokens = (_a.sent()).tokens;
                    response.writeHead(200);
                    response.end('<script>setTimeout(()=>{window.close()},300)</script>');
                    pendingOAuthCallbacks[i].client.credentials = tokens;
                    pendingOAuthCallbacks[i].reslve({
                        auth: pendingOAuthCallbacks[i].client
                    });
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.callback = callback;
function getCourses(classroom) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            classroom.courses.list({
                pageSize: 0
            }, function (err, response) {
                return {
                    err: err,
                    res: response
                };
            });
            return [2 /*return*/];
        });
    });
}
exports.getCourses = getCourses;
function getStudents(classroom, id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) { return classroom.courses.students.list({
                    courseId: id,
                    pageSize: 0
                }, function (err, response) {
                    resolve({
                        err: err,
                        res: response
                    });
                }); })];
        });
    });
}
exports.getStudents = getStudents;

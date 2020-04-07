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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_errors_1 = __importDefault(require("http-errors"));
var express = require('express');
var path = __importStar(require("path"));
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var uuid_1 = require("uuid");
var logger = require('morgan');
var oauth_1 = __importDefault(require("./routes/oauth"));
var users_1 = __importDefault(require("./routes/users"));
var index_1 = __importDefault(require("./routes/index"));
var app = express();
// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookie_parser_1.default());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', index_1.default);
app.use('/users', users_1.default);
var google = __importStar(require("./google"));
app.use('/oauth', oauth_1.default);
// Catch 404 and forward to error handler
app.use(function (request, response, next) {
    next(http_errors_1.default(404));
});
// Error handler
app.use(function (err, request, response, _next) {
    // Set locals, only providing error in development
    response.locals.message = err.message;
    response.locals.error = request.app.get('env') === 'development' ? err : {};
    // Render the error page
    response.status(err.status || 500);
    response.render('error');
});
// Bits added to the end for the backend, probably awful and wrong.
var googleapis = require('googleapis').google;
var conf = __importStar(require("./config"));
var db = __importStar(require("./db"));
var ad = __importStar(require("./admin"));
function init() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.init().catch(function (error) {
                        throw error;
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
init();
function session(ws) {
    return __awaiter(this, void 0, void 0, function () {
        var auth, peopleAPI, classroomAPI, user, userQuery, userID, address, name, admin, ping;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Got new connection');
                    return [4 /*yield*/, google.prepare(ws)];
                case 1:
                    auth = _a.sent();
                    peopleAPI = googleapis.people({
                        version: 'v1',
                        auth: auth.auth
                    });
                    classroomAPI = googleapis.classroom({
                        version: 'v1',
                        auth: auth.auth
                    });
                    return [4 /*yield*/, peopleAPI.people.get({
                            resourceName: 'people/me',
                            personFields: 'emailAddresses,names'
                        })];
                case 2:
                    user = _a.sent();
                    console.log("RECORDS, LOGGING: User " + user.data.names[0].displayName + " has connected with email " + user.data.emailAddresses[0].value + ".");
                    return [4 /*yield*/, db.getUserByAddress(user.data.emailAddresses[0].value)];
                case 3:
                    userQuery = _a.sent();
                    ping = setInterval(function () {
                        ws.send(JSON.stringify({ action: 'ping' }));
                    }, 500);
                    if (!userQuery) return [3 /*break*/, 4];
                    userID = userQuery.uuid;
                    address = userQuery.address;
                    name = userQuery.name;
                    admin = userQuery.role === db.Permission.admin;
                    return [3 /*break*/, 6];
                case 4:
                    userID = uuid_1.v4();
                    admin = false;
                    return [4 /*yield*/, db.addUser(userID, user.data.emailAddresses[0].value, user.data.names[0].displayName).catch(function (error) {
                            console.log("RECORDS, ERROR: " + error);
                        })];
                case 5:
                    _a.sent();
                    address = user.data.emailAddresses[0].value;
                    name = user.data.names[0].displayName;
                    _a.label = 6;
                case 6:
                    ws.send(JSON.stringify({
                        action: 'ready',
                        name: name,
                        email: address,
                        balance: db.getBalance(userID)
                    }));
                    ws.on('message', function (stringMessage) { return __awaiter(_this, void 0, void 0, function () {
                        var message, _a, balance, targetAddress_1, isBalanceSufficient_1, target_1, result, courses, result, students;
                        var _this = this;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    message = JSON.parse(stringMessage);
                                    _a = message.action;
                                    switch (_a) {
                                        case 'getBalance': return [3 /*break*/, 1];
                                        case 'sendCoin': return [3 /*break*/, 3];
                                        case 'mintCoin': return [3 /*break*/, 9];
                                        case 'voidCoin': return [3 /*break*/, 14];
                                        case 'getClasses': return [3 /*break*/, 19];
                                        case 'getStudents': return [3 /*break*/, 21];
                                        case 'oauthInfo': return [3 /*break*/, 23];
                                        case 'elevate': return [3 /*break*/, 24];
                                        case 'pong': return [3 /*break*/, 25];
                                    }
                                    return [3 /*break*/, 26];
                                case 1: return [4 /*yield*/, db.getBalance(userID)];
                                case 2:
                                    balance = _b.sent();
                                    ws.send(JSON.stringify({
                                        action: 'balance',
                                        balance: balance
                                    }));
                                    return [3 /*break*/, 27];
                                case 3:
                                    targetAddress_1 = message.target;
                                    return [4 /*yield*/, Promise.all([
                                            function () { return __awaiter(_this, void 0, void 0, function () {
                                                var balance;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0: return [4 /*yield*/, db.getBalance(userID)];
                                                        case 1:
                                                            balance = _a.sent();
                                                            isBalanceSufficient_1 = balance > message.amount;
                                                            return [2 /*return*/];
                                                    }
                                                });
                                            }); },
                                            function () { return __awaiter(_this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0: return [4 /*yield*/, db.getUserByAddress(targetAddress_1)];
                                                        case 1:
                                                            target_1 = _a.sent();
                                                            return [2 /*return*/];
                                                    }
                                                });
                                            }); }
                                        ])];
                                case 4:
                                    _b.sent();
                                    console.log(isBalanceSufficient_1);
                                    if (!(message.amount !== parseInt(message.amount, 10) || !/[A-Za-z\d]*@[A-Za-z\d]*\.[a-z]{3}/.test(message.target))) return [3 /*break*/, 5];
                                    ws.send(JSON.stringify({
                                        action: 'sendResponse',
                                        status: 'badInput'
                                    }));
                                    return [3 /*break*/, 8];
                                case 5:
                                    if (!(isBalanceSufficient_1 && target_1 !== undefined)) return [3 /*break*/, 7];
                                    return [4 /*yield*/, db.addTransaction(userID, target_1[0], message.amount)];
                                case 6:
                                    _b.sent();
                                    ws.send(JSON.stringify({
                                        action: 'sendResponse',
                                        status: 'ok'
                                    }));
                                    return [3 /*break*/, 8];
                                case 7:
                                    if (target_1 === undefined) {
                                        ws.send(JSON.stringify({
                                            action: 'sendResponse',
                                            status: 'nonexistentTarget'
                                        }));
                                    }
                                    else if (!isBalanceSufficient_1) {
                                        ws.send(JSON.stringify({
                                            action: 'sendResponse',
                                            status: 'insufficientBalance'
                                        }));
                                    }
                                    _b.label = 8;
                                case 8: return [3 /*break*/, 27];
                                case 9:
                                    if (!(message.amount !== parseInt(message.amount, 10))) return [3 /*break*/, 10];
                                    ws.send(JSON.stringify({
                                        action: 'mintResponse',
                                        status: 'badInput'
                                    }));
                                    return [3 /*break*/, 13];
                                case 10:
                                    if (!admin) return [3 /*break*/, 12];
                                    return [4 /*yield*/, db.addTransaction('nobody', userID, message.amount)];
                                case 11:
                                    _b.sent();
                                    ws.send(JSON.stringify({
                                        action: 'mintResponse',
                                        status: 'ok'
                                    }));
                                    return [3 /*break*/, 13];
                                case 12:
                                    ws.send(JSON.stringify({
                                        action: 'mintResponse',
                                        status: 'denied'
                                    }));
                                    console.log("RECORDS, WARNING: UNAUTHORIZED USER " + name + " ATTEMPTS TO MINT " + message.amount);
                                    _b.label = 13;
                                case 13: return [3 /*break*/, 27];
                                case 14:
                                    if (!(message.amount !== parseInt(message.amount, 10))) return [3 /*break*/, 15];
                                    ws.send(JSON.stringify({
                                        action: 'voidResponse',
                                        status: 'badInput'
                                    }));
                                    return [3 /*break*/, 18];
                                case 15:
                                    if (!admin) return [3 /*break*/, 17];
                                    return [4 /*yield*/, db.addTransaction(userID, 'nobody', message.amount)];
                                case 16:
                                    _b.sent();
                                    ws.send(JSON.stringify({
                                        action: 'voidResponse',
                                        status: 'ok'
                                    }));
                                    return [3 /*break*/, 18];
                                case 17:
                                    ws.send(JSON.stringify({
                                        action: 'voidResponse',
                                        status: 'denied'
                                    }));
                                    console.log("RECORDS, WARNING: UNAUTHORIZED USER " + name + " ATTEMPTS TO VOID " + message.amount);
                                    _b.label = 18;
                                case 18: return [3 /*break*/, 27];
                                case 19: return [4 /*yield*/, google.getCourses(classroomAPI)];
                                case 20:
                                    result = _b.sent();
                                    if (result.err) {
                                        ws.send(JSON.stringify({
                                            action: 'getClassesResponse',
                                            status: 'ServerError',
                                            err: result.err
                                        }));
                                    }
                                    else {
                                        courses = result.res.data.courses;
                                        if (courses === null || courses === void 0 ? void 0 : courses.length) {
                                            ws.send(JSON.stringify({
                                                action: 'getClassesResponse',
                                                status: 'ok',
                                                classes: courses
                                            }));
                                        }
                                    }
                                    return [3 /*break*/, 27];
                                case 21: return [4 /*yield*/, google.getStudents(classroomAPI, message.classID)];
                                case 22:
                                    result = _b.sent();
                                    if (result.err) {
                                        ws.send(JSON.stringify({
                                            action: 'getStudentsResponse',
                                            status: 'ServerError',
                                            err: result.err
                                        }));
                                    }
                                    else {
                                        console.log(result.res.data);
                                        students = result.res.data.students;
                                        ws.send(JSON.stringify({
                                            action: 'getStudentsResponse',
                                            status: 'ok',
                                            students: students
                                        }));
                                    }
                                    return [3 /*break*/, 27];
                                case 23:
                                    {
                                        return [3 /*break*/, 27];
                                    }
                                    _b.label = 24;
                                case 24:
                                    {
                                        if (!admin || !conf.enableRemote) {
                                            console.log("RECORDS, WARNING: UNAUTHORIZED USER " + name + " ATTEMPTS ELEVATED ACTION " + message.procedure + " WITH BODY " + message.body);
                                            ws.send(JSON.stringify({
                                                action: 'elevateResult',
                                                status: 'denied'
                                            }));
                                        }
                                        else {
                                            console.log("RECORDS, LOGGING: USER " + name + " EXECUTES ELEVATED ACTION " + message.procedure + " WITH BODY " + message.body);
                                            ad.handle(message, ws).catch(function (error) {
                                                ws.send(JSON.stringify({
                                                    action: 'elevateResult',
                                                    status: 'error',
                                                    contents: error
                                                }));
                                            });
                                        }
                                        return [3 /*break*/, 27];
                                    }
                                    _b.label = 25;
                                case 25:
                                    {
                                        return [3 /*break*/, 27];
                                    }
                                    _b.label = 26;
                                case 26:
                                    console.error("RECORDS, WARNING: User " + name + " attempts invalid action " + message.action + ".");
                                    _b.label = 27;
                                case 27: return [2 /*return*/];
                            }
                        });
                    }); });
                    ws.on('close', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            console.log("RECORDS, LOGGING: User " + name + " has disconnected.");
                            return [2 /*return*/];
                        });
                    }); });
                    return [2 /*return*/];
            }
        });
    });
}
module.exports.app = app;
module.exports.wssessionmethod = session;

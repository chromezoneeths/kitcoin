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
// This file contains abstractions for database calls. It should also  do any injection filtering.
var mongo = __importStar(require("mongodb"));
var conf = __importStar(require("./config"));
var uuid_1 = require("uuid");
var crypto = __importStar(require("crypto"));
var client;
function init() {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('RECORDS, LOGGING: Connecting to database at ' + conf.dbIP);
                    client = new mongo.MongoClient(conf.dbIP, { useNewUrlParser: true });
                    return [4 /*yield*/, client.connect()];
                case 1:
                    _a.sent();
                    console.log('RECORDS, LOGGING: Connection successful, ensuring everything is ready');
                    db = client.db('kitcoin');
                    return [4 /*yield*/, Promise.all([
                            db.createCollection('users', {
                                validator: {
                                    $or: [
                                        { uuid: { $type: 'string' } },
                                        { address: { $regex: /[A-Za-z\d]*@[A-Za-z\d]*\.[a-z]*/ } },
                                        { name: { $type: 'string' } },
                                        { role: { $in: ['student', 'teacher', 'vendor', 'admin', 'sadmin'] } }
                                    ]
                                }
                            }),
                            db.createCollection('transactions', {
                                validator: {
                                    $or: [
                                        { uuid: { $type: 'string' } },
                                        { timestamp: { $type: 'date' } },
                                        { sender: { $type: 'string' } },
                                        { recipient: { $type: 'string' } },
                                        { amount: { $type: 'int' } }
                                    ]
                                }
                            }),
                            db.createCollection('products', {
                                validator: {
                                    $or: [
                                        { uuid: { $type: 'string' } },
                                        { vendor: { $type: 'string' } },
                                        { name: { $type: 'string' } },
                                        { description: { $type: 'string' } },
                                        { price: { $type: 'int' } }
                                    ]
                                }
                            }),
                            db.createCollection('sessions', {
                                validator: {
                                    $or: [
                                        { uuid: { $type: 'string' } },
                                        { user: { $type: 'string' } },
                                        { secret: { $type: 'string' } },
                                        { token: { $type: 'string' } }
                                    ]
                                }
                            })
                        ])];
                case 2:
                    _a.sent();
                    console.log('RECORDS, LOGGING: All collections have been created.');
                    return [2 /*return*/];
            }
        });
    });
}
exports.init = init;
function addUser(id, address, name) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.connect()];
                case 1:
                    _a.sent();
                    db = client.db('kitcoin');
                    return [4 /*yield*/, db.collection('users').insertOne({
                            uuid: id,
                            address: address,
                            name: name,
                            role: 'student'
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.addUser = addUser;
function addTransaction(sender, recipient, amount) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.connect()];
                case 1:
                    _a.sent();
                    db = client.db('kitcoin');
                    return [4 /*yield*/, db.collection('transactions').insertOne({
                            uuid: uuid_1.v4(),
                            timestamp: (new Date(Date.now())).toISOString(),
                            sender: sender,
                            recipient: recipient,
                            amount: amount
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.addTransaction = addTransaction;
function getBalance(uuid) {
    return __awaiter(this, void 0, void 0, function () {
        var balance, db, transactions, rec, out;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    balance = 0;
                    return [4 /*yield*/, client.connect()];
                case 1:
                    _a.sent();
                    db = client.db('kitcoin');
                    transactions = db.collection('transactions');
                    rec = transactions.find({ recipient: uuid });
                    out = transactions.find({ sender: uuid });
                    return [4 /*yield*/, Promise.all([
                            function () { return __awaiter(_this, void 0, void 0, function () {
                                var doc;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, rec.hasNext()];
                                        case 1:
                                            if (!_a.sent()) return [3 /*break*/, 3];
                                            return [4 /*yield*/, rec.next()];
                                        case 2:
                                            doc = _a.sent();
                                            balance += doc.amount;
                                            return [3 /*break*/, 0];
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); },
                            function () { return __awaiter(_this, void 0, void 0, function () {
                                var doc;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, out.hasNext()];
                                        case 1:
                                            if (!_a.sent()) return [3 /*break*/, 3];
                                            return [4 /*yield*/, out.next()];
                                        case 2:
                                            doc = _a.sent();
                                            balance -= doc.amount;
                                            return [3 /*break*/, 0];
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); }
                        ])];
                case 2:
                    _a.sent();
                    return [2 /*return*/, balance];
            }
        });
    });
}
exports.getBalance = getBalance;
function getUserByAddress(address) {
    return __awaiter(this, void 0, void 0, function () {
        var db, users, search;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.connect()];
                case 1:
                    _a.sent();
                    db = client.db('kitcoin');
                    users = db.collection('users');
                    search = users.find({ address: address });
                    return [4 /*yield*/, search.hasNext()];
                case 2:
                    if (_a.sent()) {
                        return [2 /*return*/, search.next()];
                    }
                    throw new Error('User not found.');
            }
        });
    });
}
exports.getUserByAddress = getUserByAddress;
function getUserByID(uuid) {
    return __awaiter(this, void 0, void 0, function () {
        var db, users, search;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.connect()];
                case 1:
                    _a.sent();
                    db = client.db('kitcoin');
                    users = db.collection('users');
                    search = users.find({ uuid: uuid });
                    return [4 /*yield*/, search.hasNext()];
                case 2:
                    if (_a.sent()) {
                        return [2 /*return*/, search.next()];
                    }
                    throw new Error('User not found.');
            }
        });
    });
}
exports.getUserByID = getUserByID;
function listUsers() {
    return __awaiter(this, void 0, void 0, function () {
        var results, db, users, search, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, client.connect()];
                case 1:
                    _c.sent();
                    results = [];
                    db = client.db('kitcoin');
                    users = db.collection('users');
                    search = users.find({});
                    _c.label = 2;
                case 2: return [4 /*yield*/, search.hasNext()];
                case 3:
                    if (!_c.sent()) return [3 /*break*/, 5];
                    _b = (_a = results).push;
                    return [4 /*yield*/, search.next()];
                case 4:
                    _b.apply(_a, [_c.sent()]);
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, results];
            }
        });
    });
}
exports.listUsers = listUsers;
function listTransactions() {
    return __awaiter(this, void 0, void 0, function () {
        var results, db, transactions, search, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, client.connect()];
                case 1:
                    _c.sent();
                    results = [];
                    db = client.db('kitcoin');
                    transactions = db.collection('transactions');
                    search = transactions.find({});
                    _c.label = 2;
                case 2: return [4 /*yield*/, search.hasNext()];
                case 3:
                    if (!_c.sent()) return [3 /*break*/, 5];
                    _b = (_a = results).push;
                    return [4 /*yield*/, search.next()];
                case 4:
                    _b.apply(_a, [_c.sent()]);
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, results];
            }
        });
    });
}
exports.listTransactions = listTransactions;
var Permission;
(function (Permission) {
    Permission[Permission["admin"] = 0] = "admin";
    Permission[Permission["teacher"] = 1] = "teacher";
    Permission[Permission["vendor"] = 2] = "vendor";
})(Permission = exports.Permission || (exports.Permission = {}));
function grant(id, _permission) {
    return __awaiter(this, void 0, void 0, function () {
        var db, users;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.connect()];
                case 1:
                    _a.sent();
                    db = client.db('kitcoin');
                    users = db.collection('users');
                    return [4 /*yield*/, users.findOneAndUpdate({ uuid: id }, { $set: { role: _permission } })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.grant = grant;
function degrant(id, _permission) {
    return __awaiter(this, void 0, void 0, function () {
        var db, users;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.connect()];
                case 1:
                    _a.sent();
                    db = client.db('kitcoin');
                    users = db.collection('users');
                    return [4 /*yield*/, users.findOneAndUpdate({ uuid: id }, { $set: { role: 'student' } })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.degrant = degrant;
function exec(statement) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            throw new Error("User attempted illegal SQL statement " + statement);
        });
    });
}
exports.exec = exec;
function revoke(id) {
    return __awaiter(this, void 0, void 0, function () {
        var db, transactions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.connect()];
                case 1:
                    _a.sent();
                    db = client.db('kitcoin');
                    transactions = db.collection('transactions');
                    return [4 /*yield*/, transactions.deleteOne({ uuid: id })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.revoke = revoke;
function getSession(secret) {
    return __awaiter(this, void 0, void 0, function () {
        var db, sessions, search;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.connect()];
                case 1:
                    _a.sent();
                    db = client.db('kitcoin');
                    sessions = db.collection('sessions');
                    search = sessions.find({ secret: secret });
                    return [4 /*yield*/, search.hasNext()];
                case 2:
                    if (_a.sent()) {
                        return [2 /*return*/, search.next()];
                    }
                    throw new Error('Session not found');
            }
        });
    });
}
exports.getSession = getSession;
function addSession(token, user) {
    return __awaiter(this, void 0, void 0, function () {
        var db, sessions, secret;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.connect()];
                case 1:
                    _a.sent();
                    db = client.db('kitcoin');
                    sessions = db.collection('sessions');
                    secret = crypto.randomBytes(1024).toString('base64');
                    sessions.insertOne({
                        uuid: uuid_1.v4(),
                        secret: secret,
                        user: user,
                        token: token
                    });
                    return [2 /*return*/, secret];
            }
        });
    });
}
exports.addSession = addSession;

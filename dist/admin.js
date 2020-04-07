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
var db = __importStar(require("./db"));
var config = __importStar(require("./config"));
// This file contains definitions for the rpc actions.
function handle(message, ws) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, usersQuery, transactions, limit, userAddress, permission, userAddress, permission, userQuery;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = message.procedure;
                    switch (_a) {
                        case 'listUsers': return [3 /*break*/, 1];
                        case 'listTransactions': return [3 /*break*/, 3];
                        case 'grant': return [3 /*break*/, 5];
                        case 'degrant': return [3 /*break*/, 7];
                        case 'sql': return [3 /*break*/, 9];
                        case 'probe': return [3 /*break*/, 10];
                        case 'revert': return [3 /*break*/, 12];
                        case 'help': return [3 /*break*/, 14];
                    }
                    return [3 /*break*/, 15];
                case 1: return [4 /*yield*/, db.listUsers()];
                case 2:
                    usersQuery = _b.sent();
                    ws.send(JSON.stringify({
                        action: 'elevateResult',
                        status: 'ok',
                        contents: usersQuery
                    }));
                    return [3 /*break*/, 16];
                case 3: return [4 /*yield*/, db.listTransactions()];
                case 4:
                    transactions = _b.sent();
                    limit = void 0;
                    try {
                        limit = parseInt(message.body, 10);
                    }
                    catch (_) {
                        limit = 50;
                    }
                    transactions = transactions.slice(-limit);
                    ws.send(JSON.stringify({
                        action: 'elevateResult',
                        status: 'ok',
                        contents: transactions
                    }));
                    return [3 /*break*/, 16];
                case 5:
                    userAddress = message.body.split(' ')[0];
                    permission = message.body.split(' ')[1];
                    return [4 /*yield*/, db.grant(userAddress, permission)];
                case 6:
                    _b.sent();
                    ws.send(JSON.stringify({
                        action: 'elevateResult',
                        status: 'ok'
                    }));
                    return [2 /*return*/];
                case 7:
                    userAddress = message.body.split(' ')[0];
                    permission = message.body.split(' ')[1];
                    return [4 /*yield*/, db.degrant(userAddress, permission)];
                case 8:
                    _b.sent();
                    ws.send(JSON.stringify({
                        action: 'elevateResult',
                        status: 'ok'
                    }));
                    return [2 /*return*/];
                case 9:
                    { // Treats body as a SQL statement to be executed. Handle with care.
                        ws.send(JSON.stringify({
                            action: 'elevateResult',
                            status: 'failed',
                            contents: 'This is the MongoDB port of Kitcoin, you can’t do that here.'
                        }));
                        return [3 /*break*/, 16];
                    }
                    _b.label = 10;
                case 10: return [4 /*yield*/, db.getUserByAddress(message.body)];
                case 11:
                    userQuery = _b.sent();
                    ws.send(JSON.stringify({
                        action: 'elevateResult',
                        status: 'ok',
                        contents: userQuery
                    }));
                    return [3 /*break*/, 16];
                case 12: // Revert a transaction by ID in the body
                return [4 /*yield*/, db.revoke(message.body)];
                case 13:
                    _b.sent();
                    ws.send(JSON.stringify({
                        action: 'elevateResult',
                        status: 'ok'
                    }));
                    return [3 /*break*/, 16];
                case 14:
                    { // Return a help message.
                        ws.send(JSON.stringify({
                            action: 'elevateResult',
                            status: 'ok',
                            contents: config.helpMessage
                        }));
                        return [3 /*break*/, 16];
                    }
                    _b.label = 15;
                case 15:
                    {
                        ws.send(JSON.stringify({
                            action: 'elevateResult',
                            status: 'badProcedure'
                        }));
                    }
                    _b.label = 16;
                case 16: return [2 /*return*/];
            }
        });
    });
}
exports.handle = handle;

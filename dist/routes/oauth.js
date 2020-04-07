"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = __importStar(require("express"));
var fs = __importStar(require("fs"));
var oauthRouter = express.Router();
var google = __importStar(require("../google"));
oauthRouter.get('/oauthstage1', function (request, response) {
    google.callback(request, response, '/oauthstage1');
});
oauthRouter.get('/oauthstage2', function (request, response) {
    google.callback(request, response, '/oauthstage2');
});
oauthRouter.get('/oauthstage3', function (request, response) {
    console.log(request.url);
    google.callback(request, response, request.url);
});
oauthRouter.get('/stage1.js', function (request, response) {
    response.end(fs.readFileSync('clientJs/stage1.js'));
});
oauthRouter.get('/stage2.js', function (request, response) {
    response.end(fs.readFileSync('clientJs/stage2.js'));
});
exports.default = oauthRouter;

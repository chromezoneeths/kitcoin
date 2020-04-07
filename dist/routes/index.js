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
var router = express.Router();
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
/* GET home page. */
router.get('/', function (request, response) {
    response.end(fs.readFileSync(path.join(__dirname, 'public/index.html')));
});
exports.default = router;

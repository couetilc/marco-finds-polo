require('source-map-support/register')
module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

const http = __webpack_require__(2);
const express = __webpack_require__(3);
const bodyParser = __webpack_require__(4);
const app = express();
const server = http.createServer(app);
const io = __webpack_require__(5)(server);
const port = process.env.PORT || 4444;
const aws = __webpack_require__(6);
const db = new aws.DynamoDB({ region: 'us-east-1' });

let POLO = [];
let MARCO = [];

function putPositionParam(data) {
    return {
        TableName: "marcos",
        Item: {
            "id": { S: data.marco.toString() },
            "latitude": { S: data.latitude.toString() },
            "longitude": { S: data.longitude.toString() },
            "timestamp": { S: data.timestamp.toString() }
        }
    };
};

function getPositionParam(data) {
    return {
        TableName: "marcos",
        Key: {
            "id": { S: data.polo.toString() }
        }
    };
}

function getDistance(p1, p2) {
    const distX = p1.latitude - p2.latitude;
    const distY = p1.longitude - p2.longitude;
    const distance = Math.sqrt(distX * distX + distY * distY);
    return distance;
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send());

app.post('/update', (req, res) => {
    console.log(req);
    res.send();
});

app.post('/emoji', (req, res) => {
    console.log(req);
    res.send();
});

io.on('connection', socket => {
    socket.on('emoji', data => {
        console.log(data);
        io.to(POLO).emit('showemoji', data);
    });
    socket.on('position', data => {
        let param = putPositionParam(data);
        POLO = data.polo;
        socket.join(data.marco);

        db.putItem(param, (error, result) => {
            if (error) {
                console.log(error);
            } else {
                const marco_data = data;
                param = getPositionParam(data);
                db.getItem(param, (error, result) => {
                    if (error || !result.Item) {
                        console.log("error:", error, result);
                    } else {
                        const polo_response = result;
                        const distance = getDistance({
                            latitude: parseFloat(marco_data.latitude),
                            longitude: parseFloat(marco_data.longitude)
                        }, {
                            latitude: parseFloat(polo_response.Item.latitude.S),
                            longitude: parseFloat(polo_response.Item.longitude.S)
                        });

                        socket.emit('distance', { "distance": distance });
                    }
                });
            }
        });
    });
    socket.on('marcopolo', data => {
        console.log(data);
    });
    socket.on('polo', data => {
        POLO = data.polo;
        MARCO = data.marco;
        console.log('polo event');
        console.log(data);
    });
});

io.on('disconnect', socket => {
    console.log('byebye');
});

server.listen(port);
console.log("geo api listening on port " + port);

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("body-parser");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("socket.io");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("aws-sdk");

/***/ })
/******/ ]);
//# sourceMappingURL=main.map
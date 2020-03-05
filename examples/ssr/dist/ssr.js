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
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./App.svelte":
/*!********************!*\
  !*** ./App.svelte ***!
  \********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! svelte/internal */ \"svelte/internal\");\n/* harmony import */ var svelte_internal__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(svelte_internal__WEBPACK_IMPORTED_MODULE_0__);\n/* examples/ssr/App.svelte generated by Svelte v3.19.1 */\n\n\nconst App = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__[\"create_ssr_component\"])(($$result, $$props, $$bindings, $$slots) => {\n\tlet { request } = $$props;\n\tif ($$props.request === void 0 && $$bindings.request && request !== void 0) $$bindings.request(request);\n\n\treturn `<h1>SSR Example</h1>\n\n<p>\n  The current URL is ${Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__[\"escape\"])(request.url)}\n</p>`;\n});\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (App);\n\n//# sourceURL=webpack:///./App.svelte?");

/***/ }),

/***/ "./ssr.js":
/*!****************!*\
  !*** ./ssr.js ***!
  \****************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./App */ \"./App.svelte\");\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (pageTemplate => ctx => {\n  // Render the application using Svelte's SSR API and receive the <head> HTML,\n  // body HTML, and CSS code.\n  let page = {};\n\n  try {\n    page = ctx.url.includes('not-found') ? {\n      status: 404\n    } : _App__WEBPACK_IMPORTED_MODULE_0__[\"default\"].render(ctx);\n  } catch (err) {\n    // Log the error if one is thrown when rendering the page.\n    ctx.log.error(err); // Instead of a Svelte app/page, we'll just show the words \"Internal Server\n    // Error\" on the page.\n\n    page.html = 'Internal Server Error';\n  } // Return the page object to the SSR middleware so that it can be assembled\n  // into an HTML page and sent to the client.\n\n\n  return page;\n});\n\n//# sourceURL=webpack:///./ssr.js?");

/***/ }),

/***/ 0:
/*!**********************!*\
  !*** multi ./ssr.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("module.exports = __webpack_require__(/*! ./ssr.js */\"./ssr.js\");\n\n\n//# sourceURL=webpack:///multi_./ssr.js?");

/***/ }),

/***/ "svelte/internal":
/*!**********************************!*\
  !*** external "svelte/internal" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"svelte/internal\");\n\n//# sourceURL=webpack:///external_%22svelte/internal%22?");

/***/ })

/******/ });
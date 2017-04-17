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
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var state = {
  charging_method: 'by_fixedprice',
  settings_visible: 'hidden',
  itemSelector: '.todo .item',
  items: []
};

// Store
var store = {};

var WORDS_ADJ = ['secret', 'precious', 'tremendous', 'adorable', 'pink', 'capricious', 'turquoise', 'corageous', 'dazzling', 'educated', 'erratic', 'creative', 'entertaining', 'witty', 'harmonious', 'mature', 'organic', 'gluten-free', 'therapeutic'];
var WORDS_NOUNS = ['time', 'attention', 'expertise', 'taste', 'study', 'talent', 'effort', 'art', 'history', 'computer', 'data', 'knowledge', 'idea', 'development', 'policy', 'professionalism', 'dance', 'support', 'dump', 'pride', 'communication'];

var pickRandom = function pickRandom(wordList) {
  var l = wordList.length - 1;
  var rand = Math.round(Math.random() * l);
  return wordList[rand];
};

function idOrClassName(el) {
  return '#' + el.getAttribute('id') != '#null' || '.' + Array.from(el.classList).join('.');
}

function elToSelector(el) {
  return idOrClassName(el.parentNode) + '>' + idOrClassName(el);
}

// hourly-rate math
var calculateHourlyRate = function calculateHourlyRate(itemEl) {
  var rate = parseFloat(itemEl.querySelector('.rate').textContent);
  var hrs = parseFloat(itemEl.querySelector('.hrs').textContent);

  return rate * hrs;
};

var calculateFixedPrice = function calculateFixedPrice(itemEl) {
  return parseFloat(itemEl.querySelector('.subtotal').textContent);
};

// one item price
var calculateItemPrice = function calculateItemPrice(itemEl) {
  return state.charging_method == 'by_hour' ? calculateHourlyRate(itemEl) : calculateFixedPrice(itemEl);
};

// invoice items sum
var calculateTotal = function calculateTotal(itemsEls) {
  var total = 0;
  itemsEls.forEach(function (it) {
    var itemPrice = calculateItemPrice(it);
    total += itemPrice;
  });

  return total;
};

/* Display single item hourly rate */
var displayItemPrice = function displayItemPrice(itemEl) {
  var subtotalEl = itemEl.querySelector('.subtotal');
  subtotalEl.textContent = Number(calculateItemPrice(itemEl)).toFixed(0);
};

/* Display calculated invoice */
var displayTotal = function displayTotal(itemsEls) {
  var totalEl = document.querySelector('.total .subtotal > .value');
  totalEl.textContent = Number(calculateTotal(itemsEls)).toFixed(0);
};

/* Calculate everything from start */
var recalculate = function recalculate() {
  state['items'].forEach(function (it) {
    displayItemPrice(it);
  });
  displayTotal(state['items']);
};

// update state
var updateState = function updateState() {
  state['items'] = document.querySelectorAll(state['itemSelector']);
};

// Add item appropriate listeners
var mkItemInteractive = function mkItemInteractive(item) {
  var rmItemBtn = item.querySelector('.rmItem-btn');

  item.addEventListener('focusout', recalculate);
  rmItemBtn.addEventListener('click', handleRmItemClick);
};

/* Add a new cloned invoice item */
var createItem = function createItem() {
  var lastItem = state.items.length - 1;
  var newItem = state['items'][lastItem].cloneNode(true);

  newItem.querySelector('.name').textContent = 'My +ADJ +NOUN.'.replace('+ADJ', pickRandom(WORDS_ADJ)).replace('+NOUN', pickRandom(WORDS_NOUNS));
  newItem.querySelector('.description').textContent = 'And also because of my +ADJ +NOUN.'.replace('+ADJ', pickRandom(WORDS_ADJ)).replace('+NOUN', pickRandom(WORDS_NOUNS));
  newItem.querySelector('.subtotal').textContent = 1000;
  newItem.querySelector('.hrs').textContent = 10;
  newItem.querySelector('.rate').textContent = 100;

  mkItemInteractive(newItem);

  // add to DOM, and update state
  state['items'][lastItem].parentNode.appendChild(newItem);
  updateState();
};

var removeItem = function removeItem(item) {
  item.remove();
  updateState();
};

/* Change Tooltip visible/hidden */
var changeTooltipVisibility = function changeTooltipVisibility(tooltipEl, newVisibility) {
  tooltipEl.classList.remove(state['settings_visible']);
  state['settings_visible'] = newVisibility;
  tooltipEl.classList.add(newVisibility);
};

/* Change charge method to newMethod. Apply css 'newMethod' to defaultTgt */
var changeChargingMethodLayout = function changeChargingMethodLayout(defaultTgt, newMethod) {
  defaultTgt.classList.remove(state['charging_method']);
  state['charging_method'] = newMethod;
  defaultTgt.classList.add(newMethod);
};

var handleSettingsClick = function handleSettingsClick(targetEl, e) {
  var tgtEl = document.querySelector(targetEl) || document.querySelector(e.target.getAttribute('data-target'));
  changeTooltipVisibility(tgtEl, state['settings_visible'] == 'visible' ? 'hidden' : 'visible');
};

/*
 * Charge method changed.
 */
var handleChargingChange = function handleChargingChange(defaultTgt, e) {
  var tgtEl = document.querySelector(defaultTgt);

  var chargingMethodEl = e.target;
  var chargingMethodOpts = Array.from(chargingMethodEl.options).map(function (opt) {
    return opt.value;
  });

  changeChargingMethodLayout(tgtEl, chargingMethodOpts[chargingMethodEl.selectedIndex]);
  recalculate(state.items);
};

var handleAddItemClick = function handleAddItemClick(e) {
  createItem();
  recalculate();
};

var handleRmItemClick = function handleRmItemClick(e) {
  var itemRmBtn = e.target;
  var itemEl = itemRmBtn.parentNode.parentNode;

  removeItem(itemEl);
  recalculate();
};

var start = function start() {

  state['settingsBtn'] = document.querySelector('.settings-btn');
  state['addItemBtn'] = document.querySelector('.additem-btn');
  state['chargingMethodEl'] = document.querySelector('#charging-method');
  updateState();

  state.chargingMethodEl.addEventListener('change', handleChargingChange.bind({}, '.project-todo'));
  state.settingsBtn.addEventListener('click', handleSettingsClick.bind({}, '.settings-tooltip'));
  state.addItemBtn.addEventListener('click', handleAddItemClick);

  state['items'].forEach(function (item) {
    mkItemInteractive(item);
  });

  recalculate();
};

document.addEventListener('DOMContentLoaded', start);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(0);


/***/ })
/******/ ]);
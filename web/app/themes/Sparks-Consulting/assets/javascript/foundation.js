;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], function() {
      return (factory());
    });
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.whatInput = factory();
  }
} (this, function() {
  'use strict';


  /*
    ---------------
    variables
    ---------------
  */

  // array of actively pressed keys
  var activeKeys = [];

  // cache document.body
  var body = document.body;

  // boolean: true if touch buffer timer is running
  var buffer = false;

  // the last used input type
  var currentInput = null;

  // array of form elements that take keyboard input
  var formInputs = [
    'input',
    'select',
    'textarea'
  ];

  // user-set flag to allow typing in form fields to be recorded
  var formTyping = body.hasAttribute('data-whatinput-formtyping');

  // mapping of events to input types
  var inputMap = {
    'keydown': 'keyboard',
    'mousedown': 'mouse',
    'mouseenter': 'mouse',
    'touchstart': 'touch',
    'pointerdown': 'pointer',
    'MSPointerDown': 'pointer'
  };

  // array of all used input types
  var inputTypes = [];

  // mapping of key codes to common name
  var keyMap = {
    9: 'tab',
    13: 'enter',
    16: 'shift',
    27: 'esc',
    32: 'space',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  // map of IE 10 pointer events
  var pointerMap = {
    2: 'touch',
    3: 'touch', // treat pen like touch
    4: 'mouse'
  };

  // touch buffer timer
  var timer;


  /*
    ---------------
    functions
    ---------------
  */

  function bufferInput(event) {
    clearTimeout(timer);

    setInput(event);

    buffer = true;
    timer = setTimeout(function() {
      buffer = false;
    }, 1000);
  }

  function immediateInput(event) {
    if (!buffer) setInput(event);
  }

  function setInput(event) {
    var eventKey = key(event);
    var eventTarget = target(event);
    var value = inputMap[event.type];
    if (value === 'pointer') value = pointerType(event);

    if (currentInput !== value) {
      if (
        // only if the user flag isn't set
        !formTyping &&

        // only if currentInput has a value
        currentInput &&

        // only if the input is `keyboard`
        value === 'keyboard' &&

        // not if the key is `TAB`
        keyMap[eventKey] !== 'tab' &&

        // only if the target is one of the elements in `formInputs`
        formInputs.indexOf(eventTarget.nodeName.toLowerCase()) >= 0
      ) {
        // ignore keyboard typing on form elements
      } else {
        currentInput = value;
        body.setAttribute('data-whatinput', currentInput);

        if (inputTypes.indexOf(currentInput) === -1) inputTypes.push(currentInput);
      }
    }

    if (value === 'keyboard') logKeys(eventKey);
  }

  function key(event) {
    return (event.keyCode) ? event.keyCode : event.which;
  }

  function target(event) {
    return event.target || event.srcElement;
  }

  function pointerType(event) {
    return (typeof event.pointerType === 'number') ? pointerMap[event.pointerType] : event.pointerType;
  }

  // keyboard logging
  function logKeys(eventKey) {
    if (activeKeys.indexOf(keyMap[eventKey]) === -1 && keyMap[eventKey]) activeKeys.push(keyMap[eventKey]);
  }

  function unLogKeys(event) {
    var eventKey = key(event);
    var arrayPos = activeKeys.indexOf(keyMap[eventKey]);

    if (arrayPos !== -1) activeKeys.splice(arrayPos, 1);
  }

  function bindEvents() {

    // pointer/mouse
    var mouseEvent = 'mousedown';

    if (window.PointerEvent) {
      mouseEvent = 'pointerdown';
    } else if (window.MSPointerEvent) {
      mouseEvent = 'MSPointerDown';
    }

    body.addEventListener(mouseEvent, immediateInput);
    body.addEventListener('mouseenter', immediateInput);

    // touch
    if ('ontouchstart' in window) {
      body.addEventListener('touchstart', bufferInput);
    }

    // keyboard
    body.addEventListener('keydown', immediateInput);
    document.addEventListener('keyup', unLogKeys);
  }


  /*
    ---------------
    init

    don't start script unless browser cuts the mustard,
    also passes if polyfills are used
    ---------------
  */

  if ('addEventListener' in window && Array.prototype.indexOf) {
    bindEvents();
  }


  /*
    ---------------
    api
    ---------------
  */

  return {

    // returns string: the current input type
    ask: function() { return currentInput; },

    // returns array: currently pressed keys
    keys: function() { return activeKeys; },

    // returns array: all the detected input types
    types: function() { return inputTypes; },

    // accepts string: manually set the input type
    set: setInput
  };

}));

!function($) {
"use strict";

var FOUNDATION_VERSION = '6.1.2';

// Global Foundation object
// This is attached to the window, or used as a module for AMD/Browserify
var Foundation = {
  version: FOUNDATION_VERSION,

  /**
   * Stores initialized plugins.
   */
  _plugins: {},

  /**
   * Stores generated unique ids for plugin instances
   */
  _uuids: [],

  /**
   * Returns a boolean for RTL support
   */
  rtl: function(){
    return $('html').attr('dir') === 'rtl';
  },
  /**
   * Defines a Foundation plugin, adding it to the `Foundation` namespace and the list of plugins to initialize when reflowing.
   * @param {Object} plugin - The constructor of the plugin.
   */
  plugin: function(plugin, name) {
    // Object key to use when adding to global Foundation object
    // Examples: Foundation.Reveal, Foundation.OffCanvas
    var className = (name || functionName(plugin));
    // Object key to use when storing the plugin, also used to create the identifying data attribute for the plugin
    // Examples: data-reveal, data-off-canvas
    var attrName  = hyphenate(className);

    // Add to the Foundation object and the plugins list (for reflowing)
    this._plugins[attrName] = this[className] = plugin;
  },
  /**
   * @function
   * Populates the _uuids array with pointers to each individual plugin instance.
   * Adds the `zfPlugin` data-attribute to programmatically created plugins to allow use of $(selector).foundation(method) calls.
   * Also fires the initialization event for each plugin, consolidating repeditive code.
   * @param {Object} plugin - an instance of a plugin, usually `this` in context.
   * @param {String} name - the name of the plugin, passed as a camelCased string.
   * @fires Plugin#init
   */
  registerPlugin: function(plugin, name){
    var pluginName = name ? hyphenate(name) : functionName(plugin.constructor).toLowerCase();
    plugin.uuid = this.GetYoDigits(6, pluginName);

    if(!plugin.$element.attr('data-' + pluginName)){ plugin.$element.attr('data-' + pluginName, plugin.uuid); }
    if(!plugin.$element.data('zfPlugin')){ plugin.$element.data('zfPlugin', plugin); }
          /**
           * Fires when the plugin has initialized.
           * @event Plugin#init
           */
    plugin.$element.trigger('init.zf.' + pluginName);

    this._uuids.push(plugin.uuid);

    return;
  },
  /**
   * @function
   * Removes the plugins uuid from the _uuids array.
   * Removes the zfPlugin data attribute, as well as the data-plugin-name attribute.
   * Also fires the destroyed event for the plugin, consolidating repeditive code.
   * @param {Object} plugin - an instance of a plugin, usually `this` in context.
   * @fires Plugin#destroyed
   */
  unregisterPlugin: function(plugin){
    var pluginName = hyphenate(functionName(plugin.$element.data('zfPlugin').constructor));

    this._uuids.splice(this._uuids.indexOf(plugin.uuid), 1);
    plugin.$element.removeAttr('data-' + pluginName).removeData('zfPlugin')
          /**
           * Fires when the plugin has been destroyed.
           * @event Plugin#destroyed
           */
          .trigger('destroyed.zf.' + pluginName);
    for(var prop in plugin){
      plugin[prop] = null;//clean up script to prep for garbage collection.
    }
    return;
  },

  /**
   * @function
   * Causes one or more active plugins to re-initialize, resetting event listeners, recalculating positions, etc.
   * @param {String} plugins - optional string of an individual plugin key, attained by calling `$(element).data('pluginName')`, or string of a plugin class i.e. `'dropdown'`
   * @default If no argument is passed, reflow all currently active plugins.
   */
   reInit: function(plugins){
     var isJQ = plugins instanceof $;
     try{
       if(isJQ){
         plugins.each(function(){
           $(this).data('zfPlugin')._init();
         });
       }else{
         var type = typeof plugins,
         _this = this,
         fns = {
           'object': function(plgs){
             plgs.forEach(function(p){
               $('[data-'+ p +']').foundation('_init');
             });
           },
           'string': function(){
             $('[data-'+ plugins +']').foundation('_init');
           },
           'undefined': function(){
             this['object'](Object.keys(_this._plugins));
           }
         };
         fns[type](plugins);
       }
     }catch(err){
       console.error(err);
     }finally{
       return plugins;
     }
   },

  /**
   * returns a random base-36 uid with namespacing
   * @function
   * @param {Number} length - number of random base-36 digits desired. Increase for more random strings.
   * @param {String} namespace - name of plugin to be incorporated in uid, optional.
   * @default {String} '' - if no plugin name is provided, nothing is appended to the uid.
   * @returns {String} - unique id
   */
  GetYoDigits: function(length, namespace){
    length = length || 6;
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1) + (namespace ? '-' + namespace : '');
  },
  /**
   * Initialize plugins on any elements within `elem` (and `elem` itself) that aren't already initialized.
   * @param {Object} elem - jQuery object containing the element to check inside. Also checks the element itself, unless it's the `document` object.
   * @param {String|Array} plugins - A list of plugins to initialize. Leave this out to initialize everything.
   */
  reflow: function(elem, plugins) {

    // If plugins is undefined, just grab everything
    if (typeof plugins === 'undefined') {
      plugins = Object.keys(this._plugins);
    }
    // If plugins is a string, convert it to an array with one item
    else if (typeof plugins === 'string') {
      plugins = [plugins];
    }

    var _this = this;

    // Iterate through each plugin
    $.each(plugins, function(i, name) {
      // Get the current plugin
      var plugin = _this._plugins[name];

      // Localize the search to all elements inside elem, as well as elem itself, unless elem === document
      var $elem = $(elem).find('[data-'+name+']').addBack('[data-'+name+']');

      // For each plugin found, initialize it
      $elem.each(function() {
        var $el = $(this),
            opts = {};
        // Don't double-dip on plugins
        if ($el.data('zfPlugin')) {
          console.warn("Tried to initialize "+name+" on an element that already has a Foundation plugin.");
          return;
        }

        if($el.attr('data-options')){
          var thing = $el.attr('data-options').split(';').forEach(function(e, i){
            var opt = e.split(':').map(function(el){ return el.trim(); });
            if(opt[0]) opts[opt[0]] = parseValue(opt[1]);
          });
        }
        try{
          $el.data('zfPlugin', new plugin($(this), opts));
        }catch(er){
          console.error(er);
        }finally{
          return;
        }
      });
    });
  },
  getFnName: functionName,
  transitionend: function($elem){
    var transitions = {
      'transition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd',
      'MozTransition': 'transitionend',
      'OTransition': 'otransitionend'
    };
    var elem = document.createElement('div'),
        end;

    for (var t in transitions){
      if (typeof elem.style[t] !== 'undefined'){
        end = transitions[t];
      }
    }
    if(end){
      return end;
    }else{
      end = setTimeout(function(){
        $elem.triggerHandler('transitionend', [$elem]);
      }, 1);
      return 'transitionend';
    }
  }
};


Foundation.util = {
  /**
   * Function for applying a debounce effect to a function call.
   * @function
   * @param {Function} func - Function to be called at end of timeout.
   * @param {Number} delay - Time in ms to delay the call of `func`.
   * @returns function
   */
  throttle: function (func, delay) {
    var timer = null;

    return function () {
      var context = this, args = arguments;

      if (timer === null) {
        timer = setTimeout(function () {
          func.apply(context, args);
          timer = null;
        }, delay);
      }
    };
  }
};

// TODO: consider not making this a jQuery function
// TODO: need way to reflow vs. re-initialize
/**
 * The Foundation jQuery method.
 * @param {String|Array} method - An action to perform on the current jQuery object.
 */
var foundation = function(method) {
  var type = typeof method,
      $meta = $('meta.foundation-mq'),
      $noJS = $('.no-js');

  if(!$meta.length){
    $('<meta class="foundation-mq">').appendTo(document.head);
  }
  if($noJS.length){
    $noJS.removeClass('no-js');
  }

  if(type === 'undefined'){//needs to initialize the Foundation object, or an individual plugin.
    Foundation.MediaQuery._init();
    Foundation.reflow(this);
  }else if(type === 'string'){//an individual method to invoke on a plugin or group of plugins
    var args = Array.prototype.slice.call(arguments, 1);//collect all the arguments, if necessary
    var plugClass = this.data('zfPlugin');//determine the class of plugin

    if(plugClass !== undefined && plugClass[method] !== undefined){//make sure both the class and method exist
      if(this.length === 1){//if there's only one, call it directly.
          plugClass[method].apply(plugClass, args);
      }else{
        this.each(function(i, el){//otherwise loop through the jQuery collection and invoke the method on each
          plugClass[method].apply($(el).data('zfPlugin'), args);
        });
      }
    }else{//error for no class or no method
      throw new ReferenceError("We're sorry, '" + method + "' is not an available method for " + (plugClass ? functionName(plugClass) : 'this element') + '.');
    }
  }else{//error for invalid argument type
    throw new TypeError("We're sorry, '" + type + "' is not a valid parameter. You must use a string representing the method you wish to invoke.");
  }
  return this;
};

window.Foundation = Foundation;
$.fn.foundation = foundation;

// Polyfill for requestAnimationFrame
(function() {
  if (!Date.now || !window.Date.now)
    window.Date.now = Date.now = function() { return new Date().getTime(); };

  var vendors = ['webkit', 'moz'];
  for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
      var vp = vendors[i];
      window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
      window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame']
                                 || window[vp+'CancelRequestAnimationFrame']);
  }
  if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent)
    || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
    var lastTime = 0;
    window.requestAnimationFrame = function(callback) {
        var now = Date.now();
        var nextTime = Math.max(lastTime + 16, now);
        return setTimeout(function() { callback(lastTime = nextTime); },
                          nextTime - now);
    };
    window.cancelAnimationFrame = clearTimeout;
  }
  /**
   * Polyfill for performance.now, required by rAF
   */
  if(!window.performance || !window.performance.now){
    window.performance = {
      start: Date.now(),
      now: function(){ return Date.now() - this.start; }
    };
  }
})();
if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          return fToBind.apply(this instanceof fNOP
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    if (this.prototype) {
      // native functions don't have a prototype
      fNOP.prototype = this.prototype;
    }
    fBound.prototype = new fNOP();

    return fBound;
  };
}
// Polyfill to get the name of a function in IE9
function functionName(fn) {
  if (Function.prototype.name === undefined) {
    var funcNameRegex = /function\s([^(]{1,})\(/;
    var results = (funcNameRegex).exec((fn).toString());
    return (results && results.length > 1) ? results[1].trim() : "";
  }
  else if (fn.prototype === undefined) {
    return fn.constructor.name;
  }
  else {
    return fn.prototype.constructor.name;
  }
}
function parseValue(str){
  if(/true/.test(str)) return true;
  else if(/false/.test(str)) return false;
  else if(!isNaN(str * 1)) return parseFloat(str);
  return str;
}
// Convert PascalCase to kebab-case
// Thank you: http://stackoverflow.com/a/8955580
function hyphenate(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

}(jQuery);

!function(Foundation, window){
  /**
   * Compares the dimensions of an element to a container and determines collision events with container.
   * @function
   * @param {jQuery} element - jQuery object to test for collisions.
   * @param {jQuery} parent - jQuery object to use as bounding container.
   * @param {Boolean} lrOnly - set to true to check left and right values only.
   * @param {Boolean} tbOnly - set to true to check top and bottom values only.
   * @default if no parent object passed, detects collisions with `window`.
   * @returns {Boolean} - true if collision free, false if a collision in any direction.
   */
  var ImNotTouchingYou = function(element, parent, lrOnly, tbOnly){
    var eleDims = GetDimensions(element),
        top, bottom, left, right;

    if(parent){
      var parDims = GetDimensions(parent);

      bottom = (eleDims.offset.top + eleDims.height <= parDims.height + parDims.offset.top);
      top    = (eleDims.offset.top >= parDims.offset.top);
      left   = (eleDims.offset.left >= parDims.offset.left);
      right  = (eleDims.offset.left + eleDims.width <= parDims.width);
    }else{
      bottom = (eleDims.offset.top + eleDims.height <= eleDims.windowDims.height + eleDims.windowDims.offset.top);
      top    = (eleDims.offset.top >= eleDims.windowDims.offset.top);
      left   = (eleDims.offset.left >= eleDims.windowDims.offset.left);
      right  = (eleDims.offset.left + eleDims.width <= eleDims.windowDims.width);
    }
    var allDirs = [bottom, top, left, right];

    if(lrOnly){ return left === right === true; }
    if(tbOnly){ return top === bottom === true; }

    return allDirs.indexOf(false) === -1;
  };

  /**
   * Uses native methods to return an object of dimension values.
   * @function
   * @param {jQuery || HTML} element - jQuery object or DOM element for which to get the dimensions. Can be any element other that document or window.
   * @returns {Object} - nested object of integer pixel values
   * TODO - if element is window, return only those values.
   */
  var GetDimensions = function(elem, test){
    elem = elem.length ? elem[0] : elem;

    if(elem === window || elem === document){ throw new Error("I'm sorry, Dave. I'm afraid I can't do that."); }

    var rect = elem.getBoundingClientRect(),
        parRect = elem.parentNode.getBoundingClientRect(),
        winRect = document.body.getBoundingClientRect(),
        winY = window.pageYOffset,
        winX = window.pageXOffset;

    return {
      width: rect.width,
      height: rect.height,
      offset: {
        top: rect.top + winY,
        left: rect.left + winX
      },
      parentDims: {
        width: parRect.width,
        height: parRect.height,
        offset: {
          top: parRect.top + winY,
          left: parRect.left + winX
        }
      },
      windowDims: {
        width: winRect.width,
        height: winRect.height,
        offset: {
          top: winY,
          left: winX
        }
      }
    };
  };
  /**
   * Returns an object of top and left integer pixel values for dynamically rendered elements,
   * such as: Tooltip, Reveal, and Dropdown
   * @function
   * @param {jQuery} element - jQuery object for the element being positioned.
   * @param {jQuery} anchor - jQuery object for the element's anchor point.
   * @param {String} position - a string relating to the desired position of the element, relative to it's anchor
   * @param {Number} vOffset - integer pixel value of desired vertical separation between anchor and element.
   * @param {Number} hOffset - integer pixel value of desired horizontal separation between anchor and element.
   * @param {Boolean} isOverflow - if a collision event is detected, sets to true to default the element to full width - any desired offset.
   * TODO alter/rewrite to work with `em` values as well/instead of pixels
   */
  var GetOffsets = function(element, anchor, position, vOffset, hOffset, isOverflow){
    var $eleDims = GetDimensions(element),
    // var $eleDims = GetDimensions(element),
        $anchorDims = anchor ? GetDimensions(anchor) : null;
        // $anchorDims = anchor ? GetDimensions(anchor) : null;
    switch(position){
      case 'top':
        return {
          left: $anchorDims.offset.left,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset)
        };
        break;
      case 'left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top
        };
        break;
      case 'right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset,
          top: $anchorDims.offset.top
        };
        break;
      case 'center top':
        return {
          left: ($anchorDims.offset.left + ($anchorDims.width / 2)) - ($eleDims.width / 2),
          top: $anchorDims.offset.top - ($eleDims.height + vOffset)
        };
        break;
      case 'center bottom':
        return {
          left: isOverflow ? hOffset : (($anchorDims.offset.left + ($anchorDims.width / 2)) - ($eleDims.width / 2)),
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      case 'center left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: ($anchorDims.offset.top + ($anchorDims.height / 2)) - ($eleDims.height / 2)
        };
        break;
      case 'center right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset + 1,
          top: ($anchorDims.offset.top + ($anchorDims.height / 2)) - ($eleDims.height / 2)
        };
        break;
      case 'center':
        return {
          left: ($eleDims.windowDims.offset.left + ($eleDims.windowDims.width / 2)) - ($eleDims.width / 2),
          top: ($eleDims.windowDims.offset.top + ($eleDims.windowDims.height / 2)) - ($eleDims.height / 2)
        };
        break;
      case 'reveal':
        return {
          left: ($eleDims.windowDims.width - $eleDims.width) / 2,
          top: $eleDims.windowDims.offset.top + vOffset
        };
      case 'reveal full':
        return {
          left: $eleDims.windowDims.offset.left,
          top: $eleDims.windowDims.offset.top
        };
        break;
      default:
        return {
          left: $anchorDims.offset.left,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
    }
  };
  Foundation.Box = {
    ImNotTouchingYou: ImNotTouchingYou,
    GetDimensions: GetDimensions,
    GetOffsets: GetOffsets
  };
}(window.Foundation, window);

/*******************************************
 *                                         *
 * This util was created by Marius Olbertz *
 * Please thank Marius on GitHub /owlbertz *
 * or the web http://www.mariusolbertz.de/ *
 *                                         *
 ******************************************/
!function($, Foundation){
  'use strict';
  Foundation.Keyboard = {};

  var keyCodes = {
    9: 'TAB',
    13: 'ENTER',
    27: 'ESCAPE',
    32: 'SPACE',
    37: 'ARROW_LEFT',
    38: 'ARROW_UP',
    39: 'ARROW_RIGHT',
    40: 'ARROW_DOWN'
  };

  /*
   * Constants for easier comparing.
   * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
   */
  var keys = (function(kcs) {
    var k = {};
    for (var kc in kcs) k[kcs[kc]] = kcs[kc];
    return k;
  })(keyCodes);

  Foundation.Keyboard.keys = keys;

  /**
   * Parses the (keyboard) event and returns a String that represents its key
   * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
   * @param {Event} event - the event generated by the event handler
   * @return String key - String that represents the key pressed
   */
  var parseKey = function(event) {
    var key = keyCodes[event.which || event.keyCode] || String.fromCharCode(event.which).toUpperCase();
    if (event.shiftKey) key = 'SHIFT_' + key;
    if (event.ctrlKey) key = 'CTRL_' + key;
    if (event.altKey) key = 'ALT_' + key;
    return key;
  };
  Foundation.Keyboard.parseKey = parseKey;


  // plain commands per component go here, ltr and rtl are merged based on orientation
  var commands = {};

  /**
   * Handles the given (keyboard) event
   * @param {Event} event - the event generated by the event handler
   * @param {String} component - Foundation component's name, e.g. Slider or Reveal
   * @param {Objects} functions - collection of functions that are to be executed
   */
  var handleKey = function(event, component, functions) {
    var commandList = commands[component],
      keyCode = parseKey(event),
      cmds,
      command,
      fn;
    if (!commandList) return console.warn('Component not defined!');

    if (typeof commandList.ltr === 'undefined') { // this component does not differentiate between ltr and rtl
        cmds = commandList; // use plain list
    } else { // merge ltr and rtl: if document is rtl, rtl overwrites ltr and vice versa
        if (Foundation.rtl()) cmds = $.extend({}, commandList.ltr, commandList.rtl);

        else cmds = $.extend({}, commandList.rtl, commandList.ltr);
    }
    command = cmds[keyCode];


    fn = functions[command];
    if (fn && typeof fn === 'function') { // execute function  if exists
        fn.apply();
        if (functions.handled || typeof functions.handled === 'function') { // execute function when event was handled
            functions.handled.apply();
        }
    } else {
        if (functions.unhandled || typeof functions.unhandled === 'function') { // execute function when event was not handled
            functions.unhandled.apply();
        }
    }
  };
  Foundation.Keyboard.handleKey = handleKey;

  /**
   * Finds all focusable elements within the given `$element`
   * @param {jQuery} $element - jQuery object to search within
   * @return {jQuery} $focusable - all focusable elements within `$element`
   */
  var findFocusable = function($element) {
    return $element.find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]').filter(function() {
      if (!$(this).is(':visible') || $(this).attr('tabindex') < 0) { return false; } //only have visible elements and those that have a tabindex greater or equal 0
      return true;
    });
  };
  Foundation.Keyboard.findFocusable = findFocusable;

  /**
   * Returns the component name name
   * @param {Object} component - Foundation component, e.g. Slider or Reveal
   * @return String componentName
   */

  var register = function(componentName, cmds) {
    commands[componentName] = cmds;
  };
  Foundation.Keyboard.register = register;
}(jQuery, window.Foundation);

!function($, Foundation) {

// Default set of media queries
var defaultQueries = {
  'default' : 'only screen',
  landscape : 'only screen and (orientation: landscape)',
  portrait : 'only screen and (orientation: portrait)',
  retina : 'only screen and (-webkit-min-device-pixel-ratio: 2),' +
    'only screen and (min--moz-device-pixel-ratio: 2),' +
    'only screen and (-o-min-device-pixel-ratio: 2/1),' +
    'only screen and (min-device-pixel-ratio: 2),' +
    'only screen and (min-resolution: 192dpi),' +
    'only screen and (min-resolution: 2dppx)'
};

var MediaQuery = {
  queries: [],
  current: '',

  /**
   * Checks if the screen is at least as wide as a breakpoint.
   * @function
   * @param {String} size - Name of the breakpoint to check.
   * @returns {Boolean} `true` if the breakpoint matches, `false` if it's smaller.
   */
  atLeast: function(size) {
    var query = this.get(size);

    if (query) {
      return window.matchMedia(query).matches;
    }

    return false;
  },

  /**
   * Gets the media query of a breakpoint.
   * @function
   * @param {String} size - Name of the breakpoint to get.
   * @returns {String|null} - The media query of the breakpoint, or `null` if the breakpoint doesn't exist.
   */
  get: function(size) {
    for (var i in this.queries) {
      var query = this.queries[i];
      if (size === query.name) return query.value;
    }

    return null;
  },

  /**
   * Initializes the media query helper, by extracting the breakpoint list from the CSS and activating the breakpoint watcher.
   * @function
   * @private
   */
  _init: function() {
    var self = this;
    var extractedStyles = $('.foundation-mq').css('font-family');
    var namedQueries;

    namedQueries = parseStyleToObject(extractedStyles);

    for (var key in namedQueries) {
      self.queries.push({
        name: key,
        value: 'only screen and (min-width: ' + namedQueries[key] + ')'
      });
    }

    this.current = this._getCurrentSize();

    this._watcher();

    // Extend default queries
    // namedQueries = $.extend(defaultQueries, namedQueries);
  },

  /**
   * Gets the current breakpoint name by testing every breakpoint and returning the last one to match (the biggest one).
   * @function
   * @private
   * @returns {String} Name of the current breakpoint.
   */
  _getCurrentSize: function() {
    var matched;

    for (var i in this.queries) {
      var query = this.queries[i];

      if (window.matchMedia(query.value).matches) {
        matched = query;
      }
    }

    if(typeof matched === 'object') {
      return matched.name;
    } else {
      return matched;
    }
  },

  /**
   * Activates the breakpoint watcher, which fires an event on the window whenever the breakpoint changes.
   * @function
   * @private
   */
  _watcher: function() {
    var _this = this;

    $(window).on('resize.zf.mediaquery', function() {
      var newSize = _this._getCurrentSize();

      if (newSize !== _this.current) {
        // Broadcast the media query change on the window
        $(window).trigger('changed.zf.mediaquery', [newSize, _this.current]);

        // Change the current media query
        _this.current = newSize;
      }
    });
  }
};

Foundation.MediaQuery = MediaQuery;

// matchMedia() polyfill - Test a CSS media type/query in JS.
// Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license
window.matchMedia || (window.matchMedia = function() {
  'use strict';

  // For browsers that support matchMedium api such as IE 9 and webkit
  var styleMedia = (window.styleMedia || window.media);

  // For those that don't support matchMedium
  if (!styleMedia) {
    var style   = document.createElement('style'),
    script      = document.getElementsByTagName('script')[0],
    info        = null;

    style.type  = 'text/css';
    style.id    = 'matchmediajs-test';

    script.parentNode.insertBefore(style, script);

    // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
    info = ('getComputedStyle' in window) && window.getComputedStyle(style, null) || style.currentStyle;

    styleMedia = {
      matchMedium: function(media) {
        var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

        // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
        if (style.styleSheet) {
          style.styleSheet.cssText = text;
        } else {
          style.textContent = text;
        }

        // Test if media query is true or false
        return info.width === '1px';
      }
    };
  }

  return function(media) {
    return {
      matches: styleMedia.matchMedium(media || 'all'),
      media: media || 'all'
    };
  };
}());

// Thank you: https://github.com/sindresorhus/query-string
function parseStyleToObject(str) {
  var styleObject = {};

  if (typeof str !== 'string') {
    return styleObject;
  }

  str = str.trim().slice(1, -1); // browsers re-quote string style values

  if (!str) {
    return styleObject;
  }

  styleObject = str.split('&').reduce(function(ret, param) {
    var parts = param.replace(/\+/g, ' ').split('=');
    var key = parts[0];
    var val = parts[1];
    key = decodeURIComponent(key);

    // missing `=` should be `null`:
    // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
    val = val === undefined ? null : decodeURIComponent(val);

    if (!ret.hasOwnProperty(key)) {
      ret[key] = val;
    } else if (Array.isArray(ret[key])) {
      ret[key].push(val);
    } else {
      ret[key] = [ret[key], val];
    }
    return ret;
  }, {});

  return styleObject;
}

}(jQuery, Foundation);

/**
 * Motion module.
 * @module foundation.motion
 */
!function($, Foundation) {

var initClasses   = ['mui-enter', 'mui-leave'];
var activeClasses = ['mui-enter-active', 'mui-leave-active'];

function animate(isIn, element, animation, cb) {
  element = $(element).eq(0);

  if (!element.length) return;

  var initClass = isIn ? initClasses[0] : initClasses[1];
  var activeClass = isIn ? activeClasses[0] : activeClasses[1];

  // Set up the animation
  reset();
  element.addClass(animation)
         .css('transition', 'none');
        //  .addClass(initClass);
  // if(isIn) element.show();
  requestAnimationFrame(function() {
    element.addClass(initClass);
    if (isIn) element.show();
  });
  // Start the animation
  requestAnimationFrame(function() {
    element[0].offsetWidth;
    element.css('transition', '');
    element.addClass(activeClass);
  });
  // Move(500, element, function(){
  //   // element[0].offsetWidth;
  //   element.css('transition', '');
  //   element.addClass(activeClass);
  // });

  // Clean up the animation when it finishes
  element.one(Foundation.transitionend(element), finish);//.one('finished.zf.animate', finish);

  // Hides the element (for out animations), resets the element, and runs a callback
  function finish() {
    if (!isIn) element.hide();
    reset();
    if (cb) cb.apply(element);
  }

  // Resets transitions and removes motion-specific classes
  function reset() {
    element[0].style.transitionDuration = 0;
    element.removeClass(initClass + ' ' + activeClass + ' ' + animation);
  }
}

var Motion = {
  animateIn: function(element, animation, /*duration,*/ cb) {
    animate(true, element, animation, cb);
  },

  animateOut: function(element, animation, /*duration,*/ cb) {
    animate(false, element, animation, cb);
  }
};

var Move = function(duration, elem, fn){
  var anim, prog, start = null;
  // console.log('called');

  function move(ts){
    if(!start) start = window.performance.now();
    // console.log(start, ts);
    prog = ts - start;
    fn.apply(elem);

    if(prog < duration){ anim = window.requestAnimationFrame(move, elem); }
    else{
      window.cancelAnimationFrame(anim);
      elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
    }
  }
  anim = window.requestAnimationFrame(move);
};

Foundation.Move = Move;
Foundation.Motion = Motion;

}(jQuery, Foundation);

!function($, Foundation){
  'use strict';
  Foundation.Nest = {
    Feather: function(menu, type){
      menu.attr('role', 'menubar');
      type = type || 'zf';
      var items = menu.find('li').attr({'role': 'menuitem'}),
          subMenuClass = 'is-' + type + '-submenu',
          subItemClass = subMenuClass + '-item',
          hasSubClass = 'is-' + type + '-submenu-parent';
      menu.find('a:first').attr('tabindex', 0);
      items.each(function(){
        var $item = $(this),
            $sub = $item.children('ul');
        if($sub.length){
          $item.addClass(hasSubClass)
               .attr({
                 'aria-haspopup': true,
                 'aria-expanded': false,
                 'aria-label': $item.children('a:first').text()
               });
          $sub.addClass('submenu ' + subMenuClass)
              .attr({
                'data-submenu': '',
                'aria-hidden': true,
                'role': 'menu'
              });
        }
        if($item.parent('[data-submenu]').length){
          $item.addClass('is-submenu-item ' + subItemClass);
        }
      });
      return;
    },
    Burn: function(menu, type){
      var items = menu.find('li').removeAttr('tabindex'),
          subMenuClass = 'is-' + type + '-submenu',
          subItemClass = subMenuClass + '-item',
          hasSubClass = 'is-' + type + '-submenu-parent';

      // menu.find('.is-active').removeClass('is-active');
      menu.find('*')
      // menu.find('.' + subMenuClass + ', .' + subItemClass + ', .is-active, .has-submenu, .is-submenu-item, .submenu, [data-submenu]')
          .removeClass(subMenuClass + ' ' + subItemClass + ' ' + hasSubClass + ' is-submenu-item submenu is-active')
          .removeAttr('data-submenu').css('display', '');

      // console.log(      menu.find('.' + subMenuClass + ', .' + subItemClass + ', .has-submenu, .is-submenu-item, .submenu, [data-submenu]')
      //           .removeClass(subMenuClass + ' ' + subItemClass + ' has-submenu is-submenu-item submenu')
      //           .removeAttr('data-submenu'));
      // items.each(function(){
      //   var $item = $(this),
      //       $sub = $item.children('ul');
      //   if($item.parent('[data-submenu]').length){
      //     $item.removeClass('is-submenu-item ' + subItemClass);
      //   }
      //   if($sub.length){
      //     $item.removeClass('has-submenu');
      //     $sub.removeClass('submenu ' + subMenuClass).removeAttr('data-submenu');
      //   }
      // });
    }
  };
}(jQuery, window.Foundation);

!function($, Foundation){
  'use strict';
  var Timer = function(elem, options, cb){
    var _this = this,
        duration = options.duration,//options is an object for easily adding features later.
        nameSpace = Object.keys(elem.data())[0] || 'timer',
        remain = -1,
        start,
        timer;

    this.isPaused = false;
    
    this.restart = function(){
      remain = -1;
      clearTimeout(timer);
      this.start();
    };

    this.start = function(){
      this.isPaused = false
      // if(!elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      remain = remain <= 0 ? duration : remain;
      elem.data('paused', false);
      start = Date.now();
      timer = setTimeout(function(){
        if(options.infinite){
          _this.restart();//rerun the timer.
        }
        cb();
      }, remain);
      elem.trigger('timerstart.zf.' + nameSpace);
    };

    this.pause = function(){
      this.isPaused = true;
      //if(elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      elem.data('paused', true);
      var end = Date.now();
      remain = remain - (end - start);
      elem.trigger('timerpaused.zf.' + nameSpace);
    };
  };
  /**
   * Runs a callback function when images are fully loaded.
   * @param {Object} images - Image(s) to check if loaded.
   * @param {Func} callback - Function to execute when image is fully loaded.
   */
  var onImagesLoaded = function(images, callback){
    var self = this,
        unloaded = images.length;

    if (unloaded === 0) {
      callback();
    }

    var singleImageLoaded = function() {
      unloaded--;
      if (unloaded === 0) {
        callback();
      }
    };

    images.each(function() {
      if (this.complete) {
        singleImageLoaded();
      }
      else if (typeof this.naturalWidth !== 'undefined' && this.naturalWidth > 0) {
        singleImageLoaded();
      }
      else {
        $(this).one('load', function() {
          singleImageLoaded();
        });
      }
    });
  };

  Foundation.Timer = Timer;
  Foundation.onImagesLoaded = onImagesLoaded;
}(jQuery, window.Foundation);

//**************************************************
//**Work inspired by multiple jquery swipe plugins**
//**Done by Yohai Ararat ***************************
//**************************************************
(function($) {

  $.spotSwipe = {
    version: '1.0.0',
    enabled: 'ontouchstart' in document.documentElement,
    preventDefault: false,
    moveThreshold: 75,
    timeThreshold: 200
  };

  var   startPosX,
        startPosY,
        startTime,
        elapsedTime,
        isMoving = false;

  function onTouchEnd() {
    //  alert(this);
    this.removeEventListener('touchmove', onTouchMove);
    this.removeEventListener('touchend', onTouchEnd);
    isMoving = false;
  }

  function onTouchMove(e) {
    if ($.spotSwipe.preventDefault) { e.preventDefault(); }
    if(isMoving) {
      var x = e.touches[0].pageX;
      var y = e.touches[0].pageY;
      var dx = startPosX - x;
      var dy = startPosY - y;
      var dir;
      elapsedTime = new Date().getTime() - startTime;
      if(Math.abs(dx) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
        dir = dx > 0 ? 'left' : 'right';
      }
      // else if(Math.abs(dy) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
      //   dir = dy > 0 ? 'down' : 'up';
      // }
      if(dir) {
        e.preventDefault();
        onTouchEnd.call(this);
        $(this).trigger('swipe', dir).trigger('swipe' + dir);
      }
    }
  }

  function onTouchStart(e) {
    if (e.touches.length == 1) {
      startPosX = e.touches[0].pageX;
      startPosY = e.touches[0].pageY;
      isMoving = true;
      startTime = new Date().getTime();
      this.addEventListener('touchmove', onTouchMove, false);
      this.addEventListener('touchend', onTouchEnd, false);
    }
  }

  function init() {
    this.addEventListener && this.addEventListener('touchstart', onTouchStart, false);
  }

  function teardown() {
    this.removeEventListener('touchstart', onTouchStart);
  }

  $.event.special.swipe = { setup: init };

  $.each(['left', 'up', 'down', 'right'], function () {
    $.event.special['swipe' + this] = { setup: function(){
      $(this).on('swipe', $.noop);
    } };
  });
})(jQuery);
/****************************************************
 * Method for adding psuedo drag events to elements *
 ***************************************************/
!function($){
  $.fn.addTouch = function(){
    this.each(function(i,el){
      $(el).bind('touchstart touchmove touchend touchcancel',function(){
        //we pass the original event object because the jQuery event
        //object is normalized to w3c specs and does not provide the TouchList
        handleTouch(event);
      });
    });

    var handleTouch = function(event){
      var touches = event.changedTouches,
          first = touches[0],
          eventTypes = {
            touchstart: 'mousedown',
            touchmove: 'mousemove',
            touchend: 'mouseup'
          },
          type = eventTypes[event.type],
          simulatedEvent
        ;

      if('MouseEvent' in window && typeof window.MouseEvent === 'function') {
        simulatedEvent = window.MouseEvent(type, {
          'bubbles': true,
          'cancelable': true,
          'screenX': first.screenX,
          'screenY': first.screenY,
          'clientX': first.clientX,
          'clientY': first.clientY
        });
      } else {
        simulatedEvent = document.createEvent('MouseEvent');
        simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0/*left*/, null);
      }
      first.target.dispatchEvent(simulatedEvent);
    };
  };
}(jQuery);


//**********************************
//**From the jQuery Mobile Library**
//**need to recreate functionality**
//**and try to improve if possible**
//**********************************

/* Removing the jQuery function ****
************************************

(function( $, window, undefined ) {

	var $document = $( document ),
		// supportTouch = $.mobile.support.touch,
		touchStartEvent = 'touchstart'//supportTouch ? "touchstart" : "mousedown",
		touchStopEvent = 'touchend'//supportTouch ? "touchend" : "mouseup",
		touchMoveEvent = 'touchmove'//supportTouch ? "touchmove" : "mousemove";

	// setup new event shortcuts
	$.each( ( "touchstart touchmove touchend " +
		"swipe swipeleft swiperight" ).split( " " ), function( i, name ) {

		$.fn[ name ] = function( fn ) {
			return fn ? this.bind( name, fn ) : this.trigger( name );
		};

		// jQuery < 1.8
		if ( $.attrFn ) {
			$.attrFn[ name ] = true;
		}
	});

	function triggerCustomEvent( obj, eventType, event, bubble ) {
		var originalType = event.type;
		event.type = eventType;
		if ( bubble ) {
			$.event.trigger( event, undefined, obj );
		} else {
			$.event.dispatch.call( obj, event );
		}
		event.type = originalType;
	}

	// also handles taphold

	// Also handles swipeleft, swiperight
	$.event.special.swipe = {

		// More than this horizontal displacement, and we will suppress scrolling.
		scrollSupressionThreshold: 30,

		// More time than this, and it isn't a swipe.
		durationThreshold: 1000,

		// Swipe horizontal displacement must be more than this.
		horizontalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		// Swipe vertical displacement must be less than this.
		verticalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		getLocation: function ( event ) {
			var winPageX = window.pageXOffset,
				winPageY = window.pageYOffset,
				x = event.clientX,
				y = event.clientY;

			if ( event.pageY === 0 && Math.floor( y ) > Math.floor( event.pageY ) ||
				event.pageX === 0 && Math.floor( x ) > Math.floor( event.pageX ) ) {

				// iOS4 clientX/clientY have the value that should have been
				// in pageX/pageY. While pageX/page/ have the value 0
				x = x - winPageX;
				y = y - winPageY;
			} else if ( y < ( event.pageY - winPageY) || x < ( event.pageX - winPageX ) ) {

				// Some Android browsers have totally bogus values for clientX/Y
				// when scrolling/zooming a page. Detectable since clientX/clientY
				// should never be smaller than pageX/pageY minus page scroll
				x = event.pageX - winPageX;
				y = event.pageY - winPageY;
			}

			return {
				x: x,
				y: y
			};
		},

		start: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ],
						origin: $( event.target )
					};
		},

		stop: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ]
					};
		},

		handleSwipe: function( start, stop, thisObject, origTarget ) {
			if ( stop.time - start.time < $.event.special.swipe.durationThreshold &&
				Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.horizontalDistanceThreshold &&
				Math.abs( start.coords[ 1 ] - stop.coords[ 1 ] ) < $.event.special.swipe.verticalDistanceThreshold ) {
				var direction = start.coords[0] > stop.coords[ 0 ] ? "swipeleft" : "swiperight";

				triggerCustomEvent( thisObject, "swipe", $.Event( "swipe", { target: origTarget, swipestart: start, swipestop: stop }), true );
				triggerCustomEvent( thisObject, direction,$.Event( direction, { target: origTarget, swipestart: start, swipestop: stop } ), true );
				return true;
			}
			return false;

		},

		// This serves as a flag to ensure that at most one swipe event event is
		// in work at any given time
		eventInProgress: false,

		setup: function() {
			var events,
				thisObject = this,
				$this = $( thisObject ),
				context = {};

			// Retrieve the events data for this element and add the swipe context
			events = $.data( this, "mobile-events" );
			if ( !events ) {
				events = { length: 0 };
				$.data( this, "mobile-events", events );
			}
			events.length++;
			events.swipe = context;

			context.start = function( event ) {

				// Bail if we're already working on a swipe event
				if ( $.event.special.swipe.eventInProgress ) {
					return;
				}
				$.event.special.swipe.eventInProgress = true;

				var stop,
					start = $.event.special.swipe.start( event ),
					origTarget = event.target,
					emitted = false;

				context.move = function( event ) {
					if ( !start || event.isDefaultPrevented() ) {
						return;
					}

					stop = $.event.special.swipe.stop( event );
					if ( !emitted ) {
						emitted = $.event.special.swipe.handleSwipe( start, stop, thisObject, origTarget );
						if ( emitted ) {

							// Reset the context to make way for the next swipe event
							$.event.special.swipe.eventInProgress = false;
						}
					}
					// prevent scrolling
					if ( Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.scrollSupressionThreshold ) {
						event.preventDefault();
					}
				};

				context.stop = function() {
						emitted = true;

						// Reset the context to make way for the next swipe event
						$.event.special.swipe.eventInProgress = false;
						$document.off( touchMoveEvent, context.move );
						context.move = null;
				};

				$document.on( touchMoveEvent, context.move )
					.one( touchStopEvent, context.stop );
			};
			$this.on( touchStartEvent, context.start );
		},

		teardown: function() {
			var events, context;

			events = $.data( this, "mobile-events" );
			if ( events ) {
				context = events.swipe;
				delete events.swipe;
				events.length--;
				if ( events.length === 0 ) {
					$.removeData( this, "mobile-events" );
				}
			}

			if ( context ) {
				if ( context.start ) {
					$( this ).off( touchStartEvent, context.start );
				}
				if ( context.move ) {
					$document.off( touchMoveEvent, context.move );
				}
				if ( context.stop ) {
					$document.off( touchStopEvent, context.stop );
				}
			}
		}
	};
	$.each({
		swipeleft: "swipe.left",
		swiperight: "swipe.right"
	}, function( event, sourceEvent ) {

		$.event.special[ event ] = {
			setup: function() {
				$( this ).bind( sourceEvent, $.noop );
			},
			teardown: function() {
				$( this ).unbind( sourceEvent );
			}
		};
	});
})( jQuery, this );
*/

!function(Foundation, $) {
  'use strict';
  // Elements with [data-open] will reveal a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-open]', function() {
    var id = $(this).data('open');
    $('#' + id).triggerHandler('open.zf.trigger', [$(this)]);
  });

  // Elements with [data-close] will close a plugin that supports it when clicked.
  // If used without a value on [data-close], the event will bubble, allowing it to close a parent component.
  $(document).on('click.zf.trigger', '[data-close]', function() {
    var id = $(this).data('close');
    if (id) {
      $('#' + id).triggerHandler('close.zf.trigger', [$(this)]);
    }
    else {
      $(this).trigger('close.zf.trigger');
    }
  });

  // Elements with [data-toggle] will toggle a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-toggle]', function() {
    var id = $(this).data('toggle');
    $('#' + id).triggerHandler('toggle.zf.trigger', [$(this)]);
  });

  // Elements with [data-closable] will respond to close.zf.trigger events.
  $(document).on('close.zf.trigger', '[data-closable]', function(e){
    e.stopPropagation();
    var animation = $(this).data('closable');

    if(animation !== ''){
      Foundation.Motion.animateOut($(this), animation, function() {
        $(this).trigger('closed.zf');
      });
    }else{
      $(this).fadeOut().trigger('closed.zf');
    }
  });

  var MutationObserver = (function () {
    var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
    for (var i=0; i < prefixes.length; i++) {
      if (prefixes[i] + 'MutationObserver' in window) {
        return window[prefixes[i] + 'MutationObserver'];
      }
    }
    return false;
  }());


  var checkListeners = function(){
    eventsListener();
    resizeListener();
    scrollListener();
    closemeListener();
  };
  /**
  * Fires once after all other scripts have loaded
  * @function
  * @private
  */
  $(window).load(function(){
    checkListeners();
  });

  //******** only fires this function once on load, if there's something to watch ********
  var closemeListener = function(pluginName){
    var yetiBoxes = $('[data-yeti-box]'),
        plugNames = ['dropdown', 'tooltip', 'reveal'];

    if(pluginName){
      if(typeof pluginName === 'string'){
        plugNames.push(pluginName);
      }else if(typeof pluginName === 'object' && typeof pluginName[0] === 'string'){
        plugNames.concat(pluginName);
      }else{
        console.error('Plugin names must be strings');
      }
    }
    if(yetiBoxes.length){
      var listeners = plugNames.map(function(name){
        return 'closeme.zf.' + name;
      }).join(' ');

      $(window).off(listeners).on(listeners, function(e, pluginId){
        var plugin = e.namespace.split('.')[0];
        var plugins = $('[data-' + plugin + ']').not('[data-yeti-box="' + pluginId + '"]');

        plugins.each(function(){
          var _this = $(this);

          _this.triggerHandler('close.zf.trigger', [_this]);
        });
      });
    }
  };
  var resizeListener = function(debounce){
    var timer,
        $nodes = $('[data-resize]');
    if($nodes.length){
      $(window).off('resize.zf.trigger')
      .on('resize.zf.trigger', function(e) {
        if (timer) { clearTimeout(timer); }

        timer = setTimeout(function(){

          if(!MutationObserver){//fallback for IE 9
            $nodes.each(function(){
              $(this).triggerHandler('resizeme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a resize event
          $nodes.attr('data-events', "resize");
        }, debounce || 10);//default time to emit resize event
      });
    }
  };
  var scrollListener = function(debounce){
    var timer,
        $nodes = $('[data-scroll]');
    if($nodes.length){
      $(window).off('scroll.zf.trigger')
      .on('scroll.zf.trigger', function(e){
        if(timer){ clearTimeout(timer); }

        timer = setTimeout(function(){

          if(!MutationObserver){//fallback for IE 9
            $nodes.each(function(){
              $(this).triggerHandler('scrollme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a scroll event
          $nodes.attr('data-events', "scroll");
        }, debounce || 10);//default time to emit scroll event
      });
    }
  };
  // function domMutationObserver(debounce) {
  //   // !!! This is coming soon and needs more work; not active  !!! //
  //   var timer,
  //   nodes = document.querySelectorAll('[data-mutate]');
  //   //
  //   if (nodes.length) {
  //     // var MutationObserver = (function () {
  //     //   var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
  //     //   for (var i=0; i < prefixes.length; i++) {
  //     //     if (prefixes[i] + 'MutationObserver' in window) {
  //     //       return window[prefixes[i] + 'MutationObserver'];
  //     //     }
  //     //   }
  //     //   return false;
  //     // }());
  //
  //
  //     //for the body, we need to listen for all changes effecting the style and class attributes
  //     var bodyObserver = new MutationObserver(bodyMutation);
  //     bodyObserver.observe(document.body, { attributes: true, childList: true, characterData: false, subtree:true, attributeFilter:["style", "class"]});
  //
  //
  //     //body callback
  //     function bodyMutation(mutate) {
  //       //trigger all listening elements and signal a mutation event
  //       if (timer) { clearTimeout(timer); }
  //
  //       timer = setTimeout(function() {
  //         bodyObserver.disconnect();
  //         $('[data-mutate]').attr('data-events',"mutate");
  //       }, debounce || 150);
  //     }
  //   }
  // }
  var eventsListener = function() {
    if(!MutationObserver){ return false; }
    var nodes = document.querySelectorAll('[data-resize], [data-scroll], [data-mutate]');

    //element callback
    var listeningElementsMutation = function(mutationRecordsList) {
      var $target = $(mutationRecordsList[0].target);
      //trigger the event handler for the element depending on type
      switch ($target.attr("data-events")) {

        case "resize" :
        $target.triggerHandler('resizeme.zf.trigger', [$target]);
        break;

        case "scroll" :
        $target.triggerHandler('scrollme.zf.trigger', [$target, window.pageYOffset]);
        break;

        // case "mutate" :
        // console.log('mutate', $target);
        // $target.triggerHandler('mutate.zf.trigger');
        //
        // //make sure we don't get stuck in an infinite loop from sloppy codeing
        // if ($target.index('[data-mutate]') == $("[data-mutate]").length-1) {
        //   domMutationObserver();
        // }
        // break;

        default :
        return false;
        //nothing
      }
    }

    if(nodes.length){
      //for each element that needs to listen for resizing, scrolling, (or coming soon mutation) add a single observer
      for (var i = 0; i <= nodes.length-1; i++) {
        var elementObserver = new MutationObserver(listeningElementsMutation);
        elementObserver.observe(nodes[i], { attributes: true, childList: false, characterData: false, subtree:false, attributeFilter:["data-events"]});
      }
    }
  };
  // ------------------------------------

  // [PH]
  // Foundation.CheckWatchers = checkWatchers;
  Foundation.IHearYou = checkListeners;
  // Foundation.ISeeYou = scrollListener;
  // Foundation.IFeelYou = closemeListener;

}(window.Foundation, window.jQuery);

!function(Foundation, $) {
  'use strict';

  /**
   * Creates a new instance of Abide.
   * @class
   * @fires Abide#init
   * @param {Object} element - jQuery object to add the trigger to.
   * @param {Object} options - Overrides to the default plugin settings.
   */
  function Abide(element, options) {
    this.$element = element;
    this.options  = $.extend({}, Abide.defaults, this.$element.data(), options);

    this._init();

    Foundation.registerPlugin(this, 'Abide');
  }

  /**
   * Default settings for plugin
   */
  Abide.defaults = {
    /**
     * The default event to validate inputs. Checkboxes and radios validate immediately.
     * Remove or change this value for manual validation.
     * @option
     * @example 'fieldChange'
     */
    validateOn: 'fieldChange',
    /**
     * Class to be applied to input labels on failed validation.
     * @option
     * @example 'is-invalid-label'
     */
    labelErrorClass: 'is-invalid-label',
    /**
     * Class to be applied to inputs on failed validation.
     * @option
     * @example 'is-invalid-input'
     */
    inputErrorClass: 'is-invalid-input',
    /**
     * Class selector to use to target Form Errors for show/hide.
     * @option
     * @example '.form-error'
     */
    formErrorSelector: '.form-error',
    /**
     * Class added to Form Errors on failed validation.
     * @option
     * @example 'is-visible'
     */
    formErrorClass: 'is-visible',
    /**
     * Set to true to validate text inputs on any value change.
     * @option
     * @example false
     */
    liveValidate: false,

    patterns: {
      alpha : /^[a-zA-Z]+$/,
      alpha_numeric : /^[a-zA-Z0-9]+$/,
      integer : /^[-+]?\d+$/,
      number : /^[-+]?\d*(?:[\.\,]\d+)?$/,

      // amex, visa, diners
      card : /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/,
      cvv : /^([0-9]){3,4}$/,

      // http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#valid-e-mail-address
      email : /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,

      url : /^(https?|ftp|file|ssh):\/\/(((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/,
      // abc.de
      domain : /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,8}$/,

      datetime : /^([0-2][0-9]{3})\-([0-1][0-9])\-([0-3][0-9])T([0-5][0-9])\:([0-5][0-9])\:([0-5][0-9])(Z|([\-\+]([0-1][0-9])\:00))$/,
      // YYYY-MM-DD
      date : /(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))$/,
      // HH:MM:SS
      time : /^(0[0-9]|1[0-9]|2[0-3])(:[0-5][0-9]){2}$/,
      dateISO : /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/,
      // MM/DD/YYYY
      month_day_year : /^(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.]\d{4}$/,
      // DD/MM/YYYY
      day_month_year : /^(0[1-9]|[12][0-9]|3[01])[- \/.](0[1-9]|1[012])[- \/.]\d{4}$/,

      // #FFF or #FFFFFF
      color : /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/
    },
    /**
     * Optional validation functions to be used. `equalTo` being the only default included function.
     * Functions should return only a boolean if the input is valid or not. Functions are given the following arguments:
     * el : The jQuery element to validate.
     * required : Boolean value of the required attribute be present or not.
     * parent : The direct parent of the input.
     * @option
     */
    validators: {
      equalTo: function (el, required, parent) {
        return $('#' + el.attr('data-equalto')).val() === el.val();
      }
    }
  };


  /**
   * Initializes the Abide plugin and calls functions to get Abide functioning on load.
   * @private
   */
  Abide.prototype._init = function(){
    this.$inputs = this.$element.find('input, textarea, select').not('[data-abide-ignore]');

    this._events();
  };

  /**
   * Initializes events for Abide.
   * @private
   */
  Abide.prototype._events = function() {
    var _this = this;

    this.$element.off('.abide')
        .on('reset.zf.abide', function(e){
          _this.resetForm();
        })
        .on('submit.zf.abide', function(e){
          return _this.validateForm();
        });

    if(this.options.validateOn === 'fieldChange'){
        this.$inputs.off('change.zf.abide')
            .on('change.zf.abide', function(e){
              _this.validateInput($(this));
            });
    }

    if(this.options.liveValidate){
      this.$inputs.off('input.zf.abide')
          .on('input.zf.abide', function(e){
            _this.validateInput($(this));
          });
    }
  },
  /**
   * Calls necessary functions to update Abide upon DOM change
   * @private
   */
  Abide.prototype._reflow = function() {
    this._init();
  };
  /**
   * Checks whether or not a form element has the required attribute and if it's checked or not
   * @param {Object} element - jQuery object to check for required attribute
   * @returns {Boolean} Boolean value depends on whether or not attribute is checked or empty
   */
  Abide.prototype.requiredCheck = function($el) {
    if(!$el.attr('required')) return true;
    var isGood = true;
    switch ($el[0].type) {

      case 'checkbox':
      case 'radio':
        isGood = $el[0].checked;
        break;

      case 'select':
      case 'select-one':
      case 'select-multiple':
        var opt = $el.find('option:selected');
        if(!opt.length || !opt.val()) isGood = false;
        break;

      default:
        if(!$el.val() || !$el.val().length) isGood = false;
    }
    return isGood;
  };
  /**
   * Based on $el, get the first element with selector in this order:
   * 1. The element's direct sibling('s).
   * 3. The element's parent's children.
   *
   * This allows for multiple form errors per input, though if none are found, no form errors will be shown.
   *
   * @param {Object} $el - jQuery object to use as reference to find the form error selector.
   * @returns {Object} jQuery object with the selector.
   */
  Abide.prototype.findFormError = function($el){
    var $error = $el.siblings(this.options.formErrorSelector);
    if(!$error.length){
      $error = $el.parent().find(this.options.formErrorSelector);
    }
    return $error;
  };
  /**
   * Get the first element in this order:
   * 2. The <label> with the attribute `[for="someInputId"]`
   * 3. The `.closest()` <label>
   *
   * @param {Object} $el - jQuery object to check for required attribute
   * @returns {Boolean} Boolean value depends on whether or not attribute is checked or empty
   */
  Abide.prototype.findLabel = function($el) {
    var $label = this.$element.find('label[for="' + $el[0].id + '"]');
    if(!$label.length){
      return $el.closest('label');
    }
    return $label;
  };
  /**
   * Adds the CSS error class as specified by the Abide settings to the label, input, and the form
   * @param {Object} $el - jQuery object to add the class to
   */
  Abide.prototype.addErrorClasses = function($el){
    var $label = this.findLabel($el),
        $formError = this.findFormError($el);

    if($label.length){
      $label.addClass(this.options.labelErrorClass);
    }
    if($formError.length){
      $formError.addClass(this.options.formErrorClass);
    }
    $el.addClass(this.options.inputErrorClass).attr('data-invalid', '');
  };
  /**
   * Removes CSS error class as specified by the Abide settings from the label, input, and the form
   * @param {Object} $el - jQuery object to remove the class from
   */
  Abide.prototype.removeErrorClasses = function($el){
    var $label = this.findLabel($el),
        $formError = this.findFormError($el);

    if($label.length){
      $label.removeClass(this.options.labelErrorClass);
    }
    if($formError.length){
      $formError.removeClass(this.options.formErrorClass);
    }
    $el.removeClass(this.options.inputErrorClass).removeAttr('data-invalid');
  };
  /**
   * Goes through a form to find inputs and proceeds to validate them in ways specific to their type
   * @fires Abide#invalid
   * @fires Abide#valid
   * @param {Object} element - jQuery object to validate, should be an HTML input
   * @returns {Boolean} goodToGo - If the input is valid or not.
   */
  Abide.prototype.validateInput = function($el){
    var clearRequire = this.requiredCheck($el),
        validated = false,
        customValidator = true,
        validator = $el.attr('data-validator'),
        equalTo = true;

    switch ($el[0].type) {

      case 'radio':
        validated = this.validateRadio($el.attr('name'));
        break;

      case 'checkbox':
        validated = clearRequire;
        break;

      case 'select':
      case 'select-one':
      case 'select-multiple':
        validated = clearRequire;
        break;

      default:
        validated = this.validateText($el);
    }

    if(validator){ customValidator = this.matchValidation($el, validator, $el.attr('required')); }
    if($el.attr('data-equalto')){ equalTo = this.options.validators.equalTo($el); }

    var goodToGo = [clearRequire, validated, customValidator, equalTo].indexOf(false) === -1,
        message = (goodToGo ? 'valid' : 'invalid') + '.zf.abide';

    this[goodToGo ? 'removeErrorClasses' : 'addErrorClasses']($el);

    /**
     * Fires when the input is done checking for validation. Event trigger is either `valid.zf.abide` or `invalid.zf.abide`
     * Trigger includes the DOM element of the input.
     * @event Abide#valid
     * @event Abide#invalid
     */
    $el.trigger(message, [$el]);

    return goodToGo;
  };
  /**
   * Goes through a form and if there are any invalid inputs, it will display the form error element
   * @returns {Boolean} noError - true if no errors were detected...
   * @fires Abide#formvalid
   * @fires Abide#forminvalid
   */
  Abide.prototype.validateForm = function(){
    var acc = [],
        _this = this;

    this.$inputs.each(function(){
      acc.push(_this.validateInput($(this)));
    });

    var noError = acc.indexOf(false) === -1;

    this.$element.find('[data-abide-error]').css('display', (noError ? 'none' : 'block'));
        /**
         * Fires when the form is finished validating. Event trigger is either `formvalid.zf.abide` or `forminvalid.zf.abide`.
         * Trigger includes the element of the form.
         * @event Abide#formvalid
         * @event Abide#forminvalid
         */
    this.$element.trigger((noError ? 'formvalid' : 'forminvalid') + '.zf.abide', [this.$element]);

    return noError;
  };
  /**
   * Determines whether or a not a text input is valid based on the pattern specified in the attribute. If no matching pattern is found, returns true.
   * @param {Object} $el - jQuery object to validate, should be a text input HTML element
   * @param {String} pattern - string value of one of the RegEx patterns in Abide.options.patterns
   * @returns {Boolean} Boolean value depends on whether or not the input value matches the pattern specified
   */
   Abide.prototype.validateText = function($el, pattern){
     // pattern = pattern ? pattern : $el.attr('pattern') ? $el.attr('pattern') : $el.attr('type');
     pattern = (pattern || $el.attr('pattern') || $el.attr('type'));
     var inputText = $el.val();

     return inputText.length ?//if text, check if the pattern exists, if so, test it, if no text or no pattern, return true.
            this.options.patterns.hasOwnProperty(pattern) ? this.options.patterns[pattern].test(inputText) :
            pattern && pattern !== $el.attr('type') ? new RegExp(pattern).test(inputText) : true : true;
   };  /**
   * Determines whether or a not a radio input is valid based on whether or not it is required and selected
   * @param {String} groupName - A string that specifies the name of a radio button group
   * @returns {Boolean} Boolean value depends on whether or not at least one radio input has been selected (if it's required)
   */
  Abide.prototype.validateRadio = function(groupName){
    var $group = this.$element.find(':radio[name="' + groupName + '"]'),
        counter = [],
        _this = this;

    $group.each(function(){
      var rdio = $(this),
          clear = _this.requiredCheck(rdio);
      counter.push(clear);
      if(clear) _this.removeErrorClasses(rdio);
    });

    return counter.indexOf(false) === -1;
  };
  /**
   * Determines if a selected input passes a custom validation function. Multiple validations can be used, if passed to the element with `data-validator="foo bar baz"` in a space separated listed.
   * @param {Object} $el - jQuery input element.
   * @param {String} validators - a string of function names matching functions in the Abide.options.validators object.
   * @param {Boolean} required - self explanatory?
   * @returns {Boolean} - true if validations passed.
   */
  Abide.prototype.matchValidation = function($el, validators, required){
    var _this = this;
    required = required ? true : false;
    var clear = validators.split(' ').map(function(v){
      return _this.options.validators[v]($el, required, $el.parent());
    });
    return clear.indexOf(false) === -1;
  };
  /**
   * Resets form inputs and styles
   * @fires Abide#formreset
   */
  Abide.prototype.resetForm = function() {
    var $form = this.$element,
        opts = this.options;

    $('.' + opts.labelErrorClass, $form).not('small').removeClass(opts.labelErrorClass);
    $('.' + opts.inputErrorClass, $form).not('small').removeClass(opts.inputErrorClass);
    $(opts.formErrorSelector + '.' + opts.formErrorClass).removeClass(opts.formErrorClass);
    $form.find('[data-abide-error]').css('display', 'none');
    $(':input', $form).not(':button, :submit, :reset, :hidden, [data-abide-ignore]').val('').removeAttr('data-invalid');
    /**
     * Fires when the form has been reset.
     * @event Abide#formreset
     */
    $form.trigger('formreset.zf.abide', [$form]);
  };
  /**
   * Destroys an instance of Abide.
   * Removes error styles and classes from elements, without resetting their values.
   */
  Abide.prototype.destroy = function(){
    var _this = this;
    this.$element.off('.abide')
        .find('[data-abide-error]').css('display', 'none');
    this.$inputs.off('.abide')
        .each(function(){
          _this.removeErrorClasses($(this));
        });

    Foundation.unregisterPlugin(this);
  };

  Foundation.plugin(Abide, 'Abide');

  // Exports for AMD/Browserify
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Abide;
  if (typeof define === 'function')
    define(['foundation'], function() {
      return Abide;
    });

}(Foundation, jQuery);

/**
 * Accordion module.
 * @module foundation.accordion
 * @requires foundation.util.keyboard
 * @requires foundation.util.motion
 */
!function($, Foundation) {
  'use strict';

  /**
   * Creates a new instance of an accordion.
   * @class
   * @fires Accordion#init
   * @param {jQuery} element - jQuery object to make into an accordion.
   * @param {Object} options - a plain object with settings to override the default options.
   */
  function Accordion(element, options){
    this.$element = element;
    this.options = $.extend({}, Accordion.defaults, this.$element.data(), options);

    this._init();

    Foundation.registerPlugin(this, 'Accordion');
    Foundation.Keyboard.register('Accordion', {
      'ENTER': 'toggle',
      'SPACE': 'toggle',
      'ARROW_DOWN': 'next',
      'ARROW_UP': 'previous'
    });
  }

  Accordion.defaults = {
    /**
     * Amount of time to animate the opening of an accordion pane.
     * @option
     * @example 250
     */
    slideSpeed: 250,
    /**
     * Allow the accordion to have multiple open panes.
     * @option
     * @example false
     */
    multiExpand: false,
    /**
     * Allow the accordion to close all panes.
     * @option
     * @example false
     */
    allowAllClosed: false
  };

  /**
   * Initializes the accordion by animating the preset active pane(s).
   * @private
   */
  Accordion.prototype._init = function() {
    this.$element.attr('role', 'tablist');
    this.$tabs = this.$element.children('li');
    if (this.$tabs.length === 0) {
      this.$tabs = this.$element.children('[data-accordion-item]');
    }
    this.$tabs.each(function(idx, el){

      var $el = $(el),
          $content = $el.find('[data-tab-content]'),
          id = $content[0].id || Foundation.GetYoDigits(6, 'accordion'),
          linkId = el.id || id + '-label';

      $el.find('a:first').attr({
        'aria-controls': id,
        'role': 'tab',
        'id': linkId,
        'aria-expanded': false,
        'aria-selected': false
      });
      $content.attr({'role': 'tabpanel', 'aria-labelledby': linkId, 'aria-hidden': true, 'id': id});
    });
    var $initActive = this.$element.find('.is-active').children('[data-tab-content]');
    if($initActive.length){
      this.down($initActive, true);
    }
    this._events();
  };

  /**
   * Adds event handlers for items within the accordion.
   * @private
   */
  Accordion.prototype._events = function() {
    var _this = this;

    this.$tabs.each(function(){
      var $elem = $(this);
      var $tabContent = $elem.children('[data-tab-content]');
      if ($tabContent.length) {
        $elem.children('a').off('click.zf.accordion keydown.zf.accordion')
               .on('click.zf.accordion', function(e){
        // $(this).children('a').on('click.zf.accordion', function(e) {
          e.preventDefault();
          if ($elem.hasClass('is-active')) {
            if(_this.options.allowAllClosed || $elem.siblings().hasClass('is-active')){
              _this.up($tabContent);
            }
          }
          else {
            _this.down($tabContent);
          }
        }).on('keydown.zf.accordion', function(e){
          Foundation.Keyboard.handleKey(e, 'Accordion', {
            toggle: function() {
              _this.toggle($tabContent);
            },
            next: function() {
              $elem.next().find('a').focus().trigger('click.zf.accordion');
            },
            previous: function() {
              $elem.prev().find('a').focus().trigger('click.zf.accordion');
            },
            handled: function() {
              e.preventDefault();
              e.stopPropagation();
            }
          });
        });
      }
    });
  };
  /**
   * Toggles the selected content pane's open/close state.
   * @param {jQuery} $target - jQuery object of the pane to toggle.
   * @function
   */
  Accordion.prototype.toggle = function($target){
    if($target.parent().hasClass('is-active')){
      if(this.options.allowAllClosed || $target.parent().siblings().hasClass('is-active')){
        this.up($target);
      }else{ return; }
    }else{
      this.down($target);
    }
  };
  /**
   * Opens the accordion tab defined by `$target`.
   * @param {jQuery} $target - Accordion pane to open.
   * @param {Boolean} firstTime - flag to determine if reflow should happen.
   * @fires Accordion#down
   * @function
   */
  Accordion.prototype.down = function($target, firstTime) {
    var _this = this;
    if(!this.options.multiExpand && !firstTime){
      var $currentActive = this.$element.find('.is-active').children('[data-tab-content]');
      if($currentActive.length){
        this.up($currentActive);
      }
    }

    $target
      .attr('aria-hidden', false)
      .parent('[data-tab-content]')
      .addBack()
      .parent().addClass('is-active');

    // Foundation.Move(_this.options.slideSpeed, $target, function(){
      $target.slideDown(_this.options.slideSpeed, function () {
        /**
         * Fires when the tab is done opening.
         * @event Accordion#down
         */
        _this.$element.trigger('down.zf.accordion', [$target]);
      });
    // });

    // if(!firstTime){
    //   Foundation._reflow(this.$element.attr('data-accordion'));
    // }
    $('#' + $target.attr('aria-labelledby')).attr({
      'aria-expanded': true,
      'aria-selected': true
    });
  };

  /**
   * Closes the tab defined by `$target`.
   * @param {jQuery} $target - Accordion tab to close.
   * @fires Accordion#up
   * @function
   */
  Accordion.prototype.up = function($target) {
    var $aunts = $target.parent().siblings(),
        _this = this;
    var canClose = this.options.multiExpand ? $aunts.hasClass('is-active') : $target.parent().hasClass('is-active');

    if(!this.options.allowAllClosed && !canClose){
      return;
    }

    // Foundation.Move(this.options.slideSpeed, $target, function(){
      $target.slideUp(_this.options.slideSpeed, function () {
        /**
         * Fires when the tab is done collapsing up.
         * @event Accordion#up
         */
        _this.$element.trigger('up.zf.accordion', [$target]);
      });
    // });

    $target.attr('aria-hidden', true)
           .parent().removeClass('is-active');

    $('#' + $target.attr('aria-labelledby')).attr({
     'aria-expanded': false,
     'aria-selected': false
   });
  };

  /**
   * Destroys an instance of an accordion.
   * @fires Accordion#destroyed
   * @function
   */
  Accordion.prototype.destroy = function() {
    this.$element.find('[data-tab-content]').slideUp(0).css('display', '');
    this.$element.find('a').off('.zf.accordion');

    Foundation.unregisterPlugin(this);
  };

  Foundation.plugin(Accordion, 'Accordion');
}(jQuery, window.Foundation);

/**
 * AccordionMenu module.
 * @module foundation.accordionMenu
 * @requires foundation.util.keyboard
 * @requires foundation.util.motion
 * @requires foundation.util.nest
 */
!function($) {
  'use strict';

  /**
   * Creates a new instance of an accordion menu.
   * @class
   * @fires AccordionMenu#init
   * @param {jQuery} element - jQuery object to make into an accordion menu.
   * @param {Object} options - Overrides to the default plugin settings.
   */
  function AccordionMenu(element, options) {
    this.$element = element;
    this.options = $.extend({}, AccordionMenu.defaults, this.$element.data(), options);

    Foundation.Nest.Feather(this.$element, 'accordion');

    this._init();

    Foundation.registerPlugin(this, 'AccordionMenu');
    Foundation.Keyboard.register('AccordionMenu', {
      'ENTER': 'toggle',
      'SPACE': 'toggle',
      'ARROW_RIGHT': 'open',
      'ARROW_UP': 'up',
      'ARROW_DOWN': 'down',
      'ARROW_LEFT': 'close',
      'ESCAPE': 'closeAll',
      'TAB': 'down',
      'SHIFT_TAB': 'up'
    });
  }

  AccordionMenu.defaults = {
    /**
     * Amount of time to animate the opening of a submenu in ms.
     * @option
     * @example 250
     */
    slideSpeed: 250,
    /**
     * Allow the menu to have multiple open panes.
     * @option
     * @example true
     */
    multiOpen: true
  };

  /**
   * Initializes the accordion menu by hiding all nested menus.
   * @private
   */
  AccordionMenu.prototype._init = function() {
    this.$element.find('[data-submenu]').not('.is-active').slideUp(0);//.find('a').css('padding-left', '1rem');
    this.$element.attr({
      'role': 'tablist',
      'aria-multiselectable': this.options.multiOpen
    });

    this.$menuLinks = this.$element.find('.is-accordion-submenu-parent');
    this.$menuLinks.each(function(){
      var linkId = this.id || Foundation.GetYoDigits(6, 'acc-menu-link'),
          $elem = $(this),
          $sub = $elem.children('[data-submenu]'),
          subId = $sub[0].id || Foundation.GetYoDigits(6, 'acc-menu'),
          isActive = $sub.hasClass('is-active');
      $elem.attr({
        'aria-controls': subId,
        'aria-expanded': isActive,
        'role': 'tab',
        'id': linkId
      });
      $sub.attr({
        'aria-labelledby': linkId,
        'aria-hidden': !isActive,
        'role': 'tabpanel',
        'id': subId
      });
    });
    var initPanes = this.$element.find('.is-active');
    if(initPanes.length){
      var _this = this;
      initPanes.each(function(){
        _this.down($(this));
      });
    }
    this._events();
  };

  /**
   * Adds event handlers for items within the menu.
   * @private
   */
  AccordionMenu.prototype._events = function() {
    var _this = this;

    this.$element.find('li').each(function() {
      var $submenu = $(this).children('[data-submenu]');

      if ($submenu.length) {
        $(this).children('a').off('click.zf.accordionMenu').on('click.zf.accordionMenu', function(e) {
          e.preventDefault();

          _this.toggle($submenu);
        });
      }
    }).on('keydown.zf.accordionmenu', function(e){
      var $element = $(this),
          $elements = $element.parent('ul').children('li'),
          $prevElement,
          $nextElement,
          $target = $element.children('[data-submenu]');

      $elements.each(function(i) {
        if ($(this).is($element)) {
          $prevElement = $elements.eq(Math.max(0, i-1));
          $nextElement = $elements.eq(Math.min(i+1, $elements.length-1));

          if ($(this).children('[data-submenu]:visible').length) { // has open sub menu
            $nextElement = $element.find('li:first-child');
          }
          if ($(this).is(':first-child')) { // is first element of sub menu
            $prevElement = $element.parents('li').first();
          } else if ($prevElement.children('[data-submenu]:visible').length) { // if previous element has open sub menu
            $prevElement = $prevElement.find('li:last-child');
          }
          if ($(this).is(':last-child')) { // is last element of sub menu
            $nextElement = $element.parents('li').first().next('li');
          }

          return;
        }
      });
      Foundation.Keyboard.handleKey(e, 'AccordionMenu', {
        open: function() {
          if ($target.is(':hidden')) {
            _this.down($target);
            $target.find('li').first().focus();
          }
        },
        close: function() {
          if ($target.length && !$target.is(':hidden')) { // close active sub of this item
            _this.up($target);
          } else if ($element.parent('[data-submenu]').length) { // close currently open sub
            _this.up($element.parent('[data-submenu]'));
            $element.parents('li').first().focus();
          }
        },
        up: function() {
          $prevElement.focus();
        },
        down: function() {
          $nextElement.focus();
        },
        toggle: function() {
          if ($element.children('[data-submenu]').length) {
            _this.toggle($element.children('[data-submenu]'));
          }
        },
        closeAll: function() {
          _this.hideAll();
        },
        handled: function() {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      });
    });//.attr('tabindex', 0);
  };
  /**
   * Closes all panes of the menu.
   * @function
   */
  AccordionMenu.prototype.hideAll = function(){
    this.$element.find('[data-submenu]').slideUp(this.options.slideSpeed);
  };
  /**
   * Toggles the open/close state of a submenu.
   * @function
   * @param {jQuery} $target - the submenu to toggle
   */
  AccordionMenu.prototype.toggle = function($target){
    if(!$target.is(':animated')) {
      if (!$target.is(':hidden')) {
        this.up($target);
      }
      else {
        this.down($target);
      }
    }
  };
  /**
   * Opens the sub-menu defined by `$target`.
   * @param {jQuery} $target - Sub-menu to open.
   * @fires AccordionMenu#down
   */
  AccordionMenu.prototype.down = function($target) {
    var _this = this;

    if(!this.options.multiOpen){
      this.up(this.$element.find('.is-active').not($target.parentsUntil(this.$element).add($target)));
    }

    $target.addClass('is-active').attr({'aria-hidden': false})
      .parent('.is-accordion-submenu-parent').attr({'aria-expanded': true});

      Foundation.Move(this.options.slideSpeed, $target, function(){
        $target.slideDown(_this.options.slideSpeed, function () {
          /**
           * Fires when the menu is done opening.
           * @event AccordionMenu#down
           */
          _this.$element.trigger('down.zf.accordionMenu', [$target]);
        });
      });
  };

  /**
   * Closes the sub-menu defined by `$target`. All sub-menus inside the target will be closed as well.
   * @param {jQuery} $target - Sub-menu to close.
   * @fires AccordionMenu#up
   */
  AccordionMenu.prototype.up = function($target) {
    var _this = this;
    Foundation.Move(this.options.slideSpeed, $target, function(){
      $target.slideUp(_this.options.slideSpeed, function () {
        /**
         * Fires when the menu is done collapsing up.
         * @event AccordionMenu#up
         */
        _this.$element.trigger('up.zf.accordionMenu', [$target]);
      });
    });

    var $menus = $target.find('[data-submenu]').slideUp(0).addBack().attr('aria-hidden', true);

    $menus.parent('.is-accordion-submenu-parent').attr('aria-expanded', false);
  };

  /**
   * Destroys an instance of accordion menu.
   * @fires AccordionMenu#destroyed
   */
  AccordionMenu.prototype.destroy = function(){
    this.$element.find('[data-submenu]').slideDown(0).css('display', '');
    this.$element.find('a').off('click.zf.accordionMenu');

    Foundation.Nest.Burn(this.$element, 'accordion');
    Foundation.unregisterPlugin(this);
  };

  Foundation.plugin(AccordionMenu, 'AccordionMenu');
}(jQuery, window.Foundation);

/**
 * Drilldown module.
 * @module foundation.drilldown
 * @requires foundation.util.keyboard
 * @requires foundation.util.motion
 * @requires foundation.util.nest
 */
!function($, Foundation){
  'use strict';

  /**
   * Creates a new instance of a drilldown menu.
   * @class
   * @param {jQuery} element - jQuery object to make into an accordion menu.
   * @param {Object} options - Overrides to the default plugin settings.
   */
  function Drilldown(element, options){
    this.$element = element;
    this.options = $.extend({}, Drilldown.defaults, this.$element.data(), options);

    Foundation.Nest.Feather(this.$element, 'drilldown');

    this._init();

    Foundation.registerPlugin(this, 'Drilldown');
    Foundation.Keyboard.register('Drilldown', {
      'ENTER': 'open',
      'SPACE': 'open',
      'ARROW_RIGHT': 'next',
      'ARROW_UP': 'up',
      'ARROW_DOWN': 'down',
      'ARROW_LEFT': 'previous',
      'ESCAPE': 'close',
      'TAB': 'down',
      'SHIFT_TAB': 'up'
    });
  }
  Drilldown.defaults = {
    /**
     * Markup used for JS generated back button. Prepended to submenu lists and deleted on `destroy` method, 'js-drilldown-back' class required. Remove the backslash (`\`) if copy and pasting.
     * @option
     * @example '<\li><\a>Back<\/a><\/li>'
     */
    backButton: '<li class="js-drilldown-back"><a>Back</a></li>',
    /**
     * Markup used to wrap drilldown menu. Use a class name for independent styling; the JS applied class: `is-drilldown` is required. Remove the backslash (`\`) if copy and pasting.
     * @option
     * @example '<\div class="is-drilldown"><\/div>'
     */
    wrapper: '<div></div>',
    /**
     * Allow the menu to return to root list on body click.
     * @option
     * @example false
     */
    closeOnClick: false
    // holdOpen: false
  };
  /**
   * Initializes the drilldown by creating jQuery collections of elements
   * @private
   */
  Drilldown.prototype._init = function(){
    this.$submenuAnchors = this.$element.find('li.is-drilldown-submenu-parent');
    this.$submenus = this.$submenuAnchors.children('[data-submenu]');
    this.$menuItems = this.$element.find('li').not('.js-drilldown-back').attr('role', 'menuitem');

    this._prepareMenu();

    this._keyboardEvents();
  };
  /**
   * prepares drilldown menu by setting attributes to links and elements
   * sets a min height to prevent content jumping
   * wraps the element if not already wrapped
   * @private
   * @function
   */
  Drilldown.prototype._prepareMenu = function(){
    var _this = this;
    // if(!this.options.holdOpen){
    //   this._menuLinkEvents();
    // }
    this.$submenuAnchors.each(function(){
      var $sub = $(this);
      var $link = $sub.find('a:first');
      $link.data('savedHref', $link.attr('href')).removeAttr('href');
      $sub.children('[data-submenu]')
          .attr({
            'aria-hidden': true,
            'tabindex': 0,
            'role': 'menu'
          });
      _this._events($sub);
    });
    this.$submenus.each(function(){
      var $menu = $(this),
          $back = $menu.find('.js-drilldown-back');
      if(!$back.length){
        $menu.prepend(_this.options.backButton);
      }
      _this._back($menu);
    });
    if(!this.$element.parent().hasClass('is-drilldown')){
      this.$wrapper = $(this.options.wrapper).addClass('is-drilldown').css(this._getMaxDims());
      this.$element.wrap(this.$wrapper);
    }

  };
  /**
   * Adds event handlers to elements in the menu.
   * @function
   * @private
   * @param {jQuery} $elem - the current menu item to add handlers to.
   */
  Drilldown.prototype._events = function($elem){
    var _this = this;

    $elem.off('click.zf.drilldown')
    .on('click.zf.drilldown', function(e){
      if($(e.target).parentsUntil('ul', 'li').hasClass('is-drilldown-submenu-parent')){
        e.stopImmediatePropagation();
        e.preventDefault();
      }

      // if(e.target !== e.currentTarget.firstElementChild){
      //   return false;
      // }
      _this._show($elem);

      if(_this.options.closeOnClick){
        var $body = $('body').not(_this.$wrapper);
        $body.off('.zf.drilldown').on('click.zf.drilldown', function(e){
          e.preventDefault();
          _this._hideAll();
          $body.off('.zf.drilldown');
        });
      }
    });
  };
  /**
   * Adds keydown event listener to `li`'s in the menu.
   * @private
   */
  Drilldown.prototype._keyboardEvents = function() {
    var _this = this;
    this.$menuItems.add(this.$element.find('.js-drilldown-back')).on('keydown.zf.drilldown', function(e){
      var $element = $(this),
          $elements = $element.parent('ul').children('li'),
          $prevElement,
          $nextElement;

      $elements.each(function(i) {
        if ($(this).is($element)) {
          $prevElement = $elements.eq(Math.max(0, i-1));
          $nextElement = $elements.eq(Math.min(i+1, $elements.length-1));
          return;
        }
      });
      Foundation.Keyboard.handleKey(e, 'Drilldown', {
        next: function() {
          if ($element.is(_this.$submenuAnchors)) {
            _this._show($element);
            $element.on(Foundation.transitionend($element), function(){
              $element.find('ul li').filter(_this.$menuItems).first().focus();
            });
          }
        },
        previous: function() {
          _this._hide($element.parent('ul'));
          $element.parent('ul').on(Foundation.transitionend($element), function(){
            setTimeout(function() {
              $element.parent('ul').parent('li').focus();
            }, 1);
          });
        },
        up: function() {
          $prevElement.focus();
        },
        down: function() {
          $nextElement.focus();
        },
        close: function() {
          _this._back();
          //_this.$menuItems.first().focus(); // focus to first element
        },
        open: function() {
          if (!$element.is(_this.$menuItems)) { // not menu item means back button
            _this._hide($element.parent('ul'));
            setTimeout(function(){$element.parent('ul').parent('li').focus();}, 1);
          } else if ($element.is(_this.$submenuAnchors)) {
            _this._show($element);
            setTimeout(function(){$element.find('ul li').filter(_this.$menuItems).first().focus();}, 1);
          }
        },
        handled: function() {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      });
    }); // end keyboardAccess
  };

  /**
   * Closes all open elements, and returns to root menu.
   * @function
   * @fires Drilldown#closed
   */
  Drilldown.prototype._hideAll = function(){
    var $elem = this.$element.find('.is-drilldown-submenu.is-active').addClass('is-closing');
    $elem.one(Foundation.transitionend($elem), function(e){
      $elem.removeClass('is-active is-closing');
    });
        /**
         * Fires when the menu is fully closed.
         * @event Drilldown#closed
         */
    this.$element.trigger('closed.zf.drilldown');
  };
  /**
   * Adds event listener for each `back` button, and closes open menus.
   * @function
   * @fires Drilldown#back
   * @param {jQuery} $elem - the current sub-menu to add `back` event.
   */
  Drilldown.prototype._back = function($elem){
    var _this = this;
    $elem.off('click.zf.drilldown');
    $elem.children('.js-drilldown-back')
      .on('click.zf.drilldown', function(e){
        e.stopImmediatePropagation();
        // console.log('mouseup on back');
        _this._hide($elem);
      });
  };
  /**
   * Adds event listener to menu items w/o submenus to close open menus on click.
   * @function
   * @private
   */
  Drilldown.prototype._menuLinkEvents = function(){
    var _this = this;
    this.$menuItems.not('.is-drilldown-submenu-parent')
        .off('click.zf.drilldown')
        .on('click.zf.drilldown', function(e){
          // e.stopImmediatePropagation();
          setTimeout(function(){
            _this._hideAll();
          }, 0);
      });
  };
  /**
   * Opens a submenu.
   * @function
   * @fires Drilldown#open
   * @param {jQuery} $elem - the current element with a submenu to open.
   */
  Drilldown.prototype._show = function($elem){
    $elem.children('[data-submenu]').addClass('is-active');

    this.$element.trigger('open.zf.drilldown', [$elem]);
  };
  /**
   * Hides a submenu
   * @function
   * @fires Drilldown#hide
   * @param {jQuery} $elem - the current sub-menu to hide.
   */
  Drilldown.prototype._hide = function($elem){
    var _this = this;
    $elem.addClass('is-closing')
         .one(Foundation.transitionend($elem), function(){
           $elem.removeClass('is-active is-closing');
         });
    /**
     * Fires when the submenu is has closed.
     * @event Drilldown#hide
     */
    $elem.trigger('hide.zf.drilldown', [$elem]);

  };
  /**
   * Iterates through the nested menus to calculate the min-height, and max-width for the menu.
   * Prevents content jumping.
   * @function
   * @private
   */
  Drilldown.prototype._getMaxDims = function(){
    var max = 0, result = {};
    this.$submenus.add(this.$element).each(function(){
      var numOfElems = $(this).children('li').length;
      max = numOfElems > max ? numOfElems : max;
    });

    result.height = max * this.$menuItems[0].getBoundingClientRect().height + 'px';
    result.width = this.$element[0].getBoundingClientRect().width + 'px';

    return result;
  };
  /**
   * Destroys the Drilldown Menu
   * @function
   */
  Drilldown.prototype.destroy = function(){
    this._hideAll();
    Foundation.Nest.Burn(this.$element, 'drilldown');
    this.$element.unwrap()
                 .find('.js-drilldown-back').remove()
                 .end().find('.is-active, .is-closing, .is-drilldown-submenu').removeClass('is-active is-closing is-drilldown-submenu')
                 .end().find('[data-submenu]').removeAttr('aria-hidden tabindex role')
                 .off('.zf.drilldown').end().off('zf.drilldown');
    this.$element.find('a').each(function(){
      var $link = $(this);
      if($link.data('savedHref')){
        $link.attr('href', $link.data('savedHref')).removeData('savedHref');
      }else{ return; }
    });
    Foundation.unregisterPlugin(this);
  };
  Foundation.plugin(Drilldown, 'Drilldown');
}(jQuery, window.Foundation);

/**
 * Dropdown module.
 * @module foundation.dropdown
 * @requires foundation.util.keyboard
 * @requires foundation.util.box
 * @requires foundation.util.triggers
 */
!function($, Foundation){
  'use strict';
  /**
   * Creates a new instance of a dropdown.
   * @class
   * @param {jQuery} element - jQuery object to make into a dropdown.
   *        Object should be of the dropdown panel, rather than its anchor.
   * @param {Object} options - Overrides to the default plugin settings.
   */
  function Dropdown(element, options){
    this.$element = element;
    this.options = $.extend({}, Dropdown.defaults, this.$element.data(), options);
    this._init();

    Foundation.registerPlugin(this, 'Dropdown');
    Foundation.Keyboard.register('Dropdown', {
      'ENTER': 'open',
      'SPACE': 'open',
      'ESCAPE': 'close',
      'TAB': 'tab_forward',
      'SHIFT_TAB': 'tab_backward'
    });
  }

  Dropdown.defaults = {
    /**
     * Amount of time to delay opening a submenu on hover event.
     * @option
     * @example 250
     */
    hoverDelay: 250,
    /**
     * Allow submenus to open on hover events
     * @option
     * @example false
     */
    hover: false,
    /**
     * Don't close dropdown when hovering over dropdown pane
     * @option
     * @example true
     */
    hoverPane: false,
    /**
     * Number of pixels between the dropdown pane and the triggering element on open.
     * @option
     * @example 1
     */
    vOffset: 1,
    /**
     * Number of pixels between the dropdown pane and the triggering element on open.
     * @option
     * @example 1
     */
    hOffset: 1,
    /**
     * Class applied to adjust open position. JS will test and fill this in.
     * @option
     * @example 'top'
     */
    positionClass: '',
    /**
     * Allow the plugin to trap focus to the dropdown pane if opened with keyboard commands.
     * @option
     * @example false
     */
    trapFocus: false,
    /**
     * Allow the plugin to set focus to the first focusable element within the pane, regardless of method of opening.
     * @option
     * @example true
     */
    autoFocus: false,
    /**
     * Allows a click on the body to close the dropdown.
     * @option
     * @example false
     */
    closeOnClick: false
  };
  /**
   * Initializes the plugin by setting/checking options and attributes, adding helper variables, and saving the anchor.
   * @function
   * @private
   */
  Dropdown.prototype._init = function(){
    var $id = this.$element.attr('id');

    this.$anchor = $('[data-toggle="' + $id + '"]') || $('[data-open="' + $id + '"]');
    this.$anchor.attr({
      'aria-controls': $id,
      'data-is-focus': false,
      'data-yeti-box': $id,
      'aria-haspopup': true,
      'aria-expanded': false
      // 'data-resize': $id
    });

    this.options.positionClass = this.getPositionClass();
    this.counter = 4;
    this.usedPositions = [];
    this.$element.attr({
      'aria-hidden': 'true',
      'data-yeti-box': $id,
      'data-resize': $id,
      'aria-labelledby': this.$anchor[0].id || Foundation.GetYoDigits(6, 'dd-anchor')
    });
    this._events();
  };
  /**
   * Helper function to determine current orientation of dropdown pane.
   * @function
   * @returns {String} position - string value of a position class.
   */
  Dropdown.prototype.getPositionClass = function(){
    var position = this.$element[0].className.match(/\b(top|left|right)\b/g);
        position = position ? position[0] : '';
    return position;
  };
  /**
   * Adjusts the dropdown panes orientation by adding/removing positioning classes.
   * @function
   * @private
   * @param {String} position - position class to remove.
   */
  Dropdown.prototype._reposition = function(position){
    this.usedPositions.push(position ? position : 'bottom');
    //default, try switching to opposite side
    if(!position && (this.usedPositions.indexOf('top') < 0)){
      this.$element.addClass('top');
    }else if(position === 'top' && (this.usedPositions.indexOf('bottom') < 0)){
      this.$element.removeClass(position);
    }else if(position === 'left' && (this.usedPositions.indexOf('right') < 0)){
      this.$element.removeClass(position)
          .addClass('right');
    }else if(position === 'right' && (this.usedPositions.indexOf('left') < 0)){
      this.$element.removeClass(position)
          .addClass('left');
    }

    //if default change didn't work, try bottom or left first
    else if(!position && (this.usedPositions.indexOf('top') > -1) && (this.usedPositions.indexOf('left') < 0)){
      this.$element.addClass('left');
    }else if(position === 'top' && (this.usedPositions.indexOf('bottom') > -1) && (this.usedPositions.indexOf('left') < 0)){
      this.$element.removeClass(position)
          .addClass('left');
    }else if(position === 'left' && (this.usedPositions.indexOf('right') > -1) && (this.usedPositions.indexOf('bottom') < 0)){
      this.$element.removeClass(position);
    }else if(position === 'right' && (this.usedPositions.indexOf('left') > -1) && (this.usedPositions.indexOf('bottom') < 0)){
      this.$element.removeClass(position);
    }
    //if nothing cleared, set to bottom
    else{
      this.$element.removeClass(position);
    }
    this.classChanged = true;
    this.counter--;
  };
  /**
   * Sets the position and orientation of the dropdown pane, checks for collisions.
   * Recursively calls itself if a collision is detected, with a new position class.
   * @function
   * @private
   */
  Dropdown.prototype._setPosition = function(){
    if(this.$anchor.attr('aria-expanded') === 'false'){ return false; }
    var position = this.getPositionClass(),
        $eleDims = Foundation.Box.GetDimensions(this.$element),
        $anchorDims = Foundation.Box.GetDimensions(this.$anchor),
        _this = this,
        direction = (position === 'left' ? 'left' : ((position === 'right') ? 'left' : 'top')),
        param = (direction === 'top') ? 'height' : 'width',
        offset = (param === 'height') ? this.options.vOffset : this.options.hOffset;

    if(($eleDims.width >= $eleDims.windowDims.width) || (!this.counter && !Foundation.Box.ImNotTouchingYou(this.$element))){
      this.$element.offset(Foundation.Box.GetOffsets(this.$element, this.$anchor, 'center bottom', this.options.vOffset, this.options.hOffset, true)).css({
        'width': $eleDims.windowDims.width - (this.options.hOffset * 2),
        'height': 'auto'
      });
      this.classChanged = true;
      return false;
    }

    this.$element.offset(Foundation.Box.GetOffsets(this.$element, this.$anchor, position, this.options.vOffset, this.options.hOffset));

    while(!Foundation.Box.ImNotTouchingYou(this.$element) && this.counter){
      this._reposition(position);
      this._setPosition();
    }
  };
  /**
   * Adds event listeners to the element utilizing the triggers utility library.
   * @function
   * @private
   */
  Dropdown.prototype._events = function(){
    var _this = this;
    this.$element.on({
      'open.zf.trigger': this.open.bind(this),
      'close.zf.trigger': this.close.bind(this),
      'toggle.zf.trigger': this.toggle.bind(this),
      'resizeme.zf.trigger': this._setPosition.bind(this)
    });

    if(this.options.hover){
      this.$anchor.off('mouseenter.zf.dropdown mouseleave.zf.dropdown')
          .on('mouseenter.zf.dropdown', function(){
            clearTimeout(_this.timeout);
            _this.timeout = setTimeout(function(){
              _this.open();
              _this.$anchor.data('hover', true);
            }, _this.options.hoverDelay);
          }).on('mouseleave.zf.dropdown', function(){
            clearTimeout(_this.timeout);
            _this.timeout = setTimeout(function(){
              _this.close();
              _this.$anchor.data('hover', false);
            }, _this.options.hoverDelay);
          });
      if(this.options.hoverPane){
        this.$element.off('mouseenter.zf.dropdown mouseleave.zf.dropdown')
            .on('mouseenter.zf.dropdown', function(){
              clearTimeout(_this.timeout);
            }).on('mouseleave.zf.dropdown', function(){
              clearTimeout(_this.timeout);
              _this.timeout = setTimeout(function(){
                _this.close();
                _this.$anchor.data('hover', false);
              }, _this.options.hoverDelay);
            });
      }
    }
    this.$anchor.add(this.$element).on('keydown.zf.dropdown', function(e) {

      var $target = $(this),
        visibleFocusableElements = Foundation.Keyboard.findFocusable(_this.$element);

      Foundation.Keyboard.handleKey(e, 'Dropdown', {
        tab_forward: function() {
          if (_this.$element.find(':focus').is(visibleFocusableElements.eq(-1))) { // left modal downwards, setting focus to first element
            if (_this.options.trapFocus) { // if focus shall be trapped
              visibleFocusableElements.eq(0).focus();
              e.preventDefault();
            } else { // if focus is not trapped, close dropdown on focus out
              _this.close();
            }
          }
        },
        tab_backward: function() {
          if (_this.$element.find(':focus').is(visibleFocusableElements.eq(0)) || _this.$element.is(':focus')) { // left modal upwards, setting focus to last element
            if (_this.options.trapFocus) { // if focus shall be trapped
              visibleFocusableElements.eq(-1).focus();
              e.preventDefault();
            } else { // if focus is not trapped, close dropdown on focus out
              _this.close();
            }
          }
        },
        open: function() {
          if ($target.is(_this.$anchor)) {
            _this.open();
            _this.$element.attr('tabindex', -1).focus();
            e.preventDefault();
          }
        },
        close: function() {
          _this.close();
          _this.$anchor.focus();
        }
      });
    });
  };
  /**
   * Adds an event handler to the body to close any dropdowns on a click.
   * @function
   * @private
   */
  Dropdown.prototype._addBodyHandler = function(){
     var $body = $(document.body).not(this.$element),
         _this = this;
     $body.off('click.zf.dropdown')
          .on('click.zf.dropdown', function(e){
            if(_this.$anchor.is(e.target) || _this.$anchor.find(e.target).length) {
              return;
            }
            if(_this.$element.find(e.target).length) {
              return;
            }
            _this.close();
            $body.off('click.zf.dropdown');
          });
  };
  /**
   * Opens the dropdown pane, and fires a bubbling event to close other dropdowns.
   * @function
   * @fires Dropdown#closeme
   * @fires Dropdown#show
   */
  Dropdown.prototype.open = function(){
    // var _this = this;
    /**
     * Fires to close other open dropdowns
     * @event Dropdown#closeme
     */
    this.$element.trigger('closeme.zf.dropdown', this.$element.attr('id'));
    this.$anchor.addClass('hover')
        .attr({'aria-expanded': true});
    // this.$element/*.show()*/;
    this._setPosition();
    this.$element.addClass('is-open')
        .attr({'aria-hidden': false});

    if(this.options.autoFocus){
      var $focusable = Foundation.Keyboard.findFocusable(this.$element);
      if($focusable.length){
        $focusable.eq(0).focus();
      }
    }

    if(this.options.closeOnClick){ this._addBodyHandler(); }

    /**
     * Fires once the dropdown is visible.
     * @event Dropdown#show
     */
     this.$element.trigger('show.zf.dropdown', [this.$element]);
    //why does this not work correctly for this plugin?
    // Foundation.reflow(this.$element, 'dropdown');
    // Foundation._reflow(this.$element.attr('data-dropdown'));
  };

  /**
   * Closes the open dropdown pane.
   * @function
   * @fires Dropdown#hide
   */
  Dropdown.prototype.close = function(){
    if(!this.$element.hasClass('is-open')){
      return false;
    }
    this.$element.removeClass('is-open')
        .attr({'aria-hidden': true});

    this.$anchor.removeClass('hover')
        .attr('aria-expanded', false);

    if(this.classChanged){
      var curPositionClass = this.getPositionClass();
      if(curPositionClass){
        this.$element.removeClass(curPositionClass);
      }
      this.$element.addClass(this.options.positionClass)
          /*.hide()*/.css({height: '', width: ''});
      this.classChanged = false;
      this.counter = 4;
      this.usedPositions.length = 0;
    }
    this.$element.trigger('hide.zf.dropdown', [this.$element]);
    // Foundation.reflow(this.$element, 'dropdown');
  };
  /**
   * Toggles the dropdown pane's visibility.
   * @function
   */
  Dropdown.prototype.toggle = function(){
    if(this.$element.hasClass('is-open')){
      if(this.$anchor.data('hover')) return;
      this.close();
    }else{
      this.open();
    }
  };
  /**
   * Destroys the dropdown.
   * @function
   */
  Dropdown.prototype.destroy = function(){
    this.$element.off('.zf.trigger').hide();
    this.$anchor.off('.zf.dropdown');

    Foundation.unregisterPlugin(this);
  };

  Foundation.plugin(Dropdown, 'Dropdown');
}(jQuery, window.Foundation);

/**
 * DropdownMenu module.
 * @module foundation.dropdown-menu
 * @requires foundation.util.keyboard
 * @requires foundation.util.box
 * @requires foundation.util.nest
 */
!function($, Foundation){
  'use strict';

  /**
   * Creates a new instance of DropdownMenu.
   * @class
   * @fires DropdownMenu#init
   * @param {jQuery} element - jQuery object to make into a dropdown menu.
   * @param {Object} options - Overrides to the default plugin settings.
   */
  function DropdownMenu(element, options){
    this.$element = element;
    this.options = $.extend({}, DropdownMenu.defaults, this.$element.data(), options);

    Foundation.Nest.Feather(this.$element, 'dropdown');
    this._init();

    Foundation.registerPlugin(this, 'DropdownMenu');
    Foundation.Keyboard.register('DropdownMenu', {
      'ENTER': 'open',
      'SPACE': 'open',
      'ARROW_RIGHT': 'next',
      'ARROW_UP': 'up',
      'ARROW_DOWN': 'down',
      'ARROW_LEFT': 'previous',
      'ESCAPE': 'close'
    });
  }

  /**
   * Default settings for plugin
   */
  DropdownMenu.defaults = {
    /**
     * Disallows hover events from opening submenus
     * @option
     * @example false
     */
    disableHover: false,
    /**
     * Allow a submenu to automatically close on a mouseleave event, if not clicked open.
     * @option
     * @example true
     */
    autoclose: true,
    /**
     * Amount of time to delay opening a submenu on hover event.
     * @option
     * @example 50
     */
    hoverDelay: 50,
    /**
     * Allow a submenu to open/remain open on parent click event. Allows cursor to move away from menu.
     * @option
     * @example true
     */
    clickOpen: false,
    /**
     * Amount of time to delay closing a submenu on a mouseleave event.
     * @option
     * @example 500
     */

    closingTime: 500,
    /**
     * Position of the menu relative to what direction the submenus should open. Handled by JS.
     * @option
     * @example 'left'
     */
    alignment: 'left',
    /**
     * Allow clicks on the body to close any open submenus.
     * @option
     * @example true
     */
    closeOnClick: true,
    /**
     * Class applied to vertical oriented menus, Foundation default is `vertical`. Update this if using your own class.
     * @option
     * @example 'vertical'
     */
    verticalClass: 'vertical',
    /**
     * Class applied to right-side oriented menus, Foundation default is `align-right`. Update this if using your own class.
     * @option
     * @example 'align-right'
     */
    rightClass: 'align-right',
    /**
     * Boolean to force overide the clicking of links to perform default action, on second touch event for mobile.
     * @option
     * @example false
     */
    forceFollow: true
  };
  /**
   * Initializes the plugin, and calls _prepareMenu
   * @private
   * @function
   */
  DropdownMenu.prototype._init = function(){
    var subs = this.$element.find('li.is-dropdown-submenu-parent');
    this.$element.children('.is-dropdown-submenu-parent').children('.is-dropdown-submenu').addClass('first-sub');

    this.$menuItems = this.$element.find('[role="menuitem"]');
    this.$tabs = this.$element.children('[role="menuitem"]');
    this.isVert = this.$element.hasClass(this.options.verticalClass);
    this.$tabs.find('ul.is-dropdown-submenu').addClass(this.options.verticalClass);

    if(this.$element.hasClass(this.options.rightClass) || this.options.alignment === 'right' || Foundation.rtl()){
      this.options.alignment = 'right';
      subs.addClass('is-left-arrow opens-left');
    }else{
      subs.addClass('is-right-arrow opens-right');
    }
    if(!this.isVert){
      this.$tabs.filter('.is-dropdown-submenu-parent').removeClass('is-right-arrow is-left-arrow opens-right opens-left')
          .addClass('is-down-arrow');
    }
    this.changed = false;
    this._events();
  };
  /**
   * Adds event listeners to elements within the menu
   * @private
   * @function
   */
  DropdownMenu.prototype._events = function(){
    var _this = this,
        hasTouch = 'ontouchstart' in window || (typeof window.ontouchstart !== 'undefined'),
        parClass = 'is-dropdown-submenu-parent';

    if(this.options.clickOpen || hasTouch){
      this.$menuItems.on('click.zf.dropdownmenu touchstart.zf.dropdownmenu', function(e){
        var $elem = $(e.target).parentsUntil('ul', '.' + parClass),
            hasSub = $elem.hasClass(parClass),
            hasClicked = $elem.attr('data-is-click') === 'true',
            $sub = $elem.children('.is-dropdown-submenu');

        if(hasSub){
          if(hasClicked){
            if(!_this.options.closeOnClick || (!_this.options.clickOpen && !hasTouch) || (_this.options.forceFollow && hasTouch)){ return; }
            else{
              e.stopImmediatePropagation();
              e.preventDefault();
              _this._hide($elem);
            }
          }else{
            e.preventDefault();
            e.stopImmediatePropagation();
            _this._show($elem.children('.is-dropdown-submenu'));
            $elem.add($elem.parentsUntil(_this.$element, '.' + parClass)).attr('data-is-click', true);
          }
        }else{ return; }
      });
    }

    if(!this.options.disableHover){
      this.$menuItems.on('mouseenter.zf.dropdownmenu', function(e){
        e.stopImmediatePropagation();
        var $elem = $(this),
            hasSub = $elem.hasClass(parClass);

        if(hasSub){
          clearTimeout(_this.delay);
          _this.delay = setTimeout(function(){
            _this._show($elem.children('.is-dropdown-submenu'));
          }, _this.options.hoverDelay);
        }
      }).on('mouseleave.zf.dropdownmenu', function(e){
        var $elem = $(this),
            hasSub = $elem.hasClass(parClass);
        if(hasSub && _this.options.autoclose){
          if($elem.attr('data-is-click') === 'true' && _this.options.clickOpen){ return false; }

          clearTimeout(_this.delay);
          _this.delay = setTimeout(function(){
            _this._hide($elem);
          }, _this.options.closingTime);
        }
      });
    }
    this.$menuItems.on('keydown.zf.dropdownmenu', function(e){
      var $element = $(e.target).parentsUntil('ul', '[role="menuitem"]'),
          isTab = _this.$tabs.index($element) > -1,
          $elements = isTab ? _this.$tabs : $element.siblings('li').add($element),
          $prevElement,
          $nextElement;

      $elements.each(function(i) {
        if ($(this).is($element)) {
          $prevElement = $elements.eq(i-1);
          $nextElement = $elements.eq(i+1);
          return;
        }
      });

      var nextSibling = function() {
        if (!$element.is(':last-child')) $nextElement.children('a:first').focus();
      }, prevSibling = function() {
        $prevElement.children('a:first').focus();
      }, openSub = function() {
        var $sub = $element.children('ul.is-dropdown-submenu');
        if($sub.length){
          _this._show($sub);
          $element.find('li > a:first').focus();
        }else{ return; }
      }, closeSub = function() {
        //if ($element.is(':first-child')) {
        var close = $element.parent('ul').parent('li');
          close.children('a:first').focus();
          _this._hide(close);
        //}
      };
      var functions = {
        open: openSub,
        close: function() {
          _this._hide(_this.$element);
          _this.$menuItems.find('a:first').focus(); // focus to first element
        },
        handled: function() {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      };

      if (isTab) {
        if (_this.vertical) { // vertical menu
          if (_this.options.alignment === 'left') { // left aligned
            $.extend(functions, {
              down: nextSibling,
              up: prevSibling,
              next: openSub,
              previous: closeSub
            });
          } else { // right aligned
            $.extend(functions, {
              down: nextSibling,
              up: prevSibling,
              next: closeSub,
              previous: openSub
            });
          }
        } else { // horizontal menu
          $.extend(functions, {
            next: nextSibling,
            previous: prevSibling,
            down: openSub,
            up: closeSub
          });
        }
      } else { // not tabs -> one sub
        if (_this.options.alignment === 'left') { // left aligned
          $.extend(functions, {
            next: openSub,
            previous: closeSub,
            down: nextSibling,
            up: prevSibling
          });
        } else { // right aligned
          $.extend(functions, {
            next: closeSub,
            previous: openSub,
            down: nextSibling,
            up: prevSibling
          });
        }
      }
      Foundation.Keyboard.handleKey(e, 'DropdownMenu', functions);

    });
  };
  /**
   * Adds an event handler to the body to close any dropdowns on a click.
   * @function
   * @private
   */
  DropdownMenu.prototype._addBodyHandler = function(){
    var $body = $(document.body),
        _this = this;
    $body.off('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu')
         .on('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu', function(e){
           var $link = _this.$element.find(e.target);
           if($link.length){ return; }

           _this._hide();
           $body.off('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu');
         });
  };
  /**
   * Opens a dropdown pane, and checks for collisions first.
   * @param {jQuery} $sub - ul element that is a submenu to show
   * @function
   * @private
   * @fires DropdownMenu#show
   */
  DropdownMenu.prototype._show = function($sub){
    var idx = this.$tabs.index(this.$tabs.filter(function(i, el){
      return $(el).find($sub).length > 0;
    }));
    var $sibs = $sub.parent('li.is-dropdown-submenu-parent').siblings('li.is-dropdown-submenu-parent');
    this._hide($sibs, idx);
    $sub.css('visibility', 'hidden').addClass('js-dropdown-active').attr({'aria-hidden': false})
        .parent('li.is-dropdown-submenu-parent').addClass('is-active')
        .attr({'aria-expanded': true});
    var clear = Foundation.Box.ImNotTouchingYou($sub, null, true);
    if(!clear){
      var oldClass = this.options.alignment === 'left' ? '-right' : '-left',
          $parentLi = $sub.parent('.is-dropdown-submenu-parent');
      $parentLi.removeClass('opens' + oldClass).addClass('opens-' + this.options.alignment);
      clear = Foundation.Box.ImNotTouchingYou($sub, null, true);
      if(!clear){
        $parentLi.removeClass('opens-' + this.options.alignment).addClass('opens-inner');
      }
      this.changed = true;
    }
    $sub.css('visibility', '');
    if(this.options.closeOnClick){ this._addBodyHandler(); }
    /**
     * Fires when the new dropdown pane is visible.
     * @event DropdownMenu#show
     */
    this.$element.trigger('show.zf.dropdownmenu', [$sub]);
  };
  /**
   * Hides a single, currently open dropdown pane, if passed a parameter, otherwise, hides everything.
   * @function
   * @param {jQuery} $elem - element with a submenu to hide
   * @param {Number} idx - index of the $tabs collection to hide
   * @private
   */
  DropdownMenu.prototype._hide = function($elem, idx){
    var $toClose;
    if($elem && $elem.length){
      $toClose = $elem;
    }else if(idx !== undefined){
      $toClose = this.$tabs.not(function(i, el){
        return i === idx;
      });
    }
    else{
      $toClose = this.$element;
    }
    var somethingToClose = $toClose.hasClass('is-active') || $toClose.find('.is-active').length > 0;

    if(somethingToClose){
      $toClose.find('li.is-active').add($toClose).attr({
        'aria-expanded': false,
        'data-is-click': false
      }).removeClass('is-active');

      $toClose.find('ul.js-dropdown-active').attr({
        'aria-hidden': true
      }).removeClass('js-dropdown-active');

      if(this.changed || $toClose.find('opens-inner').length){
        var oldClass = this.options.alignment === 'left' ? 'right' : 'left';
        $toClose.find('li.is-dropdown-submenu-parent').add($toClose)
                .removeClass('opens-inner opens-' + this.options.alignment)
                .addClass('opens-' + oldClass);
        this.changed = false;
      }
      /**
       * Fires when the open menus are closed.
       * @event DropdownMenu#hide
       */
      this.$element.trigger('hide.zf.dropdownmenu', [$toClose]);
    }
  };
  /**
   * Destroys the plugin.
   * @function
   */
  DropdownMenu.prototype.destroy = function(){
    this.$menuItems.off('.zf.dropdownmenu').removeAttr('data-is-click')
        .removeClass('is-right-arrow is-left-arrow is-down-arrow opens-right opens-left opens-inner');
    $(document.body).off('.zf.dropdownmenu');
    Foundation.Nest.Burn(this.$element, 'dropdown');
    Foundation.unregisterPlugin(this);
  };

  Foundation.plugin(DropdownMenu, 'DropdownMenu');
}(jQuery, window.Foundation);

!function(Foundation, $) {
  'use strict';

  /**
   * Creates a new instance of Equalizer.
   * @class
   * @fires Equalizer#init
   * @param {Object} element - jQuery object to add the trigger to.
   * @param {Object} options - Overrides to the default plugin settings.
   */
  function Equalizer(element, options){
    this.$element = element;
    this.options  = $.extend({}, Equalizer.defaults, this.$element.data(), options);

    this._init();

    Foundation.registerPlugin(this, 'Equalizer');
  }

  /**
   * Default settings for plugin
   */
  Equalizer.defaults = {
    /**
     * Enable height equalization when stacked on smaller screens.
     * @option
     * @example true
     */
    equalizeOnStack: true,
    /**
     * Enable height equalization row by row.
     * @option
     * @example false
     */
    equalizeByRow: false,
    /**
     * String representing the minimum breakpoint size the plugin should equalize heights on.
     * @option
     * @example 'medium'
     */
    equalizeOn: ''
  };

  /**
   * Initializes the Equalizer plugin and calls functions to get equalizer functioning on load.
   * @private
   */
  Equalizer.prototype._init = function(){
    var eqId = this.$element.attr('data-equalizer') || '';
    var $watched = this.$element.find('[data-equalizer-watch="' + eqId + '"]');

    this.$watched = $watched.length ? $watched : this.$element.find('[data-equalizer-watch]');
    this.$element.attr('data-resize', (eqId || Foundation.GetYoDigits(6, 'eq')));

    this.hasNested = this.$element.find('[data-equalizer]').length > 0;
    this.isNested = this.$element.parentsUntil(document.body, '[data-equalizer]').length > 0;
    this.isOn = false;

    var imgs = this.$element.find('img');
    var tooSmall;
    if(this.options.equalizeOn){
      tooSmall = this._checkMQ();
      $(window).on('changed.zf.mediaquery', this._checkMQ.bind(this));
    }else{
      this._events();
    }
    if((tooSmall !== undefined && tooSmall === false) || tooSmall === undefined){
      if(imgs.length){
        Foundation.onImagesLoaded(imgs, this._reflow.bind(this));
      }else{
        this._reflow();
      }
    }

  };
  /**
   * Removes event listeners if the breakpoint is too small.
   * @private
   */
  Equalizer.prototype._pauseEvents = function(){
    this.isOn = false;
    this.$element.off('.zf.equalizer resizeme.zf.trigger');
  };
  /**
   * Initializes events for Equalizer.
   * @private
   */
  Equalizer.prototype._events = function(){
    var _this = this;
    this._pauseEvents();
    if(this.hasNested){
      this.$element.on('postequalized.zf.equalizer', function(e){
        if(e.target !== _this.$element[0]){ _this._reflow(); }
      });
    }else{
      this.$element.on('resizeme.zf.trigger', this._reflow.bind(this));
    }
    this.isOn = true;
  };
  /**
   * Checks the current breakpoint to the minimum required size.
   * @private
   */
  Equalizer.prototype._checkMQ = function(){
    var tooSmall = !Foundation.MediaQuery.atLeast(this.options.equalizeOn);
    if(tooSmall){
      if(this.isOn){
        this._pauseEvents();
        this.$watched.css('height', 'auto');
      }
    }else{
      if(!this.isOn){
        this._events();
      }
    }
    return tooSmall;
  };
  /**
   * A noop version for the plugin
   * @private
   */
  Equalizer.prototype._killswitch = function(){
    return;
  };
  /**
   * Calls necessary functions to update Equalizer upon DOM change
   * @private
   */
  Equalizer.prototype._reflow = function(){
    if(!this.options.equalizeOnStack){
      if(this._isStacked()){
        this.$watched.css('height', 'auto');
        return false;
      }
    }
    if (this.options.equalizeByRow) {
      this.getHeightsByRow(this.applyHeightByRow.bind(this));
    }else{
      this.getHeights(this.applyHeight.bind(this));
    }
  };
  /**
   * Manually determines if the first 2 elements are *NOT* stacked.
   * @private
   */
  Equalizer.prototype._isStacked = function(){
    return this.$watched[0].offsetTop !== this.$watched[1].offsetTop;
  };
  /**
   * Finds the outer heights of children contained within an Equalizer parent and returns them in an array
   * @param {Function} cb - A non-optional callback to return the heights array to.
   * @returns {Array} heights - An array of heights of children within Equalizer container
   */
  Equalizer.prototype.getHeights = function(cb){
    var heights = [];
    for(var i = 0, len = this.$watched.length; i < len; i++){
      this.$watched[i].style.height = 'auto';
      heights.push(this.$watched[i].offsetHeight);
    }
    cb(heights);
  };
  /**
   * Finds the outer heights of children contained within an Equalizer parent and returns them in an array
   * @param {Function} cb - A non-optional callback to return the heights array to.
   * @returns {Array} groups - An array of heights of children within Equalizer container grouped by row with element,height and max as last child
   */
  Equalizer.prototype.getHeightsByRow = function(cb) {
    var lastElTopOffset = this.$watched.first().offset().top,
        groups = [],
        group = 0;
    //group by Row
    groups[group] = [];
    for(var i = 0, len = this.$watched.length; i < len; i++){
      this.$watched[i].style.height = 'auto';
      //maybe could use this.$watched[i].offsetTop
      var elOffsetTop = $(this.$watched[i]).offset().top;
      if (elOffsetTop!=lastElTopOffset) {
        group++;
        groups[group] = [];
        lastElTopOffset=elOffsetTop;
      }
      groups[group].push([this.$watched[i],this.$watched[i].offsetHeight]);
    }

    for (var j = 0, ln = groups.length; j < ln; j++) {
      var heights = $(groups[j]).map(function(){ return this[1]; }).get();
      var max         = Math.max.apply(null, heights);
      groups[j].push(max);
    }
    cb(groups);
  };
  /**
   * Changes the CSS height property of each child in an Equalizer parent to match the tallest
   * @param {array} heights - An array of heights of children within Equalizer container
   * @fires Equalizer#preequalized
   * @fires Equalizer#postequalized
   */
  Equalizer.prototype.applyHeight = function(heights){
    var max = Math.max.apply(null, heights);
    /**
     * Fires before the heights are applied
     * @event Equalizer#preequalized
     */
    this.$element.trigger('preequalized.zf.equalizer');

    this.$watched.css('height', max);

    /**
     * Fires when the heights have been applied
     * @event Equalizer#postequalized
     */
     this.$element.trigger('postequalized.zf.equalizer');
  };
  /**
   * Changes the CSS height property of each child in an Equalizer parent to match the tallest by row
   * @param {array} groups - An array of heights of children within Equalizer container grouped by row with element,height and max as last child
   * @fires Equalizer#preequalized
   * @fires Equalizer#preequalizedRow
   * @fires Equalizer#postequalizedRow
   * @fires Equalizer#postequalized
   */
  Equalizer.prototype.applyHeightByRow = function(groups){
    /**
     * Fires before the heights are applied
     */
    this.$element.trigger('preequalized.zf.equalizer');
    for (var i = 0, len = groups.length; i < len ; i++) {
      var groupsILength = groups[i].length,
          max = groups[i][groupsILength - 1];
      if (groupsILength<=2) {
        $(groups[i][0][0]).css({'height':'auto'});
        continue;
      }
      /**
        * Fires before the heights per row are applied
        * @event Equalizer#preequalizedRow
        */
      this.$element.trigger('preequalizedrow.zf.equalizer');
      for (var j = 0, lenJ = (groupsILength-1); j < lenJ ; j++) {
        $(groups[i][j][0]).css({'height':max});
      }
      /**
        * Fires when the heights per row have been applied
        * @event Equalizer#postequalizedRow
        */
      this.$element.trigger('postequalizedrow.zf.equalizer');
    }
    /**
     * Fires when the heights have been applied
     */
     this.$element.trigger('postequalized.zf.equalizer');
  };
  /**
   * Destroys an instance of Equalizer.
   * @function
   */
  Equalizer.prototype.destroy = function(){
    this._pauseEvents();
    this.$watched.css('height', 'auto');

    Foundation.unregisterPlugin(this);
  };

  Foundation.plugin(Equalizer, 'Equalizer');

  // Exports for AMD/Browserify
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Equalizer;
  if (typeof define === 'function')
    define(['foundation'], function() {
      return Equalizer;
    });

}(Foundation, jQuery);

/**
 * Interchange module.
 * @module foundation.interchange
 * @requires foundation.util.mediaQuery
 * @requires foundation.util.timerAndImageLoader
 */
!function(Foundation, $) {
  'use strict';

  /**
   * Creates a new instance of Interchange.
   * @class
   * @fires Interchange#init
   * @param {Object} element - jQuery object to add the trigger to.
   * @param {Object} options - Overrides to the default plugin settings.
   */
  function Interchange(element, options) {
    this.$element = element;
    this.options = $.extend({}, Interchange.defaults, options);
    this.rules = [];
    this.currentPath = '';

    this._init();
    this._events();

    Foundation.registerPlugin(this, 'Interchange');
  }

  /**
   * Default settings for plugin
   */
  Interchange.defaults = {
    /**
     * Rules to be applied to Interchange elements. Set with the `data-interchange` array notation.
     * @option
     */
    rules: null
  };

  Interchange.SPECIAL_QUERIES = {
    'landscape': 'screen and (orientation: landscape)',
    'portrait': 'screen and (orientation: portrait)',
    'retina': 'only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (min--moz-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min-device-pixel-ratio: 2), only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx)'
  };

  /**
   * Initializes the Interchange plugin and calls functions to get interchange functioning on load.
   * @function
   * @private
   */
  Interchange.prototype._init = function() {
    this._addBreakpoints();
    this._generateRules();
    this._reflow();
  };

  /**
   * Initializes events for Interchange.
   * @function
   * @private
   */
  Interchange.prototype._events = function() {
    $(window).on('resize.zf.interchange', Foundation.util.throttle(this._reflow.bind(this), 50));
  };

  /**
   * Calls necessary functions to update Interchange upon DOM change
   * @function
   * @private
   */
  Interchange.prototype._reflow = function() {
    var match;

    // Iterate through each rule, but only save the last match
    for (var i in this.rules) {
      var rule = this.rules[i];

      if (window.matchMedia(rule.query).matches) {
        match = rule;
      }
    }

    if (match) {
      this.replace(match.path);
    }
  };

  /**
   * Gets the Foundation breakpoints and adds them to the Interchange.SPECIAL_QUERIES object.
   * @function
   * @private
   */
  Interchange.prototype._addBreakpoints = function() {
    for (var i in Foundation.MediaQuery.queries) {
      var query = Foundation.MediaQuery.queries[i];
      Interchange.SPECIAL_QUERIES[query.name] = query.value;
    }
  };

  /**
   * Checks the Interchange element for the provided media query + content pairings
   * @function
   * @private
   * @param {Object} element - jQuery object that is an Interchange instance
   * @returns {Array} scenarios - Array of objects that have 'mq' and 'path' keys with corresponding keys
   */
  Interchange.prototype._generateRules = function() {
    var rulesList = [];
    var rules;

    if (this.options.rules) {
      rules = this.options.rules;
    }
    else {
      rules = this.$element.data('interchange').match(/\[.*?\]/g);
    }

    for (var i in rules) {
      var rule = rules[i].slice(1, -1).split(', ');
      var path = rule.slice(0, -1).join('');
      var query = rule[rule.length - 1];

      if (Interchange.SPECIAL_QUERIES[query]) {
        query = Interchange.SPECIAL_QUERIES[query];
      }

      rulesList.push({
        path: path,
        query: query
      });
    }

    this.rules = rulesList;
  };

  /**
   * Update the `src` property of an image, or change the HTML of a container, to the specified path.
   * @function
   * @param {String} path - Path to the image or HTML partial.
   * @fires Interchange#replaced
   */
  Interchange.prototype.replace = function(path) {
    if (this.currentPath === path) return;

    var _this = this,
        trigger = 'replaced.zf.interchange';

    // Replacing images
    if (this.$element[0].nodeName === 'IMG') {
      this.$element.attr('src', path).load(function() {
        _this.currentPath = path;
      })
      .trigger(trigger);
    }
    // Replacing background images
    else if (path.match(/\.(gif|jpg|jpeg|tiff|png)([?#].*)?/i)) {
      this.$element.css({ 'background-image': 'url('+path+')' })
          .trigger(trigger);
    }
    // Replacing HTML
    else {
      $.get(path, function(response) {
        _this.$element.html(response)
             .trigger(trigger);
        $(response).foundation();
        _this.currentPath = path;
      });
    }

    /**
     * Fires when content in an Interchange element is done being loaded.
     * @event Interchange#replaced
     */
    // this.$element.trigger('replaced.zf.interchange');
  };
  /**
   * Destroys an instance of interchange.
   * @function
   */
  Interchange.prototype.destroy = function(){
    //TODO this.
  };
  Foundation.plugin(Interchange, 'Interchange');

  // Exports for AMD/Browserify
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Interchange;
  if (typeof define === 'function')
    define(['foundation'], function() {
      return Interchange;
    });

}(Foundation, jQuery);

/**
 * Magellan module.
 * @module foundation.magellan
 */
!function(Foundation, $) {
  'use strict';

  /**
   * Creates a new instance of Magellan.
   * @class
   * @fires Magellan#init
   * @param {Object} element - jQuery object to add the trigger to.
   * @param {Object} options - Overrides to the default plugin settings.
   */
  function Magellan(element, options) {
    this.$element = element;
    this.options  = $.extend({}, Magellan.defaults, this.$element.data(), options);

    this._init();

    Foundation.registerPlugin(this, 'Magellan');
  }

  /**
   * Default settings for plugin
   */
  Magellan.defaults = {
    /**
     * Amount of time, in ms, the animated scrolling should take between locations.
     * @option
     * @example 500
     */
    animationDuration: 500,
    /**
     * Animation style to use when scrolling between locations.
     * @option
     * @example 'ease-in-out'
     */
    animationEasing: 'linear',
    /**
     * Number of pixels to use as a marker for location changes.
     * @option
     * @example 50
     */
    threshold: 50,
    /**
     * Class applied to the active locations link on the magellan container.
     * @option
     * @example 'active'
     */
    activeClass: 'active',
    /**
     * Allows the script to manipulate the url of the current page, and if supported, alter the history.
     * @option
     * @example true
     */
    deepLinking: false,
    /**
     * Number of pixels to offset the scroll of the page on item click if using a sticky nav bar.
     * @option
     * @example 25
     */
    barOffset: 0
  };

  /**
   * Initializes the Magellan plugin and calls functions to get equalizer functioning on load.
   * @private
   */
  Magellan.prototype._init = function() {
    var id = this.$element[0].id || Foundation.GetYoDigits(6, 'magellan'),
        _this = this;
    this.$targets = $('[data-magellan-target]');
    this.$links = this.$element.find('a');
    this.$element.attr({
      'data-resize': id,
      'data-scroll': id,
      'id': id
    });
    this.$active = $();
    this.scrollPos = parseInt(window.pageYOffset, 10);

    this._events();
  };
  /**
   * Calculates an array of pixel values that are the demarcation lines between locations on the page.
   * Can be invoked if new elements are added or the size of a location changes.
   * @function
   */
  Magellan.prototype.calcPoints = function(){
    var _this = this,
        body = document.body,
        html = document.documentElement;

    this.points = [];
    this.winHeight = Math.round(Math.max(window.innerHeight, html.clientHeight));
    this.docHeight = Math.round(Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight));

    this.$targets.each(function(){
      var $tar = $(this),
          pt = Math.round($tar.offset().top - _this.options.threshold);
      $tar.targetPoint = pt;
      _this.points.push(pt);
    });
  };
  /**
   * Initializes events for Magellan.
   * @private
   */
  Magellan.prototype._events = function() {
    var _this = this,
        $body = $('html, body'),
        opts = {
          duration: _this.options.animationDuration,
          easing:   _this.options.animationEasing
        };
    $(window).one('load', function(){
      if(_this.options.deepLinking){
        if(location.hash){
          _this.scrollToLoc(location.hash);
        }
      }
      _this.calcPoints();
      _this._updateActive();
    });

    this.$element.on({
      'resizeme.zf.trigger': this.reflow.bind(this),
      'scrollme.zf.trigger': this._updateActive.bind(this)
    }).on('click.zf.magellan', 'a[href^="#"]', function(e) {
        e.preventDefault();
        var arrival   = this.getAttribute('href');
        _this.scrollToLoc(arrival);
    });
  };
  /**
   * Function to scroll to a given location on the page.
   * @param {String} loc - a properly formatted jQuery id selector.
   * @example '#foo'
   * @function
   */
  Magellan.prototype.scrollToLoc = function(loc){
    var scrollPos = $(loc).offset().top - this.options.threshold / 2 - this.options.barOffset;

    $(document.body).stop(true).animate({
        scrollTop: scrollPos
      },
      {
        duration: this.options.animationDuration,
        easiing: this.options.animationEasing
     });
  };
  /**
   * Calls necessary functions to update Magellan upon DOM change
   * @function
   */
  Magellan.prototype.reflow = function(){
    this.calcPoints();
    this._updateActive();
  };
  /**
   * Updates the visibility of an active location link, and updates the url hash for the page, if deepLinking enabled.
   * @private
   * @function
   * @fires Magellan#update
   */
  Magellan.prototype._updateActive = function(/*evt, elem, scrollPos*/){
    var winPos = /*scrollPos ||*/ parseInt(window.pageYOffset, 10),
        curIdx;

    if(winPos + this.winHeight === this.docHeight){ curIdx = this.points.length - 1; }
    else if(winPos < this.points[0]){ curIdx = 0; }
    else{
      var isDown = this.scrollPos < winPos,
          _this = this,
          curVisible = this.points.filter(function(p, i){
            return isDown ? p <= winPos : p - _this.options.threshold <= winPos;//&& winPos >= _this.points[i -1] - _this.options.threshold;
          });
      curIdx = curVisible.length ? curVisible.length - 1 : 0;
    }

    this.$active.removeClass(this.options.activeClass);
    this.$active = this.$links.eq(curIdx).addClass(this.options.activeClass);

    if(this.options.deepLinking){
      var hash = this.$active[0].getAttribute('href');
      if(window.history.pushState){
        window.history.pushState(null, null, hash);
      }else{
        window.location.hash = hash;
      }
    }

    this.scrollPos = winPos;
    /**
     * Fires when magellan is finished updating to the new active element.
     * @event Magellan#update
     */
    this.$element.trigger('update.zf.magellan', [this.$active]);
  };
  /**
   * Destroys an instance of Magellan and resets the url of the window.
   * @function
   */
  Magellan.prototype.destroy = function(){
    this.$element.off('.zf.trigger .zf.magellan')
        .find('.' + this.options.activeClass).removeClass(this.options.activeClass);

    if(this.options.deepLinking){
      var hash = this.$active[0].getAttribute('href');
      window.location.hash.replace(hash, '');
    }

    Foundation.unregisterPlugin(this);
  };
  Foundation.plugin(Magellan, 'Magellan');

  // Exports for AMD/Browserify
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Magellan;
  if (typeof define === 'function')
    define(['foundation'], function() {
      return Magellan;
    });

}(Foundation, jQuery);

/**
 * OffCanvas module.
 * @module foundation.offcanvas
 * @requires foundation.util.mediaQuery
 * @requires foundation.util.triggers
 * @requires foundation.util.motion
 */
!function($, Foundation) {

'use strict';

/**
 * Creates a new instance of an off-canvas wrapper.
 * @class
 * @fires OffCanvas#init
 * @param {Object} element - jQuery object to initialize.
 * @param {Object} options - Overrides to the default plugin settings.
 */
function OffCanvas(element, options) {
  this.$element = element;
  this.options = $.extend({}, OffCanvas.defaults, this.$element.data(), options);
  this.$lastTrigger = $();

  this._init();
  this._events();

  Foundation.registerPlugin(this, 'OffCanvas');
}

OffCanvas.defaults = {
  /**
   * Allow the user to click outside of the menu to close it.
   * @option
   * @example true
   */
  closeOnClick: true,
  /**
   * Amount of time in ms the open and close transition requires. If none selected, pulls from body style.
   * @option
   * @example 500
   */
  transitionTime: 0,
  /**
   * Direction the offcanvas opens from. Determines class applied to body.
   * @option
   * @example left
   */
  position: 'left',
  /**
   * Force the page to scroll to top on open.
   */
  forceTop: true,
  /**
   * Allow the offcanvas to be sticky while open. Does nothing if Sass option `$maincontent-prevent-scroll === true`.
   * Performance in Safari OSX/iOS is not great.
   */
  // isSticky: false,
  /**
   * Allow the offcanvas to remain open for certain breakpoints.
   * @option
   * @example false
   */
  isRevealed: false,
  /**
   * Breakpoint at which to reveal. JS will use a RegExp to target standard classes, if changing classnames, pass your class @`revealClass`.
   * @option
   * @example reveal-for-large
   */
  revealOn: null,
  /**
   * Force focus to the offcanvas on open. If true, will focus the opening trigger on close.
   * @option
   * @example true
   */
  autoFocus: true,
  /**
   * Class used to force an offcanvas to remain open. Foundation defaults for this are `reveal-for-large` & `reveal-for-medium`.
   * @option
   * TODO improve the regex testing for this.
   * @example reveal-for-large
   */
  revealClass: 'reveal-for-',
  /**
   * Triggers optional focus trapping when opening an offcanvas. Sets tabindex of [data-off-canvas-content] to -1 for accessibility purposes.
   * @option
   * @example true
   */
  trapFocus: false
};

/**
 * Initializes the off-canvas wrapper by adding the exit overlay (if needed).
 * @function
 * @private
 */
OffCanvas.prototype._init = function() {
  var id = this.$element.attr('id');

  this.$element.attr('aria-hidden', 'true');

  // Find triggers that affect this element and add aria-expanded to them
  $(document)
    .find('[data-open="'+id+'"], [data-close="'+id+'"], [data-toggle="'+id+'"]')
    .attr('aria-expanded', 'false')
    .attr('aria-controls', id);

  // Add a close trigger over the body if necessary
  if (this.options.closeOnClick){
    if($('.js-off-canvas-exit').length){
      this.$exiter = $('.js-off-canvas-exit');
    }else{
      var exiter = document.createElement('div');
      exiter.setAttribute('class', 'js-off-canvas-exit');
      $('[data-off-canvas-content]').append(exiter);

      this.$exiter = $(exiter);
    }
  }

  this.options.isRevealed = this.options.isRevealed || new RegExp(this.options.revealClass, 'g').test(this.$element[0].className);

  if(this.options.isRevealed){
    this.options.revealOn = this.options.revealOn || this.$element[0].className.match(/(reveal-for-medium|reveal-for-large)/g)[0].split('-')[2];
    this._setMQChecker();
  }
  if(!this.options.transitionTime){
    this.options.transitionTime = parseFloat(window.getComputedStyle($('[data-off-canvas-wrapper]')[0]).transitionDuration) * 1000;
  }
};

/**
 * Adds event handlers to the off-canvas wrapper and the exit overlay.
 * @function
 * @private
 */
OffCanvas.prototype._events = function() {
  this.$element.off('.zf.trigger .zf.offcanvas').on({
    'open.zf.trigger': this.open.bind(this),
    'close.zf.trigger': this.close.bind(this),
    'toggle.zf.trigger': this.toggle.bind(this),
    'keydown.zf.offcanvas': this._handleKeyboard.bind(this)
  });

  if (this.options.closeOnClick && this.$exiter.length) {
    this.$exiter.on({'click.zf.offcanvas': this.close.bind(this)});
  }
};
/**
 * Applies event listener for elements that will reveal at certain breakpoints.
 * @private
 */
OffCanvas.prototype._setMQChecker = function(){
  var _this = this;

  $(window).on('changed.zf.mediaquery', function(){
    if(Foundation.MediaQuery.atLeast(_this.options.revealOn)){
      _this.reveal(true);
    }else{
      _this.reveal(false);
    }
  }).one('load.zf.offcanvas', function(){
    if(Foundation.MediaQuery.atLeast(_this.options.revealOn)){
      _this.reveal(true);
    }
  });
};
/**
 * Handles the revealing/hiding the off-canvas at breakpoints, not the same as open.
 * @param {Boolean} isRevealed - true if element should be revealed.
 * @function
 */
OffCanvas.prototype.reveal = function(isRevealed){
  var $closer = this.$element.find('[data-close]');
  if(isRevealed){
    this.close();
    this.isRevealed = true;
    // if(!this.options.forceTop){
    //   var scrollPos = parseInt(window.pageYOffset);
    //   this.$element[0].style.transform = 'translate(0,' + scrollPos + 'px)';
    // }
    // if(this.options.isSticky){ this._stick(); }
    this.$element.off('open.zf.trigger toggle.zf.trigger');
    if($closer.length){ $closer.hide(); }
  }else{
    this.isRevealed = false;
    // if(this.options.isSticky || !this.options.forceTop){
    //   this.$element[0].style.transform = '';
    //   $(window).off('scroll.zf.offcanvas');
    // }
    this.$element.on({
      'open.zf.trigger': this.open.bind(this),
      'toggle.zf.trigger': this.toggle.bind(this)
    });
    if($closer.length){
      $closer.show();
    }
  }
};

/**
 * Opens the off-canvas menu.
 * @function
 * @param {Object} event - Event object passed from listener.
 * @param {jQuery} trigger - element that triggered the off-canvas to open.
 * @fires OffCanvas#opened
 */
OffCanvas.prototype.open = function(event, trigger) {
  if (this.$element.hasClass('is-open') || this.isRevealed){ return; }
  var _this = this,
      $body = $(document.body);
  $('body').scrollTop(0);
  // window.pageYOffset = 0;

  // if(!this.options.forceTop){
  //   var scrollPos = parseInt(window.pageYOffset);
  //   this.$element[0].style.transform = 'translate(0,' + scrollPos + 'px)';
  //   if(this.$exiter.length){
  //     this.$exiter[0].style.transform = 'translate(0,' + scrollPos + 'px)';
  //   }
  // }
  /**
   * Fires when the off-canvas menu opens.
   * @event OffCanvas#opened
   */
  Foundation.Move(this.options.transitionTime, this.$element, function(){
    $('[data-off-canvas-wrapper]').addClass('is-off-canvas-open is-open-'+ _this.options.position);

    _this.$element
      .addClass('is-open')

    // if(_this.options.isSticky){
    //   _this._stick();
    // }
  });
  this.$element.attr('aria-hidden', 'false')
      .trigger('opened.zf.offcanvas');

  if(this.options.closeOnClick){
    this.$exiter.addClass('is-visible');
  }
  if(trigger){
    this.$lastTrigger = trigger.attr('aria-expanded', 'true');
  }
  if(this.options.autoFocus){
    this.$element.one('finished.zf.animate', function(){
      _this.$element.find('a, button').eq(0).focus();
    });
  }
  if(this.options.trapFocus){
    $('[data-off-canvas-content]').attr('tabindex', '-1');
    this._trapFocus();
  }
};
/**
 * Traps focus within the offcanvas on open.
 * @private
 */
OffCanvas.prototype._trapFocus = function(){
  var focusable = Foundation.Keyboard.findFocusable(this.$element),
      first = focusable.eq(0),
      last = focusable.eq(-1);

  focusable.off('.zf.offcanvas').on('keydown.zf.offcanvas', function(e){
    if(e.which === 9 || e.keycode === 9){
      if(e.target === last[0] && !e.shiftKey){
        e.preventDefault();
        first.focus();
      }
      if(e.target === first[0] && e.shiftKey){
        e.preventDefault();
        last.focus();
      }
    }
  });
};
/**
 * Allows the offcanvas to appear sticky utilizing translate properties.
 * @private
 */
// OffCanvas.prototype._stick = function(){
//   var elStyle = this.$element[0].style;
//
//   if(this.options.closeOnClick){
//     var exitStyle = this.$exiter[0].style;
//   }
//
//   $(window).on('scroll.zf.offcanvas', function(e){
//     console.log(e);
//     var pageY = window.pageYOffset;
//     elStyle.transform = 'translate(0,' + pageY + 'px)';
//     if(exitStyle !== undefined){ exitStyle.transform = 'translate(0,' + pageY + 'px)'; }
//   });
//   // this.$element.trigger('stuck.zf.offcanvas');
// };
/**
 * Closes the off-canvas menu.
 * @function
 * @param {Function} cb - optional cb to fire after closure.
 * @fires OffCanvas#closed
 */
OffCanvas.prototype.close = function(cb) {
  if(!this.$element.hasClass('is-open') || this.isRevealed){ return; }

  var _this = this;

  //  Foundation.Move(this.options.transitionTime, this.$element, function(){
  $('[data-off-canvas-wrapper]').removeClass('is-off-canvas-open is-open-' + _this.options.position);
  _this.$element.removeClass('is-open');
    // Foundation._reflow();
  // });
  this.$element.attr('aria-hidden', 'true')
    /**
     * Fires when the off-canvas menu opens.
     * @event OffCanvas#closed
     */
      .trigger('closed.zf.offcanvas');
  // if(_this.options.isSticky || !_this.options.forceTop){
  //   setTimeout(function(){
  //     _this.$element[0].style.transform = '';
  //     $(window).off('scroll.zf.offcanvas');
  //   }, this.options.transitionTime);
  // }
  if(this.options.closeOnClick){
    this.$exiter.removeClass('is-visible');
  }

  this.$lastTrigger.attr('aria-expanded', 'false');
  if(this.options.trapFocus){
    $('[data-off-canvas-content]').removeAttr('tabindex');
  }

};

/**
 * Toggles the off-canvas menu open or closed.
 * @function
 * @param {Object} event - Event object passed from listener.
 * @param {jQuery} trigger - element that triggered the off-canvas to open.
 */
OffCanvas.prototype.toggle = function(event, trigger) {
  if (this.$element.hasClass('is-open')) {
    this.close(event, trigger);
  }
  else {
    this.open(event, trigger);
  }
};

/**
 * Handles keyboard input when detected. When the escape key is pressed, the off-canvas menu closes, and focus is restored to the element that opened the menu.
 * @function
 * @private
 */
OffCanvas.prototype._handleKeyboard = function(event) {
  if (event.which !== 27) return;

  event.stopPropagation();
  event.preventDefault();
  this.close();
  this.$lastTrigger.focus();
};
/**
 * Destroys the offcanvas plugin.
 * @function
 */
OffCanvas.prototype.destroy = function(){
  this.close();
  this.$element.off('.zf.trigger .zf.offcanvas');
  this.$exiter.off('.zf.offcanvas');

  Foundation.unregisterPlugin(this);
};

Foundation.plugin(OffCanvas, 'OffCanvas');

}(jQuery, Foundation);

/**
* Orbit module.
* @module foundation.orbit
* @requires foundation.util.keyboard
* @requires foundation.util.motion
* @requires foundation.util.timerAndImageLoader
* @requires foundation.util.touch
*/
!function($, Foundation){
  'use strict';
  /**
  * Creates a new instance of an orbit carousel.
  * @class
  * @param {jQuery} element - jQuery object to make into an Orbit Carousel.
  * @param {Object} options - Overrides to the default plugin settings.
  */
  function Orbit(element, options){
    this.$element = element;
    this.options = $.extend({}, Orbit.defaults, this.$element.data(), options);

    this._init();

    Foundation.registerPlugin(this, 'Orbit');
    Foundation.Keyboard.register('Orbit', {
      'ltr': {
        'ARROW_RIGHT': 'next',
        'ARROW_LEFT': 'previous'
      },
      'rtl': {
        'ARROW_LEFT': 'next',
        'ARROW_RIGHT': 'previous'
      }
    });
  }
  Orbit.defaults = {
    /**
    * Tells the JS to loadBullets.
    * @option
    * @example true
    */
    bullets: true,
    /**
    * Tells the JS to apply event listeners to nav buttons
    * @option
    * @example true
    */
    navButtons: true,
    /**
    * motion-ui animation class to apply
    * @option
    * @example 'slide-in-right'
    */
    animInFromRight: 'slide-in-right',
    /**
    * motion-ui animation class to apply
    * @option
    * @example 'slide-out-right'
    */
    animOutToRight: 'slide-out-right',
    /**
    * motion-ui animation class to apply
    * @option
    * @example 'slide-in-left'
    *
    */
    animInFromLeft: 'slide-in-left',
    /**
    * motion-ui animation class to apply
    * @option
    * @example 'slide-out-left'
    */
    animOutToLeft: 'slide-out-left',
    /**
    * Allows Orbit to automatically animate on page load.
    * @option
    * @example true
    */
    autoPlay: true,
    /**
    * Amount of time, in ms, between slide transitions
    * @option
    * @example 5000
    */
    timerDelay: 5000,
    /**
    * Allows Orbit to infinitely loop through the slides
    * @option
    * @example true
    */
    infiniteWrap: true,
    /**
    * Allows the Orbit slides to bind to swipe events for mobile, requires an additional util library
    * @option
    * @example true
    */
    swipe: true,
    /**
    * Allows the timing function to pause animation on hover.
    * @option
    * @example true
    */
    pauseOnHover: true,
    /**
    * Allows Orbit to bind keyboard events to the slider, to animate frames with arrow keys
    * @option
    * @example true
    */
    accessible: true,
    /**
    * Class applied to the container of Orbit
    * @option
    * @example 'orbit-container'
    */
    containerClass: 'orbit-container',
    /**
    * Class applied to individual slides.
    * @option
    * @example 'orbit-slide'
    */
    slideClass: 'orbit-slide',
    /**
    * Class applied to the bullet container. You're welcome.
    * @option
    * @example 'orbit-bullets'
    */
    boxOfBullets: 'orbit-bullets',
    /**
    * Class applied to the `next` navigation button.
    * @option
    * @example 'orbit-next'
    */
    nextClass: 'orbit-next',
    /**
    * Class applied to the `previous` navigation button.
    * @option
    * @example 'orbit-previous'
    */
    prevClass: 'orbit-previous',
    /**
    * Boolean to flag the js to use motion ui classes or not. Default to true for backwards compatability.
    * @option
    * @example true
    */
    useMUI: true
  };
  /**
  * Initializes the plugin by creating jQuery collections, setting attributes, and starting the animation.
  * @function
  * @private
  */
  Orbit.prototype._init = function(){
    this.$wrapper = this.$element.find('.' + this.options.containerClass);
    this.$slides = this.$element.find('.' + this.options.slideClass);
    var $images = this.$element.find('img'),
    initActive = this.$slides.filter('.is-active');

    if(!initActive.length){
      this.$slides.eq(0).addClass('is-active');
    }
    if(!this.options.useMUI){
      this.$slides.addClass('no-motionui');
    }
    if($images.length){
      Foundation.onImagesLoaded($images, this._prepareForOrbit.bind(this));
    }else{
      this._prepareForOrbit();//hehe
    }

    if(this.options.bullets){
      this._loadBullets();
    }

    this._events();

    if(this.options.autoPlay && this.$slides.length > 1){
      this.geoSync();
    }
    if(this.options.accessible){ // allow wrapper to be focusable to enable arrow navigation
      this.$wrapper.attr('tabindex', 0);
    }
  };
  /**
  * Creates a jQuery collection of bullets, if they are being used.
  * @function
  * @private
  */
  Orbit.prototype._loadBullets = function(){
    this.$bullets = this.$element.find('.' + this.options.boxOfBullets).find('button');
  };
  /**
  * Sets a `timer` object on the orbit, and starts the counter for the next slide.
  * @function
  */
  Orbit.prototype.geoSync = function(){
    var _this = this;
    this.timer = new Foundation.Timer(
      this.$element,
      {duration: this.options.timerDelay,
        infinite: false},
        function(){
          _this.changeSlide(true);
        });
        this.timer.start();
      };
      /**
      * Sets wrapper and slide heights for the orbit.
      * @function
      * @private
      */
      Orbit.prototype._prepareForOrbit = function(){
        var _this = this;
        this._setWrapperHeight(function(max){
          _this._setSlideHeight(max);
        });
      };
      /**
      * Calulates the height of each slide in the collection, and uses the tallest one for the wrapper height.
      * @function
      * @private
      * @param {Function} cb - a callback function to fire when complete.
      */
      Orbit.prototype._setWrapperHeight = function(cb){//rewrite this to `for` loop
        var max = 0, temp, counter = 0;

        this.$slides.each(function(){
          temp = this.getBoundingClientRect().height;
          $(this).attr('data-slide', counter);

          if(counter){//if not the first slide, set css position and display property
            $(this).css({'position': 'relative', 'display': 'none'});
          }
          max = temp > max ? temp : max;
          counter++;
        });

        if(counter === this.$slides.length){
          this.$wrapper.css({'height': max});//only change the wrapper height property once.
          cb(max);//fire callback with max height dimension.
        }
      };
      /**
      * Sets the max-height of each slide.
      * @function
      * @private
      */
      Orbit.prototype._setSlideHeight = function(height){
        this.$slides.each(function(){
          $(this).css('max-height', height);
        });
      };
      /**
      * Adds event listeners to basically everything within the element.
      * @function
      * @private
      */
      Orbit.prototype._events = function(){
        var _this = this;

        //***************************************
        //**Now using custom event - thanks to:**
        //**      Yohai Ararat of Toronto      **
        //***************************************
        if(this.$slides.length > 1){

          if(this.options.swipe){
            this.$slides.off('swipeleft.zf.orbit swiperight.zf.orbit')
            .on('swipeleft.zf.orbit', function(e){
              e.preventDefault();
              _this.changeSlide(true);
            }).on('swiperight.zf.orbit', function(e){
              e.preventDefault();
              _this.changeSlide(false);
            });
          }
          //***************************************

          if(this.options.autoPlay){
            this.$slides.on('click.zf.orbit', function(){
              _this.$element.data('clickedOn', _this.$element.data('clickedOn') ? false : true);
              _this.timer[_this.$element.data('clickedOn') ? 'pause' : 'start']();
            });
            if(this.options.pauseOnHover){
              this.$element.on('mouseenter.zf.orbit', function(){
                _this.timer.pause();
              }).on('mouseleave.zf.orbit', function(){
                if(!_this.$element.data('clickedOn')){
                  _this.timer.start();
                }
              });
            }
          }

          if(this.options.navButtons){
            var $controls = this.$element.find('.' + this.options.nextClass + ', .' + this.options.prevClass);
            $controls.attr('tabindex', 0)
            //also need to handle enter/return and spacebar key presses
            .on('click.zf.orbit touchend.zf.orbit', function(){
              _this.changeSlide($(this).hasClass(_this.options.nextClass));
            });
          }

          if(this.options.bullets){
            this.$bullets.on('click.zf.orbit touchend.zf.orbit', function(){
              if(/is-active/g.test(this.className)){ return false; }//if this is active, kick out of function.
              var idx = $(this).data('slide'),
              ltr = idx > _this.$slides.filter('.is-active').data('slide'),
              $slide = _this.$slides.eq(idx);

              _this.changeSlide(ltr, $slide, idx);
            });
          }

          this.$wrapper.add(this.$bullets).on('keydown.zf.orbit', function(e){
            // handle keyboard event with keyboard util
            Foundation.Keyboard.handleKey(e, 'Orbit', {
              next: function() {
                _this.changeSlide(true);
              },
              previous: function() {
                _this.changeSlide(false);
              },
              handled: function() { // if bullet is focused, make sure focus moves
                if ($(e.target).is(_this.$bullets)) {
                  _this.$bullets.filter('.is-active').focus();
                }
              }
            });
          });
        }
      };
      /**
      * Changes the current slide to a new one.
      * @function
      * @param {Boolean} isLTR - flag if the slide should move left to right.
      * @param {jQuery} chosenSlide - the jQuery element of the slide to show next, if one is selected.
      * @param {Number} idx - the index of the new slide in its collection, if one chosen.
      * @fires Orbit#slidechange
      */
      Orbit.prototype.changeSlide = function(isLTR, chosenSlide, idx){
        var $curSlide = this.$slides.filter('.is-active').eq(0);

        if(/mui/g.test($curSlide[0].className)){ return false; }//if the slide is currently animating, kick out of the function

        var $firstSlide = this.$slides.first(),
        $lastSlide = this.$slides.last(),
        dirIn = isLTR ? 'Right' : 'Left',
        dirOut = isLTR ? 'Left' : 'Right',
        _this = this,
        $newSlide;

        if(!chosenSlide){//most of the time, this will be auto played or clicked from the navButtons.
          $newSlide = isLTR ? //if wrapping enabled, check to see if there is a `next` or `prev` sibling, if not, select the first or last slide to fill in. if wrapping not enabled, attempt to select `next` or `prev`, if there's nothing there, the function will kick out on next step. CRAZY NESTED TERNARIES!!!!!
          (this.options.infiniteWrap ? $curSlide.next('.' + this.options.slideClass).length ? $curSlide.next('.' + this.options.slideClass) : $firstSlide : $curSlide.next('.' + this.options.slideClass))//pick next slide if moving left to right
          :
          (this.options.infiniteWrap ? $curSlide.prev('.' + this.options.slideClass).length ? $curSlide.prev('.' + this.options.slideClass) : $lastSlide : $curSlide.prev('.' + this.options.slideClass));//pick prev slide if moving right to left
        }else{
          $newSlide = chosenSlide;
        }
        if($newSlide.length){
          if(this.options.bullets){
            idx = idx || this.$slides.index($newSlide);//grab index to update bullets
            this._updateBullets(idx);
          }
          if(this.options.useMUI){

            Foundation.Motion.animateIn(
              $newSlide.addClass('is-active').css({'position': 'absolute', 'top': 0}),
              this.options['animInFrom' + dirIn],
              function(){
                $newSlide.css({'position': 'relative', 'display': 'block'})
                .attr('aria-live', 'polite');
              });

              Foundation.Motion.animateOut(
                $curSlide.removeClass('is-active'),
                this.options['animOutTo' + dirOut],
                function(){
                  $curSlide.removeAttr('aria-live');
                  if(_this.options.autoPlay && !_this.timer.isPaused){
                    _this.timer.restart();
                  }
                  //do stuff?
                });
              }else{
                $curSlide.removeClass('is-active is-in').removeAttr('aria-live').hide();
                $newSlide.addClass('is-active is-in').attr('aria-live', 'polite').show();
                if(this.options.autoPlay && !this.timer.isPaused){
                  this.timer.restart();
                }
              }
              /**
              * Triggers when the slide has finished animating in.
              * @event Orbit#slidechange
              */
              this.$element.trigger('slidechange.zf.orbit', [$newSlide]);
            }
          };
          /**
          * Updates the active state of the bullets, if displayed.
          * @function
          * @private
          * @param {Number} idx - the index of the current slide.
          */
          Orbit.prototype._updateBullets = function(idx){
            var $oldBullet = this.$element.find('.' + this.options.boxOfBullets)
            .find('.is-active').removeClass('is-active').blur(),
            span = $oldBullet.find('span:last').detach(),
            $newBullet = this.$bullets.eq(idx).addClass('is-active').append(span);
          };
          /**
          * Destroys the carousel and hides the element.
          * @function
          */
          Orbit.prototype.destroy = function(){
            this.$element.off('.zf.orbit').find('*').off('.zf.orbit').end().hide();
            Foundation.unregisterPlugin(this);
          };

          Foundation.plugin(Orbit, 'Orbit');

        }(jQuery, window.Foundation);

/**
 * ResponsiveMenu module.
 * @module foundation.responsiveMenu
 * @requires foundation.util.triggers
 * @requires foundation.util.mediaQuery
 * @requires foundation.util.accordionMenu
 * @requires foundation.util.drilldown
 * @requires foundation.util.dropdown-menu
 */
!function(Foundation, $) {
  'use strict';

  // The plugin matches the plugin classes with these plugin instances.
  var MenuPlugins = {
    dropdown: {
      cssClass: 'dropdown',
      plugin: Foundation._plugins['dropdown-menu'] || null
    },
    drilldown: {
      cssClass: 'drilldown',
      plugin: Foundation._plugins['drilldown'] || null
    },
    accordion: {
      cssClass: 'accordion-menu',
      plugin: Foundation._plugins['accordion-menu'] || null
    }
  };

  /**
   * Creates a new instance of a responsive menu.
   * @class
   * @fires ResponsiveMenu#init
   * @param {jQuery} element - jQuery object to make into a dropdown menu.
   * @param {Object} options - Overrides to the default plugin settings.
   */
  function ResponsiveMenu(element) {
    this.$element = $(element);
    this.rules = this.$element.data('responsive-menu');
    this.currentMq = null;
    this.currentPlugin = null;

    this._init();
    this._events();

    Foundation.registerPlugin(this, 'ResponsiveMenu');
  }

  ResponsiveMenu.defaults = {};

  /**
   * Initializes the Menu by parsing the classes from the 'data-ResponsiveMenu' attribute on the element.
   * @function
   * @private
   */
  ResponsiveMenu.prototype._init = function() {
    var rulesTree = {};

    // Parse rules from "classes" in data attribute
    var rules = this.rules.split(' ');

    // Iterate through every rule found
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i].split('-');
      var ruleSize = rule.length > 1 ? rule[0] : 'small';
      var rulePlugin = rule.length > 1 ? rule[1] : rule[0];

      if (MenuPlugins[rulePlugin] !== null) {
        rulesTree[ruleSize] = MenuPlugins[rulePlugin];
      }
    }

    this.rules = rulesTree;

    if (!$.isEmptyObject(rulesTree)) {
      this._checkMediaQueries();
    }
  };

  /**
   * Initializes events for the Menu.
   * @function
   * @private
   */
  ResponsiveMenu.prototype._events = function() {
    var _this = this;

    $(window).on('changed.zf.mediaquery', function() {
      _this._checkMediaQueries();
    });
    // $(window).on('resize.zf.ResponsiveMenu', function() {
    //   _this._checkMediaQueries();
    // });
  };

  /**
   * Checks the current screen width against available media queries. If the media query has changed, and the plugin needed has changed, the plugins will swap out.
   * @function
   * @private
   */
  ResponsiveMenu.prototype._checkMediaQueries = function() {
    var matchedMq, _this = this;
    // Iterate through each rule and find the last matching rule
    $.each(this.rules, function(key) {
      if (Foundation.MediaQuery.atLeast(key)) {
        matchedMq = key;
      }
    });

    // No match? No dice
    if (!matchedMq) return;

    // Plugin already initialized? We good
    if (this.currentPlugin instanceof this.rules[matchedMq].plugin) return;

    // Remove existing plugin-specific CSS classes
    $.each(MenuPlugins, function(key, value) {
      _this.$element.removeClass(value.cssClass);
    });

    // Add the CSS class for the new plugin
    this.$element.addClass(this.rules[matchedMq].cssClass);

    // Create an instance of the new plugin
    if (this.currentPlugin) this.currentPlugin.destroy();
    this.currentPlugin = new this.rules[matchedMq].plugin(this.$element, {});
  };

  /**
   * Destroys the instance of the current plugin on this element, as well as the window resize handler that switches the plugins out.
   * @function
   */
  ResponsiveMenu.prototype.destroy = function() {
    this.currentPlugin.destroy();
    $(window).off('.zf.ResponsiveMenu');
    Foundation.unregisterPlugin(this);
  };
  Foundation.plugin(ResponsiveMenu, 'ResponsiveMenu');

}(Foundation, jQuery);

/**
 * ResponsiveToggle module.
 * @module foundation.responsiveToggle
 * @requires foundation.util.mediaQuery
 */
!function($, Foundation) {

'use strict';

/**
 * Creates a new instance of Tab Bar.
 * @class
 * @fires ResponsiveToggle#init
 * @param {jQuery} element - jQuery object to attach tab bar functionality to.
 * @param {Object} options - Overrides to the default plugin settings.
 */
function ResponsiveToggle(element, options) {
  this.$element = $(element);
  this.options = $.extend({}, ResponsiveToggle.defaults, this.$element.data(), options);

  this._init();
  this._events();

  Foundation.registerPlugin(this, 'ResponsiveToggle');
}

ResponsiveToggle.defaults = {
  /**
   * The breakpoint after which the menu is always shown, and the tab bar is hidden.
   * @option
   * @example 'medium'
   */
  hideFor: 'medium'
};

/**
 * Initializes the tab bar by finding the target element, toggling element, and running update().
 * @function
 * @private
 */
ResponsiveToggle.prototype._init = function() {
  var targetID = this.$element.data('responsive-toggle');
  if (!targetID) {
    console.error('Your tab bar needs an ID of a Menu as the value of data-tab-bar.');
  }

  this.$targetMenu = $('#'+targetID);
  this.$toggler = this.$element.find('[data-toggle]');

  this._update();
};

/**
 * Adds necessary event handlers for the tab bar to work.
 * @function
 * @private
 */
ResponsiveToggle.prototype._events = function() {
  var _this = this;

  $(window).on('changed.zf.mediaquery', this._update.bind(this));

  this.$toggler.on('click.zf.responsiveToggle', this.toggleMenu.bind(this));
};

/**
 * Checks the current media query to determine if the tab bar should be visible or hidden.
 * @function
 * @private
 */
ResponsiveToggle.prototype._update = function() {
  // Mobile
  if (!Foundation.MediaQuery.atLeast(this.options.hideFor)) {
    this.$element.show();
    this.$targetMenu.hide();
  }

  // Desktop
  else {
    this.$element.hide();
    this.$targetMenu.show();
  }
};

/**
 * Toggles the element attached to the tab bar. The toggle only happens if the screen is small enough to allow it.
 * @function
 * @fires ResponsiveToggle#toggled
 */
ResponsiveToggle.prototype.toggleMenu = function() {
  if (!Foundation.MediaQuery.atLeast(this.options.hideFor)) {
    this.$targetMenu.toggle(0);

    /**
     * Fires when the element attached to the tab bar toggles.
     * @event ResponsiveToggle#toggled
     */
    this.$element.trigger('toggled.zf.responsiveToggle');
  }
};
ResponsiveToggle.prototype.destroy = function(){
  //TODO this...
};
Foundation.plugin(ResponsiveToggle, 'ResponsiveToggle');

}(jQuery, Foundation);

/**
 * Reveal module.
 * @module foundation.reveal
 * @requires foundation.util.keyboard
 * @requires foundation.util.box
 * @requires foundation.util.triggers
 * @requires foundation.util.mediaQuery
 * @requires foundation.util.motion if using animations
 */
!function(Foundation, $) {
  'use strict';

  /**
   * Creates a new instance of Reveal.
   * @class
   * @param {jQuery} element - jQuery object to use for the modal.
   * @param {Object} options - optional parameters.
   */

  function Reveal(element, options) {
    this.$element = element;
    this.options = $.extend({}, Reveal.defaults, this.$element.data(), options);
    this._init();

    Foundation.registerPlugin(this, 'Reveal');
    Foundation.Keyboard.register('Reveal', {
      'ENTER': 'open',
      'SPACE': 'open',
      'ESCAPE': 'close',
      'TAB': 'tab_forward',
      'SHIFT_TAB': 'tab_backward'
    });
  }

  Reveal.defaults = {
    /**
     * Motion-UI class to use for animated elements. If none used, defaults to simple show/hide.
     * @option
     * @example 'slide-in-left'
     */
    animationIn: '',
    /**
     * Motion-UI class to use for animated elements. If none used, defaults to simple show/hide.
     * @option
     * @example 'slide-out-right'
     */
    animationOut: '',
    /**
     * Time, in ms, to delay the opening of a modal after a click if no animation used.
     * @option
     * @example 10
     */
    showDelay: 0,
    /**
     * Time, in ms, to delay the closing of a modal after a click if no animation used.
     * @option
     * @example 10
     */
    hideDelay: 0,
    /**
     * Allows a click on the body/overlay to close the modal.
     * @option
     * @example true
     */
    closeOnClick: true,
    /**
     * Allows the modal to close if the user presses the `ESCAPE` key.
     * @option
     * @example true
     */
    closeOnEsc: true,
    /**
     * If true, allows multiple modals to be displayed at once.
     * @option
     * @example false
     */
    multipleOpened: false,
    /**
     * Distance, in pixels, the modal should push down from the top of the screen.
     * @option
     * @example 100
     */
    vOffset: 100,
    /**
     * Distance, in pixels, the modal should push in from the side of the screen.
     * @option
     * @example 0
     */
    hOffset: 0,
    /**
     * Allows the modal to be fullscreen, completely blocking out the rest of the view. JS checks for this as well.
     * @option
     * @example false
     */
    fullScreen: false,
    /**
     * Percentage of screen height the modal should push up from the bottom of the view.
     * @option
     * @example 10
     */
    btmOffsetPct: 10,
    /**
     * Allows the modal to generate an overlay div, which will cover the view when modal opens.
     * @option
     * @example true
     */
    overlay: true,
    /**
     * Allows the modal to remove and reinject markup on close. Should be true if using video elements w/o using provider's api, otherwise, videos will continue to play in the background.
     * @option
     * @example false
     */
    resetOnClose: false,
    /**
     * Allows the modal to alter the url on open/close, and allows the use of the `back` button to close modals. ALSO, allows a modal to auto-maniacally open on page load IF the hash === the modal's user-set id.
     * @option
     * @example false
     */
    deepLink: false
  };

  /**
   * Initializes the modal by adding the overlay and close buttons, (if selected).
   * @private
   */
  Reveal.prototype._init = function(){
    this.id = this.$element.attr('id');
    this.isActive = false;

    this.$anchor = $('[data-open="' + this.id + '"]').length ? $('[data-open="' + this.id + '"]') : $('[data-toggle="' + this.id + '"]');

    if(this.$anchor.length){
      var anchorId = this.$anchor[0].id || Foundation.GetYoDigits(6, 'reveal');

      this.$anchor.attr({
        'aria-controls': this.id,
        'id': anchorId,
        'aria-haspopup': true,
        'tabindex': 0
      });
      this.$element.attr({'aria-labelledby': anchorId});
    }

    // this.options.fullScreen = this.$element.hasClass('full');
    if(this.options.fullScreen || this.$element.hasClass('full')){
      this.options.fullScreen = true;
      this.options.overlay = false;
    }
    if(this.options.overlay && !this.$overlay){
      this.$overlay = this._makeOverlay(this.id);
    }

    this.$element.attr({
        'role': 'dialog',
        'aria-hidden': true,
        'data-yeti-box': this.id,
        'data-resize': this.id
    });

    this._events();
    if(this.options.deepLink && window.location.hash === ( '#' + this.id)){
      $(window).one('load.zf.reveal', this.open.bind(this));
    }
  };

  /**
   * Creates an overlay div to display behind the modal.
   * @private
   */
  Reveal.prototype._makeOverlay = function(id){
    var $overlay = $('<div></div>')
                    .addClass('reveal-overlay')
                    .attr({'tabindex': -1, 'aria-hidden': true})
                    .appendTo('body');
    if(this.options.closeOnClick){
      $overlay.attr({
        'data-close': id
      });
    }
    return $overlay;
  };

  /**
   * Adds event handlers for the modal.
   * @private
   */
  Reveal.prototype._events = function(){
    var _this = this;

    this.$element.on({
      'open.zf.trigger': this.open.bind(this),
      'close.zf.trigger': this.close.bind(this),
      'toggle.zf.trigger': this.toggle.bind(this),
      'resizeme.zf.trigger': function(){
        if(_this.$element.is(':visible')){
          _this._setPosition(function(){});
        }
      }
    });

    if(this.$anchor.length){
      this.$anchor.on('keydown.zf.reveal', function(e){
        if(e.which === 13 || e.which === 32){
          e.stopPropagation();
          e.preventDefault();
          _this.open();
        }
      });
    }


    if(this.options.closeOnClick && this.options.overlay){
      this.$overlay.off('.zf.reveal').on('click.zf.reveal', this.close.bind(this));
    }
    if(this.options.deepLink){
      $(window).on('popstate.zf.reveal:' + this.id, this._handleState.bind(this));
    }
  };
  /**
   * Handles modal methods on back/forward button clicks or any other event that triggers popstate.
   * @private
   */
  Reveal.prototype._handleState = function(e){
    if(window.location.hash === ( '#' + this.id) && !this.isActive){ this.open(); }
    else{ this.close(); }
  };
  /**
   * Sets the position of the modal before opening
   * @param {Function} cb - a callback function to execute when positioning is complete.
   * @private
   */
  Reveal.prototype._setPosition = function(cb){
    var eleDims = Foundation.Box.GetDimensions(this.$element);
    var elePos = this.options.fullScreen ? 'reveal full' : (eleDims.height >= (0.5 * eleDims.windowDims.height)) ? 'reveal' : 'center';

    if(elePos === 'reveal full'){
      //set to full height/width
      this.$element
          .offset(Foundation.Box.GetOffsets(this.$element, null, elePos, this.options.vOffset))
          .css({
            'height': eleDims.windowDims.height,
            'width': eleDims.windowDims.width
          });
    }else if(!Foundation.MediaQuery.atLeast('medium') || !Foundation.Box.ImNotTouchingYou(this.$element, null, true, false)){
      //if smaller than medium, resize to 100% width minus any custom L/R margin
      this.$element
          .css({
            'width': eleDims.windowDims.width - (this.options.hOffset * 2)
          })
          .offset(Foundation.Box.GetOffsets(this.$element, null, 'center', this.options.vOffset, this.options.hOffset));
      //flag a boolean so we can reset the size after the element is closed.
      this.changedSize = true;
    }else{
      this.$element
          .css({
            'max-height': eleDims.windowDims.height - (this.options.vOffset * (this.options.btmOffsetPct / 100 + 1)),
            'width': ''
          })
          .offset(Foundation.Box.GetOffsets(this.$element, null, elePos, this.options.vOffset));
          //the max height based on a percentage of vertical offset plus vertical offset
    }

    cb();
  };

  /**
   * Opens the modal controlled by `this.$anchor`, and closes all others by default.
   * @function
   * @fires Reveal#closeme
   * @fires Reveal#open
   */
  Reveal.prototype.open = function(){
    if(this.options.deepLink){
      var hash = '#' + this.id;

      if(window.history.pushState){
        window.history.pushState(null, null, hash);
      }else{
        window.location.hash = hash;
      }
    }

    var _this = this;
    this.isActive = true;
    //make element invisible, but remove display: none so we can get size and positioning
    this.$element
        .css({'visibility': 'hidden'})
        .show()
        .scrollTop(0);

    this._setPosition(function(){
      _this.$element.hide()
                   .css({'visibility': ''});
      if(!_this.options.multipleOpened){
        /**
         * Fires immediately before the modal opens.
         * Closes any other modals that are currently open
         * @event Reveal#closeme
         */
        _this.$element.trigger('closeme.zf.reveal', _this.id);
      }
      if(_this.options.animationIn){
        if(_this.options.overlay){
          Foundation.Motion.animateIn(_this.$overlay, 'fade-in', function(){
            Foundation.Motion.animateIn(_this.$element, _this.options.animationIn, function(){
              _this.focusableElements = Foundation.Keyboard.findFocusable(_this.$element);
            });
          });
        }else{
          Foundation.Motion.animateIn(_this.$element, _this.options.animationIn, function(){
            _this.focusableElements = Foundation.Keyboard.findFocusable(_this.$element);
          });
        }
      }else{
        if(_this.options.overlay){
          _this.$overlay.show(0, function(){
            _this.$element.show(_this.options.showDelay, function(){
            });
          });
        }else{
          _this.$element.show(_this.options.showDelay, function(){
          });
        }
      }
    });


    // handle accessibility
    this.$element.attr({'aria-hidden': false}).attr('tabindex', -1).focus()
    /**
     * Fires when the modal has successfully opened.
     * @event Reveal#open
     */
                 .trigger('open.zf.reveal');

    $('body').addClass('is-reveal-open')
             .attr({'aria-hidden': (this.options.overlay || this.options.fullScreen) ? true : false});
    setTimeout(function(){
      _this._extraHandlers();
    }, 0);
  };

  /**
   * Adds extra event handlers for the body and window if necessary.
   * @private
   */
  Reveal.prototype._extraHandlers = function(){
    var _this = this;
    this.focusableElements = Foundation.Keyboard.findFocusable(this.$element);

    if(!this.options.overlay && this.options.closeOnClick && !this.options.fullScreen){
      $('body').on('click.zf.reveal', function(e){
        if(e.target === _this.$element[0] || $.contains(_this.$element[0], e.target)){ return; }
        _this.close();
      });
    }
    if(this.options.closeOnEsc){
      $(window).on('keydown.zf.reveal', function(e){
        Foundation.Keyboard.handleKey(e, 'Reveal', {
          close: function() {
            if (_this.options.closeOnEsc) {
              _this.close();
              _this.$anchor.focus();
            }
          }
        });
        if (_this.focusableElements.length === 0) { // no focusable elements inside the modal at all, prevent tabbing in general
          e.preventDefault();
        }
      });
    }

    // lock focus within modal while tabbing
    this.$element.on('keydown.zf.reveal', function(e) {
      var $target = $(this);
      // handle keyboard event with keyboard util
      Foundation.Keyboard.handleKey(e, 'Reveal', {
        tab_forward: function() {
          if (_this.$element.find(':focus').is(_this.focusableElements.eq(-1))) { // left modal downwards, setting focus to first element
            _this.focusableElements.eq(0).focus();
            e.preventDefault();
          }
        },
        tab_backward: function() {
          if (_this.$element.find(':focus').is(_this.focusableElements.eq(0)) || _this.$element.is(':focus')) { // left modal upwards, setting focus to last element
            _this.focusableElements.eq(-1).focus();
            e.preventDefault();
          }
        },
        open: function() {
          if (_this.$element.find(':focus').is(_this.$element.find('[data-close]'))) {
            setTimeout(function() { // set focus back to anchor if close button has been activated
              _this.$anchor.focus();
            }, 1);
          } else if ($target.is(_this.focusableElements)) { // dont't trigger if acual element has focus (i.e. inputs, links, ...)
            _this.open();
          }
        },
        close: function() {
          if (_this.options.closeOnEsc) {
            _this.close();
            _this.$anchor.focus();
          }
        }
      });
    });

  };

  /**
   * Closes the modal.
   * @function
   * @fires Reveal#closed
   */
  Reveal.prototype.close = function(){
    if(!this.isActive || !this.$element.is(':visible')){
      return false;
    }
    var _this = this;

    if(this.options.animationOut){
      Foundation.Motion.animateOut(this.$element, this.options.animationOut, function(){
        if(_this.options.overlay){
          Foundation.Motion.animateOut(_this.$overlay, 'fade-out', finishUp);
        }else{ finishUp(); }
      });
    }else{
      this.$element.hide(_this.options.hideDelay, function(){
        if(_this.options.overlay){
          _this.$overlay.hide(0, finishUp);
        }else{ finishUp(); }
      });
    }
    //conditionals to remove extra event listeners added on open
    if(this.options.closeOnEsc){
      $(window).off('keydown.zf.reveal');
    }
    if(!this.options.overlay && this.options.closeOnClick){
      $('body').off('click.zf.reveal');
    }
    this.$element.off('keydown.zf.reveal');
    function finishUp(){
      //if the modal changed size, reset it
      if(_this.changedSize){
        _this.$element.css({
          'height': '',
          'width': ''
        });
      }
      $('body').removeClass('is-reveal-open').attr({'aria-hidden': false, 'tabindex': ''});
      _this.$element.attr({'aria-hidden': true})
      /**
      * Fires when the modal is done closing.
      * @event Reveal#closed
      */
      .trigger('closed.zf.reveal');
    }


    /**
    * Resets the modal content
    * This prevents a running video to keep going in the background
    */
    if(this.options.resetOnClose) {
      this.$element.html(this.$element.html());
    }

    this.isActive = false;
     if(_this.options.deepLink){
       if(window.history.replaceState){
         window.history.replaceState("", document.title, window.location.pathname);
       }else{
         window.location.hash = '';
       }
     }
  };
  /**
   * Toggles the open/closed state of a modal.
   * @function
   */
  Reveal.prototype.toggle = function(){
    if(this.isActive){
      this.close();
    }else{
      this.open();
    }
  };

  /**
   * Destroys an instance of a modal.
   * @function
   */
  Reveal.prototype.destroy = function() {
    if(this.options.overlay){
      this.$overlay.hide().off().remove();
    }
    this.$element.hide().off();
    this.$anchor.off('.zf');
    $(window).off('.zf.reveal:' + this.id);

    Foundation.unregisterPlugin(this);
  };

  Foundation.plugin(Reveal, 'Reveal');

  // Exports for AMD/Browserify
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Reveal;
  if (typeof define === 'function')
    define(['foundation'], function() {
      return Reveal;
    });

}(Foundation, jQuery);

/**
 * Slider module.
 * @module foundation.slider
 * @requires foundation.util.motion
 * @requires foundation.util.triggers
 * @requires foundation.util.keyboard
 * @requires foundation.util.touch
 */
!function($, Foundation){
  'use strict';

  /**
   * Creates a new instance of a drilldown menu.
   * @class
   * @param {jQuery} element - jQuery object to make into an accordion menu.
   * @param {Object} options - Overrides to the default plugin settings.
   */
  function Slider(element, options){
    this.$element = element;
    this.options = $.extend({}, Slider.defaults, this.$element.data(), options);

    this._init();

    Foundation.registerPlugin(this, 'Slider');
    Foundation.Keyboard.register('Slider', {
      'ltr': {
        'ARROW_RIGHT': 'increase',
        'ARROW_UP': 'increase',
        'ARROW_DOWN': 'decrease',
        'ARROW_LEFT': 'decrease',
        'SHIFT_ARROW_RIGHT': 'increase_fast',
        'SHIFT_ARROW_UP': 'increase_fast',
        'SHIFT_ARROW_DOWN': 'decrease_fast',
        'SHIFT_ARROW_LEFT': 'decrease_fast'
      },
      'rtl': {
        'ARROW_LEFT': 'increase',
        'ARROW_RIGHT': 'decrease',
        'SHIFT_ARROW_LEFT': 'increase_fast',
        'SHIFT_ARROW_RIGHT': 'decrease_fast'
      }
    });
  }

  Slider.defaults = {
    /**
     * Minimum value for the slider scale.
     * @option
     * @example 0
     */
    start: 0,
    /**
     * Maximum value for the slider scale.
     * @option
     * @example 100
     */
    end: 100,
    /**
     * Minimum value change per change event. Not Currently Implemented!

     */
    step: 1,
    /**
     * Value at which the handle/input *(left handle/first input)* should be set to on initialization.
     * @option
     * @example 0
     */
    initialStart: 0,
    /**
     * Value at which the right handle/second input should be set to on initialization.
     * @option
     * @example 100
     */
    initialEnd: 100,
    /**
     * Allows the input to be located outside the container and visible. Set to by the JS
     * @option
     * @example false
     */
    binding: false,
    /**
     * Allows the user to click/tap on the slider bar to select a value.
     * @option
     * @example true
     */
    clickSelect: true,
    /**
     * Set to true and use the `vertical` class to change alignment to vertical.
     * @option
     * @example false
     */
    vertical: false,
    /**
     * Allows the user to drag the slider handle(s) to select a value.
     * @option
     * @example true
     */
    draggable: true,
    /**
     * Disables the slider and prevents event listeners from being applied. Double checked by JS with `disabledClass`.
     * @option
     * @example false
     */
    disabled: false,
    /**
     * Allows the use of two handles. Double checked by the JS. Changes some logic handling.
     * @option
     * @example false
     */
    doubleSided: false,
    /**
     * Potential future feature.
     */
    // steps: 100,
    /**
     * Number of decimal places the plugin should go to for floating point precision.
     * @option
     * @example 2
     */
    decimal: 2,
    /**
     * Time delay for dragged elements.
     */
    // dragDelay: 0,
    /**
     * Time, in ms, to animate the movement of a slider handle if user clicks/taps on the bar. Needs to be manually set if updating the transition time in the Sass settings.
     * @option
     * @example 200
     */
    moveTime: 200,//update this if changing the transition time in the sass
    /**
     * Class applied to disabled sliders.
     * @option
     * @example 'disabled'
     */
    disabledClass: 'disabled',
    invertVertical: false
  };
  /**
   * Initilizes the plugin by reading/setting attributes, creating collections and setting the initial position of the handle(s).
   * @function
   * @private
   */
  Slider.prototype._init = function(){
    this.inputs = this.$element.find('input');
    this.handles = this.$element.find('[data-slider-handle]');

    this.$handle = this.handles.eq(0);
    this.$input = this.inputs.length ? this.inputs.eq(0) : $('#' + this.$handle.attr('aria-controls'));
    this.$fill = this.$element.find('[data-slider-fill]').css(this.options.vertical ? 'height' : 'width', 0);

    var isDbl = false,
        _this = this;
    if(this.options.disabled || this.$element.hasClass(this.options.disabledClass)){
      this.options.disabled = true;
      this.$element.addClass(this.options.disabledClass);
    }
    if(!this.inputs.length){
      this.inputs = $().add(this.$input);
      this.options.binding = true;
    }
    this._setInitAttr(0);
    this._events(this.$handle);

    if(this.handles[1]){
      this.options.doubleSided = true;
      this.$handle2 = this.handles.eq(1);
      this.$input2 = this.inputs.length > 1 ? this.inputs.eq(1) : $('#' + this.$handle2.attr('aria-controls'));

      if(!this.inputs[1]){
        this.inputs = this.inputs.add(this.$input2);
      }
      isDbl = true;

      this._setHandlePos(this.$handle, this.options.initialStart, true, function(){

        _this._setHandlePos(_this.$handle2, _this.options.initialEnd, true);
      });
      // this.$handle.triggerHandler('click.zf.slider');
      this._setInitAttr(1);
      this._events(this.$handle2);
    }

    if(!isDbl){
      this._setHandlePos(this.$handle, this.options.initialStart, true);
    }
  };
  /**
   * Sets the position of the selected handle and fill bar.
   * @function
   * @private
   * @param {jQuery} $hndl - the selected handle to move.
   * @param {Number} location - floating point between the start and end values of the slider bar.
   * @param {Function} cb - callback function to fire on completion.
   * @fires Slider#moved
   */
  Slider.prototype._setHandlePos = function($hndl, location, noInvert, cb){
  //might need to alter that slightly for bars that will have odd number selections.
    location = parseFloat(location);//on input change events, convert string to number...grumble.

    // prevent slider from running out of bounds, if value exceeds the limits set through options, override the value to min/max
    if(location < this.options.start){ location = this.options.start; }
    else if(location > this.options.end){ location = this.options.end; }

    var isDbl = this.options.doubleSided;

    if(isDbl){ //this block is to prevent 2 handles from crossing eachother. Could/should be improved.
      if(this.handles.index($hndl) === 0){
        var h2Val = parseFloat(this.$handle2.attr('aria-valuenow'));
        location = location >= h2Val ? h2Val - this.options.step : location;
      }else{
        var h1Val = parseFloat(this.$handle.attr('aria-valuenow'));
        location = location <= h1Val ? h1Val + this.options.step : location;
      }
    }

    //this is for single-handled vertical sliders, it adjusts the value to account for the slider being "upside-down"
    //for click and drag events, it's weird due to the scale(-1, 1) css property
    if(this.options.vertical && !noInvert){
      location = this.options.end - location;
    }

    var _this = this,
        vert = this.options.vertical,
        hOrW = vert ? 'height' : 'width',
        lOrT = vert ? 'top' : 'left',
        handleDim = $hndl[0].getBoundingClientRect()[hOrW],
        elemDim = this.$element[0].getBoundingClientRect()[hOrW],
        //percentage of bar min/max value based on click or drag point
        pctOfBar = percent(location, this.options.end).toFixed(2),
        //number of actual pixels to shift the handle, based on the percentage obtained above
        pxToMove = (elemDim - handleDim) * pctOfBar,
        //percentage of bar to shift the handle
        movement = (percent(pxToMove, elemDim) * 100).toFixed(this.options.decimal),
        //fixing the decimal value for the location number, is passed to other methods as a fixed floating-point value
        location = parseFloat(location.toFixed(this.options.decimal)),
        // declare empty object for css adjustments, only used with 2 handled-sliders
        css = {};

    this._setValues($hndl, location);

    // TODO update to calculate based on values set to respective inputs??
    if(isDbl){
      var isLeftHndl = this.handles.index($hndl) === 0,
          //empty variable, will be used for min-height/width for fill bar
          dim,
          //percentage w/h of the handle compared to the slider bar
          handlePct =  ~~(percent(handleDim, elemDim) * 100);
      //if left handle, the math is slightly different than if it's the right handle, and the left/top property needs to be changed for the fill bar
      if(isLeftHndl){
        //left or top percentage value to apply to the fill bar.
        css[lOrT] = movement + '%';
        //calculate the new min-height/width for the fill bar.
        dim = parseFloat(this.$handle2[0].style[lOrT]) - movement + handlePct;
        //this callback is necessary to prevent errors and allow the proper placement and initialization of a 2-handled slider
        //plus, it means we don't care if 'dim' isNaN on init, it won't be in the future.
        if(cb && typeof cb === 'function'){ cb(); }//this is only needed for the initialization of 2 handled sliders
      }else{
        //just caching the value of the left/bottom handle's left/top property
        var handlePos = parseFloat(this.$handle[0].style[lOrT]);
        //calculate the new min-height/width for the fill bar. Use isNaN to prevent false positives for numbers <= 0
        //based on the percentage of movement of the handle being manipulated, less the opposing handle's left/top position, plus the percentage w/h of the handle itself
        dim = movement - (isNaN(handlePos) ? this.options.initialStart : handlePos) + handlePct;
      }
      // assign the min-height/width to our css object
      css['min-' + hOrW] = dim + '%';
    }

    this.$element.one('finished.zf.animate', function(){
                    /**
                     * Fires when the handle is done moving.
                     * @event Slider#moved
                     */
                    _this.$element.trigger('moved.zf.slider', [$hndl]);
                });

    //because we don't know exactly how the handle will be moved, check the amount of time it should take to move.
    var moveTime = this.$element.data('dragging') ? 1000/60 : this.options.moveTime;

    Foundation.Move(moveTime, $hndl, function(){
      //adjusting the left/top property of the handle, based on the percentage calculated above
      $hndl.css(lOrT, movement + '%');

      if(!_this.options.doubleSided){
        //if single-handled, a simple method to expand the fill bar
        _this.$fill.css(hOrW, pctOfBar * 100 + '%');
      }else{
        //otherwise, use the css object we created above
        _this.$fill.css(css);
      }
    });

  };
  /**
   * Sets the initial attribute for the slider element.
   * @function
   * @private
   * @param {Number} idx - index of the current handle/input to use.
   */
  Slider.prototype._setInitAttr = function(idx){
    var id = this.inputs.eq(idx).attr('id') || Foundation.GetYoDigits(6, 'slider');
    this.inputs.eq(idx).attr({
      'id': id,
      'max': this.options.end,
      'min': this.options.start

    });
    this.handles.eq(idx).attr({
      'role': 'slider',
      'aria-controls': id,
      'aria-valuemax': this.options.end,
      'aria-valuemin': this.options.start,
      'aria-valuenow': idx === 0 ? this.options.initialStart : this.options.initialEnd,
      'aria-orientation': this.options.vertical ? 'vertical' : 'horizontal',
      'tabindex': 0
    });
  };
  /**
   * Sets the input and `aria-valuenow` values for the slider element.
   * @function
   * @private
   * @param {jQuery} $handle - the currently selected handle.
   * @param {Number} val - floating point of the new value.
   */
  Slider.prototype._setValues = function($handle, val){
    var idx = this.options.doubleSided ? this.handles.index($handle) : 0;
    this.inputs.eq(idx).val(val);
    $handle.attr('aria-valuenow', val);
  };
  /**
   * Handles events on the slider element.
   * Calculates the new location of the current handle.
   * If there are two handles and the bar was clicked, it determines which handle to move.
   * @function
   * @private
   * @param {Object} e - the `event` object passed from the listener.
   * @param {jQuery} $handle - the current handle to calculate for, if selected.
   * @param {Number} val - floating point number for the new value of the slider.
   * TODO clean this up, there's a lot of repeated code between this and the _setHandlePos fn.
   */
  Slider.prototype._handleEvent = function(e, $handle, val){
    var value, hasVal;
    if(!val){//click or drag events
      e.preventDefault();
      var _this = this,
          vertical = this.options.vertical,
          param = vertical ? 'height' : 'width',
          direction = vertical ? 'top' : 'left',
          pageXY = vertical ? e.pageY : e.pageX,
          halfOfHandle = this.$handle[0].getBoundingClientRect()[param] / 2,
          barDim = this.$element[0].getBoundingClientRect()[param],
          barOffset = (this.$element.offset()[direction] -  pageXY),
          //if the cursor position is less than or greater than the elements bounding coordinates, set coordinates within those bounds
          barXY = barOffset > 0 ? -halfOfHandle : (barOffset - halfOfHandle) < -barDim ? barDim : Math.abs(barOffset),
          offsetPct = percent(barXY, barDim);
      value = (this.options.end - this.options.start) * offsetPct;
      // turn everything around for RTL, yay math!
      if (Foundation.rtl() && !this.options.vertical) {value = this.options.end - value;}
      //boolean flag for the setHandlePos fn, specifically for vertical sliders
      hasVal = false;

      if(!$handle){//figure out which handle it is, pass it to the next function.
        var firstHndlPos = absPosition(this.$handle, direction, barXY, param),
            secndHndlPos = absPosition(this.$handle2, direction, barXY, param);
            $handle = firstHndlPos <= secndHndlPos ? this.$handle : this.$handle2;
      }

    }else{//change event on input
      value = val;
      hasVal = true;
    }

    this._setHandlePos($handle, value, hasVal);
  };
  /**
   * Adds event listeners to the slider elements.
   * @function
   * @private
   * @param {jQuery} $handle - the current handle to apply listeners to.
   */
  Slider.prototype._events = function($handle){
    if(this.options.disabled){ return false; }

    var _this = this,
        curHandle,
        timer;

      this.inputs.off('change.zf.slider').on('change.zf.slider', function(e){
        var idx = _this.inputs.index($(this));
        _this._handleEvent(e, _this.handles.eq(idx), $(this).val());
      });

    if(this.options.clickSelect){
      this.$element.off('click.zf.slider').on('click.zf.slider', function(e){
        if(_this.$element.data('dragging')){ return false; }

        if(_this.options.doubleSided){
          _this._handleEvent(e);
        }else{
          _this._handleEvent(e, _this.$handle);
        }
      });
    }

    if(this.options.draggable){
      this.handles.addTouch();

      var $body = $('body');
      $handle
        .off('mousedown.zf.slider')
        .on('mousedown.zf.slider', function(e){
          $handle.addClass('is-dragging');
          _this.$fill.addClass('is-dragging');//
          _this.$element.data('dragging', true);

          curHandle = $(e.currentTarget);

          $body.on('mousemove.zf.slider', function(e){
            e.preventDefault();

            _this._handleEvent(e, curHandle);

          }).on('mouseup.zf.slider', function(e){
            _this._handleEvent(e, curHandle);

            $handle.removeClass('is-dragging');
            _this.$fill.removeClass('is-dragging');
            _this.$element.data('dragging', false);

            $body.off('mousemove.zf.slider mouseup.zf.slider');
          });
      });
    }
    $handle.off('keydown.zf.slider').on('keydown.zf.slider', function(e){
      var _$handle = $(this),
          idx = _this.options.doubleSided ? _this.handles.index(_$handle) : 0,
          oldValue = parseFloat(_this.inputs.eq(idx).val()),
          newValue;


      // handle keyboard event with keyboard util
      Foundation.Keyboard.handleKey(e, 'Slider', {
        decrease: function() {
          newValue = oldValue - _this.options.step;
        },
        increase: function() {
          newValue = oldValue + _this.options.step;
        },
        decrease_fast: function() {
          newValue = oldValue - _this.options.step * 10;
        },
        increase_fast: function() {
          newValue = oldValue + _this.options.step * 10;
        },
        handled: function() { // only set handle pos when event was handled specially
          e.preventDefault();
          _this._setHandlePos(_$handle, newValue, true);
        }
      });
      /*if (newValue) { // if pressed key has special function, update value
        e.preventDefault();
        _this._setHandlePos(_$handle, newValue);
      }*/
    });
  };
  /**
   * Destroys the slider plugin.
   */
   Slider.prototype.destroy = function(){
     this.handles.off('.zf.slider');
     this.inputs.off('.zf.slider');
     this.$element.off('.zf.slider');

     Foundation.unregisterPlugin(this);
   };

  Foundation.plugin(Slider, 'Slider');

  function percent(frac, num){
    return (frac / num);
  }
  function absPosition($handle, dir, clickPos, param){
    return Math.abs(($handle.position()[dir] + ($handle[param]() / 2)) - clickPos);
  }
}(jQuery, window.Foundation);

//*********this is in case we go to static, absolute positions instead of dynamic positioning********
// this.setSteps(function(){
//   _this._events();
//   var initStart = _this.options.positions[_this.options.initialStart - 1] || null;
//   var initEnd = _this.options.initialEnd ? _this.options.position[_this.options.initialEnd - 1] : null;
//   if(initStart || initEnd){
//     _this._handleEvent(initStart, initEnd);
//   }
// });

//***********the other part of absolute positions*************
// Slider.prototype.setSteps = function(cb){
//   var posChange = this.$element.outerWidth() / this.options.steps;
//   var counter = 0
//   while(counter < this.options.steps){
//     if(counter){
//       this.options.positions.push(this.options.positions[counter - 1] + posChange);
//     }else{
//       this.options.positions.push(posChange);
//     }
//     counter++;
//   }
//   cb();
// };

/**
 * Sticky module.
 * @module foundation.sticky
 * @requires foundation.util.triggers
 * @requires foundation.util.mediaQuery
 */
!function($, Foundation){
  'use strict';

  /**
   * Creates a new instance of a sticky thing.
   * @class
   * @param {jQuery} element - jQuery object to make sticky.
   * @param {Object} options - options object passed when creating the element programmatically.
   */
  function Sticky(element, options){
    this.$element = element;
    this.options = $.extend({}, Sticky.defaults, this.$element.data(), options);

    this._init();

    Foundation.registerPlugin(this, 'Sticky');
  }
  Sticky.defaults = {
    /**
     * Customizable container template. Add your own classes for styling and sizing.
     * @option
     * @example '&lt;div data-sticky-container class="small-6 columns"&gt;&lt;/div&gt;'
     */
    container: '<div data-sticky-container></div>',
    /**
     * Location in the view the element sticks to.
     * @option
     * @example 'top'
     */
    stickTo: 'top',
    /**
     * If anchored to a single element, the id of that element.
     * @option
     * @example 'exampleId'
     */
    anchor: '',
    /**
     * If using more than one element as anchor points, the id of the top anchor.
     * @option
     * @example 'exampleId:top'
     */
    topAnchor: '',
    /**
     * If using more than one element as anchor points, the id of the bottom anchor.
     * @option
     * @example 'exampleId:bottom'
     */
    btmAnchor: '',
    /**
     * Margin, in `em`'s to apply to the top of the element when it becomes sticky.
     * @option
     * @example 1
     */
    marginTop: 1,
    /**
     * Margin, in `em`'s to apply to the bottom of the element when it becomes sticky.
     * @option
     * @example 1
     */
    marginBottom: 1,
    /**
     * Breakpoint string that is the minimum screen size an element should become sticky.
     * @option
     * @example 'medium'
     */
    stickyOn: 'medium',
    /**
     * Class applied to sticky element, and removed on destruction. Foundation defaults to `sticky`.
     * @option
     * @example 'sticky'
     */
    stickyClass: 'sticky',
    /**
     * Class applied to sticky container. Foundation defaults to `sticky-container`.
     * @option
     * @example 'sticky-container'
     */
    containerClass: 'sticky-container',
    /**
     * Number of scroll events between the plugin's recalculating sticky points. Setting it to `0` will cause it to recalc every scroll event, setting it to `-1` will prevent recalc on scroll.
     * @option
     * @example 50
     */
    checkEvery: -1
  };

  /**
   * Initializes the sticky element by adding classes, getting/setting dimensions, breakpoints and attributes
   * @function
   * @private
   */
  Sticky.prototype._init = function(){
    var $parent = this.$element.parent('[data-sticky-container]'),
        id = this.$element[0].id || Foundation.GetYoDigits(6, 'sticky'),
        _this = this;

    if(!$parent.length){
      this.wasWrapped = true;
    }
    this.$container = $parent.length ? $parent : $(this.options.container).wrapInner(this.$element);
    this.$container.addClass(this.options.containerClass);


    this.$element.addClass(this.options.stickyClass)
                 .attr({'data-resize': id});

    this.scrollCount = this.options.checkEvery;
    this.isStuck = false;

    if(this.options.anchor !== ''){
      this.$anchor = $('#' + this.options.anchor);
    }else{
      this._parsePoints();
    }

    this._setSizes(function(){
      _this._calc(false);
    });
    this._events(id.split('-').reverse().join('-'));
  };
  /**
   * If using multiple elements as anchors, calculates the top and bottom pixel values the sticky thing should stick and unstick on.
   * @function
   * @private
   */
  Sticky.prototype._parsePoints = function(){
    var top = this.options.topAnchor,
        btm = this.options.btmAnchor,
        pts = [top, btm],
        breaks = {};
    if(top && btm){

      for(var i = 0, len = pts.length; i < len && pts[i]; i++){
        var pt;
        if(typeof pts[i] === 'number'){
          pt = pts[i];
        }else{
          var place = pts[i].split(':'),
              anchor = $('#' + place[0]);

          pt = anchor.offset().top;
          if(place[1] && place[1].toLowerCase() === 'bottom'){
            pt += anchor[0].getBoundingClientRect().height;
          }
        }
        breaks[i] = pt;
      }
    }else{
      breaks = {0: 1, 1: document.documentElement.scrollHeight};
    }

    this.points = breaks;
    return;
  };

  /**
   * Adds event handlers for the scrolling element.
   * @private
   * @param {String} id - psuedo-random id for unique scroll event listener.
   */
  Sticky.prototype._events = function(id){
    var _this = this,
        scrollListener = this.scrollListener = 'scroll.zf.' + id;
    if(this.isOn){ return; }
    if(this.canStick){
      this.isOn = true;
      $(window).off(scrollListener)
               .on(scrollListener, function(e){
                 if(_this.scrollCount === 0){
                   _this.scrollCount = _this.options.checkEvery;
                   _this._setSizes(function(){
                     _this._calc(false, window.pageYOffset);
                   });
                 }else{
                   _this.scrollCount--;
                   _this._calc(false, window.pageYOffset);
                 }
              });
    }

    this.$element.off('resizeme.zf.trigger')
                 .on('resizeme.zf.trigger', function(e, el){
                     _this._setSizes(function(){
                       _this._calc(false);
                       if(_this.canStick){
                         if(!_this.isOn){
                           _this._events(id);
                         }
                       }else if(_this.isOn){
                         _this._pauseListeners(scrollListener);
                       }
                     });
    });
  };

  /**
   * Removes event handlers for scroll and change events on anchor.
   * @fires Sticky#pause
   * @param {String} scrollListener - unique, namespaced scroll listener attached to `window`
   */
  Sticky.prototype._pauseListeners = function(scrollListener){
    this.isOn = false;
    $(window).off(scrollListener);

    /**
     * Fires when the plugin is paused due to resize event shrinking the view.
     * @event Sticky#pause
     * @private
     */
     this.$element.trigger('pause.zf.sticky');
  };

  /**
   * Called on every `scroll` event and on `_init`
   * fires functions based on booleans and cached values
   * @param {Boolean} checkSizes - true if plugin should recalculate sizes and breakpoints.
   * @param {Number} scroll - current scroll position passed from scroll event cb function. If not passed, defaults to `window.pageYOffset`.
   */
  Sticky.prototype._calc = function(checkSizes, scroll){
    if(checkSizes){ this._setSizes(); }

    if(!this.canStick){
      if(this.isStuck){
        this._removeSticky(true);
      }
      return false;
    }

    if(!scroll){ scroll = window.pageYOffset; }

    if(scroll >= this.topPoint){
      if(scroll <= this.bottomPoint){
        if(!this.isStuck){
          this._setSticky();
        }
      }else{
        if(this.isStuck){
          this._removeSticky(false);
        }
      }
    }else{
      if(this.isStuck){
        this._removeSticky(true);
      }
    }
  };
  /**
   * Causes the $element to become stuck.
   * Adds `position: fixed;`, and helper classes.
   * @fires Sticky#stuckto
   * @function
   * @private
   */
  Sticky.prototype._setSticky = function(){
    var stickTo = this.options.stickTo,
        mrgn = stickTo === 'top' ? 'marginTop' : 'marginBottom',
        notStuckTo = stickTo === 'top' ? 'bottom' : 'top',
        css = {};

    css[mrgn] = this.options[mrgn] + 'em';
    css[stickTo] = 0;
    css[notStuckTo] = 'auto';
    css['left'] = this.$container.offset().left + parseInt(window.getComputedStyle(this.$container[0])["padding-left"], 10);
    this.isStuck = true;
    this.$element.removeClass('is-anchored is-at-' + notStuckTo)
                 .addClass('is-stuck is-at-' + stickTo)
                 .css(css)
                 /**
                  * Fires when the $element has become `position: fixed;`
                  * Namespaced to `top` or `bottom`.
                  * @event Sticky#stuckto
                  */
                 .trigger('sticky.zf.stuckto:' + stickTo);
  };

  /**
   * Causes the $element to become unstuck.
   * Removes `position: fixed;`, and helper classes.
   * Adds other helper classes.
   * @param {Boolean} isTop - tells the function if the $element should anchor to the top or bottom of its $anchor element.
   * @fires Sticky#unstuckfrom
   * @private
   */
  Sticky.prototype._removeSticky = function(isTop){
    var stickTo = this.options.stickTo,
        stickToTop = stickTo === 'top',
        css = {},
        anchorPt = (this.points ? this.points[1] - this.points[0] : this.anchorHeight) - this.elemHeight,
        mrgn = stickToTop ? 'marginTop' : 'marginBottom',
        notStuckTo = stickToTop ? 'bottom' : 'top',
        topOrBottom = isTop ? 'top' : 'bottom';

    css[mrgn] = 0;

    if((isTop && !stickToTop) || (stickToTop && !isTop)){
      css[stickTo] = anchorPt;
      css[notStuckTo] = 0;
    }else{
      css[stickTo] = 0;
      css[notStuckTo] = anchorPt;
    }

    css['left'] = '';
    this.isStuck = false;
    this.$element.removeClass('is-stuck is-at-' + stickTo)
                 .addClass('is-anchored is-at-' + topOrBottom)
                 .css(css)
                 /**
                  * Fires when the $element has become anchored.
                  * Namespaced to `top` or `bottom`.
                  * @event Sticky#unstuckfrom
                  */
                 .trigger('sticky.zf.unstuckfrom:' + topOrBottom);
  };

  /**
   * Sets the $element and $container sizes for plugin.
   * Calls `_setBreakPoints`.
   * @param {Function} cb - optional callback function to fire on completion of `_setBreakPoints`.
   * @private
   */
  Sticky.prototype._setSizes = function(cb){
    this.canStick = Foundation.MediaQuery.atLeast(this.options.stickyOn);
    if(!this.canStick){ cb(); }
    var _this = this,
        newElemWidth = this.$container[0].getBoundingClientRect().width,
        comp = window.getComputedStyle(this.$container[0]),
        pdng = parseInt(comp['padding-right'], 10);

    if(this.$anchor && this.$anchor.length){
      this.anchorHeight = this.$anchor[0].getBoundingClientRect().height;
    }else{
      this._parsePoints();
    }

    this.$element.css({
      'max-width': newElemWidth - pdng + 'px'
    });

    var newContainerHeight = this.$element[0].getBoundingClientRect().height || this.containerHeight;
    this.containerHeight = newContainerHeight;
    this.$container.css({
      height: newContainerHeight
    });
    this.elemHeight = newContainerHeight;

  	if (this.isStuck) {
  		this.$element.css({"left":this.$container.offset().left + parseInt(comp['padding-left'], 10)});
  	}

    this._setBreakPoints(newContainerHeight, function(){
      if(cb){ cb(); }
    });

  };
  /**
   * Sets the upper and lower breakpoints for the element to become sticky/unsticky.
   * @param {Number} elemHeight - px value for sticky.$element height, calculated by `_setSizes`.
   * @param {Function} cb - optional callback function to be called on completion.
   * @private
   */
  Sticky.prototype._setBreakPoints = function(elemHeight, cb){
    if(!this.canStick){
      if(cb){ cb(); }
      else{ return false; }
    }
    var mTop = emCalc(this.options.marginTop),
        mBtm = emCalc(this.options.marginBottom),
        topPoint = this.points ? this.points[0] : this.$anchor.offset().top,
        bottomPoint = this.points ? this.points[1] : topPoint + this.anchorHeight,
        // topPoint = this.$anchor.offset().top || this.points[0],
        // bottomPoint = topPoint + this.anchorHeight || this.points[1],
        winHeight = window.innerHeight;

    if(this.options.stickTo === 'top'){
      topPoint -= mTop;
      bottomPoint -= (elemHeight + mTop);
    }else if(this.options.stickTo === 'bottom'){
      topPoint -= (winHeight - (elemHeight + mBtm));
      bottomPoint -= (winHeight - mBtm);
    }else{
      //this would be the stickTo: both option... tricky
    }

    this.topPoint = topPoint;
    this.bottomPoint = bottomPoint;

    if(cb){ cb(); }
  };

  /**
   * Destroys the current sticky element.
   * Resets the element to the top position first.
   * Removes event listeners, JS-added css properties and classes, and unwraps the $element if the JS added the $container.
   * @function
   */
  Sticky.prototype.destroy = function(){
    this._removeSticky(true);

    this.$element.removeClass(this.options.stickyClass + ' is-anchored is-at-top')
                 .css({
                   height: '',
                   top: '',
                   bottom: '',
                   'max-width': ''
                 })
                 .off('resizeme.zf.trigger');

    this.$anchor.off('change.zf.sticky');
    $(window).off(this.scrollListener);

    if(this.wasWrapped){
      this.$element.unwrap();
    }else{
      this.$container.removeClass(this.options.containerClass)
                     .css({
                       height: ''
                     });
    }
    Foundation.unregisterPlugin(this);
  };
  /**
   * Helper function to calculate em values
   * @param Number {em} - number of em's to calculate into pixels
   */
  function emCalc(em){
    return parseInt(window.getComputedStyle(document.body, null).fontSize, 10) * em;
  }
  Foundation.plugin(Sticky, 'Sticky');
}(jQuery, window.Foundation);

/**
 * Tabs module.
 * @module foundation.tabs
 * @requires foundation.util.keyboard
 * @requires foundation.util.timerAndImageLoader if tabs contain images
 */
!function($, Foundation) {
  'use strict';

  /**
   * Creates a new instance of tabs.
   * @class
   * @fires Tabs#init
   * @param {jQuery} element - jQuery object to make into tabs.
   * @param {Object} options - Overrides to the default plugin settings.
   */
  function Tabs(element, options){
    this.$element = element;
    this.options = $.extend({}, Tabs.defaults, this.$element.data(), options);

    this._init();
    Foundation.registerPlugin(this, 'Tabs');
    Foundation.Keyboard.register('Tabs', {
      'ENTER': 'open',
      'SPACE': 'open',
      'ARROW_RIGHT': 'next',
      'ARROW_UP': 'previous',
      'ARROW_DOWN': 'next',
      'ARROW_LEFT': 'previous'
      // 'TAB': 'next',
      // 'SHIFT_TAB': 'previous'
    });
  }

  Tabs.defaults = {
    // /**
    //  * Allows the JS to alter the url of the window. Not yet implemented.
    //  */
    // deepLinking: false,
    // /**
    //  * If deepLinking is enabled, allows the window to scroll to content if window is loaded with a hash including a tab-pane id
    //  */
    // scrollToContent: false,
    /**
     * Allows the window to scroll to content of active pane on load if set to true.
     * @option
     * @example false
     */
    autoFocus: false,
    /**
     * Allows keyboard input to 'wrap' around the tab links.
     * @option
     * @example true
     */
    wrapOnKeys: true,
    /**
     * Allows the tab content panes to match heights if set to true.
     * @option
     * @example false
     */
    matchHeight: false,
    /**
     * Class applied to `li`'s in tab link list.
     * @option
     * @example 'tabs-title'
     */
    linkClass: 'tabs-title',
    // contentClass: 'tabs-content',
    /**
     * Class applied to the content containers.
     * @option
     * @example 'tabs-panel'
     */
    panelClass: 'tabs-panel'
  };

  /**
   * Initializes the tabs by showing and focusing (if autoFocus=true) the preset active tab.
   * @private
   */
  Tabs.prototype._init = function(){
    var _this = this;

    this.$tabTitles = this.$element.find('.' + this.options.linkClass);
    this.$tabContent = $('[data-tabs-content="' + this.$element[0].id + '"]');

    this.$tabTitles.each(function(){
      var $elem = $(this),
          $link = $elem.find('a'),
          isActive = $elem.hasClass('is-active'),
          hash = $link[0].hash.slice(1),
          linkId = $link[0].id ? $link[0].id : hash + '-label',
          $tabContent = $('#' + hash);

      $elem.attr({'role': 'presentation'});

      $link.attr({
        'role': 'tab',
        'aria-controls': hash,
        'aria-selected': isActive,
        'id': linkId
      });

      $tabContent.attr({
        'role': 'tabpanel',
        'aria-hidden': !isActive,
        'aria-labelledby': linkId
      });

      if(isActive && _this.options.autoFocus){
        $link.focus();
      }
    });
    if(this.options.matchHeight){
      var $images = this.$tabContent.find('img');
      if($images.length){
        Foundation.onImagesLoaded($images, this._setHeight.bind(this));
      }else{
        this._setHeight();
      }
    }
    this._events();
  };
  /**
   * Adds event handlers for items within the tabs.
   * @private
   */
   Tabs.prototype._events = function(){
    this._addKeyHandler();
    this._addClickHandler();
    if(this.options.matchHeight){
      $(window).on('changed.zf.mediaquery', this._setHeight.bind(this));
    }
  };

  /**
   * Adds click handlers for items within the tabs.
   * @private
   */
  Tabs.prototype._addClickHandler = function(){
    var _this = this;
    this.$element.off('click.zf.tabs')
                   .on('click.zf.tabs', '.' + this.options.linkClass, function(e){
                     e.preventDefault();
                     e.stopPropagation();
                     if($(this).hasClass('is-active')){
                       return;
                     }
                     _this._handleTabChange($(this));
                   });
  };

  /**
   * Adds keyboard event handlers for items within the tabs.
   * @private
   */
  Tabs.prototype._addKeyHandler = function(){
    var _this = this;
    var $firstTab = _this.$element.find('li:first-of-type');
    var $lastTab = _this.$element.find('li:last-of-type');

    this.$tabTitles.off('keydown.zf.tabs').on('keydown.zf.tabs', function(e){
      if(e.which === 9) return;
      e.stopPropagation();
      e.preventDefault();

      var $element = $(this),
        $elements = $element.parent('ul').children('li'),
        $prevElement,
        $nextElement;

      $elements.each(function(i) {
        if ($(this).is($element)) {
          if (_this.options.wrapOnKeys) {
            $prevElement = i === 0 ? $elements.last() : $elements.eq(i-1);
            $nextElement = i === $elements.length -1 ? $elements.first() : $elements.eq(i+1);
          } else {
            $prevElement = $elements.eq(Math.max(0, i-1));
            $nextElement = $elements.eq(Math.min(i+1, $elements.length-1));
          }
          return;
        }
      });

      // handle keyboard event with keyboard util
      Foundation.Keyboard.handleKey(e, 'Tabs', {
        open: function() {
          $element.find('[role="tab"]').focus();
          _this._handleTabChange($element);
        },
        previous: function() {
          $prevElement.find('[role="tab"]').focus();
          _this._handleTabChange($prevElement);
        },
        next: function() {
          $nextElement.find('[role="tab"]').focus();
          _this._handleTabChange($nextElement);
        }
      });
    });
  };


  /**
   * Opens the tab `$targetContent` defined by `$target`.
   * @param {jQuery} $target - Tab to open.
   * @fires Tabs#change
   * @function
   */
  Tabs.prototype._handleTabChange = function($target){
    var $tabLink = $target.find('[role="tab"]'),
        hash = $tabLink[0].hash,
        $targetContent = $(hash),
        $oldTab = this.$element.find('.' + this.options.linkClass + '.is-active')
                  .removeClass('is-active').find('[role="tab"]')
                  .attr({'aria-selected': 'false'}).attr('aria-controls');

    $('#'+$oldTab).removeClass('is-active').attr({'aria-hidden': 'true'});

    $target.addClass('is-active');

    $tabLink.attr({'aria-selected': 'true'});

    $targetContent
      .addClass('is-active')
      .attr({'aria-hidden': 'false'});

    /**
     * Fires when the plugin has successfully changed tabs.
     * @event Tabs#change
     */
    this.$element.trigger('change.zf.tabs', [$target]);
    // Foundation.reflow(this.$element, 'tabs');
  };

  /**
   * Public method for selecting a content pane to display.
   * @param {jQuery | String} elem - jQuery object or string of the id of the pane to display.
   * @function
   */
  Tabs.prototype.selectTab = function(elem){
    var idStr;
    if(typeof elem === 'object'){
      idStr = elem[0].id;
    }else{
      idStr = elem;
    }

    if(idStr.indexOf('#') < 0){
      idStr = '#' + idStr;
    }
    var $target = this.$tabTitles.find('[href="' + idStr + '"]').parent('.' + this.options.linkClass);

    this._handleTabChange($target);
  };
  /**
   * Sets the height of each panel to the height of the tallest panel.
   * If enabled in options, gets called on media query change.
   * If loading content via external source, can be called directly or with _reflow.
   * @function
   * @private
   */
  Tabs.prototype._setHeight = function(){
    var max = 0;
    this.$tabContent.find('.' + this.options.panelClass)
                    .css('height', '')
                    .each(function(){
                      var panel = $(this),
                          isActive = panel.hasClass('is-active');

                      if(!isActive){
                        panel.css({'visibility': 'hidden', 'display': 'block'});
                      }
                      var temp = this.getBoundingClientRect().height;

                      if(!isActive){
                        panel.css({'visibility': '', 'display': ''});
                      }

                      max = temp > max ? temp : max;
                    })
                    .css('height', max + 'px');
  };

  /**
   * Destroys an instance of an tabs.
   * @fires Tabs#destroyed
   */
  Tabs.prototype.destroy = function() {
    this.$element.find('.' + this.options.linkClass)
                 .off('.zf.tabs').hide().end()
                 .find('.' + this.options.panelClass)
                 .hide();
    if(this.options.matchHeight){
      $(window).off('changed.zf.mediaquery');
    }
    Foundation.unregisterPlugin(this);
  };

  Foundation.plugin(Tabs, 'Tabs');

  function checkClass($elem){
    return $elem.hasClass('is-active');
  }
}(jQuery, window.Foundation);

/**
 * Toggler module.
 * @module foundation.toggler
 * @requires foundation.util.motion
 */

!function(Foundation, $) {
  'use strict';

  /**
   * Creates a new instance of Toggler.
   * @class
   * @fires Toggler#init
   * @param {Object} element - jQuery object to add the trigger to.
   * @param {Object} options - Overrides to the default plugin settings.
   */
  function Toggler(element, options) {
    this.$element = element;
    this.options = $.extend({}, Toggler.defaults, element.data(), options);
    this.className = '';

    this._init();
    this._events();

    Foundation.registerPlugin(this, 'Toggler');
  }

  Toggler.defaults = {
    /**
     * Tells the plugin if the element should animated when toggled.
     * @option
     * @example false
     */
    animate: false
  };

  /**
   * Initializes the Toggler plugin by parsing the toggle class from data-toggler, or animation classes from data-animate.
   * @function
   * @private
   */
  Toggler.prototype._init = function() {
    var input;
    // Parse animation classes if they were set
    if (this.options.animate) {
      input = this.options.animate.split(' ');

      this.animationIn = input[0];
      this.animationOut = input[1] || null;
    }
    // Otherwise, parse toggle class
    else {
      input = this.$element.data('toggler');
      // Allow for a . at the beginning of the string
      this.className = input[0] === '.' ? input.slice(1) : input;
    }

    // Add ARIA attributes to triggers
    var id = this.$element[0].id;
    $('[data-open="'+id+'"], [data-close="'+id+'"], [data-toggle="'+id+'"]')
      .attr('aria-controls', id);
    // If the target is hidden, add aria-hidden
    this.$element.attr('aria-expanded', this.$element.is(':hidden') ? false : true);
  };

  /**
   * Initializes events for the toggle trigger.
   * @function
   * @private
   */
  Toggler.prototype._events = function() {
    this.$element.off('toggle.zf.trigger').on('toggle.zf.trigger', this.toggle.bind(this));
  };

  /**
   * Toggles the target class on the target element. An event is fired from the original trigger depending on if the resultant state was "on" or "off".
   * @function
   * @fires Toggler#on
   * @fires Toggler#off
   */
  Toggler.prototype.toggle = function() {
    this[ this.options.animate ? '_toggleAnimate' : '_toggleClass']();
  };

  Toggler.prototype._toggleClass = function() {
    this.$element.toggleClass(this.className);

    var isOn = this.$element.hasClass(this.className);
    if (isOn) {
      /**
       * Fires if the target element has the class after a toggle.
       * @event Toggler#on
       */
      this.$element.trigger('on.zf.toggler');
    }
    else {
      /**
       * Fires if the target element does not have the class after a toggle.
       * @event Toggler#off
       */
      this.$element.trigger('off.zf.toggler');
    }

    this._updateARIA(isOn);
  };

  Toggler.prototype._toggleAnimate = function() {
    var _this = this;

    if (this.$element.is(':hidden')) {
      Foundation.Motion.animateIn(this.$element, this.animationIn, function() {
        this.trigger('on.zf.toggler');
        _this._updateARIA(true);
      });
    }
    else {
      Foundation.Motion.animateOut(this.$element, this.animationOut, function() {
        this.trigger('off.zf.toggler');
        _this._updateARIA(false);
      });
    }
  };

  Toggler.prototype._updateARIA = function(isOn) {
    this.$element.attr('aria-expanded', isOn ? true : false);
  };

  /**
   * Destroys the instance of Toggler on the element.
   * @function
   */
  Toggler.prototype.destroy= function() {
    this.$element.off('.zf.toggler');
    Foundation.unregisterPlugin(this);
  };

  Foundation.plugin(Toggler, 'Toggler');

  // Exports for AMD/Browserify
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Toggler;
  if (typeof define === 'function')
    define(['foundation'], function() {
      return Toggler;
    });

}(Foundation, jQuery);

/**
 * Tooltip module.
 * @module foundation.tooltip
 * @requires foundation.util.box
 * @requires foundation.util.triggers
 */
!function($, document, Foundation){
  'use strict';

  /**
   * Creates a new instance of a Tooltip.
   * @class
   * @fires Tooltip#init
   * @param {jQuery} element - jQuery object to attach a tooltip to.
   * @param {Object} options - object to extend the default configuration.
   */
  function Tooltip(element, options){
    this.$element = element;
    this.options = $.extend({}, Tooltip.defaults, this.$element.data(), options);

    this.isActive = false;
    this.isClick = false;
    this._init();

    Foundation.registerPlugin(this, 'Tooltip');
  }

  Tooltip.defaults = {
    disableForTouch: false,
    /**
     * Time, in ms, before a tooltip should open on hover.
     * @option
     * @example 200
     */
    hoverDelay: 200,
    /**
     * Time, in ms, a tooltip should take to fade into view.
     * @option
     * @example 150
     */
    fadeInDuration: 150,
    /**
     * Time, in ms, a tooltip should take to fade out of view.
     * @option
     * @example 150
     */
    fadeOutDuration: 150,
    /**
     * Disables hover events from opening the tooltip if set to true
     * @option
     * @example false
     */
    disableHover: false,
    /**
     * Optional addtional classes to apply to the tooltip template on init.
     * @option
     * @example 'my-cool-tip-class'
     */
    templateClasses: '',
    /**
     * Non-optional class added to tooltip templates. Foundation default is 'tooltip'.
     * @option
     * @example 'tooltip'
     */
    tooltipClass: 'tooltip',
    /**
     * Class applied to the tooltip anchor element.
     * @option
     * @example 'has-tip'
     */
    triggerClass: 'has-tip',
    /**
     * Minimum breakpoint size at which to open the tooltip.
     * @option
     * @example 'small'
     */
    showOn: 'small',
    /**
     * Custom template to be used to generate markup for tooltip.
     * @option
     * @example '&lt;div class="tooltip"&gt;&lt;/div&gt;'
     */
    template: '',
    /**
     * Text displayed in the tooltip template on open.
     * @option
     * @example 'Some cool space fact here.'
     */
    tipText: '',
    touchCloseText: 'Tap to close.',
    /**
     * Allows the tooltip to remain open if triggered with a click or touch event.
     * @option
     * @example true
     */
    clickOpen: true,
    /**
     * Additional positioning classes, set by the JS
     * @option
     * @example 'top'
     */
    positionClass: '',
    /**
     * Distance, in pixels, the template should push away from the anchor on the Y axis.
     * @option
     * @example 10
     */
    vOffset: 10,
    /**
     * Distance, in pixels, the template should push away from the anchor on the X axis, if aligned to a side.
     * @option
     * @example 12
     */
    hOffset: 12
  };

  /**
   * Initializes the tooltip by setting the creating the tip element, adding it's text, setting private variables and setting attributes on the anchor.
   * @private
   */
  Tooltip.prototype._init = function(){
    var elemId = this.$element.attr('aria-describedby') || Foundation.GetYoDigits(6, 'tooltip');

    this.options.positionClass = this._getPositionClass(this.$element);
    this.options.tipText = this.options.tipText || this.$element.attr('title');
    this.template = this.options.template ? $(this.options.template) : this._buildTemplate(elemId);

    this.template.appendTo(document.body)
        .text(this.options.tipText)
        .hide();

    this.$element.attr({
      'title': '',
      'aria-describedby': elemId,
      'data-yeti-box': elemId,
      'data-toggle': elemId,
      'data-resize': elemId
    }).addClass(this.triggerClass);

    //helper variables to track movement on collisions
    this.usedPositions = [];
    this.counter = 4;
    this.classChanged = false;

    this._events();
  };

  /**
   * Grabs the current positioning class, if present, and returns the value or an empty string.
   * @private
   */
  Tooltip.prototype._getPositionClass = function(element){
    if(!element){ return ''; }
    // var position = element.attr('class').match(/top|left|right/g);
    var position = element[0].className.match(/\b(top|left|right)\b/g);
        position = position ? position[0] : '';
    return position;
  };
  /**
   * builds the tooltip element, adds attributes, and returns the template.
   * @private
   */
  Tooltip.prototype._buildTemplate = function(id){
    var templateClasses = (this.options.tooltipClass + ' ' + this.options.positionClass + ' ' + this.options.templateClasses).trim();
    var $template =  $('<div></div>').addClass(templateClasses).attr({
      'role': 'tooltip',
      'aria-hidden': true,
      'data-is-active': false,
      'data-is-focus': false,
      'id': id
    });
    return $template;
  };

  /**
   * Function that gets called if a collision event is detected.
   * @param {String} position - positioning class to try
   * @private
   */
  Tooltip.prototype._reposition = function(position){
    this.usedPositions.push(position ? position : 'bottom');

    //default, try switching to opposite side
    if(!position && (this.usedPositions.indexOf('top') < 0)){
      this.template.addClass('top');
    }else if(position === 'top' && (this.usedPositions.indexOf('bottom') < 0)){
      this.template.removeClass(position);
    }else if(position === 'left' && (this.usedPositions.indexOf('right') < 0)){
      this.template.removeClass(position)
          .addClass('right');
    }else if(position === 'right' && (this.usedPositions.indexOf('left') < 0)){
      this.template.removeClass(position)
          .addClass('left');
    }

    //if default change didn't work, try bottom or left first
    else if(!position && (this.usedPositions.indexOf('top') > -1) && (this.usedPositions.indexOf('left') < 0)){
      this.template.addClass('left');
    }else if(position === 'top' && (this.usedPositions.indexOf('bottom') > -1) && (this.usedPositions.indexOf('left') < 0)){
      this.template.removeClass(position)
          .addClass('left');
    }else if(position === 'left' && (this.usedPositions.indexOf('right') > -1) && (this.usedPositions.indexOf('bottom') < 0)){
      this.template.removeClass(position);
    }else if(position === 'right' && (this.usedPositions.indexOf('left') > -1) && (this.usedPositions.indexOf('bottom') < 0)){
      this.template.removeClass(position);
    }
    //if nothing cleared, set to bottom
    else{
      this.template.removeClass(position);
    }
    this.classChanged = true;
    this.counter--;

  };

  /**
   * sets the position class of an element and recursively calls itself until there are no more possible positions to attempt, or the tooltip element is no longer colliding.
   * if the tooltip is larger than the screen width, default to full width - any user selected margin
   * @private
   */
  Tooltip.prototype._setPosition = function(){
    var position = this._getPositionClass(this.template),
        $tipDims = Foundation.Box.GetDimensions(this.template),
        $anchorDims = Foundation.Box.GetDimensions(this.$element),
        direction = (position === 'left' ? 'left' : ((position === 'right') ? 'left' : 'top')),
        param = (direction === 'top') ? 'height' : 'width',
        offset = (param === 'height') ? this.options.vOffset : this.options.hOffset,
        _this = this;

    if(($tipDims.width >= $tipDims.windowDims.width) || (!this.counter && !Foundation.Box.ImNotTouchingYou(this.template))){
      this.template.offset(Foundation.Box.GetOffsets(this.template, this.$element, 'center bottom', this.options.vOffset, this.options.hOffset, true)).css({
      // this.$element.offset(Foundation.GetOffsets(this.template, this.$element, 'center bottom', this.options.vOffset, this.options.hOffset, true)).css({
        'width': $anchorDims.windowDims.width - (this.options.hOffset * 2),
        'height': 'auto'
      });
      return false;
    }

    this.template.offset(Foundation.Box.GetOffsets(this.template, this.$element,'center ' + (position || 'bottom'), this.options.vOffset, this.options.hOffset));

    while(!Foundation.Box.ImNotTouchingYou(this.template) && this.counter){
      this._reposition(position);
      this._setPosition();
    }
  };

  /**
   * reveals the tooltip, and fires an event to close any other open tooltips on the page
   * @fires Tooltip#closeme
   * @fires Tooltip#show
   * @function
   */
  Tooltip.prototype.show = function(){
    if(this.options.showOn !== 'all' && !Foundation.MediaQuery.atLeast(this.options.showOn)){
      // console.error('The screen is too small to display this tooltip');
      return false;
    }

    var _this = this;
    this.template.css('visibility', 'hidden').show();
    this._setPosition();

    /**
     * Fires to close all other open tooltips on the page
     * @event Closeme#tooltip
     */
    this.$element.trigger('closeme.zf.tooltip', this.template.attr('id'));


    this.template.attr({
      'data-is-active': true,
      'aria-hidden': false
    });
    _this.isActive = true;
    // console.log(this.template);
    this.template.stop().hide().css('visibility', '').fadeIn(this.options.fadeInDuration, function(){
      //maybe do stuff?
    });
    /**
     * Fires when the tooltip is shown
     * @event Tooltip#show
     */
    this.$element.trigger('show.zf.tooltip');
  };

  /**
   * Hides the current tooltip, and resets the positioning class if it was changed due to collision
   * @fires Tooltip#hide
   * @function
   */
  Tooltip.prototype.hide = function(){
    // console.log('hiding', this.$element.data('yeti-box'));
    var _this = this;
    this.template.stop().attr({
      'aria-hidden': true,
      'data-is-active': false
    }).fadeOut(this.options.fadeOutDuration, function(){
      _this.isActive = false;
      _this.isClick = false;
      if(_this.classChanged){
        _this.template
             .removeClass(_this._getPositionClass(_this.template))
             .addClass(_this.options.positionClass);

       _this.usedPositions = [];
       _this.counter = 4;
       _this.classChanged = false;
      }
    });
    /**
     * fires when the tooltip is hidden
     * @event Tooltip#hide
     */
    this.$element.trigger('hide.zf.tooltip');
  };

  /**
   * adds event listeners for the tooltip and its anchor
   * TODO combine some of the listeners like focus and mouseenter, etc.
   * @private
   */
  Tooltip.prototype._events = function(){
    var _this = this;
    var $template = this.template;
    var isFocus = false;

    if(!this.options.disableHover){

      this.$element
      .on('mouseenter.zf.tooltip', function(e){
        if(!_this.isActive){
          _this.timeout = setTimeout(function(){
            _this.show();
          }, _this.options.hoverDelay);
        }
      })
      .on('mouseleave.zf.tooltip', function(e){
        clearTimeout(_this.timeout);
        if(!isFocus || (!_this.isClick && _this.options.clickOpen)){
          _this.hide();
        }
      });
    }
    if(this.options.clickOpen){
      this.$element.on('mousedown.zf.tooltip', function(e){
        e.stopImmediatePropagation();
        if(_this.isClick){
          _this.hide();
          // _this.isClick = false;
        }else{
          _this.isClick = true;
          if((_this.options.disableHover || !_this.$element.attr('tabindex')) && !_this.isActive){
            _this.show();
          }
        }
      });
    }

    if(!this.options.disableForTouch){
      this.$element
      .on('tap.zf.tooltip touchend.zf.tooltip', function(e){
        _this.isActive ? _this.hide() : _this.show();
      });
    }

    this.$element.on({
      // 'toggle.zf.trigger': this.toggle.bind(this),
      // 'close.zf.trigger': this.hide.bind(this)
      'close.zf.trigger': this.hide.bind(this)
    });

    this.$element
      .on('focus.zf.tooltip', function(e){
        isFocus = true;
        // console.log(_this.isClick);
        if(_this.isClick){
          return false;
        }else{
          // $(window)
          _this.show();
        }
      })

      .on('focusout.zf.tooltip', function(e){
        isFocus = false;
        _this.isClick = false;
        _this.hide();
      })

      .on('resizeme.zf.trigger', function(){
        if(_this.isActive){
          _this._setPosition();
        }
      });
  };
  /**
   * adds a toggle method, in addition to the static show() & hide() functions
   * @function
   */
  Tooltip.prototype.toggle = function(){
    if(this.isActive){
      this.hide();
    }else{
      this.show();
    }
  };
  /**
   * Destroys an instance of tooltip, removes template element from the view.
   * @function
   */
  Tooltip.prototype.destroy = function(){
    this.$element.attr('title', this.template.text())
                 .off('.zf.trigger .zf.tootip')
                //  .removeClass('has-tip')
                 .removeAttr('aria-describedby')
                 .removeAttr('data-yeti-box')
                 .removeAttr('data-toggle')
                 .removeAttr('data-resize');

    this.template.remove();

    Foundation.unregisterPlugin(this);
  };
  /**
   * TODO utilize resize event trigger
   */

  Foundation.plugin(Tooltip, 'Tooltip');
}(jQuery, window.document, window.Foundation);

'use strict';

// Polyfill for requestAnimationFrame
(function() {
  if (!Date.now)
    Date.now = function() { return new Date().getTime(); };

  var vendors = ['webkit', 'moz'];
  for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
      var vp = vendors[i];
      window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
      window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame']
                                 || window[vp+'CancelRequestAnimationFrame']);
  }
  if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent)
    || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
    var lastTime = 0;
    window.requestAnimationFrame = function(callback) {
        var now = Date.now();
        var nextTime = Math.max(lastTime + 16, now);
        return setTimeout(function() { callback(lastTime = nextTime); },
                          nextTime - now);
    };
    window.cancelAnimationFrame = clearTimeout;
  }
})();

var initClasses   = ['mui-enter', 'mui-leave'];
var activeClasses = ['mui-enter-active', 'mui-leave-active'];

// Find the right "transitionend" event for this browser
var endEvent = (function() {
  var transitions = {
    'transition': 'transitionend',
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'OTransition': 'otransitionend'
  }
  var elem = window.document.createElement('div');

  for (var t in transitions) {
    if (typeof elem.style[t] !== 'undefined') {
      return transitions[t];
    }
  }

  return null;
})();

function animate(isIn, element, animation, cb) {
  element = $(element).eq(0);

  if (!element.length) return;

  if (endEvent === null) {
    isIn ? element.show() : element.hide();
    cb();
    return;
  }

  var initClass = isIn ? initClasses[0] : initClasses[1];
  var activeClass = isIn ? activeClasses[0] : activeClasses[1];

  // Set up the animation
  reset();
  element.addClass(animation);
  element.css('transition', 'none');
  requestAnimationFrame(function() {
    element.addClass(initClass);
    if (isIn) element.show();
  });

  // Start the animation
  requestAnimationFrame(function() {
    element[0].offsetWidth;
    element.css('transition', '');
    element.addClass(activeClass);
  });

  // Clean up the animation when it finishes
  element.one('transitionend', finish);

  // Hides the element (for out animations), resets the element, and runs a callback
  function finish() {
    if (!isIn) element.hide();
    reset();
    if (cb) cb.apply(element);
  }

  // Resets transitions and removes motion-specific classes
  function reset() {
    element[0].style.transitionDuration = 0;
    element.removeClass(initClass + ' ' + activeClass + ' ' + animation);
  }
}

var MotionUI = {
  animateIn: function(element, animation, cb) {
    animate(true, element, animation, cb);
  },

  animateOut: function(element, animation, cb) {
    animate(false, element, animation, cb);
  }
}

jQuery( 'iframe[src*="youtube.com"]').wrap("<div class='flex-video widescreen'/>");
jQuery( 'iframe[src*="vimeo.com"]').wrap("<div class='flex-video widescreen vimeo'/>");

jQuery(document).foundation();
// Joyride demo
$('#start-jr').on('click', function() {
  $(document).foundation('joyride','start');
});
/*! nanoScrollerJS - v0.8.7 - 2015
* http://jamesflorentino.github.com/nanoScrollerJS/
* Copyright (c) 2015 James Florentino; Licensed MIT */
(function(factory) {
  if (typeof define === 'function' && define.amd) {
    return define(['jquery'], function($) {
      return factory($, window, document);
    });
  } else if (typeof exports === 'object') {
    return module.exports = factory(require('jquery'), window, document);
  } else {
    return factory(jQuery, window, document);
  }
})(function($, window, document) {
  "use strict";
  var BROWSER_IS_IE7, BROWSER_SCROLLBAR_WIDTH, DOMSCROLL, DOWN, DRAG, ENTER, KEYDOWN, KEYUP, MOUSEDOWN, MOUSEENTER, MOUSEMOVE, MOUSEUP, MOUSEWHEEL, NanoScroll, PANEDOWN, RESIZE, SCROLL, SCROLLBAR, TOUCHMOVE, UP, WHEEL, cAF, defaults, getBrowserScrollbarWidth, hasTransform, isFFWithBuggyScrollbar, rAF, transform, _elementStyle, _prefixStyle, _vendor;
  defaults = {

    /**
      a classname for the pane element.
      @property paneClass
      @type String
      @default 'nano-pane'
     */
    paneClass: 'nano-pane',

    /**
      a classname for the slider element.
      @property sliderClass
      @type String
      @default 'nano-slider'
     */
    sliderClass: 'nano-slider',

    /**
      a classname for the content element.
      @property contentClass
      @type String
      @default 'nano-content'
     */
    contentClass: 'nano-content',

    /**
      a classname for enabled mode
      @property enabledClass
      @type String
      @default 'has-scrollbar'
     */
    enabledClass: 'has-scrollbar',

    /**
      a classname for flashed mode
      @property flashedClass
      @type String
      @default 'flashed'
     */
    flashedClass: 'flashed',

    /**
      a classname for active mode
      @property activeClass
      @type String
      @default 'active'
     */
    activeClass: 'active',

    /**
      a setting to enable native scrolling in iOS devices.
      @property iOSNativeScrolling
      @type Boolean
      @default false
     */
    iOSNativeScrolling: false,

    /**
      a setting to prevent the rest of the page being
      scrolled when user scrolls the `.content` element.
      @property preventPageScrolling
      @type Boolean
      @default false
     */
    preventPageScrolling: false,

    /**
      a setting to disable binding to the resize event.
      @property disableResize
      @type Boolean
      @default false
     */
    disableResize: false,

    /**
      a setting to make the scrollbar always visible.
      @property alwaysVisible
      @type Boolean
      @default false
     */
    alwaysVisible: false,

    /**
      a default timeout for the `flash()` method.
      @property flashDelay
      @type Number
      @default 1500
     */
    flashDelay: 1500,

    /**
      a minimum height for the `.slider` element.
      @property sliderMinHeight
      @type Number
      @default 20
     */
    sliderMinHeight: 20,

    /**
      a maximum height for the `.slider` element.
      @property sliderMaxHeight
      @type Number
      @default null
     */
    sliderMaxHeight: null,

    /**
      an alternate document context.
      @property documentContext
      @type Document
      @default null
     */
    documentContext: null,

    /**
      an alternate window context.
      @property windowContext
      @type Window
      @default null
     */
    windowContext: null
  };

  /**
    @property SCROLLBAR
    @type String
    @static
    @final
    @private
   */
  SCROLLBAR = 'scrollbar';

  /**
    @property SCROLL
    @type String
    @static
    @final
    @private
   */
  SCROLL = 'scroll';

  /**
    @property MOUSEDOWN
    @type String
    @final
    @private
   */
  MOUSEDOWN = 'mousedown';

  /**
    @property MOUSEENTER
    @type String
    @final
    @private
   */
  MOUSEENTER = 'mouseenter';

  /**
    @property MOUSEMOVE
    @type String
    @static
    @final
    @private
   */
  MOUSEMOVE = 'mousemove';

  /**
    @property MOUSEWHEEL
    @type String
    @final
    @private
   */
  MOUSEWHEEL = 'mousewheel';

  /**
    @property MOUSEUP
    @type String
    @static
    @final
    @private
   */
  MOUSEUP = 'mouseup';

  /**
    @property RESIZE
    @type String
    @final
    @private
   */
  RESIZE = 'resize';

  /**
    @property DRAG
    @type String
    @static
    @final
    @private
   */
  DRAG = 'drag';

  /**
    @property ENTER
    @type String
    @static
    @final
    @private
   */
  ENTER = 'enter';

  /**
    @property UP
    @type String
    @static
    @final
    @private
   */
  UP = 'up';

  /**
    @property PANEDOWN
    @type String
    @static
    @final
    @private
   */
  PANEDOWN = 'panedown';

  /**
    @property DOMSCROLL
    @type String
    @static
    @final
    @private
   */
  DOMSCROLL = 'DOMMouseScroll';

  /**
    @property DOWN
    @type String
    @static
    @final
    @private
   */
  DOWN = 'down';

  /**
    @property WHEEL
    @type String
    @static
    @final
    @private
   */
  WHEEL = 'wheel';

  /**
    @property KEYDOWN
    @type String
    @static
    @final
    @private
   */
  KEYDOWN = 'keydown';

  /**
    @property KEYUP
    @type String
    @static
    @final
    @private
   */
  KEYUP = 'keyup';

  /**
    @property TOUCHMOVE
    @type String
    @static
    @final
    @private
   */
  TOUCHMOVE = 'touchmove';

  /**
    @property BROWSER_IS_IE7
    @type Boolean
    @static
    @final
    @private
   */
  BROWSER_IS_IE7 = window.navigator.appName === 'Microsoft Internet Explorer' && /msie 7./i.test(window.navigator.appVersion) && window.ActiveXObject;

  /**
    @property BROWSER_SCROLLBAR_WIDTH
    @type Number
    @static
    @default null
    @private
   */
  BROWSER_SCROLLBAR_WIDTH = null;
  rAF = window.requestAnimationFrame;
  cAF = window.cancelAnimationFrame;
  _elementStyle = document.createElement('div').style;
  _vendor = (function() {
    var i, transform, vendor, vendors, _i, _len;
    vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'];
    for (i = _i = 0, _len = vendors.length; _i < _len; i = ++_i) {
      vendor = vendors[i];
      transform = vendors[i] + 'ransform';
      if (transform in _elementStyle) {
        return vendors[i].substr(0, vendors[i].length - 1);
      }
    }
    return false;
  })();
  _prefixStyle = function(style) {
    if (_vendor === false) {
      return false;
    }
    if (_vendor === '') {
      return style;
    }
    return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
  };
  transform = _prefixStyle('transform');
  hasTransform = transform !== false;

  /**
    Returns browser's native scrollbar width
    @method getBrowserScrollbarWidth
    @return {Number} the scrollbar width in pixels
    @static
    @private
   */
  getBrowserScrollbarWidth = function() {
    var outer, outerStyle, scrollbarWidth;
    outer = document.createElement('div');
    outerStyle = outer.style;
    outerStyle.position = 'absolute';
    outerStyle.width = '100px';
    outerStyle.height = '100px';
    outerStyle.overflow = SCROLL;
    outerStyle.top = '-9999px';
    document.body.appendChild(outer);
    scrollbarWidth = outer.offsetWidth - outer.clientWidth;
    document.body.removeChild(outer);
    return scrollbarWidth;
  };
  isFFWithBuggyScrollbar = function() {
    var isOSXFF, ua, version;
    ua = window.navigator.userAgent;
    isOSXFF = /(?=.+Mac OS X)(?=.+Firefox)/.test(ua);
    if (!isOSXFF) {
      return false;
    }
    version = /Firefox\/\d{2}\./.exec(ua);
    if (version) {
      version = version[0].replace(/\D+/g, '');
    }
    return isOSXFF && +version > 23;
  };

  /**
    @class NanoScroll
    @param element {HTMLElement|Node} the main element
    @param options {Object} nanoScroller's options
    @constructor
   */
  NanoScroll = (function() {
    function NanoScroll(el, options) {
      this.el = el;
      this.options = options;
      BROWSER_SCROLLBAR_WIDTH || (BROWSER_SCROLLBAR_WIDTH = getBrowserScrollbarWidth());
      this.$el = $(this.el);
      this.doc = $(this.options.documentContext || document);
      this.win = $(this.options.windowContext || window);
      this.body = this.doc.find('body');
      this.$content = this.$el.children("." + this.options.contentClass);
      this.$content.attr('tabindex', this.options.tabIndex || 0);
      this.content = this.$content[0];
      this.previousPosition = 0;
      if (this.options.iOSNativeScrolling && (this.el.style.WebkitOverflowScrolling != null)) {
        this.nativeScrolling();
      } else {
        this.generate();
      }
      this.createEvents();
      this.addEvents();
      this.reset();
    }


    /**
      Prevents the rest of the page being scrolled
      when user scrolls the `.nano-content` element.
      @method preventScrolling
      @param event {Event}
      @param direction {String} Scroll direction (up or down)
      @private
     */

    NanoScroll.prototype.preventScrolling = function(e, direction) {
      if (!this.isActive) {
        return;
      }
      if (e.type === DOMSCROLL) {
        if (direction === DOWN && e.originalEvent.detail > 0 || direction === UP && e.originalEvent.detail < 0) {
          e.preventDefault();
        }
      } else if (e.type === MOUSEWHEEL) {
        if (!e.originalEvent || !e.originalEvent.wheelDelta) {
          return;
        }
        if (direction === DOWN && e.originalEvent.wheelDelta < 0 || direction === UP && e.originalEvent.wheelDelta > 0) {
          e.preventDefault();
        }
      }
    };


    /**
      Enable iOS native scrolling
      @method nativeScrolling
      @private
     */

    NanoScroll.prototype.nativeScrolling = function() {
      this.$content.css({
        WebkitOverflowScrolling: 'touch'
      });
      this.iOSNativeScrolling = true;
      this.isActive = true;
    };


    /**
      Updates those nanoScroller properties that
      are related to current scrollbar position.
      @method updateScrollValues
      @private
     */

    NanoScroll.prototype.updateScrollValues = function() {
      var content, direction;
      content = this.content;
      this.maxScrollTop = content.scrollHeight - content.clientHeight;
      this.prevScrollTop = this.contentScrollTop || 0;
      this.contentScrollTop = content.scrollTop;
      direction = this.contentScrollTop > this.previousPosition ? "down" : this.contentScrollTop < this.previousPosition ? "up" : "same";
      this.previousPosition = this.contentScrollTop;
      if (direction !== "same") {
        this.$el.trigger('update', {
          position: this.contentScrollTop,
          maximum: this.maxScrollTop,
          direction: direction
        });
      }
      if (!this.iOSNativeScrolling) {
        this.maxSliderTop = this.paneHeight - this.sliderHeight;
        this.sliderTop = this.maxScrollTop === 0 ? 0 : this.contentScrollTop * this.maxSliderTop / this.maxScrollTop;
      }
    };


    /**
      Updates CSS styles for current scroll position.
      Uses CSS 2d transfroms and `window.requestAnimationFrame` if available.
      @method setOnScrollStyles
      @private
     */

    NanoScroll.prototype.setOnScrollStyles = function() {
      var cssValue;
      if (hasTransform) {
        cssValue = {};
        cssValue[transform] = "translate(0, " + this.sliderTop + "px)";
      } else {
        cssValue = {
          top: this.sliderTop
        };
      }
      if (rAF) {
        if (cAF && this.scrollRAF) {
          cAF(this.scrollRAF);
        }
        this.scrollRAF = rAF((function(_this) {
          return function() {
            _this.scrollRAF = null;
            return _this.slider.css(cssValue);
          };
        })(this));
      } else {
        this.slider.css(cssValue);
      }
    };


    /**
      Creates event related methods
      @method createEvents
      @private
     */

    NanoScroll.prototype.createEvents = function() {
      this.events = {
        down: (function(_this) {
          return function(e) {
            _this.isBeingDragged = true;
            _this.offsetY = e.pageY - _this.slider.offset().top;
            if (!_this.slider.is(e.target)) {
              _this.offsetY = 0;
            }
            _this.pane.addClass(_this.options.activeClass);
            _this.doc.bind(MOUSEMOVE, _this.events[DRAG]).bind(MOUSEUP, _this.events[UP]);
            _this.body.bind(MOUSEENTER, _this.events[ENTER]);
            return false;
          };
        })(this),
        drag: (function(_this) {
          return function(e) {
            _this.sliderY = e.pageY - _this.$el.offset().top - _this.paneTop - (_this.offsetY || _this.sliderHeight * 0.5);
            _this.scroll();
            if (_this.contentScrollTop >= _this.maxScrollTop && _this.prevScrollTop !== _this.maxScrollTop) {
              _this.$el.trigger('scrollend');
            } else if (_this.contentScrollTop === 0 && _this.prevScrollTop !== 0) {
              _this.$el.trigger('scrolltop');
            }
            return false;
          };
        })(this),
        up: (function(_this) {
          return function(e) {
            _this.isBeingDragged = false;
            _this.pane.removeClass(_this.options.activeClass);
            _this.doc.unbind(MOUSEMOVE, _this.events[DRAG]).unbind(MOUSEUP, _this.events[UP]);
            _this.body.unbind(MOUSEENTER, _this.events[ENTER]);
            return false;
          };
        })(this),
        resize: (function(_this) {
          return function(e) {
            _this.reset();
          };
        })(this),
        panedown: (function(_this) {
          return function(e) {
            _this.sliderY = (e.offsetY || e.originalEvent.layerY) - (_this.sliderHeight * 0.5);
            _this.scroll();
            _this.events.down(e);
            return false;
          };
        })(this),
        scroll: (function(_this) {
          return function(e) {
            _this.updateScrollValues();
            if (_this.isBeingDragged) {
              return;
            }
            if (!_this.iOSNativeScrolling) {
              _this.sliderY = _this.sliderTop;
              _this.setOnScrollStyles();
            }
            if (e == null) {
              return;
            }
            if (_this.contentScrollTop >= _this.maxScrollTop) {
              if (_this.options.preventPageScrolling) {
                _this.preventScrolling(e, DOWN);
              }
              if (_this.prevScrollTop !== _this.maxScrollTop) {
                _this.$el.trigger('scrollend');
              }
            } else if (_this.contentScrollTop === 0) {
              if (_this.options.preventPageScrolling) {
                _this.preventScrolling(e, UP);
              }
              if (_this.prevScrollTop !== 0) {
                _this.$el.trigger('scrolltop');
              }
            }
          };
        })(this),
        wheel: (function(_this) {
          return function(e) {
            var delta;
            if (e == null) {
              return;
            }
            delta = e.delta || e.wheelDelta || (e.originalEvent && e.originalEvent.wheelDelta) || -e.detail || (e.originalEvent && -e.originalEvent.detail);
            if (delta) {
              _this.sliderY += -delta / 3;
            }
            _this.scroll();
            return false;
          };
        })(this),
        enter: (function(_this) {
          return function(e) {
            var _ref;
            if (!_this.isBeingDragged) {
              return;
            }
            if ((e.buttons || e.which) !== 1) {
              return (_ref = _this.events)[UP].apply(_ref, arguments);
            }
          };
        })(this)
      };
    };


    /**
      Adds event listeners with jQuery.
      @method addEvents
      @private
     */

    NanoScroll.prototype.addEvents = function() {
      var events;
      this.removeEvents();
      events = this.events;
      if (!this.options.disableResize) {
        this.win.bind(RESIZE, events[RESIZE]);
      }
      if (!this.iOSNativeScrolling) {
        this.slider.bind(MOUSEDOWN, events[DOWN]);
        this.pane.bind(MOUSEDOWN, events[PANEDOWN]).bind("" + MOUSEWHEEL + " " + DOMSCROLL, events[WHEEL]);
      }
      this.$content.bind("" + SCROLL + " " + MOUSEWHEEL + " " + DOMSCROLL + " " + TOUCHMOVE, events[SCROLL]);
    };


    /**
      Removes event listeners with jQuery.
      @method removeEvents
      @private
     */

    NanoScroll.prototype.removeEvents = function() {
      var events;
      events = this.events;
      this.win.unbind(RESIZE, events[RESIZE]);
      if (!this.iOSNativeScrolling) {
        this.slider.unbind();
        this.pane.unbind();
      }
      this.$content.unbind("" + SCROLL + " " + MOUSEWHEEL + " " + DOMSCROLL + " " + TOUCHMOVE, events[SCROLL]);
    };


    /**
      Generates nanoScroller's scrollbar and elements for it.
      @method generate
      @chainable
      @private
     */

    NanoScroll.prototype.generate = function() {
      var contentClass, cssRule, currentPadding, options, pane, paneClass, sliderClass;
      options = this.options;
      paneClass = options.paneClass, sliderClass = options.sliderClass, contentClass = options.contentClass;
      if (!(pane = this.$el.children("." + paneClass)).length && !pane.children("." + sliderClass).length) {
        this.$el.append("<div class=\"" + paneClass + "\"><div class=\"" + sliderClass + "\" /></div>");
      }
      this.pane = this.$el.children("." + paneClass);
      this.slider = this.pane.find("." + sliderClass);
      if (BROWSER_SCROLLBAR_WIDTH === 0 && isFFWithBuggyScrollbar()) {
        currentPadding = window.getComputedStyle(this.content, null).getPropertyValue('padding-right').replace(/[^0-9.]+/g, '');
        cssRule = {
          right: -14,
          paddingRight: +currentPadding + 14
        };
      } else if (BROWSER_SCROLLBAR_WIDTH) {
        cssRule = {
          right: -BROWSER_SCROLLBAR_WIDTH
        };
        this.$el.addClass(options.enabledClass);
      }
      if (cssRule != null) {
        this.$content.css(cssRule);
      }
      return this;
    };


    /**
      @method restore
      @private
     */

    NanoScroll.prototype.restore = function() {
      this.stopped = false;
      if (!this.iOSNativeScrolling) {
        this.pane.show();
      }
      this.addEvents();
    };


    /**
      Resets nanoScroller's scrollbar.
      @method reset
      @chainable
      @example
          $(".nano").nanoScroller();
     */

    NanoScroll.prototype.reset = function() {
      var content, contentHeight, contentPosition, contentStyle, contentStyleOverflowY, paneBottom, paneHeight, paneOuterHeight, paneTop, parentMaxHeight, right, sliderHeight;
      if (this.iOSNativeScrolling) {
        this.contentHeight = this.content.scrollHeight;
        return;
      }
      if (!this.$el.find("." + this.options.paneClass).length) {
        this.generate().stop();
      }
      if (this.stopped) {
        this.restore();
      }
      content = this.content;
      contentStyle = content.style;
      contentStyleOverflowY = contentStyle.overflowY;
      if (BROWSER_IS_IE7) {
        this.$content.css({
          height: this.$content.height()
        });
      }
      contentHeight = content.scrollHeight + BROWSER_SCROLLBAR_WIDTH;
      parentMaxHeight = parseInt(this.$el.css("max-height"), 10);
      if (parentMaxHeight > 0) {
        this.$el.height("");
        this.$el.height(content.scrollHeight > parentMaxHeight ? parentMaxHeight : content.scrollHeight);
      }
      paneHeight = this.pane.outerHeight(false);
      paneTop = parseInt(this.pane.css('top'), 10);
      paneBottom = parseInt(this.pane.css('bottom'), 10);
      paneOuterHeight = paneHeight + paneTop + paneBottom;
      sliderHeight = Math.round(paneOuterHeight / contentHeight * paneHeight);
      if (sliderHeight < this.options.sliderMinHeight) {
        sliderHeight = this.options.sliderMinHeight;
      } else if ((this.options.sliderMaxHeight != null) && sliderHeight > this.options.sliderMaxHeight) {
        sliderHeight = this.options.sliderMaxHeight;
      }
      if (contentStyleOverflowY === SCROLL && contentStyle.overflowX !== SCROLL) {
        sliderHeight += BROWSER_SCROLLBAR_WIDTH;
      }
      this.maxSliderTop = paneOuterHeight - sliderHeight;
      this.contentHeight = contentHeight;
      this.paneHeight = paneHeight;
      this.paneOuterHeight = paneOuterHeight;
      this.sliderHeight = sliderHeight;
      this.paneTop = paneTop;
      this.slider.height(sliderHeight);
      this.events.scroll();
      this.pane.show();
      this.isActive = true;
      if ((content.scrollHeight === content.clientHeight) || (this.pane.outerHeight(true) >= content.scrollHeight && contentStyleOverflowY !== SCROLL)) {
        this.pane.hide();
        this.isActive = false;
      } else if (this.el.clientHeight === content.scrollHeight && contentStyleOverflowY === SCROLL) {
        this.slider.hide();
      } else {
        this.slider.show();
      }
      this.pane.css({
        opacity: (this.options.alwaysVisible ? 1 : ''),
        visibility: (this.options.alwaysVisible ? 'visible' : '')
      });
      contentPosition = this.$content.css('position');
      if (contentPosition === 'static' || contentPosition === 'relative') {
        right = parseInt(this.$content.css('right'), 10);
        if (right) {
          this.$content.css({
            right: '',
            marginRight: right
          });
        }
      }
      return this;
    };


    /**
      @method scroll
      @private
      @example
          $(".nano").nanoScroller({ scroll: 'top' });
     */

    NanoScroll.prototype.scroll = function() {
      if (!this.isActive) {
        return;
      }
      this.sliderY = Math.max(0, this.sliderY);
      this.sliderY = Math.min(this.maxSliderTop, this.sliderY);
      this.$content.scrollTop(this.maxScrollTop * this.sliderY / this.maxSliderTop);
      if (!this.iOSNativeScrolling) {
        this.updateScrollValues();
        this.setOnScrollStyles();
      }
      return this;
    };


    /**
      Scroll at the bottom with an offset value
      @method scrollBottom
      @param offsetY {Number}
      @chainable
      @example
          $(".nano").nanoScroller({ scrollBottom: value });
     */

    NanoScroll.prototype.scrollBottom = function(offsetY) {
      if (!this.isActive) {
        return;
      }
      this.$content.scrollTop(this.contentHeight - this.$content.height() - offsetY).trigger(MOUSEWHEEL);
      this.stop().restore();
      return this;
    };


    /**
      Scroll at the top with an offset value
      @method scrollTop
      @param offsetY {Number}
      @chainable
      @example
          $(".nano").nanoScroller({ scrollTop: value });
     */

    NanoScroll.prototype.scrollTop = function(offsetY) {
      if (!this.isActive) {
        return;
      }
      this.$content.scrollTop(+offsetY).trigger(MOUSEWHEEL);
      this.stop().restore();
      return this;
    };


    /**
      Scroll to an element
      @method scrollTo
      @param node {Node} A node to scroll to.
      @chainable
      @example
          $(".nano").nanoScroller({ scrollTo: $('#a_node') });
     */

    NanoScroll.prototype.scrollTo = function(node) {
      if (!this.isActive) {
        return;
      }
      this.scrollTop(this.$el.find(node).get(0).offsetTop);
      return this;
    };


    /**
      To stop the operation.
      This option will tell the plugin to disable all event bindings and hide the gadget scrollbar from the UI.
      @method stop
      @chainable
      @example
          $(".nano").nanoScroller({ stop: true });
     */

    NanoScroll.prototype.stop = function() {
      if (cAF && this.scrollRAF) {
        cAF(this.scrollRAF);
        this.scrollRAF = null;
      }
      this.stopped = true;
      this.removeEvents();
      if (!this.iOSNativeScrolling) {
        this.pane.hide();
      }
      return this;
    };


    /**
      Destroys nanoScroller and restores browser's native scrollbar.
      @method destroy
      @chainable
      @example
          $(".nano").nanoScroller({ destroy: true });
     */

    NanoScroll.prototype.destroy = function() {
      if (!this.stopped) {
        this.stop();
      }
      if (!this.iOSNativeScrolling && this.pane.length) {
        this.pane.remove();
      }
      if (BROWSER_IS_IE7) {
        this.$content.height('');
      }
      this.$content.removeAttr('tabindex');
      if (this.$el.hasClass(this.options.enabledClass)) {
        this.$el.removeClass(this.options.enabledClass);
        this.$content.css({
          right: ''
        });
      }
      return this;
    };


    /**
      To flash the scrollbar gadget for an amount of time defined in plugin settings (defaults to 1,5s).
      Useful if you want to show the user (e.g. on pageload) that there is more content waiting for him.
      @method flash
      @chainable
      @example
          $(".nano").nanoScroller({ flash: true });
     */

    NanoScroll.prototype.flash = function() {
      if (this.iOSNativeScrolling) {
        return;
      }
      if (!this.isActive) {
        return;
      }
      this.reset();
      this.pane.addClass(this.options.flashedClass);
      setTimeout((function(_this) {
        return function() {
          _this.pane.removeClass(_this.options.flashedClass);
        };
      })(this), this.options.flashDelay);
      return this;
    };

    return NanoScroll;

  })();
  $.fn.nanoScroller = function(settings) {
    return this.each(function() {
      var options, scrollbar;
      if (!(scrollbar = this.nanoscroller)) {
        options = $.extend({}, defaults, settings);
        this.nanoscroller = scrollbar = new NanoScroll(this, options);
      }
      if (settings && typeof settings === "object") {
        $.extend(scrollbar.options, settings);
        if (settings.scrollBottom != null) {
          return scrollbar.scrollBottom(settings.scrollBottom);
        }
        if (settings.scrollTop != null) {
          return scrollbar.scrollTop(settings.scrollTop);
        }
        if (settings.scrollTo) {
          return scrollbar.scrollTo(settings.scrollTo);
        }
        if (settings.scroll === 'bottom') {
          return scrollbar.scrollBottom(0);
        }
        if (settings.scroll === 'top') {
          return scrollbar.scrollTop(0);
        }
        if (settings.scroll && settings.scroll instanceof $) {
          return scrollbar.scrollTo(settings.scroll);
        }
        if (settings.stop) {
          return scrollbar.stop();
        }
        if (settings.destroy) {
          return scrollbar.destroy();
        }
        if (settings.flash) {
          return scrollbar.flash();
        }
      }
      return scrollbar.reset();
    });
  };
  $.fn.nanoScroller.Constructor = NanoScroll;
});

//# sourceMappingURL=jquery.nanoscroller.js.map

$(document).ready(function(){
$(".nano").nanoScroller({ alwaysVisible: true });
});

$(".scroll").click(function(event){   
    event.preventDefault();
    $('html,body').animate({scrollTop:$(this.hash).offset().top}, 1000);
  });

$(window).bind(' load resize orientationChange ', function () {
   var footer = $("#footer-container");
   var pos = footer.position();
   var height = $(window).height();
   height = height - pos.top;
   height = height - footer.height() -1;

   function stickyFooter() {
     footer.css({
         'margin-top': height + 'px'
     });
   }

   if (height > 0) {
     stickyFooter();
   }
});

/* Enable deep linking from external pages */

if(window.location.hash) {
  var hash = window.location.hash;
  $('.accordion a[href="' + hash + '"]').trigger('click');
  $('.tabs a[href="' + hash + '"]').trigger('click');
}

function open_tab(tab_id,panel) {
  $("#"+tab_id).foundation("selectTab",$("#"+panel));
}


/*Enabling On-page deep-linking
*
* Add internal link class to each on page internal link that you create.
*
*/


function changeTabHandler(tabGroupId, tabId) {
  return function(e) {
    e.preventDefault();
    var ret = $(tabGroupId).foundation("selectTab", $(tabId));
    return false;
  }
}

$(".college-counseling").on('click',changeTabHandler("#working-with-us","#college-counseling"));
$(".coxswain-program").on('click',changeTabHandler("#working-with-us","#coxswain-program"));
$(".internal-applicants").on('click',changeTabHandler("#working-with-us","#internal-applicants"));
$(".gap-year-advising").on('click',changeTabHandler("#working-with-us","#gap-year-advising"));
$(".reports-from-the-front").on('click',changeTabHandler("#working-with-us","#reports-from-the-front"));
$(".our-approach").on('click',changeTabHandler("#working-with-us","#our-approach"));
$(".counseling-testimonials").on('click',changeTabHandler("#working-with-us","#counseling-testimonials"));
$(".rowing-camp-testimonials").on('click',changeTabHandler("#working-with-us","#rowing-camp-testimonials"));
$(".coxswain-testimonials").on('click',changeTabHandler("#working-with-us","#coxswain-testimonials"));

//Rowing Camp Internal Deep Linking
$(".camp-overview").on('click',changeTabHandler("#rowing-camp-tabs","#camp-overview"));
$(".camp-staff").on('click',changeTabHandler("#rowing-camp-tabs","#camp-staff"));
//$(".camp-details").on('click',changeTabHandler("#rowing-camp-tabs","#camp-details"));
$(".camp-registration").on('click', changeTabHandler('#rowing-camp-tabs','#camp-registration'));
$(".camp-schedule").on('click',changeTabHandler("#rowing-camp-tabs","#camp-schedule"));

//About Us Internal Deep Linking
$(".overview").on('click',changeTabHandler("#about-us","#overview"));
$(".leadership").on('click',changeTabHandler("#about-us","#leadership"));
$(".counseling-associates").on('click',changeTabHandler("#about-us","#counseling-associates"));
$(".coxing-associates").on('click',changeTabHandler("#about-us","#coxing-associates"));
$(".international-associates").on('click',changeTabHandler("#about-us","#international-associates"));
$(".administrative-associates").on('click',changeTabHandler("#about-us","#administrative-associates"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndoYXQtaW5wdXQuanMiLCJmb3VuZGF0aW9uLmNvcmUuanMiLCJmb3VuZGF0aW9uLnV0aWwuYm94LmpzIiwiZm91bmRhdGlvbi51dGlsLmtleWJvYXJkLmpzIiwiZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnkuanMiLCJmb3VuZGF0aW9uLnV0aWwubW90aW9uLmpzIiwiZm91bmRhdGlvbi51dGlsLm5lc3QuanMiLCJmb3VuZGF0aW9uLnV0aWwudGltZXJBbmRJbWFnZUxvYWRlci5qcyIsImZvdW5kYXRpb24udXRpbC50b3VjaC5qcyIsImZvdW5kYXRpb24udXRpbC50cmlnZ2Vycy5qcyIsImZvdW5kYXRpb24uYWJpZGUuanMiLCJmb3VuZGF0aW9uLmFjY29yZGlvbi5qcyIsImZvdW5kYXRpb24uYWNjb3JkaW9uTWVudS5qcyIsImZvdW5kYXRpb24uZHJpbGxkb3duLmpzIiwiZm91bmRhdGlvbi5kcm9wZG93bi5qcyIsImZvdW5kYXRpb24uZHJvcGRvd25NZW51LmpzIiwiZm91bmRhdGlvbi5lcXVhbGl6ZXIuanMiLCJmb3VuZGF0aW9uLmludGVyY2hhbmdlLmpzIiwiZm91bmRhdGlvbi5tYWdlbGxhbi5qcyIsImZvdW5kYXRpb24ub2ZmY2FudmFzLmpzIiwiZm91bmRhdGlvbi5vcmJpdC5qcyIsImZvdW5kYXRpb24ucmVzcG9uc2l2ZU1lbnUuanMiLCJmb3VuZGF0aW9uLnJlc3BvbnNpdmVUb2dnbGUuanMiLCJmb3VuZGF0aW9uLnJldmVhbC5qcyIsImZvdW5kYXRpb24uc2xpZGVyLmpzIiwiZm91bmRhdGlvbi5zdGlja3kuanMiLCJmb3VuZGF0aW9uLnRhYnMuanMiLCJmb3VuZGF0aW9uLnRvZ2dsZXIuanMiLCJmb3VuZGF0aW9uLnRvb2x0aXAuanMiLCJtb3Rpb24tdWkuanMiLCJmbGV4LXZpZGVvLmpzIiwiaW5pdC1mb3VuZGF0aW9uLmpzIiwiam95cmlkZS1kZW1vLmpzIiwianF1ZXJ5Lm5hbm9zY3JvbGxlci5qcyIsIm5hbm9zY3JvbGxlci1pbml0LmpzIiwib2ZmQ2FudmFzLmpzIiwic21vb3RoU2Nyb2xsLmpzIiwic3RpY2t5Zm9vdGVyLmpzIiwidGFiU2VsZWN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDektBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDblFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDalVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeFhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsZ0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOWZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDalRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN2FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekdBO0FBQ0E7QUFDQTtBQ0ZBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeCtCQTtBQUNBO0FBQ0E7QUNGQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZm91bmRhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIjsoZnVuY3Rpb24ocm9vdCwgZmFjdG9yeSkge1xyXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcclxuICAgIGRlZmluZShbXSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiAoZmFjdG9yeSgpKTtcclxuICAgIH0pO1xyXG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcclxuICB9IGVsc2Uge1xyXG4gICAgcm9vdC53aGF0SW5wdXQgPSBmYWN0b3J5KCk7XHJcbiAgfVxyXG59ICh0aGlzLCBmdW5jdGlvbigpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG5cclxuICAvKlxyXG4gICAgLS0tLS0tLS0tLS0tLS0tXHJcbiAgICB2YXJpYWJsZXNcclxuICAgIC0tLS0tLS0tLS0tLS0tLVxyXG4gICovXHJcblxyXG4gIC8vIGFycmF5IG9mIGFjdGl2ZWx5IHByZXNzZWQga2V5c1xyXG4gIHZhciBhY3RpdmVLZXlzID0gW107XHJcblxyXG4gIC8vIGNhY2hlIGRvY3VtZW50LmJvZHlcclxuICB2YXIgYm9keSA9IGRvY3VtZW50LmJvZHk7XHJcblxyXG4gIC8vIGJvb2xlYW46IHRydWUgaWYgdG91Y2ggYnVmZmVyIHRpbWVyIGlzIHJ1bm5pbmdcclxuICB2YXIgYnVmZmVyID0gZmFsc2U7XHJcblxyXG4gIC8vIHRoZSBsYXN0IHVzZWQgaW5wdXQgdHlwZVxyXG4gIHZhciBjdXJyZW50SW5wdXQgPSBudWxsO1xyXG5cclxuICAvLyBhcnJheSBvZiBmb3JtIGVsZW1lbnRzIHRoYXQgdGFrZSBrZXlib2FyZCBpbnB1dFxyXG4gIHZhciBmb3JtSW5wdXRzID0gW1xyXG4gICAgJ2lucHV0JyxcclxuICAgICdzZWxlY3QnLFxyXG4gICAgJ3RleHRhcmVhJ1xyXG4gIF07XHJcblxyXG4gIC8vIHVzZXItc2V0IGZsYWcgdG8gYWxsb3cgdHlwaW5nIGluIGZvcm0gZmllbGRzIHRvIGJlIHJlY29yZGVkXHJcbiAgdmFyIGZvcm1UeXBpbmcgPSBib2R5Lmhhc0F0dHJpYnV0ZSgnZGF0YS13aGF0aW5wdXQtZm9ybXR5cGluZycpO1xyXG5cclxuICAvLyBtYXBwaW5nIG9mIGV2ZW50cyB0byBpbnB1dCB0eXBlc1xyXG4gIHZhciBpbnB1dE1hcCA9IHtcclxuICAgICdrZXlkb3duJzogJ2tleWJvYXJkJyxcclxuICAgICdtb3VzZWRvd24nOiAnbW91c2UnLFxyXG4gICAgJ21vdXNlZW50ZXInOiAnbW91c2UnLFxyXG4gICAgJ3RvdWNoc3RhcnQnOiAndG91Y2gnLFxyXG4gICAgJ3BvaW50ZXJkb3duJzogJ3BvaW50ZXInLFxyXG4gICAgJ01TUG9pbnRlckRvd24nOiAncG9pbnRlcidcclxuICB9O1xyXG5cclxuICAvLyBhcnJheSBvZiBhbGwgdXNlZCBpbnB1dCB0eXBlc1xyXG4gIHZhciBpbnB1dFR5cGVzID0gW107XHJcblxyXG4gIC8vIG1hcHBpbmcgb2Yga2V5IGNvZGVzIHRvIGNvbW1vbiBuYW1lXHJcbiAgdmFyIGtleU1hcCA9IHtcclxuICAgIDk6ICd0YWInLFxyXG4gICAgMTM6ICdlbnRlcicsXHJcbiAgICAxNjogJ3NoaWZ0JyxcclxuICAgIDI3OiAnZXNjJyxcclxuICAgIDMyOiAnc3BhY2UnLFxyXG4gICAgMzc6ICdsZWZ0JyxcclxuICAgIDM4OiAndXAnLFxyXG4gICAgMzk6ICdyaWdodCcsXHJcbiAgICA0MDogJ2Rvd24nXHJcbiAgfTtcclxuXHJcbiAgLy8gbWFwIG9mIElFIDEwIHBvaW50ZXIgZXZlbnRzXHJcbiAgdmFyIHBvaW50ZXJNYXAgPSB7XHJcbiAgICAyOiAndG91Y2gnLFxyXG4gICAgMzogJ3RvdWNoJywgLy8gdHJlYXQgcGVuIGxpa2UgdG91Y2hcclxuICAgIDQ6ICdtb3VzZSdcclxuICB9O1xyXG5cclxuICAvLyB0b3VjaCBidWZmZXIgdGltZXJcclxuICB2YXIgdGltZXI7XHJcblxyXG5cclxuICAvKlxyXG4gICAgLS0tLS0tLS0tLS0tLS0tXHJcbiAgICBmdW5jdGlvbnNcclxuICAgIC0tLS0tLS0tLS0tLS0tLVxyXG4gICovXHJcblxyXG4gIGZ1bmN0aW9uIGJ1ZmZlcklucHV0KGV2ZW50KSB7XHJcbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xyXG5cclxuICAgIHNldElucHV0KGV2ZW50KTtcclxuXHJcbiAgICBidWZmZXIgPSB0cnVlO1xyXG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICBidWZmZXIgPSBmYWxzZTtcclxuICAgIH0sIDEwMDApO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW1tZWRpYXRlSW5wdXQoZXZlbnQpIHtcclxuICAgIGlmICghYnVmZmVyKSBzZXRJbnB1dChldmVudCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzZXRJbnB1dChldmVudCkge1xyXG4gICAgdmFyIGV2ZW50S2V5ID0ga2V5KGV2ZW50KTtcclxuICAgIHZhciBldmVudFRhcmdldCA9IHRhcmdldChldmVudCk7XHJcbiAgICB2YXIgdmFsdWUgPSBpbnB1dE1hcFtldmVudC50eXBlXTtcclxuICAgIGlmICh2YWx1ZSA9PT0gJ3BvaW50ZXInKSB2YWx1ZSA9IHBvaW50ZXJUeXBlKGV2ZW50KTtcclxuXHJcbiAgICBpZiAoY3VycmVudElucHV0ICE9PSB2YWx1ZSkge1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgLy8gb25seSBpZiB0aGUgdXNlciBmbGFnIGlzbid0IHNldFxyXG4gICAgICAgICFmb3JtVHlwaW5nICYmXHJcblxyXG4gICAgICAgIC8vIG9ubHkgaWYgY3VycmVudElucHV0IGhhcyBhIHZhbHVlXHJcbiAgICAgICAgY3VycmVudElucHV0ICYmXHJcblxyXG4gICAgICAgIC8vIG9ubHkgaWYgdGhlIGlucHV0IGlzIGBrZXlib2FyZGBcclxuICAgICAgICB2YWx1ZSA9PT0gJ2tleWJvYXJkJyAmJlxyXG5cclxuICAgICAgICAvLyBub3QgaWYgdGhlIGtleSBpcyBgVEFCYFxyXG4gICAgICAgIGtleU1hcFtldmVudEtleV0gIT09ICd0YWInICYmXHJcblxyXG4gICAgICAgIC8vIG9ubHkgaWYgdGhlIHRhcmdldCBpcyBvbmUgb2YgdGhlIGVsZW1lbnRzIGluIGBmb3JtSW5wdXRzYFxyXG4gICAgICAgIGZvcm1JbnB1dHMuaW5kZXhPZihldmVudFRhcmdldC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpKSA+PSAwXHJcbiAgICAgICkge1xyXG4gICAgICAgIC8vIGlnbm9yZSBrZXlib2FyZCB0eXBpbmcgb24gZm9ybSBlbGVtZW50c1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGN1cnJlbnRJbnB1dCA9IHZhbHVlO1xyXG4gICAgICAgIGJvZHkuc2V0QXR0cmlidXRlKCdkYXRhLXdoYXRpbnB1dCcsIGN1cnJlbnRJbnB1dCk7XHJcblxyXG4gICAgICAgIGlmIChpbnB1dFR5cGVzLmluZGV4T2YoY3VycmVudElucHV0KSA9PT0gLTEpIGlucHV0VHlwZXMucHVzaChjdXJyZW50SW5wdXQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHZhbHVlID09PSAna2V5Ym9hcmQnKSBsb2dLZXlzKGV2ZW50S2V5KTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGtleShldmVudCkge1xyXG4gICAgcmV0dXJuIChldmVudC5rZXlDb2RlKSA/IGV2ZW50LmtleUNvZGUgOiBldmVudC53aGljaDtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHRhcmdldChldmVudCkge1xyXG4gICAgcmV0dXJuIGV2ZW50LnRhcmdldCB8fCBldmVudC5zcmNFbGVtZW50O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcG9pbnRlclR5cGUoZXZlbnQpIHtcclxuICAgIHJldHVybiAodHlwZW9mIGV2ZW50LnBvaW50ZXJUeXBlID09PSAnbnVtYmVyJykgPyBwb2ludGVyTWFwW2V2ZW50LnBvaW50ZXJUeXBlXSA6IGV2ZW50LnBvaW50ZXJUeXBlO1xyXG4gIH1cclxuXHJcbiAgLy8ga2V5Ym9hcmQgbG9nZ2luZ1xyXG4gIGZ1bmN0aW9uIGxvZ0tleXMoZXZlbnRLZXkpIHtcclxuICAgIGlmIChhY3RpdmVLZXlzLmluZGV4T2Yoa2V5TWFwW2V2ZW50S2V5XSkgPT09IC0xICYmIGtleU1hcFtldmVudEtleV0pIGFjdGl2ZUtleXMucHVzaChrZXlNYXBbZXZlbnRLZXldKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHVuTG9nS2V5cyhldmVudCkge1xyXG4gICAgdmFyIGV2ZW50S2V5ID0ga2V5KGV2ZW50KTtcclxuICAgIHZhciBhcnJheVBvcyA9IGFjdGl2ZUtleXMuaW5kZXhPZihrZXlNYXBbZXZlbnRLZXldKTtcclxuXHJcbiAgICBpZiAoYXJyYXlQb3MgIT09IC0xKSBhY3RpdmVLZXlzLnNwbGljZShhcnJheVBvcywgMSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBiaW5kRXZlbnRzKCkge1xyXG5cclxuICAgIC8vIHBvaW50ZXIvbW91c2VcclxuICAgIHZhciBtb3VzZUV2ZW50ID0gJ21vdXNlZG93bic7XHJcblxyXG4gICAgaWYgKHdpbmRvdy5Qb2ludGVyRXZlbnQpIHtcclxuICAgICAgbW91c2VFdmVudCA9ICdwb2ludGVyZG93bic7XHJcbiAgICB9IGVsc2UgaWYgKHdpbmRvdy5NU1BvaW50ZXJFdmVudCkge1xyXG4gICAgICBtb3VzZUV2ZW50ID0gJ01TUG9pbnRlckRvd24nO1xyXG4gICAgfVxyXG5cclxuICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcihtb3VzZUV2ZW50LCBpbW1lZGlhdGVJbnB1dCk7XHJcbiAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBpbW1lZGlhdGVJbnB1dCk7XHJcblxyXG4gICAgLy8gdG91Y2hcclxuICAgIGlmICgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpIHtcclxuICAgICAgYm9keS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgYnVmZmVySW5wdXQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGtleWJvYXJkXHJcbiAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBpbW1lZGlhdGVJbnB1dCk7XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHVuTG9nS2V5cyk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgIC0tLS0tLS0tLS0tLS0tLVxyXG4gICAgaW5pdFxyXG5cclxuICAgIGRvbid0IHN0YXJ0IHNjcmlwdCB1bmxlc3MgYnJvd3NlciBjdXRzIHRoZSBtdXN0YXJkLFxyXG4gICAgYWxzbyBwYXNzZXMgaWYgcG9seWZpbGxzIGFyZSB1c2VkXHJcbiAgICAtLS0tLS0tLS0tLS0tLS1cclxuICAqL1xyXG5cclxuICBpZiAoJ2FkZEV2ZW50TGlzdGVuZXInIGluIHdpbmRvdyAmJiBBcnJheS5wcm90b3R5cGUuaW5kZXhPZikge1xyXG4gICAgYmluZEV2ZW50cygpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICAtLS0tLS0tLS0tLS0tLS1cclxuICAgIGFwaVxyXG4gICAgLS0tLS0tLS0tLS0tLS0tXHJcbiAgKi9cclxuXHJcbiAgcmV0dXJuIHtcclxuXHJcbiAgICAvLyByZXR1cm5zIHN0cmluZzogdGhlIGN1cnJlbnQgaW5wdXQgdHlwZVxyXG4gICAgYXNrOiBmdW5jdGlvbigpIHsgcmV0dXJuIGN1cnJlbnRJbnB1dDsgfSxcclxuXHJcbiAgICAvLyByZXR1cm5zIGFycmF5OiBjdXJyZW50bHkgcHJlc3NlZCBrZXlzXHJcbiAgICBrZXlzOiBmdW5jdGlvbigpIHsgcmV0dXJuIGFjdGl2ZUtleXM7IH0sXHJcblxyXG4gICAgLy8gcmV0dXJucyBhcnJheTogYWxsIHRoZSBkZXRlY3RlZCBpbnB1dCB0eXBlc1xyXG4gICAgdHlwZXM6IGZ1bmN0aW9uKCkgeyByZXR1cm4gaW5wdXRUeXBlczsgfSxcclxuXHJcbiAgICAvLyBhY2NlcHRzIHN0cmluZzogbWFudWFsbHkgc2V0IHRoZSBpbnB1dCB0eXBlXHJcbiAgICBzZXQ6IHNldElucHV0XHJcbiAgfTtcclxuXHJcbn0pKTtcclxuIiwiIWZ1bmN0aW9uKCQpIHtcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgRk9VTkRBVElPTl9WRVJTSU9OID0gJzYuMS4yJztcclxuXHJcbi8vIEdsb2JhbCBGb3VuZGF0aW9uIG9iamVjdFxyXG4vLyBUaGlzIGlzIGF0dGFjaGVkIHRvIHRoZSB3aW5kb3csIG9yIHVzZWQgYXMgYSBtb2R1bGUgZm9yIEFNRC9Ccm93c2VyaWZ5XHJcbnZhciBGb3VuZGF0aW9uID0ge1xyXG4gIHZlcnNpb246IEZPVU5EQVRJT05fVkVSU0lPTixcclxuXHJcbiAgLyoqXHJcbiAgICogU3RvcmVzIGluaXRpYWxpemVkIHBsdWdpbnMuXHJcbiAgICovXHJcbiAgX3BsdWdpbnM6IHt9LFxyXG5cclxuICAvKipcclxuICAgKiBTdG9yZXMgZ2VuZXJhdGVkIHVuaXF1ZSBpZHMgZm9yIHBsdWdpbiBpbnN0YW5jZXNcclxuICAgKi9cclxuICBfdXVpZHM6IFtdLFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgYm9vbGVhbiBmb3IgUlRMIHN1cHBvcnRcclxuICAgKi9cclxuICBydGw6IGZ1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4gJCgnaHRtbCcpLmF0dHIoJ2RpcicpID09PSAncnRsJztcclxuICB9LFxyXG4gIC8qKlxyXG4gICAqIERlZmluZXMgYSBGb3VuZGF0aW9uIHBsdWdpbiwgYWRkaW5nIGl0IHRvIHRoZSBgRm91bmRhdGlvbmAgbmFtZXNwYWNlIGFuZCB0aGUgbGlzdCBvZiBwbHVnaW5zIHRvIGluaXRpYWxpemUgd2hlbiByZWZsb3dpbmcuXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IHBsdWdpbiAtIFRoZSBjb25zdHJ1Y3RvciBvZiB0aGUgcGx1Z2luLlxyXG4gICAqL1xyXG4gIHBsdWdpbjogZnVuY3Rpb24ocGx1Z2luLCBuYW1lKSB7XHJcbiAgICAvLyBPYmplY3Qga2V5IHRvIHVzZSB3aGVuIGFkZGluZyB0byBnbG9iYWwgRm91bmRhdGlvbiBvYmplY3RcclxuICAgIC8vIEV4YW1wbGVzOiBGb3VuZGF0aW9uLlJldmVhbCwgRm91bmRhdGlvbi5PZmZDYW52YXNcclxuICAgIHZhciBjbGFzc05hbWUgPSAobmFtZSB8fCBmdW5jdGlvbk5hbWUocGx1Z2luKSk7XHJcbiAgICAvLyBPYmplY3Qga2V5IHRvIHVzZSB3aGVuIHN0b3JpbmcgdGhlIHBsdWdpbiwgYWxzbyB1c2VkIHRvIGNyZWF0ZSB0aGUgaWRlbnRpZnlpbmcgZGF0YSBhdHRyaWJ1dGUgZm9yIHRoZSBwbHVnaW5cclxuICAgIC8vIEV4YW1wbGVzOiBkYXRhLXJldmVhbCwgZGF0YS1vZmYtY2FudmFzXHJcbiAgICB2YXIgYXR0ck5hbWUgID0gaHlwaGVuYXRlKGNsYXNzTmFtZSk7XHJcblxyXG4gICAgLy8gQWRkIHRvIHRoZSBGb3VuZGF0aW9uIG9iamVjdCBhbmQgdGhlIHBsdWdpbnMgbGlzdCAoZm9yIHJlZmxvd2luZylcclxuICAgIHRoaXMuX3BsdWdpbnNbYXR0ck5hbWVdID0gdGhpc1tjbGFzc05hbWVdID0gcGx1Z2luO1xyXG4gIH0sXHJcbiAgLyoqXHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICogUG9wdWxhdGVzIHRoZSBfdXVpZHMgYXJyYXkgd2l0aCBwb2ludGVycyB0byBlYWNoIGluZGl2aWR1YWwgcGx1Z2luIGluc3RhbmNlLlxyXG4gICAqIEFkZHMgdGhlIGB6ZlBsdWdpbmAgZGF0YS1hdHRyaWJ1dGUgdG8gcHJvZ3JhbW1hdGljYWxseSBjcmVhdGVkIHBsdWdpbnMgdG8gYWxsb3cgdXNlIG9mICQoc2VsZWN0b3IpLmZvdW5kYXRpb24obWV0aG9kKSBjYWxscy5cclxuICAgKiBBbHNvIGZpcmVzIHRoZSBpbml0aWFsaXphdGlvbiBldmVudCBmb3IgZWFjaCBwbHVnaW4sIGNvbnNvbGlkYXRpbmcgcmVwZWRpdGl2ZSBjb2RlLlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW4gLSBhbiBpbnN0YW5jZSBvZiBhIHBsdWdpbiwgdXN1YWxseSBgdGhpc2AgaW4gY29udGV4dC5cclxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIHRoZSBuYW1lIG9mIHRoZSBwbHVnaW4sIHBhc3NlZCBhcyBhIGNhbWVsQ2FzZWQgc3RyaW5nLlxyXG4gICAqIEBmaXJlcyBQbHVnaW4jaW5pdFxyXG4gICAqL1xyXG4gIHJlZ2lzdGVyUGx1Z2luOiBmdW5jdGlvbihwbHVnaW4sIG5hbWUpe1xyXG4gICAgdmFyIHBsdWdpbk5hbWUgPSBuYW1lID8gaHlwaGVuYXRlKG5hbWUpIDogZnVuY3Rpb25OYW1lKHBsdWdpbi5jb25zdHJ1Y3RvcikudG9Mb3dlckNhc2UoKTtcclxuICAgIHBsdWdpbi51dWlkID0gdGhpcy5HZXRZb0RpZ2l0cyg2LCBwbHVnaW5OYW1lKTtcclxuXHJcbiAgICBpZighcGx1Z2luLiRlbGVtZW50LmF0dHIoJ2RhdGEtJyArIHBsdWdpbk5hbWUpKXsgcGx1Z2luLiRlbGVtZW50LmF0dHIoJ2RhdGEtJyArIHBsdWdpbk5hbWUsIHBsdWdpbi51dWlkKTsgfVxyXG4gICAgaWYoIXBsdWdpbi4kZWxlbWVudC5kYXRhKCd6ZlBsdWdpbicpKXsgcGx1Z2luLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJywgcGx1Z2luKTsgfVxyXG4gICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBwbHVnaW4gaGFzIGluaXRpYWxpemVkLlxyXG4gICAgICAgICAgICogQGV2ZW50IFBsdWdpbiNpbml0XHJcbiAgICAgICAgICAgKi9cclxuICAgIHBsdWdpbi4kZWxlbWVudC50cmlnZ2VyKCdpbml0LnpmLicgKyBwbHVnaW5OYW1lKTtcclxuXHJcbiAgICB0aGlzLl91dWlkcy5wdXNoKHBsdWdpbi51dWlkKTtcclxuXHJcbiAgICByZXR1cm47XHJcbiAgfSxcclxuICAvKipcclxuICAgKiBAZnVuY3Rpb25cclxuICAgKiBSZW1vdmVzIHRoZSBwbHVnaW5zIHV1aWQgZnJvbSB0aGUgX3V1aWRzIGFycmF5LlxyXG4gICAqIFJlbW92ZXMgdGhlIHpmUGx1Z2luIGRhdGEgYXR0cmlidXRlLCBhcyB3ZWxsIGFzIHRoZSBkYXRhLXBsdWdpbi1uYW1lIGF0dHJpYnV0ZS5cclxuICAgKiBBbHNvIGZpcmVzIHRoZSBkZXN0cm95ZWQgZXZlbnQgZm9yIHRoZSBwbHVnaW4sIGNvbnNvbGlkYXRpbmcgcmVwZWRpdGl2ZSBjb2RlLlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW4gLSBhbiBpbnN0YW5jZSBvZiBhIHBsdWdpbiwgdXN1YWxseSBgdGhpc2AgaW4gY29udGV4dC5cclxuICAgKiBAZmlyZXMgUGx1Z2luI2Rlc3Ryb3llZFxyXG4gICAqL1xyXG4gIHVucmVnaXN0ZXJQbHVnaW46IGZ1bmN0aW9uKHBsdWdpbil7XHJcbiAgICB2YXIgcGx1Z2luTmFtZSA9IGh5cGhlbmF0ZShmdW5jdGlvbk5hbWUocGx1Z2luLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJykuY29uc3RydWN0b3IpKTtcclxuXHJcbiAgICB0aGlzLl91dWlkcy5zcGxpY2UodGhpcy5fdXVpZHMuaW5kZXhPZihwbHVnaW4udXVpZCksIDEpO1xyXG4gICAgcGx1Z2luLiRlbGVtZW50LnJlbW92ZUF0dHIoJ2RhdGEtJyArIHBsdWdpbk5hbWUpLnJlbW92ZURhdGEoJ3pmUGx1Z2luJylcclxuICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgcGx1Z2luIGhhcyBiZWVuIGRlc3Ryb3llZC5cclxuICAgICAgICAgICAqIEBldmVudCBQbHVnaW4jZGVzdHJveWVkXHJcbiAgICAgICAgICAgKi9cclxuICAgICAgICAgIC50cmlnZ2VyKCdkZXN0cm95ZWQuemYuJyArIHBsdWdpbk5hbWUpO1xyXG4gICAgZm9yKHZhciBwcm9wIGluIHBsdWdpbil7XHJcbiAgICAgIHBsdWdpbltwcm9wXSA9IG51bGw7Ly9jbGVhbiB1cCBzY3JpcHQgdG8gcHJlcCBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLlxyXG4gICAgfVxyXG4gICAgcmV0dXJuO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqIENhdXNlcyBvbmUgb3IgbW9yZSBhY3RpdmUgcGx1Z2lucyB0byByZS1pbml0aWFsaXplLCByZXNldHRpbmcgZXZlbnQgbGlzdGVuZXJzLCByZWNhbGN1bGF0aW5nIHBvc2l0aW9ucywgZXRjLlxyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwbHVnaW5zIC0gb3B0aW9uYWwgc3RyaW5nIG9mIGFuIGluZGl2aWR1YWwgcGx1Z2luIGtleSwgYXR0YWluZWQgYnkgY2FsbGluZyBgJChlbGVtZW50KS5kYXRhKCdwbHVnaW5OYW1lJylgLCBvciBzdHJpbmcgb2YgYSBwbHVnaW4gY2xhc3MgaS5lLiBgJ2Ryb3Bkb3duJ2BcclxuICAgKiBAZGVmYXVsdCBJZiBubyBhcmd1bWVudCBpcyBwYXNzZWQsIHJlZmxvdyBhbGwgY3VycmVudGx5IGFjdGl2ZSBwbHVnaW5zLlxyXG4gICAqL1xyXG4gICByZUluaXQ6IGZ1bmN0aW9uKHBsdWdpbnMpe1xyXG4gICAgIHZhciBpc0pRID0gcGx1Z2lucyBpbnN0YW5jZW9mICQ7XHJcbiAgICAgdHJ5e1xyXG4gICAgICAgaWYoaXNKUSl7XHJcbiAgICAgICAgIHBsdWdpbnMuZWFjaChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICQodGhpcykuZGF0YSgnemZQbHVnaW4nKS5faW5pdCgpO1xyXG4gICAgICAgICB9KTtcclxuICAgICAgIH1lbHNle1xyXG4gICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiBwbHVnaW5zLFxyXG4gICAgICAgICBfdGhpcyA9IHRoaXMsXHJcbiAgICAgICAgIGZucyA9IHtcclxuICAgICAgICAgICAnb2JqZWN0JzogZnVuY3Rpb24ocGxncyl7XHJcbiAgICAgICAgICAgICBwbGdzLmZvckVhY2goZnVuY3Rpb24ocCl7XHJcbiAgICAgICAgICAgICAgICQoJ1tkYXRhLScrIHAgKyddJykuZm91bmRhdGlvbignX2luaXQnKTtcclxuICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgJ3N0cmluZyc6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAkKCdbZGF0YS0nKyBwbHVnaW5zICsnXScpLmZvdW5kYXRpb24oJ19pbml0Jyk7XHJcbiAgICAgICAgICAgfSxcclxuICAgICAgICAgICAndW5kZWZpbmVkJzogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgIHRoaXNbJ29iamVjdCddKE9iamVjdC5rZXlzKF90aGlzLl9wbHVnaW5zKSk7XHJcbiAgICAgICAgICAgfVxyXG4gICAgICAgICB9O1xyXG4gICAgICAgICBmbnNbdHlwZV0ocGx1Z2lucyk7XHJcbiAgICAgICB9XHJcbiAgICAgfWNhdGNoKGVycil7XHJcbiAgICAgICBjb25zb2xlLmVycm9yKGVycik7XHJcbiAgICAgfWZpbmFsbHl7XHJcbiAgICAgICByZXR1cm4gcGx1Z2lucztcclxuICAgICB9XHJcbiAgIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIHJldHVybnMgYSByYW5kb20gYmFzZS0zNiB1aWQgd2l0aCBuYW1lc3BhY2luZ1xyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBsZW5ndGggLSBudW1iZXIgb2YgcmFuZG9tIGJhc2UtMzYgZGlnaXRzIGRlc2lyZWQuIEluY3JlYXNlIGZvciBtb3JlIHJhbmRvbSBzdHJpbmdzLlxyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2UgLSBuYW1lIG9mIHBsdWdpbiB0byBiZSBpbmNvcnBvcmF0ZWQgaW4gdWlkLCBvcHRpb25hbC5cclxuICAgKiBAZGVmYXVsdCB7U3RyaW5nfSAnJyAtIGlmIG5vIHBsdWdpbiBuYW1lIGlzIHByb3ZpZGVkLCBub3RoaW5nIGlzIGFwcGVuZGVkIHRvIHRoZSB1aWQuXHJcbiAgICogQHJldHVybnMge1N0cmluZ30gLSB1bmlxdWUgaWRcclxuICAgKi9cclxuICBHZXRZb0RpZ2l0czogZnVuY3Rpb24obGVuZ3RoLCBuYW1lc3BhY2Upe1xyXG4gICAgbGVuZ3RoID0gbGVuZ3RoIHx8IDY7XHJcbiAgICByZXR1cm4gTWF0aC5yb3VuZCgoTWF0aC5wb3coMzYsIGxlbmd0aCArIDEpIC0gTWF0aC5yYW5kb20oKSAqIE1hdGgucG93KDM2LCBsZW5ndGgpKSkudG9TdHJpbmcoMzYpLnNsaWNlKDEpICsgKG5hbWVzcGFjZSA/ICctJyArIG5hbWVzcGFjZSA6ICcnKTtcclxuICB9LFxyXG4gIC8qKlxyXG4gICAqIEluaXRpYWxpemUgcGx1Z2lucyBvbiBhbnkgZWxlbWVudHMgd2l0aGluIGBlbGVtYCAoYW5kIGBlbGVtYCBpdHNlbGYpIHRoYXQgYXJlbid0IGFscmVhZHkgaW5pdGlhbGl6ZWQuXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW0gLSBqUXVlcnkgb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGVsZW1lbnQgdG8gY2hlY2sgaW5zaWRlLiBBbHNvIGNoZWNrcyB0aGUgZWxlbWVudCBpdHNlbGYsIHVubGVzcyBpdCdzIHRoZSBgZG9jdW1lbnRgIG9iamVjdC5cclxuICAgKiBAcGFyYW0ge1N0cmluZ3xBcnJheX0gcGx1Z2lucyAtIEEgbGlzdCBvZiBwbHVnaW5zIHRvIGluaXRpYWxpemUuIExlYXZlIHRoaXMgb3V0IHRvIGluaXRpYWxpemUgZXZlcnl0aGluZy5cclxuICAgKi9cclxuICByZWZsb3c6IGZ1bmN0aW9uKGVsZW0sIHBsdWdpbnMpIHtcclxuXHJcbiAgICAvLyBJZiBwbHVnaW5zIGlzIHVuZGVmaW5lZCwganVzdCBncmFiIGV2ZXJ5dGhpbmdcclxuICAgIGlmICh0eXBlb2YgcGx1Z2lucyA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgcGx1Z2lucyA9IE9iamVjdC5rZXlzKHRoaXMuX3BsdWdpbnMpO1xyXG4gICAgfVxyXG4gICAgLy8gSWYgcGx1Z2lucyBpcyBhIHN0cmluZywgY29udmVydCBpdCB0byBhbiBhcnJheSB3aXRoIG9uZSBpdGVtXHJcbiAgICBlbHNlIGlmICh0eXBlb2YgcGx1Z2lucyA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgcGx1Z2lucyA9IFtwbHVnaW5zXTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG5cclxuICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBlYWNoIHBsdWdpblxyXG4gICAgJC5lYWNoKHBsdWdpbnMsIGZ1bmN0aW9uKGksIG5hbWUpIHtcclxuICAgICAgLy8gR2V0IHRoZSBjdXJyZW50IHBsdWdpblxyXG4gICAgICB2YXIgcGx1Z2luID0gX3RoaXMuX3BsdWdpbnNbbmFtZV07XHJcblxyXG4gICAgICAvLyBMb2NhbGl6ZSB0aGUgc2VhcmNoIHRvIGFsbCBlbGVtZW50cyBpbnNpZGUgZWxlbSwgYXMgd2VsbCBhcyBlbGVtIGl0c2VsZiwgdW5sZXNzIGVsZW0gPT09IGRvY3VtZW50XHJcbiAgICAgIHZhciAkZWxlbSA9ICQoZWxlbSkuZmluZCgnW2RhdGEtJytuYW1lKyddJykuYWRkQmFjaygnW2RhdGEtJytuYW1lKyddJyk7XHJcblxyXG4gICAgICAvLyBGb3IgZWFjaCBwbHVnaW4gZm91bmQsIGluaXRpYWxpemUgaXRcclxuICAgICAgJGVsZW0uZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgJGVsID0gJCh0aGlzKSxcclxuICAgICAgICAgICAgb3B0cyA9IHt9O1xyXG4gICAgICAgIC8vIERvbid0IGRvdWJsZS1kaXAgb24gcGx1Z2luc1xyXG4gICAgICAgIGlmICgkZWwuZGF0YSgnemZQbHVnaW4nKSkge1xyXG4gICAgICAgICAgY29uc29sZS53YXJuKFwiVHJpZWQgdG8gaW5pdGlhbGl6ZSBcIituYW1lK1wiIG9uIGFuIGVsZW1lbnQgdGhhdCBhbHJlYWR5IGhhcyBhIEZvdW5kYXRpb24gcGx1Z2luLlwiKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCRlbC5hdHRyKCdkYXRhLW9wdGlvbnMnKSl7XHJcbiAgICAgICAgICB2YXIgdGhpbmcgPSAkZWwuYXR0cignZGF0YS1vcHRpb25zJykuc3BsaXQoJzsnKS5mb3JFYWNoKGZ1bmN0aW9uKGUsIGkpe1xyXG4gICAgICAgICAgICB2YXIgb3B0ID0gZS5zcGxpdCgnOicpLm1hcChmdW5jdGlvbihlbCl7IHJldHVybiBlbC50cmltKCk7IH0pO1xyXG4gICAgICAgICAgICBpZihvcHRbMF0pIG9wdHNbb3B0WzBdXSA9IHBhcnNlVmFsdWUob3B0WzFdKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0cnl7XHJcbiAgICAgICAgICAkZWwuZGF0YSgnemZQbHVnaW4nLCBuZXcgcGx1Z2luKCQodGhpcyksIG9wdHMpKTtcclxuICAgICAgICB9Y2F0Y2goZXIpe1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcihlcik7XHJcbiAgICAgICAgfWZpbmFsbHl7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH0sXHJcbiAgZ2V0Rm5OYW1lOiBmdW5jdGlvbk5hbWUsXHJcbiAgdHJhbnNpdGlvbmVuZDogZnVuY3Rpb24oJGVsZW0pe1xyXG4gICAgdmFyIHRyYW5zaXRpb25zID0ge1xyXG4gICAgICAndHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcclxuICAgICAgJ1dlYmtpdFRyYW5zaXRpb24nOiAnd2Via2l0VHJhbnNpdGlvbkVuZCcsXHJcbiAgICAgICdNb3pUcmFuc2l0aW9uJzogJ3RyYW5zaXRpb25lbmQnLFxyXG4gICAgICAnT1RyYW5zaXRpb24nOiAnb3RyYW5zaXRpb25lbmQnXHJcbiAgICB9O1xyXG4gICAgdmFyIGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcclxuICAgICAgICBlbmQ7XHJcblxyXG4gICAgZm9yICh2YXIgdCBpbiB0cmFuc2l0aW9ucyl7XHJcbiAgICAgIGlmICh0eXBlb2YgZWxlbS5zdHlsZVt0XSAhPT0gJ3VuZGVmaW5lZCcpe1xyXG4gICAgICAgIGVuZCA9IHRyYW5zaXRpb25zW3RdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZihlbmQpe1xyXG4gICAgICByZXR1cm4gZW5kO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIGVuZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAkZWxlbS50cmlnZ2VySGFuZGxlcigndHJhbnNpdGlvbmVuZCcsIFskZWxlbV0pO1xyXG4gICAgICB9LCAxKTtcclxuICAgICAgcmV0dXJuICd0cmFuc2l0aW9uZW5kJztcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG5cclxuRm91bmRhdGlvbi51dGlsID0ge1xyXG4gIC8qKlxyXG4gICAqIEZ1bmN0aW9uIGZvciBhcHBseWluZyBhIGRlYm91bmNlIGVmZmVjdCB0byBhIGZ1bmN0aW9uIGNhbGwuXHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyAtIEZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBhdCBlbmQgb2YgdGltZW91dC5cclxuICAgKiBAcGFyYW0ge051bWJlcn0gZGVsYXkgLSBUaW1lIGluIG1zIHRvIGRlbGF5IHRoZSBjYWxsIG9mIGBmdW5jYC5cclxuICAgKiBAcmV0dXJucyBmdW5jdGlvblxyXG4gICAqL1xyXG4gIHRocm90dGxlOiBmdW5jdGlvbiAoZnVuYywgZGVsYXkpIHtcclxuICAgIHZhciB0aW1lciA9IG51bGw7XHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLCBhcmdzID0gYXJndW1lbnRzO1xyXG5cclxuICAgICAgaWYgKHRpbWVyID09PSBudWxsKSB7XHJcbiAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XHJcbiAgICAgICAgICB0aW1lciA9IG51bGw7XHJcbiAgICAgICAgfSwgZGVsYXkpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxufTtcclxuXHJcbi8vIFRPRE86IGNvbnNpZGVyIG5vdCBtYWtpbmcgdGhpcyBhIGpRdWVyeSBmdW5jdGlvblxyXG4vLyBUT0RPOiBuZWVkIHdheSB0byByZWZsb3cgdnMuIHJlLWluaXRpYWxpemVcclxuLyoqXHJcbiAqIFRoZSBGb3VuZGF0aW9uIGpRdWVyeSBtZXRob2QuXHJcbiAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBtZXRob2QgLSBBbiBhY3Rpb24gdG8gcGVyZm9ybSBvbiB0aGUgY3VycmVudCBqUXVlcnkgb2JqZWN0LlxyXG4gKi9cclxudmFyIGZvdW5kYXRpb24gPSBmdW5jdGlvbihtZXRob2QpIHtcclxuICB2YXIgdHlwZSA9IHR5cGVvZiBtZXRob2QsXHJcbiAgICAgICRtZXRhID0gJCgnbWV0YS5mb3VuZGF0aW9uLW1xJyksXHJcbiAgICAgICRub0pTID0gJCgnLm5vLWpzJyk7XHJcblxyXG4gIGlmKCEkbWV0YS5sZW5ndGgpe1xyXG4gICAgJCgnPG1ldGEgY2xhc3M9XCJmb3VuZGF0aW9uLW1xXCI+JykuYXBwZW5kVG8oZG9jdW1lbnQuaGVhZCk7XHJcbiAgfVxyXG4gIGlmKCRub0pTLmxlbmd0aCl7XHJcbiAgICAkbm9KUy5yZW1vdmVDbGFzcygnbm8tanMnKTtcclxuICB9XHJcblxyXG4gIGlmKHR5cGUgPT09ICd1bmRlZmluZWQnKXsvL25lZWRzIHRvIGluaXRpYWxpemUgdGhlIEZvdW5kYXRpb24gb2JqZWN0LCBvciBhbiBpbmRpdmlkdWFsIHBsdWdpbi5cclxuICAgIEZvdW5kYXRpb24uTWVkaWFRdWVyeS5faW5pdCgpO1xyXG4gICAgRm91bmRhdGlvbi5yZWZsb3codGhpcyk7XHJcbiAgfWVsc2UgaWYodHlwZSA9PT0gJ3N0cmluZycpey8vYW4gaW5kaXZpZHVhbCBtZXRob2QgdG8gaW52b2tlIG9uIGEgcGx1Z2luIG9yIGdyb3VwIG9mIHBsdWdpbnNcclxuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTsvL2NvbGxlY3QgYWxsIHRoZSBhcmd1bWVudHMsIGlmIG5lY2Vzc2FyeVxyXG4gICAgdmFyIHBsdWdDbGFzcyA9IHRoaXMuZGF0YSgnemZQbHVnaW4nKTsvL2RldGVybWluZSB0aGUgY2xhc3Mgb2YgcGx1Z2luXHJcblxyXG4gICAgaWYocGx1Z0NsYXNzICE9PSB1bmRlZmluZWQgJiYgcGx1Z0NsYXNzW21ldGhvZF0gIT09IHVuZGVmaW5lZCl7Ly9tYWtlIHN1cmUgYm90aCB0aGUgY2xhc3MgYW5kIG1ldGhvZCBleGlzdFxyXG4gICAgICBpZih0aGlzLmxlbmd0aCA9PT0gMSl7Ly9pZiB0aGVyZSdzIG9ubHkgb25lLCBjYWxsIGl0IGRpcmVjdGx5LlxyXG4gICAgICAgICAgcGx1Z0NsYXNzW21ldGhvZF0uYXBwbHkocGx1Z0NsYXNzLCBhcmdzKTtcclxuICAgICAgfWVsc2V7XHJcbiAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKGksIGVsKXsvL290aGVyd2lzZSBsb29wIHRocm91Z2ggdGhlIGpRdWVyeSBjb2xsZWN0aW9uIGFuZCBpbnZva2UgdGhlIG1ldGhvZCBvbiBlYWNoXHJcbiAgICAgICAgICBwbHVnQ2xhc3NbbWV0aG9kXS5hcHBseSgkKGVsKS5kYXRhKCd6ZlBsdWdpbicpLCBhcmdzKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfWVsc2V7Ly9lcnJvciBmb3Igbm8gY2xhc3Mgb3Igbm8gbWV0aG9kXHJcbiAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcIldlJ3JlIHNvcnJ5LCAnXCIgKyBtZXRob2QgKyBcIicgaXMgbm90IGFuIGF2YWlsYWJsZSBtZXRob2QgZm9yIFwiICsgKHBsdWdDbGFzcyA/IGZ1bmN0aW9uTmFtZShwbHVnQ2xhc3MpIDogJ3RoaXMgZWxlbWVudCcpICsgJy4nKTtcclxuICAgIH1cclxuICB9ZWxzZXsvL2Vycm9yIGZvciBpbnZhbGlkIGFyZ3VtZW50IHR5cGVcclxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJXZSdyZSBzb3JyeSwgJ1wiICsgdHlwZSArIFwiJyBpcyBub3QgYSB2YWxpZCBwYXJhbWV0ZXIuIFlvdSBtdXN0IHVzZSBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIG1ldGhvZCB5b3Ugd2lzaCB0byBpbnZva2UuXCIpO1xyXG4gIH1cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbndpbmRvdy5Gb3VuZGF0aW9uID0gRm91bmRhdGlvbjtcclxuJC5mbi5mb3VuZGF0aW9uID0gZm91bmRhdGlvbjtcclxuXHJcbi8vIFBvbHlmaWxsIGZvciByZXF1ZXN0QW5pbWF0aW9uRnJhbWVcclxuKGZ1bmN0aW9uKCkge1xyXG4gIGlmICghRGF0ZS5ub3cgfHwgIXdpbmRvdy5EYXRlLm5vdylcclxuICAgIHdpbmRvdy5EYXRlLm5vdyA9IERhdGUubm93ID0gZnVuY3Rpb24oKSB7IHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTsgfTtcclxuXHJcbiAgdmFyIHZlbmRvcnMgPSBbJ3dlYmtpdCcsICdtb3onXTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHZlbmRvcnMubGVuZ3RoICYmICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lOyArK2kpIHtcclxuICAgICAgdmFyIHZwID0gdmVuZG9yc1tpXTtcclxuICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2cCsnUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XHJcbiAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9ICh3aW5kb3dbdnArJ0NhbmNlbEFuaW1hdGlvbkZyYW1lJ11cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgd2luZG93W3ZwKydDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXSk7XHJcbiAgfVxyXG4gIGlmICgvaVAoYWR8aG9uZXxvZCkuKk9TIDYvLnRlc3Qod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQpXHJcbiAgICB8fCAhd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCAhd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKSB7XHJcbiAgICB2YXIgbGFzdFRpbWUgPSAwO1xyXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIG5vdyA9IERhdGUubm93KCk7XHJcbiAgICAgICAgdmFyIG5leHRUaW1lID0gTWF0aC5tYXgobGFzdFRpbWUgKyAxNiwgbm93KTtcclxuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpIHsgY2FsbGJhY2sobGFzdFRpbWUgPSBuZXh0VGltZSk7IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFRpbWUgLSBub3cpO1xyXG4gICAgfTtcclxuICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IGNsZWFyVGltZW91dDtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogUG9seWZpbGwgZm9yIHBlcmZvcm1hbmNlLm5vdywgcmVxdWlyZWQgYnkgckFGXHJcbiAgICovXHJcbiAgaWYoIXdpbmRvdy5wZXJmb3JtYW5jZSB8fCAhd2luZG93LnBlcmZvcm1hbmNlLm5vdyl7XHJcbiAgICB3aW5kb3cucGVyZm9ybWFuY2UgPSB7XHJcbiAgICAgIHN0YXJ0OiBEYXRlLm5vdygpLFxyXG4gICAgICBub3c6IGZ1bmN0aW9uKCl7IHJldHVybiBEYXRlLm5vdygpIC0gdGhpcy5zdGFydDsgfVxyXG4gICAgfTtcclxuICB9XHJcbn0pKCk7XHJcbmlmICghRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQpIHtcclxuICBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uKG9UaGlzKSB7XHJcbiAgICBpZiAodHlwZW9mIHRoaXMgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgLy8gY2xvc2VzdCB0aGluZyBwb3NzaWJsZSB0byB0aGUgRUNNQVNjcmlwdCA1XHJcbiAgICAgIC8vIGludGVybmFsIElzQ2FsbGFibGUgZnVuY3Rpb25cclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgLSB3aGF0IGlzIHRyeWluZyB0byBiZSBib3VuZCBpcyBub3QgY2FsbGFibGUnKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgYUFyZ3MgICA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXHJcbiAgICAgICAgZlRvQmluZCA9IHRoaXMsXHJcbiAgICAgICAgZk5PUCAgICA9IGZ1bmN0aW9uKCkge30sXHJcbiAgICAgICAgZkJvdW5kICA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgcmV0dXJuIGZUb0JpbmQuYXBwbHkodGhpcyBpbnN0YW5jZW9mIGZOT1BcclxuICAgICAgICAgICAgICAgICA/IHRoaXNcclxuICAgICAgICAgICAgICAgICA6IG9UaGlzLFxyXG4gICAgICAgICAgICAgICAgIGFBcmdzLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICBpZiAodGhpcy5wcm90b3R5cGUpIHtcclxuICAgICAgLy8gbmF0aXZlIGZ1bmN0aW9ucyBkb24ndCBoYXZlIGEgcHJvdG90eXBlXHJcbiAgICAgIGZOT1AucHJvdG90eXBlID0gdGhpcy5wcm90b3R5cGU7XHJcbiAgICB9XHJcbiAgICBmQm91bmQucHJvdG90eXBlID0gbmV3IGZOT1AoKTtcclxuXHJcbiAgICByZXR1cm4gZkJvdW5kO1xyXG4gIH07XHJcbn1cclxuLy8gUG9seWZpbGwgdG8gZ2V0IHRoZSBuYW1lIG9mIGEgZnVuY3Rpb24gaW4gSUU5XHJcbmZ1bmN0aW9uIGZ1bmN0aW9uTmFtZShmbikge1xyXG4gIGlmIChGdW5jdGlvbi5wcm90b3R5cGUubmFtZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICB2YXIgZnVuY05hbWVSZWdleCA9IC9mdW5jdGlvblxccyhbXihdezEsfSlcXCgvO1xyXG4gICAgdmFyIHJlc3VsdHMgPSAoZnVuY05hbWVSZWdleCkuZXhlYygoZm4pLnRvU3RyaW5nKCkpO1xyXG4gICAgcmV0dXJuIChyZXN1bHRzICYmIHJlc3VsdHMubGVuZ3RoID4gMSkgPyByZXN1bHRzWzFdLnRyaW0oKSA6IFwiXCI7XHJcbiAgfVxyXG4gIGVsc2UgaWYgKGZuLnByb3RvdHlwZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICByZXR1cm4gZm4uY29uc3RydWN0b3IubmFtZTtcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICByZXR1cm4gZm4ucHJvdG90eXBlLmNvbnN0cnVjdG9yLm5hbWU7XHJcbiAgfVxyXG59XHJcbmZ1bmN0aW9uIHBhcnNlVmFsdWUoc3RyKXtcclxuICBpZigvdHJ1ZS8udGVzdChzdHIpKSByZXR1cm4gdHJ1ZTtcclxuICBlbHNlIGlmKC9mYWxzZS8udGVzdChzdHIpKSByZXR1cm4gZmFsc2U7XHJcbiAgZWxzZSBpZighaXNOYU4oc3RyICogMSkpIHJldHVybiBwYXJzZUZsb2F0KHN0cik7XHJcbiAgcmV0dXJuIHN0cjtcclxufVxyXG4vLyBDb252ZXJ0IFBhc2NhbENhc2UgdG8ga2ViYWItY2FzZVxyXG4vLyBUaGFuayB5b3U6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzg5NTU1ODBcclxuZnVuY3Rpb24gaHlwaGVuYXRlKHN0cikge1xyXG4gIHJldHVybiBzdHIucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgJyQxLSQyJykudG9Mb3dlckNhc2UoKTtcclxufVxyXG5cclxufShqUXVlcnkpO1xyXG4iLCIhZnVuY3Rpb24oRm91bmRhdGlvbiwgd2luZG93KXtcclxuICAvKipcclxuICAgKiBDb21wYXJlcyB0aGUgZGltZW5zaW9ucyBvZiBhbiBlbGVtZW50IHRvIGEgY29udGFpbmVyIGFuZCBkZXRlcm1pbmVzIGNvbGxpc2lvbiBldmVudHMgd2l0aCBjb250YWluZXIuXHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHRlc3QgZm9yIGNvbGxpc2lvbnMuXHJcbiAgICogQHBhcmFtIHtqUXVlcnl9IHBhcmVudCAtIGpRdWVyeSBvYmplY3QgdG8gdXNlIGFzIGJvdW5kaW5nIGNvbnRhaW5lci5cclxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGxyT25seSAtIHNldCB0byB0cnVlIHRvIGNoZWNrIGxlZnQgYW5kIHJpZ2h0IHZhbHVlcyBvbmx5LlxyXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gdGJPbmx5IC0gc2V0IHRvIHRydWUgdG8gY2hlY2sgdG9wIGFuZCBib3R0b20gdmFsdWVzIG9ubHkuXHJcbiAgICogQGRlZmF1bHQgaWYgbm8gcGFyZW50IG9iamVjdCBwYXNzZWQsIGRldGVjdHMgY29sbGlzaW9ucyB3aXRoIGB3aW5kb3dgLlxyXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSAtIHRydWUgaWYgY29sbGlzaW9uIGZyZWUsIGZhbHNlIGlmIGEgY29sbGlzaW9uIGluIGFueSBkaXJlY3Rpb24uXHJcbiAgICovXHJcbiAgdmFyIEltTm90VG91Y2hpbmdZb3UgPSBmdW5jdGlvbihlbGVtZW50LCBwYXJlbnQsIGxyT25seSwgdGJPbmx5KXtcclxuICAgIHZhciBlbGVEaW1zID0gR2V0RGltZW5zaW9ucyhlbGVtZW50KSxcclxuICAgICAgICB0b3AsIGJvdHRvbSwgbGVmdCwgcmlnaHQ7XHJcblxyXG4gICAgaWYocGFyZW50KXtcclxuICAgICAgdmFyIHBhckRpbXMgPSBHZXREaW1lbnNpb25zKHBhcmVudCk7XHJcblxyXG4gICAgICBib3R0b20gPSAoZWxlRGltcy5vZmZzZXQudG9wICsgZWxlRGltcy5oZWlnaHQgPD0gcGFyRGltcy5oZWlnaHQgKyBwYXJEaW1zLm9mZnNldC50b3ApO1xyXG4gICAgICB0b3AgICAgPSAoZWxlRGltcy5vZmZzZXQudG9wID49IHBhckRpbXMub2Zmc2V0LnRvcCk7XHJcbiAgICAgIGxlZnQgICA9IChlbGVEaW1zLm9mZnNldC5sZWZ0ID49IHBhckRpbXMub2Zmc2V0LmxlZnQpO1xyXG4gICAgICByaWdodCAgPSAoZWxlRGltcy5vZmZzZXQubGVmdCArIGVsZURpbXMud2lkdGggPD0gcGFyRGltcy53aWR0aCk7XHJcbiAgICB9ZWxzZXtcclxuICAgICAgYm90dG9tID0gKGVsZURpbXMub2Zmc2V0LnRvcCArIGVsZURpbXMuaGVpZ2h0IDw9IGVsZURpbXMud2luZG93RGltcy5oZWlnaHQgKyBlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcCk7XHJcbiAgICAgIHRvcCAgICA9IChlbGVEaW1zLm9mZnNldC50b3AgPj0gZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3ApO1xyXG4gICAgICBsZWZ0ICAgPSAoZWxlRGltcy5vZmZzZXQubGVmdCA+PSBlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQpO1xyXG4gICAgICByaWdodCAgPSAoZWxlRGltcy5vZmZzZXQubGVmdCArIGVsZURpbXMud2lkdGggPD0gZWxlRGltcy53aW5kb3dEaW1zLndpZHRoKTtcclxuICAgIH1cclxuICAgIHZhciBhbGxEaXJzID0gW2JvdHRvbSwgdG9wLCBsZWZ0LCByaWdodF07XHJcblxyXG4gICAgaWYobHJPbmx5KXsgcmV0dXJuIGxlZnQgPT09IHJpZ2h0ID09PSB0cnVlOyB9XHJcbiAgICBpZih0Yk9ubHkpeyByZXR1cm4gdG9wID09PSBib3R0b20gPT09IHRydWU7IH1cclxuXHJcbiAgICByZXR1cm4gYWxsRGlycy5pbmRleE9mKGZhbHNlKSA9PT0gLTE7XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogVXNlcyBuYXRpdmUgbWV0aG9kcyB0byByZXR1cm4gYW4gb2JqZWN0IG9mIGRpbWVuc2lvbiB2YWx1ZXMuXHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICogQHBhcmFtIHtqUXVlcnkgfHwgSFRNTH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3Qgb3IgRE9NIGVsZW1lbnQgZm9yIHdoaWNoIHRvIGdldCB0aGUgZGltZW5zaW9ucy4gQ2FuIGJlIGFueSBlbGVtZW50IG90aGVyIHRoYXQgZG9jdW1lbnQgb3Igd2luZG93LlxyXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IC0gbmVzdGVkIG9iamVjdCBvZiBpbnRlZ2VyIHBpeGVsIHZhbHVlc1xyXG4gICAqIFRPRE8gLSBpZiBlbGVtZW50IGlzIHdpbmRvdywgcmV0dXJuIG9ubHkgdGhvc2UgdmFsdWVzLlxyXG4gICAqL1xyXG4gIHZhciBHZXREaW1lbnNpb25zID0gZnVuY3Rpb24oZWxlbSwgdGVzdCl7XHJcbiAgICBlbGVtID0gZWxlbS5sZW5ndGggPyBlbGVtWzBdIDogZWxlbTtcclxuXHJcbiAgICBpZihlbGVtID09PSB3aW5kb3cgfHwgZWxlbSA9PT0gZG9jdW1lbnQpeyB0aHJvdyBuZXcgRXJyb3IoXCJJJ20gc29ycnksIERhdmUuIEknbSBhZnJhaWQgSSBjYW4ndCBkbyB0aGF0LlwiKTsgfVxyXG5cclxuICAgIHZhciByZWN0ID0gZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcclxuICAgICAgICBwYXJSZWN0ID0gZWxlbS5wYXJlbnROb2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxyXG4gICAgICAgIHdpblJlY3QgPSBkb2N1bWVudC5ib2R5LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxyXG4gICAgICAgIHdpblkgPSB3aW5kb3cucGFnZVlPZmZzZXQsXHJcbiAgICAgICAgd2luWCA9IHdpbmRvdy5wYWdlWE9mZnNldDtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB3aWR0aDogcmVjdC53aWR0aCxcclxuICAgICAgaGVpZ2h0OiByZWN0LmhlaWdodCxcclxuICAgICAgb2Zmc2V0OiB7XHJcbiAgICAgICAgdG9wOiByZWN0LnRvcCArIHdpblksXHJcbiAgICAgICAgbGVmdDogcmVjdC5sZWZ0ICsgd2luWFxyXG4gICAgICB9LFxyXG4gICAgICBwYXJlbnREaW1zOiB7XHJcbiAgICAgICAgd2lkdGg6IHBhclJlY3Qud2lkdGgsXHJcbiAgICAgICAgaGVpZ2h0OiBwYXJSZWN0LmhlaWdodCxcclxuICAgICAgICBvZmZzZXQ6IHtcclxuICAgICAgICAgIHRvcDogcGFyUmVjdC50b3AgKyB3aW5ZLFxyXG4gICAgICAgICAgbGVmdDogcGFyUmVjdC5sZWZ0ICsgd2luWFxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgd2luZG93RGltczoge1xyXG4gICAgICAgIHdpZHRoOiB3aW5SZWN0LndpZHRoLFxyXG4gICAgICAgIGhlaWdodDogd2luUmVjdC5oZWlnaHQsXHJcbiAgICAgICAgb2Zmc2V0OiB7XHJcbiAgICAgICAgICB0b3A6IHdpblksXHJcbiAgICAgICAgICBsZWZ0OiB3aW5YXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBvYmplY3Qgb2YgdG9wIGFuZCBsZWZ0IGludGVnZXIgcGl4ZWwgdmFsdWVzIGZvciBkeW5hbWljYWxseSByZW5kZXJlZCBlbGVtZW50cyxcclxuICAgKiBzdWNoIGFzOiBUb29sdGlwLCBSZXZlYWwsIGFuZCBEcm9wZG93blxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCBmb3IgdGhlIGVsZW1lbnQgYmVpbmcgcG9zaXRpb25lZC5cclxuICAgKiBAcGFyYW0ge2pRdWVyeX0gYW5jaG9yIC0galF1ZXJ5IG9iamVjdCBmb3IgdGhlIGVsZW1lbnQncyBhbmNob3IgcG9pbnQuXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBvc2l0aW9uIC0gYSBzdHJpbmcgcmVsYXRpbmcgdG8gdGhlIGRlc2lyZWQgcG9zaXRpb24gb2YgdGhlIGVsZW1lbnQsIHJlbGF0aXZlIHRvIGl0J3MgYW5jaG9yXHJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHZPZmZzZXQgLSBpbnRlZ2VyIHBpeGVsIHZhbHVlIG9mIGRlc2lyZWQgdmVydGljYWwgc2VwYXJhdGlvbiBiZXR3ZWVuIGFuY2hvciBhbmQgZWxlbWVudC5cclxuICAgKiBAcGFyYW0ge051bWJlcn0gaE9mZnNldCAtIGludGVnZXIgcGl4ZWwgdmFsdWUgb2YgZGVzaXJlZCBob3Jpem9udGFsIHNlcGFyYXRpb24gYmV0d2VlbiBhbmNob3IgYW5kIGVsZW1lbnQuXHJcbiAgICogQHBhcmFtIHtCb29sZWFufSBpc092ZXJmbG93IC0gaWYgYSBjb2xsaXNpb24gZXZlbnQgaXMgZGV0ZWN0ZWQsIHNldHMgdG8gdHJ1ZSB0byBkZWZhdWx0IHRoZSBlbGVtZW50IHRvIGZ1bGwgd2lkdGggLSBhbnkgZGVzaXJlZCBvZmZzZXQuXHJcbiAgICogVE9ETyBhbHRlci9yZXdyaXRlIHRvIHdvcmsgd2l0aCBgZW1gIHZhbHVlcyBhcyB3ZWxsL2luc3RlYWQgb2YgcGl4ZWxzXHJcbiAgICovXHJcbiAgdmFyIEdldE9mZnNldHMgPSBmdW5jdGlvbihlbGVtZW50LCBhbmNob3IsIHBvc2l0aW9uLCB2T2Zmc2V0LCBoT2Zmc2V0LCBpc092ZXJmbG93KXtcclxuICAgIHZhciAkZWxlRGltcyA9IEdldERpbWVuc2lvbnMoZWxlbWVudCksXHJcbiAgICAvLyB2YXIgJGVsZURpbXMgPSBHZXREaW1lbnNpb25zKGVsZW1lbnQpLFxyXG4gICAgICAgICRhbmNob3JEaW1zID0gYW5jaG9yID8gR2V0RGltZW5zaW9ucyhhbmNob3IpIDogbnVsbDtcclxuICAgICAgICAvLyAkYW5jaG9yRGltcyA9IGFuY2hvciA/IEdldERpbWVuc2lvbnMoYW5jaG9yKSA6IG51bGw7XHJcbiAgICBzd2l0Y2gocG9zaXRpb24pe1xyXG4gICAgICBjYXNlICd0b3AnOlxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCxcclxuICAgICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCAtICgkZWxlRGltcy5oZWlnaHQgKyB2T2Zmc2V0KVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICgkZWxlRGltcy53aWR0aCArIGhPZmZzZXQpLFxyXG4gICAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wXHJcbiAgICAgICAgfTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAncmlnaHQnOlxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoICsgaE9mZnNldCxcclxuICAgICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2NlbnRlciB0b3AnOlxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBsZWZ0OiAoJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAoJGFuY2hvckRpbXMud2lkdGggLyAyKSkgLSAoJGVsZURpbXMud2lkdGggLyAyKSxcclxuICAgICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCAtICgkZWxlRGltcy5oZWlnaHQgKyB2T2Zmc2V0KVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2NlbnRlciBib3R0b20nOlxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBsZWZ0OiBpc092ZXJmbG93ID8gaE9mZnNldCA6ICgoJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAoJGFuY2hvckRpbXMud2lkdGggLyAyKSkgLSAoJGVsZURpbXMud2lkdGggLyAyKSksXHJcbiAgICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgKyB2T2Zmc2V0XHJcbiAgICAgICAgfTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnY2VudGVyIGxlZnQnOlxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICgkZWxlRGltcy53aWR0aCArIGhPZmZzZXQpLFxyXG4gICAgICAgICAgdG9wOiAoJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICgkYW5jaG9yRGltcy5oZWlnaHQgLyAyKSkgLSAoJGVsZURpbXMuaGVpZ2h0IC8gMilcclxuICAgICAgICB9O1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdjZW50ZXIgcmlnaHQnOlxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoICsgaE9mZnNldCArIDEsXHJcbiAgICAgICAgICB0b3A6ICgkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgKCRhbmNob3JEaW1zLmhlaWdodCAvIDIpKSAtICgkZWxlRGltcy5oZWlnaHQgLyAyKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2NlbnRlcic6XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIGxlZnQ6ICgkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC5sZWZ0ICsgKCRlbGVEaW1zLndpbmRvd0RpbXMud2lkdGggLyAyKSkgLSAoJGVsZURpbXMud2lkdGggLyAyKSxcclxuICAgICAgICAgIHRvcDogKCRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcCArICgkZWxlRGltcy53aW5kb3dEaW1zLmhlaWdodCAvIDIpKSAtICgkZWxlRGltcy5oZWlnaHQgLyAyKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3JldmVhbCc6XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIGxlZnQ6ICgkZWxlRGltcy53aW5kb3dEaW1zLndpZHRoIC0gJGVsZURpbXMud2lkdGgpIC8gMixcclxuICAgICAgICAgIHRvcDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wICsgdk9mZnNldFxyXG4gICAgICAgIH07XHJcbiAgICAgIGNhc2UgJ3JldmVhbCBmdWxsJzpcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgbGVmdDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQubGVmdCxcclxuICAgICAgICAgIHRvcDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wXHJcbiAgICAgICAgfTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQsXHJcbiAgICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgKyB2T2Zmc2V0XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICB9O1xyXG4gIEZvdW5kYXRpb24uQm94ID0ge1xyXG4gICAgSW1Ob3RUb3VjaGluZ1lvdTogSW1Ob3RUb3VjaGluZ1lvdSxcclxuICAgIEdldERpbWVuc2lvbnM6IEdldERpbWVuc2lvbnMsXHJcbiAgICBHZXRPZmZzZXRzOiBHZXRPZmZzZXRzXHJcbiAgfTtcclxufSh3aW5kb3cuRm91bmRhdGlvbiwgd2luZG93KTtcclxuIiwiLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcclxuICogVGhpcyB1dGlsIHdhcyBjcmVhdGVkIGJ5IE1hcml1cyBPbGJlcnR6ICpcclxuICogUGxlYXNlIHRoYW5rIE1hcml1cyBvbiBHaXRIdWIgL293bGJlcnR6ICpcclxuICogb3IgdGhlIHdlYiBodHRwOi8vd3d3Lm1hcml1c29sYmVydHouZGUvICpcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcclxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuIWZ1bmN0aW9uKCQsIEZvdW5kYXRpb24pe1xyXG4gICd1c2Ugc3RyaWN0JztcclxuICBGb3VuZGF0aW9uLktleWJvYXJkID0ge307XHJcblxyXG4gIHZhciBrZXlDb2RlcyA9IHtcclxuICAgIDk6ICdUQUInLFxyXG4gICAgMTM6ICdFTlRFUicsXHJcbiAgICAyNzogJ0VTQ0FQRScsXHJcbiAgICAzMjogJ1NQQUNFJyxcclxuICAgIDM3OiAnQVJST1dfTEVGVCcsXHJcbiAgICAzODogJ0FSUk9XX1VQJyxcclxuICAgIDM5OiAnQVJST1dfUklHSFQnLFxyXG4gICAgNDA6ICdBUlJPV19ET1dOJ1xyXG4gIH07XHJcblxyXG4gIC8qXHJcbiAgICogQ29uc3RhbnRzIGZvciBlYXNpZXIgY29tcGFyaW5nLlxyXG4gICAqIENhbiBiZSB1c2VkIGxpa2UgRm91bmRhdGlvbi5wYXJzZUtleShldmVudCkgPT09IEZvdW5kYXRpb24ua2V5cy5TUEFDRVxyXG4gICAqL1xyXG4gIHZhciBrZXlzID0gKGZ1bmN0aW9uKGtjcykge1xyXG4gICAgdmFyIGsgPSB7fTtcclxuICAgIGZvciAodmFyIGtjIGluIGtjcykga1trY3Nba2NdXSA9IGtjc1trY107XHJcbiAgICByZXR1cm4gaztcclxuICB9KShrZXlDb2Rlcyk7XHJcblxyXG4gIEZvdW5kYXRpb24uS2V5Ym9hcmQua2V5cyA9IGtleXM7XHJcblxyXG4gIC8qKlxyXG4gICAqIFBhcnNlcyB0aGUgKGtleWJvYXJkKSBldmVudCBhbmQgcmV0dXJucyBhIFN0cmluZyB0aGF0IHJlcHJlc2VudHMgaXRzIGtleVxyXG4gICAqIENhbiBiZSB1c2VkIGxpa2UgRm91bmRhdGlvbi5wYXJzZUtleShldmVudCkgPT09IEZvdW5kYXRpb24ua2V5cy5TUEFDRVxyXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gdGhlIGV2ZW50IGdlbmVyYXRlZCBieSB0aGUgZXZlbnQgaGFuZGxlclxyXG4gICAqIEByZXR1cm4gU3RyaW5nIGtleSAtIFN0cmluZyB0aGF0IHJlcHJlc2VudHMgdGhlIGtleSBwcmVzc2VkXHJcbiAgICovXHJcbiAgdmFyIHBhcnNlS2V5ID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHZhciBrZXkgPSBrZXlDb2Rlc1tldmVudC53aGljaCB8fCBldmVudC5rZXlDb2RlXSB8fCBTdHJpbmcuZnJvbUNoYXJDb2RlKGV2ZW50LndoaWNoKS50b1VwcGVyQ2FzZSgpO1xyXG4gICAgaWYgKGV2ZW50LnNoaWZ0S2V5KSBrZXkgPSAnU0hJRlRfJyArIGtleTtcclxuICAgIGlmIChldmVudC5jdHJsS2V5KSBrZXkgPSAnQ1RSTF8nICsga2V5O1xyXG4gICAgaWYgKGV2ZW50LmFsdEtleSkga2V5ID0gJ0FMVF8nICsga2V5O1xyXG4gICAgcmV0dXJuIGtleTtcclxuICB9O1xyXG4gIEZvdW5kYXRpb24uS2V5Ym9hcmQucGFyc2VLZXkgPSBwYXJzZUtleTtcclxuXHJcblxyXG4gIC8vIHBsYWluIGNvbW1hbmRzIHBlciBjb21wb25lbnQgZ28gaGVyZSwgbHRyIGFuZCBydGwgYXJlIG1lcmdlZCBiYXNlZCBvbiBvcmllbnRhdGlvblxyXG4gIHZhciBjb21tYW5kcyA9IHt9O1xyXG5cclxuICAvKipcclxuICAgKiBIYW5kbGVzIHRoZSBnaXZlbiAoa2V5Ym9hcmQpIGV2ZW50XHJcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgLSB0aGUgZXZlbnQgZ2VuZXJhdGVkIGJ5IHRoZSBldmVudCBoYW5kbGVyXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGNvbXBvbmVudCAtIEZvdW5kYXRpb24gY29tcG9uZW50J3MgbmFtZSwgZS5nLiBTbGlkZXIgb3IgUmV2ZWFsXHJcbiAgICogQHBhcmFtIHtPYmplY3RzfSBmdW5jdGlvbnMgLSBjb2xsZWN0aW9uIG9mIGZ1bmN0aW9ucyB0aGF0IGFyZSB0byBiZSBleGVjdXRlZFxyXG4gICAqL1xyXG4gIHZhciBoYW5kbGVLZXkgPSBmdW5jdGlvbihldmVudCwgY29tcG9uZW50LCBmdW5jdGlvbnMpIHtcclxuICAgIHZhciBjb21tYW5kTGlzdCA9IGNvbW1hbmRzW2NvbXBvbmVudF0sXHJcbiAgICAgIGtleUNvZGUgPSBwYXJzZUtleShldmVudCksXHJcbiAgICAgIGNtZHMsXHJcbiAgICAgIGNvbW1hbmQsXHJcbiAgICAgIGZuO1xyXG4gICAgaWYgKCFjb21tYW5kTGlzdCkgcmV0dXJuIGNvbnNvbGUud2FybignQ29tcG9uZW50IG5vdCBkZWZpbmVkIScpO1xyXG5cclxuICAgIGlmICh0eXBlb2YgY29tbWFuZExpc3QubHRyID09PSAndW5kZWZpbmVkJykgeyAvLyB0aGlzIGNvbXBvbmVudCBkb2VzIG5vdCBkaWZmZXJlbnRpYXRlIGJldHdlZW4gbHRyIGFuZCBydGxcclxuICAgICAgICBjbWRzID0gY29tbWFuZExpc3Q7IC8vIHVzZSBwbGFpbiBsaXN0XHJcbiAgICB9IGVsc2UgeyAvLyBtZXJnZSBsdHIgYW5kIHJ0bDogaWYgZG9jdW1lbnQgaXMgcnRsLCBydGwgb3ZlcndyaXRlcyBsdHIgYW5kIHZpY2UgdmVyc2FcclxuICAgICAgICBpZiAoRm91bmRhdGlvbi5ydGwoKSkgY21kcyA9ICQuZXh0ZW5kKHt9LCBjb21tYW5kTGlzdC5sdHIsIGNvbW1hbmRMaXN0LnJ0bCk7XHJcblxyXG4gICAgICAgIGVsc2UgY21kcyA9ICQuZXh0ZW5kKHt9LCBjb21tYW5kTGlzdC5ydGwsIGNvbW1hbmRMaXN0Lmx0cik7XHJcbiAgICB9XHJcbiAgICBjb21tYW5kID0gY21kc1trZXlDb2RlXTtcclxuXHJcblxyXG4gICAgZm4gPSBmdW5jdGlvbnNbY29tbWFuZF07XHJcbiAgICBpZiAoZm4gJiYgdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7IC8vIGV4ZWN1dGUgZnVuY3Rpb24gIGlmIGV4aXN0c1xyXG4gICAgICAgIGZuLmFwcGx5KCk7XHJcbiAgICAgICAgaWYgKGZ1bmN0aW9ucy5oYW5kbGVkIHx8IHR5cGVvZiBmdW5jdGlvbnMuaGFuZGxlZCA9PT0gJ2Z1bmN0aW9uJykgeyAvLyBleGVjdXRlIGZ1bmN0aW9uIHdoZW4gZXZlbnQgd2FzIGhhbmRsZWRcclxuICAgICAgICAgICAgZnVuY3Rpb25zLmhhbmRsZWQuYXBwbHkoKTtcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmIChmdW5jdGlvbnMudW5oYW5kbGVkIHx8IHR5cGVvZiBmdW5jdGlvbnMudW5oYW5kbGVkID09PSAnZnVuY3Rpb24nKSB7IC8vIGV4ZWN1dGUgZnVuY3Rpb24gd2hlbiBldmVudCB3YXMgbm90IGhhbmRsZWRcclxuICAgICAgICAgICAgZnVuY3Rpb25zLnVuaGFuZGxlZC5hcHBseSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG4gIEZvdW5kYXRpb24uS2V5Ym9hcmQuaGFuZGxlS2V5ID0gaGFuZGxlS2V5O1xyXG5cclxuICAvKipcclxuICAgKiBGaW5kcyBhbGwgZm9jdXNhYmxlIGVsZW1lbnRzIHdpdGhpbiB0aGUgZ2l2ZW4gYCRlbGVtZW50YFxyXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gc2VhcmNoIHdpdGhpblxyXG4gICAqIEByZXR1cm4ge2pRdWVyeX0gJGZvY3VzYWJsZSAtIGFsbCBmb2N1c2FibGUgZWxlbWVudHMgd2l0aGluIGAkZWxlbWVudGBcclxuICAgKi9cclxuICB2YXIgZmluZEZvY3VzYWJsZSA9IGZ1bmN0aW9uKCRlbGVtZW50KSB7XHJcbiAgICByZXR1cm4gJGVsZW1lbnQuZmluZCgnYVtocmVmXSwgYXJlYVtocmVmXSwgaW5wdXQ6bm90KFtkaXNhYmxlZF0pLCBzZWxlY3Q6bm90KFtkaXNhYmxlZF0pLCB0ZXh0YXJlYTpub3QoW2Rpc2FibGVkXSksIGJ1dHRvbjpub3QoW2Rpc2FibGVkXSksIGlmcmFtZSwgb2JqZWN0LCBlbWJlZCwgKlt0YWJpbmRleF0sICpbY29udGVudGVkaXRhYmxlXScpLmZpbHRlcihmdW5jdGlvbigpIHtcclxuICAgICAgaWYgKCEkKHRoaXMpLmlzKCc6dmlzaWJsZScpIHx8ICQodGhpcykuYXR0cigndGFiaW5kZXgnKSA8IDApIHsgcmV0dXJuIGZhbHNlOyB9IC8vb25seSBoYXZlIHZpc2libGUgZWxlbWVudHMgYW5kIHRob3NlIHRoYXQgaGF2ZSBhIHRhYmluZGV4IGdyZWF0ZXIgb3IgZXF1YWwgMFxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0pO1xyXG4gIH07XHJcbiAgRm91bmRhdGlvbi5LZXlib2FyZC5maW5kRm9jdXNhYmxlID0gZmluZEZvY3VzYWJsZTtcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgY29tcG9uZW50IG5hbWUgbmFtZVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb21wb25lbnQgLSBGb3VuZGF0aW9uIGNvbXBvbmVudCwgZS5nLiBTbGlkZXIgb3IgUmV2ZWFsXHJcbiAgICogQHJldHVybiBTdHJpbmcgY29tcG9uZW50TmFtZVxyXG4gICAqL1xyXG5cclxuICB2YXIgcmVnaXN0ZXIgPSBmdW5jdGlvbihjb21wb25lbnROYW1lLCBjbWRzKSB7XHJcbiAgICBjb21tYW5kc1tjb21wb25lbnROYW1lXSA9IGNtZHM7XHJcbiAgfTtcclxuICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyID0gcmVnaXN0ZXI7XHJcbn0oalF1ZXJ5LCB3aW5kb3cuRm91bmRhdGlvbik7XHJcbiIsIiFmdW5jdGlvbigkLCBGb3VuZGF0aW9uKSB7XHJcblxyXG4vLyBEZWZhdWx0IHNldCBvZiBtZWRpYSBxdWVyaWVzXHJcbnZhciBkZWZhdWx0UXVlcmllcyA9IHtcclxuICAnZGVmYXVsdCcgOiAnb25seSBzY3JlZW4nLFxyXG4gIGxhbmRzY2FwZSA6ICdvbmx5IHNjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBsYW5kc2NhcGUpJyxcclxuICBwb3J0cmFpdCA6ICdvbmx5IHNjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBwb3J0cmFpdCknLFxyXG4gIHJldGluYSA6ICdvbmx5IHNjcmVlbiBhbmQgKC13ZWJraXQtbWluLWRldmljZS1waXhlbC1yYXRpbzogMiksJyArXHJcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tLW1vei1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgK1xyXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAoLW8tbWluLWRldmljZS1waXhlbC1yYXRpbzogMi8xKSwnICtcclxuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgK1xyXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAobWluLXJlc29sdXRpb246IDE5MmRwaSksJyArXHJcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tcmVzb2x1dGlvbjogMmRwcHgpJ1xyXG59O1xyXG5cclxudmFyIE1lZGlhUXVlcnkgPSB7XHJcbiAgcXVlcmllczogW10sXHJcbiAgY3VycmVudDogJycsXHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrcyBpZiB0aGUgc2NyZWVuIGlzIGF0IGxlYXN0IGFzIHdpZGUgYXMgYSBicmVha3BvaW50LlxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzaXplIC0gTmFtZSBvZiB0aGUgYnJlYWtwb2ludCB0byBjaGVjay5cclxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gYHRydWVgIGlmIHRoZSBicmVha3BvaW50IG1hdGNoZXMsIGBmYWxzZWAgaWYgaXQncyBzbWFsbGVyLlxyXG4gICAqL1xyXG4gIGF0TGVhc3Q6IGZ1bmN0aW9uKHNpemUpIHtcclxuICAgIHZhciBxdWVyeSA9IHRoaXMuZ2V0KHNpemUpO1xyXG5cclxuICAgIGlmIChxdWVyeSkge1xyXG4gICAgICByZXR1cm4gd2luZG93Lm1hdGNoTWVkaWEocXVlcnkpLm1hdGNoZXM7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIG1lZGlhIHF1ZXJ5IG9mIGEgYnJlYWtwb2ludC5cclxuICAgKiBAZnVuY3Rpb25cclxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2l6ZSAtIE5hbWUgb2YgdGhlIGJyZWFrcG9pbnQgdG8gZ2V0LlxyXG4gICAqIEByZXR1cm5zIHtTdHJpbmd8bnVsbH0gLSBUaGUgbWVkaWEgcXVlcnkgb2YgdGhlIGJyZWFrcG9pbnQsIG9yIGBudWxsYCBpZiB0aGUgYnJlYWtwb2ludCBkb2Vzbid0IGV4aXN0LlxyXG4gICAqL1xyXG4gIGdldDogZnVuY3Rpb24oc2l6ZSkge1xyXG4gICAgZm9yICh2YXIgaSBpbiB0aGlzLnF1ZXJpZXMpIHtcclxuICAgICAgdmFyIHF1ZXJ5ID0gdGhpcy5xdWVyaWVzW2ldO1xyXG4gICAgICBpZiAoc2l6ZSA9PT0gcXVlcnkubmFtZSkgcmV0dXJuIHF1ZXJ5LnZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEluaXRpYWxpemVzIHRoZSBtZWRpYSBxdWVyeSBoZWxwZXIsIGJ5IGV4dHJhY3RpbmcgdGhlIGJyZWFrcG9pbnQgbGlzdCBmcm9tIHRoZSBDU1MgYW5kIGFjdGl2YXRpbmcgdGhlIGJyZWFrcG9pbnQgd2F0Y2hlci5cclxuICAgKiBAZnVuY3Rpb25cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIF9pbml0OiBmdW5jdGlvbigpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgIHZhciBleHRyYWN0ZWRTdHlsZXMgPSAkKCcuZm91bmRhdGlvbi1tcScpLmNzcygnZm9udC1mYW1pbHknKTtcclxuICAgIHZhciBuYW1lZFF1ZXJpZXM7XHJcblxyXG4gICAgbmFtZWRRdWVyaWVzID0gcGFyc2VTdHlsZVRvT2JqZWN0KGV4dHJhY3RlZFN0eWxlcyk7XHJcblxyXG4gICAgZm9yICh2YXIga2V5IGluIG5hbWVkUXVlcmllcykge1xyXG4gICAgICBzZWxmLnF1ZXJpZXMucHVzaCh7XHJcbiAgICAgICAgbmFtZToga2V5LFxyXG4gICAgICAgIHZhbHVlOiAnb25seSBzY3JlZW4gYW5kIChtaW4td2lkdGg6ICcgKyBuYW1lZFF1ZXJpZXNba2V5XSArICcpJ1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLl9nZXRDdXJyZW50U2l6ZSgpO1xyXG5cclxuICAgIHRoaXMuX3dhdGNoZXIoKTtcclxuXHJcbiAgICAvLyBFeHRlbmQgZGVmYXVsdCBxdWVyaWVzXHJcbiAgICAvLyBuYW1lZFF1ZXJpZXMgPSAkLmV4dGVuZChkZWZhdWx0UXVlcmllcywgbmFtZWRRdWVyaWVzKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBjdXJyZW50IGJyZWFrcG9pbnQgbmFtZSBieSB0ZXN0aW5nIGV2ZXJ5IGJyZWFrcG9pbnQgYW5kIHJldHVybmluZyB0aGUgbGFzdCBvbmUgdG8gbWF0Y2ggKHRoZSBiaWdnZXN0IG9uZSkuXHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcmV0dXJucyB7U3RyaW5nfSBOYW1lIG9mIHRoZSBjdXJyZW50IGJyZWFrcG9pbnQuXHJcbiAgICovXHJcbiAgX2dldEN1cnJlbnRTaXplOiBmdW5jdGlvbigpIHtcclxuICAgIHZhciBtYXRjaGVkO1xyXG5cclxuICAgIGZvciAodmFyIGkgaW4gdGhpcy5xdWVyaWVzKSB7XHJcbiAgICAgIHZhciBxdWVyeSA9IHRoaXMucXVlcmllc1tpXTtcclxuXHJcbiAgICAgIGlmICh3aW5kb3cubWF0Y2hNZWRpYShxdWVyeS52YWx1ZSkubWF0Y2hlcykge1xyXG4gICAgICAgIG1hdGNoZWQgPSBxdWVyeTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmKHR5cGVvZiBtYXRjaGVkID09PSAnb2JqZWN0Jykge1xyXG4gICAgICByZXR1cm4gbWF0Y2hlZC5uYW1lO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIG1hdGNoZWQ7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQWN0aXZhdGVzIHRoZSBicmVha3BvaW50IHdhdGNoZXIsIHdoaWNoIGZpcmVzIGFuIGV2ZW50IG9uIHRoZSB3aW5kb3cgd2hlbmV2ZXIgdGhlIGJyZWFrcG9pbnQgY2hhbmdlcy5cclxuICAgKiBAZnVuY3Rpb25cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIF93YXRjaGVyOiBmdW5jdGlvbigpIHtcclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcblxyXG4gICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuemYubWVkaWFxdWVyeScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgbmV3U2l6ZSA9IF90aGlzLl9nZXRDdXJyZW50U2l6ZSgpO1xyXG5cclxuICAgICAgaWYgKG5ld1NpemUgIT09IF90aGlzLmN1cnJlbnQpIHtcclxuICAgICAgICAvLyBCcm9hZGNhc3QgdGhlIG1lZGlhIHF1ZXJ5IGNoYW5nZSBvbiB0aGUgd2luZG93XHJcbiAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIFtuZXdTaXplLCBfdGhpcy5jdXJyZW50XSk7XHJcblxyXG4gICAgICAgIC8vIENoYW5nZSB0aGUgY3VycmVudCBtZWRpYSBxdWVyeVxyXG4gICAgICAgIF90aGlzLmN1cnJlbnQgPSBuZXdTaXplO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbn07XHJcblxyXG5Gb3VuZGF0aW9uLk1lZGlhUXVlcnkgPSBNZWRpYVF1ZXJ5O1xyXG5cclxuLy8gbWF0Y2hNZWRpYSgpIHBvbHlmaWxsIC0gVGVzdCBhIENTUyBtZWRpYSB0eXBlL3F1ZXJ5IGluIEpTLlxyXG4vLyBBdXRob3JzICYgY29weXJpZ2h0IChjKSAyMDEyOiBTY290dCBKZWhsLCBQYXVsIElyaXNoLCBOaWNob2xhcyBaYWthcywgRGF2aWQgS25pZ2h0LiBEdWFsIE1JVC9CU0QgbGljZW5zZVxyXG53aW5kb3cubWF0Y2hNZWRpYSB8fCAod2luZG93Lm1hdGNoTWVkaWEgPSBmdW5jdGlvbigpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIC8vIEZvciBicm93c2VycyB0aGF0IHN1cHBvcnQgbWF0Y2hNZWRpdW0gYXBpIHN1Y2ggYXMgSUUgOSBhbmQgd2Via2l0XHJcbiAgdmFyIHN0eWxlTWVkaWEgPSAod2luZG93LnN0eWxlTWVkaWEgfHwgd2luZG93Lm1lZGlhKTtcclxuXHJcbiAgLy8gRm9yIHRob3NlIHRoYXQgZG9uJ3Qgc3VwcG9ydCBtYXRjaE1lZGl1bVxyXG4gIGlmICghc3R5bGVNZWRpYSkge1xyXG4gICAgdmFyIHN0eWxlICAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpLFxyXG4gICAgc2NyaXB0ICAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF0sXHJcbiAgICBpbmZvICAgICAgICA9IG51bGw7XHJcblxyXG4gICAgc3R5bGUudHlwZSAgPSAndGV4dC9jc3MnO1xyXG4gICAgc3R5bGUuaWQgICAgPSAnbWF0Y2htZWRpYWpzLXRlc3QnO1xyXG5cclxuICAgIHNjcmlwdC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzdHlsZSwgc2NyaXB0KTtcclxuXHJcbiAgICAvLyAnc3R5bGUuY3VycmVudFN0eWxlJyBpcyB1c2VkIGJ5IElFIDw9IDggYW5kICd3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZScgZm9yIGFsbCBvdGhlciBicm93c2Vyc1xyXG4gICAgaW5mbyA9ICgnZ2V0Q29tcHV0ZWRTdHlsZScgaW4gd2luZG93KSAmJiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShzdHlsZSwgbnVsbCkgfHwgc3R5bGUuY3VycmVudFN0eWxlO1xyXG5cclxuICAgIHN0eWxlTWVkaWEgPSB7XHJcbiAgICAgIG1hdGNoTWVkaXVtOiBmdW5jdGlvbihtZWRpYSkge1xyXG4gICAgICAgIHZhciB0ZXh0ID0gJ0BtZWRpYSAnICsgbWVkaWEgKyAneyAjbWF0Y2htZWRpYWpzLXRlc3QgeyB3aWR0aDogMXB4OyB9IH0nO1xyXG5cclxuICAgICAgICAvLyAnc3R5bGUuc3R5bGVTaGVldCcgaXMgdXNlZCBieSBJRSA8PSA4IGFuZCAnc3R5bGUudGV4dENvbnRlbnQnIGZvciBhbGwgb3RoZXIgYnJvd3NlcnNcclxuICAgICAgICBpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xyXG4gICAgICAgICAgc3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gdGV4dDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc3R5bGUudGV4dENvbnRlbnQgPSB0ZXh0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVGVzdCBpZiBtZWRpYSBxdWVyeSBpcyB0cnVlIG9yIGZhbHNlXHJcbiAgICAgICAgcmV0dXJuIGluZm8ud2lkdGggPT09ICcxcHgnO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGZ1bmN0aW9uKG1lZGlhKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBtYXRjaGVzOiBzdHlsZU1lZGlhLm1hdGNoTWVkaXVtKG1lZGlhIHx8ICdhbGwnKSxcclxuICAgICAgbWVkaWE6IG1lZGlhIHx8ICdhbGwnXHJcbiAgICB9O1xyXG4gIH07XHJcbn0oKSk7XHJcblxyXG4vLyBUaGFuayB5b3U6IGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvcXVlcnktc3RyaW5nXHJcbmZ1bmN0aW9uIHBhcnNlU3R5bGVUb09iamVjdChzdHIpIHtcclxuICB2YXIgc3R5bGVPYmplY3QgPSB7fTtcclxuXHJcbiAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XHJcbiAgICByZXR1cm4gc3R5bGVPYmplY3Q7XHJcbiAgfVxyXG5cclxuICBzdHIgPSBzdHIudHJpbSgpLnNsaWNlKDEsIC0xKTsgLy8gYnJvd3NlcnMgcmUtcXVvdGUgc3RyaW5nIHN0eWxlIHZhbHVlc1xyXG5cclxuICBpZiAoIXN0cikge1xyXG4gICAgcmV0dXJuIHN0eWxlT2JqZWN0O1xyXG4gIH1cclxuXHJcbiAgc3R5bGVPYmplY3QgPSBzdHIuc3BsaXQoJyYnKS5yZWR1Y2UoZnVuY3Rpb24ocmV0LCBwYXJhbSkge1xyXG4gICAgdmFyIHBhcnRzID0gcGFyYW0ucmVwbGFjZSgvXFwrL2csICcgJykuc3BsaXQoJz0nKTtcclxuICAgIHZhciBrZXkgPSBwYXJ0c1swXTtcclxuICAgIHZhciB2YWwgPSBwYXJ0c1sxXTtcclxuICAgIGtleSA9IGRlY29kZVVSSUNvbXBvbmVudChrZXkpO1xyXG5cclxuICAgIC8vIG1pc3NpbmcgYD1gIHNob3VsZCBiZSBgbnVsbGA6XHJcbiAgICAvLyBodHRwOi8vdzMub3JnL1RSLzIwMTIvV0QtdXJsLTIwMTIwNTI0LyNjb2xsZWN0LXVybC1wYXJhbWV0ZXJzXHJcbiAgICB2YWwgPSB2YWwgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBkZWNvZGVVUklDb21wb25lbnQodmFsKTtcclxuXHJcbiAgICBpZiAoIXJldC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgIHJldFtrZXldID0gdmFsO1xyXG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJldFtrZXldKSkge1xyXG4gICAgICByZXRba2V5XS5wdXNoKHZhbCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXRba2V5XSA9IFtyZXRba2V5XSwgdmFsXTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXQ7XHJcbiAgfSwge30pO1xyXG5cclxuICByZXR1cm4gc3R5bGVPYmplY3Q7XHJcbn1cclxuXHJcbn0oalF1ZXJ5LCBGb3VuZGF0aW9uKTtcclxuIiwiLyoqXHJcbiAqIE1vdGlvbiBtb2R1bGUuXHJcbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5tb3Rpb25cclxuICovXHJcbiFmdW5jdGlvbigkLCBGb3VuZGF0aW9uKSB7XHJcblxyXG52YXIgaW5pdENsYXNzZXMgICA9IFsnbXVpLWVudGVyJywgJ211aS1sZWF2ZSddO1xyXG52YXIgYWN0aXZlQ2xhc3NlcyA9IFsnbXVpLWVudGVyLWFjdGl2ZScsICdtdWktbGVhdmUtYWN0aXZlJ107XHJcblxyXG5mdW5jdGlvbiBhbmltYXRlKGlzSW4sIGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpIHtcclxuICBlbGVtZW50ID0gJChlbGVtZW50KS5lcSgwKTtcclxuXHJcbiAgaWYgKCFlbGVtZW50Lmxlbmd0aCkgcmV0dXJuO1xyXG5cclxuICB2YXIgaW5pdENsYXNzID0gaXNJbiA/IGluaXRDbGFzc2VzWzBdIDogaW5pdENsYXNzZXNbMV07XHJcbiAgdmFyIGFjdGl2ZUNsYXNzID0gaXNJbiA/IGFjdGl2ZUNsYXNzZXNbMF0gOiBhY3RpdmVDbGFzc2VzWzFdO1xyXG5cclxuICAvLyBTZXQgdXAgdGhlIGFuaW1hdGlvblxyXG4gIHJlc2V0KCk7XHJcbiAgZWxlbWVudC5hZGRDbGFzcyhhbmltYXRpb24pXHJcbiAgICAgICAgIC5jc3MoJ3RyYW5zaXRpb24nLCAnbm9uZScpO1xyXG4gICAgICAgIC8vICAuYWRkQ2xhc3MoaW5pdENsYXNzKTtcclxuICAvLyBpZihpc0luKSBlbGVtZW50LnNob3coKTtcclxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XHJcbiAgICBlbGVtZW50LmFkZENsYXNzKGluaXRDbGFzcyk7XHJcbiAgICBpZiAoaXNJbikgZWxlbWVudC5zaG93KCk7XHJcbiAgfSk7XHJcbiAgLy8gU3RhcnQgdGhlIGFuaW1hdGlvblxyXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcclxuICAgIGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGg7XHJcbiAgICBlbGVtZW50LmNzcygndHJhbnNpdGlvbicsICcnKTtcclxuICAgIGVsZW1lbnQuYWRkQ2xhc3MoYWN0aXZlQ2xhc3MpO1xyXG4gIH0pO1xyXG4gIC8vIE1vdmUoNTAwLCBlbGVtZW50LCBmdW5jdGlvbigpe1xyXG4gIC8vICAgLy8gZWxlbWVudFswXS5vZmZzZXRXaWR0aDtcclxuICAvLyAgIGVsZW1lbnQuY3NzKCd0cmFuc2l0aW9uJywgJycpO1xyXG4gIC8vICAgZWxlbWVudC5hZGRDbGFzcyhhY3RpdmVDbGFzcyk7XHJcbiAgLy8gfSk7XHJcblxyXG4gIC8vIENsZWFuIHVwIHRoZSBhbmltYXRpb24gd2hlbiBpdCBmaW5pc2hlc1xyXG4gIGVsZW1lbnQub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZChlbGVtZW50KSwgZmluaXNoKTsvLy5vbmUoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBmaW5pc2gpO1xyXG5cclxuICAvLyBIaWRlcyB0aGUgZWxlbWVudCAoZm9yIG91dCBhbmltYXRpb25zKSwgcmVzZXRzIHRoZSBlbGVtZW50LCBhbmQgcnVucyBhIGNhbGxiYWNrXHJcbiAgZnVuY3Rpb24gZmluaXNoKCkge1xyXG4gICAgaWYgKCFpc0luKSBlbGVtZW50LmhpZGUoKTtcclxuICAgIHJlc2V0KCk7XHJcbiAgICBpZiAoY2IpIGNiLmFwcGx5KGVsZW1lbnQpO1xyXG4gIH1cclxuXHJcbiAgLy8gUmVzZXRzIHRyYW5zaXRpb25zIGFuZCByZW1vdmVzIG1vdGlvbi1zcGVjaWZpYyBjbGFzc2VzXHJcbiAgZnVuY3Rpb24gcmVzZXQoKSB7XHJcbiAgICBlbGVtZW50WzBdLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IDA7XHJcbiAgICBlbGVtZW50LnJlbW92ZUNsYXNzKGluaXRDbGFzcyArICcgJyArIGFjdGl2ZUNsYXNzICsgJyAnICsgYW5pbWF0aW9uKTtcclxuICB9XHJcbn1cclxuXHJcbnZhciBNb3Rpb24gPSB7XHJcbiAgYW5pbWF0ZUluOiBmdW5jdGlvbihlbGVtZW50LCBhbmltYXRpb24sIC8qZHVyYXRpb24sKi8gY2IpIHtcclxuICAgIGFuaW1hdGUodHJ1ZSwgZWxlbWVudCwgYW5pbWF0aW9uLCBjYik7XHJcbiAgfSxcclxuXHJcbiAgYW5pbWF0ZU91dDogZnVuY3Rpb24oZWxlbWVudCwgYW5pbWF0aW9uLCAvKmR1cmF0aW9uLCovIGNiKSB7XHJcbiAgICBhbmltYXRlKGZhbHNlLCBlbGVtZW50LCBhbmltYXRpb24sIGNiKTtcclxuICB9XHJcbn07XHJcblxyXG52YXIgTW92ZSA9IGZ1bmN0aW9uKGR1cmF0aW9uLCBlbGVtLCBmbil7XHJcbiAgdmFyIGFuaW0sIHByb2csIHN0YXJ0ID0gbnVsbDtcclxuICAvLyBjb25zb2xlLmxvZygnY2FsbGVkJyk7XHJcblxyXG4gIGZ1bmN0aW9uIG1vdmUodHMpe1xyXG4gICAgaWYoIXN0YXJ0KSBzdGFydCA9IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKTtcclxuICAgIC8vIGNvbnNvbGUubG9nKHN0YXJ0LCB0cyk7XHJcbiAgICBwcm9nID0gdHMgLSBzdGFydDtcclxuICAgIGZuLmFwcGx5KGVsZW0pO1xyXG5cclxuICAgIGlmKHByb2cgPCBkdXJhdGlvbil7IGFuaW0gPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1vdmUsIGVsZW0pOyB9XHJcbiAgICBlbHNle1xyXG4gICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbSk7XHJcbiAgICAgIGVsZW0udHJpZ2dlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSkudHJpZ2dlckhhbmRsZXIoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBbZWxlbV0pO1xyXG4gICAgfVxyXG4gIH1cclxuICBhbmltID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShtb3ZlKTtcclxufTtcclxuXHJcbkZvdW5kYXRpb24uTW92ZSA9IE1vdmU7XHJcbkZvdW5kYXRpb24uTW90aW9uID0gTW90aW9uO1xyXG5cclxufShqUXVlcnksIEZvdW5kYXRpb24pO1xyXG4iLCIhZnVuY3Rpb24oJCwgRm91bmRhdGlvbil7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG4gIEZvdW5kYXRpb24uTmVzdCA9IHtcclxuICAgIEZlYXRoZXI6IGZ1bmN0aW9uKG1lbnUsIHR5cGUpe1xyXG4gICAgICBtZW51LmF0dHIoJ3JvbGUnLCAnbWVudWJhcicpO1xyXG4gICAgICB0eXBlID0gdHlwZSB8fCAnemYnO1xyXG4gICAgICB2YXIgaXRlbXMgPSBtZW51LmZpbmQoJ2xpJykuYXR0cih7J3JvbGUnOiAnbWVudWl0ZW0nfSksXHJcbiAgICAgICAgICBzdWJNZW51Q2xhc3MgPSAnaXMtJyArIHR5cGUgKyAnLXN1Ym1lbnUnLFxyXG4gICAgICAgICAgc3ViSXRlbUNsYXNzID0gc3ViTWVudUNsYXNzICsgJy1pdGVtJyxcclxuICAgICAgICAgIGhhc1N1YkNsYXNzID0gJ2lzLScgKyB0eXBlICsgJy1zdWJtZW51LXBhcmVudCc7XHJcbiAgICAgIG1lbnUuZmluZCgnYTpmaXJzdCcpLmF0dHIoJ3RhYmluZGV4JywgMCk7XHJcbiAgICAgIGl0ZW1zLmVhY2goZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgJGl0ZW0gPSAkKHRoaXMpLFxyXG4gICAgICAgICAgICAkc3ViID0gJGl0ZW0uY2hpbGRyZW4oJ3VsJyk7XHJcbiAgICAgICAgaWYoJHN1Yi5sZW5ndGgpe1xyXG4gICAgICAgICAgJGl0ZW0uYWRkQ2xhc3MoaGFzU3ViQ2xhc3MpXHJcbiAgICAgICAgICAgICAgIC5hdHRyKHtcclxuICAgICAgICAgICAgICAgICAnYXJpYS1oYXNwb3B1cCc6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgJ2FyaWEtZXhwYW5kZWQnOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAnYXJpYS1sYWJlbCc6ICRpdGVtLmNoaWxkcmVuKCdhOmZpcnN0JykudGV4dCgpXHJcbiAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgJHN1Yi5hZGRDbGFzcygnc3VibWVudSAnICsgc3ViTWVudUNsYXNzKVxyXG4gICAgICAgICAgICAgIC5hdHRyKHtcclxuICAgICAgICAgICAgICAgICdkYXRhLXN1Ym1lbnUnOiAnJyxcclxuICAgICAgICAgICAgICAgICdhcmlhLWhpZGRlbic6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAncm9sZSc6ICdtZW51J1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZigkaXRlbS5wYXJlbnQoJ1tkYXRhLXN1Ym1lbnVdJykubGVuZ3RoKXtcclxuICAgICAgICAgICRpdGVtLmFkZENsYXNzKCdpcy1zdWJtZW51LWl0ZW0gJyArIHN1Ykl0ZW1DbGFzcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfSxcclxuICAgIEJ1cm46IGZ1bmN0aW9uKG1lbnUsIHR5cGUpe1xyXG4gICAgICB2YXIgaXRlbXMgPSBtZW51LmZpbmQoJ2xpJykucmVtb3ZlQXR0cigndGFiaW5kZXgnKSxcclxuICAgICAgICAgIHN1Yk1lbnVDbGFzcyA9ICdpcy0nICsgdHlwZSArICctc3VibWVudScsXHJcbiAgICAgICAgICBzdWJJdGVtQ2xhc3MgPSBzdWJNZW51Q2xhc3MgKyAnLWl0ZW0nLFxyXG4gICAgICAgICAgaGFzU3ViQ2xhc3MgPSAnaXMtJyArIHR5cGUgKyAnLXN1Ym1lbnUtcGFyZW50JztcclxuXHJcbiAgICAgIC8vIG1lbnUuZmluZCgnLmlzLWFjdGl2ZScpLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUnKTtcclxuICAgICAgbWVudS5maW5kKCcqJylcclxuICAgICAgLy8gbWVudS5maW5kKCcuJyArIHN1Yk1lbnVDbGFzcyArICcsIC4nICsgc3ViSXRlbUNsYXNzICsgJywgLmlzLWFjdGl2ZSwgLmhhcy1zdWJtZW51LCAuaXMtc3VibWVudS1pdGVtLCAuc3VibWVudSwgW2RhdGEtc3VibWVudV0nKVxyXG4gICAgICAgICAgLnJlbW92ZUNsYXNzKHN1Yk1lbnVDbGFzcyArICcgJyArIHN1Ykl0ZW1DbGFzcyArICcgJyArIGhhc1N1YkNsYXNzICsgJyBpcy1zdWJtZW51LWl0ZW0gc3VibWVudSBpcy1hY3RpdmUnKVxyXG4gICAgICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtc3VibWVudScpLmNzcygnZGlzcGxheScsICcnKTtcclxuXHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKCAgICAgIG1lbnUuZmluZCgnLicgKyBzdWJNZW51Q2xhc3MgKyAnLCAuJyArIHN1Ykl0ZW1DbGFzcyArICcsIC5oYXMtc3VibWVudSwgLmlzLXN1Ym1lbnUtaXRlbSwgLnN1Ym1lbnUsIFtkYXRhLXN1Ym1lbnVdJylcclxuICAgICAgLy8gICAgICAgICAgIC5yZW1vdmVDbGFzcyhzdWJNZW51Q2xhc3MgKyAnICcgKyBzdWJJdGVtQ2xhc3MgKyAnIGhhcy1zdWJtZW51IGlzLXN1Ym1lbnUtaXRlbSBzdWJtZW51JylcclxuICAgICAgLy8gICAgICAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLXN1Ym1lbnUnKSk7XHJcbiAgICAgIC8vIGl0ZW1zLmVhY2goZnVuY3Rpb24oKXtcclxuICAgICAgLy8gICB2YXIgJGl0ZW0gPSAkKHRoaXMpLFxyXG4gICAgICAvLyAgICAgICAkc3ViID0gJGl0ZW0uY2hpbGRyZW4oJ3VsJyk7XHJcbiAgICAgIC8vICAgaWYoJGl0ZW0ucGFyZW50KCdbZGF0YS1zdWJtZW51XScpLmxlbmd0aCl7XHJcbiAgICAgIC8vICAgICAkaXRlbS5yZW1vdmVDbGFzcygnaXMtc3VibWVudS1pdGVtICcgKyBzdWJJdGVtQ2xhc3MpO1xyXG4gICAgICAvLyAgIH1cclxuICAgICAgLy8gICBpZigkc3ViLmxlbmd0aCl7XHJcbiAgICAgIC8vICAgICAkaXRlbS5yZW1vdmVDbGFzcygnaGFzLXN1Ym1lbnUnKTtcclxuICAgICAgLy8gICAgICRzdWIucmVtb3ZlQ2xhc3MoJ3N1Ym1lbnUgJyArIHN1Yk1lbnVDbGFzcykucmVtb3ZlQXR0cignZGF0YS1zdWJtZW51Jyk7XHJcbiAgICAgIC8vICAgfVxyXG4gICAgICAvLyB9KTtcclxuICAgIH1cclxuICB9O1xyXG59KGpRdWVyeSwgd2luZG93LkZvdW5kYXRpb24pO1xyXG4iLCIhZnVuY3Rpb24oJCwgRm91bmRhdGlvbil7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG4gIHZhciBUaW1lciA9IGZ1bmN0aW9uKGVsZW0sIG9wdGlvbnMsIGNiKXtcclxuICAgIHZhciBfdGhpcyA9IHRoaXMsXHJcbiAgICAgICAgZHVyYXRpb24gPSBvcHRpb25zLmR1cmF0aW9uLC8vb3B0aW9ucyBpcyBhbiBvYmplY3QgZm9yIGVhc2lseSBhZGRpbmcgZmVhdHVyZXMgbGF0ZXIuXHJcbiAgICAgICAgbmFtZVNwYWNlID0gT2JqZWN0LmtleXMoZWxlbS5kYXRhKCkpWzBdIHx8ICd0aW1lcicsXHJcbiAgICAgICAgcmVtYWluID0gLTEsXHJcbiAgICAgICAgc3RhcnQsXHJcbiAgICAgICAgdGltZXI7XHJcblxyXG4gICAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICB0aGlzLnJlc3RhcnQgPSBmdW5jdGlvbigpe1xyXG4gICAgICByZW1haW4gPSAtMTtcclxuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcclxuICAgICAgdGhpcy5zdGFydCgpO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnN0YXJ0ID0gZnVuY3Rpb24oKXtcclxuICAgICAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlXHJcbiAgICAgIC8vIGlmKCFlbGVtLmRhdGEoJ3BhdXNlZCcpKXsgcmV0dXJuIGZhbHNlOyB9Ly9tYXliZSBpbXBsZW1lbnQgdGhpcyBzYW5pdHkgY2hlY2sgaWYgdXNlZCBmb3Igb3RoZXIgdGhpbmdzLlxyXG4gICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xyXG4gICAgICByZW1haW4gPSByZW1haW4gPD0gMCA/IGR1cmF0aW9uIDogcmVtYWluO1xyXG4gICAgICBlbGVtLmRhdGEoJ3BhdXNlZCcsIGZhbHNlKTtcclxuICAgICAgc3RhcnQgPSBEYXRlLm5vdygpO1xyXG4gICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICBpZihvcHRpb25zLmluZmluaXRlKXtcclxuICAgICAgICAgIF90aGlzLnJlc3RhcnQoKTsvL3JlcnVuIHRoZSB0aW1lci5cclxuICAgICAgICB9XHJcbiAgICAgICAgY2IoKTtcclxuICAgICAgfSwgcmVtYWluKTtcclxuICAgICAgZWxlbS50cmlnZ2VyKCd0aW1lcnN0YXJ0LnpmLicgKyBuYW1lU3BhY2UpO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnBhdXNlID0gZnVuY3Rpb24oKXtcclxuICAgICAgdGhpcy5pc1BhdXNlZCA9IHRydWU7XHJcbiAgICAgIC8vaWYoZWxlbS5kYXRhKCdwYXVzZWQnKSl7IHJldHVybiBmYWxzZTsgfS8vbWF5YmUgaW1wbGVtZW50IHRoaXMgc2FuaXR5IGNoZWNrIGlmIHVzZWQgZm9yIG90aGVyIHRoaW5ncy5cclxuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcclxuICAgICAgZWxlbS5kYXRhKCdwYXVzZWQnLCB0cnVlKTtcclxuICAgICAgdmFyIGVuZCA9IERhdGUubm93KCk7XHJcbiAgICAgIHJlbWFpbiA9IHJlbWFpbiAtIChlbmQgLSBzdGFydCk7XHJcbiAgICAgIGVsZW0udHJpZ2dlcigndGltZXJwYXVzZWQuemYuJyArIG5hbWVTcGFjZSk7XHJcbiAgICB9O1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogUnVucyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHdoZW4gaW1hZ2VzIGFyZSBmdWxseSBsb2FkZWQuXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGltYWdlcyAtIEltYWdlKHMpIHRvIGNoZWNrIGlmIGxvYWRlZC5cclxuICAgKiBAcGFyYW0ge0Z1bmN9IGNhbGxiYWNrIC0gRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGltYWdlIGlzIGZ1bGx5IGxvYWRlZC5cclxuICAgKi9cclxuICB2YXIgb25JbWFnZXNMb2FkZWQgPSBmdW5jdGlvbihpbWFnZXMsIGNhbGxiYWNrKXtcclxuICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICB1bmxvYWRlZCA9IGltYWdlcy5sZW5ndGg7XHJcblxyXG4gICAgaWYgKHVubG9hZGVkID09PSAwKSB7XHJcbiAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNpbmdsZUltYWdlTG9hZGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHVubG9hZGVkLS07XHJcbiAgICAgIGlmICh1bmxvYWRlZCA9PT0gMCkge1xyXG4gICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgaW1hZ2VzLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgIGlmICh0aGlzLmNvbXBsZXRlKSB7XHJcbiAgICAgICAgc2luZ2xlSW1hZ2VMb2FkZWQoKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICh0eXBlb2YgdGhpcy5uYXR1cmFsV2lkdGggIT09ICd1bmRlZmluZWQnICYmIHRoaXMubmF0dXJhbFdpZHRoID4gMCkge1xyXG4gICAgICAgIHNpbmdsZUltYWdlTG9hZGVkKCk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgJCh0aGlzKS5vbmUoJ2xvYWQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHNpbmdsZUltYWdlTG9hZGVkKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIEZvdW5kYXRpb24uVGltZXIgPSBUaW1lcjtcclxuICBGb3VuZGF0aW9uLm9uSW1hZ2VzTG9hZGVkID0gb25JbWFnZXNMb2FkZWQ7XHJcbn0oalF1ZXJ5LCB3aW5kb3cuRm91bmRhdGlvbik7XHJcbiIsIi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuLy8qKldvcmsgaW5zcGlyZWQgYnkgbXVsdGlwbGUganF1ZXJ5IHN3aXBlIHBsdWdpbnMqKlxyXG4vLyoqRG9uZSBieSBZb2hhaSBBcmFyYXQgKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuKGZ1bmN0aW9uKCQpIHtcclxuXHJcbiAgJC5zcG90U3dpcGUgPSB7XHJcbiAgICB2ZXJzaW9uOiAnMS4wLjAnLFxyXG4gICAgZW5hYmxlZDogJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxyXG4gICAgcHJldmVudERlZmF1bHQ6IGZhbHNlLFxyXG4gICAgbW92ZVRocmVzaG9sZDogNzUsXHJcbiAgICB0aW1lVGhyZXNob2xkOiAyMDBcclxuICB9O1xyXG5cclxuICB2YXIgICBzdGFydFBvc1gsXHJcbiAgICAgICAgc3RhcnRQb3NZLFxyXG4gICAgICAgIHN0YXJ0VGltZSxcclxuICAgICAgICBlbGFwc2VkVGltZSxcclxuICAgICAgICBpc01vdmluZyA9IGZhbHNlO1xyXG5cclxuICBmdW5jdGlvbiBvblRvdWNoRW5kKCkge1xyXG4gICAgLy8gIGFsZXJ0KHRoaXMpO1xyXG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBvblRvdWNoTW92ZSk7XHJcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCk7XHJcbiAgICBpc01vdmluZyA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gb25Ub3VjaE1vdmUoZSkge1xyXG4gICAgaWYgKCQuc3BvdFN3aXBlLnByZXZlbnREZWZhdWx0KSB7IGUucHJldmVudERlZmF1bHQoKTsgfVxyXG4gICAgaWYoaXNNb3ZpbmcpIHtcclxuICAgICAgdmFyIHggPSBlLnRvdWNoZXNbMF0ucGFnZVg7XHJcbiAgICAgIHZhciB5ID0gZS50b3VjaGVzWzBdLnBhZ2VZO1xyXG4gICAgICB2YXIgZHggPSBzdGFydFBvc1ggLSB4O1xyXG4gICAgICB2YXIgZHkgPSBzdGFydFBvc1kgLSB5O1xyXG4gICAgICB2YXIgZGlyO1xyXG4gICAgICBlbGFwc2VkVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gc3RhcnRUaW1lO1xyXG4gICAgICBpZihNYXRoLmFicyhkeCkgPj0gJC5zcG90U3dpcGUubW92ZVRocmVzaG9sZCAmJiBlbGFwc2VkVGltZSA8PSAkLnNwb3RTd2lwZS50aW1lVGhyZXNob2xkKSB7XHJcbiAgICAgICAgZGlyID0gZHggPiAwID8gJ2xlZnQnIDogJ3JpZ2h0JztcclxuICAgICAgfVxyXG4gICAgICAvLyBlbHNlIGlmKE1hdGguYWJzKGR5KSA+PSAkLnNwb3RTd2lwZS5tb3ZlVGhyZXNob2xkICYmIGVsYXBzZWRUaW1lIDw9ICQuc3BvdFN3aXBlLnRpbWVUaHJlc2hvbGQpIHtcclxuICAgICAgLy8gICBkaXIgPSBkeSA+IDAgPyAnZG93bicgOiAndXAnO1xyXG4gICAgICAvLyB9XHJcbiAgICAgIGlmKGRpcikge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBvblRvdWNoRW5kLmNhbGwodGhpcyk7XHJcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKCdzd2lwZScsIGRpcikudHJpZ2dlcignc3dpcGUnICsgZGlyKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gb25Ub3VjaFN0YXJ0KGUpIHtcclxuICAgIGlmIChlLnRvdWNoZXMubGVuZ3RoID09IDEpIHtcclxuICAgICAgc3RhcnRQb3NYID0gZS50b3VjaGVzWzBdLnBhZ2VYO1xyXG4gICAgICBzdGFydFBvc1kgPSBlLnRvdWNoZXNbMF0ucGFnZVk7XHJcbiAgICAgIGlzTW92aW5nID0gdHJ1ZTtcclxuICAgICAgc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUsIGZhbHNlKTtcclxuICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG9uVG91Y2hFbmQsIGZhbHNlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIgJiYgdGhpcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0LCBmYWxzZSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiB0ZWFyZG93bigpIHtcclxuICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIG9uVG91Y2hTdGFydCk7XHJcbiAgfVxyXG5cclxuICAkLmV2ZW50LnNwZWNpYWwuc3dpcGUgPSB7IHNldHVwOiBpbml0IH07XHJcblxyXG4gICQuZWFjaChbJ2xlZnQnLCAndXAnLCAnZG93bicsICdyaWdodCddLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAkLmV2ZW50LnNwZWNpYWxbJ3N3aXBlJyArIHRoaXNdID0geyBzZXR1cDogZnVuY3Rpb24oKXtcclxuICAgICAgJCh0aGlzKS5vbignc3dpcGUnLCAkLm5vb3ApO1xyXG4gICAgfSB9O1xyXG4gIH0pO1xyXG59KShqUXVlcnkpO1xyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gKiBNZXRob2QgZm9yIGFkZGluZyBwc3VlZG8gZHJhZyBldmVudHMgdG8gZWxlbWVudHMgKlxyXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4hZnVuY3Rpb24oJCl7XHJcbiAgJC5mbi5hZGRUb3VjaCA9IGZ1bmN0aW9uKCl7XHJcbiAgICB0aGlzLmVhY2goZnVuY3Rpb24oaSxlbCl7XHJcbiAgICAgICQoZWwpLmJpbmQoJ3RvdWNoc3RhcnQgdG91Y2htb3ZlIHRvdWNoZW5kIHRvdWNoY2FuY2VsJyxmdW5jdGlvbigpe1xyXG4gICAgICAgIC8vd2UgcGFzcyB0aGUgb3JpZ2luYWwgZXZlbnQgb2JqZWN0IGJlY2F1c2UgdGhlIGpRdWVyeSBldmVudFxyXG4gICAgICAgIC8vb2JqZWN0IGlzIG5vcm1hbGl6ZWQgdG8gdzNjIHNwZWNzIGFuZCBkb2VzIG5vdCBwcm92aWRlIHRoZSBUb3VjaExpc3RcclxuICAgICAgICBoYW5kbGVUb3VjaChldmVudCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIGhhbmRsZVRvdWNoID0gZnVuY3Rpb24oZXZlbnQpe1xyXG4gICAgICB2YXIgdG91Y2hlcyA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzLFxyXG4gICAgICAgICAgZmlyc3QgPSB0b3VjaGVzWzBdLFxyXG4gICAgICAgICAgZXZlbnRUeXBlcyA9IHtcclxuICAgICAgICAgICAgdG91Y2hzdGFydDogJ21vdXNlZG93bicsXHJcbiAgICAgICAgICAgIHRvdWNobW92ZTogJ21vdXNlbW92ZScsXHJcbiAgICAgICAgICAgIHRvdWNoZW5kOiAnbW91c2V1cCdcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB0eXBlID0gZXZlbnRUeXBlc1tldmVudC50eXBlXSxcclxuICAgICAgICAgIHNpbXVsYXRlZEV2ZW50XHJcbiAgICAgICAgO1xyXG5cclxuICAgICAgaWYoJ01vdXNlRXZlbnQnIGluIHdpbmRvdyAmJiB0eXBlb2Ygd2luZG93Lk1vdXNlRXZlbnQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICBzaW11bGF0ZWRFdmVudCA9IHdpbmRvdy5Nb3VzZUV2ZW50KHR5cGUsIHtcclxuICAgICAgICAgICdidWJibGVzJzogdHJ1ZSxcclxuICAgICAgICAgICdjYW5jZWxhYmxlJzogdHJ1ZSxcclxuICAgICAgICAgICdzY3JlZW5YJzogZmlyc3Quc2NyZWVuWCxcclxuICAgICAgICAgICdzY3JlZW5ZJzogZmlyc3Quc2NyZWVuWSxcclxuICAgICAgICAgICdjbGllbnRYJzogZmlyc3QuY2xpZW50WCxcclxuICAgICAgICAgICdjbGllbnRZJzogZmlyc3QuY2xpZW50WVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNpbXVsYXRlZEV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ01vdXNlRXZlbnQnKTtcclxuICAgICAgICBzaW11bGF0ZWRFdmVudC5pbml0TW91c2VFdmVudCh0eXBlLCB0cnVlLCB0cnVlLCB3aW5kb3csIDEsIGZpcnN0LnNjcmVlblgsIGZpcnN0LnNjcmVlblksIGZpcnN0LmNsaWVudFgsIGZpcnN0LmNsaWVudFksIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCAwLypsZWZ0Ki8sIG51bGwpO1xyXG4gICAgICB9XHJcbiAgICAgIGZpcnN0LnRhcmdldC5kaXNwYXRjaEV2ZW50KHNpbXVsYXRlZEV2ZW50KTtcclxuICAgIH07XHJcbiAgfTtcclxufShqUXVlcnkpO1xyXG5cclxuXHJcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4vLyoqRnJvbSB0aGUgalF1ZXJ5IE1vYmlsZSBMaWJyYXJ5KipcclxuLy8qKm5lZWQgdG8gcmVjcmVhdGUgZnVuY3Rpb25hbGl0eSoqXHJcbi8vKiphbmQgdHJ5IHRvIGltcHJvdmUgaWYgcG9zc2libGUqKlxyXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuXHJcbi8qIFJlbW92aW5nIHRoZSBqUXVlcnkgZnVuY3Rpb24gKioqKlxyXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuXHJcbihmdW5jdGlvbiggJCwgd2luZG93LCB1bmRlZmluZWQgKSB7XHJcblxyXG5cdHZhciAkZG9jdW1lbnQgPSAkKCBkb2N1bWVudCApLFxyXG5cdFx0Ly8gc3VwcG9ydFRvdWNoID0gJC5tb2JpbGUuc3VwcG9ydC50b3VjaCxcclxuXHRcdHRvdWNoU3RhcnRFdmVudCA9ICd0b3VjaHN0YXJ0Jy8vc3VwcG9ydFRvdWNoID8gXCJ0b3VjaHN0YXJ0XCIgOiBcIm1vdXNlZG93blwiLFxyXG5cdFx0dG91Y2hTdG9wRXZlbnQgPSAndG91Y2hlbmQnLy9zdXBwb3J0VG91Y2ggPyBcInRvdWNoZW5kXCIgOiBcIm1vdXNldXBcIixcclxuXHRcdHRvdWNoTW92ZUV2ZW50ID0gJ3RvdWNobW92ZScvL3N1cHBvcnRUb3VjaCA/IFwidG91Y2htb3ZlXCIgOiBcIm1vdXNlbW92ZVwiO1xyXG5cclxuXHQvLyBzZXR1cCBuZXcgZXZlbnQgc2hvcnRjdXRzXHJcblx0JC5lYWNoKCAoIFwidG91Y2hzdGFydCB0b3VjaG1vdmUgdG91Y2hlbmQgXCIgK1xyXG5cdFx0XCJzd2lwZSBzd2lwZWxlZnQgc3dpcGVyaWdodFwiICkuc3BsaXQoIFwiIFwiICksIGZ1bmN0aW9uKCBpLCBuYW1lICkge1xyXG5cclxuXHRcdCQuZm5bIG5hbWUgXSA9IGZ1bmN0aW9uKCBmbiApIHtcclxuXHRcdFx0cmV0dXJuIGZuID8gdGhpcy5iaW5kKCBuYW1lLCBmbiApIDogdGhpcy50cmlnZ2VyKCBuYW1lICk7XHJcblx0XHR9O1xyXG5cclxuXHRcdC8vIGpRdWVyeSA8IDEuOFxyXG5cdFx0aWYgKCAkLmF0dHJGbiApIHtcclxuXHRcdFx0JC5hdHRyRm5bIG5hbWUgXSA9IHRydWU7XHJcblx0XHR9XHJcblx0fSk7XHJcblxyXG5cdGZ1bmN0aW9uIHRyaWdnZXJDdXN0b21FdmVudCggb2JqLCBldmVudFR5cGUsIGV2ZW50LCBidWJibGUgKSB7XHJcblx0XHR2YXIgb3JpZ2luYWxUeXBlID0gZXZlbnQudHlwZTtcclxuXHRcdGV2ZW50LnR5cGUgPSBldmVudFR5cGU7XHJcblx0XHRpZiAoIGJ1YmJsZSApIHtcclxuXHRcdFx0JC5ldmVudC50cmlnZ2VyKCBldmVudCwgdW5kZWZpbmVkLCBvYmogKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdCQuZXZlbnQuZGlzcGF0Y2guY2FsbCggb2JqLCBldmVudCApO1xyXG5cdFx0fVxyXG5cdFx0ZXZlbnQudHlwZSA9IG9yaWdpbmFsVHlwZTtcclxuXHR9XHJcblxyXG5cdC8vIGFsc28gaGFuZGxlcyB0YXBob2xkXHJcblxyXG5cdC8vIEFsc28gaGFuZGxlcyBzd2lwZWxlZnQsIHN3aXBlcmlnaHRcclxuXHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUgPSB7XHJcblxyXG5cdFx0Ly8gTW9yZSB0aGFuIHRoaXMgaG9yaXpvbnRhbCBkaXNwbGFjZW1lbnQsIGFuZCB3ZSB3aWxsIHN1cHByZXNzIHNjcm9sbGluZy5cclxuXHRcdHNjcm9sbFN1cHJlc3Npb25UaHJlc2hvbGQ6IDMwLFxyXG5cclxuXHRcdC8vIE1vcmUgdGltZSB0aGFuIHRoaXMsIGFuZCBpdCBpc24ndCBhIHN3aXBlLlxyXG5cdFx0ZHVyYXRpb25UaHJlc2hvbGQ6IDEwMDAsXHJcblxyXG5cdFx0Ly8gU3dpcGUgaG9yaXpvbnRhbCBkaXNwbGFjZW1lbnQgbXVzdCBiZSBtb3JlIHRoYW4gdGhpcy5cclxuXHRcdGhvcml6b250YWxEaXN0YW5jZVRocmVzaG9sZDogd2luZG93LmRldmljZVBpeGVsUmF0aW8gPj0gMiA/IDE1IDogMzAsXHJcblxyXG5cdFx0Ly8gU3dpcGUgdmVydGljYWwgZGlzcGxhY2VtZW50IG11c3QgYmUgbGVzcyB0aGFuIHRoaXMuXHJcblx0XHR2ZXJ0aWNhbERpc3RhbmNlVGhyZXNob2xkOiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA+PSAyID8gMTUgOiAzMCxcclxuXHJcblx0XHRnZXRMb2NhdGlvbjogZnVuY3Rpb24gKCBldmVudCApIHtcclxuXHRcdFx0dmFyIHdpblBhZ2VYID0gd2luZG93LnBhZ2VYT2Zmc2V0LFxyXG5cdFx0XHRcdHdpblBhZ2VZID0gd2luZG93LnBhZ2VZT2Zmc2V0LFxyXG5cdFx0XHRcdHggPSBldmVudC5jbGllbnRYLFxyXG5cdFx0XHRcdHkgPSBldmVudC5jbGllbnRZO1xyXG5cclxuXHRcdFx0aWYgKCBldmVudC5wYWdlWSA9PT0gMCAmJiBNYXRoLmZsb29yKCB5ICkgPiBNYXRoLmZsb29yKCBldmVudC5wYWdlWSApIHx8XHJcblx0XHRcdFx0ZXZlbnQucGFnZVggPT09IDAgJiYgTWF0aC5mbG9vciggeCApID4gTWF0aC5mbG9vciggZXZlbnQucGFnZVggKSApIHtcclxuXHJcblx0XHRcdFx0Ly8gaU9TNCBjbGllbnRYL2NsaWVudFkgaGF2ZSB0aGUgdmFsdWUgdGhhdCBzaG91bGQgaGF2ZSBiZWVuXHJcblx0XHRcdFx0Ly8gaW4gcGFnZVgvcGFnZVkuIFdoaWxlIHBhZ2VYL3BhZ2UvIGhhdmUgdGhlIHZhbHVlIDBcclxuXHRcdFx0XHR4ID0geCAtIHdpblBhZ2VYO1xyXG5cdFx0XHRcdHkgPSB5IC0gd2luUGFnZVk7XHJcblx0XHRcdH0gZWxzZSBpZiAoIHkgPCAoIGV2ZW50LnBhZ2VZIC0gd2luUGFnZVkpIHx8IHggPCAoIGV2ZW50LnBhZ2VYIC0gd2luUGFnZVggKSApIHtcclxuXHJcblx0XHRcdFx0Ly8gU29tZSBBbmRyb2lkIGJyb3dzZXJzIGhhdmUgdG90YWxseSBib2d1cyB2YWx1ZXMgZm9yIGNsaWVudFgvWVxyXG5cdFx0XHRcdC8vIHdoZW4gc2Nyb2xsaW5nL3pvb21pbmcgYSBwYWdlLiBEZXRlY3RhYmxlIHNpbmNlIGNsaWVudFgvY2xpZW50WVxyXG5cdFx0XHRcdC8vIHNob3VsZCBuZXZlciBiZSBzbWFsbGVyIHRoYW4gcGFnZVgvcGFnZVkgbWludXMgcGFnZSBzY3JvbGxcclxuXHRcdFx0XHR4ID0gZXZlbnQucGFnZVggLSB3aW5QYWdlWDtcclxuXHRcdFx0XHR5ID0gZXZlbnQucGFnZVkgLSB3aW5QYWdlWTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHR4OiB4LFxyXG5cdFx0XHRcdHk6IHlcclxuXHRcdFx0fTtcclxuXHRcdH0sXHJcblxyXG5cdFx0c3RhcnQ6IGZ1bmN0aW9uKCBldmVudCApIHtcclxuXHRcdFx0dmFyIGRhdGEgPSBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgP1xyXG5cdFx0XHRcdFx0ZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzWyAwIF0gOiBldmVudCxcclxuXHRcdFx0XHRsb2NhdGlvbiA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5nZXRMb2NhdGlvbiggZGF0YSApO1xyXG5cdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdFx0XHR0aW1lOiAoIG5ldyBEYXRlKCkgKS5nZXRUaW1lKCksXHJcblx0XHRcdFx0XHRcdGNvb3JkczogWyBsb2NhdGlvbi54LCBsb2NhdGlvbi55IF0sXHJcblx0XHRcdFx0XHRcdG9yaWdpbjogJCggZXZlbnQudGFyZ2V0IClcclxuXHRcdFx0XHRcdH07XHJcblx0XHR9LFxyXG5cclxuXHRcdHN0b3A6IGZ1bmN0aW9uKCBldmVudCApIHtcclxuXHRcdFx0dmFyIGRhdGEgPSBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgP1xyXG5cdFx0XHRcdFx0ZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzWyAwIF0gOiBldmVudCxcclxuXHRcdFx0XHRsb2NhdGlvbiA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5nZXRMb2NhdGlvbiggZGF0YSApO1xyXG5cdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdFx0XHR0aW1lOiAoIG5ldyBEYXRlKCkgKS5nZXRUaW1lKCksXHJcblx0XHRcdFx0XHRcdGNvb3JkczogWyBsb2NhdGlvbi54LCBsb2NhdGlvbi55IF1cclxuXHRcdFx0XHRcdH07XHJcblx0XHR9LFxyXG5cclxuXHRcdGhhbmRsZVN3aXBlOiBmdW5jdGlvbiggc3RhcnQsIHN0b3AsIHRoaXNPYmplY3QsIG9yaWdUYXJnZXQgKSB7XHJcblx0XHRcdGlmICggc3RvcC50aW1lIC0gc3RhcnQudGltZSA8ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5kdXJhdGlvblRocmVzaG9sZCAmJlxyXG5cdFx0XHRcdE1hdGguYWJzKCBzdGFydC5jb29yZHNbIDAgXSAtIHN0b3AuY29vcmRzWyAwIF0gKSA+ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ob3Jpem9udGFsRGlzdGFuY2VUaHJlc2hvbGQgJiZcclxuXHRcdFx0XHRNYXRoLmFicyggc3RhcnQuY29vcmRzWyAxIF0gLSBzdG9wLmNvb3Jkc1sgMSBdICkgPCAkLmV2ZW50LnNwZWNpYWwuc3dpcGUudmVydGljYWxEaXN0YW5jZVRocmVzaG9sZCApIHtcclxuXHRcdFx0XHR2YXIgZGlyZWN0aW9uID0gc3RhcnQuY29vcmRzWzBdID4gc3RvcC5jb29yZHNbIDAgXSA/IFwic3dpcGVsZWZ0XCIgOiBcInN3aXBlcmlnaHRcIjtcclxuXHJcblx0XHRcdFx0dHJpZ2dlckN1c3RvbUV2ZW50KCB0aGlzT2JqZWN0LCBcInN3aXBlXCIsICQuRXZlbnQoIFwic3dpcGVcIiwgeyB0YXJnZXQ6IG9yaWdUYXJnZXQsIHN3aXBlc3RhcnQ6IHN0YXJ0LCBzd2lwZXN0b3A6IHN0b3AgfSksIHRydWUgKTtcclxuXHRcdFx0XHR0cmlnZ2VyQ3VzdG9tRXZlbnQoIHRoaXNPYmplY3QsIGRpcmVjdGlvbiwkLkV2ZW50KCBkaXJlY3Rpb24sIHsgdGFyZ2V0OiBvcmlnVGFyZ2V0LCBzd2lwZXN0YXJ0OiBzdGFydCwgc3dpcGVzdG9wOiBzdG9wIH0gKSwgdHJ1ZSApO1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHJcblx0XHR9LFxyXG5cclxuXHRcdC8vIFRoaXMgc2VydmVzIGFzIGEgZmxhZyB0byBlbnN1cmUgdGhhdCBhdCBtb3N0IG9uZSBzd2lwZSBldmVudCBldmVudCBpc1xyXG5cdFx0Ly8gaW4gd29yayBhdCBhbnkgZ2l2ZW4gdGltZVxyXG5cdFx0ZXZlbnRJblByb2dyZXNzOiBmYWxzZSxcclxuXHJcblx0XHRzZXR1cDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHZhciBldmVudHMsXHJcblx0XHRcdFx0dGhpc09iamVjdCA9IHRoaXMsXHJcblx0XHRcdFx0JHRoaXMgPSAkKCB0aGlzT2JqZWN0ICksXHJcblx0XHRcdFx0Y29udGV4dCA9IHt9O1xyXG5cclxuXHRcdFx0Ly8gUmV0cmlldmUgdGhlIGV2ZW50cyBkYXRhIGZvciB0aGlzIGVsZW1lbnQgYW5kIGFkZCB0aGUgc3dpcGUgY29udGV4dFxyXG5cdFx0XHRldmVudHMgPSAkLmRhdGEoIHRoaXMsIFwibW9iaWxlLWV2ZW50c1wiICk7XHJcblx0XHRcdGlmICggIWV2ZW50cyApIHtcclxuXHRcdFx0XHRldmVudHMgPSB7IGxlbmd0aDogMCB9O1xyXG5cdFx0XHRcdCQuZGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIsIGV2ZW50cyApO1xyXG5cdFx0XHR9XHJcblx0XHRcdGV2ZW50cy5sZW5ndGgrKztcclxuXHRcdFx0ZXZlbnRzLnN3aXBlID0gY29udGV4dDtcclxuXHJcblx0XHRcdGNvbnRleHQuc3RhcnQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XHJcblxyXG5cdFx0XHRcdC8vIEJhaWwgaWYgd2UncmUgYWxyZWFkeSB3b3JraW5nIG9uIGEgc3dpcGUgZXZlbnRcclxuXHRcdFx0XHRpZiAoICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgKSB7XHJcblx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdCQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgPSB0cnVlO1xyXG5cclxuXHRcdFx0XHR2YXIgc3RvcCxcclxuXHRcdFx0XHRcdHN0YXJ0ID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLnN0YXJ0KCBldmVudCApLFxyXG5cdFx0XHRcdFx0b3JpZ1RhcmdldCA9IGV2ZW50LnRhcmdldCxcclxuXHRcdFx0XHRcdGVtaXR0ZWQgPSBmYWxzZTtcclxuXHJcblx0XHRcdFx0Y29udGV4dC5tb3ZlID0gZnVuY3Rpb24oIGV2ZW50ICkge1xyXG5cdFx0XHRcdFx0aWYgKCAhc3RhcnQgfHwgZXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkgKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRzdG9wID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLnN0b3AoIGV2ZW50ICk7XHJcblx0XHRcdFx0XHRpZiAoICFlbWl0dGVkICkge1xyXG5cdFx0XHRcdFx0XHRlbWl0dGVkID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmhhbmRsZVN3aXBlKCBzdGFydCwgc3RvcCwgdGhpc09iamVjdCwgb3JpZ1RhcmdldCApO1xyXG5cdFx0XHRcdFx0XHRpZiAoIGVtaXR0ZWQgKSB7XHJcblxyXG5cdFx0XHRcdFx0XHRcdC8vIFJlc2V0IHRoZSBjb250ZXh0IHRvIG1ha2Ugd2F5IGZvciB0aGUgbmV4dCBzd2lwZSBldmVudFxyXG5cdFx0XHRcdFx0XHRcdCQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0Ly8gcHJldmVudCBzY3JvbGxpbmdcclxuXHRcdFx0XHRcdGlmICggTWF0aC5hYnMoIHN0YXJ0LmNvb3Jkc1sgMCBdIC0gc3RvcC5jb29yZHNbIDAgXSApID4gJC5ldmVudC5zcGVjaWFsLnN3aXBlLnNjcm9sbFN1cHJlc3Npb25UaHJlc2hvbGQgKSB7XHJcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fTtcclxuXHJcblx0XHRcdFx0Y29udGV4dC5zdG9wID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdGVtaXR0ZWQgPSB0cnVlO1xyXG5cclxuXHRcdFx0XHRcdFx0Ly8gUmVzZXQgdGhlIGNvbnRleHQgdG8gbWFrZSB3YXkgZm9yIHRoZSBuZXh0IHN3aXBlIGV2ZW50XHJcblx0XHRcdFx0XHRcdCQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0JGRvY3VtZW50Lm9mZiggdG91Y2hNb3ZlRXZlbnQsIGNvbnRleHQubW92ZSApO1xyXG5cdFx0XHRcdFx0XHRjb250ZXh0Lm1vdmUgPSBudWxsO1xyXG5cdFx0XHRcdH07XHJcblxyXG5cdFx0XHRcdCRkb2N1bWVudC5vbiggdG91Y2hNb3ZlRXZlbnQsIGNvbnRleHQubW92ZSApXHJcblx0XHRcdFx0XHQub25lKCB0b3VjaFN0b3BFdmVudCwgY29udGV4dC5zdG9wICk7XHJcblx0XHRcdH07XHJcblx0XHRcdCR0aGlzLm9uKCB0b3VjaFN0YXJ0RXZlbnQsIGNvbnRleHQuc3RhcnQgKTtcclxuXHRcdH0sXHJcblxyXG5cdFx0dGVhcmRvd246IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHR2YXIgZXZlbnRzLCBjb250ZXh0O1xyXG5cclxuXHRcdFx0ZXZlbnRzID0gJC5kYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiApO1xyXG5cdFx0XHRpZiAoIGV2ZW50cyApIHtcclxuXHRcdFx0XHRjb250ZXh0ID0gZXZlbnRzLnN3aXBlO1xyXG5cdFx0XHRcdGRlbGV0ZSBldmVudHMuc3dpcGU7XHJcblx0XHRcdFx0ZXZlbnRzLmxlbmd0aC0tO1xyXG5cdFx0XHRcdGlmICggZXZlbnRzLmxlbmd0aCA9PT0gMCApIHtcclxuXHRcdFx0XHRcdCQucmVtb3ZlRGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIgKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICggY29udGV4dCApIHtcclxuXHRcdFx0XHRpZiAoIGNvbnRleHQuc3RhcnQgKSB7XHJcblx0XHRcdFx0XHQkKCB0aGlzICkub2ZmKCB0b3VjaFN0YXJ0RXZlbnQsIGNvbnRleHQuc3RhcnQgKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKCBjb250ZXh0Lm1vdmUgKSB7XHJcblx0XHRcdFx0XHQkZG9jdW1lbnQub2ZmKCB0b3VjaE1vdmVFdmVudCwgY29udGV4dC5tb3ZlICk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmICggY29udGV4dC5zdG9wICkge1xyXG5cdFx0XHRcdFx0JGRvY3VtZW50Lm9mZiggdG91Y2hTdG9wRXZlbnQsIGNvbnRleHQuc3RvcCApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH07XHJcblx0JC5lYWNoKHtcclxuXHRcdHN3aXBlbGVmdDogXCJzd2lwZS5sZWZ0XCIsXHJcblx0XHRzd2lwZXJpZ2h0OiBcInN3aXBlLnJpZ2h0XCJcclxuXHR9LCBmdW5jdGlvbiggZXZlbnQsIHNvdXJjZUV2ZW50ICkge1xyXG5cclxuXHRcdCQuZXZlbnQuc3BlY2lhbFsgZXZlbnQgXSA9IHtcclxuXHRcdFx0c2V0dXA6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdCQoIHRoaXMgKS5iaW5kKCBzb3VyY2VFdmVudCwgJC5ub29wICk7XHJcblx0XHRcdH0sXHJcblx0XHRcdHRlYXJkb3duOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHQkKCB0aGlzICkudW5iaW5kKCBzb3VyY2VFdmVudCApO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdH0pO1xyXG59KSggalF1ZXJ5LCB0aGlzICk7XHJcbiovXHJcbiIsIiFmdW5jdGlvbihGb3VuZGF0aW9uLCAkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG4gIC8vIEVsZW1lbnRzIHdpdGggW2RhdGEtb3Blbl0gd2lsbCByZXZlYWwgYSBwbHVnaW4gdGhhdCBzdXBwb3J0cyBpdCB3aGVuIGNsaWNrZWQuXHJcbiAgJChkb2N1bWVudCkub24oJ2NsaWNrLnpmLnRyaWdnZXInLCAnW2RhdGEtb3Blbl0nLCBmdW5jdGlvbigpIHtcclxuICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnb3BlbicpO1xyXG4gICAgJCgnIycgKyBpZCkudHJpZ2dlckhhbmRsZXIoJ29wZW4uemYudHJpZ2dlcicsIFskKHRoaXMpXSk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIEVsZW1lbnRzIHdpdGggW2RhdGEtY2xvc2VdIHdpbGwgY2xvc2UgYSBwbHVnaW4gdGhhdCBzdXBwb3J0cyBpdCB3aGVuIGNsaWNrZWQuXHJcbiAgLy8gSWYgdXNlZCB3aXRob3V0IGEgdmFsdWUgb24gW2RhdGEtY2xvc2VdLCB0aGUgZXZlbnQgd2lsbCBidWJibGUsIGFsbG93aW5nIGl0IHRvIGNsb3NlIGEgcGFyZW50IGNvbXBvbmVudC5cclxuICAkKGRvY3VtZW50KS5vbignY2xpY2suemYudHJpZ2dlcicsICdbZGF0YS1jbG9zZV0nLCBmdW5jdGlvbigpIHtcclxuICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnY2xvc2UnKTtcclxuICAgIGlmIChpZCkge1xyXG4gICAgICAkKCcjJyArIGlkKS50cmlnZ2VySGFuZGxlcignY2xvc2UuemYudHJpZ2dlcicsIFskKHRoaXMpXSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgJCh0aGlzKS50cmlnZ2VyKCdjbG9zZS56Zi50cmlnZ2VyJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIC8vIEVsZW1lbnRzIHdpdGggW2RhdGEtdG9nZ2xlXSB3aWxsIHRvZ2dsZSBhIHBsdWdpbiB0aGF0IHN1cHBvcnRzIGl0IHdoZW4gY2xpY2tlZC5cclxuICAkKGRvY3VtZW50KS5vbignY2xpY2suemYudHJpZ2dlcicsICdbZGF0YS10b2dnbGVdJywgZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ3RvZ2dsZScpO1xyXG4gICAgJCgnIycgKyBpZCkudHJpZ2dlckhhbmRsZXIoJ3RvZ2dsZS56Zi50cmlnZ2VyJywgWyQodGhpcyldKTtcclxuICB9KTtcclxuXHJcbiAgLy8gRWxlbWVudHMgd2l0aCBbZGF0YS1jbG9zYWJsZV0gd2lsbCByZXNwb25kIHRvIGNsb3NlLnpmLnRyaWdnZXIgZXZlbnRzLlxyXG4gICQoZG9jdW1lbnQpLm9uKCdjbG9zZS56Zi50cmlnZ2VyJywgJ1tkYXRhLWNsb3NhYmxlXScsIGZ1bmN0aW9uKGUpe1xyXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgIHZhciBhbmltYXRpb24gPSAkKHRoaXMpLmRhdGEoJ2Nsb3NhYmxlJyk7XHJcblxyXG4gICAgaWYoYW5pbWF0aW9uICE9PSAnJyl7XHJcbiAgICAgIEZvdW5kYXRpb24uTW90aW9uLmFuaW1hdGVPdXQoJCh0aGlzKSwgYW5pbWF0aW9uLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoJ2Nsb3NlZC56ZicpO1xyXG4gICAgICB9KTtcclxuICAgIH1lbHNle1xyXG4gICAgICAkKHRoaXMpLmZhZGVPdXQoKS50cmlnZ2VyKCdjbG9zZWQuemYnKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgdmFyIE11dGF0aW9uT2JzZXJ2ZXIgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHByZWZpeGVzID0gWydXZWJLaXQnLCAnTW96JywgJ08nLCAnTXMnLCAnJ107XHJcbiAgICBmb3IgKHZhciBpPTA7IGkgPCBwcmVmaXhlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAocHJlZml4ZXNbaV0gKyAnTXV0YXRpb25PYnNlcnZlcicgaW4gd2luZG93KSB7XHJcbiAgICAgICAgcmV0dXJuIHdpbmRvd1twcmVmaXhlc1tpXSArICdNdXRhdGlvbk9ic2VydmVyJ107XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9KCkpO1xyXG5cclxuXHJcbiAgdmFyIGNoZWNrTGlzdGVuZXJzID0gZnVuY3Rpb24oKXtcclxuICAgIGV2ZW50c0xpc3RlbmVyKCk7XHJcbiAgICByZXNpemVMaXN0ZW5lcigpO1xyXG4gICAgc2Nyb2xsTGlzdGVuZXIoKTtcclxuICAgIGNsb3NlbWVMaXN0ZW5lcigpO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgKiBGaXJlcyBvbmNlIGFmdGVyIGFsbCBvdGhlciBzY3JpcHRzIGhhdmUgbG9hZGVkXHJcbiAgKiBAZnVuY3Rpb25cclxuICAqIEBwcml2YXRlXHJcbiAgKi9cclxuICAkKHdpbmRvdykubG9hZChmdW5jdGlvbigpe1xyXG4gICAgY2hlY2tMaXN0ZW5lcnMoKTtcclxuICB9KTtcclxuXHJcbiAgLy8qKioqKioqKiBvbmx5IGZpcmVzIHRoaXMgZnVuY3Rpb24gb25jZSBvbiBsb2FkLCBpZiB0aGVyZSdzIHNvbWV0aGluZyB0byB3YXRjaCAqKioqKioqKlxyXG4gIHZhciBjbG9zZW1lTGlzdGVuZXIgPSBmdW5jdGlvbihwbHVnaW5OYW1lKXtcclxuICAgIHZhciB5ZXRpQm94ZXMgPSAkKCdbZGF0YS15ZXRpLWJveF0nKSxcclxuICAgICAgICBwbHVnTmFtZXMgPSBbJ2Ryb3Bkb3duJywgJ3Rvb2x0aXAnLCAncmV2ZWFsJ107XHJcblxyXG4gICAgaWYocGx1Z2luTmFtZSl7XHJcbiAgICAgIGlmKHR5cGVvZiBwbHVnaW5OYW1lID09PSAnc3RyaW5nJyl7XHJcbiAgICAgICAgcGx1Z05hbWVzLnB1c2gocGx1Z2luTmFtZSk7XHJcbiAgICAgIH1lbHNlIGlmKHR5cGVvZiBwbHVnaW5OYW1lID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgcGx1Z2luTmFtZVswXSA9PT0gJ3N0cmluZycpe1xyXG4gICAgICAgIHBsdWdOYW1lcy5jb25jYXQocGx1Z2luTmFtZSk7XHJcbiAgICAgIH1lbHNle1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1BsdWdpbiBuYW1lcyBtdXN0IGJlIHN0cmluZ3MnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYoeWV0aUJveGVzLmxlbmd0aCl7XHJcbiAgICAgIHZhciBsaXN0ZW5lcnMgPSBwbHVnTmFtZXMubWFwKGZ1bmN0aW9uKG5hbWUpe1xyXG4gICAgICAgIHJldHVybiAnY2xvc2VtZS56Zi4nICsgbmFtZTtcclxuICAgICAgfSkuam9pbignICcpO1xyXG5cclxuICAgICAgJCh3aW5kb3cpLm9mZihsaXN0ZW5lcnMpLm9uKGxpc3RlbmVycywgZnVuY3Rpb24oZSwgcGx1Z2luSWQpe1xyXG4gICAgICAgIHZhciBwbHVnaW4gPSBlLm5hbWVzcGFjZS5zcGxpdCgnLicpWzBdO1xyXG4gICAgICAgIHZhciBwbHVnaW5zID0gJCgnW2RhdGEtJyArIHBsdWdpbiArICddJykubm90KCdbZGF0YS15ZXRpLWJveD1cIicgKyBwbHVnaW5JZCArICdcIl0nKTtcclxuXHJcbiAgICAgICAgcGx1Z2lucy5lYWNoKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICB2YXIgX3RoaXMgPSAkKHRoaXMpO1xyXG5cclxuICAgICAgICAgIF90aGlzLnRyaWdnZXJIYW5kbGVyKCdjbG9zZS56Zi50cmlnZ2VyJywgW190aGlzXSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgdmFyIHJlc2l6ZUxpc3RlbmVyID0gZnVuY3Rpb24oZGVib3VuY2Upe1xyXG4gICAgdmFyIHRpbWVyLFxyXG4gICAgICAgICRub2RlcyA9ICQoJ1tkYXRhLXJlc2l6ZV0nKTtcclxuICAgIGlmKCRub2Rlcy5sZW5ndGgpe1xyXG4gICAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUuemYudHJpZ2dlcicpXHJcbiAgICAgIC5vbigncmVzaXplLnpmLnRyaWdnZXInLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgaWYgKHRpbWVyKSB7IGNsZWFyVGltZW91dCh0aW1lcik7IH1cclxuXHJcbiAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgICAgICAgaWYoIU11dGF0aW9uT2JzZXJ2ZXIpey8vZmFsbGJhY2sgZm9yIElFIDlcclxuICAgICAgICAgICAgJG5vZGVzLmVhY2goZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXJIYW5kbGVyKCdyZXNpemVtZS56Zi50cmlnZ2VyJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy90cmlnZ2VyIGFsbCBsaXN0ZW5pbmcgZWxlbWVudHMgYW5kIHNpZ25hbCBhIHJlc2l6ZSBldmVudFxyXG4gICAgICAgICAgJG5vZGVzLmF0dHIoJ2RhdGEtZXZlbnRzJywgXCJyZXNpemVcIik7XHJcbiAgICAgICAgfSwgZGVib3VuY2UgfHwgMTApOy8vZGVmYXVsdCB0aW1lIHRvIGVtaXQgcmVzaXplIGV2ZW50XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgdmFyIHNjcm9sbExpc3RlbmVyID0gZnVuY3Rpb24oZGVib3VuY2Upe1xyXG4gICAgdmFyIHRpbWVyLFxyXG4gICAgICAgICRub2RlcyA9ICQoJ1tkYXRhLXNjcm9sbF0nKTtcclxuICAgIGlmKCRub2Rlcy5sZW5ndGgpe1xyXG4gICAgICAkKHdpbmRvdykub2ZmKCdzY3JvbGwuemYudHJpZ2dlcicpXHJcbiAgICAgIC5vbignc2Nyb2xsLnpmLnRyaWdnZXInLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBpZih0aW1lcil7IGNsZWFyVGltZW91dCh0aW1lcik7IH1cclxuXHJcbiAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgICAgICAgaWYoIU11dGF0aW9uT2JzZXJ2ZXIpey8vZmFsbGJhY2sgZm9yIElFIDlcclxuICAgICAgICAgICAgJG5vZGVzLmVhY2goZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXJIYW5kbGVyKCdzY3JvbGxtZS56Zi50cmlnZ2VyJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy90cmlnZ2VyIGFsbCBsaXN0ZW5pbmcgZWxlbWVudHMgYW5kIHNpZ25hbCBhIHNjcm9sbCBldmVudFxyXG4gICAgICAgICAgJG5vZGVzLmF0dHIoJ2RhdGEtZXZlbnRzJywgXCJzY3JvbGxcIik7XHJcbiAgICAgICAgfSwgZGVib3VuY2UgfHwgMTApOy8vZGVmYXVsdCB0aW1lIHRvIGVtaXQgc2Nyb2xsIGV2ZW50XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgLy8gZnVuY3Rpb24gZG9tTXV0YXRpb25PYnNlcnZlcihkZWJvdW5jZSkge1xyXG4gIC8vICAgLy8gISEhIFRoaXMgaXMgY29taW5nIHNvb24gYW5kIG5lZWRzIG1vcmUgd29yazsgbm90IGFjdGl2ZSAgISEhIC8vXHJcbiAgLy8gICB2YXIgdGltZXIsXHJcbiAgLy8gICBub2RlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLW11dGF0ZV0nKTtcclxuICAvLyAgIC8vXHJcbiAgLy8gICBpZiAobm9kZXMubGVuZ3RoKSB7XHJcbiAgLy8gICAgIC8vIHZhciBNdXRhdGlvbk9ic2VydmVyID0gKGZ1bmN0aW9uICgpIHtcclxuICAvLyAgICAgLy8gICB2YXIgcHJlZml4ZXMgPSBbJ1dlYktpdCcsICdNb3onLCAnTycsICdNcycsICcnXTtcclxuICAvLyAgICAgLy8gICBmb3IgKHZhciBpPTA7IGkgPCBwcmVmaXhlcy5sZW5ndGg7IGkrKykge1xyXG4gIC8vICAgICAvLyAgICAgaWYgKHByZWZpeGVzW2ldICsgJ011dGF0aW9uT2JzZXJ2ZXInIGluIHdpbmRvdykge1xyXG4gIC8vICAgICAvLyAgICAgICByZXR1cm4gd2luZG93W3ByZWZpeGVzW2ldICsgJ011dGF0aW9uT2JzZXJ2ZXInXTtcclxuICAvLyAgICAgLy8gICAgIH1cclxuICAvLyAgICAgLy8gICB9XHJcbiAgLy8gICAgIC8vICAgcmV0dXJuIGZhbHNlO1xyXG4gIC8vICAgICAvLyB9KCkpO1xyXG4gIC8vXHJcbiAgLy9cclxuICAvLyAgICAgLy9mb3IgdGhlIGJvZHksIHdlIG5lZWQgdG8gbGlzdGVuIGZvciBhbGwgY2hhbmdlcyBlZmZlY3RpbmcgdGhlIHN0eWxlIGFuZCBjbGFzcyBhdHRyaWJ1dGVzXHJcbiAgLy8gICAgIHZhciBib2R5T2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihib2R5TXV0YXRpb24pO1xyXG4gIC8vICAgICBib2R5T2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7IGF0dHJpYnV0ZXM6IHRydWUsIGNoaWxkTGlzdDogdHJ1ZSwgY2hhcmFjdGVyRGF0YTogZmFsc2UsIHN1YnRyZWU6dHJ1ZSwgYXR0cmlidXRlRmlsdGVyOltcInN0eWxlXCIsIFwiY2xhc3NcIl19KTtcclxuICAvL1xyXG4gIC8vXHJcbiAgLy8gICAgIC8vYm9keSBjYWxsYmFja1xyXG4gIC8vICAgICBmdW5jdGlvbiBib2R5TXV0YXRpb24obXV0YXRlKSB7XHJcbiAgLy8gICAgICAgLy90cmlnZ2VyIGFsbCBsaXN0ZW5pbmcgZWxlbWVudHMgYW5kIHNpZ25hbCBhIG11dGF0aW9uIGV2ZW50XHJcbiAgLy8gICAgICAgaWYgKHRpbWVyKSB7IGNsZWFyVGltZW91dCh0aW1lcik7IH1cclxuICAvL1xyXG4gIC8vICAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAvLyAgICAgICAgIGJvZHlPYnNlcnZlci5kaXNjb25uZWN0KCk7XHJcbiAgLy8gICAgICAgICAkKCdbZGF0YS1tdXRhdGVdJykuYXR0cignZGF0YS1ldmVudHMnLFwibXV0YXRlXCIpO1xyXG4gIC8vICAgICAgIH0sIGRlYm91bmNlIHx8IDE1MCk7XHJcbiAgLy8gICAgIH1cclxuICAvLyAgIH1cclxuICAvLyB9XHJcbiAgdmFyIGV2ZW50c0xpc3RlbmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZighTXV0YXRpb25PYnNlcnZlcil7IHJldHVybiBmYWxzZTsgfVxyXG4gICAgdmFyIG5vZGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtcmVzaXplXSwgW2RhdGEtc2Nyb2xsXSwgW2RhdGEtbXV0YXRlXScpO1xyXG5cclxuICAgIC8vZWxlbWVudCBjYWxsYmFja1xyXG4gICAgdmFyIGxpc3RlbmluZ0VsZW1lbnRzTXV0YXRpb24gPSBmdW5jdGlvbihtdXRhdGlvblJlY29yZHNMaXN0KSB7XHJcbiAgICAgIHZhciAkdGFyZ2V0ID0gJChtdXRhdGlvblJlY29yZHNMaXN0WzBdLnRhcmdldCk7XHJcbiAgICAgIC8vdHJpZ2dlciB0aGUgZXZlbnQgaGFuZGxlciBmb3IgdGhlIGVsZW1lbnQgZGVwZW5kaW5nIG9uIHR5cGVcclxuICAgICAgc3dpdGNoICgkdGFyZ2V0LmF0dHIoXCJkYXRhLWV2ZW50c1wiKSkge1xyXG5cclxuICAgICAgICBjYXNlIFwicmVzaXplXCIgOlxyXG4gICAgICAgICR0YXJnZXQudHJpZ2dlckhhbmRsZXIoJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInLCBbJHRhcmdldF0pO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIFwic2Nyb2xsXCIgOlxyXG4gICAgICAgICR0YXJnZXQudHJpZ2dlckhhbmRsZXIoJ3Njcm9sbG1lLnpmLnRyaWdnZXInLCBbJHRhcmdldCwgd2luZG93LnBhZ2VZT2Zmc2V0XSk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIC8vIGNhc2UgXCJtdXRhdGVcIiA6XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ211dGF0ZScsICR0YXJnZXQpO1xyXG4gICAgICAgIC8vICR0YXJnZXQudHJpZ2dlckhhbmRsZXIoJ211dGF0ZS56Zi50cmlnZ2VyJyk7XHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyAvL21ha2Ugc3VyZSB3ZSBkb24ndCBnZXQgc3R1Y2sgaW4gYW4gaW5maW5pdGUgbG9vcCBmcm9tIHNsb3BweSBjb2RlaW5nXHJcbiAgICAgICAgLy8gaWYgKCR0YXJnZXQuaW5kZXgoJ1tkYXRhLW11dGF0ZV0nKSA9PSAkKFwiW2RhdGEtbXV0YXRlXVwiKS5sZW5ndGgtMSkge1xyXG4gICAgICAgIC8vICAgZG9tTXV0YXRpb25PYnNlcnZlcigpO1xyXG4gICAgICAgIC8vIH1cclxuICAgICAgICAvLyBicmVhaztcclxuXHJcbiAgICAgICAgZGVmYXVsdCA6XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIC8vbm90aGluZ1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYobm9kZXMubGVuZ3RoKXtcclxuICAgICAgLy9mb3IgZWFjaCBlbGVtZW50IHRoYXQgbmVlZHMgdG8gbGlzdGVuIGZvciByZXNpemluZywgc2Nyb2xsaW5nLCAob3IgY29taW5nIHNvb24gbXV0YXRpb24pIGFkZCBhIHNpbmdsZSBvYnNlcnZlclxyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBub2Rlcy5sZW5ndGgtMTsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGVsZW1lbnRPYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGxpc3RlbmluZ0VsZW1lbnRzTXV0YXRpb24pO1xyXG4gICAgICAgIGVsZW1lbnRPYnNlcnZlci5vYnNlcnZlKG5vZGVzW2ldLCB7IGF0dHJpYnV0ZXM6IHRydWUsIGNoaWxkTGlzdDogZmFsc2UsIGNoYXJhY3RlckRhdGE6IGZhbHNlLCBzdWJ0cmVlOmZhbHNlLCBhdHRyaWJ1dGVGaWx0ZXI6W1wiZGF0YS1ldmVudHNcIl19KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIC8vIFtQSF1cclxuICAvLyBGb3VuZGF0aW9uLkNoZWNrV2F0Y2hlcnMgPSBjaGVja1dhdGNoZXJzO1xyXG4gIEZvdW5kYXRpb24uSUhlYXJZb3UgPSBjaGVja0xpc3RlbmVycztcclxuICAvLyBGb3VuZGF0aW9uLklTZWVZb3UgPSBzY3JvbGxMaXN0ZW5lcjtcclxuICAvLyBGb3VuZGF0aW9uLklGZWVsWW91ID0gY2xvc2VtZUxpc3RlbmVyO1xyXG5cclxufSh3aW5kb3cuRm91bmRhdGlvbiwgd2luZG93LmpRdWVyeSk7XHJcbiIsIiFmdW5jdGlvbihGb3VuZGF0aW9uLCAkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIEFiaWRlLlxyXG4gICAqIEBjbGFzc1xyXG4gICAqIEBmaXJlcyBBYmlkZSNpbml0XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIGFkZCB0aGUgdHJpZ2dlciB0by5cclxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gQWJpZGUoZWxlbWVudCwgb3B0aW9ucykge1xyXG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICB0aGlzLm9wdGlvbnMgID0gJC5leHRlbmQoe30sIEFiaWRlLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XHJcblxyXG4gICAgdGhpcy5faW5pdCgpO1xyXG5cclxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ0FiaWRlJyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZWZhdWx0IHNldHRpbmdzIGZvciBwbHVnaW5cclxuICAgKi9cclxuICBBYmlkZS5kZWZhdWx0cyA9IHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRlZmF1bHQgZXZlbnQgdG8gdmFsaWRhdGUgaW5wdXRzLiBDaGVja2JveGVzIGFuZCByYWRpb3MgdmFsaWRhdGUgaW1tZWRpYXRlbHkuXHJcbiAgICAgKiBSZW1vdmUgb3IgY2hhbmdlIHRoaXMgdmFsdWUgZm9yIG1hbnVhbCB2YWxpZGF0aW9uLlxyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgJ2ZpZWxkQ2hhbmdlJ1xyXG4gICAgICovXHJcbiAgICB2YWxpZGF0ZU9uOiAnZmllbGRDaGFuZ2UnLFxyXG4gICAgLyoqXHJcbiAgICAgKiBDbGFzcyB0byBiZSBhcHBsaWVkIHRvIGlucHV0IGxhYmVscyBvbiBmYWlsZWQgdmFsaWRhdGlvbi5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlICdpcy1pbnZhbGlkLWxhYmVsJ1xyXG4gICAgICovXHJcbiAgICBsYWJlbEVycm9yQ2xhc3M6ICdpcy1pbnZhbGlkLWxhYmVsJyxcclxuICAgIC8qKlxyXG4gICAgICogQ2xhc3MgdG8gYmUgYXBwbGllZCB0byBpbnB1dHMgb24gZmFpbGVkIHZhbGlkYXRpb24uXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKiBAZXhhbXBsZSAnaXMtaW52YWxpZC1pbnB1dCdcclxuICAgICAqL1xyXG4gICAgaW5wdXRFcnJvckNsYXNzOiAnaXMtaW52YWxpZC1pbnB1dCcsXHJcbiAgICAvKipcclxuICAgICAqIENsYXNzIHNlbGVjdG9yIHRvIHVzZSB0byB0YXJnZXQgRm9ybSBFcnJvcnMgZm9yIHNob3cvaGlkZS5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlICcuZm9ybS1lcnJvcidcclxuICAgICAqL1xyXG4gICAgZm9ybUVycm9yU2VsZWN0b3I6ICcuZm9ybS1lcnJvcicsXHJcbiAgICAvKipcclxuICAgICAqIENsYXNzIGFkZGVkIHRvIEZvcm0gRXJyb3JzIG9uIGZhaWxlZCB2YWxpZGF0aW9uLlxyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgJ2lzLXZpc2libGUnXHJcbiAgICAgKi9cclxuICAgIGZvcm1FcnJvckNsYXNzOiAnaXMtdmlzaWJsZScsXHJcbiAgICAvKipcclxuICAgICAqIFNldCB0byB0cnVlIHRvIHZhbGlkYXRlIHRleHQgaW5wdXRzIG9uIGFueSB2YWx1ZSBjaGFuZ2UuXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKiBAZXhhbXBsZSBmYWxzZVxyXG4gICAgICovXHJcbiAgICBsaXZlVmFsaWRhdGU6IGZhbHNlLFxyXG5cclxuICAgIHBhdHRlcm5zOiB7XHJcbiAgICAgIGFscGhhIDogL15bYS16QS1aXSskLyxcclxuICAgICAgYWxwaGFfbnVtZXJpYyA6IC9eW2EtekEtWjAtOV0rJC8sXHJcbiAgICAgIGludGVnZXIgOiAvXlstK10/XFxkKyQvLFxyXG4gICAgICBudW1iZXIgOiAvXlstK10/XFxkKig/OltcXC5cXCxdXFxkKyk/JC8sXHJcblxyXG4gICAgICAvLyBhbWV4LCB2aXNhLCBkaW5lcnNcclxuICAgICAgY2FyZCA6IC9eKD86NFswLTldezEyfSg/OlswLTldezN9KT98NVsxLTVdWzAtOV17MTR9fDYoPzowMTF8NVswLTldWzAtOV0pWzAtOV17MTJ9fDNbNDddWzAtOV17MTN9fDMoPzowWzAtNV18WzY4XVswLTldKVswLTldezExfXwoPzoyMTMxfDE4MDB8MzVcXGR7M30pXFxkezExfSkkLyxcclxuICAgICAgY3Z2IDogL14oWzAtOV0pezMsNH0kLyxcclxuXHJcbiAgICAgIC8vIGh0dHA6Ly93d3cud2hhdHdnLm9yZy9zcGVjcy93ZWItYXBwcy9jdXJyZW50LXdvcmsvbXVsdGlwYWdlL3N0YXRlcy1vZi10aGUtdHlwZS1hdHRyaWJ1dGUuaHRtbCN2YWxpZC1lLW1haWwtYWRkcmVzc1xyXG4gICAgICBlbWFpbCA6IC9eW2EtekEtWjAtOS4hIyQlJicqK1xcLz0/Xl9ge3x9fi1dK0BbYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8oPzpcXC5bYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8pKyQvLFxyXG5cclxuICAgICAgdXJsIDogL14oaHR0cHM/fGZ0cHxmaWxlfHNzaCk6XFwvXFwvKCgoKFthLXpBLVpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDopKkApPygoKFxcZHxbMS05XVxcZHwxXFxkXFxkfDJbMC00XVxcZHwyNVswLTVdKVxcLihcXGR8WzEtOV1cXGR8MVxcZFxcZHwyWzAtNF1cXGR8MjVbMC01XSlcXC4oXFxkfFsxLTldXFxkfDFcXGRcXGR8MlswLTRdXFxkfDI1WzAtNV0pXFwuKFxcZHxbMS05XVxcZHwxXFxkXFxkfDJbMC00XVxcZHwyNVswLTVdKSl8KCgoW2EtekEtWl18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoKFthLXpBLVpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkoW2EtekEtWl18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkqKFthLXpBLVpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkpKVxcLikrKChbYS16QS1aXXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KChbYS16QS1aXXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkoW2EtekEtWl18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkqKFthLXpBLVpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpXFwuPykoOlxcZCopPykoXFwvKCgoW2EtekEtWl18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KCVbXFxkYS1mXXsyfSl8WyFcXCQmJ1xcKFxcKVxcKlxcKyw7PV18OnxAKSsoXFwvKChbYS16QS1aXXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoJVtcXGRhLWZdezJ9KXxbIVxcJCYnXFwoXFwpXFwqXFwrLDs9XXw6fEApKikqKT8pPyhcXD8oKChbYS16QS1aXXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoJVtcXGRhLWZdezJ9KXxbIVxcJCYnXFwoXFwpXFwqXFwrLDs9XXw6fEApfFtcXHVFMDAwLVxcdUY4RkZdfFxcL3xcXD8pKik/KFxcIygoKFthLXpBLVpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDp8QCl8XFwvfFxcPykqKT8kLyxcclxuICAgICAgLy8gYWJjLmRlXHJcbiAgICAgIGRvbWFpbiA6IC9eKFthLXpBLVowLTldKFthLXpBLVowLTlcXC1dezAsNjF9W2EtekEtWjAtOV0pP1xcLikrW2EtekEtWl17Miw4fSQvLFxyXG5cclxuICAgICAgZGF0ZXRpbWUgOiAvXihbMC0yXVswLTldezN9KVxcLShbMC0xXVswLTldKVxcLShbMC0zXVswLTldKVQoWzAtNV1bMC05XSlcXDooWzAtNV1bMC05XSlcXDooWzAtNV1bMC05XSkoWnwoW1xcLVxcK10oWzAtMV1bMC05XSlcXDowMCkpJC8sXHJcbiAgICAgIC8vIFlZWVktTU0tRERcclxuICAgICAgZGF0ZSA6IC8oPzoxOXwyMClbMC05XXsyfS0oPzooPzowWzEtOV18MVswLTJdKS0oPzowWzEtOV18MVswLTldfDJbMC05XSl8KD86KD8hMDIpKD86MFsxLTldfDFbMC0yXSktKD86MzApKXwoPzooPzowWzEzNTc4XXwxWzAyXSktMzEpKSQvLFxyXG4gICAgICAvLyBISDpNTTpTU1xyXG4gICAgICB0aW1lIDogL14oMFswLTldfDFbMC05XXwyWzAtM10pKDpbMC01XVswLTldKXsyfSQvLFxyXG4gICAgICBkYXRlSVNPIDogL15cXGR7NH1bXFwvXFwtXVxcZHsxLDJ9W1xcL1xcLV1cXGR7MSwyfSQvLFxyXG4gICAgICAvLyBNTS9ERC9ZWVlZXHJcbiAgICAgIG1vbnRoX2RheV95ZWFyIDogL14oMFsxLTldfDFbMDEyXSlbLSBcXC8uXSgwWzEtOV18WzEyXVswLTldfDNbMDFdKVstIFxcLy5dXFxkezR9JC8sXHJcbiAgICAgIC8vIEREL01NL1lZWVlcclxuICAgICAgZGF5X21vbnRoX3llYXIgOiAvXigwWzEtOV18WzEyXVswLTldfDNbMDFdKVstIFxcLy5dKDBbMS05XXwxWzAxMl0pWy0gXFwvLl1cXGR7NH0kLyxcclxuXHJcbiAgICAgIC8vICNGRkYgb3IgI0ZGRkZGRlxyXG4gICAgICBjb2xvciA6IC9eIz8oW2EtZkEtRjAtOV17Nn18W2EtZkEtRjAtOV17M30pJC9cclxuICAgIH0sXHJcbiAgICAvKipcclxuICAgICAqIE9wdGlvbmFsIHZhbGlkYXRpb24gZnVuY3Rpb25zIHRvIGJlIHVzZWQuIGBlcXVhbFRvYCBiZWluZyB0aGUgb25seSBkZWZhdWx0IGluY2x1ZGVkIGZ1bmN0aW9uLlxyXG4gICAgICogRnVuY3Rpb25zIHNob3VsZCByZXR1cm4gb25seSBhIGJvb2xlYW4gaWYgdGhlIGlucHV0IGlzIHZhbGlkIG9yIG5vdC4gRnVuY3Rpb25zIGFyZSBnaXZlbiB0aGUgZm9sbG93aW5nIGFyZ3VtZW50czpcclxuICAgICAqIGVsIDogVGhlIGpRdWVyeSBlbGVtZW50IHRvIHZhbGlkYXRlLlxyXG4gICAgICogcmVxdWlyZWQgOiBCb29sZWFuIHZhbHVlIG9mIHRoZSByZXF1aXJlZCBhdHRyaWJ1dGUgYmUgcHJlc2VudCBvciBub3QuXHJcbiAgICAgKiBwYXJlbnQgOiBUaGUgZGlyZWN0IHBhcmVudCBvZiB0aGUgaW5wdXQuXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKi9cclxuICAgIHZhbGlkYXRvcnM6IHtcclxuICAgICAgZXF1YWxUbzogZnVuY3Rpb24gKGVsLCByZXF1aXJlZCwgcGFyZW50KSB7XHJcbiAgICAgICAgcmV0dXJuICQoJyMnICsgZWwuYXR0cignZGF0YS1lcXVhbHRvJykpLnZhbCgpID09PSBlbC52YWwoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG5cclxuICAvKipcclxuICAgKiBJbml0aWFsaXplcyB0aGUgQWJpZGUgcGx1Z2luIGFuZCBjYWxscyBmdW5jdGlvbnMgdG8gZ2V0IEFiaWRlIGZ1bmN0aW9uaW5nIG9uIGxvYWQuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBBYmlkZS5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbigpe1xyXG4gICAgdGhpcy4kaW5wdXRzID0gdGhpcy4kZWxlbWVudC5maW5kKCdpbnB1dCwgdGV4dGFyZWEsIHNlbGVjdCcpLm5vdCgnW2RhdGEtYWJpZGUtaWdub3JlXScpO1xyXG5cclxuICAgIHRoaXMuX2V2ZW50cygpO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEluaXRpYWxpemVzIGV2ZW50cyBmb3IgQWJpZGUuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBBYmlkZS5wcm90b3R5cGUuX2V2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuXHJcbiAgICB0aGlzLiRlbGVtZW50Lm9mZignLmFiaWRlJylcclxuICAgICAgICAub24oJ3Jlc2V0LnpmLmFiaWRlJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICBfdGhpcy5yZXNldEZvcm0oKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5vbignc3VibWl0LnpmLmFiaWRlJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICByZXR1cm4gX3RoaXMudmFsaWRhdGVGb3JtKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgaWYodGhpcy5vcHRpb25zLnZhbGlkYXRlT24gPT09ICdmaWVsZENoYW5nZScpe1xyXG4gICAgICAgIHRoaXMuJGlucHV0cy5vZmYoJ2NoYW5nZS56Zi5hYmlkZScpXHJcbiAgICAgICAgICAgIC5vbignY2hhbmdlLnpmLmFiaWRlJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgICAgX3RoaXMudmFsaWRhdGVJbnB1dCgkKHRoaXMpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYodGhpcy5vcHRpb25zLmxpdmVWYWxpZGF0ZSl7XHJcbiAgICAgIHRoaXMuJGlucHV0cy5vZmYoJ2lucHV0LnpmLmFiaWRlJylcclxuICAgICAgICAgIC5vbignaW5wdXQuemYuYWJpZGUnLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgX3RoaXMudmFsaWRhdGVJbnB1dCgkKHRoaXMpKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgbmVjZXNzYXJ5IGZ1bmN0aW9ucyB0byB1cGRhdGUgQWJpZGUgdXBvbiBET00gY2hhbmdlXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBBYmlkZS5wcm90b3R5cGUuX3JlZmxvdyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5faW5pdCgpO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogQ2hlY2tzIHdoZXRoZXIgb3Igbm90IGEgZm9ybSBlbGVtZW50IGhhcyB0aGUgcmVxdWlyZWQgYXR0cmlidXRlIGFuZCBpZiBpdCdzIGNoZWNrZWQgb3Igbm90XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIGNoZWNrIGZvciByZXF1aXJlZCBhdHRyaWJ1dGVcclxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gQm9vbGVhbiB2YWx1ZSBkZXBlbmRzIG9uIHdoZXRoZXIgb3Igbm90IGF0dHJpYnV0ZSBpcyBjaGVja2VkIG9yIGVtcHR5XHJcbiAgICovXHJcbiAgQWJpZGUucHJvdG90eXBlLnJlcXVpcmVkQ2hlY2sgPSBmdW5jdGlvbigkZWwpIHtcclxuICAgIGlmKCEkZWwuYXR0cigncmVxdWlyZWQnKSkgcmV0dXJuIHRydWU7XHJcbiAgICB2YXIgaXNHb29kID0gdHJ1ZTtcclxuICAgIHN3aXRjaCAoJGVsWzBdLnR5cGUpIHtcclxuXHJcbiAgICAgIGNhc2UgJ2NoZWNrYm94JzpcclxuICAgICAgY2FzZSAncmFkaW8nOlxyXG4gICAgICAgIGlzR29vZCA9ICRlbFswXS5jaGVja2VkO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSAnc2VsZWN0JzpcclxuICAgICAgY2FzZSAnc2VsZWN0LW9uZSc6XHJcbiAgICAgIGNhc2UgJ3NlbGVjdC1tdWx0aXBsZSc6XHJcbiAgICAgICAgdmFyIG9wdCA9ICRlbC5maW5kKCdvcHRpb246c2VsZWN0ZWQnKTtcclxuICAgICAgICBpZighb3B0Lmxlbmd0aCB8fCAhb3B0LnZhbCgpKSBpc0dvb2QgPSBmYWxzZTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgaWYoISRlbC52YWwoKSB8fCAhJGVsLnZhbCgpLmxlbmd0aCkgaXNHb29kID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaXNHb29kO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogQmFzZWQgb24gJGVsLCBnZXQgdGhlIGZpcnN0IGVsZW1lbnQgd2l0aCBzZWxlY3RvciBpbiB0aGlzIG9yZGVyOlxyXG4gICAqIDEuIFRoZSBlbGVtZW50J3MgZGlyZWN0IHNpYmxpbmcoJ3MpLlxyXG4gICAqIDMuIFRoZSBlbGVtZW50J3MgcGFyZW50J3MgY2hpbGRyZW4uXHJcbiAgICpcclxuICAgKiBUaGlzIGFsbG93cyBmb3IgbXVsdGlwbGUgZm9ybSBlcnJvcnMgcGVyIGlucHV0LCB0aG91Z2ggaWYgbm9uZSBhcmUgZm91bmQsIG5vIGZvcm0gZXJyb3JzIHdpbGwgYmUgc2hvd24uXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge09iamVjdH0gJGVsIC0galF1ZXJ5IG9iamVjdCB0byB1c2UgYXMgcmVmZXJlbmNlIHRvIGZpbmQgdGhlIGZvcm0gZXJyb3Igc2VsZWN0b3IuXHJcbiAgICogQHJldHVybnMge09iamVjdH0galF1ZXJ5IG9iamVjdCB3aXRoIHRoZSBzZWxlY3Rvci5cclxuICAgKi9cclxuICBBYmlkZS5wcm90b3R5cGUuZmluZEZvcm1FcnJvciA9IGZ1bmN0aW9uKCRlbCl7XHJcbiAgICB2YXIgJGVycm9yID0gJGVsLnNpYmxpbmdzKHRoaXMub3B0aW9ucy5mb3JtRXJyb3JTZWxlY3Rvcik7XHJcbiAgICBpZighJGVycm9yLmxlbmd0aCl7XHJcbiAgICAgICRlcnJvciA9ICRlbC5wYXJlbnQoKS5maW5kKHRoaXMub3B0aW9ucy5mb3JtRXJyb3JTZWxlY3Rvcik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gJGVycm9yO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBmaXJzdCBlbGVtZW50IGluIHRoaXMgb3JkZXI6XHJcbiAgICogMi4gVGhlIDxsYWJlbD4gd2l0aCB0aGUgYXR0cmlidXRlIGBbZm9yPVwic29tZUlucHV0SWRcIl1gXHJcbiAgICogMy4gVGhlIGAuY2xvc2VzdCgpYCA8bGFiZWw+XHJcbiAgICpcclxuICAgKiBAcGFyYW0ge09iamVjdH0gJGVsIC0galF1ZXJ5IG9iamVjdCB0byBjaGVjayBmb3IgcmVxdWlyZWQgYXR0cmlidXRlXHJcbiAgICogQHJldHVybnMge0Jvb2xlYW59IEJvb2xlYW4gdmFsdWUgZGVwZW5kcyBvbiB3aGV0aGVyIG9yIG5vdCBhdHRyaWJ1dGUgaXMgY2hlY2tlZCBvciBlbXB0eVxyXG4gICAqL1xyXG4gIEFiaWRlLnByb3RvdHlwZS5maW5kTGFiZWwgPSBmdW5jdGlvbigkZWwpIHtcclxuICAgIHZhciAkbGFiZWwgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ2xhYmVsW2Zvcj1cIicgKyAkZWxbMF0uaWQgKyAnXCJdJyk7XHJcbiAgICBpZighJGxhYmVsLmxlbmd0aCl7XHJcbiAgICAgIHJldHVybiAkZWwuY2xvc2VzdCgnbGFiZWwnKTtcclxuICAgIH1cclxuICAgIHJldHVybiAkbGFiZWw7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiBBZGRzIHRoZSBDU1MgZXJyb3IgY2xhc3MgYXMgc3BlY2lmaWVkIGJ5IHRoZSBBYmlkZSBzZXR0aW5ncyB0byB0aGUgbGFiZWwsIGlucHV0LCBhbmQgdGhlIGZvcm1cclxuICAgKiBAcGFyYW0ge09iamVjdH0gJGVsIC0galF1ZXJ5IG9iamVjdCB0byBhZGQgdGhlIGNsYXNzIHRvXHJcbiAgICovXHJcbiAgQWJpZGUucHJvdG90eXBlLmFkZEVycm9yQ2xhc3NlcyA9IGZ1bmN0aW9uKCRlbCl7XHJcbiAgICB2YXIgJGxhYmVsID0gdGhpcy5maW5kTGFiZWwoJGVsKSxcclxuICAgICAgICAkZm9ybUVycm9yID0gdGhpcy5maW5kRm9ybUVycm9yKCRlbCk7XHJcblxyXG4gICAgaWYoJGxhYmVsLmxlbmd0aCl7XHJcbiAgICAgICRsYWJlbC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMubGFiZWxFcnJvckNsYXNzKTtcclxuICAgIH1cclxuICAgIGlmKCRmb3JtRXJyb3IubGVuZ3RoKXtcclxuICAgICAgJGZvcm1FcnJvci5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuZm9ybUVycm9yQ2xhc3MpO1xyXG4gICAgfVxyXG4gICAgJGVsLmFkZENsYXNzKHRoaXMub3B0aW9ucy5pbnB1dEVycm9yQ2xhc3MpLmF0dHIoJ2RhdGEtaW52YWxpZCcsICcnKTtcclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgQ1NTIGVycm9yIGNsYXNzIGFzIHNwZWNpZmllZCBieSB0aGUgQWJpZGUgc2V0dGluZ3MgZnJvbSB0aGUgbGFiZWwsIGlucHV0LCBhbmQgdGhlIGZvcm1cclxuICAgKiBAcGFyYW0ge09iamVjdH0gJGVsIC0galF1ZXJ5IG9iamVjdCB0byByZW1vdmUgdGhlIGNsYXNzIGZyb21cclxuICAgKi9cclxuICBBYmlkZS5wcm90b3R5cGUucmVtb3ZlRXJyb3JDbGFzc2VzID0gZnVuY3Rpb24oJGVsKXtcclxuICAgIHZhciAkbGFiZWwgPSB0aGlzLmZpbmRMYWJlbCgkZWwpLFxyXG4gICAgICAgICRmb3JtRXJyb3IgPSB0aGlzLmZpbmRGb3JtRXJyb3IoJGVsKTtcclxuXHJcbiAgICBpZigkbGFiZWwubGVuZ3RoKXtcclxuICAgICAgJGxhYmVsLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5sYWJlbEVycm9yQ2xhc3MpO1xyXG4gICAgfVxyXG4gICAgaWYoJGZvcm1FcnJvci5sZW5ndGgpe1xyXG4gICAgICAkZm9ybUVycm9yLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5mb3JtRXJyb3JDbGFzcyk7XHJcbiAgICB9XHJcbiAgICAkZWwucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmlucHV0RXJyb3JDbGFzcykucmVtb3ZlQXR0cignZGF0YS1pbnZhbGlkJyk7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiBHb2VzIHRocm91Z2ggYSBmb3JtIHRvIGZpbmQgaW5wdXRzIGFuZCBwcm9jZWVkcyB0byB2YWxpZGF0ZSB0aGVtIGluIHdheXMgc3BlY2lmaWMgdG8gdGhlaXIgdHlwZVxyXG4gICAqIEBmaXJlcyBBYmlkZSNpbnZhbGlkXHJcbiAgICogQGZpcmVzIEFiaWRlI3ZhbGlkXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHZhbGlkYXRlLCBzaG91bGQgYmUgYW4gSFRNTCBpbnB1dFxyXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBnb29kVG9HbyAtIElmIHRoZSBpbnB1dCBpcyB2YWxpZCBvciBub3QuXHJcbiAgICovXHJcbiAgQWJpZGUucHJvdG90eXBlLnZhbGlkYXRlSW5wdXQgPSBmdW5jdGlvbigkZWwpe1xyXG4gICAgdmFyIGNsZWFyUmVxdWlyZSA9IHRoaXMucmVxdWlyZWRDaGVjaygkZWwpLFxyXG4gICAgICAgIHZhbGlkYXRlZCA9IGZhbHNlLFxyXG4gICAgICAgIGN1c3RvbVZhbGlkYXRvciA9IHRydWUsXHJcbiAgICAgICAgdmFsaWRhdG9yID0gJGVsLmF0dHIoJ2RhdGEtdmFsaWRhdG9yJyksXHJcbiAgICAgICAgZXF1YWxUbyA9IHRydWU7XHJcblxyXG4gICAgc3dpdGNoICgkZWxbMF0udHlwZSkge1xyXG5cclxuICAgICAgY2FzZSAncmFkaW8nOlxyXG4gICAgICAgIHZhbGlkYXRlZCA9IHRoaXMudmFsaWRhdGVSYWRpbygkZWwuYXR0cignbmFtZScpKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgJ2NoZWNrYm94JzpcclxuICAgICAgICB2YWxpZGF0ZWQgPSBjbGVhclJlcXVpcmU7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlICdzZWxlY3QnOlxyXG4gICAgICBjYXNlICdzZWxlY3Qtb25lJzpcclxuICAgICAgY2FzZSAnc2VsZWN0LW11bHRpcGxlJzpcclxuICAgICAgICB2YWxpZGF0ZWQgPSBjbGVhclJlcXVpcmU7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHZhbGlkYXRlZCA9IHRoaXMudmFsaWRhdGVUZXh0KCRlbCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYodmFsaWRhdG9yKXsgY3VzdG9tVmFsaWRhdG9yID0gdGhpcy5tYXRjaFZhbGlkYXRpb24oJGVsLCB2YWxpZGF0b3IsICRlbC5hdHRyKCdyZXF1aXJlZCcpKTsgfVxyXG4gICAgaWYoJGVsLmF0dHIoJ2RhdGEtZXF1YWx0bycpKXsgZXF1YWxUbyA9IHRoaXMub3B0aW9ucy52YWxpZGF0b3JzLmVxdWFsVG8oJGVsKTsgfVxyXG5cclxuICAgIHZhciBnb29kVG9HbyA9IFtjbGVhclJlcXVpcmUsIHZhbGlkYXRlZCwgY3VzdG9tVmFsaWRhdG9yLCBlcXVhbFRvXS5pbmRleE9mKGZhbHNlKSA9PT0gLTEsXHJcbiAgICAgICAgbWVzc2FnZSA9IChnb29kVG9HbyA/ICd2YWxpZCcgOiAnaW52YWxpZCcpICsgJy56Zi5hYmlkZSc7XHJcblxyXG4gICAgdGhpc1tnb29kVG9HbyA/ICdyZW1vdmVFcnJvckNsYXNzZXMnIDogJ2FkZEVycm9yQ2xhc3NlcyddKCRlbCk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSBpbnB1dCBpcyBkb25lIGNoZWNraW5nIGZvciB2YWxpZGF0aW9uLiBFdmVudCB0cmlnZ2VyIGlzIGVpdGhlciBgdmFsaWQuemYuYWJpZGVgIG9yIGBpbnZhbGlkLnpmLmFiaWRlYFxyXG4gICAgICogVHJpZ2dlciBpbmNsdWRlcyB0aGUgRE9NIGVsZW1lbnQgb2YgdGhlIGlucHV0LlxyXG4gICAgICogQGV2ZW50IEFiaWRlI3ZhbGlkXHJcbiAgICAgKiBAZXZlbnQgQWJpZGUjaW52YWxpZFxyXG4gICAgICovXHJcbiAgICAkZWwudHJpZ2dlcihtZXNzYWdlLCBbJGVsXSk7XHJcblxyXG4gICAgcmV0dXJuIGdvb2RUb0dvO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogR29lcyB0aHJvdWdoIGEgZm9ybSBhbmQgaWYgdGhlcmUgYXJlIGFueSBpbnZhbGlkIGlucHV0cywgaXQgd2lsbCBkaXNwbGF5IHRoZSBmb3JtIGVycm9yIGVsZW1lbnRcclxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gbm9FcnJvciAtIHRydWUgaWYgbm8gZXJyb3JzIHdlcmUgZGV0ZWN0ZWQuLi5cclxuICAgKiBAZmlyZXMgQWJpZGUjZm9ybXZhbGlkXHJcbiAgICogQGZpcmVzIEFiaWRlI2Zvcm1pbnZhbGlkXHJcbiAgICovXHJcbiAgQWJpZGUucHJvdG90eXBlLnZhbGlkYXRlRm9ybSA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgYWNjID0gW10sXHJcbiAgICAgICAgX3RoaXMgPSB0aGlzO1xyXG5cclxuICAgIHRoaXMuJGlucHV0cy5lYWNoKGZ1bmN0aW9uKCl7XHJcbiAgICAgIGFjYy5wdXNoKF90aGlzLnZhbGlkYXRlSW5wdXQoJCh0aGlzKSkpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIG5vRXJyb3IgPSBhY2MuaW5kZXhPZihmYWxzZSkgPT09IC0xO1xyXG5cclxuICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtYWJpZGUtZXJyb3JdJykuY3NzKCdkaXNwbGF5JywgKG5vRXJyb3IgPyAnbm9uZScgOiAnYmxvY2snKSk7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgZm9ybSBpcyBmaW5pc2hlZCB2YWxpZGF0aW5nLiBFdmVudCB0cmlnZ2VyIGlzIGVpdGhlciBgZm9ybXZhbGlkLnpmLmFiaWRlYCBvciBgZm9ybWludmFsaWQuemYuYWJpZGVgLlxyXG4gICAgICAgICAqIFRyaWdnZXIgaW5jbHVkZXMgdGhlIGVsZW1lbnQgb2YgdGhlIGZvcm0uXHJcbiAgICAgICAgICogQGV2ZW50IEFiaWRlI2Zvcm12YWxpZFxyXG4gICAgICAgICAqIEBldmVudCBBYmlkZSNmb3JtaW52YWxpZFxyXG4gICAgICAgICAqL1xyXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKChub0Vycm9yID8gJ2Zvcm12YWxpZCcgOiAnZm9ybWludmFsaWQnKSArICcuemYuYWJpZGUnLCBbdGhpcy4kZWxlbWVudF0pO1xyXG5cclxuICAgIHJldHVybiBub0Vycm9yO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIG9yIGEgbm90IGEgdGV4dCBpbnB1dCBpcyB2YWxpZCBiYXNlZCBvbiB0aGUgcGF0dGVybiBzcGVjaWZpZWQgaW4gdGhlIGF0dHJpYnV0ZS4gSWYgbm8gbWF0Y2hpbmcgcGF0dGVybiBpcyBmb3VuZCwgcmV0dXJucyB0cnVlLlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSAkZWwgLSBqUXVlcnkgb2JqZWN0IHRvIHZhbGlkYXRlLCBzaG91bGQgYmUgYSB0ZXh0IGlucHV0IEhUTUwgZWxlbWVudFxyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXR0ZXJuIC0gc3RyaW5nIHZhbHVlIG9mIG9uZSBvZiB0aGUgUmVnRXggcGF0dGVybnMgaW4gQWJpZGUub3B0aW9ucy5wYXR0ZXJuc1xyXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBCb29sZWFuIHZhbHVlIGRlcGVuZHMgb24gd2hldGhlciBvciBub3QgdGhlIGlucHV0IHZhbHVlIG1hdGNoZXMgdGhlIHBhdHRlcm4gc3BlY2lmaWVkXHJcbiAgICovXHJcbiAgIEFiaWRlLnByb3RvdHlwZS52YWxpZGF0ZVRleHQgPSBmdW5jdGlvbigkZWwsIHBhdHRlcm4pe1xyXG4gICAgIC8vIHBhdHRlcm4gPSBwYXR0ZXJuID8gcGF0dGVybiA6ICRlbC5hdHRyKCdwYXR0ZXJuJykgPyAkZWwuYXR0cigncGF0dGVybicpIDogJGVsLmF0dHIoJ3R5cGUnKTtcclxuICAgICBwYXR0ZXJuID0gKHBhdHRlcm4gfHwgJGVsLmF0dHIoJ3BhdHRlcm4nKSB8fCAkZWwuYXR0cigndHlwZScpKTtcclxuICAgICB2YXIgaW5wdXRUZXh0ID0gJGVsLnZhbCgpO1xyXG5cclxuICAgICByZXR1cm4gaW5wdXRUZXh0Lmxlbmd0aCA/Ly9pZiB0ZXh0LCBjaGVjayBpZiB0aGUgcGF0dGVybiBleGlzdHMsIGlmIHNvLCB0ZXN0IGl0LCBpZiBubyB0ZXh0IG9yIG5vIHBhdHRlcm4sIHJldHVybiB0cnVlLlxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMucGF0dGVybnMuaGFzT3duUHJvcGVydHkocGF0dGVybikgPyB0aGlzLm9wdGlvbnMucGF0dGVybnNbcGF0dGVybl0udGVzdChpbnB1dFRleHQpIDpcclxuICAgICAgICAgICAgcGF0dGVybiAmJiBwYXR0ZXJuICE9PSAkZWwuYXR0cigndHlwZScpID8gbmV3IFJlZ0V4cChwYXR0ZXJuKS50ZXN0KGlucHV0VGV4dCkgOiB0cnVlIDogdHJ1ZTtcclxuICAgfTsgIC8qKlxyXG4gICAqIERldGVybWluZXMgd2hldGhlciBvciBhIG5vdCBhIHJhZGlvIGlucHV0IGlzIHZhbGlkIGJhc2VkIG9uIHdoZXRoZXIgb3Igbm90IGl0IGlzIHJlcXVpcmVkIGFuZCBzZWxlY3RlZFxyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBncm91cE5hbWUgLSBBIHN0cmluZyB0aGF0IHNwZWNpZmllcyB0aGUgbmFtZSBvZiBhIHJhZGlvIGJ1dHRvbiBncm91cFxyXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBCb29sZWFuIHZhbHVlIGRlcGVuZHMgb24gd2hldGhlciBvciBub3QgYXQgbGVhc3Qgb25lIHJhZGlvIGlucHV0IGhhcyBiZWVuIHNlbGVjdGVkIChpZiBpdCdzIHJlcXVpcmVkKVxyXG4gICAqL1xyXG4gIEFiaWRlLnByb3RvdHlwZS52YWxpZGF0ZVJhZGlvID0gZnVuY3Rpb24oZ3JvdXBOYW1lKXtcclxuICAgIHZhciAkZ3JvdXAgPSB0aGlzLiRlbGVtZW50LmZpbmQoJzpyYWRpb1tuYW1lPVwiJyArIGdyb3VwTmFtZSArICdcIl0nKSxcclxuICAgICAgICBjb3VudGVyID0gW10sXHJcbiAgICAgICAgX3RoaXMgPSB0aGlzO1xyXG5cclxuICAgICRncm91cC5lYWNoKGZ1bmN0aW9uKCl7XHJcbiAgICAgIHZhciByZGlvID0gJCh0aGlzKSxcclxuICAgICAgICAgIGNsZWFyID0gX3RoaXMucmVxdWlyZWRDaGVjayhyZGlvKTtcclxuICAgICAgY291bnRlci5wdXNoKGNsZWFyKTtcclxuICAgICAgaWYoY2xlYXIpIF90aGlzLnJlbW92ZUVycm9yQ2xhc3NlcyhyZGlvKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBjb3VudGVyLmluZGV4T2YoZmFsc2UpID09PSAtMTtcclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgaWYgYSBzZWxlY3RlZCBpbnB1dCBwYXNzZXMgYSBjdXN0b20gdmFsaWRhdGlvbiBmdW5jdGlvbi4gTXVsdGlwbGUgdmFsaWRhdGlvbnMgY2FuIGJlIHVzZWQsIGlmIHBhc3NlZCB0byB0aGUgZWxlbWVudCB3aXRoIGBkYXRhLXZhbGlkYXRvcj1cImZvbyBiYXIgYmF6XCJgIGluIGEgc3BhY2Ugc2VwYXJhdGVkIGxpc3RlZC5cclxuICAgKiBAcGFyYW0ge09iamVjdH0gJGVsIC0galF1ZXJ5IGlucHV0IGVsZW1lbnQuXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IHZhbGlkYXRvcnMgLSBhIHN0cmluZyBvZiBmdW5jdGlvbiBuYW1lcyBtYXRjaGluZyBmdW5jdGlvbnMgaW4gdGhlIEFiaWRlLm9wdGlvbnMudmFsaWRhdG9ycyBvYmplY3QuXHJcbiAgICogQHBhcmFtIHtCb29sZWFufSByZXF1aXJlZCAtIHNlbGYgZXhwbGFuYXRvcnk/XHJcbiAgICogQHJldHVybnMge0Jvb2xlYW59IC0gdHJ1ZSBpZiB2YWxpZGF0aW9ucyBwYXNzZWQuXHJcbiAgICovXHJcbiAgQWJpZGUucHJvdG90eXBlLm1hdGNoVmFsaWRhdGlvbiA9IGZ1bmN0aW9uKCRlbCwgdmFsaWRhdG9ycywgcmVxdWlyZWQpe1xyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgIHJlcXVpcmVkID0gcmVxdWlyZWQgPyB0cnVlIDogZmFsc2U7XHJcbiAgICB2YXIgY2xlYXIgPSB2YWxpZGF0b3JzLnNwbGl0KCcgJykubWFwKGZ1bmN0aW9uKHYpe1xyXG4gICAgICByZXR1cm4gX3RoaXMub3B0aW9ucy52YWxpZGF0b3JzW3ZdKCRlbCwgcmVxdWlyZWQsICRlbC5wYXJlbnQoKSk7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBjbGVhci5pbmRleE9mKGZhbHNlKSA9PT0gLTE7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiBSZXNldHMgZm9ybSBpbnB1dHMgYW5kIHN0eWxlc1xyXG4gICAqIEBmaXJlcyBBYmlkZSNmb3JtcmVzZXRcclxuICAgKi9cclxuICBBYmlkZS5wcm90b3R5cGUucmVzZXRGb3JtID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgJGZvcm0gPSB0aGlzLiRlbGVtZW50LFxyXG4gICAgICAgIG9wdHMgPSB0aGlzLm9wdGlvbnM7XHJcblxyXG4gICAgJCgnLicgKyBvcHRzLmxhYmVsRXJyb3JDbGFzcywgJGZvcm0pLm5vdCgnc21hbGwnKS5yZW1vdmVDbGFzcyhvcHRzLmxhYmVsRXJyb3JDbGFzcyk7XHJcbiAgICAkKCcuJyArIG9wdHMuaW5wdXRFcnJvckNsYXNzLCAkZm9ybSkubm90KCdzbWFsbCcpLnJlbW92ZUNsYXNzKG9wdHMuaW5wdXRFcnJvckNsYXNzKTtcclxuICAgICQob3B0cy5mb3JtRXJyb3JTZWxlY3RvciArICcuJyArIG9wdHMuZm9ybUVycm9yQ2xhc3MpLnJlbW92ZUNsYXNzKG9wdHMuZm9ybUVycm9yQ2xhc3MpO1xyXG4gICAgJGZvcm0uZmluZCgnW2RhdGEtYWJpZGUtZXJyb3JdJykuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcclxuICAgICQoJzppbnB1dCcsICRmb3JtKS5ub3QoJzpidXR0b24sIDpzdWJtaXQsIDpyZXNldCwgOmhpZGRlbiwgW2RhdGEtYWJpZGUtaWdub3JlXScpLnZhbCgnJykucmVtb3ZlQXR0cignZGF0YS1pbnZhbGlkJyk7XHJcbiAgICAvKipcclxuICAgICAqIEZpcmVzIHdoZW4gdGhlIGZvcm0gaGFzIGJlZW4gcmVzZXQuXHJcbiAgICAgKiBAZXZlbnQgQWJpZGUjZm9ybXJlc2V0XHJcbiAgICAgKi9cclxuICAgICRmb3JtLnRyaWdnZXIoJ2Zvcm1yZXNldC56Zi5hYmlkZScsIFskZm9ybV0pO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogRGVzdHJveXMgYW4gaW5zdGFuY2Ugb2YgQWJpZGUuXHJcbiAgICogUmVtb3ZlcyBlcnJvciBzdHlsZXMgYW5kIGNsYXNzZXMgZnJvbSBlbGVtZW50cywgd2l0aG91dCByZXNldHRpbmcgdGhlaXIgdmFsdWVzLlxyXG4gICAqL1xyXG4gIEFiaWRlLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICB0aGlzLiRlbGVtZW50Lm9mZignLmFiaWRlJylcclxuICAgICAgICAuZmluZCgnW2RhdGEtYWJpZGUtZXJyb3JdJykuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcclxuICAgIHRoaXMuJGlucHV0cy5vZmYoJy5hYmlkZScpXHJcbiAgICAgICAgLmVhY2goZnVuY3Rpb24oKXtcclxuICAgICAgICAgIF90aGlzLnJlbW92ZUVycm9yQ2xhc3NlcygkKHRoaXMpKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XHJcbiAgfTtcclxuXHJcbiAgRm91bmRhdGlvbi5wbHVnaW4oQWJpZGUsICdBYmlkZScpO1xyXG5cclxuICAvLyBFeHBvcnRzIGZvciBBTUQvQnJvd3NlcmlmeVxyXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgIT09ICd1bmRlZmluZWQnKVxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBBYmlkZTtcclxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJylcclxuICAgIGRlZmluZShbJ2ZvdW5kYXRpb24nXSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiBBYmlkZTtcclxuICAgIH0pO1xyXG5cclxufShGb3VuZGF0aW9uLCBqUXVlcnkpO1xyXG4iLCIvKipcclxuICogQWNjb3JkaW9uIG1vZHVsZS5cclxuICogQG1vZHVsZSBmb3VuZGF0aW9uLmFjY29yZGlvblxyXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmtleWJvYXJkXHJcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubW90aW9uXHJcbiAqL1xyXG4hZnVuY3Rpb24oJCwgRm91bmRhdGlvbikge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBhbiBhY2NvcmRpb24uXHJcbiAgICogQGNsYXNzXHJcbiAgICogQGZpcmVzIEFjY29yZGlvbiNpbml0XHJcbiAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2UgaW50byBhbiBhY2NvcmRpb24uXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBhIHBsYWluIG9iamVjdCB3aXRoIHNldHRpbmdzIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0IG9wdGlvbnMuXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gQWNjb3JkaW9uKGVsZW1lbnQsIG9wdGlvbnMpe1xyXG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgQWNjb3JkaW9uLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XHJcblxyXG4gICAgdGhpcy5faW5pdCgpO1xyXG5cclxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ0FjY29yZGlvbicpO1xyXG4gICAgRm91bmRhdGlvbi5LZXlib2FyZC5yZWdpc3RlcignQWNjb3JkaW9uJywge1xyXG4gICAgICAnRU5URVInOiAndG9nZ2xlJyxcclxuICAgICAgJ1NQQUNFJzogJ3RvZ2dsZScsXHJcbiAgICAgICdBUlJPV19ET1dOJzogJ25leHQnLFxyXG4gICAgICAnQVJST1dfVVAnOiAncHJldmlvdXMnXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIEFjY29yZGlvbi5kZWZhdWx0cyA9IHtcclxuICAgIC8qKlxyXG4gICAgICogQW1vdW50IG9mIHRpbWUgdG8gYW5pbWF0ZSB0aGUgb3BlbmluZyBvZiBhbiBhY2NvcmRpb24gcGFuZS5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlIDI1MFxyXG4gICAgICovXHJcbiAgICBzbGlkZVNwZWVkOiAyNTAsXHJcbiAgICAvKipcclxuICAgICAqIEFsbG93IHRoZSBhY2NvcmRpb24gdG8gaGF2ZSBtdWx0aXBsZSBvcGVuIHBhbmVzLlxyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgZmFsc2VcclxuICAgICAqL1xyXG4gICAgbXVsdGlFeHBhbmQ6IGZhbHNlLFxyXG4gICAgLyoqXHJcbiAgICAgKiBBbGxvdyB0aGUgYWNjb3JkaW9uIHRvIGNsb3NlIGFsbCBwYW5lcy5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlIGZhbHNlXHJcbiAgICAgKi9cclxuICAgIGFsbG93QWxsQ2xvc2VkOiBmYWxzZVxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEluaXRpYWxpemVzIHRoZSBhY2NvcmRpb24gYnkgYW5pbWF0aW5nIHRoZSBwcmVzZXQgYWN0aXZlIHBhbmUocykuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBBY2NvcmRpb24ucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ3JvbGUnLCAndGFibGlzdCcpO1xyXG4gICAgdGhpcy4kdGFicyA9IHRoaXMuJGVsZW1lbnQuY2hpbGRyZW4oJ2xpJyk7XHJcbiAgICBpZiAodGhpcy4kdGFicy5sZW5ndGggPT09IDApIHtcclxuICAgICAgdGhpcy4kdGFicyA9IHRoaXMuJGVsZW1lbnQuY2hpbGRyZW4oJ1tkYXRhLWFjY29yZGlvbi1pdGVtXScpO1xyXG4gICAgfVxyXG4gICAgdGhpcy4kdGFicy5lYWNoKGZ1bmN0aW9uKGlkeCwgZWwpe1xyXG5cclxuICAgICAgdmFyICRlbCA9ICQoZWwpLFxyXG4gICAgICAgICAgJGNvbnRlbnQgPSAkZWwuZmluZCgnW2RhdGEtdGFiLWNvbnRlbnRdJyksXHJcbiAgICAgICAgICBpZCA9ICRjb250ZW50WzBdLmlkIHx8IEZvdW5kYXRpb24uR2V0WW9EaWdpdHMoNiwgJ2FjY29yZGlvbicpLFxyXG4gICAgICAgICAgbGlua0lkID0gZWwuaWQgfHwgaWQgKyAnLWxhYmVsJztcclxuXHJcbiAgICAgICRlbC5maW5kKCdhOmZpcnN0JykuYXR0cih7XHJcbiAgICAgICAgJ2FyaWEtY29udHJvbHMnOiBpZCxcclxuICAgICAgICAncm9sZSc6ICd0YWInLFxyXG4gICAgICAgICdpZCc6IGxpbmtJZCxcclxuICAgICAgICAnYXJpYS1leHBhbmRlZCc6IGZhbHNlLFxyXG4gICAgICAgICdhcmlhLXNlbGVjdGVkJzogZmFsc2VcclxuICAgICAgfSk7XHJcbiAgICAgICRjb250ZW50LmF0dHIoeydyb2xlJzogJ3RhYnBhbmVsJywgJ2FyaWEtbGFiZWxsZWRieSc6IGxpbmtJZCwgJ2FyaWEtaGlkZGVuJzogdHJ1ZSwgJ2lkJzogaWR9KTtcclxuICAgIH0pO1xyXG4gICAgdmFyICRpbml0QWN0aXZlID0gdGhpcy4kZWxlbWVudC5maW5kKCcuaXMtYWN0aXZlJykuY2hpbGRyZW4oJ1tkYXRhLXRhYi1jb250ZW50XScpO1xyXG4gICAgaWYoJGluaXRBY3RpdmUubGVuZ3RoKXtcclxuICAgICAgdGhpcy5kb3duKCRpbml0QWN0aXZlLCB0cnVlKTtcclxuICAgIH1cclxuICAgIHRoaXMuX2V2ZW50cygpO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgZXZlbnQgaGFuZGxlcnMgZm9yIGl0ZW1zIHdpdGhpbiB0aGUgYWNjb3JkaW9uLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgQWNjb3JkaW9uLnByb3RvdHlwZS5fZXZlbnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG5cclxuICAgIHRoaXMuJHRhYnMuZWFjaChmdW5jdGlvbigpe1xyXG4gICAgICB2YXIgJGVsZW0gPSAkKHRoaXMpO1xyXG4gICAgICB2YXIgJHRhYkNvbnRlbnQgPSAkZWxlbS5jaGlsZHJlbignW2RhdGEtdGFiLWNvbnRlbnRdJyk7XHJcbiAgICAgIGlmICgkdGFiQ29udGVudC5sZW5ndGgpIHtcclxuICAgICAgICAkZWxlbS5jaGlsZHJlbignYScpLm9mZignY2xpY2suemYuYWNjb3JkaW9uIGtleWRvd24uemYuYWNjb3JkaW9uJylcclxuICAgICAgICAgICAgICAgLm9uKCdjbGljay56Zi5hY2NvcmRpb24nLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAvLyAkKHRoaXMpLmNoaWxkcmVuKCdhJykub24oJ2NsaWNrLnpmLmFjY29yZGlvbicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgIGlmICgkZWxlbS5oYXNDbGFzcygnaXMtYWN0aXZlJykpIHtcclxuICAgICAgICAgICAgaWYoX3RoaXMub3B0aW9ucy5hbGxvd0FsbENsb3NlZCB8fCAkZWxlbS5zaWJsaW5ncygpLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSl7XHJcbiAgICAgICAgICAgICAgX3RoaXMudXAoJHRhYkNvbnRlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgX3RoaXMuZG93bigkdGFiQ29udGVudCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSkub24oJ2tleWRvd24uemYuYWNjb3JkaW9uJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICBGb3VuZGF0aW9uLktleWJvYXJkLmhhbmRsZUtleShlLCAnQWNjb3JkaW9uJywge1xyXG4gICAgICAgICAgICB0b2dnbGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIF90aGlzLnRvZ2dsZSgkdGFiQ29udGVudCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICRlbGVtLm5leHQoKS5maW5kKCdhJykuZm9jdXMoKS50cmlnZ2VyKCdjbGljay56Zi5hY2NvcmRpb24nKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcHJldmlvdXM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICRlbGVtLnByZXYoKS5maW5kKCdhJykuZm9jdXMoKS50cmlnZ2VyKCdjbGljay56Zi5hY2NvcmRpb24nKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaGFuZGxlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIFRvZ2dsZXMgdGhlIHNlbGVjdGVkIGNvbnRlbnQgcGFuZSdzIG9wZW4vY2xvc2Ugc3RhdGUuXHJcbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBqUXVlcnkgb2JqZWN0IG9mIHRoZSBwYW5lIHRvIHRvZ2dsZS5cclxuICAgKiBAZnVuY3Rpb25cclxuICAgKi9cclxuICBBY2NvcmRpb24ucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uKCR0YXJnZXQpe1xyXG4gICAgaWYoJHRhcmdldC5wYXJlbnQoKS5oYXNDbGFzcygnaXMtYWN0aXZlJykpe1xyXG4gICAgICBpZih0aGlzLm9wdGlvbnMuYWxsb3dBbGxDbG9zZWQgfHwgJHRhcmdldC5wYXJlbnQoKS5zaWJsaW5ncygpLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSl7XHJcbiAgICAgICAgdGhpcy51cCgkdGFyZ2V0KTtcclxuICAgICAgfWVsc2V7IHJldHVybjsgfVxyXG4gICAgfWVsc2V7XHJcbiAgICAgIHRoaXMuZG93bigkdGFyZ2V0KTtcclxuICAgIH1cclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIE9wZW5zIHRoZSBhY2NvcmRpb24gdGFiIGRlZmluZWQgYnkgYCR0YXJnZXRgLlxyXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0gQWNjb3JkaW9uIHBhbmUgdG8gb3Blbi5cclxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGZpcnN0VGltZSAtIGZsYWcgdG8gZGV0ZXJtaW5lIGlmIHJlZmxvdyBzaG91bGQgaGFwcGVuLlxyXG4gICAqIEBmaXJlcyBBY2NvcmRpb24jZG93blxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqL1xyXG4gIEFjY29yZGlvbi5wcm90b3R5cGUuZG93biA9IGZ1bmN0aW9uKCR0YXJnZXQsIGZpcnN0VGltZSkge1xyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgIGlmKCF0aGlzLm9wdGlvbnMubXVsdGlFeHBhbmQgJiYgIWZpcnN0VGltZSl7XHJcbiAgICAgIHZhciAkY3VycmVudEFjdGl2ZSA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLmlzLWFjdGl2ZScpLmNoaWxkcmVuKCdbZGF0YS10YWItY29udGVudF0nKTtcclxuICAgICAgaWYoJGN1cnJlbnRBY3RpdmUubGVuZ3RoKXtcclxuICAgICAgICB0aGlzLnVwKCRjdXJyZW50QWN0aXZlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgICR0YXJnZXRcclxuICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgZmFsc2UpXHJcbiAgICAgIC5wYXJlbnQoJ1tkYXRhLXRhYi1jb250ZW50XScpXHJcbiAgICAgIC5hZGRCYWNrKClcclxuICAgICAgLnBhcmVudCgpLmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcclxuXHJcbiAgICAvLyBGb3VuZGF0aW9uLk1vdmUoX3RoaXMub3B0aW9ucy5zbGlkZVNwZWVkLCAkdGFyZ2V0LCBmdW5jdGlvbigpe1xyXG4gICAgICAkdGFyZ2V0LnNsaWRlRG93bihfdGhpcy5vcHRpb25zLnNsaWRlU3BlZWQsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSB0YWIgaXMgZG9uZSBvcGVuaW5nLlxyXG4gICAgICAgICAqIEBldmVudCBBY2NvcmRpb24jZG93blxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIF90aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2Rvd24uemYuYWNjb3JkaW9uJywgWyR0YXJnZXRdKTtcclxuICAgICAgfSk7XHJcbiAgICAvLyB9KTtcclxuXHJcbiAgICAvLyBpZighZmlyc3RUaW1lKXtcclxuICAgIC8vICAgRm91bmRhdGlvbi5fcmVmbG93KHRoaXMuJGVsZW1lbnQuYXR0cignZGF0YS1hY2NvcmRpb24nKSk7XHJcbiAgICAvLyB9XHJcbiAgICAkKCcjJyArICR0YXJnZXQuYXR0cignYXJpYS1sYWJlbGxlZGJ5JykpLmF0dHIoe1xyXG4gICAgICAnYXJpYS1leHBhbmRlZCc6IHRydWUsXHJcbiAgICAgICdhcmlhLXNlbGVjdGVkJzogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2xvc2VzIHRoZSB0YWIgZGVmaW5lZCBieSBgJHRhcmdldGAuXHJcbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBBY2NvcmRpb24gdGFiIHRvIGNsb3NlLlxyXG4gICAqIEBmaXJlcyBBY2NvcmRpb24jdXBcclxuICAgKiBAZnVuY3Rpb25cclxuICAgKi9cclxuICBBY2NvcmRpb24ucHJvdG90eXBlLnVwID0gZnVuY3Rpb24oJHRhcmdldCkge1xyXG4gICAgdmFyICRhdW50cyA9ICR0YXJnZXQucGFyZW50KCkuc2libGluZ3MoKSxcclxuICAgICAgICBfdGhpcyA9IHRoaXM7XHJcbiAgICB2YXIgY2FuQ2xvc2UgPSB0aGlzLm9wdGlvbnMubXVsdGlFeHBhbmQgPyAkYXVudHMuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpIDogJHRhcmdldC5wYXJlbnQoKS5oYXNDbGFzcygnaXMtYWN0aXZlJyk7XHJcblxyXG4gICAgaWYoIXRoaXMub3B0aW9ucy5hbGxvd0FsbENsb3NlZCAmJiAhY2FuQ2xvc2Upe1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRm91bmRhdGlvbi5Nb3ZlKHRoaXMub3B0aW9ucy5zbGlkZVNwZWVkLCAkdGFyZ2V0LCBmdW5jdGlvbigpe1xyXG4gICAgICAkdGFyZ2V0LnNsaWRlVXAoX3RoaXMub3B0aW9ucy5zbGlkZVNwZWVkLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgdGFiIGlzIGRvbmUgY29sbGFwc2luZyB1cC5cclxuICAgICAgICAgKiBAZXZlbnQgQWNjb3JkaW9uI3VwXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgX3RoaXMuJGVsZW1lbnQudHJpZ2dlcigndXAuemYuYWNjb3JkaW9uJywgWyR0YXJnZXRdKTtcclxuICAgICAgfSk7XHJcbiAgICAvLyB9KTtcclxuXHJcbiAgICAkdGFyZ2V0LmF0dHIoJ2FyaWEtaGlkZGVuJywgdHJ1ZSlcclxuICAgICAgICAgICAucGFyZW50KCkucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpO1xyXG5cclxuICAgICQoJyMnICsgJHRhcmdldC5hdHRyKCdhcmlhLWxhYmVsbGVkYnknKSkuYXR0cih7XHJcbiAgICAgJ2FyaWEtZXhwYW5kZWQnOiBmYWxzZSxcclxuICAgICAnYXJpYS1zZWxlY3RlZCc6IGZhbHNlXHJcbiAgIH0pO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIERlc3Ryb3lzIGFuIGluc3RhbmNlIG9mIGFuIGFjY29yZGlvbi5cclxuICAgKiBAZmlyZXMgQWNjb3JkaW9uI2Rlc3Ryb3llZFxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqL1xyXG4gIEFjY29yZGlvbi5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS10YWItY29udGVudF0nKS5zbGlkZVVwKDApLmNzcygnZGlzcGxheScsICcnKTtcclxuICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnYScpLm9mZignLnpmLmFjY29yZGlvbicpO1xyXG5cclxuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcclxuICB9O1xyXG5cclxuICBGb3VuZGF0aW9uLnBsdWdpbihBY2NvcmRpb24sICdBY2NvcmRpb24nKTtcclxufShqUXVlcnksIHdpbmRvdy5Gb3VuZGF0aW9uKTtcclxuIiwiLyoqXHJcbiAqIEFjY29yZGlvbk1lbnUgbW9kdWxlLlxyXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24uYWNjb3JkaW9uTWVudVxyXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmtleWJvYXJkXHJcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubW90aW9uXHJcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubmVzdFxyXG4gKi9cclxuIWZ1bmN0aW9uKCQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYW4gYWNjb3JkaW9uIG1lbnUuXHJcbiAgICogQGNsYXNzXHJcbiAgICogQGZpcmVzIEFjY29yZGlvbk1lbnUjaW5pdFxyXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gYW4gYWNjb3JkaW9uIG1lbnUuXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIEFjY29yZGlvbk1lbnUoZWxlbWVudCwgb3B0aW9ucykge1xyXG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgQWNjb3JkaW9uTWVudS5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xyXG5cclxuICAgIEZvdW5kYXRpb24uTmVzdC5GZWF0aGVyKHRoaXMuJGVsZW1lbnQsICdhY2NvcmRpb24nKTtcclxuXHJcbiAgICB0aGlzLl9pbml0KCk7XHJcblxyXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnQWNjb3JkaW9uTWVudScpO1xyXG4gICAgRm91bmRhdGlvbi5LZXlib2FyZC5yZWdpc3RlcignQWNjb3JkaW9uTWVudScsIHtcclxuICAgICAgJ0VOVEVSJzogJ3RvZ2dsZScsXHJcbiAgICAgICdTUEFDRSc6ICd0b2dnbGUnLFxyXG4gICAgICAnQVJST1dfUklHSFQnOiAnb3BlbicsXHJcbiAgICAgICdBUlJPV19VUCc6ICd1cCcsXHJcbiAgICAgICdBUlJPV19ET1dOJzogJ2Rvd24nLFxyXG4gICAgICAnQVJST1dfTEVGVCc6ICdjbG9zZScsXHJcbiAgICAgICdFU0NBUEUnOiAnY2xvc2VBbGwnLFxyXG4gICAgICAnVEFCJzogJ2Rvd24nLFxyXG4gICAgICAnU0hJRlRfVEFCJzogJ3VwJ1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBBY2NvcmRpb25NZW51LmRlZmF1bHRzID0ge1xyXG4gICAgLyoqXHJcbiAgICAgKiBBbW91bnQgb2YgdGltZSB0byBhbmltYXRlIHRoZSBvcGVuaW5nIG9mIGEgc3VibWVudSBpbiBtcy5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlIDI1MFxyXG4gICAgICovXHJcbiAgICBzbGlkZVNwZWVkOiAyNTAsXHJcbiAgICAvKipcclxuICAgICAqIEFsbG93IHRoZSBtZW51IHRvIGhhdmUgbXVsdGlwbGUgb3BlbiBwYW5lcy5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlIHRydWVcclxuICAgICAqL1xyXG4gICAgbXVsdGlPcGVuOiB0cnVlXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogSW5pdGlhbGl6ZXMgdGhlIGFjY29yZGlvbiBtZW51IGJ5IGhpZGluZyBhbGwgbmVzdGVkIG1lbnVzLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgQWNjb3JkaW9uTWVudS5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtc3VibWVudV0nKS5ub3QoJy5pcy1hY3RpdmUnKS5zbGlkZVVwKDApOy8vLmZpbmQoJ2EnKS5jc3MoJ3BhZGRpbmctbGVmdCcsICcxcmVtJyk7XHJcbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoe1xyXG4gICAgICAncm9sZSc6ICd0YWJsaXN0JyxcclxuICAgICAgJ2FyaWEtbXVsdGlzZWxlY3RhYmxlJzogdGhpcy5vcHRpb25zLm11bHRpT3BlblxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4kbWVudUxpbmtzID0gdGhpcy4kZWxlbWVudC5maW5kKCcuaXMtYWNjb3JkaW9uLXN1Ym1lbnUtcGFyZW50Jyk7XHJcbiAgICB0aGlzLiRtZW51TGlua3MuZWFjaChmdW5jdGlvbigpe1xyXG4gICAgICB2YXIgbGlua0lkID0gdGhpcy5pZCB8fCBGb3VuZGF0aW9uLkdldFlvRGlnaXRzKDYsICdhY2MtbWVudS1saW5rJyksXHJcbiAgICAgICAgICAkZWxlbSA9ICQodGhpcyksXHJcbiAgICAgICAgICAkc3ViID0gJGVsZW0uY2hpbGRyZW4oJ1tkYXRhLXN1Ym1lbnVdJyksXHJcbiAgICAgICAgICBzdWJJZCA9ICRzdWJbMF0uaWQgfHwgRm91bmRhdGlvbi5HZXRZb0RpZ2l0cyg2LCAnYWNjLW1lbnUnKSxcclxuICAgICAgICAgIGlzQWN0aXZlID0gJHN1Yi5oYXNDbGFzcygnaXMtYWN0aXZlJyk7XHJcbiAgICAgICRlbGVtLmF0dHIoe1xyXG4gICAgICAgICdhcmlhLWNvbnRyb2xzJzogc3ViSWQsXHJcbiAgICAgICAgJ2FyaWEtZXhwYW5kZWQnOiBpc0FjdGl2ZSxcclxuICAgICAgICAncm9sZSc6ICd0YWInLFxyXG4gICAgICAgICdpZCc6IGxpbmtJZFxyXG4gICAgICB9KTtcclxuICAgICAgJHN1Yi5hdHRyKHtcclxuICAgICAgICAnYXJpYS1sYWJlbGxlZGJ5JzogbGlua0lkLFxyXG4gICAgICAgICdhcmlhLWhpZGRlbic6ICFpc0FjdGl2ZSxcclxuICAgICAgICAncm9sZSc6ICd0YWJwYW5lbCcsXHJcbiAgICAgICAgJ2lkJzogc3ViSWRcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICAgIHZhciBpbml0UGFuZXMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5pcy1hY3RpdmUnKTtcclxuICAgIGlmKGluaXRQYW5lcy5sZW5ndGgpe1xyXG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICBpbml0UGFuZXMuZWFjaChmdW5jdGlvbigpe1xyXG4gICAgICAgIF90aGlzLmRvd24oJCh0aGlzKSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fZXZlbnRzKCk7XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBldmVudCBoYW5kbGVycyBmb3IgaXRlbXMgd2l0aGluIHRoZSBtZW51LlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgQWNjb3JkaW9uTWVudS5wcm90b3R5cGUuX2V2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuXHJcbiAgICB0aGlzLiRlbGVtZW50LmZpbmQoJ2xpJykuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgdmFyICRzdWJtZW51ID0gJCh0aGlzKS5jaGlsZHJlbignW2RhdGEtc3VibWVudV0nKTtcclxuXHJcbiAgICAgIGlmICgkc3VibWVudS5sZW5ndGgpIHtcclxuICAgICAgICAkKHRoaXMpLmNoaWxkcmVuKCdhJykub2ZmKCdjbGljay56Zi5hY2NvcmRpb25NZW51Jykub24oJ2NsaWNrLnpmLmFjY29yZGlvbk1lbnUnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgICAgX3RoaXMudG9nZ2xlKCRzdWJtZW51KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSkub24oJ2tleWRvd24uemYuYWNjb3JkaW9ubWVudScsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICB2YXIgJGVsZW1lbnQgPSAkKHRoaXMpLFxyXG4gICAgICAgICAgJGVsZW1lbnRzID0gJGVsZW1lbnQucGFyZW50KCd1bCcpLmNoaWxkcmVuKCdsaScpLFxyXG4gICAgICAgICAgJHByZXZFbGVtZW50LFxyXG4gICAgICAgICAgJG5leHRFbGVtZW50LFxyXG4gICAgICAgICAgJHRhcmdldCA9ICRlbGVtZW50LmNoaWxkcmVuKCdbZGF0YS1zdWJtZW51XScpO1xyXG5cclxuICAgICAgJGVsZW1lbnRzLmVhY2goZnVuY3Rpb24oaSkge1xyXG4gICAgICAgIGlmICgkKHRoaXMpLmlzKCRlbGVtZW50KSkge1xyXG4gICAgICAgICAgJHByZXZFbGVtZW50ID0gJGVsZW1lbnRzLmVxKE1hdGgubWF4KDAsIGktMSkpO1xyXG4gICAgICAgICAgJG5leHRFbGVtZW50ID0gJGVsZW1lbnRzLmVxKE1hdGgubWluKGkrMSwgJGVsZW1lbnRzLmxlbmd0aC0xKSk7XHJcblxyXG4gICAgICAgICAgaWYgKCQodGhpcykuY2hpbGRyZW4oJ1tkYXRhLXN1Ym1lbnVdOnZpc2libGUnKS5sZW5ndGgpIHsgLy8gaGFzIG9wZW4gc3ViIG1lbnVcclxuICAgICAgICAgICAgJG5leHRFbGVtZW50ID0gJGVsZW1lbnQuZmluZCgnbGk6Zmlyc3QtY2hpbGQnKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmICgkKHRoaXMpLmlzKCc6Zmlyc3QtY2hpbGQnKSkgeyAvLyBpcyBmaXJzdCBlbGVtZW50IG9mIHN1YiBtZW51XHJcbiAgICAgICAgICAgICRwcmV2RWxlbWVudCA9ICRlbGVtZW50LnBhcmVudHMoJ2xpJykuZmlyc3QoKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoJHByZXZFbGVtZW50LmNoaWxkcmVuKCdbZGF0YS1zdWJtZW51XTp2aXNpYmxlJykubGVuZ3RoKSB7IC8vIGlmIHByZXZpb3VzIGVsZW1lbnQgaGFzIG9wZW4gc3ViIG1lbnVcclxuICAgICAgICAgICAgJHByZXZFbGVtZW50ID0gJHByZXZFbGVtZW50LmZpbmQoJ2xpOmxhc3QtY2hpbGQnKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmICgkKHRoaXMpLmlzKCc6bGFzdC1jaGlsZCcpKSB7IC8vIGlzIGxhc3QgZWxlbWVudCBvZiBzdWIgbWVudVxyXG4gICAgICAgICAgICAkbmV4dEVsZW1lbnQgPSAkZWxlbWVudC5wYXJlbnRzKCdsaScpLmZpcnN0KCkubmV4dCgnbGknKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ0FjY29yZGlvbk1lbnUnLCB7XHJcbiAgICAgICAgb3BlbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBpZiAoJHRhcmdldC5pcygnOmhpZGRlbicpKSB7XHJcbiAgICAgICAgICAgIF90aGlzLmRvd24oJHRhcmdldCk7XHJcbiAgICAgICAgICAgICR0YXJnZXQuZmluZCgnbGknKS5maXJzdCgpLmZvY3VzKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjbG9zZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBpZiAoJHRhcmdldC5sZW5ndGggJiYgISR0YXJnZXQuaXMoJzpoaWRkZW4nKSkgeyAvLyBjbG9zZSBhY3RpdmUgc3ViIG9mIHRoaXMgaXRlbVxyXG4gICAgICAgICAgICBfdGhpcy51cCgkdGFyZ2V0KTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoJGVsZW1lbnQucGFyZW50KCdbZGF0YS1zdWJtZW51XScpLmxlbmd0aCkgeyAvLyBjbG9zZSBjdXJyZW50bHkgb3BlbiBzdWJcclxuICAgICAgICAgICAgX3RoaXMudXAoJGVsZW1lbnQucGFyZW50KCdbZGF0YS1zdWJtZW51XScpKTtcclxuICAgICAgICAgICAgJGVsZW1lbnQucGFyZW50cygnbGknKS5maXJzdCgpLmZvY3VzKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1cDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAkcHJldkVsZW1lbnQuZm9jdXMoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRvd246IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgJG5leHRFbGVtZW50LmZvY3VzKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0b2dnbGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgaWYgKCRlbGVtZW50LmNoaWxkcmVuKCdbZGF0YS1zdWJtZW51XScpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBfdGhpcy50b2dnbGUoJGVsZW1lbnQuY2hpbGRyZW4oJ1tkYXRhLXN1Ym1lbnVdJykpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2xvc2VBbGw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgX3RoaXMuaGlkZUFsbCgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaGFuZGxlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9KTsvLy5hdHRyKCd0YWJpbmRleCcsIDApO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogQ2xvc2VzIGFsbCBwYW5lcyBvZiB0aGUgbWVudS5cclxuICAgKiBAZnVuY3Rpb25cclxuICAgKi9cclxuICBBY2NvcmRpb25NZW51LnByb3RvdHlwZS5oaWRlQWxsID0gZnVuY3Rpb24oKXtcclxuICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtc3VibWVudV0nKS5zbGlkZVVwKHRoaXMub3B0aW9ucy5zbGlkZVNwZWVkKTtcclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIFRvZ2dsZXMgdGhlIG9wZW4vY2xvc2Ugc3RhdGUgb2YgYSBzdWJtZW51LlxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0gdGhlIHN1Ym1lbnUgdG8gdG9nZ2xlXHJcbiAgICovXHJcbiAgQWNjb3JkaW9uTWVudS5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24oJHRhcmdldCl7XHJcbiAgICBpZighJHRhcmdldC5pcygnOmFuaW1hdGVkJykpIHtcclxuICAgICAgaWYgKCEkdGFyZ2V0LmlzKCc6aGlkZGVuJykpIHtcclxuICAgICAgICB0aGlzLnVwKCR0YXJnZXQpO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZG93bigkdGFyZ2V0KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogT3BlbnMgdGhlIHN1Yi1tZW51IGRlZmluZWQgYnkgYCR0YXJnZXRgLlxyXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0gU3ViLW1lbnUgdG8gb3Blbi5cclxuICAgKiBAZmlyZXMgQWNjb3JkaW9uTWVudSNkb3duXHJcbiAgICovXHJcbiAgQWNjb3JkaW9uTWVudS5wcm90b3R5cGUuZG93biA9IGZ1bmN0aW9uKCR0YXJnZXQpIHtcclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcblxyXG4gICAgaWYoIXRoaXMub3B0aW9ucy5tdWx0aU9wZW4pe1xyXG4gICAgICB0aGlzLnVwKHRoaXMuJGVsZW1lbnQuZmluZCgnLmlzLWFjdGl2ZScpLm5vdCgkdGFyZ2V0LnBhcmVudHNVbnRpbCh0aGlzLiRlbGVtZW50KS5hZGQoJHRhcmdldCkpKTtcclxuICAgIH1cclxuXHJcbiAgICAkdGFyZ2V0LmFkZENsYXNzKCdpcy1hY3RpdmUnKS5hdHRyKHsnYXJpYS1oaWRkZW4nOiBmYWxzZX0pXHJcbiAgICAgIC5wYXJlbnQoJy5pcy1hY2NvcmRpb24tc3VibWVudS1wYXJlbnQnKS5hdHRyKHsnYXJpYS1leHBhbmRlZCc6IHRydWV9KTtcclxuXHJcbiAgICAgIEZvdW5kYXRpb24uTW92ZSh0aGlzLm9wdGlvbnMuc2xpZGVTcGVlZCwgJHRhcmdldCwgZnVuY3Rpb24oKXtcclxuICAgICAgICAkdGFyZ2V0LnNsaWRlRG93bihfdGhpcy5vcHRpb25zLnNsaWRlU3BlZWQsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgbWVudSBpcyBkb25lIG9wZW5pbmcuXHJcbiAgICAgICAgICAgKiBAZXZlbnQgQWNjb3JkaW9uTWVudSNkb3duXHJcbiAgICAgICAgICAgKi9cclxuICAgICAgICAgIF90aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2Rvd24uemYuYWNjb3JkaW9uTWVudScsIFskdGFyZ2V0XSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENsb3NlcyB0aGUgc3ViLW1lbnUgZGVmaW5lZCBieSBgJHRhcmdldGAuIEFsbCBzdWItbWVudXMgaW5zaWRlIHRoZSB0YXJnZXQgd2lsbCBiZSBjbG9zZWQgYXMgd2VsbC5cclxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJHRhcmdldCAtIFN1Yi1tZW51IHRvIGNsb3NlLlxyXG4gICAqIEBmaXJlcyBBY2NvcmRpb25NZW51I3VwXHJcbiAgICovXHJcbiAgQWNjb3JkaW9uTWVudS5wcm90b3R5cGUudXAgPSBmdW5jdGlvbigkdGFyZ2V0KSB7XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgRm91bmRhdGlvbi5Nb3ZlKHRoaXMub3B0aW9ucy5zbGlkZVNwZWVkLCAkdGFyZ2V0LCBmdW5jdGlvbigpe1xyXG4gICAgICAkdGFyZ2V0LnNsaWRlVXAoX3RoaXMub3B0aW9ucy5zbGlkZVNwZWVkLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgbWVudSBpcyBkb25lIGNvbGxhcHNpbmcgdXAuXHJcbiAgICAgICAgICogQGV2ZW50IEFjY29yZGlvbk1lbnUjdXBcclxuICAgICAgICAgKi9cclxuICAgICAgICBfdGhpcy4kZWxlbWVudC50cmlnZ2VyKCd1cC56Zi5hY2NvcmRpb25NZW51JywgWyR0YXJnZXRdKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgJG1lbnVzID0gJHRhcmdldC5maW5kKCdbZGF0YS1zdWJtZW51XScpLnNsaWRlVXAoMCkuYWRkQmFjaygpLmF0dHIoJ2FyaWEtaGlkZGVuJywgdHJ1ZSk7XHJcblxyXG4gICAgJG1lbnVzLnBhcmVudCgnLmlzLWFjY29yZGlvbi1zdWJtZW51LXBhcmVudCcpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBmYWxzZSk7XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogRGVzdHJveXMgYW4gaW5zdGFuY2Ugb2YgYWNjb3JkaW9uIG1lbnUuXHJcbiAgICogQGZpcmVzIEFjY29yZGlvbk1lbnUjZGVzdHJveWVkXHJcbiAgICovXHJcbiAgQWNjb3JkaW9uTWVudS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCl7XHJcbiAgICB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLXN1Ym1lbnVdJykuc2xpZGVEb3duKDApLmNzcygnZGlzcGxheScsICcnKTtcclxuICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnYScpLm9mZignY2xpY2suemYuYWNjb3JkaW9uTWVudScpO1xyXG5cclxuICAgIEZvdW5kYXRpb24uTmVzdC5CdXJuKHRoaXMuJGVsZW1lbnQsICdhY2NvcmRpb24nKTtcclxuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcclxuICB9O1xyXG5cclxuICBGb3VuZGF0aW9uLnBsdWdpbihBY2NvcmRpb25NZW51LCAnQWNjb3JkaW9uTWVudScpO1xyXG59KGpRdWVyeSwgd2luZG93LkZvdW5kYXRpb24pO1xyXG4iLCIvKipcclxuICogRHJpbGxkb3duIG1vZHVsZS5cclxuICogQG1vZHVsZSBmb3VuZGF0aW9uLmRyaWxsZG93blxyXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmtleWJvYXJkXHJcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubW90aW9uXHJcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubmVzdFxyXG4gKi9cclxuIWZ1bmN0aW9uKCQsIEZvdW5kYXRpb24pe1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBhIGRyaWxsZG93biBtZW51LlxyXG4gICAqIEBjbGFzc1xyXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gYW4gYWNjb3JkaW9uIG1lbnUuXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIERyaWxsZG93bihlbGVtZW50LCBvcHRpb25zKXtcclxuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIERyaWxsZG93bi5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xyXG5cclxuICAgIEZvdW5kYXRpb24uTmVzdC5GZWF0aGVyKHRoaXMuJGVsZW1lbnQsICdkcmlsbGRvd24nKTtcclxuXHJcbiAgICB0aGlzLl9pbml0KCk7XHJcblxyXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnRHJpbGxkb3duJyk7XHJcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdEcmlsbGRvd24nLCB7XHJcbiAgICAgICdFTlRFUic6ICdvcGVuJyxcclxuICAgICAgJ1NQQUNFJzogJ29wZW4nLFxyXG4gICAgICAnQVJST1dfUklHSFQnOiAnbmV4dCcsXHJcbiAgICAgICdBUlJPV19VUCc6ICd1cCcsXHJcbiAgICAgICdBUlJPV19ET1dOJzogJ2Rvd24nLFxyXG4gICAgICAnQVJST1dfTEVGVCc6ICdwcmV2aW91cycsXHJcbiAgICAgICdFU0NBUEUnOiAnY2xvc2UnLFxyXG4gICAgICAnVEFCJzogJ2Rvd24nLFxyXG4gICAgICAnU0hJRlRfVEFCJzogJ3VwJ1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIERyaWxsZG93bi5kZWZhdWx0cyA9IHtcclxuICAgIC8qKlxyXG4gICAgICogTWFya3VwIHVzZWQgZm9yIEpTIGdlbmVyYXRlZCBiYWNrIGJ1dHRvbi4gUHJlcGVuZGVkIHRvIHN1Ym1lbnUgbGlzdHMgYW5kIGRlbGV0ZWQgb24gYGRlc3Ryb3lgIG1ldGhvZCwgJ2pzLWRyaWxsZG93bi1iYWNrJyBjbGFzcyByZXF1aXJlZC4gUmVtb3ZlIHRoZSBiYWNrc2xhc2ggKGBcXGApIGlmIGNvcHkgYW5kIHBhc3RpbmcuXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKiBAZXhhbXBsZSAnPFxcbGk+PFxcYT5CYWNrPFxcL2E+PFxcL2xpPidcclxuICAgICAqL1xyXG4gICAgYmFja0J1dHRvbjogJzxsaSBjbGFzcz1cImpzLWRyaWxsZG93bi1iYWNrXCI+PGE+QmFjazwvYT48L2xpPicsXHJcbiAgICAvKipcclxuICAgICAqIE1hcmt1cCB1c2VkIHRvIHdyYXAgZHJpbGxkb3duIG1lbnUuIFVzZSBhIGNsYXNzIG5hbWUgZm9yIGluZGVwZW5kZW50IHN0eWxpbmc7IHRoZSBKUyBhcHBsaWVkIGNsYXNzOiBgaXMtZHJpbGxkb3duYCBpcyByZXF1aXJlZC4gUmVtb3ZlIHRoZSBiYWNrc2xhc2ggKGBcXGApIGlmIGNvcHkgYW5kIHBhc3RpbmcuXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKiBAZXhhbXBsZSAnPFxcZGl2IGNsYXNzPVwiaXMtZHJpbGxkb3duXCI+PFxcL2Rpdj4nXHJcbiAgICAgKi9cclxuICAgIHdyYXBwZXI6ICc8ZGl2PjwvZGl2PicsXHJcbiAgICAvKipcclxuICAgICAqIEFsbG93IHRoZSBtZW51IHRvIHJldHVybiB0byByb290IGxpc3Qgb24gYm9keSBjbGljay5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlIGZhbHNlXHJcbiAgICAgKi9cclxuICAgIGNsb3NlT25DbGljazogZmFsc2VcclxuICAgIC8vIGhvbGRPcGVuOiBmYWxzZVxyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogSW5pdGlhbGl6ZXMgdGhlIGRyaWxsZG93biBieSBjcmVhdGluZyBqUXVlcnkgY29sbGVjdGlvbnMgb2YgZWxlbWVudHNcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIERyaWxsZG93bi5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbigpe1xyXG4gICAgdGhpcy4kc3VibWVudUFuY2hvcnMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ2xpLmlzLWRyaWxsZG93bi1zdWJtZW51LXBhcmVudCcpO1xyXG4gICAgdGhpcy4kc3VibWVudXMgPSB0aGlzLiRzdWJtZW51QW5jaG9ycy5jaGlsZHJlbignW2RhdGEtc3VibWVudV0nKTtcclxuICAgIHRoaXMuJG1lbnVJdGVtcyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnbGknKS5ub3QoJy5qcy1kcmlsbGRvd24tYmFjaycpLmF0dHIoJ3JvbGUnLCAnbWVudWl0ZW0nKTtcclxuXHJcbiAgICB0aGlzLl9wcmVwYXJlTWVudSgpO1xyXG5cclxuICAgIHRoaXMuX2tleWJvYXJkRXZlbnRzKCk7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiBwcmVwYXJlcyBkcmlsbGRvd24gbWVudSBieSBzZXR0aW5nIGF0dHJpYnV0ZXMgdG8gbGlua3MgYW5kIGVsZW1lbnRzXHJcbiAgICogc2V0cyBhIG1pbiBoZWlnaHQgdG8gcHJldmVudCBjb250ZW50IGp1bXBpbmdcclxuICAgKiB3cmFwcyB0aGUgZWxlbWVudCBpZiBub3QgYWxyZWFkeSB3cmFwcGVkXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAZnVuY3Rpb25cclxuICAgKi9cclxuICBEcmlsbGRvd24ucHJvdG90eXBlLl9wcmVwYXJlTWVudSA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgLy8gaWYoIXRoaXMub3B0aW9ucy5ob2xkT3Blbil7XHJcbiAgICAvLyAgIHRoaXMuX21lbnVMaW5rRXZlbnRzKCk7XHJcbiAgICAvLyB9XHJcbiAgICB0aGlzLiRzdWJtZW51QW5jaG9ycy5lYWNoKGZ1bmN0aW9uKCl7XHJcbiAgICAgIHZhciAkc3ViID0gJCh0aGlzKTtcclxuICAgICAgdmFyICRsaW5rID0gJHN1Yi5maW5kKCdhOmZpcnN0Jyk7XHJcbiAgICAgICRsaW5rLmRhdGEoJ3NhdmVkSHJlZicsICRsaW5rLmF0dHIoJ2hyZWYnKSkucmVtb3ZlQXR0cignaHJlZicpO1xyXG4gICAgICAkc3ViLmNoaWxkcmVuKCdbZGF0YS1zdWJtZW51XScpXHJcbiAgICAgICAgICAuYXR0cih7XHJcbiAgICAgICAgICAgICdhcmlhLWhpZGRlbic6IHRydWUsXHJcbiAgICAgICAgICAgICd0YWJpbmRleCc6IDAsXHJcbiAgICAgICAgICAgICdyb2xlJzogJ21lbnUnXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgX3RoaXMuX2V2ZW50cygkc3ViKTtcclxuICAgIH0pO1xyXG4gICAgdGhpcy4kc3VibWVudXMuZWFjaChmdW5jdGlvbigpe1xyXG4gICAgICB2YXIgJG1lbnUgPSAkKHRoaXMpLFxyXG4gICAgICAgICAgJGJhY2sgPSAkbWVudS5maW5kKCcuanMtZHJpbGxkb3duLWJhY2snKTtcclxuICAgICAgaWYoISRiYWNrLmxlbmd0aCl7XHJcbiAgICAgICAgJG1lbnUucHJlcGVuZChfdGhpcy5vcHRpb25zLmJhY2tCdXR0b24pO1xyXG4gICAgICB9XHJcbiAgICAgIF90aGlzLl9iYWNrKCRtZW51KTtcclxuICAgIH0pO1xyXG4gICAgaWYoIXRoaXMuJGVsZW1lbnQucGFyZW50KCkuaGFzQ2xhc3MoJ2lzLWRyaWxsZG93bicpKXtcclxuICAgICAgdGhpcy4kd3JhcHBlciA9ICQodGhpcy5vcHRpb25zLndyYXBwZXIpLmFkZENsYXNzKCdpcy1kcmlsbGRvd24nKS5jc3ModGhpcy5fZ2V0TWF4RGltcygpKTtcclxuICAgICAgdGhpcy4kZWxlbWVudC53cmFwKHRoaXMuJHdyYXBwZXIpO1xyXG4gICAgfVxyXG5cclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIEFkZHMgZXZlbnQgaGFuZGxlcnMgdG8gZWxlbWVudHMgaW4gdGhlIG1lbnUuXHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJGVsZW0gLSB0aGUgY3VycmVudCBtZW51IGl0ZW0gdG8gYWRkIGhhbmRsZXJzIHRvLlxyXG4gICAqL1xyXG4gIERyaWxsZG93bi5wcm90b3R5cGUuX2V2ZW50cyA9IGZ1bmN0aW9uKCRlbGVtKXtcclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcblxyXG4gICAgJGVsZW0ub2ZmKCdjbGljay56Zi5kcmlsbGRvd24nKVxyXG4gICAgLm9uKCdjbGljay56Zi5kcmlsbGRvd24nLCBmdW5jdGlvbihlKXtcclxuICAgICAgaWYoJChlLnRhcmdldCkucGFyZW50c1VudGlsKCd1bCcsICdsaScpLmhhc0NsYXNzKCdpcy1kcmlsbGRvd24tc3VibWVudS1wYXJlbnQnKSl7XHJcbiAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGlmKGUudGFyZ2V0ICE9PSBlLmN1cnJlbnRUYXJnZXQuZmlyc3RFbGVtZW50Q2hpbGQpe1xyXG4gICAgICAvLyAgIHJldHVybiBmYWxzZTtcclxuICAgICAgLy8gfVxyXG4gICAgICBfdGhpcy5fc2hvdygkZWxlbSk7XHJcblxyXG4gICAgICBpZihfdGhpcy5vcHRpb25zLmNsb3NlT25DbGljayl7XHJcbiAgICAgICAgdmFyICRib2R5ID0gJCgnYm9keScpLm5vdChfdGhpcy4kd3JhcHBlcik7XHJcbiAgICAgICAgJGJvZHkub2ZmKCcuemYuZHJpbGxkb3duJykub24oJ2NsaWNrLnpmLmRyaWxsZG93bicsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgX3RoaXMuX2hpZGVBbGwoKTtcclxuICAgICAgICAgICRib2R5Lm9mZignLnpmLmRyaWxsZG93bicpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIEFkZHMga2V5ZG93biBldmVudCBsaXN0ZW5lciB0byBgbGlgJ3MgaW4gdGhlIG1lbnUuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBEcmlsbGRvd24ucHJvdG90eXBlLl9rZXlib2FyZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgIHRoaXMuJG1lbnVJdGVtcy5hZGQodGhpcy4kZWxlbWVudC5maW5kKCcuanMtZHJpbGxkb3duLWJhY2snKSkub24oJ2tleWRvd24uemYuZHJpbGxkb3duJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgIHZhciAkZWxlbWVudCA9ICQodGhpcyksXHJcbiAgICAgICAgICAkZWxlbWVudHMgPSAkZWxlbWVudC5wYXJlbnQoJ3VsJykuY2hpbGRyZW4oJ2xpJyksXHJcbiAgICAgICAgICAkcHJldkVsZW1lbnQsXHJcbiAgICAgICAgICAkbmV4dEVsZW1lbnQ7XHJcblxyXG4gICAgICAkZWxlbWVudHMuZWFjaChmdW5jdGlvbihpKSB7XHJcbiAgICAgICAgaWYgKCQodGhpcykuaXMoJGVsZW1lbnQpKSB7XHJcbiAgICAgICAgICAkcHJldkVsZW1lbnQgPSAkZWxlbWVudHMuZXEoTWF0aC5tYXgoMCwgaS0xKSk7XHJcbiAgICAgICAgICAkbmV4dEVsZW1lbnQgPSAkZWxlbWVudHMuZXEoTWF0aC5taW4oaSsxLCAkZWxlbWVudHMubGVuZ3RoLTEpKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICBGb3VuZGF0aW9uLktleWJvYXJkLmhhbmRsZUtleShlLCAnRHJpbGxkb3duJywge1xyXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgaWYgKCRlbGVtZW50LmlzKF90aGlzLiRzdWJtZW51QW5jaG9ycykpIHtcclxuICAgICAgICAgICAgX3RoaXMuX3Nob3coJGVsZW1lbnQpO1xyXG4gICAgICAgICAgICAkZWxlbWVudC5vbihGb3VuZGF0aW9uLnRyYW5zaXRpb25lbmQoJGVsZW1lbnQpLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICRlbGVtZW50LmZpbmQoJ3VsIGxpJykuZmlsdGVyKF90aGlzLiRtZW51SXRlbXMpLmZpcnN0KCkuZm9jdXMoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwcmV2aW91czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBfdGhpcy5faGlkZSgkZWxlbWVudC5wYXJlbnQoJ3VsJykpO1xyXG4gICAgICAgICAgJGVsZW1lbnQucGFyZW50KCd1bCcpLm9uKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZCgkZWxlbWVudCksIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgJGVsZW1lbnQucGFyZW50KCd1bCcpLnBhcmVudCgnbGknKS5mb2N1cygpO1xyXG4gICAgICAgICAgICB9LCAxKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdXA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgJHByZXZFbGVtZW50LmZvY3VzKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkb3duOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICRuZXh0RWxlbWVudC5mb2N1cygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2xvc2U6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgX3RoaXMuX2JhY2soKTtcclxuICAgICAgICAgIC8vX3RoaXMuJG1lbnVJdGVtcy5maXJzdCgpLmZvY3VzKCk7IC8vIGZvY3VzIHRvIGZpcnN0IGVsZW1lbnRcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9wZW46IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgaWYgKCEkZWxlbWVudC5pcyhfdGhpcy4kbWVudUl0ZW1zKSkgeyAvLyBub3QgbWVudSBpdGVtIG1lYW5zIGJhY2sgYnV0dG9uXHJcbiAgICAgICAgICAgIF90aGlzLl9oaWRlKCRlbGVtZW50LnBhcmVudCgndWwnKSk7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXskZWxlbWVudC5wYXJlbnQoJ3VsJykucGFyZW50KCdsaScpLmZvY3VzKCk7fSwgMSk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKCRlbGVtZW50LmlzKF90aGlzLiRzdWJtZW51QW5jaG9ycykpIHtcclxuICAgICAgICAgICAgX3RoaXMuX3Nob3coJGVsZW1lbnQpO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7JGVsZW1lbnQuZmluZCgndWwgbGknKS5maWx0ZXIoX3RoaXMuJG1lbnVJdGVtcykuZmlyc3QoKS5mb2N1cygpO30sIDEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaGFuZGxlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9KTsgLy8gZW5kIGtleWJvYXJkQWNjZXNzXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2xvc2VzIGFsbCBvcGVuIGVsZW1lbnRzLCBhbmQgcmV0dXJucyB0byByb290IG1lbnUuXHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICogQGZpcmVzIERyaWxsZG93biNjbG9zZWRcclxuICAgKi9cclxuICBEcmlsbGRvd24ucHJvdG90eXBlLl9oaWRlQWxsID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciAkZWxlbSA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLmlzLWRyaWxsZG93bi1zdWJtZW51LmlzLWFjdGl2ZScpLmFkZENsYXNzKCdpcy1jbG9zaW5nJyk7XHJcbiAgICAkZWxlbS5vbmUoRm91bmRhdGlvbi50cmFuc2l0aW9uZW5kKCRlbGVtKSwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICRlbGVtLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUgaXMtY2xvc2luZycpO1xyXG4gICAgfSk7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgbWVudSBpcyBmdWxseSBjbG9zZWQuXHJcbiAgICAgICAgICogQGV2ZW50IERyaWxsZG93biNjbG9zZWRcclxuICAgICAgICAgKi9cclxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignY2xvc2VkLnpmLmRyaWxsZG93bicpO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogQWRkcyBldmVudCBsaXN0ZW5lciBmb3IgZWFjaCBgYmFja2AgYnV0dG9uLCBhbmQgY2xvc2VzIG9wZW4gbWVudXMuXHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICogQGZpcmVzIERyaWxsZG93biNiYWNrXHJcbiAgICogQHBhcmFtIHtqUXVlcnl9ICRlbGVtIC0gdGhlIGN1cnJlbnQgc3ViLW1lbnUgdG8gYWRkIGBiYWNrYCBldmVudC5cclxuICAgKi9cclxuICBEcmlsbGRvd24ucHJvdG90eXBlLl9iYWNrID0gZnVuY3Rpb24oJGVsZW0pe1xyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICRlbGVtLm9mZignY2xpY2suemYuZHJpbGxkb3duJyk7XHJcbiAgICAkZWxlbS5jaGlsZHJlbignLmpzLWRyaWxsZG93bi1iYWNrJylcclxuICAgICAgLm9uKCdjbGljay56Zi5kcmlsbGRvd24nLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdtb3VzZXVwIG9uIGJhY2snKTtcclxuICAgICAgICBfdGhpcy5faGlkZSgkZWxlbSk7XHJcbiAgICAgIH0pO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogQWRkcyBldmVudCBsaXN0ZW5lciB0byBtZW51IGl0ZW1zIHcvbyBzdWJtZW51cyB0byBjbG9zZSBvcGVuIG1lbnVzIG9uIGNsaWNrLlxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgRHJpbGxkb3duLnByb3RvdHlwZS5fbWVudUxpbmtFdmVudHMgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgIHRoaXMuJG1lbnVJdGVtcy5ub3QoJy5pcy1kcmlsbGRvd24tc3VibWVudS1wYXJlbnQnKVxyXG4gICAgICAgIC5vZmYoJ2NsaWNrLnpmLmRyaWxsZG93bicpXHJcbiAgICAgICAgLm9uKCdjbGljay56Zi5kcmlsbGRvd24nLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAgIC8vIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIF90aGlzLl9oaWRlQWxsKCk7XHJcbiAgICAgICAgICB9LCAwKTtcclxuICAgICAgfSk7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiBPcGVucyBhIHN1Ym1lbnUuXHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICogQGZpcmVzIERyaWxsZG93biNvcGVuXHJcbiAgICogQHBhcmFtIHtqUXVlcnl9ICRlbGVtIC0gdGhlIGN1cnJlbnQgZWxlbWVudCB3aXRoIGEgc3VibWVudSB0byBvcGVuLlxyXG4gICAqL1xyXG4gIERyaWxsZG93bi5wcm90b3R5cGUuX3Nob3cgPSBmdW5jdGlvbigkZWxlbSl7XHJcbiAgICAkZWxlbS5jaGlsZHJlbignW2RhdGEtc3VibWVudV0nKS5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XHJcblxyXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdvcGVuLnpmLmRyaWxsZG93bicsIFskZWxlbV0pO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogSGlkZXMgYSBzdWJtZW51XHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICogQGZpcmVzIERyaWxsZG93biNoaWRlXHJcbiAgICogQHBhcmFtIHtqUXVlcnl9ICRlbGVtIC0gdGhlIGN1cnJlbnQgc3ViLW1lbnUgdG8gaGlkZS5cclxuICAgKi9cclxuICBEcmlsbGRvd24ucHJvdG90eXBlLl9oaWRlID0gZnVuY3Rpb24oJGVsZW0pe1xyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICRlbGVtLmFkZENsYXNzKCdpcy1jbG9zaW5nJylcclxuICAgICAgICAgLm9uZShGb3VuZGF0aW9uLnRyYW5zaXRpb25lbmQoJGVsZW0pLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICRlbGVtLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUgaXMtY2xvc2luZycpO1xyXG4gICAgICAgICB9KTtcclxuICAgIC8qKlxyXG4gICAgICogRmlyZXMgd2hlbiB0aGUgc3VibWVudSBpcyBoYXMgY2xvc2VkLlxyXG4gICAgICogQGV2ZW50IERyaWxsZG93biNoaWRlXHJcbiAgICAgKi9cclxuICAgICRlbGVtLnRyaWdnZXIoJ2hpZGUuemYuZHJpbGxkb3duJywgWyRlbGVtXSk7XHJcblxyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogSXRlcmF0ZXMgdGhyb3VnaCB0aGUgbmVzdGVkIG1lbnVzIHRvIGNhbGN1bGF0ZSB0aGUgbWluLWhlaWdodCwgYW5kIG1heC13aWR0aCBmb3IgdGhlIG1lbnUuXHJcbiAgICogUHJldmVudHMgY29udGVudCBqdW1waW5nLlxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgRHJpbGxkb3duLnByb3RvdHlwZS5fZ2V0TWF4RGltcyA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgbWF4ID0gMCwgcmVzdWx0ID0ge307XHJcbiAgICB0aGlzLiRzdWJtZW51cy5hZGQodGhpcy4kZWxlbWVudCkuZWFjaChmdW5jdGlvbigpe1xyXG4gICAgICB2YXIgbnVtT2ZFbGVtcyA9ICQodGhpcykuY2hpbGRyZW4oJ2xpJykubGVuZ3RoO1xyXG4gICAgICBtYXggPSBudW1PZkVsZW1zID4gbWF4ID8gbnVtT2ZFbGVtcyA6IG1heDtcclxuICAgIH0pO1xyXG5cclxuICAgIHJlc3VsdC5oZWlnaHQgPSBtYXggKiB0aGlzLiRtZW51SXRlbXNbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0ICsgJ3B4JztcclxuICAgIHJlc3VsdC53aWR0aCA9IHRoaXMuJGVsZW1lbnRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGggKyAncHgnO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiBEZXN0cm95cyB0aGUgRHJpbGxkb3duIE1lbnVcclxuICAgKiBAZnVuY3Rpb25cclxuICAgKi9cclxuICBEcmlsbGRvd24ucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpe1xyXG4gICAgdGhpcy5faGlkZUFsbCgpO1xyXG4gICAgRm91bmRhdGlvbi5OZXN0LkJ1cm4odGhpcy4kZWxlbWVudCwgJ2RyaWxsZG93bicpO1xyXG4gICAgdGhpcy4kZWxlbWVudC51bndyYXAoKVxyXG4gICAgICAgICAgICAgICAgIC5maW5kKCcuanMtZHJpbGxkb3duLWJhY2snKS5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgIC5lbmQoKS5maW5kKCcuaXMtYWN0aXZlLCAuaXMtY2xvc2luZywgLmlzLWRyaWxsZG93bi1zdWJtZW51JykucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1jbG9zaW5nIGlzLWRyaWxsZG93bi1zdWJtZW51JylcclxuICAgICAgICAgICAgICAgICAuZW5kKCkuZmluZCgnW2RhdGEtc3VibWVudV0nKS5yZW1vdmVBdHRyKCdhcmlhLWhpZGRlbiB0YWJpbmRleCByb2xlJylcclxuICAgICAgICAgICAgICAgICAub2ZmKCcuemYuZHJpbGxkb3duJykuZW5kKCkub2ZmKCd6Zi5kcmlsbGRvd24nKTtcclxuICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnYScpLmVhY2goZnVuY3Rpb24oKXtcclxuICAgICAgdmFyICRsaW5rID0gJCh0aGlzKTtcclxuICAgICAgaWYoJGxpbmsuZGF0YSgnc2F2ZWRIcmVmJykpe1xyXG4gICAgICAgICRsaW5rLmF0dHIoJ2hyZWYnLCAkbGluay5kYXRhKCdzYXZlZEhyZWYnKSkucmVtb3ZlRGF0YSgnc2F2ZWRIcmVmJyk7XHJcbiAgICAgIH1lbHNleyByZXR1cm47IH1cclxuICAgIH0pO1xyXG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xyXG4gIH07XHJcbiAgRm91bmRhdGlvbi5wbHVnaW4oRHJpbGxkb3duLCAnRHJpbGxkb3duJyk7XHJcbn0oalF1ZXJ5LCB3aW5kb3cuRm91bmRhdGlvbik7XHJcbiIsIi8qKlxyXG4gKiBEcm9wZG93biBtb2R1bGUuXHJcbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5kcm9wZG93blxyXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmtleWJvYXJkXHJcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwuYm94XHJcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudHJpZ2dlcnNcclxuICovXHJcbiFmdW5jdGlvbigkLCBGb3VuZGF0aW9uKXtcclxuICAndXNlIHN0cmljdCc7XHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBhIGRyb3Bkb3duLlxyXG4gICAqIEBjbGFzc1xyXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gYSBkcm9wZG93bi5cclxuICAgKiAgICAgICAgT2JqZWN0IHNob3VsZCBiZSBvZiB0aGUgZHJvcGRvd24gcGFuZWwsIHJhdGhlciB0aGFuIGl0cyBhbmNob3IuXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIERyb3Bkb3duKGVsZW1lbnQsIG9wdGlvbnMpe1xyXG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgRHJvcGRvd24uZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcclxuICAgIHRoaXMuX2luaXQoKTtcclxuXHJcbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdEcm9wZG93bicpO1xyXG4gICAgRm91bmRhdGlvbi5LZXlib2FyZC5yZWdpc3RlcignRHJvcGRvd24nLCB7XHJcbiAgICAgICdFTlRFUic6ICdvcGVuJyxcclxuICAgICAgJ1NQQUNFJzogJ29wZW4nLFxyXG4gICAgICAnRVNDQVBFJzogJ2Nsb3NlJyxcclxuICAgICAgJ1RBQic6ICd0YWJfZm9yd2FyZCcsXHJcbiAgICAgICdTSElGVF9UQUInOiAndGFiX2JhY2t3YXJkJ1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBEcm9wZG93bi5kZWZhdWx0cyA9IHtcclxuICAgIC8qKlxyXG4gICAgICogQW1vdW50IG9mIHRpbWUgdG8gZGVsYXkgb3BlbmluZyBhIHN1Ym1lbnUgb24gaG92ZXIgZXZlbnQuXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKiBAZXhhbXBsZSAyNTBcclxuICAgICAqL1xyXG4gICAgaG92ZXJEZWxheTogMjUwLFxyXG4gICAgLyoqXHJcbiAgICAgKiBBbGxvdyBzdWJtZW51cyB0byBvcGVuIG9uIGhvdmVyIGV2ZW50c1xyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgZmFsc2VcclxuICAgICAqL1xyXG4gICAgaG92ZXI6IGZhbHNlLFxyXG4gICAgLyoqXHJcbiAgICAgKiBEb24ndCBjbG9zZSBkcm9wZG93biB3aGVuIGhvdmVyaW5nIG92ZXIgZHJvcGRvd24gcGFuZVxyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgdHJ1ZVxyXG4gICAgICovXHJcbiAgICBob3ZlclBhbmU6IGZhbHNlLFxyXG4gICAgLyoqXHJcbiAgICAgKiBOdW1iZXIgb2YgcGl4ZWxzIGJldHdlZW4gdGhlIGRyb3Bkb3duIHBhbmUgYW5kIHRoZSB0cmlnZ2VyaW5nIGVsZW1lbnQgb24gb3Blbi5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlIDFcclxuICAgICAqL1xyXG4gICAgdk9mZnNldDogMSxcclxuICAgIC8qKlxyXG4gICAgICogTnVtYmVyIG9mIHBpeGVscyBiZXR3ZWVuIHRoZSBkcm9wZG93biBwYW5lIGFuZCB0aGUgdHJpZ2dlcmluZyBlbGVtZW50IG9uIG9wZW4uXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKiBAZXhhbXBsZSAxXHJcbiAgICAgKi9cclxuICAgIGhPZmZzZXQ6IDEsXHJcbiAgICAvKipcclxuICAgICAqIENsYXNzIGFwcGxpZWQgdG8gYWRqdXN0IG9wZW4gcG9zaXRpb24uIEpTIHdpbGwgdGVzdCBhbmQgZmlsbCB0aGlzIGluLlxyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgJ3RvcCdcclxuICAgICAqL1xyXG4gICAgcG9zaXRpb25DbGFzczogJycsXHJcbiAgICAvKipcclxuICAgICAqIEFsbG93IHRoZSBwbHVnaW4gdG8gdHJhcCBmb2N1cyB0byB0aGUgZHJvcGRvd24gcGFuZSBpZiBvcGVuZWQgd2l0aCBrZXlib2FyZCBjb21tYW5kcy5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlIGZhbHNlXHJcbiAgICAgKi9cclxuICAgIHRyYXBGb2N1czogZmFsc2UsXHJcbiAgICAvKipcclxuICAgICAqIEFsbG93IHRoZSBwbHVnaW4gdG8gc2V0IGZvY3VzIHRvIHRoZSBmaXJzdCBmb2N1c2FibGUgZWxlbWVudCB3aXRoaW4gdGhlIHBhbmUsIHJlZ2FyZGxlc3Mgb2YgbWV0aG9kIG9mIG9wZW5pbmcuXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKiBAZXhhbXBsZSB0cnVlXHJcbiAgICAgKi9cclxuICAgIGF1dG9Gb2N1czogZmFsc2UsXHJcbiAgICAvKipcclxuICAgICAqIEFsbG93cyBhIGNsaWNrIG9uIHRoZSBib2R5IHRvIGNsb3NlIHRoZSBkcm9wZG93bi5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlIGZhbHNlXHJcbiAgICAgKi9cclxuICAgIGNsb3NlT25DbGljazogZmFsc2VcclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIEluaXRpYWxpemVzIHRoZSBwbHVnaW4gYnkgc2V0dGluZy9jaGVja2luZyBvcHRpb25zIGFuZCBhdHRyaWJ1dGVzLCBhZGRpbmcgaGVscGVyIHZhcmlhYmxlcywgYW5kIHNhdmluZyB0aGUgYW5jaG9yLlxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgRHJvcGRvd24ucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciAkaWQgPSB0aGlzLiRlbGVtZW50LmF0dHIoJ2lkJyk7XHJcblxyXG4gICAgdGhpcy4kYW5jaG9yID0gJCgnW2RhdGEtdG9nZ2xlPVwiJyArICRpZCArICdcIl0nKSB8fCAkKCdbZGF0YS1vcGVuPVwiJyArICRpZCArICdcIl0nKTtcclxuICAgIHRoaXMuJGFuY2hvci5hdHRyKHtcclxuICAgICAgJ2FyaWEtY29udHJvbHMnOiAkaWQsXHJcbiAgICAgICdkYXRhLWlzLWZvY3VzJzogZmFsc2UsXHJcbiAgICAgICdkYXRhLXlldGktYm94JzogJGlkLFxyXG4gICAgICAnYXJpYS1oYXNwb3B1cCc6IHRydWUsXHJcbiAgICAgICdhcmlhLWV4cGFuZGVkJzogZmFsc2VcclxuICAgICAgLy8gJ2RhdGEtcmVzaXplJzogJGlkXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLm9wdGlvbnMucG9zaXRpb25DbGFzcyA9IHRoaXMuZ2V0UG9zaXRpb25DbGFzcygpO1xyXG4gICAgdGhpcy5jb3VudGVyID0gNDtcclxuICAgIHRoaXMudXNlZFBvc2l0aW9ucyA9IFtdO1xyXG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKHtcclxuICAgICAgJ2FyaWEtaGlkZGVuJzogJ3RydWUnLFxyXG4gICAgICAnZGF0YS15ZXRpLWJveCc6ICRpZCxcclxuICAgICAgJ2RhdGEtcmVzaXplJzogJGlkLFxyXG4gICAgICAnYXJpYS1sYWJlbGxlZGJ5JzogdGhpcy4kYW5jaG9yWzBdLmlkIHx8IEZvdW5kYXRpb24uR2V0WW9EaWdpdHMoNiwgJ2RkLWFuY2hvcicpXHJcbiAgICB9KTtcclxuICAgIHRoaXMuX2V2ZW50cygpO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogSGVscGVyIGZ1bmN0aW9uIHRvIGRldGVybWluZSBjdXJyZW50IG9yaWVudGF0aW9uIG9mIGRyb3Bkb3duIHBhbmUuXHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICogQHJldHVybnMge1N0cmluZ30gcG9zaXRpb24gLSBzdHJpbmcgdmFsdWUgb2YgYSBwb3NpdGlvbiBjbGFzcy5cclxuICAgKi9cclxuICBEcm9wZG93bi5wcm90b3R5cGUuZ2V0UG9zaXRpb25DbGFzcyA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgcG9zaXRpb24gPSB0aGlzLiRlbGVtZW50WzBdLmNsYXNzTmFtZS5tYXRjaCgvXFxiKHRvcHxsZWZ0fHJpZ2h0KVxcYi9nKTtcclxuICAgICAgICBwb3NpdGlvbiA9IHBvc2l0aW9uID8gcG9zaXRpb25bMF0gOiAnJztcclxuICAgIHJldHVybiBwb3NpdGlvbjtcclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIEFkanVzdHMgdGhlIGRyb3Bkb3duIHBhbmVzIG9yaWVudGF0aW9uIGJ5IGFkZGluZy9yZW1vdmluZyBwb3NpdGlvbmluZyBjbGFzc2VzLlxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBvc2l0aW9uIC0gcG9zaXRpb24gY2xhc3MgdG8gcmVtb3ZlLlxyXG4gICAqL1xyXG4gIERyb3Bkb3duLnByb3RvdHlwZS5fcmVwb3NpdGlvbiA9IGZ1bmN0aW9uKHBvc2l0aW9uKXtcclxuICAgIHRoaXMudXNlZFBvc2l0aW9ucy5wdXNoKHBvc2l0aW9uID8gcG9zaXRpb24gOiAnYm90dG9tJyk7XHJcbiAgICAvL2RlZmF1bHQsIHRyeSBzd2l0Y2hpbmcgdG8gb3Bwb3NpdGUgc2lkZVxyXG4gICAgaWYoIXBvc2l0aW9uICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZigndG9wJykgPCAwKSl7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ3RvcCcpO1xyXG4gICAgfWVsc2UgaWYocG9zaXRpb24gPT09ICd0b3AnICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZignYm90dG9tJykgPCAwKSl7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MocG9zaXRpb24pO1xyXG4gICAgfWVsc2UgaWYocG9zaXRpb24gPT09ICdsZWZ0JyAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ3JpZ2h0JykgPCAwKSl7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MocG9zaXRpb24pXHJcbiAgICAgICAgICAuYWRkQ2xhc3MoJ3JpZ2h0Jyk7XHJcbiAgICB9ZWxzZSBpZihwb3NpdGlvbiA9PT0gJ3JpZ2h0JyAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ2xlZnQnKSA8IDApKXtcclxuICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyhwb3NpdGlvbilcclxuICAgICAgICAgIC5hZGRDbGFzcygnbGVmdCcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vaWYgZGVmYXVsdCBjaGFuZ2UgZGlkbid0IHdvcmssIHRyeSBib3R0b20gb3IgbGVmdCBmaXJzdFxyXG4gICAgZWxzZSBpZighcG9zaXRpb24gJiYgKHRoaXMudXNlZFBvc2l0aW9ucy5pbmRleE9mKCd0b3AnKSA+IC0xKSAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ2xlZnQnKSA8IDApKXtcclxuICAgICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnbGVmdCcpO1xyXG4gICAgfWVsc2UgaWYocG9zaXRpb24gPT09ICd0b3AnICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZignYm90dG9tJykgPiAtMSkgJiYgKHRoaXMudXNlZFBvc2l0aW9ucy5pbmRleE9mKCdsZWZ0JykgPCAwKSl7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MocG9zaXRpb24pXHJcbiAgICAgICAgICAuYWRkQ2xhc3MoJ2xlZnQnKTtcclxuICAgIH1lbHNlIGlmKHBvc2l0aW9uID09PSAnbGVmdCcgJiYgKHRoaXMudXNlZFBvc2l0aW9ucy5pbmRleE9mKCdyaWdodCcpID4gLTEpICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZignYm90dG9tJykgPCAwKSl7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MocG9zaXRpb24pO1xyXG4gICAgfWVsc2UgaWYocG9zaXRpb24gPT09ICdyaWdodCcgJiYgKHRoaXMudXNlZFBvc2l0aW9ucy5pbmRleE9mKCdsZWZ0JykgPiAtMSkgJiYgKHRoaXMudXNlZFBvc2l0aW9ucy5pbmRleE9mKCdib3R0b20nKSA8IDApKXtcclxuICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyhwb3NpdGlvbik7XHJcbiAgICB9XHJcbiAgICAvL2lmIG5vdGhpbmcgY2xlYXJlZCwgc2V0IHRvIGJvdHRvbVxyXG4gICAgZWxzZXtcclxuICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyhwb3NpdGlvbik7XHJcbiAgICB9XHJcbiAgICB0aGlzLmNsYXNzQ2hhbmdlZCA9IHRydWU7XHJcbiAgICB0aGlzLmNvdW50ZXItLTtcclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHBvc2l0aW9uIGFuZCBvcmllbnRhdGlvbiBvZiB0aGUgZHJvcGRvd24gcGFuZSwgY2hlY2tzIGZvciBjb2xsaXNpb25zLlxyXG4gICAqIFJlY3Vyc2l2ZWx5IGNhbGxzIGl0c2VsZiBpZiBhIGNvbGxpc2lvbiBpcyBkZXRlY3RlZCwgd2l0aCBhIG5ldyBwb3NpdGlvbiBjbGFzcy5cclxuICAgKiBAZnVuY3Rpb25cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIERyb3Bkb3duLnByb3RvdHlwZS5fc2V0UG9zaXRpb24gPSBmdW5jdGlvbigpe1xyXG4gICAgaWYodGhpcy4kYW5jaG9yLmF0dHIoJ2FyaWEtZXhwYW5kZWQnKSA9PT0gJ2ZhbHNlJyl7IHJldHVybiBmYWxzZTsgfVxyXG4gICAgdmFyIHBvc2l0aW9uID0gdGhpcy5nZXRQb3NpdGlvbkNsYXNzKCksXHJcbiAgICAgICAgJGVsZURpbXMgPSBGb3VuZGF0aW9uLkJveC5HZXREaW1lbnNpb25zKHRoaXMuJGVsZW1lbnQpLFxyXG4gICAgICAgICRhbmNob3JEaW1zID0gRm91bmRhdGlvbi5Cb3guR2V0RGltZW5zaW9ucyh0aGlzLiRhbmNob3IpLFxyXG4gICAgICAgIF90aGlzID0gdGhpcyxcclxuICAgICAgICBkaXJlY3Rpb24gPSAocG9zaXRpb24gPT09ICdsZWZ0JyA/ICdsZWZ0JyA6ICgocG9zaXRpb24gPT09ICdyaWdodCcpID8gJ2xlZnQnIDogJ3RvcCcpKSxcclxuICAgICAgICBwYXJhbSA9IChkaXJlY3Rpb24gPT09ICd0b3AnKSA/ICdoZWlnaHQnIDogJ3dpZHRoJyxcclxuICAgICAgICBvZmZzZXQgPSAocGFyYW0gPT09ICdoZWlnaHQnKSA/IHRoaXMub3B0aW9ucy52T2Zmc2V0IDogdGhpcy5vcHRpb25zLmhPZmZzZXQ7XHJcblxyXG4gICAgaWYoKCRlbGVEaW1zLndpZHRoID49ICRlbGVEaW1zLndpbmRvd0RpbXMud2lkdGgpIHx8ICghdGhpcy5jb3VudGVyICYmICFGb3VuZGF0aW9uLkJveC5JbU5vdFRvdWNoaW5nWW91KHRoaXMuJGVsZW1lbnQpKSl7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQub2Zmc2V0KEZvdW5kYXRpb24uQm94LkdldE9mZnNldHModGhpcy4kZWxlbWVudCwgdGhpcy4kYW5jaG9yLCAnY2VudGVyIGJvdHRvbScsIHRoaXMub3B0aW9ucy52T2Zmc2V0LCB0aGlzLm9wdGlvbnMuaE9mZnNldCwgdHJ1ZSkpLmNzcyh7XHJcbiAgICAgICAgJ3dpZHRoJzogJGVsZURpbXMud2luZG93RGltcy53aWR0aCAtICh0aGlzLm9wdGlvbnMuaE9mZnNldCAqIDIpLFxyXG4gICAgICAgICdoZWlnaHQnOiAnYXV0bydcclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMuY2xhc3NDaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnQub2Zmc2V0KEZvdW5kYXRpb24uQm94LkdldE9mZnNldHModGhpcy4kZWxlbWVudCwgdGhpcy4kYW5jaG9yLCBwb3NpdGlvbiwgdGhpcy5vcHRpb25zLnZPZmZzZXQsIHRoaXMub3B0aW9ucy5oT2Zmc2V0KSk7XHJcblxyXG4gICAgd2hpbGUoIUZvdW5kYXRpb24uQm94LkltTm90VG91Y2hpbmdZb3UodGhpcy4kZWxlbWVudCkgJiYgdGhpcy5jb3VudGVyKXtcclxuICAgICAgdGhpcy5fcmVwb3NpdGlvbihwb3NpdGlvbik7XHJcbiAgICAgIHRoaXMuX3NldFBvc2l0aW9uKCk7XHJcbiAgICB9XHJcbiAgfTtcclxuICAvKipcclxuICAgKiBBZGRzIGV2ZW50IGxpc3RlbmVycyB0byB0aGUgZWxlbWVudCB1dGlsaXppbmcgdGhlIHRyaWdnZXJzIHV0aWxpdHkgbGlicmFyeS5cclxuICAgKiBAZnVuY3Rpb25cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIERyb3Bkb3duLnByb3RvdHlwZS5fZXZlbnRzID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICB0aGlzLiRlbGVtZW50Lm9uKHtcclxuICAgICAgJ29wZW4uemYudHJpZ2dlcic6IHRoaXMub3Blbi5iaW5kKHRoaXMpLFxyXG4gICAgICAnY2xvc2UuemYudHJpZ2dlcic6IHRoaXMuY2xvc2UuYmluZCh0aGlzKSxcclxuICAgICAgJ3RvZ2dsZS56Zi50cmlnZ2VyJzogdGhpcy50b2dnbGUuYmluZCh0aGlzKSxcclxuICAgICAgJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInOiB0aGlzLl9zZXRQb3NpdGlvbi5iaW5kKHRoaXMpXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZih0aGlzLm9wdGlvbnMuaG92ZXIpe1xyXG4gICAgICB0aGlzLiRhbmNob3Iub2ZmKCdtb3VzZWVudGVyLnpmLmRyb3Bkb3duIG1vdXNlbGVhdmUuemYuZHJvcGRvd24nKVxyXG4gICAgICAgICAgLm9uKCdtb3VzZWVudGVyLnpmLmRyb3Bkb3duJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KF90aGlzLnRpbWVvdXQpO1xyXG4gICAgICAgICAgICBfdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgIF90aGlzLm9wZW4oKTtcclxuICAgICAgICAgICAgICBfdGhpcy4kYW5jaG9yLmRhdGEoJ2hvdmVyJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH0sIF90aGlzLm9wdGlvbnMuaG92ZXJEZWxheSk7XHJcbiAgICAgICAgICB9KS5vbignbW91c2VsZWF2ZS56Zi5kcm9wZG93bicsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChfdGhpcy50aW1lb3V0KTtcclxuICAgICAgICAgICAgX3RoaXMudGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICBfdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgIF90aGlzLiRhbmNob3IuZGF0YSgnaG92ZXInLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH0sIF90aGlzLm9wdGlvbnMuaG92ZXJEZWxheSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgaWYodGhpcy5vcHRpb25zLmhvdmVyUGFuZSl7XHJcbiAgICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJ21vdXNlZW50ZXIuemYuZHJvcGRvd24gbW91c2VsZWF2ZS56Zi5kcm9wZG93bicpXHJcbiAgICAgICAgICAgIC5vbignbW91c2VlbnRlci56Zi5kcm9wZG93bicsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KF90aGlzLnRpbWVvdXQpO1xyXG4gICAgICAgICAgICB9KS5vbignbW91c2VsZWF2ZS56Zi5kcm9wZG93bicsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KF90aGlzLnRpbWVvdXQpO1xyXG4gICAgICAgICAgICAgIF90aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuJGFuY2hvci5kYXRhKCdob3ZlcicsIGZhbHNlKTtcclxuICAgICAgICAgICAgICB9LCBfdGhpcy5vcHRpb25zLmhvdmVyRGVsYXkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy4kYW5jaG9yLmFkZCh0aGlzLiRlbGVtZW50KS5vbigna2V5ZG93bi56Zi5kcm9wZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuXHJcbiAgICAgIHZhciAkdGFyZ2V0ID0gJCh0aGlzKSxcclxuICAgICAgICB2aXNpYmxlRm9jdXNhYmxlRWxlbWVudHMgPSBGb3VuZGF0aW9uLktleWJvYXJkLmZpbmRGb2N1c2FibGUoX3RoaXMuJGVsZW1lbnQpO1xyXG5cclxuICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ0Ryb3Bkb3duJywge1xyXG4gICAgICAgIHRhYl9mb3J3YXJkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGlmIChfdGhpcy4kZWxlbWVudC5maW5kKCc6Zm9jdXMnKS5pcyh2aXNpYmxlRm9jdXNhYmxlRWxlbWVudHMuZXEoLTEpKSkgeyAvLyBsZWZ0IG1vZGFsIGRvd253YXJkcywgc2V0dGluZyBmb2N1cyB0byBmaXJzdCBlbGVtZW50XHJcbiAgICAgICAgICAgIGlmIChfdGhpcy5vcHRpb25zLnRyYXBGb2N1cykgeyAvLyBpZiBmb2N1cyBzaGFsbCBiZSB0cmFwcGVkXHJcbiAgICAgICAgICAgICAgdmlzaWJsZUZvY3VzYWJsZUVsZW1lbnRzLmVxKDApLmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICB9IGVsc2UgeyAvLyBpZiBmb2N1cyBpcyBub3QgdHJhcHBlZCwgY2xvc2UgZHJvcGRvd24gb24gZm9jdXMgb3V0XHJcbiAgICAgICAgICAgICAgX3RoaXMuY2xvc2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGFiX2JhY2t3YXJkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGlmIChfdGhpcy4kZWxlbWVudC5maW5kKCc6Zm9jdXMnKS5pcyh2aXNpYmxlRm9jdXNhYmxlRWxlbWVudHMuZXEoMCkpIHx8IF90aGlzLiRlbGVtZW50LmlzKCc6Zm9jdXMnKSkgeyAvLyBsZWZ0IG1vZGFsIHVwd2FyZHMsIHNldHRpbmcgZm9jdXMgdG8gbGFzdCBlbGVtZW50XHJcbiAgICAgICAgICAgIGlmIChfdGhpcy5vcHRpb25zLnRyYXBGb2N1cykgeyAvLyBpZiBmb2N1cyBzaGFsbCBiZSB0cmFwcGVkXHJcbiAgICAgICAgICAgICAgdmlzaWJsZUZvY3VzYWJsZUVsZW1lbnRzLmVxKC0xKS5mb2N1cygpO1xyXG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHsgLy8gaWYgZm9jdXMgaXMgbm90IHRyYXBwZWQsIGNsb3NlIGRyb3Bkb3duIG9uIGZvY3VzIG91dFxyXG4gICAgICAgICAgICAgIF90aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9wZW46IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgaWYgKCR0YXJnZXQuaXMoX3RoaXMuJGFuY2hvcikpIHtcclxuICAgICAgICAgICAgX3RoaXMub3BlbigpO1xyXG4gICAgICAgICAgICBfdGhpcy4kZWxlbWVudC5hdHRyKCd0YWJpbmRleCcsIC0xKS5mb2N1cygpO1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjbG9zZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBfdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgICAgX3RoaXMuJGFuY2hvci5mb2N1cygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIEFkZHMgYW4gZXZlbnQgaGFuZGxlciB0byB0aGUgYm9keSB0byBjbG9zZSBhbnkgZHJvcGRvd25zIG9uIGEgY2xpY2suXHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBEcm9wZG93bi5wcm90b3R5cGUuX2FkZEJvZHlIYW5kbGVyID0gZnVuY3Rpb24oKXtcclxuICAgICB2YXIgJGJvZHkgPSAkKGRvY3VtZW50LmJvZHkpLm5vdCh0aGlzLiRlbGVtZW50KSxcclxuICAgICAgICAgX3RoaXMgPSB0aGlzO1xyXG4gICAgICRib2R5Lm9mZignY2xpY2suemYuZHJvcGRvd24nKVxyXG4gICAgICAgICAgLm9uKCdjbGljay56Zi5kcm9wZG93bicsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgICBpZihfdGhpcy4kYW5jaG9yLmlzKGUudGFyZ2V0KSB8fCBfdGhpcy4kYW5jaG9yLmZpbmQoZS50YXJnZXQpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihfdGhpcy4kZWxlbWVudC5maW5kKGUudGFyZ2V0KS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgX3RoaXMuY2xvc2UoKTtcclxuICAgICAgICAgICAgJGJvZHkub2ZmKCdjbGljay56Zi5kcm9wZG93bicpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiBPcGVucyB0aGUgZHJvcGRvd24gcGFuZSwgYW5kIGZpcmVzIGEgYnViYmxpbmcgZXZlbnQgdG8gY2xvc2Ugb3RoZXIgZHJvcGRvd25zLlxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqIEBmaXJlcyBEcm9wZG93biNjbG9zZW1lXHJcbiAgICogQGZpcmVzIERyb3Bkb3duI3Nob3dcclxuICAgKi9cclxuICBEcm9wZG93bi5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uKCl7XHJcbiAgICAvLyB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgLyoqXHJcbiAgICAgKiBGaXJlcyB0byBjbG9zZSBvdGhlciBvcGVuIGRyb3Bkb3duc1xyXG4gICAgICogQGV2ZW50IERyb3Bkb3duI2Nsb3NlbWVcclxuICAgICAqL1xyXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdjbG9zZW1lLnpmLmRyb3Bkb3duJywgdGhpcy4kZWxlbWVudC5hdHRyKCdpZCcpKTtcclxuICAgIHRoaXMuJGFuY2hvci5hZGRDbGFzcygnaG92ZXInKVxyXG4gICAgICAgIC5hdHRyKHsnYXJpYS1leHBhbmRlZCc6IHRydWV9KTtcclxuICAgIC8vIHRoaXMuJGVsZW1lbnQvKi5zaG93KCkqLztcclxuICAgIHRoaXMuX3NldFBvc2l0aW9uKCk7XHJcbiAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCdpcy1vcGVuJylcclxuICAgICAgICAuYXR0cih7J2FyaWEtaGlkZGVuJzogZmFsc2V9KTtcclxuXHJcbiAgICBpZih0aGlzLm9wdGlvbnMuYXV0b0ZvY3VzKXtcclxuICAgICAgdmFyICRmb2N1c2FibGUgPSBGb3VuZGF0aW9uLktleWJvYXJkLmZpbmRGb2N1c2FibGUodGhpcy4kZWxlbWVudCk7XHJcbiAgICAgIGlmKCRmb2N1c2FibGUubGVuZ3RoKXtcclxuICAgICAgICAkZm9jdXNhYmxlLmVxKDApLmZvY3VzKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZih0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrKXsgdGhpcy5fYWRkQm9keUhhbmRsZXIoKTsgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmlyZXMgb25jZSB0aGUgZHJvcGRvd24gaXMgdmlzaWJsZS5cclxuICAgICAqIEBldmVudCBEcm9wZG93biNzaG93XHJcbiAgICAgKi9cclxuICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3Nob3cuemYuZHJvcGRvd24nLCBbdGhpcy4kZWxlbWVudF0pO1xyXG4gICAgLy93aHkgZG9lcyB0aGlzIG5vdCB3b3JrIGNvcnJlY3RseSBmb3IgdGhpcyBwbHVnaW4/XHJcbiAgICAvLyBGb3VuZGF0aW9uLnJlZmxvdyh0aGlzLiRlbGVtZW50LCAnZHJvcGRvd24nKTtcclxuICAgIC8vIEZvdW5kYXRpb24uX3JlZmxvdyh0aGlzLiRlbGVtZW50LmF0dHIoJ2RhdGEtZHJvcGRvd24nKSk7XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2xvc2VzIHRoZSBvcGVuIGRyb3Bkb3duIHBhbmUuXHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICogQGZpcmVzIERyb3Bkb3duI2hpZGVcclxuICAgKi9cclxuICBEcm9wZG93bi5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpe1xyXG4gICAgaWYoIXRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLW9wZW4nKSl7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKVxyXG4gICAgICAgIC5hdHRyKHsnYXJpYS1oaWRkZW4nOiB0cnVlfSk7XHJcblxyXG4gICAgdGhpcy4kYW5jaG9yLnJlbW92ZUNsYXNzKCdob3ZlcicpXHJcbiAgICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBmYWxzZSk7XHJcblxyXG4gICAgaWYodGhpcy5jbGFzc0NoYW5nZWQpe1xyXG4gICAgICB2YXIgY3VyUG9zaXRpb25DbGFzcyA9IHRoaXMuZ2V0UG9zaXRpb25DbGFzcygpO1xyXG4gICAgICBpZihjdXJQb3NpdGlvbkNsYXNzKXtcclxuICAgICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKGN1clBvc2l0aW9uQ2xhc3MpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3ModGhpcy5vcHRpb25zLnBvc2l0aW9uQ2xhc3MpXHJcbiAgICAgICAgICAvKi5oaWRlKCkqLy5jc3Moe2hlaWdodDogJycsIHdpZHRoOiAnJ30pO1xyXG4gICAgICB0aGlzLmNsYXNzQ2hhbmdlZCA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmNvdW50ZXIgPSA0O1xyXG4gICAgICB0aGlzLnVzZWRQb3NpdGlvbnMubGVuZ3RoID0gMDtcclxuICAgIH1cclxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignaGlkZS56Zi5kcm9wZG93bicsIFt0aGlzLiRlbGVtZW50XSk7XHJcbiAgICAvLyBGb3VuZGF0aW9uLnJlZmxvdyh0aGlzLiRlbGVtZW50LCAnZHJvcGRvd24nKTtcclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIFRvZ2dsZXMgdGhlIGRyb3Bkb3duIHBhbmUncyB2aXNpYmlsaXR5LlxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqL1xyXG4gIERyb3Bkb3duLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbigpe1xyXG4gICAgaWYodGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaXMtb3BlbicpKXtcclxuICAgICAgaWYodGhpcy4kYW5jaG9yLmRhdGEoJ2hvdmVyJykpIHJldHVybjtcclxuICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIHRoaXMub3BlbigpO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogRGVzdHJveXMgdGhlIGRyb3Bkb3duLlxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqL1xyXG4gIERyb3Bkb3duLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKXtcclxuICAgIHRoaXMuJGVsZW1lbnQub2ZmKCcuemYudHJpZ2dlcicpLmhpZGUoKTtcclxuICAgIHRoaXMuJGFuY2hvci5vZmYoJy56Zi5kcm9wZG93bicpO1xyXG5cclxuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcclxuICB9O1xyXG5cclxuICBGb3VuZGF0aW9uLnBsdWdpbihEcm9wZG93biwgJ0Ryb3Bkb3duJyk7XHJcbn0oalF1ZXJ5LCB3aW5kb3cuRm91bmRhdGlvbik7XHJcbiIsIi8qKlxyXG4gKiBEcm9wZG93bk1lbnUgbW9kdWxlLlxyXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24uZHJvcGRvd24tbWVudVxyXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmtleWJvYXJkXHJcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwuYm94XHJcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubmVzdFxyXG4gKi9cclxuIWZ1bmN0aW9uKCQsIEZvdW5kYXRpb24pe1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBEcm9wZG93bk1lbnUuXHJcbiAgICogQGNsYXNzXHJcbiAgICogQGZpcmVzIERyb3Bkb3duTWVudSNpbml0XHJcbiAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2UgaW50byBhIGRyb3Bkb3duIG1lbnUuXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIERyb3Bkb3duTWVudShlbGVtZW50LCBvcHRpb25zKXtcclxuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIERyb3Bkb3duTWVudS5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xyXG5cclxuICAgIEZvdW5kYXRpb24uTmVzdC5GZWF0aGVyKHRoaXMuJGVsZW1lbnQsICdkcm9wZG93bicpO1xyXG4gICAgdGhpcy5faW5pdCgpO1xyXG5cclxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ0Ryb3Bkb3duTWVudScpO1xyXG4gICAgRm91bmRhdGlvbi5LZXlib2FyZC5yZWdpc3RlcignRHJvcGRvd25NZW51Jywge1xyXG4gICAgICAnRU5URVInOiAnb3BlbicsXHJcbiAgICAgICdTUEFDRSc6ICdvcGVuJyxcclxuICAgICAgJ0FSUk9XX1JJR0hUJzogJ25leHQnLFxyXG4gICAgICAnQVJST1dfVVAnOiAndXAnLFxyXG4gICAgICAnQVJST1dfRE9XTic6ICdkb3duJyxcclxuICAgICAgJ0FSUk9XX0xFRlQnOiAncHJldmlvdXMnLFxyXG4gICAgICAnRVNDQVBFJzogJ2Nsb3NlJ1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZWZhdWx0IHNldHRpbmdzIGZvciBwbHVnaW5cclxuICAgKi9cclxuICBEcm9wZG93bk1lbnUuZGVmYXVsdHMgPSB7XHJcbiAgICAvKipcclxuICAgICAqIERpc2FsbG93cyBob3ZlciBldmVudHMgZnJvbSBvcGVuaW5nIHN1Ym1lbnVzXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKiBAZXhhbXBsZSBmYWxzZVxyXG4gICAgICovXHJcbiAgICBkaXNhYmxlSG92ZXI6IGZhbHNlLFxyXG4gICAgLyoqXHJcbiAgICAgKiBBbGxvdyBhIHN1Ym1lbnUgdG8gYXV0b21hdGljYWxseSBjbG9zZSBvbiBhIG1vdXNlbGVhdmUgZXZlbnQsIGlmIG5vdCBjbGlja2VkIG9wZW4uXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKiBAZXhhbXBsZSB0cnVlXHJcbiAgICAgKi9cclxuICAgIGF1dG9jbG9zZTogdHJ1ZSxcclxuICAgIC8qKlxyXG4gICAgICogQW1vdW50IG9mIHRpbWUgdG8gZGVsYXkgb3BlbmluZyBhIHN1Ym1lbnUgb24gaG92ZXIgZXZlbnQuXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKiBAZXhhbXBsZSA1MFxyXG4gICAgICovXHJcbiAgICBob3ZlckRlbGF5OiA1MCxcclxuICAgIC8qKlxyXG4gICAgICogQWxsb3cgYSBzdWJtZW51IHRvIG9wZW4vcmVtYWluIG9wZW4gb24gcGFyZW50IGNsaWNrIGV2ZW50LiBBbGxvd3MgY3Vyc29yIHRvIG1vdmUgYXdheSBmcm9tIG1lbnUuXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKiBAZXhhbXBsZSB0cnVlXHJcbiAgICAgKi9cclxuICAgIGNsaWNrT3BlbjogZmFsc2UsXHJcbiAgICAvKipcclxuICAgICAqIEFtb3VudCBvZiB0aW1lIHRvIGRlbGF5IGNsb3NpbmcgYSBzdWJtZW51IG9uIGEgbW91c2VsZWF2ZSBldmVudC5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlIDUwMFxyXG4gICAgICovXHJcblxyXG4gICAgY2xvc2luZ1RpbWU6IDUwMCxcclxuICAgIC8qKlxyXG4gICAgICogUG9zaXRpb24gb2YgdGhlIG1lbnUgcmVsYXRpdmUgdG8gd2hhdCBkaXJlY3Rpb24gdGhlIHN1Ym1lbnVzIHNob3VsZCBvcGVuLiBIYW5kbGVkIGJ5IEpTLlxyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgJ2xlZnQnXHJcbiAgICAgKi9cclxuICAgIGFsaWdubWVudDogJ2xlZnQnLFxyXG4gICAgLyoqXHJcbiAgICAgKiBBbGxvdyBjbGlja3Mgb24gdGhlIGJvZHkgdG8gY2xvc2UgYW55IG9wZW4gc3VibWVudXMuXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKiBAZXhhbXBsZSB0cnVlXHJcbiAgICAgKi9cclxuICAgIGNsb3NlT25DbGljazogdHJ1ZSxcclxuICAgIC8qKlxyXG4gICAgICogQ2xhc3MgYXBwbGllZCB0byB2ZXJ0aWNhbCBvcmllbnRlZCBtZW51cywgRm91bmRhdGlvbiBkZWZhdWx0IGlzIGB2ZXJ0aWNhbGAuIFVwZGF0ZSB0aGlzIGlmIHVzaW5nIHlvdXIgb3duIGNsYXNzLlxyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgJ3ZlcnRpY2FsJ1xyXG4gICAgICovXHJcbiAgICB2ZXJ0aWNhbENsYXNzOiAndmVydGljYWwnLFxyXG4gICAgLyoqXHJcbiAgICAgKiBDbGFzcyBhcHBsaWVkIHRvIHJpZ2h0LXNpZGUgb3JpZW50ZWQgbWVudXMsIEZvdW5kYXRpb24gZGVmYXVsdCBpcyBgYWxpZ24tcmlnaHRgLiBVcGRhdGUgdGhpcyBpZiB1c2luZyB5b3VyIG93biBjbGFzcy5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlICdhbGlnbi1yaWdodCdcclxuICAgICAqL1xyXG4gICAgcmlnaHRDbGFzczogJ2FsaWduLXJpZ2h0JyxcclxuICAgIC8qKlxyXG4gICAgICogQm9vbGVhbiB0byBmb3JjZSBvdmVyaWRlIHRoZSBjbGlja2luZyBvZiBsaW5rcyB0byBwZXJmb3JtIGRlZmF1bHQgYWN0aW9uLCBvbiBzZWNvbmQgdG91Y2ggZXZlbnQgZm9yIG1vYmlsZS5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlIGZhbHNlXHJcbiAgICAgKi9cclxuICAgIGZvcmNlRm9sbG93OiB0cnVlXHJcbiAgfTtcclxuICAvKipcclxuICAgKiBJbml0aWFsaXplcyB0aGUgcGx1Z2luLCBhbmQgY2FsbHMgX3ByZXBhcmVNZW51XHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAZnVuY3Rpb25cclxuICAgKi9cclxuICBEcm9wZG93bk1lbnUucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBzdWJzID0gdGhpcy4kZWxlbWVudC5maW5kKCdsaS5pcy1kcm9wZG93bi1zdWJtZW51LXBhcmVudCcpO1xyXG4gICAgdGhpcy4kZWxlbWVudC5jaGlsZHJlbignLmlzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50JykuY2hpbGRyZW4oJy5pcy1kcm9wZG93bi1zdWJtZW51JykuYWRkQ2xhc3MoJ2ZpcnN0LXN1YicpO1xyXG5cclxuICAgIHRoaXMuJG1lbnVJdGVtcyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnW3JvbGU9XCJtZW51aXRlbVwiXScpO1xyXG4gICAgdGhpcy4kdGFicyA9IHRoaXMuJGVsZW1lbnQuY2hpbGRyZW4oJ1tyb2xlPVwibWVudWl0ZW1cIl0nKTtcclxuICAgIHRoaXMuaXNWZXJ0ID0gdGhpcy4kZWxlbWVudC5oYXNDbGFzcyh0aGlzLm9wdGlvbnMudmVydGljYWxDbGFzcyk7XHJcbiAgICB0aGlzLiR0YWJzLmZpbmQoJ3VsLmlzLWRyb3Bkb3duLXN1Ym1lbnUnKS5hZGRDbGFzcyh0aGlzLm9wdGlvbnMudmVydGljYWxDbGFzcyk7XHJcblxyXG4gICAgaWYodGhpcy4kZWxlbWVudC5oYXNDbGFzcyh0aGlzLm9wdGlvbnMucmlnaHRDbGFzcykgfHwgdGhpcy5vcHRpb25zLmFsaWdubWVudCA9PT0gJ3JpZ2h0JyB8fCBGb3VuZGF0aW9uLnJ0bCgpKXtcclxuICAgICAgdGhpcy5vcHRpb25zLmFsaWdubWVudCA9ICdyaWdodCc7XHJcbiAgICAgIHN1YnMuYWRkQ2xhc3MoJ2lzLWxlZnQtYXJyb3cgb3BlbnMtbGVmdCcpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIHN1YnMuYWRkQ2xhc3MoJ2lzLXJpZ2h0LWFycm93IG9wZW5zLXJpZ2h0Jyk7XHJcbiAgICB9XHJcbiAgICBpZighdGhpcy5pc1ZlcnQpe1xyXG4gICAgICB0aGlzLiR0YWJzLmZpbHRlcignLmlzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50JykucmVtb3ZlQ2xhc3MoJ2lzLXJpZ2h0LWFycm93IGlzLWxlZnQtYXJyb3cgb3BlbnMtcmlnaHQgb3BlbnMtbGVmdCcpXHJcbiAgICAgICAgICAuYWRkQ2xhc3MoJ2lzLWRvd24tYXJyb3cnKTtcclxuICAgIH1cclxuICAgIHRoaXMuY2hhbmdlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5fZXZlbnRzKCk7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiBBZGRzIGV2ZW50IGxpc3RlbmVycyB0byBlbGVtZW50cyB3aXRoaW4gdGhlIG1lbnVcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqL1xyXG4gIERyb3Bkb3duTWVudS5wcm90b3R5cGUuX2V2ZW50cyA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzLFxyXG4gICAgICAgIGhhc1RvdWNoID0gJ29udG91Y2hzdGFydCcgaW4gd2luZG93IHx8ICh0eXBlb2Ygd2luZG93Lm9udG91Y2hzdGFydCAhPT0gJ3VuZGVmaW5lZCcpLFxyXG4gICAgICAgIHBhckNsYXNzID0gJ2lzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50JztcclxuXHJcbiAgICBpZih0aGlzLm9wdGlvbnMuY2xpY2tPcGVuIHx8IGhhc1RvdWNoKXtcclxuICAgICAgdGhpcy4kbWVudUl0ZW1zLm9uKCdjbGljay56Zi5kcm9wZG93bm1lbnUgdG91Y2hzdGFydC56Zi5kcm9wZG93bm1lbnUnLCBmdW5jdGlvbihlKXtcclxuICAgICAgICB2YXIgJGVsZW0gPSAkKGUudGFyZ2V0KS5wYXJlbnRzVW50aWwoJ3VsJywgJy4nICsgcGFyQ2xhc3MpLFxyXG4gICAgICAgICAgICBoYXNTdWIgPSAkZWxlbS5oYXNDbGFzcyhwYXJDbGFzcyksXHJcbiAgICAgICAgICAgIGhhc0NsaWNrZWQgPSAkZWxlbS5hdHRyKCdkYXRhLWlzLWNsaWNrJykgPT09ICd0cnVlJyxcclxuICAgICAgICAgICAgJHN1YiA9ICRlbGVtLmNoaWxkcmVuKCcuaXMtZHJvcGRvd24tc3VibWVudScpO1xyXG5cclxuICAgICAgICBpZihoYXNTdWIpe1xyXG4gICAgICAgICAgaWYoaGFzQ2xpY2tlZCl7XHJcbiAgICAgICAgICAgIGlmKCFfdGhpcy5vcHRpb25zLmNsb3NlT25DbGljayB8fCAoIV90aGlzLm9wdGlvbnMuY2xpY2tPcGVuICYmICFoYXNUb3VjaCkgfHwgKF90aGlzLm9wdGlvbnMuZm9yY2VGb2xsb3cgJiYgaGFzVG91Y2gpKXsgcmV0dXJuOyB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgX3RoaXMuX2hpZGUoJGVsZW0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBfdGhpcy5fc2hvdygkZWxlbS5jaGlsZHJlbignLmlzLWRyb3Bkb3duLXN1Ym1lbnUnKSk7XHJcbiAgICAgICAgICAgICRlbGVtLmFkZCgkZWxlbS5wYXJlbnRzVW50aWwoX3RoaXMuJGVsZW1lbnQsICcuJyArIHBhckNsYXNzKSkuYXR0cignZGF0YS1pcy1jbGljaycsIHRydWUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1lbHNleyByZXR1cm47IH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYoIXRoaXMub3B0aW9ucy5kaXNhYmxlSG92ZXIpe1xyXG4gICAgICB0aGlzLiRtZW51SXRlbXMub24oJ21vdXNlZW50ZXIuemYuZHJvcGRvd25tZW51JywgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB2YXIgJGVsZW0gPSAkKHRoaXMpLFxyXG4gICAgICAgICAgICBoYXNTdWIgPSAkZWxlbS5oYXNDbGFzcyhwYXJDbGFzcyk7XHJcblxyXG4gICAgICAgIGlmKGhhc1N1Yil7XHJcbiAgICAgICAgICBjbGVhclRpbWVvdXQoX3RoaXMuZGVsYXkpO1xyXG4gICAgICAgICAgX3RoaXMuZGVsYXkgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIF90aGlzLl9zaG93KCRlbGVtLmNoaWxkcmVuKCcuaXMtZHJvcGRvd24tc3VibWVudScpKTtcclxuICAgICAgICAgIH0sIF90aGlzLm9wdGlvbnMuaG92ZXJEZWxheSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KS5vbignbW91c2VsZWF2ZS56Zi5kcm9wZG93bm1lbnUnLCBmdW5jdGlvbihlKXtcclxuICAgICAgICB2YXIgJGVsZW0gPSAkKHRoaXMpLFxyXG4gICAgICAgICAgICBoYXNTdWIgPSAkZWxlbS5oYXNDbGFzcyhwYXJDbGFzcyk7XHJcbiAgICAgICAgaWYoaGFzU3ViICYmIF90aGlzLm9wdGlvbnMuYXV0b2Nsb3NlKXtcclxuICAgICAgICAgIGlmKCRlbGVtLmF0dHIoJ2RhdGEtaXMtY2xpY2snKSA9PT0gJ3RydWUnICYmIF90aGlzLm9wdGlvbnMuY2xpY2tPcGVuKXsgcmV0dXJuIGZhbHNlOyB9XHJcblxyXG4gICAgICAgICAgY2xlYXJUaW1lb3V0KF90aGlzLmRlbGF5KTtcclxuICAgICAgICAgIF90aGlzLmRlbGF5ID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBfdGhpcy5faGlkZSgkZWxlbSk7XHJcbiAgICAgICAgICB9LCBfdGhpcy5vcHRpb25zLmNsb3NpbmdUaW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgdGhpcy4kbWVudUl0ZW1zLm9uKCdrZXlkb3duLnpmLmRyb3Bkb3dubWVudScsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICB2YXIgJGVsZW1lbnQgPSAkKGUudGFyZ2V0KS5wYXJlbnRzVW50aWwoJ3VsJywgJ1tyb2xlPVwibWVudWl0ZW1cIl0nKSxcclxuICAgICAgICAgIGlzVGFiID0gX3RoaXMuJHRhYnMuaW5kZXgoJGVsZW1lbnQpID4gLTEsXHJcbiAgICAgICAgICAkZWxlbWVudHMgPSBpc1RhYiA/IF90aGlzLiR0YWJzIDogJGVsZW1lbnQuc2libGluZ3MoJ2xpJykuYWRkKCRlbGVtZW50KSxcclxuICAgICAgICAgICRwcmV2RWxlbWVudCxcclxuICAgICAgICAgICRuZXh0RWxlbWVudDtcclxuXHJcbiAgICAgICRlbGVtZW50cy5lYWNoKGZ1bmN0aW9uKGkpIHtcclxuICAgICAgICBpZiAoJCh0aGlzKS5pcygkZWxlbWVudCkpIHtcclxuICAgICAgICAgICRwcmV2RWxlbWVudCA9ICRlbGVtZW50cy5lcShpLTEpO1xyXG4gICAgICAgICAgJG5leHRFbGVtZW50ID0gJGVsZW1lbnRzLmVxKGkrMSk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHZhciBuZXh0U2libGluZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICghJGVsZW1lbnQuaXMoJzpsYXN0LWNoaWxkJykpICRuZXh0RWxlbWVudC5jaGlsZHJlbignYTpmaXJzdCcpLmZvY3VzKCk7XHJcbiAgICAgIH0sIHByZXZTaWJsaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHByZXZFbGVtZW50LmNoaWxkcmVuKCdhOmZpcnN0JykuZm9jdXMoKTtcclxuICAgICAgfSwgb3BlblN1YiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciAkc3ViID0gJGVsZW1lbnQuY2hpbGRyZW4oJ3VsLmlzLWRyb3Bkb3duLXN1Ym1lbnUnKTtcclxuICAgICAgICBpZigkc3ViLmxlbmd0aCl7XHJcbiAgICAgICAgICBfdGhpcy5fc2hvdygkc3ViKTtcclxuICAgICAgICAgICRlbGVtZW50LmZpbmQoJ2xpID4gYTpmaXJzdCcpLmZvY3VzKCk7XHJcbiAgICAgICAgfWVsc2V7IHJldHVybjsgfVxyXG4gICAgICB9LCBjbG9zZVN1YiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vaWYgKCRlbGVtZW50LmlzKCc6Zmlyc3QtY2hpbGQnKSkge1xyXG4gICAgICAgIHZhciBjbG9zZSA9ICRlbGVtZW50LnBhcmVudCgndWwnKS5wYXJlbnQoJ2xpJyk7XHJcbiAgICAgICAgICBjbG9zZS5jaGlsZHJlbignYTpmaXJzdCcpLmZvY3VzKCk7XHJcbiAgICAgICAgICBfdGhpcy5faGlkZShjbG9zZSk7XHJcbiAgICAgICAgLy99XHJcbiAgICAgIH07XHJcbiAgICAgIHZhciBmdW5jdGlvbnMgPSB7XHJcbiAgICAgICAgb3Blbjogb3BlblN1YixcclxuICAgICAgICBjbG9zZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBfdGhpcy5faGlkZShfdGhpcy4kZWxlbWVudCk7XHJcbiAgICAgICAgICBfdGhpcy4kbWVudUl0ZW1zLmZpbmQoJ2E6Zmlyc3QnKS5mb2N1cygpOyAvLyBmb2N1cyB0byBmaXJzdCBlbGVtZW50XHJcbiAgICAgICAgfSxcclxuICAgICAgICBoYW5kbGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgaWYgKGlzVGFiKSB7XHJcbiAgICAgICAgaWYgKF90aGlzLnZlcnRpY2FsKSB7IC8vIHZlcnRpY2FsIG1lbnVcclxuICAgICAgICAgIGlmIChfdGhpcy5vcHRpb25zLmFsaWdubWVudCA9PT0gJ2xlZnQnKSB7IC8vIGxlZnQgYWxpZ25lZFxyXG4gICAgICAgICAgICAkLmV4dGVuZChmdW5jdGlvbnMsIHtcclxuICAgICAgICAgICAgICBkb3duOiBuZXh0U2libGluZyxcclxuICAgICAgICAgICAgICB1cDogcHJldlNpYmxpbmcsXHJcbiAgICAgICAgICAgICAgbmV4dDogb3BlblN1YixcclxuICAgICAgICAgICAgICBwcmV2aW91czogY2xvc2VTdWJcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9IGVsc2UgeyAvLyByaWdodCBhbGlnbmVkXHJcbiAgICAgICAgICAgICQuZXh0ZW5kKGZ1bmN0aW9ucywge1xyXG4gICAgICAgICAgICAgIGRvd246IG5leHRTaWJsaW5nLFxyXG4gICAgICAgICAgICAgIHVwOiBwcmV2U2libGluZyxcclxuICAgICAgICAgICAgICBuZXh0OiBjbG9zZVN1YixcclxuICAgICAgICAgICAgICBwcmV2aW91czogb3BlblN1YlxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgeyAvLyBob3Jpem9udGFsIG1lbnVcclxuICAgICAgICAgICQuZXh0ZW5kKGZ1bmN0aW9ucywge1xyXG4gICAgICAgICAgICBuZXh0OiBuZXh0U2libGluZyxcclxuICAgICAgICAgICAgcHJldmlvdXM6IHByZXZTaWJsaW5nLFxyXG4gICAgICAgICAgICBkb3duOiBvcGVuU3ViLFxyXG4gICAgICAgICAgICB1cDogY2xvc2VTdWJcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHsgLy8gbm90IHRhYnMgLT4gb25lIHN1YlxyXG4gICAgICAgIGlmIChfdGhpcy5vcHRpb25zLmFsaWdubWVudCA9PT0gJ2xlZnQnKSB7IC8vIGxlZnQgYWxpZ25lZFxyXG4gICAgICAgICAgJC5leHRlbmQoZnVuY3Rpb25zLCB7XHJcbiAgICAgICAgICAgIG5leHQ6IG9wZW5TdWIsXHJcbiAgICAgICAgICAgIHByZXZpb3VzOiBjbG9zZVN1YixcclxuICAgICAgICAgICAgZG93bjogbmV4dFNpYmxpbmcsXHJcbiAgICAgICAgICAgIHVwOiBwcmV2U2libGluZ1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHsgLy8gcmlnaHQgYWxpZ25lZFxyXG4gICAgICAgICAgJC5leHRlbmQoZnVuY3Rpb25zLCB7XHJcbiAgICAgICAgICAgIG5leHQ6IGNsb3NlU3ViLFxyXG4gICAgICAgICAgICBwcmV2aW91czogb3BlblN1YixcclxuICAgICAgICAgICAgZG93bjogbmV4dFNpYmxpbmcsXHJcbiAgICAgICAgICAgIHVwOiBwcmV2U2libGluZ1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQuaGFuZGxlS2V5KGUsICdEcm9wZG93bk1lbnUnLCBmdW5jdGlvbnMpO1xyXG5cclxuICAgIH0pO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogQWRkcyBhbiBldmVudCBoYW5kbGVyIHRvIHRoZSBib2R5IHRvIGNsb3NlIGFueSBkcm9wZG93bnMgb24gYSBjbGljay5cclxuICAgKiBAZnVuY3Rpb25cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIERyb3Bkb3duTWVudS5wcm90b3R5cGUuX2FkZEJvZHlIYW5kbGVyID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciAkYm9keSA9ICQoZG9jdW1lbnQuYm9keSksXHJcbiAgICAgICAgX3RoaXMgPSB0aGlzO1xyXG4gICAgJGJvZHkub2ZmKCdtb3VzZXVwLnpmLmRyb3Bkb3dubWVudSB0b3VjaGVuZC56Zi5kcm9wZG93bm1lbnUnKVxyXG4gICAgICAgICAub24oJ21vdXNldXAuemYuZHJvcGRvd25tZW51IHRvdWNoZW5kLnpmLmRyb3Bkb3dubWVudScsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgIHZhciAkbGluayA9IF90aGlzLiRlbGVtZW50LmZpbmQoZS50YXJnZXQpO1xyXG4gICAgICAgICAgIGlmKCRsaW5rLmxlbmd0aCl7IHJldHVybjsgfVxyXG5cclxuICAgICAgICAgICBfdGhpcy5faGlkZSgpO1xyXG4gICAgICAgICAgICRib2R5Lm9mZignbW91c2V1cC56Zi5kcm9wZG93bm1lbnUgdG91Y2hlbmQuemYuZHJvcGRvd25tZW51Jyk7XHJcbiAgICAgICAgIH0pO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogT3BlbnMgYSBkcm9wZG93biBwYW5lLCBhbmQgY2hlY2tzIGZvciBjb2xsaXNpb25zIGZpcnN0LlxyXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkc3ViIC0gdWwgZWxlbWVudCB0aGF0IGlzIGEgc3VibWVudSB0byBzaG93XHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAZmlyZXMgRHJvcGRvd25NZW51I3Nob3dcclxuICAgKi9cclxuICBEcm9wZG93bk1lbnUucHJvdG90eXBlLl9zaG93ID0gZnVuY3Rpb24oJHN1Yil7XHJcbiAgICB2YXIgaWR4ID0gdGhpcy4kdGFicy5pbmRleCh0aGlzLiR0YWJzLmZpbHRlcihmdW5jdGlvbihpLCBlbCl7XHJcbiAgICAgIHJldHVybiAkKGVsKS5maW5kKCRzdWIpLmxlbmd0aCA+IDA7XHJcbiAgICB9KSk7XHJcbiAgICB2YXIgJHNpYnMgPSAkc3ViLnBhcmVudCgnbGkuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKS5zaWJsaW5ncygnbGkuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKTtcclxuICAgIHRoaXMuX2hpZGUoJHNpYnMsIGlkeCk7XHJcbiAgICAkc3ViLmNzcygndmlzaWJpbGl0eScsICdoaWRkZW4nKS5hZGRDbGFzcygnanMtZHJvcGRvd24tYWN0aXZlJykuYXR0cih7J2FyaWEtaGlkZGVuJzogZmFsc2V9KVxyXG4gICAgICAgIC5wYXJlbnQoJ2xpLmlzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50JykuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpXHJcbiAgICAgICAgLmF0dHIoeydhcmlhLWV4cGFuZGVkJzogdHJ1ZX0pO1xyXG4gICAgdmFyIGNsZWFyID0gRm91bmRhdGlvbi5Cb3guSW1Ob3RUb3VjaGluZ1lvdSgkc3ViLCBudWxsLCB0cnVlKTtcclxuICAgIGlmKCFjbGVhcil7XHJcbiAgICAgIHZhciBvbGRDbGFzcyA9IHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgPT09ICdsZWZ0JyA/ICctcmlnaHQnIDogJy1sZWZ0JyxcclxuICAgICAgICAgICRwYXJlbnRMaSA9ICRzdWIucGFyZW50KCcuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKTtcclxuICAgICAgJHBhcmVudExpLnJlbW92ZUNsYXNzKCdvcGVucycgKyBvbGRDbGFzcykuYWRkQ2xhc3MoJ29wZW5zLScgKyB0aGlzLm9wdGlvbnMuYWxpZ25tZW50KTtcclxuICAgICAgY2xlYXIgPSBGb3VuZGF0aW9uLkJveC5JbU5vdFRvdWNoaW5nWW91KCRzdWIsIG51bGwsIHRydWUpO1xyXG4gICAgICBpZighY2xlYXIpe1xyXG4gICAgICAgICRwYXJlbnRMaS5yZW1vdmVDbGFzcygnb3BlbnMtJyArIHRoaXMub3B0aW9ucy5hbGlnbm1lbnQpLmFkZENsYXNzKCdvcGVucy1pbm5lcicpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuY2hhbmdlZCA9IHRydWU7XHJcbiAgICB9XHJcbiAgICAkc3ViLmNzcygndmlzaWJpbGl0eScsICcnKTtcclxuICAgIGlmKHRoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2speyB0aGlzLl9hZGRCb2R5SGFuZGxlcigpOyB9XHJcbiAgICAvKipcclxuICAgICAqIEZpcmVzIHdoZW4gdGhlIG5ldyBkcm9wZG93biBwYW5lIGlzIHZpc2libGUuXHJcbiAgICAgKiBAZXZlbnQgRHJvcGRvd25NZW51I3Nob3dcclxuICAgICAqL1xyXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdzaG93LnpmLmRyb3Bkb3dubWVudScsIFskc3ViXSk7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiBIaWRlcyBhIHNpbmdsZSwgY3VycmVudGx5IG9wZW4gZHJvcGRvd24gcGFuZSwgaWYgcGFzc2VkIGEgcGFyYW1ldGVyLCBvdGhlcndpc2UsIGhpZGVzIGV2ZXJ5dGhpbmcuXHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICogQHBhcmFtIHtqUXVlcnl9ICRlbGVtIC0gZWxlbWVudCB3aXRoIGEgc3VibWVudSB0byBoaWRlXHJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGlkeCAtIGluZGV4IG9mIHRoZSAkdGFicyBjb2xsZWN0aW9uIHRvIGhpZGVcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIERyb3Bkb3duTWVudS5wcm90b3R5cGUuX2hpZGUgPSBmdW5jdGlvbigkZWxlbSwgaWR4KXtcclxuICAgIHZhciAkdG9DbG9zZTtcclxuICAgIGlmKCRlbGVtICYmICRlbGVtLmxlbmd0aCl7XHJcbiAgICAgICR0b0Nsb3NlID0gJGVsZW07XHJcbiAgICB9ZWxzZSBpZihpZHggIT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICR0b0Nsb3NlID0gdGhpcy4kdGFicy5ub3QoZnVuY3Rpb24oaSwgZWwpe1xyXG4gICAgICAgIHJldHVybiBpID09PSBpZHg7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuICAgICAgJHRvQ2xvc2UgPSB0aGlzLiRlbGVtZW50O1xyXG4gICAgfVxyXG4gICAgdmFyIHNvbWV0aGluZ1RvQ2xvc2UgPSAkdG9DbG9zZS5oYXNDbGFzcygnaXMtYWN0aXZlJykgfHwgJHRvQ2xvc2UuZmluZCgnLmlzLWFjdGl2ZScpLmxlbmd0aCA+IDA7XHJcblxyXG4gICAgaWYoc29tZXRoaW5nVG9DbG9zZSl7XHJcbiAgICAgICR0b0Nsb3NlLmZpbmQoJ2xpLmlzLWFjdGl2ZScpLmFkZCgkdG9DbG9zZSkuYXR0cih7XHJcbiAgICAgICAgJ2FyaWEtZXhwYW5kZWQnOiBmYWxzZSxcclxuICAgICAgICAnZGF0YS1pcy1jbGljayc6IGZhbHNlXHJcbiAgICAgIH0pLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUnKTtcclxuXHJcbiAgICAgICR0b0Nsb3NlLmZpbmQoJ3VsLmpzLWRyb3Bkb3duLWFjdGl2ZScpLmF0dHIoe1xyXG4gICAgICAgICdhcmlhLWhpZGRlbic6IHRydWVcclxuICAgICAgfSkucmVtb3ZlQ2xhc3MoJ2pzLWRyb3Bkb3duLWFjdGl2ZScpO1xyXG5cclxuICAgICAgaWYodGhpcy5jaGFuZ2VkIHx8ICR0b0Nsb3NlLmZpbmQoJ29wZW5zLWlubmVyJykubGVuZ3RoKXtcclxuICAgICAgICB2YXIgb2xkQ2xhc3MgPSB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID09PSAnbGVmdCcgPyAncmlnaHQnIDogJ2xlZnQnO1xyXG4gICAgICAgICR0b0Nsb3NlLmZpbmQoJ2xpLmlzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50JykuYWRkKCR0b0Nsb3NlKVxyXG4gICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdvcGVucy1pbm5lciBvcGVucy0nICsgdGhpcy5vcHRpb25zLmFsaWdubWVudClcclxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnb3BlbnMtJyArIG9sZENsYXNzKTtcclxuICAgICAgICB0aGlzLmNoYW5nZWQgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICAvKipcclxuICAgICAgICogRmlyZXMgd2hlbiB0aGUgb3BlbiBtZW51cyBhcmUgY2xvc2VkLlxyXG4gICAgICAgKiBAZXZlbnQgRHJvcGRvd25NZW51I2hpZGVcclxuICAgICAgICovXHJcbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignaGlkZS56Zi5kcm9wZG93bm1lbnUnLCBbJHRvQ2xvc2VdKTtcclxuICAgIH1cclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIERlc3Ryb3lzIHRoZSBwbHVnaW4uXHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICovXHJcbiAgRHJvcGRvd25NZW51LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKXtcclxuICAgIHRoaXMuJG1lbnVJdGVtcy5vZmYoJy56Zi5kcm9wZG93bm1lbnUnKS5yZW1vdmVBdHRyKCdkYXRhLWlzLWNsaWNrJylcclxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2lzLXJpZ2h0LWFycm93IGlzLWxlZnQtYXJyb3cgaXMtZG93bi1hcnJvdyBvcGVucy1yaWdodCBvcGVucy1sZWZ0IG9wZW5zLWlubmVyJyk7XHJcbiAgICAkKGRvY3VtZW50LmJvZHkpLm9mZignLnpmLmRyb3Bkb3dubWVudScpO1xyXG4gICAgRm91bmRhdGlvbi5OZXN0LkJ1cm4odGhpcy4kZWxlbWVudCwgJ2Ryb3Bkb3duJyk7XHJcbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XHJcbiAgfTtcclxuXHJcbiAgRm91bmRhdGlvbi5wbHVnaW4oRHJvcGRvd25NZW51LCAnRHJvcGRvd25NZW51Jyk7XHJcbn0oalF1ZXJ5LCB3aW5kb3cuRm91bmRhdGlvbik7XHJcbiIsIiFmdW5jdGlvbihGb3VuZGF0aW9uLCAkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIEVxdWFsaXplci5cclxuICAgKiBAY2xhc3NcclxuICAgKiBAZmlyZXMgRXF1YWxpemVyI2luaXRcclxuICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gYWRkIHRoZSB0cmlnZ2VyIHRvLlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cclxuICAgKi9cclxuICBmdW5jdGlvbiBFcXVhbGl6ZXIoZWxlbWVudCwgb3B0aW9ucyl7XHJcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcclxuICAgIHRoaXMub3B0aW9ucyAgPSAkLmV4dGVuZCh7fSwgRXF1YWxpemVyLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XHJcblxyXG4gICAgdGhpcy5faW5pdCgpO1xyXG5cclxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ0VxdWFsaXplcicpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGVmYXVsdCBzZXR0aW5ncyBmb3IgcGx1Z2luXHJcbiAgICovXHJcbiAgRXF1YWxpemVyLmRlZmF1bHRzID0ge1xyXG4gICAgLyoqXHJcbiAgICAgKiBFbmFibGUgaGVpZ2h0IGVxdWFsaXphdGlvbiB3aGVuIHN0YWNrZWQgb24gc21hbGxlciBzY3JlZW5zLlxyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgdHJ1ZVxyXG4gICAgICovXHJcbiAgICBlcXVhbGl6ZU9uU3RhY2s6IHRydWUsXHJcbiAgICAvKipcclxuICAgICAqIEVuYWJsZSBoZWlnaHQgZXF1YWxpemF0aW9uIHJvdyBieSByb3cuXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKiBAZXhhbXBsZSBmYWxzZVxyXG4gICAgICovXHJcbiAgICBlcXVhbGl6ZUJ5Um93OiBmYWxzZSxcclxuICAgIC8qKlxyXG4gICAgICogU3RyaW5nIHJlcHJlc2VudGluZyB0aGUgbWluaW11bSBicmVha3BvaW50IHNpemUgdGhlIHBsdWdpbiBzaG91bGQgZXF1YWxpemUgaGVpZ2h0cyBvbi5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlICdtZWRpdW0nXHJcbiAgICAgKi9cclxuICAgIGVxdWFsaXplT246ICcnXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogSW5pdGlhbGl6ZXMgdGhlIEVxdWFsaXplciBwbHVnaW4gYW5kIGNhbGxzIGZ1bmN0aW9ucyB0byBnZXQgZXF1YWxpemVyIGZ1bmN0aW9uaW5nIG9uIGxvYWQuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBFcXVhbGl6ZXIucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBlcUlkID0gdGhpcy4kZWxlbWVudC5hdHRyKCdkYXRhLWVxdWFsaXplcicpIHx8ICcnO1xyXG4gICAgdmFyICR3YXRjaGVkID0gdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS1lcXVhbGl6ZXItd2F0Y2g9XCInICsgZXFJZCArICdcIl0nKTtcclxuXHJcbiAgICB0aGlzLiR3YXRjaGVkID0gJHdhdGNoZWQubGVuZ3RoID8gJHdhdGNoZWQgOiB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLWVxdWFsaXplci13YXRjaF0nKTtcclxuICAgIHRoaXMuJGVsZW1lbnQuYXR0cignZGF0YS1yZXNpemUnLCAoZXFJZCB8fCBGb3VuZGF0aW9uLkdldFlvRGlnaXRzKDYsICdlcScpKSk7XHJcblxyXG4gICAgdGhpcy5oYXNOZXN0ZWQgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLWVxdWFsaXplcl0nKS5sZW5ndGggPiAwO1xyXG4gICAgdGhpcy5pc05lc3RlZCA9IHRoaXMuJGVsZW1lbnQucGFyZW50c1VudGlsKGRvY3VtZW50LmJvZHksICdbZGF0YS1lcXVhbGl6ZXJdJykubGVuZ3RoID4gMDtcclxuICAgIHRoaXMuaXNPbiA9IGZhbHNlO1xyXG5cclxuICAgIHZhciBpbWdzID0gdGhpcy4kZWxlbWVudC5maW5kKCdpbWcnKTtcclxuICAgIHZhciB0b29TbWFsbDtcclxuICAgIGlmKHRoaXMub3B0aW9ucy5lcXVhbGl6ZU9uKXtcclxuICAgICAgdG9vU21hbGwgPSB0aGlzLl9jaGVja01RKCk7XHJcbiAgICAgICQod2luZG93KS5vbignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgdGhpcy5fY2hlY2tNUS5iaW5kKHRoaXMpKTtcclxuICAgIH1lbHNle1xyXG4gICAgICB0aGlzLl9ldmVudHMoKTtcclxuICAgIH1cclxuICAgIGlmKCh0b29TbWFsbCAhPT0gdW5kZWZpbmVkICYmIHRvb1NtYWxsID09PSBmYWxzZSkgfHwgdG9vU21hbGwgPT09IHVuZGVmaW5lZCl7XHJcbiAgICAgIGlmKGltZ3MubGVuZ3RoKXtcclxuICAgICAgICBGb3VuZGF0aW9uLm9uSW1hZ2VzTG9hZGVkKGltZ3MsIHRoaXMuX3JlZmxvdy5iaW5kKHRoaXMpKTtcclxuICAgICAgfWVsc2V7XHJcbiAgICAgICAgdGhpcy5fcmVmbG93KCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgfTtcclxuICAvKipcclxuICAgKiBSZW1vdmVzIGV2ZW50IGxpc3RlbmVycyBpZiB0aGUgYnJlYWtwb2ludCBpcyB0b28gc21hbGwuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBFcXVhbGl6ZXIucHJvdG90eXBlLl9wYXVzZUV2ZW50cyA9IGZ1bmN0aW9uKCl7XHJcbiAgICB0aGlzLmlzT24gPSBmYWxzZTtcclxuICAgIHRoaXMuJGVsZW1lbnQub2ZmKCcuemYuZXF1YWxpemVyIHJlc2l6ZW1lLnpmLnRyaWdnZXInKTtcclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIEluaXRpYWxpemVzIGV2ZW50cyBmb3IgRXF1YWxpemVyLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgRXF1YWxpemVyLnByb3RvdHlwZS5fZXZlbnRzID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICB0aGlzLl9wYXVzZUV2ZW50cygpO1xyXG4gICAgaWYodGhpcy5oYXNOZXN0ZWQpe1xyXG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCdwb3N0ZXF1YWxpemVkLnpmLmVxdWFsaXplcicsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGlmKGUudGFyZ2V0ICE9PSBfdGhpcy4kZWxlbWVudFswXSl7IF90aGlzLl9yZWZsb3coKTsgfVxyXG4gICAgICB9KTtcclxuICAgIH1lbHNle1xyXG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCdyZXNpemVtZS56Zi50cmlnZ2VyJywgdGhpcy5fcmVmbG93LmJpbmQodGhpcykpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5pc09uID0gdHJ1ZTtcclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIENoZWNrcyB0aGUgY3VycmVudCBicmVha3BvaW50IHRvIHRoZSBtaW5pbXVtIHJlcXVpcmVkIHNpemUuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBFcXVhbGl6ZXIucHJvdG90eXBlLl9jaGVja01RID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciB0b29TbWFsbCA9ICFGb3VuZGF0aW9uLk1lZGlhUXVlcnkuYXRMZWFzdCh0aGlzLm9wdGlvbnMuZXF1YWxpemVPbik7XHJcbiAgICBpZih0b29TbWFsbCl7XHJcbiAgICAgIGlmKHRoaXMuaXNPbil7XHJcbiAgICAgICAgdGhpcy5fcGF1c2VFdmVudHMoKTtcclxuICAgICAgICB0aGlzLiR3YXRjaGVkLmNzcygnaGVpZ2h0JywgJ2F1dG8nKTtcclxuICAgICAgfVxyXG4gICAgfWVsc2V7XHJcbiAgICAgIGlmKCF0aGlzLmlzT24pe1xyXG4gICAgICAgIHRoaXMuX2V2ZW50cygpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdG9vU21hbGw7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiBBIG5vb3AgdmVyc2lvbiBmb3IgdGhlIHBsdWdpblxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgRXF1YWxpemVyLnByb3RvdHlwZS5fa2lsbHN3aXRjaCA9IGZ1bmN0aW9uKCl7XHJcbiAgICByZXR1cm47XHJcbiAgfTtcclxuICAvKipcclxuICAgKiBDYWxscyBuZWNlc3NhcnkgZnVuY3Rpb25zIHRvIHVwZGF0ZSBFcXVhbGl6ZXIgdXBvbiBET00gY2hhbmdlXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBFcXVhbGl6ZXIucHJvdG90eXBlLl9yZWZsb3cgPSBmdW5jdGlvbigpe1xyXG4gICAgaWYoIXRoaXMub3B0aW9ucy5lcXVhbGl6ZU9uU3RhY2spe1xyXG4gICAgICBpZih0aGlzLl9pc1N0YWNrZWQoKSl7XHJcbiAgICAgICAgdGhpcy4kd2F0Y2hlZC5jc3MoJ2hlaWdodCcsICdhdXRvJyk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5vcHRpb25zLmVxdWFsaXplQnlSb3cpIHtcclxuICAgICAgdGhpcy5nZXRIZWlnaHRzQnlSb3codGhpcy5hcHBseUhlaWdodEJ5Um93LmJpbmQodGhpcykpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIHRoaXMuZ2V0SGVpZ2h0cyh0aGlzLmFwcGx5SGVpZ2h0LmJpbmQodGhpcykpO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogTWFudWFsbHkgZGV0ZXJtaW5lcyBpZiB0aGUgZmlyc3QgMiBlbGVtZW50cyBhcmUgKk5PVCogc3RhY2tlZC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIEVxdWFsaXplci5wcm90b3R5cGUuX2lzU3RhY2tlZCA9IGZ1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4gdGhpcy4kd2F0Y2hlZFswXS5vZmZzZXRUb3AgIT09IHRoaXMuJHdhdGNoZWRbMV0ub2Zmc2V0VG9wO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogRmluZHMgdGhlIG91dGVyIGhlaWdodHMgb2YgY2hpbGRyZW4gY29udGFpbmVkIHdpdGhpbiBhbiBFcXVhbGl6ZXIgcGFyZW50IGFuZCByZXR1cm5zIHRoZW0gaW4gYW4gYXJyYXlcclxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYiAtIEEgbm9uLW9wdGlvbmFsIGNhbGxiYWNrIHRvIHJldHVybiB0aGUgaGVpZ2h0cyBhcnJheSB0by5cclxuICAgKiBAcmV0dXJucyB7QXJyYXl9IGhlaWdodHMgLSBBbiBhcnJheSBvZiBoZWlnaHRzIG9mIGNoaWxkcmVuIHdpdGhpbiBFcXVhbGl6ZXIgY29udGFpbmVyXHJcbiAgICovXHJcbiAgRXF1YWxpemVyLnByb3RvdHlwZS5nZXRIZWlnaHRzID0gZnVuY3Rpb24oY2Ipe1xyXG4gICAgdmFyIGhlaWdodHMgPSBbXTtcclxuICAgIGZvcih2YXIgaSA9IDAsIGxlbiA9IHRoaXMuJHdhdGNoZWQubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICB0aGlzLiR3YXRjaGVkW2ldLnN0eWxlLmhlaWdodCA9ICdhdXRvJztcclxuICAgICAgaGVpZ2h0cy5wdXNoKHRoaXMuJHdhdGNoZWRbaV0ub2Zmc2V0SGVpZ2h0KTtcclxuICAgIH1cclxuICAgIGNiKGhlaWdodHMpO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogRmluZHMgdGhlIG91dGVyIGhlaWdodHMgb2YgY2hpbGRyZW4gY29udGFpbmVkIHdpdGhpbiBhbiBFcXVhbGl6ZXIgcGFyZW50IGFuZCByZXR1cm5zIHRoZW0gaW4gYW4gYXJyYXlcclxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYiAtIEEgbm9uLW9wdGlvbmFsIGNhbGxiYWNrIHRvIHJldHVybiB0aGUgaGVpZ2h0cyBhcnJheSB0by5cclxuICAgKiBAcmV0dXJucyB7QXJyYXl9IGdyb3VwcyAtIEFuIGFycmF5IG9mIGhlaWdodHMgb2YgY2hpbGRyZW4gd2l0aGluIEVxdWFsaXplciBjb250YWluZXIgZ3JvdXBlZCBieSByb3cgd2l0aCBlbGVtZW50LGhlaWdodCBhbmQgbWF4IGFzIGxhc3QgY2hpbGRcclxuICAgKi9cclxuICBFcXVhbGl6ZXIucHJvdG90eXBlLmdldEhlaWdodHNCeVJvdyA9IGZ1bmN0aW9uKGNiKSB7XHJcbiAgICB2YXIgbGFzdEVsVG9wT2Zmc2V0ID0gdGhpcy4kd2F0Y2hlZC5maXJzdCgpLm9mZnNldCgpLnRvcCxcclxuICAgICAgICBncm91cHMgPSBbXSxcclxuICAgICAgICBncm91cCA9IDA7XHJcbiAgICAvL2dyb3VwIGJ5IFJvd1xyXG4gICAgZ3JvdXBzW2dyb3VwXSA9IFtdO1xyXG4gICAgZm9yKHZhciBpID0gMCwgbGVuID0gdGhpcy4kd2F0Y2hlZC5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcbiAgICAgIHRoaXMuJHdhdGNoZWRbaV0uc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nO1xyXG4gICAgICAvL21heWJlIGNvdWxkIHVzZSB0aGlzLiR3YXRjaGVkW2ldLm9mZnNldFRvcFxyXG4gICAgICB2YXIgZWxPZmZzZXRUb3AgPSAkKHRoaXMuJHdhdGNoZWRbaV0pLm9mZnNldCgpLnRvcDtcclxuICAgICAgaWYgKGVsT2Zmc2V0VG9wIT1sYXN0RWxUb3BPZmZzZXQpIHtcclxuICAgICAgICBncm91cCsrO1xyXG4gICAgICAgIGdyb3Vwc1tncm91cF0gPSBbXTtcclxuICAgICAgICBsYXN0RWxUb3BPZmZzZXQ9ZWxPZmZzZXRUb3A7XHJcbiAgICAgIH1cclxuICAgICAgZ3JvdXBzW2dyb3VwXS5wdXNoKFt0aGlzLiR3YXRjaGVkW2ldLHRoaXMuJHdhdGNoZWRbaV0ub2Zmc2V0SGVpZ2h0XSk7XHJcbiAgICB9XHJcblxyXG4gICAgZm9yICh2YXIgaiA9IDAsIGxuID0gZ3JvdXBzLmxlbmd0aDsgaiA8IGxuOyBqKyspIHtcclxuICAgICAgdmFyIGhlaWdodHMgPSAkKGdyb3Vwc1tqXSkubWFwKGZ1bmN0aW9uKCl7IHJldHVybiB0aGlzWzFdOyB9KS5nZXQoKTtcclxuICAgICAgdmFyIG1heCAgICAgICAgID0gTWF0aC5tYXguYXBwbHkobnVsbCwgaGVpZ2h0cyk7XHJcbiAgICAgIGdyb3Vwc1tqXS5wdXNoKG1heCk7XHJcbiAgICB9XHJcbiAgICBjYihncm91cHMpO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogQ2hhbmdlcyB0aGUgQ1NTIGhlaWdodCBwcm9wZXJ0eSBvZiBlYWNoIGNoaWxkIGluIGFuIEVxdWFsaXplciBwYXJlbnQgdG8gbWF0Y2ggdGhlIHRhbGxlc3RcclxuICAgKiBAcGFyYW0ge2FycmF5fSBoZWlnaHRzIC0gQW4gYXJyYXkgb2YgaGVpZ2h0cyBvZiBjaGlsZHJlbiB3aXRoaW4gRXF1YWxpemVyIGNvbnRhaW5lclxyXG4gICAqIEBmaXJlcyBFcXVhbGl6ZXIjcHJlZXF1YWxpemVkXHJcbiAgICogQGZpcmVzIEVxdWFsaXplciNwb3N0ZXF1YWxpemVkXHJcbiAgICovXHJcbiAgRXF1YWxpemVyLnByb3RvdHlwZS5hcHBseUhlaWdodCA9IGZ1bmN0aW9uKGhlaWdodHMpe1xyXG4gICAgdmFyIG1heCA9IE1hdGgubWF4LmFwcGx5KG51bGwsIGhlaWdodHMpO1xyXG4gICAgLyoqXHJcbiAgICAgKiBGaXJlcyBiZWZvcmUgdGhlIGhlaWdodHMgYXJlIGFwcGxpZWRcclxuICAgICAqIEBldmVudCBFcXVhbGl6ZXIjcHJlZXF1YWxpemVkXHJcbiAgICAgKi9cclxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcigncHJlZXF1YWxpemVkLnpmLmVxdWFsaXplcicpO1xyXG5cclxuICAgIHRoaXMuJHdhdGNoZWQuY3NzKCdoZWlnaHQnLCBtYXgpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmlyZXMgd2hlbiB0aGUgaGVpZ2h0cyBoYXZlIGJlZW4gYXBwbGllZFxyXG4gICAgICogQGV2ZW50IEVxdWFsaXplciNwb3N0ZXF1YWxpemVkXHJcbiAgICAgKi9cclxuICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3Bvc3RlcXVhbGl6ZWQuemYuZXF1YWxpemVyJyk7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiBDaGFuZ2VzIHRoZSBDU1MgaGVpZ2h0IHByb3BlcnR5IG9mIGVhY2ggY2hpbGQgaW4gYW4gRXF1YWxpemVyIHBhcmVudCB0byBtYXRjaCB0aGUgdGFsbGVzdCBieSByb3dcclxuICAgKiBAcGFyYW0ge2FycmF5fSBncm91cHMgLSBBbiBhcnJheSBvZiBoZWlnaHRzIG9mIGNoaWxkcmVuIHdpdGhpbiBFcXVhbGl6ZXIgY29udGFpbmVyIGdyb3VwZWQgYnkgcm93IHdpdGggZWxlbWVudCxoZWlnaHQgYW5kIG1heCBhcyBsYXN0IGNoaWxkXHJcbiAgICogQGZpcmVzIEVxdWFsaXplciNwcmVlcXVhbGl6ZWRcclxuICAgKiBAZmlyZXMgRXF1YWxpemVyI3ByZWVxdWFsaXplZFJvd1xyXG4gICAqIEBmaXJlcyBFcXVhbGl6ZXIjcG9zdGVxdWFsaXplZFJvd1xyXG4gICAqIEBmaXJlcyBFcXVhbGl6ZXIjcG9zdGVxdWFsaXplZFxyXG4gICAqL1xyXG4gIEVxdWFsaXplci5wcm90b3R5cGUuYXBwbHlIZWlnaHRCeVJvdyA9IGZ1bmN0aW9uKGdyb3Vwcyl7XHJcbiAgICAvKipcclxuICAgICAqIEZpcmVzIGJlZm9yZSB0aGUgaGVpZ2h0cyBhcmUgYXBwbGllZFxyXG4gICAgICovXHJcbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3ByZWVxdWFsaXplZC56Zi5lcXVhbGl6ZXInKTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBncm91cHMubGVuZ3RoOyBpIDwgbGVuIDsgaSsrKSB7XHJcbiAgICAgIHZhciBncm91cHNJTGVuZ3RoID0gZ3JvdXBzW2ldLmxlbmd0aCxcclxuICAgICAgICAgIG1heCA9IGdyb3Vwc1tpXVtncm91cHNJTGVuZ3RoIC0gMV07XHJcbiAgICAgIGlmIChncm91cHNJTGVuZ3RoPD0yKSB7XHJcbiAgICAgICAgJChncm91cHNbaV1bMF1bMF0pLmNzcyh7J2hlaWdodCc6J2F1dG8nfSk7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuICAgICAgLyoqXHJcbiAgICAgICAgKiBGaXJlcyBiZWZvcmUgdGhlIGhlaWdodHMgcGVyIHJvdyBhcmUgYXBwbGllZFxyXG4gICAgICAgICogQGV2ZW50IEVxdWFsaXplciNwcmVlcXVhbGl6ZWRSb3dcclxuICAgICAgICAqL1xyXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3ByZWVxdWFsaXplZHJvdy56Zi5lcXVhbGl6ZXInKTtcclxuICAgICAgZm9yICh2YXIgaiA9IDAsIGxlbkogPSAoZ3JvdXBzSUxlbmd0aC0xKTsgaiA8IGxlbkogOyBqKyspIHtcclxuICAgICAgICAkKGdyb3Vwc1tpXVtqXVswXSkuY3NzKHsnaGVpZ2h0JzptYXh9KTtcclxuICAgICAgfVxyXG4gICAgICAvKipcclxuICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIGhlaWdodHMgcGVyIHJvdyBoYXZlIGJlZW4gYXBwbGllZFxyXG4gICAgICAgICogQGV2ZW50IEVxdWFsaXplciNwb3N0ZXF1YWxpemVkUm93XHJcbiAgICAgICAgKi9cclxuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdwb3N0ZXF1YWxpemVkcm93LnpmLmVxdWFsaXplcicpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSBoZWlnaHRzIGhhdmUgYmVlbiBhcHBsaWVkXHJcbiAgICAgKi9cclxuICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3Bvc3RlcXVhbGl6ZWQuemYuZXF1YWxpemVyJyk7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiBEZXN0cm95cyBhbiBpbnN0YW5jZSBvZiBFcXVhbGl6ZXIuXHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICovXHJcbiAgRXF1YWxpemVyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKXtcclxuICAgIHRoaXMuX3BhdXNlRXZlbnRzKCk7XHJcbiAgICB0aGlzLiR3YXRjaGVkLmNzcygnaGVpZ2h0JywgJ2F1dG8nKTtcclxuXHJcbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XHJcbiAgfTtcclxuXHJcbiAgRm91bmRhdGlvbi5wbHVnaW4oRXF1YWxpemVyLCAnRXF1YWxpemVyJyk7XHJcblxyXG4gIC8vIEV4cG9ydHMgZm9yIEFNRC9Ccm93c2VyaWZ5XHJcbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEVxdWFsaXplcjtcclxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJylcclxuICAgIGRlZmluZShbJ2ZvdW5kYXRpb24nXSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiBFcXVhbGl6ZXI7XHJcbiAgICB9KTtcclxuXHJcbn0oRm91bmRhdGlvbiwgalF1ZXJ5KTtcclxuIiwiLyoqXHJcbiAqIEludGVyY2hhbmdlIG1vZHVsZS5cclxuICogQG1vZHVsZSBmb3VuZGF0aW9uLmludGVyY2hhbmdlXHJcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubWVkaWFRdWVyeVxyXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLnRpbWVyQW5kSW1hZ2VMb2FkZXJcclxuICovXHJcbiFmdW5jdGlvbihGb3VuZGF0aW9uLCAkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIEludGVyY2hhbmdlLlxyXG4gICAqIEBjbGFzc1xyXG4gICAqIEBmaXJlcyBJbnRlcmNoYW5nZSNpbml0XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIGFkZCB0aGUgdHJpZ2dlciB0by5cclxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gSW50ZXJjaGFuZ2UoZWxlbWVudCwgb3B0aW9ucykge1xyXG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgSW50ZXJjaGFuZ2UuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG4gICAgdGhpcy5ydWxlcyA9IFtdO1xyXG4gICAgdGhpcy5jdXJyZW50UGF0aCA9ICcnO1xyXG5cclxuICAgIHRoaXMuX2luaXQoKTtcclxuICAgIHRoaXMuX2V2ZW50cygpO1xyXG5cclxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ0ludGVyY2hhbmdlJyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZWZhdWx0IHNldHRpbmdzIGZvciBwbHVnaW5cclxuICAgKi9cclxuICBJbnRlcmNoYW5nZS5kZWZhdWx0cyA9IHtcclxuICAgIC8qKlxyXG4gICAgICogUnVsZXMgdG8gYmUgYXBwbGllZCB0byBJbnRlcmNoYW5nZSBlbGVtZW50cy4gU2V0IHdpdGggdGhlIGBkYXRhLWludGVyY2hhbmdlYCBhcnJheSBub3RhdGlvbi5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqL1xyXG4gICAgcnVsZXM6IG51bGxcclxuICB9O1xyXG5cclxuICBJbnRlcmNoYW5nZS5TUEVDSUFMX1FVRVJJRVMgPSB7XHJcbiAgICAnbGFuZHNjYXBlJzogJ3NjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBsYW5kc2NhcGUpJyxcclxuICAgICdwb3J0cmFpdCc6ICdzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogcG9ydHJhaXQpJyxcclxuICAgICdyZXRpbmEnOiAnb25seSBzY3JlZW4gYW5kICgtd2Via2l0LW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCBvbmx5IHNjcmVlbiBhbmQgKG1pbi0tbW96LWRldmljZS1waXhlbC1yYXRpbzogMiksIG9ubHkgc2NyZWVuIGFuZCAoLW8tbWluLWRldmljZS1waXhlbC1yYXRpbzogMi8xKSwgb25seSBzY3JlZW4gYW5kIChtaW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwgb25seSBzY3JlZW4gYW5kIChtaW4tcmVzb2x1dGlvbjogMTkyZHBpKSwgb25seSBzY3JlZW4gYW5kIChtaW4tcmVzb2x1dGlvbjogMmRwcHgpJ1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEluaXRpYWxpemVzIHRoZSBJbnRlcmNoYW5nZSBwbHVnaW4gYW5kIGNhbGxzIGZ1bmN0aW9ucyB0byBnZXQgaW50ZXJjaGFuZ2UgZnVuY3Rpb25pbmcgb24gbG9hZC5cclxuICAgKiBAZnVuY3Rpb25cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIEludGVyY2hhbmdlLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5fYWRkQnJlYWtwb2ludHMoKTtcclxuICAgIHRoaXMuX2dlbmVyYXRlUnVsZXMoKTtcclxuICAgIHRoaXMuX3JlZmxvdygpO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEluaXRpYWxpemVzIGV2ZW50cyBmb3IgSW50ZXJjaGFuZ2UuXHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBJbnRlcmNoYW5nZS5wcm90b3R5cGUuX2V2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuemYuaW50ZXJjaGFuZ2UnLCBGb3VuZGF0aW9uLnV0aWwudGhyb3R0bGUodGhpcy5fcmVmbG93LmJpbmQodGhpcyksIDUwKSk7XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgbmVjZXNzYXJ5IGZ1bmN0aW9ucyB0byB1cGRhdGUgSW50ZXJjaGFuZ2UgdXBvbiBET00gY2hhbmdlXHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBJbnRlcmNoYW5nZS5wcm90b3R5cGUuX3JlZmxvdyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG1hdGNoO1xyXG5cclxuICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBlYWNoIHJ1bGUsIGJ1dCBvbmx5IHNhdmUgdGhlIGxhc3QgbWF0Y2hcclxuICAgIGZvciAodmFyIGkgaW4gdGhpcy5ydWxlcykge1xyXG4gICAgICB2YXIgcnVsZSA9IHRoaXMucnVsZXNbaV07XHJcblxyXG4gICAgICBpZiAod2luZG93Lm1hdGNoTWVkaWEocnVsZS5xdWVyeSkubWF0Y2hlcykge1xyXG4gICAgICAgIG1hdGNoID0gcnVsZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChtYXRjaCkge1xyXG4gICAgICB0aGlzLnJlcGxhY2UobWF0Y2gucGF0aCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgRm91bmRhdGlvbiBicmVha3BvaW50cyBhbmQgYWRkcyB0aGVtIHRvIHRoZSBJbnRlcmNoYW5nZS5TUEVDSUFMX1FVRVJJRVMgb2JqZWN0LlxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgSW50ZXJjaGFuZ2UucHJvdG90eXBlLl9hZGRCcmVha3BvaW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgZm9yICh2YXIgaSBpbiBGb3VuZGF0aW9uLk1lZGlhUXVlcnkucXVlcmllcykge1xyXG4gICAgICB2YXIgcXVlcnkgPSBGb3VuZGF0aW9uLk1lZGlhUXVlcnkucXVlcmllc1tpXTtcclxuICAgICAgSW50ZXJjaGFuZ2UuU1BFQ0lBTF9RVUVSSUVTW3F1ZXJ5Lm5hbWVdID0gcXVlcnkudmFsdWU7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2tzIHRoZSBJbnRlcmNoYW5nZSBlbGVtZW50IGZvciB0aGUgcHJvdmlkZWQgbWVkaWEgcXVlcnkgKyBjb250ZW50IHBhaXJpbmdzXHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdGhhdCBpcyBhbiBJbnRlcmNoYW5nZSBpbnN0YW5jZVxyXG4gICAqIEByZXR1cm5zIHtBcnJheX0gc2NlbmFyaW9zIC0gQXJyYXkgb2Ygb2JqZWN0cyB0aGF0IGhhdmUgJ21xJyBhbmQgJ3BhdGgnIGtleXMgd2l0aCBjb3JyZXNwb25kaW5nIGtleXNcclxuICAgKi9cclxuICBJbnRlcmNoYW5nZS5wcm90b3R5cGUuX2dlbmVyYXRlUnVsZXMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBydWxlc0xpc3QgPSBbXTtcclxuICAgIHZhciBydWxlcztcclxuXHJcbiAgICBpZiAodGhpcy5vcHRpb25zLnJ1bGVzKSB7XHJcbiAgICAgIHJ1bGVzID0gdGhpcy5vcHRpb25zLnJ1bGVzO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJ1bGVzID0gdGhpcy4kZWxlbWVudC5kYXRhKCdpbnRlcmNoYW5nZScpLm1hdGNoKC9cXFsuKj9cXF0vZyk7XHJcbiAgICB9XHJcblxyXG4gICAgZm9yICh2YXIgaSBpbiBydWxlcykge1xyXG4gICAgICB2YXIgcnVsZSA9IHJ1bGVzW2ldLnNsaWNlKDEsIC0xKS5zcGxpdCgnLCAnKTtcclxuICAgICAgdmFyIHBhdGggPSBydWxlLnNsaWNlKDAsIC0xKS5qb2luKCcnKTtcclxuICAgICAgdmFyIHF1ZXJ5ID0gcnVsZVtydWxlLmxlbmd0aCAtIDFdO1xyXG5cclxuICAgICAgaWYgKEludGVyY2hhbmdlLlNQRUNJQUxfUVVFUklFU1txdWVyeV0pIHtcclxuICAgICAgICBxdWVyeSA9IEludGVyY2hhbmdlLlNQRUNJQUxfUVVFUklFU1txdWVyeV07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJ1bGVzTGlzdC5wdXNoKHtcclxuICAgICAgICBwYXRoOiBwYXRoLFxyXG4gICAgICAgIHF1ZXJ5OiBxdWVyeVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJ1bGVzID0gcnVsZXNMaXN0O1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB0aGUgYHNyY2AgcHJvcGVydHkgb2YgYW4gaW1hZ2UsIG9yIGNoYW5nZSB0aGUgSFRNTCBvZiBhIGNvbnRhaW5lciwgdG8gdGhlIHNwZWNpZmllZCBwYXRoLlxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIC0gUGF0aCB0byB0aGUgaW1hZ2Ugb3IgSFRNTCBwYXJ0aWFsLlxyXG4gICAqIEBmaXJlcyBJbnRlcmNoYW5nZSNyZXBsYWNlZFxyXG4gICAqL1xyXG4gIEludGVyY2hhbmdlLnByb3RvdHlwZS5yZXBsYWNlID0gZnVuY3Rpb24ocGF0aCkge1xyXG4gICAgaWYgKHRoaXMuY3VycmVudFBhdGggPT09IHBhdGgpIHJldHVybjtcclxuXHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzLFxyXG4gICAgICAgIHRyaWdnZXIgPSAncmVwbGFjZWQuemYuaW50ZXJjaGFuZ2UnO1xyXG5cclxuICAgIC8vIFJlcGxhY2luZyBpbWFnZXNcclxuICAgIGlmICh0aGlzLiRlbGVtZW50WzBdLm5vZGVOYW1lID09PSAnSU1HJykge1xyXG4gICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ3NyYycsIHBhdGgpLmxvYWQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgX3RoaXMuY3VycmVudFBhdGggPSBwYXRoO1xyXG4gICAgICB9KVxyXG4gICAgICAudHJpZ2dlcih0cmlnZ2VyKTtcclxuICAgIH1cclxuICAgIC8vIFJlcGxhY2luZyBiYWNrZ3JvdW5kIGltYWdlc1xyXG4gICAgZWxzZSBpZiAocGF0aC5tYXRjaCgvXFwuKGdpZnxqcGd8anBlZ3x0aWZmfHBuZykoWz8jXS4qKT8vaSkpIHtcclxuICAgICAgdGhpcy4kZWxlbWVudC5jc3MoeyAnYmFja2dyb3VuZC1pbWFnZSc6ICd1cmwoJytwYXRoKycpJyB9KVxyXG4gICAgICAgICAgLnRyaWdnZXIodHJpZ2dlcik7XHJcbiAgICB9XHJcbiAgICAvLyBSZXBsYWNpbmcgSFRNTFxyXG4gICAgZWxzZSB7XHJcbiAgICAgICQuZ2V0KHBhdGgsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgX3RoaXMuJGVsZW1lbnQuaHRtbChyZXNwb25zZSlcclxuICAgICAgICAgICAgIC50cmlnZ2VyKHRyaWdnZXIpO1xyXG4gICAgICAgICQocmVzcG9uc2UpLmZvdW5kYXRpb24oKTtcclxuICAgICAgICBfdGhpcy5jdXJyZW50UGF0aCA9IHBhdGg7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmlyZXMgd2hlbiBjb250ZW50IGluIGFuIEludGVyY2hhbmdlIGVsZW1lbnQgaXMgZG9uZSBiZWluZyBsb2FkZWQuXHJcbiAgICAgKiBAZXZlbnQgSW50ZXJjaGFuZ2UjcmVwbGFjZWRcclxuICAgICAqL1xyXG4gICAgLy8gdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdyZXBsYWNlZC56Zi5pbnRlcmNoYW5nZScpO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogRGVzdHJveXMgYW4gaW5zdGFuY2Ugb2YgaW50ZXJjaGFuZ2UuXHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICovXHJcbiAgSW50ZXJjaGFuZ2UucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpe1xyXG4gICAgLy9UT0RPIHRoaXMuXHJcbiAgfTtcclxuICBGb3VuZGF0aW9uLnBsdWdpbihJbnRlcmNoYW5nZSwgJ0ludGVyY2hhbmdlJyk7XHJcblxyXG4gIC8vIEV4cG9ydHMgZm9yIEFNRC9Ccm93c2VyaWZ5XHJcbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEludGVyY2hhbmdlO1xyXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nKVxyXG4gICAgZGVmaW5lKFsnZm91bmRhdGlvbiddLCBmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuIEludGVyY2hhbmdlO1xyXG4gICAgfSk7XHJcblxyXG59KEZvdW5kYXRpb24sIGpRdWVyeSk7XHJcbiIsIi8qKlxyXG4gKiBNYWdlbGxhbiBtb2R1bGUuXHJcbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5tYWdlbGxhblxyXG4gKi9cclxuIWZ1bmN0aW9uKEZvdW5kYXRpb24sICQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgTWFnZWxsYW4uXHJcbiAgICogQGNsYXNzXHJcbiAgICogQGZpcmVzIE1hZ2VsbGFuI2luaXRcclxuICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gYWRkIHRoZSB0cmlnZ2VyIHRvLlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cclxuICAgKi9cclxuICBmdW5jdGlvbiBNYWdlbGxhbihlbGVtZW50LCBvcHRpb25zKSB7XHJcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcclxuICAgIHRoaXMub3B0aW9ucyAgPSAkLmV4dGVuZCh7fSwgTWFnZWxsYW4uZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcclxuXHJcbiAgICB0aGlzLl9pbml0KCk7XHJcblxyXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnTWFnZWxsYW4nKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERlZmF1bHQgc2V0dGluZ3MgZm9yIHBsdWdpblxyXG4gICAqL1xyXG4gIE1hZ2VsbGFuLmRlZmF1bHRzID0ge1xyXG4gICAgLyoqXHJcbiAgICAgKiBBbW91bnQgb2YgdGltZSwgaW4gbXMsIHRoZSBhbmltYXRlZCBzY3JvbGxpbmcgc2hvdWxkIHRha2UgYmV0d2VlbiBsb2NhdGlvbnMuXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKiBAZXhhbXBsZSA1MDBcclxuICAgICAqL1xyXG4gICAgYW5pbWF0aW9uRHVyYXRpb246IDUwMCxcclxuICAgIC8qKlxyXG4gICAgICogQW5pbWF0aW9uIHN0eWxlIHRvIHVzZSB3aGVuIHNjcm9sbGluZyBiZXR3ZWVuIGxvY2F0aW9ucy5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlICdlYXNlLWluLW91dCdcclxuICAgICAqL1xyXG4gICAgYW5pbWF0aW9uRWFzaW5nOiAnbGluZWFyJyxcclxuICAgIC8qKlxyXG4gICAgICogTnVtYmVyIG9mIHBpeGVscyB0byB1c2UgYXMgYSBtYXJrZXIgZm9yIGxvY2F0aW9uIGNoYW5nZXMuXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKiBAZXhhbXBsZSA1MFxyXG4gICAgICovXHJcbiAgICB0aHJlc2hvbGQ6IDUwLFxyXG4gICAgLyoqXHJcbiAgICAgKiBDbGFzcyBhcHBsaWVkIHRvIHRoZSBhY3RpdmUgbG9jYXRpb25zIGxpbmsgb24gdGhlIG1hZ2VsbGFuIGNvbnRhaW5lci5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlICdhY3RpdmUnXHJcbiAgICAgKi9cclxuICAgIGFjdGl2ZUNsYXNzOiAnYWN0aXZlJyxcclxuICAgIC8qKlxyXG4gICAgICogQWxsb3dzIHRoZSBzY3JpcHQgdG8gbWFuaXB1bGF0ZSB0aGUgdXJsIG9mIHRoZSBjdXJyZW50IHBhZ2UsIGFuZCBpZiBzdXBwb3J0ZWQsIGFsdGVyIHRoZSBoaXN0b3J5LlxyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgdHJ1ZVxyXG4gICAgICovXHJcbiAgICBkZWVwTGlua2luZzogZmFsc2UsXHJcbiAgICAvKipcclxuICAgICAqIE51bWJlciBvZiBwaXhlbHMgdG8gb2Zmc2V0IHRoZSBzY3JvbGwgb2YgdGhlIHBhZ2Ugb24gaXRlbSBjbGljayBpZiB1c2luZyBhIHN0aWNreSBuYXYgYmFyLlxyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgMjVcclxuICAgICAqL1xyXG4gICAgYmFyT2Zmc2V0OiAwXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogSW5pdGlhbGl6ZXMgdGhlIE1hZ2VsbGFuIHBsdWdpbiBhbmQgY2FsbHMgZnVuY3Rpb25zIHRvIGdldCBlcXVhbGl6ZXIgZnVuY3Rpb25pbmcgb24gbG9hZC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIE1hZ2VsbGFuLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGlkID0gdGhpcy4kZWxlbWVudFswXS5pZCB8fCBGb3VuZGF0aW9uLkdldFlvRGlnaXRzKDYsICdtYWdlbGxhbicpLFxyXG4gICAgICAgIF90aGlzID0gdGhpcztcclxuICAgIHRoaXMuJHRhcmdldHMgPSAkKCdbZGF0YS1tYWdlbGxhbi10YXJnZXRdJyk7XHJcbiAgICB0aGlzLiRsaW5rcyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnYScpO1xyXG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKHtcclxuICAgICAgJ2RhdGEtcmVzaXplJzogaWQsXHJcbiAgICAgICdkYXRhLXNjcm9sbCc6IGlkLFxyXG4gICAgICAnaWQnOiBpZFxyXG4gICAgfSk7XHJcbiAgICB0aGlzLiRhY3RpdmUgPSAkKCk7XHJcbiAgICB0aGlzLnNjcm9sbFBvcyA9IHBhcnNlSW50KHdpbmRvdy5wYWdlWU9mZnNldCwgMTApO1xyXG5cclxuICAgIHRoaXMuX2V2ZW50cygpO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogQ2FsY3VsYXRlcyBhbiBhcnJheSBvZiBwaXhlbCB2YWx1ZXMgdGhhdCBhcmUgdGhlIGRlbWFyY2F0aW9uIGxpbmVzIGJldHdlZW4gbG9jYXRpb25zIG9uIHRoZSBwYWdlLlxyXG4gICAqIENhbiBiZSBpbnZva2VkIGlmIG5ldyBlbGVtZW50cyBhcmUgYWRkZWQgb3IgdGhlIHNpemUgb2YgYSBsb2NhdGlvbiBjaGFuZ2VzLlxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqL1xyXG4gIE1hZ2VsbGFuLnByb3RvdHlwZS5jYWxjUG9pbnRzID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBfdGhpcyA9IHRoaXMsXHJcbiAgICAgICAgYm9keSA9IGRvY3VtZW50LmJvZHksXHJcbiAgICAgICAgaHRtbCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcclxuXHJcbiAgICB0aGlzLnBvaW50cyA9IFtdO1xyXG4gICAgdGhpcy53aW5IZWlnaHQgPSBNYXRoLnJvdW5kKE1hdGgubWF4KHdpbmRvdy5pbm5lckhlaWdodCwgaHRtbC5jbGllbnRIZWlnaHQpKTtcclxuICAgIHRoaXMuZG9jSGVpZ2h0ID0gTWF0aC5yb3VuZChNYXRoLm1heChib2R5LnNjcm9sbEhlaWdodCwgYm9keS5vZmZzZXRIZWlnaHQsIGh0bWwuY2xpZW50SGVpZ2h0LCBodG1sLnNjcm9sbEhlaWdodCwgaHRtbC5vZmZzZXRIZWlnaHQpKTtcclxuXHJcbiAgICB0aGlzLiR0YXJnZXRzLmVhY2goZnVuY3Rpb24oKXtcclxuICAgICAgdmFyICR0YXIgPSAkKHRoaXMpLFxyXG4gICAgICAgICAgcHQgPSBNYXRoLnJvdW5kKCR0YXIub2Zmc2V0KCkudG9wIC0gX3RoaXMub3B0aW9ucy50aHJlc2hvbGQpO1xyXG4gICAgICAkdGFyLnRhcmdldFBvaW50ID0gcHQ7XHJcbiAgICAgIF90aGlzLnBvaW50cy5wdXNoKHB0KTtcclxuICAgIH0pO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogSW5pdGlhbGl6ZXMgZXZlbnRzIGZvciBNYWdlbGxhbi5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIE1hZ2VsbGFuLnByb3RvdHlwZS5fZXZlbnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzLFxyXG4gICAgICAgICRib2R5ID0gJCgnaHRtbCwgYm9keScpLFxyXG4gICAgICAgIG9wdHMgPSB7XHJcbiAgICAgICAgICBkdXJhdGlvbjogX3RoaXMub3B0aW9ucy5hbmltYXRpb25EdXJhdGlvbixcclxuICAgICAgICAgIGVhc2luZzogICBfdGhpcy5vcHRpb25zLmFuaW1hdGlvbkVhc2luZ1xyXG4gICAgICAgIH07XHJcbiAgICAkKHdpbmRvdykub25lKCdsb2FkJywgZnVuY3Rpb24oKXtcclxuICAgICAgaWYoX3RoaXMub3B0aW9ucy5kZWVwTGlua2luZyl7XHJcbiAgICAgICAgaWYobG9jYXRpb24uaGFzaCl7XHJcbiAgICAgICAgICBfdGhpcy5zY3JvbGxUb0xvYyhsb2NhdGlvbi5oYXNoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgX3RoaXMuY2FsY1BvaW50cygpO1xyXG4gICAgICBfdGhpcy5fdXBkYXRlQWN0aXZlKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLiRlbGVtZW50Lm9uKHtcclxuICAgICAgJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInOiB0aGlzLnJlZmxvdy5iaW5kKHRoaXMpLFxyXG4gICAgICAnc2Nyb2xsbWUuemYudHJpZ2dlcic6IHRoaXMuX3VwZGF0ZUFjdGl2ZS5iaW5kKHRoaXMpXHJcbiAgICB9KS5vbignY2xpY2suemYubWFnZWxsYW4nLCAnYVtocmVmXj1cIiNcIl0nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHZhciBhcnJpdmFsICAgPSB0aGlzLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xyXG4gICAgICAgIF90aGlzLnNjcm9sbFRvTG9jKGFycml2YWwpO1xyXG4gICAgfSk7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiBGdW5jdGlvbiB0byBzY3JvbGwgdG8gYSBnaXZlbiBsb2NhdGlvbiBvbiB0aGUgcGFnZS5cclxuICAgKiBAcGFyYW0ge1N0cmluZ30gbG9jIC0gYSBwcm9wZXJseSBmb3JtYXR0ZWQgalF1ZXJ5IGlkIHNlbGVjdG9yLlxyXG4gICAqIEBleGFtcGxlICcjZm9vJ1xyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqL1xyXG4gIE1hZ2VsbGFuLnByb3RvdHlwZS5zY3JvbGxUb0xvYyA9IGZ1bmN0aW9uKGxvYyl7XHJcbiAgICB2YXIgc2Nyb2xsUG9zID0gJChsb2MpLm9mZnNldCgpLnRvcCAtIHRoaXMub3B0aW9ucy50aHJlc2hvbGQgLyAyIC0gdGhpcy5vcHRpb25zLmJhck9mZnNldDtcclxuXHJcbiAgICAkKGRvY3VtZW50LmJvZHkpLnN0b3AodHJ1ZSkuYW5pbWF0ZSh7XHJcbiAgICAgICAgc2Nyb2xsVG9wOiBzY3JvbGxQb3NcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGR1cmF0aW9uOiB0aGlzLm9wdGlvbnMuYW5pbWF0aW9uRHVyYXRpb24sXHJcbiAgICAgICAgZWFzaWluZzogdGhpcy5vcHRpb25zLmFuaW1hdGlvbkVhc2luZ1xyXG4gICAgIH0pO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgbmVjZXNzYXJ5IGZ1bmN0aW9ucyB0byB1cGRhdGUgTWFnZWxsYW4gdXBvbiBET00gY2hhbmdlXHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICovXHJcbiAgTWFnZWxsYW4ucHJvdG90eXBlLnJlZmxvdyA9IGZ1bmN0aW9uKCl7XHJcbiAgICB0aGlzLmNhbGNQb2ludHMoKTtcclxuICAgIHRoaXMuX3VwZGF0ZUFjdGl2ZSgpO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogVXBkYXRlcyB0aGUgdmlzaWJpbGl0eSBvZiBhbiBhY3RpdmUgbG9jYXRpb24gbGluaywgYW5kIHVwZGF0ZXMgdGhlIHVybCBoYXNoIGZvciB0aGUgcGFnZSwgaWYgZGVlcExpbmtpbmcgZW5hYmxlZC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqIEBmaXJlcyBNYWdlbGxhbiN1cGRhdGVcclxuICAgKi9cclxuICBNYWdlbGxhbi5wcm90b3R5cGUuX3VwZGF0ZUFjdGl2ZSA9IGZ1bmN0aW9uKC8qZXZ0LCBlbGVtLCBzY3JvbGxQb3MqLyl7XHJcbiAgICB2YXIgd2luUG9zID0gLypzY3JvbGxQb3MgfHwqLyBwYXJzZUludCh3aW5kb3cucGFnZVlPZmZzZXQsIDEwKSxcclxuICAgICAgICBjdXJJZHg7XHJcblxyXG4gICAgaWYod2luUG9zICsgdGhpcy53aW5IZWlnaHQgPT09IHRoaXMuZG9jSGVpZ2h0KXsgY3VySWR4ID0gdGhpcy5wb2ludHMubGVuZ3RoIC0gMTsgfVxyXG4gICAgZWxzZSBpZih3aW5Qb3MgPCB0aGlzLnBvaW50c1swXSl7IGN1cklkeCA9IDA7IH1cclxuICAgIGVsc2V7XHJcbiAgICAgIHZhciBpc0Rvd24gPSB0aGlzLnNjcm9sbFBvcyA8IHdpblBvcyxcclxuICAgICAgICAgIF90aGlzID0gdGhpcyxcclxuICAgICAgICAgIGN1clZpc2libGUgPSB0aGlzLnBvaW50cy5maWx0ZXIoZnVuY3Rpb24ocCwgaSl7XHJcbiAgICAgICAgICAgIHJldHVybiBpc0Rvd24gPyBwIDw9IHdpblBvcyA6IHAgLSBfdGhpcy5vcHRpb25zLnRocmVzaG9sZCA8PSB3aW5Qb3M7Ly8mJiB3aW5Qb3MgPj0gX3RoaXMucG9pbnRzW2kgLTFdIC0gX3RoaXMub3B0aW9ucy50aHJlc2hvbGQ7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgY3VySWR4ID0gY3VyVmlzaWJsZS5sZW5ndGggPyBjdXJWaXNpYmxlLmxlbmd0aCAtIDEgOiAwO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuJGFjdGl2ZS5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuYWN0aXZlQ2xhc3MpO1xyXG4gICAgdGhpcy4kYWN0aXZlID0gdGhpcy4kbGlua3MuZXEoY3VySWR4KS5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuYWN0aXZlQ2xhc3MpO1xyXG5cclxuICAgIGlmKHRoaXMub3B0aW9ucy5kZWVwTGlua2luZyl7XHJcbiAgICAgIHZhciBoYXNoID0gdGhpcy4kYWN0aXZlWzBdLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xyXG4gICAgICBpZih3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUpe1xyXG4gICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZShudWxsLCBudWxsLCBoYXNoKTtcclxuICAgICAgfWVsc2V7XHJcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBoYXNoO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zY3JvbGxQb3MgPSB3aW5Qb3M7XHJcbiAgICAvKipcclxuICAgICAqIEZpcmVzIHdoZW4gbWFnZWxsYW4gaXMgZmluaXNoZWQgdXBkYXRpbmcgdG8gdGhlIG5ldyBhY3RpdmUgZWxlbWVudC5cclxuICAgICAqIEBldmVudCBNYWdlbGxhbiN1cGRhdGVcclxuICAgICAqL1xyXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCd1cGRhdGUuemYubWFnZWxsYW4nLCBbdGhpcy4kYWN0aXZlXSk7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiBEZXN0cm95cyBhbiBpbnN0YW5jZSBvZiBNYWdlbGxhbiBhbmQgcmVzZXRzIHRoZSB1cmwgb2YgdGhlIHdpbmRvdy5cclxuICAgKiBAZnVuY3Rpb25cclxuICAgKi9cclxuICBNYWdlbGxhbi5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCl7XHJcbiAgICB0aGlzLiRlbGVtZW50Lm9mZignLnpmLnRyaWdnZXIgLnpmLm1hZ2VsbGFuJylcclxuICAgICAgICAuZmluZCgnLicgKyB0aGlzLm9wdGlvbnMuYWN0aXZlQ2xhc3MpLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5hY3RpdmVDbGFzcyk7XHJcblxyXG4gICAgaWYodGhpcy5vcHRpb25zLmRlZXBMaW5raW5nKXtcclxuICAgICAgdmFyIGhhc2ggPSB0aGlzLiRhY3RpdmVbMF0uZ2V0QXR0cmlidXRlKCdocmVmJyk7XHJcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoLnJlcGxhY2UoaGFzaCwgJycpO1xyXG4gICAgfVxyXG5cclxuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcclxuICB9O1xyXG4gIEZvdW5kYXRpb24ucGx1Z2luKE1hZ2VsbGFuLCAnTWFnZWxsYW4nKTtcclxuXHJcbiAgLy8gRXhwb3J0cyBmb3IgQU1EL0Jyb3dzZXJpZnlcclxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzICE9PSAndW5kZWZpbmVkJylcclxuICAgIG1vZHVsZS5leHBvcnRzID0gTWFnZWxsYW47XHJcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicpXHJcbiAgICBkZWZpbmUoWydmb3VuZGF0aW9uJ10sIGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gTWFnZWxsYW47XHJcbiAgICB9KTtcclxuXHJcbn0oRm91bmRhdGlvbiwgalF1ZXJ5KTtcclxuIiwiLyoqXHJcbiAqIE9mZkNhbnZhcyBtb2R1bGUuXHJcbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5vZmZjYW52YXNcclxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tZWRpYVF1ZXJ5XHJcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudHJpZ2dlcnNcclxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tb3Rpb25cclxuICovXHJcbiFmdW5jdGlvbigkLCBGb3VuZGF0aW9uKSB7XHJcblxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBhbiBvZmYtY2FudmFzIHdyYXBwZXIuXHJcbiAqIEBjbGFzc1xyXG4gKiBAZmlyZXMgT2ZmQ2FudmFzI2luaXRcclxuICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIGluaXRpYWxpemUuXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cclxuICovXHJcbmZ1bmN0aW9uIE9mZkNhbnZhcyhlbGVtZW50LCBvcHRpb25zKSB7XHJcbiAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIE9mZkNhbnZhcy5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xyXG4gIHRoaXMuJGxhc3RUcmlnZ2VyID0gJCgpO1xyXG5cclxuICB0aGlzLl9pbml0KCk7XHJcbiAgdGhpcy5fZXZlbnRzKCk7XHJcblxyXG4gIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ09mZkNhbnZhcycpO1xyXG59XHJcblxyXG5PZmZDYW52YXMuZGVmYXVsdHMgPSB7XHJcbiAgLyoqXHJcbiAgICogQWxsb3cgdGhlIHVzZXIgdG8gY2xpY2sgb3V0c2lkZSBvZiB0aGUgbWVudSB0byBjbG9zZSBpdC5cclxuICAgKiBAb3B0aW9uXHJcbiAgICogQGV4YW1wbGUgdHJ1ZVxyXG4gICAqL1xyXG4gIGNsb3NlT25DbGljazogdHJ1ZSxcclxuICAvKipcclxuICAgKiBBbW91bnQgb2YgdGltZSBpbiBtcyB0aGUgb3BlbiBhbmQgY2xvc2UgdHJhbnNpdGlvbiByZXF1aXJlcy4gSWYgbm9uZSBzZWxlY3RlZCwgcHVsbHMgZnJvbSBib2R5IHN0eWxlLlxyXG4gICAqIEBvcHRpb25cclxuICAgKiBAZXhhbXBsZSA1MDBcclxuICAgKi9cclxuICB0cmFuc2l0aW9uVGltZTogMCxcclxuICAvKipcclxuICAgKiBEaXJlY3Rpb24gdGhlIG9mZmNhbnZhcyBvcGVucyBmcm9tLiBEZXRlcm1pbmVzIGNsYXNzIGFwcGxpZWQgdG8gYm9keS5cclxuICAgKiBAb3B0aW9uXHJcbiAgICogQGV4YW1wbGUgbGVmdFxyXG4gICAqL1xyXG4gIHBvc2l0aW9uOiAnbGVmdCcsXHJcbiAgLyoqXHJcbiAgICogRm9yY2UgdGhlIHBhZ2UgdG8gc2Nyb2xsIHRvIHRvcCBvbiBvcGVuLlxyXG4gICAqL1xyXG4gIGZvcmNlVG9wOiB0cnVlLFxyXG4gIC8qKlxyXG4gICAqIEFsbG93IHRoZSBvZmZjYW52YXMgdG8gYmUgc3RpY2t5IHdoaWxlIG9wZW4uIERvZXMgbm90aGluZyBpZiBTYXNzIG9wdGlvbiBgJG1haW5jb250ZW50LXByZXZlbnQtc2Nyb2xsID09PSB0cnVlYC5cclxuICAgKiBQZXJmb3JtYW5jZSBpbiBTYWZhcmkgT1NYL2lPUyBpcyBub3QgZ3JlYXQuXHJcbiAgICovXHJcbiAgLy8gaXNTdGlja3k6IGZhbHNlLFxyXG4gIC8qKlxyXG4gICAqIEFsbG93IHRoZSBvZmZjYW52YXMgdG8gcmVtYWluIG9wZW4gZm9yIGNlcnRhaW4gYnJlYWtwb2ludHMuXHJcbiAgICogQG9wdGlvblxyXG4gICAqIEBleGFtcGxlIGZhbHNlXHJcbiAgICovXHJcbiAgaXNSZXZlYWxlZDogZmFsc2UsXHJcbiAgLyoqXHJcbiAgICogQnJlYWtwb2ludCBhdCB3aGljaCB0byByZXZlYWwuIEpTIHdpbGwgdXNlIGEgUmVnRXhwIHRvIHRhcmdldCBzdGFuZGFyZCBjbGFzc2VzLCBpZiBjaGFuZ2luZyBjbGFzc25hbWVzLCBwYXNzIHlvdXIgY2xhc3MgQGByZXZlYWxDbGFzc2AuXHJcbiAgICogQG9wdGlvblxyXG4gICAqIEBleGFtcGxlIHJldmVhbC1mb3ItbGFyZ2VcclxuICAgKi9cclxuICByZXZlYWxPbjogbnVsbCxcclxuICAvKipcclxuICAgKiBGb3JjZSBmb2N1cyB0byB0aGUgb2ZmY2FudmFzIG9uIG9wZW4uIElmIHRydWUsIHdpbGwgZm9jdXMgdGhlIG9wZW5pbmcgdHJpZ2dlciBvbiBjbG9zZS5cclxuICAgKiBAb3B0aW9uXHJcbiAgICogQGV4YW1wbGUgdHJ1ZVxyXG4gICAqL1xyXG4gIGF1dG9Gb2N1czogdHJ1ZSxcclxuICAvKipcclxuICAgKiBDbGFzcyB1c2VkIHRvIGZvcmNlIGFuIG9mZmNhbnZhcyB0byByZW1haW4gb3Blbi4gRm91bmRhdGlvbiBkZWZhdWx0cyBmb3IgdGhpcyBhcmUgYHJldmVhbC1mb3ItbGFyZ2VgICYgYHJldmVhbC1mb3ItbWVkaXVtYC5cclxuICAgKiBAb3B0aW9uXHJcbiAgICogVE9ETyBpbXByb3ZlIHRoZSByZWdleCB0ZXN0aW5nIGZvciB0aGlzLlxyXG4gICAqIEBleGFtcGxlIHJldmVhbC1mb3ItbGFyZ2VcclxuICAgKi9cclxuICByZXZlYWxDbGFzczogJ3JldmVhbC1mb3ItJyxcclxuICAvKipcclxuICAgKiBUcmlnZ2VycyBvcHRpb25hbCBmb2N1cyB0cmFwcGluZyB3aGVuIG9wZW5pbmcgYW4gb2ZmY2FudmFzLiBTZXRzIHRhYmluZGV4IG9mIFtkYXRhLW9mZi1jYW52YXMtY29udGVudF0gdG8gLTEgZm9yIGFjY2Vzc2liaWxpdHkgcHVycG9zZXMuXHJcbiAgICogQG9wdGlvblxyXG4gICAqIEBleGFtcGxlIHRydWVcclxuICAgKi9cclxuICB0cmFwRm9jdXM6IGZhbHNlXHJcbn07XHJcblxyXG4vKipcclxuICogSW5pdGlhbGl6ZXMgdGhlIG9mZi1jYW52YXMgd3JhcHBlciBieSBhZGRpbmcgdGhlIGV4aXQgb3ZlcmxheSAoaWYgbmVlZGVkKS5cclxuICogQGZ1bmN0aW9uXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5PZmZDYW52YXMucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIGlkID0gdGhpcy4kZWxlbWVudC5hdHRyKCdpZCcpO1xyXG5cclxuICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcclxuXHJcbiAgLy8gRmluZCB0cmlnZ2VycyB0aGF0IGFmZmVjdCB0aGlzIGVsZW1lbnQgYW5kIGFkZCBhcmlhLWV4cGFuZGVkIHRvIHRoZW1cclxuICAkKGRvY3VtZW50KVxyXG4gICAgLmZpbmQoJ1tkYXRhLW9wZW49XCInK2lkKydcIl0sIFtkYXRhLWNsb3NlPVwiJytpZCsnXCJdLCBbZGF0YS10b2dnbGU9XCInK2lkKydcIl0nKVxyXG4gICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKVxyXG4gICAgLmF0dHIoJ2FyaWEtY29udHJvbHMnLCBpZCk7XHJcblxyXG4gIC8vIEFkZCBhIGNsb3NlIHRyaWdnZXIgb3ZlciB0aGUgYm9keSBpZiBuZWNlc3NhcnlcclxuICBpZiAodGhpcy5vcHRpb25zLmNsb3NlT25DbGljayl7XHJcbiAgICBpZigkKCcuanMtb2ZmLWNhbnZhcy1leGl0JykubGVuZ3RoKXtcclxuICAgICAgdGhpcy4kZXhpdGVyID0gJCgnLmpzLW9mZi1jYW52YXMtZXhpdCcpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIHZhciBleGl0ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgZXhpdGVyLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnanMtb2ZmLWNhbnZhcy1leGl0Jyk7XHJcbiAgICAgICQoJ1tkYXRhLW9mZi1jYW52YXMtY29udGVudF0nKS5hcHBlbmQoZXhpdGVyKTtcclxuXHJcbiAgICAgIHRoaXMuJGV4aXRlciA9ICQoZXhpdGVyKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHRoaXMub3B0aW9ucy5pc1JldmVhbGVkID0gdGhpcy5vcHRpb25zLmlzUmV2ZWFsZWQgfHwgbmV3IFJlZ0V4cCh0aGlzLm9wdGlvbnMucmV2ZWFsQ2xhc3MsICdnJykudGVzdCh0aGlzLiRlbGVtZW50WzBdLmNsYXNzTmFtZSk7XHJcblxyXG4gIGlmKHRoaXMub3B0aW9ucy5pc1JldmVhbGVkKXtcclxuICAgIHRoaXMub3B0aW9ucy5yZXZlYWxPbiA9IHRoaXMub3B0aW9ucy5yZXZlYWxPbiB8fCB0aGlzLiRlbGVtZW50WzBdLmNsYXNzTmFtZS5tYXRjaCgvKHJldmVhbC1mb3ItbWVkaXVtfHJldmVhbC1mb3ItbGFyZ2UpL2cpWzBdLnNwbGl0KCctJylbMl07XHJcbiAgICB0aGlzLl9zZXRNUUNoZWNrZXIoKTtcclxuICB9XHJcbiAgaWYoIXRoaXMub3B0aW9ucy50cmFuc2l0aW9uVGltZSl7XHJcbiAgICB0aGlzLm9wdGlvbnMudHJhbnNpdGlvblRpbWUgPSBwYXJzZUZsb2F0KHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKCQoJ1tkYXRhLW9mZi1jYW52YXMtd3JhcHBlcl0nKVswXSkudHJhbnNpdGlvbkR1cmF0aW9uKSAqIDEwMDA7XHJcbiAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEFkZHMgZXZlbnQgaGFuZGxlcnMgdG8gdGhlIG9mZi1jYW52YXMgd3JhcHBlciBhbmQgdGhlIGV4aXQgb3ZlcmxheS5cclxuICogQGZ1bmN0aW9uXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5PZmZDYW52YXMucHJvdG90eXBlLl9ldmVudHMgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLiRlbGVtZW50Lm9mZignLnpmLnRyaWdnZXIgLnpmLm9mZmNhbnZhcycpLm9uKHtcclxuICAgICdvcGVuLnpmLnRyaWdnZXInOiB0aGlzLm9wZW4uYmluZCh0aGlzKSxcclxuICAgICdjbG9zZS56Zi50cmlnZ2VyJzogdGhpcy5jbG9zZS5iaW5kKHRoaXMpLFxyXG4gICAgJ3RvZ2dsZS56Zi50cmlnZ2VyJzogdGhpcy50b2dnbGUuYmluZCh0aGlzKSxcclxuICAgICdrZXlkb3duLnpmLm9mZmNhbnZhcyc6IHRoaXMuX2hhbmRsZUtleWJvYXJkLmJpbmQodGhpcylcclxuICB9KTtcclxuXHJcbiAgaWYgKHRoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2sgJiYgdGhpcy4kZXhpdGVyLmxlbmd0aCkge1xyXG4gICAgdGhpcy4kZXhpdGVyLm9uKHsnY2xpY2suemYub2ZmY2FudmFzJzogdGhpcy5jbG9zZS5iaW5kKHRoaXMpfSk7XHJcbiAgfVxyXG59O1xyXG4vKipcclxuICogQXBwbGllcyBldmVudCBsaXN0ZW5lciBmb3IgZWxlbWVudHMgdGhhdCB3aWxsIHJldmVhbCBhdCBjZXJ0YWluIGJyZWFrcG9pbnRzLlxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuT2ZmQ2FudmFzLnByb3RvdHlwZS5fc2V0TVFDaGVja2VyID0gZnVuY3Rpb24oKXtcclxuICB2YXIgX3RoaXMgPSB0aGlzO1xyXG5cclxuICAkKHdpbmRvdykub24oJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIGZ1bmN0aW9uKCl7XHJcbiAgICBpZihGb3VuZGF0aW9uLk1lZGlhUXVlcnkuYXRMZWFzdChfdGhpcy5vcHRpb25zLnJldmVhbE9uKSl7XHJcbiAgICAgIF90aGlzLnJldmVhbCh0cnVlKTtcclxuICAgIH1lbHNle1xyXG4gICAgICBfdGhpcy5yZXZlYWwoZmFsc2UpO1xyXG4gICAgfVxyXG4gIH0pLm9uZSgnbG9hZC56Zi5vZmZjYW52YXMnLCBmdW5jdGlvbigpe1xyXG4gICAgaWYoRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3QoX3RoaXMub3B0aW9ucy5yZXZlYWxPbikpe1xyXG4gICAgICBfdGhpcy5yZXZlYWwodHJ1ZSk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn07XHJcbi8qKlxyXG4gKiBIYW5kbGVzIHRoZSByZXZlYWxpbmcvaGlkaW5nIHRoZSBvZmYtY2FudmFzIGF0IGJyZWFrcG9pbnRzLCBub3QgdGhlIHNhbWUgYXMgb3Blbi5cclxuICogQHBhcmFtIHtCb29sZWFufSBpc1JldmVhbGVkIC0gdHJ1ZSBpZiBlbGVtZW50IHNob3VsZCBiZSByZXZlYWxlZC5cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5PZmZDYW52YXMucHJvdG90eXBlLnJldmVhbCA9IGZ1bmN0aW9uKGlzUmV2ZWFsZWQpe1xyXG4gIHZhciAkY2xvc2VyID0gdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS1jbG9zZV0nKTtcclxuICBpZihpc1JldmVhbGVkKXtcclxuICAgIHRoaXMuY2xvc2UoKTtcclxuICAgIHRoaXMuaXNSZXZlYWxlZCA9IHRydWU7XHJcbiAgICAvLyBpZighdGhpcy5vcHRpb25zLmZvcmNlVG9wKXtcclxuICAgIC8vICAgdmFyIHNjcm9sbFBvcyA9IHBhcnNlSW50KHdpbmRvdy5wYWdlWU9mZnNldCk7XHJcbiAgICAvLyAgIHRoaXMuJGVsZW1lbnRbMF0uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgwLCcgKyBzY3JvbGxQb3MgKyAncHgpJztcclxuICAgIC8vIH1cclxuICAgIC8vIGlmKHRoaXMub3B0aW9ucy5pc1N0aWNreSl7IHRoaXMuX3N0aWNrKCk7IH1cclxuICAgIHRoaXMuJGVsZW1lbnQub2ZmKCdvcGVuLnpmLnRyaWdnZXIgdG9nZ2xlLnpmLnRyaWdnZXInKTtcclxuICAgIGlmKCRjbG9zZXIubGVuZ3RoKXsgJGNsb3Nlci5oaWRlKCk7IH1cclxuICB9ZWxzZXtcclxuICAgIHRoaXMuaXNSZXZlYWxlZCA9IGZhbHNlO1xyXG4gICAgLy8gaWYodGhpcy5vcHRpb25zLmlzU3RpY2t5IHx8ICF0aGlzLm9wdGlvbnMuZm9yY2VUb3Ape1xyXG4gICAgLy8gICB0aGlzLiRlbGVtZW50WzBdLnN0eWxlLnRyYW5zZm9ybSA9ICcnO1xyXG4gICAgLy8gICAkKHdpbmRvdykub2ZmKCdzY3JvbGwuemYub2ZmY2FudmFzJyk7XHJcbiAgICAvLyB9XHJcbiAgICB0aGlzLiRlbGVtZW50Lm9uKHtcclxuICAgICAgJ29wZW4uemYudHJpZ2dlcic6IHRoaXMub3Blbi5iaW5kKHRoaXMpLFxyXG4gICAgICAndG9nZ2xlLnpmLnRyaWdnZXInOiB0aGlzLnRvZ2dsZS5iaW5kKHRoaXMpXHJcbiAgICB9KTtcclxuICAgIGlmKCRjbG9zZXIubGVuZ3RoKXtcclxuICAgICAgJGNsb3Nlci5zaG93KCk7XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIE9wZW5zIHRoZSBvZmYtY2FudmFzIG1lbnUuXHJcbiAqIEBmdW5jdGlvblxyXG4gKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgLSBFdmVudCBvYmplY3QgcGFzc2VkIGZyb20gbGlzdGVuZXIuXHJcbiAqIEBwYXJhbSB7alF1ZXJ5fSB0cmlnZ2VyIC0gZWxlbWVudCB0aGF0IHRyaWdnZXJlZCB0aGUgb2ZmLWNhbnZhcyB0byBvcGVuLlxyXG4gKiBAZmlyZXMgT2ZmQ2FudmFzI29wZW5lZFxyXG4gKi9cclxuT2ZmQ2FudmFzLnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24oZXZlbnQsIHRyaWdnZXIpIHtcclxuICBpZiAodGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaXMtb3BlbicpIHx8IHRoaXMuaXNSZXZlYWxlZCl7IHJldHVybjsgfVxyXG4gIHZhciBfdGhpcyA9IHRoaXMsXHJcbiAgICAgICRib2R5ID0gJChkb2N1bWVudC5ib2R5KTtcclxuICAkKCdib2R5Jykuc2Nyb2xsVG9wKDApO1xyXG4gIC8vIHdpbmRvdy5wYWdlWU9mZnNldCA9IDA7XHJcblxyXG4gIC8vIGlmKCF0aGlzLm9wdGlvbnMuZm9yY2VUb3Ape1xyXG4gIC8vICAgdmFyIHNjcm9sbFBvcyA9IHBhcnNlSW50KHdpbmRvdy5wYWdlWU9mZnNldCk7XHJcbiAgLy8gICB0aGlzLiRlbGVtZW50WzBdLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoMCwnICsgc2Nyb2xsUG9zICsgJ3B4KSc7XHJcbiAgLy8gICBpZih0aGlzLiRleGl0ZXIubGVuZ3RoKXtcclxuICAvLyAgICAgdGhpcy4kZXhpdGVyWzBdLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoMCwnICsgc2Nyb2xsUG9zICsgJ3B4KSc7XHJcbiAgLy8gICB9XHJcbiAgLy8gfVxyXG4gIC8qKlxyXG4gICAqIEZpcmVzIHdoZW4gdGhlIG9mZi1jYW52YXMgbWVudSBvcGVucy5cclxuICAgKiBAZXZlbnQgT2ZmQ2FudmFzI29wZW5lZFxyXG4gICAqL1xyXG4gIEZvdW5kYXRpb24uTW92ZSh0aGlzLm9wdGlvbnMudHJhbnNpdGlvblRpbWUsIHRoaXMuJGVsZW1lbnQsIGZ1bmN0aW9uKCl7XHJcbiAgICAkKCdbZGF0YS1vZmYtY2FudmFzLXdyYXBwZXJdJykuYWRkQ2xhc3MoJ2lzLW9mZi1jYW52YXMtb3BlbiBpcy1vcGVuLScrIF90aGlzLm9wdGlvbnMucG9zaXRpb24pO1xyXG5cclxuICAgIF90aGlzLiRlbGVtZW50XHJcbiAgICAgIC5hZGRDbGFzcygnaXMtb3BlbicpXHJcblxyXG4gICAgLy8gaWYoX3RoaXMub3B0aW9ucy5pc1N0aWNreSl7XHJcbiAgICAvLyAgIF90aGlzLl9zdGljaygpO1xyXG4gICAgLy8gfVxyXG4gIH0pO1xyXG4gIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKVxyXG4gICAgICAudHJpZ2dlcignb3BlbmVkLnpmLm9mZmNhbnZhcycpO1xyXG5cclxuICBpZih0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrKXtcclxuICAgIHRoaXMuJGV4aXRlci5hZGRDbGFzcygnaXMtdmlzaWJsZScpO1xyXG4gIH1cclxuICBpZih0cmlnZ2VyKXtcclxuICAgIHRoaXMuJGxhc3RUcmlnZ2VyID0gdHJpZ2dlci5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ3RydWUnKTtcclxuICB9XHJcbiAgaWYodGhpcy5vcHRpb25zLmF1dG9Gb2N1cyl7XHJcbiAgICB0aGlzLiRlbGVtZW50Lm9uZSgnZmluaXNoZWQuemYuYW5pbWF0ZScsIGZ1bmN0aW9uKCl7XHJcbiAgICAgIF90aGlzLiRlbGVtZW50LmZpbmQoJ2EsIGJ1dHRvbicpLmVxKDApLmZvY3VzKCk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgaWYodGhpcy5vcHRpb25zLnRyYXBGb2N1cyl7XHJcbiAgICAkKCdbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdJykuYXR0cigndGFiaW5kZXgnLCAnLTEnKTtcclxuICAgIHRoaXMuX3RyYXBGb2N1cygpO1xyXG4gIH1cclxufTtcclxuLyoqXHJcbiAqIFRyYXBzIGZvY3VzIHdpdGhpbiB0aGUgb2ZmY2FudmFzIG9uIG9wZW4uXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5PZmZDYW52YXMucHJvdG90eXBlLl90cmFwRm9jdXMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBmb2N1c2FibGUgPSBGb3VuZGF0aW9uLktleWJvYXJkLmZpbmRGb2N1c2FibGUodGhpcy4kZWxlbWVudCksXHJcbiAgICAgIGZpcnN0ID0gZm9jdXNhYmxlLmVxKDApLFxyXG4gICAgICBsYXN0ID0gZm9jdXNhYmxlLmVxKC0xKTtcclxuXHJcbiAgZm9jdXNhYmxlLm9mZignLnpmLm9mZmNhbnZhcycpLm9uKCdrZXlkb3duLnpmLm9mZmNhbnZhcycsIGZ1bmN0aW9uKGUpe1xyXG4gICAgaWYoZS53aGljaCA9PT0gOSB8fCBlLmtleWNvZGUgPT09IDkpe1xyXG4gICAgICBpZihlLnRhcmdldCA9PT0gbGFzdFswXSAmJiAhZS5zaGlmdEtleSl7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGZpcnN0LmZvY3VzKCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYoZS50YXJnZXQgPT09IGZpcnN0WzBdICYmIGUuc2hpZnRLZXkpe1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBsYXN0LmZvY3VzKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KTtcclxufTtcclxuLyoqXHJcbiAqIEFsbG93cyB0aGUgb2ZmY2FudmFzIHRvIGFwcGVhciBzdGlja3kgdXRpbGl6aW5nIHRyYW5zbGF0ZSBwcm9wZXJ0aWVzLlxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuLy8gT2ZmQ2FudmFzLnByb3RvdHlwZS5fc3RpY2sgPSBmdW5jdGlvbigpe1xyXG4vLyAgIHZhciBlbFN0eWxlID0gdGhpcy4kZWxlbWVudFswXS5zdHlsZTtcclxuLy9cclxuLy8gICBpZih0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrKXtcclxuLy8gICAgIHZhciBleGl0U3R5bGUgPSB0aGlzLiRleGl0ZXJbMF0uc3R5bGU7XHJcbi8vICAgfVxyXG4vL1xyXG4vLyAgICQod2luZG93KS5vbignc2Nyb2xsLnpmLm9mZmNhbnZhcycsIGZ1bmN0aW9uKGUpe1xyXG4vLyAgICAgY29uc29sZS5sb2coZSk7XHJcbi8vICAgICB2YXIgcGFnZVkgPSB3aW5kb3cucGFnZVlPZmZzZXQ7XHJcbi8vICAgICBlbFN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoMCwnICsgcGFnZVkgKyAncHgpJztcclxuLy8gICAgIGlmKGV4aXRTdHlsZSAhPT0gdW5kZWZpbmVkKXsgZXhpdFN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoMCwnICsgcGFnZVkgKyAncHgpJzsgfVxyXG4vLyAgIH0pO1xyXG4vLyAgIC8vIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignc3R1Y2suemYub2ZmY2FudmFzJyk7XHJcbi8vIH07XHJcbi8qKlxyXG4gKiBDbG9zZXMgdGhlIG9mZi1jYW52YXMgbWVudS5cclxuICogQGZ1bmN0aW9uXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIC0gb3B0aW9uYWwgY2IgdG8gZmlyZSBhZnRlciBjbG9zdXJlLlxyXG4gKiBAZmlyZXMgT2ZmQ2FudmFzI2Nsb3NlZFxyXG4gKi9cclxuT2ZmQ2FudmFzLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKGNiKSB7XHJcbiAgaWYoIXRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLW9wZW4nKSB8fCB0aGlzLmlzUmV2ZWFsZWQpeyByZXR1cm47IH1cclxuXHJcbiAgdmFyIF90aGlzID0gdGhpcztcclxuXHJcbiAgLy8gIEZvdW5kYXRpb24uTW92ZSh0aGlzLm9wdGlvbnMudHJhbnNpdGlvblRpbWUsIHRoaXMuJGVsZW1lbnQsIGZ1bmN0aW9uKCl7XHJcbiAgJCgnW2RhdGEtb2ZmLWNhbnZhcy13cmFwcGVyXScpLnJlbW92ZUNsYXNzKCdpcy1vZmYtY2FudmFzLW9wZW4gaXMtb3Blbi0nICsgX3RoaXMub3B0aW9ucy5wb3NpdGlvbik7XHJcbiAgX3RoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKTtcclxuICAgIC8vIEZvdW5kYXRpb24uX3JlZmxvdygpO1xyXG4gIC8vIH0pO1xyXG4gIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpXHJcbiAgICAvKipcclxuICAgICAqIEZpcmVzIHdoZW4gdGhlIG9mZi1jYW52YXMgbWVudSBvcGVucy5cclxuICAgICAqIEBldmVudCBPZmZDYW52YXMjY2xvc2VkXHJcbiAgICAgKi9cclxuICAgICAgLnRyaWdnZXIoJ2Nsb3NlZC56Zi5vZmZjYW52YXMnKTtcclxuICAvLyBpZihfdGhpcy5vcHRpb25zLmlzU3RpY2t5IHx8ICFfdGhpcy5vcHRpb25zLmZvcmNlVG9wKXtcclxuICAvLyAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAvLyAgICAgX3RoaXMuJGVsZW1lbnRbMF0uc3R5bGUudHJhbnNmb3JtID0gJyc7XHJcbiAgLy8gICAgICQod2luZG93KS5vZmYoJ3Njcm9sbC56Zi5vZmZjYW52YXMnKTtcclxuICAvLyAgIH0sIHRoaXMub3B0aW9ucy50cmFuc2l0aW9uVGltZSk7XHJcbiAgLy8gfVxyXG4gIGlmKHRoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2spe1xyXG4gICAgdGhpcy4kZXhpdGVyLnJlbW92ZUNsYXNzKCdpcy12aXNpYmxlJyk7XHJcbiAgfVxyXG5cclxuICB0aGlzLiRsYXN0VHJpZ2dlci5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJyk7XHJcbiAgaWYodGhpcy5vcHRpb25zLnRyYXBGb2N1cyl7XHJcbiAgICAkKCdbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdJykucmVtb3ZlQXR0cigndGFiaW5kZXgnKTtcclxuICB9XHJcblxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFRvZ2dsZXMgdGhlIG9mZi1jYW52YXMgbWVudSBvcGVuIG9yIGNsb3NlZC5cclxuICogQGZ1bmN0aW9uXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCAtIEV2ZW50IG9iamVjdCBwYXNzZWQgZnJvbSBsaXN0ZW5lci5cclxuICogQHBhcmFtIHtqUXVlcnl9IHRyaWdnZXIgLSBlbGVtZW50IHRoYXQgdHJpZ2dlcmVkIHRoZSBvZmYtY2FudmFzIHRvIG9wZW4uXHJcbiAqL1xyXG5PZmZDYW52YXMucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uKGV2ZW50LCB0cmlnZ2VyKSB7XHJcbiAgaWYgKHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLW9wZW4nKSkge1xyXG4gICAgdGhpcy5jbG9zZShldmVudCwgdHJpZ2dlcik7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgdGhpcy5vcGVuKGV2ZW50LCB0cmlnZ2VyKTtcclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogSGFuZGxlcyBrZXlib2FyZCBpbnB1dCB3aGVuIGRldGVjdGVkLiBXaGVuIHRoZSBlc2NhcGUga2V5IGlzIHByZXNzZWQsIHRoZSBvZmYtY2FudmFzIG1lbnUgY2xvc2VzLCBhbmQgZm9jdXMgaXMgcmVzdG9yZWQgdG8gdGhlIGVsZW1lbnQgdGhhdCBvcGVuZWQgdGhlIG1lbnUuXHJcbiAqIEBmdW5jdGlvblxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuT2ZmQ2FudmFzLnByb3RvdHlwZS5faGFuZGxlS2V5Ym9hcmQgPSBmdW5jdGlvbihldmVudCkge1xyXG4gIGlmIChldmVudC53aGljaCAhPT0gMjcpIHJldHVybjtcclxuXHJcbiAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICB0aGlzLmNsb3NlKCk7XHJcbiAgdGhpcy4kbGFzdFRyaWdnZXIuZm9jdXMoKTtcclxufTtcclxuLyoqXHJcbiAqIERlc3Ryb3lzIHRoZSBvZmZjYW52YXMgcGx1Z2luLlxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbk9mZkNhbnZhcy5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCl7XHJcbiAgdGhpcy5jbG9zZSgpO1xyXG4gIHRoaXMuJGVsZW1lbnQub2ZmKCcuemYudHJpZ2dlciAuemYub2ZmY2FudmFzJyk7XHJcbiAgdGhpcy4kZXhpdGVyLm9mZignLnpmLm9mZmNhbnZhcycpO1xyXG5cclxuICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XHJcbn07XHJcblxyXG5Gb3VuZGF0aW9uLnBsdWdpbihPZmZDYW52YXMsICdPZmZDYW52YXMnKTtcclxuXHJcbn0oalF1ZXJ5LCBGb3VuZGF0aW9uKTtcclxuIiwiLyoqXHJcbiogT3JiaXQgbW9kdWxlLlxyXG4qIEBtb2R1bGUgZm91bmRhdGlvbi5vcmJpdFxyXG4qIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcclxuKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1vdGlvblxyXG4qIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudGltZXJBbmRJbWFnZUxvYWRlclxyXG4qIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudG91Y2hcclxuKi9cclxuIWZ1bmN0aW9uKCQsIEZvdW5kYXRpb24pe1xyXG4gICd1c2Ugc3RyaWN0JztcclxuICAvKipcclxuICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYW4gb3JiaXQgY2Fyb3VzZWwuXHJcbiAgKiBAY2xhc3NcclxuICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gYW4gT3JiaXQgQ2Fyb3VzZWwuXHJcbiAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXHJcbiAgKi9cclxuICBmdW5jdGlvbiBPcmJpdChlbGVtZW50LCBvcHRpb25zKXtcclxuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIE9yYml0LmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XHJcblxyXG4gICAgdGhpcy5faW5pdCgpO1xyXG5cclxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ09yYml0Jyk7XHJcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdPcmJpdCcsIHtcclxuICAgICAgJ2x0cic6IHtcclxuICAgICAgICAnQVJST1dfUklHSFQnOiAnbmV4dCcsXHJcbiAgICAgICAgJ0FSUk9XX0xFRlQnOiAncHJldmlvdXMnXHJcbiAgICAgIH0sXHJcbiAgICAgICdydGwnOiB7XHJcbiAgICAgICAgJ0FSUk9XX0xFRlQnOiAnbmV4dCcsXHJcbiAgICAgICAgJ0FSUk9XX1JJR0hUJzogJ3ByZXZpb3VzJ1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbiAgT3JiaXQuZGVmYXVsdHMgPSB7XHJcbiAgICAvKipcclxuICAgICogVGVsbHMgdGhlIEpTIHRvIGxvYWRCdWxsZXRzLlxyXG4gICAgKiBAb3B0aW9uXHJcbiAgICAqIEBleGFtcGxlIHRydWVcclxuICAgICovXHJcbiAgICBidWxsZXRzOiB0cnVlLFxyXG4gICAgLyoqXHJcbiAgICAqIFRlbGxzIHRoZSBKUyB0byBhcHBseSBldmVudCBsaXN0ZW5lcnMgdG8gbmF2IGJ1dHRvbnNcclxuICAgICogQG9wdGlvblxyXG4gICAgKiBAZXhhbXBsZSB0cnVlXHJcbiAgICAqL1xyXG4gICAgbmF2QnV0dG9uczogdHJ1ZSxcclxuICAgIC8qKlxyXG4gICAgKiBtb3Rpb24tdWkgYW5pbWF0aW9uIGNsYXNzIHRvIGFwcGx5XHJcbiAgICAqIEBvcHRpb25cclxuICAgICogQGV4YW1wbGUgJ3NsaWRlLWluLXJpZ2h0J1xyXG4gICAgKi9cclxuICAgIGFuaW1JbkZyb21SaWdodDogJ3NsaWRlLWluLXJpZ2h0JyxcclxuICAgIC8qKlxyXG4gICAgKiBtb3Rpb24tdWkgYW5pbWF0aW9uIGNsYXNzIHRvIGFwcGx5XHJcbiAgICAqIEBvcHRpb25cclxuICAgICogQGV4YW1wbGUgJ3NsaWRlLW91dC1yaWdodCdcclxuICAgICovXHJcbiAgICBhbmltT3V0VG9SaWdodDogJ3NsaWRlLW91dC1yaWdodCcsXHJcbiAgICAvKipcclxuICAgICogbW90aW9uLXVpIGFuaW1hdGlvbiBjbGFzcyB0byBhcHBseVxyXG4gICAgKiBAb3B0aW9uXHJcbiAgICAqIEBleGFtcGxlICdzbGlkZS1pbi1sZWZ0J1xyXG4gICAgKlxyXG4gICAgKi9cclxuICAgIGFuaW1JbkZyb21MZWZ0OiAnc2xpZGUtaW4tbGVmdCcsXHJcbiAgICAvKipcclxuICAgICogbW90aW9uLXVpIGFuaW1hdGlvbiBjbGFzcyB0byBhcHBseVxyXG4gICAgKiBAb3B0aW9uXHJcbiAgICAqIEBleGFtcGxlICdzbGlkZS1vdXQtbGVmdCdcclxuICAgICovXHJcbiAgICBhbmltT3V0VG9MZWZ0OiAnc2xpZGUtb3V0LWxlZnQnLFxyXG4gICAgLyoqXHJcbiAgICAqIEFsbG93cyBPcmJpdCB0byBhdXRvbWF0aWNhbGx5IGFuaW1hdGUgb24gcGFnZSBsb2FkLlxyXG4gICAgKiBAb3B0aW9uXHJcbiAgICAqIEBleGFtcGxlIHRydWVcclxuICAgICovXHJcbiAgICBhdXRvUGxheTogdHJ1ZSxcclxuICAgIC8qKlxyXG4gICAgKiBBbW91bnQgb2YgdGltZSwgaW4gbXMsIGJldHdlZW4gc2xpZGUgdHJhbnNpdGlvbnNcclxuICAgICogQG9wdGlvblxyXG4gICAgKiBAZXhhbXBsZSA1MDAwXHJcbiAgICAqL1xyXG4gICAgdGltZXJEZWxheTogNTAwMCxcclxuICAgIC8qKlxyXG4gICAgKiBBbGxvd3MgT3JiaXQgdG8gaW5maW5pdGVseSBsb29wIHRocm91Z2ggdGhlIHNsaWRlc1xyXG4gICAgKiBAb3B0aW9uXHJcbiAgICAqIEBleGFtcGxlIHRydWVcclxuICAgICovXHJcbiAgICBpbmZpbml0ZVdyYXA6IHRydWUsXHJcbiAgICAvKipcclxuICAgICogQWxsb3dzIHRoZSBPcmJpdCBzbGlkZXMgdG8gYmluZCB0byBzd2lwZSBldmVudHMgZm9yIG1vYmlsZSwgcmVxdWlyZXMgYW4gYWRkaXRpb25hbCB1dGlsIGxpYnJhcnlcclxuICAgICogQG9wdGlvblxyXG4gICAgKiBAZXhhbXBsZSB0cnVlXHJcbiAgICAqL1xyXG4gICAgc3dpcGU6IHRydWUsXHJcbiAgICAvKipcclxuICAgICogQWxsb3dzIHRoZSB0aW1pbmcgZnVuY3Rpb24gdG8gcGF1c2UgYW5pbWF0aW9uIG9uIGhvdmVyLlxyXG4gICAgKiBAb3B0aW9uXHJcbiAgICAqIEBleGFtcGxlIHRydWVcclxuICAgICovXHJcbiAgICBwYXVzZU9uSG92ZXI6IHRydWUsXHJcbiAgICAvKipcclxuICAgICogQWxsb3dzIE9yYml0IHRvIGJpbmQga2V5Ym9hcmQgZXZlbnRzIHRvIHRoZSBzbGlkZXIsIHRvIGFuaW1hdGUgZnJhbWVzIHdpdGggYXJyb3cga2V5c1xyXG4gICAgKiBAb3B0aW9uXHJcbiAgICAqIEBleGFtcGxlIHRydWVcclxuICAgICovXHJcbiAgICBhY2Nlc3NpYmxlOiB0cnVlLFxyXG4gICAgLyoqXHJcbiAgICAqIENsYXNzIGFwcGxpZWQgdG8gdGhlIGNvbnRhaW5lciBvZiBPcmJpdFxyXG4gICAgKiBAb3B0aW9uXHJcbiAgICAqIEBleGFtcGxlICdvcmJpdC1jb250YWluZXInXHJcbiAgICAqL1xyXG4gICAgY29udGFpbmVyQ2xhc3M6ICdvcmJpdC1jb250YWluZXInLFxyXG4gICAgLyoqXHJcbiAgICAqIENsYXNzIGFwcGxpZWQgdG8gaW5kaXZpZHVhbCBzbGlkZXMuXHJcbiAgICAqIEBvcHRpb25cclxuICAgICogQGV4YW1wbGUgJ29yYml0LXNsaWRlJ1xyXG4gICAgKi9cclxuICAgIHNsaWRlQ2xhc3M6ICdvcmJpdC1zbGlkZScsXHJcbiAgICAvKipcclxuICAgICogQ2xhc3MgYXBwbGllZCB0byB0aGUgYnVsbGV0IGNvbnRhaW5lci4gWW91J3JlIHdlbGNvbWUuXHJcbiAgICAqIEBvcHRpb25cclxuICAgICogQGV4YW1wbGUgJ29yYml0LWJ1bGxldHMnXHJcbiAgICAqL1xyXG4gICAgYm94T2ZCdWxsZXRzOiAnb3JiaXQtYnVsbGV0cycsXHJcbiAgICAvKipcclxuICAgICogQ2xhc3MgYXBwbGllZCB0byB0aGUgYG5leHRgIG5hdmlnYXRpb24gYnV0dG9uLlxyXG4gICAgKiBAb3B0aW9uXHJcbiAgICAqIEBleGFtcGxlICdvcmJpdC1uZXh0J1xyXG4gICAgKi9cclxuICAgIG5leHRDbGFzczogJ29yYml0LW5leHQnLFxyXG4gICAgLyoqXHJcbiAgICAqIENsYXNzIGFwcGxpZWQgdG8gdGhlIGBwcmV2aW91c2AgbmF2aWdhdGlvbiBidXR0b24uXHJcbiAgICAqIEBvcHRpb25cclxuICAgICogQGV4YW1wbGUgJ29yYml0LXByZXZpb3VzJ1xyXG4gICAgKi9cclxuICAgIHByZXZDbGFzczogJ29yYml0LXByZXZpb3VzJyxcclxuICAgIC8qKlxyXG4gICAgKiBCb29sZWFuIHRvIGZsYWcgdGhlIGpzIHRvIHVzZSBtb3Rpb24gdWkgY2xhc3NlcyBvciBub3QuIERlZmF1bHQgdG8gdHJ1ZSBmb3IgYmFja3dhcmRzIGNvbXBhdGFiaWxpdHkuXHJcbiAgICAqIEBvcHRpb25cclxuICAgICogQGV4YW1wbGUgdHJ1ZVxyXG4gICAgKi9cclxuICAgIHVzZU1VSTogdHJ1ZVxyXG4gIH07XHJcbiAgLyoqXHJcbiAgKiBJbml0aWFsaXplcyB0aGUgcGx1Z2luIGJ5IGNyZWF0aW5nIGpRdWVyeSBjb2xsZWN0aW9ucywgc2V0dGluZyBhdHRyaWJ1dGVzLCBhbmQgc3RhcnRpbmcgdGhlIGFuaW1hdGlvbi5cclxuICAqIEBmdW5jdGlvblxyXG4gICogQHByaXZhdGVcclxuICAqL1xyXG4gIE9yYml0LnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uKCl7XHJcbiAgICB0aGlzLiR3cmFwcGVyID0gdGhpcy4kZWxlbWVudC5maW5kKCcuJyArIHRoaXMub3B0aW9ucy5jb250YWluZXJDbGFzcyk7XHJcbiAgICB0aGlzLiRzbGlkZXMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy4nICsgdGhpcy5vcHRpb25zLnNsaWRlQ2xhc3MpO1xyXG4gICAgdmFyICRpbWFnZXMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ2ltZycpLFxyXG4gICAgaW5pdEFjdGl2ZSA9IHRoaXMuJHNsaWRlcy5maWx0ZXIoJy5pcy1hY3RpdmUnKTtcclxuXHJcbiAgICBpZighaW5pdEFjdGl2ZS5sZW5ndGgpe1xyXG4gICAgICB0aGlzLiRzbGlkZXMuZXEoMCkuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xyXG4gICAgfVxyXG4gICAgaWYoIXRoaXMub3B0aW9ucy51c2VNVUkpe1xyXG4gICAgICB0aGlzLiRzbGlkZXMuYWRkQ2xhc3MoJ25vLW1vdGlvbnVpJyk7XHJcbiAgICB9XHJcbiAgICBpZigkaW1hZ2VzLmxlbmd0aCl7XHJcbiAgICAgIEZvdW5kYXRpb24ub25JbWFnZXNMb2FkZWQoJGltYWdlcywgdGhpcy5fcHJlcGFyZUZvck9yYml0LmJpbmQodGhpcykpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIHRoaXMuX3ByZXBhcmVGb3JPcmJpdCgpOy8vaGVoZVxyXG4gICAgfVxyXG5cclxuICAgIGlmKHRoaXMub3B0aW9ucy5idWxsZXRzKXtcclxuICAgICAgdGhpcy5fbG9hZEJ1bGxldHMoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9ldmVudHMoKTtcclxuXHJcbiAgICBpZih0aGlzLm9wdGlvbnMuYXV0b1BsYXkgJiYgdGhpcy4kc2xpZGVzLmxlbmd0aCA+IDEpe1xyXG4gICAgICB0aGlzLmdlb1N5bmMoKTtcclxuICAgIH1cclxuICAgIGlmKHRoaXMub3B0aW9ucy5hY2Nlc3NpYmxlKXsgLy8gYWxsb3cgd3JhcHBlciB0byBiZSBmb2N1c2FibGUgdG8gZW5hYmxlIGFycm93IG5hdmlnYXRpb25cclxuICAgICAgdGhpcy4kd3JhcHBlci5hdHRyKCd0YWJpbmRleCcsIDApO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgLyoqXHJcbiAgKiBDcmVhdGVzIGEgalF1ZXJ5IGNvbGxlY3Rpb24gb2YgYnVsbGV0cywgaWYgdGhleSBhcmUgYmVpbmcgdXNlZC5cclxuICAqIEBmdW5jdGlvblxyXG4gICogQHByaXZhdGVcclxuICAqL1xyXG4gIE9yYml0LnByb3RvdHlwZS5fbG9hZEJ1bGxldHMgPSBmdW5jdGlvbigpe1xyXG4gICAgdGhpcy4kYnVsbGV0cyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLicgKyB0aGlzLm9wdGlvbnMuYm94T2ZCdWxsZXRzKS5maW5kKCdidXR0b24nKTtcclxuICB9O1xyXG4gIC8qKlxyXG4gICogU2V0cyBhIGB0aW1lcmAgb2JqZWN0IG9uIHRoZSBvcmJpdCwgYW5kIHN0YXJ0cyB0aGUgY291bnRlciBmb3IgdGhlIG5leHQgc2xpZGUuXHJcbiAgKiBAZnVuY3Rpb25cclxuICAqL1xyXG4gIE9yYml0LnByb3RvdHlwZS5nZW9TeW5jID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICB0aGlzLnRpbWVyID0gbmV3IEZvdW5kYXRpb24uVGltZXIoXHJcbiAgICAgIHRoaXMuJGVsZW1lbnQsXHJcbiAgICAgIHtkdXJhdGlvbjogdGhpcy5vcHRpb25zLnRpbWVyRGVsYXksXHJcbiAgICAgICAgaW5maW5pdGU6IGZhbHNlfSxcclxuICAgICAgICBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgX3RoaXMuY2hhbmdlU2xpZGUodHJ1ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy50aW1lci5zdGFydCgpO1xyXG4gICAgICB9O1xyXG4gICAgICAvKipcclxuICAgICAgKiBTZXRzIHdyYXBwZXIgYW5kIHNsaWRlIGhlaWdodHMgZm9yIHRoZSBvcmJpdC5cclxuICAgICAgKiBAZnVuY3Rpb25cclxuICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAqL1xyXG4gICAgICBPcmJpdC5wcm90b3R5cGUuX3ByZXBhcmVGb3JPcmJpdCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB0aGlzLl9zZXRXcmFwcGVySGVpZ2h0KGZ1bmN0aW9uKG1heCl7XHJcbiAgICAgICAgICBfdGhpcy5fc2V0U2xpZGVIZWlnaHQobWF4KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfTtcclxuICAgICAgLyoqXHJcbiAgICAgICogQ2FsdWxhdGVzIHRoZSBoZWlnaHQgb2YgZWFjaCBzbGlkZSBpbiB0aGUgY29sbGVjdGlvbiwgYW5kIHVzZXMgdGhlIHRhbGxlc3Qgb25lIGZvciB0aGUgd3JhcHBlciBoZWlnaHQuXHJcbiAgICAgICogQGZ1bmN0aW9uXHJcbiAgICAgICogQHByaXZhdGVcclxuICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYiAtIGEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gZmlyZSB3aGVuIGNvbXBsZXRlLlxyXG4gICAgICAqL1xyXG4gICAgICBPcmJpdC5wcm90b3R5cGUuX3NldFdyYXBwZXJIZWlnaHQgPSBmdW5jdGlvbihjYil7Ly9yZXdyaXRlIHRoaXMgdG8gYGZvcmAgbG9vcFxyXG4gICAgICAgIHZhciBtYXggPSAwLCB0ZW1wLCBjb3VudGVyID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy4kc2xpZGVzLmVhY2goZnVuY3Rpb24oKXtcclxuICAgICAgICAgIHRlbXAgPSB0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcclxuICAgICAgICAgICQodGhpcykuYXR0cignZGF0YS1zbGlkZScsIGNvdW50ZXIpO1xyXG5cclxuICAgICAgICAgIGlmKGNvdW50ZXIpey8vaWYgbm90IHRoZSBmaXJzdCBzbGlkZSwgc2V0IGNzcyBwb3NpdGlvbiBhbmQgZGlzcGxheSBwcm9wZXJ0eVxyXG4gICAgICAgICAgICAkKHRoaXMpLmNzcyh7J3Bvc2l0aW9uJzogJ3JlbGF0aXZlJywgJ2Rpc3BsYXknOiAnbm9uZSd9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIG1heCA9IHRlbXAgPiBtYXggPyB0ZW1wIDogbWF4O1xyXG4gICAgICAgICAgY291bnRlcisrO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZihjb3VudGVyID09PSB0aGlzLiRzbGlkZXMubGVuZ3RoKXtcclxuICAgICAgICAgIHRoaXMuJHdyYXBwZXIuY3NzKHsnaGVpZ2h0JzogbWF4fSk7Ly9vbmx5IGNoYW5nZSB0aGUgd3JhcHBlciBoZWlnaHQgcHJvcGVydHkgb25jZS5cclxuICAgICAgICAgIGNiKG1heCk7Ly9maXJlIGNhbGxiYWNrIHdpdGggbWF4IGhlaWdodCBkaW1lbnNpb24uXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICAvKipcclxuICAgICAgKiBTZXRzIHRoZSBtYXgtaGVpZ2h0IG9mIGVhY2ggc2xpZGUuXHJcbiAgICAgICogQGZ1bmN0aW9uXHJcbiAgICAgICogQHByaXZhdGVcclxuICAgICAgKi9cclxuICAgICAgT3JiaXQucHJvdG90eXBlLl9zZXRTbGlkZUhlaWdodCA9IGZ1bmN0aW9uKGhlaWdodCl7XHJcbiAgICAgICAgdGhpcy4kc2xpZGVzLmVhY2goZnVuY3Rpb24oKXtcclxuICAgICAgICAgICQodGhpcykuY3NzKCdtYXgtaGVpZ2h0JywgaGVpZ2h0KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfTtcclxuICAgICAgLyoqXHJcbiAgICAgICogQWRkcyBldmVudCBsaXN0ZW5lcnMgdG8gYmFzaWNhbGx5IGV2ZXJ5dGhpbmcgd2l0aGluIHRoZSBlbGVtZW50LlxyXG4gICAgICAqIEBmdW5jdGlvblxyXG4gICAgICAqIEBwcml2YXRlXHJcbiAgICAgICovXHJcbiAgICAgIE9yYml0LnByb3RvdHlwZS5fZXZlbnRzID0gZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG5cclxuICAgICAgICAvLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAgIC8vKipOb3cgdXNpbmcgY3VzdG9tIGV2ZW50IC0gdGhhbmtzIHRvOioqXHJcbiAgICAgICAgLy8qKiAgICAgIFlvaGFpIEFyYXJhdCBvZiBUb3JvbnRvICAgICAgKipcclxuICAgICAgICAvLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAgIGlmKHRoaXMuJHNsaWRlcy5sZW5ndGggPiAxKXtcclxuXHJcbiAgICAgICAgICBpZih0aGlzLm9wdGlvbnMuc3dpcGUpe1xyXG4gICAgICAgICAgICB0aGlzLiRzbGlkZXMub2ZmKCdzd2lwZWxlZnQuemYub3JiaXQgc3dpcGVyaWdodC56Zi5vcmJpdCcpXHJcbiAgICAgICAgICAgIC5vbignc3dpcGVsZWZ0LnpmLm9yYml0JywgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgIF90aGlzLmNoYW5nZVNsaWRlKHRydWUpO1xyXG4gICAgICAgICAgICB9KS5vbignc3dpcGVyaWdodC56Zi5vcmJpdCcsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICBfdGhpcy5jaGFuZ2VTbGlkZShmYWxzZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuXHJcbiAgICAgICAgICBpZih0aGlzLm9wdGlvbnMuYXV0b1BsYXkpe1xyXG4gICAgICAgICAgICB0aGlzLiRzbGlkZXMub24oJ2NsaWNrLnpmLm9yYml0JywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICBfdGhpcy4kZWxlbWVudC5kYXRhKCdjbGlja2VkT24nLCBfdGhpcy4kZWxlbWVudC5kYXRhKCdjbGlja2VkT24nKSA/IGZhbHNlIDogdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgX3RoaXMudGltZXJbX3RoaXMuJGVsZW1lbnQuZGF0YSgnY2xpY2tlZE9uJykgPyAncGF1c2UnIDogJ3N0YXJ0J10oKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmKHRoaXMub3B0aW9ucy5wYXVzZU9uSG92ZXIpe1xyXG4gICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQub24oJ21vdXNlZW50ZXIuemYub3JiaXQnLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgX3RoaXMudGltZXIucGF1c2UoKTtcclxuICAgICAgICAgICAgICB9KS5vbignbW91c2VsZWF2ZS56Zi5vcmJpdCcsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBpZighX3RoaXMuJGVsZW1lbnQuZGF0YSgnY2xpY2tlZE9uJykpe1xyXG4gICAgICAgICAgICAgICAgICBfdGhpcy50aW1lci5zdGFydCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYodGhpcy5vcHRpb25zLm5hdkJ1dHRvbnMpe1xyXG4gICAgICAgICAgICB2YXIgJGNvbnRyb2xzID0gdGhpcy4kZWxlbWVudC5maW5kKCcuJyArIHRoaXMub3B0aW9ucy5uZXh0Q2xhc3MgKyAnLCAuJyArIHRoaXMub3B0aW9ucy5wcmV2Q2xhc3MpO1xyXG4gICAgICAgICAgICAkY29udHJvbHMuYXR0cigndGFiaW5kZXgnLCAwKVxyXG4gICAgICAgICAgICAvL2Fsc28gbmVlZCB0byBoYW5kbGUgZW50ZXIvcmV0dXJuIGFuZCBzcGFjZWJhciBrZXkgcHJlc3Nlc1xyXG4gICAgICAgICAgICAub24oJ2NsaWNrLnpmLm9yYml0IHRvdWNoZW5kLnpmLm9yYml0JywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICBfdGhpcy5jaGFuZ2VTbGlkZSgkKHRoaXMpLmhhc0NsYXNzKF90aGlzLm9wdGlvbnMubmV4dENsYXNzKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmKHRoaXMub3B0aW9ucy5idWxsZXRzKXtcclxuICAgICAgICAgICAgdGhpcy4kYnVsbGV0cy5vbignY2xpY2suemYub3JiaXQgdG91Y2hlbmQuemYub3JiaXQnLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgIGlmKC9pcy1hY3RpdmUvZy50ZXN0KHRoaXMuY2xhc3NOYW1lKSl7IHJldHVybiBmYWxzZTsgfS8vaWYgdGhpcyBpcyBhY3RpdmUsIGtpY2sgb3V0IG9mIGZ1bmN0aW9uLlxyXG4gICAgICAgICAgICAgIHZhciBpZHggPSAkKHRoaXMpLmRhdGEoJ3NsaWRlJyksXHJcbiAgICAgICAgICAgICAgbHRyID0gaWR4ID4gX3RoaXMuJHNsaWRlcy5maWx0ZXIoJy5pcy1hY3RpdmUnKS5kYXRhKCdzbGlkZScpLFxyXG4gICAgICAgICAgICAgICRzbGlkZSA9IF90aGlzLiRzbGlkZXMuZXEoaWR4KTtcclxuXHJcbiAgICAgICAgICAgICAgX3RoaXMuY2hhbmdlU2xpZGUobHRyLCAkc2xpZGUsIGlkeCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHRoaXMuJHdyYXBwZXIuYWRkKHRoaXMuJGJ1bGxldHMpLm9uKCdrZXlkb3duLnpmLm9yYml0JywgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgIC8vIGhhbmRsZSBrZXlib2FyZCBldmVudCB3aXRoIGtleWJvYXJkIHV0aWxcclxuICAgICAgICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ09yYml0Jywge1xyXG4gICAgICAgICAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuY2hhbmdlU2xpZGUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBwcmV2aW91czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5jaGFuZ2VTbGlkZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBoYW5kbGVkOiBmdW5jdGlvbigpIHsgLy8gaWYgYnVsbGV0IGlzIGZvY3VzZWQsIG1ha2Ugc3VyZSBmb2N1cyBtb3Zlc1xyXG4gICAgICAgICAgICAgICAgaWYgKCQoZS50YXJnZXQpLmlzKF90aGlzLiRidWxsZXRzKSkge1xyXG4gICAgICAgICAgICAgICAgICBfdGhpcy4kYnVsbGV0cy5maWx0ZXIoJy5pcy1hY3RpdmUnKS5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIC8qKlxyXG4gICAgICAqIENoYW5nZXMgdGhlIGN1cnJlbnQgc2xpZGUgdG8gYSBuZXcgb25lLlxyXG4gICAgICAqIEBmdW5jdGlvblxyXG4gICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNMVFIgLSBmbGFnIGlmIHRoZSBzbGlkZSBzaG91bGQgbW92ZSBsZWZ0IHRvIHJpZ2h0LlxyXG4gICAgICAqIEBwYXJhbSB7alF1ZXJ5fSBjaG9zZW5TbGlkZSAtIHRoZSBqUXVlcnkgZWxlbWVudCBvZiB0aGUgc2xpZGUgdG8gc2hvdyBuZXh0LCBpZiBvbmUgaXMgc2VsZWN0ZWQuXHJcbiAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGlkeCAtIHRoZSBpbmRleCBvZiB0aGUgbmV3IHNsaWRlIGluIGl0cyBjb2xsZWN0aW9uLCBpZiBvbmUgY2hvc2VuLlxyXG4gICAgICAqIEBmaXJlcyBPcmJpdCNzbGlkZWNoYW5nZVxyXG4gICAgICAqL1xyXG4gICAgICBPcmJpdC5wcm90b3R5cGUuY2hhbmdlU2xpZGUgPSBmdW5jdGlvbihpc0xUUiwgY2hvc2VuU2xpZGUsIGlkeCl7XHJcbiAgICAgICAgdmFyICRjdXJTbGlkZSA9IHRoaXMuJHNsaWRlcy5maWx0ZXIoJy5pcy1hY3RpdmUnKS5lcSgwKTtcclxuXHJcbiAgICAgICAgaWYoL211aS9nLnRlc3QoJGN1clNsaWRlWzBdLmNsYXNzTmFtZSkpeyByZXR1cm4gZmFsc2U7IH0vL2lmIHRoZSBzbGlkZSBpcyBjdXJyZW50bHkgYW5pbWF0aW5nLCBraWNrIG91dCBvZiB0aGUgZnVuY3Rpb25cclxuXHJcbiAgICAgICAgdmFyICRmaXJzdFNsaWRlID0gdGhpcy4kc2xpZGVzLmZpcnN0KCksXHJcbiAgICAgICAgJGxhc3RTbGlkZSA9IHRoaXMuJHNsaWRlcy5sYXN0KCksXHJcbiAgICAgICAgZGlySW4gPSBpc0xUUiA/ICdSaWdodCcgOiAnTGVmdCcsXHJcbiAgICAgICAgZGlyT3V0ID0gaXNMVFIgPyAnTGVmdCcgOiAnUmlnaHQnLFxyXG4gICAgICAgIF90aGlzID0gdGhpcyxcclxuICAgICAgICAkbmV3U2xpZGU7XHJcblxyXG4gICAgICAgIGlmKCFjaG9zZW5TbGlkZSl7Ly9tb3N0IG9mIHRoZSB0aW1lLCB0aGlzIHdpbGwgYmUgYXV0byBwbGF5ZWQgb3IgY2xpY2tlZCBmcm9tIHRoZSBuYXZCdXR0b25zLlxyXG4gICAgICAgICAgJG5ld1NsaWRlID0gaXNMVFIgPyAvL2lmIHdyYXBwaW5nIGVuYWJsZWQsIGNoZWNrIHRvIHNlZSBpZiB0aGVyZSBpcyBhIGBuZXh0YCBvciBgcHJldmAgc2libGluZywgaWYgbm90LCBzZWxlY3QgdGhlIGZpcnN0IG9yIGxhc3Qgc2xpZGUgdG8gZmlsbCBpbi4gaWYgd3JhcHBpbmcgbm90IGVuYWJsZWQsIGF0dGVtcHQgdG8gc2VsZWN0IGBuZXh0YCBvciBgcHJldmAsIGlmIHRoZXJlJ3Mgbm90aGluZyB0aGVyZSwgdGhlIGZ1bmN0aW9uIHdpbGwga2ljayBvdXQgb24gbmV4dCBzdGVwLiBDUkFaWSBORVNURUQgVEVSTkFSSUVTISEhISFcclxuICAgICAgICAgICh0aGlzLm9wdGlvbnMuaW5maW5pdGVXcmFwID8gJGN1clNsaWRlLm5leHQoJy4nICsgdGhpcy5vcHRpb25zLnNsaWRlQ2xhc3MpLmxlbmd0aCA/ICRjdXJTbGlkZS5uZXh0KCcuJyArIHRoaXMub3B0aW9ucy5zbGlkZUNsYXNzKSA6ICRmaXJzdFNsaWRlIDogJGN1clNsaWRlLm5leHQoJy4nICsgdGhpcy5vcHRpb25zLnNsaWRlQ2xhc3MpKS8vcGljayBuZXh0IHNsaWRlIGlmIG1vdmluZyBsZWZ0IHRvIHJpZ2h0XHJcbiAgICAgICAgICA6XHJcbiAgICAgICAgICAodGhpcy5vcHRpb25zLmluZmluaXRlV3JhcCA/ICRjdXJTbGlkZS5wcmV2KCcuJyArIHRoaXMub3B0aW9ucy5zbGlkZUNsYXNzKS5sZW5ndGggPyAkY3VyU2xpZGUucHJldignLicgKyB0aGlzLm9wdGlvbnMuc2xpZGVDbGFzcykgOiAkbGFzdFNsaWRlIDogJGN1clNsaWRlLnByZXYoJy4nICsgdGhpcy5vcHRpb25zLnNsaWRlQ2xhc3MpKTsvL3BpY2sgcHJldiBzbGlkZSBpZiBtb3ZpbmcgcmlnaHQgdG8gbGVmdFxyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgJG5ld1NsaWRlID0gY2hvc2VuU2xpZGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKCRuZXdTbGlkZS5sZW5ndGgpe1xyXG4gICAgICAgICAgaWYodGhpcy5vcHRpb25zLmJ1bGxldHMpe1xyXG4gICAgICAgICAgICBpZHggPSBpZHggfHwgdGhpcy4kc2xpZGVzLmluZGV4KCRuZXdTbGlkZSk7Ly9ncmFiIGluZGV4IHRvIHVwZGF0ZSBidWxsZXRzXHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUJ1bGxldHMoaWR4KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmKHRoaXMub3B0aW9ucy51c2VNVUkpe1xyXG5cclxuICAgICAgICAgICAgRm91bmRhdGlvbi5Nb3Rpb24uYW5pbWF0ZUluKFxyXG4gICAgICAgICAgICAgICRuZXdTbGlkZS5hZGRDbGFzcygnaXMtYWN0aXZlJykuY3NzKHsncG9zaXRpb24nOiAnYWJzb2x1dGUnLCAndG9wJzogMH0pLFxyXG4gICAgICAgICAgICAgIHRoaXMub3B0aW9uc1snYW5pbUluRnJvbScgKyBkaXJJbl0sXHJcbiAgICAgICAgICAgICAgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICRuZXdTbGlkZS5jc3Moeydwb3NpdGlvbic6ICdyZWxhdGl2ZScsICdkaXNwbGF5JzogJ2Jsb2NrJ30pXHJcbiAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1saXZlJywgJ3BvbGl0ZScpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICBGb3VuZGF0aW9uLk1vdGlvbi5hbmltYXRlT3V0KFxyXG4gICAgICAgICAgICAgICAgJGN1clNsaWRlLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUnKSxcclxuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc1snYW5pbU91dFRvJyArIGRpck91dF0sXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAkY3VyU2xpZGUucmVtb3ZlQXR0cignYXJpYS1saXZlJyk7XHJcbiAgICAgICAgICAgICAgICAgIGlmKF90aGlzLm9wdGlvbnMuYXV0b1BsYXkgJiYgIV90aGlzLnRpbWVyLmlzUGF1c2VkKXtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy50aW1lci5yZXN0YXJ0KCk7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgLy9kbyBzdHVmZj9cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgJGN1clNsaWRlLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUgaXMtaW4nKS5yZW1vdmVBdHRyKCdhcmlhLWxpdmUnKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAkbmV3U2xpZGUuYWRkQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1pbicpLmF0dHIoJ2FyaWEtbGl2ZScsICdwb2xpdGUnKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLm9wdGlvbnMuYXV0b1BsYXkgJiYgIXRoaXMudGltZXIuaXNQYXVzZWQpe1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLnRpbWVyLnJlc3RhcnQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgKiBUcmlnZ2VycyB3aGVuIHRoZSBzbGlkZSBoYXMgZmluaXNoZWQgYW5pbWF0aW5nIGluLlxyXG4gICAgICAgICAgICAgICogQGV2ZW50IE9yYml0I3NsaWRlY2hhbmdlXHJcbiAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3NsaWRlY2hhbmdlLnpmLm9yYml0JywgWyRuZXdTbGlkZV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgICAgLyoqXHJcbiAgICAgICAgICAqIFVwZGF0ZXMgdGhlIGFjdGl2ZSBzdGF0ZSBvZiB0aGUgYnVsbGV0cywgaWYgZGlzcGxheWVkLlxyXG4gICAgICAgICAgKiBAZnVuY3Rpb25cclxuICAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGlkeCAtIHRoZSBpbmRleCBvZiB0aGUgY3VycmVudCBzbGlkZS5cclxuICAgICAgICAgICovXHJcbiAgICAgICAgICBPcmJpdC5wcm90b3R5cGUuX3VwZGF0ZUJ1bGxldHMgPSBmdW5jdGlvbihpZHgpe1xyXG4gICAgICAgICAgICB2YXIgJG9sZEJ1bGxldCA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLicgKyB0aGlzLm9wdGlvbnMuYm94T2ZCdWxsZXRzKVxyXG4gICAgICAgICAgICAuZmluZCgnLmlzLWFjdGl2ZScpLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUnKS5ibHVyKCksXHJcbiAgICAgICAgICAgIHNwYW4gPSAkb2xkQnVsbGV0LmZpbmQoJ3NwYW46bGFzdCcpLmRldGFjaCgpLFxyXG4gICAgICAgICAgICAkbmV3QnVsbGV0ID0gdGhpcy4kYnVsbGV0cy5lcShpZHgpLmFkZENsYXNzKCdpcy1hY3RpdmUnKS5hcHBlbmQoc3Bhbik7XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgICAgLyoqXHJcbiAgICAgICAgICAqIERlc3Ryb3lzIHRoZSBjYXJvdXNlbCBhbmQgaGlkZXMgdGhlIGVsZW1lbnQuXHJcbiAgICAgICAgICAqIEBmdW5jdGlvblxyXG4gICAgICAgICAgKi9cclxuICAgICAgICAgIE9yYml0LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJy56Zi5vcmJpdCcpLmZpbmQoJyonKS5vZmYoJy56Zi5vcmJpdCcpLmVuZCgpLmhpZGUoKTtcclxuICAgICAgICAgICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICBGb3VuZGF0aW9uLnBsdWdpbihPcmJpdCwgJ09yYml0Jyk7XHJcblxyXG4gICAgICAgIH0oalF1ZXJ5LCB3aW5kb3cuRm91bmRhdGlvbik7XHJcbiIsIi8qKlxyXG4gKiBSZXNwb25zaXZlTWVudSBtb2R1bGUuXHJcbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5yZXNwb25zaXZlTWVudVxyXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLnRyaWdnZXJzXHJcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubWVkaWFRdWVyeVxyXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmFjY29yZGlvbk1lbnVcclxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5kcmlsbGRvd25cclxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5kcm9wZG93bi1tZW51XHJcbiAqL1xyXG4hZnVuY3Rpb24oRm91bmRhdGlvbiwgJCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLy8gVGhlIHBsdWdpbiBtYXRjaGVzIHRoZSBwbHVnaW4gY2xhc3NlcyB3aXRoIHRoZXNlIHBsdWdpbiBpbnN0YW5jZXMuXHJcbiAgdmFyIE1lbnVQbHVnaW5zID0ge1xyXG4gICAgZHJvcGRvd246IHtcclxuICAgICAgY3NzQ2xhc3M6ICdkcm9wZG93bicsXHJcbiAgICAgIHBsdWdpbjogRm91bmRhdGlvbi5fcGx1Z2luc1snZHJvcGRvd24tbWVudSddIHx8IG51bGxcclxuICAgIH0sXHJcbiAgICBkcmlsbGRvd246IHtcclxuICAgICAgY3NzQ2xhc3M6ICdkcmlsbGRvd24nLFxyXG4gICAgICBwbHVnaW46IEZvdW5kYXRpb24uX3BsdWdpbnNbJ2RyaWxsZG93biddIHx8IG51bGxcclxuICAgIH0sXHJcbiAgICBhY2NvcmRpb246IHtcclxuICAgICAgY3NzQ2xhc3M6ICdhY2NvcmRpb24tbWVudScsXHJcbiAgICAgIHBsdWdpbjogRm91bmRhdGlvbi5fcGx1Z2luc1snYWNjb3JkaW9uLW1lbnUnXSB8fCBudWxsXHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBhIHJlc3BvbnNpdmUgbWVudS5cclxuICAgKiBAY2xhc3NcclxuICAgKiBAZmlyZXMgUmVzcG9uc2l2ZU1lbnUjaW5pdFxyXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gYSBkcm9wZG93biBtZW51LlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cclxuICAgKi9cclxuICBmdW5jdGlvbiBSZXNwb25zaXZlTWVudShlbGVtZW50KSB7XHJcbiAgICB0aGlzLiRlbGVtZW50ID0gJChlbGVtZW50KTtcclxuICAgIHRoaXMucnVsZXMgPSB0aGlzLiRlbGVtZW50LmRhdGEoJ3Jlc3BvbnNpdmUtbWVudScpO1xyXG4gICAgdGhpcy5jdXJyZW50TXEgPSBudWxsO1xyXG4gICAgdGhpcy5jdXJyZW50UGx1Z2luID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLl9pbml0KCk7XHJcbiAgICB0aGlzLl9ldmVudHMoKTtcclxuXHJcbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdSZXNwb25zaXZlTWVudScpO1xyXG4gIH1cclxuXHJcbiAgUmVzcG9uc2l2ZU1lbnUuZGVmYXVsdHMgPSB7fTtcclxuXHJcbiAgLyoqXHJcbiAgICogSW5pdGlhbGl6ZXMgdGhlIE1lbnUgYnkgcGFyc2luZyB0aGUgY2xhc3NlcyBmcm9tIHRoZSAnZGF0YS1SZXNwb25zaXZlTWVudScgYXR0cmlidXRlIG9uIHRoZSBlbGVtZW50LlxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgUmVzcG9uc2l2ZU1lbnUucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcnVsZXNUcmVlID0ge307XHJcblxyXG4gICAgLy8gUGFyc2UgcnVsZXMgZnJvbSBcImNsYXNzZXNcIiBpbiBkYXRhIGF0dHJpYnV0ZVxyXG4gICAgdmFyIHJ1bGVzID0gdGhpcy5ydWxlcy5zcGxpdCgnICcpO1xyXG5cclxuICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBldmVyeSBydWxlIGZvdW5kXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJ1bGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBydWxlID0gcnVsZXNbaV0uc3BsaXQoJy0nKTtcclxuICAgICAgdmFyIHJ1bGVTaXplID0gcnVsZS5sZW5ndGggPiAxID8gcnVsZVswXSA6ICdzbWFsbCc7XHJcbiAgICAgIHZhciBydWxlUGx1Z2luID0gcnVsZS5sZW5ndGggPiAxID8gcnVsZVsxXSA6IHJ1bGVbMF07XHJcblxyXG4gICAgICBpZiAoTWVudVBsdWdpbnNbcnVsZVBsdWdpbl0gIT09IG51bGwpIHtcclxuICAgICAgICBydWxlc1RyZWVbcnVsZVNpemVdID0gTWVudVBsdWdpbnNbcnVsZVBsdWdpbl07XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJ1bGVzID0gcnVsZXNUcmVlO1xyXG5cclxuICAgIGlmICghJC5pc0VtcHR5T2JqZWN0KHJ1bGVzVHJlZSkpIHtcclxuICAgICAgdGhpcy5fY2hlY2tNZWRpYVF1ZXJpZXMoKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBJbml0aWFsaXplcyBldmVudHMgZm9yIHRoZSBNZW51LlxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgUmVzcG9uc2l2ZU1lbnUucHJvdG90eXBlLl9ldmVudHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcblxyXG4gICAgJCh3aW5kb3cpLm9uKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCBmdW5jdGlvbigpIHtcclxuICAgICAgX3RoaXMuX2NoZWNrTWVkaWFRdWVyaWVzKCk7XHJcbiAgICB9KTtcclxuICAgIC8vICQod2luZG93KS5vbigncmVzaXplLnpmLlJlc3BvbnNpdmVNZW51JywgZnVuY3Rpb24oKSB7XHJcbiAgICAvLyAgIF90aGlzLl9jaGVja01lZGlhUXVlcmllcygpO1xyXG4gICAgLy8gfSk7XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2tzIHRoZSBjdXJyZW50IHNjcmVlbiB3aWR0aCBhZ2FpbnN0IGF2YWlsYWJsZSBtZWRpYSBxdWVyaWVzLiBJZiB0aGUgbWVkaWEgcXVlcnkgaGFzIGNoYW5nZWQsIGFuZCB0aGUgcGx1Z2luIG5lZWRlZCBoYXMgY2hhbmdlZCwgdGhlIHBsdWdpbnMgd2lsbCBzd2FwIG91dC5cclxuICAgKiBAZnVuY3Rpb25cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIFJlc3BvbnNpdmVNZW51LnByb3RvdHlwZS5fY2hlY2tNZWRpYVF1ZXJpZXMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBtYXRjaGVkTXEsIF90aGlzID0gdGhpcztcclxuICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBlYWNoIHJ1bGUgYW5kIGZpbmQgdGhlIGxhc3QgbWF0Y2hpbmcgcnVsZVxyXG4gICAgJC5lYWNoKHRoaXMucnVsZXMsIGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICBpZiAoRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3Qoa2V5KSkge1xyXG4gICAgICAgIG1hdGNoZWRNcSA9IGtleTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gTm8gbWF0Y2g/IE5vIGRpY2VcclxuICAgIGlmICghbWF0Y2hlZE1xKSByZXR1cm47XHJcblxyXG4gICAgLy8gUGx1Z2luIGFscmVhZHkgaW5pdGlhbGl6ZWQ/IFdlIGdvb2RcclxuICAgIGlmICh0aGlzLmN1cnJlbnRQbHVnaW4gaW5zdGFuY2VvZiB0aGlzLnJ1bGVzW21hdGNoZWRNcV0ucGx1Z2luKSByZXR1cm47XHJcblxyXG4gICAgLy8gUmVtb3ZlIGV4aXN0aW5nIHBsdWdpbi1zcGVjaWZpYyBDU1MgY2xhc3Nlc1xyXG4gICAgJC5lYWNoKE1lbnVQbHVnaW5zLCBmdW5jdGlvbihrZXksIHZhbHVlKSB7XHJcbiAgICAgIF90aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKHZhbHVlLmNzc0NsYXNzKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgQ1NTIGNsYXNzIGZvciB0aGUgbmV3IHBsdWdpblxyXG4gICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcyh0aGlzLnJ1bGVzW21hdGNoZWRNcV0uY3NzQ2xhc3MpO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGUgbmV3IHBsdWdpblxyXG4gICAgaWYgKHRoaXMuY3VycmVudFBsdWdpbikgdGhpcy5jdXJyZW50UGx1Z2luLmRlc3Ryb3koKTtcclxuICAgIHRoaXMuY3VycmVudFBsdWdpbiA9IG5ldyB0aGlzLnJ1bGVzW21hdGNoZWRNcV0ucGx1Z2luKHRoaXMuJGVsZW1lbnQsIHt9KTtcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBEZXN0cm95cyB0aGUgaW5zdGFuY2Ugb2YgdGhlIGN1cnJlbnQgcGx1Z2luIG9uIHRoaXMgZWxlbWVudCwgYXMgd2VsbCBhcyB0aGUgd2luZG93IHJlc2l6ZSBoYW5kbGVyIHRoYXQgc3dpdGNoZXMgdGhlIHBsdWdpbnMgb3V0LlxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqL1xyXG4gIFJlc3BvbnNpdmVNZW51LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmN1cnJlbnRQbHVnaW4uZGVzdHJveSgpO1xyXG4gICAgJCh3aW5kb3cpLm9mZignLnpmLlJlc3BvbnNpdmVNZW51Jyk7XHJcbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XHJcbiAgfTtcclxuICBGb3VuZGF0aW9uLnBsdWdpbihSZXNwb25zaXZlTWVudSwgJ1Jlc3BvbnNpdmVNZW51Jyk7XHJcblxyXG59KEZvdW5kYXRpb24sIGpRdWVyeSk7XHJcbiIsIi8qKlxyXG4gKiBSZXNwb25zaXZlVG9nZ2xlIG1vZHVsZS5cclxuICogQG1vZHVsZSBmb3VuZGF0aW9uLnJlc3BvbnNpdmVUb2dnbGVcclxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tZWRpYVF1ZXJ5XHJcbiAqL1xyXG4hZnVuY3Rpb24oJCwgRm91bmRhdGlvbikge1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgVGFiIEJhci5cclxuICogQGNsYXNzXHJcbiAqIEBmaXJlcyBSZXNwb25zaXZlVG9nZ2xlI2luaXRcclxuICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIGF0dGFjaCB0YWIgYmFyIGZ1bmN0aW9uYWxpdHkgdG8uXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cclxuICovXHJcbmZ1bmN0aW9uIFJlc3BvbnNpdmVUb2dnbGUoZWxlbWVudCwgb3B0aW9ucykge1xyXG4gIHRoaXMuJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xyXG4gIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBSZXNwb25zaXZlVG9nZ2xlLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XHJcblxyXG4gIHRoaXMuX2luaXQoKTtcclxuICB0aGlzLl9ldmVudHMoKTtcclxuXHJcbiAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnUmVzcG9uc2l2ZVRvZ2dsZScpO1xyXG59XHJcblxyXG5SZXNwb25zaXZlVG9nZ2xlLmRlZmF1bHRzID0ge1xyXG4gIC8qKlxyXG4gICAqIFRoZSBicmVha3BvaW50IGFmdGVyIHdoaWNoIHRoZSBtZW51IGlzIGFsd2F5cyBzaG93biwgYW5kIHRoZSB0YWIgYmFyIGlzIGhpZGRlbi5cclxuICAgKiBAb3B0aW9uXHJcbiAgICogQGV4YW1wbGUgJ21lZGl1bSdcclxuICAgKi9cclxuICBoaWRlRm9yOiAnbWVkaXVtJ1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEluaXRpYWxpemVzIHRoZSB0YWIgYmFyIGJ5IGZpbmRpbmcgdGhlIHRhcmdldCBlbGVtZW50LCB0b2dnbGluZyBlbGVtZW50LCBhbmQgcnVubmluZyB1cGRhdGUoKS5cclxuICogQGZ1bmN0aW9uXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5SZXNwb25zaXZlVG9nZ2xlLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciB0YXJnZXRJRCA9IHRoaXMuJGVsZW1lbnQuZGF0YSgncmVzcG9uc2l2ZS10b2dnbGUnKTtcclxuICBpZiAoIXRhcmdldElEKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdZb3VyIHRhYiBiYXIgbmVlZHMgYW4gSUQgb2YgYSBNZW51IGFzIHRoZSB2YWx1ZSBvZiBkYXRhLXRhYi1iYXIuJyk7XHJcbiAgfVxyXG5cclxuICB0aGlzLiR0YXJnZXRNZW51ID0gJCgnIycrdGFyZ2V0SUQpO1xyXG4gIHRoaXMuJHRvZ2dsZXIgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLXRvZ2dsZV0nKTtcclxuXHJcbiAgdGhpcy5fdXBkYXRlKCk7XHJcbn07XHJcblxyXG4vKipcclxuICogQWRkcyBuZWNlc3NhcnkgZXZlbnQgaGFuZGxlcnMgZm9yIHRoZSB0YWIgYmFyIHRvIHdvcmsuXHJcbiAqIEBmdW5jdGlvblxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuUmVzcG9uc2l2ZVRvZ2dsZS5wcm90b3R5cGUuX2V2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBfdGhpcyA9IHRoaXM7XHJcblxyXG4gICQod2luZG93KS5vbignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgdGhpcy5fdXBkYXRlLmJpbmQodGhpcykpO1xyXG5cclxuICB0aGlzLiR0b2dnbGVyLm9uKCdjbGljay56Zi5yZXNwb25zaXZlVG9nZ2xlJywgdGhpcy50b2dnbGVNZW51LmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENoZWNrcyB0aGUgY3VycmVudCBtZWRpYSBxdWVyeSB0byBkZXRlcm1pbmUgaWYgdGhlIHRhYiBiYXIgc2hvdWxkIGJlIHZpc2libGUgb3IgaGlkZGVuLlxyXG4gKiBAZnVuY3Rpb25cclxuICogQHByaXZhdGVcclxuICovXHJcblJlc3BvbnNpdmVUb2dnbGUucHJvdG90eXBlLl91cGRhdGUgPSBmdW5jdGlvbigpIHtcclxuICAvLyBNb2JpbGVcclxuICBpZiAoIUZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KHRoaXMub3B0aW9ucy5oaWRlRm9yKSkge1xyXG4gICAgdGhpcy4kZWxlbWVudC5zaG93KCk7XHJcbiAgICB0aGlzLiR0YXJnZXRNZW51LmhpZGUoKTtcclxuICB9XHJcblxyXG4gIC8vIERlc2t0b3BcclxuICBlbHNlIHtcclxuICAgIHRoaXMuJGVsZW1lbnQuaGlkZSgpO1xyXG4gICAgdGhpcy4kdGFyZ2V0TWVudS5zaG93KCk7XHJcbiAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFRvZ2dsZXMgdGhlIGVsZW1lbnQgYXR0YWNoZWQgdG8gdGhlIHRhYiBiYXIuIFRoZSB0b2dnbGUgb25seSBoYXBwZW5zIGlmIHRoZSBzY3JlZW4gaXMgc21hbGwgZW5vdWdoIHRvIGFsbG93IGl0LlxyXG4gKiBAZnVuY3Rpb25cclxuICogQGZpcmVzIFJlc3BvbnNpdmVUb2dnbGUjdG9nZ2xlZFxyXG4gKi9cclxuUmVzcG9uc2l2ZVRvZ2dsZS5wcm90b3R5cGUudG9nZ2xlTWVudSA9IGZ1bmN0aW9uKCkge1xyXG4gIGlmICghRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3QodGhpcy5vcHRpb25zLmhpZGVGb3IpKSB7XHJcbiAgICB0aGlzLiR0YXJnZXRNZW51LnRvZ2dsZSgwKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpcmVzIHdoZW4gdGhlIGVsZW1lbnQgYXR0YWNoZWQgdG8gdGhlIHRhYiBiYXIgdG9nZ2xlcy5cclxuICAgICAqIEBldmVudCBSZXNwb25zaXZlVG9nZ2xlI3RvZ2dsZWRcclxuICAgICAqL1xyXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCd0b2dnbGVkLnpmLnJlc3BvbnNpdmVUb2dnbGUnKTtcclxuICB9XHJcbn07XHJcblJlc3BvbnNpdmVUb2dnbGUucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpe1xyXG4gIC8vVE9ETyB0aGlzLi4uXHJcbn07XHJcbkZvdW5kYXRpb24ucGx1Z2luKFJlc3BvbnNpdmVUb2dnbGUsICdSZXNwb25zaXZlVG9nZ2xlJyk7XHJcblxyXG59KGpRdWVyeSwgRm91bmRhdGlvbik7XHJcbiIsIi8qKlxyXG4gKiBSZXZlYWwgbW9kdWxlLlxyXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24ucmV2ZWFsXHJcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcclxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5ib3hcclxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50cmlnZ2Vyc1xyXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnlcclxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tb3Rpb24gaWYgdXNpbmcgYW5pbWF0aW9uc1xyXG4gKi9cclxuIWZ1bmN0aW9uKEZvdW5kYXRpb24sICQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgUmV2ZWFsLlxyXG4gICAqIEBjbGFzc1xyXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byB1c2UgZm9yIHRoZSBtb2RhbC5cclxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIG9wdGlvbmFsIHBhcmFtZXRlcnMuXHJcbiAgICovXHJcblxyXG4gIGZ1bmN0aW9uIFJldmVhbChlbGVtZW50LCBvcHRpb25zKSB7XHJcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcclxuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBSZXZlYWwuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcclxuICAgIHRoaXMuX2luaXQoKTtcclxuXHJcbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdSZXZlYWwnKTtcclxuICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVnaXN0ZXIoJ1JldmVhbCcsIHtcclxuICAgICAgJ0VOVEVSJzogJ29wZW4nLFxyXG4gICAgICAnU1BBQ0UnOiAnb3BlbicsXHJcbiAgICAgICdFU0NBUEUnOiAnY2xvc2UnLFxyXG4gICAgICAnVEFCJzogJ3RhYl9mb3J3YXJkJyxcclxuICAgICAgJ1NISUZUX1RBQic6ICd0YWJfYmFja3dhcmQnXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIFJldmVhbC5kZWZhdWx0cyA9IHtcclxuICAgIC8qKlxyXG4gICAgICogTW90aW9uLVVJIGNsYXNzIHRvIHVzZSBmb3IgYW5pbWF0ZWQgZWxlbWVudHMuIElmIG5vbmUgdXNlZCwgZGVmYXVsdHMgdG8gc2ltcGxlIHNob3cvaGlkZS5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlICdzbGlkZS1pbi1sZWZ0J1xyXG4gICAgICovXHJcbiAgICBhbmltYXRpb25JbjogJycsXHJcbiAgICAvKipcclxuICAgICAqIE1vdGlvbi1VSSBjbGFzcyB0byB1c2UgZm9yIGFuaW1hdGVkIGVsZW1lbnRzLiBJZiBub25lIHVzZWQsIGRlZmF1bHRzIHRvIHNpbXBsZSBzaG93L2hpZGUuXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKiBAZXhhbXBsZSAnc2xpZGUtb3V0LXJpZ2h0J1xyXG4gICAgICovXHJcbiAgICBhbmltYXRpb25PdXQ6ICcnLFxyXG4gICAgLyoqXHJcbiAgICAgKiBUaW1lLCBpbiBtcywgdG8gZGVsYXkgdGhlIG9wZW5pbmcgb2YgYSBtb2RhbCBhZnRlciBhIGNsaWNrIGlmIG5vIGFuaW1hdGlvbiB1c2VkLlxyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgMTBcclxuICAgICAqL1xyXG4gICAgc2hvd0RlbGF5OiAwLFxyXG4gICAgLyoqXHJcbiAgICAgKiBUaW1lLCBpbiBtcywgdG8gZGVsYXkgdGhlIGNsb3Npbmcgb2YgYSBtb2RhbCBhZnRlciBhIGNsaWNrIGlmIG5vIGFuaW1hdGlvbiB1c2VkLlxyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgMTBcclxuICAgICAqL1xyXG4gICAgaGlkZURlbGF5OiAwLFxyXG4gICAgLyoqXHJcbiAgICAgKiBBbGxvd3MgYSBjbGljayBvbiB0aGUgYm9keS9vdmVybGF5IHRvIGNsb3NlIHRoZSBtb2RhbC5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlIHRydWVcclxuICAgICAqL1xyXG4gICAgY2xvc2VPbkNsaWNrOiB0cnVlLFxyXG4gICAgLyoqXHJcbiAgICAgKiBBbGxvd3MgdGhlIG1vZGFsIHRvIGNsb3NlIGlmIHRoZSB1c2VyIHByZXNzZXMgdGhlIGBFU0NBUEVgIGtleS5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlIHRydWVcclxuICAgICAqL1xyXG4gICAgY2xvc2VPbkVzYzogdHJ1ZSxcclxuICAgIC8qKlxyXG4gICAgICogSWYgdHJ1ZSwgYWxsb3dzIG11bHRpcGxlIG1vZGFscyB0byBiZSBkaXNwbGF5ZWQgYXQgb25jZS5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlIGZhbHNlXHJcbiAgICAgKi9cclxuICAgIG11bHRpcGxlT3BlbmVkOiBmYWxzZSxcclxuICAgIC8qKlxyXG4gICAgICogRGlzdGFuY2UsIGluIHBpeGVscywgdGhlIG1vZGFsIHNob3VsZCBwdXNoIGRvd24gZnJvbSB0aGUgdG9wIG9mIHRoZSBzY3JlZW4uXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKiBAZXhhbXBsZSAxMDBcclxuICAgICAqL1xyXG4gICAgdk9mZnNldDogMTAwLFxyXG4gICAgLyoqXHJcbiAgICAgKiBEaXN0YW5jZSwgaW4gcGl4ZWxzLCB0aGUgbW9kYWwgc2hvdWxkIHB1c2ggaW4gZnJvbSB0aGUgc2lkZSBvZiB0aGUgc2NyZWVuLlxyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgMFxyXG4gICAgICovXHJcbiAgICBoT2Zmc2V0OiAwLFxyXG4gICAgLyoqXHJcbiAgICAgKiBBbGxvd3MgdGhlIG1vZGFsIHRvIGJlIGZ1bGxzY3JlZW4sIGNvbXBsZXRlbHkgYmxvY2tpbmcgb3V0IHRoZSByZXN0IG9mIHRoZSB2aWV3LiBKUyBjaGVja3MgZm9yIHRoaXMgYXMgd2VsbC5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlIGZhbHNlXHJcbiAgICAgKi9cclxuICAgIGZ1bGxTY3JlZW46IGZhbHNlLFxyXG4gICAgLyoqXHJcbiAgICAgKiBQZXJjZW50YWdlIG9mIHNjcmVlbiBoZWlnaHQgdGhlIG1vZGFsIHNob3VsZCBwdXNoIHVwIGZyb20gdGhlIGJvdHRvbSBvZiB0aGUgdmlldy5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlIDEwXHJcbiAgICAgKi9cclxuICAgIGJ0bU9mZnNldFBjdDogMTAsXHJcbiAgICAvKipcclxuICAgICAqIEFsbG93cyB0aGUgbW9kYWwgdG8gZ2VuZXJhdGUgYW4gb3ZlcmxheSBkaXYsIHdoaWNoIHdpbGwgY292ZXIgdGhlIHZpZXcgd2hlbiBtb2RhbCBvcGVucy5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlIHRydWVcclxuICAgICAqL1xyXG4gICAgb3ZlcmxheTogdHJ1ZSxcclxuICAgIC8qKlxyXG4gICAgICogQWxsb3dzIHRoZSBtb2RhbCB0byByZW1vdmUgYW5kIHJlaW5qZWN0IG1hcmt1cCBvbiBjbG9zZS4gU2hvdWxkIGJlIHRydWUgaWYgdXNpbmcgdmlkZW8gZWxlbWVudHMgdy9vIHVzaW5nIHByb3ZpZGVyJ3MgYXBpLCBvdGhlcndpc2UsIHZpZGVvcyB3aWxsIGNvbnRpbnVlIHRvIHBsYXkgaW4gdGhlIGJhY2tncm91bmQuXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKiBAZXhhbXBsZSBmYWxzZVxyXG4gICAgICovXHJcbiAgICByZXNldE9uQ2xvc2U6IGZhbHNlLFxyXG4gICAgLyoqXHJcbiAgICAgKiBBbGxvd3MgdGhlIG1vZGFsIHRvIGFsdGVyIHRoZSB1cmwgb24gb3Blbi9jbG9zZSwgYW5kIGFsbG93cyB0aGUgdXNlIG9mIHRoZSBgYmFja2AgYnV0dG9uIHRvIGNsb3NlIG1vZGFscy4gQUxTTywgYWxsb3dzIGEgbW9kYWwgdG8gYXV0by1tYW5pYWNhbGx5IG9wZW4gb24gcGFnZSBsb2FkIElGIHRoZSBoYXNoID09PSB0aGUgbW9kYWwncyB1c2VyLXNldCBpZC5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlIGZhbHNlXHJcbiAgICAgKi9cclxuICAgIGRlZXBMaW5rOiBmYWxzZVxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEluaXRpYWxpemVzIHRoZSBtb2RhbCBieSBhZGRpbmcgdGhlIG92ZXJsYXkgYW5kIGNsb3NlIGJ1dHRvbnMsIChpZiBzZWxlY3RlZCkuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBSZXZlYWwucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKXtcclxuICAgIHRoaXMuaWQgPSB0aGlzLiRlbGVtZW50LmF0dHIoJ2lkJyk7XHJcbiAgICB0aGlzLmlzQWN0aXZlID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy4kYW5jaG9yID0gJCgnW2RhdGEtb3Blbj1cIicgKyB0aGlzLmlkICsgJ1wiXScpLmxlbmd0aCA/ICQoJ1tkYXRhLW9wZW49XCInICsgdGhpcy5pZCArICdcIl0nKSA6ICQoJ1tkYXRhLXRvZ2dsZT1cIicgKyB0aGlzLmlkICsgJ1wiXScpO1xyXG5cclxuICAgIGlmKHRoaXMuJGFuY2hvci5sZW5ndGgpe1xyXG4gICAgICB2YXIgYW5jaG9ySWQgPSB0aGlzLiRhbmNob3JbMF0uaWQgfHwgRm91bmRhdGlvbi5HZXRZb0RpZ2l0cyg2LCAncmV2ZWFsJyk7XHJcblxyXG4gICAgICB0aGlzLiRhbmNob3IuYXR0cih7XHJcbiAgICAgICAgJ2FyaWEtY29udHJvbHMnOiB0aGlzLmlkLFxyXG4gICAgICAgICdpZCc6IGFuY2hvcklkLFxyXG4gICAgICAgICdhcmlhLWhhc3BvcHVwJzogdHJ1ZSxcclxuICAgICAgICAndGFiaW5kZXgnOiAwXHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLiRlbGVtZW50LmF0dHIoeydhcmlhLWxhYmVsbGVkYnknOiBhbmNob3JJZH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRoaXMub3B0aW9ucy5mdWxsU2NyZWVuID0gdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnZnVsbCcpO1xyXG4gICAgaWYodGhpcy5vcHRpb25zLmZ1bGxTY3JlZW4gfHwgdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnZnVsbCcpKXtcclxuICAgICAgdGhpcy5vcHRpb25zLmZ1bGxTY3JlZW4gPSB0cnVlO1xyXG4gICAgICB0aGlzLm9wdGlvbnMub3ZlcmxheSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgaWYodGhpcy5vcHRpb25zLm92ZXJsYXkgJiYgIXRoaXMuJG92ZXJsYXkpe1xyXG4gICAgICB0aGlzLiRvdmVybGF5ID0gdGhpcy5fbWFrZU92ZXJsYXkodGhpcy5pZCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKHtcclxuICAgICAgICAncm9sZSc6ICdkaWFsb2cnLFxyXG4gICAgICAgICdhcmlhLWhpZGRlbic6IHRydWUsXHJcbiAgICAgICAgJ2RhdGEteWV0aS1ib3gnOiB0aGlzLmlkLFxyXG4gICAgICAgICdkYXRhLXJlc2l6ZSc6IHRoaXMuaWRcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuX2V2ZW50cygpO1xyXG4gICAgaWYodGhpcy5vcHRpb25zLmRlZXBMaW5rICYmIHdpbmRvdy5sb2NhdGlvbi5oYXNoID09PSAoICcjJyArIHRoaXMuaWQpKXtcclxuICAgICAgJCh3aW5kb3cpLm9uZSgnbG9hZC56Zi5yZXZlYWwnLCB0aGlzLm9wZW4uYmluZCh0aGlzKSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhbiBvdmVybGF5IGRpdiB0byBkaXNwbGF5IGJlaGluZCB0aGUgbW9kYWwuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBSZXZlYWwucHJvdG90eXBlLl9tYWtlT3ZlcmxheSA9IGZ1bmN0aW9uKGlkKXtcclxuICAgIHZhciAkb3ZlcmxheSA9ICQoJzxkaXY+PC9kaXY+JylcclxuICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3JldmVhbC1vdmVybGF5JylcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cih7J3RhYmluZGV4JzogLTEsICdhcmlhLWhpZGRlbic6IHRydWV9KVxyXG4gICAgICAgICAgICAgICAgICAgIC5hcHBlbmRUbygnYm9keScpO1xyXG4gICAgaWYodGhpcy5vcHRpb25zLmNsb3NlT25DbGljayl7XHJcbiAgICAgICRvdmVybGF5LmF0dHIoe1xyXG4gICAgICAgICdkYXRhLWNsb3NlJzogaWRcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gJG92ZXJsYXk7XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBldmVudCBoYW5kbGVycyBmb3IgdGhlIG1vZGFsLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgUmV2ZWFsLnByb3RvdHlwZS5fZXZlbnRzID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcblxyXG4gICAgdGhpcy4kZWxlbWVudC5vbih7XHJcbiAgICAgICdvcGVuLnpmLnRyaWdnZXInOiB0aGlzLm9wZW4uYmluZCh0aGlzKSxcclxuICAgICAgJ2Nsb3NlLnpmLnRyaWdnZXInOiB0aGlzLmNsb3NlLmJpbmQodGhpcyksXHJcbiAgICAgICd0b2dnbGUuemYudHJpZ2dlcic6IHRoaXMudG9nZ2xlLmJpbmQodGhpcyksXHJcbiAgICAgICdyZXNpemVtZS56Zi50cmlnZ2VyJzogZnVuY3Rpb24oKXtcclxuICAgICAgICBpZihfdGhpcy4kZWxlbWVudC5pcygnOnZpc2libGUnKSl7XHJcbiAgICAgICAgICBfdGhpcy5fc2V0UG9zaXRpb24oZnVuY3Rpb24oKXt9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGlmKHRoaXMuJGFuY2hvci5sZW5ndGgpe1xyXG4gICAgICB0aGlzLiRhbmNob3Iub24oJ2tleWRvd24uemYucmV2ZWFsJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgaWYoZS53aGljaCA9PT0gMTMgfHwgZS53aGljaCA9PT0gMzIpe1xyXG4gICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgIF90aGlzLm9wZW4oKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBpZih0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrICYmIHRoaXMub3B0aW9ucy5vdmVybGF5KXtcclxuICAgICAgdGhpcy4kb3ZlcmxheS5vZmYoJy56Zi5yZXZlYWwnKS5vbignY2xpY2suemYucmV2ZWFsJywgdGhpcy5jbG9zZS5iaW5kKHRoaXMpKTtcclxuICAgIH1cclxuICAgIGlmKHRoaXMub3B0aW9ucy5kZWVwTGluayl7XHJcbiAgICAgICQod2luZG93KS5vbigncG9wc3RhdGUuemYucmV2ZWFsOicgKyB0aGlzLmlkLCB0aGlzLl9oYW5kbGVTdGF0ZS5iaW5kKHRoaXMpKTtcclxuICAgIH1cclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIEhhbmRsZXMgbW9kYWwgbWV0aG9kcyBvbiBiYWNrL2ZvcndhcmQgYnV0dG9uIGNsaWNrcyBvciBhbnkgb3RoZXIgZXZlbnQgdGhhdCB0cmlnZ2VycyBwb3BzdGF0ZS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIFJldmVhbC5wcm90b3R5cGUuX2hhbmRsZVN0YXRlID0gZnVuY3Rpb24oZSl7XHJcbiAgICBpZih3aW5kb3cubG9jYXRpb24uaGFzaCA9PT0gKCAnIycgKyB0aGlzLmlkKSAmJiAhdGhpcy5pc0FjdGl2ZSl7IHRoaXMub3BlbigpOyB9XHJcbiAgICBlbHNleyB0aGlzLmNsb3NlKCk7IH1cclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHBvc2l0aW9uIG9mIHRoZSBtb2RhbCBiZWZvcmUgb3BlbmluZ1xyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIC0gYSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gcG9zaXRpb25pbmcgaXMgY29tcGxldGUuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBSZXZlYWwucHJvdG90eXBlLl9zZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKGNiKXtcclxuICAgIHZhciBlbGVEaW1zID0gRm91bmRhdGlvbi5Cb3guR2V0RGltZW5zaW9ucyh0aGlzLiRlbGVtZW50KTtcclxuICAgIHZhciBlbGVQb3MgPSB0aGlzLm9wdGlvbnMuZnVsbFNjcmVlbiA/ICdyZXZlYWwgZnVsbCcgOiAoZWxlRGltcy5oZWlnaHQgPj0gKDAuNSAqIGVsZURpbXMud2luZG93RGltcy5oZWlnaHQpKSA/ICdyZXZlYWwnIDogJ2NlbnRlcic7XHJcblxyXG4gICAgaWYoZWxlUG9zID09PSAncmV2ZWFsIGZ1bGwnKXtcclxuICAgICAgLy9zZXQgdG8gZnVsbCBoZWlnaHQvd2lkdGhcclxuICAgICAgdGhpcy4kZWxlbWVudFxyXG4gICAgICAgICAgLm9mZnNldChGb3VuZGF0aW9uLkJveC5HZXRPZmZzZXRzKHRoaXMuJGVsZW1lbnQsIG51bGwsIGVsZVBvcywgdGhpcy5vcHRpb25zLnZPZmZzZXQpKVxyXG4gICAgICAgICAgLmNzcyh7XHJcbiAgICAgICAgICAgICdoZWlnaHQnOiBlbGVEaW1zLndpbmRvd0RpbXMuaGVpZ2h0LFxyXG4gICAgICAgICAgICAnd2lkdGgnOiBlbGVEaW1zLndpbmRvd0RpbXMud2lkdGhcclxuICAgICAgICAgIH0pO1xyXG4gICAgfWVsc2UgaWYoIUZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KCdtZWRpdW0nKSB8fCAhRm91bmRhdGlvbi5Cb3guSW1Ob3RUb3VjaGluZ1lvdSh0aGlzLiRlbGVtZW50LCBudWxsLCB0cnVlLCBmYWxzZSkpe1xyXG4gICAgICAvL2lmIHNtYWxsZXIgdGhhbiBtZWRpdW0sIHJlc2l6ZSB0byAxMDAlIHdpZHRoIG1pbnVzIGFueSBjdXN0b20gTC9SIG1hcmdpblxyXG4gICAgICB0aGlzLiRlbGVtZW50XHJcbiAgICAgICAgICAuY3NzKHtcclxuICAgICAgICAgICAgJ3dpZHRoJzogZWxlRGltcy53aW5kb3dEaW1zLndpZHRoIC0gKHRoaXMub3B0aW9ucy5oT2Zmc2V0ICogMilcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAub2Zmc2V0KEZvdW5kYXRpb24uQm94LkdldE9mZnNldHModGhpcy4kZWxlbWVudCwgbnVsbCwgJ2NlbnRlcicsIHRoaXMub3B0aW9ucy52T2Zmc2V0LCB0aGlzLm9wdGlvbnMuaE9mZnNldCkpO1xyXG4gICAgICAvL2ZsYWcgYSBib29sZWFuIHNvIHdlIGNhbiByZXNldCB0aGUgc2l6ZSBhZnRlciB0aGUgZWxlbWVudCBpcyBjbG9zZWQuXHJcbiAgICAgIHRoaXMuY2hhbmdlZFNpemUgPSB0cnVlO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnRcclxuICAgICAgICAgIC5jc3Moe1xyXG4gICAgICAgICAgICAnbWF4LWhlaWdodCc6IGVsZURpbXMud2luZG93RGltcy5oZWlnaHQgLSAodGhpcy5vcHRpb25zLnZPZmZzZXQgKiAodGhpcy5vcHRpb25zLmJ0bU9mZnNldFBjdCAvIDEwMCArIDEpKSxcclxuICAgICAgICAgICAgJ3dpZHRoJzogJydcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAub2Zmc2V0KEZvdW5kYXRpb24uQm94LkdldE9mZnNldHModGhpcy4kZWxlbWVudCwgbnVsbCwgZWxlUG9zLCB0aGlzLm9wdGlvbnMudk9mZnNldCkpO1xyXG4gICAgICAgICAgLy90aGUgbWF4IGhlaWdodCBiYXNlZCBvbiBhIHBlcmNlbnRhZ2Ugb2YgdmVydGljYWwgb2Zmc2V0IHBsdXMgdmVydGljYWwgb2Zmc2V0XHJcbiAgICB9XHJcblxyXG4gICAgY2IoKTtcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBPcGVucyB0aGUgbW9kYWwgY29udHJvbGxlZCBieSBgdGhpcy4kYW5jaG9yYCwgYW5kIGNsb3NlcyBhbGwgb3RoZXJzIGJ5IGRlZmF1bHQuXHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICogQGZpcmVzIFJldmVhbCNjbG9zZW1lXHJcbiAgICogQGZpcmVzIFJldmVhbCNvcGVuXHJcbiAgICovXHJcbiAgUmV2ZWFsLnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24oKXtcclxuICAgIGlmKHRoaXMub3B0aW9ucy5kZWVwTGluayl7XHJcbiAgICAgIHZhciBoYXNoID0gJyMnICsgdGhpcy5pZDtcclxuXHJcbiAgICAgIGlmKHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSl7XHJcbiAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKG51bGwsIG51bGwsIGhhc2gpO1xyXG4gICAgICB9ZWxzZXtcclxuICAgICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IGhhc2g7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgdGhpcy5pc0FjdGl2ZSA9IHRydWU7XHJcbiAgICAvL21ha2UgZWxlbWVudCBpbnZpc2libGUsIGJ1dCByZW1vdmUgZGlzcGxheTogbm9uZSBzbyB3ZSBjYW4gZ2V0IHNpemUgYW5kIHBvc2l0aW9uaW5nXHJcbiAgICB0aGlzLiRlbGVtZW50XHJcbiAgICAgICAgLmNzcyh7J3Zpc2liaWxpdHknOiAnaGlkZGVuJ30pXHJcbiAgICAgICAgLnNob3coKVxyXG4gICAgICAgIC5zY3JvbGxUb3AoMCk7XHJcblxyXG4gICAgdGhpcy5fc2V0UG9zaXRpb24oZnVuY3Rpb24oKXtcclxuICAgICAgX3RoaXMuJGVsZW1lbnQuaGlkZSgpXHJcbiAgICAgICAgICAgICAgICAgICAuY3NzKHsndmlzaWJpbGl0eSc6ICcnfSk7XHJcbiAgICAgIGlmKCFfdGhpcy5vcHRpb25zLm11bHRpcGxlT3BlbmVkKXtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGaXJlcyBpbW1lZGlhdGVseSBiZWZvcmUgdGhlIG1vZGFsIG9wZW5zLlxyXG4gICAgICAgICAqIENsb3NlcyBhbnkgb3RoZXIgbW9kYWxzIHRoYXQgYXJlIGN1cnJlbnRseSBvcGVuXHJcbiAgICAgICAgICogQGV2ZW50IFJldmVhbCNjbG9zZW1lXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgX3RoaXMuJGVsZW1lbnQudHJpZ2dlcignY2xvc2VtZS56Zi5yZXZlYWwnLCBfdGhpcy5pZCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYoX3RoaXMub3B0aW9ucy5hbmltYXRpb25Jbil7XHJcbiAgICAgICAgaWYoX3RoaXMub3B0aW9ucy5vdmVybGF5KXtcclxuICAgICAgICAgIEZvdW5kYXRpb24uTW90aW9uLmFuaW1hdGVJbihfdGhpcy4kb3ZlcmxheSwgJ2ZhZGUtaW4nLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBGb3VuZGF0aW9uLk1vdGlvbi5hbmltYXRlSW4oX3RoaXMuJGVsZW1lbnQsIF90aGlzLm9wdGlvbnMuYW5pbWF0aW9uSW4sIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgX3RoaXMuZm9jdXNhYmxlRWxlbWVudHMgPSBGb3VuZGF0aW9uLktleWJvYXJkLmZpbmRGb2N1c2FibGUoX3RoaXMuJGVsZW1lbnQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgRm91bmRhdGlvbi5Nb3Rpb24uYW5pbWF0ZUluKF90aGlzLiRlbGVtZW50LCBfdGhpcy5vcHRpb25zLmFuaW1hdGlvbkluLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBfdGhpcy5mb2N1c2FibGVFbGVtZW50cyA9IEZvdW5kYXRpb24uS2V5Ym9hcmQuZmluZEZvY3VzYWJsZShfdGhpcy4kZWxlbWVudCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1lbHNle1xyXG4gICAgICAgIGlmKF90aGlzLm9wdGlvbnMub3ZlcmxheSl7XHJcbiAgICAgICAgICBfdGhpcy4kb3ZlcmxheS5zaG93KDAsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIF90aGlzLiRlbGVtZW50LnNob3coX3RoaXMub3B0aW9ucy5zaG93RGVsYXksIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICBfdGhpcy4kZWxlbWVudC5zaG93KF90aGlzLm9wdGlvbnMuc2hvd0RlbGF5LCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgLy8gaGFuZGxlIGFjY2Vzc2liaWxpdHlcclxuICAgIHRoaXMuJGVsZW1lbnQuYXR0cih7J2FyaWEtaGlkZGVuJzogZmFsc2V9KS5hdHRyKCd0YWJpbmRleCcsIC0xKS5mb2N1cygpXHJcbiAgICAvKipcclxuICAgICAqIEZpcmVzIHdoZW4gdGhlIG1vZGFsIGhhcyBzdWNjZXNzZnVsbHkgb3BlbmVkLlxyXG4gICAgICogQGV2ZW50IFJldmVhbCNvcGVuXHJcbiAgICAgKi9cclxuICAgICAgICAgICAgICAgICAudHJpZ2dlcignb3Blbi56Zi5yZXZlYWwnKTtcclxuXHJcbiAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ2lzLXJldmVhbC1vcGVuJylcclxuICAgICAgICAgICAgIC5hdHRyKHsnYXJpYS1oaWRkZW4nOiAodGhpcy5vcHRpb25zLm92ZXJsYXkgfHwgdGhpcy5vcHRpb25zLmZ1bGxTY3JlZW4pID8gdHJ1ZSA6IGZhbHNlfSk7XHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgIF90aGlzLl9leHRyYUhhbmRsZXJzKCk7XHJcbiAgICB9LCAwKTtcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGV4dHJhIGV2ZW50IGhhbmRsZXJzIGZvciB0aGUgYm9keSBhbmQgd2luZG93IGlmIG5lY2Vzc2FyeS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIFJldmVhbC5wcm90b3R5cGUuX2V4dHJhSGFuZGxlcnMgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgIHRoaXMuZm9jdXNhYmxlRWxlbWVudHMgPSBGb3VuZGF0aW9uLktleWJvYXJkLmZpbmRGb2N1c2FibGUodGhpcy4kZWxlbWVudCk7XHJcblxyXG4gICAgaWYoIXRoaXMub3B0aW9ucy5vdmVybGF5ICYmIHRoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2sgJiYgIXRoaXMub3B0aW9ucy5mdWxsU2NyZWVuKXtcclxuICAgICAgJCgnYm9keScpLm9uKCdjbGljay56Zi5yZXZlYWwnLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBpZihlLnRhcmdldCA9PT0gX3RoaXMuJGVsZW1lbnRbMF0gfHwgJC5jb250YWlucyhfdGhpcy4kZWxlbWVudFswXSwgZS50YXJnZXQpKXsgcmV0dXJuOyB9XHJcbiAgICAgICAgX3RoaXMuY2xvc2UoKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBpZih0aGlzLm9wdGlvbnMuY2xvc2VPbkVzYyl7XHJcbiAgICAgICQod2luZG93KS5vbigna2V5ZG93bi56Zi5yZXZlYWwnLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBGb3VuZGF0aW9uLktleWJvYXJkLmhhbmRsZUtleShlLCAnUmV2ZWFsJywge1xyXG4gICAgICAgICAgY2xvc2U6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoX3RoaXMub3B0aW9ucy5jbG9zZU9uRXNjKSB7XHJcbiAgICAgICAgICAgICAgX3RoaXMuY2xvc2UoKTtcclxuICAgICAgICAgICAgICBfdGhpcy4kYW5jaG9yLmZvY3VzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoX3RoaXMuZm9jdXNhYmxlRWxlbWVudHMubGVuZ3RoID09PSAwKSB7IC8vIG5vIGZvY3VzYWJsZSBlbGVtZW50cyBpbnNpZGUgdGhlIG1vZGFsIGF0IGFsbCwgcHJldmVudCB0YWJiaW5nIGluIGdlbmVyYWxcclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGxvY2sgZm9jdXMgd2l0aGluIG1vZGFsIHdoaWxlIHRhYmJpbmdcclxuICAgIHRoaXMuJGVsZW1lbnQub24oJ2tleWRvd24uemYucmV2ZWFsJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICB2YXIgJHRhcmdldCA9ICQodGhpcyk7XHJcbiAgICAgIC8vIGhhbmRsZSBrZXlib2FyZCBldmVudCB3aXRoIGtleWJvYXJkIHV0aWxcclxuICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ1JldmVhbCcsIHtcclxuICAgICAgICB0YWJfZm9yd2FyZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBpZiAoX3RoaXMuJGVsZW1lbnQuZmluZCgnOmZvY3VzJykuaXMoX3RoaXMuZm9jdXNhYmxlRWxlbWVudHMuZXEoLTEpKSkgeyAvLyBsZWZ0IG1vZGFsIGRvd253YXJkcywgc2V0dGluZyBmb2N1cyB0byBmaXJzdCBlbGVtZW50XHJcbiAgICAgICAgICAgIF90aGlzLmZvY3VzYWJsZUVsZW1lbnRzLmVxKDApLmZvY3VzKCk7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHRhYl9iYWNrd2FyZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBpZiAoX3RoaXMuJGVsZW1lbnQuZmluZCgnOmZvY3VzJykuaXMoX3RoaXMuZm9jdXNhYmxlRWxlbWVudHMuZXEoMCkpIHx8IF90aGlzLiRlbGVtZW50LmlzKCc6Zm9jdXMnKSkgeyAvLyBsZWZ0IG1vZGFsIHVwd2FyZHMsIHNldHRpbmcgZm9jdXMgdG8gbGFzdCBlbGVtZW50XHJcbiAgICAgICAgICAgIF90aGlzLmZvY3VzYWJsZUVsZW1lbnRzLmVxKC0xKS5mb2N1cygpO1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvcGVuOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGlmIChfdGhpcy4kZWxlbWVudC5maW5kKCc6Zm9jdXMnKS5pcyhfdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS1jbG9zZV0nKSkpIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHsgLy8gc2V0IGZvY3VzIGJhY2sgdG8gYW5jaG9yIGlmIGNsb3NlIGJ1dHRvbiBoYXMgYmVlbiBhY3RpdmF0ZWRcclxuICAgICAgICAgICAgICBfdGhpcy4kYW5jaG9yLmZvY3VzKCk7XHJcbiAgICAgICAgICAgIH0sIDEpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmICgkdGFyZ2V0LmlzKF90aGlzLmZvY3VzYWJsZUVsZW1lbnRzKSkgeyAvLyBkb250J3QgdHJpZ2dlciBpZiBhY3VhbCBlbGVtZW50IGhhcyBmb2N1cyAoaS5lLiBpbnB1dHMsIGxpbmtzLCAuLi4pXHJcbiAgICAgICAgICAgIF90aGlzLm9wZW4oKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGNsb3NlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGlmIChfdGhpcy5vcHRpb25zLmNsb3NlT25Fc2MpIHtcclxuICAgICAgICAgICAgX3RoaXMuY2xvc2UoKTtcclxuICAgICAgICAgICAgX3RoaXMuJGFuY2hvci5mb2N1cygpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2xvc2VzIHRoZSBtb2RhbC5cclxuICAgKiBAZnVuY3Rpb25cclxuICAgKiBAZmlyZXMgUmV2ZWFsI2Nsb3NlZFxyXG4gICAqL1xyXG4gIFJldmVhbC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpe1xyXG4gICAgaWYoIXRoaXMuaXNBY3RpdmUgfHwgIXRoaXMuJGVsZW1lbnQuaXMoJzp2aXNpYmxlJykpe1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG5cclxuICAgIGlmKHRoaXMub3B0aW9ucy5hbmltYXRpb25PdXQpe1xyXG4gICAgICBGb3VuZGF0aW9uLk1vdGlvbi5hbmltYXRlT3V0KHRoaXMuJGVsZW1lbnQsIHRoaXMub3B0aW9ucy5hbmltYXRpb25PdXQsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgaWYoX3RoaXMub3B0aW9ucy5vdmVybGF5KXtcclxuICAgICAgICAgIEZvdW5kYXRpb24uTW90aW9uLmFuaW1hdGVPdXQoX3RoaXMuJG92ZXJsYXksICdmYWRlLW91dCcsIGZpbmlzaFVwKTtcclxuICAgICAgICB9ZWxzZXsgZmluaXNoVXAoKTsgfVxyXG4gICAgICB9KTtcclxuICAgIH1lbHNle1xyXG4gICAgICB0aGlzLiRlbGVtZW50LmhpZGUoX3RoaXMub3B0aW9ucy5oaWRlRGVsYXksIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgaWYoX3RoaXMub3B0aW9ucy5vdmVybGF5KXtcclxuICAgICAgICAgIF90aGlzLiRvdmVybGF5LmhpZGUoMCwgZmluaXNoVXApO1xyXG4gICAgICAgIH1lbHNleyBmaW5pc2hVcCgpOyB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLy9jb25kaXRpb25hbHMgdG8gcmVtb3ZlIGV4dHJhIGV2ZW50IGxpc3RlbmVycyBhZGRlZCBvbiBvcGVuXHJcbiAgICBpZih0aGlzLm9wdGlvbnMuY2xvc2VPbkVzYyl7XHJcbiAgICAgICQod2luZG93KS5vZmYoJ2tleWRvd24uemYucmV2ZWFsJyk7XHJcbiAgICB9XHJcbiAgICBpZighdGhpcy5vcHRpb25zLm92ZXJsYXkgJiYgdGhpcy5vcHRpb25zLmNsb3NlT25DbGljayl7XHJcbiAgICAgICQoJ2JvZHknKS5vZmYoJ2NsaWNrLnpmLnJldmVhbCcpO1xyXG4gICAgfVxyXG4gICAgdGhpcy4kZWxlbWVudC5vZmYoJ2tleWRvd24uemYucmV2ZWFsJyk7XHJcbiAgICBmdW5jdGlvbiBmaW5pc2hVcCgpe1xyXG4gICAgICAvL2lmIHRoZSBtb2RhbCBjaGFuZ2VkIHNpemUsIHJlc2V0IGl0XHJcbiAgICAgIGlmKF90aGlzLmNoYW5nZWRTaXplKXtcclxuICAgICAgICBfdGhpcy4kZWxlbWVudC5jc3Moe1xyXG4gICAgICAgICAgJ2hlaWdodCc6ICcnLFxyXG4gICAgICAgICAgJ3dpZHRoJzogJydcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ2lzLXJldmVhbC1vcGVuJykuYXR0cih7J2FyaWEtaGlkZGVuJzogZmFsc2UsICd0YWJpbmRleCc6ICcnfSk7XHJcbiAgICAgIF90aGlzLiRlbGVtZW50LmF0dHIoeydhcmlhLWhpZGRlbic6IHRydWV9KVxyXG4gICAgICAvKipcclxuICAgICAgKiBGaXJlcyB3aGVuIHRoZSBtb2RhbCBpcyBkb25lIGNsb3NpbmcuXHJcbiAgICAgICogQGV2ZW50IFJldmVhbCNjbG9zZWRcclxuICAgICAgKi9cclxuICAgICAgLnRyaWdnZXIoJ2Nsb3NlZC56Zi5yZXZlYWwnKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAqIFJlc2V0cyB0aGUgbW9kYWwgY29udGVudFxyXG4gICAgKiBUaGlzIHByZXZlbnRzIGEgcnVubmluZyB2aWRlbyB0byBrZWVwIGdvaW5nIGluIHRoZSBiYWNrZ3JvdW5kXHJcbiAgICAqL1xyXG4gICAgaWYodGhpcy5vcHRpb25zLnJlc2V0T25DbG9zZSkge1xyXG4gICAgICB0aGlzLiRlbGVtZW50Lmh0bWwodGhpcy4kZWxlbWVudC5odG1sKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuaXNBY3RpdmUgPSBmYWxzZTtcclxuICAgICBpZihfdGhpcy5vcHRpb25zLmRlZXBMaW5rKXtcclxuICAgICAgIGlmKHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZSl7XHJcbiAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZShcIlwiLCBkb2N1bWVudC50aXRsZSwgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKTtcclxuICAgICAgIH1lbHNle1xyXG4gICAgICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICcnO1xyXG4gICAgICAgfVxyXG4gICAgIH1cclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIFRvZ2dsZXMgdGhlIG9wZW4vY2xvc2VkIHN0YXRlIG9mIGEgbW9kYWwuXHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICovXHJcbiAgUmV2ZWFsLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbigpe1xyXG4gICAgaWYodGhpcy5pc0FjdGl2ZSl7XHJcbiAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgIH1lbHNle1xyXG4gICAgICB0aGlzLm9wZW4oKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBEZXN0cm95cyBhbiBpbnN0YW5jZSBvZiBhIG1vZGFsLlxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqL1xyXG4gIFJldmVhbC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYodGhpcy5vcHRpb25zLm92ZXJsYXkpe1xyXG4gICAgICB0aGlzLiRvdmVybGF5LmhpZGUoKS5vZmYoKS5yZW1vdmUoKTtcclxuICAgIH1cclxuICAgIHRoaXMuJGVsZW1lbnQuaGlkZSgpLm9mZigpO1xyXG4gICAgdGhpcy4kYW5jaG9yLm9mZignLnpmJyk7XHJcbiAgICAkKHdpbmRvdykub2ZmKCcuemYucmV2ZWFsOicgKyB0aGlzLmlkKTtcclxuXHJcbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XHJcbiAgfTtcclxuXHJcbiAgRm91bmRhdGlvbi5wbHVnaW4oUmV2ZWFsLCAnUmV2ZWFsJyk7XHJcblxyXG4gIC8vIEV4cG9ydHMgZm9yIEFNRC9Ccm93c2VyaWZ5XHJcbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFJldmVhbDtcclxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJylcclxuICAgIGRlZmluZShbJ2ZvdW5kYXRpb24nXSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiBSZXZlYWw7XHJcbiAgICB9KTtcclxuXHJcbn0oRm91bmRhdGlvbiwgalF1ZXJ5KTtcclxuIiwiLyoqXHJcbiAqIFNsaWRlciBtb2R1bGUuXHJcbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5zbGlkZXJcclxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tb3Rpb25cclxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50cmlnZ2Vyc1xyXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmtleWJvYXJkXHJcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudG91Y2hcclxuICovXHJcbiFmdW5jdGlvbigkLCBGb3VuZGF0aW9uKXtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYSBkcmlsbGRvd24gbWVudS5cclxuICAgKiBAY2xhc3NcclxuICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBpbnRvIGFuIGFjY29yZGlvbiBtZW51LlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cclxuICAgKi9cclxuICBmdW5jdGlvbiBTbGlkZXIoZWxlbWVudCwgb3B0aW9ucyl7XHJcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcclxuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBTbGlkZXIuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcclxuXHJcbiAgICB0aGlzLl9pbml0KCk7XHJcblxyXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnU2xpZGVyJyk7XHJcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdTbGlkZXInLCB7XHJcbiAgICAgICdsdHInOiB7XHJcbiAgICAgICAgJ0FSUk9XX1JJR0hUJzogJ2luY3JlYXNlJyxcclxuICAgICAgICAnQVJST1dfVVAnOiAnaW5jcmVhc2UnLFxyXG4gICAgICAgICdBUlJPV19ET1dOJzogJ2RlY3JlYXNlJyxcclxuICAgICAgICAnQVJST1dfTEVGVCc6ICdkZWNyZWFzZScsXHJcbiAgICAgICAgJ1NISUZUX0FSUk9XX1JJR0hUJzogJ2luY3JlYXNlX2Zhc3QnLFxyXG4gICAgICAgICdTSElGVF9BUlJPV19VUCc6ICdpbmNyZWFzZV9mYXN0JyxcclxuICAgICAgICAnU0hJRlRfQVJST1dfRE9XTic6ICdkZWNyZWFzZV9mYXN0JyxcclxuICAgICAgICAnU0hJRlRfQVJST1dfTEVGVCc6ICdkZWNyZWFzZV9mYXN0J1xyXG4gICAgICB9LFxyXG4gICAgICAncnRsJzoge1xyXG4gICAgICAgICdBUlJPV19MRUZUJzogJ2luY3JlYXNlJyxcclxuICAgICAgICAnQVJST1dfUklHSFQnOiAnZGVjcmVhc2UnLFxyXG4gICAgICAgICdTSElGVF9BUlJPV19MRUZUJzogJ2luY3JlYXNlX2Zhc3QnLFxyXG4gICAgICAgICdTSElGVF9BUlJPV19SSUdIVCc6ICdkZWNyZWFzZV9mYXN0J1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIFNsaWRlci5kZWZhdWx0cyA9IHtcclxuICAgIC8qKlxyXG4gICAgICogTWluaW11bSB2YWx1ZSBmb3IgdGhlIHNsaWRlciBzY2FsZS5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlIDBcclxuICAgICAqL1xyXG4gICAgc3RhcnQ6IDAsXHJcbiAgICAvKipcclxuICAgICAqIE1heGltdW0gdmFsdWUgZm9yIHRoZSBzbGlkZXIgc2NhbGUuXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKiBAZXhhbXBsZSAxMDBcclxuICAgICAqL1xyXG4gICAgZW5kOiAxMDAsXHJcbiAgICAvKipcclxuICAgICAqIE1pbmltdW0gdmFsdWUgY2hhbmdlIHBlciBjaGFuZ2UgZXZlbnQuIE5vdCBDdXJyZW50bHkgSW1wbGVtZW50ZWQhXHJcblxyXG4gICAgICovXHJcbiAgICBzdGVwOiAxLFxyXG4gICAgLyoqXHJcbiAgICAgKiBWYWx1ZSBhdCB3aGljaCB0aGUgaGFuZGxlL2lucHV0ICoobGVmdCBoYW5kbGUvZmlyc3QgaW5wdXQpKiBzaG91bGQgYmUgc2V0IHRvIG9uIGluaXRpYWxpemF0aW9uLlxyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgMFxyXG4gICAgICovXHJcbiAgICBpbml0aWFsU3RhcnQ6IDAsXHJcbiAgICAvKipcclxuICAgICAqIFZhbHVlIGF0IHdoaWNoIHRoZSByaWdodCBoYW5kbGUvc2Vjb25kIGlucHV0IHNob3VsZCBiZSBzZXQgdG8gb24gaW5pdGlhbGl6YXRpb24uXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKiBAZXhhbXBsZSAxMDBcclxuICAgICAqL1xyXG4gICAgaW5pdGlhbEVuZDogMTAwLFxyXG4gICAgLyoqXHJcbiAgICAgKiBBbGxvd3MgdGhlIGlucHV0IHRvIGJlIGxvY2F0ZWQgb3V0c2lkZSB0aGUgY29udGFpbmVyIGFuZCB2aXNpYmxlLiBTZXQgdG8gYnkgdGhlIEpTXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKiBAZXhhbXBsZSBmYWxzZVxyXG4gICAgICovXHJcbiAgICBiaW5kaW5nOiBmYWxzZSxcclxuICAgIC8qKlxyXG4gICAgICogQWxsb3dzIHRoZSB1c2VyIHRvIGNsaWNrL3RhcCBvbiB0aGUgc2xpZGVyIGJhciB0byBzZWxlY3QgYSB2YWx1ZS5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlIHRydWVcclxuICAgICAqL1xyXG4gICAgY2xpY2tTZWxlY3Q6IHRydWUsXHJcbiAgICAvKipcclxuICAgICAqIFNldCB0byB0cnVlIGFuZCB1c2UgdGhlIGB2ZXJ0aWNhbGAgY2xhc3MgdG8gY2hhbmdlIGFsaWdubWVudCB0byB2ZXJ0aWNhbC5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlIGZhbHNlXHJcbiAgICAgKi9cclxuICAgIHZlcnRpY2FsOiBmYWxzZSxcclxuICAgIC8qKlxyXG4gICAgICogQWxsb3dzIHRoZSB1c2VyIHRvIGRyYWcgdGhlIHNsaWRlciBoYW5kbGUocykgdG8gc2VsZWN0IGEgdmFsdWUuXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKiBAZXhhbXBsZSB0cnVlXHJcbiAgICAgKi9cclxuICAgIGRyYWdnYWJsZTogdHJ1ZSxcclxuICAgIC8qKlxyXG4gICAgICogRGlzYWJsZXMgdGhlIHNsaWRlciBhbmQgcHJldmVudHMgZXZlbnQgbGlzdGVuZXJzIGZyb20gYmVpbmcgYXBwbGllZC4gRG91YmxlIGNoZWNrZWQgYnkgSlMgd2l0aCBgZGlzYWJsZWRDbGFzc2AuXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKiBAZXhhbXBsZSBmYWxzZVxyXG4gICAgICovXHJcbiAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAvKipcclxuICAgICAqIEFsbG93cyB0aGUgdXNlIG9mIHR3byBoYW5kbGVzLiBEb3VibGUgY2hlY2tlZCBieSB0aGUgSlMuIENoYW5nZXMgc29tZSBsb2dpYyBoYW5kbGluZy5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlIGZhbHNlXHJcbiAgICAgKi9cclxuICAgIGRvdWJsZVNpZGVkOiBmYWxzZSxcclxuICAgIC8qKlxyXG4gICAgICogUG90ZW50aWFsIGZ1dHVyZSBmZWF0dXJlLlxyXG4gICAgICovXHJcbiAgICAvLyBzdGVwczogMTAwLFxyXG4gICAgLyoqXHJcbiAgICAgKiBOdW1iZXIgb2YgZGVjaW1hbCBwbGFjZXMgdGhlIHBsdWdpbiBzaG91bGQgZ28gdG8gZm9yIGZsb2F0aW5nIHBvaW50IHByZWNpc2lvbi5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlIDJcclxuICAgICAqL1xyXG4gICAgZGVjaW1hbDogMixcclxuICAgIC8qKlxyXG4gICAgICogVGltZSBkZWxheSBmb3IgZHJhZ2dlZCBlbGVtZW50cy5cclxuICAgICAqL1xyXG4gICAgLy8gZHJhZ0RlbGF5OiAwLFxyXG4gICAgLyoqXHJcbiAgICAgKiBUaW1lLCBpbiBtcywgdG8gYW5pbWF0ZSB0aGUgbW92ZW1lbnQgb2YgYSBzbGlkZXIgaGFuZGxlIGlmIHVzZXIgY2xpY2tzL3RhcHMgb24gdGhlIGJhci4gTmVlZHMgdG8gYmUgbWFudWFsbHkgc2V0IGlmIHVwZGF0aW5nIHRoZSB0cmFuc2l0aW9uIHRpbWUgaW4gdGhlIFNhc3Mgc2V0dGluZ3MuXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKiBAZXhhbXBsZSAyMDBcclxuICAgICAqL1xyXG4gICAgbW92ZVRpbWU6IDIwMCwvL3VwZGF0ZSB0aGlzIGlmIGNoYW5naW5nIHRoZSB0cmFuc2l0aW9uIHRpbWUgaW4gdGhlIHNhc3NcclxuICAgIC8qKlxyXG4gICAgICogQ2xhc3MgYXBwbGllZCB0byBkaXNhYmxlZCBzbGlkZXJzLlxyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgJ2Rpc2FibGVkJ1xyXG4gICAgICovXHJcbiAgICBkaXNhYmxlZENsYXNzOiAnZGlzYWJsZWQnLFxyXG4gICAgaW52ZXJ0VmVydGljYWw6IGZhbHNlXHJcbiAgfTtcclxuICAvKipcclxuICAgKiBJbml0aWxpemVzIHRoZSBwbHVnaW4gYnkgcmVhZGluZy9zZXR0aW5nIGF0dHJpYnV0ZXMsIGNyZWF0aW5nIGNvbGxlY3Rpb25zIGFuZCBzZXR0aW5nIHRoZSBpbml0aWFsIHBvc2l0aW9uIG9mIHRoZSBoYW5kbGUocykuXHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBTbGlkZXIucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKXtcclxuICAgIHRoaXMuaW5wdXRzID0gdGhpcy4kZWxlbWVudC5maW5kKCdpbnB1dCcpO1xyXG4gICAgdGhpcy5oYW5kbGVzID0gdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS1zbGlkZXItaGFuZGxlXScpO1xyXG5cclxuICAgIHRoaXMuJGhhbmRsZSA9IHRoaXMuaGFuZGxlcy5lcSgwKTtcclxuICAgIHRoaXMuJGlucHV0ID0gdGhpcy5pbnB1dHMubGVuZ3RoID8gdGhpcy5pbnB1dHMuZXEoMCkgOiAkKCcjJyArIHRoaXMuJGhhbmRsZS5hdHRyKCdhcmlhLWNvbnRyb2xzJykpO1xyXG4gICAgdGhpcy4kZmlsbCA9IHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtc2xpZGVyLWZpbGxdJykuY3NzKHRoaXMub3B0aW9ucy52ZXJ0aWNhbCA/ICdoZWlnaHQnIDogJ3dpZHRoJywgMCk7XHJcblxyXG4gICAgdmFyIGlzRGJsID0gZmFsc2UsXHJcbiAgICAgICAgX3RoaXMgPSB0aGlzO1xyXG4gICAgaWYodGhpcy5vcHRpb25zLmRpc2FibGVkIHx8IHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3ModGhpcy5vcHRpb25zLmRpc2FibGVkQ2xhc3MpKXtcclxuICAgICAgdGhpcy5vcHRpb25zLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuZGlzYWJsZWRDbGFzcyk7XHJcbiAgICB9XHJcbiAgICBpZighdGhpcy5pbnB1dHMubGVuZ3RoKXtcclxuICAgICAgdGhpcy5pbnB1dHMgPSAkKCkuYWRkKHRoaXMuJGlucHV0KTtcclxuICAgICAgdGhpcy5vcHRpb25zLmJpbmRpbmcgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fc2V0SW5pdEF0dHIoMCk7XHJcbiAgICB0aGlzLl9ldmVudHModGhpcy4kaGFuZGxlKTtcclxuXHJcbiAgICBpZih0aGlzLmhhbmRsZXNbMV0pe1xyXG4gICAgICB0aGlzLm9wdGlvbnMuZG91YmxlU2lkZWQgPSB0cnVlO1xyXG4gICAgICB0aGlzLiRoYW5kbGUyID0gdGhpcy5oYW5kbGVzLmVxKDEpO1xyXG4gICAgICB0aGlzLiRpbnB1dDIgPSB0aGlzLmlucHV0cy5sZW5ndGggPiAxID8gdGhpcy5pbnB1dHMuZXEoMSkgOiAkKCcjJyArIHRoaXMuJGhhbmRsZTIuYXR0cignYXJpYS1jb250cm9scycpKTtcclxuXHJcbiAgICAgIGlmKCF0aGlzLmlucHV0c1sxXSl7XHJcbiAgICAgICAgdGhpcy5pbnB1dHMgPSB0aGlzLmlucHV0cy5hZGQodGhpcy4kaW5wdXQyKTtcclxuICAgICAgfVxyXG4gICAgICBpc0RibCA9IHRydWU7XHJcblxyXG4gICAgICB0aGlzLl9zZXRIYW5kbGVQb3ModGhpcy4kaGFuZGxlLCB0aGlzLm9wdGlvbnMuaW5pdGlhbFN0YXJ0LCB0cnVlLCBmdW5jdGlvbigpe1xyXG5cclxuICAgICAgICBfdGhpcy5fc2V0SGFuZGxlUG9zKF90aGlzLiRoYW5kbGUyLCBfdGhpcy5vcHRpb25zLmluaXRpYWxFbmQsIHRydWUpO1xyXG4gICAgICB9KTtcclxuICAgICAgLy8gdGhpcy4kaGFuZGxlLnRyaWdnZXJIYW5kbGVyKCdjbGljay56Zi5zbGlkZXInKTtcclxuICAgICAgdGhpcy5fc2V0SW5pdEF0dHIoMSk7XHJcbiAgICAgIHRoaXMuX2V2ZW50cyh0aGlzLiRoYW5kbGUyKTtcclxuICAgIH1cclxuXHJcbiAgICBpZighaXNEYmwpe1xyXG4gICAgICB0aGlzLl9zZXRIYW5kbGVQb3ModGhpcy4kaGFuZGxlLCB0aGlzLm9wdGlvbnMuaW5pdGlhbFN0YXJ0LCB0cnVlKTtcclxuICAgIH1cclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHBvc2l0aW9uIG9mIHRoZSBzZWxlY3RlZCBoYW5kbGUgYW5kIGZpbGwgYmFyLlxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHBhcmFtIHtqUXVlcnl9ICRobmRsIC0gdGhlIHNlbGVjdGVkIGhhbmRsZSB0byBtb3ZlLlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBsb2NhdGlvbiAtIGZsb2F0aW5nIHBvaW50IGJldHdlZW4gdGhlIHN0YXJ0IGFuZCBlbmQgdmFsdWVzIG9mIHRoZSBzbGlkZXIgYmFyLlxyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIC0gY2FsbGJhY2sgZnVuY3Rpb24gdG8gZmlyZSBvbiBjb21wbGV0aW9uLlxyXG4gICAqIEBmaXJlcyBTbGlkZXIjbW92ZWRcclxuICAgKi9cclxuICBTbGlkZXIucHJvdG90eXBlLl9zZXRIYW5kbGVQb3MgPSBmdW5jdGlvbigkaG5kbCwgbG9jYXRpb24sIG5vSW52ZXJ0LCBjYil7XHJcbiAgLy9taWdodCBuZWVkIHRvIGFsdGVyIHRoYXQgc2xpZ2h0bHkgZm9yIGJhcnMgdGhhdCB3aWxsIGhhdmUgb2RkIG51bWJlciBzZWxlY3Rpb25zLlxyXG4gICAgbG9jYXRpb24gPSBwYXJzZUZsb2F0KGxvY2F0aW9uKTsvL29uIGlucHV0IGNoYW5nZSBldmVudHMsIGNvbnZlcnQgc3RyaW5nIHRvIG51bWJlci4uLmdydW1ibGUuXHJcblxyXG4gICAgLy8gcHJldmVudCBzbGlkZXIgZnJvbSBydW5uaW5nIG91dCBvZiBib3VuZHMsIGlmIHZhbHVlIGV4Y2VlZHMgdGhlIGxpbWl0cyBzZXQgdGhyb3VnaCBvcHRpb25zLCBvdmVycmlkZSB0aGUgdmFsdWUgdG8gbWluL21heFxyXG4gICAgaWYobG9jYXRpb24gPCB0aGlzLm9wdGlvbnMuc3RhcnQpeyBsb2NhdGlvbiA9IHRoaXMub3B0aW9ucy5zdGFydDsgfVxyXG4gICAgZWxzZSBpZihsb2NhdGlvbiA+IHRoaXMub3B0aW9ucy5lbmQpeyBsb2NhdGlvbiA9IHRoaXMub3B0aW9ucy5lbmQ7IH1cclxuXHJcbiAgICB2YXIgaXNEYmwgPSB0aGlzLm9wdGlvbnMuZG91YmxlU2lkZWQ7XHJcblxyXG4gICAgaWYoaXNEYmwpeyAvL3RoaXMgYmxvY2sgaXMgdG8gcHJldmVudCAyIGhhbmRsZXMgZnJvbSBjcm9zc2luZyBlYWNob3RoZXIuIENvdWxkL3Nob3VsZCBiZSBpbXByb3ZlZC5cclxuICAgICAgaWYodGhpcy5oYW5kbGVzLmluZGV4KCRobmRsKSA9PT0gMCl7XHJcbiAgICAgICAgdmFyIGgyVmFsID0gcGFyc2VGbG9hdCh0aGlzLiRoYW5kbGUyLmF0dHIoJ2FyaWEtdmFsdWVub3cnKSk7XHJcbiAgICAgICAgbG9jYXRpb24gPSBsb2NhdGlvbiA+PSBoMlZhbCA/IGgyVmFsIC0gdGhpcy5vcHRpb25zLnN0ZXAgOiBsb2NhdGlvbjtcclxuICAgICAgfWVsc2V7XHJcbiAgICAgICAgdmFyIGgxVmFsID0gcGFyc2VGbG9hdCh0aGlzLiRoYW5kbGUuYXR0cignYXJpYS12YWx1ZW5vdycpKTtcclxuICAgICAgICBsb2NhdGlvbiA9IGxvY2F0aW9uIDw9IGgxVmFsID8gaDFWYWwgKyB0aGlzLm9wdGlvbnMuc3RlcCA6IGxvY2F0aW9uO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy90aGlzIGlzIGZvciBzaW5nbGUtaGFuZGxlZCB2ZXJ0aWNhbCBzbGlkZXJzLCBpdCBhZGp1c3RzIHRoZSB2YWx1ZSB0byBhY2NvdW50IGZvciB0aGUgc2xpZGVyIGJlaW5nIFwidXBzaWRlLWRvd25cIlxyXG4gICAgLy9mb3IgY2xpY2sgYW5kIGRyYWcgZXZlbnRzLCBpdCdzIHdlaXJkIGR1ZSB0byB0aGUgc2NhbGUoLTEsIDEpIGNzcyBwcm9wZXJ0eVxyXG4gICAgaWYodGhpcy5vcHRpb25zLnZlcnRpY2FsICYmICFub0ludmVydCl7XHJcbiAgICAgIGxvY2F0aW9uID0gdGhpcy5vcHRpb25zLmVuZCAtIGxvY2F0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBfdGhpcyA9IHRoaXMsXHJcbiAgICAgICAgdmVydCA9IHRoaXMub3B0aW9ucy52ZXJ0aWNhbCxcclxuICAgICAgICBoT3JXID0gdmVydCA/ICdoZWlnaHQnIDogJ3dpZHRoJyxcclxuICAgICAgICBsT3JUID0gdmVydCA/ICd0b3AnIDogJ2xlZnQnLFxyXG4gICAgICAgIGhhbmRsZURpbSA9ICRobmRsWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpW2hPclddLFxyXG4gICAgICAgIGVsZW1EaW0gPSB0aGlzLiRlbGVtZW50WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpW2hPclddLFxyXG4gICAgICAgIC8vcGVyY2VudGFnZSBvZiBiYXIgbWluL21heCB2YWx1ZSBiYXNlZCBvbiBjbGljayBvciBkcmFnIHBvaW50XHJcbiAgICAgICAgcGN0T2ZCYXIgPSBwZXJjZW50KGxvY2F0aW9uLCB0aGlzLm9wdGlvbnMuZW5kKS50b0ZpeGVkKDIpLFxyXG4gICAgICAgIC8vbnVtYmVyIG9mIGFjdHVhbCBwaXhlbHMgdG8gc2hpZnQgdGhlIGhhbmRsZSwgYmFzZWQgb24gdGhlIHBlcmNlbnRhZ2Ugb2J0YWluZWQgYWJvdmVcclxuICAgICAgICBweFRvTW92ZSA9IChlbGVtRGltIC0gaGFuZGxlRGltKSAqIHBjdE9mQmFyLFxyXG4gICAgICAgIC8vcGVyY2VudGFnZSBvZiBiYXIgdG8gc2hpZnQgdGhlIGhhbmRsZVxyXG4gICAgICAgIG1vdmVtZW50ID0gKHBlcmNlbnQocHhUb01vdmUsIGVsZW1EaW0pICogMTAwKS50b0ZpeGVkKHRoaXMub3B0aW9ucy5kZWNpbWFsKSxcclxuICAgICAgICAvL2ZpeGluZyB0aGUgZGVjaW1hbCB2YWx1ZSBmb3IgdGhlIGxvY2F0aW9uIG51bWJlciwgaXMgcGFzc2VkIHRvIG90aGVyIG1ldGhvZHMgYXMgYSBmaXhlZCBmbG9hdGluZy1wb2ludCB2YWx1ZVxyXG4gICAgICAgIGxvY2F0aW9uID0gcGFyc2VGbG9hdChsb2NhdGlvbi50b0ZpeGVkKHRoaXMub3B0aW9ucy5kZWNpbWFsKSksXHJcbiAgICAgICAgLy8gZGVjbGFyZSBlbXB0eSBvYmplY3QgZm9yIGNzcyBhZGp1c3RtZW50cywgb25seSB1c2VkIHdpdGggMiBoYW5kbGVkLXNsaWRlcnNcclxuICAgICAgICBjc3MgPSB7fTtcclxuXHJcbiAgICB0aGlzLl9zZXRWYWx1ZXMoJGhuZGwsIGxvY2F0aW9uKTtcclxuXHJcbiAgICAvLyBUT0RPIHVwZGF0ZSB0byBjYWxjdWxhdGUgYmFzZWQgb24gdmFsdWVzIHNldCB0byByZXNwZWN0aXZlIGlucHV0cz8/XHJcbiAgICBpZihpc0RibCl7XHJcbiAgICAgIHZhciBpc0xlZnRIbmRsID0gdGhpcy5oYW5kbGVzLmluZGV4KCRobmRsKSA9PT0gMCxcclxuICAgICAgICAgIC8vZW1wdHkgdmFyaWFibGUsIHdpbGwgYmUgdXNlZCBmb3IgbWluLWhlaWdodC93aWR0aCBmb3IgZmlsbCBiYXJcclxuICAgICAgICAgIGRpbSxcclxuICAgICAgICAgIC8vcGVyY2VudGFnZSB3L2ggb2YgdGhlIGhhbmRsZSBjb21wYXJlZCB0byB0aGUgc2xpZGVyIGJhclxyXG4gICAgICAgICAgaGFuZGxlUGN0ID0gIH5+KHBlcmNlbnQoaGFuZGxlRGltLCBlbGVtRGltKSAqIDEwMCk7XHJcbiAgICAgIC8vaWYgbGVmdCBoYW5kbGUsIHRoZSBtYXRoIGlzIHNsaWdodGx5IGRpZmZlcmVudCB0aGFuIGlmIGl0J3MgdGhlIHJpZ2h0IGhhbmRsZSwgYW5kIHRoZSBsZWZ0L3RvcCBwcm9wZXJ0eSBuZWVkcyB0byBiZSBjaGFuZ2VkIGZvciB0aGUgZmlsbCBiYXJcclxuICAgICAgaWYoaXNMZWZ0SG5kbCl7XHJcbiAgICAgICAgLy9sZWZ0IG9yIHRvcCBwZXJjZW50YWdlIHZhbHVlIHRvIGFwcGx5IHRvIHRoZSBmaWxsIGJhci5cclxuICAgICAgICBjc3NbbE9yVF0gPSBtb3ZlbWVudCArICclJztcclxuICAgICAgICAvL2NhbGN1bGF0ZSB0aGUgbmV3IG1pbi1oZWlnaHQvd2lkdGggZm9yIHRoZSBmaWxsIGJhci5cclxuICAgICAgICBkaW0gPSBwYXJzZUZsb2F0KHRoaXMuJGhhbmRsZTJbMF0uc3R5bGVbbE9yVF0pIC0gbW92ZW1lbnQgKyBoYW5kbGVQY3Q7XHJcbiAgICAgICAgLy90aGlzIGNhbGxiYWNrIGlzIG5lY2Vzc2FyeSB0byBwcmV2ZW50IGVycm9ycyBhbmQgYWxsb3cgdGhlIHByb3BlciBwbGFjZW1lbnQgYW5kIGluaXRpYWxpemF0aW9uIG9mIGEgMi1oYW5kbGVkIHNsaWRlclxyXG4gICAgICAgIC8vcGx1cywgaXQgbWVhbnMgd2UgZG9uJ3QgY2FyZSBpZiAnZGltJyBpc05hTiBvbiBpbml0LCBpdCB3b24ndCBiZSBpbiB0aGUgZnV0dXJlLlxyXG4gICAgICAgIGlmKGNiICYmIHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJyl7IGNiKCk7IH0vL3RoaXMgaXMgb25seSBuZWVkZWQgZm9yIHRoZSBpbml0aWFsaXphdGlvbiBvZiAyIGhhbmRsZWQgc2xpZGVyc1xyXG4gICAgICB9ZWxzZXtcclxuICAgICAgICAvL2p1c3QgY2FjaGluZyB0aGUgdmFsdWUgb2YgdGhlIGxlZnQvYm90dG9tIGhhbmRsZSdzIGxlZnQvdG9wIHByb3BlcnR5XHJcbiAgICAgICAgdmFyIGhhbmRsZVBvcyA9IHBhcnNlRmxvYXQodGhpcy4kaGFuZGxlWzBdLnN0eWxlW2xPclRdKTtcclxuICAgICAgICAvL2NhbGN1bGF0ZSB0aGUgbmV3IG1pbi1oZWlnaHQvd2lkdGggZm9yIHRoZSBmaWxsIGJhci4gVXNlIGlzTmFOIHRvIHByZXZlbnQgZmFsc2UgcG9zaXRpdmVzIGZvciBudW1iZXJzIDw9IDBcclxuICAgICAgICAvL2Jhc2VkIG9uIHRoZSBwZXJjZW50YWdlIG9mIG1vdmVtZW50IG9mIHRoZSBoYW5kbGUgYmVpbmcgbWFuaXB1bGF0ZWQsIGxlc3MgdGhlIG9wcG9zaW5nIGhhbmRsZSdzIGxlZnQvdG9wIHBvc2l0aW9uLCBwbHVzIHRoZSBwZXJjZW50YWdlIHcvaCBvZiB0aGUgaGFuZGxlIGl0c2VsZlxyXG4gICAgICAgIGRpbSA9IG1vdmVtZW50IC0gKGlzTmFOKGhhbmRsZVBvcykgPyB0aGlzLm9wdGlvbnMuaW5pdGlhbFN0YXJ0IDogaGFuZGxlUG9zKSArIGhhbmRsZVBjdDtcclxuICAgICAgfVxyXG4gICAgICAvLyBhc3NpZ24gdGhlIG1pbi1oZWlnaHQvd2lkdGggdG8gb3VyIGNzcyBvYmplY3RcclxuICAgICAgY3NzWydtaW4tJyArIGhPclddID0gZGltICsgJyUnO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnQub25lKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBoYW5kbGUgaXMgZG9uZSBtb3ZpbmcuXHJcbiAgICAgICAgICAgICAgICAgICAgICogQGV2ZW50IFNsaWRlciNtb3ZlZFxyXG4gICAgICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLiRlbGVtZW50LnRyaWdnZXIoJ21vdmVkLnpmLnNsaWRlcicsIFskaG5kbF0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgLy9iZWNhdXNlIHdlIGRvbid0IGtub3cgZXhhY3RseSBob3cgdGhlIGhhbmRsZSB3aWxsIGJlIG1vdmVkLCBjaGVjayB0aGUgYW1vdW50IG9mIHRpbWUgaXQgc2hvdWxkIHRha2UgdG8gbW92ZS5cclxuICAgIHZhciBtb3ZlVGltZSA9IHRoaXMuJGVsZW1lbnQuZGF0YSgnZHJhZ2dpbmcnKSA/IDEwMDAvNjAgOiB0aGlzLm9wdGlvbnMubW92ZVRpbWU7XHJcblxyXG4gICAgRm91bmRhdGlvbi5Nb3ZlKG1vdmVUaW1lLCAkaG5kbCwgZnVuY3Rpb24oKXtcclxuICAgICAgLy9hZGp1c3RpbmcgdGhlIGxlZnQvdG9wIHByb3BlcnR5IG9mIHRoZSBoYW5kbGUsIGJhc2VkIG9uIHRoZSBwZXJjZW50YWdlIGNhbGN1bGF0ZWQgYWJvdmVcclxuICAgICAgJGhuZGwuY3NzKGxPclQsIG1vdmVtZW50ICsgJyUnKTtcclxuXHJcbiAgICAgIGlmKCFfdGhpcy5vcHRpb25zLmRvdWJsZVNpZGVkKXtcclxuICAgICAgICAvL2lmIHNpbmdsZS1oYW5kbGVkLCBhIHNpbXBsZSBtZXRob2QgdG8gZXhwYW5kIHRoZSBmaWxsIGJhclxyXG4gICAgICAgIF90aGlzLiRmaWxsLmNzcyhoT3JXLCBwY3RPZkJhciAqIDEwMCArICclJyk7XHJcbiAgICAgIH1lbHNle1xyXG4gICAgICAgIC8vb3RoZXJ3aXNlLCB1c2UgdGhlIGNzcyBvYmplY3Qgd2UgY3JlYXRlZCBhYm92ZVxyXG4gICAgICAgIF90aGlzLiRmaWxsLmNzcyhjc3MpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgfTtcclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBpbml0aWFsIGF0dHJpYnV0ZSBmb3IgdGhlIHNsaWRlciBlbGVtZW50LlxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGlkeCAtIGluZGV4IG9mIHRoZSBjdXJyZW50IGhhbmRsZS9pbnB1dCB0byB1c2UuXHJcbiAgICovXHJcbiAgU2xpZGVyLnByb3RvdHlwZS5fc2V0SW5pdEF0dHIgPSBmdW5jdGlvbihpZHgpe1xyXG4gICAgdmFyIGlkID0gdGhpcy5pbnB1dHMuZXEoaWR4KS5hdHRyKCdpZCcpIHx8IEZvdW5kYXRpb24uR2V0WW9EaWdpdHMoNiwgJ3NsaWRlcicpO1xyXG4gICAgdGhpcy5pbnB1dHMuZXEoaWR4KS5hdHRyKHtcclxuICAgICAgJ2lkJzogaWQsXHJcbiAgICAgICdtYXgnOiB0aGlzLm9wdGlvbnMuZW5kLFxyXG4gICAgICAnbWluJzogdGhpcy5vcHRpb25zLnN0YXJ0XHJcblxyXG4gICAgfSk7XHJcbiAgICB0aGlzLmhhbmRsZXMuZXEoaWR4KS5hdHRyKHtcclxuICAgICAgJ3JvbGUnOiAnc2xpZGVyJyxcclxuICAgICAgJ2FyaWEtY29udHJvbHMnOiBpZCxcclxuICAgICAgJ2FyaWEtdmFsdWVtYXgnOiB0aGlzLm9wdGlvbnMuZW5kLFxyXG4gICAgICAnYXJpYS12YWx1ZW1pbic6IHRoaXMub3B0aW9ucy5zdGFydCxcclxuICAgICAgJ2FyaWEtdmFsdWVub3cnOiBpZHggPT09IDAgPyB0aGlzLm9wdGlvbnMuaW5pdGlhbFN0YXJ0IDogdGhpcy5vcHRpb25zLmluaXRpYWxFbmQsXHJcbiAgICAgICdhcmlhLW9yaWVudGF0aW9uJzogdGhpcy5vcHRpb25zLnZlcnRpY2FsID8gJ3ZlcnRpY2FsJyA6ICdob3Jpem9udGFsJyxcclxuICAgICAgJ3RhYmluZGV4JzogMFxyXG4gICAgfSk7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBpbnB1dCBhbmQgYGFyaWEtdmFsdWVub3dgIHZhbHVlcyBmb3IgdGhlIHNsaWRlciBlbGVtZW50LlxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHBhcmFtIHtqUXVlcnl9ICRoYW5kbGUgLSB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGhhbmRsZS5cclxuICAgKiBAcGFyYW0ge051bWJlcn0gdmFsIC0gZmxvYXRpbmcgcG9pbnQgb2YgdGhlIG5ldyB2YWx1ZS5cclxuICAgKi9cclxuICBTbGlkZXIucHJvdG90eXBlLl9zZXRWYWx1ZXMgPSBmdW5jdGlvbigkaGFuZGxlLCB2YWwpe1xyXG4gICAgdmFyIGlkeCA9IHRoaXMub3B0aW9ucy5kb3VibGVTaWRlZCA/IHRoaXMuaGFuZGxlcy5pbmRleCgkaGFuZGxlKSA6IDA7XHJcbiAgICB0aGlzLmlucHV0cy5lcShpZHgpLnZhbCh2YWwpO1xyXG4gICAgJGhhbmRsZS5hdHRyKCdhcmlhLXZhbHVlbm93JywgdmFsKTtcclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIEhhbmRsZXMgZXZlbnRzIG9uIHRoZSBzbGlkZXIgZWxlbWVudC5cclxuICAgKiBDYWxjdWxhdGVzIHRoZSBuZXcgbG9jYXRpb24gb2YgdGhlIGN1cnJlbnQgaGFuZGxlLlxyXG4gICAqIElmIHRoZXJlIGFyZSB0d28gaGFuZGxlcyBhbmQgdGhlIGJhciB3YXMgY2xpY2tlZCwgaXQgZGV0ZXJtaW5lcyB3aGljaCBoYW5kbGUgdG8gbW92ZS5cclxuICAgKiBAZnVuY3Rpb25cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlIC0gdGhlIGBldmVudGAgb2JqZWN0IHBhc3NlZCBmcm9tIHRoZSBsaXN0ZW5lci5cclxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJGhhbmRsZSAtIHRoZSBjdXJyZW50IGhhbmRsZSB0byBjYWxjdWxhdGUgZm9yLCBpZiBzZWxlY3RlZC5cclxuICAgKiBAcGFyYW0ge051bWJlcn0gdmFsIC0gZmxvYXRpbmcgcG9pbnQgbnVtYmVyIGZvciB0aGUgbmV3IHZhbHVlIG9mIHRoZSBzbGlkZXIuXHJcbiAgICogVE9ETyBjbGVhbiB0aGlzIHVwLCB0aGVyZSdzIGEgbG90IG9mIHJlcGVhdGVkIGNvZGUgYmV0d2VlbiB0aGlzIGFuZCB0aGUgX3NldEhhbmRsZVBvcyBmbi5cclxuICAgKi9cclxuICBTbGlkZXIucHJvdG90eXBlLl9oYW5kbGVFdmVudCA9IGZ1bmN0aW9uKGUsICRoYW5kbGUsIHZhbCl7XHJcbiAgICB2YXIgdmFsdWUsIGhhc1ZhbDtcclxuICAgIGlmKCF2YWwpey8vY2xpY2sgb3IgZHJhZyBldmVudHNcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICB2YXIgX3RoaXMgPSB0aGlzLFxyXG4gICAgICAgICAgdmVydGljYWwgPSB0aGlzLm9wdGlvbnMudmVydGljYWwsXHJcbiAgICAgICAgICBwYXJhbSA9IHZlcnRpY2FsID8gJ2hlaWdodCcgOiAnd2lkdGgnLFxyXG4gICAgICAgICAgZGlyZWN0aW9uID0gdmVydGljYWwgPyAndG9wJyA6ICdsZWZ0JyxcclxuICAgICAgICAgIHBhZ2VYWSA9IHZlcnRpY2FsID8gZS5wYWdlWSA6IGUucGFnZVgsXHJcbiAgICAgICAgICBoYWxmT2ZIYW5kbGUgPSB0aGlzLiRoYW5kbGVbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClbcGFyYW1dIC8gMixcclxuICAgICAgICAgIGJhckRpbSA9IHRoaXMuJGVsZW1lbnRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClbcGFyYW1dLFxyXG4gICAgICAgICAgYmFyT2Zmc2V0ID0gKHRoaXMuJGVsZW1lbnQub2Zmc2V0KClbZGlyZWN0aW9uXSAtICBwYWdlWFkpLFxyXG4gICAgICAgICAgLy9pZiB0aGUgY3Vyc29yIHBvc2l0aW9uIGlzIGxlc3MgdGhhbiBvciBncmVhdGVyIHRoYW4gdGhlIGVsZW1lbnRzIGJvdW5kaW5nIGNvb3JkaW5hdGVzLCBzZXQgY29vcmRpbmF0ZXMgd2l0aGluIHRob3NlIGJvdW5kc1xyXG4gICAgICAgICAgYmFyWFkgPSBiYXJPZmZzZXQgPiAwID8gLWhhbGZPZkhhbmRsZSA6IChiYXJPZmZzZXQgLSBoYWxmT2ZIYW5kbGUpIDwgLWJhckRpbSA/IGJhckRpbSA6IE1hdGguYWJzKGJhck9mZnNldCksXHJcbiAgICAgICAgICBvZmZzZXRQY3QgPSBwZXJjZW50KGJhclhZLCBiYXJEaW0pO1xyXG4gICAgICB2YWx1ZSA9ICh0aGlzLm9wdGlvbnMuZW5kIC0gdGhpcy5vcHRpb25zLnN0YXJ0KSAqIG9mZnNldFBjdDtcclxuICAgICAgLy8gdHVybiBldmVyeXRoaW5nIGFyb3VuZCBmb3IgUlRMLCB5YXkgbWF0aCFcclxuICAgICAgaWYgKEZvdW5kYXRpb24ucnRsKCkgJiYgIXRoaXMub3B0aW9ucy52ZXJ0aWNhbCkge3ZhbHVlID0gdGhpcy5vcHRpb25zLmVuZCAtIHZhbHVlO31cclxuICAgICAgLy9ib29sZWFuIGZsYWcgZm9yIHRoZSBzZXRIYW5kbGVQb3MgZm4sIHNwZWNpZmljYWxseSBmb3IgdmVydGljYWwgc2xpZGVyc1xyXG4gICAgICBoYXNWYWwgPSBmYWxzZTtcclxuXHJcbiAgICAgIGlmKCEkaGFuZGxlKXsvL2ZpZ3VyZSBvdXQgd2hpY2ggaGFuZGxlIGl0IGlzLCBwYXNzIGl0IHRvIHRoZSBuZXh0IGZ1bmN0aW9uLlxyXG4gICAgICAgIHZhciBmaXJzdEhuZGxQb3MgPSBhYnNQb3NpdGlvbih0aGlzLiRoYW5kbGUsIGRpcmVjdGlvbiwgYmFyWFksIHBhcmFtKSxcclxuICAgICAgICAgICAgc2VjbmRIbmRsUG9zID0gYWJzUG9zaXRpb24odGhpcy4kaGFuZGxlMiwgZGlyZWN0aW9uLCBiYXJYWSwgcGFyYW0pO1xyXG4gICAgICAgICAgICAkaGFuZGxlID0gZmlyc3RIbmRsUG9zIDw9IHNlY25kSG5kbFBvcyA/IHRoaXMuJGhhbmRsZSA6IHRoaXMuJGhhbmRsZTI7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9ZWxzZXsvL2NoYW5nZSBldmVudCBvbiBpbnB1dFxyXG4gICAgICB2YWx1ZSA9IHZhbDtcclxuICAgICAgaGFzVmFsID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9zZXRIYW5kbGVQb3MoJGhhbmRsZSwgdmFsdWUsIGhhc1ZhbCk7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiBBZGRzIGV2ZW50IGxpc3RlbmVycyB0byB0aGUgc2xpZGVyIGVsZW1lbnRzLlxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHBhcmFtIHtqUXVlcnl9ICRoYW5kbGUgLSB0aGUgY3VycmVudCBoYW5kbGUgdG8gYXBwbHkgbGlzdGVuZXJzIHRvLlxyXG4gICAqL1xyXG4gIFNsaWRlci5wcm90b3R5cGUuX2V2ZW50cyA9IGZ1bmN0aW9uKCRoYW5kbGUpe1xyXG4gICAgaWYodGhpcy5vcHRpb25zLmRpc2FibGVkKXsgcmV0dXJuIGZhbHNlOyB9XHJcblxyXG4gICAgdmFyIF90aGlzID0gdGhpcyxcclxuICAgICAgICBjdXJIYW5kbGUsXHJcbiAgICAgICAgdGltZXI7XHJcblxyXG4gICAgICB0aGlzLmlucHV0cy5vZmYoJ2NoYW5nZS56Zi5zbGlkZXInKS5vbignY2hhbmdlLnpmLnNsaWRlcicsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIHZhciBpZHggPSBfdGhpcy5pbnB1dHMuaW5kZXgoJCh0aGlzKSk7XHJcbiAgICAgICAgX3RoaXMuX2hhbmRsZUV2ZW50KGUsIF90aGlzLmhhbmRsZXMuZXEoaWR4KSwgJCh0aGlzKS52YWwoKSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIGlmKHRoaXMub3B0aW9ucy5jbGlja1NlbGVjdCl7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCdjbGljay56Zi5zbGlkZXInKS5vbignY2xpY2suemYuc2xpZGVyJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgaWYoX3RoaXMuJGVsZW1lbnQuZGF0YSgnZHJhZ2dpbmcnKSl7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuICAgICAgICBpZihfdGhpcy5vcHRpb25zLmRvdWJsZVNpZGVkKXtcclxuICAgICAgICAgIF90aGlzLl9oYW5kbGVFdmVudChlKTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgIF90aGlzLl9oYW5kbGVFdmVudChlLCBfdGhpcy4kaGFuZGxlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKHRoaXMub3B0aW9ucy5kcmFnZ2FibGUpe1xyXG4gICAgICB0aGlzLmhhbmRsZXMuYWRkVG91Y2goKTtcclxuXHJcbiAgICAgIHZhciAkYm9keSA9ICQoJ2JvZHknKTtcclxuICAgICAgJGhhbmRsZVxyXG4gICAgICAgIC5vZmYoJ21vdXNlZG93bi56Zi5zbGlkZXInKVxyXG4gICAgICAgIC5vbignbW91c2Vkb3duLnpmLnNsaWRlcicsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgJGhhbmRsZS5hZGRDbGFzcygnaXMtZHJhZ2dpbmcnKTtcclxuICAgICAgICAgIF90aGlzLiRmaWxsLmFkZENsYXNzKCdpcy1kcmFnZ2luZycpOy8vXHJcbiAgICAgICAgICBfdGhpcy4kZWxlbWVudC5kYXRhKCdkcmFnZ2luZycsIHRydWUpO1xyXG5cclxuICAgICAgICAgIGN1ckhhbmRsZSA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcclxuXHJcbiAgICAgICAgICAkYm9keS5vbignbW91c2Vtb3ZlLnpmLnNsaWRlcicsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgICAgICBfdGhpcy5faGFuZGxlRXZlbnQoZSwgY3VySGFuZGxlKTtcclxuXHJcbiAgICAgICAgICB9KS5vbignbW91c2V1cC56Zi5zbGlkZXInLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgX3RoaXMuX2hhbmRsZUV2ZW50KGUsIGN1ckhhbmRsZSk7XHJcblxyXG4gICAgICAgICAgICAkaGFuZGxlLnJlbW92ZUNsYXNzKCdpcy1kcmFnZ2luZycpO1xyXG4gICAgICAgICAgICBfdGhpcy4kZmlsbC5yZW1vdmVDbGFzcygnaXMtZHJhZ2dpbmcnKTtcclxuICAgICAgICAgICAgX3RoaXMuJGVsZW1lbnQuZGF0YSgnZHJhZ2dpbmcnLCBmYWxzZSk7XHJcblxyXG4gICAgICAgICAgICAkYm9keS5vZmYoJ21vdXNlbW92ZS56Zi5zbGlkZXIgbW91c2V1cC56Zi5zbGlkZXInKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgICRoYW5kbGUub2ZmKCdrZXlkb3duLnpmLnNsaWRlcicpLm9uKCdrZXlkb3duLnpmLnNsaWRlcicsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICB2YXIgXyRoYW5kbGUgPSAkKHRoaXMpLFxyXG4gICAgICAgICAgaWR4ID0gX3RoaXMub3B0aW9ucy5kb3VibGVTaWRlZCA/IF90aGlzLmhhbmRsZXMuaW5kZXgoXyRoYW5kbGUpIDogMCxcclxuICAgICAgICAgIG9sZFZhbHVlID0gcGFyc2VGbG9hdChfdGhpcy5pbnB1dHMuZXEoaWR4KS52YWwoKSksXHJcbiAgICAgICAgICBuZXdWYWx1ZTtcclxuXHJcblxyXG4gICAgICAvLyBoYW5kbGUga2V5Ym9hcmQgZXZlbnQgd2l0aCBrZXlib2FyZCB1dGlsXHJcbiAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQuaGFuZGxlS2V5KGUsICdTbGlkZXInLCB7XHJcbiAgICAgICAgZGVjcmVhc2U6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgbmV3VmFsdWUgPSBvbGRWYWx1ZSAtIF90aGlzLm9wdGlvbnMuc3RlcDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluY3JlYXNlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIG5ld1ZhbHVlID0gb2xkVmFsdWUgKyBfdGhpcy5vcHRpb25zLnN0ZXA7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkZWNyZWFzZV9mYXN0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIG5ld1ZhbHVlID0gb2xkVmFsdWUgLSBfdGhpcy5vcHRpb25zLnN0ZXAgKiAxMDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluY3JlYXNlX2Zhc3Q6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgbmV3VmFsdWUgPSBvbGRWYWx1ZSArIF90aGlzLm9wdGlvbnMuc3RlcCAqIDEwO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaGFuZGxlZDogZnVuY3Rpb24oKSB7IC8vIG9ubHkgc2V0IGhhbmRsZSBwb3Mgd2hlbiBldmVudCB3YXMgaGFuZGxlZCBzcGVjaWFsbHlcclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgIF90aGlzLl9zZXRIYW5kbGVQb3MoXyRoYW5kbGUsIG5ld1ZhbHVlLCB0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICAvKmlmIChuZXdWYWx1ZSkgeyAvLyBpZiBwcmVzc2VkIGtleSBoYXMgc3BlY2lhbCBmdW5jdGlvbiwgdXBkYXRlIHZhbHVlXHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIF90aGlzLl9zZXRIYW5kbGVQb3MoXyRoYW5kbGUsIG5ld1ZhbHVlKTtcclxuICAgICAgfSovXHJcbiAgICB9KTtcclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIERlc3Ryb3lzIHRoZSBzbGlkZXIgcGx1Z2luLlxyXG4gICAqL1xyXG4gICBTbGlkZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpe1xyXG4gICAgIHRoaXMuaGFuZGxlcy5vZmYoJy56Zi5zbGlkZXInKTtcclxuICAgICB0aGlzLmlucHV0cy5vZmYoJy56Zi5zbGlkZXInKTtcclxuICAgICB0aGlzLiRlbGVtZW50Lm9mZignLnpmLnNsaWRlcicpO1xyXG5cclxuICAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XHJcbiAgIH07XHJcblxyXG4gIEZvdW5kYXRpb24ucGx1Z2luKFNsaWRlciwgJ1NsaWRlcicpO1xyXG5cclxuICBmdW5jdGlvbiBwZXJjZW50KGZyYWMsIG51bSl7XHJcbiAgICByZXR1cm4gKGZyYWMgLyBudW0pO1xyXG4gIH1cclxuICBmdW5jdGlvbiBhYnNQb3NpdGlvbigkaGFuZGxlLCBkaXIsIGNsaWNrUG9zLCBwYXJhbSl7XHJcbiAgICByZXR1cm4gTWF0aC5hYnMoKCRoYW5kbGUucG9zaXRpb24oKVtkaXJdICsgKCRoYW5kbGVbcGFyYW1dKCkgLyAyKSkgLSBjbGlja1Bvcyk7XHJcbiAgfVxyXG59KGpRdWVyeSwgd2luZG93LkZvdW5kYXRpb24pO1xyXG5cclxuLy8qKioqKioqKip0aGlzIGlzIGluIGNhc2Ugd2UgZ28gdG8gc3RhdGljLCBhYnNvbHV0ZSBwb3NpdGlvbnMgaW5zdGVhZCBvZiBkeW5hbWljIHBvc2l0aW9uaW5nKioqKioqKipcclxuLy8gdGhpcy5zZXRTdGVwcyhmdW5jdGlvbigpe1xyXG4vLyAgIF90aGlzLl9ldmVudHMoKTtcclxuLy8gICB2YXIgaW5pdFN0YXJ0ID0gX3RoaXMub3B0aW9ucy5wb3NpdGlvbnNbX3RoaXMub3B0aW9ucy5pbml0aWFsU3RhcnQgLSAxXSB8fCBudWxsO1xyXG4vLyAgIHZhciBpbml0RW5kID0gX3RoaXMub3B0aW9ucy5pbml0aWFsRW5kID8gX3RoaXMub3B0aW9ucy5wb3NpdGlvbltfdGhpcy5vcHRpb25zLmluaXRpYWxFbmQgLSAxXSA6IG51bGw7XHJcbi8vICAgaWYoaW5pdFN0YXJ0IHx8IGluaXRFbmQpe1xyXG4vLyAgICAgX3RoaXMuX2hhbmRsZUV2ZW50KGluaXRTdGFydCwgaW5pdEVuZCk7XHJcbi8vICAgfVxyXG4vLyB9KTtcclxuXHJcbi8vKioqKioqKioqKip0aGUgb3RoZXIgcGFydCBvZiBhYnNvbHV0ZSBwb3NpdGlvbnMqKioqKioqKioqKioqXHJcbi8vIFNsaWRlci5wcm90b3R5cGUuc2V0U3RlcHMgPSBmdW5jdGlvbihjYil7XHJcbi8vICAgdmFyIHBvc0NoYW5nZSA9IHRoaXMuJGVsZW1lbnQub3V0ZXJXaWR0aCgpIC8gdGhpcy5vcHRpb25zLnN0ZXBzO1xyXG4vLyAgIHZhciBjb3VudGVyID0gMFxyXG4vLyAgIHdoaWxlKGNvdW50ZXIgPCB0aGlzLm9wdGlvbnMuc3RlcHMpe1xyXG4vLyAgICAgaWYoY291bnRlcil7XHJcbi8vICAgICAgIHRoaXMub3B0aW9ucy5wb3NpdGlvbnMucHVzaCh0aGlzLm9wdGlvbnMucG9zaXRpb25zW2NvdW50ZXIgLSAxXSArIHBvc0NoYW5nZSk7XHJcbi8vICAgICB9ZWxzZXtcclxuLy8gICAgICAgdGhpcy5vcHRpb25zLnBvc2l0aW9ucy5wdXNoKHBvc0NoYW5nZSk7XHJcbi8vICAgICB9XHJcbi8vICAgICBjb3VudGVyKys7XHJcbi8vICAgfVxyXG4vLyAgIGNiKCk7XHJcbi8vIH07XHJcbiIsIi8qKlxyXG4gKiBTdGlja3kgbW9kdWxlLlxyXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24uc3RpY2t5XHJcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudHJpZ2dlcnNcclxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tZWRpYVF1ZXJ5XHJcbiAqL1xyXG4hZnVuY3Rpb24oJCwgRm91bmRhdGlvbil7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIGEgc3RpY2t5IHRoaW5nLlxyXG4gICAqIEBjbGFzc1xyXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIHN0aWNreS5cclxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIG9wdGlvbnMgb2JqZWN0IHBhc3NlZCB3aGVuIGNyZWF0aW5nIHRoZSBlbGVtZW50IHByb2dyYW1tYXRpY2FsbHkuXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gU3RpY2t5KGVsZW1lbnQsIG9wdGlvbnMpe1xyXG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgU3RpY2t5LmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XHJcblxyXG4gICAgdGhpcy5faW5pdCgpO1xyXG5cclxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ1N0aWNreScpO1xyXG4gIH1cclxuICBTdGlja3kuZGVmYXVsdHMgPSB7XHJcbiAgICAvKipcclxuICAgICAqIEN1c3RvbWl6YWJsZSBjb250YWluZXIgdGVtcGxhdGUuIEFkZCB5b3VyIG93biBjbGFzc2VzIGZvciBzdHlsaW5nIGFuZCBzaXppbmcuXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKiBAZXhhbXBsZSAnJmx0O2RpdiBkYXRhLXN0aWNreS1jb250YWluZXIgY2xhc3M9XCJzbWFsbC02IGNvbHVtbnNcIiZndDsmbHQ7L2RpdiZndDsnXHJcbiAgICAgKi9cclxuICAgIGNvbnRhaW5lcjogJzxkaXYgZGF0YS1zdGlja3ktY29udGFpbmVyPjwvZGl2PicsXHJcbiAgICAvKipcclxuICAgICAqIExvY2F0aW9uIGluIHRoZSB2aWV3IHRoZSBlbGVtZW50IHN0aWNrcyB0by5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlICd0b3AnXHJcbiAgICAgKi9cclxuICAgIHN0aWNrVG86ICd0b3AnLFxyXG4gICAgLyoqXHJcbiAgICAgKiBJZiBhbmNob3JlZCB0byBhIHNpbmdsZSBlbGVtZW50LCB0aGUgaWQgb2YgdGhhdCBlbGVtZW50LlxyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgJ2V4YW1wbGVJZCdcclxuICAgICAqL1xyXG4gICAgYW5jaG9yOiAnJyxcclxuICAgIC8qKlxyXG4gICAgICogSWYgdXNpbmcgbW9yZSB0aGFuIG9uZSBlbGVtZW50IGFzIGFuY2hvciBwb2ludHMsIHRoZSBpZCBvZiB0aGUgdG9wIGFuY2hvci5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlICdleGFtcGxlSWQ6dG9wJ1xyXG4gICAgICovXHJcbiAgICB0b3BBbmNob3I6ICcnLFxyXG4gICAgLyoqXHJcbiAgICAgKiBJZiB1c2luZyBtb3JlIHRoYW4gb25lIGVsZW1lbnQgYXMgYW5jaG9yIHBvaW50cywgdGhlIGlkIG9mIHRoZSBib3R0b20gYW5jaG9yLlxyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgJ2V4YW1wbGVJZDpib3R0b20nXHJcbiAgICAgKi9cclxuICAgIGJ0bUFuY2hvcjogJycsXHJcbiAgICAvKipcclxuICAgICAqIE1hcmdpbiwgaW4gYGVtYCdzIHRvIGFwcGx5IHRvIHRoZSB0b3Agb2YgdGhlIGVsZW1lbnQgd2hlbiBpdCBiZWNvbWVzIHN0aWNreS5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlIDFcclxuICAgICAqL1xyXG4gICAgbWFyZ2luVG9wOiAxLFxyXG4gICAgLyoqXHJcbiAgICAgKiBNYXJnaW4sIGluIGBlbWAncyB0byBhcHBseSB0byB0aGUgYm90dG9tIG9mIHRoZSBlbGVtZW50IHdoZW4gaXQgYmVjb21lcyBzdGlja3kuXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKiBAZXhhbXBsZSAxXHJcbiAgICAgKi9cclxuICAgIG1hcmdpbkJvdHRvbTogMSxcclxuICAgIC8qKlxyXG4gICAgICogQnJlYWtwb2ludCBzdHJpbmcgdGhhdCBpcyB0aGUgbWluaW11bSBzY3JlZW4gc2l6ZSBhbiBlbGVtZW50IHNob3VsZCBiZWNvbWUgc3RpY2t5LlxyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgJ21lZGl1bSdcclxuICAgICAqL1xyXG4gICAgc3RpY2t5T246ICdtZWRpdW0nLFxyXG4gICAgLyoqXHJcbiAgICAgKiBDbGFzcyBhcHBsaWVkIHRvIHN0aWNreSBlbGVtZW50LCBhbmQgcmVtb3ZlZCBvbiBkZXN0cnVjdGlvbi4gRm91bmRhdGlvbiBkZWZhdWx0cyB0byBgc3RpY2t5YC5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlICdzdGlja3knXHJcbiAgICAgKi9cclxuICAgIHN0aWNreUNsYXNzOiAnc3RpY2t5JyxcclxuICAgIC8qKlxyXG4gICAgICogQ2xhc3MgYXBwbGllZCB0byBzdGlja3kgY29udGFpbmVyLiBGb3VuZGF0aW9uIGRlZmF1bHRzIHRvIGBzdGlja3ktY29udGFpbmVyYC5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlICdzdGlja3ktY29udGFpbmVyJ1xyXG4gICAgICovXHJcbiAgICBjb250YWluZXJDbGFzczogJ3N0aWNreS1jb250YWluZXInLFxyXG4gICAgLyoqXHJcbiAgICAgKiBOdW1iZXIgb2Ygc2Nyb2xsIGV2ZW50cyBiZXR3ZWVuIHRoZSBwbHVnaW4ncyByZWNhbGN1bGF0aW5nIHN0aWNreSBwb2ludHMuIFNldHRpbmcgaXQgdG8gYDBgIHdpbGwgY2F1c2UgaXQgdG8gcmVjYWxjIGV2ZXJ5IHNjcm9sbCBldmVudCwgc2V0dGluZyBpdCB0byBgLTFgIHdpbGwgcHJldmVudCByZWNhbGMgb24gc2Nyb2xsLlxyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgNTBcclxuICAgICAqL1xyXG4gICAgY2hlY2tFdmVyeTogLTFcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBJbml0aWFsaXplcyB0aGUgc3RpY2t5IGVsZW1lbnQgYnkgYWRkaW5nIGNsYXNzZXMsIGdldHRpbmcvc2V0dGluZyBkaW1lbnNpb25zLCBicmVha3BvaW50cyBhbmQgYXR0cmlidXRlc1xyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgU3RpY2t5LnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgJHBhcmVudCA9IHRoaXMuJGVsZW1lbnQucGFyZW50KCdbZGF0YS1zdGlja3ktY29udGFpbmVyXScpLFxyXG4gICAgICAgIGlkID0gdGhpcy4kZWxlbWVudFswXS5pZCB8fCBGb3VuZGF0aW9uLkdldFlvRGlnaXRzKDYsICdzdGlja3knKSxcclxuICAgICAgICBfdGhpcyA9IHRoaXM7XHJcblxyXG4gICAgaWYoISRwYXJlbnQubGVuZ3RoKXtcclxuICAgICAgdGhpcy53YXNXcmFwcGVkID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIHRoaXMuJGNvbnRhaW5lciA9ICRwYXJlbnQubGVuZ3RoID8gJHBhcmVudCA6ICQodGhpcy5vcHRpb25zLmNvbnRhaW5lcikud3JhcElubmVyKHRoaXMuJGVsZW1lbnQpO1xyXG4gICAgdGhpcy4kY29udGFpbmVyLmFkZENsYXNzKHRoaXMub3B0aW9ucy5jb250YWluZXJDbGFzcyk7XHJcblxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3ModGhpcy5vcHRpb25zLnN0aWNreUNsYXNzKVxyXG4gICAgICAgICAgICAgICAgIC5hdHRyKHsnZGF0YS1yZXNpemUnOiBpZH0pO1xyXG5cclxuICAgIHRoaXMuc2Nyb2xsQ291bnQgPSB0aGlzLm9wdGlvbnMuY2hlY2tFdmVyeTtcclxuICAgIHRoaXMuaXNTdHVjayA9IGZhbHNlO1xyXG5cclxuICAgIGlmKHRoaXMub3B0aW9ucy5hbmNob3IgIT09ICcnKXtcclxuICAgICAgdGhpcy4kYW5jaG9yID0gJCgnIycgKyB0aGlzLm9wdGlvbnMuYW5jaG9yKTtcclxuICAgIH1lbHNle1xyXG4gICAgICB0aGlzLl9wYXJzZVBvaW50cygpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX3NldFNpemVzKGZ1bmN0aW9uKCl7XHJcbiAgICAgIF90aGlzLl9jYWxjKGZhbHNlKTtcclxuICAgIH0pO1xyXG4gICAgdGhpcy5fZXZlbnRzKGlkLnNwbGl0KCctJykucmV2ZXJzZSgpLmpvaW4oJy0nKSk7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiBJZiB1c2luZyBtdWx0aXBsZSBlbGVtZW50cyBhcyBhbmNob3JzLCBjYWxjdWxhdGVzIHRoZSB0b3AgYW5kIGJvdHRvbSBwaXhlbCB2YWx1ZXMgdGhlIHN0aWNreSB0aGluZyBzaG91bGQgc3RpY2sgYW5kIHVuc3RpY2sgb24uXHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBTdGlja3kucHJvdG90eXBlLl9wYXJzZVBvaW50cyA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgdG9wID0gdGhpcy5vcHRpb25zLnRvcEFuY2hvcixcclxuICAgICAgICBidG0gPSB0aGlzLm9wdGlvbnMuYnRtQW5jaG9yLFxyXG4gICAgICAgIHB0cyA9IFt0b3AsIGJ0bV0sXHJcbiAgICAgICAgYnJlYWtzID0ge307XHJcbiAgICBpZih0b3AgJiYgYnRtKXtcclxuXHJcbiAgICAgIGZvcih2YXIgaSA9IDAsIGxlbiA9IHB0cy5sZW5ndGg7IGkgPCBsZW4gJiYgcHRzW2ldOyBpKyspe1xyXG4gICAgICAgIHZhciBwdDtcclxuICAgICAgICBpZih0eXBlb2YgcHRzW2ldID09PSAnbnVtYmVyJyl7XHJcbiAgICAgICAgICBwdCA9IHB0c1tpXTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgIHZhciBwbGFjZSA9IHB0c1tpXS5zcGxpdCgnOicpLFxyXG4gICAgICAgICAgICAgIGFuY2hvciA9ICQoJyMnICsgcGxhY2VbMF0pO1xyXG5cclxuICAgICAgICAgIHB0ID0gYW5jaG9yLm9mZnNldCgpLnRvcDtcclxuICAgICAgICAgIGlmKHBsYWNlWzFdICYmIHBsYWNlWzFdLnRvTG93ZXJDYXNlKCkgPT09ICdib3R0b20nKXtcclxuICAgICAgICAgICAgcHQgKz0gYW5jaG9yWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWtzW2ldID0gcHQ7XHJcbiAgICAgIH1cclxuICAgIH1lbHNle1xyXG4gICAgICBicmVha3MgPSB7MDogMSwgMTogZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbEhlaWdodH07XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5wb2ludHMgPSBicmVha3M7XHJcbiAgICByZXR1cm47XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBldmVudCBoYW5kbGVycyBmb3IgdGhlIHNjcm9sbGluZyBlbGVtZW50LlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gcHN1ZWRvLXJhbmRvbSBpZCBmb3IgdW5pcXVlIHNjcm9sbCBldmVudCBsaXN0ZW5lci5cclxuICAgKi9cclxuICBTdGlja3kucHJvdG90eXBlLl9ldmVudHMgPSBmdW5jdGlvbihpZCl7XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzLFxyXG4gICAgICAgIHNjcm9sbExpc3RlbmVyID0gdGhpcy5zY3JvbGxMaXN0ZW5lciA9ICdzY3JvbGwuemYuJyArIGlkO1xyXG4gICAgaWYodGhpcy5pc09uKXsgcmV0dXJuOyB9XHJcbiAgICBpZih0aGlzLmNhblN0aWNrKXtcclxuICAgICAgdGhpcy5pc09uID0gdHJ1ZTtcclxuICAgICAgJCh3aW5kb3cpLm9mZihzY3JvbGxMaXN0ZW5lcilcclxuICAgICAgICAgICAgICAgLm9uKHNjcm9sbExpc3RlbmVyLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgICAgICBpZihfdGhpcy5zY3JvbGxDb3VudCA9PT0gMCl7XHJcbiAgICAgICAgICAgICAgICAgICBfdGhpcy5zY3JvbGxDb3VudCA9IF90aGlzLm9wdGlvbnMuY2hlY2tFdmVyeTtcclxuICAgICAgICAgICAgICAgICAgIF90aGlzLl9zZXRTaXplcyhmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICBfdGhpcy5fY2FsYyhmYWxzZSwgd2luZG93LnBhZ2VZT2Zmc2V0KTtcclxuICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgX3RoaXMuc2Nyb2xsQ291bnQtLTtcclxuICAgICAgICAgICAgICAgICAgIF90aGlzLl9jYWxjKGZhbHNlLCB3aW5kb3cucGFnZVlPZmZzZXQpO1xyXG4gICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLiRlbGVtZW50Lm9mZigncmVzaXplbWUuemYudHJpZ2dlcicpXHJcbiAgICAgICAgICAgICAgICAgLm9uKCdyZXNpemVtZS56Zi50cmlnZ2VyJywgZnVuY3Rpb24oZSwgZWwpe1xyXG4gICAgICAgICAgICAgICAgICAgICBfdGhpcy5fc2V0U2l6ZXMoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5fY2FsYyhmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgaWYoX3RoaXMuY2FuU3RpY2spe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgaWYoIV90aGlzLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5fZXZlbnRzKGlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZSBpZihfdGhpcy5pc09uKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLl9wYXVzZUxpc3RlbmVycyhzY3JvbGxMaXN0ZW5lcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgZXZlbnQgaGFuZGxlcnMgZm9yIHNjcm9sbCBhbmQgY2hhbmdlIGV2ZW50cyBvbiBhbmNob3IuXHJcbiAgICogQGZpcmVzIFN0aWNreSNwYXVzZVxyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzY3JvbGxMaXN0ZW5lciAtIHVuaXF1ZSwgbmFtZXNwYWNlZCBzY3JvbGwgbGlzdGVuZXIgYXR0YWNoZWQgdG8gYHdpbmRvd2BcclxuICAgKi9cclxuICBTdGlja3kucHJvdG90eXBlLl9wYXVzZUxpc3RlbmVycyA9IGZ1bmN0aW9uKHNjcm9sbExpc3RlbmVyKXtcclxuICAgIHRoaXMuaXNPbiA9IGZhbHNlO1xyXG4gICAgJCh3aW5kb3cpLm9mZihzY3JvbGxMaXN0ZW5lcik7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSBwbHVnaW4gaXMgcGF1c2VkIGR1ZSB0byByZXNpemUgZXZlbnQgc2hyaW5raW5nIHRoZSB2aWV3LlxyXG4gICAgICogQGV2ZW50IFN0aWNreSNwYXVzZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcigncGF1c2UuemYuc3RpY2t5Jyk7XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIG9uIGV2ZXJ5IGBzY3JvbGxgIGV2ZW50IGFuZCBvbiBgX2luaXRgXHJcbiAgICogZmlyZXMgZnVuY3Rpb25zIGJhc2VkIG9uIGJvb2xlYW5zIGFuZCBjYWNoZWQgdmFsdWVzXHJcbiAgICogQHBhcmFtIHtCb29sZWFufSBjaGVja1NpemVzIC0gdHJ1ZSBpZiBwbHVnaW4gc2hvdWxkIHJlY2FsY3VsYXRlIHNpemVzIGFuZCBicmVha3BvaW50cy5cclxuICAgKiBAcGFyYW0ge051bWJlcn0gc2Nyb2xsIC0gY3VycmVudCBzY3JvbGwgcG9zaXRpb24gcGFzc2VkIGZyb20gc2Nyb2xsIGV2ZW50IGNiIGZ1bmN0aW9uLiBJZiBub3QgcGFzc2VkLCBkZWZhdWx0cyB0byBgd2luZG93LnBhZ2VZT2Zmc2V0YC5cclxuICAgKi9cclxuICBTdGlja3kucHJvdG90eXBlLl9jYWxjID0gZnVuY3Rpb24oY2hlY2tTaXplcywgc2Nyb2xsKXtcclxuICAgIGlmKGNoZWNrU2l6ZXMpeyB0aGlzLl9zZXRTaXplcygpOyB9XHJcblxyXG4gICAgaWYoIXRoaXMuY2FuU3RpY2spe1xyXG4gICAgICBpZih0aGlzLmlzU3R1Y2spe1xyXG4gICAgICAgIHRoaXMuX3JlbW92ZVN0aWNreSh0cnVlKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYoIXNjcm9sbCl7IHNjcm9sbCA9IHdpbmRvdy5wYWdlWU9mZnNldDsgfVxyXG5cclxuICAgIGlmKHNjcm9sbCA+PSB0aGlzLnRvcFBvaW50KXtcclxuICAgICAgaWYoc2Nyb2xsIDw9IHRoaXMuYm90dG9tUG9pbnQpe1xyXG4gICAgICAgIGlmKCF0aGlzLmlzU3R1Y2spe1xyXG4gICAgICAgICAgdGhpcy5fc2V0U3RpY2t5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ZWxzZXtcclxuICAgICAgICBpZih0aGlzLmlzU3R1Y2spe1xyXG4gICAgICAgICAgdGhpcy5fcmVtb3ZlU3RpY2t5KGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1lbHNle1xyXG4gICAgICBpZih0aGlzLmlzU3R1Y2spe1xyXG4gICAgICAgIHRoaXMuX3JlbW92ZVN0aWNreSh0cnVlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogQ2F1c2VzIHRoZSAkZWxlbWVudCB0byBiZWNvbWUgc3R1Y2suXHJcbiAgICogQWRkcyBgcG9zaXRpb246IGZpeGVkO2AsIGFuZCBoZWxwZXIgY2xhc3Nlcy5cclxuICAgKiBAZmlyZXMgU3RpY2t5I3N0dWNrdG9cclxuICAgKiBAZnVuY3Rpb25cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIFN0aWNreS5wcm90b3R5cGUuX3NldFN0aWNreSA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgc3RpY2tUbyA9IHRoaXMub3B0aW9ucy5zdGlja1RvLFxyXG4gICAgICAgIG1yZ24gPSBzdGlja1RvID09PSAndG9wJyA/ICdtYXJnaW5Ub3AnIDogJ21hcmdpbkJvdHRvbScsXHJcbiAgICAgICAgbm90U3R1Y2tUbyA9IHN0aWNrVG8gPT09ICd0b3AnID8gJ2JvdHRvbScgOiAndG9wJyxcclxuICAgICAgICBjc3MgPSB7fTtcclxuXHJcbiAgICBjc3NbbXJnbl0gPSB0aGlzLm9wdGlvbnNbbXJnbl0gKyAnZW0nO1xyXG4gICAgY3NzW3N0aWNrVG9dID0gMDtcclxuICAgIGNzc1tub3RTdHVja1RvXSA9ICdhdXRvJztcclxuICAgIGNzc1snbGVmdCddID0gdGhpcy4kY29udGFpbmVyLm9mZnNldCgpLmxlZnQgKyBwYXJzZUludCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLiRjb250YWluZXJbMF0pW1wicGFkZGluZy1sZWZ0XCJdLCAxMCk7XHJcbiAgICB0aGlzLmlzU3R1Y2sgPSB0cnVlO1xyXG4gICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnaXMtYW5jaG9yZWQgaXMtYXQtJyArIG5vdFN0dWNrVG8pXHJcbiAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdpcy1zdHVjayBpcy1hdC0nICsgc3RpY2tUbylcclxuICAgICAgICAgICAgICAgICAuY3NzKGNzcylcclxuICAgICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSAkZWxlbWVudCBoYXMgYmVjb21lIGBwb3NpdGlvbjogZml4ZWQ7YFxyXG4gICAgICAgICAgICAgICAgICAqIE5hbWVzcGFjZWQgdG8gYHRvcGAgb3IgYGJvdHRvbWAuXHJcbiAgICAgICAgICAgICAgICAgICogQGV2ZW50IFN0aWNreSNzdHVja3RvXHJcbiAgICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAgLnRyaWdnZXIoJ3N0aWNreS56Zi5zdHVja3RvOicgKyBzdGlja1RvKTtcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDYXVzZXMgdGhlICRlbGVtZW50IHRvIGJlY29tZSB1bnN0dWNrLlxyXG4gICAqIFJlbW92ZXMgYHBvc2l0aW9uOiBmaXhlZDtgLCBhbmQgaGVscGVyIGNsYXNzZXMuXHJcbiAgICogQWRkcyBvdGhlciBoZWxwZXIgY2xhc3Nlcy5cclxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzVG9wIC0gdGVsbHMgdGhlIGZ1bmN0aW9uIGlmIHRoZSAkZWxlbWVudCBzaG91bGQgYW5jaG9yIHRvIHRoZSB0b3Agb3IgYm90dG9tIG9mIGl0cyAkYW5jaG9yIGVsZW1lbnQuXHJcbiAgICogQGZpcmVzIFN0aWNreSN1bnN0dWNrZnJvbVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgU3RpY2t5LnByb3RvdHlwZS5fcmVtb3ZlU3RpY2t5ID0gZnVuY3Rpb24oaXNUb3Ape1xyXG4gICAgdmFyIHN0aWNrVG8gPSB0aGlzLm9wdGlvbnMuc3RpY2tUbyxcclxuICAgICAgICBzdGlja1RvVG9wID0gc3RpY2tUbyA9PT0gJ3RvcCcsXHJcbiAgICAgICAgY3NzID0ge30sXHJcbiAgICAgICAgYW5jaG9yUHQgPSAodGhpcy5wb2ludHMgPyB0aGlzLnBvaW50c1sxXSAtIHRoaXMucG9pbnRzWzBdIDogdGhpcy5hbmNob3JIZWlnaHQpIC0gdGhpcy5lbGVtSGVpZ2h0LFxyXG4gICAgICAgIG1yZ24gPSBzdGlja1RvVG9wID8gJ21hcmdpblRvcCcgOiAnbWFyZ2luQm90dG9tJyxcclxuICAgICAgICBub3RTdHVja1RvID0gc3RpY2tUb1RvcCA/ICdib3R0b20nIDogJ3RvcCcsXHJcbiAgICAgICAgdG9wT3JCb3R0b20gPSBpc1RvcCA/ICd0b3AnIDogJ2JvdHRvbSc7XHJcblxyXG4gICAgY3NzW21yZ25dID0gMDtcclxuXHJcbiAgICBpZigoaXNUb3AgJiYgIXN0aWNrVG9Ub3ApIHx8IChzdGlja1RvVG9wICYmICFpc1RvcCkpe1xyXG4gICAgICBjc3Nbc3RpY2tUb10gPSBhbmNob3JQdDtcclxuICAgICAgY3NzW25vdFN0dWNrVG9dID0gMDtcclxuICAgIH1lbHNle1xyXG4gICAgICBjc3Nbc3RpY2tUb10gPSAwO1xyXG4gICAgICBjc3Nbbm90U3R1Y2tUb10gPSBhbmNob3JQdDtcclxuICAgIH1cclxuXHJcbiAgICBjc3NbJ2xlZnQnXSA9ICcnO1xyXG4gICAgdGhpcy5pc1N0dWNrID0gZmFsc2U7XHJcbiAgICB0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKCdpcy1zdHVjayBpcy1hdC0nICsgc3RpY2tUbylcclxuICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ2lzLWFuY2hvcmVkIGlzLWF0LScgKyB0b3BPckJvdHRvbSlcclxuICAgICAgICAgICAgICAgICAuY3NzKGNzcylcclxuICAgICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSAkZWxlbWVudCBoYXMgYmVjb21lIGFuY2hvcmVkLlxyXG4gICAgICAgICAgICAgICAgICAqIE5hbWVzcGFjZWQgdG8gYHRvcGAgb3IgYGJvdHRvbWAuXHJcbiAgICAgICAgICAgICAgICAgICogQGV2ZW50IFN0aWNreSN1bnN0dWNrZnJvbVxyXG4gICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgIC50cmlnZ2VyKCdzdGlja3kuemYudW5zdHVja2Zyb206JyArIHRvcE9yQm90dG9tKTtcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSAkZWxlbWVudCBhbmQgJGNvbnRhaW5lciBzaXplcyBmb3IgcGx1Z2luLlxyXG4gICAqIENhbGxzIGBfc2V0QnJlYWtQb2ludHNgLlxyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIC0gb3B0aW9uYWwgY2FsbGJhY2sgZnVuY3Rpb24gdG8gZmlyZSBvbiBjb21wbGV0aW9uIG9mIGBfc2V0QnJlYWtQb2ludHNgLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgU3RpY2t5LnByb3RvdHlwZS5fc2V0U2l6ZXMgPSBmdW5jdGlvbihjYil7XHJcbiAgICB0aGlzLmNhblN0aWNrID0gRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3QodGhpcy5vcHRpb25zLnN0aWNreU9uKTtcclxuICAgIGlmKCF0aGlzLmNhblN0aWNrKXsgY2IoKTsgfVxyXG4gICAgdmFyIF90aGlzID0gdGhpcyxcclxuICAgICAgICBuZXdFbGVtV2lkdGggPSB0aGlzLiRjb250YWluZXJbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGgsXHJcbiAgICAgICAgY29tcCA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMuJGNvbnRhaW5lclswXSksXHJcbiAgICAgICAgcGRuZyA9IHBhcnNlSW50KGNvbXBbJ3BhZGRpbmctcmlnaHQnXSwgMTApO1xyXG5cclxuICAgIGlmKHRoaXMuJGFuY2hvciAmJiB0aGlzLiRhbmNob3IubGVuZ3RoKXtcclxuICAgICAgdGhpcy5hbmNob3JIZWlnaHQgPSB0aGlzLiRhbmNob3JbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIHRoaXMuX3BhcnNlUG9pbnRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy4kZWxlbWVudC5jc3Moe1xyXG4gICAgICAnbWF4LXdpZHRoJzogbmV3RWxlbVdpZHRoIC0gcGRuZyArICdweCdcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBuZXdDb250YWluZXJIZWlnaHQgPSB0aGlzLiRlbGVtZW50WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodCB8fCB0aGlzLmNvbnRhaW5lckhlaWdodDtcclxuICAgIHRoaXMuY29udGFpbmVySGVpZ2h0ID0gbmV3Q29udGFpbmVySGVpZ2h0O1xyXG4gICAgdGhpcy4kY29udGFpbmVyLmNzcyh7XHJcbiAgICAgIGhlaWdodDogbmV3Q29udGFpbmVySGVpZ2h0XHJcbiAgICB9KTtcclxuICAgIHRoaXMuZWxlbUhlaWdodCA9IG5ld0NvbnRhaW5lckhlaWdodDtcclxuXHJcbiAgXHRpZiAodGhpcy5pc1N0dWNrKSB7XHJcbiAgXHRcdHRoaXMuJGVsZW1lbnQuY3NzKHtcImxlZnRcIjp0aGlzLiRjb250YWluZXIub2Zmc2V0KCkubGVmdCArIHBhcnNlSW50KGNvbXBbJ3BhZGRpbmctbGVmdCddLCAxMCl9KTtcclxuICBcdH1cclxuXHJcbiAgICB0aGlzLl9zZXRCcmVha1BvaW50cyhuZXdDb250YWluZXJIZWlnaHQsIGZ1bmN0aW9uKCl7XHJcbiAgICAgIGlmKGNiKXsgY2IoKTsgfVxyXG4gICAgfSk7XHJcblxyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgdXBwZXIgYW5kIGxvd2VyIGJyZWFrcG9pbnRzIGZvciB0aGUgZWxlbWVudCB0byBiZWNvbWUgc3RpY2t5L3Vuc3RpY2t5LlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBlbGVtSGVpZ2h0IC0gcHggdmFsdWUgZm9yIHN0aWNreS4kZWxlbWVudCBoZWlnaHQsIGNhbGN1bGF0ZWQgYnkgYF9zZXRTaXplc2AuXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2IgLSBvcHRpb25hbCBjYWxsYmFjayBmdW5jdGlvbiB0byBiZSBjYWxsZWQgb24gY29tcGxldGlvbi5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIFN0aWNreS5wcm90b3R5cGUuX3NldEJyZWFrUG9pbnRzID0gZnVuY3Rpb24oZWxlbUhlaWdodCwgY2Ipe1xyXG4gICAgaWYoIXRoaXMuY2FuU3RpY2spe1xyXG4gICAgICBpZihjYil7IGNiKCk7IH1cclxuICAgICAgZWxzZXsgcmV0dXJuIGZhbHNlOyB9XHJcbiAgICB9XHJcbiAgICB2YXIgbVRvcCA9IGVtQ2FsYyh0aGlzLm9wdGlvbnMubWFyZ2luVG9wKSxcclxuICAgICAgICBtQnRtID0gZW1DYWxjKHRoaXMub3B0aW9ucy5tYXJnaW5Cb3R0b20pLFxyXG4gICAgICAgIHRvcFBvaW50ID0gdGhpcy5wb2ludHMgPyB0aGlzLnBvaW50c1swXSA6IHRoaXMuJGFuY2hvci5vZmZzZXQoKS50b3AsXHJcbiAgICAgICAgYm90dG9tUG9pbnQgPSB0aGlzLnBvaW50cyA/IHRoaXMucG9pbnRzWzFdIDogdG9wUG9pbnQgKyB0aGlzLmFuY2hvckhlaWdodCxcclxuICAgICAgICAvLyB0b3BQb2ludCA9IHRoaXMuJGFuY2hvci5vZmZzZXQoKS50b3AgfHwgdGhpcy5wb2ludHNbMF0sXHJcbiAgICAgICAgLy8gYm90dG9tUG9pbnQgPSB0b3BQb2ludCArIHRoaXMuYW5jaG9ySGVpZ2h0IHx8IHRoaXMucG9pbnRzWzFdLFxyXG4gICAgICAgIHdpbkhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuXHJcbiAgICBpZih0aGlzLm9wdGlvbnMuc3RpY2tUbyA9PT0gJ3RvcCcpe1xyXG4gICAgICB0b3BQb2ludCAtPSBtVG9wO1xyXG4gICAgICBib3R0b21Qb2ludCAtPSAoZWxlbUhlaWdodCArIG1Ub3ApO1xyXG4gICAgfWVsc2UgaWYodGhpcy5vcHRpb25zLnN0aWNrVG8gPT09ICdib3R0b20nKXtcclxuICAgICAgdG9wUG9pbnQgLT0gKHdpbkhlaWdodCAtIChlbGVtSGVpZ2h0ICsgbUJ0bSkpO1xyXG4gICAgICBib3R0b21Qb2ludCAtPSAod2luSGVpZ2h0IC0gbUJ0bSk7XHJcbiAgICB9ZWxzZXtcclxuICAgICAgLy90aGlzIHdvdWxkIGJlIHRoZSBzdGlja1RvOiBib3RoIG9wdGlvbi4uLiB0cmlja3lcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnRvcFBvaW50ID0gdG9wUG9pbnQ7XHJcbiAgICB0aGlzLmJvdHRvbVBvaW50ID0gYm90dG9tUG9pbnQ7XHJcblxyXG4gICAgaWYoY2IpeyBjYigpOyB9XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogRGVzdHJveXMgdGhlIGN1cnJlbnQgc3RpY2t5IGVsZW1lbnQuXHJcbiAgICogUmVzZXRzIHRoZSBlbGVtZW50IHRvIHRoZSB0b3AgcG9zaXRpb24gZmlyc3QuXHJcbiAgICogUmVtb3ZlcyBldmVudCBsaXN0ZW5lcnMsIEpTLWFkZGVkIGNzcyBwcm9wZXJ0aWVzIGFuZCBjbGFzc2VzLCBhbmQgdW53cmFwcyB0aGUgJGVsZW1lbnQgaWYgdGhlIEpTIGFkZGVkIHRoZSAkY29udGFpbmVyLlxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqL1xyXG4gIFN0aWNreS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCl7XHJcbiAgICB0aGlzLl9yZW1vdmVTdGlja3kodHJ1ZSk7XHJcblxyXG4gICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuc3RpY2t5Q2xhc3MgKyAnIGlzLWFuY2hvcmVkIGlzLWF0LXRvcCcpXHJcbiAgICAgICAgICAgICAgICAgLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgdG9wOiAnJyxcclxuICAgICAgICAgICAgICAgICAgIGJvdHRvbTogJycsXHJcbiAgICAgICAgICAgICAgICAgICAnbWF4LXdpZHRoJzogJydcclxuICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgIC5vZmYoJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInKTtcclxuXHJcbiAgICB0aGlzLiRhbmNob3Iub2ZmKCdjaGFuZ2UuemYuc3RpY2t5Jyk7XHJcbiAgICAkKHdpbmRvdykub2ZmKHRoaXMuc2Nyb2xsTGlzdGVuZXIpO1xyXG5cclxuICAgIGlmKHRoaXMud2FzV3JhcHBlZCl7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQudW53cmFwKCk7XHJcbiAgICB9ZWxzZXtcclxuICAgICAgdGhpcy4kY29udGFpbmVyLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jb250YWluZXJDbGFzcylcclxuICAgICAgICAgICAgICAgICAgICAgLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnJ1xyXG4gICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIEhlbHBlciBmdW5jdGlvbiB0byBjYWxjdWxhdGUgZW0gdmFsdWVzXHJcbiAgICogQHBhcmFtIE51bWJlciB7ZW19IC0gbnVtYmVyIG9mIGVtJ3MgdG8gY2FsY3VsYXRlIGludG8gcGl4ZWxzXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gZW1DYWxjKGVtKXtcclxuICAgIHJldHVybiBwYXJzZUludCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5ib2R5LCBudWxsKS5mb250U2l6ZSwgMTApICogZW07XHJcbiAgfVxyXG4gIEZvdW5kYXRpb24ucGx1Z2luKFN0aWNreSwgJ1N0aWNreScpO1xyXG59KGpRdWVyeSwgd2luZG93LkZvdW5kYXRpb24pO1xyXG4iLCIvKipcclxuICogVGFicyBtb2R1bGUuXHJcbiAqIEBtb2R1bGUgZm91bmRhdGlvbi50YWJzXHJcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcclxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50aW1lckFuZEltYWdlTG9hZGVyIGlmIHRhYnMgY29udGFpbiBpbWFnZXNcclxuICovXHJcbiFmdW5jdGlvbigkLCBGb3VuZGF0aW9uKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIHRhYnMuXHJcbiAgICogQGNsYXNzXHJcbiAgICogQGZpcmVzIFRhYnMjaW5pdFxyXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gdGFicy5cclxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gVGFicyhlbGVtZW50LCBvcHRpb25zKXtcclxuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIFRhYnMuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcclxuXHJcbiAgICB0aGlzLl9pbml0KCk7XHJcbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdUYWJzJyk7XHJcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdUYWJzJywge1xyXG4gICAgICAnRU5URVInOiAnb3BlbicsXHJcbiAgICAgICdTUEFDRSc6ICdvcGVuJyxcclxuICAgICAgJ0FSUk9XX1JJR0hUJzogJ25leHQnLFxyXG4gICAgICAnQVJST1dfVVAnOiAncHJldmlvdXMnLFxyXG4gICAgICAnQVJST1dfRE9XTic6ICduZXh0JyxcclxuICAgICAgJ0FSUk9XX0xFRlQnOiAncHJldmlvdXMnXHJcbiAgICAgIC8vICdUQUInOiAnbmV4dCcsXHJcbiAgICAgIC8vICdTSElGVF9UQUInOiAncHJldmlvdXMnXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIFRhYnMuZGVmYXVsdHMgPSB7XHJcbiAgICAvLyAvKipcclxuICAgIC8vICAqIEFsbG93cyB0aGUgSlMgdG8gYWx0ZXIgdGhlIHVybCBvZiB0aGUgd2luZG93LiBOb3QgeWV0IGltcGxlbWVudGVkLlxyXG4gICAgLy8gICovXHJcbiAgICAvLyBkZWVwTGlua2luZzogZmFsc2UsXHJcbiAgICAvLyAvKipcclxuICAgIC8vICAqIElmIGRlZXBMaW5raW5nIGlzIGVuYWJsZWQsIGFsbG93cyB0aGUgd2luZG93IHRvIHNjcm9sbCB0byBjb250ZW50IGlmIHdpbmRvdyBpcyBsb2FkZWQgd2l0aCBhIGhhc2ggaW5jbHVkaW5nIGEgdGFiLXBhbmUgaWRcclxuICAgIC8vICAqL1xyXG4gICAgLy8gc2Nyb2xsVG9Db250ZW50OiBmYWxzZSxcclxuICAgIC8qKlxyXG4gICAgICogQWxsb3dzIHRoZSB3aW5kb3cgdG8gc2Nyb2xsIHRvIGNvbnRlbnQgb2YgYWN0aXZlIHBhbmUgb24gbG9hZCBpZiBzZXQgdG8gdHJ1ZS5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlIGZhbHNlXHJcbiAgICAgKi9cclxuICAgIGF1dG9Gb2N1czogZmFsc2UsXHJcbiAgICAvKipcclxuICAgICAqIEFsbG93cyBrZXlib2FyZCBpbnB1dCB0byAnd3JhcCcgYXJvdW5kIHRoZSB0YWIgbGlua3MuXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKiBAZXhhbXBsZSB0cnVlXHJcbiAgICAgKi9cclxuICAgIHdyYXBPbktleXM6IHRydWUsXHJcbiAgICAvKipcclxuICAgICAqIEFsbG93cyB0aGUgdGFiIGNvbnRlbnQgcGFuZXMgdG8gbWF0Y2ggaGVpZ2h0cyBpZiBzZXQgdG8gdHJ1ZS5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlIGZhbHNlXHJcbiAgICAgKi9cclxuICAgIG1hdGNoSGVpZ2h0OiBmYWxzZSxcclxuICAgIC8qKlxyXG4gICAgICogQ2xhc3MgYXBwbGllZCB0byBgbGlgJ3MgaW4gdGFiIGxpbmsgbGlzdC5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlICd0YWJzLXRpdGxlJ1xyXG4gICAgICovXHJcbiAgICBsaW5rQ2xhc3M6ICd0YWJzLXRpdGxlJyxcclxuICAgIC8vIGNvbnRlbnRDbGFzczogJ3RhYnMtY29udGVudCcsXHJcbiAgICAvKipcclxuICAgICAqIENsYXNzIGFwcGxpZWQgdG8gdGhlIGNvbnRlbnQgY29udGFpbmVycy5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlICd0YWJzLXBhbmVsJ1xyXG4gICAgICovXHJcbiAgICBwYW5lbENsYXNzOiAndGFicy1wYW5lbCdcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBJbml0aWFsaXplcyB0aGUgdGFicyBieSBzaG93aW5nIGFuZCBmb2N1c2luZyAoaWYgYXV0b0ZvY3VzPXRydWUpIHRoZSBwcmVzZXQgYWN0aXZlIHRhYi5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIFRhYnMucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcblxyXG4gICAgdGhpcy4kdGFiVGl0bGVzID0gdGhpcy4kZWxlbWVudC5maW5kKCcuJyArIHRoaXMub3B0aW9ucy5saW5rQ2xhc3MpO1xyXG4gICAgdGhpcy4kdGFiQ29udGVudCA9ICQoJ1tkYXRhLXRhYnMtY29udGVudD1cIicgKyB0aGlzLiRlbGVtZW50WzBdLmlkICsgJ1wiXScpO1xyXG5cclxuICAgIHRoaXMuJHRhYlRpdGxlcy5lYWNoKGZ1bmN0aW9uKCl7XHJcbiAgICAgIHZhciAkZWxlbSA9ICQodGhpcyksXHJcbiAgICAgICAgICAkbGluayA9ICRlbGVtLmZpbmQoJ2EnKSxcclxuICAgICAgICAgIGlzQWN0aXZlID0gJGVsZW0uaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpLFxyXG4gICAgICAgICAgaGFzaCA9ICRsaW5rWzBdLmhhc2guc2xpY2UoMSksXHJcbiAgICAgICAgICBsaW5rSWQgPSAkbGlua1swXS5pZCA/ICRsaW5rWzBdLmlkIDogaGFzaCArICctbGFiZWwnLFxyXG4gICAgICAgICAgJHRhYkNvbnRlbnQgPSAkKCcjJyArIGhhc2gpO1xyXG5cclxuICAgICAgJGVsZW0uYXR0cih7J3JvbGUnOiAncHJlc2VudGF0aW9uJ30pO1xyXG5cclxuICAgICAgJGxpbmsuYXR0cih7XHJcbiAgICAgICAgJ3JvbGUnOiAndGFiJyxcclxuICAgICAgICAnYXJpYS1jb250cm9scyc6IGhhc2gsXHJcbiAgICAgICAgJ2FyaWEtc2VsZWN0ZWQnOiBpc0FjdGl2ZSxcclxuICAgICAgICAnaWQnOiBsaW5rSWRcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAkdGFiQ29udGVudC5hdHRyKHtcclxuICAgICAgICAncm9sZSc6ICd0YWJwYW5lbCcsXHJcbiAgICAgICAgJ2FyaWEtaGlkZGVuJzogIWlzQWN0aXZlLFxyXG4gICAgICAgICdhcmlhLWxhYmVsbGVkYnknOiBsaW5rSWRcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZihpc0FjdGl2ZSAmJiBfdGhpcy5vcHRpb25zLmF1dG9Gb2N1cyl7XHJcbiAgICAgICAgJGxpbmsuZm9jdXMoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBpZih0aGlzLm9wdGlvbnMubWF0Y2hIZWlnaHQpe1xyXG4gICAgICB2YXIgJGltYWdlcyA9IHRoaXMuJHRhYkNvbnRlbnQuZmluZCgnaW1nJyk7XHJcbiAgICAgIGlmKCRpbWFnZXMubGVuZ3RoKXtcclxuICAgICAgICBGb3VuZGF0aW9uLm9uSW1hZ2VzTG9hZGVkKCRpbWFnZXMsIHRoaXMuX3NldEhlaWdodC5iaW5kKHRoaXMpKTtcclxuICAgICAgfWVsc2V7XHJcbiAgICAgICAgdGhpcy5fc2V0SGVpZ2h0KCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuX2V2ZW50cygpO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogQWRkcyBldmVudCBoYW5kbGVycyBmb3IgaXRlbXMgd2l0aGluIHRoZSB0YWJzLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgIFRhYnMucHJvdG90eXBlLl9ldmVudHMgPSBmdW5jdGlvbigpe1xyXG4gICAgdGhpcy5fYWRkS2V5SGFuZGxlcigpO1xyXG4gICAgdGhpcy5fYWRkQ2xpY2tIYW5kbGVyKCk7XHJcbiAgICBpZih0aGlzLm9wdGlvbnMubWF0Y2hIZWlnaHQpe1xyXG4gICAgICAkKHdpbmRvdykub24oJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIHRoaXMuX3NldEhlaWdodC5iaW5kKHRoaXMpKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGNsaWNrIGhhbmRsZXJzIGZvciBpdGVtcyB3aXRoaW4gdGhlIHRhYnMuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBUYWJzLnByb3RvdHlwZS5fYWRkQ2xpY2tIYW5kbGVyID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICB0aGlzLiRlbGVtZW50Lm9mZignY2xpY2suemYudGFicycpXHJcbiAgICAgICAgICAgICAgICAgICAub24oJ2NsaWNrLnpmLnRhYnMnLCAnLicgKyB0aGlzLm9wdGlvbnMubGlua0NsYXNzLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgICBpZigkKHRoaXMpLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgIF90aGlzLl9oYW5kbGVUYWJDaGFuZ2UoJCh0aGlzKSk7XHJcbiAgICAgICAgICAgICAgICAgICB9KTtcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGtleWJvYXJkIGV2ZW50IGhhbmRsZXJzIGZvciBpdGVtcyB3aXRoaW4gdGhlIHRhYnMuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBUYWJzLnByb3RvdHlwZS5fYWRkS2V5SGFuZGxlciA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgdmFyICRmaXJzdFRhYiA9IF90aGlzLiRlbGVtZW50LmZpbmQoJ2xpOmZpcnN0LW9mLXR5cGUnKTtcclxuICAgIHZhciAkbGFzdFRhYiA9IF90aGlzLiRlbGVtZW50LmZpbmQoJ2xpOmxhc3Qtb2YtdHlwZScpO1xyXG5cclxuICAgIHRoaXMuJHRhYlRpdGxlcy5vZmYoJ2tleWRvd24uemYudGFicycpLm9uKCdrZXlkb3duLnpmLnRhYnMnLCBmdW5jdGlvbihlKXtcclxuICAgICAgaWYoZS53aGljaCA9PT0gOSkgcmV0dXJuO1xyXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICB2YXIgJGVsZW1lbnQgPSAkKHRoaXMpLFxyXG4gICAgICAgICRlbGVtZW50cyA9ICRlbGVtZW50LnBhcmVudCgndWwnKS5jaGlsZHJlbignbGknKSxcclxuICAgICAgICAkcHJldkVsZW1lbnQsXHJcbiAgICAgICAgJG5leHRFbGVtZW50O1xyXG5cclxuICAgICAgJGVsZW1lbnRzLmVhY2goZnVuY3Rpb24oaSkge1xyXG4gICAgICAgIGlmICgkKHRoaXMpLmlzKCRlbGVtZW50KSkge1xyXG4gICAgICAgICAgaWYgKF90aGlzLm9wdGlvbnMud3JhcE9uS2V5cykge1xyXG4gICAgICAgICAgICAkcHJldkVsZW1lbnQgPSBpID09PSAwID8gJGVsZW1lbnRzLmxhc3QoKSA6ICRlbGVtZW50cy5lcShpLTEpO1xyXG4gICAgICAgICAgICAkbmV4dEVsZW1lbnQgPSBpID09PSAkZWxlbWVudHMubGVuZ3RoIC0xID8gJGVsZW1lbnRzLmZpcnN0KCkgOiAkZWxlbWVudHMuZXEoaSsxKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICRwcmV2RWxlbWVudCA9ICRlbGVtZW50cy5lcShNYXRoLm1heCgwLCBpLTEpKTtcclxuICAgICAgICAgICAgJG5leHRFbGVtZW50ID0gJGVsZW1lbnRzLmVxKE1hdGgubWluKGkrMSwgJGVsZW1lbnRzLmxlbmd0aC0xKSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIGhhbmRsZSBrZXlib2FyZCBldmVudCB3aXRoIGtleWJvYXJkIHV0aWxcclxuICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ1RhYnMnLCB7XHJcbiAgICAgICAgb3BlbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAkZWxlbWVudC5maW5kKCdbcm9sZT1cInRhYlwiXScpLmZvY3VzKCk7XHJcbiAgICAgICAgICBfdGhpcy5faGFuZGxlVGFiQ2hhbmdlKCRlbGVtZW50KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHByZXZpb3VzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICRwcmV2RWxlbWVudC5maW5kKCdbcm9sZT1cInRhYlwiXScpLmZvY3VzKCk7XHJcbiAgICAgICAgICBfdGhpcy5faGFuZGxlVGFiQ2hhbmdlKCRwcmV2RWxlbWVudCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBuZXh0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICRuZXh0RWxlbWVudC5maW5kKCdbcm9sZT1cInRhYlwiXScpLmZvY3VzKCk7XHJcbiAgICAgICAgICBfdGhpcy5faGFuZGxlVGFiQ2hhbmdlKCRuZXh0RWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG5cclxuICAvKipcclxuICAgKiBPcGVucyB0aGUgdGFiIGAkdGFyZ2V0Q29udGVudGAgZGVmaW5lZCBieSBgJHRhcmdldGAuXHJcbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBUYWIgdG8gb3Blbi5cclxuICAgKiBAZmlyZXMgVGFicyNjaGFuZ2VcclxuICAgKiBAZnVuY3Rpb25cclxuICAgKi9cclxuICBUYWJzLnByb3RvdHlwZS5faGFuZGxlVGFiQ2hhbmdlID0gZnVuY3Rpb24oJHRhcmdldCl7XHJcbiAgICB2YXIgJHRhYkxpbmsgPSAkdGFyZ2V0LmZpbmQoJ1tyb2xlPVwidGFiXCJdJyksXHJcbiAgICAgICAgaGFzaCA9ICR0YWJMaW5rWzBdLmhhc2gsXHJcbiAgICAgICAgJHRhcmdldENvbnRlbnQgPSAkKGhhc2gpLFxyXG4gICAgICAgICRvbGRUYWIgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy4nICsgdGhpcy5vcHRpb25zLmxpbmtDbGFzcyArICcuaXMtYWN0aXZlJylcclxuICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUnKS5maW5kKCdbcm9sZT1cInRhYlwiXScpXHJcbiAgICAgICAgICAgICAgICAgIC5hdHRyKHsnYXJpYS1zZWxlY3RlZCc6ICdmYWxzZSd9KS5hdHRyKCdhcmlhLWNvbnRyb2xzJyk7XHJcblxyXG4gICAgJCgnIycrJG9sZFRhYikucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpLmF0dHIoeydhcmlhLWhpZGRlbic6ICd0cnVlJ30pO1xyXG5cclxuICAgICR0YXJnZXQuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xyXG5cclxuICAgICR0YWJMaW5rLmF0dHIoeydhcmlhLXNlbGVjdGVkJzogJ3RydWUnfSk7XHJcblxyXG4gICAgJHRhcmdldENvbnRlbnRcclxuICAgICAgLmFkZENsYXNzKCdpcy1hY3RpdmUnKVxyXG4gICAgICAuYXR0cih7J2FyaWEtaGlkZGVuJzogJ2ZhbHNlJ30pO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmlyZXMgd2hlbiB0aGUgcGx1Z2luIGhhcyBzdWNjZXNzZnVsbHkgY2hhbmdlZCB0YWJzLlxyXG4gICAgICogQGV2ZW50IFRhYnMjY2hhbmdlXHJcbiAgICAgKi9cclxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignY2hhbmdlLnpmLnRhYnMnLCBbJHRhcmdldF0pO1xyXG4gICAgLy8gRm91bmRhdGlvbi5yZWZsb3codGhpcy4kZWxlbWVudCwgJ3RhYnMnKTtcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBQdWJsaWMgbWV0aG9kIGZvciBzZWxlY3RpbmcgYSBjb250ZW50IHBhbmUgdG8gZGlzcGxheS5cclxuICAgKiBAcGFyYW0ge2pRdWVyeSB8IFN0cmluZ30gZWxlbSAtIGpRdWVyeSBvYmplY3Qgb3Igc3RyaW5nIG9mIHRoZSBpZCBvZiB0aGUgcGFuZSB0byBkaXNwbGF5LlxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqL1xyXG4gIFRhYnMucHJvdG90eXBlLnNlbGVjdFRhYiA9IGZ1bmN0aW9uKGVsZW0pe1xyXG4gICAgdmFyIGlkU3RyO1xyXG4gICAgaWYodHlwZW9mIGVsZW0gPT09ICdvYmplY3QnKXtcclxuICAgICAgaWRTdHIgPSBlbGVtWzBdLmlkO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIGlkU3RyID0gZWxlbTtcclxuICAgIH1cclxuXHJcbiAgICBpZihpZFN0ci5pbmRleE9mKCcjJykgPCAwKXtcclxuICAgICAgaWRTdHIgPSAnIycgKyBpZFN0cjtcclxuICAgIH1cclxuICAgIHZhciAkdGFyZ2V0ID0gdGhpcy4kdGFiVGl0bGVzLmZpbmQoJ1tocmVmPVwiJyArIGlkU3RyICsgJ1wiXScpLnBhcmVudCgnLicgKyB0aGlzLm9wdGlvbnMubGlua0NsYXNzKTtcclxuXHJcbiAgICB0aGlzLl9oYW5kbGVUYWJDaGFuZ2UoJHRhcmdldCk7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBoZWlnaHQgb2YgZWFjaCBwYW5lbCB0byB0aGUgaGVpZ2h0IG9mIHRoZSB0YWxsZXN0IHBhbmVsLlxyXG4gICAqIElmIGVuYWJsZWQgaW4gb3B0aW9ucywgZ2V0cyBjYWxsZWQgb24gbWVkaWEgcXVlcnkgY2hhbmdlLlxyXG4gICAqIElmIGxvYWRpbmcgY29udGVudCB2aWEgZXh0ZXJuYWwgc291cmNlLCBjYW4gYmUgY2FsbGVkIGRpcmVjdGx5IG9yIHdpdGggX3JlZmxvdy5cclxuICAgKiBAZnVuY3Rpb25cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIFRhYnMucHJvdG90eXBlLl9zZXRIZWlnaHQgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIG1heCA9IDA7XHJcbiAgICB0aGlzLiR0YWJDb250ZW50LmZpbmQoJy4nICsgdGhpcy5vcHRpb25zLnBhbmVsQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICAgICAgLmNzcygnaGVpZ2h0JywgJycpXHJcbiAgICAgICAgICAgICAgICAgICAgLmVhY2goZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgIHZhciBwYW5lbCA9ICQodGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaXNBY3RpdmUgPSBwYW5lbC5oYXNDbGFzcygnaXMtYWN0aXZlJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgaWYoIWlzQWN0aXZlKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFuZWwuY3NzKHsndmlzaWJpbGl0eSc6ICdoaWRkZW4nLCAnZGlzcGxheSc6ICdibG9jayd9KTtcclxuICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgIHZhciB0ZW1wID0gdGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgaWYoIWlzQWN0aXZlKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFuZWwuY3NzKHsndmlzaWJpbGl0eSc6ICcnLCAnZGlzcGxheSc6ICcnfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgbWF4ID0gdGVtcCA+IG1heCA/IHRlbXAgOiBtYXg7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAuY3NzKCdoZWlnaHQnLCBtYXggKyAncHgnKTtcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBEZXN0cm95cyBhbiBpbnN0YW5jZSBvZiBhbiB0YWJzLlxyXG4gICAqIEBmaXJlcyBUYWJzI2Rlc3Ryb3llZFxyXG4gICAqL1xyXG4gIFRhYnMucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnLicgKyB0aGlzLm9wdGlvbnMubGlua0NsYXNzKVxyXG4gICAgICAgICAgICAgICAgIC5vZmYoJy56Zi50YWJzJykuaGlkZSgpLmVuZCgpXHJcbiAgICAgICAgICAgICAgICAgLmZpbmQoJy4nICsgdGhpcy5vcHRpb25zLnBhbmVsQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICAgLmhpZGUoKTtcclxuICAgIGlmKHRoaXMub3B0aW9ucy5tYXRjaEhlaWdodCl7XHJcbiAgICAgICQod2luZG93KS5vZmYoJ2NoYW5nZWQuemYubWVkaWFxdWVyeScpO1xyXG4gICAgfVxyXG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xyXG4gIH07XHJcblxyXG4gIEZvdW5kYXRpb24ucGx1Z2luKFRhYnMsICdUYWJzJyk7XHJcblxyXG4gIGZ1bmN0aW9uIGNoZWNrQ2xhc3MoJGVsZW0pe1xyXG4gICAgcmV0dXJuICRlbGVtLmhhc0NsYXNzKCdpcy1hY3RpdmUnKTtcclxuICB9XHJcbn0oalF1ZXJ5LCB3aW5kb3cuRm91bmRhdGlvbik7XHJcbiIsIi8qKlxyXG4gKiBUb2dnbGVyIG1vZHVsZS5cclxuICogQG1vZHVsZSBmb3VuZGF0aW9uLnRvZ2dsZXJcclxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tb3Rpb25cclxuICovXHJcblxyXG4hZnVuY3Rpb24oRm91bmRhdGlvbiwgJCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBUb2dnbGVyLlxyXG4gICAqIEBjbGFzc1xyXG4gICAqIEBmaXJlcyBUb2dnbGVyI2luaXRcclxuICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gYWRkIHRoZSB0cmlnZ2VyIHRvLlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cclxuICAgKi9cclxuICBmdW5jdGlvbiBUb2dnbGVyKGVsZW1lbnQsIG9wdGlvbnMpIHtcclxuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIFRvZ2dsZXIuZGVmYXVsdHMsIGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcclxuICAgIHRoaXMuY2xhc3NOYW1lID0gJyc7XHJcblxyXG4gICAgdGhpcy5faW5pdCgpO1xyXG4gICAgdGhpcy5fZXZlbnRzKCk7XHJcblxyXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnVG9nZ2xlcicpO1xyXG4gIH1cclxuXHJcbiAgVG9nZ2xlci5kZWZhdWx0cyA9IHtcclxuICAgIC8qKlxyXG4gICAgICogVGVsbHMgdGhlIHBsdWdpbiBpZiB0aGUgZWxlbWVudCBzaG91bGQgYW5pbWF0ZWQgd2hlbiB0b2dnbGVkLlxyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgZmFsc2VcclxuICAgICAqL1xyXG4gICAgYW5pbWF0ZTogZmFsc2VcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBJbml0aWFsaXplcyB0aGUgVG9nZ2xlciBwbHVnaW4gYnkgcGFyc2luZyB0aGUgdG9nZ2xlIGNsYXNzIGZyb20gZGF0YS10b2dnbGVyLCBvciBhbmltYXRpb24gY2xhc3NlcyBmcm9tIGRhdGEtYW5pbWF0ZS5cclxuICAgKiBAZnVuY3Rpb25cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIFRvZ2dsZXIucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgaW5wdXQ7XHJcbiAgICAvLyBQYXJzZSBhbmltYXRpb24gY2xhc3NlcyBpZiB0aGV5IHdlcmUgc2V0XHJcbiAgICBpZiAodGhpcy5vcHRpb25zLmFuaW1hdGUpIHtcclxuICAgICAgaW5wdXQgPSB0aGlzLm9wdGlvbnMuYW5pbWF0ZS5zcGxpdCgnICcpO1xyXG5cclxuICAgICAgdGhpcy5hbmltYXRpb25JbiA9IGlucHV0WzBdO1xyXG4gICAgICB0aGlzLmFuaW1hdGlvbk91dCA9IGlucHV0WzFdIHx8IG51bGw7XHJcbiAgICB9XHJcbiAgICAvLyBPdGhlcndpc2UsIHBhcnNlIHRvZ2dsZSBjbGFzc1xyXG4gICAgZWxzZSB7XHJcbiAgICAgIGlucHV0ID0gdGhpcy4kZWxlbWVudC5kYXRhKCd0b2dnbGVyJyk7XHJcbiAgICAgIC8vIEFsbG93IGZvciBhIC4gYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgc3RyaW5nXHJcbiAgICAgIHRoaXMuY2xhc3NOYW1lID0gaW5wdXRbMF0gPT09ICcuJyA/IGlucHV0LnNsaWNlKDEpIDogaW5wdXQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWRkIEFSSUEgYXR0cmlidXRlcyB0byB0cmlnZ2Vyc1xyXG4gICAgdmFyIGlkID0gdGhpcy4kZWxlbWVudFswXS5pZDtcclxuICAgICQoJ1tkYXRhLW9wZW49XCInK2lkKydcIl0sIFtkYXRhLWNsb3NlPVwiJytpZCsnXCJdLCBbZGF0YS10b2dnbGU9XCInK2lkKydcIl0nKVxyXG4gICAgICAuYXR0cignYXJpYS1jb250cm9scycsIGlkKTtcclxuICAgIC8vIElmIHRoZSB0YXJnZXQgaXMgaGlkZGVuLCBhZGQgYXJpYS1oaWRkZW5cclxuICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1leHBhbmRlZCcsIHRoaXMuJGVsZW1lbnQuaXMoJzpoaWRkZW4nKSA/IGZhbHNlIDogdHJ1ZSk7XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogSW5pdGlhbGl6ZXMgZXZlbnRzIGZvciB0aGUgdG9nZ2xlIHRyaWdnZXIuXHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBUb2dnbGVyLnByb3RvdHlwZS5fZXZlbnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLiRlbGVtZW50Lm9mZigndG9nZ2xlLnpmLnRyaWdnZXInKS5vbigndG9nZ2xlLnpmLnRyaWdnZXInLCB0aGlzLnRvZ2dsZS5iaW5kKHRoaXMpKTtcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBUb2dnbGVzIHRoZSB0YXJnZXQgY2xhc3Mgb24gdGhlIHRhcmdldCBlbGVtZW50LiBBbiBldmVudCBpcyBmaXJlZCBmcm9tIHRoZSBvcmlnaW5hbCB0cmlnZ2VyIGRlcGVuZGluZyBvbiBpZiB0aGUgcmVzdWx0YW50IHN0YXRlIHdhcyBcIm9uXCIgb3IgXCJvZmZcIi5cclxuICAgKiBAZnVuY3Rpb25cclxuICAgKiBAZmlyZXMgVG9nZ2xlciNvblxyXG4gICAqIEBmaXJlcyBUb2dnbGVyI29mZlxyXG4gICAqL1xyXG4gIFRvZ2dsZXIucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpc1sgdGhpcy5vcHRpb25zLmFuaW1hdGUgPyAnX3RvZ2dsZUFuaW1hdGUnIDogJ190b2dnbGVDbGFzcyddKCk7XHJcbiAgfTtcclxuXHJcbiAgVG9nZ2xlci5wcm90b3R5cGUuX3RvZ2dsZUNsYXNzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLiRlbGVtZW50LnRvZ2dsZUNsYXNzKHRoaXMuY2xhc3NOYW1lKTtcclxuXHJcbiAgICB2YXIgaXNPbiA9IHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3ModGhpcy5jbGFzc05hbWUpO1xyXG4gICAgaWYgKGlzT24pIHtcclxuICAgICAgLyoqXHJcbiAgICAgICAqIEZpcmVzIGlmIHRoZSB0YXJnZXQgZWxlbWVudCBoYXMgdGhlIGNsYXNzIGFmdGVyIGEgdG9nZ2xlLlxyXG4gICAgICAgKiBAZXZlbnQgVG9nZ2xlciNvblxyXG4gICAgICAgKi9cclxuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdvbi56Zi50b2dnbGVyJyk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgLyoqXHJcbiAgICAgICAqIEZpcmVzIGlmIHRoZSB0YXJnZXQgZWxlbWVudCBkb2VzIG5vdCBoYXZlIHRoZSBjbGFzcyBhZnRlciBhIHRvZ2dsZS5cclxuICAgICAgICogQGV2ZW50IFRvZ2dsZXIjb2ZmXHJcbiAgICAgICAqL1xyXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ29mZi56Zi50b2dnbGVyJyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fdXBkYXRlQVJJQShpc09uKTtcclxuICB9O1xyXG5cclxuICBUb2dnbGVyLnByb3RvdHlwZS5fdG9nZ2xlQW5pbWF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuXHJcbiAgICBpZiAodGhpcy4kZWxlbWVudC5pcygnOmhpZGRlbicpKSB7XHJcbiAgICAgIEZvdW5kYXRpb24uTW90aW9uLmFuaW1hdGVJbih0aGlzLiRlbGVtZW50LCB0aGlzLmFuaW1hdGlvbkluLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnRyaWdnZXIoJ29uLnpmLnRvZ2dsZXInKTtcclxuICAgICAgICBfdGhpcy5fdXBkYXRlQVJJQSh0cnVlKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgRm91bmRhdGlvbi5Nb3Rpb24uYW5pbWF0ZU91dCh0aGlzLiRlbGVtZW50LCB0aGlzLmFuaW1hdGlvbk91dCwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy50cmlnZ2VyKCdvZmYuemYudG9nZ2xlcicpO1xyXG4gICAgICAgIF90aGlzLl91cGRhdGVBUklBKGZhbHNlKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgVG9nZ2xlci5wcm90b3R5cGUuX3VwZGF0ZUFSSUEgPSBmdW5jdGlvbihpc09uKSB7XHJcbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBpc09uID8gdHJ1ZSA6IGZhbHNlKTtcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBEZXN0cm95cyB0aGUgaW5zdGFuY2Ugb2YgVG9nZ2xlciBvbiB0aGUgZWxlbWVudC5cclxuICAgKiBAZnVuY3Rpb25cclxuICAgKi9cclxuICBUb2dnbGVyLnByb3RvdHlwZS5kZXN0cm95PSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuJGVsZW1lbnQub2ZmKCcuemYudG9nZ2xlcicpO1xyXG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xyXG4gIH07XHJcblxyXG4gIEZvdW5kYXRpb24ucGx1Z2luKFRvZ2dsZXIsICdUb2dnbGVyJyk7XHJcblxyXG4gIC8vIEV4cG9ydHMgZm9yIEFNRC9Ccm93c2VyaWZ5XHJcbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFRvZ2dsZXI7XHJcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicpXHJcbiAgICBkZWZpbmUoWydmb3VuZGF0aW9uJ10sIGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gVG9nZ2xlcjtcclxuICAgIH0pO1xyXG5cclxufShGb3VuZGF0aW9uLCBqUXVlcnkpO1xyXG4iLCIvKipcclxuICogVG9vbHRpcCBtb2R1bGUuXHJcbiAqIEBtb2R1bGUgZm91bmRhdGlvbi50b29sdGlwXHJcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwuYm94XHJcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudHJpZ2dlcnNcclxuICovXHJcbiFmdW5jdGlvbigkLCBkb2N1bWVudCwgRm91bmRhdGlvbil7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIGEgVG9vbHRpcC5cclxuICAgKiBAY2xhc3NcclxuICAgKiBAZmlyZXMgVG9vbHRpcCNpbml0XHJcbiAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIGF0dGFjaCBhIHRvb2x0aXAgdG8uXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBvYmplY3QgdG8gZXh0ZW5kIHRoZSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24uXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gVG9vbHRpcChlbGVtZW50LCBvcHRpb25zKXtcclxuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIFRvb2x0aXAuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcclxuXHJcbiAgICB0aGlzLmlzQWN0aXZlID0gZmFsc2U7XHJcbiAgICB0aGlzLmlzQ2xpY2sgPSBmYWxzZTtcclxuICAgIHRoaXMuX2luaXQoKTtcclxuXHJcbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdUb29sdGlwJyk7XHJcbiAgfVxyXG5cclxuICBUb29sdGlwLmRlZmF1bHRzID0ge1xyXG4gICAgZGlzYWJsZUZvclRvdWNoOiBmYWxzZSxcclxuICAgIC8qKlxyXG4gICAgICogVGltZSwgaW4gbXMsIGJlZm9yZSBhIHRvb2x0aXAgc2hvdWxkIG9wZW4gb24gaG92ZXIuXHJcbiAgICAgKiBAb3B0aW9uXHJcbiAgICAgKiBAZXhhbXBsZSAyMDBcclxuICAgICAqL1xyXG4gICAgaG92ZXJEZWxheTogMjAwLFxyXG4gICAgLyoqXHJcbiAgICAgKiBUaW1lLCBpbiBtcywgYSB0b29sdGlwIHNob3VsZCB0YWtlIHRvIGZhZGUgaW50byB2aWV3LlxyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgMTUwXHJcbiAgICAgKi9cclxuICAgIGZhZGVJbkR1cmF0aW9uOiAxNTAsXHJcbiAgICAvKipcclxuICAgICAqIFRpbWUsIGluIG1zLCBhIHRvb2x0aXAgc2hvdWxkIHRha2UgdG8gZmFkZSBvdXQgb2Ygdmlldy5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlIDE1MFxyXG4gICAgICovXHJcbiAgICBmYWRlT3V0RHVyYXRpb246IDE1MCxcclxuICAgIC8qKlxyXG4gICAgICogRGlzYWJsZXMgaG92ZXIgZXZlbnRzIGZyb20gb3BlbmluZyB0aGUgdG9vbHRpcCBpZiBzZXQgdG8gdHJ1ZVxyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgZmFsc2VcclxuICAgICAqL1xyXG4gICAgZGlzYWJsZUhvdmVyOiBmYWxzZSxcclxuICAgIC8qKlxyXG4gICAgICogT3B0aW9uYWwgYWRkdGlvbmFsIGNsYXNzZXMgdG8gYXBwbHkgdG8gdGhlIHRvb2x0aXAgdGVtcGxhdGUgb24gaW5pdC5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlICdteS1jb29sLXRpcC1jbGFzcydcclxuICAgICAqL1xyXG4gICAgdGVtcGxhdGVDbGFzc2VzOiAnJyxcclxuICAgIC8qKlxyXG4gICAgICogTm9uLW9wdGlvbmFsIGNsYXNzIGFkZGVkIHRvIHRvb2x0aXAgdGVtcGxhdGVzLiBGb3VuZGF0aW9uIGRlZmF1bHQgaXMgJ3Rvb2x0aXAnLlxyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgJ3Rvb2x0aXAnXHJcbiAgICAgKi9cclxuICAgIHRvb2x0aXBDbGFzczogJ3Rvb2x0aXAnLFxyXG4gICAgLyoqXHJcbiAgICAgKiBDbGFzcyBhcHBsaWVkIHRvIHRoZSB0b29sdGlwIGFuY2hvciBlbGVtZW50LlxyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgJ2hhcy10aXAnXHJcbiAgICAgKi9cclxuICAgIHRyaWdnZXJDbGFzczogJ2hhcy10aXAnLFxyXG4gICAgLyoqXHJcbiAgICAgKiBNaW5pbXVtIGJyZWFrcG9pbnQgc2l6ZSBhdCB3aGljaCB0byBvcGVuIHRoZSB0b29sdGlwLlxyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgJ3NtYWxsJ1xyXG4gICAgICovXHJcbiAgICBzaG93T246ICdzbWFsbCcsXHJcbiAgICAvKipcclxuICAgICAqIEN1c3RvbSB0ZW1wbGF0ZSB0byBiZSB1c2VkIHRvIGdlbmVyYXRlIG1hcmt1cCBmb3IgdG9vbHRpcC5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlICcmbHQ7ZGl2IGNsYXNzPVwidG9vbHRpcFwiJmd0OyZsdDsvZGl2Jmd0OydcclxuICAgICAqL1xyXG4gICAgdGVtcGxhdGU6ICcnLFxyXG4gICAgLyoqXHJcbiAgICAgKiBUZXh0IGRpc3BsYXllZCBpbiB0aGUgdG9vbHRpcCB0ZW1wbGF0ZSBvbiBvcGVuLlxyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgJ1NvbWUgY29vbCBzcGFjZSBmYWN0IGhlcmUuJ1xyXG4gICAgICovXHJcbiAgICB0aXBUZXh0OiAnJyxcclxuICAgIHRvdWNoQ2xvc2VUZXh0OiAnVGFwIHRvIGNsb3NlLicsXHJcbiAgICAvKipcclxuICAgICAqIEFsbG93cyB0aGUgdG9vbHRpcCB0byByZW1haW4gb3BlbiBpZiB0cmlnZ2VyZWQgd2l0aCBhIGNsaWNrIG9yIHRvdWNoIGV2ZW50LlxyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgdHJ1ZVxyXG4gICAgICovXHJcbiAgICBjbGlja09wZW46IHRydWUsXHJcbiAgICAvKipcclxuICAgICAqIEFkZGl0aW9uYWwgcG9zaXRpb25pbmcgY2xhc3Nlcywgc2V0IGJ5IHRoZSBKU1xyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgJ3RvcCdcclxuICAgICAqL1xyXG4gICAgcG9zaXRpb25DbGFzczogJycsXHJcbiAgICAvKipcclxuICAgICAqIERpc3RhbmNlLCBpbiBwaXhlbHMsIHRoZSB0ZW1wbGF0ZSBzaG91bGQgcHVzaCBhd2F5IGZyb20gdGhlIGFuY2hvciBvbiB0aGUgWSBheGlzLlxyXG4gICAgICogQG9wdGlvblxyXG4gICAgICogQGV4YW1wbGUgMTBcclxuICAgICAqL1xyXG4gICAgdk9mZnNldDogMTAsXHJcbiAgICAvKipcclxuICAgICAqIERpc3RhbmNlLCBpbiBwaXhlbHMsIHRoZSB0ZW1wbGF0ZSBzaG91bGQgcHVzaCBhd2F5IGZyb20gdGhlIGFuY2hvciBvbiB0aGUgWCBheGlzLCBpZiBhbGlnbmVkIHRvIGEgc2lkZS5cclxuICAgICAqIEBvcHRpb25cclxuICAgICAqIEBleGFtcGxlIDEyXHJcbiAgICAgKi9cclxuICAgIGhPZmZzZXQ6IDEyXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogSW5pdGlhbGl6ZXMgdGhlIHRvb2x0aXAgYnkgc2V0dGluZyB0aGUgY3JlYXRpbmcgdGhlIHRpcCBlbGVtZW50LCBhZGRpbmcgaXQncyB0ZXh0LCBzZXR0aW5nIHByaXZhdGUgdmFyaWFibGVzIGFuZCBzZXR0aW5nIGF0dHJpYnV0ZXMgb24gdGhlIGFuY2hvci5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIFRvb2x0aXAucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBlbGVtSWQgPSB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtZGVzY3JpYmVkYnknKSB8fCBGb3VuZGF0aW9uLkdldFlvRGlnaXRzKDYsICd0b29sdGlwJyk7XHJcblxyXG4gICAgdGhpcy5vcHRpb25zLnBvc2l0aW9uQ2xhc3MgPSB0aGlzLl9nZXRQb3NpdGlvbkNsYXNzKHRoaXMuJGVsZW1lbnQpO1xyXG4gICAgdGhpcy5vcHRpb25zLnRpcFRleHQgPSB0aGlzLm9wdGlvbnMudGlwVGV4dCB8fCB0aGlzLiRlbGVtZW50LmF0dHIoJ3RpdGxlJyk7XHJcbiAgICB0aGlzLnRlbXBsYXRlID0gdGhpcy5vcHRpb25zLnRlbXBsYXRlID8gJCh0aGlzLm9wdGlvbnMudGVtcGxhdGUpIDogdGhpcy5fYnVpbGRUZW1wbGF0ZShlbGVtSWQpO1xyXG5cclxuICAgIHRoaXMudGVtcGxhdGUuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSlcclxuICAgICAgICAudGV4dCh0aGlzLm9wdGlvbnMudGlwVGV4dClcclxuICAgICAgICAuaGlkZSgpO1xyXG5cclxuICAgIHRoaXMuJGVsZW1lbnQuYXR0cih7XHJcbiAgICAgICd0aXRsZSc6ICcnLFxyXG4gICAgICAnYXJpYS1kZXNjcmliZWRieSc6IGVsZW1JZCxcclxuICAgICAgJ2RhdGEteWV0aS1ib3gnOiBlbGVtSWQsXHJcbiAgICAgICdkYXRhLXRvZ2dsZSc6IGVsZW1JZCxcclxuICAgICAgJ2RhdGEtcmVzaXplJzogZWxlbUlkXHJcbiAgICB9KS5hZGRDbGFzcyh0aGlzLnRyaWdnZXJDbGFzcyk7XHJcblxyXG4gICAgLy9oZWxwZXIgdmFyaWFibGVzIHRvIHRyYWNrIG1vdmVtZW50IG9uIGNvbGxpc2lvbnNcclxuICAgIHRoaXMudXNlZFBvc2l0aW9ucyA9IFtdO1xyXG4gICAgdGhpcy5jb3VudGVyID0gNDtcclxuICAgIHRoaXMuY2xhc3NDaGFuZ2VkID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5fZXZlbnRzKCk7XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogR3JhYnMgdGhlIGN1cnJlbnQgcG9zaXRpb25pbmcgY2xhc3MsIGlmIHByZXNlbnQsIGFuZCByZXR1cm5zIHRoZSB2YWx1ZSBvciBhbiBlbXB0eSBzdHJpbmcuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBUb29sdGlwLnByb3RvdHlwZS5fZ2V0UG9zaXRpb25DbGFzcyA9IGZ1bmN0aW9uKGVsZW1lbnQpe1xyXG4gICAgaWYoIWVsZW1lbnQpeyByZXR1cm4gJyc7IH1cclxuICAgIC8vIHZhciBwb3NpdGlvbiA9IGVsZW1lbnQuYXR0cignY2xhc3MnKS5tYXRjaCgvdG9wfGxlZnR8cmlnaHQvZyk7XHJcbiAgICB2YXIgcG9zaXRpb24gPSBlbGVtZW50WzBdLmNsYXNzTmFtZS5tYXRjaCgvXFxiKHRvcHxsZWZ0fHJpZ2h0KVxcYi9nKTtcclxuICAgICAgICBwb3NpdGlvbiA9IHBvc2l0aW9uID8gcG9zaXRpb25bMF0gOiAnJztcclxuICAgIHJldHVybiBwb3NpdGlvbjtcclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIGJ1aWxkcyB0aGUgdG9vbHRpcCBlbGVtZW50LCBhZGRzIGF0dHJpYnV0ZXMsIGFuZCByZXR1cm5zIHRoZSB0ZW1wbGF0ZS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIFRvb2x0aXAucHJvdG90eXBlLl9idWlsZFRlbXBsYXRlID0gZnVuY3Rpb24oaWQpe1xyXG4gICAgdmFyIHRlbXBsYXRlQ2xhc3NlcyA9ICh0aGlzLm9wdGlvbnMudG9vbHRpcENsYXNzICsgJyAnICsgdGhpcy5vcHRpb25zLnBvc2l0aW9uQ2xhc3MgKyAnICcgKyB0aGlzLm9wdGlvbnMudGVtcGxhdGVDbGFzc2VzKS50cmltKCk7XHJcbiAgICB2YXIgJHRlbXBsYXRlID0gICQoJzxkaXY+PC9kaXY+JykuYWRkQ2xhc3ModGVtcGxhdGVDbGFzc2VzKS5hdHRyKHtcclxuICAgICAgJ3JvbGUnOiAndG9vbHRpcCcsXHJcbiAgICAgICdhcmlhLWhpZGRlbic6IHRydWUsXHJcbiAgICAgICdkYXRhLWlzLWFjdGl2ZSc6IGZhbHNlLFxyXG4gICAgICAnZGF0YS1pcy1mb2N1cyc6IGZhbHNlLFxyXG4gICAgICAnaWQnOiBpZFxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gJHRlbXBsYXRlO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgaWYgYSBjb2xsaXNpb24gZXZlbnQgaXMgZGV0ZWN0ZWQuXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBvc2l0aW9uIC0gcG9zaXRpb25pbmcgY2xhc3MgdG8gdHJ5XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBUb29sdGlwLnByb3RvdHlwZS5fcmVwb3NpdGlvbiA9IGZ1bmN0aW9uKHBvc2l0aW9uKXtcclxuICAgIHRoaXMudXNlZFBvc2l0aW9ucy5wdXNoKHBvc2l0aW9uID8gcG9zaXRpb24gOiAnYm90dG9tJyk7XHJcblxyXG4gICAgLy9kZWZhdWx0LCB0cnkgc3dpdGNoaW5nIHRvIG9wcG9zaXRlIHNpZGVcclxuICAgIGlmKCFwb3NpdGlvbiAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ3RvcCcpIDwgMCkpe1xyXG4gICAgICB0aGlzLnRlbXBsYXRlLmFkZENsYXNzKCd0b3AnKTtcclxuICAgIH1lbHNlIGlmKHBvc2l0aW9uID09PSAndG9wJyAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ2JvdHRvbScpIDwgMCkpe1xyXG4gICAgICB0aGlzLnRlbXBsYXRlLnJlbW92ZUNsYXNzKHBvc2l0aW9uKTtcclxuICAgIH1lbHNlIGlmKHBvc2l0aW9uID09PSAnbGVmdCcgJiYgKHRoaXMudXNlZFBvc2l0aW9ucy5pbmRleE9mKCdyaWdodCcpIDwgMCkpe1xyXG4gICAgICB0aGlzLnRlbXBsYXRlLnJlbW92ZUNsYXNzKHBvc2l0aW9uKVxyXG4gICAgICAgICAgLmFkZENsYXNzKCdyaWdodCcpO1xyXG4gICAgfWVsc2UgaWYocG9zaXRpb24gPT09ICdyaWdodCcgJiYgKHRoaXMudXNlZFBvc2l0aW9ucy5pbmRleE9mKCdsZWZ0JykgPCAwKSl7XHJcbiAgICAgIHRoaXMudGVtcGxhdGUucmVtb3ZlQ2xhc3MocG9zaXRpb24pXHJcbiAgICAgICAgICAuYWRkQ2xhc3MoJ2xlZnQnKTtcclxuICAgIH1cclxuXHJcbiAgICAvL2lmIGRlZmF1bHQgY2hhbmdlIGRpZG4ndCB3b3JrLCB0cnkgYm90dG9tIG9yIGxlZnQgZmlyc3RcclxuICAgIGVsc2UgaWYoIXBvc2l0aW9uICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZigndG9wJykgPiAtMSkgJiYgKHRoaXMudXNlZFBvc2l0aW9ucy5pbmRleE9mKCdsZWZ0JykgPCAwKSl7XHJcbiAgICAgIHRoaXMudGVtcGxhdGUuYWRkQ2xhc3MoJ2xlZnQnKTtcclxuICAgIH1lbHNlIGlmKHBvc2l0aW9uID09PSAndG9wJyAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ2JvdHRvbScpID4gLTEpICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZignbGVmdCcpIDwgMCkpe1xyXG4gICAgICB0aGlzLnRlbXBsYXRlLnJlbW92ZUNsYXNzKHBvc2l0aW9uKVxyXG4gICAgICAgICAgLmFkZENsYXNzKCdsZWZ0Jyk7XHJcbiAgICB9ZWxzZSBpZihwb3NpdGlvbiA9PT0gJ2xlZnQnICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZigncmlnaHQnKSA+IC0xKSAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ2JvdHRvbScpIDwgMCkpe1xyXG4gICAgICB0aGlzLnRlbXBsYXRlLnJlbW92ZUNsYXNzKHBvc2l0aW9uKTtcclxuICAgIH1lbHNlIGlmKHBvc2l0aW9uID09PSAncmlnaHQnICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZignbGVmdCcpID4gLTEpICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZignYm90dG9tJykgPCAwKSl7XHJcbiAgICAgIHRoaXMudGVtcGxhdGUucmVtb3ZlQ2xhc3MocG9zaXRpb24pO1xyXG4gICAgfVxyXG4gICAgLy9pZiBub3RoaW5nIGNsZWFyZWQsIHNldCB0byBib3R0b21cclxuICAgIGVsc2V7XHJcbiAgICAgIHRoaXMudGVtcGxhdGUucmVtb3ZlQ2xhc3MocG9zaXRpb24pO1xyXG4gICAgfVxyXG4gICAgdGhpcy5jbGFzc0NoYW5nZWQgPSB0cnVlO1xyXG4gICAgdGhpcy5jb3VudGVyLS07XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIHNldHMgdGhlIHBvc2l0aW9uIGNsYXNzIG9mIGFuIGVsZW1lbnQgYW5kIHJlY3Vyc2l2ZWx5IGNhbGxzIGl0c2VsZiB1bnRpbCB0aGVyZSBhcmUgbm8gbW9yZSBwb3NzaWJsZSBwb3NpdGlvbnMgdG8gYXR0ZW1wdCwgb3IgdGhlIHRvb2x0aXAgZWxlbWVudCBpcyBubyBsb25nZXIgY29sbGlkaW5nLlxyXG4gICAqIGlmIHRoZSB0b29sdGlwIGlzIGxhcmdlciB0aGFuIHRoZSBzY3JlZW4gd2lkdGgsIGRlZmF1bHQgdG8gZnVsbCB3aWR0aCAtIGFueSB1c2VyIHNlbGVjdGVkIG1hcmdpblxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUuX3NldFBvc2l0aW9uID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBwb3NpdGlvbiA9IHRoaXMuX2dldFBvc2l0aW9uQ2xhc3ModGhpcy50ZW1wbGF0ZSksXHJcbiAgICAgICAgJHRpcERpbXMgPSBGb3VuZGF0aW9uLkJveC5HZXREaW1lbnNpb25zKHRoaXMudGVtcGxhdGUpLFxyXG4gICAgICAgICRhbmNob3JEaW1zID0gRm91bmRhdGlvbi5Cb3guR2V0RGltZW5zaW9ucyh0aGlzLiRlbGVtZW50KSxcclxuICAgICAgICBkaXJlY3Rpb24gPSAocG9zaXRpb24gPT09ICdsZWZ0JyA/ICdsZWZ0JyA6ICgocG9zaXRpb24gPT09ICdyaWdodCcpID8gJ2xlZnQnIDogJ3RvcCcpKSxcclxuICAgICAgICBwYXJhbSA9IChkaXJlY3Rpb24gPT09ICd0b3AnKSA/ICdoZWlnaHQnIDogJ3dpZHRoJyxcclxuICAgICAgICBvZmZzZXQgPSAocGFyYW0gPT09ICdoZWlnaHQnKSA/IHRoaXMub3B0aW9ucy52T2Zmc2V0IDogdGhpcy5vcHRpb25zLmhPZmZzZXQsXHJcbiAgICAgICAgX3RoaXMgPSB0aGlzO1xyXG5cclxuICAgIGlmKCgkdGlwRGltcy53aWR0aCA+PSAkdGlwRGltcy53aW5kb3dEaW1zLndpZHRoKSB8fCAoIXRoaXMuY291bnRlciAmJiAhRm91bmRhdGlvbi5Cb3guSW1Ob3RUb3VjaGluZ1lvdSh0aGlzLnRlbXBsYXRlKSkpe1xyXG4gICAgICB0aGlzLnRlbXBsYXRlLm9mZnNldChGb3VuZGF0aW9uLkJveC5HZXRPZmZzZXRzKHRoaXMudGVtcGxhdGUsIHRoaXMuJGVsZW1lbnQsICdjZW50ZXIgYm90dG9tJywgdGhpcy5vcHRpb25zLnZPZmZzZXQsIHRoaXMub3B0aW9ucy5oT2Zmc2V0LCB0cnVlKSkuY3NzKHtcclxuICAgICAgLy8gdGhpcy4kZWxlbWVudC5vZmZzZXQoRm91bmRhdGlvbi5HZXRPZmZzZXRzKHRoaXMudGVtcGxhdGUsIHRoaXMuJGVsZW1lbnQsICdjZW50ZXIgYm90dG9tJywgdGhpcy5vcHRpb25zLnZPZmZzZXQsIHRoaXMub3B0aW9ucy5oT2Zmc2V0LCB0cnVlKSkuY3NzKHtcclxuICAgICAgICAnd2lkdGgnOiAkYW5jaG9yRGltcy53aW5kb3dEaW1zLndpZHRoIC0gKHRoaXMub3B0aW9ucy5oT2Zmc2V0ICogMiksXHJcbiAgICAgICAgJ2hlaWdodCc6ICdhdXRvJ1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudGVtcGxhdGUub2Zmc2V0KEZvdW5kYXRpb24uQm94LkdldE9mZnNldHModGhpcy50ZW1wbGF0ZSwgdGhpcy4kZWxlbWVudCwnY2VudGVyICcgKyAocG9zaXRpb24gfHwgJ2JvdHRvbScpLCB0aGlzLm9wdGlvbnMudk9mZnNldCwgdGhpcy5vcHRpb25zLmhPZmZzZXQpKTtcclxuXHJcbiAgICB3aGlsZSghRm91bmRhdGlvbi5Cb3guSW1Ob3RUb3VjaGluZ1lvdSh0aGlzLnRlbXBsYXRlKSAmJiB0aGlzLmNvdW50ZXIpe1xyXG4gICAgICB0aGlzLl9yZXBvc2l0aW9uKHBvc2l0aW9uKTtcclxuICAgICAgdGhpcy5fc2V0UG9zaXRpb24oKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiByZXZlYWxzIHRoZSB0b29sdGlwLCBhbmQgZmlyZXMgYW4gZXZlbnQgdG8gY2xvc2UgYW55IG90aGVyIG9wZW4gdG9vbHRpcHMgb24gdGhlIHBhZ2VcclxuICAgKiBAZmlyZXMgVG9vbHRpcCNjbG9zZW1lXHJcbiAgICogQGZpcmVzIFRvb2x0aXAjc2hvd1xyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqL1xyXG4gIFRvb2x0aXAucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbigpe1xyXG4gICAgaWYodGhpcy5vcHRpb25zLnNob3dPbiAhPT0gJ2FsbCcgJiYgIUZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KHRoaXMub3B0aW9ucy5zaG93T24pKXtcclxuICAgICAgLy8gY29uc29sZS5lcnJvcignVGhlIHNjcmVlbiBpcyB0b28gc21hbGwgdG8gZGlzcGxheSB0aGlzIHRvb2x0aXAnKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICB0aGlzLnRlbXBsYXRlLmNzcygndmlzaWJpbGl0eScsICdoaWRkZW4nKS5zaG93KCk7XHJcbiAgICB0aGlzLl9zZXRQb3NpdGlvbigpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmlyZXMgdG8gY2xvc2UgYWxsIG90aGVyIG9wZW4gdG9vbHRpcHMgb24gdGhlIHBhZ2VcclxuICAgICAqIEBldmVudCBDbG9zZW1lI3Rvb2x0aXBcclxuICAgICAqL1xyXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdjbG9zZW1lLnpmLnRvb2x0aXAnLCB0aGlzLnRlbXBsYXRlLmF0dHIoJ2lkJykpO1xyXG5cclxuXHJcbiAgICB0aGlzLnRlbXBsYXRlLmF0dHIoe1xyXG4gICAgICAnZGF0YS1pcy1hY3RpdmUnOiB0cnVlLFxyXG4gICAgICAnYXJpYS1oaWRkZW4nOiBmYWxzZVxyXG4gICAgfSk7XHJcbiAgICBfdGhpcy5pc0FjdGl2ZSA9IHRydWU7XHJcbiAgICAvLyBjb25zb2xlLmxvZyh0aGlzLnRlbXBsYXRlKTtcclxuICAgIHRoaXMudGVtcGxhdGUuc3RvcCgpLmhpZGUoKS5jc3MoJ3Zpc2liaWxpdHknLCAnJykuZmFkZUluKHRoaXMub3B0aW9ucy5mYWRlSW5EdXJhdGlvbiwgZnVuY3Rpb24oKXtcclxuICAgICAgLy9tYXliZSBkbyBzdHVmZj9cclxuICAgIH0pO1xyXG4gICAgLyoqXHJcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSB0b29sdGlwIGlzIHNob3duXHJcbiAgICAgKiBAZXZlbnQgVG9vbHRpcCNzaG93XHJcbiAgICAgKi9cclxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignc2hvdy56Zi50b29sdGlwJyk7XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogSGlkZXMgdGhlIGN1cnJlbnQgdG9vbHRpcCwgYW5kIHJlc2V0cyB0aGUgcG9zaXRpb25pbmcgY2xhc3MgaWYgaXQgd2FzIGNoYW5nZWQgZHVlIHRvIGNvbGxpc2lvblxyXG4gICAqIEBmaXJlcyBUb29sdGlwI2hpZGVcclxuICAgKiBAZnVuY3Rpb25cclxuICAgKi9cclxuICBUb29sdGlwLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24oKXtcclxuICAgIC8vIGNvbnNvbGUubG9nKCdoaWRpbmcnLCB0aGlzLiRlbGVtZW50LmRhdGEoJ3lldGktYm94JykpO1xyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgIHRoaXMudGVtcGxhdGUuc3RvcCgpLmF0dHIoe1xyXG4gICAgICAnYXJpYS1oaWRkZW4nOiB0cnVlLFxyXG4gICAgICAnZGF0YS1pcy1hY3RpdmUnOiBmYWxzZVxyXG4gICAgfSkuZmFkZU91dCh0aGlzLm9wdGlvbnMuZmFkZU91dER1cmF0aW9uLCBmdW5jdGlvbigpe1xyXG4gICAgICBfdGhpcy5pc0FjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICBfdGhpcy5pc0NsaWNrID0gZmFsc2U7XHJcbiAgICAgIGlmKF90aGlzLmNsYXNzQ2hhbmdlZCl7XHJcbiAgICAgICAgX3RoaXMudGVtcGxhdGVcclxuICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyhfdGhpcy5fZ2V0UG9zaXRpb25DbGFzcyhfdGhpcy50ZW1wbGF0ZSkpXHJcbiAgICAgICAgICAgICAuYWRkQ2xhc3MoX3RoaXMub3B0aW9ucy5wb3NpdGlvbkNsYXNzKTtcclxuXHJcbiAgICAgICBfdGhpcy51c2VkUG9zaXRpb25zID0gW107XHJcbiAgICAgICBfdGhpcy5jb3VudGVyID0gNDtcclxuICAgICAgIF90aGlzLmNsYXNzQ2hhbmdlZCA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIC8qKlxyXG4gICAgICogZmlyZXMgd2hlbiB0aGUgdG9vbHRpcCBpcyBoaWRkZW5cclxuICAgICAqIEBldmVudCBUb29sdGlwI2hpZGVcclxuICAgICAqL1xyXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdoaWRlLnpmLnRvb2x0aXAnKTtcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBhZGRzIGV2ZW50IGxpc3RlbmVycyBmb3IgdGhlIHRvb2x0aXAgYW5kIGl0cyBhbmNob3JcclxuICAgKiBUT0RPIGNvbWJpbmUgc29tZSBvZiB0aGUgbGlzdGVuZXJzIGxpa2UgZm9jdXMgYW5kIG1vdXNlZW50ZXIsIGV0Yy5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIFRvb2x0aXAucHJvdG90eXBlLl9ldmVudHMgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgIHZhciAkdGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlO1xyXG4gICAgdmFyIGlzRm9jdXMgPSBmYWxzZTtcclxuXHJcbiAgICBpZighdGhpcy5vcHRpb25zLmRpc2FibGVIb3Zlcil7XHJcblxyXG4gICAgICB0aGlzLiRlbGVtZW50XHJcbiAgICAgIC5vbignbW91c2VlbnRlci56Zi50b29sdGlwJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgaWYoIV90aGlzLmlzQWN0aXZlKXtcclxuICAgICAgICAgIF90aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIF90aGlzLnNob3coKTtcclxuICAgICAgICAgIH0sIF90aGlzLm9wdGlvbnMuaG92ZXJEZWxheSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgICAub24oJ21vdXNlbGVhdmUuemYudG9vbHRpcCcsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGNsZWFyVGltZW91dChfdGhpcy50aW1lb3V0KTtcclxuICAgICAgICBpZighaXNGb2N1cyB8fCAoIV90aGlzLmlzQ2xpY2sgJiYgX3RoaXMub3B0aW9ucy5jbGlja09wZW4pKXtcclxuICAgICAgICAgIF90aGlzLmhpZGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgaWYodGhpcy5vcHRpb25zLmNsaWNrT3Blbil7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQub24oJ21vdXNlZG93bi56Zi50b29sdGlwJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcclxuICAgICAgICBpZihfdGhpcy5pc0NsaWNrKXtcclxuICAgICAgICAgIF90aGlzLmhpZGUoKTtcclxuICAgICAgICAgIC8vIF90aGlzLmlzQ2xpY2sgPSBmYWxzZTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgIF90aGlzLmlzQ2xpY2sgPSB0cnVlO1xyXG4gICAgICAgICAgaWYoKF90aGlzLm9wdGlvbnMuZGlzYWJsZUhvdmVyIHx8ICFfdGhpcy4kZWxlbWVudC5hdHRyKCd0YWJpbmRleCcpKSAmJiAhX3RoaXMuaXNBY3RpdmUpe1xyXG4gICAgICAgICAgICBfdGhpcy5zaG93KCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBpZighdGhpcy5vcHRpb25zLmRpc2FibGVGb3JUb3VjaCl7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnRcclxuICAgICAgLm9uKCd0YXAuemYudG9vbHRpcCB0b3VjaGVuZC56Zi50b29sdGlwJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgX3RoaXMuaXNBY3RpdmUgPyBfdGhpcy5oaWRlKCkgOiBfdGhpcy5zaG93KCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnQub24oe1xyXG4gICAgICAvLyAndG9nZ2xlLnpmLnRyaWdnZXInOiB0aGlzLnRvZ2dsZS5iaW5kKHRoaXMpLFxyXG4gICAgICAvLyAnY2xvc2UuemYudHJpZ2dlcic6IHRoaXMuaGlkZS5iaW5kKHRoaXMpXHJcbiAgICAgICdjbG9zZS56Zi50cmlnZ2VyJzogdGhpcy5oaWRlLmJpbmQodGhpcylcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuJGVsZW1lbnRcclxuICAgICAgLm9uKCdmb2N1cy56Zi50b29sdGlwJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgaXNGb2N1cyA9IHRydWU7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coX3RoaXMuaXNDbGljayk7XHJcbiAgICAgICAgaWYoX3RoaXMuaXNDbGljayl7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAvLyAkKHdpbmRvdylcclxuICAgICAgICAgIF90aGlzLnNob3coKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcblxyXG4gICAgICAub24oJ2ZvY3Vzb3V0LnpmLnRvb2x0aXAnLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBpc0ZvY3VzID0gZmFsc2U7XHJcbiAgICAgICAgX3RoaXMuaXNDbGljayA9IGZhbHNlO1xyXG4gICAgICAgIF90aGlzLmhpZGUoKTtcclxuICAgICAgfSlcclxuXHJcbiAgICAgIC5vbigncmVzaXplbWUuemYudHJpZ2dlcicsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgaWYoX3RoaXMuaXNBY3RpdmUpe1xyXG4gICAgICAgICAgX3RoaXMuX3NldFBvc2l0aW9uKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIGFkZHMgYSB0b2dnbGUgbWV0aG9kLCBpbiBhZGRpdGlvbiB0byB0aGUgc3RhdGljIHNob3coKSAmIGhpZGUoKSBmdW5jdGlvbnNcclxuICAgKiBAZnVuY3Rpb25cclxuICAgKi9cclxuICBUb29sdGlwLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbigpe1xyXG4gICAgaWYodGhpcy5pc0FjdGl2ZSl7XHJcbiAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIHRoaXMuc2hvdygpO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogRGVzdHJveXMgYW4gaW5zdGFuY2Ugb2YgdG9vbHRpcCwgcmVtb3ZlcyB0ZW1wbGF0ZSBlbGVtZW50IGZyb20gdGhlIHZpZXcuXHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICovXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCl7XHJcbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ3RpdGxlJywgdGhpcy50ZW1wbGF0ZS50ZXh0KCkpXHJcbiAgICAgICAgICAgICAgICAgLm9mZignLnpmLnRyaWdnZXIgLnpmLnRvb3RpcCcpXHJcbiAgICAgICAgICAgICAgICAvLyAgLnJlbW92ZUNsYXNzKCdoYXMtdGlwJylcclxuICAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cignYXJpYS1kZXNjcmliZWRieScpXHJcbiAgICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEteWV0aS1ib3gnKVxyXG4gICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLXRvZ2dsZScpXHJcbiAgICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtcmVzaXplJyk7XHJcblxyXG4gICAgdGhpcy50ZW1wbGF0ZS5yZW1vdmUoKTtcclxuXHJcbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiBUT0RPIHV0aWxpemUgcmVzaXplIGV2ZW50IHRyaWdnZXJcclxuICAgKi9cclxuXHJcbiAgRm91bmRhdGlvbi5wbHVnaW4oVG9vbHRpcCwgJ1Rvb2x0aXAnKTtcclxufShqUXVlcnksIHdpbmRvdy5kb2N1bWVudCwgd2luZG93LkZvdW5kYXRpb24pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG4vLyBQb2x5ZmlsbCBmb3IgcmVxdWVzdEFuaW1hdGlvbkZyYW1lXHJcbihmdW5jdGlvbigpIHtcclxuICBpZiAoIURhdGUubm93KVxyXG4gICAgRGF0ZS5ub3cgPSBmdW5jdGlvbigpIHsgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpOyB9O1xyXG5cclxuICB2YXIgdmVuZG9ycyA9IFsnd2Via2l0JywgJ21veiddO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdmVuZG9ycy5sZW5ndGggJiYgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7ICsraSkge1xyXG4gICAgICB2YXIgdnAgPSB2ZW5kb3JzW2ldO1xyXG4gICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZwKydSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcclxuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gKHdpbmRvd1t2cCsnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8fCB3aW5kb3dbdnArJ0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSddKTtcclxuICB9XHJcbiAgaWYgKC9pUChhZHxob25lfG9kKS4qT1MgNi8udGVzdCh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudClcclxuICAgIHx8ICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8ICF3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUpIHtcclxuICAgIHZhciBsYXN0VGltZSA9IDA7XHJcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgICAgICB2YXIgbmV4dFRpbWUgPSBNYXRoLm1heChsYXN0VGltZSArIDE2LCBub3cpO1xyXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBjYWxsYmFjayhsYXN0VGltZSA9IG5leHRUaW1lKTsgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0VGltZSAtIG5vdyk7XHJcbiAgICB9O1xyXG4gICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gY2xlYXJUaW1lb3V0O1xyXG4gIH1cclxufSkoKTtcclxuXHJcbnZhciBpbml0Q2xhc3NlcyAgID0gWydtdWktZW50ZXInLCAnbXVpLWxlYXZlJ107XHJcbnZhciBhY3RpdmVDbGFzc2VzID0gWydtdWktZW50ZXItYWN0aXZlJywgJ211aS1sZWF2ZS1hY3RpdmUnXTtcclxuXHJcbi8vIEZpbmQgdGhlIHJpZ2h0IFwidHJhbnNpdGlvbmVuZFwiIGV2ZW50IGZvciB0aGlzIGJyb3dzZXJcclxudmFyIGVuZEV2ZW50ID0gKGZ1bmN0aW9uKCkge1xyXG4gIHZhciB0cmFuc2l0aW9ucyA9IHtcclxuICAgICd0cmFuc2l0aW9uJzogJ3RyYW5zaXRpb25lbmQnLFxyXG4gICAgJ1dlYmtpdFRyYW5zaXRpb24nOiAnd2Via2l0VHJhbnNpdGlvbkVuZCcsXHJcbiAgICAnTW96VHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcclxuICAgICdPVHJhbnNpdGlvbic6ICdvdHJhbnNpdGlvbmVuZCdcclxuICB9XHJcbiAgdmFyIGVsZW0gPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblxyXG4gIGZvciAodmFyIHQgaW4gdHJhbnNpdGlvbnMpIHtcclxuICAgIGlmICh0eXBlb2YgZWxlbS5zdHlsZVt0XSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgcmV0dXJuIHRyYW5zaXRpb25zW3RdO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIG51bGw7XHJcbn0pKCk7XHJcblxyXG5mdW5jdGlvbiBhbmltYXRlKGlzSW4sIGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpIHtcclxuICBlbGVtZW50ID0gJChlbGVtZW50KS5lcSgwKTtcclxuXHJcbiAgaWYgKCFlbGVtZW50Lmxlbmd0aCkgcmV0dXJuO1xyXG5cclxuICBpZiAoZW5kRXZlbnQgPT09IG51bGwpIHtcclxuICAgIGlzSW4gPyBlbGVtZW50LnNob3coKSA6IGVsZW1lbnQuaGlkZSgpO1xyXG4gICAgY2IoKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHZhciBpbml0Q2xhc3MgPSBpc0luID8gaW5pdENsYXNzZXNbMF0gOiBpbml0Q2xhc3Nlc1sxXTtcclxuICB2YXIgYWN0aXZlQ2xhc3MgPSBpc0luID8gYWN0aXZlQ2xhc3Nlc1swXSA6IGFjdGl2ZUNsYXNzZXNbMV07XHJcblxyXG4gIC8vIFNldCB1cCB0aGUgYW5pbWF0aW9uXHJcbiAgcmVzZXQoKTtcclxuICBlbGVtZW50LmFkZENsYXNzKGFuaW1hdGlvbik7XHJcbiAgZWxlbWVudC5jc3MoJ3RyYW5zaXRpb24nLCAnbm9uZScpO1xyXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcclxuICAgIGVsZW1lbnQuYWRkQ2xhc3MoaW5pdENsYXNzKTtcclxuICAgIGlmIChpc0luKSBlbGVtZW50LnNob3coKTtcclxuICB9KTtcclxuXHJcbiAgLy8gU3RhcnQgdGhlIGFuaW1hdGlvblxyXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcclxuICAgIGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGg7XHJcbiAgICBlbGVtZW50LmNzcygndHJhbnNpdGlvbicsICcnKTtcclxuICAgIGVsZW1lbnQuYWRkQ2xhc3MoYWN0aXZlQ2xhc3MpO1xyXG4gIH0pO1xyXG5cclxuICAvLyBDbGVhbiB1cCB0aGUgYW5pbWF0aW9uIHdoZW4gaXQgZmluaXNoZXNcclxuICBlbGVtZW50Lm9uZSgndHJhbnNpdGlvbmVuZCcsIGZpbmlzaCk7XHJcblxyXG4gIC8vIEhpZGVzIHRoZSBlbGVtZW50IChmb3Igb3V0IGFuaW1hdGlvbnMpLCByZXNldHMgdGhlIGVsZW1lbnQsIGFuZCBydW5zIGEgY2FsbGJhY2tcclxuICBmdW5jdGlvbiBmaW5pc2goKSB7XHJcbiAgICBpZiAoIWlzSW4pIGVsZW1lbnQuaGlkZSgpO1xyXG4gICAgcmVzZXQoKTtcclxuICAgIGlmIChjYikgY2IuYXBwbHkoZWxlbWVudCk7XHJcbiAgfVxyXG5cclxuICAvLyBSZXNldHMgdHJhbnNpdGlvbnMgYW5kIHJlbW92ZXMgbW90aW9uLXNwZWNpZmljIGNsYXNzZXNcclxuICBmdW5jdGlvbiByZXNldCgpIHtcclxuICAgIGVsZW1lbnRbMF0uc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gMDtcclxuICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoaW5pdENsYXNzICsgJyAnICsgYWN0aXZlQ2xhc3MgKyAnICcgKyBhbmltYXRpb24pO1xyXG4gIH1cclxufVxyXG5cclxudmFyIE1vdGlvblVJID0ge1xyXG4gIGFuaW1hdGVJbjogZnVuY3Rpb24oZWxlbWVudCwgYW5pbWF0aW9uLCBjYikge1xyXG4gICAgYW5pbWF0ZSh0cnVlLCBlbGVtZW50LCBhbmltYXRpb24sIGNiKTtcclxuICB9LFxyXG5cclxuICBhbmltYXRlT3V0OiBmdW5jdGlvbihlbGVtZW50LCBhbmltYXRpb24sIGNiKSB7XHJcbiAgICBhbmltYXRlKGZhbHNlLCBlbGVtZW50LCBhbmltYXRpb24sIGNiKTtcclxuICB9XHJcbn1cclxuIiwialF1ZXJ5KCAnaWZyYW1lW3NyYyo9XCJ5b3V0dWJlLmNvbVwiXScpLndyYXAoXCI8ZGl2IGNsYXNzPSdmbGV4LXZpZGVvIHdpZGVzY3JlZW4nLz5cIik7XHJcbmpRdWVyeSggJ2lmcmFtZVtzcmMqPVwidmltZW8uY29tXCJdJykud3JhcChcIjxkaXYgY2xhc3M9J2ZsZXgtdmlkZW8gd2lkZXNjcmVlbiB2aW1lbycvPlwiKTtcclxuIiwialF1ZXJ5KGRvY3VtZW50KS5mb3VuZGF0aW9uKCk7IiwiLy8gSm95cmlkZSBkZW1vXHJcbiQoJyNzdGFydC1qcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICQoZG9jdW1lbnQpLmZvdW5kYXRpb24oJ2pveXJpZGUnLCdzdGFydCcpO1xyXG59KTsiLCIvKiEgbmFub1Njcm9sbGVySlMgLSB2MC44LjcgLSAyMDE1XHJcbiogaHR0cDovL2phbWVzZmxvcmVudGluby5naXRodWIuY29tL25hbm9TY3JvbGxlckpTL1xyXG4qIENvcHlyaWdodCAoYykgMjAxNSBKYW1lcyBGbG9yZW50aW5vOyBMaWNlbnNlZCBNSVQgKi9cclxuKGZ1bmN0aW9uKGZhY3RvcnkpIHtcclxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcbiAgICByZXR1cm4gZGVmaW5lKFsnanF1ZXJ5J10sIGZ1bmN0aW9uKCQpIHtcclxuICAgICAgcmV0dXJuIGZhY3RvcnkoJCwgd2luZG93LCBkb2N1bWVudCk7XHJcbiAgICB9KTtcclxuICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xyXG4gICAgcmV0dXJuIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKCdqcXVlcnknKSwgd2luZG93LCBkb2N1bWVudCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiBmYWN0b3J5KGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCk7XHJcbiAgfVxyXG59KShmdW5jdGlvbigkLCB3aW5kb3csIGRvY3VtZW50KSB7XHJcbiAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgdmFyIEJST1dTRVJfSVNfSUU3LCBCUk9XU0VSX1NDUk9MTEJBUl9XSURUSCwgRE9NU0NST0xMLCBET1dOLCBEUkFHLCBFTlRFUiwgS0VZRE9XTiwgS0VZVVAsIE1PVVNFRE9XTiwgTU9VU0VFTlRFUiwgTU9VU0VNT1ZFLCBNT1VTRVVQLCBNT1VTRVdIRUVMLCBOYW5vU2Nyb2xsLCBQQU5FRE9XTiwgUkVTSVpFLCBTQ1JPTEwsIFNDUk9MTEJBUiwgVE9VQ0hNT1ZFLCBVUCwgV0hFRUwsIGNBRiwgZGVmYXVsdHMsIGdldEJyb3dzZXJTY3JvbGxiYXJXaWR0aCwgaGFzVHJhbnNmb3JtLCBpc0ZGV2l0aEJ1Z2d5U2Nyb2xsYmFyLCByQUYsIHRyYW5zZm9ybSwgX2VsZW1lbnRTdHlsZSwgX3ByZWZpeFN0eWxlLCBfdmVuZG9yO1xyXG4gIGRlZmF1bHRzID0ge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICBhIGNsYXNzbmFtZSBmb3IgdGhlIHBhbmUgZWxlbWVudC5cclxuICAgICAgQHByb3BlcnR5IHBhbmVDbGFzc1xyXG4gICAgICBAdHlwZSBTdHJpbmdcclxuICAgICAgQGRlZmF1bHQgJ25hbm8tcGFuZSdcclxuICAgICAqL1xyXG4gICAgcGFuZUNsYXNzOiAnbmFuby1wYW5lJyxcclxuXHJcbiAgICAvKipcclxuICAgICAgYSBjbGFzc25hbWUgZm9yIHRoZSBzbGlkZXIgZWxlbWVudC5cclxuICAgICAgQHByb3BlcnR5IHNsaWRlckNsYXNzXHJcbiAgICAgIEB0eXBlIFN0cmluZ1xyXG4gICAgICBAZGVmYXVsdCAnbmFuby1zbGlkZXInXHJcbiAgICAgKi9cclxuICAgIHNsaWRlckNsYXNzOiAnbmFuby1zbGlkZXInLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICBhIGNsYXNzbmFtZSBmb3IgdGhlIGNvbnRlbnQgZWxlbWVudC5cclxuICAgICAgQHByb3BlcnR5IGNvbnRlbnRDbGFzc1xyXG4gICAgICBAdHlwZSBTdHJpbmdcclxuICAgICAgQGRlZmF1bHQgJ25hbm8tY29udGVudCdcclxuICAgICAqL1xyXG4gICAgY29udGVudENsYXNzOiAnbmFuby1jb250ZW50JyxcclxuXHJcbiAgICAvKipcclxuICAgICAgYSBjbGFzc25hbWUgZm9yIGVuYWJsZWQgbW9kZVxyXG4gICAgICBAcHJvcGVydHkgZW5hYmxlZENsYXNzXHJcbiAgICAgIEB0eXBlIFN0cmluZ1xyXG4gICAgICBAZGVmYXVsdCAnaGFzLXNjcm9sbGJhcidcclxuICAgICAqL1xyXG4gICAgZW5hYmxlZENsYXNzOiAnaGFzLXNjcm9sbGJhcicsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgIGEgY2xhc3NuYW1lIGZvciBmbGFzaGVkIG1vZGVcclxuICAgICAgQHByb3BlcnR5IGZsYXNoZWRDbGFzc1xyXG4gICAgICBAdHlwZSBTdHJpbmdcclxuICAgICAgQGRlZmF1bHQgJ2ZsYXNoZWQnXHJcbiAgICAgKi9cclxuICAgIGZsYXNoZWRDbGFzczogJ2ZsYXNoZWQnLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICBhIGNsYXNzbmFtZSBmb3IgYWN0aXZlIG1vZGVcclxuICAgICAgQHByb3BlcnR5IGFjdGl2ZUNsYXNzXHJcbiAgICAgIEB0eXBlIFN0cmluZ1xyXG4gICAgICBAZGVmYXVsdCAnYWN0aXZlJ1xyXG4gICAgICovXHJcbiAgICBhY3RpdmVDbGFzczogJ2FjdGl2ZScsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgIGEgc2V0dGluZyB0byBlbmFibGUgbmF0aXZlIHNjcm9sbGluZyBpbiBpT1MgZGV2aWNlcy5cclxuICAgICAgQHByb3BlcnR5IGlPU05hdGl2ZVNjcm9sbGluZ1xyXG4gICAgICBAdHlwZSBCb29sZWFuXHJcbiAgICAgIEBkZWZhdWx0IGZhbHNlXHJcbiAgICAgKi9cclxuICAgIGlPU05hdGl2ZVNjcm9sbGluZzogZmFsc2UsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgIGEgc2V0dGluZyB0byBwcmV2ZW50IHRoZSByZXN0IG9mIHRoZSBwYWdlIGJlaW5nXHJcbiAgICAgIHNjcm9sbGVkIHdoZW4gdXNlciBzY3JvbGxzIHRoZSBgLmNvbnRlbnRgIGVsZW1lbnQuXHJcbiAgICAgIEBwcm9wZXJ0eSBwcmV2ZW50UGFnZVNjcm9sbGluZ1xyXG4gICAgICBAdHlwZSBCb29sZWFuXHJcbiAgICAgIEBkZWZhdWx0IGZhbHNlXHJcbiAgICAgKi9cclxuICAgIHByZXZlbnRQYWdlU2Nyb2xsaW5nOiBmYWxzZSxcclxuXHJcbiAgICAvKipcclxuICAgICAgYSBzZXR0aW5nIHRvIGRpc2FibGUgYmluZGluZyB0byB0aGUgcmVzaXplIGV2ZW50LlxyXG4gICAgICBAcHJvcGVydHkgZGlzYWJsZVJlc2l6ZVxyXG4gICAgICBAdHlwZSBCb29sZWFuXHJcbiAgICAgIEBkZWZhdWx0IGZhbHNlXHJcbiAgICAgKi9cclxuICAgIGRpc2FibGVSZXNpemU6IGZhbHNlLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICBhIHNldHRpbmcgdG8gbWFrZSB0aGUgc2Nyb2xsYmFyIGFsd2F5cyB2aXNpYmxlLlxyXG4gICAgICBAcHJvcGVydHkgYWx3YXlzVmlzaWJsZVxyXG4gICAgICBAdHlwZSBCb29sZWFuXHJcbiAgICAgIEBkZWZhdWx0IGZhbHNlXHJcbiAgICAgKi9cclxuICAgIGFsd2F5c1Zpc2libGU6IGZhbHNlLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICBhIGRlZmF1bHQgdGltZW91dCBmb3IgdGhlIGBmbGFzaCgpYCBtZXRob2QuXHJcbiAgICAgIEBwcm9wZXJ0eSBmbGFzaERlbGF5XHJcbiAgICAgIEB0eXBlIE51bWJlclxyXG4gICAgICBAZGVmYXVsdCAxNTAwXHJcbiAgICAgKi9cclxuICAgIGZsYXNoRGVsYXk6IDE1MDAsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgIGEgbWluaW11bSBoZWlnaHQgZm9yIHRoZSBgLnNsaWRlcmAgZWxlbWVudC5cclxuICAgICAgQHByb3BlcnR5IHNsaWRlck1pbkhlaWdodFxyXG4gICAgICBAdHlwZSBOdW1iZXJcclxuICAgICAgQGRlZmF1bHQgMjBcclxuICAgICAqL1xyXG4gICAgc2xpZGVyTWluSGVpZ2h0OiAyMCxcclxuXHJcbiAgICAvKipcclxuICAgICAgYSBtYXhpbXVtIGhlaWdodCBmb3IgdGhlIGAuc2xpZGVyYCBlbGVtZW50LlxyXG4gICAgICBAcHJvcGVydHkgc2xpZGVyTWF4SGVpZ2h0XHJcbiAgICAgIEB0eXBlIE51bWJlclxyXG4gICAgICBAZGVmYXVsdCBudWxsXHJcbiAgICAgKi9cclxuICAgIHNsaWRlck1heEhlaWdodDogbnVsbCxcclxuXHJcbiAgICAvKipcclxuICAgICAgYW4gYWx0ZXJuYXRlIGRvY3VtZW50IGNvbnRleHQuXHJcbiAgICAgIEBwcm9wZXJ0eSBkb2N1bWVudENvbnRleHRcclxuICAgICAgQHR5cGUgRG9jdW1lbnRcclxuICAgICAgQGRlZmF1bHQgbnVsbFxyXG4gICAgICovXHJcbiAgICBkb2N1bWVudENvbnRleHQ6IG51bGwsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgIGFuIGFsdGVybmF0ZSB3aW5kb3cgY29udGV4dC5cclxuICAgICAgQHByb3BlcnR5IHdpbmRvd0NvbnRleHRcclxuICAgICAgQHR5cGUgV2luZG93XHJcbiAgICAgIEBkZWZhdWx0IG51bGxcclxuICAgICAqL1xyXG4gICAgd2luZG93Q29udGV4dDogbnVsbFxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAgQHByb3BlcnR5IFNDUk9MTEJBUlxyXG4gICAgQHR5cGUgU3RyaW5nXHJcbiAgICBAc3RhdGljXHJcbiAgICBAZmluYWxcclxuICAgIEBwcml2YXRlXHJcbiAgICovXHJcbiAgU0NST0xMQkFSID0gJ3Njcm9sbGJhcic7XHJcblxyXG4gIC8qKlxyXG4gICAgQHByb3BlcnR5IFNDUk9MTFxyXG4gICAgQHR5cGUgU3RyaW5nXHJcbiAgICBAc3RhdGljXHJcbiAgICBAZmluYWxcclxuICAgIEBwcml2YXRlXHJcbiAgICovXHJcbiAgU0NST0xMID0gJ3Njcm9sbCc7XHJcblxyXG4gIC8qKlxyXG4gICAgQHByb3BlcnR5IE1PVVNFRE9XTlxyXG4gICAgQHR5cGUgU3RyaW5nXHJcbiAgICBAZmluYWxcclxuICAgIEBwcml2YXRlXHJcbiAgICovXHJcbiAgTU9VU0VET1dOID0gJ21vdXNlZG93bic7XHJcblxyXG4gIC8qKlxyXG4gICAgQHByb3BlcnR5IE1PVVNFRU5URVJcclxuICAgIEB0eXBlIFN0cmluZ1xyXG4gICAgQGZpbmFsXHJcbiAgICBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIE1PVVNFRU5URVIgPSAnbW91c2VlbnRlcic7XHJcblxyXG4gIC8qKlxyXG4gICAgQHByb3BlcnR5IE1PVVNFTU9WRVxyXG4gICAgQHR5cGUgU3RyaW5nXHJcbiAgICBAc3RhdGljXHJcbiAgICBAZmluYWxcclxuICAgIEBwcml2YXRlXHJcbiAgICovXHJcbiAgTU9VU0VNT1ZFID0gJ21vdXNlbW92ZSc7XHJcblxyXG4gIC8qKlxyXG4gICAgQHByb3BlcnR5IE1PVVNFV0hFRUxcclxuICAgIEB0eXBlIFN0cmluZ1xyXG4gICAgQGZpbmFsXHJcbiAgICBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIE1PVVNFV0hFRUwgPSAnbW91c2V3aGVlbCc7XHJcblxyXG4gIC8qKlxyXG4gICAgQHByb3BlcnR5IE1PVVNFVVBcclxuICAgIEB0eXBlIFN0cmluZ1xyXG4gICAgQHN0YXRpY1xyXG4gICAgQGZpbmFsXHJcbiAgICBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIE1PVVNFVVAgPSAnbW91c2V1cCc7XHJcblxyXG4gIC8qKlxyXG4gICAgQHByb3BlcnR5IFJFU0laRVxyXG4gICAgQHR5cGUgU3RyaW5nXHJcbiAgICBAZmluYWxcclxuICAgIEBwcml2YXRlXHJcbiAgICovXHJcbiAgUkVTSVpFID0gJ3Jlc2l6ZSc7XHJcblxyXG4gIC8qKlxyXG4gICAgQHByb3BlcnR5IERSQUdcclxuICAgIEB0eXBlIFN0cmluZ1xyXG4gICAgQHN0YXRpY1xyXG4gICAgQGZpbmFsXHJcbiAgICBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIERSQUcgPSAnZHJhZyc7XHJcblxyXG4gIC8qKlxyXG4gICAgQHByb3BlcnR5IEVOVEVSXHJcbiAgICBAdHlwZSBTdHJpbmdcclxuICAgIEBzdGF0aWNcclxuICAgIEBmaW5hbFxyXG4gICAgQHByaXZhdGVcclxuICAgKi9cclxuICBFTlRFUiA9ICdlbnRlcic7XHJcblxyXG4gIC8qKlxyXG4gICAgQHByb3BlcnR5IFVQXHJcbiAgICBAdHlwZSBTdHJpbmdcclxuICAgIEBzdGF0aWNcclxuICAgIEBmaW5hbFxyXG4gICAgQHByaXZhdGVcclxuICAgKi9cclxuICBVUCA9ICd1cCc7XHJcblxyXG4gIC8qKlxyXG4gICAgQHByb3BlcnR5IFBBTkVET1dOXHJcbiAgICBAdHlwZSBTdHJpbmdcclxuICAgIEBzdGF0aWNcclxuICAgIEBmaW5hbFxyXG4gICAgQHByaXZhdGVcclxuICAgKi9cclxuICBQQU5FRE9XTiA9ICdwYW5lZG93bic7XHJcblxyXG4gIC8qKlxyXG4gICAgQHByb3BlcnR5IERPTVNDUk9MTFxyXG4gICAgQHR5cGUgU3RyaW5nXHJcbiAgICBAc3RhdGljXHJcbiAgICBAZmluYWxcclxuICAgIEBwcml2YXRlXHJcbiAgICovXHJcbiAgRE9NU0NST0xMID0gJ0RPTU1vdXNlU2Nyb2xsJztcclxuXHJcbiAgLyoqXHJcbiAgICBAcHJvcGVydHkgRE9XTlxyXG4gICAgQHR5cGUgU3RyaW5nXHJcbiAgICBAc3RhdGljXHJcbiAgICBAZmluYWxcclxuICAgIEBwcml2YXRlXHJcbiAgICovXHJcbiAgRE9XTiA9ICdkb3duJztcclxuXHJcbiAgLyoqXHJcbiAgICBAcHJvcGVydHkgV0hFRUxcclxuICAgIEB0eXBlIFN0cmluZ1xyXG4gICAgQHN0YXRpY1xyXG4gICAgQGZpbmFsXHJcbiAgICBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIFdIRUVMID0gJ3doZWVsJztcclxuXHJcbiAgLyoqXHJcbiAgICBAcHJvcGVydHkgS0VZRE9XTlxyXG4gICAgQHR5cGUgU3RyaW5nXHJcbiAgICBAc3RhdGljXHJcbiAgICBAZmluYWxcclxuICAgIEBwcml2YXRlXHJcbiAgICovXHJcbiAgS0VZRE9XTiA9ICdrZXlkb3duJztcclxuXHJcbiAgLyoqXHJcbiAgICBAcHJvcGVydHkgS0VZVVBcclxuICAgIEB0eXBlIFN0cmluZ1xyXG4gICAgQHN0YXRpY1xyXG4gICAgQGZpbmFsXHJcbiAgICBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIEtFWVVQID0gJ2tleXVwJztcclxuXHJcbiAgLyoqXHJcbiAgICBAcHJvcGVydHkgVE9VQ0hNT1ZFXHJcbiAgICBAdHlwZSBTdHJpbmdcclxuICAgIEBzdGF0aWNcclxuICAgIEBmaW5hbFxyXG4gICAgQHByaXZhdGVcclxuICAgKi9cclxuICBUT1VDSE1PVkUgPSAndG91Y2htb3ZlJztcclxuXHJcbiAgLyoqXHJcbiAgICBAcHJvcGVydHkgQlJPV1NFUl9JU19JRTdcclxuICAgIEB0eXBlIEJvb2xlYW5cclxuICAgIEBzdGF0aWNcclxuICAgIEBmaW5hbFxyXG4gICAgQHByaXZhdGVcclxuICAgKi9cclxuICBCUk9XU0VSX0lTX0lFNyA9IHdpbmRvdy5uYXZpZ2F0b3IuYXBwTmFtZSA9PT0gJ01pY3Jvc29mdCBJbnRlcm5ldCBFeHBsb3JlcicgJiYgL21zaWUgNy4vaS50ZXN0KHdpbmRvdy5uYXZpZ2F0b3IuYXBwVmVyc2lvbikgJiYgd2luZG93LkFjdGl2ZVhPYmplY3Q7XHJcblxyXG4gIC8qKlxyXG4gICAgQHByb3BlcnR5IEJST1dTRVJfU0NST0xMQkFSX1dJRFRIXHJcbiAgICBAdHlwZSBOdW1iZXJcclxuICAgIEBzdGF0aWNcclxuICAgIEBkZWZhdWx0IG51bGxcclxuICAgIEBwcml2YXRlXHJcbiAgICovXHJcbiAgQlJPV1NFUl9TQ1JPTExCQVJfV0lEVEggPSBudWxsO1xyXG4gIHJBRiA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XHJcbiAgY0FGID0gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lO1xyXG4gIF9lbGVtZW50U3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKS5zdHlsZTtcclxuICBfdmVuZG9yID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGksIHRyYW5zZm9ybSwgdmVuZG9yLCB2ZW5kb3JzLCBfaSwgX2xlbjtcclxuICAgIHZlbmRvcnMgPSBbJ3QnLCAnd2Via2l0VCcsICdNb3pUJywgJ21zVCcsICdPVCddO1xyXG4gICAgZm9yIChpID0gX2kgPSAwLCBfbGVuID0gdmVuZG9ycy5sZW5ndGg7IF9pIDwgX2xlbjsgaSA9ICsrX2kpIHtcclxuICAgICAgdmVuZG9yID0gdmVuZG9yc1tpXTtcclxuICAgICAgdHJhbnNmb3JtID0gdmVuZG9yc1tpXSArICdyYW5zZm9ybSc7XHJcbiAgICAgIGlmICh0cmFuc2Zvcm0gaW4gX2VsZW1lbnRTdHlsZSkge1xyXG4gICAgICAgIHJldHVybiB2ZW5kb3JzW2ldLnN1YnN0cigwLCB2ZW5kb3JzW2ldLmxlbmd0aCAtIDEpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSkoKTtcclxuICBfcHJlZml4U3R5bGUgPSBmdW5jdGlvbihzdHlsZSkge1xyXG4gICAgaWYgKF92ZW5kb3IgPT09IGZhbHNlKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGlmIChfdmVuZG9yID09PSAnJykge1xyXG4gICAgICByZXR1cm4gc3R5bGU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gX3ZlbmRvciArIHN0eWxlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3R5bGUuc3Vic3RyKDEpO1xyXG4gIH07XHJcbiAgdHJhbnNmb3JtID0gX3ByZWZpeFN0eWxlKCd0cmFuc2Zvcm0nKTtcclxuICBoYXNUcmFuc2Zvcm0gPSB0cmFuc2Zvcm0gIT09IGZhbHNlO1xyXG5cclxuICAvKipcclxuICAgIFJldHVybnMgYnJvd3NlcidzIG5hdGl2ZSBzY3JvbGxiYXIgd2lkdGhcclxuICAgIEBtZXRob2QgZ2V0QnJvd3NlclNjcm9sbGJhcldpZHRoXHJcbiAgICBAcmV0dXJuIHtOdW1iZXJ9IHRoZSBzY3JvbGxiYXIgd2lkdGggaW4gcGl4ZWxzXHJcbiAgICBAc3RhdGljXHJcbiAgICBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGdldEJyb3dzZXJTY3JvbGxiYXJXaWR0aCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG91dGVyLCBvdXRlclN0eWxlLCBzY3JvbGxiYXJXaWR0aDtcclxuICAgIG91dGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBvdXRlclN0eWxlID0gb3V0ZXIuc3R5bGU7XHJcbiAgICBvdXRlclN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcclxuICAgIG91dGVyU3R5bGUud2lkdGggPSAnMTAwcHgnO1xyXG4gICAgb3V0ZXJTdHlsZS5oZWlnaHQgPSAnMTAwcHgnO1xyXG4gICAgb3V0ZXJTdHlsZS5vdmVyZmxvdyA9IFNDUk9MTDtcclxuICAgIG91dGVyU3R5bGUudG9wID0gJy05OTk5cHgnO1xyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChvdXRlcik7XHJcbiAgICBzY3JvbGxiYXJXaWR0aCA9IG91dGVyLm9mZnNldFdpZHRoIC0gb3V0ZXIuY2xpZW50V2lkdGg7XHJcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKG91dGVyKTtcclxuICAgIHJldHVybiBzY3JvbGxiYXJXaWR0aDtcclxuICB9O1xyXG4gIGlzRkZXaXRoQnVnZ3lTY3JvbGxiYXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBpc09TWEZGLCB1YSwgdmVyc2lvbjtcclxuICAgIHVhID0gd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQ7XHJcbiAgICBpc09TWEZGID0gLyg/PS4rTWFjIE9TIFgpKD89LitGaXJlZm94KS8udGVzdCh1YSk7XHJcbiAgICBpZiAoIWlzT1NYRkYpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdmVyc2lvbiA9IC9GaXJlZm94XFwvXFxkezJ9XFwuLy5leGVjKHVhKTtcclxuICAgIGlmICh2ZXJzaW9uKSB7XHJcbiAgICAgIHZlcnNpb24gPSB2ZXJzaW9uWzBdLnJlcGxhY2UoL1xcRCsvZywgJycpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGlzT1NYRkYgJiYgK3ZlcnNpb24gPiAyMztcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgIEBjbGFzcyBOYW5vU2Nyb2xsXHJcbiAgICBAcGFyYW0gZWxlbWVudCB7SFRNTEVsZW1lbnR8Tm9kZX0gdGhlIG1haW4gZWxlbWVudFxyXG4gICAgQHBhcmFtIG9wdGlvbnMge09iamVjdH0gbmFub1Njcm9sbGVyJ3Mgb3B0aW9uc1xyXG4gICAgQGNvbnN0cnVjdG9yXHJcbiAgICovXHJcbiAgTmFub1Njcm9sbCA9IChmdW5jdGlvbigpIHtcclxuICAgIGZ1bmN0aW9uIE5hbm9TY3JvbGwoZWwsIG9wdGlvbnMpIHtcclxuICAgICAgdGhpcy5lbCA9IGVsO1xyXG4gICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgICBCUk9XU0VSX1NDUk9MTEJBUl9XSURUSCB8fCAoQlJPV1NFUl9TQ1JPTExCQVJfV0lEVEggPSBnZXRCcm93c2VyU2Nyb2xsYmFyV2lkdGgoKSk7XHJcbiAgICAgIHRoaXMuJGVsID0gJCh0aGlzLmVsKTtcclxuICAgICAgdGhpcy5kb2MgPSAkKHRoaXMub3B0aW9ucy5kb2N1bWVudENvbnRleHQgfHwgZG9jdW1lbnQpO1xyXG4gICAgICB0aGlzLndpbiA9ICQodGhpcy5vcHRpb25zLndpbmRvd0NvbnRleHQgfHwgd2luZG93KTtcclxuICAgICAgdGhpcy5ib2R5ID0gdGhpcy5kb2MuZmluZCgnYm9keScpO1xyXG4gICAgICB0aGlzLiRjb250ZW50ID0gdGhpcy4kZWwuY2hpbGRyZW4oXCIuXCIgKyB0aGlzLm9wdGlvbnMuY29udGVudENsYXNzKTtcclxuICAgICAgdGhpcy4kY29udGVudC5hdHRyKCd0YWJpbmRleCcsIHRoaXMub3B0aW9ucy50YWJJbmRleCB8fCAwKTtcclxuICAgICAgdGhpcy5jb250ZW50ID0gdGhpcy4kY29udGVudFswXTtcclxuICAgICAgdGhpcy5wcmV2aW91c1Bvc2l0aW9uID0gMDtcclxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5pT1NOYXRpdmVTY3JvbGxpbmcgJiYgKHRoaXMuZWwuc3R5bGUuV2Via2l0T3ZlcmZsb3dTY3JvbGxpbmcgIT0gbnVsbCkpIHtcclxuICAgICAgICB0aGlzLm5hdGl2ZVNjcm9sbGluZygpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZ2VuZXJhdGUoKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmNyZWF0ZUV2ZW50cygpO1xyXG4gICAgICB0aGlzLmFkZEV2ZW50cygpO1xyXG4gICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICBQcmV2ZW50cyB0aGUgcmVzdCBvZiB0aGUgcGFnZSBiZWluZyBzY3JvbGxlZFxyXG4gICAgICB3aGVuIHVzZXIgc2Nyb2xscyB0aGUgYC5uYW5vLWNvbnRlbnRgIGVsZW1lbnQuXHJcbiAgICAgIEBtZXRob2QgcHJldmVudFNjcm9sbGluZ1xyXG4gICAgICBAcGFyYW0gZXZlbnQge0V2ZW50fVxyXG4gICAgICBAcGFyYW0gZGlyZWN0aW9uIHtTdHJpbmd9IFNjcm9sbCBkaXJlY3Rpb24gKHVwIG9yIGRvd24pXHJcbiAgICAgIEBwcml2YXRlXHJcbiAgICAgKi9cclxuXHJcbiAgICBOYW5vU2Nyb2xsLnByb3RvdHlwZS5wcmV2ZW50U2Nyb2xsaW5nID0gZnVuY3Rpb24oZSwgZGlyZWN0aW9uKSB7XHJcbiAgICAgIGlmICghdGhpcy5pc0FjdGl2ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICBpZiAoZS50eXBlID09PSBET01TQ1JPTEwpIHtcclxuICAgICAgICBpZiAoZGlyZWN0aW9uID09PSBET1dOICYmIGUub3JpZ2luYWxFdmVudC5kZXRhaWwgPiAwIHx8IGRpcmVjdGlvbiA9PT0gVVAgJiYgZS5vcmlnaW5hbEV2ZW50LmRldGFpbCA8IDApIHtcclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSBpZiAoZS50eXBlID09PSBNT1VTRVdIRUVMKSB7XHJcbiAgICAgICAgaWYgKCFlLm9yaWdpbmFsRXZlbnQgfHwgIWUub3JpZ2luYWxFdmVudC53aGVlbERlbHRhKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT09IERPV04gJiYgZS5vcmlnaW5hbEV2ZW50LndoZWVsRGVsdGEgPCAwIHx8IGRpcmVjdGlvbiA9PT0gVVAgJiYgZS5vcmlnaW5hbEV2ZW50LndoZWVsRGVsdGEgPiAwKSB7XHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAgRW5hYmxlIGlPUyBuYXRpdmUgc2Nyb2xsaW5nXHJcbiAgICAgIEBtZXRob2QgbmF0aXZlU2Nyb2xsaW5nXHJcbiAgICAgIEBwcml2YXRlXHJcbiAgICAgKi9cclxuXHJcbiAgICBOYW5vU2Nyb2xsLnByb3RvdHlwZS5uYXRpdmVTY3JvbGxpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgICAgdGhpcy4kY29udGVudC5jc3Moe1xyXG4gICAgICAgIFdlYmtpdE92ZXJmbG93U2Nyb2xsaW5nOiAndG91Y2gnXHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLmlPU05hdGl2ZVNjcm9sbGluZyA9IHRydWU7XHJcbiAgICAgIHRoaXMuaXNBY3RpdmUgPSB0cnVlO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgIFVwZGF0ZXMgdGhvc2UgbmFub1Njcm9sbGVyIHByb3BlcnRpZXMgdGhhdFxyXG4gICAgICBhcmUgcmVsYXRlZCB0byBjdXJyZW50IHNjcm9sbGJhciBwb3NpdGlvbi5cclxuICAgICAgQG1ldGhvZCB1cGRhdGVTY3JvbGxWYWx1ZXNcclxuICAgICAgQHByaXZhdGVcclxuICAgICAqL1xyXG5cclxuICAgIE5hbm9TY3JvbGwucHJvdG90eXBlLnVwZGF0ZVNjcm9sbFZhbHVlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgY29udGVudCwgZGlyZWN0aW9uO1xyXG4gICAgICBjb250ZW50ID0gdGhpcy5jb250ZW50O1xyXG4gICAgICB0aGlzLm1heFNjcm9sbFRvcCA9IGNvbnRlbnQuc2Nyb2xsSGVpZ2h0IC0gY29udGVudC5jbGllbnRIZWlnaHQ7XHJcbiAgICAgIHRoaXMucHJldlNjcm9sbFRvcCA9IHRoaXMuY29udGVudFNjcm9sbFRvcCB8fCAwO1xyXG4gICAgICB0aGlzLmNvbnRlbnRTY3JvbGxUb3AgPSBjb250ZW50LnNjcm9sbFRvcDtcclxuICAgICAgZGlyZWN0aW9uID0gdGhpcy5jb250ZW50U2Nyb2xsVG9wID4gdGhpcy5wcmV2aW91c1Bvc2l0aW9uID8gXCJkb3duXCIgOiB0aGlzLmNvbnRlbnRTY3JvbGxUb3AgPCB0aGlzLnByZXZpb3VzUG9zaXRpb24gPyBcInVwXCIgOiBcInNhbWVcIjtcclxuICAgICAgdGhpcy5wcmV2aW91c1Bvc2l0aW9uID0gdGhpcy5jb250ZW50U2Nyb2xsVG9wO1xyXG4gICAgICBpZiAoZGlyZWN0aW9uICE9PSBcInNhbWVcIikge1xyXG4gICAgICAgIHRoaXMuJGVsLnRyaWdnZXIoJ3VwZGF0ZScsIHtcclxuICAgICAgICAgIHBvc2l0aW9uOiB0aGlzLmNvbnRlbnRTY3JvbGxUb3AsXHJcbiAgICAgICAgICBtYXhpbXVtOiB0aGlzLm1heFNjcm9sbFRvcCxcclxuICAgICAgICAgIGRpcmVjdGlvbjogZGlyZWN0aW9uXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCF0aGlzLmlPU05hdGl2ZVNjcm9sbGluZykge1xyXG4gICAgICAgIHRoaXMubWF4U2xpZGVyVG9wID0gdGhpcy5wYW5lSGVpZ2h0IC0gdGhpcy5zbGlkZXJIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5zbGlkZXJUb3AgPSB0aGlzLm1heFNjcm9sbFRvcCA9PT0gMCA/IDAgOiB0aGlzLmNvbnRlbnRTY3JvbGxUb3AgKiB0aGlzLm1heFNsaWRlclRvcCAvIHRoaXMubWF4U2Nyb2xsVG9wO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAgVXBkYXRlcyBDU1Mgc3R5bGVzIGZvciBjdXJyZW50IHNjcm9sbCBwb3NpdGlvbi5cclxuICAgICAgVXNlcyBDU1MgMmQgdHJhbnNmcm9tcyBhbmQgYHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVgIGlmIGF2YWlsYWJsZS5cclxuICAgICAgQG1ldGhvZCBzZXRPblNjcm9sbFN0eWxlc1xyXG4gICAgICBAcHJpdmF0ZVxyXG4gICAgICovXHJcblxyXG4gICAgTmFub1Njcm9sbC5wcm90b3R5cGUuc2V0T25TY3JvbGxTdHlsZXMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyIGNzc1ZhbHVlO1xyXG4gICAgICBpZiAoaGFzVHJhbnNmb3JtKSB7XHJcbiAgICAgICAgY3NzVmFsdWUgPSB7fTtcclxuICAgICAgICBjc3NWYWx1ZVt0cmFuc2Zvcm1dID0gXCJ0cmFuc2xhdGUoMCwgXCIgKyB0aGlzLnNsaWRlclRvcCArIFwicHgpXCI7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY3NzVmFsdWUgPSB7XHJcbiAgICAgICAgICB0b3A6IHRoaXMuc2xpZGVyVG9wXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgICBpZiAockFGKSB7XHJcbiAgICAgICAgaWYgKGNBRiAmJiB0aGlzLnNjcm9sbFJBRikge1xyXG4gICAgICAgICAgY0FGKHRoaXMuc2Nyb2xsUkFGKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zY3JvbGxSQUYgPSByQUYoKGZ1bmN0aW9uKF90aGlzKSB7XHJcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIF90aGlzLnNjcm9sbFJBRiA9IG51bGw7XHJcbiAgICAgICAgICAgIHJldHVybiBfdGhpcy5zbGlkZXIuY3NzKGNzc1ZhbHVlKTtcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfSkodGhpcykpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc2xpZGVyLmNzcyhjc3NWYWx1ZSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICBDcmVhdGVzIGV2ZW50IHJlbGF0ZWQgbWV0aG9kc1xyXG4gICAgICBAbWV0aG9kIGNyZWF0ZUV2ZW50c1xyXG4gICAgICBAcHJpdmF0ZVxyXG4gICAgICovXHJcblxyXG4gICAgTmFub1Njcm9sbC5wcm90b3R5cGUuY3JlYXRlRXZlbnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHRoaXMuZXZlbnRzID0ge1xyXG4gICAgICAgIGRvd246IChmdW5jdGlvbihfdGhpcykge1xyXG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgX3RoaXMuaXNCZWluZ0RyYWdnZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBfdGhpcy5vZmZzZXRZID0gZS5wYWdlWSAtIF90aGlzLnNsaWRlci5vZmZzZXQoKS50b3A7XHJcbiAgICAgICAgICAgIGlmICghX3RoaXMuc2xpZGVyLmlzKGUudGFyZ2V0KSkge1xyXG4gICAgICAgICAgICAgIF90aGlzLm9mZnNldFkgPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF90aGlzLnBhbmUuYWRkQ2xhc3MoX3RoaXMub3B0aW9ucy5hY3RpdmVDbGFzcyk7XHJcbiAgICAgICAgICAgIF90aGlzLmRvYy5iaW5kKE1PVVNFTU9WRSwgX3RoaXMuZXZlbnRzW0RSQUddKS5iaW5kKE1PVVNFVVAsIF90aGlzLmV2ZW50c1tVUF0pO1xyXG4gICAgICAgICAgICBfdGhpcy5ib2R5LmJpbmQoTU9VU0VFTlRFUiwgX3RoaXMuZXZlbnRzW0VOVEVSXSk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfSkodGhpcyksXHJcbiAgICAgICAgZHJhZzogKGZ1bmN0aW9uKF90aGlzKSB7XHJcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBfdGhpcy5zbGlkZXJZID0gZS5wYWdlWSAtIF90aGlzLiRlbC5vZmZzZXQoKS50b3AgLSBfdGhpcy5wYW5lVG9wIC0gKF90aGlzLm9mZnNldFkgfHwgX3RoaXMuc2xpZGVySGVpZ2h0ICogMC41KTtcclxuICAgICAgICAgICAgX3RoaXMuc2Nyb2xsKCk7XHJcbiAgICAgICAgICAgIGlmIChfdGhpcy5jb250ZW50U2Nyb2xsVG9wID49IF90aGlzLm1heFNjcm9sbFRvcCAmJiBfdGhpcy5wcmV2U2Nyb2xsVG9wICE9PSBfdGhpcy5tYXhTY3JvbGxUb3ApIHtcclxuICAgICAgICAgICAgICBfdGhpcy4kZWwudHJpZ2dlcignc2Nyb2xsZW5kJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoX3RoaXMuY29udGVudFNjcm9sbFRvcCA9PT0gMCAmJiBfdGhpcy5wcmV2U2Nyb2xsVG9wICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgX3RoaXMuJGVsLnRyaWdnZXIoJ3Njcm9sbHRvcCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfSkodGhpcyksXHJcbiAgICAgICAgdXA6IChmdW5jdGlvbihfdGhpcykge1xyXG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgX3RoaXMuaXNCZWluZ0RyYWdnZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgX3RoaXMucGFuZS5yZW1vdmVDbGFzcyhfdGhpcy5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcclxuICAgICAgICAgICAgX3RoaXMuZG9jLnVuYmluZChNT1VTRU1PVkUsIF90aGlzLmV2ZW50c1tEUkFHXSkudW5iaW5kKE1PVVNFVVAsIF90aGlzLmV2ZW50c1tVUF0pO1xyXG4gICAgICAgICAgICBfdGhpcy5ib2R5LnVuYmluZChNT1VTRUVOVEVSLCBfdGhpcy5ldmVudHNbRU5URVJdKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9KSh0aGlzKSxcclxuICAgICAgICByZXNpemU6IChmdW5jdGlvbihfdGhpcykge1xyXG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgX3RoaXMucmVzZXQoKTtcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfSkodGhpcyksXHJcbiAgICAgICAgcGFuZWRvd246IChmdW5jdGlvbihfdGhpcykge1xyXG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgX3RoaXMuc2xpZGVyWSA9IChlLm9mZnNldFkgfHwgZS5vcmlnaW5hbEV2ZW50LmxheWVyWSkgLSAoX3RoaXMuc2xpZGVySGVpZ2h0ICogMC41KTtcclxuICAgICAgICAgICAgX3RoaXMuc2Nyb2xsKCk7XHJcbiAgICAgICAgICAgIF90aGlzLmV2ZW50cy5kb3duKGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH0pKHRoaXMpLFxyXG4gICAgICAgIHNjcm9sbDogKGZ1bmN0aW9uKF90aGlzKSB7XHJcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBfdGhpcy51cGRhdGVTY3JvbGxWYWx1ZXMoKTtcclxuICAgICAgICAgICAgaWYgKF90aGlzLmlzQmVpbmdEcmFnZ2VkKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghX3RoaXMuaU9TTmF0aXZlU2Nyb2xsaW5nKSB7XHJcbiAgICAgICAgICAgICAgX3RoaXMuc2xpZGVyWSA9IF90aGlzLnNsaWRlclRvcDtcclxuICAgICAgICAgICAgICBfdGhpcy5zZXRPblNjcm9sbFN0eWxlcygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChlID09IG51bGwpIHtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKF90aGlzLmNvbnRlbnRTY3JvbGxUb3AgPj0gX3RoaXMubWF4U2Nyb2xsVG9wKSB7XHJcbiAgICAgICAgICAgICAgaWYgKF90aGlzLm9wdGlvbnMucHJldmVudFBhZ2VTY3JvbGxpbmcpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLnByZXZlbnRTY3JvbGxpbmcoZSwgRE9XTik7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChfdGhpcy5wcmV2U2Nyb2xsVG9wICE9PSBfdGhpcy5tYXhTY3JvbGxUb3ApIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLiRlbC50cmlnZ2VyKCdzY3JvbGxlbmQnKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoX3RoaXMuY29udGVudFNjcm9sbFRvcCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgIGlmIChfdGhpcy5vcHRpb25zLnByZXZlbnRQYWdlU2Nyb2xsaW5nKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5wcmV2ZW50U2Nyb2xsaW5nKGUsIFVQKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYgKF90aGlzLnByZXZTY3JvbGxUb3AgIT09IDApIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLiRlbC50cmlnZ2VyKCdzY3JvbGx0b3AnKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfSkodGhpcyksXHJcbiAgICAgICAgd2hlZWw6IChmdW5jdGlvbihfdGhpcykge1xyXG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgdmFyIGRlbHRhO1xyXG4gICAgICAgICAgICBpZiAoZSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlbHRhID0gZS5kZWx0YSB8fCBlLndoZWVsRGVsdGEgfHwgKGUub3JpZ2luYWxFdmVudCAmJiBlLm9yaWdpbmFsRXZlbnQud2hlZWxEZWx0YSkgfHwgLWUuZGV0YWlsIHx8IChlLm9yaWdpbmFsRXZlbnQgJiYgLWUub3JpZ2luYWxFdmVudC5kZXRhaWwpO1xyXG4gICAgICAgICAgICBpZiAoZGVsdGEpIHtcclxuICAgICAgICAgICAgICBfdGhpcy5zbGlkZXJZICs9IC1kZWx0YSAvIDM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgX3RoaXMuc2Nyb2xsKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfSkodGhpcyksXHJcbiAgICAgICAgZW50ZXI6IChmdW5jdGlvbihfdGhpcykge1xyXG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgdmFyIF9yZWY7XHJcbiAgICAgICAgICAgIGlmICghX3RoaXMuaXNCZWluZ0RyYWdnZWQpIHtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKChlLmJ1dHRvbnMgfHwgZS53aGljaCkgIT09IDEpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gKF9yZWYgPSBfdGhpcy5ldmVudHMpW1VQXS5hcHBseShfcmVmLCBhcmd1bWVudHMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH0pKHRoaXMpXHJcbiAgICAgIH07XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAgQWRkcyBldmVudCBsaXN0ZW5lcnMgd2l0aCBqUXVlcnkuXHJcbiAgICAgIEBtZXRob2QgYWRkRXZlbnRzXHJcbiAgICAgIEBwcml2YXRlXHJcbiAgICAgKi9cclxuXHJcbiAgICBOYW5vU2Nyb2xsLnByb3RvdHlwZS5hZGRFdmVudHMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyIGV2ZW50cztcclxuICAgICAgdGhpcy5yZW1vdmVFdmVudHMoKTtcclxuICAgICAgZXZlbnRzID0gdGhpcy5ldmVudHM7XHJcbiAgICAgIGlmICghdGhpcy5vcHRpb25zLmRpc2FibGVSZXNpemUpIHtcclxuICAgICAgICB0aGlzLndpbi5iaW5kKFJFU0laRSwgZXZlbnRzW1JFU0laRV0pO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICghdGhpcy5pT1NOYXRpdmVTY3JvbGxpbmcpIHtcclxuICAgICAgICB0aGlzLnNsaWRlci5iaW5kKE1PVVNFRE9XTiwgZXZlbnRzW0RPV05dKTtcclxuICAgICAgICB0aGlzLnBhbmUuYmluZChNT1VTRURPV04sIGV2ZW50c1tQQU5FRE9XTl0pLmJpbmQoXCJcIiArIE1PVVNFV0hFRUwgKyBcIiBcIiArIERPTVNDUk9MTCwgZXZlbnRzW1dIRUVMXSk7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy4kY29udGVudC5iaW5kKFwiXCIgKyBTQ1JPTEwgKyBcIiBcIiArIE1PVVNFV0hFRUwgKyBcIiBcIiArIERPTVNDUk9MTCArIFwiIFwiICsgVE9VQ0hNT1ZFLCBldmVudHNbU0NST0xMXSk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAgUmVtb3ZlcyBldmVudCBsaXN0ZW5lcnMgd2l0aCBqUXVlcnkuXHJcbiAgICAgIEBtZXRob2QgcmVtb3ZlRXZlbnRzXHJcbiAgICAgIEBwcml2YXRlXHJcbiAgICAgKi9cclxuXHJcbiAgICBOYW5vU2Nyb2xsLnByb3RvdHlwZS5yZW1vdmVFdmVudHMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyIGV2ZW50cztcclxuICAgICAgZXZlbnRzID0gdGhpcy5ldmVudHM7XHJcbiAgICAgIHRoaXMud2luLnVuYmluZChSRVNJWkUsIGV2ZW50c1tSRVNJWkVdKTtcclxuICAgICAgaWYgKCF0aGlzLmlPU05hdGl2ZVNjcm9sbGluZykge1xyXG4gICAgICAgIHRoaXMuc2xpZGVyLnVuYmluZCgpO1xyXG4gICAgICAgIHRoaXMucGFuZS51bmJpbmQoKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLiRjb250ZW50LnVuYmluZChcIlwiICsgU0NST0xMICsgXCIgXCIgKyBNT1VTRVdIRUVMICsgXCIgXCIgKyBET01TQ1JPTEwgKyBcIiBcIiArIFRPVUNITU9WRSwgZXZlbnRzW1NDUk9MTF0pO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgIEdlbmVyYXRlcyBuYW5vU2Nyb2xsZXIncyBzY3JvbGxiYXIgYW5kIGVsZW1lbnRzIGZvciBpdC5cclxuICAgICAgQG1ldGhvZCBnZW5lcmF0ZVxyXG4gICAgICBAY2hhaW5hYmxlXHJcbiAgICAgIEBwcml2YXRlXHJcbiAgICAgKi9cclxuXHJcbiAgICBOYW5vU2Nyb2xsLnByb3RvdHlwZS5nZW5lcmF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgY29udGVudENsYXNzLCBjc3NSdWxlLCBjdXJyZW50UGFkZGluZywgb3B0aW9ucywgcGFuZSwgcGFuZUNsYXNzLCBzbGlkZXJDbGFzcztcclxuICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcclxuICAgICAgcGFuZUNsYXNzID0gb3B0aW9ucy5wYW5lQ2xhc3MsIHNsaWRlckNsYXNzID0gb3B0aW9ucy5zbGlkZXJDbGFzcywgY29udGVudENsYXNzID0gb3B0aW9ucy5jb250ZW50Q2xhc3M7XHJcbiAgICAgIGlmICghKHBhbmUgPSB0aGlzLiRlbC5jaGlsZHJlbihcIi5cIiArIHBhbmVDbGFzcykpLmxlbmd0aCAmJiAhcGFuZS5jaGlsZHJlbihcIi5cIiArIHNsaWRlckNsYXNzKS5sZW5ndGgpIHtcclxuICAgICAgICB0aGlzLiRlbC5hcHBlbmQoXCI8ZGl2IGNsYXNzPVxcXCJcIiArIHBhbmVDbGFzcyArIFwiXFxcIj48ZGl2IGNsYXNzPVxcXCJcIiArIHNsaWRlckNsYXNzICsgXCJcXFwiIC8+PC9kaXY+XCIpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMucGFuZSA9IHRoaXMuJGVsLmNoaWxkcmVuKFwiLlwiICsgcGFuZUNsYXNzKTtcclxuICAgICAgdGhpcy5zbGlkZXIgPSB0aGlzLnBhbmUuZmluZChcIi5cIiArIHNsaWRlckNsYXNzKTtcclxuICAgICAgaWYgKEJST1dTRVJfU0NST0xMQkFSX1dJRFRIID09PSAwICYmIGlzRkZXaXRoQnVnZ3lTY3JvbGxiYXIoKSkge1xyXG4gICAgICAgIGN1cnJlbnRQYWRkaW5nID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5jb250ZW50LCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKCdwYWRkaW5nLXJpZ2h0JykucmVwbGFjZSgvW14wLTkuXSsvZywgJycpO1xyXG4gICAgICAgIGNzc1J1bGUgPSB7XHJcbiAgICAgICAgICByaWdodDogLTE0LFxyXG4gICAgICAgICAgcGFkZGluZ1JpZ2h0OiArY3VycmVudFBhZGRpbmcgKyAxNFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0gZWxzZSBpZiAoQlJPV1NFUl9TQ1JPTExCQVJfV0lEVEgpIHtcclxuICAgICAgICBjc3NSdWxlID0ge1xyXG4gICAgICAgICAgcmlnaHQ6IC1CUk9XU0VSX1NDUk9MTEJBUl9XSURUSFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy4kZWwuYWRkQ2xhc3Mob3B0aW9ucy5lbmFibGVkQ2xhc3MpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChjc3NSdWxlICE9IG51bGwpIHtcclxuICAgICAgICB0aGlzLiRjb250ZW50LmNzcyhjc3NSdWxlKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICBAbWV0aG9kIHJlc3RvcmVcclxuICAgICAgQHByaXZhdGVcclxuICAgICAqL1xyXG5cclxuICAgIE5hbm9TY3JvbGwucHJvdG90eXBlLnJlc3RvcmUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgdGhpcy5zdG9wcGVkID0gZmFsc2U7XHJcbiAgICAgIGlmICghdGhpcy5pT1NOYXRpdmVTY3JvbGxpbmcpIHtcclxuICAgICAgICB0aGlzLnBhbmUuc2hvdygpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuYWRkRXZlbnRzKCk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAgUmVzZXRzIG5hbm9TY3JvbGxlcidzIHNjcm9sbGJhci5cclxuICAgICAgQG1ldGhvZCByZXNldFxyXG4gICAgICBAY2hhaW5hYmxlXHJcbiAgICAgIEBleGFtcGxlXHJcbiAgICAgICAgICAkKFwiLm5hbm9cIikubmFub1Njcm9sbGVyKCk7XHJcbiAgICAgKi9cclxuXHJcbiAgICBOYW5vU2Nyb2xsLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgY29udGVudCwgY29udGVudEhlaWdodCwgY29udGVudFBvc2l0aW9uLCBjb250ZW50U3R5bGUsIGNvbnRlbnRTdHlsZU92ZXJmbG93WSwgcGFuZUJvdHRvbSwgcGFuZUhlaWdodCwgcGFuZU91dGVySGVpZ2h0LCBwYW5lVG9wLCBwYXJlbnRNYXhIZWlnaHQsIHJpZ2h0LCBzbGlkZXJIZWlnaHQ7XHJcbiAgICAgIGlmICh0aGlzLmlPU05hdGl2ZVNjcm9sbGluZykge1xyXG4gICAgICAgIHRoaXMuY29udGVudEhlaWdodCA9IHRoaXMuY29udGVudC5zY3JvbGxIZWlnaHQ7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICghdGhpcy4kZWwuZmluZChcIi5cIiArIHRoaXMub3B0aW9ucy5wYW5lQ2xhc3MpLmxlbmd0aCkge1xyXG4gICAgICAgIHRoaXMuZ2VuZXJhdGUoKS5zdG9wKCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHRoaXMuc3RvcHBlZCkge1xyXG4gICAgICAgIHRoaXMucmVzdG9yZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnRlbnQgPSB0aGlzLmNvbnRlbnQ7XHJcbiAgICAgIGNvbnRlbnRTdHlsZSA9IGNvbnRlbnQuc3R5bGU7XHJcbiAgICAgIGNvbnRlbnRTdHlsZU92ZXJmbG93WSA9IGNvbnRlbnRTdHlsZS5vdmVyZmxvd1k7XHJcbiAgICAgIGlmIChCUk9XU0VSX0lTX0lFNykge1xyXG4gICAgICAgIHRoaXMuJGNvbnRlbnQuY3NzKHtcclxuICAgICAgICAgIGhlaWdodDogdGhpcy4kY29udGVudC5oZWlnaHQoKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnRlbnRIZWlnaHQgPSBjb250ZW50LnNjcm9sbEhlaWdodCArIEJST1dTRVJfU0NST0xMQkFSX1dJRFRIO1xyXG4gICAgICBwYXJlbnRNYXhIZWlnaHQgPSBwYXJzZUludCh0aGlzLiRlbC5jc3MoXCJtYXgtaGVpZ2h0XCIpLCAxMCk7XHJcbiAgICAgIGlmIChwYXJlbnRNYXhIZWlnaHQgPiAwKSB7XHJcbiAgICAgICAgdGhpcy4kZWwuaGVpZ2h0KFwiXCIpO1xyXG4gICAgICAgIHRoaXMuJGVsLmhlaWdodChjb250ZW50LnNjcm9sbEhlaWdodCA+IHBhcmVudE1heEhlaWdodCA/IHBhcmVudE1heEhlaWdodCA6IGNvbnRlbnQuc2Nyb2xsSGVpZ2h0KTtcclxuICAgICAgfVxyXG4gICAgICBwYW5lSGVpZ2h0ID0gdGhpcy5wYW5lLm91dGVySGVpZ2h0KGZhbHNlKTtcclxuICAgICAgcGFuZVRvcCA9IHBhcnNlSW50KHRoaXMucGFuZS5jc3MoJ3RvcCcpLCAxMCk7XHJcbiAgICAgIHBhbmVCb3R0b20gPSBwYXJzZUludCh0aGlzLnBhbmUuY3NzKCdib3R0b20nKSwgMTApO1xyXG4gICAgICBwYW5lT3V0ZXJIZWlnaHQgPSBwYW5lSGVpZ2h0ICsgcGFuZVRvcCArIHBhbmVCb3R0b207XHJcbiAgICAgIHNsaWRlckhlaWdodCA9IE1hdGgucm91bmQocGFuZU91dGVySGVpZ2h0IC8gY29udGVudEhlaWdodCAqIHBhbmVIZWlnaHQpO1xyXG4gICAgICBpZiAoc2xpZGVySGVpZ2h0IDwgdGhpcy5vcHRpb25zLnNsaWRlck1pbkhlaWdodCkge1xyXG4gICAgICAgIHNsaWRlckhlaWdodCA9IHRoaXMub3B0aW9ucy5zbGlkZXJNaW5IZWlnaHQ7XHJcbiAgICAgIH0gZWxzZSBpZiAoKHRoaXMub3B0aW9ucy5zbGlkZXJNYXhIZWlnaHQgIT0gbnVsbCkgJiYgc2xpZGVySGVpZ2h0ID4gdGhpcy5vcHRpb25zLnNsaWRlck1heEhlaWdodCkge1xyXG4gICAgICAgIHNsaWRlckhlaWdodCA9IHRoaXMub3B0aW9ucy5zbGlkZXJNYXhIZWlnaHQ7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGNvbnRlbnRTdHlsZU92ZXJmbG93WSA9PT0gU0NST0xMICYmIGNvbnRlbnRTdHlsZS5vdmVyZmxvd1ggIT09IFNDUk9MTCkge1xyXG4gICAgICAgIHNsaWRlckhlaWdodCArPSBCUk9XU0VSX1NDUk9MTEJBUl9XSURUSDtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLm1heFNsaWRlclRvcCA9IHBhbmVPdXRlckhlaWdodCAtIHNsaWRlckhlaWdodDtcclxuICAgICAgdGhpcy5jb250ZW50SGVpZ2h0ID0gY29udGVudEhlaWdodDtcclxuICAgICAgdGhpcy5wYW5lSGVpZ2h0ID0gcGFuZUhlaWdodDtcclxuICAgICAgdGhpcy5wYW5lT3V0ZXJIZWlnaHQgPSBwYW5lT3V0ZXJIZWlnaHQ7XHJcbiAgICAgIHRoaXMuc2xpZGVySGVpZ2h0ID0gc2xpZGVySGVpZ2h0O1xyXG4gICAgICB0aGlzLnBhbmVUb3AgPSBwYW5lVG9wO1xyXG4gICAgICB0aGlzLnNsaWRlci5oZWlnaHQoc2xpZGVySGVpZ2h0KTtcclxuICAgICAgdGhpcy5ldmVudHMuc2Nyb2xsKCk7XHJcbiAgICAgIHRoaXMucGFuZS5zaG93KCk7XHJcbiAgICAgIHRoaXMuaXNBY3RpdmUgPSB0cnVlO1xyXG4gICAgICBpZiAoKGNvbnRlbnQuc2Nyb2xsSGVpZ2h0ID09PSBjb250ZW50LmNsaWVudEhlaWdodCkgfHwgKHRoaXMucGFuZS5vdXRlckhlaWdodCh0cnVlKSA+PSBjb250ZW50LnNjcm9sbEhlaWdodCAmJiBjb250ZW50U3R5bGVPdmVyZmxvd1kgIT09IFNDUk9MTCkpIHtcclxuICAgICAgICB0aGlzLnBhbmUuaGlkZSgpO1xyXG4gICAgICAgIHRoaXMuaXNBY3RpdmUgPSBmYWxzZTtcclxuICAgICAgfSBlbHNlIGlmICh0aGlzLmVsLmNsaWVudEhlaWdodCA9PT0gY29udGVudC5zY3JvbGxIZWlnaHQgJiYgY29udGVudFN0eWxlT3ZlcmZsb3dZID09PSBTQ1JPTEwpIHtcclxuICAgICAgICB0aGlzLnNsaWRlci5oaWRlKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5zbGlkZXIuc2hvdygpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMucGFuZS5jc3Moe1xyXG4gICAgICAgIG9wYWNpdHk6ICh0aGlzLm9wdGlvbnMuYWx3YXlzVmlzaWJsZSA/IDEgOiAnJyksXHJcbiAgICAgICAgdmlzaWJpbGl0eTogKHRoaXMub3B0aW9ucy5hbHdheXNWaXNpYmxlID8gJ3Zpc2libGUnIDogJycpXHJcbiAgICAgIH0pO1xyXG4gICAgICBjb250ZW50UG9zaXRpb24gPSB0aGlzLiRjb250ZW50LmNzcygncG9zaXRpb24nKTtcclxuICAgICAgaWYgKGNvbnRlbnRQb3NpdGlvbiA9PT0gJ3N0YXRpYycgfHwgY29udGVudFBvc2l0aW9uID09PSAncmVsYXRpdmUnKSB7XHJcbiAgICAgICAgcmlnaHQgPSBwYXJzZUludCh0aGlzLiRjb250ZW50LmNzcygncmlnaHQnKSwgMTApO1xyXG4gICAgICAgIGlmIChyaWdodCkge1xyXG4gICAgICAgICAgdGhpcy4kY29udGVudC5jc3Moe1xyXG4gICAgICAgICAgICByaWdodDogJycsXHJcbiAgICAgICAgICAgIG1hcmdpblJpZ2h0OiByaWdodFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgIEBtZXRob2Qgc2Nyb2xsXHJcbiAgICAgIEBwcml2YXRlXHJcbiAgICAgIEBleGFtcGxlXHJcbiAgICAgICAgICAkKFwiLm5hbm9cIikubmFub1Njcm9sbGVyKHsgc2Nyb2xsOiAndG9wJyB9KTtcclxuICAgICAqL1xyXG5cclxuICAgIE5hbm9TY3JvbGwucHJvdG90eXBlLnNjcm9sbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAoIXRoaXMuaXNBY3RpdmUpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5zbGlkZXJZID0gTWF0aC5tYXgoMCwgdGhpcy5zbGlkZXJZKTtcclxuICAgICAgdGhpcy5zbGlkZXJZID0gTWF0aC5taW4odGhpcy5tYXhTbGlkZXJUb3AsIHRoaXMuc2xpZGVyWSk7XHJcbiAgICAgIHRoaXMuJGNvbnRlbnQuc2Nyb2xsVG9wKHRoaXMubWF4U2Nyb2xsVG9wICogdGhpcy5zbGlkZXJZIC8gdGhpcy5tYXhTbGlkZXJUb3ApO1xyXG4gICAgICBpZiAoIXRoaXMuaU9TTmF0aXZlU2Nyb2xsaW5nKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVTY3JvbGxWYWx1ZXMoKTtcclxuICAgICAgICB0aGlzLnNldE9uU2Nyb2xsU3R5bGVzKCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAgU2Nyb2xsIGF0IHRoZSBib3R0b20gd2l0aCBhbiBvZmZzZXQgdmFsdWVcclxuICAgICAgQG1ldGhvZCBzY3JvbGxCb3R0b21cclxuICAgICAgQHBhcmFtIG9mZnNldFkge051bWJlcn1cclxuICAgICAgQGNoYWluYWJsZVxyXG4gICAgICBAZXhhbXBsZVxyXG4gICAgICAgICAgJChcIi5uYW5vXCIpLm5hbm9TY3JvbGxlcih7IHNjcm9sbEJvdHRvbTogdmFsdWUgfSk7XHJcbiAgICAgKi9cclxuXHJcbiAgICBOYW5vU2Nyb2xsLnByb3RvdHlwZS5zY3JvbGxCb3R0b20gPSBmdW5jdGlvbihvZmZzZXRZKSB7XHJcbiAgICAgIGlmICghdGhpcy5pc0FjdGl2ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLiRjb250ZW50LnNjcm9sbFRvcCh0aGlzLmNvbnRlbnRIZWlnaHQgLSB0aGlzLiRjb250ZW50LmhlaWdodCgpIC0gb2Zmc2V0WSkudHJpZ2dlcihNT1VTRVdIRUVMKTtcclxuICAgICAgdGhpcy5zdG9wKCkucmVzdG9yZSgpO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICBTY3JvbGwgYXQgdGhlIHRvcCB3aXRoIGFuIG9mZnNldCB2YWx1ZVxyXG4gICAgICBAbWV0aG9kIHNjcm9sbFRvcFxyXG4gICAgICBAcGFyYW0gb2Zmc2V0WSB7TnVtYmVyfVxyXG4gICAgICBAY2hhaW5hYmxlXHJcbiAgICAgIEBleGFtcGxlXHJcbiAgICAgICAgICAkKFwiLm5hbm9cIikubmFub1Njcm9sbGVyKHsgc2Nyb2xsVG9wOiB2YWx1ZSB9KTtcclxuICAgICAqL1xyXG5cclxuICAgIE5hbm9TY3JvbGwucHJvdG90eXBlLnNjcm9sbFRvcCA9IGZ1bmN0aW9uKG9mZnNldFkpIHtcclxuICAgICAgaWYgKCF0aGlzLmlzQWN0aXZlKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuJGNvbnRlbnQuc2Nyb2xsVG9wKCtvZmZzZXRZKS50cmlnZ2VyKE1PVVNFV0hFRUwpO1xyXG4gICAgICB0aGlzLnN0b3AoKS5yZXN0b3JlKCk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgIFNjcm9sbCB0byBhbiBlbGVtZW50XHJcbiAgICAgIEBtZXRob2Qgc2Nyb2xsVG9cclxuICAgICAgQHBhcmFtIG5vZGUge05vZGV9IEEgbm9kZSB0byBzY3JvbGwgdG8uXHJcbiAgICAgIEBjaGFpbmFibGVcclxuICAgICAgQGV4YW1wbGVcclxuICAgICAgICAgICQoXCIubmFub1wiKS5uYW5vU2Nyb2xsZXIoeyBzY3JvbGxUbzogJCgnI2Ffbm9kZScpIH0pO1xyXG4gICAgICovXHJcblxyXG4gICAgTmFub1Njcm9sbC5wcm90b3R5cGUuc2Nyb2xsVG8gPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgICAgIGlmICghdGhpcy5pc0FjdGl2ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnNjcm9sbFRvcCh0aGlzLiRlbC5maW5kKG5vZGUpLmdldCgwKS5vZmZzZXRUb3ApO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICBUbyBzdG9wIHRoZSBvcGVyYXRpb24uXHJcbiAgICAgIFRoaXMgb3B0aW9uIHdpbGwgdGVsbCB0aGUgcGx1Z2luIHRvIGRpc2FibGUgYWxsIGV2ZW50IGJpbmRpbmdzIGFuZCBoaWRlIHRoZSBnYWRnZXQgc2Nyb2xsYmFyIGZyb20gdGhlIFVJLlxyXG4gICAgICBAbWV0aG9kIHN0b3BcclxuICAgICAgQGNoYWluYWJsZVxyXG4gICAgICBAZXhhbXBsZVxyXG4gICAgICAgICAgJChcIi5uYW5vXCIpLm5hbm9TY3JvbGxlcih7IHN0b3A6IHRydWUgfSk7XHJcbiAgICAgKi9cclxuXHJcbiAgICBOYW5vU2Nyb2xsLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIGlmIChjQUYgJiYgdGhpcy5zY3JvbGxSQUYpIHtcclxuICAgICAgICBjQUYodGhpcy5zY3JvbGxSQUYpO1xyXG4gICAgICAgIHRoaXMuc2Nyb2xsUkFGID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnN0b3BwZWQgPSB0cnVlO1xyXG4gICAgICB0aGlzLnJlbW92ZUV2ZW50cygpO1xyXG4gICAgICBpZiAoIXRoaXMuaU9TTmF0aXZlU2Nyb2xsaW5nKSB7XHJcbiAgICAgICAgdGhpcy5wYW5lLmhpZGUoKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICBEZXN0cm95cyBuYW5vU2Nyb2xsZXIgYW5kIHJlc3RvcmVzIGJyb3dzZXIncyBuYXRpdmUgc2Nyb2xsYmFyLlxyXG4gICAgICBAbWV0aG9kIGRlc3Ryb3lcclxuICAgICAgQGNoYWluYWJsZVxyXG4gICAgICBAZXhhbXBsZVxyXG4gICAgICAgICAgJChcIi5uYW5vXCIpLm5hbm9TY3JvbGxlcih7IGRlc3Ryb3k6IHRydWUgfSk7XHJcbiAgICAgKi9cclxuXHJcbiAgICBOYW5vU2Nyb2xsLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIGlmICghdGhpcy5zdG9wcGVkKSB7XHJcbiAgICAgICAgdGhpcy5zdG9wKCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCF0aGlzLmlPU05hdGl2ZVNjcm9sbGluZyAmJiB0aGlzLnBhbmUubGVuZ3RoKSB7XHJcbiAgICAgICAgdGhpcy5wYW5lLnJlbW92ZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChCUk9XU0VSX0lTX0lFNykge1xyXG4gICAgICAgIHRoaXMuJGNvbnRlbnQuaGVpZ2h0KCcnKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLiRjb250ZW50LnJlbW92ZUF0dHIoJ3RhYmluZGV4Jyk7XHJcbiAgICAgIGlmICh0aGlzLiRlbC5oYXNDbGFzcyh0aGlzLm9wdGlvbnMuZW5hYmxlZENsYXNzKSkge1xyXG4gICAgICAgIHRoaXMuJGVsLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5lbmFibGVkQ2xhc3MpO1xyXG4gICAgICAgIHRoaXMuJGNvbnRlbnQuY3NzKHtcclxuICAgICAgICAgIHJpZ2h0OiAnJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgIFRvIGZsYXNoIHRoZSBzY3JvbGxiYXIgZ2FkZ2V0IGZvciBhbiBhbW91bnQgb2YgdGltZSBkZWZpbmVkIGluIHBsdWdpbiBzZXR0aW5ncyAoZGVmYXVsdHMgdG8gMSw1cykuXHJcbiAgICAgIFVzZWZ1bCBpZiB5b3Ugd2FudCB0byBzaG93IHRoZSB1c2VyIChlLmcuIG9uIHBhZ2Vsb2FkKSB0aGF0IHRoZXJlIGlzIG1vcmUgY29udGVudCB3YWl0aW5nIGZvciBoaW0uXHJcbiAgICAgIEBtZXRob2QgZmxhc2hcclxuICAgICAgQGNoYWluYWJsZVxyXG4gICAgICBAZXhhbXBsZVxyXG4gICAgICAgICAgJChcIi5uYW5vXCIpLm5hbm9TY3JvbGxlcih7IGZsYXNoOiB0cnVlIH0pO1xyXG4gICAgICovXHJcblxyXG4gICAgTmFub1Njcm9sbC5wcm90b3R5cGUuZmxhc2ggPSBmdW5jdGlvbigpIHtcclxuICAgICAgaWYgKHRoaXMuaU9TTmF0aXZlU2Nyb2xsaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICghdGhpcy5pc0FjdGl2ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICAgIHRoaXMucGFuZS5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuZmxhc2hlZENsYXNzKTtcclxuICAgICAgc2V0VGltZW91dCgoZnVuY3Rpb24oX3RoaXMpIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBfdGhpcy5wYW5lLnJlbW92ZUNsYXNzKF90aGlzLm9wdGlvbnMuZmxhc2hlZENsYXNzKTtcclxuICAgICAgICB9O1xyXG4gICAgICB9KSh0aGlzKSwgdGhpcy5vcHRpb25zLmZsYXNoRGVsYXkpO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIE5hbm9TY3JvbGw7XHJcblxyXG4gIH0pKCk7XHJcbiAgJC5mbi5uYW5vU2Nyb2xsZXIgPSBmdW5jdGlvbihzZXR0aW5ncykge1xyXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgdmFyIG9wdGlvbnMsIHNjcm9sbGJhcjtcclxuICAgICAgaWYgKCEoc2Nyb2xsYmFyID0gdGhpcy5uYW5vc2Nyb2xsZXIpKSB7XHJcbiAgICAgICAgb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBkZWZhdWx0cywgc2V0dGluZ3MpO1xyXG4gICAgICAgIHRoaXMubmFub3Njcm9sbGVyID0gc2Nyb2xsYmFyID0gbmV3IE5hbm9TY3JvbGwodGhpcywgb3B0aW9ucyk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHNldHRpbmdzICYmIHR5cGVvZiBzZXR0aW5ncyA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICQuZXh0ZW5kKHNjcm9sbGJhci5vcHRpb25zLCBzZXR0aW5ncyk7XHJcbiAgICAgICAgaWYgKHNldHRpbmdzLnNjcm9sbEJvdHRvbSAhPSBudWxsKSB7XHJcbiAgICAgICAgICByZXR1cm4gc2Nyb2xsYmFyLnNjcm9sbEJvdHRvbShzZXR0aW5ncy5zY3JvbGxCb3R0b20pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc2V0dGluZ3Muc2Nyb2xsVG9wICE9IG51bGwpIHtcclxuICAgICAgICAgIHJldHVybiBzY3JvbGxiYXIuc2Nyb2xsVG9wKHNldHRpbmdzLnNjcm9sbFRvcCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzZXR0aW5ncy5zY3JvbGxUbykge1xyXG4gICAgICAgICAgcmV0dXJuIHNjcm9sbGJhci5zY3JvbGxUbyhzZXR0aW5ncy5zY3JvbGxUbyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzZXR0aW5ncy5zY3JvbGwgPT09ICdib3R0b20nKSB7XHJcbiAgICAgICAgICByZXR1cm4gc2Nyb2xsYmFyLnNjcm9sbEJvdHRvbSgwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHNldHRpbmdzLnNjcm9sbCA9PT0gJ3RvcCcpIHtcclxuICAgICAgICAgIHJldHVybiBzY3JvbGxiYXIuc2Nyb2xsVG9wKDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc2V0dGluZ3Muc2Nyb2xsICYmIHNldHRpbmdzLnNjcm9sbCBpbnN0YW5jZW9mICQpIHtcclxuICAgICAgICAgIHJldHVybiBzY3JvbGxiYXIuc2Nyb2xsVG8oc2V0dGluZ3Muc2Nyb2xsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHNldHRpbmdzLnN0b3ApIHtcclxuICAgICAgICAgIHJldHVybiBzY3JvbGxiYXIuc3RvcCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc2V0dGluZ3MuZGVzdHJveSkge1xyXG4gICAgICAgICAgcmV0dXJuIHNjcm9sbGJhci5kZXN0cm95KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzZXR0aW5ncy5mbGFzaCkge1xyXG4gICAgICAgICAgcmV0dXJuIHNjcm9sbGJhci5mbGFzaCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gc2Nyb2xsYmFyLnJlc2V0KCk7XHJcbiAgICB9KTtcclxuICB9O1xyXG4gICQuZm4ubmFub1Njcm9sbGVyLkNvbnN0cnVjdG9yID0gTmFub1Njcm9sbDtcclxufSk7XHJcblxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1qcXVlcnkubmFub3Njcm9sbGVyLmpzLm1hcFxyXG4iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xyXG4kKFwiLm5hbm9cIikubmFub1Njcm9sbGVyKHsgYWx3YXlzVmlzaWJsZTogdHJ1ZSB9KTtcclxufSk7IiwiIiwiJChcIi5zY3JvbGxcIikuY2xpY2soZnVuY3Rpb24oZXZlbnQpeyAgIFxyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICQoJ2h0bWwsYm9keScpLmFuaW1hdGUoe3Njcm9sbFRvcDokKHRoaXMuaGFzaCkub2Zmc2V0KCkudG9wfSwgMTAwMCk7XHJcbiAgfSk7IiwiXHJcbiQod2luZG93KS5iaW5kKCcgbG9hZCByZXNpemUgb3JpZW50YXRpb25DaGFuZ2UgJywgZnVuY3Rpb24gKCkge1xyXG4gICB2YXIgZm9vdGVyID0gJChcIiNmb290ZXItY29udGFpbmVyXCIpO1xyXG4gICB2YXIgcG9zID0gZm9vdGVyLnBvc2l0aW9uKCk7XHJcbiAgIHZhciBoZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCk7XHJcbiAgIGhlaWdodCA9IGhlaWdodCAtIHBvcy50b3A7XHJcbiAgIGhlaWdodCA9IGhlaWdodCAtIGZvb3Rlci5oZWlnaHQoKSAtMTtcclxuXHJcbiAgIGZ1bmN0aW9uIHN0aWNreUZvb3RlcigpIHtcclxuICAgICBmb290ZXIuY3NzKHtcclxuICAgICAgICAgJ21hcmdpbi10b3AnOiBoZWlnaHQgKyAncHgnXHJcbiAgICAgfSk7XHJcbiAgIH1cclxuXHJcbiAgIGlmIChoZWlnaHQgPiAwKSB7XHJcbiAgICAgc3RpY2t5Rm9vdGVyKCk7XHJcbiAgIH1cclxufSk7XHJcbiIsIi8qIEVuYWJsZSBkZWVwIGxpbmtpbmcgZnJvbSBleHRlcm5hbCBwYWdlcyAqL1xyXG5cclxuaWYod2luZG93LmxvY2F0aW9uLmhhc2gpIHtcclxuICB2YXIgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xyXG4gICQoJy5hY2NvcmRpb24gYVtocmVmPVwiJyArIGhhc2ggKyAnXCJdJykudHJpZ2dlcignY2xpY2snKTtcclxuICAkKCcudGFicyBhW2hyZWY9XCInICsgaGFzaCArICdcIl0nKS50cmlnZ2VyKCdjbGljaycpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBvcGVuX3RhYih0YWJfaWQscGFuZWwpIHtcclxuICAkKFwiI1wiK3RhYl9pZCkuZm91bmRhdGlvbihcInNlbGVjdFRhYlwiLCQoXCIjXCIrcGFuZWwpKTtcclxufVxyXG5cclxuXHJcbi8qRW5hYmxpbmcgT24tcGFnZSBkZWVwLWxpbmtpbmdcclxuKlxyXG4qIEFkZCBpbnRlcm5hbCBsaW5rIGNsYXNzIHRvIGVhY2ggb24gcGFnZSBpbnRlcm5hbCBsaW5rIHRoYXQgeW91IGNyZWF0ZS5cclxuKlxyXG4qL1xyXG5cclxuXHJcbmZ1bmN0aW9uIGNoYW5nZVRhYkhhbmRsZXIodGFiR3JvdXBJZCwgdGFiSWQpIHtcclxuICByZXR1cm4gZnVuY3Rpb24oZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyIHJldCA9ICQodGFiR3JvdXBJZCkuZm91bmRhdGlvbihcInNlbGVjdFRhYlwiLCAkKHRhYklkKSk7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG59XHJcblxyXG4kKFwiLmNvbGxlZ2UtY291bnNlbGluZ1wiKS5vbignY2xpY2snLGNoYW5nZVRhYkhhbmRsZXIoXCIjd29ya2luZy13aXRoLXVzXCIsXCIjY29sbGVnZS1jb3Vuc2VsaW5nXCIpKTtcclxuJChcIi5jb3hzd2Fpbi1wcm9ncmFtXCIpLm9uKCdjbGljaycsY2hhbmdlVGFiSGFuZGxlcihcIiN3b3JraW5nLXdpdGgtdXNcIixcIiNjb3hzd2Fpbi1wcm9ncmFtXCIpKTtcclxuJChcIi5pbnRlcm5hbC1hcHBsaWNhbnRzXCIpLm9uKCdjbGljaycsY2hhbmdlVGFiSGFuZGxlcihcIiN3b3JraW5nLXdpdGgtdXNcIixcIiNpbnRlcm5hbC1hcHBsaWNhbnRzXCIpKTtcclxuJChcIi5nYXAteWVhci1hZHZpc2luZ1wiKS5vbignY2xpY2snLGNoYW5nZVRhYkhhbmRsZXIoXCIjd29ya2luZy13aXRoLXVzXCIsXCIjZ2FwLXllYXItYWR2aXNpbmdcIikpO1xyXG4kKFwiLnJlcG9ydHMtZnJvbS10aGUtZnJvbnRcIikub24oJ2NsaWNrJyxjaGFuZ2VUYWJIYW5kbGVyKFwiI3dvcmtpbmctd2l0aC11c1wiLFwiI3JlcG9ydHMtZnJvbS10aGUtZnJvbnRcIikpO1xyXG4kKFwiLm91ci1hcHByb2FjaFwiKS5vbignY2xpY2snLGNoYW5nZVRhYkhhbmRsZXIoXCIjd29ya2luZy13aXRoLXVzXCIsXCIjb3VyLWFwcHJvYWNoXCIpKTtcclxuJChcIi5jb3Vuc2VsaW5nLXRlc3RpbW9uaWFsc1wiKS5vbignY2xpY2snLGNoYW5nZVRhYkhhbmRsZXIoXCIjd29ya2luZy13aXRoLXVzXCIsXCIjY291bnNlbGluZy10ZXN0aW1vbmlhbHNcIikpO1xyXG4kKFwiLnJvd2luZy1jYW1wLXRlc3RpbW9uaWFsc1wiKS5vbignY2xpY2snLGNoYW5nZVRhYkhhbmRsZXIoXCIjd29ya2luZy13aXRoLXVzXCIsXCIjcm93aW5nLWNhbXAtdGVzdGltb25pYWxzXCIpKTtcclxuJChcIi5jb3hzd2Fpbi10ZXN0aW1vbmlhbHNcIikub24oJ2NsaWNrJyxjaGFuZ2VUYWJIYW5kbGVyKFwiI3dvcmtpbmctd2l0aC11c1wiLFwiI2NveHN3YWluLXRlc3RpbW9uaWFsc1wiKSk7XHJcblxyXG4vL1Jvd2luZyBDYW1wIEludGVybmFsIERlZXAgTGlua2luZ1xyXG4kKFwiLmNhbXAtb3ZlcnZpZXdcIikub24oJ2NsaWNrJyxjaGFuZ2VUYWJIYW5kbGVyKFwiI3Jvd2luZy1jYW1wLXRhYnNcIixcIiNjYW1wLW92ZXJ2aWV3XCIpKTtcclxuJChcIi5jYW1wLXN0YWZmXCIpLm9uKCdjbGljaycsY2hhbmdlVGFiSGFuZGxlcihcIiNyb3dpbmctY2FtcC10YWJzXCIsXCIjY2FtcC1zdGFmZlwiKSk7XHJcbi8vJChcIi5jYW1wLWRldGFpbHNcIikub24oJ2NsaWNrJyxjaGFuZ2VUYWJIYW5kbGVyKFwiI3Jvd2luZy1jYW1wLXRhYnNcIixcIiNjYW1wLWRldGFpbHNcIikpO1xyXG4kKFwiLmNhbXAtcmVnaXN0cmF0aW9uXCIpLm9uKCdjbGljaycsIGNoYW5nZVRhYkhhbmRsZXIoJyNyb3dpbmctY2FtcC10YWJzJywnI2NhbXAtcmVnaXN0cmF0aW9uJykpO1xyXG4kKFwiLmNhbXAtc2NoZWR1bGVcIikub24oJ2NsaWNrJyxjaGFuZ2VUYWJIYW5kbGVyKFwiI3Jvd2luZy1jYW1wLXRhYnNcIixcIiNjYW1wLXNjaGVkdWxlXCIpKTtcclxuXHJcbi8vQWJvdXQgVXMgSW50ZXJuYWwgRGVlcCBMaW5raW5nXHJcbiQoXCIub3ZlcnZpZXdcIikub24oJ2NsaWNrJyxjaGFuZ2VUYWJIYW5kbGVyKFwiI2Fib3V0LXVzXCIsXCIjb3ZlcnZpZXdcIikpO1xyXG4kKFwiLmxlYWRlcnNoaXBcIikub24oJ2NsaWNrJyxjaGFuZ2VUYWJIYW5kbGVyKFwiI2Fib3V0LXVzXCIsXCIjbGVhZGVyc2hpcFwiKSk7XHJcbiQoXCIuY291bnNlbGluZy1hc3NvY2lhdGVzXCIpLm9uKCdjbGljaycsY2hhbmdlVGFiSGFuZGxlcihcIiNhYm91dC11c1wiLFwiI2NvdW5zZWxpbmctYXNzb2NpYXRlc1wiKSk7XHJcbiQoXCIuY294aW5nLWFzc29jaWF0ZXNcIikub24oJ2NsaWNrJyxjaGFuZ2VUYWJIYW5kbGVyKFwiI2Fib3V0LXVzXCIsXCIjY294aW5nLWFzc29jaWF0ZXNcIikpO1xyXG4kKFwiLmludGVybmF0aW9uYWwtYXNzb2NpYXRlc1wiKS5vbignY2xpY2snLGNoYW5nZVRhYkhhbmRsZXIoXCIjYWJvdXQtdXNcIixcIiNpbnRlcm5hdGlvbmFsLWFzc29jaWF0ZXNcIikpO1xyXG4kKFwiLmFkbWluaXN0cmF0aXZlLWFzc29jaWF0ZXNcIikub24oJ2NsaWNrJyxjaGFuZ2VUYWJIYW5kbGVyKFwiI2Fib3V0LXVzXCIsXCIjYWRtaW5pc3RyYXRpdmUtYXNzb2NpYXRlc1wiKSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9

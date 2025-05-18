var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target2, value) => __defProp(target2, "name", { value, configurable: true });
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var _a, _b, _c, _d, _e, _f, _g;
import { P as Phaser$1, c as commonjsGlobal$1, g as getAugmentedNamespace, p as phaserExports } from "./phaser-CdQw7D6z.js";
(/* @__PURE__ */ __name(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  __name(getFetchOpts, "getFetchOpts");
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
  __name(processPreload, "processPreload");
}, "polyfill"))();
const _ScaleFlow = class _ScaleFlow {
  constructor(config2) {
    __publicField(this, "game");
    __publicField(this, "canvas");
    __publicField(this, "parent");
    __publicField(this, "guide");
    const width = config2.width;
    const height = config2.height;
    _ScaleFlow.width = width;
    _ScaleFlow.height = height;
    _ScaleFlow.center = new Phaser$1.Math.Vector2(width / 2, height / 2);
    _ScaleFlow.isLandscape = _ScaleFlow.width > _ScaleFlow.height;
    _ScaleFlow.gameZone = new Phaser$1.Geom.Rectangle(0, 0, width, height);
    _ScaleFlow.uiZone = new Phaser$1.Geom.Rectangle(0, 0, width, height);
    _ScaleFlow.cameras = /* @__PURE__ */ new Set();
    config2.callbacks = {
      postBoot: /* @__PURE__ */ __name(() => this.gameBootHandler(), "postBoot")
    };
    this.game = new Phaser$1.Game(config2);
  }
  gameBootHandler() {
    _ScaleFlow.scaleManager = this.game.scale;
    _ScaleFlow.scaleManager.on("resize", () => this.onResizeHandler());
    this.canvas = this.game.canvas;
    this.parent = this.canvas.parentElement;
    this.guide = document.getElementById("guide");
    window.setTimeout(() => this.onResizeHandler(), 16);
  }
  onResizeHandler() {
    const parentBounds = this.parent.getBoundingClientRect();
    const canvasBounds = this.canvas.getBoundingClientRect();
    const guideBounds = this.guide.getBoundingClientRect();
    const widthScale = parentBounds.width / _ScaleFlow.width;
    const heightScale = parentBounds.height / _ScaleFlow.height;
    const scale = Math.max(widthScale, heightScale);
    const widthDiff = parentBounds.width - widthScale;
    const heightDiff = parentBounds.height - heightScale;
    const widthDiffScale = widthDiff * (1 / scale);
    const heightDiffScale = heightDiff * (1 / scale);
    const leftBounds = _ScaleFlow.width / 2 - widthDiffScale / 2;
    const rightBounds = _ScaleFlow.width / 2 + widthDiffScale / 2;
    const topBounds = _ScaleFlow.height / 2 - heightDiffScale / 2;
    const bottomBounds = _ScaleFlow.height / 2 + heightDiffScale / 2;
    _ScaleFlow.uiZone.left = leftBounds;
    _ScaleFlow.uiZone.right = rightBounds;
    _ScaleFlow.uiZone.top = topBounds;
    _ScaleFlow.uiZone.bottom = bottomBounds;
    const scaleX = guideBounds.width / canvasBounds.width;
    const scaleY = guideBounds.height / canvasBounds.height;
    const scaleFactor = Math.min(scaleX, scaleY);
    _ScaleFlow.scaleFactor = scaleFactor;
    _ScaleFlow.cameras.forEach((camera) => {
      camera.zoom = scaleFactor;
    });
    this.game.events.emit(_ScaleFlow.RESIZE);
  }
  static addCamera(camera) {
    this.cameras.add(camera);
    camera.zoom = _ScaleFlow.scaleFactor;
  }
  static removeCamera(camera) {
    this.cameras.delete(camera);
  }
  static getX(x) {
    if (typeof x === "number") {
      return x;
    }
    const gameWidth = this.scaleManager.width;
    const percentNum = parseInt(x, 10);
    return gameWidth * (percentNum / 100);
  }
  static getY(y) {
    if (typeof y === "number") {
      return y;
    }
    const gameHeight = this.scaleManager.height;
    const percentNum = parseInt(y, 10);
    return gameHeight * (percentNum / 100);
  }
  static getUIX(x) {
    if (typeof x === "number") {
      return x;
    }
    const gameWidth = _ScaleFlow.uiZone.width;
    const percentNum = parseInt(x, 10);
    return gameWidth * (percentNum / 100);
  }
  static getUIY(y) {
    if (typeof y === "number") {
      return y;
    }
    const gameHeight = _ScaleFlow.uiZone.height;
    const percentNum = parseInt(y, 10);
    return gameHeight * (percentNum / 100);
  }
};
__name(_ScaleFlow, "ScaleFlow");
__publicField(_ScaleFlow, "scaleManager");
__publicField(_ScaleFlow, "cameras");
__publicField(_ScaleFlow, "gameZone");
__publicField(_ScaleFlow, "uiZone");
__publicField(_ScaleFlow, "width");
__publicField(_ScaleFlow, "height");
__publicField(_ScaleFlow, "center");
__publicField(_ScaleFlow, "isLandscape");
__publicField(_ScaleFlow, "scaleFactor", 1);
__publicField(_ScaleFlow, "scaleFactor2", 1);
__publicField(_ScaleFlow, "RESIZE", "scaleflowresize");
let ScaleFlow = _ScaleFlow;
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
__name(getDefaultExportFromCjs, "getDefaultExportFromCjs");
var eventemitter3 = { exports: {} };
var hasRequiredEventemitter3;
function requireEventemitter3() {
  if (hasRequiredEventemitter3) return eventemitter3.exports;
  hasRequiredEventemitter3 = 1;
  (function(module) {
    var has = Object.prototype.hasOwnProperty, prefix = "~";
    function Events2() {
    }
    __name(Events2, "Events");
    if (Object.create) {
      Events2.prototype = /* @__PURE__ */ Object.create(null);
      if (!new Events2().__proto__) prefix = false;
    }
    function EE(fn, context, once) {
      this.fn = fn;
      this.context = context;
      this.once = once || false;
    }
    __name(EE, "EE");
    function addListener(emitter, event, fn, context, once) {
      if (typeof fn !== "function") {
        throw new TypeError("The listener must be a function");
      }
      var listener = new EE(fn, context || emitter, once), evt = prefix ? prefix + event : event;
      if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
      else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
      else emitter._events[evt] = [emitter._events[evt], listener];
      return emitter;
    }
    __name(addListener, "addListener");
    function clearEvent(emitter, evt) {
      if (--emitter._eventsCount === 0) emitter._events = new Events2();
      else delete emitter._events[evt];
    }
    __name(clearEvent, "clearEvent");
    function EventEmitter2() {
      this._events = new Events2();
      this._eventsCount = 0;
    }
    __name(EventEmitter2, "EventEmitter");
    EventEmitter2.prototype.eventNames = /* @__PURE__ */ __name(function eventNames() {
      var names = [], events, name;
      if (this._eventsCount === 0) return names;
      for (name in events = this._events) {
        if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
      }
      if (Object.getOwnPropertySymbols) {
        return names.concat(Object.getOwnPropertySymbols(events));
      }
      return names;
    }, "eventNames");
    EventEmitter2.prototype.listeners = /* @__PURE__ */ __name(function listeners(event) {
      var evt = prefix ? prefix + event : event, handlers = this._events[evt];
      if (!handlers) return [];
      if (handlers.fn) return [handlers.fn];
      for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
        ee[i] = handlers[i].fn;
      }
      return ee;
    }, "listeners");
    EventEmitter2.prototype.listenerCount = /* @__PURE__ */ __name(function listenerCount(event) {
      var evt = prefix ? prefix + event : event, listeners = this._events[evt];
      if (!listeners) return 0;
      if (listeners.fn) return 1;
      return listeners.length;
    }, "listenerCount");
    EventEmitter2.prototype.emit = /* @__PURE__ */ __name(function emit(event, a1, a2, a3, a4, a5) {
      var evt = prefix ? prefix + event : event;
      if (!this._events[evt]) return false;
      var listeners = this._events[evt], len = arguments.length, args, i;
      if (listeners.fn) {
        if (listeners.once) this.removeListener(event, listeners.fn, void 0, true);
        switch (len) {
          case 1:
            return listeners.fn.call(listeners.context), true;
          case 2:
            return listeners.fn.call(listeners.context, a1), true;
          case 3:
            return listeners.fn.call(listeners.context, a1, a2), true;
          case 4:
            return listeners.fn.call(listeners.context, a1, a2, a3), true;
          case 5:
            return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
          case 6:
            return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
        }
        for (i = 1, args = new Array(len - 1); i < len; i++) {
          args[i - 1] = arguments[i];
        }
        listeners.fn.apply(listeners.context, args);
      } else {
        var length = listeners.length, j;
        for (i = 0; i < length; i++) {
          if (listeners[i].once) this.removeListener(event, listeners[i].fn, void 0, true);
          switch (len) {
            case 1:
              listeners[i].fn.call(listeners[i].context);
              break;
            case 2:
              listeners[i].fn.call(listeners[i].context, a1);
              break;
            case 3:
              listeners[i].fn.call(listeners[i].context, a1, a2);
              break;
            case 4:
              listeners[i].fn.call(listeners[i].context, a1, a2, a3);
              break;
            default:
              if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
                args[j - 1] = arguments[j];
              }
              listeners[i].fn.apply(listeners[i].context, args);
          }
        }
      }
      return true;
    }, "emit");
    EventEmitter2.prototype.on = /* @__PURE__ */ __name(function on(event, fn, context) {
      return addListener(this, event, fn, context, false);
    }, "on");
    EventEmitter2.prototype.once = /* @__PURE__ */ __name(function once(event, fn, context) {
      return addListener(this, event, fn, context, true);
    }, "once");
    EventEmitter2.prototype.removeListener = /* @__PURE__ */ __name(function removeListener(event, fn, context, once) {
      var evt = prefix ? prefix + event : event;
      if (!this._events[evt]) return this;
      if (!fn) {
        clearEvent(this, evt);
        return this;
      }
      var listeners = this._events[evt];
      if (listeners.fn) {
        if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
          clearEvent(this, evt);
        }
      } else {
        for (var i = 0, events = [], length = listeners.length; i < length; i++) {
          if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
            events.push(listeners[i]);
          }
        }
        if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
        else clearEvent(this, evt);
      }
      return this;
    }, "removeListener");
    EventEmitter2.prototype.removeAllListeners = /* @__PURE__ */ __name(function removeAllListeners(event) {
      var evt;
      if (event) {
        evt = prefix ? prefix + event : event;
        if (this._events[evt]) clearEvent(this, evt);
      } else {
        this._events = new Events2();
        this._eventsCount = 0;
      }
      return this;
    }, "removeAllListeners");
    EventEmitter2.prototype.off = EventEmitter2.prototype.removeListener;
    EventEmitter2.prototype.addListener = EventEmitter2.prototype.on;
    EventEmitter2.prefixed = prefix;
    EventEmitter2.EventEmitter = EventEmitter2;
    {
      module.exports = EventEmitter2;
    }
  })(eventemitter3);
  return eventemitter3.exports;
}
__name(requireEventemitter3, "requireEventemitter3");
var eventemitter3Exports = requireEventemitter3();
var EventEmitter$1 = /* @__PURE__ */ getDefaultExportFromCjs(eventemitter3Exports);
var util;
(function(util2) {
  util2.assertEqual = (val) => val;
  function assertIs(_arg) {
  }
  __name(assertIs, "assertIs");
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  __name(assertNever, "assertNever");
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  __name(joinValues, "joinValues");
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
const ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
const getParsedType = /* @__PURE__ */ __name((data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
}, "getParsedType");
const ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
const quotelessJson = /* @__PURE__ */ __name((obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
}, "quotelessJson");
const _ZodError = class _ZodError extends Error {
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  get errors() {
    return this.issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = /* @__PURE__ */ __name((error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    }, "processError");
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
        fieldErrors[sub.path[0]].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
__name(_ZodError, "ZodError");
let ZodError = _ZodError;
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};
const errorMap = /* @__PURE__ */ __name((issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
}, "errorMap");
let overrideErrorMap = errorMap;
function setErrorMap(map) {
  overrideErrorMap = map;
}
__name(setErrorMap, "setErrorMap");
function getErrorMap() {
  return overrideErrorMap;
}
__name(getErrorMap, "getErrorMap");
const makeIssue = /* @__PURE__ */ __name((params) => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
}, "makeIssue");
const EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      ctx.schemaErrorMap,
      overrideMap,
      overrideMap === errorMap ? void 0 : errorMap
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
__name(addIssueToContext, "addIssueToContext");
const _ParseStatus = class _ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
__name(_ParseStatus, "ParseStatus");
let ParseStatus = _ParseStatus;
const INVALID = Object.freeze({
  status: "aborted"
});
const DIRTY = /* @__PURE__ */ __name((value) => ({ status: "dirty", value }), "DIRTY");
const OK = /* @__PURE__ */ __name((value) => ({ status: "valid", value }), "OK");
const isAborted = /* @__PURE__ */ __name((x) => x.status === "aborted", "isAborted");
const isDirty = /* @__PURE__ */ __name((x) => x.status === "dirty", "isDirty");
const isValid = /* @__PURE__ */ __name((x) => x.status === "valid", "isValid");
const isAsync = /* @__PURE__ */ __name((x) => typeof Promise !== "undefined" && x instanceof Promise, "isAsync");
function __classPrivateFieldGet$1(receiver, state, kind, f) {
  if (typeof state === "function" ? receiver !== state || true : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return state.get(receiver);
}
__name(__classPrivateFieldGet$1, "__classPrivateFieldGet$1");
function __classPrivateFieldSet$1(receiver, state, value, kind, f) {
  if (typeof state === "function" ? receiver !== state || true : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return state.set(receiver, value), value;
}
__name(__classPrivateFieldSet$1, "__classPrivateFieldSet$1");
typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message === null || message === void 0 ? void 0 : message.message;
})(errorUtil || (errorUtil = {}));
var _ZodEnum_cache, _ZodNativeEnum_cache;
const _ParseInputLazyPath = class _ParseInputLazyPath {
  constructor(parent, value, path, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (this._key instanceof Array) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
__name(_ParseInputLazyPath, "ParseInputLazyPath");
let ParseInputLazyPath = _ParseInputLazyPath;
const handleResult = /* @__PURE__ */ __name((ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
}, "handleResult");
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = /* @__PURE__ */ __name((iss, ctx) => {
    var _a3, _b2;
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message !== null && message !== void 0 ? message : ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: (_a3 = message !== null && message !== void 0 ? message : required_error) !== null && _a3 !== void 0 ? _a3 : ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: (_b2 = message !== null && message !== void 0 ? message : invalid_type_error) !== null && _b2 !== void 0 ? _b2 : ctx.defaultError };
  }, "customMap");
  return { errorMap: customMap, description };
}
__name(processCreateParams, "processCreateParams");
const _ZodType = class _ZodType {
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
  }
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    var _a3;
    const ctx = {
      common: {
        issues: [],
        async: (_a3 = params === null || params === void 0 ? void 0 : params.async) !== null && _a3 !== void 0 ? _a3 : false,
        contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap
      },
      path: (params === null || params === void 0 ? void 0 : params.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap,
        async: true
      },
      path: (params === null || params === void 0 ? void 0 : params.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = /* @__PURE__ */ __name((val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    }, "getIssueProperties");
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = /* @__PURE__ */ __name(() => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      }), "setError");
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this, this._def);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform2) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform: transform2 }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target2) {
    return ZodPipeline.create(this, target2);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
__name(_ZodType, "ZodType");
let ZodType = _ZodType;
const cuidRegex = /^c[^\s-]{8,}$/i;
const cuid2Regex = /^[0-9a-z]+$/;
const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/;
const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
const nanoidRegex = /^[a-z0-9_-]{21}$/i;
const durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
const emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
const _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
let emojiRegex;
const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
const ipv6Regex = /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/;
const base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
const dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
const dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let regex = `([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d`;
  if (args.precision) {
    regex = `${regex}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    regex = `${regex}(\\.\\d+)?`;
  }
  return regex;
}
__name(timeRegexSource, "timeRegexSource");
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
__name(timeRegex, "timeRegex");
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
__name(datetimeRegex, "datetimeRegex");
function isValidIP(ip, version2) {
  if ((version2 === "v4" || !version2) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version2 === "v6" || !version2) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
__name(isValidIP, "isValidIP");
const _ZodString = class _ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch (_a3) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    var _a3, _b2;
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof (options === null || options === void 0 ? void 0 : options.precision) === "undefined" ? null : options === null || options === void 0 ? void 0 : options.precision,
      offset: (_a3 = options === null || options === void 0 ? void 0 : options.offset) !== null && _a3 !== void 0 ? _a3 : false,
      local: (_b2 = options === null || options === void 0 ? void 0 : options.local) !== null && _b2 !== void 0 ? _b2 : false,
      ...errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof (options === null || options === void 0 ? void 0 : options.precision) === "undefined" ? null : options === null || options === void 0 ? void 0 : options.precision,
      ...errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options === null || options === void 0 ? void 0 : options.position,
      ...errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * @deprecated Use z.string().min(1) instead.
   * @see {@link ZodString.min}
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
__name(_ZodString, "ZodString");
let ZodString = _ZodString;
ZodString.create = (params) => {
  var _a3;
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: (_a3 = params === null || params === void 0 ? void 0 : params.coerce) !== null && _a3 !== void 0 ? _a3 : false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / Math.pow(10, decCount);
}
__name(floatSafeRemainder, "floatSafeRemainder");
const _ZodNumber = class _ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null, min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
__name(_ZodNumber, "ZodNumber");
let ZodNumber = _ZodNumber;
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
    ...processCreateParams(params)
  });
};
const _ZodBigInt = class _ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = BigInt(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.bigint,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
__name(_ZodBigInt, "ZodBigInt");
let ZodBigInt = _ZodBigInt;
ZodBigInt.create = (params) => {
  var _a3;
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: (_a3 = params === null || params === void 0 ? void 0 : params.coerce) !== null && _a3 !== void 0 ? _a3 : false,
    ...processCreateParams(params)
  });
};
const _ZodBoolean = class _ZodBoolean extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
__name(_ZodBoolean, "ZodBoolean");
let ZodBoolean = _ZodBoolean;
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
    ...processCreateParams(params)
  });
};
const _ZodDate = class _ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
__name(_ZodDate, "ZodDate");
let ZodDate = _ZodDate;
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
const _ZodSymbol = class _ZodSymbol extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
__name(_ZodSymbol, "ZodSymbol");
let ZodSymbol = _ZodSymbol;
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
const _ZodUndefined = class _ZodUndefined extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
__name(_ZodUndefined, "ZodUndefined");
let ZodUndefined = _ZodUndefined;
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
const _ZodNull = class _ZodNull extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
__name(_ZodNull, "ZodNull");
let ZodNull = _ZodNull;
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
const _ZodAny = class _ZodAny extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
__name(_ZodAny, "ZodAny");
let ZodAny = _ZodAny;
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
const _ZodUnknown = class _ZodUnknown extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
__name(_ZodUnknown, "ZodUnknown");
let ZodUnknown = _ZodUnknown;
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
const _ZodNever = class _ZodNever extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
__name(_ZodNever, "ZodNever");
let ZodNever = _ZodNever;
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
const _ZodVoid = class _ZodVoid extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
__name(_ZodVoid, "ZodVoid");
let ZodVoid = _ZodVoid;
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
const _ZodArray = class _ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
__name(_ZodArray, "ZodArray");
let ZodArray = _ZodArray;
ZodArray.create = (schema2, params) => {
  return new ZodArray({
    type: schema2,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema2) {
  if (schema2 instanceof ZodObject) {
    const newShape = {};
    for (const key in schema2.shape) {
      const fieldSchema = schema2.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema2._def,
      shape: /* @__PURE__ */ __name(() => newShape, "shape")
    });
  } else if (schema2 instanceof ZodArray) {
    return new ZodArray({
      ...schema2._def,
      type: deepPartialify(schema2.element)
    });
  } else if (schema2 instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema2.unwrap()));
  } else if (schema2 instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema2.unwrap()));
  } else if (schema2 instanceof ZodTuple) {
    return ZodTuple.create(schema2.items.map((item) => deepPartialify(item)));
  } else {
    return schema2;
  }
}
__name(deepPartialify, "deepPartialify");
const _ZodObject = class _ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    return this._cached = { shape, keys };
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") ;
      else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: /* @__PURE__ */ __name((issue, ctx) => {
          var _a3, _b2, _c2, _d2;
          const defaultError = (_c2 = (_b2 = (_a3 = this._def).errorMap) === null || _b2 === void 0 ? void 0 : _b2.call(_a3, issue, ctx).message) !== null && _c2 !== void 0 ? _c2 : ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: (_d2 = errorUtil.errToObj(message).message) !== null && _d2 !== void 0 ? _d2 : defaultError
            };
          return {
            message: defaultError
          };
        }, "errorMap")
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: /* @__PURE__ */ __name(() => ({
        ...this._def.shape(),
        ...augmentation
      }), "shape")
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: /* @__PURE__ */ __name(() => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }), "shape"),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema2) {
    return this.augment({ [key]: schema2 });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    util.objectKeys(mask).forEach((key) => {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    });
    return new _ZodObject({
      ...this._def,
      shape: /* @__PURE__ */ __name(() => shape, "shape")
    });
  }
  omit(mask) {
    const shape = {};
    util.objectKeys(this.shape).forEach((key) => {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    });
    return new _ZodObject({
      ...this._def,
      shape: /* @__PURE__ */ __name(() => shape, "shape")
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    util.objectKeys(this.shape).forEach((key) => {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    });
    return new _ZodObject({
      ...this._def,
      shape: /* @__PURE__ */ __name(() => newShape, "shape")
    });
  }
  required(mask) {
    const newShape = {};
    util.objectKeys(this.shape).forEach((key) => {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    });
    return new _ZodObject({
      ...this._def,
      shape: /* @__PURE__ */ __name(() => newShape, "shape")
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
__name(_ZodObject, "ZodObject");
let ZodObject = _ZodObject;
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: /* @__PURE__ */ __name(() => shape, "shape"),
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: /* @__PURE__ */ __name(() => shape, "shape"),
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
const _ZodUnion = class _ZodUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    __name(handleResults, "handleResults");
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
__name(_ZodUnion, "ZodUnion");
let ZodUnion = _ZodUnion;
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
const getDiscriminator = /* @__PURE__ */ __name((type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
}, "getDiscriminator");
const _ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
__name(_ZodDiscriminatedUnion, "ZodDiscriminatedUnion");
let ZodDiscriminatedUnion = _ZodDiscriminatedUnion;
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
__name(mergeValues, "mergeValues");
const _ZodIntersection = class _ZodIntersection extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = /* @__PURE__ */ __name((parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    }, "handleParsed");
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
__name(_ZodIntersection, "ZodIntersection");
let ZodIntersection = _ZodIntersection;
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
const _ZodTuple = class _ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema2 = this._def.items[itemIndex] || this._def.rest;
      if (!schema2)
        return null;
      return schema2._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
__name(_ZodTuple, "ZodTuple");
let ZodTuple = _ZodTuple;
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
const _ZodRecord = class _ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
__name(_ZodRecord, "ZodRecord");
let ZodRecord = _ZodRecord;
const _ZodMap = class _ZodMap extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
__name(_ZodMap, "ZodMap");
let ZodMap = _ZodMap;
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
const _ZodSet = class _ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    __name(finalizeSet, "finalizeSet");
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
__name(_ZodSet, "ZodSet");
let ZodSet = _ZodSet;
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
const _ZodFunction = class _ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [
          ctx.common.contextualErrorMap,
          ctx.schemaErrorMap,
          getErrorMap(),
          errorMap
        ].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    __name(makeArgsIssue, "makeArgsIssue");
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [
          ctx.common.contextualErrorMap,
          ctx.schemaErrorMap,
          getErrorMap(),
          errorMap
        ].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    __name(makeReturnsIssue, "makeReturnsIssue");
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
__name(_ZodFunction, "ZodFunction");
let ZodFunction = _ZodFunction;
const _ZodLazy = class _ZodLazy extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
__name(_ZodLazy, "ZodLazy");
let ZodLazy = _ZodLazy;
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
const _ZodLiteral = class _ZodLiteral extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
__name(_ZodLiteral, "ZodLiteral");
let ZodLiteral = _ZodLiteral;
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
__name(createZodEnum, "createZodEnum");
const _ZodEnum = class _ZodEnum extends ZodType {
  constructor() {
    super(...arguments);
    _ZodEnum_cache.set(this, void 0);
  }
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!__classPrivateFieldGet$1(this, _ZodEnum_cache)) {
      __classPrivateFieldSet$1(this, _ZodEnum_cache, new Set(this._def.values));
    }
    if (!__classPrivateFieldGet$1(this, _ZodEnum_cache).has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return _ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
__name(_ZodEnum, "ZodEnum");
let ZodEnum = _ZodEnum;
_ZodEnum_cache = /* @__PURE__ */ new WeakMap();
ZodEnum.create = createZodEnum;
const _ZodNativeEnum = class _ZodNativeEnum extends ZodType {
  constructor() {
    super(...arguments);
    _ZodNativeEnum_cache.set(this, void 0);
  }
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!__classPrivateFieldGet$1(this, _ZodNativeEnum_cache)) {
      __classPrivateFieldSet$1(this, _ZodNativeEnum_cache, new Set(util.getValidEnumValues(this._def.values)));
    }
    if (!__classPrivateFieldGet$1(this, _ZodNativeEnum_cache).has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
__name(_ZodNativeEnum, "ZodNativeEnum");
let ZodNativeEnum = _ZodNativeEnum;
_ZodNativeEnum_cache = /* @__PURE__ */ new WeakMap();
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
const _ZodPromise = class _ZodPromise extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
__name(_ZodPromise, "ZodPromise");
let ZodPromise = _ZodPromise;
ZodPromise.create = (schema2, params) => {
  return new ZodPromise({
    type: schema2,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
const _ZodEffects = class _ZodEffects extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: /* @__PURE__ */ __name((arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      }, "addIssue"),
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = /* @__PURE__ */ __name((acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      }, "executeRefinement");
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return base;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return base;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({ status: status.value, value: result }));
        });
      }
    }
    util.assertNever(effect);
  }
};
__name(_ZodEffects, "ZodEffects");
let ZodEffects = _ZodEffects;
ZodEffects.create = (schema2, effect, params) => {
  return new ZodEffects({
    schema: schema2,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema2, params) => {
  return new ZodEffects({
    schema: schema2,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
const _ZodOptional = class _ZodOptional extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
__name(_ZodOptional, "ZodOptional");
let ZodOptional = _ZodOptional;
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
const _ZodNullable = class _ZodNullable extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
__name(_ZodNullable, "ZodNullable");
let ZodNullable = _ZodNullable;
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
const _ZodDefault = class _ZodDefault extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
__name(_ZodDefault, "ZodDefault");
let ZodDefault = _ZodDefault;
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
const _ZodCatch = class _ZodCatch extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
__name(_ZodCatch, "ZodCatch");
let ZodCatch = _ZodCatch;
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
const _ZodNaN = class _ZodNaN extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
__name(_ZodNaN, "ZodNaN");
let ZodNaN = _ZodNaN;
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
const BRAND = Symbol("zod_brand");
const _ZodBranded = class _ZodBranded extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
__name(_ZodBranded, "ZodBranded");
let ZodBranded = _ZodBranded;
const _ZodPipeline = class _ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = /* @__PURE__ */ __name(async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      }, "handleAsync");
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new _ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
__name(_ZodPipeline, "ZodPipeline");
let ZodPipeline = _ZodPipeline;
const _ZodReadonly = class _ZodReadonly extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = /* @__PURE__ */ __name((data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    }, "freeze");
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
__name(_ZodReadonly, "ZodReadonly");
let ZodReadonly = _ZodReadonly;
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function custom(check, params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      var _a3, _b2;
      if (!check(data)) {
        const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
        const _fatal = (_b2 = (_a3 = p.fatal) !== null && _a3 !== void 0 ? _a3 : fatal) !== null && _b2 !== void 0 ? _b2 : true;
        const p2 = typeof p === "string" ? { message: p } : p;
        ctx.addIssue({ code: "custom", ...p2, fatal: _fatal });
      }
    });
  return ZodAny.create();
}
__name(custom, "custom");
const late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
const instanceOfType = /* @__PURE__ */ __name((cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params), "instanceOfType");
const stringType = ZodString.create;
const numberType = ZodNumber.create;
const nanType = ZodNaN.create;
const bigIntType = ZodBigInt.create;
const booleanType = ZodBoolean.create;
const dateType = ZodDate.create;
const symbolType = ZodSymbol.create;
const undefinedType = ZodUndefined.create;
const nullType = ZodNull.create;
const anyType = ZodAny.create;
const unknownType = ZodUnknown.create;
const neverType = ZodNever.create;
const voidType = ZodVoid.create;
const arrayType = ZodArray.create;
const objectType = ZodObject.create;
const strictObjectType = ZodObject.strictCreate;
const unionType = ZodUnion.create;
const discriminatedUnionType = ZodDiscriminatedUnion.create;
const intersectionType = ZodIntersection.create;
const tupleType = ZodTuple.create;
const recordType = ZodRecord.create;
const mapType = ZodMap.create;
const setType = ZodSet.create;
const functionType = ZodFunction.create;
const lazyType = ZodLazy.create;
const literalType = ZodLiteral.create;
const enumType = ZodEnum.create;
const nativeEnumType = ZodNativeEnum.create;
const promiseType = ZodPromise.create;
const effectsType = ZodEffects.create;
const optionalType = ZodOptional.create;
const nullableType = ZodNullable.create;
const preprocessType = ZodEffects.createWithPreprocess;
const pipelineType = ZodPipeline.create;
const ostring = /* @__PURE__ */ __name(() => stringType().optional(), "ostring");
const onumber = /* @__PURE__ */ __name(() => numberType().optional(), "onumber");
const oboolean = /* @__PURE__ */ __name(() => booleanType().optional(), "oboolean");
const coerce = {
  string: /* @__PURE__ */ __name((arg) => ZodString.create({ ...arg, coerce: true }), "string"),
  number: /* @__PURE__ */ __name((arg) => ZodNumber.create({ ...arg, coerce: true }), "number"),
  boolean: /* @__PURE__ */ __name((arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  }), "boolean"),
  bigint: /* @__PURE__ */ __name((arg) => ZodBigInt.create({ ...arg, coerce: true }), "bigint"),
  date: /* @__PURE__ */ __name((arg) => ZodDate.create({ ...arg, coerce: true }), "date")
};
const NEVER$1 = INVALID;
var z = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  defaultErrorMap: errorMap,
  setErrorMap,
  getErrorMap,
  makeIssue,
  EMPTY_PATH,
  addIssueToContext,
  ParseStatus,
  INVALID,
  DIRTY,
  OK,
  isAborted,
  isDirty,
  isValid,
  isAsync,
  get util() {
    return util;
  },
  get objectUtil() {
    return objectUtil;
  },
  ZodParsedType,
  getParsedType,
  ZodType,
  datetimeRegex,
  ZodString,
  ZodNumber,
  ZodBigInt,
  ZodBoolean,
  ZodDate,
  ZodSymbol,
  ZodUndefined,
  ZodNull,
  ZodAny,
  ZodUnknown,
  ZodNever,
  ZodVoid,
  ZodArray,
  ZodObject,
  ZodUnion,
  ZodDiscriminatedUnion,
  ZodIntersection,
  ZodTuple,
  ZodRecord,
  ZodMap,
  ZodSet,
  ZodFunction,
  ZodLazy,
  ZodLiteral,
  ZodEnum,
  ZodNativeEnum,
  ZodPromise,
  ZodEffects,
  ZodTransformer: ZodEffects,
  ZodOptional,
  ZodNullable,
  ZodDefault,
  ZodCatch,
  ZodNaN,
  BRAND,
  ZodBranded,
  ZodPipeline,
  ZodReadonly,
  custom,
  Schema: ZodType,
  ZodSchema: ZodType,
  late,
  get ZodFirstPartyTypeKind() {
    return ZodFirstPartyTypeKind;
  },
  coerce,
  any: anyType,
  array: arrayType,
  bigint: bigIntType,
  boolean: booleanType,
  date: dateType,
  discriminatedUnion: discriminatedUnionType,
  effect: effectsType,
  "enum": enumType,
  "function": functionType,
  "instanceof": instanceOfType,
  intersection: intersectionType,
  lazy: lazyType,
  literal: literalType,
  map: mapType,
  nan: nanType,
  nativeEnum: nativeEnumType,
  never: neverType,
  "null": nullType,
  nullable: nullableType,
  number: numberType,
  object: objectType,
  oboolean,
  onumber,
  optional: optionalType,
  ostring,
  pipeline: pipelineType,
  preprocess: preprocessType,
  promise: promiseType,
  record: recordType,
  set: setType,
  strictObject: strictObjectType,
  string: stringType,
  symbol: symbolType,
  transformer: effectsType,
  tuple: tupleType,
  "undefined": undefinedType,
  union: unionType,
  unknown: unknownType,
  "void": voidType,
  NEVER: NEVER$1,
  ZodIssueCode,
  quotelessJson,
  ZodError
});
var BigInteger = { exports: {} };
var hasRequiredBigInteger;
function requireBigInteger() {
  if (hasRequiredBigInteger) return BigInteger.exports;
  hasRequiredBigInteger = 1;
  (function(module) {
    var bigInt2 = function(undefined$1) {
      var BASE2 = 1e7, LOG_BASE2 = 7, MAX_INT = 9007199254740992, MAX_INT_ARR = smallToArray(MAX_INT), DEFAULT_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
      var supportsNativeBigInt = typeof BigInt === "function";
      function Integer(v, radix, alphabet, caseSensitive) {
        if (typeof v === "undefined") return Integer[0];
        if (typeof radix !== "undefined") return +radix === 10 && !alphabet ? parseValue(v) : parseBase(v, radix, alphabet, caseSensitive);
        return parseValue(v);
      }
      __name(Integer, "Integer");
      function BigInteger2(value, sign) {
        this.value = value;
        this.sign = sign;
        this.isSmall = false;
      }
      __name(BigInteger2, "BigInteger");
      BigInteger2.prototype = Object.create(Integer.prototype);
      function SmallInteger(value) {
        this.value = value;
        this.sign = value < 0;
        this.isSmall = true;
      }
      __name(SmallInteger, "SmallInteger");
      SmallInteger.prototype = Object.create(Integer.prototype);
      function NativeBigInt(value) {
        this.value = value;
      }
      __name(NativeBigInt, "NativeBigInt");
      NativeBigInt.prototype = Object.create(Integer.prototype);
      function isPrecise(n) {
        return -9007199254740992 < n && n < MAX_INT;
      }
      __name(isPrecise, "isPrecise");
      function smallToArray(n) {
        if (n < 1e7)
          return [n];
        if (n < 1e14)
          return [n % 1e7, Math.floor(n / 1e7)];
        return [n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14)];
      }
      __name(smallToArray, "smallToArray");
      function arrayToSmall(arr) {
        trim(arr);
        var length = arr.length;
        if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
          switch (length) {
            case 0:
              return 0;
            case 1:
              return arr[0];
            case 2:
              return arr[0] + arr[1] * BASE2;
            default:
              return arr[0] + (arr[1] + arr[2] * BASE2) * BASE2;
          }
        }
        return arr;
      }
      __name(arrayToSmall, "arrayToSmall");
      function trim(v) {
        var i2 = v.length;
        while (v[--i2] === 0) ;
        v.length = i2 + 1;
      }
      __name(trim, "trim");
      function createArray(length) {
        var x = new Array(length);
        var i2 = -1;
        while (++i2 < length) {
          x[i2] = 0;
        }
        return x;
      }
      __name(createArray, "createArray");
      function truncate2(n) {
        if (n > 0) return Math.floor(n);
        return Math.ceil(n);
      }
      __name(truncate2, "truncate");
      function add2(a, b) {
        var l_a = a.length, l_b = b.length, r = new Array(l_a), carry = 0, base = BASE2, sum, i2;
        for (i2 = 0; i2 < l_b; i2++) {
          sum = a[i2] + b[i2] + carry;
          carry = sum >= base ? 1 : 0;
          r[i2] = sum - carry * base;
        }
        while (i2 < l_a) {
          sum = a[i2] + carry;
          carry = sum === base ? 1 : 0;
          r[i2++] = sum - carry * base;
        }
        if (carry > 0) r.push(carry);
        return r;
      }
      __name(add2, "add");
      function addAny(a, b) {
        if (a.length >= b.length) return add2(a, b);
        return add2(b, a);
      }
      __name(addAny, "addAny");
      function addSmall(a, carry) {
        var l = a.length, r = new Array(l), base = BASE2, sum, i2;
        for (i2 = 0; i2 < l; i2++) {
          sum = a[i2] - base + carry;
          carry = Math.floor(sum / base);
          r[i2] = sum - carry * base;
          carry += 1;
        }
        while (carry > 0) {
          r[i2++] = carry % base;
          carry = Math.floor(carry / base);
        }
        return r;
      }
      __name(addSmall, "addSmall");
      BigInteger2.prototype.add = function(v) {
        var n = parseValue(v);
        if (this.sign !== n.sign) {
          return this.subtract(n.negate());
        }
        var a = this.value, b = n.value;
        if (n.isSmall) {
          return new BigInteger2(addSmall(a, Math.abs(b)), this.sign);
        }
        return new BigInteger2(addAny(a, b), this.sign);
      };
      BigInteger2.prototype.plus = BigInteger2.prototype.add;
      SmallInteger.prototype.add = function(v) {
        var n = parseValue(v);
        var a = this.value;
        if (a < 0 !== n.sign) {
          return this.subtract(n.negate());
        }
        var b = n.value;
        if (n.isSmall) {
          if (isPrecise(a + b)) return new SmallInteger(a + b);
          b = smallToArray(Math.abs(b));
        }
        return new BigInteger2(addSmall(b, Math.abs(a)), a < 0);
      };
      SmallInteger.prototype.plus = SmallInteger.prototype.add;
      NativeBigInt.prototype.add = function(v) {
        return new NativeBigInt(this.value + parseValue(v).value);
      };
      NativeBigInt.prototype.plus = NativeBigInt.prototype.add;
      function subtract2(a, b) {
        var a_l = a.length, b_l = b.length, r = new Array(a_l), borrow = 0, base = BASE2, i2, difference;
        for (i2 = 0; i2 < b_l; i2++) {
          difference = a[i2] - borrow - b[i2];
          if (difference < 0) {
            difference += base;
            borrow = 1;
          } else borrow = 0;
          r[i2] = difference;
        }
        for (i2 = b_l; i2 < a_l; i2++) {
          difference = a[i2] - borrow;
          if (difference < 0) difference += base;
          else {
            r[i2++] = difference;
            break;
          }
          r[i2] = difference;
        }
        for (; i2 < a_l; i2++) {
          r[i2] = a[i2];
        }
        trim(r);
        return r;
      }
      __name(subtract2, "subtract");
      function subtractAny(a, b, sign) {
        var value;
        if (compareAbs(a, b) >= 0) {
          value = subtract2(a, b);
        } else {
          value = subtract2(b, a);
          sign = !sign;
        }
        value = arrayToSmall(value);
        if (typeof value === "number") {
          if (sign) value = -value;
          return new SmallInteger(value);
        }
        return new BigInteger2(value, sign);
      }
      __name(subtractAny, "subtractAny");
      function subtractSmall(a, b, sign) {
        var l = a.length, r = new Array(l), carry = -b, base = BASE2, i2, difference;
        for (i2 = 0; i2 < l; i2++) {
          difference = a[i2] + carry;
          carry = Math.floor(difference / base);
          difference %= base;
          r[i2] = difference < 0 ? difference + base : difference;
        }
        r = arrayToSmall(r);
        if (typeof r === "number") {
          if (sign) r = -r;
          return new SmallInteger(r);
        }
        return new BigInteger2(r, sign);
      }
      __name(subtractSmall, "subtractSmall");
      BigInteger2.prototype.subtract = function(v) {
        var n = parseValue(v);
        if (this.sign !== n.sign) {
          return this.add(n.negate());
        }
        var a = this.value, b = n.value;
        if (n.isSmall)
          return subtractSmall(a, Math.abs(b), this.sign);
        return subtractAny(a, b, this.sign);
      };
      BigInteger2.prototype.minus = BigInteger2.prototype.subtract;
      SmallInteger.prototype.subtract = function(v) {
        var n = parseValue(v);
        var a = this.value;
        if (a < 0 !== n.sign) {
          return this.add(n.negate());
        }
        var b = n.value;
        if (n.isSmall) {
          return new SmallInteger(a - b);
        }
        return subtractSmall(b, Math.abs(a), a >= 0);
      };
      SmallInteger.prototype.minus = SmallInteger.prototype.subtract;
      NativeBigInt.prototype.subtract = function(v) {
        return new NativeBigInt(this.value - parseValue(v).value);
      };
      NativeBigInt.prototype.minus = NativeBigInt.prototype.subtract;
      BigInteger2.prototype.negate = function() {
        return new BigInteger2(this.value, !this.sign);
      };
      SmallInteger.prototype.negate = function() {
        var sign = this.sign;
        var small = new SmallInteger(-this.value);
        small.sign = !sign;
        return small;
      };
      NativeBigInt.prototype.negate = function() {
        return new NativeBigInt(-this.value);
      };
      BigInteger2.prototype.abs = function() {
        return new BigInteger2(this.value, false);
      };
      SmallInteger.prototype.abs = function() {
        return new SmallInteger(Math.abs(this.value));
      };
      NativeBigInt.prototype.abs = function() {
        return new NativeBigInt(this.value >= 0 ? this.value : -this.value);
      };
      function multiplyLong(a, b) {
        var a_l = a.length, b_l = b.length, l = a_l + b_l, r = createArray(l), base = BASE2, product, carry, i2, a_i, b_j;
        for (i2 = 0; i2 < a_l; ++i2) {
          a_i = a[i2];
          for (var j = 0; j < b_l; ++j) {
            b_j = b[j];
            product = a_i * b_j + r[i2 + j];
            carry = Math.floor(product / base);
            r[i2 + j] = product - carry * base;
            r[i2 + j + 1] += carry;
          }
        }
        trim(r);
        return r;
      }
      __name(multiplyLong, "multiplyLong");
      function multiplySmall(a, b) {
        var l = a.length, r = new Array(l), base = BASE2, carry = 0, product, i2;
        for (i2 = 0; i2 < l; i2++) {
          product = a[i2] * b + carry;
          carry = Math.floor(product / base);
          r[i2] = product - carry * base;
        }
        while (carry > 0) {
          r[i2++] = carry % base;
          carry = Math.floor(carry / base);
        }
        return r;
      }
      __name(multiplySmall, "multiplySmall");
      function shiftLeft(x, n) {
        var r = [];
        while (n-- > 0) r.push(0);
        return r.concat(x);
      }
      __name(shiftLeft, "shiftLeft");
      function multiplyKaratsuba(x, y) {
        var n = Math.max(x.length, y.length);
        if (n <= 30) return multiplyLong(x, y);
        n = Math.ceil(n / 2);
        var b = x.slice(n), a = x.slice(0, n), d = y.slice(n), c = y.slice(0, n);
        var ac = multiplyKaratsuba(a, c), bd = multiplyKaratsuba(b, d), abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));
        var product = addAny(addAny(ac, shiftLeft(subtract2(subtract2(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));
        trim(product);
        return product;
      }
      __name(multiplyKaratsuba, "multiplyKaratsuba");
      function useKaratsuba(l1, l2) {
        return -0.012 * l1 - 0.012 * l2 + 15e-6 * l1 * l2 > 0;
      }
      __name(useKaratsuba, "useKaratsuba");
      BigInteger2.prototype.multiply = function(v) {
        var n = parseValue(v), a = this.value, b = n.value, sign = this.sign !== n.sign, abs;
        if (n.isSmall) {
          if (b === 0) return Integer[0];
          if (b === 1) return this;
          if (b === -1) return this.negate();
          abs = Math.abs(b);
          if (abs < BASE2) {
            return new BigInteger2(multiplySmall(a, abs), sign);
          }
          b = smallToArray(abs);
        }
        if (useKaratsuba(a.length, b.length))
          return new BigInteger2(multiplyKaratsuba(a, b), sign);
        return new BigInteger2(multiplyLong(a, b), sign);
      };
      BigInteger2.prototype.times = BigInteger2.prototype.multiply;
      function multiplySmallAndArray(a, b, sign) {
        if (a < BASE2) {
          return new BigInteger2(multiplySmall(b, a), sign);
        }
        return new BigInteger2(multiplyLong(b, smallToArray(a)), sign);
      }
      __name(multiplySmallAndArray, "multiplySmallAndArray");
      SmallInteger.prototype._multiplyBySmall = function(a) {
        if (isPrecise(a.value * this.value)) {
          return new SmallInteger(a.value * this.value);
        }
        return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
      };
      BigInteger2.prototype._multiplyBySmall = function(a) {
        if (a.value === 0) return Integer[0];
        if (a.value === 1) return this;
        if (a.value === -1) return this.negate();
        return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
      };
      SmallInteger.prototype.multiply = function(v) {
        return parseValue(v)._multiplyBySmall(this);
      };
      SmallInteger.prototype.times = SmallInteger.prototype.multiply;
      NativeBigInt.prototype.multiply = function(v) {
        return new NativeBigInt(this.value * parseValue(v).value);
      };
      NativeBigInt.prototype.times = NativeBigInt.prototype.multiply;
      function square(a) {
        var l = a.length, r = createArray(l + l), base = BASE2, product, carry, i2, a_i, a_j;
        for (i2 = 0; i2 < l; i2++) {
          a_i = a[i2];
          carry = 0 - a_i * a_i;
          for (var j = i2; j < l; j++) {
            a_j = a[j];
            product = 2 * (a_i * a_j) + r[i2 + j] + carry;
            carry = Math.floor(product / base);
            r[i2 + j] = product - carry * base;
          }
          r[i2 + l] = carry;
        }
        trim(r);
        return r;
      }
      __name(square, "square");
      BigInteger2.prototype.square = function() {
        return new BigInteger2(square(this.value), false);
      };
      SmallInteger.prototype.square = function() {
        var value = this.value * this.value;
        if (isPrecise(value)) return new SmallInteger(value);
        return new BigInteger2(square(smallToArray(Math.abs(this.value))), false);
      };
      NativeBigInt.prototype.square = function(v) {
        return new NativeBigInt(this.value * this.value);
      };
      function divMod1(a, b) {
        var a_l = a.length, b_l = b.length, base = BASE2, result = createArray(b.length), divisorMostSignificantDigit = b[b_l - 1], lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)), remainder = multiplySmall(a, lambda), divisor = multiplySmall(b, lambda), quotientDigit, shift, carry, borrow, i2, l, q;
        if (remainder.length <= a_l) remainder.push(0);
        divisor.push(0);
        divisorMostSignificantDigit = divisor[b_l - 1];
        for (shift = a_l - b_l; shift >= 0; shift--) {
          quotientDigit = base - 1;
          if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
            quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
          }
          carry = 0;
          borrow = 0;
          l = divisor.length;
          for (i2 = 0; i2 < l; i2++) {
            carry += quotientDigit * divisor[i2];
            q = Math.floor(carry / base);
            borrow += remainder[shift + i2] - (carry - q * base);
            carry = q;
            if (borrow < 0) {
              remainder[shift + i2] = borrow + base;
              borrow = -1;
            } else {
              remainder[shift + i2] = borrow;
              borrow = 0;
            }
          }
          while (borrow !== 0) {
            quotientDigit -= 1;
            carry = 0;
            for (i2 = 0; i2 < l; i2++) {
              carry += remainder[shift + i2] - base + divisor[i2];
              if (carry < 0) {
                remainder[shift + i2] = carry + base;
                carry = 0;
              } else {
                remainder[shift + i2] = carry;
                carry = 1;
              }
            }
            borrow += carry;
          }
          result[shift] = quotientDigit;
        }
        remainder = divModSmall(remainder, lambda)[0];
        return [arrayToSmall(result), arrayToSmall(remainder)];
      }
      __name(divMod1, "divMod1");
      function divMod2(a, b) {
        var a_l = a.length, b_l = b.length, result = [], part = [], base = BASE2, guess, xlen, highx, highy, check;
        while (a_l) {
          part.unshift(a[--a_l]);
          trim(part);
          if (compareAbs(part, b) < 0) {
            result.push(0);
            continue;
          }
          xlen = part.length;
          highx = part[xlen - 1] * base + part[xlen - 2];
          highy = b[b_l - 1] * base + b[b_l - 2];
          if (xlen > b_l) {
            highx = (highx + 1) * base;
          }
          guess = Math.ceil(highx / highy);
          do {
            check = multiplySmall(b, guess);
            if (compareAbs(check, part) <= 0) break;
            guess--;
          } while (guess);
          result.push(guess);
          part = subtract2(part, check);
        }
        result.reverse();
        return [arrayToSmall(result), arrayToSmall(part)];
      }
      __name(divMod2, "divMod2");
      function divModSmall(value, lambda) {
        var length = value.length, quotient = createArray(length), base = BASE2, i2, q, remainder, divisor;
        remainder = 0;
        for (i2 = length - 1; i2 >= 0; --i2) {
          divisor = remainder * base + value[i2];
          q = truncate2(divisor / lambda);
          remainder = divisor - q * lambda;
          quotient[i2] = q | 0;
        }
        return [quotient, remainder | 0];
      }
      __name(divModSmall, "divModSmall");
      function divModAny(self2, v) {
        var value, n = parseValue(v);
        if (supportsNativeBigInt) {
          return [new NativeBigInt(self2.value / n.value), new NativeBigInt(self2.value % n.value)];
        }
        var a = self2.value, b = n.value;
        var quotient;
        if (b === 0) throw new Error("Cannot divide by zero");
        if (self2.isSmall) {
          if (n.isSmall) {
            return [new SmallInteger(truncate2(a / b)), new SmallInteger(a % b)];
          }
          return [Integer[0], self2];
        }
        if (n.isSmall) {
          if (b === 1) return [self2, Integer[0]];
          if (b == -1) return [self2.negate(), Integer[0]];
          var abs = Math.abs(b);
          if (abs < BASE2) {
            value = divModSmall(a, abs);
            quotient = arrayToSmall(value[0]);
            var remainder = value[1];
            if (self2.sign) remainder = -remainder;
            if (typeof quotient === "number") {
              if (self2.sign !== n.sign) quotient = -quotient;
              return [new SmallInteger(quotient), new SmallInteger(remainder)];
            }
            return [new BigInteger2(quotient, self2.sign !== n.sign), new SmallInteger(remainder)];
          }
          b = smallToArray(abs);
        }
        var comparison = compareAbs(a, b);
        if (comparison === -1) return [Integer[0], self2];
        if (comparison === 0) return [Integer[self2.sign === n.sign ? 1 : -1], Integer[0]];
        if (a.length + b.length <= 200)
          value = divMod1(a, b);
        else value = divMod2(a, b);
        quotient = value[0];
        var qSign = self2.sign !== n.sign, mod = value[1], mSign = self2.sign;
        if (typeof quotient === "number") {
          if (qSign) quotient = -quotient;
          quotient = new SmallInteger(quotient);
        } else quotient = new BigInteger2(quotient, qSign);
        if (typeof mod === "number") {
          if (mSign) mod = -mod;
          mod = new SmallInteger(mod);
        } else mod = new BigInteger2(mod, mSign);
        return [quotient, mod];
      }
      __name(divModAny, "divModAny");
      BigInteger2.prototype.divmod = function(v) {
        var result = divModAny(this, v);
        return {
          quotient: result[0],
          remainder: result[1]
        };
      };
      NativeBigInt.prototype.divmod = SmallInteger.prototype.divmod = BigInteger2.prototype.divmod;
      BigInteger2.prototype.divide = function(v) {
        return divModAny(this, v)[0];
      };
      NativeBigInt.prototype.over = NativeBigInt.prototype.divide = function(v) {
        return new NativeBigInt(this.value / parseValue(v).value);
      };
      SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger2.prototype.over = BigInteger2.prototype.divide;
      BigInteger2.prototype.mod = function(v) {
        return divModAny(this, v)[1];
      };
      NativeBigInt.prototype.mod = NativeBigInt.prototype.remainder = function(v) {
        return new NativeBigInt(this.value % parseValue(v).value);
      };
      SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger2.prototype.remainder = BigInteger2.prototype.mod;
      BigInteger2.prototype.pow = function(v) {
        var n = parseValue(v), a = this.value, b = n.value, value, x, y;
        if (b === 0) return Integer[1];
        if (a === 0) return Integer[0];
        if (a === 1) return Integer[1];
        if (a === -1) return n.isEven() ? Integer[1] : Integer[-1];
        if (n.sign) {
          return Integer[0];
        }
        if (!n.isSmall) throw new Error("The exponent " + n.toString() + " is too large.");
        if (this.isSmall) {
          if (isPrecise(value = Math.pow(a, b)))
            return new SmallInteger(truncate2(value));
        }
        x = this;
        y = Integer[1];
        while (true) {
          if (b & true) {
            y = y.times(x);
            --b;
          }
          if (b === 0) break;
          b /= 2;
          x = x.square();
        }
        return y;
      };
      SmallInteger.prototype.pow = BigInteger2.prototype.pow;
      NativeBigInt.prototype.pow = function(v) {
        var n = parseValue(v);
        var a = this.value, b = n.value;
        var _0 = BigInt(0), _1 = BigInt(1), _2 = BigInt(2);
        if (b === _0) return Integer[1];
        if (a === _0) return Integer[0];
        if (a === _1) return Integer[1];
        if (a === BigInt(-1)) return n.isEven() ? Integer[1] : Integer[-1];
        if (n.isNegative()) return new NativeBigInt(_0);
        var x = this;
        var y = Integer[1];
        while (true) {
          if ((b & _1) === _1) {
            y = y.times(x);
            --b;
          }
          if (b === _0) break;
          b /= _2;
          x = x.square();
        }
        return y;
      };
      BigInteger2.prototype.modPow = function(exp2, mod) {
        exp2 = parseValue(exp2);
        mod = parseValue(mod);
        if (mod.isZero()) throw new Error("Cannot take modPow with modulus 0");
        var r = Integer[1], base = this.mod(mod);
        if (exp2.isNegative()) {
          exp2 = exp2.multiply(Integer[-1]);
          base = base.modInv(mod);
        }
        while (exp2.isPositive()) {
          if (base.isZero()) return Integer[0];
          if (exp2.isOdd()) r = r.multiply(base).mod(mod);
          exp2 = exp2.divide(2);
          base = base.square().mod(mod);
        }
        return r;
      };
      NativeBigInt.prototype.modPow = SmallInteger.prototype.modPow = BigInteger2.prototype.modPow;
      function compareAbs(a, b) {
        if (a.length !== b.length) {
          return a.length > b.length ? 1 : -1;
        }
        for (var i2 = a.length - 1; i2 >= 0; i2--) {
          if (a[i2] !== b[i2]) return a[i2] > b[i2] ? 1 : -1;
        }
        return 0;
      }
      __name(compareAbs, "compareAbs");
      BigInteger2.prototype.compareAbs = function(v) {
        var n = parseValue(v), a = this.value, b = n.value;
        if (n.isSmall) return 1;
        return compareAbs(a, b);
      };
      SmallInteger.prototype.compareAbs = function(v) {
        var n = parseValue(v), a = Math.abs(this.value), b = n.value;
        if (n.isSmall) {
          b = Math.abs(b);
          return a === b ? 0 : a > b ? 1 : -1;
        }
        return -1;
      };
      NativeBigInt.prototype.compareAbs = function(v) {
        var a = this.value;
        var b = parseValue(v).value;
        a = a >= 0 ? a : -a;
        b = b >= 0 ? b : -b;
        return a === b ? 0 : a > b ? 1 : -1;
      };
      BigInteger2.prototype.compare = function(v) {
        if (v === Infinity) {
          return -1;
        }
        if (v === -Infinity) {
          return 1;
        }
        var n = parseValue(v), a = this.value, b = n.value;
        if (this.sign !== n.sign) {
          return n.sign ? 1 : -1;
        }
        if (n.isSmall) {
          return this.sign ? -1 : 1;
        }
        return compareAbs(a, b) * (this.sign ? -1 : 1);
      };
      BigInteger2.prototype.compareTo = BigInteger2.prototype.compare;
      SmallInteger.prototype.compare = function(v) {
        if (v === Infinity) {
          return -1;
        }
        if (v === -Infinity) {
          return 1;
        }
        var n = parseValue(v), a = this.value, b = n.value;
        if (n.isSmall) {
          return a == b ? 0 : a > b ? 1 : -1;
        }
        if (a < 0 !== n.sign) {
          return a < 0 ? -1 : 1;
        }
        return a < 0 ? 1 : -1;
      };
      SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;
      NativeBigInt.prototype.compare = function(v) {
        if (v === Infinity) {
          return -1;
        }
        if (v === -Infinity) {
          return 1;
        }
        var a = this.value;
        var b = parseValue(v).value;
        return a === b ? 0 : a > b ? 1 : -1;
      };
      NativeBigInt.prototype.compareTo = NativeBigInt.prototype.compare;
      BigInteger2.prototype.equals = function(v) {
        return this.compare(v) === 0;
      };
      NativeBigInt.prototype.eq = NativeBigInt.prototype.equals = SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger2.prototype.eq = BigInteger2.prototype.equals;
      BigInteger2.prototype.notEquals = function(v) {
        return this.compare(v) !== 0;
      };
      NativeBigInt.prototype.neq = NativeBigInt.prototype.notEquals = SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger2.prototype.neq = BigInteger2.prototype.notEquals;
      BigInteger2.prototype.greater = function(v) {
        return this.compare(v) > 0;
      };
      NativeBigInt.prototype.gt = NativeBigInt.prototype.greater = SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger2.prototype.gt = BigInteger2.prototype.greater;
      BigInteger2.prototype.lesser = function(v) {
        return this.compare(v) < 0;
      };
      NativeBigInt.prototype.lt = NativeBigInt.prototype.lesser = SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger2.prototype.lt = BigInteger2.prototype.lesser;
      BigInteger2.prototype.greaterOrEquals = function(v) {
        return this.compare(v) >= 0;
      };
      NativeBigInt.prototype.geq = NativeBigInt.prototype.greaterOrEquals = SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger2.prototype.geq = BigInteger2.prototype.greaterOrEquals;
      BigInteger2.prototype.lesserOrEquals = function(v) {
        return this.compare(v) <= 0;
      };
      NativeBigInt.prototype.leq = NativeBigInt.prototype.lesserOrEquals = SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger2.prototype.leq = BigInteger2.prototype.lesserOrEquals;
      BigInteger2.prototype.isEven = function() {
        return (this.value[0] & 1) === 0;
      };
      SmallInteger.prototype.isEven = function() {
        return (this.value & 1) === 0;
      };
      NativeBigInt.prototype.isEven = function() {
        return (this.value & BigInt(1)) === BigInt(0);
      };
      BigInteger2.prototype.isOdd = function() {
        return (this.value[0] & 1) === 1;
      };
      SmallInteger.prototype.isOdd = function() {
        return (this.value & 1) === 1;
      };
      NativeBigInt.prototype.isOdd = function() {
        return (this.value & BigInt(1)) === BigInt(1);
      };
      BigInteger2.prototype.isPositive = function() {
        return !this.sign;
      };
      SmallInteger.prototype.isPositive = function() {
        return this.value > 0;
      };
      NativeBigInt.prototype.isPositive = SmallInteger.prototype.isPositive;
      BigInteger2.prototype.isNegative = function() {
        return this.sign;
      };
      SmallInteger.prototype.isNegative = function() {
        return this.value < 0;
      };
      NativeBigInt.prototype.isNegative = SmallInteger.prototype.isNegative;
      BigInteger2.prototype.isUnit = function() {
        return false;
      };
      SmallInteger.prototype.isUnit = function() {
        return Math.abs(this.value) === 1;
      };
      NativeBigInt.prototype.isUnit = function() {
        return this.abs().value === BigInt(1);
      };
      BigInteger2.prototype.isZero = function() {
        return false;
      };
      SmallInteger.prototype.isZero = function() {
        return this.value === 0;
      };
      NativeBigInt.prototype.isZero = function() {
        return this.value === BigInt(0);
      };
      BigInteger2.prototype.isDivisibleBy = function(v) {
        var n = parseValue(v);
        if (n.isZero()) return false;
        if (n.isUnit()) return true;
        if (n.compareAbs(2) === 0) return this.isEven();
        return this.mod(n).isZero();
      };
      NativeBigInt.prototype.isDivisibleBy = SmallInteger.prototype.isDivisibleBy = BigInteger2.prototype.isDivisibleBy;
      function isBasicPrime(v) {
        var n = v.abs();
        if (n.isUnit()) return false;
        if (n.equals(2) || n.equals(3) || n.equals(5)) return true;
        if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5)) return false;
        if (n.lesser(49)) return true;
      }
      __name(isBasicPrime, "isBasicPrime");
      function millerRabinTest(n, a) {
        var nPrev = n.prev(), b = nPrev, r = 0, d, i2, x;
        while (b.isEven()) b = b.divide(2), r++;
        next: for (i2 = 0; i2 < a.length; i2++) {
          if (n.lesser(a[i2])) continue;
          x = bigInt2(a[i2]).modPow(b, n);
          if (x.isUnit() || x.equals(nPrev)) continue;
          for (d = r - 1; d != 0; d--) {
            x = x.square().mod(n);
            if (x.isUnit()) return false;
            if (x.equals(nPrev)) continue next;
          }
          return false;
        }
        return true;
      }
      __name(millerRabinTest, "millerRabinTest");
      BigInteger2.prototype.isPrime = function(strict) {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined$1) return isPrime;
        var n = this.abs();
        var bits = n.bitLength();
        if (bits <= 64)
          return millerRabinTest(n, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);
        var logN = Math.log(2) * bits.toJSNumber();
        var t = Math.ceil(strict === true ? 2 * Math.pow(logN, 2) : logN);
        for (var a = [], i2 = 0; i2 < t; i2++) {
          a.push(bigInt2(i2 + 2));
        }
        return millerRabinTest(n, a);
      };
      NativeBigInt.prototype.isPrime = SmallInteger.prototype.isPrime = BigInteger2.prototype.isPrime;
      BigInteger2.prototype.isProbablePrime = function(iterations, rng2) {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined$1) return isPrime;
        var n = this.abs();
        var t = iterations === undefined$1 ? 5 : iterations;
        for (var a = [], i2 = 0; i2 < t; i2++) {
          a.push(bigInt2.randBetween(2, n.minus(2), rng2));
        }
        return millerRabinTest(n, a);
      };
      NativeBigInt.prototype.isProbablePrime = SmallInteger.prototype.isProbablePrime = BigInteger2.prototype.isProbablePrime;
      BigInteger2.prototype.modInv = function(n) {
        var t = bigInt2.zero, newT = bigInt2.one, r = parseValue(n), newR = this.abs(), q, lastT, lastR;
        while (!newR.isZero()) {
          q = r.divide(newR);
          lastT = t;
          lastR = r;
          t = newT;
          r = newR;
          newT = lastT.subtract(q.multiply(newT));
          newR = lastR.subtract(q.multiply(newR));
        }
        if (!r.isUnit()) throw new Error(this.toString() + " and " + n.toString() + " are not co-prime");
        if (t.compare(0) === -1) {
          t = t.add(n);
        }
        if (this.isNegative()) {
          return t.negate();
        }
        return t;
      };
      NativeBigInt.prototype.modInv = SmallInteger.prototype.modInv = BigInteger2.prototype.modInv;
      BigInteger2.prototype.next = function() {
        var value = this.value;
        if (this.sign) {
          return subtractSmall(value, 1, this.sign);
        }
        return new BigInteger2(addSmall(value, 1), this.sign);
      };
      SmallInteger.prototype.next = function() {
        var value = this.value;
        if (value + 1 < MAX_INT) return new SmallInteger(value + 1);
        return new BigInteger2(MAX_INT_ARR, false);
      };
      NativeBigInt.prototype.next = function() {
        return new NativeBigInt(this.value + BigInt(1));
      };
      BigInteger2.prototype.prev = function() {
        var value = this.value;
        if (this.sign) {
          return new BigInteger2(addSmall(value, 1), true);
        }
        return subtractSmall(value, 1, this.sign);
      };
      SmallInteger.prototype.prev = function() {
        var value = this.value;
        if (value - 1 > -9007199254740992) return new SmallInteger(value - 1);
        return new BigInteger2(MAX_INT_ARR, true);
      };
      NativeBigInt.prototype.prev = function() {
        return new NativeBigInt(this.value - BigInt(1));
      };
      var powersOfTwo = [1];
      while (2 * powersOfTwo[powersOfTwo.length - 1] <= BASE2) powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
      var powers2Length = powersOfTwo.length, highestPower2 = powersOfTwo[powers2Length - 1];
      function shift_isSmall(n) {
        return Math.abs(n) <= BASE2;
      }
      __name(shift_isSmall, "shift_isSmall");
      BigInteger2.prototype.shiftLeft = function(v) {
        var n = parseValue(v).toJSNumber();
        if (!shift_isSmall(n)) {
          throw new Error(String(n) + " is too large for shifting.");
        }
        if (n < 0) return this.shiftRight(-n);
        var result = this;
        if (result.isZero()) return result;
        while (n >= powers2Length) {
          result = result.multiply(highestPower2);
          n -= powers2Length - 1;
        }
        return result.multiply(powersOfTwo[n]);
      };
      NativeBigInt.prototype.shiftLeft = SmallInteger.prototype.shiftLeft = BigInteger2.prototype.shiftLeft;
      BigInteger2.prototype.shiftRight = function(v) {
        var remQuo;
        var n = parseValue(v).toJSNumber();
        if (!shift_isSmall(n)) {
          throw new Error(String(n) + " is too large for shifting.");
        }
        if (n < 0) return this.shiftLeft(-n);
        var result = this;
        while (n >= powers2Length) {
          if (result.isZero() || result.isNegative() && result.isUnit()) return result;
          remQuo = divModAny(result, highestPower2);
          result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
          n -= powers2Length - 1;
        }
        remQuo = divModAny(result, powersOfTwo[n]);
        return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
      };
      NativeBigInt.prototype.shiftRight = SmallInteger.prototype.shiftRight = BigInteger2.prototype.shiftRight;
      function bitwise(x, y, fn) {
        y = parseValue(y);
        var xSign = x.isNegative(), ySign = y.isNegative();
        var xRem = xSign ? x.not() : x, yRem = ySign ? y.not() : y;
        var xDigit = 0, yDigit = 0;
        var xDivMod = null, yDivMod = null;
        var result = [];
        while (!xRem.isZero() || !yRem.isZero()) {
          xDivMod = divModAny(xRem, highestPower2);
          xDigit = xDivMod[1].toJSNumber();
          if (xSign) {
            xDigit = highestPower2 - 1 - xDigit;
          }
          yDivMod = divModAny(yRem, highestPower2);
          yDigit = yDivMod[1].toJSNumber();
          if (ySign) {
            yDigit = highestPower2 - 1 - yDigit;
          }
          xRem = xDivMod[0];
          yRem = yDivMod[0];
          result.push(fn(xDigit, yDigit));
        }
        var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt2(-1) : bigInt2(0);
        for (var i2 = result.length - 1; i2 >= 0; i2 -= 1) {
          sum = sum.multiply(highestPower2).add(bigInt2(result[i2]));
        }
        return sum;
      }
      __name(bitwise, "bitwise");
      BigInteger2.prototype.not = function() {
        return this.negate().prev();
      };
      NativeBigInt.prototype.not = SmallInteger.prototype.not = BigInteger2.prototype.not;
      BigInteger2.prototype.and = function(n) {
        return bitwise(this, n, function(a, b) {
          return a & b;
        });
      };
      NativeBigInt.prototype.and = SmallInteger.prototype.and = BigInteger2.prototype.and;
      BigInteger2.prototype.or = function(n) {
        return bitwise(this, n, function(a, b) {
          return a | b;
        });
      };
      NativeBigInt.prototype.or = SmallInteger.prototype.or = BigInteger2.prototype.or;
      BigInteger2.prototype.xor = function(n) {
        return bitwise(this, n, function(a, b) {
          return a ^ b;
        });
      };
      NativeBigInt.prototype.xor = SmallInteger.prototype.xor = BigInteger2.prototype.xor;
      var LOBMASK_I = 1 << 30, LOBMASK_BI = (BASE2 & -1e7) * (BASE2 & -1e7) | LOBMASK_I;
      function roughLOB(n) {
        var v = n.value, x = typeof v === "number" ? v | LOBMASK_I : typeof v === "bigint" ? v | BigInt(LOBMASK_I) : v[0] + v[1] * BASE2 | LOBMASK_BI;
        return x & -x;
      }
      __name(roughLOB, "roughLOB");
      function integerLogarithm(value, base) {
        if (base.compareTo(value) <= 0) {
          var tmp = integerLogarithm(value, base.square(base));
          var p = tmp.p;
          var e = tmp.e;
          var t = p.multiply(base);
          return t.compareTo(value) <= 0 ? { p: t, e: e * 2 + 1 } : { p, e: e * 2 };
        }
        return { p: bigInt2(1), e: 0 };
      }
      __name(integerLogarithm, "integerLogarithm");
      BigInteger2.prototype.bitLength = function() {
        var n = this;
        if (n.compareTo(bigInt2(0)) < 0) {
          n = n.negate().subtract(bigInt2(1));
        }
        if (n.compareTo(bigInt2(0)) === 0) {
          return bigInt2(0);
        }
        return bigInt2(integerLogarithm(n, bigInt2(2)).e).add(bigInt2(1));
      };
      NativeBigInt.prototype.bitLength = SmallInteger.prototype.bitLength = BigInteger2.prototype.bitLength;
      function max(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.greater(b) ? a : b;
      }
      __name(max, "max");
      function min(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.lesser(b) ? a : b;
      }
      __name(min, "min");
      function gcd(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        if (a.equals(b)) return a;
        if (a.isZero()) return b;
        if (b.isZero()) return a;
        var c = Integer[1], d, t;
        while (a.isEven() && b.isEven()) {
          d = min(roughLOB(a), roughLOB(b));
          a = a.divide(d);
          b = b.divide(d);
          c = c.multiply(d);
        }
        while (a.isEven()) {
          a = a.divide(roughLOB(a));
        }
        do {
          while (b.isEven()) {
            b = b.divide(roughLOB(b));
          }
          if (a.greater(b)) {
            t = b;
            b = a;
            a = t;
          }
          b = b.subtract(a);
        } while (!b.isZero());
        return c.isUnit() ? a : a.multiply(c);
      }
      __name(gcd, "gcd");
      function lcm(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        return a.divide(gcd(a, b)).multiply(b);
      }
      __name(lcm, "lcm");
      function randBetween(a, b, rng2) {
        a = parseValue(a);
        b = parseValue(b);
        var usedRNG = rng2 || Math.random;
        var low = min(a, b), high = max(a, b);
        var range = high.subtract(low).add(1);
        if (range.isSmall) return low.add(Math.floor(usedRNG() * range));
        var digits = toBase(range, BASE2).value;
        var result = [], restricted = true;
        for (var i2 = 0; i2 < digits.length; i2++) {
          var top = restricted ? digits[i2] + (i2 + 1 < digits.length ? digits[i2 + 1] / BASE2 : 0) : BASE2;
          var digit = truncate2(usedRNG() * top);
          result.push(digit);
          if (digit < digits[i2]) restricted = false;
        }
        return low.add(Integer.fromArray(result, BASE2, false));
      }
      __name(randBetween, "randBetween");
      var parseBase = /* @__PURE__ */ __name(function(text, base, alphabet, caseSensitive) {
        alphabet = alphabet || DEFAULT_ALPHABET;
        text = String(text);
        if (!caseSensitive) {
          text = text.toLowerCase();
          alphabet = alphabet.toLowerCase();
        }
        var length = text.length;
        var i2;
        var absBase = Math.abs(base);
        var alphabetValues = {};
        for (i2 = 0; i2 < alphabet.length; i2++) {
          alphabetValues[alphabet[i2]] = i2;
        }
        for (i2 = 0; i2 < length; i2++) {
          var c = text[i2];
          if (c === "-") continue;
          if (c in alphabetValues) {
            if (alphabetValues[c] >= absBase) {
              if (c === "1" && absBase === 1) continue;
              throw new Error(c + " is not a valid digit in base " + base + ".");
            }
          }
        }
        base = parseValue(base);
        var digits = [];
        var isNegative = text[0] === "-";
        for (i2 = isNegative ? 1 : 0; i2 < text.length; i2++) {
          var c = text[i2];
          if (c in alphabetValues) digits.push(parseValue(alphabetValues[c]));
          else if (c === "<") {
            var start = i2;
            do {
              i2++;
            } while (text[i2] !== ">" && i2 < text.length);
            digits.push(parseValue(text.slice(start + 1, i2)));
          } else throw new Error(c + " is not a valid character");
        }
        return parseBaseFromArray(digits, base, isNegative);
      }, "parseBase");
      function parseBaseFromArray(digits, base, isNegative) {
        var val = Integer[0], pow = Integer[1], i2;
        for (i2 = digits.length - 1; i2 >= 0; i2--) {
          val = val.add(digits[i2].times(pow));
          pow = pow.times(base);
        }
        return isNegative ? val.negate() : val;
      }
      __name(parseBaseFromArray, "parseBaseFromArray");
      function stringify(digit, alphabet) {
        alphabet = alphabet || DEFAULT_ALPHABET;
        if (digit < alphabet.length) {
          return alphabet[digit];
        }
        return "<" + digit + ">";
      }
      __name(stringify, "stringify");
      function toBase(n, base) {
        base = bigInt2(base);
        if (base.isZero()) {
          if (n.isZero()) return { value: [0], isNegative: false };
          throw new Error("Cannot convert nonzero numbers to base 0.");
        }
        if (base.equals(-1)) {
          if (n.isZero()) return { value: [0], isNegative: false };
          if (n.isNegative())
            return {
              value: [].concat.apply(
                [],
                Array.apply(null, Array(-n.toJSNumber())).map(Array.prototype.valueOf, [1, 0])
              ),
              isNegative: false
            };
          var arr = Array.apply(null, Array(n.toJSNumber() - 1)).map(Array.prototype.valueOf, [0, 1]);
          arr.unshift([1]);
          return {
            value: [].concat.apply([], arr),
            isNegative: false
          };
        }
        var neg = false;
        if (n.isNegative() && base.isPositive()) {
          neg = true;
          n = n.abs();
        }
        if (base.isUnit()) {
          if (n.isZero()) return { value: [0], isNegative: false };
          return {
            value: Array.apply(null, Array(n.toJSNumber())).map(Number.prototype.valueOf, 1),
            isNegative: neg
          };
        }
        var out = [];
        var left = n, divmod;
        while (left.isNegative() || left.compareAbs(base) >= 0) {
          divmod = left.divmod(base);
          left = divmod.quotient;
          var digit = divmod.remainder;
          if (digit.isNegative()) {
            digit = base.minus(digit).abs();
            left = left.next();
          }
          out.push(digit.toJSNumber());
        }
        out.push(left.toJSNumber());
        return { value: out.reverse(), isNegative: neg };
      }
      __name(toBase, "toBase");
      function toBaseString(n, base, alphabet) {
        var arr = toBase(n, base);
        return (arr.isNegative ? "-" : "") + arr.value.map(function(x) {
          return stringify(x, alphabet);
        }).join("");
      }
      __name(toBaseString, "toBaseString");
      BigInteger2.prototype.toArray = function(radix) {
        return toBase(this, radix);
      };
      SmallInteger.prototype.toArray = function(radix) {
        return toBase(this, radix);
      };
      NativeBigInt.prototype.toArray = function(radix) {
        return toBase(this, radix);
      };
      BigInteger2.prototype.toString = function(radix, alphabet) {
        if (radix === undefined$1) radix = 10;
        if (radix !== 10 || alphabet) return toBaseString(this, radix, alphabet);
        var v = this.value, l = v.length, str = String(v[--l]), zeros = "0000000", digit;
        while (--l >= 0) {
          digit = String(v[l]);
          str += zeros.slice(digit.length) + digit;
        }
        var sign = this.sign ? "-" : "";
        return sign + str;
      };
      SmallInteger.prototype.toString = function(radix, alphabet) {
        if (radix === undefined$1) radix = 10;
        if (radix != 10 || alphabet) return toBaseString(this, radix, alphabet);
        return String(this.value);
      };
      NativeBigInt.prototype.toString = SmallInteger.prototype.toString;
      NativeBigInt.prototype.toJSON = BigInteger2.prototype.toJSON = SmallInteger.prototype.toJSON = function() {
        return this.toString();
      };
      BigInteger2.prototype.valueOf = function() {
        return parseInt(this.toString(), 10);
      };
      BigInteger2.prototype.toJSNumber = BigInteger2.prototype.valueOf;
      SmallInteger.prototype.valueOf = function() {
        return this.value;
      };
      SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;
      NativeBigInt.prototype.valueOf = NativeBigInt.prototype.toJSNumber = function() {
        return parseInt(this.toString(), 10);
      };
      function parseStringValue(v) {
        if (isPrecise(+v)) {
          var x = +v;
          if (x === truncate2(x))
            return supportsNativeBigInt ? new NativeBigInt(BigInt(x)) : new SmallInteger(x);
          throw new Error("Invalid integer: " + v);
        }
        var sign = v[0] === "-";
        if (sign) v = v.slice(1);
        var split = v.split(/e/i);
        if (split.length > 2) throw new Error("Invalid integer: " + split.join("e"));
        if (split.length === 2) {
          var exp2 = split[1];
          if (exp2[0] === "+") exp2 = exp2.slice(1);
          exp2 = +exp2;
          if (exp2 !== truncate2(exp2) || !isPrecise(exp2)) throw new Error("Invalid integer: " + exp2 + " is not a valid exponent.");
          var text = split[0];
          var decimalPlace = text.indexOf(".");
          if (decimalPlace >= 0) {
            exp2 -= text.length - decimalPlace - 1;
            text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1);
          }
          if (exp2 < 0) throw new Error("Cannot include negative exponent part for integers");
          text += new Array(exp2 + 1).join("0");
          v = text;
        }
        var isValid2 = /^([0-9][0-9]*)$/.test(v);
        if (!isValid2) throw new Error("Invalid integer: " + v);
        if (supportsNativeBigInt) {
          return new NativeBigInt(BigInt(sign ? "-" + v : v));
        }
        var r = [], max2 = v.length, l = LOG_BASE2, min2 = max2 - l;
        while (max2 > 0) {
          r.push(+v.slice(min2, max2));
          min2 -= l;
          if (min2 < 0) min2 = 0;
          max2 -= l;
        }
        trim(r);
        return new BigInteger2(r, sign);
      }
      __name(parseStringValue, "parseStringValue");
      function parseNumberValue(v) {
        if (supportsNativeBigInt) {
          return new NativeBigInt(BigInt(v));
        }
        if (isPrecise(v)) {
          if (v !== truncate2(v)) throw new Error(v + " is not an integer.");
          return new SmallInteger(v);
        }
        return parseStringValue(v.toString());
      }
      __name(parseNumberValue, "parseNumberValue");
      function parseValue(v) {
        if (typeof v === "number") {
          return parseNumberValue(v);
        }
        if (typeof v === "string") {
          return parseStringValue(v);
        }
        if (typeof v === "bigint") {
          return new NativeBigInt(v);
        }
        return v;
      }
      __name(parseValue, "parseValue");
      for (var i = 0; i < 1e3; i++) {
        Integer[i] = parseValue(i);
        if (i > 0) Integer[-i] = parseValue(-i);
      }
      Integer.one = Integer[1];
      Integer.zero = Integer[0];
      Integer.minusOne = Integer[-1];
      Integer.max = max;
      Integer.min = min;
      Integer.gcd = gcd;
      Integer.lcm = lcm;
      Integer.isInstance = function(x) {
        return x instanceof BigInteger2 || x instanceof SmallInteger || x instanceof NativeBigInt;
      };
      Integer.randBetween = randBetween;
      Integer.fromArray = function(digits, base, isNegative) {
        return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative);
      };
      return Integer;
    }();
    if (module.hasOwnProperty("exports")) {
      module.exports = bigInt2;
    }
  })(BigInteger);
  return BigInteger.exports;
}
__name(requireBigInteger, "requireBigInteger");
var BigIntegerExports = requireBigInteger();
var bigInt = /* @__PURE__ */ getDefaultExportFromCjs(BigIntegerExports);
const MAX_BIG_INT = 64;
const SMALL_INT = 16;
const PARTS = MAX_BIG_INT / SMALL_INT;
function checkBrowserSupportsBigInt() {
  try {
    BigInt;
    return true;
  } catch (_a3) {
    return false;
  }
}
__name(checkBrowserSupportsBigInt, "checkBrowserSupportsBigInt");
function fromHexReverseArray(hexValues, start, size) {
  let value = 0;
  for (let i = 0; i < size; i++) {
    const byte = hexValues[start + i];
    if (byte === void 0) {
      break;
    }
    value += byte * 16 ** i;
  }
  return value;
}
__name(fromHexReverseArray, "fromHexReverseArray");
function toHexReverseArray(value) {
  const sum = [];
  for (let i = 0; i < value.length; i++) {
    let s = Number(value[i]);
    for (let j = 0; s || j < sum.length; j++) {
      s += (sum[j] || 0) * 10;
      sum[j] = s % 16;
      s = (s - sum[j]) / 16;
    }
  }
  return sum;
}
__name(toHexReverseArray, "toHexReverseArray");
function splitBigInt(value) {
  const sum = toHexReverseArray(value);
  const parts = Array(PARTS);
  for (let i = 0; i < PARTS; i++) {
    parts[PARTS - 1 - i] = fromHexReverseArray(sum, i * PARTS, PARTS);
  }
  return parts;
}
__name(splitBigInt, "splitBigInt");
const _HighLow = class _HighLow {
  static fromString(value) {
    return new _HighLow(splitBigInt(value), value);
  }
  static fromBit(index) {
    const parts = Array(PARTS);
    const offset = Math.floor(index / SMALL_INT);
    for (let i = 0; i < PARTS; i++) {
      parts[PARTS - 1 - i] = i === offset ? 1 << index - offset * SMALL_INT : 0;
    }
    return new _HighLow(parts);
  }
  constructor(parts, str) {
    this.parts = parts;
    this.str = str;
  }
  and({ parts }) {
    return new _HighLow(this.parts.map((v, i) => v & parts[i]));
  }
  or({ parts }) {
    return new _HighLow(this.parts.map((v, i) => v | parts[i]));
  }
  xor({ parts }) {
    return new _HighLow(this.parts.map((v, i) => v ^ parts[i]));
  }
  not() {
    return new _HighLow(this.parts.map((v) => ~v));
  }
  equals({ parts }) {
    return this.parts.every((v, i) => v === parts[i]);
  }
  /**
   * For the average case the string representation is provided, but
   * when we need to convert high and low to string we just let the
   * slower big-integer library do it.
   */
  toString() {
    if (this.str != null) {
      return this.str;
    }
    const array = new Array(MAX_BIG_INT / 4);
    this.parts.forEach((value, offset) => {
      const hex = toHexReverseArray(value.toString());
      for (let i = 0; i < 4; i++) {
        array[i + offset * 4] = hex[4 - 1 - i] || 0;
      }
    });
    return this.str = bigInt.fromArray(array, 16).toString();
  }
  toJSON() {
    return this.toString();
  }
};
__name(_HighLow, "HighLow");
let HighLow = _HighLow;
const SUPPORTS_BIGINT = checkBrowserSupportsBigInt();
if (SUPPORTS_BIGINT && BigInt.prototype.toJSON == null) {
  BigInt.prototype.toJSON = function() {
    return this.toString();
  };
}
const HIGH_LOW_CACHE = {};
const convertToBigFlag = SUPPORTS_BIGINT ? /* @__PURE__ */ __name(function convertToBigFlagBigInt(value) {
  return BigInt(value);
}, "convertToBigFlagBigInt") : /* @__PURE__ */ __name(function convertToBigFlagHighLow(value) {
  if (value instanceof HighLow) {
    return value;
  }
  if (typeof value === "number") {
    value = value.toString();
  }
  if (HIGH_LOW_CACHE[value] != null) {
    return HIGH_LOW_CACHE[value];
  }
  HIGH_LOW_CACHE[value] = HighLow.fromString(value);
  return HIGH_LOW_CACHE[value];
}, "convertToBigFlagHighLow");
const EMPTY_FLAG = convertToBigFlag(0);
const flagAnd = SUPPORTS_BIGINT ? /* @__PURE__ */ __name(function flagAndBigInt(first = EMPTY_FLAG, second = EMPTY_FLAG) {
  return first & second;
}, "flagAndBigInt") : /* @__PURE__ */ __name(function flagAndHighLow(first = EMPTY_FLAG, second = EMPTY_FLAG) {
  return first.and(second);
}, "flagAndHighLow");
const flagOr = SUPPORTS_BIGINT ? /* @__PURE__ */ __name(function flagOrBigInt(first = EMPTY_FLAG, second = EMPTY_FLAG) {
  return first | second;
}, "flagOrBigInt") : /* @__PURE__ */ __name(function flagOrHighLow(first = EMPTY_FLAG, second = EMPTY_FLAG) {
  return first.or(second);
}, "flagOrHighLow");
const flagXor = SUPPORTS_BIGINT ? /* @__PURE__ */ __name(function flagXorBigInt(first = EMPTY_FLAG, second = EMPTY_FLAG) {
  return first ^ second;
}, "flagXorBigInt") : /* @__PURE__ */ __name(function flagXorHighLow(first = EMPTY_FLAG, second = EMPTY_FLAG) {
  return first.xor(second);
}, "flagXorHighLow");
const flagNot = SUPPORTS_BIGINT ? /* @__PURE__ */ __name(function flagNotBigInt(first = EMPTY_FLAG) {
  return ~first;
}, "flagNotBigInt") : /* @__PURE__ */ __name(function flagNotHighLow(first = EMPTY_FLAG) {
  return first.not();
}, "flagNotHighLow");
const flagEquals = SUPPORTS_BIGINT ? /* @__PURE__ */ __name(function flagEqualsBigInt(first, second) {
  return first === second;
}, "flagEqualsBigInt") : /* @__PURE__ */ __name(function flagEqualsHighLow(first, second) {
  if (first == null || second == null) {
    return first == second;
  }
  return first.equals(second);
}, "flagEqualsHighLow");
function flagOrMultiple(...flags) {
  let result = flags[0];
  for (let i = 1; i < flags.length; i++) {
    result = flagOr(result, flags[i]);
  }
  return result;
}
__name(flagOrMultiple, "flagOrMultiple");
function flagHas(base, flag) {
  return flagEquals(flagAnd(base, flag), flag);
}
__name(flagHas, "flagHas");
function flagHasAny(base, flag) {
  return !flagEquals(flagAnd(base, flag), EMPTY_FLAG);
}
__name(flagHasAny, "flagHasAny");
function flagAdd(base, flag) {
  return flag === EMPTY_FLAG ? base : flagOr(base, flag);
}
__name(flagAdd, "flagAdd");
function flagRemove(base, flag) {
  return flag === EMPTY_FLAG ? base : flagXor(base, flagAnd(base, flag));
}
__name(flagRemove, "flagRemove");
const getFlag = SUPPORTS_BIGINT ? /* @__PURE__ */ __name(function getFlagBigInt(index) {
  return BigInt(1) << BigInt(index);
}, "getFlagBigInt") : /* @__PURE__ */ __name(function getFlagHighLow(index) {
  return HighLow.fromBit(index);
}, "getFlagHighLow");
var BigFlagUtils = {
  combine: flagOrMultiple,
  add: flagAdd,
  remove: flagRemove,
  filter: flagAnd,
  invert: flagNot,
  has: flagHas,
  hasAny: flagHasAny,
  equals: flagEquals,
  deserialize: convertToBigFlag,
  getFlag
};
var RPCCloseCodes;
(function(RPCCloseCodes2) {
  RPCCloseCodes2[RPCCloseCodes2["CLOSE_NORMAL"] = 1e3] = "CLOSE_NORMAL";
  RPCCloseCodes2[RPCCloseCodes2["CLOSE_UNSUPPORTED"] = 1003] = "CLOSE_UNSUPPORTED";
  RPCCloseCodes2[RPCCloseCodes2["CLOSE_ABNORMAL"] = 1006] = "CLOSE_ABNORMAL";
  RPCCloseCodes2[RPCCloseCodes2["INVALID_CLIENTID"] = 4e3] = "INVALID_CLIENTID";
  RPCCloseCodes2[RPCCloseCodes2["INVALID_ORIGIN"] = 4001] = "INVALID_ORIGIN";
  RPCCloseCodes2[RPCCloseCodes2["RATELIMITED"] = 4002] = "RATELIMITED";
  RPCCloseCodes2[RPCCloseCodes2["TOKEN_REVOKED"] = 4003] = "TOKEN_REVOKED";
  RPCCloseCodes2[RPCCloseCodes2["INVALID_VERSION"] = 4004] = "INVALID_VERSION";
  RPCCloseCodes2[RPCCloseCodes2["INVALID_ENCODING"] = 4005] = "INVALID_ENCODING";
})(RPCCloseCodes || (RPCCloseCodes = {}));
var RPCErrorCodes;
(function(RPCErrorCodes2) {
  RPCErrorCodes2[RPCErrorCodes2["INVALID_PAYLOAD"] = 4e3] = "INVALID_PAYLOAD";
  RPCErrorCodes2[RPCErrorCodes2["INVALID_COMMAND"] = 4002] = "INVALID_COMMAND";
  RPCErrorCodes2[RPCErrorCodes2["INVALID_EVENT"] = 4004] = "INVALID_EVENT";
  RPCErrorCodes2[RPCErrorCodes2["INVALID_PERMISSIONS"] = 4006] = "INVALID_PERMISSIONS";
})(RPCErrorCodes || (RPCErrorCodes = {}));
var Orientation;
(function(Orientation2) {
  Orientation2["LANDSCAPE"] = "landscape";
  Orientation2["PORTRAIT"] = "portrait";
})(Orientation || (Orientation = {}));
var Platform;
(function(Platform2) {
  Platform2["MOBILE"] = "mobile";
  Platform2["DESKTOP"] = "desktop";
})(Platform || (Platform = {}));
Object.freeze({
  CREATE_INSTANT_INVITE: BigFlagUtils.getFlag(0),
  KICK_MEMBERS: BigFlagUtils.getFlag(1),
  BAN_MEMBERS: BigFlagUtils.getFlag(2),
  ADMINISTRATOR: BigFlagUtils.getFlag(3),
  MANAGE_CHANNELS: BigFlagUtils.getFlag(4),
  MANAGE_GUILD: BigFlagUtils.getFlag(5),
  ADD_REACTIONS: BigFlagUtils.getFlag(6),
  VIEW_AUDIT_LOG: BigFlagUtils.getFlag(7),
  PRIORITY_SPEAKER: BigFlagUtils.getFlag(8),
  STREAM: BigFlagUtils.getFlag(9),
  VIEW_CHANNEL: BigFlagUtils.getFlag(10),
  SEND_MESSAGES: BigFlagUtils.getFlag(11),
  SEND_TTS_MESSAGES: BigFlagUtils.getFlag(12),
  MANAGE_MESSAGES: BigFlagUtils.getFlag(13),
  EMBED_LINKS: BigFlagUtils.getFlag(14),
  ATTACH_FILES: BigFlagUtils.getFlag(15),
  READ_MESSAGE_HISTORY: BigFlagUtils.getFlag(16),
  MENTION_EVERYONE: BigFlagUtils.getFlag(17),
  USE_EXTERNAL_EMOJIS: BigFlagUtils.getFlag(18),
  VIEW_GUILD_INSIGHTS: BigFlagUtils.getFlag(19),
  CONNECT: BigFlagUtils.getFlag(20),
  SPEAK: BigFlagUtils.getFlag(21),
  MUTE_MEMBERS: BigFlagUtils.getFlag(22),
  DEAFEN_MEMBERS: BigFlagUtils.getFlag(23),
  MOVE_MEMBERS: BigFlagUtils.getFlag(24),
  USE_VAD: BigFlagUtils.getFlag(25),
  CHANGE_NICKNAME: BigFlagUtils.getFlag(26),
  MANAGE_NICKNAMES: BigFlagUtils.getFlag(27),
  MANAGE_ROLES: BigFlagUtils.getFlag(28),
  MANAGE_WEBHOOKS: BigFlagUtils.getFlag(29),
  MANAGE_GUILD_EXPRESSIONS: BigFlagUtils.getFlag(30),
  USE_APPLICATION_COMMANDS: BigFlagUtils.getFlag(31),
  REQUEST_TO_SPEAK: BigFlagUtils.getFlag(32),
  MANAGE_EVENTS: BigFlagUtils.getFlag(33),
  MANAGE_THREADS: BigFlagUtils.getFlag(34),
  CREATE_PUBLIC_THREADS: BigFlagUtils.getFlag(35),
  CREATE_PRIVATE_THREADS: BigFlagUtils.getFlag(36),
  USE_EXTERNAL_STICKERS: BigFlagUtils.getFlag(37),
  SEND_MESSAGES_IN_THREADS: BigFlagUtils.getFlag(38),
  USE_EMBEDDED_ACTIVITIES: BigFlagUtils.getFlag(39),
  MODERATE_MEMBERS: BigFlagUtils.getFlag(40),
  VIEW_CREATOR_MONETIZATION_ANALYTICS: BigFlagUtils.getFlag(41),
  USE_SOUNDBOARD: BigFlagUtils.getFlag(42),
  CREATE_GUILD_EXPRESSIONS: BigFlagUtils.getFlag(43),
  CREATE_EVENTS: BigFlagUtils.getFlag(44),
  USE_EXTERNAL_SOUNDS: BigFlagUtils.getFlag(45),
  SEND_VOICE_MESSAGES: BigFlagUtils.getFlag(46),
  SEND_POLLS: BigFlagUtils.getFlag(49),
  USE_EXTERNAL_APPS: BigFlagUtils.getFlag(50)
});
const UNKNOWN_VERSION_NUMBER = -1;
const HANDSHAKE_SDK_VERSION_MINIMUM_MOBILE_VERSION = 250;
function zodCoerceUnhandledValue(inputObject) {
  return preprocessType((arg) => {
    var _a3;
    const [objectKey] = (_a3 = Object.entries(inputObject).find(([, value]) => value === arg)) !== null && _a3 !== void 0 ? _a3 : [];
    if (arg != null && objectKey === void 0) {
      return inputObject.UNHANDLED;
    }
    return arg;
  }, stringType().or(numberType()));
}
__name(zodCoerceUnhandledValue, "zodCoerceUnhandledValue");
function fallbackToDefault(schema2) {
  const transform2 = custom().transform((data) => {
    const res = schema2.safeParse(data);
    if (res.success) {
      return res.data;
    }
    return schema2._def.defaultValue();
  });
  transform2.overlayType = schema2;
  return transform2;
}
__name(fallbackToDefault, "fallbackToDefault");
const InitiateImageUploadResponseSchema = z.object({ image_url: z.string() });
const OpenShareMomentDialogRequestSchema = z.object({ mediaUrl: z.string().max(1024) });
const AuthenticateRequestSchema = z.object({ access_token: z.union([z.string(), z.null()]).optional() });
const AuthenticateResponseSchema = z.object({
  access_token: z.string(),
  user: z.object({
    username: z.string(),
    discriminator: z.string(),
    id: z.string(),
    avatar: z.union([z.string(), z.null()]).optional(),
    public_flags: z.number(),
    global_name: z.union([z.string(), z.null()]).optional()
  }),
  scopes: z.array(fallbackToDefault(z.enum([
    "identify",
    "email",
    "connections",
    "guilds",
    "guilds.join",
    "guilds.members.read",
    "guilds.channels.read",
    "gdm.join",
    "bot",
    "rpc",
    "rpc.notifications.read",
    "rpc.voice.read",
    "rpc.voice.write",
    "rpc.video.read",
    "rpc.video.write",
    "rpc.screenshare.read",
    "rpc.screenshare.write",
    "rpc.activities.write",
    "webhook.incoming",
    "messages.read",
    "applications.builds.upload",
    "applications.builds.read",
    "applications.commands",
    "applications.commands.permissions.update",
    "applications.commands.update",
    "applications.store.update",
    "applications.entitlements",
    "activities.read",
    "activities.write",
    "relationships.read",
    "relationships.write",
    "voice",
    "dm_channels.read",
    "role_connections.write",
    "presences.read",
    "presences.write",
    "openid",
    "dm_channels.messages.read",
    "dm_channels.messages.write",
    "gateway.connect",
    "account.global_name.update",
    "payment_sources.country_code",
    "sdk.social_layer"
  ]).or(z.literal(-1)).default(-1))),
  expires: z.string(),
  application: z.object({
    description: z.string(),
    icon: z.union([z.string(), z.null()]).optional(),
    id: z.string(),
    rpc_origins: z.array(z.string()).optional(),
    name: z.string()
  })
});
const GetActivityInstanceConnectedParticipantsResponseSchema = z.object({
  participants: z.array(z.object({
    id: z.string(),
    username: z.string(),
    global_name: z.union([z.string(), z.null()]).optional(),
    discriminator: z.string(),
    avatar: z.union([z.string(), z.null()]).optional(),
    flags: z.number(),
    bot: z.boolean(),
    avatar_decoration_data: z.union([z.object({ asset: z.string(), skuId: z.string().optional() }), z.null()]).optional(),
    premium_type: z.union([z.number(), z.null()]).optional(),
    nickname: z.string().optional()
  }))
});
const ShareInteractionRequestSchema = z.object({
  command: z.string(),
  content: z.string().max(2e3).optional(),
  preview_image: z.object({ height: z.number(), url: z.string(), width: z.number() }).optional(),
  components: z.array(z.object({
    type: z.literal(1),
    components: z.array(z.object({
      type: z.literal(2),
      style: z.number().gte(1).lte(5),
      label: z.string().max(80).optional(),
      custom_id: z.string().max(100).describe("Developer-defined identifier for the button; max 100 characters").optional()
    })).max(5).optional()
  })).optional()
});
const ShareLinkRequestSchema = z.object({
  referrer_id: z.string().max(64).optional(),
  custom_id: z.string().max(64).optional(),
  message: z.string().max(1e3)
});
const ShareLinkResponseSchema = z.object({ success: z.boolean() });
var Command;
(function(Command2) {
  Command2["INITIATE_IMAGE_UPLOAD"] = "INITIATE_IMAGE_UPLOAD";
  Command2["OPEN_SHARE_MOMENT_DIALOG"] = "OPEN_SHARE_MOMENT_DIALOG";
  Command2["AUTHENTICATE"] = "AUTHENTICATE";
  Command2["GET_ACTIVITY_INSTANCE_CONNECTED_PARTICIPANTS"] = "GET_ACTIVITY_INSTANCE_CONNECTED_PARTICIPANTS";
  Command2["SHARE_INTERACTION"] = "SHARE_INTERACTION";
  Command2["SHARE_LINK"] = "SHARE_LINK";
})(Command || (Command = {}));
const emptyResponseSchema = z.object({}).optional().nullable();
const emptyRequestSchema = z.void();
const Schemas = {
  [Command.INITIATE_IMAGE_UPLOAD]: {
    request: emptyRequestSchema,
    response: InitiateImageUploadResponseSchema
  },
  [Command.OPEN_SHARE_MOMENT_DIALOG]: {
    request: OpenShareMomentDialogRequestSchema,
    response: emptyResponseSchema
  },
  [Command.AUTHENTICATE]: {
    request: AuthenticateRequestSchema,
    response: AuthenticateResponseSchema
  },
  [Command.GET_ACTIVITY_INSTANCE_CONNECTED_PARTICIPANTS]: {
    request: emptyRequestSchema,
    response: GetActivityInstanceConnectedParticipantsResponseSchema
  },
  [Command.SHARE_INTERACTION]: {
    request: ShareInteractionRequestSchema,
    response: emptyResponseSchema
  },
  [Command.SHARE_LINK]: {
    request: ShareLinkRequestSchema,
    response: ShareLinkResponseSchema
  }
};
const DISPATCH = "DISPATCH";
var Commands;
(function(Commands2) {
  Commands2["AUTHORIZE"] = "AUTHORIZE";
  Commands2["AUTHENTICATE"] = "AUTHENTICATE";
  Commands2["GET_GUILDS"] = "GET_GUILDS";
  Commands2["GET_GUILD"] = "GET_GUILD";
  Commands2["GET_CHANNEL"] = "GET_CHANNEL";
  Commands2["GET_CHANNELS"] = "GET_CHANNELS";
  Commands2["SELECT_VOICE_CHANNEL"] = "SELECT_VOICE_CHANNEL";
  Commands2["SELECT_TEXT_CHANNEL"] = "SELECT_TEXT_CHANNEL";
  Commands2["SUBSCRIBE"] = "SUBSCRIBE";
  Commands2["UNSUBSCRIBE"] = "UNSUBSCRIBE";
  Commands2["CAPTURE_SHORTCUT"] = "CAPTURE_SHORTCUT";
  Commands2["SET_CERTIFIED_DEVICES"] = "SET_CERTIFIED_DEVICES";
  Commands2["SET_ACTIVITY"] = "SET_ACTIVITY";
  Commands2["GET_SKUS"] = "GET_SKUS";
  Commands2["GET_ENTITLEMENTS"] = "GET_ENTITLEMENTS";
  Commands2["GET_SKUS_EMBEDDED"] = "GET_SKUS_EMBEDDED";
  Commands2["GET_ENTITLEMENTS_EMBEDDED"] = "GET_ENTITLEMENTS_EMBEDDED";
  Commands2["START_PURCHASE"] = "START_PURCHASE";
  Commands2["SET_CONFIG"] = "SET_CONFIG";
  Commands2["SEND_ANALYTICS_EVENT"] = "SEND_ANALYTICS_EVENT";
  Commands2["USER_SETTINGS_GET_LOCALE"] = "USER_SETTINGS_GET_LOCALE";
  Commands2["OPEN_EXTERNAL_LINK"] = "OPEN_EXTERNAL_LINK";
  Commands2["ENCOURAGE_HW_ACCELERATION"] = "ENCOURAGE_HW_ACCELERATION";
  Commands2["CAPTURE_LOG"] = "CAPTURE_LOG";
  Commands2["SET_ORIENTATION_LOCK_STATE"] = "SET_ORIENTATION_LOCK_STATE";
  Commands2["OPEN_INVITE_DIALOG"] = "OPEN_INVITE_DIALOG";
  Commands2["GET_PLATFORM_BEHAVIORS"] = "GET_PLATFORM_BEHAVIORS";
  Commands2["GET_CHANNEL_PERMISSIONS"] = "GET_CHANNEL_PERMISSIONS";
  Commands2["OPEN_SHARE_MOMENT_DIALOG"] = "OPEN_SHARE_MOMENT_DIALOG";
  Commands2["INITIATE_IMAGE_UPLOAD"] = "INITIATE_IMAGE_UPLOAD";
  Commands2["GET_ACTIVITY_INSTANCE_CONNECTED_PARTICIPANTS"] = "GET_ACTIVITY_INSTANCE_CONNECTED_PARTICIPANTS";
  Commands2["SHARE_LINK"] = "SHARE_LINK";
})(Commands || (Commands = {}));
const ReceiveFramePayload = objectType({
  cmd: stringType(),
  data: unknownType(),
  evt: nullType(),
  nonce: stringType()
}).passthrough();
const ScopesObject = Object.assign(Object.assign({}, AuthenticateResponseSchema.shape.scopes.element.overlayType._def.innerType.options[0].Values), { UNHANDLED: -1 });
zodCoerceUnhandledValue(ScopesObject);
const User = objectType({
  id: stringType(),
  username: stringType(),
  discriminator: stringType(),
  global_name: stringType().optional().nullable(),
  avatar: stringType().optional().nullable(),
  avatar_decoration_data: objectType({
    asset: stringType(),
    sku_id: stringType().optional()
  }).nullable(),
  bot: booleanType(),
  flags: numberType().optional().nullable(),
  premium_type: numberType().optional().nullable()
});
const GuildMember = objectType({
  user: User,
  nick: stringType().optional().nullable(),
  roles: arrayType(stringType()),
  joined_at: stringType(),
  deaf: booleanType(),
  mute: booleanType()
});
const GuildMemberRPC = objectType({
  user_id: stringType(),
  nick: stringType().optional().nullable(),
  guild_id: stringType(),
  avatar: stringType().optional().nullable(),
  avatar_decoration_data: objectType({
    asset: stringType(),
    sku_id: stringType().optional().nullable()
  }).optional().nullable(),
  color_string: stringType().optional().nullable()
});
const Emoji = objectType({
  id: stringType(),
  name: stringType().optional().nullable(),
  roles: arrayType(stringType()).optional().nullable(),
  user: User.optional().nullable(),
  require_colons: booleanType().optional().nullable(),
  managed: booleanType().optional().nullable(),
  animated: booleanType().optional().nullable(),
  available: booleanType().optional().nullable()
});
const VoiceState = objectType({
  mute: booleanType(),
  deaf: booleanType(),
  self_mute: booleanType(),
  self_deaf: booleanType(),
  suppress: booleanType()
});
const UserVoiceState = objectType({
  mute: booleanType(),
  nick: stringType(),
  user: User,
  voice_state: VoiceState,
  volume: numberType()
});
const StatusObject = {
  UNHANDLED: -1,
  IDLE: "idle",
  DND: "dnd",
  ONLINE: "online",
  OFFLINE: "offline"
};
const Status = zodCoerceUnhandledValue(StatusObject);
const Activity = objectType({
  name: stringType(),
  type: numberType(),
  url: stringType().optional().nullable(),
  created_at: numberType().optional().nullable(),
  timestamps: objectType({
    start: numberType(),
    end: numberType()
  }).partial().optional().nullable(),
  application_id: stringType().optional().nullable(),
  details: stringType().optional().nullable(),
  state: stringType().optional().nullable(),
  emoji: Emoji.optional().nullable(),
  party: objectType({
    id: stringType().optional().nullable(),
    size: arrayType(numberType()).optional().nullable()
  }).optional().nullable(),
  assets: objectType({
    large_image: stringType().nullable(),
    large_text: stringType().nullable(),
    small_image: stringType().nullable(),
    small_text: stringType().nullable()
  }).partial().optional().nullable(),
  secrets: objectType({
    join: stringType(),
    match: stringType()
  }).partial().optional().nullable(),
  instance: booleanType().optional().nullable(),
  flags: numberType().optional().nullable()
});
const PermissionOverwriteTypeObject = {
  UNHANDLED: -1,
  ROLE: 0,
  MEMBER: 1
};
const PermissionOverwrite = objectType({
  id: stringType(),
  type: zodCoerceUnhandledValue(PermissionOverwriteTypeObject),
  allow: stringType(),
  deny: stringType()
});
const ChannelTypesObject = {
  UNHANDLED: -1,
  DM: 1,
  GROUP_DM: 3,
  GUILD_TEXT: 0,
  GUILD_VOICE: 2,
  GUILD_CATEGORY: 4,
  GUILD_ANNOUNCEMENT: 5,
  GUILD_STORE: 6,
  ANNOUNCEMENT_THREAD: 10,
  PUBLIC_THREAD: 11,
  PRIVATE_THREAD: 12,
  GUILD_STAGE_VOICE: 13,
  GUILD_DIRECTORY: 14,
  GUILD_FORUM: 15
};
const Channel = objectType({
  id: stringType(),
  type: zodCoerceUnhandledValue(ChannelTypesObject),
  guild_id: stringType().optional().nullable(),
  position: numberType().optional().nullable(),
  permission_overwrites: arrayType(PermissionOverwrite).optional().nullable(),
  name: stringType().optional().nullable(),
  topic: stringType().optional().nullable(),
  nsfw: booleanType().optional().nullable(),
  last_message_id: stringType().optional().nullable(),
  bitrate: numberType().optional().nullable(),
  user_limit: numberType().optional().nullable(),
  rate_limit_per_user: numberType().optional().nullable(),
  recipients: arrayType(User).optional().nullable(),
  icon: stringType().optional().nullable(),
  owner_id: stringType().optional().nullable(),
  application_id: stringType().optional().nullable(),
  parent_id: stringType().optional().nullable(),
  last_pin_timestamp: stringType().optional().nullable()
});
const PresenceUpdate = objectType({
  user: User,
  guild_id: stringType(),
  status: Status,
  activities: arrayType(Activity),
  client_status: objectType({
    desktop: Status,
    mobile: Status,
    web: Status
  }).partial()
});
const Role = objectType({
  id: stringType(),
  name: stringType(),
  color: numberType(),
  hoist: booleanType(),
  position: numberType(),
  permissions: stringType(),
  managed: booleanType(),
  mentionable: booleanType()
});
objectType({
  id: stringType(),
  name: stringType(),
  owner_id: stringType(),
  icon: stringType().nullable(),
  icon_hash: stringType().optional().nullable(),
  splash: stringType().nullable(),
  discovery_splash: stringType().nullable(),
  owner: booleanType().optional().nullable(),
  permissions: stringType().optional().nullable(),
  region: stringType(),
  afk_channel_id: stringType().nullable(),
  afk_timeout: numberType(),
  widget_enabled: booleanType().optional().nullable(),
  widget_channel_id: stringType().optional().nullable(),
  verification_level: numberType(),
  default_message_notifications: numberType(),
  explicit_content_filter: numberType(),
  roles: arrayType(Role),
  emojis: arrayType(Emoji),
  features: arrayType(stringType()),
  mfa_level: numberType(),
  application_id: stringType().nullable(),
  system_channel_id: stringType().nullable(),
  system_channel_flags: numberType(),
  rules_channel_id: stringType().nullable(),
  joined_at: stringType().optional().nullable(),
  large: booleanType().optional().nullable(),
  unavailable: booleanType().optional().nullable(),
  member_count: numberType().optional().nullable(),
  voice_states: arrayType(VoiceState).optional().nullable(),
  members: arrayType(GuildMember).optional().nullable(),
  channels: arrayType(Channel).optional().nullable(),
  presences: arrayType(PresenceUpdate).optional().nullable(),
  max_presences: numberType().optional().nullable(),
  max_members: numberType().optional().nullable(),
  vanity_url_code: stringType().nullable(),
  description: stringType().nullable(),
  banner: stringType().nullable(),
  premium_tier: numberType(),
  premium_subscription_count: numberType().optional().nullable(),
  preferred_locale: stringType(),
  public_updates_channel_id: stringType().nullable(),
  max_video_channel_users: numberType().optional().nullable(),
  approximate_member_count: numberType().optional().nullable(),
  approximate_presence_count: numberType().optional().nullable()
});
const ChannelMention = objectType({
  id: stringType(),
  guild_id: stringType(),
  type: numberType(),
  name: stringType()
});
const Attachment = objectType({
  id: stringType(),
  filename: stringType(),
  size: numberType(),
  url: stringType(),
  proxy_url: stringType(),
  height: numberType().optional().nullable(),
  width: numberType().optional().nullable()
});
const EmbedFooter = objectType({
  text: stringType(),
  icon_url: stringType().optional().nullable(),
  proxy_icon_url: stringType().optional().nullable()
});
const Image = objectType({
  url: stringType().optional().nullable(),
  proxy_url: stringType().optional().nullable(),
  height: numberType().optional().nullable(),
  width: numberType().optional().nullable()
});
const Video = Image.omit({ proxy_url: true });
const EmbedProvider = objectType({
  name: stringType().optional().nullable(),
  url: stringType().optional().nullable()
});
const EmbedAuthor = objectType({
  name: stringType().optional().nullable(),
  url: stringType().optional().nullable(),
  icon_url: stringType().optional().nullable(),
  proxy_icon_url: stringType().optional().nullable()
});
const EmbedField = objectType({
  name: stringType(),
  value: stringType(),
  inline: booleanType()
});
const Embed = objectType({
  title: stringType().optional().nullable(),
  type: stringType().optional().nullable(),
  description: stringType().optional().nullable(),
  url: stringType().optional().nullable(),
  timestamp: stringType().optional().nullable(),
  color: numberType().optional().nullable(),
  footer: EmbedFooter.optional().nullable(),
  image: Image.optional().nullable(),
  thumbnail: Image.optional().nullable(),
  video: Video.optional().nullable(),
  provider: EmbedProvider.optional().nullable(),
  author: EmbedAuthor.optional().nullable(),
  fields: arrayType(EmbedField).optional().nullable()
});
const Reaction = objectType({
  count: numberType(),
  me: booleanType(),
  emoji: Emoji
});
const MessageActivity = objectType({
  type: numberType(),
  party_id: stringType().optional().nullable()
});
const MessageApplication = objectType({
  id: stringType(),
  cover_image: stringType().optional().nullable(),
  description: stringType(),
  icon: stringType().optional().nullable(),
  name: stringType()
});
const MessageReference = objectType({
  message_id: stringType().optional().nullable(),
  channel_id: stringType().optional().nullable(),
  guild_id: stringType().optional().nullable()
});
const Message = objectType({
  id: stringType(),
  channel_id: stringType(),
  guild_id: stringType().optional().nullable(),
  author: User.optional().nullable(),
  member: GuildMember.optional().nullable(),
  content: stringType(),
  timestamp: stringType(),
  edited_timestamp: stringType().optional().nullable(),
  tts: booleanType(),
  mention_everyone: booleanType(),
  mentions: arrayType(User),
  mention_roles: arrayType(stringType()),
  mention_channels: arrayType(ChannelMention),
  attachments: arrayType(Attachment),
  embeds: arrayType(Embed),
  reactions: arrayType(Reaction).optional().nullable(),
  nonce: unionType([stringType(), numberType()]).optional().nullable(),
  pinned: booleanType(),
  webhook_id: stringType().optional().nullable(),
  type: numberType(),
  activity: MessageActivity.optional().nullable(),
  application: MessageApplication.optional().nullable(),
  message_reference: MessageReference.optional().nullable(),
  flags: numberType().optional().nullable(),
  stickers: arrayType(unknownType()).optional().nullable(),
  // Cannot self reference, but this is possibly a Message
  referenced_message: unknownType().optional().nullable()
});
const VoiceDevice = objectType({
  id: stringType(),
  name: stringType()
});
const KeyTypesObject = {
  UNHANDLED: -1,
  KEYBOARD_KEY: 0,
  MOUSE_BUTTON: 1,
  KEYBOARD_MODIFIER_KEY: 2,
  GAMEPAD_BUTTON: 3
};
const ShortcutKey = objectType({
  type: zodCoerceUnhandledValue(KeyTypesObject),
  code: numberType(),
  name: stringType()
});
const VoiceSettingModeTypeObject = {
  UNHANDLED: -1,
  PUSH_TO_TALK: "PUSH_TO_TALK",
  VOICE_ACTIVITY: "VOICE_ACTIVITY"
};
const VoiceSettingsMode = objectType({
  type: zodCoerceUnhandledValue(VoiceSettingModeTypeObject),
  auto_threshold: booleanType(),
  threshold: numberType(),
  shortcut: arrayType(ShortcutKey),
  delay: numberType()
});
const VoiceSettingsIO = objectType({
  device_id: stringType(),
  volume: numberType(),
  available_devices: arrayType(VoiceDevice)
});
const CertifiedDeviceTypeObject = {
  UNHANDLED: -1,
  AUDIO_INPUT: "AUDIO_INPUT",
  AUDIO_OUTPUT: "AUDIO_OUTPUT",
  VIDEO_INPUT: "VIDEO_INPUT"
};
objectType({
  type: zodCoerceUnhandledValue(CertifiedDeviceTypeObject),
  id: stringType(),
  vendor: objectType({
    name: stringType(),
    url: stringType()
  }),
  model: objectType({
    name: stringType(),
    url: stringType()
  }),
  related: arrayType(stringType()),
  echo_cancellation: booleanType().optional().nullable(),
  noise_suppression: booleanType().optional().nullable(),
  automatic_gain_control: booleanType().optional().nullable(),
  hardware_mute: booleanType().optional().nullable()
});
const SkuTypeObject = {
  UNHANDLED: -1,
  APPLICATION: 1,
  DLC: 2,
  CONSUMABLE: 3,
  BUNDLE: 4,
  SUBSCRIPTION: 5
};
const Sku = objectType({
  id: stringType(),
  name: stringType(),
  type: zodCoerceUnhandledValue(SkuTypeObject),
  price: objectType({
    amount: numberType(),
    currency: stringType()
  }),
  application_id: stringType(),
  flags: numberType(),
  release_date: stringType().nullable()
});
const EntitlementTypesObject = {
  UNHANDLED: -1,
  PURCHASE: 1,
  PREMIUM_SUBSCRIPTION: 2,
  DEVELOPER_GIFT: 3,
  TEST_MODE_PURCHASE: 4,
  FREE_PURCHASE: 5,
  USER_GIFT: 6,
  PREMIUM_PURCHASE: 7
};
const Entitlement = objectType({
  id: stringType(),
  sku_id: stringType(),
  application_id: stringType(),
  user_id: stringType(),
  gift_code_flags: numberType(),
  type: zodCoerceUnhandledValue(EntitlementTypesObject),
  gifter_user_id: stringType().optional().nullable(),
  branches: arrayType(stringType()).optional().nullable(),
  starts_at: stringType().optional().nullable(),
  // ISO string
  ends_at: stringType().optional().nullable(),
  // ISO string
  parent_id: stringType().optional().nullable(),
  consumed: booleanType().optional().nullable(),
  deleted: booleanType().optional().nullable(),
  gift_code_batch_id: stringType().optional().nullable()
});
const OrientationLockStateTypeObject = {
  UNHANDLED: -1,
  UNLOCKED: 1,
  PORTRAIT: 2,
  LANDSCAPE: 3
};
zodCoerceUnhandledValue(OrientationLockStateTypeObject);
const ThermalStateTypeObject = {
  UNHANDLED: -1,
  NOMINAL: 0,
  FAIR: 1,
  SERIOUS: 2,
  CRITICAL: 3
};
const ThermalState = zodCoerceUnhandledValue(ThermalStateTypeObject);
const OrientationTypeObject = {
  UNHANDLED: -1,
  PORTRAIT: 0,
  LANDSCAPE: 1
};
zodCoerceUnhandledValue(OrientationTypeObject);
const LayoutModeTypeObject = {
  UNHANDLED: -1,
  FOCUSED: 0,
  PIP: 1,
  GRID: 2
};
zodCoerceUnhandledValue(LayoutModeTypeObject);
const ERROR = "ERROR";
var Events;
(function(Events2) {
  Events2["READY"] = "READY";
  Events2["VOICE_STATE_UPDATE"] = "VOICE_STATE_UPDATE";
  Events2["SPEAKING_START"] = "SPEAKING_START";
  Events2["SPEAKING_STOP"] = "SPEAKING_STOP";
  Events2["ACTIVITY_LAYOUT_MODE_UPDATE"] = "ACTIVITY_LAYOUT_MODE_UPDATE";
  Events2["ORIENTATION_UPDATE"] = "ORIENTATION_UPDATE";
  Events2["CURRENT_USER_UPDATE"] = "CURRENT_USER_UPDATE";
  Events2["CURRENT_GUILD_MEMBER_UPDATE"] = "CURRENT_GUILD_MEMBER_UPDATE";
  Events2["ENTITLEMENT_CREATE"] = "ENTITLEMENT_CREATE";
  Events2["THERMAL_STATE_UPDATE"] = "THERMAL_STATE_UPDATE";
  Events2["ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE"] = "ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE";
})(Events || (Events = {}));
const DispatchEventFrame = ReceiveFramePayload.extend({
  evt: nativeEnumType(Events),
  nonce: stringType().nullable(),
  cmd: literalType(DISPATCH),
  data: objectType({}).passthrough()
});
const ErrorEvent = ReceiveFramePayload.extend({
  evt: literalType(ERROR),
  data: objectType({
    code: numberType(),
    message: stringType().optional()
  }).passthrough(),
  cmd: nativeEnumType(Commands),
  nonce: stringType().nullable()
});
const OtherEvent = DispatchEventFrame.extend({
  evt: stringType()
});
const EventFrame = unionType([DispatchEventFrame, OtherEvent, ErrorEvent]);
function parseEventPayload(data) {
  const event = data.evt;
  if (!(event in Events)) {
    throw new Error(`Unrecognized event type ${data.evt}`);
  }
  const eventSchema = EventSchema[event];
  return eventSchema.payload.parse(data);
}
__name(parseEventPayload, "parseEventPayload");
const EventSchema = {
  /**
   * @description
   * The READY event is emitted by Discord's RPC server in reply to a client
   * initiating the RPC handshake. The event includes information about
   * - the rpc server version
   * - the discord client configuration
   * - the (basic) user object
   *
   * Unlike other events, READY will only be omitted once, immediately after the
   * Embedded App SDK is initialized
   *
   * # Supported Platforms
   * | Web | iOS | Android |
   * |-----|-----|---------|
   * | ✅  | ✅  | ✅      |
   *
   * Required scopes: []
   *
   */
  [Events.READY]: {
    payload: DispatchEventFrame.extend({
      evt: literalType(Events.READY),
      data: objectType({
        v: numberType(),
        config: objectType({
          cdn_host: stringType().optional(),
          api_endpoint: stringType(),
          environment: stringType()
        }),
        user: objectType({
          id: stringType(),
          username: stringType(),
          discriminator: stringType(),
          avatar: stringType().optional()
        }).optional()
      })
    })
  },
  [Events.VOICE_STATE_UPDATE]: {
    payload: DispatchEventFrame.extend({
      evt: literalType(Events.VOICE_STATE_UPDATE),
      data: UserVoiceState
    }),
    subscribeArgs: objectType({
      channel_id: stringType()
    })
  },
  [Events.SPEAKING_START]: {
    payload: DispatchEventFrame.extend({
      evt: literalType(Events.SPEAKING_START),
      data: objectType({
        lobby_id: stringType().optional(),
        channel_id: stringType().optional(),
        user_id: stringType()
      })
    }),
    subscribeArgs: objectType({
      lobby_id: stringType().nullable().optional(),
      channel_id: stringType().nullable().optional()
    })
  },
  [Events.SPEAKING_STOP]: {
    payload: DispatchEventFrame.extend({
      evt: literalType(Events.SPEAKING_STOP),
      data: objectType({
        lobby_id: stringType().optional(),
        channel_id: stringType().optional(),
        user_id: stringType()
      })
    }),
    subscribeArgs: objectType({
      lobby_id: stringType().nullable().optional(),
      channel_id: stringType().nullable().optional()
    })
  },
  [Events.ACTIVITY_LAYOUT_MODE_UPDATE]: {
    payload: DispatchEventFrame.extend({
      evt: literalType(Events.ACTIVITY_LAYOUT_MODE_UPDATE),
      data: objectType({
        layout_mode: zodCoerceUnhandledValue(LayoutModeTypeObject)
      })
    })
  },
  [Events.ORIENTATION_UPDATE]: {
    payload: DispatchEventFrame.extend({
      evt: literalType(Events.ORIENTATION_UPDATE),
      data: objectType({
        screen_orientation: zodCoerceUnhandledValue(OrientationTypeObject),
        /**
         * @deprecated use screen_orientation instead
         */
        orientation: nativeEnumType(Orientation)
      })
    })
  },
  [Events.CURRENT_USER_UPDATE]: {
    payload: DispatchEventFrame.extend({
      evt: literalType(Events.CURRENT_USER_UPDATE),
      data: User
    })
  },
  [Events.CURRENT_GUILD_MEMBER_UPDATE]: {
    payload: DispatchEventFrame.extend({
      evt: literalType(Events.CURRENT_GUILD_MEMBER_UPDATE),
      data: GuildMemberRPC
    }),
    subscribeArgs: objectType({
      guild_id: stringType()
    })
  },
  [Events.ENTITLEMENT_CREATE]: {
    payload: DispatchEventFrame.extend({
      evt: literalType(Events.ENTITLEMENT_CREATE),
      data: objectType({ entitlement: Entitlement })
    })
  },
  [Events.THERMAL_STATE_UPDATE]: {
    payload: DispatchEventFrame.extend({
      evt: literalType(Events.THERMAL_STATE_UPDATE),
      data: objectType({ thermal_state: ThermalState })
    })
  },
  [Events.ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE]: {
    payload: DispatchEventFrame.extend({
      evt: literalType(Events.ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE),
      data: objectType({
        participants: GetActivityInstanceConnectedParticipantsResponseSchema.shape.participants
      })
    })
  }
};
function assertUnreachable(_x, runtimeError) {
  throw runtimeError;
}
__name(assertUnreachable, "assertUnreachable");
const EmptyResponse = objectType({}).nullable();
const AuthorizeResponse = objectType({
  code: stringType()
});
const GetGuildsResponse = objectType({
  guilds: arrayType(objectType({
    id: stringType(),
    name: stringType()
  }))
});
const GetGuildResponse = objectType({
  id: stringType(),
  name: stringType(),
  icon_url: stringType().optional(),
  members: arrayType(GuildMember)
});
const GetChannelResponse = objectType({
  id: stringType(),
  type: zodCoerceUnhandledValue(ChannelTypesObject),
  guild_id: stringType().optional().nullable(),
  name: stringType().optional().nullable(),
  topic: stringType().optional().nullable(),
  bitrate: numberType().optional().nullable(),
  user_limit: numberType().optional().nullable(),
  position: numberType().optional().nullable(),
  voice_states: arrayType(UserVoiceState),
  messages: arrayType(Message)
});
const GetChannelsResponse = objectType({
  channels: arrayType(Channel)
});
GetChannelResponse.nullable();
const SelectVoiceChannelResponse = GetChannelResponse.nullable();
const SelectTextChannelResponse = GetChannelResponse.nullable();
objectType({
  input: VoiceSettingsIO,
  output: VoiceSettingsIO,
  mode: VoiceSettingsMode,
  automatic_gain_control: booleanType(),
  echo_cancellation: booleanType(),
  noise_suppression: booleanType(),
  qos: booleanType(),
  silence_warning: booleanType(),
  deaf: booleanType(),
  mute: booleanType()
});
const SubscribeResponse = objectType({
  evt: stringType()
});
const CaptureShortcutResponse = objectType({ shortcut: ShortcutKey });
const SetActivityResponse = Activity;
const GetSkusResponse = objectType({ skus: arrayType(Sku) });
const GetEntitlementsResponse = objectType({ entitlements: arrayType(Entitlement) });
const StartPurchaseResponse = arrayType(Entitlement).nullable();
const SetConfigResponse = objectType({
  use_interactive_pip: booleanType()
});
const UserSettingsGetLocaleResponse = objectType({
  locale: stringType()
});
const EncourageHardwareAccelerationResponse = objectType({
  enabled: booleanType()
});
const GetChannelPermissionsResponse = objectType({
  permissions: bigIntType().or(stringType())
});
const OpenExternalLinkResponse = fallbackToDefault(objectType({ opened: booleanType().or(nullType()) }).default({ opened: null }));
const GetPlatformBehaviorsResponse = objectType({
  iosKeyboardResizesView: optionalType(booleanType())
});
const ResponseFrame = ReceiveFramePayload.extend({
  cmd: nativeEnumType(Commands),
  evt: nullType()
});
function parseResponseData({ cmd, data }) {
  switch (cmd) {
    case Commands.AUTHORIZE:
      return AuthorizeResponse.parse(data);
    case Commands.CAPTURE_SHORTCUT:
      return CaptureShortcutResponse.parse(data);
    case Commands.ENCOURAGE_HW_ACCELERATION:
      return EncourageHardwareAccelerationResponse.parse(data);
    case Commands.GET_CHANNEL:
      return GetChannelResponse.parse(data);
    case Commands.GET_CHANNELS:
      return GetChannelsResponse.parse(data);
    case Commands.GET_CHANNEL_PERMISSIONS:
      return GetChannelPermissionsResponse.parse(data);
    case Commands.GET_GUILD:
      return GetGuildResponse.parse(data);
    case Commands.GET_GUILDS:
      return GetGuildsResponse.parse(data);
    case Commands.GET_PLATFORM_BEHAVIORS:
      return GetPlatformBehaviorsResponse.parse(data);
    case Commands.GET_CHANNEL:
      return GetChannelResponse.parse(data);
    case Commands.SELECT_TEXT_CHANNEL:
      return SelectTextChannelResponse.parse(data);
    case Commands.SELECT_VOICE_CHANNEL:
      return SelectVoiceChannelResponse.parse(data);
    case Commands.SET_ACTIVITY:
      return SetActivityResponse.parse(data);
    case Commands.GET_SKUS_EMBEDDED:
      return GetSkusResponse.parse(data);
    case Commands.GET_ENTITLEMENTS_EMBEDDED:
      return GetEntitlementsResponse.parse(data);
    case Commands.SET_CONFIG:
      return SetConfigResponse.parse(data);
    case Commands.START_PURCHASE:
      return StartPurchaseResponse.parse(data);
    case Commands.SUBSCRIBE:
    case Commands.UNSUBSCRIBE:
      return SubscribeResponse.parse(data);
    case Commands.USER_SETTINGS_GET_LOCALE:
      return UserSettingsGetLocaleResponse.parse(data);
    case Commands.OPEN_EXTERNAL_LINK:
      return OpenExternalLinkResponse.parse(data);
    case Commands.SET_ORIENTATION_LOCK_STATE:
    case Commands.SET_CERTIFIED_DEVICES:
    case Commands.SEND_ANALYTICS_EVENT:
    case Commands.OPEN_INVITE_DIALOG:
    case Commands.CAPTURE_LOG:
    case Commands.GET_SKUS:
    case Commands.GET_ENTITLEMENTS:
      return EmptyResponse.parse(data);
    case Commands.AUTHENTICATE:
    case Commands.INITIATE_IMAGE_UPLOAD:
    case Commands.OPEN_SHARE_MOMENT_DIALOG:
    case Commands.GET_ACTIVITY_INSTANCE_CONNECTED_PARTICIPANTS:
    case Commands.SHARE_LINK:
      const { response } = Schemas[cmd];
      return response.parse(data);
    default:
      assertUnreachable(cmd, new Error(`Unrecognized command ${cmd}`));
  }
}
__name(parseResponseData, "parseResponseData");
function parseResponsePayload(payload) {
  return Object.assign(Object.assign({}, payload), { data: parseResponseData(payload) });
}
__name(parseResponsePayload, "parseResponsePayload");
objectType({
  frame_id: stringType(),
  platform: nativeEnumType(Platform).optional().nullable()
});
objectType({
  v: literalType(1),
  encoding: literalType("json").optional(),
  client_id: stringType(),
  frame_id: stringType()
});
const ClosePayload = objectType({
  code: numberType(),
  message: stringType().optional()
});
const IncomingPayload = objectType({
  evt: stringType().nullable(),
  nonce: stringType().nullable(),
  data: unknownType().nullable(),
  cmd: stringType()
}).passthrough();
function parseIncomingPayload(payload) {
  const incoming = IncomingPayload.parse(payload);
  if (incoming.evt != null) {
    if (incoming.evt === ERROR) {
      return ErrorEvent.parse(incoming);
    }
    return parseEventPayload(EventFrame.parse(incoming));
  } else {
    return parseResponsePayload(ResponseFrame.passthrough().parse(incoming));
  }
}
__name(parseIncomingPayload, "parseIncomingPayload");
function commandFactory(sendCommand, cmd, response, transferTransform = () => void 0) {
  const payload = ReceiveFramePayload.extend({
    cmd: literalType(cmd),
    data: response
  });
  return async (args) => {
    const reply = await sendCommand({ cmd, args, transfer: transferTransform(args) });
    const parsed = payload.parse(reply);
    return parsed.data;
  };
}
__name(commandFactory, "commandFactory");
function schemaCommandFactory(cmd, transferTransform = () => void 0) {
  const response = Schemas[cmd].response;
  const payload = ReceiveFramePayload.extend({
    cmd: literalType(cmd),
    data: response
  });
  return (sendCommand) => async (args) => {
    const reply = await sendCommand({
      // @ts-expect-error - Merge commands
      cmd,
      args,
      transfer: transferTransform(args)
    });
    const parsed = payload.parse(reply);
    return parsed.data;
  };
}
__name(schemaCommandFactory, "schemaCommandFactory");
const authenticate = schemaCommandFactory(Command.AUTHENTICATE);
const authorize = /* @__PURE__ */ __name((sendCommand) => commandFactory(sendCommand, Commands.AUTHORIZE, AuthorizeResponse), "authorize");
const captureLog = /* @__PURE__ */ __name((sendCommand) => commandFactory(sendCommand, Commands.CAPTURE_LOG, EmptyResponse), "captureLog");
const encourageHardwareAcceleration = /* @__PURE__ */ __name((sendCommand) => commandFactory(sendCommand, Commands.ENCOURAGE_HW_ACCELERATION, EncourageHardwareAccelerationResponse), "encourageHardwareAcceleration");
const getEntitlements = /* @__PURE__ */ __name((sendCommand) => commandFactory(sendCommand, Commands.GET_ENTITLEMENTS_EMBEDDED, GetEntitlementsResponse), "getEntitlements");
const getSkus = /* @__PURE__ */ __name((sendCommand) => commandFactory(sendCommand, Commands.GET_SKUS_EMBEDDED, GetSkusResponse), "getSkus");
const getChannelPermissions = /* @__PURE__ */ __name((sendCommand) => commandFactory(sendCommand, Commands.GET_CHANNEL_PERMISSIONS, GetChannelPermissionsResponse), "getChannelPermissions");
const getPlatformBehaviors = /* @__PURE__ */ __name((sendCommand) => commandFactory(sendCommand, Commands.GET_PLATFORM_BEHAVIORS, GetPlatformBehaviorsResponse), "getPlatformBehaviors");
const openExternalLink = /* @__PURE__ */ __name((sendCommand) => commandFactory(sendCommand, Commands.OPEN_EXTERNAL_LINK, OpenExternalLinkResponse), "openExternalLink");
const openInviteDialog = /* @__PURE__ */ __name((sendCommand) => commandFactory(sendCommand, Commands.OPEN_INVITE_DIALOG, EmptyResponse), "openInviteDialog");
const openShareMomentDialog = schemaCommandFactory(Command.OPEN_SHARE_MOMENT_DIALOG);
Activity.pick({
  state: true,
  details: true,
  timestamps: true,
  assets: true,
  party: true,
  secrets: true,
  instance: true,
  type: true
}).extend({
  type: Activity.shape.type.optional(),
  instance: Activity.shape.instance.optional()
}).nullable();
const setActivity = /* @__PURE__ */ __name((sendCommand) => commandFactory(sendCommand, Commands.SET_ACTIVITY, SetActivityResponse), "setActivity");
const setConfig = /* @__PURE__ */ __name((sendCommand) => commandFactory(sendCommand, Commands.SET_CONFIG, SetConfigResponse), "setConfig");
function compatCommandFactory({ sendCommand, cmd, response, fallbackTransform: fallbackTransform2, transferTransform = /* @__PURE__ */ __name(() => void 0, "transferTransform") }) {
  const payload = ReceiveFramePayload.extend({
    cmd: literalType(cmd),
    data: response
  });
  return async (args) => {
    try {
      const reply = await sendCommand({ cmd, args, transfer: transferTransform(args) });
      const parsed = payload.parse(reply);
      return parsed.data;
    } catch (error) {
      if (error.code === RPCErrorCodes.INVALID_PAYLOAD) {
        const fallbackArgs = fallbackTransform2(args);
        const reply = await sendCommand({ cmd, args: fallbackArgs, transfer: transferTransform(fallbackArgs) });
        const parsed = payload.parse(reply);
        return parsed.data;
      } else {
        throw error;
      }
    }
  };
}
__name(compatCommandFactory, "compatCommandFactory");
const fallbackTransform = /* @__PURE__ */ __name((args) => {
  return {
    lock_state: args.lock_state,
    picture_in_picture_lock_state: args.picture_in_picture_lock_state
  };
}, "fallbackTransform");
const setOrientationLockState = /* @__PURE__ */ __name((sendCommand) => compatCommandFactory({
  sendCommand,
  cmd: Commands.SET_ORIENTATION_LOCK_STATE,
  response: EmptyResponse,
  fallbackTransform
}), "setOrientationLockState");
const shareLink = schemaCommandFactory(Command.SHARE_LINK);
const startPurchase = /* @__PURE__ */ __name((sendCommand) => commandFactory(sendCommand, Commands.START_PURCHASE, StartPurchaseResponse), "startPurchase");
const userSettingsGetLocale = /* @__PURE__ */ __name((sendCommand) => commandFactory(sendCommand, Commands.USER_SETTINGS_GET_LOCALE, UserSettingsGetLocaleResponse), "userSettingsGetLocale");
const initiateImageUpload = schemaCommandFactory(Command.INITIATE_IMAGE_UPLOAD);
const getChannel = /* @__PURE__ */ __name((sendCommand) => commandFactory(sendCommand, Commands.GET_CHANNEL, GetChannelResponse), "getChannel");
const getInstanceConnectedParticipants = schemaCommandFactory(Command.GET_ACTIVITY_INSTANCE_CONNECTED_PARTICIPANTS);
function commands(sendCommand) {
  return {
    authenticate: authenticate(sendCommand),
    authorize: authorize(sendCommand),
    captureLog: captureLog(sendCommand),
    encourageHardwareAcceleration: encourageHardwareAcceleration(sendCommand),
    getChannel: getChannel(sendCommand),
    getChannelPermissions: getChannelPermissions(sendCommand),
    getEntitlements: getEntitlements(sendCommand),
    getPlatformBehaviors: getPlatformBehaviors(sendCommand),
    getSkus: getSkus(sendCommand),
    openExternalLink: openExternalLink(sendCommand),
    openInviteDialog: openInviteDialog(sendCommand),
    openShareMomentDialog: openShareMomentDialog(sendCommand),
    setActivity: setActivity(sendCommand),
    setConfig: setConfig(sendCommand),
    setOrientationLockState: setOrientationLockState(sendCommand),
    shareLink: shareLink(sendCommand),
    startPurchase: startPurchase(sendCommand),
    userSettingsGetLocale: userSettingsGetLocale(sendCommand),
    initiateImageUpload: initiateImageUpload(sendCommand),
    getInstanceConnectedParticipants: getInstanceConnectedParticipants(sendCommand)
  };
}
__name(commands, "commands");
const _SDKError = class _SDKError extends Error {
  constructor(code, message = "") {
    super(message);
    this.code = code;
    this.message = message;
    this.name = "Discord SDK Error";
  }
};
__name(_SDKError, "SDKError");
let SDKError = _SDKError;
function getDefaultSdkConfiguration() {
  return {
    disableConsoleLogOverride: false
  };
}
__name(getDefaultSdkConfiguration, "getDefaultSdkConfiguration");
const consoleLevels = ["log", "warn", "debug", "info", "error"];
function wrapConsoleMethod(console2, level, callback) {
  const _consoleMethod = console2[level];
  const _console = console2;
  if (!_consoleMethod) {
    return;
  }
  console2[level] = function() {
    const args = [].slice.call(arguments);
    const message = "" + args.join(" ");
    callback(level, message);
    _consoleMethod.apply(_console, args);
  };
}
__name(wrapConsoleMethod, "wrapConsoleMethod");
var version = "1.9.0";
var randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
var native = {
  randomUUID
};
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
    if (!getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
  }
  return getRandomValues(rnds8);
}
__name(rng, "rng");
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}
__name(unsafeStringify, "unsafeStringify");
function v4(options, buf, offset) {
  if (native.randomUUID && true && !options) {
    return native.randomUUID();
  }
  options = options || {};
  var rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  return unsafeStringify(rnds);
}
__name(v4, "v4");
var Opcodes;
(function(Opcodes2) {
  Opcodes2[Opcodes2["HANDSHAKE"] = 0] = "HANDSHAKE";
  Opcodes2[Opcodes2["FRAME"] = 1] = "FRAME";
  Opcodes2[Opcodes2["CLOSE"] = 2] = "CLOSE";
  Opcodes2[Opcodes2["HELLO"] = 3] = "HELLO";
})(Opcodes || (Opcodes = {}));
const ALLOWED_ORIGINS = new Set(getAllowedOrigins());
function getAllowedOrigins() {
  if (typeof window === "undefined")
    return [];
  return [
    window.location.origin,
    "https://discord.com",
    "https://discordapp.com",
    "https://ptb.discord.com",
    "https://ptb.discordapp.com",
    "https://canary.discord.com",
    "https://canary.discordapp.com",
    "https://staging.discord.co",
    "http://localhost:3333",
    "https://pax.discord.com",
    "null"
  ];
}
__name(getAllowedOrigins, "getAllowedOrigins");
function getRPCServerSource() {
  var _a3;
  return [(_a3 = window.parent.opener) !== null && _a3 !== void 0 ? _a3 : window.parent, !!document.referrer ? document.referrer : "*"];
}
__name(getRPCServerSource, "getRPCServerSource");
const _DiscordSDK = class _DiscordSDK {
  getTransfer(payload) {
    var _a3;
    switch (payload.cmd) {
      case Commands.SUBSCRIBE:
      case Commands.UNSUBSCRIBE:
        return void 0;
      default:
        return (_a3 = payload.transfer) !== null && _a3 !== void 0 ? _a3 : void 0;
    }
  }
  constructor(clientId2, configuration) {
    this.sdkVersion = version;
    this.mobileAppVersion = null;
    this.source = null;
    this.sourceOrigin = "";
    this.eventBus = new EventEmitter$1();
    this.pendingCommands = /* @__PURE__ */ new Map();
    this.sendCommand = (payload) => {
      var _a3;
      if (this.source == null)
        throw new Error("Attempting to send message before initialization");
      const nonce = v4();
      (_a3 = this.source) === null || _a3 === void 0 ? void 0 : _a3.postMessage([Opcodes.FRAME, Object.assign(Object.assign({}, payload), { nonce })], this.sourceOrigin, this.getTransfer(payload));
      const promise = new Promise((resolve, reject) => {
        this.pendingCommands.set(nonce, { resolve, reject });
      });
      return promise;
    };
    this.commands = commands(this.sendCommand);
    this.handleMessage = (event) => {
      if (!ALLOWED_ORIGINS.has(event.origin))
        return;
      const tuple = event.data;
      if (!Array.isArray(tuple)) {
        return;
      }
      const [opcode, data] = tuple;
      switch (opcode) {
        case Opcodes.HELLO:
          return;
        case Opcodes.CLOSE:
          return this.handleClose(data);
        case Opcodes.HANDSHAKE:
          return this.handleHandshake();
        case Opcodes.FRAME:
          return this.handleFrame(data);
        default:
          throw new Error("Invalid message format");
      }
    };
    this.isReady = false;
    this.clientId = clientId2;
    this.configuration = configuration !== null && configuration !== void 0 ? configuration : getDefaultSdkConfiguration();
    if (typeof window !== "undefined") {
      window.addEventListener("message", this.handleMessage);
    }
    if (typeof window === "undefined") {
      this.frameId = "";
      this.instanceId = "";
      this.customId = null;
      this.referrerId = null;
      this.platform = Platform.DESKTOP;
      this.guildId = null;
      this.channelId = null;
      this.locationId = null;
      return;
    }
    const urlParams = new URLSearchParams(this._getSearch());
    const frameId = urlParams.get("frame_id");
    if (!frameId) {
      throw new Error("frame_id query param is not defined");
    }
    this.frameId = frameId;
    const instanceId = urlParams.get("instance_id");
    if (!instanceId) {
      throw new Error("instance_id query param is not defined");
    }
    this.instanceId = instanceId;
    const platform = urlParams.get("platform");
    if (!platform) {
      throw new Error("platform query param is not defined");
    } else if (platform !== Platform.DESKTOP && platform !== Platform.MOBILE) {
      throw new Error(`Invalid query param "platform" of "${platform}". Valid values are "${Platform.DESKTOP}" or "${Platform.MOBILE}"`);
    }
    this.platform = platform;
    this.customId = urlParams.get("custom_id");
    this.referrerId = urlParams.get("referrer_id");
    this.guildId = urlParams.get("guild_id");
    this.channelId = urlParams.get("channel_id");
    this.locationId = urlParams.get("location_id");
    this.mobileAppVersion = urlParams.get("mobile_app_version");
    [this.source, this.sourceOrigin] = getRPCServerSource();
    this.addOnReadyListener();
    this.handshake();
  }
  close(code, message) {
    var _a3;
    window.removeEventListener("message", this.handleMessage);
    const nonce = v4();
    (_a3 = this.source) === null || _a3 === void 0 ? void 0 : _a3.postMessage([Opcodes.CLOSE, { code, message, nonce }], this.sourceOrigin);
  }
  async subscribe(event, listener, ...rest) {
    const [subscribeArgs] = rest;
    const listenerCount = this.eventBus.listenerCount(event);
    const emitter = this.eventBus.on(event, listener);
    if (Object.values(Events).includes(event) && event !== Events.READY && listenerCount === 0) {
      await this.sendCommand({
        cmd: Commands.SUBSCRIBE,
        args: subscribeArgs,
        evt: event
      });
    }
    return emitter;
  }
  async unsubscribe(event, listener, ...rest) {
    const [unsubscribeArgs] = rest;
    if (event !== Events.READY && this.eventBus.listenerCount(event) === 1) {
      await this.sendCommand({
        cmd: Commands.UNSUBSCRIBE,
        evt: event,
        args: unsubscribeArgs
      });
    }
    return this.eventBus.off(event, listener);
  }
  async ready() {
    if (this.isReady) {
      return;
    } else {
      await new Promise((resolve) => {
        this.eventBus.once(Events.READY, resolve);
      });
    }
  }
  parseMajorMobileVersion() {
    if (this.mobileAppVersion && this.mobileAppVersion.includes(".")) {
      try {
        return parseInt(this.mobileAppVersion.split(".")[0]);
      } catch (_a3) {
        return UNKNOWN_VERSION_NUMBER;
      }
    }
    return UNKNOWN_VERSION_NUMBER;
  }
  handshake() {
    var _a3;
    const handshakePayload = {
      v: 1,
      encoding: "json",
      client_id: this.clientId,
      frame_id: this.frameId
    };
    const majorMobileVersion = this.parseMajorMobileVersion();
    if (this.platform === Platform.DESKTOP || majorMobileVersion >= HANDSHAKE_SDK_VERSION_MINIMUM_MOBILE_VERSION) {
      handshakePayload["sdk_version"] = this.sdkVersion;
    }
    (_a3 = this.source) === null || _a3 === void 0 ? void 0 : _a3.postMessage([Opcodes.HANDSHAKE, handshakePayload], this.sourceOrigin);
  }
  addOnReadyListener() {
    this.eventBus.once(Events.READY, () => {
      this.overrideConsoleLogging();
      this.isReady = true;
    });
  }
  overrideConsoleLogging() {
    if (this.configuration.disableConsoleLogOverride)
      return;
    const sendCaptureLogCommand = /* @__PURE__ */ __name((level, message) => {
      this.commands.captureLog({
        level,
        message
      });
    }, "sendCaptureLogCommand");
    consoleLevels.forEach((level) => {
      wrapConsoleMethod(console, level, sendCaptureLogCommand);
    });
  }
  handleClose(data) {
    ClosePayload.parse(data);
  }
  handleHandshake() {
  }
  handleFrame(payload) {
    var _a3, _b2;
    let parsed;
    try {
      parsed = parseIncomingPayload(payload);
    } catch (e) {
      console.error("Failed to parse", payload);
      console.error(e);
      return;
    }
    if (parsed.cmd === "DISPATCH") {
      this.eventBus.emit(parsed.evt, parsed.data);
    } else {
      if (parsed.evt === ERROR) {
        if (parsed.nonce != null) {
          (_a3 = this.pendingCommands.get(parsed.nonce)) === null || _a3 === void 0 ? void 0 : _a3.reject(parsed.data);
          this.pendingCommands.delete(parsed.nonce);
          return;
        }
        this.eventBus.emit("error", new SDKError(parsed.data.code, parsed.data.message));
      }
      if (parsed.nonce == null) {
        console.error("Missing nonce", payload);
        return;
      }
      (_b2 = this.pendingCommands.get(parsed.nonce)) === null || _b2 === void 0 ? void 0 : _b2.resolve(parsed);
      this.pendingCommands.delete(parsed.nonce);
    }
  }
  _getSearch() {
    return typeof window === "undefined" ? "" : window.location.search;
  }
};
__name(_DiscordSDK, "DiscordSDK");
let DiscordSDK = _DiscordSDK;
var MAX_DIGITS = 1e9, defaults = {
  // These values must be integers within the stated ranges (inclusive).
  // Most of these values can be changed during run-time using `Decimal.config`.
  // The maximum number of significant digits of the result of a calculation or base conversion.
  // E.g. `Decimal.config({ precision: 20 });`
  precision: 20,
  // 1 to MAX_DIGITS
  // The rounding mode used by default by `toInteger`, `toDecimalPlaces`, `toExponential`,
  // `toFixed`, `toPrecision` and `toSignificantDigits`.
  //
  // ROUND_UP         0 Away from zero.
  // ROUND_DOWN       1 Towards zero.
  // ROUND_CEIL       2 Towards +Infinity.
  // ROUND_FLOOR      3 Towards -Infinity.
  // ROUND_HALF_UP    4 Towards nearest neighbour. If equidistant, up.
  // ROUND_HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
  // ROUND_HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
  // ROUND_HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
  // ROUND_HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
  //
  // E.g.
  // `Decimal.rounding = 4;`
  // `Decimal.rounding = Decimal.ROUND_HALF_UP;`
  rounding: 4,
  // 0 to 8
  // The exponent value at and beneath which `toString` returns exponential notation.
  // JavaScript numbers: -7
  toExpNeg: -7,
  // 0 to -MAX_E
  // The exponent value at and above which `toString` returns exponential notation.
  // JavaScript numbers: 21
  toExpPos: 21,
  // 0 to MAX_E
  // The natural logarithm of 10.
  // 115 digits
  LN10: "2.302585092994045684017991454684364207601101488628772976033327900967572609677352480235997205089598298341967784042286"
}, Decimal, external = true, decimalError = "[DecimalError] ", invalidArgument = decimalError + "Invalid argument: ", exponentOutOfRange = decimalError + "Exponent out of range: ", mathfloor = Math.floor, mathpow = Math.pow, isDecimal = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i, ONE, BASE = 1e7, LOG_BASE = 7, MAX_SAFE_INTEGER = 9007199254740991, MAX_E = mathfloor(MAX_SAFE_INTEGER / LOG_BASE), P = {};
P.absoluteValue = P.abs = function() {
  var x = new this.constructor(this);
  if (x.s) x.s = 1;
  return x;
};
P.comparedTo = P.cmp = function(y) {
  var i, j, xdL, ydL, x = this;
  y = new x.constructor(y);
  if (x.s !== y.s) return x.s || -y.s;
  if (x.e !== y.e) return x.e > y.e ^ x.s < 0 ? 1 : -1;
  xdL = x.d.length;
  ydL = y.d.length;
  for (i = 0, j = xdL < ydL ? xdL : ydL; i < j; ++i) {
    if (x.d[i] !== y.d[i]) return x.d[i] > y.d[i] ^ x.s < 0 ? 1 : -1;
  }
  return xdL === ydL ? 0 : xdL > ydL ^ x.s < 0 ? 1 : -1;
};
P.decimalPlaces = P.dp = function() {
  var x = this, w = x.d.length - 1, dp = (w - x.e) * LOG_BASE;
  w = x.d[w];
  if (w) for (; w % 10 == 0; w /= 10) dp--;
  return dp < 0 ? 0 : dp;
};
P.dividedBy = P.div = function(y) {
  return divide(this, new this.constructor(y));
};
P.dividedToIntegerBy = P.idiv = function(y) {
  var x = this, Ctor = x.constructor;
  return round(divide(x, new Ctor(y), 0, 1), Ctor.precision);
};
P.equals = P.eq = function(y) {
  return !this.cmp(y);
};
P.exponent = function() {
  return getBase10Exponent(this);
};
P.greaterThan = P.gt = function(y) {
  return this.cmp(y) > 0;
};
P.greaterThanOrEqualTo = P.gte = function(y) {
  return this.cmp(y) >= 0;
};
P.isInteger = P.isint = function() {
  return this.e > this.d.length - 2;
};
P.isNegative = P.isneg = function() {
  return this.s < 0;
};
P.isPositive = P.ispos = function() {
  return this.s > 0;
};
P.isZero = function() {
  return this.s === 0;
};
P.lessThan = P.lt = function(y) {
  return this.cmp(y) < 0;
};
P.lessThanOrEqualTo = P.lte = function(y) {
  return this.cmp(y) < 1;
};
P.logarithm = P.log = function(base) {
  var r, x = this, Ctor = x.constructor, pr = Ctor.precision, wpr = pr + 5;
  if (base === void 0) {
    base = new Ctor(10);
  } else {
    base = new Ctor(base);
    if (base.s < 1 || base.eq(ONE)) throw Error(decimalError + "NaN");
  }
  if (x.s < 1) throw Error(decimalError + (x.s ? "NaN" : "-Infinity"));
  if (x.eq(ONE)) return new Ctor(0);
  external = false;
  r = divide(ln(x, wpr), ln(base, wpr), wpr);
  external = true;
  return round(r, pr);
};
P.minus = P.sub = function(y) {
  var x = this;
  y = new x.constructor(y);
  return x.s == y.s ? subtract(x, y) : add(x, (y.s = -y.s, y));
};
P.modulo = P.mod = function(y) {
  var q, x = this, Ctor = x.constructor, pr = Ctor.precision;
  y = new Ctor(y);
  if (!y.s) throw Error(decimalError + "NaN");
  if (!x.s) return round(new Ctor(x), pr);
  external = false;
  q = divide(x, y, 0, 1).times(y);
  external = true;
  return x.minus(q);
};
P.naturalExponential = P.exp = function() {
  return exp(this);
};
P.naturalLogarithm = P.ln = function() {
  return ln(this);
};
P.negated = P.neg = function() {
  var x = new this.constructor(this);
  x.s = -x.s || 0;
  return x;
};
P.plus = P.add = function(y) {
  var x = this;
  y = new x.constructor(y);
  return x.s == y.s ? add(x, y) : subtract(x, (y.s = -y.s, y));
};
P.precision = P.sd = function(z2) {
  var e, sd, w, x = this;
  if (z2 !== void 0 && z2 !== !!z2 && z2 !== 1 && z2 !== 0) throw Error(invalidArgument + z2);
  e = getBase10Exponent(x) + 1;
  w = x.d.length - 1;
  sd = w * LOG_BASE + 1;
  w = x.d[w];
  if (w) {
    for (; w % 10 == 0; w /= 10) sd--;
    for (w = x.d[0]; w >= 10; w /= 10) sd++;
  }
  return z2 && e > sd ? e : sd;
};
P.squareRoot = P.sqrt = function() {
  var e, n, pr, r, s, t, wpr, x = this, Ctor = x.constructor;
  if (x.s < 1) {
    if (!x.s) return new Ctor(0);
    throw Error(decimalError + "NaN");
  }
  e = getBase10Exponent(x);
  external = false;
  s = Math.sqrt(+x);
  if (s == 0 || s == 1 / 0) {
    n = digitsToString(x.d);
    if ((n.length + e) % 2 == 0) n += "0";
    s = Math.sqrt(n);
    e = mathfloor((e + 1) / 2) - (e < 0 || e % 2);
    if (s == 1 / 0) {
      n = "5e" + e;
    } else {
      n = s.toExponential();
      n = n.slice(0, n.indexOf("e") + 1) + e;
    }
    r = new Ctor(n);
  } else {
    r = new Ctor(s.toString());
  }
  pr = Ctor.precision;
  s = wpr = pr + 3;
  for (; ; ) {
    t = r;
    r = t.plus(divide(x, t, wpr + 2)).times(0.5);
    if (digitsToString(t.d).slice(0, wpr) === (n = digitsToString(r.d)).slice(0, wpr)) {
      n = n.slice(wpr - 3, wpr + 1);
      if (s == wpr && n == "4999") {
        round(t, pr + 1, 0);
        if (t.times(t).eq(x)) {
          r = t;
          break;
        }
      } else if (n != "9999") {
        break;
      }
      wpr += 4;
    }
  }
  external = true;
  return round(r, pr);
};
P.times = P.mul = function(y) {
  var carry, e, i, k, r, rL, t, xdL, ydL, x = this, Ctor = x.constructor, xd = x.d, yd = (y = new Ctor(y)).d;
  if (!x.s || !y.s) return new Ctor(0);
  y.s *= x.s;
  e = x.e + y.e;
  xdL = xd.length;
  ydL = yd.length;
  if (xdL < ydL) {
    r = xd;
    xd = yd;
    yd = r;
    rL = xdL;
    xdL = ydL;
    ydL = rL;
  }
  r = [];
  rL = xdL + ydL;
  for (i = rL; i--; ) r.push(0);
  for (i = ydL; --i >= 0; ) {
    carry = 0;
    for (k = xdL + i; k > i; ) {
      t = r[k] + yd[i] * xd[k - i - 1] + carry;
      r[k--] = t % BASE | 0;
      carry = t / BASE | 0;
    }
    r[k] = (r[k] + carry) % BASE | 0;
  }
  for (; !r[--rL]; ) r.pop();
  if (carry) ++e;
  else r.shift();
  y.d = r;
  y.e = e;
  return external ? round(y, Ctor.precision) : y;
};
P.toDecimalPlaces = P.todp = function(dp, rm) {
  var x = this, Ctor = x.constructor;
  x = new Ctor(x);
  if (dp === void 0) return x;
  checkInt32(dp, 0, MAX_DIGITS);
  if (rm === void 0) rm = Ctor.rounding;
  else checkInt32(rm, 0, 8);
  return round(x, dp + getBase10Exponent(x) + 1, rm);
};
P.toExponential = function(dp, rm) {
  var str, x = this, Ctor = x.constructor;
  if (dp === void 0) {
    str = toString(x, true);
  } else {
    checkInt32(dp, 0, MAX_DIGITS);
    if (rm === void 0) rm = Ctor.rounding;
    else checkInt32(rm, 0, 8);
    x = round(new Ctor(x), dp + 1, rm);
    str = toString(x, true, dp + 1);
  }
  return str;
};
P.toFixed = function(dp, rm) {
  var str, y, x = this, Ctor = x.constructor;
  if (dp === void 0) return toString(x);
  checkInt32(dp, 0, MAX_DIGITS);
  if (rm === void 0) rm = Ctor.rounding;
  else checkInt32(rm, 0, 8);
  y = round(new Ctor(x), dp + getBase10Exponent(x) + 1, rm);
  str = toString(y.abs(), false, dp + getBase10Exponent(y) + 1);
  return x.isneg() && !x.isZero() ? "-" + str : str;
};
P.toInteger = P.toint = function() {
  var x = this, Ctor = x.constructor;
  return round(new Ctor(x), getBase10Exponent(x) + 1, Ctor.rounding);
};
P.toNumber = function() {
  return +this;
};
P.toPower = P.pow = function(y) {
  var e, k, pr, r, sign, yIsInt, x = this, Ctor = x.constructor, guard = 12, yn = +(y = new Ctor(y));
  if (!y.s) return new Ctor(ONE);
  x = new Ctor(x);
  if (!x.s) {
    if (y.s < 1) throw Error(decimalError + "Infinity");
    return x;
  }
  if (x.eq(ONE)) return x;
  pr = Ctor.precision;
  if (y.eq(ONE)) return round(x, pr);
  e = y.e;
  k = y.d.length - 1;
  yIsInt = e >= k;
  sign = x.s;
  if (!yIsInt) {
    if (sign < 0) throw Error(decimalError + "NaN");
  } else if ((k = yn < 0 ? -yn : yn) <= MAX_SAFE_INTEGER) {
    r = new Ctor(ONE);
    e = Math.ceil(pr / LOG_BASE + 4);
    external = false;
    for (; ; ) {
      if (k % 2) {
        r = r.times(x);
        truncate(r.d, e);
      }
      k = mathfloor(k / 2);
      if (k === 0) break;
      x = x.times(x);
      truncate(x.d, e);
    }
    external = true;
    return y.s < 0 ? new Ctor(ONE).div(r) : round(r, pr);
  }
  sign = sign < 0 && y.d[Math.max(e, k)] & 1 ? -1 : 1;
  x.s = 1;
  external = false;
  r = y.times(ln(x, pr + guard));
  external = true;
  r = exp(r);
  r.s = sign;
  return r;
};
P.toPrecision = function(sd, rm) {
  var e, str, x = this, Ctor = x.constructor;
  if (sd === void 0) {
    e = getBase10Exponent(x);
    str = toString(x, e <= Ctor.toExpNeg || e >= Ctor.toExpPos);
  } else {
    checkInt32(sd, 1, MAX_DIGITS);
    if (rm === void 0) rm = Ctor.rounding;
    else checkInt32(rm, 0, 8);
    x = round(new Ctor(x), sd, rm);
    e = getBase10Exponent(x);
    str = toString(x, sd <= e || e <= Ctor.toExpNeg, sd);
  }
  return str;
};
P.toSignificantDigits = P.tosd = function(sd, rm) {
  var x = this, Ctor = x.constructor;
  if (sd === void 0) {
    sd = Ctor.precision;
    rm = Ctor.rounding;
  } else {
    checkInt32(sd, 1, MAX_DIGITS);
    if (rm === void 0) rm = Ctor.rounding;
    else checkInt32(rm, 0, 8);
  }
  return round(new Ctor(x), sd, rm);
};
P.toString = P.valueOf = P.val = P.toJSON = P[Symbol.for("nodejs.util.inspect.custom")] = function() {
  var x = this, e = getBase10Exponent(x), Ctor = x.constructor;
  return toString(x, e <= Ctor.toExpNeg || e >= Ctor.toExpPos);
};
function add(x, y) {
  var carry, d, e, i, k, len, xd, yd, Ctor = x.constructor, pr = Ctor.precision;
  if (!x.s || !y.s) {
    if (!y.s) y = new Ctor(x);
    return external ? round(y, pr) : y;
  }
  xd = x.d;
  yd = y.d;
  k = x.e;
  e = y.e;
  xd = xd.slice();
  i = k - e;
  if (i) {
    if (i < 0) {
      d = xd;
      i = -i;
      len = yd.length;
    } else {
      d = yd;
      e = k;
      len = xd.length;
    }
    k = Math.ceil(pr / LOG_BASE);
    len = k > len ? k + 1 : len + 1;
    if (i > len) {
      i = len;
      d.length = 1;
    }
    d.reverse();
    for (; i--; ) d.push(0);
    d.reverse();
  }
  len = xd.length;
  i = yd.length;
  if (len - i < 0) {
    i = len;
    d = yd;
    yd = xd;
    xd = d;
  }
  for (carry = 0; i; ) {
    carry = (xd[--i] = xd[i] + yd[i] + carry) / BASE | 0;
    xd[i] %= BASE;
  }
  if (carry) {
    xd.unshift(carry);
    ++e;
  }
  for (len = xd.length; xd[--len] == 0; ) xd.pop();
  y.d = xd;
  y.e = e;
  return external ? round(y, pr) : y;
}
__name(add, "add");
function checkInt32(i, min, max) {
  if (i !== ~~i || i < min || i > max) {
    throw Error(invalidArgument + i);
  }
}
__name(checkInt32, "checkInt32");
function digitsToString(d) {
  var i, k, ws, indexOfLastWord = d.length - 1, str = "", w = d[0];
  if (indexOfLastWord > 0) {
    str += w;
    for (i = 1; i < indexOfLastWord; i++) {
      ws = d[i] + "";
      k = LOG_BASE - ws.length;
      if (k) str += getZeroString(k);
      str += ws;
    }
    w = d[i];
    ws = w + "";
    k = LOG_BASE - ws.length;
    if (k) str += getZeroString(k);
  } else if (w === 0) {
    return "0";
  }
  for (; w % 10 === 0; ) w /= 10;
  return str + w;
}
__name(digitsToString, "digitsToString");
var divide = /* @__PURE__ */ function() {
  function multiplyInteger(x, k) {
    var temp, carry = 0, i = x.length;
    for (x = x.slice(); i--; ) {
      temp = x[i] * k + carry;
      x[i] = temp % BASE | 0;
      carry = temp / BASE | 0;
    }
    if (carry) x.unshift(carry);
    return x;
  }
  __name(multiplyInteger, "multiplyInteger");
  function compare(a, b, aL, bL) {
    var i, r;
    if (aL != bL) {
      r = aL > bL ? 1 : -1;
    } else {
      for (i = r = 0; i < aL; i++) {
        if (a[i] != b[i]) {
          r = a[i] > b[i] ? 1 : -1;
          break;
        }
      }
    }
    return r;
  }
  __name(compare, "compare");
  function subtract2(a, b, aL) {
    var i = 0;
    for (; aL--; ) {
      a[aL] -= i;
      i = a[aL] < b[aL] ? 1 : 0;
      a[aL] = i * BASE + a[aL] - b[aL];
    }
    for (; !a[0] && a.length > 1; ) a.shift();
  }
  __name(subtract2, "subtract");
  return function(x, y, pr, dp) {
    var cmp, e, i, k, prod, prodL, q, qd, rem, remL, rem0, sd, t, xi, xL, yd0, yL, yz, Ctor = x.constructor, sign = x.s == y.s ? 1 : -1, xd = x.d, yd = y.d;
    if (!x.s) return new Ctor(x);
    if (!y.s) throw Error(decimalError + "Division by zero");
    e = x.e - y.e;
    yL = yd.length;
    xL = xd.length;
    q = new Ctor(sign);
    qd = q.d = [];
    for (i = 0; yd[i] == (xd[i] || 0); ) ++i;
    if (yd[i] > (xd[i] || 0)) --e;
    if (pr == null) {
      sd = pr = Ctor.precision;
    } else if (dp) {
      sd = pr + (getBase10Exponent(x) - getBase10Exponent(y)) + 1;
    } else {
      sd = pr;
    }
    if (sd < 0) return new Ctor(0);
    sd = sd / LOG_BASE + 2 | 0;
    i = 0;
    if (yL == 1) {
      k = 0;
      yd = yd[0];
      sd++;
      for (; (i < xL || k) && sd--; i++) {
        t = k * BASE + (xd[i] || 0);
        qd[i] = t / yd | 0;
        k = t % yd | 0;
      }
    } else {
      k = BASE / (yd[0] + 1) | 0;
      if (k > 1) {
        yd = multiplyInteger(yd, k);
        xd = multiplyInteger(xd, k);
        yL = yd.length;
        xL = xd.length;
      }
      xi = yL;
      rem = xd.slice(0, yL);
      remL = rem.length;
      for (; remL < yL; ) rem[remL++] = 0;
      yz = yd.slice();
      yz.unshift(0);
      yd0 = yd[0];
      if (yd[1] >= BASE / 2) ++yd0;
      do {
        k = 0;
        cmp = compare(yd, rem, yL, remL);
        if (cmp < 0) {
          rem0 = rem[0];
          if (yL != remL) rem0 = rem0 * BASE + (rem[1] || 0);
          k = rem0 / yd0 | 0;
          if (k > 1) {
            if (k >= BASE) k = BASE - 1;
            prod = multiplyInteger(yd, k);
            prodL = prod.length;
            remL = rem.length;
            cmp = compare(prod, rem, prodL, remL);
            if (cmp == 1) {
              k--;
              subtract2(prod, yL < prodL ? yz : yd, prodL);
            }
          } else {
            if (k == 0) cmp = k = 1;
            prod = yd.slice();
          }
          prodL = prod.length;
          if (prodL < remL) prod.unshift(0);
          subtract2(rem, prod, remL);
          if (cmp == -1) {
            remL = rem.length;
            cmp = compare(yd, rem, yL, remL);
            if (cmp < 1) {
              k++;
              subtract2(rem, yL < remL ? yz : yd, remL);
            }
          }
          remL = rem.length;
        } else if (cmp === 0) {
          k++;
          rem = [0];
        }
        qd[i++] = k;
        if (cmp && rem[0]) {
          rem[remL++] = xd[xi] || 0;
        } else {
          rem = [xd[xi]];
          remL = 1;
        }
      } while ((xi++ < xL || rem[0] !== void 0) && sd--);
    }
    if (!qd[0]) qd.shift();
    q.e = e;
    return round(q, dp ? pr + getBase10Exponent(q) + 1 : pr);
  };
}();
function exp(x, sd) {
  var denominator, guard, pow, sum, t, wpr, i = 0, k = 0, Ctor = x.constructor, pr = Ctor.precision;
  if (getBase10Exponent(x) > 16) throw Error(exponentOutOfRange + getBase10Exponent(x));
  if (!x.s) return new Ctor(ONE);
  {
    external = false;
    wpr = pr;
  }
  t = new Ctor(0.03125);
  while (x.abs().gte(0.1)) {
    x = x.times(t);
    k += 5;
  }
  guard = Math.log(mathpow(2, k)) / Math.LN10 * 2 + 5 | 0;
  wpr += guard;
  denominator = pow = sum = new Ctor(ONE);
  Ctor.precision = wpr;
  for (; ; ) {
    pow = round(pow.times(x), wpr);
    denominator = denominator.times(++i);
    t = sum.plus(divide(pow, denominator, wpr));
    if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
      while (k--) sum = round(sum.times(sum), wpr);
      Ctor.precision = pr;
      return sd == null ? (external = true, round(sum, pr)) : sum;
    }
    sum = t;
  }
}
__name(exp, "exp");
function getBase10Exponent(x) {
  var e = x.e * LOG_BASE, w = x.d[0];
  for (; w >= 10; w /= 10) e++;
  return e;
}
__name(getBase10Exponent, "getBase10Exponent");
function getLn10(Ctor, sd, pr) {
  if (sd > Ctor.LN10.sd()) {
    external = true;
    if (pr) Ctor.precision = pr;
    throw Error(decimalError + "LN10 precision limit exceeded");
  }
  return round(new Ctor(Ctor.LN10), sd);
}
__name(getLn10, "getLn10");
function getZeroString(k) {
  var zs = "";
  for (; k--; ) zs += "0";
  return zs;
}
__name(getZeroString, "getZeroString");
function ln(y, sd) {
  var c, c0, denominator, e, numerator, sum, t, wpr, x2, n = 1, guard = 10, x = y, xd = x.d, Ctor = x.constructor, pr = Ctor.precision;
  if (x.s < 1) throw Error(decimalError + (x.s ? "NaN" : "-Infinity"));
  if (x.eq(ONE)) return new Ctor(0);
  if (sd == null) {
    external = false;
    wpr = pr;
  } else {
    wpr = sd;
  }
  if (x.eq(10)) {
    if (sd == null) external = true;
    return getLn10(Ctor, wpr);
  }
  wpr += guard;
  Ctor.precision = wpr;
  c = digitsToString(xd);
  c0 = c.charAt(0);
  e = getBase10Exponent(x);
  if (Math.abs(e) < 15e14) {
    while (c0 < 7 && c0 != 1 || c0 == 1 && c.charAt(1) > 3) {
      x = x.times(y);
      c = digitsToString(x.d);
      c0 = c.charAt(0);
      n++;
    }
    e = getBase10Exponent(x);
    if (c0 > 1) {
      x = new Ctor("0." + c);
      e++;
    } else {
      x = new Ctor(c0 + "." + c.slice(1));
    }
  } else {
    t = getLn10(Ctor, wpr + 2, pr).times(e + "");
    x = ln(new Ctor(c0 + "." + c.slice(1)), wpr - guard).plus(t);
    Ctor.precision = pr;
    return sd == null ? (external = true, round(x, pr)) : x;
  }
  sum = numerator = x = divide(x.minus(ONE), x.plus(ONE), wpr);
  x2 = round(x.times(x), wpr);
  denominator = 3;
  for (; ; ) {
    numerator = round(numerator.times(x2), wpr);
    t = sum.plus(divide(numerator, new Ctor(denominator), wpr));
    if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
      sum = sum.times(2);
      if (e !== 0) sum = sum.plus(getLn10(Ctor, wpr + 2, pr).times(e + ""));
      sum = divide(sum, new Ctor(n), wpr);
      Ctor.precision = pr;
      return sd == null ? (external = true, round(sum, pr)) : sum;
    }
    sum = t;
    denominator += 2;
  }
}
__name(ln, "ln");
function parseDecimal(x, str) {
  var e, i, len;
  if ((e = str.indexOf(".")) > -1) str = str.replace(".", "");
  if ((i = str.search(/e/i)) > 0) {
    if (e < 0) e = i;
    e += +str.slice(i + 1);
    str = str.substring(0, i);
  } else if (e < 0) {
    e = str.length;
  }
  for (i = 0; str.charCodeAt(i) === 48; ) ++i;
  for (len = str.length; str.charCodeAt(len - 1) === 48; ) --len;
  str = str.slice(i, len);
  if (str) {
    len -= i;
    e = e - i - 1;
    x.e = mathfloor(e / LOG_BASE);
    x.d = [];
    i = (e + 1) % LOG_BASE;
    if (e < 0) i += LOG_BASE;
    if (i < len) {
      if (i) x.d.push(+str.slice(0, i));
      for (len -= LOG_BASE; i < len; ) x.d.push(+str.slice(i, i += LOG_BASE));
      str = str.slice(i);
      i = LOG_BASE - str.length;
    } else {
      i -= len;
    }
    for (; i--; ) str += "0";
    x.d.push(+str);
    if (external && (x.e > MAX_E || x.e < -MAX_E)) throw Error(exponentOutOfRange + e);
  } else {
    x.s = 0;
    x.e = 0;
    x.d = [0];
  }
  return x;
}
__name(parseDecimal, "parseDecimal");
function round(x, sd, rm) {
  var i, j, k, n, rd, doRound, w, xdi, xd = x.d;
  for (n = 1, k = xd[0]; k >= 10; k /= 10) n++;
  i = sd - n;
  if (i < 0) {
    i += LOG_BASE;
    j = sd;
    w = xd[xdi = 0];
  } else {
    xdi = Math.ceil((i + 1) / LOG_BASE);
    k = xd.length;
    if (xdi >= k) return x;
    w = k = xd[xdi];
    for (n = 1; k >= 10; k /= 10) n++;
    i %= LOG_BASE;
    j = i - LOG_BASE + n;
  }
  if (rm !== void 0) {
    k = mathpow(10, n - j - 1);
    rd = w / k % 10 | 0;
    doRound = sd < 0 || xd[xdi + 1] !== void 0 || w % k;
    doRound = rm < 4 ? (rd || doRound) && (rm == 0 || rm == (x.s < 0 ? 3 : 2)) : rd > 5 || rd == 5 && (rm == 4 || doRound || rm == 6 && // Check whether the digit to the left of the rounding digit is odd.
    (i > 0 ? j > 0 ? w / mathpow(10, n - j) : 0 : xd[xdi - 1]) % 10 & 1 || rm == (x.s < 0 ? 8 : 7));
  }
  if (sd < 1 || !xd[0]) {
    if (doRound) {
      k = getBase10Exponent(x);
      xd.length = 1;
      sd = sd - k - 1;
      xd[0] = mathpow(10, (LOG_BASE - sd % LOG_BASE) % LOG_BASE);
      x.e = mathfloor(-sd / LOG_BASE) || 0;
    } else {
      xd.length = 1;
      xd[0] = x.e = x.s = 0;
    }
    return x;
  }
  if (i == 0) {
    xd.length = xdi;
    k = 1;
    xdi--;
  } else {
    xd.length = xdi + 1;
    k = mathpow(10, LOG_BASE - i);
    xd[xdi] = j > 0 ? (w / mathpow(10, n - j) % mathpow(10, j) | 0) * k : 0;
  }
  if (doRound) {
    for (; ; ) {
      if (xdi == 0) {
        if ((xd[0] += k) == BASE) {
          xd[0] = 1;
          ++x.e;
        }
        break;
      } else {
        xd[xdi] += k;
        if (xd[xdi] != BASE) break;
        xd[xdi--] = 0;
        k = 1;
      }
    }
  }
  for (i = xd.length; xd[--i] === 0; ) xd.pop();
  if (external && (x.e > MAX_E || x.e < -MAX_E)) {
    throw Error(exponentOutOfRange + getBase10Exponent(x));
  }
  return x;
}
__name(round, "round");
function subtract(x, y) {
  var d, e, i, j, k, len, xd, xe, xLTy, yd, Ctor = x.constructor, pr = Ctor.precision;
  if (!x.s || !y.s) {
    if (y.s) y.s = -y.s;
    else y = new Ctor(x);
    return external ? round(y, pr) : y;
  }
  xd = x.d;
  yd = y.d;
  e = y.e;
  xe = x.e;
  xd = xd.slice();
  k = xe - e;
  if (k) {
    xLTy = k < 0;
    if (xLTy) {
      d = xd;
      k = -k;
      len = yd.length;
    } else {
      d = yd;
      e = xe;
      len = xd.length;
    }
    i = Math.max(Math.ceil(pr / LOG_BASE), len) + 2;
    if (k > i) {
      k = i;
      d.length = 1;
    }
    d.reverse();
    for (i = k; i--; ) d.push(0);
    d.reverse();
  } else {
    i = xd.length;
    len = yd.length;
    xLTy = i < len;
    if (xLTy) len = i;
    for (i = 0; i < len; i++) {
      if (xd[i] != yd[i]) {
        xLTy = xd[i] < yd[i];
        break;
      }
    }
    k = 0;
  }
  if (xLTy) {
    d = xd;
    xd = yd;
    yd = d;
    y.s = -y.s;
  }
  len = xd.length;
  for (i = yd.length - len; i > 0; --i) xd[len++] = 0;
  for (i = yd.length; i > k; ) {
    if (xd[--i] < yd[i]) {
      for (j = i; j && xd[--j] === 0; ) xd[j] = BASE - 1;
      --xd[j];
      xd[i] += BASE;
    }
    xd[i] -= yd[i];
  }
  for (; xd[--len] === 0; ) xd.pop();
  for (; xd[0] === 0; xd.shift()) --e;
  if (!xd[0]) return new Ctor(0);
  y.d = xd;
  y.e = e;
  return external ? round(y, pr) : y;
}
__name(subtract, "subtract");
function toString(x, isExp, sd) {
  var k, e = getBase10Exponent(x), str = digitsToString(x.d), len = str.length;
  if (isExp) {
    if (sd && (k = sd - len) > 0) {
      str = str.charAt(0) + "." + str.slice(1) + getZeroString(k);
    } else if (len > 1) {
      str = str.charAt(0) + "." + str.slice(1);
    }
    str = str + (e < 0 ? "e" : "e+") + e;
  } else if (e < 0) {
    str = "0." + getZeroString(-e - 1) + str;
    if (sd && (k = sd - len) > 0) str += getZeroString(k);
  } else if (e >= len) {
    str += getZeroString(e + 1 - len);
    if (sd && (k = sd - e - 1) > 0) str = str + "." + getZeroString(k);
  } else {
    if ((k = e + 1) < len) str = str.slice(0, k) + "." + str.slice(k);
    if (sd && (k = sd - len) > 0) {
      if (e + 1 === len) str += ".";
      str += getZeroString(k);
    }
  }
  return x.s < 0 ? "-" + str : str;
}
__name(toString, "toString");
function truncate(arr, len) {
  if (arr.length > len) {
    arr.length = len;
    return true;
  }
}
__name(truncate, "truncate");
function clone(obj) {
  var i, p, ps;
  function Decimal2(value) {
    var x = this;
    if (!(x instanceof Decimal2)) return new Decimal2(value);
    x.constructor = Decimal2;
    if (value instanceof Decimal2) {
      x.s = value.s;
      x.e = value.e;
      x.d = (value = value.d) ? value.slice() : value;
      return;
    }
    if (typeof value === "number") {
      if (value * 0 !== 0) {
        throw Error(invalidArgument + value);
      }
      if (value > 0) {
        x.s = 1;
      } else if (value < 0) {
        value = -value;
        x.s = -1;
      } else {
        x.s = 0;
        x.e = 0;
        x.d = [0];
        return;
      }
      if (value === ~~value && value < 1e7) {
        x.e = 0;
        x.d = [value];
        return;
      }
      return parseDecimal(x, value.toString());
    } else if (typeof value !== "string") {
      throw Error(invalidArgument + value);
    }
    if (value.charCodeAt(0) === 45) {
      value = value.slice(1);
      x.s = -1;
    } else {
      x.s = 1;
    }
    if (isDecimal.test(value)) parseDecimal(x, value);
    else throw Error(invalidArgument + value);
  }
  __name(Decimal2, "Decimal");
  Decimal2.prototype = P;
  Decimal2.ROUND_UP = 0;
  Decimal2.ROUND_DOWN = 1;
  Decimal2.ROUND_CEIL = 2;
  Decimal2.ROUND_FLOOR = 3;
  Decimal2.ROUND_HALF_UP = 4;
  Decimal2.ROUND_HALF_DOWN = 5;
  Decimal2.ROUND_HALF_EVEN = 6;
  Decimal2.ROUND_HALF_CEIL = 7;
  Decimal2.ROUND_HALF_FLOOR = 8;
  Decimal2.clone = clone;
  Decimal2.config = Decimal2.set = config;
  if (obj === void 0) obj = {};
  if (obj) {
    ps = ["precision", "rounding", "toExpNeg", "toExpPos", "LN10"];
    for (i = 0; i < ps.length; ) if (!obj.hasOwnProperty(p = ps[i++])) obj[p] = this[p];
  }
  Decimal2.config(obj);
  return Decimal2;
}
__name(clone, "clone");
function config(obj) {
  if (!obj || typeof obj !== "object") {
    throw Error(decimalError + "Object expected");
  }
  var i, p, v, ps = [
    "precision",
    1,
    MAX_DIGITS,
    "rounding",
    0,
    8,
    "toExpNeg",
    -1 / 0,
    0,
    "toExpPos",
    0,
    1 / 0
  ];
  for (i = 0; i < ps.length; i += 3) {
    if ((v = obj[p = ps[i]]) !== void 0) {
      if (mathfloor(v) === v && v >= ps[i + 1] && v <= ps[i + 2]) this[p] = v;
      else throw Error(invalidArgument + p + ": " + v);
    }
  }
  if ((v = obj[p = "LN10"]) !== void 0) {
    if (v == Math.LN10) this[p] = new this(v);
    else throw Error(invalidArgument + p + ": " + v);
  }
  return this;
}
__name(config, "config");
var Decimal = clone(defaults);
ONE = new Decimal(1);
var CurrencyCodes;
(function(CurrencyCodes2) {
  CurrencyCodes2["AED"] = "aed";
  CurrencyCodes2["AFN"] = "afn";
  CurrencyCodes2["ALL"] = "all";
  CurrencyCodes2["AMD"] = "amd";
  CurrencyCodes2["ANG"] = "ang";
  CurrencyCodes2["AOA"] = "aoa";
  CurrencyCodes2["ARS"] = "ars";
  CurrencyCodes2["AUD"] = "aud";
  CurrencyCodes2["AWG"] = "awg";
  CurrencyCodes2["AZN"] = "azn";
  CurrencyCodes2["BAM"] = "bam";
  CurrencyCodes2["BBD"] = "bbd";
  CurrencyCodes2["BDT"] = "bdt";
  CurrencyCodes2["BGN"] = "bgn";
  CurrencyCodes2["BHD"] = "bhd";
  CurrencyCodes2["BIF"] = "bif";
  CurrencyCodes2["BMD"] = "bmd";
  CurrencyCodes2["BND"] = "bnd";
  CurrencyCodes2["BOB"] = "bob";
  CurrencyCodes2["BOV"] = "bov";
  CurrencyCodes2["BRL"] = "brl";
  CurrencyCodes2["BSD"] = "bsd";
  CurrencyCodes2["BTN"] = "btn";
  CurrencyCodes2["BWP"] = "bwp";
  CurrencyCodes2["BYN"] = "byn";
  CurrencyCodes2["BYR"] = "byr";
  CurrencyCodes2["BZD"] = "bzd";
  CurrencyCodes2["CAD"] = "cad";
  CurrencyCodes2["CDF"] = "cdf";
  CurrencyCodes2["CHE"] = "che";
  CurrencyCodes2["CHF"] = "chf";
  CurrencyCodes2["CHW"] = "chw";
  CurrencyCodes2["CLF"] = "clf";
  CurrencyCodes2["CLP"] = "clp";
  CurrencyCodes2["CNY"] = "cny";
  CurrencyCodes2["COP"] = "cop";
  CurrencyCodes2["COU"] = "cou";
  CurrencyCodes2["CRC"] = "crc";
  CurrencyCodes2["CUC"] = "cuc";
  CurrencyCodes2["CUP"] = "cup";
  CurrencyCodes2["CVE"] = "cve";
  CurrencyCodes2["CZK"] = "czk";
  CurrencyCodes2["DJF"] = "djf";
  CurrencyCodes2["DKK"] = "dkk";
  CurrencyCodes2["DOP"] = "dop";
  CurrencyCodes2["DZD"] = "dzd";
  CurrencyCodes2["EGP"] = "egp";
  CurrencyCodes2["ERN"] = "ern";
  CurrencyCodes2["ETB"] = "etb";
  CurrencyCodes2["EUR"] = "eur";
  CurrencyCodes2["FJD"] = "fjd";
  CurrencyCodes2["FKP"] = "fkp";
  CurrencyCodes2["GBP"] = "gbp";
  CurrencyCodes2["GEL"] = "gel";
  CurrencyCodes2["GHS"] = "ghs";
  CurrencyCodes2["GIP"] = "gip";
  CurrencyCodes2["GMD"] = "gmd";
  CurrencyCodes2["GNF"] = "gnf";
  CurrencyCodes2["GTQ"] = "gtq";
  CurrencyCodes2["GYD"] = "gyd";
  CurrencyCodes2["HKD"] = "hkd";
  CurrencyCodes2["HNL"] = "hnl";
  CurrencyCodes2["HRK"] = "hrk";
  CurrencyCodes2["HTG"] = "htg";
  CurrencyCodes2["HUF"] = "huf";
  CurrencyCodes2["IDR"] = "idr";
  CurrencyCodes2["ILS"] = "ils";
  CurrencyCodes2["INR"] = "inr";
  CurrencyCodes2["IQD"] = "iqd";
  CurrencyCodes2["IRR"] = "irr";
  CurrencyCodes2["ISK"] = "isk";
  CurrencyCodes2["JMD"] = "jmd";
  CurrencyCodes2["JOD"] = "jod";
  CurrencyCodes2["JPY"] = "jpy";
  CurrencyCodes2["KES"] = "kes";
  CurrencyCodes2["KGS"] = "kgs";
  CurrencyCodes2["KHR"] = "khr";
  CurrencyCodes2["KMF"] = "kmf";
  CurrencyCodes2["KPW"] = "kpw";
  CurrencyCodes2["KRW"] = "krw";
  CurrencyCodes2["KWD"] = "kwd";
  CurrencyCodes2["KYD"] = "kyd";
  CurrencyCodes2["KZT"] = "kzt";
  CurrencyCodes2["LAK"] = "lak";
  CurrencyCodes2["LBP"] = "lbp";
  CurrencyCodes2["LKR"] = "lkr";
  CurrencyCodes2["LRD"] = "lrd";
  CurrencyCodes2["LSL"] = "lsl";
  CurrencyCodes2["LTL"] = "ltl";
  CurrencyCodes2["LVL"] = "lvl";
  CurrencyCodes2["LYD"] = "lyd";
  CurrencyCodes2["MAD"] = "mad";
  CurrencyCodes2["MDL"] = "mdl";
  CurrencyCodes2["MGA"] = "mga";
  CurrencyCodes2["MKD"] = "mkd";
  CurrencyCodes2["MMK"] = "mmk";
  CurrencyCodes2["MNT"] = "mnt";
  CurrencyCodes2["MOP"] = "mop";
  CurrencyCodes2["MRO"] = "mro";
  CurrencyCodes2["MUR"] = "mur";
  CurrencyCodes2["MVR"] = "mvr";
  CurrencyCodes2["MWK"] = "mwk";
  CurrencyCodes2["MXN"] = "mxn";
  CurrencyCodes2["MXV"] = "mxv";
  CurrencyCodes2["MYR"] = "myr";
  CurrencyCodes2["MZN"] = "mzn";
  CurrencyCodes2["NAD"] = "nad";
  CurrencyCodes2["NGN"] = "ngn";
  CurrencyCodes2["NIO"] = "nio";
  CurrencyCodes2["NOK"] = "nok";
  CurrencyCodes2["NPR"] = "npr";
  CurrencyCodes2["NZD"] = "nzd";
  CurrencyCodes2["OMR"] = "omr";
  CurrencyCodes2["PAB"] = "pab";
  CurrencyCodes2["PEN"] = "pen";
  CurrencyCodes2["PGK"] = "pgk";
  CurrencyCodes2["PHP"] = "php";
  CurrencyCodes2["PKR"] = "pkr";
  CurrencyCodes2["PLN"] = "pln";
  CurrencyCodes2["PYG"] = "pyg";
  CurrencyCodes2["QAR"] = "qar";
  CurrencyCodes2["RON"] = "ron";
  CurrencyCodes2["RSD"] = "rsd";
  CurrencyCodes2["RUB"] = "rub";
  CurrencyCodes2["RWF"] = "rwf";
  CurrencyCodes2["SAR"] = "sar";
  CurrencyCodes2["SBD"] = "sbd";
  CurrencyCodes2["SCR"] = "scr";
  CurrencyCodes2["SDG"] = "sdg";
  CurrencyCodes2["SEK"] = "sek";
  CurrencyCodes2["SGD"] = "sgd";
  CurrencyCodes2["SHP"] = "shp";
  CurrencyCodes2["SLL"] = "sll";
  CurrencyCodes2["SOS"] = "sos";
  CurrencyCodes2["SRD"] = "srd";
  CurrencyCodes2["SSP"] = "ssp";
  CurrencyCodes2["STD"] = "std";
  CurrencyCodes2["SVC"] = "svc";
  CurrencyCodes2["SYP"] = "syp";
  CurrencyCodes2["SZL"] = "szl";
  CurrencyCodes2["THB"] = "thb";
  CurrencyCodes2["TJS"] = "tjs";
  CurrencyCodes2["TMT"] = "tmt";
  CurrencyCodes2["TND"] = "tnd";
  CurrencyCodes2["TOP"] = "top";
  CurrencyCodes2["TRY"] = "try";
  CurrencyCodes2["TTD"] = "ttd";
  CurrencyCodes2["TWD"] = "twd";
  CurrencyCodes2["TZS"] = "tzs";
  CurrencyCodes2["UAH"] = "uah";
  CurrencyCodes2["UGX"] = "ugx";
  CurrencyCodes2["USD"] = "usd";
  CurrencyCodes2["USN"] = "usn";
  CurrencyCodes2["USS"] = "uss";
  CurrencyCodes2["UYI"] = "uyi";
  CurrencyCodes2["UYU"] = "uyu";
  CurrencyCodes2["UZS"] = "uzs";
  CurrencyCodes2["VEF"] = "vef";
  CurrencyCodes2["VND"] = "vnd";
  CurrencyCodes2["VUV"] = "vuv";
  CurrencyCodes2["WST"] = "wst";
  CurrencyCodes2["XAF"] = "xaf";
  CurrencyCodes2["XAG"] = "xag";
  CurrencyCodes2["XAU"] = "xau";
  CurrencyCodes2["XBA"] = "xba";
  CurrencyCodes2["XBB"] = "xbb";
  CurrencyCodes2["XBC"] = "xbc";
  CurrencyCodes2["XBD"] = "xbd";
  CurrencyCodes2["XCD"] = "xcd";
  CurrencyCodes2["XDR"] = "xdr";
  CurrencyCodes2["XFU"] = "xfu";
  CurrencyCodes2["XOF"] = "xof";
  CurrencyCodes2["XPD"] = "xpd";
  CurrencyCodes2["XPF"] = "xpf";
  CurrencyCodes2["XPT"] = "xpt";
  CurrencyCodes2["XSU"] = "xsu";
  CurrencyCodes2["XTS"] = "xts";
  CurrencyCodes2["XUA"] = "xua";
  CurrencyCodes2["YER"] = "yer";
  CurrencyCodes2["ZAR"] = "zar";
  CurrencyCodes2["ZMW"] = "zmw";
  CurrencyCodes2["ZWL"] = "zwl";
})(CurrencyCodes || (CurrencyCodes = {}));
({
  [CurrencyCodes.AED]: 2,
  [CurrencyCodes.AFN]: 2,
  [CurrencyCodes.ALL]: 2,
  [CurrencyCodes.AMD]: 2,
  [CurrencyCodes.ANG]: 2,
  [CurrencyCodes.AOA]: 2,
  [CurrencyCodes.ARS]: 2,
  [CurrencyCodes.AUD]: 2,
  [CurrencyCodes.AWG]: 2,
  [CurrencyCodes.AZN]: 2,
  [CurrencyCodes.BAM]: 2,
  [CurrencyCodes.BBD]: 2,
  [CurrencyCodes.BDT]: 2,
  [CurrencyCodes.BGN]: 2,
  [CurrencyCodes.BHD]: 3,
  [CurrencyCodes.BIF]: 0,
  [CurrencyCodes.BMD]: 2,
  [CurrencyCodes.BND]: 2,
  [CurrencyCodes.BOB]: 2,
  [CurrencyCodes.BOV]: 2,
  [CurrencyCodes.BRL]: 2,
  [CurrencyCodes.BSD]: 2,
  [CurrencyCodes.BTN]: 2,
  [CurrencyCodes.BWP]: 2,
  [CurrencyCodes.BYR]: 0,
  [CurrencyCodes.BYN]: 2,
  [CurrencyCodes.BZD]: 2,
  [CurrencyCodes.CAD]: 2,
  [CurrencyCodes.CDF]: 2,
  [CurrencyCodes.CHE]: 2,
  [CurrencyCodes.CHF]: 2,
  [CurrencyCodes.CHW]: 2,
  [CurrencyCodes.CLF]: 0,
  [CurrencyCodes.CLP]: 0,
  [CurrencyCodes.CNY]: 2,
  [CurrencyCodes.COP]: 2,
  [CurrencyCodes.COU]: 2,
  [CurrencyCodes.CRC]: 2,
  [CurrencyCodes.CUC]: 2,
  [CurrencyCodes.CUP]: 2,
  [CurrencyCodes.CVE]: 2,
  [CurrencyCodes.CZK]: 2,
  [CurrencyCodes.DJF]: 0,
  [CurrencyCodes.DKK]: 2,
  [CurrencyCodes.DOP]: 2,
  [CurrencyCodes.DZD]: 2,
  [CurrencyCodes.EGP]: 2,
  [CurrencyCodes.ERN]: 2,
  [CurrencyCodes.ETB]: 2,
  [CurrencyCodes.EUR]: 2,
  [CurrencyCodes.FJD]: 2,
  [CurrencyCodes.FKP]: 2,
  [CurrencyCodes.GBP]: 2,
  [CurrencyCodes.GEL]: 2,
  [CurrencyCodes.GHS]: 2,
  [CurrencyCodes.GIP]: 2,
  [CurrencyCodes.GMD]: 2,
  [CurrencyCodes.GNF]: 0,
  [CurrencyCodes.GTQ]: 2,
  [CurrencyCodes.GYD]: 2,
  [CurrencyCodes.HKD]: 2,
  [CurrencyCodes.HNL]: 2,
  [CurrencyCodes.HRK]: 2,
  [CurrencyCodes.HTG]: 2,
  [CurrencyCodes.HUF]: 2,
  [CurrencyCodes.IDR]: 2,
  [CurrencyCodes.ILS]: 2,
  [CurrencyCodes.INR]: 2,
  [CurrencyCodes.IQD]: 3,
  [CurrencyCodes.IRR]: 2,
  [CurrencyCodes.ISK]: 0,
  [CurrencyCodes.JMD]: 2,
  [CurrencyCodes.JOD]: 3,
  [CurrencyCodes.JPY]: 0,
  [CurrencyCodes.KES]: 2,
  [CurrencyCodes.KGS]: 2,
  [CurrencyCodes.KHR]: 2,
  [CurrencyCodes.KMF]: 0,
  [CurrencyCodes.KPW]: 2,
  [CurrencyCodes.KRW]: 0,
  [CurrencyCodes.KWD]: 3,
  [CurrencyCodes.KYD]: 2,
  [CurrencyCodes.KZT]: 2,
  [CurrencyCodes.LAK]: 2,
  [CurrencyCodes.LBP]: 2,
  [CurrencyCodes.LKR]: 2,
  [CurrencyCodes.LRD]: 2,
  [CurrencyCodes.LSL]: 2,
  [CurrencyCodes.LTL]: 2,
  [CurrencyCodes.LVL]: 2,
  [CurrencyCodes.LYD]: 3,
  [CurrencyCodes.MAD]: 2,
  [CurrencyCodes.MDL]: 2,
  [CurrencyCodes.MGA]: 2,
  [CurrencyCodes.MKD]: 2,
  [CurrencyCodes.MMK]: 2,
  [CurrencyCodes.MNT]: 2,
  [CurrencyCodes.MOP]: 2,
  [CurrencyCodes.MRO]: 2,
  [CurrencyCodes.MUR]: 2,
  [CurrencyCodes.MVR]: 2,
  [CurrencyCodes.MWK]: 2,
  [CurrencyCodes.MXN]: 2,
  [CurrencyCodes.MXV]: 2,
  [CurrencyCodes.MYR]: 2,
  [CurrencyCodes.MZN]: 2,
  [CurrencyCodes.NAD]: 2,
  [CurrencyCodes.NGN]: 2,
  [CurrencyCodes.NIO]: 2,
  [CurrencyCodes.NOK]: 2,
  [CurrencyCodes.NPR]: 2,
  [CurrencyCodes.NZD]: 2,
  [CurrencyCodes.OMR]: 3,
  [CurrencyCodes.PAB]: 2,
  [CurrencyCodes.PEN]: 2,
  [CurrencyCodes.PGK]: 2,
  [CurrencyCodes.PHP]: 2,
  [CurrencyCodes.PKR]: 2,
  [CurrencyCodes.PLN]: 2,
  [CurrencyCodes.PYG]: 0,
  [CurrencyCodes.QAR]: 2,
  [CurrencyCodes.RON]: 2,
  [CurrencyCodes.RSD]: 2,
  [CurrencyCodes.RUB]: 2,
  [CurrencyCodes.RWF]: 0,
  [CurrencyCodes.SAR]: 2,
  [CurrencyCodes.SBD]: 2,
  [CurrencyCodes.SCR]: 2,
  [CurrencyCodes.SDG]: 2,
  [CurrencyCodes.SEK]: 2,
  [CurrencyCodes.SGD]: 2,
  [CurrencyCodes.SHP]: 2,
  [CurrencyCodes.SLL]: 2,
  [CurrencyCodes.SOS]: 2,
  [CurrencyCodes.SRD]: 2,
  [CurrencyCodes.SSP]: 2,
  [CurrencyCodes.STD]: 2,
  [CurrencyCodes.SVC]: 2,
  [CurrencyCodes.SYP]: 2,
  [CurrencyCodes.SZL]: 2,
  [CurrencyCodes.THB]: 2,
  [CurrencyCodes.TJS]: 2,
  [CurrencyCodes.TMT]: 2,
  [CurrencyCodes.TND]: 3,
  [CurrencyCodes.TOP]: 2,
  [CurrencyCodes.TRY]: 2,
  [CurrencyCodes.TTD]: 2,
  [CurrencyCodes.TWD]: 2,
  [CurrencyCodes.TZS]: 2,
  [CurrencyCodes.UAH]: 2,
  [CurrencyCodes.UGX]: 0,
  [CurrencyCodes.USD]: 2,
  [CurrencyCodes.USN]: 2,
  [CurrencyCodes.USS]: 2,
  [CurrencyCodes.UYI]: 0,
  [CurrencyCodes.UYU]: 2,
  [CurrencyCodes.UZS]: 2,
  [CurrencyCodes.VEF]: 2,
  [CurrencyCodes.VND]: 0,
  [CurrencyCodes.VUV]: 0,
  [CurrencyCodes.WST]: 2,
  [CurrencyCodes.XAF]: 0,
  [CurrencyCodes.XAG]: 0,
  [CurrencyCodes.XAU]: 0,
  [CurrencyCodes.XBA]: 0,
  [CurrencyCodes.XBB]: 0,
  [CurrencyCodes.XBC]: 0,
  [CurrencyCodes.XBD]: 0,
  [CurrencyCodes.XCD]: 2,
  [CurrencyCodes.XDR]: 0,
  [CurrencyCodes.XFU]: 0,
  [CurrencyCodes.XOF]: 0,
  [CurrencyCodes.XPD]: 0,
  [CurrencyCodes.XPF]: 0,
  [CurrencyCodes.XPT]: 0,
  [CurrencyCodes.XSU]: 0,
  [CurrencyCodes.XTS]: 0,
  [CurrencyCodes.XUA]: 0,
  [CurrencyCodes.YER]: 2,
  [CurrencyCodes.ZAR]: 2,
  [CurrencyCodes.ZMW]: 2,
  [CurrencyCodes.ZWL]: 2
});
var lodash_transform = { exports: {} };
lodash_transform.exports;
var hasRequiredLodash_transform;
function requireLodash_transform() {
  if (hasRequiredLodash_transform) return lodash_transform.exports;
  hasRequiredLodash_transform = 1;
  (function(module, exports) {
    var LARGE_ARRAY_SIZE = 200;
    var FUNC_ERROR_TEXT = "Expected a function";
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    var UNORDERED_COMPARE_FLAG = 1, PARTIAL_COMPARE_FLAG = 2;
    var MAX_SAFE_INTEGER2 = 9007199254740991;
    var argsTag = "[object Arguments]", arrayTag = "[object Array]", boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", mapTag = "[object Map]", numberTag = "[object Number]", objectTag = "[object Object]", promiseTag = "[object Promise]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]", weakMapTag = "[object WeakMap]";
    var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
    var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/, reLeadingDot = /^\./, rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
    var reEscapeChar = /\\(\\)?/g;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
    var freeGlobal = typeof commonjsGlobal == "object" && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    var freeExports = exports && !exports.nodeType && exports;
    var freeModule = freeExports && true && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var freeProcess = moduleExports && freeGlobal.process;
    var nodeUtil = function() {
      try {
        return freeProcess && freeProcess.binding("util");
      } catch (e) {
      }
    }();
    var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
    function arrayEach(array, iteratee) {
      var index = -1, length = array ? array.length : 0;
      while (++index < length) {
        if (iteratee(array[index], index, array) === false) {
          break;
        }
      }
      return array;
    }
    __name(arrayEach, "arrayEach");
    function arraySome(array, predicate) {
      var index = -1, length = array ? array.length : 0;
      while (++index < length) {
        if (predicate(array[index], index, array)) {
          return true;
        }
      }
      return false;
    }
    __name(arraySome, "arraySome");
    function baseProperty(key) {
      return function(object) {
        return object == null ? void 0 : object[key];
      };
    }
    __name(baseProperty, "baseProperty");
    function baseTimes(n, iteratee) {
      var index = -1, result = Array(n);
      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }
    __name(baseTimes, "baseTimes");
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }
    __name(baseUnary, "baseUnary");
    function getValue(object, key) {
      return object == null ? void 0 : object[key];
    }
    __name(getValue, "getValue");
    function isHostObject(value) {
      var result = false;
      if (value != null && typeof value.toString != "function") {
        try {
          result = !!(value + "");
        } catch (e) {
        }
      }
      return result;
    }
    __name(isHostObject, "isHostObject");
    function mapToArray(map) {
      var index = -1, result = Array(map.size);
      map.forEach(function(value, key) {
        result[++index] = [key, value];
      });
      return result;
    }
    __name(mapToArray, "mapToArray");
    function overArg(func, transform3) {
      return function(arg) {
        return func(transform3(arg));
      };
    }
    __name(overArg, "overArg");
    function setToArray(set) {
      var index = -1, result = Array(set.size);
      set.forEach(function(value) {
        result[++index] = value;
      });
      return result;
    }
    __name(setToArray, "setToArray");
    var arrayProto = Array.prototype, funcProto = Function.prototype, objectProto = Object.prototype;
    var coreJsData = root["__core-js_shared__"];
    var maskSrcKey = function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
      return uid ? "Symbol(src)_1." + uid : "";
    }();
    var funcToString = funcProto.toString;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var objectToString = objectProto.toString;
    var reIsNative = RegExp(
      "^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    );
    var Symbol2 = root.Symbol, Uint8Array2 = root.Uint8Array, getPrototype = overArg(Object.getPrototypeOf, Object), objectCreate = Object.create, propertyIsEnumerable = objectProto.propertyIsEnumerable, splice = arrayProto.splice;
    var nativeKeys = overArg(Object.keys, Object);
    var DataView2 = getNative(root, "DataView"), Map2 = getNative(root, "Map"), Promise2 = getNative(root, "Promise"), Set2 = getNative(root, "Set"), WeakMap2 = getNative(root, "WeakMap"), nativeCreate = getNative(Object, "create");
    var dataViewCtorString = toSource(DataView2), mapCtorString = toSource(Map2), promiseCtorString = toSource(Promise2), setCtorString = toSource(Set2), weakMapCtorString = toSource(WeakMap2);
    var symbolProto = Symbol2 ? Symbol2.prototype : void 0, symbolValueOf = symbolProto ? symbolProto.valueOf : void 0, symbolToString = symbolProto ? symbolProto.toString : void 0;
    function Hash(entries) {
      var index = -1, length = entries ? entries.length : 0;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    __name(Hash, "Hash");
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
    }
    __name(hashClear, "hashClear");
    function hashDelete(key) {
      return this.has(key) && delete this.__data__[key];
    }
    __name(hashDelete, "hashDelete");
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? void 0 : result;
      }
      return hasOwnProperty.call(data, key) ? data[key] : void 0;
    }
    __name(hashGet, "hashGet");
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
    }
    __name(hashHas, "hashHas");
    function hashSet(key, value) {
      var data = this.__data__;
      data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
      return this;
    }
    __name(hashSet, "hashSet");
    Hash.prototype.clear = hashClear;
    Hash.prototype["delete"] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;
    function ListCache(entries) {
      var index = -1, length = entries ? entries.length : 0;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    __name(ListCache, "ListCache");
    function listCacheClear() {
      this.__data__ = [];
    }
    __name(listCacheClear, "listCacheClear");
    function listCacheDelete(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      return true;
    }
    __name(listCacheDelete, "listCacheDelete");
    function listCacheGet(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      return index < 0 ? void 0 : data[index][1];
    }
    __name(listCacheGet, "listCacheGet");
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }
    __name(listCacheHas, "listCacheHas");
    function listCacheSet(key, value) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }
    __name(listCacheSet, "listCacheSet");
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype["delete"] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;
    function MapCache(entries) {
      var index = -1, length = entries ? entries.length : 0;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    __name(MapCache, "MapCache");
    function mapCacheClear() {
      this.__data__ = {
        "hash": new Hash(),
        "map": new (Map2 || ListCache)(),
        "string": new Hash()
      };
    }
    __name(mapCacheClear, "mapCacheClear");
    function mapCacheDelete(key) {
      return getMapData(this, key)["delete"](key);
    }
    __name(mapCacheDelete, "mapCacheDelete");
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }
    __name(mapCacheGet, "mapCacheGet");
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }
    __name(mapCacheHas, "mapCacheHas");
    function mapCacheSet(key, value) {
      getMapData(this, key).set(key, value);
      return this;
    }
    __name(mapCacheSet, "mapCacheSet");
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype["delete"] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;
    function SetCache(values) {
      var index = -1, length = values ? values.length : 0;
      this.__data__ = new MapCache();
      while (++index < length) {
        this.add(values[index]);
      }
    }
    __name(SetCache, "SetCache");
    function setCacheAdd(value) {
      this.__data__.set(value, HASH_UNDEFINED);
      return this;
    }
    __name(setCacheAdd, "setCacheAdd");
    function setCacheHas(value) {
      return this.__data__.has(value);
    }
    __name(setCacheHas, "setCacheHas");
    SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
    SetCache.prototype.has = setCacheHas;
    function Stack(entries) {
      this.__data__ = new ListCache(entries);
    }
    __name(Stack, "Stack");
    function stackClear() {
      this.__data__ = new ListCache();
    }
    __name(stackClear, "stackClear");
    function stackDelete(key) {
      return this.__data__["delete"](key);
    }
    __name(stackDelete, "stackDelete");
    function stackGet(key) {
      return this.__data__.get(key);
    }
    __name(stackGet, "stackGet");
    function stackHas(key) {
      return this.__data__.has(key);
    }
    __name(stackHas, "stackHas");
    function stackSet(key, value) {
      var cache = this.__data__;
      if (cache instanceof ListCache) {
        var pairs = cache.__data__;
        if (!Map2 || pairs.length < LARGE_ARRAY_SIZE - 1) {
          pairs.push([key, value]);
          return this;
        }
        cache = this.__data__ = new MapCache(pairs);
      }
      cache.set(key, value);
      return this;
    }
    __name(stackSet, "stackSet");
    Stack.prototype.clear = stackClear;
    Stack.prototype["delete"] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;
    function arrayLikeKeys(value, inherited) {
      var result = isArray(value) || isArguments(value) ? baseTimes(value.length, String) : [];
      var length = result.length, skipIndexes = !!length;
      for (var key in value) {
        if (hasOwnProperty.call(value, key) && !(skipIndexes && (key == "length" || isIndex(key, length)))) {
          result.push(key);
        }
      }
      return result;
    }
    __name(arrayLikeKeys, "arrayLikeKeys");
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }
    __name(assocIndexOf, "assocIndexOf");
    function baseCreate(proto) {
      return isObject(proto) ? objectCreate(proto) : {};
    }
    __name(baseCreate, "baseCreate");
    var baseFor = createBaseFor();
    function baseForOwn(object, iteratee) {
      return object && baseFor(object, iteratee, keys);
    }
    __name(baseForOwn, "baseForOwn");
    function baseGet(object, path) {
      path = isKey(path, object) ? [path] : castPath(path);
      var index = 0, length = path.length;
      while (object != null && index < length) {
        object = object[toKey(path[index++])];
      }
      return index && index == length ? object : void 0;
    }
    __name(baseGet, "baseGet");
    function baseGetTag(value) {
      return objectToString.call(value);
    }
    __name(baseGetTag, "baseGetTag");
    function baseHasIn(object, key) {
      return object != null && key in Object(object);
    }
    __name(baseHasIn, "baseHasIn");
    function baseIsEqual(value, other, customizer, bitmask, stack) {
      if (value === other) {
        return true;
      }
      if (value == null || other == null || !isObject(value) && !isObjectLike(other)) {
        return value !== value && other !== other;
      }
      return baseIsEqualDeep(value, other, baseIsEqual, customizer, bitmask, stack);
    }
    __name(baseIsEqual, "baseIsEqual");
    function baseIsEqualDeep(object, other, equalFunc, customizer, bitmask, stack) {
      var objIsArr = isArray(object), othIsArr = isArray(other), objTag = arrayTag, othTag = arrayTag;
      if (!objIsArr) {
        objTag = getTag(object);
        objTag = objTag == argsTag ? objectTag : objTag;
      }
      if (!othIsArr) {
        othTag = getTag(other);
        othTag = othTag == argsTag ? objectTag : othTag;
      }
      var objIsObj = objTag == objectTag && !isHostObject(object), othIsObj = othTag == objectTag && !isHostObject(other), isSameTag = objTag == othTag;
      if (isSameTag && !objIsObj) {
        stack || (stack = new Stack());
        return objIsArr || isTypedArray(object) ? equalArrays(object, other, equalFunc, customizer, bitmask, stack) : equalByTag(object, other, objTag, equalFunc, customizer, bitmask, stack);
      }
      if (!(bitmask & PARTIAL_COMPARE_FLAG)) {
        var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
        if (objIsWrapped || othIsWrapped) {
          var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
          stack || (stack = new Stack());
          return equalFunc(objUnwrapped, othUnwrapped, customizer, bitmask, stack);
        }
      }
      if (!isSameTag) {
        return false;
      }
      stack || (stack = new Stack());
      return equalObjects(object, other, equalFunc, customizer, bitmask, stack);
    }
    __name(baseIsEqualDeep, "baseIsEqualDeep");
    function baseIsMatch(object, source, matchData, customizer) {
      var index = matchData.length, length = index;
      if (object == null) {
        return !length;
      }
      object = Object(object);
      while (index--) {
        var data = matchData[index];
        if (data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
          return false;
        }
      }
      while (++index < length) {
        data = matchData[index];
        var key = data[0], objValue = object[key], srcValue = data[1];
        if (data[2]) {
          if (objValue === void 0 && !(key in object)) {
            return false;
          }
        } else {
          var stack = new Stack();
          var result;
          if (!(result === void 0 ? baseIsEqual(srcValue, objValue, customizer, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG, stack) : result)) {
            return false;
          }
        }
      }
      return true;
    }
    __name(baseIsMatch, "baseIsMatch");
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) || isHostObject(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }
    __name(baseIsNative, "baseIsNative");
    function baseIsTypedArray(value) {
      return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objectToString.call(value)];
    }
    __name(baseIsTypedArray, "baseIsTypedArray");
    function baseIteratee(value) {
      if (typeof value == "function") {
        return value;
      }
      if (value == null) {
        return identity;
      }
      if (typeof value == "object") {
        return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
      }
      return property(value);
    }
    __name(baseIteratee, "baseIteratee");
    function baseKeys(object) {
      if (!isPrototype(object)) {
        return nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty.call(object, key) && key != "constructor") {
          result.push(key);
        }
      }
      return result;
    }
    __name(baseKeys, "baseKeys");
    function baseMatches(source) {
      var matchData = getMatchData(source);
      if (matchData.length == 1 && matchData[0][2]) {
        return matchesStrictComparable(matchData[0][0], matchData[0][1]);
      }
      return function(object) {
        return object === source || baseIsMatch(object, source, matchData);
      };
    }
    __name(baseMatches, "baseMatches");
    function baseMatchesProperty(path, srcValue) {
      if (isKey(path) && isStrictComparable(srcValue)) {
        return matchesStrictComparable(toKey(path), srcValue);
      }
      return function(object) {
        var objValue = get2(object, path);
        return objValue === void 0 && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue, void 0, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG);
      };
    }
    __name(baseMatchesProperty, "baseMatchesProperty");
    function basePropertyDeep(path) {
      return function(object) {
        return baseGet(object, path);
      };
    }
    __name(basePropertyDeep, "basePropertyDeep");
    function baseToString(value) {
      if (typeof value == "string") {
        return value;
      }
      if (isSymbol(value)) {
        return symbolToString ? symbolToString.call(value) : "";
      }
      var result = value + "";
      return result == "0" && 1 / value == -Infinity ? "-0" : result;
    }
    __name(baseToString, "baseToString");
    function castPath(value) {
      return isArray(value) ? value : stringToPath(value);
    }
    __name(castPath, "castPath");
    function createBaseFor(fromRight) {
      return function(object, iteratee, keysFunc) {
        var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
        while (length--) {
          var key = props[++index];
          if (iteratee(iterable[key], key, iterable) === false) {
            break;
          }
        }
        return object;
      };
    }
    __name(createBaseFor, "createBaseFor");
    function equalArrays(array, other, equalFunc, customizer, bitmask, stack) {
      var isPartial = bitmask & PARTIAL_COMPARE_FLAG, arrLength = array.length, othLength = other.length;
      if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
        return false;
      }
      var stacked = stack.get(array);
      if (stacked && stack.get(other)) {
        return stacked == other;
      }
      var index = -1, result = true, seen = bitmask & UNORDERED_COMPARE_FLAG ? new SetCache() : void 0;
      stack.set(array, other);
      stack.set(other, array);
      while (++index < arrLength) {
        var arrValue = array[index], othValue = other[index];
        if (customizer) {
          var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
        }
        if (compared !== void 0) {
          if (compared) {
            continue;
          }
          result = false;
          break;
        }
        if (seen) {
          if (!arraySome(other, function(othValue2, othIndex) {
            if (!seen.has(othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, customizer, bitmask, stack))) {
              return seen.add(othIndex);
            }
          })) {
            result = false;
            break;
          }
        } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
          result = false;
          break;
        }
      }
      stack["delete"](array);
      stack["delete"](other);
      return result;
    }
    __name(equalArrays, "equalArrays");
    function equalByTag(object, other, tag, equalFunc, customizer, bitmask, stack) {
      switch (tag) {
        case dataViewTag:
          if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
            return false;
          }
          object = object.buffer;
          other = other.buffer;
        case arrayBufferTag:
          if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array2(object), new Uint8Array2(other))) {
            return false;
          }
          return true;
        case boolTag:
        case dateTag:
        case numberTag:
          return eq(+object, +other);
        case errorTag:
          return object.name == other.name && object.message == other.message;
        case regexpTag:
        case stringTag:
          return object == other + "";
        case mapTag:
          var convert = mapToArray;
        case setTag:
          var isPartial = bitmask & PARTIAL_COMPARE_FLAG;
          convert || (convert = setToArray);
          if (object.size != other.size && !isPartial) {
            return false;
          }
          var stacked = stack.get(object);
          if (stacked) {
            return stacked == other;
          }
          bitmask |= UNORDERED_COMPARE_FLAG;
          stack.set(object, other);
          var result = equalArrays(convert(object), convert(other), equalFunc, customizer, bitmask, stack);
          stack["delete"](object);
          return result;
        case symbolTag:
          if (symbolValueOf) {
            return symbolValueOf.call(object) == symbolValueOf.call(other);
          }
      }
      return false;
    }
    __name(equalByTag, "equalByTag");
    function equalObjects(object, other, equalFunc, customizer, bitmask, stack) {
      var isPartial = bitmask & PARTIAL_COMPARE_FLAG, objProps = keys(object), objLength = objProps.length, othProps = keys(other), othLength = othProps.length;
      if (objLength != othLength && !isPartial) {
        return false;
      }
      var index = objLength;
      while (index--) {
        var key = objProps[index];
        if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
          return false;
        }
      }
      var stacked = stack.get(object);
      if (stacked && stack.get(other)) {
        return stacked == other;
      }
      var result = true;
      stack.set(object, other);
      stack.set(other, object);
      var skipCtor = isPartial;
      while (++index < objLength) {
        key = objProps[index];
        var objValue = object[key], othValue = other[key];
        if (customizer) {
          var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
        }
        if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, customizer, bitmask, stack) : compared)) {
          result = false;
          break;
        }
        skipCtor || (skipCtor = key == "constructor");
      }
      if (result && !skipCtor) {
        var objCtor = object.constructor, othCtor = other.constructor;
        if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
          result = false;
        }
      }
      stack["delete"](object);
      stack["delete"](other);
      return result;
    }
    __name(equalObjects, "equalObjects");
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
    }
    __name(getMapData, "getMapData");
    function getMatchData(object) {
      var result = keys(object), length = result.length;
      while (length--) {
        var key = result[length], value = object[key];
        result[length] = [key, value, isStrictComparable(value)];
      }
      return result;
    }
    __name(getMatchData, "getMatchData");
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : void 0;
    }
    __name(getNative, "getNative");
    var getTag = baseGetTag;
    if (DataView2 && getTag(new DataView2(new ArrayBuffer(1))) != dataViewTag || Map2 && getTag(new Map2()) != mapTag || Promise2 && getTag(Promise2.resolve()) != promiseTag || Set2 && getTag(new Set2()) != setTag || WeakMap2 && getTag(new WeakMap2()) != weakMapTag) {
      getTag = /* @__PURE__ */ __name(function(value) {
        var result = objectToString.call(value), Ctor = result == objectTag ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : void 0;
        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString:
              return dataViewTag;
            case mapCtorString:
              return mapTag;
            case promiseCtorString:
              return promiseTag;
            case setCtorString:
              return setTag;
            case weakMapCtorString:
              return weakMapTag;
          }
        }
        return result;
      }, "getTag");
    }
    function hasPath(object, path, hasFunc) {
      path = isKey(path, object) ? [path] : castPath(path);
      var result, index = -1, length = path.length;
      while (++index < length) {
        var key = toKey(path[index]);
        if (!(result = object != null && hasFunc(object, key))) {
          break;
        }
        object = object[key];
      }
      if (result) {
        return result;
      }
      var length = object ? object.length : 0;
      return !!length && isLength(length) && isIndex(key, length) && (isArray(object) || isArguments(object));
    }
    __name(hasPath, "hasPath");
    function isIndex(value, length) {
      length = length == null ? MAX_SAFE_INTEGER2 : length;
      return !!length && (typeof value == "number" || reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
    }
    __name(isIndex, "isIndex");
    function isKey(value, object) {
      if (isArray(value)) {
        return false;
      }
      var type = typeof value;
      if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
        return true;
      }
      return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
    }
    __name(isKey, "isKey");
    function isKeyable(value) {
      var type = typeof value;
      return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
    }
    __name(isKeyable, "isKeyable");
    function isMasked(func) {
      return !!maskSrcKey && maskSrcKey in func;
    }
    __name(isMasked, "isMasked");
    function isPrototype(value) {
      var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
      return value === proto;
    }
    __name(isPrototype, "isPrototype");
    function isStrictComparable(value) {
      return value === value && !isObject(value);
    }
    __name(isStrictComparable, "isStrictComparable");
    function matchesStrictComparable(key, srcValue) {
      return function(object) {
        if (object == null) {
          return false;
        }
        return object[key] === srcValue && (srcValue !== void 0 || key in Object(object));
      };
    }
    __name(matchesStrictComparable, "matchesStrictComparable");
    var stringToPath = memoize(function(string) {
      string = toString2(string);
      var result = [];
      if (reLeadingDot.test(string)) {
        result.push("");
      }
      string.replace(rePropName, function(match, number, quote, string2) {
        result.push(quote ? string2.replace(reEscapeChar, "$1") : number || match);
      });
      return result;
    });
    function toKey(value) {
      if (typeof value == "string" || isSymbol(value)) {
        return value;
      }
      var result = value + "";
      return result == "0" && 1 / value == -Infinity ? "-0" : result;
    }
    __name(toKey, "toKey");
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {
        }
        try {
          return func + "";
        } catch (e) {
        }
      }
      return "";
    }
    __name(toSource, "toSource");
    function memoize(func, resolver) {
      if (typeof func != "function" || resolver && typeof resolver != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      var memoized = /* @__PURE__ */ __name(function() {
        var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
        if (cache.has(key)) {
          return cache.get(key);
        }
        var result = func.apply(this, args);
        memoized.cache = cache.set(key, result);
        return result;
      }, "memoized");
      memoized.cache = new (memoize.Cache || MapCache)();
      return memoized;
    }
    __name(memoize, "memoize");
    memoize.Cache = MapCache;
    function eq(value, other) {
      return value === other || value !== value && other !== other;
    }
    __name(eq, "eq");
    function isArguments(value) {
      return isArrayLikeObject(value) && hasOwnProperty.call(value, "callee") && (!propertyIsEnumerable.call(value, "callee") || objectToString.call(value) == argsTag);
    }
    __name(isArguments, "isArguments");
    var isArray = Array.isArray;
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }
    __name(isArrayLike, "isArrayLike");
    function isArrayLikeObject(value) {
      return isObjectLike(value) && isArrayLike(value);
    }
    __name(isArrayLikeObject, "isArrayLikeObject");
    function isFunction(value) {
      var tag = isObject(value) ? objectToString.call(value) : "";
      return tag == funcTag || tag == genTag;
    }
    __name(isFunction, "isFunction");
    function isLength(value) {
      return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER2;
    }
    __name(isLength, "isLength");
    function isObject(value) {
      var type = typeof value;
      return !!value && (type == "object" || type == "function");
    }
    __name(isObject, "isObject");
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    __name(isObjectLike, "isObjectLike");
    function isSymbol(value) {
      return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
    }
    __name(isSymbol, "isSymbol");
    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
    function toString2(value) {
      return value == null ? "" : baseToString(value);
    }
    __name(toString2, "toString");
    function get2(object, path, defaultValue) {
      var result = object == null ? void 0 : baseGet(object, path);
      return result === void 0 ? defaultValue : result;
    }
    __name(get2, "get");
    function hasIn(object, path) {
      return object != null && hasPath(object, path, baseHasIn);
    }
    __name(hasIn, "hasIn");
    function keys(object) {
      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
    }
    __name(keys, "keys");
    function transform2(object, iteratee, accumulator) {
      var isArr = isArray(object) || isTypedArray(object);
      iteratee = baseIteratee(iteratee);
      if (accumulator == null) {
        if (isArr || isObject(object)) {
          var Ctor = object.constructor;
          if (isArr) {
            accumulator = isArray(object) ? new Ctor() : [];
          } else {
            accumulator = isFunction(Ctor) ? baseCreate(getPrototype(object)) : {};
          }
        } else {
          accumulator = {};
        }
      }
      (isArr ? arrayEach : baseForOwn)(object, function(value, index, object2) {
        return iteratee(accumulator, value, index, object2);
      });
      return accumulator;
    }
    __name(transform2, "transform");
    function identity(value) {
      return value;
    }
    __name(identity, "identity");
    function property(path) {
      return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
    }
    __name(property, "property");
    module.exports = transform2;
  })(lodash_transform, lodash_transform.exports);
  return lodash_transform.exports;
}
__name(requireLodash_transform, "requireLodash_transform");
var lodash_transformExports = requireLodash_transform();
var transform = /* @__PURE__ */ getDefaultExportFromCjs(lodash_transformExports);
const _DiscordSDKMock = class _DiscordSDKMock {
  constructor(clientId2, guildId, channelId, locationId) {
    this.platform = Platform.DESKTOP;
    this.instanceId = "123456789012345678";
    this.configuration = getDefaultSdkConfiguration();
    this.source = null;
    this.sourceOrigin = "";
    this.sdkVersion = "mock";
    this.mobileAppVersion = "unknown";
    this.frameId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
    this.eventBus = new EventEmitter$1();
    this.clientId = clientId2;
    this.commands = this._updateCommandMocks({});
    this.guildId = guildId;
    this.channelId = channelId;
    this.locationId = locationId;
    this.customId = null;
    this.referrerId = null;
  }
  _updateCommandMocks(newCommands) {
    this.commands = transform(Object.assign({}, commandsMockDefault, newCommands), (mock, func, name) => {
      mock[name] = async (...args) => {
        console.info(`DiscordSDKMock: ${String(name)}(${JSON.stringify(args)})`);
        return await func(...args);
      };
    });
    return this.commands;
  }
  emitReady() {
    this.emitEvent("READY", void 0);
  }
  close(...args) {
    console.info(`DiscordSDKMock: close(${JSON.stringify(args)})`);
  }
  ready() {
    return Promise.resolve();
  }
  async subscribe(event, listener, ..._subscribeArgs) {
    return await this.eventBus.on(event, listener);
  }
  async unsubscribe(event, listener, ..._unsubscribeArgs) {
    return await this.eventBus.off(event, listener);
  }
  emitEvent(event, data) {
    this.eventBus.emit(event, data);
  }
};
__name(_DiscordSDKMock, "DiscordSDKMock");
let DiscordSDKMock = _DiscordSDKMock;
const commandsMockDefault = {
  authorize: /* @__PURE__ */ __name(() => Promise.resolve({ code: "mock_code" }), "authorize"),
  authenticate: /* @__PURE__ */ __name(() => Promise.resolve({
    access_token: "mock_token",
    user: {
      username: "mock_user_username",
      discriminator: "mock_user_discriminator",
      id: "mock_user_id",
      avatar: null,
      public_flags: 1
    },
    scopes: [],
    expires: new Date(2121, 1, 1).toString(),
    application: {
      description: "mock_app_description",
      icon: "mock_app_icon",
      id: "mock_app_id",
      name: "mock_app_name"
    }
  }), "authenticate"),
  setActivity: /* @__PURE__ */ __name(() => Promise.resolve({
    name: "mock_activity_name",
    type: 0
  }), "setActivity"),
  getChannel: /* @__PURE__ */ __name(() => Promise.resolve({
    id: "mock_channel_id",
    name: "mock_channel_name",
    type: ChannelTypesObject.GUILD_TEXT,
    voice_states: [],
    messages: []
  }), "getChannel"),
  getSkus: /* @__PURE__ */ __name(() => Promise.resolve({ skus: [] }), "getSkus"),
  getEntitlements: /* @__PURE__ */ __name(() => Promise.resolve({ entitlements: [] }), "getEntitlements"),
  startPurchase: /* @__PURE__ */ __name(() => Promise.resolve([]), "startPurchase"),
  setConfig: /* @__PURE__ */ __name(() => Promise.resolve({ use_interactive_pip: false }), "setConfig"),
  userSettingsGetLocale: /* @__PURE__ */ __name(() => Promise.resolve({ locale: "" }), "userSettingsGetLocale"),
  openExternalLink: /* @__PURE__ */ __name(() => Promise.resolve({ opened: false }), "openExternalLink"),
  encourageHardwareAcceleration: /* @__PURE__ */ __name(() => Promise.resolve({ enabled: true }), "encourageHardwareAcceleration"),
  captureLog: /* @__PURE__ */ __name(() => Promise.resolve(null), "captureLog"),
  setOrientationLockState: /* @__PURE__ */ __name(() => Promise.resolve(null), "setOrientationLockState"),
  openInviteDialog: /* @__PURE__ */ __name(() => Promise.resolve(null), "openInviteDialog"),
  getPlatformBehaviors: /* @__PURE__ */ __name(() => Promise.resolve({
    iosKeyboardResizesView: true
  }), "getPlatformBehaviors"),
  getChannelPermissions: /* @__PURE__ */ __name(() => Promise.resolve({ permissions: bigInt(1234567890) }), "getChannelPermissions"),
  openShareMomentDialog: /* @__PURE__ */ __name(() => Promise.resolve(null), "openShareMomentDialog"),
  shareLink: /* @__PURE__ */ __name(() => Promise.resolve({ success: false }), "shareLink"),
  initiateImageUpload: /* @__PURE__ */ __name(() => Promise.resolve({
    image_url: "https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0b52aa9e99b832574a53_full_logo_blurple_RGB.png"
  }), "initiateImageUpload"),
  getInstanceConnectedParticipants: /* @__PURE__ */ __name(() => Promise.resolve({ participants: [] }), "getInstanceConnectedParticipants")
};
typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
var cjs = {};
if (!ArrayBuffer.isView) {
  ArrayBuffer.isView = (a) => {
    return a !== null && typeof a === "object" && a.buffer instanceof ArrayBuffer;
  };
}
if (typeof FormData === "undefined") {
  commonjsGlobal$1["FormData"] = class {
  };
}
if (typeof globalThis === "undefined" && typeof window !== "undefined") {
  window["globalThis"] = window;
}
var Client$1 = {};
var extendStatics = /* @__PURE__ */ __name(function(d, b) {
  extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
  };
  return extendStatics(d, b);
}, "extendStatics");
function __extends(d, b) {
  if (typeof b !== "function" && b !== null)
    throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);
  function __() {
    this.constructor = d;
  }
  __name(__, "__");
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
__name(__extends, "__extends");
var __assign = /* @__PURE__ */ __name(function() {
  __assign = Object.assign || /* @__PURE__ */ __name(function __assign2(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
  }, "__assign");
  return __assign.apply(this, arguments);
}, "__assign");
function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
    t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
}
__name(__rest, "__rest");
function __decorate(decorators, target2, key, desc) {
  var c = arguments.length, r = c < 3 ? target2 : desc === null ? desc = Object.getOwnPropertyDescriptor(target2, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target2, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target2, key, r) : d(target2, key)) || r;
  return c > 3 && r && Object.defineProperty(target2, key, r), r;
}
__name(__decorate, "__decorate");
function __param(paramIndex, decorator) {
  return function(target2, key) {
    decorator(target2, key, paramIndex);
  };
}
__name(__param, "__param");
function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
  function accept(f) {
    if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
    return f;
  }
  __name(accept, "accept");
  var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
  var target2 = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
  var descriptor = descriptorIn || (target2 ? Object.getOwnPropertyDescriptor(target2, contextIn.name) : {});
  var _, done = false;
  for (var i = decorators.length - 1; i >= 0; i--) {
    var context = {};
    for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
    for (var p in contextIn.access) context.access[p] = contextIn.access[p];
    context.addInitializer = function(f) {
      if (done) throw new TypeError("Cannot add initializers after decoration has completed");
      extraInitializers.push(accept(f || null));
    };
    var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
    if (kind === "accessor") {
      if (result === void 0) continue;
      if (result === null || typeof result !== "object") throw new TypeError("Object expected");
      if (_ = accept(result.get)) descriptor.get = _;
      if (_ = accept(result.set)) descriptor.set = _;
      if (_ = accept(result.init)) initializers.unshift(_);
    } else if (_ = accept(result)) {
      if (kind === "field") initializers.unshift(_);
      else descriptor[key] = _;
    }
  }
  if (target2) Object.defineProperty(target2, contextIn.name, descriptor);
  done = true;
}
__name(__esDecorate, "__esDecorate");
function __runInitializers(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
}
__name(__runInitializers, "__runInitializers");
function __propKey(x) {
  return typeof x === "symbol" ? x : "".concat(x);
}
__name(__propKey, "__propKey");
function __setFunctionName(f, name, prefix) {
  if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
  return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
}
__name(__setFunctionName, "__setFunctionName");
function __metadata(metadataKey, metadataValue) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}
__name(__metadata, "__metadata");
function __awaiter(thisArg, _arguments, P2, generator) {
  function adopt(value) {
    return value instanceof P2 ? value : new P2(function(resolve) {
      resolve(value);
    });
  }
  __name(adopt, "adopt");
  return new (P2 || (P2 = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    __name(fulfilled, "fulfilled");
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    __name(rejected, "rejected");
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    __name(step, "step");
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
__name(__awaiter, "__awaiter");
function __generator(thisArg, body) {
  var _ = { label: 0, sent: /* @__PURE__ */ __name(function() {
    if (t[0] & 1) throw t[1];
    return t[1];
  }, "sent"), trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
  return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() {
    return this;
  }), g;
  function verb(n) {
    return function(v) {
      return step([n, v]);
    };
  }
  __name(verb, "verb");
  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");
    while (g && (g = 0, op[0] && (_ = 0)), _) try {
      if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [op[0] & 2, t.value];
      switch (op[0]) {
        case 0:
        case 1:
          t = op;
          break;
        case 4:
          _.label++;
          return { value: op[1], done: false };
        case 5:
          _.label++;
          y = op[1];
          op = [0];
          continue;
        case 7:
          op = _.ops.pop();
          _.trys.pop();
          continue;
        default:
          if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
            _ = 0;
            continue;
          }
          if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
            _.label = op[1];
            break;
          }
          if (op[0] === 6 && _.label < t[1]) {
            _.label = t[1];
            t = op;
            break;
          }
          if (t && _.label < t[2]) {
            _.label = t[2];
            _.ops.push(op);
            break;
          }
          if (t[2]) _.ops.pop();
          _.trys.pop();
          continue;
      }
      op = body.call(thisArg, _);
    } catch (e) {
      op = [6, e];
      y = 0;
    } finally {
      f = t = 0;
    }
    if (op[0] & 5) throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
  __name(step, "step");
}
__name(__generator, "__generator");
var __createBinding = Object.create ? function(o, m, k, k2) {
  if (k2 === void 0) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return m[k];
    }, "get") };
  }
  Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
  if (k2 === void 0) k2 = k;
  o[k2] = m[k];
};
function __exportStar(m, o) {
  for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}
__name(__exportStar, "__exportStar");
function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
    next: /* @__PURE__ */ __name(function() {
      if (o && i >= o.length) o = void 0;
      return { value: o && o[i++], done: !o };
    }, "next")
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
__name(__values, "__values");
function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o), r, ar = [], e;
  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  } catch (error) {
    e = { error };
  } finally {
    try {
      if (r && !r.done && (m = i["return"])) m.call(i);
    } finally {
      if (e) throw e.error;
    }
  }
  return ar;
}
__name(__read, "__read");
function __spread() {
  for (var ar = [], i = 0; i < arguments.length; i++)
    ar = ar.concat(__read(arguments[i]));
  return ar;
}
__name(__spread, "__spread");
function __spreadArrays() {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
  for (var r = Array(s), k = 0, i = 0; i < il; i++)
    for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
      r[k] = a[j];
  return r;
}
__name(__spreadArrays, "__spreadArrays");
function __spreadArray(to, from, pack2) {
  if (pack2 || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
    if (ar || !(i in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
      ar[i] = from[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}
__name(__spreadArray, "__spreadArray");
function __await(v) {
  return this instanceof __await ? (this.v = v, this) : new __await(v);
}
__name(__await, "__await");
function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var g = generator.apply(thisArg, _arguments || []), i, q = [];
  return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
    return this;
  }, i;
  function awaitReturn(f) {
    return function(v) {
      return Promise.resolve(v).then(f, reject);
    };
  }
  __name(awaitReturn, "awaitReturn");
  function verb(n, f) {
    if (g[n]) {
      i[n] = function(v) {
        return new Promise(function(a, b) {
          q.push([n, v, a, b]) > 1 || resume(n, v);
        });
      };
      if (f) i[n] = f(i[n]);
    }
  }
  __name(verb, "verb");
  function resume(n, v) {
    try {
      step(g[n](v));
    } catch (e) {
      settle(q[0][3], e);
    }
  }
  __name(resume, "resume");
  function step(r) {
    r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
  }
  __name(step, "step");
  function fulfill(value) {
    resume("next", value);
  }
  __name(fulfill, "fulfill");
  function reject(value) {
    resume("throw", value);
  }
  __name(reject, "reject");
  function settle(f, v) {
    if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
  }
  __name(settle, "settle");
}
__name(__asyncGenerator, "__asyncGenerator");
function __asyncDelegator(o) {
  var i, p;
  return i = {}, verb("next"), verb("throw", function(e) {
    throw e;
  }), verb("return"), i[Symbol.iterator] = function() {
    return this;
  }, i;
  function verb(n, f) {
    i[n] = o[n] ? function(v) {
      return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v;
    } : f;
  }
  __name(verb, "verb");
}
__name(__asyncDelegator, "__asyncDelegator");
function __asyncValues(o) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator], i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
    return this;
  }, i);
  function verb(n) {
    i[n] = o[n] && function(v) {
      return new Promise(function(resolve, reject) {
        v = o[n](v), settle(resolve, reject, v.done, v.value);
      });
    };
  }
  __name(verb, "verb");
  function settle(resolve, reject, d, v) {
    Promise.resolve(v).then(function(v2) {
      resolve({ value: v2, done: d });
    }, reject);
  }
  __name(settle, "settle");
}
__name(__asyncValues, "__asyncValues");
function __makeTemplateObject(cooked, raw) {
  if (Object.defineProperty) {
    Object.defineProperty(cooked, "raw", { value: raw });
  } else {
    cooked.raw = raw;
  }
  return cooked;
}
__name(__makeTemplateObject, "__makeTemplateObject");
var __setModuleDefault = Object.create ? function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
} : function(o, v) {
  o["default"] = v;
};
var ownKeys = /* @__PURE__ */ __name(function(o) {
  ownKeys = Object.getOwnPropertyNames || function(o2) {
    var ar = [];
    for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
    return ar;
  };
  return ownKeys(o);
}, "ownKeys");
function __importStar(mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) {
    for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
  }
  __setModuleDefault(result, mod);
  return result;
}
__name(__importStar, "__importStar");
function __importDefault(mod) {
  return mod && mod.__esModule ? mod : { default: mod };
}
__name(__importDefault, "__importDefault");
function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
__name(__classPrivateFieldGet, "__classPrivateFieldGet");
function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}
__name(__classPrivateFieldSet, "__classPrivateFieldSet");
function __classPrivateFieldIn(state, receiver) {
  if (receiver === null || typeof receiver !== "object" && typeof receiver !== "function") throw new TypeError("Cannot use 'in' operator on non-object");
  return typeof state === "function" ? receiver === state : state.has(receiver);
}
__name(__classPrivateFieldIn, "__classPrivateFieldIn");
function __addDisposableResource(env, value, async) {
  if (value !== null && value !== void 0) {
    if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
    var dispose, inner;
    if (async) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      dispose = value[Symbol.asyncDispose];
    }
    if (dispose === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      dispose = value[Symbol.dispose];
      if (async) inner = dispose;
    }
    if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
    if (inner) dispose = /* @__PURE__ */ __name(function() {
      try {
        inner.call(this);
      } catch (e) {
        return Promise.reject(e);
      }
    }, "dispose");
    env.stack.push({ value, dispose, async });
  } else if (async) {
    env.stack.push({ async: true });
  }
  return value;
}
__name(__addDisposableResource, "__addDisposableResource");
var _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
function __disposeResources(env) {
  function fail(e) {
    env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
    env.hasError = true;
  }
  __name(fail, "fail");
  var r, s = 0;
  function next() {
    while (r = env.stack.pop()) {
      try {
        if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
        if (r.dispose) {
          var result = r.dispose.call(r.value);
          if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) {
            fail(e);
            return next();
          });
        } else s |= 1;
      } catch (e) {
        fail(e);
      }
    }
    if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
    if (env.hasError) throw env.error;
  }
  __name(next, "next");
  return next();
}
__name(__disposeResources, "__disposeResources");
function __rewriteRelativeImportExtension(path, preserveJsx) {
  if (typeof path === "string" && /^\.\.?\//.test(path)) {
    return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function(m, tsx, d, ext, cm) {
      return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : d + ext + "." + cm.toLowerCase() + "js";
    });
  }
  return path;
}
__name(__rewriteRelativeImportExtension, "__rewriteRelativeImportExtension");
const tslib_es6 = {
  __extends,
  __assign,
  __rest,
  __decorate,
  __param,
  __esDecorate,
  __runInitializers,
  __propKey,
  __setFunctionName,
  __metadata,
  __awaiter,
  __generator,
  __createBinding,
  __exportStar,
  __values,
  __read,
  __spread,
  __spreadArrays,
  __spreadArray,
  __await,
  __asyncGenerator,
  __asyncDelegator,
  __asyncValues,
  __makeTemplateObject,
  __importStar,
  __importDefault,
  __classPrivateFieldGet,
  __classPrivateFieldSet,
  __classPrivateFieldIn,
  __addDisposableResource,
  __disposeResources,
  __rewriteRelativeImportExtension
};
const tslib_es6$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __addDisposableResource,
  get __assign() {
    return __assign;
  },
  __asyncDelegator,
  __asyncGenerator,
  __asyncValues,
  __await,
  __awaiter,
  __classPrivateFieldGet,
  __classPrivateFieldIn,
  __classPrivateFieldSet,
  __createBinding,
  __decorate,
  __disposeResources,
  __esDecorate,
  __exportStar,
  __extends,
  __generator,
  __importDefault,
  __importStar,
  __makeTemplateObject,
  __metadata,
  __param,
  __propKey,
  __read,
  __rest,
  __rewriteRelativeImportExtension,
  __runInitializers,
  __setFunctionName,
  __spread,
  __spreadArray,
  __spreadArrays,
  __values,
  default: tslib_es6
}, Symbol.toStringTag, { value: "Module" }));
const require$$0 = /* @__PURE__ */ getAugmentedNamespace(tslib_es6$1);
var ServerError$3 = {};
(function(exports) {
  exports.CloseCode = void 0;
  (function(CloseCode) {
    CloseCode[CloseCode["CONSENTED"] = 4e3] = "CONSENTED";
    CloseCode[CloseCode["DEVMODE_RESTART"] = 4010] = "DEVMODE_RESTART";
  })(exports.CloseCode || (exports.CloseCode = {}));
  const _ServerError = class _ServerError extends Error {
    constructor(code, message) {
      super(message);
      this.name = "ServerError";
      this.code = code;
    }
  };
  __name(_ServerError, "ServerError");
  let ServerError2 = _ServerError;
  exports.ServerError = ServerError2;
})(ServerError$3);
var Room$2 = {};
var Connection$2 = {};
var H3Transport$1 = {};
var umd$1 = { exports: {} };
(function(module, exports) {
  (function(global2, factory) {
    factory(exports);
  })(commonjsGlobal$1, function(exports2) {
    const SWITCH_TO_STRUCTURE = 255;
    const TYPE_ID = 213;
    exports2.OPERATION = void 0;
    (function(OPERATION) {
      OPERATION[OPERATION["ADD"] = 128] = "ADD";
      OPERATION[OPERATION["REPLACE"] = 0] = "REPLACE";
      OPERATION[OPERATION["DELETE"] = 64] = "DELETE";
      OPERATION[OPERATION["DELETE_AND_MOVE"] = 96] = "DELETE_AND_MOVE";
      OPERATION[OPERATION["MOVE_AND_ADD"] = 160] = "MOVE_AND_ADD";
      OPERATION[OPERATION["DELETE_AND_ADD"] = 192] = "DELETE_AND_ADD";
      OPERATION[OPERATION["CLEAR"] = 10] = "CLEAR";
      OPERATION[OPERATION["REVERSE"] = 15] = "REVERSE";
      OPERATION[OPERATION["MOVE"] = 32] = "MOVE";
      OPERATION[OPERATION["DELETE_BY_REFID"] = 33] = "DELETE_BY_REFID";
      OPERATION[OPERATION["ADD_BY_REFID"] = 129] = "ADD_BY_REFID";
    })(exports2.OPERATION || (exports2.OPERATION = {}));
    Symbol.metadata ?? (Symbol.metadata = Symbol.for("Symbol.metadata"));
    const $track = Symbol("$track");
    const $encoder = Symbol("$encoder");
    const $decoder = Symbol("$decoder");
    const $filter = Symbol("$filter");
    const $getByIndex = Symbol("$getByIndex");
    const $deleteByIndex = Symbol("$deleteByIndex");
    const $changes = Symbol("$changes");
    const $childType = Symbol("$childType");
    const $onEncodeEnd = Symbol("$onEncodeEnd");
    const $onDecodeEnd = Symbol("$onDecodeEnd");
    const $descriptors = Symbol("$descriptors");
    const $numFields = "$__numFields";
    const $refTypeFieldIndexes = "$__refTypeFieldIndexes";
    const $viewFieldIndexes = "$__viewFieldIndexes";
    const $fieldIndexesByViewTag = "$__fieldIndexesByViewTag";
    let textEncoder2;
    try {
      textEncoder2 = new TextEncoder();
    } catch (e) {
    }
    const _convoBuffer$1 = new ArrayBuffer(8);
    const _int32$1 = new Int32Array(_convoBuffer$1);
    const _float32$1 = new Float32Array(_convoBuffer$1);
    const _float64$1 = new Float64Array(_convoBuffer$1);
    const _int64$1 = new BigInt64Array(_convoBuffer$1);
    const hasBufferByteLength = typeof Buffer !== "undefined" && Buffer.byteLength;
    const utf8Length = hasBufferByteLength ? Buffer.byteLength : function(str, _) {
      var c = 0, length = 0;
      for (var i = 0, l = str.length; i < l; i++) {
        c = str.charCodeAt(i);
        if (c < 128) {
          length += 1;
        } else if (c < 2048) {
          length += 2;
        } else if (c < 55296 || c >= 57344) {
          length += 3;
        } else {
          i++;
          length += 4;
        }
      }
      return length;
    };
    function utf8Write(view2, str, it) {
      var c = 0;
      for (var i = 0, l = str.length; i < l; i++) {
        c = str.charCodeAt(i);
        if (c < 128) {
          view2[it.offset++] = c;
        } else if (c < 2048) {
          view2[it.offset] = 192 | c >> 6;
          view2[it.offset + 1] = 128 | c & 63;
          it.offset += 2;
        } else if (c < 55296 || c >= 57344) {
          view2[it.offset] = 224 | c >> 12;
          view2[it.offset + 1] = 128 | c >> 6 & 63;
          view2[it.offset + 2] = 128 | c & 63;
          it.offset += 3;
        } else {
          i++;
          c = 65536 + ((c & 1023) << 10 | str.charCodeAt(i) & 1023);
          view2[it.offset] = 240 | c >> 18;
          view2[it.offset + 1] = 128 | c >> 12 & 63;
          view2[it.offset + 2] = 128 | c >> 6 & 63;
          view2[it.offset + 3] = 128 | c & 63;
          it.offset += 4;
        }
      }
    }
    __name(utf8Write, "utf8Write");
    function int8$1(bytes, value, it) {
      bytes[it.offset++] = value & 255;
    }
    __name(int8$1, "int8$1");
    function uint8$1(bytes, value, it) {
      bytes[it.offset++] = value & 255;
    }
    __name(uint8$1, "uint8$1");
    function int16$1(bytes, value, it) {
      bytes[it.offset++] = value & 255;
      bytes[it.offset++] = value >> 8 & 255;
    }
    __name(int16$1, "int16$1");
    function uint16$1(bytes, value, it) {
      bytes[it.offset++] = value & 255;
      bytes[it.offset++] = value >> 8 & 255;
    }
    __name(uint16$1, "uint16$1");
    function int32$1(bytes, value, it) {
      bytes[it.offset++] = value & 255;
      bytes[it.offset++] = value >> 8 & 255;
      bytes[it.offset++] = value >> 16 & 255;
      bytes[it.offset++] = value >> 24 & 255;
    }
    __name(int32$1, "int32$1");
    function uint32$1(bytes, value, it) {
      const b4 = value >> 24;
      const b3 = value >> 16;
      const b2 = value >> 8;
      const b1 = value;
      bytes[it.offset++] = b1 & 255;
      bytes[it.offset++] = b2 & 255;
      bytes[it.offset++] = b3 & 255;
      bytes[it.offset++] = b4 & 255;
    }
    __name(uint32$1, "uint32$1");
    function int64$1(bytes, value, it) {
      const high = Math.floor(value / Math.pow(2, 32));
      const low = value >>> 0;
      uint32$1(bytes, low, it);
      uint32$1(bytes, high, it);
    }
    __name(int64$1, "int64$1");
    function uint64$1(bytes, value, it) {
      const high = value / Math.pow(2, 32) >> 0;
      const low = value >>> 0;
      uint32$1(bytes, low, it);
      uint32$1(bytes, high, it);
    }
    __name(uint64$1, "uint64$1");
    function bigint64$1(bytes, value, it) {
      _int64$1[0] = BigInt.asIntN(64, value);
      int32$1(bytes, _int32$1[0], it);
      int32$1(bytes, _int32$1[1], it);
    }
    __name(bigint64$1, "bigint64$1");
    function biguint64$1(bytes, value, it) {
      _int64$1[0] = BigInt.asIntN(64, value);
      int32$1(bytes, _int32$1[0], it);
      int32$1(bytes, _int32$1[1], it);
    }
    __name(biguint64$1, "biguint64$1");
    function float32$1(bytes, value, it) {
      _float32$1[0] = value;
      int32$1(bytes, _int32$1[0], it);
    }
    __name(float32$1, "float32$1");
    function float64$1(bytes, value, it) {
      _float64$1[0] = value;
      int32$1(bytes, _int32$1[0], it);
      int32$1(bytes, _int32$1[1], it);
    }
    __name(float64$1, "float64$1");
    function boolean$1(bytes, value, it) {
      bytes[it.offset++] = value ? 1 : 0;
    }
    __name(boolean$1, "boolean$1");
    function string$1(bytes, value, it) {
      if (!value) {
        value = "";
      }
      let length = utf8Length(value, "utf8");
      let size = 0;
      if (length < 32) {
        bytes[it.offset++] = length | 160;
        size = 1;
      } else if (length < 256) {
        bytes[it.offset++] = 217;
        bytes[it.offset++] = length % 255;
        size = 2;
      } else if (length < 65536) {
        bytes[it.offset++] = 218;
        uint16$1(bytes, length, it);
        size = 3;
      } else if (length < 4294967296) {
        bytes[it.offset++] = 219;
        uint32$1(bytes, length, it);
        size = 5;
      } else {
        throw new Error("String too long");
      }
      utf8Write(bytes, value, it);
      return size + length;
    }
    __name(string$1, "string$1");
    function number$1(bytes, value, it) {
      if (isNaN(value)) {
        return number$1(bytes, 0, it);
      } else if (!isFinite(value)) {
        return number$1(bytes, value > 0 ? Number.MAX_SAFE_INTEGER : -Number.MAX_SAFE_INTEGER, it);
      } else if (value !== (value | 0)) {
        if (Math.abs(value) <= 34028235e31) {
          _float32$1[0] = value;
          if (Math.abs(Math.abs(_float32$1[0]) - Math.abs(value)) < 1e-4) {
            bytes[it.offset++] = 202;
            float32$1(bytes, value, it);
            return 5;
          }
        }
        bytes[it.offset++] = 203;
        float64$1(bytes, value, it);
        return 9;
      }
      if (value >= 0) {
        if (value < 128) {
          bytes[it.offset++] = value & 255;
          return 1;
        }
        if (value < 256) {
          bytes[it.offset++] = 204;
          bytes[it.offset++] = value & 255;
          return 2;
        }
        if (value < 65536) {
          bytes[it.offset++] = 205;
          uint16$1(bytes, value, it);
          return 3;
        }
        if (value < 4294967296) {
          bytes[it.offset++] = 206;
          uint32$1(bytes, value, it);
          return 5;
        }
        bytes[it.offset++] = 207;
        uint64$1(bytes, value, it);
        return 9;
      } else {
        if (value >= -32) {
          bytes[it.offset++] = 224 | value + 32;
          return 1;
        }
        if (value >= -128) {
          bytes[it.offset++] = 208;
          int8$1(bytes, value, it);
          return 2;
        }
        if (value >= -32768) {
          bytes[it.offset++] = 209;
          int16$1(bytes, value, it);
          return 3;
        }
        if (value >= -2147483648) {
          bytes[it.offset++] = 210;
          int32$1(bytes, value, it);
          return 5;
        }
        bytes[it.offset++] = 211;
        int64$1(bytes, value, it);
        return 9;
      }
    }
    __name(number$1, "number$1");
    const encode2 = {
      int8: int8$1,
      uint8: uint8$1,
      int16: int16$1,
      uint16: uint16$1,
      int32: int32$1,
      uint32: uint32$1,
      int64: int64$1,
      uint64: uint64$1,
      bigint64: bigint64$1,
      biguint64: biguint64$1,
      float32: float32$1,
      float64: float64$1,
      boolean: boolean$1,
      string: string$1,
      number: number$1,
      utf8Write,
      utf8Length
    };
    const _convoBuffer = new ArrayBuffer(8);
    const _int32 = new Int32Array(_convoBuffer);
    const _float32 = new Float32Array(_convoBuffer);
    const _float64 = new Float64Array(_convoBuffer);
    const _uint64 = new BigUint64Array(_convoBuffer);
    const _int64 = new BigInt64Array(_convoBuffer);
    function utf8Read(bytes, it, length) {
      var string2 = "", chr = 0;
      for (var i = it.offset, end = it.offset + length; i < end; i++) {
        var byte = bytes[i];
        if ((byte & 128) === 0) {
          string2 += String.fromCharCode(byte);
          continue;
        }
        if ((byte & 224) === 192) {
          string2 += String.fromCharCode((byte & 31) << 6 | bytes[++i] & 63);
          continue;
        }
        if ((byte & 240) === 224) {
          string2 += String.fromCharCode((byte & 15) << 12 | (bytes[++i] & 63) << 6 | (bytes[++i] & 63) << 0);
          continue;
        }
        if ((byte & 248) === 240) {
          chr = (byte & 7) << 18 | (bytes[++i] & 63) << 12 | (bytes[++i] & 63) << 6 | (bytes[++i] & 63) << 0;
          if (chr >= 65536) {
            chr -= 65536;
            string2 += String.fromCharCode((chr >>> 10) + 55296, (chr & 1023) + 56320);
          } else {
            string2 += String.fromCharCode(chr);
          }
          continue;
        }
        console.error("Invalid byte " + byte.toString(16));
      }
      it.offset += length;
      return string2;
    }
    __name(utf8Read, "utf8Read");
    function int8(bytes, it) {
      return uint8(bytes, it) << 24 >> 24;
    }
    __name(int8, "int8");
    function uint8(bytes, it) {
      return bytes[it.offset++];
    }
    __name(uint8, "uint8");
    function int16(bytes, it) {
      return uint16(bytes, it) << 16 >> 16;
    }
    __name(int16, "int16");
    function uint16(bytes, it) {
      return bytes[it.offset++] | bytes[it.offset++] << 8;
    }
    __name(uint16, "uint16");
    function int32(bytes, it) {
      return bytes[it.offset++] | bytes[it.offset++] << 8 | bytes[it.offset++] << 16 | bytes[it.offset++] << 24;
    }
    __name(int32, "int32");
    function uint32(bytes, it) {
      return int32(bytes, it) >>> 0;
    }
    __name(uint32, "uint32");
    function float32(bytes, it) {
      _int32[0] = int32(bytes, it);
      return _float32[0];
    }
    __name(float32, "float32");
    function float64(bytes, it) {
      _int32[0] = int32(bytes, it);
      _int32[1] = int32(bytes, it);
      return _float64[0];
    }
    __name(float64, "float64");
    function int64(bytes, it) {
      const low = uint32(bytes, it);
      const high = int32(bytes, it) * Math.pow(2, 32);
      return high + low;
    }
    __name(int64, "int64");
    function uint64(bytes, it) {
      const low = uint32(bytes, it);
      const high = uint32(bytes, it) * Math.pow(2, 32);
      return high + low;
    }
    __name(uint64, "uint64");
    function bigint64(bytes, it) {
      _int32[0] = int32(bytes, it);
      _int32[1] = int32(bytes, it);
      return _int64[0];
    }
    __name(bigint64, "bigint64");
    function biguint64(bytes, it) {
      _int32[0] = int32(bytes, it);
      _int32[1] = int32(bytes, it);
      return _uint64[0];
    }
    __name(biguint64, "biguint64");
    function boolean(bytes, it) {
      return uint8(bytes, it) > 0;
    }
    __name(boolean, "boolean");
    function string(bytes, it) {
      const prefix = bytes[it.offset++];
      let length;
      if (prefix < 192) {
        length = prefix & 31;
      } else if (prefix === 217) {
        length = uint8(bytes, it);
      } else if (prefix === 218) {
        length = uint16(bytes, it);
      } else if (prefix === 219) {
        length = uint32(bytes, it);
      }
      return utf8Read(bytes, it, length);
    }
    __name(string, "string");
    function number(bytes, it) {
      const prefix = bytes[it.offset++];
      if (prefix < 128) {
        return prefix;
      } else if (prefix === 202) {
        return float32(bytes, it);
      } else if (prefix === 203) {
        return float64(bytes, it);
      } else if (prefix === 204) {
        return uint8(bytes, it);
      } else if (prefix === 205) {
        return uint16(bytes, it);
      } else if (prefix === 206) {
        return uint32(bytes, it);
      } else if (prefix === 207) {
        return uint64(bytes, it);
      } else if (prefix === 208) {
        return int8(bytes, it);
      } else if (prefix === 209) {
        return int16(bytes, it);
      } else if (prefix === 210) {
        return int32(bytes, it);
      } else if (prefix === 211) {
        return int64(bytes, it);
      } else if (prefix > 223) {
        return (255 - prefix + 1) * -1;
      }
    }
    __name(number, "number");
    function stringCheck(bytes, it) {
      const prefix = bytes[it.offset];
      return (
        // fixstr
        prefix < 192 && prefix > 160 || // str 8
        prefix === 217 || // str 16
        prefix === 218 || // str 32
        prefix === 219
      );
    }
    __name(stringCheck, "stringCheck");
    const decode2 = {
      utf8Read,
      int8,
      uint8,
      int16,
      uint16,
      int32,
      uint32,
      float32,
      float64,
      int64,
      uint64,
      bigint64,
      biguint64,
      boolean,
      string,
      number,
      stringCheck
    };
    const registeredTypes = {};
    const identifiers = /* @__PURE__ */ new Map();
    function registerType(identifier, definition) {
      if (definition.constructor) {
        identifiers.set(definition.constructor, identifier);
        registeredTypes[identifier] = definition;
      }
      if (definition.encode) {
        encode2[identifier] = definition.encode;
      }
      if (definition.decode) {
        decode2[identifier] = definition.decode;
      }
    }
    __name(registerType, "registerType");
    function getType(identifier) {
      return registeredTypes[identifier];
    }
    __name(getType, "getType");
    function defineCustomTypes(types) {
      for (const identifier in types) {
        registerType(identifier, types[identifier]);
      }
      return (t) => type(t);
    }
    __name(defineCustomTypes, "defineCustomTypes");
    const _TypeContext = class _TypeContext {
      static register(target2) {
        const parent = Object.getPrototypeOf(target2);
        if (parent !== Schema) {
          let inherits = _TypeContext.inheritedTypes.get(parent);
          if (!inherits) {
            inherits = /* @__PURE__ */ new Set();
            _TypeContext.inheritedTypes.set(parent, inherits);
          }
          inherits.add(target2);
        }
      }
      static cache(rootClass) {
        let context = _TypeContext.cachedContexts.get(rootClass);
        if (!context) {
          context = new _TypeContext(rootClass);
          _TypeContext.cachedContexts.set(rootClass, context);
        }
        return context;
      }
      constructor(rootClass) {
        this.types = {};
        this.schemas = /* @__PURE__ */ new Map();
        this.hasFilters = false;
        this.parentFiltered = {};
        if (rootClass) {
          this.discoverTypes(rootClass);
        }
      }
      has(schema3) {
        return this.schemas.has(schema3);
      }
      get(typeid) {
        return this.types[typeid];
      }
      add(schema3, typeid = this.schemas.size) {
        if (this.schemas.has(schema3)) {
          return false;
        }
        this.types[typeid] = schema3;
        if (schema3[Symbol.metadata] === void 0) {
          Metadata.initialize(schema3);
        }
        this.schemas.set(schema3, typeid);
        return true;
      }
      getTypeId(klass) {
        return this.schemas.get(klass);
      }
      discoverTypes(klass, parentType, parentIndex, parentHasViewTag) {
        var _a4, _b3;
        if (parentHasViewTag) {
          this.registerFilteredByParent(klass, parentType, parentIndex);
        }
        if (!this.add(klass)) {
          return;
        }
        (_a4 = _TypeContext.inheritedTypes.get(klass)) == null ? void 0 : _a4.forEach((child) => {
          this.discoverTypes(child, parentType, parentIndex, parentHasViewTag);
        });
        let parent = klass;
        while ((parent = Object.getPrototypeOf(parent)) && parent !== Schema && // stop at root (Schema)
        parent !== Function.prototype) {
          this.discoverTypes(parent);
        }
        const metadata = klass[_b3 = Symbol.metadata] ?? (klass[_b3] = {});
        if (metadata[$viewFieldIndexes]) {
          this.hasFilters = true;
        }
        for (const fieldIndex in metadata) {
          const index = fieldIndex;
          const fieldType = metadata[index].type;
          const fieldHasViewTag = metadata[index].tag !== void 0;
          if (typeof fieldType === "string") {
            continue;
          }
          if (Array.isArray(fieldType)) {
            const type2 = fieldType[0];
            if (type2 === "string") {
              continue;
            }
            this.discoverTypes(type2, klass, index, parentHasViewTag || fieldHasViewTag);
          } else if (typeof fieldType === "function") {
            this.discoverTypes(fieldType, klass, index, parentHasViewTag || fieldHasViewTag);
          } else {
            const type2 = Object.values(fieldType)[0];
            if (typeof type2 === "string") {
              continue;
            }
            this.discoverTypes(type2, klass, index, parentHasViewTag || fieldHasViewTag);
          }
        }
      }
      /**
       * Keep track of which classes have filters applied.
       * Format: `${typeid}-${parentTypeid}-${parentIndex}`
       */
      registerFilteredByParent(schema3, parentType, parentIndex) {
        const typeid = this.schemas.get(schema3) ?? this.schemas.size;
        let key = `${typeid}`;
        if (parentType) {
          key += `-${this.schemas.get(parentType)}`;
        }
        key += `-${parentIndex}`;
        this.parentFiltered[key] = true;
      }
      debug() {
        let parentFiltered = "";
        for (const key in this.parentFiltered) {
          const keys = key.split("-").map(Number);
          const fieldIndex = keys.pop();
          parentFiltered += `
		`;
          parentFiltered += `${key}: ${keys.reverse().map((id, i) => {
            const klass = this.types[id];
            const metadata = klass[Symbol.metadata];
            let txt = klass.name;
            if (i === 0) {
              txt += `[${metadata[fieldIndex].name}]`;
            }
            return `${txt}`;
          }).join(" -> ")}`;
        }
        return `TypeContext ->
	Schema types: ${this.schemas.size}
	hasFilters: ${this.hasFilters}
	parentFiltered:${parentFiltered}`;
      }
    };
    __name(_TypeContext, "TypeContext");
    _TypeContext.inheritedTypes = /* @__PURE__ */ new Map();
    _TypeContext.cachedContexts = /* @__PURE__ */ new Map();
    let TypeContext = _TypeContext;
    function getNormalizedType(type2) {
      return Array.isArray(type2) ? { array: type2[0] } : typeof type2["type"] !== "undefined" ? type2["type"] : type2;
    }
    __name(getNormalizedType, "getNormalizedType");
    const Metadata = {
      addField(metadata, index, name, type2, descriptor) {
        if (index > 64) {
          throw new Error(`Can't define field '${name}'.
Schema instances may only have up to 64 fields.`);
        }
        metadata[index] = Object.assign(
          metadata[index] || {},
          // avoid overwriting previous field metadata (@owned / @deprecated)
          {
            type: getNormalizedType(type2),
            index,
            name
          }
        );
        Object.defineProperty(metadata, $descriptors, {
          value: metadata[$descriptors] || {},
          enumerable: false,
          configurable: true
        });
        if (descriptor) {
          metadata[$descriptors][name] = descriptor;
          metadata[$descriptors][`_${name}`] = {
            value: void 0,
            writable: true,
            enumerable: false,
            configurable: true
          };
        } else {
          metadata[$descriptors][name] = {
            value: void 0,
            writable: true,
            enumerable: true,
            configurable: true
          };
        }
        Object.defineProperty(metadata, $numFields, {
          value: index,
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(metadata, name, {
          value: index,
          enumerable: false,
          configurable: true
        });
        if (typeof metadata[index].type !== "string") {
          if (metadata[$refTypeFieldIndexes] === void 0) {
            Object.defineProperty(metadata, $refTypeFieldIndexes, {
              value: [],
              enumerable: false,
              configurable: true
            });
          }
          metadata[$refTypeFieldIndexes].push(index);
        }
      },
      setTag(metadata, fieldName, tag) {
        const index = metadata[fieldName];
        const field = metadata[index];
        field.tag = tag;
        if (!metadata[$viewFieldIndexes]) {
          Object.defineProperty(metadata, $viewFieldIndexes, {
            value: [],
            enumerable: false,
            configurable: true
          });
          Object.defineProperty(metadata, $fieldIndexesByViewTag, {
            value: {},
            enumerable: false,
            configurable: true
          });
        }
        metadata[$viewFieldIndexes].push(index);
        if (!metadata[$fieldIndexesByViewTag][tag]) {
          metadata[$fieldIndexesByViewTag][tag] = [];
        }
        metadata[$fieldIndexesByViewTag][tag].push(index);
      },
      setFields(target2, fields) {
        const constructor = target2.prototype.constructor;
        TypeContext.register(constructor);
        const parentClass = Object.getPrototypeOf(constructor);
        const parentMetadata = parentClass && parentClass[Symbol.metadata];
        const metadata = Metadata.initialize(constructor);
        if (!constructor[$track]) {
          constructor[$track] = Schema[$track];
        }
        if (!constructor[$encoder]) {
          constructor[$encoder] = Schema[$encoder];
        }
        if (!constructor[$decoder]) {
          constructor[$decoder] = Schema[$decoder];
        }
        if (!constructor.prototype.toJSON) {
          constructor.prototype.toJSON = Schema.prototype.toJSON;
        }
        let fieldIndex = metadata[$numFields] ?? (parentMetadata && parentMetadata[$numFields]) ?? -1;
        fieldIndex++;
        for (const field in fields) {
          const type2 = fields[field];
          const complexTypeKlass = Array.isArray(type2) ? getType("array") : typeof Object.keys(type2)[0] === "string" && getType(Object.keys(type2)[0]);
          const childType = complexTypeKlass ? Object.values(type2)[0] : getNormalizedType(type2);
          Metadata.addField(metadata, fieldIndex, field, type2, getPropertyDescriptor(`_${field}`, fieldIndex, childType, complexTypeKlass));
          fieldIndex++;
        }
        return target2;
      },
      isDeprecated(metadata, field) {
        return metadata[field].deprecated === true;
      },
      init(klass) {
        const metadata = {};
        klass[Symbol.metadata] = metadata;
        Object.defineProperty(metadata, $numFields, {
          value: 0,
          enumerable: false,
          configurable: true
        });
      },
      initialize(constructor) {
        const parentClass = Object.getPrototypeOf(constructor);
        const parentMetadata = parentClass[Symbol.metadata];
        let metadata = constructor[Symbol.metadata] ?? /* @__PURE__ */ Object.create(null);
        if (parentClass !== Schema && metadata === parentMetadata) {
          metadata = /* @__PURE__ */ Object.create(null);
          if (parentMetadata) {
            Object.setPrototypeOf(metadata, parentMetadata);
            Object.defineProperty(metadata, $numFields, {
              value: parentMetadata[$numFields],
              enumerable: false,
              configurable: true,
              writable: true
            });
            if (parentMetadata[$viewFieldIndexes] !== void 0) {
              Object.defineProperty(metadata, $viewFieldIndexes, {
                value: [...parentMetadata[$viewFieldIndexes]],
                enumerable: false,
                configurable: true,
                writable: true
              });
              Object.defineProperty(metadata, $fieldIndexesByViewTag, {
                value: { ...parentMetadata[$fieldIndexesByViewTag] },
                enumerable: false,
                configurable: true,
                writable: true
              });
            }
            if (parentMetadata[$refTypeFieldIndexes] !== void 0) {
              Object.defineProperty(metadata, $refTypeFieldIndexes, {
                value: [...parentMetadata[$refTypeFieldIndexes]],
                enumerable: false,
                configurable: true,
                writable: true
              });
            }
            Object.defineProperty(metadata, $descriptors, {
              value: { ...parentMetadata[$descriptors] },
              enumerable: false,
              configurable: true,
              writable: true
            });
          }
        }
        constructor[Symbol.metadata] = metadata;
        return metadata;
      },
      isValidInstance(klass) {
        return klass.constructor[Symbol.metadata] && Object.prototype.hasOwnProperty.call(klass.constructor[Symbol.metadata], $numFields);
      },
      getFields(klass) {
        const metadata = klass[Symbol.metadata];
        const fields = {};
        for (let i = 0; i <= metadata[$numFields]; i++) {
          fields[metadata[i].name] = metadata[i].type;
        }
        return fields;
      },
      hasViewTagAtIndex(metadata, index) {
        var _a4;
        return (_a4 = metadata == null ? void 0 : metadata[$viewFieldIndexes]) == null ? void 0 : _a4.includes(index);
      }
    };
    function createChangeSet() {
      return { indexes: {}, operations: [] };
    }
    __name(createChangeSet, "createChangeSet");
    function setOperationAtIndex(changeSet, index) {
      const operationsIndex = changeSet.indexes[index];
      if (operationsIndex === void 0) {
        changeSet.indexes[index] = changeSet.operations.push(index) - 1;
      } else {
        changeSet.operations[operationsIndex] = index;
      }
    }
    __name(setOperationAtIndex, "setOperationAtIndex");
    function deleteOperationAtIndex(changeSet, index) {
      var _a4;
      let operationsIndex = changeSet.indexes[index];
      if (operationsIndex === void 0) {
        operationsIndex = Object.values(changeSet.indexes).at(-1);
        index = (_a4 = Object.entries(changeSet.indexes).find(([_, value]) => value === operationsIndex)) == null ? void 0 : _a4[0];
      }
      changeSet.operations[operationsIndex] = void 0;
      delete changeSet.indexes[index];
    }
    __name(deleteOperationAtIndex, "deleteOperationAtIndex");
    function enqueueChangeTree(root, changeTree, changeSet, queueRootIndex = changeTree[changeSet].queueRootIndex) {
      if (!root) {
        return;
      } else if (root[changeSet][queueRootIndex] !== changeTree) {
        changeTree[changeSet].queueRootIndex = root[changeSet].push(changeTree) - 1;
      }
    }
    __name(enqueueChangeTree, "enqueueChangeTree");
    const _ChangeTree = class _ChangeTree {
      constructor(ref) {
        this.isFiltered = false;
        this.indexedOperations = {};
        this.changes = { indexes: {}, operations: [] };
        this.allChanges = { indexes: {}, operations: [] };
        this.isNew = true;
        this.ref = ref;
        const metadata = ref.constructor[Symbol.metadata];
        if (metadata == null ? void 0 : metadata[$viewFieldIndexes]) {
          this.allFilteredChanges = { indexes: {}, operations: [] };
          this.filteredChanges = { indexes: {}, operations: [] };
        }
      }
      setRoot(root) {
        var _a4;
        this.root = root;
        this.checkIsFiltered(this.parent, this.parentIndex);
        const metadata = this.ref.constructor[Symbol.metadata];
        if (metadata) {
          (_a4 = metadata[$refTypeFieldIndexes]) == null ? void 0 : _a4.forEach((index) => {
            var _a5;
            const field = metadata[index];
            const changeTree = (_a5 = this.ref[field.name]) == null ? void 0 : _a5[$changes];
            if (changeTree) {
              if (changeTree.root !== root) {
                changeTree.setRoot(root);
              } else {
                root.add(changeTree);
              }
            }
          });
        } else if (this.ref[$childType] && typeof this.ref[$childType] !== "string") {
          this.ref.forEach((value, key) => {
            const changeTree = value[$changes];
            if (changeTree.root !== root) {
              changeTree.setRoot(root);
            } else {
              root.add(changeTree);
            }
          });
        }
      }
      setParent(parent, root, parentIndex) {
        var _a4;
        this.parent = parent;
        this.parentIndex = parentIndex;
        if (!root) {
          return;
        }
        if (root !== this.root) {
          this.root = root;
          this.checkIsFiltered(parent, parentIndex);
        } else {
          root.add(this);
        }
        const metadata = this.ref.constructor[Symbol.metadata];
        if (metadata) {
          (_a4 = metadata[$refTypeFieldIndexes]) == null ? void 0 : _a4.forEach((index) => {
            var _a5;
            const field = metadata[index];
            const changeTree = (_a5 = this.ref[field.name]) == null ? void 0 : _a5[$changes];
            if (changeTree && changeTree.root !== root) {
              changeTree.setParent(this.ref, root, index);
            }
          });
        } else if (this.ref[$childType] && typeof this.ref[$childType] !== "string") {
          this.ref.forEach((value, key) => {
            const changeTree = value[$changes];
            if (changeTree.root !== root) {
              changeTree.setParent(this.ref, root, this.indexes[key] ?? key);
            }
          });
        }
      }
      forEachChild(callback) {
        var _a4;
        const metadata = this.ref.constructor[Symbol.metadata];
        if (metadata) {
          (_a4 = metadata[$refTypeFieldIndexes]) == null ? void 0 : _a4.forEach((index) => {
            const field = metadata[index];
            const value = this.ref[field.name];
            if (value) {
              callback(value[$changes], index);
            }
          });
        } else if (this.ref[$childType] && typeof this.ref[$childType] !== "string") {
          this.ref.forEach((value, key) => {
            callback(value[$changes], this.indexes[key] ?? key);
          });
        }
      }
      operation(op) {
        if (this.filteredChanges !== void 0) {
          this.filteredChanges.operations.push(-op);
          enqueueChangeTree(this.root, this, "filteredChanges");
        } else {
          this.changes.operations.push(-op);
          enqueueChangeTree(this.root, this, "changes");
        }
      }
      change(index, operation = exports2.OPERATION.ADD) {
        var _a4;
        const metadata = this.ref.constructor[Symbol.metadata];
        const isFiltered = this.isFiltered || ((_a4 = metadata == null ? void 0 : metadata[index]) == null ? void 0 : _a4.tag) !== void 0;
        const changeSet = isFiltered ? this.filteredChanges : this.changes;
        const previousOperation = this.indexedOperations[index];
        if (!previousOperation || previousOperation === exports2.OPERATION.DELETE) {
          const op = !previousOperation ? operation : previousOperation === exports2.OPERATION.DELETE ? exports2.OPERATION.DELETE_AND_ADD : operation;
          this.indexedOperations[index] = op;
        }
        setOperationAtIndex(changeSet, index);
        if (isFiltered) {
          setOperationAtIndex(this.allFilteredChanges, index);
          if (this.root) {
            enqueueChangeTree(this.root, this, "filteredChanges");
            enqueueChangeTree(this.root, this, "allFilteredChanges");
          }
        } else {
          setOperationAtIndex(this.allChanges, index);
          enqueueChangeTree(this.root, this, "changes");
        }
      }
      shiftChangeIndexes(shiftIndex) {
        const changeSet = this.isFiltered ? this.filteredChanges : this.changes;
        const newIndexedOperations = {};
        const newIndexes = {};
        for (const index in this.indexedOperations) {
          newIndexedOperations[Number(index) + shiftIndex] = this.indexedOperations[index];
          newIndexes[Number(index) + shiftIndex] = changeSet.indexes[index];
        }
        this.indexedOperations = newIndexedOperations;
        changeSet.indexes = newIndexes;
        changeSet.operations = changeSet.operations.map((index) => index + shiftIndex);
      }
      shiftAllChangeIndexes(shiftIndex, startIndex = 0) {
        if (this.filteredChanges !== void 0) {
          this._shiftAllChangeIndexes(shiftIndex, startIndex, this.allFilteredChanges);
          this._shiftAllChangeIndexes(shiftIndex, startIndex, this.allChanges);
        } else {
          this._shiftAllChangeIndexes(shiftIndex, startIndex, this.allChanges);
        }
      }
      _shiftAllChangeIndexes(shiftIndex, startIndex = 0, changeSet) {
        const newIndexes = {};
        let newKey = 0;
        for (const key in changeSet.indexes) {
          newIndexes[newKey++] = changeSet.indexes[key];
        }
        changeSet.indexes = newIndexes;
        for (let i = 0; i < changeSet.operations.length; i++) {
          const index = changeSet.operations[i];
          if (index > startIndex) {
            changeSet.operations[i] = index + shiftIndex;
          }
        }
      }
      indexedOperation(index, operation, allChangesIndex = index) {
        this.indexedOperations[index] = operation;
        if (this.filteredChanges !== void 0) {
          setOperationAtIndex(this.allFilteredChanges, allChangesIndex);
          setOperationAtIndex(this.filteredChanges, index);
          enqueueChangeTree(this.root, this, "filteredChanges");
        } else {
          setOperationAtIndex(this.allChanges, allChangesIndex);
          setOperationAtIndex(this.changes, index);
          enqueueChangeTree(this.root, this, "changes");
        }
      }
      getType(index) {
        if (Metadata.isValidInstance(this.ref)) {
          const metadata = this.ref.constructor[Symbol.metadata];
          return metadata[index].type;
        } else {
          return this.ref[$childType];
        }
      }
      getChange(index) {
        return this.indexedOperations[index];
      }
      //
      // used during `.encode()`
      //
      getValue(index, isEncodeAll = false) {
        return this.ref[$getByIndex](index, isEncodeAll);
      }
      delete(index, operation, allChangesIndex = index) {
        var _a4;
        if (index === void 0) {
          try {
            throw new Error(`@colyseus/schema ${this.ref.constructor.name}: trying to delete non-existing index '${index}'`);
          } catch (e) {
            console.warn(e);
          }
          return;
        }
        const changeSet = this.filteredChanges !== void 0 ? this.filteredChanges : this.changes;
        this.indexedOperations[index] = operation ?? exports2.OPERATION.DELETE;
        setOperationAtIndex(changeSet, index);
        deleteOperationAtIndex(this.allChanges, allChangesIndex);
        const previousValue = this.getValue(index);
        if (previousValue && previousValue[$changes]) {
          (_a4 = this.root) == null ? void 0 : _a4.remove(previousValue[$changes]);
        }
        if (this.filteredChanges !== void 0) {
          deleteOperationAtIndex(this.allFilteredChanges, allChangesIndex);
          enqueueChangeTree(this.root, this, "filteredChanges");
        } else {
          enqueueChangeTree(this.root, this, "changes");
        }
        return previousValue;
      }
      endEncode(changeSetName) {
        var _a4, _b3;
        this.indexedOperations = {};
        this[changeSetName].indexes = {};
        this[changeSetName].operations.length = 0;
        this[changeSetName].queueRootIndex = void 0;
        (_b3 = (_a4 = this.ref)[$onEncodeEnd]) == null ? void 0 : _b3.call(_a4);
        this.isNew = false;
      }
      discard(discardAll = false) {
        var _a4, _b3;
        (_b3 = (_a4 = this.ref)[$onEncodeEnd]) == null ? void 0 : _b3.call(_a4);
        this.indexedOperations = {};
        this.changes.indexes = {};
        this.changes.operations.length = 0;
        this.changes.queueRootIndex = void 0;
        if (this.filteredChanges !== void 0) {
          this.filteredChanges.indexes = {};
          this.filteredChanges.operations.length = 0;
          this.filteredChanges.queueRootIndex = void 0;
        }
        if (discardAll) {
          this.allChanges.indexes = {};
          this.allChanges.operations.length = 0;
          if (this.allFilteredChanges !== void 0) {
            this.allFilteredChanges.indexes = {};
            this.allFilteredChanges.operations.length = 0;
          }
        }
      }
      /**
       * Recursively discard all changes from this, and child structures.
       * (Used in tests only)
       */
      discardAll() {
        const keys = Object.keys(this.indexedOperations);
        for (let i = 0, len = keys.length; i < len; i++) {
          const value = this.getValue(Number(keys[i]));
          if (value && value[$changes]) {
            value[$changes].discardAll();
          }
        }
        this.discard();
      }
      ensureRefId() {
        if (this.refId !== void 0) {
          return;
        }
        this.refId = this.root.getNextUniqueId();
      }
      get changed() {
        return Object.entries(this.indexedOperations).length > 0;
      }
      checkIsFiltered(parent, parentIndex) {
        const isNewChangeTree = this.root.add(this);
        if (this.root.types.hasFilters) {
          this._checkFilteredByParent(parent, parentIndex);
          if (this.filteredChanges !== void 0) {
            enqueueChangeTree(this.root, this, "filteredChanges");
            if (isNewChangeTree) {
              this.root.allFilteredChanges.push(this);
            }
          }
        }
        if (!this.isFiltered) {
          enqueueChangeTree(this.root, this, "changes");
          if (isNewChangeTree) {
            this.root.allChanges.push(this);
          }
        }
      }
      _checkFilteredByParent(parent, parentIndex) {
        if (!parent) {
          return;
        }
        const refType = Metadata.isValidInstance(this.ref) ? this.ref.constructor : this.ref[$childType];
        let parentChangeTree;
        let parentIsCollection = !Metadata.isValidInstance(parent);
        if (parentIsCollection) {
          parentChangeTree = parent[$changes];
          parent = parentChangeTree.parent;
          parentIndex = parentChangeTree.parentIndex;
        } else {
          parentChangeTree = parent[$changes];
        }
        const parentConstructor = parent.constructor;
        let key = `${this.root.types.getTypeId(refType)}`;
        if (parentConstructor) {
          key += `-${this.root.types.schemas.get(parentConstructor)}`;
        }
        key += `-${parentIndex}`;
        const fieldHasViewTag = Metadata.hasViewTagAtIndex(parentConstructor == null ? void 0 : parentConstructor[Symbol.metadata], parentIndex);
        this.isFiltered = parent[$changes].isFiltered || this.root.types.parentFiltered[key] || fieldHasViewTag;
        if (this.isFiltered) {
          this.isVisibilitySharedWithParent = parentChangeTree.isFiltered && typeof refType !== "string" && !fieldHasViewTag && parentIsCollection;
          if (!this.filteredChanges) {
            this.filteredChanges = createChangeSet();
            this.allFilteredChanges = createChangeSet();
          }
          if (this.changes.operations.length > 0) {
            this.changes.operations.forEach((index) => setOperationAtIndex(this.filteredChanges, index));
            this.allChanges.operations.forEach((index) => setOperationAtIndex(this.allFilteredChanges, index));
            this.changes = createChangeSet();
            this.allChanges = createChangeSet();
          }
        }
      }
    };
    __name(_ChangeTree, "ChangeTree");
    let ChangeTree = _ChangeTree;
    function encodeValue(encoder, bytes, type2, value, operation, it) {
      var _a4;
      if (typeof type2 === "string") {
        (_a4 = encode2[type2]) == null ? void 0 : _a4.call(encode2, bytes, value, it);
      } else if (type2[Symbol.metadata] !== void 0) {
        encode2.number(bytes, value[$changes].refId, it);
        if ((operation & exports2.OPERATION.ADD) === exports2.OPERATION.ADD) {
          encoder.tryEncodeTypeId(bytes, type2, value.constructor, it);
        }
      } else {
        encode2.number(bytes, value[$changes].refId, it);
      }
    }
    __name(encodeValue, "encodeValue");
    const encodeSchemaOperation = /* @__PURE__ */ __name(function(encoder, bytes, changeTree, index, operation, it, _, __, metadata) {
      bytes[it.offset++] = (index | operation) & 255;
      if (operation === exports2.OPERATION.DELETE) {
        return;
      }
      const ref = changeTree.ref;
      const field = metadata[index];
      encodeValue(encoder, bytes, metadata[index].type, ref[field.name], operation, it);
    }, "encodeSchemaOperation");
    const encodeKeyValueOperation = /* @__PURE__ */ __name(function(encoder, bytes, changeTree, index, operation, it) {
      bytes[it.offset++] = operation & 255;
      if (operation === exports2.OPERATION.CLEAR) {
        return;
      }
      encode2.number(bytes, index, it);
      if (operation === exports2.OPERATION.DELETE) {
        return;
      }
      const ref = changeTree.ref;
      if ((operation & exports2.OPERATION.ADD) === exports2.OPERATION.ADD) {
        if (typeof ref["set"] === "function") {
          const dynamicIndex = changeTree.ref["$indexes"].get(index);
          encode2.string(bytes, dynamicIndex, it);
        }
      }
      const type2 = ref[$childType];
      const value = ref[$getByIndex](index);
      encodeValue(encoder, bytes, type2, value, operation, it);
    }, "encodeKeyValueOperation");
    const encodeArray = /* @__PURE__ */ __name(function(encoder, bytes, changeTree, field, operation, it, isEncodeAll, hasView) {
      const ref = changeTree.ref;
      const useOperationByRefId = hasView && changeTree.isFiltered && typeof changeTree.getType(field) !== "string";
      let refOrIndex;
      if (useOperationByRefId) {
        refOrIndex = ref["tmpItems"][field][$changes].refId;
        if (operation === exports2.OPERATION.DELETE) {
          operation = exports2.OPERATION.DELETE_BY_REFID;
        } else if (operation === exports2.OPERATION.ADD) {
          operation = exports2.OPERATION.ADD_BY_REFID;
        }
      } else {
        refOrIndex = field;
      }
      bytes[it.offset++] = operation & 255;
      if (operation === exports2.OPERATION.CLEAR || operation === exports2.OPERATION.REVERSE) {
        return;
      }
      encode2.number(bytes, refOrIndex, it);
      if (operation === exports2.OPERATION.DELETE || operation === exports2.OPERATION.DELETE_BY_REFID) {
        return;
      }
      const type2 = changeTree.getType(field);
      const value = changeTree.getValue(field, isEncodeAll);
      encodeValue(encoder, bytes, type2, value, operation, it);
    }, "encodeArray");
    const DEFINITION_MISMATCH = -1;
    function decodeValue(decoder2, operation, ref, index, type2, bytes, it, allChanges) {
      const $root = decoder2.root;
      const previousValue = ref[$getByIndex](index);
      let value;
      if ((operation & exports2.OPERATION.DELETE) === exports2.OPERATION.DELETE) {
        const previousRefId = $root.refIds.get(previousValue);
        if (previousRefId !== void 0) {
          $root.removeRef(previousRefId);
        }
        if (operation !== exports2.OPERATION.DELETE_AND_ADD) {
          ref[$deleteByIndex](index);
        }
        value = void 0;
      }
      if (operation === exports2.OPERATION.DELETE) ;
      else if (Schema.is(type2)) {
        const refId = decode2.number(bytes, it);
        value = $root.refs.get(refId);
        if ((operation & exports2.OPERATION.ADD) === exports2.OPERATION.ADD) {
          const childType = decoder2.getInstanceType(bytes, it, type2);
          if (!value) {
            value = decoder2.createInstanceOfType(childType);
          }
          $root.addRef(refId, value, value !== previousValue || // increment ref count if value has changed
          operation === exports2.OPERATION.DELETE_AND_ADD && value === previousValue);
        }
      } else if (typeof type2 === "string") {
        value = decode2[type2](bytes, it);
      } else {
        const typeDef = getType(Object.keys(type2)[0]);
        const refId = decode2.number(bytes, it);
        const valueRef = $root.refs.has(refId) ? previousValue || $root.refs.get(refId) : new typeDef.constructor();
        value = valueRef.clone(true);
        value[$childType] = Object.values(type2)[0];
        if (previousValue) {
          let previousRefId = $root.refIds.get(previousValue);
          if (previousRefId !== void 0 && refId !== previousRefId) {
            const entries = previousValue.entries();
            let iter;
            while ((iter = entries.next()) && !iter.done) {
              const [key, value2] = iter.value;
              if (typeof value2 === "object") {
                previousRefId = $root.refIds.get(value2);
                $root.removeRef(previousRefId);
              }
              allChanges.push({
                ref: previousValue,
                refId: previousRefId,
                op: exports2.OPERATION.DELETE,
                field: key,
                value: void 0,
                previousValue: value2
              });
            }
          }
        }
        $root.addRef(refId, value, valueRef !== previousValue || operation === exports2.OPERATION.DELETE_AND_ADD && valueRef === previousValue);
      }
      return { value, previousValue };
    }
    __name(decodeValue, "decodeValue");
    const decodeSchemaOperation = /* @__PURE__ */ __name(function(decoder2, bytes, it, ref, allChanges) {
      const first_byte = bytes[it.offset++];
      const metadata = ref.constructor[Symbol.metadata];
      const operation = first_byte >> 6 << 6;
      const index = first_byte % (operation || 255);
      const field = metadata[index];
      if (field === void 0) {
        console.warn("@colyseus/schema: field not defined at", { index, ref: ref.constructor.name, metadata });
        return DEFINITION_MISMATCH;
      }
      const { value, previousValue } = decodeValue(decoder2, operation, ref, index, field.type, bytes, it, allChanges);
      if (value !== null && value !== void 0) {
        ref[field.name] = value;
      }
      if (previousValue !== value) {
        allChanges.push({
          ref,
          refId: decoder2.currentRefId,
          op: operation,
          field: field.name,
          value,
          previousValue
        });
      }
    }, "decodeSchemaOperation");
    const decodeKeyValueOperation = /* @__PURE__ */ __name(function(decoder2, bytes, it, ref, allChanges) {
      const operation = bytes[it.offset++];
      if (operation === exports2.OPERATION.CLEAR) {
        decoder2.removeChildRefs(ref, allChanges);
        ref.clear();
        return;
      }
      const index = decode2.number(bytes, it);
      const type2 = ref[$childType];
      let dynamicIndex;
      if ((operation & exports2.OPERATION.ADD) === exports2.OPERATION.ADD) {
        if (typeof ref["set"] === "function") {
          dynamicIndex = decode2.string(bytes, it);
          ref["setIndex"](index, dynamicIndex);
        } else {
          dynamicIndex = index;
        }
      } else {
        dynamicIndex = ref["getIndex"](index);
      }
      const { value, previousValue } = decodeValue(decoder2, operation, ref, index, type2, bytes, it, allChanges);
      if (value !== null && value !== void 0) {
        if (typeof ref["set"] === "function") {
          ref["$items"].set(dynamicIndex, value);
        } else if (typeof ref["$setAt"] === "function") {
          ref["$setAt"](index, value, operation);
        } else if (typeof ref["add"] === "function") {
          const index2 = ref.add(value);
          if (typeof index2 === "number") {
            ref["setIndex"](index2, index2);
          }
        }
      }
      if (previousValue !== value) {
        allChanges.push({
          ref,
          refId: decoder2.currentRefId,
          op: operation,
          field: "",
          // FIXME: remove this
          dynamicIndex,
          value,
          previousValue
        });
      }
    }, "decodeKeyValueOperation");
    const decodeArray = /* @__PURE__ */ __name(function(decoder2, bytes, it, ref, allChanges) {
      let operation = bytes[it.offset++];
      let index;
      if (operation === exports2.OPERATION.CLEAR) {
        decoder2.removeChildRefs(ref, allChanges);
        ref.clear();
        return;
      } else if (operation === exports2.OPERATION.REVERSE) {
        ref.reverse();
        return;
      } else if (operation === exports2.OPERATION.DELETE_BY_REFID) {
        const refId = decode2.number(bytes, it);
        const previousValue2 = decoder2.root.refs.get(refId);
        index = ref.findIndex((value2) => value2 === previousValue2);
        ref[$deleteByIndex](index);
        allChanges.push({
          ref,
          refId: decoder2.currentRefId,
          op: exports2.OPERATION.DELETE,
          field: "",
          // FIXME: remove this
          dynamicIndex: index,
          value: void 0,
          previousValue: previousValue2
        });
        return;
      } else if (operation === exports2.OPERATION.ADD_BY_REFID) {
        const refId = decode2.number(bytes, it);
        const itemByRefId = decoder2.root.refs.get(refId);
        if (itemByRefId) {
          index = ref.findIndex((value2) => value2 === itemByRefId);
        }
        if (index === -1 || index === void 0) {
          index = ref.length;
        }
      } else {
        index = decode2.number(bytes, it);
      }
      const type2 = ref[$childType];
      let dynamicIndex = index;
      const { value, previousValue } = decodeValue(decoder2, operation, ref, index, type2, bytes, it, allChanges);
      if (value !== null && value !== void 0 && value !== previousValue) {
        ref["$setAt"](index, value, operation);
      }
      if (previousValue !== value) {
        allChanges.push({
          ref,
          refId: decoder2.currentRefId,
          op: operation,
          field: "",
          // FIXME: remove this
          dynamicIndex,
          value,
          previousValue
        });
      }
    }, "decodeArray");
    const _EncodeSchemaError = class _EncodeSchemaError extends Error {
    };
    __name(_EncodeSchemaError, "EncodeSchemaError");
    let EncodeSchemaError = _EncodeSchemaError;
    function assertType(value, type2, klass, field) {
      let typeofTarget;
      let allowNull = false;
      switch (type2) {
        case "number":
        case "int8":
        case "uint8":
        case "int16":
        case "uint16":
        case "int32":
        case "uint32":
        case "int64":
        case "uint64":
        case "float32":
        case "float64":
          typeofTarget = "number";
          if (isNaN(value)) {
            console.log(`trying to encode "NaN" in ${klass.constructor.name}#${field}`);
          }
          break;
        case "bigint64":
        case "biguint64":
          typeofTarget = "bigint";
          break;
        case "string":
          typeofTarget = "string";
          allowNull = true;
          break;
        case "boolean":
          return;
        default:
          return;
      }
      if (typeof value !== typeofTarget && (!allowNull || allowNull && value !== null)) {
        let foundValue = `'${JSON.stringify(value)}'${value && value.constructor && ` (${value.constructor.name})` || ""}`;
        throw new EncodeSchemaError(`a '${typeofTarget}' was expected, but ${foundValue} was provided in ${klass.constructor.name}#${field}`);
      }
    }
    __name(assertType, "assertType");
    function assertInstanceType(value, type2, instance, field) {
      if (!(value instanceof type2)) {
        throw new EncodeSchemaError(`a '${type2.name}' was expected, but '${value && value.constructor.name}' was provided in ${instance.constructor.name}#${field}`);
      }
    }
    __name(assertInstanceType, "assertInstanceType");
    var _a$4, _b$4;
    const DEFAULT_SORT = /* @__PURE__ */ __name((a, b) => {
      const A = a.toString();
      const B = b.toString();
      if (A < B)
        return -1;
      else if (A > B)
        return 1;
      else
        return 0;
    }, "DEFAULT_SORT");
    const _ArraySchema = class _ArraySchema {
      /**
       * Determine if a property must be filtered.
       * - If returns false, the property is NOT going to be encoded.
       * - If returns true, the property is going to be encoded.
       *
       * Encoding with "filters" happens in two steps:
       * - First, the encoder iterates over all "not owned" properties and encodes them.
       * - Then, the encoder iterates over all "owned" properties per instance and encodes them.
       */
      static [(_a$4 = $encoder, _b$4 = $decoder, $filter)](ref, index, view2) {
        var _a4;
        return !view2 || typeof ref[$childType] === "string" || view2.isChangeTreeVisible((_a4 = ref["tmpItems"][index]) == null ? void 0 : _a4[$changes]);
      }
      static is(type2) {
        return (
          // type format: ["string"]
          Array.isArray(type2) || // type format: { array: "string" }
          type2["array"] !== void 0
        );
      }
      static from(iterable) {
        return new _ArraySchema(...Array.from(iterable));
      }
      constructor(...items) {
        this.items = [];
        this.tmpItems = [];
        this.deletedIndexes = {};
        this.isMovingItems = false;
        Object.defineProperty(this, $childType, {
          value: void 0,
          enumerable: false,
          writable: true,
          configurable: true
        });
        const proxy = new Proxy(this, {
          get: /* @__PURE__ */ __name((obj, prop) => {
            if (typeof prop !== "symbol" && // FIXME: d8 accuses this as low performance
            !isNaN(prop)) {
              return this.items[prop];
            } else {
              return Reflect.get(obj, prop);
            }
          }, "get"),
          set: /* @__PURE__ */ __name((obj, key, setValue) => {
            var _a4;
            if (typeof key !== "symbol" && !isNaN(key)) {
              if (setValue === void 0 || setValue === null) {
                obj.$deleteAt(key);
              } else {
                if (setValue[$changes]) {
                  assertInstanceType(setValue, obj[$childType], obj, key);
                  const previousValue = obj.items[key];
                  if (!obj.isMovingItems) {
                    obj.$changeAt(Number(key), setValue);
                  } else {
                    if (previousValue !== void 0) {
                      if (setValue[$changes].isNew) {
                        obj[$changes].indexedOperation(Number(key), exports2.OPERATION.MOVE_AND_ADD);
                      } else {
                        if ((obj[$changes].getChange(Number(key)) & exports2.OPERATION.DELETE) === exports2.OPERATION.DELETE) {
                          obj[$changes].indexedOperation(Number(key), exports2.OPERATION.DELETE_AND_MOVE);
                        } else {
                          obj[$changes].indexedOperation(Number(key), exports2.OPERATION.MOVE);
                        }
                      }
                    } else if (setValue[$changes].isNew) {
                      obj[$changes].indexedOperation(Number(key), exports2.OPERATION.ADD);
                    }
                    setValue[$changes].setParent(this, obj[$changes].root, key);
                  }
                  if (previousValue !== void 0) {
                    (_a4 = previousValue[$changes].root) == null ? void 0 : _a4.remove(previousValue[$changes]);
                  }
                } else {
                  obj.$changeAt(Number(key), setValue);
                }
                obj.items[key] = setValue;
                obj.tmpItems[key] = setValue;
              }
              return true;
            } else {
              return Reflect.set(obj, key, setValue);
            }
          }, "set"),
          deleteProperty: /* @__PURE__ */ __name((obj, prop) => {
            if (typeof prop === "number") {
              obj.$deleteAt(prop);
            } else {
              delete obj[prop];
            }
            return true;
          }, "deleteProperty"),
          has: /* @__PURE__ */ __name((obj, key) => {
            if (typeof key !== "symbol" && !isNaN(Number(key))) {
              return Reflect.has(this.items, key);
            }
            return Reflect.has(obj, key);
          }, "has")
        });
        this[$changes] = new ChangeTree(proxy);
        this[$changes].indexes = {};
        if (items.length > 0) {
          this.push(...items);
        }
        return proxy;
      }
      set length(newLength) {
        if (newLength === 0) {
          this.clear();
        } else if (newLength < this.items.length) {
          this.splice(newLength, this.length - newLength);
        } else {
          console.warn("ArraySchema: can't set .length to a higher value than its length.");
        }
      }
      get length() {
        return this.items.length;
      }
      push(...values) {
        var _a4;
        let length = this.tmpItems.length;
        const changeTree = this[$changes];
        for (let i = 0, l = values.length; i < l; i++, length++) {
          const value = values[i];
          if (value === void 0 || value === null) {
            return;
          } else if (typeof value === "object" && this[$childType]) {
            assertInstanceType(value, this[$childType], this, i);
          }
          changeTree.indexedOperation(length, exports2.OPERATION.ADD, this.items.length);
          this.items.push(value);
          this.tmpItems.push(value);
          (_a4 = value[$changes]) == null ? void 0 : _a4.setParent(this, changeTree.root, length);
        }
        return length;
      }
      /**
       * Removes the last element from an array and returns it.
       */
      pop() {
        let index = -1;
        for (let i = this.tmpItems.length - 1; i >= 0; i--) {
          if (this.deletedIndexes[i] !== true) {
            index = i;
            break;
          }
        }
        if (index < 0) {
          return void 0;
        }
        this[$changes].delete(index, void 0, this.items.length - 1);
        this.deletedIndexes[index] = true;
        return this.items.pop();
      }
      at(index) {
        if (index < 0)
          index += this.length;
        return this.items[index];
      }
      // encoding only
      $changeAt(index, value) {
        var _a4;
        if (value === void 0 || value === null) {
          console.error("ArraySchema items cannot be null nor undefined; Use `deleteAt(index)` instead.");
          return;
        }
        if (this.items[index] === value) {
          return;
        }
        const operation = this.items[index] !== void 0 ? typeof value === "object" ? exports2.OPERATION.DELETE_AND_ADD : exports2.OPERATION.REPLACE : exports2.OPERATION.ADD;
        const changeTree = this[$changes];
        changeTree.change(index, operation);
        (_a4 = value[$changes]) == null ? void 0 : _a4.setParent(this, changeTree.root, index);
      }
      // encoding only
      $deleteAt(index, operation) {
        this[$changes].delete(index, operation);
      }
      // decoding only
      $setAt(index, value, operation) {
        if (index === 0 && operation === exports2.OPERATION.ADD && this.items[index] !== void 0) {
          this.items.unshift(value);
        } else if (operation === exports2.OPERATION.DELETE_AND_MOVE) {
          this.items.splice(index, 1);
          this.items[index] = value;
        } else {
          this.items[index] = value;
        }
      }
      clear() {
        if (this.items.length === 0) {
          return;
        }
        const changeTree = this[$changes];
        changeTree.forEachChild((childChangeTree, _) => {
          var _a4;
          (_a4 = changeTree.root) == null ? void 0 : _a4.remove(childChangeTree);
        });
        changeTree.discard(true);
        changeTree.operation(exports2.OPERATION.CLEAR);
        this.items.length = 0;
        this.tmpItems.length = 0;
      }
      /**
       * Combines two or more arrays.
       * @param items Additional items to add to the end of array1.
       */
      // @ts-ignore
      concat(...items) {
        return new _ArraySchema(...this.items.concat(...items));
      }
      /**
       * Adds all the elements of an array separated by the specified separator string.
       * @param separator A string used to separate one element of an array from the next in the resulting String. If omitted, the array elements are separated with a comma.
       */
      join(separator) {
        return this.items.join(separator);
      }
      /**
       * Reverses the elements in an Array.
       */
      // @ts-ignore
      reverse() {
        this[$changes].operation(exports2.OPERATION.REVERSE);
        this.items.reverse();
        this.tmpItems.reverse();
        return this;
      }
      /**
       * Removes the first element from an array and returns it.
       */
      shift() {
        if (this.items.length === 0) {
          return void 0;
        }
        const changeTree = this[$changes];
        const index = this.tmpItems.findIndex((item) => item === this.items[0]);
        const allChangesIndex = this.items.findIndex((item) => item === this.items[0]);
        changeTree.delete(index, exports2.OPERATION.DELETE, allChangesIndex);
        changeTree.shiftAllChangeIndexes(-1, allChangesIndex);
        return this.items.shift();
      }
      /**
       * Returns a section of an array.
       * @param start The beginning of the specified portion of the array.
       * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
       */
      slice(start, end) {
        const sliced = new _ArraySchema();
        sliced.push(...this.items.slice(start, end));
        return sliced;
      }
      /**
       * Sorts an array.
       * @param compareFn Function used to determine the order of the elements. It is expected to return
       * a negative value if first argument is less than second argument, zero if they're equal and a positive
       * value otherwise. If omitted, the elements are sorted in ascending, ASCII character order.
       * ```ts
       * [11,2,22,1].sort((a, b) => a - b)
       * ```
       */
      sort(compareFn = DEFAULT_SORT) {
        this.isMovingItems = true;
        const changeTree = this[$changes];
        const sortedItems = this.items.sort(compareFn);
        sortedItems.forEach((_, i) => changeTree.change(i, exports2.OPERATION.REPLACE));
        this.tmpItems.sort(compareFn);
        this.isMovingItems = false;
        return this;
      }
      /**
       * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
       * @param start The zero-based location in the array from which to start removing elements.
       * @param deleteCount The number of elements to remove.
       * @param insertItems Elements to insert into the array in place of the deleted elements.
       */
      splice(start, deleteCount, ...insertItems) {
        var _a4;
        const changeTree = this[$changes];
        const itemsLength = this.items.length;
        const tmpItemsLength = this.tmpItems.length;
        const insertCount = insertItems.length;
        const indexes = [];
        for (let i = 0; i < tmpItemsLength; i++) {
          if (this.deletedIndexes[i] !== true) {
            indexes.push(i);
          }
        }
        if (itemsLength > start) {
          if (deleteCount === void 0) {
            deleteCount = itemsLength - start;
          }
          for (let i = start; i < start + deleteCount; i++) {
            const index = indexes[i];
            changeTree.delete(index, exports2.OPERATION.DELETE);
            this.deletedIndexes[index] = true;
          }
        } else {
          deleteCount = 0;
        }
        if (insertCount > 0) {
          if (insertCount > deleteCount) {
            console.error("Inserting more elements than deleting during ArraySchema#splice()");
            throw new Error("ArraySchema#splice(): insertCount must be equal or lower than deleteCount.");
          }
          for (let i = 0; i < insertCount; i++) {
            const addIndex = (indexes[start] ?? itemsLength) + i;
            changeTree.indexedOperation(addIndex, this.deletedIndexes[addIndex] ? exports2.OPERATION.DELETE_AND_ADD : exports2.OPERATION.ADD);
            (_a4 = insertItems[i][$changes]) == null ? void 0 : _a4.setParent(this, changeTree.root, addIndex);
          }
        }
        if (deleteCount > insertCount) {
          changeTree.shiftAllChangeIndexes(-(deleteCount - insertCount), indexes[start + insertCount]);
        }
        if (changeTree.filteredChanges !== void 0) {
          enqueueChangeTree(changeTree.root, changeTree, "filteredChanges");
        } else {
          enqueueChangeTree(changeTree.root, changeTree, "changes");
        }
        return this.items.splice(start, deleteCount, ...insertItems);
      }
      /**
       * Inserts new elements at the start of an array.
       * @param items  Elements to insert at the start of the Array.
       */
      unshift(...items) {
        const changeTree = this[$changes];
        changeTree.shiftChangeIndexes(items.length);
        if (changeTree.isFiltered) {
          setOperationAtIndex(changeTree.filteredChanges, this.items.length);
        } else {
          setOperationAtIndex(changeTree.allChanges, this.items.length);
        }
        items.forEach((_, index) => {
          changeTree.change(index, exports2.OPERATION.ADD);
        });
        this.tmpItems.unshift(...items);
        return this.items.unshift(...items);
      }
      /**
       * Returns the index of the first occurrence of a value in an array.
       * @param searchElement The value to locate in the array.
       * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
       */
      indexOf(searchElement, fromIndex) {
        return this.items.indexOf(searchElement, fromIndex);
      }
      /**
       * Returns the index of the last occurrence of a specified value in an array.
       * @param searchElement The value to locate in the array.
       * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at the last index in the array.
       */
      lastIndexOf(searchElement, fromIndex = this.length - 1) {
        return this.items.lastIndexOf(searchElement, fromIndex);
      }
      every(callbackfn, thisArg) {
        return this.items.every(callbackfn, thisArg);
      }
      /**
       * Determines whether the specified callback function returns true for any element of an array.
       * @param callbackfn A function that accepts up to three arguments. The some method calls
       * the callbackfn function for each element in the array until the callbackfn returns a value
       * which is coercible to the Boolean value true, or until the end of the array.
       * @param thisArg An object to which the this keyword can refer in the callbackfn function.
       * If thisArg is omitted, undefined is used as the this value.
       */
      some(callbackfn, thisArg) {
        return this.items.some(callbackfn, thisArg);
      }
      /**
       * Performs the specified action for each element in an array.
       * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
       * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
       */
      forEach(callbackfn, thisArg) {
        return this.items.forEach(callbackfn, thisArg);
      }
      /**
       * Calls a defined callback function on each element of an array, and returns an array that contains the results.
       * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
       * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
       */
      map(callbackfn, thisArg) {
        return this.items.map(callbackfn, thisArg);
      }
      filter(callbackfn, thisArg) {
        return this.items.filter(callbackfn, thisArg);
      }
      /**
       * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
       * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
       * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
       */
      reduce(callbackfn, initialValue) {
        return this.items.reduce(callbackfn, initialValue);
      }
      /**
       * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
       * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
       * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
       */
      reduceRight(callbackfn, initialValue) {
        return this.items.reduceRight(callbackfn, initialValue);
      }
      /**
       * Returns the value of the first element in the array where predicate is true, and undefined
       * otherwise.
       * @param predicate find calls predicate once for each element of the array, in ascending
       * order, until it finds one where predicate returns true. If such an element is found, find
       * immediately returns that element value. Otherwise, find returns undefined.
       * @param thisArg If provided, it will be used as the this value for each invocation of
       * predicate. If it is not provided, undefined is used instead.
       */
      find(predicate, thisArg) {
        return this.items.find(predicate, thisArg);
      }
      /**
       * Returns the index of the first element in the array where predicate is true, and -1
       * otherwise.
       * @param predicate find calls predicate once for each element of the array, in ascending
       * order, until it finds one where predicate returns true. If such an element is found,
       * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
       * @param thisArg If provided, it will be used as the this value for each invocation of
       * predicate. If it is not provided, undefined is used instead.
       */
      findIndex(predicate, thisArg) {
        return this.items.findIndex(predicate, thisArg);
      }
      /**
       * Returns the this object after filling the section identified by start and end with value
       * @param value value to fill array section with
       * @param start index to start filling the array at. If start is negative, it is treated as
       * length+start where length is the length of the array.
       * @param end index to stop filling the array at. If end is negative, it is treated as
       * length+end.
       */
      fill(value, start, end) {
        throw new Error("ArraySchema#fill() not implemented");
      }
      /**
       * Returns the this object after copying a section of the array identified by start and end
       * to the same array starting at position target
       * @param target If target is negative, it is treated as length+target where length is the
       * length of the array.
       * @param start If start is negative, it is treated as length+start. If end is negative, it
       * is treated as length+end.
       * @param end If not specified, length of the this object is used as its default value.
       */
      copyWithin(target2, start, end) {
        throw new Error("ArraySchema#copyWithin() not implemented");
      }
      /**
       * Returns a string representation of an array.
       */
      toString() {
        return this.items.toString();
      }
      /**
       * Returns a string representation of an array. The elements are converted to string using their toLocalString methods.
       */
      toLocaleString() {
        return this.items.toLocaleString();
      }
      /** Iterator */
      [Symbol.iterator]() {
        return this.items[Symbol.iterator]();
      }
      static get [Symbol.species]() {
        return _ArraySchema;
      }
      /**
       * Returns an iterable of key, value pairs for every entry in the array
       */
      entries() {
        return this.items.entries();
      }
      /**
       * Returns an iterable of keys in the array
       */
      keys() {
        return this.items.keys();
      }
      /**
       * Returns an iterable of values in the array
       */
      values() {
        return this.items.values();
      }
      /**
       * Determines whether an array includes a certain element, returning true or false as appropriate.
       * @param searchElement The element to search for.
       * @param fromIndex The position in this array at which to begin searching for searchElement.
       */
      includes(searchElement, fromIndex) {
        return this.items.includes(searchElement, fromIndex);
      }
      //
      // ES2022
      //
      /**
       * Calls a defined callback function on each element of an array. Then, flattens the result into
       * a new array.
       * This is identical to a map followed by flat with depth 1.
       *
       * @param callback A function that accepts up to three arguments. The flatMap method calls the
       * callback function one time for each element in the array.
       * @param thisArg An object to which the this keyword can refer in the callback function. If
       * thisArg is omitted, undefined is used as the this value.
       */
      // @ts-ignore
      flatMap(callback, thisArg) {
        throw new Error("ArraySchema#flatMap() is not supported.");
      }
      /**
       * Returns a new array with all sub-array elements concatenated into it recursively up to the
       * specified depth.
       *
       * @param depth The maximum recursion depth
       */
      // @ts-ignore
      flat(depth) {
        throw new Error("ArraySchema#flat() is not supported.");
      }
      findLast() {
        return this.items.findLast.apply(this.items, arguments);
      }
      findLastIndex(...args) {
        return this.items.findLastIndex.apply(this.items, arguments);
      }
      //
      // ES2023
      //
      with(index, value) {
        const copy2 = this.items.slice();
        if (index < 0)
          index += this.length;
        copy2[index] = value;
        return new _ArraySchema(...copy2);
      }
      toReversed() {
        return this.items.slice().reverse();
      }
      toSorted(compareFn) {
        return this.items.slice().sort(compareFn);
      }
      // @ts-ignore
      toSpliced(start, deleteCount, ...items) {
        return this.items.toSpliced.apply(copy, arguments);
      }
      shuffle() {
        return this.move((_) => {
          let currentIndex = this.items.length;
          while (currentIndex != 0) {
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [this[currentIndex], this[randomIndex]] = [this[randomIndex], this[currentIndex]];
          }
        });
      }
      /**
       * Allows to move items around in the array.
       *
       * Example:
       *     state.cards.move((cards) => {
       *         [cards[4], cards[3]] = [cards[3], cards[4]];
       *         [cards[3], cards[2]] = [cards[2], cards[3]];
       *         [cards[2], cards[0]] = [cards[0], cards[2]];
       *         [cards[1], cards[1]] = [cards[1], cards[1]];
       *         [cards[0], cards[0]] = [cards[0], cards[0]];
       *     })
       *
       * @param cb
       * @returns
       */
      move(cb) {
        this.isMovingItems = true;
        cb(this);
        this.isMovingItems = false;
        return this;
      }
      [$getByIndex](index, isEncodeAll = false) {
        return isEncodeAll ? this.items[index] : this.deletedIndexes[index] ? this.items[index] : this.tmpItems[index] || this.items[index];
      }
      [$deleteByIndex](index) {
        this.items[index] = void 0;
        this.tmpItems[index] = void 0;
      }
      [$onEncodeEnd]() {
        this.tmpItems = this.items.slice();
        this.deletedIndexes = {};
      }
      [$onDecodeEnd]() {
        this.items = this.items.filter((item) => item !== void 0);
        this.tmpItems = this.items.slice();
      }
      toArray() {
        return this.items.slice(0);
      }
      toJSON() {
        return this.toArray().map((value) => {
          return typeof value["toJSON"] === "function" ? value["toJSON"]() : value;
        });
      }
      //
      // Decoding utilities
      //
      clone(isDecoding) {
        let cloned;
        if (isDecoding) {
          cloned = new _ArraySchema();
          cloned.push(...this.items);
        } else {
          cloned = new _ArraySchema(...this.map((item) => item[$changes] ? item.clone() : item));
        }
        return cloned;
      }
    };
    __name(_ArraySchema, "ArraySchema");
    _ArraySchema[_a$4] = encodeArray;
    _ArraySchema[_b$4] = decodeArray;
    let ArraySchema = _ArraySchema;
    registerType("array", { constructor: ArraySchema });
    var _a$3, _b$3;
    const _MapSchema = class _MapSchema {
      /**
       * Determine if a property must be filtered.
       * - If returns false, the property is NOT going to be encoded.
       * - If returns true, the property is going to be encoded.
       *
       * Encoding with "filters" happens in two steps:
       * - First, the encoder iterates over all "not owned" properties and encodes them.
       * - Then, the encoder iterates over all "owned" properties per instance and encodes them.
       */
      static [(_a$3 = $encoder, _b$3 = $decoder, $filter)](ref, index, view2) {
        return !view2 || typeof ref[$childType] === "string" || view2.isChangeTreeVisible((ref[$getByIndex](index) ?? ref.deletedItems[index])[$changes]);
      }
      static is(type2) {
        return type2["map"] !== void 0;
      }
      constructor(initialValues) {
        this.$items = /* @__PURE__ */ new Map();
        this.$indexes = /* @__PURE__ */ new Map();
        this.deletedItems = {};
        this[$changes] = new ChangeTree(this);
        this[$changes].indexes = {};
        if (initialValues) {
          if (initialValues instanceof Map || initialValues instanceof _MapSchema) {
            initialValues.forEach((v, k) => this.set(k, v));
          } else {
            for (const k in initialValues) {
              this.set(k, initialValues[k]);
            }
          }
        }
        Object.defineProperty(this, $childType, {
          value: void 0,
          enumerable: false,
          writable: true,
          configurable: true
        });
      }
      /** Iterator */
      [Symbol.iterator]() {
        return this.$items[Symbol.iterator]();
      }
      get [Symbol.toStringTag]() {
        return this.$items[Symbol.toStringTag];
      }
      static get [Symbol.species]() {
        return _MapSchema;
      }
      set(key, value) {
        var _a4;
        if (value === void 0 || value === null) {
          throw new Error(`MapSchema#set('${key}', ${value}): trying to set ${value} value on '${key}'.`);
        } else if (typeof value === "object" && this[$childType]) {
          assertInstanceType(value, this[$childType], this, key);
        }
        key = key.toString();
        const changeTree = this[$changes];
        const isRef = value[$changes] !== void 0;
        let index;
        let operation;
        if (typeof changeTree.indexes[key] !== "undefined") {
          index = changeTree.indexes[key];
          operation = exports2.OPERATION.REPLACE;
          const previousValue = this.$items.get(key);
          if (previousValue === value) {
            return;
          } else if (isRef) {
            operation = exports2.OPERATION.DELETE_AND_ADD;
            if (previousValue !== void 0) {
              (_a4 = previousValue[$changes].root) == null ? void 0 : _a4.remove(previousValue[$changes]);
            }
          }
        } else {
          index = changeTree.indexes[$numFields] ?? 0;
          operation = exports2.OPERATION.ADD;
          this.$indexes.set(index, key);
          changeTree.indexes[key] = index;
          changeTree.indexes[$numFields] = index + 1;
        }
        this.$items.set(key, value);
        changeTree.change(index, operation);
        if (isRef) {
          value[$changes].setParent(this, changeTree.root, index);
        }
        return this;
      }
      get(key) {
        return this.$items.get(key);
      }
      delete(key) {
        const index = this[$changes].indexes[key];
        this.deletedItems[index] = this[$changes].delete(index);
        return this.$items.delete(key);
      }
      clear() {
        const changeTree = this[$changes];
        changeTree.discard(true);
        changeTree.indexes = {};
        changeTree.forEachChild((childChangeTree, _) => {
          var _a4;
          (_a4 = changeTree.root) == null ? void 0 : _a4.remove(childChangeTree);
        });
        this.$indexes.clear();
        this.$items.clear();
        changeTree.operation(exports2.OPERATION.CLEAR);
      }
      has(key) {
        return this.$items.has(key);
      }
      forEach(callbackfn) {
        this.$items.forEach(callbackfn);
      }
      entries() {
        return this.$items.entries();
      }
      keys() {
        return this.$items.keys();
      }
      values() {
        return this.$items.values();
      }
      get size() {
        return this.$items.size;
      }
      setIndex(index, key) {
        this.$indexes.set(index, key);
      }
      getIndex(index) {
        return this.$indexes.get(index);
      }
      [$getByIndex](index) {
        return this.$items.get(this.$indexes.get(index));
      }
      [$deleteByIndex](index) {
        const key = this.$indexes.get(index);
        this.$items.delete(key);
        this.$indexes.delete(index);
      }
      [$onEncodeEnd]() {
        this.deletedItems = {};
      }
      toJSON() {
        const map = {};
        this.forEach((value, key) => {
          map[key] = typeof value["toJSON"] === "function" ? value["toJSON"]() : value;
        });
        return map;
      }
      //
      // Decoding utilities
      //
      // @ts-ignore
      clone(isDecoding) {
        let cloned;
        if (isDecoding) {
          cloned = Object.assign(new _MapSchema(), this);
        } else {
          cloned = new _MapSchema();
          this.forEach((value, key) => {
            if (value[$changes]) {
              cloned.set(key, value["clone"]());
            } else {
              cloned.set(key, value);
            }
          });
        }
        return cloned;
      }
    };
    __name(_MapSchema, "MapSchema");
    _MapSchema[_a$3] = encodeKeyValueOperation;
    _MapSchema[_b$3] = decodeKeyValueOperation;
    let MapSchema = _MapSchema;
    registerType("map", { constructor: MapSchema });
    const DEFAULT_VIEW_TAG = -1;
    function entity(constructor) {
      TypeContext.register(constructor);
      return constructor;
    }
    __name(entity, "entity");
    function view(tag = DEFAULT_VIEW_TAG) {
      return function(target2, fieldName) {
        var _a4;
        const constructor = target2.constructor;
        const parentClass = Object.getPrototypeOf(constructor);
        const parentMetadata = parentClass[Symbol.metadata];
        const metadata = constructor[_a4 = Symbol.metadata] ?? (constructor[_a4] = Object.assign({}, constructor[Symbol.metadata], parentMetadata ?? /* @__PURE__ */ Object.create(null)));
        Metadata.setTag(metadata, fieldName, tag);
      };
    }
    __name(view, "view");
    function type(type2, options) {
      return function(target2, field) {
        const constructor = target2.constructor;
        if (!type2) {
          throw new Error(`${constructor.name}: @type() reference provided for "${field}" is undefined. Make sure you don't have any circular dependencies.`);
        }
        TypeContext.register(constructor);
        const parentClass = Object.getPrototypeOf(constructor);
        const parentMetadata = parentClass[Symbol.metadata];
        const metadata = Metadata.initialize(constructor);
        let fieldIndex = metadata[field];
        if (metadata[fieldIndex] !== void 0) {
          if (metadata[fieldIndex].deprecated) {
            return;
          } else if (metadata[fieldIndex].type !== void 0) {
            try {
              throw new Error(`@colyseus/schema: Duplicate '${field}' definition on '${constructor.name}'.
Check @type() annotation`);
            } catch (e) {
              const definitionAtLine = e.stack.split("\n")[4].trim();
              throw new Error(`${e.message} ${definitionAtLine}`);
            }
          }
        } else {
          fieldIndex = metadata[$numFields] ?? (parentMetadata && parentMetadata[$numFields]) ?? -1;
          fieldIndex++;
        }
        if (options && options.manual) {
          Metadata.addField(metadata, fieldIndex, field, type2, {
            // do not declare getter/setter descriptor
            enumerable: true,
            configurable: true,
            writable: true
          });
        } else {
          const complexTypeKlass = Array.isArray(type2) ? getType("array") : typeof Object.keys(type2)[0] === "string" && getType(Object.keys(type2)[0]);
          const childType = complexTypeKlass ? Object.values(type2)[0] : type2;
          Metadata.addField(metadata, fieldIndex, field, type2, getPropertyDescriptor(`_${field}`, fieldIndex, childType, complexTypeKlass));
        }
      };
    }
    __name(type, "type");
    function getPropertyDescriptor(fieldCached, fieldIndex, type2, complexTypeKlass) {
      return {
        get: /* @__PURE__ */ __name(function() {
          return this[fieldCached];
        }, "get"),
        set: /* @__PURE__ */ __name(function(value) {
          var _a4, _b3;
          const previousValue = this[fieldCached] ?? void 0;
          if (value === previousValue) {
            return;
          }
          if (value !== void 0 && value !== null) {
            if (complexTypeKlass) {
              if (complexTypeKlass.constructor === ArraySchema && !(value instanceof ArraySchema)) {
                value = new ArraySchema(...value);
              }
              if (complexTypeKlass.constructor === MapSchema && !(value instanceof MapSchema)) {
                value = new MapSchema(value);
              }
              value[$childType] = type2;
            } else if (typeof type2 !== "string") {
              assertInstanceType(value, type2, this, fieldCached.substring(1));
            } else {
              assertType(value, type2, this, fieldCached.substring(1));
            }
            const changeTree = this[$changes];
            if (previousValue !== void 0 && previousValue[$changes]) {
              (_a4 = changeTree.root) == null ? void 0 : _a4.remove(previousValue[$changes]);
              this.constructor[$track](changeTree, fieldIndex, exports2.OPERATION.DELETE_AND_ADD);
            } else {
              this.constructor[$track](changeTree, fieldIndex, exports2.OPERATION.ADD);
            }
            (_b3 = value[$changes]) == null ? void 0 : _b3.setParent(this, changeTree.root, fieldIndex);
          } else if (previousValue !== void 0) {
            this[$changes].delete(fieldIndex);
          }
          this[fieldCached] = value;
        }, "set"),
        enumerable: true,
        configurable: true
      };
    }
    __name(getPropertyDescriptor, "getPropertyDescriptor");
    function deprecated(throws = true) {
      return function(klass, field) {
        var _a4;
        const constructor = klass.constructor;
        const parentClass = Object.getPrototypeOf(constructor);
        const parentMetadata = parentClass[Symbol.metadata];
        const metadata = constructor[_a4 = Symbol.metadata] ?? (constructor[_a4] = Object.assign({}, constructor[Symbol.metadata], parentMetadata ?? /* @__PURE__ */ Object.create(null)));
        const fieldIndex = metadata[field];
        metadata[fieldIndex].deprecated = true;
        if (throws) {
          metadata[$descriptors] ?? (metadata[$descriptors] = {});
          metadata[$descriptors][field] = {
            get: /* @__PURE__ */ __name(function() {
              throw new Error(`${field} is deprecated.`);
            }, "get"),
            set: /* @__PURE__ */ __name(function(value) {
            }, "set"),
            enumerable: false,
            configurable: true
          };
        }
        Object.defineProperty(metadata, fieldIndex, {
          value: metadata[fieldIndex],
          enumerable: false,
          configurable: true
        });
      };
    }
    __name(deprecated, "deprecated");
    function defineTypes(target2, fields, options) {
      for (let field in fields) {
        type(fields[field], options)(target2.prototype, field);
      }
      return target2;
    }
    __name(defineTypes, "defineTypes");
    function schema2(fields, name, inherits = Schema) {
      const defaultValues = {};
      const viewTagFields = {};
      for (let fieldName in fields) {
        const field = fields[fieldName];
        if (typeof field === "object") {
          if (field["default"] !== void 0) {
            defaultValues[fieldName] = field["default"];
          }
          if (field["view"] !== void 0) {
            viewTagFields[fieldName] = typeof field["view"] === "boolean" ? DEFAULT_VIEW_TAG : field["view"];
          }
        }
      }
      const klass = Metadata.setFields(class extends inherits {
        constructor(...args) {
          args[0] = Object.assign({}, defaultValues, args[0]);
          super(...args);
        }
      }, fields);
      for (let fieldName in viewTagFields) {
        view(viewTagFields[fieldName])(klass.prototype, fieldName);
      }
      if (name) {
        Object.defineProperty(klass, "name", { value: name });
      }
      klass.extends = (fields2, name2) => schema2(fields2, name2, klass);
      return klass;
    }
    __name(schema2, "schema");
    function getIndent(level) {
      return new Array(level).fill(0).map((_, i) => i === level - 1 ? `└─ ` : `   `).join("");
    }
    __name(getIndent, "getIndent");
    function dumpChanges(schema3) {
      const $root = schema3[$changes].root;
      const dump = {
        ops: {},
        refs: []
      };
      $root.changes.forEach((changeTree) => {
        if (changeTree === void 0) {
          return;
        }
        const changes = changeTree.indexedOperations;
        dump.refs.push(`refId#${changeTree.refId}`);
        for (const index in changes) {
          const op = changes[index];
          const opName = exports2.OPERATION[op];
          if (!dump.ops[opName]) {
            dump.ops[opName] = 0;
          }
          dump.ops[exports2.OPERATION[op]]++;
        }
      });
      return dump;
    }
    __name(dumpChanges, "dumpChanges");
    var _a$2, _b$2;
    const _Schema = class _Schema {
      /**
       * Assign the property descriptors required to track changes on this instance.
       * @param instance
       */
      static initialize(instance) {
        var _a4;
        Object.defineProperty(instance, $changes, {
          value: new ChangeTree(instance),
          enumerable: false,
          writable: true
        });
        Object.defineProperties(instance, ((_a4 = instance.constructor[Symbol.metadata]) == null ? void 0 : _a4[$descriptors]) || {});
      }
      static is(type2) {
        return typeof type2[Symbol.metadata] === "object";
      }
      /**
       * Track property changes
       */
      static [(_a$2 = $encoder, _b$2 = $decoder, $track)](changeTree, index, operation = exports2.OPERATION.ADD) {
        changeTree.change(index, operation);
      }
      /**
       * Determine if a property must be filtered.
       * - If returns false, the property is NOT going to be encoded.
       * - If returns true, the property is going to be encoded.
       *
       * Encoding with "filters" happens in two steps:
       * - First, the encoder iterates over all "not owned" properties and encodes them.
       * - Then, the encoder iterates over all "owned" properties per instance and encodes them.
       */
      static [$filter](ref, index, view2) {
        var _a4, _b3;
        const metadata = ref.constructor[Symbol.metadata];
        const tag = (_a4 = metadata[index]) == null ? void 0 : _a4.tag;
        if (view2 === void 0) {
          return tag === void 0;
        } else if (tag === void 0) {
          return true;
        } else if (tag === DEFAULT_VIEW_TAG) {
          return view2.isChangeTreeVisible(ref[$changes]);
        } else {
          const tags = (_b3 = view2.tags) == null ? void 0 : _b3.get(ref[$changes]);
          return tags && tags.has(tag);
        }
      }
      // allow inherited classes to have a constructor
      constructor(...args) {
        _Schema.initialize(this);
        if (args[0]) {
          Object.assign(this, args[0]);
        }
      }
      assign(props) {
        Object.assign(this, props);
        return this;
      }
      /**
       * (Server-side): Flag a property to be encoded for the next patch.
       * @param instance Schema instance
       * @param property string representing the property name, or number representing the index of the property.
       * @param operation OPERATION to perform (detected automatically)
       */
      setDirty(property, operation) {
        const metadata = this.constructor[Symbol.metadata];
        this[$changes].change(metadata[metadata[property]].index, operation);
      }
      clone() {
        var _a4;
        const cloned = new this.constructor();
        const metadata = this.constructor[Symbol.metadata];
        for (const fieldIndex in metadata) {
          const field = metadata[fieldIndex].name;
          if (typeof this[field] === "object" && typeof ((_a4 = this[field]) == null ? void 0 : _a4.clone) === "function") {
            cloned[field] = this[field].clone();
          } else {
            cloned[field] = this[field];
          }
        }
        return cloned;
      }
      toJSON() {
        const obj = {};
        const metadata = this.constructor[Symbol.metadata];
        for (const index in metadata) {
          const field = metadata[index];
          const fieldName = field.name;
          if (!field.deprecated && this[fieldName] !== null && typeof this[fieldName] !== "undefined") {
            obj[fieldName] = typeof this[fieldName]["toJSON"] === "function" ? this[fieldName]["toJSON"]() : this[fieldName];
          }
        }
        return obj;
      }
      /**
       * Used in tests only
       * @internal
       */
      discardAllChanges() {
        this[$changes].discardAll();
      }
      [$getByIndex](index) {
        const metadata = this.constructor[Symbol.metadata];
        return this[metadata[index].name];
      }
      [$deleteByIndex](index) {
        const metadata = this.constructor[Symbol.metadata];
        this[metadata[index].name] = void 0;
      }
      /**
       * Inspect the `refId` of all Schema instances in the tree. Optionally display the contents of the instance.
       *
       * @param ref Schema instance
       * @param showContents display JSON contents of the instance
       * @returns
       */
      static debugRefIds(ref, showContents = false, level = 0) {
        var _a4, _b3;
        const contents = showContents ? ` - ${JSON.stringify(ref.toJSON())}` : "";
        const changeTree = ref[$changes];
        const refId = changeTree.refId;
        const refCount = ((_b3 = (_a4 = changeTree.root) == null ? void 0 : _a4.refCount) == null ? void 0 : _b3[refId]) > 1 ? ` [×${changeTree.root.refCount[refId]}]` : "";
        let output = `${getIndent(level)}${ref.constructor.name} (refId: ${refId})${refCount}${contents}
`;
        changeTree.forEachChild((childChangeTree) => output += this.debugRefIds(childChangeTree.ref, showContents, level + 1));
        return output;
      }
      /**
       * Return a string representation of the changes on a Schema instance.
       * The list of changes is cleared after each encode.
       *
       * @param instance Schema instance
       * @param isEncodeAll Return "full encode" instead of current change set.
       * @returns
       */
      static debugChanges(instance, isEncodeAll = false) {
        const changeTree = instance[$changes];
        const changeSet = isEncodeAll ? changeTree.allChanges : changeTree.changes;
        const changeSetName = isEncodeAll ? "allChanges" : "changes";
        let output = `${instance.constructor.name} (${changeTree.refId}) -> .${changeSetName}:
`;
        function dumpChangeSet(changeSet2) {
          changeSet2.operations.filter((op) => op).forEach((index) => {
            const operation = changeTree.indexedOperations[index];
            console.log({ index, operation });
            output += `- [${index}]: ${exports2.OPERATION[operation]} (${JSON.stringify(changeTree.getValue(Number(index), isEncodeAll))})
`;
          });
        }
        __name(dumpChangeSet, "dumpChangeSet");
        dumpChangeSet(changeSet);
        if (!isEncodeAll && changeTree.filteredChanges && changeTree.filteredChanges.operations.filter((op) => op).length > 0) {
          output += `${instance.constructor.name} (${changeTree.refId}) -> .filteredChanges:
`;
          dumpChangeSet(changeTree.filteredChanges);
        }
        if (isEncodeAll && changeTree.allFilteredChanges && changeTree.allFilteredChanges.operations.filter((op) => op).length > 0) {
          output += `${instance.constructor.name} (${changeTree.refId}) -> .allFilteredChanges:
`;
          dumpChangeSet(changeTree.allFilteredChanges);
        }
        return output;
      }
      static debugChangesDeep(ref, changeSetName = "changes") {
        var _a4, _b3;
        let output = "";
        const rootChangeTree = ref[$changes];
        const root = rootChangeTree.root;
        const changeTrees = /* @__PURE__ */ new Map();
        const instanceRefIds = [];
        let totalOperations = 0;
        for (const [refId, changes] of Object.entries(root[changeSetName])) {
          const changeTree = root.changeTrees[refId];
          let includeChangeTree = false;
          let parentChangeTrees = [];
          let parentChangeTree = (_a4 = changeTree.parent) == null ? void 0 : _a4[$changes];
          if (changeTree === rootChangeTree) {
            includeChangeTree = true;
          } else {
            while (parentChangeTree !== void 0) {
              parentChangeTrees.push(parentChangeTree);
              if (parentChangeTree.ref === ref) {
                includeChangeTree = true;
                break;
              }
              parentChangeTree = (_b3 = parentChangeTree.parent) == null ? void 0 : _b3[$changes];
            }
          }
          if (includeChangeTree) {
            instanceRefIds.push(changeTree.refId);
            totalOperations += Object.keys(changes).length;
            changeTrees.set(changeTree, parentChangeTrees.reverse());
          }
        }
        output += "---\n";
        output += `root refId: ${rootChangeTree.refId}
`;
        output += `Total instances: ${instanceRefIds.length} (refIds: ${instanceRefIds.join(", ")})
`;
        output += `Total changes: ${totalOperations}
`;
        output += "---\n";
        const visitedParents = /* @__PURE__ */ new WeakSet();
        for (const [changeTree, parentChangeTrees] of changeTrees.entries()) {
          parentChangeTrees.forEach((parentChangeTree, level2) => {
            if (!visitedParents.has(parentChangeTree)) {
              output += `${getIndent(level2)}${parentChangeTree.ref.constructor.name} (refId: ${parentChangeTree.refId})
`;
              visitedParents.add(parentChangeTree);
            }
          });
          const changes = changeTree.indexedOperations;
          const level = parentChangeTrees.length;
          const indent = getIndent(level);
          const parentIndex = level > 0 ? `(${changeTree.parentIndex}) ` : "";
          output += `${indent}${parentIndex}${changeTree.ref.constructor.name} (refId: ${changeTree.refId}) - changes: ${Object.keys(changes).length}
`;
          for (const index in changes) {
            const operation = changes[index];
            output += `${getIndent(level + 1)}${exports2.OPERATION[operation]}: ${index}
`;
          }
        }
        return `${output}`;
      }
    };
    __name(_Schema, "Schema");
    _Schema[_a$2] = encodeSchemaOperation;
    _Schema[_b$2] = decodeSchemaOperation;
    let Schema = _Schema;
    var _a$1, _b$1;
    const _CollectionSchema = class _CollectionSchema {
      /**
       * Determine if a property must be filtered.
       * - If returns false, the property is NOT going to be encoded.
       * - If returns true, the property is going to be encoded.
       *
       * Encoding with "filters" happens in two steps:
       * - First, the encoder iterates over all "not owned" properties and encodes them.
       * - Then, the encoder iterates over all "owned" properties per instance and encodes them.
       */
      static [(_a$1 = $encoder, _b$1 = $decoder, $filter)](ref, index, view2) {
        return !view2 || typeof ref[$childType] === "string" || view2.isChangeTreeVisible((ref[$getByIndex](index) ?? ref.deletedItems[index])[$changes]);
      }
      static is(type2) {
        return type2["collection"] !== void 0;
      }
      constructor(initialValues) {
        this.$items = /* @__PURE__ */ new Map();
        this.$indexes = /* @__PURE__ */ new Map();
        this.deletedItems = {};
        this.$refId = 0;
        this[$changes] = new ChangeTree(this);
        this[$changes].indexes = {};
        if (initialValues) {
          initialValues.forEach((v) => this.add(v));
        }
        Object.defineProperty(this, $childType, {
          value: void 0,
          enumerable: false,
          writable: true,
          configurable: true
        });
      }
      add(value) {
        const index = this.$refId++;
        const isRef = value[$changes] !== void 0;
        if (isRef) {
          value[$changes].setParent(this, this[$changes].root, index);
        }
        this[$changes].indexes[index] = index;
        this.$indexes.set(index, index);
        this.$items.set(index, value);
        this[$changes].change(index);
        return index;
      }
      at(index) {
        const key = Array.from(this.$items.keys())[index];
        return this.$items.get(key);
      }
      entries() {
        return this.$items.entries();
      }
      delete(item) {
        const entries = this.$items.entries();
        let index;
        let entry;
        while (entry = entries.next()) {
          if (entry.done) {
            break;
          }
          if (item === entry.value[1]) {
            index = entry.value[0];
            break;
          }
        }
        if (index === void 0) {
          return false;
        }
        this.deletedItems[index] = this[$changes].delete(index);
        this.$indexes.delete(index);
        return this.$items.delete(index);
      }
      clear() {
        const changeTree = this[$changes];
        changeTree.discard(true);
        changeTree.indexes = {};
        changeTree.forEachChild((childChangeTree, _) => {
          var _a4;
          (_a4 = changeTree.root) == null ? void 0 : _a4.remove(childChangeTree);
        });
        this.$indexes.clear();
        this.$items.clear();
        changeTree.operation(exports2.OPERATION.CLEAR);
      }
      has(value) {
        return Array.from(this.$items.values()).some((v) => v === value);
      }
      forEach(callbackfn) {
        this.$items.forEach((value, key, _) => callbackfn(value, key, this));
      }
      values() {
        return this.$items.values();
      }
      get size() {
        return this.$items.size;
      }
      /** Iterator */
      [Symbol.iterator]() {
        return this.$items.values();
      }
      setIndex(index, key) {
        this.$indexes.set(index, key);
      }
      getIndex(index) {
        return this.$indexes.get(index);
      }
      [$getByIndex](index) {
        return this.$items.get(this.$indexes.get(index));
      }
      [$deleteByIndex](index) {
        const key = this.$indexes.get(index);
        this.$items.delete(key);
        this.$indexes.delete(index);
      }
      [$onEncodeEnd]() {
        this.deletedItems = {};
      }
      toArray() {
        return Array.from(this.$items.values());
      }
      toJSON() {
        const values = [];
        this.forEach((value, key) => {
          values.push(typeof value["toJSON"] === "function" ? value["toJSON"]() : value);
        });
        return values;
      }
      //
      // Decoding utilities
      //
      clone(isDecoding) {
        let cloned;
        if (isDecoding) {
          cloned = Object.assign(new _CollectionSchema(), this);
        } else {
          cloned = new _CollectionSchema();
          this.forEach((value) => {
            if (value[$changes]) {
              cloned.add(value["clone"]());
            } else {
              cloned.add(value);
            }
          });
        }
        return cloned;
      }
    };
    __name(_CollectionSchema, "CollectionSchema");
    _CollectionSchema[_a$1] = encodeKeyValueOperation;
    _CollectionSchema[_b$1] = decodeKeyValueOperation;
    let CollectionSchema = _CollectionSchema;
    registerType("collection", { constructor: CollectionSchema });
    var _a3, _b2;
    const _SetSchema = class _SetSchema {
      /**
       * Determine if a property must be filtered.
       * - If returns false, the property is NOT going to be encoded.
       * - If returns true, the property is going to be encoded.
       *
       * Encoding with "filters" happens in two steps:
       * - First, the encoder iterates over all "not owned" properties and encodes them.
       * - Then, the encoder iterates over all "owned" properties per instance and encodes them.
       */
      static [(_a3 = $encoder, _b2 = $decoder, $filter)](ref, index, view2) {
        return !view2 || typeof ref[$childType] === "string" || view2.visible.has((ref[$getByIndex](index) ?? ref.deletedItems[index])[$changes]);
      }
      static is(type2) {
        return type2["set"] !== void 0;
      }
      constructor(initialValues) {
        this.$items = /* @__PURE__ */ new Map();
        this.$indexes = /* @__PURE__ */ new Map();
        this.deletedItems = {};
        this.$refId = 0;
        this[$changes] = new ChangeTree(this);
        this[$changes].indexes = {};
        if (initialValues) {
          initialValues.forEach((v) => this.add(v));
        }
        Object.defineProperty(this, $childType, {
          value: void 0,
          enumerable: false,
          writable: true,
          configurable: true
        });
      }
      add(value) {
        var _a4;
        if (this.has(value)) {
          return false;
        }
        const index = this.$refId++;
        if (value[$changes] !== void 0) {
          value[$changes].setParent(this, this[$changes].root, index);
        }
        const operation = ((_a4 = this[$changes].indexes[index]) == null ? void 0 : _a4.op) ?? exports2.OPERATION.ADD;
        this[$changes].indexes[index] = index;
        this.$indexes.set(index, index);
        this.$items.set(index, value);
        this[$changes].change(index, operation);
        return index;
      }
      entries() {
        return this.$items.entries();
      }
      delete(item) {
        const entries = this.$items.entries();
        let index;
        let entry;
        while (entry = entries.next()) {
          if (entry.done) {
            break;
          }
          if (item === entry.value[1]) {
            index = entry.value[0];
            break;
          }
        }
        if (index === void 0) {
          return false;
        }
        this.deletedItems[index] = this[$changes].delete(index);
        this.$indexes.delete(index);
        return this.$items.delete(index);
      }
      clear() {
        const changeTree = this[$changes];
        changeTree.discard(true);
        changeTree.indexes = {};
        this.$indexes.clear();
        this.$items.clear();
        changeTree.operation(exports2.OPERATION.CLEAR);
      }
      has(value) {
        const values = this.$items.values();
        let has = false;
        let entry;
        while (entry = values.next()) {
          if (entry.done) {
            break;
          }
          if (value === entry.value) {
            has = true;
            break;
          }
        }
        return has;
      }
      forEach(callbackfn) {
        this.$items.forEach((value, key, _) => callbackfn(value, key, this));
      }
      values() {
        return this.$items.values();
      }
      get size() {
        return this.$items.size;
      }
      /** Iterator */
      [Symbol.iterator]() {
        return this.$items.values();
      }
      setIndex(index, key) {
        this.$indexes.set(index, key);
      }
      getIndex(index) {
        return this.$indexes.get(index);
      }
      [$getByIndex](index) {
        return this.$items.get(this.$indexes.get(index));
      }
      [$deleteByIndex](index) {
        const key = this.$indexes.get(index);
        this.$items.delete(key);
        this.$indexes.delete(index);
      }
      [$onEncodeEnd]() {
        this.deletedItems = {};
      }
      toArray() {
        return Array.from(this.$items.values());
      }
      toJSON() {
        const values = [];
        this.forEach((value, key) => {
          values.push(typeof value["toJSON"] === "function" ? value["toJSON"]() : value);
        });
        return values;
      }
      //
      // Decoding utilities
      //
      clone(isDecoding) {
        let cloned;
        if (isDecoding) {
          cloned = Object.assign(new _SetSchema(), this);
        } else {
          cloned = new _SetSchema();
          this.forEach((value) => {
            if (value[$changes]) {
              cloned.add(value["clone"]());
            } else {
              cloned.add(value);
            }
          });
        }
        return cloned;
      }
    };
    __name(_SetSchema, "SetSchema");
    _SetSchema[_a3] = encodeKeyValueOperation;
    _SetSchema[_b2] = decodeKeyValueOperation;
    let SetSchema = _SetSchema;
    registerType("set", { constructor: SetSchema });
    function __decorate2(decorators, target2, key, desc) {
      var c = arguments.length, r = c < 3 ? target2 : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target2, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target2, key, r) : d(target2, key)) || r;
      return c > 3 && r && Object.defineProperty(target2, key, r), r;
    }
    __name(__decorate2, "__decorate");
    typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
      var e = new Error(message);
      return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };
    const _Root = class _Root {
      constructor(types) {
        this.types = types;
        this.nextUniqueId = 0;
        this.refCount = {};
        this.changeTrees = {};
        this.allChanges = [];
        this.allFilteredChanges = [];
        this.changes = [];
        this.filteredChanges = [];
      }
      getNextUniqueId() {
        return this.nextUniqueId++;
      }
      add(changeTree) {
        changeTree.ensureRefId();
        const isNewChangeTree = this.changeTrees[changeTree.refId] === void 0;
        if (isNewChangeTree) {
          this.changeTrees[changeTree.refId] = changeTree;
        }
        const previousRefCount = this.refCount[changeTree.refId];
        if (previousRefCount === 0) {
          const ops = changeTree.allChanges.operations;
          let len = ops.length;
          while (len--) {
            changeTree.indexedOperations[ops[len]] = exports2.OPERATION.ADD;
            setOperationAtIndex(changeTree.changes, len);
          }
        }
        this.refCount[changeTree.refId] = (previousRefCount || 0) + 1;
        return isNewChangeTree;
      }
      remove(changeTree) {
        const refCount = this.refCount[changeTree.refId] - 1;
        if (refCount <= 0) {
          changeTree.root = void 0;
          delete this.changeTrees[changeTree.refId];
          this.removeChangeFromChangeSet("allChanges", changeTree);
          this.removeChangeFromChangeSet("changes", changeTree);
          if (changeTree.filteredChanges) {
            this.removeChangeFromChangeSet("allFilteredChanges", changeTree);
            this.removeChangeFromChangeSet("filteredChanges", changeTree);
          }
          this.refCount[changeTree.refId] = 0;
          changeTree.forEachChild((child, _) => this.remove(child));
        } else {
          this.refCount[changeTree.refId] = refCount;
          if (changeTree.filteredChanges !== void 0) {
            this.removeChangeFromChangeSet("filteredChanges", changeTree);
            enqueueChangeTree(this, changeTree, "filteredChanges");
          } else {
            this.removeChangeFromChangeSet("changes", changeTree);
            enqueueChangeTree(this, changeTree, "changes");
          }
        }
        return refCount;
      }
      removeChangeFromChangeSet(changeSetName, changeTree) {
        const changeSet = this[changeSetName];
        const changeSetIndex = changeSet.indexOf(changeTree);
        if (changeSetIndex !== -1) {
          changeTree[changeSetName].queueRootIndex = -1;
          changeSet[changeSetIndex] = void 0;
          return true;
        }
      }
      clear() {
        this.changes.length = 0;
      }
    };
    __name(_Root, "Root");
    let Root = _Root;
    const _Encoder = class _Encoder {
      // 8KB
      constructor(state) {
        this.sharedBuffer = Buffer.allocUnsafe(_Encoder.BUFFER_SIZE);
        this.context = TypeContext.cache(state.constructor);
        this.root = new Root(this.context);
        this.setState(state);
      }
      setState(state) {
        this.state = state;
        this.state[$changes].setRoot(this.root);
      }
      encode(it = { offset: 0 }, view2, buffer = this.sharedBuffer, changeSetName = "changes", isEncodeAll = changeSetName === "allChanges", initialOffset = it.offset) {
        const hasView = view2 !== void 0;
        const rootChangeTree = this.state[$changes];
        const changeTrees = this.root[changeSetName];
        for (let i = 0, numChangeTrees = changeTrees.length; i < numChangeTrees; i++) {
          const changeTree = changeTrees[i];
          if (!changeTree) {
            continue;
          }
          if (hasView) {
            if (!view2.isChangeTreeVisible(changeTree)) {
              view2.invisible.add(changeTree);
              continue;
            }
            view2.invisible.delete(changeTree);
          }
          const changeSet = changeTree[changeSetName];
          const ref = changeTree.ref;
          const numChanges = changeSet.operations.length;
          if (numChanges === 0) {
            continue;
          }
          const ctor = ref.constructor;
          const encoder = ctor[$encoder];
          const filter = ctor[$filter];
          const metadata = ctor[Symbol.metadata];
          if (hasView || it.offset > initialOffset || changeTree !== rootChangeTree) {
            buffer[it.offset++] = SWITCH_TO_STRUCTURE & 255;
            encode2.number(buffer, changeTree.refId, it);
          }
          for (let j = 0; j < numChanges; j++) {
            const fieldIndex = changeSet.operations[j];
            const operation = fieldIndex < 0 ? Math.abs(fieldIndex) : isEncodeAll ? exports2.OPERATION.ADD : changeTree.indexedOperations[fieldIndex];
            if (fieldIndex === void 0 || operation === void 0 || filter && !filter(ref, fieldIndex, view2)) {
              continue;
            }
            encoder(this, buffer, changeTree, fieldIndex, operation, it, isEncodeAll, hasView, metadata);
          }
        }
        if (it.offset > buffer.byteLength) {
          const newSize = Math.ceil(it.offset / (Buffer.poolSize ?? 8 * 1024)) * (Buffer.poolSize ?? 8 * 1024);
          console.warn(`@colyseus/schema buffer overflow. Encoded state is higher than default BUFFER_SIZE. Use the following to increase default BUFFER_SIZE:

    import { Encoder } from "@colyseus/schema";
    Encoder.BUFFER_SIZE = ${Math.round(newSize / 1024)} * 1024; // ${Math.round(newSize / 1024)} KB
`);
          buffer = Buffer.alloc(newSize, buffer);
          if (buffer === this.sharedBuffer) {
            this.sharedBuffer = buffer;
          }
          return this.encode({ offset: initialOffset }, view2, buffer, changeSetName, isEncodeAll);
        } else {
          return buffer.subarray(0, it.offset);
        }
      }
      encodeAll(it = { offset: 0 }, buffer = this.sharedBuffer) {
        return this.encode(it, void 0, buffer, "allChanges", true);
      }
      encodeAllView(view2, sharedOffset, it, bytes = this.sharedBuffer) {
        const viewOffset = it.offset;
        this.encode(it, view2, bytes, "allFilteredChanges", true, viewOffset);
        return Buffer.concat([
          bytes.subarray(0, sharedOffset),
          bytes.subarray(viewOffset, it.offset)
        ]);
      }
      debugChanges(field) {
        const rootChangeSet = typeof field === "string" ? this.root[field] : field;
        rootChangeSet.forEach((changeTree) => {
          const changeSet = changeTree[field];
          const metadata = changeTree.ref.constructor[Symbol.metadata];
          console.log("->", { ref: changeTree.ref.constructor.name, refId: changeTree.refId, changes: Object.keys(changeSet).length });
          for (const index in changeSet) {
            const op = changeSet[index];
            console.log("  ->", {
              index,
              field: metadata == null ? void 0 : metadata[index],
              op: exports2.OPERATION[op]
            });
          }
        });
      }
      encodeView(view2, sharedOffset, it, bytes = this.sharedBuffer) {
        const viewOffset = it.offset;
        for (const [refId, changes] of view2.changes) {
          const changeTree = this.root.changeTrees[refId];
          if (changeTree === void 0) {
            view2.changes.delete(refId);
            continue;
          }
          const keys = Object.keys(changes);
          if (keys.length === 0) {
            continue;
          }
          const ref = changeTree.ref;
          const ctor = ref.constructor;
          const encoder = ctor[$encoder];
          const metadata = ctor[Symbol.metadata];
          bytes[it.offset++] = SWITCH_TO_STRUCTURE & 255;
          encode2.number(bytes, changeTree.refId, it);
          for (let i = 0, numChanges = keys.length; i < numChanges; i++) {
            const index = Number(keys[i]);
            const value = changeTree.ref[$getByIndex](index);
            const operation = value !== void 0 && changes[index] || exports2.OPERATION.DELETE;
            encoder(this, bytes, changeTree, index, operation, it, false, true, metadata);
          }
        }
        view2.changes.clear();
        this.encode(it, view2, bytes, "filteredChanges", false, viewOffset);
        return Buffer.concat([
          bytes.subarray(0, sharedOffset),
          bytes.subarray(viewOffset, it.offset)
        ]);
      }
      discardChanges() {
        var _a4, _b3;
        let length = this.root.changes.length;
        if (length > 0) {
          while (length--) {
            (_a4 = this.root.changes[length]) == null ? void 0 : _a4.endEncode("changes");
          }
          this.root.changes.length = 0;
        }
        length = this.root.filteredChanges.length;
        if (length > 0) {
          while (length--) {
            (_b3 = this.root.filteredChanges[length]) == null ? void 0 : _b3.endEncode("filteredChanges");
          }
          this.root.filteredChanges.length = 0;
        }
      }
      tryEncodeTypeId(bytes, baseType, targetType, it) {
        const baseTypeId = this.context.getTypeId(baseType);
        const targetTypeId = this.context.getTypeId(targetType);
        if (targetTypeId === void 0) {
          console.warn(`@colyseus/schema WARNING: Class "${targetType.name}" is not registered on TypeRegistry - Please either tag the class with @entity or define a @type() field.`);
          return;
        }
        if (baseTypeId !== targetTypeId) {
          bytes[it.offset++] = TYPE_ID & 255;
          encode2.number(bytes, targetTypeId, it);
        }
      }
      get hasChanges() {
        return this.root.changes.length > 0 || this.root.filteredChanges.length > 0;
      }
    };
    __name(_Encoder, "Encoder");
    _Encoder.BUFFER_SIZE = typeof Buffer !== "undefined" && Buffer.poolSize || 8 * 1024;
    let Encoder2 = _Encoder;
    function spliceOne(arr, index) {
      if (index === -1 || index >= arr.length) {
        return false;
      }
      const len = arr.length - 1;
      for (let i = index; i < len; i++) {
        arr[i] = arr[i + 1];
      }
      arr.length = len;
      return true;
    }
    __name(spliceOne, "spliceOne");
    const _DecodingWarning = class _DecodingWarning extends Error {
      constructor(message) {
        super(message);
        this.name = "DecodingWarning";
      }
    };
    __name(_DecodingWarning, "DecodingWarning");
    let DecodingWarning = _DecodingWarning;
    const _ReferenceTracker = class _ReferenceTracker {
      constructor() {
        this.refs = /* @__PURE__ */ new Map();
        this.refIds = /* @__PURE__ */ new WeakMap();
        this.refCounts = {};
        this.deletedRefs = /* @__PURE__ */ new Set();
        this.callbacks = {};
        this.nextUniqueId = 0;
      }
      getNextUniqueId() {
        return this.nextUniqueId++;
      }
      // for decoding
      addRef(refId, ref, incrementCount = true) {
        this.refs.set(refId, ref);
        this.refIds.set(ref, refId);
        if (incrementCount) {
          this.refCounts[refId] = (this.refCounts[refId] || 0) + 1;
        }
        if (this.deletedRefs.has(refId)) {
          this.deletedRefs.delete(refId);
        }
      }
      // for decoding
      removeRef(refId) {
        const refCount = this.refCounts[refId];
        if (refCount === void 0) {
          try {
            throw new DecodingWarning("trying to remove refId that doesn't exist: " + refId);
          } catch (e) {
            console.warn(e);
          }
          return;
        }
        if (refCount === 0) {
          try {
            const ref = this.refs.get(refId);
            throw new DecodingWarning(`trying to remove refId '${refId}' with 0 refCount (${ref.constructor.name}: ${JSON.stringify(ref)})`);
          } catch (e) {
            console.warn(e);
          }
          return;
        }
        if ((this.refCounts[refId] = refCount - 1) <= 0) {
          this.deletedRefs.add(refId);
        }
      }
      clearRefs() {
        this.refs.clear();
        this.deletedRefs.clear();
        this.callbacks = {};
        this.refCounts = {};
      }
      // for decoding
      garbageCollectDeletedRefs() {
        this.deletedRefs.forEach((refId) => {
          if (this.refCounts[refId] > 0) {
            return;
          }
          const ref = this.refs.get(refId);
          if (ref.constructor[Symbol.metadata] !== void 0) {
            const metadata = ref.constructor[Symbol.metadata];
            for (const index in metadata) {
              const field = metadata[index].name;
              const childRefId = typeof ref[field] === "object" && this.refIds.get(ref[field]);
              if (childRefId && !this.deletedRefs.has(childRefId)) {
                this.removeRef(childRefId);
              }
            }
          } else {
            if (typeof ref[$childType] === "function") {
              Array.from(ref.values()).forEach((child) => {
                const childRefId = this.refIds.get(child);
                if (!this.deletedRefs.has(childRefId)) {
                  this.removeRef(childRefId);
                }
              });
            }
          }
          this.refs.delete(refId);
          delete this.refCounts[refId];
          delete this.callbacks[refId];
        });
        this.deletedRefs.clear();
      }
      addCallback(refId, fieldOrOperation, callback) {
        if (refId === void 0) {
          const name = typeof fieldOrOperation === "number" ? exports2.OPERATION[fieldOrOperation] : fieldOrOperation;
          throw new Error(`Can't addCallback on '${name}' (refId is undefined)`);
        }
        if (!this.callbacks[refId]) {
          this.callbacks[refId] = {};
        }
        if (!this.callbacks[refId][fieldOrOperation]) {
          this.callbacks[refId][fieldOrOperation] = [];
        }
        this.callbacks[refId][fieldOrOperation].push(callback);
        return () => this.removeCallback(refId, fieldOrOperation, callback);
      }
      removeCallback(refId, field, callback) {
        var _a4, _b3, _c2;
        const index = (_c2 = (_b3 = (_a4 = this.callbacks) == null ? void 0 : _a4[refId]) == null ? void 0 : _b3[field]) == null ? void 0 : _c2.indexOf(callback);
        if (index !== void 0 && index !== -1) {
          spliceOne(this.callbacks[refId][field], index);
        }
      }
    };
    __name(_ReferenceTracker, "ReferenceTracker");
    let ReferenceTracker = _ReferenceTracker;
    const _Decoder = class _Decoder {
      constructor(root, context) {
        this.currentRefId = 0;
        this.setState(root);
        this.context = context || new TypeContext(root.constructor);
      }
      setState(root) {
        this.state = root;
        this.root = new ReferenceTracker();
        this.root.addRef(0, root);
      }
      decode(bytes, it = { offset: 0 }, ref = this.state) {
        var _a4, _b3, _c2;
        const allChanges = [];
        const $root = this.root;
        const totalBytes = bytes.byteLength;
        let decoder2 = ref["constructor"][$decoder];
        this.currentRefId = 0;
        while (it.offset < totalBytes) {
          if (bytes[it.offset] == SWITCH_TO_STRUCTURE) {
            it.offset++;
            this.currentRefId = decode2.number(bytes, it);
            const nextRef = $root.refs.get(this.currentRefId);
            if (!nextRef) {
              throw new Error(`"refId" not found: ${this.currentRefId}`);
            }
            (_a4 = ref[$onDecodeEnd]) == null ? void 0 : _a4.call(ref);
            ref = nextRef;
            decoder2 = ref.constructor[$decoder];
            continue;
          }
          const result = decoder2(this, bytes, it, ref, allChanges);
          if (result === DEFINITION_MISMATCH) {
            console.warn("@colyseus/schema: definition mismatch");
            const nextIterator = { offset: it.offset };
            while (it.offset < totalBytes) {
              if (bytes[it.offset] === SWITCH_TO_STRUCTURE) {
                nextIterator.offset = it.offset + 1;
                if ($root.refs.has(decode2.number(bytes, nextIterator))) {
                  break;
                }
              }
              it.offset++;
            }
            continue;
          }
        }
        (_b3 = ref[$onDecodeEnd]) == null ? void 0 : _b3.call(ref);
        (_c2 = this.triggerChanges) == null ? void 0 : _c2.call(this, allChanges);
        $root.garbageCollectDeletedRefs();
        return allChanges;
      }
      getInstanceType(bytes, it, defaultType) {
        let type2;
        if (bytes[it.offset] === TYPE_ID) {
          it.offset++;
          const type_id = decode2.number(bytes, it);
          type2 = this.context.get(type_id);
        }
        return type2 || defaultType;
      }
      createInstanceOfType(type2) {
        return new type2();
      }
      removeChildRefs(ref, allChanges) {
        const needRemoveRef = typeof ref[$childType] !== "string";
        const refId = this.root.refIds.get(ref);
        ref.forEach((value, key) => {
          allChanges.push({
            ref,
            refId,
            op: exports2.OPERATION.DELETE,
            field: key,
            value: void 0,
            previousValue: value
          });
          if (needRemoveRef) {
            this.root.removeRef(this.root.refIds.get(value));
          }
        });
      }
    };
    __name(_Decoder, "Decoder");
    let Decoder2 = _Decoder;
    const _ReflectionField = class _ReflectionField extends Schema {
    };
    __name(_ReflectionField, "ReflectionField");
    let ReflectionField = _ReflectionField;
    __decorate2([
      type("string")
    ], ReflectionField.prototype, "name", void 0);
    __decorate2([
      type("string")
    ], ReflectionField.prototype, "type", void 0);
    __decorate2([
      type("number")
    ], ReflectionField.prototype, "referencedType", void 0);
    const _ReflectionType = class _ReflectionType extends Schema {
      constructor() {
        super(...arguments);
        this.fields = new ArraySchema();
      }
    };
    __name(_ReflectionType, "ReflectionType");
    let ReflectionType = _ReflectionType;
    __decorate2([
      type("number")
    ], ReflectionType.prototype, "id", void 0);
    __decorate2([
      type("number")
    ], ReflectionType.prototype, "extendsId", void 0);
    __decorate2([
      type([ReflectionField])
    ], ReflectionType.prototype, "fields", void 0);
    const _Reflection = class _Reflection extends Schema {
      constructor() {
        super(...arguments);
        this.types = new ArraySchema();
      }
      /**
       * Encodes the TypeContext of an Encoder into a buffer.
       *
       * @param encoder Encoder instance
       * @param it
       * @returns
       */
      static encode(encoder, it = { offset: 0 }) {
        const context = encoder.context;
        const reflection = new _Reflection();
        const reflectionEncoder = new Encoder2(reflection);
        const rootType = context.schemas.get(encoder.state.constructor);
        if (rootType > 0) {
          reflection.rootType = rootType;
        }
        const includedTypeIds = /* @__PURE__ */ new Set();
        const pendingReflectionTypes = {};
        const addType = /* @__PURE__ */ __name((type2) => {
          if (type2.extendsId === void 0 || includedTypeIds.has(type2.extendsId)) {
            includedTypeIds.add(type2.id);
            reflection.types.push(type2);
            const deps = pendingReflectionTypes[type2.id];
            if (deps !== void 0) {
              delete pendingReflectionTypes[type2.id];
              deps.forEach((childType) => addType(childType));
            }
          } else {
            if (pendingReflectionTypes[type2.extendsId] === void 0) {
              pendingReflectionTypes[type2.extendsId] = [];
            }
            pendingReflectionTypes[type2.extendsId].push(type2);
          }
        }, "addType");
        context.schemas.forEach((typeid, klass) => {
          const type2 = new ReflectionType();
          type2.id = Number(typeid);
          const inheritFrom = Object.getPrototypeOf(klass);
          if (inheritFrom !== Schema) {
            type2.extendsId = context.schemas.get(inheritFrom);
          }
          const metadata = klass[Symbol.metadata];
          if (metadata !== inheritFrom[Symbol.metadata]) {
            for (const fieldIndex in metadata) {
              const index = Number(fieldIndex);
              const fieldName = metadata[index].name;
              if (!Object.prototype.hasOwnProperty.call(metadata, fieldName)) {
                continue;
              }
              const reflectionField = new ReflectionField();
              reflectionField.name = fieldName;
              let fieldType;
              const field = metadata[index];
              if (typeof field.type === "string") {
                fieldType = field.type;
              } else {
                let childTypeSchema;
                if (Schema.is(field.type)) {
                  fieldType = "ref";
                  childTypeSchema = field.type;
                } else {
                  fieldType = Object.keys(field.type)[0];
                  if (typeof field.type[fieldType] === "string") {
                    fieldType += ":" + field.type[fieldType];
                  } else {
                    childTypeSchema = field.type[fieldType];
                  }
                }
                reflectionField.referencedType = childTypeSchema ? context.getTypeId(childTypeSchema) : -1;
              }
              reflectionField.type = fieldType;
              type2.fields.push(reflectionField);
            }
          }
          addType(type2);
        });
        for (const typeid in pendingReflectionTypes) {
          pendingReflectionTypes[typeid].forEach((type2) => reflection.types.push(type2));
        }
        const buf = reflectionEncoder.encodeAll(it);
        return Buffer.from(buf, 0, it.offset);
      }
      /**
       * Decodes the TypeContext from a buffer into a Decoder instance.
       *
       * @param bytes Reflection.encode() output
       * @param it
       * @returns Decoder instance
       */
      static decode(bytes, it) {
        const reflection = new _Reflection();
        const reflectionDecoder = new Decoder2(reflection);
        reflectionDecoder.decode(bytes, it);
        const typeContext = new TypeContext();
        reflection.types.forEach((reflectionType) => {
          var _a4;
          const parentClass = typeContext.get(reflectionType.extendsId) ?? Schema;
          const schema3 = (_a4 = class extends parentClass {
          }, __name(_a4, "_"), _a4);
          TypeContext.register(schema3);
          typeContext.add(schema3, reflectionType.id);
        }, {});
        const addFields = /* @__PURE__ */ __name((metadata, reflectionType, parentFieldIndex) => {
          reflectionType.fields.forEach((field, i) => {
            const fieldIndex = parentFieldIndex + i;
            if (field.referencedType !== void 0) {
              let fieldType = field.type;
              let refType = typeContext.get(field.referencedType);
              if (!refType) {
                const typeInfo = field.type.split(":");
                fieldType = typeInfo[0];
                refType = typeInfo[1];
              }
              if (fieldType === "ref") {
                Metadata.addField(metadata, fieldIndex, field.name, refType);
              } else {
                Metadata.addField(metadata, fieldIndex, field.name, { [fieldType]: refType });
              }
            } else {
              Metadata.addField(metadata, fieldIndex, field.name, field.type);
            }
          });
        }, "addFields");
        reflection.types.forEach((reflectionType) => {
          const schema3 = typeContext.get(reflectionType.id);
          const metadata = Metadata.initialize(schema3);
          const inheritedTypes = [];
          let parentType = reflectionType;
          do {
            inheritedTypes.push(parentType);
            parentType = reflection.types.find((t) => t.id === parentType.extendsId);
          } while (parentType);
          let parentFieldIndex = 0;
          inheritedTypes.reverse().forEach((reflectionType2) => {
            addFields(metadata, reflectionType2, parentFieldIndex);
            parentFieldIndex += reflectionType2.fields.length;
          });
        });
        const state = new (typeContext.get(reflection.rootType || 0))();
        return new Decoder2(state, typeContext);
      }
    };
    __name(_Reflection, "Reflection");
    let Reflection = _Reflection;
    __decorate2([
      type([ReflectionType])
    ], Reflection.prototype, "types", void 0);
    __decorate2([
      type("number")
    ], Reflection.prototype, "rootType", void 0);
    function getDecoderStateCallbacks(decoder2) {
      const $root = decoder2.root;
      const callbacks = $root.callbacks;
      const onAddCalls = /* @__PURE__ */ new WeakMap();
      let currentOnAddCallback;
      decoder2.triggerChanges = function(allChanges) {
        var _a4;
        const uniqueRefIds = /* @__PURE__ */ new Set();
        for (let i = 0, l = allChanges.length; i < l; i++) {
          const change = allChanges[i];
          const refId = change.refId;
          const ref = change.ref;
          const $callbacks = callbacks[refId];
          if (!$callbacks) {
            continue;
          }
          if ((change.op & exports2.OPERATION.DELETE) === exports2.OPERATION.DELETE && change.previousValue instanceof Schema) {
            const deleteCallbacks = (_a4 = callbacks[$root.refIds.get(change.previousValue)]) == null ? void 0 : _a4[exports2.OPERATION.DELETE];
            for (let i2 = (deleteCallbacks == null ? void 0 : deleteCallbacks.length) - 1; i2 >= 0; i2--) {
              deleteCallbacks[i2]();
            }
          }
          if (ref instanceof Schema) {
            if (!uniqueRefIds.has(refId)) {
              const replaceCallbacks = $callbacks == null ? void 0 : $callbacks[exports2.OPERATION.REPLACE];
              for (let i2 = (replaceCallbacks == null ? void 0 : replaceCallbacks.length) - 1; i2 >= 0; i2--) {
                replaceCallbacks[i2]();
              }
            }
            if ($callbacks.hasOwnProperty(change.field)) {
              const fieldCallbacks = $callbacks[change.field];
              for (let i2 = (fieldCallbacks == null ? void 0 : fieldCallbacks.length) - 1; i2 >= 0; i2--) {
                fieldCallbacks[i2](change.value, change.previousValue);
              }
            }
          } else {
            if ((change.op & exports2.OPERATION.DELETE) === exports2.OPERATION.DELETE) {
              if (change.previousValue !== void 0) {
                const deleteCallbacks = $callbacks[exports2.OPERATION.DELETE];
                for (let i2 = (deleteCallbacks == null ? void 0 : deleteCallbacks.length) - 1; i2 >= 0; i2--) {
                  deleteCallbacks[i2](change.previousValue, change.dynamicIndex ?? change.field);
                }
              }
              if ((change.op & exports2.OPERATION.ADD) === exports2.OPERATION.ADD) {
                const addCallbacks = $callbacks[exports2.OPERATION.ADD];
                for (let i2 = (addCallbacks == null ? void 0 : addCallbacks.length) - 1; i2 >= 0; i2--) {
                  addCallbacks[i2](change.value, change.dynamicIndex ?? change.field);
                }
              }
            } else if ((change.op & exports2.OPERATION.ADD) === exports2.OPERATION.ADD && change.previousValue !== change.value) {
              const addCallbacks = $callbacks[exports2.OPERATION.ADD];
              for (let i2 = (addCallbacks == null ? void 0 : addCallbacks.length) - 1; i2 >= 0; i2--) {
                addCallbacks[i2](change.value, change.dynamicIndex ?? change.field);
              }
            }
            if (change.value !== change.previousValue && // FIXME: see "should not encode item if added and removed at the same patch" test case.
            // some "ADD" + "DELETE" operations on same patch are being encoded as "DELETE"
            (change.value !== void 0 || change.previousValue !== void 0)) {
              const replaceCallbacks = $callbacks[exports2.OPERATION.REPLACE];
              for (let i2 = (replaceCallbacks == null ? void 0 : replaceCallbacks.length) - 1; i2 >= 0; i2--) {
                replaceCallbacks[i2](change.value, change.dynamicIndex ?? change.field);
              }
            }
          }
          uniqueRefIds.add(refId);
        }
      };
      function getProxy(metadataOrType, context) {
        var _a4;
        let metadata = ((_a4 = context.instance) == null ? void 0 : _a4.constructor[Symbol.metadata]) || metadataOrType;
        let isCollection = context.instance && typeof context.instance["forEach"] === "function" || metadataOrType && typeof metadataOrType[Symbol.metadata] === "undefined";
        if (metadata && !isCollection) {
          const onAddListen = /* @__PURE__ */ __name(function(ref, prop, callback, immediate) {
            if (immediate && context.instance[prop] !== void 0 && !onAddCalls.has(currentOnAddCallback)) {
              callback(context.instance[prop], void 0);
            }
            return $root.addCallback($root.refIds.get(ref), prop, callback);
          }, "onAddListen");
          return new Proxy({
            listen: /* @__PURE__ */ __name(function listen(prop, callback, immediate = true) {
              if (context.instance) {
                return onAddListen(context.instance, prop, callback, immediate);
              } else {
                let detachCallback = /* @__PURE__ */ __name(() => {
                }, "detachCallback");
                context.onInstanceAvailable((ref, existing) => {
                  detachCallback = onAddListen(ref, prop, callback, immediate && existing && !onAddCalls.has(currentOnAddCallback));
                });
                return () => detachCallback();
              }
            }, "listen"),
            onChange: /* @__PURE__ */ __name(function onChange(callback) {
              return $root.addCallback($root.refIds.get(context.instance), exports2.OPERATION.REPLACE, callback);
            }, "onChange"),
            //
            // TODO: refactor `bindTo()` implementation.
            // There is room for improvement.
            //
            bindTo: /* @__PURE__ */ __name(function bindTo(targetObject, properties) {
              if (!properties) {
                properties = Object.keys(metadata).map((index) => metadata[index].name);
              }
              return $root.addCallback($root.refIds.get(context.instance), exports2.OPERATION.REPLACE, () => {
                properties.forEach((prop) => targetObject[prop] = context.instance[prop]);
              });
            }, "bindTo")
          }, {
            get(target2, prop) {
              var _a5;
              const metadataField = metadata[metadata[prop]];
              if (metadataField) {
                const instance = (_a5 = context.instance) == null ? void 0 : _a5[prop];
                const onInstanceAvailable = /* @__PURE__ */ __name((callback) => {
                  const unbind = $(context.instance).listen(prop, (value, _) => {
                    callback(value, false);
                    unbind == null ? void 0 : unbind();
                  }, false);
                  if ($root.refIds.get(instance) !== void 0) {
                    callback(instance, true);
                  }
                }, "onInstanceAvailable");
                return getProxy(metadataField.type, {
                  // make sure refId is available, otherwise need to wait for the instance to be available.
                  instance: $root.refIds.get(instance) && instance,
                  parentInstance: context.instance,
                  onInstanceAvailable
                });
              } else {
                return target2[prop];
              }
            },
            has(target2, prop) {
              return metadata[prop] !== void 0;
            },
            set(_, _1, _2) {
              throw new Error("not allowed");
            },
            deleteProperty(_, _1) {
              throw new Error("not allowed");
            }
          });
        } else {
          const onAdd = /* @__PURE__ */ __name(function(ref, callback, immediate) {
            if (immediate) {
              ref.forEach((v, k) => callback(v, k));
            }
            return $root.addCallback($root.refIds.get(ref), exports2.OPERATION.ADD, (value, key) => {
              onAddCalls.set(callback, true);
              currentOnAddCallback = callback;
              callback(value, key);
              onAddCalls.delete(callback);
              currentOnAddCallback = void 0;
            });
          }, "onAdd");
          const onRemove = /* @__PURE__ */ __name(function(ref, callback) {
            return $root.addCallback($root.refIds.get(ref), exports2.OPERATION.DELETE, callback);
          }, "onRemove");
          const onChange = /* @__PURE__ */ __name(function(ref, callback) {
            return $root.addCallback($root.refIds.get(ref), exports2.OPERATION.REPLACE, callback);
          }, "onChange");
          return new Proxy({
            onAdd: /* @__PURE__ */ __name(function(callback, immediate = true) {
              if (context.instance) {
                return onAdd(context.instance, callback, immediate && !onAddCalls.has(currentOnAddCallback));
              } else if (context.onInstanceAvailable) {
                let detachCallback = /* @__PURE__ */ __name(() => {
                }, "detachCallback");
                context.onInstanceAvailable((ref, existing) => {
                  detachCallback = onAdd(ref, callback, immediate && existing && !onAddCalls.has(currentOnAddCallback));
                });
                return () => detachCallback();
              }
            }, "onAdd"),
            onRemove: /* @__PURE__ */ __name(function(callback) {
              if (context.instance) {
                return onRemove(context.instance, callback);
              } else if (context.onInstanceAvailable) {
                let detachCallback = /* @__PURE__ */ __name(() => {
                }, "detachCallback");
                context.onInstanceAvailable((ref) => {
                  detachCallback = onRemove(ref, callback);
                });
                return () => detachCallback();
              }
            }, "onRemove"),
            onChange: /* @__PURE__ */ __name(function(callback) {
              if (context.instance) {
                return onChange(context.instance, callback);
              } else if (context.onInstanceAvailable) {
                let detachCallback = /* @__PURE__ */ __name(() => {
                }, "detachCallback");
                context.onInstanceAvailable((ref) => {
                  detachCallback = onChange(ref, callback);
                });
                return () => detachCallback();
              }
            }, "onChange")
          }, {
            get(target2, prop) {
              if (!target2[prop]) {
                throw new Error(`Can't access '${prop}' through callback proxy. access the instance directly.`);
              }
              return target2[prop];
            },
            has(target2, prop) {
              return target2[prop] !== void 0;
            },
            set(_, _1, _2) {
              throw new Error("not allowed");
            },
            deleteProperty(_, _1) {
              throw new Error("not allowed");
            }
          });
        }
      }
      __name(getProxy, "getProxy");
      function $(instance) {
        return getProxy(void 0, { instance });
      }
      __name($, "$");
      return $;
    }
    __name(getDecoderStateCallbacks, "getDecoderStateCallbacks");
    function getRawChangesCallback(decoder2, callback) {
      decoder2.triggerChanges = callback;
    }
    __name(getRawChangesCallback, "getRawChangesCallback");
    const _StateView = class _StateView {
      constructor(iterable = false) {
        this.iterable = iterable;
        this.visible = /* @__PURE__ */ new WeakSet();
        this.invisible = /* @__PURE__ */ new WeakSet();
        this.changes = /* @__PURE__ */ new Map();
        if (iterable) {
          this.items = [];
        }
      }
      // TODO: allow to set multiple tags at once
      add(obj, tag = DEFAULT_VIEW_TAG, checkIncludeParent = true) {
        var _a4, _b3;
        const changeTree = obj == null ? void 0 : obj[$changes];
        if (!changeTree) {
          console.warn("StateView#add(), invalid object:", obj);
          return this;
        } else if (!changeTree.parent && changeTree.refId !== 0) {
          throw new Error(`Cannot add a detached instance to the StateView. Make sure to assign the "${changeTree.ref.constructor.name}" instance to the state before calling view.add()`);
        }
        const metadata = obj.constructor[Symbol.metadata];
        this.visible.add(changeTree);
        if (this.iterable && checkIncludeParent) {
          this.items.push(obj);
        }
        if (checkIncludeParent && changeTree.parent) {
          this.addParentOf(changeTree, tag);
        }
        let changes = this.changes.get(changeTree.refId);
        if (changes === void 0) {
          changes = {};
          this.changes.set(changeTree.refId, changes);
        }
        if (tag !== DEFAULT_VIEW_TAG) {
          if (!this.tags) {
            this.tags = /* @__PURE__ */ new WeakMap();
          }
          let tags;
          if (!this.tags.has(changeTree)) {
            tags = /* @__PURE__ */ new Set();
            this.tags.set(changeTree, tags);
          } else {
            tags = this.tags.get(changeTree);
          }
          tags.add(tag);
          (_b3 = (_a4 = metadata == null ? void 0 : metadata[$fieldIndexesByViewTag]) == null ? void 0 : _a4[tag]) == null ? void 0 : _b3.forEach((index) => {
            if (changeTree.getChange(index) !== exports2.OPERATION.DELETE) {
              changes[index] = exports2.OPERATION.ADD;
            }
          });
        } else {
          const isInvisible = this.invisible.has(changeTree);
          const changeSet = changeTree.filteredChanges !== void 0 ? changeTree.allFilteredChanges : changeTree.allChanges;
          for (let i = 0, len = changeSet.operations.length; i < len; i++) {
            const index = changeSet.operations[i];
            if (index === void 0) {
              continue;
            }
            const op = changeTree.indexedOperations[index] ?? exports2.OPERATION.ADD;
            const tagAtIndex = metadata == null ? void 0 : metadata[index].tag;
            if (!changeTree.isNew && // new structures will be added as part of .encode() call, no need to force it to .encodeView()
            (isInvisible || // if "invisible", include all
            tagAtIndex === void 0 || // "all change" with no tag
            tagAtIndex === tag) && op !== exports2.OPERATION.DELETE) {
              changes[index] = op;
            }
          }
        }
        changeTree.forEachChild((change, index) => {
          if (metadata && metadata[index].tag !== void 0 && metadata[index].tag !== tag) {
            return;
          }
          this.add(change.ref, tag, false);
        });
        return this;
      }
      addParentOf(childChangeTree, tag) {
        var _a4;
        const changeTree = childChangeTree.parent[$changes];
        const parentIndex = childChangeTree.parentIndex;
        if (!this.visible.has(changeTree)) {
          this.visible.add(changeTree);
          const parentChangeTree = (_a4 = changeTree.parent) == null ? void 0 : _a4[$changes];
          if (parentChangeTree && parentChangeTree.filteredChanges !== void 0) {
            this.addParentOf(changeTree, tag);
          }
        }
        if (changeTree.getChange(parentIndex) !== exports2.OPERATION.DELETE) {
          let changes = this.changes.get(changeTree.refId);
          if (changes === void 0) {
            changes = {};
            this.changes.set(changeTree.refId, changes);
          }
          if (!this.tags) {
            this.tags = /* @__PURE__ */ new WeakMap();
          }
          let tags;
          if (!this.tags.has(changeTree)) {
            tags = /* @__PURE__ */ new Set();
            this.tags.set(changeTree, tags);
          } else {
            tags = this.tags.get(changeTree);
          }
          tags.add(tag);
          changes[parentIndex] = exports2.OPERATION.ADD;
        }
      }
      remove(obj, tag = DEFAULT_VIEW_TAG, _isClear = false) {
        var _a4;
        const changeTree = obj[$changes];
        if (!changeTree) {
          console.warn("StateView#remove(), invalid object:", obj);
          return this;
        }
        this.visible.delete(changeTree);
        if (this.iterable && !_isClear) {
          spliceOne(this.items, this.items.indexOf(obj));
        }
        const ref = changeTree.ref;
        const metadata = ref.constructor[Symbol.metadata];
        let changes = this.changes.get(changeTree.refId);
        if (changes === void 0) {
          changes = {};
          this.changes.set(changeTree.refId, changes);
        }
        if (tag === DEFAULT_VIEW_TAG) {
          const parent = changeTree.parent;
          if (!Metadata.isValidInstance(parent) && changeTree.isFiltered) {
            const parentChangeTree = parent[$changes];
            let changes2 = this.changes.get(parentChangeTree.refId);
            if (changes2 === void 0) {
              changes2 = {};
              this.changes.set(parentChangeTree.refId, changes2);
            }
            changes2[changeTree.parentIndex] = exports2.OPERATION.DELETE;
          } else {
            (_a4 = metadata == null ? void 0 : metadata[$viewFieldIndexes]) == null ? void 0 : _a4.forEach((index) => changes[index] = exports2.OPERATION.DELETE);
          }
        } else {
          metadata == null ? void 0 : metadata[$fieldIndexesByViewTag][tag].forEach((index) => changes[index] = exports2.OPERATION.DELETE);
        }
        if (this.tags && this.tags.has(changeTree)) {
          const tags = this.tags.get(changeTree);
          if (tag === void 0) {
            this.tags.delete(changeTree);
          } else {
            tags.delete(tag);
            if (tags.size === 0) {
              this.tags.delete(changeTree);
            }
          }
        }
        return this;
      }
      has(obj) {
        return this.visible.has(obj[$changes]);
      }
      hasTag(ob, tag = DEFAULT_VIEW_TAG) {
        var _a4;
        const tags = (_a4 = this.tags) == null ? void 0 : _a4.get(ob[$changes]);
        return (tags == null ? void 0 : tags.has(tag)) ?? false;
      }
      clear() {
        if (!this.iterable) {
          throw new Error("StateView#clear() is only available for iterable StateView's. Use StateView(iterable: true) constructor.");
        }
        for (let i = 0, l = this.items.length; i < l; i++) {
          this.remove(this.items[i], DEFAULT_VIEW_TAG, true);
        }
        this.items.length = 0;
      }
      isChangeTreeVisible(changeTree) {
        let isVisible = this.visible.has(changeTree);
        if (!isVisible && changeTree.isVisibilitySharedWithParent) {
          if (this.visible.has(changeTree.parent[$changes])) {
            this.visible.add(changeTree);
            isVisible = true;
          }
        }
        return isVisible;
      }
    };
    __name(_StateView, "StateView");
    let StateView = _StateView;
    registerType("map", { constructor: MapSchema });
    registerType("array", { constructor: ArraySchema });
    registerType("set", { constructor: SetSchema });
    registerType("collection", { constructor: CollectionSchema });
    exports2.$changes = $changes;
    exports2.$childType = $childType;
    exports2.$decoder = $decoder;
    exports2.$deleteByIndex = $deleteByIndex;
    exports2.$encoder = $encoder;
    exports2.$filter = $filter;
    exports2.$getByIndex = $getByIndex;
    exports2.$track = $track;
    exports2.ArraySchema = ArraySchema;
    exports2.ChangeTree = ChangeTree;
    exports2.CollectionSchema = CollectionSchema;
    exports2.Decoder = Decoder2;
    exports2.Encoder = Encoder2;
    exports2.MapSchema = MapSchema;
    exports2.Metadata = Metadata;
    exports2.Reflection = Reflection;
    exports2.ReflectionField = ReflectionField;
    exports2.ReflectionType = ReflectionType;
    exports2.Schema = Schema;
    exports2.SetSchema = SetSchema;
    exports2.StateView = StateView;
    exports2.TypeContext = TypeContext;
    exports2.decode = decode2;
    exports2.decodeKeyValueOperation = decodeKeyValueOperation;
    exports2.decodeSchemaOperation = decodeSchemaOperation;
    exports2.defineCustomTypes = defineCustomTypes;
    exports2.defineTypes = defineTypes;
    exports2.deprecated = deprecated;
    exports2.dumpChanges = dumpChanges;
    exports2.encode = encode2;
    exports2.encodeArray = encodeArray;
    exports2.encodeKeyValueOperation = encodeKeyValueOperation;
    exports2.encodeSchemaOperation = encodeSchemaOperation;
    exports2.entity = entity;
    exports2.getDecoderStateCallbacks = getDecoderStateCallbacks;
    exports2.getRawChangesCallback = getRawChangesCallback;
    exports2.registerType = registerType;
    exports2.schema = schema2;
    exports2.type = type;
    exports2.view = view;
  });
})(umd$1, umd$1.exports);
var umdExports$1 = umd$1.exports;
var tslib$3 = require$$0;
var schema$2 = umdExports$1;
const _H3TransportTransport = class _H3TransportTransport {
  constructor(events) {
    this.events = events;
    this.isOpen = false;
    this.lengthPrefixBuffer = new Uint8Array(9);
  }
  connect(url, options = {}) {
    const wtOpts = options.fingerprint && {
      // requireUnreliable: true,
      // congestionControl: "default", // "low-latency" || "throughput"
      serverCertificateHashes: [{
        algorithm: "sha-256",
        value: new Uint8Array(options.fingerprint).buffer
      }]
    } || void 0;
    this.wt = new WebTransport(url, wtOpts);
    this.wt.ready.then((e) => {
      console.log("WebTransport ready!", e);
      this.isOpen = true;
      this.unreliableReader = this.wt.datagrams.readable.getReader();
      this.unreliableWriter = this.wt.datagrams.writable.getWriter();
      const incomingBidi = this.wt.incomingBidirectionalStreams.getReader();
      incomingBidi.read().then((stream) => {
        this.reader = stream.value.readable.getReader();
        this.writer = stream.value.writable.getWriter();
        this.sendSeatReservation(options.room.roomId, options.sessionId, options.reconnectionToken);
        this.readIncomingData();
        this.readIncomingUnreliableData();
      }).catch((e2) => {
        console.error("failed to read incoming stream", e2);
        console.error("TODO: close the connection");
      });
    }).catch((e) => {
      console.log("WebTransport not ready!", e);
      this._close();
    });
    this.wt.closed.then((e) => {
      console.log("WebTransport closed w/ success", e);
      this.events.onclose({ code: e.closeCode, reason: e.reason });
    }).catch((e) => {
      console.log("WebTransport closed w/ error", e);
      this.events.onerror(e);
      this.events.onclose({ code: e.closeCode, reason: e.reason });
    }).finally(() => {
      this._close();
    });
  }
  send(data) {
    const prefixLength = schema$2.encode.number(this.lengthPrefixBuffer, data.length, { offset: 0 });
    const dataWithPrefixedLength = new Uint8Array(prefixLength + data.length);
    dataWithPrefixedLength.set(this.lengthPrefixBuffer.subarray(0, prefixLength), 0);
    dataWithPrefixedLength.set(data, prefixLength);
    this.writer.write(dataWithPrefixedLength);
  }
  sendUnreliable(data) {
    const prefixLength = schema$2.encode.number(this.lengthPrefixBuffer, data.length, { offset: 0 });
    const dataWithPrefixedLength = new Uint8Array(prefixLength + data.length);
    dataWithPrefixedLength.set(this.lengthPrefixBuffer.subarray(0, prefixLength), 0);
    dataWithPrefixedLength.set(data, prefixLength);
    this.unreliableWriter.write(dataWithPrefixedLength);
  }
  close(code, reason) {
    try {
      this.wt.close({ closeCode: code, reason });
    } catch (e) {
      console.error(e);
    }
  }
  readIncomingData() {
    return tslib$3.__awaiter(this, void 0, void 0, function* () {
      let result;
      while (this.isOpen) {
        try {
          result = yield this.reader.read();
          const messages = result.value;
          const it = { offset: 0 };
          do {
            const length = schema$2.decode.number(messages, it);
            this.events.onmessage({ data: messages.subarray(it.offset, it.offset + length) });
            it.offset += length;
          } while (it.offset < messages.length);
        } catch (e) {
          if (e.message.indexOf("session is closed") === -1) {
            console.error("H3Transport: failed to read incoming data", e);
          }
          break;
        }
        if (result.done) {
          break;
        }
      }
    });
  }
  readIncomingUnreliableData() {
    return tslib$3.__awaiter(this, void 0, void 0, function* () {
      let result;
      while (this.isOpen) {
        try {
          result = yield this.unreliableReader.read();
          const messages = result.value;
          const it = { offset: 0 };
          do {
            const length = schema$2.decode.number(messages, it);
            this.events.onmessage({ data: messages.subarray(it.offset, it.offset + length) });
            it.offset += length;
          } while (it.offset < messages.length);
        } catch (e) {
          if (e.message.indexOf("session is closed") === -1) {
            console.error("H3Transport: failed to read incoming data", e);
          }
          break;
        }
        if (result.done) {
          break;
        }
      }
    });
  }
  sendSeatReservation(roomId, sessionId, reconnectionToken) {
    const it = { offset: 0 };
    const bytes = [];
    schema$2.encode.string(bytes, roomId, it);
    schema$2.encode.string(bytes, sessionId, it);
    if (reconnectionToken) {
      schema$2.encode.string(bytes, reconnectionToken, it);
    }
    this.writer.write(new Uint8Array(bytes).buffer);
  }
  _close() {
    this.isOpen = false;
  }
};
__name(_H3TransportTransport, "H3TransportTransport");
let H3TransportTransport = _H3TransportTransport;
H3Transport$1.H3TransportTransport = H3TransportTransport;
var WebSocketTransport$2 = {};
var browser = /* @__PURE__ */ __name(function() {
  throw new Error(
    "ws does not work in the browser. Browser clients must use the native WebSocket object"
  );
}, "browser");
var NodeWebSocket = browser;
const WebSocket = globalThis.WebSocket || NodeWebSocket;
let WebSocketTransport$1 = (_a = class {
  constructor(events) {
    this.events = events;
  }
  send(data) {
    this.ws.send(data);
  }
  sendUnreliable(data) {
    console.warn("colyseus.js: The WebSocket transport does not support unreliable messages");
  }
  /**
   * @param url URL to connect to
   * @param headers custom headers to send with the connection (only supported in Node.js. Web Browsers do not allow setting custom headers)
   */
  connect(url, headers) {
    try {
      this.ws = new WebSocket(url, { headers, protocols: this.protocols });
    } catch (e) {
      this.ws = new WebSocket(url, this.protocols);
    }
    this.ws.binaryType = "arraybuffer";
    this.ws.onopen = this.events.onopen;
    this.ws.onmessage = this.events.onmessage;
    this.ws.onclose = this.events.onclose;
    this.ws.onerror = this.events.onerror;
  }
  close(code, reason) {
    this.ws.close(code, reason);
  }
  get isOpen() {
    return this.ws.readyState === WebSocket.OPEN;
  }
}, __name(_a, "WebSocketTransport"), _a);
WebSocketTransport$2.WebSocketTransport = WebSocketTransport$1;
var H3Transport = H3Transport$1;
var WebSocketTransport = WebSocketTransport$2;
let Connection$1 = (_b = class {
  constructor(protocol) {
    this.events = {};
    switch (protocol) {
      case "h3":
        this.transport = new H3Transport.H3TransportTransport(this.events);
        break;
      default:
        this.transport = new WebSocketTransport.WebSocketTransport(this.events);
        break;
    }
  }
  connect(url, options) {
    this.transport.connect.call(this.transport, url, options);
  }
  send(data) {
    this.transport.send(data);
  }
  sendUnreliable(data) {
    this.transport.sendUnreliable(data);
  }
  close(code, reason) {
    this.transport.close(code, reason);
  }
  get isOpen() {
    return this.transport.isOpen;
  }
}, __name(_b, "Connection"), _b);
Connection$2.Connection = Connection$1;
var Protocol$1 = {};
(function(exports) {
  exports.Protocol = void 0;
  (function(Protocol2) {
    Protocol2[Protocol2["HANDSHAKE"] = 9] = "HANDSHAKE";
    Protocol2[Protocol2["JOIN_ROOM"] = 10] = "JOIN_ROOM";
    Protocol2[Protocol2["ERROR"] = 11] = "ERROR";
    Protocol2[Protocol2["LEAVE_ROOM"] = 12] = "LEAVE_ROOM";
    Protocol2[Protocol2["ROOM_DATA"] = 13] = "ROOM_DATA";
    Protocol2[Protocol2["ROOM_STATE"] = 14] = "ROOM_STATE";
    Protocol2[Protocol2["ROOM_STATE_PATCH"] = 15] = "ROOM_STATE_PATCH";
    Protocol2[Protocol2["ROOM_DATA_SCHEMA"] = 16] = "ROOM_DATA_SCHEMA";
    Protocol2[Protocol2["ROOM_DATA_BYTES"] = 17] = "ROOM_DATA_BYTES";
  })(exports.Protocol || (exports.Protocol = {}));
  exports.ErrorCode = void 0;
  (function(ErrorCode) {
    ErrorCode[ErrorCode["MATCHMAKE_NO_HANDLER"] = 4210] = "MATCHMAKE_NO_HANDLER";
    ErrorCode[ErrorCode["MATCHMAKE_INVALID_CRITERIA"] = 4211] = "MATCHMAKE_INVALID_CRITERIA";
    ErrorCode[ErrorCode["MATCHMAKE_INVALID_ROOM_ID"] = 4212] = "MATCHMAKE_INVALID_ROOM_ID";
    ErrorCode[ErrorCode["MATCHMAKE_UNHANDLED"] = 4213] = "MATCHMAKE_UNHANDLED";
    ErrorCode[ErrorCode["MATCHMAKE_EXPIRED"] = 4214] = "MATCHMAKE_EXPIRED";
    ErrorCode[ErrorCode["AUTH_FAILED"] = 4215] = "AUTH_FAILED";
    ErrorCode[ErrorCode["APPLICATION_ERROR"] = 4216] = "APPLICATION_ERROR";
  })(exports.ErrorCode || (exports.ErrorCode = {}));
})(Protocol$1);
var Serializer$1 = {};
const serializers = {};
function registerSerializer(id, serializer) {
  serializers[id] = serializer;
}
__name(registerSerializer, "registerSerializer");
function getSerializer(id) {
  const serializer = serializers[id];
  if (!serializer) {
    throw new Error("missing serializer: " + id);
  }
  return serializer;
}
__name(getSerializer, "getSerializer");
Serializer$1.getSerializer = getSerializer;
Serializer$1.registerSerializer = registerSerializer;
var nanoevents$2 = {};
const createNanoEvents = /* @__PURE__ */ __name(() => ({
  emit(event, ...args) {
    let callbacks = this.events[event] || [];
    for (let i = 0, length = callbacks.length; i < length; i++) {
      callbacks[i](...args);
    }
  },
  events: {},
  on(event, cb) {
    var _a3;
    ((_a3 = this.events[event]) === null || _a3 === void 0 ? void 0 : _a3.push(cb)) || (this.events[event] = [cb]);
    return () => {
      var _a4;
      this.events[event] = (_a4 = this.events[event]) === null || _a4 === void 0 ? void 0 : _a4.filter((i) => cb !== i);
    };
  }
}), "createNanoEvents");
nanoevents$2.createNanoEvents = createNanoEvents;
var signal$1 = {};
const _EventEmitter = class _EventEmitter {
  constructor() {
    this.handlers = [];
  }
  register(cb, once = false) {
    this.handlers.push(cb);
    return this;
  }
  invoke(...args) {
    this.handlers.forEach((handler) => handler.apply(this, args));
  }
  invokeAsync(...args) {
    return Promise.all(this.handlers.map((handler) => handler.apply(this, args)));
  }
  remove(cb) {
    const index = this.handlers.indexOf(cb);
    this.handlers[index] = this.handlers[this.handlers.length - 1];
    this.handlers.pop();
  }
  clear() {
    this.handlers = [];
  }
};
__name(_EventEmitter, "EventEmitter");
let EventEmitter = _EventEmitter;
function createSignal() {
  const emitter = new EventEmitter();
  function register(cb) {
    return emitter.register(cb, this === null);
  }
  __name(register, "register");
  register.once = (cb) => {
    const callback = /* @__PURE__ */ __name(function(...args) {
      cb.apply(this, args);
      emitter.remove(callback);
    }, "callback");
    emitter.register(callback);
  };
  register.remove = (cb) => emitter.remove(cb);
  register.invoke = (...args) => emitter.invoke(...args);
  register.invokeAsync = (...args) => emitter.invokeAsync(...args);
  register.clear = () => emitter.clear();
  return register;
}
__name(createSignal, "createSignal");
signal$1.EventEmitter = EventEmitter;
signal$1.createSignal = createSignal;
var SchemaSerializer$2 = {};
var schema$1 = umdExports$1;
function getStateCallbacks(room) {
  try {
    return schema$1.getDecoderStateCallbacks(room["serializer"].decoder);
  } catch (e) {
    return void 0;
  }
}
__name(getStateCallbacks, "getStateCallbacks");
let SchemaSerializer$1 = (_c = class {
  setState(encodedState, it) {
    this.decoder.decode(encodedState, it);
  }
  getState() {
    return this.state;
  }
  patch(patches, it) {
    return this.decoder.decode(patches, it);
  }
  teardown() {
    this.decoder.root.clearRefs();
  }
  handshake(bytes, it) {
    if (this.state) {
      schema$1.Reflection.decode(bytes, it);
      this.decoder = new schema$1.Decoder(this.state);
    } else {
      this.decoder = schema$1.Reflection.decode(bytes, it);
      this.state = this.decoder.state;
    }
  }
}, __name(_c, "SchemaSerializer"), _c);
SchemaSerializer$2.SchemaSerializer = SchemaSerializer$1;
SchemaSerializer$2.getStateCallbacks = getStateCallbacks;
var decoder;
try {
  decoder = new TextDecoder();
} catch (error) {
}
var src;
var srcEnd;
var position$1 = 0;
var currentUnpackr = {};
var currentStructures;
var srcString;
var srcStringStart = 0;
var srcStringEnd = 0;
var bundledStrings$1;
var referenceMap;
var currentExtensions = [];
var dataView;
var defaultOptions = {
  useRecords: false,
  mapsAsObjects: true
};
const _C1Type = class _C1Type {
};
__name(_C1Type, "C1Type");
let C1Type = _C1Type;
const C1 = new C1Type();
C1.name = "MessagePack 0xC1";
var sequentialMode = false;
var inlineObjectReadThreshold = 2;
var readStruct;
try {
  new Function("");
} catch (error) {
  inlineObjectReadThreshold = Infinity;
}
const _Unpackr = class _Unpackr {
  constructor(options) {
    if (options) {
      if (options.useRecords === false && options.mapsAsObjects === void 0)
        options.mapsAsObjects = true;
      if (options.sequential && options.trusted !== false) {
        options.trusted = true;
        if (!options.structures && options.useRecords != false) {
          options.structures = [];
          if (!options.maxSharedStructures)
            options.maxSharedStructures = 0;
        }
      }
      if (options.structures)
        options.structures.sharedLength = options.structures.length;
      else if (options.getStructures) {
        (options.structures = []).uninitialized = true;
        options.structures.sharedLength = 0;
      }
      if (options.int64AsNumber) {
        options.int64AsType = "number";
      }
    }
    Object.assign(this, options);
  }
  unpack(source, options) {
    if (src) {
      return saveState(() => {
        clearSource();
        return this ? this.unpack(source, options) : _Unpackr.prototype.unpack.call(defaultOptions, source, options);
      });
    }
    if (!source.buffer && source.constructor === ArrayBuffer)
      source = typeof Buffer !== "undefined" ? Buffer.from(source) : new Uint8Array(source);
    if (typeof options === "object") {
      srcEnd = options.end || source.length;
      position$1 = options.start || 0;
    } else {
      position$1 = 0;
      srcEnd = options > -1 ? options : source.length;
    }
    srcStringEnd = 0;
    srcString = null;
    bundledStrings$1 = null;
    src = source;
    try {
      dataView = source.dataView || (source.dataView = new DataView(source.buffer, source.byteOffset, source.byteLength));
    } catch (error) {
      src = null;
      if (source instanceof Uint8Array)
        throw error;
      throw new Error("Source must be a Uint8Array or Buffer but was a " + (source && typeof source == "object" ? source.constructor.name : typeof source));
    }
    if (this instanceof _Unpackr) {
      currentUnpackr = this;
      if (this.structures) {
        currentStructures = this.structures;
        return checkedRead(options);
      } else if (!currentStructures || currentStructures.length > 0) {
        currentStructures = [];
      }
    } else {
      currentUnpackr = defaultOptions;
      if (!currentStructures || currentStructures.length > 0)
        currentStructures = [];
    }
    return checkedRead(options);
  }
  unpackMultiple(source, forEach) {
    let values, lastPosition = 0;
    try {
      sequentialMode = true;
      let size = source.length;
      let value = this ? this.unpack(source, size) : defaultUnpackr.unpack(source, size);
      if (forEach) {
        if (forEach(value, lastPosition, position$1) === false) return;
        while (position$1 < size) {
          lastPosition = position$1;
          if (forEach(checkedRead(), lastPosition, position$1) === false) {
            return;
          }
        }
      } else {
        values = [value];
        while (position$1 < size) {
          lastPosition = position$1;
          values.push(checkedRead());
        }
        return values;
      }
    } catch (error) {
      error.lastPosition = lastPosition;
      error.values = values;
      throw error;
    } finally {
      sequentialMode = false;
      clearSource();
    }
  }
  _mergeStructures(loadedStructures, existingStructures) {
    loadedStructures = loadedStructures || [];
    if (Object.isFrozen(loadedStructures))
      loadedStructures = loadedStructures.map((structure) => structure.slice(0));
    for (let i = 0, l = loadedStructures.length; i < l; i++) {
      let structure = loadedStructures[i];
      if (structure) {
        structure.isShared = true;
        if (i >= 32)
          structure.highByte = i - 32 >> 5;
      }
    }
    loadedStructures.sharedLength = loadedStructures.length;
    for (let id in existingStructures || []) {
      if (id >= 0) {
        let structure = loadedStructures[id];
        let existing = existingStructures[id];
        if (existing) {
          if (structure)
            (loadedStructures.restoreStructures || (loadedStructures.restoreStructures = []))[id] = structure;
          loadedStructures[id] = existing;
        }
      }
    }
    return this.structures = loadedStructures;
  }
  decode(source, options) {
    return this.unpack(source, options);
  }
};
__name(_Unpackr, "Unpackr");
let Unpackr = _Unpackr;
function checkedRead(options) {
  try {
    if (!currentUnpackr.trusted && !sequentialMode) {
      let sharedLength = currentStructures.sharedLength || 0;
      if (sharedLength < currentStructures.length)
        currentStructures.length = sharedLength;
    }
    let result;
    if (currentUnpackr.randomAccessStructure && src[position$1] < 64 && src[position$1] >= 32 && readStruct) ;
    else
      result = read();
    if (bundledStrings$1) {
      position$1 = bundledStrings$1.postBundlePosition;
      bundledStrings$1 = null;
    }
    if (sequentialMode)
      currentStructures.restoreStructures = null;
    if (position$1 == srcEnd) {
      if (currentStructures && currentStructures.restoreStructures)
        restoreStructures();
      currentStructures = null;
      src = null;
      if (referenceMap)
        referenceMap = null;
    } else if (position$1 > srcEnd) {
      throw new Error("Unexpected end of MessagePack data");
    } else if (!sequentialMode) {
      let jsonView;
      try {
        jsonView = JSON.stringify(result, (_, value) => typeof value === "bigint" ? `${value}n` : value).slice(0, 100);
      } catch (error) {
        jsonView = "(JSON view not available " + error + ")";
      }
      throw new Error("Data read, but end of buffer not reached " + jsonView);
    }
    return result;
  } catch (error) {
    if (currentStructures && currentStructures.restoreStructures)
      restoreStructures();
    clearSource();
    if (error instanceof RangeError || error.message.startsWith("Unexpected end of buffer") || position$1 > srcEnd) {
      error.incomplete = true;
    }
    throw error;
  }
}
__name(checkedRead, "checkedRead");
function restoreStructures() {
  for (let id in currentStructures.restoreStructures) {
    currentStructures[id] = currentStructures.restoreStructures[id];
  }
  currentStructures.restoreStructures = null;
}
__name(restoreStructures, "restoreStructures");
function read() {
  let token = src[position$1++];
  if (token < 160) {
    if (token < 128) {
      if (token < 64)
        return token;
      else {
        let structure = currentStructures[token & 63] || currentUnpackr.getStructures && loadStructures()[token & 63];
        if (structure) {
          if (!structure.read) {
            structure.read = createStructureReader(structure, token & 63);
          }
          return structure.read();
        } else
          return token;
      }
    } else if (token < 144) {
      token -= 128;
      if (currentUnpackr.mapsAsObjects) {
        let object = {};
        for (let i = 0; i < token; i++) {
          let key = readKey();
          if (key === "__proto__")
            key = "__proto_";
          object[key] = read();
        }
        return object;
      } else {
        let map = /* @__PURE__ */ new Map();
        for (let i = 0; i < token; i++) {
          map.set(read(), read());
        }
        return map;
      }
    } else {
      token -= 144;
      let array = new Array(token);
      for (let i = 0; i < token; i++) {
        array[i] = read();
      }
      if (currentUnpackr.freezeData)
        return Object.freeze(array);
      return array;
    }
  } else if (token < 192) {
    let length = token - 160;
    if (srcStringEnd >= position$1) {
      return srcString.slice(position$1 - srcStringStart, (position$1 += length) - srcStringStart);
    }
    if (srcStringEnd == 0 && srcEnd < 140) {
      let string = length < 16 ? shortStringInJS(length) : longStringInJS(length);
      if (string != null)
        return string;
    }
    return readFixedString(length);
  } else {
    let value;
    switch (token) {
      case 192:
        return null;
      case 193:
        if (bundledStrings$1) {
          value = read();
          if (value > 0)
            return bundledStrings$1[1].slice(bundledStrings$1.position1, bundledStrings$1.position1 += value);
          else
            return bundledStrings$1[0].slice(bundledStrings$1.position0, bundledStrings$1.position0 -= value);
        }
        return C1;
      case 194:
        return false;
      case 195:
        return true;
      case 196:
        value = src[position$1++];
        if (value === void 0)
          throw new Error("Unexpected end of buffer");
        return readBin(value);
      case 197:
        value = dataView.getUint16(position$1);
        position$1 += 2;
        return readBin(value);
      case 198:
        value = dataView.getUint32(position$1);
        position$1 += 4;
        return readBin(value);
      case 199:
        return readExt(src[position$1++]);
      case 200:
        value = dataView.getUint16(position$1);
        position$1 += 2;
        return readExt(value);
      case 201:
        value = dataView.getUint32(position$1);
        position$1 += 4;
        return readExt(value);
      case 202:
        value = dataView.getFloat32(position$1);
        if (currentUnpackr.useFloat32 > 2) {
          let multiplier = mult10[(src[position$1] & 127) << 1 | src[position$1 + 1] >> 7];
          position$1 += 4;
          return (multiplier * value + (value > 0 ? 0.5 : -0.5) >> 0) / multiplier;
        }
        position$1 += 4;
        return value;
      case 203:
        value = dataView.getFloat64(position$1);
        position$1 += 8;
        return value;
      case 204:
        return src[position$1++];
      case 205:
        value = dataView.getUint16(position$1);
        position$1 += 2;
        return value;
      case 206:
        value = dataView.getUint32(position$1);
        position$1 += 4;
        return value;
      case 207:
        if (currentUnpackr.int64AsType === "number") {
          value = dataView.getUint32(position$1) * 4294967296;
          value += dataView.getUint32(position$1 + 4);
        } else if (currentUnpackr.int64AsType === "string") {
          value = dataView.getBigUint64(position$1).toString();
        } else if (currentUnpackr.int64AsType === "auto") {
          value = dataView.getBigUint64(position$1);
          if (value <= BigInt(2) << BigInt(52)) value = Number(value);
        } else
          value = dataView.getBigUint64(position$1);
        position$1 += 8;
        return value;
      case 208:
        return dataView.getInt8(position$1++);
      case 209:
        value = dataView.getInt16(position$1);
        position$1 += 2;
        return value;
      case 210:
        value = dataView.getInt32(position$1);
        position$1 += 4;
        return value;
      case 211:
        if (currentUnpackr.int64AsType === "number") {
          value = dataView.getInt32(position$1) * 4294967296;
          value += dataView.getUint32(position$1 + 4);
        } else if (currentUnpackr.int64AsType === "string") {
          value = dataView.getBigInt64(position$1).toString();
        } else if (currentUnpackr.int64AsType === "auto") {
          value = dataView.getBigInt64(position$1);
          if (value >= BigInt(-2) << BigInt(52) && value <= BigInt(2) << BigInt(52)) value = Number(value);
        } else
          value = dataView.getBigInt64(position$1);
        position$1 += 8;
        return value;
      case 212:
        value = src[position$1++];
        if (value == 114) {
          return recordDefinition(src[position$1++] & 63);
        } else {
          let extension = currentExtensions[value];
          if (extension) {
            if (extension.read) {
              position$1++;
              return extension.read(read());
            } else if (extension.noBuffer) {
              position$1++;
              return extension();
            } else
              return extension(src.subarray(position$1, ++position$1));
          } else
            throw new Error("Unknown extension " + value);
        }
      case 213:
        value = src[position$1];
        if (value == 114) {
          position$1++;
          return recordDefinition(src[position$1++] & 63, src[position$1++]);
        } else
          return readExt(2);
      case 214:
        return readExt(4);
      case 215:
        return readExt(8);
      case 216:
        return readExt(16);
      case 217:
        value = src[position$1++];
        if (srcStringEnd >= position$1) {
          return srcString.slice(position$1 - srcStringStart, (position$1 += value) - srcStringStart);
        }
        return readString8(value);
      case 218:
        value = dataView.getUint16(position$1);
        position$1 += 2;
        if (srcStringEnd >= position$1) {
          return srcString.slice(position$1 - srcStringStart, (position$1 += value) - srcStringStart);
        }
        return readString16(value);
      case 219:
        value = dataView.getUint32(position$1);
        position$1 += 4;
        if (srcStringEnd >= position$1) {
          return srcString.slice(position$1 - srcStringStart, (position$1 += value) - srcStringStart);
        }
        return readString32(value);
      case 220:
        value = dataView.getUint16(position$1);
        position$1 += 2;
        return readArray(value);
      case 221:
        value = dataView.getUint32(position$1);
        position$1 += 4;
        return readArray(value);
      case 222:
        value = dataView.getUint16(position$1);
        position$1 += 2;
        return readMap(value);
      case 223:
        value = dataView.getUint32(position$1);
        position$1 += 4;
        return readMap(value);
      default:
        if (token >= 224)
          return token - 256;
        if (token === void 0) {
          let error = new Error("Unexpected end of MessagePack data");
          error.incomplete = true;
          throw error;
        }
        throw new Error("Unknown MessagePack token " + token);
    }
  }
}
__name(read, "read");
const validName = /^[a-zA-Z_$][a-zA-Z\d_$]*$/;
function createStructureReader(structure, firstId) {
  function readObject() {
    if (readObject.count++ > inlineObjectReadThreshold) {
      let readObject2 = structure.read = new Function("r", "return function(){return " + (currentUnpackr.freezeData ? "Object.freeze" : "") + "({" + structure.map((key) => key === "__proto__" ? "__proto_:r()" : validName.test(key) ? key + ":r()" : "[" + JSON.stringify(key) + "]:r()").join(",") + "})}")(read);
      if (structure.highByte === 0)
        structure.read = createSecondByteReader(firstId, structure.read);
      return readObject2();
    }
    let object = {};
    for (let i = 0, l = structure.length; i < l; i++) {
      let key = structure[i];
      if (key === "__proto__")
        key = "__proto_";
      object[key] = read();
    }
    if (currentUnpackr.freezeData)
      return Object.freeze(object);
    return object;
  }
  __name(readObject, "readObject");
  readObject.count = 0;
  if (structure.highByte === 0) {
    return createSecondByteReader(firstId, readObject);
  }
  return readObject;
}
__name(createStructureReader, "createStructureReader");
const createSecondByteReader = /* @__PURE__ */ __name((firstId, read0) => {
  return function() {
    let highByte = src[position$1++];
    if (highByte === 0)
      return read0();
    let id = firstId < 32 ? -(firstId + (highByte << 5)) : firstId + (highByte << 5);
    let structure = currentStructures[id] || loadStructures()[id];
    if (!structure) {
      throw new Error("Record id is not defined for " + id);
    }
    if (!structure.read)
      structure.read = createStructureReader(structure, firstId);
    return structure.read();
  };
}, "createSecondByteReader");
function loadStructures() {
  let loadedStructures = saveState(() => {
    src = null;
    return currentUnpackr.getStructures();
  });
  return currentStructures = currentUnpackr._mergeStructures(loadedStructures, currentStructures);
}
__name(loadStructures, "loadStructures");
var readFixedString = readStringJS;
var readString8 = readStringJS;
var readString16 = readStringJS;
var readString32 = readStringJS;
let isNativeAccelerationEnabled = false;
function readStringJS(length) {
  let result;
  if (length < 16) {
    if (result = shortStringInJS(length))
      return result;
  }
  if (length > 64 && decoder)
    return decoder.decode(src.subarray(position$1, position$1 += length));
  const end = position$1 + length;
  const units = [];
  result = "";
  while (position$1 < end) {
    const byte1 = src[position$1++];
    if ((byte1 & 128) === 0) {
      units.push(byte1);
    } else if ((byte1 & 224) === 192) {
      const byte2 = src[position$1++] & 63;
      units.push((byte1 & 31) << 6 | byte2);
    } else if ((byte1 & 240) === 224) {
      const byte2 = src[position$1++] & 63;
      const byte3 = src[position$1++] & 63;
      units.push((byte1 & 31) << 12 | byte2 << 6 | byte3);
    } else if ((byte1 & 248) === 240) {
      const byte2 = src[position$1++] & 63;
      const byte3 = src[position$1++] & 63;
      const byte4 = src[position$1++] & 63;
      let unit = (byte1 & 7) << 18 | byte2 << 12 | byte3 << 6 | byte4;
      if (unit > 65535) {
        unit -= 65536;
        units.push(unit >>> 10 & 1023 | 55296);
        unit = 56320 | unit & 1023;
      }
      units.push(unit);
    } else {
      units.push(byte1);
    }
    if (units.length >= 4096) {
      result += fromCharCode.apply(String, units);
      units.length = 0;
    }
  }
  if (units.length > 0) {
    result += fromCharCode.apply(String, units);
  }
  return result;
}
__name(readStringJS, "readStringJS");
function readArray(length) {
  let array = new Array(length);
  for (let i = 0; i < length; i++) {
    array[i] = read();
  }
  if (currentUnpackr.freezeData)
    return Object.freeze(array);
  return array;
}
__name(readArray, "readArray");
function readMap(length) {
  if (currentUnpackr.mapsAsObjects) {
    let object = {};
    for (let i = 0; i < length; i++) {
      let key = readKey();
      if (key === "__proto__")
        key = "__proto_";
      object[key] = read();
    }
    return object;
  } else {
    let map = /* @__PURE__ */ new Map();
    for (let i = 0; i < length; i++) {
      map.set(read(), read());
    }
    return map;
  }
}
__name(readMap, "readMap");
var fromCharCode = String.fromCharCode;
function longStringInJS(length) {
  let start = position$1;
  let bytes = new Array(length);
  for (let i = 0; i < length; i++) {
    const byte = src[position$1++];
    if ((byte & 128) > 0) {
      position$1 = start;
      return;
    }
    bytes[i] = byte;
  }
  return fromCharCode.apply(String, bytes);
}
__name(longStringInJS, "longStringInJS");
function shortStringInJS(length) {
  if (length < 4) {
    if (length < 2) {
      if (length === 0)
        return "";
      else {
        let a = src[position$1++];
        if ((a & 128) > 1) {
          position$1 -= 1;
          return;
        }
        return fromCharCode(a);
      }
    } else {
      let a = src[position$1++];
      let b = src[position$1++];
      if ((a & 128) > 0 || (b & 128) > 0) {
        position$1 -= 2;
        return;
      }
      if (length < 3)
        return fromCharCode(a, b);
      let c = src[position$1++];
      if ((c & 128) > 0) {
        position$1 -= 3;
        return;
      }
      return fromCharCode(a, b, c);
    }
  } else {
    let a = src[position$1++];
    let b = src[position$1++];
    let c = src[position$1++];
    let d = src[position$1++];
    if ((a & 128) > 0 || (b & 128) > 0 || (c & 128) > 0 || (d & 128) > 0) {
      position$1 -= 4;
      return;
    }
    if (length < 6) {
      if (length === 4)
        return fromCharCode(a, b, c, d);
      else {
        let e = src[position$1++];
        if ((e & 128) > 0) {
          position$1 -= 5;
          return;
        }
        return fromCharCode(a, b, c, d, e);
      }
    } else if (length < 8) {
      let e = src[position$1++];
      let f = src[position$1++];
      if ((e & 128) > 0 || (f & 128) > 0) {
        position$1 -= 6;
        return;
      }
      if (length < 7)
        return fromCharCode(a, b, c, d, e, f);
      let g = src[position$1++];
      if ((g & 128) > 0) {
        position$1 -= 7;
        return;
      }
      return fromCharCode(a, b, c, d, e, f, g);
    } else {
      let e = src[position$1++];
      let f = src[position$1++];
      let g = src[position$1++];
      let h = src[position$1++];
      if ((e & 128) > 0 || (f & 128) > 0 || (g & 128) > 0 || (h & 128) > 0) {
        position$1 -= 8;
        return;
      }
      if (length < 10) {
        if (length === 8)
          return fromCharCode(a, b, c, d, e, f, g, h);
        else {
          let i = src[position$1++];
          if ((i & 128) > 0) {
            position$1 -= 9;
            return;
          }
          return fromCharCode(a, b, c, d, e, f, g, h, i);
        }
      } else if (length < 12) {
        let i = src[position$1++];
        let j = src[position$1++];
        if ((i & 128) > 0 || (j & 128) > 0) {
          position$1 -= 10;
          return;
        }
        if (length < 11)
          return fromCharCode(a, b, c, d, e, f, g, h, i, j);
        let k = src[position$1++];
        if ((k & 128) > 0) {
          position$1 -= 11;
          return;
        }
        return fromCharCode(a, b, c, d, e, f, g, h, i, j, k);
      } else {
        let i = src[position$1++];
        let j = src[position$1++];
        let k = src[position$1++];
        let l = src[position$1++];
        if ((i & 128) > 0 || (j & 128) > 0 || (k & 128) > 0 || (l & 128) > 0) {
          position$1 -= 12;
          return;
        }
        if (length < 14) {
          if (length === 12)
            return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l);
          else {
            let m = src[position$1++];
            if ((m & 128) > 0) {
              position$1 -= 13;
              return;
            }
            return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m);
          }
        } else {
          let m = src[position$1++];
          let n = src[position$1++];
          if ((m & 128) > 0 || (n & 128) > 0) {
            position$1 -= 14;
            return;
          }
          if (length < 15)
            return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n);
          let o = src[position$1++];
          if ((o & 128) > 0) {
            position$1 -= 15;
            return;
          }
          return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o);
        }
      }
    }
  }
}
__name(shortStringInJS, "shortStringInJS");
function readOnlyJSString() {
  let token = src[position$1++];
  let length;
  if (token < 192) {
    length = token - 160;
  } else {
    switch (token) {
      case 217:
        length = src[position$1++];
        break;
      case 218:
        length = dataView.getUint16(position$1);
        position$1 += 2;
        break;
      case 219:
        length = dataView.getUint32(position$1);
        position$1 += 4;
        break;
      default:
        throw new Error("Expected string");
    }
  }
  return readStringJS(length);
}
__name(readOnlyJSString, "readOnlyJSString");
function readBin(length) {
  return currentUnpackr.copyBuffers ? (
    // specifically use the copying slice (not the node one)
    Uint8Array.prototype.slice.call(src, position$1, position$1 += length)
  ) : src.subarray(position$1, position$1 += length);
}
__name(readBin, "readBin");
function readExt(length) {
  let type = src[position$1++];
  if (currentExtensions[type]) {
    let end;
    return currentExtensions[type](src.subarray(position$1, end = position$1 += length), (readPosition) => {
      position$1 = readPosition;
      try {
        return read();
      } finally {
        position$1 = end;
      }
    });
  } else
    throw new Error("Unknown extension type " + type);
}
__name(readExt, "readExt");
var keyCache = new Array(4096);
function readKey() {
  let length = src[position$1++];
  if (length >= 160 && length < 192) {
    length = length - 160;
    if (srcStringEnd >= position$1)
      return srcString.slice(position$1 - srcStringStart, (position$1 += length) - srcStringStart);
    else if (!(srcStringEnd == 0 && srcEnd < 180))
      return readFixedString(length);
  } else {
    position$1--;
    return asSafeString(read());
  }
  let key = (length << 5 ^ (length > 1 ? dataView.getUint16(position$1) : length > 0 ? src[position$1] : 0)) & 4095;
  let entry = keyCache[key];
  let checkPosition = position$1;
  let end = position$1 + length - 3;
  let chunk;
  let i = 0;
  if (entry && entry.bytes == length) {
    while (checkPosition < end) {
      chunk = dataView.getUint32(checkPosition);
      if (chunk != entry[i++]) {
        checkPosition = 1879048192;
        break;
      }
      checkPosition += 4;
    }
    end += 3;
    while (checkPosition < end) {
      chunk = src[checkPosition++];
      if (chunk != entry[i++]) {
        checkPosition = 1879048192;
        break;
      }
    }
    if (checkPosition === end) {
      position$1 = checkPosition;
      return entry.string;
    }
    end -= 3;
    checkPosition = position$1;
  }
  entry = [];
  keyCache[key] = entry;
  entry.bytes = length;
  while (checkPosition < end) {
    chunk = dataView.getUint32(checkPosition);
    entry.push(chunk);
    checkPosition += 4;
  }
  end += 3;
  while (checkPosition < end) {
    chunk = src[checkPosition++];
    entry.push(chunk);
  }
  let string = length < 16 ? shortStringInJS(length) : longStringInJS(length);
  if (string != null)
    return entry.string = string;
  return entry.string = readFixedString(length);
}
__name(readKey, "readKey");
function asSafeString(property) {
  if (typeof property === "string") return property;
  if (typeof property === "number" || typeof property === "boolean" || typeof property === "bigint") return property.toString();
  if (property == null) return property + "";
  if (currentUnpackr.allowArraysInMapKeys && Array.isArray(property) && property.flat().every((item) => ["string", "number", "boolean", "bigint"].includes(typeof item))) {
    return property.flat().toString();
  }
  throw new Error(`Invalid property type for record: ${typeof property}`);
}
__name(asSafeString, "asSafeString");
const recordDefinition = /* @__PURE__ */ __name((id, highByte) => {
  let structure = read().map(asSafeString);
  let firstByte = id;
  if (highByte !== void 0) {
    id = id < 32 ? -((highByte << 5) + id) : (highByte << 5) + id;
    structure.highByte = highByte;
  }
  let existingStructure = currentStructures[id];
  if (existingStructure && (existingStructure.isShared || sequentialMode)) {
    (currentStructures.restoreStructures || (currentStructures.restoreStructures = []))[id] = existingStructure;
  }
  currentStructures[id] = structure;
  structure.read = createStructureReader(structure, firstByte);
  return structure.read();
}, "recordDefinition");
currentExtensions[0] = () => {
};
currentExtensions[0].noBuffer = true;
currentExtensions[66] = (data) => {
  let length = data.length;
  let value = BigInt(data[0] & 128 ? data[0] - 256 : data[0]);
  for (let i = 1; i < length; i++) {
    value <<= BigInt(8);
    value += BigInt(data[i]);
  }
  return value;
};
let errors = { Error, TypeError, ReferenceError };
currentExtensions[101] = () => {
  let data = read();
  return (errors[data[0]] || Error)(data[1], { cause: data[2] });
};
currentExtensions[105] = (data) => {
  if (currentUnpackr.structuredClone === false) throw new Error("Structured clone extension is disabled");
  let id = dataView.getUint32(position$1 - 4);
  if (!referenceMap)
    referenceMap = /* @__PURE__ */ new Map();
  let token = src[position$1];
  let target2;
  if (token >= 144 && token < 160 || token == 220 || token == 221)
    target2 = [];
  else
    target2 = {};
  let refEntry = { target: target2 };
  referenceMap.set(id, refEntry);
  let targetProperties = read();
  if (refEntry.used)
    return Object.assign(target2, targetProperties);
  refEntry.target = targetProperties;
  return targetProperties;
};
currentExtensions[112] = (data) => {
  if (currentUnpackr.structuredClone === false) throw new Error("Structured clone extension is disabled");
  let id = dataView.getUint32(position$1 - 4);
  let refEntry = referenceMap.get(id);
  refEntry.used = true;
  return refEntry.target;
};
currentExtensions[115] = () => new Set(read());
const typedArrays = ["Int8", "Uint8", "Uint8Clamped", "Int16", "Uint16", "Int32", "Uint32", "Float32", "Float64", "BigInt64", "BigUint64"].map((type) => type + "Array");
let glbl = typeof globalThis === "object" ? globalThis : window;
currentExtensions[116] = (data) => {
  let typeCode = data[0];
  let typedArrayName = typedArrays[typeCode];
  if (!typedArrayName) {
    if (typeCode === 16) {
      let ab = new ArrayBuffer(data.length - 1);
      let u8 = new Uint8Array(ab);
      u8.set(data.subarray(1));
      return ab;
    }
    throw new Error("Could not find typed array for code " + typeCode);
  }
  return new glbl[typedArrayName](Uint8Array.prototype.slice.call(data, 1).buffer);
};
currentExtensions[120] = () => {
  let data = read();
  return new RegExp(data[0], data[1]);
};
const TEMP_BUNDLE = [];
currentExtensions[98] = (data) => {
  let dataSize = (data[0] << 24) + (data[1] << 16) + (data[2] << 8) + data[3];
  let dataPosition = position$1;
  position$1 += dataSize - data.length;
  bundledStrings$1 = TEMP_BUNDLE;
  bundledStrings$1 = [readOnlyJSString(), readOnlyJSString()];
  bundledStrings$1.position0 = 0;
  bundledStrings$1.position1 = 0;
  bundledStrings$1.postBundlePosition = position$1;
  position$1 = dataPosition;
  return read();
};
currentExtensions[255] = (data) => {
  if (data.length == 4)
    return new Date((data[0] * 16777216 + (data[1] << 16) + (data[2] << 8) + data[3]) * 1e3);
  else if (data.length == 8)
    return new Date(
      ((data[0] << 22) + (data[1] << 14) + (data[2] << 6) + (data[3] >> 2)) / 1e6 + ((data[3] & 3) * 4294967296 + data[4] * 16777216 + (data[5] << 16) + (data[6] << 8) + data[7]) * 1e3
    );
  else if (data.length == 12)
    return new Date(
      ((data[0] << 24) + (data[1] << 16) + (data[2] << 8) + data[3]) / 1e6 + ((data[4] & 128 ? -281474976710656 : 0) + data[6] * 1099511627776 + data[7] * 4294967296 + data[8] * 16777216 + (data[9] << 16) + (data[10] << 8) + data[11]) * 1e3
    );
  else
    return /* @__PURE__ */ new Date("invalid");
};
function saveState(callback) {
  let savedSrcEnd = srcEnd;
  let savedPosition = position$1;
  let savedSrcStringStart = srcStringStart;
  let savedSrcStringEnd = srcStringEnd;
  let savedSrcString = srcString;
  let savedReferenceMap = referenceMap;
  let savedBundledStrings = bundledStrings$1;
  let savedSrc = new Uint8Array(src.slice(0, srcEnd));
  let savedStructures = currentStructures;
  let savedStructuresContents = currentStructures.slice(0, currentStructures.length);
  let savedPackr = currentUnpackr;
  let savedSequentialMode = sequentialMode;
  let value = callback();
  srcEnd = savedSrcEnd;
  position$1 = savedPosition;
  srcStringStart = savedSrcStringStart;
  srcStringEnd = savedSrcStringEnd;
  srcString = savedSrcString;
  referenceMap = savedReferenceMap;
  bundledStrings$1 = savedBundledStrings;
  src = savedSrc;
  sequentialMode = savedSequentialMode;
  currentStructures = savedStructures;
  currentStructures.splice(0, currentStructures.length, ...savedStructuresContents);
  currentUnpackr = savedPackr;
  dataView = new DataView(src.buffer, src.byteOffset, src.byteLength);
  return value;
}
__name(saveState, "saveState");
function clearSource() {
  src = null;
  referenceMap = null;
  currentStructures = null;
}
__name(clearSource, "clearSource");
function addExtension$1(extension) {
  if (extension.unpack)
    currentExtensions[extension.type] = extension.unpack;
  else
    currentExtensions[extension.type] = extension;
}
__name(addExtension$1, "addExtension$1");
const mult10 = new Array(147);
for (let i = 0; i < 256; i++) {
  mult10[i] = +("1e" + Math.floor(45.15 - i * 0.30103));
}
const Decoder = Unpackr;
var defaultUnpackr = new Unpackr({ useRecords: false });
const unpack = defaultUnpackr.unpack;
const unpackMultiple = defaultUnpackr.unpackMultiple;
const decode = defaultUnpackr.unpack;
const FLOAT32_OPTIONS = {
  NEVER: 0,
  ALWAYS: 1,
  DECIMAL_ROUND: 3,
  DECIMAL_FIT: 4
};
let f32Array = new Float32Array(1);
let u8Array = new Uint8Array(f32Array.buffer, 0, 4);
function roundFloat32(float32Number) {
  f32Array[0] = float32Number;
  let multiplier = mult10[(u8Array[3] & 127) << 1 | u8Array[2] >> 7];
  return (multiplier * float32Number + (float32Number > 0 ? 0.5 : -0.5) >> 0) / multiplier;
}
__name(roundFloat32, "roundFloat32");
let textEncoder;
try {
  textEncoder = new TextEncoder();
} catch (error) {
}
let extensions, extensionClasses;
const hasNodeBuffer = typeof Buffer !== "undefined";
const ByteArrayAllocate = hasNodeBuffer ? function(length) {
  return Buffer.allocUnsafeSlow(length);
} : Uint8Array;
const ByteArray = hasNodeBuffer ? Buffer : Uint8Array;
const MAX_BUFFER_SIZE = hasNodeBuffer ? 4294967296 : 2144337920;
let target, keysTarget;
let targetView;
let position = 0;
let safeEnd;
let bundledStrings = null;
let writeStructSlots;
const MAX_BUNDLE_SIZE = 21760;
const hasNonLatin = /[\u0080-\uFFFF]/;
const RECORD_SYMBOL = Symbol("record-id");
const _Packr = class _Packr extends Unpackr {
  constructor(options) {
    super(options);
    this.offset = 0;
    let start;
    let hasSharedUpdate;
    let structures;
    let referenceMap2;
    let encodeUtf8 = ByteArray.prototype.utf8Write ? function(string, position2) {
      return target.utf8Write(string, position2, target.byteLength - position2);
    } : textEncoder && textEncoder.encodeInto ? function(string, position2) {
      return textEncoder.encodeInto(string, target.subarray(position2)).written;
    } : false;
    let packr = this;
    if (!options)
      options = {};
    let isSequential = options && options.sequential;
    let hasSharedStructures = options.structures || options.saveStructures;
    let maxSharedStructures = options.maxSharedStructures;
    if (maxSharedStructures == null)
      maxSharedStructures = hasSharedStructures ? 32 : 0;
    if (maxSharedStructures > 8160)
      throw new Error("Maximum maxSharedStructure is 8160");
    if (options.structuredClone && options.moreTypes == void 0) {
      this.moreTypes = true;
    }
    let maxOwnStructures = options.maxOwnStructures;
    if (maxOwnStructures == null)
      maxOwnStructures = hasSharedStructures ? 32 : 64;
    if (!this.structures && options.useRecords != false)
      this.structures = [];
    let useTwoByteRecords = maxSharedStructures > 32 || maxOwnStructures + maxSharedStructures > 64;
    let sharedLimitId = maxSharedStructures + 64;
    let maxStructureId = maxSharedStructures + maxOwnStructures + 64;
    if (maxStructureId > 8256) {
      throw new Error("Maximum maxSharedStructure + maxOwnStructure is 8192");
    }
    let recordIdsToRemove = [];
    let transitionsCount = 0;
    let serializationsSinceTransitionRebuild = 0;
    this.pack = this.encode = function(value, encodeOptions) {
      if (!target) {
        target = new ByteArrayAllocate(8192);
        targetView = target.dataView || (target.dataView = new DataView(target.buffer, 0, 8192));
        position = 0;
      }
      safeEnd = target.length - 10;
      if (safeEnd - position < 2048) {
        target = new ByteArrayAllocate(target.length);
        targetView = target.dataView || (target.dataView = new DataView(target.buffer, 0, target.length));
        safeEnd = target.length - 10;
        position = 0;
      } else
        position = position + 7 & 2147483640;
      start = position;
      if (encodeOptions & RESERVE_START_SPACE) position += encodeOptions & 255;
      referenceMap2 = packr.structuredClone ? /* @__PURE__ */ new Map() : null;
      if (packr.bundleStrings && typeof value !== "string") {
        bundledStrings = [];
        bundledStrings.size = Infinity;
      } else
        bundledStrings = null;
      structures = packr.structures;
      if (structures) {
        if (structures.uninitialized)
          structures = packr._mergeStructures(packr.getStructures());
        let sharedLength = structures.sharedLength || 0;
        if (sharedLength > maxSharedStructures) {
          throw new Error("Shared structures is larger than maximum shared structures, try increasing maxSharedStructures to " + structures.sharedLength);
        }
        if (!structures.transitions) {
          structures.transitions = /* @__PURE__ */ Object.create(null);
          for (let i = 0; i < sharedLength; i++) {
            let keys = structures[i];
            if (!keys)
              continue;
            let nextTransition, transition = structures.transitions;
            for (let j = 0, l = keys.length; j < l; j++) {
              let key = keys[j];
              nextTransition = transition[key];
              if (!nextTransition) {
                nextTransition = transition[key] = /* @__PURE__ */ Object.create(null);
              }
              transition = nextTransition;
            }
            transition[RECORD_SYMBOL] = i + 64;
          }
          this.lastNamedStructuresLength = sharedLength;
        }
        if (!isSequential) {
          structures.nextId = sharedLength + 64;
        }
      }
      if (hasSharedUpdate)
        hasSharedUpdate = false;
      let encodingError;
      try {
        if (packr.randomAccessStructure && value && value.constructor && value.constructor === Object)
          writeStruct(value);
        else
          pack2(value);
        let lastBundle = bundledStrings;
        if (bundledStrings)
          writeBundles(start, pack2, 0);
        if (referenceMap2 && referenceMap2.idsToInsert) {
          let idsToInsert = referenceMap2.idsToInsert.sort((a, b) => a.offset > b.offset ? 1 : -1);
          let i = idsToInsert.length;
          let incrementPosition = -1;
          while (lastBundle && i > 0) {
            let insertionPoint = idsToInsert[--i].offset + start;
            if (insertionPoint < lastBundle.stringsPosition + start && incrementPosition === -1)
              incrementPosition = 0;
            if (insertionPoint > lastBundle.position + start) {
              if (incrementPosition >= 0)
                incrementPosition += 6;
            } else {
              if (incrementPosition >= 0) {
                targetView.setUint32(
                  lastBundle.position + start,
                  targetView.getUint32(lastBundle.position + start) + incrementPosition
                );
                incrementPosition = -1;
              }
              lastBundle = lastBundle.previous;
              i++;
            }
          }
          if (incrementPosition >= 0 && lastBundle) {
            targetView.setUint32(
              lastBundle.position + start,
              targetView.getUint32(lastBundle.position + start) + incrementPosition
            );
          }
          position += idsToInsert.length * 6;
          if (position > safeEnd)
            makeRoom(position);
          packr.offset = position;
          let serialized = insertIds(target.subarray(start, position), idsToInsert);
          referenceMap2 = null;
          return serialized;
        }
        packr.offset = position;
        if (encodeOptions & REUSE_BUFFER_MODE) {
          target.start = start;
          target.end = position;
          return target;
        }
        return target.subarray(start, position);
      } catch (error) {
        encodingError = error;
        throw error;
      } finally {
        if (structures) {
          resetStructures();
          if (hasSharedUpdate && packr.saveStructures) {
            let sharedLength = structures.sharedLength || 0;
            let returnBuffer = target.subarray(start, position);
            let newSharedData = prepareStructures(structures, packr);
            if (!encodingError) {
              if (packr.saveStructures(newSharedData, newSharedData.isCompatible) === false) {
                return packr.pack(value, encodeOptions);
              }
              packr.lastNamedStructuresLength = sharedLength;
              if (target.length > 1073741824) target = null;
              return returnBuffer;
            }
          }
        }
        if (target.length > 1073741824) target = null;
        if (encodeOptions & RESET_BUFFER_MODE)
          position = start;
      }
    };
    const resetStructures = /* @__PURE__ */ __name(() => {
      if (serializationsSinceTransitionRebuild < 10)
        serializationsSinceTransitionRebuild++;
      let sharedLength = structures.sharedLength || 0;
      if (structures.length > sharedLength && !isSequential)
        structures.length = sharedLength;
      if (transitionsCount > 1e4) {
        structures.transitions = null;
        serializationsSinceTransitionRebuild = 0;
        transitionsCount = 0;
        if (recordIdsToRemove.length > 0)
          recordIdsToRemove = [];
      } else if (recordIdsToRemove.length > 0 && !isSequential) {
        for (let i = 0, l = recordIdsToRemove.length; i < l; i++) {
          recordIdsToRemove[i][RECORD_SYMBOL] = 0;
        }
        recordIdsToRemove = [];
      }
    }, "resetStructures");
    const packArray = /* @__PURE__ */ __name((value) => {
      var length = value.length;
      if (length < 16) {
        target[position++] = 144 | length;
      } else if (length < 65536) {
        target[position++] = 220;
        target[position++] = length >> 8;
        target[position++] = length & 255;
      } else {
        target[position++] = 221;
        targetView.setUint32(position, length);
        position += 4;
      }
      for (let i = 0; i < length; i++) {
        pack2(value[i]);
      }
    }, "packArray");
    const pack2 = /* @__PURE__ */ __name((value) => {
      if (position > safeEnd)
        target = makeRoom(position);
      var type = typeof value;
      var length;
      if (type === "string") {
        let strLength = value.length;
        if (bundledStrings && strLength >= 4 && strLength < 4096) {
          if ((bundledStrings.size += strLength) > MAX_BUNDLE_SIZE) {
            let extStart;
            let maxBytes2 = (bundledStrings[0] ? bundledStrings[0].length * 3 + bundledStrings[1].length : 0) + 10;
            if (position + maxBytes2 > safeEnd)
              target = makeRoom(position + maxBytes2);
            let lastBundle;
            if (bundledStrings.position) {
              lastBundle = bundledStrings;
              target[position] = 200;
              position += 3;
              target[position++] = 98;
              extStart = position - start;
              position += 4;
              writeBundles(start, pack2, 0);
              targetView.setUint16(extStart + start - 3, position - start - extStart);
            } else {
              target[position++] = 214;
              target[position++] = 98;
              extStart = position - start;
              position += 4;
            }
            bundledStrings = ["", ""];
            bundledStrings.previous = lastBundle;
            bundledStrings.size = 0;
            bundledStrings.position = extStart;
          }
          let twoByte = hasNonLatin.test(value);
          bundledStrings[twoByte ? 0 : 1] += value;
          target[position++] = 193;
          pack2(twoByte ? -strLength : strLength);
          return;
        }
        let headerSize;
        if (strLength < 32) {
          headerSize = 1;
        } else if (strLength < 256) {
          headerSize = 2;
        } else if (strLength < 65536) {
          headerSize = 3;
        } else {
          headerSize = 5;
        }
        let maxBytes = strLength * 3;
        if (position + maxBytes > safeEnd)
          target = makeRoom(position + maxBytes);
        if (strLength < 64 || !encodeUtf8) {
          let i, c1, c2, strPosition = position + headerSize;
          for (i = 0; i < strLength; i++) {
            c1 = value.charCodeAt(i);
            if (c1 < 128) {
              target[strPosition++] = c1;
            } else if (c1 < 2048) {
              target[strPosition++] = c1 >> 6 | 192;
              target[strPosition++] = c1 & 63 | 128;
            } else if ((c1 & 64512) === 55296 && ((c2 = value.charCodeAt(i + 1)) & 64512) === 56320) {
              c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
              i++;
              target[strPosition++] = c1 >> 18 | 240;
              target[strPosition++] = c1 >> 12 & 63 | 128;
              target[strPosition++] = c1 >> 6 & 63 | 128;
              target[strPosition++] = c1 & 63 | 128;
            } else {
              target[strPosition++] = c1 >> 12 | 224;
              target[strPosition++] = c1 >> 6 & 63 | 128;
              target[strPosition++] = c1 & 63 | 128;
            }
          }
          length = strPosition - position - headerSize;
        } else {
          length = encodeUtf8(value, position + headerSize);
        }
        if (length < 32) {
          target[position++] = 160 | length;
        } else if (length < 256) {
          if (headerSize < 2) {
            target.copyWithin(position + 2, position + 1, position + 1 + length);
          }
          target[position++] = 217;
          target[position++] = length;
        } else if (length < 65536) {
          if (headerSize < 3) {
            target.copyWithin(position + 3, position + 2, position + 2 + length);
          }
          target[position++] = 218;
          target[position++] = length >> 8;
          target[position++] = length & 255;
        } else {
          if (headerSize < 5) {
            target.copyWithin(position + 5, position + 3, position + 3 + length);
          }
          target[position++] = 219;
          targetView.setUint32(position, length);
          position += 4;
        }
        position += length;
      } else if (type === "number") {
        if (value >>> 0 === value) {
          if (value < 32 || value < 128 && this.useRecords === false || value < 64 && !this.randomAccessStructure) {
            target[position++] = value;
          } else if (value < 256) {
            target[position++] = 204;
            target[position++] = value;
          } else if (value < 65536) {
            target[position++] = 205;
            target[position++] = value >> 8;
            target[position++] = value & 255;
          } else {
            target[position++] = 206;
            targetView.setUint32(position, value);
            position += 4;
          }
        } else if (value >> 0 === value) {
          if (value >= -32) {
            target[position++] = 256 + value;
          } else if (value >= -128) {
            target[position++] = 208;
            target[position++] = value + 256;
          } else if (value >= -32768) {
            target[position++] = 209;
            targetView.setInt16(position, value);
            position += 2;
          } else {
            target[position++] = 210;
            targetView.setInt32(position, value);
            position += 4;
          }
        } else {
          let useFloat32;
          if ((useFloat32 = this.useFloat32) > 0 && value < 4294967296 && value >= -2147483648) {
            target[position++] = 202;
            targetView.setFloat32(position, value);
            let xShifted;
            if (useFloat32 < 4 || // this checks for rounding of numbers that were encoded in 32-bit float to nearest significant decimal digit that could be preserved
            (xShifted = value * mult10[(target[position] & 127) << 1 | target[position + 1] >> 7]) >> 0 === xShifted) {
              position += 4;
              return;
            } else
              position--;
          }
          target[position++] = 203;
          targetView.setFloat64(position, value);
          position += 8;
        }
      } else if (type === "object" || type === "function") {
        if (!value)
          target[position++] = 192;
        else {
          if (referenceMap2) {
            let referee = referenceMap2.get(value);
            if (referee) {
              if (!referee.id) {
                let idsToInsert = referenceMap2.idsToInsert || (referenceMap2.idsToInsert = []);
                referee.id = idsToInsert.push(referee);
              }
              target[position++] = 214;
              target[position++] = 112;
              targetView.setUint32(position, referee.id);
              position += 4;
              return;
            } else
              referenceMap2.set(value, { offset: position - start });
          }
          let constructor = value.constructor;
          if (constructor === Object) {
            writeObject(value);
          } else if (constructor === Array) {
            packArray(value);
          } else if (constructor === Map) {
            if (this.mapAsEmptyObject) target[position++] = 128;
            else {
              length = value.size;
              if (length < 16) {
                target[position++] = 128 | length;
              } else if (length < 65536) {
                target[position++] = 222;
                target[position++] = length >> 8;
                target[position++] = length & 255;
              } else {
                target[position++] = 223;
                targetView.setUint32(position, length);
                position += 4;
              }
              for (let [key, entryValue] of value) {
                pack2(key);
                pack2(entryValue);
              }
            }
          } else {
            for (let i = 0, l = extensions.length; i < l; i++) {
              let extensionClass = extensionClasses[i];
              if (value instanceof extensionClass) {
                let extension = extensions[i];
                if (extension.write) {
                  if (extension.type) {
                    target[position++] = 212;
                    target[position++] = extension.type;
                    target[position++] = 0;
                  }
                  let writeResult = extension.write.call(this, value);
                  if (writeResult === value) {
                    if (Array.isArray(value)) {
                      packArray(value);
                    } else {
                      writeObject(value);
                    }
                  } else {
                    pack2(writeResult);
                  }
                  return;
                }
                let currentTarget = target;
                let currentTargetView = targetView;
                let currentPosition = position;
                target = null;
                let result;
                try {
                  result = extension.pack.call(this, value, (size) => {
                    target = currentTarget;
                    currentTarget = null;
                    position += size;
                    if (position > safeEnd)
                      makeRoom(position);
                    return {
                      target,
                      targetView,
                      position: position - size
                    };
                  }, pack2);
                } finally {
                  if (currentTarget) {
                    target = currentTarget;
                    targetView = currentTargetView;
                    position = currentPosition;
                    safeEnd = target.length - 10;
                  }
                }
                if (result) {
                  if (result.length + position > safeEnd)
                    makeRoom(result.length + position);
                  position = writeExtensionData(result, target, position, extension.type);
                }
                return;
              }
            }
            if (Array.isArray(value)) {
              packArray(value);
            } else {
              if (value.toJSON) {
                const json = value.toJSON();
                if (json !== value)
                  return pack2(json);
              }
              if (type === "function")
                return pack2(this.writeFunction && this.writeFunction(value));
              writeObject(value);
            }
          }
        }
      } else if (type === "boolean") {
        target[position++] = value ? 195 : 194;
      } else if (type === "bigint") {
        if (value < BigInt(1) << BigInt(63) && value >= -(BigInt(1) << BigInt(63))) {
          target[position++] = 211;
          targetView.setBigInt64(position, value);
        } else if (value < BigInt(1) << BigInt(64) && value > 0) {
          target[position++] = 207;
          targetView.setBigUint64(position, value);
        } else {
          if (this.largeBigIntToFloat) {
            target[position++] = 203;
            targetView.setFloat64(position, Number(value));
          } else if (this.largeBigIntToString) {
            return pack2(value.toString());
          } else if (this.useBigIntExtension && value < BigInt(2) ** BigInt(1023) && value > -(BigInt(2) ** BigInt(1023))) {
            target[position++] = 199;
            position++;
            target[position++] = 66;
            let bytes = [];
            let alignedSign;
            do {
              let byte = value & BigInt(255);
              alignedSign = (byte & BigInt(128)) === (value < BigInt(0) ? BigInt(128) : BigInt(0));
              bytes.push(byte);
              value >>= BigInt(8);
            } while (!((value === BigInt(0) || value === BigInt(-1)) && alignedSign));
            target[position - 2] = bytes.length;
            for (let i = bytes.length; i > 0; ) {
              target[position++] = Number(bytes[--i]);
            }
            return;
          } else {
            throw new RangeError(value + " was too large to fit in MessagePack 64-bit integer format, use useBigIntExtension, or set largeBigIntToFloat to convert to float-64, or set largeBigIntToString to convert to string");
          }
        }
        position += 8;
      } else if (type === "undefined") {
        if (this.encodeUndefinedAsNil)
          target[position++] = 192;
        else {
          target[position++] = 212;
          target[position++] = 0;
          target[position++] = 0;
        }
      } else {
        throw new Error("Unknown type: " + type);
      }
    }, "pack");
    const writePlainObject = this.variableMapSize || this.coercibleKeyAsNumber || this.skipValues ? (object) => {
      let keys;
      if (this.skipValues) {
        keys = [];
        for (let key2 in object) {
          if ((typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key2)) && !this.skipValues.includes(object[key2]))
            keys.push(key2);
        }
      } else {
        keys = Object.keys(object);
      }
      let length = keys.length;
      if (length < 16) {
        target[position++] = 128 | length;
      } else if (length < 65536) {
        target[position++] = 222;
        target[position++] = length >> 8;
        target[position++] = length & 255;
      } else {
        target[position++] = 223;
        targetView.setUint32(position, length);
        position += 4;
      }
      let key;
      if (this.coercibleKeyAsNumber) {
        for (let i = 0; i < length; i++) {
          key = keys[i];
          let num = Number(key);
          pack2(isNaN(num) ? key : num);
          pack2(object[key]);
        }
      } else {
        for (let i = 0; i < length; i++) {
          pack2(key = keys[i]);
          pack2(object[key]);
        }
      }
    } : (object) => {
      target[position++] = 222;
      let objectOffset = position - start;
      position += 2;
      let size = 0;
      for (let key in object) {
        if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key)) {
          pack2(key);
          pack2(object[key]);
          size++;
        }
      }
      if (size > 65535) {
        throw new Error('Object is too large to serialize with fast 16-bit map size, use the "variableMapSize" option to serialize this object');
      }
      target[objectOffset++ + start] = size >> 8;
      target[objectOffset + start] = size & 255;
    };
    const writeRecord = this.useRecords === false ? writePlainObject : options.progressiveRecords && !useTwoByteRecords ? (
      // this is about 2% faster for highly stable structures, since it only requires one for-in loop (but much more expensive when new structure needs to be written)
      (object) => {
        let nextTransition, transition = structures.transitions || (structures.transitions = /* @__PURE__ */ Object.create(null));
        let objectOffset = position++ - start;
        let wroteKeys;
        for (let key in object) {
          if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key)) {
            nextTransition = transition[key];
            if (nextTransition)
              transition = nextTransition;
            else {
              let keys = Object.keys(object);
              let lastTransition = transition;
              transition = structures.transitions;
              let newTransitions = 0;
              for (let i = 0, l = keys.length; i < l; i++) {
                let key2 = keys[i];
                nextTransition = transition[key2];
                if (!nextTransition) {
                  nextTransition = transition[key2] = /* @__PURE__ */ Object.create(null);
                  newTransitions++;
                }
                transition = nextTransition;
              }
              if (objectOffset + start + 1 == position) {
                position--;
                newRecord(transition, keys, newTransitions);
              } else
                insertNewRecord(transition, keys, objectOffset, newTransitions);
              wroteKeys = true;
              transition = lastTransition[key];
            }
            pack2(object[key]);
          }
        }
        if (!wroteKeys) {
          let recordId = transition[RECORD_SYMBOL];
          if (recordId)
            target[objectOffset + start] = recordId;
          else
            insertNewRecord(transition, Object.keys(object), objectOffset, 0);
        }
      }
    ) : (object) => {
      let nextTransition, transition = structures.transitions || (structures.transitions = /* @__PURE__ */ Object.create(null));
      let newTransitions = 0;
      for (let key in object) if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key)) {
        nextTransition = transition[key];
        if (!nextTransition) {
          nextTransition = transition[key] = /* @__PURE__ */ Object.create(null);
          newTransitions++;
        }
        transition = nextTransition;
      }
      let recordId = transition[RECORD_SYMBOL];
      if (recordId) {
        if (recordId >= 96 && useTwoByteRecords) {
          target[position++] = ((recordId -= 96) & 31) + 96;
          target[position++] = recordId >> 5;
        } else
          target[position++] = recordId;
      } else {
        newRecord(transition, transition.__keys__ || Object.keys(object), newTransitions);
      }
      for (let key in object)
        if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key)) {
          pack2(object[key]);
        }
    };
    const checkUseRecords = typeof this.useRecords == "function" && this.useRecords;
    const writeObject = checkUseRecords ? (object) => {
      checkUseRecords(object) ? writeRecord(object) : writePlainObject(object);
    } : writeRecord;
    const makeRoom = /* @__PURE__ */ __name((end) => {
      let newSize;
      if (end > 16777216) {
        if (end - start > MAX_BUFFER_SIZE)
          throw new Error("Packed buffer would be larger than maximum buffer size");
        newSize = Math.min(
          MAX_BUFFER_SIZE,
          Math.round(Math.max((end - start) * (end > 67108864 ? 1.25 : 2), 4194304) / 4096) * 4096
        );
      } else
        newSize = (Math.max(end - start << 2, target.length - 1) >> 12) + 1 << 12;
      let newBuffer = new ByteArrayAllocate(newSize);
      targetView = newBuffer.dataView || (newBuffer.dataView = new DataView(newBuffer.buffer, 0, newSize));
      end = Math.min(end, target.length);
      if (target.copy)
        target.copy(newBuffer, 0, start, end);
      else
        newBuffer.set(target.slice(start, end));
      position -= start;
      start = 0;
      safeEnd = newBuffer.length - 10;
      return target = newBuffer;
    }, "makeRoom");
    const newRecord = /* @__PURE__ */ __name((transition, keys, newTransitions) => {
      let recordId = structures.nextId;
      if (!recordId)
        recordId = 64;
      if (recordId < sharedLimitId && this.shouldShareStructure && !this.shouldShareStructure(keys)) {
        recordId = structures.nextOwnId;
        if (!(recordId < maxStructureId))
          recordId = sharedLimitId;
        structures.nextOwnId = recordId + 1;
      } else {
        if (recordId >= maxStructureId)
          recordId = sharedLimitId;
        structures.nextId = recordId + 1;
      }
      let highByte = keys.highByte = recordId >= 96 && useTwoByteRecords ? recordId - 96 >> 5 : -1;
      transition[RECORD_SYMBOL] = recordId;
      transition.__keys__ = keys;
      structures[recordId - 64] = keys;
      if (recordId < sharedLimitId) {
        keys.isShared = true;
        structures.sharedLength = recordId - 63;
        hasSharedUpdate = true;
        if (highByte >= 0) {
          target[position++] = (recordId & 31) + 96;
          target[position++] = highByte;
        } else {
          target[position++] = recordId;
        }
      } else {
        if (highByte >= 0) {
          target[position++] = 213;
          target[position++] = 114;
          target[position++] = (recordId & 31) + 96;
          target[position++] = highByte;
        } else {
          target[position++] = 212;
          target[position++] = 114;
          target[position++] = recordId;
        }
        if (newTransitions)
          transitionsCount += serializationsSinceTransitionRebuild * newTransitions;
        if (recordIdsToRemove.length >= maxOwnStructures)
          recordIdsToRemove.shift()[RECORD_SYMBOL] = 0;
        recordIdsToRemove.push(transition);
        pack2(keys);
      }
    }, "newRecord");
    const insertNewRecord = /* @__PURE__ */ __name((transition, keys, insertionOffset, newTransitions) => {
      let mainTarget = target;
      let mainPosition = position;
      let mainSafeEnd = safeEnd;
      let mainStart = start;
      target = keysTarget;
      position = 0;
      start = 0;
      if (!target)
        keysTarget = target = new ByteArrayAllocate(8192);
      safeEnd = target.length - 10;
      newRecord(transition, keys, newTransitions);
      keysTarget = target;
      let keysPosition = position;
      target = mainTarget;
      position = mainPosition;
      safeEnd = mainSafeEnd;
      start = mainStart;
      if (keysPosition > 1) {
        let newEnd = position + keysPosition - 1;
        if (newEnd > safeEnd)
          makeRoom(newEnd);
        let insertionPosition = insertionOffset + start;
        target.copyWithin(insertionPosition + keysPosition, insertionPosition + 1, position);
        target.set(keysTarget.slice(0, keysPosition), insertionPosition);
        position = newEnd;
      } else {
        target[insertionOffset + start] = keysTarget[0];
      }
    }, "insertNewRecord");
    const writeStruct = /* @__PURE__ */ __name((object) => {
      let newPosition = writeStructSlots(object, target, start, position, structures, makeRoom, (value, newPosition2, notifySharedUpdate) => {
        if (notifySharedUpdate)
          return hasSharedUpdate = true;
        position = newPosition2;
        let startTarget = target;
        pack2(value);
        resetStructures();
        if (startTarget !== target) {
          return { position, targetView, target };
        }
        return position;
      }, this);
      if (newPosition === 0)
        return writeObject(object);
      position = newPosition;
    }, "writeStruct");
  }
  useBuffer(buffer) {
    target = buffer;
    target.dataView || (target.dataView = new DataView(target.buffer, target.byteOffset, target.byteLength));
    position = 0;
  }
  set position(value) {
    position = value;
  }
  get position() {
    return position;
  }
  set buffer(buffer) {
    target = buffer;
  }
  get buffer() {
    return target;
  }
  clearSharedData() {
    if (this.structures)
      this.structures = [];
    if (this.typedStructs)
      this.typedStructs = [];
  }
};
__name(_Packr, "Packr");
let Packr = _Packr;
extensionClasses = [Date, Set, Error, RegExp, ArrayBuffer, Object.getPrototypeOf(Uint8Array.prototype).constructor, C1Type];
extensions = [{
  pack(date, allocateForWrite, pack2) {
    let seconds = date.getTime() / 1e3;
    if ((this.useTimestamp32 || date.getMilliseconds() === 0) && seconds >= 0 && seconds < 4294967296) {
      let { target: target2, targetView: targetView2, position: position2 } = allocateForWrite(6);
      target2[position2++] = 214;
      target2[position2++] = 255;
      targetView2.setUint32(position2, seconds);
    } else if (seconds > 0 && seconds < 4294967296) {
      let { target: target2, targetView: targetView2, position: position2 } = allocateForWrite(10);
      target2[position2++] = 215;
      target2[position2++] = 255;
      targetView2.setUint32(position2, date.getMilliseconds() * 4e6 + (seconds / 1e3 / 4294967296 >> 0));
      targetView2.setUint32(position2 + 4, seconds);
    } else if (isNaN(seconds)) {
      if (this.onInvalidDate) {
        allocateForWrite(0);
        return pack2(this.onInvalidDate());
      }
      let { target: target2, targetView: targetView2, position: position2 } = allocateForWrite(3);
      target2[position2++] = 212;
      target2[position2++] = 255;
      target2[position2++] = 255;
    } else {
      let { target: target2, targetView: targetView2, position: position2 } = allocateForWrite(15);
      target2[position2++] = 199;
      target2[position2++] = 12;
      target2[position2++] = 255;
      targetView2.setUint32(position2, date.getMilliseconds() * 1e6);
      targetView2.setBigInt64(position2 + 4, BigInt(Math.floor(seconds)));
    }
  }
}, {
  pack(set, allocateForWrite, pack2) {
    if (this.setAsEmptyObject) {
      allocateForWrite(0);
      return pack2({});
    }
    let array = Array.from(set);
    let { target: target2, position: position2 } = allocateForWrite(this.moreTypes ? 3 : 0);
    if (this.moreTypes) {
      target2[position2++] = 212;
      target2[position2++] = 115;
      target2[position2++] = 0;
    }
    pack2(array);
  }
}, {
  pack(error, allocateForWrite, pack2) {
    let { target: target2, position: position2 } = allocateForWrite(this.moreTypes ? 3 : 0);
    if (this.moreTypes) {
      target2[position2++] = 212;
      target2[position2++] = 101;
      target2[position2++] = 0;
    }
    pack2([error.name, error.message, error.cause]);
  }
}, {
  pack(regex, allocateForWrite, pack2) {
    let { target: target2, position: position2 } = allocateForWrite(this.moreTypes ? 3 : 0);
    if (this.moreTypes) {
      target2[position2++] = 212;
      target2[position2++] = 120;
      target2[position2++] = 0;
    }
    pack2([regex.source, regex.flags]);
  }
}, {
  pack(arrayBuffer, allocateForWrite) {
    if (this.moreTypes)
      writeExtBuffer(arrayBuffer, 16, allocateForWrite);
    else
      writeBuffer(hasNodeBuffer ? Buffer.from(arrayBuffer) : new Uint8Array(arrayBuffer), allocateForWrite);
  }
}, {
  pack(typedArray, allocateForWrite) {
    let constructor = typedArray.constructor;
    if (constructor !== ByteArray && this.moreTypes)
      writeExtBuffer(typedArray, typedArrays.indexOf(constructor.name), allocateForWrite);
    else
      writeBuffer(typedArray, allocateForWrite);
  }
}, {
  pack(c1, allocateForWrite) {
    let { target: target2, position: position2 } = allocateForWrite(1);
    target2[position2] = 193;
  }
}];
function writeExtBuffer(typedArray, type, allocateForWrite, encode2) {
  let length = typedArray.byteLength;
  if (length + 1 < 256) {
    var { target: target2, position: position2 } = allocateForWrite(4 + length);
    target2[position2++] = 199;
    target2[position2++] = length + 1;
  } else if (length + 1 < 65536) {
    var { target: target2, position: position2 } = allocateForWrite(5 + length);
    target2[position2++] = 200;
    target2[position2++] = length + 1 >> 8;
    target2[position2++] = length + 1 & 255;
  } else {
    var { target: target2, position: position2, targetView: targetView2 } = allocateForWrite(7 + length);
    target2[position2++] = 201;
    targetView2.setUint32(position2, length + 1);
    position2 += 4;
  }
  target2[position2++] = 116;
  target2[position2++] = type;
  if (!typedArray.buffer) typedArray = new Uint8Array(typedArray);
  target2.set(new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength), position2);
}
__name(writeExtBuffer, "writeExtBuffer");
function writeBuffer(buffer, allocateForWrite) {
  let length = buffer.byteLength;
  var target2, position2;
  if (length < 256) {
    var { target: target2, position: position2 } = allocateForWrite(length + 2);
    target2[position2++] = 196;
    target2[position2++] = length;
  } else if (length < 65536) {
    var { target: target2, position: position2 } = allocateForWrite(length + 3);
    target2[position2++] = 197;
    target2[position2++] = length >> 8;
    target2[position2++] = length & 255;
  } else {
    var { target: target2, position: position2, targetView: targetView2 } = allocateForWrite(length + 5);
    target2[position2++] = 198;
    targetView2.setUint32(position2, length);
    position2 += 4;
  }
  target2.set(buffer, position2);
}
__name(writeBuffer, "writeBuffer");
function writeExtensionData(result, target2, position2, type) {
  let length = result.length;
  switch (length) {
    case 1:
      target2[position2++] = 212;
      break;
    case 2:
      target2[position2++] = 213;
      break;
    case 4:
      target2[position2++] = 214;
      break;
    case 8:
      target2[position2++] = 215;
      break;
    case 16:
      target2[position2++] = 216;
      break;
    default:
      if (length < 256) {
        target2[position2++] = 199;
        target2[position2++] = length;
      } else if (length < 65536) {
        target2[position2++] = 200;
        target2[position2++] = length >> 8;
        target2[position2++] = length & 255;
      } else {
        target2[position2++] = 201;
        target2[position2++] = length >> 24;
        target2[position2++] = length >> 16 & 255;
        target2[position2++] = length >> 8 & 255;
        target2[position2++] = length & 255;
      }
  }
  target2[position2++] = type;
  target2.set(result, position2);
  position2 += length;
  return position2;
}
__name(writeExtensionData, "writeExtensionData");
function insertIds(serialized, idsToInsert) {
  let nextId;
  let distanceToMove = idsToInsert.length * 6;
  let lastEnd = serialized.length - distanceToMove;
  while (nextId = idsToInsert.pop()) {
    let offset = nextId.offset;
    let id = nextId.id;
    serialized.copyWithin(offset + distanceToMove, offset, lastEnd);
    distanceToMove -= 6;
    let position2 = offset + distanceToMove;
    serialized[position2++] = 214;
    serialized[position2++] = 105;
    serialized[position2++] = id >> 24;
    serialized[position2++] = id >> 16 & 255;
    serialized[position2++] = id >> 8 & 255;
    serialized[position2++] = id & 255;
    lastEnd = offset;
  }
  return serialized;
}
__name(insertIds, "insertIds");
function writeBundles(start, pack2, incrementPosition) {
  if (bundledStrings.length > 0) {
    targetView.setUint32(bundledStrings.position + start, position + incrementPosition - bundledStrings.position - start);
    bundledStrings.stringsPosition = position - start;
    let writeStrings = bundledStrings;
    bundledStrings = null;
    pack2(writeStrings[0]);
    pack2(writeStrings[1]);
  }
}
__name(writeBundles, "writeBundles");
function addExtension(extension) {
  if (extension.Class) {
    if (!extension.pack && !extension.write)
      throw new Error("Extension has no pack or write function");
    if (extension.pack && !extension.type)
      throw new Error("Extension has no type (numeric code to identify the extension)");
    extensionClasses.unshift(extension.Class);
    extensions.unshift(extension);
  }
  addExtension$1(extension);
}
__name(addExtension, "addExtension");
function prepareStructures(structures, packr) {
  structures.isCompatible = (existingStructures) => {
    let compatible = !existingStructures || (packr.lastNamedStructuresLength || 0) === existingStructures.length;
    if (!compatible)
      packr._mergeStructures(existingStructures);
    return compatible;
  };
  return structures;
}
__name(prepareStructures, "prepareStructures");
let defaultPackr = new Packr({ useRecords: false });
const pack = defaultPackr.pack;
const encode = defaultPackr.pack;
const Encoder = Packr;
const { NEVER, ALWAYS, DECIMAL_ROUND, DECIMAL_FIT } = FLOAT32_OPTIONS;
const REUSE_BUFFER_MODE = 512;
const RESET_BUFFER_MODE = 1024;
const RESERVE_START_SPACE = 2048;
function packIter(objectIterator, options = {}) {
  if (!objectIterator || typeof objectIterator !== "object") {
    throw new Error("first argument must be an Iterable, Async Iterable, or a Promise for an Async Iterable");
  } else if (typeof objectIterator[Symbol.iterator] === "function") {
    return packIterSync(objectIterator, options);
  } else if (typeof objectIterator.then === "function" || typeof objectIterator[Symbol.asyncIterator] === "function") {
    return packIterAsync(objectIterator, options);
  } else {
    throw new Error("first argument must be an Iterable, Async Iterable, Iterator, Async Iterator, or a Promise");
  }
}
__name(packIter, "packIter");
function* packIterSync(objectIterator, options) {
  const packr = new Packr(options);
  for (const value of objectIterator) {
    yield packr.pack(value);
  }
}
__name(packIterSync, "packIterSync");
async function* packIterAsync(objectIterator, options) {
  const packr = new Packr(options);
  for await (const value of objectIterator) {
    yield packr.pack(value);
  }
}
__name(packIterAsync, "packIterAsync");
function unpackIter(bufferIterator, options = {}) {
  if (!bufferIterator || typeof bufferIterator !== "object") {
    throw new Error("first argument must be an Iterable, Async Iterable, Iterator, Async Iterator, or a promise");
  }
  const unpackr = new Unpackr(options);
  let incomplete;
  const parser = /* @__PURE__ */ __name((chunk) => {
    let yields;
    if (incomplete) {
      chunk = Buffer.concat([incomplete, chunk]);
      incomplete = void 0;
    }
    try {
      yields = unpackr.unpackMultiple(chunk);
    } catch (err) {
      if (err.incomplete) {
        incomplete = chunk.slice(err.lastPosition);
        yields = err.values;
      } else {
        throw err;
      }
    }
    return yields;
  }, "parser");
  if (typeof bufferIterator[Symbol.iterator] === "function") {
    return (/* @__PURE__ */ __name(function* iter() {
      for (const value of bufferIterator) {
        yield* parser(value);
      }
    }, "iter"))();
  } else if (typeof bufferIterator[Symbol.asyncIterator] === "function") {
    return (/* @__PURE__ */ __name(async function* iter() {
      for await (const value of bufferIterator) {
        yield* parser(value);
      }
    }, "iter"))();
  }
}
__name(unpackIter, "unpackIter");
const decodeIter = unpackIter;
const encodeIter = packIter;
const useRecords = false;
const mapsAsObjects = true;
const msgpackr$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ALWAYS,
  C1,
  DECIMAL_FIT,
  DECIMAL_ROUND,
  Decoder,
  Encoder,
  FLOAT32_OPTIONS,
  NEVER,
  Packr,
  RESERVE_START_SPACE,
  RESET_BUFFER_MODE,
  REUSE_BUFFER_MODE,
  Unpackr,
  addExtension,
  clearSource,
  decode,
  decodeIter,
  encode,
  encodeIter,
  isNativeAccelerationEnabled,
  mapsAsObjects,
  pack,
  roundFloat32,
  unpack,
  unpackMultiple,
  useRecords
}, Symbol.toStringTag, { value: "Module" }));
const require$$8 = /* @__PURE__ */ getAugmentedNamespace(msgpackr$1);
var Connection = Connection$2;
var Protocol = Protocol$1;
var Serializer = Serializer$1;
var nanoevents$1 = nanoevents$2;
var signal = signal$1;
var schema = umdExports$1;
var SchemaSerializer = SchemaSerializer$2;
var ServerError$2 = ServerError$3;
var msgpackr = require$$8;
let Room$1 = (_d = class {
  constructor(name, rootSchema) {
    this.onStateChange = signal.createSignal();
    this.onError = signal.createSignal();
    this.onLeave = signal.createSignal();
    this.onJoin = signal.createSignal();
    this.hasJoined = false;
    this.onMessageHandlers = nanoevents$1.createNanoEvents();
    this.roomId = null;
    this.name = name;
    this.packr = new msgpackr.Packr();
    this.packr.encode(void 0);
    if (rootSchema) {
      this.serializer = new (Serializer.getSerializer("schema"))();
      this.rootSchema = rootSchema;
      this.serializer.state = new rootSchema();
    }
    this.onError((code, message) => {
      var _a3;
      return (_a3 = console.warn) === null || _a3 === void 0 ? void 0 : _a3.call(console, `colyseus.js - onError => (${code}) ${message}`);
    });
    this.onLeave(() => this.removeAllListeners());
  }
  connect(endpoint, devModeCloseCallback, room = this, options, headers) {
    const connection = new Connection.Connection(options.protocol);
    room.connection = connection;
    connection.events.onmessage = _d.prototype.onMessageCallback.bind(room);
    connection.events.onclose = function(e) {
      var _a3;
      if (!room.hasJoined) {
        (_a3 = console.warn) === null || _a3 === void 0 ? void 0 : _a3.call(console, `Room connection was closed unexpectedly (${e.code}): ${e.reason}`);
        room.onError.invoke(e.code, e.reason);
        return;
      }
      if (e.code === ServerError$2.CloseCode.DEVMODE_RESTART && devModeCloseCallback) {
        devModeCloseCallback();
      } else {
        room.onLeave.invoke(e.code, e.reason);
        room.destroy();
      }
    };
    connection.events.onerror = function(e) {
      var _a3;
      (_a3 = console.warn) === null || _a3 === void 0 ? void 0 : _a3.call(console, `Room, onError (${e.code}): ${e.reason}`);
      room.onError.invoke(e.code, e.reason);
    };
    if (options.protocol === "h3") {
      const url = new URL(endpoint);
      connection.connect(url.origin, options);
    } else {
      connection.connect(endpoint, headers);
    }
  }
  leave(consented = true) {
    return new Promise((resolve) => {
      this.onLeave((code) => resolve(code));
      if (this.connection) {
        if (consented) {
          this.packr.buffer[0] = Protocol.Protocol.LEAVE_ROOM;
          this.connection.send(this.packr.buffer.subarray(0, 1));
        } else {
          this.connection.close();
        }
      } else {
        this.onLeave.invoke(ServerError$2.CloseCode.CONSENTED);
      }
    });
  }
  onMessage(type, callback) {
    return this.onMessageHandlers.on(this.getMessageHandlerKey(type), callback);
  }
  send(type, message) {
    const it = { offset: 1 };
    this.packr.buffer[0] = Protocol.Protocol.ROOM_DATA;
    if (typeof type === "string") {
      schema.encode.string(this.packr.buffer, type, it);
    } else {
      schema.encode.number(this.packr.buffer, type, it);
    }
    this.packr.position = 0;
    const data = message !== void 0 ? this.packr.pack(message, 2048 + it.offset) : this.packr.buffer.subarray(0, it.offset);
    this.connection.send(data);
  }
  sendUnreliable(type, message) {
    const it = { offset: 1 };
    this.packr.buffer[0] = Protocol.Protocol.ROOM_DATA;
    if (typeof type === "string") {
      schema.encode.string(this.packr.buffer, type, it);
    } else {
      schema.encode.number(this.packr.buffer, type, it);
    }
    this.packr.position = 0;
    const data = message !== void 0 ? this.packr.pack(message, 2048 + it.offset) : this.packr.buffer.subarray(0, it.offset);
    this.connection.sendUnreliable(data);
  }
  sendBytes(type, bytes) {
    const it = { offset: 1 };
    this.packr.buffer[0] = Protocol.Protocol.ROOM_DATA_BYTES;
    if (typeof type === "string") {
      schema.encode.string(this.packr.buffer, type, it);
    } else {
      schema.encode.number(this.packr.buffer, type, it);
    }
    if (bytes.byteLength + it.offset > this.packr.buffer.byteLength) {
      const newBuffer = new Uint8Array(it.offset + bytes.byteLength);
      newBuffer.set(this.packr.buffer);
      this.packr.useBuffer(newBuffer);
    }
    this.packr.buffer.set(bytes, it.offset);
    this.connection.send(this.packr.buffer.subarray(0, it.offset + bytes.byteLength));
  }
  get state() {
    return this.serializer.getState();
  }
  removeAllListeners() {
    this.onJoin.clear();
    this.onStateChange.clear();
    this.onError.clear();
    this.onLeave.clear();
    this.onMessageHandlers.events = {};
    if (this.serializer instanceof SchemaSerializer.SchemaSerializer) {
      this.serializer.decoder.root.callbacks = {};
    }
  }
  onMessageCallback(event) {
    const buffer = new Uint8Array(event.data);
    const it = { offset: 1 };
    const code = buffer[0];
    if (code === Protocol.Protocol.JOIN_ROOM) {
      const reconnectionToken = schema.decode.utf8Read(buffer, it, buffer[it.offset++]);
      this.serializerId = schema.decode.utf8Read(buffer, it, buffer[it.offset++]);
      if (!this.serializer) {
        const serializer = Serializer.getSerializer(this.serializerId);
        this.serializer = new serializer();
      }
      if (buffer.byteLength > it.offset && this.serializer.handshake) {
        this.serializer.handshake(buffer, it);
      }
      this.reconnectionToken = `${this.roomId}:${reconnectionToken}`;
      this.hasJoined = true;
      this.onJoin.invoke();
      this.packr.buffer[0] = Protocol.Protocol.JOIN_ROOM;
      this.connection.send(this.packr.buffer.subarray(0, 1));
    } else if (code === Protocol.Protocol.ERROR) {
      const code2 = schema.decode.number(buffer, it);
      const message = schema.decode.string(buffer, it);
      this.onError.invoke(code2, message);
    } else if (code === Protocol.Protocol.LEAVE_ROOM) {
      this.leave();
    } else if (code === Protocol.Protocol.ROOM_STATE) {
      this.serializer.setState(buffer, it);
      this.onStateChange.invoke(this.serializer.getState());
    } else if (code === Protocol.Protocol.ROOM_STATE_PATCH) {
      this.serializer.patch(buffer, it);
      this.onStateChange.invoke(this.serializer.getState());
    } else if (code === Protocol.Protocol.ROOM_DATA) {
      const type = schema.decode.stringCheck(buffer, it) ? schema.decode.string(buffer, it) : schema.decode.number(buffer, it);
      const message = buffer.byteLength > it.offset ? msgpackr.unpack(buffer, { start: it.offset }) : void 0;
      this.dispatchMessage(type, message);
    } else if (code === Protocol.Protocol.ROOM_DATA_BYTES) {
      const type = schema.decode.stringCheck(buffer, it) ? schema.decode.string(buffer, it) : schema.decode.number(buffer, it);
      this.dispatchMessage(type, buffer.subarray(it.offset));
    }
  }
  dispatchMessage(type, message) {
    var _a3;
    const messageType = this.getMessageHandlerKey(type);
    if (this.onMessageHandlers.events[messageType]) {
      this.onMessageHandlers.emit(messageType, message);
    } else if (this.onMessageHandlers.events["*"]) {
      this.onMessageHandlers.emit("*", type, message);
    } else {
      (_a3 = console.warn) === null || _a3 === void 0 ? void 0 : _a3.call(console, `colyseus.js: onMessage() not registered for type '${type}'.`);
    }
  }
  destroy() {
    if (this.serializer) {
      this.serializer.teardown();
    }
  }
  getMessageHandlerKey(type) {
    switch (typeof type) {
      case "string":
        return type;
      case "number":
        return `i${type}`;
      default:
        throw new Error("invalid message type.");
    }
  }
}, __name(_d, "Room"), _d);
Room$2.Room = Room$1;
var HTTP$2 = {};
function apply(src2, tar) {
  tar.headers = src2.headers || {};
  tar.statusMessage = src2.statusText;
  tar.statusCode = src2.status;
  tar.data = src2.response;
}
__name(apply, "apply");
function send(method, uri, opts) {
  return new Promise(function(res, rej) {
    opts = opts || {};
    var req = new XMLHttpRequest();
    var k, tmp, arr, str = opts.body;
    var headers = opts.headers || {};
    if (opts.timeout) req.timeout = opts.timeout;
    req.ontimeout = req.onerror = function(err) {
      err.timeout = err.type == "timeout";
      rej(err);
    };
    req.open(method, uri.href || uri);
    req.onload = function() {
      arr = req.getAllResponseHeaders().trim().split(/[\r\n]+/);
      apply(req, req);
      while (tmp = arr.shift()) {
        tmp = tmp.split(": ");
        req.headers[tmp.shift().toLowerCase()] = tmp.join(": ");
      }
      tmp = req.headers["content-type"];
      if (tmp && !!~tmp.indexOf("application/json")) {
        try {
          req.data = JSON.parse(req.data, opts.reviver);
        } catch (err) {
          apply(req, err);
          return rej(err);
        }
      }
      (req.status >= 400 ? rej : res)(req);
    };
    if (typeof FormData < "u" && str instanceof FormData) ;
    else if (str && typeof str == "object") {
      headers["content-type"] = "application/json";
      str = JSON.stringify(str);
    }
    req.withCredentials = !!opts.withCredentials;
    for (k in headers) {
      req.setRequestHeader(k, headers[k]);
    }
    req.send(str);
  });
}
__name(send, "send");
var get = /* @__PURE__ */ send.bind(send, "GET");
var post = /* @__PURE__ */ send.bind(send, "POST");
var patch = /* @__PURE__ */ send.bind(send, "PATCH");
var del = /* @__PURE__ */ send.bind(send, "DELETE");
var put = /* @__PURE__ */ send.bind(send, "PUT");
const xhr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  del,
  get,
  patch,
  post,
  put,
  send
}, Symbol.toStringTag, { value: "Module" }));
const require$$1 = /* @__PURE__ */ getAugmentedNamespace(xhr);
var ServerError$1 = ServerError$3;
var httpie = require$$1;
function _interopNamespaceDefault(e) {
  var n = /* @__PURE__ */ Object.create(null);
  if (e) {
    Object.keys(e).forEach(function(k) {
      if (k !== "default") {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: /* @__PURE__ */ __name(function() {
            return e[k];
          }, "get")
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}
__name(_interopNamespaceDefault, "_interopNamespaceDefault");
var httpie__namespace = /* @__PURE__ */ _interopNamespaceDefault(httpie);
let HTTP$1 = (_e = class {
  constructor(client, headers = {}) {
    this.client = client;
    this.headers = headers;
  }
  get(path, options = {}) {
    return this.request("get", path, options);
  }
  post(path, options = {}) {
    return this.request("post", path, options);
  }
  del(path, options = {}) {
    return this.request("del", path, options);
  }
  put(path, options = {}) {
    return this.request("put", path, options);
  }
  request(method, path, options = {}) {
    return httpie__namespace[method](this.client["getHttpEndpoint"](path), this.getOptions(options)).catch((e) => {
      var _a3;
      const status = e.statusCode;
      const message = ((_a3 = e.data) === null || _a3 === void 0 ? void 0 : _a3.error) || e.statusMessage || e.message;
      if (!status && !message) {
        throw e;
      }
      throw new ServerError$1.ServerError(status, message);
    });
  }
  getOptions(options) {
    options.headers = Object.assign({}, this.headers, options.headers);
    if (this.authToken) {
      options.headers["Authorization"] = `Bearer ${this.authToken}`;
    }
    if (typeof cc !== "undefined" && cc.sys && cc.sys.isNative) ;
    else {
      options.withCredentials = true;
    }
    return options;
  }
}, __name(_e, "HTTP"), _e);
HTTP$2.HTTP = HTTP$1;
var Auth$2 = {};
var Storage$1 = {};
var tslib$2 = require$$0;
let storage;
function getStorage() {
  if (!storage) {
    try {
      storage = typeof cc !== "undefined" && cc.sys && cc.sys.localStorage ? cc.sys.localStorage : window.localStorage;
    } catch (e) {
    }
  }
  if (!storage && typeof globalThis.indexedDB !== "undefined") {
    storage = new IndexedDBStorage();
  }
  if (!storage) {
    storage = {
      cache: {},
      setItem: /* @__PURE__ */ __name(function(key, value) {
        this.cache[key] = value;
      }, "setItem"),
      getItem: /* @__PURE__ */ __name(function(key) {
        this.cache[key];
      }, "getItem"),
      removeItem: /* @__PURE__ */ __name(function(key) {
        delete this.cache[key];
      }, "removeItem")
    };
  }
  return storage;
}
__name(getStorage, "getStorage");
function setItem(key, value) {
  getStorage().setItem(key, value);
}
__name(setItem, "setItem");
function removeItem(key) {
  getStorage().removeItem(key);
}
__name(removeItem, "removeItem");
function getItem(key, callback) {
  const value = getStorage().getItem(key);
  if (typeof Promise === "undefined" || // old browsers
  !(value instanceof Promise)) {
    callback(value);
  } else {
    value.then((id) => callback(id));
  }
}
__name(getItem, "getItem");
const _IndexedDBStorage = class _IndexedDBStorage {
  constructor() {
    this.dbPromise = new Promise((resolve) => {
      const request = indexedDB.open("_colyseus_storage", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("store");
      request.onsuccess = () => resolve(request.result);
    });
  }
  tx(mode, fn) {
    return tslib$2.__awaiter(this, void 0, void 0, function* () {
      const db = yield this.dbPromise;
      const store = db.transaction("store", mode).objectStore("store");
      return fn(store);
    });
  }
  setItem(key, value) {
    return this.tx("readwrite", (store) => store.put(value, key)).then();
  }
  getItem(key) {
    return tslib$2.__awaiter(this, void 0, void 0, function* () {
      const request = yield this.tx("readonly", (store) => store.get(key));
      return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result);
      });
    });
  }
  removeItem(key) {
    return this.tx("readwrite", (store) => store.delete(key)).then();
  }
};
__name(_IndexedDBStorage, "IndexedDBStorage");
let IndexedDBStorage = _IndexedDBStorage;
Storage$1.getItem = getItem;
Storage$1.removeItem = removeItem;
Storage$1.setItem = setItem;
var tslib$1 = require$$0;
var Storage = Storage$1;
var nanoevents = nanoevents$2;
var _Auth__initialized, _Auth__initializationPromise, _Auth__signInWindow, _Auth__events;
let Auth$1 = (_f = class {
  constructor(http) {
    this.http = http;
    this.settings = {
      path: "/auth",
      key: "colyseus-auth-token"
    };
    _Auth__initialized.set(this, false);
    _Auth__initializationPromise.set(this, void 0);
    _Auth__signInWindow.set(this, void 0);
    _Auth__events.set(this, nanoevents.createNanoEvents());
    Storage.getItem(this.settings.key, (token) => this.token = token);
  }
  set token(token) {
    this.http.authToken = token;
  }
  get token() {
    return this.http.authToken;
  }
  onChange(callback) {
    const unbindChange = tslib$1.__classPrivateFieldGet(this, _Auth__events, "f").on("change", callback);
    if (!tslib$1.__classPrivateFieldGet(this, _Auth__initialized, "f")) {
      tslib$1.__classPrivateFieldSet(this, _Auth__initializationPromise, new Promise((resolve, reject) => {
        this.getUserData().then((userData) => {
          this.emitChange(Object.assign(Object.assign({}, userData), { token: this.token }));
        }).catch((e) => {
          this.emitChange({ user: null, token: void 0 });
        }).finally(() => {
          resolve();
        });
      }), "f");
    }
    tslib$1.__classPrivateFieldSet(this, _Auth__initialized, true, "f");
    return unbindChange;
  }
  getUserData() {
    return tslib$1.__awaiter(this, void 0, void 0, function* () {
      if (this.token) {
        return (yield this.http.get(`${this.settings.path}/userdata`)).data;
      } else {
        throw new Error("missing auth.token");
      }
    });
  }
  registerWithEmailAndPassword(email, password, options) {
    return tslib$1.__awaiter(this, void 0, void 0, function* () {
      const data = (yield this.http.post(`${this.settings.path}/register`, {
        body: { email, password, options }
      })).data;
      this.emitChange(data);
      return data;
    });
  }
  signInWithEmailAndPassword(email, password) {
    return tslib$1.__awaiter(this, void 0, void 0, function* () {
      const data = (yield this.http.post(`${this.settings.path}/login`, {
        body: { email, password }
      })).data;
      this.emitChange(data);
      return data;
    });
  }
  signInAnonymously(options) {
    return tslib$1.__awaiter(this, void 0, void 0, function* () {
      const data = (yield this.http.post(`${this.settings.path}/anonymous`, {
        body: { options }
      })).data;
      this.emitChange(data);
      return data;
    });
  }
  sendPasswordResetEmail(email) {
    return tslib$1.__awaiter(this, void 0, void 0, function* () {
      return (yield this.http.post(`${this.settings.path}/forgot-password`, {
        body: { email }
      })).data;
    });
  }
  signInWithProvider(providerName_1) {
    return tslib$1.__awaiter(this, arguments, void 0, function* (providerName, settings = {}) {
      return new Promise((resolve, reject) => {
        const w = settings.width || 480;
        const h = settings.height || 768;
        const upgradingToken = this.token ? `?token=${this.token}` : "";
        const title = `Login with ${providerName[0].toUpperCase() + providerName.substring(1)}`;
        const url = this.http["client"]["getHttpEndpoint"](`${settings.prefix || `${this.settings.path}/provider`}/${providerName}${upgradingToken}`);
        const left = screen.width / 2 - w / 2;
        const top = screen.height / 2 - h / 2;
        tslib$1.__classPrivateFieldSet(this, _Auth__signInWindow, window.open(url, title, "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=" + w + ", height=" + h + ", top=" + top + ", left=" + left), "f");
        const onMessage = /* @__PURE__ */ __name((event) => {
          if (event.data.user === void 0 && event.data.token === void 0) {
            return;
          }
          clearInterval(rejectionChecker);
          tslib$1.__classPrivateFieldGet(this, _Auth__signInWindow, "f").close();
          tslib$1.__classPrivateFieldSet(this, _Auth__signInWindow, void 0, "f");
          window.removeEventListener("message", onMessage);
          if (event.data.error !== void 0) {
            reject(event.data.error);
          } else {
            resolve(event.data);
            this.emitChange(event.data);
          }
        }, "onMessage");
        const rejectionChecker = setInterval(() => {
          if (!tslib$1.__classPrivateFieldGet(this, _Auth__signInWindow, "f") || tslib$1.__classPrivateFieldGet(this, _Auth__signInWindow, "f").closed) {
            tslib$1.__classPrivateFieldSet(this, _Auth__signInWindow, void 0, "f");
            reject("cancelled");
            window.removeEventListener("message", onMessage);
          }
        }, 200);
        window.addEventListener("message", onMessage);
      });
    });
  }
  signOut() {
    return tslib$1.__awaiter(this, void 0, void 0, function* () {
      this.emitChange({ user: null, token: null });
    });
  }
  emitChange(authData) {
    if (authData.token !== void 0) {
      this.token = authData.token;
      if (authData.token === null) {
        Storage.removeItem(this.settings.key);
      } else {
        Storage.setItem(this.settings.key, authData.token);
      }
    }
    tslib$1.__classPrivateFieldGet(this, _Auth__events, "f").emit("change", authData);
  }
}, __name(_f, "Auth"), _f);
_Auth__initialized = /* @__PURE__ */ new WeakMap(), _Auth__initializationPromise = /* @__PURE__ */ new WeakMap(), _Auth__signInWindow = /* @__PURE__ */ new WeakMap(), _Auth__events = /* @__PURE__ */ new WeakMap();
Auth$2.Auth = Auth$1;
var discord$1 = {};
function discordURLBuilder(url) {
  var _a3;
  const localHostname = ((_a3 = window === null || window === void 0 ? void 0 : window.location) === null || _a3 === void 0 ? void 0 : _a3.hostname) || "localhost";
  const remoteHostnameSplitted = url.hostname.split(".");
  const subdomain = !url.hostname.includes("trycloudflare.com") && // ignore cloudflared subdomains
  !url.hostname.includes("discordsays.com") && // ignore discordsays.com subdomains
  remoteHostnameSplitted.length > 2 ? `/${remoteHostnameSplitted[0]}` : "";
  return url.pathname.startsWith("/.proxy") ? `${url.protocol}//${localHostname}${subdomain}${url.pathname}${url.search}` : `${url.protocol}//${localHostname}/.proxy/colyseus${subdomain}${url.pathname}${url.search}`;
}
__name(discordURLBuilder, "discordURLBuilder");
discord$1.discordURLBuilder = discordURLBuilder;
var tslib = require$$0;
var ServerError = ServerError$3;
var Room = Room$2;
var HTTP = HTTP$2;
var Auth = Auth$2;
var discord = discord$1;
var _a2;
const _MatchMakeError = class _MatchMakeError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = "MatchMakeError";
    Object.setPrototypeOf(this, _MatchMakeError.prototype);
  }
};
__name(_MatchMakeError, "MatchMakeError");
let MatchMakeError = _MatchMakeError;
const DEFAULT_ENDPOINT = typeof window !== "undefined" && typeof ((_a2 = window === null || window === void 0 ? void 0 : window.location) === null || _a2 === void 0 ? void 0 : _a2.hostname) !== "undefined" ? `${window.location.protocol.replace("http", "ws")}//${window.location.hostname}${window.location.port && `:${window.location.port}`}` : "ws://127.0.0.1:2567";
const _Client = class _Client {
  constructor(settings = DEFAULT_ENDPOINT, options) {
    var _a3, _b2;
    if (typeof settings === "string") {
      const url = settings.startsWith("/") ? new URL(settings, DEFAULT_ENDPOINT) : new URL(settings);
      const secure = url.protocol === "https:" || url.protocol === "wss:";
      const port = Number(url.port || (secure ? 443 : 80));
      this.settings = {
        hostname: url.hostname,
        pathname: url.pathname,
        port,
        secure
      };
    } else {
      if (settings.port === void 0) {
        settings.port = settings.secure ? 443 : 80;
      }
      if (settings.pathname === void 0) {
        settings.pathname = "";
      }
      this.settings = settings;
    }
    if (this.settings.pathname.endsWith("/")) {
      this.settings.pathname = this.settings.pathname.slice(0, -1);
    }
    this.http = new HTTP.HTTP(this, (options === null || options === void 0 ? void 0 : options.headers) || {});
    this.auth = new Auth.Auth(this.http);
    this.urlBuilder = options === null || options === void 0 ? void 0 : options.urlBuilder;
    if (!this.urlBuilder && typeof window !== "undefined" && ((_b2 = (_a3 = window === null || window === void 0 ? void 0 : window.location) === null || _a3 === void 0 ? void 0 : _a3.hostname) === null || _b2 === void 0 ? void 0 : _b2.includes("discordsays.com"))) {
      this.urlBuilder = discord.discordURLBuilder;
      console.log("Colyseus SDK: Discord Embedded SDK detected. Using custom URL builder.");
    }
  }
  joinOrCreate(roomName_1) {
    return tslib.__awaiter(this, arguments, void 0, function* (roomName, options = {}, rootSchema) {
      return yield this.createMatchMakeRequest("joinOrCreate", roomName, options, rootSchema);
    });
  }
  create(roomName_1) {
    return tslib.__awaiter(this, arguments, void 0, function* (roomName, options = {}, rootSchema) {
      return yield this.createMatchMakeRequest("create", roomName, options, rootSchema);
    });
  }
  join(roomName_1) {
    return tslib.__awaiter(this, arguments, void 0, function* (roomName, options = {}, rootSchema) {
      return yield this.createMatchMakeRequest("join", roomName, options, rootSchema);
    });
  }
  joinById(roomId_1) {
    return tslib.__awaiter(this, arguments, void 0, function* (roomId, options = {}, rootSchema) {
      return yield this.createMatchMakeRequest("joinById", roomId, options, rootSchema);
    });
  }
  /**
   * Re-establish connection with a room this client was previously connected to.
   *
   * @param reconnectionToken The `room.reconnectionToken` from previously connected room.
   * @param rootSchema (optional) Concrete root schema definition
   * @returns Promise<Room>
   */
  reconnect(reconnectionToken, rootSchema) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
      if (typeof reconnectionToken === "string" && typeof rootSchema === "string") {
        throw new Error("DEPRECATED: .reconnect() now only accepts 'reconnectionToken' as argument.\nYou can get this token from previously connected `room.reconnectionToken`");
      }
      const [roomId, token] = reconnectionToken.split(":");
      if (!roomId || !token) {
        throw new Error("Invalid reconnection token format.\nThe format should be roomId:reconnectionToken");
      }
      return yield this.createMatchMakeRequest("reconnect", roomId, { reconnectionToken: token }, rootSchema);
    });
  }
  consumeSeatReservation(response, rootSchema, reuseRoomInstance) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
      const room = this.createRoom(response.room.name, rootSchema);
      room.roomId = response.room.roomId;
      room.sessionId = response.sessionId;
      const options = { sessionId: room.sessionId };
      if (response.reconnectionToken) {
        options.reconnectionToken = response.reconnectionToken;
      }
      const targetRoom = reuseRoomInstance || room;
      room.connect(this.buildEndpoint(response.room, options, response.protocol), response.devMode && (() => tslib.__awaiter(this, void 0, void 0, function* () {
        console.info(`[Colyseus devMode]: ${String.fromCodePoint(128260)} Re-establishing connection with room id '${room.roomId}'...`);
        let retryCount = 0;
        let retryMaxRetries = 8;
        const retryReconnection = /* @__PURE__ */ __name(() => tslib.__awaiter(this, void 0, void 0, function* () {
          retryCount++;
          try {
            yield this.consumeSeatReservation(response, rootSchema, targetRoom);
            console.info(`[Colyseus devMode]: ${String.fromCodePoint(9989)} Successfully re-established connection with room '${room.roomId}'`);
          } catch (e) {
            if (retryCount < retryMaxRetries) {
              console.info(`[Colyseus devMode]: ${String.fromCodePoint(128260)} retrying... (${retryCount} out of ${retryMaxRetries})`);
              setTimeout(retryReconnection, 2e3);
            } else {
              console.info(`[Colyseus devMode]: ${String.fromCodePoint(10060)} Failed to reconnect. Is your server running? Please check server logs.`);
            }
          }
        }), "retryReconnection");
        setTimeout(retryReconnection, 2e3);
      })), targetRoom, response, this.http.headers);
      return new Promise((resolve, reject) => {
        const onError = /* @__PURE__ */ __name((code, message) => reject(new ServerError.ServerError(code, message)), "onError");
        targetRoom.onError.once(onError);
        targetRoom["onJoin"].once(() => {
          targetRoom.onError.remove(onError);
          resolve(targetRoom);
        });
      });
    });
  }
  createMatchMakeRequest(method_1, roomName_1) {
    return tslib.__awaiter(this, arguments, void 0, function* (method, roomName, options = {}, rootSchema, reuseRoomInstance) {
      const response = (yield this.http.post(`matchmake/${method}/${roomName}`, {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(options)
      })).data;
      if (response.error) {
        throw new MatchMakeError(response.error, response.code);
      }
      if (method === "reconnect") {
        response.reconnectionToken = options.reconnectionToken;
      }
      return yield this.consumeSeatReservation(response, rootSchema, reuseRoomInstance);
    });
  }
  createRoom(roomName, rootSchema) {
    return new Room.Room(roomName, rootSchema);
  }
  buildEndpoint(room, options = {}, protocol = "ws") {
    const params = [];
    if (this.http.authToken) {
      options["_authToken"] = this.http.authToken;
    }
    for (const name in options) {
      if (!options.hasOwnProperty(name)) {
        continue;
      }
      params.push(`${name}=${options[name]}`);
    }
    if (protocol === "h3") {
      protocol = "http";
    }
    let endpoint = this.settings.secure ? `${protocol}s://` : `${protocol}://`;
    if (room.publicAddress) {
      endpoint += `${room.publicAddress}`;
    } else {
      endpoint += `${this.settings.hostname}${this.getEndpointPort()}${this.settings.pathname}`;
    }
    const endpointURL = `${endpoint}/${room.processId}/${room.roomId}?${params.join("&")}`;
    return this.urlBuilder ? this.urlBuilder(new URL(endpointURL)) : endpointURL;
  }
  getHttpEndpoint(segments = "") {
    const path = segments.startsWith("/") ? segments : `/${segments}`;
    const endpointURL = `${this.settings.secure ? "https" : "http"}://${this.settings.hostname}${this.getEndpointPort()}${this.settings.pathname}${path}`;
    return this.urlBuilder ? this.urlBuilder(new URL(endpointURL)) : endpointURL;
  }
  getEndpointPort() {
    return this.settings.port !== 80 && this.settings.port !== 443 ? `:${this.settings.port}` : "";
  }
};
__name(_Client, "Client");
let Client = _Client;
Client.VERSION = "0.16.17";
Client$1.Client = Client;
Client$1.MatchMakeError = MatchMakeError;
var NoneSerializer$1 = {};
const _NoneSerializer = class _NoneSerializer {
  setState(rawState) {
  }
  getState() {
    return null;
  }
  patch(patches) {
  }
  teardown() {
  }
  handshake(bytes) {
  }
};
__name(_NoneSerializer, "NoneSerializer");
let NoneSerializer = _NoneSerializer;
NoneSerializer$1.NoneSerializer = NoneSerializer;
(function(exports) {
  var Client2 = Client$1;
  var Protocol2 = Protocol$1;
  var Room2 = Room$2;
  var Auth2 = Auth$2;
  var ServerError2 = ServerError$3;
  var SchemaSerializer2 = SchemaSerializer$2;
  var NoneSerializer2 = NoneSerializer$1;
  var Serializer2 = Serializer$1;
  Serializer2.registerSerializer("schema", SchemaSerializer2.SchemaSerializer);
  Serializer2.registerSerializer("none", NoneSerializer2.NoneSerializer);
  exports.Client = Client2.Client;
  exports.MatchMakeError = Client2.MatchMakeError;
  Object.defineProperty(exports, "ErrorCode", {
    enumerable: true,
    get: /* @__PURE__ */ __name(function() {
      return Protocol2.ErrorCode;
    }, "get")
  });
  Object.defineProperty(exports, "Protocol", {
    enumerable: true,
    get: /* @__PURE__ */ __name(function() {
      return Protocol2.Protocol;
    }, "get")
  });
  exports.Room = Room2.Room;
  exports.Auth = Auth2.Auth;
  exports.ServerError = ServerError2.ServerError;
  exports.SchemaSerializer = SchemaSerializer2.SchemaSerializer;
  exports.getStateCallbacks = SchemaSerializer2.getStateCallbacks;
  exports.registerSerializer = Serializer2.registerSerializer;
})(cjs);
var umd = { exports: {} };
(function(module, exports) {
  (function(global2, factory) {
    factory(exports);
  })(commonjsGlobal$1, function(exports2) {
    const SWITCH_TO_STRUCTURE = 255;
    const TYPE_ID = 213;
    exports2.OPERATION = void 0;
    (function(OPERATION) {
      OPERATION[OPERATION["ADD"] = 128] = "ADD";
      OPERATION[OPERATION["REPLACE"] = 0] = "REPLACE";
      OPERATION[OPERATION["DELETE"] = 64] = "DELETE";
      OPERATION[OPERATION["DELETE_AND_MOVE"] = 96] = "DELETE_AND_MOVE";
      OPERATION[OPERATION["MOVE_AND_ADD"] = 160] = "MOVE_AND_ADD";
      OPERATION[OPERATION["DELETE_AND_ADD"] = 192] = "DELETE_AND_ADD";
      OPERATION[OPERATION["CLEAR"] = 10] = "CLEAR";
      OPERATION[OPERATION["REVERSE"] = 15] = "REVERSE";
      OPERATION[OPERATION["MOVE"] = 32] = "MOVE";
      OPERATION[OPERATION["DELETE_BY_REFID"] = 33] = "DELETE_BY_REFID";
      OPERATION[OPERATION["ADD_BY_REFID"] = 129] = "ADD_BY_REFID";
    })(exports2.OPERATION || (exports2.OPERATION = {}));
    Symbol.metadata ?? (Symbol.metadata = Symbol.for("Symbol.metadata"));
    const $track = Symbol("$track");
    const $encoder = Symbol("$encoder");
    const $decoder = Symbol("$decoder");
    const $filter = Symbol("$filter");
    const $getByIndex = Symbol("$getByIndex");
    const $deleteByIndex = Symbol("$deleteByIndex");
    const $changes = Symbol("$changes");
    const $childType = Symbol("$childType");
    const $onEncodeEnd = Symbol("$onEncodeEnd");
    const $onDecodeEnd = Symbol("$onDecodeEnd");
    const $descriptors = Symbol("$descriptors");
    const $numFields = "$__numFields";
    const $refTypeFieldIndexes = "$__refTypeFieldIndexes";
    const $viewFieldIndexes = "$__viewFieldIndexes";
    const $fieldIndexesByViewTag = "$__fieldIndexesByViewTag";
    let textEncoder2;
    try {
      textEncoder2 = new TextEncoder();
    } catch (e) {
    }
    const _convoBuffer$1 = new ArrayBuffer(8);
    const _int32$1 = new Int32Array(_convoBuffer$1);
    const _float32$1 = new Float32Array(_convoBuffer$1);
    const _float64$1 = new Float64Array(_convoBuffer$1);
    const _int64$1 = new BigInt64Array(_convoBuffer$1);
    const hasBufferByteLength = typeof Buffer !== "undefined" && Buffer.byteLength;
    const utf8Length = hasBufferByteLength ? Buffer.byteLength : function(str, _) {
      var c = 0, length = 0;
      for (var i = 0, l = str.length; i < l; i++) {
        c = str.charCodeAt(i);
        if (c < 128) {
          length += 1;
        } else if (c < 2048) {
          length += 2;
        } else if (c < 55296 || c >= 57344) {
          length += 3;
        } else {
          i++;
          length += 4;
        }
      }
      return length;
    };
    function utf8Write(view2, str, it) {
      var c = 0;
      for (var i = 0, l = str.length; i < l; i++) {
        c = str.charCodeAt(i);
        if (c < 128) {
          view2[it.offset++] = c;
        } else if (c < 2048) {
          view2[it.offset] = 192 | c >> 6;
          view2[it.offset + 1] = 128 | c & 63;
          it.offset += 2;
        } else if (c < 55296 || c >= 57344) {
          view2[it.offset] = 224 | c >> 12;
          view2[it.offset + 1] = 128 | c >> 6 & 63;
          view2[it.offset + 2] = 128 | c & 63;
          it.offset += 3;
        } else {
          i++;
          c = 65536 + ((c & 1023) << 10 | str.charCodeAt(i) & 1023);
          view2[it.offset] = 240 | c >> 18;
          view2[it.offset + 1] = 128 | c >> 12 & 63;
          view2[it.offset + 2] = 128 | c >> 6 & 63;
          view2[it.offset + 3] = 128 | c & 63;
          it.offset += 4;
        }
      }
    }
    __name(utf8Write, "utf8Write");
    function int8$1(bytes, value, it) {
      bytes[it.offset++] = value & 255;
    }
    __name(int8$1, "int8$1");
    function uint8$1(bytes, value, it) {
      bytes[it.offset++] = value & 255;
    }
    __name(uint8$1, "uint8$1");
    function int16$1(bytes, value, it) {
      bytes[it.offset++] = value & 255;
      bytes[it.offset++] = value >> 8 & 255;
    }
    __name(int16$1, "int16$1");
    function uint16$1(bytes, value, it) {
      bytes[it.offset++] = value & 255;
      bytes[it.offset++] = value >> 8 & 255;
    }
    __name(uint16$1, "uint16$1");
    function int32$1(bytes, value, it) {
      bytes[it.offset++] = value & 255;
      bytes[it.offset++] = value >> 8 & 255;
      bytes[it.offset++] = value >> 16 & 255;
      bytes[it.offset++] = value >> 24 & 255;
    }
    __name(int32$1, "int32$1");
    function uint32$1(bytes, value, it) {
      const b4 = value >> 24;
      const b3 = value >> 16;
      const b2 = value >> 8;
      const b1 = value;
      bytes[it.offset++] = b1 & 255;
      bytes[it.offset++] = b2 & 255;
      bytes[it.offset++] = b3 & 255;
      bytes[it.offset++] = b4 & 255;
    }
    __name(uint32$1, "uint32$1");
    function int64$1(bytes, value, it) {
      const high = Math.floor(value / Math.pow(2, 32));
      const low = value >>> 0;
      uint32$1(bytes, low, it);
      uint32$1(bytes, high, it);
    }
    __name(int64$1, "int64$1");
    function uint64$1(bytes, value, it) {
      const high = value / Math.pow(2, 32) >> 0;
      const low = value >>> 0;
      uint32$1(bytes, low, it);
      uint32$1(bytes, high, it);
    }
    __name(uint64$1, "uint64$1");
    function bigint64$1(bytes, value, it) {
      _int64$1[0] = BigInt.asIntN(64, value);
      int32$1(bytes, _int32$1[0], it);
      int32$1(bytes, _int32$1[1], it);
    }
    __name(bigint64$1, "bigint64$1");
    function biguint64$1(bytes, value, it) {
      _int64$1[0] = BigInt.asIntN(64, value);
      int32$1(bytes, _int32$1[0], it);
      int32$1(bytes, _int32$1[1], it);
    }
    __name(biguint64$1, "biguint64$1");
    function float32$1(bytes, value, it) {
      _float32$1[0] = value;
      int32$1(bytes, _int32$1[0], it);
    }
    __name(float32$1, "float32$1");
    function float64$1(bytes, value, it) {
      _float64$1[0] = value;
      int32$1(bytes, _int32$1[0], it);
      int32$1(bytes, _int32$1[1], it);
    }
    __name(float64$1, "float64$1");
    function boolean$1(bytes, value, it) {
      bytes[it.offset++] = value ? 1 : 0;
    }
    __name(boolean$1, "boolean$1");
    function string$1(bytes, value, it) {
      if (!value) {
        value = "";
      }
      let length = utf8Length(value, "utf8");
      let size = 0;
      if (length < 32) {
        bytes[it.offset++] = length | 160;
        size = 1;
      } else if (length < 256) {
        bytes[it.offset++] = 217;
        bytes[it.offset++] = length % 255;
        size = 2;
      } else if (length < 65536) {
        bytes[it.offset++] = 218;
        uint16$1(bytes, length, it);
        size = 3;
      } else if (length < 4294967296) {
        bytes[it.offset++] = 219;
        uint32$1(bytes, length, it);
        size = 5;
      } else {
        throw new Error("String too long");
      }
      utf8Write(bytes, value, it);
      return size + length;
    }
    __name(string$1, "string$1");
    function number$1(bytes, value, it) {
      if (isNaN(value)) {
        return number$1(bytes, 0, it);
      } else if (!isFinite(value)) {
        return number$1(bytes, value > 0 ? Number.MAX_SAFE_INTEGER : -Number.MAX_SAFE_INTEGER, it);
      } else if (value !== (value | 0)) {
        if (Math.abs(value) <= 34028235e31) {
          _float32$1[0] = value;
          if (Math.abs(Math.abs(_float32$1[0]) - Math.abs(value)) < 1e-4) {
            bytes[it.offset++] = 202;
            float32$1(bytes, value, it);
            return 5;
          }
        }
        bytes[it.offset++] = 203;
        float64$1(bytes, value, it);
        return 9;
      }
      if (value >= 0) {
        if (value < 128) {
          bytes[it.offset++] = value & 255;
          return 1;
        }
        if (value < 256) {
          bytes[it.offset++] = 204;
          bytes[it.offset++] = value & 255;
          return 2;
        }
        if (value < 65536) {
          bytes[it.offset++] = 205;
          uint16$1(bytes, value, it);
          return 3;
        }
        if (value < 4294967296) {
          bytes[it.offset++] = 206;
          uint32$1(bytes, value, it);
          return 5;
        }
        bytes[it.offset++] = 207;
        uint64$1(bytes, value, it);
        return 9;
      } else {
        if (value >= -32) {
          bytes[it.offset++] = 224 | value + 32;
          return 1;
        }
        if (value >= -128) {
          bytes[it.offset++] = 208;
          int8$1(bytes, value, it);
          return 2;
        }
        if (value >= -32768) {
          bytes[it.offset++] = 209;
          int16$1(bytes, value, it);
          return 3;
        }
        if (value >= -2147483648) {
          bytes[it.offset++] = 210;
          int32$1(bytes, value, it);
          return 5;
        }
        bytes[it.offset++] = 211;
        int64$1(bytes, value, it);
        return 9;
      }
    }
    __name(number$1, "number$1");
    const encode2 = {
      int8: int8$1,
      uint8: uint8$1,
      int16: int16$1,
      uint16: uint16$1,
      int32: int32$1,
      uint32: uint32$1,
      int64: int64$1,
      uint64: uint64$1,
      bigint64: bigint64$1,
      biguint64: biguint64$1,
      float32: float32$1,
      float64: float64$1,
      boolean: boolean$1,
      string: string$1,
      number: number$1,
      utf8Write,
      utf8Length
    };
    const _convoBuffer = new ArrayBuffer(8);
    const _int32 = new Int32Array(_convoBuffer);
    const _float32 = new Float32Array(_convoBuffer);
    const _float64 = new Float64Array(_convoBuffer);
    const _uint64 = new BigUint64Array(_convoBuffer);
    const _int64 = new BigInt64Array(_convoBuffer);
    function utf8Read(bytes, it, length) {
      var string2 = "", chr = 0;
      for (var i = it.offset, end = it.offset + length; i < end; i++) {
        var byte = bytes[i];
        if ((byte & 128) === 0) {
          string2 += String.fromCharCode(byte);
          continue;
        }
        if ((byte & 224) === 192) {
          string2 += String.fromCharCode((byte & 31) << 6 | bytes[++i] & 63);
          continue;
        }
        if ((byte & 240) === 224) {
          string2 += String.fromCharCode((byte & 15) << 12 | (bytes[++i] & 63) << 6 | (bytes[++i] & 63) << 0);
          continue;
        }
        if ((byte & 248) === 240) {
          chr = (byte & 7) << 18 | (bytes[++i] & 63) << 12 | (bytes[++i] & 63) << 6 | (bytes[++i] & 63) << 0;
          if (chr >= 65536) {
            chr -= 65536;
            string2 += String.fromCharCode((chr >>> 10) + 55296, (chr & 1023) + 56320);
          } else {
            string2 += String.fromCharCode(chr);
          }
          continue;
        }
        console.error("Invalid byte " + byte.toString(16));
      }
      it.offset += length;
      return string2;
    }
    __name(utf8Read, "utf8Read");
    function int8(bytes, it) {
      return uint8(bytes, it) << 24 >> 24;
    }
    __name(int8, "int8");
    function uint8(bytes, it) {
      return bytes[it.offset++];
    }
    __name(uint8, "uint8");
    function int16(bytes, it) {
      return uint16(bytes, it) << 16 >> 16;
    }
    __name(int16, "int16");
    function uint16(bytes, it) {
      return bytes[it.offset++] | bytes[it.offset++] << 8;
    }
    __name(uint16, "uint16");
    function int32(bytes, it) {
      return bytes[it.offset++] | bytes[it.offset++] << 8 | bytes[it.offset++] << 16 | bytes[it.offset++] << 24;
    }
    __name(int32, "int32");
    function uint32(bytes, it) {
      return int32(bytes, it) >>> 0;
    }
    __name(uint32, "uint32");
    function float32(bytes, it) {
      _int32[0] = int32(bytes, it);
      return _float32[0];
    }
    __name(float32, "float32");
    function float64(bytes, it) {
      _int32[0] = int32(bytes, it);
      _int32[1] = int32(bytes, it);
      return _float64[0];
    }
    __name(float64, "float64");
    function int64(bytes, it) {
      const low = uint32(bytes, it);
      const high = int32(bytes, it) * Math.pow(2, 32);
      return high + low;
    }
    __name(int64, "int64");
    function uint64(bytes, it) {
      const low = uint32(bytes, it);
      const high = uint32(bytes, it) * Math.pow(2, 32);
      return high + low;
    }
    __name(uint64, "uint64");
    function bigint64(bytes, it) {
      _int32[0] = int32(bytes, it);
      _int32[1] = int32(bytes, it);
      return _int64[0];
    }
    __name(bigint64, "bigint64");
    function biguint64(bytes, it) {
      _int32[0] = int32(bytes, it);
      _int32[1] = int32(bytes, it);
      return _uint64[0];
    }
    __name(biguint64, "biguint64");
    function boolean(bytes, it) {
      return uint8(bytes, it) > 0;
    }
    __name(boolean, "boolean");
    function string(bytes, it) {
      const prefix = bytes[it.offset++];
      let length;
      if (prefix < 192) {
        length = prefix & 31;
      } else if (prefix === 217) {
        length = uint8(bytes, it);
      } else if (prefix === 218) {
        length = uint16(bytes, it);
      } else if (prefix === 219) {
        length = uint32(bytes, it);
      }
      return utf8Read(bytes, it, length);
    }
    __name(string, "string");
    function number(bytes, it) {
      const prefix = bytes[it.offset++];
      if (prefix < 128) {
        return prefix;
      } else if (prefix === 202) {
        return float32(bytes, it);
      } else if (prefix === 203) {
        return float64(bytes, it);
      } else if (prefix === 204) {
        return uint8(bytes, it);
      } else if (prefix === 205) {
        return uint16(bytes, it);
      } else if (prefix === 206) {
        return uint32(bytes, it);
      } else if (prefix === 207) {
        return uint64(bytes, it);
      } else if (prefix === 208) {
        return int8(bytes, it);
      } else if (prefix === 209) {
        return int16(bytes, it);
      } else if (prefix === 210) {
        return int32(bytes, it);
      } else if (prefix === 211) {
        return int64(bytes, it);
      } else if (prefix > 223) {
        return (255 - prefix + 1) * -1;
      }
    }
    __name(number, "number");
    function stringCheck(bytes, it) {
      const prefix = bytes[it.offset];
      return (
        // fixstr
        prefix < 192 && prefix > 160 || // str 8
        prefix === 217 || // str 16
        prefix === 218 || // str 32
        prefix === 219
      );
    }
    __name(stringCheck, "stringCheck");
    const decode2 = {
      utf8Read,
      int8,
      uint8,
      int16,
      uint16,
      int32,
      uint32,
      float32,
      float64,
      int64,
      uint64,
      bigint64,
      biguint64,
      boolean,
      string,
      number,
      stringCheck
    };
    const registeredTypes = {};
    const identifiers = /* @__PURE__ */ new Map();
    function registerType(identifier, definition) {
      if (definition.constructor) {
        identifiers.set(definition.constructor, identifier);
        registeredTypes[identifier] = definition;
      }
      if (definition.encode) {
        encode2[identifier] = definition.encode;
      }
      if (definition.decode) {
        decode2[identifier] = definition.decode;
      }
    }
    __name(registerType, "registerType");
    function getType(identifier) {
      return registeredTypes[identifier];
    }
    __name(getType, "getType");
    function defineCustomTypes(types) {
      for (const identifier in types) {
        registerType(identifier, types[identifier]);
      }
      return (t) => type(t);
    }
    __name(defineCustomTypes, "defineCustomTypes");
    const _TypeContext = class _TypeContext {
      static register(target2) {
        const parent = Object.getPrototypeOf(target2);
        if (parent !== Schema) {
          let inherits = _TypeContext.inheritedTypes.get(parent);
          if (!inherits) {
            inherits = /* @__PURE__ */ new Set();
            _TypeContext.inheritedTypes.set(parent, inherits);
          }
          inherits.add(target2);
        }
      }
      static cache(rootClass) {
        let context = _TypeContext.cachedContexts.get(rootClass);
        if (!context) {
          context = new _TypeContext(rootClass);
          _TypeContext.cachedContexts.set(rootClass, context);
        }
        return context;
      }
      constructor(rootClass) {
        this.types = {};
        this.schemas = /* @__PURE__ */ new Map();
        this.hasFilters = false;
        this.parentFiltered = {};
        if (rootClass) {
          this.discoverTypes(rootClass);
        }
      }
      has(schema3) {
        return this.schemas.has(schema3);
      }
      get(typeid) {
        return this.types[typeid];
      }
      add(schema3, typeid = this.schemas.size) {
        if (this.schemas.has(schema3)) {
          return false;
        }
        this.types[typeid] = schema3;
        if (schema3[Symbol.metadata] === void 0) {
          Metadata.initialize(schema3);
        }
        this.schemas.set(schema3, typeid);
        return true;
      }
      getTypeId(klass) {
        return this.schemas.get(klass);
      }
      discoverTypes(klass, parentType, parentIndex, parentHasViewTag) {
        var _a4, _b3;
        if (parentHasViewTag) {
          this.registerFilteredByParent(klass, parentType, parentIndex);
        }
        if (!this.add(klass)) {
          return;
        }
        (_a4 = _TypeContext.inheritedTypes.get(klass)) == null ? void 0 : _a4.forEach((child) => {
          this.discoverTypes(child, parentType, parentIndex, parentHasViewTag);
        });
        let parent = klass;
        while ((parent = Object.getPrototypeOf(parent)) && parent !== Schema && // stop at root (Schema)
        parent !== Function.prototype) {
          this.discoverTypes(parent);
        }
        const metadata = klass[_b3 = Symbol.metadata] ?? (klass[_b3] = {});
        if (metadata[$viewFieldIndexes]) {
          this.hasFilters = true;
        }
        for (const fieldIndex in metadata) {
          const index = fieldIndex;
          const fieldType = metadata[index].type;
          const fieldHasViewTag = metadata[index].tag !== void 0;
          if (typeof fieldType === "string") {
            continue;
          }
          if (Array.isArray(fieldType)) {
            const type2 = fieldType[0];
            if (type2 === "string") {
              continue;
            }
            this.discoverTypes(type2, klass, index, parentHasViewTag || fieldHasViewTag);
          } else if (typeof fieldType === "function") {
            this.discoverTypes(fieldType, klass, index, parentHasViewTag || fieldHasViewTag);
          } else {
            const type2 = Object.values(fieldType)[0];
            if (typeof type2 === "string") {
              continue;
            }
            this.discoverTypes(type2, klass, index, parentHasViewTag || fieldHasViewTag);
          }
        }
      }
      /**
       * Keep track of which classes have filters applied.
       * Format: `${typeid}-${parentTypeid}-${parentIndex}`
       */
      registerFilteredByParent(schema3, parentType, parentIndex) {
        const typeid = this.schemas.get(schema3) ?? this.schemas.size;
        let key = `${typeid}`;
        if (parentType) {
          key += `-${this.schemas.get(parentType)}`;
        }
        key += `-${parentIndex}`;
        this.parentFiltered[key] = true;
      }
      debug() {
        let parentFiltered = "";
        for (const key in this.parentFiltered) {
          const keys = key.split("-").map(Number);
          const fieldIndex = keys.pop();
          parentFiltered += `
		`;
          parentFiltered += `${key}: ${keys.reverse().map((id, i) => {
            const klass = this.types[id];
            const metadata = klass[Symbol.metadata];
            let txt = klass.name;
            if (i === 0) {
              txt += `[${metadata[fieldIndex].name}]`;
            }
            return `${txt}`;
          }).join(" -> ")}`;
        }
        return `TypeContext ->
	Schema types: ${this.schemas.size}
	hasFilters: ${this.hasFilters}
	parentFiltered:${parentFiltered}`;
      }
    };
    __name(_TypeContext, "TypeContext");
    _TypeContext.inheritedTypes = /* @__PURE__ */ new Map();
    _TypeContext.cachedContexts = /* @__PURE__ */ new Map();
    let TypeContext = _TypeContext;
    function getNormalizedType(type2) {
      return Array.isArray(type2) ? { array: type2[0] } : typeof type2["type"] !== "undefined" ? type2["type"] : type2;
    }
    __name(getNormalizedType, "getNormalizedType");
    const Metadata = {
      addField(metadata, index, name, type2, descriptor) {
        if (index > 64) {
          throw new Error(`Can't define field '${name}'.
Schema instances may only have up to 64 fields.`);
        }
        metadata[index] = Object.assign(
          metadata[index] || {},
          // avoid overwriting previous field metadata (@owned / @deprecated)
          {
            type: getNormalizedType(type2),
            index,
            name
          }
        );
        Object.defineProperty(metadata, $descriptors, {
          value: metadata[$descriptors] || {},
          enumerable: false,
          configurable: true
        });
        if (descriptor) {
          metadata[$descriptors][name] = descriptor;
          metadata[$descriptors][`_${name}`] = {
            value: void 0,
            writable: true,
            enumerable: false,
            configurable: true
          };
        } else {
          metadata[$descriptors][name] = {
            value: void 0,
            writable: true,
            enumerable: true,
            configurable: true
          };
        }
        Object.defineProperty(metadata, $numFields, {
          value: index,
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(metadata, name, {
          value: index,
          enumerable: false,
          configurable: true
        });
        if (typeof metadata[index].type !== "string") {
          if (metadata[$refTypeFieldIndexes] === void 0) {
            Object.defineProperty(metadata, $refTypeFieldIndexes, {
              value: [],
              enumerable: false,
              configurable: true
            });
          }
          metadata[$refTypeFieldIndexes].push(index);
        }
      },
      setTag(metadata, fieldName, tag) {
        const index = metadata[fieldName];
        const field = metadata[index];
        field.tag = tag;
        if (!metadata[$viewFieldIndexes]) {
          Object.defineProperty(metadata, $viewFieldIndexes, {
            value: [],
            enumerable: false,
            configurable: true
          });
          Object.defineProperty(metadata, $fieldIndexesByViewTag, {
            value: {},
            enumerable: false,
            configurable: true
          });
        }
        metadata[$viewFieldIndexes].push(index);
        if (!metadata[$fieldIndexesByViewTag][tag]) {
          metadata[$fieldIndexesByViewTag][tag] = [];
        }
        metadata[$fieldIndexesByViewTag][tag].push(index);
      },
      setFields(target2, fields) {
        const constructor = target2.prototype.constructor;
        TypeContext.register(constructor);
        const parentClass = Object.getPrototypeOf(constructor);
        const parentMetadata = parentClass && parentClass[Symbol.metadata];
        const metadata = Metadata.initialize(constructor);
        if (!constructor[$track]) {
          constructor[$track] = Schema[$track];
        }
        if (!constructor[$encoder]) {
          constructor[$encoder] = Schema[$encoder];
        }
        if (!constructor[$decoder]) {
          constructor[$decoder] = Schema[$decoder];
        }
        if (!constructor.prototype.toJSON) {
          constructor.prototype.toJSON = Schema.prototype.toJSON;
        }
        let fieldIndex = metadata[$numFields] ?? (parentMetadata && parentMetadata[$numFields]) ?? -1;
        fieldIndex++;
        for (const field in fields) {
          const type2 = fields[field];
          const complexTypeKlass = Array.isArray(type2) ? getType("array") : typeof Object.keys(type2)[0] === "string" && getType(Object.keys(type2)[0]);
          const childType = complexTypeKlass ? Object.values(type2)[0] : getNormalizedType(type2);
          Metadata.addField(metadata, fieldIndex, field, type2, getPropertyDescriptor(`_${field}`, fieldIndex, childType, complexTypeKlass));
          fieldIndex++;
        }
        return target2;
      },
      isDeprecated(metadata, field) {
        return metadata[field].deprecated === true;
      },
      init(klass) {
        const metadata = {};
        klass[Symbol.metadata] = metadata;
        Object.defineProperty(metadata, $numFields, {
          value: 0,
          enumerable: false,
          configurable: true
        });
      },
      initialize(constructor) {
        const parentClass = Object.getPrototypeOf(constructor);
        const parentMetadata = parentClass[Symbol.metadata];
        let metadata = constructor[Symbol.metadata] ?? /* @__PURE__ */ Object.create(null);
        if (parentClass !== Schema && metadata === parentMetadata) {
          metadata = /* @__PURE__ */ Object.create(null);
          if (parentMetadata) {
            Object.setPrototypeOf(metadata, parentMetadata);
            Object.defineProperty(metadata, $numFields, {
              value: parentMetadata[$numFields],
              enumerable: false,
              configurable: true,
              writable: true
            });
            if (parentMetadata[$viewFieldIndexes] !== void 0) {
              Object.defineProperty(metadata, $viewFieldIndexes, {
                value: [...parentMetadata[$viewFieldIndexes]],
                enumerable: false,
                configurable: true,
                writable: true
              });
              Object.defineProperty(metadata, $fieldIndexesByViewTag, {
                value: { ...parentMetadata[$fieldIndexesByViewTag] },
                enumerable: false,
                configurable: true,
                writable: true
              });
            }
            if (parentMetadata[$refTypeFieldIndexes] !== void 0) {
              Object.defineProperty(metadata, $refTypeFieldIndexes, {
                value: [...parentMetadata[$refTypeFieldIndexes]],
                enumerable: false,
                configurable: true,
                writable: true
              });
            }
            Object.defineProperty(metadata, $descriptors, {
              value: { ...parentMetadata[$descriptors] },
              enumerable: false,
              configurable: true,
              writable: true
            });
          }
        }
        constructor[Symbol.metadata] = metadata;
        return metadata;
      },
      isValidInstance(klass) {
        return klass.constructor[Symbol.metadata] && Object.prototype.hasOwnProperty.call(klass.constructor[Symbol.metadata], $numFields);
      },
      getFields(klass) {
        const metadata = klass[Symbol.metadata];
        const fields = {};
        for (let i = 0; i <= metadata[$numFields]; i++) {
          fields[metadata[i].name] = metadata[i].type;
        }
        return fields;
      },
      hasViewTagAtIndex(metadata, index) {
        var _a4;
        return (_a4 = metadata == null ? void 0 : metadata[$viewFieldIndexes]) == null ? void 0 : _a4.includes(index);
      }
    };
    function createChangeSet() {
      return { indexes: {}, operations: [] };
    }
    __name(createChangeSet, "createChangeSet");
    function setOperationAtIndex(changeSet, index) {
      const operationsIndex = changeSet.indexes[index];
      if (operationsIndex === void 0) {
        changeSet.indexes[index] = changeSet.operations.push(index) - 1;
      } else {
        changeSet.operations[operationsIndex] = index;
      }
    }
    __name(setOperationAtIndex, "setOperationAtIndex");
    function deleteOperationAtIndex(changeSet, index) {
      var _a4;
      let operationsIndex = changeSet.indexes[index];
      if (operationsIndex === void 0) {
        operationsIndex = Object.values(changeSet.indexes).at(-1);
        index = (_a4 = Object.entries(changeSet.indexes).find(([_, value]) => value === operationsIndex)) == null ? void 0 : _a4[0];
      }
      changeSet.operations[operationsIndex] = void 0;
      delete changeSet.indexes[index];
    }
    __name(deleteOperationAtIndex, "deleteOperationAtIndex");
    function enqueueChangeTree(root, changeTree, changeSet, queueRootIndex = changeTree[changeSet].queueRootIndex) {
      if (!root) {
        return;
      } else if (root[changeSet][queueRootIndex] !== changeTree) {
        changeTree[changeSet].queueRootIndex = root[changeSet].push(changeTree) - 1;
      }
    }
    __name(enqueueChangeTree, "enqueueChangeTree");
    const _ChangeTree = class _ChangeTree {
      constructor(ref) {
        this.isFiltered = false;
        this.indexedOperations = {};
        this.changes = { indexes: {}, operations: [] };
        this.allChanges = { indexes: {}, operations: [] };
        this.isNew = true;
        this.ref = ref;
        const metadata = ref.constructor[Symbol.metadata];
        if (metadata == null ? void 0 : metadata[$viewFieldIndexes]) {
          this.allFilteredChanges = { indexes: {}, operations: [] };
          this.filteredChanges = { indexes: {}, operations: [] };
        }
      }
      setRoot(root) {
        var _a4;
        this.root = root;
        this.checkIsFiltered(this.parent, this.parentIndex);
        const metadata = this.ref.constructor[Symbol.metadata];
        if (metadata) {
          (_a4 = metadata[$refTypeFieldIndexes]) == null ? void 0 : _a4.forEach((index) => {
            const field = metadata[index];
            const value = this.ref[field.name];
            value == null ? void 0 : value[$changes].setRoot(root);
          });
        } else if (this.ref[$childType] && typeof this.ref[$childType] !== "string") {
          this.ref.forEach((value, key) => {
            value[$changes].setRoot(root);
          });
        }
      }
      setParent(parent, root, parentIndex) {
        var _a4;
        this.parent = parent;
        this.parentIndex = parentIndex;
        if (!root) {
          return;
        }
        if (root !== this.root) {
          this.root = root;
          this.checkIsFiltered(parent, parentIndex);
        } else {
          root.add(this);
        }
        const metadata = this.ref.constructor[Symbol.metadata];
        if (metadata) {
          (_a4 = metadata[$refTypeFieldIndexes]) == null ? void 0 : _a4.forEach((index) => {
            const field = metadata[index];
            const value = this.ref[field.name];
            value == null ? void 0 : value[$changes].setParent(this.ref, root, index);
          });
        } else if (this.ref[$childType] && typeof this.ref[$childType] !== "string") {
          this.ref.forEach((value, key) => {
            value[$changes].setParent(this.ref, root, this.indexes[key] ?? key);
          });
        }
      }
      forEachChild(callback) {
        var _a4;
        const metadata = this.ref.constructor[Symbol.metadata];
        if (metadata) {
          (_a4 = metadata[$refTypeFieldIndexes]) == null ? void 0 : _a4.forEach((index) => {
            const field = metadata[index];
            const value = this.ref[field.name];
            if (value) {
              callback(value[$changes], index);
            }
          });
        } else if (this.ref[$childType] && typeof this.ref[$childType] !== "string") {
          this.ref.forEach((value, key) => {
            callback(value[$changes], this.indexes[key] ?? key);
          });
        }
      }
      operation(op) {
        if (this.filteredChanges !== void 0) {
          this.filteredChanges.operations.push(-op);
          enqueueChangeTree(this.root, this, "filteredChanges");
        } else {
          this.changes.operations.push(-op);
          enqueueChangeTree(this.root, this, "changes");
        }
      }
      change(index, operation = exports2.OPERATION.ADD) {
        var _a4;
        const metadata = this.ref.constructor[Symbol.metadata];
        const isFiltered = this.isFiltered || ((_a4 = metadata == null ? void 0 : metadata[index]) == null ? void 0 : _a4.tag) !== void 0;
        const changeSet = isFiltered ? this.filteredChanges : this.changes;
        const previousOperation = this.indexedOperations[index];
        if (!previousOperation || previousOperation === exports2.OPERATION.DELETE) {
          const op = !previousOperation ? operation : previousOperation === exports2.OPERATION.DELETE ? exports2.OPERATION.DELETE_AND_ADD : operation;
          this.indexedOperations[index] = op;
        }
        setOperationAtIndex(changeSet, index);
        if (isFiltered) {
          setOperationAtIndex(this.allFilteredChanges, index);
          if (this.root) {
            enqueueChangeTree(this.root, this, "filteredChanges");
            enqueueChangeTree(this.root, this, "allFilteredChanges");
          }
        } else {
          setOperationAtIndex(this.allChanges, index);
          enqueueChangeTree(this.root, this, "changes");
        }
      }
      shiftChangeIndexes(shiftIndex) {
        const changeSet = this.isFiltered ? this.filteredChanges : this.changes;
        const newIndexedOperations = {};
        const newIndexes = {};
        for (const index in this.indexedOperations) {
          newIndexedOperations[Number(index) + shiftIndex] = this.indexedOperations[index];
          newIndexes[Number(index) + shiftIndex] = changeSet.indexes[index];
        }
        this.indexedOperations = newIndexedOperations;
        changeSet.indexes = newIndexes;
        changeSet.operations = changeSet.operations.map((index) => index + shiftIndex);
      }
      shiftAllChangeIndexes(shiftIndex, startIndex = 0) {
        if (this.filteredChanges !== void 0) {
          this._shiftAllChangeIndexes(shiftIndex, startIndex, this.allFilteredChanges);
          this._shiftAllChangeIndexes(shiftIndex, startIndex, this.allChanges);
        } else {
          this._shiftAllChangeIndexes(shiftIndex, startIndex, this.allChanges);
        }
      }
      _shiftAllChangeIndexes(shiftIndex, startIndex = 0, changeSet) {
        const newIndexes = {};
        let newKey = 0;
        for (const key in changeSet.indexes) {
          newIndexes[newKey++] = changeSet.indexes[key];
        }
        changeSet.indexes = newIndexes;
        for (let i = 0; i < changeSet.operations.length; i++) {
          const index = changeSet.operations[i];
          if (index > startIndex) {
            changeSet.operations[i] = index + shiftIndex;
          }
        }
      }
      indexedOperation(index, operation, allChangesIndex = index) {
        this.indexedOperations[index] = operation;
        if (this.filteredChanges !== void 0) {
          setOperationAtIndex(this.allFilteredChanges, allChangesIndex);
          setOperationAtIndex(this.filteredChanges, index);
          enqueueChangeTree(this.root, this, "filteredChanges");
        } else {
          setOperationAtIndex(this.allChanges, allChangesIndex);
          setOperationAtIndex(this.changes, index);
          enqueueChangeTree(this.root, this, "changes");
        }
      }
      getType(index) {
        if (Metadata.isValidInstance(this.ref)) {
          const metadata = this.ref.constructor[Symbol.metadata];
          return metadata[index].type;
        } else {
          return this.ref[$childType];
        }
      }
      getChange(index) {
        return this.indexedOperations[index];
      }
      //
      // used during `.encode()`
      //
      getValue(index, isEncodeAll = false) {
        return this.ref[$getByIndex](index, isEncodeAll);
      }
      delete(index, operation, allChangesIndex = index) {
        var _a4;
        if (index === void 0) {
          try {
            throw new Error(`@colyseus/schema ${this.ref.constructor.name}: trying to delete non-existing index '${index}'`);
          } catch (e) {
            console.warn(e);
          }
          return;
        }
        const changeSet = this.filteredChanges !== void 0 ? this.filteredChanges : this.changes;
        this.indexedOperations[index] = operation ?? exports2.OPERATION.DELETE;
        setOperationAtIndex(changeSet, index);
        deleteOperationAtIndex(this.allChanges, allChangesIndex);
        const previousValue = this.getValue(index);
        if (previousValue && previousValue[$changes]) {
          (_a4 = this.root) == null ? void 0 : _a4.remove(previousValue[$changes]);
        }
        if (this.filteredChanges !== void 0) {
          deleteOperationAtIndex(this.allFilteredChanges, allChangesIndex);
          enqueueChangeTree(this.root, this, "filteredChanges");
        } else {
          enqueueChangeTree(this.root, this, "changes");
        }
        return previousValue;
      }
      endEncode(changeSetName) {
        var _a4, _b3;
        this.indexedOperations = {};
        this[changeSetName].indexes = {};
        this[changeSetName].operations.length = 0;
        this[changeSetName].queueRootIndex = void 0;
        (_b3 = (_a4 = this.ref)[$onEncodeEnd]) == null ? void 0 : _b3.call(_a4);
        this.isNew = false;
      }
      discard(discardAll = false) {
        var _a4, _b3;
        (_b3 = (_a4 = this.ref)[$onEncodeEnd]) == null ? void 0 : _b3.call(_a4);
        this.indexedOperations = {};
        this.changes.indexes = {};
        this.changes.operations.length = 0;
        this.changes.queueRootIndex = void 0;
        if (this.filteredChanges !== void 0) {
          this.filteredChanges.indexes = {};
          this.filteredChanges.operations.length = 0;
          this.filteredChanges.queueRootIndex = void 0;
        }
        if (discardAll) {
          this.allChanges.indexes = {};
          this.allChanges.operations.length = 0;
          if (this.allFilteredChanges !== void 0) {
            this.allFilteredChanges.indexes = {};
            this.allFilteredChanges.operations.length = 0;
          }
          this.forEachChild((changeTree, _) => {
            var _a5;
            return (_a5 = this.root) == null ? void 0 : _a5.remove(changeTree);
          });
        }
      }
      /**
       * Recursively discard all changes from this, and child structures.
       */
      discardAll() {
        const keys = Object.keys(this.indexedOperations);
        for (let i = 0, len = keys.length; i < len; i++) {
          const value = this.getValue(Number(keys[i]));
          if (value && value[$changes]) {
            value[$changes].discardAll();
          }
        }
        this.discard();
      }
      ensureRefId() {
        if (this.refId !== void 0) {
          return;
        }
        this.refId = this.root.getNextUniqueId();
      }
      get changed() {
        return Object.entries(this.indexedOperations).length > 0;
      }
      checkIsFiltered(parent, parentIndex) {
        const isNewChangeTree = this.root.add(this);
        if (this.root.types.hasFilters) {
          this._checkFilteredByParent(parent, parentIndex);
          if (this.filteredChanges !== void 0) {
            enqueueChangeTree(this.root, this, "filteredChanges");
            if (isNewChangeTree) {
              this.root.allFilteredChanges.push(this);
            }
          }
        }
        if (!this.isFiltered) {
          enqueueChangeTree(this.root, this, "changes");
          if (isNewChangeTree) {
            this.root.allChanges.push(this);
          }
        }
      }
      _checkFilteredByParent(parent, parentIndex) {
        if (!parent) {
          return;
        }
        const refType = Metadata.isValidInstance(this.ref) ? this.ref.constructor : this.ref[$childType];
        let parentChangeTree;
        let parentIsCollection = !Metadata.isValidInstance(parent);
        if (parentIsCollection) {
          parentChangeTree = parent[$changes];
          parent = parentChangeTree.parent;
          parentIndex = parentChangeTree.parentIndex;
        } else {
          parentChangeTree = parent[$changes];
        }
        const parentConstructor = parent.constructor;
        let key = `${this.root.types.getTypeId(refType)}`;
        if (parentConstructor) {
          key += `-${this.root.types.schemas.get(parentConstructor)}`;
        }
        key += `-${parentIndex}`;
        const fieldHasViewTag = Metadata.hasViewTagAtIndex(parentConstructor == null ? void 0 : parentConstructor[Symbol.metadata], parentIndex);
        this.isFiltered = parent[$changes].isFiltered || this.root.types.parentFiltered[key] || fieldHasViewTag;
        if (this.isFiltered) {
          this.isVisibilitySharedWithParent = parentChangeTree.isFiltered && typeof refType !== "string" && !fieldHasViewTag && parentIsCollection;
          if (!this.filteredChanges) {
            this.filteredChanges = createChangeSet();
            this.allFilteredChanges = createChangeSet();
          }
          if (this.changes.operations.length > 0) {
            this.changes.operations.forEach((index) => setOperationAtIndex(this.filteredChanges, index));
            this.allChanges.operations.forEach((index) => setOperationAtIndex(this.allFilteredChanges, index));
            this.changes = createChangeSet();
            this.allChanges = createChangeSet();
          }
        }
      }
    };
    __name(_ChangeTree, "ChangeTree");
    let ChangeTree = _ChangeTree;
    function encodeValue(encoder, bytes, type2, value, operation, it) {
      var _a4;
      if (typeof type2 === "string") {
        (_a4 = encode2[type2]) == null ? void 0 : _a4.call(encode2, bytes, value, it);
      } else if (type2[Symbol.metadata] !== void 0) {
        encode2.number(bytes, value[$changes].refId, it);
        if ((operation & exports2.OPERATION.ADD) === exports2.OPERATION.ADD) {
          encoder.tryEncodeTypeId(bytes, type2, value.constructor, it);
        }
      } else {
        encode2.number(bytes, value[$changes].refId, it);
      }
    }
    __name(encodeValue, "encodeValue");
    const encodeSchemaOperation = /* @__PURE__ */ __name(function(encoder, bytes, changeTree, index, operation, it, _, __, metadata) {
      bytes[it.offset++] = (index | operation) & 255;
      if (operation === exports2.OPERATION.DELETE) {
        return;
      }
      const ref = changeTree.ref;
      const field = metadata[index];
      encodeValue(encoder, bytes, metadata[index].type, ref[field.name], operation, it);
    }, "encodeSchemaOperation");
    const encodeKeyValueOperation = /* @__PURE__ */ __name(function(encoder, bytes, changeTree, index, operation, it) {
      bytes[it.offset++] = operation & 255;
      if (operation === exports2.OPERATION.CLEAR) {
        return;
      }
      encode2.number(bytes, index, it);
      if (operation === exports2.OPERATION.DELETE) {
        return;
      }
      const ref = changeTree.ref;
      if ((operation & exports2.OPERATION.ADD) === exports2.OPERATION.ADD) {
        if (typeof ref["set"] === "function") {
          const dynamicIndex = changeTree.ref["$indexes"].get(index);
          encode2.string(bytes, dynamicIndex, it);
        }
      }
      const type2 = ref[$childType];
      const value = ref[$getByIndex](index);
      encodeValue(encoder, bytes, type2, value, operation, it);
    }, "encodeKeyValueOperation");
    const encodeArray = /* @__PURE__ */ __name(function(encoder, bytes, changeTree, field, operation, it, isEncodeAll, hasView) {
      const ref = changeTree.ref;
      const useOperationByRefId = hasView && changeTree.isFiltered && typeof changeTree.getType(field) !== "string";
      let refOrIndex;
      if (useOperationByRefId) {
        refOrIndex = ref["tmpItems"][field][$changes].refId;
        if (operation === exports2.OPERATION.DELETE) {
          operation = exports2.OPERATION.DELETE_BY_REFID;
        } else if (operation === exports2.OPERATION.ADD) {
          operation = exports2.OPERATION.ADD_BY_REFID;
        }
      } else {
        refOrIndex = field;
      }
      bytes[it.offset++] = operation & 255;
      if (operation === exports2.OPERATION.CLEAR || operation === exports2.OPERATION.REVERSE) {
        return;
      }
      encode2.number(bytes, refOrIndex, it);
      if (operation === exports2.OPERATION.DELETE || operation === exports2.OPERATION.DELETE_BY_REFID) {
        return;
      }
      const type2 = changeTree.getType(field);
      const value = changeTree.getValue(field, isEncodeAll);
      encodeValue(encoder, bytes, type2, value, operation, it);
    }, "encodeArray");
    const DEFINITION_MISMATCH = -1;
    function decodeValue(decoder2, operation, ref, index, type2, bytes, it, allChanges) {
      const $root = decoder2.root;
      const previousValue = ref[$getByIndex](index);
      let value;
      if ((operation & exports2.OPERATION.DELETE) === exports2.OPERATION.DELETE) {
        const previousRefId = $root.refIds.get(previousValue);
        if (previousRefId !== void 0) {
          $root.removeRef(previousRefId);
        }
        if (operation !== exports2.OPERATION.DELETE_AND_ADD) {
          ref[$deleteByIndex](index);
        }
        value = void 0;
      }
      if (operation === exports2.OPERATION.DELETE) ;
      else if (Schema.is(type2)) {
        const refId = decode2.number(bytes, it);
        value = $root.refs.get(refId);
        if ((operation & exports2.OPERATION.ADD) === exports2.OPERATION.ADD) {
          const childType = decoder2.getInstanceType(bytes, it, type2);
          if (!value) {
            value = decoder2.createInstanceOfType(childType);
          }
          $root.addRef(refId, value, value !== previousValue || // increment ref count if value has changed
          operation === exports2.OPERATION.DELETE_AND_ADD && value === previousValue);
        }
      } else if (typeof type2 === "string") {
        value = decode2[type2](bytes, it);
      } else {
        const typeDef = getType(Object.keys(type2)[0]);
        const refId = decode2.number(bytes, it);
        const valueRef = $root.refs.has(refId) ? previousValue || $root.refs.get(refId) : new typeDef.constructor();
        value = valueRef.clone(true);
        value[$childType] = Object.values(type2)[0];
        if (previousValue) {
          let previousRefId = $root.refIds.get(previousValue);
          if (previousRefId !== void 0 && refId !== previousRefId) {
            const entries = previousValue.entries();
            let iter;
            while ((iter = entries.next()) && !iter.done) {
              const [key, value2] = iter.value;
              if (typeof value2 === "object") {
                previousRefId = $root.refIds.get(value2);
                $root.removeRef(previousRefId);
              }
              allChanges.push({
                ref: previousValue,
                refId: previousRefId,
                op: exports2.OPERATION.DELETE,
                field: key,
                value: void 0,
                previousValue: value2
              });
            }
          }
        }
        $root.addRef(refId, value, valueRef !== previousValue || operation === exports2.OPERATION.DELETE_AND_ADD && valueRef === previousValue);
      }
      return { value, previousValue };
    }
    __name(decodeValue, "decodeValue");
    const decodeSchemaOperation = /* @__PURE__ */ __name(function(decoder2, bytes, it, ref, allChanges) {
      const first_byte = bytes[it.offset++];
      const metadata = ref.constructor[Symbol.metadata];
      const operation = first_byte >> 6 << 6;
      const index = first_byte % (operation || 255);
      const field = metadata[index];
      if (field === void 0) {
        console.warn("@colyseus/schema: field not defined at", { index, ref: ref.constructor.name, metadata });
        return DEFINITION_MISMATCH;
      }
      const { value, previousValue } = decodeValue(decoder2, operation, ref, index, field.type, bytes, it, allChanges);
      if (value !== null && value !== void 0) {
        ref[field.name] = value;
      }
      if (previousValue !== value) {
        allChanges.push({
          ref,
          refId: decoder2.currentRefId,
          op: operation,
          field: field.name,
          value,
          previousValue
        });
      }
    }, "decodeSchemaOperation");
    const decodeKeyValueOperation = /* @__PURE__ */ __name(function(decoder2, bytes, it, ref, allChanges) {
      const operation = bytes[it.offset++];
      if (operation === exports2.OPERATION.CLEAR) {
        decoder2.removeChildRefs(ref, allChanges);
        ref.clear();
        return;
      }
      const index = decode2.number(bytes, it);
      const type2 = ref[$childType];
      let dynamicIndex;
      if ((operation & exports2.OPERATION.ADD) === exports2.OPERATION.ADD) {
        if (typeof ref["set"] === "function") {
          dynamicIndex = decode2.string(bytes, it);
          ref["setIndex"](index, dynamicIndex);
        } else {
          dynamicIndex = index;
        }
      } else {
        dynamicIndex = ref["getIndex"](index);
      }
      const { value, previousValue } = decodeValue(decoder2, operation, ref, index, type2, bytes, it, allChanges);
      if (value !== null && value !== void 0) {
        if (typeof ref["set"] === "function") {
          ref["$items"].set(dynamicIndex, value);
        } else if (typeof ref["$setAt"] === "function") {
          ref["$setAt"](index, value, operation);
        } else if (typeof ref["add"] === "function") {
          const index2 = ref.add(value);
          if (typeof index2 === "number") {
            ref["setIndex"](index2, index2);
          }
        }
      }
      if (previousValue !== value) {
        allChanges.push({
          ref,
          refId: decoder2.currentRefId,
          op: operation,
          field: "",
          // FIXME: remove this
          dynamicIndex,
          value,
          previousValue
        });
      }
    }, "decodeKeyValueOperation");
    const decodeArray = /* @__PURE__ */ __name(function(decoder2, bytes, it, ref, allChanges) {
      let operation = bytes[it.offset++];
      let index;
      if (operation === exports2.OPERATION.CLEAR) {
        decoder2.removeChildRefs(ref, allChanges);
        ref.clear();
        return;
      } else if (operation === exports2.OPERATION.REVERSE) {
        ref.reverse();
        return;
      } else if (operation === exports2.OPERATION.DELETE_BY_REFID) {
        const refId = decode2.number(bytes, it);
        const previousValue2 = decoder2.root.refs.get(refId);
        index = ref.findIndex((value2) => value2 === previousValue2);
        ref[$deleteByIndex](index);
        allChanges.push({
          ref,
          refId: decoder2.currentRefId,
          op: exports2.OPERATION.DELETE,
          field: "",
          // FIXME: remove this
          dynamicIndex: index,
          value: void 0,
          previousValue: previousValue2
        });
        return;
      } else if (operation === exports2.OPERATION.ADD_BY_REFID) {
        const refId = decode2.number(bytes, it);
        const itemByRefId = decoder2.root.refs.get(refId);
        if (itemByRefId) {
          index = ref.findIndex((value2) => value2 === itemByRefId);
        }
        if (index === -1 || index === void 0) {
          index = ref.length;
        }
      } else {
        index = decode2.number(bytes, it);
      }
      const type2 = ref[$childType];
      let dynamicIndex = index;
      const { value, previousValue } = decodeValue(decoder2, operation, ref, index, type2, bytes, it, allChanges);
      if (value !== null && value !== void 0 && value !== previousValue) {
        ref["$setAt"](index, value, operation);
      }
      if (previousValue !== value) {
        allChanges.push({
          ref,
          refId: decoder2.currentRefId,
          op: operation,
          field: "",
          // FIXME: remove this
          dynamicIndex,
          value,
          previousValue
        });
      }
    }, "decodeArray");
    const _EncodeSchemaError = class _EncodeSchemaError extends Error {
    };
    __name(_EncodeSchemaError, "EncodeSchemaError");
    let EncodeSchemaError = _EncodeSchemaError;
    function assertType(value, type2, klass, field) {
      let typeofTarget;
      let allowNull = false;
      switch (type2) {
        case "number":
        case "int8":
        case "uint8":
        case "int16":
        case "uint16":
        case "int32":
        case "uint32":
        case "int64":
        case "uint64":
        case "float32":
        case "float64":
          typeofTarget = "number";
          if (isNaN(value)) {
            console.log(`trying to encode "NaN" in ${klass.constructor.name}#${field}`);
          }
          break;
        case "bigint64":
        case "biguint64":
          typeofTarget = "bigint";
          break;
        case "string":
          typeofTarget = "string";
          allowNull = true;
          break;
        case "boolean":
          return;
        default:
          return;
      }
      if (typeof value !== typeofTarget && (!allowNull || allowNull && value !== null)) {
        let foundValue = `'${JSON.stringify(value)}'${value && value.constructor && ` (${value.constructor.name})` || ""}`;
        throw new EncodeSchemaError(`a '${typeofTarget}' was expected, but ${foundValue} was provided in ${klass.constructor.name}#${field}`);
      }
    }
    __name(assertType, "assertType");
    function assertInstanceType(value, type2, instance, field) {
      if (!(value instanceof type2)) {
        throw new EncodeSchemaError(`a '${type2.name}' was expected, but '${value && value.constructor.name}' was provided in ${instance.constructor.name}#${field}`);
      }
    }
    __name(assertInstanceType, "assertInstanceType");
    var _a$4, _b$4;
    const DEFAULT_SORT = /* @__PURE__ */ __name((a, b) => {
      const A = a.toString();
      const B = b.toString();
      if (A < B)
        return -1;
      else if (A > B)
        return 1;
      else
        return 0;
    }, "DEFAULT_SORT");
    const _ArraySchema = class _ArraySchema {
      /**
       * Determine if a property must be filtered.
       * - If returns false, the property is NOT going to be encoded.
       * - If returns true, the property is going to be encoded.
       *
       * Encoding with "filters" happens in two steps:
       * - First, the encoder iterates over all "not owned" properties and encodes them.
       * - Then, the encoder iterates over all "owned" properties per instance and encodes them.
       */
      static [(_a$4 = $encoder, _b$4 = $decoder, $filter)](ref, index, view2) {
        var _a4;
        return !view2 || typeof ref[$childType] === "string" || view2.isChangeTreeVisible((_a4 = ref["tmpItems"][index]) == null ? void 0 : _a4[$changes]);
      }
      static is(type2) {
        return (
          // type format: ["string"]
          Array.isArray(type2) || // type format: { array: "string" }
          type2["array"] !== void 0
        );
      }
      static from(iterable) {
        return new _ArraySchema(...Array.from(iterable));
      }
      constructor(...items) {
        this.items = [];
        this.tmpItems = [];
        this.deletedIndexes = {};
        this.isMovingItems = false;
        Object.defineProperty(this, $childType, {
          value: void 0,
          enumerable: false,
          writable: true,
          configurable: true
        });
        const proxy = new Proxy(this, {
          get: /* @__PURE__ */ __name((obj, prop) => {
            if (typeof prop !== "symbol" && // FIXME: d8 accuses this as low performance
            !isNaN(prop)) {
              return this.items[prop];
            } else {
              return Reflect.get(obj, prop);
            }
          }, "get"),
          set: /* @__PURE__ */ __name((obj, key, setValue) => {
            var _a4;
            if (typeof key !== "symbol" && !isNaN(key)) {
              if (setValue === void 0 || setValue === null) {
                obj.$deleteAt(key);
              } else {
                if (setValue[$changes]) {
                  assertInstanceType(setValue, obj[$childType], obj, key);
                  const previousValue = obj.items[key];
                  if (!obj.isMovingItems) {
                    obj.$changeAt(Number(key), setValue);
                  } else {
                    if (previousValue !== void 0) {
                      if (setValue[$changes].isNew) {
                        obj[$changes].indexedOperation(Number(key), exports2.OPERATION.MOVE_AND_ADD);
                      } else {
                        if ((obj[$changes].getChange(Number(key)) & exports2.OPERATION.DELETE) === exports2.OPERATION.DELETE) {
                          obj[$changes].indexedOperation(Number(key), exports2.OPERATION.DELETE_AND_MOVE);
                        } else {
                          obj[$changes].indexedOperation(Number(key), exports2.OPERATION.MOVE);
                        }
                      }
                    } else if (setValue[$changes].isNew) {
                      obj[$changes].indexedOperation(Number(key), exports2.OPERATION.ADD);
                    }
                    setValue[$changes].setParent(this, obj[$changes].root, key);
                  }
                  if (previousValue !== void 0) {
                    (_a4 = previousValue[$changes].root) == null ? void 0 : _a4.remove(previousValue[$changes]);
                  }
                } else {
                  obj.$changeAt(Number(key), setValue);
                }
                obj.items[key] = setValue;
                obj.tmpItems[key] = setValue;
              }
              return true;
            } else {
              return Reflect.set(obj, key, setValue);
            }
          }, "set"),
          deleteProperty: /* @__PURE__ */ __name((obj, prop) => {
            if (typeof prop === "number") {
              obj.$deleteAt(prop);
            } else {
              delete obj[prop];
            }
            return true;
          }, "deleteProperty"),
          has: /* @__PURE__ */ __name((obj, key) => {
            if (typeof key !== "symbol" && !isNaN(Number(key))) {
              return Reflect.has(this.items, key);
            }
            return Reflect.has(obj, key);
          }, "has")
        });
        this[$changes] = new ChangeTree(proxy);
        this[$changes].indexes = {};
        if (items.length > 0) {
          this.push(...items);
        }
        return proxy;
      }
      set length(newLength) {
        if (newLength === 0) {
          this.clear();
        } else if (newLength < this.items.length) {
          this.splice(newLength, this.length - newLength);
        } else {
          console.warn("ArraySchema: can't set .length to a higher value than its length.");
        }
      }
      get length() {
        return this.items.length;
      }
      push(...values) {
        var _a4;
        let length = this.tmpItems.length;
        const changeTree = this[$changes];
        for (let i = 0, l = values.length; i < values.length; i++, length++) {
          const value = values[i];
          if (value === void 0 || value === null) {
            return;
          } else if (typeof value === "object" && this[$childType]) {
            assertInstanceType(value, this[$childType], this, i);
          }
          changeTree.indexedOperation(length, exports2.OPERATION.ADD, this.items.length);
          this.items.push(value);
          this.tmpItems.push(value);
          (_a4 = value[$changes]) == null ? void 0 : _a4.setParent(this, changeTree.root, length);
        }
        return length;
      }
      /**
       * Removes the last element from an array and returns it.
       */
      pop() {
        let index = -1;
        for (let i = this.tmpItems.length - 1; i >= 0; i--) {
          if (this.deletedIndexes[i] !== true) {
            index = i;
            break;
          }
        }
        if (index < 0) {
          return void 0;
        }
        this[$changes].delete(index, void 0, this.items.length - 1);
        this.deletedIndexes[index] = true;
        return this.items.pop();
      }
      at(index) {
        if (index < 0)
          index += this.length;
        return this.items[index];
      }
      // encoding only
      $changeAt(index, value) {
        var _a4;
        if (value === void 0 || value === null) {
          console.error("ArraySchema items cannot be null nor undefined; Use `deleteAt(index)` instead.");
          return;
        }
        if (this.items[index] === value) {
          return;
        }
        const operation = this.items[index] !== void 0 ? typeof value === "object" ? exports2.OPERATION.DELETE_AND_ADD : exports2.OPERATION.REPLACE : exports2.OPERATION.ADD;
        const changeTree = this[$changes];
        changeTree.change(index, operation);
        (_a4 = value[$changes]) == null ? void 0 : _a4.setParent(this, changeTree.root, index);
      }
      // encoding only
      $deleteAt(index, operation) {
        this[$changes].delete(index, operation);
      }
      // decoding only
      $setAt(index, value, operation) {
        if (index === 0 && operation === exports2.OPERATION.ADD && this.items[index] !== void 0) {
          this.items.unshift(value);
        } else if (operation === exports2.OPERATION.DELETE_AND_MOVE) {
          this.items.splice(index, 1);
          this.items[index] = value;
        } else {
          this.items[index] = value;
        }
      }
      clear() {
        if (this.items.length === 0) {
          return;
        }
        const changeTree = this[$changes];
        changeTree.forEachChild((changeTree2, _) => {
          changeTree2.discard(true);
          const root = changeTree2.root;
          if (root !== void 0) {
            root.removeChangeFromChangeSet("changes", changeTree2);
            root.removeChangeFromChangeSet("allChanges", changeTree2);
            root.removeChangeFromChangeSet("allFilteredChanges", changeTree2);
          }
        });
        changeTree.discard(true);
        changeTree.operation(exports2.OPERATION.CLEAR);
        this.items.length = 0;
        this.tmpItems.length = 0;
      }
      /**
       * Combines two or more arrays.
       * @param items Additional items to add to the end of array1.
       */
      // @ts-ignore
      concat(...items) {
        return new _ArraySchema(...this.items.concat(...items));
      }
      /**
       * Adds all the elements of an array separated by the specified separator string.
       * @param separator A string used to separate one element of an array from the next in the resulting String. If omitted, the array elements are separated with a comma.
       */
      join(separator) {
        return this.items.join(separator);
      }
      /**
       * Reverses the elements in an Array.
       */
      // @ts-ignore
      reverse() {
        this[$changes].operation(exports2.OPERATION.REVERSE);
        this.items.reverse();
        this.tmpItems.reverse();
        return this;
      }
      /**
       * Removes the first element from an array and returns it.
       */
      shift() {
        if (this.items.length === 0) {
          return void 0;
        }
        const changeTree = this[$changes];
        const index = this.tmpItems.findIndex((item) => item === this.items[0]);
        const allChangesIndex = this.items.findIndex((item) => item === this.items[0]);
        changeTree.delete(index, exports2.OPERATION.DELETE, allChangesIndex);
        changeTree.shiftAllChangeIndexes(-1, allChangesIndex);
        return this.items.shift();
      }
      /**
       * Returns a section of an array.
       * @param start The beginning of the specified portion of the array.
       * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
       */
      slice(start, end) {
        const sliced = new _ArraySchema();
        sliced.push(...this.items.slice(start, end));
        return sliced;
      }
      /**
       * Sorts an array.
       * @param compareFn Function used to determine the order of the elements. It is expected to return
       * a negative value if first argument is less than second argument, zero if they're equal and a positive
       * value otherwise. If omitted, the elements are sorted in ascending, ASCII character order.
       * ```ts
       * [11,2,22,1].sort((a, b) => a - b)
       * ```
       */
      sort(compareFn = DEFAULT_SORT) {
        this.isMovingItems = true;
        const changeTree = this[$changes];
        const sortedItems = this.items.sort(compareFn);
        sortedItems.forEach((_, i) => changeTree.change(i, exports2.OPERATION.REPLACE));
        this.tmpItems.sort(compareFn);
        this.isMovingItems = false;
        return this;
      }
      /**
       * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
       * @param start The zero-based location in the array from which to start removing elements.
       * @param deleteCount The number of elements to remove.
       * @param insertItems Elements to insert into the array in place of the deleted elements.
       */
      splice(start, deleteCount, ...insertItems) {
        var _a4;
        const changeTree = this[$changes];
        const itemsLength = this.items.length;
        const tmpItemsLength = this.tmpItems.length;
        const insertCount = insertItems.length;
        const indexes = [];
        for (let i = 0; i < tmpItemsLength; i++) {
          if (this.deletedIndexes[i] !== true) {
            indexes.push(i);
          }
        }
        if (itemsLength > start) {
          if (deleteCount === void 0) {
            deleteCount = itemsLength - start;
          }
          for (let i = start; i < start + deleteCount; i++) {
            const index = indexes[i];
            changeTree.delete(index, exports2.OPERATION.DELETE);
            this.deletedIndexes[index] = true;
          }
        } else {
          deleteCount = 0;
        }
        if (insertCount > 0) {
          if (insertCount > deleteCount) {
            console.error("Inserting more elements than deleting during ArraySchema#splice()");
            throw new Error("ArraySchema#splice(): insertCount must be equal or lower than deleteCount.");
          }
          for (let i = 0; i < insertCount; i++) {
            const addIndex = (indexes[start] ?? itemsLength) + i;
            changeTree.indexedOperation(addIndex, this.deletedIndexes[addIndex] ? exports2.OPERATION.DELETE_AND_ADD : exports2.OPERATION.ADD);
            (_a4 = insertItems[i][$changes]) == null ? void 0 : _a4.setParent(this, changeTree.root, addIndex);
          }
        }
        if (deleteCount > insertCount) {
          changeTree.shiftAllChangeIndexes(-(deleteCount - insertCount), indexes[start + insertCount]);
        }
        if (changeTree.filteredChanges !== void 0) {
          enqueueChangeTree(changeTree.root, changeTree, "filteredChanges");
        } else {
          enqueueChangeTree(changeTree.root, changeTree, "changes");
        }
        return this.items.splice(start, deleteCount, ...insertItems);
      }
      /**
       * Inserts new elements at the start of an array.
       * @param items  Elements to insert at the start of the Array.
       */
      unshift(...items) {
        const changeTree = this[$changes];
        changeTree.shiftChangeIndexes(items.length);
        if (changeTree.isFiltered) {
          setOperationAtIndex(changeTree.filteredChanges, this.items.length);
        } else {
          setOperationAtIndex(changeTree.allChanges, this.items.length);
        }
        items.forEach((_, index) => {
          changeTree.change(index, exports2.OPERATION.ADD);
        });
        this.tmpItems.unshift(...items);
        return this.items.unshift(...items);
      }
      /**
       * Returns the index of the first occurrence of a value in an array.
       * @param searchElement The value to locate in the array.
       * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
       */
      indexOf(searchElement, fromIndex) {
        return this.items.indexOf(searchElement, fromIndex);
      }
      /**
       * Returns the index of the last occurrence of a specified value in an array.
       * @param searchElement The value to locate in the array.
       * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at the last index in the array.
       */
      lastIndexOf(searchElement, fromIndex = this.length - 1) {
        return this.items.lastIndexOf(searchElement, fromIndex);
      }
      every(callbackfn, thisArg) {
        return this.items.every(callbackfn, thisArg);
      }
      /**
       * Determines whether the specified callback function returns true for any element of an array.
       * @param callbackfn A function that accepts up to three arguments. The some method calls
       * the callbackfn function for each element in the array until the callbackfn returns a value
       * which is coercible to the Boolean value true, or until the end of the array.
       * @param thisArg An object to which the this keyword can refer in the callbackfn function.
       * If thisArg is omitted, undefined is used as the this value.
       */
      some(callbackfn, thisArg) {
        return this.items.some(callbackfn, thisArg);
      }
      /**
       * Performs the specified action for each element in an array.
       * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
       * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
       */
      forEach(callbackfn, thisArg) {
        return this.items.forEach(callbackfn, thisArg);
      }
      /**
       * Calls a defined callback function on each element of an array, and returns an array that contains the results.
       * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
       * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
       */
      map(callbackfn, thisArg) {
        return this.items.map(callbackfn, thisArg);
      }
      filter(callbackfn, thisArg) {
        return this.items.filter(callbackfn, thisArg);
      }
      /**
       * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
       * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
       * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
       */
      reduce(callbackfn, initialValue) {
        return this.items.reduce(callbackfn, initialValue);
      }
      /**
       * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
       * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
       * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
       */
      reduceRight(callbackfn, initialValue) {
        return this.items.reduceRight(callbackfn, initialValue);
      }
      /**
       * Returns the value of the first element in the array where predicate is true, and undefined
       * otherwise.
       * @param predicate find calls predicate once for each element of the array, in ascending
       * order, until it finds one where predicate returns true. If such an element is found, find
       * immediately returns that element value. Otherwise, find returns undefined.
       * @param thisArg If provided, it will be used as the this value for each invocation of
       * predicate. If it is not provided, undefined is used instead.
       */
      find(predicate, thisArg) {
        return this.items.find(predicate, thisArg);
      }
      /**
       * Returns the index of the first element in the array where predicate is true, and -1
       * otherwise.
       * @param predicate find calls predicate once for each element of the array, in ascending
       * order, until it finds one where predicate returns true. If such an element is found,
       * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
       * @param thisArg If provided, it will be used as the this value for each invocation of
       * predicate. If it is not provided, undefined is used instead.
       */
      findIndex(predicate, thisArg) {
        return this.items.findIndex(predicate, thisArg);
      }
      /**
       * Returns the this object after filling the section identified by start and end with value
       * @param value value to fill array section with
       * @param start index to start filling the array at. If start is negative, it is treated as
       * length+start where length is the length of the array.
       * @param end index to stop filling the array at. If end is negative, it is treated as
       * length+end.
       */
      fill(value, start, end) {
        throw new Error("ArraySchema#fill() not implemented");
      }
      /**
       * Returns the this object after copying a section of the array identified by start and end
       * to the same array starting at position target
       * @param target If target is negative, it is treated as length+target where length is the
       * length of the array.
       * @param start If start is negative, it is treated as length+start. If end is negative, it
       * is treated as length+end.
       * @param end If not specified, length of the this object is used as its default value.
       */
      copyWithin(target2, start, end) {
        throw new Error("ArraySchema#copyWithin() not implemented");
      }
      /**
       * Returns a string representation of an array.
       */
      toString() {
        return this.items.toString();
      }
      /**
       * Returns a string representation of an array. The elements are converted to string using their toLocalString methods.
       */
      toLocaleString() {
        return this.items.toLocaleString();
      }
      /** Iterator */
      [Symbol.iterator]() {
        return this.items[Symbol.iterator]();
      }
      static get [Symbol.species]() {
        return _ArraySchema;
      }
      /**
       * Returns an iterable of key, value pairs for every entry in the array
       */
      entries() {
        return this.items.entries();
      }
      /**
       * Returns an iterable of keys in the array
       */
      keys() {
        return this.items.keys();
      }
      /**
       * Returns an iterable of values in the array
       */
      values() {
        return this.items.values();
      }
      /**
       * Determines whether an array includes a certain element, returning true or false as appropriate.
       * @param searchElement The element to search for.
       * @param fromIndex The position in this array at which to begin searching for searchElement.
       */
      includes(searchElement, fromIndex) {
        return this.items.includes(searchElement, fromIndex);
      }
      //
      // ES2022
      //
      /**
       * Calls a defined callback function on each element of an array. Then, flattens the result into
       * a new array.
       * This is identical to a map followed by flat with depth 1.
       *
       * @param callback A function that accepts up to three arguments. The flatMap method calls the
       * callback function one time for each element in the array.
       * @param thisArg An object to which the this keyword can refer in the callback function. If
       * thisArg is omitted, undefined is used as the this value.
       */
      // @ts-ignore
      flatMap(callback, thisArg) {
        throw new Error("ArraySchema#flatMap() is not supported.");
      }
      /**
       * Returns a new array with all sub-array elements concatenated into it recursively up to the
       * specified depth.
       *
       * @param depth The maximum recursion depth
       */
      // @ts-ignore
      flat(depth) {
        throw new Error("ArraySchema#flat() is not supported.");
      }
      findLast() {
        return this.items.findLast.apply(this.items, arguments);
      }
      findLastIndex(...args) {
        return this.items.findLastIndex.apply(this.items, arguments);
      }
      //
      // ES2023
      //
      with(index, value) {
        const copy2 = this.items.slice();
        if (index < 0)
          index += this.length;
        copy2[index] = value;
        return new _ArraySchema(...copy2);
      }
      toReversed() {
        return this.items.slice().reverse();
      }
      toSorted(compareFn) {
        return this.items.slice().sort(compareFn);
      }
      // @ts-ignore
      toSpliced(start, deleteCount, ...items) {
        return this.items.toSpliced.apply(copy, arguments);
      }
      shuffle() {
        return this.move((_) => {
          let currentIndex = this.items.length;
          while (currentIndex != 0) {
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [this[currentIndex], this[randomIndex]] = [this[randomIndex], this[currentIndex]];
          }
        });
      }
      /**
       * Allows to move items around in the array.
       *
       * Example:
       *     state.cards.move((cards) => {
       *         [cards[4], cards[3]] = [cards[3], cards[4]];
       *         [cards[3], cards[2]] = [cards[2], cards[3]];
       *         [cards[2], cards[0]] = [cards[0], cards[2]];
       *         [cards[1], cards[1]] = [cards[1], cards[1]];
       *         [cards[0], cards[0]] = [cards[0], cards[0]];
       *     })
       *
       * @param cb
       * @returns
       */
      move(cb) {
        this.isMovingItems = true;
        cb(this);
        this.isMovingItems = false;
        return this;
      }
      [$getByIndex](index, isEncodeAll = false) {
        return isEncodeAll ? this.items[index] : this.deletedIndexes[index] ? this.items[index] : this.tmpItems[index] || this.items[index];
      }
      [$deleteByIndex](index) {
        this.items[index] = void 0;
        this.tmpItems[index] = void 0;
      }
      [$onEncodeEnd]() {
        this.tmpItems = this.items.slice();
        this.deletedIndexes = {};
      }
      [$onDecodeEnd]() {
        this.items = this.items.filter((item) => item !== void 0);
        this.tmpItems = this.items.slice();
      }
      toArray() {
        return this.items.slice(0);
      }
      toJSON() {
        return this.toArray().map((value) => {
          return typeof value["toJSON"] === "function" ? value["toJSON"]() : value;
        });
      }
      //
      // Decoding utilities
      //
      clone(isDecoding) {
        let cloned;
        if (isDecoding) {
          cloned = new _ArraySchema();
          cloned.push(...this.items);
        } else {
          cloned = new _ArraySchema(...this.map((item) => item[$changes] ? item.clone() : item));
        }
        return cloned;
      }
    };
    __name(_ArraySchema, "ArraySchema");
    _ArraySchema[_a$4] = encodeArray;
    _ArraySchema[_b$4] = decodeArray;
    let ArraySchema = _ArraySchema;
    registerType("array", { constructor: ArraySchema });
    var _a$3, _b$3;
    const _MapSchema = class _MapSchema {
      /**
       * Determine if a property must be filtered.
       * - If returns false, the property is NOT going to be encoded.
       * - If returns true, the property is going to be encoded.
       *
       * Encoding with "filters" happens in two steps:
       * - First, the encoder iterates over all "not owned" properties and encodes them.
       * - Then, the encoder iterates over all "owned" properties per instance and encodes them.
       */
      static [(_a$3 = $encoder, _b$3 = $decoder, $filter)](ref, index, view2) {
        return !view2 || typeof ref[$childType] === "string" || view2.isChangeTreeVisible((ref[$getByIndex](index) ?? ref.deletedItems[index])[$changes]);
      }
      static is(type2) {
        return type2["map"] !== void 0;
      }
      constructor(initialValues) {
        this.$items = /* @__PURE__ */ new Map();
        this.$indexes = /* @__PURE__ */ new Map();
        this.deletedItems = {};
        this[$changes] = new ChangeTree(this);
        this[$changes].indexes = {};
        if (initialValues) {
          if (initialValues instanceof Map || initialValues instanceof _MapSchema) {
            initialValues.forEach((v, k) => this.set(k, v));
          } else {
            for (const k in initialValues) {
              this.set(k, initialValues[k]);
            }
          }
        }
        Object.defineProperty(this, $childType, {
          value: void 0,
          enumerable: false,
          writable: true,
          configurable: true
        });
      }
      /** Iterator */
      [Symbol.iterator]() {
        return this.$items[Symbol.iterator]();
      }
      get [Symbol.toStringTag]() {
        return this.$items[Symbol.toStringTag];
      }
      static get [Symbol.species]() {
        return _MapSchema;
      }
      set(key, value) {
        var _a4;
        if (value === void 0 || value === null) {
          throw new Error(`MapSchema#set('${key}', ${value}): trying to set ${value} value on '${key}'.`);
        } else if (typeof value === "object" && this[$childType]) {
          assertInstanceType(value, this[$childType], this, key);
        }
        key = key.toString();
        const changeTree = this[$changes];
        const isRef = value[$changes] !== void 0;
        let index;
        let operation;
        if (typeof changeTree.indexes[key] !== "undefined") {
          index = changeTree.indexes[key];
          operation = exports2.OPERATION.REPLACE;
          const previousValue = this.$items.get(key);
          if (previousValue === value) {
            return;
          } else if (isRef) {
            operation = exports2.OPERATION.DELETE_AND_ADD;
            if (previousValue !== void 0) {
              (_a4 = previousValue[$changes].root) == null ? void 0 : _a4.remove(previousValue[$changes]);
            }
          }
        } else {
          index = changeTree.indexes[$numFields] ?? 0;
          operation = exports2.OPERATION.ADD;
          this.$indexes.set(index, key);
          changeTree.indexes[key] = index;
          changeTree.indexes[$numFields] = index + 1;
        }
        this.$items.set(key, value);
        changeTree.change(index, operation);
        if (isRef) {
          value[$changes].setParent(this, changeTree.root, index);
        }
        return this;
      }
      get(key) {
        return this.$items.get(key);
      }
      delete(key) {
        const index = this[$changes].indexes[key];
        this.deletedItems[index] = this[$changes].delete(index);
        return this.$items.delete(key);
      }
      clear() {
        const changeTree = this[$changes];
        changeTree.discard(true);
        changeTree.indexes = {};
        this.$indexes.clear();
        this.$items.clear();
        changeTree.operation(exports2.OPERATION.CLEAR);
      }
      has(key) {
        return this.$items.has(key);
      }
      forEach(callbackfn) {
        this.$items.forEach(callbackfn);
      }
      entries() {
        return this.$items.entries();
      }
      keys() {
        return this.$items.keys();
      }
      values() {
        return this.$items.values();
      }
      get size() {
        return this.$items.size;
      }
      setIndex(index, key) {
        this.$indexes.set(index, key);
      }
      getIndex(index) {
        return this.$indexes.get(index);
      }
      [$getByIndex](index) {
        return this.$items.get(this.$indexes.get(index));
      }
      [$deleteByIndex](index) {
        const key = this.$indexes.get(index);
        this.$items.delete(key);
        this.$indexes.delete(index);
      }
      [$onEncodeEnd]() {
        this.deletedItems = {};
      }
      toJSON() {
        const map = {};
        this.forEach((value, key) => {
          map[key] = typeof value["toJSON"] === "function" ? value["toJSON"]() : value;
        });
        return map;
      }
      //
      // Decoding utilities
      //
      // @ts-ignore
      clone(isDecoding) {
        let cloned;
        if (isDecoding) {
          cloned = Object.assign(new _MapSchema(), this);
        } else {
          cloned = new _MapSchema();
          this.forEach((value, key) => {
            if (value[$changes]) {
              cloned.set(key, value["clone"]());
            } else {
              cloned.set(key, value);
            }
          });
        }
        return cloned;
      }
    };
    __name(_MapSchema, "MapSchema");
    _MapSchema[_a$3] = encodeKeyValueOperation;
    _MapSchema[_b$3] = decodeKeyValueOperation;
    let MapSchema = _MapSchema;
    registerType("map", { constructor: MapSchema });
    const DEFAULT_VIEW_TAG = -1;
    function entity(constructor) {
      TypeContext.register(constructor);
      return constructor;
    }
    __name(entity, "entity");
    function view(tag = DEFAULT_VIEW_TAG) {
      return function(target2, fieldName) {
        var _a4;
        const constructor = target2.constructor;
        const parentClass = Object.getPrototypeOf(constructor);
        const parentMetadata = parentClass[Symbol.metadata];
        const metadata = constructor[_a4 = Symbol.metadata] ?? (constructor[_a4] = Object.assign({}, constructor[Symbol.metadata], parentMetadata ?? /* @__PURE__ */ Object.create(null)));
        Metadata.setTag(metadata, fieldName, tag);
      };
    }
    __name(view, "view");
    function type(type2, options) {
      return function(target2, field) {
        const constructor = target2.constructor;
        if (!type2) {
          throw new Error(`${constructor.name}: @type() reference provided for "${field}" is undefined. Make sure you don't have any circular dependencies.`);
        }
        TypeContext.register(constructor);
        const parentClass = Object.getPrototypeOf(constructor);
        const parentMetadata = parentClass[Symbol.metadata];
        const metadata = Metadata.initialize(constructor);
        let fieldIndex = metadata[field];
        if (metadata[fieldIndex] !== void 0) {
          if (metadata[fieldIndex].deprecated) {
            return;
          } else if (metadata[fieldIndex].type !== void 0) {
            try {
              throw new Error(`@colyseus/schema: Duplicate '${field}' definition on '${constructor.name}'.
Check @type() annotation`);
            } catch (e) {
              const definitionAtLine = e.stack.split("\n")[4].trim();
              throw new Error(`${e.message} ${definitionAtLine}`);
            }
          }
        } else {
          fieldIndex = metadata[$numFields] ?? (parentMetadata && parentMetadata[$numFields]) ?? -1;
          fieldIndex++;
        }
        if (options && options.manual) {
          Metadata.addField(metadata, fieldIndex, field, type2, {
            // do not declare getter/setter descriptor
            enumerable: true,
            configurable: true,
            writable: true
          });
        } else {
          const complexTypeKlass = Array.isArray(type2) ? getType("array") : typeof Object.keys(type2)[0] === "string" && getType(Object.keys(type2)[0]);
          const childType = complexTypeKlass ? Object.values(type2)[0] : type2;
          Metadata.addField(metadata, fieldIndex, field, type2, getPropertyDescriptor(`_${field}`, fieldIndex, childType, complexTypeKlass));
        }
      };
    }
    __name(type, "type");
    function getPropertyDescriptor(fieldCached, fieldIndex, type2, complexTypeKlass) {
      return {
        get: /* @__PURE__ */ __name(function() {
          return this[fieldCached];
        }, "get"),
        set: /* @__PURE__ */ __name(function(value) {
          var _a4, _b3;
          const previousValue = this[fieldCached] ?? void 0;
          if (value === previousValue) {
            return;
          }
          if (value !== void 0 && value !== null) {
            if (complexTypeKlass) {
              if (complexTypeKlass.constructor === ArraySchema && !(value instanceof ArraySchema)) {
                value = new ArraySchema(...value);
              }
              if (complexTypeKlass.constructor === MapSchema && !(value instanceof MapSchema)) {
                value = new MapSchema(value);
              }
              value[$childType] = type2;
            } else if (typeof type2 !== "string") {
              assertInstanceType(value, type2, this, fieldCached.substring(1));
            } else {
              assertType(value, type2, this, fieldCached.substring(1));
            }
            const changeTree = this[$changes];
            if (previousValue !== void 0 && previousValue[$changes]) {
              (_a4 = changeTree.root) == null ? void 0 : _a4.remove(previousValue[$changes]);
              this.constructor[$track](changeTree, fieldIndex, exports2.OPERATION.DELETE_AND_ADD);
            } else {
              this.constructor[$track](changeTree, fieldIndex, exports2.OPERATION.ADD);
            }
            (_b3 = value[$changes]) == null ? void 0 : _b3.setParent(this, changeTree.root, fieldIndex);
          } else if (previousValue !== void 0) {
            this[$changes].delete(fieldIndex);
          }
          this[fieldCached] = value;
        }, "set"),
        enumerable: true,
        configurable: true
      };
    }
    __name(getPropertyDescriptor, "getPropertyDescriptor");
    function deprecated(throws = true) {
      return function(klass, field) {
        var _a4;
        const constructor = klass.constructor;
        const parentClass = Object.getPrototypeOf(constructor);
        const parentMetadata = parentClass[Symbol.metadata];
        const metadata = constructor[_a4 = Symbol.metadata] ?? (constructor[_a4] = Object.assign({}, constructor[Symbol.metadata], parentMetadata ?? /* @__PURE__ */ Object.create(null)));
        const fieldIndex = metadata[field];
        metadata[fieldIndex].deprecated = true;
        if (throws) {
          metadata[$descriptors] ?? (metadata[$descriptors] = {});
          metadata[$descriptors][field] = {
            get: /* @__PURE__ */ __name(function() {
              throw new Error(`${field} is deprecated.`);
            }, "get"),
            set: /* @__PURE__ */ __name(function(value) {
            }, "set"),
            enumerable: false,
            configurable: true
          };
        }
        Object.defineProperty(metadata, fieldIndex, {
          value: metadata[fieldIndex],
          enumerable: false,
          configurable: true
        });
      };
    }
    __name(deprecated, "deprecated");
    function defineTypes(target2, fields, options) {
      for (let field in fields) {
        type(fields[field], options)(target2.prototype, field);
      }
      return target2;
    }
    __name(defineTypes, "defineTypes");
    function schema2(fields, name, inherits = Schema) {
      const defaultValues = {};
      const viewTagFields = {};
      for (let fieldName in fields) {
        const field = fields[fieldName];
        if (typeof field === "object") {
          if (field["default"] !== void 0) {
            defaultValues[fieldName] = field["default"];
          }
          if (field["view"] !== void 0) {
            viewTagFields[fieldName] = typeof field["view"] === "boolean" ? DEFAULT_VIEW_TAG : field["view"];
          }
        }
      }
      const klass = Metadata.setFields(class extends inherits {
        constructor(...args) {
          args[0] = Object.assign({}, defaultValues, args[0]);
          super(...args);
        }
      }, fields);
      for (let fieldName in viewTagFields) {
        view(viewTagFields[fieldName])(klass.prototype, fieldName);
      }
      if (name) {
        Object.defineProperty(klass, "name", { value: name });
      }
      klass.extends = (fields2, name2) => schema2(fields2, name2, klass);
      return klass;
    }
    __name(schema2, "schema");
    function getIndent(level) {
      return new Array(level).fill(0).map((_, i) => i === level - 1 ? `└─ ` : `   `).join("");
    }
    __name(getIndent, "getIndent");
    function dumpChanges(schema3) {
      const $root = schema3[$changes].root;
      const dump = {
        ops: {},
        refs: []
      };
      $root.changes.forEach((changeTree) => {
        if (changeTree === void 0) {
          return;
        }
        const changes = changeTree.indexedOperations;
        dump.refs.push(`refId#${changeTree.refId}`);
        for (const index in changes) {
          const op = changes[index];
          const opName = exports2.OPERATION[op];
          if (!dump.ops[opName]) {
            dump.ops[opName] = 0;
          }
          dump.ops[exports2.OPERATION[op]]++;
        }
      });
      return dump;
    }
    __name(dumpChanges, "dumpChanges");
    var _a$2, _b$2;
    const _Schema = class _Schema {
      /**
       * Assign the property descriptors required to track changes on this instance.
       * @param instance
       */
      static initialize(instance) {
        var _a4;
        Object.defineProperty(instance, $changes, {
          value: new ChangeTree(instance),
          enumerable: false,
          writable: true
        });
        Object.defineProperties(instance, ((_a4 = instance.constructor[Symbol.metadata]) == null ? void 0 : _a4[$descriptors]) || {});
      }
      static is(type2) {
        return typeof type2[Symbol.metadata] === "object";
      }
      /**
       * Track property changes
       */
      static [(_a$2 = $encoder, _b$2 = $decoder, $track)](changeTree, index, operation = exports2.OPERATION.ADD) {
        changeTree.change(index, operation);
      }
      /**
       * Determine if a property must be filtered.
       * - If returns false, the property is NOT going to be encoded.
       * - If returns true, the property is going to be encoded.
       *
       * Encoding with "filters" happens in two steps:
       * - First, the encoder iterates over all "not owned" properties and encodes them.
       * - Then, the encoder iterates over all "owned" properties per instance and encodes them.
       */
      static [$filter](ref, index, view2) {
        var _a4, _b3;
        const metadata = ref.constructor[Symbol.metadata];
        const tag = (_a4 = metadata[index]) == null ? void 0 : _a4.tag;
        if (view2 === void 0) {
          return tag === void 0;
        } else if (tag === void 0) {
          return true;
        } else if (tag === DEFAULT_VIEW_TAG) {
          return view2.isChangeTreeVisible(ref[$changes]);
        } else {
          const tags = (_b3 = view2.tags) == null ? void 0 : _b3.get(ref[$changes]);
          return tags && tags.has(tag);
        }
      }
      // allow inherited classes to have a constructor
      constructor(...args) {
        _Schema.initialize(this);
        if (args[0]) {
          Object.assign(this, args[0]);
        }
      }
      assign(props) {
        Object.assign(this, props);
        return this;
      }
      /**
       * (Server-side): Flag a property to be encoded for the next patch.
       * @param instance Schema instance
       * @param property string representing the property name, or number representing the index of the property.
       * @param operation OPERATION to perform (detected automatically)
       */
      setDirty(property, operation) {
        const metadata = this.constructor[Symbol.metadata];
        this[$changes].change(metadata[metadata[property]].index, operation);
      }
      clone() {
        var _a4;
        const cloned = new this.constructor();
        const metadata = this.constructor[Symbol.metadata];
        for (const fieldIndex in metadata) {
          const field = metadata[fieldIndex].name;
          if (typeof this[field] === "object" && typeof ((_a4 = this[field]) == null ? void 0 : _a4.clone) === "function") {
            cloned[field] = this[field].clone();
          } else {
            cloned[field] = this[field];
          }
        }
        return cloned;
      }
      toJSON() {
        const obj = {};
        const metadata = this.constructor[Symbol.metadata];
        for (const index in metadata) {
          const field = metadata[index];
          const fieldName = field.name;
          if (!field.deprecated && this[fieldName] !== null && typeof this[fieldName] !== "undefined") {
            obj[fieldName] = typeof this[fieldName]["toJSON"] === "function" ? this[fieldName]["toJSON"]() : this[fieldName];
          }
        }
        return obj;
      }
      discardAllChanges() {
        this[$changes].discardAll();
      }
      [$getByIndex](index) {
        const metadata = this.constructor[Symbol.metadata];
        return this[metadata[index].name];
      }
      [$deleteByIndex](index) {
        const metadata = this.constructor[Symbol.metadata];
        this[metadata[index].name] = void 0;
      }
      /**
       * Inspect the `refId` of all Schema instances in the tree. Optionally display the contents of the instance.
       *
       * @param ref Schema instance
       * @param showContents display JSON contents of the instance
       * @returns
       */
      static debugRefIds(ref, showContents = false, level = 0) {
        const contents = showContents ? ` - ${JSON.stringify(ref.toJSON())}` : "";
        const changeTree = ref[$changes];
        const refId = changeTree.refId;
        let output = "";
        output += `${getIndent(level)}${ref.constructor.name} (refId: ${refId})${contents}
`;
        changeTree.forEachChild((childChangeTree) => output += this.debugRefIds(childChangeTree.ref, showContents, level + 1));
        return output;
      }
      /**
       * Return a string representation of the changes on a Schema instance.
       * The list of changes is cleared after each encode.
       *
       * @param instance Schema instance
       * @param isEncodeAll Return "full encode" instead of current change set.
       * @returns
       */
      static debugChanges(instance, isEncodeAll = false) {
        const changeTree = instance[$changes];
        const changeSet = isEncodeAll ? changeTree.allChanges : changeTree.changes;
        const changeSetName = isEncodeAll ? "allChanges" : "changes";
        let output = `${instance.constructor.name} (${changeTree.refId}) -> .${changeSetName}:
`;
        function dumpChangeSet(changeSet2) {
          changeSet2.operations.filter((op) => op).forEach((index) => {
            const operation = changeTree.indexedOperations[index];
            console.log({ index, operation });
            output += `- [${index}]: ${exports2.OPERATION[operation]} (${JSON.stringify(changeTree.getValue(Number(index), isEncodeAll))})
`;
          });
        }
        __name(dumpChangeSet, "dumpChangeSet");
        dumpChangeSet(changeSet);
        if (!isEncodeAll && changeTree.filteredChanges && changeTree.filteredChanges.operations.filter((op) => op).length > 0) {
          output += `${instance.constructor.name} (${changeTree.refId}) -> .filteredChanges:
`;
          dumpChangeSet(changeTree.filteredChanges);
        }
        if (isEncodeAll && changeTree.allFilteredChanges && changeTree.allFilteredChanges.operations.filter((op) => op).length > 0) {
          output += `${instance.constructor.name} (${changeTree.refId}) -> .allFilteredChanges:
`;
          dumpChangeSet(changeTree.allFilteredChanges);
        }
        return output;
      }
      static debugChangesDeep(ref, changeSetName = "changes") {
        var _a4, _b3;
        let output = "";
        const rootChangeTree = ref[$changes];
        const root = rootChangeTree.root;
        const changeTrees = /* @__PURE__ */ new Map();
        const instanceRefIds = [];
        let totalOperations = 0;
        for (const [refId, changes] of Object.entries(root[changeSetName])) {
          const changeTree = root.changeTrees[refId];
          let includeChangeTree = false;
          let parentChangeTrees = [];
          let parentChangeTree = (_a4 = changeTree.parent) == null ? void 0 : _a4[$changes];
          if (changeTree === rootChangeTree) {
            includeChangeTree = true;
          } else {
            while (parentChangeTree !== void 0) {
              parentChangeTrees.push(parentChangeTree);
              if (parentChangeTree.ref === ref) {
                includeChangeTree = true;
                break;
              }
              parentChangeTree = (_b3 = parentChangeTree.parent) == null ? void 0 : _b3[$changes];
            }
          }
          if (includeChangeTree) {
            instanceRefIds.push(changeTree.refId);
            totalOperations += Object.keys(changes).length;
            changeTrees.set(changeTree, parentChangeTrees.reverse());
          }
        }
        output += "---\n";
        output += `root refId: ${rootChangeTree.refId}
`;
        output += `Total instances: ${instanceRefIds.length} (refIds: ${instanceRefIds.join(", ")})
`;
        output += `Total changes: ${totalOperations}
`;
        output += "---\n";
        const visitedParents = /* @__PURE__ */ new WeakSet();
        for (const [changeTree, parentChangeTrees] of changeTrees.entries()) {
          parentChangeTrees.forEach((parentChangeTree, level2) => {
            if (!visitedParents.has(parentChangeTree)) {
              output += `${getIndent(level2)}${parentChangeTree.ref.constructor.name} (refId: ${parentChangeTree.refId})
`;
              visitedParents.add(parentChangeTree);
            }
          });
          const changes = changeTree.indexedOperations;
          const level = parentChangeTrees.length;
          const indent = getIndent(level);
          const parentIndex = level > 0 ? `(${changeTree.parentIndex}) ` : "";
          output += `${indent}${parentIndex}${changeTree.ref.constructor.name} (refId: ${changeTree.refId}) - changes: ${Object.keys(changes).length}
`;
          for (const index in changes) {
            const operation = changes[index];
            output += `${getIndent(level + 1)}${exports2.OPERATION[operation]}: ${index}
`;
          }
        }
        return `${output}`;
      }
    };
    __name(_Schema, "Schema");
    _Schema[_a$2] = encodeSchemaOperation;
    _Schema[_b$2] = decodeSchemaOperation;
    let Schema = _Schema;
    var _a$1, _b$1;
    const _CollectionSchema = class _CollectionSchema {
      /**
       * Determine if a property must be filtered.
       * - If returns false, the property is NOT going to be encoded.
       * - If returns true, the property is going to be encoded.
       *
       * Encoding with "filters" happens in two steps:
       * - First, the encoder iterates over all "not owned" properties and encodes them.
       * - Then, the encoder iterates over all "owned" properties per instance and encodes them.
       */
      static [(_a$1 = $encoder, _b$1 = $decoder, $filter)](ref, index, view2) {
        return !view2 || typeof ref[$childType] === "string" || view2.isChangeTreeVisible((ref[$getByIndex](index) ?? ref.deletedItems[index])[$changes]);
      }
      static is(type2) {
        return type2["collection"] !== void 0;
      }
      constructor(initialValues) {
        this.$items = /* @__PURE__ */ new Map();
        this.$indexes = /* @__PURE__ */ new Map();
        this.deletedItems = {};
        this.$refId = 0;
        this[$changes] = new ChangeTree(this);
        this[$changes].indexes = {};
        if (initialValues) {
          initialValues.forEach((v) => this.add(v));
        }
        Object.defineProperty(this, $childType, {
          value: void 0,
          enumerable: false,
          writable: true,
          configurable: true
        });
      }
      add(value) {
        const index = this.$refId++;
        const isRef = value[$changes] !== void 0;
        if (isRef) {
          value[$changes].setParent(this, this[$changes].root, index);
        }
        this[$changes].indexes[index] = index;
        this.$indexes.set(index, index);
        this.$items.set(index, value);
        this[$changes].change(index);
        return index;
      }
      at(index) {
        const key = Array.from(this.$items.keys())[index];
        return this.$items.get(key);
      }
      entries() {
        return this.$items.entries();
      }
      delete(item) {
        const entries = this.$items.entries();
        let index;
        let entry;
        while (entry = entries.next()) {
          if (entry.done) {
            break;
          }
          if (item === entry.value[1]) {
            index = entry.value[0];
            break;
          }
        }
        if (index === void 0) {
          return false;
        }
        this.deletedItems[index] = this[$changes].delete(index);
        this.$indexes.delete(index);
        return this.$items.delete(index);
      }
      clear() {
        const changeTree = this[$changes];
        changeTree.discard(true);
        changeTree.indexes = {};
        this.$indexes.clear();
        this.$items.clear();
        changeTree.operation(exports2.OPERATION.CLEAR);
      }
      has(value) {
        return Array.from(this.$items.values()).some((v) => v === value);
      }
      forEach(callbackfn) {
        this.$items.forEach((value, key, _) => callbackfn(value, key, this));
      }
      values() {
        return this.$items.values();
      }
      get size() {
        return this.$items.size;
      }
      /** Iterator */
      [Symbol.iterator]() {
        return this.$items.values();
      }
      setIndex(index, key) {
        this.$indexes.set(index, key);
      }
      getIndex(index) {
        return this.$indexes.get(index);
      }
      [$getByIndex](index) {
        return this.$items.get(this.$indexes.get(index));
      }
      [$deleteByIndex](index) {
        const key = this.$indexes.get(index);
        this.$items.delete(key);
        this.$indexes.delete(index);
      }
      [$onEncodeEnd]() {
        this.deletedItems = {};
      }
      toArray() {
        return Array.from(this.$items.values());
      }
      toJSON() {
        const values = [];
        this.forEach((value, key) => {
          values.push(typeof value["toJSON"] === "function" ? value["toJSON"]() : value);
        });
        return values;
      }
      //
      // Decoding utilities
      //
      clone(isDecoding) {
        let cloned;
        if (isDecoding) {
          cloned = Object.assign(new _CollectionSchema(), this);
        } else {
          cloned = new _CollectionSchema();
          this.forEach((value) => {
            if (value[$changes]) {
              cloned.add(value["clone"]());
            } else {
              cloned.add(value);
            }
          });
        }
        return cloned;
      }
    };
    __name(_CollectionSchema, "CollectionSchema");
    _CollectionSchema[_a$1] = encodeKeyValueOperation;
    _CollectionSchema[_b$1] = decodeKeyValueOperation;
    let CollectionSchema = _CollectionSchema;
    registerType("collection", { constructor: CollectionSchema });
    var _a3, _b2;
    const _SetSchema = class _SetSchema {
      /**
       * Determine if a property must be filtered.
       * - If returns false, the property is NOT going to be encoded.
       * - If returns true, the property is going to be encoded.
       *
       * Encoding with "filters" happens in two steps:
       * - First, the encoder iterates over all "not owned" properties and encodes them.
       * - Then, the encoder iterates over all "owned" properties per instance and encodes them.
       */
      static [(_a3 = $encoder, _b2 = $decoder, $filter)](ref, index, view2) {
        return !view2 || typeof ref[$childType] === "string" || view2.visible.has((ref[$getByIndex](index) ?? ref.deletedItems[index])[$changes]);
      }
      static is(type2) {
        return type2["set"] !== void 0;
      }
      constructor(initialValues) {
        this.$items = /* @__PURE__ */ new Map();
        this.$indexes = /* @__PURE__ */ new Map();
        this.deletedItems = {};
        this.$refId = 0;
        this[$changes] = new ChangeTree(this);
        this[$changes].indexes = {};
        if (initialValues) {
          initialValues.forEach((v) => this.add(v));
        }
        Object.defineProperty(this, $childType, {
          value: void 0,
          enumerable: false,
          writable: true,
          configurable: true
        });
      }
      add(value) {
        var _a4;
        if (this.has(value)) {
          return false;
        }
        const index = this.$refId++;
        if (value[$changes] !== void 0) {
          value[$changes].setParent(this, this[$changes].root, index);
        }
        const operation = ((_a4 = this[$changes].indexes[index]) == null ? void 0 : _a4.op) ?? exports2.OPERATION.ADD;
        this[$changes].indexes[index] = index;
        this.$indexes.set(index, index);
        this.$items.set(index, value);
        this[$changes].change(index, operation);
        return index;
      }
      entries() {
        return this.$items.entries();
      }
      delete(item) {
        const entries = this.$items.entries();
        let index;
        let entry;
        while (entry = entries.next()) {
          if (entry.done) {
            break;
          }
          if (item === entry.value[1]) {
            index = entry.value[0];
            break;
          }
        }
        if (index === void 0) {
          return false;
        }
        this.deletedItems[index] = this[$changes].delete(index);
        this.$indexes.delete(index);
        return this.$items.delete(index);
      }
      clear() {
        const changeTree = this[$changes];
        changeTree.discard(true);
        changeTree.indexes = {};
        this.$indexes.clear();
        this.$items.clear();
        changeTree.operation(exports2.OPERATION.CLEAR);
      }
      has(value) {
        const values = this.$items.values();
        let has = false;
        let entry;
        while (entry = values.next()) {
          if (entry.done) {
            break;
          }
          if (value === entry.value) {
            has = true;
            break;
          }
        }
        return has;
      }
      forEach(callbackfn) {
        this.$items.forEach((value, key, _) => callbackfn(value, key, this));
      }
      values() {
        return this.$items.values();
      }
      get size() {
        return this.$items.size;
      }
      /** Iterator */
      [Symbol.iterator]() {
        return this.$items.values();
      }
      setIndex(index, key) {
        this.$indexes.set(index, key);
      }
      getIndex(index) {
        return this.$indexes.get(index);
      }
      [$getByIndex](index) {
        return this.$items.get(this.$indexes.get(index));
      }
      [$deleteByIndex](index) {
        const key = this.$indexes.get(index);
        this.$items.delete(key);
        this.$indexes.delete(index);
      }
      [$onEncodeEnd]() {
        this.deletedItems = {};
      }
      toArray() {
        return Array.from(this.$items.values());
      }
      toJSON() {
        const values = [];
        this.forEach((value, key) => {
          values.push(typeof value["toJSON"] === "function" ? value["toJSON"]() : value);
        });
        return values;
      }
      //
      // Decoding utilities
      //
      clone(isDecoding) {
        let cloned;
        if (isDecoding) {
          cloned = Object.assign(new _SetSchema(), this);
        } else {
          cloned = new _SetSchema();
          this.forEach((value) => {
            if (value[$changes]) {
              cloned.add(value["clone"]());
            } else {
              cloned.add(value);
            }
          });
        }
        return cloned;
      }
    };
    __name(_SetSchema, "SetSchema");
    _SetSchema[_a3] = encodeKeyValueOperation;
    _SetSchema[_b2] = decodeKeyValueOperation;
    let SetSchema = _SetSchema;
    registerType("set", { constructor: SetSchema });
    function __decorate2(decorators, target2, key, desc) {
      var c = arguments.length, r = c < 3 ? target2 : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target2, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target2, key, r) : d(target2, key)) || r;
      return c > 3 && r && Object.defineProperty(target2, key, r), r;
    }
    __name(__decorate2, "__decorate");
    typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
      var e = new Error(message);
      return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };
    const _Root = class _Root {
      constructor(types) {
        this.types = types;
        this.nextUniqueId = 0;
        this.refCount = {};
        this.changeTrees = {};
        this.allChanges = [];
        this.allFilteredChanges = [];
        this.changes = [];
        this.filteredChanges = [];
      }
      getNextUniqueId() {
        return this.nextUniqueId++;
      }
      add(changeTree) {
        changeTree.ensureRefId();
        const isNewChangeTree = this.changeTrees[changeTree.refId] === void 0;
        if (isNewChangeTree) {
          this.changeTrees[changeTree.refId] = changeTree;
        }
        const previousRefCount = this.refCount[changeTree.refId];
        if (previousRefCount === 0) {
          const ops = changeTree.allChanges.operations;
          let len = ops.length;
          while (len--) {
            changeTree.indexedOperations[ops[len]] = exports2.OPERATION.ADD;
            setOperationAtIndex(changeTree.changes, len);
          }
        }
        this.refCount[changeTree.refId] = (previousRefCount || 0) + 1;
        return isNewChangeTree;
      }
      remove(changeTree) {
        const refCount = this.refCount[changeTree.refId] - 1;
        if (refCount <= 0) {
          changeTree.root = void 0;
          delete this.changeTrees[changeTree.refId];
          this.removeChangeFromChangeSet("allChanges", changeTree);
          this.removeChangeFromChangeSet("changes", changeTree);
          if (changeTree.filteredChanges) {
            this.removeChangeFromChangeSet("allFilteredChanges", changeTree);
            this.removeChangeFromChangeSet("filteredChanges", changeTree);
          }
          this.refCount[changeTree.refId] = 0;
        } else {
          this.refCount[changeTree.refId] = refCount;
          if (changeTree.filteredChanges !== void 0) {
            this.removeChangeFromChangeSet("filteredChanges", changeTree);
            enqueueChangeTree(this, changeTree, "filteredChanges");
          } else {
            this.removeChangeFromChangeSet("changes", changeTree);
            enqueueChangeTree(this, changeTree, "changes");
          }
        }
        changeTree.forEachChild((child, _) => this.remove(child));
        return refCount;
      }
      removeChangeFromChangeSet(changeSetName, changeTree) {
        const changeSet = this[changeSetName];
        const changeSetIndex = changeSet.indexOf(changeTree);
        if (changeSetIndex !== -1) {
          changeTree[changeSetName].queueRootIndex = -1;
          changeSet[changeSetIndex] = void 0;
          return true;
        }
      }
      clear() {
        this.changes.length = 0;
      }
    };
    __name(_Root, "Root");
    let Root = _Root;
    const _Encoder = class _Encoder {
      // 8KB
      constructor(state) {
        this.sharedBuffer = Buffer.allocUnsafe(_Encoder.BUFFER_SIZE);
        this.context = TypeContext.cache(state.constructor);
        this.root = new Root(this.context);
        this.setState(state);
      }
      setState(state) {
        this.state = state;
        this.state[$changes].setRoot(this.root);
      }
      encode(it = { offset: 0 }, view2, buffer = this.sharedBuffer, changeSetName = "changes", isEncodeAll = changeSetName === "allChanges", initialOffset = it.offset) {
        const hasView = view2 !== void 0;
        const rootChangeTree = this.state[$changes];
        const changeTrees = this.root[changeSetName];
        for (let i = 0, numChangeTrees = changeTrees.length; i < numChangeTrees; i++) {
          const changeTree = changeTrees[i];
          if (!changeTree) {
            continue;
          }
          if (hasView) {
            if (!view2.isChangeTreeVisible(changeTree)) {
              view2.invisible.add(changeTree);
              continue;
            }
            view2.invisible.delete(changeTree);
          }
          const changeSet = changeTree[changeSetName];
          const ref = changeTree.ref;
          const numChanges = changeSet.operations.length;
          if (numChanges === 0) {
            continue;
          }
          const ctor = ref.constructor;
          const encoder = ctor[$encoder];
          const filter = ctor[$filter];
          const metadata = ctor[Symbol.metadata];
          if (hasView || it.offset > initialOffset || changeTree !== rootChangeTree) {
            buffer[it.offset++] = SWITCH_TO_STRUCTURE & 255;
            encode2.number(buffer, changeTree.refId, it);
          }
          for (let j = 0; j < numChanges; j++) {
            const fieldIndex = changeSet.operations[j];
            const operation = fieldIndex < 0 ? Math.abs(fieldIndex) : isEncodeAll ? exports2.OPERATION.ADD : changeTree.indexedOperations[fieldIndex];
            if (fieldIndex === void 0 || operation === void 0 || filter && !filter(ref, fieldIndex, view2)) {
              continue;
            }
            encoder(this, buffer, changeTree, fieldIndex, operation, it, isEncodeAll, hasView, metadata);
          }
        }
        if (it.offset > buffer.byteLength) {
          const newSize = Math.ceil(it.offset / (Buffer.poolSize ?? 8 * 1024)) * (Buffer.poolSize ?? 8 * 1024);
          console.warn(`@colyseus/schema buffer overflow. Encoded state is higher than default BUFFER_SIZE. Use the following to increase default BUFFER_SIZE:

    import { Encoder } from "@colyseus/schema";
    Encoder.BUFFER_SIZE = ${Math.round(newSize / 1024)} * 1024; // ${Math.round(newSize / 1024)} KB
`);
          buffer = Buffer.alloc(newSize, buffer);
          if (buffer === this.sharedBuffer) {
            this.sharedBuffer = buffer;
          }
          return this.encode({ offset: initialOffset }, view2, buffer, changeSetName, isEncodeAll);
        } else {
          return buffer.subarray(0, it.offset);
        }
      }
      encodeAll(it = { offset: 0 }, buffer = this.sharedBuffer) {
        return this.encode(it, void 0, buffer, "allChanges", true);
      }
      encodeAllView(view2, sharedOffset, it, bytes = this.sharedBuffer) {
        const viewOffset = it.offset;
        this.encode(it, view2, bytes, "allFilteredChanges", true, viewOffset);
        return Buffer.concat([
          bytes.subarray(0, sharedOffset),
          bytes.subarray(viewOffset, it.offset)
        ]);
      }
      debugChanges(field) {
        const rootChangeSet = typeof field === "string" ? this.root[field] : field;
        rootChangeSet.forEach((changeTree) => {
          const changeSet = changeTree[field];
          const metadata = changeTree.ref.constructor[Symbol.metadata];
          console.log("->", { ref: changeTree.ref.constructor.name, refId: changeTree.refId, changes: Object.keys(changeSet).length });
          for (const index in changeSet) {
            const op = changeSet[index];
            console.log("  ->", {
              index,
              field: metadata == null ? void 0 : metadata[index],
              op: exports2.OPERATION[op]
            });
          }
        });
      }
      encodeView(view2, sharedOffset, it, bytes = this.sharedBuffer) {
        const viewOffset = it.offset;
        for (const [refId, changes] of view2.changes) {
          const changeTree = this.root.changeTrees[refId];
          if (changeTree === void 0) {
            view2.changes.delete(refId);
            continue;
          }
          const keys = Object.keys(changes);
          if (keys.length === 0) {
            continue;
          }
          const ref = changeTree.ref;
          const ctor = ref.constructor;
          const encoder = ctor[$encoder];
          const metadata = ctor[Symbol.metadata];
          bytes[it.offset++] = SWITCH_TO_STRUCTURE & 255;
          encode2.number(bytes, changeTree.refId, it);
          for (let i = 0, numChanges = keys.length; i < numChanges; i++) {
            const index = Number(keys[i]);
            const value = changeTree.ref[$getByIndex](index);
            const operation = value !== void 0 && changes[index] || exports2.OPERATION.DELETE;
            encoder(this, bytes, changeTree, index, operation, it, false, true, metadata);
          }
        }
        view2.changes.clear();
        this.encode(it, view2, bytes, "filteredChanges", false, viewOffset);
        return Buffer.concat([
          bytes.subarray(0, sharedOffset),
          bytes.subarray(viewOffset, it.offset)
        ]);
      }
      discardChanges() {
        var _a4, _b3;
        let length = this.root.changes.length;
        if (length > 0) {
          while (length--) {
            (_a4 = this.root.changes[length]) == null ? void 0 : _a4.endEncode("changes");
          }
          this.root.changes.length = 0;
        }
        length = this.root.filteredChanges.length;
        if (length > 0) {
          while (length--) {
            (_b3 = this.root.filteredChanges[length]) == null ? void 0 : _b3.endEncode("filteredChanges");
          }
          this.root.filteredChanges.length = 0;
        }
      }
      tryEncodeTypeId(bytes, baseType, targetType, it) {
        const baseTypeId = this.context.getTypeId(baseType);
        const targetTypeId = this.context.getTypeId(targetType);
        if (targetTypeId === void 0) {
          console.warn(`@colyseus/schema WARNING: Class "${targetType.name}" is not registered on TypeRegistry - Please either tag the class with @entity or define a @type() field.`);
          return;
        }
        if (baseTypeId !== targetTypeId) {
          bytes[it.offset++] = TYPE_ID & 255;
          encode2.number(bytes, targetTypeId, it);
        }
      }
      get hasChanges() {
        return this.root.changes.length > 0 || this.root.filteredChanges.length > 0;
      }
    };
    __name(_Encoder, "Encoder");
    _Encoder.BUFFER_SIZE = typeof Buffer !== "undefined" && Buffer.poolSize || 8 * 1024;
    let Encoder2 = _Encoder;
    function spliceOne(arr, index) {
      if (index === -1 || index >= arr.length) {
        return false;
      }
      const len = arr.length - 1;
      for (let i = index; i < len; i++) {
        arr[i] = arr[i + 1];
      }
      arr.length = len;
      return true;
    }
    __name(spliceOne, "spliceOne");
    const _DecodingWarning = class _DecodingWarning extends Error {
      constructor(message) {
        super(message);
        this.name = "DecodingWarning";
      }
    };
    __name(_DecodingWarning, "DecodingWarning");
    let DecodingWarning = _DecodingWarning;
    const _ReferenceTracker = class _ReferenceTracker {
      constructor() {
        this.refs = /* @__PURE__ */ new Map();
        this.refIds = /* @__PURE__ */ new WeakMap();
        this.refCounts = {};
        this.deletedRefs = /* @__PURE__ */ new Set();
        this.callbacks = {};
        this.nextUniqueId = 0;
      }
      getNextUniqueId() {
        return this.nextUniqueId++;
      }
      // for decoding
      addRef(refId, ref, incrementCount = true) {
        this.refs.set(refId, ref);
        this.refIds.set(ref, refId);
        if (incrementCount) {
          this.refCounts[refId] = (this.refCounts[refId] || 0) + 1;
        }
        if (this.deletedRefs.has(refId)) {
          this.deletedRefs.delete(refId);
        }
      }
      // for decoding
      removeRef(refId) {
        const refCount = this.refCounts[refId];
        if (refCount === void 0) {
          try {
            throw new DecodingWarning("trying to remove refId that doesn't exist: " + refId);
          } catch (e) {
            console.warn(e);
          }
          return;
        }
        if (refCount === 0) {
          try {
            const ref = this.refs.get(refId);
            throw new DecodingWarning(`trying to remove refId '${refId}' with 0 refCount (${ref.constructor.name}: ${JSON.stringify(ref)})`);
          } catch (e) {
            console.warn(e);
          }
          return;
        }
        if ((this.refCounts[refId] = refCount - 1) <= 0) {
          this.deletedRefs.add(refId);
        }
      }
      clearRefs() {
        this.refs.clear();
        this.deletedRefs.clear();
        this.callbacks = {};
        this.refCounts = {};
      }
      // for decoding
      garbageCollectDeletedRefs() {
        this.deletedRefs.forEach((refId) => {
          if (this.refCounts[refId] > 0) {
            return;
          }
          const ref = this.refs.get(refId);
          if (ref.constructor[Symbol.metadata] !== void 0) {
            const metadata = ref.constructor[Symbol.metadata];
            for (const index in metadata) {
              const field = metadata[index].name;
              const childRefId = typeof ref[field] === "object" && this.refIds.get(ref[field]);
              if (childRefId && !this.deletedRefs.has(childRefId)) {
                this.removeRef(childRefId);
              }
            }
          } else {
            if (typeof ref[$childType] === "function") {
              Array.from(ref.values()).forEach((child) => {
                const childRefId = this.refIds.get(child);
                if (!this.deletedRefs.has(childRefId)) {
                  this.removeRef(childRefId);
                }
              });
            }
          }
          this.refs.delete(refId);
          delete this.refCounts[refId];
          delete this.callbacks[refId];
        });
        this.deletedRefs.clear();
      }
      addCallback(refId, fieldOrOperation, callback) {
        if (refId === void 0) {
          const name = typeof fieldOrOperation === "number" ? exports2.OPERATION[fieldOrOperation] : fieldOrOperation;
          throw new Error(`Can't addCallback on '${name}' (refId is undefined)`);
        }
        if (!this.callbacks[refId]) {
          this.callbacks[refId] = {};
        }
        if (!this.callbacks[refId][fieldOrOperation]) {
          this.callbacks[refId][fieldOrOperation] = [];
        }
        this.callbacks[refId][fieldOrOperation].push(callback);
        return () => this.removeCallback(refId, fieldOrOperation, callback);
      }
      removeCallback(refId, field, callback) {
        var _a4, _b3, _c2;
        const index = (_c2 = (_b3 = (_a4 = this.callbacks) == null ? void 0 : _a4[refId]) == null ? void 0 : _b3[field]) == null ? void 0 : _c2.indexOf(callback);
        if (index !== -1) {
          spliceOne(this.callbacks[refId][field], index);
        }
      }
    };
    __name(_ReferenceTracker, "ReferenceTracker");
    let ReferenceTracker = _ReferenceTracker;
    const _Decoder = class _Decoder {
      constructor(root, context) {
        this.currentRefId = 0;
        this.setState(root);
        this.context = context || new TypeContext(root.constructor);
      }
      setState(root) {
        this.state = root;
        this.root = new ReferenceTracker();
        this.root.addRef(0, root);
      }
      decode(bytes, it = { offset: 0 }, ref = this.state) {
        var _a4, _b3, _c2;
        const allChanges = [];
        const $root = this.root;
        const totalBytes = bytes.byteLength;
        let decoder2 = ref["constructor"][$decoder];
        this.currentRefId = 0;
        while (it.offset < totalBytes) {
          if (bytes[it.offset] == SWITCH_TO_STRUCTURE) {
            it.offset++;
            this.currentRefId = decode2.number(bytes, it);
            const nextRef = $root.refs.get(this.currentRefId);
            if (!nextRef) {
              throw new Error(`"refId" not found: ${this.currentRefId}`);
            }
            (_a4 = ref[$onDecodeEnd]) == null ? void 0 : _a4.call(ref);
            ref = nextRef;
            decoder2 = ref.constructor[$decoder];
            continue;
          }
          const result = decoder2(this, bytes, it, ref, allChanges);
          if (result === DEFINITION_MISMATCH) {
            console.warn("@colyseus/schema: definition mismatch");
            const nextIterator = { offset: it.offset };
            while (it.offset < totalBytes) {
              if (bytes[it.offset] === SWITCH_TO_STRUCTURE) {
                nextIterator.offset = it.offset + 1;
                if ($root.refs.has(decode2.number(bytes, nextIterator))) {
                  break;
                }
              }
              it.offset++;
            }
            continue;
          }
        }
        (_b3 = ref[$onDecodeEnd]) == null ? void 0 : _b3.call(ref);
        (_c2 = this.triggerChanges) == null ? void 0 : _c2.call(this, allChanges);
        $root.garbageCollectDeletedRefs();
        return allChanges;
      }
      getInstanceType(bytes, it, defaultType) {
        let type2;
        if (bytes[it.offset] === TYPE_ID) {
          it.offset++;
          const type_id = decode2.number(bytes, it);
          type2 = this.context.get(type_id);
        }
        return type2 || defaultType;
      }
      createInstanceOfType(type2) {
        return new type2();
      }
      removeChildRefs(ref, allChanges) {
        const needRemoveRef = typeof ref[$childType] !== "string";
        const refId = this.root.refIds.get(ref);
        ref.forEach((value, key) => {
          allChanges.push({
            ref,
            refId,
            op: exports2.OPERATION.DELETE,
            field: key,
            value: void 0,
            previousValue: value
          });
          if (needRemoveRef) {
            this.root.removeRef(this.root.refIds.get(value));
          }
        });
      }
    };
    __name(_Decoder, "Decoder");
    let Decoder2 = _Decoder;
    const _ReflectionField = class _ReflectionField extends Schema {
    };
    __name(_ReflectionField, "ReflectionField");
    let ReflectionField = _ReflectionField;
    __decorate2([
      type("string")
    ], ReflectionField.prototype, "name", void 0);
    __decorate2([
      type("string")
    ], ReflectionField.prototype, "type", void 0);
    __decorate2([
      type("number")
    ], ReflectionField.prototype, "referencedType", void 0);
    const _ReflectionType = class _ReflectionType extends Schema {
      constructor() {
        super(...arguments);
        this.fields = new ArraySchema();
      }
    };
    __name(_ReflectionType, "ReflectionType");
    let ReflectionType = _ReflectionType;
    __decorate2([
      type("number")
    ], ReflectionType.prototype, "id", void 0);
    __decorate2([
      type("number")
    ], ReflectionType.prototype, "extendsId", void 0);
    __decorate2([
      type([ReflectionField])
    ], ReflectionType.prototype, "fields", void 0);
    const _Reflection = class _Reflection extends Schema {
      constructor() {
        super(...arguments);
        this.types = new ArraySchema();
      }
      /**
       * Encodes the TypeContext of an Encoder into a buffer.
       *
       * @param encoder Encoder instance
       * @param it
       * @returns
       */
      static encode(encoder, it = { offset: 0 }) {
        const context = encoder.context;
        const reflection = new _Reflection();
        const reflectionEncoder = new Encoder2(reflection);
        const rootType = context.schemas.get(encoder.state.constructor);
        if (rootType > 0) {
          reflection.rootType = rootType;
        }
        const includedTypeIds = /* @__PURE__ */ new Set();
        const pendingReflectionTypes = {};
        const addType = /* @__PURE__ */ __name((type2) => {
          if (type2.extendsId === void 0 || includedTypeIds.has(type2.extendsId)) {
            includedTypeIds.add(type2.id);
            reflection.types.push(type2);
            const deps = pendingReflectionTypes[type2.id];
            if (deps !== void 0) {
              delete pendingReflectionTypes[type2.id];
              deps.forEach((childType) => addType(childType));
            }
          } else {
            if (pendingReflectionTypes[type2.extendsId] === void 0) {
              pendingReflectionTypes[type2.extendsId] = [];
            }
            pendingReflectionTypes[type2.extendsId].push(type2);
          }
        }, "addType");
        context.schemas.forEach((typeid, klass) => {
          const type2 = new ReflectionType();
          type2.id = Number(typeid);
          const inheritFrom = Object.getPrototypeOf(klass);
          if (inheritFrom !== Schema) {
            type2.extendsId = context.schemas.get(inheritFrom);
          }
          const metadata = klass[Symbol.metadata];
          if (metadata !== inheritFrom[Symbol.metadata]) {
            for (const fieldIndex in metadata) {
              const index = Number(fieldIndex);
              const fieldName = metadata[index].name;
              if (!Object.prototype.hasOwnProperty.call(metadata, fieldName)) {
                continue;
              }
              const reflectionField = new ReflectionField();
              reflectionField.name = fieldName;
              let fieldType;
              const field = metadata[index];
              if (typeof field.type === "string") {
                fieldType = field.type;
              } else {
                let childTypeSchema;
                if (Schema.is(field.type)) {
                  fieldType = "ref";
                  childTypeSchema = field.type;
                } else {
                  fieldType = Object.keys(field.type)[0];
                  if (typeof field.type[fieldType] === "string") {
                    fieldType += ":" + field.type[fieldType];
                  } else {
                    childTypeSchema = field.type[fieldType];
                  }
                }
                reflectionField.referencedType = childTypeSchema ? context.getTypeId(childTypeSchema) : -1;
              }
              reflectionField.type = fieldType;
              type2.fields.push(reflectionField);
            }
          }
          addType(type2);
        });
        for (const typeid in pendingReflectionTypes) {
          pendingReflectionTypes[typeid].forEach((type2) => reflection.types.push(type2));
        }
        const buf = reflectionEncoder.encodeAll(it);
        return Buffer.from(buf, 0, it.offset);
      }
      /**
       * Decodes the TypeContext from a buffer into a Decoder instance.
       *
       * @param bytes Reflection.encode() output
       * @param it
       * @returns Decoder instance
       */
      static decode(bytes, it) {
        const reflection = new _Reflection();
        const reflectionDecoder = new Decoder2(reflection);
        reflectionDecoder.decode(bytes, it);
        const typeContext = new TypeContext();
        reflection.types.forEach((reflectionType) => {
          var _a4;
          const parentClass = typeContext.get(reflectionType.extendsId) ?? Schema;
          const schema3 = (_a4 = class extends parentClass {
          }, __name(_a4, "_"), _a4);
          TypeContext.register(schema3);
          typeContext.add(schema3, reflectionType.id);
        }, {});
        const addFields = /* @__PURE__ */ __name((metadata, reflectionType, parentFieldIndex) => {
          reflectionType.fields.forEach((field, i) => {
            const fieldIndex = parentFieldIndex + i;
            if (field.referencedType !== void 0) {
              let fieldType = field.type;
              let refType = typeContext.get(field.referencedType);
              if (!refType) {
                const typeInfo = field.type.split(":");
                fieldType = typeInfo[0];
                refType = typeInfo[1];
              }
              if (fieldType === "ref") {
                Metadata.addField(metadata, fieldIndex, field.name, refType);
              } else {
                Metadata.addField(metadata, fieldIndex, field.name, { [fieldType]: refType });
              }
            } else {
              Metadata.addField(metadata, fieldIndex, field.name, field.type);
            }
          });
        }, "addFields");
        reflection.types.forEach((reflectionType) => {
          const schema3 = typeContext.get(reflectionType.id);
          const metadata = Metadata.initialize(schema3);
          const inheritedTypes = [];
          let parentType = reflectionType;
          do {
            inheritedTypes.push(parentType);
            parentType = reflection.types.find((t) => t.id === parentType.extendsId);
          } while (parentType);
          let parentFieldIndex = 0;
          inheritedTypes.reverse().forEach((reflectionType2) => {
            addFields(metadata, reflectionType2, parentFieldIndex);
            parentFieldIndex += reflectionType2.fields.length;
          });
        });
        const state = new (typeContext.get(reflection.rootType || 0))();
        return new Decoder2(state, typeContext);
      }
    };
    __name(_Reflection, "Reflection");
    let Reflection = _Reflection;
    __decorate2([
      type([ReflectionType])
    ], Reflection.prototype, "types", void 0);
    __decorate2([
      type("number")
    ], Reflection.prototype, "rootType", void 0);
    function getDecoderStateCallbacks(decoder2) {
      const $root = decoder2.root;
      const callbacks = $root.callbacks;
      const onAddCalls = /* @__PURE__ */ new WeakMap();
      let currentOnAddCallback;
      decoder2.triggerChanges = function(allChanges) {
        var _a4;
        const uniqueRefIds = /* @__PURE__ */ new Set();
        for (let i = 0, l = allChanges.length; i < l; i++) {
          const change = allChanges[i];
          const refId = change.refId;
          const ref = change.ref;
          const $callbacks = callbacks[refId];
          if (!$callbacks) {
            continue;
          }
          if ((change.op & exports2.OPERATION.DELETE) === exports2.OPERATION.DELETE && change.previousValue instanceof Schema) {
            const deleteCallbacks = (_a4 = callbacks[$root.refIds.get(change.previousValue)]) == null ? void 0 : _a4[exports2.OPERATION.DELETE];
            for (let i2 = (deleteCallbacks == null ? void 0 : deleteCallbacks.length) - 1; i2 >= 0; i2--) {
              deleteCallbacks[i2]();
            }
          }
          if (ref instanceof Schema) {
            if (!uniqueRefIds.has(refId)) {
              const replaceCallbacks = $callbacks == null ? void 0 : $callbacks[exports2.OPERATION.REPLACE];
              for (let i2 = (replaceCallbacks == null ? void 0 : replaceCallbacks.length) - 1; i2 >= 0; i2--) {
                replaceCallbacks[i2]();
              }
            }
            if ($callbacks.hasOwnProperty(change.field)) {
              const fieldCallbacks = $callbacks[change.field];
              for (let i2 = (fieldCallbacks == null ? void 0 : fieldCallbacks.length) - 1; i2 >= 0; i2--) {
                fieldCallbacks[i2](change.value, change.previousValue);
              }
            }
          } else {
            if ((change.op & exports2.OPERATION.DELETE) === exports2.OPERATION.DELETE) {
              if (change.previousValue !== void 0) {
                const deleteCallbacks = $callbacks[exports2.OPERATION.DELETE];
                for (let i2 = (deleteCallbacks == null ? void 0 : deleteCallbacks.length) - 1; i2 >= 0; i2--) {
                  deleteCallbacks[i2](change.previousValue, change.dynamicIndex ?? change.field);
                }
              }
              if ((change.op & exports2.OPERATION.ADD) === exports2.OPERATION.ADD) {
                const addCallbacks = $callbacks[exports2.OPERATION.ADD];
                for (let i2 = (addCallbacks == null ? void 0 : addCallbacks.length) - 1; i2 >= 0; i2--) {
                  addCallbacks[i2](change.value, change.dynamicIndex ?? change.field);
                }
              }
            } else if ((change.op & exports2.OPERATION.ADD) === exports2.OPERATION.ADD && change.previousValue !== change.value) {
              const addCallbacks = $callbacks[exports2.OPERATION.ADD];
              for (let i2 = (addCallbacks == null ? void 0 : addCallbacks.length) - 1; i2 >= 0; i2--) {
                addCallbacks[i2](change.value, change.dynamicIndex ?? change.field);
              }
            }
            if (change.value !== change.previousValue && // FIXME: see "should not encode item if added and removed at the same patch" test case.
            // some "ADD" + "DELETE" operations on same patch are being encoded as "DELETE"
            (change.value !== void 0 || change.previousValue !== void 0)) {
              const replaceCallbacks = $callbacks[exports2.OPERATION.REPLACE];
              for (let i2 = (replaceCallbacks == null ? void 0 : replaceCallbacks.length) - 1; i2 >= 0; i2--) {
                replaceCallbacks[i2](change.value, change.dynamicIndex ?? change.field);
              }
            }
          }
          uniqueRefIds.add(refId);
        }
      };
      function getProxy(metadataOrType, context) {
        var _a4;
        let metadata = ((_a4 = context.instance) == null ? void 0 : _a4.constructor[Symbol.metadata]) || metadataOrType;
        let isCollection = context.instance && typeof context.instance["forEach"] === "function" || metadataOrType && typeof metadataOrType[Symbol.metadata] === "undefined";
        if (metadata && !isCollection) {
          const onAddListen = /* @__PURE__ */ __name(function(ref, prop, callback, immediate) {
            if (immediate && context.instance[prop] !== void 0 && !onAddCalls.has(currentOnAddCallback)) {
              callback(context.instance[prop], void 0);
            }
            return $root.addCallback($root.refIds.get(ref), prop, callback);
          }, "onAddListen");
          return new Proxy({
            listen: /* @__PURE__ */ __name(function listen(prop, callback, immediate = true) {
              if (context.instance) {
                return onAddListen(context.instance, prop, callback, immediate);
              } else {
                let detachCallback = /* @__PURE__ */ __name(() => {
                }, "detachCallback");
                context.onInstanceAvailable((ref, existing) => {
                  detachCallback = onAddListen(ref, prop, callback, immediate && existing && !onAddCalls.has(currentOnAddCallback));
                });
                return () => detachCallback();
              }
            }, "listen"),
            onChange: /* @__PURE__ */ __name(function onChange(callback) {
              return $root.addCallback($root.refIds.get(context.instance), exports2.OPERATION.REPLACE, callback);
            }, "onChange"),
            //
            // TODO: refactor `bindTo()` implementation.
            // There is room for improvement.
            //
            bindTo: /* @__PURE__ */ __name(function bindTo(targetObject, properties) {
              if (!properties) {
                properties = Object.keys(metadata).map((index) => metadata[index].name);
              }
              return $root.addCallback($root.refIds.get(context.instance), exports2.OPERATION.REPLACE, () => {
                properties.forEach((prop) => targetObject[prop] = context.instance[prop]);
              });
            }, "bindTo")
          }, {
            get(target2, prop) {
              var _a5;
              const metadataField = metadata[metadata[prop]];
              if (metadataField) {
                const instance = (_a5 = context.instance) == null ? void 0 : _a5[prop];
                const onInstanceAvailable = /* @__PURE__ */ __name((callback) => {
                  const unbind = $(context.instance).listen(prop, (value, _) => {
                    callback(value, false);
                    unbind == null ? void 0 : unbind();
                  }, false);
                  if ($root.refIds.get(instance) !== void 0) {
                    callback(instance, true);
                  }
                }, "onInstanceAvailable");
                return getProxy(metadataField.type, {
                  // make sure refId is available, otherwise need to wait for the instance to be available.
                  instance: $root.refIds.get(instance) && instance,
                  parentInstance: context.instance,
                  onInstanceAvailable
                });
              } else {
                return target2[prop];
              }
            },
            has(target2, prop) {
              return metadata[prop] !== void 0;
            },
            set(_, _1, _2) {
              throw new Error("not allowed");
            },
            deleteProperty(_, _1) {
              throw new Error("not allowed");
            }
          });
        } else {
          const onAdd = /* @__PURE__ */ __name(function(ref, callback, immediate) {
            if (immediate) {
              ref.forEach((v, k) => callback(v, k));
            }
            return $root.addCallback($root.refIds.get(ref), exports2.OPERATION.ADD, (value, key) => {
              onAddCalls.set(callback, true);
              currentOnAddCallback = callback;
              callback(value, key);
              onAddCalls.delete(callback);
              currentOnAddCallback = void 0;
            });
          }, "onAdd");
          const onRemove = /* @__PURE__ */ __name(function(ref, callback) {
            return $root.addCallback($root.refIds.get(ref), exports2.OPERATION.DELETE, callback);
          }, "onRemove");
          const onChange = /* @__PURE__ */ __name(function(ref, callback) {
            return $root.addCallback($root.refIds.get(ref), exports2.OPERATION.REPLACE, callback);
          }, "onChange");
          return new Proxy({
            onAdd: /* @__PURE__ */ __name(function(callback, immediate = true) {
              if (context.instance) {
                return onAdd(context.instance, callback, immediate && !onAddCalls.has(currentOnAddCallback));
              } else if (context.onInstanceAvailable) {
                let detachCallback = /* @__PURE__ */ __name(() => {
                }, "detachCallback");
                context.onInstanceAvailable((ref, existing) => {
                  detachCallback = onAdd(ref, callback, immediate && existing && !onAddCalls.has(currentOnAddCallback));
                });
                return () => detachCallback();
              }
            }, "onAdd"),
            onRemove: /* @__PURE__ */ __name(function(callback) {
              if (context.instance) {
                return onRemove(context.instance, callback);
              } else if (context.onInstanceAvailable) {
                let detachCallback = /* @__PURE__ */ __name(() => {
                }, "detachCallback");
                context.onInstanceAvailable((ref) => {
                  detachCallback = onRemove(ref, callback);
                });
                return () => detachCallback();
              }
            }, "onRemove"),
            onChange: /* @__PURE__ */ __name(function(callback) {
              if (context.instance) {
                return onChange(context.instance, callback);
              } else if (context.onInstanceAvailable) {
                let detachCallback = /* @__PURE__ */ __name(() => {
                }, "detachCallback");
                context.onInstanceAvailable((ref) => {
                  detachCallback = onChange(ref, callback);
                });
                return () => detachCallback();
              }
            }, "onChange")
          }, {
            get(target2, prop) {
              if (!target2[prop]) {
                throw new Error(`Can't access '${prop}' through callback proxy. access the instance directly.`);
              }
              return target2[prop];
            },
            has(target2, prop) {
              return target2[prop] !== void 0;
            },
            set(_, _1, _2) {
              throw new Error("not allowed");
            },
            deleteProperty(_, _1) {
              throw new Error("not allowed");
            }
          });
        }
      }
      __name(getProxy, "getProxy");
      function $(instance) {
        return getProxy(void 0, { instance });
      }
      __name($, "$");
      return $;
    }
    __name(getDecoderStateCallbacks, "getDecoderStateCallbacks");
    function getRawChangesCallback(decoder2, callback) {
      decoder2.triggerChanges = callback;
    }
    __name(getRawChangesCallback, "getRawChangesCallback");
    const _StateView = class _StateView {
      constructor(iterable = false) {
        this.iterable = iterable;
        this.visible = /* @__PURE__ */ new WeakSet();
        this.invisible = /* @__PURE__ */ new WeakSet();
        this.changes = /* @__PURE__ */ new Map();
        if (iterable) {
          this.items = [];
        }
      }
      // TODO: allow to set multiple tags at once
      add(obj, tag = DEFAULT_VIEW_TAG, checkIncludeParent = true) {
        var _a4, _b3;
        const changeTree = obj == null ? void 0 : obj[$changes];
        if (!changeTree) {
          console.warn("StateView#add(), invalid object:", obj);
          return this;
        } else if (!changeTree.parent && changeTree.refId !== 0) {
          throw new Error(`Cannot add a detached instance to the StateView. Make sure to assign the "${changeTree.ref.constructor.name}" instance to the state before calling view.add()`);
        }
        const metadata = obj.constructor[Symbol.metadata];
        this.visible.add(changeTree);
        if (this.iterable && checkIncludeParent) {
          this.items.push(obj);
        }
        if (checkIncludeParent && changeTree.parent) {
          this.addParentOf(changeTree, tag);
        }
        let changes = this.changes.get(changeTree.refId);
        if (changes === void 0) {
          changes = {};
          this.changes.set(changeTree.refId, changes);
        }
        if (tag !== DEFAULT_VIEW_TAG) {
          if (!this.tags) {
            this.tags = /* @__PURE__ */ new WeakMap();
          }
          let tags;
          if (!this.tags.has(changeTree)) {
            tags = /* @__PURE__ */ new Set();
            this.tags.set(changeTree, tags);
          } else {
            tags = this.tags.get(changeTree);
          }
          tags.add(tag);
          (_b3 = (_a4 = metadata == null ? void 0 : metadata[$fieldIndexesByViewTag]) == null ? void 0 : _a4[tag]) == null ? void 0 : _b3.forEach((index) => {
            if (changeTree.getChange(index) !== exports2.OPERATION.DELETE) {
              changes[index] = exports2.OPERATION.ADD;
            }
          });
        } else {
          const isInvisible = this.invisible.has(changeTree);
          const changeSet = changeTree.filteredChanges !== void 0 ? changeTree.allFilteredChanges : changeTree.allChanges;
          for (let i = 0, len = changeSet.operations.length; i < len; i++) {
            const index = changeSet.operations[i];
            if (index === void 0) {
              continue;
            }
            const op = changeTree.indexedOperations[index] ?? exports2.OPERATION.ADD;
            const tagAtIndex = metadata == null ? void 0 : metadata[index].tag;
            if (!changeTree.isNew && // new structures will be added as part of .encode() call, no need to force it to .encodeView()
            (isInvisible || // if "invisible", include all
            tagAtIndex === void 0 || // "all change" with no tag
            tagAtIndex === tag) && op !== exports2.OPERATION.DELETE) {
              changes[index] = op;
            }
          }
        }
        changeTree.forEachChild((change, index) => {
          if (metadata && metadata[index].tag !== void 0 && metadata[index].tag !== tag) {
            return;
          }
          this.add(change.ref, tag, false);
        });
        return this;
      }
      addParentOf(childChangeTree, tag) {
        var _a4;
        const changeTree = childChangeTree.parent[$changes];
        const parentIndex = childChangeTree.parentIndex;
        if (!this.visible.has(changeTree)) {
          this.visible.add(changeTree);
          const parentChangeTree = (_a4 = changeTree.parent) == null ? void 0 : _a4[$changes];
          if (parentChangeTree && parentChangeTree.filteredChanges !== void 0) {
            this.addParentOf(changeTree, tag);
          }
        }
        if (changeTree.getChange(parentIndex) !== exports2.OPERATION.DELETE) {
          let changes = this.changes.get(changeTree.refId);
          if (changes === void 0) {
            changes = {};
            this.changes.set(changeTree.refId, changes);
          }
          if (!this.tags) {
            this.tags = /* @__PURE__ */ new WeakMap();
          }
          let tags;
          if (!this.tags.has(changeTree)) {
            tags = /* @__PURE__ */ new Set();
            this.tags.set(changeTree, tags);
          } else {
            tags = this.tags.get(changeTree);
          }
          tags.add(tag);
          changes[parentIndex] = exports2.OPERATION.ADD;
        }
      }
      remove(obj, tag = DEFAULT_VIEW_TAG, _isClear = false) {
        var _a4;
        const changeTree = obj[$changes];
        if (!changeTree) {
          console.warn("StateView#remove(), invalid object:", obj);
          return this;
        }
        this.visible.delete(changeTree);
        if (this.iterable && !_isClear) {
          spliceOne(this.items, this.items.indexOf(obj));
        }
        const ref = changeTree.ref;
        const metadata = ref.constructor[Symbol.metadata];
        let changes = this.changes.get(changeTree.refId);
        if (changes === void 0) {
          changes = {};
          this.changes.set(changeTree.refId, changes);
        }
        if (tag === DEFAULT_VIEW_TAG) {
          const parent = changeTree.parent;
          if (!Metadata.isValidInstance(parent) && changeTree.isFiltered) {
            const parentChangeTree = parent[$changes];
            let changes2 = this.changes.get(parentChangeTree.refId);
            if (changes2 === void 0) {
              changes2 = {};
              this.changes.set(parentChangeTree.refId, changes2);
            }
            changes2[changeTree.parentIndex] = exports2.OPERATION.DELETE;
          } else {
            (_a4 = metadata == null ? void 0 : metadata[$viewFieldIndexes]) == null ? void 0 : _a4.forEach((index) => changes[index] = exports2.OPERATION.DELETE);
          }
        } else {
          metadata == null ? void 0 : metadata[$fieldIndexesByViewTag][tag].forEach((index) => changes[index] = exports2.OPERATION.DELETE);
        }
        if (this.tags && this.tags.has(changeTree)) {
          const tags = this.tags.get(changeTree);
          if (tag === void 0) {
            this.tags.delete(changeTree);
          } else {
            tags.delete(tag);
            if (tags.size === 0) {
              this.tags.delete(changeTree);
            }
          }
        }
        return this;
      }
      has(obj) {
        return this.visible.has(obj[$changes]);
      }
      hasTag(ob, tag = DEFAULT_VIEW_TAG) {
        var _a4;
        const tags = (_a4 = this.tags) == null ? void 0 : _a4.get(ob[$changes]);
        return (tags == null ? void 0 : tags.has(tag)) ?? false;
      }
      clear() {
        if (!this.iterable) {
          throw new Error("StateView#clear() is only available for iterable StateView's. Use StateView(iterable: true) constructor.");
        }
        for (let i = 0, l = this.items.length; i < l; i++) {
          this.remove(this.items[i], DEFAULT_VIEW_TAG, true);
        }
        this.items.length = 0;
      }
      isChangeTreeVisible(changeTree) {
        let isVisible = this.visible.has(changeTree);
        if (!isVisible && changeTree.isVisibilitySharedWithParent) {
          if (this.visible.has(changeTree.parent[$changes])) {
            this.visible.add(changeTree);
            isVisible = true;
          }
        }
        return isVisible;
      }
    };
    __name(_StateView, "StateView");
    let StateView = _StateView;
    registerType("map", { constructor: MapSchema });
    registerType("array", { constructor: ArraySchema });
    registerType("set", { constructor: SetSchema });
    registerType("collection", { constructor: CollectionSchema });
    exports2.$changes = $changes;
    exports2.$childType = $childType;
    exports2.$decoder = $decoder;
    exports2.$deleteByIndex = $deleteByIndex;
    exports2.$encoder = $encoder;
    exports2.$filter = $filter;
    exports2.$getByIndex = $getByIndex;
    exports2.$track = $track;
    exports2.ArraySchema = ArraySchema;
    exports2.ChangeTree = ChangeTree;
    exports2.CollectionSchema = CollectionSchema;
    exports2.Decoder = Decoder2;
    exports2.Encoder = Encoder2;
    exports2.MapSchema = MapSchema;
    exports2.Metadata = Metadata;
    exports2.Reflection = Reflection;
    exports2.ReflectionField = ReflectionField;
    exports2.ReflectionType = ReflectionType;
    exports2.Schema = Schema;
    exports2.SetSchema = SetSchema;
    exports2.StateView = StateView;
    exports2.TypeContext = TypeContext;
    exports2.decode = decode2;
    exports2.decodeKeyValueOperation = decodeKeyValueOperation;
    exports2.decodeSchemaOperation = decodeSchemaOperation;
    exports2.defineCustomTypes = defineCustomTypes;
    exports2.defineTypes = defineTypes;
    exports2.deprecated = deprecated;
    exports2.dumpChanges = dumpChanges;
    exports2.encode = encode2;
    exports2.encodeArray = encodeArray;
    exports2.encodeKeyValueOperation = encodeKeyValueOperation;
    exports2.encodeSchemaOperation = encodeSchemaOperation;
    exports2.entity = entity;
    exports2.getDecoderStateCallbacks = getDecoderStateCallbacks;
    exports2.getRawChangesCallback = getRawChangesCallback;
    exports2.registerType = registerType;
    exports2.schema = schema2;
    exports2.type = type;
    exports2.view = view;
  });
})(umd, umd.exports);
var umdExports = umd.exports;
var __defProp2 = Object.defineProperty;
var __decorateClass = /* @__PURE__ */ __name((decorators, target2, key, kind) => {
  var result = void 0;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = decorator(target2, key, result) || result;
  if (result) __defProp2(target2, key, result);
  return result;
}, "__decorateClass");
const _CardInstanceSchema = (_g = class extends umdExports.Schema {
  constructor() {
    super(...arguments);
    this.instanceId = "";
    this.cardId = "";
    this.name = "";
    this.attack = 0;
    this.speed = 0;
    this.health = 0;
    this.currentHp = 0;
    this.brewCost = 0;
    this.description = "";
    this.isLegend = false;
  }
  // Helper to create from client-like data
  static fromCardData(data, instanceId) {
    const card = new _g();
    card.instanceId = instanceId;
    card.cardId = data.id;
    card.name = data.name;
    card.attack = data.attack;
    card.speed = data.speed;
    card.health = data.health;
    card.currentHp = data.health;
    card.brewCost = data.brewCost;
    card.description = data.description;
    card.isLegend = data.isLegend;
    return card;
  }
}, __name(_g, "_CardInstanceSchema"), _g);
__decorateClass([
  umdExports.type("string")
], _CardInstanceSchema.prototype, "instanceId");
__decorateClass([
  umdExports.type("string")
], _CardInstanceSchema.prototype, "cardId");
__decorateClass([
  umdExports.type("string")
], _CardInstanceSchema.prototype, "name");
__decorateClass([
  umdExports.type("number")
], _CardInstanceSchema.prototype, "attack");
__decorateClass([
  umdExports.type("number")
], _CardInstanceSchema.prototype, "speed");
__decorateClass([
  umdExports.type("number")
], _CardInstanceSchema.prototype, "health");
__decorateClass([
  umdExports.type("number")
], _CardInstanceSchema.prototype, "currentHp");
__decorateClass([
  umdExports.type("number")
], _CardInstanceSchema.prototype, "brewCost");
__decorateClass([
  umdExports.type("string")
], _CardInstanceSchema.prototype, "description");
__decorateClass([
  umdExports.type("boolean")
], _CardInstanceSchema.prototype, "isLegend");
let CardInstanceSchema = _CardInstanceSchema;
const _PlayerState = class _PlayerState extends umdExports.Schema {
  constructor() {
    super(...arguments);
    this.sessionId = "";
    this.username = "Player";
    this.health = 100;
    this.brews = 5;
    this.shopRefreshCost = 1;
    this.hand = new umdExports.MapSchema();
    this.battlefield = new umdExports.MapSchema();
    this.isReady = false;
    this.shopOfferIds = new umdExports.ArraySchema();
  }
  // IDs of cards offered in the shop this phase
};
__name(_PlayerState, "PlayerState");
let PlayerState = _PlayerState;
__decorateClass([
  umdExports.type("string")
], PlayerState.prototype, "sessionId");
__decorateClass([
  umdExports.type("string")
], PlayerState.prototype, "username");
__decorateClass([
  umdExports.type("number")
], PlayerState.prototype, "health");
__decorateClass([
  umdExports.type("number")
], PlayerState.prototype, "brews");
__decorateClass([
  umdExports.type("number")
], PlayerState.prototype, "shopRefreshCost");
__decorateClass([
  umdExports.type({ map: CardInstanceSchema })
], PlayerState.prototype, "hand");
__decorateClass([
  umdExports.type({ map: CardInstanceSchema })
], PlayerState.prototype, "battlefield");
__decorateClass([
  umdExports.type("boolean")
], PlayerState.prototype, "isReady");
__decorateClass([
  umdExports.type(["string"])
], PlayerState.prototype, "shopOfferIds");
const _GameState = class _GameState extends umdExports.Schema {
  constructor() {
    super(...arguments);
    this.players = new umdExports.MapSchema();
    this.currentDay = 0;
    this.currentPhase = "Lobby";
    this.battleTimer = 0;
  }
  // Countdown in seconds
};
__name(_GameState, "GameState");
let GameState = _GameState;
__decorateClass([
  umdExports.type({ map: PlayerState })
], GameState.prototype, "players");
__decorateClass([
  umdExports.type("number")
], GameState.prototype, "currentDay");
__decorateClass([
  umdExports.type("string")
], GameState.prototype, "currentPhase");
__decorateClass([
  umdExports.type("number")
], GameState.prototype, "battleTimer");
console.log("Server schema classes (GameState, PlayerState, CardInstanceSchema) imported for Colyseus runtime:");
console.log("- GameState:", GameState, "GameState.name:", GameState.name);
console.log("- PlayerState:", PlayerState, "PlayerState.name:", PlayerState.name);
console.log("- CardInstanceSchema:", CardInstanceSchema, "CardInstanceSchema.name:", CardInstanceSchema.name);
let colyseusRoom = null;
let colyseusClient = null;
let globalCardDataCache = /* @__PURE__ */ new Map();
async function loadAllCardData() {
  if (!colyseusRoom) return false;
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.error("loadAllCardData: Timeout while waiting for card data");
      resolve(false);
    }, 5e3);
    colyseusRoom.send("getAllCards");
    colyseusRoom.onMessage("allCards", (cardData) => {
      clearTimeout(timeout);
      console.log(`Received ${cardData.length} cards from server`);
      globalCardDataCache.clear();
      cardData.forEach((card) => {
        globalCardDataCache.set(card.id, card);
      });
      resolve(true);
    });
  });
}
__name(loadAllCardData, "loadAllCardData");
async function connectColyseus(accessToken, username) {
  const url = location.host.includes("localhost") ? `ws://localhost:4001` : `wss://${location.host}/.proxy/api`;
  colyseusClient = new cjs.Client(url);
  try {
    console.log("Attempting to join or create Colyseus room...");
    colyseusRoom = await colyseusClient.joinOrCreate("game", {
      accessToken,
      // Pass token for potential server-side validation/use
      username
    });
    console.log("Successfully joined room:", colyseusRoom.roomId);
    console.log("Session ID:", colyseusRoom.sessionId);
    console.log("Initial room state:", colyseusRoom.state.toJSON());
    console.log("Loading all card data...");
    await loadAllCardData();
    console.log("Card data loaded, cache size:", globalCardDataCache.size);
    colyseusRoom.onStateChange((state) => {
    });
    colyseusRoom.onError((code, message) => {
      console.error("Colyseus room error:", code, message);
      colyseusRoom = null;
    });
    colyseusRoom.onLeave((code) => {
      console.log("Left Colyseus room, code:", code);
      colyseusRoom = null;
    });
  } catch (e) {
    console.error("Failed to connect to Colyseus:", e);
    if (e instanceof ProgressEvent) {
      console.error("Connection failed: Network error (ProgressEvent). Potential causes:");
      console.error("- Colyseus server might not be running or accessible at the target URL:", url);
      console.error("- WebSocket connection blocked by firewall or proxy.");
      console.error("- Incorrect WebSocket proxy configuration on the deployment server (if applicable).");
      alert(`Failed to connect to game server: Network Error. Please ensure the server is running and accessible.`);
    } else if (e instanceof Error) {
      console.error("Connection failed due to error:", e.message);
      alert(`Failed to connect to game server: ${e.message}`);
    } else {
      console.error("Connection failed due to unknown error:", e);
      alert(`Failed to connect to game server: An unknown error occurred.`);
    }
    colyseusRoom = null;
    throw e;
  }
}
__name(connectColyseus, "connectColyseus");
let auth;
const queryParams = new URLSearchParams(window.location.search);
const isEmbedded = queryParams.get("frame_id") != null;
let discordSdk;
const clientId = "1363939642289946886";
const mockUserId = getOverrideOrRandomSessionValue("user_id");
const mockGuildId = getOverrideOrRandomSessionValue("guild_id");
const mockChannelId = getOverrideOrRandomSessionValue("channel_id");
const initiateDiscordSDK = /* @__PURE__ */ __name(async () => {
  if (isEmbedded) {
    const discordClientID = clientId;
    console.log("Discord SDK: Using embedded client ID:", discordClientID);
    discordSdk = new DiscordSDK(discordClientID);
    await discordSdk.ready();
  } else {
    discordSdk = new DiscordSDKMock(clientId, mockGuildId, mockChannelId);
    const discriminator = String(mockUserId.charCodeAt(0) % 5);
    const mockAuthData = {
      access_token: "mock_token",
      user: {
        username: mockUserId,
        discriminator,
        id: mockUserId,
        avatar: null,
        public_flags: 1
      },
      scopes: [],
      expires: new Date(2112, 1, 1).toString(),
      application: {
        description: "mock_app_description",
        icon: "mock_app_icon",
        id: "mock_app_id",
        name: "mock_app_name"
      }
    };
    discordSdk._updateCommandMocks({
      authenticate: /* @__PURE__ */ __name(async () => {
        auth = mockAuthData;
        console.log("Mock Authentication successful:", auth);
        await connectColyseus(auth.access_token, auth.user.username);
        return mockAuthData;
      }, "authenticate"),
      // Add mock for authorize if needed for local testing flow
      authorize: /* @__PURE__ */ __name(async () => {
        console.log("Mock Authorize called");
        return { code: "mock_code" };
      }, "authorize")
    });
  }
}, "initiateDiscordSDK");
const authorizeDiscordUser = /* @__PURE__ */ __name(async () => {
  if (!isEmbedded) {
    console.log("Running locally, attempting mock authentication...");
    try {
      await discordSdk.commands.authenticate({});
      return true;
    } catch (error) {
      console.error("Mock authentication failed:", error);
      return false;
    }
  }
  let step = "authorize";
  try {
    console.log("Requesting Discord authorization...");
    const { code } = await discordSdk.commands.authorize({
      client_id: clientId,
      response_type: "code",
      state: "",
      prompt: "none",
      // Ensure necessary scopes are requested
      scope: [
        "identify",
        "guilds"
        /* add other scopes if needed */
      ]
    });
    console.log("Authorization code received:", code);
    step = "fetchToken";
    console.log("Fetching access token from /.proxy/api/token...");
    const response = await fetch("/.proxy/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        code
      })
    });
    console.log("Token fetch response received. Status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Token fetch failed:", response.status, response.statusText, errorText);
      throw new Error(`Token fetch failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const { access_token } = await response.json();
    console.log("Access token received successfully.");
    step = "discordAuthenticate";
    console.log("Authenticating with Discord SDK...");
    auth = await discordSdk.commands.authenticate({
      access_token
    });
    if (!(auth == null ? void 0 : auth.user)) {
      console.error("Discord SDK Authentication failed: No user data received.", auth);
      throw new Error("Discord SDK Authentication failed to return user data.");
    }
    console.log("Discord SDK Authentication successful:", auth.user.username);
    step = "connectColyseus";
    console.log("Connecting to Colyseus...");
    try {
      await connectColyseus(auth.access_token, auth.user.username);
      console.log("Colyseus connection successful.");
    } catch (colyseusError) {
      console.error("Colyseus connection failed:", colyseusError);
      throw colyseusError;
    }
    return true;
  } catch (error) {
    console.error(`Error during step: ${step}`);
    console.error("Discord authorization or Colyseus connection failed:", error);
    if (error instanceof ProgressEvent) {
      console.error("Network error (ProgressEvent) occurred, likely during fetch.");
    } else if (error.message && error.message.includes("Token fetch failed")) {
      console.error("Error specifically during token fetch step.");
    } else if (step === "connectColyseus") {
      console.error("Error specifically during Colyseus connection step.");
    }
    auth = null;
    return false;
  }
}, "authorizeDiscordUser");
const getUserName = /* @__PURE__ */ __name(() => {
  if (!auth) {
    if (!isEmbedded && discordSdk instanceof DiscordSDKMock) {
      const mockUserId2 = getOverrideOrRandomSessionValue("user_id");
      return mockUserId2 || "MockUser";
    }
    return "User";
  }
  return auth.user.username;
}, "getUserName");
function getOverrideOrRandomSessionValue(queryParam) {
  const overrideValue = queryParams.get(queryParam);
  if (overrideValue != null) {
    return overrideValue;
  }
  const currentStoredValue = sessionStorage.getItem(queryParam);
  if (currentStoredValue != null) {
    return currentStoredValue;
  }
  const randomString = Math.random().toString(36).slice(2, 10);
  sessionStorage.setItem(queryParam, randomString);
  return randomString;
}
__name(getOverrideOrRandomSessionValue, "getOverrideOrRandomSessionValue");
const _Boot = class _Boot extends phaserExports.Scene {
  constructor() {
    super("Boot");
  }
  preload() {
    const assetPath = "/assets";
    this.load.setPath(assetPath);
    this.load.image("background", "bg.png");
    this.load.image("fridge_bg", "fridge_bg.png");
  }
  create() {
    this.scene.start("Preloader");
  }
};
__name(_Boot, "Boot");
let Boot = _Boot;
const _Game = class _Game extends phaserExports.Scene {
  constructor() {
    super("Game");
    __publicField(this, "room");
  }
  async create() {
    this.scene.launch("background");
    const grid = this.add.image(this.cameras.main.width * 0.5, this.cameras.main.height * 0.4, "grid");
    grid.setScale(0.6);
    await this.connect();
    this.room.state.draggables.onAdd((draggable, draggableId) => {
      const image = this.add.image(draggable.x, draggable.y, draggableId).setInteractive();
      image.name = draggableId;
      image.setScale(0.8);
      this.input.setDraggable(image);
      image.on("drag", (pointer, dragX, dragY) => {
        if (!this.room) {
          return;
        }
        image.x = Phaser.Math.Clamp(
          dragX,
          image.displayWidth / 2,
          Number(this.game.config.width) - image.displayWidth / 2
        );
        image.y = Phaser.Math.Clamp(
          dragY,
          image.displayHeight / 2,
          Number(this.game.config.height) - image.displayHeight / 2
        );
        this.room.send("move", {
          imageId: draggableId,
          x: image.x,
          y: image.y
        });
      });
    });
    this.add.text(this.cameras.main.width * 0.5, this.cameras.main.height * 0.95, `Connected as: ${getUserName()}`, {
      font: "14px Arial",
      color: "#000000"
    }).setOrigin(0.5);
  }
  async connect() {
    const url = location.host === "localhost:3000" ? `ws://localhost:3001` : `wss://${location.host}/.proxy/api/colyseus`;
    const client = new cjs.Client(`${url}`);
    try {
      this.room = await client.joinOrCreate("some_other_room", {
        // Let's send our client screen dimensions to the server for initial positioning
        screenWidth: this.game.config.width,
        screenHeight: this.game.config.height
      });
      this.room.onMessage("move", (message) => {
      });
      console.log("Successfully connected!");
    } catch (e) {
      console.log(`Could not connect with the server: ${e}`);
    }
  }
};
__name(_Game, "Game");
let Game = _Game;
const _MainMenu = class _MainMenu extends phaserExports.Scene {
  constructor() {
    super("MainMenu");
    __publicField(this, "statusText");
  }
  create() {
    const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, "background");
    let scaleX = this.cameras.main.width / bg.width + 0.2;
    let scaleY = this.cameras.main.height / bg.height + 0.2;
    let scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);
    this.add.text(Number(this.game.config.width) * 0.5, 300, "Legends of the Friend", {
      fontFamily: "Arial Black",
      fontSize: 58,
      // yellow
      color: "#ffff00",
      stroke: "#000000",
      strokeThickness: 8,
      align: "center"
    }).setOrigin(0.5);
    this.add.text(Number(this.game.config.width) * 0.5, 460, "Click to Start", {
      fontFamily: "Arial Black",
      fontSize: 38,
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 8,
      align: "center"
    }).setOrigin(0.5);
    this.statusText = this.add.text(this.cameras.main.centerX, 520, "", {
      fontFamily: "Arial",
      fontSize: 24,
      color: "#ffff00",
      align: "center"
    }).setOrigin(0.5);
    this.input.once("pointerdown", async () => {
      this.statusText.setText("Authorizing with Discord...");
      const authSuccess = await authorizeDiscordUser();
      if (authSuccess) {
        this.statusText.setText("Connecting to server...");
        await new Promise((resolve) => setTimeout(resolve, 1e3));
        if (colyseusRoom) {
          this.statusText.setText("Loading game data...");
          const cardDataLoaded = await loadAllCardData();
          if (cardDataLoaded) {
            this.statusText.setText("Connected! Entering Lobby...");
            this.scene.start("Lobby");
          } else {
            this.statusText.setText("Failed to load game data. Please try again.");
          }
        } else {
          this.statusText.setText("Failed to connect to server. Please try again.");
        }
      } else {
        this.statusText.setText("Discord authorization failed. Please try again.");
      }
    });
  }
};
__name(_MainMenu, "MainMenu");
let MainMenu = _MainMenu;
const _Preloader = class _Preloader extends phaserExports.Scene {
  constructor() {
    super("Preloader");
  }
  init() {
    const bg = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "background"
    );
    let scaleX = this.cameras.main.width / bg.width + 0.2;
    let scaleY = this.cameras.main.height / bg.height + 0.2;
    let scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);
    this.add.rectangle(
      Number(this.game.config.width) * 0.5,
      Number(this.game.config.height) * 0.5,
      468,
      32
    ).setStrokeStyle(1, 16777215);
    const bar = this.add.rectangle(
      Number(this.game.config.width) * 0.5 - 230,
      Number(this.game.config.height) * 0.5,
      4,
      28,
      16777215
    );
    this.load.on("progress", (progress) => {
      bar.width = 4 + 460 * progress;
    });
  }
  preload() {
    const assetPath = "/assets";
    this.load.setPath(assetPath);
    this.load.image("logo", "logo.png");
    this.load.image("cardFullTier1", "CardFullTier1.png");
    this.load.image("cardMinionTier1", "CardMinionTier1.png");
  }
  create() {
    this.scene.start("MainMenu");
  }
};
__name(_Preloader, "Preloader");
let Preloader = _Preloader;
const _Background = class _Background extends phaserExports.Scene {
  constructor() {
    super("background");
  }
  create() {
    this.cameras.main.setBackgroundColor(11393254);
    this.scene.sendToBack();
  }
};
__name(_Background, "Background");
let Background = _Background;
var Phase = /* @__PURE__ */ ((Phase2) => {
  Phase2["Lobby"] = "Lobby";
  Phase2["Shop"] = "Shop";
  Phase2["Preparation"] = "Preparation";
  Phase2["Battle"] = "Battle";
  Phase2["BattleEnd"] = "BattleEnd";
  Phase2["GameOver"] = "GameOver";
  return Phase2;
})(Phase || {});
const _Lobby = class _Lobby extends phaserExports.Scene {
  constructor() {
    super("Lobby");
    __publicField(this, "playerTextObjects", /* @__PURE__ */ new Map());
    __publicField(this, "statusText");
    __publicField(this, "readyButton");
    __publicField(this, "waitingText");
    __publicField(this, "phaseListenerUnsub", null);
    __publicField(this, "playerAddListenerUnsub", null);
    __publicField(this, "playerRemoveListenerUnsub", null);
    __publicField(this, "playerStateListeners", /* @__PURE__ */ new Map());
    __publicField(this, "listenersAttached", false);
  }
  create() {
    this.scene.launch("background");
    this.listenersAttached = false;
    if (!colyseusRoom || !colyseusRoom.sessionId) {
      console.error("Lobby Scene: Not connected to Colyseus room or no session ID!");
      this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        "Error: Not connected to server.\nPlease return to Main Menu.",
        { color: "#ff0000", fontSize: "24px", align: "center", backgroundColor: "#000000" }
      ).setOrigin(0.5);
      this.input.once("pointerdown", () => {
        try {
          colyseusRoom == null ? void 0 : colyseusRoom.leave();
        } catch (e) {
        }
        this.scene.start("MainMenu");
      });
      return;
    }
    this.add.text(this.cameras.main.centerX, 100, "Lobby", {
      fontFamily: "Arial Black",
      fontSize: 64,
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 8,
      align: "center"
    }).setOrigin(0.5);
    this.add.text(this.cameras.main.centerX, 200, "Players in Lobby:", {
      fontFamily: "Arial",
      fontSize: 32,
      color: "#dddddd",
      align: "center"
    }).setOrigin(0.5);
    this.statusText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height - 100,
      // Adjusted Y
      "Connecting to lobby...",
      // Initial text
      {
        fontFamily: "Arial",
        fontSize: 24,
        color: "#ffff00",
        align: "center"
      }
    ).setOrigin(0.5);
    this.readyButton = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height - 150,
      "Ready Up",
      {
        fontFamily: "Arial Black",
        fontSize: 40,
        color: "#888888",
        // Start disabled
        backgroundColor: "#333333",
        padding: { x: 20, y: 10 },
        stroke: "#000000",
        strokeThickness: 6,
        align: "center"
      }
    ).setOrigin(0.5).setVisible(false).disableInteractive();
    this.waitingText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height - 110,
      // Below ready button
      "",
      { fontFamily: "Arial", fontSize: 18, color: "#ffff00", align: "center" }
    ).setOrigin(0.5).setVisible(false);
    this.readyButton.on("pointerdown", () => {
      var _a3;
      if (colyseusRoom && ((_a3 = this.readyButton.input) == null ? void 0 : _a3.enabled)) {
        console.log("Lobby: Sending playerReady message.");
        colyseusRoom.send("playerReady");
      }
    });
    this.readyButton.on("pointerover", () => {
      var _a3;
      if ((_a3 = this.readyButton.input) == null ? void 0 : _a3.enabled) this.readyButton.setColor("#55ff55");
    });
    this.readyButton.on("pointerout", () => {
      var _a3;
      if ((_a3 = this.readyButton.input) == null ? void 0 : _a3.enabled) this.readyButton.setColor("#00ff00");
      else this.readyButton.setColor("#888888");
    });
    this.setupColyseusListeners();
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }
  attachMainListenersAndUI() {
    if (this.listenersAttached) {
      console.log("Lobby: Main listeners and UI setup already performed, skipping.");
      return;
    }
    if (!this.scene.isActive()) {
      console.warn("Lobby: attachMainListenersAndUI called but scene is not active. Aborting.");
      return;
    }
    if (!colyseusRoom || !colyseusRoom.state) {
      console.warn("Lobby: attachMainListenersAndUI called but Colyseus room or state is not ready. Aborting.");
      return;
    }
    console.log("Lobby: Attaching main Colyseus listeners and performing initial UI update.");
    this.attachMainListeners();
    this.updateLobbyUI();
    this.listenersAttached = true;
  }
  setupColyseusListeners() {
    if (!colyseusRoom) {
      console.error("Lobby: setupColyseusListeners called but colyseusRoom is null.");
      return;
    }
    console.log("Lobby: Setting up Colyseus general listeners.");
    if (colyseusRoom.state && !this.listenersAttached) {
      console.log("Lobby: State already available on setup. Scheduling attachMainListenersAndUI.");
      this.time.delayedCall(1, this.attachMainListenersAndUI, [], this);
    }
    colyseusRoom.onStateChange.once((state) => {
      console.log("Lobby: Initial state received via onStateChange.once.");
      if (!this.scene.isActive()) {
        console.log("Lobby: Scene became inactive before onStateChange.once processing could complete.");
        return;
      }
      this.attachMainListenersAndUI();
    });
  }
  attachMainListeners() {
    if (!colyseusRoom || !colyseusRoom.state) {
      console.error("Lobby: attachMainListeners - colyseusRoom or state is null.");
      return;
    }
    const $ = cjs.getStateCallbacks(colyseusRoom);
    if (this.phaseListenerUnsub) this.phaseListenerUnsub();
    this.phaseListenerUnsub = $(colyseusRoom.state).listen("currentPhase", (currentPhase, previousPhase) => {
      if (!this.scene.isActive()) return;
      console.log(`Lobby: Phase changed from ${previousPhase} to: ${currentPhase}`);
      if (currentPhase === Phase.Shop) {
        this.statusText.setText("Starting Game!");
        this.time.delayedCall(500, () => {
          if (this.scene.isActive()) {
            this.scene.stop();
            this.scene.start("Shop");
          }
        });
      } else if (currentPhase === Phase.Lobby) {
        this.updateLobbyUI();
      } else if (currentPhase === Phase.GameOver) {
        this.statusText.setText("Game Over. Returning to Main Menu.");
        this.time.delayedCall(1500, () => {
          if (this.scene.isActive()) {
            try {
              colyseusRoom == null ? void 0 : colyseusRoom.leave();
            } catch (e) {
            }
            this.scene.stop();
            this.scene.start("MainMenu");
          }
        });
      }
    });
    if (this.playerAddListenerUnsub) this.playerAddListenerUnsub();
    this.playerAddListenerUnsub = $(colyseusRoom.state.players).onAdd((player, sessionId) => {
      if (!this.scene.isActive()) return;
      console.log(`Lobby: Player joined: ${player.username} (${sessionId})`);
      this.addPlayerStateListener(player, sessionId);
      this.updateLobbyUI();
    });
    if (this.playerRemoveListenerUnsub) this.playerRemoveListenerUnsub();
    this.playerRemoveListenerUnsub = $(colyseusRoom.state.players).onRemove((player, sessionId) => {
      if (!this.scene.isActive()) return;
      console.log(`Lobby: Player left: ${player.username} (${sessionId})`);
      this.removePlayerStateListener(sessionId);
      this.updateLobbyUI();
    });
    colyseusRoom.state.players.forEach((player, sessionId) => {
      this.addPlayerStateListener(player, sessionId);
    });
  }
  addPlayerStateListener(player, sessionId) {
    var _a3;
    if (!colyseusRoom) return;
    const $ = cjs.getStateCallbacks(colyseusRoom);
    (_a3 = this.playerStateListeners.get(sessionId)) == null ? void 0 : _a3();
    console.log(`Lobby: Adding 'isReady' listener for player ${sessionId}`);
    const unsub = $(player).listen("isReady", (currentValue, previousValue) => {
      console.log(`Lobby: isReady changed for player ${sessionId}: ${previousValue} -> ${currentValue}`);
      if (this.scene.isActive()) this.updateLobbyUI();
    });
    this.playerStateListeners.set(sessionId, unsub);
  }
  removePlayerStateListener(sessionId) {
    const unsub = this.playerStateListeners.get(sessionId);
    if (unsub) {
      console.log(`Lobby: Removing 'isReady' listener for player ${sessionId}`);
      unsub();
      this.playerStateListeners.delete(sessionId);
    }
  }
  updateLobbyUI() {
    if (!this.scene.isActive()) {
      console.warn("Lobby: updateLobbyUI called but scene is NOT ACTIVE. Aborting UI update.");
      return;
    }
    if (!colyseusRoom) {
      console.warn("Lobby: updateLobbyUI called but colyseusRoom is NULL. Aborting UI update.");
      if (this.statusText && this.statusText.active) {
        this.statusText.setText("Error: Connection lost.");
      }
      return;
    }
    if (!colyseusRoom.state) {
      console.warn("Lobby: updateLobbyUI called but colyseusRoom.state is NULL. Aborting UI update.");
      if (this.statusText && this.statusText.active) {
        this.statusText.setText("Error: Game state unavailable.");
      }
      return;
    }
    if (globalCardDataCache.size === 0) {
      console.log("Lobby: Card data not loaded yet. Loading...");
      loadAllCardData().then((success) => {
        if (success) {
          console.log("Lobby: Card data loaded successfully");
        } else {
          console.warn("Lobby: Failed to load card data");
        }
      });
    }
    const players = colyseusRoom.state.players;
    const mySessionId = colyseusRoom.sessionId;
    const playerCount = players.size;
    const startY = 250;
    const spacingY = 40;
    this.playerTextObjects.forEach((textObj) => textObj.destroy());
    this.playerTextObjects.clear();
    let playerIndex = 0;
    let allPlayersReady = playerCount > 0;
    let localPlayerIsReady = false;
    const localPlayer = players.get(mySessionId);
    if (localPlayer) {
      localPlayerIsReady = localPlayer.isReady;
    }
    players.forEach((player, sessionId) => {
      const isMe = sessionId === mySessionId;
      const readyMarker = player.isReady ? " [Ready]" : " [Not Ready]";
      const displayName = `${player.username || "Joining..."}${isMe ? " (You)" : ""}${readyMarker}`;
      const playerText = this.add.text(
        this.cameras.main.centerX,
        startY + playerIndex * spacingY,
        displayName,
        { fontFamily: "Arial", fontSize: 24, color: player.isReady ? "#00ff00" : "#ffffff", align: "center" }
      ).setOrigin(0.5);
      this.playerTextObjects.set(sessionId, playerText);
      playerIndex++;
      if (!player.isReady) {
        allPlayersReady = false;
      }
    });
    if (playerCount < 2) {
      this.statusText.setText("Waiting for opponent...");
      this.readyButton.setVisible(false).disableInteractive();
      this.waitingText.setVisible(false);
    } else {
      this.readyButton.setVisible(true);
      if (localPlayerIsReady) {
        this.statusText.setText("Waiting for opponent to ready up...");
        this.readyButton.setText("Waiting...").setColor("#888888").disableInteractive();
        this.waitingText.setText(allPlayersReady ? "Starting game..." : "Waiting for opponent...").setVisible(true);
      } else {
        this.statusText.setText("Lobby full. Ready up!");
        this.readyButton.setText("Ready Up").setColor("#00ff00").setInteractive({ useHandCursor: true });
        this.waitingText.setVisible(false);
      }
      if (allPlayersReady) {
        this.statusText.setText("Starting game...");
        this.readyButton.setVisible(false);
        this.waitingText.setVisible(false);
      }
    }
  }
  shutdown() {
    var _a3, _b2, _c2, _d2, _e2, _f2, _g2, _h, _i;
    console.log("Lobby scene shutting down.");
    this.listenersAttached = false;
    (_a3 = this.phaseListenerUnsub) == null ? void 0 : _a3.call(this);
    (_b2 = this.playerAddListenerUnsub) == null ? void 0 : _b2.call(this);
    (_c2 = this.playerRemoveListenerUnsub) == null ? void 0 : _c2.call(this);
    this.playerStateListeners.forEach((unsub) => unsub());
    this.playerStateListeners.clear();
    this.phaseListenerUnsub = null;
    this.playerAddListenerUnsub = null;
    this.playerRemoveListenerUnsub = null;
    this.playerTextObjects.forEach((textObj) => textObj.destroy());
    this.playerTextObjects.clear();
    (_d2 = this.statusText) == null ? void 0 : _d2.destroy();
    (_e2 = this.readyButton) == null ? void 0 : _e2.destroy();
    (_f2 = this.waitingText) == null ? void 0 : _f2.destroy();
    (_g2 = this.readyButton) == null ? void 0 : _g2.off("pointerdown");
    (_h = this.readyButton) == null ? void 0 : _h.off("pointerover");
    (_i = this.readyButton) == null ? void 0 : _i.off("pointerout");
    this.events.off(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }
};
__name(_Lobby, "Lobby");
let Lobby = _Lobby;
const CARD_WIDTH = 120;
const CARD_HEIGHT = 168;
const _Shop = class _Shop extends phaserExports.Scene {
  constructor() {
    super("Shop");
    __publicField(this, "continueButton");
    __publicField(this, "shopCardObjects", []);
    __publicField(this, "waitingText");
    __publicField(this, "refreshButton");
    __publicField(this, "cardDataCache", /* @__PURE__ */ new Map());
    // Add card data cache
    // For shop offers UI
    __publicField(this, "shopOffersContainer");
    __publicField(this, "shopOffersBackground");
    __publicField(this, "toggleShopButton");
    __publicField(this, "shopOffersVisible", true);
    __publicField(this, "phaseListenerUnsub", null);
    __publicField(this, "playerStateListenersUnsub", /* @__PURE__ */ new Map());
    __publicField(this, "shopOfferListenersUnsub", []);
    __publicField(this, "listeners", []);
  }
  create() {
    var _a3;
    this.scene.launch("background");
    if (!((_a3 = this.scene.get("BoardView")) == null ? void 0 : _a3.scene.isActive())) {
      this.scene.launch("BoardView");
    }
    this.scene.bringToTop();
    if (!colyseusRoom || !colyseusRoom.state || !colyseusRoom.sessionId) {
      console.error("Shop Scene: Colyseus room not available!");
      this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        "Error: Connection lost.\nPlease return to Main Menu.",
        {
          fontFamily: "Arial",
          fontSize: "24px",
          color: "#ff0000",
          align: "center"
        }
      ).setOrigin(0.5);
      this.input.once("pointerdown", () => {
        try {
          colyseusRoom == null ? void 0 : colyseusRoom.leave(true);
        } catch (e) {
        }
        this.scene.start("MainMenu");
      });
      return;
    }
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;
    this.createShopCardsDisplay(centerX, centerY, gameWidth);
    this.setupDragAndDrop();
    this.requestMissingCardData();
    const myPlayerState = colyseusRoom.state.players.get(colyseusRoom.sessionId);
    const refreshCost = (myPlayerState == null ? void 0 : myPlayerState.shopRefreshCost) || 2;
    this.refreshButton = this.add.text(gameWidth - 150, 180, `Refresh: ${refreshCost} 🍺`, {
      fontFamily: "Arial",
      fontSize: 18,
      color: "#FFFFFF",
      backgroundColor: "#4444AA",
      padding: { x: 10, y: 5 }
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
    this.refreshButton.on("pointerdown", () => {
      const myPlayerState2 = colyseusRoom == null ? void 0 : colyseusRoom.state.players.get(colyseusRoom.sessionId);
      if (colyseusRoom && myPlayerState2 && myPlayerState2.brews >= myPlayerState2.shopRefreshCost) {
        colyseusRoom.send("refreshShop");
      }
    });
    this.refreshButton.on("pointerover", () => {
      var _a4;
      if ((_a4 = this.refreshButton.input) == null ? void 0 : _a4.enabled) {
        this.refreshButton.setBackgroundColor("#6666CC");
      }
    });
    this.refreshButton.on("pointerout", () => {
      var _a4;
      if ((_a4 = this.refreshButton.input) == null ? void 0 : _a4.enabled) {
        this.refreshButton.setBackgroundColor("#4444AA");
      }
    });
    this.updateRefreshButtonState();
    this.continueButton = this.add.text(centerX, gameHeight - 50, "Continue", {
      fontFamily: "Arial Black",
      fontSize: 40,
      color: "#00ff00",
      stroke: "#000000",
      strokeThickness: 6,
      align: "center"
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.continueButton.on("pointerdown", () => {
      const myPlayerState2 = colyseusRoom == null ? void 0 : colyseusRoom.state.players.get(
        colyseusRoom.sessionId
      );
      if (colyseusRoom && myPlayerState2 && !myPlayerState2.isReady && colyseusRoom.state.currentPhase === Phase.Shop) {
        colyseusRoom.send("playerReady");
      }
    });
    this.continueButton.on("pointerover", () => {
      var _a4;
      if ((_a4 = this.continueButton.input) == null ? void 0 : _a4.enabled)
        this.continueButton.setColor("#55ff55");
    });
    this.continueButton.on("pointerout", () => {
      var _a4;
      if ((_a4 = this.continueButton.input) == null ? void 0 : _a4.enabled)
        this.continueButton.setColor("#00ff00");
      else this.continueButton.setColor("#888888");
    });
    this.waitingText = this.add.text(centerX, gameHeight - 20, "", {
      fontFamily: "Arial",
      fontSize: 18,
      color: "#ffff00",
      align: "center"
    }).setOrigin(0.5).setVisible(false);
    this.setupColyseusListeners();
    this.updateWaitingStatus();
    this.time.delayedCall(
      50,
      () => this.createShopCardsDisplay(centerX, centerY, gameWidth)
    );
    this.toggleShopButton = this.add.text(
      gameWidth - 100,
      // Position top-right or similar
      centerY - 250,
      // Adjust Y to be above shop offers
      "Toggle Shop",
      {
        fontFamily: "Arial",
        fontSize: 16,
        color: "#FFFFFF",
        backgroundColor: "#555555",
        padding: { x: 5, y: 5 }
      }
    ).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
    this.toggleShopButton.on("pointerdown", () => {
      this.shopOffersVisible = !this.shopOffersVisible;
      this.shopOffersContainer.setVisible(this.shopOffersVisible);
      this.toggleShopButton.setText(
        this.shopOffersVisible ? "Hide Shop" : "Show Shop"
      );
    });
    this.toggleShopButton.setText(
      this.shopOffersVisible ? "Hide Shop" : "Show Shop"
    );
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }
  createShopCardsDisplay(centerX, centerY, gameWidth) {
    var _a3;
    (_a3 = this.shopOffersContainer) == null ? void 0 : _a3.destroy();
    this.shopOffersContainer = this.add.container(0, 0);
    this.shopOffersContainer.setVisible(this.shopOffersVisible);
    this.shopCardObjects.forEach((obj) => obj.destroy());
    this.shopCardObjects = [];
    const myPlayerState = colyseusRoom == null ? void 0 : colyseusRoom.state.players.get(
      colyseusRoom.sessionId
    );
    const shopOfferIds = myPlayerState == null ? void 0 : myPlayerState.shopOfferIds;
    if (!shopOfferIds || shopOfferIds.length === 0) {
      console.log("Shop: No shop offers from server.");
      if (this.shopOffersBackground && this.shopOffersBackground.active)
        this.shopOffersBackground.setVisible(false);
      return;
    }
    const shopCardSpacing = 20;
    const numOffers = shopOfferIds.length > 0 ? shopOfferIds.length : 4;
    const shopY = centerY;
    const totalShopWidth = numOffers * CARD_WIDTH + (numOffers - 1) * shopCardSpacing;
    const startShopX = centerX - totalShopWidth / 2 + CARD_WIDTH / 2;
    const bgWidth = totalShopWidth + shopCardSpacing * 2;
    const bgHeight = CARD_HEIGHT + shopCardSpacing * 2;
    if (this.shopOffersBackground && this.shopOffersBackground.active) {
      this.shopOffersBackground.destroy();
    }
    this.shopOffersBackground = this.add.rectangle(
      centerX,
      shopY,
      bgWidth,
      bgHeight,
      51,
      0.6
    );
    this.shopOffersContainer.add(this.shopOffersBackground);
    shopOfferIds.forEach((cardId, index) => {
      const cardData = this.getCardDataFromServer(cardId);
      if (!cardData) {
        console.warn(`Shop: Card data not found for ID: ${cardId}`);
        return;
      }
      const cardX = startShopX + index * (CARD_WIDTH + shopCardSpacing);
      const cardContainer = this.add.container(cardX, shopY);
      const cardImage = this.add.image(0, 0, "cardFullTier1").setOrigin(0.5).setDisplaySize(CARD_WIDTH, CARD_HEIGHT);
      cardContainer.add(cardImage);
      const nameText = this.add.text(0, -20, cardData.name, {
        fontFamily: "Arial",
        fontSize: 16,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
        align: "center",
        wordWrap: { width: CARD_WIDTH - 20 }
      }).setOrigin(0.5, 0.5);
      cardContainer.add(nameText);
      const attackText = this.add.text(-120 / 2 + 32, CARD_HEIGHT * 0.03, `${cardData.attack}`, {
        fontFamily: "Arial",
        fontSize: 16,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3
      }).setOrigin(0, 0.5);
      cardContainer.add(attackText);
      const healthText = this.add.text(CARD_WIDTH / 2 - 18, 6, `${cardData.health}/${cardData.health}`, {
        fontFamily: "Arial",
        fontSize: 16,
        color: "#00ff00",
        stroke: "#000000",
        strokeThickness: 3
      }).setOrigin(1, 0.5);
      cardContainer.add(healthText);
      const speedText = this.add.text(0, CARD_HEIGHT / 2 - 50, `${cardData.speed}`, {
        fontFamily: "Arial",
        fontSize: 16,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3
      }).setOrigin(0.5, 1);
      cardContainer.add(speedText);
      const costText = this.add.text(
        CARD_WIDTH / 2 - 8,
        -168 / 2 + 8,
        `${cardData.brewCost}B`,
        {
          fontFamily: "Arial",
          fontSize: 14,
          color: "#ffff00",
          stroke: "#000000",
          strokeThickness: 3,
          align: "right"
        }
      ).setOrigin(1, 0);
      cardContainer.add(costText);
      cardContainer.setSize(CARD_WIDTH, CARD_HEIGHT);
      cardContainer.setSize(CARD_WIDTH, CARD_HEIGHT);
      cardContainer.setInteractive({ useHandCursor: true });
      cardContainer.setData("cardId", cardData.id);
      cardContainer.setData("cardData", cardData);
      this.input.setDraggable(cardContainer);
      cardContainer.off("pointerdown").on("pointerdown", (pointer) => {
        var _a4;
        if (!((_a4 = cardContainer.input) == null ? void 0 : _a4.enabled)) return;
        cardContainer.setData("isBeingDragged", false);
      });
      cardContainer.off("pointerup").on("pointerup", (pointer) => {
        var _a4;
        if (!((_a4 = cardContainer.input) == null ? void 0 : _a4.enabled)) return;
        if (!colyseusRoom || !colyseusRoom.sessionId) return;
        if (cardContainer.getData("isBeingDragged") === true) {
          cardContainer.setData("isBeingDragged", false);
          return;
        }
        const myPlayerState2 = colyseusRoom.state.players.get(colyseusRoom.sessionId);
        if (!myPlayerState2) return;
        let firstEmptyHandSlot = -1;
        for (let i = 0; i < 5; i++) {
          if (!myPlayerState2.hand.has(String(i))) {
            firstEmptyHandSlot = i;
            break;
          }
        }
        if (firstEmptyHandSlot !== -1) {
          const cardId2 = cardContainer.getData("cardId");
          const currentCardData = cardContainer.getData("cardData");
          if (cardId2 && currentCardData && myPlayerState2.brews >= currentCardData.brewCost) {
            console.log(`Shop: Click-to-buy card ${cardId2} (Cost: ${currentCardData.brewCost}) into hand slot ${firstEmptyHandSlot}. Brews: ${myPlayerState2.brews}`);
            colyseusRoom.send("buyCard", {
              cardId: cardId2,
              handSlotIndex: firstEmptyHandSlot
            });
          } else {
            if (currentCardData && myPlayerState2.brews < currentCardData.brewCost) {
              console.log(`Shop: Not enough brews (${myPlayerState2.brews}) to click-buy card ${cardId2} (Cost: ${currentCardData.brewCost}).`);
            } else {
              console.log(`Shop: Click-to-buy failed for card ${cardId2}. CardData: ${!!currentCardData}`);
            }
          }
        } else {
          console.log("Shop: Hand is full, cannot click-buy.");
        }
      });
      this.shopCardObjects.push(cardContainer);
      this.shopOffersContainer.add(cardContainer);
    });
  }
  requestMissingCardData() {
    if (!colyseusRoom || !colyseusRoom.state || !colyseusRoom.sessionId) return;
    const myPlayerState = colyseusRoom.state.players.get(colyseusRoom.sessionId);
    if (!myPlayerState) return;
    const shopOfferIds = myPlayerState.shopOfferIds;
    if (shopOfferIds && shopOfferIds.length > 0) {
      const missingIds = [];
      shopOfferIds.forEach((id) => {
        if (!globalCardDataCache.has(id)) {
          missingIds.push(id);
        }
      });
      if (missingIds.length > 0) {
        console.log("Requesting missing cards from server:", missingIds);
        colyseusRoom.send("getCardsByIds", { cardIds: missingIds });
      }
    }
  }
  getCardDataFromServer(cardId) {
    if (globalCardDataCache.has(cardId)) {
      return globalCardDataCache.get(cardId);
    }
    if (!colyseusRoom || !colyseusRoom.state) return void 0;
    let cardData = void 0;
    colyseusRoom.state.players.forEach((player) => {
      player.hand.forEach((card) => {
        if (card.cardId === cardId) {
          cardData = {
            id: card.cardId,
            name: card.name,
            attack: card.attack,
            speed: card.speed,
            health: card.health,
            brewCost: card.brewCost,
            description: card.description,
            isLegend: card.isLegend
          };
        }
      });
      player.battlefield.forEach((card) => {
        if (card.cardId === cardId) {
          cardData = {
            id: card.cardId,
            name: card.name,
            attack: card.attack,
            speed: card.speed,
            health: card.health,
            brewCost: card.brewCost,
            description: card.description,
            isLegend: card.isLegend
          };
        }
      });
    });
    if (!cardData) {
      cardData = {
        id: cardId,
        name: `Card ${cardId.split("_").pop()}`,
        attack: 1,
        speed: 1,
        health: 1,
        brewCost: 1,
        description: "Loading card details...",
        isLegend: false
      };
      console.warn(`Shop: Card data not found for ID: ${cardId} in global cache or state`);
    }
    return cardData;
  }
  setupDragAndDrop() {
    this.input.off("dragstart");
    this.input.off("drag");
    this.input.off("dragend");
    this.input.off("pointerdown");
    this.input.off("pointerup");
    this.shopCardObjects.forEach((cardContainer) => {
      cardContainer.off("pointerdown");
      cardContainer.off("pointerup");
    });
    this.input.on(
      "dragstart",
      (pointer, gameObject) => {
        var _a3;
        if (!(gameObject instanceof Phaser.GameObjects.Container) || !this.shopCardObjects.includes(gameObject))
          return;
        if (!((_a3 = gameObject.input) == null ? void 0 : _a3.enabled)) return;
        this.children.bringToTop(gameObject);
        gameObject.setAlpha(0.7);
        gameObject.setData("startX", gameObject.x);
        gameObject.setData("startY", gameObject.y);
        gameObject.setData("isBeingDragged", true);
      }
    );
    this.input.on(
      "drag",
      (pointer, gameObject, dragX, dragY) => {
        var _a3;
        if (!(gameObject instanceof Phaser.GameObjects.Container) || !this.shopCardObjects.includes(gameObject))
          return;
        if (!((_a3 = gameObject.input) == null ? void 0 : _a3.enabled)) return;
        if (gameObject.getData("isBeingDragged") === true) {
          gameObject.x = dragX;
          gameObject.y = dragY;
        }
      }
    );
    this.input.on(
      "dragend",
      (pointer, gameObject) => {
        if (!colyseusRoom || !(gameObject instanceof Phaser.GameObjects.Container) || !this.shopCardObjects.includes(gameObject)) {
          if (gameObject instanceof Phaser.GameObjects.Container) {
            gameObject.setData("isBeingDragged", false);
          }
          return;
        }
        gameObject.setAlpha(1);
        let buyAttempted = false;
        if (gameObject.getData("isBeingDragged") === true) {
          const droppedX = gameObject.x;
          const droppedY = gameObject.y;
          const boardViewScene = this.scene.get(
            "BoardView"
          );
          for (let i = 0; i < 5; i++) {
            const slotPos = boardViewScene == null ? void 0 : boardViewScene.getSlotPixelPosition(true, "hand", i);
            if (slotPos) {
              const handSlotDropZone = new Phaser.Geom.Rectangle(
                slotPos.x - 50,
                slotPos.y - 70,
                100,
                140
              );
              if (Phaser.Geom.Rectangle.Contains(
                handSlotDropZone,
                droppedX,
                droppedY
              )) {
                const myPlayerState = colyseusRoom.state.players.get(
                  colyseusRoom.sessionId
                );
                if (myPlayerState && !myPlayerState.hand.has(String(i))) {
                  const cardId = gameObject.getData("cardId");
                  const cardData = gameObject.getData("cardData");
                  if (cardId && cardData && myPlayerState.brews >= cardData.brewCost) {
                    colyseusRoom.send("buyCard", {
                      cardId,
                      handSlotIndex: i
                    });
                    buyAttempted = true;
                  } else {
                    console.log("Shop: Drag-to-buy failed (not enough brews or card data missing).");
                  }
                }
                break;
              }
            }
          }
          if (!buyAttempted) {
            if (gameObject.active) {
              gameObject.x = gameObject.getData("startX");
              gameObject.y = gameObject.getData("startY");
            }
          }
        }
        gameObject.setData("isBeingDragged", false);
      }
    );
  }
  updateRefreshButtonState() {
    if (!colyseusRoom || !this.refreshButton || !this.refreshButton.active) return;
    const myPlayerState = colyseusRoom.state.players.get(colyseusRoom.sessionId);
    if (!myPlayerState) return;
    this.refreshButton.setText(`Refresh: ${myPlayerState.shopRefreshCost} 🍺`);
    const canRefresh = myPlayerState.brews >= myPlayerState.shopRefreshCost && colyseusRoom.state.currentPhase === Phase.Shop;
    if (canRefresh) {
      this.refreshButton.setColor("#FFFFFF");
      this.refreshButton.setBackgroundColor("#4444AA");
      this.refreshButton.setInteractive({ useHandCursor: true });
    } else {
      this.refreshButton.setColor("#AAAAAA");
      this.refreshButton.setBackgroundColor("#555555");
      this.refreshButton.disableInteractive();
    }
  }
  setupColyseusListeners() {
    if (!colyseusRoom || !colyseusRoom.sessionId) return;
    const $ = cjs.getStateCallbacks(colyseusRoom);
    const myPlayerId = colyseusRoom.sessionId;
    this.phaseListenerUnsub = $(colyseusRoom.state).listen(
      "currentPhase",
      (currentPhase) => {
        if (!this.scene.isActive()) return;
        if (currentPhase === Phase.Preparation) {
          if (this.scene.isActive()) {
            this.scene.stop();
            this.scene.start("Preparation");
          }
        } else if (currentPhase !== Phase.Shop) {
          if (this.scene.isActive()) {
            this.scene.stop();
            this.scene.start("Lobby");
          }
        }
        this.updateWaitingStatus();
      }
    );
    colyseusRoom.state.players.forEach((player, sessionId) => {
      const unsub = $(player).listen("isReady", () => {
        if (this.scene.isActive()) this.updateWaitingStatus();
      });
      this.playerStateListenersUnsub.set(sessionId, unsub);
    });
    this.listeners.push(
      $(colyseusRoom.state.players).onAdd((player, sessionId) => {
        var _a3;
        if (this.playerStateListenersUnsub.has(sessionId)) {
          (_a3 = this.playerStateListenersUnsub.get(sessionId)) == null ? void 0 : _a3();
        }
        const unsub = $(player).listen("isReady", () => {
          if (this.scene.isActive()) this.updateWaitingStatus();
        });
        this.playerStateListenersUnsub.set(sessionId, unsub);
        if (this.scene.isActive()) this.updateWaitingStatus();
      })
    );
    this.listeners.push(
      $(colyseusRoom.state.players).onRemove((player, sessionId) => {
        var _a3;
        (_a3 = this.playerStateListenersUnsub.get(sessionId)) == null ? void 0 : _a3();
        this.playerStateListenersUnsub.delete(sessionId);
        if (this.scene.isActive()) this.updateWaitingStatus();
      })
    );
    this.listeners.push(
      colyseusRoom.onMessage("cardsByIds", (data) => {
        if (this.scene.isActive()) {
          Object.entries(data).forEach(([cardId, cardData]) => {
            globalCardDataCache.set(cardId, cardData);
          });
          const centerX = this.cameras.main.centerX;
          const centerY = this.cameras.main.centerY;
          const gameWidth = this.cameras.main.width;
          this.createShopCardsDisplay(centerX, centerY, gameWidth);
        }
      })
    );
    const myPlayerState = colyseusRoom.state.players.get(myPlayerId);
    if (myPlayerState) {
      const onShopOffersChanged = /* @__PURE__ */ __name(() => {
        if (!this.scene.isActive()) return;
        this.requestMissingCardData();
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        const gameWidth = this.cameras.main.width;
        this.createShopCardsDisplay(centerX, centerY, gameWidth);
      }, "onShopOffersChanged");
      this.shopOfferListenersUnsub.push(
        $(myPlayerState.shopOfferIds).onAdd(onShopOffersChanged)
      );
      this.shopOfferListenersUnsub.push(
        $(myPlayerState.shopOfferIds).onRemove(onShopOffersChanged)
      );
      onShopOffersChanged();
      this.listeners.push(
        $(myPlayerState).listen("brews", () => {
          if (this.scene.isActive()) this.updateRefreshButtonState();
        })
      );
      this.listeners.push(
        $(myPlayerState).listen("shopRefreshCost", () => {
          if (this.scene.isActive()) this.updateRefreshButtonState();
        })
      );
    }
  }
  cleanupListeners() {
    var _a3, _b2, _c2, _d2;
    console.log("Shop Scene: Cleaning up listeners.");
    (_a3 = this.phaseListenerUnsub) == null ? void 0 : _a3.call(this);
    this.phaseListenerUnsub = null;
    this.playerStateListenersUnsub.forEach((unsub) => unsub());
    this.playerStateListenersUnsub.clear();
    this.shopOfferListenersUnsub.forEach((unsub) => unsub());
    this.shopOfferListenersUnsub = [];
    this.listeners.forEach((unsub) => unsub());
    this.listeners = [];
    this.input.off("dragstart");
    this.input.off("drag");
    this.input.off("dragend");
    (_b2 = this.continueButton) == null ? void 0 : _b2.off("pointerdown");
    (_c2 = this.continueButton) == null ? void 0 : _c2.off("pointerover");
    (_d2 = this.continueButton) == null ? void 0 : _d2.off("pointerout");
  }
  updateWaitingStatus() {
    if (!colyseusRoom || !colyseusRoom.sessionId || !this.continueButton || !this.waitingText || !this.scene.isActive())
      return;
    const myPlayerState = colyseusRoom.state.players.get(
      colyseusRoom.sessionId
    );
    if (!myPlayerState) return;
    let allPlayersReady = true;
    colyseusRoom.state.players.forEach((player) => {
      if (!player.isReady) allPlayersReady = false;
    });
    const amReady = myPlayerState.isReady;
    const isShopPhase = colyseusRoom.state.currentPhase === Phase.Shop;
    const canInteract = !amReady && isShopPhase;
    this.continueButton.setInteractive(canInteract);
    this.continueButton.setColor(canInteract ? "#00ff00" : "#888888");
    if (amReady && !allPlayersReady && isShopPhase) {
      this.waitingText.setText("Waiting for other player(s)...").setVisible(true);
      this.continueButton.setText("Waiting...");
    } else if (!isShopPhase) {
      this.waitingText.setText(`Waiting for ${colyseusRoom.state.currentPhase} phase...`).setVisible(true);
      this.continueButton.setText("Continue");
    } else {
      this.waitingText.setVisible(false);
      this.continueButton.setText("Continue");
    }
    this.shopCardObjects.forEach((cardObj) => {
      if (cardObj.input) cardObj.input.enabled = canInteract;
    });
  }
  shutdown() {
    var _a3, _b2, _c2, _d2, _e2, _f2, _g2, _h;
    console.log("Shop scene shutting down.");
    this.cleanupListeners();
    this.shopCardObjects.forEach((obj) => obj.destroy());
    this.shopCardObjects = [];
    (_a3 = this.continueButton) == null ? void 0 : _a3.destroy();
    (_b2 = this.waitingText) == null ? void 0 : _b2.destroy();
    (_c2 = this.refreshButton) == null ? void 0 : _c2.off("pointerdown");
    (_d2 = this.refreshButton) == null ? void 0 : _d2.off("pointerover");
    (_e2 = this.refreshButton) == null ? void 0 : _e2.off("pointerout");
    (_f2 = this.refreshButton) == null ? void 0 : _f2.destroy();
    (_g2 = this.toggleShopButton) == null ? void 0 : _g2.destroy();
    (_h = this.shopOffersContainer) == null ? void 0 : _h.destroy();
    this.events.off(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }
};
__name(_Shop, "Shop");
let Shop = _Shop;
const _Preparation = class _Preparation extends phaserExports.Scene {
  constructor() {
    super("Preparation");
    __publicField(this, "startBattleButton");
    __publicField(this, "waitingText");
    // "Waiting for other player..."
    // Colyseus listeners
    __publicField(this, "playerStateListener", null);
    __publicField(this, "handListener", null);
    __publicField(this, "battlefieldListener", null);
    __publicField(this, "phaseListener", null);
    // Colyseus listeners - Store unsubscribe functions
    __publicField(this, "playerStateListenerUnsub", null);
    __publicField(this, "handAddUnsub", null);
    __publicField(this, "handRemoveUnsub", null);
    __publicField(this, "handChangeUnsub", null);
    // Assuming onChange returns unsub
    __publicField(this, "battlefieldAddUnsub", null);
    __publicField(this, "battlefieldRemoveUnsub", null);
    __publicField(this, "battlefieldChangeUnsub", null);
    // Assuming onChange returns unsub
    __publicField(this, "phaseListenerUnsub", null);
    __publicField(this, "otherPlayerChangeListeners", /* @__PURE__ */ new Map());
    // For other players' onChange
    __publicField(this, "otherPlayerAddUnsub", null);
    __publicField(this, "otherPlayerRemoveUnsub", null);
    // Declare clientSideCardLayout
    __publicField(this, "clientSideCardLayout", /* @__PURE__ */ new Map());
  }
  // Remove init - state comes from Colyseus
  // init(data: { playerBrews?: number, currentDay?: number }) { ... }
  create() {
    var _a3;
    this.scene.launch("background");
    if (!((_a3 = this.scene.get("BoardView")) == null ? void 0 : _a3.scene.isActive())) {
      this.scene.launch("BoardView");
    }
    this.scene.bringToTop();
    if (!colyseusRoom || !colyseusRoom.state || !colyseusRoom.sessionId) {
      console.error("Preparation Scene: Colyseus room not available!");
      this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        "Error: Connection lost.\nPlease return to Main Menu.",
        { color: "#ff0000", fontSize: "24px", align: "center" }
      ).setOrigin(0.5);
      this.input.once("pointerdown", () => this.scene.start("MainMenu"));
      return;
    }
    const centerX = this.cameras.main.centerX;
    this.cameras.main.centerY;
    const gameHeight = this.cameras.main.height;
    this.cameras.main.width;
    const myPlayerStateForLog = colyseusRoom.state.players.get(
      colyseusRoom.sessionId
    );
    if (myPlayerStateForLog) {
      console.log(
        "Preparation Create: Initial myPlayerState.hand contents:",
        JSON.stringify(Object.fromEntries(myPlayerStateForLog.hand.entries()))
      );
    } else {
      console.log("Preparation Create: myPlayerState not found initially.");
    }
    this.add.text(centerX, 80, "Preparation Phase", {
      fontFamily: "Arial Black",
      fontSize: 48,
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 8,
      align: "center"
    }).setOrigin(0.5);
    this.startBattleButton = this.add.text(centerX, gameHeight - 50, "Start Battle", {
      fontFamily: "Arial Black",
      fontSize: 40,
      color: "#888888",
      // Start disabled
      stroke: "#000000",
      strokeThickness: 6,
      align: "center"
    }).setOrigin(0.5);
    this.startBattleButton.setColor("#888888").disableInteractive();
    this.waitingText = this.add.text(centerX, gameHeight - 20, "", {
      fontFamily: "Arial",
      fontSize: 18,
      color: "#ffff00",
      align: "center"
    }).setOrigin(0.5).setVisible(false);
    this.setupColyseusListeners();
    this.updateWaitingStatus();
    this.time.delayedCall(100, this.updateStartButtonState, [], this);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }
  // --- Drag and Drop ---
  // --- Colyseus State Synchronization ---
  setupColyseusListeners() {
    if (!colyseusRoom || !colyseusRoom.sessionId) return;
    const myPlayerId = colyseusRoom.sessionId;
    const $ = cjs.getStateCallbacks(colyseusRoom);
    const player = colyseusRoom.state.players.get(myPlayerId);
    if (player) {
      this.playerStateListenerUnsub = $(player).onChange(() => {
        if (!this.scene.isActive()) return;
        this.updateWaitingStatus();
      });
      this.handAddUnsub = $(player.hand).onAdd((card, key) => {
        console.log(
          `Preparation Scene: player.hand.onAdd triggered for key: ${key}, card: ${card == null ? void 0 : card.name}. Scene active: ${this.scene.isActive()}`
        );
        if (this.scene.isActive()) {
          this.updateStartButtonState();
        }
      });
      this.handRemoveUnsub = $(player.hand).onRemove((card, key) => {
        if (this.scene.isActive()) this.updateStartButtonState();
      });
      this.battlefieldAddUnsub = $(player.battlefield).onAdd((card, key) => {
        if (this.scene.isActive()) this.updateStartButtonState();
      });
      this.battlefieldRemoveUnsub = $(player.battlefield).onRemove(
        (card, key) => {
          if (this.scene.isActive()) this.updateStartButtonState();
        }
      );
    } else {
      console.error("Preparation Scene: My player state not found on init.");
    }
    this.phaseListenerUnsub = $(colyseusRoom.state).listen(
      "currentPhase",
      (currentPhase) => {
        if (!this.scene.isActive()) return;
        console.log(`Preparation Scene: Phase changed to ${currentPhase}`);
        if (currentPhase === Phase.Battle) {
          if (this.scene.isActive()) {
            this.scene.stop();
            this.scene.start("Battle");
          }
        } else if (currentPhase !== Phase.Preparation) {
          console.warn(
            `Preparation Scene: Unexpected phase change to ${currentPhase}. Returning to Lobby.`
          );
          if (this.scene.isActive()) {
            this.scene.stop();
            this.scene.start("Lobby");
          }
        }
        this.updateWaitingStatus();
      }
    );
    this.otherPlayerAddUnsub = $(colyseusRoom.state.players).onAdd(
      (addedPlayer, sessionId) => {
        if (this.scene.isActive()) {
          if (sessionId !== myPlayerId) {
            const unsub = $(addedPlayer).listen("isReady", () => {
              if (this.scene.isActive()) this.updateWaitingStatus();
            });
            this.otherPlayerChangeListeners.set(sessionId, unsub);
          }
          this.updateWaitingStatus();
        }
      }
    );
    this.otherPlayerRemoveUnsub = $(colyseusRoom.state.players).onRemove(
      (removedPlayer, sessionId) => {
        if (this.scene.isActive()) {
          const unsub = this.otherPlayerChangeListeners.get(sessionId);
          unsub == null ? void 0 : unsub();
          this.otherPlayerChangeListeners.delete(sessionId);
          this.updateWaitingStatus();
        }
      }
    );
    colyseusRoom.state.players.forEach((existingPlayer, sessionId) => {
      if (sessionId !== myPlayerId) {
        const unsub = $(existingPlayer).listen("isReady", () => {
          if (this.scene.isActive()) this.updateWaitingStatus();
        });
        this.otherPlayerChangeListeners.set(sessionId, unsub);
      }
    });
  }
  cleanupListeners() {
    var _a3, _b2, _c2, _d2, _e2, _f2, _g2, _h, _i, _j, _k, _l, _m;
    console.log("Preparation Scene: Cleaning up listeners.");
    (_a3 = this.playerStateListenerUnsub) == null ? void 0 : _a3.call(this);
    (_b2 = this.handAddUnsub) == null ? void 0 : _b2.call(this);
    (_c2 = this.handRemoveUnsub) == null ? void 0 : _c2.call(this);
    (_d2 = this.handChangeUnsub) == null ? void 0 : _d2.call(this);
    (_e2 = this.battlefieldAddUnsub) == null ? void 0 : _e2.call(this);
    (_f2 = this.battlefieldRemoveUnsub) == null ? void 0 : _f2.call(this);
    (_g2 = this.battlefieldChangeUnsub) == null ? void 0 : _g2.call(this);
    (_h = this.phaseListenerUnsub) == null ? void 0 : _h.call(this);
    (_i = this.otherPlayerAddUnsub) == null ? void 0 : _i.call(this);
    (_j = this.otherPlayerRemoveUnsub) == null ? void 0 : _j.call(this);
    this.otherPlayerChangeListeners.forEach((unsub) => unsub());
    this.playerStateListenerUnsub = null;
    this.handAddUnsub = null;
    this.handRemoveUnsub = null;
    this.handChangeUnsub = null;
    this.battlefieldAddUnsub = null;
    this.battlefieldRemoveUnsub = null;
    this.battlefieldChangeUnsub = null;
    this.phaseListenerUnsub = null;
    this.otherPlayerAddUnsub = null;
    this.otherPlayerRemoveUnsub = null;
    this.otherPlayerChangeListeners.clear();
    this.input.off("dragstart");
    this.input.off("drag");
    this.input.off("dragend");
    (_k = this.startBattleButton) == null ? void 0 : _k.off("pointerdown");
    (_l = this.startBattleButton) == null ? void 0 : _l.off("pointerover");
    (_m = this.startBattleButton) == null ? void 0 : _m.off("pointerout");
  }
  // --- UI Update Functions ---
  // Initializes clientSideCardLayout based on server state and makes cards draggable
  makeLocalPlayerCardsDraggable() {
    if (!colyseusRoom || !colyseusRoom.sessionId || !this.scene.isActive()) {
      console.warn(
        "Preparation: Cannot make cards draggable, room/session/scene inactive."
      );
      return;
    }
    const myPlayerId = colyseusRoom.sessionId;
    const myPlayerState = colyseusRoom.state.players.get(myPlayerId);
    const boardView = this.scene.get("BoardView");
    if (!myPlayerState || !boardView) {
      console.warn(
        "Preparation: Player state or BoardView not found for making cards draggable."
      );
      return;
    }
    this.clientSideCardLayout.forEach((entry) => {
      if (entry.gameObject && entry.gameObject.input) {
        this.input.disable(entry.gameObject);
      }
    });
    this.clientSideCardLayout.clear();
    const processCards = /* @__PURE__ */ __name((collection, area) => {
      collection.forEach((cardSchema, slotKey) => {
        const cardGO = boardView.getCardGameObjectByInstanceId(
          cardSchema.instanceId
        );
        if (cardGO) {
          cardGO.setInteractive({ useHandCursor: true });
          this.input.setDraggable(cardGO);
          this.clientSideCardLayout.set(cardSchema.instanceId, {
            area,
            slotKey,
            gameObject: cardGO
          });
        } else {
          console.warn(
            `Preparation: Could not find GameObject in BoardView for card instance ${cardSchema.instanceId}`
          );
        }
      });
    }, "processCards");
    processCards(myPlayerState.hand, "hand");
    processCards(myPlayerState.battlefield, "battlefield");
    console.log(
      "Preparation: Made local player cards draggable and initialized clientSideCardLayout.",
      this.clientSideCardLayout
    );
    this.updateStartButtonState();
  }
  updateWaitingStatus() {
    if (!colyseusRoom || !colyseusRoom.sessionId || !this.startBattleButton || !this.waitingText)
      return;
    const myPlayerState = colyseusRoom.state.players.get(
      colyseusRoom.sessionId
    );
    if (!myPlayerState) return;
    let allPlayersReady = true;
    colyseusRoom.state.players.forEach((player) => {
      if (!player.isReady) allPlayersReady = false;
    });
    const amReady = myPlayerState.isReady;
    !amReady && colyseusRoom.state.currentPhase === Phase.Preparation;
    this.updateStartButtonState();
    if (amReady && !allPlayersReady) {
      this.waitingText.setText("Waiting for other player(s)...").setVisible(true);
      this.startBattleButton.setText("Waiting...");
      this.startBattleButton.disableInteractive().setColor("#888888");
    } else {
      this.waitingText.setVisible(false);
      this.startBattleButton.setText("Start Battle");
      this.updateStartButtonState();
    }
  }
  updateStartButtonState() {
    if (!this.startBattleButton || !this.startBattleButton.active) {
      console.warn(
        "updateStartButtonState called but button is null or inactive."
      );
      return;
    }
    let battlefieldCardsCount = 0;
    const boardView = this.scene.get("BoardView");
    if (boardView && boardView.scene.isActive()) {
      const layoutData = boardView.getLocalPlayerLayoutData();
      layoutData.forEach((entry) => {
        if (entry.area === "battlefield") {
          battlefieldCardsCount++;
        }
      });
    }
    const canStart = battlefieldCardsCount > 0;
    const myPlayerState = colyseusRoom == null ? void 0 : colyseusRoom.state.players.get(
      colyseusRoom == null ? void 0 : colyseusRoom.sessionId
    );
    const amReady = (myPlayerState == null ? void 0 : myPlayerState.isReady) ?? false;
    const isPrepPhase = (colyseusRoom == null ? void 0 : colyseusRoom.state.currentPhase) === Phase.Preparation;
    const shouldBeEnabled = canStart && !amReady && isPrepPhase;
    if (shouldBeEnabled) {
      this.startBattleButton.setColor("#00ff00");
      this.startBattleButton.setInteractive({ useHandCursor: true });
      this.startBattleButton.off("pointerdown");
      this.startBattleButton.once("pointerdown", this.confirmPreparation, this);
      this.startBattleButton.on(
        "pointerover",
        () => this.startBattleButton.setColor("#55ff55")
      );
      this.startBattleButton.on(
        "pointerout",
        () => this.startBattleButton.setColor("#00ff00")
      );
    } else {
      if (this.waitingText && !this.waitingText.visible) {
        this.startBattleButton.setColor("#888888");
      }
      this.startBattleButton.disableInteractive();
      this.startBattleButton.off("pointerdown");
      this.startBattleButton.off("pointerover");
      this.startBattleButton.off("pointerout");
    }
  }
  // Called when the "Start Battle" button is clicked
  confirmPreparation() {
    if (!colyseusRoom) return;
    console.log("Confirming preparation layout...");
    const boardView = this.scene.get("BoardView");
    if (!boardView || !boardView.scene.isActive()) {
      console.error("Preparation: BoardView not available to get layout data.");
      return;
    }
    const { handLayout, battlefieldLayout } = boardView.getCardLayouts();
    console.log("Sending preparation layout to server:", {
      handLayout,
      battlefieldLayout
    });
    colyseusRoom.send("setPreparation", {
      handLayout,
      battlefieldLayout
    });
    this.updateWaitingStatus();
  }
  // Override shutdown
  shutdown() {
    var _a3, _b2;
    console.log("Preparation scene shutting down explicitly.");
    this.cleanupListeners();
    (_a3 = this.startBattleButton) == null ? void 0 : _a3.destroy();
    (_b2 = this.waitingText) == null ? void 0 : _b2.destroy();
    this.clientSideCardLayout.clear();
    this.events.off(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }
};
__name(_Preparation, "Preparation");
let Preparation = _Preparation;
const _Battle = class _Battle extends phaserExports.Scene {
  // Store unsubscribe function
  constructor() {
    super("Battle");
    __publicField(this, "handCardDisplayObjects", /* @__PURE__ */ new Map());
    // Display opponent hand? Maybe just placeholders.
    __publicField(this, "battleOver", false);
    __publicField(this, "resultText");
    __publicField(this, "statusText");
    // For "Battle Ended", "Waiting for results..."
    // Colyseus listeners
    __publicField(this, "phaseListenerUnsubscribe", null);
  }
  create() {
    this.scene.launch("background");
    this.battleOver = false;
    if (!colyseusRoom || !colyseusRoom.state || !colyseusRoom.sessionId) {
      console.error("Battle Scene: Colyseus room not available!");
      this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, "Error: Connection lost.\nPlease return to Main Menu.", { color: "#ff0000", fontSize: "24px", align: "center", backgroundColor: "#000000" }).setOrigin(0.5);
      this.input.once("pointerdown", () => {
        try {
          colyseusRoom == null ? void 0 : colyseusRoom.leave();
        } catch (e) {
        }
        this.scene.start("MainMenu");
      });
      return;
    }
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const gameHeight = this.cameras.main.height;
    this.cameras.main.width;
    this.resultText = this.add.text(centerX, centerY, "", {
      fontFamily: "Arial Black",
      fontSize: 64,
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 8,
      align: "center"
    }).setOrigin(0.5).setAlpha(0);
    this.statusText = this.add.text(centerX, gameHeight - 50, "", {
      fontFamily: "Arial",
      fontSize: 24,
      color: "#ffff00",
      align: "center"
    }).setOrigin(0.5).setAlpha(0);
    this.setupColyseusListeners();
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }
  setupColyseusListeners() {
    if (!colyseusRoom || !colyseusRoom.state) return;
    const $ = cjs.getStateCallbacks(colyseusRoom);
    this.phaseListenerUnsubscribe = $(colyseusRoom.state).listen("currentPhase", (currentPhase) => {
      if (!this.scene.isActive()) return;
      console.log(`Battle Scene: Phase changed to ${currentPhase}`);
      if (currentPhase === Phase.BattleEnd) {
        this.handleBattleEnd();
      } else if (currentPhase === Phase.Shop) {
        if (this.scene.isActive()) {
          this.scene.stop();
          this.scene.start("Shop");
        }
      } else if (currentPhase === Phase.GameOver) {
        this.handleGameOver();
      } else if (currentPhase !== Phase.Battle) {
        console.warn(`Battle Scene: Unexpected phase change to ${currentPhase}. Returning to Lobby.`);
        if (this.scene.isActive()) {
          try {
            colyseusRoom == null ? void 0 : colyseusRoom.leave();
          } catch (e) {
          }
          this.scene.stop();
          this.scene.start("Lobby");
        }
      }
    });
  }
  cleanupListeners() {
    var _a3;
    console.log("Battle Scene: Cleaning up listeners.");
    (_a3 = this.phaseListenerUnsubscribe) == null ? void 0 : _a3.call(this);
    this.phaseListenerUnsubscribe = null;
  }
  handleBattleEnd() {
    var _a3, _b2;
    if (this.battleOver || !this.scene.isActive()) return;
    this.battleOver = true;
    console.log("Battle ended (server signal received). Displaying results.");
    const myPlayerState = colyseusRoom == null ? void 0 : colyseusRoom.state.players.get(colyseusRoom.sessionId);
    let opponentState;
    colyseusRoom == null ? void 0 : colyseusRoom.state.players.forEach((p, sid) => {
      if (sid !== (colyseusRoom == null ? void 0 : colyseusRoom.sessionId)) opponentState = p;
    });
    let resultMessage = "Battle Ended";
    let resultColor = "#ffffff";
    if (myPlayerState && opponentState) {
      if (myPlayerState.health > opponentState.health) {
        resultMessage = "Victory!";
        resultColor = "#88ff88";
      } else if (opponentState.health > myPlayerState.health) {
        resultMessage = "Defeat!";
        resultColor = "#ff8888";
      } else {
        resultMessage = "Draw!";
        resultColor = "#ffff88";
      }
    } else {
      resultMessage = "Battle Ended (Opponent Left?)";
      resultColor = "#ffffff";
    }
    if ((_a3 = this.resultText) == null ? void 0 : _a3.active) {
      this.resultText.setText(resultMessage).setColor(resultColor).setAlpha(1);
    }
    if ((_b2 = this.statusText) == null ? void 0 : _b2.active) {
      this.statusText.setText("Waiting for next round...").setAlpha(1);
    }
  }
  handleGameOver() {
    var _a3, _b2;
    if (this.battleOver || !this.scene.isActive()) return;
    this.battleOver = true;
    console.log("Game Over signal received.");
    const myPlayerState = colyseusRoom == null ? void 0 : colyseusRoom.state.players.get(colyseusRoom.sessionId);
    let opponentState;
    colyseusRoom == null ? void 0 : colyseusRoom.state.players.forEach((p, sid) => {
      if (sid !== (colyseusRoom == null ? void 0 : colyseusRoom.sessionId)) opponentState = p;
    });
    let finalMessage = "Game Over!";
    let finalColor = "#ffffff";
    if (myPlayerState && opponentState) {
      if (myPlayerState.health > opponentState.health) {
        finalMessage = "You Win!";
        finalColor = "#00ff00";
      } else if (opponentState.health > myPlayerState.health) {
        finalMessage = "You Lose!";
        finalColor = "#ff0000";
      } else {
        finalMessage = "Draw!";
        finalColor = "#ffff00";
      }
    } else if (myPlayerState) {
      finalMessage = "You Win! (Opponent Left)";
      finalColor = "#00ff00";
    } else {
      finalMessage = "Game Over (Error?)";
      finalColor = "#ff0000";
    }
    if ((_a3 = this.resultText) == null ? void 0 : _a3.active) {
      this.resultText.setText(finalMessage).setColor(finalColor).setAlpha(1);
    }
    if ((_b2 = this.statusText) == null ? void 0 : _b2.active) {
      this.statusText.setText("Click to return to Main Menu").setAlpha(1);
    }
    this.input.once("pointerdown", () => {
      try {
        colyseusRoom == null ? void 0 : colyseusRoom.leave();
      } catch (e) {
      }
      this.scene.stop("Background");
      this.scene.start("MainMenu");
    });
  }
  shutdown() {
    var _a3, _b2;
    console.log("Battle scene shutting down explicitly.");
    this.cleanupListeners();
    this.handCardDisplayObjects.forEach((hand) => {
      hand == null ? void 0 : hand.forEach((displayObj) => displayObj == null ? void 0 : displayObj.destroy());
    });
    this.handCardDisplayObjects.clear();
    (_a3 = this.resultText) == null ? void 0 : _a3.destroy();
    (_b2 = this.statusText) == null ? void 0 : _b2.destroy();
    this.events.off(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }
};
__name(_Battle, "Battle");
let Battle = _Battle;
const MINION_CARD_WIDTH = 100;
const MINION_CARD_HEIGHT = 140;
const FULL_CARD_WIDTH = 120;
const FULL_CARD_HEIGHT = 168;
const SLOT_SPACING = 15;
const HAND_Y_PLAYER = 580;
const BATTLEFIELD_Y_PLAYER = 420;
const HAND_Y_OPPONENT = 100;
const BATTLEFIELD_Y_OPPONENT = 260;
const _BoardView = class _BoardView extends phaserExports.Scene {
  // Added: For card-specific schema listeners
  constructor() {
    super("BoardView");
    __publicField(this, "playerVisuals", /* @__PURE__ */ new Map());
    __publicField(this, "currentPhase", Phase.Lobby);
    // Add currentPhase property
    // Add sell zone properties
    __publicField(this, "sellZone");
    __publicField(this, "sellZoneRect");
    __publicField(this, "sellZoneText");
    __publicField(this, "brewGainText");
    // Navbar elements
    __publicField(this, "playerHealthText");
    __publicField(this, "opponentHealthText");
    __publicField(this, "playerBrewsText");
    __publicField(this, "dayPhaseText");
    __publicField(this, "opponentUsernameText");
    // For opponent's name
    // Listeners
    __publicField(this, "listeners", []);
    __publicField(this, "cardSchemaListeners", /* @__PURE__ */ new Map());
  }
  updateCardHpVisuals(cardContainer, currentHp, maxHealth) {
    if (!cardContainer || !cardContainer.active) return;
    const hpText = cardContainer.getData(
      "hpTextObject"
    );
    const mainCardImage = cardContainer.getData(
      "mainCardImage"
    );
    if (hpText && hpText.active) {
      hpText.setText(`${currentHp}/${maxHealth}`);
      const hpPercent = maxHealth > 0 ? currentHp / maxHealth : 0;
      if (currentHp <= 0) {
        hpText.setColor("#ff0000");
      } else if (hpPercent < 0.3) {
        hpText.setColor("#ff8888");
      } else if (hpPercent < 0.6) {
        hpText.setColor("#ffff88");
      } else {
        hpText.setColor("#88ff88");
      }
    }
    const isVisuallyDead = cardContainer.alpha < 1;
    if (currentHp <= 0) {
      if (!isVisuallyDead) {
        cardContainer.setAlpha(0.6);
        if (mainCardImage && mainCardImage.active && typeof mainCardImage.setTint === "function") {
          mainCardImage.setTint(7829367);
        }
      }
    } else {
      if (isVisuallyDead) {
        cardContainer.setAlpha(1);
        if (mainCardImage && mainCardImage.active && typeof mainCardImage.clearTint === "function") {
          mainCardImage.clearTint();
        } else if (mainCardImage && mainCardImage.active) {
          console.warn(
            "BoardView: updateCardHpVisuals - clearTint method not found on mainCardImage for card.",
            cardContainer.getData("instanceId"),
            mainCardImage
          );
        }
      }
    }
  }
  preload() {
    if (!this.textures.exists("cardBack")) {
      const graphics = this.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(5253758);
      graphics.fillRect(0, 0, FULL_CARD_WIDTH, FULL_CARD_HEIGHT);
      graphics.lineStyle(2, 12428501);
      graphics.strokeRect(0, 0, FULL_CARD_WIDTH, FULL_CARD_HEIGHT);
      graphics.generateTexture("cardBack", FULL_CARD_WIDTH, FULL_CARD_HEIGHT);
      graphics.destroy();
    }
  }
  create() {
    console.log("BoardView creating...");
    this.createNavbar();
    this.createSellZone();
    this.setupColyseusListeners();
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }
  createNavbar() {
    const centerX = this.cameras.main.centerX;
    const gameWidth = this.cameras.main.width;
    const navbarY = 30;
    const navbarHeight = 50;
    this.add.rectangle(centerX, navbarY, gameWidth, navbarHeight, 0, 0.7).setDepth(1e3);
    const navTextStyle = {
      fontFamily: "Arial",
      fontSize: 16,
      color: "#ffffff",
      align: "left"
    };
    this.playerHealthText = this.add.text(gameWidth * 0.05, navbarY, `You: -- HP`, {
      ...navTextStyle,
      color: "#00ff00"
    }).setOrigin(0, 0.5).setDepth(1001);
    this.playerBrewsText = this.add.text(gameWidth * 0.95, navbarY, `Brews: --`, {
      // Dynamic X
      ...navTextStyle,
      color: "#ffff00",
      align: "right"
    }).setOrigin(1, 0.5).setDepth(1001);
    this.opponentUsernameText = this.add.text(gameWidth * 0.25, navbarY - 10, `Opponent: --`, {
      // Dynamic X
      ...navTextStyle,
      fontSize: 14
    }).setOrigin(0, 0.5).setDepth(1001);
    this.opponentHealthText = this.add.text(gameWidth * 0.25, navbarY + 10, `-- HP`, {
      ...navTextStyle,
      color: "#ff0000"
    }).setOrigin(0, 0.5).setDepth(1001);
    this.dayPhaseText = this.add.text(centerX, navbarY, `Day -- - Phase --`, {
      // Remains centered
      ...navTextStyle,
      fontSize: 20,
      align: "center"
    }).setOrigin(0.5).setDepth(1001);
  }
  showAttackAnimation(cardInstanceId) {
    const cardContainer = this.getCardGameObjectByInstanceId(cardInstanceId);
    if (cardContainer && cardContainer.active) {
      const originalScaleX = cardContainer.scaleX;
      const originalScaleY = cardContainer.scaleY;
      this.tweens.add({
        targets: cardContainer,
        scaleX: originalScaleX * 1.15,
        scaleY: originalScaleY * 1.15,
        duration: 100,
        yoyo: true,
        ease: "Sine.easeInOut"
      });
    }
  }
  showDamageNumber(targetInstanceId, damage) {
    const targetContainer = this.getCardGameObjectByInstanceId(targetInstanceId);
    if (targetContainer && targetContainer.active && damage > 0) {
      const damageText = this.add.text(
        targetContainer.x + Phaser.Math.Between(-10, 10),
        targetContainer.y - FULL_CARD_HEIGHT / 2 - 10,
        // Above the card
        `-${damage}`,
        {
          fontFamily: "Arial Black",
          fontSize: 24,
          color: "#ff0000",
          // Red for damage
          stroke: "#000000",
          strokeThickness: 4
        }
      ).setOrigin(0.5).setDepth(targetContainer.depth + 1);
      this.tweens.add({
        targets: damageText,
        y: damageText.y - 50,
        // Float up
        alpha: 0,
        // Fade out
        duration: 1e3,
        ease: "Power1",
        onComplete: /* @__PURE__ */ __name(() => {
          damageText.destroy();
        }, "onComplete")
      });
    }
  }
  drawAttackLine(attackerInstanceId, targetInstanceId) {
    const attackerContainer = this.getCardGameObjectByInstanceId(attackerInstanceId);
    const targetContainer = this.getCardGameObjectByInstanceId(targetInstanceId);
    if (attackerContainer && attackerContainer.active && targetContainer && targetContainer.active) {
      const line = this.add.line(
        0,
        0,
        attackerContainer.x,
        attackerContainer.y,
        targetContainer.x,
        targetContainer.y,
        16724787,
        // Bright red
        0.7
      ).setOrigin(0, 0).setLineWidth(2).setDepth(attackerContainer.depth);
      this.time.delayedCall(250, () => {
        line.destroy();
      });
    }
  }
  setupColyseusListeners() {
    if (!colyseusRoom || !colyseusRoom.state) {
      console.error("BoardView: Colyseus room or state not available!");
      this.time.delayedCall(100, this.setupColyseusListeners, [], this);
      return;
    }
    const $ = cjs.getStateCallbacks(colyseusRoom);
    this.listeners.push(
      $(colyseusRoom.state).listen("currentDay", () => this.updateNavbarText())
    );
    this.listeners.push(
      $(colyseusRoom.state).listen("currentPhase", (newPhase, oldPhase) => {
        this.currentPhase = newPhase;
        this.updateNavbarText();
        if (newPhase === Phase.Shop || newPhase === Phase.Preparation) {
          this.sellZone.setVisible(true);
        } else {
          this.sellZone.setVisible(false);
        }
        const processCardVisualsPostBattle = /* @__PURE__ */ __name((cardContainer, cardSchema, ownerSessionId, slotKey) => {
          if (!cardContainer.active) return;
          const cooldownBarBg = cardContainer.getData(
            "cooldownBarBg"
          );
          const cooldownBarFill = cardContainer.getData(
            "cooldownBarFill"
          );
          if (newPhase === Phase.Battle) {
            const cardArea = cardContainer.getData("area");
            if (cardArea === "battlefield") {
              if (cardSchema) {
                if (cooldownBarBg && cooldownBarFill) {
                  cooldownBarBg.setVisible(true);
                  cooldownBarFill.setVisible(true);
                  const storedWidth = cardContainer.getData(
                    "cooldownBarBaseWidth"
                  );
                  const cooldownBarBaseWidth = typeof storedWidth === "number" ? storedWidth : MINION_CARD_WIDTH - 10;
                  cooldownBarFill.setSize(cooldownBarBaseWidth, 6);
                  const maxCooldown = (cardSchema.speed > 0 ? cardSchema.speed : 1.5) * 1e3;
                  cardContainer.setData("maxAttackCooldown", maxCooldown);
                  cardContainer.setData("attackCooldownTimer", maxCooldown);
                } else {
                  console.warn(
                    `BoardView: Battle Phase - Card ${cardSchema.instanceId} (Owner: ${ownerSessionId}, Slot: ${slotKey}) missing cooldown bar elements in data. Bg: ${!!cooldownBarBg}, Fill: ${!!cooldownBarFill}`
                  );
                }
              } else {
                console.warn(
                  `BoardView: Battle Phase - Battlefield card container (Owner: ${ownerSessionId}, Slot: ${slotKey}) has no cardSchema. No cooldown bar shown.`
                );
              }
            }
          } else {
            if (cooldownBarBg) cooldownBarBg.setVisible(false);
            if (cooldownBarFill) cooldownBarFill.setVisible(false);
          }
          if (oldPhase === Phase.Battle || oldPhase === Phase.BattleEnd) {
            if (newPhase !== Phase.Battle && newPhase !== Phase.BattleEnd) {
              if (cardSchema && cardSchema.currentHp > 0) {
                cardContainer.setAlpha(1);
                const mainCardImage = cardContainer.getData(
                  // Changed from bgRect
                  "mainCardImage"
                );
                if (mainCardImage && mainCardImage.active && typeof mainCardImage.clearTint === "function") {
                  mainCardImage.clearTint();
                }
              }
            }
          }
        }, "processCardVisualsPostBattle");
        this.playerVisuals.forEach((playerData, playerId) => {
          playerData.battlefield.forEach((cardContainer, slotKey) => {
            var _a3;
            const cardSchema = (_a3 = colyseusRoom == null ? void 0 : colyseusRoom.state.players.get(playerId)) == null ? void 0 : _a3.battlefield.get(slotKey);
            processCardVisualsPostBattle(
              cardContainer,
              cardSchema,
              playerId,
              slotKey
            );
          });
          playerData.hand.forEach((cardContainer, slotKey) => {
            var _a3;
            const cardSchema = (_a3 = colyseusRoom == null ? void 0 : colyseusRoom.state.players.get(playerId)) == null ? void 0 : _a3.hand.get(slotKey);
            if (oldPhase === Phase.Battle || oldPhase === Phase.BattleEnd) {
              if (newPhase !== Phase.Battle && newPhase !== Phase.BattleEnd) {
                if (cardSchema && cardSchema.currentHp > 0) {
                  cardContainer.setAlpha(1);
                  const mainCardImage = cardContainer.getData(
                    // Changed from bgRect
                    "mainCardImage"
                  );
                  if (mainCardImage && mainCardImage.active && typeof mainCardImage.clearTint === "function") {
                    mainCardImage.clearTint();
                  }
                }
              }
            }
          });
        });
      })
    );
    this.listeners.push(
      $(colyseusRoom.state.players).onAdd(
        (player, sessionId) => {
          console.log(`BoardView: Player added ${sessionId}`);
          this.addPlayerVisuals(sessionId);
          this.addPlayerListeners(player, sessionId);
          this.updatePlayerSlots(player, sessionId);
          this.updateNavbarText();
        }
      )
    );
    this.listeners.push(
      $(colyseusRoom.state.players).onRemove(
        (player, sessionId) => {
          console.log(`BoardView: Player removed ${sessionId}`);
          this.removePlayerVisuals(sessionId);
          this.updateNavbarText();
        }
      )
    );
    this.listeners.push(
      colyseusRoom.onMessage(
        "battleAttackEvent",
        (message) => {
          if (this.currentPhase !== Phase.Battle || !this.scene.isActive())
            return;
          console.log("BoardView: Received battleAttackEvent", message);
          const attackerCard = this.getCardGameObjectByInstanceId(
            message.attackerInstanceId
          );
          const targetCard = this.getCardGameObjectByInstanceId(
            message.targetInstanceId
          );
          if (attackerCard && attackerCard.active && targetCard && targetCard.active) {
            this.drawAttackLine(
              message.attackerInstanceId,
              message.targetInstanceId
            );
            this.showAttackAnimation(message.attackerInstanceId);
            this.showDamageNumber(
              message.targetInstanceId,
              message.damageDealt
            );
            const attackerMaxCooldown = attackerCard.getData(
              "maxAttackCooldown"
            );
            if (attackerMaxCooldown > 0) {
              attackerCard.setData("attackCooldownTimer", attackerMaxCooldown);
              const fillBar = attackerCard.getData(
                "cooldownBarFill"
              );
              const attackerCooldownBarBaseWidth = attackerCard.getData("cooldownBarBaseWidth") || MINION_CARD_WIDTH - 10;
              if (fillBar) fillBar.setSize(attackerCooldownBarBaseWidth, 6);
            }
            const targetCardOwnerId = targetCard.getData(
              "ownerSessionId"
            );
            const targetCardSlotKey = targetCard.getData("slotKey");
            const targetCardArea = targetCard.getData("area");
            if (targetCardOwnerId === message.targetPlayerId && targetCardArea === "battlefield" && targetCardSlotKey) {
              const targetPlayer = colyseusRoom.state.players.get(
                message.targetPlayerId
              );
              const cardSchema = targetPlayer == null ? void 0 : targetPlayer.battlefield.get(targetCardSlotKey);
              if (cardSchema && cardSchema.instanceId === message.targetInstanceId) {
                const newVisualHp = Math.max(
                  0,
                  cardSchema.currentHp - message.damageDealt
                );
                this.updateCardHpVisuals(
                  targetCard,
                  newVisualHp,
                  cardSchema.health
                );
              } else {
                console.warn(
                  `BoardView: battleAttackEvent - Target card schema not found or instanceId mismatch for player ${message.targetPlayerId}, slot ${targetCardSlotKey}, instance ${message.targetInstanceId}.`
                );
              }
            } else {
              console.warn(
                `BoardView: battleAttackEvent - Target card container data inconsistent or not on battlefield. Owner: ${targetCardOwnerId}, Area: ${targetCardArea}, Slot: ${targetCardSlotKey}`
              );
            }
          } else {
            console.warn(
              "BoardView: Attacker or target not found/active for battleAttackEvent",
              message
            );
          }
        }
      )
    );
    colyseusRoom.state.players.forEach(
      (player, sessionId) => {
        this.addPlayerVisuals(sessionId);
        this.addPlayerListeners(player, sessionId);
        this.updatePlayerSlots(player, sessionId);
      }
    );
    this.updateNavbarText();
  }
  update(time, delta) {
    if (!this.scene.isActive() || this.currentPhase !== Phase.Battle || !colyseusRoom || !colyseusRoom.state) {
      return;
    }
    this.playerVisuals.forEach((playerData) => {
      playerData.battlefield.forEach((cardContainer) => {
        if (!cardContainer.active) return;
        const maxCooldown = cardContainer.getData(
          "maxAttackCooldown"
        );
        let currentTimer = cardContainer.getData(
          "attackCooldownTimer"
        );
        const cooldownBarBaseWidth = cardContainer.getData("cooldownBarBaseWidth") || MINION_CARD_WIDTH - 10;
        if (maxCooldown > 0) {
          currentTimer -= delta;
          if (currentTimer < 0) currentTimer = 0;
          cardContainer.setData("attackCooldownTimer", currentTimer);
          const cooldownBarFill = cardContainer.getData(
            "cooldownBarFill"
          );
          if (cooldownBarFill && cooldownBarFill.visible) {
            const progress = currentTimer / maxCooldown;
            cooldownBarFill.setSize(
              cooldownBarBaseWidth * Math.max(0, progress),
              6
            );
          }
        }
      });
    });
  }
  addPlayerListeners(player, sessionId) {
    const $ = cjs.getStateCallbacks(colyseusRoom);
    const playerListeners = [];
    playerListeners.push(
      $(player).listen("health", () => this.updateNavbarText())
    );
    playerListeners.push(
      $(player).listen("brews", () => this.updateNavbarText())
    );
    playerListeners.push(
      $(player).listen("username", () => this.updateNavbarText())
    );
    playerListeners.push(
      // @ts-ignore
      $(player.hand).onAdd(
        (cardSchema, slotKey) => {
          this.updateCardVisual(sessionId, "hand", slotKey, cardSchema);
          this.addCardSchemaListeners(cardSchema);
        }
      )
    );
    playerListeners.push(
      // @ts-ignore
      $(player.hand).onRemove(
        (cardSchema, slotKey) => {
          this.removeCardVisual(sessionId, "hand", slotKey);
        }
      )
    );
    player.hand.forEach((cardSchema, slotKey) => {
      this.addCardSchemaListeners(cardSchema);
    });
    playerListeners.push(
      // @ts-ignore
      $(player.battlefield).onAdd(
        (cardSchema, slotKey) => {
          this.updateCardVisual(sessionId, "battlefield", slotKey, cardSchema);
          this.addCardSchemaListeners(cardSchema);
        }
      )
    );
    playerListeners.push(
      // @ts-ignore
      $(player.battlefield).onRemove(
        (cardSchema, slotKey) => {
          this.removeCardVisual(sessionId, "battlefield", slotKey);
        }
      )
    );
    player.battlefield.forEach((cardSchema, slotKey) => {
      this.addCardSchemaListeners(cardSchema);
    });
    this.listeners.push(...playerListeners);
  }
  addCardSchemaListeners(cardSchema) {
    if (!cardSchema || !cardSchema.instanceId) return;
    const $ = cjs.getStateCallbacks(colyseusRoom);
    const existingUnsubs = this.cardSchemaListeners.get(cardSchema.instanceId);
    if (existingUnsubs) {
      existingUnsubs.forEach((unsub) => unsub());
      this.cardSchemaListeners.delete(cardSchema.instanceId);
    }
    const newUnsubs = [];
    const hpUnsub = $(cardSchema).listen("currentHp", (newHp, oldHp) => {
      const cardContainer = this.getCardGameObjectByInstanceId(
        cardSchema.instanceId
      );
      if (cardContainer) {
        this.updateCardHpVisuals(cardContainer, newHp, cardSchema.health);
      }
    });
    newUnsubs.push(hpUnsub);
    if (newUnsubs.length > 0) {
      this.cardSchemaListeners.set(cardSchema.instanceId, newUnsubs);
    }
  }
  updatePlayerSlots(player, sessionId) {
    player.hand.forEach(
      (card, slotKey) => this.updateCardVisual(sessionId, "hand", slotKey, card)
    );
    player.battlefield.forEach(
      (card, slotKey) => this.updateCardVisual(sessionId, "battlefield", slotKey, card)
    );
  }
  addPlayerVisuals(sessionId) {
    if (!this.playerVisuals.has(sessionId)) {
      const handSlotOutlines = [];
      const battlefieldSlotOutlines = [];
      const isLocalPlayer = sessionId === (colyseusRoom == null ? void 0 : colyseusRoom.sessionId);
      for (let i = 0; i < 5; i++) {
        const handX = this.calculateSlotX(i, "hand");
        const handY = isLocalPlayer ? HAND_Y_PLAYER : HAND_Y_OPPONENT;
        const handOutline = this.add.rectangle(handX, handY, FULL_CARD_WIDTH, FULL_CARD_HEIGHT).setStrokeStyle(2, isLocalPlayer ? 11184810 : 7829367, 0.8).setDepth(0);
        handSlotOutlines.push(handOutline);
        const bfX = this.calculateSlotX(i, "battlefield");
        const bfY = isLocalPlayer ? BATTLEFIELD_Y_PLAYER : BATTLEFIELD_Y_OPPONENT;
        const bfOutline = this.add.rectangle(bfX, bfY, MINION_CARD_WIDTH, MINION_CARD_HEIGHT).setStrokeStyle(2, isLocalPlayer ? 16777215 : 11184810, 1).setDepth(0);
        battlefieldSlotOutlines.push(bfOutline);
      }
      this.playerVisuals.set(sessionId, {
        hand: /* @__PURE__ */ new Map(),
        battlefield: /* @__PURE__ */ new Map(),
        handSlotOutlines,
        battlefieldSlotOutlines
      });
    }
  }
  removePlayerVisuals(sessionId) {
    const visuals = this.playerVisuals.get(sessionId);
    if (visuals) {
      visuals.hand.forEach((container) => container.destroy());
      visuals.battlefield.forEach((container) => container.destroy());
      visuals.handSlotOutlines.forEach((outline) => outline.destroy());
      visuals.battlefieldSlotOutlines.forEach((outline) => outline.destroy());
    }
    this.playerVisuals.delete(sessionId);
  }
  updateCardVisual(sessionId, area, slotKey, cardSchema) {
    if (!this.scene.isActive()) {
      return;
    }
    if (!colyseusRoom || !colyseusRoom.state) {
      return;
    }
    this.removeCardVisual(sessionId, area, slotKey);
    const playerVisuals = this.playerVisuals.get(sessionId);
    if (!playerVisuals) return;
    const isLocalPlayer = sessionId === (colyseusRoom == null ? void 0 : colyseusRoom.sessionId);
    const x = this.calculateSlotX(parseInt(slotKey, 10), area);
    let y;
    let isObscured = false;
    if (area === "hand") {
      y = isLocalPlayer ? HAND_Y_PLAYER : HAND_Y_OPPONENT;
      if (!isLocalPlayer) isObscured = true;
    } else {
      y = isLocalPlayer ? BATTLEFIELD_Y_PLAYER : BATTLEFIELD_Y_OPPONENT;
    }
    const cardContainer = this.createCardGameObject(
      cardSchema,
      x,
      y,
      isObscured,
      isLocalPlayer,
      area
      // Pass the area parameter
    );
    cardContainer.setData("instanceId", cardSchema.instanceId);
    cardContainer.setData("slotKey", slotKey);
    cardContainer.setData("area", area);
    cardContainer.setData("ownerSessionId", sessionId);
    cardContainer.setDepth(1);
    if (cardSchema.currentHp <= 0) {
      cardContainer.setAlpha(0.6);
      const img = cardContainer.getData(
        "mainCardImage"
      );
      if (img && img.active && typeof img.setTint === "function") {
        img.setTint(7829367);
      }
      const hpText = cardContainer.getData(
        "hpTextObject"
      );
      if (hpText && hpText.active) hpText.setColor("#ff0000");
    }
    if (area === "hand") {
      playerVisuals.hand.set(slotKey, cardContainer);
    } else {
      playerVisuals.battlefield.set(slotKey, cardContainer);
    }
    this.addCardSchemaListeners(cardSchema);
    if (isLocalPlayer) {
      this.makeCardInteractive(cardContainer);
    }
  }
  removeCardVisual(sessionId, area, slotKey) {
    const playerVisuals = this.playerVisuals.get(sessionId);
    if (playerVisuals) {
      const mapArea = area === "hand" ? playerVisuals.hand : playerVisuals.battlefield;
      const existingVisual = mapArea.get(slotKey);
      if (existingVisual) {
        const instanceId = existingVisual.getData("instanceId");
        if (instanceId) {
          const listenersToRemove = this.cardSchemaListeners.get(instanceId);
          if (listenersToRemove) {
            console.log(
              `BoardView: Cleaning up ${listenersToRemove.length} listeners for card instance ${instanceId} during removeCardVisual.`
            );
            listenersToRemove.forEach((unsub) => {
              if (typeof unsub === "function") {
                try {
                  unsub();
                } catch (e) {
                  console.warn(
                    `BoardView: Error unsubscribing card listener for ${instanceId}`,
                    e
                  );
                }
              }
            });
            this.cardSchemaListeners.delete(instanceId);
          }
        }
        if (existingVisual.input && existingVisual.input.enabled) {
          this.input.disable(existingVisual);
        }
        this.time.delayedCall(1, () => {
          if (existingVisual.active) {
            existingVisual.destroy();
          }
        });
        mapArea.delete(slotKey);
      }
    }
  }
  calculateSlotX(slotIndex, area) {
    const currentCardWidth = area === "hand" ? FULL_CARD_WIDTH : MINION_CARD_WIDTH;
    const totalWidthAllSlots = 5 * currentCardWidth + 4 * SLOT_SPACING;
    const startX = (this.cameras.main.width - totalWidthAllSlots) / 2 + currentCardWidth / 2;
    return startX + slotIndex * (currentCardWidth + SLOT_SPACING);
  }
  createCardGameObject(cardSchema, x, y, isObscured, isLocalPlayer, area) {
    const container = this.add.container(x, y);
    const displayCardWidth = area === "hand" ? FULL_CARD_WIDTH : MINION_CARD_WIDTH;
    const displayCardHeight = area === "hand" ? FULL_CARD_HEIGHT : MINION_CARD_HEIGHT;
    container.setData("displayCardWidth", displayCardWidth);
    container.setData("displayCardHeight", displayCardHeight);
    if (isObscured) {
      const cardBack = this.add.image(0, 0, "cardBack").setOrigin(0.5).setDisplaySize(FULL_CARD_WIDTH, FULL_CARD_HEIGHT);
      container.add(cardBack);
      return container;
    }
    const cardTextureKey = area === "hand" ? "cardFullTier1" : "cardMinionTier1";
    const cardImage = this.add.image(0, 0, cardTextureKey).setOrigin(0.5);
    cardImage.setDisplaySize(displayCardWidth, displayCardHeight);
    container.add(cardImage);
    container.setData("mainCardImage", cardImage);
    if (area === "hand") {
      const nameText = this.add.text(0, -20, cardSchema.name, {
        // Middle center, moved up
        fontFamily: "Arial",
        fontSize: 16,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
        align: "center",
        wordWrap: { width: displayCardWidth - 20 }
      }).setOrigin(0.5, 0.5);
      container.add(nameText);
      const attackText = this.add.text(
        -100 / 2 + 32,
        MINION_CARD_HEIGHT * 0.03,
        `${cardSchema.attack}`,
        {
          fontFamily: "Arial",
          fontSize: 16,
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 4
        }
      ).setOrigin(0, 0.5);
      container.add(attackText);
      const hpText = this.add.text(
        MINION_CARD_WIDTH / 2 - 18,
        6,
        `${cardSchema.currentHp}  ${cardSchema.health}`,
        {
          fontFamily: "Arial",
          fontSize: 16,
          color: "#00ff00",
          stroke: "#000000",
          strokeThickness: 4
        }
      ).setOrigin(1, 0.5);
      container.add(hpText);
      container.setData("hpTextObject", hpText);
      const speedText = this.add.text(0, displayCardHeight / 2 - 50, `${cardSchema.speed}`, {
        fontFamily: "Arial",
        fontSize: 16,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3
      }).setOrigin(0.5, 1);
      container.add(speedText);
    } else {
      const nameText = this.add.text(
        0,
        -displayCardHeight / 2 + 5,
        // 12px from top
        cardSchema.name,
        {
          fontFamily: "Arial",
          fontSize: 14,
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 4,
          align: "center",
          wordWrap: { width: displayCardWidth }
        }
      ).setOrigin(0.5, 0);
      container.add(nameText);
      const attackText = this.add.text(-displayCardWidth / 2 + 32, 32, `${cardSchema.attack}`, {
        // Middle-left
        fontFamily: "Arial",
        fontSize: 16,
        // Value only
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4
      }).setOrigin(0, 0.5);
      container.add(attackText);
      const speedText = this.add.text(
        0,
        43,
        // 30px from top
        `${cardSchema.speed}`,
        {
          fontFamily: "Arial",
          fontSize: 14,
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 3
        }
      ).setOrigin(1, 0);
      container.add(speedText);
      const hpText = this.add.text(
        displayCardWidth / 2 - 10,
        displayCardHeight / 2 - 30,
        // 30px from bottom
        `${cardSchema.currentHp}/${cardSchema.health}`,
        {
          fontFamily: "Arial",
          fontSize: 14,
          color: "#00ff00",
          stroke: "#000000",
          strokeThickness: 3
        }
      ).setOrigin(1, 1);
      container.add(hpText);
      container.setData("hpTextObject", hpText);
      const cooldownBarY = displayCardHeight / 2 - 15;
      const cooldownBarWidth = displayCardWidth - 10;
      const cooldownBarBg = this.add.rectangle(0, cooldownBarY, cooldownBarWidth, 6, 0, 0.5).setVisible(false);
      const cooldownBarFill = this.add.rectangle(
        -cooldownBarWidth / 2,
        cooldownBarY,
        cooldownBarWidth,
        6,
        4521796
      ).setOrigin(0, 0.5).setVisible(false);
      container.add(cooldownBarBg);
      container.add(cooldownBarFill);
      container.setData("cooldownBarBg", cooldownBarBg);
      container.setData("cooldownBarFill", cooldownBarFill);
      container.setData("attackCooldownTimer", 0);
      container.setData("maxAttackCooldown", 0);
      container.setData("cooldownBarBaseWidth", cooldownBarWidth);
    }
    return container;
  }
  getCardGameObjectByInstanceId(instanceId) {
    for (const [_sessionId, playerData] of this.playerVisuals) {
      for (const [_slotKey, cardObject] of playerData.hand) {
        if (cardObject.getData("instanceId") === instanceId) return cardObject;
      }
      for (const [_slotKey, cardObject] of playerData.battlefield) {
        if (cardObject.getData("instanceId") === instanceId) return cardObject;
      }
    }
    return void 0;
  }
  getSlotPixelPosition(isLocalPlayer, area, slotIndex) {
    if (slotIndex < 0 || slotIndex > 4) return void 0;
    const x = this.calculateSlotX(slotIndex, area);
    let y;
    if (area === "hand") {
      y = isLocalPlayer ? HAND_Y_PLAYER : HAND_Y_OPPONENT;
    } else {
      y = isLocalPlayer ? BATTLEFIELD_Y_PLAYER : BATTLEFIELD_Y_OPPONENT;
    }
    return { x, y };
  }
  makeCardInteractive(cardContainer) {
    const cardWidth = cardContainer.getData("displayCardWidth");
    const cardHeight = cardContainer.getData("displayCardHeight");
    if (!cardWidth || !cardHeight) {
      console.warn(
        "BoardView: makeCardInteractive - displayCardWidth/Height not found on container.",
        cardContainer.getData("instanceId")
      );
      return;
    }
    const hitAreaRectangle = new Phaser.Geom.Rectangle(
      -cardWidth / 2,
      -cardHeight / 2,
      cardWidth,
      cardHeight
    );
    cardContainer.setInteractive({
      hitArea: hitAreaRectangle,
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true
    });
    this.input.setDraggable(cardContainer);
    if (cardContainer.input) {
      cardContainer.input.enabled = true;
    }
    cardContainer.on("dragstart", (pointer) => {
      if (this.currentPhase !== Phase.Shop && this.currentPhase !== Phase.Preparation) {
        return;
      }
      if (!cardContainer.input || !cardContainer.input.enabled) {
        return;
      }
      this.children.bringToTop(cardContainer);
      cardContainer.setAlpha(0.7);
      cardContainer.setData("isDragging", true);
      cardContainer.setData("originalX", cardContainer.x);
      cardContainer.setData("originalY", cardContainer.y);
      cardContainer.setData(
        "originalAreaOnDragStart",
        cardContainer.getData("area")
      );
      cardContainer.setData(
        "originalSlotKeyOnDragStart",
        cardContainer.getData("slotKey")
      );
    });
    cardContainer.on(
      "drag",
      (pointer, dragX, dragY) => {
        if (cardContainer.getData("isDragging")) {
          cardContainer.x = dragX;
          cardContainer.y = dragY;
          if ((this.currentPhase === Phase.Shop || this.currentPhase === Phase.Preparation) && this.sellZone.visible) {
            if (this.isDroppedOnSellZone(cardContainer)) {
              const instanceId = cardContainer.getData("instanceId");
              const originalArea = cardContainer.getData(
                "originalAreaOnDragStart"
              );
              const originalSlotKey = cardContainer.getData(
                "originalSlotKeyOnDragStart"
              );
              const ownerId = cardContainer.getData("ownerSessionId");
              const player = colyseusRoom == null ? void 0 : colyseusRoom.state.players.get(ownerId);
              let cardSchema;
              if (player) {
                if (originalArea === "hand") {
                  cardSchema = player.hand.get(originalSlotKey);
                } else {
                  cardSchema = player.battlefield.get(originalSlotKey);
                }
              }
              if (cardSchema && cardSchema.instanceId === instanceId) {
                const sellValue = Math.max(
                  1,
                  Math.floor(cardSchema.brewCost / 2)
                );
                this.brewGainText.setText(`Sell: +${sellValue} 🍺`);
                this.brewGainText.setAlpha(1);
              } else {
                this.brewGainText.setAlpha(0);
              }
            } else {
              this.brewGainText.setAlpha(0);
            }
          } else {
            this.brewGainText.setAlpha(0);
          }
        }
      }
    );
    cardContainer.on("dragend", (pointer) => {
      if (!cardContainer.getData("isDragging")) return;
      cardContainer.setAlpha(1);
      cardContainer.setData("isDragging", false);
      this.brewGainText.setAlpha(0);
      const instanceId = cardContainer.getData("instanceId");
      const originalArea = cardContainer.getData("originalAreaOnDragStart");
      const originalSlotKey = cardContainer.getData(
        "originalSlotKeyOnDragStart"
      );
      const ownerSessionId = cardContainer.getData("ownerSessionId");
      if ((this.currentPhase === Phase.Shop || this.currentPhase === Phase.Preparation) && this.sellZone.visible && this.isDroppedOnSellZone(cardContainer)) {
        const myPlayer = colyseusRoom == null ? void 0 : colyseusRoom.state.players.get(
          colyseusRoom == null ? void 0 : colyseusRoom.sessionId
        );
        let cardSchema;
        if (originalArea === "hand" && (myPlayer == null ? void 0 : myPlayer.hand.has(originalSlotKey))) {
          cardSchema = myPlayer.hand.get(originalSlotKey);
        } else if (originalArea === "battlefield" && (myPlayer == null ? void 0 : myPlayer.battlefield.has(originalSlotKey))) {
          cardSchema = myPlayer.battlefield.get(originalSlotKey);
        }
        if (cardSchema && cardSchema.instanceId === instanceId) {
          const sellValue = Math.max(1, Math.floor(cardSchema.brewCost / 2));
          colyseusRoom == null ? void 0 : colyseusRoom.send("sellCard", {
            instanceId,
            area: originalArea,
            slotKey: originalSlotKey
          });
          this.showBrewGain(sellValue);
          return;
        }
        const ownerId = cardContainer.getData("ownerSessionId");
        const player = colyseusRoom == null ? void 0 : colyseusRoom.state.players.get(ownerId);
        if (player) {
          if (originalArea === "hand") {
            cardSchema = player.hand.get(originalSlotKey);
          } else {
            cardSchema = player.battlefield.get(originalSlotKey);
          }
        }
        let dropped = false;
        let newAreaForServer;
        let newSlotKeyForServer;
        for (let i = 0; i < 5; i++) {
          const targetSlotKey = String(i);
          const slotPos = this.getSlotPixelPosition(true, "hand", i);
          if (slotPos) {
            const dropZone = new Phaser.Geom.Rectangle(
              slotPos.x - FULL_CARD_WIDTH / 2,
              slotPos.y - FULL_CARD_HEIGHT / 2,
              FULL_CARD_WIDTH,
              FULL_CARD_HEIGHT
            );
            if (Phaser.Geom.Rectangle.Contains(
              dropZone,
              cardContainer.x,
              cardContainer.y
            )) {
              if (this.isSlotEmpty(
                ownerSessionId,
                "hand",
                targetSlotKey,
                instanceId
              )) {
                let canDropInHandSlot = false;
                if (this.currentPhase === Phase.Shop) {
                  if (originalArea === "hand") {
                    canDropInHandSlot = true;
                  }
                } else if (this.currentPhase === Phase.Preparation) {
                  if (originalArea === "hand") {
                    canDropInHandSlot = true;
                  }
                }
                if (canDropInHandSlot) {
                  cardContainer.x = slotPos.x;
                  cardContainer.y = slotPos.y;
                  const areaChanged = originalArea !== "hand";
                  cardContainer.setData("area", "hand");
                  cardContainer.setData("slotKey", targetSlotKey);
                  this.updateVisualMaps(
                    ownerSessionId,
                    originalArea,
                    originalSlotKey,
                    "hand",
                    targetSlotKey,
                    cardContainer
                  );
                  if (areaChanged) {
                    const myPlayer2 = colyseusRoom == null ? void 0 : colyseusRoom.state.players.get(ownerSessionId);
                    let cardSchema2;
                    if (myPlayer2) {
                      cardSchema2 = myPlayer2.hand.get(targetSlotKey);
                      if (!cardSchema2) {
                        if (originalArea === "battlefield") {
                          cardSchema2 = myPlayer2.battlefield.get(originalSlotKey);
                        } else {
                          cardSchema2 = myPlayer2.hand.get(originalSlotKey);
                        }
                      }
                    }
                    if (cardSchema2 && cardSchema2.instanceId === instanceId) {
                      this.updateCardVisual(
                        ownerSessionId,
                        "hand",
                        targetSlotKey,
                        cardSchema2
                      );
                    }
                  }
                  dropped = true;
                  newAreaForServer = "hand";
                  newSlotKeyForServer = targetSlotKey;
                  if (this.currentPhase === Phase.Shop && (originalArea !== "hand" || originalSlotKey !== targetSlotKey)) {
                    colyseusRoom == null ? void 0 : colyseusRoom.send("moveCardInHand", {
                      instanceId,
                      fromSlotKey: originalSlotKey,
                      toSlotKey: targetSlotKey
                    });
                  }
                }
              }
              if (dropped) break;
            }
          }
        }
        if (!dropped && this.currentPhase === Phase.Preparation) {
          for (let i = 0; i < 5; i++) {
            const targetSlotKey = String(i);
            const slotPos = this.getSlotPixelPosition(true, "battlefield", i);
            if (slotPos) {
              const dropZone = new Phaser.Geom.Rectangle(
                slotPos.x - FULL_CARD_WIDTH / 2,
                slotPos.y - FULL_CARD_HEIGHT / 2,
                FULL_CARD_WIDTH,
                FULL_CARD_HEIGHT
              );
              if (Phaser.Geom.Rectangle.Contains(
                dropZone,
                cardContainer.x,
                cardContainer.y
              )) {
                if (this.isSlotEmpty(
                  ownerSessionId,
                  "battlefield",
                  targetSlotKey,
                  instanceId
                )) {
                  cardContainer.x = slotPos.x;
                  cardContainer.y = slotPos.y;
                  const areaChanged = originalArea !== "battlefield";
                  cardContainer.setData("area", "battlefield");
                  cardContainer.setData("slotKey", targetSlotKey);
                  this.updateVisualMaps(
                    ownerSessionId,
                    originalArea,
                    originalSlotKey,
                    "battlefield",
                    targetSlotKey,
                    cardContainer
                  );
                  if (areaChanged) {
                    const myPlayer2 = colyseusRoom == null ? void 0 : colyseusRoom.state.players.get(ownerSessionId);
                    const cardSchema2 = (myPlayer2 == null ? void 0 : myPlayer2.battlefield.get(targetSlotKey)) || (myPlayer2 == null ? void 0 : myPlayer2.hand.get(originalSlotKey));
                    if (cardSchema2 && cardSchema2.instanceId === instanceId) {
                      this.updateCardVisual(
                        ownerSessionId,
                        "battlefield",
                        targetSlotKey,
                        cardSchema2
                      );
                    }
                  }
                  dropped = true;
                  newAreaForServer = "battlefield";
                  newSlotKeyForServer = targetSlotKey;
                }
                break;
              }
            }
          }
        }
        if (!dropped) {
          cardContainer.x = cardContainer.getData("originalX");
          cardContainer.y = cardContainer.getData("originalY");
          cardContainer.setData("area", originalArea);
          cardContainer.setData("slotKey", originalSlotKey);
        } else {
          if (this.currentPhase === Phase.Preparation && newAreaForServer && newSlotKeyForServer) {
            if (originalArea !== newAreaForServer || originalSlotKey !== newSlotKeyForServer) {
              colyseusRoom == null ? void 0 : colyseusRoom.send("updatePrepLayout", {
                instanceId,
                newArea: newAreaForServer,
                newSlotKey: newSlotKeyForServer
              });
            }
          }
        }
        if (this.currentPhase === Phase.Preparation) {
          const prepScene = this.scene.get("Preparation");
          if (prepScene && prepScene.scene.isActive() && prepScene.updateStartButtonState) {
            prepScene.updateStartButtonState();
          }
        }
      }
    });
  }
  // Add the new getCardLayouts method
  getCardLayouts() {
    const handLayout = {};
    const battlefieldLayout = {};
    if (!colyseusRoom || !colyseusRoom.sessionId) {
      for (let i = 0; i < 5; i++) {
        handLayout[String(i)] = null;
        battlefieldLayout[String(i)] = null;
      }
      return { handLayout, battlefieldLayout };
    }
    const localPlayerId = colyseusRoom.sessionId;
    const playerVisuals = this.playerVisuals.get(localPlayerId);
    for (let i = 0; i < 5; i++) {
      const slotKey = String(i);
      if (playerVisuals && playerVisuals.hand.has(slotKey)) {
        const cardContainer = playerVisuals.hand.get(slotKey);
        handLayout[slotKey] = (cardContainer == null ? void 0 : cardContainer.getData("instanceId")) || null;
      } else {
        handLayout[slotKey] = null;
      }
      if (playerVisuals && playerVisuals.battlefield.has(slotKey)) {
        const cardContainer = playerVisuals.battlefield.get(slotKey);
        battlefieldLayout[slotKey] = (cardContainer == null ? void 0 : cardContainer.getData("instanceId")) || null;
      } else {
        battlefieldLayout[slotKey] = null;
      }
    }
    return { handLayout, battlefieldLayout };
  }
  isSlotEmpty(sessionId, area, slotKey, draggedInstanceId) {
    const playerVisuals = this.playerVisuals.get(sessionId);
    if (!playerVisuals) return false;
    const targetMap = area === "hand" ? playerVisuals.hand : playerVisuals.battlefield;
    const occupantCard = targetMap.get(slotKey);
    if (!occupantCard) return true;
    return occupantCard.getData("instanceId") === draggedInstanceId;
  }
  isDroppedOnSellZone(cardContainer) {
    if (!this.sellZone.visible) return false;
    const sellZoneBounds = new Phaser.Geom.Rectangle(
      this.sellZone.x - this.sellZoneRect.width / 2 - 20,
      this.sellZone.y - this.sellZoneRect.height / 2 - 20,
      this.sellZoneRect.width + 40,
      this.sellZoneRect.height + 40
    );
    return sellZoneBounds.contains(cardContainer.x, cardContainer.y);
  }
  showBrewGain(amount) {
    this.brewGainText.setText(`+${amount} 🍺`);
    this.brewGainText.setAlpha(1);
    this.brewGainText.y = -50;
    this.brewGainText.x = 0;
    this.tweens.add({
      targets: this.brewGainText,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 100,
      yoyo: true,
      ease: "Cubic.easeOut",
      onComplete: /* @__PURE__ */ __name(() => {
        this.tweens.add({
          targets: this.brewGainText,
          y: this.brewGainText.y - 80,
          alpha: 0,
          duration: 1500,
          ease: "Power2"
        });
      }, "onComplete")
    });
    this.tweens.add({
      targets: this.sellZoneRect,
      fillAlpha: 0.7,
      duration: 200,
      yoyo: true,
      repeat: 1,
      ease: "Cubic.easeOut"
    });
  }
  updateVisualMaps(sessionId, originalArea, originalSlotKey, newArea, newSlotKey, cardContainer) {
    const playerVisuals = this.playerVisuals.get(sessionId);
    if (!playerVisuals) return;
    const originalMap = originalArea === "hand" ? playerVisuals.hand : playerVisuals.battlefield;
    if (originalMap.get(originalSlotKey) === cardContainer) {
      originalMap.delete(originalSlotKey);
    }
    const newMap = newArea === "hand" ? playerVisuals.hand : playerVisuals.battlefield;
    newMap.set(newSlotKey, cardContainer);
  }
  getPlayerCardGameObjects(sessionId) {
    const cardObjects = [];
    const visuals = this.playerVisuals.get(sessionId);
    if (visuals) {
      visuals.hand.forEach((cardContainer) => cardObjects.push(cardContainer));
      visuals.battlefield.forEach(
        (cardContainer) => cardObjects.push(cardContainer)
      );
    }
    return cardObjects;
  }
  getLocalPlayerLayoutData() {
    const layoutData = [];
    if (!colyseusRoom || !colyseusRoom.sessionId) return layoutData;
    const localPlayerId = colyseusRoom.sessionId;
    const playerVisuals = this.playerVisuals.get(localPlayerId);
    if (playerVisuals) {
      playerVisuals.hand.forEach((cardContainer, slotKey) => {
        layoutData.push({
          instanceId: cardContainer.getData("instanceId"),
          area: "hand",
          slotKey: cardContainer.getData("slotKey")
          // Use the current data slotKey
        });
      });
      playerVisuals.battlefield.forEach((cardContainer, slotKey) => {
        layoutData.push({
          instanceId: cardContainer.getData("instanceId"),
          area: "battlefield",
          slotKey: cardContainer.getData("slotKey")
          // Use the current data slotKey
        });
      });
    }
    return layoutData;
  }
  createSellZone() {
    this.sellZone = this.add.container(
      this.cameras.main.width - 80,
      this.cameras.main.height / 2
    );
    this.sellZone.setDepth(1e3);
    this.sellZoneRect = this.add.rectangle(0, 0, 120, 160, 16711680, 0.3);
    this.sellZoneRect.setStrokeStyle(2, 16711680, 1);
    this.sellZone.add(this.sellZoneRect);
    this.sellZoneText = this.add.text(0, 0, "SELL", {
      fontFamily: "Arial Black",
      fontSize: 24,
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
      align: "center"
    }).setOrigin(0.5);
    this.sellZone.add(this.sellZoneText);
    this.brewGainText = this.add.text(0, -50, "", {
      // Positioned above sellZoneText
      fontFamily: "Arial Black",
      fontSize: 20,
      // Slightly smaller for preview
      color: "#ffff00",
      stroke: "#000000",
      strokeThickness: 3,
      align: "center"
    }).setOrigin(0.5).setAlpha(0);
    this.sellZone.add(this.brewGainText);
    const helperText = this.add.text(0, 50, "Drag cards here\nto sell", {
      fontFamily: "Arial",
      fontSize: 14,
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 2,
      align: "center"
    }).setOrigin(0.5);
    this.sellZone.add(helperText);
    this.input.on(
      "dragenter",
      (pointer, gameObject, dropZone) => {
        if (gameObject instanceof Phaser.GameObjects.Container && this.sellZone.visible && this.isDroppedOnSellZone(gameObject)) {
          this.sellZoneRect.setFillStyle(16711680, 0.5);
          this.sellZoneRect.setStrokeStyle(3, 16733525, 1);
        }
      }
    );
    this.input.on(
      "dragleave",
      (pointer, gameObject, dropZone) => {
        this.sellZoneRect.setFillStyle(16711680, 0.3);
        this.sellZoneRect.setStrokeStyle(2, 16711680, 1);
      }
    );
    this.input.on("drop", () => {
      this.sellZoneRect.setFillStyle(16711680, 0.3);
      this.sellZoneRect.setStrokeStyle(2, 16711680, 1);
    });
    this.sellZone.setVisible(false);
  }
  updateNavbarText() {
    if (!colyseusRoom || !colyseusRoom.state || !this.playerHealthText || !this.playerHealthText.active)
      return;
    const myPlayerId = colyseusRoom.sessionId;
    const myPlayerState = colyseusRoom.state.players.get(myPlayerId);
    let opponentState;
    let opponentName = "Opponent: --";
    colyseusRoom.state.players.forEach((player, sessionId) => {
      if (sessionId !== myPlayerId) {
        opponentState = player;
        opponentName = `Opponent: ${player.username || "Connecting..."}`;
      }
    });
    this.playerHealthText.setText(`You: ${(myPlayerState == null ? void 0 : myPlayerState.health) ?? "--"} HP`);
    this.playerBrewsText.setText(`Brews: ${(myPlayerState == null ? void 0 : myPlayerState.brews) ?? "--"}`);
    this.opponentUsernameText.setText(opponentName);
    this.opponentHealthText.setText(`${(opponentState == null ? void 0 : opponentState.health) ?? "--"} HP`);
    const day = colyseusRoom.state.currentDay;
    const phase = colyseusRoom.state.currentPhase;
    this.dayPhaseText.setText(`Day ${day} - ${phase}`);
  }
  cleanupListeners() {
    var _a3, _b2, _c2, _d2, _e2, _f2, _g2;
    console.log("BoardView: Cleaning up listeners.");
    this.listeners.forEach((unsub) => {
      if (typeof unsub === "function") {
        try {
          unsub();
        } catch (e) {
          console.warn("BoardView: Error cleaning up listener:", e);
        }
      }
    });
    this.listeners = [];
    this.cardSchemaListeners.forEach((unsubs, instanceId) => {
      console.log(
        `BoardView cleanup: Cleaning up ${unsubs.length} listeners for card instance ${instanceId}`
      );
      unsubs.forEach((unsub) => {
        if (typeof unsub === "function") {
          try {
            unsub();
          } catch (e) {
            console.warn(
              `BoardView: Error unsubscribing card listener for ${instanceId}`,
              e
            );
          }
        }
      });
    });
    this.cardSchemaListeners.clear();
    this.playerVisuals.forEach((areas) => {
      areas.hand.forEach((container) => container.destroy());
      areas.battlefield.forEach((container) => container.destroy());
    });
    this.playerVisuals.clear();
    (_a3 = this.playerHealthText) == null ? void 0 : _a3.destroy();
    (_b2 = this.opponentHealthText) == null ? void 0 : _b2.destroy();
    (_c2 = this.playerBrewsText) == null ? void 0 : _c2.destroy();
    (_d2 = this.dayPhaseText) == null ? void 0 : _d2.destroy();
    (_e2 = this.opponentUsernameText) == null ? void 0 : _e2.destroy();
    (_f2 = this.sellZone) == null ? void 0 : _f2.destroy();
    (_g2 = this.brewGainText) == null ? void 0 : _g2.destroy();
    this.input.off("dragenter");
    this.input.off("dragleave");
    this.input.off("drop");
  }
  shutdown() {
    console.log("BoardView shutting down...");
    this.cleanupListeners();
    this.events.off(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }
};
__name(_BoardView, "BoardView");
let BoardView = _BoardView;
(async () => {
  await initiateDiscordSDK();
  new ScaleFlow({
    type: Phaser.AUTO,
    parent: "gameParent",
    width: 1280,
    height: 720,
    backgroundColor: "#000000",
    roundPixels: false,
    pixelArt: false,
    scene: [Boot, Preloader, MainMenu, Lobby, Shop, Preparation, Battle, BoardView, Game, Background]
    // Added BoardView
  });
})();

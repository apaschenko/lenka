"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Results = exports.CustomizerParams = exports.MISSING = exports.BY_DEFAULT = void 0;
var service_1 = require("./service");
Object.defineProperty(exports, "BY_DEFAULT", { enumerable: true, get: function () { return service_1.BY_DEFAULT; } });
Object.defineProperty(exports, "MISSING", { enumerable: true, get: function () { return service_1.MISSING; } });
Object.defineProperty(exports, "CustomizerParams", { enumerable: true, get: function () { return service_1.CustomizerParams; } });
Object.defineProperty(exports, "Results", { enumerable: true, get: function () { return service_1.Results; } });
__exportStar(require("./engine"), exports);
__exportStar(require("./what_is_it"), exports);
__exportStar(require("./is_it_the_same_as"), exports);

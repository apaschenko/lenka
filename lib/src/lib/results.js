"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LResults = void 0;
class LResults {
    constructor(summary) {
        this.setByLabel = this._setByLabel.bind(this);
        this.deleteByLabel = this._deleteByLabel.bind(this);
        this._summary = summary;
    }
    get accumulator() {
        return this._summary.accumulator;
    }
    // deprecated
    get options() {
        return this._summary.finalCloneOptions;
    }
    get cloneOptions() {
        return this._summary.finalCloneOptions;
    }
    get combineOptions() {
        return this._summary.finalCombineOptions;
    }
    get result() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this._summary.result;
    }
    _deleteByLabel(label) {
        return this._summary.deleteByLabel(label);
    }
    _setByLabel(label, rawData) {
        return this._summary.setByLabel(label, rawData);
    }
}
exports.LResults = LResults;

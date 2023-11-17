"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombineParams = void 0;
const general_types_1 = require("./general_types");
const combine_source_1 = require("./combine_source");
const node_1 = require("./node");
const child_1 = require("./child");
class CombineParams {
    constructor(summary, nodes) {
        this._summary = summary;
        this._nodes = nodes;
        // eslint-disable-next-line @typescript-eslint/no-this-alias, unicorn/no-this-assignment
        const combineParams = this;
        this._combineSources = nodes.map((node) => { return new combine_source_1.CombineSource(node, combineParams); });
        this._result = node_1.LenkaNode.emptyChildrenSet(() => {
            return new Map();
        });
    }
    addChild(child, producedAs) {
        const resultTyped = this._result[producedAs || child.producedAs];
        if (resultTyped.has(child.key)) {
            resultTyped.get(child.key).push(child);
        }
        else {
            resultTyped.set(child.key, [child]);
        }
        return child.label;
    }
    getNextLabel() {
        return this._summary.getAndIncreaceLabel();
    }
    selectBase(combineSource) {
        if (this._selectedBase) {
            throw new TypeError('You are trying to select a combine base twice, but ' +
                'you should only select a base once during each iteration.');
        }
        this._selectedBase = combineSource;
        this._nodes[combineSource.index].createInstance();
        this._nodes[combineSource.index].linkTargetToParent();
        if (combineSource.level === 0) {
            this._summary.selectRootByIndex(combineSource.index);
        }
    }
    postCheck() {
        if (!this._selectedBase) {
            throw new TypeError(`The combine base hasn't been selected, but ` +
                'you should only select a base once during each iteration.');
        }
    }
    get bases() {
        return this._combineSources;
    }
    get selectedBase() {
        return this._selectedBase;
    }
    get result() {
        return this._result;
    }
    // eslint-disable-next-line sonarjs/cognitive-complexity
    get scheme() {
        if (!this._scheme) {
            this._scheme = node_1.LenkaNode.emptyChildrenSet(() => {
                return new Map();
            });
            for (const producedAs of general_types_1.ProducedAsIntSet) {
                const schemeTyped = this._scheme[producedAs];
                for (const parentNode of this._nodes) {
                    for (const producedBy of parentNode.childrenKeys[producedAs].values()) {
                        const child = new child_1.LenkaChild({ combineParams: this, producedBy, producedAs, parentNode });
                        if (schemeTyped.has(producedBy)) {
                            schemeTyped.get(producedBy).push(child);
                        }
                        else {
                            schemeTyped.set(producedBy, [child]);
                        }
                    }
                }
            }
        }
        return this._scheme;
    }
    _createChild(child) {
        return this._nodes[child.index].createChild(child.key, child.producedAs, this._nodes[this.selectedBase.index]);
    }
}
exports.CombineParams = CombineParams;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LCoverage = exports.PredefActCoverSet = void 0;
const ifaces_1 = require("./ifaces");
const utils_1 = require("./utils");
const notVocabulary = '!vocabulary';
const notPrimitive = '!primitive';
exports.PredefActCoverSet = [
    'array', '!array', 'map', '!map', 'object', '!object', 'set', '!set',
    'boolean', '!boolean', 'undefined', '!undefined', 'symbol', '!symbol', 'string', '!string', 'number', '!number',
    'bigint', '!bigint', 'null', '!null',
    'collection', '!collection', 'primitive', notPrimitive, 'vocabulary', notVocabulary, 'all', '*',
];
const primitiveTypeChecker = (combineSource) => combineSource._isPrimitive;
const vocabularyTypeChecker = (combineSource) => !combineSource._isPrimitive;
class LCoverage {
    constructor() {
        this._typeCheckers = {
            all: () => true,
            '*': () => true,
            primitive: primitiveTypeChecker,
            [notPrimitive]: vocabularyTypeChecker,
            vocabulary: vocabularyTypeChecker,
            [notVocabulary]: primitiveTypeChecker,
        };
        this.buildExtendedCoverage();
        this.buildTypeCheckers();
    }
    buildCoverage(coverage, maximalCoverage, errorData) {
        const firstSource = 'first source';
        const secondSource = 'second source';
        if (Array.isArray(coverage)) {
            if (coverage.length !== 2) {
                throw new TypeError(`Invalid "${errorData.paramsName}" ${errorData.paramsType} description. ` +
                    `When ${errorData.paramsType}'s coverage is specified as an array, that array must contains exactly ` +
                    'two elements: coverages for the first and second parameters.');
            }
            return coverage.map((item, index) => {
                return this.validateAndBuildCoverConds(item, maximalCoverage[index], Object.assign(Object.assign({}, errorData), { place: index === 0 ? firstSource : secondSource }));
            });
        }
        else {
            return [
                this.validateAndBuildCoverConds(coverage, maximalCoverage[0], Object.assign(Object.assign({}, errorData), { place: firstSource })),
                this.validateAndBuildCoverConds(coverage, maximalCoverage[1], Object.assign(Object.assign({}, errorData), { place: secondSource })),
            ];
        }
    }
    validateAndBuildCoverConds(actionCoverage, allowedTypes, errorData) {
        const resultTypeCheckers = [];
        switch (typeof actionCoverage) {
            case 'function':
                resultTypeCheckers.push(actionCoverage);
                break;
            case 'string':
                // eslint-disable-next-line no-case-declarations
                const resultCoverageArr = actionCoverage.replace(/[\t\n\v\r ]/g, '')
                    .toLowerCase()
                    .split(',')
                    .filter((item) => item.length > 0);
                if (resultCoverageArr.length === 0) {
                    throw new TypeError(`Coverage declaration for the "${errorData.place}" of "${errorData.paramsName}"` +
                        `${errorData.paramsType} does not contain any types.`);
                }
                for (const type of resultCoverageArr) {
                    if (this._extendedCoverage[type]) {
                        if (allowedTypes.has(type)) {
                            resultTypeCheckers.push(this._typeCheckers[type]);
                        }
                        else {
                            this.buildAndThrowError(`"${errorData.paramsName}" ${errorData.paramsType} is not defined for the "${type}" type ` +
                                `as ${errorData.place}. `, allowedTypes);
                        }
                    }
                    else {
                        this.buildAndThrowError(`Unknown type "${type}" as ${errorData.place} of "${errorData.paramsName}" ${errorData.paramsType}. `, allowedTypes);
                    }
                }
                break;
            default:
                throw new TypeError(`Invalid "${errorData.paramsName}" ${errorData.paramsType} description. The coverage can't be a ` +
                    `${typeof actionCoverage}. It must be either a function or a string representing one of the preset values (${(0, utils_1.quotedListFromArray)(ifaces_1.PredefinedActorsSet)}).`);
        }
        return resultTypeCheckers;
    }
    getExtendedListToErrorDescr(types) {
        const result = new Set(...types);
        for (const [typeName, extendedSet] of Object.entries(this._extendedCoverage)) {
            if ([...extendedSet].every((type) => types.has(type))) {
                result.add(typeName);
            }
        }
        return [...result];
    }
    checkType(combineSource, type) {
        return this._typeCheckers[type](combineSource);
    }
    extendType(type) {
        return this._extendedCoverage[type];
    }
    buildAndThrowError(error, allowedTypes) {
        throw new TypeError(error + `Possible values for this parameter are function or string which contains comma separated list of ${(0, utils_1.quotedListFromArray)(this.getExtendedListToErrorDescr(allowedTypes))} in any combinations.`);
    }
    buildExtendedCoverage() {
        const extendCollection = new Set(['set', 'array', 'collection']);
        const extendPrimitive = new Set([
            'boolean', 'undefined', 'symbol', 'string', 'number', 'bigint', 'null', notVocabulary
        ]);
        const extendAll = new Set(exports.PredefActCoverSet);
        this._extendedCoverage = {
            collection: extendCollection,
            primitive: extendPrimitive,
            all: extendAll,
            '*': extendAll,
        };
        this._extendedCoverage['!collection'] = this.inverseCoverageExtender(extendCollection);
        this._extendedCoverage[notPrimitive] = this.inverseCoverageExtender(extendPrimitive);
        this._extendedCoverage.vocabulary = this._extendedCoverage[notPrimitive];
        this._extendedCoverage[notVocabulary] = this._extendedCoverage.primitive;
        for (const type of exports.PredefActCoverSet) {
            if (!this._extendedCoverage[type]) {
                this._extendedCoverage[type] = new Set([type]);
            }
        }
    }
    buildTypeCheckers() {
        for (const inputType of exports.PredefActCoverSet) {
            const resultDirectType = this._extendedCoverage[inputType];
            if (!this._typeCheckers[inputType]) {
                this._typeCheckers[inputType] = inputType.startsWith('!')
                    ? this.standardTypeChecker.bind(this, this.inverseCoverageExtender(resultDirectType))
                    : this.standardTypeChecker.bind(this, resultDirectType);
            }
        }
    }
    inverseCoverageExtender(types) {
        const result = new Set(exports.PredefActCoverSet);
        for (const type of types.values()) {
            result.delete(type);
            for (const [typeName, extendedType] of Object.entries(this._extendedCoverage)) {
                if (extendedType.has(type)) {
                    result.delete(typeName);
                }
            }
        }
        return result;
    }
    standardTypeChecker(coverageSet, source) {
        return coverageSet.has(source._internalType);
    }
}
exports.LCoverage = LCoverage;

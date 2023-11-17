import { LCombineParams, LSummary, LNode, CombineChildren, LChild, ChildrenList } from './ifaces';
import { ProducedAs, ProducedAsInt, ProducedAsIntSet } from './general_types';
import { CombineSource } from './combine_source';
import { LenkaNode } from './node';
import { LenkaChild } from './child';

export class CombineParams implements LCombineParams {
  constructor(summary: LSummary, nodes: LNode[]) {
    this._summary = summary;
    this._nodes = nodes;
    // eslint-disable-next-line @typescript-eslint/no-this-alias, unicorn/no-this-assignment
    const combineParams = this;
    this._combineSources = nodes.map((node) => { return new CombineSource(node, combineParams); });

    this._result = LenkaNode.emptyChildrenSet<ChildrenList>(() => {
      return new Map();
    });
  }

  addChild(child: LenkaChild, producedAs?: ProducedAs) {
    const resultTyped: CombineChildren[ProducedAsInt] = this._result[producedAs || child.producedAs];

    if (resultTyped.has(child.key)) {
      resultTyped.get(child.key).push(child);
    } else {
      resultTyped.set(child.key, [child]);
    }

    return child.label;
  }

  getNextLabel() {
    return this._summary.getAndIncreaceLabel();
  }

  selectBase(combineSource: CombineSource) {
    if (this._selectedBase) {
      throw new TypeError(
        'You are trying to select a combine base twice, but ' +
        'you should only select a base once during each iteration.'
      );
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
      throw new TypeError(
        `The combine base hasn't been selected, but ` +
        'you should only select a base once during each iteration.'
      );
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
      this._scheme = LenkaNode.emptyChildrenSet<ChildrenList>(() => {
        return new Map();
      });

      for (const producedAs of ProducedAsIntSet) {
        const schemeTyped = this._scheme[producedAs];
  
        for (const parentNode of this._nodes) {
          for (const producedBy of parentNode.childrenKeys[producedAs].values()) {
            const child = new LenkaChild({ combineParams: this, producedBy, producedAs, parentNode });
  
            if (schemeTyped.has(producedBy)) {
              schemeTyped.get(producedBy).push(child);
            } else {
              schemeTyped.set(producedBy, [child]);
            }
          }
        }
      }
    }

    return this._scheme;
  }

  _createChild(child: LChild) {
    return this._nodes[child.index].createChild(child.key, child.producedAs, this._nodes[this.selectedBase.index]);
  }

  private _nodes: LNode[];

  private _combineSources: CombineSource[];

  private _summary: LSummary;

  private _selectedBase: CombineSource;

  private _scheme: CombineChildren;

  private _result: CombineChildren;
}

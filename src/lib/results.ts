import { LSummary } from './ifaces';

export class LResults {
  constructor(summary: LSummary) {
    this._summary = summary;
  }

  setByLabel: (label: number, value: any) => void = this._setByLabel.bind(this);

  deleteByLabel: (label: number) => void = this._deleteByLabel.bind(this);

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

  private _deleteByLabel(label: number): void {
    return this._summary.deleteByLabel(label);
  }

  private _setByLabel(label: number, rawData: unknown): void {
    return this._summary.setByLabel(label, rawData);
  }

  private _summary: LSummary;
}
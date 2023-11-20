import { expect } from 'chai';

import { combine } from '../../../src';

describe('===== combine [actor "diff"] =====', () => {
  it(`Successful run with default params: objects`, () => {
    const firstSource = { a: 'aa', b: 1, c: 'cc' };
    const secondSource = { b: 2, d: 'dd' };
    const expectedResult = { a: 'aa', c: 'cc' };

    const result = combine(firstSource, secondSource, {
      actions: [
        {
          coverage: 'vocabulary',
          actor: 'diff',
        },
      ],
    });
    expect(result).deep.equals(expectedResult);
    expect(result).to.not.equal(firstSource);
    expect(result).to.not.equal(secondSource);
  });


});

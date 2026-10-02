const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calculate } = require('./calculator.js');

test('arithmetic, precedence, parentheses, decimals and scientific notation', () => {
  for (const [input, expected] of [
    ['1+2', 3], ['10−3', 7], ['4×5', 20], ['12÷4', 3],
    ['2+3*4', 14], ['(2+3)*4', 20], ['8/4/2', 1], ['8-4-2', 2],
    ['-3*-2', 6], ['2--3', 5], ['-(2+3)', -5], ['.5+1.25', 1.75],
    ['0.1+0.2', 0.3], ['1e-7*10', 0.000001], [' 1 + ( 2 * 3 ) ', 7],
    ['((2+3)*(4-1))/5', 3], ['-0', 0], ['1/3', 0.333333333333333]
  ]) assert.equal(calculate(input), expected, input);
});
test('rejects zero divisors, malformed expressions, overflow and code', () => {
  for (const input of ['', '1/0', '0/0', '2/(3-3)', '1+', '(2+3', '2+3)', '2(3)', '1..2', '1 2', '2**3', 'alert(1)', '1;2', 'Infinity', '1e309', '9'.repeat(201)]) {
    assert.throws(() => calculate(input), undefined, input);
  }
});

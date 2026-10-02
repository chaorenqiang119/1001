(function (root) {
  'use strict';
  function calculate(expression) {
    const source = String(expression).replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    if (source.length > 200) throw new Error('表达式太长了');
    let position = 0;
    function skip() { while (/\s/.test(source[position] || '') && position < source.length) position++; }
    function take(character) {
      skip();
      if (source[position] === character) { position++; return true; }
      return false;
    }
    function primary() {
      if (take('(')) {
        const value = sum();
        if (!take(')')) throw new Error('缺少右括号');
        return value;
      }
      skip();
      const match = source.slice(position).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
      if (!match) throw new Error('请输入完整的算式');
      position += match[0].length;
      return Number(match[0]);
    }
    function unary() {
      if (take('+')) return unary();
      if (take('-')) return -unary();
      return primary();
    }
    function product() {
      let value = unary();
      while (true) {
        if (take('*')) value *= unary();
        else if (take('/')) {
          const divisor = unary();
          if (divisor === 0) throw new Error('不能除以 0');
          value /= divisor;
        } else return value;
      }
    }
    function sum() {
      let value = product();
      while (true) {
        if (take('+')) value += product();
        else if (take('-')) value -= product();
        else return value;
      }
    }
    if (!source.trim()) throw new Error('请先输入算式');
    const value = sum();
    skip();
    if (position !== source.length) throw new Error('算式格式不正确，请检查运算符');
    if (!Number.isFinite(value)) throw new Error('结果超出计算范围');
    return Object.is(value, -0) ? 0 : Number(value.toPrecision(15));
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { calculate };
  else root.Calculator = { calculate };
})(typeof globalThis !== 'undefined' ? globalThis : this);

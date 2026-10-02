'use strict';
const input = document.querySelector('#expression');
const result = document.querySelector('#result');
const feedback = document.querySelector('#feedback');
const historyList = document.querySelector('#history-list');
const storageKey = 'jiansuan.history.v1';
let history = [];
let finished = false;
let lastAnswer = '0';
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (Array.isArray(saved)) history = saved.filter(item => item && typeof item.expression === 'string' && item.expression.length <= 200 && typeof item.result === 'string' && item.result.length <= 30 && /^-?\d+(\.\d+)?(e[+-]?\d+)?$/i.test(item.result) && Number.isFinite(Number(item.result))).slice(0, 20);
} catch { /* Storage may be disabled or contain invalid data. */ }

function message(text, error = false) {
  feedback.textContent = text;
  feedback.classList.toggle('error', error);
  input.setAttribute('aria-invalid', String(error));
}
function saveHistory() {
  try { localStorage.setItem(storageKey, JSON.stringify(history)); } catch { /* The calculator still works without storage. */ }
}
function renderHistory() {
  historyList.replaceChildren();
  document.querySelector('#history-count').textContent = history.length;
  document.querySelector('#clear-history').disabled = history.length === 0;
  if (!history.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-history';
    const icon = document.createElement('span');
    icon.textContent = '=';
    icon.setAttribute('aria-hidden', 'true');
    empty.append(icon, '你的计算，会记录在这里');
    historyList.append(empty);
  }
  for (const item of history) {
    const button = document.createElement('button');
    button.className = 'history-item';
    button.setAttribute('aria-label', `${item.expression} 等于 ${item.result}，使用此结果`);
    const expression = document.createElement('small');
    const answer = document.createElement('strong');
    expression.textContent = item.expression + ' =';
    answer.textContent = item.result;
    button.append(expression, answer);
    button.addEventListener('click', () => {
      input.value = item.result;
      result.textContent = item.result;
      lastAnswer = item.result;
      finished = true;
      message('已载入历史结果，可继续运算');
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    });
    historyList.append(button);
  }
}
function clear() {
  input.value = '';
  result.textContent = '0';
  finished = false;
  message('准备好了，开始计算吧');
  input.focus();
}
function insert(value) {
  if (finished && input.selectionStart === input.selectionEnd && input.selectionEnd === input.value.length) {
    input.value = /^[+−×÷*/-]$/.test(value) ? lastAnswer : '';
  }
  const start = input.selectionStart;
  const end = input.selectionEnd;
  if (input.value.length - (end - start) + value.length > 200) { message('表达式最多 200 个字符', true); return; }
  input.setRangeText(value, start, end, 'end');
  finished = false;
  message('按 Enter 或 = 计算');
  input.focus();
}
function backspace() {
  const start = input.selectionStart;
  const end = input.selectionEnd;
  input.setRangeText('', start === end ? Math.max(0, start - 1) : start, end, 'end');
  finished = false;
  message('按 Enter 或 = 计算');
  input.focus();
}
function evaluate() {
  try {
    const expression = input.value.trim();
    lastAnswer = String(Calculator.calculate(expression));
    result.textContent = lastAnswer;
    if (!history.length || history[0].expression !== expression || history[0].result !== lastAnswer) {
      history.unshift({ expression, result: lastAnswer });
      history = history.slice(0, 20);
      saveHistory();
      renderHistory();
    }
    finished = true;
    message('已完成 · 输入运算符可继续计算');
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  } catch (error) {
    result.textContent = '—';
    finished = false;
    message(error.message, true);
    input.focus();
  }
}
document.querySelector('.keypad').addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.value !== undefined) insert(button.dataset.value);
  else if (button.dataset.action === 'clear') clear();
  else if (button.dataset.action === 'backspace') backspace();
  else evaluate();
});
input.addEventListener('input', () => { finished = false; message('按 Enter 或 = 计算'); });
document.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
  if (event.target.closest('button') && (event.key === 'Enter' || event.key === ' ')) return;
  if (event.key === 'Enter' || event.key === '=') { event.preventDefault(); evaluate(); }
  else if (event.key === 'Escape') { event.preventDefault(); clear(); }
  else if (event.key === 'Backspace') { event.preventDefault(); backspace(); }
  else if (/^[0-9.+\-*/()×÷−]$/.test(event.key)) {
    event.preventDefault();
    insert(event.key === '*' ? '×' : event.key === '/' ? '÷' : event.key);
  }
});
document.querySelector('#clear-history').addEventListener('click', () => { history = []; saveHistory(); renderHistory(); });
renderHistory();

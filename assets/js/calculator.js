/* ==========================================================================
   CALCULATOR LOQUINARIO - Interactive JavaScript Engine
   Features: Arithmetic, Percentage, Backspace, Division by Zero handling,
   Web Audio API click feedback, and keyboard event bindings.
   ========================================================================== */

class CalculatorLoquinario {
  constructor(screenHistoryEl, screenResultEl) {
    this.historyEl = screenHistoryEl;
    this.resultEl = screenResultEl;
    this.currentInput = '0';
    this.expression = '';
    this.resetNext = false;
    this.audioCtx = null;
    this.init();
  }

  init() {
    this.updateDisplay();
    this.bindKeyboard();
  }

  // Soft haptic click sound using Web Audio API (Zero external assets needed)
  playClickSound(freq = 440) {
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) this.audioCtx = new AudioContext();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      if (this.audioCtx) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.05);
      }
    } catch (e) {
      // Audio not supported or blocked, fail silently
    }
  }

  inputDigit(digit) {
    this.playClickSound(520);
    if (this.resetNext || this.currentInput === 'Error') {
      this.currentInput = digit;
      this.resetNext = false;
      this.resultEl.classList.remove('error-state');
    } else {
      this.currentInput = this.currentInput === '0' ? digit : this.currentInput + digit;
    }
    this.updateDisplay();
  }

  inputDecimal() {
    this.playClickSound(600);
    if (this.resetNext || this.currentInput === 'Error') {
      this.currentInput = '0.';
      this.resetNext = false;
      this.resultEl.classList.remove('error-state');
    } else if (!this.currentInput.includes('.')) {
      this.currentInput += '.';
    }
    this.updateDisplay();
  }

  inputOperator(op) {
    this.playClickSound(700);
    if (this.currentInput === 'Error') {
      this.clearAll();
      return;
    }

    const opSymbol = op === '*' ? '×' : op === '/' ? '÷' : op;

    if (this.expression && this.resetNext) {
      // Replace last operator
      this.expression = this.expression.slice(0, -1) + opSymbol;
    } else {
      this.expression += (this.currentInput + opSymbol);
      this.resetNext = true;
    }
    this.updateDisplay();
  }

  handlePercent() {
    this.playClickSound(650);
    if (this.currentInput === 'Error') return;
    const val = parseFloat(this.currentInput);
    if (!isNaN(val)) {
      this.currentInput = (val / 100).toString();
      this.updateDisplay();
    }
  }

  backspace() {
    this.playClickSound(400);
    if (this.currentInput === 'Error' || this.resetNext) {
      this.currentInput = '0';
      this.resetNext = false;
      this.resultEl.classList.remove('error-state');
    } else {
      this.currentInput = this.currentInput.length > 1 ? this.currentInput.slice(0, -1) : '0';
    }
    this.updateDisplay();
  }

  clearAll() {
    this.playClickSound(350);
    this.currentInput = '0';
    this.expression = '';
    this.resetNext = false;
    this.resultEl.classList.remove('error-state');
    this.updateDisplay();
  }

  calculate() {
    this.playClickSound(800);
    if (this.currentInput === 'Error') return;

    const fullExpr = this.expression + this.currentInput;
    if (!fullExpr) return;

    // Convert display operators to JS operators
    const sanitized = fullExpr.replace(/×/g, '*').replace(/÷/g, '/');

    // Check for division by zero
    if (/\/0(?![.\d])/.test(sanitized)) {
      this.historyEl.textContent = fullExpr;
      this.currentInput = 'Error';
      this.resultEl.classList.add('error-state');
      this.expression = '';
      this.resetNext = true;
      this.updateDisplay(false);
      return;
    }

    try {
      // Safely evaluate math expression without eval
      const result = this.safeEval(sanitized);
      if (!isFinite(result) || isNaN(result)) {
        throw new Error('Math Error');
      }

      this.historyEl.textContent = fullExpr;
      // Round to 8 decimal places if needed to avoid floating point anomalies
      const formattedResult = Number(Math.round(result + 'e8') + 'e-8').toString();
      this.currentInput = formattedResult;
      this.expression = '';
      this.resetNext = true;
      this.resultEl.classList.remove('error-state');
      this.updateDisplay(false);
    } catch (err) {
      this.historyEl.textContent = fullExpr;
      this.currentInput = 'Error';
      this.resultEl.classList.add('error-state');
      this.expression = '';
      this.resetNext = true;
      this.updateDisplay(false);
    }
  }

  safeEval(str) {
    // Only allow digits, operators, dots, parens
    if (!/^[\d\s+\-*/.()]+$/.test(str)) {
      throw new Error('Invalid Input');
    }
    // Using Function as safe sandboxed arithmetic evaluator
    return Function(`'use strict'; return (${str})`)();
  }

  updateDisplay(updateHistory = true) {
    this.resultEl.textContent = this.currentInput;
    if (updateHistory) {
      this.historyEl.textContent = this.expression;
    }
  }

  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Check if user is typing in a form input/textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        this.inputDigit(e.key);
      } else if (e.key === '.') {
        this.inputDecimal();
      } else if (e.key === '+') {
        this.inputOperator('+');
      } else if (e.key === '-') {
        this.inputOperator('-');
      } else if (e.key === '*' || e.key === 'x') {
        this.inputOperator('*');
      } else if (e.key === '/') {
        e.preventDefault();
        this.inputOperator('/');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        this.calculate();
      } else if (e.key === 'Backspace') {
        this.backspace();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        this.clearAll();
      }
    });
  }
}

// Global initialization helper
window.initCalculatorLoquinario = function() {
  const historyEl = document.getElementById('calcHistory');
  const resultEl = document.getElementById('calcResult');
  if (historyEl && resultEl) {
    window.calcInstance = new CalculatorLoquinario(historyEl, resultEl);

    // Attach click listeners to all data-calc-action buttons
    const buttons = document.querySelectorAll('[data-calc-action]');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-calc-action');
        const val = btn.getAttribute('data-calc-val');

        if (action === 'digit') {
          window.calcInstance.inputDigit(val);
        } else if (action === 'operator') {
          window.calcInstance.inputOperator(val);
        } else if (action === 'decimal') {
          window.calcInstance.inputDecimal();
        } else if (action === 'equals') {
          window.calcInstance.calculate();
        } else if (action === 'clear') {
          window.calcInstance.clearAll();
        } else if (action === 'backspace') {
          window.calcInstance.backspace();
        } else if (action === 'percent') {
          window.calcInstance.handlePercent();
        }
      });
    });
  }
};

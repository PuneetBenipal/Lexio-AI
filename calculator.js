// Calculator Class for Lexio AI
class Calculator {
    constructor() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.history = JSON.parse(localStorage.getItem('calculatorHistory')) || [];
        this.displayElement = document.getElementById('display');
        this.historyElement = document.getElementById('history');
        this.historyListElement = document.getElementById('historyList');
        
        this.updateDisplay();
        this.updateHistoryDisplay();
    }

    // Input number
    inputNumber(num) {
        if (this.waitingForOperand) {
            this.currentInput = num;
            this.waitingForOperand = false;
        } else {
            this.currentInput = this.currentInput === '0' ? num : this.currentInput + num;
        }
        this.updateDisplay();
    }

    // Input decimal point
    inputDecimal() {
        if (this.waitingForOperand) {
            this.currentInput = '0.';
            this.waitingForOperand = false;
        } else if (this.currentInput.indexOf('.') === -1) {
            this.currentInput += '.';
        }
        this.updateDisplay();
    }

    // Input operator
    inputOperator(nextOperator) {
        const inputValue = parseFloat(this.currentInput);

        if (this.previousInput === '') {
            this.previousInput = inputValue;
        } else if (this.operator) {
            const currentValue = this.previousInput || 0;
            const newValue = this.performCalculation(currentValue, inputValue, this.operator);

            this.currentInput = String(newValue);
            this.previousInput = newValue;
        }

        this.waitingForOperand = true;
        this.operator = nextOperator;
        this.updateHistoryDisplay();
    }

    // Perform calculation
    performCalculation(firstOperand, secondOperand, operator) {
        switch (operator) {
            case '+':
                return firstOperand + secondOperand;
            case '-':
                return firstOperand - secondOperand;
            case '*':
                return firstOperand * secondOperand;
            case '/':
                return secondOperand !== 0 ? firstOperand / secondOperand : 0;
            default:
                return secondOperand;
        }
    }

    // Calculate result
    calculate() {
        const inputValue = parseFloat(this.currentInput);

        if (this.previousInput !== '' && this.operator) {
            const newValue = this.performCalculation(this.previousInput, inputValue, this.operator);
            
            // Add to history
            const expression = `${this.previousInput} ${this.getOperatorSymbol(this.operator)} ${inputValue}`;
            this.addToHistory(expression, newValue);
            
            this.currentInput = String(newValue);
            this.previousInput = '';
            this.operator = null;
            this.waitingForOperand = true;
        }

        this.updateDisplay();
        this.updateHistoryDisplay();
    }

    // Get operator symbol for display
    getOperatorSymbol(operator) {
        switch (operator) {
            case '+': return '+';
            case '-': return '−';
            case '*': return '×';
            case '/': return '÷';
            default: return operator;
        }
    }

    // Scientific functions
    inputFunction(func) {
        const inputValue = parseFloat(this.currentInput);
        let result;
        let expression;

        switch (func) {
            case 'sqrt':
                result = Math.sqrt(inputValue);
                expression = `√${inputValue}`;
                break;
            case 'pow':
                result = Math.pow(inputValue, 2);
                expression = `${inputValue}²`;
                break;
            case 'sin':
                result = Math.sin(inputValue * Math.PI / 180);
                expression = `sin(${inputValue})`;
                break;
            case 'cos':
                result = Math.cos(inputValue * Math.PI / 180);
                expression = `cos(${inputValue})`;
                break;
            case 'tan':
                result = Math.tan(inputValue * Math.PI / 180);
                expression = `tan(${inputValue})`;
                break;
            case 'log':
                result = Math.log10(inputValue);
                expression = `log(${inputValue})`;
                break;
            case 'ln':
                result = Math.log(inputValue);
                expression = `ln(${inputValue})`;
                break;
            default:
                return;
        }

        // Add to history
        this.addToHistory(expression, result);
        
        this.currentInput = String(result);
        this.waitingForOperand = true;
        this.updateDisplay();
        this.updateHistoryDisplay();
    }

    // Input constants
    inputConstant(constant) {
        switch (constant) {
            case 'pi':
                this.currentInput = String(Math.PI);
                break;
            case 'e':
                this.currentInput = String(Math.E);
                break;
        }
        this.waitingForOperand = true;
        this.updateDisplay();
    }

    // Toggle sign
    toggleSign() {
        if (this.currentInput !== '0') {
            this.currentInput = this.currentInput.charAt(0) === '-' 
                ? this.currentInput.slice(1) 
                : '-' + this.currentInput;
        }
        this.updateDisplay();
    }

    // Clear all
    clear() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.updateDisplay();
        this.updateHistoryDisplay();
    }

    // Clear entry
    clearEntry() {
        this.currentInput = '0';
        this.updateDisplay();
    }

    // Backspace
    backspace() {
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
        this.updateDisplay();
    }

    // Add calculation to history
    addToHistory(expression, result) {
        const historyItem = {
            expression: expression,
            result: this.formatNumber(result),
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.history.unshift(historyItem);
        
        // Keep only last 50 calculations
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }
        
        // Save to localStorage
        localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
    }

    // Clear history
    clearHistory() {
        this.history = [];
        localStorage.removeItem('calculatorHistory');
        this.updateHistoryDisplay();
    }

    // Format number for display
    formatNumber(num) {
        if (isNaN(num) || !isFinite(num)) {
            return 'Error';
        }
        
        // Round to 10 decimal places to avoid floating point errors
        const rounded = Math.round(num * 10000000000) / 10000000000;
        
        // Format with appropriate decimal places
        if (rounded % 1 === 0) {
            return rounded.toString();
        } else {
            return rounded.toString();
        }
    }

    // Update main display
    updateDisplay() {
        this.displayElement.textContent = this.formatNumber(parseFloat(this.currentInput));
    }

    // Update history display in calculator
    updateHistoryDisplay() {
        if (this.previousInput !== '' && this.operator) {
            this.historyElement.textContent = `${this.previousInput} ${this.getOperatorSymbol(this.operator)}`;
        } else {
            this.historyElement.textContent = '';
        }
        
        // Update history list
        if (this.history.length === 0) {
            this.historyListElement.innerHTML = '<p class="no-history">No calculations yet</p>';
        } else {
            this.historyListElement.innerHTML = this.history.map(item => `
                <div class="history-item" onclick="calculator.useHistoryResult('${item.result}')">
                    <div class="history-expression">${item.expression}</div>
                    <div class="history-result">${item.result}</div>
                </div>
            `).join('');
        }
    }

    // Use result from history
    useHistoryResult(result) {
        this.currentInput = result;
        this.waitingForOperand = true;
        this.updateDisplay();
    }

    // Keyboard support
    handleKeyPress(event) {
        const key = event.key;
        
        if (key >= '0' && key <= '9') {
            this.inputNumber(key);
        } else if (key === '.') {
            this.inputDecimal();
        } else if (key === '+' || key === '-' || key === '*' || key === '/') {
            this.inputOperator(key);
        } else if (key === 'Enter' || key === '=') {
            event.preventDefault();
            this.calculate();
        } else if (key === 'Escape' || key === 'c' || key === 'C') {
            this.clear();
        } else if (key === 'Backspace') {
            this.backspace();
        }
    }
}

// Initialize calculator when DOM is loaded
let calculator;

document.addEventListener('DOMContentLoaded', function() {
    calculator = new Calculator();
    
    // Add keyboard support
    document.addEventListener('keydown', function(event) {
        calculator.handleKeyPress(event);
    });
    
    // Initialize sidebar toggle functionality
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
        });
    }
});

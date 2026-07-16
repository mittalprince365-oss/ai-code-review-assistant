const { Linter } = require('eslint');

const linter = new Linter();

function analyzeJavaScript(code) {
  const issues = linter.verify(code, {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        require: 'readonly',
        module: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'error',
      'semi': 'warn',
      'no-var': 'warn',
      'eqeqeq': 'warn',
      'no-console': 'off',
      'no-redeclare': 'error',
      'no-unreachable': 'error',
      'no-dupe-keys': 'error',
      'no-empty': 'warn',
    },
  });

  // ESLint ke result ko apne saaf format mein badlo
  return issues.map((issue) => ({
    line: issue.line,
    column: issue.column,
    severity: issue.severity === 2 ? 'error' : 'warning',
    message: issue.message,
    rule: issue.ruleId,
  }));
}

module.exports = { analyzeJavaScript };
let { compiler } = require('./compiler')

let code = '(add 2 (subtract 88 2))'

let newCode = compiler(code);
console.log('newCode: ', newCode);
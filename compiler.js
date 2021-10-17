// * 它产生的 Token 看起来或许是这样的：
//  *
//  *   [
//  *     { type: 'paren',  value: '('        },
//  *     { type: 'name',   value: 'add'      },
//  *     { type: 'number', value: '2'        },
//  *     { type: 'paren',  value: '('        },
//  *     { type: 'name',   value: 'subtract' },
//  *     { type: 'number', value: '4'        },
//  *     { type: 'number', value: '2'        },
//  *     { type: 'paren',  value: ')'        },
//  *     { type: 'paren',  value: ')'        }
//  *   ]
//  *
//  * 它的抽象语法树（AST）看起来或许是这样的：
//  *
//  *   {
//  *     type: 'Program',
//  *     body: [{
//  *       type: 'CallExpression',
//  *       name: 'add',
//  *       params: [{
//  *         type: 'NumberLiteral',
//  *         value: '2'
//  *       }, {
//  *         type: 'CallExpression',
//  *         name: 'subtract',
//  *         params: [{
//  *           type: 'NumberLiteral',
//  *           value: '4'
//  *         }, {
//  *           type: 'NumberLiteral',
//  *           value: '2'
//  *         }]
//  *       }]
//  *     }]
//  *   }
//  */

//词法解析 获取tokens
function tokenizer (input) {
  let tokens = [];

  let current = 0;
  while (current < input.length) {
    let char = input[current];

    if (char === '(') {
      tokens.push({
        type: 'paren',
        value: '('
      })
      current++;
      continue;
    }
    if (char === ')') {
      tokens.push({
        type: 'paren',
        value: ')'
      })
      current++;
      continue;
    }
    let WHITESPACE = /\s/ //空格
    if (WHITESPACE.test(char)) {
      current++;
      continue;
    }
    //获取连接的数字
    let NUMBER_REG = /\d/
    if (NUMBER_REG.test(char)) {
      let value = '';
      while (NUMBER_REG.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({
        type: 'number',
        value
      })
      continue
    }

    //获取连接的字符串
    let WORD_REG = /\w/
    if (WORD_REG.test(char)) {
      let value = '';
      while (WORD_REG.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({
        type: 'name',
        value
      })
      continue
    }

  }
  return tokens;
  console.log('tokens: ', tokens);

}

//语法解析 得到 ast 
function parser (tokens) {
  let current = 0;

  function walk () {
    let node = tokens[current];

    if (node.type === 'number') {
      current++;
      return {
        type: 'NumberLiteral',
        value: node.value
      }
    }

    if (node.type === 'paren' && node.value === '(') {
      let token = tokens[++current];
      let node = {
        type: 'CallExpression',
        name: token.value,
        params: []
      }
      // current++;
      token = tokens[++current]
      console.log('current: ', current);
      while (token.type != 'paren' || (token.type === 'paren' && token.value !== ')')) {
        node.params.push(walk())
        // current++;
        token = tokens[current]
      }

      current++;
      return node;
    }

  }

  let ast = {
    type: 'Program',
    body: []
  }

  while (current < tokens.length) {
    ast.body.push(walk())
    current++;
  }
  return ast;
}

//遍历器
function traverser (ast, visitor) {
  function traverArr (arr, parent) {
    arr.forEach(node => {
      traverNode(node, parent)
    })
  }

  function traverNode (node, parent) {
    let method = visitor[node.type];

    if (method) {
      method(node, parent);
    }

    switch (node.type) {
      case 'Program':
        traverArr(node.body, node);
        break;
      case 'CallExpression':
        traverArr(node.params, node);
        break;
      case 'NumberLiteral':
        break;
      default:
        new TypeError(node.type)
    }

  }

  traverNode(ast, null)
}

//ast 转换成 newAst
function transformer (ast) {

  let newAst = {
    type: 'Program',
    body: [],
  }

  ast._context = newAst.body;

  traverser(ast, {
    NumberLiteral: function (node, parent) {
      parent._context.push({
        type: 'NumberLiteral',
        value: node.value
      })

    },
    CallExpression: function (node, parent) {

      let expression = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: node.name
        },
        arguments: []
      }
      node._context = expression.arguments;

      if (parent.type !== 'CallExpression') {
        expression = {
          type: 'ExpressionStatement',
          expression: expression
        }
      }
      parent._context.push(expression);


    }
  })

  return newAst

}

function codeGenerator (ast) {

  switch (ast.type) {
    case 'Program':
      return ast.body.map(codeGenerator);
    case 'ExpressionStatement':
      return codeGenerator(ast.expression) + ';';
    case 'CallExpression':
      return (codeGenerator(ast.callee) + '(' + ast.arguments.map(codeGenerator).join(',') + ')');
    case 'NumberLiteral':
      return ast.value;
    case 'Identifier':
      return ast.name
  }

}

function compiler (input) {
  let tokens = tokenizer(input);
  let ast = parser(tokens);
  console.log('ast: ', JSON.stringify(ast));
  let newAst = transformer(ast);
  console.log('newAst: ', JSON.stringify(newAst));
  let output = codeGenerator(newAst)

  return output;


}

module.exports = {
  tokenizer,
  parser,
  transformer,
  codeGenerator,
  compiler
}
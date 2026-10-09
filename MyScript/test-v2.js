const source = `
LET age = 20
LET result = age + 5 * 2
PRINT result
PRINT (10 + 5) * 2
`;

const lexer = new MyScriptLexer(source);
const tokens = lexer.tokenize();

console.log("TOKENS:");
console.log(tokens);

const parser = new MyScriptParser(tokens);
const ast = parser.parse();

console.log("AST:");
console.log(JSON.stringify(ast, null, 2));
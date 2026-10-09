// ============================================
// MYSCRIPT v2.0.0
// PARSER
// ============================================

class MyScriptParser {

    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;
    }

    current() {
        return this.tokens[this.position];
    }

    peek() {
        return this.tokens[this.position + 1];
    }

    advance() {
        const token = this.current();

        if (token.type !== "EOF") {
            this.position++;
        }

        return token;
    }

    check(type, value = undefined) {

        const token = this.current();

        if (!token || token.type !== type) {
            return false;
        }

        return value === undefined || token.value === value;
    }

    match(type, value = undefined) {

        if (this.check(type, value)) {
            this.advance();
            return true;
        }

        return false;
    }

    expect(type, value = undefined) {

        if (this.check(type, value)) {
            return this.advance();
        }

        const token = this.current();

        throw new Error(
            `Line ${token.line}, column ${token.column}: Expected ${value ?? type}.`
        );
    }

    skipNewlines() {

        while (this.match("NEWLINE")) {
            // Skip blank lines.
        }
    }

    parse() {

        const statements = [];

        this.skipNewlines();

        while (!this.check("EOF")) {

            statements.push(this.parseStatement());

            if (!this.check("EOF") && !this.check("NEWLINE")) {

                const token = this.current();

                throw new Error(
                    `Line ${token.line}, column ${token.column}: Expected a new line.`
                );
            }

            this.skipNewlines();
        }

        return new ProgramNode(statements);
    }

    parseStatement() {

        if (this.match("KEYWORD", "LET")) {
            return this.parseVariableDeclaration();
        }

        if (this.match("KEYWORD", "PRINT")) {
            return this.parsePrint();
        }

        return this.parseExpressionStatement();
    }

    parseVariableDeclaration() {

        const name = this.expect("IDENTIFIER");

        this.expect("EQUALS");

        const value = this.parseExpression();

        return new VariableDeclarationNode(
            name.value,
            value
        );
    }

    parsePrint() {

        const expression = this.parseExpression();

        return new PrintNode(expression);
    }

    parseExpressionStatement() {

        const expression = this.parseExpression();

        return new ExpressionStatementNode(expression);
    }

    parseExpression() {
        return this.parseComparison();
    }

    parseComparison() {

        let expression = this.parseAddition();

        while (
            this.check("OPERATOR", "==") ||
            this.check("OPERATOR", "!=") ||
            this.check("OPERATOR", ">") ||
            this.check("OPERATOR", "<") ||
            this.check("OPERATOR", ">=") ||
            this.check("OPERATOR", "<=")
        ) {

            const operator = this.advance().value;

            const right = this.parseAddition();

            expression = new BinaryExpressionNode(
                expression,
                operator,
                right
            );
        }

        return expression;
    }

    parseAddition() {

        let expression = this.parseMultiplication();

        while (
            this.check("OPERATOR", "+") ||
            this.check("OPERATOR", "-")
        ) {

            const operator = this.advance().value;

            const right = this.parseMultiplication();

            expression = new BinaryExpressionNode(
                expression,
                operator,
                right
            );
        }

        return expression;
    }

    parseMultiplication() {

        let expression = this.parseUnary();

        while (
            this.check("OPERATOR", "*") ||
            this.check("OPERATOR", "/")
        ) {

            const operator = this.advance().value;

            const right = this.parseUnary();

            expression = new BinaryExpressionNode(
                expression,
                operator,
                right
            );
        }

        return expression;
    }

    parseUnary() {

        if (
            this.check("OPERATOR", "-")
        ) {

            const operator = this.advance().value;

            return new BinaryExpressionNode(
                new NumberNode(0),
                operator,
                this.parseUnary()
            );
        }

        return this.parsePrimary();
    }

    parsePrimary() {

        if (this.check("NUMBER")) {
            return new NumberNode(
                this.advance().value
            );
        }

        if (this.check("STRING")) {
            return new StringNode(
                this.advance().value
            );
        }

        if (this.check("IDENTIFIER")) {
            return new VariableNode(
                this.advance().value
            );
        }

        if (this.match("LPAREN")) {

            const expression = this.parseExpression();

            this.expect("RPAREN");

            return expression;
        }

        const token = this.current();

        throw new Error(
            `Line ${token.line}, column ${token.column}: Expected a value.`
        );
    }
}
// ============================================
// MYSCRIPT v2.0.0
// ABSTRACT SYNTAX TREE INTERPRETER
// ============================================

class MyScriptASTInterpreter {

    constructor() {
        this.variables = {};
        this.output = [];
    }

    // ========================================
    // RUN PROGRAM
    // ========================================

    run(program) {
        this.variables = {};
        this.output = [];

        this.execute(program);

        return this.output.join("\n");
    }

    // ========================================
    // EXECUTE AST NODE
    // ========================================

    execute(node) {

        switch (node.type) {

            case "Program":
                for (const statement of node.statements) {
                    this.execute(statement);
                }
                return null;

            case "VariableDeclaration": {
                const value = this.evaluate(node.value);
                this.variables[node.name] = value;
                return value;
            }

            case "Print": {
                const value = this.evaluate(node.expression);
                this.output.push(String(value));
                return value;
            }

            case "ExpressionStatement":
                return this.evaluate(node.expression);

            default:
                throw new Error(
                    `Unknown AST node: ${node.type}`
                );
        }
    }

    // ========================================
    // EVALUATE EXPRESSIONS
    // ========================================

    evaluate(node) {

        switch (node.type) {

            case "Number":
                return node.value;

            case "String":
                return node.value;

            case "Variable":

                if (
                    !Object.prototype.hasOwnProperty.call(
                        this.variables,
                        node.name
                    )
                ) {
                    throw new Error(
                        `Undefined variable: ${node.name}`
                    );
                }

                return this.variables[node.name];

            case "BinaryExpression":
                return this.evaluateBinary(node);

            default:
                throw new Error(
                    `Cannot evaluate AST node: ${node.type}`
                );
        }
    }

    // ========================================
    // MATHEMATICAL AND COMPARISON OPERATORS
    // ========================================

    evaluateBinary(node) {

        const left = this.evaluate(node.left);
        const right = this.evaluate(node.right);

        switch (node.operator) {

            case "+":
    if (
        typeof left === "string" ||
        typeof right === "string"
    ) {
        return String(left) + String(right);
    }

    this.checkNumbers(left, right);
    return left + right;

            case "-":
                this.checkNumbers(left, right);
                return left - right;

            case "*":
                this.checkNumbers(left, right);
                return left * right;

            case "/":
                this.checkNumbers(left, right);

                if (right === 0) {
                    throw new Error(
                        "Cannot divide by zero."
                    );
                }

                return left / right;

            case ">":
                return left > right;

            case "<":
                return left < right;

            case ">=":
                return left >= right;

            case "<=":
                return left <= right;

            case "==":
                return left === right;

            case "!=":
                return left !== right;

            default:
                throw new Error(
                    `Unsupported operator: ${node.operator}`
                );
        }
    }

    // ========================================
    // VALIDATE NUMBERS
    // ========================================

    checkNumbers(left, right) {

        if (
            typeof left !== "number" ||
            typeof right !== "number" ||
            !Number.isFinite(left) ||
            !Number.isFinite(right)
        ) {
            throw new Error(
                "Mathematical operators require numeric values."
            );
        }
    }

    requireNumbers(left, right) {

        this.checkNumbers(left, right);

        return left + right;
    }
}
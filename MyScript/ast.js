// ============================================
// MYSCRIPT v2.0.0
// ABSTRACT SYNTAX TREE
// ============================================

class NumberNode {
    constructor(value) {
        this.type = "Number";
        this.value = value;
    }
}

class StringNode {
    constructor(value) {
        this.type = "String";
        this.value = value;
    }
}

class VariableNode {
    constructor(name) {
        this.type = "Variable";
        this.name = name;
    }
}

class BinaryExpressionNode {
    constructor(left, operator, right) {
        this.type = "BinaryExpression";
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
}

class VariableDeclarationNode {
    constructor(name, value) {
        this.type = "VariableDeclaration";
        this.name = name;
        this.value = value;
    }
}

class PrintNode {
    constructor(expression) {
        this.type = "Print";
        this.expression = expression;
    }
}

class ExpressionStatementNode {
    constructor(expression) {
        this.type = "ExpressionStatement";
        this.expression = expression;
    }
}

class ProgramNode {
    constructor(statements) {
        this.type = "Program";
        this.statements = statements;
    }
}
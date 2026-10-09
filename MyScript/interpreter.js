// ============================================
// MYSCRIPT INTERPRETER
// Version 1.3
// Functions, Parameters, Return Values
// ============================================

class MyScriptInterpreter {

    constructor() {
        this.variables = {};
        this.functions = {};
        this.output = [];
        this.callDepth = 0;
        this.maxCallDepth = 100;
    }

    // ========================================
    // RESET
    // ========================================

    reset() {
        this.variables = {};
        this.functions = {};
        this.output = [];
        this.callDepth = 0;
    }

    // ========================================
    // RUN PROGRAM
    // ========================================

    run(code) {
        this.reset();

        const lines = code.split(/\r?\n/);

        try {
            this.registerFunctions(lines);
            this.executeBlock(lines, 0, lines.length);

            return this.output.join("\n");

        } catch (error) {
            throw error;
        }
    }

    // ========================================
    // REGISTER FUNCTIONS
    // ========================================

    registerFunctions(lines) {

        let i = 0;

        while (i < lines.length) {

            const line = lines[i].trim();

            const match = line.match(
                /^FUNCTION\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:\((.*?)\))?\s*$/i
            );

            if (!match) {
                i++;
                continue;
            }

            const name = match[1];

            const parameterText = match[2] || "";

            const parameters = parameterText.trim() === ""
                ? []
                : parameterText.split(",").map(p => p.trim());

            if (
                parameters.some(
                    p => !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(p)
                )
            ) {
                throw new Error(
                    `Line ${i + 1}: Invalid function parameter.`
                );
            }

            if (new Set(parameters).size !== parameters.length) {
                throw new Error(
                    `Line ${i + 1}: Duplicate function parameter.`
                );
            }

            if (Object.prototype.hasOwnProperty.call(this.functions, name)) {
                throw new Error(
                    `Line ${i + 1}: Function "${name}" already exists.`
                );
            }

            const endIndex = this.findFunctionEnd(
                lines,
                i + 1
            );

            this.functions[name] = {
                parameters,
                body: lines.slice(i + 1, endIndex),
                line: i + 1
            };

            // Skip the registered function body.
            i = endIndex + 1;
        }
    }

    // ========================================
    // FIND FUNCTION END
    // ========================================

    findFunctionEnd(lines, start) {

        let depth = 0;

        for (let i = start; i < lines.length; i++) {

            const line = lines[i].trim();

            if (/^(IF|REPEAT)\s+/i.test(line)) {
                depth++;
            }

            if (/^FUNCTION\s+/i.test(line)) {
                depth++;
            }

            if (/^END$/i.test(line)) {

                if (depth === 0) {
                    return i;
                }

                depth--;
            }
        }

        throw new Error(
            `Function beginning at line ${start} is missing END.`
        );
    }

    // ========================================
    // EXECUTE BLOCK
    // ========================================

    executeBlock(lines, start, end) {

        let i = start;

        while (i < end) {

            const line = lines[i].trim();

            if (line === "" || line.startsWith("#")) {
                i++;
                continue;
            }

            // Function definitions are registered separately.
            if (/^FUNCTION\s+/i.test(line)) {

                const endIndex = this.findFunctionEnd(
                    lines,
                    i + 1
                );

                i = endIndex + 1;
                continue;
            }

            // --------------------------------
            // IF
            // --------------------------------

            if (/^IF\s+/i.test(line)) {

                const condition = line.substring(3).trim();

                const block = this.findBlock(lines, i, end);

                if (this.evaluateCondition(condition)) {

                    const trueEnd = block.elseIndex !== -1
                        ? block.elseIndex
                        : block.endIndex;

                    this.executeBlock(
                        lines,
                        i + 1,
                        trueEnd
                    );

                } else if (block.elseIndex !== -1) {

                    this.executeBlock(
                        lines,
                        block.elseIndex + 1,
                        block.endIndex
                    );
                }

                i = block.endIndex + 1;
                continue;
            }

            // --------------------------------
            // REPEAT
            // --------------------------------

            if (/^REPEAT\s+/i.test(line)) {

                const count = Number(
                    this.evaluate(line.substring(7).trim())
                );

                if (!Number.isInteger(count) || count < 0) {
                    throw new Error(
                        `Line ${i + 1}: REPEAT requires a non-negative whole number.`
                    );
                }

                if (count > 10000) {
                    throw new Error(
                        `Line ${i + 1}: REPEAT limit is 10000 iterations.`
                    );
                }

                const block = this.findBlock(lines, i, end);

                for (let repetition = 0; repetition < count; repetition++) {

                    this.executeBlock(
                        lines,
                        i + 1,
                        block.endIndex
                    );
                }

                i = block.endIndex + 1;
                continue;
            }

            // --------------------------------
            // RETURN
            // --------------------------------

            if (/^RETURN(?:\s|$)/i.test(line)) {

                const value = line.substring(6).trim();

                return {
                    returned: true,
                    value: value === ""
                        ? null
                        : this.evaluate(value)
                };
            }

            // --------------------------------
            // INPUT
            // --------------------------------

            if (/^INPUT\s+/i.test(line)) {

                const name = line.substring(6).trim();

                if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
                    throw new Error(
                        `Line ${i + 1}: Invalid INPUT variable name.`
                    );
                }

                const entered = prompt(
                    `MyScript: Enter ${name}`
                );

                if (entered === null) {
                    throw new Error(
                        `Line ${i + 1}: Input cancelled.`
                    );
                }

                this.variables[name] = entered;

                i++;
                continue;
            }

            // --------------------------------
            // INVALID STANDALONE END / ELSE
            // --------------------------------

            if (/^(END|ELSE)$/i.test(line)) {
                throw new Error(
                    `Line ${i + 1}: Unexpected ${line}.`
                );
            }

            // --------------------------------
            // NORMAL COMMAND
            // --------------------------------

            try {
                this.executeLine(line);
            } catch (error) {
                throw new Error(
                    `Line ${i + 1}: ${error.message}`
                );
            }

            i++;
        }

        return {
            returned: false,
            value: null
        };
    }

    // ========================================
    // FIND IF / REPEAT BLOCK
    // ========================================

    findBlock(lines, start, limit) {

        let depth = 0;
        let elseIndex = -1;

        for (let i = start; i < limit; i++) {

            const line = lines[i].trim();

            if (/^(IF|REPEAT)\s+/i.test(line)) {
                depth++;
            }

            else if (/^END$/i.test(line)) {

                depth--;

                if (depth === 0) {
                    return {
                        elseIndex,
                        endIndex: i
                    };
                }
            }

            else if (/^ELSE$/i.test(line) && depth === 1) {

                if (elseIndex !== -1) {
                    throw new Error(
                        `Line ${i + 1}: Multiple ELSE commands.`
                    );
                }

                elseIndex = i;
            }
        }

        throw new Error(
            `Line ${start + 1}: Missing END for block.`
        );
    }

    // ========================================
    // EXECUTE COMMAND
    // ========================================

    executeLine(line) {

        // PRINT

        if (/^PRINT\s+/i.test(line)) {

            const value = line.substring(6).trim();

            this.output.push(
                String(this.evaluate(value))
            );

            return;
        }

        // LET

        if (/^LET\s+/i.test(line)) {

            this.createVariable(line);

            return;
        }

        // CALL WITH OPTIONAL ASSIGNMENT

        if (/^LET\s+/.test(line) && /\bCALL\b/.test(line)) {
            throw new Error(
                "Use LET result = CALL functionName(arguments)."
            );
        }

        const assignmentCall = line.match(
            /^LET\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*CALL\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*?)\)\s*$/i
        );

        if (assignmentCall) {

            const [, variableName, functionName, argsText] = assignmentCall;

            const args = this.parseArguments(argsText);

            const result = this.callFunction(
                functionName,
                args
            );

            this.variables[variableName] = result.value;

            return;
        }

        // CALL WITHOUT ASSIGNMENT

        const call = line.match(
            /^CALL\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:\((.*?)\))?\s*$/i
        );

        if (call) {

            const args = this.parseArguments(call[2] || "");

            this.callFunction(
                call[1],
                args
            );

            return;
        }

        // MATH COMMANDS

        if (/^ADD\s+/i.test(line)) {
            this.mathCommand(line, "ADD", "+");
            return;
        }

        if (/^SUBTRACT\s+/i.test(line)) {
            this.mathCommand(line, "SUBTRACT", "-");
            return;
        }

        if (/^MULTIPLY\s+/i.test(line)) {
            this.mathCommand(line, "MULTIPLY", "*");
            return;
        }

        if (/^DIVIDE\s+/i.test(line)) {
            this.mathCommand(line, "DIVIDE", "/");
            return;
        }

        throw new Error(`Unknown command: ${line}`);
    }

    // ========================================
    // FUNCTION CALL
    // ========================================

    callFunction(name, args) {

        const fn = this.functions[name];

        if (!fn) {
            throw new Error(
                `Function "${name}" does not exist.`
            );
        }

        if (args.length !== fn.parameters.length) {
            throw new Error(
                `Function "${name}" expects ${fn.parameters.length} argument(s), but received ${args.length}.`
            );
        }

        if (this.callDepth >= this.maxCallDepth) {
            throw new Error(
                "Maximum function call depth exceeded."
            );
        }

        const previousVariables = this.variables;

        const localVariables = {};

        // Functions can read variables from the caller.
        Object.assign(
            localVariables,
            previousVariables
        );

        // Parameters override same-named outer variables.
        fn.parameters.forEach((parameter, index) => {
            localVariables[parameter] = args[index];
        });

        this.variables = localVariables;

        this.callDepth++;

        try {

            const result = this.executeBlock(
                fn.body,
                0,
                fn.body.length
            );

            return result;

        } finally {

            // Restore caller's variables after the function.
            this.variables = previousVariables;

            this.callDepth--;
        }
    }

    // ========================================
    // PARSE FUNCTION ARGUMENTS
    // ========================================

    parseArguments(text) {

        if (text.trim() === "") {
            return [];
        }

        const parts = [];

        let current = "";
        let inString = false;

        for (let i = 0; i < text.length; i++) {

            const character = text[i];

            if (character === '"') {
                inString = !inString;
            }

            if (character === "," && !inString) {

                parts.push(current.trim());

                current = "";

            } else {

                current += character;
            }
        }

        if (inString) {
            throw new Error(
                "Unclosed string in function arguments."
            );
        }

        parts.push(current.trim());

        return parts.map(part => this.evaluate(part));
    }

    // ========================================
    // CREATE VARIABLE
    // ========================================

    createVariable(line) {

        const content = line.substring(3).trim();

        const equalPosition = content.indexOf("=");

        if (equalPosition === -1) {
            throw new Error(
                "LET requires: LET variable = value."
            );
        }

        const name = content.substring(
            0,
            equalPosition
        ).trim();

        const value = content.substring(
            equalPosition + 1
        ).trim();

        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
            throw new Error(
                `Invalid variable name: ${name}`
            );
        }

        // Function result assignment is handled separately.
        if (/^CALL\s+/i.test(value)) {

            const match = value.match(
                /^CALL\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*?)\)\s*$/i
            );

            if (!match) {
                throw new Error(
                    "Invalid function call assignment."
                );
            }

            const args = this.parseArguments(match[2]);

            const result = this.callFunction(
                match[1],
                args
            );

            this.variables[name] = result.value;

            return;
        }

        this.variables[name] = this.evaluate(value);
    }

    // ========================================
    // MATH
    // ========================================

    mathCommand(line, command, operator) {

        const parts = line.substring(command.length).trim().split(",");

        if (parts.length !== 2) {
            throw new Error(
                `${command} requires two comma-separated values.`
            );
        }

        const first = Number(this.evaluate(parts[0].trim()));
        const second = Number(this.evaluate(parts[1].trim()));

        if (!Number.isFinite(first) || !Number.isFinite(second)) {
            throw new Error(`${command} requires numbers.`);
        }

        let result;

        switch (operator) {

            case "+":
                result = first + second;
                break;

            case "-":
                result = first - second;
                break;

            case "*":
                result = first * second;
                break;

            case "/":

                if (second === 0) {
                    throw new Error("Cannot divide by zero.");
                }

                result = first / second;
                break;
        }

        this.output.push(String(result));
    }

    // ========================================
    // EVALUATE VALUES
    // ========================================

    evaluate(value) {

        value = value.trim();

        // STRING

        if (
            value.length >= 2 &&
            value.startsWith('"') &&
            value.endsWith('"')
        ) {
            return value.substring(1, value.length - 1);
        }

        // NUMBER

        if (/^-?\d+(\.\d+)?$/.test(value)) {
            return Number(value);
        }

        // VARIABLE

        if (
            Object.prototype.hasOwnProperty.call(
                this.variables,
                value
            )
        ) {
            return this.variables[value];
        }

        // Evaluate compound expressions with the v2 parser when available.
        // This lets legacy control-flow/function blocks use modern arithmetic
        // and string concatenation without using JavaScript eval().
        if (
            typeof MyScriptLexer !== "undefined" &&
            typeof MyScriptParser !== "undefined" &&
            typeof MyScriptASTInterpreter !== "undefined"
        ) {
            try {
                const lexer = new MyScriptLexer(value);
                const tokens = lexer.tokenize();
                const parser = new MyScriptParser(tokens);
                const program = parser.parse();

                if (
                    program.statements.length === 1 &&
                    program.statements[0].type === "ExpressionStatement"
                ) {
                    const engine = new MyScriptASTInterpreter();
                    engine.variables = Object.assign(
                        Object.create(null),
                        this.variables
                    );
                    return engine.evaluate(
                        program.statements[0].expression
                    );
                }
            } catch (expressionError) {
                // Preserve the established, friendly legacy error below.
            }
        }

        throw new Error(`Unknown value: ${value}`);
    }

    // ========================================
    // CONDITIONS
    // ========================================

    evaluateCondition(condition) {

        const operators = [">=", "<=", "==", "!=", ">", "<"];

        let operator = null;
        let position = -1;

        for (const candidate of operators) {

            position = condition.indexOf(candidate);

            if (position !== -1) {
                operator = candidate;
                break;
            }
        }

        if (!operator) {
            throw new Error(
                "Invalid condition. Use >, <, >=, <=, == or !=."
            );
        }

        const left = condition.substring(0, position).trim();

        const right = condition.substring(
            position + operator.length
        ).trim();

        const a = this.evaluate(left);
        const b = this.evaluate(right);

        switch (operator) {

            case ">":
                return a > b;

            case "<":
                return a < b;

            case ">=":
                return a >= b;

            case "<=":
                return a <= b;

            case "==":
                return a === b;

            case "!=":
                return a !== b;
        }
    }
}

// ============================================
// INITIALIZE MYSCRIPT
// ============================================

const myScriptInterpreter = new MyScriptInterpreter();
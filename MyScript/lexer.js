// ============================================
// MYSCRIPT v2.0.0
// LEXER
// ============================================

class MyScriptLexer {

    constructor(source) {
        this.source = source;
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.tokens = [];
    }

    current() {
        return this.source[this.position] ?? null;
    }

    peek() {
        return this.source[this.position + 1] ?? null;
    }

    advance() {
        const character = this.current();

        if (character === "\n") {
            this.line++;
            this.column = 1;
        } else {
            this.column++;
        }

        this.position++;

        return character;
    }

    addToken(type, value, line, column) {
        this.tokens.push({
            type,
            value,
            line,
            column
        });
    }

    tokenize() {

        while (this.current() !== null) {

            const character = this.current();

            // Ignore spaces and tabs.
            if (character === " " || character === "\t" || character === "\r") {
                this.advance();
                continue;
            }

            // Newlines.
            if (character === "\n") {
                this.addToken(
                    "NEWLINE",
                    "\n",
                    this.line,
                    this.column
                );

                this.advance();
                continue;
            }

            // Comments beginning with #.
            if (character === "#") {

                while (
                    this.current() !== null &&
                    this.current() !== "\n"
                ) {
                    this.advance();
                }

                continue;
            }

            const tokenLine = this.line;
            const tokenColumn = this.column;

            // Numbers.
            if (/[0-9]/.test(character)) {

                let number = "";

                while (
                    this.current() !== null &&
                    /[0-9]/.test(this.current())
                ) {
                    number += this.advance();
                }

                if (this.current() === ".") {

                    number += this.advance();

                    if (
                        this.current() === null ||
                        !/[0-9]/.test(this.current())
                    ) {
                        throw new Error(
                            `Line ${tokenLine}: Invalid number.`
                        );
                    }

                    while (
                        this.current() !== null &&
                        /[0-9]/.test(this.current())
                    ) {
                        number += this.advance();
                    }
                }

                this.addToken(
                    "NUMBER",
                    Number(number),
                    tokenLine,
                    tokenColumn
                );

                continue;
            }

            // Strings.
            if (character === '"') {

                this.advance();

                let value = "";

                while (
                    this.current() !== null &&
                    this.current() !== '"'
                ) {

                    if (this.current() === "\n") {
                        throw new Error(
                            `Line ${tokenLine}: Unclosed string.`
                        );
                    }

                    if (this.current() === "\\") {

                        this.advance();

                        const escaped = this.current();

                        if (escaped === null) {
                            break;
                        }

                        const escapeMap = {
                            n: "\n",
                            t: "\t",
                            '"': '"',
                            "\\": "\\"
                        };

                        value +=
                            Object.prototype.hasOwnProperty.call(
                                escapeMap,
                                escaped
                            )
                                ? escapeMap[escaped]
                                : escaped;

                        this.advance();

                    } else {

                        value += this.advance();
                    }
                }

                if (this.current() !== '"') {
                    throw new Error(
                        `Line ${tokenLine}: Unclosed string.`
                    );
                }

                this.advance();

                this.addToken(
                    "STRING",
                    value,
                    tokenLine,
                    tokenColumn
                );

                continue;
            }

            // Identifiers and keywords.
            if (/[a-zA-Z_]/.test(character)) {

                let word = "";

                while (
                    this.current() !== null &&
                    /[a-zA-Z0-9_]/.test(this.current())
                ) {
                    word += this.advance();
                }

                const keywords = [
                    "LET",
                    "PRINT",
                    "ADD",
                    "SUBTRACT",
                    "MULTIPLY",
                    "DIVIDE",
                    "IF",
                    "ELSE",
                    "END",
                    "REPEAT",
                    "INPUT",
                    "FUNCTION",
                    "CALL",
                    "RETURN"
                ];

                const upperWord = word.toUpperCase();

                if (keywords.includes(upperWord)) {

                    this.addToken(
                        "KEYWORD",
                        upperWord,
                        tokenLine,
                        tokenColumn
                    );

                } else {

                    this.addToken(
                        "IDENTIFIER",
                        word,
                        tokenLine,
                        tokenColumn
                    );
                }

                continue;
            }

            // Two-character operators.
            const twoCharacter = character + (this.peek() ?? "");

            if (
                ["==", "!=", ">=", "<="].includes(twoCharacter)
            ) {

                this.advance();
                this.advance();

                this.addToken(
                    "OPERATOR",
                    twoCharacter,
                    tokenLine,
                    tokenColumn
                );

                continue;
            }

            // Single-character operators and punctuation.
            const symbols = {
                "+": "OPERATOR",
                "-": "OPERATOR",
                "*": "OPERATOR",
                "/": "OPERATOR",
                ">": "OPERATOR",
                "<": "OPERATOR",
                "=": "EQUALS",
                "(": "LPAREN",
                ")": "RPAREN",
                ",": "COMMA"
            };

            if (
                Object.prototype.hasOwnProperty.call(
                    symbols,
                    character
                )
            ) {

                this.addToken(
                    symbols[character],
                    character,
                    tokenLine,
                    tokenColumn
                );

                this.advance();

                continue;
            }

            throw new Error(
                `Line ${tokenLine}, column ${tokenColumn}: Unexpected character "${character}".`
            );
        }

        this.addToken(
            "EOF",
            null,
            this.line,
            this.column
        );

        return this.tokens;
    }
}
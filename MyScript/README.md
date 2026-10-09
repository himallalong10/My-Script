# MyScript IDE v2.0.0

MyScript is a small browser-based programming-language playground. It includes a dark IDE-style editor, console output, a lexer, parser, abstract syntax tree (AST), and AST interpreter.

## Run the project

1. Extract the ZIP file.
2. Open the `MyScript` folder in Visual Studio Code.
3. Open `index.html` in a browser, or use the VS Code Live Server extension.
4. Write a program in the editor and click **Run**. You can also press **Ctrl + Enter**.
5. Use **Example** to load a demonstration program.
6. Use **Save** to download a `.mys` file and **Load** to open a saved `.mys` or text file.

No build step or package installation is required.

## Example: core language

```text
# Variables and arithmetic
LET age = 20
LET result = age + 5 * 2

PRINT "MyScript v2"
PRINT result
PRINT (10 + 5) * 2
```

Expected output:

```text
MyScript v2
30
30
```

## Example: conditions and loops

```text
LET age = 20

IF age >= 18
    PRINT "Access granted."
ELSE
    PRINT "Access denied."
END

REPEAT 3
    PRINT "The loop is running."
END
```

## Language features

- `LET name = expression` declares/sets a variable.
- `PRINT expression` writes a value to the console.
- Arithmetic operators: `+`, `-`, `*`, `/`.
- Comparison operators: `>`, `<`, `>=`, `<=`, `==`, `!=`.
- Parentheses for grouping expressions.
- Double-quoted strings and common escapes such as `\n` and `\t`.
- Comments begin with `#`.
- The established interpreter supports `IF`, `ELSE`, `END`, `REPEAT`, `INPUT`, `ADD`, `SUBTRACT`, `MULTIPLY`, `DIVIDE`, `FUNCTION`, `CALL`, and `RETURN`.

## Engine architecture

- `lexer.js`: converts source text into tokens.
- `ast.js`: defines AST node types.
- `parser.js`: parses core statements and expressions.
- `ast-interpreter.js`: executes AST programs.
- `interpreter.js`: retains the established interpreter features and uses the v2 expression engine for compound expressions when possible.
- `index.js`: connects the editor controls to the appropriate engine.
- `test-v2.html` and `test-v2.js`: development test tools for the AST engine.

The IDE currently routes core `LET`/`PRINT`/expression programs through the AST engine. Programs using the established control-flow, input, function, or named math commands are routed through the original interpreter for compatibility. This bridge makes the engines usable together while the parser is expanded to represent all language constructs directly in the AST.

## Notes

- `INPUT` opens a browser prompt.
- This is a local browser project, not a hosted server application.
- Save your work to Git frequently as you add features.

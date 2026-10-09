// ============================================
// MYSCRIPT IDE
// Version 2.0.0 integrated engine
// ============================================

const codeEditor = document.getElementById("codeEditor");
const runButton = document.getElementById("runButton");
const exampleButton = document.getElementById("exampleButton");
const saveButton = document.getElementById("saveButton");
const loadButton = document.getElementById("loadButton");
const clearButton = document.getElementById("clearButton");
const fileInput = document.getElementById("fileInput");
const output = document.getElementById("output");

function showOutput(message, isError = false) {
    output.className = isError ? "error" : "";
    output.textContent = message;
}

function usesLegacyFeatures(source) {
    // These constructs are already implemented by the original interpreter.
    // Keep them working while the AST parser is expanded in future versions.
    const legacyCommand = /^\s*(IF|ELSE|END|REPEAT|INPUT|FUNCTION|CALL|RETURN|ADD|SUBTRACT|MULTIPLY|DIVIDE)\b/im;
    return legacyCommand.test(source);
}

function runScript() {
    const code = codeEditor.value;

    if (code.trim() === "") {
        showOutput("ERROR: No MyScript code entered.", true);
        return;
    }

    try {
        let result;

        if (usesLegacyFeatures(code)) {
            // Backward compatibility: existing control flow, input, math commands,
            // and functions remain handled by the established interpreter.
            result = myScriptInterpreter.run(code);
        } else {
            // v2 engine: source -> tokens -> AST -> execution.
            const lexer = new MyScriptLexer(code);
            const tokens = lexer.tokenize();
            const parser = new MyScriptParser(tokens);
            const ast = parser.parse();
            const engine = new MyScriptASTInterpreter();
            result = engine.run(ast);
        }

        showOutput(result === "" ? "✓ Script executed successfully." : result);
    } catch (error) {
        showOutput("ERROR: " + error.message, true);
        console.error(error);
    }
}

runButton.addEventListener("click", runScript);

exampleButton.addEventListener("click", function () {
    codeEditor.value = `# MyScript v2.0.0 feature demonstration

LET name = "MyScript"
LET age = 20
LET result = 10 + 5 * 2

PRINT "Welcome to " + name
PRINT "Arithmetic result:"
PRINT result

IF age >= 18
    PRINT "Access granted."
ELSE
    PRINT "Access denied."
END

REPEAT 3
    PRINT "The loop is running."
END

ADD 20, 30`;

    showOutput("Example loaded. Press Run to execute it.");
});

clearButton.addEventListener("click", function () {
    codeEditor.value = "";
    showOutput("Editor cleared. Ready for new MyScript code.");
});

saveButton.addEventListener("click", function () {
    const code = codeEditor.value;

    if (code.trim() === "") {
        showOutput("Nothing to save.");
        return;
    }

    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "myscript-program.mys";
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showOutput("✓ Script saved as myscript-program.mys");
});

loadButton.addEventListener("click", function () {
    fileInput.click();
});

fileInput.addEventListener("change", function () {
    const file = fileInput.files && fileInput.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {
        codeEditor.value = String(event.target.result ?? "");
        showOutput("✓ Script loaded successfully.");
        fileInput.value = "";
    };

    reader.onerror = function () {
        showOutput("ERROR: Could not read the selected file.", true);
        fileInput.value = "";
    };

    reader.readAsText(file);
});

codeEditor.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.key === "Enter") {
        event.preventDefault();
        runScript();
    }
});

showOutput("MyScript v2.0.0 ready. Press Run to execute the example.");
console.log("MyScript IDE v2.0.0 loaded successfully.");

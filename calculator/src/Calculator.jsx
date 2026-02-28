import React, { useState } from "react";
import { evaluate, ResultSetDependencies } from "mathjs";
import "./Calculator.css";

export default function Calculator() {
  const [mode, setMode] = useState("basic"); // basic | scientific | history
  const [expr, setExpr] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [history, setHistory] = useState([]);
  const [degMode, setDegMode] = useState(false); // false = radians, true = degrees

  // Insert text into expression
  const insert = (text) => {
    setExpr((s) => s + text);
    setError("");
  };

  // Clear expression and result
  const handleClear = () => {
    setExpr("");
    setOutput("");
    setError("");
  };

  // Backspace
  const handleBackspace = () => {
    setExpr((s) => s.slice(0, -1));
    setError("");
  };

  // Preprocess expression for degree mode: convert sin(x) -> sin((pi/180)*x)
  const preprocessForDegrees = (input) => {
    // Add conversion factor inside trig calls: sin( -> sin((pi/180)*
    // This simple regex inserts the factor immediately after the opening parenthesis.
    // It transforms sin(30) -> sin((pi/180)*30)
    return input.replace(/(sin|cos|tan)\s*\(/g, (match, p1) => `${p1}((pi/180)*`);
  };

  // Evaluate expression using mathjs
  const handleCalculate = () => {
    try {
      let toEval = expr.trim() || "0";

      // Replace any unicode pi symbol with mathjs 'pi' (defensive)
      toEval = toEval.replace(/π/g, "pi");

      // If degree mode, convert trig calls
      if (degMode) {
        toEval = preprocessForDegrees(toEval);
      }

      // Evaluate with mathjs
      const result = evaluate(toEval);
      const resultStr = String(result);

      setOutput(resultStr);
      setHistory((h) => [{ expr, result: resultStr }, ...h]);
      setError("");
    } catch (e) {
      setError("Invalid expression");
      setOutput("");
    }
  };

  const clearHistory = () => setHistory([]);

  // Button definitions for rendering
  const basicButtons = [
    { label: "C", action: handleClear, className: "clear1" },
    { label: "(", value: "(" },
    { label: ")", value: ")" },
    { label: "⌫", action: handleBackspace },

    { label: "7", value: "7" },
    { label: "8", value: "8" },
    { label: "9", value: "9" },
    { label: "÷", value: "/", className: "operator" },

    { label: "4", value: "4" },
    { label: "5", value: "5" },
    { label: "6", value: "6" },
    { label: "×", value: "*", className: "operator" },

    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "−", value: "-", className: "operator" },

    { label: "0", value: "0", wide: true },
    { label: ".", value: "." },
    { label: "+", value: "+", className: "operator" },

    { label: "=", action: handleCalculate, className: "equals operator" },
  ];

  const scientificButtons = [
    { label: "C", action: handleClear, className: "clear" },

    { label: "sin(", value: "sin(" },
    { label: "cos(", value: "cos(" },
    { label: "tan(", value: "tan(" },
    { label: "√", value: "sqrt(" },

    { label: "ln", value: "log(" },
    { label: "log10", value: "log10(" },
    { label: "x^y", value: "^" },
    { label: "abs(", value: "abs(" },

    { label: "e", value: "e" },
    { label: "ANS", action: () => insert(output ? output : "") },
    { label: "(", value: "(" },
    { label: ")", value: ")" },
    { label: "π", value: "pi" },
 { label: "(", value: "(" },
    { label: ")", value: ")" },
    { label: "⌫", action: handleBackspace },

    { label: "7", value: "7" },
    { label: "8", value: "8" },
    { label: "9", value: "9" },
    { label: "÷", value: "/", className: "operator" },

    { label: "4", value: "4" },
    { label: "5", value: "5" },
    { label: "6", value: "6" },
    { label: "×", value: "*", className: "operator" },

    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "−", value: "-", className: "operator" },

    { label: "0", value: "0", wide: true },
    { label: ".", value: "." },
    { label: "+", value: "+", className: "operator" },

    { label: "=", action: handleCalculate, className: "equals operator" },


  ];

  // Render a button (value or action)
  const renderBtn = (btn, idx) => {
    const classes = ["calc-btn"];
    if (btn.className) classes.push(btn.className);
    if (btn.wide) classes.push("wide");

    const onClick = () => {
      if (btn.action) return btn.action();
      if (btn.value !== undefined) return insert(btn.value);
      if (btn.label) return insert(btn.label);
    };

    return (
      <button
        key={idx}
        className={classes.join(" ")}
        onClick={onClick}
        aria-label={btn.label}
        type="button"
      >
        {btn.label}
      </button>
    );
  };

  return (
    <div className="calculator-wrapper" role="application" aria-label="Calculator">
      {/* Top bar */}
      <div className="top-bar">
        <div className="left-controls">
          <button
            className="menu-toggle"
            onClick={() => setShowMenu(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>

        <div className="title-area">
          <h2 className="mode-title">
            {mode === "basic" && "Basic Calculator"}
            {mode === "scientific" && "Scientific Calculator"}
            {mode === "history" && "History"}
          </h2>
        </div>

        <div className="right-controls">
          {/* Degree / Radian toggle */}
          <button
            className={`deg-toggle ${degMode ? "active" : ""}`}
            onClick={() => setDegMode((d) => !d)}
            aria-pressed={degMode}
            title="Toggle Degrees / Radians"
          >
            {degMode ? "DEG" : "RAD"}
          </button>
        </div>
      </div>

      {/* Side navigation overlay */}
      {showMenu && (
        <div
          className="side-nav-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowMenu(false)}
        >
          <div
            className="side-nav"
            onClick={(e) => e.stopPropagation()}
            role="menu"
          >
            <button
              className={`menu-item ${mode === "basic" ? "active" : ""}`}
              onClick={() => {
                setMode("basic");
                handleClear();
                setShowMenu(false);
              }}
            >
              Basic
            </button>

            <button
              className={`menu-item ${mode === "scientific" ? "active" : ""}`}
              onClick={() => {
                setMode("scientific");
                handleClear();
                setShowMenu(false);
              }}
            >
              Scientific
            </button>

            <button
              className={`menu-item ${mode === "history" ? "active" : ""}`}
              onClick={() => {
                setMode("history");
                setShowMenu(false);
              }}
            >
              History
            </button>

            <div className="side-divider" />

            <button
              className="close-btn"
              onClick={() => setShowMenu(false)}
            >
              ✕ Close
            </button>
          </div>
        </div>
      )}

      {/* Calculator body */}
      <div className="calculator">
        <input
          className="expr"
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          placeholder={mode === "scientific" ? "Use functions (e.g. sin(30), pi)" : "Type or use buttons"}
          aria-label="Expression"
        />

        <div className="result-row">
          <div className="result-label">Result</div>
          <div className="result-value" aria-live="polite">
            {error ? <span className="error">{error}</span> : output || "—"}
          </div>
        </div>

        {/* Mode content */}
        {mode === "basic" && (
          <div className="button-grid">
            {basicButtons.map((b, i) => renderBtn(b, i))}
          </div>
        )}

        {mode === "scientific" && (
          <>
            <div className="button-grid scientific">
              {scientificButtons.map((b, i) => renderBtn(b, `s-${i}`))}
            </div>

            
          </>
        )}

        {mode === "history" && (
          <div className="history-panel" aria-live="polite">
            <div className="history-header">
              <h3>History</h3>
              <button className="clear-history" onClick={clearHistory}>
                Clear History
              </button>
            </div>

            <ul className="history-list">
              {history.length === 0 && <li className="empty">No history yet</li>}
              {history.map((h, i) => (
                <li key={i} className="history-item">
                  <button
                    className="history-reuse"
                    onClick={() => {
                      setExpr(h.expr);
                      setOutput(h.result);
                      setMode("basic");
                    }}
                  >
                    

                    <span className="hist-expr">{h.expr}</span>
                    <span className="hist-eq"> = </span>
                    <span className="hist-res">{h.result}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

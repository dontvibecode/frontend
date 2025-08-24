'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';

const CodeSandbox = ({ 
  exercises = [], 
  showExercises = true, 
  defaultCode = { html: '', css: '', js: '' },
  height = 'h-96',
  className = '',
  onCodeChange = () => {},
  allowDownload = true,
  showHeader = true
}) => {
  const [html, setHtml] = useState(defaultCode.html || '');
  const [css, setCss] = useState(defaultCode.css || '');
  const [js, setJs] = useState(defaultCode.js || '');
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState('html');
  const [exerciseMode, setExerciseMode] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [showExerciseList, setShowExerciseList] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Default exercises if none provided
  const defaultExercises = [
    {
      id: 1,
      title: "Basic HTML Structure",
      description: "Create a simple webpage with a header, main content, and footer.",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Webpage</title>
</head>
<body>
    <!-- Add a header with an h1 tag -->
    
    <!-- Add a main section with a paragraph -->
    
    <!-- Add a footer -->
    
</body>
</html>`,
      css: `/* Add styles for your webpage */
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
}

/* Style your header */

/* Style your main content */

/* Style your footer */`,
      js: `// Add any JavaScript functionality here
console.log("Welcome to the exercise!");`
    },
    {
      id: 2,
      title: "CSS Flexbox Layout",
      description: "Create a responsive card layout using CSS Flexbox.",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flexbox Cards</title>
</head>
<body>
    <div class="container">
        <div class="card">
            <h3>Card 1</h3>
            <p>This is the first card.</p>
        </div>
        <div class="card">
            <h3>Card 2</h3>
            <p>This is the second card.</p>
        </div>
        <div class="card">
            <h3>Card 3</h3>
            <p>This is the third card.</p>
        </div>
    </div>
</body>
</html>`,
      css: `.container {
    /* Use flexbox to arrange cards */
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding: 20px;
}

.card {
    /* Style the individual cards */
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    margin: 10px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    min-width: 200px;
    max-width: 300px;
}

.card h3 {
    margin-top: 0;
    color: #333;
}

.card p {
    color: #666;
}`,
      js: `// Add hover effects or other interactions
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.transition = 'transform 0.3s ease';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
});`
    },
    {
      id: 3,
      title: "Interactive Counter",
      description: "Build an interactive counter with increment, decrement, and reset buttons.",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interactive Counter</title>
</head>
<body>
    <div class="counter-container">
        <h1>Counter App</h1>
        <div class="counter-display">
            <span id="counter">0</span>
        </div>
        <div class="button-group">
            <button id="decrement">-</button>
            <button id="reset">Reset</button>
            <button id="increment">+</button>
        </div>
    </div>
</body>
</html>`,
      css: `.counter-container {
    text-align: center;
    padding: 40px;
    font-family: Arial, sans-serif;
    max-width: 400px;
    margin: 0 auto;
}

.counter-display {
    margin: 30px 0;
    background: #f8f9fa;
    padding: 20px;
    border-radius: 10px;
}

#counter {
    font-size: 48px;
    font-weight: bold;
    color: #333;
}

.button-group {
    display: flex;
    justify-content: center;
    gap: 10px;
}

.button-group button {
    font-size: 18px;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    background: #007bff;
    color: white;
    transition: background-color 0.3s;
}

.button-group button:hover {
    background: #0056b3;
}

#reset {
    background: #6c757d;
}

#reset:hover {
    background: #545b62;
}`,
      js: `// Implement the counter functionality
let count = 0;

// Get references to DOM elements
const counterDisplay = document.getElementById('counter');
const incrementBtn = document.getElementById('increment');
const decrementBtn = document.getElementById('decrement');
const resetBtn = document.getElementById('reset');

// Add event listeners for buttons
incrementBtn.addEventListener('click', increment);
decrementBtn.addEventListener('click', decrement);
resetBtn.addEventListener('click', reset);

// Functions to update the counter
function updateDisplay() {
    counterDisplay.textContent = count;
}

function increment() {
    count++;
    updateDisplay();
}

function decrement() {
    count--;
    updateDisplay();
}

function reset() {
    count = 0;
    updateDisplay();
}`
    }
  ];

  const availableExercises = exercises.length > 0 ? exercises : defaultExercises;

  // Update output when code changes
  useEffect(() => {
    const htmlDoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>
            try {
              ${js}
            } catch (error) {
              console.error('JavaScript Error:', error);
            }
          </script>
        </body>
      </html>
    `;
    setOutput(htmlDoc);
    
    // Call the onChange callback with current code
    onCodeChange({ html, css, js });
  }, [html, css, js, onCodeChange]);

  const runCode = () => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      iframe.src = "about:blank";
      iframe.src = `data:text/html;charset=utf-8,${encodeURIComponent(output)}`;
    }
  };

  const resetCode = () => {
    if (exerciseMode && currentExercise) {
      setHtml(currentExercise.html || '');
      setCss(currentExercise.css || '');
      setJs(currentExercise.js || '');
    } else {
      setHtml(defaultCode.html || '');
      setCss(defaultCode.css || '');
      setJs(defaultCode.js || '');
    }
  };

  const loadExercise = (exercise) => {
    setCurrentExercise(exercise);
    setHtml(exercise.html || '');
    setCss(exercise.css || '');
    setJs(exercise.js || '');
    setExerciseMode(true);
    setShowExerciseList(false);
    setActiveTab('html');
  };

  const exitExerciseMode = () => {
    setExerciseMode(false);
    setCurrentExercise(null);
    setHtml(defaultCode.html || '');
    setCss(defaultCode.css || '');
    setJs(defaultCode.js || '');
  };

  const downloadCode = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Sandbox Export</title>
    <style>
${css}
    </style>
</head>
<body>
${html}
    <script>
${js}
    </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sandbox-code.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 'html':
        return html;
      case 'css':
        return css;
      case 'js':
        return js;
      default:
        return '';
    }
  };

  const setTabContent = (content) => {
    switch (activeTab) {
      case 'html':
        setHtml(content);
        break;
      case 'css':
        setCss(content);
        break;
      case 'js':
        setJs(content);
        break;
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {showHeader && (
        <div className="border-b bg-gray-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-900">Code Sandbox</h3>
              {exerciseMode && currentExercise && (
                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                  <Icon icon="mingcute:book-open-line" className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-700 text-xs font-medium">
                    {currentExercise.title}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {showExercises && availableExercises.length > 0 && (
                <button
                  onClick={() => setShowExerciseList(!showExerciseList)}
                  className="flex items-center space-x-1 bg-purple-600 text-white px-3 py-1.5 rounded text-sm hover:bg-purple-700 transition-colors"
                >
                  <Icon icon="mingcute:book-open-line" className="w-4 h-4" />
                  <span>Exercises</span>
                </button>
              )}
              <button
                onClick={runCode}
                className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition-colors"
              >
                <Icon icon="mingcute:play-fill" className="w-4 h-4" />
                <span>Run</span>
              </button>
              <button
                onClick={resetCode}
                className="flex items-center space-x-1 bg-gray-600 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-700 transition-colors"
              >
                <Icon icon="mingcute:refresh-line" className="w-4 h-4" />
                <span>Reset</span>
              </button>
              {allowDownload && (
                <button
                  onClick={downloadCode}
                  className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  <Icon icon="mingcute:download-line" className="w-4 h-4" />
                  <span>Export</span>
                </button>
              )}
              {exerciseMode && (
                <button
                  onClick={exitExerciseMode}
                  className="flex items-center space-x-1 bg-orange-600 text-white px-3 py-1.5 rounded text-sm hover:bg-orange-700 transition-colors"
                >
                  <Icon icon="mingcute:code-line" className="w-4 h-4" />
                  <span>Free Code</span>
                </button>
              )}
            </div>
          </div>
          
          {exerciseMode && currentExercise && currentExercise.description && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-800 text-sm">{currentExercise.description}</p>
            </div>
          )}
        </div>
      )}

      {showExerciseList && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Choose an Exercise</h3>
              <button
                onClick={() => setShowExerciseList(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Icon icon="mingcute:close-circle-line" className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <div className="grid gap-3">
                {availableExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
                    onClick={() => loadExercise(exercise)}
                  >
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{exercise.title}</h4>
                    <p className="text-gray-600 text-xs">{exercise.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Editor and Preview */}
      <div className="grid lg:grid-cols-2 gap-0">
        {/* Code Editor */}
        <div className="border-r border-gray-200">
          <div className="border-b bg-gray-50">
            <div className="flex">
              {['html', 'css', 'js'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600 bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="p-0">
            <textarea
              value={getTabContent()}
              onChange={(e) => setTabContent(e.target.value)}
              className={`w-full ${height} p-3 font-mono text-xs border-none resize-none focus:outline-none bg-gray-50`}
              placeholder={`Enter your ${activeTab.toUpperCase()} code here...`}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white">
          <div className="border-b bg-gray-50 px-3 py-2">
            <h4 className="text-xs font-medium text-gray-700">Preview</h4>
          </div>
          <div className={height}>
            <iframe
              ref={iframeRef}
              className="w-full h-full border-none"
              title="Code Preview"
              sandbox="allow-scripts"
              srcDoc={output}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeSandbox;
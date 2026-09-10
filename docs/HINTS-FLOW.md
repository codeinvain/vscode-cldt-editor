# Hints Feature Flow Diagram

## Data Flow

```
User Opens Preview
       ↓
showPreview(document)
       ↓
updateContent(document)
       ↓
getHtmlContent(url, fileName)
       ↓
Webview Loads
       ↓
Image Load Attempt
       ↓
[Success or Error]
       ↓
Webview sends "fetchHeaders" message
       ↓
fetchAndSendHeaders(url, documentText)
       ↓
HTTP Request to Cloudinary
       ↓
Parse Response Headers
  ├── Cloudinary Headers (x-cld-*, x-request-id)
  └── Other Headers (content-length, etc.)
       ↓
analyzeHints(cldHeaders, url, documentText)
  ├── Check for float dimensions (w_X.X, h_X.X)
  │   ├── Found? → Find line number
  │   │          → Create specific warning hint
  │   │          → Set hasSpecificFloatHint = true
  │   └── Not found? → Continue
  │
  ├── Check x-cld-error header
  │   └── Found AND !hasSpecificFloatHint?
  │       → Create generic error hint
  │
  └── Check for c_scale without dimensions
      └── Found? → Find line number
                 → Create info hint
       ↓
Return hints array
       ↓
Send to Webview via postMessage({
  command: "headersReceived",
  hints: hints,
  ...
})
       ↓
Webview Message Handler
       ↓
displayHints(hints)
  ├── No hints? → Hide hints container
  └── Has hints? → Render with icons
                  → Show container with animation
       ↓
User Sees Hints with Line Numbers
```

## Hint Priority Logic

```
Priority 1: Specific Parameter Issues
├── Float width detection
│   → Line X: Width parameter 'w_X.X' contains decimal...
└── Float height detection
    → Line X: Height parameter 'h_X.X' contains decimal...

Priority 2: Generic Errors (Only if no Priority 1 hints)
└── x-cld-error header
    → Cloudinary error: [error message]

Priority 3: Informational Suggestions
└── c_scale without dimensions
    → Line X: Using c_scale without width or height...
```

## Line Number Detection Flow

```
findParameterLine(documentText, parameter)
       ↓
Split document into lines
       ↓
Loop through each line
  ├── Line contains parameter?
  │   └── Return (index + 1)  // 1-based line number
  └── Line doesn't contain parameter?
      → Continue to next line
       ↓
Not found in any line?
  └── Return 1 (default)
```

## Example Execution

### Scenario: URL with float dimensions

**Input:**

```
Line 1: # Test file
Line 2: https://res.cloudinary.com/demo/image/upload/w_500.5,h_300.75/sample.jpg
```

**Execution:**

```
1. extractUrl() → "https://res.cloudinary.com/demo/...w_500.5,h_300.75..."
2. fetchAndSendHeaders() → Makes HTTP request
3. Response headers include:
   x-cld-error: "Maximum image width/height is 25000000"
4. analyzeHints():
   a. widthMatch = /w_([0-9.]+)/ → "500.5"
   b. Contains "."? → YES
   c. findParameterLine("w_500.5") → Returns 2
   d. Add hint: "Line 2: Width parameter 'w_500.5'..."
   e. hasSpecificFloatHint = true

   f. heightMatch = /h_([0-9.]+)/ → "300.75"
   g. Contains "."? → YES
   h. findParameterLine("h_300.75") → Returns 2
   i. Add hint: "Line 2: Height parameter 'h_300.75'..."
   j. hasSpecificFloatHint = true

   k. x-cld-error exists? → YES
   l. hasSpecificFloatHint? → YES (true)
   m. SKIP generic error (avoid duplicate)

5. Return hints: [width warning, height warning]
6. displayHints() → Render 2 warnings with line numbers
```

**Result:**

- ⚠️ Line 2: Width parameter 'w_500.5' contains a decimal point. Use an integer value instead (e.g., w_501).
- ⚠️ Line 2: Height parameter 'h_300.75' contains a decimal point. Use an integer value instead (e.g., h_301).

## Key Decision Points

### Should we show generic x-cld-error?

```
if (cldError && !hasSpecificFloatHint) {
  // Only show if we don't have more specific hints
}
```

### How do we get line numbers?

```
const lineNumber = this.findParameterLine(documentText, `w_${widthMatch[1]}`);
```

### How do we prevent duplicates?

```
let hasSpecificFloatHint = false;

// Set flag when adding specific hints
hasSpecificFloatHint = true;

// Check flag before adding generic hints
if (cldError && !hasSpecificFloatHint) {
  // Only add if no specific hints
}
```

## UI Update Flow

```
Hints Container State Machine:

Initial: Hidden (max-height: 0, padding: 0)
       ↓
hints.length > 0?
  ├── YES → Add class "visible"
  │        → CSS transition to max-height: 500px, padding: 12px 16px
  │        → Smooth expansion animation (0.3s ease-out)
  └── NO  → Remove class "visible"
           → CSS transition to max-height: 0, padding: 0
           → Smooth collapse animation (0.3s ease-out)
```

## Message Types and Icons

```
Hint Type → Icon → CSS Class → Color
─────────────────────────────────────
warning   → ⚠️   → .warning   → Yellow
error     → ❌   → .error     → Red
info      → ℹ️   → .info      → Blue
default   → 💡   → -          → -
```

## Performance Considerations

1. **Line Number Search**: O(n) where n = number of lines
2. **Hint Generation**: O(1) - Fixed number of checks
3. **UI Rendering**: O(m) where m = number of hints (typically 1-3)
4. **Total Impact**: Minimal - runs once per preview load

## Error Handling

```
findParameterLine():
  └── Parameter not found? → Return 1 (safe default)

fetchAndSendHeaders():
  └── HTTP error? → Send "headersFailed" message
                  → No hints displayed

analyzeHints():
  └── No issues found? → Return empty array []
                       → Hints container stays hidden
```

# Hints Feature Implementation Summary

## Overview

Added a comprehensive hints system to the CLDT Preview window that displays warnings, errors, and informational messages about Cloudinary transformation URLs.

## Changes Made

### 1. Core Implementation (`src/previewProvider.ts`)

#### Added Hint Interface

```typescript
interface Hint {
  message: string;
  type: "warning" | "info" | "error";
}
```

#### Added `analyzeHints` Method

A private method that analyzes Cloudinary headers and URL parameters to generate helpful hints:

- **Parameters:** `cldHeaders`, `url`, `documentText`
- Identifies float values in width/height parameters (with line numbers)
- Detects `x-cld-error` headers but only shows them if no specific hints are available (prevents duplicates)
- Detects `c_scale` usage without dimensions (with line numbers)
- Uses `hasSpecificFloatHint` flag to avoid showing both generic and specific errors
- Returns an array of hints with appropriate severity levels

#### Added `findParameterLine` Helper Method

A private method that finds the line number where a parameter appears:

- **Parameters:** `documentText`, `parameter`
- Splits document into lines and searches for the parameter
- Returns 1-based line numbers for user-friendly display
- Defaults to line 1 if parameter not found

#### Enhanced `fetchAndSendHeaders` Method

Modified to accept document text and pass it to `analyzeHints`:

- **Parameters:** `url`, `documentText` (added)
- Calls `analyzeHints` with headers, URL, and document text
- Includes hints in the message sent to the webview

```typescript
const hints = this.analyzeHints(cldHeaders, url, documentText);
this.panel?.webview.postMessage({
  command: "headersReceived",
  // ... other properties
  hints: hints,
});
```

#### Updated Message Handler

Modified the `fetchHeaders` case to pass document text:

```typescript
case "fetchHeaders":
  if (this.currentDocument) {
    await this.fetchAndSendHeaders(message.url, this.currentDocument.getText());
  }
  break;
```

### 2. UI Implementation

#### CSS Styles Added

- `.hints-container`: Collapsible container with smooth transitions
- `.hints-container.visible`: Expanded state with max-height animation
- `.hint-item`: Flexible layout for each hint
- `.hint-item.warning`, `.error`, `.info`: Color-coded backgrounds and borders
- `.hint-icon`: Icon display styling
- `.hint-message`: Message text styling
- `.hints-header`: Section header styling

#### HTML Structure Added

```html
<div class="hints-container" id="hints-container">
  <div class="hints-header">Hints & Warnings</div>
  <div id="hints-list"></div>
</div>
```

#### JavaScript Functions Added

- `displayHints(hints)`: Renders hints with appropriate icons and styling
- `getHintIcon(type)`: Returns emoji icons based on hint type
  - Warning: ⚠️
  - Error: ❌
  - Info: ℹ️
  - Default: 💡

#### Message Handler Updated

Added hint display logic to the `headersReceived` message handler:

```javascript
if (message.hints) {
  displayHints(message.hints);
}
```

## Hint Detection Rules

### 1. Float Dimension Detection (Priority)

**Trigger:** URL contains `w_` or `h_` with decimal values
**Detection:** Regex pattern `/w_([0-9.]+)/` and `/h_([0-9.]+)/`
**Example:**

- URL: `w_500.5`
- Hint: "Line 2: Width parameter 'w_500.5' contains a decimal point. Use an integer value instead (e.g., w_501)."
  **Note:** Includes line number using `findParameterLine()` helper method

### 2. Invalid Variable Assignment Detection (Priority)

**Trigger:** `x-cld-error` header contains "Invalid assignment to $varName: value"
**Detection:** Regex pattern `/Invalid assignment to (\$[\w]+):\s*(.+)$/`
**Example:**

- Error: "Invalid assignment to $titlerand: !hellllo"
- Hint: "Line 3: Invalid assignment to variable '$titlerand' with value '!hellllo'. Check the variable syntax and value format."
  **Note:** Extracts variable name and value, finds line number in document

### 3. Undefined Variable Detection (Priority)

**Trigger:** `x-cld-error` header contains "Variable $varName is used before being assigned"
**Detection:** Regex pattern `/Variable (\$[\w]+) is used before being assigned/`
**Example:**

- Error: "Variable $txtlh is used before being assigned"
- Hint: "Line 5: Variable '$txtlh' is used before being assigned. Define the variable before using it, or check for typos in the variable name."
  **Note:** Extracts variable name, finds line number where it's referenced

### 4. x-cld-error Header Analysis (Fallback)

**Trigger:** Cloudinary returns an `x-cld-error` header AND no specific hints were generated
**Detection:** Checks for error header presence
**Example:**

- Error: "Some Cloudinary error"
- Hint: "Cloudinary error: Some Cloudinary error"
  **Note:** This is only shown if no specific hints (like float, invalid assignment, or undefined variable detection) were already added, preventing duplicate messages

### 5. Scale Without Dimensions

**Trigger:** URL contains `c_scale` but no `w_` or `h_`
**Detection:** String matching in URL
**Example:**

- URL: `c_scale,q_auto`
- Hint: "Line 2: Using c*scale without width or height parameter. Consider adding w* or h\_ to specify dimensions."
  **Note:** Includes line number for easy navigation

## Test Files Created

1. **float-dimension-test.cldt**: Tests float dimension detection

   - Contains: `w_500.5,h_300.75`
   - Expected: 2 warning hints

2. **invalid-variable-test.cldt**: Tests invalid variable assignment detection

   - Contains: `$titlerand_!hellllo`
   - Expected: 1 error hint (from x-cld-error header)

3. **undefined-variable-test.cldt**: Tests undefined variable usage detection

   - Contains: `h_$txtlh/` (without defining $txtlh)
   - Expected: 1 error hint (from x-cld-error header)

4. **scale-no-dimensions-test.cldt**: Tests scale without dimensions

   - Contains: `c_scale` without `w_` or `h_`
   - Expected: 1 info hint

5. **correct-dimensions-test.cldt**: Control test with proper values
   - Contains: `w_500,h_300`
   - Expected: No hints displayed

## Visual Design Features

- **Smooth Animation**: 0.3s ease-out transition for container expansion
- **Color Coding**:
  - Warning: Yellow background with yellow left border
  - Error: Red background with red left border
  - Info: Blue background with blue left border
- **VS Code Theme Integration**: Uses VS Code CSS variables for consistency
- **Responsive Layout**: Flexbox-based layout adapts to content
- **Icon Indicators**: Large emoji icons for quick visual identification
- **Accessibility**: Clear text contrast and semantic HTML structure

## Extensibility

The system is designed to be easily extensible. New hint rules can be added by:

1. Adding detection logic to the `analyzeHints` method
2. Creating appropriate hint messages
3. Assigning the correct hint type (warning, error, or info)

Example:

```typescript
// Check for deprecated parameters
if (url.includes("angle_")) {
  hints.push({
    message: "The 'angle' parameter is deprecated. Use 'a_' instead.",
    type: "warning",
  });
}
```

## Benefits

1. **Immediate Feedback**: Users see hints as soon as the preview loads
2. **Contextual Help**: Hints explain the specific problem and suggest solutions
3. **Error Prevention**: Proactive detection helps avoid common mistakes
4. **Learning Tool**: Users learn Cloudinary best practices through hints
5. **Professional UI**: Polished design integrates seamlessly with VS Code
6. **No Duplicate Messages**: Smart detection prevents showing generic and specific errors for the same issue
7. **Line Numbers**: Each hint includes the line number where the issue occurs, making it easy to navigate and fix
8. **Prioritized Information**: Shows the most specific and actionable hints first

## Future Enhancement Opportunities

- Add more hint rules for other common issues
- Support for hint actions (quick fixes)
- Hint severity configuration
- Custom hint rules via settings
- Hint history and statistics
- Integration with diagnostics system

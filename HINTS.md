# Preview Hints Feature

The CLDT Preview window now includes an intelligent hints system that helps identify and resolve common issues with Cloudinary transformation URLs.

## Overview

The hints area appears below the header in the preview window and displays warnings, errors, and informational messages about your transformation URL. It uses a yellow warning sign (⚠️) for warnings, a red X (❌) for errors, and a blue info icon (ℹ️) for informational hints.

## Hint Types

### 1. Warning Hints (⚠️)

Warnings indicate potential issues that might cause problems:

- **Float dimensions**: Detected when width or height parameters contain decimal points
  - Example: `w_500.5` or `h_300.75`
  - Solution: Use integer values like `w_500` or `h_300`
  - Includes line number for easy navigation

### 2. Error Hints (❌)

Errors indicate serious problems that will likely cause transformation failures:

- **Invalid variable assignments**: Detected from `x-cld-error` headers

  - Example: "Invalid assignment to $titlerand: !hellllo"
  - Shows the variable name, invalid value, and line number
  - Helps identify syntax errors in variable assignments

- **Undefined variable usage**: Detected when variables are used before being assigned
  - Example: "Variable $txtlh is used before being assigned"
  - Shows the variable name and line number where it's used
  - Helps catch typos and ordering issues
- **Cloudinary API errors**: Extracted from `x-cld-error` headers
  - Only shown when a more specific hint is not available
  - Example: "Maximum image width/height is..." error
  - Common cause: Using float values instead of integers

### 3. Info Hints (ℹ️)

Informational hints suggest improvements or best practices:

- **Scale without dimensions**: Using `c_scale` without specifying `w_` or `h_`
  - Suggestion: Add width or height parameters for proper scaling
  - Includes line number for easy navigation

## How It Works

1. **Automatic Analysis**: When you open a preview, the extension fetches response headers from Cloudinary
2. **Smart Detection**: The system analyzes both the URL parameters and response headers
3. **Helpful Suggestions**: Hints provide specific guidance on how to fix issues
4. **Visual Feedback**: The hints area smoothly expands when issues are detected

## Example Scenarios

### Scenario 1: Float Dimension Values

**URL:**

```
https://res.cloudinary.com/demo/image/upload/w_500.5,h_300.75,c_fill/sample.jpg
```

**Hints Displayed:**

- ⚠️ Line 2: Width parameter 'w_500.5' contains a decimal point. Use an integer value instead (e.g., w_501).
- ⚠️ Line 2: Height parameter 'h_300.75' contains a decimal point. Use an integer value instead (e.g., h_301).

### Scenario 2: Invalid Variable Assignment

**URL with invalid variable syntax:**

```
$titlerand_!hellllo,
```

**When Cloudinary returns error header:**

```
x-cld-error: Invalid assignment to $titlerand: !hellllo
```

**Hints Displayed:**

- ❌ Line 3: Invalid assignment to variable '$titlerand' with value '!hellllo'. Check the variable syntax and value format.

### Scenario 3: Undefined Variable Usage

**URL using undefined variable:**

```
h_$txtlh/
```

**When Cloudinary returns error header:**

```
x-cld-error: Variable $txtlh is used before being assigned
```

**Hints Displayed:**

- ❌ Line 5: Variable '$txtlh' is used before being assigned. Define the variable before using it, or check for typos in the variable name.

### Scenario 4: Generic x-cld-error

**When Cloudinary returns an error header but no specific pattern is detected:**

```
x-cld-error: Some other Cloudinary error
```

**Hints Displayed:**

- ❌ Cloudinary error: Some other Cloudinary error

**Note:** Specific hints (like float values, invalid assignments, or undefined variables) will be shown instead of generic error messages when the error pattern is recognized.

### Scenario 5: Scale Without Dimensions

**URL:**

```
https://res.cloudinary.com/demo/image/upload/c_scale,q_auto/sample.jpg
```

**Hints Displayed:**

- ℹ️ Line 2: Using c*scale without width or height parameter. Consider adding w* or h\_ to specify dimensions.

## Test Files

The extension includes test files to demonstrate the hints feature:

- `examples/float-dimension-test.cldt` - Tests float dimension detection
- `examples/invalid-variable-test.cldt` - Tests invalid variable assignment detection
- `examples/undefined-variable-test.cldt` - Tests undefined variable usage detection
- `examples/scale-no-dimensions-test.cldt` - Tests scale without dimensions
- `examples/correct-dimensions-test.cldt` - Control test (no hints)

## Adding Custom Hints

The hint system is extensible. Developers can add new hint rules by modifying the `analyzeHints` method in `src/previewProvider.ts`:

```typescript
private analyzeHints(cldHeaders: { [key: string]: string }, url: string): Hint[] {
  const hints: Hint[] = [];

  // Add your custom hint logic here

  return hints;
}
```

## UI Design

The hints area features:

- **Smooth animation**: Expands/collapses with CSS transitions
- **Color-coded**: Different background colors for different hint types
- **Icon indicators**: Visual icons for quick identification
- **Left border accent**: Colored border matches the hint type
- **VS Code theme integration**: Uses VS Code color variables for consistency

## Future Enhancements

Potential improvements to the hints system:

- Detection of deprecated transformation parameters
- Suggestions for optimization (format, quality settings)
- Warnings about large file sizes
- Tips for better performance
- Security recommendations
- Accessibility suggestions

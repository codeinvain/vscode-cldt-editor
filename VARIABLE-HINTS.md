# Variable Assignment Error Detection

## Overview

The hints system now detects invalid variable assignment errors from Cloudinary's `x-cld-error` headers and provides line-numbered feedback to help users quickly identify and fix variable syntax issues.

## How It Works

When Cloudinary returns an error like:

```
x-cld-error: Invalid assignment to $titlerand: !hellllo
```

The hints system:

1. **Parses the error** to extract the variable name (`$titlerand`) and invalid value (`!hellllo`)
2. **Finds the line number** where the variable appears in your document
3. **Displays a specific hint** with line number and helpful context

## Example

### Your CLDT File (line 3):

```cldt
https://res.cloudinary.com/demo/image/upload/
$titlerand_!hellllo,
w_300/
sample.jpg
```

### Hint Displayed:

```
❌ Line 3: Invalid assignment to variable '$titlerand' with value '!hellllo'.
   Check the variable syntax and value format.
```

## Detected Error Types

### 1. Variable Used Before Assignment

**Error Message:** `Variable $txtlh is used before being assigned`

**Example:**

```cldt
# Using $txtlh before defining it
h_$txtlh/
$txtlh_500,  # Defined after use - wrong order!
```

**Hint Displayed:**

```
❌ Line 2: Variable '$txtlh' is used before being assigned.
   Define the variable before using it, or check for typos in the variable name.
```

**Solution:**

```cldt
# Define variable before using it
$txtlh_500,  # Define first
h_$txtlh/    # Then use it
```

### 2. Invalid Variable Assignment

**Error Message:** `Invalid assignment to $varName: value`

**Example:**

```cldt
$titlerand_!hellllo,  # Syntax error in value
```

**Hint Displayed:**

```
❌ Line 3: Invalid assignment to variable '$titlerand' with value '!hellllo'.
   Check the variable syntax and value format.
```

## Common Variable Syntax Errors

### 1. Invalid String Syntax

**Problem:** Missing or malformed exclamation marks

```cldt
$title_hellllo        # Missing exclamation marks
$title_!hellllo       # Missing closing exclamation mark
```

**Solution:**

```cldt
$title_!hello!        # Correct: String enclosed in exclamation marks
```

### 2. Invalid Characters in Variable Name

**Problem:** Variable names must start with a letter and contain only letters/numbers

```cldt
$123var_!test!        # Starts with number
$my-var_!test!        # Contains hyphen
```

**Solution:**

```cldt
$var123_!test!        # Correct: Starts with letter
$myVar_!test!         # Correct: Alphanumeric only
```

### 3. Incorrect Assignment Operator

**Problem:** Using `=` instead of `_`

```cldt
$width=800            # Wrong operator
$width:800            # Wrong operator
```

**Solution:**

```cldt
$width_800            # Correct: Underscore is the assignment operator
```

### 4. Missing Value

**Problem:** Variable declared without a value

```cldt
$width_              # Missing value
$title_!             # Empty string value
```

**Solution:**

```cldt
$width_800           # Correct: Numeric value
$title_!Hello!       # Correct: String value
```

## Technical Implementation

### Regex Patterns

The hint system uses these regex patterns to detect variable errors:

**1. Invalid Assignment:**

```typescript
/Invalid assignment to (\$[\w]+):\s*(.+)$/;
```

Extracts:

- **Group 1:** Variable name (e.g., `$titlerand`)
- **Group 2:** Invalid value (e.g., `!hellllo`)

**2. Used Before Assignment:**

```typescript
/Variable (\$[\w]+) is used before being assigned/;
```

Extracts:

- **Group 1:** Variable name (e.g., `$txtlh`)

### Code Flow

```typescript
// Check for invalid variable assignment error
const invalidAssignmentMatch = cldError.match(
  /Invalid assignment to (\$[\w]+):\s*(.+)$/
);
if (invalidAssignmentMatch) {
  const varName = invalidAssignmentMatch[1];
  const invalidValue = invalidAssignmentMatch[2].trim();
  const lineNumber = this.findParameterLine(documentText, varName);

  hints.push({
    message: `Line ${lineNumber}: Invalid assignment to variable '${varName}' with value '${invalidValue}'. Check the variable syntax and value format.`,
    type: "error",
  });
  hasSpecificErrorHint = true;
}
// Check for variable used before assignment
else {
  const usedBeforeAssignmentMatch = cldError.match(
    /Variable (\$[\w]+) is used before being assigned/
  );
  if (usedBeforeAssignmentMatch) {
    const varName = usedBeforeAssignmentMatch[1];
    const lineNumber = this.findParameterLine(documentText, varName);

    hints.push({
      message: `Line ${lineNumber}: Variable '${varName}' is used before being assigned. Define the variable before using it, or check for typos in the variable name.`,
      type: "error",
    });
    hasSpecificErrorHint = true;
  }
}
```

## Benefits

1. **Precise Error Location**: Shows exact line number where the variable is defined
2. **Context-Aware**: Displays both variable name and problematic value
3. **Prevents Duplicates**: Generic x-cld-error is hidden when specific hint is shown
4. **Quick Navigation**: Line numbers help you jump directly to the issue
5. **Learning Tool**: Helps understand proper variable syntax

## Variable Syntax Reference

### Valid Variable Assignments

**Numeric values:**

```cldt
$width_800
$height_600
$padding_25
```

**String values (with exclamation marks):**

```cldt
$city_!MEXICO%20CITY!
$color_!rgb:fefefe!
$name_!John_Doe!
```

**Variable references:**

```cldt
$ratio_$width_div_$height
$finalw_$resizeratio_mul_$width
```

### Variable Usage

**Direct reference:**

```cldt
w_$width
h_$height
```

**Parentheses reference (in text overlays):**

```cldt
l_text:$(city)
```

## Testing

### Test File 1: Invalid Assignment

Use `examples/invalid-variable-test.cldt`:

```cldt
# Test file for invalid variable assignment
https://res.cloudinary.com/demo/image/upload/
$titlerand_!hellllo,
w_300/
sample.jpg
```

**Expected Hint:** Error about invalid assignment to `$titlerand`

### Test File 2: Used Before Assignment

Use `examples/undefined-variable-test.cldt`:

```cldt
# Test file for undefined variable usage
https://res.cloudinary.com/demo/image/upload/
w_300,
h_$txtlh/
sample.jpg
```

**Expected Hint:** Error about `$txtlh` being used before assignment

When you preview these files, you'll see the hints appear if Cloudinary returns the corresponding errors.

## Related Documentation

- [HINTS.md](HINTS.md) - Complete hints feature documentation
- [VARIABLES.md](VARIABLES.md) - Cloudinary variable syntax guide
- [IMPLEMENTATION-SUMMARY.md](IMPLEMENTATION-SUMMARY.md) - Technical implementation details

## Future Enhancements

Potential improvements for variable error detection:

- Detect common syntax errors before sending to Cloudinary
- Suggest correct syntax in real-time
- Validate variable references (ensure variable is defined before use)
- Check for undefined variables in the document
- Auto-fix capabilities for common variable errors

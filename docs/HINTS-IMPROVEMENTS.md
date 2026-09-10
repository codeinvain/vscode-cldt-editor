# Hints Feature Improvements

## Summary of Changes

The hints feature has been enhanced to provide more actionable and specific feedback without duplicate messages.

## Key Improvements

### 1. No Duplicate Messages ✅

**Problem:** Previously, users would see both a generic error message from `x-cld-error` header AND specific messages about float values, creating redundancy.

**Solution:**

- Added `hasSpecificFloatHint` flag to track when specific hints are generated
- Generic `x-cld-error` messages are only shown when no specific hints are available
- This prevents showing the same issue twice in different ways

**Example:**

- **Before:** User sees both "Maximum image width/height is..." AND "Width parameter 'w_500.5' contains decimal..."
- **After:** User only sees "Line 2: Width parameter 'w_500.5' contains decimal..." (the more specific and actionable hint)

### 2. Line Numbers Added 🎯

**Problem:** Hints were helpful but didn't tell users exactly where to fix the issue.

**Solution:**

- Added `findParameterLine()` helper method that searches the document for the parameter
- All hints now include the line number where the issue occurs
- Makes it easy to navigate directly to the problem

**Example:**

- **Before:** "Width parameter 'w_500.5' contains a decimal point..."
- **After:** "Line 2: Width parameter 'w_500.5' contains a decimal point..."

### 3. Better Code Organization 📁

**Changes:**

- `analyzeHints()` now accepts `documentText` as a parameter
- `fetchAndSendHeaders()` updated to pass document text
- New `findParameterLine()` helper method for line number detection
- Hints are checked in priority order (specific before generic)

## Technical Details

### Method Signatures Changed

```typescript
// Before
private analyzeHints(cldHeaders: {...}, url: string): Hint[]

// After
private analyzeHints(cldHeaders: {...}, url: string, documentText: string): Hint[]
```

```typescript
// Before
private async fetchAndSendHeaders(url: string)

// After
private async fetchAndSendHeaders(url: string, documentText: string)
```

### New Helper Method

```typescript
private findParameterLine(documentText: string, parameter: string): number {
  const lines = documentText.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(parameter)) {
      return i + 1; // Line numbers are 1-based
    }
  }
  return 1; // Default to line 1 if not found
}
```

### Duplicate Prevention Logic

```typescript
let hasSpecificFloatHint = false;

// Check for specific issues first
if (widthMatch && widthMatch[1].includes(".")) {
  // ... add specific hint
  hasSpecificFloatHint = true;
}

// Only show generic error if no specific hints found
if (cldError && !hasSpecificFloatHint) {
  hints.push({
    message: `Cloudinary error: ${cldError}`,
    type: "error",
  });
}
```

## User Experience Improvements

### Before

```
Hints & Warnings
❌ Cloudinary error: Maximum image width/height is 25000000
⚠️ Width parameter 'w_500.5' contains a decimal point. Use an integer value instead (e.g., w_501).
⚠️ Height parameter 'h_300.75' contains a decimal point. Use an integer value instead (e.g., h_301).
```

### After

```
Hints & Warnings
⚠️ Line 2: Width parameter 'w_500.5' contains a decimal point. Use an integer value instead (e.g., w_501).
⚠️ Line 2: Height parameter 'h_300.75' contains a decimal point. Use an integer value instead (e.g., h_301).
```

**Benefits:**

- Cleaner, less cluttered interface
- More actionable information (line numbers)
- No confusion from duplicate messages
- Faster to identify and fix issues

## Testing

Test the improvements using the example files:

1. **float-dimension-test.cldt** - Should show specific line-numbered warnings, no generic error
2. **scale-no-dimensions-test.cldt** - Should show line-numbered info hint
3. **correct-dimensions-test.cldt** - Should show no hints

## Future Enhancements

With this improved foundation, we can easily add:

- More specific hint rules for other parameter issues
- Quick fix actions that jump to the line and suggest corrections
- Hint severity configuration
- Custom hint rules via settings
- Click-to-navigate functionality (open editor at specific line)

## Conclusion

These improvements make the hints feature more professional, actionable, and user-friendly. Users now get:

- ✅ Precise line numbers for each issue
- ✅ No duplicate or redundant messages
- ✅ Clear, actionable guidance
- ✅ Better prioritization of information

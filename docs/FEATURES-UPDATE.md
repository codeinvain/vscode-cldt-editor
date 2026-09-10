# Recent Features Update

## ✨ New Features Added

### 1. Variable Syntax Highlighting

Variables starting with `$` are now highlighted with a distinct color:

```cldt
$width_800,                   # Variable highlighted
$height_600,                  # Variable highlighted
$quality_auto:best/           # Variable highlighted
```

**Benefits:**

- Easy identification of variables in transformation URLs
- Better visual distinction between variables and values
- Improved code readability

### 2. Hash Comment Support

Full support for hash (`#`) style comments:

```cldt
###
# Block comments
###
$city_!MEXICO!/,              # Inline comments
w_800/                        # Comments aligned
```

**Features:**

- Comment-only lines preserved during formatting
- Inline comments after transformations
- Automatic comment alignment to column 30

### 3. Automatic Blank Line Spacing

Blank lines automatically added after block endings for better readability:

```cldt
if_width_gt_500/
  w_800/
  h_600/
if_end/
                    ← Automatic blank line added

l_logo,w_200/
  x_10,y_10/
  fl_layer_apply/
                    ← Automatic blank line added

q_auto/
```

**Benefits:**

- Clear visual separation between blocks
- Easier to scan and read long transformation files
- Logical grouping of related transformations

### 4. Enhanced Comment Alignment

Inline comments are automatically aligned to column 30:

**Before:**

```cldt
$width_800,# Width variable
$verylongvariablename_1000,# Another variable
```

**After:**

```cldt
$width_800,                   # Width variable
$verylongvariablename_1000,   # Another variable
```

### 5. Multi-Line Format Support

The formatter now detects and handles two formats:

1. **Single-line URLs** → Converts to multi-line with indentation
2. **Multi-line with comments** → Reformats with proper indentation and spacing

## Updated Syntax Highlighting

### What's Highlighted:

1. **Comments** - `#` comments (green)
2. **Variables** - `$variable_name` (purple/blue)
3. **Keywords** - `if_`, `if_end`, `if_else` (pink)
4. **Transformations** - `w_`, `h_`, `c_`, `l_`, etc. (yellow)
5. **Values** - Numbers, strings (orange/green)
6. **Operators** - `,`, `/`, `:` (white)

## Example: Before and After

### Before Formatting:

```cldt
https://res.cloudinary.com/demo/image/upload/
$width_800,$height_600/
if_$width_gt_500/w_$width/h_$height/if_end/
l_logo,w_200/x_10,y_10/fl_layer_apply/
sample.jpg
```

### After Formatting:

```cldt
https://res.cloudinary.com/demo/image/upload/
$width_800,                   # Variables defined
$height_600/

if_$width_gt_500/             # Conditional block
  w_$width/
  h_$height/
if_end/

l_logo,w_200/                 # Layer block
  x_10,y_10/
  fl_layer_apply/

sample.jpg
```

## Configuration

No configuration needed! All features work out of the box:

1. **Variable highlighting** - Automatic
2. **Comment support** - Use `#` for comments
3. **Auto-spacing** - Enabled by default
4. **Comment alignment** - Column 30 (hardcoded)

## Usage Tips

### Adding Comments:

```cldt
# This is a full-line comment
$var_value,                   # This is an inline comment
```

### Using Variables:

```cldt
$myvar_100,                   # Define variable
w_$myvar/                     # Use variable
```

### Formatting:

1. Write your transformations (with or without formatting)
2. Press `Shift+Option+F` (macOS) or `Shift+Alt+F` (Windows/Linux)
3. The formatter will:
   - Add proper indentation
   - Align comments
   - Add spacing after blocks
   - Preserve all your comments

## Test Files

New example files to explore:

- `examples/commented-url.cldt` - Full example with comments
- `examples/formatted-with-spacing.cldt` - Shows automatic spacing
- `examples/complex-url.cldt` - Real-world complex URL

## Summary of Changes

✅ Variable highlighting for `$variable` syntax
✅ Hash (`#`) comment support
✅ Automatic blank lines after `if_end` and `fl_layer_apply`
✅ Comment alignment to column 30
✅ Multi-line format detection and handling
✅ Preserved comment-only lines
✅ Enhanced readability for complex transformations

---

**Enjoy the enhanced CLDT editing experience!** 🎉

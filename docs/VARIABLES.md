# Cloudinary Variable Syntax

## Overview

The CLDT extension now fully supports Cloudinary's variable syntax with proper highlighting.

## Variable Assignment

Variables are assigned using the underscore (`_`) as the assignment operator:

```cldt
$variableName_value
```

### Syntax:

- Starts with `$` (dollar sign)
- Followed by variable name (must start with a letter, then letters/numbers)
- `_` (underscore) is the assignment operator (equivalent to `=` in other languages)
- Value can be numeric or string

### Examples:

**Numeric values:**

```cldt
$width_800,
$height_600,
$padding_25/
```

**String values (enclosed by `!`):**

```cldt
$city_!MEXICO%20CITY!,
$color_!rgb:fefefe!,
$name_!John_Doe!,
$foil_!true!/
```

**Complex calculations:**

```cldt
$ratio_$width_div_$height,
$finalw_$resizeratio_mul_$width/
```

## Variable References (Usage)

To use a variable, simply reference it with `$name`:

```cldt
w_$width/
h_$height/
co_$color/
```

### Two Reference Formats:

1. **Direct reference:** `$variableName`

   ```cldt
   w_$width/
   ```

2. **Parentheses reference:** `$(variableName)`
   ```cldt
   l_text:$(city),
   ```

## Syntax Highlighting

The extension provides different highlighting for:

1. **Variable Name** (in assignment): `$width` in `$width_800`

   - Highlighted as variable

2. **Assignment Operator**: `_` in `$width_800`

   - Highlighted as operator

3. **Value** (in assignment): `800` or `!string!` in `$width_800` or `$name_!value!`

   - Highlighted as constant

4. **Variable Reference**: `$width` when used

   - Highlighted as variable

5. **String Values**: `!text!`
   - Highlighted as string

## Complete Example

```cldt
https://res.cloudinary.com/demo/image/upload/
###
# Define variables
###
$width_800,                   # Numeric assignment
$height_600,                  # Numeric assignment
$city_!MEXICO!,               # String assignment
$color_!rgb:ffffff!,          # String with special chars
$finalw_$width_mul_2/         # Calculation using another variable

###
# Use variables
###
w_$width/                     # Reference numeric variable
h_$height/                    # Reference numeric variable
co_$color/                    # Reference string variable

###
# Variables in conditionals
###
if_$width_gt_500/
  w_$finalw/                  # Using calculated variable
if_end/

###
# Variables in text overlays
###
l_text:$(city),               # Parentheses syntax
co_$color/
fl_layer_apply/

sample.jpg
```

## Variable Operations

Cloudinary supports various operations in variable assignments:

### Arithmetic:

- `$result_$a_add_$b` - Addition
- `$result_$a_sub_$b` - Subtraction
- `$result_$a_mul_$b` - Multiplication
- `$result_$a_div_$b` - Division

### Comparison (in conditionals):

- `if_$width_gt_500` - Greater than
- `if_$height_lt_300` - Less than
- `if_$color_eq_!red!` - Equals
- `if_$name_ne_!!` - Not equals (checking for non-empty)

### String Operations:

- `if_$text_ne_!!` - Check if not empty
- `if_$pos_eq_!top!` - String comparison

## Best Practices

1. **Use descriptive names:**

   ```cldt
   $finalWidth_600    # Good
   $fw_600            # Less clear
   ```

2. **Group related variables:**

   ```cldt
   ###
   # Dimension variables
   ###
   $width_800,
   $height_600/

   ###
   # Color variables
   ###
   $textColor_!ffffff!,
   $bgColor_!000000!/
   ```

3. **Comment your variables:**

   ```cldt
   $lrpad_205,                # Left & right padding
   $tbpad_171,                # Top or bottom padding
   ```

4. **Use calculations for derived values:**
   ```cldt
   $baseWidth_800,
   $doubleWidth_$baseWidth_mul_2,
   $halfWidth_$baseWidth_div_2/
   ```

## Common Patterns

### Responsive sizing:

```cldt
$originalWidth_iw,            # Get original width
$scale_0.5,                   # Define scale factor
$newWidth_$originalWidth_mul_$scale/
```

### Conditional styling:

```cldt
$isDark_!true!,
if_$isDark_eq_!true!/
  co_!ffffff!/
if_else/
  co_!000000!/
if_end/
```

### Text with variables:

```cldt
$title_!Hello%20World!,
l_text:$(title),
co_!ffffff!/
fl_layer_apply/
```

## Debugging Tips

1. **Check variable names:** Must start with a letter, then letters/numbers only
2. **Assignment operator:** Always use `_` not `=`
3. **String values:** Always enclose in `!` exclamation marks
4. **References:** Use `$name` or `$(name)` format
5. **Trailing characters:** Variables usually end with `,` or `/`

---

**Now with proper syntax highlighting, working with Cloudinary variables is easier than ever!** 🎨

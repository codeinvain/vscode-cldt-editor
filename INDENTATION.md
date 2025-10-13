# Cloudinary URL Indentation Rules

The CLDT formatter implements intelligent indentation for Cloudinary transformation URLs to improve readability and show the logical structure of transformations.

## Indentation Rules

### 1. Conditional Blocks (`if_` / `if_end` / `end_if`)

Conditional transformations create an indentation level. The pattern is:

- **Component starting with `if_`** (e.g., `if_isndef_$var`, `if_width_gt_500`) → starts indentation
- **Content inside the condition** → indented
- **Component that is exactly `if_end` or `end_if`** → ends indentation

```
if_isndef_$variable/
  [indented content inside condition]
if_end/
```

**Real Example:**

```
https://res.cloudinary.com/demo/image/upload/
if_isndef_$imgcover/
  $imgcover_!default_image!/
if_end/
if_width_gt_500/
  w_800,h_600,c_fill/
  q_auto:best/
if_end/
sample.jpg
```

**Note:** Each conditional block is independent. Multiple sequential conditionals will each create their own indent level that properly closes.

### 2. Layers (`l_` / `fl_layer_apply`)

Layers create an indentation level that shows what transformations apply to that specific layer:

```
l_overlay_image,c_fit/
  [transformations for this layer]
  [more transformations]
  fl_layer_apply/
```

**Example:**

```
https://res.cloudinary.com/demo/image/upload/
w_800,h_600/
l_logo,w_200/
  x_10,y_10/
  g_north_east/
  fl_layer_apply/
sample.jpg
```

## Complex Example

Here's your URL with proper indentation showing the logical structure:

### Before (No Indentation)

```
https://res.cloudinary.com/cld-daniel/image/upload/
if_isndef_$imgcover/$imgcover_!default!/if_end/
b_rgb:ffffff,g_north_west,o_0,w_556.5,h_408/
l_$imgcover,c_fit/
x_0,y_0,w_557,h_304,g_north_west,fl_layer_apply/
l_$rectangle86,c_fit/
x_-15,y_56,w_205,h_205,c_crop,g_north_west,fl_layer_apply/
v0/
sample
```

### After (With Indentation)

```
https://res.cloudinary.com/cld-daniel/image/upload/
if_isndef_$imgcover/$imgcover_!default!/if_end/
  $imgcover_!default!/
if_end/
b_rgb:ffffff,g_north_west,o_0,w_556.5,h_408/
l_$imgcover,c_fit/
  x_0,y_0,w_557,h_304,g_north_west,fl_layer_apply/
l_$rectangle86,c_fit/
  x_-15,y_56,w_205,h_205,c_crop,g_north_west,fl_layer_apply/
v0/
sample
```

## Indentation Logic

### Starts Indentation:

- Any component starting with `if_` (except those containing `end_if`)
- Any component starting with `l_` followed by a non-comma character (layer definitions)
  - Example: `l_logo`, `l_$variable`, `l_text:Hello`
  - Not: `fl_layer_apply` (this is a flag, not a layer start)

### Ends Indentation:

- Components containing `if_end` or `end_if`
- Components containing `fl_layer_apply`

### Nested Structures

You can have nested conditionals and layers:

```
https://res.cloudinary.com/demo/image/upload/
if_width_gt_500/
  w_800/
  l_watermark/
    opacity_50/
    fl_layer_apply/
  q_auto/
if_end/
sample.jpg
```

## Benefits

1. **Readability**: Instantly see which transformations belong to which layer or condition
2. **Debugging**: Easier to spot missing `fl_layer_apply` or `if_end` closures
3. **Maintenance**: Clear structure makes it easier to modify complex transformations
4. **Version Control**: Better git diffs show logical structure changes

## Usage

The formatter automatically applies these indentation rules when you format a `.cldt` file:

1. Open a `.cldt` file with a Cloudinary URL
2. Press `Shift+Option+F` (macOS) or `Shift+Alt+F` (Windows/Linux)
3. The URL will be formatted with proper indentation

## Notes

- Indentation uses 2 spaces per level
- Version (`v0`, `v1234567890`) and public-id are never indented
- The base URL is never indented
- Only transformation components between the base URL and version/public-id get indented

## Tips

- Use the formatter to validate your URL structure - unbalanced indentation indicates missing closures
- Properly indented URLs are much easier to understand and modify
- When building complex transformations, format frequently to catch structure issues early

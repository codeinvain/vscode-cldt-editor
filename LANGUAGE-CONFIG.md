# Language Configuration for CLDT

## Word Pattern

The CLDT extension uses a custom word pattern to properly recognize Cloudinary's unique syntax:

```json
"wordPattern": "(-?\\d*\\.\\d\\w*)|([^\\s\\,\\/\\(\\)\\[\\]\\{\\}]+)"
```

### What This Matches

This pattern ensures that word boundaries work correctly with Cloudinary's special characters:

1. **Numbers with decimals**: `-?\\d*\\.\\d\\w*`

   - Matches: `1.5`, `-2.0`, `0.75`

2. **Cloudinary syntax**: `[^\\s\\,\\/\\(\\)\\[\\]\\{\\}]+`
   - Matches any sequence that doesn't contain:
     - Whitespace
     - Commas `,`
     - Slashes `/`
     - Parentheses `(` `)`
     - Brackets `[` `]`
     - Braces `{` `}`

### What This Enables

#### ✅ Variable names with special characters:

```cldt
$width_800              # Whole thing is one word
$city_!MEXICO!          # Including the ! delimiters
$color_rgb:ffffff       # Including colons
```

#### ✅ Transformation parameters:

```cldt
w_800                   # Parameter with value
c_fill                  # Crop mode
e_blur:300              # Effect with value
```

#### ✅ Complex values:

```cldt
!MEXICO%20CITY!         # String with special chars
rgb:ffffff              # Color with colon
auto:best               # Quality setting
```

#### ✅ Double-click selection works correctly:

- Double-clicking on `$width_800` selects the whole variable assignment
- Double-clicking on `!string!` selects the whole string including delimiters
- Double-clicking on `w_300` selects the whole parameter

## Comments

```json
"lineComment": "#"
```

The line comment is set to `#` (hash) which is the standard Cloudinary comment syntax:

```cldt
# This is a comment
$width_800,              # Inline comment
```

## Auto-Closing Pairs

The extension automatically closes these pairs:

```json
{ "open": "!", "close": "!" }
```

When you type `!` it will automatically add the closing `!`:

```cldt
$name_!█!  ← Cursor here after typing first !
```

This is especially useful for string values in variable assignments.

## Folding

Code folding markers use `#` comments:

```cldt
# region Variables
$width_800,
$height_600/
# endregion

# region Transformations
w_$width/
h_$height/
# endregion
```

You can fold these regions in the editor.

## Benefits

### 1. Better Word Selection

- Double-click selects meaningful units
- `Ctrl+D` (Cmd+D) for multi-cursor works on complete tokens
- Find/Replace respects word boundaries

### 2. IntelliSense

- Autocomplete triggers at the right places
- Word suggestions based on actual syntax units

### 3. Hover Information

- Hover works on complete transformation parameters
- Variable hover includes the whole `$name_value` syntax

### 4. Navigation

- `Ctrl+F` word search finds complete units
- "Match whole word" option works correctly

## Examples

### Word Boundaries Work Correctly:

```cldt
$width_800,height_600/
│         ││         │
└─ word 1 ┘└─ word 2─┘
```

- Word 1: `$width_800`
- Word 2: `height_600`

The comma and slash are separators, not part of words.

### Variable Assignment as One Unit:

```cldt
$city_!MEXICO%20CITY!,
│                    │
└──── one word ──────┘
```

Double-clicking anywhere in this selects the entire variable assignment including the string delimiters.

### Transformation Parameters:

```cldt
w_300,h_200,c_fill/
│    ││    ││     │
│    ││    ││     └─ separator
│    ││    │└─ word: c_fill
│    ││    └─ separator
│    │└─ word: h_200
│    └─ separator
└─ word: w_300
```

Each parameter is a distinct word, making selection and editing easier.

## Testing Word Boundaries

To test if word boundaries work correctly:

1. **Double-click test**: Double-click on various parts of your CLDT code

   - Should select meaningful units
   - Should include `$`, `_`, `!`, `:` when appropriate

2. **Ctrl+D test**: Place cursor in a variable name and press `Ctrl+D` (Cmd+D)

   - Should select the whole variable
   - Subsequent presses should select other instances

3. **Find test**: Use `Ctrl+F` with "Match whole word" enabled
   - Should find complete variables and parameters
   - Should not partially match inside larger tokens

## Customization

If you need to adjust word boundaries for your specific use case, modify the `wordPattern` in `language-configuration.json`. The pattern is a regular expression that defines what constitutes a "word" in CLDT files.

---

**The word pattern configuration ensures smooth editing of Cloudinary transformation files!** ⚙️

# CLDT URL Formatter

The CLDT extension includes a powerful formatter for Cloudinary URLs that breaks down complex transformation URLs into readable, line-by-line format.

## How It Works

The formatter automatically detects if your `.cldt` file contains a Cloudinary URL and formats it accordingly, with intelligent indentation for conditionals and layers.

### URL Format Structure

Cloudinary URLs follow this pattern:

```
[schema]://[domain]/[cloud-name]/[resource-type]/[resource-kind]/[transformation-components...]/[version]/[public-id]
```

The formatter will:

1. Keep the base URL on one line: `https://domain/cloud-name/resource-type/resource-kind/`
2. Put each transformation component on its own line with a trailing `/`
3. **Apply smart indentation**:
   - Indent content inside conditionals (`if_` ... `if_end`)
   - Indent transformations within layers (`l_` ... `fl_layer_apply`)
4. Put the version (if present, e.g., `v0`) on its own line
5. Put the public-id on the last line (which may contain multiple path segments)

For detailed indentation rules, see [INDENTATION.md](INDENTATION.md)

## Example

### Before Formatting (One Line)

```
https://res.cloudinary.com/demo/image/upload/w_400,h_300,c_fill/q_auto/f_auto/sample.jpg
```

### After Formatting (Auto-formatted)

```
https://res.cloudinary.com/demo/image/upload/
w_400,h_300,c_fill/
q_auto/
f_auto/
sample.jpg
```

## Complex Example

Your complex URL from `url.cldt` gets formatted into multiple lines, making it much easier to:

- Read and understand each transformation step
- Debug transformation issues
- Modify specific transformation components
- Version control (better diffs)

### Before (Single Line - Hard to Read)

```
https://res.cloudinary.com/cld-daniel-dynamic-folders/image/upload/if_isndef_$imgcovermrand/$imgcovermrand_!figma-exports:6410!/if_end/b_rgb:ffffff,g_north_west,o_0,w_556.5,h_408/l_$imgcovermrand,c_fit/v0/sample
```

### After (Multi-Line - Easy to Read)

```
https://res.cloudinary.com/cld-daniel-dynamic-folders/image/upload/
if_isndef_$imgcovermrand/$imgcovermrand_!figma-exports:6410!/if_end/
b_rgb:ffffff,g_north_west,o_0,w_556.5,h_408/
l_$imgcovermrand,c_fit/
v0/
sample
```

## How to Use

### Format Current File

1. Open a `.cldt` file containing a Cloudinary URL
2. Use one of these methods:
   - **Keyboard**: Press `Shift+Alt+F` (Windows/Linux) or `Shift+Option+F` (macOS)
   - **Command Palette**: `Cmd+Shift+P` → "Format Document"
   - **Right-click**: Context menu → "Format Document"

### Auto-Format on Save

The extension respects VS Code's format-on-save setting. To enable:

1. Open Settings (`Cmd+,` on macOS, `Ctrl+,` on Windows/Linux)
2. Search for "format on save"
3. Enable "Editor: Format On Save"

Now your `.cldt` files will automatically format when you save!

## What Gets Formatted

### Cloudinary URLs

Any file starting with `http://` or `https://` is treated as a Cloudinary URL and formatted accordingly.

### Regular CLDT Syntax

Files with regular CLDT syntax (property: value format) get standard code formatting with proper indentation:

```cldt
width: 400
height: 300
crop: fill

overlay: {
  source: "logo"
  width: 100
}
```

## Transformation Component Detection

The formatter intelligently detects transformation components by looking for:

- Comma-separated parameters (e.g., `w_300,h_200,c_fill`)
- Underscore-prefixed parameters (e.g., `w_300`, `c_fill`, `l_overlay`)
- Common Cloudinary transformation prefixes: `w_`, `h_`, `c_`, `g_`, `q_`, `f_`, `e_`, `l_`, etc.

## Version Detection

The formatter automatically detects version numbers in the format `v` followed by digits (e.g., `v0`, `v1234567890`) and places them on a separate line.

## Public ID Handling

The public ID (your asset identifier) can span multiple path segments. The formatter keeps all public ID segments together on the final line.

Examples:

- `sample.jpg`
- `folder/subfolder/image.png`
- `figma-exports:6410!`

## Tips

1. **Copy URLs from Cloudinary**: Paste any Cloudinary URL into a `.cldt` file and format it to make it readable
2. **Edit Transformations**: Once formatted, you can easily modify individual transformation lines
3. **Rebuild URLs**: To convert back to a single-line URL, just remove the newlines (or copy-paste lines together)
4. **Version Control**: Formatted URLs produce much cleaner git diffs when you change transformations

## Known Limitations

- The formatter assumes standard Cloudinary URL structure
- Highly unusual or malformed URLs may not format correctly
- The formatter works best with URLs from `res.cloudinary.com`

## Troubleshooting

**Formatter not working?**

- Make sure your file has the `.cldt` extension
- Check that the URL starts with `http://` or `https://`
- Ensure the extension is activated (check language mode in bottom-right corner)

**Wrong formatting?**

- The URL structure might be non-standard
- Public ID might be misidentified if it contains transformation-like patterns
- Feel free to manually adjust the formatted output

## Future Enhancements

Planned features:

- Reverse formatter (multi-line back to single URL)
- Transformation validation and suggestions
- Live URL preview
- Transformation reordering

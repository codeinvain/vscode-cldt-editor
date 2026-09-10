# Quick Start Guide

## Get Started in 3 Steps

### 1. Run the Extension (Development Mode)

```bash
# Open this project in Cursor/VS Code
# Press F5 (or Run > Start Debugging)
```

A new window will open with the extension activated!

### 2. Try the URL Formatter

In the new window, open `examples/url.cldt` or create a new `.cldt` file with a Cloudinary URL:

```
https://res.cloudinary.com/demo/image/upload/w_400,h_300,c_fill/q_auto/f_webp/sample.jpg
```

Then press **Shift+Option+F** (macOS) or **Shift+Alt+F** (Windows/Linux) to format it.

**Result:**

```
https://res.cloudinary.com/demo/image/upload/
w_400,h_300,c_fill/
q_auto/
f_webp/
sample.jpg
```

**Try with conditionals and layers:**

```
https://res.cloudinary.com/demo/image/upload/if_width_gt_500/w_800/if_end/l_logo/x_10,y_10/fl_layer_apply/sample.jpg
```

**Formatted with Smart Indentation:**

```
https://res.cloudinary.com/demo/image/upload/
if_width_gt_500/
  w_800/
if_end/
l_logo/
  x_10,y_10/
  fl_layer_apply/
sample.jpg
```

### 3. Explore Features

- **Auto-completion**: Type transformation properties and press Ctrl+Space
- **Hover docs**: Hover over any keyword to see documentation
- **Snippets**: Type `cldt:` and see available snippets
- **Format on Save**: Enable in settings for automatic formatting

## Example Files

- `examples/example.cldt` - Regular CLDT syntax with transformations
- `examples/url.cldt` - Complex Cloudinary URL (your original URL)
- `examples/url-formatted.cldt` - Pre-formatted version showing expected output
- `examples/simple-url.cldt` - Simple URL example

## Features at a Glance

✅ Syntax highlighting for `.cldt` files
✅ IntelliSense with 100+ transformation properties
✅ Hover documentation
✅ Real-time validation
✅ Code snippets
✅ **URL Formatter** - breaks down complex URLs into readable format
✅ **Smart Indentation** - automatically indents conditionals and layers
✅ Format on save support

## Need Help?

- **Full Documentation**: See [README.md](README.md)
- **Formatter Guide**: See [FORMATTER.md](FORMATTER.md)
- **Installation**: See [INSTALL.md](INSTALL.md)

## Permanent Installation

To install permanently in Cursor/VS Code:

```bash
pnpm install -g @vscode/vsce
vsce package
```

Then: Extensions > "..." > Install from VSIX > Select `cldt-editor-0.1.0.vsix`

---

**Pro Tip**: Enable "Format on Save" in your settings to automatically format `.cldt` files whenever you save! 🚀

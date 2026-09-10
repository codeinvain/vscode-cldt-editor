# CLDT Editor

**Full IDE support for Cloudinary transformation files.** Write, read and maintain complex Cloudinary transformations as real source code — with syntax highlighting, IntelliSense, inline validation, formatting and a live preview.

> **Unofficial extension.** This is an independent community project. It is not affiliated with, endorsed by, or supported by Cloudinary Ltd.

---

## Why

Cloudinary transformation URLs are powerful and completely unreadable:

```
https://res.cloudinary.com/demo/image/upload/w_400,h_300,c_fill,g_auto/if_width_gt_500/w_800,q_auto:best/if_end/l_logo,w_200,x_10,y_10,g_north_east/fl_layer_apply/sample.jpg
```

CLDT Editor turns that into something you can actually review in a pull request:

```
https://res.cloudinary.com/demo/image/upload/
w_400,h_300,c_fill,g_auto/
if_width_gt_500/
  w_800,q_auto:best/
if_end/

l_logo,w_200/
  x_10,y_10/
  g_north_east/
  fl_layer_apply/

sample.jpg
```

## Features

### 🎨 Syntax highlighting

Color-coded keywords, properties, values and comments across all Cloudinary transformation parameters, including full variable support — assignment (`$name_value`), reference (`$name`, `$(name)`) and string literals (`!string!`).

### 💡 IntelliSense

Context-aware completion for transformation properties, crop modes, gravity options, effects and output formats. Press <kbd>Ctrl</kbd>+<kbd>Space</kbd> anywhere.

### 📖 Hover documentation

Hover any property for its documentation, usage examples and a direct link to the relevant Cloudinary docs page.

### ✅ Real-time validation

Syntax errors, out-of-range values (quality, opacity, angle), deprecated features and unmatched braces — flagged as you type.

### 🔧 Formatting

Format on save, or <kbd>Shift</kbd>+<kbd>Alt</kbd>+<kbd>F</kbd>. Breaks dense single-line URLs into readable multi-line form, with smart indentation for conditionals (`if_`/`if_end`) and layers (`l_`/`fl_layer_apply`), automatic spacing between blocks, and comment alignment.

### 👁 Live preview

<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd> (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd> on Windows/Linux) opens a side-by-side preview that re-renders as you edit.

### 📝 Snippets

Type a prefix and press <kbd>Tab</kbd>:

| Prefix | Inserts |
| --- | --- |
| `cldt:transform` | Basic transformation template |
| `cldt:resize` | Resize transformation |
| `cldt:effect` | Apply an effect |
| `cldt:overlay` | Add an overlay |
| `cldt:border` | Add a border |
| `cldt:radius` | Rounded corners |
| `cldt:if` | Conditional transformation |
| `cldt:genfill` | Generative fill |
| `cldt:bgremove` | Background removal |

## Getting started

1. Install the extension.
2. Create a file with a `.cldt` extension.
3. Start typing — or paste a Cloudinary URL and hit format.

```
# Basic transformation
width: 400
height: 300
crop: fill
gravity: auto
quality: auto:best
format: webp

# Effects
effect: background_removal
radius: 20

# Overlay
overlay: {
  source: "logo"
  width: 100
  gravity: south_east
  x: 10
  y: 10
  opacity: 80
}
```

## Commands

| Command | Shortcut |
| --- | --- |
| CLDT: Open Preview to the Side | <kbd>Cmd/Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd> |
| CLDT: Open Preview | — |
| CLDT: Refresh Preview | — |
| Format Document | <kbd>Shift</kbd>+<kbd>Alt</kbd>+<kbd>F</kbd> |

## Requirements

VS Code 1.75.0 or later. No configuration needed — it works out of the box.

## Feedback

Bug reports and feature requests are welcome at
[github.com/codeinvain/vscode-cldt-editor/issues](https://github.com/codeinvain/vscode-cldt-editor/issues).

## Contributing

Pull requests welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for local setup.

## License

[MIT](LICENSE) © Daniel Cohen.

Cloudinary is a trademark of Cloudinary Ltd. This project is independent and is
not affiliated with, endorsed by, or supported by Cloudinary Ltd.

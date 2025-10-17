# CLDT Editor - Cloudinary Transformation Language Support

A Visual Studio Code extension that provides comprehensive language support for `.cldt` (Cloudinary Transformation) files. This extension makes it easier to write and maintain Cloudinary image transformation configurations with syntax highlighting, IntelliSense, and validation.

## Features

### 🎨 Syntax Highlighting

- Full syntax highlighting for CLDT files
- Color-coded keywords, properties, values, and comments
- **Variable highlighting** - Cloudinary variables with proper syntax:
  - Variable assignment: `$name_value` (underscore `_` is the assignment operator)
  - Variable reference: `$name` or `$(name)`
  - String values: `!string!` (enclosed by exclamation marks)
- Support for hash (`#`) comments
- Support for all Cloudinary transformation parameters

### 💡 IntelliSense & Auto-completion

- Smart completion for transformation properties (width, height, crop, etc.)
- Suggestions for crop modes (scale, fit, fill, etc.)
- Gravity options (center, face, auto, etc.)
- Effect completions (blur, grayscale, background_removal, etc.)
- Format options (jpg, png, webp, avif, etc.)

### 📖 Hover Documentation

- Hover over any property to see detailed documentation
- Examples and usage information
- Direct links to Cloudinary documentation

### ✅ Real-time Validation

- Syntax error detection
- Value range validation (quality, opacity, angle)
- Deprecated feature warnings
- Unmatched brace detection

### 🔧 Code Formatting

- Auto-formatting with proper indentation
- **Cloudinary URL formatter** - breaks down complex URLs into readable line-by-line format
- Each transformation component on its own line
- **Smart indentation** for conditionals (`if_`/`if_end`) and layers (`l_`/`fl_layer_apply`)
- **Automatic spacing** - blank lines added after `if_end` and `fl_layer_apply` for better readability
- **Comment alignment** - inline comments aligned to column 30
- **Comment preservation** - hash (`#`) comments preserved during formatting
- Shows logical structure of complex transformations
- Format on save support

### 📝 Code Snippets

- Quick snippets for common transformations
- Predefined templates for effects, overlays, borders, and more

## Installation

### From VS Code Marketplace (Recommended)

1. Open VS Code
2. Go to Extensions (⇧⌘X on macOS, Ctrl+Shift+X on Windows/Linux)
3. Search for "CLDT Editor" or "Cloudinary Transformation"
4. Click "Install"

### From VSIX File (Manual Installation)

If you have a `.vsix` file (distributed privately or built locally):

**Via Command Line:**
\`\`\`bash
code --install-extension cldt-editor-0.1.0.vsix
\`\`\`

**Via VS Code UI:**
1. Download the `.vsix` file
2. Open VS Code
3. Go to Extensions (⇧⌘X on macOS, Ctrl+Shift+X on Windows/Linux)
4. Click the "..." menu at the top of the Extensions panel
5. Select "Install from VSIX..."
6. Choose the downloaded `.vsix` file

### Building from Source

\`\`\`bash
# Clone the repository
git clone https://github.com/CloudinaryLtd/ecosystems-components.git
cd ecosystems-components/vscode-ext-tx-editor

# Install dependencies
npm install

# Compile the extension
npm run compile

# Package the extension into .vsix file
npm run package
\`\`\`

This will create a `cldt-editor-0.1.0.vsix` file that you can install locally or share with others.

## Usage

### Creating a CLDT File

1. Create a new file with the `.cldt` extension
2. Start typing transformation properties
3. Use IntelliSense (Ctrl+Space) for suggestions

### Example CLDT File

\`\`\`cldt
// Basic image transformation
width: 400
height: 300
crop: fill
gravity: auto
quality: auto:best
format: webp

// Apply effects
effect: background_removal
radius: 20

// Add overlay
overlay: {
source: "logo"
width: 100
gravity: south_east
x: 10
y: 10
opacity: 80
}

// Border with rounded corners
border: 5px_solid_rgb:000000
radius: 15
\`\`\`

### Available Snippets

Type the following prefixes and press Tab:

- `cldt:transform` - Basic transformation template
- `cldt:resize` - Resize transformation
- `cldt:effect` - Apply an effect
- `cldt:overlay` - Add overlay
- `cldt:border` - Add border
- `cldt:radius` - Rounded corners
- `cldt:quality` - Set quality
- `cldt:format` - Set output format
- `cldt:if` - Conditional transformation
- `cldt:genfill` - Generative fill effect
- `cldt:bgremove` - Background removal

## Transformation Properties

### Size & Crop

- `width` (w) - Width in pixels
- `height` (h) - Height in pixels
- `crop` (c) - Crop/resize mode: scale, fit, fill, limit, etc.
- `aspect_ratio` (ar) - Aspect ratio (e.g., 16:9)

### Quality & Format

- `quality` (q) - Quality level (1-100 or auto:best, auto:good, auto:eco)
- `format` (f) - Output format (jpg, png, webp, avif, gif, etc.)
- `dpr` - Device pixel ratio for high-DPI displays

### Position & Gravity

- `gravity` (g) - Focus point: center, face, auto, auto:subject, etc.
- `zoom` (z) - Zoom level

### Effects

- `effect` (e) - Image effects:
  - Basic: blur, pixelate, grayscale, sepia
  - Artistic: oil_paint, cartoonify, vignette
  - Adjustments: brightness, contrast, saturation, hue
  - AI-powered: background_removal, generative_fill, generative_replace

### Style

- `angle` (a) - Rotation angle
- `border` (bo) - Border style (e.g., 5px_solid_black)
- `radius` (r) - Rounded corners (pixels or "max")
- `opacity` (o) - Opacity level (0-100)
- `color` (co) - Color value
- `background` (b) - Background color

### Layers

- `overlay` (l) - Add overlay layer
- `underlay` (u) - Add underlay layer

## Crop Modes

- `scale` - Scale to fit dimensions
- `fit` - Fit without cropping
- `fill` - Fill and crop if needed
- `limit` - Limit size without upscaling
- `lfill` - Limit and fill
- `fill_pad` - Fill with padding
- `crop` - Custom crop
- `thumb` - Thumbnail with face detection
- `auto` - Automatic crop mode

## Gravity Options

- Compass: `north_west`, `north`, `north_east`, `west`, `center`, `east`, `south_west`, `south`, `south_east`
- Smart: `auto`, `auto:subject`, `auto:face`, `auto:faces`, `auto:classic`
- Detection: `face`, `faces`, `body`, `ocr_text`

## Commands

- `Format Document` - Format your CLDT file (Shift+Alt+F on Windows/Linux, Shift+Option+F on macOS)
  - Formats regular CLDT syntax with proper indentation
  - **Formats Cloudinary URLs** - breaks complex single-line URLs into readable multi-line format

## URL Formatter

The extension includes a powerful URL formatter for Cloudinary transformation URLs with intelligent indentation. See [FORMATTER.md](FORMATTER.md) and [INDENTATION.md](INDENTATION.md) for detailed documentation.

**Basic Example:**

```
Before: https://res.cloudinary.com/demo/image/upload/w_400,h_300,c_fill/q_auto/sample.jpg

After:
https://res.cloudinary.com/demo/image/upload/
w_400,h_300,c_fill/
q_auto/
sample.jpg
```

**With Smart Indentation:**

```
https://res.cloudinary.com/demo/image/upload/
if_width_gt_500/
  w_800,h_600/
  q_auto:best/
if_end/
l_logo,w_200/
  x_10,y_10/
  g_north_east/
  fl_layer_apply/
sample.jpg
```

This makes complex transformation URLs much easier to read, edit, and version control!

## Configuration

No additional configuration required. The extension works out of the box with sensible defaults.

## Development

### Project Structure

\`\`\`
vscode-ext-tx-editor/
├── src/
│ ├── extension.ts # Extension entry point
│ ├── completionProvider.ts # IntelliSense
│ ├── hoverProvider.ts # Hover documentation
│ ├── definitionProvider.ts # Go-to-definition
│ ├── formattingProvider.ts # Code formatting
│ └── diagnostics.ts # Validation & linting
├── syntaxes/
│ └── cldt.tmLanguage.json # Syntax highlighting
├── snippets/
│ └── cldt.json # Code snippets
├── language-configuration.json # Language config
├── package.json # Extension manifest
└── tsconfig.json # TypeScript config
\`\`\`

### Running in Development Mode

1. Open the project in VS Code
2. Press F5 to start debugging
3. A new VS Code window will open with the extension loaded
4. Create a `.cldt` file to test the extension

### Testing

\`\`\`bash
npm run compile
npm run test
\`\`\`

## Publishing

### Prerequisites for Publishing to VS Code Marketplace

1. **Create a Publisher Account:**
   - Go to [Visual Studio Marketplace](https://marketplace.visualstudio.com/)
   - Sign in with your Microsoft account
   - Create a publisher ID if you don't have one

2. **Generate a Personal Access Token (PAT):**
   - Visit [Azure DevOps](https://dev.azure.com/)
   - Go to User Settings → Personal Access Tokens
   - Create a new token with **Marketplace (Publish)** scope
   - Save the token securely (you won't be able to see it again)

3. **Login with vsce:**
   \`\`\`bash
   npx vsce login <your-publisher-name>
   \`\`\`
   Enter your Personal Access Token when prompted.

### Publishing Steps

1. **Update Version Number:**
   \`\`\`bash
   # Update version in package.json (e.g., from 0.1.0 to 0.1.1)
   npm version patch  # for bug fixes
   npm version minor  # for new features
   npm version major  # for breaking changes
   \`\`\`

2. **Build and Test:**
   \`\`\`bash
   npm run compile
   npm run lint
   # Test the extension thoroughly
   \`\`\`

3. **Package the Extension:**
   \`\`\`bash
   npm run package
   \`\`\`
   This creates a `.vsix` file you can test locally before publishing.

4. **Publish to Marketplace:**
   \`\`\`bash
   npm run publish
   \`\`\`
   Or with explicit version bump:
   \`\`\`bash
   npx vsce publish patch  # Increments patch version and publishes
   npx vsce publish minor  # Increments minor version and publishes
   npx vsce publish major  # Increments major version and publishes
   \`\`\`

### Private Distribution (Alternative)

If you don't want to publish publicly, you can distribute the `.vsix` file directly:

1. **Build the package:**
   \`\`\`bash
   npm run package
   \`\`\`

2. **Share the `.vsix` file** via:
   - Email or file sharing service
   - Internal package repository
   - GitHub releases page

3. **Users install with:**
   \`\`\`bash
   code --install-extension cldt-editor-0.1.0.vsix
   \`\`\`

### Publishing Checklist

Before publishing, ensure:
- [ ] Version number is updated in `package.json`
- [ ] `CHANGELOG.md` is updated with changes
- [ ] All tests pass
- [ ] No linter errors
- [ ] README is up to date
- [ ] LICENSE file exists
- [ ] Extension works in a fresh VS Code installation
- [ ] Screenshots/GIFs are current (if applicable)

### Useful Publishing Commands

\`\`\`bash
# Check what will be published
npx vsce ls

# View package contents as a tree
npx vsce ls --tree

# Package without publishing
npm run package

# Unpublish a version (use with caution!)
npx vsce unpublish <publisher>.<extension-name>@<version>
\`\`\`

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Transformation Reference](https://cloudinary.com/documentation/transformation_reference)
- [VS Code Extension API](https://code.visualstudio.com/api)

## License

MIT

## Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.

---

**Enjoy writing Cloudinary transformations with full IDE support!** 🚀

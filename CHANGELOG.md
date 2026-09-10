# Changelog

All notable changes to the CLDT Editor extension will be documented in this file.

## [0.1.0] - 2026-09-10

### Added

- Initial release of CLDT Editor
- Language support for `.cldt` (Cloudinary Transformation) files
- Syntax highlighting for transformation properties and values
- IntelliSense with auto-completion for:
  - Transformation properties (width, height, crop, etc.)
  - Crop modes (scale, fit, fill, etc.)
  - Gravity options (center, face, auto, etc.)
  - Effects (blur, grayscale, background_removal, etc.)
  - Format options (jpg, png, webp, avif, etc.)
- Hover documentation for all transformation properties
- Real-time diagnostics and validation:
  - Syntax error detection
  - Value range validation (quality, opacity, angle)
  - Deprecated feature warnings
- Code snippets for common transformations
- Document formatting with proper indentation
- **Cloudinary URL Formatter**:
  - Automatically detects Cloudinary URLs in `.cldt` files
  - Formats complex single-line URLs into readable multi-line format
  - Each transformation component on its own line
  - **Smart indentation for logical structure**:
    - Conditionals (`if_` ... `if_end`) create indentation levels
    - Layers (`l_` ... `fl_layer_apply`) create indentation levels
    - Clearly shows nested transformations
  - Preserves version and public-id structure
  - Intelligent detection of transformation vs. public-id components
- Go-to-definition support for variables and overlays
- VS Code language configuration (brackets, comments, auto-closing pairs)

### Features

- TypeScript-based extension for reliability and maintainability
- Comprehensive test coverage
- Development mode support (Press F5)
- Easy packaging for distribution

### Documentation

- Complete README with usage examples
- FORMATTER.md with detailed URL formatter documentation
- INSTALL.md with installation instructions
- Example CLDT files demonstrating various features
- Inline code documentation

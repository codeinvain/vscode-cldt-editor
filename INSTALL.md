# Installing the CLDT Extension

## Quick Install (Recommended)

Since you're developing the extension locally, the easiest way to test it is:

### Option 1: Run in Development Mode

1. Open this project folder in VS Code
2. Press `F5` (or Run > Start Debugging)
3. A new VS Code window will open with the extension loaded
4. In that new window, open or create a `.cldt` file
5. The language mode should automatically activate!

### Option 2: Install as Extension

If you want to install it permanently in your VS Code:

1. **Package the extension:**

   ```bash
   npm install -g @vscode/vsce
   vsce package
   ```

   This creates a `.vsix` file.

2. **Install the .vsix file:**

   - Open VS Code
   - Go to Extensions (Cmd+Shift+X)
   - Click the "..." menu at the top
   - Select "Install from VSIX..."
   - Choose the generated `.vsix` file

3. **Reload VS Code**
   - After installation, reload VS Code
   - Open any `.cldt` file and it should work!

## Troubleshooting

### Language mode not showing?

1. Make sure the file has the `.cldt` extension
2. Check the language mode in the bottom-right corner of VS Code
3. Click on the language mode and select "CLDT" or "Cloudinary Transformation"
4. If it's not listed, reload VS Code (Cmd+Shift+P > "Reload Window")

### Extension not activating?

1. Check the Extension Host output: View > Output > "Extension Host"
2. Look for any error messages
3. Make sure the extension compiled successfully: `npm run compile`

### Changes not reflecting?

If you're developing and making changes:

1. Run `npm run compile` after each change
2. In the Extension Development Host window, reload: Cmd+R (macOS) or Ctrl+R (Windows/Linux)

## Current Status

✅ Extension compiled successfully
✅ Ready to run in development mode (Press F5)

To use it immediately:

1. Press F5 in VS Code while this project is open
2. In the new window, open `/examples/example.cldt`
3. You should see syntax highlighting and IntelliSense!

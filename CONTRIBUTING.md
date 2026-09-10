# Development

## Prerequisites

This project uses [pnpm](https://pnpm.io/):

```bash
npm install --global corepack@latest
corepack enable pnpm
```

## Setup

```bash
pnpm install
pnpm run compile
```

Press <kbd>F5</kbd> in VS Code to launch an Extension Development Host, then open a `.cldt` file to exercise the extension.

## Project structure

```
src/
  extension.ts            # entry point
  completionProvider.ts   # IntelliSense
  hoverProvider.ts        # hover documentation
  definitionProvider.ts   # go-to-definition
  formattingProvider.ts   # formatting + URL formatter
  diagnostics.ts          # validation & linting
  decorationProvider.ts   # inline hints
  previewProvider.ts      # live preview webview
  templates/              # preview webview HTML
syntaxes/cldt.tmLanguage.json
snippets/cldt.json
language-configuration.json
docs/                     # design & implementation notes
examples/                 # sample .cldt files
```

## Checks

```bash
pnpm run lint
pnpm run compile
pnpm run test
```

## Packaging

```bash
pnpm run package        # produces a .vsix
code --install-extension cldt-editor-<version>.vsix
```

`--no-dependencies` is baked into the script: this project has no runtime
dependencies, and vsce's npm-based dependency walk misbehaves against pnpm's
symlinked `node_modules`.

## Publishing

Publishing goes to the `codeinvain` publisher on the Visual Studio Marketplace.

1. Update `CHANGELOG.md`.
2. Verify the VSIX contents: `npx vsce ls --tree`.
3. Install the built VSIX into a clean VS Code and smoke-test it.
4. Publish:

```bash
export VSCE_PAT=<personal access token>
pnpm run publish            # or: npx vsce publish minor --no-dependencies
```

The PAT comes from Azure DevOps → User settings → Personal Access Tokens, scoped
to **All accessible organizations** with **Marketplace → Manage**. Tokens expire
after at most a year.

## Notes

`docs/` contains working notes accumulated during development. They are excluded
from the published VSIX via `.vscodeignore` and are not user-facing documentation.

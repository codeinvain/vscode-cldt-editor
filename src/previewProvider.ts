import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

interface Hint {
  message: string;
  type: "warning" | "info" | "error";
}

interface UrlBindingContext {
  prefix?: string;
  suffix?: string;
  cloudName?: string;
  publicId?: string;
}
interface BoundUrl {
  url: string;
  bindings: {
    prefix?: Binding;
    suffix?: Binding;
    cloudName?: Binding;
    publicId?: Binding;
  };
}

interface Binding {
  src: "cldtrc" | "annotation";
  value: string;
}

export class CldtPreviewProvider {
  private static readonly viewType = "cldt.preview";
  private panel: vscode.WebviewPanel | undefined;
  private disposables: vscode.Disposable[] = [];
  private currentDocument: vscode.TextDocument | undefined;
  private lastUrl: string | undefined;

  constructor(private readonly extensionUri: vscode.Uri) {}

  private analyzeHints(cldHeaders: { [key: string]: string }, url: string, documentText: string): Hint[] {
    const hints: Hint[] = [];

    // Track if we've already added specific hints for errors
    let hasSpecificErrorHint = false;

    // Check URL for common issues
    if (url.includes("w_") || url.includes("h_")) {
      const widthMatch = url.match(/w_([0-9.]+)/);
      const heightMatch = url.match(/h_([0-9.]+)/);

      if (widthMatch && widthMatch[1].includes(".")) {
        const lineNumber = this.findParameterLine(documentText, `w_${widthMatch[1]}`);
        hints.push({
          message: `Line ${lineNumber}: Width parameter 'w_${widthMatch[1]}' contains a decimal point. Use an integer value instead (e.g., w_${Math.round(
            parseFloat(widthMatch[1])
          )}).`,
          type: "warning",
        });
        hasSpecificErrorHint = true;
      }

      if (heightMatch && heightMatch[1].includes(".")) {
        const lineNumber = this.findParameterLine(documentText, `h_${heightMatch[1]}`);
        hints.push({
          message: `Line ${lineNumber}: Height parameter 'h_${heightMatch[1]}' contains a decimal point. Use an integer value instead (e.g., h_${Math.round(
            parseFloat(heightMatch[1])
          )}).`,
          type: "warning",
        });
        hasSpecificErrorHint = true;
      }
    }

    // Check for x-cld-error header and extract specific error details
    const cldError = cldHeaders["x-cld-error"];
    if (cldError) {
      // Check for invalid variable assignment error: "Invalid assignment to $varName: value"
      const invalidAssignmentMatch = cldError.match(/Invalid assignment to (\$[\w]+):\s*(.+)$/);
      if (invalidAssignmentMatch) {
        const varName = invalidAssignmentMatch[1];
        const invalidValue = invalidAssignmentMatch[2].trim();
        const lineNumber = this.findParameterLine(documentText, varName);
        hints.push({
          message: `Line ${lineNumber}: Invalid assignment to variable '${varName}' with value '${invalidValue}'. Check the variable syntax and value format.`,
          type: "error",
        });
        hasSpecificErrorHint = true;
      }
      // Check for variable used before assignment: "Variable $varName is used before being assigned"
      else {
        const usedBeforeAssignmentMatch = cldError.match(/Variable (\$[\w]+) is used before being assigned/);
        if (usedBeforeAssignmentMatch) {
          const varName = usedBeforeAssignmentMatch[1];
          const lineNumber = this.findParameterLine(documentText, varName);
          hints.push({
            message: `Line ${lineNumber}: Variable '${varName}' is used before being assigned. Define the variable before using it, or check for typos in the variable name.`,
            type: "error",
          });
          hasSpecificErrorHint = true;
        }
        // Check for invalid transformation component errors
        else {
          const invalidComponentMatch = cldError.match(/Invalid transformation component - (.+?)(?:\s|$)/);
          if (invalidComponentMatch) {
            const component = invalidComponentMatch[1].trim();
            const lineNumber = this.findParameterLine(documentText, component);
            hints.push({
              message: `Line ${lineNumber}: Invalid transformation component - ${component}`,
              type: "error",
            });
            hasSpecificErrorHint = true;
          }
          // Only show generic error if we don't have specific hints
          else if (!hasSpecificErrorHint) {
            // Try to extract any component from the error message and find its line
            const lineNumber = this.findErrorLine(documentText, cldError);
            if (lineNumber > 1) {
              hints.push({
                message: `Line ${lineNumber}: ${cldError}`,
                type: "error",
              });
            } else {
              hints.push({
                message: `Cloudinary error: ${cldError}`,
                type: "error",
              });
            }
          }
        }
      }
    }

    // Check for other common issues
    if (url.includes("c_scale") && !url.includes("w_") && !url.includes("h_")) {
      const lineNumber = this.findParameterLine(documentText, "c_scale");
      hints.push({
        message: `Line ${lineNumber}: Using c_scale without width or height parameter. Consider adding w_ or h_ to specify dimensions.`,
        type: "info",
      });
    }

    return hints;
  }

  private findParameterLine(documentText: string, parameter: string): number {
    const lines = documentText.split("\n");

    // If parameter is a variable (starts with $), look for both $var and $(var) syntax
    if (parameter.startsWith("$")) {
      const varName = parameter.substring(1); // Remove the $
      const searchPatterns = [
        parameter, // $varName
        `$(${varName})`, // $(varName)
        `$${varName}_`, // $varName_ (assignment)
      ];

      // First, try to find the variable being used (not in assignments or conditionals)
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Skip assignment lines (lines with $var_value syntax at the start)
        if (line.trim().startsWith(`$${varName}_`)) {
          continue;
        }
        // Skip if_isndef/if_ndef conditional checks
        if (line.includes(`if_isndef_${parameter}`) || line.includes(`if_ndef_${parameter}`)) {
          continue;
        }

        // Check if any of the patterns exist in the line
        for (const pattern of searchPatterns) {
          if (line.includes(pattern)) {
            return i + 1; // Line numbers are 1-based
          }
        }
      }

      // If not found in usage, look for assignment or any occurrence
      for (let i = 0; i < lines.length; i++) {
        for (const pattern of searchPatterns) {
          if (lines[i].includes(pattern)) {
            return i + 1;
          }
        }
      }
    } else {
      // For non-variable parameters, use simple search
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(parameter)) {
          return i + 1; // Line numbers are 1-based
        }
      }
    }

    return 1; // Default to line 1 if not found
  }

  private findErrorLine(documentText: string, errorMessage: string): number {
    // Try to extract potential components from the error message
    // Common patterns: quoted strings, parameter names, etc.
    const lines = documentText.split("\n");

    // Try to find quoted strings in the error message
    const quotedMatch = errorMessage.match(/['"`]([^'"`]+)['"`]/);
    if (quotedMatch) {
      const searchTerm = quotedMatch[1];
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(searchTerm)) {
          return i + 1;
        }
      }
    }

    // Try to find transformation parameters (e.g., "w_100", "c_fill")
    const paramMatch = errorMessage.match(/\b([a-z_]+_[a-z0-9_:]+)\b/i);
    if (paramMatch) {
      const searchTerm = paramMatch[1];
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(searchTerm)) {
          return i + 1;
        }
      }
    }

    return 1; // Default to line 1 if not found
  }

  public showPreview(document: vscode.TextDocument) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn! + 1 : vscode.ViewColumn.Two;

    if (this.panel) {
      // If panel exists, reveal it and update content
      this.panel.reveal(column);
      this.currentDocument = document;
      this.updateContent(document);
    } else {
      // Create new panel
      this.panel = vscode.window.createWebviewPanel(CldtPreviewProvider.viewType, "CLDT Preview", column, {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [this.extensionUri],
      });

      this.currentDocument = document;
      this.updateContent(document);

      // Handle panel disposal
      this.panel.onDidDispose(
        () => {
          this.dispose();
        },
        null,
        this.disposables
      );

      // Handle messages from the webview
      this.panel.webview.onDidReceiveMessage(
        async (message) => {
          switch (message.command) {
            case "copyUrl":
              vscode.env.clipboard.writeText(message.url);
              vscode.window.showInformationMessage("URL copied to clipboard");
              break;
            case "openInBrowser":
              vscode.env.openExternal(vscode.Uri.parse(message.url));
              break;
            case "fetchHeaders":
              if (this.currentDocument) {
                await this.fetchAndSendHeaders(message.url, this.currentDocument.getText());
              }
              break;
          }
        },
        null,
        this.disposables
      );
    }
  }

  public updateContent(document: vscode.TextDocument) {
    if (!this.panel) {
      return;
    }

    const boundUrl = this.evaluateUrl(document);

    // Only update if the URL has changed
    if (this.lastUrl === boundUrl.url) {
      return;
    }

    this.lastUrl = boundUrl.url;
    this.panel.webview.html = this.getHtmlContent(boundUrl, document.fileName);
  }

  private evaluateUrl(document: vscode.TextDocument): BoundUrl {
    const text = document.getText().trim();

    const annotations = this.parseAnnotations(text);
    const config = this.readConfigFile(document.uri);

    // Merge file config with annotations (annotations take precedence)

    // Fall back to original behavior: Look for Cloudinary URLs in the document
    const lines = text
      .split("\n")
      .map((line) => line.replace(/#.*$/, "").trim())
      .filter((line) => line.trim().length > 0);
    const url = lines.join("");
    return this.bindContextIfNeeded(url, config, annotations);
  }

  private readConfigFile(documentUri: vscode.Uri): UrlBindingContext {
    try {
      // Get the directory of the current document
      const documentDir = path.dirname(documentUri.fsPath);
      const configPath = path.join(documentDir, ".cldtrc.json");

      // Check if config file exists
      if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, "utf8");
        const config = JSON.parse(configContent);

        // Return only the valid UrlBindingContext properties
        return {
          prefix: config.prefix,
          suffix: config.suffix,
          cloudName: config["cloud-name"], // Support both formats
          publicId: config["public-id"], // Support both formats
        };
      }
    } catch (error) {
      // Silently ignore errors (file not found, invalid JSON, etc.)
      console.warn("Failed to read .cldtrc.json:", error);
    }

    return {};
  }
  private bindContextIfNeeded(url: string, config: UrlBindingContext, annotations: UrlBindingContext): BoundUrl {
    const boundUrl: BoundUrl = {
      url,
      bindings: {},
    };

    if (url.startsWith("https://")) {
      return boundUrl;
    }

    const merged = { ...config, ...annotations };
    let constructedUrl = url;

    // Build URL based on which bindings are present
    if (merged.prefix) {
      constructedUrl = `${merged.prefix}${constructedUrl}`;
      boundUrl.bindings.prefix = {
        src: annotations.prefix ? "annotation" : "cldtrc",
        value: merged.prefix,
      };
    }

    if (merged.suffix) {
      constructedUrl = `${constructedUrl}${merged.suffix}`;
      boundUrl.bindings.suffix = {
        src: annotations.suffix ? "annotation" : "cldtrc",
        value: merged.suffix,
      };
    }

    if (merged.cloudName && !merged.prefix) {
      constructedUrl = `https://res.cloudinary.com/${merged.cloudName}/image/upload/${constructedUrl}`;
      boundUrl.bindings.cloudName = {
        src: annotations.cloudName ? "annotation" : "cldtrc",
        value: merged.cloudName,
      };
    }

    if (merged.publicId && !merged.suffix) {
      constructedUrl = `${constructedUrl}/v0/${merged.publicId}`;
      boundUrl.bindings.publicId = {
        src: annotations.publicId ? "annotation" : "cldtrc",
        value: merged.publicId,
      };
    }

    boundUrl.url = constructedUrl;
    return boundUrl;
  }

  private parseAnnotations(text: string): UrlBindingContext {
    const annotations: UrlBindingContext = {};

    const lines = text.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();

      // Parse @cld/prefix directive
      const prefixMatch = trimmed.match(/^#\s*@cld\/prefix\s+(.+)$/);
      if (prefixMatch) {
        annotations.prefix = prefixMatch[1].trim();
        continue;
      }

      // Parse @cld/suffix directive
      const suffixMatch = trimmed.match(/^#\s*@cld\/suffix\s+(.+)$/);
      if (suffixMatch) {
        annotations.suffix = suffixMatch[1].trim();
        continue;
      }

      // Parse @cld/cloud-name directive
      const cloudNameMatch = trimmed.match(/^#\s*@cld\/cloud-name\s+(.+)$/);
      if (cloudNameMatch) {
        annotations.cloudName = cloudNameMatch[1].trim();
        continue;
      }

      // Parse @cld/public-id directive
      const publicIdMatch = trimmed.match(/^#\s*@cld\/public-id\s+(.+)$/);
      if (publicIdMatch) {
        annotations.publicId = publicIdMatch[1].trim();
        continue;
      }
    }

    return annotations;
  }

  private async fetchAndSendHeaders(url: string, documentText: string) {
    if (!this.panel) {
      return;
    }

    try {
      const https = await import("https");
      const http = await import("http");

      const urlObj = new URL(url);
      const client = urlObj.protocol === "https:" ? https : http;
      const cldHeaderPatterns = [/^x-request-id$/, /^x-cld.*$/];
      return new Promise<void>((resolve) => {
        const req = client.request(url, { method: "GET", headers: { "cache-control": "no-cache" } }, (res) => {
          const cldHeaders: { [key: string]: string } = {};
          const otherHeaders: { [key: string]: string } = {};

          Object.entries(res.headers).forEach(([key, value]) => {
            const headerValue = Array.isArray(value) ? value.join(", ") : value || "";
            if (cldHeaderPatterns.some((regex) => regex.test(key))) {
              cldHeaders[key] = headerValue;
            } else {
              otherHeaders[key] = headerValue;
            }
          });

          // Analyze hints based on headers, URL, and document text
          const hints = this.analyzeHints(cldHeaders, url, documentText);

          this.panel?.webview.postMessage({
            command: "headersReceived",
            cldHeaders: cldHeaders,
            otherHeaders: otherHeaders,
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            hints: hints,
          });

          resolve();
        });

        req.on("error", (error) => {
          this.panel?.webview.postMessage({
            command: "headersFailed",
            error: error.message,
          });
          resolve();
        });

        req.end();
      });
    } catch (error) {
      this.panel.webview.postMessage({
        command: "headersFailed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  private getHtmlContent(boundUrl: BoundUrl | null, fileName: string): string {
    const nonce = this.getNonce();

    if (!boundUrl || !boundUrl.url) {
      return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
    <title>CLDT Preview</title>
    <style>
        body {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
        }
        .error-message {
            text-align: center;
            padding: 20px;
        }
        .error-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
    </style>
</head>
<body>
    <div class="error-message">
        <div class="error-icon">⚠️</div>
        <h2>No Cloudinary URL Found</h2>
        <p>Please add a valid Cloudinary transformation URL to preview the image.</p>
        <p style="font-size: 0.9em; color: var(--vscode-descriptionForeground);">
            Expected format: https://res.cloudinary.com/...
        </p>
    </div>
</body>
</html>`;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; script-src 'nonce-${nonce}'; style-src 'unsafe-inline';">
    <title>CLDT Preview</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        .header {
            padding: 12px 16px;
            background-color: var(--vscode-sideBar-background);
            border-bottom: 1px solid var(--vscode-panel-border);
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
        }
        .header-left {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            min-width: 0;
        }
        .file-name {
            font-size: 13px;
            font-weight: 600;
            color: var(--vscode-foreground);
        }
        .status {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
        }
        .status-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: var(--vscode-terminal-ansiGreen);
        }
        .status-dot.loading {
            background-color: var(--vscode-terminal-ansiYellow);
            animation: pulse 1.5s ease-in-out infinite;
        }
        .status-dot.error {
            background-color: var(--vscode-terminal-ansiRed);
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .header-actions {
            display: flex;
            gap: 8px;
        }
        .btn {
            padding: 4px 12px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 2px;
            cursor: pointer;
            font-size: 12px;
            font-family: var(--vscode-font-family);
            transition: background-color 0.1s;
        }
        .btn:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        .btn:active {
            transform: translateY(1px);
        }
        .btn-secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        .btn-secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
        .content {
            flex: 1;
            overflow: auto;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background-color: var(--vscode-editor-background);
        }
        .image-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            max-width: 100%;
            max-height: 100%;
        }
        .image-wrapper {
            position: relative;
            background: repeating-conic-gradient(#80808020 0% 25%, transparent 0% 50%) 50% / 20px 20px;
            border-radius: 4px;
            padding: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #preview-image {
            max-width: 100%;
            max-height: calc(100vh - 200px);
            height: auto;
            display: block;
            border-radius: 2px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        .image-info {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 12px;
            background-color: var(--vscode-sideBar-background);
            border-radius: 4px;
            font-size: 12px;
            max-width: 100%;
        }
        .info-row {
            display: flex;
            gap: 8px;
            align-items: center;
        }
        .info-label {
            color: var(--vscode-descriptionForeground);
            min-width: 80px;
        }
        .info-value {
            color: var(--vscode-foreground);
            font-family: var(--vscode-editor-font-family);
        }
        .url-section {
            width: 100%;
            padding: 12px;
            background-color: var(--vscode-sideBar-background);
            border-top: 1px solid var(--vscode-panel-border);
            flex-shrink: 0;
        }
        .url-label {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .url-display {
            display: flex;
            gap: 8px;
            align-items: center;
        }
        .url-text {
            flex: 1;
            padding: 6px 10px 16px 10px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 2px;
            font-family: var(--vscode-editor-font-family);
            font-size: 11px;
            overflow: scroll;
            white-space: nowrap;
            
        }
        .bindings-info {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 8px;
            font-size: 11px;
        }
        .binding-item {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 3px 8px;
            background-color: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            border-radius: 3px;
            font-family: var(--vscode-editor-font-family);
        }
        .binding-label {
            font-weight: 600;
        }
        .binding-value {
            opacity: 0.9;
        }
        .binding-source {
            margin-left: 4px;
            padding: 1px 4px;
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 2px;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        .binding-source.cldtrc {
            background-color: rgba(75, 181, 67, 0.3);
        }
        .binding-source.annotation {
            background-color: rgba(0, 122, 204, 0.3);
        }
        .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--vscode-editor-background);
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid var(--vscode-progressBar-background);
            border-top-color: var(--vscode-button-background);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .error-display {
            text-align: center;
            padding: 40px 20px;
            color: var(--vscode-errorForeground);
        }
        .error-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
        .hints-container {
            background-color: var(--vscode-sideBar-background);
            border-bottom: 1px solid var(--vscode-panel-border);
            padding: 0;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-out, padding 0.3s ease-out;
        }
        .hints-container.visible {
            max-height: 500px;
            padding: 12px 16px;
        }
        .hint-item {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 10px 12px;
            margin-bottom: 8px;
            border-radius: 4px;
            font-size: 12px;
            line-height: 1.5;
            border-left: 3px solid;
        }
        .hint-item:last-child {
            margin-bottom: 0;
        }
        .hint-item.warning {
            background-color: rgba(255, 191, 0, 0.1);
            border-left-color: var(--vscode-terminal-ansiYellow);
        }
        .hint-item.error {
            background-color: rgba(255, 0, 0, 0.1);
            border-left-color: var(--vscode-errorForeground);
        }
        .hint-item.info {
            background-color: rgba(0, 122, 204, 0.1);
            border-left-color: var(--vscode-charts-blue);
        }
        .hint-icon {
            font-size: 18px;
            flex-shrink: 0;
        }
        .hint-message {
            flex: 1;
            color: var(--vscode-foreground);
        }
        .hints-header {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-left">
            <div class="file-name">${this.escapeHtml(fileName.split("/").pop() || "")}</div>
            <div class="status">
                <span class="status-dot loading" id="status-dot"></span>
                <span id="status-text">Loading...</span>
            </div>
        </div>
        <div class="header-actions">
            <button class="btn btn-secondary" id="copy-url-btn">📋 Copy URL</button>
            <button class="btn" id="open-browser-btn">🌐 Open in Browser</button>
        </div>
    </div>
    
    <div class="hints-container" id="hints-container">
        <div class="hints-header">Hints & Warnings</div>
        <div id="hints-list"></div>
    </div>
    
    <div class="content" id="content">
        <div class="image-container">
            <div class="image-wrapper">
                <div class="loading-overlay" id="loading">
                    <div class="spinner"></div>
                </div>
                <img id="preview-image" style="display: none;" alt="Cloudinary transformation preview">
            </div>
            <div class="image-info" id="image-info" style="display: none;">
                <div class="info-row">
                    <span class="info-label">Dimensions:</span>
                    <span class="info-value" id="dimensions">-</span>
                </div>
                <div class="info-row">
                    <span class="info-label">File Size:</span>
                    <span class="info-value" id="file-size">-</span>
                </div>
            </div>
        </div>
    </div>
    
    <div class="url-section">
        <div class="url-label">Cloudinary Transformation URL</div>
        <div class="url-display">
            <div class="url-text" title="${this.escapeHtml(boundUrl.url)}">${this.escapeHtml(boundUrl.url)}</div>
        </div>
        ${this.generateBindingsHtml(boundUrl.bindings)}
    </div>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        const imageUrl = ${JSON.stringify(boundUrl.url)};
        const img = document.getElementById('preview-image');
        const loading = document.getElementById('loading');
        const statusDot = document.getElementById('status-dot');
        const statusText = document.getElementById('status-text');
        const imageInfo = document.getElementById('image-info');
        const content = document.getElementById('content');
        const hintsContainer = document.getElementById('hints-container');
        const hintsList = document.getElementById('hints-list');

        function displayHints(hints) {
            if (!hints || hints.length === 0) {
                hintsContainer.classList.remove('visible');
                return;
            }

            const getHintIcon = (type) => {
                switch(type) {
                    case 'warning': return '⚠️';
                    case 'error': return '❌';
                    case 'info': return 'ℹ️';
                    default: return '💡';
                }
            };

            const hintsHtml = hints.map(hint => \`
                <div class="hint-item \${hint.type}">
                    <span class="hint-icon">\${getHintIcon(hint.type)}</span>
                    <span class="hint-message">\${hint.message}</span>
                </div>
            \`).join('');

            hintsList.innerHTML = hintsHtml;
            hintsContainer.classList.add('visible');
        }

        // Set up button event listeners
        document.getElementById('copy-url-btn').addEventListener('click', () => {
            vscode.postMessage({
                command: 'copyUrl',
                url: imageUrl
            });
        });

        document.getElementById('open-browser-btn').addEventListener('click', () => {
            vscode.postMessage({
                command: 'openInBrowser',
                url: imageUrl
            });
        });

        function formatBytes(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
        }

        img.onload = function() {
            loading.style.display = 'none';
            img.style.display = 'block';
            imageInfo.style.display = 'flex';
            
            statusDot.classList.remove('loading');
            statusText.textContent = 'Ready';
            
            // Update image info
            document.getElementById('dimensions').textContent = img.naturalWidth + ' × ' + img.naturalHeight + ' px';
            
            // Fetch headers to get file size and display Cloudinary headers
            vscode.postMessage({
                command: 'fetchHeaders',
                url: imageUrl
            });
        };

        img.onerror = function() {
            loading.style.display = 'none';
            statusDot.classList.remove('loading');
            statusDot.classList.add('error');
            statusText.textContent = 'Error loading image';
            
            // Show loading message while fetching headers
            content.innerHTML = \`
                <div class="error-display">
                    <div class="error-icon">❌</div>
                    <h2>Failed to Load Image</h2>
                    <p style="margin-bottom: 16px;">Fetching Cloudinary headers...</p>
                </div>
            \`;
            
            // Request headers from the extension
            vscode.postMessage({
                command: 'fetchHeaders',
                url: imageUrl
            });
        };

        // Listen for messages from the extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.command) {
                case 'headersReceived':
                    const cldHeaders = message.cldHeaders;
                    const otherHeaders = message.otherHeaders;
                    
                    // Display hints if available
                    if (message.hints) {
                        displayHints(message.hints);
                    }
                    
                    // Check if we're in error mode or success mode
                    if (img.style.display === 'none') {
                        // Error mode - display full headers in content area
                        const cldHeadersList = Object.keys(cldHeaders).length > 0
                            ? Object.entries(cldHeaders)
                                .map(([key, value]) => \`<li><strong>\${key}:</strong> \${value}</li>\`)
                                .join('')
                            : '<li style="color: var(--vscode-descriptionForeground); font-style: italic;">No Cloudinary headers found</li>';
                        
                        const otherHeadersList = Object.keys(otherHeaders).length > 0
                            ? Object.entries(otherHeaders)
                                .map(([key, value]) => \`<li><strong>\${key}:</strong> \${value}</li>\`)
                                .join('')
                            : '<li style="color: var(--vscode-descriptionForeground); font-style: italic;">No other headers found</li>';
                        
                        const statusInfo = message.statusCode 
                            ? \`<p style="margin-bottom: 16px; color: var(--vscode-descriptionForeground);">HTTP Status: \${message.statusCode} \${message.statusMessage || ''}</p>\`
                            : '';
                        
                        content.innerHTML = \`
                            <div class="error-display">
                                <div class="error-icon">❌</div>
                                <h2>Failed to Load Image</h2>
                                \${statusInfo}
                                
                                <div style="max-width: 800px; width: 100%;">
                                    <h3 style="margin: 24px 0 12px 0; text-align: left; font-size: 14px;">Cloudinary Headers</h3>
                                    <ul style="text-align: left; line-height: 1.8; background: var(--vscode-textBlockQuote-background); padding: 16px 24px; border-radius: 4px; border-left: 4px solid var(--vscode-charts-blue); margin: 0;">
                                        \${cldHeadersList}
                                    </ul>
                                    
                                    <h3 style="margin: 24px 0 12px 0; text-align: left; font-size: 14px;">Other Headers</h3>
                                    <ul style="text-align: left; line-height: 1.8; background: var(--vscode-textBlockQuote-background); padding: 16px 24px; border-radius: 4px; border-left: 4px solid var(--vscode-textBlockQuote-border); margin: 0;">
                                        \${otherHeadersList}
                                    </ul>
                                </div>
                            </div>
                        \`;
                    } else {
                        // Success mode - update file size and append Cloudinary headers to image-info
                        
                        // Update file size from content-length header
                        const contentLength = otherHeaders['content-length'];
                        if (contentLength) {
                            document.getElementById('file-size').textContent = formatBytes(parseInt(contentLength));
                        } else {
                            document.getElementById('file-size').textContent = 'Unknown';
                        }
                        
                        // Append Cloudinary headers if available
                        if (Object.keys(cldHeaders).length > 0) {
                            const cldHeadersHtml = Object.entries(cldHeaders)
                                .map(([key, value]) => \`
                                    <div class="info-row">
                                        <span class="info-label">\${key}:</span>
                                        <span class="info-value">\${value}</span>
                                    </div>
                                \`)
                                .join('');
                            
                            // Add a separator and then the Cloudinary headers
                            const separator = '<div style="height: 1px; background: var(--vscode-panel-border); margin: 8px 0;"></div>';
                            imageInfo.innerHTML += separator + cldHeadersHtml;
                        }
                    }
                    break;
                    
                case 'headersFailed':
                    // Only show error if we're in error mode (image failed to load)
                    if (img.style.display === 'none') {
                        content.innerHTML = \`
                            <div class="error-display">
                                <div class="error-icon">❌</div>
                                <h2>Failed to Load Image</h2>
                                <p style="margin-bottom: 16px;">Unable to fetch headers from Cloudinary</p>
                                <p style="font-size: 0.9em; color: var(--vscode-descriptionForeground);">Error: \${message.error}</p>
                            </div>
                        \`;
                    }
                    break;
            }
        });

        img.src = imageUrl;
    </script>
</body>
</html>`;
  }

  private generateBindingsHtml(bindings: BoundUrl["bindings"]): string {
    const hasBindings = Object.keys(bindings).length > 0;

    if (!hasBindings) {
      return "";
    }

    const bindingLabels: { [K in keyof typeof bindings]: string } = {
      prefix: "Prefix",
      suffix: "Suffix",
      cloudName: "Cloud Name",
      publicId: "Public ID",
    };

    const bindingItems = Object.entries(bindings)
      .filter(([, binding]) => binding !== undefined)
      .map(([key, binding]) => {
        if (!binding) {
          return "";
        }
        const label = bindingLabels[key as keyof typeof bindings];
        const sourceClass = binding.src === "cldtrc" ? "cldtrc" : "annotation";
        const sourceText = binding.src === "cldtrc" ? ".cldtrc" : "@cld/*";

        return `
          <div class="binding-item">
            <span class="binding-label">${label}:</span>
            <span class="binding-value">${this.escapeHtml(binding.value)}</span>
            <span class="binding-source ${sourceClass}">${sourceText}</span>
          </div>
        `;
      })
      .join("");

    return `
      <div class="bindings-info">
        ${bindingItems}
      </div>
    `;
  }

  private escapeHtml(text: string): string {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  private getNonce(): string {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  public dispose() {
    if (this.panel) {
      this.panel.dispose();
    }

    while (this.disposables.length) {
      const disposable = this.disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }

    this.panel = undefined;
    this.currentDocument = undefined;
    this.lastUrl = undefined;
  }
}

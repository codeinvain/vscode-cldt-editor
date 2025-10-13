import * as vscode from "vscode";

export class CldtPreviewProvider {
  private static readonly viewType = "cldt.preview";
  private panel: vscode.WebviewPanel | undefined;
  private disposables: vscode.Disposable[] = [];
  private currentDocument: vscode.TextDocument | undefined;

  constructor(private readonly extensionUri: vscode.Uri) {}

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
              await this.fetchAndSendHeaders(message.url);
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

    const url = this.extractUrl(document);
    this.panel.webview.html = this.getHtmlContent(url, document.fileName);
  }

  private extractUrl(document: vscode.TextDocument): string | null {
    const text = document.getText().trim();

    // Look for Cloudinary URLs in the document
    const lines = text
      .split("\n")
      .map((line) => line.replace(/#.*$/, "").trim())
      .filter((line) => line.trim().length > 0);
    return lines.join("");
  }

  private async fetchAndSendHeaders(url: string) {
    if (!this.panel) {
      return;
    }

    try {
      const https = await import("https");
      const http = await import("http");

      const urlObj = new URL(url);
      const client = urlObj.protocol === "https:" ? https : http;

      return new Promise<void>((resolve) => {
        const req = client.request(url, { method: "GET" }, (res) => {
          const headers: { [key: string]: string } = {};

          // Extract all X-Cld headers
          Object.entries(res.headers).forEach(([key, value]) => {
            if (key.toLowerCase().startsWith("x-cld")) {
              headers[key] = Array.isArray(value) ? value.join(", ") : value || "";
            }
          });

          this.panel?.webview.postMessage({
            command: "headersReceived",
            headers: headers,
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
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

  private getHtmlContent(url: string | null, fileName: string): string {
    const nonce = this.getNonce();

    if (!url) {
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
            padding: 6px 10px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 2px;
            font-family: var(--vscode-editor-font-family);
            font-size: 11px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
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
            <div class="url-text" title="${this.escapeHtml(url)}">${this.escapeHtml(url)}</div>
        </div>
    </div>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        const imageUrl = ${JSON.stringify(url)};
        const img = document.getElementById('preview-image');
        const loading = document.getElementById('loading');
        const statusDot = document.getElementById('status-dot');
        const statusText = document.getElementById('status-text');
        const imageInfo = document.getElementById('image-info');
        const content = document.getElementById('content');

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
            
            // Try to get file size
            fetch(imageUrl, { method: 'HEAD' })
                .then(response => {
                    const size = response.headers.get('content-length');
                    if (size) {
                        document.getElementById('file-size').textContent = formatBytes(parseInt(size));
                    }
                })
                .catch(() => {
                    document.getElementById('file-size').textContent = 'Unknown';
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
                    const headers = message.headers;
                    const headersList = Object.keys(headers).length > 0
                        ? Object.entries(headers)
                            .map(([key, value]) => \`<li><strong>\${key}:</strong> \${value}</li>\`)
                            .join('')
                        : '<li>No X-Cld headers found</li>';
                    
                    const statusInfo = message.statusCode 
                        ? \`<p style="margin-bottom: 8px; color: var(--vscode-descriptionForeground);">HTTP Status: \${message.statusCode} \${message.statusMessage || ''}</p>\`
                        : '';
                    
                    content.innerHTML = \`
                        <div class="error-display">
                            <div class="error-icon">❌</div>
                            <h2>Failed to Load Image</h2>
                            \${statusInfo}
                            <p style="margin-bottom: 16px;">Cloudinary Response Headers:</p>
                            <ul style="text-align: left; margin-top: 12px; line-height: 1.8; background: var(--vscode-textBlockQuote-background); padding: 16px 24px; border-radius: 4px; border-left: 4px solid var(--vscode-textBlockQuote-border); max-width: 600px;">
                                \${headersList}
                            </ul>
                        </div>
                    \`;
                    break;
                    
                case 'headersFailed':
                    content.innerHTML = \`
                        <div class="error-display">
                            <div class="error-icon">❌</div>
                            <h2>Failed to Load Image</h2>
                            <p style="margin-bottom: 16px;">Unable to fetch headers from Cloudinary</p>
                            <p style="font-size: 0.9em; color: var(--vscode-descriptionForeground);">Error: \${message.error}</p>
                        </div>
                    \`;
                    break;
            }
        });

        img.src = imageUrl;
    </script>
</body>
</html>`;
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
  }
}

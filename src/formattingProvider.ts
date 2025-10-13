import * as vscode from "vscode";

export class CldtFormattingProvider implements vscode.DocumentFormattingEditProvider {
  provideDocumentFormattingEdits(
    document: vscode.TextDocument,
    options: vscode.FormattingOptions,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.TextEdit[]> {
    const edits: vscode.TextEdit[] = [];
    const text = document.getText();

    // Check if this is a Cloudinary URL format
    if (this.isCloudinaryUrl(text)) {
      const formatted = this.formatCloudinaryUrl(text);
      if (formatted !== text) {
        const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(text.length));
        edits.push(vscode.TextEdit.replace(fullRange, formatted));
      }
    } else {
      // Format as regular CLDT syntax
      const formatted = this.formatCldtSyntax(text, options);
      if (formatted !== text) {
        const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(text.length));
        edits.push(vscode.TextEdit.replace(fullRange, formatted));
      }
    }

    return edits;
  }

  private isCloudinaryUrl(text: string): boolean {
    const trimmed = text.trim();
    return trimmed.startsWith("http://") || trimmed.startsWith("https://");
  }

  private formatCloudinaryUrl(text: string): string {
    const trimmed = text.trim();

    // Check if this is already a multi-line format (has newlines)
    if (trimmed.includes("\n")) {
      return this.formatMultiLineCldt(text);
    }

    // Parse single-line Cloudinary URL
    // Format: [schema]://[domain]/[cloud-name]/[resource-type]/[resource-kind]/[transformations...]/[version]/[public-id]
    const urlPattern = /^(https?):\/\/([^/]+)\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/;
    const match = urlPattern.exec(trimmed);

    if (!match) {
      return text; // Return as-is if doesn't match pattern
    }

    const schema = match[1];
    const domain = match[2];
    const cloudName = match[3];
    const resourceType = match[4];
    const resourceKind = match[5];
    const remainingPath = match[6];

    // Split the remaining path into components
    const components = remainingPath.split("/");

    // Find where transformations end and version/public-id begins
    // Version typically starts with 'v' followed by numbers (e.g., v1234567890)
    let versionIndex = -1;
    let publicIdStartIndex = -1;

    // Look for version component
    for (let i = 0; i < components.length; i++) {
      if (/^v\d+$/.test(components[i])) {
        versionIndex = i;
        publicIdStartIndex = i + 1;
        break;
      }
    }

    // If no version found, the last component (or components) are likely the public-id
    // Public-id is typically the last segment(s), often with an extension
    if (versionIndex === -1) {
      // Work backwards to find where public-id likely starts
      // Look for common asset patterns or just take the last component
      publicIdStartIndex = components.length - 1;

      // Check if there are nested folders in public-id (multiple segments without transformations)
      // Transformations typically contain ',' or specific Cloudinary transformation syntax
      for (let i = components.length - 1; i >= 0; i--) {
        const comp = components[i];
        // If component contains transformation syntax, it's not part of public-id
        if (this.isTransformationComponent(comp)) {
          publicIdStartIndex = i + 1;
          break;
        }
        // If we've gone back too far (first component), it's probably all public-id
        if (i === 0) {
          publicIdStartIndex = 0;
        }
      }
    }

    const transformationEndIndex = (versionIndex >= 0 ? versionIndex : publicIdStartIndex) - 1;
    const baseUrl = `${schema}://${domain}/${cloudName}/${resourceType}/${resourceKind}/`;
    const formattedLines: string[] = [baseUrl];

    // Add transformation components (one per line) with proper indentation
    // Handle if/end_if and layer (l_) / fl_layer_apply indentation
    let indentLevel = 0;
    const indent = "  "; // 2 spaces per indent level

    if (transformationEndIndex >= 0) {
      for (let i = 0; i <= transformationEndIndex; i++) {
        const component = components[i];

        // Check if this component ends the current indentation level
        if (this.endsIndentation(component)) {
          indentLevel = Math.max(0, indentLevel - 1);
        }

        // Add the line with current indentation
        const indentedLine = indent.repeat(indentLevel) + component + "/";
        formattedLines.push(indentedLine);

        // Check if this component starts a new indentation level
        if (this.startsIndentation(component)) {
          indentLevel++;
        }

        // Add blank line after block ends (if_end or fl_layer_apply)
        if (this.endsIndentation(component)) {
          formattedLines.push("");
        }
      }
    }

    // Add version if exists (no indentation)
    if (versionIndex >= 0) {
      formattedLines.push(components[versionIndex] + "/");
    }

    // Add public-id (which may span multiple path segments, no indentation)
    if (publicIdStartIndex >= 0 && publicIdStartIndex < components.length) {
      const publicIdParts = components.slice(publicIdStartIndex);
      formattedLines.push(publicIdParts.join("/"));
    }

    return formattedLines.join("\n");
  }

  private formatMultiLineCldt(text: string): string {
    const lines = text.split("\n");
    const formattedLines: string[] = [];
    let indentLevel = 0;
    const indent = "  "; // 2 spaces per indent level
    const commentAlignColumn = 30; // Column to align inline comments

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines
      if (trimmedLine === "") {
        formattedLines.push("");
        continue;
      }

      // Handle comment-only lines (preserve as-is with no indentation)
      if (trimmedLine.startsWith("#")) {
        formattedLines.push(trimmedLine);
        continue;
      }

      // Separate transformation from inline comment
      let transformPart = trimmedLine;
      let commentPart = "";
      const hashIndex = trimmedLine.indexOf("#");

      if (hashIndex > 0) {
        transformPart = trimmedLine.substring(0, hashIndex).trim();
        commentPart = trimmedLine.substring(hashIndex).trim();
      }

      // Remove trailing comma or slash if present
      const cleanTransform = transformPart.replace(/[,/]+$/, "");

      // Check if this line ends indentation
      if (this.endsIndentation(cleanTransform)) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // Build the formatted line
      let formattedLine = indent.repeat(indentLevel) + cleanTransform;

      // Add trailing character (comma or slash based on original)
      if (transformPart.endsWith("/")) {
        formattedLine += "/";
      } else if (transformPart.endsWith(",")) {
        formattedLine += ",";
      } else if (!transformPart.match(/^https?:\/\//)) {
        // Add slash for transformation lines that don't have one (unless it's the URL line)
        formattedLine += "/";
      }

      // Align and add inline comment if present
      if (commentPart) {
        const padding = Math.max(1, commentAlignColumn - formattedLine.length);
        formattedLine += " ".repeat(padding) + commentPart;
      }

      formattedLines.push(formattedLine);

      // Check if this line starts indentation
      if (this.startsIndentation(cleanTransform)) {
        indentLevel++;
      }

      // Add blank line after block ends (if_end or fl_layer_apply)
      if (this.endsIndentation(cleanTransform)) {
        formattedLines.push("");
      }
    }

    return formattedLines.join("\n");
  }

  private startsIndentation(component: string): boolean {
    // Check if component starts a conditional block (if_)
    // But not if it's ending a conditional (if_end, end_if)
    if (component.startsWith("if_") && !component.startsWith("if_end") && !component.includes("end_if")) {
      return true;
    }
    // Check if component starts a layer (l_ prefix)
    // But not if it's fl_layer_apply or other fl_ flags
    if (/^l_/.test(component) && !component.startsWith("fl_")) {
      return true;
    }
    return false;
  }

  private endsIndentation(component: string): boolean {
    // Check if component is exactly if_end or end_if (standalone component)
    if (component === "if_end" || component === "end_if") {
      return true;
    }
    // Check if component contains fl_layer_apply as a parameter
    if (component.includes("fl_layer_apply")) {
      return true;
    }
    return false;
  }

  private isTransformationComponent(component: string): boolean {
    // Transformation components typically contain:
    // - Comma-separated parameters (e.g., "w_300,h_200")
    // - Underscores for parameter names (e.g., "w_300", "c_fill")
    // - Common transformation prefixes
    const hasComma = component.includes(",");
    const hasUnderscore = component.includes("_");
    const transformationPrefixes = /^(w_|h_|c_|g_|q_|f_|a_|bo_|r_|e_|o_|l_|u_|fl_|co_|b_|z_|ar_|x_|y_|dpr_|if_|else|end_|variable_)/;

    return hasComma || (hasUnderscore && transformationPrefixes.test(component));
  }

  private formatCldtSyntax(text: string, options: vscode.FormattingOptions): string {
    const lines = text.split("\n");
    let indentLevel = 0;
    const formattedLines: string[] = [];
    const indent = options.insertSpaces ? " ".repeat(options.tabSize) : "\t";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines
      if (line === "") {
        formattedLines.push("");
        continue;
      }

      // Decrease indent for closing braces
      if (line.startsWith("}")) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // Add indentation
      const indentedLine = indent.repeat(indentLevel) + line;
      formattedLines.push(indentedLine);

      // Increase indent for opening braces
      if (line.endsWith("{")) {
        indentLevel++;
      }

      // Decrease indent after closing braces if not already at start
      if (line.endsWith("}") && !line.startsWith("}")) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
    }

    return formattedLines.join("\n");
  }
}

import * as vscode from 'vscode';

export class CldtDiagnostics {
    updateDiagnostics(document: vscode.TextDocument, collection: vscode.DiagnosticCollection): void {
        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();

            // Skip empty lines and comments
            if (trimmedLine === '' || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) {
                continue;
            }

            // Check for common issues
            this.checkSyntaxErrors(line, i, diagnostics, document);
            this.checkValueRanges(line, i, diagnostics, document);
            this.checkDeprecatedFeatures(line, i, diagnostics, document);
        }

        collection.set(document.uri, diagnostics);
    }

    private checkSyntaxErrors(line: string, lineNumber: number, diagnostics: vscode.Diagnostic[], document: vscode.TextDocument): void {
        // Check for properties without colons
        const propertyPattern = /^\s*(\w+)\s+([^:/{])/;
        const match = propertyPattern.exec(line);
        
        if (match && !line.includes('//')) {
            const range = new vscode.Range(lineNumber, match.index, lineNumber, match.index + match[1].length);
            const diagnostic = new vscode.Diagnostic(
                range,
                `Property '${match[1]}' should be followed by a colon`,
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'missing-colon';
            diagnostics.push(diagnostic);
        }

        // Check for unmatched braces
        const openBraces = (line.match(/{/g) || []).length;
        const closeBraces = (line.match(/}/g) || []).length;
        
        if (openBraces !== closeBraces && !line.trim().startsWith('//')) {
            const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Unmatched braces',
                vscode.DiagnosticSeverity.Warning
            );
            diagnostic.code = 'unmatched-braces';
            diagnostics.push(diagnostic);
        }
    }

    private checkValueRanges(line: string, lineNumber: number, diagnostics: vscode.Diagnostic[], document: vscode.TextDocument): void {
        // Check quality values
        const qualityMatch = /quality\s*:\s*(\d+)/i.exec(line);
        if (qualityMatch) {
            const value = parseInt(qualityMatch[1]);
            if (value < 1 || value > 100) {
                const startPos = line.indexOf(qualityMatch[1]);
                const range = new vscode.Range(lineNumber, startPos, lineNumber, startPos + qualityMatch[1].length);
                const diagnostic = new vscode.Diagnostic(
                    range,
                    `Quality value should be between 1 and 100 (got ${value})`,
                    vscode.DiagnosticSeverity.Warning
                );
                diagnostic.code = 'invalid-quality';
                diagnostics.push(diagnostic);
            }
        }

        // Check opacity values
        const opacityMatch = /opacity\s*:\s*(\d+)/i.exec(line);
        if (opacityMatch) {
            const value = parseInt(opacityMatch[1]);
            if (value < 0 || value > 100) {
                const startPos = line.indexOf(opacityMatch[1]);
                const range = new vscode.Range(lineNumber, startPos, lineNumber, startPos + opacityMatch[1].length);
                const diagnostic = new vscode.Diagnostic(
                    range,
                    `Opacity value should be between 0 and 100 (got ${value})`,
                    vscode.DiagnosticSeverity.Warning
                );
                diagnostic.code = 'invalid-opacity';
                diagnostics.push(diagnostic);
            }
        }

        // Check angle values
        const angleMatch = /angle\s*:\s*(-?\d+)/i.exec(line);
        if (angleMatch) {
            const value = parseInt(angleMatch[1]);
            if (value < -360 || value > 360) {
                const startPos = line.indexOf(angleMatch[1]);
                const range = new vscode.Range(lineNumber, startPos, lineNumber, startPos + angleMatch[1].length);
                const diagnostic = new vscode.Diagnostic(
                    range,
                    `Angle value should be between -360 and 360 (got ${value})`,
                    vscode.DiagnosticSeverity.Information
                );
                diagnostic.code = 'angle-out-of-range';
                diagnostics.push(diagnostic);
            }
        }
    }

    private checkDeprecatedFeatures(line: string, lineNumber: number, diagnostics: vscode.Diagnostic[], document: vscode.TextDocument): void {
        // Example: Check for deprecated properties
        const deprecatedProps = ['fetch_format']; // Example deprecated property
        
        for (const prop of deprecatedProps) {
            const pattern = new RegExp(`\\b${prop}\\b`, 'i');
            if (pattern.test(line)) {
                const match = pattern.exec(line);
                if (match) {
                    const startPos = match.index;
                    const range = new vscode.Range(lineNumber, startPos, lineNumber, startPos + prop.length);
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `'${prop}' is deprecated. Use 'format' instead`,
                        vscode.DiagnosticSeverity.Hint
                    );
                    diagnostic.code = 'deprecated-property';
                    diagnostics.push(diagnostic);
                }
            }
        }
    }
}



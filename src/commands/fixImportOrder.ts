import * as vscode from 'vscode';
import * as path from 'path';
import { parseImports } from '../parser/importParser';
import { generateSortedImportText } from '../sorter/importSorter';
import { detectFramework } from '../detector/frameworkDetector';
import { detectAliases } from '../detector/aliasDetector';
import { ProjectContext } from '../types';
import { getWorkspaceRoot, isSupportedFile } from '../utils/fileUtils';

export async function fixImportOrderCommand(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    
    if (!editor) {
        vscode.window.showWarningMessage('No active editor found');
        return;
    }

    const document = editor.document;
    
    if (!isSupportedFile(document.fileName)) {
        vscode.window.showWarningMessage(
            'ImportSense only supports .js, .ts, .jsx, and .tsx files'
        );
        return;
    }

    try {
        const result = await fixImportOrder(document);
        
        if (result) {
            vscode.window.showInformationMessage('Imports sorted successfully');
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        vscode.window.showErrorMessage(`Failed to sort imports: ${message}`);
    }
}

export async function fixImportOrder(
    document: vscode.TextDocument
): Promise<boolean> {
    const sourceCode = document.getText();
    const workspaceRoot = getWorkspaceRoot(document.uri);
    
    if (!workspaceRoot) {
        throw new Error('Could not determine workspace root');
    }

    const context = buildProjectContext(workspaceRoot);
    const importBlock = parseImports(sourceCode, document.fileName, context);

    if (!importBlock || importBlock.imports.length === 0) {
        return false;
    }

    const sortedText = generateSortedImportText(importBlock.imports);
    const currentText = extractCurrentImportText(
        sourceCode, 
        importBlock.startLine, 
        importBlock.endLine
    );

    if (sortedText === currentText) {
        return false;
    }

    const startPos = new vscode.Position(importBlock.startLine - 1, 0);
    const endPos = new vscode.Position(importBlock.endLine, 0);
    const range = new vscode.Range(startPos, endPos);

    const edit = new vscode.WorkspaceEdit();
    edit.replace(document.uri, range, sortedText + '\n');
    
    const success = await vscode.workspace.applyEdit(edit);
    return success;
}

function buildProjectContext(workspaceRoot: string): ProjectContext {
    const framework = detectFramework(workspaceRoot);
    const aliases = detectAliases(workspaceRoot);
    
    return {
        framework,
        aliases,
        workspaceRoot
    };
}

function extractCurrentImportText(
    sourceCode: string, 
    startLine: number, 
    endLine: number
): string {
    const lines = sourceCode.split('\n');
    return lines.slice(startLine - 1, endLine).join('\n');
}

import * as vscode from 'vscode';

export function getWorkspaceRoot(fileUri: vscode.Uri): string | null {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(fileUri);
    
    if (workspaceFolder) {
        return workspaceFolder.uri.fsPath;
    }
    
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
        return workspaceFolders[0].uri.fsPath;
    }
    
    return null;
}

export function isSupportedFile(fileName: string): boolean {
    const supportedExtensions = ['.js', '.ts', '.jsx', '.tsx'];
    const lowerFileName = fileName.toLowerCase();
    
    return supportedExtensions.some(ext => lowerFileName.endsWith(ext));
}

import * as vscode from 'vscode';
import { isSupportedFile } from '../utils/fileUtils';

export class ImportSenseCodeActionProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.Source,
        vscode.CodeActionKind.SourceOrganizeImports,
        vscode.CodeActionKind.QuickFix
    ];

    public provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.CodeAction[] | undefined {
        if (!isSupportedFile(document.fileName)) {
            return undefined;
        }

        if (!this.hasImports(document)) {
            return undefined;
        }

        const actions: vscode.CodeAction[] = [];

        const sortImportsAction = this.createSortImportsAction();
        actions.push(sortImportsAction);

        if (context.only?.contains(vscode.CodeActionKind.SourceOrganizeImports)) {
            const organizeAction = this.createOrganizeImportsAction();
            actions.push(organizeAction);
        }

        return actions;
    }

    private createSortImportsAction(): vscode.CodeAction {
        const action = new vscode.CodeAction(
            'Sort imports with ImportSense',
            vscode.CodeActionKind.QuickFix
        );
        action.command = {
            command: 'importsense.fixImportOrder',
            title: 'Sort imports with ImportSense'
        };
        action.isPreferred = false;
        return action;
    }

    private createOrganizeImportsAction(): vscode.CodeAction {
        const action = new vscode.CodeAction(
            'Organize imports (ImportSense)',
            vscode.CodeActionKind.SourceOrganizeImports
        );
        action.command = {
            command: 'importsense.fixImportOrder',
            title: 'Organize imports (ImportSense)'
        };
        return action;
    }

    private hasImports(document: vscode.TextDocument): boolean {
        const text = document.getText();
        return /^\s*import\s+/m.test(text);
    }
}

import * as vscode from 'vscode';
import { fixImportOrderCommand } from './commands/fixImportOrder';
import { ImportSenseCodeActionProvider } from './providers/codeActionProvider';

const SUPPORTED_LANGUAGES = [
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact'
];

export function activate(context: vscode.ExtensionContext): void {
    const fixImportOrderDisposable = vscode.commands.registerCommand(
        'importsense.fixImportOrder',
        fixImportOrderCommand
    );
    context.subscriptions.push(fixImportOrderDisposable);

    const codeActionProvider = vscode.languages.registerCodeActionsProvider(
        SUPPORTED_LANGUAGES.map(lang => ({ language: lang, scheme: 'file' })),
        new ImportSenseCodeActionProvider(),
        {
            providedCodeActionKinds: ImportSenseCodeActionProvider.providedCodeActionKinds
        }
    );
    context.subscriptions.push(codeActionProvider);
}

export function deactivate(): void {}

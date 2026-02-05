import * as parser from '@babel/parser';
import type {
    ImportDeclaration,
    Comment
} from '@babel/types';
import { ParsedImport, ImportBlock, ProjectContext } from '../types';
import { classifyImport } from '../sorter/importClassifier';

const PARSER_PLUGINS: parser.ParserPlugin[] = [
    'typescript',
    'jsx',
    'decorators-legacy',
    'classProperties',
    'classPrivateProperties',
    'classPrivateMethods',
    'exportDefaultFrom',
    'exportNamespaceFrom',
    'dynamicImport',
    'nullishCoalescingOperator',
    'optionalChaining',
    'objectRestSpread'
];

// Patterns that indicate an import-group section comment we should strip
const SECTION_COMMENT_PATTERNS = [
    /^\s*\/\/\s*(core|third[- ]?party|internal|components?|utils?|helpers?|constants?|types?|assets?|styles?|side[- ]?effects?|custom\s*modules?|libraries|modules|vendors?)\s*$/i,
    /^\s*\/\/\s*-+\s*$/,
    /^\s*\/\*\s*(core|third[- ]?party|internal|components?|utils?|helpers?|constants?|types?|assets?|styles?|side[- ]?effects?|custom\s*modules?|libraries|modules|vendors?)\s*\*\/\s*$/i,
];

export function parseImports(
    sourceCode: string,
    filePath: string,
    context: ProjectContext
): ImportBlock | null {
    let ast: parser.ParseResult<any>;

    try {
        ast = parser.parse(sourceCode, {
            sourceType: 'module',
            plugins: PARSER_PLUGINS,
            errorRecovery: true,
            attachComment: true
        });
    } catch {
        return null;
    }

    const importNodes: ImportDeclaration[] = [];

    for (const node of ast.program.body) {
        if (node.type === 'ImportDeclaration') {
            importNodes.push(node);
        } else if (importNodes.length > 0) {
            break;
        }
    }

    if (importNodes.length === 0) {
        return null;
    }

    const sourceLines = sourceCode.split('\n');

    const imports: ParsedImport[] = importNodes.map(node => {
        const source = node.source.value;
        const startLine = node.loc!.start.line;
        const endLine = node.loc!.end.line;

        const rawStatement = sourceLines
            .slice(startLine - 1, endLine)
            .join('\n');

        const isSideEffect = node.specifiers.length === 0;
        const isTypeOnly = node.importKind === 'type';
        const group = classifyImport(source, context, isSideEffect, isTypeOnly);

        return {
            source,
            rawStatement,
            startLine,
            endLine,
            group,
            isTypeOnly,
            isSideEffect,
            leadingComments: []
        };
    });

    const firstImport = imports[0];
    const lastImport = imports[imports.length - 1];

    // Calculate block start: walk back from first import to capture leading comments
    let blockStartLine = firstImport.startLine;
    const firstNode = importNodes[0];
    if (firstNode.leadingComments && firstNode.leadingComments.length > 0) {
        const firstComment = firstNode.leadingComments[0];
        if (firstComment.loc) {
            blockStartLine = firstComment.loc.start.line;
        }
    }

    // Also check for standalone comment lines between first comment and first import
    // (blank lines + section comments above the import block)
    let scanLine = blockStartLine - 1;
    while (scanLine > 0) {
        const line = sourceLines[scanLine - 1].trim();
        if (line === '' || isSectionComment(line)) {
            scanLine--;
        } else {
            break;
        }
    }
    blockStartLine = scanLine + 1;

    // Extend end line to capture any trailing comments/blank lines between import groups
    let blockEndLine = lastImport.endLine;

    // Check for section comments between imports that might span extra lines
    for (let i = 0; i < imports.length - 1; i++) {
        const currentEnd = imports[i].endLine;
        const nextStart = imports[i + 1].startLine;

        // Lines between two imports — scan for section comments
        for (let lineNum = currentEnd + 1; lineNum < nextStart; lineNum++) {
            const line = sourceLines[lineNum - 1]?.trim();
            if (line && isSectionComment(line) && lineNum > blockEndLine) {
                blockEndLine = lineNum;
            }
        }
    }

    // Ensure end line is at least the last import's end
    blockEndLine = Math.max(blockEndLine, lastImport.endLine);

    return {
        imports,
        startLine: blockStartLine,
        endLine: blockEndLine
    };
}

function isSectionComment(line: string): boolean {
    return SECTION_COMMENT_PATTERNS.some(pattern => pattern.test(line));
}

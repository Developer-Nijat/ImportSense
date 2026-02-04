import * as parser from '@babel/parser';
import type { 
    ImportDeclaration, 
    Comment 
} from '@babel/types';
import { ImportGroup, ParsedImport, ImportBlock, ProjectContext } from '../types';
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
    const leadingCommentsMap = new Map<number, string[]>();
    
    for (const node of ast.program.body) {
        if (node.type === 'ImportDeclaration') {
            importNodes.push(node);
            
            if (node.leadingComments && node.leadingComments.length > 0) {
                const comments = node.leadingComments.map((c: Comment) => 
                    c.type === 'CommentLine' 
                        ? `//${c.value}` 
                        : `/*${c.value}*/`
                );
                leadingCommentsMap.set(node.loc!.start.line, comments);
            }
        } else if (importNodes.length > 0) {
            break;
        }
    }

    if (importNodes.length === 0) {
        return null;
    }

    const imports: ParsedImport[] = importNodes.map(node => {
        const source = node.source.value;
        const startLine = node.loc!.start.line;
        const endLine = node.loc!.end.line;
        
        const rawStatement = sourceCode
            .split('\n')
            .slice(startLine - 1, endLine)
            .join('\n');

        const isSideEffect = node.specifiers.length === 0;
        const isTypeOnly = node.importKind === 'type';
        const group = classifyImport(source, context, isSideEffect, isTypeOnly);
        const leadingComments = leadingCommentsMap.get(startLine) || [];

        return {
            source,
            rawStatement,
            startLine,
            endLine,
            group,
            isTypeOnly,
            isSideEffect,
            leadingComments
        };
    });

    const firstImport = imports[0];
    const lastImport = imports[imports.length - 1];
    
    let blockStartLine = firstImport.startLine;
    if (firstImport.leadingComments.length > 0) {
        const firstComment = ast.program.body.find(
            (n: any) => n.type === 'ImportDeclaration'
        )?.leadingComments?.[0];
        if (firstComment?.loc) {
            blockStartLine = firstComment.loc.start.line;
        }
    }

    return {
        imports,
        startLine: blockStartLine,
        endLine: lastImport.endLine
    };
}

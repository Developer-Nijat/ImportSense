import { ParsedImport, ImportGroup, GROUP_ORDER, GROUP_LABELS } from '../types';

export function sortImports(imports: ParsedImport[]): ParsedImport[] {
    const grouped = groupImportsByCategory(imports);
    const sortedGroups = sortWithinGroups(grouped);
    return flattenGroups(sortedGroups);
}

function groupImportsByCategory(
    imports: ParsedImport[]
): Map<ImportGroup, ParsedImport[]> {
    const groups = new Map<ImportGroup, ParsedImport[]>();
    
    for (const group of GROUP_ORDER) {
        groups.set(group, []);
    }
    
    for (const imp of imports) {
        const group = groups.get(imp.group);
        if (group) {
            group.push(imp);
        }
    }
    
    return groups;
}

function sortWithinGroups(
    groups: Map<ImportGroup, ParsedImport[]>
): Map<ImportGroup, ParsedImport[]> {
    const sorted = new Map<ImportGroup, ParsedImport[]>();
    
    for (const [group, imports] of groups) {
        const sortedImports = [...imports].sort((a, b) => {
            const sourceA = normalizeSource(a.source);
            const sourceB = normalizeSource(b.source);
            return sourceA.localeCompare(sourceB, 'en', { sensitivity: 'base' });
        });
        sorted.set(group, sortedImports);
    }
    
    return sorted;
}

function normalizeSource(source: string): string {
    return source
        .replace(/^@/, '')
        .replace(/^~/, '')
        .replace(/^\.\//, '')
        .replace(/^\.\.\//, '')
        .toLowerCase();
}

function flattenGroups(
    groups: Map<ImportGroup, ParsedImport[]>
): ParsedImport[] {
    const result: ParsedImport[] = [];
    
    for (const group of GROUP_ORDER) {
        const imports = groups.get(group) || [];
        result.push(...imports);
    }
    
    return result;
}

export function generateSortedImportText(imports: ParsedImport[]): string {
    if (imports.length === 0) {
        return '';
    }

    const sortedImports = sortImports(imports);
    const lines: string[] = [];
    let currentGroup: ImportGroup | null = null;
    const groupsInUse = new Set(sortedImports.map(imp => imp.group));
    const hasManyGroups = groupsInUse.size > 1;

    for (const imp of sortedImports) {
        if (currentGroup !== null && currentGroup !== imp.group) {
            lines.push('');
        }

        if (currentGroup !== imp.group && hasManyGroups) {
            const label = GROUP_LABELS[imp.group];
            lines.push(`// ${label}`);
        }

        lines.push(imp.rawStatement);
        currentGroup = imp.group;
    }

    return lines.join('\n');
}

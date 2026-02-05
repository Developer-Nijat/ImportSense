export enum ImportGroup {
    CORE = 'CORE',
    THIRD_PARTY = 'THIRD_PARTY',
    INTERNAL = 'INTERNAL',
    COMPONENTS = 'COMPONENTS',
    UTILS = 'UTILS',
    CONSTANTS_TYPES = 'CONSTANTS_TYPES',
    ASSETS_STYLES = 'ASSETS_STYLES',
    SIDE_EFFECTS = 'SIDE_EFFECTS'
}

export const GROUP_ORDER: ImportGroup[] = [
    ImportGroup.CORE,
    ImportGroup.THIRD_PARTY,
    ImportGroup.INTERNAL,
    ImportGroup.COMPONENTS,
    ImportGroup.UTILS,
    ImportGroup.CONSTANTS_TYPES,
    ImportGroup.ASSETS_STYLES,
    ImportGroup.SIDE_EFFECTS
];

export const GROUP_LABELS: Record<ImportGroup, string> = {
    [ImportGroup.CORE]: 'Core',
    [ImportGroup.THIRD_PARTY]: 'Third-party libraries',
    [ImportGroup.INTERNAL]: 'Internal modules',
    [ImportGroup.COMPONENTS]: 'Components',
    [ImportGroup.UTILS]: 'Utils & Helpers',
    [ImportGroup.CONSTANTS_TYPES]: 'Constants & Types',
    [ImportGroup.ASSETS_STYLES]: 'Assets & Styles',
    [ImportGroup.SIDE_EFFECTS]: 'Side effects'
};

export interface ParsedImport {
    source: string;
    rawStatement: string;
    startLine: number;
    endLine: number;
    group: ImportGroup;
    isTypeOnly: boolean;
    isSideEffect: boolean;
    leadingComments: string[];
}

export interface ProjectContext {
    framework: 'react' | 'next' | 'node' | 'unknown';
    aliases: Map<string, string>;
    workspaceRoot: string;
}

export interface ImportBlock {
    imports: ParsedImport[];
    startLine: number;
    endLine: number;
}

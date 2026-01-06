export type VersionCheck = {
    updateRequired: boolean;
    message: string;
    currentVersion: string;
    latestVersion: string;
}

export type ClearedVersionCheck = {
    cleared: boolean;
    oldVersion: string | null;
    newVersion: string;
}

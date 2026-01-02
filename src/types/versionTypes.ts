export type VersionCheck = {
    updateRequired: boolean;
    message: string;
    currentVersion: string;
    latestVersion: string;
}
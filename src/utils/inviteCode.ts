import { deleteStorage, getStorage, setStorage } from './utils';

const PENDING_INVITE_CODE_KEY = 'pendingInviteCode';

export async function capturePendingInviteCode(code: string): Promise<void> {
  await setStorage(PENDING_INVITE_CODE_KEY, code);
}

export async function getPendingInviteCode(): Promise<string | null> {
  return getStorage(PENDING_INVITE_CODE_KEY);
}

export async function clearPendingInviteCode(): Promise<void> {
  await deleteStorage(PENDING_INVITE_CODE_KEY);
}

export function shouldResetForNewInvite(
  storedInviteCode?: string | null,
  pendingCode?: string | null,
): boolean {
  if (!pendingCode) return false;
  return pendingCode !== storedInviteCode;
}

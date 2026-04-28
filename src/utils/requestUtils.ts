import { getToken } from './utils';

export async function getTokenHeader() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${await getToken()}` };
}

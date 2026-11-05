export const FORM_SCROLL_BREATHING_ROOM = 16;

export function computeScrollTop(params: {
  elementTop: number;
  containerTop: number;
  currentScrollTop: number;
  maxScrollTop: number;
  breathingRoom?: number;
}): number {
  const { elementTop, containerTop, currentScrollTop, maxScrollTop } = params;
  const breathingRoom = params.breathingRoom ?? FORM_SCROLL_BREATHING_ROOM;
  const target = currentScrollTop + (elementTop - containerTop) - breathingRoom;
  return Math.min(Math.max(target, 0), Math.max(maxScrollTop, 0));
}

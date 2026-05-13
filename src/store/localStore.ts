export function addToLocalStore(name: string, arr: unknown): void {
  try {
    const serialisedState = JSON.stringify(arr);
    localStorage.setItem(name, serialisedState);
  } catch (e) {
    console.warn(e);
  }
}
export function getFromLocalStore(name: string): unknown[] {
  try {
    const raw = localStorage.getItem(name);
    if (raw == null) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.log("err", err);
    return [];
  }
}

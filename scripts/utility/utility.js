export function uuid() {
  return "xxxx-yxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(36);
  });
}
export const removeNulls = (obj: object) =>
  Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== null));

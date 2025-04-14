export const removeNulls = (obj: any) =>
  Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== null));

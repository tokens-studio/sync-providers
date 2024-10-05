
export const parseValue = (value: string | undefined | null) => {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
};

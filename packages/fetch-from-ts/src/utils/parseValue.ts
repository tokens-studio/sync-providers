export const parseValue = (value: string | undefined | null) => {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value);
  } catch (e) {
    console.error("Error parsing value", e);
    return value;
  }
};

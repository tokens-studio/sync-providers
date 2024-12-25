export function getResolvedValue({
  alias,
  resolvedValue,
  modeId,
}: {
  alias?: Variable;
  resolvedValue?: string | number;
  modeId: string;
}) {
  if (alias) {
    // If we're dealing with an alias, we want to return the value for the current mode or the first mode.
    // E.g. if we have a referenced variable we're getting of another collection, they wont have the same modes.
    return (
      alias.valuesByMode[modeId] ||
      alias.valuesByMode[Object.keys(alias.valuesByMode)[0]]
    );
  }

  // If we're not dealing with an alias, we just return the resolved value.
  return resolvedValue;
}

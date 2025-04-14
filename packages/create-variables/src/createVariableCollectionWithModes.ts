async function getLocalVariableCollectionsAsync() {
  return await figma.variables.getLocalVariableCollectionsAsync();
}

export async function createVariableCollectionWithModes({
  collectionName,
  modes,
}: {
  collectionName: string;
  modes: Array<{ name: string; modeId?: string }>;
}) {
  // Check if a collection with the given name already exists
  const localCollections = await getLocalVariableCollectionsAsync();
  const existingCollection = localCollections.find(
    (c) => c.name === collectionName,
  );

  if (existingCollection) {
    // Collection exists, check if modes match
    const existingModes = existingCollection.modes;
    const missingModes = modes.filter(
      (mode) => !existingModes.some((m) => m.name === mode.name),
    );

    if (missingModes.length === 0) {
      // All modes exist, return the existing collection
      return { collection: existingCollection, modes: existingModes };
    }

    // Add missing modes
    missingModes.forEach((mode) => {
      existingCollection.addMode(mode.name);
    });

    return { collection: existingCollection, modes: existingCollection.modes };
  }

  // Collection doesn't exist, create a new one
  const collection = figma.variables.createVariableCollection(collectionName);
  collection.renameMode(collection.modes[0].modeId, modes[0].name);

  // Add remaining modes
  modes.slice(1).forEach((mode) => {
    collection.addMode(mode.name);
  });

  return { collection, modes: collection.modes };
}

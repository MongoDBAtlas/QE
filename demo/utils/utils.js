export const lookupCollection = async (db, colname) => {
  const colls = await db.collections();
  for (const col of colls) {
    if (col.s.namespace.collection === colname) {
      return col;
    }
  }
  return undefined;
};

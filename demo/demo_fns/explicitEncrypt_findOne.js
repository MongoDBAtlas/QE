import * as mcli from "../utils/mongoClient.js";
import { deks, encrypt } from "../utils/keyVault.js";

const [encClient, plainClient] = await mcli.initMdbClients(
  mcli.DB_EXPLICIT_ENCRYPT,
  false,
);

const { dek1, dek2 } = deks;
let coll, res;

coll = plainClient.db(mcli.EncDB).collection(mcli.EncColl);
console.log("1>>\nfindOne : plain client - index field, 'patientId'");
res = await coll.findOne({ patientId: 87654321 });
console.log("  res", res);

coll = encClient.db(mcli.EncDB).collection(mcli.EncColl);
try {
  console.log("2>>\nfindOne : encrypt client - non-index field, 'medications'");
  const unindexedFieldMedic = await encrypt.encrypt(
    ["Atorvastatin", "Levothyroxine"],
    {
      algorithm: "Unindexed",
      keyId: dek2._id,
    },
  );
  res = await coll.findOne({ medications: unindexedFieldMedic });
  console.log("  res", res);
} catch (err) {
  console.error("!!", err.message);
}

const indexedFieldPID = await encrypt.encrypt(87653221, {
  algorithm: "Indexed",
  keyId: dek1._id,
  queryType: "equality",
  contentionFactor: 1,
});
console.log("3>>\nfindOne : encypt client - index field, 'patientId'");
res = await coll.findOne({ patientId: indexedFieldPID });
console.log("  rest", res);

process.exit(0);

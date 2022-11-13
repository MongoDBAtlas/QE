import * as mcli from "../utils/mongoClient.js";

const [encClient, plainClient] = await mcli.initMdbClients(
  mcli.DB_AUTO_ENCRYPT,
  true,
);
let coll, res;

coll = plainClient.db(mcli.EncDB).collection(mcli.EncColl);
console.log("1>>\nfindOne : plain client - index field, 'patientId'");
res = await coll.findOne({ patientId: 12345678 });
console.log("  res", res);

coll = encClient.db(mcli.EncDB).collection(mcli.EncColl);
try {
  console.log("2>>\nfindOne : encrypt client - non-index field, 'medications'");
  res = await coll.findOne({ medications: ["Atorvastatin", "Levothyroxine"] });
  console.log("  res", res);
} catch (err) {
  console.error("!!", err.message);
}

console.log("3>>\nfindOne : encypt client - index field, 'patientId'");
res = await coll.findOne({ patientId: 12345678 });
console.log("  rest", res);

process.exit(0);

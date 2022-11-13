import * as mcli from "../utils/mongoClient.js";

const [encClient, plainClient] = await mcli.initMdbClients(
  mcli.DB_AUTO_ENCRYPT,
  true,
);
let coll, res;

coll = encClient.db(mcli.EncDB).collection(mcli.EncColl);
console.log("1>>\nfindOne : 'patientId'");
res = await coll.findOne({ patientId: 12345678 });
console.log("  res", res);

const did = res._id;
console.log("2>>\nupdateOne - id:", did);
res = await coll.updateOne({ _id: did }, { $set: { patientId: 87650000 } });
res = await coll.findOne({ _id: did });
console.log("  res - patientId", res.patientId);

coll = plainClient.db(mcli.EncDB).collection(mcli.EncColl);
res = await coll.findOne({ _id: did });
console.log("  res:plain query - patientId", res.patientId);

process.exit(0);

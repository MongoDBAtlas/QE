import * as mcli from "../utils/mongoClient.js";
import { deks, encrypt } from "../utils/keyVault.js";

const [encClient, plainClient] = await mcli.initMdbClients(
  mcli.DB_EXPLICIT_ENCRYPT,
  false,
);

const { dek1, dek2, dek3, dek4 } = deks;
const indexedFieldPID = await encrypt.encrypt(87653221, {
  algorithm: "Indexed",
  keyId: dek1._id,
  contentionFactor: 1,
});
const indexedFieldSSN = await encrypt.encrypt("123-45-6789", {
  algorithm: "Indexed",
  keyId: dek3._id,
  contentionFactor: 1,
});
const unindexedFieldMedic = await encrypt.encrypt(
  ["Atorvastatin", "Levothyroxine"],
  {
    algorithm: "Unindexed",
    keyId: dek2._id,
  },
);
const unindexedFieldBill = await encrypt.encrypt(
  {
    type: "Visa",
    number: "4111111111111111",
  },
  {
    algorithm: "Unindexed",
    keyId: dek4._id,
  },
);

let coll, res;

coll = encClient.db(mcli.EncDB).collection(mcli.EncColl);
res = await coll.insertOne({
  firstName: "Jon",
  lastName: "Doe",
  patientId: indexedFieldPID,
  address: "157 Electric Ave.",
  patientRecord: {
    ssn: indexedFieldSSN,
    billing: unindexedFieldBill,
  },
  medications: unindexedFieldMedic,
});

console.log(">>\ninsertOne");
console.log("  res:", res);

coll = plainClient.db(mcli.EncDB).collection(mcli.EncColl);
res = await coll.findOne({ _id: res.insertedId });
console.log(">>> plain READ from DB");
console.log(res);

process.exit(0);

import * as mcli from "../utils/mongoClient.js";

const [encClient, plainClient] = await mcli.initMdbClients(
  mcli.DB_AUTO_ENCRYPT,
  true,
);
let coll, res;

coll = encClient.db(mcli.EncDB).collection(mcli.EncColl);
res = await coll.insertOne({
  firstName: "Jon",
  lastName: "Doe",
  patientId: 12345678,
  address: "157 Electric Ave.",
  patientRecord: {
    ssn: "987-65-4320",
    billing: {
      type: "Visa",
      number: "4111111111111111",
    },
  },
  medications: ["Atorvastatin", "Levothyroxine"],
});

console.log(">>\ninsertOne");
console.log("  res:", res);

coll = plainClient.db(mcli.EncDB).collection(mcli.EncColl);
res = await coll.findOne({ _id: res.insertedId });
console.log(">>> plain READ from DB");
console.log(res);

process.exit(0);

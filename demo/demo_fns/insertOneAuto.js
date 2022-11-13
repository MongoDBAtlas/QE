import { ExplainVerbosity } from "mongodb";
import { encryptCollAuto, plainColl } from "../utils/mongoClient.js";

const res = await encryptCollAuto.insertOne({
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

console.log(">>> plain READ from DB");
console.log(await plainColl.findOne({ _id: res.insertedId }));

process.exit(0);

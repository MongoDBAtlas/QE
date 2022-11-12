import { MongoClient } from "mongodb";
import { atlasConnUri, useAtlas } from "./env.js";
import { deks, KeyVaultNameSpace } from "./keyVault.js";
import { kmsProviders } from "./kmsProvider.js";

export const EncDB = "medicalRecords";
export const EncColl = "patients";
const secretColNameSpace = `${EncDB}.${EncColl}`;
const { dek1, dek2, dek3, dek4 } = deks;
const encryptedFieldsMap = {
  [secretColNameSpace]: {
    fields: [
      {
        keyId: dek1._id,
        path: "patiendId",
        bsonType: "int",
        queries: { queryType: "equality" },
      },
      {
        keyId: dek2._id,
        path: "medications",
        bsonType: "array",
      },
      {
        keyId: dek3._id,
        path: "patiendRecord.ssn",
        bsonType: "string",
        queries: { queryType: "equality" },
      },
      {
        keyId: dek4._id,
        path: "patientRecord.billing",
        bsonType: "object",
      },
    ],
  },
};

const extraOptions = {
  cryptSharedLibPath: "/home/node/demo/crypt_shared/lib/mongo_crypt_v1.so",
};

function encClientConnUri() {
  let connuri = "mongodb://enterprise.demo";
  if (useAtlas) {
    if ("" === atlasConnUri) {
      console.log("!! ATLAS_CONN_URI is missing");
      console.log("!! Either set ATLAS_CONN_URI or set USE_ATLAS to false");
      throw "ATLAS_CONN_URI is missing";
    }
    connuri = ATLAS_CONN_URI;
  }
  return connuri;
}

async function encClientAuto() {
  const encClient = new MongoClient(encClientConnUri(), {
    autoEncryption: {
      keyVaultNamespace: KeyVaultNameSpace,
      kmsProviders: kmsProviders,
      extraOptions: extraOptions,
      encryptedFieldsMap: encryptedFieldsMap,
    },
  });

  await encClient.connect();
  return encClient;
}
export const encryptClientAuto = await encClientAuto();

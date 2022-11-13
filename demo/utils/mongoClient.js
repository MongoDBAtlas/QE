import { MongoClient } from "mongodb";
import { atlasConnUri, useAtlas } from "./env.js";
import { KeyVault, KeyVaultNameSpace } from "./keyVault.js";
import { kmsProviders } from "./kmsProvider.js";

export const EncDB = "medicalRecords";
export const EncColl = "patients";
const secretColNameSpace = `${EncDB}.${EncColl}`;
const [kvClient, { dek1, dek2, dek3, dek4 }] = KeyVault;

/* MongoClient for Auto Encryption */
const encryptedFieldsMap = {
  [secretColNameSpace]: {
    fields: [
      {
        keyId: dek1._id,
        path: "patientId",
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
        path: "patientRecord.ssn",
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
  let connuri =
    "mongodb://enterprise:27017,enterprise:27018,enterprise:27019/rsfle";
  if (useAtlas === true) {
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
      keyVaultClient: kvClient,
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
export const encryptCollAuto = encryptClientAuto.db(EncDB).collection(EncColl);

/* MongoClient for plain quereis */
async function newPlainClient() {
  const plainClient = new MongoClient(encClientConnUri());
  await plainClient.connect();
  return plainClient;
}
export const plainClient = await newPlainClient();
export const plainColl = plainClient.db(EncDB).collection(EncColl);

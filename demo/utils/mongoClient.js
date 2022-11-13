import { MongoClient } from "mongodb";
import { atlasConnUri, useAtlas } from "./env.js";
import { kvClient, deks, KeyVaultNameSpace } from "./keyVault.js";
import { kmsProviders } from "./kmsProvider.js";

export const EncDB = "medicalRecords";
export const EncColl = "patients";
export const DB_AUTO_ENCRYPT = 1;
export const DB_EXPLICIT_ENCRYPT = 2;

const secretColNameSpace = `${EncDB}.${EncColl}`;
const { dek1, dek2, dek3, dek4 } = deks;

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

function encClientConnUri(targetDB) {
  const DB_AUTO_URI =
    "mongodb://enterprise:27017,enterprise:27018,enterprise:27019";
  const DB_EXPLICIT_URI =
    "mongodb://community:27017,community:27018,community:27019";

  if (!(targetDB === DB_AUTO_ENCRYPT || targetDB === DB_EXPLICIT_ENCRYPT)) {
    const error = `!! invalid arg: ${targetDB}`;
    console.log(error);
    throw error;
  }

  if (targetDB === DB_EXPLICIT_ENCRYPT) {
    return DB_EXPLICIT_URI;
  }

  if (useAtlas === true) {
    if ("" === atlasConnUri) {
      console.log("!! ATLAS_CONN_URI is missing");
      console.log("!! Either set ATLAS_CONN_URI or set USE_ATLAS to false");
      throw "ATLAS_CONN_URI is missing";
    }
    return atlasConnUri;
  }

  return DB_AUTO_URI;
}

export async function initMdbClients(targetDB, enableAutoEncryption) {
  const autoEncryption = {
    keyVaultClient: kvClient,
    keyVaultNamespace: KeyVaultNameSpace,
    kmsProviders: kmsProviders,
    extraOptions: extraOptions,
    encryptedFieldsMap: encryptedFieldsMap,
    bypassQueryAnalysis: !enableAutoEncryption,
  };

  const encClient = new MongoClient(encClientConnUri(targetDB), {
    autoEncryption: autoEncryption,
  });
  await encClient.connect();

  const plainClient = new MongoClient(encClientConnUri(targetDB));
  await plainClient.connect();

  return [encClient, plainClient];
}

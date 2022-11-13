import { MongoClient } from "mongodb";
import { ClientEncryption } from "mongodb-client-encryption";
import { kmsProviders } from "./kmsProvider.js";
import * as utils from "./utils.js";

const dbName = "kv";
const colName = "keyVault";
export const KeyVaultNameSpace = `${dbName}.${colName}`;

async function initKeyVault() {
  const uri = "mongodb://community:27017,community:27018,community:27019/rsfle";

  const mcli = new MongoClient(uri);
  await mcli.connect();
  const db = mcli.db(dbName);

  let keyVault = await utils.lookupCollection(db, colName);
  if (undefined === keyVault) {
    console.log("> init key vault");
    keyVault = db.collection(colName);
    await keyVault.createIndex(
      { keyAltNames: 1 },
      {
        unique: true,
        partialFilterExpression: { keyAltNames: { $exists: true } },
      },
    );

    const clientEnc = new ClientEncryption(mcli, {
      keyVaultNamespace: KeyVaultNameSpace,
      kmsProviders: kmsProviders,
    });
    await clientEnc.createDataKey("local", {
      keyAltNames: ["dataKey1"],
    });
    await clientEnc.createDataKey("local", {
      keyAltNames: ["dataKey2"],
    });
    await clientEnc.createDataKey("local", {
      keyAltNames: ["dataKey3"],
    });
    await clientEnc.createDataKey("local", {
      keyAltNames: ["dataKey4"],
    });
  }

  console.log("> key vault found:", keyVault.s.namespace);
  const dek1 = await keyVault.findOne({ keyAltNames: "dataKey1" });
  const dek2 = await keyVault.findOne({ keyAltNames: "dataKey2" });
  const dek3 = await keyVault.findOne({ keyAltNames: "dataKey3" });
  const dek4 = await keyVault.findOne({ keyAltNames: "dataKey4" });

  const deks = { dek1: dek1, dek2: dek2, dek3: dek3, dek4: dek4 };
  for (const dek of Object.values(deks)) {
    console.log(`  _id: ${dek._id}, keyAltNames: ${dek.keyAltNames}`);
  }

  return [mcli, deks];
}

export const KeyVault = await initKeyVault();

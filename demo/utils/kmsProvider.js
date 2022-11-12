import { CMK } from "./env.js";
import fs from "fs";

const localMasterKey = fs.readFileSync(CMK);
export const kmsProviders = {
  local: {
    key: localMasterKey,
  },
};

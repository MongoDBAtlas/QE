import dotenv from "dotenv";
dotenv.config();

export const CMK = process.env.CMK;
export const useAtlas = process.env.USE_ATLAS;
export const atlasConnUri = process.env.ATLAS_CONN_URI;

import {Configuration} from "../types";
import {promisify} from "util";
import fs from "node:fs";

const writeFileAsync = promisify(fs.writeFile);
export const CONFIG_FILE_POSTFIX: string = '_config.json'
export async function createConfigFile(config: Configuration, randomName: string): Promise<void>{
    const randomConfigFileName = randomName + CONFIG_FILE_POSTFIX;
    const configurationStr = JSON.stringify(config, null, 2);
    await writeFileAsync(randomConfigFileName, configurationStr);
}

export async function randomStr(): Promise<string>{
    return (Math.random() + 1).toString(36).substring(7);
}
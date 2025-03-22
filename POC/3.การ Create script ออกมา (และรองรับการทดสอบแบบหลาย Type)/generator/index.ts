import fs from 'fs-extra'
import _express from "express";
import type { I_LoadtestApiK6 } from "./types/request";
import { mockLoadtestApiRequest } from "./utils/mock_request";
import { copyFolder, f } from "./utils/helper";
import { imports } from './component/import';
import { main } from './component/main';
import { setup } from './component/setup';
import { teardown } from './component/teardown';
import { handle } from './component/handle';


const mergedScript = async (flow: I_LoadtestApiK6): Promise<string> => {
  const merged = f(`
    ${imports(flow)}
    $VARIABLE
    ${handle(flow)}
    ${setup(flow)}
    ${teardown(flow)}
    ${main(flow)}
  `)
  return merged 
}


// func generate script follow loadtest types
const generateLoadtestingScript = async (flow: I_LoadtestApiK6) => {
  const source_dir = './ready-made/script';
  const destination_dir = './../script';
  if (!fs.existsSync(destination_dir)) {
    fs.mkdirSync(destination_dir, {
      recursive: true
    });
  }
  await copyFolder(source_dir, destination_dir);
  await fs.writeFile(`${destination_dir}/index.js`, (await mergedScript(flow))?.trim());
  console.info('[INFO]: Script generated successfully');
}


// main function   
const flow = mockLoadtestApiRequest as I_LoadtestApiK6
switch (flow?.type) {
  case 'load_testing':
    generateLoadtestingScript(flow);
    break;
  default:
    throw new Error('Unsupported loadtest type');
}
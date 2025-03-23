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
import { option } from './component/option';
import { replaceUseVariable } from './handler/variable';


const mergedScript = async (flow: I_LoadtestApiK6): Promise<string> => {
  const full_script = f(`
    ${imports(flow)}
    ${option(flow)}
    ${handle(flow)}
    ${setup(flow)}
    ${teardown(flow)}
    ${main(flow)}
  `)

  const full_script_with_replace_variables = replaceUseVariable(full_script)
  console.log('full_script_with_replace_variables', full_script_with_replace_variables)
  return full_script_with_replace_variables
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
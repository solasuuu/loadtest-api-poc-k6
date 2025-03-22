import fs from 'fs-extra'
import _express from "express";
import type { I_LoadtestApiK6 } from "./types/request";
import { mockLoadtestApiRequest } from "./utils/mock";
import { copyFolder, f } from "./utils/helper";
import { imports } from './component/import';
import { core } from './component/core';
import { setup } from './component/setup';
import { teardown } from './component/teardown';
import { handle } from './component/handle';

const mergedScript = async (flow: I_LoadtestApiK6): Promise<string> => {
  return f(`
    ${imports(flow)}
    ${handle(flow)}
    ${setup(flow)}
    ${teardown(flow)}
    ${core(flow)}
  `)
}

// func generate script follow loadtest types
const generateLoadtestingScript = async (flow: I_LoadtestApiK6) => {
  const dir = './../script';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true
    });
  }
  await fs.writeFile(`${dir}/index.js`, (await mergedScript(flow))?.trim());
  await copyFolder('./ready-made/script', './../script');
  console.info('[INFO]: Script generated successfully');
}

// Core   
const flow = mockLoadtestApiRequest as I_LoadtestApiK6
switch (flow?.type) {
  case 'load_testing':
    generateLoadtestingScript(flow);
    break;
  default:
    throw new Error('Unsupported loadtest type');
}
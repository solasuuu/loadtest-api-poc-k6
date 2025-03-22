import fs from 'fs'
import _express from "express";
import type { I_LoadtestApiK6 } from "./types/request";
import { mockLoadtestApiRequest } from "./utils/mock";
import { f } from "./utils/helper";
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

const generateLoadtestingScript = async (flow: I_LoadtestApiK6) => {
  const dir = './../script';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true
    });
  }
  fs.writeFileSync(`${dir}/index.js`, (await mergedScript(flow))?.trim());
}

// Core 
const flow = mockLoadtestApiRequest as I_LoadtestApiK6
switch (flow?.type) {
  case 'load_testing':
    generateLoadtestingScript(flow);
    console.info('Script generated successfully');
    break;
  default:
    throw new Error('Unsupported loadtest type');
}
import * as d  from "./deps.ts";
import { Generator, BookDesc } from "./generator.ts";

function processError(e: string) {
  console.log(e);

}
async function gatherSubdirs(root: string): Promise<Array<string>> {
    console.log("gather subdir for", root);
    const a = new Array<string>();
    for await (const e of d.walk(root, {maxDepth: 1, includeFiles: false})) {
      if (e.path !== root) { 
        a.push(e.path);
      }
    }
    return a;
}

function display(a: Array<string>) {
  for (const e of a) {
    console.log("  ",  e);
  }
}

async function listDirs(root: string): Promise<Array<string>> {
    const ex = await d.exists(root);
    if (ex) {
      return gatherSubdirs(root);
    } else {
      throw new Error(`Root directory ${root} does not exist`);
  }
}


async function main(rootPath: string, destDir: string) {
  const dirs = await listDirs(rootPath);
  for (const sourceDir of dirs) {
    const parsedSourceDir = d.path.parse(sourceDir)
    const fullDestDir : string = d.path.join(destDir, parsedSourceDir.base); 
    const gen = new Generator();
    const resStr =  await gen.show(sourceDir, fullDestDir);
    console.log(resStr);
  }
}

const DESTDIR = "output";
main(Deno.args[0], DESTDIR);

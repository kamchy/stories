import * as d  from "./deps.ts";
import { Generator} from "./generator.ts";

/**
* (Async) Gathers all subrirectories of give root path of depth 1,
* root excluded.
* @param root string with an initial directory which will be walked 
*        to gather subdirectories
* @return Promise with Array of strings
* */
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

/**
* Checks if root exists; if so, calls gtherSubdirs(root).
* @param root directory checked if exists
* @return result of a call to gatherSubdirs(root) 
* @throws Error if root does not exist
* */
async function listDirs(root: string): Promise<Array<string>> {
    const ex = await d.exists(root);
    if (ex) {
      return gatherSubdirs(root);
    } else {
      throw new Error(`Root directory ${root} does not exist`);
  }
}

/**
* Scans rootpath for story directories and generates html pages to same-named subdirectory of destDir.
* Main entry point. 

* @param rootPath path with story directories (ones containing description.toml)
* @param destDir name of directory (created if needed) where html will be generated and resources (images from story directories) copied 
* */
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

/** Name of output directory */
const DESTDIR = "output";

main(Deno.args[0], DESTDIR);

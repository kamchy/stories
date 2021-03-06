import * as d  from "./deps.ts";
import { Generator} from "./generator.ts";
import { execFnIfDirExists } from "./utils.ts";

/**
* (Async) Gathers all subrirectories of give root path of depth 1,
* root excluded.
* @param root string with an initial directory which will be walked
*        to gather subdirectories
* @return Promise with Array of strings
* */
async function gatherSubdirs(root: string): Promise<Array<string>> {
    const a = new Array<string>();
    for await (const e of d.walk(root, {maxDepth: 1, includeFiles: false})) {
      if (e.path !== root) {
        a.push(e.path);
      }
    }
    return a;
}


const genData = {
  destFile: "index.html",
  sourceAssetsDir: "assets",
  assetsDir: "assets",
  imgwidth: 800,
  imgheight: 600,
  cssFile: "styles.css",
  indexCssFile: "index.css",
  title: "Bajeczki dla Eweczki",
  pdfFile: "output.pdf"
};

/**
* Scans rootpath for story directories and generates html pages to same-named subdirectory of destDir.
* Main entry point.

* @param rootPath path with story directories (ones containing description.toml)
* @param destDir name of directory (created if needed) where html will be generated and resources (images from story directories) copied
* */
export default async function main(rootPath: string, destDir = "output") {
  const dirs = await execFnIfDirExists(rootPath, gatherSubdirs);
  const gen = new Generator();
  for (const sourceDir of dirs) {
    const parsedSourceDir = d.path.parse(sourceDir)
    const fullDestDir : string = d.path.join(destDir, parsedSourceDir.base);
    await d.ensureDir(fullDestDir);
    const genConfig = {sourceDir: sourceDir, destDir: fullDestDir, ...genData}
    await gen.generateBookDirectory(genConfig);
  }

  gen.generateBooksIndex({
    destDir: destDir,
    assetsDir: genData.assetsDir,
    storyStylesheet: genData.cssFile,
    indexStylesheet: genData.indexCssFile,

  });

}


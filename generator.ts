import * as d from "./deps.ts";
import StoryRenderer from "./renderer.ts";
import { PageDesc, GenerationData } from "./types.ts";
import { readSource } from "./utils.ts";

/**
* Generator for html version of stories.
* Creates directory for static version of the story and copies relevant assets.
* Directory contains: 
*   * static html file genrated from descriptior.toml file
*   * assets: image files indicated by descriptor.toml)
*   * assets: css file
* */
export class Generator {
  DESC_NAME = "description.toml";
  renderer = new StoryRenderer();


  /**
  * Copies all images indicated by rec (deserialized story content descriptor from .toml)
  * and css file to target directories according to GenerationData info.
  *
  * @param rec deserialized description.toml 
  * @param genData info about source and destination paths where files will be copied
  * */
  async copyAssets(rec: Record<string, unknown>, genData: GenerationData) {
    const destAssetsDir = d.path.join(genData.destDir, genData.assetsDir);
    console.log(`copy assets - ensure dir ${destAssetsDir}`);
    await d.ensureDir(destAssetsDir);

    const assets = [];
    const pages: Array<PageDesc> = rec.pages as Array<PageDesc>;
    assets.push(rec.titleImagePath);
    for (const p of pages) {
      assets.push(p.imagePath);
    }

    for (const f of assets) {
      const source = d.path.join(genData.sourceDir, f as string);
      const parsedSource = d.path.parse(source);
      const dest = d.path.join(destAssetsDir, parsedSource.base);
      console.log(`copy ${source} to ${dest}`);
      await d.copy(source, dest, {overwrite: true});
    }

    d.copy(d.path.join(Deno.cwd(), genData.sourceAssetsDir, genData.cssFile), 
           d.path.join(destAssetsDir, genData.cssFile), 
           {overwrite: true});
  }

  
  /**
  * (Async) generates html file with a story and images/css links.
  *
  * @param rec deserialized description.toml 
  * @param genData info about source and destination paths where files will be copied
  * */
  async generateFile(rec: Record<string, unknown>, genData: GenerationData) {
    const destIndexFile = d.path.join(genData.destDir, genData.destFile);
    await d.ensureFile(destIndexFile);
    console.log(`created ${destIndexFile}`);
      

    (rec.pages as Array<PageDesc>).sort((page: PageDesc) => page.number);
    const s = this.renderer.renderStory(rec, genData);
    console.log(s);
    await Deno.writeTextFile(destIndexFile, s);

  }

  /**
  * Main generation method of Generator.
  * Deserializes .toml file.
  * Generates html file.
  * Copies assets to target (static) story directory.
  *
  * Assets are copied (and overwritten) unconditionally, even if not changed.
  *
  * @param sourceDir  source directory (story directory) with decription.toml file
  * @param destDir  destination directory (corresponding to story directory) 
  *                 where html file will be generated and assets copied.
  * */
  async show(sourceDir: string, destDir: string): Promise<string> {
    const tomlFile = d.path.join(sourceDir, this.DESC_NAME);
    const ex = await d.exists(tomlFile);
    if (!ex) {
      return Promise.resolve(`${this.DESC_NAME} does not exist in ${sourceDir}`);
    } else {
      const fileContent = await readSource(tomlFile);
      const descriptionRecord = d.toml.parse(fileContent);

      const genData = {
        sourceDir: sourceDir,
        destDir: destDir,
        destFile: "index.html",
        sourceAssetsDir: "assets",
        assetsDir: "assets",
        imgwidth: 800,
        imgheight: 600,
        cssFile: "styles.css",
        title: "Bajeczki dla Eweczki"
      };

      await this.generateFile(descriptionRecord, genData);
      await this.copyAssets(descriptionRecord, genData);
      return Promise.resolve(` wrote to ${d.path.join(genData.destDir, genData.destFile)}`);
    }
  }
}

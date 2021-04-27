import * as d from "./deps.ts";
import StoryRenderer from "./renderer.ts";
import { PageDesc, GenerationData } from "./types.ts";


export class Generator {
  DESC_NAME = "description.toml";
  renderer = new StoryRenderer();
  decoder = new TextDecoder('utf-8');

  async readSource(fname: string): Promise<string> {
    return this.decoder.decode(await Deno.readFile(fname));
  }

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
    d.copy(d.path.join(Deno.cwd(), genData.cssFile), 
           d.path.join(destAssetsDir, genData.cssFile), 
           {overwrite: true});
  }

  

  async generateFile(rec: Record<string, unknown>, genData: GenerationData) {
    const destIndexFile = d.path.join(genData.destDir, genData.destFile);
    await d.ensureFile(destIndexFile);
    console.log(`created ${destIndexFile}`);
      

    (rec.pages as Array<PageDesc>).sort((page: PageDesc) => page.number);
    const s = this.renderer.renderStory(rec, genData);
    console.log(s);
    await Deno.writeTextFile(destIndexFile, s);

  }

  async show(sourceDir: string, destDir: string): Promise<string> {
    const tomlFile = d.path.join(sourceDir, this.DESC_NAME);
    const ex = await d.exists(tomlFile);
    if (!ex) {
      return Promise.resolve(`${this.DESC_NAME} does not exist in ${sourceDir}`);
    } else {
      const fileContent = await this.readSource(tomlFile);
      const descriptionRecord = d.toml.parse(fileContent);

      const genData = {
        sourceDir: sourceDir,
        destDir: destDir,
        destFile: "index.html",
        assetsDir: "assets",
        imgwidth: 800,
        imgheight: 600,
        cssFile: "styles.css",
      };

      await this.generateFile(descriptionRecord, genData);
      await this.copyAssets(descriptionRecord, genData);
      return Promise.resolve(` wrote to ${d.path.join(genData.destDir, genData.destFile)}`);
    }
  }
}

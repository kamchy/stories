import * as d from "./deps.ts";
export interface PageDesc {
  number: number,
  imagePath: string,
  text: Array<string>
}

export interface BookDesc {
  title: string,
  titleImagePath: string,
  footer: string,
  pages: Array<PageDesc>
}

interface GenerationData {
  sourceDir: string,
  destDir: string,
  destFile: string,
  assetsDir: string,
  imgwidth: number,
  imgheight: number,
}

export class Generator {
  DESC_NAME = "description.toml";

  async readSource(fname: string): Promise<string> {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(await Deno.readFile(fname));
    return text;
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
      const dest = d.path.join(genData.destDir, genData.assetsDir, parsedSource.base);
      console.log(`copy ${source} to ${dest}`);
      await d.copy(source, dest, {overwrite: true});
    }

  }

  async generate(rec: Record<string, unknown>, genData: GenerationData) {
    const destIndexFile = d.path.join(genData.destDir, "index.html");
    await d.ensureFile(destIndexFile);
    console.log(`created ${destIndexFile}`);

    const pages: Array<PageDesc> = (rec.pages as Array<PageDesc>);
    pages.sort(page => page.number);
    let s = `
    <DOCTYPE html>
    <html>
    </body>
    <h1>${rec.title}</h1>
    <img
    width="${genData.imgwidth}"
    height="${genData.imgheight}"
    src="${genData.assetsDir}/${rec.titleImagePath}"/>
    `;
    for (const page of pages) {
      const lines = (page.text as unknown as string).split("\n").map((l: string) => `<div>${l}</div>`).join("");
      s += `
      <div>
        <img
        width="${genData.imgwidth}"
        height="${genData.imgheight}"
        src="${genData.assetsDir}/${page.imagePath}" />

        <p> ${lines} </p>
      </div>
      <div id="foter"><span>${rec.footer}</span><span>${page.number}</span>
      `;
    }
    s += `
    <p>${rec.footer}</p>
    </body>
    </html>
    `;
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
      };
      await this.generate(descriptionRecord, genData);
      await this.copyAssets(descriptionRecord, genData);
      return Promise.resolve(` wrote to ${d.path.join(genData.destDir, genData.destFile)}`);
    }
  }
}

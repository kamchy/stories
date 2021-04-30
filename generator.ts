import * as d from "./deps.ts";
import { renderStory, renderIndex } from "./renderer.ts";
import { GenerationData, PageDesc, BookDesc, OutputBook } from "./types.ts";
import { BookParser } from "./bookparser.ts";
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
  books: Array<OutputBook> = [];

  async copy(source: string, dest: string) {
    const existsSource = await d.exists(source);
    const existsDest = await d.exists(dest);
    let sourceIsNewer = false;
    if (existsDest) {
      const ssm = (await Deno.stat(source)).mtime;
      const dsm = (await Deno.stat(dest)).mtime;
      sourceIsNewer = ssm !== null && dsm !== null && ssm > dsm;
    }
    const shouldCopy = existsSource && (!existsDest || sourceIsNewer);

    if (shouldCopy) {
      await d.copy(source, dest, { overwrite: true });
    }
  }

  /**
  * Copies all images indicated by rec (deserialized story content descriptor from .toml)
  * and css file to target directories according to GenerationData info.
  *
  * @param rec BookDesc instance
  * @param genData info about source and destination paths where files will be copied
  * */
  async copyAssets(rec: BookDesc, genData: GenerationData) {
    const destAssetsDir = d.path.join(genData.destDir, genData.assetsDir);
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
      this.copy(source, dest);
    }

    this.copy(
      d.path.join(Deno.cwd(), genData.sourceAssetsDir, genData.cssFile),
      d.path.join(destAssetsDir, genData.cssFile),
    );
  }

  indexFile(genData: GenerationData): string {
    return d.path.join(genData.destDir, genData.destFile);
  }

  /**
  * (Async) generates html file with a story and images/css links.
  *
  * @param fileName name of file
  * @param textProvide function that generates string to be written
  * */
  async generateFile(fileName: string, textProvider: ()=>string) {
    await d.ensureFile(fileName);
    await Deno.writeTextFile(fileName, textProvider());
    console.log(`Generated ${fileName}`);
  }

  appendOutputBook(bd: OutputBook) {
    this.books.push(bd);
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
  async generateBookDirectory(genData: GenerationData): Promise<string> {
    const tomlFile = d.path.join(genData.sourceDir, this.DESC_NAME);
    const bp = new BookParser(tomlFile);
    if (!bp.canParse()) {
      return `${this.DESC_NAME} does not exist in ${genData.sourceDir}`;
    } else {
      await bp.parse();
      const bd = bp.description();
      if (bd === null) {
        return "Could not parse" + tomlFile;
      }
      this.appendOutputBook({bookDesc: bd, sourceDir: genData.sourceDir, indexFileName: genData.destFile});
      await d.ensureDir(genData.destDir);
      this.copyAssets(bd, genData);
      this.generateFile(
        this.indexFile(genData), 
        () => renderStory(bd, genData));
      return this.indexFile(genData);
    }

  }

  generateBooksIndex(destDir: string) {
    this.generateFile(
      d.path.join(destDir, "index.html"), 
      () => renderIndex(this.books)
    )

  }
}

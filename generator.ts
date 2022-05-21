import * as d from "./deps.ts";
import { renderIndex, renderStory } from "./renderer.ts";
import {
  BookDesc,
  GenerationData,
  IndexGeneratorData,
  OutputBook,
  PageDesc,
} from "./types.ts";
import { BookParser } from "./bookparser.ts";
/**
 * Generator for html version of stories.
 * Creates directory for static version of the story and copies relevant assets.
 * Directory contains:
 *   * static html file genrated from descriptior.toml file
 *   * assets: image files indicated by descriptor.toml)
 *   * assets: css file
 */

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
   */
  async copyAssets(rec: BookDesc, genData: GenerationData) {
    const destAssetsDir = d.path.join(genData.destDir, genData.assetsDir);
    await d.ensureDir(destAssetsDir);

    const assets = [];
    const pages: Array<PageDesc> = rec.pages as Array<PageDesc>;
    assets.push(rec.titleImagePath);
    for (const p of pages) {
      assets.push(p.imagePath);
    }
    assets.push(genData.pdfFile);

    for (const f of assets) {
      const source = d.path.join(genData.sourceDir, f as string);
      const parsedSource = d.path.parse(source);
      const dest = d.path.join(destAssetsDir, parsedSource.base);
      this.copy(source, dest);
    }
  }

  indexFile(genData: GenerationData): string {
    return d.path.join(genData.destDir, genData.destFile);
  }

  /**
   * (Async) generates html file with a story and images/css links.
   *
   * @param fileName name of file
   * @param textProvide function that generates string to be written
   */
  async generateFile(fileName: string, textProvider: () => string) {
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
   * @param genData  GenerationData object
   */
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

      this.appendOutputBook(
        {
          bookDesc: bd,
          sourceDir: genData.sourceDir,
          indexFileName: genData.destFile,
          pdfFileName: genData.pdfFile
        },
      );

      await d.ensureDir(genData.destDir);
      this.copyAssets(bd, genData);
      this.generateFile(
        this.indexFile(genData),
        () => renderStory(bd, genData),
      );
      return this.indexFile(genData);
    }
  }

  async generateBooksIndex(cfg: IndexGeneratorData) {
    const indexAssetsPath = d.path.join(cfg.destDir, cfg.assetsDir);
    await d.ensureDir(indexAssetsPath);
    let targetFiles = [cfg.storyStylesheet, cfg.indexStylesheet, "imghtml.png", "imgpdf.png"]
    for (let fname of targetFiles) {
      let fr =  d.path.join(cfg.assetsDir, fname)
      let to = d.path.join(indexAssetsPath, fname)
      console.log(`copy: \nfrom: ${fr}\nto  : ${to}`)
      this.copy(fr, to);
    }

    const indexStylesheet = d.path.join(cfg.assetsDir, cfg.indexStylesheet);
    await this.generateFile(
      d.path.join(cfg.destDir, "index.html"),
      () => renderIndex(this.books, indexStylesheet),
    );
  }
}

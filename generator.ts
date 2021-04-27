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

export class Generator {
  source: string;
  dest: string;
  DESC_NAME = "description.toml";


  /**
  * @param sourceDir - directory with story images and expected story.toml 
  * */
  constructor(sourceDir: string, destDir: string) {
    this.source = sourceDir;
    this.dest = destDir;
  }

  async show(): Promise<string> {
    const tomlfile = d.path.join(this.source, this.DESC_NAME);
    const ex = await d.exists(tomlfile);
    if (!ex) {
      return Promise.resolve(`${this.DESC_NAME} does not exist in ${this.source}`);
    } else {
      return Promise.resolve(`hello ${tomlfile}`);
    }
  }
}

import {toml, fs} from "./deps.ts";
import { readSource } from "./utils.ts";

import { BookDesc, PageDesc } from "./types.ts";

export class BookParser {
  readonly filePath: string;
  bookDesc: BookDesc | null;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.bookDesc = null;
  }

  canParse(): boolean {
    return fs.existsSync(this.filePath);
  }

  async parse() {
    const fileContent = await readSource(this.filePath);
    const descriptionRecord = toml.parse(fileContent);
    const pages = descriptionRecord.pages as Array<PageDesc>;
    pages.sort((page: PageDesc) => page.number); 

    this.bookDesc = { 
      title: descriptionRecord.title as string,
      titleImagePath: descriptionRecord.titleImagePath as string,
      footer: descriptionRecord.footer as string,
      pages: pages,
      author: descriptionRecord.author as string,
    }
  }

  description(): BookDesc | null {
    return this.bookDesc;
  }
}

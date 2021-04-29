/**
 *
 * This script generates single description.toml file
 * given a directory name with .jpg images.
 * */

import { execFnIfDirExists } from "./utils.ts";
import { path, toml, walk } from "./deps.ts";
import { PageDesc } from "./types.ts";

const bookDesc = (
  dirname: string,
  titleImage: string,
  pagesList: Array<PageDesc>,
) => (
  {
    title: dirname,
    author: "Kamila Chyla",
    titleImagePath: titleImage,
    footer: "Bajeczki dla Eweczki",
    pages: pagesList,
  }
);

const pageDesc = (num: number, imgName: string) => (
  {
    number: num,
    imagePath: imgName,
    text: [""],
  }
);

async function generate(directoryName: string): Promise<string> {
  const imgFiles = [];
  const walkOpts = { maxDepth: 1, includeFiles: true, match: [/.*\.jpg$/] };
  for await (const e of walk(directoryName, walkOpts)) {
    imgFiles.push(e.name);
  }
  imgFiles.sort();
  const titleImage: string = imgFiles[0];
  imgFiles.splice(0, 1);
  const pageImages: string[] = imgFiles;
  const pages = pageImages.map((imgName, idx) => pageDesc(idx + 1, imgName));
  const book = bookDesc(path.parse(directoryName).name, titleImage, pages);
  return toml.stringify(book);
}

const s = await execFnIfDirExists(Deno.args[0], generate);
console.log(s);

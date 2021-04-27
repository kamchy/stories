import { GenerationData, PageDesc } from "./types.ts";

export default class StoryRenderer {
  renderStory(rec: Record<string, unknown>, genData: GenerationData) {
    let s = `
    <!doctype html>
    <html>
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link rel="stylesheet" href="${genData.assetsDir}/${genData.cssFile}">
    </head>
    </body>
    <div id="main">
    <section class="page">
      <h1>${rec.title}</h1>
      <img class="title"
      width="${genData.imgwidth}"
      height="${genData.imgheight}"
      src="${genData.assetsDir}/${rec.titleImagePath}"/>

      <div class="footer">${rec.footer}</div>
    </section>
    `;
    const pages = rec.pages as Array<PageDesc>;
    for (const page of pages) {
      const lines = (page.text as unknown as string).split("\n").map(
        (l: string) => `<div>${l}</div>`).join("");
      s += `
      <section class="page">
        <img
        width="${genData.imgwidth}"
        height="${genData.imgheight}"
        src="${genData.assetsDir}/${page.imagePath}" />
        <div class="lineswrapper"> ${lines}</div>
        <div class="footer"><span>${rec.footer}</span><span>${page.number}</span>
      </section>
      `;
    }
    s += `
    </div>
    </body>
    </html>
    `;
    return s;
  }
}

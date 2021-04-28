import { GenerationData, PageDesc } from "./types.ts";

export default class StoryRenderer {

  renderStory(rec: Record<string, unknown>, genData: GenerationData) {
    const author = rec.author ?? 'Kamila Chyla';

    let s = `
    <!doctype html>
    <html>
    <head>
    <title>${genData.title}</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link rel="stylesheet" href="${genData.assetsDir}/${genData.cssFile}">
    </head>
    <body>
    <div id="main">
    <section class="page titlepage" >
      <h1>${rec.title}</h1>
      <h2> ${author}</h2>
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
      <section class="page normal">
        <img
        width="${genData.imgwidth}"
        height="${genData.imgheight}"
        src="${genData.assetsDir}/${page.imagePath}" />
        <div class="lineswrapper"> ${lines}</div>
        <div class="footer"><span>${rec.footer}</span><span>${page.number}</span></div>
      </section>
      `;
    }
    s += `
    </div>
    <script type="module">
      const allPages = document.getElementsByClassName("page");
      var current = 0;

      function show(page, val) {
        page.style.display = val ? "flex" : "none";
      }

      function isRight(e) {
        const r = e.target.getBoundingClientRect();
        return e.clientX - r.x > r.width/2;
      }

      function update(moved) {
        current += moved;
        show(allPages[current], true);
        show(allPages[current - moved], false);
      }

      function navigate(e) {
        const right = isRight(e);
        let moved = 0;
        if (right && (current < allPages.length - 1)) {
          moved = 1;
        } else if (!right && (current > 0)) {
          moved = -1;
        }
        if (moved) {
          update(moved);
        }
      }
      function main () {
        for (const page of allPages) {
          show(page, page.classList.contains("titlepage"));
          page.addEventListener("click", navigate);
        }
      }

      main();

    </script>
    </body>
    </html>
    `;
    return s;
  }
}

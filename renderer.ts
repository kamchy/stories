import { GenerationData, PageDesc, BookDesc, OutputBook}  from "./types.ts";
import { path } from "./deps.ts";

export function renderStory(
  rec: BookDesc,
  genData: GenerationData,
) {
  const author = rec.author ?? "Kamila Chyla";
  const footerLink = `<a href="../${genData.destFile}">${rec.footer}</a>`;
  let s = `
  <!doctype html>
  <html>
  <head>
  <title>${genData.title}</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="stylesheet" href="../${genData.assetsDir}/${genData.cssFile}">
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
    <div class="footer">${footerLink}</div>
  </section>
  `;

  const pages = rec.pages as Array<PageDesc>;
  for (const page of pages) {
    const lines = (page.text as unknown as string).split("\n").map(
      (l: string) => `<div>${l}</div>`,
    ).join("");
    s += `
    <section class="page normal">

      <img
      width="${genData.imgwidth}"
      height="${genData.imgheight}"
      src="${genData.assetsDir}/${page.imagePath}" />

      <div class="lineswrapper"> ${lines}</div>
      <div class="footer"><span>${footerLink}</span><span>${page.number}</span></div>
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

function renderBookCover(book: OutputBook): string {
  const outPath = path.parse(book.sourceDir);
  const img: string = path.join(outPath.name, "assets", book.bookDesc.titleImagePath);
  const ind: string = path.join(outPath.name, book.indexFileName);
  const pdf: string = path.join(outPath.name, "assets", book.pdfFileName);
  return `
  <div class="bookdesc">
    <h2 class="title">${book.bookDesc.title}</h2>
    <div class="author">${book.bookDesc.author ?? ""}</div>
    <a href="${ind}">
    <img class="coverimage" src="${img}"/>
    </a>
    <div class="contentlinks">
    <a href="${ind}"
      class="contentlink">
      <img src="../assets/imghtml.png">
    <span>otwórz jako html </span>
    </a>


    <a href="${pdf}"
    class="contentlink">
    <img src="../assets/imgpdf.png">
      <span>otwórz jako pdf</span>
    </a>
  </div>
    <div class="footer"> Bajeczki dla Eweczki </div>
  </div>
  `;
}

export function renderIndex(books: Array<OutputBook>, indexStylesheet: string): string {
  const articles = books.map(b => `<article>${renderBookCover(b)}</article>`).join("\n");
  const s = `
  <!doctype html>
  <html>
  <head>
  <title>bajki</title>
  <meta charset="UTF-8">

  <link rel="stylesheet" href="${indexStylesheet}">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  </head>
  <body>
    <section id="header">
    <h1>Bajeczki dla Eweczki </h1>
    <h2>Lista mini-książeczek dla dwulatka.</h2>
    </section>

    <section class="page" >
      ${articles}
    </section>
    <section id="footer">
    <a href="https://kamilachyla.com"> kamilachyla.com </a>
    </section>
  </body>
  </html>
  `;

  return s;
}

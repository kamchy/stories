/**
* Describes single page in the book.
* */
export interface PageDesc {
  number: number,
  imagePath: string,
  text: Array<string>
}

/**
*Single book.
* */
export interface BookDesc {
  title: string,
  titleImagePath: string,
  footer: string,
  pages: Array<PageDesc>,
  author?: string,
}

/**
* Paths and info related to assets copying and html generation.
* */
export interface GenerationData {
  sourceDir: string,
  destDir: string,
  destFile: string,
  sourceAssetsDir: string,
  assetsDir: string,
  imgwidth: number,
  imgheight: number,
  cssFile: string,
  indexCssFile: string,
  title: string,
  pdfFile: string
}

export interface OutputBook {
  bookDesc: BookDesc,
  sourceDir: string,
  indexFileName: string,
  pdfFileName: string
}


export interface IndexGeneratorData {
  destDir: string,
  assetsDir: string,
  indexStylesheet: string,
  storyStylesheet: string,
}

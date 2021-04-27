
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

export interface GenerationData {
  sourceDir: string,
  destDir: string,
  destFile: string,
  assetsDir: string,
  imgwidth: number,
  imgheight: number,
  cssFile: string,
}

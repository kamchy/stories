
export interface PageDesc {
  number: number,
  imagePath: string,
  text: Array<string>
}

export interface BookDesc {
  title: string,
  titleImagePath: string,
  footer: string,
  pages: Array<PageDesc>,
  author?: string,
}

export interface GenerationData {
  sourceDir: string,
  destDir: string,
  destFile: string,
  sourceAssetsDir: string,
  assetsDir: string,
  imgwidth: number,
  imgheight: number,
  cssFile: string,
  title: string
}

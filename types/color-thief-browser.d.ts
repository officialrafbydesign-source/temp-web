declare module "color-thief-browser" {
  export type RGBColor = [
    number,
    number,
    number,
  ];

  export default class ColorThief {
    getColor(
      source:
        | HTMLImageElement
        | HTMLCanvasElement,
      quality?: number
    ): RGBColor;

    getPalette(
      source:
        | HTMLImageElement
        | HTMLCanvasElement,
      colorCount?: number,
      quality?: number
    ): RGBColor[];
  }
}
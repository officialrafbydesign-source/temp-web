import ColorThief from "color-thief-browser";

export async function getArtworkColor(url: string) {

  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = url;

  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const colorThief = new ColorThief();
  const [r, g, b] = colorThief.getColor(img);

  return `rgb(${r},${g},${b})`;
}
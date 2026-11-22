import { continueRender, delayRender, staticFile } from "remotion";

// Self-hosted Google Fonts (OFL) so renders are deterministic and offline-safe.
const FACES: [string, string, string, string][] = [
  ["Cormorant Garamond", "CormorantGaramond-300-normal.woff2", "300 400", "normal"],
  ["Cormorant Garamond", "CormorantGaramond-300-italic.woff2", "300", "italic"],
  ["Manrope", "Manrope-500-normal.woff2", "500 600", "normal"],
];

const handle = delayRender("Loading fonts");
Promise.all(
  FACES.map(([family, file, weight, style]) => {
    const f = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format("woff2")`, { weight, style });
    return f.load().then((loaded) => document.fonts.add(loaded));
  }),
)
  .then(() => continueRender(handle))
  .catch((e) => {
    console.error(e);
    continueRender(handle);
  });

export const SERIF = "'Cormorant Garamond', Georgia, serif";
export const SANS = "Manrope, Helvetica, Arial, sans-serif";

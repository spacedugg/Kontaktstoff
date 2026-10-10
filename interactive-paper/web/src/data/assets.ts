const images: Record<string,string> = {
  "hero": "/images/v9/hero.webp",
  "arrival": "/images/v7/arrival.webp",
  "connect": "/images/v7/connect.webp",
  "experience": "/images/v7/experience.webp",
  "paper": "/images/v8/paper.webp",
  "finish": "/images/v9/finish.webp",
  "holy": "/images/v7/holy.webp",
  "nordvpn": "/images/v9/nordvpn.webp",
  "prepmymeal": "/images/v9/prepmymeal.webp",
  "revolut": "/images/v9/revolut.webp",
  "temoa": "/images/v9/temoa.webp",
  "truenature": "/images/v9/truenature.webp",
  "aoste": "/images/v9/aoste.webp",
  "116media": "/images/v9/116media.webp"
};
export const assetUrl = (name:string) => images[name];

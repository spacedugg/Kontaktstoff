const images: Record<string,string> = {
  "hero": "/images/v10/hero.webp",
  "arrival": "/images/v10/arrival.webp",
  "connect": "/images/v10/connect.webp",
  "experience": "/images/v10/experience.webp",
  "paper": "/images/v8/paper.webp",
  "finish": "/images/v7/finish.webp",
  "holy": "/images/v10/holy.webp",
  "nordvpn": "/images/v10/nordvpn.webp",
  "prepmymeal": "/images/v10/prepmymeal.webp",
  "revolut": "/images/v10/revolut.webp",
  "temoa": "/images/v10/temoa.webp",
  "truenature": "/images/v11/truenature.webp",
  "aoste": "/images/v10/aoste.webp",
  "116media": "/images/v10/116media.webp"
};
export const assetUrl = (name:string) => images[name];

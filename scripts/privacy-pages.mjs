import {readFile,writeFile,readdir} from 'node:fs/promises';
export const privacyFooter='<nav class="kontaktstoff-privacy-links" aria-label="Datenschutz und Anbieter"><a href="/cookies.html">Cookies &amp; Browserspeicher</a><a href="/datenschutz.html">Datenschutz</a><a href="/impressum.html">Impressum</a><a href="/kontakt.html">Kontakt</a><span>Nur notwendiger Browserspeicher · keine Analyse- oder Werbe-Cookies</span></nav>';
export function privacyLinks(html){
 if(html.includes('class="kontaktstoff-privacy-links"'))return html;
 return html.replace('</head>','<link rel="stylesheet" href="/assets/privacy-links.css"></head>').replace('</body>',privacyFooter+'</body>');
}
export async function addPrivacyLinks(root){
 for(const entry of await readdir(root,{withFileTypes:true})){
  const file=root+'/'+entry.name;
  if(entry.isDirectory())await addPrivacyLinks(file);
  else if(entry.name.endsWith('.html')){const html=await readFile(file,'utf8');await writeFile(file,privacyLinks(html));}
 }
}

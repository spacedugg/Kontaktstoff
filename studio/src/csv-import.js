import {uid,validURL} from './core.js';
const normalize=s=>s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
const aliases={company:['firma','firmenname','unternehmen','company','company_name','organisation','organization','account_name'],first_name:['vorname','first_name','firstname','given_name'],salutation:['ansprache','anrede','salutation'],personal_note:['nachricht','personliche_nachricht','persoenliche_nachricht','personal_note','personlicher_anlass','notiz','message'],chatbot_url:['link','url','ziel_link','ziel_url','chatbot_url','chatbot_link','terminlink','qr_link','qr_url'],website:['website','webseite','homepage'],street:['strasse','strasse_hausnummer','strasse_und_hausnummer','street','address','adresse'],postal_code:['plz','postleitzahl','postal_code','zip','zip_code'],city:['ort','stadt','city'],country:['land','country']};
export function readCSVTable(input){
 input=input.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
 let quote=false,counts={';':0,',':0,'\t':0};for(let i=0;i<input.length;i++){const c=input[i];if(c==='"'){if(quote&&input[i+1]==='"'){i++;continue;}quote=!quote;}if(c==='\n'&&!quote)break;if(!quote&&c in counts)counts[c]++;}
 const delimiter=Object.keys(counts).sort((a,b)=>counts[b]-counts[a])[0];
 const rows=[];let row=[],value='',quoted=false,closed=false;
 for(let i=0;i<input.length;i++){const c=input[i];if(c==='"'){if(quoted&&input[i+1]==='"'){value+='"';i++;}else if(quoted){quoted=false;closed=true;}else if(!value.trim()&&!closed){value='';quoted=true;}else throw Error('Ein Anführungszeichen ist falsch gesetzt. Speichere die Datei erneut als CSV.');}
 else if(!quoted&&(c===delimiter||c==='\n')){row.push(value.trim());value='';closed=false;if(c==='\n'){if(row.some(Boolean))rows.push(row);row=[];}}
 else{if(closed&&c.trim())throw Error('Nach einem geschlossenen Textfeld fehlt ein Trennzeichen.');value+=c;}}
 if(quoted)throw Error('Ein Textfeld ist nicht geschlossen. Prüfe die Anführungszeichen in deiner CSV.');row.push(value.trim());if(row.some(Boolean))rows.push(row);
 if(rows.length<2)throw Error('Die CSV braucht eine Überschrift und mindestens eine Kontaktzeile.');
 const headers=rows.shift();if(headers.length>60)throw Error('Bitte maximal 60 Spalten hochladen.');if(rows.length>1000)throw Error('Bitte höchstens 1.000 Kontakte pro Import hochladen.');
 rows.forEach((r,i)=>{if(r.length!==headers.length)throw Error(`Zeile ${i+2} hat ${r.length} statt ${headers.length} Spalten. Prüfe die Trennzeichen.`);if(r.some(v=>v.length>5000))throw Error(`Zeile ${i+2} enthält ein zu langes Textfeld.`);});
 return {headers:headers.map((h,i)=>h||`Spalte ${i+1}`),rows,delimiter};
}
export function guessMapping(headers,keys){return Object.fromEntries(keys.map(key=>[key,headers.findIndex(h=>(aliases[key]||[key]).includes(normalize(h)))]));}
export function mappedRecipients(table,mapping,{fallbackURL='',salutationStyle='du'}={}){
 if(!Number.isInteger(mapping.company)||mapping.company<0||mapping.company>=table.headers.length)throw Error('Ordne zuerst die Spalte mit dem Firmennamen zu.');
 if(fallbackURL&&!validURL(fallbackURL))throw Error('Der gemeinsame Ziel-Link muss mit https:// oder http:// beginnen.');
 const recipients=table.rows.map((row,i)=>{
  const r={id:uid()};for(const [key,index] of Object.entries(mapping)){if(['id','__proto__','constructor','prototype'].includes(key))continue;if(Number.isInteger(index)&&index>=0&&index<row.length)r[key]=row[index];}
  if(!r.company?.trim())throw Error(`In Zeile ${i+2} fehlt der Firmenname. Ergänze ihn in deiner CSV.`);
  if(!r.salutation)r.salutation=salutationStyle==='formal'?'Guten Tag,':r.first_name?`Hallo ${r.first_name},`:'Hallo,';
  if(!r.chatbot_url&&fallbackURL)r.chatbot_url=fallbackURL;
  return r;
 });
 const missingLinks=recipients.filter(r=>!r.chatbot_url).length,invalidLinks=recipients.filter(r=>r.chatbot_url&&!validURL(r.chatbot_url)).length;
 return {recipients,missingLinks,invalidLinks};
}

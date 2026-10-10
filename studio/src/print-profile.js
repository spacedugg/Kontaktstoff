import {DEFAULT_PRINT_PROFILE_NAME,validateICC} from './print.js';

export const printProfileSettings=`<details class="print-profile-settings"><summary>Druckerei-Einstellungen (optional)</summary><p>Standard: ${DEFAULT_PRINT_PROFILE_NAME} · FOGRA39 · für gestrichenes Papier. Das Profil wird automatisch verwendet. Gibt deine Druckerei ein anderes Profil vor, kannst du es hier auswählen.</p><label>Anderes CMYK-Profil (.icc / .icm)<input type="file" accept=".icc,.icm" data-profile></label><button type="button" class="button" data-profile-reset hidden>Standard wiederherstellen</button><p><a href="/assets/print/profiles/LICENSE.txt" target="_blank" rel="noopener">Profil-Lizenz</a></p></details><p data-profile-info role="status"></p>`;

// Missing custom data means the bundled standard; invalid custom input blocks export.
export function bindPrintProfile(root,onChange){
 const input=root.querySelector('[data-profile]'),reset=root.querySelector('[data-profile-reset]'),info=root.querySelector('[data-profile-info]');
 const state={profile:undefined,ready:true};let generation=0;
 const useDefault=()=>{generation++;input.value='';state.profile=undefined;state.ready=true;reset.hidden=true;info.textContent='';onChange();};
 reset.onclick=useDefault;
 input.onchange=async()=>{
  const file=input.files[0];if(!file)return useDefault();
  const g=++generation;state.profile=undefined;state.ready=false;reset.hidden=false;info.textContent='Farbprofil wird geprüft …';onChange();
  try{
   if(file.size>10*1024*1024)throw Error('Das Farbprofil darf höchstens 10 MB groß sein.');
   const bytes=validateICC(new Uint8Array(await file.arrayBuffer()));
   if(g!==generation)return;
   state.profile=bytes;state.ready=true;info.textContent='Eigenes Druckprofil: '+file.name;
  }catch(e){if(g!==generation)return;info.textContent=e.message+' Du kannst auch den Standard wiederherstellen.';}
  onChange();
 };
 return state;
}

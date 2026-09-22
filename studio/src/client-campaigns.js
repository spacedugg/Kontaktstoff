import {createMoneyMakingCampaign} from './money-making-campaign.js';
import {createCartCampaign} from './cart-campaigns.js';
import {createBewertungspush} from './bewertungspush.js';
export const CLIENT_CAMPAIGNS=[{id:'reha-sleep',name:'RehaSleep',source:'https://reha-sleep.de/',target:'https://reha-sleep.de/products/lattenrost-elektrisch-verstellbar',description:'Persönliche Warenkorb-Erinnerung für mehr Komfort zu Hause.'},{id:'zyvo',name:'ZYVO',source:'https://zyvo.de/en',target:'https://zyvo.de/en/products/one',description:'Warenkorb-Rückgewinnung mit der persönlichen Produktauswahl.'},{id:'bewertungspush',name:'BewertungsPush',source:'https://bewertungspush.de/',target:'https://bewertungspush.de/suche',description:'Persönliche Profilprüfungs-Einladung für lokale Betriebe.'},{id:'money-making-sprint',name:'Money Making Sprint',source:'https://www.money-making-sprint.de/',target:'https://www.money-making-sprint.de/termin',description:'Persönliche Einladung zum Strategiegespräch für Agenturinhaber.'}];
export function createClientCampaign(id){
 if(['reha-sleep','zyvo'].includes(id))return createCartCampaign(id);
 if(id==='bewertungspush')return createBewertungspush();
 const client=CLIENT_CAMPAIGNS.find(c=>c.id===id);if(!client)throw new Error('Unbekanntes Kundenkonzept.');
 return createMoneyMakingCampaign();
}

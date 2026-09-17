// A planning scenario only. Rates are explicit user assumptions, never reported campaign results.
export function mailingScenario(cards,scanRate,requestRate){
 const values=[cards,scanRate,requestRate].map(Number);
 if(values.some(v=>!Number.isFinite(v))||values[0]<0||values[1]<0||values[1]>100||values[2]<0||values[2]>100)throw new RangeError('Ungültige Annahmen.');
 const [sent,scan,request]=values,visitors=sent*scan/100,leads=visitors*request/100;
 return {sent,visitors,leads,conversion:scan*request/100};
}
export function mountImpactCalculator(root=document){
 const inputs=['mailings','scan','conversion'].map(id=>root.querySelector('#impact-'+id));
 if(inputs.some(input=>!input))return;
 const number=new Intl.NumberFormat('de-DE',{maximumFractionDigits:0});
 const percent=new Intl.NumberFormat('de-DE',{maximumFractionDigits:2});
 const put=(id,value)=>root.querySelector('#impact-'+id).textContent=value;
 function update(){
  const [cards,scan,conversion]=inputs.map(i=>Number(i.value)),result=mailingScenario(cards,scan,conversion);
  put('mailings-value',number.format(cards));put('scan-value',percent.format(scan)+' %');put('conversion-value',percent.format(conversion)+' %');
  put('sent',number.format(result.sent));put('visitors',number.format(result.visitors));put('leads',number.format(result.leads));put('total',percent.format(result.conversion)+' %');
 }
 inputs.forEach(input=>input.addEventListener('input',update));update();
}

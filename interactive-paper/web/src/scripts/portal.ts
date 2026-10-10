document.querySelectorAll<HTMLElement>('[data-portal]').forEach(portal => {
 const tabs=Array.from(portal.querySelectorAll<HTMLButtonElement>('[data-portal-tab]'));
 const select=(key:string,focus=false)=>{
  tabs.forEach(tab=>{const active=tab.dataset.portalTab===key;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;if(active&&focus)tab.focus();});
  portal.querySelectorAll<HTMLElement>('[data-portal-panel]').forEach(panel=>{panel.hidden=panel.dataset.portalPanel!==key;});
 };
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(tab.dataset.portalTab!));tab.addEventListener('keydown',event=>{let next=i;if(['ArrowDown','ArrowRight'].includes(event.key))next=(i+1)%tabs.length;else if(['ArrowUp','ArrowLeft'].includes(event.key))next=(i-1+tabs.length)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();select(tabs[next].dataset.portalTab!,true);});});
 portal.querySelectorAll<HTMLButtonElement>('[data-portal-goto]').forEach(button=>button.addEventListener('click',()=>select(button.dataset.portalGoto!,true)));
 portal.querySelectorAll<HTMLButtonElement>('[data-portal-design]').forEach(button=>button.addEventListener('click',()=>{const image=portal.querySelector<HTMLImageElement>('[data-portal-artwork]')!;image.src='/images/v6/'+button.dataset.portalDesign+'.webp';image.alt='Freie Kampagnenidee: '+button.textContent;portal.querySelectorAll('[data-portal-design]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));}));
});

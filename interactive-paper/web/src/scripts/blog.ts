const search=document.querySelector<HTMLInputElement>('[data-blog-search]');
const categoryButtons=Array.from(document.querySelectorAll<HTMLButtonElement>('[data-blog-category]'));
const cards=Array.from(document.querySelectorAll<HTMLElement>('[data-blog-card]'));
let category='Alle';
function filterArticles(){const query=(search?.value||'').trim().toLocaleLowerCase('de');let total=0;cards.forEach(card=>{const match=(category==='Alle'||card.dataset.category===category)&&(card.dataset.search||'').includes(query);card.hidden=!match;if(match)total++;});const count=document.querySelector('[data-blog-count]');if(count)count.textContent=total+' Artikel';const empty=document.querySelector<HTMLElement>('[data-blog-empty]');if(empty)empty.hidden=total!==0;}
search?.addEventListener('input',filterArticles);
categoryButtons.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.blogCategory!;categoryButtons.forEach(other=>other.setAttribute('aria-pressed',String(other===button)));filterArticles();}));

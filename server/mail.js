// Credentials stay server-side. Never include contact lists or designs in email.
export function createMailer({key=process.env.RESEND_API_KEY,from=process.env.MAIL_FROM,fetcher=fetch}={}) {
 return {
  configured:Boolean(key&&from),
  async send({to,subject,text,id}) {
   if(!key||!from)throw new Error('E-Mail-Versand ist noch nicht eingerichtet.');
   const response=await fetcher('https://api.resend.com/emails',{
    method:'POST',signal:AbortSignal.timeout(10000),
    headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':id},
    body:JSON.stringify({from,to:[to],subject,text})
   });
   if(!response.ok)throw new Error('Der E-Mail-Dienst ist gerade nicht erreichbar.');
  }
 };
}

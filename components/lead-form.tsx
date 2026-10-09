'use client';
import { useState, type FormEvent } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
export function LeadForm({tenantId,propertyId}:{tenantId:string;propertyId?:string}) {
  const [busy,setBusy]=useState(false);
  const [state,setState]=useState<'idle'|'done'|'error'>('idle');
  async function send(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();setBusy(true);setState('idle');
    const form=e.currentTarget;const d=new FormData(form);
    try {
      const response=await fetch('/api/public/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        tenant_id:tenantId,property_id:propertyId,name:d.get('name'),phone:d.get('phone'),email:d.get('email'),message:d.get('message'),website:d.get('website')
      })});
      if(!response.ok)throw Error('Falha');
      form.reset();setState('done');
    } catch {setState('error')} finally{setBusy(false)}
  }
  return <form onSubmit={send} className="lead-form">
    <h2>Vamos conversar?</h2><p>Envie seu interesse. A imobiliária recebe o contato diretamente no CRM.</p>
    <div className="admin-form-grid"><label>Nome completo<input required name="name" maxLength={120} minLength={2}/></label>
    <label>WhatsApp / telefone<input required name="phone" maxLength={30} minLength={8} inputMode="tel"/></label>
    <label>E-mail<input name="email" type="email" maxLength={200}/></label>
    <label className="full">Mensagem<textarea name="message" rows={3} maxLength={2000} placeholder="Conte o que procura..."/></label></div>
    <label className="honeypot" aria-hidden="true">Não preencher<input name="website" tabIndex={-1} autoComplete="off"/></label>
    <button type="submit" disabled={busy} className="admin-primary"><Send size={16}/>{busy?'Enviando...':'Enviar interesse'}</button>
    {state==='done'&&<p className="form-success" role="status"><CheckCircle2 size={18}/> Interesse recebido. Em breve a equipe poderá entrar em contato.</p>}
    {state==='error'&&<p className="admin-alert" role="alert">Não foi possível enviar. Tente novamente.</p>}
  </form>;
}

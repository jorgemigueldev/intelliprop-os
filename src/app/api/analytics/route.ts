import { NextResponse } from 'next/server';
export async function GET(){
  return NextResponse.json({kpis:{conversion:'3.8%',costPerLead:'R$ 18',avgCycle:'42 dias',vgv:'R$ 5.8M',hotLeads:6,totalLeads:8},bySource:[{source:'Instagram',leads:142,closed:5,vgv:'R$ 1.8M'},{source:'WhatsApp',leads:98,closed:4,vgv:'R$ 1.2M'},{source:'Indicação',leads:34,closed:5,vgv:'R$ 2.1M'}]});
}

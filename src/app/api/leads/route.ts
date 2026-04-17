import { NextRequest, NextResponse } from 'next/server';
let store:any[]=[];
export async function GET(){return NextResponse.json({leads:store,total:store.length});}
export async function POST(req:NextRequest){
  try{
    const data=await req.json();
    if(data.action==='delete'&&data.id){store=store.filter(l=>l.id!==data.id);return NextResponse.json({success:true,action:'deleted'});}
    if(data.action==='update'&&data.id){store=store.map(l=>l.id===data.id?{...l,...data.lead}:l);return NextResponse.json({success:true,action:'updated'});}
    const lead={...data,id:data.id||Date.now(),createdAt:new Date().toISOString()};
    store.unshift(lead);return NextResponse.json({success:true,lead,action:'created'});
  }catch(e){return NextResponse.json({error:String(e)},{status:500});}
}

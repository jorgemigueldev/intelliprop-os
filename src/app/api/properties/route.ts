import { NextRequest, NextResponse } from 'next/server';
let store:any[]=[];
export async function GET(){return NextResponse.json({properties:store,total:store.length});}
export async function POST(req:NextRequest){
  try{
    const data=await req.json();
    if(data.action==='delete'&&data.id){store=store.filter(p=>p.id!==data.id);return NextResponse.json({success:true,action:'deleted'});}
    if(data.action==='update'&&data.id){store=store.map(p=>p.id===data.id?{...p,...data.property}:p);return NextResponse.json({success:true,action:'updated'});}
    const prop={...data,id:data.id||Date.now(),createdAt:new Date().toISOString()};
    store.unshift(prop);return NextResponse.json({success:true,property:prop,action:'created'});
  }catch(e){return NextResponse.json({error:String(e)},{status:500});}
}

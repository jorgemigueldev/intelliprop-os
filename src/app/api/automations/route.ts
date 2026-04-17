import { NextRequest, NextResponse } from 'next/server';
const autos=[{id:1,name:'Boas-vindas',active:true},{id:2,name:'Follow-up Dia 3',active:true},{id:3,name:'Follow-up Dia 7',active:true},{id:4,name:'Follow-up Dia 30',active:true},{id:5,name:'Alerta Hot Lead',active:true},{id:6,name:'Script Objeção',active:true}];
export async function GET(){return NextResponse.json({automations:autos});}
export async function POST(req:NextRequest){try{const{id,active}=await req.json();const a=autos.find(x=>x.id===id);if(a)a.active=active;return NextResponse.json({success:true,id,active});}catch(e){return NextResponse.json({error:String(e)},{status:500});}}

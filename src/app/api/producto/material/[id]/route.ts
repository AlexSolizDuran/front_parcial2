import { proxyById } from "@/lib/proxyById";
import { NextRequest } from "next/server";

async function handler (req:NextRequest,ctx:{params:Promise<{id:string}>}){
    return proxyById(req,ctx,"producto/material")
}
export const GET = handler;
export const PUT = handler;
export const DELETE = handler;

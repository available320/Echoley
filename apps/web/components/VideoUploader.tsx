"use client";
import {useState} from "react";
import {createSupabaseBrowserClient} from "@/lib/supabase/client";

export default function VideoUploader({projectId}:{projectId:string}){
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [kind,setKind]=useState<"success"|"warning"|"error">("success");
  async function upload(file?:File){
    if(!file)return;
    setBusy(true);setMessage("");
    const sb=createSupabaseBrowserClient();
    let storagePath:string|undefined;
    try{
      if(!file.type.startsWith("video/"))throw new Error("Choose a recognised video file.");
      const max=Number(process.env.NEXT_PUBLIC_MAX_VIDEO_BYTES??10737418240);
      if(!Number.isFinite(max)||max<1)throw new Error("The upload size limit is not configured correctly.");
      if(file.size<1)throw new Error("This video file is empty.");
      if(file.size>max)throw new Error("This video exceeds the configured upload limit.");
      const {data:{user}}=await sb.auth.getUser();
      if(!user)throw new Error("Your session expired. Sign in again.");
      const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"_").slice(-160)||"video-upload";
      storagePath=user.id+"/"+projectId+"/"+crypto.randomUUID()+"_"+safe;
      const {error:up}=await sb.storage.from("echoley-sources").upload(storagePath,file,{contentType:file.type,upsert:false});
      if(up)throw up;
      const {data:source,error}=await sb.from("source_media").insert({owner_id:user.id,project_id:projectId,source_type:"upload",storage_path:storagePath,original_filename:file.name.slice(0,255),mime_type:file.type,file_size_bytes:file.size,status:"uploaded"}).select("id").single();
      if(error){
        await sb.storage.from("echoley-sources").remove([storagePath]);
        storagePath=undefined;
        throw error;
      }
      const {data:{session}}=await sb.auth.getSession();
      if(!session)throw new Error("Video uploaded, but your session expired before processing could be queued. Sign in and retry from this project.");
      const base=process.env.NEXT_PUBLIC_SUPABASE_URL;
      if(!base)throw new Error("Video uploaded, but Supabase API configuration is missing. Contact support before retrying.");
      const response=await fetch(base+"/functions/v1/echoley-api/sources/"+source.id+"/jobs",{method:"POST",headers:{Authorization:"Bearer "+session.access_token,apikey:process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??"","Content-Type":"application/json"},body:JSON.stringify({job_type:"analyze",idempotency_key:"upload-analysis:"+source.id})});
      const result=await response.json().catch(()=>({}));
      if(!response.ok){
        setKind("warning");
        setMessage("Your video is uploaded and saved, but analysis was not queued: "+(result.error??"processing service unavailable")+". You can retry after processing is enabled.");
        return;
      }
      setKind("success");
      setMessage("Video uploaded successfully. "+(result.message??"Analysis request recorded."));
    }catch(e){
      setKind("error");
      setMessage(e instanceof Error?e.message:"Upload failed.");
    }finally{setBusy(false);}
  }
  return <div style={{marginTop:14}}>
    <label style={{display:"inline-flex",gap:8,alignItems:"center",padding:"10px 14px",borderRadius:10,background:"#25213d",cursor:busy?"wait":"pointer",opacity:busy?.6:1}}>
      {busy?"Uploading…":"Upload video"}
      <input type="file" accept="video/mp4,video/quicktime,video/webm,video/x-m4v" disabled={busy} style={{display:"none"}} onChange={e=>{void upload(e.target.files?.[0]);e.currentTarget.value="";}}/>
    </label>
    {message&&<p className="muted" role="status" aria-live="polite" style={{color:kind==="error"?"#ff9b9b":kind==="warning"?"#ffd27a":undefined}}>{message}</p>}
  </div>;
}

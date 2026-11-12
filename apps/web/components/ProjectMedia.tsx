"use client";
import {useCallback,useEffect,useState} from "react";
import {createSupabaseBrowserClient} from "@/lib/supabase/client";

type Source={id:string;original_filename:string|null;status:string;created_at:string};
type Clip={id:string;source_media_id:string;title:string|null;start_seconds:number;end_seconds:number;aspect_ratio:string;status:string;viral_score:number|null;render_path:string|null};

export default function ProjectMedia({projectId}:{projectId:string}){
  const [sources,setSources]=useState<Source[]>([]);
  const [clips,setClips]=useState<Clip[]>([]);
  const [busy,setBusy]=useState<string|null>(null);
  const [links,setLinks]=useState<Record<string,string>>({});
  const [message,setMessage]=useState("");
  const refresh=useCallback(async()=>{
    const sb=createSupabaseBrowserClient();
    const [{data:s,error:se},{data:c,error:ce}]=await Promise.all([
      sb.from("source_media").select("id,original_filename,status,created_at").eq("project_id",projectId).order("created_at",{ascending:false}),
      sb.from("clips").select("id,source_media_id,title,start_seconds,end_seconds,aspect_ratio,status,viral_score,render_path").eq("project_id",projectId).order("created_at",{ascending:false})
    ]);
    if(se)throw se;if(ce)throw ce;setSources(s??[]);setClips(c??[]);
  },[projectId]);
  useEffect(()=>{let active=true;const load=()=>{if(active)void refresh().catch(e=>setMessage(e instanceof Error?e.message:"Could not refresh media."));};load();const timer=setInterval(load,10000);return()=>{active=false;clearInterval(timer);};},[refresh]);
  async function queueRender(clip:Clip){
    setBusy(clip.id);setMessage("");
    try{
      const sb=createSupabaseBrowserClient();const {data:{session}}=await sb.auth.getSession();if(!session)throw Error("Your session expired. Sign in again.");
      const base=process.env.NEXT_PUBLIC_SUPABASE_URL;if(!base)throw Error("Supabase is not configured.");
      const response=await fetch(base+"/functions/v1/echoley-api/sources/"+clip.source_media_id+"/jobs",{method:"POST",headers:{Authorization:"Bearer "+session.access_token,apikey:process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??"","Content-Type":"application/json"},body:JSON.stringify({job_type:"render",clip_id:clip.id,idempotency_key:"web-render:"+clip.id+":"+crypto.randomUUID()})});
      const payload=await response.json();if(!response.ok)throw Error(payload.error??"Could not queue rendering.");
      setMessage(payload.message??"Render job queued.");await refresh();
    }catch(e){setMessage(e instanceof Error?e.message:"Could not queue rendering.");}finally{setBusy(null);}
  }
  async function prepareDownload(clip:Clip){
    if(!clip.render_path)return;
    try{const sb=createSupabaseBrowserClient();const {data,error}=await sb.storage.from("echoley-renders").createSignedUrl(clip.render_path,3600);if(error||!data?.signedUrl)throw error??Error("Could not create private download link.");setLinks(v=>({...v,[clip.id]:data.signedUrl}));}
    catch(e){setMessage(e instanceof Error?e.message:"Could not prepare download.");}
  }
  return <section style={{marginTop:20,borderTop:"1px solid var(--line)",paddingTop:16}}>
    <div className="eyebrow">Media &amp; clip review</div>
    {message&&<p className="muted" role="status">{message}</p>}
    <h4 style={{margin:"14px 0 8px"}}>Uploaded videos</h4>
    {sources.length===0?<p className="muted">Uploaded videos and processing status appear here.</p>:<div style={{display:"grid",gap:8}}>{sources.map(source=><div key={source.id} style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap",fontSize:13}}><span>{source.original_filename??"Uploaded video"}</span><span className="tag">{source.status}</span></div>)}</div>}
    <h4 style={{margin:"18px 0 8px"}}>Suggested clips ({clips.length})</h4>
    {clips.length===0?<p className="muted">AI-generated moments will appear here after the worker processes an uploaded video.</p>:<div style={{display:"grid",gap:10}}>{clips.map(clip=><article key={clip.id} className="panel" style={{padding:14}}>
      <div className="project"><h3>{clip.title??"Untitled highlight"}</h3><span className="tag">{clip.status}</span></div>
      <p className="muted">{Math.floor(Number(clip.start_seconds))}s–{Math.floor(Number(clip.end_seconds))}s · {clip.aspect_ratio} · Score {clip.viral_score??"—"}</p>
      {clip.status==="ready"&&clip.render_path?<><button type="button" className="button secondary" onClick={()=>void prepareDownload(clip)}>Prepare private download</button>{links[clip.id]&&<p><a href={links[clip.id]} target="_blank" rel="noreferrer">Open rendered MP4 (link expires in one hour)</a></p>}</>:<button type="button" className="button secondary" disabled={busy===clip.id||clip.status==="rendering"} onClick={()=>void queueRender(clip)}>{busy===clip.id?"Queueing…":clip.status==="rendering"?"Rendering…":"Render this clip"}</button>}
    </article>)}</div>}
  </section>;
}

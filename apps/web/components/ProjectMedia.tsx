"use client";
import {useCallback,useEffect,useState} from "react";
import {createSupabaseBrowserClient} from "@/lib/supabase/client";

type Source={id:string;original_filename:string|null;source_url:string|null;status:string;created_at:string};
type Clip={id:string;source_media_id:string;title:string|null;start_seconds:number;end_seconds:number;aspect_ratio:string;status:string;viral_score:number|null;render_path:string|null};
type Edit={title:string;start:string;end:string;ratio:string};

export default function ProjectMedia({projectId}:{projectId:string}){
  const [sources,setSources]=useState<Source[]>([]);
  const [clips,setClips]=useState<Clip[]>([]);
  const [busy,setBusy]=useState<string|null>(null);
  const [links,setLinks]=useState<Record<string,string>>({});
  const [edits,setEdits]=useState<Record<string,Edit>>({});
  const [message,setMessage]=useState("");
  const refresh=useCallback(async()=>{
    const sb=createSupabaseBrowserClient();
    const [{data:s,error:se},{data:c,error:ce}]=await Promise.all([
      sb.from("source_media").select("id,original_filename,source_url,status,created_at").eq("project_id",projectId).order("created_at",{ascending:false}),
      sb.from("clips").select("id,source_media_id,title,start_seconds,end_seconds,aspect_ratio,status,viral_score,render_path").eq("project_id",projectId).order("created_at",{ascending:false})
    ]);
    if(se)throw se;if(ce)throw ce;setSources(s??[]);setClips(c??[]);
    setEdits(current=>{const next={...current};for(const clip of c??[]){if(!next[clip.id])next[clip.id]={title:clip.title??"",start:String(clip.start_seconds),end:String(clip.end_seconds),ratio:clip.aspect_ratio??"9:16"};}return next;});
  },[projectId]);
  useEffect(()=>{let active=true;const load=()=>{if(active)void refresh().catch(e=>setMessage(e instanceof Error?e.message:"Could not refresh media."));};load();const timer=setInterval(load,10000);return()=>{active=false;clearInterval(timer);};},[refresh]);
  function changeEdit(id:string,key:keyof Edit,value:string){setEdits(current=>({...current,[id]:{...current[id],[key]:value}}));}
  async function saveClip(clip:Clip){
    const edit=edits[clip.id];if(!edit)return;
    const start=Number(edit.start),end=Number(edit.end);
    if(!Number.isFinite(start)||!Number.isFinite(end)||start<0||end<=start){setMessage("Enter valid clip start and end times. End must be after start.");return;}
    setBusy(clip.id);setMessage("");
    try{
      const sb=createSupabaseBrowserClient();const {data:{user}}=await sb.auth.getUser();if(!user)throw Error("Your session expired. Sign in again.");
      const {error}=await sb.from("clips").update({title:edit.title.trim().slice(0,160)||"Untitled clip",start_seconds:start,end_seconds:end,aspect_ratio:edit.ratio,status:"draft",render_path:null}).eq("id",clip.id).eq("owner_id",user.id);
      if(error)throw error;
      setMessage("Clip edits saved. Render it when you're ready.");await refresh();
    }catch(e){setMessage(e instanceof Error?e.message:"Could not save clip edits.");}finally{setBusy(null);}
  }
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
    {message&&<p className="muted" role="status" aria-live="polite">{message}</p>}
    <h4 style={{margin:"14px 0 8px"}}>Video sources</h4>
    {sources.length===0?<p className="muted">Uploaded videos and registered video links appear here.</p>:<div style={{display:"grid",gap:8}}>{sources.map(source=><div key={source.id} style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap",fontSize:13}}><span style={{minWidth:0,overflowWrap:"anywhere"}}>{source.original_filename??source.source_url??"Video source"}{source.source_url&&<><br/><a href={source.source_url} target="_blank" rel="noreferrer" style={{color:"var(--mint)"}}>Open original link ↗</a></>}</span><span className="tag">{source.status}</span></div>)}</div>}
    <h4 style={{margin:"18px 0 8px"}}>Suggested clips ({clips.length})</h4>
    {clips.length===0?<p className="muted">AI-generated moments appear here after the video worker processes an uploaded video.</p>:<div style={{display:"grid",gap:10}}>{clips.map(clip=>{const edit=edits[clip.id]??{title:clip.title??"",start:String(clip.start_seconds),end:String(clip.end_seconds),ratio:clip.aspect_ratio??"9:16"};return <article key={clip.id} className="panel" style={{padding:14}}>
      <div className="project"><h3>{clip.title??"Untitled highlight"}</h3><span className="tag">{clip.status}</span></div>
      <p className="muted">Score {clip.viral_score??"—"} · Edit the clip range and format before rendering.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(125px,1fr))",gap:9,margin:"12px 0"}}>
        <label style={{display:"grid",gap:5,fontSize:12,color:"var(--muted)"}}>Clip title<input className="text-input" value={edit.title} maxLength={160} onChange={e=>changeEdit(clip.id,"title",e.target.value)}/></label>
        <label style={{display:"grid",gap:5,fontSize:12,color:"var(--muted)"}}>Start (seconds)<input className="text-input" type="number" min="0" step="0.1" value={edit.start} onChange={e=>changeEdit(clip.id,"start",e.target.value)}/></label>
        <label style={{display:"grid",gap:5,fontSize:12,color:"var(--muted)"}}>End (seconds)<input className="text-input" type="number" min="0.1" step="0.1" value={edit.end} onChange={e=>changeEdit(clip.id,"end",e.target.value)}/></label>
        <label style={{display:"grid",gap:5,fontSize:12,color:"var(--muted)"}}>Aspect ratio<select className="text-input" value={edit.ratio} onChange={e=>changeEdit(clip.id,"ratio",e.target.value)}><option value="9:16">Vertical 9:16</option><option value="1:1">Square 1:1</option><option value="4:5">Portrait 4:5</option><option value="16:9">Landscape 16:9</option></select></label>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <button type="button" className="button secondary" disabled={busy===clip.id||clip.status==="rendering"} onClick={()=>void saveClip(clip)}>{busy===clip.id?"Saving…":"Save edits"}</button>
        {clip.status==="ready"&&clip.render_path?<button type="button" className="button secondary" onClick={()=>void prepareDownload(clip)}>Prepare private download</button>:<button type="button" className="button" disabled={busy===clip.id||clip.status==="rendering"} onClick={()=>void queueRender(clip)}>{busy===clip.id?"Working…":clip.status==="rendering"?"Rendering…":"Render clip"}</button>}
      </div>
      {links[clip.id]&&<p><a href={links[clip.id]} target="_blank" rel="noreferrer">Open rendered MP4 (link expires in one hour)</a></p>}
    </article>;})}</div>}
  </section>;
}

const { useState, useEffect, useRef } = React;



const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];
const STORAGE_KEY = "income_tracker_v1";

const emptyYear = () => ({
  necessary: MONTHS.map((m,i) => ({ id:i, month:m, transactions:[] })),
  extra:     MONTHS.map((m,i) => ({ id:i, month:m, transactions:[] })),
});

// transaction: { id, date, inVal, outVal, note }
const newTx = () => ({
  id: Date.now() + Math.random(),
  date: new Date().toISOString().slice(0,10),
  inVal: "",
  outVal: "",
  note: "",
});

function loadData() {
  try {
    const d = localStorage.getItem(STORAGE_KEY);
    if (d) return JSON.parse(d);
  } catch {}
  const y = new Date().getFullYear();
  return { years:{ [y]: emptyYear() }, activeYear:y };
}
function saveData(d) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} }

const n   = (v) => (v===""||v===null ? 0 : parseFloat(v)||0);
const fmt = (v) => v===0 ? "0" : Number(v).toLocaleString("en-IN");
const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  return `${dt.getDate()} ${MONTHS[dt.getMonth()].slice(0,3)}`;
};

function usePress(activeStyle, baseStyle) {
  const [pressed, setPressed] = useState(false);
  const handlers = {
    onMouseEnter:()=>setPressed(true), onMouseLeave:()=>setPressed(false),
    onMouseDown:()=>setPressed(true),  onMouseUp:()=>setPressed(false),
    onTouchStart:()=>setPressed(true), onTouchEnd:()=>setPressed(false),
    onTouchCancel:()=>setPressed(false),
  };
  return [pressed?{...baseStyle,...activeStyle}:baseStyle, handlers];
}

function PressBtn({ onClick, style, children }) {
  const [p,h] = usePress({transform:"scale(.96)",opacity:.85},{...style,transition:"transform .1s,opacity .1s"});
  return <button onClick={onClick} style={p} {...h}>{children}</button>;
}

function TabBtn({ t, active, onClick }) {
  const [p,h] = usePress({transform:"scale(.96)",opacity:.85},{
    flex:1,padding:"10px 0",borderRadius:14,border:"none",cursor:"pointer",
    fontWeight:700,fontSize:11,fontFamily:"'Outfit',sans-serif",letterSpacing:.3,
    background:active?"linear-gradient(135deg,#1d4ed8,#2563eb)":"rgba(255,255,255,0.04)",
    color:active?"#fff":"var(--text3)",
    boxShadow:active?"0 4px 16px rgba(37,99,235,0.4)":"none",
    outline:active?"1px solid rgba(59,130,246,0.4)":"1px solid rgba(255,255,255,0.05)",
    transition:"transform .1s,opacity .1s",
  });
  return <button onClick={onClick} style={p} {...h}>{t.label}</button>;
}

function SummaryCard({ c }) {
  const [p,h] = usePress(
    {transform:"translateY(-3px) scale(1.02)",boxShadow:`0 10px 32px ${c.glow}`},
    {background:`linear-gradient(135deg,${c.glow},rgba(255,255,255,0.03))`,
     border:`1px solid ${c.border}`,borderRadius:16,padding:"12px 8px",textAlign:"center",
     boxShadow:`0 4px 20px ${c.glow}`,transition:"transform .15s,box-shadow .15s",cursor:"default"}
  );
  return (
    <div style={p} {...h}>
      <div style={{fontSize:8,color:"var(--text3)",marginBottom:5,letterSpacing:1,textTransform:"uppercase",fontWeight:700}}>{c.label}</div>
      <div style={{fontSize:13,fontWeight:800,color:c.color,fontFamily:"'JetBrains Mono',monospace"}}>{fmt(c.value)}</div>
    </div>
  );
}

function RowCard({ has, idx, children }) {
  const [pressed,setPressed] = useState(false);
  const timerRef = useRef(null);
  const press = ()=>setPressed(true);
  const release = ()=>{ if(timerRef.current) clearTimeout(timerRef.current); timerRef.current=setTimeout(()=>setPressed(false),80); };
  const base = {
    background:has?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.015)",
    border:`1px solid ${has?"rgba(255,255,255,0.09)":"rgba(255,255,255,0.03)"}`,
    borderRadius:14,marginBottom:7,overflow:"hidden",
    animationDelay:`${idx*0.03}s`,transition:"background .15s,border .15s,transform .15s",
  };
  const active = {background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.09)",transform:"translateX(3px)"};
  return (
    <div style={pressed?{...base,...active}:base}
      onMouseEnter={press} onMouseLeave={release} onMouseDown={press} onMouseUp={release}
      onTouchStart={press} onTouchEnd={release} onTouchCancel={release}
    >{children}</div>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg0:#060d18;--border:rgba(255,255,255,0.07);--border2:rgba(255,255,255,0.13);
    --green:#22d37a;--green2:#4ade80;--red:#f05a7a;--red2:#f87171;
    --blue:#3b82f6;--blue2:#60a5fa;--gold:#f59e0b;--gold2:#fbbf24;
    --teal:#06b6d4;--purple:#a78bfa;--text1:#e8f1ff;--text2:#94a3b8;--text3:#4a6080;
  }
  html,body{height:100%;background:var(--bg0);font-family:'Outfit',sans-serif;color:var(--text1);-webkit-font-smoothing:antialiased}
  ::-webkit-scrollbar{width:3px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:99px}
  @keyframes fadeSlideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes floatDot{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
  @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(20px) scale(.9)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}
  @keyframes slideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
  .fade-up{animation:fadeSlideUp .35s ease both}
  .fade-up-1{animation:fadeSlideUp .35s .05s ease both}
  .fade-up-2{animation:fadeSlideUp .35s .1s ease both}
  .dot1{animation:floatDot 1.4s 0s ease-in-out infinite}
  .dot2{animation:floatDot 1.4s .2s ease-in-out infinite}
  .dot3{animation:floatDot 1.4s .4s ease-in-out infinite}
  .modal-box{animation:fadeSlideUp .25s ease both}
  .slide-up{animation:slideUp .3s cubic-bezier(.4,0,.2,1) both}
  .year-item{transition:background .15s,border-color .15s}
  .action-btn{transition:background .18s,transform .15s}
  @media(min-width:768px){.app-shell{max-width:560px!important}.summary-grid{gap:12px!important}}
`;

function App() {
  const [data,         setData]          = useState(loadData);
  const [tab,          setTab]           = useState("chart");
  const [toast,        setToast]         = useState(null);
  const [sidebarOpen,  setSidebarOpen]   = useState(false);
  const [yearModal,    setYearModal]     = useState(false);
  const [newYear,      setNewYear]       = useState("");
  const [yearExistsWarn,setYearExistsWarn]=useState(false);
  const [deleteModal,  setDeleteModal]   = useState(false);
  const [selectedYears,setSelectedYears] = useState([]);
  const [multiSelectMode,setMultiSelectMode]=useState(false);
  const [clearModal,   setClearModal]    = useState(false);
  const [holdingVis,   setHoldingVis]    = useState(false);
  const [holdingYear,  setHoldingYear]   = useState(null);
  const [mounted,      setMounted]       = useState(false);

  // Input panel state
  const [inputPanel,   setInputPanel]    = useState(null); // {table, rowId}
  const [inputTx,      setInputTx]       = useState(null); // current transaction being edited

  // History panel state
  const [historyPanel, setHistoryPanel]  = useState(null); // {table, rowId}
  const [editingTxId,  setEditingTxId]   = useState(null);

  const holdingRef     = useRef(null);
  const holdingTimer   = useRef(null);
  const sidebarRef     = useRef(null);
  const toastTimer     = useRef(null);
  const longPressTimer = useRef(null);
  const warnTimer      = useRef(null);

  useEffect(()=>{ setMounted(true); },[]);

  const { years, activeYear } = data;
  const yd = years[activeYear] || emptyYear();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = MONTHS[now.getMonth()];

  useEffect(()=>saveData(data),[data]);

  useEffect(()=>{
    if(!years[currentYear]){
      setData(p=>({...p,years:{...p.years,[currentYear]:emptyYear()}}));
    }
  },[currentYear]);

  useEffect(()=>{
    if(!holdingVis) return;
    const h=(e)=>{ if(holdingRef.current&&!holdingRef.current.contains(e.target)) setHoldingVis(false); };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[holdingVis]);

  useEffect(()=>{
    if(!sidebarOpen) return;
    const h=(e)=>{ if(sidebarRef.current&&!sidebarRef.current.contains(e.target)) setSidebarOpen(false); };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[sidebarOpen]);

  const showToast=(msg,type="success")=>{
    if(toastTimer.current) clearTimeout(toastTimer.current);
    setToast({msg,type});
    toastTimer.current=setTimeout(()=>setToast(null),2400);
  };

  const patch=(fn)=>setData(p=>({...p,years:{...p.years,[p.activeYear]:{...yd,...fn(yd)}}}));

  // Transaction helpers
  const getTxList=(table,rowId)=>{
    const row = yd[table].find(r=>r.id===rowId);
    return row?.transactions||[];
  };

  const addTransaction=(table,rowId,tx)=>{
    patch(y=>({
      [table]: y[table].map(r=>r.id===rowId
        ? {...r, transactions:[...(r.transactions||[]), tx]}
        : r)
    }));
  };

  const updateTransaction=(table,rowId,txId,changes)=>{
    patch(y=>({
      [table]: y[table].map(r=>r.id===rowId
        ? {...r, transactions:(r.transactions||[]).map(t=>t.id===txId?{...t,...changes}:t)}
        : r)
    }));
  };

  const deleteTransaction=(table,rowId,txId)=>{
    patch(y=>({
      [table]: y[table].map(r=>r.id===rowId
        ? {...r, transactions:(r.transactions||[]).filter(t=>t.id!==txId)}
        : r)
    }));
  };

  // Row totals from transactions
  const rowTotals=(table,rowId)=>{
    const txs = getTxList(table,rowId);
    return {
      inVal: txs.reduce((s,t)=>s+n(t.inVal),0),
      outVal: txs.reduce((s,t)=>s+n(t.outVal),0),
    };
  };

  const switchYear=(y)=>{ setData(p=>({...p,activeYear:Number(y)})); setSidebarOpen(false); };

  const addYear=()=>{
    const y=parseInt(newYear);
    if(!y||y<2000||y>2100) return;
    if(years[y]){
      setYearExistsWarn(true);
      if(warnTimer.current) clearTimeout(warnTimer.current);
      warnTimer.current=setTimeout(()=>setYearExistsWarn(false),3000);
      return;
    }
    setData(p=>({...p,years:{...p.years,[y]:emptyYear()},activeYear:y}));
    setYearModal(false); setNewYear(""); setYearExistsWarn(false);
    showToast(`${y} সাল যোগ হয়েছে ✓`);
  };

  const confirmDeleteYear=()=>{
    if(selectedYears.length===0) return;
    setData(p=>{
      const next={...p.years};
      selectedYears.forEach(y=>delete next[y]);
      const rem=Object.keys(next).map(Number).sort((a,b)=>a-b);
      let na=p.activeYear;
      if(!next[na]){ if(rem.length>0) na=rem[rem.length-1]; else{ const y=new Date().getFullYear(); next[y]=emptyYear(); na=y; } }
      return{years:next,activeYear:na};
    });
    setDeleteModal(false); setSelectedYears([]); setMultiSelectMode(false);
    showToast(`${selectedYears.length}টি সাল মুছে ফেলা হয়েছে`,"error");
  };

  const toggleSelectYear=(y)=>setSelectedYears(prev=>prev.includes(y)?prev.filter(x=>x!==y):[...prev,y]);

  const startYearLongPress=(y)=>{ longPressTimer.current=setTimeout(()=>{ setMultiSelectMode(true); setSelectedYears([y]); },600); };
  const cancelYearLongPress=()=>{ if(longPressTimer.current) clearTimeout(longPressTimer.current); };
  const exitMultiSelect=()=>{ setMultiSelectMode(false); setSelectedYears([]); };

  const confirmClearAll=()=>{
    const y=new Date().getFullYear();
    setData({years:{[y]:emptyYear()},activeYear:y});
    setClearModal(false);
    showToast("সব ইতিহাস মুছে ফেলা হয়েছে","error");
  };

  // Calculations
  const calcTableTotals=(table)=>{
    let tIn=0,tOut=0;
    yd[table].forEach(row=>{
      const {inVal,outVal}=rowTotals(table,row.id);
      tIn+=inVal; tOut+=outVal;
    });
    return {tIn,tOut};
  };

  const {tIn:necIn,tOut:necOut}=calcTableTotals("necessary");
  const {tIn:extIn,tOut:extOut}=calcTableTotals("extra");
  const grandIn=necIn+extIn, grandOut=necOut+extOut, netBal=grandIn-grandOut;

  const allYearsNet=Object.entries(years).map(([yr,y])=>{
    let ni=0,no=0,ei=0,eo=0;
    y.necessary.forEach(r=>(r.transactions||[]).forEach(t=>{ni+=n(t.inVal);no+=n(t.outVal);}));
    y.extra.forEach(r=>(r.transactions||[]).forEach(t=>{ei+=n(t.inVal);eo+=n(t.outVal);}));
    return{year:Number(yr),necBal:ni-no,extBal:ei-eo,net:(ni+ei)-(no+eo)};
  }).sort((a,b)=>a.year-b.year);
  const totalHolding=allYearsNet.reduce((s,y)=>s+y.net,0);
  const sortedYears=Object.keys(years).map(Number).sort((a,b)=>a-b);

  const chartMax=Math.max(
    ...yd.necessary.map(r=>{const{inVal,outVal}=rowTotals("necessary",r.id);return Math.max(inVal,outVal);}),
    ...yd.extra.map(r=>{const{inVal,outVal}=rowTotals("extra",r.id);return Math.max(inVal,outVal);}),1
  );

  // ── Render Table ──
  const renderTable=(tableKey,accent)=>{
    const rows=yd[tableKey];
    const {tIn,tOut}=calcTableTotals(tableKey);
    const bal=tIn-tOut;
    return (
      <div style={{animation:"fadeSlideUp .3s ease both"}}>
        <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr 1fr",padding:"5px 14px 10px",fontSize:10,letterSpacing:2,fontWeight:700}}>
          <span style={{color:"var(--text3)"}}>MONTH</span>
          <span style={{textAlign:"right",color:"var(--green)"}}>IN</span>
          <span style={{textAlign:"right",color:"var(--red)"}}>OUT</span>
        </div>

        {rows.map((row,idx)=>{
          const {inVal,outVal}=rowTotals(tableKey,row.id);
          const has=inVal>0||outVal>0;
          const diff=inVal-outVal;
          const isCurrentMonth=row.month===currentMonth&&activeYear===currentYear;
          return (
            <RowCard key={row.id} has={has} idx={idx}>
              <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr 1fr",alignItems:"center",padding:"11px 14px"}}>
                {/* Month name + green dot */}
                <span style={{fontWeight:600,fontSize:14,color:has?"var(--text1)":"var(--text3)",display:"flex",alignItems:"center",gap:6}}>
                  {isCurrentMonth&&<span style={{width:7,height:7,borderRadius:"50%",background:"var(--green2)",display:"inline-block",flexShrink:0,boxShadow:"0 0 6px var(--green2)"}}/>}
                  {row.month}
                </span>
                {/* IN total — click to open input */}
                <div style={{textAlign:"right"}} onClick={()=>{setInputPanel({table:tableKey,rowId:row.id,field:"inVal"});setInputTx(newTx());}}>
                  <div style={{color:inVal>0?"var(--green2)":"var(--text3)",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>
                    {inVal>0?fmt(inVal):<span style={{fontSize:10}}>tap</span>}
                  </div>
                </div>
                {/* OUT total — click to open input */}
                <div style={{textAlign:"right"}} onClick={()=>{setInputPanel({table:tableKey,rowId:row.id,field:"outVal"});setInputTx(newTx());}}>
                  <div style={{color:outVal>0?"var(--red2)":"var(--text3)",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>
                    {outVal>0?fmt(outVal):<span style={{fontSize:10}}>tap</span>}
                  </div>
                </div>
              </div>
              {/* Bottom bar — history + diff */}
              {has&&(
                <div style={{borderTop:"1px solid rgba(255,255,255,0.05)",padding:"5px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",background:diff>=0?"rgba(34,211,122,0.03)":"rgba(240,90,122,0.03)"}}>
                  <button onClick={()=>setHistoryPanel({table:tableKey,rowId:row.id})} style={{
                    fontSize:10,color:"var(--text3)",background:"rgba(255,255,255,0.06)",
                    border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,
                    padding:"3px 10px",cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontWeight:600,
                  }}>📋 History</button>
                  <span style={{fontSize:11,color:diff>=0?"var(--green2)":"var(--red2)",fontFamily:"'JetBrains Mono',monospace",fontWeight:600}}>
                    {diff>=0?"↑":"↓"} {fmt(Math.abs(diff))}
                  </span>
                </div>
              )}
            </RowCard>
          );
        })}

        {/* Total */}
        <div style={{background:`linear-gradient(135deg,${accent}18,${accent}08)`,border:`1px solid ${accent}30`,borderRadius:14,padding:"12px 14px",marginTop:6}}>
          <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr 1fr",alignItems:"center"}}>
            <span style={{fontWeight:700,fontSize:13,color:"var(--text2)",letterSpacing:1}}>TOTAL</span>
            <span style={{textAlign:"right",fontWeight:800,fontSize:15,color:"var(--green2)",fontFamily:"'JetBrains Mono',monospace"}}>{fmt(tIn)}</span>
            <span style={{textAlign:"right",fontWeight:800,fontSize:15,color:"var(--red2)",fontFamily:"'JetBrains Mono',monospace"}}>{fmt(tOut)}</span>
          </div>
        </div>
        <div style={{background:bal>=0?"rgba(34,211,122,0.07)":"rgba(240,90,122,0.07)",border:`1px solid ${bal>=0?"rgba(34,211,122,0.25)":"rgba(240,90,122,0.25)"}`,borderRadius:14,padding:"11px 14px",marginTop:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:12,color:"var(--text2)",fontWeight:600}}>Balance</div>
          <div style={{fontWeight:800,fontSize:18,color:bal>=0?"var(--green2)":"var(--red2)",fontFamily:"'JetBrains Mono',monospace"}}>{bal<0?"-":""}{fmt(Math.abs(bal))}</div>
        </div>
      </div>
    );
  };

  const renderChartBars=(tableKey,outGrad,outColor)=>
    yd[tableKey].filter(r=>{const{inVal,outVal}=rowTotals(tableKey,r.id);return inVal>0||outVal>0;}).map((row,idx)=>{
      const{inVal,outVal}=rowTotals(tableKey,row.id);
      const iW=(inVal/chartMax)*100, oW=(outVal/chartMax)*100;
      return (
        <div key={row.id} style={{marginBottom:16,animation:`fadeSlideUp .3s ${idx*.04}s ease both`}}>
          <div style={{fontSize:11,color:"var(--text2)",marginBottom:6,fontWeight:600}}>{row.month}</div>
          {[{label:"IN",w:iW,val:inVal,g:"#065f46,var(--green2)",tc:"var(--green2)"},{label:"OUT",w:oW,val:outVal,g:outGrad,tc:outColor}].map(({label,w,val,g,tc})=>val===0?null:(
            <div key={label} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <span style={{width:26,fontSize:9,color:tc,textAlign:"right",fontWeight:700}}>{label}</span>
              <div style={{flex:1,background:"rgba(255,255,255,0.04)",borderRadius:6,height:20,overflow:"hidden"}}>
                <div style={{width:`${w}%`,height:"100%",borderRadius:6,background:`linear-gradient(90deg,${g})`,display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:6,minWidth:w>0?6:0,transition:"width .6s cubic-bezier(.4,0,.2,1)",boxShadow:`0 0 8px ${tc}44`}}>
                  {w>30&&<span style={{fontSize:9,fontWeight:700,color:"#fff",fontFamily:"'JetBrains Mono',monospace"}}>{fmt(val)}</span>}
                </div>
              </div>
              {w<=30&&val>0&&<span style={{fontSize:10,color:tc,fontWeight:700,minWidth:36,fontFamily:"'JetBrains Mono',monospace"}}>{fmt(val)}</span>}
            </div>
          ))}
        </div>
      );
    });

  if(!mounted) return null;

  return (
    <>
      <style>{CSS}</style>
      <div className="app-shell" style={{minHeight:"100vh",background:"linear-gradient(145deg,#060d18 0%,#0d1a2d 40%,#081525 70%,#06101e 100%)",display:"flex",flexDirection:"column",maxWidth:520,margin:"0 auto",position:"relative",overflow:"hidden"}}>

        <div style={{position:"fixed",top:"-20%",right:"-10%",width:320,height:320,borderRadius:"50%",background:"radial-gradient(circle,rgba(59,130,246,0.07) 0%,transparent 70%)",pointerEvents:"none",zIndex:0}}/>
        <div style={{position:"fixed",bottom:"10%",left:"-15%",width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle,rgba(34,211,122,0.05) 0%,transparent 70%)",pointerEvents:"none",zIndex:0}}/>

        {sidebarOpen&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,backdropFilter:"blur(4px)",animation:"fadeIn .2s ease"}}/>}

        {/* ── Sidebar ── */}
        <div ref={sidebarRef} style={{position:"fixed",top:0,right:0,bottom:0,width:230,background:"linear-gradient(180deg,#0e1e35 0%,#091525 100%)",borderLeft:"1px solid rgba(59,130,246,0.15)",zIndex:201,transform:sidebarOpen?"translateX(0)":"translateX(100%)",transition:"transform .3s cubic-bezier(.4,0,.2,1)",display:"flex",flexDirection:"column",boxShadow:"-8px 0 40px rgba(0,0,0,0.6)"}}>
          <div style={{padding:"22px 18px 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:9,color:"var(--blue2)",letterSpacing:2,fontWeight:700,marginBottom:2}}>YEARS</div>
              <div style={{fontSize:12,color:"var(--text3)"}}>{sortedYears.length} সাল</div>
            </div>
            <button onClick={()=>setSidebarOpen(false)} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"var(--text2)",fontSize:14,cursor:"pointer",width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          </div>

          {multiSelectMode&&(
            <div style={{padding:"8px 14px",background:"rgba(240,90,122,0.08)",borderBottom:"1px solid rgba(240,90,122,0.15)",display:"flex",alignItems:"center",justifyContent:"space-between",animation:"fadeSlideUp .2s ease"}}>
              <span style={{fontSize:11,color:"var(--red2)",fontWeight:600}}>{selectedYears.length>0?`${selectedYears.length}টি selected`:"select করুন"}</span>
              <div style={{display:"flex",gap:6}}>
                <button onClick={exitMultiSelect} style={{fontSize:11,padding:"4px 10px",borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"var(--text2)",cursor:"pointer"}}>বাতিল</button>
                {selectedYears.length>0&&<button onClick={()=>setDeleteModal(true)} style={{fontSize:11,padding:"4px 10px",borderRadius:8,border:"none",background:"var(--red)",color:"#fff",cursor:"pointer",fontWeight:700}}>মুছুন ({selectedYears.length})</button>}
              </div>
            </div>
          )}

          <div style={{flex:1,overflowY:"auto",padding:"8px 0"}}>
            {sortedYears.map(y=>{
              const isSelected=selectedYears.includes(y);
              return (
                <div key={y} className="year-item"
                  onMouseDown={()=>startYearLongPress(y)} onMouseUp={cancelYearLongPress} onMouseLeave={cancelYearLongPress}
                  onTouchStart={()=>startYearLongPress(y)} onTouchEnd={cancelYearLongPress}
                  onClick={()=>multiSelectMode?toggleSelectYear(y):switchYear(y)}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"11px 18px",cursor:"pointer",userSelect:"none",background:isSelected?"rgba(240,90,122,0.12)":activeYear===y?"rgba(59,130,246,0.15)":"transparent",borderLeft:`3px solid ${isSelected?"var(--red)":activeYear===y?"var(--blue)":"transparent"}`}}>
                  {multiSelectMode&&(
                    <div style={{width:18,height:18,borderRadius:5,flexShrink:0,border:`2px solid ${isSelected?"var(--red)":"rgba(255,255,255,0.25)"}`,background:isSelected?"var(--red)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
                      {isSelected&&<span style={{fontSize:10,color:"#fff",lineHeight:1}}>✓</span>}
                    </div>
                  )}
                  <span style={{flex:1,fontSize:16,fontWeight:activeYear===y?700:400,color:activeYear===y&&!isSelected?"var(--blue2)":isSelected?"var(--red2)":"var(--text2)",fontFamily:"'JetBrains Mono',monospace",display:"flex",alignItems:"center",gap:6}}>
                    {y===currentYear&&<span style={{width:7,height:7,borderRadius:"50%",background:"var(--green2)",display:"inline-block",flexShrink:0,boxShadow:"0 0 6px var(--green2)"}}/>}
                    {y}
                  </span>
                  {activeYear===y&&!multiSelectMode&&<span style={{fontSize:8,color:"var(--blue)",background:"rgba(59,130,246,0.15)",padding:"3px 8px",borderRadius:10,letterSpacing:1,fontWeight:700}}>ACTIVE</span>}
                </div>
              );
            })}
          </div>
          {!multiSelectMode&&<div style={{padding:"4px 18px 2px",textAlign:"center",fontSize:9,color:"var(--text3)"}}>দীর্ঘ চাপ দিলে multi-select চালু হবে</div>}
          <div style={{padding:"12px 14px 8px",display:"flex",flexDirection:"column",gap:8}}>
            <PressBtn onClick={()=>{setSidebarOpen(false);setYearModal(true);}} style={{padding:"11px",borderRadius:12,border:"1px dashed rgba(96,165,250,0.3)",background:"rgba(59,130,246,0.07)",color:"var(--blue2)",cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"'Outfit',sans-serif"}}>+ নতুন বছর</PressBtn>
            <PressBtn onClick={()=>{setSidebarOpen(false);setClearModal(true);}} style={{padding:"11px",borderRadius:12,border:"1px solid rgba(240,90,122,0.2)",background:"rgba(240,90,122,0.06)",color:"var(--red2)",cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"'Outfit',sans-serif"}}>🗑 সব ইতিহাস মুছুন</PressBtn>
          </div>
          <div style={{padding:"6px 18px 16px",textAlign:"center",fontSize:9,color:"var(--text3)"}}>কোনো বছর মুছতে দীর্ঘ চাপ দিন</div>
        </div>

        {/* ── Total Holding ── */}
        <div ref={holdingRef} style={{position:"relative",zIndex:10}}>
          <div style={{background:"rgba(245,158,11,0.05)",borderBottom:"1px solid rgba(245,158,11,0.15)",padding:"11px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",userSelect:"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,rgba(245,158,11,0.3),rgba(245,158,11,0.1))",border:"1px solid rgba(245,158,11,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>💰</div>
              <div>
                <div style={{fontSize:9,color:"var(--gold2)",fontWeight:700,letterSpacing:1.5}}>TOTAL HOLDING</div>
                <div style={{fontSize:10,color:"rgba(245,158,11,0.5)",marginTop:1}}>সব বছর মিলিয়ে</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              {holdingVis
                ?<span style={{fontSize:18,fontWeight:800,color:totalHolding>=0?"var(--green2)":"var(--red2)",fontFamily:"'JetBrains Mono',monospace"}}>{totalHolding<0?"-":""}{fmt(Math.abs(totalHolding))}</span>
                :<div onClick={()=>{setHoldingVis(true);if(holdingTimer.current) clearTimeout(holdingTimer.current);}} style={{display:"flex",gap:5,alignItems:"center",cursor:"pointer",padding:"4px 8px",borderRadius:20}}>
                  <span className="dot1" style={{width:7,height:7,borderRadius:"50%",background:"rgba(245,158,11,0.6)",display:"inline-block"}}/>
                  <span className="dot2" style={{width:7,height:7,borderRadius:"50%",background:"rgba(245,158,11,0.6)",display:"inline-block"}}/>
                  <span className="dot3" style={{width:7,height:7,borderRadius:"50%",background:"rgba(245,158,11,0.6)",display:"inline-block"}}/>
                </div>
              }
              {holdingVis&&<span onClick={()=>{setHoldingVis(false);if(holdingTimer.current) clearTimeout(holdingTimer.current);}} style={{fontSize:10,color:"rgba(245,158,11,0.6)",cursor:"pointer",padding:"2px 6px",borderRadius:6}}>✕</span>}
            </div>
          </div>

          {holdingVis&&(
            <div style={{position:"absolute",top:"100%",left:0,right:0,background:"linear-gradient(180deg,#122035,#0c1828)",border:"1px solid rgba(245,158,11,0.18)",borderTop:"none",borderRadius:"0 0 16px 16px",boxShadow:"0 20px 60px rgba(0,0,0,0.7)",zIndex:999,animation:"fadeSlideUp .2s ease",overflow:"hidden"}}>
              <div style={{padding:"14px 20px 10px"}}>
                <div style={{fontSize:9,color:"var(--gold2)",letterSpacing:1.5,fontWeight:700,marginBottom:10}}>ALL YEARS SUMMARY</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                  {[
                    {label:"TOTAL NET",value:totalHolding,color:totalHolding>=0?"var(--green2)":"var(--red2)",bg:"rgba(245,158,11,0.08)",border:"rgba(245,158,11,0.2)"},
                    {label:"NECESSARY",value:allYearsNet.reduce((s,y)=>s+y.necBal,0),color:"var(--teal)",bg:"rgba(6,182,212,0.08)",border:"rgba(6,182,212,0.2)"},
                    {label:"EXTRA",value:allYearsNet.reduce((s,y)=>s+y.extBal,0),color:"var(--purple)",bg:"rgba(167,139,250,0.08)",border:"rgba(167,139,250,0.2)"},
                  ].map(c=>(
                    <div key={c.label} style={{background:c.bg,border:`1px solid ${c.border}`,borderRadius:10,padding:"8px 6px",textAlign:"center"}}>
                      <div style={{fontSize:7,color:c.color,letterSpacing:.8,fontWeight:700,marginBottom:3}}>{c.label}</div>
                      <div style={{fontSize:12,fontWeight:800,color:c.color,fontFamily:"'JetBrains Mono',monospace"}}>{c.value<0?"-":""}{fmt(Math.abs(c.value))}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{padding:"0 20px 10px",borderTop:"1px solid rgba(255,255,255,0.05)"}}>
                <div style={{fontSize:9,color:"var(--text3)",letterSpacing:1,fontWeight:700,margin:"10px 0 8px"}}>YEAR SELECT</div>
                <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,WebkitOverflowScrolling:"touch"}}>
                  {allYearsNet.map(({year})=>(
                    <button key={year} onClick={()=>setHoldingYear(holdingYear===year?null:year)} style={{padding:"5px 12px",borderRadius:20,border:"none",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:700,background:holdingYear===year?"#2563eb":"rgba(255,255,255,0.07)",color:holdingYear===year?"#fff":"var(--text2)",flexShrink:0,transition:"all .15s"}}>{year}</button>
                  ))}
                </div>
              </div>
              {holdingYear&&(()=>{
                const yd2=allYearsNet.find(y=>y.year===holdingYear);
                if(!yd2) return null;
                return (
                  <div style={{padding:"10px 20px 14px",borderTop:"1px solid rgba(255,255,255,0.05)",animation:"fadeSlideUp .2s ease"}}>
                    <div style={{fontSize:9,color:"var(--blue2)",letterSpacing:1.5,fontWeight:700,marginBottom:10}}>{holdingYear} — BREAKDOWN</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                      {[
                        {label:"NET",value:yd2.net,color:yd2.net>=0?"var(--green2)":"var(--red2)",bg:"rgba(245,158,11,0.08)",border:"rgba(245,158,11,0.2)"},
                        {label:"NECESSARY",value:yd2.necBal,color:"var(--teal)",bg:"rgba(6,182,212,0.08)",border:"rgba(6,182,212,0.2)"},
                        {label:"EXTRA",value:yd2.extBal,color:"var(--purple)",bg:"rgba(167,139,250,0.08)",border:"rgba(167,139,250,0.2)"},
                      ].map(c=>(
                        <div key={c.label} style={{background:c.bg,border:`1px solid ${c.border}`,borderRadius:10,padding:"8px 6px",textAlign:"center"}}>
                          <div style={{fontSize:7,color:c.color,letterSpacing:.8,fontWeight:700,marginBottom:3}}>{c.label}</div>
                          <div style={{fontSize:12,fontWeight:800,color:c.color,fontFamily:"'JetBrains Mono',monospace"}}>{c.value<0?"-":""}{fmt(Math.abs(c.value))}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* ── Header ── */}
        <div className="fade-up" style={{padding:"18px 20px 14px",background:"rgba(255,255,255,0.025)",borderBottom:"1px solid var(--border)",position:"relative",zIndex:5}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:9,letterSpacing:3,color:"var(--blue2)",textTransform:"uppercase",marginBottom:4,fontWeight:700}}>Income Tracker</div>
              <div style={{fontSize:20,fontWeight:800,letterSpacing:-.5,background:"linear-gradient(135deg,var(--text1),var(--text2))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Income & Expense</div>
            </div>
            <button onClick={()=>setSidebarOpen(true)} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 16px",borderRadius:22,background:"linear-gradient(135deg,rgba(59,130,246,0.2),rgba(59,130,246,0.1))",border:`1px solid ${activeYear===currentYear?"rgba(34,211,122,0.4)":"rgba(59,130,246,0.3)"}`,color:"var(--blue2)",cursor:"pointer",fontWeight:700,fontSize:15,fontFamily:"'JetBrains Mono',monospace",boxShadow:activeYear===currentYear?"0 0 20px rgba(34,211,122,0.15)":"0 0 20px rgba(59,130,246,0.1)"}}>
              {activeYear===currentYear&&<span style={{width:7,height:7,borderRadius:"50%",background:"var(--green2)",display:"inline-block",boxShadow:"0 0 6px var(--green2)"}}/>}
              {activeYear}
              <span style={{fontSize:12,opacity:.7}}>☰</span>
            </button>
          </div>
        </div>

        {/* ── Summary Cards ── */}
        <div className="summary-grid fade-up-1" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,padding:"14px 14px 0"}}>
          {[
            {label:"Total In",value:grandIn,color:"var(--green2)",glow:"rgba(34,211,122,0.15)",border:"rgba(34,211,122,0.2)"},
            {label:"Total Out",value:grandOut,color:"var(--red2)",glow:"rgba(240,90,122,0.15)",border:"rgba(240,90,122,0.2)"},
            {label:"Net Balance",value:netBal,color:netBal>=0?"var(--green2)":"var(--red2)",glow:netBal>=0?"rgba(34,211,122,0.15)":"rgba(240,90,122,0.15)",border:netBal>=0?"rgba(34,211,122,0.2)":"rgba(240,90,122,0.2)"},
          ].map(c=><SummaryCard key={c.label} c={c}/>)}
        </div>

        {/* ── Tabs ── */}
        <div className="fade-up-2" style={{display:"flex",padding:"12px 14px 0",gap:8}}>
          {[{id:"chart",label:"📊 Chart"},{id:"necessary",label:"📋 Necessary"},{id:"extra",label:"📋 Extra"}].map(t=><TabBtn key={t.id} t={t} active={tab===t.id} onClick={()=>setTab(t.id)}/>)}
        </div>

        {/* ── Chart Tab ── */}
        {tab==="chart"&&(
          <div style={{flex:1,padding:"14px 14px 90px",overflowY:"auto",position:"relative",zIndex:1}}>
            {chartMax<=1
              ?<div style={{textAlign:"center",color:"var(--text3)",padding:"80px 0",fontSize:14}}><div style={{fontSize:32,marginBottom:12}}>📊</div>Table-এ ডেটা যোগ করলে Chart দেখাবে</div>
              :<>
                <div style={{fontSize:9,color:"var(--teal)",letterSpacing:2,fontWeight:700,marginBottom:12}}>NECESSARY</div>
                {renderChartBars("necessary","#831843,var(--red2)","var(--red2)")}
                <div style={{height:1,background:"var(--border)",margin:"16px 0"}}/>
                <div style={{fontSize:9,color:"var(--purple)",letterSpacing:2,fontWeight:700,marginBottom:12}}>EXTRA</div>
                {renderChartBars("extra","#4c1d95,var(--purple)","var(--purple)")}
                <div style={{marginTop:20,background:"rgba(255,255,255,0.025)",border:"1px solid var(--border2)",borderRadius:16,padding:"16px",animation:"fadeSlideUp .3s .2s ease both"}}>
                  <div style={{fontSize:9,color:"var(--blue2)",letterSpacing:2,fontWeight:700,marginBottom:14}}>NET BALANCE / MONTH</div>
                  {(()=>{
                    const rows=MONTHS.map((m,i)=>{
                      const ni=rowTotals("necessary",yd.necessary[i]?.id).inVal;
                      const no=rowTotals("necessary",yd.necessary[i]?.id).outVal;
                      const ei=rowTotals("extra",yd.extra[i]?.id).inVal;
                      const eo=rowTotals("extra",yd.extra[i]?.id).outVal;
                      return{month:m,net:(ni+ei)-(no+eo),has:ni||no||ei||eo};
                    }).filter(r=>r.has);
                    const maxD=Math.max(...rows.map(r=>Math.abs(r.net)),1);
                    return rows.map((r,i)=>(
                      <div key={r.month} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,animation:`fadeSlideUp .25s ${i*.04}s ease both`}}>
                        <span style={{width:66,fontSize:10,color:"var(--text3)",fontWeight:600,fontFamily:"'JetBrains Mono',monospace"}}>{r.month.slice(0,3)}</span>
                        <div style={{flex:1,background:"rgba(255,255,255,0.04)",borderRadius:6,height:16,overflow:"hidden"}}>
                          <div style={{width:`${(Math.abs(r.net)/maxD)*100}%`,height:"100%",background:r.net>=0?"linear-gradient(90deg,#065f46,var(--green2))":"linear-gradient(90deg,#7f1d1d,var(--red2))",borderRadius:6,transition:"width .6s cubic-bezier(.4,0,.2,1)",boxShadow:`0 0 6px ${r.net>=0?"rgba(34,211,122,0.4)":"rgba(240,90,122,0.4)"}`}}/>
                        </div>
                        <span style={{width:58,textAlign:"right",fontSize:11,fontWeight:700,color:r.net>=0?"var(--green2)":"var(--red2)",fontFamily:"'JetBrains Mono',monospace"}}>{r.net>=0?"+":"-"}{fmt(Math.abs(r.net))}</span>
                      </div>
                    ));
                  })()}
                </div>
              </>
            }
          </div>
        )}

        {tab==="necessary"&&(
          <div style={{flex:1,padding:"14px 14px 90px",overflowY:"auto",position:"relative",zIndex:1}}>
            <div style={{fontSize:9,color:"var(--teal)",letterSpacing:2,fontWeight:700,marginBottom:12}}>NECESSARY — দৈনন্দিন খরচ</div>
            {renderTable("necessary","var(--teal)")}
          </div>
        )}

        {tab==="extra"&&(
          <div style={{flex:1,padding:"14px 14px 90px",overflowY:"auto",position:"relative",zIndex:1}}>
            <div style={{fontSize:9,color:"var(--purple)",letterSpacing:2,fontWeight:700,marginBottom:12}}>EXTRA — বাড়তি / হঠাৎ খরচ</div>
            {renderTable("extra","var(--purple)")}
          </div>
        )}

        {/* ── Input Panel (bottom sheet) ── */}
        {inputPanel&&inputTx&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:300,backdropFilter:"blur(4px)",animation:"fadeIn .2s ease"}} onClick={()=>setInputPanel(null)}>
            <div className="slide-up" style={{position:"absolute",bottom:0,left:0,right:0,maxWidth:520,margin:"0 auto",background:"linear-gradient(180deg,#0e1e35,#091525)",borderRadius:"20px 20px 0 0",padding:"20px",boxShadow:"0 -8px 40px rgba(0,0,0,0.6)"}} onClick={e=>e.stopPropagation()}>
              <div style={{width:40,height:4,borderRadius:2,background:"rgba(255,255,255,0.2)",margin:"0 auto 18px"}}/>
              <div style={{fontSize:14,fontWeight:700,marginBottom:16,color:"var(--text1)"}}>
                {yd[inputPanel.table].find(r=>r.id===inputPanel.rowId)?.month} — {inputPanel.field==="inVal"?"Income":"Expense"} যোগ করুন
              </div>

              {/* Date */}
              <div style={{marginBottom:12}}>
                <div style={{fontSize:10,color:"var(--text3)",letterSpacing:1,marginBottom:6,fontWeight:600}}>তারিখ</div>
                <input type="date" value={inputTx.date} onChange={e=>setInputTx(t=>({...t,date:e.target.value}))}
                  style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"10px 14px",color:"var(--text1)",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
              </div>

              {/* Amount */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                <div>
                  <div style={{fontSize:10,color:"var(--green2)",letterSpacing:1,marginBottom:6,fontWeight:600}}>IN (আয়)</div>
                  <input type="number" placeholder="0" value={inputTx.inVal}
                    onChange={e=>setInputTx(t=>({...t,inVal:e.target.value}))}
                    style={{width:"100%",background:"rgba(34,211,122,0.08)",border:"1px solid rgba(34,211,122,0.25)",borderRadius:10,padding:"10px 14px",color:"var(--green2)",fontSize:15,fontWeight:700,outline:"none",boxSizing:"border-box",fontFamily:"'JetBrains Mono',monospace"}}/>
                </div>
                <div>
                  <div style={{fontSize:10,color:"var(--red2)",letterSpacing:1,marginBottom:6,fontWeight:600}}>OUT (খরচ)</div>
                  <input type="number" placeholder="0" value={inputTx.outVal}
                    onChange={e=>setInputTx(t=>({...t,outVal:e.target.value}))}
                    style={{width:"100%",background:"rgba(240,90,122,0.08)",border:"1px solid rgba(240,90,122,0.25)",borderRadius:10,padding:"10px 14px",color:"var(--red2)",fontSize:15,fontWeight:700,outline:"none",boxSizing:"border-box",fontFamily:"'JetBrains Mono',monospace"}}/>
                </div>
              </div>

              {/* Note */}
              <div style={{marginBottom:18}}>
                <div style={{fontSize:10,color:"var(--text3)",letterSpacing:1,marginBottom:6,fontWeight:600}}>নোট (ঐচ্ছিক)</div>
                <input type="text" placeholder="যেমন: বাজার, বেতন..." value={inputTx.note}
                  onChange={e=>setInputTx(t=>({...t,note:e.target.value}))}
                  style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"10px 14px",color:"var(--text1)",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
              </div>

              {/* Save button */}
              <PressBtn onClick={()=>{
                if(n(inputTx.inVal)===0&&n(inputTx.outVal)===0) return;
                addTransaction(inputPanel.table, inputPanel.rowId, inputTx);
                setInputPanel(null); setInputTx(null);
                showToast("Saved ✓");
              }} style={{width:"100%",padding:"13px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#1d4ed8,#2563eb)",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:15,fontFamily:"'Outfit',sans-serif",boxShadow:"0 4px 16px rgba(37,99,235,0.4)"}}>
                যোগ করুন
              </PressBtn>
            </div>
          </div>
        )}

        {/* ── History Panel ── */}
        {historyPanel&&(()=>{
          const row=yd[historyPanel.table].find(r=>r.id===historyPanel.rowId);
          if(!row) return null;
          const txs=(row.transactions||[]).slice().sort((a,b)=>new Date(b.date)-new Date(a.date));
          const tIn=txs.reduce((s,t)=>s+n(t.inVal),0);
          const tOut=txs.reduce((s,t)=>s+n(t.outVal),0);
          return (
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:300,backdropFilter:"blur(4px)",animation:"fadeIn .2s ease"}} onClick={()=>{setHistoryPanel(null);setEditingTxId(null);}}>
              <div className="slide-up" style={{position:"absolute",bottom:0,left:0,right:0,maxWidth:520,margin:"0 auto",background:"linear-gradient(180deg,#0e1e35,#091525)",borderRadius:"20px 20px 0 0",padding:"20px",boxShadow:"0 -8px 40px rgba(0,0,0,0.6)",maxHeight:"80vh",display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>
                <div style={{width:40,height:4,borderRadius:2,background:"rgba(255,255,255,0.2)",margin:"0 auto 14px"}}/>

                {/* Header */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div>
                    <div style={{fontSize:15,fontWeight:700}}>{row.month} — History</div>
                    <div style={{fontSize:10,color:"var(--text3)",marginTop:2}}>{txs.length}টি transaction</div>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:11,color:"var(--green2)",fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>+{fmt(tIn)}</div>
                      <div style={{fontSize:11,color:"var(--red2)",fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>-{fmt(tOut)}</div>
                    </div>
                    <button onClick={()=>{
                      setHistoryPanel(null);setEditingTxId(null);
                      setInputPanel({table:historyPanel.table,rowId:historyPanel.rowId,field:"inVal"});
                      setInputTx(newTx());
                    }} style={{width:32,height:32,borderRadius:10,border:"1px solid rgba(59,130,246,0.3)",background:"rgba(59,130,246,0.1)",color:"var(--blue2)",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:300}}>+</button>
                  </div>
                </div>

                {/* Transaction list */}
                <div style={{overflowY:"auto",flex:1}}>
                  {txs.length===0
                    ?<div style={{textAlign:"center",color:"var(--text3)",padding:"40px 0",fontSize:13}}>এখনো কোনো transaction নেই</div>
                    :txs.map(tx=>(
                      <div key={tx.id} style={{marginBottom:8}}>
                        {editingTxId===tx.id
                          ?/* Edit mode */(
                            <div style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,padding:"12px"}}>
                              <input type="date" value={tx.date} onChange={e=>updateTransaction(historyPanel.table,historyPanel.rowId,tx.id,{date:e.target.value})}
                                style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,padding:"8px 10px",color:"var(--text1)",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
                              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                                <input type="number" placeholder="IN" value={tx.inVal} onChange={e=>updateTransaction(historyPanel.table,historyPanel.rowId,tx.id,{inVal:e.target.value})}
                                  style={{background:"rgba(34,211,122,0.08)",border:"1px solid rgba(34,211,122,0.25)",borderRadius:8,padding:"8px 10px",color:"var(--green2)",fontSize:14,fontWeight:700,outline:"none",boxSizing:"border-box",fontFamily:"'JetBrains Mono',monospace"}}/>
                                <input type="number" placeholder="OUT" value={tx.outVal} onChange={e=>updateTransaction(historyPanel.table,historyPanel.rowId,tx.id,{outVal:e.target.value})}
                                  style={{background:"rgba(240,90,122,0.08)",border:"1px solid rgba(240,90,122,0.25)",borderRadius:8,padding:"8px 10px",color:"var(--red2)",fontSize:14,fontWeight:700,outline:"none",boxSizing:"border-box",fontFamily:"'JetBrains Mono',monospace"}}/>
                              </div>
                              <input type="text" placeholder="নোট..." value={tx.note} onChange={e=>updateTransaction(historyPanel.table,historyPanel.rowId,tx.id,{note:e.target.value})}
                                style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,padding:"8px 10px",color:"var(--text1)",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
                              <div style={{display:"flex",gap:8}}>
                                <button onClick={()=>setEditingTxId(null)} style={{flex:1,padding:"8px",borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"var(--text2)",cursor:"pointer",fontSize:12,fontFamily:"'Outfit',sans-serif"}}>✓ Done</button>
                                <button onClick={()=>{deleteTransaction(historyPanel.table,historyPanel.rowId,tx.id);setEditingTxId(null);}} style={{flex:1,padding:"8px",borderRadius:8,border:"none",background:"rgba(240,90,122,0.15)",color:"var(--red2)",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'Outfit',sans-serif"}}>🗑 মুছুন</button>
                              </div>
                            </div>
                          )
                          :/* View mode */(
                            <div onClick={()=>setEditingTxId(tx.id)} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"11px 14px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                              <div>
                                <div style={{fontSize:11,color:"var(--text3)",marginBottom:3,fontFamily:"'JetBrains Mono',monospace"}}>{fmtDate(tx.date)}</div>
                                {tx.note&&<div style={{fontSize:12,color:"var(--text2)"}}>{tx.note}</div>}
                              </div>
                              <div style={{textAlign:"right"}}>
                                {n(tx.inVal)>0&&<div style={{fontSize:13,fontWeight:700,color:"var(--green2)",fontFamily:"'JetBrains Mono',monospace"}}>+{fmt(n(tx.inVal))}</div>}
                                {n(tx.outVal)>0&&<div style={{fontSize:13,fontWeight:700,color:"var(--red2)",fontFamily:"'JetBrains Mono',monospace"}}>-{fmt(n(tx.outVal))}</div>}
                              </div>
                            </div>
                          )
                        }
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── Modals ── */}
        {yearModal&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400,backdropFilter:"blur(6px)",animation:"fadeIn .2s ease"}} onClick={()=>{setYearModal(false);setYearExistsWarn(false);setNewYear("");}}>
            <div className="modal-box" style={{background:"linear-gradient(145deg,#122035,#0d1a2d)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:20,padding:"26px",width:"min(290px,90vw)",boxShadow:"0 24px 80px rgba(0,0,0,0.7)"}} onClick={e=>e.stopPropagation()}>
              <div style={{fontSize:16,fontWeight:700,marginBottom:6}}>নতুন বছর যোগ করুন</div>
              <div style={{fontSize:12,color:"var(--text3)",marginBottom:18}}>2000 থেকে 2100 এর মধ্যে</div>
              <input autoFocus type="number" value={newYear} onChange={e=>{setNewYear(e.target.value);setYearExistsWarn(false);}} onKeyDown={e=>e.key==="Enter"&&addYear()} placeholder="যেমন: 2025"
                style={{width:"100%",background:"rgba(255,255,255,0.07)",border:`1px solid ${yearExistsWarn?"rgba(240,90,122,0.6)":"rgba(59,130,246,0.3)"}`,borderRadius:12,padding:"12px 16px",color:"var(--text1)",fontSize:16,outline:"none",boxSizing:"border-box",fontFamily:"'JetBrains Mono',monospace"}}/>
              {yearExistsWarn&&<div style={{marginTop:8,padding:"9px 12px",borderRadius:10,background:"rgba(240,90,122,0.1)",border:"1px solid rgba(240,90,122,0.25)",fontSize:12,color:"var(--red2)",display:"flex",alignItems:"center",gap:6}}><span>⚠️</span><span><strong style={{fontFamily:"'JetBrains Mono',monospace"}}>{newYear}</strong> সাল ইতিমধ্যে যোগ করা আছে!</span></div>}
              <div style={{display:"flex",gap:10,marginTop:16}}>
                <button onClick={()=>{setYearModal(false);setYearExistsWarn(false);setNewYear("");}} style={{flex:1,padding:"11px",borderRadius:12,border:"1px solid var(--border2)",background:"rgba(255,255,255,0.05)",color:"var(--text2)",cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"'Outfit',sans-serif"}}>বাতিল</button>
                <button onClick={addYear} style={{flex:1,padding:"11px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#1d4ed8,#2563eb)",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"'Outfit',sans-serif",boxShadow:"0 4px 16px rgba(37,99,235,0.4)"}}>যোগ করুন</button>
              </div>
            </div>
          </div>
        )}

        {deleteModal&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400,backdropFilter:"blur(6px)",animation:"fadeIn .2s ease"}} onClick={()=>setDeleteModal(false)}>
            <div className="modal-box" style={{background:"linear-gradient(145deg,#1a0d16,#0d1a2d)",border:"1px solid rgba(240,90,122,0.3)",borderRadius:20,padding:"26px",width:"min(300px,90vw)",boxShadow:"0 24px 80px rgba(0,0,0,0.7)"}} onClick={e=>e.stopPropagation()}>
              <div style={{fontSize:28,marginBottom:8}}>🗑</div>
              <div style={{fontSize:16,fontWeight:700,marginBottom:6}}>নিচের সালগুলো মুছবেন?</div>
              <div style={{maxHeight:160,overflowY:"auto",margin:"12px 0",borderRadius:10,background:"rgba(240,90,122,0.06)",border:"1px solid rgba(240,90,122,0.15)",padding:"8px 12px"}}>
                {selectedYears.sort((a,b)=>a-b).map(y=>(
                  <div key={y} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:700,color:"var(--red2)"}}>{y}</span>
                    <button onClick={()=>toggleSelectYear(y)} style={{fontSize:10,color:"var(--text3)",background:"none",border:"none",cursor:"pointer"}}>✕</button>
                  </div>
                ))}
              </div>
              <div style={{fontSize:12,color:"var(--text3)",marginBottom:20}}>এই সালগুলোর সব ডেটা স্থায়ীভাবে মুছে যাবে।</div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setDeleteModal(false)} style={{flex:1,padding:"11px",borderRadius:12,border:"1px solid var(--border2)",background:"rgba(255,255,255,0.05)",color:"var(--text2)",cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"'Outfit',sans-serif"}}>বাতিল</button>
                <button onClick={confirmDeleteYear} style={{flex:1,padding:"11px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#991b1b,#dc2626)",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"'Outfit',sans-serif",boxShadow:"0 4px 16px rgba(220,38,38,0.4)"}}>মুছুন ({selectedYears.length})</button>
              </div>
            </div>
          </div>
        )}

        {clearModal&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400,backdropFilter:"blur(6px)",animation:"fadeIn .2s ease"}} onClick={()=>setClearModal(false)}>
            <div className="modal-box" style={{background:"linear-gradient(145deg,#1a0d16,#0d1a2d)",border:"1px solid rgba(240,90,122,0.4)",borderRadius:20,padding:"26px",width:"min(300px,90vw)",boxShadow:"0 24px 80px rgba(0,0,0,0.7)"}} onClick={e=>e.stopPropagation()}>
              <div style={{fontSize:32,marginBottom:8}}>⚠️</div>
              <div style={{fontSize:16,fontWeight:700,marginBottom:8,color:"var(--red2)"}}>সম্পূর্ণ ইতিহাস মুছবেন?</div>
              <div style={{fontSize:13,color:"var(--text2)",marginBottom:22,lineHeight:1.7}}>সব বছরের সমস্ত ডেটা চিরতরে মুছে যাবে।</div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setClearModal(false)} style={{flex:1,padding:"11px",borderRadius:12,border:"1px solid var(--border2)",background:"rgba(255,255,255,0.05)",color:"var(--text2)",cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"'Outfit',sans-serif"}}>বাতিল</button>
                <button onClick={confirmClearAll} style={{flex:1,padding:"11px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#991b1b,#dc2626)",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"'Outfit',sans-serif",boxShadow:"0 4px 16px rgba(220,38,38,0.4)"}}>সব মুছুন</button>
              </div>
            </div>
          </div>
        )}

        {toast&&(
          <div style={{position:"fixed",bottom:32,left:"50%",transform:"translateX(-50%)",background:toast.type==="error"?"linear-gradient(135deg,#991b1b,#dc2626)":"linear-gradient(135deg,#065f46,#059669)",color:"#fff",padding:"11px 24px",borderRadius:24,fontSize:13,fontWeight:700,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",zIndex:500,whiteSpace:"nowrap",fontFamily:"'Outfit',sans-serif",animation:"toastIn .3s cubic-bezier(.34,1.56,.64,1)",border:`1px solid ${toast.type==="error"?"rgba(248,113,113,0.3)":"rgba(52,211,153,0.3)"}`}}>{toast.msg}</div>
        )}

      </div>
    </>
  );
}


const container = document.getElementById('app');
const root = ReactDOM.createRoot(container);
root.render(React.createElement(App));

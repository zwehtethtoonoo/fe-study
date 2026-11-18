if(typeof TOPICS==="undefined"||typeof QUESTIONS==="undefined"){document.querySelector("main").textContent="データファイル（topics.js / questions.js）が見つかりません。5つのファイルを同じフォルダに入れてください。";throw new Error("data files missing")}
const $=s=>document.querySelector(s);
const LS=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}};
const SV=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const CATS={t:"テクノロジ系",m:"マネジメント系",s:"ストラテジ系"};
const st=LS("fe_state")||{done:[],mark:[],cards:[
{a:"正規化",b:"ဒေတာထပ်နေမှုကို လျှော့ချရန် ဇယားခွဲခြင်း",n:"第1〜第3正規形"},
{a:"TCP",b:"ယုံကြည်စိတ်ချရသော connection အခြေပြု ဆက်သွယ်ရေး",n:"3ウェイハンドシェイク"}]};
const save=()=>SV("fe_state",st);
let cat="all",onlyMark=false,qi=0,right=0,answered=0,ci=0,flip=false;
function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
function toggle(arr,id){const i=arr.indexOf(id);i<0?arr.push(id):arr.splice(i,1);save()}
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{
  document.querySelectorAll("section").forEach(s=>s.hidden=s.id!==b.dataset.v);
  document.querySelectorAll("nav button").forEach(x=>x.classList.toggle("on",x===b))});
function chips(){const c=$("#chips");c.textContent="";
  [["all","すべて"],...Object.entries(CATS)].forEach(([k,v])=>{
    const b=el("button",k===cat?"on":"",v);b.onclick=()=>{cat=k;chips();topics()};c.appendChild(b)})}
function topics(){
  const g=$("#grid"),kw=$("#search").value.trim();g.textContent="";
  TOPICS.filter(t=>(cat==="all"||t.c===cat)&&(!onlyMark||st.mark.includes(t.id))&&(!kw||(t.ja+t.d+t.my).includes(kw))).forEach(t=>{
    const d=el("div","tc "+t.c+(st.done.includes(t.id)?" done":""));
    d.append(el("h3","",t.ja),el("span","cat",CATS[t.c]),el("p","",t.d),el("p","my",t.my));
    if(t.k){const dt=el("details");dt.appendChild(el("summary","","重要用語"));t.k.forEach(x=>dt.appendChild(el("p","kw",x[0]+"："+x[1])));d.appendChild(dt)}
    const r=el("div","row"),m=el("button","",st.mark.includes(t.id)?"★ 登録済み":"☆ ブックマーク"),
      k=el("button","",st.done.includes(t.id)?"学習済み ✓":"学習済みにする");
    m.onclick=()=>{toggle(st.mark,t.id);topics()};k.onclick=()=>{toggle(st.done,t.id);topics()};
    r.append(m,k);d.appendChild(r);g.appendChild(d)});
  if(!g.children.length)g.appendChild(el("p","prog","該当する分野がありません。"));
  $("#prog").textContent="学習の進み具合："+st.done.length+" / "+TOPICS.length+" 分野";}
$("#search").oninput=topics;
$("#markOnly").onclick=e=>{onlyMark=!onlyMark;e.target.classList.toggle("main",onlyMark);topics()};
function question(){
  const b=$("#qbox"),q=QUESTIONS[qi];b.textContent="";
  $("#score").textContent="第"+(qi+1)+"問 / 全"+QUESTIONS.length+"問　正解："+right+" / "+answered;
  b.appendChild(el("p","q",q.q));
  q.ch.forEach((c,i)=>{const x=el("button","ch",["ア","イ","ウ","エ"][i]+"　"+c);
    x.onclick=()=>{
      if(b.querySelector(".ex"))return;
      answered++;if(i===q.a)right++;
      b.querySelectorAll(".ch").forEach((y,j)=>{if(j===q.a)y.classList.add("ok");else if(j===i)y.classList.add("ng")});
      const ex=el("div","ex");ex.append(el("div","",(i===q.a?"正解です。":"不正解です。")+q.ja),el("div","my",q.my));
      const n=el("button","main",qi+1<QUESTIONS.length?"次の問題":"最初からやり直す");
      n.onclick=()=>{if(qi+1<QUESTIONS.length)qi++;else{qi=0;right=0;answered=0}question()};
      ex.appendChild(n);b.appendChild(ex);
      $("#score").textContent="第"+(qi+1)+"問 / 全"+QUESTIONS.length+"問　正解："+right+" / "+answered};
    b.appendChild(x)})}
function card(){
  const c=$("#card"),n=st.cards.length;c.textContent="";
  if(!n){c.appendChild(el("div","","カードがありません。左のフォームから追加してください。"));$("#pos").textContent="";return}
  if(ci>=n)ci=0;const k=st.cards[ci];
  c.append(el("div","",flip?k.b:k.a),el("small","",flip?(k.n||""):"クリックで裏面を表示"));
  $("#pos").textContent=(ci+1)+" / "+n+" 枚"}
const nextCard=()=>{if(st.cards.length){ci=(ci+1)%st.cards.length;flip=false;card()}};
$("#card").onclick=()=>{flip=!flip;card()};
$("#card").onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();flip=!flip;card()}};
$("#again").onclick=nextCard;$("#know").onclick=nextCard;
$("#del").onclick=()=>{if(st.cards.length){st.cards.splice(ci,1);save();flip=false;card()}};
$("#save").onclick=()=>{
  const a=$("#f1").value.trim(),b=$("#f2").value.trim(),n=$("#f3").value.trim();
  if(!a||!b){$("#err").textContent="表と裏の両方を入力してください。";return}
  $("#err").textContent="";st.cards.push({a,b,n});save();
  ["#f1","#f2","#f3"].forEach(s=>$(s).value="");ci=st.cards.length-1;flip=false;card()};
["#f1","#f2"].forEach(s=>$(s).oninput=()=>$("#err").textContent="");
$("#exp").onclick=()=>{const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([JSON.stringify(st.cards,null,1)],{type:"application/json"}));
  a.download="fe-flashcards.json";a.click()};
$("#imp").onclick=()=>$("#file").click();
$("#file").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();
  r.onload=()=>{try{const d=JSON.parse(r.result);if(!Array.isArray(d))throw 0;
    d.forEach(x=>{if(x&&x.a&&x.b)st.cards.push({a:String(x.a),b:String(x.b),n:String(x.n||"")})});save();card()}
    catch(_){$("#err").textContent="読み込めないファイルです。書き出したJSONを選んでください。"}};r.readAsText(f)};
chips();topics();question();card();

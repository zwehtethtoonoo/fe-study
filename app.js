if (typeof TOPICS === "undefined" || typeof QUESTIONS === "undefined") { document.querySelector("main").textContent = "データファイル（topics.js / questions.js）が見つかりません。5つのファイルを同じフォルダに入れてください。"; throw new Error("data files missing") }
const $ = s => document.querySelector(s);
const LS = k => { try { return JSON.parse(localStorage.getItem(k)) } catch (e) { return null } };
const SV = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) { } };
const CATS = { t: "テクノロジ系", m: "マネジメント系", s: "ストラテジ系" };
const st = LS("fe_state") || {
  done: [], mark: [], cards: [
    { a: "正規化", b: "ဒေတာထပ်နေမှုကို လျှော့ချရန် ဇယားခွဲခြင်း", n: "第1〜第3正規形" },
    { a: "TCP", b: "ယုံကြည်စိတ်ချရသော connection အခြေပြု ဆက်သွယ်ရေး", n: "3ウェイハンドシェイク" }]
};
const save = () => SV("fe_state", st);
let cat = "all", onlyMark = false, qi = 0, right = 0, answered = 0, ci = 0, flip = false;
const md = LS("fe_mode"); let mode = ["old", "new", "rnd"].includes(md) ? md : "old", seq = [], sp = 0;
function build(avoid) {
  const n = st.cards.length; seq = [...Array(n).keys()]; if (mode === "new") seq.reverse();
  if (mode === "rnd") {
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[seq[i], seq[j]] = [seq[j], seq[i]] }
    if (avoid !== undefined && n > 1 && seq[0] === avoid) { const j = 1 + Math.floor(Math.random() * (n - 1));[seq[0], seq[j]] = [seq[j], seq[0]] }
  }
  sp = 0; ci = seq[0] || 0
}
function el(tag, cls, txt) { const e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e }
function toggle(arr, id) { const i = arr.indexOf(id); i < 0 ? arr.push(id) : arr.splice(i, 1); save() }
document.querySelectorAll("nav button").forEach(b => b.onclick = () => {
  document.querySelectorAll("section").forEach(s => s.hidden = s.id !== b.dataset.v);
  document.querySelectorAll("nav button").forEach(x => x.classList.toggle("on", x === b))
});
function chips() {
  const c = $("#chips"); c.textContent = "";
  [["all", "すべて"], ...Object.entries(CATS)].forEach(([k, v]) => {
    const b = el("button", k === cat ? "on" : "", v); b.onclick = () => { cat = k; chips(); topics() }; c.appendChild(b)
  })
}
function topics() {
  const g = $("#grid"), kw = $("#search").value.trim(); g.textContent = "";
  TOPICS.filter(t => (cat === "all" || t.c === cat) && (!onlyMark || st.mark.includes(t.id)) && (!kw || (t.ja + t.d + t.my).includes(kw))).forEach(t => {
    const d = el("div", "tc " + t.c + (st.done.includes(t.id) ? " done" : ""));
    d.append(el("h3", "", t.ja), el("span", "cat", CATS[t.c]), el("p", "", t.d), el("p", "my", t.my));
    if (t.k) { const dt = el("details"); dt.appendChild(el("summary", "", "重要用語")); t.k.forEach(x => dt.appendChild(el("p", "kw", x[0] + "：" + x[1]))); d.appendChild(dt) }
    const r = el("div", "row"), m = el("button", "", st.mark.includes(t.id) ? "★ 登録済み" : "☆ ブックマーク"),
      k = el("button", "", st.done.includes(t.id) ? "学習済み ✓" : "学習済みにする");
    m.onclick = () => { toggle(st.mark, t.id); topics() }; k.onclick = () => { toggle(st.done, t.id); topics() };
    r.append(m, k); d.appendChild(r); g.appendChild(d)
  });
  if (!g.children.length) g.appendChild(el("p", "prog", "該当する分野がありません。"));
  $("#prog").textContent = "学習の進み具合：" + st.done.length + " / " + TOPICS.length + " 分野";
}
$("#search").oninput = topics;
$("#markOnly").onclick = e => { onlyMark = !onlyMark; e.target.classList.toggle("main", onlyMark); topics() };
function question() {
  const b = $("#qbox"), q = QUESTIONS[qi]; b.textContent = "";
  $("#score").textContent = "第" + (qi + 1) + "問 / 全" + QUESTIONS.length + "問　正解：" + right + " / " + answered;
  b.appendChild(el("p", "q", q.q));
  q.ch.forEach((c, i) => {
    const x = el("button", "ch", ["ア", "イ", "ウ", "エ"][i] + "　" + c);
    x.onclick = () => {
      if (b.querySelector(".ex")) return;
      answered++; if (i === q.a) right++;
      b.querySelectorAll(".ch").forEach((y, j) => { if (j === q.a) y.classList.add("ok"); else if (j === i) y.classList.add("ng") });
      const ex = el("div", "ex"); ex.append(el("div", "", (i === q.a ? "正解です。" : "不正解です。") + q.ja), el("div", "my", q.my));
      const n = el("button", "main", qi + 1 < QUESTIONS.length ? "次の問題" : "最初からやり直す");
      n.onclick = () => { if (qi + 1 < QUESTIONS.length) qi++; else { qi = 0; right = 0; answered = 0 } question() };
      ex.appendChild(n); b.appendChild(ex);
      $("#score").textContent = "第" + (qi + 1) + "問 / 全" + QUESTIONS.length + "問　正解：" + right + " / " + answered
    };
    b.appendChild(x)
  })
}
function card() {
  const c = $("#card"), n = st.cards.length; c.textContent = "";
  if (!n) { c.appendChild(el("div", "", "カードがありません。左のフォームから追加してください。")); $("#pos").textContent = ""; return }
  if (seq.length !== n) build(); if (sp >= n) sp = 0; ci = seq[sp]; const k = st.cards[ci];
  c.append(el("div", "", flip ? k.b : k.a), el("small", "", flip ? (k.n || "") : "クリックで裏面を表示"));
  $("#pos").textContent = (sp + 1) + " / " + n + " 枚"
}
const nextCard = () => { const n = st.cards.length; if (n) { sp++; if (sp >= n) build(ci); flip = false; card() } };
$("#card").onclick = () => { flip = !flip; card() };
$("#card").onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip = !flip; card() } };
$("#again").onclick = nextCard; $("#know").onclick = nextCard;
$("#del").onclick = () => { if (st.cards.length) { const d = ci, dc = st.cards[d]; st.cards.splice(d, 1); save(); seq = seq.filter(i => i !== d).map(i => i > d ? i - 1 : i); if (sp >= seq.length) sp = 0; flip = false; card() } };
$("#save").onclick = () => {
  const a = $("#f1").value.trim(), b = $("#f2").value.trim(), n = $("#f3").value.trim();
  if (!a || !b) { $("#err").textContent = "表と裏の両方を入力してください。"; return }
  $("#err").textContent = ""; const nc = { a, b, n }; st.cards.push(nc); save();
  ["#f1", "#f2", "#f3"].forEach(s => $(s).value = ""); build(); sp = seq.indexOf(st.cards.length - 1); flip = false; card()
};
["#f1", "#f2"].forEach(s => $(s).oninput = () => $("#err").textContent = "");
$("#exp").onclick = () => {
  const data = JSON.stringify({ cards: st.cards.map(c => ({ a: c.a, b: c.b, n: c.n || "" })), mark: st.mark, done: st.done }, null, 1);
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([data], { type: "application/json" })); a.download = "fe-study-backup.json"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000)
};
$("#imp").onclick = () => $("#file").click();
$("#file").onchange = e => {
  const f = e.target.files[0]; if (!f) return; const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result); const cs = Array.isArray(d) ? d : d.cards; if (!Array.isArray(cs)) throw 0;
      let add = 0, skip = 0;
      cs.forEach(x => {
        if (!x || !x.a || !x.b) return; const a = String(x.a).trim(), b = String(x.b).trim();
        if (st.cards.some(y => y.a === a && y.b === b)) skip++; else { st.cards.push({ a, b, n: String(x.n || "") }); add++ }
      });
      if (!Array.isArray(d)) ["mark", "done"].forEach(k => { (Array.isArray(d[k]) ? d[k] : []).forEach(v => { if (!st[k].includes(v)) st[k].push(v) }) });
      save(); seq = []; topics(); card(); popup("読み込みが完了しました：" + add + "枚を追加、" + skip + "枚は登録済みのためスキップ")
    }
    catch (_) { popup("読み込めないファイルです。書き出したJSONを選んでください。") }
    e.target.value = ""
  }; r.readAsText(f)
};
function popup(msg, btns) {
  const d = $("#pop"); $("#popmsg").textContent = msg; const r = $("#popbtns"); r.textContent = "";
  (btns || [["OK", "main"]]).forEach(([t, c, f]) => { const b = el("button", c, t); b.onclick = () => { d.close(); if (f) f() }; r.appendChild(b) }); d.showModal()
}
$("#delall").onclick = () => {
  const n = st.cards.length; if (!n) { popup("削除するカードがありません。"); return }
  popup("カード全 " + n + " 枚を削除します。\nブックマークと学習済みの記録は残ります。よろしいですか？",
    [["キャンセル", ""], ["全て削除", "danger", () => {
      SV("fe_trash", st.cards); st.cards = []; save(); seq = []; flip = false; card();
      popup(n + "枚のカードを削除しました。", [["元に戻す", "", () => { st.cards = LS("fe_trash") || []; save(); seq = []; flip = false; card(); popup("カードを元に戻しました。") }], ["OK", "main"]])
    }]])
};
$("#dedupe").onclick = () => {
  const seen = new Set(), keep = [];
  st.cards.forEach(c => { const k = c.a.trim() + "\u0000" + c.b.trim(); if (!seen.has(k)) { seen.add(k); keep.push(c) } });
  const n = st.cards.length - keep.length; if (!n) { popup("重複しているカードはありません。"); return }
  popup("重複しているカード " + n + " 枚を削除します（各カードの最初の1枚は残ります）。よろしいですか？",
    [["キャンセル", ""], ["重複を削除", "danger", () => {
      SV("fe_trash", st.cards); st.cards = keep; save(); seq = []; flip = false; card();
      popup(n + "枚の重複カードを削除しました。", [["元に戻す", "", () => { st.cards = LS("fe_trash") || []; save(); seq = []; flip = false; card(); popup("元に戻しました。") }], ["OK", "main"]])
    }]])
};
const ob = document.querySelectorAll("#order button");
function setOn() { ob.forEach(x => { const on = x.dataset.o === mode; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on) }) }
ob.forEach(b => b.onclick = () => { mode = b.dataset.o; SV("fe_mode", mode); setOn(); build(); flip = false; card() });
setOn(); chips(); topics(); question(); card();

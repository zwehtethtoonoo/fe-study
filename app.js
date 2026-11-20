
// データファイルの確認
// Check data files
if (typeof TOPICS === "undefined" || typeof QUESTIONS === "undefined") {
  document.querySelector("main").textContent = "データファイル（topics.js / questions.js）が見つかりません。5つのファイルを同じフォルダに入れてください。";
  throw new Error("data files missing");
}

// 共通の関数
// Helper functions
const $ = s => document.querySelector(s);

// 保存データを読み込む
// Load saved data
const LS = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };

// データを保存する
// Save data
const SV = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };

// 分野名を設定
// Set categories
const CATS = { t: "テクノロジ系", m: "マネジメント系", s: "ストラテジ系" };

// 学習データを準備
// Set study data
const st = LS("fe_state") || {
  done: [],
  mark: [],
  cards: [
    { a: "正規化", b: "ဒေတာထပ်နေမှုကို လျှော့ချရန် ဇယားခွဲခြင်း", n: "第1〜第3正規形" },
    { a: "TCP", b: "ယုံကြည်စိတ်ချရသော connection အခြေပြု ဆက်သွယ်ရေး", n: "3ウェイハンドシェイク" }
  ]
};

// 学習データを保存
// Save study data
const save = () => SV("fe_state", st);

// アプリの状態を管理
// Manage app state
let cat = "all", onlyMark = false, qi = 0, right = 0, answered = 0, ci = 0, flip = false;

// カードの表示順を設定
// Set card order
const md = LS("fe_mode");
let mode = ["old", "new", "rnd"].includes(md) ? md : "old", seq = [], sp = 0;

// カードの順番を作成
// Build card order
function build(avoid) {
  const n = st.cards.length;
  seq = [...Array(n).keys()];
  if (mode === "new") seq.reverse();

  // ランダムな順番に並べる
  // Shuffle cards
  if (mode === "rnd") {
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [seq[i], seq[j]] = [seq[j], seq[i]];
    }

    // 直前のカードを避ける
    // Avoid previous card
    if (avoid !== undefined && n > 1 && seq[0] === avoid) {
      const j = 1 + Math.floor(Math.random() * (n - 1));
      [seq[0], seq[j]] = [seq[j], seq[0]];
    }
  }
  sp = 0;
  ci = seq[0] || 0;
}

// HTML要素を作成
// Create HTML elements
function el(tag, cls, txt) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt !== undefined) e.textContent = txt;
  return e;
}

// 登録状態を切り替えて保存
// Toggle and save status
function toggle(arr, id) {
  const i = arr.indexOf(id);
  i < 0 ? arr.push(id) : arr.splice(i, 1);
  save();
}

// ナビゲーションで画面を切り替える
// Switch screens
document.querySelectorAll("nav button").forEach(b => b.onclick = () => {
  document.querySelectorAll("section").forEach(s => s.hidden = s.id !== b.dataset.v);
  document.querySelectorAll("nav button").forEach(x => x.classList.toggle("on", x === b));
});

// 分野ボタンを表示
// Show category buttons
function chips() {
  const c = $("#chips");
  c.textContent = "";
  [["all", "すべて"], ...Object.entries(CATS)].forEach(([k, v]) => {
    const b = el("button", k === cat ? "on" : "", v);
    b.onclick = () => { cat = k; chips(); topics(); };
    c.appendChild(b);
  });
}

// 分野一覧を表示・絞り込む
// Show and filter topics
function topics() {
  const g = $("#grid"), kw = $("#search").value.trim();
  g.textContent = "";

  TOPICS.filter(t =>
    (cat === "all" || t.c === cat) &&
    (!onlyMark || st.mark.includes(t.id)) &&
    (!kw || (t.ja + t.d + t.my).includes(kw))
  ).forEach(t => {
    const d = el("div", "tc " + t.c + (st.done.includes(t.id) ? " done" : ""));
    d.append(el("h3", "", t.ja), el("span", "cat", CATS[t.c]), el("p", "", t.d), el("p", "my", t.my));

    // 重要な用語を表示
    // Show key terms
    if (t.k) {
      const dt = el("details");
      dt.appendChild(el("summary", "", "重要用語"));
      t.k.forEach(x => dt.appendChild(el("p", "kw", x[0] + "：" + x[1])));
      d.appendChild(dt);
    }

    // ブックマークと学習済みボタンを作成
    // Create status buttons
    const r = el("div", "row");
    const m = el("button", "", st.mark.includes(t.id) ? "★ 登録済み" : "☆ ブックマーク");
    const k = el("button", "", st.done.includes(t.id) ? "学習済み ✓" : "学習済みにする");
    m.onclick = () => { toggle(st.mark, t.id); topics(); };
    k.onclick = () => { toggle(st.done, t.id); topics(); };
    r.append(m, k);
    d.appendChild(r);
    g.appendChild(d);
  });

  // 該当する分野がない場合
  // Show empty message
  if (!g.children.length) g.appendChild(el("p", "prog", "該当する分野がありません。"));

  // 学習の進み具合を表示
  // Show study progress
  $("#prog").textContent = "学習の進み具合：" + st.done.length + " / " + TOPICS.length + " 分野";
}

// 検索入力で一覧を更新
// Update topics on search
$("#search").oninput = topics;

// ブックマークだけを表示
// Show bookmarked topics only
$("#markOnly").onclick = e => { onlyMark = !onlyMark; e.target.classList.toggle("main", onlyMark); topics(); };

// 問題と選択肢を表示
// Show question and choices
function question() {
  const b = $("#qbox"), q = QUESTIONS[qi];
  b.textContent = "";
  $("#score").textContent = "第" + (qi + 1) + "問 / 全" + QUESTIONS.length + "問　正解：" + right + " / " + answered;
  b.appendChild(el("p", "q", q.q));

  // 選択肢ごとにボタンを作成
  // Create choice buttons
  q.ch.forEach((c, i) => {
    const x = el("button", "ch", ["ア", "イ", "ウ", "エ"][i] + "　" + c);
    x.onclick = () => {
      // 回答済みなら何もしない
      // Ignore repeated answers
      if (b.querySelector(".ex")) return;
      answered++;
      if (i === q.a) right++;

      // 正解と不正解を表示
      // Mark right and wrong answers
      b.querySelectorAll(".ch").forEach((y, j) => {
        if (j === q.a) y.classList.add("ok");
        else if (j === i) y.classList.add("ng");
      });

      // 解説を表示
      // Show explanation
      const ex = el("div", "ex");
      ex.append(el("div", "", (i === q.a ? "正解です。" : "不正解です。") + q.ja), el("div", "my", q.my));

      // 次の問題へ進むボタン
      // Create next question button
      const n = el("button", "main", qi + 1 < QUESTIONS.length ? "次の問題" : "最初からやり直す");
      n.onclick = () => {
        if (qi + 1 < QUESTIONS.length) qi++;
        else { qi = 0; right = 0; answered = 0; }
        question();
      };
      ex.appendChild(n);
      b.appendChild(ex);

      // 得点を更新
      // Update score
      $("#score").textContent = "第" + (qi + 1) + "問 / 全" + QUESTIONS.length + "問　正解：" + right + " / " + answered;
    };
    b.appendChild(x);
  });
}

// 単語カードを表示
// Show flashcard
function card() {
  const c = $("#card"), n = st.cards.length;
  c.textContent = "";

  // カードがない場合
  // Show empty message
  if (!n) {
    c.appendChild(el("div", "", "カードがありません。左のフォームから追加してください。"));
    $("#pos").textContent = "";
    return;
  }

  // 現在のカードを決める
  // Select current card
  if (seq.length !== n) build();
  if (sp >= n) sp = 0;
  ci = seq[sp];
  const k = st.cards[ci];

  // カードの表・裏を作成
  // Create card front and back
  const face = el("div", "", flip ? k.b : k.a);
  const note = el("small", "", flip ? (k.n || "") : "クリックで裏面を表示");

  // 改行とスペースをそのまま表示
  // Keep line breaks and spaces
  note.style.whiteSpace = "pre-wrap";
// カードの表示位置を設定
// Set card position
note.style.display = "block";
c.append(face, note);

// カードの位置を表示
// Show card position
$("#pos").textContent = (sp + 1) + " / " + n + " 枚";
}

// 次のカードへ進む
// Go to next card
const nextCard = () => {
  const n = st.cards.length;
  if (n) {
    sp++;
    if (sp >= n) build(ci);
    flip = false;
    card();
  }
};

// クリックしてカードを裏返す
// Flip card on click
$("#card").onclick = () => { flip = !flip; card(); };

// キーボードでもカードを裏返す
// Flip card with keyboard
$("#card").onkeydown = e => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    flip = !flip;
    card();
  }
};

// 次へ・覚えたボタンを設定
// Set next and learned buttons
$("#again").onclick = nextCard;
$("#know").onclick = nextCard;

// 現在のカードを削除
// Delete current card
$("#del").onclick = () => {
  if (st.cards.length) {
    const d = ci;
    st.cards.splice(d, 1);
    save();

    // 削除後に順番を調整
    // Fix order after deletion
    seq = seq.filter(i => i !== d).map(i => i > d ? i - 1 : i);
    if (sp >= seq.length) sp = 0;
    flip = false;
    card();
  }
};

// フォームからカードを追加して保存
// Add and save card
$("#save").onclick = () => {
  const a = $("#f1").value.trim();
  const b = $("#f2").value.trim();

  // メモの改行とスペースを保持
  // Keep note formatting
  const n = $("#f3").value;

  // 表と裏の入力を確認
  // Check front and back
  if (!a || !b) {
    $("#err").textContent = "表と裏の両方を入力してください。";
    return;
  }

  $("#err").textContent = "";
  const nc = { a, b, n };

  // カードを保存
  // Save card
  st.cards.push(nc);
  save();

  // 入力欄を空にする
  // Clear input fields
  ["#f1", "#f2", "#f3"].forEach(s => $(s).value = "");

  // 追加したカードを表示
  // Show new card
  build();
  sp = seq.indexOf(st.cards.length - 1);
  flip = false;
  card();
};

// 入力時にエラーを消す
// Clear error while typing
["#f1", "#f2"].forEach(s => $(s).oninput = () => $("#err").textContent = "");

// カードをJSONファイルに書き出す
// Export cards to JSON
$("#exp").onclick = () => {
  const data = JSON.stringify({
    cards: st.cards.map(c => ({ a: c.a, b: c.b, n: c.n || "" })),
    mark: st.mark,
    done: st.done
  }, null, 1);

  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([data], { type: "application/json" }));
  a.download = "fe-study-backup.json";
  a.click();

  // ダウンロード用URLを解放
  // Release download URL
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

// 読み込みボタンでファイル選択を開く
// Open file picker
$("#imp").onclick = () => $("#file").click();

// JSONファイルを読み込む
// Import JSON file
$("#file").onchange = e => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();

  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      const cs = Array.isArray(d) ? d : d.cards;
      if (!Array.isArray(cs)) throw 0;

      let add = 0, skip = 0;

      // カードを追加し、重複を確認
      // Add cards and check duplicates
      cs.forEach(x => {
        if (!x || !x.a || !x.b) return;
        const a = String(x.a).trim(), b = String(x.b).trim();

        if (st.cards.some(y => y.a === a && y.b === b)) {
          skip++;
        } else {
          // メモの改行を保持して保存
          // Keep note line breaks
          st.cards.push({ a, b, n: String(x.n || "") });
          add++;
        }
      });

      // ブックマークと学習記録を追加
      // Import study progress
      if (!Array.isArray(d)) {
        ["mark", "done"].forEach(k => {
          (Array.isArray(d[k]) ? d[k] : []).forEach(v => {
            if (!st[k].includes(v)) st[k].push(v);
          });
        });
      }

      // 保存して画面を更新
      // Save and refresh screen
      save();
      seq = [];
      topics();
      card();
      popup("読み込みが完了しました：" + add + "枚を追加、" + skip + "枚は登録済みのためスキップ");
    } catch (_) {
      popup("読み込めないファイルです。書き出したJSONを選んでください。");
    }

    // 同じファイルを再度選べるようにする
    // Allow same file selection again
    e.target.value = "";
  };
  r.readAsText(f);
};

// ポップアップを表示
// Show popup

// ポップアップを表示
// Show popup
function popup(msg, btns) {
  const d = $("#pop");
  $("#popmsg").textContent = msg;
  const r = $("#popbtns");
  r.textContent = "";

  (btns || [["OK", "main"]]).forEach(([t, c, f]) => {
    const b = el("button", c, t);
    b.onclick = () => { d.close(); if (f) f(); };
    r.appendChild(b);
  });
  d.showModal();
}

// すべてのカードを削除
// Delete all cards
$("#delall").onclick = () => {
  const n = st.cards.length;
  if (!n) { popup("削除するカードがありません。"); return; }

  popup("カード全 " + n + " 枚を削除します。\nブックマークと学習済みの記録は残ります。よろしいですか？",
    [
      ["キャンセル", ""],
      ["全て削除", "danger", () => {
        // 削除前のカードを一時保存
        // Temporarily save deleted cards
        SV("fe_trash", st.cards);
        st.cards = [];
        save();
        seq = [];
        flip = false;
        card();

        // 削除したカードを元に戻す
        // Restore deleted cards
        popup(n + "枚のカードを削除しました。", [
          ["元に戻す", "", () => {
            st.cards = LS("fe_trash") || [];
            save();
            seq = [];
            flip = false;
            card();
            popup("カードを元に戻しました。");
          }],
          ["OK", "main"]
        ]);
      }]
    ]
  );
};

// 重複しているカードを削除
// Remove duplicate cards
$("#dedupe").onclick = () => {
  const seen = new Set(), keep = [];

  // 最初のカードだけを残す
  // Keep first copy
  st.cards.forEach(c => {
    const k = c.a.trim() + "\u0000" + c.b.trim();
    if (!seen.has(k)) { seen.add(k); keep.push(c); }
  });

  const n = st.cards.length - keep.length;
  if (!n) { popup("重複しているカードはありません。"); return; }

  popup("重複しているカード " + n + " 枚を削除します（各カードの最初の1枚は残ります）。よろしいですか？",
    [
      ["キャンセル", ""],
      ["重複を削除", "danger", () => {
        // 削除前のカードを一時保存
        // Temporarily save cards
        SV("fe_trash", st.cards);
        st.cards = keep;
        save();
        seq = [];
        flip = false;
        card();

        // 削除したカードを元に戻す
        // Restore deleted cards
        popup(n + "枚の重複カードを削除しました。", [
          ["元に戻す", "", () => {
            st.cards = LS("fe_trash") || [];
            save();
            seq = [];
            flip = false;
            card();
            popup("元に戻しました。");
          }],
          ["OK", "main"]
        ]);
      }]
    ]
  );
};

// カードの順番ボタンを設定
// Set card order buttons
const ob = document.querySelectorAll("#order button");

// 選択中の順番を表示
// Show selected order
function setOn() {
  ob.forEach(x => {
    const on = x.dataset.o === mode;
    x.classList.toggle("on", on);
    x.setAttribute("aria-pressed", on);
  });
}

// カードの順番を変更
// Change card order
ob.forEach(b => b.onclick = () => {
  mode = b.dataset.o;
  SV("fe_mode", mode);
  setOn();
  build();
  flip = false;
  card();
});

// 初期画面を表示
// Initialize app
setOn();
chips();
topics();
question();
card();


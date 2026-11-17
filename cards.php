<?php
require __DIR__ . '/lib.php'; need_login();
function ids($mode) {
  $a = array_map('intval', array_column(q('SELECT id FROM study_cards ORDER BY id')->fetchAll(), 'id'));
  if ($mode === 'new') $a = array_reverse($a);
  if ($mode === 'rnd') shuffle($a);
  return $a;
}
$want = (string)($_GET['order'] ?? ''); if (!in_array($want, ['old', 'new', 'rnd'], true)) $want = '';
$mode = $want ?: (setting('order') ?: 'old'); if (!in_array($mode, ['old', 'new', 'rnd'], true)) $mode = 'old';
if ($want && $want !== setting('order')) put('order', $want);
if (($_SESSION['mode'] ?? '') !== $mode) { $_SESSION['seq'] = ids($mode); $_SESSION['pos'] = 0; $_SESSION['mode'] = $mode; }
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $want === '' && !isset($_GET['go'])) { header('Location: cards.php?order=' . $mode); exit; }
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $do = $_POST['do'] ?? '';
  if ($do === 'add') {
    $a = mb_substr(trim((string)($_POST['a'] ?? '')), 0, 255); $b = mb_substr(trim((string)($_POST['b'] ?? '')), 0, 1000); $n = mb_substr(trim((string)($_POST['n'] ?? '')), 0, 5000);
    if ($a === '' || $b === '') $_SESSION['msg'] = '表と裏の両方を入力してください。';
    else { q('INSERT INTO study_cards (front,back,note) VALUES (?,?,?)', [$a, $b, $n]); $id = last_id(); $_SESSION['seq'] = ids($mode); $_SESSION['pos'] = (int)array_search($id, $_SESSION['seq']); }
  } elseif ($do === 'del') {
    $id = (int)($_POST['id'] ?? 0); q('DELETE FROM study_cards WHERE id=?', [$id]);
    $_SESSION['seq'] = array_values(array_diff($_SESSION['seq'] ?? [], [$id]));
  } elseif ($do === 'import') {
    $f = $_FILES['f'] ?? null;
    if ($f && $f['error'] === UPLOAD_ERR_OK && $f['size'] < 2000000) {
      $d = json_decode(file_get_contents($f['tmp_name']), true);
      if (is_array($d)) { $cnt = import_data($d); unset($_SESSION['seq']); $_SESSION['pop'] = '読み込みが完了しました（' . $cnt . '枚を追加）'; } else $_SESSION['msg'] = '読み込めないファイルです。書き出したJSONを選んでください。';
    } else $_SESSION['msg'] = 'ファイルを選んでください。';
  }
  header('Location: cards.php?order=' . $mode); exit;
}
$total = (int)q('SELECT COUNT(*) c FROM study_cards')->fetch()['c'];
$seq = $_SESSION['seq'] ?? null;
if (!is_array($seq) || count($seq) !== $total) { $seq = ids($mode); $pos = 0; } else $pos = (int)($_SESSION['pos'] ?? 0);
$go = $_GET['go'] ?? '';
if ($total && $go === 'next') {
  $last = $seq[$pos] ?? 0; $pos++;
  if ($pos >= $total) {
    $seq = ids($mode);
    if ($mode === 'rnd' && $total > 1 && $seq[0] === $last) { $j = random_int(1, $total - 1); [$seq[0], $seq[$j]] = [$seq[$j], $seq[0]]; }
    $pos = 0;
  }
}
if ($total && $go === 'prev') $pos = max(0, $pos - 1);
if ($pos >= $total) $pos = 0;
$card = $total ? q('SELECT * FROM study_cards WHERE id=?', [$seq[$pos]])->fetch() : null;
if ($total && !$card) { $seq = ids($mode); $pos = 0; $card = q('SELECT * FROM study_cards WHERE id=?', [$seq[0]])->fetch(); }
$_SESSION['seq'] = $seq; $_SESSION['pos'] = $pos;
if ($go) { header('Location: cards.php?order=' . $mode); exit; }
$msg = $_SESSION['msg'] ?? ''; unset($_SESSION['msg']);
$pop = $_SESSION['pop'] ?? ''; unset($_SESSION['pop']);
top('cards.php');
?>
<div class="two">
<div class="box"><h2>ノートを書く</h2>
<form method="post"><?= csrf() ?><input type="hidden" name="do" value="add">
<input name="a" maxlength="255" placeholder="表：用語（日本語）"><input name="b" maxlength="1000" placeholder="裏：意味（日本語またはミャンマー語）">
<textarea name="n" rows="3" placeholder="メモ（任意）"></textarea><button class="main">カードを保存</button></form>
<p class="err"><?= h($msg) ?></p>
<div class="row"><a class="btn" href="export.php" onclick="feExport(event)">書き出す</a>
<form method="post" enctype="multipart/form-data"><?= csrf() ?><input type="hidden" name="do" value="import">
<label class="btn">読み込む<input type="file" name="f" accept=".json" hidden onchange="this.form.submit()"></label></form></div></div>
<div>
<div class="posbar"><p class="prog"><?= $total ? ($pos + 1) . ' / ' . $total . ' 枚' : '' ?></p>
<form method="get" class="seg">
<?php foreach (['old' => '古い順', 'new' => '新しい順', 'rnd' => 'ランダム'] as $k => $l) echo '<button name="order" value="' . $k . '"' . ($k === $mode ? ' class="on"' : '') . '>' . $l . '</button>'; ?></form></div>
<div class="fc">
<?php if ($card): ?><div><?= nl2br(h($card['front'])) ?></div>
<details><summary>答えを見る</summary><div class="back"><?= nl2br(h($card['back'])) ?></div><small><?= nl2br(h($card['note'])) ?></small></details>
<?php else: ?><div>カードがありません。左のフォームから追加してください。</div><?php endif; ?></div>
<?php if ($card): ?><div class="row"><a class="btn" href="cards.php?order=<?= $mode ?>&amp;go=prev">前へ</a><a class="btn main" href="cards.php?order=<?= $mode ?>&amp;go=next">次へ</a>
<form method="post" onsubmit="return confirm('このカードを削除しますか？')"><?= csrf() ?><input type="hidden" name="do" value="del"><input type="hidden" name="id" value="<?= (int)$card['id'] ?>"><button>削除</button></form></div><?php endif; ?>
</div></div>
<?php if ($pop) echo '<dialog open class="pop"><p>' . h($pop) . '</p><form method="dialog"><button class="main">OK</button></form></dialog>'; ?>
<dialog id="expdone" class="pop"><p id="exptext"></p><form method="dialog"><button class="main">OK</button></form></dialog>
<script>
function feShow(t) { document.getElementById('exptext').textContent = t; document.getElementById('expdone').showModal(); }
async function feExport(e) {
  if (!window.showSaveFilePicker) {
    var n = 0, t = setInterval(function () {
      if (document.cookie.indexOf('fe_dl=1') > -1) { clearInterval(t); document.cookie = 'fe_dl=; max-age=0; path=<?= BASE ?>'; feShow('書き出しを開始しました。ダウンロードを確認してください。'); }
      else if (++n > 40) clearInterval(t);
    }, 250);
    return;
  }
  e.preventDefault();
  try {
    var h = await showSaveFilePicker({ suggestedName: 'fe-study-backup.json', types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }] });
    var r = await fetch('export.php');
    if (!r.ok) throw new Error('http ' + r.status);
    var w = await h.createWritable(); await w.write(await r.blob()); await w.close();
    feShow('書き出しが完了しました');
  } catch (err) { if (!err || err.name !== 'AbortError') feShow('書き出しに失敗しました'); }
}
</script>
<?php bottom();

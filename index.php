<?php
require __DIR__ . '/lib.php'; need_login();
$CATS = ['t' => 'テクノロジ系', 'm' => 'マネジメント系', 's' => 'ストラテジ系'];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $id = (string)($_POST['id'] ?? ''); $f = ($_POST['do'] ?? '') === 'mark' ? 'mark' : 'done';
  if (q('SELECT 1 FROM topics WHERE id=?', [$id])->fetch())
    q("INSERT INTO progress (topic_id,$f) VALUES (?,1) ON DUPLICATE KEY UPDATE $f=1-$f", [$id]);
  header('Location: ' . $_SERVER['REQUEST_URI']); exit;
}
$c = (string)($_GET['c'] ?? ''); $s = trim((string)($_GET['s'] ?? '')); $b = isset($_GET['b']) ? 1 : 0;
$rows = q("SELECT t.*, COALESCE(p.done,0) done, COALESCE(p.mark,0) mark FROM topics t LEFT JOIN progress p ON p.topic_id=t.id
  WHERE (?='' OR t.cat=?) AND (?='' OR CONCAT(t.title,t.summary,t.summary_my) LIKE ?) AND (?=0 OR p.mark=1) ORDER BY t.sort",
  [$c, $c, $s, "%$s%", $b])->fetchAll();
$T = []; foreach (q('SELECT * FROM terms ORDER BY id')->fetchAll() as $r) $T[$r['topic_id']][] = $r;
$total = (int)q('SELECT COUNT(*) c FROM topics')->fetch()['c'];
$done = (int)q('SELECT COUNT(*) c FROM progress WHERE done=1')->fetch()['c'];
top('index.php');
?>
<form method="get" class="bar"><input name="s" value="<?= h($s) ?>" placeholder="用語を検索（例：正規化）"><input type="hidden" name="c" value="<?= h($c) ?>">
<label style="white-space:nowrap"><input type="checkbox" name="b" value="1"<?= $b ? ' checked' : '' ?>> ★のみ</label><button>検索</button></form>
<div class="chips">
<?php foreach (['' => 'すべて'] + $CATS as $k => $l) echo '<a class="chip' . ($c === (string)$k ? ' on' : '') . '" href="?' . h(http_build_query(array_filter(['c' => $k, 's' => $s, 'b' => $b ?: '']))) . '">' . $l . '</a>'; ?>
</div>
<p class="prog">学習の進み具合：<?= $done ?> / <?= $total ?> 分野</p>
<div class="grid">
<?php foreach ($rows as $t): ?>
<div class="tc <?= h($t['cat']) ?><?= $t['done'] ? ' done' : '' ?>">
  <h3><?= h($t['title']) ?></h3><span class="cat"><?= h($CATS[$t['cat']] ?? '') ?></span>
  <p><?= h($t['summary']) ?></p><p class="my"><?= h($t['summary_my']) ?></p>
  <?php if (!empty($T[$t['id']])): ?><details><summary>重要用語</summary>
  <?php foreach ($T[$t['id']] as $r) echo '<p class="kw">' . h($r['term']) . '：' . h($r['meaning_my']) . '</p>'; ?></details><?php endif; ?>
  <div class="row">
  <?php foreach (['mark' => [$t['mark'], '★ 登録済み', '☆ ブックマーク'], 'done' => [$t['done'], '学習済み ✓', '学習済みにする']] as $do => $x): ?>
    <form method="post"><?= csrf() ?><input type="hidden" name="id" value="<?= h($t['id']) ?>"><input type="hidden" name="do" value="<?= $do ?>"><button><?= $x[0] ? $x[1] : $x[2] ?></button></form>
  <?php endforeach; ?>
  </div>
</div>
<?php endforeach; if (!$rows) echo '<p class="prog">該当する分野がありません。</p>'; ?>
</div>
<?php bottom();

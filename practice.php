<?php
require __DIR__ . '/lib.php'; need_login();
$Q = q('SELECT * FROM questions ORDER BY sort,id')->fetchAll(); $N = count($Q);
if (isset($_GET['reset'])) { unset($_SESSION['sc']); header('Location: practice.php'); exit; }
if (!isset($_SESSION['sc'])) $_SESSION['sc'] = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $i = (int)($_POST['n'] ?? 0);
  if (isset($Q[$i]) && !isset($_SESSION['sc'][$Q[$i]['id']])) $_SESSION['sc'][$Q[$i]['id']] = (int)($_POST['c'] ?? -1);
  header('Location: practice.php?n=' . $i); exit;
}
top('practice.php');
if (!$N) { echo '<p class="prog">問題がありません。</p>'; bottom(); exit; }
$n = max(0, min((int)($_GET['n'] ?? 0), $N - 1)); $x = $Q[$n]; $sc = $_SESSION['sc']; $ans = $sc[$x['id']] ?? null; $right = 0;
foreach ($Q as $r) if (isset($sc[$r['id']]) && $sc[$r['id']] === (int)$r['answer']) $right++;
$mark = ['ア', 'イ', 'ウ', 'エ']; $ch = [$x['c1'], $x['c2'], $x['c3'], $x['c4']];
?>
<p class="prog">第<?= $n + 1 ?>問 / 全<?= $N ?>問　正解：<?= $right ?> / <?= count($sc) ?></p>
<div class="box"><p class="q"><?= h($x['body']) ?></p>
<?php if ($ans === null): ?>
<form method="post"><?= csrf() ?><input type="hidden" name="n" value="<?= $n ?>">
<?php foreach ($ch as $i => $t) echo '<button class="ch" name="c" value="' . $i . '">' . $mark[$i] . '　' . h($t) . '</button>'; ?></form>
<?php else:
  foreach ($ch as $i => $t) echo '<div class="ch' . ($i === (int)$x['answer'] ? ' ok' : ($i === $ans ? ' ng' : '')) . '">' . $mark[$i] . '　' . h($t) . '</div>'; ?>
<div class="ex"><div><?= $ans === (int)$x['answer'] ? '正解です。' : '不正解です。' ?><?= h($x['explain_ja']) ?></div><div class="my"><?= h($x['explain_my']) ?></div>
<p><a class="btn main" href="<?= $n + 1 < $N ? 'practice.php?n=' . ($n + 1) : 'practice.php?reset=1' ?>"><?= $n + 1 < $N ? '次の問題' : '最初からやり直す' ?></a></p></div>
<?php endif; ?></div>
<?php bottom();

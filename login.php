<?php
require __DIR__ . '/lib.php';
$set = setting('passcode'); $err = '';
if (isset($_SESSION['ok'])) { header('Location: index.php'); exit; }
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  if (!csrf_ok()) { http_response_code(400); exit('不正なリクエストです。'); }
  $p = (string)($_POST['p'] ?? '');
  if (!$set) {
    if (mb_strlen($p) < 10) $err = 'パスコードは10文字以上にしてください。';
    elseif ($p !== (string)($_POST['p2'] ?? '')) $err = '確認用のパスコードが一致しません。';
    else { put('passcode', password_hash($p, PASSWORD_DEFAULT)); login_user(); header('Location: index.php'); exit; }
  } elseif (password_verify($p, $set)) { login_user(); header('Location: index.php'); exit; }
  else { sleep(2); $err = 'パスコードが違います。'; }
}
?><!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ログイン</title><link rel="stylesheet" href="style.css"></head>
<body><main><div class="box" style="max-width:420px;margin:40px auto">
<h2><?= $set ? 'ログイン' : 'パスコードを設定' ?></h2>
<?php if (!$set): ?><p class="prog">最初の1回だけ設定します。10文字以上で、他では使っていないものにしてください。</p><?php endif; ?>
<form method="post"><?= csrf() ?>
<input type="password" name="p" placeholder="パスコード" autocomplete="<?= $set ? 'current-password' : 'new-password' ?>" required>
<?php if (!$set): ?><input type="password" name="p2" placeholder="パスコード（確認）" autocomplete="new-password" required><?php endif; ?>
<button class="main"><?= $set ? 'ログイン' : '設定してはじめる' ?></button></form>
<p class="err"><?= h($err) ?></p></div></main></body></html>

<?php
require __DIR__ . '/lib.php';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && csrf_ok()) {
  $t = $_COOKIE['fe_rt'] ?? '';
  if ($t) q('DELETE FROM auth_tokens WHERE token_hash=?', [hash('sha256', $t)]);
  setcookie('fe_rt', '', cookie_opts(1));
  $_SESSION = []; session_destroy();
}
header('Location: login.php');

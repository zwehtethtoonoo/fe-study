<?php
require __DIR__ . '/config.php';
define('BASE', rtrim(dirname($_SERVER['SCRIPT_NAME']), '/') . '/');
$https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
session_set_cookie_params(['lifetime' => 0, 'path' => BASE, 'secure' => $https, 'httponly' => true, 'samesite' => 'Lax']);
session_start();
$pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS, [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]);

function h($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
function q($sql, $p = []) { global $pdo; $s = $pdo->prepare($sql); $s->execute($p); return $s; }
function last_id() { global $pdo; return (int)$pdo->lastInsertId(); }
function setting($n) { $r = q('SELECT val FROM settings WHERE name=?', [$n])->fetch(); return $r ? $r['val'] : null; }
function put($n, $v) { q('REPLACE INTO settings (name,val) VALUES (?,?)', [$n, $v]); }
function csrf() { if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16)); return '<input type="hidden" name="csrf" value="' . $_SESSION['csrf'] . '">'; }
function csrf_ok() { return hash_equals($_SESSION['csrf'] ?? 'x', $_POST['csrf'] ?? ''); }
// No login: this only protects the POST forms against cross-site requests.
function need_login() {
  if ($_SERVER['REQUEST_METHOD'] === 'POST' && !csrf_ok()) { http_response_code(400); exit('不正なリクエストです。'); }
}
function top($active) {
  echo '<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>基本情報技術者試験 学習サイト</title><link rel="stylesheet" href="style.css"></head><body><header><h1>基本情報技術者試験 <small>FE</small></h1><nav>';
  foreach (['index.php' => '分野', 'practice.php' => '練習問題', 'cards.php' => 'フラッシュカード'] as $u => $l)
    echo '<a href="' . $u . '"' . ($u === $active ? ' class="on"' : '') . '>' . $l . '</a>';
  echo '</nav></header><main>';
}
function bottom() { echo '</main></body></html>'; }
function import_data($d) {
  $cs = (is_array($d) && isset($d['cards'])) ? $d['cards'] : $d;
  if (!is_array($cs)) return 0;
  $added = 0;
  foreach (array_slice($cs, 0, 2000) as $c) {
    if (!is_array($c)) continue;
    $a = mb_substr(trim((string)($c['a'] ?? '')), 0, 255); $b = mb_substr(trim((string)($c['b'] ?? '')), 0, 1000); $n = mb_substr(trim((string)($c['n'] ?? '')), 0, 5000);
    if ($a === '' || $b === '') continue;
    if (!q('SELECT 1 FROM study_cards WHERE front=? AND back=?', [$a, $b])->fetch()) { q('INSERT INTO study_cards (front,back,note) VALUES (?,?,?)', [$a, $b, $n]); $added++; }
  }
  foreach (['done', 'mark'] as $f) foreach ((array)($d[$f] ?? []) as $id)
    if (is_string($id) && q('SELECT 1 FROM topics WHERE id=?', [$id])->fetch())
      q("INSERT INTO progress (topic_id,$f) VALUES (?,1) ON DUPLICATE KEY UPDATE $f=1", [$id]);
  return $added;
}

<?php
header('Content-Type: application/json; charset=utf-8');
function out($d, $c = 200) { http_response_code($c); echo json_encode($d, JSON_UNESCAPED_UNICODE); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(['error' => 'POST only'], 405);
$owner = $_SERVER['HTTP_X_SYNC_CODE'] ?? '';
if (!preg_match('/^[A-Za-z0-9_-]{16,64}$/', $owner)) out(['error' => 'bad sync code'], 400);
$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) out(['error' => 'bad json'], 400);

function addCard($pdo, $owner, $c) {
  $a = mb_substr(trim((string)($c['a'] ?? '')), 0, 255);
  $b = mb_substr(trim((string)($c['b'] ?? '')), 0, 1000);
  $n = mb_substr(trim((string)($c['n'] ?? '')), 0, 5000);
  if ($a === '' || $b === '') return null;
  $q = $pdo->prepare('SELECT id FROM cards WHERE owner=? AND front=? AND back=? LIMIT 1');
  $q->execute([$owner, $a, $b]);
  if ($r = $q->fetch()) return (int)$r['id'];
  $pdo->prepare('INSERT INTO cards (owner, front, back, note) VALUES (?,?,?,?)')->execute([$owner, $a, $b, $n]);
  return (int)$pdo->lastInsertId();
}

try {
  require __DIR__ . '/config.php';
  switch ($in['action'] ?? '') {
    case 'list':
      $q = $pdo->prepare('SELECT id, front AS a, back AS b, note AS n FROM cards WHERE owner=? ORDER BY id');
      $q->execute([$owner]);
      out(['cards' => $q->fetchAll()]);
    case 'add':
      $id = addCard($pdo, $owner, $in);
      if ($id === null) out(['error' => 'empty card'], 400);
      out(['id' => $id]);
    case 'delete':
      $pdo->prepare('DELETE FROM cards WHERE id=? AND owner=?')->execute([(int)($in['id'] ?? 0), $owner]);
      out(['ok' => true]);
    case 'import':
      $list = array_slice(is_array($in['cards'] ?? null) ? $in['cards'] : [], 0, 1000);
      $n = 0;
      foreach ($list as $c) { if (is_array($c) && addCard($pdo, $owner, $c) !== null) $n++; }
      out(['processed' => $n]);
    default:
      out(['error' => 'unknown action'], 400);
  }
} catch (PDOException $e) {
  out(['error' => 'database error'], 500);
}

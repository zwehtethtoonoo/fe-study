<?php
require __DIR__ . '/lib.php'; need_login();
$pr = q('SELECT topic_id,done,mark FROM progress')->fetchAll();
$out = ['cards' => q('SELECT front AS a, back AS b, note AS n FROM study_cards ORDER BY id')->fetchAll(),
  'done' => array_values(array_column(array_filter($pr, fn($r) => $r['done']), 'topic_id')),
  'mark' => array_values(array_column(array_filter($pr, fn($r) => $r['mark']), 'topic_id'))];
setcookie('fe_dl', '1', ['expires' => time() + 60, 'path' => BASE, 'samesite' => 'Lax']);
header('Content-Type: application/json; charset=utf-8');
header('Content-Disposition: attachment; filename="fe-study-backup.json"');
echo json_encode($out, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

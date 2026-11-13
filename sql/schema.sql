-- Run once with an account that can create databases and users (not studb).
CREATE USER 'fe-study-user' IDENTIFIED BY 'pass';
-- DB作成
CREATE DATABASE IF NOT EXISTS fe_study CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- DBを操作するすべての権限を与える
GRANT ALL ON fe_study.* TO 'fe-study-user';
SHOW GRANTS FOR 'fe-study-user';
-- 使用するDBに移動する

USE fe_study;
CREATE TABLE IF NOT EXISTS cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner VARCHAR(64) NOT NULL,
  front VARCHAR(255) COLLATE utf8mb4_bin NOT NULL,
  back VARCHAR(1000) COLLATE utf8mb4_bin NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (owner)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 作成したテーブルの確認
SHOW TABLES;

-- 作成したテーブルのカラムを確認する
SHOW COLUMNS FROM cards;

-- 挿入できたか確認
SELECT * FROM cards;
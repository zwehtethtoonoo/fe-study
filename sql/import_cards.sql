-- Imports 40 flashcards into fe_study.cards. Safe to run more than once (skips cards already stored for the same sync code).
-- Run from the mysql client:  USE fe_study;  then  source C:/Sites/Fe-study/fe-study/import_cards.sql
SET NAMES utf8mb4;
USE fe_study;
-- Replace with the sync code shown in the box on the flashcards page (16-64 letters, digits, _ or -).
SET @owner = 'festudy-2026';

INSERT INTO cards (owner, front, back, note)
SELECT @owner, t.front, t.back, t.note
FROM (
SELECT 'API' AS front, 'アプリケーションからOSが用意する各種機能' AS back, 'အက်ပ်လီကေးရှင်းများ အသုံးပြုနိုင်ရန် OS (Operating System) မှ ပံ့ပိုးပေးထားသော လုပ်ဆောင်ချက်အမျိုးမျိုး' AS note
UNION ALL
SELECT 'スプリントプランニング (Sprint Planning)' AS front, 'スプリントの開始ミーティング。プロダクトバックログから作業範囲を決定し、計画を立てる。' AS back, 'စပရင်တစ်ခု စတင်ရန် ပြုလုပ်သော အစည်းအဝေးဖြစ်ပြီး၊ ပရိုဂျက်ဘက်လော့ဂ်ထဲမှ လုပ်ဆောင်ရမည့် လုပ်ငန်းများကို ရွေးချယ်ကာ အစီအစဉ်ဆွဲခြင်း ဖြစ်သည်။' AS note
UNION ALL
SELECT 'デイリースクラム (Daily Scrum)' AS front, '10〜15分程度のチーム共有会。昨日やったこと、今日やること、障害を各自が話し、調整を行う。' AS back, 'နေ့စဉ် ၁၀-၁၅ မိနစ်ခန့် အလုပ်အကိုင် အခြေအနေနှင့် အခက်အခဲများကို ညှိနှိုင်းခြင်း။' AS note
UNION ALL
SELECT 'スプリントレビュー (Sprint Review)' AS front, 'スプリント終了時の成果確認。ステークホルダーに成果物をプレゼンし、進捗を話し合う' AS back, 'ရလဒ်များကို စစ်ဆေးတင်ပြပြီး တိုးတက်မှုကို ဆွေးနွေးခြင်း' AS note
UNION ALL
SELECT 'スプリントレトロスペクティブ (Sprint Retrospective)' AS front, 'スプリント全体の振り返り。良かった点、悪かった点、その改善法や解決策を話し合う。' AS back, 'ပြီးခဲ့သည့် စပရင်ကို ပြန်လည်သုံးသပ်ပြီး တိုးတက်ကောင်းမွန်အောင် လုပ်ဆောင်ခြင်း။' AS note
UNION ALL
SELECT '固定費' AS front, '売上の多寡にかかわらず、毎期必ず一定額発生する費用' AS back, '絶対かかる！！！' AS note
UNION ALL
SELECT '変動費' AS front, '売上（生産・販売量）の増減に直接比例して増減する費用' AS back, '' AS note
UNION ALL
SELECT '利益、固定費、変動費 の計算' AS front, '利益＝売上高－(固定費＋変動費)' AS back, '' AS note
UNION ALL
SELECT '変動比率' AS front, '変動比率 ＝ 変動費 / 売上高' AS back, 'ある商品の販売価格が１０００円で，原価が６００円の場合、変動費率は０.６となる' AS note
UNION ALL
SELECT '固定費が２００万円，変動費率が５０％のとき，利益３００万円が得られる  売上高はいくらか。 ( 変動比率 = 変動費 ÷ 売上高 )' AS front, '３００＝ｘ－(２００＋ｘ×０.５)           ５００＝０.５ｘ                             ｘ＝１０００万円（Ans）' AS back, '' AS note
UNION ALL
SELECT '損益分岐点 、固定費、変動比率' AS front, '損益分岐点売上高 ＝ 固定費 / 1 − 変動比率' AS back, '' AS note
UNION ALL
SELECT 'ある製品の販売計画において、固定費が 2,000万円、変動費率が 0.6（60%） であるとき、損益分岐点売上高は何万円ですか？ ア：3,333万円 イ：5,000万円 ウ：8,000万円 エ：12,000万円' AS front, 'イ' AS back, '' AS note
UNION ALL
SELECT '損益計算書 (営業利益について)' AS front, '営業利益＝売上総利益 － 販売費 － 一般管理費' AS back, 'Operating profit = Gross profit − Selling, general and administrative expenses' AS note
UNION ALL
SELECT 'SQLインジェクションへの有効な対策' AS front, 'プレースホルダ（バインド機構）を使う' AS back, 'SQL နှင့် input တန်ဖိုးကို ခွဲထားသဖြင့် input ကို command အဖြစ် မဖတ်စေရန် ကာကွယ်သည်။' AS note
UNION ALL
SELECT 'クリティカルパス' AS front, '全体の所要期間を決める最長の経路' AS back, 'この経路の遅れはそのままプロジェクト全体の遅れになります。
ဤလမ်းကြောင်း နောက်ကျလျှင် ပရောဂျက်တစ်ခုလုံး နောက်ကျသည်။' AS note
UNION ALL
SELECT 'RAID1' AS front, 'ミラーリング' AS back, '同じデータを2台に書き込むため、1台故障しても継続できます。ဒေတာတူကို disk နှစ်လုံးတွင် ရေးသောကြောင့် တစ်လုံးပျက်လည်း ဆက်သုံးနိုင်သည်။' AS note
UNION ALL
SELECT 'キャッシュメモリ' AS front, 'CPUと主記憶の速度差を埋める' AS back, '高速な小容量メモリで、主記憶へのアクセス待ちを減らします。CPU နှင့် main memory အမြန်နှုန်း ကွာဟချက်ကို ဖြည့်ရန် ဖြစ်သည်။' AS note
UNION ALL
SELECT '仮想記憶' AS front, '補助記憶装置を利用して主記憶より大きな空間を扱う' AS back, 'ページングなどにより、実メモリ以上のアドレス空間を提供します。disk ကိုသုံး၍ အမှန်တကယ် memory ထက်ကြီးသော နေရာကို သုံးနိုင်စေသည်။' AS note
UNION ALL
SELECT 'デッドロック' AS front, '複数のプロセスが互いの資源解放を待って停止する状態' AS back, '互いに相手が持つ資源を待ち続け、どれも進めない状態です。process များ အချင်းချင်း resource လွှတ်ပေးရန် စောင့်နေသဖြင့် မရွှေ့နိုင်ဘဲ ရပ်နေခြင်း ဖြစ်သည်။' AS note
UNION ALL
SELECT '関係データベースの主キーの条件' AS front, '表の中で行を一意に識別できる' AS back, '主キーは重複せず、空値を許さず、行を一意に識別します。
Primary key သည် အတန်းတစ်ခုချင်းကို မထပ်ဘဲ ခွဲခြားနိုင်ရမည်။' AS note
UNION ALL
SELECT 'トランザクションの原子性（Atomicity）' AS front, '全て実行されるか、全く実行されないかのどちらかである' AS back, '途中で失敗したら、処理全体を取り消して元の状態に戻します。အားလုံး အောင်မြင်မှသာ ပြီးမည်၊ မအောင်မြင်လျှင် မူလအတိုင်း ပြန်ဖြစ်မည်။' AS note
UNION ALL
SELECT 'DNSの役割' AS front, 'ドメイン名をIPアドレスに変換する' AS back, '名前解決を行い、ドメイン名からIPアドレスを求めます。
domain အမည်ကို IP လိပ်စာသို့ ပြောင်းပေးသည်။' AS note
UNION ALL
SELECT 'DHCP の役割' AS front, 'IPアドレスを自動で割り当てる' AS back, 'IP ခွဲဝေပေးခြင်းသည် DHCP ဖြစ်သည်။' AS note
UNION ALL
SELECT 'HTTP と　HTTPS　のポート番号' AS front, 'HTTPS=443、HTTPは　80　です。' AS back, 'HTTPS သည် port 443 ကိုသုံးသည်၊ HTTP သည် 80 ဖြစ်သည်။' AS note
UNION ALL
SELECT '公開鍵暗号方式で、送信者が暗号化に使う鍵はどれか。' AS front, '受信者の公開鍵' AS back, '受信者の公開鍵で暗号化し、受信者の秘密鍵で復号します。
လက်ခံသူ၏ public key ဖြင့် encrypt လုပ်ပြီး လက်ခံသူ၏ private key ဖြင့် decrypt လုပ်သည်။' AS note
UNION ALL
SELECT '多要素認証' AS front, '2-factor verification/ 2-factor authentication' AS back, 'for example, password and e-mail passcode !' AS note
UNION ALL
SELECT 'ウォーターフォールモデル （Waterfall Model）' AS front, '要件定義から順に工程を進める' AS back, '各工程を順に進め、原則として前の工程には戻りません。
အဆင့်များကို အစဉ်လိုက် လုပ်ပြီး ယေဘုယျအားဖြင့် နောက်ပြန်မသွားပါ။' AS note
UNION ALL
SELECT 'ブラックボックステスト' AS front, '内部構造を考えず、入出力の仕様で確認する' AS back, 'プログラムの中身を見ずに、仕様どおりに動くかを確認します。
အတွင်းကုဒ်ကို မကြည့်ဘဲ input/output သတ်မှတ်ချက်အတိုင်း ဖြစ်မဖြစ် စစ်သည်။' AS note
UNION ALL
SELECT 'ホワイトボックステスト（White-Box Testing）' AS front, '内部の分岐を網羅して確認する' AS back, '内部構造（処理の流れや分岐）をすべて「見える化」した状態で行うテスト' AS note
UNION ALL
SELECT 'WBS' AS front, '作業を階層的に分解した構成図' AS back, 'プロジェクトの作業を細かい単位に分解し、階層で表します。ပရောဂျက်အလုပ်များကို အဆင့်လိုက် သေးငယ်စွာ ခွဲထားသော ဖွဲ့စည်းပုံ ဖြစ်သည်။' AS note
UNION ALL
SELECT 'ITサービスマネジメントのインシデント管理' AS front, 'サービスの中断を最小限にし、早期に復旧する' AS back, 'インシデント管理は復旧を優先します。Incident management သည် ဝန်ဆောင်မှု ပြတ်တောက်ချိန်ကို လျှော့၍ အမြန်ပြန်ကောင်းစေသည်။' AS note
UNION ALL
SELECT 'ITサービスマネジメントの問題管理管理' AS front, '障害の根本原因を究明する' AS back, '原因究明は問題管理です。
အမြစ်ရှာခြင်းသည် problem management ဖြစ်သည်။' AS note
UNION ALL
SELECT 'システム監査人に求められる最も重要な要件はどれか。' AS front, '監査対象から独立していること' AS back, '客観的な判断のため、監査対象から独立している必要があります。
ဘက်မလိုက်သော စစ်ဆေးမှုအတွက် စစ်ဆေးခံဌာနနှင့် လွတ်လပ်ရမည်။' AS note
UNION ALL
SELECT 'ROI（投資利益率）とうしりえきりつ' AS front, '投資に対する利益の割合' AS back, 'ROI（投資利益率）＝利益÷投資額 で求めます。
ROI = အမြတ် ÷ ရင်းနှီးငွေ ဖြစ်ပြီး ရင်းနှီးမှုအပေါ် အမြတ်အချိုး ဖြစ်သည်။' AS note
UNION ALL
SELECT '日本の著作権法（ちょさくけんほう）で、著作権（ちょさくけん）が発生するのはいつか。' AS front, '著作物（ちょさくもの）を創作（そうさく）したとき' AS back, '登録などの手続は不要で、創作の時点で発生します（無方式主義）。မှတ်ပုံတင်ရန် မလိုဘဲ ဖန်တီးလိုက်သည့်အချိန်တွင် copyright ဖြစ်ပေါ်သည်။' AS note
UNION ALL
SELECT 'データを読み取るとき磁気を使わない記憶装置' AS front, '光磁気ディスク(Magneto-Optical Disk - MO)' AS back, 'MO သည် စာရေးသားရာတွင်သာ သံလိုက်နှင့် လေဆာကို တွဲသုံးပြီး၊ ပြန်လည်ဖတ်ရှုရာတွင် အနီရောင်လေဆာကိုသာ အသုံးပြုသောကြောင့် ဖြစ်သည်' AS note
UNION ALL
SELECT '関係データベース' AS front, 'エクセルの表のような2次元の表でデータを管理するもの（関係データベース）' AS back, 'Excel ကဲ့သို့ အတန်း (Rows) နှင့် ကော်လံများ (Columns) ပါဝင်သည့် ၂ ဖက်မြင်ဇယားပုံစံဖြင့် ဒေတာများကို စီမံခန့်ခွဲသောစနစ်' AS note
UNION ALL
SELECT '階層型データベース(Hierarchical Database)' AS front, '親レコードと子レコードをポインタで結合する' AS back, 'データをまるで家族の家系図や木の枝（ツリー構造）のように繋いでいく သစ်ပင်ပုံစံ အကိုင်းအခက်များကဲ့သို့ ဒေတာဖွဲ့စည်းပုံရှိသည့် အထက်အောက်အဆင့်ဆင့်ရှိ ဒေတာဘေ့စ်' AS note
UNION ALL
SELECT 'コストプラスにより、価格設定方法' AS front, '• 「製造原価と営業費を基準にし、希望マージンを織り込んで価格を決める方法」' AS back, '○「（算出された）原価に、一定の利益を上乗せして販売価格を決める方法」
✕需要志向的価格決定法: 顧客が感じる価値や需要の高低を基準に価格を決める方法。' AS note
UNION ALL
SELECT 'フラッシュメモリー' AS front, 'ブロック単位で電気的に消去できる' AS back, 'フラッシュメモリ（USBメモリやSSDなど）は、電気を使ってデータをまとめて（ブロック単位で）消去・書き込みができるのが特徴です。' AS note
) AS t
WHERE NOT EXISTS (
  SELECT 1 FROM cards c
  WHERE c.owner = @owner
    AND c.front = t.front COLLATE utf8mb4_bin
    AND c.back  = t.back  COLLATE utf8mb4_bin
);

SELECT ROW_COUNT() AS added;
SELECT COUNT(*) AS total_for_this_code FROM cards WHERE owner = @owner;

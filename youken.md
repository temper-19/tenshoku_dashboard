# 転職ダッシュボード 開発仕様書

## 1. アプリ概要

個人用の転職活動管理Webアプリを作成する。

アプリ名は「転職ダッシュボード」。

目的は、転職活動で応募・検討している企業の進捗状況、志望度、次回予定、メモ、懸念点を一覧で管理できるようにすること。

アプリストア等に公開する予定はなく、個人利用を前提とする。  
ログイン機能やサーバーDBは不要。  
ブラウザ上で動作するシンプルなWebページとして作成する。

技術構成は React + localStorage。  
データはブラウザの localStorage に保存する。  
JSON形式でバックアップのエクスポート・インポートができるようにする。

PWA化は必須ではないが、後から対応しやすい構成にしておく。

---

## 2. 技術要件

- Reactで実装する
- データ保存は localStorage を使用する
- サーバーサイド処理は不要
- ログイン機能は不要
- 外部DBは不要
- JSONエクスポート機能を実装する
- JSONインポート機能を実装する
- シンプルなレスポンシブ対応を行う
- PC・スマホの両方で使いやすいUIにする

---

## 3. デザイン方針

デザインは白を基調としたシンプルな業務ツール風にする。

### 基本方針

- 白基調
- サブカラーは暗めの青
- グラデーションは使用しない
- シンプルで落ち着いた見た目
- 余白をしっかり取る
- カードやボタンの影は弱め、または使用しない
- 線と余白で情報を整理する
- 派手な装飾は避ける
- Notionより少し業務ツール寄り
- Googleスプレッドシートより見やすい
- Trelloより落ち着いた印象

### 推奨カラー

```css
:root {
  --color-bg: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-text: #0F172A;
  --color-muted: #64748B;
  --color-primary: #1E3A8A;
  --color-primary-light: #EFF6FF;
  --color-border: #E2E8F0;
  --color-danger: #DC2626;
}
UI方針
border中心
box-shadowは弱め
border-radiusは8px〜12px程度
文字サイズは14px〜16px
見出しは20px〜24px
ボタンは角丸控えめ
グラデーション禁止
背景は薄いグレー、メインコンテンツは白
4. データ構造

企業ごとのデータ型は以下。

type SelectionStatus =
  | "気になる"
  | "応募済み"
  | "書類選考中"
  | "面接予定"
  | "結果待ち"
  | "内定"
  | "辞退"
  | "不採用"
  | "保留";

type Priority = "S" | "A" | "B" | "C";

type Company = {
  id: string;

  companyName: string;
  positionName: string;
  applicationSource: string;
  jobUrl: string;
  companyUrl: string;
  location: string;
  appliedDate: string;

  status: SelectionStatus;
  priority: Priority;

  nextScheduleDate: string;
  memo: string;
  concernMemo: string;

  createdAt: string;
  updatedAt: string;
};
5. 管理項目

企業ごとに以下の項目を管理する。

基本情報
企業名
職種名
応募媒体
求人URL
企業サイトURL
勤務地
応募日
選考管理情報
選考ステータス
志望度
次回予定日
メモ情報
メモ
懸念点メモ
6. 選考ステータス

選考ステータスは以下の9種類。

気になる
応募済み
書類選考中
面接予定
結果待ち
内定
辞退
不採用
保留

ステータスはセレクトボックスで選択できるようにする。

7. 志望度

志望度は以下の4段階。

S
A
B
C

志望度もセレクトボックスで選択できるようにする。

初期値は B とする。

8. 必須項目

必須項目は企業名のみ。

その他の項目は空欄でも保存できるようにする。

9. localStorage仕様

localStorageの保存キーは以下。

job-dashboard-companies

保存形式は Company 配列。

[
  {
    "id": "company_1718840000000",
    "companyName": "株式会社〇〇",
    "positionName": "Webディレクター",
    "applicationSource": "マイナビ転職",
    "jobUrl": "https://example.com/job",
    "companyUrl": "https://example.com",
    "location": "東京",
    "appliedDate": "2026-06-20",
    "status": "書類選考中",
    "priority": "A",
    "nextScheduleDate": "2026-06-25",
    "memo": "既存サイト改善寄り。",
    "concernMemo": "記事制作寄りすぎる可能性あり。",
    "createdAt": "2026-06-20T10:00:00.000Z",
    "updatedAt": "2026-06-20T10:00:00.000Z"
  }
]
10. 画面構成

アプリは基本的に1ページ構成でよい。

画面内に以下のエリアを配置する。

ヘッダー
ダッシュボードサマリー
フィルター・検索エリア
企業カード一覧
企業追加・編集モーダル
11. ヘッダー仕様

ヘッダーには以下を表示する。

アプリ名：転職ダッシュボード
JSONインポートボタン
JSONエクスポートボタン
企業追加ボタン

レイアウト例。

[転職ダッシュボード]                  [インポート] [エクスポート] [+ 企業追加]

スマホではボタンが折り返されてもよい。

12. ダッシュボードサマリー仕様

画面上部にサマリーカードを表示する。

表示するカードは以下。

全企業数
進行中
面接予定
内定
進行中の定義

以下のステータスを進行中としてカウントする。

応募済み
書類選考中
面接予定
結果待ち
保留

以下は進行中に含めない。

気になる
内定
辞退
不採用
13. フィルター・検索仕様

企業一覧の上にフィルター・検索エリアを配置する。

機能
キーワード検索
ステータス絞り込み
志望度絞り込み
並び替え
キーワード検索対象

以下の項目を対象に検索する。

企業名
職種名
応募媒体
勤務地
メモ
懸念点メモ
ステータス絞り込み

以下を選択できる。

すべて
気になる
応募済み
書類選考中
面接予定
結果待ち
内定
辞退
不採用
保留
志望度絞り込み

以下を選択できる。

すべて
S
A
B
C
並び替え

以下を選択できる。

更新日が新しい順
応募日が新しい順
次回予定日が近い順

初期表示は「更新日が新しい順」。

14. 企業一覧仕様

企業一覧はカード型で表示する。

PCでは複数列のグリッド表示。
スマホでは1カラム表示。

カードに表示する項目
企業名
職種名
ステータス
志望度
応募媒体
勤務地
応募日
次回予定日

求人URL、企業サイトURL、メモ、懸念点メモはカード上では省略してよい。
それらは編集モーダル内で確認・編集する。

カード例
株式会社〇〇                         志望度 A

Webディレクター
書類選考中

応募媒体：マイナビ転職
勤務地：東京
応募日：2026/06/20
次回予定日：2026/06/25
カード操作
カードをクリックすると編集モーダルを開く
カード内に「編集」ボタンを置いてもよい
URLが入力されている場合、求人URL・企業サイトURLへのリンクはモーダル内に表示する
15. 企業追加・編集モーダル仕様

企業追加と企業編集は同じモーダルコンポーネントで実装する。

入力項目
企業名
職種名
応募媒体
求人URL
企業サイトURL
勤務地
応募日
選考ステータス
志望度
次回予定日
メモ
懸念点メモ
入力タイプ
企業名：text
職種名：text
応募媒体：text
求人URL：url
企業サイトURL：url
勤務地：text
応募日：date
選考ステータス：select
志望度：select
次回予定日：date
メモ：textarea
懸念点メモ：textarea
ボタン

新規追加時。

保存
キャンセル

編集時。

保存
キャンセル
削除
削除確認

削除ボタンを押したら確認ダイアログを出す。

文言。

この企業データを削除しますか？

OKなら削除。
キャンセルなら何もしない。

16. 新規登録時の初期値

企業追加時の初期値は以下。

const defaultCompany = {
  companyName: "",
  positionName: "",
  applicationSource: "",
  jobUrl: "",
  companyUrl: "",
  location: "",
  appliedDate: "",
  status: "気になる",
  priority: "B",
  nextScheduleDate: "",
  memo: "",
  concernMemo: ""
};

id、createdAt、updatedAt は保存時に自動生成する。

idは以下のような形式でよい。

const id = `company_${Date.now()}`;

createdAt、updatedAt は ISO文字列で保存する。

new Date().toISOString()
17. 更新処理

企業データを編集して保存した場合は、updatedAt を現在時刻に更新する。

createdAt は変更しない。

18. 次回予定日の扱い

次回予定日は date 型で管理する。

時間は管理しなくてよい。
面接時間やZoom URLなどを書きたい場合はメモ欄に記載する運用とする。

次回予定日が今日以前の場合は、カード上で少し注意表示してもよい。
例：薄い赤、または「要確認」ラベル。

ただし、派手にしすぎない。

19. 不採用・辞退の扱い

不採用・辞退の企業も一覧には表示する。
ただし、ステータスフィルターで絞り込み・非表示運用ができるようにする。

将来的に「終了ステータスを非表示」トグルを追加してもよいが、MVPでは必須ではない。

20. JSONエクスポート仕様

ヘッダーの「エクスポート」ボタンを押すと、現在の企業データをJSONファイルとしてダウンロードする。

ファイル名
job-dashboard-backup-YYYY-MM-DD.json

例。

job-dashboard-backup-2026-06-20.json
JSON形式
{
  "version": 1,
  "exportedAt": "2026-06-20T00:00:00.000Z",
  "companies": []
}

companies には現在localStorageに保存されている Company 配列を入れる。

21. JSONインポート仕様

ヘッダーの「インポート」ボタンからJSONファイルを読み込めるようにする。

インポート時は、既存データを上書きする。

インポート前に確認ダイアログを出す。

文言。

現在のデータを上書きします。よろしいですか？

OKなら読み込んだJSONの companies を localStorage に保存し、画面表示を更新する。
キャンセルなら何もしない。

バリデーション

最低限、以下を確認する。

JSONとして読み込めること
companies が配列であること

不正な形式の場合はアラートを表示する。

文言例。

インポートできないファイル形式です。
22. 空状態の表示

企業データが0件の場合は、空状態のメッセージを表示する。

例。

まだ企業が登録されていません。
「企業追加」から転職活動中の企業を登録しましょう。
23. 検索結果0件の表示

検索・フィルターの結果が0件の場合は、以下のようなメッセージを表示する。

条件に一致する企業がありません。
24. レスポンシブ仕様
PC
最大幅は1200px前後
中央寄せ
企業カードは2〜3カラム
ヘッダーは横並び
スマホ
1カラム表示
ヘッダーのボタンは折り返し可
モーダルは画面幅いっぱいに近いサイズ
入力フォームは縦並び
ボタンは押しやすい高さにする
25. 実装コンポーネント案

コンポーネントは以下のように分ける。

App
├── Header
├── SummaryCards
├── Filters
├── CompanyList
│   └── CompanyCard
└── CompanyModal

必要に応じて以下も作る。

utils/storage.ts
utils/backup.ts
constants.ts
types.ts
26. 状態管理

Reactの useState と useEffect で十分。

外部状態管理ライブラリは不要。

管理するstate例。

const [companies, setCompanies] = useState<Company[]>([]);
const [searchKeyword, setSearchKeyword] = useState("");
const [statusFilter, setStatusFilter] = useState("all");
const [priorityFilter, setPriorityFilter] = useState("all");
const [sortType, setSortType] = useState("updatedDesc");
const [isModalOpen, setIsModalOpen] = useState(false);
const [editingCompany, setEditingCompany] = useState<Company | null>(null);
27. 保存処理

companies が更新されるたびに localStorage に保存する。

useEffect(() => {
  localStorage.setItem("job-dashboard-companies", JSON.stringify(companies));
}, [companies]);

初回読み込み時は localStorage から取得する。

useEffect(() => {
  const saved = localStorage.getItem("job-dashboard-companies");
  if (saved) {
    setCompanies(JSON.parse(saved));
  }
}, []);

JSON.parse は try/catch で保護する。

28. 並び替えロジック
更新日が新しい順

updatedAt の降順。

応募日が新しい順

appliedDate の降順。
空欄は後ろに回す。

次回予定日が近い順

nextScheduleDate の昇順。
空欄は後ろに回す。

29. 表示ラベル
日付が空の場合
未設定
URLが空の場合

リンクを表示しない。

メモが空の場合

モーダル内では空欄のままでよい。

30. 期待する完成イメージ

転職活動中の企業をカード形式で一覧管理できる。

上部には、

全企業数
進行中
面接予定
内定

が表示される。

企業カードには、

企業名
職種名
ステータス
志望度
応募媒体
勤務地
応募日
次回予定日

が表示される。

企業カードをクリックするとモーダルが開き、詳細情報を編集できる。

localStorageに保存されるため、ブラウザを閉じてもデータは残る。

JSONエクスポート・インポートにより、バックアップや別環境への移行ができる。

31. MVPで実装する機能一覧

必須で実装する機能。

企業追加
企業編集
企業削除
企業一覧表示
選考ステータス設定
志望度設定
次回予定日設定
メモ入力
懸念点メモ入力
キーワード検索
ステータス絞り込み
志望度絞り込み
並び替え
localStorage保存
JSONエクスポート
JSONインポート
レスポンシブ対応
32. MVPでは不要な機能

以下は今回実装しない。

ログイン機能
複数ユーザー対応
サーバーDB
Supabase連携
カレンダー連携
通知機能
AI機能
PDF出力
グラフ機能
アプリストア公開
本格的なPWA対応
ドラッグ&ドロップのカンバンUI
33. 最終ゴール

React + localStorage で、個人用の「転職ダッシュボード」を作成する。

白基調、暗めの青をサブカラーにしたシンプルな見た目で、転職活動中の企業情報をカード形式で管理できるようにする。

企業の進捗、志望度、次回予定、メモ、懸念点をひと目で確認でき、JSONバックアップも可能なWebアプリとして完成させる。
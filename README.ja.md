# Synology Photos Bulk Rotate

**English** | **日本語** | [简体中文](./README.zh-CN.md)

Synology Photos のWeb画面に、キーボードショートカットと**複数写真の一括回転**を追加するTampermonkeyユーザースクリプトです。

Synology Photosの一覧画面には便利な一括回転機能がありません。このスクリプトを使うと、複数の写真を選択して、ページ全体を再読み込みせずにまとめて回転できます。

## 機能

| キー | 写真一覧 | 1枚表示 |
| --- | --- | --- |
| `R` | 選択した写真をすべて右へ90°回転 | 現在の写真を右へ90°回転 |
| `L` | 選択した写真をすべて左へ90°回転 | 現在の写真を左へ90°回転 |
| `→` | — | 次の写真 |
| `←` | — | 前の写真 |

一括回転では、ブラウザ上のSynology Photosで確認したWeb APIを利用します。

- `SYNO.FotoTeam.Browse.Item`
- `method=set`
- `rotate_action="clockwise"` または `"counter_clockwise"`

回転後は対象写真のサムネイルだけを更新し、Synology Photosのページ全体は**再読み込みしません**。そのため、フィルターや現在のスクロール位置を維持できます。

## 動作確認環境

初期リリースでは以下の環境で動作確認しています。

- Synology DSM 7.4.1-90080
- Synology Photos Web版
- Google Chrome
- Tampermonkey

その他のDSM / Synology Photos / ブラウザでも動作する可能性がありますが、現時点では未確認です。

## インストール

### 1. Tampermonkeyをインストール

Tampermonkey公式サイト、またはブラウザの拡張機能ストアからTampermonkeyをインストールします。

![ChromeウェブストアのTampermonkey](./screenshots/01-tampermonkey-store.png)

### 2. ユーザースクリプトの実行を許可

最近のChrome/Tampermonkeyでは、ユーザースクリプトを実行するための許可が必要になる場合があります。

`Chrome → 拡張機能 → 拡張機能を管理 → Tampermonkey → 詳細`

を開き、**「ユーザースクリプトを許可」**を有効にしてください。表示名はChrome/Tampermonkeyのバージョンによって多少異なる場合があります。

スクリプトをインストールしたのにTampermonkeyで「まだ実行されていません」と表示される場合は、まずこの設定を確認してください。

![Chromeでユーザースクリプトを許可](./screenshots/02-allow-user-scripts.png)

### 3. スクリプトをインストール

次のファイルを開きます。

[`synology-photos-bulk-rotate.user.js`](./synology-photos-bulk-rotate.user.js)

ファイル画面右上の **Raw** をクリックします。

![GitHubのRawボタン](./screenshots/05-github-raw.png)

Tampermonkeyのユーザースクリプトインストール画面が表示されます。すでにインストール済みの場合は「インストール」ではなく**「再インストール」**と表示されることがあります。

![Tampermonkeyのインストール画面](./screenshots/06-tampermonkey-install.png)

インストール後、Tampermonkeyのダッシュボードで **Synology Photos Bulk Rotate** が有効になっていることを確認できます。

![インストール済みスクリプト](./screenshots/04-installed-script.png)

> このスクリプトでは、Synology Photosが独自ドメイン、IPアドレス、さまざまなHTTPSポートで公開される可能性があるため、`@match https://*/*` を使用しています。実際のキー処理を行う前に、現在のページがSynology Photosかどうかを判定します。`@grant none` で動作し、外部サービスへデータを送信しません。
>
> より厳密に対象サイトを限定したい場合は、インストール後に `@match` を自分のSynology Photosのアドレスへ変更できます。
>
> ```javascript
> // @match https://nas.example.com:5001/*
> ```

## 使い方

### 複数写真を一括回転

1. ブラウザでSynology Photosを開きます。
2. タイムライン/一覧画面で回転したい写真を複数選択します。

![Synology Photosで複数写真を選択](./screenshots/07-select-photos.png)
3. `R` で右へ90°、`L` で左へ90°回転します。
4. 確認ダイアログで実行を承認します。

![一括回転の確認ダイアログ](./screenshots/08-rotate-confirm.png)
5. 選択した写真がまとめて回転し、対象サムネイルだけが更新されます。

![一括回転後の写真](./screenshots/09-rotated-result.png)

ページ全体は再読み込みされません。

### 1枚表示

写真を1枚開いている場合は、

- `L`：左へ90°回転
- `R`：右へ90°回転
- `←` / `→`：前後の写真へ移動

として使用できます。

Synology Photosのビューアには左回転操作があるため、1枚表示時の右回転は左回転を3回実行します。

## ページ全体を再読み込みしない理由

Synology Photosを再読み込みすると時間がかかり、フィルターなどの一時的な画面状態や、大量の写真を確認しているときの位置が失われることがあります。

そのため、このスクリプトでは回転した写真のサムネイル `<img>` だけを再取得します。

## 既知の制限

- 横長写真を縦向きへ（またはその逆へ）回転した直後は、Synology Photosの既存の行レイアウトが再計算されないため、更新されたサムネイルの一部が一時的に切れて表示される場合があります。
- これは現在の一覧画面だけの表示上の問題です。Synology Photosを再読み込みすると正常なレイアウトに戻ります。
- Synology Photosの内部Web APIとDOM構造を利用しているため、将来のDSM/Synology Photosアップデートによって動作しなくなる可能性があります。
- 上記の動作確認環境以外での動作は保証していません。

## セキュリティとプライバシー

このスクリプトは、

- Tampermonkeyを通してブラウザ内でローカル実行されます。
- 現在ログイン中のSynology Photosセッションを利用します。
- Synologyのユーザー名、パスワード、セッショントークン、NASアドレスをコード内に保持しません。
- 写真情報を外部サーバーへ送信しません。

Issueを投稿する場合は、Cookie、`SynoToken`、その他のセッション認証情報をスクリーンショットやログに含めないでください。

## トラブルシューティング

**R / Lを押しても何も起きない**

次を確認してください。

1. Tampermonkeyが有効になっている。
2. このユーザースクリプトが有効になっている。
3. ChromeでTampermonkeyのユーザースクリプト実行が許可されている。
4. スクリプトのインストール/有効化後にSynology Photosのタブを再読み込みした。

**回転は成功したがサムネイルが切れて見える**

既知の一時的な表示上の制限です。写真自体の回転処理は完了しています。Synology Photosを再読み込みすると通常のレイアウトへ戻ります。

**回転に失敗する**

`F12` でChrome DevToolsを開き、**Console** で次から始まるメッセージを確認してください。

```text
[Synology Photos Bulk Rotate]
```

Issueへログやスクリーンショットを添付する場合は、Cookie、SynoToken、ホスト名などの個人情報を削除してください。

## 免責事項

このプロジェクトは独立したユーザースクリプトであり、**Synology Inc.またはTampermonkeyとの提携・承認関係はありません**。

Synology Photos Webアプリの内部動作を利用しているため、予告なく仕様が変わる可能性があります。重要な写真はバックアップを取り、大量の写真へ使用する前に、少数の重要でない写真で動作確認してください。

## ライセンス

MIT Licenseです。[LICENSE](./LICENSE) を参照してください。

## Contributing

不具合や互換性情報はGitHub Issuesで歓迎します。報告時にはDSM、Synology Photos、ブラウザ、Tampermonkeyの各バージョンを記載すると調査しやすくなります。ただし、認証トークンや非公開NAS URLは掲載しないでください。

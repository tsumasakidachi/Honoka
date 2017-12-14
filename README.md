# Line
## 使い方

### インストール

    $ git clone https://github.com/tsumasakidachi/Line.git
    $ npm install

### 設定の編集

settings.default.json を同じフォルダにコピーし、ファイル名を settings.json に変更する。

設定項目:

|プロパティ|値型|説明|
|:--|:--|:--|
|connectOnStartup|bool|プロジェクトを起動したときに自動的に Minecraft サーバに接続するかどうか|
|minecraft.user|string|Minecraft アカウント ID|
|minecraft.password|string|Minecraft アカウントのパスワード|
|database.host|string|データベースのホスト名|
|database.user|string|データベースのユーザ名|
|database.password|string|データベースのパスワード|
|database.database|string|データベース名|

### 翻訳リソースの用意

本プロジェクトのルート フォルダにファイル lang.json を作成する。次に Minecraft の翻訳リソース ファイル (Windows の場合 `C:\Users\<アカウント>\AppData\Roaming\.minecraft\versions\<バージョン>\<バージョン>.jar\assets\minecraft\lang\en_us.lang`) を開き、中身を lang.json にコピーして保存する。翻訳リソースは JSON 形式ではないためテキスト エディタ等を使って JSON 形式に変換する。

### 起動

    $ npm start
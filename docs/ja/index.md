# Classroom

## 概要

> **Note:** リポジトリをフォークすることをお勧めします。時々、プライベートにする場合があります

この拡張機能を使用すると、N予備校でのビデオ視聴が簡単になります！
ビデオが終了すると、自動的に次のビデオに移動します。
この拡張機能は右クリックメニューから有効または無効にできます。

## 注意事項

著作者または著作権者は、契約、不法行為またはその他の理由の如何を問わず、本ソフトウェアまたはその使用またはその他の処理に起因または関連する一切の請求、損害またはその他の義務について責任を負いません。

## 対応ブラウザ

> **Note:** iOSデバイスの場合、Orionブラウザを使用してください。

- Chrome
- Edge
- Firefox
- Orion（Googleウェブストアからインストール）

## 学校関係者へ

このアプリケーションは、N予備校のサーバーに一切干渉しません。

すべてのデータは現在表示されているウェブページから解析され、次のビデオに移動されます。

## 使用方法

必要なパッケージをインストール

```bash
pnpm install
```

拡張機能をビルド。

```bash
pnpm build
```

以下の手順は各ブラウザごとに異なるので、各ブラウザのセクションを参照してください。

### Chrome

1. このリポジトリをクローン
2. Chromeを開き、`chrome://extensions/`に移動
3. デベロッパーモードを有効にする
4. `パッケージ化されていない拡張機能を読み込む`をクリック
5. このリポジトリをクローンしたディレクトリを選択
6. [https://www.nnn.ed.nico/](https://www.nnn.ed.nico/)にアクセスする！

### Edge

1. このリポジトリをクローン
2. Chromeを開き、`edge://extensions/`に移動
3. デベロッパーモードを有効にする
4. `パッケージ化されていない拡張機能を読み込む`をクリック
5. このリポジトリをクローンしたディレクトリを選択
6. [https://www.nnn.ed.nico/](https://www.nnn.ed.nico/)にアクセスする！

### Firefox

1. このリポジトリをクローン
2. Firefoxを開き、`about:debugging#/runtime/this-firefox`に移動
3. `一時的なアドオンを読み込む`をクリック
4. クローンしたディレクトリ内の`dist/firefox.zip`を選択
5. `about:addons`に移動して拡張機能の管理を開く
6. `https://www.nnn.ed.nico`へのアクセスを有効にする
7. [https://www.nnn.ed.nico/](https://www.nnn.ed.nico/)にアクセスする！

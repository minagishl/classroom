# N Prep School Auto Play Extension

Japanese version is [here](README-ja.md)

## Overview

the author or copyright owner shall not be liable for any claims, damages or other liability, whether in an action of contract or otherwise.

In no event shall the author or copyright holder be liable for any claims, damages, or other liability, whether in contract, tort, or otherwise, arising out of or in connection with the use of this software or any other dealings

## Notice

This application supports full background playback by editing a flag in the internal code, but this may violate N Prep's Terms of Use, so please use at your own risk.

## Supported Browsers

- Chrome
- Edge
- Firefox

## Nyobikou To whom it may concern

This application does not interfere with Nyobikou's servers in any way.

All data is scraped from the currently displayed web page and converted for use.

<!--

When I add this code, the name of the extension is “N Prep School Auto Play”, but the repository name says “Nyobikou”

There is a reason for this, and it's because the official accounts on YouTube and other sites use that name, but I didn't like it myself, so I changed the name of the extension!

2024/04/29 - Added - decided to unify names

2024/02/30 - But I didn't see anything in the rules about automation, is that OK? https://www.nnn.ed.nico/rules

-->

## Build

Install the package before building.

```bash
yarn install
```

Build the extension.

```bash
yarn build
```

## Usage

### Chrome

1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable Developer mode
4. Click on `Load unpacked`
5. Select the directory where you cloned this repository
6. Go to [https://www.nnn.ed.nico/](https://www.nnn.ed.nico/) and enjoy!

### Edge

1. clone this repository
2. Open Chrome and go to `edge://extensions/`
3. Enable developer mode
4. Click `Expand and Load`
5. Select the directory where you cloned this repository
6. go to [https://www.nnn.ed.nico/](https://www.nnn.ed.nico/) and enjoy!

### Firefox

1. Clone this repository
2. Open Firefox and go to `about:debugging#/runtime/this-firefox`
3. Click on `Load temporary add-on`
4. Select `dist/firefox.zip` in the directory where you cloned this repository
5. Go to `about:addons` and open extension management
6. Enable `https://www.nnn.ed.nico access to stored data`
7. Go to [https://www.nnn.ed.nico/](https://www.nnn.ed.nico/) and enjoy!

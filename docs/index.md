# Classroom

## Overview

> **Note:** It is recommended that you fork the repository. Sometimes we keep it private.

This extension makes it easier to watch videos on N Prep!
When a video ends, it automatically moves to the next video.
You can enable or disable this extension from the right-click menu.

## Notice

In no event shall the author or copyright holder be liable for any claim, damages or other obligation, whether in contract, tort or otherwise, arising out of or in connection with the Software or the use or other processing of the Software.

## Supported Browsers

> **Note:** For iOS devices, please use the Orion browser

- Chrome
- Edge
- Firefox
- Orion (Install from Google Webstore)

## To School Officials

This application does not interfere in any way with N Prep School's servers.

All data will be analyzed from the currently displayed web page and moved to the next video

## How to use

Install the required packages

```bash
pnpm install
```

Build the extension.

```bash
pnpm build
```

The following process is different for each browser, so please refer to the section for your browser

### Chrome

1. clone this repository
2. Open Chrome and go to `chrome://extensions/`.
3. enable developer mode
4. click `Load unpacked`.
5. select the directory where you cloned this repository.
6. go to [https://www.nnn.ed.nico/](https://www.nnn.ed.nico/) and enjoy!

### Edge

1. clone this repository.
2. open Chrome and go to `edge://extensions/`.
3. enable developer mode.
4. click `expand and load`.
5. select the directory where you cloned this repository.
6. go to [https://www.nnn.ed.nico/](https://www.nnn.ed.nico/) and enjoy!

### Firefox

1. clone this repository
2. open Firefox and go to `about:debugging#/runtime/this-firefox`.
3. click `load temporary add-ons`
4. select `dist/firefox.zip` in the directory where you cloned this repository
5. go to `about:addons` and open the extension management.
6. enable `https://www.nnn.ed.nico access to stored data`.
7. go to [https://www.nnn.ed.nico/](https://www.nnn.ed.nico/) and enjoy!

# Classroom

## Overview

This extension makes it easier to watch videos on N Prep!
When a video ends, it automatically moves to the next video.
You can enable or disable this extension from the right-click menu.

## Notice

This application supports full background playback by editing a flag in the internal code, but this may violate N Prep's terms of service, so please use at your own risk.

Also with this extension the author or copyright holder shall not be liable for any claims, damages or other obligations, whether in an action of contract, tort or otherwise, arising out of or in connection with the software, or arising out of the use or other treatment of the software.

## Supported Browsers

- Chrome
- Edge
- Firefox

## To School Officials

This application does not interfere in any way with N Prep School's servers.

All data will be analyzed from the currently displayed web page and moved to the next video

## How to use

Install the required packages

```bash
yarn install
```

Build the extension.

```bash
yarn build
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

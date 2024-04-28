console.log('Extension loaded.');

const targetNode = document.body;
let lastExecutionTime = 0;

const config = {
  childList: true,
  attributes: true,
  subtree: true,
};

let isEnabled = true;

chrome.storage.sync.get('enabled', (data) => {
  isEnabled = data.enabled;
  if (isEnabled === undefined) {
    chrome.storage.sync.set({ enabled: true });
  } else if (isEnabled) {
    console.log('Extension is enabled.');
  } else {
    console.log('Extension is disabled.');
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    isEnabled = changes.enabled.newValue;
    console.log(`Extension is now ${isEnabled ? 'enabled' : 'disabled'}`);
    window.alert(`Extension is now ${isEnabled ? 'enabled' : 'disabled'}`);
  }
});

function handleVideoEnd() {
  if (isEnabled) {
    const currentTime = Date.now();
    if (currentTime - lastExecutionTime < 5000) {
      // If it has been within 5 seconds since the last execution, exit the function without executing console.log.
      return;
    }
    lastExecutionTime = currentTime;

    console.log('Video ended.');
    const list = getList();
    const index = findIndex(list);
    if (index !== -1) {
      console.log('Moving to the next video.');
      moveElement(index + 1);
    } else {
      console.log('All videos have been completed.');
    }
  }
}

const callback = function (mutationsList, _) {
  for (let mutation of mutationsList) {
    if (mutation.type === 'childList') {
      // Get it somehow.
      if (
        /\/courses\/\w+\/chapters\/\w+\/movie/.test(window.location.pathname)
      ) {
        const videoPlayer = getVideoPlayer();
        if (videoPlayer) {
          observer.disconnect();
          console.log('Video player found.');
          if (videoPlayer.ended) {
            handleVideoEnd();
          } else {
            videoPlayer.addEventListener('ended', async () => {
              handleVideoEnd();
            });
          }
        } else {
          console.log('Video player not found.');
        }
      }
    }
  }
};

const observer = new MutationObserver(callback);
observer.observe(targetNode, config);

function getVideoPlayer() {
  try {
    const iframeElement = document.querySelector('iframe[title="教材"]');
    const iframeDocument =
      iframeElement.contentDocument ?? iframeElement.contentWindow.document;

    return iframeDocument.querySelector('#video-player');
  } catch (error) {
    return null;
  }
}

function findIndex(data) {
  for (let i = 0; i < data.length; i++) {
    if (data[i].type === 'main' && data[i].passed === false) {
      return i;
    }
  }
  return -1; // If the corresponding object could not be found
}

function getList() {
  const element = Array.from(
    document.querySelector('ul[aria-label="必修教材リスト"]').childNodes,
  );

  if (!element) {
    // Outputs an error if it does not exist
    throw new Error('Error: cannot find an element with XPath(' + xpath + ')');
  }

  const list = element.map((element) => {
    const title = element
      .querySelector('div div div span:nth-child(2)')
      .textContent.trim();
    // Check if the video has been watched.
    const passed = element.textContent.includes('視聴済み') ? true : false;
    const type = element.textContent.includes('movie-rounded-plus')
      ? 'supplement'
      : 'main';
    return { title, passed, type };
  });

  return list;
}

function moveElement(number) {
  // Please update in due course.
  const element = document.querySelector(
    `ul[aria-label="必修教材リスト"] li:nth-child(${number}) div`,
  );

  if (!element) {
    // Outputs an error if it does not exist
    throw new Error(`Error: cannot find an element with number ${number}`);
  }

  // Dispatches a click event
  const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window,
  });
  element.dispatchEvent(event);
}

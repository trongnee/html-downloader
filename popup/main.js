document.querySelector('#start').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const [currentTab] = tabs;
    if (!currentTab) return;
    const func = () => {
      const tags = document.querySelectorAll('a');
      let links = [];
      tags.forEach(tag => {
        const href = tag.href;
        if (!links.filter(link => link === href).length && href.endsWith('.html')) {
          links.push(href);
        };
      });
      const origin = document.location.origin;
      chrome.runtime.sendMessage(
        { action: "download", links, origin },
      );
    }
    chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      func,
    });

  });
});
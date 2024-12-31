const resources = [];
let root;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "download") {
    const links = message.links;
    root = message.origin;
    let currentIndex = 0;
    const start = () => {
      if (currentIndex < links.length) {
        let url = links[currentIndex];
        chrome.tabs.create({ url, active: false }, (newTab) => {
          tabId = newTab.id;
          monitorNetworkRequests(tabId);
          chrome.tabs.onUpdated.addListener(function onUpdated(tabId, changeInfo, tab) {
            // Kiểm tra nếu tab đã tải xong và là tab đang mở
            if (tabId === tab.id && changeInfo.status === 'complete') {
              console.log(`Đã tải xong trang: ${url}`);
              currentIndex++;
              chrome.tabs.onUpdated.removeListener(onUpdated);
              chrome.tabs.remove(tabId, function () {
                if (chrome.runtime.lastError) {
                  console.error("Không thể đóng tab:", chrome.runtime.lastError);
                } else {
                  console.log("Đã đóng tab có URL: " + tab.url);
                }
              });
              start();
            }
          });
        });
      } else {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const [currentTab] = tabs;
          if (!currentTab) return;
          chrome.tabs.sendMessage(
            currentTab.id,
            {
              action: "createZip",
              resources
            }
          );
        });
      }
    }
    start();
  }
});
function monitorNetworkRequests(tabId) {
  chrome.webRequest.onCompleted.addListener(
    async (details) => {
      if (details.tabId === tabId) {
        const resourceUrl = details.url;
        if (resources.includes(resourceUrl) || !resourceUrl.startsWith(root)) {
          console.log('đã bỏ qua file: ', resourceUrl);
          return;
        }
        resources.push(resourceUrl);
      }
    },
    {
      urls: [
        "<all_urls>"
      ]
    }
  );
}
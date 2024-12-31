chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "createZip") {
    const zip = new JSZip();
    const resources = request.resources;
    const origin = document.location.origin;
    const fetchResource = async (url) => {
      const response = await fetch(url);
      return response.blob();
    }

    for (const resource of resources) {
      if (resource.endsWith('.html')) {
        const response = await fetch(resource);
        const html = await response.text();
        const htmlPath = resource.replace(origin, '');
        zip.file(htmlPath, html);
      } else {
        const resourceBlob = await fetchResource(resource);
        let [baseFilePath] = resource.split('?');
        baseFilePath = baseFilePath.replace(origin, '');
        zip.file(baseFilePath.replace(origin, ''), resourceBlob)
      }
    }
    const hostname = window.location.hostname;

    zip.generateAsync({ type: 'blob' }).then(function (content) {
      saveAs(content, `${hostname}.zip`);
    });
  }
});
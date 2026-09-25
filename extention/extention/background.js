// Right-click context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "solve-mcq",
    title: "Solve MCQ with AI",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "solve-mcq") {
    chrome.tabs.sendMessage(tab.id, { action: "solve" });
  }
});
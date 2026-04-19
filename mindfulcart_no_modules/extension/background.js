// background.js — MindfulCart service worker

const DASHBOARD_URL = "http://localhost:5173/demo";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.type === "open-decision-tab" && message.url) {
    chrome.tabs.create({ url: message.url, active: true }, (tab) => {
      sendResponse({ status: "opened", tabId: tab?.id });
    });
    return true; // async
  }

  if (message.type === "purchase-detected") {
    console.log("MindfulCart: purchase detected", message.data);
    sendResponse({ status: "received" });
  }

  return true;
});

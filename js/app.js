import { Router } from "./router.js";
import { Storage } from "./storage.js";

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  console.log("[System] Initialization started.");
  
  // Initialize Database and Global Listeners
  Storage.init();
  
  // Initialize Router last so it renders the UI
  Router.init();
  
  console.log("[System] Initialization complete.");
}
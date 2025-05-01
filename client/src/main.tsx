import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Import Material Icons via CDN
const materialIcons = document.createElement("link");
materialIcons.rel = "stylesheet";
materialIcons.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
document.head.appendChild(materialIcons);

// Import Google Fonts/Roboto
const googleFonts = document.createElement("link");
googleFonts.rel = "stylesheet";
googleFonts.href = "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap";
document.head.appendChild(googleFonts);

// Set title
const title = document.createElement("title");
title.textContent = "EmotionLens";
document.head.appendChild(title);

createRoot(document.getElementById("root")!).render(<App />);

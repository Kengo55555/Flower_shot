import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App";
import { clearAllImages } from "./lib/indexeddb";

// 一回限りのデータリセット
if (!localStorage.getItem("flower_shot_reset_v1")) {
  clearAllImages().then(() => {
    localStorage.setItem("flower_shot_reset_v1", "true");
    window.location.reload();
  });
} else {
  createRoot(document.getElementById("root")!).render(<App />);
}

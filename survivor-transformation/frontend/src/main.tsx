import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import './styles/global.less';

createRoot(document.getElementById("root")!).render(
  <div className="survivor-theme">
    <App />
  </div>
);

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { DocumentProvider } from "./context/DocumentContext";
import { EmailConfigProvider } from "./components/EmailConfigProvider";

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <EmailConfigProvider>
        <DocumentProvider>
          <App />
        </DocumentProvider>
      </EmailConfigProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

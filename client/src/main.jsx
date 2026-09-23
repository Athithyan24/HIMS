import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import "./index.css";
import { useAuth, useUi } from "./store/auth";

const qc = new QueryClient();

function Boot() {
  const hydrate = useAuth((s) => s.hydrate);
  const dark = useUi((s) => s.dark);
  React.useEffect(() => {
    hydrate();
    document.documentElement.classList.toggle("dark", dark);
  }, [hydrate, dark]);
  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Boot />
        <Toaster position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

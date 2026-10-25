import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
// @ts-ignore CSS side-effect imports are handled by the bundler.
import "./styles.css";
// @ts-ignore CSS side-effect imports are handled by the bundler.
import "./lab.css";
// @ts-ignore CSS side-effect imports are handled by the bundler.
import "./unit1.css";
// @ts-ignore CSS side-effect imports are handled by the bundler.
import "./unit2.css";
// @ts-ignore CSS side-effect imports are handled by the bundler.
import "./unit3.css";
// @ts-ignore CSS side-effect imports are handled by the bundler.
import "./unit4.css";
// @ts-ignore CSS side-effect imports are handled by the bundler.
import "./unit5.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { App } from "./App";
import { Preface } from "./Preface";
import "./styles.css";

const base = import.meta.env.BASE_URL;
const basename = base.endsWith("/") ? base.slice(0, -1) : base;

const router = createBrowserRouter(
  [
    { path: "/", element: <App /> },
    { path: "/preface", element: <Preface /> },
  ],
  { basename },
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);

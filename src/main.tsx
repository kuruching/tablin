import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import JaWrapper from './pages/JaWrapper';
import EnWrapper from './pages/EnWrapper';
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './index.css';

function RootRouter() {
  const navigate = useNavigate();
  const lang = navigator.language;
  const { pathname, search } = window.location;

  const hasQuery = search && search.length > 0;
  const isPureTop = pathname === "/" && !hasQuery;

  useEffect(() => {
    if (isPureTop) {
      if (lang.startsWith("ja")) {
        navigate("/ja", { replace: true });
      } else {
        navigate("/en", { replace: true });
      }
    }
  }, [isPureTop, lang, navigate]);

  return (
    <Routes>
      <Route path="/" element={<JaWrapper />} />
      <Route path="/ja" element={<JaWrapper />} />
      <Route path="/en" element={<EnWrapper />} />
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <RootRouter />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
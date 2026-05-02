import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  DashboardDataProvider,
  ThemeProvider
} from "./context/DashboardDataContext";
import AppLayout from "./layouts/AppLayout";
import VueGenerale from "./pages/VueGenerale";
import Capteurs from "./pages/Capteurs";
import Graphiques from "./pages/Graphiques";

function App() {
  return (
    <ThemeProvider>
      <DashboardDataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<VueGenerale />} />
              <Route path="capteurs" element={<Capteurs />} />
              <Route path="graphiques" element={<Graphiques />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DashboardDataProvider>
    </ThemeProvider>
  );
}

export default App;

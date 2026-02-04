import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import POSPage from "./pages/POSPage";
import LedgerPage from "./pages/LedgerPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<POSPage />} />
          <Route path="ledger" element={<LedgerPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

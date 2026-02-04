import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import POSPage from "./pages/POSPage";
import LedgerPage from "./pages/LedgerPage";
import AddProductPage from "./pages/AddProductPage";
import ReceiveStockPage from "./pages/ReceiveStockPage";
import StockHistoryPage from "./pages/StockHistoryPage";
import ProfitReportPage from "./pages/ProfitReportPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<POSPage />} />
          <Route path="product/add" element={<AddProductPage />} />
          <Route path="stock/receive" element={<ReceiveStockPage />} />
          <Route path="stock/history" element={<StockHistoryPage />} />
          <Route path="report/profit" element={<ProfitReportPage />} />
          <Route path="ledger" element={<LedgerPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

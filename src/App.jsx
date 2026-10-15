import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import CreateDraw from "./pages/CreateDraw";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateDraw />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
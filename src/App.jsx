import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import CreateDraw from "./pages/CreateDraw";
import JoinRoom from "./pages/JoinRoom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateDraw />} />
        <Route path="/entrar" element={<JoinRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
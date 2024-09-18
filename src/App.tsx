import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import Home from "./pages/Home";
import Match from "./pages/Match";

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/" element={<Match />} />
      </Routes>
    </Router>
  );
}

export default App;

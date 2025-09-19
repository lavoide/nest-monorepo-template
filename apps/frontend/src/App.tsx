import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';

/* Theme variables */
import './theme/variables.css';

const App: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/" element={<Navigate to="/home" replace />} />
    </Routes>
  </Router>
);

export default App;
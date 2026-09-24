import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Attire from './pages/Attire';
import Travel from './pages/Travel';
import FrenchHome from './pages/FrenchHome';
import FrenchAttire from './pages/FrenchAttire';
import FrenchTravel from './pages/FrenchTravel';
import BookVijayran from './pages/BookVijayran';
import FrenchBookVijayran from './pages/FrenchBookVijayran';
import ScrollToHashElement from './components/ScrollToHashElement';
import './App.css';

// Admin CMS Imports
import './admin/admin.css';
import AdminLogin from './admin/pages/AdminLogin';
import Dashboard from './admin/pages/Dashboard';
import HomeEditor from './admin/pages/HomeEditor';
import AttireEditor from './admin/pages/AttireEditor';
import TravelEditor from './admin/pages/TravelEditor';
import VijayranEditor from './admin/pages/VijayranEditor';
import RsvpList from './admin/pages/RsvpList';
import Media from './admin/pages/Media';
import ProtectedAdminRoute from './admin/components/ProtectedAdminRoute';

function App() {
  return (
    <Router>
      <ScrollToHashElement />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/attire" element={<Attire />} />
        <Route path="/travel" element={<Travel />} />
        <Route path="/fr" element={<FrenchHome />} />
        <Route path="/fr/" element={<FrenchHome />} />
        <Route path="/fr/attire" element={<FrenchAttire />} />
        <Route path="/fr/travel" element={<FrenchTravel />} />
        <Route path="/book-vijayran" element={<BookVijayran />} />
        <Route path="/fr/book-vijayran" element={<FrenchBookVijayran />} />

        {/* Admin CMS Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedAdminRoute title="Dashboard"><Dashboard /></ProtectedAdminRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedAdminRoute title="Dashboard"><Dashboard /></ProtectedAdminRoute>} />
        <Route path="/admin/home-editor" element={<ProtectedAdminRoute title="Home Editor"><HomeEditor /></ProtectedAdminRoute>} />
        <Route path="/admin/attire-editor" element={<ProtectedAdminRoute title="Attire Editor"><AttireEditor /></ProtectedAdminRoute>} />
        <Route path="/admin/travel-editor" element={<ProtectedAdminRoute title="Travel Editor"><TravelEditor /></ProtectedAdminRoute>} />
        <Route path="/admin/vijayran-editor" element={<ProtectedAdminRoute title="Vijayran Editor"><VijayranEditor /></ProtectedAdminRoute>} />
        <Route path="/admin/rsvp" element={<ProtectedAdminRoute title="RSVP Submissions"><RsvpList /></ProtectedAdminRoute>} />
        <Route path="/admin/media" element={<ProtectedAdminRoute title="Media Library"><Media /></ProtectedAdminRoute>} />
      </Routes>
    </Router>
  );
}

export default App;


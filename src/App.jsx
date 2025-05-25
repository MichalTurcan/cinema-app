import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LenguageContext';


import Home from "./pages/Home";
import Events from "./pages/Events";
import FullTeam from "./pages/FullTeam";
import MovieInfo from "./pages/MovieInfo";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import Nav from './components/nav';
import Footer from './components/footer';
import Changer from './components/change-theme';
import Movies from './pages/Movies';
import MoviesVote from './pages/MoviesVote';
import Users from './pages/Users';
import Members from './pages/Members';
import Add_Event from './pages/Add_Event';
import EventAddImages from './components/eventAddImages';

import { AuthProvider } from "./context/AuthContext"; 
import ProtectedRoute from "./components/protectedRoute";
import UserInfo from './pages/UserInfo';
import EditUserInfo from './pages/EditUserInfo';



function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <Nav />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/fullteam" element={<FullTeam />} />
            <Route path="/:movieId/movieInfo" element={<MovieInfo />} />
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/movies" element={<ProtectedRoute requiredRole="member"><Movies /></ProtectedRoute>} />
            <Route path="/movies/create_vote" element={<ProtectedRoute requiredRole="admin"><MoviesVote /></ProtectedRoute>} />
            <Route path="/events/add_events" element={<ProtectedRoute requiredRole="member"><Add_Event /></ProtectedRoute>} />
            <Route path="/events/event-add-images/:eventId" element={<ProtectedRoute requiredRole="member">< EventAddImages /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute requiredRole="member"><Users /></ProtectedRoute>} />
            <Route path="/users/:userId/userInfo" element={<ProtectedRoute requiredRole="owner-or-member"><UserInfo /></ProtectedRoute>} />
            <Route path="/users/:userId/editUserInfo" element={<ProtectedRoute requiredRole="owner" ><EditUserInfo /></ProtectedRoute>} />
            <Route path="/members" element={<ProtectedRoute requiredRole="member"><Members /></ProtectedRoute>}/>
          </Routes>
          <Footer />
          <Changer />
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;

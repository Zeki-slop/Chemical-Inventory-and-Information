import React from 'react';
import { Routes, Route } from 'react-router-dom';

import { WalletProvider } from './context/WalletContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { UserDataProvider } from './context/UserDataContext.jsx';

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ToastStack from './components/ToastStack.jsx';

import Home from './pages/Home.jsx';
import SearchResults from './pages/SearchResults.jsx';
import ChemicalDetails from './pages/ChemicalDetails.jsx';
import VerifiedReports from './pages/VerifiedReports.jsx';
import Dashboard from './pages/Dashboard.jsx';
import About from './pages/About.jsx';
import Compare from './pages/Compare.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <UserDataProvider>
          <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <main className="flex-grow-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/chemical/:source/:id" element={<ChemicalDetails />} />
                <Route path="/reports" element={<VerifiedReports />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <ToastStack />
          </div>
        </UserDataProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}

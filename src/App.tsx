import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import type { Club } from "./Classes/Club";
import type { User } from "./api/client";
import LandingPage from "./Pages/LandingPage.tsx";
import ClubViewPage from "./Pages/ClubViewPage.tsx";
import LoginPage from "./Pages/LoginPage.tsx";
import SignupPage from "./Pages/SignupPage.tsx";
import ClubDetailedView from "./Pages/ClubDetailedView.tsx";



export default function App() {
  const navigate = useNavigate();
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [searchString, setSearchString] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("rmc_auth");
    return stored ? JSON.parse(stored) : null;
  });

  const handleNavigateClubs = () => {
    setRefreshKey(k => k + 1);
    navigate("/clubs");
  };

  const handleSearchLandingPage = (searchString: string) => {
    setSearchString(searchString);
    handleNavigateClubs();
  };

  const handleSelectedClub = (selectedClub: Club) => {
    setSelectedClub(selectedClub);
    navigate(`/clubs/${selectedClub?.club_id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("rmc_auth");
    setCurrentUser(null);
    navigate("/");
  };

  console.log("refreshKey:", refreshKey);
  return (
    <Routes>
      <Route
        path="/"
        element={
          <LandingPage
            onSearchClub={(searchValue) => handleSearchLandingPage(searchValue)}
            onNavigateLogin={() => navigate("/login")}
            onNavigateSignup={() => navigate("/signup")}
          />
        }
      />
      <Route
        path="/clubs"
        element={
          <ClubViewPage
            key={refreshKey}
            onSelectClub={(club) => handleSelectedClub(club)}
            onSetActiveSearchString={(value) => setSearchString(value)}
            activeSearchString={searchString}
            onNavigateHome={() => navigate("/")}
            onNavigateLogin={() => navigate("/login")}
            onNavigateSignup={() => navigate("/signup")}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/clubs/:clubId"
        element={
          <ClubDetailedView
            onSetActiveSearchString={(value) => setSearchString(value)}
            onSearchClub={(searchString: string) => handleSearchLandingPage(searchString)}
            activeSearchString={searchString}
            clubBeingViewed={selectedClub}
            currentUser={currentUser}
            onNavigateHome={() => navigate("/")}
            onNavigateLogin={() => navigate("/login")}
            onNavigateSignup={() => navigate("/signup")}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/login"
        element={
          <LoginPage
            onNavigateHome={() => navigate("/")}
            onNavigateSignup={() => navigate("/signup")}
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              handleNavigateClubs();
            }}
          />
        }
      />
      <Route
        path="/signup"
        element={
          <SignupPage
            onNavigateHome={() => navigate("/")}
            onNavigateLogin={() => navigate("/login")}
          />
        }
      />
    </Routes>
  );
}

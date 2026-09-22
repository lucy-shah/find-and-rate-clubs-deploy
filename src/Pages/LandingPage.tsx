import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { searchBarStyles } from "../Presets/SearchBar";
import { clubAPI } from "../api/client";
import type { Club } from "../Classes/Club";
import { defaultClubs } from "../Classes/Club";

type Props = {
  onSearchClub: (searchString: string) => void;
  onNavigateLogin: () => void;
  onNavigateSignup: () => void;
};

export default function LandingPage({ onSearchClub, onNavigateLogin, onNavigateSignup }: Props) {
  const [clubNameSearchValue, setClubNameSearchValue] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(8);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const loadClubs = async () => {
      try {
        const data = await clubAPI.getAllClubs();
        if (!cancelled) setClubs(data ?? defaultClubs);
      } catch (err) {
        console.error("Failed to load clubs, falling back to defaults:", err);
        if (!cancelled) setClubs(defaultClubs);
      }
    };

    loadClubs();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = async () => {
    if (clubNameSearchValue.trim() === "") {
      onSearchClub("");
      return;
    }

    try {
      setSearching(true);
      // Perform search via backend API
      const results = await clubAPI.searchClubs(clubNameSearchValue);
      console.log("Search results:", results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
      onSearchClub(clubNameSearchValue);
    }
  };

  return (
    <div style={{ backgroundColor: "#ffffff", width: "100%", height: "100%" }}>
      <div
        style={{ marginTop: "2rem" }} // ------- EMPTY SPACE
      ></div>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <button
          style={{
            backgroundColor: "transparent",
            border: "none",
            color: "#000000",
            fontSize: "1.25rem",
            fontWeight: "600",
            cursor: "pointer",
            padding: "0.75rem 1.5rem",
          }}
          onClick={onNavigateLogin}
        >
          Log In
        </button>
        <button
          style={{
            backgroundColor: "#000000",
            border: "none",
            color: "#ffffff",
            fontSize: "1.25rem",
            fontWeight: "600",
            cursor: "pointer",
            padding: "0.75rem 2rem",
            borderRadius: "9999px", // Makes it fully rounded
          }}
          onClick={onNavigateSignup}
        >
          Sign Up
        </button>
      </div>

      <div style={{ marginTop: "2rem" }}></div>
      <div
        style={{
          width: "100%",
          backgroundColor: "#3a3a3aff",
          backgroundImage: "url(src/Images/Campus.jpg)",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }} // Frame covering elements
      >
        <div style={{ backgroundColor: "#00000079", padding: "1rem 1rem" }}>
          <div
            style={{
              color: "#f6f6f6ff",
              textAlign: "center",
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontSize: "2.5rem",
              marginTop: "2rem",
              fontWeight: 400,
            }} // ------ Title Text
          >
            <strong>Husky ClubQuest</strong>
          </div>
          <div
            style={{
              color: "#f6f6f6ff",
              textAlign: "center",
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontSize: "1.5rem",
              marginTop: "2rem",
              fontWeight: 400,
            }} // ------ Title Text
          >
            Enter a <strong>Club</strong> to get Started
          </div>
          <div
            style={{
              ...searchBarStyles.searchContainer,
              margin: "0 auto",
              marginBottom: "1rem",
              position: "relative", 
            }}
          >
            <input
              type="text"
              value={clubNameSearchValue}
              onChange={(e) => setClubNameSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder={"Type here..."}
              style={searchBarStyles.searchInput}
            />
            <button
              style={{
                position: "absolute",
                top: "50%",
                right: "-2.3rem", 
                transform: "translateY(-50%)",
                background: "transparent",
                borderRadius: "50%",
                border: "none",
                padding: "0.25rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                fontSize:"2.1rem"
              }}
              onClick={handleSearch}
              disabled={searching}
            >
              {searching ? "⏳" : "🔍"}
            </button>
          </div>

          {/* Clubs tiles section (inside hero overlay, under search) */}
          <div style={{ padding: "1rem 1rem 2rem 1rem", maxWidth: 1100, margin: "0 auto" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "1rem",
                alignItems: "stretch",
              }}
            >
              {clubs.length === 0 ? (
                <div style={{ gridColumn: "1/-1", color: "#ddd" }}>No clubs available.</div>
              ) : (
                clubs.slice(0, visibleCount).map((club) => (
                  <div
                    key={club.id}
                    style={{
                      background: "rgba(255,255,255,0.95)",
                      padding: "0.75rem",
                      borderRadius: 8,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minHeight: 120,
                    }}
                  >
                    <div>
                      <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.05rem", color: "#000", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                        {club.name ?? "Unnamed Club"}
                      </h4>
                        <p style={{ margin: 0, color: "#333", fontSize: "0.95rem", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                          {club.mission && club.mission.length > 240
                            ? club.mission.slice(0, 237) + "..."
                            : club.mission ?? "No description available."}
                        </p>

                        <div style={{ marginTop: "0.5rem", color: "#555", fontSize: "0.85rem", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                          <div><strong>Type:</strong> {club.org_type ?? "N/A"}</div>
                          <div><strong>Campus:</strong> {club.campus ?? "N/A"}</div>
                          <div><strong>Categories:</strong> {(club.categories || []).join(", ") || "N/A"}</div>
                        </div>
                    </div>

                    <div style={{ marginTop: "0.5rem", display: "flex", justifyContent: "flex-end" }}>
                      <button
                        style={{
                          background: "#000",
                          color: "#fff",
                          border: "none",
                          padding: "0.4rem 0.6rem",
                          borderRadius: 6,
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          const targetId = club.club_id ?? club.id;
                          // Navigate and pass the club object in location state so the detail page can use it
                          navigate(`/clubs/${targetId}`, { state: { club } });
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Load more button */}
            {clubs.length > visibleCount && (
              <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
                <button
                  onClick={() => setVisibleCount((c) => Math.min(clubs.length, c + 8))}
                  style={{
                    background: "transparent",
                    border: "1px solid #fff",
                    color: "#fff",
                    padding: "0.45rem 0.9rem",
                    borderRadius: 6,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    cursor: "pointer",
                  }}
                >
                  Load more
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { ratingAPI, clubAPI } from "../api/client";
import type { Rating } from "../api/client";
import type { Club } from "../Classes/Club";
import TopBar from "../Presets/TopBar";
import type { User } from "../api/client";

type Props = {
  onNavigateLogin: () => void;
  onNavigateSignup: () => void;
  activeSearchString: string;
  onSetActiveSearchString: (searchString: string) => void;
  onNavigateHome: () => void;
  clubBeingViewed: Club | null;
  onSearchClub: (value: string) => void;
  currentUser: User | null;
  onLogout?: () => void;
};

export default function ClubDetailedView({
  onNavigateLogin,
  onNavigateSignup,
  onSetActiveSearchString,
  activeSearchString,
  onNavigateHome,
  clubBeingViewed,
  onSearchClub,
  currentUser,
  onLogout,
}: Props) {
  const { clubId } = useParams();
  const location = useLocation();
  // Prefer the club passed via navigation state (from LandingPage). Fall back to the prop provided by App.
  const navClub = (location.state as any)?.club as Club | undefined;
  const [club, setClub] = useState<Club | null>(navClub ?? clubBeingViewed ?? null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [commentText, setCommentText] = useState<string>("");

  useEffect(() => {
    // If navigation provided a club that's different from the current one, adopt it.
    if (navClub && (!club || (navClub.club_id ?? navClub.id) !== (club.club_id ?? club.id))) {
      setClub(navClub);
      return;
    }

    // If we don't have a club or the current club doesn't match the URL, fetch it from the API
    if (clubId) {
      const currentId = club ? String(club.club_id ?? club.id) : null;
      if (!currentId || currentId !== String(clubId)) {
        clubAPI.getClubById(Number(clubId)).then(setClub).catch((err) => console.error("Failed to load club:", err));
      }
    }
  }, [navClub, club, clubId]);

  useEffect(() => {
    if (club?.club_id != null) {
      ratingAPI.getClubRatings(club.club_id).then(setRatings);
    }
  }, [club?.club_id]);

  if (club === null) return null;

  const handleSearchButtonClicked = () => {
    onSetActiveSearchString(activeSearchString);
    onSearchClub(activeSearchString);
  };

  const handleSubmitReview = async () => {
    if (selectedRating === 0 || !club || !currentUser) return;
    console.log("club_id:", club.club_id, "user_id:", currentUser.user_id);

    try {
      const newRating = await ratingAPI.createRating(
        club.club_id!,
        currentUser.user_id,
        selectedRating,
        commentText || null
      );
      setRatings((prev) => [...prev, newRating]);
      setSelectedRating(0);
      setCommentText("");
    } catch (err) {
      console.error("Failed to submit review:", err);
    }
  };

  const totalRatings = ratings.length;
  const averageRating = totalRatings > 0
    ? ratings.reduce((sum, r) => sum + r.rating_score, 0) / totalRatings
    : 0;

  const ratingLabels = ["Awesome", "Great", "Good", "OK", "Terrible"];
  const ratingValues = [5, 4, 3, 2, 1];
  const ratingCounts = ratingValues.map(
    (val) => ratings.filter((r) => r.rating_score === val).length
  );
  const maxCount = Math.max(...ratingCounts, 1);

  return (
    <div style={{ backgroundColor: "#ffffff", width: "100%", height: "100%", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <TopBar
        onSearchButtonClicked={handleSearchButtonClicked}
        onSetActiveSearchString={onSetActiveSearchString}
        activeSearchString={activeSearchString}
        onNavigateHome={onNavigateHome}
        onNavigateLogin={onNavigateLogin}
        onNavigateSignup={onNavigateSignup}
        showFilterButton={false}
        leftCornerText={""}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <div style={{ display: "flex", flexWrap: "wrap", padding: "100px 2rem 2rem 15.6rem", gap: "2.6rem" }}>
        {/* Left side */}
        <div style={{ minWidth: "286px", flex: "0 0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
            <span style={{ fontSize: "6.5rem", fontWeight: 900, lineHeight: 1 }}>
              {averageRating.toFixed(1)}
            </span>
            <span style={{ fontSize: "1.56rem", color: "#888" }}>/ 5</span>
          </div>
          <p style={{ fontWeight: 700, marginBottom: "1.95rem", fontSize: "1.235rem" }}>
            Overall Quality Based on{" "}
            <span style={{ textDecoration: "underline" }}>{totalRatings} ratings</span>
          </p>
          <h2 style={{ fontSize: "2.6rem", fontWeight: 900, margin: 0 }}>{club.name}</h2>
          <p style={{ fontSize: "1.1rem", color: "#444", lineHeight: 1.7, maxWidth: "300px", margin: 0, marginTop: "1.5rem" }}>
            {club.mission}
          </p>
        </div>

        {/* Right side - Rating Distribution */}
        <div style={{ flex: "1 1 390px", backgroundColor: "#f5f5f5", borderRadius: "10px", padding: "1.95rem 3rem", maxWidth: "676px" }}>
          <p style={{ fontWeight: 700, marginBottom: "1.3rem", fontSize: "1.3rem" }}>Rating Distribution</p>
          {ratingLabels.map((label, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.975rem", marginBottom: "1.5rem" }}>
              <span style={{ width: "7.15rem", textAlign: "right", fontSize: "1.235rem", flexShrink: 0 }}>
                {label} <strong>{ratingValues[i]}</strong>
              </span>
              <div style={{ flex: 1, backgroundColor: "#e0e0e0", borderRadius: "4px", height: "2.5rem" }}>
                <div style={{
                  width: `${(ratingCounts[i] / maxCount) * 100}%`,
                  backgroundColor: "#1a73e8",
                  height: "100%",
                  borderRadius: "4px",
                }} />
              </div>
              <span style={{ width: "2.5rem", fontWeight: 900, fontSize: "1.5rem", flexShrink: 0 }}>
                {ratingCounts[i]}
              </span>
            </div>
          ))}
        </div>

        {/* Review Form */}
        {currentUser ? (
          <div style={{ width: "100%", maxWidth: "879px" }}>
            <p style={{ fontWeight: 700, fontSize: "1.69rem", marginBottom: "1.3rem" }}>Leave a Review</p>
            <div style={{ display: "flex", gap: "0.65rem", marginBottom: "0.65rem" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  style={{
                    fontSize: "2.6rem",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: star <= (hoveredRating || selectedRating) ? "#ffae00ff" : "#ccc",
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your experience with this club..."
              style={{
                width: "100%",
                minHeight: "10.4rem",
                padding: "1.3rem",
                borderRadius: "10px",
                border: "1px solid #e0e0e0",
                fontSize: "1.3rem",
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                resize: "vertical",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            <button
              onClick={handleSubmitReview}
              style={{
                marginTop: "0.975rem",
                padding: "0.975rem 2.6rem",
                backgroundColor: "#111111",
                color: "#ffffff",
                border: "none",
                borderRadius: "999px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Submit Review
            </button>
          </div>
        ) : (
          <div style={{ width: "100%", maxWidth: "879px" }}>
            <p style={{ fontWeight: 700, fontSize: "1.69rem", marginBottom: "0.5rem" }}>Leave a Review</p>
            <p style={{ color: "#555", fontSize: "1rem" }}>
              <button
                onClick={onNavigateLogin}
                style={{ background: "none", border: "none", color: "#1a73e8", cursor: "pointer", fontSize: "1rem", padding: 0 }}
              >
                Log in
              </button>{" "}to leave a review.
            </p>
          </div>
        )}

        {/* Reviews List */}
        {ratings.filter(r => r.review_text).length > 0 && (
          <div style={{ width: "100%", maxWidth: "879px", marginTop: "2rem", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
            <p style={{ fontWeight: 700, fontSize: "1.69rem", marginBottom: "1rem" }}>Reviews</p>
            {ratings.filter(r => r.review_text).map((r) => (
              <div key={r.rating_id} style={{ backgroundColor: "#f5f5f5", borderRadius: "10px", padding: "1rem 1.3rem", marginBottom: "1rem", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                <div style={{ marginBottom: "0.4rem", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                  {"★".repeat(r.rating_score)}{"☆".repeat(5 - r.rating_score)}
                </div>
                <p style={{ margin: 0, fontSize: "1rem", color: "#333", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>{r.review_text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

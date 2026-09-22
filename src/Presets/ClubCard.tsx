import type { Club } from "../Classes/Club";

interface ClubCardProps {
  club: Club;
  onSelectClub: (club: Club) => void;
}


function getRatingColor(rating: number): string {
  const clampedRating = Math.max(1, Math.min(5, rating));

  if (clampedRating <= 2) {
    // Red to Orange (1.0 to 2.0)
    const ratio = (clampedRating - 1) / 1; // 0 to 1
    const red = 255;
    const green = Math.round(69 + ratio * (186 - 69)); // 69 to 255
    return `rgb(${red}, ${green}, 0)`;
  } else if (clampedRating <= 3) {
    // Orange to Yellow (2.0 to 3.0)
    const ratio = (clampedRating - 2) / 1; // 0 to 1
    const red = Math.round(255 - ratio * 1); // 255 to 254
    const green = Math.round(186 + ratio * (228 - 186)); // 186 to 228
    const blue = Math.round(0 + ratio * 138); // 0 to 138
    return `rgb(${red}, ${green}, ${blue})`;
  } else if (clampedRating <= 4) {
    // Yellow to Light Green (3.0 to 4.0)
    const ratio = (clampedRating - 3) / 1; // 0 to 1
    const red = Math.round(254 - ratio * (134 - 254)); // 254 to 134
    const green = Math.round(228 + ratio * (239 - 228)); // 228 to 239
    const blue = Math.round(138 - ratio * 18); // 138 to 120
    return `rgb(${red}, ${green}, ${blue})`;
  } else {
    // Light Green to Green (4.0 to 5.0)
    const ratio = (clampedRating - 4) / 1; // 0 to 1
    const red = Math.round(134 - ratio * 90); // 134 to 34
    const green = Math.round(239 - ratio * 42); // 239 to 197
    const blue = Math.round(120 - ratio * 26); // 120 to 94
    return `rgb(${red}, ${green}, ${blue})`;
  }
}

export default function ClubCard({ club, onSelectClub }: ClubCardProps) {
  return (
    <button
      style={{
        all: "unset",
        display: "block",
        cursor: "pointer",
        width: "100%",
      }}
      onClick={() => {onSelectClub(club)}}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#f4f4f4ff",
          padding: "1.5rem",
          borderRadius: "8px",
          gap: "2rem",
          maxWidth: "60%",
          marginBottom: "1rem",
          marginLeft: "8rem",
          border: "3rem",
        }}
      >
        {/* Left - Rating Box */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <div
            style={{
              backgroundColor: getRatingColor(club.average_rating),
              width: "8rem",
              height: "8rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px",
              border: "1rem",
            }}
          >
            <span
              style={{
                fontSize: "3.5rem",
                fontWeight: "bold",
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                color: "#000000",
              }}
            >
              {club.average_rating.toFixed(1)}
            </span>
          </div>
          <span
            style={{
              fontSize: "0.95rem",
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              color: "#666666",
            }}
          >
            {club.number_of_ratings} ratings
          </span>
        </div>

        {/* Middle - Club Info */}
        <div style={{ flex: 1 }}>
          <h2
            style={{
              fontSize: "2rem",
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontWeight: "bold",
              color:"#000000",
              margin: "0",
              marginBottom: "0.5rem",
            }}
          >
            {club.name ?? "Unnamed Club"}
          </h2>
          <div
            style={{
              fontSize: "0.75rem",
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontWeight: "600",
              color: "#666666",
              letterSpacing: "0.05em",
              marginBottom: "0.5rem",
            }}
          >
            {(club.org_type ?? "").toUpperCase()}
          </div>
          <div
            style={{
              fontSize: "1rem",
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              color: "#666666",
              marginBottom: "1.5rem",
            }}
          >
            {club.mission ?? "No description available."}
          </div>

          <div
            style={{
              fontSize: "1rem",
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              color: "#666666",
              marginBottom: "1.5rem",
            }}
          >
            {club.categories.join(" | ")}
          </div>

        </div>
      </div>
    </button>
  );
}

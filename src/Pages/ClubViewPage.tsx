import { useState, useEffect } from "react";
import type { Club } from "../Classes/Club";
import { defaultClubs } from "../Classes/Club";
import type { ClubFilter } from "../Classes/ClubFilter";
import { emptyClubFilter } from "../Classes/ClubFilter";
import type { User } from "../api/client";
import ClubCard from "../Presets/ClubCard";
import TopBar from "../Presets/TopBar";
import ClubSearchFilters from "../Presets/ClubFilter";
import { clubAPI } from "../api/client";

type Props = {
  onSelectClub: (club: Club) => void;
  onSetActiveSearchString: (searchString: string) => void;
  activeSearchString: string;
  onNavigateHome: () => void;
  onNavigateLogin: () => void;
  onNavigateSignup: () => void;
  currentUser?: User | null;
  onLogout?: () => void;
};

export default function ClubViewPage({
  onSelectClub,
  onSetActiveSearchString,
  activeSearchString,
  onNavigateHome,
  onNavigateLogin,
  onNavigateSignup,
  currentUser,
  onLogout,
}: Props) {
  const [clubsTable, setClubsTable] = useState<Club[]>(defaultClubs);
  const [clubsShown, setClubsShown] = useState<Club[]>(defaultClubs);
  const [activeClubFilter, setActiveClubFilter] =
    useState<ClubFilter>(emptyClubFilter);
  const [filteringClubs, setFilteringClubs] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true);
        const clubs = await clubAPI.getAllClubs();
        const mappedClubs = clubs
        .map(my_club => ({ ...my_club }))
        .sort((a, b) => b.average_rating - a.average_rating);  // add this line
        setClubsTable(mappedClubs);
        setClubsShown(mappedClubs);
      } catch (err) {
        setError("Failed to load clubs. Please try again.");
        console.error("Error fetching clubs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  useEffect(() => {
    let end_club_list: Club[] = [...clubsTable];
    end_club_list = filterClubs(end_club_list, activeClubFilter);
    end_club_list = searchClubsLocal(end_club_list, activeSearchString);
    setClubsShown(end_club_list);
  }, [activeSearchString, clubsTable, activeClubFilter]);

  const filterClubs = (end_club_list: Club[], filters: ClubFilter) => {
    if (filters === null) return end_club_list;

    if (filters?.["Average Rating"]) {
      const [min] = filters["Average Rating"].split(" - ").map(Number);
      end_club_list = end_club_list.filter((club) => club.average_rating >= min);
    }

    if (filters?.["Club Category"]) {
      end_club_list = end_club_list.filter(
        (club) => club.org_type === filters["Club Category"]
      );
    }

    if (filters?.["Meeting Days"]) {
      end_club_list = end_club_list.filter((club) =>
        club.categories.includes(filters["Meeting Days"] as string)
      );
    }

    if (filters?.["# of Ratings"]) {
      const [min] = filters["# of Ratings"].split("+").map(Number);
      end_club_list = end_club_list.filter((club) => club.number_of_ratings >= min);
    }

    return end_club_list;
  };

  const searchClubsLocal = (end_club_list: Club[], filterText: string) => {
    if (filterText === "" || filterText === null) return end_club_list;
    return end_club_list.filter(
      (club) =>
        (club.name ?? "").toLowerCase().includes(filterText.toLowerCase()) ||
        (club.mission ?? "").toLowerCase().includes(filterText.toLowerCase())
    );
  };

  const handleSearchButtonClicked = () => {
    let end_club_list: Club[] = [...clubsTable];
    end_club_list = filterClubs(end_club_list, activeClubFilter);
    end_club_list = searchClubsLocal(end_club_list, activeSearchString);
    setClubsShown(end_club_list);
  };

  const handleClubFilterChange = (filters: ClubFilter) => {
    let end_club_list: Club[] = [...clubsTable];
    end_club_list = filterClubs(end_club_list, filters);
    end_club_list = searchClubsLocal(end_club_list, activeSearchString);
    setActiveClubFilter(filters);
    setClubsShown(end_club_list);
  };

  return (
    <div style={{ backgroundColor: "#ffffff", width: "100%", height: "100%" }}>
      <TopBar
        onSetActiveSearchString={(searchString) => onSetActiveSearchString(searchString)}
        activeSearchString={activeSearchString}
        onSearchButtonClicked={handleSearchButtonClicked}
        onNavigateHome={onNavigateHome}
        setFilteringClubs={(bool: boolean) => setFilteringClubs(bool)}
        filteringClubs={filteringClubs}
        onNavigateLogin={onNavigateLogin}
        onNavigateSignup={onNavigateSignup}
        showFilterButton={true}
        leftCornerText={"Search Clubs"}
        currentUser={currentUser}
        onLogout={onLogout}
      />
      {filteringClubs === true && (
        <ClubSearchFilters
          onClose={() => setFilteringClubs(false)}
          onFilterChange={handleClubFilterChange}
        />
      )}
      <div
        style={{
          marginTop: "80px",
          padding: "20px",
          overflowY: "auto",
          height: "calc(100vh - 80px)",
        }}
      >
        {loading && (
          <div style={{ padding: "32px 24px", marginLeft: "20rem" }}>
            <p style={{ fontSize: "1.8rem", fontWeight: "400", color: "#000000" }}>
              Loading clubs...
            </p>
          </div>
        )}

        {error && (
          <div style={{ padding: "32px 24px", marginLeft: "20rem" }}>
            <p style={{ fontSize: "1.8rem", color: "red" }}>{error}</p>
          </div>
        )}

        {!loading && clubsShown.length > 0 &&
          clubsShown.map((clubObject) => (
            <ClubCard
              key={clubObject.club_id}
              club={clubObject}
              onSelectClub={(club) => onSelectClub(club)}
            />
          ))}

        {!loading && clubsShown.length === 0 && (
          <div style={{ padding: "32px 24px", marginLeft: "20rem" }}>
            <p style={{ fontSize: "1.8rem", fontWeight: "400", color: "#000000", margin: "0 0 20px 0", lineHeight: "1.4", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
              There are no clubs that match your requirements.
            </p>
            <p style={{ fontSize: "1.2rem", fontWeight: "400", color: "#333333", margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
              Try an alternate spelling or broaden your search
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

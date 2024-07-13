import React, { useEffect, useState } from "react";
import {
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import "./Main.css";
import Search from "../Search/Search";
import Results from "../Results/Results";
import PersonDetailed from "../PersonDetailed/PersonDetailed";
import useLS from "../../hooks/useLS";

interface PersonData {
  name: string;
  gender: string;
  birth_year: string;
}

const Main: React.FC = () => {
  const [hasError, setHasError] = useState(false);
  const [people, setPeople] = useState<PersonData[]>([]);
  const [isLoading, setIsLoading] =
    useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [totalPages, setTotalPages] = useState<number>(0);
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(
    searchParams.get("page") || "1",
    10,
  );

  const detailsName = searchParams.get("details");

  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useLS(
    "searchedPerson",
  );

  const throwError = () => {
    setHasError(true);
  };

  if (hasError) throw new Error("Test Error");

  const fetchPeople = async (
    name: string,
    page: number = 1,
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://swapi.py4e.com/api/people/?search=${name}&page=${page}`,
      );
      const data = await response.json();
      setPeople(data.results);
      setTotalPages(Math.ceil(data.count / 10));
    } catch (error) {
      setError("Error fetching data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPeople(searchQuery || "", currentPage);
  }, [searchQuery, currentPage]);

  const searchPerson = (name: string) => {
    setSearchQuery(name);
    setSearchParams({ page: "1" });
    fetchPeople(name, 1);
  };

  const handlePageChange = (
    newPage: number,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.stopPropagation();
    setSearchParams({
      page: newPage.toString(),
      details: detailsName || "",
    });
  };

  const handleCloseDetails = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    const target = event.target as HTMLElement;
    if (
      target.tagName === "BUTTON" ||
      target.closest("button")
    ) {
      return;
    }
    navigate(`/?page=${currentPage}`);
  };

  return (
    <div className="main">
      <section className="top">
        <Search searchPerson={searchPerson} />
      </section>

      <section className="bottom">
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <div className="bottom__content">
            <div
              className={
                !detailsName
                  ? "bottom__content_wide"
                  : "bottom__content_left"
              }
              onClick={handleCloseDetails}
            >
              <Results people={people} />
              <div className="pagination">
                {currentPage > 1 && (
                  <button
                    onClick={event =>
                      handlePageChange(
                        currentPage - 1,
                        event,
                      )
                    }
                  >
                    Previous
                  </button>
                )}
                {currentPage > 1 && (
                  <span className="currentPage">
                    Page {currentPage}
                  </span>
                )}
                {currentPage < totalPages && (
                  <button
                    onClick={event =>
                      handlePageChange(
                        currentPage + 1,
                        event,
                      )
                    }
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
            {detailsName && (
              <div className="bottom__content_right">
                <PersonDetailed />
              </div>
            )}
          </div>
        )}

        <button
          className="errorBoundaryCheck"
          onClick={throwError}
        >
          Error Boundary Check
        </button>
      </section>
    </div>
  );
};

export default Main;

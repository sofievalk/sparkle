import React, { useMemo } from "react";

import { GenericVenue } from "types/venues";

import { WithId } from "utils/id";
import { enterVenue } from "utils/url";

import { usePosters } from "hooks/posters";

import { Button } from "components/atoms/Button";

import { PosterPreview } from "./components/PosterPreview";
import { PosterHallSearch } from "./components/PosterHallSearch";

import "./PosterHall.scss";

export interface PosterHallProps {
  venue: WithId<GenericVenue>;
}

export const PosterHall: React.FC<PosterHallProps> = ({ venue }) => {
  const {
    posterVenues,
    isPostersLoaded,

    increaseDisplayedPosterCount,

    searchInputValue,
    setSearchInputValue,
    liveFilter,
    setLiveFilter,
  } = usePosters(venue.id);

  const renderedPosterPreviews = useMemo(() => {
    return posterVenues.map((posterVenue) => (
      <PosterPreview
        key={posterVenue.id}
        posterVenue={posterVenue}
        enterVenue={enterVenue}
      />
    ));
  }, [posterVenues]);

  return (
    <div className="PosterHall">
      <PosterHallSearch
        setSearchInputValue={setSearchInputValue}
        searchInputValue={searchInputValue}
        liveFilterValue={liveFilter}
        setLiveValue={setLiveFilter}
      />

      <div className="PosterHall__posters">
        {isPostersLoaded ? renderedPosterPreviews : "Loading posters"}
      </div>

      <div className="PosterHall__more-button">
        {isPostersLoaded && (
          <Button onClick={increaseDisplayedPosterCount}>
            Show more posters
          </Button>
        )}
      </div>
    </div>
  );
};

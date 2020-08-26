import React, { useState, useCallback, useEffect } from "react";
import "./DustStorm.scss";
import { WithId } from "utils/id";
import { AnyVenue } from "types/Firestore";
import firebase from "firebase";
import { useHistory } from "react-router-dom";
import { OnlineStatsData } from "../../../../src/types/OnlineStatsData";
import { getRandomInt } from "../../../utils/getRandomInt";
import { ZOOM_URL_TEMPLATES, EMBED_IFRAME_TEMPLATES } from "settings";

interface PoLuckProps {
  openVenues?: Array<WithId<AnyVenue>>;
  afterSelect: () => void;
}

const PotLuck: React.FC<PoLuckProps> = ({ openVenues, afterSelect }) => {
  const history = useHistory();
  const goToRandomVenue = useCallback(() => {
    const ExperiencesOrArtpieces = openVenues?.filter(
      (venue) =>
        EMBED_IFRAME_TEMPLATES.includes(venue.template) ||
        ZOOM_URL_TEMPLATES.includes(venue.template)
    );

    if (!ExperiencesOrArtpieces) return;

    const randomVenue =
      ExperiencesOrArtpieces[getRandomInt(ExperiencesOrArtpieces?.length - 1)];
    afterSelect();

    if (EMBED_IFRAME_TEMPLATES.includes(randomVenue?.template))
      history.push(`/in/${randomVenue.id}`);
    if (ZOOM_URL_TEMPLATES.includes(randomVenue?.template))
      window.open(`${randomVenue.zoomUrl}`);
  }, [openVenues, afterSelect, history]);
  if (!openVenues) {
    return <></>;
  }
  return (
    <button onClick={goToRandomVenue} className="btn btn-primary">
      Join the closest venue
    </button>
  );
};

export const DustStorm = () => {
  const [openVenues, setOpenVenues] = useState<OnlineStatsData["openVenues"]>(
    []
  );

  useEffect(() => {
    const getOnlineStats = firebase
      .functions()
      .httpsCallable("stats-getOnlineStats");
    const updateStats = () => {
      getOnlineStats()
        .then((result) => {
          const { openVenues } = result.data as OnlineStatsData;
          setOpenVenues(openVenues);
        })
        .catch(() => {}); // REVISIT: consider a bug report tool
    };
    updateStats();
    const id = setInterval(() => {
      updateStats();
    }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`duststorm-container show`}>
      <div className="modal-content">
        <h3 className="italic">Dust Storm ahead!</h3>
        <p>
          All navigation is impossible! You have one option and one option only:
          to head to the nearest space and hang out there for the duration of
          the sand storm!
        </p>
        <PotLuck
          openVenues={openVenues.map((ov) => ov.venue)}
          // Force popover to close
          afterSelect={() => document.body.click()}
        />
      </div>
    </div>
  );
};

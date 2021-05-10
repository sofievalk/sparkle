import Bugsnag from "@bugsnag/js";
import firebase from "firebase/app";
import { chunk } from "lodash";

import { FIRESTORE_QUERY_IN_ARRAY_MAX_ITEMS } from "settings";

import { AnyVenue } from "types/venues";

import { withId, WithId } from "utils/id";

export const getVenueCollectionRef = () =>
  firebase.firestore().collection("venues");

export const getVenueRef = (venueId: string) =>
  getVenueCollectionRef().doc(venueId);

export interface SetVenueLiveStatusProps {
  venueId: string;
  isLive: boolean;
  onError?: (msg: string) => void;
  onFinish?: () => void;
}

export const setVenueLiveStatus = async ({
  venueId,
  isLive,
  onError,
  onFinish,
}: SetVenueLiveStatusProps): Promise<void | firebase.functions.HttpsCallableResult> => {
  const params = {
    isLive,
    venueId,
  };

  return firebase
    .functions()
    .httpsCallable("venue-setVenueLiveStatus")(params)
    .catch((err) => {
      Bugsnag.notify(err, (event) => {
        event.addMetadata("context", {
          location: "api/venue::setVenueLiveStatus",
          venueId,
        });
      });

      if (onError) onError(err);
    })
    .finally(onFinish);
};

export interface FetchSovereignVenueOptions {
  previouslyCheckedVenueIds?: readonly string[];
  maxDepth?: number;
}

export interface FetchSovereignVenueReturn {
  sovereignVenue: WithId<AnyVenue>;
  checkedVenueIds: readonly string[];
}

export const fetchSovereignVenue = async (
  venueId: string,
  options?: FetchSovereignVenueOptions
): Promise<FetchSovereignVenueReturn> => {
  const { previouslyCheckedVenueIds = [], maxDepth } = options ?? {};

  const venue = await fetchVenue(venueId);

  if (!venue) throw new Error(`The '${venueId}' venue doesn't exist`);

  if (!venue.parentId)
    return {
      sovereignVenue: venue,
      checkedVenueIds: previouslyCheckedVenueIds,
    };

  if (previouslyCheckedVenueIds.includes(venueId))
    throw new Error(
      `Circular reference detected. '${venueId}' has already been checked`
    );

  if (maxDepth && maxDepth <= 0)
    throw new Error("Maximum depth reached before finding the sovereignVenue.");

  return fetchSovereignVenue(venue.parentId, {
    ...options,
    previouslyCheckedVenueIds: [...previouslyCheckedVenueIds, venueId],
    maxDepth: maxDepth ? maxDepth - 1 : undefined,
  });
};

export const fetchVenue = async (
  venueId: string
): Promise<WithId<AnyVenue> | undefined> => {
  const venueDoc = await getVenueRef(venueId).get();

  // TODO: Use proper data validation + firestore model converters to set this type rather than just forcing it with 'as'
  //  see .withConverter(soundConfigConverter) in fetchSoundConfigs in src/api/sounds.ts as an example
  const venue: AnyVenue | undefined = venueDoc.data() as AnyVenue | undefined;

  if (!venue) return undefined;

  return withId(venue, venueId);
};

export const fetchDirectChildVenues = async (
  venueIdOrIds: string | string[]
): Promise<WithId<AnyVenue>[]> => {
  const venueIds: string[] =
    typeof venueIdOrIds === "string" ? [venueIdOrIds] : venueIdOrIds;

  return Promise.all(
    chunk(venueIds, FIRESTORE_QUERY_IN_ARRAY_MAX_ITEMS).map(
      async (venueIdsChunk: string[]) => {
        const childVenuesSnapshot = await getVenueCollectionRef()
          .where("parentId", "in", venueIdsChunk)
          // .withConverter()
          .get();

        // TODO: Use proper data validation + firestore model converters to set this type rather than just forcing it with 'as'
        //  see .withConverter(soundConfigConverter) in fetchSoundConfigs in src/api/sounds.ts as an example
        return childVenuesSnapshot.docs
          .filter((docSnapshot) => docSnapshot.exists)
          .map((docSnapshot) =>
            withId(docSnapshot.data() as AnyVenue, docSnapshot.id)
          );
      }
    )
  ).then((result) => result.flat());
};

export const fetchDescendantVenues = async (
  venueId: string
): Promise<WithId<AnyVenue>[]> => {
  const directChildVenues: WithId<AnyVenue>[] = await fetchDirectChildVenues(
    venueId
  );

  const directChildVenueIds: string[] = directChildVenues.map(
    (childVenue) => childVenue.id
  );

  const descendantVenues: WithId<AnyVenue>[] = await fetchDirectChildVenues(
    directChildVenueIds
  );

  return [...directChildVenues, ...descendantVenues];
};

export const fetchRelatedVenues = async (
  venueId: string
): Promise<WithId<AnyVenue>[]> => {
  const { sovereignVenue } = await fetchSovereignVenue(venueId);

  const descendantVenues = await fetchDescendantVenues(sovereignVenue.id);

  return [sovereignVenue, ...descendantVenues];
};
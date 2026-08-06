import { useMemo } from 'react';
import { dummyCommandCenter } from './commandCenterData';
import { dummyMovieOverview } from '../dummyMovieData';
import { daysUntilRelease } from '../dateUtils';

// Merges the selected real movie entity's identity fields (title, release
// countdown, poster image, genre/language) into the Command Center's dummy
// data. Everything else on this page (AI summary, highlights, recommended
// actions, competitor watch, audience pulse, campaign timeline) has no
// backend concept yet, so it stays as static dummy data — same approach as
// useMovieOverviewData for the My Movie tab.
export default function useCommandCenterData(selectedMovie) {
  return useMemo(() => {
    const base = dummyCommandCenter;
    const title = selectedMovie?.name ?? dummyMovieOverview.title;
    const releaseInDays = selectedMovie?.releaseDate
      ? daysUntilRelease(selectedMovie.releaseDate)
      : dummyMovieOverview.releaseInDays;

    return {
      ...base,
      title,
      releaseInDays,
      poster: {
        imageUrl: selectedMovie?.imageUrl ?? null,
      },
      snapshot: {
        ...base.snapshot,
        releaseInDays,
        genre: Array.isArray(selectedMovie?.genre)
          ? selectedMovie.genre.join(', ')
          : selectedMovie?.genre || base.snapshot.genre,
        language: selectedMovie?.language || base.snapshot.language,
      },
    };
  }, [selectedMovie]);
}

import { useEffect, useState } from 'react';
import { entityService } from '../api/entityService';

// Resolves an entity's `imageUrl` (from its EntityBasicInfo/EntityDetailResponse) to a displayable
// object URL. The image endpoint requires the same JWT as every other /api call, so a plain
// <img src={imageUrl}> can't load it directly — this fetches the blob via the authenticated
// client and hands back a blob: URL instead, revoking the previous one on change/unmount.
export default function useEntityImage(imageUrl) {
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => {
    if (!imageUrl) {
      setObjectUrl(null);
      return;
    }

    let cancelled = false;
    let createdUrl = null;

    entityService.getImage(imageUrl).then((blob) => {
      if (cancelled) return;
      createdUrl = URL.createObjectURL(blob);
      setObjectUrl(createdUrl);
    }).catch(() => {
      if (!cancelled) setObjectUrl(null);
    });

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [imageUrl]);

  return objectUrl;
}

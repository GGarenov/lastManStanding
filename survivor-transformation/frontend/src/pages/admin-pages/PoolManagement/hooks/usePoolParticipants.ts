import { useEffect, useState } from "react";
import * as adminApi from "~/api/admin.api";

type Participants = Awaited<ReturnType<typeof adminApi.getParticipants>>;

type UsePoolParticipantsArgs = {
  poolId?: string;
};

type UsePoolParticipantsResult = {
  participants: Participants;
};

export function usePoolParticipants({
  poolId,
}: UsePoolParticipantsArgs): UsePoolParticipantsResult {
  const [participants, setParticipants] = useState<Participants>([]);

  useEffect(() => {
    if (!poolId) return;
    adminApi
      .getParticipants(poolId)
      .then(setParticipants)
      .catch(() => setParticipants([]));
  }, [poolId]);

  return { participants };
}


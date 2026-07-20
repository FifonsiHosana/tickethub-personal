import { useMutation } from "@tanstack/react-query";

import { uploadOrganizerMedia } from "@/utils/services/organizers/media.service";

export function useOrganizerMedia() {
  return useMutation({
    mutationFn: (files: File[]) => uploadOrganizerMedia(files),
  });
}

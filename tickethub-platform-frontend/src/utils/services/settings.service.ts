import { axiosInstance } from "@/utils/api/axiosInstance";

export type PublicSettings = {
  processing_fee_percentage: number;
};

export const fetchPublicSettings = async () => {
  const response = await axiosInstance.get("/settings");

  return response.data.data as PublicSettings;
};
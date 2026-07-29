import { axiosInstance } from "@/utils/api/axiosInstance";

export type Setting = {
  id: number;
  key: string;
  value: string;
  description: string | null;
  updatedAt: string;
  updatedBy: number | null;
};

export async function getSettings(): Promise<Setting[]> {
  const response = await axiosInstance.get("admin/settings");
  return response.data.data;
}

export async function updateSettings(
  payload: Record<string, string>,
): Promise<Setting[]> {
  const response = await axiosInstance.patch("admin/settings", payload);
  return response.data.data;
}

import { axiosInstance } from "@/utils/api/axiosInstance";

export interface StaffMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  assignedAt: string;
}

export interface OrganizerStaffMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
}

export interface StaffInviteResponse {
  inviteUrl: string;
}

export interface AssignStaffResult {
  userId: number;
  email: string;
  success: boolean;
  reason?: string;
}

export async function getEventStaff(eventId: number): Promise<StaffMember[]> {
  const response = await axiosInstance.get(`/organizer/events/${eventId}/staff`);
  return response.data.data;
}

export async function getOrganizerStaff(): Promise<OrganizerStaffMember[]> {
  const response = await axiosInstance.get("/organizer/staff");
  return response.data.data;
}

export async function assignEventStaff(
  eventId: number,
  staffUserIds: number[],
): Promise<AssignStaffResult[]> {
  const response = await axiosInstance.post(
    `/organizer/events/${eventId}/staff/assign`,
    { staffUserIds },
  );
  return response.data.data;
}

export async function generateStaffInvite(
  eventId: number,
): Promise<StaffInviteResponse> {
  const response = await axiosInstance.post(
    `/organizer/events/${eventId}/staff/invite`,
  );
  return response.data.data;
}

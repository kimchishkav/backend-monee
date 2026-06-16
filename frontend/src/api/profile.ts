import { api } from "./client";
import type { Theme, User } from "../types";

export interface UpdateProfileRequest {
  name?: string;
  currency?: string;
  monthlyLimit?: number | null;
  theme?: Theme;
  avatar?: string;
  removeAvatar?: boolean;
}

export function getProfile() {
  return api.get<User>("/profile").then((r) => r.data);
}

export function updateProfile(request: UpdateProfileRequest) {
  return api.put<User>("/profile", request).then((r) => r.data);
}

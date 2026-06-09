import {
  demoChatMessage,
  demoLogin,
  demoRegisterVisitor,
  isOfflineDemoMode,
} from "./demoFallback";
import { filterCatalogExperiences } from "../data/catalogExperiences";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const BACKEND_HINT = import.meta.env.PROD
  ? "الخادم غير متاح حالياً — جرّب لاحقاً أو استخدم النسخة المحلية."
  : "تأكد من تشغيل الخادم: cd backend ثم npm start (المنفذ 5000)";

async function parseResponse(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();

  if (!text.trim()) {
    if (!res.ok) {
      throw new Error(
        res.status === 502 || res.status === 503 || res.status === 500
          ? `الخادم غير متاح. ${BACKEND_HINT}`
          : `خطأ من الخادم (${res.status}). ${BACKEND_HINT}`
      );
    }
    throw new Error(`استجابة فارغة من الخادم. ${BACKEND_HINT}`);
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error(
      `استجابة غير صالحة من الخادم. ${BACKEND_HINT}`
    );
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...options?.headers },
      ...options,
    });
  } catch {
    throw new Error(`تعذّر الاتصال بالخادم. ${BACKEND_HINT}`);
  }

  const json = await parseResponse(res);

  if (!res.ok) {
    const message =
      typeof json.message === "string"
        ? json.message
        : `حدث خطأ (${res.status})`;
    throw new Error(message);
  }

  return json as T;
}

export interface ApiExperience {
  id: number | string;
  _id?: string;
  title: string;
  region: string;
  category: string;
  price: number;
  duration: string;
  rating: number;
  reviews: number;
  imageUrl: string;
  host: string;
  maxGroup: number;
  tags: string[];
  featured: boolean;
}

export async function fetchExperiences(params?: {
  region?: string;
  category?: string;
  search?: string;
}): Promise<ApiExperience[]> {
  if (isOfflineDemoMode()) {
    return filterCatalogExperiences(params);
  }
  try {
    const q = new URLSearchParams();
    if (params?.region && params.region !== "جميع المناطق") {
      q.set("region", params.region);
    }
    if (params?.category && params.category !== "all") {
      q.set("category", params.category);
    }
    if (params?.search?.trim()) {
      q.set("search", params.search.trim());
    }
    const query = q.toString();
    const res = await request<{ success: boolean; data: ApiExperience[] }>(
      `/experiences${query ? `?${query}` : ""}`
    );
    return res.data ?? [];
  } catch {
    return filterCatalogExperiences(params);
  }
}

export async function createBooking(body: {
  experienceId: number | string;
  dateLabel: string;
  timeLabel: string;
  guests: number;
  groupType: "family" | "youth";
  paymentMethod: string;
  userPhone?: string;
  userName?: string;
}) {
  return request<{ success: boolean; data: { invoiceNumber: string; total: number } }>(
    "/bookings",
    { method: "POST", body: JSON.stringify(body) }
  );
}

export async function createSubmission(body: {
  title: string;
  region: string;
  category: string;
  price: string;
  duration: string;
  hostName: string;
  phone: string;
  description: string;
}) {
  return request<{ success: boolean; message: string }>("/submissions", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export interface ChatSource {
  id: number | string;
  title: string;
  region: string;
  category: string;
  price: number;
  duration: string;
  rating: number;
  host: string;
  tags: string[];
  description: string;
  imageUrl?: string;
  score?: number;
}

export type VisitorInterest = "adventure" | "exploration" | "both";

export type ChatIntent = "book" | "inquiry" | "story" | "suggest" | "general";

export interface ChatAction {
  type: "book" | "story" | "inquiry";
  experienceId?: number | string;
  title?: string;
  label: string;
  subject?: string;
}

export interface ChatProfile {
  name?: string;
  phone?: string;
  interestType?: VisitorInterest;
  region?: string;
  category?: string;
  age?: number;
}

export async function sendChatMessage(
  message: string,
  options?: {
    profile?: ChatProfile;
    history?: { role: "user" | "assistant"; content: string }[];
    selectedExperienceId?: number | string;
  }
) {
  if (isOfflineDemoMode()) {
    return demoChatMessage(message, options);
  }
  try {
    return await request<{
      success: boolean;
      reply: string;
      sources?: ChatSource[];
      intent?: ChatIntent;
      actions?: ChatAction[];
      mode?: string;
    }>("/chat", {
      method: "POST",
      body: JSON.stringify({
        message,
        profile: options?.profile,
        history: options?.history,
        selectedExperienceId: options?.selectedExperienceId,
      }),
    });
  } catch {
    return demoChatMessage(message, options);
  }
}

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  age?: number;
  role: "visitor" | "provider" | "admin";
  roleLabel: string;
  providerHost?: string;
  interestType?: VisitorInterest;
  interestLabel?: string;
  profileCompleted?: boolean;
}

export const AUTH_STORAGE_KEY = "reef_auth_user";

export async function loginUser(phone: string, password: string) {
  if (isOfflineDemoMode()) {
    return demoLogin(phone, password);
  }
  try {
    return await request<{
      success: boolean;
      message: string;
      user: AuthUser;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ phone, password }),
    });
  } catch {
    return demoLogin(phone, password);
  }
}

export async function registerVisitor(body: {
  phone: string;
  email: string;
  name: string;
  age: number;
  password: string;
}) {
  if (isOfflineDemoMode()) {
    return demoRegisterVisitor(body);
  }
  try {
    return await request<{
      success: boolean;
      message: string;
      user: AuthUser;
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch {
    return demoRegisterVisitor(body);
  }
}

export async function updateVisitorProfile(
  phone: string,
  interestType: VisitorInterest
) {
  return request<{
    success: boolean;
    message: string;
    user: AuthUser;
  }>(`/auth/profile/${encodeURIComponent(phone)}`, {
    method: "PATCH",
    body: JSON.stringify({ interestType }),
  });
}

export async function fetchVisitorDashboard(phone: string) {
  return request<{ success: boolean; data: Record<string, unknown> }>(
    `/dashboard/visitor/${encodeURIComponent(phone)}`
  );
}

export async function fetchProviderDashboard(phone: string) {
  return request<{ success: boolean; data: Record<string, unknown> }>(
    `/dashboard/provider/${encodeURIComponent(phone)}`
  );
}

export async function fetchAdminDashboard() {
  return request<{ success: boolean; data: Record<string, unknown> }>(
    "/dashboard/admin"
  );
}

// ─── لوحات التحكم ───
export async function fetchProviderPanel(phone: string) {
  return request<{ success: boolean; data: Record<string, unknown> }>(
    `/panel/provider/${encodeURIComponent(phone)}`
  );
}

export async function addProviderExperience(
  phone: string,
  body: Record<string, unknown>
) {
  return request<{ success: boolean; message: string }>(
    `/panel/provider/${encodeURIComponent(phone)}/experiences`,
    { method: "POST", body: JSON.stringify(body) }
  );
}

export async function deleteProviderExperience(phone: string, id: string | number) {
  return request<{ success: boolean; message: string }>(
    `/panel/provider/${encodeURIComponent(phone)}/experiences/${id}`,
    { method: "DELETE" }
  );
}

export async function updateProviderBooking(
  phone: string,
  invoice: string,
  status: "confirmed" | "cancelled"
) {
  return request<{ success: boolean; message: string }>(
    `/panel/provider/${encodeURIComponent(phone)}/bookings/${invoice}`,
    { method: "PATCH", body: JSON.stringify({ status }) }
  );
}

export async function fetchAdminPanel() {
  return request<{ success: boolean; data: Record<string, unknown> }>("/panel/admin");
}

export async function updateSubmission(id: string, status: "approved" | "rejected") {
  return request<{ success: boolean; message: string }>(
    `/panel/admin/submissions/${id}`,
    { method: "PATCH", body: JSON.stringify({ status }) }
  );
}

export async function updateUserAccount(
  phone: string,
  action: "suspend" | "activate" | "delete"
) {
  return request<{ success: boolean; message: string }>(
    `/panel/admin/users/${encodeURIComponent(phone)}`,
    { method: "PATCH", body: JSON.stringify({ action }) }
  );
}

export async function addUserAccount(body: Record<string, unknown>) {
  return request<{ success: boolean; message: string }>("/panel/admin/users", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function replyInquiry(id: string, adminReply: string) {
  return request<{ success: boolean; message: string }>(
    `/panel/admin/inquiries/${id}`,
    { method: "PATCH", body: JSON.stringify({ adminReply }) }
  );
}

export async function hideReview(id: string) {
  return request<{ success: boolean; message: string }>(
    `/panel/admin/reviews/${id}`,
    { method: "DELETE" }
  );
}

export interface FeaturedReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  experienceTitle: string;
  host?: string;
  highlight: "benefit" | "ease" | "experience";
  highlightLabel: string;
}

export async function fetchFeaturedReviews() {
  return request<{ success: boolean; data: FeaturedReview[] }>("/reviews/featured");
}

export async function updateReviewFeature(
  id: string,
  body: { featured?: boolean; highlight?: "benefit" | "ease" | "experience" }
) {
  return request<{ success: boolean; message: string }>(
    `/panel/admin/reviews/${id}`,
    { method: "PATCH", body: JSON.stringify(body) }
  );
}

export async function deleteAdminExperience(id: string | number) {
  return request<{ success: boolean; message: string }>(
    `/panel/admin/experiences/${id}`,
    { method: "DELETE" }
  );
}

export async function updateAdminBooking(
  invoice: string,
  status: "confirmed" | "cancelled"
) {
  return request<{ success: boolean; message: string }>(
    `/panel/admin/bookings/${invoice}`,
    { method: "PATCH", body: JSON.stringify({ status }) }
  );
}

export async function submitInquiry(body: {
  userName: string;
  userPhone?: string;
  subject: string;
  message: string;
}) {
  return request<{ success: boolean; message: string }>("/panel/inquiries", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function checkApiHealth(): Promise<boolean> {
  if (isOfflineDemoMode()) return false;
  try {
    const res = await fetch(`${API_BASE}/health`);
    const json = await parseResponse(res);
    return (
      res.ok &&
      json.success === true &&
      json.database === "connected"
    );
  } catch {
    return false;
  }
}

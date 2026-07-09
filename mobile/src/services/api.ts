import type { User } from "firebase/auth";
import { Capacitor } from "@capacitor/core";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://68-211-162-69.sslip.io";

export type ReportStatus = "pendiente" | "validado" | "rechazado" | "atendido" | "archivado";
export type Urgency = "baja" | "media" | "alta" | "critica";

export interface Category {
  id: number;
  nombre: string;
}

export interface CitizenReport {
  id: number;
  categoria_id: number;
  categoria_nombre?: string;
  urgencia: Urgency;
  descripcion: string;
  estado: ReportStatus;
  direccion_aprox?: string;
  created_at: string;
  latitud?: number;
  longitud?: number;
}

export interface CapturedPhoto {
  webPath?: string;
  path?: string;
  format: string;
}

async function authHeaders(user: User) {
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Error de comunicacion" }));
    throw new Error(error.message ?? "Error de comunicacion");
  }

  return response.json();
}

export async function syncProfile(user: User) {
  return request<{ user: unknown }>("/auth/firebase/sync", {
    method: "POST",
    headers: await authHeaders(user)
  });
}

export async function getCategories(): Promise<Category[]> {
  const response = await request<{ data: Category[] }>("/categorias");
  return response.data.filter((category: any) => category.activo !== false);
}

export async function createReport(user: User, payload: {
  categoria_id: number;
  urgencia: Urgency;
  descripcion: string;
  latitud: number;
  longitud: number;
  direccion_aprox?: string;
}) {
  const response = await request<{ data: CitizenReport }>("/reportes", {
    method: "POST",
    headers: await authHeaders(user),
    body: JSON.stringify(payload)
  });
  return response.data;
}

export async function uploadReportPhoto(user: User, reportId: number, photo: CapturedPhoto) {
  const sourceUrl = photo.webPath ?? (photo.path ? Capacitor.convertFileSrc(photo.path) : "");
  if (!sourceUrl) throw new Error("No se pudo leer la fotografia capturada.");

  const photoResponse = await fetch(sourceUrl);
  if (!photoResponse.ok) throw new Error("No se pudo preparar la fotografia.");

  const extension = photo.format === "jpeg" ? "jpg" : photo.format;
  const formData = new FormData();
  formData.append("foto", await photoResponse.blob(), `reporte-${reportId}.${extension}`);

  const response = await fetch(`${API_BASE_URL}/reportes/${reportId}/fotos`, {
    method: "POST",
    headers: await authHeaders(user),
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "No se pudo subir la fotografia." }));
    throw new Error(error.message ?? "No se pudo subir la fotografia.");
  }

  return response.json();
}

export async function getMyReports(user: User): Promise<CitizenReport[]> {
  const response = await request<{ data: CitizenReport[] }>("/mis-reportes", {
    headers: await authHeaders(user)
  });
  return response.data;
}

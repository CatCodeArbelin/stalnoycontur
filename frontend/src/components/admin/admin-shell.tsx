"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBrowserApiBase } from "@/lib/api-base";
import { cn } from "@/lib/utils";

type UploadCategory = "uploads" | "cases" | "gallery" | "reviews" | "production";

type BaseField = {
  key: string;
  label: string;
  placeholder?: string;
};

type JsonField = BaseField & {
  type: "json";
};

type StringListField = BaseField & {
  type: "string-list";
};

type ImageListField = BaseField & {
  type: "image-list";
  uploadCategory?: UploadCategory;
};

type Field =
  | (BaseField & { type?: "text" | "textarea" | "number" | "checkbox" })
  | (BaseField & { type: "image"; uploadCategory?: UploadCategory })
  | JsonField
  | StringListField
  | ImageListField;

type Column = {
  key: string;
  label: string;
  format?: "dateTime" | "telegramStatus";
};

type AdminResourceProps = {
  title: string;
  description: string;
  endpoint: string;
  fields: Field[];
  columns: Column[];
};

const nav = [
  ["/admin/leads", "Заявки"],
  ["/admin/cases", "Кейсы"],
  ["/admin/reviews", "Отзывы"],
  ["/admin/faq", "FAQ"],
  ["/admin/settings", "Настройки"],
];

const apiBase = getBrowserApiBase();
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

type MessageType = "success" | "error";

function formatFileSize(bytes: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(bytes / (1024 * 1024));
}

function validateImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) return "Недопустимый тип файла. Загрузите JPG, PNG или WEBP.";
  if (file.size > MAX_IMAGE_SIZE_BYTES) return `Файл слишком большой: ${formatFileSize(file.size)} МБ. Максимум — ${formatFileSize(MAX_IMAGE_SIZE_BYTES)} МБ.`;
  return "";
}

function detailToMessage(detail: unknown) {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "msg" in item) return String(item.msg);
        return JSON.stringify(item);
      })
      .filter(Boolean);
    return messages.join("; ");
  }
  if (detail && typeof detail === "object") return JSON.stringify(detail);
  return "";
}

async function formatApiError(error: unknown) {
  if (error instanceof Response) {
    const fallback = error.statusText || "Ошибка запроса";
    const text = await error.text();
    if (!text) return fallback;

    try {
      const data = JSON.parse(text) as { detail?: unknown; message?: unknown; error?: unknown };
      return detailToMessage(data.detail ?? data.message ?? data.error) || fallback;
    } catch {
      const contentType = error.headers.get("Content-Type")?.toLowerCase() ?? "";
      if (contentType.includes("text/html")) {
        const message = "API недоступен или настроен неверно: получена HTML-страница вместо JSON";
        if (error.status === 404) return `${message}. Проверьте proxy/rewrite для /api/*.`;
        return message;
      }

      return text;
    }
  }

  if (error instanceof Error) return error.message || "Ошибка запроса";
  if (typeof error === "string") return error;
  return "Ошибка запроса";
}

function emptyValue(field: Field) {
  if (field.type === "checkbox") return false;
  if (field.type === "number") return 0;
  if (field.type === "json" || field.type === "string-list" || field.type === "image-list") return "";
  return "";
}

function formatCell(value: unknown) {
  if (value == null || value === "") return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function formatColumnCell(column: Column, value: unknown) {
  if (column.format === "dateTime") return value ? new Date(String(value)).toLocaleString("ru-RU") : "—";
  if (column.format === "telegramStatus") {
    if (value === "sent") return "Отправлено";
    if (value === "failed") return "Ошибка";
    if (value === "skipped") return "Не настроен";
    return "Ожидает";
  }
  return formatCell(value);
}

function parseJsonField(field: Field, value: unknown) {
  try {
    return JSON.parse(String(value));
  } catch {
    throw new Error(`Поле «${field.label}» содержит невалидный JSON.`);
  }
}

function parseLineList(value: unknown) {
  return String(value)
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseListField(value: unknown) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed : parseLineList(value);
  } catch {
    return parseLineList(value);
  }
}

function toPayload(fields: Field[], form: Record<string, unknown>) {
  return Object.fromEntries(
    fields.map((field) => {
      const value = form[field.key];
      if (field.type === "number") return [field.key, Number(value || 0)];
      if (field.type === "checkbox") return [field.key, Boolean(value)];
      if (field.type === "json") return [field.key, parseJsonField(field, value)];
      if (field.type === "string-list" || field.type === "image-list") return [field.key, parseListField(value)];
      return [field.key, value || null];
    }),
  );
}

export function AdminResource({ title, description, endpoint, fields, columns }: AdminResourceProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("success");
  const [form, setForm] = useState<Record<string, unknown>>(() => Object.fromEntries(fields.map((field) => [field.key, emptyValue(field)])));


  function showMessage(text: string, type: MessageType = "success") {
    setMessage(text);
    setMessageType(type);
  }

  async function logout(messageText?: string) {
    setIsAuthenticated(false);
    setCsrfToken("");
    setItems([]);
    try {
      await fetch(`${apiBase}/admin/auth/logout`, { method: "POST", credentials: "same-origin" });
    } catch {
      // Local logout must still complete even if the session already expired.
    }
    if (messageText) showMessage(messageText, "error");
  }

  async function request(path: string, init: RequestInit = {}) {
    const method = (init.method ?? "GET").toUpperCase();
    const headers = new Headers(init.headers);
    if (!(init.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    if (csrfToken && ["POST", "PATCH", "DELETE"].includes(method)) headers.set("X-CSRF-Token", csrfToken);

    const response = await fetch(`${apiBase}${path}`, {
      ...init,
      credentials: "same-origin",
      headers,
    });
    if (!response.ok) {
      const isSessionError = response.status === 401 || response.status === 403;
      const isLoginRequest = path === "/admin/auth/login";
      const errorMessage = isSessionError && !isLoginRequest ? "Сессия истекла, войдите снова" : await formatApiError(response);

      if (isSessionError && !isLoginRequest && isAuthenticated) void logout(errorMessage);

      throw new Error(errorMessage);
    }
    if (response.status === 204) return null;
    return response.json();
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const data = await request("/admin/auth/login", { method: "POST", body: JSON.stringify({ username, password }) });
      setCsrfToken(data.csrf_token);
      setIsAuthenticated(true);
      showMessage("Вход выполнен");
    } catch (error) {
      showMessage(await formatApiError(error), "error");
    }
  }

  async function loadItems() {
    if (!isAuthenticated) return;
    try {
      const data = await request(endpoint);
      setItems(data);
    } catch (error) {
      showMessage(await formatApiError(error), "error");
    }
  }

  async function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const body = JSON.stringify(toPayload(fields, form));
      await request(editingId ? `${endpoint}/${editingId}` : endpoint, { method: editingId ? "PATCH" : "POST", body });
      setEditingId(null);
      setForm(Object.fromEntries(fields.map((field) => [field.key, emptyValue(field)])));
      showMessage("Сохранено");
      await loadItems();
    } catch (error) {
      showMessage(await formatApiError(error), "error");
    }
  }

  async function removeItem(id: unknown) {
    if (typeof id !== "number") return;
    try {
      await request(`${endpoint}/${id}`, { method: "DELETE" });
      showMessage("Удалено");
      await loadItems();
    } catch (error) {
      showMessage(await formatApiError(error), "error");
    }
  }

  function uploadCategory(fieldKey: string) {
    const field = fields.find((item) => item.key === fieldKey);
    if (field?.type === "image" || field?.type === "image-list") return field.uploadCategory ?? "uploads";
    return "uploads";
  }

  async function uploadImage(fieldKey: string, file: File | null) {
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      showMessage(validationError, "error");
      return;
    }
    try {
      const payload = new FormData();
      payload.append("file", file);
      payload.append("category", uploadCategory(fieldKey));
      const data = await request("/admin/upload", { method: "POST", body: payload });
      setForm((current) => ({ ...current, [fieldKey]: data.url }));
    } catch (error) {
      showMessage(await formatApiError(error), "error");
    }
  }

  async function uploadImageList(fieldKey: string, files: FileList | null) {
    if (!files?.length) return;
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const validationError = validateImageFile(file);
        if (validationError) {
          showMessage(`${file.name}: ${validationError}`, "error");
          return;
        }
        const payload = new FormData();
        payload.append("file", file);
        payload.append("category", uploadCategory(fieldKey));
        const data = await request("/admin/upload", { method: "POST", body: payload });
        urls.push(data.url);
      }
      setForm((current) => {
        const currentValue = String(current[fieldKey] ?? "").trim();
        const prefix = currentValue ? `${currentValue}\n` : "";
        return { ...current, [fieldKey]: `${prefix}${urls.join("\n")}` };
      });
    } catch (error) {
      showMessage(await formatApiError(error), "error");
    }
  }

  useEffect(() => {
    async function restoreSession() {
      const response = await fetch(`${apiBase}/admin/auth/csrf`, { credentials: "same-origin" });
      if (!response.ok) {
        setIsAuthenticated(false);
        setCsrfToken("");
        return;
      }
      const data = await response.json();
      setCsrfToken(data.csrf_token);
      setIsAuthenticated(true);
    }

    void restoreSession();
  }, []);

  useEffect(() => {
    void loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, endpoint]);

  return (
    <section className="bg-slate-50 py-10">
      <div className="container grid gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-copper-600">Admin</p>
            <h1 className="text-3xl font-black text-steel-950 md:text-4xl">{title}</h1>
            <p className="mt-2 max-w-3xl text-steel-600">{description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {nav.map(([href, label]) => (
              <Button key={href} asChild variant="outline" size="sm">
                <Link href={href}>{label}</Link>
              </Button>
            ))}
            {isAuthenticated ? <Button variant="outline" size="sm" onClick={() => void logout()}>Выйти</Button> : null}
          </div>
        </div>

        {!isAuthenticated ? (
          <Card>
            <CardHeader><CardTitle>Вход администратора</CardTitle></CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-3" onSubmit={login}>
                <input className="rounded-2xl border p-3" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Логин" />
                <input className="rounded-2xl border p-3" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" type="password" />
                <Button type="submit">Войти</Button>
              </form>
              {process.env.NODE_ENV === "development" ? (
                <p className="mt-3 text-xs text-steel-500">dev default: admin / change-me</p>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        {message ? <div className={cn("rounded-2xl p-4 text-sm font-semibold", messageType === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700")}>{message}</div> : null}

        {isAuthenticated ? (
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <Card>
              <CardHeader><CardTitle>{editingId ? "Редактирование" : "Новая запись"}</CardTitle></CardHeader>
              <CardContent>
                <form className="grid gap-3" onSubmit={saveItem}>
                  {fields.map((field) => (
                    <label className="grid gap-1 text-sm font-semibold text-steel-700" key={field.key}>
                      {field.label}
                      {field.type === "textarea" || field.type === "json" || field.type === "string-list" || field.type === "image-list" ? (
                        <textarea className="min-h-24 rounded-2xl border p-3 font-normal" value={String(form[field.key] ?? "")} onChange={(e) => setForm((current) => ({ ...current, [field.key]: e.target.value }))} placeholder={field.placeholder} />
                      ) : field.type === "checkbox" ? (
                        <input className="h-5 w-5" checked={Boolean(form[field.key])} onChange={(e) => setForm((current) => ({ ...current, [field.key]: e.target.checked }))} type="checkbox" />
                      ) : (
                        <input className="rounded-2xl border p-3 font-normal" value={String(form[field.key] ?? "")} onChange={(e) => setForm((current) => ({ ...current, [field.key]: e.target.value }))} placeholder={field.placeholder} type={field.type === "number" ? "number" : "text"} />
                      )}
                      {field.type === "image" ? <input className="text-xs" type="file" accept={IMAGE_ACCEPT} onChange={(e) => uploadImage(field.key, e.target.files?.[0] ?? null)} /> : null}
                      {field.type === "image-list" ? <input className="text-xs" type="file" accept={IMAGE_ACCEPT} multiple onChange={(e) => uploadImageList(field.key, e.target.files)} /> : null}
                    </label>
                  ))}
                  <div className="flex gap-2">
                    <Button type="submit">Сохранить</Button>
                    {editingId ? <Button type="button" variant="outline" onClick={() => setEditingId(null)}>Отмена</Button> : null}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="flex-row items-center justify-between"><CardTitle>Список</CardTitle><Button variant="outline" size="sm" onClick={loadItems}>Обновить</Button></CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-xs uppercase text-steel-500"><tr>{columns.map((column) => <th className="px-3 py-2" key={column.key}>{column.label}</th>)}<th className="px-3 py-2">Действия</th></tr></thead>
                  <tbody>
                    {items.map((item) => (
                      <tr className="border-t" key={String(item.id)}>
                        {columns.map((column) => <td className="max-w-[280px] px-3 py-3 align-top" key={column.key}>{formatColumnCell(column, item[column.key])}</td>)}
                        <td className="px-3 py-3">
                          <div className="flex gap-2">
                            <button className="text-copper-700 underline" onClick={() => { setEditingId(Number(item.id)); setForm(Object.fromEntries(fields.map((field) => [field.key, (field.type === "json" || field.type === "string-list" || field.type === "image-list") ? JSON.stringify(item[field.key] ?? (field.type === "json" ? null : []), null, 2) : (item[field.key] ?? emptyValue(field))]))); }}>Править</button>
                            <button className="text-red-700 underline" onClick={() => removeItem(item.id)}>Удалить</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className={cn("py-6 text-center text-steel-500", items.length && "hidden")}>Записей пока нет.</p>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </section>
  );
}

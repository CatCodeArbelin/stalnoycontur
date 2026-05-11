"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBrowserApiBase } from "@/lib/api-base";
import { cn } from "@/lib/utils";

type Field = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "checkbox" | "json" | "image" | "image-list";
  placeholder?: string;
  uploadCategory?: "uploads" | "cases" | "gallery" | "reviews" | "production";
};

type Column = {
  key: string;
  label: string;
  render?: (value: unknown, item: Record<string, unknown>) => string;
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

function formatFileSize(bytes: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(bytes / (1024 * 1024));
}

function validateImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) return "Недопустимый тип файла. Загрузите JPG, PNG или WEBP.";
  if (file.size > MAX_IMAGE_SIZE_BYTES) return `Файл слишком большой: ${formatFileSize(file.size)} МБ. Максимум — ${formatFileSize(MAX_IMAGE_SIZE_BYTES)} МБ.`;
  return "";
}

function emptyValue(field: Field) {
  if (field.type === "checkbox") return false;
  if (field.type === "number") return 0;
  if (field.type === "json" || field.type === "image-list") return "";
  return "";
}

function formatCell(value: unknown) {
  if (value == null || value === "") return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function toPayload(fields: Field[], form: Record<string, unknown>) {
  return Object.fromEntries(
    fields.map((field) => {
      const value = form[field.key];
      if (field.type === "number") return [field.key, Number(value || 0)];
      if (field.type === "checkbox") return [field.key, Boolean(value)];
      if (field.type === "json" || field.type === "image-list") {
        if (!value) return [field.key, null];
        try {
          return [field.key, JSON.parse(String(value))];
        } catch {
          return [field.key, String(value).split("\n").map((item) => item.trim()).filter(Boolean)];
        }
      }
      return [field.key, value || null];
    }),
  );
}

export function AdminResource({ title, description, endpoint, fields, columns }: AdminResourceProps) {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<Record<string, unknown>>(() => Object.fromEntries(fields.map((field) => [field.key, emptyValue(field)])));

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  async function request(path: string, init: RequestInit = {}) {
    const response = await fetch(`${apiBase}${path}`, {
      ...init,
      headers: {
        ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? authHeaders : {}),
        ...init.headers,
      },
    });
    if (!response.ok) throw new Error(await response.text());
    if (response.status === 204) return null;
    return response.json();
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = await request("/admin/auth/login", { method: "POST", body: JSON.stringify({ username, password }) });
    setToken(data.access_token);
    localStorage.setItem("adminToken", data.access_token);
    setMessage("Вход выполнен");
  }

  async function loadItems() {
    if (!token) return;
    const data = await request(endpoint);
    setItems(data);
  }

  async function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = JSON.stringify(toPayload(fields, form));
    await request(editingId ? `${endpoint}/${editingId}` : endpoint, { method: editingId ? "PATCH" : "POST", body });
    setEditingId(null);
    setForm(Object.fromEntries(fields.map((field) => [field.key, emptyValue(field)])));
    setMessage("Сохранено");
    await loadItems();
  }

  async function removeItem(id: unknown) {
    if (typeof id !== "number") return;
    await request(`${endpoint}/${id}`, { method: "DELETE" });
    setMessage("Удалено");
    await loadItems();
  }

  function uploadCategory(fieldKey: string) {
    return fields.find((field) => field.key === fieldKey)?.uploadCategory ?? "uploads";
  }

  async function uploadImage(fieldKey: string, file: File | null) {
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      setMessage(validationError);
      return;
    }
    const payload = new FormData();
    payload.append("file", file);
    payload.append("category", uploadCategory(fieldKey));
    const data = await request("/admin/upload", { method: "POST", body: payload });
    setForm((current) => ({ ...current, [fieldKey]: data.url }));
  }

  async function uploadImageList(fieldKey: string, files: FileList | null) {
    if (!files?.length) return;
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const validationError = validateImageFile(file);
      if (validationError) {
        setMessage(`${file.name}: ${validationError}`);
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
  }

  useEffect(() => {
    setToken(localStorage.getItem("adminToken") ?? "");
  }, []);

  useEffect(() => {
    void loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, endpoint]);

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
          </div>
        </div>

        {!token ? (
          <Card>
            <CardHeader><CardTitle>Вход администратора</CardTitle></CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-3" onSubmit={login}>
                <input className="rounded-2xl border p-3" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Логин" />
                <input className="rounded-2xl border p-3" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" type="password" />
                <Button type="submit">Войти</Button>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {message ? <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{message}</div> : null}

        {token ? (
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <Card>
              <CardHeader><CardTitle>{editingId ? "Редактирование" : "Новая запись"}</CardTitle></CardHeader>
              <CardContent>
                <form className="grid gap-3" onSubmit={saveItem}>
                  {fields.map((field) => (
                    <label className="grid gap-1 text-sm font-semibold text-steel-700" key={field.key}>
                      {field.label}
                      {field.type === "textarea" || field.type === "json" || field.type === "image-list" ? (
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
                        {columns.map((column) => <td className="max-w-[280px] px-3 py-3 align-top" key={column.key}>{column.render ? column.render(item[column.key], item) : formatCell(item[column.key])}</td>)}
                        <td className="px-3 py-3">
                          <div className="flex gap-2">
                            <button className="text-copper-700 underline" onClick={() => { setEditingId(Number(item.id)); setForm(Object.fromEntries(fields.map((field) => [field.key, (field.type === "json" || field.type === "image-list") ? JSON.stringify(item[field.key] ?? null, null, 2) : (item[field.key] ?? emptyValue(field))]))); }}>Править</button>
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

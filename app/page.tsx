"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";

type Clip = { id: string; text: string };

export default function Home() {
  const [text, setText] = useState("");
  const [clips, setClips] = useState<Clip[]>([]);
  const [saving, setSaving] = useState(false);

  // Ambil data secara realtime dari Firestore
  useEffect(() => {
    const q = query(collection(db, "clips"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setClips(
        snapshot.docs.map((d) => ({ id: d.id, text: d.data().text as string }))
      );
    });
    return () => unsubscribe();
  }, []);

  async function handleSave() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "clips"), {
        text: text.trim(),
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      alert("Gagal menyimpan, cek koneksi atau pengaturan Firebase.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteDoc(doc(db, "clips", id));
    } catch (error) {
      console.error("Gagal menghapus:", error);
    }
  }

  async function handleCopy(value: string) {
    await navigator.clipboard.writeText(value);
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Copas Clipboard</h1>

      <div className="mb-8 flex flex-col gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tempel atau ketik teks di sini..."
          rows={4}
          className="w-full rounded-xl border border-black/20 bg-transparent p-3 outline-none focus:border-blue-500 dark:border-white/30"
        />
        <button
          onClick={handleSave}
          disabled={saving || !text.trim()}
          className="self-end rounded-xl bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>

      {clips.length === 0 ? (
        <p className="text-center opacity-60">Belum ada teks tersimpan.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clips.map((clip) => (
            <div
              key={clip.id}
              className="flex flex-col justify-between gap-3 rounded-xl border border-black/10 p-4 dark:border-white/20"
            >
              <p className="whitespace-pre-wrap break-words">{clip.text}</p>
              <div className="flex justify-end gap-2 text-sm">
                <button
                  onClick={() => handleCopy(clip.text)}
                  className="rounded-lg border border-black/20 px-3 py-1 hover:bg-black/5 dark:border-white/30 dark:hover:bg-white/10"
                >
                  Copy
                </button>
                <button
                  onClick={() => handleDelete(clip.id)}
                  className="rounded-lg bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
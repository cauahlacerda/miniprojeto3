"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "contexts/AuthContext";
import api from "lib/api";

import { Button } from "ui/button";
import { Input } from "ui/input";
import { Label } from "ui/label";
import { Textarea } from "ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "ui/alert";

export default function CreatePost() {
  const { token } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      setError("O conteúdo da postagem não pode ser vazio.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) {
        formData.append("image", image);
      }

      await api.post("/posts", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      router.push("/");
    } catch (err: any) {
      setError("Erro ao criar postagem: " + (err.response?.data?.detail || err.message));
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Criar Postagem</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="content">Conteúdo da postagem</Label>
          <Textarea
            id="content"
            placeholder="Escreva sua postagem aqui..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={5}
            className="resize-none"
          />
        </div>

        <div>
          <Label htmlFor="image">Imagem (opcional)</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setImage(e.target.files[0]);
              } else {
                setImage(null);
              }
            }}
          />
        </div>

        <Button type="submit" variant="primary" className="w-full">
          Publicar
        </Button>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "contexts/AuthContext";
import api from "lib/api";

import { Button } from "ui/button";
import { Input } from "ui/input";
import { Label } from "ui/label";
import { Textarea } from "ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "ui/alert";

export default function EditPost() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params.id;

  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [currentImagePath, setCurrentImagePath] = useState<string | null>(null);

  useEffect(() => {
    if (!postId || !token) return;

    api
      .get(`/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const post = res.data;
        if (!post) {
          setError("Postagem não encontrada");
          return;
        }
        setContent(post.content);
        setCurrentImagePath(post.image_path || null);
      })
      .catch(() => setError("Erro ao carregar postagem"));
  }, [postId, token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) {
        formData.append("image", image);
      }

      await api.put(`/posts/${postId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      router.push("/");
    } catch (err: any) {
      setError("Erro ao editar postagem: " + (err.response?.data?.detail || err.message));
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Editar Postagem</h1>

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
            placeholder="Edite o conteúdo da postagem..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={5}
            className="resize-none"
          />
        </div>

        {currentImagePath && (
          <div className="mb-4">
            <p className="mb-2 text-foreground font-semibold">Imagem atual:</p>
            <img
              src={`http://localhost:8000/${currentImagePath}`}
              alt="Imagem atual"
              className="max-w-full rounded-md"
            />
          </div>
        )}

        <div>
          <Label htmlFor="image">Nova imagem (opcional)</Label>
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
          Salvar
        </Button>
      </form>
    </div>
  );
}

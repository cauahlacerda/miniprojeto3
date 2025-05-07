"use client";

import { useEffect, useState } from "react";
import { useAuth } from "contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "lib/api";

import { Button } from "ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "ui/avatar";
import { Badge } from "ui/badge";
import { Separator } from "ui/separator";
import { Alert, AlertTitle, AlertDescription } from "ui/alert";

interface User {
  id: number;
  username: string;
}

interface Interaction {
  id: number;
  type: "like" | "dislike";
  user: User;
}

interface Post {
  id: number;
  content: string;
  image_path?: string | null;
  author: User;
  interactions: Interaction[];
}

export default function Home() {
  const { token, username, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await api.get("/posts");
      return res.data;
    },
    enabled: !!token,
    onError: (err: any) => setError("Erro ao carregar posts: " + (err.message || "Erro desconhecido")),
  });

  const likeMutation = useMutation({
    mutationFn: async ({ postId, type }: { postId: number; type: "like" | "dislike" }) => {
      if (!token) throw new Error("Usuário não autenticado");
      await api.post(
        `/interactions/posts/${postId}`,
        { type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
    onError: (error: any) => {
      alert("Erro ao registrar interação: " + (error.message || "Erro desconhecido"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (postId: number) => {
      if (!token) throw new Error("Usuário não autenticado");
      await api.delete(`/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
    onError: (error: any) => {
      alert("Erro ao excluir postagem: " + (error.message || "Erro desconhecido"));
    },
  });

  useEffect(() => {
    if (!token) router.push("/login");
  }, [token, router]);

  if (!token) return null;

  if (isLoading) return <p>Carregando posts...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Feed</h1>
        <div className="flex items-center space-x-4">
          <span className="text-lg">Olá, {username}</span>
          <Button variant="destructive" size="sm" onClick={() => logout()}>
            Sair
          </Button>
        </div>
      </header>

      <Button className="mb-6" onClick={() => router.push("/create-post")}>
        Criar Postagem
      </Button>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {posts?.map((post) => {
        const userInteraction = post.interactions?.find((i) => i.user.username === username);
        const likes = post.interactions?.filter((i) => i.type === "like").length || 0;
        const dislikes = post.interactions?.filter((i) => i.type === "dislike").length || 0;

        return (
          <Card key={post.id} className="mb-6 shadow">
            <CardHeader className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback>{post.author.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <CardTitle>{post.author.username}</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="mb-4 whitespace-pre-wrap">{post.content}</p>

              {post.image_path && (
                <img
                  src={`http://localhost:8000/${post.image_path}`}
                  alt="Imagem do post"
                  className="rounded-md max-w-full mb-4"
                />
              )}

              <div className="flex space-x-4 text-sm text-muted-foreground">
                <Badge variant="secondary">Likes: {likes}</Badge>
                <Badge variant="secondary">Dislikes: {dislikes}</Badge>
              </div>
            </CardContent>

            <CardFooter className="flex flex-wrap gap-2">
              {post.author.username === username ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => router.push(`/edit-post/${post.id}`)}>
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(post.id)}
                    disabled={deleteMutation.isLoading}
                  >
                    Excluir
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant={userInteraction?.type === "like" ? "ghost" : "default"}
                    size="sm"
                    disabled={userInteraction?.type === "like"}
                    onClick={() => likeMutation.mutate({ postId: post.id, type: "like" })}
                  >
                    Like
                  </Button>
                  <Button
                    variant={userInteraction?.type === "dislike" ? "ghost" : "destructive"}
                    size="sm"
                    disabled={userInteraction?.type === "dislike"}
                    onClick={() => likeMutation.mutate({ postId: post.id, type: "dislike" })}
                  >
                    Dislike
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

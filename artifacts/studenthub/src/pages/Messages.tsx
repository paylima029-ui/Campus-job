import { useState } from "react";
import { Redirect } from "wouter";
import {
  useListConversations,
  useListMessages,
  useSendMessage,
  useCreateConversation,
  getListMessagesQueryKey,
  getListConversationsQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Send, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatRelative(dateStr: string | null | undefined) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function Messages() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const { data: conversations, isLoading: convsLoading } = useListConversations({
    query: { enabled: isAuthenticated },
  });

  const { data: messages, isLoading: msgsLoading } = useListMessages(selectedConvId ?? 0, {
    query: { enabled: !!selectedConvId },
  });

  const sendMessage = useSendMessage();

  if (!isLoading && !isAuthenticated) return <Redirect to="/login" />;

  const selectedConv = conversations?.find((c) => c.id === selectedConvId);
  const otherParticipant = selectedConv?.participants.find((p) => p.id !== user?.id);

  const handleSend = () => {
    if (!message.trim() || !selectedConvId) return;
    const content = message;
    setMessage("");
    sendMessage.mutate(
      { id: selectedConvId, data: { content } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(selectedConvId) });
          queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
        },
        onError: () => {
          toast({ title: "Erreur", description: "Message non envoyé.", variant: "destructive" });
          setMessage(content);
        },
      }
    );
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      <div className="border rounded-xl overflow-hidden flex h-[600px] bg-background">
        {/* Conversations list */}
        <div className="w-80 flex-shrink-0 border-r flex flex-col">
          <div className="p-3 border-b">
            <p className="text-sm font-medium text-muted-foreground">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {convsLoading && (
              <div className="p-3 space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!convsLoading && (!conversations || conversations.length === 0) && (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <MessageSquare className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Aucune conversation</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Contactez un étudiant depuis son profil
                </p>
              </div>
            )}
            {conversations?.map((conv) => {
              const other = conv.participants.find((p) => p.id !== user?.id);
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left",
                    selectedConvId === conv.id && "bg-muted"
                  )}
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={other?.avatarUrl || ""} />
                    <AvatarFallback>{other?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium truncate">{other?.name}</p>
                      {conv.lastMessageAt && (
                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-1">
                          {formatRelative(conv.lastMessageAt as string)}
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message thread */}
        <div className="flex-1 flex flex-col">
          {!selectedConvId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Sélectionnez une conversation</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-3 border-b flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={otherParticipant?.avatarUrl || ""} />
                  <AvatarFallback>{otherParticipant?.name?.[0]}</AvatarFallback>
                </Avatar>
                <p className="font-medium text-sm">{otherParticipant?.name}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgsLoading && (
                  <div className="space-y-3">
                    {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-2/3" />)}
                  </div>
                )}
                {messages?.map((msg) => {
                  const isMine = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={cn("flex gap-2", isMine ? "flex-row-reverse" : "flex-row")}>
                      {!isMine && (
                        <Avatar className="h-7 w-7 flex-shrink-0 mt-1">
                          <AvatarImage src={msg.sender?.avatarUrl || ""} />
                          <AvatarFallback className="text-xs">{msg.sender?.name?.[0]}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn(
                        "max-w-[70%] rounded-2xl px-3.5 py-2.5 text-sm",
                        isMine
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted rounded-tl-sm"
                      )}>
                        <p className="leading-relaxed">{msg.content}</p>
                        <p className={cn("text-xs mt-1", isMine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                          {formatTime(msg.createdAt as string)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input */}
              <div className="p-3 border-t flex gap-2">
                <Input
                  placeholder="Écrire un message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSend} disabled={!message.trim() || sendMessage.isPending}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

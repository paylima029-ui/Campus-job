import { useState, useEffect, useRef } from "react";
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
import { Send, MessageSquare, ArrowLeft } from "lucide-react";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: convsLoading } = useListConversations({
    query: { enabled: isAuthenticated, refetchInterval: 10000 } as any,
  });

  const { data: messages, isLoading: msgsLoading } = useListMessages(selectedConvId ?? 0, {
    query: { enabled: !!selectedConvId, refetchInterval: 4000 } as any,
  });

  const sendMessage = useSendMessage();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages?.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages?.length]);

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

  const ConversationList = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Conversations</h2>
        {conversations && (
          <p className="text-xs text-muted-foreground mt-0.5">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {convsLoading && (
          <div className="p-3 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 p-2">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}
        {!convsLoading && (!conversations || conversations.length === 0) && (
          <div className="flex flex-col items-center justify-center h-48 text-center p-6">
            <MessageSquare className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium">Aucune conversation</p>
            <p className="text-xs text-muted-foreground mt-1">
              Contactez un étudiant ou un client depuis son profil
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
                "w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left border-b border-border/40",
                selectedConvId === conv.id && "bg-muted"
              )}
            >
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={other?.avatarUrl || ""} />
                <AvatarFallback>{other?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-2">
                  <p className="text-sm font-medium truncate">{other?.name}</p>
                  {conv.lastMessageAt && (
                    <span className="text-xs text-muted-foreground flex-shrink-0">
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
  );

  const ChatThread = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8 -ml-1"
          onClick={() => setSelectedConvId(null)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={otherParticipant?.avatarUrl || ""} />
          <AvatarFallback>{otherParticipant?.name?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm leading-none">{otherParticipant?.name}</p>
          {otherParticipant?.university && (
            <p className="text-xs text-muted-foreground mt-0.5">{otherParticipant.university}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {msgsLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className={cn("h-10 w-2/3", i % 2 === 0 && "ml-auto")} />
            ))}
          </div>
        )}
        {messages?.length === 0 && !msgsLoading && (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-sm text-muted-foreground">Aucun message. Démarrez la conversation !</p>
          </div>
        )}
        {messages?.map((msg) => {
          const isMine = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={cn("flex gap-2 items-end", isMine ? "flex-row-reverse" : "flex-row")}>
              {!isMine && (
                <Avatar className="h-6 w-6 flex-shrink-0 mb-1">
                  <AvatarImage src={msg.sender?.avatarUrl || ""} />
                  <AvatarFallback className="text-xs">{msg.sender?.name?.[0]}</AvatarFallback>
                </Avatar>
              )}
              <div className={cn(
                "max-w-[75%] rounded-2xl px-3.5 py-2.5",
                isMine
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted rounded-bl-sm"
              )}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p className={cn("text-xs mt-1 text-right", isMine ? "text-primary-foreground/60" : "text-muted-foreground")}>
                  {formatTime(msg.createdAt as string)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t flex gap-2">
        <Input
          placeholder="Écrire un message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="flex-1"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!message.trim() || sendMessage.isPending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container py-6 px-4 md:px-6">
      <h1 className="text-2xl font-bold mb-5">Messages</h1>
      <div className="border rounded-xl overflow-hidden bg-background" style={{ height: "calc(100dvh - 220px)", minHeight: "480px" }}>
        {/* Desktop: side by side. Mobile: toggle between list and thread */}
        <div className="flex h-full">
          {/* Conversation list — hidden on mobile when a conversation is selected */}
          <div className={cn(
            "w-full md:w-80 md:flex-shrink-0 md:border-r h-full",
            selectedConvId ? "hidden md:flex md:flex-col" : "flex flex-col"
          )}>
            <ConversationList />
          </div>

          {/* Chat thread — hidden on mobile when no conversation is selected */}
          <div className={cn(
            "flex-1 h-full",
            !selectedConvId ? "hidden md:flex md:flex-col" : "flex flex-col"
          )}>
            {!selectedConvId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <p className="font-medium">Sélectionnez une conversation</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Choisissez une conversation dans la liste pour commencer
                </p>
              </div>
            ) : (
              <ChatThread />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

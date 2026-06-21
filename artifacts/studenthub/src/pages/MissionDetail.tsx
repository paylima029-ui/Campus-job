import { useParams, Link, Redirect, useLocation } from "wouter";
import {
  useGetMission,
  useListApplications,
  useCreateApplication,
  useUpdateApplication,
  useUpdateMission,
  useCreateConversation,
  getListApplicationsQueryKey,
  getGetMissionQueryKey,
  getListConversationsQueryKey,
  UserRole,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Briefcase,
  Users,
  ChevronLeft,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  PlayCircle,
  Ban,
} from "lucide-react";
import { useState } from "react";

function formatFCFA(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  open: { label: "Ouverte", variant: "default" },
  in_progress: { label: "En cours", variant: "secondary" },
  completed: { label: "Terminée", variant: "outline" },
  cancelled: { label: "Annulée", variant: "destructive" },
};

export default function MissionDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id, 10);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [coverLetter, setCoverLetter] = useState("");
  const [proposedBudget, setProposedBudget] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: mission, isLoading } = useGetMission(id, { query: { enabled: !!id } as any });
  const { data: applications } = useListApplications(id, { query: { enabled: !!id && isAuthenticated } as any });
  const createApplication = useCreateApplication();
  const updateApplication = useUpdateApplication();
  const createConversation = useCreateConversation();

  const updateMission = useUpdateMission();

  const myApplication = applications?.find((a) => a.studentId === user?.id);
  const isOwner = mission?.clientId === user?.id;
  const isStudent = user?.role === UserRole.student;

  const handleMissionStatusUpdate = (newStatus: "in_progress" | "completed" | "cancelled") => {
    if (!id) return;
    updateMission.mutate(
      { id, data: { status: newStatus } },
      {
        onSuccess: () => {
          const labels: Record<string, string> = {
            in_progress: "Mission marquée en cours",
            completed: "Mission terminée",
            cancelled: "Mission annulée",
          };
          toast({ title: labels[newStatus] ?? "Mission mise à jour" });
          queryClient.invalidateQueries({ queryKey: getGetMissionQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey(id) });
        },
        onError: () => {
          toast({ title: "Erreur", description: "Impossible de mettre à jour la mission.", variant: "destructive" });
        },
      }
    );
  };

  const handleApply = () => {
    if (!id) return;
    createApplication.mutate(
      {
        missionId: id,
        data: {
          coverLetter: coverLetter || undefined,
          proposedBudget: proposedBudget ? parseFloat(proposedBudget) : undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Candidature envoyée !", description: "Le client sera notifié." });
          setShowForm(false);
          queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey(id) });
        },
        onError: () => {
          toast({ title: "Erreur", description: "Impossible d'envoyer la candidature.", variant: "destructive" });
        },
      }
    );
  };

  const handleUpdateApplication = (appId: number, status: "accepted" | "rejected") => {
    updateApplication.mutate(
      { id: appId, data: { status } },
      {
        onSuccess: () => {
          toast({ title: status === "accepted" ? "Candidature acceptée" : "Candidature refusée" });
          queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey(id) });
        },
      }
    );
  };

  const handleContactStudent = (studentId: number, studentName: string) => {
    createConversation.mutate(
      { data: { participantId: studentId } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
          toast({ title: "Conversation ouverte", description: `Discutez avec ${studentName}` });
          setLocation("/messages");
        },
        onError: () => {
          toast({ title: "Erreur", description: "Impossible d'ouvrir la conversation.", variant: "destructive" });
        },
      }
    );
  };

  const handleContactClient = () => {
    if (!mission?.client?.id) return;
    createConversation.mutate(
      { data: { participantId: mission.client.id } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
          toast({ title: "Conversation ouverte" });
          setLocation("/messages");
        },
        onError: () => {
          toast({ title: "Erreur", description: "Impossible d'ouvrir la conversation.", variant: "destructive" });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container py-8 max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!mission) return <Redirect to="/missions" />;

  const s = statusMap[mission.status] ?? { label: mission.status, variant: "outline" as const };

  return (
    <div className="container py-8 max-w-4xl">
      <Link href="/missions">
        <Button variant="ghost" size="sm" className="mb-6 -ml-2">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour aux missions
        </Button>
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant={s.variant}>{s.label}</Badge>
              {mission.skills?.map((sk) => (
                <Badge key={sk} variant="secondary">{sk}</Badge>
              ))}
            </div>
            <h1 className="text-2xl font-bold leading-tight">{mission.title}</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description de la mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{mission.description}</p>
            </CardContent>
          </Card>

          {/* Applications (visible to owner) */}
          {isOwner && applications && applications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Candidatures ({applications.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={app.student?.avatarUrl || ""} />
                        <AvatarFallback>{app.student?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Link href={`/profile/${app.student?.id}`}>
                            <span className="font-medium text-sm hover:underline cursor-pointer">{app.student?.name}</span>
                          </Link>
                          {app.student?.averageRating && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {app.student.averageRating.toFixed(1)}
                            </span>
                          )}
                          <Badge variant={
                            app.status === "accepted" ? "default" :
                            app.status === "rejected" ? "destructive" : "secondary"
                          } className="text-xs">
                            {app.status === "accepted" ? "Accepté" : app.status === "rejected" ? "Refusé" : "En attente"}
                          </Badge>
                        </div>
                        {app.coverLetter && (
                          <p className="text-sm text-muted-foreground line-clamp-3">{app.coverLetter}</p>
                        )}
                        {app.proposedBudget && (
                          <p className="text-sm font-medium mt-1">Budget proposé : {formatFCFA(app.proposedBudget)}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {/* Contact button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleContactStudent(app.student!.id, app.student!.name)}
                        disabled={createConversation.isPending}
                      >
                        <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                        Contacter
                      </Button>
                      {/* Accept / Reject */}
                      {app.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateApplication(app.id, "accepted")}
                            disabled={updateApplication.isPending}
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Accepter
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUpdateApplication(app.id, "rejected")}
                            disabled={updateApplication.isPending}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1.5" /> Refuser
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Mission management (visible to owner) */}
          {isOwner && mission.status !== "cancelled" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Gestion de la mission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Statut actuel : <strong>{statusMap[mission.status]?.label ?? mission.status}</strong>
                </p>
                <div className="flex flex-wrap gap-2">
                  {mission.status === "open" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleMissionStatusUpdate("in_progress")}
                      disabled={updateMission.isPending}
                    >
                      <PlayCircle className="h-3.5 w-3.5 mr-1.5" />
                      Marquer en cours
                    </Button>
                  )}
                  {(mission.status === "open" || mission.status === "in_progress") && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleMissionStatusUpdate("completed")}
                        disabled={updateMission.isPending}
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                        Terminer la mission
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMissionStatusUpdate("cancelled")}
                        disabled={updateMission.isPending}
                        className="text-destructive hover:text-destructive"
                      >
                        <Ban className="h-3.5 w-3.5 mr-1.5" />
                        Annuler
                      </Button>
                    </>
                  )}
                  {mission.status === "completed" && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Mission terminée avec succès
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Postuler (students) */}
          {isAuthenticated && isStudent && mission.status === "open" && !isOwner && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Postuler à cette mission</CardTitle>
              </CardHeader>
              <CardContent>
                {myApplication ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Candidature envoyée — statut : <strong>
                        {myApplication.status === "accepted" ? "Acceptée" :
                         myApplication.status === "rejected" ? "Refusée" : "En attente"}
                      </strong></span>
                    </div>
                    {/* Contact the client */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleContactClient}
                      disabled={createConversation.isPending}
                    >
                      <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                      Contacter le client
                    </Button>
                  </div>
                ) : showForm ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Lettre de motivation</Label>
                      <Textarea
                        placeholder="Expliquez pourquoi vous êtes le meilleur candidat pour cette mission..."
                        rows={5}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Budget proposé (FCFA, optionnel)</Label>
                      <Input
                        type="number"
                        placeholder="ex: 50000"
                        value={proposedBudget}
                        onChange={(e) => setProposedBudget(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleApply} disabled={createApplication.isPending}>
                        {createApplication.isPending ? "Envoi..." : "Envoyer ma candidature"}
                      </Button>
                      <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={() => setShowForm(true)}>Postuler maintenant</Button>
                    <Button variant="outline" onClick={handleContactClient} disabled={createConversation.isPending}>
                      <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                      Contacter le client
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!isAuthenticated && (
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-muted-foreground mb-3">Connectez-vous pour postuler à cette mission</p>
                <Link href="/login"><Button>Se connecter</Button></Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Budget</p>
                  <p className="font-bold text-lg">{formatFCFA(mission.budget)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Date limite</p>
                  <p className="font-medium">{formatDate(mission.deadline)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Candidatures</p>
                  <p className="font-medium">{mission.applicationCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client info */}
          {mission.client && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Publié par</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={mission.client.avatarUrl || ""} />
                    <AvatarFallback>{mission.client.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link href={`/profile/${mission.client.id}`}>
                      <p className="font-medium text-sm hover:underline cursor-pointer">{mission.client.name}</p>
                    </Link>
                    {mission.client.averageRating && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {mission.client.averageRating.toFixed(1)} ({mission.client.totalReviews} avis)
                      </span>
                    )}
                  </div>
                </div>
                {isAuthenticated && isStudent && !isOwner && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleContactClient}
                    disabled={createConversation.isPending}
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                    {createConversation.isPending ? "Ouverture..." : "Contacter le client"}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

import { Link } from "wouter";
import {
  useGetClientDashboard,
  useGetStudentDashboard,
  useListServices,
  useListMissions,
  useListApplications,
  UserRole,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  CreditCard,
  Inbox,
  CheckCircle,
  FileText,
  Activity,
  Users,
  Plus,
  Star,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Redirect } from "wouter";

function formatFCFA(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    open: { label: "Ouverte", variant: "default" },
    in_progress: { label: "En cours", variant: "secondary" },
    completed: { label: "Terminée", variant: "outline" },
    cancelled: { label: "Annulée", variant: "destructive" },
    pending: { label: "En attente", variant: "secondary" },
    accepted: { label: "Acceptée", variant: "default" },
    rejected: { label: "Refusée", variant: "destructive" },
  };
  const s = map[status] ?? { label: status, variant: "outline" };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

function StudentDashboardView({ userId }: { userId: number }) {
  const { data: stats, isLoading: statsLoading } = useGetStudentDashboard();
  const { data: servicesData, isLoading: servicesLoading } = useListServices();

  const myServices = servicesData?.services?.filter((s) => s.studentId === userId) ?? [];

  const statCards = [
    { title: "Gains totaux", value: formatFCFA(stats?.totalEarnings ?? 0), icon: CreditCard, color: "text-green-500" },
    { title: "Services actifs", value: stats?.activeServices ?? 0, icon: Briefcase, color: "text-blue-500" },
    { title: "Candidatures envoyées", value: stats?.activeApplications ?? 0, icon: FileText, color: "text-orange-500" },
    { title: "En attente de réponse", value: stats?.pendingApplications ?? 0, icon: Clock, color: "text-yellow-500" },
    { title: "Missions terminées", value: stats?.completedMissions ?? 0, icon: CheckCircle, color: "text-primary" },
    { title: "Messages non lus", value: stats?.unreadMessages ?? 0, icon: Inbox, color: "text-red-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/services/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un service
          </Button>
        </Link>
        <Link href="/missions">
          <Button variant="outline">
            <Briefcase className="h-4 w-4 mr-2" />
            Parcourir les missions
          </Button>
        </Link>
        <Link href="/profile/edit">
          <Button variant="outline">
            Compléter mon profil
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Statistiques</h2>
        {statsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {statCards.map((stat, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* My services */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Mes services</h2>
          <Link href="/services/new">
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4 mr-1" /> Ajouter
            </Button>
          </Link>
        </div>
        {servicesLoading ? (
          <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-16" />)}</div>
        ) : myServices.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-medium">Aucun service publié</p>
              <p className="text-sm text-muted-foreground mb-4">Proposez vos compétences et commencez à gagner de l'argent</p>
              <Link href="/services/new">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Créer mon premier service
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {myServices.map((s) => (
              <Card key={s.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {s.imageUrl && (
                      <img src={s.imageUrl} alt={s.title} className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium truncate">{s.title}</p>
                      <p className="text-sm text-muted-foreground">{formatFCFA(s.price)} · {s.deliveryDays}j · {s.totalOrders} commandes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    {s.averageRating && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        {s.averageRating.toFixed(1)}
                      </span>
                    )}
                    <Link href={`/services/${s.id}`}>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ClientDashboardView({ userId }: { userId: number }) {
  const { data: stats, isLoading: statsLoading } = useGetClientDashboard();
  const { data: missionsData, isLoading: missionsLoading } = useListMissions();

  const myMissions = missionsData?.missions?.filter((m) => m.clientId === userId) ?? [];

  const statCards = [
    { title: "Dépenses totales", value: formatFCFA(stats?.totalSpent ?? 0), icon: CreditCard, color: "text-primary" },
    { title: "Missions actives", value: stats?.activeMissions ?? 0, icon: Activity, color: "text-blue-500" },
    { title: "Candidatures reçues", value: stats?.totalApplicationsReceived ?? 0, icon: Users, color: "text-orange-500" },
    { title: "Missions terminées", value: stats?.completedMissions ?? 0, icon: CheckCircle, color: "text-green-500" },
    { title: "Messages non lus", value: stats?.unreadMessages ?? 0, icon: Inbox, color: "text-red-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/missions/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Publier une mission
          </Button>
        </Link>
        <Link href="/services">
          <Button variant="outline">
            <Briefcase className="h-4 w-4 mr-2" />
            Trouver un service
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Statistiques</h2>
        {statsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {statCards.map((stat, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* My missions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Mes missions</h2>
          <Link href="/missions/new">
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4 mr-1" /> Publier
            </Button>
          </Link>
        </div>
        {missionsLoading ? (
          <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-16" />)}</div>
        ) : myMissions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-medium">Aucune mission publiée</p>
              <p className="text-sm text-muted-foreground mb-4">Publiez votre besoin et recevez des candidatures d'étudiants qualifiés</p>
              <Link href="/missions/new">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Publier ma première mission
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {myMissions.map((m) => (
              <Card key={m.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{m.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Budget : {formatFCFA(m.budget)} · {m.applicationCount} candidature(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <StatusBadge status={m.status} />
                    <Link href={`/missions/${m.id}`}>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Redirect to="/login" />;

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">Bienvenue, {user?.name}.</p>
      </div>

      {user && (user.role === UserRole.student
        ? <StudentDashboardView userId={user.id} />
        : <ClientDashboardView userId={user.id} />
      )}
    </div>
  );
}

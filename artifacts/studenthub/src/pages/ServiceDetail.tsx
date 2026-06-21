import { useParams, Link, useLocation } from "wouter";
import {
  useGetService,
  useCreateConversation,
  getListConversationsQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Star, Clock, MessageSquare, ChevronLeft, ShoppingCart } from "lucide-react";

function formatFCFA(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

export default function ServiceDetail() {
  const params = useParams<{ id: string }>();
  const id = params?.id ? parseInt(params.id, 10) : 0;
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createConversation = useCreateConversation();

  const { data: service, isLoading } = useGetService(id, {
    query: { enabled: !!id } as any,
  });

  const handleContact = () => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }
    if (!service?.student?.id) return;
    if (service.student.id === user?.id) {
      toast({ title: "Impossible", description: "Il s'agit de votre propre service.", variant: "destructive" });
      return;
    }
    createConversation.mutate(
      { data: { participantId: service.student.id } },
      {
        onSuccess: (conv) => {
          queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
          toast({ title: "Conversation ouverte", description: `Discutez avec ${service.student?.name}` });
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
      <div className="container py-12 max-w-5xl space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Service introuvable</h1>
        <Link href="/services"><Button variant="link" className="mt-2">Retour aux services</Button></Link>
      </div>
    );
  }

  const isOwnService = service.student?.id === user?.id;

  return (
    <div className="container py-8 max-w-5xl">
      <Link href="/services">
        <Button variant="ghost" size="sm" className="mb-6 -ml-2">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour aux services
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="secondary">{service.category}</Badge>
            </div>
            <h1 className="text-2xl font-bold leading-tight mb-3">{service.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {service.averageRating ? (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {service.averageRating.toFixed(1)} ({service.totalOrders} avis)
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-muted-foreground/40" />
                  Nouveau service
                </span>
              )}
              <span className="flex items-center gap-1">
                <ShoppingCart className="h-4 w-4" />
                {service.totalOrders || 0} commandes
              </span>
            </div>
          </div>

          {service.imageUrl && (
            <div className="rounded-xl overflow-hidden border bg-muted">
              <img src={service.imageUrl} alt={service.title} className="w-full object-cover max-h-80" />
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold mb-3">Description du service</h2>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{service.description}</p>
          </div>
        </div>

        {/* Sidebar / Order card */}
        <div>
          <div className="border rounded-xl p-6 sticky top-24 bg-card shadow-sm space-y-5">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Prix</p>
              <p className="text-3xl font-bold text-primary">{formatFCFA(service.price)}</p>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Livraison en {service.deliveryDays} jour{service.deliveryDays > 1 ? "s" : ""}
            </div>

            {isOwnService ? (
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard">Gérer mon service</Link>
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleContact}
                  disabled={createConversation.isPending}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {createConversation.isPending ? "Ouverture..." : "Commander ce service"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Contactez le freelance pour discuter de votre projet
                </p>
              </div>
            )}

            <div className="border-t pt-5">
              <p className="text-sm font-semibold mb-3">Le freelance</p>
              <Link href={`/profile/${service.student?.id}`}>
                <div className="flex items-center gap-3 cursor-pointer group">
                  <Avatar className="h-11 w-11">
                    <AvatarImage src={service.student?.avatarUrl || ""} />
                    <AvatarFallback>{service.student?.name?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm group-hover:underline">{service.student?.name}</p>
                    {service.student?.university && (
                      <p className="text-xs text-muted-foreground">{service.student.university}</p>
                    )}
                    {service.student?.averageRating && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {service.student.averageRating.toFixed(1)} · {service.student.totalReviews} avis
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

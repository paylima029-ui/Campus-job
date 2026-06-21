import { useParams, Link } from "wouter";
import {
  useGetUser,
  useListServices,
  useListUserReviews,
  UserRole,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Star,
  GraduationCap,
  Briefcase,
  FileText,
  Globe,
  MessageSquare,
  ChevronLeft,
  ExternalLink,
} from "lucide-react";
import { Link as LinkIcon } from "lucide-react";

function formatFCFA(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1,2,3,4,5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
        />
      ))}
      <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      <span className="text-sm text-muted-foreground">({count} avis)</span>
    </div>
  );
}

export default function Profile() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id, 10);
  const { user: currentUser } = useAuth();

  const { data: profile, isLoading: profileLoading } = useGetUser(id, { query: { enabled: !!id } });
  const { data: servicesData } = useListServices({ params: { query: {} } });
  const { data: reviews } = useListUserReviews(id, { query: { enabled: !!id } });

  const isOwnProfile = currentUser?.id === id;
  const userServices = servicesData?.services?.filter((s) => s.studentId === id) ?? [];

  if (profileLoading) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="flex gap-6 mb-8">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-3 flex-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">Profil introuvable</p>
        <Link href="/services"><Button variant="link" className="mt-2">Retour à la marketplace</Button></Link>
      </div>
    );
  }

  const isStudent = profile.role === UserRole.student;

  return (
    <div className="container py-8 max-w-4xl">
      <Link href="/services">
        <Button variant="ghost" size="sm" className="mb-6 -ml-2">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatarUrl || ""} />
                  <AvatarFallback className="text-3xl">{profile.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl font-bold">{profile.name}</h1>
                  <p className="text-sm text-muted-foreground capitalize mt-1">
                    {profile.role === UserRole.student ? "Étudiant(e)" :
                     profile.role === UserRole.company ? "Entreprise" : "Particulier"}
                  </p>
                  {isStudent && profile.university && (
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                      <GraduationCap className="h-3.5 w-3.5" />
                      {profile.university}
                    </p>
                  )}
                </div>

                {profile.averageRating && profile.totalReviews > 0 && (
                  <StarRating rating={profile.averageRating} count={profile.totalReviews} />
                )}

                {isStudent && (
                  <div className="flex gap-4 w-full justify-around border-t pt-4">
                    <div className="text-center">
                      <p className="text-xl font-bold text-primary">{profile.completedMissions}</p>
                      <p className="text-xs text-muted-foreground">Missions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-primary">{userServices.length}</p>
                      <p className="text-xs text-muted-foreground">Services</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-primary">{profile.totalReviews}</p>
                      <p className="text-xs text-muted-foreground">Avis</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 w-full">
                  {isOwnProfile ? (
                    <Link href="/profile/edit">
                      <Button className="w-full" variant="outline">Modifier mon profil</Button>
                    </Link>
                  ) : (
                    <Link href={`/messages`}>
                      <Button className="w-full">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contacter
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          {isStudent && ((profile as any).cvUrl || (profile as any).portfolioUrl) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(profile as any).cvUrl && (
                  <a
                    href={(profile as any).cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    Voir le CV
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </a>
                )}
                {(profile as any).portfolioUrl && (
                  <a
                    href={(profile as any).portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    Portfolio
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {isStudent && profile.skills && profile.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Compétences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((s) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          {profile.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">À propos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Services (students only) */}
          {isStudent && userServices.length > 0 && (
            <div>
              <h2 className="text-base font-semibold mb-3">Services proposés</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {userServices.map((s) => (
                  <Link key={s.id} href={`/services/${s.id}`}>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                      {s.imageUrl && (
                        <div className="h-32 overflow-hidden rounded-t-lg">
                          <img src={s.imageUrl} alt={s.title} className="h-full w-full object-cover" />
                        </div>
                      )}
                      <CardContent className="pt-3 pb-4">
                        <p className="font-medium line-clamp-2 text-sm">{s.title}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-primary font-bold text-sm">{formatFCFA(s.price)}</span>
                          {s.averageRating && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {s.averageRating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {reviews && reviews.length > 0 && (
            <div>
              <h2 className="text-base font-semibold mb-3">Avis ({reviews.length})</h2>
              <div className="space-y-3">
                {reviews.map((r) => (
                  <Card key={r.id}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={r.reviewer?.avatarUrl || ""} />
                          <AvatarFallback>{r.reviewer?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <p className="font-medium text-sm">{r.reviewer?.name}</p>
                            <div className="flex items-center gap-0.5">
                              {[1,2,3,4,5].map((i) => (
                                <Star key={i} className={`h-3.5 w-3.5 ${i <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                              ))}
                            </div>
                          </div>
                          {r.comment && (
                            <p className="text-sm text-muted-foreground mt-1">{r.comment}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {reviews && reviews.length === 0 && !isOwnProfile && (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <Star className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucun avis pour le moment</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

import { useListMissions } from "@workspace/api-client-react";
import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar, Briefcase, Users } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function Missions() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useListMissions({ search });

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Missions</h1>
          <p className="text-muted-foreground">Trouvez des opportunités freelance pour faire valoir vos compétences.</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Input 
            placeholder="Rechercher une mission..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:w-[300px]"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="w-full">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-1/3 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-6" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data?.missions?.length === 0 ? (
        <div className="text-center py-20 border rounded-lg bg-muted/20">
          <h3 className="text-xl font-medium">Aucune mission trouvée</h3>
          <p className="text-muted-foreground mt-2">Essayez de modifier votre recherche.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {data?.missions?.map((mission) => (
            <Card key={mission.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                        {mission.status === "open" ? "Ouvert" : mission.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center">
                        <Briefcase className="w-4 h-4 mr-1" />
                        {mission.client?.companyName || mission.client?.name}
                      </span>
                    </div>
                    <Link href={`/missions/${mission.id}`}>
                      <h3 className="text-xl font-bold hover:text-primary transition-colors cursor-pointer">
                        {mission.title}
                      </h3>
                    </Link>
                  </div>
                  <p className="text-muted-foreground line-clamp-2">{mission.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Échéance: {format(new Date(mission.deadline), "d MMMM yyyy", { locale: fr })}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {mission.applicationCount || 0} candidature(s)
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-end justify-center gap-4 md:pl-6 md:border-l">
                  <div className="text-2xl font-bold text-foreground">
                    {new Intl.NumberFormat('fr-FR').format(mission.budget)} FCFA
                  </div>
                  <Link href={`/missions/${mission.id}`}>
                    <Button>Voir la mission</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

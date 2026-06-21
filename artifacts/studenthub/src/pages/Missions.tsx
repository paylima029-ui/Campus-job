import { useListMissions } from "@workspace/api-client-react";
import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Briefcase, Users, SlidersHorizontal, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const STATUS_OPTIONS = [
  { value: "open", label: "Ouverte" },
  { value: "in_progress", label: "En cours" },
  { value: "completed", label: "Terminée" },
  { value: "cancelled", label: "Annulée" },
];

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  open:        { label: "Ouverte",   variant: "default" },
  in_progress: { label: "En cours",  variant: "secondary" },
  completed:   { label: "Terminée",  variant: "outline" },
  cancelled:   { label: "Annulée",   variant: "destructive" },
};

export default function Missions() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useListMissions({
    search: search || undefined,
    status: (status || undefined) as "open" | "in_progress" | "completed" | "cancelled" | undefined,
    minBudget: minBudget ? parseFloat(minBudget) : undefined,
    maxBudget: maxBudget ? parseFloat(maxBudget) : undefined,
  });

  const hasActiveFilters = status !== "" || minBudget !== "" || maxBudget !== "";

  const resetFilters = () => {
    setStatus("");
    setMinBudget("");
    setMaxBudget("");
  };

  return (
    <div className="container py-8 px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Missions</h1>
          <p className="text-muted-foreground mt-1">
            {data?.total !== undefined
              ? `${data.total} mission${data.total !== 1 ? "s" : ""} disponible${data.total !== 1 ? "s" : ""}`
              : "Trouvez des opportunités freelance"}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Input
              placeholder="Rechercher une mission..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-8"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            variant={showFilters ? "secondary" : "outline"}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            title="Filtres"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Filtres</p>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-7 text-xs">
                <X className="h-3 w-3 mr-1" /> Réinitialiser
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Statut</p>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les statuts</SelectItem>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Budget minimum (FCFA)</p>
              <Input
                type="number"
                placeholder="ex: 10 000"
                value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)}
                min={0}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Budget maximum (FCFA)</p>
              <Input
                type="number"
                placeholder="ex: 500 000"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                min={0}
                className="h-9"
              />
            </div>
          </div>
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-1">
              {status && (
                <Badge variant="secondary" className="gap-1">
                  {STATUS_OPTIONS.find((s) => s.value === status)?.label}
                  <button onClick={() => setStatus("")}><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {minBudget && (
                <Badge variant="secondary" className="gap-1">
                  Min {parseInt(minBudget).toLocaleString("fr-FR")} FCFA
                  <button onClick={() => setMinBudget("")}><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {maxBudget && (
                <Badge variant="secondary" className="gap-1">
                  Max {parseInt(maxBudget).toLocaleString("fr-FR")} FCFA
                  <button onClick={() => setMaxBudget("")}><X className="h-3 w-3" /></button>
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
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
          <p className="text-lg font-medium">Aucune mission trouvée</p>
          <p className="text-muted-foreground mt-2 text-sm">
            {hasActiveFilters || search ? "Essayez de modifier vos critères." : "Aucune mission disponible pour le moment."}
          </p>
          {(hasActiveFilters || search) && (
            <Button variant="link" onClick={() => { resetFilters(); setSearch(""); }} className="mt-2">
              Effacer tous les filtres
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {data?.missions?.map((mission) => {
            const s = statusMap[mission.status] ?? { label: mission.status, variant: "outline" as const };
            return (
              <Card key={mission.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex flex-col md:flex-row gap-5 md:items-center justify-between">
                  <div className="flex-1 space-y-3 min-w-0">
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant={s.variant}>{s.label}</Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          {mission.client?.name}
                        </span>
                      </div>
                      <Link href={`/missions/${mission.id}`}>
                        <h3 className="text-lg font-bold hover:text-primary transition-colors cursor-pointer line-clamp-1">
                          {mission.title}
                        </h3>
                      </Link>
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2">{mission.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Échéance : {format(new Date(mission.deadline), "d MMM yyyy", { locale: fr })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {mission.applicationCount || 0} candidature{(mission.applicationCount || 0) > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 md:pl-5 md:border-l shrink-0">
                    <div className="text-xl font-bold text-foreground">
                      {new Intl.NumberFormat("fr-FR").format(mission.budget)} FCFA
                    </div>
                    <Link href={`/missions/${mission.id}`}>
                      <Button size="sm">Voir la mission</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

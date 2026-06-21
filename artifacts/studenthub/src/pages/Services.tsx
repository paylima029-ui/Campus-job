import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useListServices } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ALL_CATEGORIES = [
  "Développement Web",
  "Design Graphique",
  "Rédaction & Traduction",
  "Marketing Digital",
  "Comptabilité & Finance",
  "Photographie & Vidéo",
  "Conseil & Formation",
  "IA & Automatisation",
  "Assistance Administrative",
  "Autre",
];

export default function Services() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useListServices({
    search: search || undefined,
    category: category || undefined,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
  });

  const hasActiveFilters = category !== "" || minPrice !== "" || maxPrice !== "";

  const resetFilters = () => {
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="container py-8 px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground mt-1">
            {data?.total !== undefined ? `${data.total} service${data.total !== 1 ? "s" : ""} disponible${data.total !== 1 ? "s" : ""}` : "Découvrez les talents étudiants africains"}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Input
              placeholder="Rechercher un service..."
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
              <p className="text-xs font-medium text-muted-foreground">Catégorie</p>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les catégories</SelectItem>
                  {ALL_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Prix minimum (FCFA)</p>
              <Input
                type="number"
                placeholder="ex: 5 000"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min={0}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Prix maximum (FCFA)</p>
              <Input
                type="number"
                placeholder="ex: 100 000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min={0}
                className="h-9"
              />
            </div>
          </div>
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-1">
              {category && (
                <Badge variant="secondary" className="gap-1">
                  {category}
                  <button onClick={() => setCategory("")}><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {minPrice && (
                <Badge variant="secondary" className="gap-1">
                  Min {parseInt(minPrice).toLocaleString("fr-FR")} FCFA
                  <button onClick={() => setMinPrice("")}><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {maxPrice && (
                <Badge variant="secondary" className="gap-1">
                  Max {parseInt(maxPrice).toLocaleString("fr-FR")} FCFA
                  <button onClick={() => setMaxPrice("")}><X className="h-3 w-3" /></button>
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data?.services?.length === 0 ? (
        <div className="text-center py-20 border rounded-lg bg-muted/20">
          <p className="text-lg font-medium">Aucun service trouvé</p>
          <p className="text-muted-foreground mt-2 text-sm">
            {hasActiveFilters || search ? "Essayez de modifier vos critères de recherche." : "Aucun service disponible pour le moment."}
          </p>
          {(hasActiveFilters || search) && (
            <Button variant="link" onClick={() => { resetFilters(); setSearch(""); }} className="mt-2">
              Effacer tous les filtres
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.services?.map((service) => (
            <Card key={service.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
              {service.imageUrl ? (
                <div className="h-48 overflow-hidden">
                  <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-primary/5 to-primary/20 flex items-center justify-center">
                  <span className="text-primary/50 font-semibold text-sm">{service.category}</span>
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {service.category}
                  </span>
                  {service.averageRating ? (
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      {service.averageRating.toFixed(1)}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Nouveau</span>
                  )}
                </div>
                <CardTitle className="line-clamp-2 text-base leading-snug">{service.title}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={service.student?.avatarUrl || ""} />
                    <AvatarFallback className="text-xs">{service.student?.name?.[0]?.toUpperCase() || "S"}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground truncate">{service.student?.name}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t pt-3">
                <div className="font-bold">
                  {new Intl.NumberFormat("fr-FR").format(service.price)} FCFA
                </div>
                <Link href={`/services/${service.id}`}>
                  <Button variant="secondary" size="sm">Voir le service</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

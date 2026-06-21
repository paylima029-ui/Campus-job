import { useState } from "react";
import { Link } from "wouter";
import { useListServices } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

export default function Services() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useListServices({ search });

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground">Découvrez les talents proposés par les étudiants.</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Input 
            placeholder="Rechercher un service..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:w-[300px]"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
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
          <h3 className="text-xl font-medium">Aucun service trouvé</h3>
          <p className="text-muted-foreground mt-2">Essayez de modifier votre recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.services?.map((service) => (
            <Card key={service.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
              {service.imageUrl ? (
                <div className="h-48 overflow-hidden">
                  <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-48 bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground/50 font-medium text-lg">{service.category}</span>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {service.category}
                  </span>
                  {service.averageRating ? (
                    <div className="flex items-center text-sm font-medium">
                      <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                      {service.averageRating.toFixed(1)}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Nouveau</span>
                  )}
                </div>
                <CardTitle className="line-clamp-1 text-lg">{service.title}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={service.student?.avatarUrl || ""} />
                    <AvatarFallback>{service.student?.name?.[0]?.toUpperCase() || "S"}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground truncate">{service.student?.name}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t pt-4">
                <div className="font-bold text-lg">
                  {new Intl.NumberFormat('fr-FR').format(service.price)} FCFA
                </div>
                <Link href={`/services/${service.id}`}>
                  <Button variant="secondary" size="sm">Détails</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

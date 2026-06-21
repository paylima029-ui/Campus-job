import { Link, useLocation, Redirect } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateService, getListServicesQueryKey, UserRole } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";

const CATEGORIES = [
  "Création de CV",
  "Lettres de motivation",
  "Design Canva",
  "Création de logos",
  "Développement Web",
  "Traduction",
  "Saisie de données",
  "Assistance informatique",
  "Soutien scolaire",
  "IA et automatisation",
  "Community Management",
];

const schema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  description: z.string().min(20, "La description doit contenir au moins 20 caractères"),
  category: z.string().min(1, "Sélectionnez une catégorie"),
  price: z.coerce.number().min(1000, "Le prix minimum est 1 000 FCFA"),
  deliveryDays: z.coerce.number().min(1, "Minimum 1 jour").max(90, "Maximum 90 jours"),
  imageUrl: z.string().url("URL invalide").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export default function CreateService() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createService = useCreateService();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      price: 5000,
      deliveryDays: 3,
      imageUrl: "",
    },
  });

  if (!isLoading && !isAuthenticated) return <Redirect to="/login" />;
  if (!isLoading && user?.role !== UserRole.student) return <Redirect to="/dashboard" />;

  const onSubmit = (data: FormValues) => {
    createService.mutate(
      {
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          price: data.price,
          deliveryDays: data.deliveryDays,
          imageUrl: data.imageUrl || undefined,
        },
      },
      {
        onSuccess: (service) => {
          toast({ title: "Service publié !", description: "Votre service est maintenant visible sur la marketplace." });
          queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() });
          setLocation(`/services/${service.id}`);
        },
        onError: () => {
          toast({ title: "Erreur", description: "Impossible de créer le service.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="container py-8 max-w-2xl">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="mb-6 -ml-2">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour au tableau de bord
        </Button>
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Publier un service</h1>
        <p className="text-muted-foreground mt-1">
          Proposez vos compétences et commencez à recevoir des commandes
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisissez une catégorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre du service</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Je crée votre logo professionnel en 3 jours" {...field} />
                </FormControl>
                <FormDescription>Soyez précis et accrocheur</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Décrivez ce que vous proposez, votre processus de travail, ce qui est inclus..."
                    rows={6}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix (FCFA)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1000} step={500} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deliveryDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Délai de livraison (jours)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={90} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image de couverture (URL, optionnel)</FormLabel>
                <FormControl>
                  <Input placeholder="https://exemple.com/image.jpg" {...field} />
                </FormControl>
                <FormDescription>Image représentant votre service</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={createService.isPending}>
              {createService.isPending ? "Publication..." : "Publier le service"}
            </Button>
            <Link href="/dashboard">
              <Button type="button" variant="outline">Annuler</Button>
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}

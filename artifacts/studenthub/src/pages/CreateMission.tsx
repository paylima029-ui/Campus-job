import { useState } from "react";
import { Link, useLocation, Redirect } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateMission, getListMissionsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, X, Plus } from "lucide-react";

const SUGGESTED_SKILLS = [
  "Développement Web", "Design Canva", "Création de logos", "Community Management",
  "Traduction", "Saisie de données", "Assistance informatique", "Soutien scolaire",
  "IA et automatisation", "Rédaction", "Excel", "Photoshop",
];

const schema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  description: z.string().min(30, "La description doit contenir au moins 30 caractères"),
  budget: z.coerce.number().min(1000, "Le budget minimum est 1 000 FCFA"),
  deadline: z.string().min(1, "La date limite est requise"),
});

type FormValues = z.infer<typeof schema>;

export default function CreateMission() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMission = useCreateMission();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      budget: 50000,
      deadline: "",
    },
  });

  if (!isLoading && !isAuthenticated) return <Redirect to="/login" />;

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const onSubmit = (data: FormValues) => {
    createMission.mutate(
      {
        data: {
          title: data.title,
          description: data.description,
          budget: data.budget,
          deadline: data.deadline,
          skills,
        },
      },
      {
        onSuccess: (mission) => {
          toast({ title: "Mission publiée !", description: "Les étudiants peuvent maintenant postuler." });
          queryClient.invalidateQueries({ queryKey: getListMissionsQueryKey() });
          setLocation(`/missions/${mission.id}`);
        },
        onError: () => {
          toast({ title: "Erreur", description: "Impossible de publier la mission.", variant: "destructive" });
        },
      }
    );
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="container py-8 max-w-2xl">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="mb-6 -ml-2">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour au tableau de bord
        </Button>
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Publier une mission</h1>
        <p className="text-muted-foreground mt-1">
          Décrivez votre besoin et recevez des candidatures d'étudiants qualifiés
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre de la mission</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Création d'un site web pour notre boutique" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description détaillée</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Décrivez précisément votre besoin, les livrables attendus, votre secteur d'activité..."
                    rows={7}
                    {...field}
                  />
                </FormControl>
                <FormDescription>Plus vous êtes précis, meilleures seront les candidatures</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget (FCFA)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1000} step={1000} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date limite</FormLabel>
                  <FormControl>
                    <Input type="date" min={minDate} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Skills */}
          <div className="space-y-3">
            <Label>Compétences recherchées</Label>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_SKILLS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSkill(s)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    skills.includes(s)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary/50 text-muted-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Autre compétence..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); }
                }}
              />
              <Button type="button" variant="outline" size="icon" onClick={() => addSkill(skillInput)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <Badge key={s} variant="secondary" className="gap-1">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)} className="hover:text-destructive ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={createMission.isPending}>
              {createMission.isPending ? "Publication..." : "Publier la mission"}
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

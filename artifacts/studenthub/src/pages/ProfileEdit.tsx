import { Link, useLocation, Redirect } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUpdateUser, getGetMeQueryKey, UserRole } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, X, Plus, GraduationCap, Briefcase, FileText, Globe } from "lucide-react";
import { useState } from "react";

const SKILL_SUGGESTIONS = [
  "Développement Web", "Design Canva", "Création de logos", "Community Management",
  "Traduction", "Saisie de données", "Assistance informatique", "Soutien scolaire",
  "IA et automatisation", "Rédaction", "Excel", "Photoshop", "React", "Python",
  "Marketing digital", "Comptabilité", "Droit", "Finance",
];

const schema = z.object({
  name: z.string().min(2, "Minimum 2 caractères"),
  bio: z.string().max(500, "Maximum 500 caractères").optional(),
  university: z.string().optional(),
  avatarUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  portfolioUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  cvUrl: z.string().url("URL invalide").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export default function ProfileEdit() {
  const { user, isAuthenticated, isLoading, refetchMe } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateUser = useUpdateUser();
  const [skills, setSkills] = useState<string[]>(user?.skills ?? []);
  const [skillInput, setSkillInput] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      name: user?.name ?? "",
      bio: user?.bio ?? "",
      university: user?.university ?? "",
      avatarUrl: user?.avatarUrl ?? "",
      portfolioUrl: (user as any)?.portfolioUrl ?? "",
      cvUrl: (user as any)?.cvUrl ?? "",
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

  const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

  const onSubmit = (data: FormValues) => {
    if (!user) return;
    updateUser.mutate(
      {
        id: user.id,
        data: {
          name: data.name,
          bio: data.bio || undefined,
          university: data.university || undefined,
          avatarUrl: data.avatarUrl || undefined,
          portfolioUrl: data.portfolioUrl || undefined,
          cvUrl: data.cvUrl || undefined,
          skills,
        },
      },
      {
        onSuccess: async () => {
          toast({ title: "Profil mis à jour !" });
          await refetchMe();
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          setLocation(`/profile/${user.id}`);
        },
        onError: () => {
          toast({ title: "Erreur", description: "Impossible de mettre à jour le profil.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="container py-8 max-w-2xl">
      <Link href={user ? `/profile/${user.id}` : "/dashboard"}>
        <Button variant="ghost" size="sm" className="mb-6 -ml-2">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour au profil
        </Button>
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Modifier mon profil</h1>
        <p className="text-muted-foreground mt-1">
          Un profil complet attire plus de clients et de missions
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          {/* Informations de base */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold">Informations personnelles</h2>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biographie</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Présentez-vous en quelques lignes : votre formation, vos spécialités, ce qui vous passionne..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{(field.value ?? "").length}/500 caractères</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo de profil (URL)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://exemple.com/photo.jpg" {...field} />
                  </FormControl>
                  <FormDescription>Utilisez un lien vers une image en ligne</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Formation (étudiants) */}
          {user?.role === UserRole.student && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-base font-semibold">Formation</h2>
                </div>

                <FormField
                  control={form.control}
                  name="university"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Université / École</FormLabel>
                      <FormControl>
                        <Input placeholder="Université Cheikh Anta Diop, CESAG, ESP..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Compétences */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-base font-semibold">Compétences</h2>
                </div>
                <p className="text-sm text-muted-foreground">Sélectionnez vos compétences pour apparaître dans les recherches</p>

                <div className="flex flex-wrap gap-2">
                  {SKILL_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => skills.includes(s) ? removeSkill(s) : addSkill(s)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
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
                    placeholder="Ajouter une compétence personnalisée..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); }}}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={() => addSkill(skillInput)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <Badge key={s} variant="secondary" className="gap-1 pr-1">
                        {s}
                        <button type="button" onClick={() => removeSkill(s)} className="ml-1 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Documents */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-base font-semibold">Documents</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ajoutez des liens vers vos documents hébergés (Google Drive, Dropbox, LinkedIn...)
                </p>

                <FormField
                  control={form.control}
                  name="cvUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lien vers mon CV</FormLabel>
                      <FormControl>
                        <Input placeholder="https://drive.google.com/..." {...field} />
                      </FormControl>
                      <FormDescription>Partagez votre CV via Google Drive ou LinkedIn</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="portfolioUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lien vers mon portfolio</FormLabel>
                      <FormControl>
                        <Input placeholder="https://monportfolio.com" {...field} />
                      </FormControl>
                      <FormDescription>Site web, Behance, GitHub, etc.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={updateUser.isPending}>
              {updateUser.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
            <Link href={user ? `/profile/${user.id}` : "/dashboard"}>
              <Button type="button" variant="outline">Annuler</Button>
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}

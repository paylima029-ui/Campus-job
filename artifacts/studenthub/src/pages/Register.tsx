import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegister, RegisterInputRole } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { GraduationCap, Building2, User } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  role: z.enum([RegisterInputRole.student, RegisterInputRole.company, RegisterInputRole.individual]),
  university: z.string().optional(),
  companyName: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const register = useRegister();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { refetchMe } = useAuth();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: RegisterInputRole.student,
      university: "",
      companyName: "",
    },
  });

  const watchRole = form.watch("role");

  const onSubmit = (data: RegisterFormValues) => {
    register.mutate(
      { data },
      {
        onSuccess: async () => {
          toast({ title: "Inscription réussie", description: "Bienvenue sur MY CAMPUS JOB !" });
          await refetchMe();
          setLocation("/dashboard");
        },
        onError: () => {
          toast({
            title: "Erreur d'inscription",
            description: "Cet email est peut-être déjà utilisé.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const roles = [
    { value: RegisterInputRole.student, label: "Étudiant(e)", icon: GraduationCap, desc: "Je propose mes services et cherche des missions" },
    { value: RegisterInputRole.company, label: "Entreprise", icon: Building2, desc: "Je publie des missions et recrute des talents" },
    { value: RegisterInputRole.individual, label: "Particulier", icon: User, desc: "Je commande des services ou publie des besoins" },
  ];

  return (
    <div className="container flex min-h-[calc(100dvh-4rem)] w-full flex-col items-center justify-center py-10">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[480px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Créer un compte</h1>
          <p className="text-sm text-muted-foreground">
            Rejoignez la communauté MY CAMPUS JOB
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Je suis un(e)</FormLabel>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {roles.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => field.onChange(r.value)}
                        className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all cursor-pointer ${
                          field.value === r.value
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <r.icon className={`h-5 w-5 ${field.value === r.value ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-xs font-medium ${field.value === r.value ? "text-primary" : ""}`}>{r.label}</span>
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet</FormLabel>
                  <FormControl>
                    <Input placeholder="Aminata Diallo" autoComplete="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchRole === RegisterInputRole.student && (
              <FormField
                control={form.control}
                name="university"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Université / École</FormLabel>
                    <FormControl>
                      <Input placeholder="Université Cheikh Anta Diop" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchRole === RegisterInputRole.company && (
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l'entreprise</FormLabel>
                    <FormControl>
                      <Input placeholder="SenTech Solutions" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="nom@exemple.com" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Minimum 6 caractères" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={register.isPending}>
              {register.isPending ? "Inscription en cours..." : "Créer mon compte"}
            </Button>
          </form>
        </Form>

        <p className="px-8 text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-medium underline underline-offset-4 hover:text-primary">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

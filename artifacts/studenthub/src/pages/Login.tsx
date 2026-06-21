import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin } from "@workspace/api-client-react";
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

const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const login = useLogin();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { refetchMe } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormValues) => {
    login.mutate(
      { data },
      {
        onSuccess: async () => {
          toast({ title: "Connexion réussie", description: "Bienvenue sur MY CAMPUS JOB !" });
          await refetchMe();
          setLocation("/dashboard");
        },
        onError: () => {
          toast({
            title: "Erreur de connexion",
            description: "Email ou mot de passe incorrect.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="container flex h-[calc(100dvh-4rem)] w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Bienvenue</h1>
          <p className="text-sm text-muted-foreground">
            Connectez-vous à votre compte MY CAMPUS JOB
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <Input type="password" autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </form>
        </Form>

        <div className="space-y-2 text-center text-sm text-muted-foreground">
          <p>
            Pas encore de compte ?{" "}
            <Link href="/register" className="font-medium underline underline-offset-4 hover:text-primary">
              S'inscrire gratuitement
            </Link>
          </p>
          <p className="text-xs">
            Compte test : <span className="font-mono">aminata.diallo@etud.ucad.sn</span> / <span className="font-mono">password</span>
          </p>
        </div>
      </div>
    </div>
  );
}

import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex-1 flex flex-col">
      <section className="bg-muted/30 py-20 lg:py-32 flex-1 flex items-center">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  L'excellence étudiante africaine à votre service
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  La première plateforme reliant les étudiants talentueux aux entreprises et particuliers pour des missions freelance en Afrique.
                </p>
              </div>
              <div className="flex flex-col gap-3 min-[400px]:flex-row">
                <Link href="/services">
                  <Button size="lg" className="w-full">
                    Trouver un talent
                  </Button>
                </Link>
                {!isAuthenticated && (
                  <Link href="/register">
                    <Button size="lg" variant="outline" className="w-full">
                      Proposer mes services
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <div className="mx-auto flex w-full items-center justify-center lg:max-w-none">
              <div className="relative aspect-square w-full max-w-[500px] overflow-hidden rounded-full bg-primary/10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3/4 h-3/4 bg-primary/20 rounded-full blur-3xl mix-blend-multiply"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-primary font-bold text-2xl leading-tight">
                    MY CAMPUS<br />JOB
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Comment ça marche ?</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Simple, rapide et sécurisé.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold">Inscrivez-vous</h3>
              <p className="text-muted-foreground">Créez votre profil en tant qu'étudiant, entreprise ou particulier.</p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold">Découvrez</h3>
              <p className="text-muted-foreground">Parcourez les services proposés ou publiez une mission.</p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold">Collaborez</h3>
              <p className="text-muted-foreground">Travaillez ensemble, échangez et développez vos projets.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

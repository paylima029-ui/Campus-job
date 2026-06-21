import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="bg-muted/30 py-16 md:py-24 lg:py-32 flex-1 flex items-center">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 md:grid-cols-2 md:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-6 order-2 md:order-1">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  L'excellence étudiante africaine à votre service
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  La première plateforme reliant les étudiants talentueux aux entreprises et particuliers pour des missions freelance en Afrique.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/services" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full">
                    Trouver un talent
                  </Button>
                </Link>
                {!isAuthenticated && (
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full">
                      Proposer mes services
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center justify-center order-1 md:order-2">
              <div className="relative aspect-square w-64 sm:w-80 md:w-full md:max-w-[420px] overflow-hidden rounded-full bg-primary/10">
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

      {/* Comment ça marche */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Comment ça marche ?</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
              Simple, rapide et sécurisé.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
            {[
              { step: "1", title: "Inscrivez-vous", desc: "Créez votre profil en tant qu'étudiant, entreprise ou particulier." },
              { step: "2", title: "Découvrez", desc: "Parcourez les services proposés ou publiez une mission." },
              { step: "3", title: "Collaborez", desc: "Travaillez ensemble, échangez et développez vos projets." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-2xl font-bold">{step}</span>
                </div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-primary/5 border-t">
        <div className="container px-4 md:px-6 text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
            Prêt à vous lancer ?
          </h2>
          <p className="text-muted-foreground md:text-lg max-w-xl mx-auto">
            Rejoignez des milliers d'étudiants et d'entreprises qui collaborent déjà sur MY CAMPUS JOB.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">Créer un compte</Button>
            </Link>
            <Link href="/missions">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">Voir les missions</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

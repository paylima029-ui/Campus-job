import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useLogout } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const logout = useLogout();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        toast({ title: "Déconnexion réussie" });
        window.location.href = "/";
      },
      onError: () => {
        toast({ title: "Erreur lors de la déconnexion", variant: "destructive" });
      },
    });
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            {/* Hamburger — mobile only */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden -ml-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle className="text-left text-primary font-bold">MY CAMPUS JOB</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-1">
                  <Link href="/" onClick={closeMobile}
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors">
                    Accueil
                  </Link>
                  <Link href="/services" onClick={closeMobile}
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors">
                    Services
                  </Link>
                  <Link href="/missions" onClick={closeMobile}
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors">
                    Missions
                  </Link>
                  {isAuthenticated && (
                    <>
                      <div className="my-2 border-t" />
                      <Link href="/messages" onClick={closeMobile}
                        className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors">
                        Messages
                      </Link>
                      <Link href="/dashboard" onClick={closeMobile}
                        className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors">
                        Tableau de bord
                      </Link>
                      <Link href={`/profile/${user?.id}`} onClick={closeMobile}
                        className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors">
                        Mon profil
                      </Link>
                      <Link href="/profile/edit" onClick={closeMobile}
                        className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors">
                        Paramètres
                      </Link>
                      <div className="my-2 border-t" />
                      <button
                        onClick={() => { closeMobile(); handleLogout(); }}
                        className="px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors text-left"
                      >
                        Se déconnecter
                      </button>
                    </>
                  )}
                  {!isAuthenticated && (
                    <>
                      <div className="my-2 border-t" />
                      <Link href="/login" onClick={closeMobile}
                        className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors">
                        Connexion
                      </Link>
                      <Link href="/register" onClick={closeMobile}
                        className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors">
                        S'inscrire
                      </Link>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>

            <Link href="/" className="font-bold text-xl text-primary tracking-tight">
              MY CAMPUS JOB
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-4">
              <Link href="/services" className="text-sm font-medium hover:text-primary transition-colors">
                Services
              </Link>
              <Link href="/missions" className="text-sm font-medium hover:text-primary transition-colors">
                Missions
              </Link>
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/messages" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
                  Messages
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatarUrl || ""} alt={user?.name || "Avatar"} />
                        <AvatarFallback>{user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">Tableau de bord</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${user?.id}`} className="cursor-pointer">Mon profil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/edit" className="cursor-pointer">Paramètres</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      Se déconnecter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="hidden sm:inline-flex">Connexion</Button>
                </Link>
                <Link href="/register">
                  <Button>S'inscrire</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">{children}</main>

      <footer className="border-t bg-muted/20">
        <div className="container py-8 md:py-12 px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 space-y-4">
              <h3 className="font-bold text-lg">MY CAMPUS JOB</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                La plateforme incontournable connectant les talents étudiants africains avec les entreprises et particuliers.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Découvrir</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/services" className="hover:text-foreground transition-colors">Services</Link></li>
                <li><Link href="/missions" className="hover:text-foreground transition-colors">Missions</Link></li>
                <li><Link href="/register" className="hover:text-foreground transition-colors">S'inscrire</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Légal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Conditions d'utilisation</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Confidentialité</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} MY CAMPUS JOB. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}

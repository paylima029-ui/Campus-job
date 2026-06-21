import bcrypt from "bcryptjs";
import {
  db,
  usersTable,
  servicesTable,
  missionsTable,
  applicationsTable,
  reviewsTable,
} from "@workspace/db";
import { sql } from "drizzle-orm";

const PASSWORD = "password123";

async function hash(pw: string) {
  return bcrypt.hash(pw, 10);
}

async function main() {
  console.log("🌱 Démarrage du seed…");

  // ── Truncate all tables ────────────────────────────────────────────────────
  await db.execute(sql`
    TRUNCATE TABLE reviews, applications, missions, services, sessions, users
    RESTART IDENTITY CASCADE
  `);
  console.log("  ✓ Tables vidées");

  // ── Étudiants ──────────────────────────────────────────────────────────────
  const passwordHash = await hash(PASSWORD);

  const [aminata, cheikh, fatou, ibrahima, mariama] = await db
    .insert(usersTable)
    .values([
      {
        email: "aminata.diallo@etud.ucad.sn",
        passwordHash,
        name: "Aminata Diallo",
        role: "student",
        avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Aminata&backgroundColor=b6e3f4",
        bio: "Développeuse web full-stack passionnée par les solutions numériques pour l'Afrique. Spécialisée React & Node.js, avec 2 ans d'expérience sur des projets e-commerce et fintech.",
        university: "Université Cheikh Anta Diop de Dakar (UCAD)",
        skills: ["Développement Web", "React", "Node.js", "TypeScript", "Tailwind CSS"],
        portfolioUrl: "https://aminata.dev",
        averageRating: 4.8,
        totalReviews: 12,
        completedMissions: 9,
      },
      {
        email: "cheikh.mbaye@esp.sn",
        passwordHash,
        name: "Cheikh Mbaye",
        role: "student",
        avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Cheikh&backgroundColor=c0aede",
        bio: "Designer UI/UX et graphiste freelance. Je crée des identités visuelles percutantes pour les startups africaines. Maîtrise Figma, Adobe XD, Illustrator et Photoshop.",
        university: "École Supérieure Polytechnique de Dakar (ESP)",
        skills: ["Design Graphique", "UI/UX Design", "Figma", "Adobe Suite", "Branding"],
        portfolioUrl: "https://behance.net/cheikh-mbaye",
        averageRating: 4.9,
        totalReviews: 18,
        completedMissions: 15,
      },
      {
        email: "fatou.sow@istic.sn",
        passwordHash,
        name: "Fatou Sow",
        role: "student",
        avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Fatou&backgroundColor=ffd5dc",
        bio: "Community manager et rédactrice de contenu digital. Je gère des comptes professionnels en français et en anglais, avec une expertise en marketing des réseaux sociaux pour le marché ouest-africain.",
        university: "Institut Supérieur des TIC (ISTIC)",
        skills: ["Community Management", "Rédaction", "Marketing Digital", "Instagram", "Facebook Ads"],
        averageRating: 4.6,
        totalReviews: 8,
        completedMissions: 6,
      },
      {
        email: "ibrahima.ndiaye@ucad.sn",
        passwordHash,
        name: "Ibrahima Ndiaye",
        role: "student",
        avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Ibrahima&backgroundColor=d1f4d1",
        bio: "Comptable et analyste financier en formation. J'accompagne les PME et startups dans leur gestion comptable, établissement de business plans et déclarations fiscales. Certifié OHADA.",
        university: "Université Cheikh Anta Diop de Dakar (UCAD)",
        skills: ["Comptabilité", "Finance", "Excel", "Business Plan", "OHADA"],
        averageRating: 4.7,
        totalReviews: 5,
        completedMissions: 4,
      },
      {
        email: "mariama.bah@uganc.gn",
        passwordHash,
        name: "Mariama Bah",
        role: "student",
        avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Mariama&backgroundColor=ffdbb4",
        bio: "Traductrice et interprète (français-anglais-arabe) spécialisée dans les documents juridiques et commerciaux. Disponible pour des projets de traduction urgents.",
        university: "Université Gamal Abdel Nasser de Conakry (UGANC)",
        skills: ["Traduction", "Rédaction", "Anglais", "Arabe", "Droit"],
        averageRating: 4.5,
        totalReviews: 7,
        completedMissions: 5,
      },
    ])
    .returning();

  // ── Clients (entreprises / particuliers) ───────────────────────────────────
  const [orange, wave, kkiapay, sara] = await db
    .insert(usersTable)
    .values([
      {
        email: "recrutement@orange-digital.sn",
        passwordHash,
        name: "Orange Digital Center Dakar",
        role: "company",
        avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=OD&backgroundColor=FF6600&fontColor=ffffff",
        bio: "Le hub d'innovation numérique d'Orange en Afrique. Nous accompagnons les startups et talents tech africains.",
        averageRating: 4.7,
        totalReviews: 3,
        completedMissions: 3,
      },
      {
        email: "jobs@wave.com",
        passwordHash,
        name: "Wave Mobile Money",
        role: "company",
        avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=WM&backgroundColor=1E40AF&fontColor=ffffff",
        bio: "Wave est le leader du mobile money en Afrique de l'Ouest avec plus de 8 millions d'utilisateurs.",
        averageRating: 4.9,
        totalReviews: 2,
        completedMissions: 2,
      },
      {
        email: "dev@kkiapay.me",
        passwordHash,
        name: "KKiaPay Fintech",
        role: "company",
        avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=KK&backgroundColor=7C3AED&fontColor=ffffff",
        bio: "Solution de paiement en ligne pour l'Afrique. Nous recherchons des développeurs talentueux pour nos projets.",
        averageRating: 4.6,
        totalReviews: 4,
        completedMissions: 4,
      },
      {
        email: "sara.kouyate@startup.ci",
        passwordHash,
        name: "Sara Kouyaté",
        role: "individual",
        avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Sara&backgroundColor=f0e6ff",
        bio: "Fondatrice d'une boutique de mode africaine en ligne. Je cherche des freelances pour développer ma présence digitale.",
        averageRating: 4.3,
        totalReviews: 2,
        completedMissions: 2,
      },
    ])
    .returning();

  console.log("  ✓ Utilisateurs créés (5 étudiants, 4 clients)");

  // ── Services ───────────────────────────────────────────────────────────────
  await db.insert(servicesTable).values([
    {
      studentId: aminata.id,
      title: "Création de site web vitrine responsive (React + Tailwind)",
      description: "Je développe votre site web professionnel en React avec Tailwind CSS. Design moderne, responsive mobile, optimisé SEO, hébergement inclus pour 1 an. Livraison avec code source complet et documentation.\n\nInclus :\n• Jusqu'à 5 pages (accueil, à propos, services, contact…)\n• Formulaire de contact fonctionnel\n• Optimisation SEO de base\n• Hébergement sur Vercel ou Netlify\n• 30 jours de support après livraison",
      price: "150000",
      deliveryDays: 14,
      category: "Développement Web",
      imageUrl: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&auto=format&fit=crop",
      totalOrders: 7,
      averageRating: 4.9,
    },
    {
      studentId: aminata.id,
      title: "Intégration API et backend Express.js / Node.js",
      description: "Développement d'APIs RESTful robustes avec Node.js et Express. Idéal pour des applications mobile money, e-commerce, ou plateforme SaaS.\n\nJ'ai une expérience avec Wave API, Orange Money, et les passerelles de paiement africaines.",
      price: "85000",
      deliveryDays: 7,
      category: "Développement Web",
      imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop",
      totalOrders: 4,
      averageRating: 4.8,
    },
    {
      studentId: cheikh.id,
      title: "Logo professionnel + Charte graphique complète",
      description: "Création d'une identité visuelle complète pour votre marque ou entreprise. Livraison en tous formats (PNG, SVG, PDF vectoriel).\n\nPackage inclut :\n• 3 propositions de logo\n• Révisions illimitées\n• Charte de couleurs et typographies\n• Guide d'utilisation\n• Fichiers sources Illustrator",
      price: "75000",
      deliveryDays: 5,
      category: "Design Graphique",
      imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop",
      totalOrders: 14,
      averageRating: 5.0,
    },
    {
      studentId: cheikh.id,
      title: "Maquette UI/UX Figma pour application mobile",
      description: "Conception de maquettes haute fidélité pour votre application mobile iOS/Android. Design moderne adapté aux marchés africains, avec flows utilisateur complets et prototype interactif.\n\n• Analyse de vos besoins\n• Wireframes basse fidélité\n• Maquettes haute fidélité\n• Prototype interactif Figma\n• Handoff développeur",
      price: "120000",
      deliveryDays: 10,
      category: "Design Graphique",
      imageUrl: "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800&auto=format&fit=crop",
      totalOrders: 6,
      averageRating: 4.9,
    },
    {
      studentId: cheikh.id,
      title: "Flyers, affiches et supports print professionnels",
      description: "Création de supports marketing imprimés : flyers, affiches, roll-ups, cartes de visite. Idéal pour événements, promotions et communications d'entreprise. Fichiers prêts pour l'impression fournis.",
      price: "25000",
      deliveryDays: 3,
      category: "Design Graphique",
      imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop",
      totalOrders: 22,
      averageRating: 4.7,
    },
    {
      studentId: fatou.id,
      title: "Gestion réseaux sociaux — Pack mensuel complet",
      description: "Je gère intégralement votre présence sur Instagram, Facebook et LinkedIn pendant 1 mois.\n\nInclus :\n• 20 publications par mois (3 plateformes)\n• Stories quotidiennes\n• Réponse aux commentaires et messages\n• Rapport mensuel de performance\n• Suggestions de contenu adapté au marché africain",
      price: "80000",
      deliveryDays: 30,
      category: "Marketing Digital",
      imageUrl: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&auto=format&fit=crop",
      totalOrders: 5,
      averageRating: 4.6,
    },
    {
      studentId: fatou.id,
      title: "Rédaction d'articles de blog optimisés SEO",
      description: "Rédaction d'articles de blog professionnels en français, optimisés pour le référencement naturel. Spécialisée dans les thématiques : tech, finance, business Afrique, lifestyle et santé.",
      price: "15000",
      deliveryDays: 2,
      category: "Rédaction & Traduction",
      imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop",
      totalOrders: 19,
      averageRating: 4.5,
    },
    {
      studentId: ibrahima.id,
      title: "Comptabilité et bilan mensuel pour TPE/PME",
      description: "Tenue de comptabilité mensuelle pour petites et moyennes entreprises selon les normes OHADA. Saisie des pièces comptables, rapprochements bancaires, états financiers mensuels.\n\nPrix pour 1 mois de comptabilité (jusqu'à 200 opérations).",
      price: "50000",
      deliveryDays: 5,
      category: "Comptabilité & Finance",
      imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop",
      totalOrders: 3,
      averageRating: 4.7,
    },
    {
      studentId: ibrahima.id,
      title: "Business plan professionnel pour levée de fonds",
      description: "Rédaction d'un business plan complet et convaincant pour votre projet ou startup. Document prêt pour présentation aux investisseurs, banques ou concours de financement.\n\nInclut : étude de marché, modèle financier sur 3 ans, pitch deck.",
      price: "120000",
      deliveryDays: 10,
      category: "Conseil & Formation",
      imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop",
      totalOrders: 2,
      averageRating: 4.8,
    },
    {
      studentId: mariama.id,
      title: "Traduction professionnelle FR ↔ EN (documents juridiques)",
      description: "Traduction certifiée de documents juridiques, commerciaux et administratifs entre le français et l'anglais. Serments de traducteur disponibles. Délai express 24h possible.\n\nTarif pour documents jusqu'à 5 pages.",
      price: "30000",
      deliveryDays: 2,
      category: "Rédaction & Traduction",
      imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop",
      totalOrders: 11,
      averageRating: 4.5,
    },
    {
      studentId: mariama.id,
      title: "Sous-titrage et traduction de vidéos FR/EN",
      description: "Transcription, traduction et sous-titrage de vos vidéos YouTube, podcasts ou formations en ligne. Livraison en fichiers SRT compatibles avec toutes les plateformes.",
      price: "20000",
      deliveryDays: 3,
      category: "Rédaction & Traduction",
      imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop",
      totalOrders: 8,
      averageRating: 4.4,
    },
    {
      studentId: aminata.id,
      title: "Audit et optimisation de site web existant",
      description: "Analyse complète de votre site web : performances, SEO, accessibilité, sécurité et expérience utilisateur. Rapport détaillé avec recommandations priorisées et corrections des bugs identifiés.",
      price: "45000",
      deliveryDays: 4,
      category: "Développement Web",
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop",
      totalOrders: 3,
      averageRating: 4.9,
    },
  ]);

  console.log("  ✓ Services créés (12)");

  // ── Missions ───────────────────────────────────────────────────────────────
  const today = new Date();
  const deadline = (daysFromNow: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().split("T")[0];
  };

  const [m1, m2, m3, m4, m5, m6, m7, m8, m9, m10] = await db
    .insert(missionsTable)
    .values([
      {
        clientId: orange.id,
        title: "Développement d'une application web de suivi de projets startups",
        description:
          "Orange Digital Center Dakar recherche un développeur full-stack pour créer une plateforme web de suivi des startups accompagnées.\n\nFonctionnalités attendues :\n• Tableau de bord administrateur\n• Fiches de suivi par startup (KPIs, étapes, notes)\n• Système de notifications email\n• Export PDF des rapports\n• Authentification sécurisée\n\nStack souhaitée : React, Node.js/Express, PostgreSQL. La livraison doit inclure le code source complet, tests unitaires et documentation technique.",
        budget: "350000",
        deadline: deadline(30),
        status: "open",
        skills: ["Développement Web", "React", "Node.js", "PostgreSQL"],
        applicationCount: 2,
      },
      {
        clientId: wave.id,
        title: "Conception UI/UX pour refonte de l'app Wave (version Sénégal)",
        description:
          "Wave Mobile Money cherche un designer UI/UX pour proposer une refonte partielle de l'interface de son application mobile.\n\nPérimètre :\n• Écrans d'onboarding (3 écrans)\n• Tableau de bord principal\n• Flow de transfert d'argent\n• Historique des transactions\n\nNous attendons des maquettes haute fidélité sur Figma avec prototype interactif. Le design doit être adapté aux utilisateurs peu technophiles d'Afrique de l'Ouest.",
        budget: "280000",
        deadline: deadline(21),
        status: "open",
        skills: ["UI/UX Design", "Figma", "Design Graphique", "Mobile"],
        applicationCount: 3,
      },
      {
        clientId: kkiapay.id,
        title: "Intégration API KKiaPay sur site e-commerce WooCommerce",
        description:
          "Nous cherchons un développeur web pour intégrer notre solution de paiement KKiaPay sur un site WooCommerce existant.\n\nLivrable attendu :\n• Plugin WooCommerce fonctionnel\n• Prise en charge Mobile Money (MTN, Moov) et cartes bancaires\n• Tests complets en environnement sandbox puis production\n• Documentation d'installation\n\nExpérience avec WooCommerce et PHP requise.",
        budget: "120000",
        deadline: deadline(14),
        status: "in_progress",
        skills: ["Développement Web", "PHP", "WooCommerce", "API"],
        applicationCount: 4,
      },
      {
        clientId: sara.id,
        title: "Création d'un logo et identité visuelle pour boutique mode africaine",
        description:
          "Je lance ma boutique en ligne de mode africaine contemporaine et j'ai besoin d'une identité visuelle professionnelle qui reflète l'élégance africaine moderne.\n\nJ'attends :\n• Un logo principal et ses déclinaisons\n• Une palette de couleurs cohérente\n• Les typographies choisies\n• Mockups sur sacs, étiquettes et réseaux sociaux\n\nStyle souhaité : moderne, féminin, afro-contemporain. Références : Tongoro Studio, Maki Oh.",
        budget: "80000",
        deadline: deadline(10),
        status: "open",
        skills: ["Design Graphique", "Branding", "Adobe Suite"],
        applicationCount: 1,
      },
      {
        clientId: orange.id,
        title: "Community management — 3 mois pour Orange Digital Center",
        description:
          "Gestion des réseaux sociaux d'Orange Digital Center Dakar (LinkedIn, Twitter/X, Instagram) pendant 3 mois.\n\nMissions :\n• Création et publication de contenu (actualités tech, success stories startups)\n• Animation de la communauté\n• Couverture des événements (bootcamps, pitch nights)\n• Reporting mensuel\n\nConnaissance de l'écosystème startup africain souhaitée.",
        budget: "200000",
        deadline: deadline(90),
        status: "open",
        skills: ["Community Management", "Marketing Digital", "Rédaction"],
        applicationCount: 0,
      },
      {
        clientId: kkiapay.id,
        title: "Traduction EN → FR de la documentation technique KKiaPay",
        description:
          "KKiaPay cherche un traducteur technique pour traduire l'intégralité de sa documentation API de l'anglais vers le français.\n\nVolume : environ 80 pages de documentation technique (endpoints, exemples de code, guides d'intégration).\n\nConnaissance des termes techniques IT obligatoire. Délai souhaité : 2 semaines.",
        budget: "90000",
        deadline: deadline(14),
        status: "open",
        skills: ["Traduction", "Anglais", "Rédaction technique"],
        applicationCount: 0,
      },
      {
        clientId: sara.id,
        title: "Mise en place comptabilité et suivi financier boutique en ligne",
        description:
          "J'ai lancé ma boutique de mode en ligne il y a 6 mois et j'ai besoin d'une remise à plat de ma comptabilité.\n\nBesoin :\n• Rattrapage comptable sur 6 mois\n• Mise en place d'un tableau de bord financier (Google Sheets ou Excel)\n• Formation de 2h pour mon auto-gestion\n• Conseil sur la déclaration fiscale auto-entrepreneur\n\nBudget : 60 000 FCFA.",
        budget: "60000",
        deadline: deadline(20),
        status: "completed",
        skills: ["Comptabilité", "Finance", "Excel", "OHADA"],
        applicationCount: 2,
      },
      {
        clientId: wave.id,
        title: "Rédaction de 10 articles blog sur l'inclusion financière en Afrique",
        description:
          "Wave recherche un(e) rédacteur(rice) pour produire 10 articles de blog sur la thématique de l'inclusion financière et du mobile money en Afrique de l'Ouest.\n\nCahier des charges :\n• 800 à 1200 mots par article\n• Ton accessible au grand public\n• Optimisation SEO basique\n• 2 articles en anglais, 8 en français\n• Livraison en 3 semaines",
        budget: "150000",
        deadline: deadline(21),
        status: "open",
        skills: ["Rédaction", "SEO", "Anglais", "Finance"],
        applicationCount: 1,
      },
      {
        clientId: orange.id,
        title: "Formation React.js — 20h pour équipe de 5 développeurs juniors",
        description:
          "Orange Digital Center organise une formation React.js pour 5 développeurs juniors de son programme d'accompagnement.\n\nContenu souhaité :\n• Fondamentaux React (composants, state, props)\n• Hooks React (useState, useEffect, useContext…)\n• React Router\n• Appels API et gestion de données\n• Projet pratique final\n\n20 heures de formation sur 2 semaines, en présentiel à Dakar.",
        budget: "250000",
        deadline: deadline(45),
        status: "open",
        skills: ["Développement Web", "React", "Formation", "JavaScript"],
        applicationCount: 0,
      },
      {
        clientId: kkiapay.id,
        title: "Audit et rapport de sécurité — API de paiement",
        description:
          "Nous recherchons un expert en développement web pour auditer la sécurité de notre API de paiement et identifier les vulnérabilités potentielles.\n\nLivrable :\n• Rapport détaillé des vulnérabilités trouvées\n• Score OWASP Top 10\n• Recommandations priorisées\n• Rapport exécutif en français\n\nNDA à signer avant démarrage. Expérience en sécurité applicative requise.",
        budget: "300000",
        deadline: deadline(30),
        status: "cancelled",
        skills: ["Développement Web", "Sécurité", "API", "Node.js"],
        applicationCount: 1,
      },
    ])
    .returning();

  console.log("  ✓ Missions créées (10)");

  // ── Candidatures ───────────────────────────────────────────────────────────
  await db.insert(applicationsTable).values([
    // Mission 1 : App suivi startups → 2 candidatures
    {
      missionId: m1.id,
      studentId: aminata.id,
      coverLetter:
        "Bonjour, je suis très intéressée par ce projet. J'ai déjà développé deux plateformes de suivi similaires avec React et Node.js, dont une pour un incubateur à Dakar. Mon expérience en développement full-stack et ma connaissance de l'écosystème startup africain font de moi la candidate idéale. Je peux livrer dans les délais impartis.",
      proposedBudget: "330000",
      status: "pending",
    },
    {
      missionId: m1.id,
      studentId: cheikh.id,
      coverLetter:
        "Je suis développeur et designer et je peux m'occuper à la fois du développement et du design UI. Cela vous permettra d'économiser du temps et d'avoir une cohérence parfaite entre le frontend et le backend.",
      proposedBudget: "350000",
      status: "pending",
    },
    // Mission 2 : UI/UX Wave → 3 candidatures
    {
      missionId: m2.id,
      studentId: cheikh.id,
      coverLetter:
        "Je suis passionné par les défis de design pour les marchés africains. J'ai mené des ateliers utilisateurs avec des femmes commerçantes au marché Sandaga pour comprendre leurs besoins numériques. Je crois en un design inclusif et accessible. Voir mon portfolio sur Behance.",
      proposedBudget: "260000",
      status: "accepted",
    },
    {
      missionId: m2.id,
      studentId: aminata.id,
      coverLetter:
        "Bien que développeuse principalement, j'ai des compétences solides en UI/UX et j'utilise Figma quotidiennement. Je comprends les contraintes techniques d'implémentation, ce qui rend mes designs plus réalistes.",
      proposedBudget: "280000",
      status: "rejected",
    },
    {
      missionId: m2.id,
      studentId: fatou.id,
      coverLetter:
        "Community manager avec expérience en design pour les réseaux sociaux, je comprends ce qui engage les utilisateurs africains visuellement. Prête à apporter une perspective utilisateur forte.",
      proposedBudget: "250000",
      status: "rejected",
    },
    // Mission 3 : Intégration KKiaPay (in_progress) → 4 candidatures
    {
      missionId: m3.id,
      studentId: aminata.id,
      coverLetter:
        "J'ai déjà intégré KKiaPay et Wave API sur deux projets. Je peux livrer le plugin WooCommerce fonctionnel en 10 jours maximum avec tests complets.",
      proposedBudget: "110000",
      status: "accepted",
    },
    // Mission 4 : Logo boutique mode
    {
      missionId: m4.id,
      studentId: cheikh.id,
      coverLetter:
        "La mode africaine est un de mes domaines de prédilection en design. J'ai créé l'identité visuelle de deux marques de fashion basées à Dakar et Abidjan. Je vous propose 3 directions créatives distinctes avant de finaliser.",
      proposedBudget: "75000",
      status: "pending",
    },
    // Mission 7 : Comptabilité boutique Sara (completed)
    {
      missionId: m7.id,
      studentId: ibrahima.id,
      coverLetter:
        "Spécialisé dans l'accompagnement des entrepreneurs en ligne, j'ai déjà réalisé la remise à niveau comptable de 4 boutiques e-commerce. Je propose une solution simple et efficace avec tableau de bord Google Sheets personnalisé.",
      proposedBudget: "60000",
      status: "accepted",
    },
    // Mission 8 : Articles inclusion financière
    {
      missionId: m8.id,
      studentId: fatou.id,
      coverLetter:
        "La finance inclusive en Afrique est un sujet que je suis de près depuis 2 ans. J'ai déjà rédigé des articles pour deux blogs fintech. Je peux fournir 2 articles test gratuits pour vous convaincre de ma qualité.",
      proposedBudget: "140000",
      status: "pending",
    },
    // Mission 10 : Audit sécurité (cancelled)
    {
      missionId: m10.id,
      studentId: aminata.id,
      coverLetter:
        "Développeuse full-stack avec formation en cybersécurité, j'ai réalisé un audit OWASP sur une application bancaire dans le cadre d'un stage. Je suis disponible pour signer le NDA immédiatement.",
      proposedBudget: "290000",
      status: "pending",
    },
  ]);

  console.log("  ✓ Candidatures créées (10)");

  // ── Avis / Reviews ─────────────────────────────────────────────────────────
  await db.insert(reviewsTable).values([
    // Avis sur Aminata
    {
      reviewerId: orange.id,
      revieweeId: aminata.id,
      rating: 5,
      comment:
        "Aminata a livré un travail exceptionnel, bien au-delà de nos attentes. Code propre, documentation complète et réactivité remarquable. Nous la recommandons vivement.",
    },
    {
      reviewerId: kkiapay.id,
      revieweeId: aminata.id,
      rating: 5,
      comment:
        "Excellente développeuse, très professionnelle. Elle a su s'adapter à nos contraintes techniques et a livré le plugin en avance sur le planning.",
    },
    {
      reviewerId: sara.id,
      revieweeId: aminata.id,
      rating: 4,
      comment: "Bon travail, site livré à temps. Quelques allers-retours sur le design mais le résultat final est très satisfaisant.",
    },
    // Avis sur Cheikh
    {
      reviewerId: wave.id,
      revieweeId: cheikh.id,
      rating: 5,
      comment:
        "Cheikh est un designer d'exception. Les maquettes qu'il a livrées sont prêtes à passer en développement directement. Il comprend parfaitement les contraintes de nos marchés.",
    },
    {
      reviewerId: orange.id,
      revieweeId: cheikh.id,
      rating: 5,
      comment: "Créativité, rigueur et respect des délais. Le logo créé est déjà reconnaissable dans l'écosystème. Bravo Cheikh !",
    },
    {
      reviewerId: sara.id,
      revieweeId: cheikh.id,
      rating: 5,
      comment: "Mon identité visuelle est magnifique. Cheikh a parfaitement compris l'univers de ma marque dès le premier brief. Je recommande à 100%.",
    },
    // Avis sur Fatou
    {
      reviewerId: wave.id,
      revieweeId: fatou.id,
      rating: 5,
      comment: "Nos pages ont gagné en engagement depuis que Fatou gère nos réseaux. Elle comprend notre audience et produit du contenu de qualité.",
    },
    {
      reviewerId: orange.id,
      revieweeId: fatou.id,
      rating: 4,
      comment: "Très bonne rédactrice, articles clairs et bien structurés. Délais parfaitement respectés.",
    },
    // Avis sur Ibrahima
    {
      reviewerId: sara.id,
      revieweeId: ibrahima.id,
      rating: 5,
      comment:
        "Ibrahima a remis ma comptabilité en ordre en un temps record et avec une pédagogie exemplaire. Grâce à son tableau de bord, je comprends enfin mes finances.",
    },
    {
      reviewerId: kkiapay.id,
      revieweeId: ibrahima.id,
      rating: 4,
      comment: "Business plan très professionnel. La partie financière est particulièrement solide. Nous l'avons utilisé pour notre levée de fonds.",
    },
    // Avis sur Mariama
    {
      reviewerId: kkiapay.id,
      revieweeId: mariama.id,
      rating: 4,
      comment: "Traduction de qualité, terminologie technique correcte. Livrée en 48h comme demandé.",
    },
    {
      reviewerId: orange.id,
      revieweeId: mariama.id,
      rating: 5,
      comment: "Mariama a traduit nos supports de formation avec une excellente maîtrise du vocabulaire technique. Nous ferons de nouveau appel à elle.",
    },
  ]);

  // Mettre à jour les moyennes et compteurs
  await db.execute(sql`
    UPDATE users SET
      average_rating = (SELECT AVG(rating) FROM reviews WHERE reviewee_id = users.id),
      total_reviews = (SELECT COUNT(*) FROM reviews WHERE reviewee_id = users.id)
    WHERE id IN (
      SELECT DISTINCT reviewee_id FROM reviews
    )
  `);

  console.log("  ✓ Avis créés (12) et moyennes mises à jour");

  // Mettre à jour application_count sur les missions
  await db.execute(sql`
    UPDATE missions SET
      application_count = (SELECT COUNT(*) FROM applications WHERE mission_id = missions.id)
  `);

  console.log("  ✓ Compteurs de candidatures synchronisés");

  console.log("\n✅ Seed terminé avec succès !\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Comptes de démonstration (mot de passe : password123)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  ÉTUDIANTS :");
  console.log("  • aminata.diallo@etud.ucad.sn  (dev full-stack)");
  console.log("  • cheikh.mbaye@esp.sn          (designer UI/UX)");
  console.log("  • fatou.sow@istic.sn            (community manager)");
  console.log("  • ibrahima.ndiaye@ucad.sn       (comptable)");
  console.log("  • mariama.bah@uganc.gn          (traductrice)");
  console.log("  CLIENTS :");
  console.log("  • recrutement@orange-digital.sn (entreprise)");
  console.log("  • jobs@wave.com                 (entreprise)");
  console.log("  • dev@kkiapay.me                (entreprise)");
  console.log("  • sara.kouyate@startup.ci       (particulier)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erreur lors du seed :", err);
  process.exit(1);
});

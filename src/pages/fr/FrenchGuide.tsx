import { type JSX } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MetaTags from '@/components/MetaTags';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ROUTE_TITLES } from '@/data/routeTitles';
import NotFound from '@/pages/NotFound';

/**
 * French pages for the French keyword candidates in the keyword plan.
 *
 * Published from docs/review/french-drafts.md with the owner's go-ahead
 * ("go ahead", 2 November 2026) to publish the drafts as written. The text
 * below is those drafts. Both pages say plainly that the product itself is
 * English-first, so no French product journey is implied.
 *
 * The body is marked lang="fr-CA"; scripts/prerender.mjs sets <html lang>,
 * og:locale and WebPage inLanguage for these two routes.
 */
const linkClass = 'text-primary font-medium underline-offset-4 hover:underline';

function Financement() {
  return (
    <>
      <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">Financement pour les entreprises autochtones au Canada</h1>
      <div className="space-y-5 text-lg text-muted-foreground leading-relaxed max-w-3xl">
        <p>
          Le répertoire d&apos;Indigenous Rising AI réunit des programmes de financement destinés aux entrepreneurs
          et aux entreprises des Premières Nations, métis et inuits : subventions, contributions non remboursables,
          prêts et garanties de prêt. Pour chaque programme, nous indiquons le type de financement, qui peut
          présenter une demande, le montant publié par le bailleur de fonds et la date à laquelle nous avons consulté
          sa page officielle.
        </p>
        <p>
          Indigenous Rising AI n&apos;administre aucun de ces programmes et ne décide pas de l&apos;admissibilité.
          Confirmez toujours les conditions actuelles auprès du bailleur de fonds avant de présenter une demande.
        </p>
        <h2 className="font-display text-2xl font-bold text-foreground pt-2">Au Québec</h2>
        <p>
          La Société de crédit commercial autochtone (SOCCA) offre des prêts et du mentorat aux entrepreneurs
          autochtones du Québec. Les programmes nationaux, comme le Programme d&apos;entrepreneuriat autochtone, sont
          offerts par l&apos;intermédiaire des institutions financières autochtones.
        </p>
        <h2 className="font-display text-2xl font-bold text-foreground pt-2">À noter</h2>
        <p>
          Le répertoire et la plateforme sont actuellement offerts en anglais. Les fiches des programmes renvoient
          aux pages officielles des bailleurs de fonds, souvent disponibles en français.
        </p>
        <h2 className="font-display text-2xl font-bold text-foreground pt-2">Liens</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><Link to="/funding/quebec" className={linkClass}>Répertoire du financement au Québec</Link> <span lang="en">(en anglais)</span></li>
          <li><Link to="/indigenous-financial-institutions-directory" className={linkClass}>Institutions financières autochtones</Link> <span lang="en">(en anglais)</span></li>
          <li><Link to="/fr/plan-affaires-entreprise-autochtone" className={linkClass}>Modèle de plan d&apos;affaires pour entreprise autochtone</Link></li>
        </ul>
      </div>
    </>
  );
}

function PlanAffaires() {
  return (
    <>
      <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">Modèle de plan d&apos;affaires pour entreprise autochtone</h1>
      <div className="space-y-5 text-lg text-muted-foreground leading-relaxed max-w-3xl">
        <p>
          Un plan d&apos;affaires présenté à une institution financière autochtone couvre les mêmes éléments que tout
          autre plan, avec un ajout important : ce que l&apos;entreprise apporte à la communauté. Les six sections
          sont : vision et mission, analyse du marché, produits et services, plan des opérations, prévisions
          financières et retombées pour la communauté.
        </p>
        <p>
          Certains prêteurs autochtones publient une aide pour payer une partie du coût d&apos;un consultant qui
          rédige le plan. Les conditions varient selon l&apos;institution et il n&apos;existe pas de taux commun.
        </p>
        <h2 className="font-display text-2xl font-bold text-foreground pt-2">À noter</h2>
        <p>Le modèle téléchargeable et l&apos;outil de rédaction sont actuellement en anglais.</p>
        <h2 className="font-display text-2xl font-bold text-foreground pt-2">Liens</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><Link to="/indigenous-business-plan-template" className={linkClass}>Modèle de plan d&apos;affaires</Link> <span lang="en">(en anglais)</span></li>
          <li><Link to="/guides/business-plan-funding" className={linkClass}>Aide au financement d&apos;un plan d&apos;affaires</Link> <span lang="en">(en anglais)</span></li>
          <li><Link to="/fr/financement-entreprise-autochtone" className={linkClass}>Financement pour les entreprises autochtones</Link></li>
        </ul>
      </div>
    </>
  );
}

const PAGES: Record<string, { crumb: string; Body: () => JSX.Element }> = {
  '/fr/financement-entreprise-autochtone': { crumb: 'Financement (français)', Body: Financement },
  '/fr/plan-affaires-entreprise-autochtone': { crumb: 'Plan d’affaires (français)', Body: PlanAffaires },
};

export default function FrenchGuide() {
  const route = useLocation().pathname.replace(/\/$/, '');
  const page = PAGES[route];
  if (!page) return <NotFound />;
  const { Body } = page;
  return (
    <div className="min-h-screen bg-background">
      <MetaTags title={ROUTE_TITLES[route]} />
      <Navigation />
      <main className="pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs customItems={[{ name: 'Home', path: '/' }, { name: page.crumb, path: route }]} />
          <article lang="fr-CA" className="mt-6">
            <Body />
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}

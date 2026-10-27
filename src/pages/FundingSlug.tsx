import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import FundingProgramPage from '@/pages/FundingProgram';
import FundingRegionPage from '@/pages/FundingRegion';
import { fetchSlugById, provinceBySlug, typePageBySlug } from '@/lib/funding-catalog';

/**
 * /funding/:slug resolves to one of three things:
 *   a province/type landing page, a programme page, or (for the old
 *   /funding/<uuid> links that used to render mock data) a redirect to the
 *   programme's slug. Unknown ids fall through to the programme page's
 *   not-found state.
 */
export default function FundingSlug() {
  const { slug = '' } = useParams();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  const [redirect, setRedirect] = useState<string | null | undefined>(isUuid ? undefined : null);

  useEffect(() => {
    if (!isUuid) return;
    let active = true;
    fetchSlugById(slug).then((s) => active && setRedirect(s)).catch(() => active && setRedirect(null));
    return () => { active = false; };
  }, [slug, isUuid]);

  if (provinceBySlug(slug) || typePageBySlug(slug)) return <FundingRegionPage slug={slug} />;
  if (isUuid) {
    if (redirect === undefined) return null;
    if (redirect) return <Navigate to={`/funding/${redirect}`} replace />;
  }
  return <FundingProgramPage slug={slug} />;
}

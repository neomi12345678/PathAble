import type { Metadata } from "next";
import { ProfessionsCatalog } from "@/components/professions/ProfessionsCatalog";
import { APP_NAME, PROFESSIONS } from "@/utils/texts";
import { getProfessions, getSavedProfessionIds } from "@/lib/data";

export const metadata: Metadata = {
  title: `${PROFESSIONS.title} | ${APP_NAME}`,
  description: "מאגר מקצועות מותאם אישית",
};

export default async function ProfessionsPage() {
  const [professions, savedIds] = await Promise.all([
    getProfessions(),
    getSavedProfessionIds(),
  ]);

  return <ProfessionsCatalog professions={professions} savedIds={savedIds} />;
}

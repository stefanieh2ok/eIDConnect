'use client';

import { AcceptNdaButton } from '@/components/access/accept-nda-button';
import { CheckboxAcceptButton } from '@/components/access/checkbox-accept-button';

type Props = {
  token: string;
  requireDocusign: boolean;
  summaryItems: string[];
  returnEmailPrimary?: string;
  returnEmailSecondary?: string;
  sentenceBelowButton?: string;
};

export function NdaGateAcceptPanel({
  token,
  requireDocusign,
  summaryItems,
  returnEmailPrimary,
  returnEmailSecondary,
  sentenceBelowButton,
}: Props) {
  return (
    <section className="card-content nda-gate-accept">
      <h2 className="t-h2">Vertraulicher Vorschauzugang</h2>
      <p className="t-body-sm mt-2 text-neutral-700">
        Kurz zusammengefasst — Details und PDF weiter unten.
      </p>
      <ul className="nda-gate-accept__summary mt-3 space-y-2">
        {summaryItems.slice(0, 3).map((item, i) => (
          <li key={i} className="card-compact t-body-sm">
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-4 border-t border-neutral-200 pt-4">
        {requireDocusign ? (
          <AcceptNdaButton
            token={token}
            returnEmailPrimary={returnEmailPrimary}
            returnEmailSecondary={returnEmailSecondary}
            sentenceBelowButton={sentenceBelowButton}
          />
        ) : (
          <CheckboxAcceptButton token={token} />
        )}
      </div>
    </section>
  );
}

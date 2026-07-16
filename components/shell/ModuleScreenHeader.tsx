import type { ReactNode } from 'react';
import { ModuleScreenMeta } from '@/components/shell/ModuleScreenMeta';

type ModuleScreenHeaderProps = {
  title: string;
  action?: ReactNode;
  /** Optional Kontextzeile unter H1/Aktion (keine H1). */
  metaLabel?: ReactNode;
  metaAction?: ReactNode;
  /** Unterzeile darf umbrechen (z. B. Postfach, Prämien). */
  metaLabelWrap?: boolean;
  id?: string;
};

/**
 * Kompakte Screen-H1 für alle acht App-Bereiche (390px Mobile).
 * H1 immer vollständig auf eigener Zeile; Aktion darf darunter umbrechen.
 */
export function ModuleScreenHeader({ title, action, metaLabel, metaAction, metaLabelWrap, id }: ModuleScreenHeaderProps) {
  return (
    <div className="civic-screen-header-block">
      <header className="civic-screen-header">
        <h1 id={id} className="civic-screen-h1">
          {title}
        </h1>
      </header>
      {action ? <div className="civic-screen-header__action-row">{action}</div> : null}
      {metaLabel || metaAction ? (
        <ModuleScreenMeta label={metaLabel} action={metaAction} labelWrap={metaLabelWrap} />
      ) : null}
    </div>
  );
}

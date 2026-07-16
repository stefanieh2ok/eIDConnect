import type { ReactNode } from 'react';

type ModuleScreenMetaProps = {
  label?: ReactNode;
  action?: ReactNode;
  labelWrap?: boolean;
};

/** Kompakte Meta-Zeile unter der Screen-H1 (Kontext, Filter-Hinweis). */
export function ModuleScreenMeta({ label, action, labelWrap }: ModuleScreenMetaProps) {
  if (!label && !action) return null;
  return (
    <div className="civic-screen-meta">
      {label ? (
        <span className={`civic-screen-meta__label${labelWrap ? ' civic-screen-meta__label--wrap' : ''}`}>
          {label}
        </span>
      ) : (
        <span />
      )}
      {action ? <div className="civic-screen-meta__action">{action}</div> : null}
    </div>
  );
}

'use client';

import React, { useMemo, useState } from 'react';
import { Clock, ExternalLink as ExternalLinkIcon, ChevronRight, Calendar } from 'lucide-react';
import { useExternalLink } from '@/components/ExternalLink';
import { useApp } from '@/context/AppContext';
import type { KirkelService } from '@/lib/kirkelServiceResolver';
import {
  APPOINTMENT_NO_VERIFIED_URL,
  ICS_FILENAME,
  buildPrivateCalendarReminder,
  buildReminderForAppointment,
  resolveAppointmentInfo,
} from '@/lib/fuerMichTermin';
import { appointmentDisplayStatus } from '@/lib/civicStatus';
import { InfoHint } from '@/components/ui/InfoHint';

type Props = {
  service: KirkelService;
  du: boolean;
  onBackToResults?: () => void;
  onChangeSituation?: () => void;
};

function downloadIcs(content: string, filename: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function FuerMichTerminweg({
  service,
  du,
  onBackToResults,
  onChangeSituation,
}: Props) {
  const externalLink = useExternalLink();
  const { state, dispatch } = useApp();
  const info = resolveAppointmentInfo(service);

  const alreadyVormerkt = useMemo(
    () => state.privateCalendarReminders.some((r) => r.serviceKey === service.leistung_key),
    [state.privateCalendarReminders, service.leistung_key],
  );

  const [justVormerkt, setJustVormerkt] = useState(false);
  const showVormerktState = alreadyVormerkt || justVormerkt;

  const openAppointment = () => {
    if (!info.canOpenAppointmentUrl || !info.appointmentUrl) return;
    if (externalLink) {
      externalLink.openExternal(info.appointmentUrl, `Terminweg: ${service.titel}`);
    } else if (typeof window !== 'undefined') {
      window.open(info.appointmentUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleReminder = () => {
    const reminder = buildPrivateCalendarReminder(service);
    dispatch({ type: 'ADD_PRIVATE_CALENDAR_REMINDER', payload: reminder });
    const ics = buildReminderForAppointment(info);
    downloadIcs(ics, ICS_FILENAME);
    setJustVormerkt(true);
  };

  const goToCalendar = () => {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'kalender' });
  };

  const displayStatus = appointmentDisplayStatus(info.fields, {
    vormerkt: showVormerktState,
    canOpen: info.canOpenAppointmentUrl,
  });

  const orientierungLine = du
    ? 'Wir merken dir den nächsten sinnvollen Schritt vor.'
    : 'Wir merken Ihnen den nächsten sinnvollen Schritt vor.';

  return (
    <section className="mt-4 border-t border-[#E8EEF5] pt-3" aria-label="Terminweg">
      <div className="flex items-center gap-1.5">
        <Clock size={15} className="text-[#003366]" aria-hidden />
        <h3 className="text-[14px] font-bold text-[#003366]">Terminweg</h3>
        <InfoHint label="Terminweg Hinweis">
          <p>{orientierungLine}</p>
          <p className="mt-1">{APPOINTMENT_NO_VERIFIED_URL}</p>
        </InfoHint>
      </div>

      <div className={`termin-status-strip termin-status-strip--${displayStatus.tone} mt-1.5`}>
        <span className="text-[11px] font-semibold text-[#003366]">{displayStatus.label}</span>
      </div>

      <div className="mt-2 px-0.5 py-1">
        <p className="text-[10px] font-medium text-[#6B7A99]">
          Zuständig:{' '}
          <span className="font-semibold text-[#1A2B45]">{info.zustaendigeStelle}</span>
        </p>
        {info.appointmentTypeLabel !== 'unklar' ? (
          <p className="mt-0.5 text-[10px] text-[#6B7A99]">
            Art: <span className="text-[#374151]">{info.appointmentTypeLabel}</span>
          </p>
        ) : null}
      </div>

      {info.canOpenAppointmentUrl ? (
        <button
          type="button"
          onClick={openAppointment}
          className="mt-3 inline-flex w-full min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#003366] bg-white py-2.5 text-[12px] font-semibold text-[#003366] transition-colors hover:bg-[var(--mist-blue)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003366]"
        >
          <ExternalLinkIcon size={14} aria-hidden />
          Offiziellen Terminweg öffnen
        </button>
      ) : null}

      {info.canCreatePrivateReminder ? (
        <div className="mt-2">
          {!showVormerktState ? (
            <button
              type="button"
              onClick={handleReminder}
              className="inline-flex w-full min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 py-2.5 text-[12px] font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              <ChevronRight size={14} aria-hidden />
              Termin vormerken
            </button>
          ) : (
            <div
              className="rounded-xl border border-[#a7f3d0] bg-[#ecfdf5] p-3"
              role="status"
              aria-live="polite"
            >
              <p className="text-[13px] font-bold text-[#047857]">Termin vorgemerkt</p>
              <p className="mt-1 text-[11px] text-[#1A2B45]">
                Im App-Kalender vorgemerkt · private Erinnerung, kein Behördentermin.
              </p>

              <div className="mt-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={goToCalendar}
                  className="inline-flex w-full min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#003366] bg-[#003366] py-2.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003366]"
                >
                  <Calendar size={14} aria-hidden />
                  Zum Kalender
                </button>
                {onBackToResults ? (
                  <button
                    type="button"
                    onClick={onBackToResults}
                    className="app-shell-action-pill inline-flex w-full min-h-[44px] items-center justify-center py-2.5 text-[12px] font-semibold text-[#003366]"
                  >
                    Zurück zum Behördenweg
                  </button>
                ) : null}
                {onChangeSituation ? (
                  <button
                    type="button"
                    onClick={onChangeSituation}
                    className="inline-flex w-full min-h-[40px] items-center justify-center rounded-xl border border-[#D6E0EE] bg-white py-2 text-[11px] font-semibold text-[#003366] hover:bg-[var(--mist-blue)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003366]"
                  >
                    Andere Situation wählen
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

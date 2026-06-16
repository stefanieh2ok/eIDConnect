import { renderHook, act } from '@testing-library/react';
import { useClaraCaseInput } from '@/hooks/useClaraCaseInput';
import { SOURCE_NOTICE_DEMO } from '@/lib/govdata/sourceStatus';

describe('useClaraCaseInput submit flow', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        mode: 'demo',
        status: 'demo',
        services: [],
        isDemoData: true,
        sourceNotice: SOURCE_NOTICE_DEMO,
      }),
    }) as typeof fetch;
  });

  it('keeps submit disabled when input is empty', () => {
    const { result } = renderHook(() => useClaraCaseInput({ du: true }));
    expect(result.current.canSubmit).toBe(false);
  });

  it('enables submit after typing', () => {
    const { result } = renderHook(() => useClaraCaseInput({ du: true }));
    act(() => {
      result.current.setText('Ich ziehe mit Kindern um.');
    });
    expect(result.current.canSubmit).toBe(true);
  });

  it('loads example and enables submit without auto-run', () => {
    const { result } = renderHook(() => useClaraCaseInput({ du: true }));
    act(() => {
      result.current.loadExample('move-kids', false);
    });
    expect(result.current.text.length).toBeGreaterThan(0);
    expect(result.current.canSubmit).toBe(true);
  });

  it('creates a case plan on submit', async () => {
    const { result } = renderHook(() => useClaraCaseInput({ du: true }));
    act(() => {
      result.current.setText('Ich ziehe mit Kindern um und brauche Unterstützung.');
    });
    await act(async () => {
      await result.current.handleAnalyze();
    });
    expect(result.current.plan).not.toBeNull();
    expect(result.current.plan?.situationSummary).toMatch(/Situation erfasst/i);
    expect(result.current.plan?.sourceNotice).toBe(SOURCE_NOTICE_DEMO);
  });

  it('demo plan has one source notice and no verified official link labels in services', async () => {
    const { result } = renderHook(() => useClaraCaseInput({ du: true }));
    act(() => {
      result.current.setText('Ich bekomme ein Kind und brauche Elterngeld und Kindergeld.');
    });
    await act(async () => {
      await result.current.handleAnalyze();
    });
    const plan = result.current.plan;
    expect(plan?.sourceNotice).toMatch(/Offizielle Datenquelle/);
    const serviceText = JSON.stringify(plan?.services ?? []);
    expect(serviceText).not.toMatch(/Demo-Link/i);
    expect(serviceText).not.toMatch(/Offizielle Informationen öffnen/);
  });

  it('does not create a plan for empty input', async () => {
    const { result } = renderHook(() => useClaraCaseInput({ du: true }));
    await act(async () => {
      await result.current.handleAnalyze();
    });
    expect(result.current.plan).toBeNull();
  });
});

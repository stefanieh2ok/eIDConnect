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
    expect(result.current.mode).toBe('unsure');
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

  it('opens guided intake on first submit', async () => {
    const { result } = renderHook(() => useClaraCaseInput({ du: true }));
    act(() => {
      result.current.setText('Ich wurde gekündigt, was nun?');
    });
    act(() => {
      result.current.handleAnalyze();
    });
    expect(result.current.guidedIntake).not.toBeNull();
    expect(result.current.guidedIntake?.journeyId).toBe('job_loss_unemployment');
    expect(result.current.plan).toBeNull();
  });

  it('creates a case plan after skip intake', async () => {
    const { result } = renderHook(() => useClaraCaseInput({ du: true }));
    act(() => {
      result.current.setText('Ich ziehe mit Kindern um und brauche Unterstützung.');
    });
    act(() => {
      result.current.handleAnalyze();
    });
    await act(async () => {
      await result.current.submitPlanSkip();
    });
    expect(result.current.plan).not.toBeNull();
    expect(result.current.plan?.situationSummary).toMatch(/Umzug|Kind/i);
  });

  it('demo plan has source notice and no Demo-Link in services', async () => {
    const { result } = renderHook(() => useClaraCaseInput({ du: true }));
    act(() => {
      result.current.setText('Ich bekomme ein Kind und brauche Elterngeld und Kindergeld.');
    });
    act(() => {
      result.current.handleAnalyze();
    });
    await act(async () => {
      await result.current.submitPlanSkip();
    });
    const plan = result.current.plan;
    expect(plan?.sourceNotice).toMatch(/kuratiert|Wegweiser-Template|Offizielle/i);
    const serviceText = JSON.stringify(plan?.services ?? []);
    expect(serviceText).not.toMatch(/Demo-Link/i);
    expect(serviceText).not.toMatch(/Offizielle Informationen öffnen/);
  });

  it('does not create a plan for empty input', async () => {
    const { result } = renderHook(() => useClaraCaseInput({ du: true }));
    act(() => {
      result.current.handleAnalyze();
    });
    expect(result.current.plan).toBeNull();
    expect(result.current.guidedIntake).toBeNull();
  });
});

# User Preferences Store Architecture — Lumen

> **Source of Truth**: This document details the design, state schema, and integration guidelines for the Global User Preferences Store (`usePreferencesStore`) in the Lumen frontend application.

---

## 1. Overview & Objectives

In modern web applications, user-driven configuration (such as sound effects, audio volume, pronunciation accents, session quotas, and UI helper toggles) must:
1. **Act as a Single Source of Truth**: Changes in any dialog or component must propagate instantly across all active views (0ms latency, zero stale closures).
2. **Decouple Infrastructure from Domain Logic**: Utilities (like `soundHelper`) must remain abstract and simply inspect the global preference gate rather than hardcoding feature-specific keys.
3. **Persist Across Sessions**: Automatically sync state with `localStorage` via Zustand middleware.

---

## 2. Store Structure & Location

- **File Location**: [`apps/web/src/store/preferences.store.ts`](file:///d:/learn/lumen/frontend/apps/web/src/store/preferences.store.ts)
- **Central Re-export**: [`apps/web/src/store/index.ts`](file:///d:/learn/lumen/frontend/apps/web/src/store/index.ts)
- **Persistence Key**: `lumen_user_preferences`

```
apps/web/src/
├── store/
│   ├── auth.store.ts          # Authentication & User Session
│   ├── ui.store.ts            # Sidebar, Command Palette layout state
│   ├── preferences.store.ts   # Global User Preferences (Sound, Audio, Quotas)
│   └── index.ts               # Re-exports
└── shared/
    └── utils/
        └── sound.helper.ts    # Reads usePreferencesStore for sound gate
```

---

## 3. State Schema & Actions

```ts
export interface PreferencesState {
  // Sound & Audio Preferences
  soundEffectsEnabled: boolean;
  soundVolume: number;
  autoPlayAudio: boolean;
  accent: PronunciationAccent;

  // Study Session Quota Preferences
  lessonQuotaPreset: LessonQuotaPreset;
  wordsPerSession: number;

  // UI & Interaction Preferences
  showShortcuts: boolean;

  // Actions
  setSoundEffectsEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  setAutoPlayAudio: (enabled: boolean) => void;
  setAccent: (accent: PronunciationAccent) => void;
  setLessonQuotaPreset: (preset: LessonQuotaPreset) => void;
  setShowShortcuts: (show: boolean) => void;
  updatePreferences: (patch: Partial<PreferencesState>) => void;
  resetPreferences: () => void;
}
```

---

## 4. Key Integrations

### 4.1. Sound Helper Integration
The shared audio engine [`soundHelper`](file:///d:/learn/lumen/frontend/apps/web/src/shared/utils/sound.helper.ts) checks the store gate on every playback request:

```ts
public isSoundEnabled(): boolean {
  if (!this.isBrowser()) return false;
  return usePreferencesStore.getState().soundEffectsEnabled;
}

public play(sound: SoundEffectEnum, options?: PlaySoundOptions): void {
  if (!this.isBrowser() || !this.isSoundEnabled()) return;
  // Compute final volume with global soundVolume multiplier
  const globalVolume = usePreferencesStore.getState().soundVolume ?? 0.8;
  const targetVolume = (options?.volume ?? config?.volume ?? 0.8) * globalVolume;
  ...
}
```

### 4.2. Feature Integration (e.g. Study Settings)
Feature hooks (such as [`useStudySettings`](file:///d:/learn/lumen/frontend/apps/web/src/features/study/hooks/use-study-settings.ts)) select reactively from `usePreferencesStore`, ensuring instantaneous synchronization when toggled inside [`StudySettingsDialog`](file:///d:/learn/lumen/frontend/apps/web/src/features/study/components/study-settings-dialog.tsx):

```ts
export function useStudySettings() {
  const soundEffectsEnabled = usePreferencesStore((s) => s.soundEffectsEnabled);
  const autoPlayAudio = usePreferencesStore((s) => s.autoPlayAudio);
  const accent = usePreferencesStore((s) => s.accent);
  const lessonQuotaPreset = usePreferencesStore((s) => s.lessonQuotaPreset);
  const wordsPerSession = usePreferencesStore((s) => s.wordsPerSession);
  const updatePreferences = usePreferencesStore((s) => s.updatePreferences);
  ...
}
```

---

## 5. Extensibility Guidelines

When adding new application-wide user preferences:
1. Add the field and default value to `PreferencesState` in `src/store/preferences.store.ts`.
2. Provide a dedicated setter or use the generic `updatePreferences({ newField: value })` action.
3. Access anywhere via `usePreferencesStore((s) => s.newField)` in React components, or `usePreferencesStore.getState().newField` in non-React utilities.

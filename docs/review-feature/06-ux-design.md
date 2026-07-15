# UX & Design Guidelines

This document details visual hierarchy, accessibility standards, optimization techniques, and gamification mechanics.

---

## 1. Visual Design Principles

*   **Clean Layouts**: Avoid clutter. Provide a high contrast distraction-free mode (hiding sidebars) for reading comprehension and listening focus.
*   **Typography**: Use Google Fonts: `Inter` for general UI text, and `Outfit` or `Plus Jakarta Sans` for headers to give a modern, premium feel.
*   **Transitions**: Enable smooth animations (e.g., slide transitions when moving between questions, fade-in for explanation overlays).

---

## 2. Accessibility Guidelines (WCAG 2.1 AA)

*   **Keyboard Navigation**:
    *   `ArrowRight` / `ArrowLeft` for question navigation.
    *   `A`, `B`, `C`, `D` keys for selecting options.
    *   `Space` to play/pause audio.
    *   `N` to open the Note sidebar.
*   **Screen Reader Support**: Use proper ARIA landmarks, `aria-live` regions for dynamic alerts, and alt descriptions on all visual media/diagrams.
*   **Contrast Standards**: Minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text against their backgrounds.

---

## 3. Performance Optimization

*   **Lazy Loading**: Question-by-question view should only load the active question, media resources, and explanation content. Explanations for upcoming/previous questions can be pre-fetched asynchronously but not rendered.
*   **Audio Streaming**: Listening audio should use chunks/streaming rather than downloading the entire file at once.
*   **Local State Sync**: Notes are kept in client-side state and saved to the backend via a debounced API request.

---

## 4. Gamification & Engagement

*   **Encouragement Nudges**: Show streaks ("3 days reviewing in a row!") and celebrate milestone reviews with small badges.
*   **Mastery Progress Bar**: Visual progress indicator showing the user moving closer to a target proficiency score.

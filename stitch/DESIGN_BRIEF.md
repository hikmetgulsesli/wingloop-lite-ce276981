# STITCH_BATCH_BRIEF

Generate exactly 2 production-quality UI screens for the Product Surface targets below.
Batch stage: all surfaces.
Generate every SCREEN_SPEC in this batch call. Do not generate screens outside this stage.
If this Stitch project already has screens from an earlier stage, preserve the same visual system, navigation pattern, density, typography, spacing, and component language.
Target device type: DESKTOP.
All visible user-facing text must be in English.

## PRODUCT_VISION_SUMMARY
- WingLoop Lite turns the user's request into a directly usable game workflow. The first experience must be the actual browser game behavior, not a marketing landing page or placeholder demo.
- - FR-001: Build a compact browser-based arcade game called WingLoop Lite. It should be a Flippy Bird style side-scroller where the player uses Space, click, or touch to flap through moving pipe gates. Include start, pause/resume, restart, game-over, current score, best score persisted locally, difficulty ramp, mobile…
- Users who need the requested game product to work immediately with clear feedback, recovery paths, and deterministic verification hooks.

## REQUIRED_SCREEN_TITLES
- Gameplay - WingLoop Lite
- Game Settings - WingLoop Lite

## SCREEN_SPECS
SCREEN_SPEC_1:
- exact_screen_title: Gameplay - WingLoop Lite
- surface_id: SURF_GAMEPLAY
- unique_canvas_caption: Gameplay: playfield, status/HUD, score/progress, active controls, pause/game-over state feedback.
- purpose: Let the player start, play, pause, resume, restart, and understand score/progress from the live game state.
- required_content: playfield, status/HUD, score/progress, active controls, pause/game-over state feedback.
- data_entities: GameSession, PlayerInput, ScoreState, Preference
- visible_actions: ACT_START_GAME as primary_button, ACT_PAUSE_GAME as keyboard_shortcut, ACT_RESTART_GAME as secondary_button
- entry_exit_rules: direct_url, SURF_GAME_SETTINGS -> Remains available without auth; disabled controls must explain inactive state.
- design_guidance: Prioritize the playfield and readable state over decorative chrome; controls must be visible on mobile and desktop.

SCREEN_SPEC_2:
- exact_screen_title: Game Settings - WingLoop Lite
- surface_id: SURF_GAME_SETTINGS
- unique_canvas_caption: Game Settings: difficulty/speed when relevant, input help, reset preferences, close/back behavior.
- purpose: Let the player adjust task-relevant options and review concise controls/help without leaving the game context.
- required_content: difficulty/speed when relevant, input help, reset preferences, close/back behavior.
- data_entities: Preference, GameSession
- visible_actions: ACT_SAVE_PREFERENCES as form_submit, ACT_RETURN_TO_GAMEPLAY as secondary_button
- entry_exit_rules: SURF_GAMEPLAY -> Returns to SURF_GAMEPLAY and preserves active game state unless restart is chosen.
- design_guidance: Compact settings; no unrelated admin areas or identity-management modules unless explicitly requested.

## OUTPUT_RULES
- Create one distinct canvas/frame per SCREEN_SPEC.
- Do not create a design-system/style-guide canvas as an output screen. Apply the design system inside the product screens only.
- Do not output palette, typography, component inventory, or moodboard screens.
- Use exact_screen_title as the screen title/name. Do not rename screens to generic labels.
- Use unique_canvas_caption for that screen only. Do not reuse one global caption across screens.
- Do not place the whole chunk summary, PRD summary, Key Deliverables text, or any follow-up question as visible screen captions.
- Do not write 'How would you like to proceed?', 'We could refine...', or similar assistant chat text in the design output.
- Each screen must visibly emphasize its own required_content and visible_actions. Do not let all screens share the same layout content.

## STRICT_UI_SCOPE_CONTRACT
- Every generated screen must map to one or more SCREEN_SPECS above.
- Do not invent modules, dashboards, marketing pages, admin areas, ecommerce flows, docs, account, or profile areas outside the Product Surfaces.
- Every permitted action from the matching Product Surface should have a plausible visible control or platform-appropriate interaction.
- Empty, loading, validation, and error states may be included only inside the declared Product Surfaces.

## PRODUCT_SURFACES
1. SURF_GAMEPLAY - Gameplay
   Purpose: Let the player start, play, pause, resume, restart, and understand score/progress from the live game state.
   Data: GameSession, PlayerInput, ScoreState, Preference
   Core content: playfield, status/HUD, score/progress, active controls, pause/game-over state feedback.
   Actions: ACT_START_GAME (primary_button), ACT_PAUSE_GAME (keyboard_shortcut), ACT_RESTART_GAME (secondary_button)
   Entry/exit: direct_url, SURF_GAME_SETTINGS -> Remains available without auth; disabled controls must explain inactive state.
   Guidance: Prioritize the playfield and readable state over decorative chrome; controls must be visible on mobile and desktop.

2. SURF_GAME_SETTINGS - Game Settings
   Purpose: Let the player adjust task-relevant options and review concise controls/help without leaving the game context.
   Data: Preference, GameSession
   Core content: difficulty/speed when relevant, input help, reset preferences, close/back behavior.
   Actions: ACT_SAVE_PREFERENCES (form_submit), ACT_RETURN_TO_GAMEPLAY (secondary_button)
   Entry/exit: SURF_GAMEPLAY -> Returns to SURF_GAMEPLAY and preserves active game state unless restart is chosen.
   Guidance: Compact settings; no unrelated admin areas or identity-management modules unless explicitly requested.

## UI_SAFE_PRD_CONTEXT
Use this only to understand product behavior and missing UI states. Do not render this text directly. SCREEN_SPECS remain the active screen source.
## 1. Context And Goals - Overview: WingLoop Lite turns the user's request into a directly usable game workflow. The first experience must be the actual browser game behavior, not a marketing landing page or placeholder demo. - Target Audience: Users who need the requested game product to work immediately with clear feedback, recovery paths, and deterministic verification hooks. - UI Language: English. Pipeline metadata, action IDs, surface IDs, story titles, technical reports, and file identifiers remain English. - Core Objectives: - FR-001: Build a compact browser-based arcade game called WingLoop Lite. It should be a Flippy Bird style side-scroller where the player uses Space, click, or touch to flap through moving pipe gates. Include start, pause/resume, restart, game-over, current score, best score persisted locally, difficulty ramp, mobile touch controls, and smoke-visible runtime state via window.app. Use a Vite React web app with a canvas-based 2D game loop. - Business Goals: reduce ambiguity for downstream agents, preserve the requested domain, and keep unrelated modules out of scope. - User Goals: inspect current state, take primary actions, understand validation/recovery feedback, and return to a stable state after failures. - Primary Workflows: load product state, perform the main action, recover from validation/system errors, and verify final state through the platform-appropriate test surface. - Non-Functional: first usable state under 2s for local/frontend apps, WCAG 2.1 AA for UI platforms, deterministic test handles, and responsive behavior for UI platforms. - External Dependencies: none unless explicitly listed in the task or System Contracts. ## 3. Behavioral And Action Contract ## 5. Validation And Error Strategy - Validation Rules: required text fields cannot be empty; status/enum values must be known; dates/timestamps must be parseable; destructive actions require explicit user intent. - Business Logic Errors: show contextual messages near the action and keep the previous valid state. - System/Network Errors: show a retryable banner or inline state with lastError details suitable for QA, not a silent reset. - Error Display Policy: forms use inline errors; global load/persist failures use compact banners or state panels; no blocking alert dialogs unless the platform requires them. ## 9. Out Of Scope - No physical screen table, screen-count field, or agent-invented screen list in PLAN. - DESIGN receives only scoped UI-facing context derived from Product Surfaces, display fields, permitted actions, validation behavior, and UI anti-goals. - No modules outside Product Surfaces, Action Contracts, or explicit task requirements. - No local fallback design; DESIGN must use Stitch when DESIGN_REQUIRED=true and must block on Stitch failure.
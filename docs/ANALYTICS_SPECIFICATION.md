# Karachi Runner Analytics Specification

**Status:** Proposed contract; Firebase Analytics is not configured or enabled.  
**Applies to:** Web browsers and the Capacitor Android app (`pk.karachi.runner`).  
**Purpose:** Define one stable, privacy-conscious event model for product journeys, gameplay, progression, and runtime quality across both platforms.

This document is the source of truth for analytics event names, parameter meanings, allowed values, and platform parity. It is intentionally a specification, not an implementation plan for a particular SDK package.

The supplied [telecom analytics spreadsheet](https://docs.google.com/spreadsheets/d/1EA4c3D8UYa8hDzTsgthWq8Nh6FOkKsKSkBdMT_p5PbQ/edit?gid=352311973#gid=352311973) is used as a structural reference: journey, event, trigger, properties, platform mapping, and examples. Karachi Runner uses a smaller catalog and does not collect subscriber, account, or purchase data.

## 1. Product questions this schema should answer

1. Which first-run and menu steps lead to a first run, and where do players leave?
2. How often do players start, pause, resume, restart, complete, or abandon a run?
3. How do difficulty, controls, route area, turns, and hazards affect run outcomes?
4. Which progression and reward systems are used or ignored?
5. Where do performance, rendering, startup, or recoverable errors differ between Web and Android?

Analytics must not be used to collect gameplay input streams, identify people, or replace the local Master/Developer QA telemetry.

## 2. Platform and collection architecture

### One contract, one active provider

The application will eventually expose a platform-neutral analytics facade. It will validate names and values against this document before sending events.

| Platform | Runtime | Firebase destination | Provider rule |
|---|---|---|---|
| Web | Supported desktop and mobile browsers | Firebase Web app / Web data stream | Use the Firebase JavaScript SDK only in browser runtime. |
| Android | Capacitor WebView in `pk.karachi.runner` | Firebase Android app / Android data stream | Use the native Firebase Analytics SDK through a Capacitor bridge. Do not also initialize the Web SDK inside the Android WebView. |

Both streams should belong to the same production Firebase/GA4 property so the stable event names and enumerations can be compared. Development and automated-test traffic must use a separate non-production Firebase project/property. Never send local test-runner, Master Board, Developer Console, or synthetic QA events to production analytics.

Only one provider may be active for an installation. The Android bridge is the provider on Android; the Web SDK is the provider in a browser. This prevents duplicate events from the Capacitor WebView.

Firebase-generated events such as `first_open`, `session_start`, and app-update events remain SDK-owned. Do not manually emit a second event with the same meaning. Logical screens should be tracked consistently across both runtimes; configure platform auto-screen reporting so each screen transition produces exactly one `screen_view`.

### Consent and release gate

Analytics collection must remain disabled until all of the following are completed:

1. A clear, accessible analytics consent choice is available before collection starts. Denial must remain a valid choice, and the user must be able to change the choice later in settings.
2. Collection is disabled by default on both platforms until consent is granted. A denied or unset choice must not initialize an event-collecting provider or send a consent-denied event.
3. The privacy policy is revised to describe Firebase/Google Analytics, the data collected, purposes, retention/deletion options, and consent controls.
4. Google Play Console Data safety and other store declarations are reviewed and updated before releasing a build that collects analytics. Web privacy disclosures must also be updated.
5. Production and non-production Firebase properties, access, retention, and deletion procedures are configured and verified.

The current [privacy policy](../public/privacy.html) says that the game has no analytics and does not transmit personal information. The current store declarations are consistent with that state. This specification does not change either declaration and does not authorize enabling collection.

## 3. Privacy and data minimization

- Do not set a Firebase User-ID. The game has no account system; do not create a fingerprint or attempt to join Web and Android identities.
- Do not send player-entered names, email addresses, age/date of birth, profile text, precise location, IP-derived location, free-form feedback, chat, URLs, stack traces, or raw exception messages.
- Do not send a player-selected display name or custom avatar name. A predefined, non-identifying `character_id` may be used only if character selection is a product question.
- Use Firebase's installation/session identity only as provided by the SDK and only under the consent and disclosure policy. A `run_id` is a random, in-memory identifier for grouping events within one run; do not persist it across runs or use it as a user identity.
- Do not emit one event per frame, animation tick, coin, particle, or repeated sensor/input sample. Aggregate high-volume measures locally and send bounded summaries.
- Use a coarse `viewport_bucket` and orientation rather than exact screen dimensions. Do not add raw device model strings as custom parameters; use SDK device reporting and coarse performance cohorts.
- Do not log test controls, Master Mode actions, debug payloads, console snapshots, or local operations-ledger records.
- Do not use analytics events as proof of a purchase. If real-money purchases are introduced, use the platform billing receipt as the source of truth and add a separately reviewed purchase specification.

### User attributes (Firebase user properties)

User properties are persistent, latest-known attributes on an analytics installation. They are not event parameters and they are not an account profile. Because Karachi Runner has no sign-in, user properties describe only a consented app installation; they must never be used to identify or link a person across Web and Android.

The initial custom user-property allowlist is deliberately small:

| Property | Type and values | Set/update rule | Purpose |
|---|---|---|---|
| `preferred_difficulty` | string: `easy`, `standard`, `hard` | Set only after the player explicitly chooses a difficulty; update when they choose another. Leave unset for an untouched default. | Compare later engagement by the player's saved preference. The actual run still carries `difficulty_id` as an event parameter. |
| `tutorial_status` | string: `completed`, `skipped` | Set when the first-run tutorial ends. Leave unset until then. | Segment later journeys by onboarding outcome. The tutorial events remain the source of truth for funnel timing. |

These properties are candidates for the first implementation, not permission to collect them before consent. If analysis can be answered from event parameters alone, prefer event parameters and do not set a user property. Keep the total custom user-property budget at five or fewer; adding another requires a documented question, privacy review, and schema update.

Do not create user properties for `platform_family`, `release_channel`, `mode_id`, `area_id`, `difficulty_id` at each run, current score, distance, coins, input events, device model, or session dates. These are runtime/event context, SDK-provided dimensions, or high-churn values. Do not create `age`, `gender`, `interest`, `user_type`, `account_name`, `login_method`, or `last_login_date`: they are inapplicable, sensitive, identity-related, or not supported by the current product. Firebase has reserved user-property names; check the current [Firebase user properties guidance](https://firebase.google.com/docs/analytics/user-properties) before implementation.

### Advertising ID, location, and SDK identifiers

| Data / identifier | Karachi Runner policy | Platform and disclosure notes |
|---|---|---|
| Google Advertising ID (GAID / `AD_ID`) | **Do not access, collect, log, or use it.** The game has no ads, ad attribution, or ad-personalization use case. | It applies to Android/Google Play, not ordinary Web analytics. Firebase Android configuration must disable Advertising ID collection and the merged release manifest must exclude `com.google.android.gms.permission.AD_ID`. Verify the final merged manifest/AAB after adding any SDK; a transitive dependency can add permissions. Keep Google Signals, Ads linking, and ads data sharing off. |
| Precise physical location (GPS) | **Do not collect.** Do not add location permissions, request location, or send latitude/longitude. | The current Android manifest declares only Internet and vibration permissions; retain that unless a separately approved feature truly needs location. A virtual route `area_id` describes in-game scenery, not the player's physical location. |
| Approximate geography | Do not add a custom location field or infer a player's physical location in game code. | Firebase/GA4 can derive coarse geographic reporting dimensions from an IP address. Google says individual IP addresses are not logged or exposed in reports, but the derived geography can include country/region/city. Disable granular location/device collection in the GA4 property where available. If the requirement is **no IP-derived geographic inference at all**, Firebase Analytics is not an appropriate provider without a verified product-level control; do not promise that it collects no location. |
| Firebase app-instance identifier | Do not read or attach it to custom events or use it as a cross-platform identity. | Firebase uses a pseudonymous app-instance identifier for Analytics. It is distinct from GAID and from a developer-defined User-ID, but it is still an identifier whose collection and purpose must be disclosed and covered by consent. Web and Android installations remain separate. |
| Device and runtime metadata | Use SDK-provided metadata only as needed; do not add raw device IDs, model strings, or user-agent strings as custom properties. | Firebase/GA4 may automatically collect app version, OS/device, browser, and related metadata. Prefer coarse custom `viewport_bucket`/performance cohorts and disable granular location/device collection where available. |

The current Play Console Advertising ID declaration is **No**. Preserve that answer only if the final Android manifest contains no `AD_ID` permission and the SDK is configured not to collect GAID. If a dependency makes either condition false, stop and resolve the conflict rather than silently changing the declaration. Reassess the Play Data safety form and privacy policy for the actual SDK data (including app-instance IDs, app interactions, diagnostics, and IP-derived approximate geography) before enabling analytics.

## 4. Naming and schema compatibility rules

1. Event names are fixed, lowercase `snake_case`, and never contain feature names, screen copy, IDs, values, version numbers, or platform suffixes.
2. Use the catalog in this document. Do not create `turn_left`, `turn_right`, `easy_run_start`, `android_run_start`, or similar one-off event names. Describe variation with bounded parameter values.
3. Event and parameter names must be no longer than 40 characters. Keep each event to at most 20 parameters, leaving room below GA4's 25-parameter collection limit. Keep string values at or below 100 characters.
4. Do not use reserved Firebase/GA4 event names, parameter names, or prefixes for custom fields. Re-check Google's current reserved-name and collection-limit documentation before implementation.
5. Parameters use stable, documented types and units. Use `_ms`, `_s`, `_m`, `_count`, or `_pct` suffixes where appropriate. Numeric quantities are numbers, not strings.
6. Enum values are stable IDs in lowercase `snake_case`, never localized UI text. Add values when a new supported option appears; do not rename or repurpose an existing value. Use `unknown` only when the value should be known but could not be determined. Omit fields that do not apply.
7. Treat this schema as additive. A new feature should first reuse the generic event families and existing properties. Add a parameter only when it represents a genuinely new, reusable concept. Never add a free-form JSON/property bag. Never change the meaning of an existing parameter or event.
8. Include `schema_version: 1` on custom events. Additive catalog additions keep version 1. A future incompatible change must define a new schema version while preserving historical meaning; do not silently redefine version 1.
9. Keep the catalog small. Firebase/GA4 has collection limits, and event names are not a substitute for dimensions.
10. Register only the low-cardinality parameters needed in GA4 Custom definitions. Use BigQuery export for event-level analysis if approved; do not register run IDs, build IDs, scores, distances, or error instance IDs as high-cardinality reporting dimensions.

## 5. Canonical event catalog

Firebase automatically records some lifecycle events. The custom events below capture the game's own logical journey. Every event fires only on a real state transition or meaningful outcome, not merely because a button was rendered.

| Event name | Trigger | Core parameters | Notes |
|---|---|---|---|
| `screen_view` | A logical, player-visible screen becomes active. | `screen_name`, `screen_class` | Use stable screen IDs, not DOM selectors or localized titles. Configure automatic reporting to prevent duplicates. |
| `tutorial_begin` | A tutorial/intro is actually started. | `tutorial_id`, `entry_point` | Do not log a tutorial merely because its modal was constructed. |
| `tutorial_step` | A defined tutorial step is shown or completed. | `tutorial_id`, `step_id`, `step_state` | `step_state`: `shown`, `completed`, `skipped`. Do not include tutorial text. |
| `tutorial_complete` | The tutorial is completed, or an explicit skip is accepted. | `tutorial_id`, `completion_type` | `completion_type`: `completed`, `skipped`. |
| `ui_action` | A deliberate, meaningful menu/settings/navigation action occurs. | `screen_name`, `action_id`, `action_type`, `input_method`, `result`, `reason_code` | Exclude incidental taps and repeated in-run movement; use `gameplay_event` or run summaries for those. |
| `run_start` | A new gameplay run begins. | `run_id`, `mode_id`, `difficulty_id`, `entry_point` | Log once per run after gameplay has actually started. |
| `run_pause` | A running game transitions into paused state. | `run_id`, `pause_source`, `distance_m` | Do not log repeated pause-button taps while already paused. |
| `run_resume` | A paused run transitions back to active gameplay. | `run_id`, `resume_source`, `pause_duration_s` | One event per actual resume. |
| `run_end` | A run reaches an explicit terminal state. | `run_id`, `outcome`, `reason_code`, `duration_s`, `distance_m`, `score`, `area_id`, `difficulty_id`, `turns_completed`, `turns_missed`, `hazard_hits`, `pause_count`, `revive_count`, `rupees_earned` | Log once. A missing event is not proof of a crash; use session/run-start cohorts to estimate abandonment. |
| `gameplay_event` | A meaningful in-run action, result, or route transition occurs. | `run_id`, `event_type`, `feature_id`, `result`, `reason_code`, `distance_m`, `area_id`, `difficulty_id`, `input_method` | Use for turn attempts/outcomes, hazard outcomes, power-up use, milestone/area transitions, and other bounded events. Do not log every coin or frame. |
| `level_start` | A defined, named level/challenge starts. | `level_name`, `level_number`, `difficulty_id` | Use the GA4 recommended event only when the game has an actual level/challenge boundary. Do not call each run a level. |
| `level_end` | A defined level/challenge ends. | `level_name`, `level_number`, `success`, `duration_s`, `score` | `success` is a boolean/0-or-1 value mapped consistently by both adapters. Use the same `level_name` as `level_start`. |
| `unlock_achievement` | A previously locked achievement is awarded. | `achievement_id`, `mode_id`, `area_id` | Use the stable achievement ID, never its display label. |
| `economy_event` | A non-real-money in-game currency balance changes. | `currency_type`, `direction`, `amount`, `source`, `item_id` | `direction`: `earn`, `spend`. Aggregate routine collection; never use this for real-money purchases. |
| `performance_summary` | A bounded app-launch or run performance summary is ready. | `summary_scope`, `duration_s`, `fps_p50`, `fps_p95`, `frame_time_p95_ms`, `fps_below_30_pct`, `context_lost_count`, `render_scale_min`, `viewport_bucket`, `orientation` | Emit once per completed run and optionally once per sufficiently long app session. Never emit raw frame samples. |
| `client_error` | A deduplicated, actionable client error is detected. | `error_code`, `subsystem`, `severity`, `screen_name`, `mode_id`, `repeat_count` | Use a finite, reviewed error-code dictionary. Never send exception text, stack traces, URLs, or user input. Sample repetitive errors. |

### Stable enum dictionaries

Values below are the initial vocabulary. Future values may be added without changing event names or existing parameter meanings.

| Parameter | Initial values |
|---|---|
| `platform_family` | `web`, `android` |
| `release_channel` | `production`, `internal_test`, `closed_test`, `development` |
| `mode_id` | `runner` |
| `difficulty_id` | `easy`, `standard`, `hard` |
| `screen_name` | `intro`, `home`, `difficulty`, `run`, `pause`, `results`, `progress`, `settings` |
| `screen_class` | `menu`, `gameplay`, `overlay`, `progression`, `settings` |
| `area_id` | `soldier_bazar_pechs`, `lyari_chakiwara`, `saddar_burns_road` |
| `input_method` | `touch`, `swipe`, `keyboard`, `mouse`, `controller`, `ui_button`, `system_back`, `unknown` |
| `action_type` | `select`, `start`, `pause`, `resume`, `restart`, `navigate`, `change_setting`, `dismiss` |
| `result` | `success`, `failed`, `blocked`, `cancelled`, `ignored` |
| `outcome` | `completed`, `failed`, `quit`, `interrupted` |
| `reason_code` | `route_complete`, `collision`, `missed_turn`, `user_exit`, `user_pause`, `app_background`, `invalid_state`, `unknown` |
| `event_type` | `lane_change`, `jump`, `slide`, `turn_attempt`, `turn_complete`, `turn_missed`, `hazard_hit`, `hazard_avoided`, `power_up_used`, `area_transition`, `milestone_reached`, `revive_used` |
| `currency_type` | `rupees` |
| `direction` | `earn`, `spend` |
| `summary_scope` | `app_launch`, `run` |
| `viewport_bucket` | `small_portrait`, `large_portrait`, `landscape_phone`, `tablet`, `desktop` |
| `orientation` | `portrait`, `landscape`, `unknown` |
| `severity` | `warning`, `error`, `fatal` |

`action_id`, `feature_id`, `entry_point`, `tutorial_id`, `step_id`, `level_name`, `achievement_id`, `item_id`, `source`, `error_code`, and `subsystem` are also stable IDs. Their dictionaries must be maintained in this document as features are added. Examples include `start_run`, `select_difficulty`, `pause_run`, `resume_run`, `return_to_menu`, `restart_run`, `turn_navigation`, `monsoon_hazards`, `tutorial_first_run`, and `settings_audio`. Do not send DOM IDs, translations, player text, or arbitrary values in these fields.

## 6. Shared parameter dictionary

| Parameter | Type | Meaning and use |
|---|---|---|
| `schema_version` | integer | Current custom-event contract version; initially `1`. |
| `platform_family` | string enum | `web` or `android`; explicit parity key, not a replacement for Firebase's automatic platform data. |
| `app_version` | string | User-facing release version. Android maps to `versionName`; Web must expose the deployed app version. |
| `release_channel` | string enum | Production, tester, or development environment. Never infer this from a user identifier. |
| `screen_name` | string enum | Stable logical screen ID. |
| `screen_class` | string enum | Broad logical screen category. |
| `run_id` | string | Random, ephemeral ID scoped to one run, for event grouping only. |
| `mode_id` | string enum | Game mode; currently `runner`. |
| `difficulty_id` | string enum | Selected difficulty; currently `easy`, `standard`, or `hard`. |
| `area_id` | string enum | Current named route area; no coordinates or free-form place name. |
| `input_method` | string enum | Coarse input modality. |
| `action_id` | string enum | Stable logical control/action ID. |
| `event_type` | string enum | Meaningful gameplay event within `gameplay_event`. |
| `result` | string enum | Outcome of an attempted action or operation. |
| `reason_code` | string enum | Standard reason for a result or terminal state. |
| `duration_s` | number | Elapsed seconds, rounded to a useful precision. |
| `distance_m` | number | Approximate in-game distance in meters. |
| `score` | integer | Run score at the relevant event. |
| `amount` | integer | Absolute in-game currency amount changed; direction is separate. |
| `*_count` | integer | Non-negative count of a bounded measure. |
| `*_pct` | number | Percentage from 0 to 100, with a consistent precision. |
| `*_ms` | number | Duration in milliseconds. |

The platform adapters must map the same logical fields and values. Firebase automatic parameters may differ by runtime; do not add platform-specific names to the product contract. When a value is not applicable, omit it rather than sending an empty string, `null`, or a misleading default.

## 7. Journey coverage and measurement rules

| Journey | Events and analysis |
|---|---|
| First launch and activation | SDK `first_open`/`session_start`, `screen_view`, `tutorial_begin`, `tutorial_step`, `tutorial_complete`, `ui_action`, then `run_start`. Compare funnel drop-off by `platform_family`, release, and entry point. |
| Menu and settings | `screen_view` plus `ui_action` for deliberate settings or navigation changes. Record the setting ID and a bounded choice only where it answers a product question; do not log unrelated menu rendering. |
| Gameplay engagement | `run_start`, `run_pause`, `run_resume`, selected `gameplay_event` outcomes, and exactly one `run_end`. Use summary counters for routine high-volume actions. |
| Turns and hazards | Use `gameplay_event` values such as `turn_attempt`, `turn_complete`, `turn_missed`, `hazard_hit`, and `hazard_avoided`; include `difficulty_id`, `area_id`, `distance_m`, and `input_method` when applicable. Derive success rates from attempts/outcomes rather than new event names per direction or hazard subtype. |
| Route progression | `level_start`/`level_end` only for actual level/challenge boundaries. Use `gameplay_event` with `event_type=area_transition` or `milestone_reached` for route changes that are not levels. |
| Rewards and unlocks | `economy_event` for in-game rupees, `unlock_achievement` for achievements. Emit aggregate awards where possible; do not count each visual coin animation as a separate event. |
| Runtime quality | `performance_summary` for coarse, bounded startup/run metrics; `client_error` for deduplicated error codes. Compare by platform, release, viewport bucket, and game state. |
| Return/retention | Use Firebase lifecycle events and consented app/session cohorts. Do not create a persistent user ID solely to join anonymous Web and Android activity. |

### Run summary definitions

- `run_start` is emitted only after the start action has committed and the run loop is active.
- `run_pause` and `run_resume` represent actual transitions, not clicks.
- `run_end` is emitted exactly once for a known terminal result: route completion, game over, or explicit user exit. `interrupted` is reserved for a known lifecycle interruption; an absent `run_end` must not be rewritten as a fabricated crash.
- `duration_s` is active gameplay duration. If wall-clock duration is also needed later, it must have a distinct documented parameter.
- `turns_completed`, `turns_missed`, `hazard_hits`, `pause_count`, `revive_count`, and `rupees_earned` are run-level totals. Their counting rules must be identical on Web and Android.

### Performance summary definitions

- Collect frame timings locally in a bounded ring buffer; do not log each frame.
- Emit `performance_summary` no more than once per completed run and once per sufficiently long app session. Do not emit a summary for a short failed startup if it would duplicate a more useful startup error.
- `fps_p50` and `fps_p95` are percentiles over active gameplay samples. `fps_below_30_pct` is the percentage of valid active samples below 30 FPS. `frame_time_p95_ms` is the 95th percentile frame duration.
- `render_scale_min` is the lowest renderer scale bucket/value used after adaptive quality adjustments. `context_lost_count` counts WebGL context-loss events in that scope.
- Use the same sampling window, percentile method, and rounding on both platforms; do not compare metrics until parity is tested.

## 8. Firebase/GA4 implementation constraints

- Stay comfortably below Google's event, parameter, name-length, and value-length limits. The catalog deliberately reuses a small number of event names.
- Keep custom dimensions limited to low-cardinality analysis fields such as `platform_family`, `mode_id`, `difficulty_id`, `area_id`, `event_type`, and `release_channel`.
- Do not register high-cardinality or numeric values as dimensions merely because they are available. Numeric run metrics should be analyzed as metrics or in approved BigQuery exports.
- Use SDK-generated timestamps and session data. Do not send client wall-clock timestamps as custom strings.
- Use Firebase DebugView and a non-production property for verification. Confirm one event per action on each platform, correct consent behavior, no duplicate screen events, and correct types/units before production activation.
- Re-check Firebase/GA4 limits and reserved names against official documentation at implementation time; platform SDK behavior and reporting limits may change.

## 9. Change control and acceptance checklist

When adding a feature, update this document before or with its instrumentation:

1. State the product question and journey boundary.
2. Prefer an existing event name and a new value for `action_id`, `event_type`, `feature_id`, or `reason_code`.
3. Add an event name only when no existing event family has the same semantic meaning. Check reserved names, naming rules, and limits.
4. Define exact trigger timing, deduplication rule, required/optional parameters, type, units, allowed values, and one example for both platforms.
5. Verify Web and Android use the same event name, field meanings, enum values, and state-transition timing.
6. Confirm the event contains no prohibited data, is consent-gated, and is not high-volume.
7. Update Firebase custom definitions only for reporting needs; do not register every parameter.
8. Review privacy policy, consent UI, Play Data safety, and Web disclosures when data collection changes.
9. Validate in development DebugView and confirm denied consent produces no analytics collection.

### Initial implementation acceptance criteria

- The event contract is represented by one shared typed catalog/validator and two platform adapters.
- No analytics event is emitted before consent; revoking consent stops subsequent collection.
- Web and Android each log one `screen_view` per logical screen transition.
- A full run produces one `run_start` and at most one `run_end`; pause/resume and terminal reasons are accurate.
- A turn attempt and its result can be measured without direction-specific event names.
- Performance data is summarized, bounded, and comparable across platforms.
- Master/Developer telemetry, local analytics-disabled operation, gameplay behavior, and existing save data remain unaffected.
- Privacy and store declarations are updated before a Firebase-enabled release.

## 10. References

- [Firebase Analytics events](https://firebase.google.com/docs/analytics/events)
- [GA4 event collection limits](https://support.google.com/analytics/answer/9267744)
- [GA4 recommended events](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [Firebase user properties](https://firebase.google.com/docs/analytics/user-properties)
- [Firebase Analytics data collection controls](https://firebase.google.com/docs/analytics/configure-data-collection)
- [Firebase Android Analytics collection and Advertising ID controls](https://firebase.google.com/docs/analytics/android/configure-data-collection)
- [Google Play Advertising ID policy and permission guidance](https://support.google.com/googleplay/android-developer/answer/6048248)
- [GA4 geographic and device data controls](https://support.google.com/analytics/answer/12017362)
- [GA4 consent settings](https://support.google.com/analytics/answer/14275483)
- [GA4 User-ID guidance](https://support.google.com/analytics/answer/9213390)
- [GA4 data retention](https://support.google.com/analytics/answer/7667196)

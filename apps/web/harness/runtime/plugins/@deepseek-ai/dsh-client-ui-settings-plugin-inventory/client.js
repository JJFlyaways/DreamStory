window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-settings-plugin-inventory",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region ../../preset/agent-preset-registry/src/display.ts
		const BUILT_IN_PRESET_KEYS = {
			standard: {
				name: "presetStandardName",
				description: "presetStandardDescription"
			},
			ptc: {
				name: "presetPtcName",
				description: "presetPtcDescription"
			},
			minimal: {
				name: "presetMinimalName",
				description: "presetMinimalDescription"
			},
			cordis: {
				name: "presetCordisName",
				description: "presetCordisDescription"
			}
		};
		/**
		* Whether a roster row is one of the shipped presets whose copy the dictionaries carry.
		* A shipped preset publishes no `name`; a declaration that names itself owns its copy.
		* @param preset - roster row.
		* @returns true for a shipped preset id without a published name.
		*/
		function isBuiltInPreset(preset) {
			return preset.name === void 0 && BUILT_IN_PRESET_KEYS[preset.id] !== void 0;
		}
		/**
		* Resolve preset display copy without making user-authored metadata translatable.
		* @param preset - roster row whose copy is being rendered.
		* @param t - active locale lookup covering {@link BuiltInPresetCopyKey}.
		* @returns localized copy for a known shipped preset, otherwise declaration metadata.
		*/
		function presetDisplayText(preset, t) {
			const keys = isBuiltInPreset(preset) ? BUILT_IN_PRESET_KEYS[preset.id] : void 0;
			if (keys !== void 0) return {
				name: t(keys.name),
				description: t(keys.description)
			};
			return {
				name: preset.name ?? preset.id,
				...preset.description === void 0 ? {} : { description: preset.description }
			};
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-settings-plugin-inventory/src/client/PluginInventorySettingsTab.module.css.mjs
		const css = ".A9zDmG_section{width:100%;max-width:760px;color:var(--dsw-alias-label-primary);flex-direction:column;gap:14px;display:flex;container:A9zDmG_plugin-inventory/inline-size}.A9zDmG_status,.A9zDmG_failure p{margin:0}.A9zDmG_status,.A9zDmG_failure{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}.A9zDmG_failure{color:var(--dsw-alias-state-error-primary);align-items:center;gap:10px;display:flex}.A9zDmG_statusWithDot{align-items:center;gap:6px;display:inline-flex}.A9zDmG_failure button{border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm);color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;background:0 0;padding:4px 10px}.A9zDmG_catalog{flex-direction:column;gap:12px;display:flex}.A9zDmG_search{width:100%;color:var(--dsw-alias-label-tertiary);align-items:center;display:flex;position:relative}.A9zDmG_search>svg{pointer-events:none;position:absolute;left:12px}.A9zDmG_search input{border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-1);width:100%;height:36px;color:var(--dsw-alias-label-primary);font:inherit;outline:none;padding:0 34px 0 36px;font-size:13px}.A9zDmG_search input::placeholder{color:var(--dsw-alias-label-tertiary)}.A9zDmG_search input:focus-visible{border-color:var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));box-shadow:0 0 0 2px color-mix(in srgb, var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary)) 18%, transparent)}.A9zDmG_cards{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:0;padding:0;list-style:none;display:grid}.A9zDmG_card{border:.5px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-xl);background:var(--dsw-alias-settings-card-fill);flex-direction:column;min-width:0;display:flex;overflow:hidden}.A9zDmG_card[data-open=true]{border-color:var(--dsw-alias-border-l3)}.A9zDmG_card:nth-child(odd)[data-open=true]+.A9zDmG_card,.A9zDmG_card:nth-child(odd):has(+.A9zDmG_card[data-open=true]){align-self:start}.A9zDmG_cardContent{box-sizing:border-box;width:100%;min-height:52px;color:inherit;font:inherit;text-align:left;cursor:pointer;background:0 0;border:0;flex-direction:column;flex:auto;align-items:stretch;gap:2px;padding:12px 14px;display:flex}.A9zDmG_card[data-open=true]>.A9zDmG_cardContent{background:var(--dsw-alias-interactive-bg-hover)}.A9zDmG_cardContent:active{background:var(--dsw-alias-interactive-bg-active)}@media (hover:hover){.A9zDmG_cardContent:hover{background:var(--dsw-alias-interactive-bg-hover)}}.A9zDmG_cardContent:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}.A9zDmG_cardMainRow{justify-content:space-between;align-items:center;gap:12px;min-width:0;display:flex}.A9zDmG_cardTitle,.A9zDmG_cardIdentity{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.A9zDmG_cardTitle{flex:1;min-width:0;font-size:14px;font-weight:500;line-height:20px}.A9zDmG_cardDescription{color:var(--dsw-alias-label-tertiary);text-wrap:pretty;-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:12px;line-height:18px;display:-webkit-box;overflow:hidden}.A9zDmG_card[data-open=true] .A9zDmG_cardDescription{display:block}.A9zDmG_cardMeta{margin-top:auto;padding-top:6px;display:flex}.A9zDmG_cardIdentity,.A9zDmG_entryValue{font-family:var(--ds-font-family-code);font-size:12px;line-height:18px}.A9zDmG_cardIdentity{box-sizing:border-box;border-radius:var(--dsw-radius-xs);background:var(--dsw-alias-bg-module-platform);max-width:100%;color:var(--dsw-alias-label-secondary);padding:1px 6px;display:block}.A9zDmG_cardTrailing{color:var(--dsw-alias-label-tertiary);flex:none;align-items:center;gap:8px;display:inline-flex}.A9zDmG_phaseDot{flex:none;display:inline-flex}.A9zDmG_group{flex-direction:column;gap:10px;display:flex}.A9zDmG_groupTitleRow{align-items:center;gap:8px;min-height:36px;display:flex}.A9zDmG_group+.A9zDmG_group{border-top:.5px solid var(--dsw-alias-border-l2);padding-top:14px}.A9zDmG_headerEnd{margin-left:auto}.A9zDmG_groupToggle{color:inherit;font:inherit;text-align:left;cursor:pointer;background:0 0;border:0;flex:none;align-items:center;gap:8px;padding:0;display:flex}.A9zDmG_groupToggle:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}.A9zDmG_groupToggle>.A9zDmG_chevron{transform:rotate(-90deg)}.A9zDmG_groupToggle[aria-expanded=true]>.A9zDmG_chevron{transform:none}.A9zDmG_groupTitle{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}.A9zDmG_groupSub{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;flex-wrap:wrap;row-gap:4px;margin:-6px 0 0 20px;font-size:12px;line-height:18px;display:flex}.A9zDmG_switcher{white-space:nowrap;border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-module-platform);height:36px;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;border:none;flex:none;align-items:center;gap:12px;padding:0 14px;font-size:14px;line-height:22px;display:inline-flex}.A9zDmG_switcher:active{background:var(--dsw-alias-interactive-bg-active)}@media (hover:hover){.A9zDmG_switcher:hover{background:var(--dsw-alias-interactive-bg-hover)}}.A9zDmG_switcher:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}.A9zDmG_switcher>.A9zDmG_chevron{flex:none}.A9zDmG_switcherLabel{text-overflow:ellipsis;max-width:240px;overflow:hidden}.A9zDmG_groupBody{flex-direction:column;gap:10px;display:flex}.A9zDmG_brokenNote{border-radius:var(--dsw-radius-lg);background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent);color:var(--dsw-alias-state-error-primary);overflow-wrap:anywhere;white-space:pre-line;margin:0;padding:8px 10px;font-size:12px;line-height:18px}.A9zDmG_hint{color:var(--dsw-alias-label-tertiary);flex-wrap:wrap;align-items:baseline;gap:4px 8px;margin:0;font-size:12px;line-height:18px;display:flex}.A9zDmG_jumpLink{color:var(--dsw-alias-state-business-primary);font:inherit;cursor:pointer;background:0 0;border:0;padding:0;font-size:12px}.A9zDmG_skeletonCard{border:.5px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-xl);background:var(--dsw-alias-settings-card-fill);flex-direction:column;gap:8px;padding:15px 14px;display:flex}.A9zDmG_skeletonBar{border-radius:var(--dsw-radius-xs);background:var(--dsw-alias-bg-skeleton);width:40%;height:14px}.A9zDmG_skeletonBar+.A9zDmG_skeletonBar{width:80%;height:12px}.A9zDmG_card[data-failed=true]{border-color:color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, transparent)}.A9zDmG_chevron{color:var(--dsw-alias-label-tertiary);flex:none}.A9zDmG_card[data-open=true] .A9zDmG_chevron{transform:rotate(180deg)}.A9zDmG_cardDetails{border-top:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-module-platform);padding:10px 14px 12px}.A9zDmG_entryValue{overflow-wrap:anywhere;color:var(--dsw-alias-label-primary);display:block}.A9zDmG_details{grid-template-columns:76px minmax(0,1fr);gap:6px 10px;margin:8px 0 0;display:grid}.A9zDmG_details div{display:contents}.A9zDmG_details dt{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:17px}.A9zDmG_details dd{overflow-wrap:anywhere;min-width:0;color:var(--dsw-alias-label-secondary);margin:0;font-size:12px;line-height:17px}.A9zDmG_visuallyHidden{clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;width:1px;height:1px;position:absolute;overflow:hidden}@media (prefers-reduced-motion:no-preference){.A9zDmG_chevron{transition:transform .14s var(--ds-ease-in-out)}.A9zDmG_skeletonBar{animation:2s cubic-bezier(.36,0,.64,1) infinite A9zDmG_plugin-inventory-skeleton}}@keyframes A9zDmG_plugin-inventory-skeleton{0%{opacity:1}40%{opacity:.6}80%,to{opacity:1}}@container A9zDmG_plugin-inventory (width<=520px){.A9zDmG_cards{grid-template-columns:minmax(0,1fr)}}@media (pointer:coarse){.A9zDmG_search input{font-size:16px}}";
		const tagId = "@deepseek-ai/dsh-client-ui-settings-plugin-inventory/PluginInventorySettingsTab.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-settings-plugin-inventory";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var PluginInventorySettingsTab_module_css_default = {
			"brokenNote": "A9zDmG_brokenNote",
			"card": "A9zDmG_card",
			"cardContent": "A9zDmG_cardContent",
			"cardDescription": "A9zDmG_cardDescription",
			"cardDetails": "A9zDmG_cardDetails",
			"cardIdentity": "A9zDmG_cardIdentity",
			"cardMainRow": "A9zDmG_cardMainRow",
			"cardMeta": "A9zDmG_cardMeta",
			"cardTitle": "A9zDmG_cardTitle",
			"cardTrailing": "A9zDmG_cardTrailing",
			"cards": "A9zDmG_cards",
			"catalog": "A9zDmG_catalog",
			"chevron": "A9zDmG_chevron",
			"details": "A9zDmG_details",
			"entryValue": "A9zDmG_entryValue",
			"failure": "A9zDmG_failure",
			"group": "A9zDmG_group",
			"groupBody": "A9zDmG_groupBody",
			"groupSub": "A9zDmG_groupSub",
			"groupTitle": "A9zDmG_groupTitle",
			"groupTitleRow": "A9zDmG_groupTitleRow",
			"groupToggle": "A9zDmG_groupToggle",
			"headerEnd": "A9zDmG_headerEnd",
			"hint": "A9zDmG_hint",
			"jumpLink": "A9zDmG_jumpLink",
			"phaseDot": "A9zDmG_phaseDot",
			"plugin-inventory": "A9zDmG_plugin-inventory",
			"plugin-inventory-skeleton": "A9zDmG_plugin-inventory-skeleton",
			"search": "A9zDmG_search",
			"section": "A9zDmG_section",
			"skeletonBar": "A9zDmG_skeletonBar",
			"skeletonCard": "A9zDmG_skeletonCard",
			"status": "A9zDmG_status",
			"statusWithDot": "A9zDmG_statusWithDot",
			"switcher": "A9zDmG_switcher",
			"switcherLabel": "A9zDmG_switcherLabel",
			"visuallyHidden": "A9zDmG_visuallyHidden"
		};
		//#endregion
		//#region lib/types/client/PluginInventorySettingsTab.js
		const PHASE_KEYS = {
			pending: "pending",
			loading: "loadingPhase",
			active: "active",
			failed: "failed",
			unloading: "unloading"
		};
		/** Placeholder cards the loading skeleton lays out in the cards grid. */
		const SKELETON_CARDS = [
			0,
			1,
			2,
			3
		];
		/** Localized accessible label for one root Fiber phase. */
		function phaseLabel(phase, t) {
			return phase === null ? t("unobserved") : t(PHASE_KEYS[phase]);
		}
		/** Compact technical names for Settings without changing their module identity. */
		function moduleShortName(moduleName) {
			return (moduleName.startsWith("@") ? moduleName.slice(moduleName.indexOf("/") + 1) : moduleName).replace(/^cordis:/, "").replace(/^cordis-plugin-/, "").replace(/^dsh-(?:host-|client-)?/, "");
		}
		/** Display an entry identity without the composition-only `include:` marker. */
		function entrySubtitle(entryId) {
			return entryId.replace(/^include:/, "");
		}
		/** Whether a card shows its entry id: the id exists and, without its `include:` marker, differs from the title. */
		function idAddsToTitle(entryId, title) {
			return entryId !== null && entrySubtitle(entryId) !== title;
		}
		/** Accessible card name: the title, the complete entry id when the card shows one, then the enablement state. */
		function cardLabel(title, entryId, state) {
			return idAddsToTitle(entryId, title) ? `${title}, ${entryId}, ${state}` : `${title}, ${state}`;
		}
		/** Preserve translated titles and shorten literal package or module name fallbacks in Settings. */
		function pluginText(row, resolveText) {
			const title = row.meta?.title;
			return {
				title: typeof title === "object" ? resolveText(title) : moduleShortName(title ?? row.moduleName),
				description: row.meta?.description === void 0 ? void 0 : resolveText(row.meta.description) || void 0
			};
		}
		/** Match translated text alongside the row's technical module and entry identities. */
		function matches(row, normalizedQuery, resolveText) {
			if (normalizedQuery.length === 0) return true;
			const { title, description } = pluginText(row, resolveText);
			return [
				row.moduleName,
				row.entryId,
				title,
				description
			].some((value) => value?.toLocaleLowerCase().includes(normalizedQuery));
		}
		/** The roster row shown when the preset switcher has no explicit choice. */
		function fallbackPreset(presets) {
			return presets.find((preset) => preset.isDefault) ?? presets[0];
		}
		/** The switcher's display label for one preset. */
		function presetLabel(preset, t, presetName) {
			const name = presetName(preset);
			if (preset.broken !== void 0) return t("presetOptionBroken", { name });
			if (preset.isDefault) return t("presetOptionDefault", { name });
			return name;
		}
		/** One expandable plugin card; the caller owns the trailing status content. */
		function PluginCard({ rowKey, moduleName, title, description, metadataError, entryId, trailing, ariaLabel, failed, expanded, onToggle, children }) {
			const open = expanded === rowKey;
			const detailId = `plugin-details-${encodeURIComponent(rowKey)}`;
			const descriptionId = (0, react.useId)();
			return (0, react_jsx_runtime.jsxs)("li", {
				className: PluginInventorySettingsTab_module_css_default.card,
				"data-plugin-entry": entryId ?? void 0,
				"data-plugin-module": moduleName,
				"data-failed": failed ? "true" : void 0,
				"data-open": open ? "true" : void 0,
				children: [
					(0, react_jsx_runtime.jsxs)("button", {
						className: PluginInventorySettingsTab_module_css_default.cardContent,
						type: "button",
						"aria-expanded": open,
						"aria-controls": detailId,
						"aria-label": ariaLabel,
						"aria-describedby": description === void 0 ? void 0 : descriptionId,
						onClick: () => {
							onToggle(rowKey);
						},
						children: [
							(0, react_jsx_runtime.jsxs)("span", {
								className: PluginInventorySettingsTab_module_css_default.cardMainRow,
								children: [(0, react_jsx_runtime.jsx)("strong", {
									className: PluginInventorySettingsTab_module_css_default.cardTitle,
									title: moduleName,
									children: title
								}), (0, react_jsx_runtime.jsxs)("span", {
									className: PluginInventorySettingsTab_module_css_default.cardTrailing,
									children: [trailing, (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
										className: PluginInventorySettingsTab_module_css_default.chevron,
										size: 12,
										"aria-hidden": "true"
									})]
								})]
							}),
							description === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
								className: PluginInventorySettingsTab_module_css_default.cardDescription,
								id: descriptionId,
								children: description
							}),
							idAddsToTitle(entryId, title) ? (0, react_jsx_runtime.jsx)("span", {
								className: PluginInventorySettingsTab_module_css_default.cardMeta,
								children: (0, react_jsx_runtime.jsx)("code", {
									className: PluginInventorySettingsTab_module_css_default.cardIdentity,
									title: entryId,
									children: entrySubtitle(entryId)
								})
							}) : null
						]
					}),
					metadataError === void 0 ? null : (0, react_jsx_runtime.jsx)("p", {
						className: PluginInventorySettingsTab_module_css_default.brokenNote,
						role: "status",
						"data-package-meta-error": true,
						children: metadataError
					}),
					open ? (0, react_jsx_runtime.jsx)("div", {
						className: PluginInventorySettingsTab_module_css_default.cardDetails,
						id: detailId,
						children
					}) : null
				]
			});
		}
		/** Detail rows shared by every card: the Loader identity, then labeled facts. */
		function CardFacts({ moduleName, moduleLabel, entryId, facts }) {
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [entryId === null ? null : (0, react_jsx_runtime.jsx)("code", {
				className: PluginInventorySettingsTab_module_css_default.entryValue,
				"data-loader-entry": true,
				children: entryId
			}), (0, react_jsx_runtime.jsxs)("dl", {
				className: PluginInventorySettingsTab_module_css_default.details,
				children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: moduleLabel }), (0, react_jsx_runtime.jsx)("dd", { children: moduleName })] }), facts.map(([label, value]) => (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: label }), (0, react_jsx_runtime.jsx)("dd", { children: value })] }, label))]
			})] });
		}
		const PHASE_DOT_STATES = {
			pending: "idle",
			loading: "ongoing",
			unloading: "ongoing"
		};
		/** Whether a live root-fiber phase carries a dot of its own. */
		function showsPhaseDot(phase) {
			return phase === "pending" || phase === "loading" || phase === "unloading";
		}
		/** Status dot naming a live root-fiber phase; rows without a dotted phase show none. */
		function PhaseDot({ phase, t }) {
			const status = phaseLabel(phase, t);
			return (0, react_jsx_runtime.jsx)("span", {
				className: PluginInventorySettingsTab_module_css_default.phaseDot,
				role: "img",
				"aria-label": status,
				title: status,
				children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: PHASE_DOT_STATES[phase] })
			});
		}
		const TAG_TONES = {
			disabled: "neutral",
			conditional: "warning",
			preset: "info",
			failed: "danger"
		};
		/** Enablement tag for the states that depart from the default; a plainly enabled row carries none. */
		function StateTag({ kind, label }) {
			return kind === "enabled" ? null : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
				tone: TAG_TONES[kind],
				children: label
			});
		}
		/** Render the read-only plugin inventory: agent presets first, then the global plane. */
		function PluginInventorySettingsTab({ list, presetName, resolveText, t, useClientSync, retryClient }) {
			const clientSync = useClientSync((snapshot) => snapshot);
			const sectionId = (0, react.useId)();
			const [request, setRequest] = (0, react.useState)(0);
			const [query, setQuery] = (0, react.useState)("");
			const [expanded, setExpanded] = (0, react.useState)(null);
			const [chosenPreset, setChosenPreset] = (0, react.useState)(null);
			const [switcherOpen, setSwitcherOpen] = (0, react.useState)(false);
			const [presetOpen, setPresetOpen] = (0, react.useState)(null);
			const [globalOpen, setGlobalOpen] = (0, react.useState)(null);
			const [state, setState] = (0, react.useState)({ status: "loading" });
			(0, react.useEffect)(() => {
				let current = true;
				Promise.resolve().then(() => list()).then((snapshot) => {
					if (current) setState({
						status: "ready",
						snapshot
					});
				}, () => {
					if (current) setState({ status: "error" });
				});
				return () => {
					current = false;
				};
			}, [list, request]);
			const normalizedQuery = query.trim().toLocaleLowerCase();
			const searching = normalizedQuery.length > 0;
			const snapshot = state.status === "ready" ? state.snapshot : void 0;
			const presets = snapshot?.agentPresets ?? [];
			const selected = presets.find((preset) => preset.id === chosenPreset) ?? fallbackPreset(presets);
			/** Presets that actually enable a module, keyed by module name. */
			const enabledIn = (0, react.useMemo)(() => {
				const found = /* @__PURE__ */ new Map();
				for (const preset of presets) for (const row of preset.rows) {
					if (row.enabled !== true) continue;
					const groups = found.get(row.moduleName);
					if (groups === void 0) found.set(row.moduleName, [preset]);
					else if (!groups.includes(preset)) groups.push(preset);
				}
				return found;
			}, [presets]);
			const entries = snapshot?.entries ?? [];
			const failedEntries = [];
			const regularEntries = [];
			for (const entry of entries) if (entry.fiberPhase === "failed") failedEntries.push(entry);
			else regularEntries.push(entry);
			const entryMatch = (entry) => matches(entry, normalizedQuery, resolveText);
			const rowMatch = (row) => matches(row, normalizedQuery, resolveText);
			const filteredFailed = failedEntries.filter(entryMatch);
			const filteredRegular = regularEntries.filter(entryMatch);
			const globalCount = filteredFailed.length + filteredRegular.length;
			const selectedRows = selected === void 0 ? [] : selected.rows.filter(rowMatch);
			const otherPresetMatches = searching ? presets.filter((preset) => preset !== selected && preset.rows.some(rowMatch)) : [];
			const otherMatchCount = otherPresetMatches.reduce((total, preset) => total + preset.rows.filter(rowMatch).length, 0);
			const presetEffectiveOpen = searching || (presetOpen ?? true);
			const globalEffectiveOpen = searching || (globalOpen ?? false);
			const nothingMatches = searching && globalCount === 0 && selectedRows.length === 0 && otherPresetMatches.length === 0;
			const retry = () => {
				setState({ status: "loading" });
				setRequest((value) => value + 1);
			};
			const toggleRow = (key) => {
				setExpanded((current) => current === key ? null : key);
			};
			/** Trailing status and detail facts for one row of the selected preset. */
			const presetRowCard = (preset, row, index) => {
				const key = `preset:${preset.id}:${String(index)}`;
				const { title, description } = pluginText(row, resolveText);
				const failed = row.fiberPhase === "failed";
				const stateText = failed ? t("failedTag") : row.enabled === true ? t("enabledTag") : row.enabled === false ? t("disabledTag") : t("conditionalTag");
				const kind = failed ? "failed" : row.enabled === true ? "enabled" : row.enabled === false ? "disabled" : "conditional";
				return (0, react_jsx_runtime.jsx)(PluginCard, {
					rowKey: key,
					moduleName: row.moduleName,
					title,
					description,
					metadataError: row.meta?.error === void 0 ? void 0 : t("metadataError", { error: row.meta.error }),
					entryId: row.entryId,
					failed,
					expanded,
					onToggle: toggleRow,
					ariaLabel: cardLabel(title, row.entryId, stateText),
					trailing: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [row.enabled === true && showsPhaseDot(row.fiberPhase) ? (0, react_jsx_runtime.jsx)(PhaseDot, {
						phase: row.fiberPhase,
						t
					}) : null, (0, react_jsx_runtime.jsx)(StateTag, {
						kind,
						label: stateText
					})] }),
					children: (0, react_jsx_runtime.jsx)(CardFacts, {
						moduleName: row.moduleName,
						moduleLabel: t("moduleLabel"),
						entryId: row.entryId,
						facts: [
							[t("fromPreset"), presetName(preset)],
							[t("configuration"), stateText],
							...row.fiberPhase === null ? [] : [[t("runtime"), phaseLabel(row.fiberPhase, t)]],
							...row.condition === void 0 ? [] : [[t("condition"), (0, react_jsx_runtime.jsx)("code", { children: row.condition }, "condition")]]
						]
					})
				}, key);
			};
			/** One global-plane row; a preset-provided row carries the presets that enable it. */
			const globalRowCard = (entry, providers) => {
				const key = `global:${entry.entryId}`;
				const { title, description } = pluginText(entry, resolveText);
				const failed = entry.fiberPhase === "failed";
				const stateText = failed ? t("failedTag") : providers !== void 0 ? t("presetEnabledTag") : t(entry.enabled ? "enabledTag" : "disabledTag");
				const kind = failed ? "failed" : providers !== void 0 ? "preset" : entry.enabled ? "enabled" : "disabled";
				return (0, react_jsx_runtime.jsx)(PluginCard, {
					rowKey: key,
					moduleName: entry.moduleName,
					title,
					description,
					metadataError: entry.meta?.error === void 0 ? void 0 : t("metadataError", { error: entry.meta.error }),
					entryId: entry.entryId,
					failed,
					expanded,
					onToggle: toggleRow,
					ariaLabel: cardLabel(title, entry.entryId, stateText),
					trailing: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [entry.enabled && showsPhaseDot(entry.fiberPhase) ? (0, react_jsx_runtime.jsx)(PhaseDot, {
						phase: entry.fiberPhase,
						t
					}) : null, (0, react_jsx_runtime.jsx)(StateTag, {
						kind,
						label: stateText
					})] }),
					children: (0, react_jsx_runtime.jsx)(CardFacts, {
						moduleName: entry.moduleName,
						moduleLabel: t("moduleLabel"),
						entryId: entry.entryId,
						facts: providers !== void 0 ? [[t("configuration"), t("presetProvidedDetail")], [t("enabledIn"), providers.map((preset) => presetName(preset)).join(" · ")]] : [[t("configuration"), t(entry.enabled ? "enabledTag" : "disabledTag")], ...entry.enabled ? [[t("runtime"), phaseLabel(entry.fiberPhase, t)]] : []]
					})
				}, key);
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: PluginInventorySettingsTab_module_css_default.section,
				"aria-busy": state.status === "loading",
				children: [
					clientSync.syncing ? (0, react_jsx_runtime.jsxs)("p", {
						className: `${PluginInventorySettingsTab_module_css_default.status} ${PluginInventorySettingsTab_module_css_default.statusWithDot}`,
						role: "status",
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "ongoing" }), t("clientSyncing")]
					}) : null,
					clientSync.failures.length === 0 ? null : (0, react_jsx_runtime.jsxs)("div", {
						className: PluginInventorySettingsTab_module_css_default.failure,
						"data-client-sync-failure": true,
						children: [
							(0, react_jsx_runtime.jsxs)("p", {
								className: PluginInventorySettingsTab_module_css_default.statusWithDot,
								role: "alert",
								children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "error" }), t("clientSyncFailed")]
							}),
							(0, react_jsx_runtime.jsx)("ul", { children: clientSync.failures.map((failure) => (0, react_jsx_runtime.jsxs)("li", { children: [
								failure.id,
								": ",
								failure.message
							] }, failure.id)) }),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: clientSync.syncing,
								onClick: retryClient,
								children: t("clientSyncRetry")
							})
						]
					}),
					state.status === "loading" ? (0, react_jsx_runtime.jsxs)("div", {
						className: PluginInventorySettingsTab_module_css_default.cards,
						role: "status",
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: PluginInventorySettingsTab_module_css_default.visuallyHidden,
							children: t("loading")
						}), SKELETON_CARDS.map((slot) => (0, react_jsx_runtime.jsxs)("div", {
							className: PluginInventorySettingsTab_module_css_default.skeletonCard,
							"aria-hidden": "true",
							children: [(0, react_jsx_runtime.jsx)("span", { className: PluginInventorySettingsTab_module_css_default.skeletonBar }), (0, react_jsx_runtime.jsx)("span", { className: PluginInventorySettingsTab_module_css_default.skeletonBar })]
						}, slot))]
					}) : null,
					state.status === "error" ? (0, react_jsx_runtime.jsxs)("div", {
						className: PluginInventorySettingsTab_module_css_default.failure,
						children: [(0, react_jsx_runtime.jsxs)("p", {
							className: PluginInventorySettingsTab_module_css_default.statusWithDot,
							role: "alert",
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "error" }), t("error")]
						}), (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: retry,
							children: t("retry")
						})]
					}) : null,
					snapshot !== void 0 ? (0, react_jsx_runtime.jsxs)("div", {
						className: PluginInventorySettingsTab_module_css_default.catalog,
						children: [
							(0, react_jsx_runtime.jsxs)("label", {
								className: PluginInventorySettingsTab_module_css_default.search,
								children: [
									(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSearchOutlineRegular, { "aria-hidden": "true" }),
									(0, react_jsx_runtime.jsx)("span", {
										className: PluginInventorySettingsTab_module_css_default.visuallyHidden,
										children: t("search")
									}),
									(0, react_jsx_runtime.jsx)("input", {
										type: "search",
										value: query,
										placeholder: t("search"),
										"aria-label": t("search"),
										onChange: (event) => {
											setQuery(event.currentTarget.value);
										}
									})
								]
							}),
							entries.length === 0 && presets.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
								className: PluginInventorySettingsTab_module_css_default.status,
								children: t("empty")
							}) : null,
							nothingMatches ? (0, react_jsx_runtime.jsx)("p", {
								className: PluginInventorySettingsTab_module_css_default.status,
								children: t("emptySearch")
							}) : null,
							selected !== void 0 ? (0, react_jsx_runtime.jsxs)("section", {
								className: PluginInventorySettingsTab_module_css_default.group,
								"data-plugin-scope": "preset",
								"data-preset-id": selected.id,
								children: [
									(0, react_jsx_runtime.jsxs)("div", {
										className: PluginInventorySettingsTab_module_css_default.groupTitleRow,
										children: [(0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											className: PluginInventorySettingsTab_module_css_default.groupToggle,
											"aria-expanded": presetEffectiveOpen,
											"aria-controls": `${sectionId}-preset`,
											onClick: () => {
												setPresetOpen(!presetEffectiveOpen);
											},
											children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
												className: PluginInventorySettingsTab_module_css_default.chevron,
												size: 12,
												"aria-hidden": "true"
											}), (0, react_jsx_runtime.jsx)("span", {
												className: PluginInventorySettingsTab_module_css_default.groupTitle,
												children: t("presetTitle")
											})]
										}), (0, react_jsx_runtime.jsx)("div", {
											className: PluginInventorySettingsTab_module_css_default.headerEnd,
											children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
												open: switcherOpen,
												onClose: () => {
													setSwitcherOpen(false);
												},
												items: presets.map((preset) => ({
													id: preset.id,
													label: presetLabel(preset, t, presetName)
												})),
												selectedId: selected.id,
												onSelect: (id) => {
													setSwitcherOpen(false);
													setChosenPreset(id);
												},
												align: "end",
												portal: true,
												anchor: (0, react_jsx_runtime.jsxs)("button", {
													type: "button",
													className: PluginInventorySettingsTab_module_css_default.switcher,
													"aria-haspopup": "menu",
													"aria-expanded": switcherOpen,
													"aria-label": t("switcherLabel"),
													onClick: () => {
														setSwitcherOpen((value) => !value);
													},
													children: [(0, react_jsx_runtime.jsx)("span", {
														className: PluginInventorySettingsTab_module_css_default.switcherLabel,
														children: presetLabel(selected, t, presetName)
													}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
														className: PluginInventorySettingsTab_module_css_default.chevron,
														"aria-hidden": "true"
													})]
												})
											})
										})]
									}),
									(0, react_jsx_runtime.jsx)("p", {
										className: PluginInventorySettingsTab_module_css_default.groupSub,
										children: t("presetSubtitle")
									}),
									presetEffectiveOpen ? (0, react_jsx_runtime.jsxs)("div", {
										id: `${sectionId}-preset`,
										className: PluginInventorySettingsTab_module_css_default.groupBody,
										children: [
											selected.broken !== void 0 ? (0, react_jsx_runtime.jsx)("p", {
												className: PluginInventorySettingsTab_module_css_default.brokenNote,
												role: "alert",
												children: selected.broken
											}) : null,
											selectedRows.length > 0 ? (0, react_jsx_runtime.jsx)("ul", {
												className: PluginInventorySettingsTab_module_css_default.cards,
												children: selectedRows.map((row, index) => presetRowCard(selected, row, index))
											}) : null,
											otherMatchCount > 0 ? (0, react_jsx_runtime.jsxs)("p", {
												className: PluginInventorySettingsTab_module_css_default.hint,
												children: [t("matchesInOtherPresets", { count: String(otherMatchCount) }), otherPresetMatches.map((preset) => (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: PluginInventorySettingsTab_module_css_default.jumpLink,
													onClick: () => {
														setChosenPreset(preset.id);
													},
													children: presetName(preset)
												}, preset.id))]
											}) : null
										]
									}) : null
								]
							}) : null,
							entries.length > 0 ? (0, react_jsx_runtime.jsxs)("section", {
								className: PluginInventorySettingsTab_module_css_default.group,
								"data-plugin-scope": "global",
								children: [
									(0, react_jsx_runtime.jsx)("div", {
										className: PluginInventorySettingsTab_module_css_default.groupTitleRow,
										children: (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											className: PluginInventorySettingsTab_module_css_default.groupToggle,
											"aria-expanded": globalEffectiveOpen,
											"aria-controls": `${sectionId}-global`,
											onClick: () => {
												setGlobalOpen(!globalEffectiveOpen);
											},
											children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
												className: PluginInventorySettingsTab_module_css_default.chevron,
												size: 12,
												"aria-hidden": "true"
											}), (0, react_jsx_runtime.jsx)("span", {
												className: PluginInventorySettingsTab_module_css_default.groupTitle,
												children: t("globalTitle")
											})]
										})
									}),
									(0, react_jsx_runtime.jsx)("p", {
										className: PluginInventorySettingsTab_module_css_default.groupSub,
										children: t("globalSubtitle")
									}),
									globalEffectiveOpen && globalCount > 0 ? (0, react_jsx_runtime.jsxs)("ul", {
										className: PluginInventorySettingsTab_module_css_default.cards,
										id: `${sectionId}-global`,
										children: [filteredFailed.map((entry) => globalRowCard(entry)), filteredRegular.map((entry) => globalRowCard(entry, entry.enabled ? void 0 : enabledIn.get(entry.moduleName)))]
									}) : null
								]
							}) : null
						]
					}) : null
				]
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** Copy dictionaries for the plugin inventory Settings section. */
		/** Simplified Chinese dictionary and key source of truth. */
		const zh = {
			tab: "插件列表",
			loading: "正在读取插件…",
			clientSyncing: "正在同步本页面的插件…",
			clientSyncFailed: "本页面的插件未能完成同步；服务端的启用状态保持不变。",
			clientSyncRetry: "重试本页面同步",
			error: "暂时无法读取插件。",
			metadataError: "包元信息错误：{error}",
			retry: "重试",
			search: "搜索插件",
			empty: "暂无插件。",
			emptySearch: "没有匹配的插件。",
			presetTitle: "会话插件",
			presetSubtitle: "由 Agent 预设按会话组成",
			switcherLabel: "选择要查看的 Agent 预设",
			presetOptionDefault: "{name}（默认）",
			presetOptionBroken: "{name}（加载失败）",
			globalTitle: "全局插件",
			globalSubtitle: "系统与所有会话共用",
			presetProvidedDetail: "全局已停用，由 Agent 预设按会话提供",
			enabledIn: "启用于",
			matchesInOtherPresets: "其他预设中还有 {count} 个匹配：",
			enabledTag: "已启用",
			disabledTag: "已停用",
			conditionalTag: "条件启用",
			presetEnabledTag: "预设中启用",
			failedTag: "启动失败",
			moduleLabel: "完整名称",
			fromPreset: "来自",
			condition: "禁用条件",
			configuration: "配置状态",
			runtime: "运行状态",
			unobserved: "未运行",
			pending: "等待依赖",
			loadingPhase: "加载中",
			active: "运行中",
			failed: "启动失败",
			unloading: "卸载中"
		};
		/** English dictionary checked against the Chinese key set. */
		const en = {
			tab: "Plugin list",
			loading: "Reading plugins…",
			clientSyncing: "Syncing plugins on this page…",
			clientSyncFailed: "Some plugins could not sync on this page. Host enablement is unchanged.",
			clientSyncRetry: "Retry this page",
			error: "Plugins are temporarily unavailable.",
			metadataError: "Package metadata error: {error}",
			retry: "Retry",
			search: "Search plugins",
			empty: "No plugins are available.",
			emptySearch: "No matching plugins.",
			presetTitle: "Session plugins",
			presetSubtitle: "Composed per session by agent presets",
			switcherLabel: "Choose the agent preset to inspect",
			presetOptionDefault: "{name} (default)",
			presetOptionBroken: "{name} (failed to load)",
			globalTitle: "Global plugins",
			globalSubtitle: "Shared by the system and every session",
			presetProvidedDetail: "Disabled globally; agent presets provide it per session",
			enabledIn: "Enabled in",
			matchesInOtherPresets: "{count} more matches in other presets: ",
			enabledTag: "Enabled",
			disabledTag: "Disabled",
			conditionalTag: "Conditional",
			presetEnabledTag: "Via presets",
			failedTag: "Failed",
			moduleLabel: "Module",
			fromPreset: "From",
			condition: "Disabled when",
			configuration: "Configuration",
			runtime: "Status",
			unobserved: "Not running",
			pending: "Waiting for dependencies",
			loadingPhase: "Loading",
			active: "Running",
			failed: "Failed to start",
			unloading: "Unloading"
		};
		/** Japanese copy, checked against the English keys. */
		const ja = {
			"tab": "プラグイン一覧",
			"loading": "プラグインを読み込み中…",
			"clientSyncing": "このページでプラグインを同期中…",
			"clientSyncFailed": "一部のプラグインをこのページで同期できませんでした。ホスト側の有効化状態は変更されていません。",
			"clientSyncRetry": "このページを再試行",
			"error": "プラグインは一時的に利用できません。",
			"metadataError": "パッケージメタデータのエラー: {error}",
			"retry": "再試行",
			"search": "プラグインを検索",
			"empty": "利用可能なプラグインはありません。",
			"emptySearch": "一致するプラグインはありません。",
			"presetTitle": "セッションプラグイン",
			"presetSubtitle": "エージェントプリセットによりセッションごとに構成されます",
			"switcherLabel": "確認するエージェントプリセットを選択",
			"presetOptionDefault": "{name} (デフォルト)",
			"presetOptionBroken": "{name} (読み込み失敗)",
			"globalTitle": "グローバルプラグイン",
			"globalSubtitle": "システムとすべてのセッションで共有",
			"presetProvidedDetail": "グローバルでは無効。エージェントプリセットがセッションごとに提供します",
			"enabledIn": "有効化先",
			"matchesInOtherPresets": "他のプリセットにさらに{count}件一致: ",
			"enabledTag": "有効",
			"disabledTag": "無効",
			"conditionalTag": "条件付き",
			"presetEnabledTag": "プリセット経由",
			"failedTag": "失敗",
			"moduleLabel": "モジュール",
			"fromPreset": "提供元",
			"condition": "無効になる条件",
			"configuration": "構成",
			"runtime": "ステータス",
			"unobserved": "停止中",
			"pending": "依存関係の待機中",
			"loadingPhase": "読み込み中",
			"active": "実行中",
			"failed": "起動に失敗",
			"unloading": "アンロード中"
		};
		/** Spanish dictionary, checked against the English keys. */
		const es = {
			tab: "Lista de complementos",
			loading: "Leyendo complementos…",
			clientSyncing: "Sincronizando complementos en esta página…",
			clientSyncFailed: "Algunos complementos no se pudieron sincronizar en esta página. La habilitación del host no ha cambiado.",
			clientSyncRetry: "Reintentar esta página",
			error: "Los complementos no están disponibles temporalmente.",
			metadataError: "Error de metadatos del paquete: {error}",
			retry: "Reintentar",
			search: "Complementos de búsqueda",
			empty: "No hay complementos disponibles.",
			emptySearch: "No hay complementos coincidentes.",
			presetTitle: "Complementos de sesión",
			presetSubtitle: "Compuesto por sesión por ajustes preestablecidos de agente",
			switcherLabel: "Elija el agente preestablecido para inspeccionar",
			presetOptionDefault: "{name} (predeterminado)",
			presetOptionBroken: "{name} (no se pudo cargar)",
			globalTitle: "Complementos globales",
			globalSubtitle: "Compartido por el sistema y cada sesión.",
			presetProvidedDetail: "Discapacitados a nivel mundial; Los ajustes preestablecidos del agente lo proporcionan por sesión.",
			enabledIn: "Habilitado en",
			matchesInOtherPresets: "{count} más coincidencias en otros ajustes preestablecidos: ",
			enabledTag: "Habilitado",
			disabledTag: "Discapacitado",
			conditionalTag: "Condicional",
			presetEnabledTag: "A través de ajustes preestablecidos",
			failedTag: "Fallido",
			moduleLabel: "Módulo",
			fromPreset: "De",
			condition: "Deshabilitado cuando",
			configuration: "Configuración",
			runtime: "Estado",
			unobserved: "no corriendo",
			pending: "Esperando dependencias",
			loadingPhase: "Cargando",
			active: "corriendo",
			failed: "No se pudo iniciar",
			unloading: "Descarga"
		};
		/** French dictionary, checked against the English keys. */
		const fr = {
			tab: "Liste des plugins",
			loading: "Plugins de lecture…",
			clientSyncing: "Synchronisation des plugins sur cette page…",
			clientSyncFailed: "Certains plugins n'ont pas pu se synchroniser sur cette page. L'activation de l'hôte est inchangée.",
			clientSyncRetry: "Réessayez cette page",
			error: "Les plugins sont temporairement indisponibles.",
			metadataError: "Erreur de métadonnées du package\xA0: {error}",
			retry: "Réessayer",
			search: "Plugins de recherche",
			empty: "Aucun plugin n'est disponible.",
			emptySearch: "Aucun plugin correspondant.",
			presetTitle: "Plugins de sessions",
			presetSubtitle: "Composé par session par préréglages d'agent",
			switcherLabel: "Choisissez le préréglage d'agent à inspecter",
			presetOptionDefault: "{name} (par défaut)",
			presetOptionBroken: "{name} (échec du chargement)",
			globalTitle: "Plugins globaux",
			globalSubtitle: "Partagé par le système et à chaque session",
			presetProvidedDetail: "Handicapé à l'échelle mondiale\xA0; les préréglages d'agent le fournissent par session",
			enabledIn: "Activé dans",
			matchesInOtherPresets: "{count} plus de correspondances dans d'autres préréglages\xA0: ",
			enabledTag: "Activé",
			disabledTag: "Désactivé",
			conditionalTag: "Conditionnel",
			presetEnabledTag: "Via les préréglages",
			failedTag: "Échec",
			moduleLabel: "Module",
			fromPreset: "De",
			condition: "Désactivé quand",
			configuration: "Configuration",
			runtime: "Statut",
			unobserved: "Ne fonctionne pas",
			pending: "En attente de dépendances",
			loadingPhase: "Chargement",
			active: "Courir",
			failed: "Échec du démarrage",
			unloading: "Déchargement"
		};
		/** German dictionary, checked against the English keys. */
		const de = {
			tab: "Plugin-Liste",
			loading: "Plugins lesen…",
			clientSyncing: "Plugins auf dieser Seite werden synchronisiert…",
			clientSyncFailed: "Einige Plugins konnten auf dieser Seite nicht synchronisiert werden. Die Host-Aktivierung bleibt unverändert.",
			clientSyncRetry: "Versuchen Sie es erneut mit dieser Seite",
			error: "Plugins sind vorübergehend nicht verfügbar.",
			metadataError: "Paketmetadatenfehler: {error}",
			retry: "Erneut versuchen",
			search: "Such-Plugins",
			empty: "Es sind keine Plugins verfügbar.",
			emptySearch: "Keine passenden Plugins.",
			presetTitle: "Sitzungs-Plugins",
			presetSubtitle: "Zusammengestellt pro Sitzung nach Agentenvoreinstellungen",
			switcherLabel: "Wählen Sie die zu überprüfende Agentenvoreinstellung aus",
			presetOptionDefault: "{name} (Standard)",
			presetOptionBroken: "{name} (Laden fehlgeschlagen)",
			globalTitle: "Globale Plugins",
			globalSubtitle: "Wird vom System und jeder Sitzung geteilt",
			presetProvidedDetail: "Weltweit deaktiviert; Agentenvoreinstellungen stellen es pro Sitzung bereit",
			enabledIn: "Aktiviert in",
			matchesInOtherPresets: "{count} weitere Übereinstimmungen in anderen Voreinstellungen: ",
			enabledTag: "Aktiviert",
			disabledTag: "Deaktiviert",
			conditionalTag: "Bedingt",
			presetEnabledTag: "Über Voreinstellungen",
			failedTag: "Fehlgeschlagen",
			moduleLabel: "Modul",
			fromPreset: "Von",
			condition: "Deaktiviert, wenn",
			configuration: "Konfiguration",
			runtime: "Status",
			unobserved: "Läuft nicht",
			pending: "Warten auf Abhängigkeiten",
			loadingPhase: "Laden",
			active: "Laufen",
			failed: "Start fehlgeschlagen",
			unloading: "Entladen"
		};
		/** Russian dictionary, checked against the English keys. */
		const ru = {
			tab: "Список плагинов",
			loading: "Чтение плагинов…",
			clientSyncing: "Синхронизация плагинов на этой странице…",
			clientSyncFailed: "Некоторые плагины не смогли синхронизироваться на этой странице. Включение хоста не изменилось.",
			clientSyncRetry: "Повторить эту страницу",
			error: "Плагины временно недоступны.",
			metadataError: "Ошибка метаданных пакета: {error}.",
			retry: "Повторить",
			search: "Поиск плагинов",
			empty: "Нет доступных плагинов.",
			emptySearch: "Нет подходящих плагинов.",
			presetTitle: "Плагины сеансов",
			presetSubtitle: "Составляется за сеанс с помощью предустановок агента",
			switcherLabel: "Выберите предустановку агента для проверки",
			presetOptionDefault: "{name} (по умолчанию)",
			presetOptionBroken: "{name} (не удалось загрузить)",
			globalTitle: "Глобальные плагины",
			globalSubtitle: "Совместно используется системой и каждым сеансом",
			presetProvidedDetail: "Отключено глобально; предустановки агента предусматривают это за сеанс",
			enabledIn: "Включено в",
			matchesInOtherPresets: "{count} больше совпадений в других пресетах: ",
			enabledTag: "Включено",
			disabledTag: "Отключено",
			conditionalTag: "Условный",
			presetEnabledTag: "Через пресеты",
			failedTag: "Не удалось",
			moduleLabel: "Модуль",
			fromPreset: "От",
			condition: "Отключено, когда",
			configuration: "Конфигурация",
			runtime: "Статус",
			unobserved: "Не работает",
			pending: "Ожидание зависимостей",
			loadingPhase: "Загрузка",
			active: "Бег",
			failed: "Не удалось запустить",
			unloading: "Разгрузка"
		};
		/** Portuguese dictionary, checked against the English keys. */
		const pt = {
			tab: "Lista de plug-ins",
			loading: "Lendo plug-ins…",
			clientSyncing: "Sincronizando plug-ins nesta página…",
			clientSyncFailed: "Alguns plug-ins não puderam ser sincronizados nesta página. A ativação do host permanece inalterada.",
			clientSyncRetry: "Tente esta página novamente",
			error: "Os plug-ins estão temporariamente indisponíveis.",
			metadataError: "Erro de metadados do pacote: {error}",
			retry: "Tentar novamente",
			search: "Plug-ins de pesquisa",
			empty: "Nenhum plug-in está disponível.",
			emptySearch: "Nenhum plug-in correspondente.",
			presetTitle: "Plug-ins de sessão",
			presetSubtitle: "Composto por sessão por predefinições de agente",
			switcherLabel: "Escolha a predefinição do agente para inspecionar",
			presetOptionDefault: "{name} (padrão)",
			presetOptionBroken: "{name} (falha ao carregar)",
			globalTitle: "Plug-ins globais",
			globalSubtitle: "Compartilhado pelo sistema e por cada sessão",
			presetProvidedDetail: "Desativado globalmente; predefinições de agente fornecem isso por sessão",
			enabledIn: "Habilitado em",
			matchesInOtherPresets: "{count} mais correspondências em outras predefinições: ",
			enabledTag: "Habilitado",
			disabledTag: "Desativado",
			conditionalTag: "Condicional",
			presetEnabledTag: "Por meio de predefinições",
			failedTag: "Falha",
			moduleLabel: "Módulo",
			fromPreset: "De",
			condition: "Desativado quando",
			configuration: "Configuração",
			runtime: "Estado",
			unobserved: "Não está em execução",
			pending: "Esperando por dependências",
			loadingPhase: "Carregando",
			active: "Correndo",
			failed: "Falha ao iniciar",
			unloading: "Descarregando"
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Read-only Host plugin inventory registered into Web Settings. */
		/** Dictionary namespace owned by this plugin. */
		const NS = "settings.pluginInventory";
		/** Services required by the Settings registration and generated Remote face. */
		const inject = [
			"slots",
			"locale",
			"remote",
			"remote.pluginInventory",
			"modules"
		];
		/** Contribute the lazy inventory tab to the Plugins settings section. */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}), "ui-settings-plugin-inventory: dictionaries");
			const t = ctx.locale.bind(NS);
			const list = async () => {
				const result = await ctx.remote.pluginInventory.list();
				if (!result.ok) throw new Error(`pluginInventory.list failed: ${result.error.code}: ${result.error.message}`);
				return result.value;
			};
			const agentPresetCopy = ctx.locale.bind("settings.agentPreset");
			const presetName = (preset) => presetDisplayText(preset, agentPresetCopy).name;
			const injected = () => ({
				list,
				presetName,
				resolveText: (text) => ctx.locale.resolveText(text),
				hooks: { clientSync: ctx.modules.entries.state },
				retryClient: () => {
					ctx.modules.entries.retry().catch((error) => {
						ctx.logger.error(error);
					});
				}
			});
			ctx.slots.inject("settings.plugins.tab", () => ctx.slots.register({
				name: "settings.plugins.tab",
				id: "all",
				order: 10,
				label: () => t("tab"),
				locale: NS,
				inject: injected
			}, PluginInventorySettingsTab));
		}
		//#endregion
		exports.NS = NS;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
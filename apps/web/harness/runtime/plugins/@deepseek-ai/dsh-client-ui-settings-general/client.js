window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-settings-general",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_dsh_client_ui_slots = require("@deepseek-ai/dsh-client-ui-slots");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let react_dom = require("react-dom");
		//#region lib/types/client/shell-store.js
		/** Shared settings viewing state for its mouse and command entry points. */
		/**
		* Declare the settings dialog state and its complete mutation API.
		* @returns one root-scoped store handle for the settings shell.
		*/
		function createSettingsShellStore() {
			return (0, _deepseek_ai_dsh_client_store.defineStore)({
				init: () => ({
					open: false,
					activeId: void 0
				}),
				actions: {
					open: (d) => {
						d.open = true;
					},
					close: (d) => {
						d.open = false;
						d.activeId = void 0;
					},
					select: (d, id) => {
						d.activeId = id;
					},
					openSection: (d, id) => {
						d.activeId = id;
						d.open = true;
					}
				}
			});
		}
		//#endregion
		//#region ../../../node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
		function r(e) {
			var t, f, n = "";
			if ("string" == typeof e || "number" == typeof e) n += e;
			else if ("object" == typeof e) if (Array.isArray(e)) {
				var o = e.length;
				for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
			} else for (f in e) e[f] && (n && (n += " "), n += f);
			return n;
		}
		function clsx() {
			for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
			return n;
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-settings-general/src/client/SettingsRoot.module.css.mjs
		const css$7 = ".bdYQDq_triggerRow{flex:none;align-items:center;gap:8px;width:calc(100% + 4px);margin:4px -2px;display:flex;position:relative}.bdYQDq_triggerRow.bdYQDq_railRow{width:36px;margin:8px 0 10px}.bdYQDq_trigger{box-sizing:border-box;border-radius:var(--dsw-radius-md);cursor:pointer;width:auto;min-width:0;height:42px;color:var(--dsw-alias-label-primary);background:0 0;border:none;flex:1;align-items:center;gap:8px;margin:0;padding:0 10px 0 8px;font-family:inherit;font-size:14px;line-height:22px;display:flex;overflow:hidden}@media (hover:hover){.bdYQDq_trigger:hover{background:var(--dsw-alias-interactive-bg-hover)}}.bdYQDq_trigger.bdYQDq_rail{flex:none;justify-content:center;gap:0;width:36px;height:36px;margin:0;padding:0}.bdYQDq_triggerLabel{white-space:nowrap;overflow:hidden}.bdYQDq_overlay{z-index:1000;justify-content:center;align-items:center;display:flex;position:fixed;inset:0}.bdYQDq_mask{inset:var(--dsh-frame-chrome-top,0px) 0 0;background:var(--dsw-alias-bg-mask-1);backdrop-filter:var(--dsw-mask-blur);position:absolute}.bdYQDq_panel{z-index:1;width:800px;height:min(800px, calc(100vh - 2 * max(24px, var(--dsh-frame-overlay-top,24px))));border-radius:var(--dsw-radius-panel);background:var(--dsw-alias-bg-layer-2);max-width:calc(100vw - 48px);box-shadow:var(--dsw-elevation-prominent);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);grid-template:\"bdYQDq_title bdYQDq_header\"\"bdYQDq_nav bdYQDq_options\"minmax(0,1fr)/188px minmax(0,1fr);display:grid;position:relative;overflow:hidden}.bdYQDq_panel:focus{outline:none}.bdYQDq_nav{box-sizing:border-box;flex-direction:column;grid-area:bdYQDq_nav;min-width:0;min-height:0;padding:10px 12px 0;display:flex}.bdYQDq_navTitle{color:var(--dsw-alias-label-primary);grid-area:bdYQDq_title;padding:22px 12px 8px 24px;font-size:16px;font-weight:500;line-height:24px}.bdYQDq_navList{flex-direction:column;gap:4px;min-height:0;display:flex;overflow-y:auto}.bdYQDq_navCell{box-sizing:border-box;border-radius:var(--dsw-radius-md);cursor:pointer;height:40px;color:var(--dsw-alias-label-primary);text-align:left;background:0 0;border:none;align-items:center;gap:8px;padding:9px 16px 9px 12px;font-family:inherit;font-size:14px;font-weight:400;line-height:22px;display:flex}@media (hover:hover){.bdYQDq_navCell:hover{background:var(--dsw-alias-interactive-bg-hover)}}.bdYQDq_navCell.bdYQDq_active{background:var(--dsw-specific-sidebar-nav-item-active)}.bdYQDq_navIcon{flex:none}.bdYQDq_navLabel{white-space:nowrap;text-overflow:ellipsis;flex:1;min-width:0;overflow:hidden}.bdYQDq_header{box-sizing:border-box;grid-area:bdYQDq_header;justify-content:space-between;align-items:flex-start;gap:8px;height:54px;padding:20px 14px 8px 10px;display:flex}.bdYQDq_actions{justify-content:flex-end;align-items:center;gap:8px;min-width:0;margin-left:auto;display:flex}.bdYQDq_close{border-radius:var(--dsw-radius-sm);cursor:pointer;width:28px;height:28px;color:var(--dsw-alias-label-primary);background:0 0;border:none;flex:none;justify-content:center;align-items:center;padding:0;display:inline-flex}@media (hover:hover){.bdYQDq_close:hover{background:var(--dsw-alias-interactive-bg-hover)}}.bdYQDq_options{grid-area:bdYQDq_options;min-width:0;min-height:0;padding:0 24px 24px;overflow-y:auto}@media (width<=767px){html:not([data-windows-titlebar]):not([data-platform=darwin]) .bdYQDq_overlay{background:var(--dsw-alias-bg-layer-2);height:100%;position:absolute}html:not([data-windows-titlebar]):not([data-platform=darwin]) .bdYQDq_panel{border-radius:0;grid-template:\"bdYQDq_title bdYQDq_header\"\"bdYQDq_nav bdYQDq_nav\"\"bdYQDq_options bdYQDq_options\"minmax(0,1fr)/minmax(0,1fr) auto;width:100%;max-width:none;height:100%}html:not([data-windows-titlebar]):not([data-platform=darwin]) .bdYQDq_navTitle{white-space:nowrap;text-overflow:ellipsis;padding:22px 0 0 16px;overflow:hidden}html:not([data-windows-titlebar]):not([data-platform=darwin]) .bdYQDq_header{height:auto;padding:20px 16px 0 10px}html:not([data-windows-titlebar]):not([data-platform=darwin]) .bdYQDq_nav{padding:0}html:not([data-windows-titlebar]):not([data-platform=darwin]) .bdYQDq_navList{overscroll-behavior:none;scrollbar-width:none;flex-direction:row;gap:4px;padding:12px 16px 14px;overflow:auto hidden}html:not([data-windows-titlebar]):not([data-platform=darwin]) .bdYQDq_navList::-webkit-scrollbar{display:none}html:not([data-windows-titlebar]):not([data-platform=darwin]) .bdYQDq_navCell{flex:1 0 auto;justify-content:center;min-width:108px;padding:0 14px}html:not([data-windows-titlebar]):not([data-platform=darwin]) .bdYQDq_navLabel{flex:none}html:not([data-windows-titlebar]):not([data-platform=darwin]) .bdYQDq_options{padding:0 16px 24px}}.bdYQDq_hiddenLabel{clip:rect(0 0 0 0);white-space:nowrap;width:1px;height:1px;position:absolute;overflow:hidden}";
		const tagId$7 = "@deepseek-ai/dsh-client-ui-settings-general/SettingsRoot.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$7) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-settings-general";
			tag.dataset.pluginCss = tagId$7;
			tag.textContent = css$7;
			document.head.appendChild(tag);
		}
		var SettingsRoot_module_css_default = {
			"actions": "bdYQDq_actions",
			"active": "bdYQDq_active",
			"close": "bdYQDq_close",
			"header": "bdYQDq_header",
			"hiddenLabel": "bdYQDq_hiddenLabel",
			"mask": "bdYQDq_mask",
			"nav": "bdYQDq_nav",
			"navCell": "bdYQDq_navCell",
			"navIcon": "bdYQDq_navIcon",
			"navLabel": "bdYQDq_navLabel",
			"navList": "bdYQDq_navList",
			"navTitle": "bdYQDq_navTitle",
			"options": "bdYQDq_options",
			"overlay": "bdYQDq_overlay",
			"panel": "bdYQDq_panel",
			"rail": "bdYQDq_rail",
			"railRow": "bdYQDq_railRow",
			"title": "bdYQDq_title",
			"trigger": "bdYQDq_trigger",
			"triggerLabel": "bdYQDq_triggerLabel",
			"triggerRow": "bdYQDq_triggerRow"
		};
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-settings-general/src/client/DesktopUpdateIndicator.module.css.mjs
		const css$6 = ".PQES5a_indicator{box-sizing:border-box;border:1px solid color-mix(in srgb, var(--dsw-alias-brand-primary-new-colorprimary-new-color) 20%, transparent);border-radius:var(--dsw-radius-sm);height:28px;color:var(--dsw-alias-brand-primary-new-colorprimary-new-color);background:color-mix(in srgb, var(--dsw-alias-brand-primary-new-colorprimary-new-color) 8%, transparent);text-align:left;white-space:nowrap;cursor:pointer;flex:none;grid-template-columns:14px max-content;align-items:center;column-gap:4px;padding:0 8px;font-family:inherit;font-size:12px;font-weight:500;line-height:18px;display:inline-grid}.PQES5a_icon{place-items:center;width:14px;height:14px;display:grid}.PQES5a_badge{inset-inline-end:2px;corner-shape:round;background:var(--dsw-alias-brand-primary-new-colorprimary-new-color);border-radius:50%;width:6px;height:6px;position:absolute;top:2px}.PQES5a_errorDot{corner-shape:round;background:currentColor;border-radius:50%;width:6px;height:6px}.PQES5a_spinner{animation:1s linear infinite PQES5a_spin}@keyframes PQES5a_spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.PQES5a_spinner{animation:none}}.PQES5a_indicator[aria-disabled=true]{cursor:default}";
		const tagId$6 = "@deepseek-ai/dsh-client-ui-settings-general/DesktopUpdateIndicator.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$6) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-settings-general";
			tag.dataset.pluginCss = tagId$6;
			tag.textContent = css$6;
			document.head.appendChild(tag);
		}
		var DesktopUpdateIndicator_module_css_default = {
			"badge": "PQES5a_badge",
			"errorDot": "PQES5a_errorDot",
			"icon": "PQES5a_icon",
			"indicator": "PQES5a_indicator",
			"spin": "PQES5a_spin",
			"spinner": "PQES5a_spinner"
		};
		//#endregion
		//#region lib/types/client/DesktopUpdateIndicator.js
		/** Optional Electron status presentation; the native shell owns actions and Web owns visible copy. */
		const BUSY_PHASES = new Set([
			"checking",
			"downloading",
			"verifying",
			"installing"
		]);
		function updateCopy(state, t) {
			const label = {
				idle: "",
				checking: t("desktop.update.checking"),
				available: t("desktop.update.available"),
				downloading: t("desktop.update.progress", { percent: state.percent ?? 0 }),
				verifying: t("desktop.update.verifying"),
				installing: t("desktop.update.installing"),
				ready: t("desktop.update.ready"),
				error: t("desktop.update.retry")
			}[state.phase];
			if (state.phase === "checking" || state.phase === "verifying" || state.phase === "installing") return {
				label,
				detail: state.version ?? label
			};
			if (state.phase === "error") return {
				label,
				detail: {
					check: t("desktop.update.checkFailed"),
					"check-network": t("desktop.update.checkNetworkFailed"),
					download: t("desktop.update.downloadFailed"),
					"download-network": t("desktop.update.downloadNetworkFailed"),
					install: t("desktop.update.installFailed"),
					"install-network": t("desktop.update.installNetworkFailed"),
					"stop-failed": t("desktop.update.stopFailed"),
					"tasks-changed": t("desktop.update.tasksChanged"),
					"tasks-unavailable": t("desktop.update.tasksUnavailable"),
					"fullscreen-timeout": t("desktop.update.fullscreenTimeout")
				}[state.failure ?? "install"]
			};
			if (state.phase === "downloading" && state.version !== void 0) return {
				label,
				detail: t("desktop.update.downloadDetail", {
					percent: state.percent ?? 0,
					version: state.version
				})
			};
			return {
				label,
				detail: state.version === void 0 ? label : t("desktop.update.versionDetail", {
					label,
					version: state.version
				})
			};
		}
		/**
		* Render update status with connection-indicator geometry and brand-blue labels, including retries.
		* @param props - Connection priority, sidebar width, and localized bridge-failure copy.
		* @returns Desktop-only status beside the account button, or nothing in browsers.
		*/
		function DesktopUpdateIndicator({ wide, hidden, t, view, onOpen }) {
			const { presentation: state, failed, opening } = view;
			if (!wide || hidden || !failed && (state === void 0 || state.phase === "idle")) return null;
			const retryLabel = t("desktop.update.retry");
			const copy = state === void 0 ? {
				label: retryLabel,
				detail: retryLabel
			} : updateCopy(state, t);
			const label = failed ? retryLabel : copy.label;
			const error = failed || state?.phase === "error";
			const busy = opening || state !== void 0 && BUSY_PHASES.has(state.phase);
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label: failed ? retryLabel : copy.detail,
				side: "top",
				children: (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: DesktopUpdateIndicator_module_css_default.indicator,
					"aria-label": label,
					"aria-disabled": busy,
					onClick: () => {
						if (!busy) onOpen();
					},
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: DesktopUpdateIndicator_module_css_default.icon,
						"aria-hidden": "true",
						children: error ? (0, react_jsx_runtime.jsx)("span", { className: DesktopUpdateIndicator_module_css_default.errorDot }) : busy ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconLoadingOutlineRegular, {
							className: DesktopUpdateIndicator_module_css_default.spinner,
							size: 14
						}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDownloadOutlineRegular, { size: 14 })
					}), (0, react_jsx_runtime.jsx)("span", { children: label })]
				})
			});
		}
		/**
		* @param props - Framework-bound carrier and connection state.
		* @returns A non-interactive brand-blue notification on the sidebar expand button.
		*/
		function DesktopUpdateBadge({ useDesktopUpdate, useConnectionState, t }) {
			const { presentation: state, failed } = useDesktopUpdate((value) => value);
			const connection = useConnectionState((value) => value);
			if ((connection === "disconnected" || connection === "connecting") && state?.phase !== "installing" || !failed && (state === void 0 || state.phase === "idle")) return null;
			const retryLabel = t("desktop.update.retry");
			const copy = state === void 0 ? {
				label: retryLabel,
				detail: retryLabel
			} : updateCopy(state, t);
			const label = failed ? retryLabel : copy.label;
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label: failed ? label : copy.detail,
				side: "right",
				children: (0, react_jsx_runtime.jsx)("span", {
					role: "img",
					"aria-label": label,
					className: DesktopUpdateIndicator_module_css_default.badge
				})
			});
		}
		//#endregion
		//#region lib/types/client/SettingsRoot.js
		/**
		* Settings shell root: the sidebar-foot trigger row plus the centered modal
		* panel with the section nav rail. In browsers below 768px the panel fills
		* the viewport and the rail turns into a horizontal strip; Windows and macOS
		* desktop windows retain the rail
		* (SettingsRoot.module.css). The shell is a pure composition face —
		* slot-owned text (trigger label, panel title, close label, sections) arrives
		* from registrants through slots; accessible names resolve from localized
		* content (trigger: shell locale; dialog: aria-labelledby the title node;
		* close: visually-hidden slot text). Modal open state and the active section
		* id belong to the declared owner store; the onboarding coordinator mounts
		* exactly one ordered registrant while the sessions-derived empty-Hero fact
		* is active. Visible dialog chrome belongs to the step, so a
		* mounted-but-deciding step paints nothing here.
		*/
		const RECOVERY_CONFIRMATION_MS = 2e3;
		/** Minimum visible time for the connecting pill; shorter attempts read as flicker. */
		const CONNECTING_MIN_VISIBLE_MS = 800;
		/** Nav glyph by section id; unknown ids fall back to the settings gear. */
		function navIcon(id) {
			if (id === "account") return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconUserOutlineMedium, {
				className: SettingsRoot_module_css_default.navIcon,
				size: 16
			});
			if (id === "models") return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDataOutlineMedium, {
				className: SettingsRoot_module_css_default.navIcon,
				size: 16
			});
			if (id === "agent-presets") return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconAgentPresetOutlineMedium, {
				className: SettingsRoot_module_css_default.navIcon,
				size: 16
			});
			if (id === "plugins") return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPersonalizationOutlineMedium, {
				className: SettingsRoot_module_css_default.navIcon,
				size: 16
			});
			if (id === "archived-sessions") return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconArchiveOutlineMedium, {
				className: SettingsRoot_module_css_default.navIcon,
				size: 16
			});
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSettingsOutlineMedium, {
				className: SettingsRoot_module_css_default.navIcon,
				size: 16
			});
		}
		/**
		* Body-portaled modal layer: full-viewport mask + centered panel. Close paths: the
		* header button, a mask click, and document-level Escape (mounted only while
		* open, so the listener lifetime is the panel's).
		*/
		function SettingsPanel({ rows, renderSlot, activeId, onSelect, onClose }) {
			const active = rows.find((r) => r.id === activeId)?.id ?? rows[0]?.id;
			const titleId = (0, react.useId)();
			const panel = (0, react.useRef)(null);
			(0, _deepseek_ai_dsh_client_ui_primitives.useModalLayer)(panel, true, onClose);
			return (0, react_dom.createPortal)((0, react_jsx_runtime.jsxs)("div", {
				className: SettingsRoot_module_css_default.overlay,
				role: "presentation",
				children: [(0, react_jsx_runtime.jsx)("div", {
					className: SettingsRoot_module_css_default.mask,
					"aria-hidden": "true",
					onClick: onClose
				}), (0, react_jsx_runtime.jsxs)("div", {
					ref: panel,
					tabIndex: -1,
					"data-shortcut-modal": "settings",
					className: SettingsRoot_module_css_default.panel,
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": titleId,
					children: [
						(0, react_jsx_runtime.jsx)("div", {
							className: SettingsRoot_module_css_default.navTitle,
							id: titleId,
							tabIndex: -1,
							"data-modal-autofocus": active === void 0 ? "" : void 0,
							children: renderSlot("settings.header", {})
						}),
						(0, react_jsx_runtime.jsx)("nav", {
							className: SettingsRoot_module_css_default.nav,
							children: (0, react_jsx_runtime.jsx)("div", {
								className: SettingsRoot_module_css_default.navList,
								children: rows.map((row) => (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: clsx(SettingsRoot_module_css_default.navCell, row.id === active && SettingsRoot_module_css_default.active),
									"aria-current": row.id === active ? "true" : void 0,
									"data-modal-autofocus": row.id === active ? "" : void 0,
									onFocus: (event) => {
										event.currentTarget.scrollIntoView({
											block: "nearest",
											inline: "nearest"
										});
									},
									onClick: () => {
										onSelect(row.id);
									},
									children: [navIcon(row.id), (0, react_jsx_runtime.jsx)("span", {
										className: SettingsRoot_module_css_default.navLabel,
										children: row.label
									})]
								}, row.id))
							})
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: SettingsRoot_module_css_default.header,
							children: [(0, react_jsx_runtime.jsx)("div", {
								className: SettingsRoot_module_css_default.actions,
								children: renderSlot("settings.action", {})
							}), (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: SettingsRoot_module_css_default.close,
								onClick: onClose,
								children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, { size: 14 }), (0, react_jsx_runtime.jsx)("span", {
									className: SettingsRoot_module_css_default.hiddenLabel,
									children: renderSlot("settings.close", {})
								})]
							})]
						}),
						(0, react_jsx_runtime.jsx)("div", {
							className: SettingsRoot_module_css_default.options,
							children: active !== void 0 && renderSlot("settings.section", { close: onClose }, { only: active })
						})
					]
				})]
			}), document.body);
		}
		/**
		* Render the settings trigger and panel.
		* @param props - composed slot props (contract/slots.ts).
		* @returns the settings shell element tree.
		*/
		function SettingsRoot(props) {
			const { wide, reconnect, useConnectionState, useSections, useOnboardingSteps, useSessions, renderSlot, t, useDesktopUpdate, openDesktopUpdate, useStore, actions, useShortcuts } = props;
			const { open, activeId } = useStore((state) => state);
			const shortcut = useShortcuts((rows) => rows.find((row) => row.id === "settings.open"));
			const { close, openSection } = actions;
			const [requestedOnboarding, setRequestedOnboarding] = (0, react.useState)();
			const [completedOnboarding, setCompletedOnboarding] = (0, react.useState)(() => /* @__PURE__ */ new Set());
			const [showRecovery, setShowRecovery] = (0, react.useState)(false);
			const [holdConnecting, setHoldConnecting] = (0, react.useState)(false);
			const connectingShownAt = (0, react.useRef)(void 0);
			const rows = useSections((s) => s);
			const desktopUpdate = useDesktopUpdate((state) => state);
			const connectionState = useConnectionState((state) => state);
			const previousConnectionState = (0, react.useRef)(connectionState);
			const onboardingSteps = useOnboardingSteps((s) => s);
			const onboardingActive = useSessions((state) => {
				const main = Object.values(state.byId).find((session) => (session.retainedBy.mainView ?? 0) > 0);
				return state.phase === "ready" && (main === void 0 || main.blank);
			});
			const onboardingStep = requestedOnboarding !== void 0 ? onboardingSteps.find((step) => step.id === requestedOnboarding) : onboardingActive ? onboardingSteps.find((step) => !completedOnboarding.has(step.id)) : void 0;
			(0, react.useEffect)(() => {
				if (onboardingActive) return;
				setCompletedOnboarding(/* @__PURE__ */ new Set());
			}, [onboardingActive]);
			const onboardingStepSeen = (0, react.useRef)(onboardingStep);
			(0, react.useEffect)(() => {
				const appeared = onboardingStepSeen.current === void 0 && onboardingStep !== void 0;
				onboardingStepSeen.current = onboardingStep;
				if (appeared && open) close();
			}, [
				onboardingStep,
				open,
				close
			]);
			(0, react.useLayoutEffect)(() => {
				const previous = previousConnectionState.current;
				previousConnectionState.current = connectionState;
				if (connectionState !== "connected") {
					setShowRecovery(false);
					return;
				}
				if (previous !== "disconnected" && previous !== "connecting") return;
				setShowRecovery(true);
			}, [connectionState]);
			(0, react.useLayoutEffect)(() => {
				if (!showRecovery || holdConnecting) return;
				const timeout = window.setTimeout(() => {
					setShowRecovery(false);
				}, RECOVERY_CONFIRMATION_MS);
				return () => {
					window.clearTimeout(timeout);
				};
			}, [showRecovery, holdConnecting]);
			(0, react.useLayoutEffect)(() => {
				if (connectionState === "connecting") {
					connectingShownAt.current = Date.now();
					return;
				}
				const shownAt = connectingShownAt.current;
				if (shownAt === void 0) return;
				connectingShownAt.current = void 0;
				const remaining = CONNECTING_MIN_VISIBLE_MS - (Date.now() - shownAt);
				if (remaining <= 0) return;
				setHoldConnecting(true);
				const timeout = window.setTimeout(() => {
					setHoldConnecting(false);
				}, remaining);
				return () => {
					window.clearTimeout(timeout);
					setHoldConnecting(false);
				};
			}, [connectionState]);
			const completeOnboardingStep = (0, react.useCallback)((id) => {
				setRequestedOnboarding(void 0);
				setCompletedOnboarding((previous) => {
					if (previous.has(id)) return previous;
					return new Set([...previous, id]);
				});
			}, []);
			let connectionIndicator;
			if (connectionState === "connecting" || holdConnecting) connectionIndicator = "connecting";
			else if (connectionState === "disconnected") connectionIndicator = "disconnected";
			else if (showRecovery) connectionIndicator = "recovered";
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsxs)("div", {
					className: clsx(SettingsRoot_module_css_default.triggerRow, !wide && SettingsRoot_module_css_default.railRow),
					children: [
						renderSlot("settings.launcher", {
							wide,
							settingsOpen: open,
							openSettings: actions.open,
							...shortcut?.keys.length ? { settingsShortcut: {
								keys: shortcut.keys,
								aria: shortcut.aria
							} } : {},
							openOnboarding: (id) => {
								close();
								setRequestedOnboarding(id);
							}
						}, { fallback: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
							disabled: open,
							label: t("trigger"),
							shortcutKeys: shortcut?.keys,
							children: (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: clsx(SettingsRoot_module_css_default.trigger, !wide && SettingsRoot_module_css_default.rail),
								"aria-label": t("trigger"),
								"aria-keyshortcuts": shortcut?.aria,
								"aria-haspopup": "dialog",
								"aria-expanded": open,
								onClick: () => {
									actions.open();
								},
								children: renderSlot("settings.trigger", { wide })
							})
						}) }),
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ConnectionIndicator, {
							state: wide && desktopUpdate.presentation?.phase !== "installing" ? connectionIndicator : void 0,
							disconnectedLabel: t("connection.error"),
							connectingLabel: t("connection.connecting"),
							recoveredLabel: t("connection.connected"),
							reconnectActionLabel: t("connection.reconnect"),
							restartActionLabel: t("connection.restart"),
							onReconnect: reconnect
						}),
						(0, react_jsx_runtime.jsx)(DesktopUpdateIndicator, {
							wide,
							hidden: connectionIndicator !== void 0 && desktopUpdate.presentation?.phase !== "installing",
							t,
							view: desktopUpdate,
							onOpen: openDesktopUpdate
						})
					]
				}),
				open && (0, react_jsx_runtime.jsx)(SettingsPanel, {
					rows,
					renderSlot,
					activeId,
					onSelect: actions.select,
					onClose: close
				}),
				onboardingStep !== void 0 && renderSlot("settings.onboarding", {
					stepId: onboardingStep.id,
					explicit: requestedOnboarding !== void 0,
					complete: () => {
						completeOnboardingStep(onboardingStep.id);
					},
					openSection
				}, { only: onboardingStep.id })
			] });
		}
		//#endregion
		//#region lib/types/client/desktop-update-source.js
		/** Client-owned observation of the optional Desktop preload. */
		/** Owns one preload subscription across both sidebar locations. */
		var DesktopUpdateSource = class {
			bridge;
			/** Framework-observed carrier status shared by both sidebar controls. */
			store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({
				failed: false,
				opening: false
			});
			live = true;
			received = false;
			unsubscribe;
			/** @param bridge - Optional isolated Electron API, absent in ordinary browsers. */
			constructor(bridge) {
				this.bridge = bridge;
				this.unsubscribe = bridge?.subscribe((presentation) => {
					if (!this.live) return;
					this.received = true;
					this.store.set({
						...this.store.getSnapshot(),
						presentation,
						failed: false
					});
				});
				bridge?.status().then((presentation) => {
					if (this.live && !this.received) this.store.set({
						...this.store.getSnapshot(),
						presentation
					});
				}, () => {
					if (this.live && !this.received) this.store.set({
						...this.store.getSnapshot(),
						failed: true
					});
				});
			}
			/** Invoke one user action; subsequent clicks join the shell-owned operation. */
			open() {
				if (!this.live || this.bridge === void 0) return;
				const state = this.store.getSnapshot();
				if (state.opening || state.presentation !== void 0 && [
					"checking",
					"downloading",
					"verifying",
					"installing"
				].includes(state.presentation.phase)) return;
				this.store.set({
					...state,
					opening: true
				});
				this.bridge.open().catch(() => {
					if (this.live) this.store.set({
						...this.store.getSnapshot(),
						failed: true
					});
				}).finally(() => {
					if (this.live) this.store.set({
						...this.store.getSnapshot(),
						opening: false
					});
				});
			}
			/** Detach the carrier and ignore any pending status or action completion. */
			dispose() {
				this.live = false;
				this.unsubscribe?.();
			}
		};
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-settings-general/src/client/chrome.module.css.mjs
		const css$5 = ".eZGdwq_triggerLabel{white-space:nowrap;overflow:hidden}";
		const tagId$5 = "@deepseek-ai/dsh-client-ui-settings-general/chrome.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$5) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-settings-general";
			tag.dataset.pluginCss = tagId$5;
			tag.textContent = css$5;
			document.head.appendChild(tag);
		}
		var chrome_module_css_default = { "triggerLabel": "eZGdwq_triggerLabel" };
		//#endregion
		//#region lib/types/client/chrome.js
		/**
		* Shell chrome content registered into the shell's trigger/header seats: the
		* trigger row icon + label (figma sidebar foot) and the panel title text.
		* The shell renders the surrounding chrome (button, nav heading row) and
		* reads each entry's `label` option for aria text.
		*/
		/**
		* Render the trigger row content (icon; label only in the wide column).
		* @param props - composed slot props.
		* @returns the trigger content fragment.
		*/
		function TriggerContent({ wide, t }) {
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSettingsOutlineMedium, { size: wide ? 16 : 18 }), wide && (0, react_jsx_runtime.jsx)("span", {
				className: chrome_module_css_default.triggerLabel,
				children: t("trigger")
			})] });
		}
		/**
		* Render the panel title text.
		* @param props - composed slot props.
		* @returns the title text node.
		*/
		function HeaderContent({ t }) {
			return (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: t("title") });
		}
		/**
		* Render the close button's visually-hidden label text.
		* @param props - composed slot props.
		* @returns the label text node.
		*/
		function CloseLabel({ t }) {
			return (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: t("close") });
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-settings-general/src/client/GeneralSection.module.css.mjs
		const css$4 = ".i4y9Qq_section{flex-direction:column;width:100%;display:flex}.i4y9Qq_section>[data-slot=\"settings.general.item\"]>:last-child{border-bottom:none}";
		const tagId$4 = "@deepseek-ai/dsh-client-ui-settings-general/GeneralSection.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$4) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-settings-general";
			tag.dataset.pluginCss = tagId$4;
			tag.textContent = css$4;
			document.head.appendChild(tag);
		}
		var GeneralSection_module_css_default = { "section": "i4y9Qq_section" };
		//#endregion
		//#region lib/types/client/GeneralSection.js
		/**
		* Render the General section content column.
		* @param props - composed slot props (contract/slots.ts).
		* @returns the section element tree.
		*/
		function GeneralSection({ renderSlot }) {
			return (0, react_jsx_runtime.jsx)("div", {
				className: GeneralSection_module_css_default.section,
				children: renderSlot("settings.general.item", {})
			});
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-settings-general/src/client/CurrentVersionRow.module.css.mjs
		const css$3 = ".QUPOuG_row{color:var(--dsw-alias-label-primary);overflow-wrap:anywhere;padding:16px 0;font-size:14px;line-height:22px}";
		const tagId$3 = "@deepseek-ai/dsh-client-ui-settings-general/CurrentVersionRow.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$3) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-settings-general";
			tag.dataset.pluginCss = tagId$3;
			tag.textContent = css$3;
			document.head.appendChild(tag);
		}
		var CurrentVersionRow_module_css_default = { "row": "QUPOuG_row" };
		//#endregion
		//#region lib/types/client/CurrentVersionRow.js
		/**
		* Render the version embedded by the client build; partial builds without metadata omit the row.
		* @param props - runtime share and localized copy.
		* @returns the current release label, or nothing when build metadata is absent.
		*/
		function CurrentVersionRow({ t }) {
			return (0, react_jsx_runtime.jsx)("div", {
				className: CurrentVersionRow_module_css_default.row,
				children: t("general.currentVersion", { version: "0.2.1-rc.3" })
			});
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-settings-general/src/client/DeveloperToolsRow.module.css.mjs
		const css$2 = ".GhSc5W_row{border-bottom:.5px solid var(--dsw-alias-border-l2);justify-content:space-between;align-items:center;gap:24px;padding:16px 0;display:flex}.GhSc5W_title{font-size:14px;line-height:20px}.GhSc5W_description{color:var(--dsw-alias-label-secondary);margin-top:4px;font-size:12px;line-height:18px}";
		const tagId$2 = "@deepseek-ai/dsh-client-ui-settings-general/DeveloperToolsRow.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$2) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-settings-general";
			tag.dataset.pluginCss = tagId$2;
			tag.textContent = css$2;
			document.head.appendChild(tag);
		}
		var DeveloperToolsRow_module_css_default = {
			"description": "GhSc5W_description",
			"row": "GhSc5W_row",
			"title": "GhSc5W_title"
		};
		//#endregion
		//#region lib/types/client/DeveloperToolsRow.js
		/** General Settings control for shared developer-tool visibility and previews. */
		/**
		* Render the developer-tool toggle.
		* @param props - accepted preference, writer and localized copy.
		* @returns the General Settings row.
		*/
		function DeveloperToolsRow({ useDeveloperTools, setEnabled, t }) {
			const enabled = useDeveloperTools((value) => value);
			const [busy, setBusy] = (0, react.useState)(false);
			const [failed, setFailed] = (0, react.useState)(false);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: DeveloperToolsRow_module_css_default.row,
				children: [(0, react_jsx_runtime.jsxs)("div", { children: [
					(0, react_jsx_runtime.jsx)("div", {
						className: DeveloperToolsRow_module_css_default.title,
						children: t("developerTools.title")
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: DeveloperToolsRow_module_css_default.description,
						children: t("developerTools.description")
					}),
					failed && (0, react_jsx_runtime.jsx)("div", {
						role: "alert",
						children: t("developerTools.error")
					})
				] }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
					checked: enabled,
					disabled: busy,
					label: t("developerTools.title"),
					onChange: (next) => {
						setFailed(false);
						setBusy(true);
						setEnabled(next).catch(() => {
							setFailed(true);
						}).finally(() => {
							setBusy(false);
						});
					}
				})]
			});
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-settings-general/src/client/SettingsDocumentAction.module.css.mjs
		const css$1 = ".xjwTKG_action{align-items:center;gap:8px;min-width:0;display:flex}.xjwTKG_error{max-width:180px;color:var(--dsw-alias-state-error-primary);text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:18px;overflow:hidden}";
		const tagId$1 = "@deepseek-ai/dsh-client-ui-settings-general/SettingsDocumentAction.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-settings-general";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var SettingsDocumentAction_module_css_default = {
			"action": "xjwTKG_action",
			"error": "xjwTKG_error"
		};
		//#endregion
		//#region lib/types/client/SettingsDocumentAction.js
		/** Optional settings-header action for opening a file-backed Host document. */
		/**
		* Render the open-document action only after Host metadata confirms document availability.
		* @param props - header owner props, localized copy, and injected document state.
		* @returns the action, or null while unavailable or unresolved.
		*/
		function SettingsDocumentAction({ controller, useSnapshot, t }) {
			const state = useSnapshot((snapshot) => snapshot);
			(0, react.useEffect)(() => {
				controller.load();
			}, [controller]);
			if (state.status !== "ready") return null;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: SettingsDocumentAction_module_css_default.action,
				children: [state.error === null ? null : (0, react_jsx_runtime.jsx)("span", {
					className: SettingsDocumentAction_module_css_default.error,
					role: "alert",
					children: t("openDocument.error")
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "outline",
					size: "sm",
					disabled: state.opening,
					onClick: () => {
						controller.open();
					},
					children: t("openDocument")
				})]
			});
		}
		//#endregion
		//#region lib/types/client/settings-document-store.js
		/** State owner for the optional local settings-document action. */
		/** Derives local-document availability from the shared mirror and invokes the pathless Host-owned open operation. */
		var SettingsDocumentStore = class {
			ctx;
			describeFace;
			/** uSES-safe state source shared by the registered header action. */
			store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({
				status: "idle",
				opening: false,
				error: null
			});
			following;
			/**
			* @param ctx - the plugin's context, whose loopback `remote.settings`
			* namespace opens the provider document.
			* @param describeFace - the shared mirror's describe face (`hasDocument` source).
			*/
			constructor(ctx, describeFace) {
				this.ctx = ctx;
				this.describeFace = describeFace;
			}
			/**
			* Begin following the mirror (idempotent) and reflect whether the current
			* provider owns a local document.
			* @returns settlement once the snapshot reflects the mirror.
			*/
			async load() {
				this.following ??= this.describeFace.subscribe(() => {
					this.derive();
				});
				this.store.update((state) => {
					state.status = "loading";
					state.error = null;
				});
				await this.describeFace.ensure();
				this.derive();
			}
			/**
			* Open the loaded document once; concurrent gestures collapse behind the in-flight action.
			* @returns after the native-open request settles, or immediately when unavailable/already opening.
			*/
			async open() {
				const current = this.store.getSnapshot();
				if (current.status !== "ready" || current.opening) return;
				this.store.update((state) => {
					state.opening = true;
					state.error = null;
				});
				try {
					const result = await this.ctx.remote.settings.openSettingsDocument();
					if (!result.ok) {
						const { message } = result.error;
						this.store.update((state) => {
							state.error = message;
						});
					}
				} finally {
					this.store.update((state) => {
						state.opening = false;
					});
				}
			}
			/** Stop following the mirror. */
			dispose() {
				this.following?.();
				this.following = void 0;
			}
			derive() {
				const mirrored = this.describeFace.getSnapshot();
				if (mirrored.view === void 0) {
					if (mirrored.error !== null) this.store.update((state) => {
						state.status = "unavailable";
						state.error = mirrored.error;
					});
					return;
				}
				const { hasDocument } = mirrored.view;
				this.store.update((state) => {
					state.status = hasDocument ? "ready" : "unavailable";
					state.error = null;
				});
			}
		};
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-settings-general/src/client/HostReleasePrompt.module.css.mjs
		const css = ".ITOpsW_dialog{width:min(480px,100%)}.ITOpsW_transitions{grid-template-columns:max-content minmax(0,max-content) 56px minmax(0,max-content);justify-content:start;align-items:center;gap:8px 12px;font-size:13px;line-height:20px;display:grid}.ITOpsW_label{color:var(--dsw-alias-label-secondary)}.ITOpsW_release{font-family:var(--ds-font-family-code);overflow-wrap:anywhere}.ITOpsW_solid{color:var(--dsw-alias-label-primary)}.ITOpsW_faded{color:var(--dsw-alias-label-tertiary)}.ITOpsW_line{border-top-width:1px;height:0;position:relative}.ITOpsW_line:after{content:\"\";border-top:3px solid #0000;border-bottom:3px solid #0000;border-left:5px solid;position:absolute;top:-3.5px;right:-1px}.ITOpsW_done{border-top-style:solid;border-top-color:var(--dsw-alias-state-success-primary);color:var(--dsw-alias-state-success-primary)}.ITOpsW_pending{border-top-style:dashed;border-top-color:var(--dsw-alias-label-tertiary);color:var(--dsw-alias-label-tertiary)}";
		const tagId = "@deepseek-ai/dsh-client-ui-settings-general/HostReleasePrompt.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-settings-general";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var HostReleasePrompt_module_css_default = {
			"dialog": "ITOpsW_dialog",
			"done": "ITOpsW_done",
			"faded": "ITOpsW_faded",
			"label": "ITOpsW_label",
			"line": "ITOpsW_line",
			"pending": "ITOpsW_pending",
			"release": "ITOpsW_release",
			"solid": "ITOpsW_solid",
			"transitions": "ITOpsW_transitions"
		};
		//#endregion
		//#region lib/types/client/HostReleasePrompt.js
		/** Confirmation shown when this page reconnects to a Host running another release. */
		/**
		* Name both ends of one release transition: their versions when those differ, otherwise their commits.
		* @param from - release the transition starts at.
		* @param to - release the transition ends at.
		* @param unknown - text for a release or field the Host did not publish.
		* @returns the start and end text.
		*/
		function transitionText(from, to, unknown) {
			const field = from?.version !== to?.version ? "version" : "commit";
			return [from?.[field] ?? unknown, to?.[field] ?? unknown];
		}
		/**
		* One labelled transition line. A completed transition fades its start; a pending one fades its end.
		* @param props - row label, both ends, and completion.
		* @returns the row's cells for the shared transition grid.
		*/
		function Transition({ label, from, to, done }) {
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsx)("span", {
					className: HostReleasePrompt_module_css_default.label,
					children: label
				}),
				(0, react_jsx_runtime.jsx)("span", {
					className: clsx(HostReleasePrompt_module_css_default.release, done ? HostReleasePrompt_module_css_default.faded : HostReleasePrompt_module_css_default.solid),
					children: from
				}),
				(0, react_jsx_runtime.jsx)("span", {
					"aria-hidden": "true",
					className: clsx(HostReleasePrompt_module_css_default.line, done ? HostReleasePrompt_module_css_default.done : HostReleasePrompt_module_css_default.pending)
				}),
				(0, react_jsx_runtime.jsx)("span", {
					className: clsx(HostReleasePrompt_module_css_default.release, done ? HostReleasePrompt_module_css_default.solid : HostReleasePrompt_module_css_default.faded),
					children: to
				})
			] });
		}
		/**
		* Ask whether to reload after the Host changed releases; closing the dialog keeps the page.
		* The service line shows the Host's completed switch from its previous release; the page line shows the
		* switch from the page's boot release that only a reload completes.
		* @param props - the release change, both decisions, and localized copy.
		* @returns the dialog while a change is announced; otherwise nothing.
		*/
		function HostReleasePrompt({ useReleaseChange, dismissRelease, reloadPage, t }) {
			const change = useReleaseChange((value) => value);
			if (change === void 0) return null;
			const unknown = t("hostRelease.unknown");
			const [serviceFrom, serviceTo] = transitionText(change.previous, change.host, unknown);
			const [pageFrom, pageTo] = transitionText(change.page, change.host, unknown);
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open: true,
				title: t("hostRelease.title"),
				description: t("hostRelease.description"),
				closeLabel: t("hostRelease.later"),
				onClose: dismissRelease,
				className: clsx(HostReleasePrompt_module_css_default.dialog),
				footer: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "outline",
					"data-modal-autofocus": true,
					onClick: dismissRelease,
					children: t("hostRelease.later")
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "primary",
					onClick: reloadPage,
					children: t("hostRelease.reload")
				})] }),
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: HostReleasePrompt_module_css_default.transitions,
					children: [(0, react_jsx_runtime.jsx)(Transition, {
						label: t("hostRelease.service"),
						from: serviceFrom,
						to: serviceTo,
						done: true
					}), (0, react_jsx_runtime.jsx)(Transition, {
						label: t("hostRelease.page"),
						from: pageFrom,
						to: pageTo,
						done: false
					})]
				})
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** Shell chrome and General-nav dictionaries; feature rows own their copy. */
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"trigger": "设置",
			"shortcut.open": "打开设置",
			"desktop.update.available": "新版本",
			"desktop.update.checking": "正在检查更新…",
			"desktop.update.progress": "{percent}%",
			"desktop.update.verifying": "正在校验更新文件…",
			"desktop.update.installing": "正在准备重启…",
			"desktop.update.ready": "安装并重启",
			"desktop.update.retry": "重试更新",
			"desktop.update.versionDetail": "{label}：{version}",
			"desktop.update.downloadDetail": "正在下载更新：{percent}%\n目标版本：{version}",
			"desktop.update.checkFailed": "检查更新失败，请稍后重试。",
			"desktop.update.downloadFailed": "下载更新失败，请重试。",
			"desktop.update.installFailed": "安装更新失败，请稍后重试。",
			"desktop.update.checkNetworkFailed": "检查更新失败，请检查网络连接后重试。",
			"desktop.update.downloadNetworkFailed": "下载更新失败，请检查网络连接后重试。",
			"desktop.update.installNetworkFailed": "安装更新失败，请检查网络连接后重试。",
			"desktop.update.fullscreenTimeout": "无法退出全屏，请退出全屏后重试更新",
			"desktop.update.stopFailed": "未能安全停止任务，更新尚未安装，请稍后重试。",
			"desktop.update.tasksChanged": "有新任务开始运行，请重新确认是否停止任务并更新。",
			"desktop.update.tasksUnavailable": "无法确认任务状态，请在工作区就绪后重试更新。",
			"title": "设置",
			"close": "关闭",
			"openDocument": "打开配置文件",
			"openDocument.error": "无法打开配置文件",
			"general.nav": "通用设置",
			"general.currentVersion": "当前版本：{version}",
			"developerTools.title": "显示代码工作视图",
			"developerTools.error": "保存失败，请重试",
			"developerTools.description": "开启后，显示轨迹、本轮代码差异，可选择完整的 Agent 预设切换",
			"connection.error": "连接异常，刷新重试",
			"connection.connecting": "重新连接中",
			"connection.connected": "连接成功",
			"connection.reconnect": "连接异常，点击立即重连",
			"connection.restart": "连接中断，正在重试，点击立即重连",
			"hostRelease.title": "服务版本变化",
			"hostRelease.description": "服务版本已变化，本页面已暂停热更新，刷新后加载新版本。",
			"hostRelease.service": "服务",
			"hostRelease.page": "页面",
			"hostRelease.unknown": "未解析",
			"hostRelease.reload": "刷新以加载新版本",
			"hostRelease.later": "暂不刷新"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"trigger": "Settings",
			"shortcut.open": "Open settings",
			"desktop.update.available": "Update",
			"desktop.update.checking": "Checking for updates…",
			"desktop.update.progress": "{percent}%",
			"desktop.update.verifying": "Verifying update files…",
			"desktop.update.installing": "Preparing to restart…",
			"desktop.update.ready": "Install and Restart",
			"desktop.update.retry": "Retry update",
			"desktop.update.versionDetail": "{label}: {version}",
			"desktop.update.downloadDetail": "Downloading update: {percent}%\nTarget version: {version}",
			"desktop.update.checkFailed": "Could not check for updates. Please try again later.",
			"desktop.update.downloadFailed": "Could not download the update. Please try again.",
			"desktop.update.installFailed": "Could not install the update. Please try again later.",
			"desktop.update.checkNetworkFailed": "Could not check for updates. Check your connection and try again.",
			"desktop.update.downloadNetworkFailed": "Could not download the update. Check your connection and try again.",
			"desktop.update.installNetworkFailed": "Could not install the update. Check your connection and try again.",
			"desktop.update.fullscreenTimeout": "Could not exit fullscreen. Exit fullscreen, then retry the update.",
			"desktop.update.stopFailed": "Could not safely stop the tasks. The update has not been installed. Please try again later.",
			"desktop.update.tasksChanged": "New tasks have started. Confirm again to stop the tasks and update.",
			"desktop.update.tasksUnavailable": "Task status is unavailable. Try updating again when the workspace is ready.",
			"title": "Settings",
			"close": "Close",
			"openDocument": "Open configuration file",
			"openDocument.error": "Could not open configuration file",
			"general.nav": "General",
			"general.currentVersion": "Current version: {version}",
			"developerTools.title": "Show coding view",
			"developerTools.error": "Could not save. Please try again.",
			"developerTools.description": "Shows trajectory, code diffs, and all Agent presets",
			"connection.error": "Disconnected",
			"connection.connecting": "Reconnecting",
			"connection.connected": "Connected",
			"connection.reconnect": "Disconnected, reconnect now",
			"connection.restart": "Reconnecting, reconnect now",
			"hostRelease.title": "Service version changed",
			"hostRelease.description": "The service version changed. This page paused live updates; reload to load the new version.",
			"hostRelease.service": "Service",
			"hostRelease.page": "Page",
			"hostRelease.unknown": "Unknown",
			"hostRelease.reload": "Reload to load the new version",
			"hostRelease.later": "Not now"
		};
		/** Japanese copy, checked against the English keys. */
		const ja = {
			"trigger": "設定",
			"shortcut.open": "設定を開く",
			"desktop.update.available": "更新",
			"desktop.update.checking": "更新を確認中…",
			"desktop.update.progress": "{percent}%",
			"desktop.update.verifying": "更新ファイルを検証中…",
			"desktop.update.installing": "再起動の準備中…",
			"desktop.update.ready": "インストールして再起動",
			"desktop.update.retry": "更新を再試行",
			"desktop.update.versionDetail": "{label}: {version}",
			"desktop.update.downloadDetail": "更新をダウンロード中: {percent}%\n対象バージョン: {version}",
			"desktop.update.checkFailed": "更新を確認できませんでした。しばらくしてから再試行してください。",
			"desktop.update.downloadFailed": "更新をダウンロードできませんでした。再試行してください。",
			"desktop.update.installFailed": "更新をインストールできませんでした。しばらくしてから再試行してください。",
			"desktop.update.checkNetworkFailed": "更新を確認できませんでした。接続を確認して再試行してください。",
			"desktop.update.downloadNetworkFailed": "更新をダウンロードできませんでした。接続を確認して再試行してください。",
			"desktop.update.installNetworkFailed": "更新をインストールできませんでした。接続を確認して再試行してください。",
			"desktop.update.fullscreenTimeout": "全画面表示を終了できませんでした。全画面表示を終了してから更新を再試行してください。",
			"desktop.update.stopFailed": "タスクを安全に停止できませんでした。更新はインストールされていません。しばらくしてから再試行してください。",
			"desktop.update.tasksChanged": "新しいタスクが開始されました。タスクを停止して更新するには、もう一度確認してください。",
			"desktop.update.tasksUnavailable": "タスクの状態を取得できません。ワークスペースの準備ができてから更新を再試行してください。",
			"title": "設定",
			"close": "閉じる",
			"openDocument": "設定ファイルを開く",
			"openDocument.error": "設定ファイルを開けませんでした",
			"general.nav": "一般",
			"general.currentVersion": "現在のバージョン: {version}",
			"developerTools.title": "コーディングビューを表示",
			"developerTools.error": "保存できませんでした。再試行してください。",
			"developerTools.description": "軌跡、コード差分、すべてのエージェントプリセットを表示します",
			"connection.error": "切断済み",
			"connection.connecting": "再接続中",
			"connection.connected": "接続済み",
			"connection.reconnect": "切断されました。今すぐ再接続",
			"connection.restart": "再接続中、今すぐ再接続",
			"hostRelease.title": "サービスのバージョンが変更されました",
			"hostRelease.description": "サービスのバージョンが変更されました。このページのライブ更新は停止しています。再読み込みして新しいバージョンを読み込んでください。",
			"hostRelease.service": "サービス",
			"hostRelease.page": "ページ",
			"hostRelease.unknown": "不明",
			"hostRelease.reload": "再読み込みして新しいバージョンを読み込む",
			"hostRelease.later": "後で"
		};
		/** Spanish dictionary, checked against the English keys. */
		const es = {
			"trigger": "Configuración",
			"shortcut.open": "Abrir configuración",
			"desktop.update.available": "Actualizar",
			"desktop.update.checking": "Buscando actualizaciones...",
			"desktop.update.progress": "{percent}%",
			"desktop.update.verifying": "Verificando archivos de actualización...",
			"desktop.update.installing": "Preparándose para reiniciar…",
			"desktop.update.ready": "Instalar y reiniciar",
			"desktop.update.retry": "Reintentar actualización",
			"desktop.update.versionDetail": "{label}: {version}",
			"desktop.update.downloadDetail": "Descargando la actualización: {percent}%\nVersión de destino: {version}",
			"desktop.update.checkFailed": "No se pudo buscar actualizaciones. Inténtelo de nuevo más tarde.",
			"desktop.update.downloadFailed": "No se pudo descargar la actualización. Por favor inténtalo de nuevo.",
			"desktop.update.installFailed": "No se pudo instalar la actualización. Inténtelo de nuevo más tarde.",
			"desktop.update.checkNetworkFailed": "No se pudo buscar actualizaciones. Comprueba tu conexión y vuelve a intentarlo.",
			"desktop.update.downloadNetworkFailed": "No se pudo descargar la actualización. Comprueba tu conexión y vuelve a intentarlo.",
			"desktop.update.installNetworkFailed": "No se pudo instalar la actualización. Comprueba tu conexión y vuelve a intentarlo.",
			"desktop.update.fullscreenTimeout": "No se pudo salir de la pantalla completa. Salga de la pantalla completa y luego vuelva a intentar la actualización.",
			"desktop.update.stopFailed": "No se pudieron detener las tareas de forma segura. La actualización no se ha instalado. Inténtelo de nuevo más tarde.",
			"desktop.update.tasksChanged": "Han comenzado nuevas tareas. Confirme nuevamente para detener las tareas y actualizar.",
			"desktop.update.tasksUnavailable": "El estado de la tarea no está disponible. Intente actualizar nuevamente cuando el espacio de trabajo esté listo.",
			"title": "Configuración",
			"close": "Cerrar",
			"openDocument": "Abrir archivo de configuración",
			"openDocument.error": "No se pudo abrir el archivo de configuración",
			"general.nav": "General",
			"general.currentVersion": "Versión actual: {version}",
			"developerTools.title": "Mostrar vista de codificación",
			"developerTools.error": "No se pudo guardar. Por favor inténtalo de nuevo.",
			"developerTools.description": "Muestra la trayectoria, las diferencias de código y todos los ajustes preestablecidos del agente.",
			"connection.error": "desconectado",
			"connection.connecting": "Reconectando",
			"connection.connected": "Conectado",
			"connection.reconnect": "Desconectado, vuelve a conectarte ahora",
			"connection.restart": "Reconectándonos, reconectándonos ahora",
			"hostRelease.title": "La versión del servicio cambió",
			"hostRelease.description": "La versión del servicio cambió. Esta página detuvo las actualizaciones en vivo; recargar para cargar la nueva versión.",
			"hostRelease.service": "Servicio",
			"hostRelease.page": "Página",
			"hostRelease.unknown": "Desconocido",
			"hostRelease.reload": "Recargar para cargar la nueva versión.",
			"hostRelease.later": "Ahora no"
		};
		/** French dictionary, checked against the English keys. */
		const fr = {
			"trigger": "Paramètres",
			"shortcut.open": "Ouvrir les paramètres",
			"desktop.update.available": "Mise à jour",
			"desktop.update.checking": "Vérification des mises à jour…",
			"desktop.update.progress": "{percent}%",
			"desktop.update.verifying": "Vérification des fichiers de mise à jour…",
			"desktop.update.installing": "Préparation du redémarrage…",
			"desktop.update.ready": "Installer et redémarrer",
			"desktop.update.retry": "Réessayez la mise à jour",
			"desktop.update.versionDetail": "{label}\xA0: {version}",
			"desktop.update.downloadDetail": "Téléchargement de la mise à jour\xA0: {percent}%\nVersion cible\xA0: {version}",
			"desktop.update.checkFailed": "Impossible de vérifier les mises à jour. Veuillez réessayer plus tard.",
			"desktop.update.downloadFailed": "Impossible de télécharger la mise à jour. Veuillez réessayer.",
			"desktop.update.installFailed": "Impossible d'installer la mise à jour. Veuillez réessayer plus tard.",
			"desktop.update.checkNetworkFailed": "Impossible de vérifier les mises à jour. Vérifiez votre connexion et réessayez.",
			"desktop.update.downloadNetworkFailed": "Impossible de télécharger la mise à jour. Vérifiez votre connexion et réessayez.",
			"desktop.update.installNetworkFailed": "Impossible d'installer la mise à jour. Vérifiez votre connexion et réessayez.",
			"desktop.update.fullscreenTimeout": "Impossible de quitter le mode plein écran. Quittez le mode plein écran, puis réessayez la mise à jour.",
			"desktop.update.stopFailed": "Impossible d'arrêter les tâches en toute sécurité. La mise à jour n'a pas été installée. Veuillez réessayer plus tard.",
			"desktop.update.tasksChanged": "De nouvelles tâches ont commencé. Confirmez à nouveau pour arrêter les tâches et mettre à jour.",
			"desktop.update.tasksUnavailable": "L'état de la tâche n'est pas disponible. Essayez à nouveau de mettre à jour lorsque l'espace de travail est prêt.",
			"title": "Paramètres",
			"close": "Fermer",
			"openDocument": "Ouvrir le fichier de configuration",
			"openDocument.error": "Impossible d'ouvrir le fichier de configuration",
			"general.nav": "Général",
			"general.currentVersion": "Version actuelle\xA0: {version}",
			"developerTools.title": "Afficher la vue de codage",
			"developerTools.error": "Impossible d'enregistrer. Veuillez réessayer.",
			"developerTools.description": "Affiche la trajectoire, les différences de code et tous les préréglages d'agent",
			"connection.error": "Déconnecté",
			"connection.connecting": "Reconnexion",
			"connection.connected": "Connecté",
			"connection.reconnect": "Déconnecté, reconnectez-vous maintenant",
			"connection.restart": "Reconnexion, reconnectez-vous maintenant",
			"hostRelease.title": "La version du service a été modifiée",
			"hostRelease.description": "La version du service a changé. Cette page a suspendu les mises à jour en direct\xA0; recharger pour charger la nouvelle version.",
			"hostRelease.service": "Service",
			"hostRelease.page": "Pages",
			"hostRelease.unknown": "Inconnu",
			"hostRelease.reload": "Recharger pour charger la nouvelle version",
			"hostRelease.later": "Pas maintenant"
		};
		/** German dictionary, checked against the English keys. */
		const de = {
			"trigger": "Einstellungen",
			"shortcut.open": "Einstellungen öffnen",
			"desktop.update.available": "Aktualisieren",
			"desktop.update.checking": "Suche nach Updates…",
			"desktop.update.progress": "{percent}%",
			"desktop.update.verifying": "Aktualisierungsdateien werden überprüft…",
			"desktop.update.installing": "Neustart wird vorbereitet…",
			"desktop.update.ready": "Installieren und neu starten",
			"desktop.update.retry": "Update erneut versuchen",
			"desktop.update.versionDetail": "{label}: {version}",
			"desktop.update.downloadDetail": "Update wird heruntergeladen: {percent}%\nZielversion: {version}",
			"desktop.update.checkFailed": "Es konnte nicht nach Updates gesucht werden. Bitte versuchen Sie es später noch einmal.",
			"desktop.update.downloadFailed": "Das Update konnte nicht heruntergeladen werden. Bitte versuchen Sie es erneut.",
			"desktop.update.installFailed": "Das Update konnte nicht installiert werden. Bitte versuchen Sie es später noch einmal.",
			"desktop.update.checkNetworkFailed": "Es konnte nicht nach Updates gesucht werden. Überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
			"desktop.update.downloadNetworkFailed": "Das Update konnte nicht heruntergeladen werden. Überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
			"desktop.update.installNetworkFailed": "Das Update konnte nicht installiert werden. Überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
			"desktop.update.fullscreenTimeout": "Der Vollbildmodus konnte nicht beendet werden. Beenden Sie den Vollbildmodus und versuchen Sie dann erneut, das Update durchzuführen.",
			"desktop.update.stopFailed": "Die Aufgaben konnten nicht sicher gestoppt werden. Das Update wurde nicht installiert. Bitte versuchen Sie es später noch einmal.",
			"desktop.update.tasksChanged": "Neue Aufgaben haben begonnen. Bestätigen Sie erneut, um die Aufgaben zu stoppen und zu aktualisieren.",
			"desktop.update.tasksUnavailable": "Der Aufgabenstatus ist nicht verfügbar. Versuchen Sie erneut, die Aktualisierung durchzuführen, wenn der Arbeitsbereich bereit ist.",
			"title": "Einstellungen",
			"close": "Schließen",
			"openDocument": "Konfigurationsdatei öffnen",
			"openDocument.error": "Die Konfigurationsdatei konnte nicht geöffnet werden",
			"general.nav": "Allgemein",
			"general.currentVersion": "Aktuelle Version: {version}",
			"developerTools.title": "Codieransicht anzeigen",
			"developerTools.error": "Konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.",
			"developerTools.description": "Zeigt Ausführungsverlauf, Codeunterschiede und alle Agentenvoreinstellungen an",
			"connection.error": "Nicht verbunden",
			"connection.connecting": "Wieder verbinden",
			"connection.connected": "Verbunden",
			"connection.reconnect": "Verbindung getrennt, jetzt erneut verbinden",
			"connection.restart": "Verbindung wiederherstellen, jetzt erneut verbinden",
			"hostRelease.title": "Dienstversion geändert",
			"hostRelease.description": "Die Dienstversion hat sich geändert. Diese Seite hat Live-Updates angehalten. Neu laden, um die neue Version zu laden.",
			"hostRelease.service": "Service",
			"hostRelease.page": "Seite",
			"hostRelease.unknown": "Unbekannt",
			"hostRelease.reload": "Neu laden, um die neue Version zu laden",
			"hostRelease.later": "Nicht jetzt"
		};
		/** Russian dictionary, checked against the English keys. */
		const ru = {
			"trigger": "Настройки",
			"shortcut.open": "Открыть настройки",
			"desktop.update.available": "Обновить",
			"desktop.update.checking": "Проверка обновлений…",
			"desktop.update.progress": "{percent}%",
			"desktop.update.verifying": "Проверка файлов обновлений…",
			"desktop.update.installing": "Подготовка к перезапуску…",
			"desktop.update.ready": "Установить и перезапустить",
			"desktop.update.retry": "Повторить обновление",
			"desktop.update.versionDetail": "{label}: {version}",
			"desktop.update.downloadDetail": "Загрузка обновления: {percent}%\n Целевая версия: {version}",
			"desktop.update.checkFailed": "Не удалось проверить наличие обновлений. Пожалуйста, повторите попытку позже.",
			"desktop.update.downloadFailed": "Не удалось загрузить обновление. Пожалуйста, попробуйте еще раз.",
			"desktop.update.installFailed": "Не удалось установить обновление. Пожалуйста, повторите попытку позже.",
			"desktop.update.checkNetworkFailed": "Не удалось проверить наличие обновлений. Проверьте подключение и повторите попытку.",
			"desktop.update.downloadNetworkFailed": "Не удалось загрузить обновление. Проверьте подключение и повторите попытку.",
			"desktop.update.installNetworkFailed": "Не удалось установить обновление. Проверьте подключение и повторите попытку.",
			"desktop.update.fullscreenTimeout": "Не удалось выйти из полноэкранного режима. Выйдите из полноэкранного режима и повторите попытку обновления.",
			"desktop.update.stopFailed": "Не удалось безопасно остановить задачи. Обновление не установлено. Пожалуйста, повторите попытку позже.",
			"desktop.update.tasksChanged": "Начались новые задачи. Подтвердите еще раз, чтобы остановить выполнение задач и выполнить обновление.",
			"desktop.update.tasksUnavailable": "Статус задачи недоступен. Попробуйте обновить еще раз, когда рабочая область будет готова.",
			"title": "Настройки",
			"close": "Закрыть",
			"openDocument": "Открыть файл конфигурации",
			"openDocument.error": "Не удалось открыть файл конфигурации",
			"general.nav": "Общие",
			"general.currentVersion": "Текущая версия: {version}.",
			"developerTools.title": "Показать представление кодирования",
			"developerTools.error": "Не удалось сохранить. Пожалуйста, попробуйте еще раз.",
			"developerTools.description": "Показывает траекторию, различия в коде и все настройки агента.",
			"connection.error": "Отключено",
			"connection.connecting": "Повторное подключение",
			"connection.connected": "Подключено",
			"connection.reconnect": "Соединение отключено, подключитесь снова сейчас",
			"connection.restart": "Повторное подключение, повторное подключение сейчас",
			"hostRelease.title": "Версия сервиса изменена",
			"hostRelease.description": "Версия сервиса изменилась. На этой странице приостановлены текущие обновления; перезагрузите, чтобы загрузить новую версию.",
			"hostRelease.service": "Сервис",
			"hostRelease.page": "Страница",
			"hostRelease.unknown": "Неизвестно",
			"hostRelease.reload": "Перезагрузите, чтобы загрузить новую версию",
			"hostRelease.later": "Не сейчас"
		};
		/** Portuguese dictionary, checked against the English keys. */
		const pt = {
			"trigger": "Configurações",
			"shortcut.open": "Abrir configurações",
			"desktop.update.available": "Atualizar",
			"desktop.update.checking": "Verificando atualizações…",
			"desktop.update.progress": "{percent}%",
			"desktop.update.verifying": "Verificando arquivos de atualização…",
			"desktop.update.installing": "Preparando para reiniciar…",
			"desktop.update.ready": "Instalar e reiniciar",
			"desktop.update.retry": "Tentar atualizar novamente",
			"desktop.update.versionDetail": "{label}: {version}",
			"desktop.update.downloadDetail": "Fazendo download da atualização: {percent}%\nVersão de destino: {version}",
			"desktop.update.checkFailed": "Não foi possível verificar se há atualizações. Por favor, tente novamente mais tarde.",
			"desktop.update.downloadFailed": "Não foi possível baixar a atualização. Por favor, tente novamente.",
			"desktop.update.installFailed": "Não foi possível instalar a atualização. Por favor, tente novamente mais tarde.",
			"desktop.update.checkNetworkFailed": "Não foi possível verificar se há atualizações. Verifique sua conexão e tente novamente.",
			"desktop.update.downloadNetworkFailed": "Não foi possível baixar a atualização. Verifique sua conexão e tente novamente.",
			"desktop.update.installNetworkFailed": "Não foi possível instalar a atualização. Verifique sua conexão e tente novamente.",
			"desktop.update.fullscreenTimeout": "Não foi possível sair da tela cheia. Saia da tela inteira e tente atualizar novamente.",
			"desktop.update.stopFailed": "Não foi possível interromper as tarefas com segurança. A atualização não foi instalada. Por favor, tente novamente mais tarde.",
			"desktop.update.tasksChanged": "Novas tarefas foram iniciadas. Confirme novamente para interromper as tarefas e atualizar.",
			"desktop.update.tasksUnavailable": "O status da tarefa não está disponível. Tente atualizar novamente quando o espaço de trabalho estiver pronto.",
			"title": "Configurações",
			"close": "Fechar",
			"openDocument": "Abra o arquivo de configuração",
			"openDocument.error": "Não foi possível abrir o arquivo de configuração",
			"general.nav": "Geral",
			"general.currentVersion": "Versão atual: {version}",
			"developerTools.title": "Mostrar visualização de codificação",
			"developerTools.error": "Não foi possível salvar. Por favor, tente novamente.",
			"developerTools.description": "Mostra trajetória, diferenças de código e todas as predefinições do agente",
			"connection.error": "Desconectado",
			"connection.connecting": "Reconectando",
			"connection.connected": "Conectado",
			"connection.reconnect": "Desconectado, reconecte agora",
			"connection.restart": "Reconectando, reconecte agora",
			"hostRelease.title": "Versão do serviço alterada",
			"hostRelease.description": "A versão do serviço mudou. Esta página pausou as atualizações ao vivo; reload para carregar a nova versão.",
			"hostRelease.service": "Serviço",
			"hostRelease.page": "Página",
			"hostRelease.unknown": "Desconhecido",
			"hostRelease.reload": "Recarregue para carregar a nova versão",
			"hostRelease.later": "Agora não"
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Dictionary namespace owned by this plugin (shell chrome + General copy). */
		const NS = "settings";
		/**
		* Required services (cordis fiber inject). The target slots are declared by
		* ui-settings' apply, whose activation order relative to this one is NOT
		* constrained; registrations depend on their slots through `slots.inject()`.
		*/
		const inject = [
			"slots",
			"locale",
			"connection",
			"remote",
			"remote.settings",
			"configForms",
			"shortcuts",
			"modules",
			"remoteAccess"
		];
		/**
		* Register the `settings` dictionaries, the chrome content, and the General
		* section, each once its slot declaration is on the ledger.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "developer-tools",
				order: 15,
				locale: NS,
				inject: () => ({
					hooks: { developerTools: ctx.configForms.developerTools.enabled },
					setEnabled: async (enabled) => {
						const settings = ctx.configForms.get("ui-settings");
						const previous = settings.getSnapshot().value?.enabled;
						const timestamp = Date.now();
						await ctx.configForms.developerTools.setEnabled(enabled);
						if (previous !== void 0 && previous !== enabled && settings.getSnapshot().value?.enabled === enabled) ctx.get("productAnalytics")?.track("code_work_view_toggle", { is_enabled: enabled }, timestamp);
					}
				})
			}, DeveloperToolsRow));
			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "current-version",
				order: 100,
				locale: NS
			}, CurrentVersionRow));
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}), "ui-settings-general: dictionaries");
			const connection = ctx.get("connection");
			const carrier = globalThis.dshDesktop;
			const desktopUpdate = new DesktopUpdateSource(carrier?.protocolVersion === 1 ? carrier.updates : void 0);
			ctx.effect(() => () => {
				desktopUpdate.dispose();
			}, "ui-settings-general: desktop update carrier");
			ctx.slots.inject("sidebar.toggle.badge", () => ctx.slots.register({
				name: "sidebar.toggle.badge",
				locale: NS,
				inject: () => ({ hooks: {
					desktopUpdate: desktopUpdate.store,
					connectionState: connection.state
				} })
			}, DesktopUpdateBadge));
			const t = ctx.locale.bind(NS);
			const documentController = ctx.remote.$host.isLoopback ? new SettingsDocumentStore(ctx, ctx.configForms.describe()) : void 0;
			const documentInjected = documentController === void 0 ? void 0 : () => ({
				controller: documentController,
				hooks: { snapshot: documentController.store }
			});
			ctx.effect(() => () => {
				documentController?.dispose();
			}, "ui-settings-general: document action directory");
			let rowsVersion = -1;
			let rowsRevision = -1;
			let rows = [];
			let onboardingVersion = -1;
			let onboardingSteps = [];
			const shellInjected = () => ({
				openDesktopUpdate: () => {
					desktopUpdate.open();
				},
				reconnect: () => {
					connection.reconnect();
				},
				hooks: {
					shortcuts: ctx.shortcuts.catalog,
					desktopUpdate: desktopUpdate.store,
					connectionState: connection.state,
					sections: {
						getSnapshot: () => {
							const version = ctx.slots.getVersion("settings.section");
							const revision = ctx.locale.getSnapshot().revision;
							if (version !== rowsVersion || revision !== rowsRevision) {
								rowsVersion = version;
								rowsRevision = revision;
								rows = ctx.slots.entries("settings.section").map((e) => ({
									/* v8 ignore next -- list-slot registration requires id (SlotCore rejects an entry without one) */
									id: e.options.id ?? "",
									order: e.options.order ?? 0,
									label: (0, _deepseek_ai_dsh_client_ui_slots.resolveSlotLabel)(e.options.label) ?? ""
								})).sort((a, b) => a.order - b.order);
							}
							return rows;
						},
						subscribe: (listener) => {
							const offLedger = ctx.slots.subscribe("settings.section", listener);
							const offLocale = ctx.locale.subscribe(listener);
							return () => {
								offLedger();
								offLocale();
							};
						}
					},
					onboardingSteps: {
						getSnapshot: () => {
							const version = ctx.slots.getVersion("settings.onboarding");
							if (version !== onboardingVersion) {
								onboardingVersion = version;
								onboardingSteps = ctx.slots.entries("settings.onboarding").map((e) => ({
									/* v8 ignore next -- list-slot registration requires id */
									id: e.options.id ?? "",
									order: e.options.order ?? 0
								})).sort((a, b) => a.order - b.order);
							}
							return onboardingSteps;
						},
						subscribe: (listener) => ctx.slots.subscribe("settings.onboarding", listener)
					}
				}
			});
			ctx.remoteAccess.whenAccess("settings/describe", () => ctx.slots.inject("sidebar.settings", () => {
				const shellHandle = createSettingsShellStore();
				const shellInstance = shellHandle.create();
				const shellStore = {
					...shellHandle,
					create: () => shellInstance
				};
				const disposeCommand = ctx.shortcuts.register({
					id: "settings.open",
					label: () => t("shortcut.open"),
					aliases: ["settings", "preferences"],
					defaults: {
						"desktop:macos": {
							code: "Comma",
							modifiers: ["primary"]
						},
						"desktop:windows": {
							code: "Comma",
							modifiers: ["primary"]
						},
						"desktop:linux": {
							code: "Comma",
							modifiers: ["primary"]
						},
						"web:macos": {
							code: "Comma",
							modifiers: ["primary", "alt"]
						},
						"web:windows": {
							code: "Comma",
							modifiers: ["primary", "alt"]
						}
					},
					regions: [
						"page",
						"editable",
						"terminal"
					],
					modals: ["settings"],
					resolve: ({ modal }) => {
						if (modal !== null && modal !== "settings") return {
							status: "blocked",
							reason: "modal"
						};
						return {
							status: "handled",
							run: () => {
								if (modal === "settings") (0, _deepseek_ai_dsh_client_ui_primitives.closeTopModal)(document);
								else shellInstance.actions.open();
							}
						};
					}
				});
				const disposeSlot = ctx.slots.register({
					name: "sidebar.settings",
					locale: NS,
					store: shellStore,
					children: {
						"settings.launcher": {
							kind: "single",
							scope: "root"
						},
						"settings.trigger": {
							kind: "single",
							scope: "root"
						},
						"settings.header": {
							kind: "single",
							scope: "root"
						},
						"settings.action": {
							kind: "list",
							scope: "root"
						},
						"settings.close": {
							kind: "single",
							scope: "root"
						},
						"settings.section": {
							kind: "list",
							scope: "root"
						},
						"settings.onboarding": {
							kind: "list",
							scope: "root"
						}
					},
					inject: shellInjected
				}, SettingsRoot);
				return () => {
					disposeCommand();
					disposeSlot();
				};
			}));
			ctx.slots.inject("settings.trigger", () => ctx.slots.register({
				name: "settings.trigger",
				locale: NS
			}, TriggerContent));
			ctx.slots.inject("settings.header", () => ctx.slots.register({
				name: "settings.header",
				locale: NS
			}, HeaderContent));
			if (documentInjected !== void 0) ctx.slots.inject("settings.action", () => ctx.slots.register({
				name: "settings.action",
				id: "open-document",
				order: 0,
				locale: NS,
				inject: documentInjected
			}, SettingsDocumentAction));
			ctx.slots.inject("settings.close", () => ctx.slots.register({
				name: "settings.close",
				locale: NS
			}, CloseLabel));
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "general",
				order: 0,
				label: () => t("general.nav"),
				locale: NS,
				children: { "settings.general.item": {
					kind: "list",
					scope: "root"
				} }
			}, GeneralSection));
			const releasePromptInjected = () => ({
				dismissRelease: () => {
					ctx.modules.entries.dismissRelease();
				},
				reloadPage: () => {
					globalThis.location.reload();
				},
				hooks: { releaseChange: ctx.modules.entries.releaseChange }
			});
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "host-release-change",
				locale: NS,
				inject: releasePromptInjected
			}, HostReleasePrompt));
		}
		//#endregion
		exports.SettingsDocumentStore = SettingsDocumentStore;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
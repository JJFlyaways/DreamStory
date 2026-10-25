window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-jobs",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let react_dom = require("react-dom");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-jobs/src/client/JobListAction.module.css.mjs
		const css = "._6xTKia_trigger{border-radius:var(--dsw-radius-sm);min-height:28px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;align-items:center;gap:3px;padding:3px 2px;font-size:12px;line-height:18px;display:inline-flex}._6xTKia_trigger:focus-visible{color:var(--dsw-alias-label-secondary)}@media (hover:hover){._6xTKia_trigger:hover{color:var(--dsw-alias-label-secondary)}}._6xTKia_trigger svg{transition:transform .12s}._6xTKia_triggerOpen{transform:rotate(180deg)}._6xTKia_triggerDot{flex:none}._6xTKia_count{margin:0 5px}._6xTKia_menu{z-index:100;box-sizing:border-box;--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);width:500px;max-width:min(560px,100vw - 32px);max-height:min(480px,100vh - 140px);box-shadow:var(--dsw-elevation-prominent);flex-direction:column;display:flex;position:fixed;overflow:hidden}._6xTKia_menuBody{flex-direction:column;gap:1px;min-height:0;margin:0;padding:4px;list-style:none;display:flex;overflow:auto}._6xTKia_sectionHeader{border-top:.5px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-tertiary);justify-content:space-between;align-items:center;margin:4px 4px 1px;padding:4px 0 3px;font-size:11px;line-height:16px;display:flex}._6xTKia_sectionHeader:first-child{border-top:0;margin-top:0}._6xTKia_sectionToggle,._6xTKia_sectionClear{border-radius:var(--dsw-radius-sm);color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;align-items:center;gap:3px;padding:2px 4px;font-size:11px;line-height:16px;display:inline-flex}._6xTKia_sectionToggle:focus-visible,._6xTKia_sectionClear:focus-visible{background:var(--dsw-alias-fill-l1);color:var(--dsw-alias-label-secondary)}@media (hover:hover){._6xTKia_sectionToggle:hover,._6xTKia_sectionClear:hover{background:var(--dsw-alias-fill-l1);color:var(--dsw-alias-label-secondary)}}._6xTKia_sectionChevron{transition:transform .12s;transform:rotate(-90deg)}._6xTKia_sectionChevronOpen{transform:none}._6xTKia_item{flex-direction:column;display:flex}._6xTKia_rowLine{align-items:stretch;gap:6px;display:flex}._6xTKia_rowLineLive{border-radius:var(--dsw-radius-md);background:var(--dsw-alias-fill-l2);padding:4px 8px 4px 2px}@media (hover:hover){._6xTKia_rowLineLive:hover{background:color-mix(in srgb, var(--dsw-alias-label-primary) 9%, transparent)}}._6xTKia_rowLineLive ._6xTKia_kind{background:var(--dsw-specific-menu)}._6xTKia_rowLine ._6xTKia_row{flex:1;min-width:0}@media (hover:hover){._6xTKia_rowLineLive ._6xTKia_row:hover{background:0 0}}._6xTKia_rowLineLive ._6xTKia_row{border-radius:var(--dsw-radius-sm)}._6xTKia_rowLineLive ._6xTKia_row:focus-visible{background:color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent)}._6xTKia_chevronBox{border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm);background:var(--dsw-specific-menu);flex:none;justify-content:center;align-self:center;align-items:center;width:20px;height:20px;display:inline-flex}._6xTKia_stop{border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm);background:var(--dsw-specific-menu);width:20px;height:20px;color:var(--dsw-alias-label-secondary);cursor:pointer;flex:none;justify-content:center;align-self:center;align-items:center;padding:0;display:inline-flex}._6xTKia_stop:focus-visible{border-color:color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, transparent);color:var(--dsw-alias-state-error-primary)}@media (hover:hover){._6xTKia_stop:hover{border-color:color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, transparent);color:var(--dsw-alias-state-error-primary)}}._6xTKia_stopArmed,._6xTKia_stopArmed:focus-visible{border-color:color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, transparent);background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent);width:auto;color:var(--dsw-alias-state-error-primary);gap:4px;padding:0 7px}@media (hover:hover){._6xTKia_stopArmed:hover{border-color:color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, transparent);background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent);width:auto;color:var(--dsw-alias-state-error-primary);gap:4px;padding:0 7px}}._6xTKia_stopLabel{white-space:nowrap;font-size:11px;line-height:18px}._6xTKia_stopFailed{color:var(--dsw-alias-state-error-primary)}._6xTKia_row{box-sizing:border-box;border-radius:var(--dsw-radius-md);width:100%;min-height:28px;color:var(--dsw-alias-label-primary);text-align:left;cursor:pointer;background:0 0;border:0;align-items:center;gap:6px;padding:4px 7px;font-size:12px;line-height:17px;display:flex}._6xTKia_row:focus-visible{background:var(--dsw-alias-fill-l1)}@media (hover:hover){._6xTKia_row:hover{background:var(--dsw-alias-fill-l1)}}._6xTKia_rowStatic{cursor:default}@media (hover:hover){._6xTKia_rowStatic:hover{background:0 0}}._6xTKia_rowSettled{color:var(--dsw-alias-label-tertiary)}._6xTKia_row ._6xTKia_rowDot{flex:none}._6xTKia_main{flex-direction:column;flex:1;gap:2px;min-width:0;display:flex}._6xTKia_primary{align-items:baseline;gap:8px;min-width:0;display:flex}._6xTKia_secondary{align-items:center;gap:6px;min-width:0;display:flex}._6xTKia_kind{border-radius:var(--dsw-radius-xs);background:var(--dsw-alias-fill-l2);color:var(--dsw-alias-label-secondary);flex:none;padding:0 5px;font-size:10px;line-height:16px}._6xTKia_label{min-width:0;font-family:var(--dsw-font-mono);white-space:nowrap;text-overflow:ellipsis;flex:1;overflow:hidden}._6xTKia_status{max-width:60%;color:var(--dsw-alias-label-tertiary);white-space:nowrap;text-overflow:ellipsis;flex:none;font-size:10px;line-height:16px;overflow:hidden}._6xTKia_duration{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;flex:none;font-size:11px;line-height:18px}._6xTKia_chevron{color:var(--dsw-alias-label-tertiary);flex:none}._6xTKia_chevronOpen{transform:rotate(180deg)}._6xTKia_panel{--dsl-terminal-command-whitespace:pre-wrap;--dsl-terminal-line-whitespace:pre-wrap;--dsl-terminal-output-max-height:288px;margin:0 8px 8px}._6xTKia_panel [data-terminal]{--dsl-terminal-gutter:12px}._6xTKia_notice{color:var(--dsw-alias-label-tertiary);margin:0 8px 6px;font-size:11px;line-height:16px}._6xTKia_noticeError{color:var(--dsw-alias-state-error-primary)}";
		const tagId = "@deepseek-ai/dsh-client-ui-jobs/JobListAction.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-jobs";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var JobListAction_module_css_default = {
			"chevron": "_6xTKia_chevron",
			"chevronBox": "_6xTKia_chevronBox",
			"chevronOpen": "_6xTKia_chevronOpen",
			"count": "_6xTKia_count",
			"duration": "_6xTKia_duration",
			"item": "_6xTKia_item",
			"kind": "_6xTKia_kind",
			"label": "_6xTKia_label",
			"main": "_6xTKia_main",
			"menu": "_6xTKia_menu",
			"menuBody": "_6xTKia_menuBody",
			"notice": "_6xTKia_notice",
			"noticeError": "_6xTKia_noticeError",
			"panel": "_6xTKia_panel",
			"primary": "_6xTKia_primary",
			"row": "_6xTKia_row",
			"rowDot": "_6xTKia_rowDot",
			"rowLine": "_6xTKia_rowLine",
			"rowLineLive": "_6xTKia_rowLineLive",
			"rowSettled": "_6xTKia_rowSettled",
			"rowStatic": "_6xTKia_rowStatic",
			"secondary": "_6xTKia_secondary",
			"sectionChevron": "_6xTKia_sectionChevron",
			"sectionChevronOpen": "_6xTKia_sectionChevronOpen",
			"sectionClear": "_6xTKia_sectionClear",
			"sectionHeader": "_6xTKia_sectionHeader",
			"sectionToggle": "_6xTKia_sectionToggle",
			"status": "_6xTKia_status",
			"stop": "_6xTKia_stop",
			"stopArmed": "_6xTKia_stopArmed",
			"stopFailed": "_6xTKia_stopFailed",
			"stopLabel": "_6xTKia_stopLabel",
			"trigger": "_6xTKia_trigger",
			"triggerDot": "_6xTKia_triggerDot",
			"triggerOpen": "_6xTKia_triggerOpen"
		};
		//#endregion
		//#region lib/types/client/JobListAction.js
		/** Stable empty list so a session with no jobs keeps one array identity. */
		const NO_JOBS = [];
		/** Minimum gap kept between the popover and the viewport edges (the Menu primitive's portal margin). */
		const VIEWPORT_MARGIN = 12;
		/** Distance between the trigger's bottom edge and the popover. */
		const MENU_GAP = 5;
		/** Unplaced list: hidden but laid out so the first placement measures real dimensions. */
		const MEASURE_STYLE = {
			visibility: "hidden",
			left: 0,
			top: 0
		};
		/** Keyboard-reachable controls inside the list, in document order. */
		const FOCUSABLE = "button:not(:disabled), a[href], [tabindex]:not([tabindex=\"-1\"])";
		/** How long an armed kill waits for its confirming press before disarming. */
		const KILL_ARM_MS = 3e3;
		/** How long a failed kill keeps its hint before the button resets. */
		const KILL_FAILED_MS = 4e3;
		function isLive(job) {
			return job.status === "running" || job.status === "stopping";
		}
		/**
		* Whether the row offers an output panel: every live job (its output may
		* still arrive) and a settled one that left retained output behind.
		*/
		function isObservable(job) {
			return isLive(job) || job.output.total > 0;
		}
		/** The one-line qualifier beside the status: live progress while running, the terminal reason once settled. */
		function jobDetail(job) {
			return job.progress ?? job.detail;
		}
		/** Closed-union exhaustiveness fence for the wire status set. */
		/* v8 ignore next 3 -- closed-union backstop; only reached if a status is forged */
		function assertNever(value) {
			throw new Error(`unhandled job status: ${JSON.stringify(value)}`);
		}
		/**
		* Status marker semantics. `stopping` and `killed` share the attention color:
		* both mean the work ended (or is ending) on request rather than on its own.
		*/
		function dotState(status) {
			switch (status) {
				case "running": return "ongoing";
				case "stopping": return "warning";
				case "completed": return "done";
				case "killed": return "warning";
				case "failed": return "error";
				/* v8 ignore next -- closed wire status union */
				default: return assertNever(status);
			}
		}
		function statusLabel(status, t) {
			switch (status) {
				case "running": return t("status.running");
				case "stopping": return t("status.stopping");
				case "completed": return t("status.completed");
				case "killed": return t("status.killed");
				case "failed": return t("status.failed");
				/* v8 ignore next -- closed wire status union */
				default: return assertNever(status);
			}
		}
		/**
		* Elapsed time in at most two adjacent units. A job that outlives an hour is
		* already exceptional, so hours is the widest unit — beyond that the figure
		* stays in hours rather than growing a day/month vocabulary no producer
		* currently reaches.
		*/
		function formatDuration(elapsedMs, t) {
			const total = Math.max(0, Math.floor(elapsedMs / 1e3));
			const seconds = total % 60;
			const minutes = Math.floor(total / 60) % 60;
			const hours = Math.floor(total / 3600);
			if (hours > 0) return t("duration.hours", {
				hours,
				minutes
			});
			if (minutes > 0) return t("duration.minutes", {
				minutes,
				seconds
			});
			return t("duration.seconds", { seconds });
		}
		/** Localized display copy for the embedded terminal panel. */
		function terminalLabels(t) {
			return {
				commandLine: (line) => t("terminal.commandLine", { n: line }),
				/* v8 ignore next */
				signal: (signal) => t("terminal.signal", { signal }),
				/* v8 ignore next */
				exitCode: (code) => t("terminal.exitCode", { code }),
				noExitCode: t("terminal.noExitCode"),
				running: t("terminal.running"),
				failed: t("terminal.failed"),
				done: t("terminal.done"),
				copy: t("terminal.copy"),
				copied: t("terminal.copied"),
				noOutput: t("terminal.noOutput"),
				collapseAria: t("terminal.collapseAria"),
				collapse: t("terminal.collapse"),
				/* v8 ignore next */
				expandAria: (hidden) => t("terminal.expandAria", { n: hidden }),
				/* v8 ignore next */
				expand: (hidden) => t("terminal.expand", { n: hidden })
			};
		}
		/**
		* Live rows first in start order, then settled rows newest-first. Two rows
		* that settled in the same millisecond fall back to start order, so the sort
		* never depends on the host's map iteration.
		*/
		function ordered(jobs) {
			return [...jobs].sort((left, right) => {
				const liveLeft = isLive(left);
				if (liveLeft !== isLive(right)) return liveLeft ? -1 : 1;
				if (liveLeft) return left.startedAt - right.startedAt;
				const finished = (right.finishedAt ?? right.startedAt) - (left.finishedAt ?? left.startedAt);
				return finished !== 0 ? finished : left.startedAt - right.startedAt;
			});
		}
		/** One job row plus, when observable and expanded, its live output panel. */
		function JobItem({ job, view, expanded, now, onToggle, kill, t }) {
			const live = isLive(job);
			const status = statusLabel(job.status, t);
			const detail = jobDetail(job);
			const observable = isObservable(job);
			const labels = (0, react.useMemo)(() => terminalLabels(t), [t]);
			const duration = formatDuration(live ? now - job.startedAt : (job.finishedAt ?? job.startedAt) - job.startedAt, t);
			const durationCell = (0, react_jsx_runtime.jsx)("span", {
				className: JobListAction_module_css_default.duration,
				title: t(live ? "duration.title.live" : "duration.title.done", { duration }),
				children: duration
			});
			const body = live ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
					state: dotState(job.status),
					className: JobListAction_module_css_default.rowDot
				}),
				(0, react_jsx_runtime.jsxs)("span", {
					className: JobListAction_module_css_default.main,
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: JobListAction_module_css_default.primary,
						children: (0, react_jsx_runtime.jsx)("span", {
							className: JobListAction_module_css_default.label,
							title: job.label,
							children: job.label
						})
					}), (0, react_jsx_runtime.jsxs)("span", {
						className: JobListAction_module_css_default.secondary,
						title: detail ?? status,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: JobListAction_module_css_default.kind,
								children: job.kind
							}),
							detail !== void 0 ? (0, react_jsx_runtime.jsx)("span", {
								className: JobListAction_module_css_default.status,
								children: detail
							}) : null,
							durationCell
						]
					})]
				}),
				(0, react_jsx_runtime.jsx)("span", {
					className: JobListAction_module_css_default.chevronBox,
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
						size: 12,
						className: expanded ? `${JobListAction_module_css_default.chevron} ${JobListAction_module_css_default.chevronOpen}` : JobListAction_module_css_default.chevron
					})
				})
			] }) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
					state: dotState(job.status),
					className: JobListAction_module_css_default.rowDot
				}),
				(0, react_jsx_runtime.jsx)("span", {
					className: JobListAction_module_css_default.kind,
					children: job.kind
				}),
				(0, react_jsx_runtime.jsx)("span", {
					className: JobListAction_module_css_default.label,
					title: job.label,
					children: job.label
				}),
				(0, react_jsx_runtime.jsx)("span", {
					className: JobListAction_module_css_default.status,
					title: detail ?? status,
					children: detail ?? status
				}),
				durationCell,
				observable ? (0, react_jsx_runtime.jsx)("span", {
					className: JobListAction_module_css_default.chevronBox,
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
						size: 12,
						className: expanded ? `${JobListAction_module_css_default.chevron} ${JobListAction_module_css_default.chevronOpen}` : JobListAction_module_css_default.chevron
					})
				}) : null
			] });
			const killTitle = kill === void 0 ? void 0 : kill.state === "armed" ? t("kill.confirm") : kill.state === "failed" ? t("kill.failed") : t("kill.stop", { label: job.label });
			return (0, react_jsx_runtime.jsxs)("li", {
				className: JobListAction_module_css_default.item,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: live ? `${JobListAction_module_css_default.rowLine} ${JobListAction_module_css_default.rowLineLive}` : JobListAction_module_css_default.rowLine,
					children: [observable ? (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: live ? JobListAction_module_css_default.row : `${JobListAction_module_css_default.row} ${JobListAction_module_css_default.rowSettled}`,
						"aria-expanded": expanded,
						"aria-label": t(expanded ? "row.collapseAria" : "row.expandAria", { label: job.label }),
						onClick: onToggle,
						children: body
					}) : (0, react_jsx_runtime.jsx)("span", {
						className: `${JobListAction_module_css_default.row} ${JobListAction_module_css_default.rowSettled} ${JobListAction_module_css_default.rowStatic}`,
						children: body
					}), kill !== void 0 ? (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: kill.state === "armed" ? `${JobListAction_module_css_default.stop} ${JobListAction_module_css_default.stopArmed}` : kill.state === "failed" ? `${JobListAction_module_css_default.stop} ${JobListAction_module_css_default.stopFailed}` : JobListAction_module_css_default.stop,
						"data-kill-state": kill.state,
						disabled: kill.state === "pending",
						"aria-label": killTitle,
						title: killTitle,
						onClick: kill.onPress,
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconStopFillRegular, { size: 10 }), kill.state === "armed" ? (0, react_jsx_runtime.jsx)("span", {
							className: JobListAction_module_css_default.stopLabel,
							children: t("kill.confirmAction")
						}) : null]
					}) : null]
				}), expanded && view !== void 0 ? (0, react_jsx_runtime.jsxs)("div", {
					className: JobListAction_module_css_default.panel,
					children: [
						view.gapBefore ? (0, react_jsx_runtime.jsx)("div", {
							className: JobListAction_module_css_default.notice,
							children: t("output.gap")
						}) : null,
						view.error !== void 0 ? (0, react_jsx_runtime.jsx)("div", {
							className: `${JobListAction_module_css_default.notice} ${JobListAction_module_css_default.noticeError}`,
							children: t("output.error", { error: view.error })
						}) : null,
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TerminalBlock, {
							command: job.label,
							output: view.text,
							running: live,
							copyText: job.label,
							runStateDot: false,
							maxLines: Number.POSITIVE_INFINITY,
							labels
						})
					]
				}) : null]
			});
		}
		/**
		* Session-header entry point for this session's background jobs. Mounting it
		* keeps the session's roster stream open; it renders nothing at all until the
		* session can see at least one job. Expanding an observable row (a live job,
		* or a settled one with retained output) starts its observation stream, and
		* collapsing (or closing the popover) stops it — output only flows while
		* someone is watching. A running row carries a two-press stop button that
		* requests a human kill through the job controller.
		* @param props - runtime slot currency, the jobs snapshot hook, the roster,
		*   observation, and kill controls, and the namespace translator.
		* @returns the trigger and its popover list, or null when there is nothing to show.
		*/
		function JobListAction({ sessionId, useJobs, watchRows, observe, killJob, t }) {
			const jobs = useJobs((state) => state.rows[sessionId]) ?? NO_JOBS;
			const observedViews = useJobs((state) => state.observed);
			const [open, setOpen] = (0, react.useState)(false);
			const [expandedKey, setExpandedKey] = (0, react.useState)(void 0);
			const [now, setNow] = (0, react.useState)(() => Date.now());
			const [settledOpen, setSettledOpen] = (0, react.useState)(void 0);
			const [clearedKeys, setClearedKeys] = (0, react.useState)(() => /* @__PURE__ */ new Set());
			const [killPhase, setKillPhase] = (0, react.useState)(void 0);
			const rootRef = (0, react.useRef)(null);
			const triggerRef = (0, react.useRef)(null);
			const menuRef = (0, react.useRef)(null);
			const rows = (0, react.useMemo)(() => ordered(jobs), [jobs]);
			const liveRows = (0, react.useMemo)(() => rows.filter(isLive), [rows]);
			const settledRows = (0, react.useMemo)(() => rows.filter((job) => !isLive(job) && !clearedKeys.has(String(job.id))), [rows, clearedKeys]);
			const settledExpanded = settledOpen ?? liveRows.length === 0;
			const visibleCount = liveRows.length + settledRows.length;
			const menuPosition = (0, _deepseek_ai_dsh_client_ui_primitives.useAnchoredPosition)({
				open,
				anchorRef: rootRef,
				panelRef: menuRef,
				gap: MENU_GAP,
				margin: VIEWPORT_MARGIN
			});
			(0, _deepseek_ai_dsh_client_ui_primitives.useDismissOnOutsidePointer)(rootRef, open, setOpen, menuRef);
			(0, react.useEffect)(() => watchRows(sessionId), [sessionId, watchRows]);
			(0, react.useEffect)(() => {
				if (!open || liveRows.length === 0) return;
				setNow(Date.now());
				const timer = setInterval(() => {
					setNow(Date.now());
				}, 1e3);
				return () => {
					clearInterval(timer);
				};
			}, [open, liveRows.length]);
			const expandedRow = open && expandedKey !== void 0 ? rows.find((job) => String(job.id) === expandedKey) : void 0;
			const activeJob = expandedRow !== void 0 && isObservable(expandedRow) ? expandedRow.id : void 0;
			(0, react.useEffect)(() => {
				if (activeJob === void 0) return;
				return observe(sessionId, activeJob);
			}, [
				sessionId,
				activeJob,
				observe
			]);
			(0, react.useEffect)(() => {
				if (visibleCount === 0 && open) setOpen(false);
			}, [visibleCount, open]);
			(0, react.useEffect)(() => {
				if (expandedKey !== void 0 && !rows.some((job) => String(job.id) === expandedKey)) setExpandedKey(void 0);
			}, [rows, expandedKey]);
			(0, react.useEffect)(() => {
				if (killPhase === void 0 || killPhase.state === "pending") return;
				const timer = setTimeout(() => {
					setKillPhase(void 0);
				}, killPhase.state === "armed" ? KILL_ARM_MS : KILL_FAILED_MS);
				return () => {
					clearTimeout(timer);
				};
			}, [killPhase]);
			(0, react.useEffect)(() => {
				if (killPhase !== void 0 && !rows.some((job) => String(job.id) === killPhase.key && job.status === "running")) setKillPhase(void 0);
			}, [rows, killPhase]);
			const pressKill = (job) => {
				const key = String(job.id);
				if (killPhase?.key !== key || killPhase.state !== "armed") {
					setKillPhase({
						key,
						state: "armed"
					});
					return;
				}
				setKillPhase({
					key,
					state: "pending"
				});
				killJob(sessionId, key).then((ok) => {
					setKillPhase((current) => current?.key === key && !ok ? {
						key,
						state: "failed"
					} : current);
				});
			};
			if (visibleCount === 0) return null;
			const countLabel = t(liveRows.length > 0 ? liveRows.length === 1 ? "count.live.one" : "count.live.other" : visibleCount === 1 ? "count.idle.one" : "count.idle.other", { count: liveRows.length > 0 ? liveRows.length : visibleCount });
			const clearSettled = () => {
				setClearedKeys((current) => {
					const next = new Set(current);
					for (const job of settledRows) next.add(String(job.id));
					return next;
				});
				if (expandedKey !== void 0 && settledRows.some((job) => String(job.id) === expandedKey)) setExpandedKey(void 0);
			};
			const onKeyDown = (event) => {
				if (!open) return;
				const trigger = triggerRef.current;
				if (event.key === "Escape") {
					event.preventDefault();
					setOpen(false);
					trigger?.focus();
					return;
				}
				const menu = menuRef.current;
				/* v8 ignore next -- both refs are attached while the open list renders. */
				if (event.key !== "Tab" || trigger === null || menu === null) return;
				const focusable = [...menu.querySelectorAll(FOCUSABLE)];
				if (event.target === trigger) {
					if (event.shiftKey) return;
					event.preventDefault();
					focusable[0]?.focus();
				} else if (event.shiftKey ? event.target === focusable[0] : event.target === focusable.at(-1)) {
					if (event.shiftKey) event.preventDefault();
					trigger.focus();
				}
			};
			const item = (job) => (0, react_jsx_runtime.jsx)(JobItem, {
				job,
				view: isObservable(job) ? observedViews[String(job.id)] : void 0,
				expanded: expandedKey === String(job.id),
				now,
				onToggle: () => {
					setExpandedKey((current) => current === String(job.id) ? void 0 : String(job.id));
				},
				...job.status === "running" ? { kill: {
					state: killPhase?.key === String(job.id) ? killPhase.state : "idle",
					onPress: () => {
						pressKill(job);
					}
				} } : {},
				t
			}, String(job.id));
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				onKeyDown,
				children: [(0, react_jsx_runtime.jsxs)("button", {
					ref: triggerRef,
					type: "button",
					className: JobListAction_module_css_default.trigger,
					"aria-expanded": open,
					"aria-label": countLabel,
					onClick: () => {
						setNow(Date.now());
						setOpen((current) => !current);
					},
					children: [
						liveRows.length > 0 ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
							state: "ongoing",
							className: JobListAction_module_css_default.triggerDot
						}) : null,
						(0, react_jsx_runtime.jsx)("span", {
							className: JobListAction_module_css_default.count,
							children: countLabel
						}),
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
							size: 12,
							className: open ? JobListAction_module_css_default.triggerOpen : void 0
						})
					]
				}), open ? (0, react_dom.createPortal)((0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MenuSurface, {
					ref: menuRef,
					className: JobListAction_module_css_default.menu,
					style: menuPosition ?? MEASURE_STYLE,
					children: (0, react_jsx_runtime.jsxs)("ul", {
						className: JobListAction_module_css_default.menuBody,
						"aria-label": t("list.aria"),
						children: [
							liveRows.length > 0 ? (0, react_jsx_runtime.jsx)("li", {
								className: JobListAction_module_css_default.sectionHeader,
								"aria-hidden": "true",
								children: t("section.live")
							}) : null,
							liveRows.map(item),
							settledRows.length > 0 ? (0, react_jsx_runtime.jsxs)("li", {
								className: JobListAction_module_css_default.sectionHeader,
								children: [(0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: JobListAction_module_css_default.sectionToggle,
									"aria-expanded": settledExpanded,
									onClick: () => {
										setSettledOpen(!settledExpanded);
									},
									children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
										size: 12,
										className: settledExpanded ? `${JobListAction_module_css_default.sectionChevron} ${JobListAction_module_css_default.sectionChevronOpen}` : JobListAction_module_css_default.sectionChevron
									}), t("section.settledCount", { count: settledRows.length })]
								}), (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: JobListAction_module_css_default.sectionClear,
									onClick: clearSettled,
									children: t("section.clear")
								})]
							}) : null,
							settledExpanded ? settledRows.map(item) : null
						]
					})
				}), document.body) : null]
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"count.live.one": "{count} 个后台任务运行中",
			"count.live.other": "{count} 个后台任务运行中",
			"count.idle.one": "{count} 个后台任务",
			"count.idle.other": "{count} 个后台任务",
			"list.aria": "后台任务",
			"section.live": "进行中",
			"section.settledCount": "已结束 {count}",
			"section.clear": "清空",
			"row.expandAria": "展开 {label} 的实时输出",
			"row.collapseAria": "收起 {label} 的实时输出",
			"kill.stop": "停止任务 {label}",
			"kill.confirm": "再次点击确认停止",
			"kill.confirmAction": "确认停止",
			"kill.failed": "停止失败",
			"status.running": "运行中",
			"status.stopping": "正在停止",
			"status.completed": "已完成",
			"status.killed": "已取消",
			"status.failed": "已失败",
			"duration.seconds": "{seconds}秒",
			"duration.minutes": "{minutes}分{seconds}秒",
			"duration.hours": "{hours}小时{minutes}分",
			"duration.title.live": "已运行 {duration}",
			"duration.title.done": "耗时 {duration}",
			"output.gap": "……较早的输出已丢弃……",
			"output.error": "实时输出流中断：{error}",
			"terminal.signal": "信号 {signal}",
			"terminal.exitCode": "退出码 {code}",
			"terminal.noExitCode": "未正常退出",
			"terminal.commandLine": "命令第 {n} 行",
			"terminal.running": "运行中",
			"terminal.failed": "已失败",
			"terminal.done": "已完成",
			"terminal.copy": "复制",
			"terminal.copied": "已复制",
			"terminal.noOutput": "（无输出）",
			"terminal.collapse": "收起",
			"terminal.collapseAria": "收起输出",
			"terminal.expand": "展开其余 {n} 行",
			"terminal.expandAria": "展开被折叠的 {n} 行输出"
		};
		/** English dictionary, key-identical to the Chinese source of truth. */
		const en = {
			"count.live.one": "{count} background job running",
			"count.live.other": "{count} background jobs running",
			"count.idle.one": "{count} background job",
			"count.idle.other": "{count} background jobs",
			"list.aria": "Background jobs",
			"section.live": "Running",
			"section.settledCount": "Finished {count}",
			"section.clear": "Clear",
			"row.expandAria": "Show live output of {label}",
			"row.collapseAria": "Hide live output of {label}",
			"kill.stop": "Stop task {label}",
			"kill.confirm": "Click again to confirm",
			"kill.confirmAction": "Confirm stop",
			"kill.failed": "Stop failed",
			"status.running": "running",
			"status.stopping": "stopping",
			"status.completed": "completed",
			"status.killed": "cancelled",
			"status.failed": "failed",
			"duration.seconds": "{seconds}s",
			"duration.minutes": "{minutes}m {seconds}s",
			"duration.hours": "{hours}h {minutes}m",
			"duration.title.live": "Running for {duration}",
			"duration.title.done": "Took {duration}",
			"output.gap": "… earlier output dropped …",
			"output.error": "live output stream interrupted: {error}",
			"terminal.signal": "signal {signal}",
			"terminal.exitCode": "exit {code}",
			"terminal.noExitCode": "no exit code",
			"terminal.commandLine": "Command line {n}",
			"terminal.running": "running",
			"terminal.failed": "failed",
			"terminal.done": "done",
			"terminal.copy": "Copy",
			"terminal.copied": "Copied",
			"terminal.noOutput": "(no output)",
			"terminal.collapse": "Collapse",
			"terminal.collapseAria": "Collapse output",
			"terminal.expand": "Show {n} more lines",
			"terminal.expandAria": "Expand {n} collapsed output lines"
		};
		/** Japanese copy, checked against the English keys. */
		const ja = {
			"count.live.one": "バックグラウンドジョブ {count} 件が実行中",
			"count.live.other": "バックグラウンドジョブ {count} 件が実行中",
			"count.idle.one": "バックグラウンドジョブ {count} 件",
			"count.idle.other": "バックグラウンドジョブ {count} 件",
			"list.aria": "バックグラウンドジョブ",
			"section.live": "実行中",
			"section.settledCount": "完了 {count} 件",
			"section.clear": "クリア",
			"row.expandAria": "{label} のライブ出力を表示",
			"row.collapseAria": "{label} のライブ出力を非表示",
			"kill.stop": "タスク {label} を停止",
			"kill.confirm": "もう一度クリックして確定",
			"kill.confirmAction": "停止を確定",
			"kill.failed": "停止に失敗しました",
			"status.running": "実行中",
			"status.stopping": "停止中",
			"status.completed": "完了",
			"status.killed": "キャンセル済み",
			"status.failed": "失敗",
			"duration.seconds": "{seconds}秒",
			"duration.minutes": "{minutes}分 {seconds}秒",
			"duration.hours": "{hours}時間 {minutes}分",
			"duration.title.live": "実行時間 {duration}",
			"duration.title.done": "所要時間 {duration}",
			"output.gap": "…以前の出力は破棄されました…",
			"output.error": "ライブ出力ストリームが中断されました: {error}",
			"terminal.signal": "シグナル {signal}",
			"terminal.exitCode": "終了コード {code}",
			"terminal.noExitCode": "終了コードなし",
			"terminal.commandLine": "コマンドライン {n}",
			"terminal.running": "実行中",
			"terminal.failed": "失敗",
			"terminal.done": "完了",
			"terminal.copy": "コピー",
			"terminal.copied": "コピーしました",
			"terminal.noOutput": "（出力なし）",
			"terminal.collapse": "折りたたむ",
			"terminal.collapseAria": "出力を折りたたむ",
			"terminal.expand": "残り {n} 行を表示",
			"terminal.expandAria": "折りたたまれた出力 {n} 行を展開"
		};
		/** Spanish dictionary, checked against the English keys. */
		const es = {
			"count.live.one": "Tareas en segundo plano en ejecución: {count}",
			"count.live.other": "Tareas en segundo plano en ejecución: {count}",
			"count.idle.one": "Tareas en segundo plano: {count}",
			"count.idle.other": "Tareas en segundo plano: {count}",
			"list.aria": "Trabajos en segundo plano",
			"section.live": "corriendo",
			"section.settledCount": "Terminado {count}",
			"section.clear": "Borrar",
			"row.expandAria": "Mostrar salida en vivo de {label}",
			"row.collapseAria": "Ocultar salida en vivo de {label}",
			"kill.stop": "Detener tarea {label}",
			"kill.confirm": "Haga clic nuevamente para confirmar",
			"kill.confirmAction": "Confirmar parada",
			"kill.failed": "Detener falló",
			"status.running": "corriendo",
			"status.stopping": "parando",
			"status.completed": "completado",
			"status.killed": "cancelado",
			"status.failed": "falló",
			"duration.seconds": "{seconds}s",
			"duration.minutes": "{minutes}m {seconds}s",
			"duration.hours": "{hours}h {minutes}m",
			"duration.title.live": "Corriendo para {duration}",
			"duration.title.done": "Tomó {duration}",
			"output.gap": "… la producción anterior cayó…",
			"output.error": "transmisión de salida en vivo interrumpida: {error}",
			"terminal.signal": "señal {signal}",
			"terminal.exitCode": "salir {code}",
			"terminal.noExitCode": "sin código de salida",
			"terminal.commandLine": "Línea de comando {n}",
			"terminal.running": "corriendo",
			"terminal.failed": "falló",
			"terminal.done": "hecho",
			"terminal.copy": "Copiar",
			"terminal.copied": "Copiado",
			"terminal.noOutput": "(sin salida)",
			"terminal.collapse": "Contraer",
			"terminal.collapseAria": "Contraer salida",
			"terminal.expand": "Mostrar {n} más líneas",
			"terminal.expandAria": "Expandir líneas de salida colapsadas {n}"
		};
		/** French dictionary, checked against the English keys. */
		const fr = {
			"count.live.one": "Tâches en arrière-plan en cours : {count}",
			"count.live.other": "Tâches en arrière-plan en cours : {count}",
			"count.idle.one": "Tâches en arrière-plan : {count}",
			"count.idle.other": "Tâches en arrière-plan : {count}",
			"list.aria": "Travaux en arrière-plan",
			"section.live": "Courir",
			"section.settledCount": "Terminé {count}",
			"section.clear": "Effacer",
			"row.expandAria": "Afficher la sortie en direct de {label}",
			"row.collapseAria": "Masquer la sortie en direct de {label}",
			"kill.stop": "Arrêter la tâche {label}",
			"kill.confirm": "Cliquez à nouveau pour confirmer",
			"kill.confirmAction": "Confirmer l'arrêt",
			"kill.failed": "L'arrêt a échoué",
			"status.running": "courir",
			"status.stopping": "arrêter",
			"status.completed": "terminé",
			"status.killed": "annulé",
			"status.failed": "échoué",
			"duration.seconds": "{seconds}s",
			"duration.minutes": "{minutes}m {seconds}s",
			"duration.hours": "{hours}h {minutes}m",
			"duration.title.live": "Courir pour {duration}",
			"duration.title.done": "A pris {duration}",
			"output.gap": "… la production antérieure a chuté…",
			"output.error": "flux de sortie en direct interrompu\xA0: {error}",
			"terminal.signal": "signal {signal}",
			"terminal.exitCode": "quitter {code}",
			"terminal.noExitCode": "pas de code de sortie",
			"terminal.commandLine": "Ligne de commande {n}",
			"terminal.running": "courir",
			"terminal.failed": "échoué",
			"terminal.done": "fait",
			"terminal.copy": "Copier",
			"terminal.copied": "Copié",
			"terminal.noOutput": "(pas de sortie)",
			"terminal.collapse": "Réduire",
			"terminal.collapseAria": "Réduire la sortie",
			"terminal.expand": "Afficher {n} plus de lignes",
			"terminal.expandAria": "Développer les lignes de sortie réduites {n}"
		};
		/** German dictionary, checked against the English keys. */
		const de = {
			"count.live.one": "Laufende Hintergrundaufgaben: {count}",
			"count.live.other": "Laufende Hintergrundaufgaben: {count}",
			"count.idle.one": "Hintergrundaufgaben: {count}",
			"count.idle.other": "Hintergrundaufgaben: {count}",
			"list.aria": "Hintergrundjobs",
			"section.live": "Laufen",
			"section.settledCount": "Fertig {count}",
			"section.clear": "Klar",
			"row.expandAria": "Live-Ausgabe von {label} anzeigen",
			"row.collapseAria": "Live-Ausgabe von {label} ausblenden",
			"kill.stop": "Stoppen Sie die Aufgabe {label}",
			"kill.confirm": "Klicken Sie zur Bestätigung erneut",
			"kill.confirmAction": "Stopp bestätigen",
			"kill.failed": "Stoppen ist fehlgeschlagen",
			"status.running": "laufen",
			"status.stopping": "anhalten",
			"status.completed": "abgeschlossen",
			"status.killed": "abgesagt",
			"status.failed": "gescheitert",
			"duration.seconds": "{seconds}s",
			"duration.minutes": "{minutes}m {seconds}s",
			"duration.hours": "{hours}h {minutes}m",
			"duration.title.live": "Laufen für {duration}",
			"duration.title.done": "Nahm {duration}",
			"output.gap": "… frühere Produktion gesunken …",
			"output.error": "Live-Ausgabestream unterbrochen: {error}",
			"terminal.signal": "Signal {signal}",
			"terminal.exitCode": "Beenden Sie {code}",
			"terminal.noExitCode": "kein Exit-Code",
			"terminal.commandLine": "Befehlszeile {n}",
			"terminal.running": "laufen",
			"terminal.failed": "gescheitert",
			"terminal.done": "erledigt",
			"terminal.copy": "Kopieren",
			"terminal.copied": "Kopiert",
			"terminal.noOutput": "(keine Ausgabe)",
			"terminal.collapse": "Einklappen",
			"terminal.collapseAria": "Ausgabe reduzieren",
			"terminal.expand": "Zeige {n} weitere Zeilen",
			"terminal.expandAria": "Erweitern Sie die minimierten Ausgabezeilen {n}"
		};
		/** Russian dictionary, checked against the English keys. */
		const ru = {
			"count.live.one": "Фоновые задачи выполняются: {count}",
			"count.live.other": "Фоновые задачи выполняются: {count}",
			"count.idle.one": "Фоновые задачи: {count}",
			"count.idle.other": "Фоновые задачи: {count}",
			"list.aria": "Фоновые задания",
			"section.live": "Бег",
			"section.settledCount": "Закончено {count}",
			"section.clear": "Очистить",
			"row.expandAria": "Показать живой вывод {label}",
			"row.collapseAria": "Скрыть прямой вывод {label}",
			"kill.stop": "Остановить задачу {label}",
			"kill.confirm": "Нажмите еще раз, чтобы подтвердить",
			"kill.confirmAction": "Подтвердить остановку",
			"kill.failed": "Остановить не удалось",
			"status.running": "бег",
			"status.stopping": "остановка",
			"status.completed": "завершено",
			"status.killed": "отменен",
			"status.failed": "не удалось",
			"duration.seconds": "{seconds}s",
			"duration.minutes": "{minutes}m {seconds}s",
			"duration.hours": "{hours}h {minutes}m",
			"duration.title.live": "Бегу за {duration}",
			"duration.title.done": "Взял {duration}",
			"output.gap": "… ранее объемы производства упали …",
			"output.error": "поток вывода в реальном времени прерван: {error}",
			"terminal.signal": "сигнал {signal}",
			"terminal.exitCode": "выход {code}",
			"terminal.noExitCode": "нет кода выхода",
			"terminal.commandLine": "Командная строка {n}",
			"terminal.running": "бег",
			"terminal.failed": "не удалось",
			"terminal.done": "сделано",
			"terminal.copy": "Копировать",
			"terminal.copied": "Скопировано",
			"terminal.noOutput": "(нет вывода)",
			"terminal.collapse": "Свернуть",
			"terminal.collapseAria": "Свернуть вывод",
			"terminal.expand": "Показать {n} больше строк",
			"terminal.expandAria": "Развернуть свернутые выходные строки {n}"
		};
		/** Portuguese dictionary, checked against the English keys. */
		const pt = {
			"count.live.one": "Tarefas em segundo plano em execução: {count}",
			"count.live.other": "Tarefas em segundo plano em execução: {count}",
			"count.idle.one": "Tarefas em segundo plano: {count}",
			"count.idle.other": "Tarefas em segundo plano: {count}",
			"list.aria": "Trabalhos em segundo plano",
			"section.live": "Correndo",
			"section.settledCount": "Concluído {count}",
			"section.clear": "Limpar",
			"row.expandAria": "Mostrar saída ao vivo de {label}",
			"row.collapseAria": "Ocultar saída ao vivo de {label}",
			"kill.stop": "Parar tarefa {label}",
			"kill.confirm": "Clique novamente para confirmar",
			"kill.confirmAction": "Confirmar parada",
			"kill.failed": "Falha na parada",
			"status.running": "correndo",
			"status.stopping": "parando",
			"status.completed": "concluído",
			"status.killed": "cancelado",
			"status.failed": "falhou",
			"duration.seconds": "{seconds}s",
			"duration.minutes": "{minutes}m {seconds}s",
			"duration.hours": "{hours}h {minutes}m",
			"duration.title.live": "Correndo por {duration}",
			"duration.title.done": "Levou {duration}",
			"output.gap": "… a produção anterior caiu…",
			"output.error": "transmissão ao vivo interrompida: {error}",
			"terminal.signal": "sinal {signal}",
			"terminal.exitCode": "sair {code}",
			"terminal.noExitCode": "sem código de saída",
			"terminal.commandLine": "Linha de comando {n}",
			"terminal.running": "correndo",
			"terminal.failed": "falhou",
			"terminal.done": "feito",
			"terminal.copy": "Copiar",
			"terminal.copied": "Copiado",
			"terminal.noOutput": "(sem saída)",
			"terminal.collapse": "Recolher",
			"terminal.collapseAria": "Recolher saída",
			"terminal.expand": "Mostrar mais {n} linhas",
			"terminal.expandAria": "Expanda {n} linhas de saída recolhidas"
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Required services: the jobs rosters, observations, and kill, the slot registry, and dictionaries. */
		const inject = [
			"jobs",
			"slots",
			"locale"
		];
		/**
		* Client plugin body: register the dictionaries and the header action.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register("job", {
				zh,
				en,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}), "ui-jobs: dictionaries");
			ctx.slots.inject("conversation.session.header.actions", () => ctx.slots.register({
				name: "conversation.session.header.actions",
				id: "job-list",
				order: 20,
				locale: "job",
				inject: () => ({
					hooks: { jobs: ctx.jobs.state },
					watchRows: (sessionId) => ctx.jobs.watchRows(sessionId),
					observe: (sessionId, id) => ctx.jobs.observe(sessionId, id),
					killJob: async (sessionId, jobId) => (await ctx.jobs.kill(sessionId, jobId)).ok
				})
			}, JobListAction));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
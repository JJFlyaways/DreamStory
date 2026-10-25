window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-goal",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region lib/types/client/activation-source.js
		/** Goal activation observable that orders Remote reads and live activation events. */
		/** Compare two empty-or-populated activation snapshots by value. */
		function sameSnapshot(left, right) {
			return left.id === right.id && left.revision === right.revision && left.activation === right.activation;
		}
		/** Return the current active CAS ref, or undefined when the goal is not active. */
		function activeRef(projection) {
			return projection?.goal.phase === "active" ? projection.goal : void 0;
		}
		/**
		* Create one registrant-private activation source. The source subscribes only
		* while a framework hook observes it, so unmount releases the Remote event,
		* projection, running-snapshot, and reset listeners.
		* @param deps - projection, session, Remote read, and live-event inputs.
		* @returns stable snapshot source consumed by `useGoalActivation`.
		*/
		function createGoalActivationSource(deps) {
			let snapshot = {};
			let subscriptions = 0;
			let disposers = [];
			let running = deps.session.getSnapshot().running;
			let eventEpoch = 0;
			let projectionEpoch = 0;
			let readEpoch = 0;
			const listeners = /* @__PURE__ */ new Set();
			const publish = (next) => {
				if (sameSnapshot(snapshot, next)) return;
				snapshot = next;
				for (const listener of listeners) listener();
			};
			const startRead = (ref) => {
				if (ref === void 0) return;
				const read = ++readEpoch;
				const startedAtEvent = eventEpoch;
				const startedAtProjection = projectionEpoch;
				deps.getGoal().then((result) => {
					if (read !== readEpoch || startedAtEvent !== eventEpoch || startedAtProjection !== projectionEpoch) return;
					if (!result.ok) return;
					const goal = result.value;
					/* v8 ignore next 4 -- projection drive is the authoritative clear edge; an active projection with no live goal is transient. */
					if (goal === void 0) {
						if (activeRef(deps.projection.getSnapshot()) === void 0) publish({});
						return;
					}
					publish({
						id: goal.id,
						revision: goal.revision,
						activation: goal.activation
					});
				}, (error) => {
					console.warn("[ui-goal] goal activation read failed:", error);
				});
			};
			const refreshProjection = () => {
				projectionEpoch++;
				const ref = activeRef(deps.projection.getSnapshot());
				if (ref === void 0) {
					/* v8 ignore next -- clearing an already-empty activation snapshot is idempotent. */
					if (snapshot.id !== void 0) publish({});
					return;
				}
				if (snapshot.id !== ref.id || snapshot.revision !== ref.revision) publish({
					id: ref.id,
					revision: ref.revision
				});
				startRead(ref);
			};
			const onActivation = (goal) => {
				eventEpoch++;
				readEpoch++;
				publish(goal === void 0 ? {} : {
					id: goal.id,
					revision: goal.revision,
					activation: goal.activation
				});
			};
			const onRunning = () => {
				const next = deps.session.getSnapshot().running;
				if (next === running) return;
				running = next;
				startRead(activeRef(deps.projection.getSnapshot()));
			};
			const onReset = () => {
				eventEpoch++;
				projectionEpoch++;
				startRead(activeRef(deps.projection.getSnapshot()));
			};
			const start = () => {
				disposers = [
					deps.projection.subscribe(refreshProjection),
					deps.session.subscribe(onRunning),
					deps.subscribeActivation(onActivation),
					deps.subscribeReset(onReset)
				];
				running = deps.session.getSnapshot().running;
				refreshProjection();
			};
			const stop = () => {
				for (const dispose of disposers) dispose();
				disposers = [];
				readEpoch++;
			};
			return {
				getSnapshot: () => snapshot,
				subscribe(listener) {
					listeners.add(listener);
					if (subscriptions === 0) start();
					subscriptions++;
					return () => {
						listeners.delete(listener);
						subscriptions--;
						if (subscriptions === 0) stop();
					};
				}
			};
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-goal/src/client/GoalBar.module.css.mjs
		const css$1 = ".WWzk4a_dock{box-sizing:border-box;width:calc(100% - var(--dsh-composer-side-clearance) - var(--dsh-composer-side-clearance) - var(--dsh-composer-dock-inset) - var(--dsh-composer-dock-inset) - var(--dsh-composer-dock-inset) - var(--dsh-composer-dock-inset));margin:0 auto}.WWzk4a_bar{isolation:isolate;box-sizing:border-box;width:100%;max-width:calc(var(--dsh-composer-card-max-width) - 4 * var(--dsh-composer-dock-inset));--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-md);height:36px;box-shadow:var(--dsw-elevation-panel);border:0;align-items:center;gap:10px;margin:0 auto;padding:4px 5px 4px 12px;display:flex;position:relative}.WWzk4a_bar:before{z-index:-1;border-radius:inherit;background:var(--dsw-specific-menu);backdrop-filter:var(--dsw-menu-backdrop-filter);content:\"\";pointer-events:none;position:absolute;inset:0}.WWzk4a_goalGlyph{color:var(--dsw-alias-label-tertiary);flex:none;display:inline-flex}.WWzk4a_label{color:var(--dsw-alias-label-primary);flex:none;font-size:13px;font-weight:500;line-height:24px}.WWzk4a_objective{min-width:0;color:var(--dsw-alias-label-primary-dimmed);text-overflow:ellipsis;white-space:nowrap;flex:1;font-size:13px;line-height:20px;overflow:hidden}.WWzk4a_error{min-width:0;color:var(--dsw-alias-state-error-primary);text-overflow:ellipsis;white-space:nowrap;flex:1;font-size:12px;line-height:20px;overflow:hidden}.WWzk4a_editBar{--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);align-items:flex-end;height:auto;min-height:36px}.WWzk4a_actions{flex:none;align-items:center;gap:10px;display:flex}.WWzk4a_iconBtn{corner-shape:round;width:28px;height:28px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;border-radius:999px;justify-content:center;align-items:center;padding:0;display:inline-flex}@media (hover:hover){.WWzk4a_iconBtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}}.WWzk4a_iconBtn:disabled{opacity:.4;cursor:default}";
		const tagId$1 = "@deepseek-ai/dsh-client-ui-goal/GoalBar.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-goal";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var GoalBar_module_css_default = {
			"actions": "WWzk4a_actions",
			"bar": "WWzk4a_bar",
			"dock": "WWzk4a_dock",
			"editBar": "WWzk4a_editBar",
			"error": "WWzk4a_error",
			"goalGlyph": "WWzk4a_goalGlyph",
			"iconBtn": "WWzk4a_iconBtn",
			"label": "WWzk4a_label",
			"objective": "WWzk4a_objective"
		};
		//#endregion
		//#region lib/types/client/GoalBar.js
		/**
		* GoalBar: the goal indicator docked above the message composer (input dock
		* strip). A present goal shows a goal glyph, a phase label, the truncated
		* objective, and icon actions — resume when active-disarmed or paused, edit
		* (inline form in the same strip), and clear. Goal creation lives on the
		* `/goal` command, not here: loading (undefined), no goal (null), and complete
		* goals render nothing. Durable state arrives as the projected whole snapshot;
		* process-local activation arrives through the injected activation hook.
		*/
		/** Strip label keys per visible phase; complete goals render nothing. */
		const PHASE_LABELS = {
			active: "phase.active",
			paused: "phase.paused",
			blocked: "phase.blocked"
		};
		/** Strip label for an active goal using its process-local activation. */
		function activeLabel(activation, t) {
			if (activation === "disarmed") return t("phase.active.disarmed");
			return t(PHASE_LABELS.active);
		}
		function GoalBar({ goal, activation, onEdit, onPause, onResume, onClear, t }) {
			const [editing, setEditing] = (0, react.useState)(false);
			const [draft, setDraft] = (0, react.useState)("");
			const [pending, setPending] = (0, react.useState)(false);
			const [actionError, setActionError] = (0, react.useState)(null);
			const [clearedGoalId, setClearedGoalId] = (0, react.useState)(null);
			const pendingRef = (0, react.useRef)(false);
			const goalId = goal?.id;
			(0, react.useEffect)(() => {
				setEditing(false);
				setActionError(null);
				setClearedGoalId(null);
			}, [goalId]);
			const runAction = (0, react.useCallback)(async (action) => {
				if (pendingRef.current) return void 0;
				pendingRef.current = true;
				setPending(true);
				setActionError(null);
				const result = await action();
				pendingRef.current = false;
				setPending(false);
				if (!result.ok) setActionError(`${result.error.message} (${result.error.code})`);
				return result;
			}, []);
			const handleEdit = (0, react.useCallback)(async () => {
				const trimmed = draft.trim();
				if (trimmed === "") return;
				if ((await runAction(() => onEdit(trimmed)))?.ok) setEditing(false);
			}, [
				draft,
				onEdit,
				runAction
			]);
			const handleClear = (0, react.useCallback)(async (clearedId) => {
				if ((await runAction(onClear))?.ok) setClearedGoalId(clearedId);
			}, [onClear, runAction]);
			if (goal === void 0 || goal === null || goal.phase === "complete" || goal.id === clearedGoalId) return null;
			if (editing) return (0, react_jsx_runtime.jsx)("div", {
				className: GoalBar_module_css_default.dock,
				"data-goal-bar": true,
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: `${GoalBar_module_css_default.bar} ${GoalBar_module_css_default.editBar}`,
					children: [
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.InlineEditor, {
							value: draft,
							label: t("objective.aria"),
							onChange: setDraft,
							onSave: () => {
								handleEdit();
							},
							onCancel: () => {
								setEditing(false);
							}
						}),
						actionError !== null && (0, react_jsx_runtime.jsx)("span", {
							className: GoalBar_module_css_default.error,
							role: "alert",
							children: actionError
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: GoalBar_module_css_default.actions,
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
								portal: true,
								label: t("action.save"),
								side: "bottom",
								delayMs: 500,
								children: (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: GoalBar_module_css_default.iconBtn,
									onClick: () => {
										handleEdit();
									},
									disabled: pending || draft.trim() === "",
									"aria-label": t("action.save"),
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, { size: 14 })
								})
							}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
								portal: true,
								label: t("action.cancel"),
								side: "bottom",
								delayMs: 500,
								children: (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: GoalBar_module_css_default.iconBtn,
									onClick: () => {
										setEditing(false);
									},
									disabled: pending,
									"aria-label": t("action.cancel"),
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, { size: 14 })
								})
							})]
						})
					]
				})
			});
			const title = goal.phase === "blocked" ? goal.blockedReason?.message : void 0;
			const label = goal.phase === "active" ? activeLabel(activation, t) : t(PHASE_LABELS[goal.phase]);
			const showResume = goal.phase === "paused" || goal.phase === "active" && activation === "disarmed";
			return (0, react_jsx_runtime.jsx)("div", {
				className: GoalBar_module_css_default.dock,
				"data-goal-bar": true,
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: GoalBar_module_css_default.bar,
					title,
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: GoalBar_module_css_default.goalGlyph,
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconGoalOutlineRegular, { size: 14 })
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: GoalBar_module_css_default.label,
							children: label
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: GoalBar_module_css_default.objective,
							children: goal.objective
						}),
						actionError !== null && (0, react_jsx_runtime.jsx)("span", {
							className: GoalBar_module_css_default.error,
							role: "alert",
							children: actionError
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: GoalBar_module_css_default.actions,
							children: [
								goal.phase === "active" && activation === "armed" && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
									portal: true,
									label: t("action.pause"),
									side: "bottom",
									delayMs: 500,
									children: (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: GoalBar_module_css_default.iconBtn,
										disabled: pending,
										onClick: () => {
											runAction(onPause);
										},
										"aria-label": t("action.pause"),
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPauseOutlineRegular, { size: 14 })
									})
								}),
								showResume && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
									portal: true,
									label: t("action.resume"),
									side: "bottom",
									delayMs: 500,
									children: (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: GoalBar_module_css_default.iconBtn,
										disabled: pending,
										onClick: () => {
											runAction(onResume);
										},
										"aria-label": t("action.resume"),
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlayOutlineRegular, { size: 14 })
									})
								}),
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
									portal: true,
									label: t("action.edit"),
									side: "bottom",
									delayMs: 500,
									children: (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: GoalBar_module_css_default.iconBtn,
										disabled: pending,
										onClick: () => {
											setDraft(goal.objective);
											setEditing(true);
										},
										"aria-label": t("action.edit"),
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutlineRegular, { size: 14 })
									})
								}),
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
									portal: true,
									label: t("action.clear"),
									side: "bottom",
									delayMs: 500,
									children: (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: GoalBar_module_css_default.iconBtn,
										disabled: pending,
										onClick: () => {
											handleClear(goal.id);
										},
										"aria-label": t("action.clear"),
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutlineRegular, { size: 14 })
									})
								})
							]
						})
					]
				})
			});
		}
		/** Dock adapter: overlays process-local activation on the durable goal projection. */
		function GoalDock({ useProjection, useGoalActivation, onEdit, onPause, onResume, onClear, t }) {
			const projection = useProjection("goal");
			const goal = projection === void 0 || projection === null ? projection : projection.goal;
			const goalId = goal?.id;
			const revision = goal?.revision;
			const activation = useGoalActivation((next) => next.id === goalId && next.revision === revision ? next.activation : void 0);
			return (0, react_jsx_runtime.jsx)(GoalBar, {
				goal,
				...activation === void 0 ? {} : { activation },
				onEdit,
				onPause,
				onResume,
				onClear,
				t
			});
		}
		//#endregion
		//#region lib/types/client/goal-command-input.js
		/** The command name whose runs this projection owns. */
		const GOAL_COMMAND = "goal";
		/**
		* Derive the visible command line from its structured durable run.
		* @param event - `/goal` command run.
		* @returns command text with trailing parser whitespace removed.
		*/
		function goalCommandText(event) {
			return `/${event.data.name}${(event.data.args ?? "").trimEnd()}`;
		}
		/** Goal-owned command input projection; the generic command Definition retains the result row. */
		const goalCommandInputDefinition = {
			kind: "goal-command-input",
			target: "chat",
			match: (event) => event.type === "command/run" && event.data.name === "goal" ? {
				id: String(event.data.commandId),
				role: "start"
			} : null,
			start: (_context, match) => {
				if (match.event.type !== "command/run") throw new Error("goal-command-input start requires command/run");
				return {
					commandId: match.event.data.commandId,
					seq: match.event.seq,
					time: match.event.time,
					text: goalCommandText(match.event)
				};
			},
			update: (context) => context.state,
			buildViewNode: (context) => {
				if (context.state === void 0) return null;
				return {
					key: context.key,
					kind: "command-input",
					id: context.id,
					target: "chat",
					anchorSeq: context.state.seq - .1,
					location: context.start?.location ?? { kind: "unresolved" },
					visibility: "visible",
					data: {
						commandId: context.state.commandId,
						text: context.state.text,
						time: context.state.time
					}
				};
			}
		};
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-goal/src/client/GoalCommandInputView.module.css.mjs
		const css = ".fsaSEG_row{flex-direction:column;align-items:flex-end;gap:6px;display:flex}.fsaSEG_stack{min-width:0;max-width:min(calc(var(--dsh-chat-content-width,748px) * .702), 82%);flex-direction:column;align-items:flex-end;display:flex}.fsaSEG_bubble{overflow-wrap:anywhere;border-radius:var(--dsw-radius-xl);background:var(--dsw-specific-bubble);max-width:100%;color:var(--dsw-alias-label-primary);font-size:var(--dsh-content-font-size,14px);line-height:calc(22px + var(--dsh-content-font-delta,0px));white-space:pre-wrap;padding:10px 16px}";
		const tagId = "@deepseek-ai/dsh-client-ui-goal/GoalCommandInputView.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-goal";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var GoalCommandInputView_module_css_default = {
			"bubble": "fsaSEG_bubble",
			"row": "fsaSEG_row",
			"stack": "fsaSEG_stack"
		};
		//#endregion
		//#region lib/types/client/GoalCommandInputView.js
		const GOAL_COMMANDS = [{
			start: 0,
			end: 5,
			name: GOAL_COMMAND
		}];
		/**
		* Right-aligned `/goal` input bubble without ordinary message actions. The
		* echoed line decorates its leading `/goal` token as a command chip — the run
		* this Node projects is the fact that that token was a command — and keeps
		* the objective, `/goal` mentions included, as plain text.
		*/
		const GoalCommandInputView = (0, react.memo)(function GoalCommandInputView({ node, t, renderFactorySlot }) {
			const data = node.data;
			return (0, react_jsx_runtime.jsx)("div", {
				className: GoalCommandInputView_module_css_default.row,
				"data-command-input": "",
				role: "group",
				"aria-label": t("commandInput.aria"),
				children: (0, react_jsx_runtime.jsx)("div", {
					className: GoalCommandInputView_module_css_default.stack,
					children: (0, react_jsx_runtime.jsx)("div", {
						className: GoalCommandInputView_module_css_default.bubble,
						children: renderFactorySlot("conversation.user.text", {
							text: data.text,
							facts: { commands: GOAL_COMMANDS },
							interactive: false
						})
					})
				})
			});
		});
		//#endregion
		//#region lib/types/client/GoalCommandReference.js
		/**
		* Render one confirmed command token without adding an activation action.
		* @param props - resolved command node and its original spelling.
		* @returns a noninteractive inline command chip.
		*/
		function GoalCommandReference({ node, raw }) {
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ReferenceChip, {
				appearance: "command",
				label: `/${node.data.name}`,
				title: raw
			});
		}
		//#endregion
		//#region lib/types/client/user-text-rules.js
		/** Return the nearest exact confirmed command, checking boundaries against the original string. */
		const goalCommandReferenceRule = {
			id: "command",
			order: 20,
			match(text, from, context) {
				const slash = /(?<!\S)\//gu;
				slash.lastIndex = from;
				if (!slash.test(text)) return void 0;
				const commands = context.read("commands");
				let best;
				for (const { start, end, name } of commands ?? []) {
					if (start < from || end > text.length || text.slice(start, end) !== `/${name}` || start !== 0 && !/\s/u.test(text.slice(start - 1, start)) || end !== text.length && !/\s/u.test(text.slice(end, end + 1))) continue;
					if (best === void 0 || start < best.start || start === best.start && end > best.end) best = {
						id: "command",
						start,
						end,
						data: { name }
					};
				}
				return best;
			}
		};
		//#endregion
		//#region lib/types/client/locales.js
		/** `goal` namespace dictionaries. */
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"phase.active": "进行中的目标",
			"phase.active.disarmed": "已暂停的目标",
			"phase.paused": "已暂停的目标",
			"phase.blocked": "受阻的目标",
			"objective.aria": "目标内容",
			"commandInput.aria": "指令输入",
			"action.save": "保存目标",
			"action.cancel": "取消编辑",
			"action.pause": "暂停目标",
			"action.resume": "恢复目标",
			"action.edit": "编辑目标",
			"action.clear": "清除目标"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"phase.active": "Ongoing Goal",
			"phase.active.disarmed": "Inactive Goal",
			"phase.paused": "Paused Goal",
			"phase.blocked": "Blocked Goal",
			"objective.aria": "Goal objective",
			"commandInput.aria": "Command input",
			"action.save": "Save goal",
			"action.cancel": "Cancel edit",
			"action.pause": "Pause goal",
			"action.resume": "Resume goal",
			"action.edit": "Edit goal",
			"action.clear": "Clear goal"
		};
		/** Japanese copy, checked against the English keys. */
		const ja = {
			"phase.active": "進行中の目標",
			"phase.active.disarmed": "非アクティブな目標",
			"phase.paused": "一時停止中の目標",
			"phase.blocked": "ブロックされた目標",
			"objective.aria": "目標の目的",
			"commandInput.aria": "コマンド入力",
			"action.save": "目標を保存",
			"action.cancel": "編集をキャンセル",
			"action.pause": "目標を一時停止",
			"action.resume": "目標を再開",
			"action.edit": "目標を編集",
			"action.clear": "目標をクリア"
		};
		/** Spanish dictionary, checked against the English keys. */
		const es = {
			"phase.active": "Meta en curso",
			"phase.active.disarmed": "Meta inactiva",
			"phase.paused": "Objetivo en pausa",
			"phase.blocked": "Meta bloqueada",
			"objective.aria": "Objetivo de meta",
			"commandInput.aria": "Entrada de comando",
			"action.save": "Guardar gol",
			"action.cancel": "Cancelar edición",
			"action.pause": "Pausar objetivo",
			"action.resume": "Reanudar objetivo",
			"action.edit": "Editar objetivo",
			"action.clear": "Objetivo claro"
		};
		/** French dictionary, checked against the English keys. */
		const fr = {
			"phase.active": "Objectif continu",
			"phase.active.disarmed": "Objectif inactif",
			"phase.paused": "Objectif suspendu",
			"phase.blocked": "Objectif bloqué",
			"objective.aria": "Objectif du but",
			"commandInput.aria": "Entrée de commande",
			"action.save": "Sauvegarder l'objectif",
			"action.cancel": "Annuler la modification",
			"action.pause": "Suspendre l'objectif",
			"action.resume": "Reprendre l'objectif",
			"action.edit": "Modifier l'objectif",
			"action.clear": "Objectif clair"
		};
		/** German dictionary, checked against the English keys. */
		const de = {
			"phase.active": "Fortlaufendes Ziel",
			"phase.active.disarmed": "Inaktives Ziel",
			"phase.paused": "Pausiertes Ziel",
			"phase.blocked": "Blockiertes Ziel",
			"objective.aria": "Zielziel",
			"commandInput.aria": "Befehlseingabe",
			"action.save": "Ziel speichern",
			"action.cancel": "Bearbeitung abbrechen",
			"action.pause": "Ziel pausieren",
			"action.resume": "Ziel fortsetzen",
			"action.edit": "Ziel bearbeiten",
			"action.clear": "Klares Ziel"
		};
		/** Russian dictionary, checked against the English keys. */
		const ru = {
			"phase.active": "Текущая цель",
			"phase.active.disarmed": "Неактивная цель",
			"phase.paused": "Приостановленная цель",
			"phase.blocked": "Заблокированная цель",
			"objective.aria": "Цель Цель",
			"commandInput.aria": "Ввод команды",
			"action.save": "Сохранить цель",
			"action.cancel": "Отменить редактирование",
			"action.pause": "Приостановить цель",
			"action.resume": "Возобновить цель",
			"action.edit": "Изменить цель",
			"action.clear": "Четкая цель"
		};
		/** Portuguese dictionary, checked against the English keys. */
		const pt = {
			"phase.active": "Meta contínua",
			"phase.active.disarmed": "Meta inativa",
			"phase.paused": "Meta pausada",
			"phase.blocked": "Meta bloqueada",
			"objective.aria": "Objetivo da meta",
			"commandInput.aria": "Entrada de comando",
			"action.save": "Salvar meta",
			"action.cancel": "Cancelar edição",
			"action.pause": "Pausar meta",
			"action.resume": "Retomar meta",
			"action.edit": "Editar meta",
			"action.clear": "Objetivo claro"
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Dictionary namespace owned by this plugin. */
		const NS = "goal";
		/** Required services for the Goal dock, command-input projection, Remote mutations, and copy. */
		const inject = [
			"slots",
			"sessions",
			"remote",
			"remote.goals",
			"locale",
			"uiConversation"
		];
		/**
		* Client plugin body: the GoalBar dock entry with its mutation verbs.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.uiConversation.events.register(goalCommandInputDefinition);
			ctx.uiConversation.userText.register(goalCommandReferenceRule);
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}), "ui-goal: dictionaries");
			ctx.slots.inject("conversation.user.text.node", () => ctx.slots.register({
				name: "conversation.user.text.node",
				key: "command",
				priority: 100
			}, GoalCommandReference));
			ctx.slots.inject("conversation.chat.node", () => ctx.slots.register({
				name: "conversation.chat.node",
				key: "command-input",
				locale: NS
			}, GoalCommandInputView));
			const sessions = ctx.sessions;
			/** The session's current projected CAS ref, read at verb call time (no staleness fence: the RPC's CAS is the guard). */
			const refOf = (sessionId) => {
				const projection = (sessions.binding(sessionId)?.session.projections.faceOf("goal"))?.getSnapshot();
				if (projection == null) return void 0;
				return {
					id: projection.goal.id,
					revision: projection.goal.revision
				};
			};
			const noCurrentGoal = {
				ok: false,
				error: {
					code: "no-current-goal",
					message: "no current goal to mutate"
				}
			};
			ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
				name: "conversation.input.dock",
				id: "goal",
				order: 10,
				locale: NS,
				inject: (sessionId) => {
					const binding = sessions.binding(sessionId);
					if (binding === void 0) throw new Error(`ui-goal: session "${sessionId}" is unavailable`);
					return {
						hooks: { goalActivation: createGoalActivationSource({
							projection: binding.session.projections.faceOf("goal"),
							session: binding.session,
							getGoal: async () => {
								if (sessions.binding(sessionId) !== binding) throw new Error(`ui-goal: session "${sessionId}" is unavailable`);
								return sessions.using(sessionId, { source: "goalActivation" }, async (reference) => {
									const state = reference.binding.session.getSnapshot();
									if (state.openState !== "open") throw state.openError ?? /* @__PURE__ */ new Error(`session "${sessionId}" is not open`);
									return ctx.remote.goals.get(sessionId);
								});
							},
							subscribeActivation: (listener) => ctx.remote.$on("goal/activation-changed", (event) => {
								if (event.sessionId === sessionId) listener(event.goal);
							}),
							subscribeReset: (listener) => ctx.on("connection/reset", listener)
						}) },
						onEdit: async (objective) => {
							const ref = refOf(sessionId);
							if (ref === void 0) return noCurrentGoal;
							return await ctx.remote.goals.edit(sessionId, ref, { objective });
						},
						onPause: async () => {
							const ref = refOf(sessionId);
							if (ref === void 0) return noCurrentGoal;
							return await ctx.remote.goals.pause(sessionId, ref);
						},
						onResume: async () => {
							const ref = refOf(sessionId);
							if (ref === void 0) return noCurrentGoal;
							return await ctx.remote.goals.resume(sessionId, ref);
						},
						onClear: async () => {
							const ref = refOf(sessionId);
							if (ref === void 0) return noCurrentGoal;
							return await ctx.remote.goals.clear(sessionId, ref);
						}
					};
				}
			}, GoalDock));
		}
		//#endregion
		exports.GoalBar = GoalBar;
		exports.GoalDock = GoalDock;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
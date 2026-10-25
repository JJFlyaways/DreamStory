window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-approval",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-approval/src/client/ApprovalPanel.module.css.mjs
		const css = ".puj3AW_root{padding:8px calc(var(--dsh-composer-side-clearance) + 16px) 12px;flex-direction:column;align-items:center;display:flex}.puj3AW_card{width:100%;max-width:var(--dsh-chat-content-width);border:1px solid var(--dsw-alias-state-warn-secondary);border-radius:var(--dsw-radius-xl);background:var(--dsw-specific-input-major);box-shadow:var(--dsw-shadow-lv2);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);overflow:hidden}.puj3AW_strip{background:var(--dsw-alias-state-warn-tertiary);color:var(--dsw-alias-state-warn-primary);align-items:center;gap:8px;padding:10px 16px;font-size:13px;line-height:18px;display:flex}.puj3AW_body{box-sizing:border-box;max-height:var(--dsh-composer-text-max-height);flex-direction:column;gap:6px;padding:12px 16px 0;display:flex;overflow-y:auto}.puj3AW_headline{color:var(--dsw-alias-label-primary);font-size:15px;font-weight:500;line-height:24px}.puj3AW_command{color:var(--dsw-alias-label-tertiary);font-family:var(--ds-font-family-code);word-break:break-all;font-size:13px;line-height:20px}.puj3AW_actionRow{justify-content:flex-end;gap:8px;padding:14px 16px;display:flex}@media (hover:hover){.puj3AW_reject:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary);--dsh-button-outline-color:transparent}}.puj3AW_subject{color:var(--dsw-alias-label-primary);align-items:center;gap:12px;font-size:16px;display:flex}.puj3AW_subject img{object-fit:contain;flex-shrink:0}.puj3AW_description{color:var(--dsw-alias-label-secondary);margin:0;font-size:13px;line-height:20px}.puj3AW_withSubject .puj3AW_body{text-align:left}.puj3AW_withSubject .puj3AW_actionRow{flex-wrap:wrap}";
		const tagId = "@deepseek-ai/dsh-client-ui-approval/ApprovalPanel.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-approval";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var ApprovalPanel_module_css_default = {
			"actionRow": "puj3AW_actionRow",
			"body": "puj3AW_body",
			"card": "puj3AW_card",
			"command": "puj3AW_command",
			"description": "puj3AW_description",
			"headline": "puj3AW_headline",
			"reject": "puj3AW_reject",
			"root": "puj3AW_root",
			"strip": "puj3AW_strip",
			"subject": "puj3AW_subject",
			"withSubject": "puj3AW_withSubject"
		};
		//#endregion
		//#region lib/types/client/ApprovalCard.js
		/** Shared approval presentation; each caller retains its decision policy and answer channel. */
		/**
		* Render one decision with caller-owned actions and an optional persistent choice.
		* @param props Request identity, copy, actions and correlated detail.
		* @returns The shared approval card, reset for each request.
		*/
		function ApprovalCard(props) {
			return (0, react_jsx_runtime.jsx)(ApprovalFlow, { ...props }, props.requestKey);
		}
		function ApprovalFlow(props) {
			const { requestKey, title, description, subject, allowLabel, canAnswer, onAllow, onReject, onAlways, t } = props;
			const detail = props.callId === void 0 ? null : props.renderSlot("conversation.approval.detail", { callId: props.callId });
			const [answered, setAnswered] = (0, react.useState)(false);
			const waiting = (0, react.useRef)(false);
			const active = (0, react.useRef)(true);
			const composing = (0, react.useRef)(false);
			const compositionEnded = (0, react.useRef)(false);
			(0, react.useEffect)(() => {
				active.current = true;
				return () => {
					active.current = false;
				};
			}, []);
			const answer = (send) => {
				if (waiting.current || !canAnswer()) return;
				waiting.current = true;
				setAnswered(true);
				send().catch(() => {
					if (!active.current || !canAnswer()) return;
					waiting.current = false;
					setAnswered(false);
				});
			};
			const keydown = (event) => {
				const element = event.target;
				if (event.defaultPrevented || !event.currentTarget.contains(document.activeElement) || element.closest("input, textarea, select, [contenteditable=\"true\"], [contenteditable=\"\"]") !== null) return;
				if (event.key !== "Enter" && event.key !== "Escape") return;
				if (event.key === "Enter" && element.closest("button, a[href], [role=\"button\"]") !== null) return;
				if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
				event.preventDefault();
				event.stopPropagation();
				if (event.repeat || composing.current || compositionEnded.current || event.nativeEvent.isComposing || event.keyCode === 229) return;
				answer(event.key === "Enter" ? onAllow : onReject);
			};
			return (0, react_jsx_runtime.jsx)("div", {
				className: ApprovalPanel_module_css_default.root,
				"data-approval-key": requestKey,
				"aria-busy": answered,
				onKeyDown: keydown,
				onKeyUpCapture: () => {
					compositionEnded.current = false;
				},
				onCompositionStartCapture: () => {
					composing.current = true;
				},
				onCompositionEndCapture: () => {
					composing.current = false;
					compositionEnded.current = true;
				},
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: subject === void 0 ? ApprovalPanel_module_css_default.card : `${ApprovalPanel_module_css_default.card} ${ApprovalPanel_module_css_default.withSubject}`,
					children: [
						(0, react_jsx_runtime.jsxs)("div", {
							className: ApprovalPanel_module_css_default.strip,
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: answered ? "ongoing" : "warning" }), t("waiting")]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: ApprovalPanel_module_css_default.body,
							"data-approval-scroll": "",
							tabIndex: 0,
							role: "group",
							"aria-label": t("detail.aria"),
							children: [
								subject !== void 0 && (0, react_jsx_runtime.jsxs)("div", {
									className: ApprovalPanel_module_css_default.subject,
									children: [subject.icon !== void 0 && (0, react_jsx_runtime.jsx)("img", {
										src: subject.icon,
										alt: "",
										width: 40,
										height: 40,
										draggable: false
									}), (0, react_jsx_runtime.jsx)("strong", { children: subject.name })]
								}),
								(0, react_jsx_runtime.jsx)("div", {
									className: ApprovalPanel_module_css_default.headline,
									children: title
								}),
								description !== void 0 && (0, react_jsx_runtime.jsx)("p", {
									className: ApprovalPanel_module_css_default.description,
									children: description
								}),
								detail !== null && (0, react_jsx_runtime.jsx)("div", {
									className: ApprovalPanel_module_css_default.command,
									children: detail
								})
							]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: ApprovalPanel_module_css_default.actionRow,
							children: [
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									className: ApprovalPanel_module_css_default.reject,
									disabled: answered,
									onClick: () => {
										answer(onReject);
									},
									children: t("reject")
								}),
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: onAlways === void 0 ? "primary" : "outline",
									disabled: answered,
									onClick: () => {
										answer(onAllow);
									},
									children: allowLabel ?? t("allowOnce")
								}),
								onAlways !== void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "primary",
									disabled: answered,
									onClick: () => {
										answer(onAlways);
									},
									children: t("allowAlways")
								})
							]
						})
					]
				})
			});
		}
		//#endregion
		//#region lib/types/client/ApprovalPanel.js
		/**
		* Render the shared card using the tool approval's one-shot decision policy.
		* @param props Selector-matched request and standard Slot props.
		* @returns The approval composer takeover.
		*/
		function ApprovalPanel(props) {
			const approval = props.matched;
			const reason = approval.displayReason === void 0 ? approval.reason : props.resolveReason(approval.displayReason);
			return props.renderFactorySlot("conversation.approval.card", {
				requestKey: approval.key,
				title: reason ?? props.t("escalation", { toolName: approval.toolName }),
				...approval.callId === void 0 ? {} : { callId: approval.callId },
				canAnswer: () => approval.answerable,
				onAllow: () => approval.answer("allowed-once"),
				onReject: () => approval.answer("rejected")
			});
		}
		//#endregion
		//#region lib/types/client/contract/slots.js
		function settlePendingComposer(settle, failureMessage) {
			try {
				settle();
				return Promise.resolve();
			} catch (error) {
				return Promise.reject(error instanceof Error ? error : new Error(failureMessage, { cause: error }));
			}
		}
		let nextApprovalKey = 0;
		/** One answerable Client presentation of a pending Host waterfall. */
		var PendingApproval = class {
			sessionId;
			/** Domain discriminator used by Session pending-interaction consumers. */
			kind;
			/** Opaque render identity and one-shot remount axis. */
			key;
			/** Tool requesting the decision. */
			toolName;
			/** Correlated Tool call, when supplied by the asker. */
			callId;
			/** Human-readable reason supplied by the asker. */
			reason;
			/** Localized presentation copy, when supplied by the asker. */
			displayReason;
			/** Result returned by the Remote Event listener to the Host waterfall. */
			result;
			#resolve;
			#reject;
			#signal;
			#onAbort;
			#delegated = Symbol("pending approval delegated");
			#settled = false;
			/**
			* @param sessionId - Agent/Session identity owning the scoped request.
			* @param request - Host approval request projected through the Remote Event.
			*/
			constructor(sessionId, request) {
				this.sessionId = sessionId;
				this.kind = "approval";
				nextApprovalKey += 1;
				this.key = `approval:${String(nextApprovalKey)}`;
				this.toolName = request.toolName;
				this.callId = request.callId;
				this.reason = request.reason;
				this.displayReason = request.displayReason;
				const completion = Promise.withResolvers();
				this.result = completion.promise;
				this.#resolve = completion.resolve;
				this.#reject = completion.reject;
				this.#signal = request.signal;
				if (request.signal === void 0) {
					this.#onAbort = void 0;
					return;
				}
				const onAbort = () => {
					this.abort(request.signal?.reason ?? /* @__PURE__ */ new Error("approval request was aborted"));
				};
				this.#onAbort = onAbort;
				request.signal.addEventListener("abort", onAbort, { once: true });
				if (request.signal.aborted) onAbort();
			}
			/**
			* Availability of this pending request after answer or withdrawal.
			* @returns whether this request can still accept a decision.
			*/
			get answerable() {
				return !this.#settled;
			}
			/**
			* Resolve the Host waterfall with the user's decision.
			* @param outcome - supported interactive decision.
			*/
			answer(outcome) {
				return settlePendingComposer(() => {
					this.finish(() => {
						this.#resolve(outcome);
					});
				}, "pending approval settlement failed");
			}
			/** Delegate an unanswered request to the next waterfall listener. */
			delegate() {
				if (this.#settled) return;
				this.finish(() => {
					this.#reject(this.#delegated);
				});
			}
			/**
			* Test whether a rejection requests waterfall delegation.
			* @param reason - rejection received from {@link PendingApproval.result}.
			* @returns whether {@link PendingApproval.delegate} produced it.
			*/
			isDelegation(reason) {
				return reason === this.#delegated;
			}
			/**
			* End an unanswered presentation when its transport, scope, or plugin lifetime ends.
			* @param reason - rejection exposed to the waiting Remote Event listener.
			*/
			abort(reason) {
				if (this.#settled) return;
				this.finish(() => {
					this.#reject(reason);
				});
			}
			finish(settle) {
				if (this.#settled) throw new Error(`pending approval ${this.key} is already settled`);
				this.#settled = true;
				if (this.#signal !== void 0 && this.#onAbort !== void 0) this.#signal.removeEventListener("abort", this.#onAbort);
				settle();
			}
		};
		//#endregion
		//#region lib/types/client/locales.js
		/** `approval` namespace dictionaries. */
		/** Simplified Chinese dictionary and key-set source of truth. */
		const zh = {
			waiting: "等待审批",
			"detail.aria": "审批详情",
			escalation: "工具 {toolName} 请求越权执行",
			reject: "拒绝",
			allow: "允许",
			allowOnce: "允许一次",
			allowAlways: "始终允许"
		};
		/** English dictionary, checked against the Chinese key set. */
		const en = {
			waiting: "Waiting for approval",
			"detail.aria": "Approval details",
			escalation: "Tool {toolName} requests privileged execution",
			reject: "Reject",
			allow: "Allow",
			allowOnce: "Allow once",
			allowAlways: "Always allow"
		};
		/** Japanese copy, checked against the English keys. */
		const ja = {
			"waiting": "承認待ち",
			"detail.aria": "承認の詳細",
			"escalation": "ツール {toolName} が特権実行を要求しています",
			"reject": "拒否",
			"allow": "許可",
			"allowOnce": "1 回だけ許可",
			"allowAlways": "常に許可"
		};
		/** Spanish dictionary, checked against the English keys. */
		const es = {
			waiting: "Esperando aprobación",
			"detail.aria": "Detalles de aprobación",
			escalation: "La herramienta {toolName} solicita ejecución privilegiada",
			reject: "Rechazar",
			allow: "Permitir",
			allowOnce: "permitir una vez",
			allowAlways: "Permitir siempre"
		};
		/** French dictionary, checked against the English keys. */
		const fr = {
			waiting: "En attente d'approbation",
			"detail.aria": "Détails de l'approbation",
			escalation: "L'outil {toolName} demande une exécution privilégiée",
			reject: "Rejeter",
			allow: "Autoriser",
			allowOnce: "Autoriser une fois",
			allowAlways: "Toujours autoriser"
		};
		/** German dictionary, checked against the English keys. */
		const de = {
			waiting: "Warten auf Genehmigung",
			"detail.aria": "Einzelheiten zur Genehmigung",
			escalation: "Tool {toolName} fordert privilegierte Ausführung an",
			reject: "Ablehnen",
			allow: "Erlauben",
			allowOnce: "Einmal zulassen",
			allowAlways: "Immer zulassen"
		};
		/** Russian dictionary, checked against the English keys. */
		const ru = {
			waiting: "Ожидание одобрения",
			"detail.aria": "Детали утверждения",
			escalation: "Инструмент {toolName} запрашивает привилегированное выполнение",
			reject: "Отклонить",
			allow: "Разрешить",
			allowOnce: "Разрешить один раз",
			allowAlways: "Всегда разрешать"
		};
		/** Portuguese dictionary, checked against the English keys. */
		const pt = {
			waiting: "Aguardando aprovação",
			"detail.aria": "Detalhes de aprovação",
			escalation: "A ferramenta {toolName} solicita execução privilegiada",
			reject: "Rejeitar",
			allow: "Permitir",
			allowOnce: "Permitir uma vez",
			allowAlways: "Sempre permitir"
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Required services: Agent scopes, Remote Events, Session UI, Slot registry, and copy. */
		const inject = [
			"sessions",
			"remote",
			"uiSession",
			"slots",
			"locale"
		];
		const NS = "approval";
		/** Present one request until the user answers or its lifetime ends. */
		async function answerApproval(ctx, owner, request, next, registerPendingInteraction) {
			const sessionId = ctx.sessions.scopeOf(owner);
			if (sessionId === void 0) return next();
			const pending = new PendingApproval(sessionId, {
				toolName: request.toolName,
				...request.callId === void 0 ? {} : { callId: request.callId },
				...request.reason === void 0 ? {} : { reason: request.reason },
				...request.displayReason === void 0 ? {} : { displayReason: request.displayReason },
				...request.signal === void 0 ? {} : { signal: request.signal }
			});
			const completed = Promise.withResolvers();
			const remove = registerPendingInteraction(pending, async () => {
				pending.delegate();
				await completed.promise;
			});
			try {
				try {
					return await pending.result;
				} catch (error) {
					if (pending.isDelegation(error)) return await next();
					throw error;
				}
			} finally {
				remove();
				completed.resolve();
			}
		}
		/**
		* Install approval copy and the scoped waterfall consumer.
		* @param ctx - Client root context.
		*/
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
			}), "ui-approval: dictionaries");
			ctx.inject(["shortcuts"], (scope) => {
				const t = ctx.locale.bind(NS);
				scope.effect(() => scope.shortcuts.registerFixed({
					id: "approval.allow",
					label: () => t("allow"),
					keys: ["Enter"],
					bindings: [{
						code: "Enter",
						modifiers: []
					}],
					group: "approval"
				}), "ui-approval: fixed allow reference");
				scope.effect(() => scope.shortcuts.registerFixed({
					id: "approval.reject",
					label: () => t("reject"),
					keys: ["Esc"],
					bindings: [{
						code: "Escape",
						modifiers: []
					}],
					group: "approval"
				}), "ui-approval: fixed reject reference");
			});
			const registerPendingInteraction = ctx.uiSession.registerPendingInteraction(() => 0);
			ctx.slots.registerFactory({
				name: "conversation.approval.card",
				scope: "session",
				locale: NS,
				children: { "conversation.approval.detail": {
					kind: "single",
					scope: "session"
				} }
			}, ApprovalCard);
			ctx.slots.inject("conversation.composer", () => ctx.slots.register({
				name: "conversation.composer",
				priority: 1,
				select: ({ pendingInteraction }) => pendingInteraction instanceof PendingApproval ? pendingInteraction : null,
				locale: NS,
				inject: () => ({ resolveReason: (reason) => ctx.locale.resolveText(reason) })
			}, ApprovalPanel));
			ctx.remote.$on("approval/request", function(request, next) {
				return answerApproval(ctx, this, request, next, registerPendingInteraction);
			});
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
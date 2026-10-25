window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-user-questions",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region ../../util/brand/src/index.ts
		/**
		* Apply a compile-time string brand without changing the value.
		* @param value - string admitted by the domain that owns the target brand.
		* @returns the same string with the requested compile-time brand.
		*/
		function brandString(value) {
			return value;
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
		/**
		* Narrow a request to a renderable plan review, or return undefined to leave it
		* to the generic question flow.
		*
		* The card offers approval and a return to the composer for change requests.
		* It accepts one question carrying the plan as detail and the named approve
		* option, with at most one alternative and no multi-select. Larger choices
		* remain in the generic question flow.
		*
		* @param questions - the request's whole question batch.
		* @returns The narrowed review, or undefined when the generic flow owns it.
		*/
		function planReviewOf(questions) {
			if (questions.length !== 1) return void 0;
			const question = questions[0];
			const intent = question.intent;
			if (intent?.kind !== "plan-review" || question.detail === void 0) return void 0;
			if (question.multiSelect === true) return void 0;
			const options = question.options ?? [];
			if (options.length > 2) return void 0;
			const approve = options.find((option) => option.label === intent.approve);
			if (approve === void 0) return void 0;
			const decline = options.find((option) => option.label !== intent.approve);
			return {
				id: question.id,
				question: question.question,
				plan: question.detail,
				...intent.callId === void 0 ? {} : { callId: intent.callId },
				approve,
				...decline === void 0 ? {} : { decline }
			};
		}
		/** Reload-unique prefix so an unnamed legacy card cannot reuse a persisted draft. */
		const unnamedQuestionPrefix = Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, "0")).join("");
		let nextQuestionKey = 0;
		const rejectionMessages = {
			ASK_ABORTED: "ask_user_question was aborted before the user answered",
			ASK_CANCELLED: "the user cancelled ask_user_question",
			ASK_TIMED_OUT: "ask_user_question timed out before the user answered"
		};
		/** Create a wire-preserved user-question rejection. */
		function questionError(code) {
			const error = new Error(rejectionMessages[code]);
			error.name = "UserQuestionError";
			error.code = code;
			return error;
		}
		/**
		* Create the deferred one Remote Event listener settles through a card.
		* The request signal ends the channel with `ASK_ABORTED`; the Host ignores that
		* outcome for an event it already finished, so a cancel frame loses nothing.
		* @param deadline - Client-clock deadline in epoch milliseconds derived from the business claim's remaining duration.
		* @param signal - Delivery lifetime of the forwarded request.
		* @param onSettle - Called once with the channel when it settles or aborts.
		* @returns The channel to attach and the promise the listener awaits.
		*/
		function createWaterfallRequest(deadline, signal, onSettle) {
			const completion = Promise.withResolvers();
			const delegated = Symbol("pending question delegated");
			let settled = false;
			const finish = (settle) => {
				if (settled) return;
				settled = true;
				signal?.removeEventListener("abort", onAbort);
				settle();
				onSettle(channel);
			};
			const onAbort = () => {
				finish(() => {
					completion.reject(questionError("ASK_ABORTED"));
				});
			};
			const channel = {
				deadline,
				resolve: (answer) => {
					finish(() => {
						completion.resolve(answer);
					});
				},
				reject: (code) => {
					finish(() => {
						completion.reject(questionError(code));
					});
				},
				delegate: () => {
					finish(() => {
						completion.reject(delegated);
					});
				}
			};
			if (signal !== void 0) {
				signal.addEventListener("abort", onAbort, { once: true });
				if (signal.aborted) onAbort();
			}
			return {
				channel,
				result: completion.promise,
				isDelegation: (reason) => reason === delegated
			};
		}
		/**
		* One answerable Client card. A card keyed by tool call is created by whichever
		* source arrives first, the forwarded waterfall or the Session projection, and
		* removed only when the projection no longer lists the call.
		*/
		var PendingQuestion = class PendingQuestion {
			/** Presentation discriminator used by Session pending-interaction consumers. */
			kind;
			/** Render identity and request key for the Session-scoped draft store. */
			key;
			/** Agent/Session identity owning the request. */
			sessionId;
			/** The request's question list. */
			questions;
			/** Tool call identity; absent for a blocking request that carried no `wait`. */
			callId;
			/**
			* Recorded answers of a call that already settled. Present only on a
			* read-only review card, which the tool call row builds from its own
			* transcript so a finished question can be read back in the panel that
			* asked it. Such a card has no answer channel and no countdown.
			*/
			review;
			/**
			* What closing the panel does. A card keyed by tool call stays reachable
			* from its tool call row, so closing only withdraws the panel (`hide`) and
			* persists nothing. A card the Host never named has no way back, so closing
			* it ends the request (`cancel`).
			*/
			dismissal;
			#state = "open";
			#waterfall;
			#rpc;
			#seat;
			#timedWait = false;
			#timer;
			#deadline;
			#remainingMs;
			#focused = false;
			#engaged = false;
			#held = false;
			#closed = false;
			#siblings;
			#listeners = /* @__PURE__ */ new Set();
			#snapshot;
			/**
			* @param sessionId - Agent/Session identity owning the request.
			* @param questions - complete question batch.
			* @param callId - tool call identity when the Host named one.
			* @param siblings - keys of every card currently registered for the Session, for draft pruning.
			* @param review - recorded answers of a settled call, making this a read-only card.
			*/
			constructor(sessionId, questions, callId, siblings, review) {
				this.sessionId = sessionId;
				this.questions = questions;
				this.kind = planReviewOf(questions) === void 0 ? "question" : "plan-review";
				this.callId = callId;
				this.review = review;
				this.dismissal = callId === void 0 ? "cancel" : "hide";
				this.#siblings = siblings;
				if (callId === void 0) nextQuestionKey += 1;
				this.key = callId === void 0 ? `question:${unnamedQuestionPrefix}:${String(nextQuestionKey)}` : PendingQuestion.keyOf(sessionId, callId);
				this.#snapshot = this.createSnapshot();
			}
			/**
			* Card key of a tool call, shared by every source that names one. The Host
			* request and the Session projection carry the branded `ToolCallId`; a
			* transcript row carries the same wire value as a plain string.
			* @param sessionId - owning Session.
			* @param callId - tool call identity, branded or as a transcript spells it.
			* @returns the render identity and draft key.
			*/
			static keyOf(sessionId, callId) {
				return `question:${String(sessionId)}:${callId}`;
			}
			/**
			* Draft keys that are still live in this Session, this card included.
			* @returns keys the draft store must keep; everything else is stale.
			*/
			liveKeys() {
				return this.#siblings?.() ?? [this.key];
			}
			/** Subscribe to card state changes. */
			subscribe = (listener) => {
				this.#listeners.add(listener);
				return () => {
					this.#listeners.delete(listener);
				};
			};
			/** Read the stable current card state. */
			snapshot = () => this.#snapshot;
			/** Observable snapshot read by the renderer's keyed Hook. */
			getSnapshot = this.snapshot;
			createSnapshot() {
				const channel = this.#waterfall !== void 0 ? "waterfall" : this.#state === "continued" && this.#rpc !== void 0 ? "rpc" : "none";
				const waitState = this.#state === "continued" ? "continued" : this.#held ? "waiting" : this.#engaged ? "editing" : this.#focused ? "focused" : "counting";
				return {
					state: this.#state,
					waitState,
					countdown: this.#timedWait ? {
						remainingMs: this.#deadline === void 0 ? this.#remainingMs ?? 0 : Math.max(0, this.#deadline - Date.now()),
						running: this.#deadline !== void 0
					} : void 0,
					channel,
					closed: this.#closed
				};
			}
			publish() {
				this.#snapshot = this.createSnapshot();
				this.#reschedule();
				for (const listener of this.#listeners) listener();
			}
			/**
			* Own the countdown here rather than in a mounted component: the panel can be
			* hidden and remounted while the request stands, and a timer that died with
			* the component would leave the tool call waiting past its deadline.
			*/
			#reschedule() {
				const wanted = this.#deadline !== void 0 && !this.#closed;
				if (wanted === (this.#timer !== void 0)) return;
				if (!wanted) {
					clearInterval(this.#timer);
					this.#timer = void 0;
					return;
				}
				this.#timer = setInterval(() => {
					this.#tick();
				}, 1e3);
			}
			#tick() {
				const deadline = this.#deadline;
				/* v8 ignore next -- #reschedule clears the interval in the same publish that drops the deadline. */
				if (deadline === void 0) return;
				if (Date.now() >= deadline) {
					this.timeout();
					return;
				}
				this.publish();
			}
			/**
			* Attach the live waterfall of a forwarded request.
			* @param channel - request channel created by {@link createWaterfallRequest}.
			*/
			attachWaterfall(channel) {
				this.#waterfall = channel;
				this.#timedWait = channel.deadline !== void 0;
				if (!this.#held && !this.#engaged) {
					this.#deadline = channel.deadline;
					if (this.#focused && channel.deadline !== void 0) {
						this.#remainingMs = Math.max(0, channel.deadline - Date.now());
						this.#deadline = void 0;
					}
				}
				this.publish();
			}
			/**
			* Drop a waterfall channel that settled or was cancelled; the card stays.
			* @param channel - the channel that ended.
			*/
			detachWaterfall(channel) {
				if (this.#waterfall !== channel) return;
				this.#waterfall = void 0;
				this.#timedWait = false;
				this.#deadline = void 0;
				this.publish();
			}
			/**
			* Whether a live waterfall is attached.
			* @returns whether the pending Host request still accepts settlement.
			*/
			hasWaterfall() {
				return this.#waterfall !== void 0;
			}
			/**
			* Attach the Remote answer path used once the question is continued.
			* @param channel - Remote calls bound to this Session and call.
			*/
			attachRpc(channel) {
				this.#rpc = channel;
				this.publish();
			}
			/**
			* Attach the composer seat this card is published into.
			* @param seat - withdrawal of the published panel, owned by the card registry.
			*/
			attachSeat(seat) {
				this.#seat = seat;
			}
			/**
			* Copy the projection row state.
			* @param state - `open` or `continued`.
			*/
			setState(state) {
				if (this.#state === state) return;
				this.#state = state;
				this.publish();
			}
			/** Stop this Client's countdown indefinitely; the waterfall then waits like a blocking question. */
			takeTime() {
				if (this.#held) return;
				this.#held = true;
				this.#focused = false;
				this.#remainingMs = void 0;
				this.#deadline = void 0;
				this.publish();
			}
			/**
			* Record focus even before the request arrives, freezing a pristine countdown once attached.
			* @param now - current Client epoch time.
			*/
			holdFocus(now = Date.now()) {
				if (this.#held || this.#engaged || this.#focused) return;
				this.#remainingMs = this.#deadline === void 0 ? void 0 : Math.max(0, this.#deadline - now);
				this.#deadline = void 0;
				this.#focused = true;
				this.publish();
			}
			/**
			* Resume a pristine countdown after the answer surface loses focus.
			* @param now - current Client epoch time.
			*/
			releaseFocus(now = Date.now()) {
				if (!this.#focused) return;
				this.#focused = false;
				this.#deadline = this.#timedWait && this.#remainingMs !== void 0 ? now + this.#remainingMs : void 0;
				this.#remainingMs = void 0;
				this.publish();
			}
			/**
			* Keep the first edited draft answerable without a foreground deadline.
			* @param now - current Client epoch time used to preserve the remaining duration.
			*/
			engage(now = Date.now()) {
				if (this.#held || this.#engaged) return;
				if (this.#remainingMs === void 0 && this.#deadline !== void 0) this.#remainingMs = Math.max(0, this.#deadline - now);
				this.#engaged = true;
				this.#focused = false;
				this.#deadline = void 0;
				this.publish();
			}
			/** Local countdown reached zero: settle the waterfall with `ASK_TIMED_OUT`, keep the card. */
			timeout() {
				if (this.#held || this.#engaged || this.#focused) return;
				const channel = this.#waterfall;
				if (channel === void 0) return;
				this.#waterfall = void 0;
				this.#timedWait = false;
				this.#deadline = void 0;
				channel.reject("ASK_TIMED_OUT");
				this.publish();
			}
			/** Hand a live waterfall to the next listener when this presentation domain unloads. */
			delegate() {
				this.#waterfall?.delegate();
			}
			/** Mark the card removed from the registry; the mounted composer clears its draft. */
			close() {
				if (this.#closed) return;
				this.#closed = true;
				this.publish();
			}
			/**
			* Submit the whole answer batch through the live waterfall, or through the
			* Remote path once the question is continued.
			* @param answer - complete structured answer batch.
			*/
			answer(answer) {
				const waterfall = this.#waterfall;
				if (waterfall !== void 0) return settlePendingComposer(() => {
					waterfall.resolve(answer);
				}, "pending question settlement failed");
				const rpc = this.#rpc;
				if (this.#state === "continued" && rpc !== void 0) return rpc.answer(answer).then((accepted) => {
					if (!accepted) throw new Error("this question is no longer answerable");
				});
				return Promise.reject(/* @__PURE__ */ new Error("no channel accepts an answer yet"));
			}
			/**
			* Close the panel. A tool-call-keyed card only leaves the composer seat: the
			* request stands, the countdown keeps running here, and the tool call row
			* reopens it. A card the Host never named ends its request instead, because
			* nothing could bring it back.
			*/
			dismiss() {
				if (this.dismissal === "hide") return settlePendingComposer(() => {
					this.#seat?.hide();
				}, "pending question hide failed");
				const waterfall = this.#waterfall;
				if (waterfall === void 0) return Promise.reject(/* @__PURE__ */ new Error("no channel accepts a cancellation yet"));
				return settlePendingComposer(() => {
					waterfall.reject("ASK_CANCELLED");
				}, "pending question cancellation failed");
			}
		};
		//#endregion
		//#region lib/types/client/draft-store.js
		/**
		* Session-scoped draft state for the generic question composer. The Slot
		* registry owns store instances; this module exports only the factory so a
		* plugin reload cannot reuse a module-global handle.
		*/
		/**
		* Declare the question composer's Session store. Drafts persist per Session so
		* leaving the Session or restarting the Client does not erase an unfinished answer.
		* @returns a persisted store handle whose instance is owned by the Slot registry.
		*/
		function createQuestionDraftStore() {
			return (0, _deepseek_ai_dsh_client_store.defineStore)({
				init: () => ({ progressByRequest: {} }),
				persist: "dsh.user-questions.drafts.v1",
				actions: {
					replace: (draft, requestKey, progress) => {
						draft.progressByRequest[requestKey] = progress;
					},
					clear: (draft, requestKey) => {
						draft.progressByRequest = Object.fromEntries(Object.entries(draft.progressByRequest).filter(([key]) => key !== requestKey));
					},
					prune: (draft, keep) => {
						const live = new Set(keep);
						draft.progressByRequest = Object.fromEntries(Object.entries(draft.progressByRequest).filter(([key]) => live.has(key)));
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
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-user-questions/src/client/PlanReviewPanel.module.css.mjs
		const css$2 = ".SRJeFG_frame{padding:6px calc(var(--dsh-composer-side-clearance) + 16px) 10px;justify-content:center;display:flex}.SRJeFG_card{width:100%;max-width:var(--dsh-chat-content-width);--dsw-elevation-stroke-color:var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-xl);background:var(--dsw-specific-input-major);box-shadow:var(--dsw-elevation-panel);color:var(--dsw-alias-label-primary);border:0;flex-direction:column;display:flex;overflow:hidden}.SRJeFG_card,.SRJeFG_card *{box-sizing:border-box}.SRJeFG_strip{background:var(--dsw-alias-state-warn-tertiary);color:var(--dsw-alias-state-warn-primary);flex-shrink:0;align-items:center;gap:8px;padding:12px 16px;font-size:14px;line-height:20px;display:flex}.SRJeFG_footer{flex-shrink:0;justify-content:space-between;align-items:center;gap:12px;padding:8px 16px 12px;display:flex}.SRJeFG_feedback{min-height:16px;color:var(--dsw-alias-state-error-primary);font-size:11px;line-height:16px}.SRJeFG_actions{flex-shrink:0;align-items:center;gap:8px;display:flex}.SRJeFG_summary{min-width:0;padding:14px 16px 12px}.SRJeFG_title{text-overflow:ellipsis;white-space:nowrap;margin:0;font-size:15px;font-weight:500;line-height:22px;overflow:hidden}.SRJeFG_description{-webkit-line-clamp:2;color:var(--dsw-alias-label-secondary);-webkit-box-orient:vertical;margin:8px 0 0;font-size:14px;line-height:24px;display:-webkit-box;overflow:hidden}.SRJeFG_discuss{gap:6px}@media (width<=720px){.SRJeFG_card{border-radius:var(--dsw-radius-xl)}.SRJeFG_footer{align-items:flex-end;padding:8px 12px 10px}}.SRJeFG_previewActions{align-items:center;margin-left:auto;display:flex}";
		const tagId$2 = "@deepseek-ai/dsh-client-ui-user-questions/PlanReviewPanel.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$2) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-user-questions";
			tag.dataset.pluginCss = tagId$2;
			tag.textContent = css$2;
			document.head.appendChild(tag);
		}
		var PlanReviewPanel_module_css_default = {
			"actions": "SRJeFG_actions",
			"card": "SRJeFG_card",
			"description": "SRJeFG_description",
			"discuss": "SRJeFG_discuss",
			"feedback": "SRJeFG_feedback",
			"footer": "SRJeFG_footer",
			"frame": "SRJeFG_frame",
			"previewActions": "SRJeFG_previewActions",
			"strip": "SRJeFG_strip",
			"summary": "SRJeFG_summary",
			"title": "SRJeFG_title"
		};
		//#endregion
		//#region lib/types/client/PlanReviewPanel.js
		/**
		* Optional-prop spread for a decision button's tooltip: `title` is optional on
		* the DOM props, and exactOptionalPropertyTypes rejects an explicit undefined.
		*
		* @param description - the asker's option description, when it carries one.
		* @returns The `title` prop to spread, or nothing.
		*/
		function tooltip(description) {
			return description === void 0 ? {} : { title: description };
		}
		/**
		* Render plan review controls; the submitted document opens in the sidebar.
		*
		* @param props - the question domain face, the narrowed plan review, and `t`.
		* @returns The plan-review takeover for this request.
		*/
		function PlanReviewPanel({ pending, review, t, renderSlot }) {
			const [busy, setBusy] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			const settle = (send, remote = false) => {
				setBusy(true);
				setError(null);
				send().then(() => {
					if (!remote) return;
					setBusy(false);
					pending.dismiss().catch(() => {
						setError(t("status.sent"));
					});
				}).catch((cause) => {
					setBusy(false);
					setError(cause instanceof Error ? cause.message : String(cause));
				});
			};
			const decide = (label) => {
				settle(() => pending.answer({ answers: [{
					id: review.id,
					selected: [label]
				}] }), pending.snapshot().channel === "rpc");
			};
			const summary = (0, react.useMemo)(() => {
				const title = (0, _deepseek_ai_dsh_client_ui_primitives.extractMarkdownPlainText)(review.plan, { mode: "first-line" });
				const description = (0, _deepseek_ai_dsh_client_ui_primitives.extractMarkdownPlainText)(review.plan, { mode: "first-paragraph" });
				return {
					title,
					description: description === title ? "" : description
				};
			}, [review.plan]);
			return (0, react_jsx_runtime.jsx)("div", {
				className: PlanReviewPanel_module_css_default.frame,
				"data-plan-review-key": pending.key,
				children: (0, react_jsx_runtime.jsxs)("section", {
					className: PlanReviewPanel_module_css_default.card,
					"aria-label": review.question,
					"aria-busy": busy,
					children: [
						(0, react_jsx_runtime.jsxs)("div", {
							className: PlanReviewPanel_module_css_default.strip,
							children: [
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: busy ? "ongoing" : "warning" }),
								t("plan.header"),
								(0, react_jsx_runtime.jsx)("div", {
									className: PlanReviewPanel_module_css_default.previewActions,
									children: renderSlot("conversation.plan-review.actions", {
										review,
										requestKey: pending.key
									})
								})
							]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: PlanReviewPanel_module_css_default.summary,
							children: [(0, react_jsx_runtime.jsx)("h3", {
								className: PlanReviewPanel_module_css_default.title,
								children: summary.title
							}), summary.description !== "" && (0, react_jsx_runtime.jsx)("p", {
								className: PlanReviewPanel_module_css_default.description,
								children: summary.description
							})]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: PlanReviewPanel_module_css_default.footer,
							children: [(0, react_jsx_runtime.jsx)("div", {
								className: PlanReviewPanel_module_css_default.feedback,
								role: "status",
								children: error
							}), (0, react_jsx_runtime.jsxs)("div", {
								className: PlanReviewPanel_module_css_default.actions,
								children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									className: PlanReviewPanel_module_css_default.discuss,
									icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutlineRegular, { size: 14 }),
									disabled: busy,
									onClick: () => {
										settle(() => pending.dismiss());
									},
									children: t("plan.discuss")
								}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "primary",
									...tooltip(review.approve.description),
									disabled: busy,
									onClick: () => {
										decide(review.approve.label);
									},
									children: t("plan.approve")
								})]
							})]
						})
					]
				})
			});
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-user-questions/src/client/QuestionComposer.module.css.mjs
		const css$1 = ".SFyuhW_frame{padding:6px calc(var(--dsh-composer-side-clearance) + 16px) 10px;justify-content:center;display:flex}.SFyuhW_card{width:100%;max-width:var(--dsh-chat-content-width);--dsw-elevation-stroke-color:var(--dsw-alias-border-l2-darkmode-thin);border-radius:var(--dsw-radius-xl);background:var(--dsw-specific-input-major);max-height:min(60vh,520px);box-shadow:var(--dsw-elevation-panel);color:var(--dsw-alias-label-primary);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);border:0;flex-direction:column;padding:0 0 10px;display:flex;overflow:hidden}.SFyuhW_card,.SFyuhW_card *{box-sizing:border-box}.SFyuhW_cardMinimized{max-height:none}.SFyuhW_cardMinimized .SFyuhW_header{padding-bottom:14px}.SFyuhW_headerActions{flex-shrink:0;align-items:center;gap:4px;margin-left:auto;display:flex}.SFyuhW_waitButton{white-space:nowrap}.SFyuhW_waitStatus{color:var(--dsw-alias-label-secondary);white-space:nowrap;font-size:12px;line-height:24px}.SFyuhW_header{flex-shrink:0;justify-content:space-between;align-items:flex-start;gap:16px;padding:20px 16px 0 24px;display:flex}.SFyuhW_headingBlock{flex:1;min-width:0}.SFyuhW_eyebrow{color:var(--dsw-alias-label-tertiary);margin-bottom:5px;font-size:11px;line-height:16px}.SFyuhW_title{margin:0;font-size:16px;font-weight:500;line-height:22px}.SFyuhW_questionTitle{timeline-scope:--question-copy;flex-shrink:0;margin:5px 24px 0;position:relative}.SFyuhW_questionTitle[data-expanded]{padding-bottom:24px}.SFyuhW_titlePreview{overflow-wrap:anywhere;white-space:pre-wrap;scroll-timeline:--question-copy block;max-height:calc(3lh + 2px);margin:0 0 -2px;padding-bottom:2px;animation-name:SFyuhW_question-clipped;animation-fill-mode:both;animation-timeline:--question-copy;overflow:hidden}@keyframes SFyuhW_question-clipped{0%,to{clip-path:inset(0 0 calc(1lh + 2px));margin-bottom:calc(-1lh - 2px);mask-image:linear-gradient(#000,#000),linear-gradient(90deg,#000 calc(100% - 56px),#0000 calc(100% - 28px));mask-position:0 0,0 1lh;mask-size:100% 1lh,100% 1lh;mask-repeat:no-repeat}}.SFyuhW_questionToggle{animation-name:SFyuhW_copy-toggle-shown;animation-fill-mode:both;animation-timeline:--question-copy;position:absolute;bottom:-1px;right:-4px}.SFyuhW_cardMinimized .SFyuhW_title{-webkit-line-clamp:2;-webkit-box-orient:vertical;display:-webkit-box;overflow:hidden}.SFyuhW_detail{flex-shrink:0;margin:0 24px 8px}.SFyuhW_footerActions{flex-shrink:0;align-items:center;gap:12px;display:flex}.SFyuhW_pager{flex-shrink:0;align-items:center;gap:6px;display:flex}.SFyuhW_progress{color:var(--dsw-alias-label-secondary);white-space:nowrap;word-spacing:-2px;padding:0 4px;font-size:14px;font-weight:500;line-height:24px}.SFyuhW_iconButton{corner-shape:round;width:24px;height:24px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;border-radius:999px;place-items:center;padding:0;display:grid}@media (hover:hover){.SFyuhW_iconButton:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}.SFyuhW_iconButton:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}.SFyuhW_body{overscroll-behavior:contain;flex-direction:column;flex:auto;min-height:0;display:flex;overflow-y:auto}.SFyuhW_options{flex-direction:column;gap:1px;margin:8px 0 0;padding:4px 12px;display:flex}.SFyuhW_optionRow{border-radius:var(--dsw-radius-md);timeline-scope:--description-copy;background:0 0;border:.5px solid #0000;flex-shrink:0;width:100%;min-height:40px;transition:background-color .12s,border-color .12s;position:relative}.SFyuhW_option{width:100%;min-width:0;min-height:40px;color:inherit;text-align:left;cursor:pointer;background:0 0;border:0;align-items:flex-start;gap:8px;padding:8px 12px 8px 8px;display:flex}.SFyuhW_optionSelected{background:var(--dsw-alias-interactive-bg-hover)}@media (hover:hover){.SFyuhW_optionRowInteractive:hover{background:var(--dsw-alias-interactive-bg-hover)}}.SFyuhW_optionSelected{border-color:var(--dsw-alias-border-l2)}.SFyuhW_option:disabled{cursor:default}.SFyuhW_number{border-radius:var(--dsw-radius-xs);background:var(--dsw-alias-bg-overlay);width:20px;height:20px;color:var(--dsw-alias-label-secondary);flex:0 0 20px;place-items:center;margin-top:2px;font-size:12px;font-weight:500;line-height:18px;display:grid}.SFyuhW_checkbox{flex:0 0 20px;place-items:center;width:20px;height:20px;margin-top:2px;display:grid}.SFyuhW_checkbox:before{content:\"\";border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-xs);grid-area:1/1;width:14px;height:14px;transition:background-color .12s,border-color .12s}.SFyuhW_checkbox>svg{grid-area:1/1}.SFyuhW_checkboxChecked{color:var(--dsw-alias-label-primary-foreground)}.SFyuhW_checkboxChecked:before{border-color:var(--dsw-alias-label-primary);background:var(--dsw-alias-label-primary)}.SFyuhW_optionCopy{flex-wrap:wrap;flex:1;align-items:baseline;gap:0 6px;min-width:0;display:flex}.SFyuhW_optionLine{flex-wrap:wrap;align-items:baseline;gap:2px 6px;max-width:100%;display:flex}.SFyuhW_optionLabel{font-size:14px;font-weight:500;line-height:24px}.SFyuhW_badge{border-radius:var(--dsw-radius-xs);background:var(--dsw-specific-sidebar-nav-item-active-accent);color:var(--dsw-alias-button-info-fill);padding:0 4px;font-size:11px;font-weight:600;line-height:18px}.SFyuhW_description{overflow-wrap:anywhere;white-space:pre-wrap;width:max-content;min-width:0;max-width:100%;max-height:calc(2lh + 2px);color:var(--dsw-alias-label-tertiary);scroll-timeline:--description-copy block;margin-bottom:-2px;padding-bottom:2px;font-size:13px;font-weight:400;line-height:20px;animation-name:SFyuhW_description-clipped;animation-fill-mode:both;animation-timeline:--description-copy;display:block;overflow:hidden}@keyframes SFyuhW_description-clipped{0%,to{clip-path:inset(0 0 calc(1lh + 2px));margin-bottom:calc(-1lh - 2px);mask-image:linear-gradient(90deg,#000 calc(100% - 56px),#0000 calc(100% - 28px));mask-size:100% 1lh;mask-repeat:no-repeat}}.SFyuhW_descriptionToggle{animation-name:SFyuhW_copy-toggle-shown;animation-fill-mode:both;animation-timeline:--description-copy;position:absolute;bottom:6px;right:8px}.SFyuhW_optionRow[data-expanded] .SFyuhW_option{padding-bottom:32px}.SFyuhW_questionTitle[data-expanded] .SFyuhW_titlePreview,.SFyuhW_optionRow[data-expanded] .SFyuhW_description{max-height:none;animation:none}.SFyuhW_copyToggle{visibility:hidden}@keyframes SFyuhW_copy-toggle-shown{0%,to{visibility:visible}}.SFyuhW_questionTitle[data-expanded] .SFyuhW_copyToggle,.SFyuhW_optionRow[data-expanded] .SFyuhW_copyToggle{visibility:visible;animation:none}@supports not (animation-timeline:scroll()){.SFyuhW_titlePreview,.SFyuhW_description{max-height:none;animation:none}.SFyuhW_copyToggle{display:none}}.SFyuhW_reviewNote{color:var(--dsw-alias-label-tertiary);margin:0;padding:8px 12px;font-size:14px;line-height:24px}.SFyuhW_customRow{border-radius:var(--dsw-radius-md);border:.5px solid #0000;flex-shrink:0;align-items:flex-start;gap:8px;width:100%;min-height:40px;padding:8px 12px 8px 8px;transition:background-color .12s,border-color .12s;display:flex}.SFyuhW_customRow:focus-within:not(.SFyuhW_customRowYielded),.SFyuhW_customRowActive{background:var(--dsw-alias-interactive-bg-hover)}@media (hover:hover){.SFyuhW_customRow:hover{background:var(--dsw-alias-interactive-bg-hover)}}.SFyuhW_customRow:focus-within:not(.SFyuhW_customRowYielded),.SFyuhW_customRowActive{border-color:var(--dsw-alias-border-l2)}.SFyuhW_field{--dsh-answer-field-padding:0;min-width:0;display:grid}.SFyuhW_field>*{min-width:0;padding:var(--dsh-answer-field-padding);font:inherit;white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;grid-area:1/1;font-size:14px;line-height:24px}.SFyuhW_fieldMirror{box-sizing:content-box;visibility:hidden;max-height:144px;overflow:hidden}.SFyuhW_fieldInput{resize:none;color:var(--dsw-alias-label-primary);caret-color:var(--dsw-alias-state-business-primary);background:0 0;border:none;outline:none;overflow-y:auto}.SFyuhW_fieldInput::placeholder{color:var(--dsw-alias-label-caption)}.SFyuhW_customInline{flex:1}.SFyuhW_customBlock{border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-module-platform);--dsh-answer-field-padding:8px 12px;flex-shrink:0;min-height:64px;margin:0 12px}.SFyuhW_customBlock:focus-within{border-color:var(--dsw-alias-state-business-primary)}.SFyuhW_footer{flex-shrink:0;justify-content:space-between;align-items:center;gap:12px;margin-top:12px;padding:0 10px 0 18px;display:flex}.SFyuhW_feedback{min-height:16px;color:var(--dsw-alias-state-error-primary);text-align:right;flex:1;font-size:11px;line-height:16px}@media (width<=720px){.SFyuhW_card{border-radius:var(--dsw-radius-xl)}.SFyuhW_header{padding:10px 12px 0 18px}.SFyuhW_options{padding:4px 8px}.SFyuhW_title{font-size:15px;line-height:21px}.SFyuhW_option,.SFyuhW_customRow{padding:8px 6px}.SFyuhW_descriptionToggle{right:2px}.SFyuhW_footer{align-items:flex-end;padding:0 10px}.SFyuhW_footerActions{flex-shrink:0}}@media (prefers-reduced-motion:reduce){.SFyuhW_optionRow,.SFyuhW_customRow{transition:none}}";
		const tagId$1 = "@deepseek-ai/dsh-client-ui-user-questions/QuestionComposer.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-user-questions";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var QuestionComposer_module_css_default = {
			"badge": "SFyuhW_badge",
			"body": "SFyuhW_body",
			"card": "SFyuhW_card",
			"cardMinimized": "SFyuhW_cardMinimized",
			"checkbox": "SFyuhW_checkbox",
			"checkboxChecked": "SFyuhW_checkboxChecked",
			"copy-toggle-shown": "SFyuhW_copy-toggle-shown",
			"copyToggle": "SFyuhW_copyToggle",
			"customBlock": "SFyuhW_customBlock",
			"customInline": "SFyuhW_customInline",
			"customRow": "SFyuhW_customRow",
			"customRowActive": "SFyuhW_customRowActive",
			"customRowYielded": "SFyuhW_customRowYielded",
			"description": "SFyuhW_description",
			"description-clipped": "SFyuhW_description-clipped",
			"descriptionToggle": "SFyuhW_descriptionToggle",
			"detail": "SFyuhW_detail",
			"eyebrow": "SFyuhW_eyebrow",
			"feedback": "SFyuhW_feedback",
			"field": "SFyuhW_field",
			"fieldInput": "SFyuhW_fieldInput",
			"fieldMirror": "SFyuhW_fieldMirror",
			"footer": "SFyuhW_footer",
			"footerActions": "SFyuhW_footerActions",
			"frame": "SFyuhW_frame",
			"header": "SFyuhW_header",
			"headerActions": "SFyuhW_headerActions",
			"headingBlock": "SFyuhW_headingBlock",
			"iconButton": "SFyuhW_iconButton",
			"number": "SFyuhW_number",
			"option": "SFyuhW_option",
			"optionCopy": "SFyuhW_optionCopy",
			"optionLabel": "SFyuhW_optionLabel",
			"optionLine": "SFyuhW_optionLine",
			"optionRow": "SFyuhW_optionRow",
			"optionRowInteractive": "SFyuhW_optionRowInteractive",
			"optionSelected": "SFyuhW_optionSelected",
			"options": "SFyuhW_options",
			"pager": "SFyuhW_pager",
			"progress": "SFyuhW_progress",
			"question-clipped": "SFyuhW_question-clipped",
			"questionTitle": "SFyuhW_questionTitle",
			"questionToggle": "SFyuhW_questionToggle",
			"reviewNote": "SFyuhW_reviewNote",
			"title": "SFyuhW_title",
			"titlePreview": "SFyuhW_titlePreview",
			"waitButton": "SFyuhW_waitButton",
			"waitStatus": "SFyuhW_waitStatus"
		};
		//#endregion
		//#region lib/types/client/QuestionComposer.js
		/** A removed card can remain mounted until the composer seat updates. */
		const REMOVED_CARD = {
			state: "open",
			waitState: "counting",
			countdown: void 0,
			channel: "none",
			closed: true
		};
		const NOTHING_EXPANDED = /* @__PURE__ */ new Set();
		/**
		* Split the conventional recommendation suffix without changing the answer value.
		* @param label - Original option label returned if selected.
		* @returns Display label plus recommendation state.
		*/
		function parseRecommendedLabel(label) {
			const suffix = /\s*(?:\((?:recommended|推荐)\)|（(?:recommended|推荐)）)\s*$/i;
			return suffix.test(label) ? {
				label: label.replace(suffix, ""),
				recommended: true
			} : {
				label,
				recommended: false
			};
		}
		/** Only a marked first choice is an implicit draft; the user still submits it. */
		function recommendedFirstOption(question) {
			const label = question.options?.[0]?.label;
			return label !== void 0 && parseRecommendedLabel(label).recommended ? label : void 0;
		}
		/** Accept persisted progress only when it still describes this question batch. */
		function isQuestionDraftProgress(value, questionCount) {
			if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
			const progress = value;
			if (typeof progress.index !== "number" || !Number.isInteger(progress.index) || progress.index < 0 || progress.index >= questionCount || !Array.isArray(progress.drafts) || progress.drafts.length !== questionCount || progress.wait !== void 0 && progress.wait !== "editing" && progress.wait !== "waiting") return false;
			return progress.drafts.every((item) => {
				if (typeof item !== "object" || item === null || Array.isArray(item)) return false;
				const draft = item;
				return Array.isArray(draft.selected) && draft.selected.every((label) => typeof label === "string") && typeof draft.custom === "string" && typeof draft.skipped === "boolean";
			});
		}
		/** Return whether a text-field key event belongs to an active IME composition. */
		function isComposing(event) {
			return event.nativeEvent.isComposing || Reflect.get(event.nativeEvent, "keyCode") === 229;
		}
		/**
		* Auto-growing free-text answer: a textarea, so a long answer soft-wraps and
		* Shift+Enter breaks a line, over a hidden mirror that owns the height.
		*
		* The mirror renders the draft plus a trailing newline in normal flow and so
		* sizes the grid row (counting rows by '\n' cannot see soft wraps); the
		* textarea shares that one cell and stretches to it, and `rows={1}` keeps the
		* control's own intrinsic height out of the row sizing so the mirror alone
		* decides. Past the mirror's cap the textarea scrolls itself — it is the only
		* scrollport in the stack, there being no second glyph layer to keep aligned.
		* Mirror and textarea MUST share font, line-height, padding and wrapping rules
		* or the two heights diverge.
		*
		* @param props - visual variant, draft text, and the field's event handlers.
		* @returns The mirrored auto-growing field.
		*/
		function AnswerField(props) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: clsx(QuestionComposer_module_css_default.field, props.variant === "inline" ? QuestionComposer_module_css_default.customInline : QuestionComposer_module_css_default.customBlock),
				children: [(0, react_jsx_runtime.jsx)("div", {
					"aria-hidden": true,
					className: QuestionComposer_module_css_default.fieldMirror,
					children: `${props.value}\n`
				}), (0, react_jsx_runtime.jsx)("textarea", {
					autoFocus: props.autoFocus,
					className: QuestionComposer_module_css_default.fieldInput,
					value: props.value,
					disabled: props.disabled,
					rows: 1,
					placeholder: props.placeholder,
					onFocus: props.onFocus,
					onChange: props.onChange,
					onKeyDown: props.onKeyDown
				})]
			});
		}
		/**
		* Composer takeover router. Generic-question drafts live in this entry's
		* Session-scoped Slot store, keyed by the pending carrier, so a strict Session
		* entry remount restores the same request without exposing it to another one.
		*
		* One takeover, two presentations: a request that declares a presentation intent this
		* package renders uses that presentation (a plan review is one decision over one
		* plan, not a question set), and every other request takes the generic flow.
		* The routing lives here, at the one entry that owns the composer seat, so
		* neither presentation can claim a request the other is already rendering.
		*
		* @param props - the selector-matched pending question carrier plus the framework standard kit.
		* @returns The question flow, or the intent's own surface, for this request.
		*/
		function QuestionComposer(props) {
			const question = props.matched;
			const review = (0, react.useMemo)(() => planReviewOf(question.questions), [question]);
			return review === void 0 ? (0, react_jsx_runtime.jsx)(QuestionFlow, {
				pending: question,
				t: props.t,
				useStore: props.useStore,
				useQuestionCard: props.useQuestionCard,
				actions: props.actions
			}, question.key) : (0, react_jsx_runtime.jsx)(PlanReviewPanel, {
				pending: question,
				review,
				t: props.t,
				renderSlot: props.renderSlot
			}, question.key);
		}
		function QuestionFlow({ pending, t, useStore, useQuestionCard, actions }) {
			const descriptionIdPrefix = (0, react.useId)();
			const questions = pending.questions;
			const review = pending.review;
			const markdownLabels = (0, react.useMemo)(() => ({
				code: {
					copyLabel: t("copy"),
					copiedLabel: t("copied"),
					toolbarLabels: {
						codeLabel: t("codeBlock.title"),
						wrapLabel: t("codeBlock.wrap"),
						unwrapLabel: t("codeBlock.unwrap")
					}
				},
				footnotes: t("markdown.footnotes")
			}), [t]);
			const initialDrafts = (0, react.useMemo)(() => {
				const recorded = new Map((review ?? []).map((answer) => [answer.id, answer]));
				return questions.map((item) => {
					const answer = recorded.get(item.id);
					const custom = answer?.custom ?? "";
					const recommended = review === void 0 ? recommendedFirstOption(item) : void 0;
					return {
						selected: answer === void 0 && recommended !== void 0 ? [recommended] : [...answer?.selected ?? []],
						custom,
						skipped: answer !== void 0 && answer.selected.length === 0 && custom === ""
					};
				});
			}, [questions, review]);
			const stored = useStore((state) => state.progressByRequest[pending.key]);
			const validStored = isQuestionDraftProgress(stored, questions.length) ? stored : void 0;
			const storedProgress = review === void 0 ? validStored : void 0;
			const index = validStored?.index ?? 0;
			const drafts = storedProgress?.drafts ?? initialDrafts;
			const restoredWait = storedProgress?.wait ?? (storedProgress?.drafts.some((item, itemIndex) => item.selected.length !== initialDrafts[itemIndex]?.selected.length || item.selected.some((label, labelIndex) => label !== initialDrafts[itemIndex]?.selected[labelIndex]) || item.custom !== "" || item.skipped) === true ? "editing" : void 0);
			const [busy, setBusy] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)(null);
			const card = useQuestionCard(pending.key, (snapshot) => snapshot ?? REMOVED_CARD);
			const canSubmit = card.channel !== "none";
			const locked = busy !== null || review !== void 0;
			const sentVia = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				if (sentVia.current !== "waterfall" || card.state !== "continued") return;
				sentVia.current = null;
				setBusy(null);
				setError({ key: "error.resubmit" });
			}, [card.state]);
			(0, react.useEffect)(() => {
				if (card.closed) actions.clear(pending.key);
			}, [
				actions,
				card.closed,
				pending.key
			]);
			(0, react.useEffect)(() => {
				actions.prune(pending.liveKeys());
			}, [actions, pending]);
			const waitDisposition = (0, react.useRef)(restoredWait);
			(0, react.useEffect)(() => {
				if (waitDisposition.current === "waiting") pending.takeTime();
				if (waitDisposition.current === "editing") pending.engage();
			}, [pending]);
			const countdown = card.countdown;
			const [minimized, setMinimized] = (0, react.useState)(false);
			const focusedQuestions = (0, react.useRef)(/* @__PURE__ */ new Set());
			const answerSurface = (0, react.useRef)(null);
			const question = questions[index];
			const draft = drafts[index];
			const hasOptions = (question.options?.length ?? 0) > 0;
			const [expandedCopy, setExpandedCopy] = (0, react.useState)({
				index,
				copies: NOTHING_EXPANDED
			});
			const expanded = expandedCopy.index === index ? expandedCopy.copies : NOTHING_EXPANDED;
			const questionToggleLabel = t(expanded.has("question") ? "text.collapse" : "text.expand");
			const toggleCopy = (copy) => {
				const copies = new Set(expanded);
				if (!copies.delete(copy)) copies.add(copy);
				setExpandedCopy({
					index,
					copies
				});
			};
			const replaceProgress = (nextIndex, nextDrafts) => {
				if (nextIndex !== index) {
					if (answerSurface.current !== null) answerSurface.current.scrollTop = 0;
					setExpandedCopy({
						index: nextIndex,
						copies: NOTHING_EXPANDED
					});
				}
				actions.replace(pending.key, {
					index: nextIndex,
					drafts: nextDrafts,
					...waitDisposition.current === void 0 ? {} : { wait: waitDisposition.current }
				});
			};
			const takeTime = () => {
				waitDisposition.current = "waiting";
				pending.takeTime();
				replaceProgress(index, drafts);
			};
			const engage = () => {
				if (waitDisposition.current !== void 0) return;
				waitDisposition.current = "editing";
				pending.engage();
			};
			const focusAnswerSurface = (event) => {
				if (!event.currentTarget.contains(event.relatedTarget)) pending.holdFocus();
			};
			const blurAnswerSurface = (event) => {
				if (!event.currentTarget.contains(event.relatedTarget)) pending.releaseFocus();
			};
			(0, react.useEffect)(() => {
				const release = () => {
					pending.releaseFocus();
				};
				const refocus = () => {
					if (waitDisposition.current === "editing") {
						pending.engage();
						return;
					}
					if (answerSurface.current?.contains(document.activeElement) === true) pending.holdFocus();
				};
				const visibilityChanged = () => {
					if (document.hidden) release();
					else refocus();
				};
				window.addEventListener("blur", release);
				window.addEventListener("focus", refocus);
				document.addEventListener("visibilitychange", visibilityChanged);
				return () => {
					release();
					window.removeEventListener("blur", release);
					window.removeEventListener("focus", refocus);
					document.removeEventListener("visibilitychange", visibilityChanged);
				};
			}, [pending]);
			const dismissFlow = () => {
				if (pending.dismissal === "hide") {
					pending.dismiss();
					return;
				}
				if (!canSubmit) {
					setError({ key: "error.unavailable" });
					return;
				}
				setBusy("cancel");
				setError(null);
				sentVia.current = "waterfall";
				pending.dismiss().catch((cause) => {
					sentVia.current = null;
					setBusy(null);
					setError({ text: cause instanceof Error ? cause.message : String(cause) });
				});
			};
			const updateDraft = (update, nextIndex = index) => {
				engage();
				replaceProgress(nextIndex, drafts.map((item, itemIndex) => itemIndex === index ? update(item) : item));
				setError(null);
			};
			const choose = (label) => {
				updateDraft((current) => {
					if (question.multiSelect === true) {
						const selected = current.selected.includes(label) ? current.selected.filter((item) => item !== label) : [...current.selected, label];
						return {
							...current,
							selected,
							skipped: false
						};
					}
					return {
						selected: [label],
						custom: "",
						skipped: false
					};
				}, question.multiSelect !== true && index < questions.length - 1 ? index + 1 : index);
			};
			const answered = (item) => item.selected.length > 0 || item.custom.trim() !== "";
			const completed = (item) => answered(item) || item.skipped;
			const submitDrafts = (values) => {
				const missing = values.findIndex((item) => !completed(item));
				if (missing >= 0) {
					replaceProgress(missing, values);
					setError({ key: "error.incomplete" });
					return;
				}
				if (!canSubmit) {
					setError({ key: "error.unavailable" });
					return;
				}
				const answer = { answers: questions.map((item, itemIndex) => {
					const value = values[itemIndex];
					if (value.skipped) return {
						id: item.id,
						selected: []
					};
					const custom = value.custom.trim();
					return {
						id: item.id,
						selected: custom === "" || item.multiSelect === true ? value.selected : [],
						...custom === "" ? {} : { custom }
					};
				}) };
				setBusy("answer");
				setError(null);
				const channel = pending.snapshot().channel;
				sentVia.current = channel === "waterfall" ? "waterfall" : null;
				pending.answer(answer).then(() => {
					if (channel !== "rpc") return;
					sentVia.current = null;
					setBusy(null);
					setError(null);
					pending.dismiss().catch(() => {
						setError({ key: "status.sent" });
					});
				}).catch((cause) => {
					sentVia.current = null;
					setBusy(null);
					setError({ text: cause instanceof Error ? cause.message : String(cause) });
				});
			};
			const continueFlow = () => {
				if (!answered(draft)) {
					setError({ key: "error.unanswered" });
					return;
				}
				if (index < questions.length - 1) {
					replaceProgress(index + 1, drafts);
					setError(null);
					return;
				}
				submitDrafts(drafts);
			};
			const draftCustom = (event) => {
				const value = event.target.value;
				updateDraft((current) => ({
					...current,
					selected: question.multiSelect === true ? current.selected : [],
					custom: value,
					skipped: false
				}));
			};
			const continueFromCustom = (event) => {
				if (event.key !== "Enter" || event.shiftKey || isComposing(event)) return;
				event.preventDefault();
				continueFlow();
			};
			const skipQuestion = () => {
				engage();
				const nextDrafts = drafts.map((item, itemIndex) => itemIndex === index ? {
					selected: [],
					custom: "",
					skipped: true
				} : item);
				replaceProgress(index < questions.length - 1 ? index + 1 : index, nextDrafts);
				setError(null);
				if (index < questions.length - 1) return;
				submitDrafts(nextDrafts);
			};
			return (0, react_jsx_runtime.jsx)("div", {
				className: QuestionComposer_module_css_default.frame,
				"data-question-key": pending.key,
				children: (0, react_jsx_runtime.jsxs)("section", {
					className: clsx(QuestionComposer_module_css_default.card, minimized && QuestionComposer_module_css_default.cardMinimized),
					"aria-labelledby": `question-${pending.key}-${String(index)}`,
					children: [(0, react_jsx_runtime.jsxs)("header", {
						className: QuestionComposer_module_css_default.header,
						children: [(question.header !== void 0 || minimized) && (0, react_jsx_runtime.jsxs)("div", {
							className: QuestionComposer_module_css_default.headingBlock,
							children: [question.header !== void 0 && (0, react_jsx_runtime.jsx)("div", {
								className: QuestionComposer_module_css_default.eyebrow,
								children: question.header
							}), minimized && (0, react_jsx_runtime.jsx)("h2", {
								className: QuestionComposer_module_css_default.title,
								id: `question-${pending.key}-${String(index)}`,
								children: question.question
							})]
						}), (0, react_jsx_runtime.jsxs)("div", {
							className: QuestionComposer_module_css_default.headerActions,
							children: [
								countdown !== void 0 && card.waitState !== "waiting" && card.waitState !== "editing" && card.waitState !== "continued" && (0, react_jsx_runtime.jsx)("span", {
									className: QuestionComposer_module_css_default.waitStatus,
									children: t(countdown.running ? "wait.countdown" : "wait.paused", { seconds: Math.ceil(countdown.remainingMs / 1e3) })
								}),
								countdown !== void 0 && card.waitState !== "waiting" && card.waitState !== "editing" && card.waitState !== "continued" && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									className: QuestionComposer_module_css_default.waitButton,
									onClick: takeTime,
									children: t("wait.takeTime")
								}),
								card.state === "continued" && (0, react_jsx_runtime.jsx)("span", {
									className: QuestionComposer_module_css_default.waitStatus,
									children: t("wait.continued")
								}),
								countdown !== void 0 && (card.waitState === "waiting" || card.waitState === "editing") && (0, react_jsx_runtime.jsx)("span", {
									className: QuestionComposer_module_css_default.waitStatus,
									children: t("wait.held")
								}),
								review !== void 0 && (0, react_jsx_runtime.jsx)("span", {
									className: QuestionComposer_module_css_default.waitStatus,
									children: t("review.status")
								}),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: QuestionComposer_module_css_default.iconButton,
									"aria-label": t(minimized ? "nav.maximize" : "nav.minimize"),
									title: t(minimized ? "nav.maximize" : "nav.minimize"),
									"aria-expanded": !minimized,
									disabled: busy !== null,
									onClick: () => {
										setMinimized((current) => !current);
									},
									children: minimized ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronUpOutlineRegular, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {})
								}),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: QuestionComposer_module_css_default.iconButton,
									"aria-label": t(pending.dismissal === "hide" ? "nav.close" : "nav.cancel"),
									title: t(pending.dismissal === "hide" ? "nav.close" : "nav.cancel"),
									disabled: busy !== null,
									onClick: dismissFlow,
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, {})
								})
							]
						})]
					}), !minimized && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("div", {
						ref: answerSurface,
						className: QuestionComposer_module_css_default.body,
						"data-question-scroll": true,
						onFocusCapture: focusAnswerSurface,
						onBlurCapture: blurAnswerSurface,
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: QuestionComposer_module_css_default.questionTitle,
								"data-expanded": expanded.has("question") || void 0,
								children: [(0, react_jsx_runtime.jsx)("h2", {
									className: clsx(QuestionComposer_module_css_default.title, QuestionComposer_module_css_default.titlePreview),
									id: `question-${pending.key}-${String(index)}`,
									children: question.question
								}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
									label: questionToggleLabel,
									side: "top",
									portal: true,
									children: (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: clsx(QuestionComposer_module_css_default.iconButton, QuestionComposer_module_css_default.copyToggle, QuestionComposer_module_css_default.questionToggle),
										"aria-label": questionToggleLabel,
										"aria-expanded": expanded.has("question"),
										"aria-controls": `question-${pending.key}-${String(index)}`,
										"aria-describedby": `question-${pending.key}-${String(index)}`,
										onClick: () => {
											toggleCopy("question");
										},
										children: expanded.has("question") ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronUpOutlineRegular, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {})
									})
								})]
							}),
							question.detail !== void 0 && (0, react_jsx_runtime.jsx)("div", {
								className: QuestionComposer_module_css_default.detail,
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
									text: question.detail,
									labels: markdownLabels
								})
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: QuestionComposer_module_css_default.options,
								role: question.multiSelect === true ? "group" : "radiogroup",
								children: [
									(question.options ?? []).map((option, optionIndex) => {
										const selected = draft.selected.includes(option.label);
										const display = parseRecommendedLabel(option.label);
										const hasDescription = option.description !== void 0 && option.description.trim() !== "";
										const descriptionExpanded = expanded.has(optionIndex);
										const descriptionToggleLabel = t(descriptionExpanded ? "text.collapse" : "text.expand");
										const descriptionId = `${descriptionIdPrefix}-question-${String(index)}-option-${String(optionIndex)}-description`;
										return (0, react_jsx_runtime.jsxs)("div", {
											className: clsx(QuestionComposer_module_css_default.optionRow, !locked && QuestionComposer_module_css_default.optionRowInteractive, selected && question.multiSelect !== true && QuestionComposer_module_css_default.optionSelected),
											"data-option-row": true,
											"data-expanded": descriptionExpanded || void 0,
											children: [(0, react_jsx_runtime.jsxs)("button", {
												type: "button",
												className: QuestionComposer_module_css_default.option,
												role: question.multiSelect === true ? "checkbox" : "radio",
												"aria-checked": selected,
												"aria-label": display.label,
												"aria-describedby": hasDescription ? descriptionId : void 0,
												disabled: locked,
												onClick: () => {
													choose(option.label);
												},
												onKeyDown: (event) => {
													if (event.key !== "Enter") return;
													event.preventDefault();
													submitDrafts(drafts);
												},
												children: [question.multiSelect === true ? (0, react_jsx_runtime.jsx)("span", {
													className: clsx(QuestionComposer_module_css_default.checkbox, selected && QuestionComposer_module_css_default.checkboxChecked),
													"aria-hidden": "true",
													children: selected && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, { size: 12 })
												}) : (0, react_jsx_runtime.jsx)("span", {
													className: QuestionComposer_module_css_default.number,
													children: optionIndex + 1
												}), (0, react_jsx_runtime.jsxs)("span", {
													className: QuestionComposer_module_css_default.optionCopy,
													children: [(0, react_jsx_runtime.jsxs)("span", {
														className: QuestionComposer_module_css_default.optionLine,
														"data-option-line": true,
														children: [(0, react_jsx_runtime.jsx)("span", {
															className: QuestionComposer_module_css_default.optionLabel,
															children: display.label
														}), display.recommended && (0, react_jsx_runtime.jsx)("span", {
															className: QuestionComposer_module_css_default.badge,
															children: t("option.recommended")
														})]
													}), hasDescription && (0, react_jsx_runtime.jsx)("span", {
														id: descriptionId,
														className: QuestionComposer_module_css_default.description,
														"data-option-description": true,
														children: option.description
													})]
												})]
											}), hasDescription && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
												label: descriptionToggleLabel,
												side: "top",
												portal: true,
												children: (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: clsx(QuestionComposer_module_css_default.iconButton, QuestionComposer_module_css_default.copyToggle, QuestionComposer_module_css_default.descriptionToggle),
													"aria-label": descriptionToggleLabel,
													"aria-expanded": descriptionExpanded,
													"aria-controls": descriptionId,
													"aria-describedby": descriptionId,
													onClick: () => {
														toggleCopy(optionIndex);
													},
													children: descriptionExpanded ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronUpOutlineRegular, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {})
												})
											})]
										}, `${option.label}-${String(optionIndex)}`);
									}),
									review !== void 0 && draft.skipped && (0, react_jsx_runtime.jsx)("p", {
										className: QuestionComposer_module_css_default.reviewNote,
										children: t("review.skipped")
									}),
									(review === void 0 || draft.custom !== "") && (hasOptions ? (0, react_jsx_runtime.jsxs)("div", {
										className: clsx(QuestionComposer_module_css_default.customRow, draft.custom !== "" && QuestionComposer_module_css_default.customRowActive, question.multiSelect !== true && draft.selected.length > 0 && QuestionComposer_module_css_default.customRowYielded),
										children: [question.multiSelect === true ? (0, react_jsx_runtime.jsx)("span", {
											className: clsx(QuestionComposer_module_css_default.checkbox, draft.custom !== "" && QuestionComposer_module_css_default.checkboxChecked),
											"aria-hidden": "true",
											children: draft.custom !== "" && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, { size: 12 })
										}) : (0, react_jsx_runtime.jsx)("span", {
											className: QuestionComposer_module_css_default.number,
											"aria-hidden": "true",
											children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutlineRegular, { size: 12 })
										}), (0, react_jsx_runtime.jsx)(AnswerField, {
											variant: "inline",
											value: draft.custom,
											disabled: locked,
											placeholder: t("custom.placeholder"),
											onChange: draftCustom,
											onKeyDown: continueFromCustom
										})]
									}) : (0, react_jsx_runtime.jsx)(AnswerField, {
										autoFocus: canSubmit && countdown === void 0 && !locked && !focusedQuestions.current.has(index),
										variant: "block",
										value: draft.custom,
										disabled: locked,
										placeholder: t("custom.placeholder"),
										onFocus: () => {
											focusedQuestions.current.add(index);
										},
										onChange: draftCustom,
										onKeyDown: continueFromCustom
									}))
								]
							})
						]
					}), (0, react_jsx_runtime.jsxs)("footer", {
						className: QuestionComposer_module_css_default.footer,
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: QuestionComposer_module_css_default.pager,
								children: [
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: QuestionComposer_module_css_default.iconButton,
										"aria-label": t("nav.prev"),
										disabled: index === 0 || busy !== null,
										onClick: () => {
											replaceProgress(index - 1, drafts);
											setError(null);
										},
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronLeftOutlineRegular, {})
									}),
									(0, react_jsx_runtime.jsxs)("span", {
										className: QuestionComposer_module_css_default.progress,
										children: [
											index + 1,
											" / ",
											questions.length
										]
									}),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: QuestionComposer_module_css_default.iconButton,
										"aria-label": t("nav.next"),
										disabled: index === questions.length - 1 || busy !== null,
										onClick: () => {
											replaceProgress(index + 1, drafts);
											setError(null);
										},
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {})
									})
								]
							}),
							(0, react_jsx_runtime.jsx)("div", {
								className: QuestionComposer_module_css_default.feedback,
								role: "status",
								children: error === null ? null : "key" in error ? t(error.key) : error.text
							}),
							review === void 0 && (0, react_jsx_runtime.jsxs)("div", {
								className: QuestionComposer_module_css_default.footerActions,
								children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									disabled: busy !== null,
									onClick: skipQuestion,
									children: t("action.skip")
								}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "primary",
									disabled: busy !== null || !answered(draft) || index === questions.length - 1 && !canSubmit,
									onClick: continueFlow,
									children: busy === "answer" ? t("submitting") : index === questions.length - 1 ? t("submit") : t("action.next")
								})]
							})
						]
					})] })]
				})
			});
		}
		//#endregion
		//#region ../../core/session/src/surface.ts
		/** Runtime counterpart of the message-producing event union. */
		const SURFACE_EVENT_TYPES = new Set([
			"system/message",
			"developer/message",
			"user/message",
			"assistant/message",
			"tool/result"
		]);
		/**
		* Narrow an event to a surface-eligible event carrying its required marker.
		* @param event - event to test.
		* @returns true when both the type and marker identify a surface event.
		*/
		function isSurfaceEvent(event) {
			if (!SURFACE_EVENT_TYPES.has(event.type)) return false;
			return event.surfaceOp !== void 0;
		}
		/**
		* Narrow an event to an append-origin surface event: one that entered the
		* surface at its own log position and was never itself a replacement copy.
		*
		* The model-visible surface deliberately shadows replaced ranges, so it is the
		* wrong source for a human transcript — a landed replacement would erase
		* conversation the user already saw. Append-origin events are that transcript's
		* durable source material; replacement copies stay model-only.
		* @param event - event to test.
		* @returns true when the event appended to the surface tail.
		*/
		function isAppendSurfaceEvent(event) {
			return isSurfaceEvent(event) && event.surfaceOp === "append";
		}
		//#endregion
		//#region lib/types/client/question-reply.js
		function isRecord(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		/**
		* Read the question and answer pairs out of the reply text at the conversation boundary.
		* @param text - Model-facing JSON payload of the steered message.
		* @returns The pairs, or empty lists when the payload is unreadable.
		*/
		function replyPairsOf(text) {
			let value;
			try {
				value = JSON.parse(text);
			} catch (error) {
				return {
					questions: [],
					answers: []
				};
			}
			if (!isRecord(value) || !Array.isArray(value.questions)) return {
				questions: [],
				answers: []
			};
			const questions = [];
			for (const question of value.questions) {
				if (!isRecord(question) || typeof question.id !== "string" || typeof question.question !== "string") continue;
				questions.push({
					id: question.id,
					question: question.question,
					...typeof question.header === "string" ? { header: question.header } : {}
				});
			}
			const answers = [];
			for (const answer of Array.isArray(value.answers) ? value.answers : []) {
				if (!isRecord(answer) || typeof answer.id !== "string" || !Array.isArray(answer.selected)) continue;
				answers.push({
					id: answer.id,
					selected: answer.selected.filter((item) => typeof item === "string"),
					...typeof answer.custom === "string" ? { custom: answer.custom } : {}
				});
			}
			return {
				questions,
				answers
			};
		}
		/**
		* Answer values of one question in display order: the selected option labels
		* followed by a non-blank custom answer.
		* @param data - Projected reply holding the recorded answers.
		* @param id - Question id to read.
		* @returns The values, empty when the user skipped that question.
		*/
		function replyAnswerValues(data, id) {
			const answer = data.answers.find((item) => item.id === id);
			const custom = answer?.custom?.trim() ?? "";
			return [...answer?.selected ?? [], ...custom === "" ? [] : [custom]];
		}
		/**
		* Clipboard text of one answer batch: every question with the answer the user
		* gave, without question details or unselected options.
		* @param data - Projected reply to copy.
		* @param t - Bound `question` namespace translator owning the answer labels.
		* @returns One block per question, or the model-facing text when the payload was unreadable.
		*/
		function replyClipboardText(data, t) {
			if (data.questions.length === 0) return data.text;
			return data.questions.map((question) => {
				const values = replyAnswerValues(data, question.id);
				return `${question.header && question.header !== question.question ? `${question.header} — ${question.question}` : question.question}\n${values.length === 0 ? t("reply.skipped") : `${t("reply.answerLabel")}${values.join(", ")}`}`;
			}).join("\n\n");
		}
		/** Validate a late reply source at the persisted conversation boundary. */
		function replySource(event) {
			const source = event.data.source;
			return isRecord(source) && source.kind === "user-question-reply" && typeof source.callId === "string" && source.outcome === "answered" ? {
				callId: source.callId,
				outcome: "answered"
			} : null;
		}
		function jsonRecord(text) {
			try {
				const value = JSON.parse(text);
				return isRecord(value) ? value : null;
			} catch (error) {
				return null;
			}
		}
		function callQuestions(value) {
			if (!isRecord(value) || !Array.isArray(value.questions) || value.questions.length === 0) return null;
			const ids = /* @__PURE__ */ new Set();
			const questions = [];
			for (const question of value.questions) {
				if (!isRecord(question) || typeof question.id !== "string" || typeof question.question !== "string" || ids.has(question.id) || isRecord(question.intent) && question.intent.kind === "plan-review") return null;
				ids.add(question.id);
				questions.push({
					id: question.id,
					question: question.question,
					...typeof question.header === "string" ? { header: question.header } : {}
				});
			}
			return questions;
		}
		function resultReply(questions, event) {
			const result = event.type === "tool/result" ? event.data.message : event.data;
			if (result.isError === true) return void 0;
			const content = result.content;
			if (content.length !== 1 || content[0]?.type !== "text") return void 0;
			const text = content[0].text;
			const value = jsonRecord(text);
			if (value === null || value.pending === true || !Array.isArray(value.answers) || value.answers.length !== questions.length) return void 0;
			const ids = new Set(questions.map((question) => question.id));
			const answers = [];
			for (const answer of value.answers) {
				if (!isRecord(answer) || typeof answer.id !== "string" || !ids.delete(answer.id) || !Array.isArray(answer.selected) || !answer.selected.every((item) => typeof item === "string") || answer.custom !== void 0 && typeof answer.custom !== "string") return void 0;
				answers.push({
					id: answer.id,
					selected: answer.selected,
					...answer.custom === void 0 ? {} : { custom: answer.custom }
				});
			}
			return {
				seq: event.seq,
				time: event.time,
				callId: String(event.type === "tool/result" ? event.data.message.source.callId : event.data.subCallId),
				outcome: "answered",
				questions,
				answers,
				text
			};
		}
		/**
		* In-time ask-user answers paired by native callId or PTC subCallId. Pending, failed, and
		* malformed results retain their generic Tool presentation; late answers are
		* owned by questionReplyDefinition. Work is bounded by this call's answer batch.
		*/
		const answeredQuestionDefinition = {
			kind: "answered-user-question",
			target: "chat",
			match: (event) => {
				if (event.type === "tool/call" && event.data.name === "ask_user_question") return {
					id: String(event.data.callId),
					role: "start"
				};
				if (event.type === "tool/ptc-dispatch-start" && event.data.name === "ask_user_question") return {
					id: String(event.data.subCallId),
					role: "start"
				};
				if (event.type === "tool/ptc-dispatch" && event.data.name === "ask_user_question") return {
					id: String(event.data.subCallId),
					role: "update"
				};
				if (event.type === "tool/result" && isAppendSurfaceEvent(event)) return {
					id: String(event.data.message.source.callId),
					role: "update"
				};
				return null;
			},
			start: (_context, match) => {
				const event = match.event;
				if (event.type !== "tool/call" && event.type !== "tool/ptc-dispatch-start") throw new Error("answered-user-question requires tool/call or tool/ptc-dispatch-start");
				return {
					questions: callQuestions(event.type === "tool/call" ? jsonRecord(event.data.arguments) : event.data.arguments),
					reply: void 0
				};
			},
			update: (context, match) => {
				if (match.event.type !== "tool/result" && match.event.type !== "tool/ptc-dispatch" || context.state.questions === null) return context.state;
				return {
					...context.state,
					reply: resultReply(context.state.questions, match.event)
				};
			},
			buildViewNode: (context) => {
				const reply = context.state?.reply;
				if (reply === void 0) {
					const current = context.current.get("chat");
					return current == null ? null : {
						...current,
						visibility: "hidden"
					};
				}
				const { seq, ...data } = reply;
				return {
					key: context.key,
					id: context.id,
					kind: "question-reply",
					target: "chat",
					anchorSeq: seq,
					location: context.start?.location ?? { kind: "unresolved" },
					groupTree: "turn",
					visibility: "visible",
					data
				};
			}
		};
		/**
		* Late-reply projection owned by the questions UI. It claims the reply message
		* on the Chat target, so the generic message Definition never presents it.
		*/
		const questionReplyDefinition = {
			kind: "user-question-reply",
			target: "chat",
			match: (event) => {
				if (event.type !== "user/message" || !isAppendSurfaceEvent(event)) return null;
				return replySource(event) === null ? null : {
					id: String(event.data.id),
					role: "start",
					exclusive: true
				};
			},
			start: (_context, match) => {
				if (match.event.type !== "user/message") throw new Error("user-question-reply start requires user/message");
				const event = match.event;
				const text = event.data.content.find((item) => item.type === "text")?.text ?? "";
				const source = replySource(event);
				if (source === null) throw new Error("user-question-reply start requires a reply source");
				return {
					seq: event.seq,
					time: event.time,
					callId: source.callId,
					outcome: source.outcome,
					text,
					...replyPairsOf(text)
				};
			},
			update: (context) => context.state,
			buildViewNode: (context) => {
				if (context.state === void 0) return null;
				const { seq, ...data } = context.state;
				const location = context.start?.location ?? { kind: "unresolved" };
				return {
					key: context.key,
					kind: "question-reply",
					id: context.id,
					target: "chat",
					anchorSeq: seq,
					location,
					groupTree: location.kind === "step" && location.step.step === 1 ? "exchange" : "input",
					visibility: "visible",
					data
				};
			}
		};
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-user-questions/src/client/QuestionReplyView.module.css.mjs
		const css = ".pPZfKa_row{flex-direction:column;align-items:flex-end;gap:6px;display:flex}.pPZfKa_bubbleWidth{max-width:min(calc(var(--dsh-chat-content-width,748px) * .702), 82%);min-width:0}.pPZfKa_bubble{text-align:left;overflow-wrap:anywhere}.pPZfKa_text,.pPZfKa_details{margin:0}.pPZfKa_details>div+div{margin-top:12px}.pPZfKa_question{color:var(--dsw-alias-label-secondary);gap:3px;display:grid}.pPZfKa_header{font-size:var(--dsh-content-font-size-secondary,13px)}.pPZfKa_answer{margin:4px 0 0}.pPZfKa_actions{height:28px;color:var(--dsw-alias-label-tertiary);align-items:center;gap:8px;padding-right:4px;display:flex}.pPZfKa_time{white-space:nowrap;padding-right:4px;font-size:13px;line-height:24px}.pPZfKa_action{border-radius:var(--dsw-radius-sm);width:28px;height:28px;color:inherit;cursor:pointer;background:0 0;border:none;justify-content:center;align-items:center;padding:6px;display:inline-flex}.pPZfKa_action svg{width:15px;height:15px}@media (hover:hover){.pPZfKa_action:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}}";
		const tagId = "@deepseek-ai/dsh-client-ui-user-questions/QuestionReplyView.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-user-questions";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var QuestionReplyView_module_css_default = {
			"action": "pPZfKa_action",
			"actions": "pPZfKa_actions",
			"answer": "pPZfKa_answer",
			"bubble": "pPZfKa_bubble",
			"bubbleWidth": "pPZfKa_bubbleWidth",
			"details": "pPZfKa_details",
			"header": "pPZfKa_header",
			"question": "pPZfKa_question",
			"row": "pPZfKa_row",
			"text": "pPZfKa_text",
			"time": "pPZfKa_time"
		};
		//#endregion
		//#region lib/types/client/QuestionReplyView.js
		/** Settled question batches rendered with the shared user-message surface. */
		/** Render recorded questions and answers without an expandable process row. */
		const QuestionReplyView = (0, react.memo)(function QuestionReplyView({ node, t }) {
			return (0, react_jsx_runtime.jsx)(QuestionReplyBubble, {
				data: node.data,
				t
			});
		});
		/**
		* Render one answered batch with questions above their corresponding answers.
		* @param props - Reply data and the question locale translator.
		* @returns The right-aligned, fully visible question-and-answer bubble.
		*/
		function QuestionReplyBubble({ data, t }) {
			const { copied, onCopy } = (0, _deepseek_ai_dsh_client_ui_primitives.useClipboardCopy)(replyClipboardText(data, t));
			return (0, react_jsx_runtime.jsxs)("div", {
				className: QuestionReplyView_module_css_default.row,
				"data-question-reply": data.callId,
				"data-reply-outcome": data.outcome,
				role: "group",
				"aria-label": t("reply.label"),
				children: [(0, react_jsx_runtime.jsx)("div", {
					className: QuestionReplyView_module_css_default.bubbleWidth,
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.UserMessageBubble, {
						className: QuestionReplyView_module_css_default.bubble,
						children: data.questions.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
							className: QuestionReplyView_module_css_default.text,
							children: data.text
						}) : (0, react_jsx_runtime.jsx)("dl", {
							className: QuestionReplyView_module_css_default.details,
							children: data.questions.map((question) => {
								const values = replyAnswerValues(data, question.id);
								return (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsxs)("dt", {
									className: QuestionReplyView_module_css_default.question,
									children: [question.header && question.header !== question.question && (0, react_jsx_runtime.jsx)("span", {
										className: QuestionReplyView_module_css_default.header,
										children: question.header
									}), (0, react_jsx_runtime.jsx)("span", { children: question.question })]
								}), (0, react_jsx_runtime.jsx)("dd", {
									className: QuestionReplyView_module_css_default.answer,
									children: values.length === 0 ? t("reply.skipped") : values.join(", ")
								})] }, question.id);
							})
						})
					})
				}), (0, react_jsx_runtime.jsxs)("div", {
					className: QuestionReplyView_module_css_default.actions,
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: QuestionReplyView_module_css_default.time,
						children: new Intl.DateTimeFormat(void 0, {
							hour: "2-digit",
							minute: "2-digit",
							hour12: false
						}).format(data.time)
					}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
						label: copied ? t("copied") : t("copy"),
						side: "bottom",
						children: (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: QuestionReplyView_module_css_default.action,
							"aria-label": copied ? t("copied") : t("copy"),
							onClick: onCopy,
							children: copied ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCopyOutlineRegular, {})
						})
					})]
				})]
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** `question` namespace dictionaries. */
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"error.incomplete": "请先完成这道问题。",
			"error.unanswered": "请选择一个选项或填写自定义答案。",
			"error.unavailable": "当前无法提交，请稍候再试。",
			"error.resubmit": "回答未送达，工作已继续，请再提交一次。",
			"status.sent": "回答已发送；面板未能关闭。",
			"wait.takeTime": "慢慢回答",
			"wait.countdown": "{seconds} 秒后继续工作",
			"wait.paused": "已暂停 · 剩余 {seconds} 秒",
			"wait.held": "会一直等你回答",
			"wait.continued": "已继续工作，仍可回答",
			"review.status": "已回答",
			"review.skipped": "这道问题当时被跳过。",
			"reply.label": "问题与回答",
			"reply.answerLabel": "回答：",
			"reply.skipped": "已跳过",
			"nav.prev": "上一题",
			"nav.next": "下一题",
			"nav.minimize": "收起问题卡片",
			"nav.maximize": "展开问题卡片",
			"nav.cancel": "放弃整组问题",
			"nav.close": "收起问题面板，可从工具调用重新打开",
			"text.expand": "展开",
			"text.collapse": "收起",
			"option.recommended": "推荐",
			"custom.placeholder": "输入你的答案",
			"action.skip": "跳过",
			"action.next": "下一题",
			"plan.header": "计划待审",
			"plan.approve": "同意执行",
			"plan.decline": "拒绝",
			"plan.discuss": "要求修改"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"error.incomplete": "Please complete this question first.",
			"error.unanswered": "Please select an option or enter a custom answer.",
			"error.unavailable": "Cannot submit right now; try again in a moment.",
			"error.resubmit": "The answer did not arrive before work continued; submit it again.",
			"status.sent": "Reply sent; the panel could not close.",
			"wait.takeTime": "Take time",
			"wait.countdown": "Continuing in {seconds}s",
			"wait.paused": "Paused · {seconds}s remaining",
			"wait.held": "Waiting until you answer",
			"wait.continued": "Work continued — you can still answer",
			"review.status": "Answered",
			"review.skipped": "This question was skipped.",
			"reply.label": "Questions and answers",
			"reply.answerLabel": "Answer: ",
			"reply.skipped": "Skipped",
			"nav.prev": "Previous question",
			"nav.next": "Next question",
			"nav.minimize": "Collapse the question card",
			"nav.maximize": "Expand the question card",
			"nav.cancel": "Dismiss all questions",
			"nav.close": "Close the panel — reopen it from the tool call",
			"text.expand": "Expand",
			"text.collapse": "Collapse",
			"option.recommended": "Recommended",
			"custom.placeholder": "Type your answer",
			"action.skip": "Skip",
			"action.next": "Next",
			"plan.header": "Plan review",
			"plan.approve": "Approve",
			"plan.decline": "Refuse",
			"plan.discuss": "Request changes"
		};
		/** Japanese copy, checked against the English keys. */
		const ja = {
			"error.incomplete": "先にこの質問に回答してください。",
			"error.unanswered": "オプションを選択するか、カスタム回答を入力してください。",
			"error.unavailable": "現在送信できません。しばらくしてからもう一度お試しください。",
			"error.resubmit": "作業が続行される前に回答が届きませんでした。もう一度送信してください。",
			"status.sent": "返信は送信されましたが、パネルを閉じられませんでした。",
			"wait.takeTime": "時間をかける",
			"wait.countdown": "{seconds}秒後に続行",
			"wait.paused": "一時停止中 · 残り{seconds}秒",
			"wait.held": "回答するまで待機中",
			"wait.continued": "作業は続行されました — まだ回答できます",
			"review.status": "回答済み",
			"review.skipped": "この質問はスキップされました。",
			"reply.label": "質問と回答",
			"reply.answerLabel": "回答: ",
			"reply.skipped": "スキップ済み",
			"nav.prev": "前の質問",
			"nav.next": "次の質問",
			"nav.minimize": "質問カードを折りたたむ",
			"nav.maximize": "質問カードを展開",
			"nav.cancel": "すべての質問を閉じる",
			"nav.close": "パネルを閉じる — ツール呼び出しから再度開けます",
			"text.expand": "展開",
			"text.collapse": "折りたたむ",
			"option.recommended": "推奨",
			"custom.placeholder": "回答を入力",
			"action.skip": "スキップ",
			"action.next": "次へ",
			"plan.header": "計画のレビュー",
			"plan.approve": "承認",
			"plan.decline": "拒否",
			"plan.discuss": "変更を依頼"
		};
		/** Spanish dictionary, checked against the English keys. */
		const es = {
			"error.incomplete": "Por favor complete esta pregunta primero.",
			"error.unanswered": "Seleccione una opción o ingrese una respuesta personalizada.",
			"error.unavailable": "No se puede enviar en este momento; Inténtalo de nuevo en un momento.",
			"error.resubmit": "La respuesta no llegó antes de que continuara el trabajo; enviarlo de nuevo.",
			"status.sent": "Respuesta enviada; el panel no pudo cerrarse.",
			"wait.takeTime": "tómate el tiempo",
			"wait.countdown": "Continuando en {seconds}s",
			"wait.paused": "En pausa · {seconds} restantes",
			"wait.held": "Esperando hasta que respondas",
			"wait.continued": "El trabajo continúa; aún puedes responder",
			"review.status": "Respondido",
			"review.skipped": "Esta pregunta fue omitida.",
			"reply.label": "Preguntas y respuestas",
			"reply.answerLabel": "Respuesta: ",
			"reply.skipped": "Saltado",
			"nav.prev": "Pregunta anterior",
			"nav.next": "Siguiente pregunta",
			"nav.minimize": "Contraer la tarjeta de preguntas",
			"nav.maximize": "Ampliar la tarjeta de preguntas",
			"nav.cancel": "Descartar todas las preguntas",
			"nav.close": "Cierre el panel; vuelva a abrirlo desde la llamada de la herramienta",
			"text.expand": "Expandir",
			"text.collapse": "Contraer",
			"option.recommended": "Recomendado",
			"custom.placeholder": "Escribe tu respuesta",
			"action.skip": "Saltar",
			"action.next": "Siguiente",
			"plan.header": "Revisión del plan",
			"plan.approve": "Aprobar",
			"plan.decline": "Rechazar",
			"plan.discuss": "Solicitar cambios"
		};
		/** French dictionary, checked against the English keys. */
		const fr = {
			"error.incomplete": "Veuillez d'abord répondre à cette question.",
			"error.unanswered": "Veuillez sélectionner une option ou saisir une réponse personnalisée.",
			"error.unavailable": "Impossible de soumettre pour le moment\xA0; réessayez dans un instant.",
			"error.resubmit": "La réponse n’est pas arrivée avant la poursuite des travaux ; soumettez-le à nouveau.",
			"status.sent": "Réponse envoyée\xA0; le panneau n'a pas pu se fermer.",
			"wait.takeTime": "Prends le temps",
			"wait.countdown": "Poursuite dans {seconds} s",
			"wait.paused": "En pause · {seconds} restants",
			"wait.held": "En attente de votre réponse",
			"wait.continued": "Le travail s'est poursuivi — vous pouvez toujours répondre",
			"review.status": "Répondu",
			"review.skipped": "Cette question a été ignorée.",
			"reply.label": "Questions et réponses",
			"reply.answerLabel": "Réponse\xA0: ",
			"reply.skipped": "Skipped",
			"nav.prev": "Question précédente",
			"nav.next": "Question suivante",
			"nav.minimize": "Réduire la fiche de questions",
			"nav.maximize": "Développer la carte de question",
			"nav.cancel": "Ignorer toutes les questions",
			"nav.close": "Fermez le panneau - rouvrez-le à partir de l'appel de l'outil",
			"text.expand": "Développer",
			"text.collapse": "Réduire",
			"option.recommended": "Recommandé",
			"custom.placeholder": "Saisissez votre réponse",
			"action.skip": "Sauter",
			"action.next": "Suivant",
			"plan.header": "Révision des plans",
			"plan.approve": "Approuver",
			"plan.decline": "Refuser",
			"plan.discuss": "Demander des modifications"
		};
		/** German dictionary, checked against the English keys. */
		const de = {
			"error.incomplete": "Bitte füllen Sie zunächst diese Frage aus.",
			"error.unanswered": "Bitte wählen Sie eine Option aus oder geben Sie eine benutzerdefinierte Antwort ein.",
			"error.unavailable": "Kann momentan nicht eingereicht werden; Versuchen Sie es gleich noch einmal.",
			"error.resubmit": "Die Antwort kam erst, als die Arbeiten weitergingen; reichen Sie es erneut ein.",
			"status.sent": "Antwort gesendet; Das Panel konnte nicht geschlossen werden.",
			"wait.takeTime": "Nehmen Sie sich Zeit",
			"wait.countdown": "Fortsetzung in {seconds}s",
			"wait.paused": "Angehalten · Verbleibende {seconds}s",
			"wait.held": "Ich warte, bis du antwortest",
			"wait.continued": "Die Arbeit ging weiter – Sie können immer noch antworten",
			"review.status": "Beantwortet",
			"review.skipped": "Diese Frage wurde übersprungen.",
			"reply.label": "Fragen und Antworten",
			"reply.answerLabel": "Antwort: ",
			"reply.skipped": "Übersprungen",
			"nav.prev": "Vorherige Frage",
			"nav.next": "Nächste Frage",
			"nav.minimize": "Reduzieren Sie die Fragenkarte",
			"nav.maximize": "Erweitern Sie die Fragenkarte",
			"nav.cancel": "Alle Fragen ablehnen",
			"nav.close": "Schließen Sie das Panel – öffnen Sie es erneut über den Tool-Aufruf",
			"text.expand": "Ausklappen",
			"text.collapse": "Einklappen",
			"option.recommended": "Empfohlen",
			"custom.placeholder": "Geben Sie Ihre Antwort ein",
			"action.skip": "Überspringen",
			"action.next": "Weiter",
			"plan.header": "Planüberprüfung",
			"plan.approve": "Genehmigen",
			"plan.decline": "Ablehnen",
			"plan.discuss": "Fordern Sie Änderungen an"
		};
		/** Russian dictionary, checked against the English keys. */
		const ru = {
			"error.incomplete": "Пожалуйста, сначала ответьте на этот вопрос.",
			"error.unanswered": "Пожалуйста, выберите вариант или введите собственный ответ.",
			"error.unavailable": "Невозможно отправить прямо сейчас; попробуйте еще раз через минуту.",
			"error.resubmit": "Ответ не пришел до продолжения работы; отправьте его еще раз.",
			"status.sent": "Ответ отправлен; панель не могла закрыться.",
			"wait.takeTime": "Найдите время",
			"wait.countdown": "Продолжение в {seconds}s",
			"wait.paused": "Приостановлено · Осталось {seconds}",
			"wait.held": "Жду, пока ты ответишь",
			"wait.continued": "Работа продолжается — вы еще можете ответить",
			"review.status": "Ответил",
			"review.skipped": "Этот вопрос был пропущен.",
			"reply.label": "Вопросы и ответы",
			"reply.answerLabel": "Ответ: ",
			"reply.skipped": "Пропущено",
			"nav.prev": "Предыдущий вопрос",
			"nav.next": "Следующий вопрос",
			"nav.minimize": "Свернуть карточку с вопросом",
			"nav.maximize": "Развернуть карточку с вопросом",
			"nav.cancel": "Отклонить все вопросы",
			"nav.close": "Закрыть панель — открыть ее снова из вызова инструмента",
			"text.expand": "Развернуть",
			"text.collapse": "Свернуть",
			"option.recommended": "Рекомендуется",
			"custom.placeholder": "Введите ответ",
			"action.skip": "Пропустить",
			"action.next": "Далее",
			"plan.header": "Обзор плана",
			"plan.approve": "Утвердить",
			"plan.decline": "Отказаться",
			"plan.discuss": "Запросить изменения"
		};
		/** Portuguese dictionary, checked against the English keys. */
		const pt = {
			"error.incomplete": "Por favor, responda esta pergunta primeiro.",
			"error.unanswered": "Selecione uma opção ou insira uma resposta personalizada.",
			"error.unavailable": "Não é possível enviar agora; tente novamente em um momento.",
			"error.resubmit": "A resposta não chegou antes da continuação do trabalho; envie-o novamente.",
			"status.sent": "Resposta enviada; o painel não pôde fechar.",
			"wait.takeTime": "Reserve um tempo",
			"wait.countdown": "Continuando em {seconds}s",
			"wait.paused": "Pausado · {seconds}s restantes",
			"wait.held": "Esperando até você responder",
			"wait.continued": "O trabalho continuou – você ainda pode responder",
			"review.status": "Respondido",
			"review.skipped": "Esta questão foi ignorada.",
			"reply.label": "Perguntas e respostas",
			"reply.answerLabel": "Resposta: ",
			"reply.skipped": "Ignorado",
			"nav.prev": "Pergunta anterior",
			"nav.next": "Próxima pergunta",
			"nav.minimize": "Recolher o cartão de perguntas",
			"nav.maximize": "Expanda o cartão de perguntas",
			"nav.cancel": "Dispense todas as perguntas",
			"nav.close": "Feche o painel – reabra-o na chamada da ferramenta",
			"text.expand": "Expandir",
			"text.collapse": "Recolher",
			"option.recommended": "Recomendado",
			"custom.placeholder": "Digite sua resposta",
			"action.skip": "Pular",
			"action.next": "Próximo",
			"plan.header": "Revisão do plano",
			"plan.approve": "Aprovar",
			"plan.decline": "Recusar",
			"plan.discuss": "Solicitar alterações"
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Dictionary namespace owned by this plugin. */
		const NS = "question";
		/** Required services: Agent scopes, Remote Events, Session UI, Slot registry, conversation nodes, and copy. */
		const inject = [
			"sessions",
			"remote",
			"remote.userQuestions",
			"uiSession",
			"slots",
			"locale",
			"uiConversation"
		];
		/**
		* Cards published to the Session pending-interaction registry, keyed by
		* `PendingQuestion.key`. A tool-call-keyed card is shared by the forwarded
		* waterfall and the Session projection.
		*
		* A card outlives its seat. Closing the panel only unpublishes it, which keeps
		* the request answerable from its tool call row, so this registry — not the
		* pending-interaction registry — decides when a request is over.
		*/
		var QuestionCards = class {
			publish;
			#cards = /* @__PURE__ */ new Map();
			constructor(publish) {
				this.publish = publish;
			}
			byCallId(sessionId, callId) {
				return this.#cards.get(PendingQuestion.keyOf(sessionId, callId));
			}
			/** Observable state for one card while the registry owns it. */
			source(key) {
				return this.#cards.get(key)?.pending;
			}
			values() {
				return [...this.#cards.values()];
			}
			/** Keys of every card registered for one Session. */
			keysFor(sessionId) {
				return this.values().filter((card) => card.pending.sessionId === sessionId).map((card) => card.pending.key);
			}
			/**
			* Return the card of a tool call, creating and publishing it when absent.
			* A request without a call id always gets a fresh card.
			*/
			ensure(sessionId, questions, callId) {
				if (callId !== void 0) {
					const existing = this.byCallId(sessionId, callId);
					if (existing !== void 0) return existing;
				}
				return this.#create(new PendingQuestion(sessionId, questions, callId, () => this.keysFor(sessionId)));
			}
			/** Publish one carrier into the composer seat and register the card that owns it. */
			#create(pending) {
				const requests = /* @__PURE__ */ new Set();
				const delegate = async () => {
					pending.delegate();
					await Promise.all(requests);
				};
				let unpublish = this.publish(pending, delegate);
				const card = {
					pending,
					hide: () => {
						unpublish?.();
						unpublish = void 0;
					},
					reveal: () => {
						unpublish?.();
						unpublish = this.publish(pending, delegate);
					},
					remove: () => {
						/* v8 ignore next -- a card leaves the registry once; no caller holds a card the registry already replaced. */
						if (this.#cards.get(pending.key) !== card) return;
						this.#cards.delete(pending.key);
						pending.close();
						unpublish?.();
						unpublish = void 0;
					},
					trackRequest: (completion) => {
						requests.add(completion);
						return () => {
							requests.delete(completion);
						};
					},
					hasRequest: () => requests.size > 0
				};
				pending.attachSeat({ hide: pending.review === void 0 ? card.hide : card.remove });
				this.#cards.set(pending.key, card);
				return card;
			}
			/**
			* Show the panel of one answerable tool call.
			* @param sessionId - Session the tool call belongs to.
			* @param callId - `ask_user_question` call whose panel to show, as its
			* transcript row spells it.
			* @returns whether a card for that call is still answerable.
			*/
			reveal(sessionId, callId) {
				const card = this.byCallId(sessionId, callId);
				if (card === void 0) return false;
				card.reveal();
				return true;
			}
			/**
			* Show one settled tool call's recorded answers as a read-only card. A call
			* that somehow still holds a card is shown as it stands, so a live request is
			* never replaced by a stale copy of itself.
			* @param sessionId - Session the tool call belongs to.
			* @param callId - `ask_user_question` call whose record to show, as its
			* transcript row spells it.
			* @param record - the call's questions and recorded answers.
			* @returns true; a record always produces a card.
			*/
			review(sessionId, callId, record) {
				(this.byCallId(sessionId, callId) ?? this.#create(new PendingQuestion(sessionId, record.questions, brandString(callId), () => this.keysFor(sessionId), record.answers))).reveal();
				return true;
			}
			/**
			* Hand every live waterfall back at plugin teardown. The pending-interaction
			* registry only drains what it currently holds, and a hidden card is not in
			* it, so its Host request would wait for its own abort instead.
			*/
			dispose() {
				for (const card of this.values()) {
					card.pending.delegate();
					card.remove();
				}
			}
		};
		/** Present one forwarded request through its card until the waterfall settles. */
		async function answerQuestion(ctx, owner, request, next, cards) {
			const sessionId = ctx.sessions.scopeOf(owner);
			if (sessionId === void 0) return next();
			const callId = request.wait?.callId;
			const card = cards.ensure(sessionId, request.questions, callId);
			const claimLifetime = new AbortController();
			const claimSignal = request.signal === void 0 ? claimLifetime.signal : AbortSignal.any([claimLifetime.signal, request.signal]);
			let claim;
			let claimEnded;
			let delegateRequest;
			const releaseClaim = request.wait?.timed === true && callId !== void 0 ? ctx.effect(() => {
				claim = ctx.remote.userQuestions.attachWait(sessionId, callId, claimSignal);
				return async () => {
					delegateRequest?.();
					claimLifetime.abort();
					claim?.dispose();
					if (claimEnded !== void 0) await Promise.allSettled([claimEnded]);
				};
			}, "ui-user-questions: foreground claim") : void 0;
			const completed = Promise.withResolvers();
			const finishRequest = card.trackRequest(completed.promise);
			try {
				const iterator = claim?.[Symbol.asyncIterator]();
				const opening = iterator === void 0 ? void 0 : await iterator.next();
				if (opening?.done === true) return await next();
				const waterfall = createWaterfallRequest(opening === void 0 ? void 0 : Date.now() + opening.value.remainingMs, claimSignal, (channel) => {
					card.pending.detachWaterfall(channel);
				});
				if (claimSignal.aborted) return await waterfall.result;
				delegateRequest = () => {
					waterfall.channel.delegate();
				};
				card.pending.attachWaterfall(waterfall.channel);
				if (iterator !== void 0) claimEnded = (async () => {
					await iterator.next();
					throw new Error("the foreground question wait ended");
				})();
				try {
					return await (claimEnded === void 0 ? waterfall.result : Promise.race([waterfall.result, claimEnded]));
				} catch (error) {
					if (waterfall.isDelegation(error)) {
						await releaseClaim?.();
						return await next();
					}
					throw error;
				}
			} finally {
				if (releaseClaim === void 0) claimLifetime.abort();
				else if (claimEnded === void 0) await releaseClaim();
				else Promise.allSettled([claimEnded]).then(() => {
					releaseClaim();
				});
				if (callId === void 0) card.remove();
				completed.resolve();
				finishRequest();
			}
		}
		/**
		* Mirror answerable calls onto cards. A submitted reply in the durable Inbox
		* removes the editable card until the reply is admitted or discarded.
		*/
		function publishContinuedQuestions(ctx, cards) {
			const sessions = ctx.sessions;
			const stopProjections = /* @__PURE__ */ new Map();
			const unwrap = (result) => {
				if (!result.ok) throw new Error(result.error.message);
				return result.value;
			};
			const rpcFor = (sessionId, callId) => ({ answer: async (answer) => unwrap(await ctx.remote.userQuestions.answer(sessionId, callId, answer)) });
			const reconcile = () => {
				const snapshot = sessions.list.getSnapshot();
				const bound = new Map(Object.values(snapshot.byId).flatMap((summary) => {
					const binding = sessions.binding(summary.id);
					return binding === void 0 ? [] : [[summary.id, binding]];
				}));
				for (const [sessionId, stop] of stopProjections) {
					if (bound.has(sessionId)) continue;
					stop();
					stopProjections.delete(sessionId);
				}
				for (const [sessionId, binding] of bound) {
					if (stopProjections.has(sessionId)) continue;
					const stopQuestions = binding.session.projections.faceOf("userQuestions").subscribe(reconcile);
					const stopInbox = binding.session.projections.faceOf("inbox").subscribe(reconcile);
					stopProjections.set(sessionId, () => {
						stopQuestions();
						stopInbox();
					});
				}
				const rows = /* @__PURE__ */ new Map();
				for (const [sessionId, binding] of bound) {
					const projected = binding.session.projections.faceOf("userQuestions").getSnapshot();
					const inbox = binding.session.projections.faceOf("inbox").getSnapshot();
					const queued = /* @__PURE__ */ new Set();
					for (const message of [...inbox?.["next-step"] ?? [], ...inbox?.["next-turn"] ?? []]) {
						if (typeof message !== "object" || message === null || Array.isArray(message)) continue;
						const source = message.source;
						if (typeof source !== "object" || source === null || Array.isArray(source)) continue;
						if (source.kind === "user-question-reply" && typeof source.callId === "string") queued.add(source.callId);
					}
					for (const row of projected?.active ?? []) {
						if (row.state === "continued" && queued.has(row.callId)) continue;
						rows.set(PendingQuestion.keyOf(sessionId, row.callId), {
							sessionId,
							row
						});
					}
				}
				for (const { sessionId, row } of rows.values()) {
					if (row.state === "continued") {
						const card = cards.ensure(sessionId, row.questions, row.callId);
						card.pending.attachRpc(rpcFor(sessionId, row.callId));
						card.pending.setState("continued");
						continue;
					}
					cards.byCallId(sessionId, row.callId)?.pending.setState("open");
				}
				for (const card of cards.values()) {
					if (card.pending.callId === void 0 || card.pending.review !== void 0 || rows.has(card.pending.key) || card.hasRequest() || card.pending.hasWaterfall()) continue;
					card.remove();
				}
			};
			reconcile();
			const stopList = sessions.list.subscribe(reconcile);
			return () => {
				stopList();
				for (const stop of stopProjections.values()) stop();
				stopProjections.clear();
			};
		}
		/**
		* Client plugin body: register the `question` dictionaries, the question
		* composer into the composer chain, and the late-reply conversation node.
		* Zero business face — data and verbs live on the matched carrier; t rides
		* the standard locale seat.
		* @param ctx - client root context.
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
			}), "ui-user-questions: dictionaries");
			const questionDraftStore = createQuestionDraftStore();
			const cards = new QuestionCards(ctx.uiSession.registerPendingInteraction((pending) => pending.kind === "plan-review" ? 2 : 1));
			ctx.effect(() => () => {
				cards.dispose();
			}, "ui-user-questions: cards");
			const disposePanels = ctx.reflect.provide("userQuestionPanels", {
				reveal: (sessionId, callId) => cards.reveal(sessionId, callId),
				review: (sessionId, callId, record) => cards.review(sessionId, callId, record)
			});
			ctx.effect(() => disposePanels, "ui-user-questions: answer panels");
			ctx.effect(() => publishContinuedQuestions(ctx, cards), "ui-user-questions: continued questions");
			ctx.slots.inject("conversation.composer", () => ctx.slots.register({
				name: "conversation.composer",
				select: ({ pendingInteraction }) => pendingInteraction instanceof PendingQuestion ? pendingInteraction : null,
				locale: NS,
				store: questionDraftStore,
				inject: () => ({ keyedHooks: { questionCard: (key) => cards.source(key) } }),
				children: { "conversation.plan-review.actions": {
					kind: "list",
					scope: "session"
				} }
			}, QuestionComposer));
			ctx.uiConversation.events.register(questionReplyDefinition);
			ctx.uiConversation.events.register(answeredQuestionDefinition);
			ctx.slots.inject("conversation.chat.node", () => ctx.slots.register({
				name: "conversation.chat.node",
				key: "question-reply",
				locale: NS
			}, QuestionReplyView));
			ctx.remote.$on("user-questions/request", function(request, next) {
				return answerQuestion(ctx, this, request, next, cards);
			});
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
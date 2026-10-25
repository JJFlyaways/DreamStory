window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-plan",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		require("@deepseek-ai/cordis");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		//#region ../../util/crypto/src/index.ts
		/**
		* Random v4 UUID, minted from `crypto.getRandomValues`.
		* @returns the UUID string.
		*/
		function randomUUID() {
			const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
			const hex = Array.from(bytes, (byte, index) => {
				return (index === 6 ? byte & 15 | 64 : index === 8 ? byte & 63 | 128 : byte).toString(16).padStart(2, "0");
			}).join("");
			return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-plan/src/client/PlanPreview.module.css.mjs
		const css$1 = ".wHOWgq_cards{flex-direction:column;gap:10px;display:flex}.wHOWgq_card{--plan-card-fill:var(--dsw-static-neutral-50);--plan-card-hover:var(--dsw-static-neutral-100);box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg);background:var(--plan-card-fill);width:100%;min-width:0;height:60px;color:var(--dsw-alias-label-primary);font:inherit;text-align:left;cursor:pointer;align-items:center;gap:10px;margin:0;padding:8px 10px;transition:background-color .12s;display:flex}body[data-ds-dark-theme] .wHOWgq_card{--plan-card-fill:var(--dsw-static-neutral-850);--plan-card-hover:var(--dsw-static-neutral-800)}@media (hover:hover){.wHOWgq_card:hover{background:var(--plan-card-hover)}}.wHOWgq_card:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:3px}.wHOWgq_cardIcon{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l1);background:color-mix(in srgb, var(--dsw-static-neutral-00) 50%, transparent);border-radius:10px;flex:none;place-items:center;width:40px;height:40px;display:grid}body[data-ds-dark-theme] .wHOWgq_cardIcon{background:color-mix(in srgb, var(--dsw-static-neutral-00) 5%, transparent)}.wHOWgq_cardDetails{flex-direction:column;flex:1;gap:2px;min-width:0;display:flex}.wHOWgq_cardTitle{text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:500;line-height:20px;overflow:hidden}.wHOWgq_cardDescription{text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-tertiary);font-size:10px;line-height:16px;overflow:hidden}.wHOWgq_cardOpen{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-button-floating-fill);flex:none;align-items:center;height:28px;padding:4px 8px;font-size:12px;line-height:18px;display:inline-flex}.wHOWgq_reviewLink{color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border:0;align-items:center;gap:4px;padding:0;display:inline-flex}@media (hover:hover){.wHOWgq_reviewLink:hover{color:var(--dsw-alias-label-primary)}}.wHOWgq_reviewLink:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:3px}.wHOWgq_preview{box-sizing:border-box;height:100%;padding:20px 24px 40px;position:relative;overflow:auto}.wHOWgq_document{color:var(--dsw-alias-label-primary);overflow-wrap:anywhere;font-size:14px;line-height:1.75}.wHOWgq_message{color:var(--dsw-alias-label-secondary);padding:24px;font-size:14px}.wHOWgq_titleIcon{flex:none}@media (width<=767px){.wHOWgq_preview{padding:16px 18px 32px}}";
		const tagId$1 = "@deepseek-ai/dsh-client-ui-plan/PlanPreview.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-plan";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var PlanPreview_module_css_default = {
			"card": "wHOWgq_card",
			"cardDescription": "wHOWgq_cardDescription",
			"cardDetails": "wHOWgq_cardDetails",
			"cardIcon": "wHOWgq_cardIcon",
			"cardOpen": "wHOWgq_cardOpen",
			"cardTitle": "wHOWgq_cardTitle",
			"cards": "wHOWgq_cards",
			"document": "wHOWgq_document",
			"message": "wHOWgq_message",
			"preview": "wHOWgq_preview",
			"reviewLink": "wHOWgq_reviewLink",
			"titleIcon": "wHOWgq_titleIcon"
		};
		//#endregion
		//#region lib/types/client/PlanCard.js
		/** Persistent transcript cards and pending-review sidebar navigation. */
		/**
		* Render the completed Turn's submitted plans in invocation order.
		* @param props - Logged plan, localized copy, and Session-bound navigation.
		* @returns keyboard-accessible plan cards, or null for a Turn without plans.
		*/
		function PlanCards({ turn, usePlans, openPlan, t }) {
			const plans = usePlans(String(turn.turn));
			if (plans === void 0 || plans.length === 0) return null;
			return (0, react_jsx_runtime.jsx)("div", {
				className: PlanPreview_module_css_default.cards,
				"data-plan-artifacts": true,
				children: plans.map((plan) => (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: PlanPreview_module_css_default.card,
					"data-plan-card": plan.callId,
					"aria-label": t("preview.openNamed", { title: plan.title }),
					onClick: () => {
						openPlan(plan.callId);
					},
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: PlanPreview_module_css_default.cardIcon,
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, {
								kind: "markdown",
								size: 20
							})
						}),
						(0, react_jsx_runtime.jsxs)("span", {
							className: PlanPreview_module_css_default.cardDetails,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: PlanPreview_module_css_default.cardTitle,
								children: plan.title
							}), (0, react_jsx_runtime.jsx)("span", {
								className: PlanPreview_module_css_default.cardDescription,
								children: t("preview.document")
							})]
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: PlanPreview_module_css_default.cardOpen,
							children: t("preview.action")
						})
					]
				}, plan.callId))
			});
		}
		/**
		* Open each pending plan automatically and retain a manual opener without answering it.
		*
		* The automatic open waits for a Session on screen. `ctx.sidebarRight` names
		* the Session before the commit that brings its Conversation back renders, so
		* a review that arrived while the Conversation was off screen opens from the
		* effect of the commit that mounts it.
		* @param props - Review identity, Session store, localized copy, and navigation.
		* @returns an opener for either logged or temporary plan text.
		*/
		function PlanReviewOpen({ review, requestKey, openReview, useSidebarMounted, t, useStore, actions }) {
			const identity = review.callId === void 0 ? `review:${requestKey}` : `call:${review.callId}`;
			const opened = useStore((state) => state.opened[identity] === true);
			const mounted = useSidebarMounted((session) => session !== void 0);
			(0, react.useEffect)(() => {
				if (opened || !mounted) return;
				openReview(review, requestKey);
				actions.markOpened(identity);
			}, [
				identity,
				opened,
				mounted,
				openReview,
				review,
				requestKey,
				actions
			]);
			return (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: PlanPreview_module_css_default.reviewLink,
				title: t("preview.open"),
				"aria-label": t("preview.open"),
				onClick: () => {
					openReview(review, requestKey);
				},
				children: [t("preview.full"), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, { size: 14 })]
			});
		}
		//#endregion
		//#region lib/types/client/review-preview.js
		/**
		* Name one temporary review within its browser lifetime and Session.
		* @param sessionId - Session displaying the review.
		* @param requestKey - Browser-unique pending request identity.
		* @returns the address used to focus or reopen its preview.
		*/
		function reviewPreviewAddress(sessionId, requestKey) {
			return `dsh-resource://plan-review/${encodeURIComponent(sessionId)}/${encodeURIComponent(requestKey)}`;
		}
		/**
		* Recognize temporary plan navigation without interpreting it as logged history.
		* @param address - Saved or caller-supplied navigation address.
		* @returns whether the address identifies a temporary review preview.
		*/
		function isReviewPreviewAddress(address) {
			return /^dsh-resource:\/\/plan-review\/[^/?#]+\/[^/?#]+$/.test(address);
		}
		//#endregion
		//#region lib/types/client/failure-line.js
		/**
		* Explain a failed plan read in the current locale.
		* @param t - Plan namespace translator.
		* @param failure - Failure reported by the resource provider.
		* @returns localized plan copy, or the external failure's diagnostic.
		*/
		function planFailureLine(t, failure) {
			switch (failure.code) {
				case "plan/invalid-address": return t("preview.invalidAddress");
				case "plan/unavailable": return t("preview.historyUnavailable");
				case "plan/not-found": return t("preview.notFound");
				default: return failure.message;
			}
		}
		//#endregion
		//#region lib/types/client/PlanPreview.js
		/** Read-only Markdown viewer for logged plans and temporary review documents. */
		/**
		* Render the submitted plan with its complete Markdown.
		* @param props - Framework-bound tab identity, resource, and copy.
		* @returns the plan document or a localized loading/failure state.
		*/
		function PlanPreview({ useTabInfo, useResource, t }) {
			const tab = useTabInfo();
			const resource = useResource(tab.tab.navigation.address);
			const temporary = isReviewPreviewAddress(tab.tab.navigation.address);
			const params = tab.tab.navigation.params;
			const plan = temporary ? params !== void 0 && "planReview" in params ? params.planReview : void 0 : resource.value;
			const labels = (0, react.useMemo)(() => ({
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
			if (plan === void 0) return (0, react_jsx_runtime.jsxs)("div", {
				className: PlanPreview_module_css_default.message,
				role: "status",
				children: [temporary ? t("preview.expired") : resource.status === "none" ? t("preview.unavailable") : resource.status === "failed" ? t("preview.failed") : t("preview.loading"), !temporary && resource.failure !== void 0 && (0, react_jsx_runtime.jsx)("p", { children: planFailureLine(t, resource.failure) })]
			});
			return (0, react_jsx_runtime.jsx)("section", {
				className: PlanPreview_module_css_default.preview,
				"data-plan-preview": "callId" in plan ? plan.callId : tab.tab.navigation.address,
				"aria-label": plan.title,
				children: (0, react_jsx_runtime.jsx)("div", {
					className: PlanPreview_module_css_default.document,
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
						text: plan.markdown,
						labels
					})
				})
			});
		}
		/**
		* Display a plain file icon and the heading in its tab after resource recovery.
		* @param props - Framework-bound tab identity and resource reader.
		* @returns a decorative file icon followed by the recovered title or initial localized label.
		*/
		function PlanTitle({ useTabInfo, useResource }) {
			const tab = useTabInfo();
			const resource = useResource(tab.tab.navigation.address);
			const params = tab.tab.navigation.params;
			const plan = isReviewPreviewAddress(tab.tab.navigation.address) ? params !== void 0 && "planReview" in params ? params.planReview : void 0 : resource.value;
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, {
				kind: "other",
				size: 16,
				className: PlanPreview_module_css_default.titleIcon
			}), plan?.title ?? tab.tab.title] });
		}
		//#endregion
		//#region lib/types/client/plan.js
		function record(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		/**
		* Read a complete plan from untrusted logged arguments.
		* @param event - Native call or PTC dispatch event from Session history.
		* @returns the submitted plan, or undefined for unrelated or malformed data.
		*/
		function submittedPlan(event) {
			if (event.type !== "tool/call" && event.type !== "tool/ptc-dispatch-start" && event.type !== "tool/ptc-dispatch") return void 0;
			const data = event.data;
			if (!record(data) || data.name !== "exit_plan_mode") return void 0;
			const callId = event.type === "tool/call" ? data.callId : data.subCallId;
			if (typeof callId !== "string" || callId === "") return void 0;
			let args = data.arguments;
			if (event.type === "tool/call") {
				if (typeof args !== "string") return void 0;
				try {
					args = JSON.parse(args);
				} catch (_error) {
					return;
				}
			}
			if (!record(args) || typeof args.plan !== "string") return void 0;
			const markdown = args.plan;
			const title = /^#\s+(\S[^\r\n]*)/.exec(markdown.trim())?.[1];
			return title === void 0 ? void 0 : {
				callId,
				markdown,
				title
			};
		}
		/**
		* Encode the durable identity of a plan without retaining its text in layout storage.
		* @param target - Session and tool-call identity.
		* @returns the plan resource address.
		*/
		function planAddress(target) {
			const { session, callId } = target;
			return `dsh-resource://plan/${(session.kind === "session" ? [session.sessionId, callId] : [
				"subagent",
				session.parentSessionId,
				session.childSessionId,
				session.mode,
				callId
			]).map(encodeURIComponent).join("/")}`;
		}
		/**
		* Validate a saved or caller-supplied plan resource address.
		* @param address - Address submitted to the sidebar or resource provider.
		* @returns the decoded identity, or undefined for an unsupported address.
		*/
		function parsePlanAddress(address) {
			const match = /^dsh-resource:\/\/plan\/([^?#]+)$/.exec(address);
			if (match === null) return void 0;
			try {
				const parts = match[1].split("/").map(decodeURIComponent);
				if (parts.some((part) => part === "")) return void 0;
				if (parts.length === 2) return {
					session: {
						kind: "session",
						sessionId: parts[0]
					},
					callId: parts[1]
				};
				if (parts.length === 5 && parts[0] === "subagent" && (parts[3] === "one-shot" || parts[3] === "continuable" || parts[3] === "unknown")) return {
					session: {
						kind: "subagent",
						parentSessionId: parts[1],
						childSessionId: parts[2],
						mode: parts[3]
					},
					callId: parts[4]
				};
				return;
			} catch (_error) {
				return;
			}
		}
		//#endregion
		//#region lib/types/client/plan-definition.js
		/** One card per invocation; a later PTC settlement retains the original card position. */
		const planDefinition = {
			kind: "submitted-plan",
			target: "chat",
			match: (event) => {
				const plan = submittedPlan(event);
				return plan === void 0 ? null : {
					id: plan.callId,
					role: event.type === "tool/ptc-dispatch" ? "update" : "start"
				};
			},
			start: (_context, match) => submittedPlan(match.event),
			update: (context) => context.state,
			buildViewNode: (context) => {
				const start = context.start ?? context.matches[0];
				const data = context.state ?? (start === void 0 ? void 0 : submittedPlan(start.event));
				if (data === void 0 || start === void 0) return null;
				return {
					key: context.key,
					kind: "submitted-plan",
					id: context.id,
					target: "chat",
					anchorSeq: start.event.seq,
					location: start.location,
					visibility: "hidden",
					data
				};
			}
		};
		//#endregion
		//#region ../../typert/protocol/src/remote-error.ts
		/**
		* One Remote call failure: a real Error carrying its stable code and typed
		* details. Owners throw it at the failure point; the Host Gateway encodes it
		* onto the wire unchanged; the Client face rebuilds an instance for the
		* `RemoteResult` error branch, so `throw result.error` keeps throw semantics.
		* Discrimination is always by `code`, never by instanceof.
		*/
		var RemoteError = class extends Error {
			code;
			details;
			/** Structural marker: cross-realm/bundle identification never uses instanceof. */
			isDSHRemoteError = true;
			/**
			* @param code - stable failure code declared in {@link RemoteErrorDetailsMap}.
			* @param message - human diagnostic carried across the wire.
			* @param details - structured payload typed by the code.
			* @param options - standard Error options (`cause` survives in-process only).
			*/
			constructor(code, message, details, options) {
				super(message, options);
				this.code = code;
				this.details = details;
				this.name = "RemoteError";
			}
		};
		/**
		* Structurally identify a RemoteError thrown across module or realm copies of
		* this class. Mechanism-internal: the Gateway and test assertions use it;
		* business code receives typed failures and never needs it.
		* @param value - a caught value.
		* @returns the failure when the marker matches, otherwise undefined.
		*/
		function remoteErrorOf(value) {
			if (typeof value === "object" && value !== null && value.isDSHRemoteError === true && typeof value.code === "string") return value;
		}
		//#endregion
		//#region ../../typert/protocol/src/index.ts
		/**
		* Remote decorators and explicit Gateway bindings backed by versioned
		* descriptors carried on decorated class prototypes. Strict reflection
		* remains a Typert compiler responsibility.
		* @module @deepseek-ai/dsh-typert-protocol
		*/
		//#endregion
		//#region lib/types/client/plan-resource.js
		/**
		* Bind plan reads to the generated Session Remote face.
		* Opening a follow reads projections and may activate a prepared Session on the Host.
		* Generated Remote streams can throw carrier failures; the provider reports failed
		* reads as resource failure frames and preserves Remote error codes.
		* @param remote - Existing Session history API.
		* @returns a provider whose reads stop after finding the exact invocation.
		*/
		function planResourceProvider(remote) {
			return {
				protocol: "plan",
				async *open(address, { signal }) {
					const aborted = () => signal.aborted;
					if (aborted()) return;
					const target = parsePlanAddress(address);
					if (target === void 0) {
						yield {
							ok: false,
							error: new RemoteError("plan/invalid-address", "Invalid plan resource address.", {})
						};
						return;
					}
					const sessionAddress = target.session;
					try {
						let snapshot;
						for await (const frame of remote.follow({ address: sessionAddress }, signal)) if (frame.type === "snapshot") {
							snapshot = frame;
							break;
						}
						if (aborted()) return;
						if (snapshot === void 0) throw new RemoteError("plan/unavailable", "Session history ended before the plan could be read.", {});
						let page = {
							records: snapshot.records,
							hasMore: snapshot.hasMore
						};
						while (true) {
							for (const entry of page.records) {
								const plan = submittedPlan(entry.event);
								if (plan?.callId === target.callId) {
									yield {
										ok: true,
										value: plan
									};
									return;
								}
							}
							const beforeSeq = page.records[0]?.event.seq;
							if (!page.hasMore || beforeSeq === void 0) break;
							const next = await remote.page({
								address: sessionAddress,
								throughSeq: snapshot.cursor,
								beforeSeq
							}, signal);
							if (aborted()) return;
							if (!next.ok) {
								yield next;
								return;
							}
							page = next.value;
						}
						yield {
							ok: false,
							error: new RemoteError("plan/not-found", "The submitted plan was not found in this Session.", {})
						};
					} catch (error) {
						if (!aborted()) yield {
							ok: false,
							error: remoteErrorOf(error) ?? new RemoteError("plan/read-failed", error instanceof Error ? error.message : String(error), {})
						};
					}
				}
			};
		}
		//#endregion
		//#region lib/types/client/review-store.js
		/** Session-owned memory of pending plans already opened automatically. */
		/**
		* Keep manual sidebar closure effective across review component remounts.
		* @returns a transient store handle whose instances belong to Session scopes.
		*/
		function createPlanReviewStore() {
			return (0, _deepseek_ai_dsh_client_store.defineStore)({
				init: () => ({ opened: {} }),
				actions: { markOpened: (draft, reviewKey) => {
					draft.opened[reviewKey] = true;
				} }
			});
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-plan/src/client/PlanModeControl.module.css.mjs
		const css = ".ICXTbW_wrap{align-items:center;gap:6px;display:inline-flex}.ICXTbW_chip{border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-state-business-tertiary);min-width:34px;height:28px;color:var(--dsw-alias-state-business-primary);cursor:pointer;border:none;align-items:center;gap:4px;padding:0 8px;font-size:13px;font-weight:500;line-height:20px;display:inline-flex}@media (hover:hover){.ICXTbW_chip:hover:not(:disabled){background:color-mix(in srgb, var(--dsw-alias-state-business-tertiary), var(--dsw-alias-state-business-primary) 6%)}}.ICXTbW_chip:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}.ICXTbW_chip:disabled{opacity:.6;cursor:default}.ICXTbW_glyph{color:currentColor;flex:none;width:14px;height:14px;display:inline-flex}.ICXTbW_hoverGlyph,.ICXTbW_chip:focus-visible .ICXTbW_restGlyph{display:none}@media (hover:hover){.ICXTbW_chip:hover:not(:disabled) .ICXTbW_restGlyph{display:none}}.ICXTbW_chip:focus-visible .ICXTbW_hoverGlyph{display:block}@media (hover:hover){.ICXTbW_chip:hover:not(:disabled) .ICXTbW_hoverGlyph{display:block}}.ICXTbW_error{color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px}";
		const tagId = "@deepseek-ai/dsh-client-ui-plan/PlanModeControl.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-plan";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var PlanModeControl_module_css_default = {
			"chip": "ICXTbW_chip",
			"error": "ICXTbW_error",
			"glyph": "ICXTbW_glyph",
			"hoverGlyph": "ICXTbW_hoverGlyph",
			"restGlyph": "ICXTbW_restGlyph",
			"wrap": "ICXTbW_wrap"
		};
		//#endregion
		//#region lib/types/client/PlanModeControl.js
		/**
		* Plan-mode status over the host-computed `plan` projection. The chip renders
		* only while the effective target is plan mode (`pending ? !active : active`
		* — a folded host value, not client optimism) and executes /plan off.
		*/
		function PlanChip({ useProjection, locked, exitPlanMode, t }) {
			const plan = useProjection("plan");
			const [leaving, setLeaving] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			const aliveRef = (0, react.useRef)(true);
			(0, react.useEffect)(() => {
				aliveRef.current = true;
				return () => {
					aliveRef.current = false;
				};
			}, []);
			if (plan === void 0) return null;
			if (!(plan.pending ? !plan.active : plan.active)) return null;
			const off = () => {
				setLeaving(true);
				setError(null);
				exitPlanMode().then((failure) => {
					if (!aliveRef.current) return;
					setLeaving(false);
					setError(failure);
				}, (reason) => {
					if (!aliveRef.current) return;
					setLeaving(false);
					setError(reason instanceof Error ? reason.message : String(reason));
				});
			};
			return (0, react_jsx_runtime.jsxs)("span", {
				className: PlanModeControl_module_css_default.wrap,
				children: [(0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: PlanModeControl_module_css_default.chip,
					"aria-label": t("chip.on.aria"),
					title: t("chip.on.title"),
					disabled: locked || leaving,
					onClick: off,
					children: [(0, react_jsx_runtime.jsxs)("span", {
						className: PlanModeControl_module_css_default.glyph,
						"aria-hidden": true,
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlanOutlineRegular, {
							className: PlanModeControl_module_css_default.restGlyph,
							size: 14
						}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseCircleFillRegular, {
							className: PlanModeControl_module_css_default.hoverGlyph,
							size: 14
						})]
					}), t("chip.label")]
				}), error !== null && (0, react_jsx_runtime.jsx)("span", {
					className: PlanModeControl_module_css_default.error,
					role: "status",
					title: error,
					children: t("chip.exitFailed")
				})]
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** `plan` namespace dictionaries (the composer plan chip's copy). */
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"chip.label": "计划",
			"preview.title": "计划",
			"preview.document": "计划 · Markdown",
			"preview.action": "打开",
			"preview.open": "在侧边栏打开计划",
			"preview.full": "查看全文",
			"preview.openNamed": "打开计划：{title}",
			"preview.loading": "正在读取计划…",
			"preview.failed": "无法读取计划",
			"preview.invalidAddress": "计划地址无效",
			"preview.historyUnavailable": "无法读取会话历史",
			"preview.notFound": "未找到这份计划",
			"preview.unavailable": "计划预览不可用",
			"preview.expired": "临时计划预览已失效，请从仍在等待审批的卡片重新打开。",
			"chip.on.aria": "计划模式已开启，按下关闭",
			"chip.on.title": "计划模式已开启 — 点击关闭（/plan off）",
			"chip.exitFailed": "退出计划模式失败"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"chip.label": "Plan",
			"preview.title": "Plan",
			"preview.document": "Plan · Markdown",
			"preview.action": "Open",
			"preview.open": "Open plan in sidebar",
			"preview.full": "View full plan",
			"preview.openNamed": "Open plan: {title}",
			"preview.loading": "Loading plan…",
			"preview.failed": "Could not load plan",
			"preview.invalidAddress": "Invalid plan address",
			"preview.historyUnavailable": "Session history is unavailable",
			"preview.notFound": "This plan was not found",
			"preview.unavailable": "Plan preview is unavailable",
			"preview.expired": "This temporary plan preview has expired. Reopen it from the pending review card.",
			"chip.on.aria": "Plan mode on, press to turn off",
			"chip.on.title": "Plan mode on — click to turn off (/plan off)",
			"chip.exitFailed": "Failed to exit plan mode"
		};
		/** Japanese copy, checked against the English keys. */
		const ja = {
			"chip.label": "計画",
			"preview.title": "計画",
			"preview.document": "計画 · Markdown",
			"preview.action": "開く",
			"preview.open": "サイドバーで計画を開く",
			"preview.full": "計画全体を表示",
			"preview.openNamed": "計画を開く: {title}",
			"preview.loading": "計画を読み込み中…",
			"preview.failed": "計画を読み込めませんでした",
			"preview.invalidAddress": "計画のアドレスが無効です",
			"preview.historyUnavailable": "セッション履歴を利用できません",
			"preview.notFound": "この計画は見つかりませんでした",
			"preview.unavailable": "計画のプレビューを利用できません",
			"preview.expired": "この一時的な計画プレビューは期限切れです。保留中のレビューカードから再度開いてください。",
			"chip.on.aria": "計画モードはオンです。押すとオフになります",
			"chip.on.title": "計画モードはオンです — クリックでオフ (/plan off)",
			"chip.exitFailed": "計画モードを終了できませんでした"
		};
		/** Spanish dictionary, checked against the English keys. */
		const es = {
			"chip.label": "Planificar",
			"preview.title": "Planificar",
			"preview.document": "Plano · Markdown",
			"preview.action": "Abrir",
			"preview.open": "Plan abierto en la barra lateral",
			"preview.full": "Ver plano completo",
			"preview.openNamed": "Plan abierto: {title}",
			"preview.loading": "Cargando plan…",
			"preview.failed": "No se pudo cargar el plan",
			"preview.invalidAddress": "Dirección del plan no válida",
			"preview.historyUnavailable": "El historial de sesiones no está disponible",
			"preview.notFound": "Este plan no fue encontrado.",
			"preview.unavailable": "La vista previa del plan no está disponible",
			"preview.expired": "Esta vista previa del plan temporal ha caducado. Vuelva a abrirlo desde la tarjeta de revisión pendiente.",
			"chip.on.aria": "Modo plan activado, presione para apagar",
			"chip.on.title": "Modo de planificación activado: haga clic para desactivar (/plan off)",
			"chip.exitFailed": "No se pudo salir del modo de plan"
		};
		/** French dictionary, checked against the English keys. */
		const fr = {
			"chip.label": "Planifier",
			"preview.title": "Planifier",
			"preview.document": "Plan · Markdown",
			"preview.action": "Ouvrir",
			"preview.open": "Plan ouvert dans la barre latérale",
			"preview.full": "Voir le forfait complet",
			"preview.openNamed": "Plan ouvert\xA0: {title}",
			"preview.loading": "Plan de chargement…",
			"preview.failed": "Impossible de charger le plan",
			"preview.invalidAddress": "Adresse du forfait invalide",
			"preview.historyUnavailable": "L'historique des sessions n'est pas disponible",
			"preview.notFound": "Ce plan n'a pas été trouvé",
			"preview.unavailable": "L'aperçu du plan n'est pas disponible",
			"preview.expired": "Cet aperçu du plan temporaire a expiré. Rouvrez-le à partir de la carte de révision en attente.",
			"chip.on.aria": "Mode Plan activé, appuyez pour désactiver",
			"chip.on.title": "Mode Plan activé — cliquez pour désactiver (/plan off)",
			"chip.exitFailed": "Échec de la sortie du mode Plan"
		};
		/** German dictionary, checked against the English keys. */
		const de = {
			"chip.label": "Planen",
			"preview.title": "Planen",
			"preview.document": "Plan · Markdown",
			"preview.action": "Öffnen",
			"preview.open": "Plan in der Seitenleiste öffnen",
			"preview.full": "Vollständigen Plan anzeigen",
			"preview.openNamed": "Offener Grundriss: {title}",
			"preview.loading": "Ladeplan…",
			"preview.failed": "Plan konnte nicht geladen werden",
			"preview.invalidAddress": "Ungültige Planadresse",
			"preview.historyUnavailable": "Der Sitzungsverlauf ist nicht verfügbar",
			"preview.notFound": "Dieser Plan wurde nicht gefunden",
			"preview.unavailable": "Die Planvorschau ist nicht verfügbar",
			"preview.expired": "Diese temporäre Planvorschau ist abgelaufen. Öffnen Sie es erneut über die ausstehende Überprüfungskarte.",
			"chip.on.aria": "Planmodus ein, zum Ausschalten drücken",
			"chip.on.title": "Planmodus ein – zum Ausschalten klicken (/plan off)",
			"chip.exitFailed": "Der Planmodus konnte nicht beendet werden"
		};
		/** Russian dictionary, checked against the English keys. */
		const ru = {
			"chip.label": "План",
			"preview.title": "План",
			"preview.document": "План · Markdown",
			"preview.action": "Открыть",
			"preview.open": "Открытая планировка в боковой панели",
			"preview.full": "Посмотреть полный план",
			"preview.openNamed": "Открытая планировка: {title}",
			"preview.loading": "План загрузки…",
			"preview.failed": "Не удалось загрузить план",
			"preview.invalidAddress": "Неверный адрес плана",
			"preview.historyUnavailable": "История сеансов недоступна",
			"preview.notFound": "Этот план не найден",
			"preview.unavailable": "Предварительный просмотр плана недоступен.",
			"preview.expired": "Срок действия этой временной предварительной версии плана истек. Откройте его снова из карточки ожидающего рассмотрения.",
			"chip.on.aria": "Режим планирования включен. Нажмите, чтобы выключить.",
			"chip.on.title": "Режим планирования включен — нажмите, чтобы выключить (/plan off)",
			"chip.exitFailed": "Не удалось выйти из режима планирования."
		};
		/** Portuguese dictionary, checked against the English keys. */
		const pt = {
			"chip.label": "Plano",
			"preview.title": "Plano",
			"preview.document": "Plano · Markdown",
			"preview.action": "Abrir",
			"preview.open": "Abrir plano na barra lateral",
			"preview.full": "Ver plano completo",
			"preview.openNamed": "Plano aberto: {title}",
			"preview.loading": "Carregando plano…",
			"preview.failed": "Não foi possível carregar o plano",
			"preview.invalidAddress": "Endereço do plano inválido",
			"preview.historyUnavailable": "O histórico da sessão não está disponível",
			"preview.notFound": "Este plano não foi encontrado",
			"preview.unavailable": "A visualização do plano não está disponível",
			"preview.expired": "Esta visualização temporária do plano expirou. Reabra-o no cartão de revisão pendente.",
			"chip.on.aria": "Modo de planejamento ativado, pressione para desligar",
			"chip.on.title": "Modo de planejamento ativado – clique para desligar (/plan off)",
			"chip.exitFailed": "Falha ao sair do modo de plano"
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Dictionary namespace owned by this plugin. */
		const NS = "plan";
		/** Services for plan controls, Conversation projection, and resource navigation. */
		const inject = [
			"slots",
			"remote",
			"remote.commands",
			"remote.session",
			"sessions",
			"locale",
			"uiConversation",
			"resources",
			"sidebarRight",
			"sidebarRightTabs"
		];
		/**
		* Register plan controls, permanent Chat cards, and sidebar document reading.
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
			}), "ui-plan: dictionaries");
			const previewId = "@deepseek-ai/dsh-client-ui-plan";
			const t = ctx.locale.bind(NS);
			ctx.effect(() => ctx.uiConversation.events.register(planDefinition), "ui-plan: conversation definition");
			ctx.effect(() => ctx.resources.register(planResourceProvider(ctx.remote.session)), "ui-plan: resources");
			ctx.effect(() => ctx.sidebarRightTabs.register({
				id: previewId,
				kind: "plan",
				patterns: ["dsh-resource://plan/**", "dsh-resource://plan-review/**"],
				priority: "builtin",
				canOpen: (address) => parsePlanAddress(address) !== void 0 || isReviewPreviewAddress(address),
				title: () => t("preview.title")
			}), "ui-plan: sidebar type");
			const open = (sessionId) => ({ openPlan: (callId) => {
				const child = ctx.sessions.subagentAddress(sessionId);
				const session = child === void 0 ? {
					kind: "session",
					sessionId
				} : {
					kind: "subagent",
					...child
				};
				ctx.sidebarRight.openResource(planAddress({
					session,
					callId
				}));
			} });
			const reviewWindow = randomUUID();
			const reviewStore = createPlanReviewStore();
			ctx.slots.inject("conversation.chat.turnTail", () => ctx.slots.register({
				name: "conversation.chat.turnTail",
				id: previewId,
				locale: NS,
				inject: (sessionId) => {
					const binding = ctx.sessions.binding(sessionId);
					if (binding === void 0) throw new Error(`ui-plan: unknown session "${sessionId}"`);
					const chat = ctx.uiConversation.binding(binding).target("chat");
					return {
						...open(sessionId),
						keyedHooks: { plans: (turn) => {
							const snapshot = chat.getSnapshot();
							if (snapshot === void 0) throw new Error("ui-plan: Chat target is unavailable");
							return snapshot.nodes.turnDataSource(Number(turn), "submitted-plan");
						} }
					};
				}
			}, PlanCards));
			ctx.slots.inject("conversation.plan-review.actions", () => ctx.slots.register({
				name: "conversation.plan-review.actions",
				id: previewId,
				locale: NS,
				store: reviewStore,
				inject: (sessionId) => ({
					openReview: (review, requestKey) => {
						if (review.callId !== void 0) {
							open(sessionId).openPlan(review.callId);
							return;
						}
						ctx.sidebarRight.openResource(reviewPreviewAddress(sessionId, `${reviewWindow}:${requestKey}`), { params: { planReview: {
							markdown: review.plan,
							title: (0, _deepseek_ai_dsh_client_ui_primitives.extractMarkdownPlainText)(review.plan, { mode: "first-line" })
						} } });
					},
					hooks: { sidebarMounted: ctx.sidebarRight.mounted }
				})
			}, PlanReviewOpen));
			ctx.slots.inject("sidebar.right.pane.tab", () => ctx.slots.register({
				name: "sidebar.right.pane.tab",
				key: previewId,
				locale: NS
			}, PlanPreview));
			ctx.slots.inject("sidebar.right.pane.tab.title", () => ctx.slots.register({
				name: "sidebar.right.pane.tab.title",
				key: previewId
			}, PlanTitle));
			ctx.slots.inject("conversation.input.plan", () => ctx.slots.register({
				name: "conversation.input.plan",
				locale: NS,
				inject: (sessionId) => ({ exitPlanMode: async () => {
					const result = await ctx.remote.commands.execute(sessionId, "/plan off", []);
					if (!result.ok) return `${result.error.message} (${result.error.code})`;
					if (result.value === void 0) return "unknown command: /plan off";
					return null;
				} })
			}, PlanChip));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
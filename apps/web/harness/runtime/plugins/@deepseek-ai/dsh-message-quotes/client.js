window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-message-quotes",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/session/message-quotes/src/client/QuoteSelection.module.css.mjs
		const css = ".I4_BzG_action{corner-shape:round;background:var(--dsw-alias-button-floating-fill);--dsw-elevation-stroke-color:var(--dsw-alias-border-l3);box-shadow:var(--dsw-elevation-panel);color:var(--dsw-alias-label-primary);font:var(--dsw-font-xs-13);cursor:pointer;border:none;border-radius:999px;padding:5px 10px}.I4_BzG_action:focus-visible{background:var(--dsw-alias-button-floating-hover)}@media (hover:hover){.I4_BzG_action:hover{background:var(--dsw-alias-button-floating-hover)}}";
		const tagId = "@deepseek-ai/dsh-message-quotes/QuoteSelection.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-message-quotes";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var QuoteSelection_module_css_default = { "action": "I4_BzG_action" };
		//#endregion
		//#region lib/types/client/QuoteSelection.js
		/** Quote action rendered through the Chat text-interaction Slot. */
		/**
		* Render the action for a selection admitted by the Quote plugin.
		* @param props - area-local text interaction and standard Session/composer seats.
		* @returns the quote button after a valid selection in a writable conversation.
		*/
		function QuoteSelectionAction({ dismiss, readText, clearSelection, inputActions, useSession, t }) {
			const enabled = useSession((s) => !s.removed && (s.subagent === null || s.subagent.address.mode === "continuable" && s.subagent.parentAvailable === true));
			(0, react.useEffect)(() => {
				if (!enabled) dismiss();
			}, [enabled, dismiss]);
			if (!enabled) return null;
			return (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: QuoteSelection_module_css_default.action,
				"aria-label": t("quote.add"),
				onPointerDown: (event) => {
					event.preventDefault();
				},
				onClick: () => {
					const text = readText();
					if (text === null) {
						dismiss();
						return;
					}
					if (!inputActions.insertQuote(text)) return;
					clearSelection();
					dismiss();
				},
				children: t("quote.add")
			});
		}
		//#endregion
		//#region lib/types/client/QuotedUserText.js
		/** Literal display for text-derived quote nodes. */
		/**
		* Display decoded quote text without further interpretation.
		* @param props - the quote node produced by the registered blockquote matcher.
		* @returns the shared literal excerpt and clipped full-text popover.
		*/
		function QuotedUserText({ node }) {
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.QuotePreview, { text: node.data.text });
		}
		//#endregion
		//#region lib/types/client/quote-text.js
		/** Explicit blockquote recognition and decoding for quote presentation. */
		/**
		* Remove one blockquote marker from each explicitly quoted line.
		* @param text - consecutive blockquote lines, with up to three leading spaces.
		* @returns excerpt text with original line endings normalized.
		*/
		function quoteTextOf(text) {
			return text.replace(/\r\n?/gu, "\n").replace(/^ {0,3}>[ \t]?/gmu, "");
		}
		/**
		* Recognize consecutive explicitly marked Markdown blockquote lines.
		* @param text - complete original message text.
		* @returns ordered nonblank quote spans; inline greater-than signs remain ordinary text.
		*/
		function messageQuoteRanges(text) {
			const ranges = [];
			for (const match of text.matchAll(/^ {0,3}>[^\r\n]*(?:\r?\n {0,3}>[^\r\n]*)*/gmu)) if (quoteTextOf(match[0]).trim() !== "") ranges.push({
				start: match.index,
				end: match.index + match[0].length
			});
			return ranges;
		}
		//#endregion
		//#region lib/types/client/quote-rule.js
		/** Markdown blockquotes produce atomic quote nodes and inline separator replacements. */
		/** Recognize blockquote lines and display adjacent paragraph separators as inline spaces. */
		const quoteRule = {
			id: "quote",
			order: -10,
			match(text, from) {
				for (const range of messageQuoteRanges(text)) for (const start of [
					range.start - 2,
					range.start,
					range.end
				]) {
					if (start < from) continue;
					if (start === range.start) return {
						id: "quote",
						start,
						end: range.end,
						data: { text: quoteTextOf(text.slice(start, range.end)) }
					};
					if (text.slice(start, start + 2) === "\n\n") return {
						id: "text",
						start,
						end: start + 2,
						data: {
							text: "\n\n",
							display: " "
						}
					};
				}
			}
		};
		//#endregion
		//#region lib/types/client/locales.js
		/** Copy owned by the Quote interaction plugin. */
		/** Quote plugin dictionary namespace. */
		const NS = "messageQuotes";
		/** Simplified Chinese dictionary and key source. */
		const zh = { "quote.add": "引用文本" };
		/** English dictionary. */
		const en = { "quote.add": "Quote text" };
		/** Japanese dictionary. */
		const ja = { "quote.add": "テキストを引用" };
		/** Spanish dictionary, checked against the English keys. */
		const es = { "quote.add": "Texto de cotización" };
		/** French dictionary, checked against the English keys. */
		const fr = { "quote.add": "Texte de citation" };
		/** German dictionary, checked against the English keys. */
		const de = { "quote.add": "Zitattext" };
		/** Russian dictionary, checked against the English keys. */
		const ru = { "quote.add": "Текст цитаты" };
		/** Portuguese dictionary, checked against the English keys. */
		const pt = { "quote.add": "Citação de texto" };
		//#endregion
		//#region lib/types/client/index.js
		/** Browser plugin name. */
		const name = "message-quotes";
		/** Services needed to admit selections and register Quote presentation. */
		const inject = [
			"slots",
			"locale",
			"sessions",
			"uiConversation"
		];
		/**
		* Register Quote admission, its action surface, and literal UserText rendering.
		* @param ctx - Client root context owning every Quote contribution.
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
			}), "message-quotes: dictionaries");
			ctx.effect(() => ctx.uiConversation.userText.register(quoteRule), "message-quotes: UserText rule");
			ctx.effect(() => ctx.uiConversation.interactions.register({
				id: "quote",
				onInteraction(request) {
					if (request.trigger !== "selection" || request.readText() === null) return;
					const binding = ctx.sessions.binding(request.sessionId);
					if (binding === void 0) return;
					const session = binding.session.getSnapshot();
					if (session.removed || session.subagent !== null && (session.subagent.address.mode !== "continuable" || session.subagent.parentAvailable !== true)) return;
					request.open();
				}
			}), "message-quotes: selection interaction");
			ctx.slots.inject("conversation.chat.text-interaction", () => ctx.slots.register({
				name: "conversation.chat.text-interaction",
				key: "quote",
				locale: NS
			}, QuoteSelectionAction));
			ctx.slots.inject("conversation.user.text.node", () => ctx.slots.register({
				name: "conversation.user.text.node",
				key: "quote",
				priority: 100
			}, QuotedUserText));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
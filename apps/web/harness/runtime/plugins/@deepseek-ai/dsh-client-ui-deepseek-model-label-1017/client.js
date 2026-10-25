window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-deepseek-model-label-1017",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-deepseek-model-label-1017/src/client/DeepSeekModelLabel.module.css.mjs
		const css = ".AM8i2a_label{vertical-align:baseline;white-space:nowrap;align-items:center;gap:4px;display:inline-flex}";
		const tagId = "@deepseek-ai/dsh-client-ui-deepseek-model-label-1017/DeepSeekModelLabel.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-deepseek-model-label-1017";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var DeepSeekModelLabel_module_css_default = { "label": "AM8i2a_label" };
		//#endregion
		//#region lib/types/client/DeepSeekModelLabel.js
		const MODEL_NAME = "DeepSeek-V4.1-Flash";
		/**
		* Render the fixed 1017 release label for recognized official Flash entries.
		* @param props - Provider and model identity plus the badge dictionary.
		* @returns The base name with a badge, or the untouched catalog name.
		*/
		function DeepSeekModelLabel({ provider, model, t }) {
			if (!(provider.id === "deepseek-account" || provider.id === "deepseek-official") || model.id !== "deepseek-flash" || model.name !== MODEL_NAME) return model.name;
			return (0, react_jsx_runtime.jsxs)("span", {
				className: DeepSeekModelLabel_module_css_default.label,
				children: [
					(0, react_jsx_runtime.jsx)("span", { children: model.name }),
					" ",
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
						tone: "info",
						children: t("badge.label")
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** Localized label of the fixed release marker. */
		/** Simplified Chinese badge copy. */
		const zh = { "badge.label": "1017" };
		/** English badge copy. */
		const en = { "badge.label": "1017" };
		/** Japanese copy, checked against the English keys. */
		const ja = { "badge.label": "1017" };
		/** Spanish dictionary, checked against the English keys. */
		const es = { "badge.label": "1017" };
		/** French dictionary, checked against the English keys. */
		const fr = { "badge.label": "1017" };
		/** German dictionary, checked against the English keys. */
		const de = { "badge.label": "1017" };
		/** Russian dictionary, checked against the English keys. */
		const ru = { "badge.label": "1017" };
		/** Portuguese dictionary, checked against the English keys. */
		const pt = { "badge.label": "1017" };
		//#endregion
		//#region lib/types/client/index.js
		/** Required services: model-label registration and localized badge text. */
		const inject = ["slots", "locale"];
		/**
		* Decorate existing model labels while their declaring slot is mounted.
		* @param ctx - Client plugin context owning the dictionaries and registration.
		*/
		function apply(ctx) {
			const namespace = "deepseek-model-label-1017";
			ctx.effect(() => ctx.locale.register(namespace, {
				zh,
				en,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}), "deepseek-model-label-1017: dictionaries");
			ctx.slots.inject("conversation.input.model.label", () => ctx.slots.register({
				name: "conversation.input.model.label",
				locale: namespace
			}, DeepSeekModelLabel));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
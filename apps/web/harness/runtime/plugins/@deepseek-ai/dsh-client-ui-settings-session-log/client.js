window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-settings-session-log",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		let react_jsx_runtime = require("react/jsx-runtime");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region lib/types/client/upload-preference.js
		/** Ordered preference writes and notices that survive the settings panel. */
		/** Writes the Host setting without publishing an optimistic upload state. */
		var UploadPreference = class {
			form;
			/** Observable mutation outcome. */
			state = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({
				busy: false,
				notice: null,
				sequence: 0
			});
			/** @param form - Host-owned configuration form. */
			constructor(form) {
				this.form = form;
			}
			/**
			* Persist enablement; refusal or transport failure leaves the accepted value visible.
			* @param enabled - requested upload state.
			* @returns completion after the write settles.
			*/
			async setEnabled(enabled) {
				if (this.state.getSnapshot().busy) return;
				this.state.update((state) => {
					state.busy = true;
					state.notice = null;
				});
				let accepted = false;
				try {
					accepted = await this.form.set("enabled", enabled);
				} catch (_error) {}
				this.state.update((state) => {
					state.busy = false;
					state.notice = accepted ? "saved" : "failed";
					state.sequence++;
				});
			}
			/** Clear the displayed mutation notice. */
			dismiss() {
				this.state.update((state) => {
					state.notice = null;
				});
			}
		};
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-settings-session-log/src/client/UploadRow.module.css.mjs
		const css = ".dY0VgG_row{border-bottom:.5px solid var(--dsw-alias-border-l2);justify-content:space-between;align-items:center;gap:24px;padding:16px 0;display:flex}.dY0VgG_title{font-size:14px;line-height:20px}.dY0VgG_description{color:var(--dsw-alias-label-secondary);margin-top:4px;font-size:12px;line-height:18px}";
		const tagId = "@deepseek-ai/dsh-client-ui-settings-session-log/UploadRow.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-settings-session-log";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var UploadRow_module_css_default = {
			"description": "dY0VgG_description",
			"row": "dY0VgG_row",
			"title": "dY0VgG_title"
		};
		//#endregion
		//#region lib/types/client/UploadRow.js
		/** General settings row and persistent shell notice for API log uploads. */
		/**
		* Render the accepted API upload state.
		* @param props - settings hooks, writer and localized copy.
		* @returns the bottom preference row.
		*/
		function UploadRow({ useUpload, useMutation, setEnabled, t }) {
			const upload = useUpload((value) => value);
			const busy = useMutation((value) => value.busy);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: UploadRow_module_css_default.row,
				children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("div", {
					className: UploadRow_module_css_default.title,
					children: t("title")
				}), (0, react_jsx_runtime.jsx)("div", {
					className: UploadRow_module_css_default.description,
					children: t("description")
				})] }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
					checked: upload.value?.enabled === true,
					label: t("title"),
					disabled: busy || upload.status !== "ready" || !upload.writable,
					onChange: (enabled) => {
						setEnabled(enabled);
					}
				})]
			});
		}
		/**
		* Keep the save outcome visible after settings closes.
		* @param props - mutation hook, dismissal and localized copy.
		* @returns the current toast, or nothing.
		*/
		function UploadToast({ useMutation, dismiss, t }) {
			const state = useMutation((value) => value);
			if (state.notice === null) return null;
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
				text: t(state.notice),
				onDone: dismiss,
				...state.notice === "saved" ? { tone: "success" } : {}
			}, state.sequence);
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** Copy for the API Session-log upload preference. */
		const en = {
			title: "Upload Session Log when using the official model API",
			description: "Help improve DeepSeek models and products.",
			saved: "Preference saved",
			failed: "Could not save preference"
		};
		/** Chinese preference copy. */
		const zh = {
			title: "在使用官方模型 API 时上传 Session Log",
			description: "帮助改进 DeepSeek 模型与产品",
			saved: "设置已保存",
			failed: "无法保存设置"
		};
		/** Japanese copy, checked against the English keys. */
		const ja = {
			"title": "公式モデル API 使用時にセッションログをアップロード",
			"description": "DeepSeek のモデルと製品の改善にご協力ください。",
			"saved": "設定を保存しました",
			"failed": "設定を保存できませんでした"
		};
		/** Spanish dictionary, checked against the English keys. */
		const es = {
			title: "Cargar registro de sesión cuando utilice el modelo oficial API",
			description: "Ayude a mejorar los modelos y productos DeepSeek.",
			saved: "Preferencia guardada",
			failed: "No se pudo guardar la preferencia"
		};
		/** French dictionary, checked against the English keys. */
		const fr = {
			title: "Téléchargez le journal de session lors de l'utilisation du modèle officiel API",
			description: "Aidez à améliorer les modèles et produits DeepSeek.",
			saved: "Préférence enregistrée",
			failed: "Impossible d'enregistrer la préférence"
		};
		/** German dictionary, checked against the English keys. */
		const de = {
			title: "Laden Sie das Sitzungsprotokoll hoch, wenn Sie das offizielle Modell API verwenden",
			description: "Helfen Sie mit, DeepSeek-Modelle und -Produkte zu verbessern.",
			saved: "Präferenz gespeichert",
			failed: "Präferenz konnte nicht gespeichert werden"
		};
		/** Russian dictionary, checked against the English keys. */
		const ru = {
			title: "Загрузить журнал сеансов при использовании официальной модели API",
			description: "Помогите улучшить модели и продукты DeepSeek.",
			saved: "Предпочтение сохранено.",
			failed: "Не удалось сохранить предпочтения."
		};
		/** Portuguese dictionary, checked against the English keys. */
		const pt = {
			title: "Carregar log de sessão ao usar o modelo oficial API",
			description: "Ajude a melhorar DeepSeek modelos e produtos.",
			saved: "Preferência salva",
			failed: "Não foi possível salvar a preferência"
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Services used by the browser companion. */
		const inject = [
			"slots",
			"locale",
			"configForms"
		];
		/**
		* Register the preference while its Host configuration is available.
		* @param ctx - browser plugin context.
		*/
		function apply(ctx) {
			const locale = "settings.sessionLog";
			const namespace = "session-log-deepseek";
			ctx.effect(() => ctx.locale.register(locale, {
				en,
				zh,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}));
			const form = ctx.configForms.get(namespace);
			const preference = new UploadPreference(form);
			const face = () => ({
				hooks: {
					upload: form,
					mutation: preference.state
				},
				setEnabled: (enabled) => preference.setEnabled(enabled),
				dismiss: () => {
					preference.dismiss();
				}
			});
			ctx.effect(() => ctx.configForms.whileServed([namespace], () => ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: namespace,
				order: 90,
				locale,
				inject: face
			}, UploadRow))));
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "session-log-upload-toast",
				locale,
				inject: face
			}, UploadToast));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
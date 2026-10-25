window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-settings-plugins",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_dsh_client_ui_slots = require("@deepseek-ai/dsh-client-ui-slots");
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-settings-plugins/src/client/PluginsSettingsSection.module.css.mjs
		const css = ".csGhFa_section{max-width:760px;color:var(--dsw-alias-label-primary);flex-direction:column;gap:12px;display:flex}.csGhFa_heading{margin:0;font-size:18px;font-weight:600}.csGhFa_intro{color:var(--dsw-alias-label-tertiary);margin:0;font-size:13px}.csGhFa_tabs{border-bottom:.5px solid var(--dsw-alias-border-l2);align-items:flex-end;gap:22px;margin-top:2px;display:flex}.csGhFa_tab{color:var(--dsw-alias-label-tertiary);font:inherit;cursor:pointer;background:0 0;border:0;padding:7px 1px 9px;font-size:13px;line-height:20px;position:relative}.csGhFa_tab[data-active=true]{color:var(--dsw-alias-label-primary)}@media (hover:hover){.csGhFa_tab:hover{color:var(--dsw-alias-label-primary)}}.csGhFa_tab[data-active=true]:after,.csGhFa_tab:focus-visible:after{background:var(--dsw-alias-label-primary);content:\"\";border-radius:2px 2px 0 0;height:2px;position:absolute;bottom:-1px;left:0;right:0}.csGhFa_tab:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px;color:var(--dsw-alias-label-primary);border-radius:2px}.csGhFa_panel{min-width:0;padding-top:2px}.csGhFa_cards{flex-direction:column;gap:10px;margin:0;padding:0;list-style:none;display:flex}.csGhFa_empty{color:var(--dsw-alias-label-tertiary);margin:0;font-size:13px}.csGhFa_configurable{flex-direction:column;gap:10px;display:flex}.csGhFa_presetSettings{flex-direction:column;gap:8px;display:flex}.csGhFa_presetSettingsTitle{margin:0;font-size:15px;font-weight:600;line-height:22px}";
		const tagId = "@deepseek-ai/dsh-client-ui-settings-plugins/PluginsSettingsSection.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-settings-plugins";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var PluginsSettingsSection_module_css_default = {
			"cards": "csGhFa_cards",
			"configurable": "csGhFa_configurable",
			"empty": "csGhFa_empty",
			"heading": "csGhFa_heading",
			"intro": "csGhFa_intro",
			"panel": "csGhFa_panel",
			"presetSettings": "csGhFa_presetSettings",
			"presetSettingsTitle": "csGhFa_presetSettingsTitle",
			"section": "csGhFa_section",
			"tab": "csGhFa_tab",
			"tabs": "csGhFa_tabs"
		};
		//#endregion
		//#region lib/types/client/PluginsSettingsSection.js
		/** Plugins settings section: localized tabs around feature-owned pages. */
		/** Render one Plugins page whose contents arrive from feature-owned tabs; one contribution shows as the page itself. */
		function PluginsSettingsSection({ t, renderSlot, useTabs }) {
			const tabsId = (0, react.useId)();
			const tabRefs = (0, react.useRef)([]);
			const rows = useTabs((value) => value);
			const [activeId, setActiveId] = (0, react.useState)();
			const [visitedIds, setVisitedIds] = (0, react.useState)(() => /* @__PURE__ */ new Set());
			const active = rows.find((row) => row.id === activeId)?.id ?? rows[0]?.id;
			const single = rows.length === 1 ? rows[0] : void 0;
			(0, react.useEffect)(() => {
				if (active === void 0) return;
				setVisitedIds((previous) => {
					if (previous.has(active)) return previous;
					return new Set([...previous, active]);
				});
			}, [active]);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: PluginsSettingsSection_module_css_default.section,
				children: [
					(0, react_jsx_runtime.jsx)("h2", {
						className: PluginsSettingsSection_module_css_default.heading,
						children: t("title")
					}),
					(0, react_jsx_runtime.jsx)("p", {
						className: PluginsSettingsSection_module_css_default.intro,
						children: t("intro")
					}),
					rows.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
						className: PluginsSettingsSection_module_css_default.empty,
						children: t("empty")
					}) : single !== void 0 ? (0, react_jsx_runtime.jsx)("div", {
						className: PluginsSettingsSection_module_css_default.panel,
						children: renderSlot("settings.plugins.tab", {}, { only: single.id })
					}) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("div", {
						className: PluginsSettingsSection_module_css_default.tabs,
						role: "tablist",
						"aria-label": t("tabs"),
						children: rows.map((row, index) => {
							const selected = row.id === active;
							return (0, react_jsx_runtime.jsx)("button", {
								ref: (element) => {
									tabRefs.current[index] = element;
								},
								id: `${tabsId}-tab-${row.id}`,
								type: "button",
								role: "tab",
								className: PluginsSettingsSection_module_css_default.tab,
								"aria-selected": selected,
								"aria-controls": `${tabsId}-panel-${row.id}`,
								"data-active": selected ? "true" : void 0,
								tabIndex: selected ? 0 : -1,
								onClick: () => {
									setActiveId(row.id);
								},
								onKeyDown: (event) => {
									let nextIndex;
									switch (event.key) {
										case "ArrowRight":
											nextIndex = (index + 1) % rows.length;
											break;
										case "ArrowLeft":
											nextIndex = (index - 1 + rows.length) % rows.length;
											break;
										case "Home":
											nextIndex = 0;
											break;
										case "End":
											nextIndex = rows.length - 1;
											break;
										default: return;
									}
									event.preventDefault();
									const nextRow = rows[nextIndex];
									const nextTab = tabRefs.current[nextIndex];
									setActiveId(nextRow.id);
									nextTab.focus();
								},
								children: row.label
							}, row.id);
						})
					}), rows.filter((row) => row.id === active || visitedIds.has(row.id)).map((row) => {
						const selected = row.id === active;
						return (0, react_jsx_runtime.jsx)("div", {
							id: `${tabsId}-panel-${row.id}`,
							className: PluginsSettingsSection_module_css_default.panel,
							role: "tabpanel",
							"aria-labelledby": `${tabsId}-tab-${row.id}`,
							hidden: !selected,
							children: renderSlot("settings.plugins.tab", {}, { only: row.id })
						}, row.id);
					})] })
				]
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** Locale bundles for the built-in plugins settings section. */
		/** English copy. */
		const en = {
			nav: "Built-in plugins",
			title: "Built-in plugins",
			intro: "Inspect the plugins this deployment ships.",
			tabs: "Plugin views",
			empty: "This deployment exposes no plugin views."
		};
		/** Simplified Chinese copy. */
		const zh = {
			nav: "内置插件",
			title: "内置插件",
			intro: "查看内置部署的插件列表",
			tabs: "插件视图",
			empty: "本部署没有开放任何插件视图。"
		};
		/** Japanese copy, checked against the English keys. */
		const ja = {
			"nav": "組み込みプラグイン",
			"title": "組み込みプラグイン",
			"intro": "このデプロイメントに含まれるプラグインを確認します。",
			"tabs": "プラグインビュー",
			"empty": "このデプロイメントにはプラグインビューがありません。"
		};
		/** Spanish dictionary, checked against the English keys. */
		const es = {
			nav: "Complementos integrados",
			title: "Complementos integrados",
			intro: "Inspeccione los complementos que incluye esta implementación.",
			tabs: "Vistas de complementos",
			empty: "Esta implementación no expone vistas de complementos."
		};
		/** French dictionary, checked against the English keys. */
		const fr = {
			nav: "Plugins intégrés",
			title: "Plugins intégrés",
			intro: "Inspectez les plugins fournis par ce déploiement.",
			tabs: "Vues des plugins",
			empty: "Ce déploiement n'expose aucune vue de plugin."
		};
		/** German dictionary, checked against the English keys. */
		const de = {
			nav: "Integrierte Plugins",
			title: "Integrierte Plugins",
			intro: "Überprüfen Sie die Plugins, die mit dieser Bereitstellung geliefert werden.",
			tabs: "Plugin-Ansichten",
			empty: "Diese Bereitstellung stellt keine Plugin-Ansichten bereit."
		};
		/** Russian dictionary, checked against the English keys. */
		const ru = {
			nav: "Встроенные плагины",
			title: "Встроенные плагины",
			intro: "Проверьте плагины, поставляемые в этом развертывании.",
			tabs: "Просмотры плагинов",
			empty: "Это развертывание не предоставляет никаких представлений плагинов."
		};
		/** Portuguese dictionary, checked against the English keys. */
		const pt = {
			nav: "Plug-ins integrados",
			title: "Plug-ins integrados",
			intro: "Inspecione os plug-ins fornecidos por esta implantação.",
			tabs: "Visualizações de plug-in",
			empty: "Esta implantação não expõe visualizações de plug-ins."
		};
		//#endregion
		//#region lib/types/client/index.js
		/**
		* Built-in plugins settings section, browser half: the shell around the
		* feature-owned tabs registered into `settings.plugins.tab` (the read-only
		* inventory ships one). The configuration pages of the host-plane plugins
		* live in their own companion packages, which register into the Plugins
		* page; this section owns the Settings navigation entry and the tab chrome
		* only.
		*/
		/** Dictionary namespace owned by this plugin. */
		const NS = "settings.plugins";
		/** Required services (cordis fiber inject). */
		const inject = ["slots", "locale"];
		/**
		* Mount the built-in plugins section.
		* @param ctx - the browser plugin context.
		*/
		function apply(ctx) {
			const t = ctx.locale.bind(NS);
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}), "ui-settings-plugins: section dictionaries");
			let tabsVersion = -1;
			let tabsRevision = -1;
			let tabs = [];
			const sectionInjected = () => ({ hooks: { tabs: {
				getSnapshot: () => {
					const version = ctx.slots.getVersion("settings.plugins.tab");
					const revision = ctx.locale.getSnapshot().revision;
					if (version !== tabsVersion || revision !== tabsRevision) {
						tabsVersion = version;
						tabsRevision = revision;
						tabs = ctx.slots.entries("settings.plugins.tab").map((entry) => ({
							/* v8 ignore next -- list-slot registration requires id */
							id: entry.options.id ?? "",
							order: entry.options.order ?? 0,
							label: (0, _deepseek_ai_dsh_client_ui_slots.resolveSlotLabel)(entry.options.label) ?? ""
						})).sort((a, b) => a.order - b.order);
					}
					return tabs;
				},
				subscribe: (listener) => {
					const offLedger = ctx.slots.subscribe("settings.plugins.tab", listener);
					const offLocale = ctx.locale.subscribe(listener);
					return () => {
						offLedger();
						offLocale();
					};
				}
			} } });
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "plugins",
				order: 15,
				label: () => t("nav"),
				locale: NS,
				inject: sectionInjected,
				children: { "settings.plugins.tab": {
					kind: "list",
					scope: "root"
				} }
			}, PluginsSettingsSection));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
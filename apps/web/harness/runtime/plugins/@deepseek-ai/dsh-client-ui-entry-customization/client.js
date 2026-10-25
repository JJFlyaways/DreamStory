window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-entry-customization",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		let react_jsx_runtime = require("react/jsx-runtime");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-entry-customization/src/client/EntryMenu.module.css.mjs
		const css = ".XEfQWG_entryName{align-items:center;gap:8px;display:flex}.XEfQWG_entryTitle{overflow-wrap:anywhere;white-space:normal;min-width:0}.XEfQWG_activeMark{flex:none;margin-left:auto}";
		const tagId = "@deepseek-ai/dsh-client-ui-entry-customization/EntryMenu.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-entry-customization";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var EntryMenu_module_css_default = {
			"activeMark": "XEfQWG_activeMark",
			"entryName": "XEfQWG_entryName",
			"entryTitle": "XEfQWG_entryTitle"
		};
		//#endregion
		//#region lib/types/client/EntryMenuContent.js
		/** Folded Conversation Views, plugin discovery while reachable, and creation. */
		/**
		* Render folded Conversation Views followed by discovery and Creator actions, without pin controls.
		* @param props - Owner dismissal callback, injected actions, and localized copy.
		* @returns Menu rows for the region's More menu.
		*/
		function EntryMenuContent({ entries, onOpen, region, onDismiss, usePluginNavigation, browsePlugins, createPlugin, t }) {
			const moreEntries = region === "conversation" ? entries : [];
			const browsable = usePluginNavigation((present) => present);
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				moreEntries.map((entry) => (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MenuItemButton, {
					current: entry.active === true,
					onSelect: () => {
						onDismiss();
						onOpen(entry.id);
					},
					children: (0, react_jsx_runtime.jsxs)("span", {
						className: EntryMenu_module_css_default.entryName,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: EntryMenu_module_css_default.entryTitle,
							children: entry.label
						}), entry.active === true && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, {
							size: 16,
							className: EntryMenu_module_css_default.activeMark
						})]
					})
				}, entry.id)),
				browsable && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MenuItemButton, {
					separatorBefore: moreEntries.length > 0,
					icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPluginPinwheelOutlineRegular, { size: 16 }),
					onSelect: () => {
						onDismiss();
						browsePlugins();
					},
					children: t("install")
				}),
				(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MenuItemButton, {
					icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutlineRegular, { size: 16 }),
					separatorBefore: !browsable && moreEntries.length > 0,
					onSelect: () => {
						onDismiss();
						createPlugin();
					},
					children: t("create")
				})
			] });
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** Copy for the More menu rows: navigation actions, and Creator draft prompts per region. */
		const en = {
			install: "Browse other plugins",
			create: "Create your plugin",
			"createPrompt.sidebar": "Create a DSH plugin with a left sidebar entry.",
			"createPrompt.conversation": "Create a DSH conversation view plugin.",
			"createPrompt.rightbar": "Create a DSH plugin with a right sidebar entry."
		};
		/** Chinese counterpart of the entry-customization dictionary. */
		const zh = {
			install: "浏览更多插件",
			create: "创建你的插件",
			"createPrompt.sidebar": "创建一个带左侧栏入口的 DSH 插件。",
			"createPrompt.conversation": "创建一个 DSH 会话视图插件。",
			"createPrompt.rightbar": "创建一个带右侧栏入口的 DSH 插件。"
		};
		/** Japanese copy, checked against the English keys. */
		const ja = {
			"install": "他のプラグインを探す",
			"create": "プラグインを作成",
			"createPrompt.sidebar": "左サイドバーにエントリを持つ DSH プラグインを作成します。",
			"createPrompt.conversation": "DSH 会話ビュープラグインを作成します。",
			"createPrompt.rightbar": "右サイドバーにエントリを持つ DSH プラグインを作成します。"
		};
		/** Spanish dictionary, checked against the English keys. */
		const es = {
			install: "Explorar otros complementos",
			create: "Crea tu complemento",
			"createPrompt.sidebar": "Cree un complemento DSH con una entrada en la barra lateral izquierda.",
			"createPrompt.conversation": "Cree un complemento de vista de conversación DSH.",
			"createPrompt.rightbar": "Cree un complemento DSH con una entrada en la barra lateral derecha."
		};
		/** French dictionary, checked against the English keys. */
		const fr = {
			install: "Parcourir d'autres plugins",
			create: "Créez votre plugin",
			"createPrompt.sidebar": "Créez un plugin DSH avec une entrée dans la barre latérale gauche.",
			"createPrompt.conversation": "Créez un plugin d'affichage de conversation DSH.",
			"createPrompt.rightbar": "Créez un plugin DSH avec une entrée dans la barre latérale droite."
		};
		/** German dictionary, checked against the English keys. */
		const de = {
			install: "Durchsuchen Sie andere Plugins",
			create: "Erstellen Sie Ihr Plugin",
			"createPrompt.sidebar": "Erstellen Sie ein DSH-Plugin mit einem Eintrag in der linken Seitenleiste.",
			"createPrompt.conversation": "Erstellen Sie ein DSH-Plugin für die Konversationsansicht.",
			"createPrompt.rightbar": "Erstellen Sie ein DSH-Plugin mit einem Eintrag in der rechten Seitenleiste."
		};
		/** Russian dictionary, checked against the English keys. */
		const ru = {
			install: "Просмотрите другие плагины",
			create: "Создайте свой плагин",
			"createPrompt.sidebar": "Создайте плагин DSH с записью на левой боковой панели.",
			"createPrompt.conversation": "Создайте плагин просмотра диалога DSH.",
			"createPrompt.rightbar": "Создайте плагин DSH с записью на правой боковой панели."
		};
		/** Portuguese dictionary, checked against the English keys. */
		const pt = {
			install: "Procure outros plug-ins",
			create: "Crie seu plug-in",
			"createPrompt.sidebar": "Crie um plug-in DSH com uma entrada na barra lateral esquerda.",
			"createPrompt.conversation": "Crie um plug-in de visualização de conversa DSH.",
			"createPrompt.rightbar": "Crie um plug-in DSH com uma entrada na barra lateral direita."
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Services used by the menu rows' footer actions; the optional `pluginNavigation` shows the discovery row while present. */
		const inject = [
			"slots",
			"locale",
			"uiWorkspace"
		];
		/**
		* Register the same menu rows into each region's More menu.
		* @param ctx - Browser context with slot, locale, and Workspace services, and the optional plugin navigation.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register("entryCustomization", {
				en,
				zh,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}));
			const t = ctx.locale.bind("entryCustomization");
			const pluginNavigation = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(false);
			ctx.inject(["pluginNavigation"], (scope) => {
				scope.effect(() => {
					pluginNavigation.set(true);
					return () => {
						pluginNavigation.set(false);
					};
				}, "entry-customization: plugin navigation presence");
			});
			const injected = (region) => ({
				region,
				hooks: { pluginNavigation },
				browsePlugins: () => {
					ctx.get("productAnalytics")?.track("more_menu_item_click", {
						region,
						action: "browse_plugins"
					});
					ctx.get("pluginNavigation")?.openList();
				},
				createPlugin: () => {
					ctx.get("productAnalytics")?.track("more_menu_item_click", {
						region,
						action: "create_plugin"
					});
					ctx.uiWorkspace.startSession(void 0, {
						agentPreset: "cordis",
						prompt: t(`createPrompt.${region}`),
						whenDraftExists: "append"
					});
				}
			});
			ctx.slots.inject("sidebar.panellist.actions", () => ctx.slots.register({
				name: "sidebar.panellist.actions",
				id: "entry-customization",
				locale: "entryCustomization",
				inject: () => injected("sidebar")
			}, EntryMenuContent));
			ctx.slots.inject("conversation.session.header.views.actions", () => ctx.slots.register({
				name: "conversation.session.header.views.actions",
				id: "entry-customization",
				locale: "entryCustomization",
				inject: () => injected("conversation")
			}, EntryMenuContent));
			ctx.slots.inject("sidebar.right.tab.guide.actions", () => ctx.slots.register({
				name: "sidebar.right.tab.guide.actions",
				id: "entry-customization",
				locale: "entryCustomization",
				inject: () => injected("rightbar")
			}, EntryMenuContent));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
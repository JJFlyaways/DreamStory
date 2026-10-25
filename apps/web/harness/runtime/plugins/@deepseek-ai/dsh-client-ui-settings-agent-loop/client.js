window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-settings-agent-loop",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region lib/types/client/locales.js
		/** Locale bundles for the agent loop's settings page. */
		/** English copy. */
		const en = {
			title: "Agent loop",
			description: "Control how the Agent dispatches tool calls.",
			maxParallel: "Parallel tool calls",
			maxParallelHint: "Upper bound on parallel-safe calls running at once within one step.",
			overridden: "Overridden",
			reset: "Reset to default",
			readOnly: "This deployment stores settings read-only.",
			unavailable: "This plugin is not loaded, so it cannot be configured right now.",
			save: "Save",
			saving: "Saving…",
			saveFailed: "The deployment did not accept these values; they were left for you to correct.",
			invalidNumber: "Enter a number, or leave blank to use the default."
		};
		/** Simplified Chinese copy. */
		const zh = {
			title: "Agent 循环",
			description: "控制 Agent 派发工具调用的方式。",
			maxParallel: "并行工具调用数",
			maxParallelHint: "同一步内最多同时运行多少个可并行的调用。",
			overridden: "已覆盖",
			reset: "恢复默认",
			readOnly: "本部署的设置为只读。",
			unavailable: "该插件当前未加载，暂时无法配置。",
			save: "保存",
			saving: "保存中…",
			saveFailed: "本部署没有接受这些值，已保留供你修改。",
			invalidNumber: "请填数字；留空表示使用默认值。"
		};
		/**
		* The form frame's copy, read from this page's dictionary.
		* @param t - the page's locale reader.
		* @returns the labels the shared settings form renders.
		*/
		function formLabels(t) {
			return {
				unavailable: t("unavailable"),
				readOnly: t("readOnly"),
				saveFailed: t("saveFailed"),
				save: t("save"),
				saving: t("saving")
			};
		}
		/** Japanese copy, checked against the English keys. */
		const ja = {
			"title": "エージェントループ",
			"description": "エージェントのツール呼び出しのディスパッチ方法を制御します。",
			"maxParallel": "並列ツール呼び出し",
			"maxParallelHint": "1ステップ内で同時に実行される並列安全呼び出しの上限。",
			"overridden": "上書き済み",
			"reset": "デフォルトにリセット",
			"readOnly": "このデプロイメントでは設定は読み取り専用で保存されます。",
			"unavailable": "このプラグインは読み込まれていないため、現在設定できません。",
			"save": "保存",
			"saving": "保存中…",
			"saveFailed": "デプロイがこれらの値を受け付けませんでした。修正のために残されています。",
			"invalidNumber": "数値を入力するか、空欄のままにするとデフォルトが使用されます。"
		};
		/** Spanish dictionary, checked against the English keys. */
		const es = {
			title: "Bucle de agente",
			description: "Controle cómo el Agente distribuye las llamadas a la herramienta.",
			maxParallel: "Llamadas a herramientas paralelas",
			maxParallelHint: "Límite superior de llamadas seguras en paralelo que se ejecutan al mismo tiempo en un solo paso.",
			overridden: "Anulado",
			reset: "Restablecer los valores predeterminados",
			readOnly: "Esta implementación almacena configuraciones de solo lectura.",
			unavailable: "Este complemento no está cargado, por lo que no se puede configurar en este momento.",
			save: "Guardar",
			saving: "Guardando…",
			saveFailed: "El despliegue no aceptó estos valores; quedaron para que usted los corrigiera.",
			invalidNumber: "Ingrese un número o déjelo en blanco para usar el valor predeterminado."
		};
		/** French dictionary, checked against the English keys. */
		const fr = {
			title: "Boucle d'agent",
			description: "Contrôlez la manière dont l'agent distribue les appels d'outil.",
			maxParallel: "Appels d'outils parallèles",
			maxParallelHint: "Limite supérieure des appels parallèles sécurisés exécutés simultanément en une seule étape.",
			overridden: "Remplacé",
			reset: "Réinitialiser aux valeurs par défaut",
			readOnly: "Ce déploiement stocke les paramètres en lecture seule.",
			unavailable: "Ce plugin n'est pas chargé, il ne peut donc pas être configuré pour le moment.",
			save: "Enregistrer",
			saving: "Sauvegarde…",
			saveFailed: "Le déploiement n'a pas accepté ces valeurs ; ils vous ont été laissés à corriger.",
			invalidNumber: "Entrez un numéro ou laissez ce champ vide pour utiliser la valeur par défaut."
		};
		/** German dictionary, checked against the English keys. */
		const de = {
			title: "Agentenschleife",
			description: "Steuern Sie, wie der Agent Toolaufrufe verteilt.",
			maxParallel: "Parallele Werkzeugaufrufe",
			maxParallelHint: "Obergrenze für parallelsichere Aufrufe, die gleichzeitig innerhalb eines Schritts ausgeführt werden.",
			overridden: "Überschrieben",
			reset: "Auf Standard zurücksetzen",
			readOnly: "Diese Bereitstellung speichert Einstellungen schreibgeschützt.",
			unavailable: "Dieses Plugin ist nicht geladen und kann daher derzeit nicht konfiguriert werden.",
			save: "Speichern",
			saving: "Speichern…",
			saveFailed: "Die Bereitstellung hat diese Werte nicht akzeptiert. Sie mussten sie korrigieren.",
			invalidNumber: "Geben Sie eine Zahl ein oder lassen Sie das Feld leer, um den Standardwert zu verwenden."
		};
		/** Russian dictionary, checked against the English keys. */
		const ru = {
			title: "Цикл агента",
			description: "Управляйте тем, как агент распределяет вызовы инструментов.",
			maxParallel: "Параллельные вызовы инструментов",
			maxParallelHint: "Верхняя граница параллельных безопасных вызовов, выполняемых одновременно в течение одного шага.",
			overridden: "Переопределено",
			reset: "Сбросить настройки по умолчанию",
			readOnly: "В этом развертывании параметры сохраняются только для чтения.",
			unavailable: "Этот плагин не загружен, поэтому его невозможно настроить прямо сейчас.",
			save: "Сохранить",
			saving: "Сохранение…",
			saveFailed: "Развертывание не приняло эти значения; их оставили вам на исправление.",
			invalidNumber: "Введите число или оставьте поле пустым, чтобы использовать значение по умолчанию."
		};
		/** Portuguese dictionary, checked against the English keys. */
		const pt = {
			title: "Loop de agente",
			description: "Controle como o Agente despacha chamadas de ferramenta.",
			maxParallel: "Chamadas de ferramentas paralelas",
			maxParallelHint: "Limite superior em chamadas paralelas seguras executadas ao mesmo tempo em uma etapa.",
			overridden: "Substituído",
			reset: "Redefinir para o padrão",
			readOnly: "Esta implantação armazena configurações somente leitura.",
			unavailable: "Este plugin não está carregado, portanto não pode ser configurado agora.",
			save: "Salvar",
			saving: "Salvando…",
			saveFailed: "A implantação não aceitou esses valores; eles foram deixados para você corrigir.",
			invalidNumber: "Insira um número ou deixe em branco para usar o padrão."
		};
		//#endregion
		//#region lib/types/client/AgentLoopCard.js
		/**
		* Render the agent loop's one-liner or its settings form, as the Plugins page asks.
		* @param props - the view asked for, locale copy, the form snapshot, and its actions.
		* @returns the one-liner, or the form.
		*/
		function AgentLoopCard(props) {
			const { t } = props;
			const state = props.useAgentLoopCard((snapshot) => snapshot);
			if (props.view === "summary") return t("description");
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SettingsForm, {
				labels: formLabels(t),
				state,
				onSave: props.save,
				onDiscard: props.discard,
				children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SettingsValueField, {
					id: "plugin-config-agent-loop-parallel",
					label: t("maxParallel"),
					hint: t("maxParallelHint"),
					overriddenLabel: t("overridden"),
					resetLabel: t("reset"),
					invalidLabel: t("invalidNumber"),
					numeric: true,
					disabled: !state.writable,
					...state.maxParallelToolCalls,
					onEdit: (text) => {
						props.edit("maxParallelToolCalls", text);
					},
					onReset: () => {
						props.resetField("maxParallelToolCalls");
					}
				})
			});
		}
		//#endregion
		//#region lib/types/client/agent-loop-card-controller.js
		/** The agent-loop page's staged form over the `agent-loop` settings namespace. */
		/**
		* Namespace of the agent loop's user-owned settings. Spelled here rather than
		* imported: a client package must not depend on a Host package.
		*/
		const AGENT_LOOP_NS = "agent-loop";
		/** Bridges the `agent-loop` scope onto the page's staged form. */
		var AgentLoopCardController = class {
			form;
			store;
			/** @param scope - the bound settings scope for the `agent-loop` namespace. */
			constructor(scope) {
				this.form = new _deepseek_ai_dsh_client_ui_primitives.SettingsFormModel(scope, [(0, _deepseek_ai_dsh_client_ui_primitives.settingsNumberField)("maxParallelToolCalls")]);
				this.store = this.form.bind(() => this.projection());
			}
			projection() {
				return {
					...this.form.shell(),
					maxParallelToolCalls: this.form.field("maxParallelToolCalls")
				};
			}
			/**
			* Build the face the page's slot registration injects.
			* @returns the page's snapshot and its form actions.
			*/
			inject() {
				return {
					hooks: { agentLoopCard: this.store },
					...this.form.actions()
				};
			}
			/** Release accepted-value subscriptions. */
			dispose() {
				this.form.dispose();
			}
		};
		//#endregion
		//#region lib/types/client/index.js
		/**
		* The agent loop's settings page, browser half: the parallel tool-call cap
		* over the `agent-loop` namespace the loop registers. The page registers into
		* the Plugins page's `plugins.item` slot while the Host serves that namespace,
		* so a deployment that exposes no agent-loop settings shows no trace of it.
		*/
		/** Dictionary namespace owned by this plugin. */
		const NS = "settings.agentLoop";
		/** Required services (cordis fiber inject). */
		const inject = [
			"slots",
			"locale",
			"configForms"
		];
		/**
		* Mount the agent loop's settings page while the Host serves its namespace.
		* @param ctx - the browser plugin context.
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
			}), "ui-settings-agent-loop: dictionaries");
			const t = ctx.locale.bind(NS);
			const card = new AgentLoopCardController(ctx.configForms.get(AGENT_LOOP_NS));
			ctx.effect(() => () => {
				card.dispose();
			}, "ui-settings-agent-loop: form subscription");
			ctx.effect(() => ctx.configForms.whileServed([AGENT_LOOP_NS], () => ctx.slots.inject("plugins.item", () => ctx.slots.register({
				name: "plugins.item",
				id: "agent-loop",
				order: 30,
				label: () => t("title"),
				locale: NS,
				inject: () => card.inject()
			}, AgentLoopCard))), "ui-settings-agent-loop: page");
		}
		//#endregion
		exports.NS = NS;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
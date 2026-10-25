window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-settings-web-search",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		//#region lib/types/client/locales.js
		/** Locale bundles for the web-search provider's settings page. */
		/** English copy. */
		const en = {
			title: "Web search",
			description: "Set up the DeepSeek search provider.",
			useSearchApi: "Use the new Web Search API",
			useSearchApiHint: "Off by default: search runs through DeepSeek Messages. For the new Web Search API's features and pricing, see the ",
			searchGuide: "Search & Fetch guide",
			searchGuideUrl: "https://api-docs.deepseek.com/guides/search",
			apiKey: "API key",
			apiKeyHint: "Stored outside the settings file. Leave blank to keep the current key.",
			apiKeySet: "A key is configured.",
			apiKeyUnset: "No key is configured; only conversations using a DeepSeek Account model can search, through the default endpoint.",
			baseUrl: "Messages API base URL",
			baseUrlHint: "Include the API prefix, such as https://api.deepseek.com/anthropic/v1. The provider appends /messages. Leave blank to restore the default.",
			searchApiBaseUrl: "Search / Fetch API base URL",
			searchApiBaseUrlHint: "Include the API prefix, such as https://api.deepseek.com/v1/tools. The provider appends /search or /fetch. Leave blank to restore the default.",
			maxUses: "Max searches per request",
			maxUsesHint: "How many searches the auxiliary model may run within one Messages request. Applies only to the Messages API.",
			count: "Results per search",
			countHint: "Results returned per query: an integer from 1 to 50, default 10. This controls result count, not search calls. web_search keeps no more sources than its own result limit.",
			overridden: "Overridden",
			reset: "Reset to default",
			readOnly: "This deployment stores settings read-only.",
			unavailable: "This plugin is not loaded, so it cannot be configured right now.",
			save: "Save",
			saving: "Saving…",
			saveFailed: "The deployment did not accept these values; they were left for you to correct.",
			invalidNumber: "Enter a number, or leave blank to use the default.",
			invalidCount: "Enter an integer from 1 to 50, or leave blank to use the default."
		};
		/** Simplified Chinese copy. */
		const zh = {
			title: "网页搜索",
			description: "设置 DeepSeek 的搜索提供方。",
			useSearchApi: "启用新版 Web 搜索 API",
			useSearchApiHint: "默认关闭，搜索通过 DeepSeek Messages 完成。新版 Web 搜索 API 功能与计费详见",
			searchGuide: "网页搜索与抓取指南",
			searchGuideUrl: "https://api-docs.deepseek.com/zh-cn/guides/search",
			apiKey: "API Key",
			apiKeyHint: "不写入设置文件。留空表示保持当前密钥。",
			apiKeySet: "已配置密钥。",
			apiKeyUnset: "未配置密钥；仅使用 DeepSeek 账号模型的对话可以通过默认接口地址搜索。",
			baseUrl: "Messages API 基础地址",
			baseUrlHint: "填写含 API 前缀的地址，例如 https://api.deepseek.com/anthropic/v1；程序追加 /messages，留空恢复默认。",
			searchApiBaseUrl: "Search / Fetch API 基础地址",
			searchApiBaseUrlHint: "填写含 API 前缀的地址，例如 https://api.deepseek.com/v1/tools；程序追加 /search 或 /fetch，留空恢复默认。",
			maxUses: "单次请求最多搜索次数",
			maxUsesHint: "辅助模型在一次 Messages 请求内最多可执行的搜索次数，仅适用于 Messages API。",
			count: "每次搜索结果数",
			countHint: "每个查询返回的结果条数，须为 1–50 的整数，默认 10；不控制搜索调用次数。web_search 保留的来源数不超过其自身的结果上限。",
			overridden: "已覆盖",
			reset: "恢复默认",
			readOnly: "本部署的设置为只读。",
			unavailable: "该插件当前未加载，暂时无法配置。",
			save: "保存",
			saving: "保存中…",
			saveFailed: "本部署没有接受这些值，已保留供你修改。",
			invalidNumber: "请填数字；留空表示使用默认值。",
			invalidCount: "请填 1–50 的整数；留空表示使用默认值。"
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
			"title": "Web 検索",
			"description": "DeepSeek 検索プロバイダーを設定します。",
			"useSearchApi": "新しい Web Search API を使用する",
			"useSearchApiHint": "デフォルトではオフです。検索は DeepSeek Messages 経由で実行されます。新しい Web Search API の機能と料金については、",
			"searchGuide": "検索と取得のガイド",
			"searchGuideUrl": "https://api-docs.deepseek.com/guides/search",
			"apiKey": "API キー",
			"apiKeyHint": "設定ファイルの外に保存されます。現在のキーを維持するには空欄のままにしてください。",
			"apiKeySet": "キーが設定されています。",
			"apiKeyUnset": "キーが設定されていません。DeepSeek Account のモデルを使用する会話のみ、デフォルトのエンドポイント経由で検索できます。",
			"baseUrl": "Messages API ベース URL",
			"baseUrlHint": "https://api.deepseek.com/anthropic/v1 など、API プレフィックスを含めてください。プロバイダーは /messages を追加します。デフォルトに戻すには空欄にしてください。",
			"searchApiBaseUrl": "Search / Fetch API ベース URL",
			"searchApiBaseUrlHint": "https://api.deepseek.com/v1/tools など、API プレフィックスを含めてください。プロバイダーは /search または /fetch を追加します。デフォルトに戻すには空欄にしてください。",
			"maxUses": "リクエストあたりの最大検索回数",
			"maxUsesHint": "1 回の Messages リクエスト内で補助モデルが実行できる検索回数です。Messages API にのみ適用されます。",
			"count": "検索あたりの結果数",
			"countHint": "クエリごとに返される結果数: 1〜50 の整数、デフォルトは 10 です。これは結果数であり、検索呼び出し数ではありません。web_search は自身の結果上限を超えるソースを保持しません。",
			"overridden": "上書き済み",
			"reset": "デフォルトに戻す",
			"readOnly": "このデプロイでは設定は読み取り専用で保存されます。",
			"unavailable": "このプラグインは読み込まれていないため、現在設定できません。",
			"save": "保存",
			"saving": "保存中…",
			"saveFailed": "デプロイがこれらの値を受け入れませんでした。修正用に残されています。",
			"invalidNumber": "数値を入力するか、デフォルトを使用するには空欄にしてください。",
			"invalidCount": "1〜50 の整数を入力するか、デフォルトを使用するには空欄にしてください。"
		};
		/** Spanish dictionary, checked against the English keys. */
		const es = {
			title: "búsqueda web",
			description: "Configure el proveedor de búsqueda DeepSeek.",
			useSearchApi: "Utilice la nueva búsqueda web API",
			useSearchApiHint: "Desactivado de forma predeterminada: la búsqueda se ejecuta a través de Mensajes DeepSeek. Para conocer las características y los precios del nuevo Web Search API, consulte el ",
			searchGuide: "Guía de búsqueda y recuperación",
			searchGuideUrl: "https://api-docs.deepseek.com/guides/search",
			apiKey: "Clave de API",
			apiKeyHint: "Almacenado fuera del archivo de configuración. Déjelo en blanco para conservar la clave actual.",
			apiKeySet: "Se configura una clave.",
			apiKeyUnset: "No hay ninguna clave configurada; solo se pueden buscar conversaciones que utilicen un modelo de cuenta DeepSeek, a través del punto final predeterminado.",
			baseUrl: "Mensajes API URL base",
			baseUrlHint: "Incluya el prefijo API, como https://api.deepseek.com/anthropic/v1.. El proveedor agrega /messages. Déjelo en blanco para restaurar el valor predeterminado.",
			searchApiBaseUrl: "Buscar/obtener URL base API",
			searchApiBaseUrlHint: "Incluya el prefijo API, como https://api.deepseek.com/v1/tools.. El proveedor agrega /search o /fetch. Déjelo en blanco para restaurar el valor predeterminado.",
			maxUses: "Búsquedas máximas por solicitud",
			maxUsesHint: "Cuántas búsquedas puede ejecutar el modelo auxiliar dentro de una solicitud de Mensajes. Aplica sólo para Mensajes API.",
			count: "Resultados por búsqueda",
			countHint: "Resultados devueltos por consulta: un número entero del 1 al 50, valor predeterminado 10. Esto controla el recuento de resultados, no las llamadas de búsqueda. web_search no guarda más fuentes que su propio límite de resultados.",
			overridden: "Anulado",
			reset: "Restablecer los valores predeterminados",
			readOnly: "Esta implementación almacena configuraciones de solo lectura.",
			unavailable: "Este complemento no está cargado, por lo que no se puede configurar en este momento.",
			save: "Guardar",
			saving: "Guardando…",
			saveFailed: "El despliegue no aceptó estos valores; quedaron para que usted los corrigiera.",
			invalidNumber: "Ingrese un número o déjelo en blanco para usar el valor predeterminado.",
			invalidCount: "Ingrese un número entero del 1 al 50 o déjelo en blanco para usar el valor predeterminado."
		};
		/** French dictionary, checked against the English keys. */
		const fr = {
			title: "Recherche sur le Web",
			description: "Configurez le moteur de recherche DeepSeek.",
			useSearchApi: "Utilisez la nouvelle recherche Web API",
			useSearchApiHint: "Désactivé par défaut\xA0: la recherche s'effectue dans les messages DeepSeek. Pour connaître les fonctionnalités et les tarifs du nouveau Web Search API, consultez le ",
			searchGuide: "Guide de recherche et de récupération",
			searchGuideUrl: "https://api-docs.deepseek.com/guides/search",
			apiKey: "Clé API",
			apiKeyHint: "Stocké en dehors du fichier de paramètres. Laissez vide pour conserver la clé actuelle.",
			apiKeySet: "Une clé est configurée.",
			apiKeyUnset: "Aucune clé n'est configurée\xA0; seules les conversations utilisant un modèle de compte DeepSeek peuvent effectuer une recherche, via le point de terminaison par défaut.",
			baseUrl: "URL de base des messages API",
			baseUrlHint: "Incluez le préfixe API, tel que https://api.deepseek.com/anthropic/v1.. Le fournisseur ajoute /messages. Laissez vide pour restaurer la valeur par défaut.",
			searchApiBaseUrl: "Rechercher/récupérer l'URL de base de API",
			searchApiBaseUrlHint: "Incluez le préfixe API, tel que https://api.deepseek.com/v1/tools.. Le fournisseur ajoute /search ou /fetch. Laissez vide pour restaurer la valeur par défaut.",
			maxUses: "Nombre maximum de recherches par requête",
			maxUsesHint: "Combien de recherches le modèle auxiliaire peut exécuter dans une requête de messages. S'applique uniquement aux messages API.",
			count: "Résultats par recherche",
			countHint: "Résultats renvoyés par requête\xA0: un nombre entier de 1 à 50, 10 par défaut. Cela contrôle le nombre de résultats, pas les appels de recherche. web_search ne conserve pas plus de sources que sa propre limite de résultats.",
			overridden: "Remplacé",
			reset: "Réinitialiser aux valeurs par défaut",
			readOnly: "Ce déploiement stocke les paramètres en lecture seule.",
			unavailable: "Ce plugin n'est pas chargé, il ne peut donc pas être configuré pour le moment.",
			save: "Enregistrer",
			saving: "Sauvegarde…",
			saveFailed: "Le déploiement n'a pas accepté ces valeurs ; ils vous ont été laissés à corriger.",
			invalidNumber: "Entrez un numéro ou laissez ce champ vide pour utiliser la valeur par défaut.",
			invalidCount: "Entrez un nombre entier compris entre 1 et 50 ou laissez vide pour utiliser la valeur par défaut."
		};
		/** German dictionary, checked against the English keys. */
		const de = {
			title: "Websuche",
			description: "Richten Sie den Suchanbieter DeepSeek ein.",
			useSearchApi: "Nutzen Sie die neue Websuche API",
			useSearchApiHint: "Standardmäßig deaktiviert: Die Suche erfolgt über DeepSeek-Nachrichten. Informationen zu den Funktionen und Preisen der neuen Websuche API finden Sie im ",
			searchGuide: "Leitfaden zum Suchen und Abrufen",
			searchGuideUrl: "https://api-docs.deepseek.com/guides/search",
			apiKey: "API-Schlüssel",
			apiKeyHint: "Außerhalb der Einstellungsdatei gespeichert. Lassen Sie das Feld leer, um den aktuellen Schlüssel beizubehalten.",
			apiKeySet: "Ein Schlüssel ist konfiguriert.",
			apiKeyUnset: "Es ist kein Schlüssel konfiguriert; Nur Konversationen, die ein DeepSeek-Kontomodell verwenden, können über den Standardendpunkt suchen.",
			baseUrl: "Nachrichten API Basis-URL",
			baseUrlHint: "Fügen Sie das Präfix API ein, z. B. https://api.deepseek.com/anthropic/v1.. Der Anbieter hängt /messages an. Lassen Sie das Feld leer, um die Standardeinstellung wiederherzustellen.",
			searchApiBaseUrl: "Suchen/Abrufen der API-Basis-URL",
			searchApiBaseUrlHint: "Fügen Sie das Präfix API ein, z. B. https://api.deepseek.com/v1/tools.. Der Anbieter hängt /search oder /fetch an. Lassen Sie das Feld leer, um die Standardeinstellung wiederherzustellen.",
			maxUses: "Maximale Anzahl an Suchanfragen pro Anfrage",
			maxUsesHint: "Wie viele Suchvorgänge das Hilfsmodell innerhalb einer Nachrichtenanforderung ausführen darf. Gilt nur für die Nachrichten API.",
			count: "Ergebnisse pro Suche",
			countHint: "Pro Abfrage zurückgegebene Ergebnisse: eine Ganzzahl von 1 bis 50, Standard 10. Dies steuert die Ergebnisanzahl, nicht Suchaufrufe. web_search behält nicht mehr Quellen als sein eigenes Ergebnislimit.",
			overridden: "Überschrieben",
			reset: "Auf Standard zurücksetzen",
			readOnly: "Diese Bereitstellung speichert Einstellungen schreibgeschützt.",
			unavailable: "Dieses Plugin ist nicht geladen und kann daher derzeit nicht konfiguriert werden.",
			save: "Speichern",
			saving: "Speichern…",
			saveFailed: "Die Bereitstellung hat diese Werte nicht akzeptiert. Sie mussten sie korrigieren.",
			invalidNumber: "Geben Sie eine Zahl ein oder lassen Sie das Feld leer, um den Standardwert zu verwenden.",
			invalidCount: "Geben Sie eine Ganzzahl zwischen 1 und 50 ein oder lassen Sie das Feld leer, um den Standardwert zu verwenden."
		};
		/** Russian dictionary, checked against the English keys. */
		const ru = {
			title: "Веб-поиск",
			description: "Настройте поисковую систему DeepSeek.",
			useSearchApi: "Используйте новый веб-поиск API",
			useSearchApiHint: "По умолчанию отключено: поиск осуществляется по сообщениям DeepSeek. Информацию о новых функциях и ценах веб-поиска API см. ",
			searchGuide: "Руководство по поиску и получению",
			searchGuideUrl: "https://api-docs.deepseek.com/guides/search",
			apiKey: "Ключ API",
			apiKeyHint: "Хранится вне файла настроек. Оставьте пустым, чтобы сохранить текущий ключ.",
			apiKeySet: "Ключ настроен.",
			apiKeyUnset: "Ключ не настроен; только разговоры, использующие модель учетной записи DeepSeek, могут выполнять поиск через конечную точку по умолчанию.",
			baseUrl: "Базовый URL-адрес сообщений API",
			baseUrlHint: "Включите префикс API, например https://api.deepseek.com/anthropic/v1.. Поставщик добавляет /messages. Оставьте пустым, чтобы восстановить значение по умолчанию.",
			searchApiBaseUrl: "Найдите/получите базовый URL-адрес API",
			searchApiBaseUrlHint: "Включите префикс API, например https://api.deepseek.com/v1/tools.. Поставщик добавляет /search или /fetch. Оставьте пустым, чтобы восстановить значение по умолчанию.",
			maxUses: "Максимальное количество запросов на запрос",
			maxUsesHint: "Сколько поисков вспомогательная модель может выполнить в рамках одного запроса сообщений. Применяется только к сообщениям API.",
			count: "Результаты по поиску",
			countHint: "Результаты, возвращаемые по запросу: целое число от 1 до 50, по умолчанию 10. Это контролирует количество результатов, а не поисковые вызовы. web_search хранит не больше источников, чем его собственный лимит результатов.",
			overridden: "Переопределено",
			reset: "Сбросить настройки по умолчанию",
			readOnly: "В этом развертывании параметры сохраняются только для чтения.",
			unavailable: "Этот плагин не загружен, поэтому его невозможно настроить прямо сейчас.",
			save: "Сохранить",
			saving: "Сохранение…",
			saveFailed: "Развертывание не приняло эти значения; их оставили вам на исправление.",
			invalidNumber: "Введите число или оставьте поле пустым, чтобы использовать значение по умолчанию.",
			invalidCount: "Введите целое число от 1 до 50 или оставьте поле пустым, чтобы использовать значение по умолчанию."
		};
		/** Portuguese dictionary, checked against the English keys. */
		const pt = {
			title: "Pesquisa na web",
			description: "Configure o provedor de pesquisa DeepSeek.",
			useSearchApi: "Use a nova Pesquisa na Web API",
			useSearchApiHint: "Desativado por padrão: a pesquisa é executada em DeepSeek Mensagens. Para conhecer os recursos e preços da nova Pesquisa na Web API, consulte o ",
			searchGuide: "Guia de pesquisa e busca",
			searchGuideUrl: "https://api-docs.deepseek.com/guides/search",
			apiKey: "API chave",
			apiKeyHint: "Armazenado fora do arquivo de configurações. Deixe em branco para manter a chave atual.",
			apiKeySet: "Uma chave está configurada.",
			apiKeyUnset: "Nenhuma chave está configurada; somente conversas que usam um modelo de conta DeepSeek podem pesquisar, por meio do endpoint padrão.",
			baseUrl: "URL base de mensagens API",
			baseUrlHint: "Inclua o prefixo API, como https://api.deepseek.com/anthropic/v1. O provedor anexa /messages. Deixe em branco para restaurar o padrão.",
			searchApiBaseUrl: "Pesquisar/buscar API URL base",
			searchApiBaseUrlHint: "Inclua o prefixo API, como https://api.deepseek.com/v1/tools. O provedor anexa /search ou /fetch. Deixe em branco para restaurar o padrão.",
			maxUses: "Máximo de pesquisas por solicitação",
			maxUsesHint: "Quantas pesquisas o modelo auxiliar pode executar em uma solicitação de Mensagens. Aplica-se somente às Mensagens API.",
			count: "Resultados por pesquisa",
			countHint: "Resultados retornados por consulta: um número inteiro de 1 a 50, padrão 10. Isso controla a contagem de resultados, não as chamadas de pesquisa. web_search não mantém mais fontes do que seu próprio limite de resultados.",
			overridden: "Substituído",
			reset: "Redefinir para o padrão",
			readOnly: "Esta implantação armazena configurações somente leitura.",
			unavailable: "Este plugin não está carregado, portanto não pode ser configurado agora.",
			save: "Salvar",
			saving: "Salvando…",
			saveFailed: "A implantação não aceitou esses valores; eles foram deixados para você corrigir.",
			invalidNumber: "Insira um número ou deixe em branco para usar o padrão.",
			invalidCount: "Insira um número inteiro de 1 a 50 ou deixe em branco para usar o padrão."
		};
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-settings-web-search/src/client/WebSearchCard.module.css.mjs
		const css = ".jTpq5q_feature{gap:6px;display:grid}.jTpq5q_toggleRow{color:var(--dsw-alias-label-primary);justify-content:space-between;align-items:flex-start;gap:16px;font-size:13px;line-height:1.5;display:flex}.jTpq5q_hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:1.5}.jTpq5q_link{color:var(--dsw-alias-link);text-decoration:none}@media (hover:hover){.jTpq5q_link:hover{text-decoration:underline}}";
		const tagId = "@deepseek-ai/dsh-client-ui-settings-web-search/WebSearchCard.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-settings-web-search";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var WebSearchCard_module_css_default = {
			"feature": "jTpq5q_feature",
			"hint": "jTpq5q_hint",
			"link": "jTpq5q_link",
			"toggleRow": "jTpq5q_toggleRow"
		};
		//#endregion
		//#region lib/types/client/WebSearchCard.js
		/**
		* Render the web-search provider's one-liner or its settings form, as the Plugins page asks.
		* @param props - the view asked for, locale copy, the form snapshot, and its actions.
		* @returns the one-liner, or the form.
		*/
		function WebSearchCard(props) {
			const { t } = props;
			const state = props.useWebSearchCard((snapshot) => snapshot);
			if (props.view === "summary") return t("description");
			const disabled = !state.writable || state.saving;
			const searchApi = state.useSearchApi;
			const limitField = searchApi ? "count" : "maxUses";
			return (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.SettingsForm, {
				labels: formLabels(t),
				state,
				onSave: props.save,
				onDiscard: props.discard,
				children: [
					state.apiSwitchAvailable && (0, react_jsx_runtime.jsxs)("div", {
						className: WebSearchCard_module_css_default.feature,
						children: [(0, react_jsx_runtime.jsxs)("label", {
							className: WebSearchCard_module_css_default.toggleRow,
							children: [(0, react_jsx_runtime.jsx)("span", { children: t("useSearchApi") }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
								checked: searchApi,
								label: t("useSearchApi"),
								disabled: disabled || state.apiSwitchBlocked,
								onChange: (checked) => {
									props.setSearchApi(checked);
								}
							})]
						}), (0, react_jsx_runtime.jsxs)("p", {
							className: WebSearchCard_module_css_default.hint,
							children: [t("useSearchApiHint"), (0, react_jsx_runtime.jsx)("a", {
								className: WebSearchCard_module_css_default.link,
								href: t("searchGuideUrl"),
								target: "_blank",
								rel: "noopener noreferrer",
								children: t("searchGuide")
							})]
						})]
					}),
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SettingsSecretField, {
						id: "plugin-config-web-search-key",
						label: t("apiKey"),
						hint: t("apiKeyHint"),
						disabled: !state.apiKeyWritable,
						text: state.apiKey.text,
						configured: state.apiKeyConfigured,
						stateLabel: state.apiKeyConfigured ? t("apiKeySet") : t("apiKeyUnset"),
						onEdit: (text) => {
							props.edit("apiKey", text);
						}
					}),
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SettingsValueField, {
						id: "plugin-config-web-search-endpoint",
						label: t(searchApi ? "searchApiBaseUrl" : "baseUrl"),
						hint: t(searchApi ? "searchApiBaseUrlHint" : "baseUrlHint"),
						overriddenLabel: t("overridden"),
						resetLabel: t("reset"),
						invalidLabel: t("invalidNumber"),
						disabled,
						...state.baseURL,
						onEdit: (text) => {
							props.edit("baseURL", text);
						},
						onReset: () => {
							props.resetField("baseURL");
						}
					}),
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SettingsValueField, {
						id: searchApi ? "plugin-config-web-search-count" : "plugin-config-web-search-max-uses",
						label: t(limitField),
						hint: t(searchApi ? "countHint" : "maxUsesHint"),
						overriddenLabel: t("overridden"),
						resetLabel: t("reset"),
						invalidLabel: t(searchApi ? "invalidCount" : "invalidNumber"),
						numeric: true,
						disabled,
						...state[limitField],
						onEdit: (text) => {
							props.edit(limitField, text);
						},
						onReset: () => {
							props.resetField(limitField);
						}
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/web-search-card-controller.js
		/**
		* The web-search page's staged form over three settings namespaces: `web`,
		* whose provider selection the Search API switch writes, `web-search-deepseek`
		* for Messages search, and `web-deepseek-api` for the Search and Fetch APIs.
		*
		* The switch selects `deepseek-search-api` and `deepseek-fetch-api` together, or
		* Messages search with local HTTP fetch. A selection equal to the deployment's
		* composed value clears the override instead of storing a copy of it.
		*
		* The key is the one control that does not live in a section: its literal
		* never rides a response, so the page learns only whether one is configured
		* and writes it through the credentials domain, addressed by the reference the
		* selected API's section names. It is still staged with the rest of the form,
		* so one save covers everything the page shows.
		*/
		/**
		* Namespaces this page edits. Spelled here rather than imported: a client
		* package must not depend on a Host package.
		*/
		const WEB_SEARCH_NS = "web-search-deepseek";
		/** Namespace of the DeepSeek Search and Fetch API providers. */
		const WEB_API_NS = "web-deepseek-api";
		/** Provider ids the switch writes into the web service's selection. */
		const PROVIDERS = {
			searchProvider: {
				api: "deepseek-search-api",
				messages: "deepseek-official"
			},
			fetchProvider: {
				api: "deepseek-fetch-api",
				messages: "http"
			}
		};
		/** Credential reference the providers resolve when a section names none. */
		const DEFAULT_API_KEY_REF = "DEEPSEEK_API_KEY";
		/** Form field the credential control stages under. */
		const API_KEY_FIELD = "apiKey";
		/** Bridges the three settings scopes and the credentials domain onto the page. */
		var WebSearchCardController = class {
			scopes;
			ctx;
			selection;
			messages;
			api;
			store;
			unsubscribe;
			credential = {
				ref: "",
				configured: false,
				writable: true
			};
			/**
			* @param scopes - the bound settings scopes for the page's namespaces.
			* @param ctx - the page plugin's context, whose `remote.credentials` namespace
			* answers for the credential the selected section references.
			*/
			constructor(scopes, ctx) {
				this.scopes = scopes;
				this.ctx = ctx;
				this.selection = new _deepseek_ai_dsh_client_ui_primitives.SettingsFormModel(scopes.web, [(0, _deepseek_ai_dsh_client_ui_primitives.settingsTextField)("searchProvider"), (0, _deepseek_ai_dsh_client_ui_primitives.settingsTextField)("fetchProvider")], [{
					field: API_KEY_FIELD,
					write: (text) => this.writeKey(text)
				}]);
				this.messages = new _deepseek_ai_dsh_client_ui_primitives.SettingsFormModel(scopes.messages, [(0, _deepseek_ai_dsh_client_ui_primitives.settingsTextField)("baseURL"), (0, _deepseek_ai_dsh_client_ui_primitives.settingsNumberField)("maxUses")]);
				this.api = new _deepseek_ai_dsh_client_ui_primitives.SettingsFormModel(scopes.api, [(0, _deepseek_ai_dsh_client_ui_primitives.settingsTextField)("baseURL"), {
					...(0, _deepseek_ai_dsh_client_ui_primitives.settingsNumberField)("count"),
					parse: (text) => {
						if (text.trim() === "") return { kind: "clear" };
						const value = Number(text);
						return Number.isInteger(value) && value >= 1 && value <= 50 ? {
							kind: "set",
							value
						} : void 0;
					}
				}]);
				this.store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(this.projection());
				const publish = () => {
					this.store.set(this.projection());
					if (this.ref() !== this.credential.ref) this.readCredential();
				};
				this.unsubscribe = [...[
					this.selection,
					this.messages,
					this.api
				].map((form) => form.bind(() => form.shell()).subscribe(publish)), ...[
					scopes.web,
					scopes.messages,
					scopes.api
				].map((scope) => scope.subscribe(() => {
					this.readCredential();
				}))];
				this.readCredential();
			}
			/** Whether the Host serves both sections the switch needs. */
			switchAvailable() {
				return this.selection.shell().available && this.api.shell().available;
			}
			/** The staged switch position, read from the staged search selection. */
			searchApi() {
				return this.switchAvailable() && this.selection.field("searchProvider").text === PROVIDERS.searchProvider.api;
			}
			projection() {
				const primary = this.messages.shell();
				const served = [
					primary,
					this.selection.shell(),
					this.api.shell()
				].filter((item) => item.available);
				const shell = {
					available: primary.available,
					writable: served.every((item) => item.writable),
					dirty: served.some((item) => item.dirty),
					invalid: served.some((item) => item.invalid),
					saving: served.some((item) => item.saving),
					failed: served.some((item) => item.failed)
				};
				const searchApi = this.searchApi();
				return {
					...shell,
					apiSwitchAvailable: this.switchAvailable(),
					apiSwitchBlocked: shell.invalid || shell.failed,
					useSearchApi: searchApi,
					baseURL: (searchApi ? this.api : this.messages).field("baseURL"),
					maxUses: this.messages.field("maxUses"),
					count: this.api.field("count"),
					apiKey: this.selection.field(API_KEY_FIELD),
					apiKeyConfigured: this.credential.configured,
					apiKeyWritable: this.credential.writable
				};
			}
			/** The reference the selected API's section names, or the providers' default. */
			ref() {
				return refOf(this.searchApi() ? this.scopes.api.getSnapshot() : this.scopes.messages.getSnapshot());
			}
			/**
			* Ask the credentials domain about the reference the selected section currently names.
			*
			* The answer is stored with the reference it describes: `apiKeyEnv` and the
			* switch can change between the request and its response, and two reads can
			* settle out of order, so a response is published only while it still
			* answers for the reference in force.
			*/
			async readCredential() {
				const ref = this.ref();
				if (ref !== this.credential.ref) {
					this.credential = {
						ref,
						configured: false,
						writable: true
					};
					this.store.set(this.projection());
				}
				const response = await this.ctx.remote.credentials.describe([ref]);
				if (!response.ok || ref !== this.ref()) return;
				const view = response.value[ref];
				const next = {
					ref,
					configured: view?.configured ?? false,
					writable: view?.writable ?? true
				};
				if (next.configured === this.credential.configured && next.writable === this.credential.writable) return;
				this.credential = next;
				this.store.set(this.projection());
			}
			/**
			* Re-read after the Host reports a change to the reference this page watches.
			*
			* A key can be written from somewhere else — the Models page addresses the
			* same reference — and no settings section changes when it is, so without
			* this the badge keeps reporting a state the Host already replaced.
			* @param ref - the reference the Host reports as changed.
			*/
			refreshCredential(ref) {
				if (ref !== this.credential.ref) return;
				this.readCredential();
			}
			/**
			* Build the face the page's slot registration injects. `baseURL` edits the
			* selected API's endpoint; `maxUses` and `count` edit their own sections.
			* @returns the page's snapshot and its form actions.
			*/
			inject() {
				const formOf = (field) => {
					if (field === API_KEY_FIELD) return this.selection;
					if (field === "maxUses") return this.messages;
					if (field === "count") return this.api;
					return this.searchApi() ? this.api : this.messages;
				};
				return {
					hooks: { webSearchCard: this.store },
					edit: (field, text) => {
						formOf(field).actions().edit(field, text);
					},
					resetField: (field) => {
						formOf(field).actions().resetField(field);
					},
					setSearchApi: (enabled) => {
						this.select(enabled);
					},
					save: () => {
						this.save();
					},
					discard: () => {
						for (const form of [
							this.selection,
							this.messages,
							this.api
						]) form.actions().discard();
					}
				};
			}
			/**
			* Stage both provider selections for one switch position. A target equal to
			* the composed value clears the override so the deployment default keeps
			* applying.
			* @param enabled - true for the Search and Fetch APIs.
			*/
			select(enabled) {
				const base = this.scopes.web.getSnapshot().base;
				const actions = this.selection.actions();
				for (const field of ["searchProvider", "fetchProvider"]) {
					const target = PROVIDERS[field][enabled ? "api" : "messages"];
					if (base?.[field] === target) actions.resetField(field);
					else actions.edit(field, target);
				}
			}
			/**
			* Save the provider sections before the selection, so a switch takes effect
			* only after the endpoint it uses has landed. A refused section stops the
			* selection from saving and keeps every remaining draft for correction.
			* @returns settlement after every attempted write.
			*/
			async save() {
				const state = this.projection();
				if (!state.available || state.invalid || state.saving) return;
				for (const form of [this.messages, this.api]) {
					if (!form.shell().available || !form.shell().dirty) continue;
					await form.save();
					if (form.shell().failed) return;
				}
				if (this.selection.shell().dirty) await this.selection.save();
			}
			/**
			* Write the staged key, then re-read whether the Host now holds one.
			* @param value - the staged credential literal.
			* @returns whether the Host reports a configured credential afterwards.
			*/
			async writeKey(value) {
				await this.ctx.remote.credentials.set(this.ref(), value);
				await this.readCredential();
				return this.credential.configured;
			}
			/** Release configuration subscriptions. */
			dispose() {
				for (const off of this.unsubscribe) off();
				for (const form of [
					this.selection,
					this.messages,
					this.api
				]) form.dispose();
			}
		};
		/**
		* The credential reference a section names, or the providers' default.
		* @param snapshot - the section's current scope snapshot.
		* @returns the reference to address.
		*/
		function refOf(snapshot) {
			const declared = snapshot.value?.apiKeyEnv;
			return declared !== void 0 && declared.length > 0 ? declared : DEFAULT_API_KEY_REF;
		}
		//#endregion
		//#region lib/types/client/index.js
		/**
		* The web-search settings page, browser half: the switch between DeepSeek
		* Messages search and the Search and Fetch APIs, which writes the `web`
		* provider selection, and the selected API's key, endpoint, and per-search
		* limit over the `web-search-deepseek` or `web-deepseek-api` namespace. The
		* page registers into the Plugins page's `plugins.item` slot while the Host
		* serves `web-search-deepseek`, so a deployment without that provider shows no
		* trace of it; the switch appears only while the Host also serves `web` and
		* `web-deepseek-api`.
		*/
		/** Dictionary namespace owned by this plugin. */
		const NS = "settings.webSearch";
		/** Required services (cordis fiber inject). */
		const inject = [
			"slots",
			"locale",
			"remote",
			"remote.credentials",
			"configForms"
		];
		/**
		* Mount the web-search settings page while the Host serves its namespace.
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
			}), "ui-settings-web-search: dictionaries");
			const card = new WebSearchCardController({
				web: ctx.configForms.get("web"),
				messages: ctx.configForms.get(WEB_SEARCH_NS),
				api: ctx.configForms.get(WEB_API_NS)
			}, ctx);
			ctx.effect(() => () => {
				card.dispose();
			}, "ui-settings-web-search: form subscription");
			ctx.effect(() => ctx.remote.$on("credentials/reference-updated", (ref) => {
				card.refreshCredential(ref);
			}), "ui-settings-web-search: credential invalidations");
			ctx.effect(() => ctx.configForms.whileServed([WEB_SEARCH_NS], () => ctx.slots.inject("plugins.item", () => ctx.slots.register({
				name: "plugins.item",
				id: "web-search",
				order: 20,
				label: () => t("title"),
				locale: NS,
				inject: () => card.inject()
			}, WebSearchCard))), "ui-settings-web-search: page");
		}
		//#endregion
		exports.NS = NS;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
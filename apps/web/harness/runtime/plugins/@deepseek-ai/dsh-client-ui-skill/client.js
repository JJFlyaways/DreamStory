window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-skill",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		//#region ../../util/workspace-path/src/file-address.ts
		/** The scheme and type every file address opens with. */
		const FILE_ADDRESS_PREFIX = "dsh-resource://file/";
		/** Component-encode one id or path segment, keeping `:` literal for drive letters. */
		function encodeSegment(segment) {
			return encodeURIComponent(segment).replace(/%3A/gi, ":");
		}
		/** Encode a `/`-separated path segment by segment. */
		function encodePath(path) {
			return path.split("/").map(encodeSegment).join("/");
		}
		/**
		* Build the address of a file read through one Session.
		* @param sessionId - the Session whose Host workspace resolves the path.
		* @param path - absolute or workspace-relative path; backslashes are normalized to `/`, and leading `./` prefixes are dropped.
		* @returns the `dsh-resource://file/session/<sessionId>/<path>` address.
		*/
		function sessionFileAddress(sessionId, path) {
			const normalized = path.replace(/\\/g, "/").replace(/^(?:\.\/)+/, "");
			return `${FILE_ADDRESS_PREFIX}session/${encodeSegment(sessionId)}/${encodePath(normalized)}`;
		}
		//#endregion
		//#region ../../util/workspace-path/src/index.ts
		/**
		* Browser-safe Workspace path and display helpers.
		* @module @deepseek-ai/dsh-util-workspace-path
		*/
		/** Whether a path uses a Windows drive or UNC prefix. */
		function isWindowsStylePath(value) {
			return /^[A-Za-z]:[/\\]/.test(value) || value.startsWith("\\\\");
		}
		/**
		* Whether a path is absolute in either spelling the Host accepts: POSIX (`/a/b`) or Windows drive or UNC.
		* @param path - the path to classify.
		* @returns `true` for an absolute path; `false` for a Workspace-relative one.
		*/
		function isAbsoluteWorkspacePath(path) {
			return path.startsWith("/") || isWindowsStylePath(path);
		}
		/**
		* The address for a path as a caller holds it: a relative path, or an absolute
		* path inside the Session's workspace, becomes a `session`-scoped address; an
		* absolute path outside it, or one whose workspace root is unknown, keeps its
		* absolute path in that Session's address.
		* @param sessionId - the Session the path is read in.
		* @param cwd - that Session's workspace root, when known.
		* @param path - absolute or workspace-relative path, in either separator spelling.
		* @returns the `dsh-resource://file/…` address.
		*/
		function fileAddressFor(sessionId, cwd, path) {
			const normalized = path.replace(/\\/g, "/");
			if (!isAbsoluteWorkspacePath(normalized)) return sessionFileAddress(sessionId, normalized);
			const root = cwd === void 0 ? "" : cwd.replace(/\\/g, "/").replace(/\/+$/, "");
			if (root !== "" && normalized === root) return sessionFileAddress(sessionId, "");
			if (root !== "" && normalized.startsWith(`${root}/`)) return sessionFileAddress(sessionId, normalized.slice(root.length + 1));
			return sessionFileAddress(sessionId, normalized);
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-skill/src/client/SkillRow.module.css.mjs
		const css = "._8XBZMW_card{flex-direction:column;display:flex}._8XBZMW_row{height:calc(24px + var(--dsh-content-font-delta,0px));min-width:0;color:var(--dsw-alias-label-tertiary);align-items:center;transition:color .1s;display:flex;position:relative;overflow:hidden}@media (hover:hover){._8XBZMW_row:hover{color:var(--dsw-alias-label-secondary)}}._8XBZMW_row[data-expandable]{cursor:pointer}._8XBZMW_leading{width:calc(16px + var(--dsh-content-font-delta,0px));height:calc(16px + var(--dsh-content-font-delta,0px));color:inherit;flex:none;justify-content:center;align-items:center;margin-right:6px;display:inline-flex;position:relative}._8XBZMW_leading svg{width:calc(14px + var(--dsh-content-font-delta,0px));height:calc(14px + var(--dsh-content-font-delta,0px))}._8XBZMW_chevron{color:inherit}._8XBZMW_iconIdle{opacity:1;transition:opacity .1s;display:inline-flex}._8XBZMW_chevronHover{opacity:0;margin:auto;transition:opacity .1s;position:absolute;inset:0}@media (hover:hover){._8XBZMW_row:hover ._8XBZMW_iconIdle{opacity:0}._8XBZMW_row:hover ._8XBZMW_chevronHover{opacity:1}}._8XBZMW_title{font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px));flex:none}._8XBZMW_separator{background:var(--dsw-alias-label-caption);border-radius:1px;flex:none;width:2px;height:2px;margin:0 8px}._8XBZMW_summary{text-overflow:ellipsis;white-space:nowrap;min-width:0;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px));flex:auto;overflow:hidden}._8XBZMW_errorSummary{color:var(--dsw-alias-state-error-primary)}._8XBZMW_stoppedSummary{color:var(--dsw-alias-state-warn-label)}._8XBZMW_bodyWrap{flex-direction:column;display:flex}._8XBZMW_instructionsCard{border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-markdown-code-block);flex-direction:column;max-height:260px;margin:4px 0 4px 4px;display:flex;overflow:hidden}._8XBZMW_instructionsHeader{border-bottom:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-markdown-code-block-banner);color:var(--dsw-alias-label-caption);text-transform:uppercase;letter-spacing:.04em;flex:none;padding:8px 12px;font-size:11px;font-weight:500;line-height:16px}._8XBZMW_instructions{white-space:pre-wrap;overflow-wrap:anywhere;min-height:0;font:var(--dsw-font-markdown-code-block-small);color:var(--dsw-alias-label-secondary);margin:0;padding:10px 12px 12px;overflow:auto}._8XBZMW_instructions[data-error]{color:var(--dsw-alias-state-error-primary)}._8XBZMW_instructions::-webkit-scrollbar-thumb{border-radius:var(--dsw-radius-sm);background-clip:padding-box;border:2px solid #0000}._8XBZMW_instructions::-webkit-scrollbar-track{margin:6px 0}._8XBZMW_inspectButton{border:.5px solid var(--dsw-alias-border-l4);corner-shape:round;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);cursor:pointer;opacity:0;border-radius:999px;align-self:flex-start;align-items:center;gap:4px;margin:4px 0 2px 4px;padding:2px 8px;font-size:11px;line-height:16px;transition:opacity .1s;display:inline-flex}._8XBZMW_inspectButton:focus-visible{opacity:1}@media (hover:hover){._8XBZMW_card:hover ._8XBZMW_inspectButton{opacity:1}._8XBZMW_inspectButton:hover{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}}._8XBZMW_visuallyHidden{clip:rect(0 0 0 0);white-space:nowrap;width:1px;height:1px;position:absolute;overflow:hidden}@media (prefers-reduced-motion:reduce){._8XBZMW_row,._8XBZMW_iconIdle,._8XBZMW_chevronHover,._8XBZMW_inspectButton{transition:none}}@media (hover:none){._8XBZMW_inspectButton{opacity:1}}";
		const tagId = "@deepseek-ai/dsh-client-ui-skill/SkillRow.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-skill";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var SkillRow_module_css_default = {
			"bodyWrap": "_8XBZMW_bodyWrap",
			"card": "_8XBZMW_card",
			"chevron": "_8XBZMW_chevron",
			"chevronHover": "_8XBZMW_chevronHover",
			"errorSummary": "_8XBZMW_errorSummary",
			"iconIdle": "_8XBZMW_iconIdle",
			"inspectButton": "_8XBZMW_inspectButton",
			"instructions": "_8XBZMW_instructions",
			"instructionsCard": "_8XBZMW_instructionsCard",
			"instructionsHeader": "_8XBZMW_instructionsHeader",
			"leading": "_8XBZMW_leading",
			"row": "_8XBZMW_row",
			"separator": "_8XBZMW_separator",
			"stoppedSummary": "_8XBZMW_stoppedSummary",
			"summary": "_8XBZMW_summary",
			"title": "_8XBZMW_title",
			"visuallyHidden": "_8XBZMW_visuallyHidden"
		};
		//#endregion
		//#region lib/types/client/SkillRow.js
		/** First physical line for the collapsed error summary and malformed-args fallback. */
		function firstLine(text) {
			const newline = text.indexOf("\n");
			return newline === -1 ? text : text.slice(0, newline);
		}
		/** Skill names are the only call argument the compact row presents. */
		function skillName(argsRaw, callId) {
			try {
				const parsed = JSON.parse(argsRaw);
				if (typeof parsed === "object" && parsed !== null) {
					const name = parsed.name;
					if (typeof name === "string" && name !== "") return firstLine(name);
				}
			} catch {}
			return argsRaw === "" ? callId : firstLine(argsRaw);
		}
		/** Flatten durable result blocks under the generic Tool-row text contract.
		*  Keep aligned with ui-tool's models/tool-call-model.ts `resultText`. */
		function resultText(block) {
			if (!("kind" in block)) return null;
			const parts = [];
			for (const item of block.content) parts.push(item.type === "text" ? item.text : JSON.stringify(item, null, 2));
			if (parts.length === 0 && block.error !== void 0) parts.push(`${block.error.name}: ${block.error.code}`);
			return parts.join("\n") || null;
		}
		/** Derive display state without consulting the live skill catalog. */
		function skillRowModel(block) {
			const settled = "kind" in block;
			const argsRaw = (settled ? block.call?.argsRaw : block.argsRaw) ?? "";
			const state = !settled ? "running" : block.error?.code === "interrupted" ? "stopped" : block.isError ? "error" : "ok";
			const output = resultText(block);
			return {
				name: skillName(argsRaw, block.callId),
				output,
				errorSummary: state === "error" && output !== null ? firstLine(output) : null,
				state
			};
		}
		/** Leading disclosure slot: state icon at rest, chevron on hover or while open. */
		function disclosureLeading(open, expandable) {
			if (open) return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { className: SkillRow_module_css_default.chevron });
			const icon = (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSkillOutlineRegular, { size: 14 });
			if (!expandable) return icon;
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
				className: SkillRow_module_css_default.iconIdle,
				children: icon
			}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { className: `${SkillRow_module_css_default.chevron} ${SkillRow_module_css_default.chevronHover}` })] });
		}
		/** Visually hidden state copy for the color-only running sweep and error tone. */
		function stateStatus(state, t) {
			switch (state) {
				case "running": return t("row.running");
				case "error": return t("row.failed");
				default: return null;
			}
		}
		/**
		* Render one `skill` tool call as an accent summary and instructions disclosure.
		* @param props - keyed toolview payload plus the skill locale seat.
		* @returns the dedicated skill row.
		*/
		function SkillRow(props) {
			if (props.phase === "preparing") return (0, react_jsx_runtime.jsx)("div", {
				className: SkillRow_module_css_default.card,
				"data-tool": "skill",
				"data-state": "preparing",
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: SkillRow_module_css_default.row,
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: SkillRow_module_css_default.leading,
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSkillOutlineRegular, { size: 14 })
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: SkillRow_module_css_default.visuallyHidden,
							children: props.t("row.preparing")
						}),
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, {
							active: true,
							className: SkillRow_module_css_default.title,
							children: props.t("row.title")
						})
					]
				})
			});
			return (0, react_jsx_runtime.jsx)(StartedSkillRow, { ...props });
		}
		function StartedSkillRow({ block, inspect, t }) {
			const model = skillRowModel(block);
			const [expanded, setExpanded] = (0, react.useState)(false);
			const expandable = model.output !== null;
			const open = expanded && expandable;
			const status = stateStatus(model.state, t);
			const running = model.state === "running";
			const summary = model.state === "stopped" ? t("row.stopped") : model.errorSummary ?? model.name;
			const toggleExpand = () => {
				setExpanded((value) => !value);
			};
			const toggleFromKeyboard = (event) => {
				if (!expandable || event.key !== "Enter" && event.key !== " ") return;
				event.preventDefault();
				toggleExpand();
			};
			const disclosureProps = expandable ? {
				role: "button",
				tabIndex: 0,
				"aria-expanded": open,
				onClick: toggleExpand,
				onKeyDown: toggleFromKeyboard
			} : {};
			const leading = disclosureLeading(open, expandable);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: SkillRow_module_css_default.card,
				"data-tool": "skill",
				"data-state": model.state,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: SkillRow_module_css_default.row,
					"data-expandable": expandable || void 0,
					...disclosureProps,
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: SkillRow_module_css_default.leading,
							children: leading
						}),
						status !== null ? (0, react_jsx_runtime.jsx)("span", {
							className: SkillRow_module_css_default.visuallyHidden,
							children: status
						}) : null,
						(0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, {
							active: running,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: SkillRow_module_css_default.title,
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, { children: t("row.title") })
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: SkillRow_module_css_default.separator,
									"data-shimmer-decoration": true,
									"aria-hidden": true
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: `${SkillRow_module_css_default.summary}${model.state === "error" ? ` ${SkillRow_module_css_default.errorSummary}` : model.state === "stopped" ? ` ${SkillRow_module_css_default.stoppedSummary}` : ""}`,
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, { children: summary })
								})
							]
						})
					]
				}), open ? (0, react_jsx_runtime.jsxs)("div", {
					className: SkillRow_module_css_default.bodyWrap,
					children: [(0, react_jsx_runtime.jsxs)("section", {
						className: SkillRow_module_css_default.instructionsCard,
						"aria-label": t("row.instructions"),
						children: [(0, react_jsx_runtime.jsx)("div", {
							className: SkillRow_module_css_default.instructionsHeader,
							children: t("row.instructions")
						}), (0, react_jsx_runtime.jsx)("pre", {
							className: SkillRow_module_css_default.instructions,
							"data-error": model.state === "error" || void 0,
							children: model.output
						})]
					}), inspect !== void 0 ? (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: SkillRow_module_css_default.inspectButton,
						onClick: inspect,
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconInspectOutlineRegular, {}), t("row.inspect")]
					}) : null]
				}) : null]
			});
		}
		//#endregion
		//#region lib/types/client/SkillReference.js
		/**
		* Render a skill chip; previews omit activation even when the entry has an injected action.
		* @param props - resolved node, raw token, interaction mode, and Session-bound preview action.
		* @returns an inline skill label or interactive chip.
		*/
		function SkillReference({ node, raw, interactive, openSkill }) {
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ReferenceChip, {
				appearance: "skill",
				label: `/${node.data.name}`,
				title: raw,
				...interactive ? { onActivate: () => {
					openSkill(node.data.name);
				} } : {}
			});
		}
		//#endregion
		//#region lib/types/client/user-text-rules.js
		/** Return one nearest confirmed slash token, retaining its original word boundaries. */
		const skillReferenceRule = {
			id: "skill",
			order: 20,
			match(text, from, context) {
				const tokens = /(?<!\S)\/([\w-]+)(?!\S)/gu;
				tokens.lastIndex = from;
				let names;
				for (let token = tokens.exec(text); token !== null; token = tokens.exec(text)) {
					if (names === void 0) {
						names = context.read("skillNames");
						if (names === void 0 || names.length === 0) return void 0;
					}
					const name = token[1];
					if (names.includes(name)) return {
						id: "skill",
						start: token.index,
						end: token.index + token[0].length,
						data: { name }
					};
				}
			}
		};
		//#endregion
		//#region lib/types/client/locales.js
		/** `skill` namespace dictionaries for the dedicated tool row. */
		/** Dictionary namespace owned by this plugin. */
		const NS = "skill";
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"row.title": "加载技能",
			"row.running": "正在加载 skill",
			"row.preparing": "准备加载技能",
			"row.failed": "skill 加载失败",
			"row.stopped": "skill 加载已中止",
			"row.instructions": "说明",
			"row.inspect": "查看",
			"menu.userOnly": "仅用户"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"row.title": "Skill",
			"row.running": "Loading skill",
			"row.preparing": "Preparing to load a skill",
			"row.failed": "Skill load failed",
			"row.stopped": "Skill load stopped",
			"row.instructions": "Instructions",
			"row.inspect": "Inspect",
			"menu.userOnly": "user-only"
		};
		/** Japanese copy, checked against the English keys. */
		const ja = {
			"row.title": "スキル",
			"row.running": "スキルを読み込み中",
			"row.preparing": "スキルの読み込みを準備中",
			"row.failed": "スキルの読み込みに失敗しました",
			"row.stopped": "スキルの読み込みが停止しました",
			"row.instructions": "手順",
			"row.inspect": "詳細を確認",
			"menu.userOnly": "ユーザー専用"
		};
		/** Spanish dictionary, checked against the English keys. */
		const es = {
			"row.title": "Habilidad",
			"row.running": "Habilidad de carga",
			"row.preparing": "Preparándose para cargar una habilidad",
			"row.failed": "La carga de habilidades falló",
			"row.stopped": "Carga de habilidades detenida",
			"row.instructions": "Instrucciones",
			"row.inspect": "inspeccionar",
			"menu.userOnly": "solo usuario"
		};
		/** French dictionary, checked against the English keys. */
		const fr = {
			"row.title": "Compétence",
			"row.running": "Compétence de chargement",
			"row.preparing": "Préparation du chargement d’une compétence",
			"row.failed": "Échec du chargement des compétences",
			"row.stopped": "Chargement de compétences arrêté",
			"row.instructions": "Instructions",
			"row.inspect": "Inspecter",
			"menu.userOnly": "utilisateur uniquement"
		};
		/** German dictionary, checked against the English keys. */
		const de = {
			"row.title": "Geschicklichkeit",
			"row.running": "Ladefähigkeit",
			"row.preparing": "Das Laden eines Skills wird vorbereitet",
			"row.failed": "Das Laden des Skills ist fehlgeschlagen",
			"row.stopped": "Das Laden der Fertigkeiten wurde gestoppt",
			"row.instructions": "Anweisungen",
			"row.inspect": "Inspizieren",
			"menu.userOnly": "Nur für Benutzer"
		};
		/** Russian dictionary, checked against the English keys. */
		const ru = {
			"row.title": "Навык",
			"row.running": "Навык загрузки",
			"row.preparing": "Подготовка к загрузке навыка",
			"row.failed": "Не удалось загрузить навык",
			"row.stopped": "Загрузка навыков остановлена",
			"row.instructions": "Инструкции",
			"row.inspect": "Осмотреть",
			"menu.userOnly": "только для пользователей"
		};
		/** Portuguese dictionary, checked against the English keys. */
		const pt = {
			"row.title": "Habilidade",
			"row.running": "Habilidade de carregamento",
			"row.preparing": "Preparando-se para carregar uma habilidade",
			"row.failed": "Falha no carregamento da habilidade",
			"row.stopped": "Carga de habilidade interrompida",
			"row.instructions": "Instruções",
			"row.inspect": "Inspecionar",
			"menu.userOnly": "somente usuário"
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Required services: reference source faces plus the tool-row and locale registries. */
		const inject = [
			"inputTriggers",
			"sessions",
			"slots",
			"locale",
			"remote",
			"remote.skills",
			"sidebarRight",
			"uiConversation"
		];
		/**
		* Client plugin body: register the '/' source, dictionaries, and keyed tool row.
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
			}), "ui-skill: dictionaries");
			ctx.uiConversation.userText.register(skillReferenceRule);
			ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({
				name: "tool.call.toolview",
				key: "skill",
				locale: NS
			}, SkillRow));
			const skills = ctx.remote.skills;
			const sessions = ctx.sessions;
			const fetches = /* @__PURE__ */ new Map();
			const lexiconListeners = /* @__PURE__ */ new Map();
			const notifyLexicon = (sessionId) => {
				for (const listener of [...lexiconListeners.get(sessionId) ?? []]) try {
					listener();
				} catch (error) {
					console.error("[ui-skill] lexicon listener failed:", error);
				}
			};
			const fetchCatalog = (sessionId) => {
				const existing = fetches.get(sessionId);
				if (existing !== void 0) return existing;
				const abort = new AbortController();
				const promise = (async () => {
					if (sessions.binding(sessionId) === void 0) throw new Error(`skill catalog requires a retained session "${sessionId}"`);
					return sessions.using(sessionId, {
						source: "skillCatalog",
						signal: abort.signal
					}, async (reference) => {
						abort.signal.throwIfAborted();
						const state = reference.binding.session.getSnapshot();
						if (state.openState !== "open") throw state.openError ?? /* @__PURE__ */ new Error(`session "${sessionId}" is not open`);
						const result = await skills.list({ sessionId }, abort.signal);
						abort.signal.throwIfAborted();
						if (!result.ok) throw new Error(`skills/list failed: ${result.error.code}: ${result.error.message}`);
						return result.value.skills;
					});
				})();
				const entry = {
					promise,
					abort
				};
				fetches.set(sessionId, entry);
				promise.then((skills) => {
					entry.settled = skills;
					notifyLexicon(sessionId);
				}, () => {
					if (fetches.get(sessionId) === entry) fetches.delete(sessionId);
				});
				return entry;
			};
			const invalidate = (key) => {
				const entry = fetches.get(key);
				if (entry === void 0) return;
				fetches.delete(key);
				entry.abort.abort();
				notifyLexicon(key);
			};
			const clearAll = () => {
				for (const key of [...fetches.keys()]) invalidate(key);
			};
			const t = ctx.locale.bind(NS);
			const source = {
				trigger: "/",
				name: "skill",
				order: 2,
				async candidates(session, { query, signal }) {
					if (sessions.subagentAddress(session.sessionId) !== void 0) return [];
					const skills = await fetchCatalog(session.sessionId).promise;
					if (signal.aborted) return [];
					return (0, _deepseek_ai_dsh_client_ui_primitives.rankByName)(skills, query).map((skill) => ({
						name: skill.name,
						description: skill.modelInvocable ? skill.description : `${t("menu.userOnly")} · ${skill.description}`
					}));
				},
				warm(session) {
					if (sessions.subagentAddress(session.sessionId) !== void 0) return;
					fetchCatalog(session.sessionId).promise.catch(() => {});
				},
				lexicon(session) {
					return fetches.get(session.sessionId)?.settled?.map((skill) => skill.name);
				},
				subscribeLexicon(session, listener) {
					const key = session.sessionId;
					const listeners = lexiconListeners.get(key) ?? /* @__PURE__ */ new Set();
					listeners.add(listener);
					lexiconListeners.set(key, listeners);
					return () => {
						listeners.delete(listener);
						if (listeners.size === 0) lexiconListeners.delete(key);
					};
				},
				openReference(session, { ref }) {
					if (sessions.subagentAddress(session.sessionId) !== void 0) return false;
					const cwd = sessions.list.getSnapshot().byId[session.sessionId]?.cwd;
					const open = (catalog) => {
						const path = catalog.find((skill) => `/${skill.name}` === ref)?.path;
						if (path === void 0) return false;
						ctx.sidebarRight.openResource(fileAddressFor(session.sessionId, cwd, path));
						return true;
					};
					const settled = fetches.get(session.sessionId)?.settled;
					if (settled !== void 0) return open(settled);
					const entry = fetchCatalog(session.sessionId);
					entry.promise.then((catalog) => {
						if (!entry.abort.signal.aborted) open(catalog);
					}).catch((error) => {
						if (!entry.abort.signal.aborted) console.error("[ui-skill] reference preview failed:", error);
					});
					return true;
				},
				onPick({ candidate }) {
					return { text: `/${candidate.name} ` };
				}
			};
			ctx.slots.inject("conversation.user.text.node", () => ctx.slots.register({
				name: "conversation.user.text.node",
				key: "skill",
				priority: 100,
				inject: (sessionId) => ({ openSkill: (name) => {
					if (sessions.scope(sessionId) === void 0) return;
					source.openReference({ sessionId }, { ref: `/${name}` });
				} })
			}, SkillReference));
			const inputTriggers = ctx.get("inputTriggers");
			ctx.remote.$on("agent-preset/selected", invalidate);
			ctx.remote.$on("plugin-manager/changed", clearAll);
			ctx.on("connection/reset", clearAll);
			ctx.effect(() => {
				const unregister = inputTriggers.registerSource(source);
				return () => {
					unregister();
					clearAll();
				};
			}, "ui-skill: source");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
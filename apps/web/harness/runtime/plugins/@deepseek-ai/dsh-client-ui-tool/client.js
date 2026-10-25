window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-tool",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region ../../util/workspace-path/src/index.ts
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
		* Resolve a Workspace-relative path into the Host-facing spelling used by path operations.
		* @param cwd - Session Workspace root, when known.
		* @param path - Absolute or Workspace-relative path; leading `./` segments are dropped when joining.
		* @returns an absolute path when a Workspace root is available, otherwise the original path.
		*/
		function resolveWorkspacePath(cwd, path) {
			if (isAbsoluteWorkspacePath(path)) return path;
			if (cwd === void 0 || cwd === "") return path;
			const separator = isWindowsStylePath(cwd) && cwd.includes("\\") ? "\\" : "/";
			return `${cwd.replace(/[/\\]+$/, "")}${separator}${path.replace(/^(?:\.?[/\\])+/, "")}`;
		}
		/**
		* Abbreviate a POSIX home directory for display.
		* @param path - Absolute or already-short display path.
		* @param home - Host account home; absent skips abbreviation.
		* @returns `~` or `~/…` for the POSIX home and its descendants, otherwise `path`.
		*/
		function abbreviateHomePath(path, home) {
			if (home === void 0 || home === "") return path;
			if (isWindowsStylePath(path) || isWindowsStylePath(home)) return path;
			const root = home.replace(/\/+$/, "");
			if (root === "" || root === "/") return path;
			if (path.replace(/\/+$/, "") === root) return "~";
			if (path.startsWith(`${root}/`)) return `~${path.slice(root.length)}`;
			return path;
		}
		/**
		* Strip the workspace root from a workspace-rooted absolute path (display only).
		* @param text - the path to shorten.
		* @param cwd - session workspace root; absent or empty leaves the path unchanged.
		* @returns the path relative to the workspace root, or unchanged when it is not rooted there.
		*/
		function relativizeToCwd(text, cwd) {
			if (cwd === void 0 || cwd === "") return text;
			const root = cwd.replace(/[/\\]+$/, "");
			if (text.startsWith(`${root}/`) || text.startsWith(`${root}\\`)) return text.slice(root.length + 1);
			return text;
		}
		//#endregion
		//#region lib/types/client/tool/models/recorded-path.js
		/** Operation-time filesystem locations carried by settled tool results. */
		/**
		* Read one absolute location from opaque persisted result metadata.
		* @param meta - tool-owned result metadata from the Session log.
		* @param field - the file path or command working directory.
		* @returns the recorded path, or undefined for old or malformed metadata.
		*/
		function recordedAbsolutePath(meta, field) {
			if (meta === null || typeof meta !== "object" || Array.isArray(meta)) return void 0;
			const value = meta[field];
			return typeof value === "string" && isAbsoluteWorkspacePath(value) ? value : void 0;
		}
		//#endregion
		//#region lib/types/client/tool/models/tool-call-model.js
		/** Locale key per generic row variant. */
		const VARIANT_TITLE_KEYS = {
			search: "tool.title.search",
			read: "tool.title.read",
			bash: "tool.title.bash",
			write: "tool.title.write",
			edit: "tool.title.edit",
			code: "tool.title.code",
			others: "tool.title.generic"
		};
		/**
		* Known tool name -> variant.
		*
		* `cordis_define` is deliberately absent: ui-cordis registers a keyed
		* `tool.call.toolview` entry for it, and a keyed hit REPLACES the generic row
		* (this table is only reached through GenericToolCard, the dispatch fallback in
		* ToolCallTree). An entry here would be unreachable, and a second title for the
		* same call would be a second answer to a question the card already owns.
		*/
		const TOOL_VARIANTS = {
			bash: "bash",
			pwsh: "bash",
			read: "read",
			read_image: "read",
			web_fetch: "read",
			web_search: "search",
			grep: "search",
			glob: "search",
			write: "write",
			edit: "edit",
			run_code: "code",
			cordis_package_inspect: "read",
			cordis_runtime_inspect: "read",
			cordis_run: "others",
			cordis_stop: "others",
			cordis_undefine: "others"
		};
		/** Tool-owned titles that refine a generic row variant without replacing it. */
		const TOOL_TITLE_KEYS = {
			cordis_package_inspect: "tool.title.inspect",
			cordis_runtime_inspect: "tool.title.inspect",
			cordis_run: "tool.title.runCordis",
			cordis_stop: "tool.title.stopCordis",
			cordis_undefine: "tool.title.removeCordis",
			pwsh: "tool.title.pwsh",
			read_image: "tool.title.readImage",
			todo_write: "todo.rowTitle",
			ask_user_question: "ask.rowTitle",
			create_goal: "tool.title.createGoal",
			get_goal: "tool.title.getGoal",
			update_goal: "tool.title.updateGoal",
			schedule_create: "tool.title.createSchedule",
			schedule_list: "tool.title.listSchedules",
			schedule_delete: "tool.title.deleteSchedule",
			schedule_update: "tool.title.updateSchedule",
			cordis_inspect_list: "tool.title.inspectProviders",
			cordis_inspect_query: "tool.title.queryRuntime",
			cordis_inspect_self: "tool.title.inspectPlugins",
			workflow: "tool.title.workflow",
			ralph: "tool.title.ralph",
			session_event_read: "tool.title.readEvent",
			session_event_search: "tool.title.searchEvents",
			session_event_trace: "tool.title.traceEvent",
			session_search: "tool.title.searchSessions",
			session_trace: "tool.title.traceSession",
			list_subagent_models: "tool.title.listModels",
			subagent: "tool.title.subagent",
			list_agents: "tool.title.listAgents",
			send_message: "tool.title.sendMessage",
			interrupt_agent: "tool.title.interruptAgent",
			job_list: "tool.title.listJobs",
			job_output: "tool.title.readJob",
			job_kill: "tool.title.killJob",
			terminal_open: "tool.title.openTerminal",
			terminal_read: "tool.title.readTerminal",
			terminal_list: "tool.title.listTerminals",
			terminal_signal: "tool.title.signalTerminal",
			terminal_close: "tool.title.closeTerminal",
			lsp: "tool.title.lsp",
			spawn_teammate: "tool.title.spawnTeammate",
			team_task_create: "tool.title.createTeamTask",
			team_task_get: "tool.title.getTeamTask",
			team_task_update: "tool.title.updateTeamTask",
			team_task_list: "tool.title.listTeamTasks",
			wait_agent: "tool.title.waitAgent"
		};
		/**
		* Classify a tool name into its row variant.
		* @param toolName - wire tool name.
		* @returns matching variant, others when unknown.
		*/
		function classifyTool(toolName) {
			return TOOL_VARIANTS[toolName] ?? "others";
		}
		/**
		* Select a tool-owned or generic title without reading arguments.
		* @param toolName - wire tool name.
		* @returns the localized title key.
		*/
		function toolTitleKey(toolName) {
			return TOOL_TITLE_KEYS[toolName] ?? VARIANT_TITLE_KEYS[classifyTool(toolName)];
		}
		function deriveAutoReviewDenial(block) {
			if (!("kind" in block) || !block.isError) return null;
			const error = block.error;
			if (error?.name !== "AutoReviewDeniedError" || error.code !== "AUTO_REVIEW_DENIED") return null;
			return { reason: typeof error.reason === "string" ? error.reason : null };
		}
		/**
		* Flatten a settled result's content blocks to display text: text blocks
		* verbatim, other block shapes as pretty JSON. Empty content on a failed call
		* falls back to the structured error's `name: code` line.
		* @param node - the settled result node.
		* @returns the flattened result text (may be empty).
		*/
		function resultText(node) {
			const parts = [];
			for (const block of node.content) if (block.type === "text") parts.push(block.text);
			else parts.push(JSON.stringify(block, null, 2));
			if (parts.length === 0 && node.error !== void 0) parts.push(`${node.error.name}: ${node.error.code}`);
			return parts.join("\n");
		}
		function parseArgs(argsRaw) {
			try {
				return JSON.parse(argsRaw);
			} catch {
				return;
			}
		}
		function firstLine(text) {
			const nl = text.indexOf("\n");
			return nl === -1 ? text : text.slice(0, nl);
		}
		function pickString(args, keys) {
			for (const key of keys) {
				const v = args[key];
				if (typeof v === "string" && v !== "") return v;
			}
		}
		/** Summary key preference per variant (args-derived; result-derived summaries are a ledger item). */
		const SUMMARY_KEYS = {
			bash: ["description", "command"],
			read: [
				"path",
				"file_path",
				"url"
			],
			search: [
				"query",
				"pattern",
				"url"
			],
			write: ["path", "file_path"],
			edit: ["path", "file_path"],
			code: ["description"],
			others: []
		};
		function deriveSummary(variant, argsRaw) {
			const parsed = parseArgs(argsRaw);
			if (typeof parsed !== "object" || parsed === null) return firstLine(argsRaw);
			const args = parsed;
			if (variant === "search" && Array.isArray(args.queries)) {
				const queries = args.queries.filter((query) => typeof query === "string" && query !== "");
				if (queries.length > 0) return queries.map(firstLine).join(", ");
			}
			const picked = pickString(args, SUMMARY_KEYS[variant]);
			if (picked !== void 0) return firstLine(picked);
			for (const v of Object.values(args)) if (typeof v === "string" && v !== "") return firstLine(v);
			return firstLine(argsRaw);
		}
		/** Path keys only — never `url` (web_fetch lands on the read variant). */
		const FILE_PATH_KEYS = ["path", "file_path"];
		/** File-tool variants whose summary may be an openable workspace path. */
		const FILE_PATH_VARIANTS = new Set([
			"read",
			"write",
			"edit"
		]);
		/**
		* Summary material read the same way at every stage from the argument view: a
		* complete `file_path` for file tools, otherwise the `description` text so far.
		* Empty when the view carries neither, so the caller falls back to the raw text.
		*/
		function argumentSummary(variant, args, cwd, home) {
			if (FILE_PATH_VARIANTS.has(variant)) {
				const path = args.complete("file_path") ? args.text("file_path") : void 0;
				const filePath = path !== void 0 && path !== "" && args.complete("file_path") ? firstLine(path) : void 0;
				return {
					summary: filePath === void 0 ? "" : abbreviateHomePath(relativizeToCwd(filePath, cwd), home),
					filePath
				};
			}
			const description = args.text("description");
			return {
				summary: description === void 0 ? "" : firstLine(description),
				filePath: void 0
			};
		}
		function deriveFilePath(variant, argsRaw) {
			if (!FILE_PATH_VARIANTS.has(variant)) return void 0;
			const parsed = parseArgs(argsRaw);
			if (typeof parsed !== "object" || parsed === null) return void 0;
			const picked = pickString(parsed, FILE_PATH_KEYS);
			return picked === void 0 ? void 0 : firstLine(picked);
		}
		/**
		* Format one argument payload when its generic input body becomes visible.
		* @param variant - row presentation selected for the Tool name.
		* @param argsRaw - original argument JSON or incomplete raw text.
		* @returns display body, or null for empty input.
		*/
		function formatToolBody(variant, argsRaw) {
			if (argsRaw === "") return null;
			const parsed = parseArgs(argsRaw);
			if (parsed === void 0) return argsRaw;
			if (variant === "code" && typeof parsed === "object" && parsed !== null) {
				const code = parsed.code;
				if (typeof code === "string" && code !== "") return code;
			}
			return JSON.stringify(parsed, null, 2);
		}
		/**
		* Derive the full row model from a frozen call slice.
		* @param toolName - wire tool name (dispatch-supplied; survives windowless results).
		* @param block - preparing call, dispatched call, or result from the snapshot.
		* @param cwd - session workspace root; workspace-rooted path summaries display relative to it.
		* @param home - host account home; a leftover POSIX home path displays as `~`.
		* @returns the row model.
		*/
		function toolRowModel(toolName, block, cwd, home) {
			const variant = classifyTool(toolName);
			const titleKey = toolTitleKey(toolName);
			const done = "kind" in block;
			const argsRaw = done ? block.call?.argsRaw ?? "" : block.phase === "start" ? block.argsRaw : null;
			const primary = argumentSummary(variant, block.args, cwd, home);
			const argumentPath = primary.filePath ?? (argsRaw === null ? void 0 : deriveFilePath(variant, argsRaw));
			const recordedPath = done ? recordedAbsolutePath(block.meta, "path") : void 0;
			const canUseArgumentPath = argumentPath !== void 0 && (isAbsoluteWorkspacePath(argumentPath) || done && !block.isError && block.parentCallId === void 0);
			const filePath = argumentPath === void 0 ? void 0 : recordedPath ?? (canUseArgumentPath ? argumentPath : void 0);
			const state = !done ? block.phase === "preparing" ? "preparing" : "running" : block.error?.code === "interrupted" ? "stopped" : block.isError ? "error" : "ok";
			const base = primary.summary !== "" || argsRaw === null ? primary.summary : argsRaw === "" ? block.callId : abbreviateHomePath(relativizeToCwd(deriveSummary(variant, argsRaw), cwd), home);
			const summary = [titleKey === "tool.title.generic" ? toolName : "", base].filter(Boolean).join(" · ");
			const output = done ? resultText(block) || null : null;
			const errorSummary = state === "error" && output !== null ? firstLine(output) : null;
			return {
				variant,
				titleKey,
				summary,
				filePath,
				bodyRaw: argsRaw === "" ? null : argsRaw,
				output,
				errorSummary,
				autoReviewDenial: deriveAutoReviewDenial(block),
				state
			};
		}
		//#endregion
		//#region lib/types/client/tool/models/raw-tool-call.js
		const parsedCalls = /* @__PURE__ */ new WeakMap();
		/**
		* Parse the call head paired with one immutable Tool block.
		* @param block - preparing, dispatched, or settled Tool block.
		* @returns the Tool name and object arguments, or null during preparation or when valid arguments are unavailable.
		*/
		function parsedToolCall(block) {
			if (!("kind" in block) && block.phase === "preparing") return null;
			const cached = parsedCalls.get(block);
			if (cached !== void 0 || parsedCalls.has(block)) return cached ?? null;
			const call = "kind" in block ? block.call : block;
			if (call === null) {
				parsedCalls.set(block, null);
				return null;
			}
			let value;
			try {
				value = JSON.parse(call.argsRaw);
			} catch {
				parsedCalls.set(block, null);
				return null;
			}
			if (typeof value !== "object" || value === null || Array.isArray(value)) {
				parsedCalls.set(block, null);
				return null;
			}
			const parsed = {
				name: call.name,
				args: value
			};
			parsedCalls.set(block, parsed);
			return parsed;
		}
		/**
		* Read the exact single text block consumed by first-party card derivations.
		* @param block - settled Tool result.
		* @returns its text, or undefined for any other content layout.
		*/
		function singleResultText(block) {
			if (block.content.length !== 1) return void 0;
			const only = block.content[0];
			return only?.type === "text" ? only.text : void 0;
		}
		//#endregion
		//#region lib/types/client/tool/models/read-card-model.js
		/** Whether a model-supplied argument is a 1-based line position or count: an integer of at least 1. */
		function positiveInteger$1(value) {
			return typeof value === "number" && Number.isInteger(value) && value >= 1;
		}
		function validReadCall(block) {
			const call = parsedToolCall(block);
			if (call?.name !== "read") return false;
			const { file_path: path, offset, limit } = call.args;
			if (typeof path !== "string" || path.trim() === "") return false;
			if (offset !== void 0 && !positiveInteger$1(offset)) return false;
			if (limit !== void 0 && !positiveInteger$1(limit)) return false;
			return true;
		}
		function readMeta(meta) {
			if (typeof meta !== "object" || meta === null || Array.isArray(meta)) return null;
			const { path, offset, lines, totalLines, lang } = meta;
			if (typeof path !== "string" || typeof offset !== "number" || !Number.isInteger(offset) || offset < 1) return null;
			if (typeof totalLines !== "number" || !Number.isInteger(totalLines) || totalLines < 0 || !Array.isArray(lines)) return null;
			if (lang !== void 0 && typeof lang !== "string") return null;
			const narrowed = [];
			let previous = offset - 1;
			for (const line of lines) {
				if (typeof line !== "object" || line === null || Array.isArray(line)) return null;
				const { number, text } = line;
				if (typeof number !== "number" || !Number.isInteger(number) || number < 1 || number <= previous) return null;
				if (number > totalLines || typeof text !== "string") return null;
				previous = number;
				narrowed.push({
					number,
					text
				});
			}
			return {
				path,
				offset,
				lines: narrowed,
				totalLines,
				...lang === void 0 ? {} : { lang }
			};
		}
		/**
		* The line one `read` call was about, from its arguments.
		*
		* `offset` is the read tool's own 1-based start line, so opening the path can
		* land where the model looked. Available while the call is still running,
		* unlike the persisted metadata, because the arguments carry it. The arguments
		* are model-produced JSON: only an integer of at least 1 is a line, and a call
		* whose `offset` is anything else names none.
		* @param block - running or settled Tool block.
		* @returns the 1-based line, or undefined when the call named none.
		*/
		function readCallLine(block) {
			if (!validReadCall(block)) return void 0;
			const { offset } = parsedToolCall(block)?.args ?? {};
			return positiveInteger$1(offset) ? offset : void 0;
		}
		/**
		* Derive a settled root read card after validating its persisted metadata and
		* model-facing read envelope.
		* @param block - running or settled Tool block.
		* @param sessionCwd - the session workspace root; a workspace-rooted absolute
		*   path label displays relative to it. Absent leaves the path as authored.
		* @param home - host account home; a leftover POSIX home path displays as `~`.
		* @returns the read-card props, or null for the generic path.
		*/
		function readCardModel(block, sessionCwd, home) {
			if (block.parentCallId !== void 0 || !("kind" in block) || block.isError) return null;
			if (!validReadCall(block)) return null;
			const meta = readMeta(block.meta);
			if (meta === null) return null;
			const text = singleResultText(block);
			if (text === void 0) return null;
			if (/^<path>[^\n]*<\/path>\n<type>file<\/type>\n<content>\n([\s\S]*)\n<\/content>$/u.exec(text)?.[1] === void 0) return null;
			return {
				label: abbreviateHomePath(relativizeToCwd(meta.path, sessionCwd), home),
				lines: meta.lines,
				totalLines: meta.totalLines,
				lang: meta.lang
			};
		}
		//#endregion
		//#region lib/types/client/tool/models/diff-card-model.js
		/**
		* Narrow opaque result metadata's `diffs` to well-formed hunks.
		* @param diffs - the metadata field to validate.
		* @returns the validated hunks, or null when the payload is not usable.
		*/
		function narrowDiffs(diffs) {
			if (!Array.isArray(diffs) || diffs.length === 0) return null;
			const out = [];
			for (const hunk of diffs) {
				if (typeof hunk !== "object" || hunk === null) return null;
				const { path, oldText, newText } = hunk;
				if (typeof path !== "string") return null;
				if (oldText !== null && typeof oldText !== "string") return null;
				if (typeof newText !== "string") return null;
				out.push({
					path,
					oldText,
					newText
				});
			}
			return out;
		}
		function intendedDiff(block) {
			const parsed = parsedToolCall(block);
			if (parsed === null) return null;
			if (parsed.name === "str_replace_editor") {
				const { command, path, file_text: fileText, old_str: oldText, new_str: newText } = parsed.args;
				if (typeof path !== "string" || path.trim() === "") return null;
				if (command === "create") {
					if (fileText !== void 0 && typeof fileText !== "string") return null;
					return {
						tool: "str_replace_editor",
						diff: {
							path,
							oldText: null,
							newText: fileText ?? ""
						}
					};
				}
				if (command === "str_replace") {
					if (oldText !== void 0 && typeof oldText !== "string") return null;
					if (newText !== void 0 && typeof newText !== "string") return null;
					return {
						tool: "str_replace_editor",
						diff: {
							path,
							oldText: oldText ?? null,
							newText: newText ?? ""
						}
					};
				}
				return null;
			}
			const { file_path: path } = parsed.args;
			if (typeof path !== "string" || path.trim() === "") return null;
			if (parsed.name === "write") {
				const { content } = parsed.args;
				return typeof content === "string" ? {
					tool: "write",
					diff: {
						path,
						oldText: null,
						newText: content
					}
				} : null;
			}
			if (parsed.name !== "edit") return null;
			const { old_string: oldText, new_string: newText, replace_all: replaceAll } = parsed.args;
			if (typeof oldText !== "string" || typeof newText !== "string") return null;
			if (replaceAll !== void 0 && typeof replaceAll !== "boolean") return null;
			return {
				tool: "edit",
				diff: {
					path,
					oldText: oldText || null,
					newText
				}
			};
		}
		function appliedDiffs(meta) {
			if (typeof meta !== "object" || meta === null || Array.isArray(meta)) return null;
			const diffs = meta.diffs;
			if (!Array.isArray(diffs)) return null;
			if (diffs.length === 0) return "empty";
			return narrowDiffs(diffs);
		}
		/**
		* Derive running diffs for root write/edit and `str_replace_editor`
		* create/replace calls, plus applied settled diffs for root write/edit calls.
		* A successful write with valid empty metadata uses its argument-derived
		* whole-file diff, matching create and identical-overwrite presentation;
		* `str_replace_editor` settles through Generic because it has no result view.
		* @param block - running or settled Tool block.
		* @returns the diff-card props, or null for the generic path.
		*/
		function diffCardModel(block) {
			if (block.parentCallId !== void 0) return null;
			const intended = intendedDiff(block);
			if (intended === null) return null;
			if (!("kind" in block)) return { card: { diffs: [intended.diff] } };
			if (intended.tool === "str_replace_editor") return null;
			if (block.isError) return null;
			const applied = appliedDiffs(block.meta);
			if (applied === null || applied === "empty") return intended.tool === "write" ? { card: { diffs: [intended.diff] } } : null;
			const path = recordedAbsolutePath(block.meta, "path");
			return { card: { diffs: applied.map((diff) => diff.path === path ? {
				...diff,
				path: intended.diff.path
			} : diff) } };
		}
		//#endregion
		//#region lib/types/client/tool/models/search-card-model.js
		function validSearchCall(block) {
			const call = parsedToolCall(block);
			if (call === null) return null;
			const { pattern, path } = call.args;
			if (typeof pattern !== "string") return null;
			if (call.name === "grep" && pattern === "") return null;
			if (call.name === "glob" && pattern.trim() === "") return null;
			if (call.name !== "grep" && call.name !== "glob") return null;
			if (path !== void 0 && (typeof path !== "string" || path.trim() === "")) return null;
			if (call.name === "grep") {
				const { include } = call.args;
				if (include !== void 0 && (typeof include !== "string" || !validInclude(include))) return null;
			}
			return call.name;
		}
		function validInclude(include) {
			if (include.trim() === "" || include.startsWith("!")) return false;
			let braceDepth = 0;
			for (const character of include) if (character === "{") braceDepth += 1;
			else if (character === "}") braceDepth = Math.max(0, braceDepth - 1);
			else if (character === "," && braceDepth === 0) return false;
			return true;
		}
		function searchFiles(value) {
			if (!Array.isArray(value)) return null;
			const files = [];
			for (const file of value) {
				if (typeof file !== "object" || file === null || Array.isArray(file)) return null;
				const { path, matches } = file;
				if (typeof path !== "string" || !Array.isArray(matches)) return null;
				const narrowed = [];
				for (const match of matches) {
					if (typeof match !== "object" || match === null || Array.isArray(match)) return null;
					const { lineNumber, line } = match;
					if (typeof lineNumber !== "number" || !Number.isInteger(lineNumber) || lineNumber < 1) return null;
					if (typeof line !== "string") return null;
					narrowed.push({
						lineNumber,
						line
					});
				}
				files.push({
					path,
					matches: narrowed
				});
			}
			return files;
		}
		function flattenContent(content) {
			const text = content.filter((block) => block.type === "text" && typeof block.text === "string").map((block) => block.text).join("\n");
			return text === "" ? void 0 : text;
		}
		/**
		* Derive a settled root grep/glob card from persisted metadata.
		* @param block - running or settled Tool block.
		* @returns search-card props, or null for the generic path.
		*/
		function searchCardModel(block) {
			if (block.parentCallId !== void 0 || !("kind" in block) || block.isError) return null;
			const tool = validSearchCall(block);
			if (tool === null) return null;
			if (typeof block.meta !== "object" || block.meta === null || Array.isArray(block.meta)) return null;
			const meta = block.meta;
			if (typeof meta.truncated !== "boolean") return null;
			if (typeof meta.total !== "number" || !Number.isInteger(meta.total) || meta.total < 0) return null;
			const common = {
				truncated: meta.truncated,
				total: meta.total
			};
			const recovery = meta.truncated ? flattenContent(block.content) : void 0;
			if (tool === "grep") {
				if (meta.shape !== "matches") return null;
				const files = searchFiles(meta.files);
				return files === null ? null : {
					recovery,
					card: {
						kind: "matches",
						files,
						...common
					}
				};
			}
			if (meta.shape !== "paths" || !Array.isArray(meta.paths)) return null;
			if (!meta.paths.every((path) => typeof path === "string")) return null;
			return {
				recovery,
				card: {
					kind: "paths",
					paths: [...meta.paths],
					...common
				}
			};
		}
		new TextEncoder();
		new TextDecoder();
		/**
		* Standardized, false-precision-safe wording for one {@link Omitted} value —
		* the "may standardize omission wording" half the library owns. `exact` prints
		* the count (`Omitted 3 items`); `unknown` prints NO count because the caller
		* did not provide one. `none` is the empty string.
		*
		* @param omitted The omission metadata from a retainer result.
		* @param unit The noun for the omitted quantity (`items`, `bytes`, `chars`, `lines`).
		* @returns A neutral clause (no trailing space), or `''` when nothing was omitted.
		*/
		function describeOmitted(omitted, unit) {
			switch (omitted.kind) {
				case "none": return "";
				case "exact": return `Omitted ${omitted.count} ${unit}.`;
				case "unknown": return `More ${unit} were omitted.`;
			}
		}
		//#endregion
		//#region ../../spill/spill-policy/src/notice.ts
		/** Browser-safe formatting and recognition of persisted spill-policy notices. */
		const OPEN = "(";
		const CLOSE = ")";
		const LOCATION = " Full formatted result stored at: ";
		const GUIDANCE_SEPARATOR = ". ";
		const SEPARATOR = "\n\n";
		const EXACT_OMISSION = describeOmitted({
			kind: "exact",
			count: 0
		}, "bytes");
		const COUNT_OFFSET = EXACT_OMISSION.indexOf("0");
		const COUNT_SUFFIX = EXACT_OMISSION.slice(COUNT_OFFSET + 1);
		function isOmission(text) {
			const imageNotice = / Omitted ([1-9][0-9]*) images\.$/.exec(text);
			if (imageNotice !== null) {
				if (!Number.isSafeInteger(Number(imageNotice[1]))) return false;
				text = text.slice(0, imageNotice.index);
			}
			if (text === describeOmitted({ kind: "none" }, "bytes") || text === describeOmitted({ kind: "unknown" }, "bytes")) return true;
			const count = Number(text.slice(COUNT_OFFSET, text.length - COUNT_SUFFIX.length));
			return Number.isSafeInteger(count) && count >= 0 && text === describeOmitted({
				kind: "exact",
				count
			}, "bytes");
		}
		/**
		* Recognize a final spill-policy notice in persisted text, including notice-only output.
		* This identifies the text convention, not authenticated tool-output origin.
		* @param text - complete recorded text result.
		* @returns whether a complete notice occupies the end of the result.
		*/
		function hasSpillNotice(text) {
			if (!text.endsWith(CLOSE)) return false;
			let start = 0;
			while (true) {
				const next = text.indexOf(`${SEPARATOR}${OPEN}`, start);
				const candidate = text.slice(start, next < 0 ? -1 : next);
				const location = candidate.indexOf(LOCATION, 1);
				if (candidate.startsWith(OPEN) && location >= 0 && isOmission(candidate.slice(1, location))) return text.indexOf(GUIDANCE_SEPARATOR, start + location + 34) >= 0;
				if (next < 0) return false;
				start = next + 2;
			}
		}
		//#endregion
		//#region lib/types/client/tool/models/terminal-card-model.js
		/**
		* Build the TerminalBlock display copy from the conversation locale seat —
		* the one place the primitive's label surface pairs with this package's
		* dictionary, shared by every terminal render site (chat row, bash row,
		* details panel).
		* @param t - the render site's conversation locale seat.
		* @returns the full label set for {@link TerminalBlockProps}'s `labels`.
		*/
		function terminalBlockLabels(t) {
			return {
				commandLine: (line) => t("terminal.commandLine", { n: line }),
				signal: (signal) => t("terminal.signal", { signal }),
				exitCode: (code) => t("terminal.exitCode", { code }),
				noExitCode: t("terminal.noExitCode"),
				running: t("terminal.running"),
				failed: t("terminal.failed"),
				done: t("terminal.done"),
				copy: t("copy"),
				copied: t("copied"),
				noOutput: t("terminal.noOutput"),
				collapseAria: t("terminal.collapseAria"),
				collapse: t("collapse"),
				expandAria: (hidden) => t("terminal.expandAria", { n: hidden }),
				expand: (hidden) => t("terminal.expandRest", { n: hidden })
			};
		}
		/**
		* Resolve locale-owned `terminal_send` copy while preserving Tool-authored
		* shell commands and descriptions verbatim.
		* @param model - locale-neutral terminal card data.
		* @param t - the render site's conversation locale seat.
		* @returns terminal props and description ready for rendering.
		*/
		function localizeTerminalCardModel(model, t) {
			if (model.copy.kind === "shell") return {
				card: {
					command: model.copy.command,
					...model.card
				},
				description: model.copy.description
			};
			return {
				card: {
					command: model.copy.text === "" ? t("terminal.sendInput") : model.copy.text,
					...model.card
				},
				description: t("terminal.session", { sessionId: model.copy.sessionId })
			};
		}
		/**
		* True when a settled terminal card reports a failing exit — a non-zero code,
		* an explicitly missing exit code, or a terminating signal. The bash tool settles
		* a failing command as a completed call (`isError` stays false: the exit status is result data), so
		* the row retains that failure state alongside its exit capsule.
		* @param model - a derived terminal card.
		* @returns whether the card's exit status is a failure.
		*/
		function terminalFailed(model) {
			const { exitCode, signal, running } = model.card;
			return running !== true && (exitCode !== void 0 && exitCode !== 0 || signal !== void 0);
		}
		/**
		* Localize a settled foreground command's exit status without inventing a code.
		* @param model - terminal card, absent for generic execution errors.
		* @param t - conversation locale.
		* @returns the capsule label, or null for running, background, or successful calls.
		*/
		function terminalExitLabel(model, t) {
			if (model == null || model.card.background || !terminalFailed(model)) return null;
			const { exitCode, signal } = model.card;
			if (signal !== void 0) return t("terminal.signal", { signal });
			if (exitCode == null) return t("terminal.noExitCode");
			return t("terminal.exitCode", { code: exitCode });
		}
		/**
		* Resolve a shell call's workdir for display: an absolute path is used as-is,
		* a relative one joins under the session workspace, and an omitted one is the
		* session workspace. Without a session cwd, a relative path stays as authored
		* and an omitted one stays absent.
		* @param workdir - the raw call's workdir, if any.
		* @param sessionCwd - the session workspace root, if the caller knows it.
		* @returns the working directory for the prompt label, or undefined.
		*/
		function resolveTerminalCwd(workdir, sessionCwd) {
			if (workdir === void 0 || workdir === "") return sessionCwd;
			if (sessionCwd === void 0 || sessionCwd === "") return normalizeSegments(workdir);
			return normalizeSegments(resolveWorkspacePath(sessionCwd, workdir));
		}
		/**
		* Collapse `.` and `..` segments so the prompt label names the directory the
		* command actually ran in. The bash executor resolves the workdir before
		* running, so a joined `/w/app/..` must display as `w`, not as `..`. Separators
		* are preserved as authored (a Windows path keeps its backslashes) because this
		* value is only ever displayed; a `..` that would climb past the root is
		* dropped, which is what a filesystem does with it. A UNC path's `server` and
		* `share` are part of its root, not poppable segments: Windows cannot climb
		* above a share, so `\\\\server\\share` with a `..` stays there.
		* @param path - a joined or absolute path, possibly carrying `.`/`..` segments.
		* @returns the same path with those segments resolved.
		*/
		function normalizeSegments(path) {
			if (!/(?:^|[/\\])\.\.?(?:[/\\]|$)/.test(path)) return path;
			const unc = /^[/\\]{2}([^/\\]+)[/\\]+([^/\\]+)/.exec(path);
			if (unc !== null) {
				const [matched, server, share] = unc;
				const root = `\\\\${String(server)}\\${String(share)}`;
				const rest = collapse(path.slice(matched.length), true);
				return rest === "" ? root : `${root}\\${rest}`;
			}
			const separator = path.includes("\\") && !path.includes("/") ? "\\" : "/";
			const rooted = /^[/\\]/.test(path);
			const drive = /^[A-Za-z]:/.exec(path)?.[0] ?? "";
			const body = collapse(path.slice(drive.length), rooted || drive !== "", separator);
			const leading = rooted ? separator : "";
			return drive === "" ? `${leading}${body}` : `${drive}${rooted ? leading : separator}${body}`;
		}
		/**
		* Collapse the `.`/`..` segments of a path body against a known root state.
		* @param body - the path after any drive letter or UNC root.
		* @param rooted - the body hangs off a root, so a `..` at its top is dropped
		*   the way a filesystem drops one; without a root the `..` is kept, since it
		*   stays meaningful against a cwd this function cannot see.
		* @param separator - separator to rejoin with (default `/`).
		* @returns the collapsed body, without leading or trailing separators.
		*/
		function collapse(body, rooted, separator = "/") {
			const kept = [];
			for (const segment of body.split(/[/\\]/)) {
				if (segment === "" || segment === ".") continue;
				if (segment === "..") {
					if (kept.length > 0 && kept[kept.length - 1] !== "..") kept.pop();
					else if (!rooted) kept.push(segment);
					continue;
				}
				kept.push(segment);
			}
			return kept.join(separator);
		}
		function shellCall(name, args) {
			if (name !== "bash" && name !== "pwsh") return null;
			const { command, description, timeoutMs, workdir, run_in_background: background } = args;
			if (typeof command !== "string" || command.trim() === "") return null;
			if (timeoutMs !== void 0 && (typeof timeoutMs !== "number" || !Number.isFinite(timeoutMs) || timeoutMs <= 0)) return null;
			if (workdir !== void 0 && typeof workdir !== "string") return null;
			if (background !== void 0 && typeof background !== "boolean") return null;
			if (description === void 0) return {
				kind: "shell",
				command,
				description: void 0,
				workdir: void 0,
				persistent: true,
				background: false
			};
			if (typeof description !== "string" || description.trim() === "") return null;
			return {
				kind: "shell",
				command,
				description,
				workdir,
				persistent: false,
				background: background === true
			};
		}
		/**
		* Identify a background shell launch whose result acknowledges a job, not its exit.
		* @param block - Tool block at any call stage.
		* @returns whether the call requests a background shell job.
		*/
		function isBackgroundShellCall(block) {
			const parsed = parsedToolCall(block);
			return parsed !== null && shellCall(parsed.name, parsed.args)?.background === true;
		}
		/**
		* Identify a settled root call from the persistent Bash or PowerShell tool.
		* Its result stays on the generic input/output path because the persistent
		* shell can report resets and partial output without one process exit status.
		* @param block - running or settled Tool block.
		* @returns whether the block is a settled persistent-shell call.
		*/
		function isSettledPersistentShellCall(block) {
			if (!("kind" in block) || block.parentCallId !== void 0) return false;
			const parsed = parsedToolCall(block);
			if (parsed === null) return false;
			return shellCall(parsed.name, parsed.args)?.persistent === true;
		}
		/**
		* Identify a settled foreground shell preview whose spill footer can hide the exit marker.
		* @param block - running or settled Tool block.
		* @returns whether the shell output must remain generic without an inferred exit status.
		*/
		function isSpilledShellCall(block) {
			if (!("kind" in block)) return false;
			const parsed = parsedToolCall(block);
			if (parsed === null) return false;
			const call = shellCall(parsed.name, parsed.args);
			if (call === null || call.background) return false;
			const output = singleResultText(block);
			return output !== void 0 && hasSpillNotice(output);
		}
		function terminalSendCall(name, args) {
			if (name !== "terminal_send") return null;
			const { sessionId, text, submit, run_in_background: background } = args;
			if (typeof sessionId !== "string" || sessionId === "" || typeof text !== "string") return null;
			if (submit !== void 0 && typeof submit !== "boolean") return null;
			if (background !== void 0 && typeof background !== "boolean") return null;
			return {
				kind: "terminal-send",
				text,
				sessionId,
				background: background === true
			};
		}
		/**
		* Parse the marker literals owned by `@deepseek-ai/dsh-shell/render` without
		* importing that Host-only package into the Client dependency graph.
		* @param text - rendered shell result text.
		* @returns output with a trailing exit-code or signal marker extracted.
		*/
		function parseExitStatus(text) {
			const signal = /\n\[killed by signal: ([^\]\n]+)\]$/.exec(text);
			if (signal?.[1] !== void 0) return {
				output: text.slice(0, signal.index),
				signal: signal[1]
			};
			const exit = /\n\[exit code: (-?\d+|null)\]$/.exec(text);
			if (exit?.[1] !== void 0) return {
				output: text.slice(0, exit.index),
				exitCode: exit[1] === "null" ? null : Number(exit[1])
			};
			return {
				output: text,
				exitCode: 0
			};
		}
		/**
		* Derive terminal props for supported shell and terminal-send calls, including
		* nested PTC dispatch calls. Standard shell results parse their final status
		* marker. Successful background shell launches retain only their command after
		* settlement; persistent shell results, spill previews, background terminal sends,
		* errors, and malformed input use the generic path. {@link isSettledPersistentShellCall} lets that generic
		* persistent result remain expandable without inventing one process status.
		* @param block - running or settled Tool block.
		* @param sessionCwd - original workspace root used only for old results without recorded cwd.
		* @returns locale-neutral terminal-card data, or null for the generic path.
		*/
		function terminalCardModel(block, sessionCwd) {
			const parsed = parsedToolCall(block);
			if (parsed === null) return null;
			const call = shellCall(parsed.name, parsed.args) ?? terminalSendCall(parsed.name, parsed.args);
			if (call === null || call.kind === "terminal-send" && call.background) return null;
			const copy = call.kind === "shell" ? {
				kind: "shell",
				command: call.command,
				description: call.description
			} : {
				kind: "terminal-send",
				text: call.text,
				sessionId: call.sessionId
			};
			const workdir = call.kind === "shell" ? call.workdir : void 0;
			const absoluteRequestCwd = workdir !== void 0 && isAbsoluteWorkspacePath(workdir) ? normalizeSegments(workdir) : void 0;
			const cwd = "kind" in block ? recordedAbsolutePath(block.meta, "cwd") ?? (call.kind === "shell" && block.parentCallId === void 0 ? resolveTerminalCwd(workdir, sessionCwd) : absoluteRequestCwd) : absoluteRequestCwd;
			if (!("kind" in block)) return {
				copy,
				card: {
					cwd,
					output: void 0,
					exitCode: void 0,
					signal: void 0,
					running: true,
					...call.kind === "shell" && call.background ? { background: call.background } : {}
				}
			};
			if (block.isError || call.kind === "shell" && call.persistent || isSpilledShellCall(block)) return null;
			if (call.kind === "shell" && call.background) return {
				copy,
				card: {
					cwd,
					running: false,
					background: call.background
				}
			};
			const output = singleResultText(block);
			if (output === void 0) return null;
			const status = call.kind === "terminal-send" ? { output } : parseExitStatus(output);
			return {
				copy,
				card: {
					cwd,
					output: status.output,
					exitCode: status.exitCode,
					signal: status.signal,
					running: false
				}
			};
		}
		//#endregion
		//#region lib/types/client/tool/models/web-card-model.js
		function validWebCall(block) {
			const call = parsedToolCall(block);
			if (call === null) return null;
			if (call.name === "web_search") {
				const { queries } = call.args;
				if (!Array.isArray(queries) || queries.length === 0) return null;
				return queries.every((query) => typeof query === "string" && query.trim() !== "") ? call.name : null;
			}
			if (call.name === "web_fetch") {
				const { url } = call.args;
				return typeof url === "string" && url.trim() !== "" ? call.name : null;
			}
			return null;
		}
		function webSources(value) {
			if (!Array.isArray(value)) return null;
			const sources = [];
			for (const source of value) {
				if (typeof source !== "object" || source === null || Array.isArray(source)) return null;
				const { url, title, snippet, publishedAt } = source;
				if (typeof url !== "string") return null;
				if (title !== void 0 && typeof title !== "string") return null;
				if (snippet !== void 0 && typeof snippet !== "string") return null;
				if (publishedAt !== void 0 && typeof publishedAt !== "string") return null;
				sources.push({
					url,
					...title === void 0 ? {} : { title },
					...snippet === void 0 ? {} : { snippet },
					...publishedAt === void 0 ? {} : { publishedAt }
				});
			}
			return sources;
		}
		/**
		* Derive a settled root web-search or web-fetch card from persisted metadata.
		* @param block - running or settled Tool block.
		* @returns web-card props, or null for the generic path.
		*/
		function webCardModel(block) {
			if (block.parentCallId !== void 0 || !("kind" in block) || block.isError) return null;
			const tool = validWebCall(block);
			if (tool === null || typeof block.meta !== "object" || block.meta === null || Array.isArray(block.meta)) return null;
			const meta = block.meta;
			if (typeof meta.truncated !== "boolean") return null;
			if (tool === "web_search") {
				const sources = webSources(meta.sources);
				if (sources === null || meta.answer !== void 0 && typeof meta.answer !== "string") return null;
				return {
					kind: "search",
					answer: meta.answer,
					sources,
					truncated: meta.truncated
				};
			}
			if (typeof meta.url !== "string") return null;
			if (typeof meta.statusCode !== "number" || !Number.isInteger(meta.statusCode)) return null;
			return {
				kind: "fetch",
				url: meta.url,
				statusCode: meta.statusCode,
				truncated: meta.truncated
			};
		}
		/**
		* Read the openable URL of a web_fetch call from its arguments.
		* @param block - running or settled Tool block.
		* @returns the http(s) URL, or undefined for another tool, protocol, or unparsable argument.
		*/
		function webFetchHref(block) {
			const call = parsedToolCall(block);
			if (call?.name !== "web_fetch" || typeof call.args.url !== "string") return void 0;
			const { url } = call.args;
			try {
				const { protocol } = new URL(url);
				return protocol === "http:" || protocol === "https:" ? url : void 0;
			} catch {
				return;
			}
		}
		//#endregion
		//#region lib/types/client/tool/models/auto-review-denial.js
		/**
		* Normalize only the user-visible copy; the durable error keeps the raw reason.
		* @param reason - raw persisted reviewer reason, or null when none was recorded.
		* @returns one display line, or null when the reason has no displayable text.
		*/
		function normalizeAutoReviewReason(reason) {
			if (reason === null) return null;
			const normalized = reason.trim().replace(/[\r\n\u2028\u2029]+/gu, " ");
			return normalized === "" ? null : normalized;
		}
		/**
		* Resolve the collapsed identity and the single expanded OUT line.
		* @param denial - locale-neutral persisted denial facts.
		* @param t - conversation-namespace translator.
		* @returns localized summary and output text for the Tool row.
		*/
		function localizeAutoReviewDenial(denial, t) {
			const reason = normalizeAutoReviewReason(denial.reason) ?? t("tool.autoReviewReasonFallback");
			return {
				summary: t("tool.autoReviewRejected"),
				output: t("tool.autoReviewNotExecuted", { reason })
			};
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
		//#region lib/types/client/tool/models/primitive-labels.js
		/** Localized copy adapters for Cordis-free UI primitives used by Tool cards. */
		/**
		* Localize the shared code-card toolbar.
		* @param t - Conversation locale seat.
		* @returns Language fallback and wrapping actions.
		*/
		function codeToolbarLabels(t) {
			return {
				codeLabel: t("codeBlock.title"),
				wrapLabel: t("codeBlock.wrap"),
				unwrapLabel: t("codeBlock.unwrap")
			};
		}
		/**
		* Build localized Markdown chrome labels.
		* @param t - Conversation locale seat.
		* @returns Markdown chrome labels.
		*/
		function markdownLabels(t) {
			return {
				code: {
					copyLabel: t("copy"),
					copiedLabel: t("copied"),
					toolbarLabels: codeToolbarLabels(t)
				},
				footnotes: t("markdown.footnotes")
			};
		}
		/**
		* Build localized diff-card chrome labels.
		* @param t - Conversation locale seat.
		* @returns Diff-card chrome labels.
		*/
		function diffBlockLabels(t) {
			return {
				...codeToolbarLabels(t),
				copy: t("copy"),
				copied: t("copied"),
				collapseAria: t("diff.collapseAria"),
				expandAria: (count) => t("diff.expandAria", { count }),
				collapse: t("collapse"),
				expand: (count) => t("diff.expandRest", { count })
			};
		}
		/**
		* Build localized read-card chrome labels.
		* @param t - Conversation locale seat.
		* @returns Read-card chrome labels.
		*/
		function readBlockLabels(t) {
			return {
				...codeToolbarLabels(t),
				window: (shown, total) => t("read.window", {
					shown,
					total
				}),
				copy: t("copy"),
				copied: t("copied"),
				collapseAria: t("read.collapseAria"),
				expandAria: (count) => t("read.expandAria", { count }),
				collapse: t("collapse"),
				expand: (count) => t("read.expandRest", { count })
			};
		}
		/**
		* Build localized search-card chrome labels.
		* @param t - Conversation locale seat.
		* @returns Search-card chrome labels.
		*/
		function searchBlockLabels(t) {
			return {
				pathsSummary: (shown, total, truncated) => t(truncated ? "search.paths.truncated" : "search.paths", {
					shown,
					total
				}),
				matchesSummary: (shown, total, files, truncated) => t(truncated ? "search.matches.truncated" : "search.matches", {
					shown,
					total,
					files
				}),
				copy: t("copy"),
				copied: t("copied"),
				noResults: t("search.noResults"),
				collapseAria: t("search.collapseAria"),
				expandAria: (count) => t("search.expandAria", { count }),
				collapse: t("collapse"),
				expand: (count) => t("search.expandRest", { count })
			};
		}
		/**
		* Build localized web-card chrome labels.
		* @param t - Conversation locale seat.
		* @returns Web-card chrome labels.
		*/
		function webBlockLabels(t) {
			return {
				noResults: t("web.noResults"),
				sourcesTruncated: t("web.sourcesTruncated"),
				http: t("web.http"),
				contentTruncated: t("web.contentTruncated"),
				markdown: markdownLabels(t)
			};
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-tool/src/client/tool/components/AskQuestionCard.module.css.mjs
		const css$6 = ".nvl2CG_card{border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-base);flex-direction:column;gap:16px;max-height:360px;margin:4px 0 4px 4px;padding:16px 20px;display:flex;overflow-y:auto}.nvl2CG_item{flex-direction:column;gap:2px;min-width:0;display:flex}.nvl2CG_question,.nvl2CG_answer{white-space:pre-wrap;overflow-wrap:anywhere;font-size:var(--dsh-content-font-size,14px);line-height:calc(24px + var(--dsh-content-font-delta,0px));margin:0}.nvl2CG_question{color:var(--dsw-alias-label-tertiary)}.nvl2CG_answer{color:var(--dsw-alias-label-primary)}.nvl2CG_answerLine{display:block}.nvl2CG_skipped{color:var(--dsw-alias-label-tertiary)}.nvl2CG_verdict{color:var(--dsw-alias-label-primary);font-size:var(--dsh-content-font-size,14px);line-height:calc(24px + var(--dsh-content-font-delta,0px));margin:0}.nvl2CG_questionList{flex-direction:column;gap:8px;margin:0;padding-left:20px;display:flex}.nvl2CG_unansweredQuestion{color:var(--dsw-alias-label-tertiary);white-space:pre-wrap;overflow-wrap:anywhere;font-size:var(--dsh-content-font-size,14px);line-height:calc(24px + var(--dsh-content-font-delta,0px))}";
		const tagId$6 = "@deepseek-ai/dsh-client-ui-tool/AskQuestionCard.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$6) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-tool";
			tag.dataset.pluginCss = tagId$6;
			tag.textContent = css$6;
			document.head.appendChild(tag);
		}
		var AskQuestionCard_module_css_default = {
			"answer": "nvl2CG_answer",
			"answerLine": "nvl2CG_answerLine",
			"card": "nvl2CG_card",
			"item": "nvl2CG_item",
			"question": "nvl2CG_question",
			"questionList": "nvl2CG_questionList",
			"skipped": "nvl2CG_skipped",
			"unansweredQuestion": "nvl2CG_unansweredQuestion",
			"verdict": "nvl2CG_verdict"
		};
		//#endregion
		//#region lib/types/client/tool/components/AskQuestionCard.js
		/**
		* Render a validated ask-user transcript from plain card data.
		* @param props - Localized transcript card data.
		* @returns the readable answered or unanswered question list.
		*/
		function AskQuestionCard({ card }) {
			if (card.kind === "unanswered") return (0, react_jsx_runtime.jsxs)("div", {
				className: AskQuestionCard_module_css_default.card,
				children: [(0, react_jsx_runtime.jsx)("p", {
					className: AskQuestionCard_module_css_default.verdict,
					children: card.verdict
				}), (0, react_jsx_runtime.jsx)("ul", {
					className: AskQuestionCard_module_css_default.questionList,
					children: card.questions.map((question) => (0, react_jsx_runtime.jsx)("li", {
						className: AskQuestionCard_module_css_default.unansweredQuestion,
						children: question.question
					}, question.id))
				})]
			});
			return (0, react_jsx_runtime.jsx)("dl", {
				className: AskQuestionCard_module_css_default.card,
				children: card.questions.map((question) => (0, react_jsx_runtime.jsxs)("div", {
					className: AskQuestionCard_module_css_default.item,
					children: [(0, react_jsx_runtime.jsx)("dt", {
						className: AskQuestionCard_module_css_default.question,
						children: question.question
					}), (0, react_jsx_runtime.jsx)("dd", {
						className: AskQuestionCard_module_css_default.answer,
						children: question.answers.length === 0 ? (0, react_jsx_runtime.jsx)("span", {
							className: AskQuestionCard_module_css_default.skipped,
							children: card.skippedLabel
						}) : question.answers.map((answer, index) => (0, react_jsx_runtime.jsx)("span", {
							className: AskQuestionCard_module_css_default.answerLine,
							children: answer
						}, `${question.id}-${String(index)}`))
					})]
				}, question.id))
			});
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-tool/src/client/tool/components/ToolDetails.module.css.mjs
		const css$5 = "._2uF35G_root{border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-markdown-code-block);color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xs-13);margin:4px 0 4px 4px;overflow:hidden}._2uF35G_list{max-height:320px;margin:0;padding:0;list-style:none;overflow-y:auto}._2uF35G_item,._2uF35G_empty{margin:0;padding:10px 14px}._2uF35G_item+._2uF35G_item{border-top:.5px solid var(--dsw-alias-border-l2)}._2uF35G_root[data-inspect]:not([data-caption])>._2uF35G_list>._2uF35G_item,._2uF35G_root[data-inspect]:not([data-caption]) ._2uF35G_empty,._2uF35G_root[data-inspect] ._2uF35G_caption{padding-inline-end:88px}._2uF35G_caption{color:var(--dsw-alias-label-caption);padding:10px 14px 6px;font-size:12px}._2uF35G_heading{flex-wrap:wrap;align-items:baseline;gap:8px;display:flex}._2uF35G_text{white-space:pre-wrap;overflow-wrap:anywhere;flex:1;min-width:0}._2uF35G_status{flex:none;justify-content:center;align-self:flex-start;align-items:center;width:14px;height:18px;font-size:16px;line-height:18px;display:inline-flex}._2uF35G_pending{box-sizing:border-box;border:1px solid var(--dsw-alias-label-tertiary);border-radius:2px;width:10px;height:10px}._2uF35G_heading:has(._2uF35G_statusText) ._2uF35G_text{flex-basis:12em}._2uF35G_statusText{color:var(--dsw-alias-label-caption);white-space:nowrap;margin-inline-start:auto;font-size:12px}._2uF35G_previous,._2uF35G_unchanged{color:var(--dsw-alias-label-tertiary)}._2uF35G_item[data-change=added] ._2uF35G_status{color:var(--dsw-alias-state-success-primary)}._2uF35G_item[data-change=removed] ._2uF35G_status{color:var(--dsw-alias-state-error-primary)}._2uF35G_item[data-change=removed] ._2uF35G_text{color:var(--dsw-alias-label-tertiary);text-decoration:line-through}._2uF35G_unchanged{border-top:.5px solid var(--dsw-alias-border-l2)}._2uF35G_unchanged summary{cursor:pointer;align-items:center;gap:6px;padding:9px 14px;list-style:none;display:flex}._2uF35G_unchanged summary::-webkit-details-marker{display:none}._2uF35G_unchanged[open] summary svg{transform:rotate(90deg)}._2uF35G_fields{margin:0}._2uF35G_heading+._2uF35G_fields{margin-top:6px}._2uF35G_field{grid-template-columns:5.5em minmax(0,1fr);gap:12px;display:grid}._2uF35G_field+._2uF35G_field{margin-top:4px}._2uF35G_field dt{color:var(--dsw-alias-label-caption)}._2uF35G_field dd{white-space:pre-wrap;overflow-wrap:anywhere;margin:0}._2uF35G_badge{color:var(--dsw-alias-label-caption);flex:none;align-items:center;gap:5px;font-size:12px;display:inline-flex}._2uF35G_badge:before{content:\"\";corner-shape:round;background:currentColor;border-radius:50%;width:5px;height:5px}._2uF35G_badge[data-tone=info]{color:var(--dsw-alias-state-business-primary)}._2uF35G_badge[data-tone=success]{color:var(--dsw-alias-state-success-primary)}._2uF35G_badge[data-tone=warning]{color:var(--dsw-alias-state-warn-primary)}._2uF35G_badge[data-tone=error]{color:var(--dsw-alias-state-error-primary)}._2uF35G_subtitle{color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere;margin-top:3px;font-size:12px}._2uF35G_description{color:var(--dsw-alias-label-caption);white-space:pre-wrap;overflow-wrap:anywhere;margin:6px 0}._2uF35G_lines{white-space:pre-wrap;overflow-wrap:anywhere;margin:6px 0 0;padding-inline-start:18px}._2uF35G_lines li+li{margin-top:4px}._2uF35G_group{border-top:.5px solid var(--dsw-alias-border-l2);margin-top:8px}._2uF35G_group>summary{color:var(--dsw-alias-label-caption);cursor:pointer;overflow-wrap:anywhere;align-items:center;gap:6px;padding:8px 0 0;list-style:none;display:flex}._2uF35G_group>summary::-webkit-details-marker{display:none}._2uF35G_group[open]>summary svg{transform:rotate(90deg)}._2uF35G_group>summary svg{flex:none}._2uF35G_group ._2uF35G_list{max-height:none;overflow:visible}._2uF35G_group ._2uF35G_item{padding:9px 0 2px 20px}._2uF35G_prose,._2uF35G_code{max-width:100%;font-size:13px}._2uF35G_prose{margin-top:8px}._2uF35G_root ._2uF35G_item>._2uF35G_code{max-height:240px;margin:8px 0 0;overflow:auto}._2uF35G_root ._2uF35G_item:has(>._2uF35G_code:only-child){padding:0}._2uF35G_root ._2uF35G_item>._2uF35G_code:only-child{margin:0}._2uF35G_root ._2uF35G_group ._2uF35G_item:has(>._2uF35G_code:only-child){padding:4px 0 0 20px}._2uF35G_path{min-width:0;color:inherit;font:inherit;text-align:start;overflow-wrap:anywhere;cursor:pointer;background:0 0;border:none;flex:1;padding:0}@media (hover:hover){._2uF35G_path:hover{text-decoration:underline}}._2uF35G_path:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:3px}";
		const tagId$5 = "@deepseek-ai/dsh-client-ui-tool/ToolDetails.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$5) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-tool";
			tag.dataset.pluginCss = tagId$5;
			tag.textContent = css$5;
			document.head.appendChild(tag);
		}
		var ToolDetails_module_css_default = {
			"badge": "_2uF35G_badge",
			"caption": "_2uF35G_caption",
			"code": "_2uF35G_code",
			"description": "_2uF35G_description",
			"empty": "_2uF35G_empty",
			"field": "_2uF35G_field",
			"fields": "_2uF35G_fields",
			"group": "_2uF35G_group",
			"heading": "_2uF35G_heading",
			"item": "_2uF35G_item",
			"lines": "_2uF35G_lines",
			"list": "_2uF35G_list",
			"path": "_2uF35G_path",
			"pending": "_2uF35G_pending",
			"previous": "_2uF35G_previous",
			"prose": "_2uF35G_prose",
			"root": "_2uF35G_root",
			"status": "_2uF35G_status",
			"statusText": "_2uF35G_statusText",
			"subtitle": "_2uF35G_subtitle",
			"text": "_2uF35G_text",
			"unchanged": "_2uF35G_unchanged"
		};
		//#endregion
		//#region lib/types/client/tool/components/ToolDetails.js
		/** Compact, read-only fields and lists for recorded Tool results. */
		function DetailItem({ item, t, onOpenFile }) {
			const status = item.status;
			return (0, react_jsx_runtime.jsxs)("li", {
				className: ToolDetails_module_css_default.item,
				"data-change": item.change?.value,
				children: [
					item.title !== void 0 && (0, react_jsx_runtime.jsxs)("div", {
						className: ToolDetails_module_css_default.heading,
						children: [
							status !== void 0 && (0, react_jsx_runtime.jsx)("span", {
								className: ToolDetails_module_css_default.status,
								role: "img",
								"aria-label": item.change?.label ?? status.label,
								children: item.change?.value === "added" ? "+" : item.change?.value === "removed" ? "−" : status.value === "completed" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, { size: 14 }) : status.value === "in_progress" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlayOutlineRegular, { size: 14 }) : (0, react_jsx_runtime.jsx)("span", { className: ToolDetails_module_css_default.pending })
							}),
							item.location !== void 0 && onOpenFile !== void 0 ? (0, react_jsx_runtime.jsx)("button", {
								className: ToolDetails_module_css_default.path,
								type: "button",
								onClick: () => {
									const location = item.location;
									if (location !== void 0) onOpenFile(location.path, location.line === void 0 ? void 0 : { line: location.line });
								},
								children: item.title
							}) : (0, react_jsx_runtime.jsx)("span", {
								className: ToolDetails_module_css_default.text,
								children: item.title
							}),
							item.badge !== void 0 && (0, react_jsx_runtime.jsx)("span", {
								className: ToolDetails_module_css_default.badge,
								"data-tone": item.badge.tone,
								children: item.badge.label
							}),
							status !== void 0 && (0, react_jsx_runtime.jsxs)("span", {
								className: ToolDetails_module_css_default.statusText,
								children: [
									item.previousStatus !== void 0 && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
										className: ToolDetails_module_css_default.previous,
										children: item.previousStatus
									}), (0, react_jsx_runtime.jsx)("span", { children: " → " })] }),
									(0, react_jsx_runtime.jsx)("span", { children: status.label }),
									item.change?.value === "updated" && item.previousStatus === void 0 && (0, react_jsx_runtime.jsxs)("span", { children: [" · ", item.change.label] })
								]
							})
						]
					}),
					item.subtitle !== void 0 && (0, react_jsx_runtime.jsx)("div", {
						className: ToolDetails_module_css_default.subtitle,
						children: item.subtitle
					}),
					item.description !== void 0 && (0, react_jsx_runtime.jsx)("p", {
						className: ToolDetails_module_css_default.description,
						children: item.description
					}),
					item.fields.length > 0 && (0, react_jsx_runtime.jsx)("dl", {
						className: ToolDetails_module_css_default.fields,
						children: item.fields.map((field) => (0, react_jsx_runtime.jsxs)("div", {
							className: ToolDetails_module_css_default.field,
							children: [(0, react_jsx_runtime.jsx)("dt", { children: field.label }), (0, react_jsx_runtime.jsx)("dd", { children: field.value })]
						}, field.label))
					}),
					item.lines !== void 0 && (0, react_jsx_runtime.jsx)("ul", {
						className: ToolDetails_module_css_default.lines,
						children: item.lines.map((line, index) => (0, react_jsx_runtime.jsx)("li", { children: line }, index))
					}),
					item.markdown !== void 0 && (0, react_jsx_runtime.jsx)("div", {
						className: ToolDetails_module_css_default.prose,
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
							text: item.markdown,
							labels: markdownLabels(t)
						})
					}),
					item.code !== void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.CodeBlock, {
						toolbarLabels: codeToolbarLabels(t),
						className: ToolDetails_module_css_default.code,
						code: item.code.text,
						lang: item.code.language,
						copyLabel: t("copy"),
						copiedLabel: t("copied")
					}),
					item.groups?.map((group, index) => (0, react_jsx_runtime.jsxs)("details", {
						className: ToolDetails_module_css_default.group,
						children: [(0, react_jsx_runtime.jsxs)("summary", { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {}), (0, react_jsx_runtime.jsx)("span", { children: group.label })] }), (0, react_jsx_runtime.jsx)("ul", {
							className: ToolDetails_module_css_default.list,
							children: group.items.map((child, childIndex) => (0, react_jsx_runtime.jsx)(DetailItem, {
								item: child,
								t,
								onOpenFile
							}, childIndex))
						})]
					}, index))
				]
			});
		}
		/**
		* Render recorded values with local disclosures, copy controls, and file navigation.
		* @param props.model - Localized fields or list items; an empty list uses its empty label.
		* @param props.hasInspect - Reserve space for the row's upper-right Inspect button.
		* @param props.t - Conversation dictionary for shared Markdown and code controls.
		* @param props.onOpenFile - Open a recorded file location in the session workspace.
		* @returns The expanded detail body.
		*/
		function ToolDetails({ model, hasInspect = false, t, onOpenFile }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: ToolDetails_module_css_default.root,
				"data-inspect": hasInspect || void 0,
				"data-caption": model.caption !== void 0 || void 0,
				children: [
					model.caption !== void 0 && (0, react_jsx_runtime.jsx)("div", {
						className: ToolDetails_module_css_default.caption,
						children: model.caption
					}),
					model.items.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
						className: ToolDetails_module_css_default.empty,
						children: model.empty
					}) : (0, react_jsx_runtime.jsx)("ul", {
						className: ToolDetails_module_css_default.list,
						children: model.items.map((item, index) => (0, react_jsx_runtime.jsx)(DetailItem, {
							item,
							t,
							onOpenFile
						}, index))
					}),
					model.unchanged !== void 0 && (0, react_jsx_runtime.jsxs)("details", {
						className: ToolDetails_module_css_default.unchanged,
						children: [(0, react_jsx_runtime.jsxs)("summary", { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {}), model.unchanged.label] }), (0, react_jsx_runtime.jsx)("ul", {
							className: ToolDetails_module_css_default.list,
							children: model.unchanged.items.map((item, index) => (0, react_jsx_runtime.jsx)(DetailItem, {
								item,
								t,
								onOpenFile
							}, index))
						})]
					})
				]
			});
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-tool/src/client/tool/components/ExitCodeBadge.module.css.mjs
		const css$4 = ".xGbbRW_badge{flex:none;gap:5px;margin-left:8px}.xGbbRW_dot{corner-shape:round;background:var(--dsw-alias-state-error-primary);border-radius:50%;flex:none;width:4px;height:4px}";
		const tagId$4 = "@deepseek-ai/dsh-client-ui-tool/ExitCodeBadge.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$4) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-tool";
			tag.dataset.pluginCss = tagId$4;
			tag.textContent = css$4;
			document.head.appendChild(tag);
		}
		var ExitCodeBadge_module_css_default = {
			"badge": "xGbbRW_badge",
			"dot": "xGbbRW_dot"
		};
		//#endregion
		//#region lib/types/client/tool/components/ExitCodeBadge.js
		/** Inline exit status for a settled command. */
		/**
		* Render a neutral capsule with a failure dot and a localized exit status.
		* @param props - localized exit code or terminating signal label.
		* @returns the exit status capsule.
		*/
		function ExitCodeBadge({ label }) {
			return (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
				tone: "neutral",
				className: ExitCodeBadge_module_css_default.badge,
				children: [(0, react_jsx_runtime.jsx)("span", {
					className: ExitCodeBadge_module_css_default.dot,
					"aria-hidden": true
				}), label]
			});
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-tool/src/client/tool/components/ToolRow.module.css.mjs
		const css$3 = ".X7n9oa_root{flex-direction:column;display:flex}.X7n9oa_leading{flex-shrink:0}.X7n9oa_root[data-tool^=cordis_] .X7n9oa_title{font-weight:500}.X7n9oa_title{font-weight:400}.X7n9oa_sep{background:var(--dsw-alias-label-caption);border-radius:1px;flex:none;width:2px;height:2px;margin:0 8px}.X7n9oa_summary{text-overflow:ellipsis;white-space:nowrap;min-width:0;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px));flex:auto;overflow:hidden}.X7n9oa_summarySuffix{white-space:nowrap;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px));flex:none;margin-left:4px}.X7n9oa_diffStat{font-family:var(--ds-font-family-code);font-size:calc(var(--dsh-content-font-size-secondary,13px) - 2px);margin-left:10px;transform:translateY(.5px)}.X7n9oa_row[aria-expanded=true] .X7n9oa_diffAdded{color:var(--dsw-alias-state-success-primary)}@media (hover:hover){.X7n9oa_row:hover .X7n9oa_diffAdded{color:var(--dsw-alias-state-success-primary)}}.X7n9oa_row[aria-expanded=true] .X7n9oa_diffRemoved{color:var(--dsw-alias-state-error-primary)}@media (hover:hover){.X7n9oa_row:hover .X7n9oa_diffRemoved{color:var(--dsw-alias-state-error-primary)}}.X7n9oa_fileLink{text-overflow:ellipsis;white-space:nowrap;min-width:0;font:inherit;text-align:left;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px));color:inherit;text-underline-offset:3px;cursor:pointer;background:0 0;border:none;flex:0 auto;margin:0;padding:0;text-decoration:underline 1px dotted;overflow:hidden}.X7n9oa_errorSummary{color:var(--dsw-alias-state-error-primary)}.X7n9oa_stoppedSummary{color:var(--dsw-alias-state-warn-label)}.X7n9oa_bodyWrap{flex-direction:column;display:flex}.X7n9oa_inspectButton{border:.5px solid var(--dsw-alias-border-l3);corner-shape:round;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);cursor:pointer;opacity:0;border-radius:999px;align-self:flex-start;align-items:center;gap:4px;margin:4px 0 2px 4px;padding:2px 8px;font-size:11px;line-height:16px;transition:opacity .1s;display:inline-flex}.X7n9oa_inspectButton:focus-visible{opacity:1}@media (hover:hover){.X7n9oa_root:hover .X7n9oa_inspectButton{opacity:1}}.X7n9oa_detailsBodyWrap{position:relative}.X7n9oa_detailsBodyWrap .X7n9oa_inspectButton{margin:0;position:absolute;top:12px;right:12px}@media (hover:hover){.X7n9oa_inspectButton:hover{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}}.X7n9oa_bodyScroll{max-height:260px;overflow-y:auto}.X7n9oa_ioCard{border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-markdown-code-block);font:var(--dsw-font-markdown-code-block-small);flex-direction:column;margin:4px 0 4px 4px;display:flex}.X7n9oa_ioSection{grid-template-columns:max-content 1fr;align-items:baseline;column-gap:14px;max-height:150px;padding:12px 16px;display:grid;overflow-y:auto}.X7n9oa_ioSection::-webkit-scrollbar-thumb{border-radius:var(--dsw-radius-sm);background-clip:padding-box;border:2px solid #0000}.X7n9oa_ioSection::-webkit-scrollbar-track{margin:6px 0}.X7n9oa_ioLabel{color:var(--dsw-alias-label-caption);align-self:start;position:sticky;top:0}.X7n9oa_ioDivider{background:var(--dsw-alias-border-l2);flex:none;height:.5px}.X7n9oa_ioText{white-space:pre-wrap;word-break:break-word;min-width:0;color:var(--dsw-alias-label-secondary)}.X7n9oa_ioText[data-error]{color:var(--dsw-alias-state-error-primary)}.X7n9oa_codeBody,.X7n9oa_terminalBody,.X7n9oa_diffBody,.X7n9oa_readBody,.X7n9oa_imageBody,.X7n9oa_searchBody,.X7n9oa_webBody{margin:4px 0 4px 4px}.X7n9oa_searchRecovery{white-space:pre-wrap;overflow-wrap:anywhere;font:var(--dsw-font-xs-13);color:var(--dsw-alias-label-tertiary);margin:4px 0 4px 4px}.X7n9oa_imageMeta{white-space:pre-wrap;overflow-wrap:anywhere;font:var(--dsw-font-markdown-code-block-small);color:var(--dsw-alias-label-tertiary);margin-top:4px}.X7n9oa_imageExtra{white-space:pre-wrap;overflow-wrap:anywhere;font:var(--dsw-font-xs-13);color:var(--dsw-alias-label-tertiary);margin-top:4px}.X7n9oa_terminalBody{--dsl-terminal-font:var(--dsw-font-markdown-code-block-small);--dsl-terminal-line-height:18px;--dsl-terminal-output-max-height:224px;--dsl-terminal-command-whitespace:pre-wrap;border:.5px solid var(--dsw-alias-border-l1)}.X7n9oa_visuallyHidden{clip:rect(0 0 0 0);white-space:nowrap;width:1px;height:1px;position:absolute;overflow:hidden}@media (hover:none){.X7n9oa_inspectButton{opacity:1}}";
		const tagId$3 = "@deepseek-ai/dsh-client-ui-tool/ToolRow.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$3) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-tool";
			tag.dataset.pluginCss = tagId$3;
			tag.textContent = css$3;
			document.head.appendChild(tag);
		}
		var ToolRow_module_css_default = {
			"bodyScroll": "X7n9oa_bodyScroll",
			"bodyWrap": "X7n9oa_bodyWrap",
			"codeBody": "X7n9oa_codeBody",
			"detailsBodyWrap": "X7n9oa_detailsBodyWrap",
			"diffAdded": "X7n9oa_diffAdded",
			"diffBody": "X7n9oa_diffBody",
			"diffRemoved": "X7n9oa_diffRemoved",
			"diffStat": "X7n9oa_diffStat",
			"errorSummary": "X7n9oa_errorSummary",
			"fileLink": "X7n9oa_fileLink",
			"imageBody": "X7n9oa_imageBody",
			"imageExtra": "X7n9oa_imageExtra",
			"imageMeta": "X7n9oa_imageMeta",
			"inspectButton": "X7n9oa_inspectButton",
			"ioCard": "X7n9oa_ioCard",
			"ioDivider": "X7n9oa_ioDivider",
			"ioLabel": "X7n9oa_ioLabel",
			"ioSection": "X7n9oa_ioSection",
			"ioText": "X7n9oa_ioText",
			"leading": "X7n9oa_leading",
			"readBody": "X7n9oa_readBody",
			"root": "X7n9oa_root",
			"row": "X7n9oa_row",
			"searchBody": "X7n9oa_searchBody",
			"searchRecovery": "X7n9oa_searchRecovery",
			"sep": "X7n9oa_sep",
			"stoppedSummary": "X7n9oa_stoppedSummary",
			"summary": "X7n9oa_summary",
			"summarySuffix": "X7n9oa_summarySuffix",
			"terminalBody": "X7n9oa_terminalBody",
			"title": "X7n9oa_title",
			"visuallyHidden": "X7n9oa_visuallyHidden",
			"webBody": "X7n9oa_webBody"
		};
		//#endregion
		//#region lib/types/client/tool/components/ToolRow.js
		/** Keep a summary link click from toggling the row; the browser still follows the link. */
		function stopLinkClick(event) {
			event.stopPropagation();
		}
		/** Visually hidden run-state label for color-only running and settlement cues. */
		function stateStatus$1(state, t) {
			switch (state) {
				case "preparing": return t("row.preparing");
				case "running": return t("row.running");
				case "error": return t("row.failed");
				case "stopped": return t("row.stopped");
				default: return null;
			}
		}
		/**
		* Render one localized tool summary and lazily mounted result card.
		* Preparation retains the icon, title, and optional tool-name summary without disclosure.
		* @param props - tool state, summary, output, and navigation callbacks.
		* @returns the tool disclosure.
		*/
		const ToolRow = (0, react.memo)(function ToolRow({ t, variant, toolName, icon, title, summary, summarySuffix, bodyRaw, output, askQuestion, errorSummary, terminal, diff, read, image, renderSlot, loadImage, search, web, details, state, filePath, filePathLine, onOpenFile, href, inspect, useDisclosure }) {
			const { expanded, toggle: toggleExpand } = useDisclosure();
			const terminalLabels = (0, react.useMemo)(() => terminalBlockLabels(t), [t]);
			const diffLabels = (0, react.useMemo)(() => diffBlockLabels(t), [t]);
			const readLabels = (0, react.useMemo)(() => readBlockLabels(t), [t]);
			const searchLabels = (0, react.useMemo)(() => searchBlockLabels(t), [t]);
			const webLabels = (0, react.useMemo)(() => webBlockLabels(t), [t]);
			const terminalBody = (0, react.useMemo)(() => terminal === void 0 || terminal === null ? null : localizeTerminalCardModel(terminal, t), [terminal, t]);
			const diffBody = diff ?? null;
			const readBody = read ?? null;
			const imageBody = image !== void 0 && image !== null && renderSlot !== void 0 && loadImage !== void 0 ? image : null;
			const searchBody = search ?? null;
			const webBody = web ?? null;
			const askQuestionBody = askQuestion ?? null;
			const detailsBody = details ?? null;
			const inputRaw = bodyRaw ?? null;
			const outputText = output ?? null;
			const card = askQuestionBody ?? terminalBody ?? diffBody ?? readBody ?? imageBody ?? searchBody ?? webBody ?? detailsBody;
			const expandable = state !== "preparing" && (inputRaw !== null || outputText !== null || card !== null);
			const open = expanded && expandable;
			const bodyText = (0, react.useMemo)(() => open && card === null && inputRaw !== null ? formatToolBody(variant, inputRaw) : null, [
				card,
				inputRaw,
				open,
				variant
			]);
			const status = stateStatus$1(state, t);
			const running = state === "running" || state === "preparing";
			const normalSummary = terminalBody?.description ?? (open ? detailsBody?.expandedSummary ?? summary : summary);
			const exitLabel = terminalExitLabel(terminal, t);
			const summaryText = (state === "error" && exitLabel === null ? errorSummary ?? normalSummary : null) ?? normalSummary;
			const diffStat = (0, react.useMemo)(() => diffBody === null ? null : (0, _deepseek_ai_dsh_client_ui_primitives.diffTotals)(diffBody.card.diffs), [diffBody]);
			const settledWithCue = state === "error" || state === "stopped";
			const suffix = settledWithCue ? null : summarySuffix ?? null;
			const totals = settledWithCue ? null : diffStat;
			const openFile = (0, react.useMemo)(() => filePath !== void 0 && onOpenFile !== void 0 && !settledWithCue ? (event) => {
				event.stopPropagation();
				if (filePathLine === void 0) onOpenFile(filePath);
				else onOpenFile(filePath, { line: filePathLine });
			} : void 0, [
				filePath,
				filePathLine,
				onOpenFile,
				settledWithCue
			]);
			const linkHref = settledWithCue ? void 0 : href;
			const summaryLinkKeyDown = (0, react.useCallback)((event) => {
				if (event.key === "Enter" || event.key === " ") event.stopPropagation();
			}, []);
			const cardBody = variant === "code" ? null : bodyText;
			const collapsedContent = (0, react.useMemo)(() => summaryText !== "" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsx)("span", {
					className: ToolRow_module_css_default.sep,
					"data-shimmer-decoration": true,
					"aria-hidden": true
				}),
				exitLabel === null && openFile !== void 0 ? (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: ToolRow_module_css_default.fileLink,
					onClick: openFile,
					onKeyDown: summaryLinkKeyDown,
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, { children: summaryText })
				}) : exitLabel === null && linkHref !== void 0 ? (0, react_jsx_runtime.jsx)("a", {
					className: ToolRow_module_css_default.fileLink,
					href: linkHref,
					target: "_blank",
					rel: "noopener noreferrer",
					onClick: stopLinkClick,
					onKeyDown: summaryLinkKeyDown,
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, { children: summaryText })
				}) : (0, react_jsx_runtime.jsx)("span", {
					className: clsx(ToolRow_module_css_default.summary, exitLabel === null && state === "error" && ToolRow_module_css_default.errorSummary, exitLabel === null && state === "stopped" && ToolRow_module_css_default.stoppedSummary),
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, { children: summaryText })
				}),
				exitLabel !== null && (0, react_jsx_runtime.jsx)(ExitCodeBadge, { label: exitLabel }),
				suffix !== null && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, {
					className: ToolRow_module_css_default.summarySuffix,
					children: suffix
				}),
				totals !== null && (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, {
					className: clsx(ToolRow_module_css_default.summarySuffix, ToolRow_module_css_default.diffStat),
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: ToolRow_module_css_default.diffAdded,
							children: `+${totals.added}`
						}),
						" ",
						(0, react_jsx_runtime.jsx)("span", {
							className: ToolRow_module_css_default.diffRemoved,
							children: `-${totals.removed}`
						})
					]
				})
			] }), [
				summaryLinkKeyDown,
				linkHref,
				openFile,
				state,
				suffix,
				totals,
				summaryText,
				exitLabel
			]);
			const expandedContent = (0, react.useMemo)(() => open ? (0, react_jsx_runtime.jsxs)("div", {
				className: clsx(ToolRow_module_css_default.bodyWrap, detailsBody !== null && ToolRow_module_css_default.detailsBodyWrap),
				children: [askQuestionBody !== null ? (0, react_jsx_runtime.jsx)(AskQuestionCard, { card: askQuestionBody }) : terminalBody !== null ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TerminalBlock, {
					...terminalBody.card,
					maxLines: Infinity,
					labels: terminalLabels,
					className: ToolRow_module_css_default.terminalBody
				}) : diffBody !== null ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.DiffBlock, {
					...diffBody.card,
					labels: diffLabels,
					maxLines: 9,
					className: ToolRow_module_css_default.diffBody
				}) : readBody !== null ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ReadBlock, {
					...readBody,
					labels: readLabels,
					maxLines: 8,
					className: ToolRow_module_css_default.readBody
				}) : imageBody !== null ? (0, react_jsx_runtime.jsxs)("div", {
					className: ToolRow_module_css_default.imageBody,
					children: [
						renderSlot !== void 0 && loadImage !== void 0 && renderSlot("tool.call.images", {
							images: imageBody.images,
							loadImage,
							align: "start"
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: ToolRow_module_css_default.imageMeta,
							children: [(0, react_jsx_runtime.jsx)("div", { children: imageBody.path }), imageBody.images.map(({ attachment }, index) => (0, react_jsx_runtime.jsx)("div", { children: attachment.originalDimensions === void 0 ? t("row.imageSize", {
								width: attachment.width,
								height: attachment.height,
								bytes: attachment.bytes
							}) : t("row.imageSizeDownscaled", {
								width: attachment.width,
								height: attachment.height,
								originalWidth: attachment.originalDimensions.width,
								originalHeight: attachment.originalDimensions.height,
								bytes: attachment.bytes
							}) }, index))]
						}),
						imageBody.extraText !== null && (0, react_jsx_runtime.jsx)("div", {
							className: ToolRow_module_css_default.imageExtra,
							children: imageBody.extraText
						})
					]
				}) : searchBody !== null ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SearchBlock, {
					...searchBody.card,
					labels: searchLabels,
					maxLines: 8,
					className: ToolRow_module_css_default.searchBody
				}), searchBody.recovery !== void 0 && (0, react_jsx_runtime.jsx)("div", {
					className: ToolRow_module_css_default.searchRecovery,
					children: searchBody.recovery
				})] }) : webBody !== null ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.WebBlock, {
					...webBody,
					labels: webLabels,
					className: ToolRow_module_css_default.webBody
				}) : detailsBody !== null ? (0, react_jsx_runtime.jsx)(ToolDetails, {
					model: detailsBody,
					hasInspect: inspect !== void 0,
					t,
					onOpenFile
				}) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [variant === "code" && bodyText !== null && (0, react_jsx_runtime.jsx)("div", {
					className: ToolRow_module_css_default.bodyScroll,
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.CodeBlock, {
						code: bodyText,
						lang: "typescript",
						copyLabel: t("copy"),
						copiedLabel: t("copied"),
						toolbarLabels: codeToolbarLabels(t),
						className: ToolRow_module_css_default.codeBody
					})
				}), (cardBody !== null || outputText !== null) && (0, react_jsx_runtime.jsxs)("div", {
					className: ToolRow_module_css_default.ioCard,
					children: [
						cardBody !== null && (0, react_jsx_runtime.jsxs)("div", {
							className: ToolRow_module_css_default.ioSection,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: ToolRow_module_css_default.ioLabel,
								children: t("row.input")
							}), (0, react_jsx_runtime.jsx)("span", {
								className: ToolRow_module_css_default.ioText,
								children: cardBody
							})]
						}),
						cardBody !== null && outputText !== null && (0, react_jsx_runtime.jsx)("span", {
							className: ToolRow_module_css_default.ioDivider,
							"aria-hidden": true
						}),
						outputText !== null && (0, react_jsx_runtime.jsxs)("div", {
							className: ToolRow_module_css_default.ioSection,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: ToolRow_module_css_default.ioLabel,
								children: t("row.output")
							}), (0, react_jsx_runtime.jsx)("span", {
								className: ToolRow_module_css_default.ioText,
								"data-error": state === "error" || void 0,
								children: outputText
							})]
						})
					]
				})] }), inspect !== void 0 && (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: ToolRow_module_css_default.inspectButton,
					onClick: inspect,
					children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconInspectOutlineRegular, {}), t("row.inspect")]
				})]
			}) : void 0, [
				open,
				detailsBody,
				askQuestionBody,
				terminalBody,
				terminalLabels,
				diffBody,
				diffLabels,
				readBody,
				readLabels,
				imageBody,
				renderSlot,
				loadImage,
				searchBody,
				searchLabels,
				webBody,
				webLabels,
				inspect,
				t,
				onOpenFile,
				variant,
				bodyText,
				cardBody,
				outputText,
				state
			]);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: ToolRow_module_css_default.root,
				"data-variant": variant,
				"data-tool": toolName,
				"data-state": state,
				children: [status !== null && (0, react_jsx_runtime.jsx)("span", {
					className: ToolRow_module_css_default.visuallyHidden,
					children: status
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.DisclosureRow, {
					rowClassName: ToolRow_module_css_default.row,
					leadingClassName: ToolRow_module_css_default.leading,
					titleClassName: ToolRow_module_css_default.title,
					icon,
					title,
					running,
					open,
					expandable,
					expandOnRowClick: true,
					keepContentWhenOpen: true,
					onToggle: toggleExpand,
					collapsedContent,
					children: expandedContent
				})]
			});
		});
		//#endregion
		//#region lib/types/client/tool/toolviews/GenericToolCard.js
		/** Variant leading icons (figma table); all glyphs render at 14 inside the 16px leading box. */
		const VARIANT_ICONS = {
			search: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSearchOutlineRegular, { size: 14 }),
			read: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconBrowseOutlineRegular, { size: 14 }),
			bash: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconApiOutlineRegular, { size: 14 }),
			write: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutlineRegular, { size: 14 }),
			edit: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutlineRegular, { size: 14 }),
			code: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCodeOutlineRegular, { size: 14 }),
			others: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSparkleRegular, { size: 14 })
		};
		/** @param props - current tool stage and locale. @returns its preparation or dispatched card. */
		function GenericToolCard({ toolName, block, cwd, home, openFile, inspect, useDisclosure, t }) {
			const model = toolRowModel(toolName, block, cwd, home);
			const autoReview = model.autoReviewDenial === null ? null : localizeAutoReviewDenial(model.autoReviewDenial, t);
			const terminal = terminalCardModel(block, cwd);
			const read = readCardModel(block, cwd, home);
			const diff = diffCardModel(block);
			const search = searchCardModel(block);
			const web = webCardModel(block);
			const state = model.state === "ok" && terminal !== null && terminalFailed(terminal) ? "error" : model.state;
			const singleFile = model.filePath !== void 0;
			return (0, react_jsx_runtime.jsx)(ToolRow, {
				useDisclosure,
				t,
				variant: model.variant,
				toolName,
				icon: VARIANT_ICONS[model.variant],
				title: t(model.titleKey),
				summary: model.summary,
				bodyRaw: singleFile || autoReview !== null ? null : model.bodyRaw,
				output: autoReview?.output ?? model.output,
				errorSummary: autoReview?.summary ?? model.errorSummary,
				terminal,
				diff,
				read,
				search,
				web,
				state,
				filePath: model.filePath,
				onOpenFile: singleFile ? openFile : void 0,
				inspect
			});
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-tool/src/client/tool/ToolCallTree.module.css.mjs
		const css$2 = ".WPxjaq_callRow{border-radius:var(--dsw-radius-sm)}.WPxjaq_subCalls{border-left:.5px solid var(--dsw-alias-border-l2);flex-direction:column;gap:4px;margin:4px 0 2px 22px;padding-left:8px;display:flex}";
		const tagId$2 = "@deepseek-ai/dsh-client-ui-tool/ToolCallTree.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$2) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-tool";
			tag.dataset.pluginCss = tagId$2;
			tag.textContent = css$2;
			document.head.appendChild(tag);
		}
		var ToolCallTree_module_css_default = {
			"callRow": "WPxjaq_callRow",
			"subCalls": "WPxjaq_subCalls"
		};
		//#endregion
		//#region lib/types/client/tool/ToolCallTree.js
		/** Root/subcall Tool composition with one keyed atomic dispatch path. */
		function toolCallPhase(block) {
			if ("kind" in block) return {
				phase: "result",
				block
			};
			return block.phase === "preparing" ? {
				phase: "preparing",
				block
			} : {
				phase: "start",
				block
			};
		}
		/** Resolve a Tool call's wire name from its current stage. */
		function callName(call) {
			return call.phase === "result" ? call.block.call?.name ?? "" : call.block.name;
		}
		/** One atomic call dispatched through the Tool-owned keyed slot. */
		const ToolCall = (0, react.memo)(function ToolCall({ renderSlot, callId, toolName, call, openFile, cwd, home, inspectCall, loadImage, useDisclosure, t, children }) {
			const owner = (0, react.useMemo)(() => ({
				callId,
				toolName,
				...call,
				openFile,
				cwd,
				home,
				loadImage,
				useDisclosure,
				inspect: inspectCall === void 0 ? void 0 : () => {
					inspectCall(callId);
				}
			}), [
				callId,
				toolName,
				call,
				openFile,
				cwd,
				home,
				loadImage,
				inspectCall,
				useDisclosure
			]);
			const autoReviewDenied = (0, react.useMemo)(() => call.phase === "result" && toolRowModel(toolName, call.block).autoReviewDenial !== null, [toolName, call]);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: ToolCallTree_module_css_default.callRow,
				"data-chat-anchor-key": `call:${callId}`,
				"data-chat-call-id": callId,
				children: [autoReviewDenied ? (0, react_jsx_runtime.jsx)(GenericToolCard, {
					...owner,
					t
				}) : renderSlot("tool.call.toolview", owner, {
					entryKey: toolName,
					fallback: (0, react_jsx_runtime.jsx)(GenericToolCard, {
						...owner,
						t
					})
				}), children]
			});
		});
		const ToolCallBranch = (0, react.memo)(function ToolCallBranch({ renderSlot, block, cwd, home, openFile, inspectCall, loadImage, useDisclosure, t }) {
			const call = (0, react.useMemo)(() => toolCallPhase(block), [block]);
			return (0, react_jsx_runtime.jsx)(ToolCall, {
				renderSlot,
				callId: call.block.callId,
				toolName: callName(call),
				call,
				openFile,
				cwd,
				home,
				inspectCall,
				useDisclosure,
				loadImage,
				t,
				children: call.phase !== "preparing" && call.block.subCalls.length > 0 ? (0, react_jsx_runtime.jsx)("div", {
					className: ToolCallTree_module_css_default.subCalls,
					"data-subcalls": true,
					children: call.block.subCalls.map((child) => (0, react_jsx_runtime.jsx)(ToolCallBranch, {
						renderSlot,
						block: child,
						cwd,
						home,
						openFile,
						inspectCall,
						useDisclosure,
						loadImage,
						t
					}, child.callId))
				}) : null
			});
		});
		/**
		* Render one root Tool call and its recursive children through the same
		* atomic keyed dispatch.
		* @param props - whole-Tool owner data and the Tool-owned child-slot share.
		* @returns the Tool call tree.
		*/
		function ToolCallTree({ renderSlot, node, cwd, openFile, inspectCall, loadImage, useDisclosure, useHostInfo, t }) {
			const home = useHostInfo((info) => info.home);
			return (0, react_jsx_runtime.jsx)(ToolCallBranch, {
				renderSlot,
				block: node.data.root,
				cwd,
				home,
				openFile,
				inspectCall,
				useDisclosure,
				loadImage,
				t
			});
		}
		//#endregion
		//#region lib/types/client/locale.js
		/** Locale namespace supplied by the conversation owner to Tool renderers. */
		const CONVERSATION_NS = "conversation";
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-tool/src/client/tool/components/QuestionToolRow.module.css.mjs
		const css$1 = ".YI_F9G_panelButton{height:calc(22px + var(--dsh-content-font-delta,0px));corner-shape:round;background:var(--dsw-alias-button-floating-fill);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:calc(var(--dsh-content-font-size-secondary,13px) - 1px);white-space:nowrap;cursor:pointer;border:none;border-radius:999px;flex:none;align-items:center;gap:4px;margin-left:8px;padding:0 10px;line-height:1;transition:background .1s;display:inline-flex}.YI_F9G_panelButton svg{width:13px;height:13px}@media (hover:hover){.YI_F9G_panelButton:hover{background:var(--dsw-alias-button-floating-hover)}}";
		const tagId$1 = "@deepseek-ai/dsh-client-ui-tool/QuestionToolRow.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-tool";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var QuestionToolRow_module_css_default = { "panelButton": "YI_F9G_panelButton" };
		//#endregion
		//#region lib/types/client/tool/components/QuestionToolRow.js
		/** Question-owned summary action and transcript disclosure. */
		/**
		* Render a question with its answer-panel entry point.
		* @param props - Question transcript, panel action, and disclosure state.
		* @returns The question's summary and optional expanded record.
		*/
		function QuestionToolRow({ useDisclosure, t, summary, bodyRaw, output, askQuestion, state, inspect, openPanel, panelLabel }) {
			const { expanded, toggle } = useDisclosure();
			const expandable = bodyRaw != null || output != null || askQuestion != null;
			const open = expanded && expandable;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: ToolRow_module_css_default.root,
				"data-variant": "others",
				"data-tool": "ask_user_question",
				"data-state": state,
				children: [state === "running" && (0, react_jsx_runtime.jsx)("span", {
					className: ToolRow_module_css_default.visuallyHidden,
					children: t("row.running")
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.DisclosureRow, {
					rowClassName: ToolRow_module_css_default.row,
					leadingClassName: ToolRow_module_css_default.leading,
					titleClassName: ToolRow_module_css_default.title,
					chevronClassName: ToolRow_module_css_default.chevron,
					icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconQuestionOutlineRegular, {}),
					title: t("ask.rowTitle"),
					running: state === "running",
					open,
					expandable,
					keepContentWhenOpen: true,
					onToggle: toggle,
					collapsedContent: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [summary !== "" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
						className: ToolRow_module_css_default.sep,
						"aria-hidden": true
					}), (0, react_jsx_runtime.jsx)("span", {
						className: ToolRow_module_css_default.summary,
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, {
							active: state === "running",
							children: summary
						})
					})] }), (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: QuestionToolRow_module_css_default.panelButton,
						onClick: (event) => {
							event.stopPropagation();
							if (!openPanel()) toggle();
						},
						onKeyDown: (event) => {
							if (event.key === "Enter" || event.key === " ") event.stopPropagation();
						},
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconQuestionOutlineRegular, {}), panelLabel]
					})] }),
					children: open && (0, react_jsx_runtime.jsxs)("div", {
						className: ToolRow_module_css_default.bodyWrap,
						children: [askQuestion != null ? (0, react_jsx_runtime.jsx)(AskQuestionCard, { card: askQuestion }) : (0, react_jsx_runtime.jsxs)("div", {
							className: ToolRow_module_css_default.ioCard,
							children: [
								bodyRaw != null && (0, react_jsx_runtime.jsxs)("div", {
									className: ToolRow_module_css_default.ioSection,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: ToolRow_module_css_default.ioLabel,
										children: t("row.input")
									}), (0, react_jsx_runtime.jsx)("span", {
										className: ToolRow_module_css_default.ioText,
										children: formatToolBody("others", bodyRaw)
									})]
								}),
								bodyRaw != null && output != null && (0, react_jsx_runtime.jsx)("span", {
									className: ToolRow_module_css_default.ioDivider,
									"aria-hidden": true
								}),
								output != null && (0, react_jsx_runtime.jsxs)("div", {
									className: ToolRow_module_css_default.ioSection,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: ToolRow_module_css_default.ioLabel,
										children: t("row.output")
									}), (0, react_jsx_runtime.jsx)("span", {
										className: ToolRow_module_css_default.ioText,
										children: output
									})]
								})
							]
						}), inspect !== void 0 && (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: ToolRow_module_css_default.inspectButton,
							onClick: inspect,
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconInspectOutlineRegular, {}), t("row.inspect")]
						})]
					})
				})]
			});
		}
		//#endregion
		//#region lib/types/client/tool/toolviews/ask-question-row.js
		function isRecord(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		function parseJson(text) {
			try {
				return JSON.parse(text);
			} catch {
				return;
			}
		}
		/** Answer records from the result JSON; null when the result is malformed. */
		function answerEntries(text) {
			const parsed = parseJson(text);
			if (!isRecord(parsed)) return null;
			const answers = parsed.answers;
			if (!Array.isArray(answers) || !answers.every(isRecord)) return null;
			const entries = [];
			for (const answer of answers) {
				if (typeof answer.id !== "string" || !Array.isArray(answer.selected) || !answer.selected.every((item) => typeof item === "string") || answer.custom !== void 0 && typeof answer.custom !== "string") return null;
				entries.push({
					id: answer.id,
					selected: answer.selected,
					...answer.custom === void 0 ? {} : { custom: answer.custom }
				});
			}
			return entries;
		}
		/** Answers from a submitted steer that still awaits admission to a step. */
		function queuedAnswerEntries(message, callId) {
			if (!isRecord(message) || !Array.isArray(message.content)) return null;
			const content = message.content[0];
			if (!isRecord(content) || content.type !== "text" || typeof content.text !== "string") return null;
			const parsed = parseJson(content.text);
			if (!isRecord(parsed) || parsed.kind !== "answer_to_pending_question" || parsed.callId !== callId) return null;
			return answerEntries(content.text);
		}
		/** One question's choices from call JSON; absent when any entry is malformed. */
		function optionEntries(value) {
			if (!Array.isArray(value)) return void 0;
			const options = [];
			for (const option of value) {
				if (!isRecord(option) || typeof option.label !== "string") return void 0;
				options.push({
					label: option.label,
					...typeof option.description === "string" ? { description: option.description } : {}
				});
			}
			return options;
		}
		/**
		* Questions from call JSON; null when pairing with answers would be ambiguous.
		* The optional presentation fields are carried for the read-only answer panel,
		* which renders the same option lists the user chose from; a malformed one is
		* dropped rather than failing the whole call, because the transcript card needs
		* only the id and the question text.
		*/
		function questionEntries(argsRaw) {
			const parsed = parseJson(argsRaw);
			if (!isRecord(parsed) || !Array.isArray(parsed.questions) || parsed.questions.length === 0) return null;
			const questions = [];
			const ids = /* @__PURE__ */ new Set();
			for (const question of parsed.questions) {
				if (!isRecord(question) || typeof question.id !== "string" || typeof question.question !== "string" || ids.has(question.id)) return null;
				ids.add(question.id);
				const options = optionEntries(question.options);
				questions.push({
					id: question.id,
					question: question.question,
					...typeof question.header === "string" ? { header: question.header } : {},
					...typeof question.detail === "string" ? { detail: question.detail } : {},
					...options === void 0 ? {} : { options },
					...typeof question.multi_select === "boolean" ? { multiSelect: question.multi_select } : {}
				});
			}
			return questions;
		}
		/** Pair questions with result entries by their echoed stable ids. */
		function pairAnswers(questions, answers) {
			if (questions.length !== answers.length) return null;
			const byId = /* @__PURE__ */ new Map();
			for (const answer of answers) {
				if (byId.has(answer.id)) return null;
				byId.set(answer.id, answer);
			}
			const paired = [];
			for (const question of questions) {
				const answer = byId.get(question.id);
				if (answer === void 0) return null;
				paired.push({
					id: question.id,
					question: question.question,
					answers: [...answer.selected, ...answer.custom === void 0 || answer.custom === "" ? [] : [answer.custom]]
				});
			}
			return paired;
		}
		/**
		* Answer summary, transcript content, and panel material from one recorded
		* answer batch, whether the result carried it in time or a late reply did.
		* @param questions - The call's questions, or null when they failed validation.
		* @param answers - The recorded answer batch.
		* @param t - Row translator.
		* @returns What the answered row shows.
		*/
		function answeredPresentation(questions, answers, t) {
			const answered = answers.filter((answer) => answer.selected.length > 0 || (answer.custom ?? "") !== "").length;
			const paired = questions === null ? null : pairAnswers(questions, answers);
			return {
				summary: t("ask.answered", {
					answered,
					total: answers.length
				}),
				transcript: paired === null ? null : {
					kind: "answered",
					questions: paired,
					skippedLabel: t("ask.skipped")
				},
				record: paired === null || questions === null ? void 0 : {
					questions,
					answers
				}
			};
		}
		/** Best-effort answered-count summary when strict transcript pairing fails. */
		function answeredSummary(text, t) {
			const parsed = parseJson(text);
			if (!isRecord(parsed)) return null;
			const answers = parsed.answers;
			if (!Array.isArray(answers) || !answers.every(isRecord)) return null;
			const answered = answers.filter((a) => Array.isArray(a.selected) && a.selected.length > 0 || typeof a.custom === "string" && a.custom !== "").length;
			return t("ask.answered", {
				answered,
				total: answers.length
			});
		}
		/** Whether a successful tool result records a still-answerable timed question. */
		function isPendingResult(text) {
			const parsed = parseJson(text);
			return isRecord(parsed) && parsed.pending === true && typeof parsed.callId === "string";
		}
		/** Summarizes a pending, answered, cancelled, or interrupted question set. */
		function AskQuestionRow({ callId, toolName, block, inspect, useDisclosure, useProjection, revealPanel, reviewPanel, t }) {
			const model = toolRowModel(toolName, block);
			const answerable = useProjection("userQuestions", (view) => view?.active.some((row) => row.callId === callId) ?? false);
			const settled = useProjection("userQuestions", (view) => view?.settled.find((row) => row.callId === callId));
			const queuedReply = useProjection("inbox", (view) => {
				const matches = (message) => {
					const source = isRecord(message) ? message.source : void 0;
					return isRecord(source) && source.kind === "user-question-reply" && source.callId === callId;
				};
				return view?.["next-step"].find(matches) ?? view?.["next-turn"].find(matches);
			});
			const reopen = (0, react.useCallback)(() => revealPanel(callId), [callId, revealPanel]);
			const code = "kind" in block ? block.error?.code : void 0;
			const argsRaw = model.bodyRaw ?? "";
			let summary = model.summary;
			let state = model.state;
			let transcript = null;
			let rowAction;
			let rowActionLabel = t("ask.reopen");
			if (code === "ASK_CANCELLED") {
				summary = t("ask.cancelled");
				state = "ok";
				const questions = questionEntries(argsRaw);
				if (questions !== null) transcript = {
					kind: "unanswered",
					questions,
					verdict: t("ask.cancelledDetail")
				};
			} else if (code === "ASK_ABORTED") {
				summary = t("ask.interrupted");
				state = "stopped";
				const questions = questionEntries(argsRaw);
				if (questions !== null) transcript = {
					kind: "unanswered",
					questions,
					verdict: t("ask.interruptedDetail")
				};
			} else if (model.state === "running") {
				summary = t("ask.waiting");
				if (answerable) rowAction = reopen;
			} else if (code === "TOOL_OUTCOME_UNKNOWN" && (answerable || settled !== void 0)) {
				state = "ok";
				const questions = questionEntries(argsRaw);
				if (answerable) {
					summary = t("ask.pending");
					if (questions !== null) transcript = {
						kind: "unanswered",
						questions,
						verdict: t("ask.pendingDetail")
					};
					rowAction = reopen;
				} else if (settled?.answers.length === 0) {
					summary = t("ask.closed");
					if (questions !== null) transcript = {
						kind: "unanswered",
						questions,
						verdict: t("ask.closedDetail")
					};
				} else if (settled !== void 0) {
					const presentation = answeredPresentation(questions, settled.answers, t);
					summary = presentation.summary;
					transcript = presentation.transcript;
					const record = presentation.record;
					if (record !== void 0) {
						rowAction = () => reviewPanel(callId, record);
						rowActionLabel = t("ask.review");
					}
				}
			} else if ("kind" in block && model.state === "ok") {
				const text = singleResultText(block);
				if (text !== void 0) {
					const questions = questionEntries(argsRaw);
					const pending = isPendingResult(text);
					if (pending && answerable) {
						summary = t("ask.pending");
						if (questions !== null) transcript = {
							kind: "unanswered",
							questions,
							verdict: t("ask.pendingDetail")
						};
						rowAction = reopen;
					} else if (pending && (settled === void 0 || settled.answers.length === 0)) {
						summary = t("ask.closed");
						if (questions !== null) transcript = {
							kind: "unanswered",
							questions,
							verdict: t("ask.closedDetail")
						};
					} else {
						const answers = settled?.answers ?? answerEntries(text);
						const presentation = answers === null ? null : answeredPresentation(questions, answers, t);
						summary = presentation?.summary ?? answeredSummary(text, t) ?? model.summary;
						transcript = presentation?.transcript ?? null;
						const record = settled === void 0 ? void 0 : presentation?.record;
						if (record !== void 0) {
							rowAction = () => reviewPanel(callId, record);
							rowActionLabel = t("ask.review");
						}
					}
				}
			}
			if (answerable && queuedReply !== void 0 && rowAction === reopen) {
				const answers = queuedAnswerEntries(queuedReply, callId);
				const presentation = answers === null ? null : answeredPresentation(questionEntries(argsRaw), answers, t);
				if (presentation?.record !== void 0) {
					summary = presentation.summary;
					transcript = presentation.transcript;
					rowAction = () => false;
					rowActionLabel = t("ask.review");
				}
			}
			if (rowAction !== void 0) return (0, react_jsx_runtime.jsx)(QuestionToolRow, {
				useDisclosure,
				t,
				summary,
				bodyRaw: transcript === null ? model.bodyRaw : null,
				output: transcript === null ? model.output : null,
				askQuestion: transcript,
				state,
				inspect,
				openPanel: rowAction,
				panelLabel: rowActionLabel
			});
			return (0, react_jsx_runtime.jsx)(ToolRow, {
				useDisclosure,
				t,
				variant: model.variant,
				toolName,
				icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconQuestionOutlineRegular, {}),
				title: t(model.titleKey),
				summary,
				bodyRaw: transcript === null ? model.bodyRaw : null,
				output: transcript === null ? model.output : null,
				askQuestion: transcript,
				state,
				inspect
			});
		}
		/** Registers the ask-user-question conversation row. */
		const askQuestionToolview = {
			name: "ask-question-toolview",
			inject: ["slots"],
			apply(ctx) {
				ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({
					name: "tool.call.toolview",
					key: "ask_user_question",
					locale: CONVERSATION_NS,
					inject: (sessionId) => ({
						revealPanel: (callId) => ctx.get("userQuestionPanels")?.reveal(sessionId, callId) ?? false,
						reviewPanel: (callId, record) => ctx.get("userQuestionPanels")?.review(sessionId, callId, record) ?? false
					})
				}, AskQuestionRow));
			}
		};
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-tool/src/client/tool/toolviews/bash-sample.module.css.mjs
		const css = ".IJrVvW_card{flex-direction:column;display:flex}.IJrVvW_terminal{--dsl-terminal-font:var(--dsw-font-markdown-code-block-small);--dsl-terminal-line-height:18px;--dsl-terminal-output-max-height:224px;--dsl-terminal-command-whitespace:pre-wrap;border:.5px solid var(--dsw-alias-border-l1);margin:4px 0 4px 4px}.IJrVvW_ioCard{border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-markdown-code-block);font:var(--dsw-font-markdown-code-block-small);flex-direction:column;margin:4px 0 4px 4px;display:flex}.IJrVvW_ioSection{grid-template-columns:max-content 1fr;align-items:baseline;column-gap:14px;max-height:150px;padding:12px 16px;display:grid;overflow-y:auto}.IJrVvW_ioSection::-webkit-scrollbar-thumb{border-radius:var(--dsw-radius-sm);background-clip:padding-box;border:2px solid #0000}.IJrVvW_ioSection::-webkit-scrollbar-track{margin:6px 0}.IJrVvW_ioLabel{color:var(--dsw-alias-label-caption);align-self:start;position:sticky;top:0}.IJrVvW_ioDivider{background:var(--dsw-alias-border-l2);flex:none;height:.5px}.IJrVvW_ioText{white-space:pre-wrap;word-break:break-word;min-width:0;color:var(--dsw-alias-label-secondary)}.IJrVvW_ioText[data-error]{color:var(--dsw-alias-state-error-primary)}.IJrVvW_commandInput{--dsl-command-whitespace:pre-wrap;color:var(--dsw-alias-label-secondary)}.IJrVvW_root[data-expandable]{cursor:pointer}.IJrVvW_root{height:calc(24px + var(--dsh-content-font-delta,0px));min-width:0;color:var(--dsw-alias-label-tertiary);align-items:center;transition:color .1s;display:flex}@media (hover:hover){.IJrVvW_root:hover{color:var(--dsw-alias-label-secondary)}}@media (prefers-reduced-motion:reduce){.IJrVvW_root{transition:none}}.IJrVvW_leading{width:calc(16px + var(--dsh-content-font-delta,0px));height:calc(16px + var(--dsh-content-font-delta,0px));color:inherit;flex:none;justify-content:center;align-items:center;margin-right:6px;display:inline-flex;position:relative}.IJrVvW_leading svg:not([data-state]){width:calc(14px + var(--dsh-content-font-delta,0px));height:calc(14px + var(--dsh-content-font-delta,0px))}.IJrVvW_chevron{color:inherit}.IJrVvW_iconIdle{opacity:1;transition:opacity .1s;display:inline-flex}.IJrVvW_chevronHover{opacity:0;margin:auto;transition:opacity .1s;position:absolute;inset:0}@media (hover:hover){.IJrVvW_root:hover .IJrVvW_iconIdle{opacity:0}.IJrVvW_root:hover .IJrVvW_chevronHover{opacity:1}}.IJrVvW_title{font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px));flex:none}.IJrVvW_sep{background:var(--dsw-alias-label-caption);border-radius:1px;flex:none;width:2px;height:2px;margin:0 8px}.IJrVvW_summary{text-overflow:ellipsis;white-space:nowrap;min-width:0;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px));flex:auto;overflow:hidden}.IJrVvW_errorSummary{color:var(--dsw-alias-state-error-primary)}.IJrVvW_stoppedSummary{color:var(--dsw-alias-state-warn-label)}.IJrVvW_bodyWrap{flex-direction:column;display:flex}.IJrVvW_inspectButton{border:.5px solid var(--dsw-alias-border-l4);corner-shape:round;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);cursor:pointer;opacity:0;border-radius:999px;align-self:flex-start;align-items:center;gap:4px;margin:4px 0 2px 4px;padding:2px 8px;font-size:11px;line-height:16px;transition:opacity .1s;display:inline-flex}.IJrVvW_inspectButton:focus-visible{opacity:1}@media (hover:hover){.IJrVvW_card:hover .IJrVvW_inspectButton{opacity:1}.IJrVvW_inspectButton:hover{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}}.IJrVvW_visuallyHidden{clip:rect(0 0 0 0);white-space:nowrap;width:1px;height:1px;position:absolute;overflow:hidden}@media (hover:none){.IJrVvW_inspectButton{opacity:1}}";
		const tagId = "@deepseek-ai/dsh-client-ui-tool/bash-sample.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-tool";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var bash_sample_module_css_default = {
			"bodyWrap": "IJrVvW_bodyWrap",
			"card": "IJrVvW_card",
			"chevron": "IJrVvW_chevron",
			"chevronHover": "IJrVvW_chevronHover",
			"commandInput": "IJrVvW_commandInput",
			"errorSummary": "IJrVvW_errorSummary",
			"iconIdle": "IJrVvW_iconIdle",
			"inspectButton": "IJrVvW_inspectButton",
			"ioCard": "IJrVvW_ioCard",
			"ioDivider": "IJrVvW_ioDivider",
			"ioLabel": "IJrVvW_ioLabel",
			"ioSection": "IJrVvW_ioSection",
			"ioText": "IJrVvW_ioText",
			"leading": "IJrVvW_leading",
			"root": "IJrVvW_root",
			"sep": "IJrVvW_sep",
			"stoppedSummary": "IJrVvW_stoppedSummary",
			"summary": "IJrVvW_summary",
			"terminal": "IJrVvW_terminal",
			"title": "IJrVvW_title",
			"visuallyHidden": "IJrVvW_visuallyHidden"
		};
		//#endregion
		//#region lib/types/client/tool/toolviews/bash-sample.js
		const BASH_ICON = (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconApiOutlineRegular, { size: 14 });
		/** Visually hidden status for the color-only running sweep and error tone. */
		function stateStatus(state, t) {
			switch (state) {
				case "preparing": return t("row.preparing");
				case "running": return t("bash.running");
				case "error": return t("bash.failed");
				case "stopped": return t("bash.stopped");
				default: return null;
			}
		}
		/**
		* Render expandable Bash output with an accessible lifecycle label. While the
		* call is preparing the row shows the description streamed so far and cannot expand.
		* @param props - tool call, Session sources, locale, and inspection callback.
		* @returns the Bash output row.
		*/
		const BashRow = (0, react.memo)(function BashRow({ toolName, block, sessionId, useSessions, inspect, useDisclosure, t }) {
			const model = (0, react.useMemo)(() => toolRowModel(toolName, block), [toolName, block]);
			const cwd = useSessions((list) => list.byId[sessionId]?.cwd);
			const terminalModel = (0, react.useMemo)(() => terminalCardModel(block, cwd), [block, cwd]);
			const terminal = (0, react.useMemo)(() => terminalModel === null ? null : localizeTerminalCardModel(terminalModel, t), [terminalModel, t]);
			const labels = (0, react.useMemo)(() => terminalBlockLabels(t), [t]);
			const state = model.state === "ok" && terminalModel !== null && terminalFailed(terminalModel) ? "error" : model.state;
			const status = stateStatus(state, t);
			const { expanded, toggle: toggleExpand } = useDisclosure();
			const background = isBackgroundShellCall(block);
			const genericBody = terminal === null && (model.state === "error" || isSettledPersistentShellCall(block) || isSpilledShellCall(block) || background) && (model.bodyRaw !== null || model.output !== null);
			const expandable = terminal !== null || genericBody;
			const open = expanded && expandable;
			const body = (0, react.useMemo)(() => open && genericBody && model.bodyRaw !== null ? formatToolBody(model.variant, model.bodyRaw) : null, [
				genericBody,
				model.bodyRaw,
				model.variant,
				open
			]);
			const normalSummary = terminal?.description ?? model.summary;
			const exitLabel = terminalExitLabel(terminalModel, t);
			const settlementLine = exitLabel !== null ? null : state === "error" ? model.errorSummary ?? normalSummary : state === "stopped" ? t("bash.stopped") : null;
			const running = state === "running" || state === "preparing";
			const toggleFromKeyboard = (0, react.useCallback)((event) => {
				if (!expandable || event.key !== "Enter" && event.key !== " ") return;
				event.preventDefault();
				toggleExpand();
			}, [expandable, toggleExpand]);
			const leading = open ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronUpOutlineRegular, { className: bash_sample_module_css_default.chevron }) : expandable ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
				className: bash_sample_module_css_default.iconIdle,
				children: BASH_ICON
			}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { className: clsx(bash_sample_module_css_default.chevron, bash_sample_module_css_default.chevronHover) })] }) : BASH_ICON;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: bash_sample_module_css_default.card,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: bash_sample_module_css_default.root,
					"data-sample": "bash",
					"data-variant": "bash",
					"data-state": state,
					"data-expandable": expandable || void 0,
					role: expandable ? "button" : void 0,
					tabIndex: expandable ? 0 : void 0,
					"aria-expanded": expandable ? open : void 0,
					onClick: expandable ? toggleExpand : void 0,
					onKeyDown: expandable ? toggleFromKeyboard : void 0,
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: bash_sample_module_css_default.leading,
							children: leading
						}),
						status !== null && (0, react_jsx_runtime.jsx)("span", {
							className: bash_sample_module_css_default.visuallyHidden,
							children: status
						}),
						(0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, {
							active: running,
							children: [
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, {
									className: bash_sample_module_css_default.title,
									children: t(model.titleKey)
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: bash_sample_module_css_default.sep,
									"data-shimmer-decoration": true,
									"aria-hidden": true
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: clsx(bash_sample_module_css_default.summary, exitLabel === null && state === "error" && bash_sample_module_css_default.errorSummary, exitLabel === null && state === "stopped" && bash_sample_module_css_default.stoppedSummary),
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, { children: settlementLine ?? normalSummary })
								}),
								exitLabel !== null && (0, react_jsx_runtime.jsx)(ExitCodeBadge, { label: exitLabel })
							]
						})
					]
				}), open && (0, react_jsx_runtime.jsxs)("div", {
					className: bash_sample_module_css_default.bodyWrap,
					children: [terminal !== null ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TerminalBlock, {
						...terminal.card,
						maxLines: Infinity,
						labels,
						className: bash_sample_module_css_default.terminal
					}) : (0, react_jsx_runtime.jsxs)("div", {
						className: bash_sample_module_css_default.ioCard,
						children: [
							body !== null && (0, react_jsx_runtime.jsxs)("div", {
								className: bash_sample_module_css_default.ioSection,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: bash_sample_module_css_default.ioLabel,
									children: t("row.input")
								}), background ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.CommandText, {
									className: bash_sample_module_css_default.commandInput,
									text: body,
									label: t("row.commandArguments")
								}) : (0, react_jsx_runtime.jsx)("span", {
									className: bash_sample_module_css_default.ioText,
									children: body
								})]
							}),
							body !== null && model.output !== null && (0, react_jsx_runtime.jsx)("span", {
								className: bash_sample_module_css_default.ioDivider,
								"aria-hidden": true
							}),
							model.output !== null && (0, react_jsx_runtime.jsxs)("div", {
								className: bash_sample_module_css_default.ioSection,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: bash_sample_module_css_default.ioLabel,
									children: t("row.output")
								}), (0, react_jsx_runtime.jsx)("span", {
									className: bash_sample_module_css_default.ioText,
									"data-error": state === "error" || void 0,
									children: model.output
								})]
							})
						]
					}), inspect !== void 0 && (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: bash_sample_module_css_default.inspectButton,
						onClick: inspect,
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconInspectOutlineRegular, {}), t("row.inspect")]
					})]
				})]
			});
		});
		/** Registers the standalone Bash conversation-row sample. */
		const bashToolviewSample = {
			name: "bash-toolview-sample",
			inject: ["slots"],
			apply(ctx) {
				ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({
					name: "tool.call.toolview",
					key: "bash",
					locale: CONVERSATION_NS
				}, BashRow));
			}
		};
		//#endregion
		//#region lib/types/client/tool/toolviews/file-mutation-row.js
		const FILE_MUTATION_ICON = (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutlineRegular, { size: 14 });
		const CONTENT_FIELDS = [
			"content",
			"old_string",
			"new_string"
		];
		const KILOBYTE = 1024;
		/** Kilobytes of decoded input at every stage; null before any content field arrives. */
		function contentKilobytes(block) {
			const { args } = block;
			const open = CONTENT_FIELDS.find((key) => args.has(key) && !args.complete(key));
			const completed = CONTENT_FIELDS.reduce((total, key) => key !== open && args.complete(key) ? total + (args.stringLength(key, { step: KILOBYTE }) ?? 0) : total, 0);
			if (open === void 0) return CONTENT_FIELDS.some((key) => args.has(key)) ? Math.ceil(completed / KILOBYTE) : null;
			const chars = completed + (args.stringLength(open, {
				step: KILOBYTE,
				offset: completed
			}) ?? 0);
			return Math.ceil(chars / KILOBYTE);
		}
		/**
		* Shows the path and decoded input size through preparation, execution, and
		* settlement, with the applied diff available once the call settles.
		*/
		function FileMutationRow({ toolName, block, cwd, home, openFile, inspect, useDisclosure, t }) {
			const model = toolRowModel(toolName, block, cwd, home);
			const diff = diffCardModel(block);
			const kilobytes = contentKilobytes(block);
			const size = kilobytes === null ? null : t("tool.preparing.content", { kilobytes });
			return (0, react_jsx_runtime.jsx)(ToolRow, {
				useDisclosure,
				t,
				variant: model.variant,
				toolName,
				icon: FILE_MUTATION_ICON,
				title: t(model.titleKey),
				summary: model.summary,
				summarySuffix: size !== null && model.summary !== "" ? size : void 0,
				output: model.output,
				errorSummary: model.errorSummary,
				diff,
				state: model.state,
				filePath: model.filePath,
				onOpenFile: openFile,
				inspect
			});
		}
		/** Registers the edit and write conversation rows. */
		const fileMutationToolview = {
			name: "file-mutation-toolview",
			inject: ["slots"],
			apply(ctx) {
				ctx.slots.inject("tool.call.toolview", function* () {
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "edit",
						locale: CONVERSATION_NS
					}, FileMutationRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "write",
						locale: CONVERSATION_NS
					}, FileMutationRow);
				});
			}
		};
		//#endregion
		//#region lib/types/client/tool/toolviews/read-family-row.js
		/**
		* Compose a read-family row: the shared chrome and model-derived fields, plus the
		* caller's card material.
		* @param props - the toolview runtime share and locale seat.
		* @param card - the card props this row owns.
		* @returns the assembled ToolRow.
		*/
		function readFamilyRow({ toolName, block, cwd, home, openFile, inspect, useDisclosure, t }, card) {
			const model = toolRowModel(toolName, block, cwd, home);
			return (0, react_jsx_runtime.jsx)(ToolRow, {
				useDisclosure,
				t,
				variant: model.variant,
				toolName,
				icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconBrowseOutlineRegular, { size: 14 }),
				title: t(model.titleKey),
				summary: model.summary,
				bodyRaw: null,
				output: model.output,
				errorSummary: model.errorSummary,
				...card,
				state: model.state,
				filePath: model.filePath,
				onOpenFile: openFile,
				inspect
			});
		}
		//#endregion
		//#region lib/types/client/tool/toolviews/read-row.js
		/**
		* Lets users expand a completed read result and open its reported path at the
		* line the call started from.
		*/
		function ReadRow(props) {
			const { block, cwd, home } = props;
			return readFamilyRow(props, {
				read: readCardModel(block, cwd, home),
				filePathLine: readCallLine(block)
			});
		}
		/** Registers the read tool's conversation row. */
		const readToolview = {
			name: "read-toolview",
			inject: ["slots"],
			apply(ctx) {
				ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({
					name: "tool.call.toolview",
					key: "read",
					locale: CONVERSATION_NS
				}, ReadRow));
			}
		};
		//#endregion
		//#region lib/types/client/tool/models/image-card-model.js
		/**
		* Whether a wire value is a usable pixel or byte measure.
		* @param value - unvalidated wire value.
		* @returns true when it is a positive integer.
		*/
		function positiveInteger(value) {
			return typeof value === "number" && Number.isInteger(value) && value > 0;
		}
		/** The envelope `formatImageReadOutput` writes, matched by shape. */
		const IMAGE_ENVELOPE = /^<path>[^\n]*<\/path>\n<type>image<\/type>\n<content>\n[\s\S]*\n<\/content>$/u;
		/** The media types a durable image block may claim; anything else declines.
		*  Hand-written mirror of `ImageMediaType` from dsh-attachment — the wire
		*  boundary needs a runtime check and feature plugins must not import values
		*  from each other; a new member added there must be added here too, or the
		*  decline point below silently degrades that image to the generic card. */
		const IMAGE_MEDIA_TYPES = new Set([
			"image/png",
			"image/jpeg",
			"image/webp",
			"image/gif"
		]);
		/** Runtime membership check; the cast is safe because the set holds exactly the four members. */
		function isImageMediaType(value) {
			return IMAGE_MEDIA_TYPES.has(value);
		}
		/**
		* Narrow the persisted metadata, defensively. Every field arrives unvalidated on
		* replay (an obsolete or hand-edited log reaches here), so any mismatch declines
		* to the generic card rather than throwing. An absent `meta` (a nested call
		* persists none) leaves the path to the call's own `file_path` argument.
		*
		* The attachment id is checked for existence only: it is opaque and
		* provider-owned, and consumers must not parse that representation, so
		* pattern-matching the local content-address form would reject a legitimate id
		* minted by an alternative store.
		* @param meta - persisted presentation metadata of unknown shape.
		* @returns the narrowed path, or null when it does not match.
		*/
		function imageMeta(meta) {
			if (typeof meta !== "object" || meta === null || Array.isArray(meta)) return null;
			const { path } = meta;
			if (typeof path !== "string" || path === "") return null;
			return { path };
		}
		/**
		* Narrow every attachment reference carried by the result's image blocks, in
		* order.
		*
		* The content is the single source of truth for the references: it is what the
		* tool actually returned and what a post-execute hook would replace together
		* with the rest of the content. Every field arrives unvalidated over the wire,
		* so any malformed image block declines to the generic card rather than
		* rendering a partial gallery.
		*
		* The attachment id is checked for existence only — it is opaque and
		* provider-owned, so pattern-matching the local content-address form would reject
		* a legitimate id minted by an alternative store.
		* @param content - the settled result's content blocks.
		* @returns the narrowed references, or null when no valid image block is present.
		*/
		function imageReferences(content) {
			const refs = [];
			for (const part of content) {
				if (typeof part !== "object" || part === null) continue;
				const { type, attachment } = part;
				if (type !== "image") continue;
				if (typeof attachment !== "object" || attachment === null || Array.isArray(attachment)) return null;
				const { attachmentId, mediaType, bytes, width, height, name, originalDimensions } = attachment;
				if (typeof attachmentId !== "string" || attachmentId === "") return null;
				if (typeof mediaType !== "string" || !isImageMediaType(mediaType)) return null;
				if (!positiveInteger(bytes) || !positiveInteger(width) || !positiveInteger(height)) return null;
				if (name !== void 0 && typeof name !== "string") return null;
				let inputDimensions;
				if (originalDimensions !== void 0) {
					if (typeof originalDimensions !== "object" || originalDimensions === null || Array.isArray(originalDimensions)) return null;
					const { width: inputWidth, height: inputHeight } = originalDimensions;
					if (!positiveInteger(inputWidth) || !positiveInteger(inputHeight)) return null;
					inputDimensions = {
						width: inputWidth,
						height: inputHeight
					};
				}
				refs.push({
					attachmentId,
					mediaType,
					bytes,
					width,
					height,
					...name === void 0 ? {} : { name },
					...inputDimensions === void 0 ? {} : { originalDimensions: inputDimensions }
				});
			}
			return refs.length > 0 ? refs : null;
		}
		/**
		* Join the text blocks other than the image envelope, in order. A post-execute
		* hook that appends further text blocks keeps them visible under the gallery
		* instead of being dropped.
		* @param content - the settled result's text blocks.
		* @returns the joined text, or null when there is none.
		*/
		function extraTexts(content) {
			const parts = content.flatMap((part) => part.type === "text" && typeof part.text === "string" && !IMAGE_ENVELOPE.test(part.text) ? [part.text] : []);
			return parts.length > 0 ? parts.join("\n") : null;
		}
		/**
		* Whether the content carries only blocks the card consumes.
		*
		* `ContentBlock` is a merge-extensible union, so a post-execute hook could
		* append a block of a type this card does not render (reasoning, an extension
		* type, or a non-object). Rendering the card anyway would silently hide that
		* block, so anything beyond a well-formed text or image object declines to the
		* generic card, which shows the flattened content.
		* @param content - the settled result's content blocks.
		* @returns true when every block is a text or image object with usable fields.
		*/
		function fullyRendered(content) {
			return content.every((part) => {
				if (typeof part !== "object" || part === null) return false;
				const { type, text } = part;
				return type === "image" || type === "text" && typeof text === "string";
			});
		}
		/**
		* Derive a settled image card after validating the call head, persisted
		* metadata (or its argument fallback), and the model-facing image envelope.
		*
		* The card is result-side only: a call carries no content until `execute`
		* returns, so a running `read_image` has none and this returns null for it.
		* Both root and nested calls settle as ToolResultNode. Historical nested
		* records without presentation metadata fall back to the call's own
		* `file_path` argument for the path.
		* @param block - running or settled Tool block.
		* @returns the image-card props, or null for the generic path.
		*/
		function imageCardModel(block) {
			if (!("kind" in block) || block.isError) return null;
			const call = parsedToolCall(block);
			if (call?.name !== "read_image") return null;
			const { file_path: filePath } = call.args;
			if (typeof filePath !== "string" || filePath.trim() === "") return null;
			const path = imageMeta(block.meta)?.path ?? (block.parentCallId !== void 0 ? filePath : null);
			if (path === null) return null;
			if (!fullyRendered(block.content)) return null;
			const refs = imageReferences(block.content);
			if (refs === null) return null;
			if (!block.content.some((part) => part.type === "text" && typeof part.text === "string" && IMAGE_ENVELOPE.test(part.text))) return null;
			return {
				path,
				images: refs.map((ref) => ({ attachment: ref })),
				extraText: extraTexts(block.content)
			};
		}
		//#endregion
		//#region lib/types/client/tool/toolviews/read-image-row.js
		/**
		* read_image row: the read-family chrome with the durably committed image as the
		* row's collapsed-by-default card body, rendered through the `tool.call.images`
		* slot this entry declares.
		*/
		function ReadImageRow(props) {
			const { block, renderSlot, loadImage } = props;
			return readFamilyRow(props, {
				image: imageCardModel(block),
				renderSlot,
				loadImage
			});
		}
		/**
		* The read_image row as a plain registrant plugin following the atomic Tool-view
		* declaration across independent activation and reload lifetimes. Declaring
		* `tool.call.images` as a child slot authorizes this entry's `renderSlot` to
		* dispatch the gallery.
		*/
		const readImageToolview = {
			name: "read-image-toolview",
			inject: ["slots"],
			/**
			* Register the read_image row into the Tool-owned keyed view slot.
			* @param ctx - registrant context (disposal rides ctx.effect inside slots.register).
			*/
			apply(ctx) {
				ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({
					name: "tool.call.toolview",
					key: "read_image",
					locale: CONVERSATION_NS,
					children: { "tool.call.images": {
						kind: "single",
						scope: "session"
					} }
				}, ReadImageRow));
			}
		};
		//#endregion
		//#region lib/types/client/tool/toolviews/search-row.js
		const SEARCH_TITLE_KEYS = {
			grep: "tool.title.grep",
			glob: "tool.title.glob"
		};
		/** Lets users expand grep or glob results and recover capped searches. */
		function SearchRow({ toolName, block, inspect, useDisclosure, t }) {
			const model = toolRowModel(toolName, block);
			const search = searchCardModel(block);
			return (0, react_jsx_runtime.jsx)(ToolRow, {
				useDisclosure,
				t,
				variant: model.variant,
				toolName,
				icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSearchOutlineRegular, { size: 14 }),
				title: t(toolName === "grep" ? SEARCH_TITLE_KEYS.grep : toolName === "glob" ? SEARCH_TITLE_KEYS.glob : model.titleKey),
				summary: model.summary,
				output: model.output,
				errorSummary: model.errorSummary,
				search,
				state: model.state,
				inspect
			});
		}
		/** Registers the grep and glob conversation rows. */
		const searchToolview = {
			name: "search-toolview",
			inject: ["slots"],
			apply(ctx) {
				ctx.slots.inject("tool.call.toolview", function* () {
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "grep",
						locale: CONVERSATION_NS
					}, SearchRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "glob",
						locale: CONVERSATION_NS
					}, SearchRow);
				});
			}
		};
		//#endregion
		//#region lib/types/client/tool/models/detail-model-shared.js
		/**
		* Narrow parsed JSON to an object record.
		* @param value - Parsed result or argument value.
		* @returns Whether named fields can be read.
		*/
		function detailRecord(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		/**
		* Check a recorded string field that must contain visible text.
		* @param value - Parsed field value.
		* @returns Whether the field is a non-empty string after trimming.
		*/
		function nonempty(value) {
			return typeof value === "string" && value.trim() !== "";
		}
		/**
		* Decode an entire JSON result without accepting a partial prefix.
		* @param text - Recorded text.
		* @returns Parsed JSON, or undefined for non-JSON output.
		*/
		function detailJson(text) {
			try {
				return JSON.parse(text);
			} catch {
				return;
			}
		}
		const STATUS_KEYS = {
			running: "detail.status.running",
			idle: "detail.status.idle",
			ready: "detail.status.ready",
			inactive: "detail.status.inactive",
			provisioning: "detail.status.provisioning",
			failed: "detail.status.failed",
			error: "detail.status.failed",
			completed: "detail.status.completed",
			complete: "detail.status.completed",
			done: "detail.status.completed",
			pending: "detail.todo.pending",
			in_progress: "detail.todo.in_progress",
			deleted: "detail.status.deleted",
			killed: "detail.status.killed",
			blocked: "detail.goal.blocked",
			accepted: "detail.status.accepted",
			queued: "detail.status.queued"
		};
		/**
		* Give a recorded status its localized name and a static semantic color.
		* @param status - Result status, retained verbatim when the vocabulary is unknown.
		* @param t - Conversation translator.
		* @returns A badge that does not imply a live subscription.
		*/
		function detailBadge(status, t) {
			const key = Object.hasOwn(STATUS_KEYS, status) ? STATUS_KEYS[status] : void 0;
			const tone = [
				"completed",
				"complete",
				"done",
				"accepted"
			].includes(status) ? "success" : ["failed", "error"].includes(status) ? "error" : [
				"blocked",
				"killed",
				"pending",
				"queued",
				"inactive"
			].includes(status) ? "warning" : [
				"running",
				"in_progress",
				"provisioning"
			].includes(status) ? "info" : "neutral";
			return {
				label: key === void 0 ? status : t(key),
				tone
			};
		}
		const FIELD_KEYS = {
			id: "detail.field.id",
			revision: "detail.field.revision",
			platform: "detail.field.platform",
			provider: "detail.field.provider",
			model: "detail.field.model",
			role: "detail.field.role",
			context: "detail.field.context",
			ownerName: "detail.field.owner",
			ready: "detail.field.ready",
			blockedBy: "detail.field.dependencies",
			writeScopes: "detail.field.writeScopes",
			writeScopeWarnings: "detail.field.warnings",
			diagnostics: "detail.field.diagnostics",
			methods: "detail.field.methods",
			inputSchema: "detail.field.inputSchema",
			outputSchema: "detail.field.outputSchema",
			currentPackageId: "detail.field.currentPackage",
			nextPackageId: "detail.field.nextPackage",
			latestRun: "detail.field.latestRun",
			packages: "detail.field.packages",
			registrations: "detail.field.registrations",
			props: "detail.field.props",
			data: "detail.field.data",
			source: "detail.field.source",
			arguments: "row.input",
			content: "detail.field.content",
			message: "detail.field.message",
			messageId: "detail.field.messageId",
			status: "detail.state",
			root: "detail.field.root",
			pid: "detail.field.pid",
			type: "detail.field.type",
			time: "detail.field.time",
			seq: "detail.field.seq",
			turn: "detail.field.turn",
			step: "detail.field.step",
			callId: "detail.field.callId",
			agentsStarted: "detail.field.agents",
			output: "row.output",
			result: "detail.field.result"
		};
		/**
		* Name a known tool field while preserving extension-owned field names.
		* @param key - Recorded JSON property name.
		* @param t - Conversation translator.
		* @returns Localized known label or the original property name.
		*/
		function detailLabel(key, t) {
			const label = Object.hasOwn(FIELD_KEYS, key) ? FIELD_KEYS[key] : void 0;
			return label === void 0 ? key : t(label);
		}
		function scalar(value, t) {
			if (value === null) return t("detail.none");
			if (typeof value === "boolean") return t(value ? "detail.yes" : "detail.no");
			return typeof value === "string" ? value : JSON.stringify(value);
		}
		const INSPECTION_KEY_ORDER = [
			"subject",
			"title",
			"name",
			"pluginId",
			"packageId",
			"id",
			"summary"
		];
		const INSPECTION_DETAIL_KEYS = ["description", "purpose"];
		const MAX_INSPECTION_ITEMS = 40;
		/**
		* Project open inspection records into readable fields and named disclosures.
		* @param value - Parsed JSON, including provider-owned extension fields.
		* @param t - Conversation translator.
		* @param depth - Current disclosure depth; deeper records remain available as code.
		* @returns Entity rows preserving the order of visible values.
		*/
		function inspectionItems(value, t, depth = 0) {
			if (depth > 4 && value !== null && typeof value === "object") return [{
				code: {
					text: JSON.stringify(value, null, 2),
					language: "json"
				},
				fields: []
			}];
			if (Array.isArray(value)) {
				const items = value.slice(0, MAX_INSPECTION_ITEMS).flatMap((entry) => inspectionItems(entry, t, depth + 1));
				if (value.length > MAX_INSPECTION_ITEMS) items.push({
					description: t("detail.moreInInspect", { count: value.length - MAX_INSPECTION_ITEMS }),
					fields: []
				});
				return items.length === 0 ? [{
					description: t("detail.empty"),
					fields: []
				}] : items;
			}
			if (!detailRecord(value)) return [{
				description: scalar(value, t),
				fields: []
			}];
			const titleKey = INSPECTION_KEY_ORDER.find((key) => typeof value[key] === "string" && value[key] !== "");
			const descriptionKey = INSPECTION_DETAIL_KEYS.find((key) => typeof value[key] === "string" && value[key] !== "");
			const title = titleKey === void 0 ? void 0 : String(value[titleKey]);
			const fields = [];
			const groups = [];
			for (const [key, field] of Object.entries(value)) {
				if (key === titleKey || key === descriptionKey || key === "status" && typeof field === "string") continue;
				if (key === "inputSchema" || key === "outputSchema") {
					groups.push({
						label: detailLabel(key, t),
						items: [{
							fields: [],
							code: {
								text: JSON.stringify(field, null, 2),
								language: "json"
							}
						}]
					});
					continue;
				}
				if (Array.isArray(field) && field.length === 0) continue;
				if (key === "arguments" && typeof field === "string") {
					const args = detailJson(field);
					if (detailRecord(args)) {
						groups.push({
							label: detailLabel(key, t),
							items: inspectionItems(args, t, depth + 1)
						});
						continue;
					}
				}
				if (field !== null && typeof field === "object") groups.push({
					label: detailLabel(key, t),
					items: inspectionItems(field, t, depth + 1)
				});
				else fields.push({
					label: detailLabel(key, t),
					value: scalar(field, t)
				});
			}
			return [{
				...title === void 0 && typeof value.status !== "string" ? {} : { title: title ?? t("detail.field.result") },
				...descriptionKey === void 0 ? {} : { description: String(value[descriptionKey]) },
				...typeof value.status === "string" ? { badge: detailBadge(value.status, t) } : {},
				fields,
				...groups.length === 0 ? {} : { groups }
			}];
		}
		/**
		* Give a result list consistent historical context and empty-state copy.
		* @param items - Recorded result rows.
		* @param summary - Collapsed-row summary.
		* @param t - Conversation translator.
		* @returns A complete compact detail model.
		*/
		function detailList(items, summary, t) {
			return {
				items,
				summary,
				caption: t("detail.recordedResult"),
				empty: t("detail.empty")
			};
		}
		//#endregion
		//#region lib/types/client/tool/models/control-details-model.js
		const OUTPUT_TRUNCATED = "\n[output truncated]";
		function arg(args, key) {
			const value = args[key];
			return typeof value === "string" ? value : "";
		}
		function receipt(title, badge, t, fields = [], description) {
			return {
				...detailList([{
					title,
					badge,
					fields,
					...description === void 0 ? {} : { description }
				}], `${title} · ${badge.label}`, t),
				expandedSummary: title
			};
		}
		function agentList(text, json, t) {
			if (Array.isArray(json)) return detailList(inspectionItems(json, t), t("detail.agents.count", { count: json.length }), t);
			if (text === "(no subagents)") return detailList([], t("detail.agents.count", { count: 0 }), t);
			const items = [];
			for (const line of text.split("\n")) {
				const match = /^(\S+) \[([^\]]+)\](?: parent=(\S+) depth=(\d+))?(?: — (.*))?$/u.exec(line);
				if (match === null) return null;
				const [, id, state, parent, depth, title] = match;
				if (id === void 0 || state === void 0) return null;
				items.push({
					title: title ?? id,
					...title === void 0 ? {} : { subtitle: id },
					badge: detailBadge(state, t),
					fields: parent === void 0 ? [] : [{
						label: t("detail.field.parent"),
						value: parent
					}, {
						label: t("detail.field.depth"),
						value: depth ?? ""
					}]
				});
			}
			return detailList(items, t("detail.agents.count", { count: items.length }), t);
		}
		function jobList(text, t) {
			if (text === "(no background jobs)") return detailList([], t("detail.jobs.count", { count: 0 }), t);
			const items = [];
			for (const line of text.split("\n")) {
				const match = /^(\S+) \[([^\]]+)\] (\S+) — (.*)$/u.exec(line);
				if (match === null) return null;
				const [, id, kind, state, title] = match;
				if (id === void 0 || kind === void 0 || state === void 0 || title === void 0) return null;
				items.push({
					title,
					subtitle: id,
					badge: detailBadge(state, t),
					fields: [{
						label: t("detail.field.type"),
						value: kind
					}]
				});
			}
			return detailList(items, t("detail.jobs.count", { count: items.length }), t);
		}
		function terminalList(text, t) {
			if (text === "(no terminal sessions)") return detailList([], t("detail.terminals.count", { count: 0 }), t);
			const items = [];
			for (const line of text.split("\n")) {
				const match = /^(\S+)(?: \((.*?)\))? \[([^\]]+)\] (running|exited code=(\S+) signal=(\S+))(?: pid=(\d+))?$/u.exec(line);
				if (match === null) return null;
				const [, id, name, type, state, exitCode, signal, pid] = match;
				if (id === void 0 || type === void 0 || state === void 0) return null;
				const fields = [{
					label: t("detail.field.type"),
					value: type
				}];
				if (pid !== void 0) fields.push({
					label: t("detail.field.pid"),
					value: pid
				});
				if (exitCode !== void 0) fields.push({
					label: t("detail.field.exitCode"),
					value: exitCode
				});
				if (signal !== void 0 && signal !== "null") fields.push({
					label: t("detail.field.signal"),
					value: signal
				});
				items.push({
					title: name ?? id,
					...name === void 0 ? {} : { subtitle: id },
					badge: state === "running" ? detailBadge("running", t) : {
						label: t("detail.status.exited"),
						tone: exitCode === "0" ? "success" : "neutral"
					},
					fields
				});
			}
			return detailList(items, t("detail.terminals.count", { count: items.length }), t);
		}
		function lspDetails(args, text, t) {
			const file = arg(args, "file_path");
			const operation = arg(args, "operation");
			if (file === "" || typeof args.line !== "number" || typeof args.character !== "number") return null;
			const source = `${file}:${args.line}:${args.character}`;
			if (operation === "hover") return detailList([{
				title: source,
				location: {
					path: file,
					line: args.line
				},
				markdown: text,
				fields: []
			}], source, t);
			if (text === "No results.") return detailList([], t("detail.locations.count", { count: 0 }), t);
			const items = [];
			for (const line of text.split("\n")) {
				if (line.startsWith("… ")) {
					items.push({
						description: line,
						fields: []
					});
					continue;
				}
				const match = /^(.*):(\d+):(\d+)$/u.exec(line);
				if (match === null) return null;
				const [, path, row, column] = match;
				if (path === void 0 || row === void 0 || column === void 0) return null;
				const isUri = /^[a-z][a-z\d+.-]*:/iu.test(path) && !/^[a-z]:[\\/]/iu.test(path);
				items.push({
					title: path,
					subtitle: t("detail.location", {
						line: row,
						column
					}),
					fields: [],
					...isUri ? {} : { location: {
						path,
						line: Number(row)
					} }
				});
			}
			const count = items.filter((item) => item.title !== void 0).length;
			return detailList(items, `${file} · ${t("detail.locations.count", { count })}`, t);
		}
		/**
		* Derive entity lists and operation receipts from supported recorded output formats.
		* @param name - Wire tool name, including Team-scoped aliases.
		* @param args - Parsed recorded arguments.
		* @param text - Successful recorded result text.
		* @param json - Parsed whole-result JSON, or undefined for non-JSON text.
		* @param t - Conversation translator.
		* @returns Compact details, or null when the output format is not recognized.
		*/
		function controlDetails(name, args, text, json, t) {
			const target = arg(args, "target") || arg(args, "agent_id") || arg(args, "sessionId") || arg(args, "job_id");
			switch (name) {
				case "list_agents": return agentList(text, json, t);
				case "job_list": return jobList(text, t);
				case "terminal_list": return terminalList(text, t);
				case "lsp": return lspDetails(args, text, t);
				case "spawn_teammate":
					if (!detailRecord(json) || !detailRecord(json.member)) return null;
					return detailList(inspectionItems(json.member, t), arg(args, "name"), t);
				case "team_task_create":
				case "team_task_get":
				case "team_task_update":
					if (!detailRecord(json) || typeof json.subject !== "string") return null;
					return detailList(inspectionItems(json, t), json.subject, t);
				case "team_task_list":
					if (!detailRecord(json) || !Array.isArray(json.tasks)) return null;
					if (json.nextCursor !== void 0 && typeof json.nextCursor !== "number") return null;
					return {
						...detailList(inspectionItems(json.tasks, t), t("detail.tasks.count", { count: json.tasks.length }), t),
						...json.nextCursor === void 0 ? {} : { caption: t("detail.tasks.nextPage", { cursor: String(json.nextCursor) }) }
					};
				case "send_message": {
					const status = detailRecord(json) ? json.status : void 0;
					if (status === "accepted" || status === "queued") return receipt(target, {
						label: t(status === "queued" ? "detail.status.queued" : "detail.receipt.delivered"),
						tone: status === "queued" ? "warning" : "success"
					}, t, [], arg(args, "message"));
					return text === `message delivered to agent ${target}` ? receipt(target, {
						label: t("detail.receipt.delivered"),
						tone: "success"
					}, t, [], arg(args, "message")) : null;
				}
				case "interrupt_agent":
					if (detailRecord(json) && typeof json.previousStatus === "string") return receipt(target, {
						label: t("detail.receipt.interrupt"),
						tone: "warning"
					}, t, [{
						label: t("detail.field.previousStatus"),
						value: detailBadge(json.previousStatus, t).label
					}]);
					return text === `interrupt requested for agent ${target}` ? receipt(target, {
						label: t("detail.receipt.interrupt"),
						tone: "warning"
					}, t) : null;
				case "wait_agent":
					if (!detailRecord(json) || typeof json.timedOut !== "boolean") return null;
					if (detailRecord(json.noProgress) && typeof json.noProgress.message === "string") return detailList([{
						title: t("detail.wait.noProgress"),
						description: json.noProgress.message,
						fields: []
					}], t("detail.wait.noProgress"), t);
					return receipt(t("detail.wait.title"), {
						label: t(json.timedOut ? "detail.wait.timeout" : "detail.wait.changed"),
						tone: "neutral"
					}, t);
				case "subagent": {
					const started = /^started (background subagent job|subagent) (\S+)$/u.exec(text);
					if (started !== null) return receipt(arg(args, "prompt"), {
						label: t("detail.receipt.started"),
						tone: "info"
					}, t, [{
						label: t(started[1] === "subagent" ? "detail.field.agent" : "detail.field.job"),
						value: started[2] ?? ""
					}]);
					return detailList([{
						title: t("detail.agent.reply"),
						markdown: text,
						fields: [],
						groups: [{
							label: t("detail.field.task"),
							items: [{
								description: arg(args, "prompt"),
								fields: []
							}]
						}]
					}], t("detail.agent.reply"), t);
				}
				case "list_subagent_models": return detailList(text.split("\n").map((line) => {
					const split = line.indexOf(" — ");
					return split < 0 ? {
						description: line,
						fields: []
					} : {
						title: line.slice(0, split),
						description: line.slice(split + 3),
						fields: []
					};
				}), arg(args, "model") || arg(args, "provider") || t("detail.models.title"), t);
				case "job_output": {
					const match = /\n\[status: ([^,\]\n]+)(?:, ([^\]\n]+))?\]$/u.exec(text);
					if (match === null || match[1] === void 0) return null;
					const output = text.slice(0, match.index);
					const truncated = output.endsWith(OUTPUT_TRUNCATED);
					const code = truncated ? output.slice(0, -19) : output;
					const description = [match[2], truncated ? t("detail.output.truncated") : void 0].filter((value) => value !== void 0).join(" · ");
					return {
						...detailList([{
							title: target,
							badge: detailBadge(match[1], t),
							fields: [],
							...description === "" ? {} : { description },
							code: { text: code }
						}], `${target} · ${detailBadge(match[1], t).label}`, t),
						expandedSummary: target
					};
				}
				case "job_kill":
					if (text === `requested cancellation of job ${target}`) return receipt(target, {
						label: t("detail.receipt.cancel"),
						tone: "warning"
					}, t, [], arg(args, "reason"));
					if (text.startsWith(`job ${target} had already finished `)) return receipt(target, {
						label: t("detail.receipt.alreadyFinished"),
						tone: "neutral"
					}, t);
					return null;
				case "terminal_open": {
					const match = /^started terminal session (\S+)(?: \((.*?)\))? \[type: ([^\]]+)\]\n([\s\S]*)$/u.exec(text);
					if (match === null || match[1] === void 0 || match[3] === void 0 || match[4] === void 0) return null;
					return detailList([{
						title: match[2] ?? match[1],
						...match[2] === void 0 ? {} : { subtitle: match[1] },
						badge: {
							label: t("detail.receipt.started"),
							tone: "info"
						},
						fields: [{
							label: t("detail.field.type"),
							value: match[3]
						}],
						code: { text: match[4] }
					}], match[2] ?? match[1], t);
				}
				case "terminal_read": {
					const match = /\n\[lines: (\d+)-(\d+) of (\d+)\](\n\[output truncated\])?$/u.exec(text);
					if (match === null) return null;
					return detailList([{
						title: target,
						subtitle: t("detail.output.lines", {
							begin: match[1] ?? "",
							end: match[2] ?? "",
							total: match[3] ?? ""
						}),
						fields: [],
						code: { text: text.slice(0, match.index) },
						...match[4] === void 0 ? {} : { description: t("detail.output.truncated") }
					}], target, t);
				}
				case "terminal_signal": {
					const match = /^delivered (\S+) to foreground process group (\d+)$/u.exec(text);
					if (match === null || match[1] === void 0 || match[2] === void 0) return null;
					return receipt(target, {
						label: t("detail.receipt.signal"),
						tone: "success"
					}, t, [{
						label: t("detail.field.signal"),
						value: match[1]
					}, {
						label: t("detail.field.processGroup"),
						value: match[2]
					}]);
				}
				case "terminal_close":
					if (text === `closed terminal session ${target}`) return receipt(target, {
						label: t("detail.receipt.closed"),
						tone: "neutral"
					}, t);
					if (text === `terminal session ${target} was already closing`) return receipt(target, {
						label: t("detail.receipt.closing"),
						tone: "neutral"
					}, t);
					return null;
				default: return null;
			}
		}
		//#endregion
		//#region lib/types/client/tool/models/inspection-details-model.js
		function dateText(value, locale) {
			const date = new Date(value);
			if (!Number.isFinite(date.getTime())) return String(value);
			try {
				return new Intl.DateTimeFormat(locale, {
					dateStyle: "medium",
					timeStyle: "short"
				}).format(date);
			} catch {
				return String(value);
			}
		}
		function cordisDetails(name, args, value, t) {
			if (!detailRecord(value)) return null;
			if (name === "cordis_inspect_list") {
				if (!Array.isArray(value.providers)) return null;
				return detailList(inspectionItems(value.providers, t), t("detail.providers.count", { count: value.providers.length }), t);
			}
			if (name === "cordis_inspect_query") {
				if (!("data" in value) || typeof value.provider !== "string" || typeof value.method !== "string") return null;
				return detailList(inspectionItems(value.data, t), `${value.provider}.${value.method}`, t);
			}
			if (name === "cordis_inspect_self") {
				if (Array.isArray(value.plugins)) return detailList(inspectionItems(value.plugins, t), t("detail.plugins.count", { count: value.plugins.length }), t);
				return detailList(inspectionItems(value, t), String(args.pluginId ?? args.packageId ?? value.mode), t);
			}
			return null;
		}
		function workflowDetails(name, args, text, t) {
			if (name === "workflow") {
				const match = /^workflow "([\s\S]*?)" completed \((\d+) agents?\)\.\nReturn value:\n([\s\S]*)$/u.exec(text);
				if (match === null || match[1] === void 0 || match[2] === void 0 || match[3] === void 0) return null;
				const value = detailJson(match[3]);
				if (value === void 0) return null;
				return detailList([{
					title: match[1],
					badge: {
						label: t("detail.status.completed"),
						tone: "success"
					},
					fields: [{
						label: t("detail.field.agents"),
						value: match[2]
					}],
					...typeof args.code === "string" ? { groups: [{
						label: t("detail.workflow.script"),
						items: [{
							fields: [],
							code: {
								text: args.code,
								language: "javascript"
							}
						}]
					}] } : {}
				}, ...inspectionItems(value, t)], match[1], t);
			}
			const split = text.indexOf("\nFinal report:\n");
			if (split < 0) return null;
			const header = text.slice(0, split);
			const rounds = /\b(\d+) rounds?\b/u.exec(header)?.[1];
			const report = detailJson(text.slice(split + 15));
			if (!detailRecord(report) || typeof report.summary !== "string" || !Array.isArray(report.evidence) || !report.evidence.every((value) => typeof value === "string") || !Array.isArray(report.nextSteps) || !report.nextSteps.every((value) => typeof value === "string") || typeof report.blocker !== "string") return null;
			const badge = header.startsWith("Ralph worker reported completion ") ? {
				label: t("detail.ralph.reportedComplete"),
				tone: "success"
			} : header.startsWith("Ralph worker reported a blocker ") ? {
				label: t("detail.ralph.reportedBlocker"),
				tone: "warning"
			} : header.startsWith("Ralph reached its ") ? {
				label: t("detail.ralph.limit"),
				tone: "warning"
			} : void 0;
			if (badge === void 0) return null;
			const groups = [];
			if (report.nextSteps.length > 0) groups.push({
				label: t("detail.report.nextSteps"),
				items: [{
					fields: [],
					lines: report.nextSteps
				}]
			});
			if (typeof args.objective === "string") groups.push({
				label: t("detail.field.task"),
				items: [{
					fields: [],
					description: args.objective
				}]
			});
			const fields = rounds === void 0 ? [] : [{
				label: t("detail.goal.rounds"),
				value: rounds
			}];
			if (report.blocker !== "") fields.push({
				label: t("detail.goal.reason"),
				value: report.blocker
			});
			return detailList([{
				title: report.summary,
				badge,
				fields,
				...report.evidence.length === 0 ? {} : { lines: report.evidence },
				groups
			}], report.summary, t);
		}
		const TRACE_FIELDS = {
			Created: "detail.field.time",
			Availability: "detail.field.availability",
			Parent: "detail.field.parent",
			"Best match": "detail.field.bestMatch",
			Target: "detail.field.target",
			"Replaced by": "detail.trace.replacedBy",
			"Replacement chain": "detail.trace.replacementChain",
			"Events replaced by target": "detail.trace.replaces",
			"Events cited directly as sources": "detail.trace.sources",
			"Direct derived events": "detail.trace.derived"
		};
		function textFields(text, t, locale) {
			return text.split("\n").flatMap((line) => {
				const match = /^\s*([^:]+): (.+)$/u.exec(line);
				if (match === null || match[1] === void 0 || match[2] === void 0) return [];
				const key = Object.hasOwn(TRACE_FIELDS, match[1]) ? TRACE_FIELDS[match[1]] : void 0;
				if (key === void 0) return [];
				return [{
					label: t(key),
					value: match[1] === "Created" ? dateText(match[2], locale) : match[2] === "none" ? t("detail.none") : match[2]
				}];
			});
		}
		function searchDetails(name, text, t, locale) {
			if (text === "No prior session matches found." || text.endsWith("\n\nNo prior event matches found.")) return detailList([], t("detail.matches.count", { count: 0 }), t);
			const blocks = text.split(/\n(?=\d+\. )/u).filter((block) => /^\d+\. /u.test(block));
			if (blocks.length === 0) return null;
			const items = [];
			for (const block of blocks) {
				const snippet = /\n\s*Snippet: ([\s\S]*?)(?:\n\nResult cap reached\.|$)/u.exec(block)?.[1];
				if (name === "session_search") {
					const match = /^\d+\. Session (\S+) — (.*)/u.exec(block);
					if (match === null || match[1] === void 0 || match[2] === void 0) return null;
					items.push({
						title: match[2],
						subtitle: match[1],
						...snippet === void 0 ? {} : { description: snippet.trimEnd() },
						fields: textFields(block, t, locale)
					});
				} else {
					const match = /^\d+\. seq (\d+) \| ([^|]+) \| ([^|]+) \| ([^\n]+)/u.exec(block);
					if (match === null || match[1] === void 0 || match[2] === void 0 || match[3] === void 0 || match[4] === void 0) return null;
					items.push({
						title: snippet?.trimEnd() ?? match[2],
						subtitle: `${match[2].trim()} · #${match[1]}`,
						fields: [{
							label: t("detail.field.time"),
							value: dateText(match[4], locale)
						}, {
							label: t("detail.field.surface"),
							value: match[3].trim()
						}]
					});
				}
			}
			return {
				...detailList(items, t("detail.matches.count", { count: items.length }), t),
				...text.includes("Result cap reached.") ? { caption: t("detail.matches.capped") } : {}
			};
		}
		function eventReadDetails(text, t, locale) {
			const match = /^Session (\S+) — ([^\n]*)\nTarget event seq (\d+):\n```json\n([\s\S]*?)\n```([\s\S]*)$/u.exec(text);
			if (match === null || match[1] === void 0 || match[2] === void 0 || match[3] === void 0 || match[4] === void 0) return null;
			const event = detailJson(match[4]);
			if (!detailRecord(event) || typeof event.type !== "string" || !detailRecord(event.data)) return null;
			const fields = [{
				label: t("detail.field.seq"),
				value: match[3]
			}];
			if (typeof event.time === "number") fields.push({
				label: t("detail.field.time"),
				value: dateText(event.time, locale)
			});
			const groups = [];
			const adjacent = match[5]?.trim();
			if (adjacent) groups.push({
				label: t("detail.event.neighbors"),
				items: [{
					fields: [],
					description: adjacent
				}]
			});
			return detailList([
				{
					title: event.type,
					subtitle: `${match[2]} · ${match[1]}`,
					fields
				},
				...inspectionItems(event.data, t),
				...groups.length === 0 ? [] : [{
					fields: [],
					groups
				}]
			], `${event.type} · #${match[3]}`, t);
		}
		function traceDetails(name, text, t, locale) {
			const match = /^Session (\S+) — ([^\n]*)\n([\s\S]*)$/u.exec(text);
			if (match === null || match[1] === void 0 || match[2] === void 0 || match[3] === void 0) return null;
			if (name === "session_event_trace") return detailList([{
				title: match[2],
				subtitle: match[1],
				fields: textFields(match[3], t, locale)
			}], match[2], t);
			const sections = match[3].split("\n\n");
			const items = [{
				title: match[2],
				subtitle: match[1],
				fields: textFields(sections[0] ?? "", t, locale)
			}];
			for (const section of sections.slice(1)) {
				const firstBreak = section.indexOf("\n");
				const label = section.startsWith("Ancestors (nearest first):") ? t("detail.trace.ancestors") : section.startsWith("Descendants:") ? t("detail.trace.descendants") : void 0;
				if (label === void 0 || firstBreak < 0) return null;
				const body = section.slice(firstBreak + 1);
				items.push({
					title: label,
					fields: [],
					...body === "- none" || body === "- none (target is a root session)" ? { description: t("detail.none") } : { lines: body.split("\n").map((line) => line.replace(/^(\s*)- /u, "$1")) }
				});
			}
			return detailList(items, match[2], t);
		}
		/**
		* Present successful inspection, query, and workflow text as named records.
		* @param name - Wire tool name.
		* @param args - Recorded argument object.
		* @param text - Recorded result text.
		* @param json - Parsed whole-result JSON, or undefined for non-JSON text.
		* @param t - Conversation translator.
		* @param locale - Date display locale.
		* @returns Structured details, or null when an output format is unknown.
		*/
		function inspectionDetails(name, args, text, json, t, locale) {
			if (hasSpillNotice(text)) return null;
			switch (name) {
				case "cordis_inspect_list":
				case "cordis_inspect_query":
				case "cordis_inspect_self": return cordisDetails(name, args, json, t);
				case "workflow":
				case "ralph": return workflowDetails(name, args, text, t);
				case "session_search":
				case "session_event_search": return searchDetails(name, text, t, locale);
				case "session_event_read": return eventReadDetails(text, t, locale);
				case "session_trace":
				case "session_event_trace": return traceDetails(name, text, t, locale);
				default: return null;
			}
		}
		//#endregion
		//#region lib/types/client/tool/models/details-card-model.js
		function count(value) {
			return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
		}
		function formatDate(date, locale, fallback) {
			try {
				return new Intl.DateTimeFormat(locale, {
					year: "numeric",
					month: "short",
					day: "numeric",
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
					timeZoneName: "short"
				}).format(date);
			} catch {
				return fallback;
			}
		}
		/**
		* Derive the compact todo list from a todo_write call.
		* @param args - Parsed todo_write arguments.
		* @param t - Conversation dictionary translator.
		* @returns Localized todo details, or null for unsupported input.
		*/
		function todosDetail(args, t) {
			if (!Array.isArray(args.todos)) return null;
			const items = [];
			const seen = /* @__PURE__ */ new Set();
			for (const todo of args.todos) {
				if (!detailRecord(todo) || !nonempty(todo.content)) return null;
				const status = todo.status;
				if (status !== "completed" && status !== "in_progress" && status !== "pending") return null;
				const title = todo.content.trim();
				if (seen.has(title)) return null;
				seen.add(title);
				items.push({
					title,
					status: {
						value: status,
						label: t(`detail.todo.${status}`)
					},
					fields: []
				});
			}
			return {
				items,
				empty: t("detail.todo.empty")
			};
		}
		function goalDetail(value, t) {
			if (!detailRecord(value)) return null;
			if (value.goal === null) return {
				items: [],
				empty: t("detail.goal.empty")
			};
			const goal = value.goal;
			if (!detailRecord(goal) || !nonempty(goal.id) || !nonempty(goal.objective) || !count(goal.revision) || !count(goal.roundsStarted) || !count(goal.maxGoalRounds)) return null;
			const phase = goal.phase;
			if (phase !== "active" && phase !== "paused" && phase !== "blocked" && phase !== "complete") return null;
			if (value.activation !== "armed" && value.activation !== "disarmed") return null;
			const fields = [{
				label: t("detail.state"),
				value: t(phase === "active" && value.activation === "disarmed" ? "detail.goal.disarmed" : `detail.goal.${phase}`)
			}, {
				label: t("detail.goal.rounds"),
				value: `${goal.roundsStarted} / ${goal.maxGoalRounds}`
			}];
			if (goal.blockedReason !== void 0) {
				if (!detailRecord(goal.blockedReason) || !nonempty(goal.blockedReason.code) || !nonempty(goal.blockedReason.message)) return null;
				fields.push({
					label: t("detail.goal.reason"),
					value: goal.blockedReason.message
				});
			}
			return { items: [{
				title: goal.objective,
				fields
			}] };
		}
		/** ISO-weekday keys, Monday first: a stored weekly rule names days 1 through 7. */
		const WEEKDAY_KEYS = [
			"detail.weekday.1",
			"detail.weekday.2",
			"detail.weekday.3",
			"detail.weekday.4",
			"detail.weekday.5",
			"detail.weekday.6",
			"detail.weekday.7"
		];
		function interval(seconds, t) {
			if (seconds % 86400 === 0) return t("detail.days", { count: seconds / 86400 });
			if (seconds % 3600 === 0) return t("detail.hours", { count: seconds / 3600 });
			if (seconds % 60 === 0) return t("detail.minutes", { count: seconds / 60 });
			return t("detail.seconds", { count: seconds });
		}
		/** A stored wall clock without its zero seconds, the figure the schedule surfaces state. */
		function shortTime(time) {
			return time.replace(/:00\.000$/, "").replace(/\.000$/, "");
		}
		/** Localized weekday list of a stored weekly rule, or undefined when the set is empty or out of range. */
		function weekdayText(days, t) {
			if (!Array.isArray(days) || days.length === 0) return void 0;
			const labels = [];
			for (const day of days) {
				if (typeof day !== "number" || !Number.isInteger(day)) return void 0;
				const key = WEEKDAY_KEYS[day - 1];
				if (key === void 0) return void 0;
				labels.push(t(key));
			}
			return labels.join(t("detail.weekday.join"));
		}
		function scheduleItem(value, t, locale) {
			if (!detailRecord(value) || !nonempty(value.id) || !nonempty(value.prompt) || typeof value.scheduledAt !== "string" || value.deliveryMode !== "host" && value.deliveryMode !== "session-local" || value.state !== "scheduled" && value.state !== "overdue") return null;
			const date = new Date(value.scheduledAt);
			if (!Number.isFinite(date.getTime()) || date.toISOString() !== value.scheduledAt) return null;
			let frequency;
			switch (value.kind) {
				case "at":
					frequency = t("detail.schedule.once");
					break;
				case "after":
					if (!count(value.afterSeconds) || value.afterSeconds === 0) return null;
					frequency = t("detail.schedule.once");
					break;
				case "every":
					if (!count(value.everySeconds) || value.everySeconds === 0) return null;
					frequency = t("detail.schedule.every", { interval: interval(value.everySeconds, t) });
					break;
				case "daily":
					if (!nonempty(value.time) || !nonempty(value.timeZone)) return null;
					frequency = t("detail.schedule.daily", {
						time: shortTime(value.time),
						zone: value.timeZone
					});
					break;
				case "weekly": {
					const days = weekdayText(value.weekdays, t);
					if (!nonempty(value.time) || !nonempty(value.timeZone) || days === void 0) return null;
					frequency = t("detail.schedule.weekly", {
						days,
						time: shortTime(value.time),
						zone: value.timeZone
					});
					break;
				}
				case "cron":
					if (!nonempty(value.expression) || !nonempty(value.timeZone)) return null;
					frequency = t("detail.schedule.cron", {
						expression: value.expression,
						zone: value.timeZone
					});
					break;
				default: return null;
			}
			const dateText = formatDate(date, locale, value.scheduledAt);
			return {
				title: nonempty(value.title) ? value.title : value.prompt,
				fields: [
					{
						label: t("detail.schedule.when"),
						value: dateText
					},
					{
						label: t("detail.schedule.frequency"),
						value: frequency
					},
					{
						label: t("detail.state"),
						value: t(`detail.schedule.${value.state}`)
					}
				]
			};
		}
		/**
		* Derive a supported successful result, retaining generic output on unknown or malformed data.
		* @param block - Logged root or nested Tool call and its optional result.
		* @param t - Conversation dictionary translator.
		* @param locale - Display locale for absolute dates in the viewer's time zone.
		* @returns Localized detail data, or null for raw input/output.
		*/
		function detailsCardModel(block, t, locale) {
			if (!("kind" in block) || block.isError) return null;
			const call = parsedToolCall(block);
			if (call === null) return null;
			const text = singleResultText(block);
			if (text === void 0) return null;
			const value = detailJson(text);
			const details = controlDetails(call.name, call.args, text, value, t) ?? inspectionDetails(call.name, call.args, text, value, t, locale);
			if (details !== null) return details;
			if (value === void 0) return null;
			switch (call.name) {
				case "create_goal":
				case "get_goal":
				case "update_goal": return goalDetail(value, t);
				case "schedule_create":
				case "schedule_update": {
					const item = scheduleItem(value, t, locale);
					return item === null ? null : { items: [item] };
				}
				case "schedule_list": {
					if (!Array.isArray(value)) return null;
					const items = [];
					for (const entry of value) {
						const item = scheduleItem(entry, t, locale);
						if (item === null) return null;
						items.push(item);
					}
					return {
						items,
						summary: t("detail.schedule.count", { count: items.length }),
						empty: t("detail.schedule.empty")
					};
				}
				case "schedule_delete":
					if (!detailRecord(value) || !nonempty(value.id) || value.deleted !== true) return null;
					return { items: [{
						title: value.id,
						fields: [{
							label: t("detail.state"),
							value: t("detail.schedule.deleted")
						}]
					}] };
				default: return null;
			}
		}
		//#endregion
		//#region lib/types/client/tool/toolviews/details-row.js
		/** Keyed recorded-result rows sharing the compact detail body. */
		const LSP_TITLE_KEYS = {
			goToDefinition: "tool.title.findDefinition",
			findReferences: "tool.title.findReferences",
			goToImplementation: "tool.title.findImplementation",
			hover: "tool.title.hoverSymbol"
		};
		/** Teammate-coordination tools presented with the two-person team icon. */
		const TEAMMATE_TOOLS = new Set([
			"spawn_teammate",
			"list_agents",
			"send_message",
			"interrupt_agent",
			"wait_agent"
		]);
		function detailIcon(toolName) {
			if (TEAMMATE_TOOLS.has(toolName)) return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconUsersOutlineRegular, { size: 14 });
			if (toolName.startsWith("schedule_")) return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconClockOutlineRegular, { size: 14 });
			if (toolName.endsWith("_goal")) return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconGoalOutlineRegular, { size: 14 });
			if (toolName.startsWith("cordis_")) return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCordisPluginOutlineRegular, {});
			if (toolName.startsWith("terminal_")) return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCodeOutlineRegular, { size: 14 });
			if (toolName.startsWith("session_") || toolName === "lsp") return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSearchOutlineRegular, { size: 14 });
			if (toolName.startsWith("job_") || toolName.startsWith("team_task_")) return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChecklistOutlineRegular, {});
			if (toolName === "workflow" || toolName === "ralph") return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconBranchOutlineRegular, { size: 14 });
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconAgentPresetOutlineRegular, { size: 14 });
		}
		/**
		* Present recorded entities, receipts, and report fields in the existing expandable row.
		* @param props - Tool call, row actions, and locale supplied by the keyed slot.
		* @returns A Tool row with structured details or generic input/output.
		*/
		function DetailsRow({ toolName, block, cwd, home, openFile, inspect, useDisclosure, t }) {
			const model = toolRowModel(toolName, block, cwd, home);
			const locale = document.documentElement.lang;
			const details = (0, react.useMemo)(() => detailsCardModel(block, t, locale), [
				block,
				t,
				locale
			]);
			const operation = toolName === "lsp" ? parsedToolCall(block)?.args.operation : void 0;
			const titleKey = typeof operation === "string" && Object.hasOwn(LSP_TITLE_KEYS, operation) ? LSP_TITLE_KEYS[operation] : model.titleKey;
			return (0, react_jsx_runtime.jsx)(ToolRow, {
				useDisclosure,
				t,
				variant: model.variant,
				toolName,
				icon: detailIcon(toolName),
				title: t(titleKey),
				summary: details?.summary ?? details?.items[0]?.title ?? details?.empty ?? model.summary,
				details,
				bodyRaw: model.bodyRaw,
				output: model.output,
				errorSummary: model.errorSummary,
				state: model.state,
				inspect,
				onOpenFile: openFile
			});
		}
		/** Register recorded-result details through the standard atomic Tool slot. */
		const detailsToolview = {
			name: "details-toolview",
			inject: ["slots"],
			apply(ctx) {
				ctx.slots.inject("tool.call.toolview", function* () {
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "create_goal",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "get_goal",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "update_goal",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "schedule_create",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "schedule_list",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "schedule_delete",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "schedule_update",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "cordis_inspect_list",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "cordis_inspect_query",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "cordis_inspect_self",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "workflow",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "ralph",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "session_event_read",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "session_event_search",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "session_event_trace",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "session_search",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "session_trace",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "list_subagent_models",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "subagent",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "list_agents",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "send_message",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "interrupt_agent",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "job_list",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "job_output",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "job_kill",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "terminal_open",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "terminal_read",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "terminal_list",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "terminal_signal",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "terminal_close",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "lsp",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "spawn_teammate",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "team_task_create",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "team_task_get",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "team_task_update",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "team_task_list",
						locale: CONVERSATION_NS
					}, DetailsRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "wait_agent",
						locale: CONVERSATION_NS
					}, DetailsRow);
				});
			}
		};
		//#endregion
		//#region lib/types/client/tool/models/todo-history.js
		/** Durable writes are indexed independently of Tool success receipts. */
		const todoWriteDefinition = {
			kind: "tool-todo-write",
			match: (event) => event.type === "todo/write" ? {
				id: String(event.seq),
				role: "start"
			} : null,
			start: (_context, match) => {
				if (match.event.type !== "todo/write") throw new Error("tool-todo-write requires todo/write");
				return match.event.data.todos;
			},
			update: (context) => context.state,
			publication: () => "none"
		};
		/** Invocation predecessors are repaired by the assembler when older history arrives. */
		const todoCallDefinition = {
			kind: "tool-todo-call",
			target: "tool-todo-history",
			match: (event) => {
				if (event.type === "tool/call" && event.data.name === "todo_write") return {
					id: String(event.data.callId),
					role: "start"
				};
				if (event.type === "tool/ptc-dispatch-start" && event.data.name === "todo_write") return {
					id: String(event.data.subCallId),
					role: "start"
				};
				return null;
			},
			start: (_context, _match, reader) => ({ todos: reader.previous("tool-todo-write")?.state }),
			update: (context) => context.state,
			buildViewNode: (context) => context.state === void 0 ? null : {
				key: context.key,
				kind: context.kind,
				id: context.id,
				target: "tool-todo-history",
				data: context.state
			}
		};
		/** Incremental lookup snapshots preserve earlier call baselines across later writes. */
		const todoHistoryView = {
			target: "tool-todo-history",
			create: () => {
				let calls = /* @__PURE__ */ new Map();
				return {
					empty: calls,
					replace: ({ nodes }) => calls = new Map(nodes.map((node) => [node.id, node.data])),
					apply: ({ upserts }) => {
						if (upserts.length > 0) {
							calls = new Map(calls);
							for (const node of upserts) calls.set(node.id, node.data);
						}
						return calls;
					}
				};
			}
		};
		/**
		* Install the recorded-write index and call predecessor target.
		* @param ctx - Tool presentation plugin context.
		*/
		function registerTodoHistory(ctx) {
			ctx.uiConversation.events.register(todoWriteDefinition);
			ctx.uiConversation.events.register(todoCallDefinition);
			ctx.uiConversation.views.register(todoHistoryView);
		}
		//#endregion
		//#region lib/types/client/tool/models/todo-diff-model.js
		/**
		* Compare this write with its predecessor in the loaded call history.
		* @param block - The write being displayed.
		* @param baseline - List recorded before this call, or undefined when its start is unavailable.
		* @param hasMore - Whether older unloaded history may contain a preceding list.
		* @param t - Conversation dictionary translator.
		* @returns Details and a change summary, or null for generic Tool output.
		*/
		function todoDiffModel(block, baseline, hasMore, t) {
			if (!("kind" in block) || block.isError) return null;
			const call = parsedToolCall(block);
			const current = call?.name === "todo_write" ? todosDetail(call.args, t) : null;
			if (current === null) return null;
			const previous = baseline?.todos === void 0 ? null : { items: baseline.todos.map((todo) => ({
				title: todo.content,
				status: {
					value: todo.status,
					label: t(`detail.todo.${todo.status}`)
				},
				fields: []
			})) };
			if (baseline === void 0 || previous === null && hasMore) return {
				details: {
					...current,
					caption: t("todo.diff.unavailable")
				},
				summary: null
			};
			const previousByTitle = new Map(previous?.items.map((item) => [item.title, item]));
			const currentTitles = new Set(current.items.map((item) => item.title));
			const retainedPositions = new Map(previous?.items.filter((item) => currentTitles.has(item.title)).map((item, index) => [item.title, index]));
			let retainedIndex = 0;
			const items = [];
			const unchanged = [];
			let added = 0;
			let updated = 0;
			for (const item of current.items) {
				const before = previousByTitle.get(item.title);
				previousByTitle.delete(item.title);
				if (before === void 0) {
					added++;
					items.push({
						...item,
						change: {
							value: "added",
							label: t("todo.diff.addedItem")
						}
					});
				} else {
					const moved = retainedPositions.get(item.title) !== retainedIndex++;
					const statusChanged = before.status?.value !== item.status?.value;
					if (statusChanged || moved) {
						updated++;
						items.push({
							...item,
							...statusChanged && before.status !== void 0 ? { previousStatus: before.status.label } : {},
							change: {
								value: "updated",
								label: t(statusChanged ? "todo.diff.updatedItem" : "todo.diff.movedItem")
							}
						});
					} else unchanged.push(item);
				}
			}
			for (const item of previousByTitle.values()) items.push({
				...item,
				change: {
					value: "removed",
					label: t("todo.diff.removedItem")
				}
			});
			return {
				summary: [
					added > 0 ? t("todo.diff.added", { count: added }) : null,
					updated > 0 ? t("todo.diff.updated", { count: updated }) : null,
					previousByTitle.size > 0 ? t("todo.diff.removed", { count: previousByTitle.size }) : null
				].filter((part) => part !== null).join(" · ") || t("todo.diff.noChanges"),
				details: {
					items,
					caption: t(previous === null ? "todo.diff.initial" : "todo.diff.compare"),
					empty: current.items.length === 0 && previous === null ? t("detail.todo.empty") : t("todo.diff.noChanges"),
					...unchanged.length === 0 ? {} : { unchanged: {
						label: t("todo.diff.unchanged", { count: unchanged.length }),
						items: unchanged
					} }
				}
			};
		}
		//#endregion
		//#region lib/types/client/tool/toolviews/plan-summary.js
		/**
		* Pure plan derivation for the todo_write row's one-line summary. Several items
		* may be `in_progress` at once — parallel work runs concurrent tasks, so a
		* summary built from one active item would silently drop the rest. The plan
		* strip header derives its own counts inline and shares nothing with this, so
		* this stays inside the toolviews domain rather than in `contract/` (the
		* inter-domain face).
		* @module
		*/
		/**
		* Derive the counts and the active summary from a whole-list snapshot. It names
		* the first `in_progress` item and counts the remaining active ones, so a
		* parallel plan reports how many tasks are running rather than naming one and
		* hiding the others. `activeContent` is null when nothing is in progress, or
		* when the first active item's content is missing, mistyped, or blank once
		* trimmed — the tool's own rule for usable content, applied here because a
		* rejected call keeps its args verbatim. The row then renders the counts alone
		* rather than falling back to the generic tool summary: the counts are already
		* known to be good, and the active-item clause is the only part an unusable
		* name costs.
		* @param todos - the whole list, in model order.
		* @returns the done/total counts and the two summary halves.
		*/
		function planSummary(todos) {
			const active = todos.filter((t) => t.status === "in_progress");
			const first = active[0]?.content;
			const named = typeof first === "string" && first.trim() !== "";
			return {
				done: todos.filter((t) => t.status === "completed").length,
				total: todos.length,
				activeContent: named ? first : null,
				activeExtra: named ? active.length - 1 : 0
			};
		}
		//#endregion
		//#region lib/types/client/tool/toolviews/todo-row.js
		function isItem(value) {
			return typeof value === "object" && value !== null;
		}
		function summarize(argsRaw, t) {
			if (argsRaw === null) return null;
			let parsed;
			try {
				parsed = JSON.parse(argsRaw);
			} catch {
				return null;
			}
			if (typeof parsed !== "object" || parsed === null) return null;
			const todos = parsed.todos;
			if (!Array.isArray(todos) || !todos.every(isItem)) return null;
			const { done, total, activeContent, activeExtra } = planSummary(todos);
			const head = t("todo.completed", {
				done,
				total
			});
			return {
				text: activeContent === null ? head : `${head} · ${activeContent}`,
				extra: activeExtra
			};
		}
		/** Summarizes a plan update without presenting a cancelled call as completed. */
		function TodoRow({ toolName, block, inspect, useDisclosure, useTodoHistory, useSession, t }) {
			const baseline = useTodoHistory((snapshot) => snapshot?.get(block.callId));
			const hasMore = useSession((snapshot) => snapshot.hasMore);
			const diff = (0, react.useMemo)(() => todoDiffModel(block, baseline, hasMore, t), [
				block,
				baseline,
				hasMore,
				t
			]);
			const model = toolRowModel(toolName, block);
			const summary = summarize(model.bodyRaw, t) ?? {
				text: model.summary,
				extra: 0
			};
			return (0, react_jsx_runtime.jsx)(ToolRow, {
				useDisclosure,
				t,
				variant: model.variant,
				toolName,
				icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChecklistOutlineRegular, {}),
				title: t(model.titleKey),
				summary: summary.text,
				summarySuffix: [diff?.summary, summary.extra > 0 ? `+${summary.extra}` : null].filter((part) => part !== null && part !== void 0).join(" · ") || null,
				bodyRaw: model.bodyRaw,
				output: model.output,
				details: diff?.details,
				errorSummary: model.errorSummary,
				state: model.state,
				inspect
			});
		}
		/** Registers the todo conversation row. */
		const todoToolview = {
			name: "todo-toolview",
			inject: ["slots", "uiConversation"],
			apply(ctx) {
				registerTodoHistory(ctx);
				ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({
					name: "tool.call.toolview",
					key: "todo_write",
					locale: CONVERSATION_NS,
					inject: (sessionId) => ({ hooks: { todoHistory: ctx.uiConversation.binding(sessionId).target("tool-todo-history") } })
				}, TodoRow));
			}
		};
		//#endregion
		//#region lib/types/client/tool/toolviews/web-row.js
		const WEB_TITLE_KEYS = {
			web_search: "tool.title.webSearch",
			web_fetch: "tool.title.webFetch"
		};
		/** Lets users expand a completed web search or fetch result. */
		function WebRow({ toolName, block, inspect, useDisclosure, t }) {
			const model = toolRowModel(toolName, block);
			const web = webCardModel(block);
			const icon = toolName === "web_fetch" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconBrowseOutlineRegular, { size: 14 }) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconGlobeOutlineRegular, { size: 14 });
			return (0, react_jsx_runtime.jsx)(ToolRow, {
				useDisclosure,
				t,
				variant: model.variant,
				toolName,
				icon,
				title: t(toolName === "web_search" ? WEB_TITLE_KEYS.web_search : toolName === "web_fetch" ? WEB_TITLE_KEYS.web_fetch : model.titleKey),
				summary: model.summary,
				output: model.output,
				errorSummary: model.errorSummary,
				web,
				href: webFetchHref(block),
				state: model.state,
				inspect
			});
		}
		/** Registers the web search and fetch conversation rows. */
		const webToolview = {
			name: "web-toolview",
			inject: ["slots"],
			apply(ctx) {
				ctx.slots.inject("tool.call.toolview", function* () {
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "web_search",
						locale: CONVERSATION_NS
					}, WebRow);
					yield ctx.slots.register({
						name: "tool.call.toolview",
						key: "web_fetch",
						locale: CONVERSATION_NS
					}, WebRow);
				});
			}
		};
		//#endregion
		//#region lib/types/client/apply.js
		/** Required services: the slot registry and the Remote face carrying the Host home used for POSIX `~`. */
		const inject = ["slots", "remote"];
		/**
		* Mount the whole-Tool renderers and built-in atomic Tool registrations.
		* @param ctx - Client root context.
		*/
		function apply(ctx) {
			const hostInfo = {
				getSnapshot: () => ctx.remote.$host,
				subscribe: (listener) => ctx.on("connection/reset", listener)
			};
			const toolInject = () => ({ hooks: { hostInfo } });
			ctx.slots.inject("conversation.chat.node", () => ctx.slots.register({
				name: "conversation.chat.node",
				key: "tool-call",
				locale: CONVERSATION_NS,
				children: { "tool.call.toolview": {
					kind: "keyed",
					scope: "session"
				} },
				inject: toolInject
			}, ToolCallTree));
			ctx.plugin(bashToolviewSample);
			ctx.plugin(readToolview);
			ctx.plugin(readImageToolview);
			ctx.plugin(fileMutationToolview);
			ctx.plugin(searchToolview);
			ctx.plugin(webToolview);
			ctx.plugin(todoToolview);
			ctx.plugin(detailsToolview);
			ctx.plugin(askQuestionToolview);
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
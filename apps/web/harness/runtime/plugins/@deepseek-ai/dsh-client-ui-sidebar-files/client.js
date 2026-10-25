window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-sidebar-files",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		require("@deepseek-ai/cordis");
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		//#region lib/types/client/definition.js
		/** The tab kind this package owns. */
		const FILES_KIND = "files";
		/** This implementation's identity in the tab system, and the key its body registers under. */
		const FILES_ID = "@deepseek-ai/dsh-client-ui-sidebar-files";
		/**
		* The files type's registry definition.
		* @param t - namespace-bound translate, read fresh on every label call.
		* @returns the definition to register.
		*/
		function filesDefinition(t) {
			return {
				id: FILES_ID,
				kind: FILES_KIND,
				priority: "builtin",
				title: () => t("type.label"),
				guide: [{
					id: "workspace",
					commandId: "workspace.files",
					order: 10,
					title: () => t("guide.title"),
					description: () => t("guide.description"),
					icon: _deepseek_ai_dsh_client_ui_primitives.GuideArtworkFiles
				}]
			};
		}
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
		//#endregion
		//#region ../../typert/protocol/src/index.ts
		/**
		* Remote decorators and explicit Gateway bindings backed by versioned
		* descriptors carried on decorated class prototypes. Strict reflection
		* remains a Typert compiler responsibility.
		* @module @deepseek-ai/dsh-typert-protocol
		*/
		//#endregion
		//#region lib/types/client/directory-node.js
		/** One open directory and its active child nodes; cached view preferences live in the store. */
		var DirectoryNode = class DirectoryNode {
			path;
			load;
			watch;
			failed;
			restore;
			/** Open direct-child directories, keyed by absolute path. */
			children = /* @__PURE__ */ new Map();
			controller = new AbortController();
			signal;
			task;
			reading;
			dirty = false;
			initialized = false;
			automatic = true;
			constructor(path, load, watch, failed, lifetime, restore = []) {
				this.path = path;
				this.load = load;
				this.watch = watch;
				this.failed = failed;
				this.restore = restore;
				this.signal = AbortSignal.any([lifetime, this.controller.signal]);
			}
			/**
			* Start observation once; readiness triggers the initial listing.
			* @returns this node.
			*/
			open() {
				this.task ??= this.follow();
				return this;
			}
			/**
			* Find an active node in this subtree.
			* @param path - absolute directory path.
			* @returns the matching node, or undefined when that directory is closed.
			*/
			find(path) {
				if (path === this.path) return this;
				for (const child of this.children.values()) {
					const found = child.find(path);
					if (found !== void 0) return found;
				}
			}
			/**
			* Update the expansion preferences used by pending directory listings.
			* @param expanded - latest expansion preferences from the store.
			*/
			setExpanded(expanded) {
				this.restore = expanded;
				for (const child of this.children.values()) child.setExpanded(expanded);
			}
			/**
			* Open a direct child using this node's lifetime and automatic-refresh setting.
			* @param path - absolute direct-child directory path.
			* @param restore - descendant expansion preferences to restore after listing.
			* @returns the active child, or undefined after cancellation.
			*/
			expand(path, restore = []) {
				if (this.signal.aborted) return void 0;
				let child = this.children.get(path);
				if (child === void 0) {
					child = new DirectoryNode(path, this.load, this.watch, this.failed, this.signal, restore);
					child.automatic = this.automatic;
					this.children.set(path, child);
				}
				return child.open();
			}
			/**
			* Remove a child and its pending restoration preferences.
			* @param path - absolute direct-child directory path.
			* @returns once the child subtree's reads and watches have ended.
			*/
			async collapse(path) {
				this.restore = this.restore.filter((value) => value !== path && !value.startsWith(`${path}/`));
				const child = this.children.get(path);
				this.children.delete(path);
				await child?.close();
			}
			/**
			* Control subtree rereads without ending subscriptions.
			* @param enabled - refresh dirty nodes automatically.
			*/
			setAutomatic(enabled) {
				this.automatic = enabled;
				if (enabled && this.dirty) this.refresh();
				for (const child of this.children.values()) child.setAutomatic(enabled);
			}
			/** Queue a reread, coalescing with active work. @returns completion of the active read and its coalesced rereads. */
			refresh() {
				this.dirty = true;
				this.reading ??= this.read();
				return this.reading;
			}
			/** Refresh this node and its open descendants. @returns once their listings settle. */
			async refreshTree() {
				await this.refresh();
				await Promise.all([...this.children.values()].map((child) => child.refreshTree()));
			}
			/** Cancel the active subtree. @returns once all owned reads and watches have ended. */
			async close() {
				this.controller.abort();
				await Promise.all([
					this.task,
					this.reading,
					...[...this.children.values()].map((child) => child.close())
				]);
				this.children.clear();
			}
			async follow() {
				try {
					for await (const _event of this.watch(this.path, this.signal)) {
						this.dirty = true;
						if (!this.initialized || this.automatic) this.refresh();
					}
				} catch (error) {
					if (!this.signal.aborted) {
						if (!this.initialized) await this.refresh();
						if (!(typeof error === "object" && error !== null && "code" in error && error.code === "workspace-file/watch-unsupported")) this.failed(this.path, error);
					}
				}
			}
			async read() {
				const readAgain = () => this.dirty && this.automatic && !this.signal.aborted;
				try {
					do {
						this.dirty = false;
						const level = await this.load(this.path, this.signal);
						if (this.signal.aborted || level === void 0) return;
						this.initialized = true;
						const directories = new Set(level.entries.filter((entry) => entry.type === "directory").map((entry) => `${this.path.replace(/[/\\]+$/, "")}/${entry.name}`));
						for (const path of this.children.keys()) if (!directories.has(path)) await this.collapse(path);
						for (const path of directories) if (this.restore.includes(path)) this.expand(path, this.restore);
						this.restore = [];
					} while (readAgain());
				} finally {
					this.reading = void 0;
				}
			}
		};
		//#endregion
		//#region lib/types/client/face.js
		/**
		* Bind directory observation to the Remote stream supervisor.
		* @param remote - Client Remote with workspace file streams.
		* @returns a watcher that awaits stream disposal when its node ends.
		*/
		function createWatch(remote) {
			return async function* (sessionId, path, signal) {
				const aborted = () => signal.aborted;
				if (aborted()) return;
				const stream = remote.$stream({
					name: `directory ${path}`,
					open: (lifetime) => remote.workspaceFiles.changes(sessionId, path, lifetime),
					ended: () => /* @__PURE__ */ new Error(`Directory watch ended: ${path}`)
				});
				const abort = () => {
					stream.dispose();
				};
				signal.addEventListener("abort", abort, { once: true });
				try {
					for await (const item of stream) {
						if (aborted()) return;
						if (item.value.kind === "ready") item.accept();
						yield item.value.kind;
					}
				} finally {
					signal.removeEventListener("abort", abort);
					await stream.dispose();
				}
			};
		}
		/**
		* Bind the listing to one Remote face, keeping only what the tree stores.
		* @param remote - the Client Remote face carrying the `workspaceFiles` namespace.
		* @returns the listing the tree's face performs.
		*/
		function createList(remote) {
			return async (sessionId, path, signal) => {
				const result = await remote.workspaceFiles.list(sessionId, path, signal);
				if (!result.ok) return result;
				return {
					ok: true,
					value: {
						entries: result.value.entries,
						truncated: result.value.truncated
					}
				};
			};
		}
		/**
		* The absolute path of one child entry.
		*
		* Joined with `/` whatever the parent's separators: the Host resolves mixed
		* separators, and the tree only needs a stable key.
		* @param parent - absolute path of the listed directory.
		* @param name - the entry's basename.
		* @returns the child's absolute path.
		*/
		function childPath(parent, name) {
			return `${parent.replace(/[/\\]+$/, "")}/${name}`;
		}
		/**
		* Bind the tree's face to one directory listing.
		* @param list - the bound `workspaceFiles.list` call.
		* @param watch - target-scoped directory observation.
		* @returns the Slot `inject` factory: session and bound actions in, face out.
		*/
		function filesFace(list, watch) {
			return (sessionId, actions) => {
				/** Per tab, per absolute path: the listing generation a settlement must match; the latest request wins. */
				const generations = /* @__PURE__ */ new Map();
				const roots = /* @__PURE__ */ new Map();
				const nextGeneration = (tabId, path) => {
					const byPath = generations.get(tabId) ?? /* @__PURE__ */ new Map();
					generations.set(tabId, byPath);
					const generation = (byPath.get(path) ?? 0) + 1;
					byPath.set(path, generation);
					return generation;
				};
				const load = async (tabId, path, signal) => {
					if (signal.aborted) return;
					const generation = nextGeneration(tabId, path);
					actions.loading(tabId, path);
					return list(sessionId, path, signal).then((result) => {
						if (signal.aborted || generations.get(tabId)?.get(path) !== generation) return;
						if (result.ok) actions.loaded(tabId, path, result.value);
						else actions.failed(tabId, path, result.error);
						return result.ok ? result.value : void 0;
					});
				};
				return {
					refresh: (tabId) => {
						roots.get(tabId)?.refreshTree();
					},
					setAutoRefresh: (tabId, enabled) => {
						actions.autoRefresh(tabId, enabled);
						roots.get(tabId)?.setAutomatic(enabled);
					},
					start(tabId, root, signal) {
						actions.start(tabId, root);
						signal.addEventListener("abort", () => {
							roots.get(tabId)?.close();
							roots.delete(tabId);
							generations.delete(tabId);
							actions.forget(tabId);
						}, { once: true });
						roots.set(tabId, new DirectoryNode(root, (path, lifetime) => load(tabId, path, lifetime), (path, lifetime) => watch(sessionId, path, lifetime), (path, error) => {
							if (!signal.aborted) actions.failed(tabId, path, new RemoteError("gateway/internal", error instanceof Error ? error.message : String(error), {}));
						}, signal).open());
					},
					load: (tabId, path, signal) => {
						load(tabId, path, signal);
					},
					toggle(tabId, parentPath, path, expanded, signal) {
						if (signal.aborted) return;
						const root = roots.get(tabId);
						if (root === void 0) return;
						const parent = root.find(parentPath);
						if (parent === void 0 && !expanded.includes(parentPath)) return;
						const collapsing = expanded.includes(path);
						const next = collapsing ? expanded.filter((value) => value !== path) : [...expanded, path];
						root.setExpanded(next);
						if (collapsing) parent?.collapse(path);
						else parent?.expand(path, next);
						actions.toggled(tabId, path);
					}
				};
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
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-sidebar-files/src/client/FilesBody.module.css.mjs
		const css = ".Ze9Z_a_root{height:100%;min-height:0;color:var(--dsw-alias-label-primary);font-size:var(--dsh-content-font-size-secondary,13px);flex-direction:column;flex:auto;line-height:1.5;display:flex}.Ze9Z_a_header{box-sizing:border-box;border-bottom:.5px solid var(--dsw-alias-border-l3);flex:none;align-items:center;gap:4px;height:38px;padding:0 6px 0 16px;display:flex}.Ze9Z_a_path{margin-right:12px}.Ze9Z_a_body{scrollbar-gutter:stable;flex:auto;min-height:0;margin-right:2px;padding:8px 0 8px 8px;overflow:auto}.Ze9Z_a_body::-webkit-scrollbar-track{margin:2px}.Ze9Z_a_level{margin:0;padding:0;list-style:none}.Ze9Z_a_level .Ze9Z_a_level{padding-left:18px}.Ze9Z_a_item{margin:0;padding:0}.Ze9Z_a_row{width:100%;min-width:0;color:inherit;font:inherit;text-align:left;border-radius:var(--dsw-radius-md);cursor:pointer;background:0 0;border:0;align-items:center;gap:6px;padding:5px 10px;display:flex}@media (hover:hover){.Ze9Z_a_row:hover{background:var(--dsw-alias-interactive-bg-hover)}}.Ze9Z_a_icon{color:var(--dsw-alias-label-tertiary);flex:none}.Ze9Z_a_fileIcon{flex:none}.Ze9Z_a_name{white-space:nowrap;text-overflow:ellipsis;min-width:0;overflow:hidden}.Ze9Z_a_other{color:var(--dsw-alias-label-tertiary);cursor:default}@media (hover:hover){.Ze9Z_a_other:hover{background:0 0}}.Ze9Z_a_note{color:var(--dsw-alias-label-tertiary);margin:0;padding:3px 10px;font-size:12px}.Ze9Z_a_status{flex-direction:column;padding:12px 10px;display:flex}.Ze9Z_a_statusLine{color:var(--dsw-alias-label-secondary);font-size:var(--dsh-content-font-size-secondary,13px);margin:0;line-height:1.6}.Ze9Z_a_tool{width:28px;height:28px;color:var(--dsw-alias-label-secondary);border-radius:var(--dsw-radius-sm);cursor:pointer;background:0 0;border:none;flex:none;justify-content:center;align-items:center;padding:6px;line-height:1;display:inline-flex}.Ze9Z_a_tool svg{width:15px;height:15px}@media (hover:hover){.Ze9Z_a_tool:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}}.Ze9Z_a_tool[aria-pressed=true]{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}.Ze9Z_a_titleIcon{flex:none}";
		const tagId = "@deepseek-ai/dsh-client-ui-sidebar-files/FilesBody.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-sidebar-files";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var FilesBody_module_css_default = {
			"body": "Ze9Z_a_body",
			"fileIcon": "Ze9Z_a_fileIcon",
			"header": "Ze9Z_a_header",
			"icon": "Ze9Z_a_icon",
			"item": "Ze9Z_a_item",
			"level": "Ze9Z_a_level",
			"name": "Ze9Z_a_name",
			"note": "Ze9Z_a_note",
			"other": "Ze9Z_a_other",
			"path": "Ze9Z_a_path",
			"root": "Ze9Z_a_root",
			"row": "Ze9Z_a_row",
			"status": "Ze9Z_a_status",
			"statusLine": "Ze9Z_a_statusLine",
			"titleIcon": "Ze9Z_a_titleIcon",
			"tool": "Ze9Z_a_tool"
		};
		//#endregion
		//#region lib/types/client/FilesBody.js
		/**
		* The file tree's body: the session's workspace root, listed one level at a time.
		*
		* Everything the tree keeps lives in its store, keyed by tab; everything it asks
		* for goes through its injected face. The component itself only decides what to
		* draw for each absolute path and what a click means: a directory toggles, a
		* file opens through the owner's `tabActions` for a `file:` viewer to claim, and
		* anything else is shown but refuses to open. The header uses the shared
		* PathLabel for the root, followed by reload and workspace directory actions.
		*/
		/** Natural, case-insensitive name order, so `file2` precedes `file10`. */
		const byName = new Intl.Collator(void 0, {
			numeric: true,
			sensitivity: "base"
		});
		/**
		* Order one level's entries for display: directories first, then everything
		* else, each group by name. The endpoint's order is a listing fact; this is the
		* reader's.
		* @param entries - the listing as the endpoint returned it.
		* @returns a new array, directories first, then by name within each group.
		*/
		function orderEntries(entries) {
			return [...entries].sort((left, right) => {
				const group = Number(right.type === "directory") - Number(left.type === "directory");
				return group !== 0 ? group : byName.compare(left.name, right.name);
			});
		}
		/**
		* Say why a directory could not be listed, in terms of the directory.
		* @param t - namespace-bound translate.
		* @param failure - the settled Remote failure.
		* @returns the line to show under the directory.
		*/
		function failureLine(t, failure) {
			switch (failure.code) {
				case "workspace-file/not-found": return t("error.notFound");
				case "workspace-file/outside-workspace": return t("error.outsideWorkspace");
				case "workspace-file/not-directory": return t("error.notDirectory");
				default: return t("error.unavailable", { message: failure.message });
			}
		}
		/** One entry's row, and its children when it is an expanded directory. */
		function Entry({ parent, entry, tree }) {
			const path = childPath(parent, entry.name);
			if (entry.type === "directory") {
				const expanded = tree.state.expanded.includes(path);
				return (0, react_jsx_runtime.jsxs)("li", {
					className: FilesBody_module_css_default.item,
					"data-files-entry": "directory",
					"data-files-path": path,
					children: [(0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: FilesBody_module_css_default.row,
						"aria-expanded": expanded,
						onClick: () => {
							tree.onToggle(parent, path);
						},
						children: [expanded ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderOpenRegular, { className: FilesBody_module_css_default.icon }) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderCloseRegular, { className: FilesBody_module_css_default.icon }), (0, react_jsx_runtime.jsx)("span", {
							className: FilesBody_module_css_default.name,
							children: entry.name
						})]
					}), expanded && (0, react_jsx_runtime.jsx)("ul", {
						className: FilesBody_module_css_default.level,
						children: (0, react_jsx_runtime.jsx)(Level, {
							path,
							tree
						})
					})]
				});
			}
			if (entry.type === "file") return (0, react_jsx_runtime.jsx)("li", {
				className: FilesBody_module_css_default.item,
				"data-files-entry": "file",
				"data-files-path": path,
				children: (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: FilesBody_module_css_default.row,
					onClick: () => {
						tree.onOpen(path);
					},
					children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, {
						kind: (0, _deepseek_ai_dsh_client_ui_primitives.classifyFileType)(entry.name),
						size: 16,
						className: FilesBody_module_css_default.fileIcon
					}), (0, react_jsx_runtime.jsx)("span", {
						className: FilesBody_module_css_default.name,
						children: entry.name
					})]
				})
			});
			return (0, react_jsx_runtime.jsx)("li", {
				className: FilesBody_module_css_default.item,
				"data-files-entry": "other",
				"data-files-path": path,
				children: (0, react_jsx_runtime.jsx)("span", {
					className: clsx(FilesBody_module_css_default.row, FilesBody_module_css_default.other),
					"aria-disabled": "true",
					title: tree.t("entry.other"),
					children: (0, react_jsx_runtime.jsx)("span", {
						className: FilesBody_module_css_default.name,
						children: entry.name
					})
				})
			});
		}
		/** One directory's rows: its state while listing, its entries once listed. */
		function Level({ path, tree }) {
			const { state, t } = tree;
			const level = state.levels[path];
			if (level === void 0 || level.kind === "loading") return (0, react_jsx_runtime.jsx)("li", {
				className: FilesBody_module_css_default.note,
				"data-files-row": "loading",
				children: t("loading")
			});
			if (level.kind === "failed") return (0, react_jsx_runtime.jsx)("li", {
				className: FilesBody_module_css_default.note,
				"data-files-row": "failed",
				"data-files-code": level.failure.code,
				children: failureLine(t, level.failure)
			});
			const entries = orderEntries(level.level.entries);
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				level.failure !== void 0 && (0, react_jsx_runtime.jsx)("li", {
					className: FilesBody_module_css_default.note,
					"data-files-row": "failed",
					children: failureLine(t, level.failure)
				}),
				entries.length === 0 && (0, react_jsx_runtime.jsx)("li", {
					className: FilesBody_module_css_default.note,
					"data-files-row": "empty",
					children: t("empty")
				}),
				entries.map((entry) => (0, react_jsx_runtime.jsx)(Entry, {
					parent: path,
					entry,
					tree
				}, entry.name)),
				level.level.truncated && (0, react_jsx_runtime.jsx)("li", {
					className: FilesBody_module_css_default.note,
					"data-files-row": "truncated",
					children: t("truncated")
				})
			] });
		}
		/** The file tree's body: the workspace root and whatever the reader has opened under it. */
		function FilesBody({ useTabInfo, sessionId, useSessions, useStore, actions, start, refresh, setAutoRefresh, toggle, t, renderSlot }) {
			const { tab } = useTabInfo();
			(0, react.useEffect)(() => tab.actions.bindCommands({ refresh: () => {
				refresh(tab.id);
			} }), [
				tab.actions,
				tab.id,
				refresh
			]);
			const { signal, actions: tabActions } = tab;
			const cwd = useSessions((sessions) => sessions.byId[sessionId]?.cwd);
			const state = useStore((store) => store.byTab[tab.id]);
			const bodyRef = (0, react.useRef)(null);
			const scrollTopRef = (0, react.useRef)(0);
			const seeded = state !== void 0;
			(0, react.useLayoutEffect)(() => {
				const body = bodyRef.current;
				if (seeded && body !== null) {
					body.scrollTop = state.scrollTop;
					scrollTopRef.current = body.scrollTop;
				}
			}, [seeded]);
			(0, react.useEffect)(() => () => {
				if (seeded && !signal.aborted) actions.scrolled(tab.id, scrollTopRef.current);
			}, [
				seeded,
				signal,
				tab.id,
				actions
			]);
			(0, react.useEffect)(() => {
				if (state !== void 0 || cwd === void 0 || signal.aborted) return;
				start(tab.id, cwd, signal);
			}, [
				state,
				cwd,
				tab.id,
				signal,
				start
			]);
			if (cwd === void 0) return (0, react_jsx_runtime.jsx)("div", {
				className: FilesBody_module_css_default.status,
				"data-files-state": "no-workspace",
				children: (0, react_jsx_runtime.jsx)("p", {
					className: FilesBody_module_css_default.statusLine,
					children: t("noWorkspace")
				})
			});
			if (state === void 0) return null;
			const tree = {
				state,
				onToggle: (parent, path) => {
					toggle(tab.id, parent, path, state.expanded, signal);
				},
				onOpen: (path) => {
					tabActions.openResource(fileAddressFor(sessionId, state.root, path));
				},
				t
			};
			const reload = () => {
				refresh(tab.id);
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: FilesBody_module_css_default.root,
				"data-files-state": "tree",
				"data-files-root": state.root,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: FilesBody_module_css_default.header,
					children: [
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.PathLabel, {
							path: state.root,
							className: FilesBody_module_css_default.path,
							"data-files-path": true
						}),
						(0, react_jsx_runtime.jsx)("span", {
							hidden: true,
							children: (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: FilesBody_module_css_default.tool,
								"aria-label": t("autoRefresh"),
								"aria-pressed": state.autoRefresh,
								"data-files-auto-refresh": true,
								title: t(state.autoRefresh ? "autoRefresh.disable" : "autoRefresh.enable"),
								onClick: () => {
									setAutoRefresh(tab.id, !state.autoRefresh);
								},
								children: state.autoRefresh ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPauseOutlineRegular, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlayOutlineRegular, {})
							})
						}),
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
							label: t("reload"),
							shortcutKeys: tab.refreshShortcut?.keys,
							side: "bottom",
							delayMs: 500,
							children: (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: FilesBody_module_css_default.tool,
								"aria-label": t("reload"),
								"aria-keyshortcuts": tab.refreshShortcut?.aria,
								"data-files-reload": true,
								onClick: reload,
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutlineRegular, {})
							})
						}),
						renderSlot("sidebar.right.tab.files.actions", { absolutePath: state.root })
					]
				}), (0, react_jsx_runtime.jsx)("div", {
					ref: bodyRef,
					className: FilesBody_module_css_default.body,
					"data-files-body": true,
					onScroll: (event) => {
						scrollTopRef.current = event.currentTarget.scrollTop;
					},
					children: (0, react_jsx_runtime.jsx)("ul", {
						className: FilesBody_module_css_default.level,
						children: (0, react_jsx_runtime.jsx)(Level, {
							path: state.root,
							tree
						})
					})
				})]
			});
		}
		//#endregion
		//#region lib/types/client/FilesTitle.js
		/**
		* The title as the chip and a floating panel's header show it.
		* @param props - the tab information hook.
		* @returns the folder sheet followed by the tab's title text.
		*/
		function FilesTitle({ useTabInfo }) {
			const { tab } = useTabInfo();
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, {
				kind: "folder",
				size: 16,
				className: FilesBody_module_css_default.titleIcon
			}), tab.title] });
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** Simplified Chinese dictionary and key-set source of truth. */
		const zh = {
			"shortcut.noSession": "请先选择会话",
			"type.label": "文件",
			"guide.title": "工作区文件",
			"guide.description": "浏览会话工作区的文件",
			loading: "正在读取…",
			empty: "空目录",
			truncated: "条目太多，只显示了一部分。",
			noWorkspace: "这个会话没有工作区目录。",
			reload: "重新读取",
			autoRefresh: "自动刷新",
			"autoRefresh.enable": "开启自动刷新",
			"autoRefresh.disable": "关闭自动刷新",
			"entry.other": "这不是文件或目录，没法打开。",
			"error.notFound": "这个目录不在了。可能已被移动或删除。",
			"error.outsideWorkspace": "这个目录在工作区之外，侧栏不会读取它。",
			"error.notDirectory": "这不是一个目录。",
			"error.unavailable": "读取失败：{message}"
		};
		/** English dictionary, checked against the Chinese key set. */
		const en = {
			"shortcut.noSession": "Select a session first",
			"type.label": "Files",
			"guide.title": "Workspace files",
			"guide.description": "Browse files in this session's workspace",
			loading: "Reading…",
			empty: "Empty directory",
			truncated: "Too many entries, showing only some of them.",
			noWorkspace: "This session has no workspace directory.",
			reload: "Reload",
			autoRefresh: "Auto refresh",
			"autoRefresh.enable": "Enable auto refresh",
			"autoRefresh.disable": "Disable auto refresh",
			"entry.other": "Not a file or a directory, so it cannot be opened.",
			"error.notFound": "That directory is gone. It may have been moved or deleted.",
			"error.outsideWorkspace": "That directory is outside the workspace, so the sidebar will not read it.",
			"error.notDirectory": "That is not a directory.",
			"error.unavailable": "Read failed: {message}"
		};
		/** Japanese copy, checked against the English keys. */
		const ja = {
			"shortcut.noSession": "先にセッションを選択してください",
			"type.label": "ファイル",
			"guide.title": "ワークスペースのファイル",
			"guide.description": "このセッションのワークスペース内のファイルを参照",
			"loading": "読み取り中…",
			"empty": "空のディレクトリ",
			"truncated": "エントリが多すぎるため、一部のみ表示しています。",
			"noWorkspace": "このセッションにはワークスペースディレクトリがありません。",
			"reload": "再読み込み",
			"autoRefresh": "自動更新",
			"autoRefresh.enable": "自動更新を有効にする",
			"autoRefresh.disable": "自動更新を無効にする",
			"entry.other": "ファイルでもディレクトリでもないため、開けません。",
			"error.notFound": "そのディレクトリは存在しません。移動または削除された可能性があります。",
			"error.outsideWorkspace": "そのディレクトリはワークスペース外のため、サイドバーでは読み取りません。",
			"error.notDirectory": "それはディレクトリではありません。",
			"error.unavailable": "読み取りに失敗しました: {message}"
		};
		/** Spanish dictionary, checked against the English keys. */
		const es = {
			"shortcut.noSession": "Seleccione una sesión primero",
			"type.label": "Archivos",
			"guide.title": "Archivos de espacio de trabajo",
			"guide.description": "Explorar archivos en el espacio de trabajo de esta sesión",
			loading: "Leyendo…",
			empty: "directorio vacio",
			truncated: "Demasiadas entradas y solo se muestran algunas de ellas.",
			noWorkspace: "Esta sesión no tiene ningún directorio de espacio de trabajo.",
			reload: "recargar",
			autoRefresh: "Actualización automática",
			"autoRefresh.enable": "Habilitar actualización automática",
			"autoRefresh.disable": "Deshabilitar la actualización automática",
			"entry.other": "No es un archivo ni un directorio, por lo que no se puede abrir.",
			"error.notFound": "Ese directorio desapareció. Es posible que se haya movido o eliminado.",
			"error.outsideWorkspace": "Ese directorio está fuera del espacio de trabajo, por lo que la barra lateral no lo leerá.",
			"error.notDirectory": "Eso no es un directorio.",
			"error.unavailable": "Error de lectura: {message}"
		};
		/** French dictionary, checked against the English keys. */
		const fr = {
			"shortcut.noSession": "Sélectionnez d'abord une session",
			"type.label": "Fichiers",
			"guide.title": "Fichiers de l'espace de travail",
			"guide.description": "Parcourir les fichiers dans l'espace de travail de cette session",
			loading: "Lecture…",
			empty: "Répertoire vide",
			truncated: "Trop d'entrées, n'en affichant que certaines.",
			noWorkspace: "Cette session n'a pas de répertoire d'espace de travail.",
			reload: "Recharger",
			autoRefresh: "Actualisation automatique",
			"autoRefresh.enable": "Activer l'actualisation automatique",
			"autoRefresh.disable": "Désactiver l'actualisation automatique",
			"entry.other": "Il ne s'agit pas d'un fichier ou d'un répertoire, il ne peut donc pas être ouvert.",
			"error.notFound": "Ce répertoire a disparu. Il a peut-être été déplacé ou supprimé.",
			"error.outsideWorkspace": "Ce répertoire se trouve en dehors de l’espace de travail, donc la barre latérale ne le lira pas.",
			"error.notDirectory": "Ce n'est pas un répertoire.",
			"error.unavailable": "Échec de lecture\xA0: {message}"
		};
		/** German dictionary, checked against the English keys. */
		const de = {
			"shortcut.noSession": "Wählen Sie zunächst eine Sitzung aus",
			"type.label": "Dateien",
			"guide.title": "Arbeitsbereichsdateien",
			"guide.description": "Durchsuchen Sie die Dateien im Arbeitsbereich dieser Sitzung",
			loading: "Lesen…",
			empty: "Leeres Verzeichnis",
			truncated: "Zu viele Einträge, es werden nur einige davon angezeigt.",
			noWorkspace: "Diese Sitzung hat kein Arbeitsbereichsverzeichnis.",
			reload: "Neu laden",
			autoRefresh: "Automatische Aktualisierung",
			"autoRefresh.enable": "Aktivieren Sie die automatische Aktualisierung",
			"autoRefresh.disable": "Deaktivieren Sie die automatische Aktualisierung",
			"entry.other": "Keine Datei oder kein Verzeichnis, daher kann sie nicht geöffnet werden.",
			"error.notFound": "Dieses Verzeichnis ist weg. Möglicherweise wurde es verschoben oder gelöscht.",
			"error.outsideWorkspace": "Dieses Verzeichnis liegt außerhalb des Arbeitsbereichs und wird daher von der Seitenleiste nicht gelesen.",
			"error.notDirectory": "Das ist kein Verzeichnis.",
			"error.unavailable": "Lesen fehlgeschlagen: {message}"
		};
		/** Russian dictionary, checked against the English keys. */
		const ru = {
			"shortcut.noSession": "Сначала выберите сеанс",
			"type.label": "Файлы",
			"guide.title": "Файлы рабочей области",
			"guide.description": "Просмотр файлов в рабочей области этого сеанса",
			loading: "Чтение…",
			empty: "Пустой каталог",
			truncated: "Слишком много записей, показаны только некоторые из них.",
			noWorkspace: "В этом сеансе нет каталога рабочей области.",
			reload: "Перезагрузить",
			autoRefresh: "Автоматическое обновление",
			"autoRefresh.enable": "Включить автоматическое обновление",
			"autoRefresh.disable": "Отключить автоматическое обновление",
			"entry.other": "Это не файл и не каталог, поэтому его нельзя открыть.",
			"error.notFound": "Этот каталог исчез. Возможно, оно было перемещено или удалено.",
			"error.outsideWorkspace": "Этот каталог находится за пределами рабочей области, поэтому боковая панель его не читает.",
			"error.notDirectory": "Это не каталог.",
			"error.unavailable": "Не удалось прочитать: {message}."
		};
		/** Portuguese dictionary, checked against the English keys. */
		const pt = {
			"shortcut.noSession": "Selecione uma sessão primeiro",
			"type.label": "Arquivos",
			"guide.title": "Arquivos do espaço de trabalho",
			"guide.description": "Procure arquivos no espaço de trabalho desta sessão",
			loading: "Lendo…",
			empty: "Diretório vazio",
			truncated: "Muitas entradas, mostrando apenas algumas delas.",
			noWorkspace: "Esta sessão não possui diretório de espaço de trabalho.",
			reload: "Recarregar",
			autoRefresh: "Atualização automática",
			"autoRefresh.enable": "Ativar atualização automática",
			"autoRefresh.disable": "Desativar atualização automática",
			"entry.other": "Não é um arquivo ou diretório, portanto não pode ser aberto.",
			"error.notFound": "Esse diretório desapareceu. Pode ter sido movido ou excluído.",
			"error.outsideWorkspace": "Esse diretório está fora da área de trabalho, portanto a barra lateral não o lerá.",
			"error.notDirectory": "Isso não é um diretório.",
			"error.unavailable": "Falha na leitura: {message}"
		};
		//#endregion
		//#region lib/types/client/store.js
		/**
		* The file tree's view state: which directories are expanded, what each
		* loaded level contains, and where the body is scrolled to.
		*
		* The tree is not one resource. A directory listing per level, expanded lazily,
		* is state the type owns — so it lives in a Slot-standard exclusive store
		* (one instance per session), bucketed by tab id because two tabs of this kind
		* in one session expand independently.
		*
		* Writers run between `start` and `forget`: the owner's `signal` is what ends a
		* bucket's life, and the face stops dispatching once it aborts.
		*/
		/**
		* One tab's bucket, which every writer after `start` relies on: the face only
		* dispatches while the record's signal is live, and `forget` runs on its abort.
		* @param state - the draft.
		* @param tabId - the tab being written.
		* @returns the tab's tree.
		*/
		function bucket(state, tabId) {
			const tree = state.byTab[tabId];
			if (tree === void 0) throw new Error(`ui-sidebar-files: no tree for tab "${tabId}"`);
			return tree;
		}
		/**
		* Declare the file tree's store.
		*
		* A factory rather than a shared handle: the registration declares it as an
		* exclusive store, so the framework mints one instance per session.
		* @returns the store handle to declare on the registration.
		*/
		function createFilesStore() {
			return (0, _deepseek_ai_dsh_client_store.defineStore)({
				init: () => ({ byTab: {} }),
				actions: {
					autoRefresh: (d, tabId, enabled) => {
						bucket(d, tabId).autoRefresh = enabled;
					},
					/**
					* Seed one tab's tree at its workspace root, with the root expanded.
					* @param d - draft state.
					* @param tabId - the tab being drawn.
					* @param root - absolute path of the workspace root.
					*/
					start: (d, tabId, root) => {
						d.byTab[tabId] = {
							root,
							levels: {},
							expanded: [root],
							scrollTop: 0,
							autoRefresh: true
						};
					},
					/**
					* Mark one directory as being listed.
					* @param d - draft state.
					* @param tabId - the tab being drawn.
					* @param path - absolute directory path.
					*/
					loading: (d, tabId, path) => {
						const state = bucket(d, tabId);
						if (state.levels[path]?.kind !== "ready") state.levels[path] = { kind: "loading" };
					},
					/**
					* Record one directory's contents.
					* @param d - draft state.
					* @param tabId - the tab being drawn.
					* @param path - absolute directory path.
					* @param level - the listing to show under it.
					*/
					loaded: (d, tabId, path, level) => {
						const state = bucket(d, tabId);
						const previous = state.levels[path];
						if (previous?.kind === "ready") {
							const directories = new Set(level.entries.filter((entry) => entry.type === "directory").map((entry) => entry.name));
							for (const entry of previous.level.entries) {
								if (entry.type !== "directory" || directories.has(entry.name)) continue;
								const removed = `${path.replace(/[/\\]+$/, "")}/${entry.name}`;
								state.expanded = state.expanded.filter((value) => value !== removed && !value.startsWith(`${removed}/`));
								state.levels = Object.fromEntries(Object.entries(state.levels).filter(([key]) => key !== removed && !key.startsWith(`${removed}/`)));
							}
						}
						state.levels[path] = {
							kind: "ready",
							level
						};
					},
					/**
					* Record why one directory could not be listed.
					* @param d - draft state.
					* @param tabId - the tab being drawn.
					* @param path - absolute directory path.
					* @param failure - the settled Remote failure.
					*/
					failed: (d, tabId, path, failure) => {
						const level = bucket(d, tabId).levels[path];
						bucket(d, tabId).levels[path] = level?.kind === "ready" ? {
							...level,
							failure
						} : {
							kind: "failed",
							failure
						};
					},
					/**
					* Open a collapsed directory, or collapse an open one.
					*
					* A collapsed level keeps what it loaded, so reopening it draws at once.
					* @param d - draft state.
					* @param tabId - the tab being drawn.
					* @param path - absolute directory path.
					*/
					toggled: (d, tabId, path) => {
						const state = bucket(d, tabId);
						const at = state.expanded.indexOf(path);
						if (at >= 0) state.expanded.splice(at, 1);
						else state.expanded.push(path);
					},
					/**
					* Record where one tab's body is scrolled to.
					* @param d - draft state.
					* @param tabId - the tab being drawn.
					* @param scrollTop - the body's scroll offset, in px.
					*/
					scrolled: (d, tabId, scrollTop) => {
						bucket(d, tabId).scrollTop = scrollTop;
					},
					/**
					* Drop every loaded level, keeping what is expanded.
					*
					* This is the reload gesture's first half: the expanded set says which
					* levels to fetch again.
					* @param d - draft state.
					* @param tabId - the tab being drawn.
					*/
					reset: (d, tabId) => {
						bucket(d, tabId).levels = {};
					},
					/**
					* Forget one tab's tree, for a tab record that is gone.
					* @param d - draft state.
					* @param tabId - the tab that went away.
					*/
					forget: (d, tabId) => {
						d.byTab = Object.fromEntries(Object.entries(d.byTab).filter(([id]) => id !== tabId));
					}
				}
			});
		}
		//#endregion
		//#region lib/types/client/index.js
		/** This package's copy namespace. */
		const NS = "sidebarFiles";
		/**
		* Required browser services: the tab registry, the keyed seat, the Remote
		* carrier and its namespace, and copy.
		*/
		const inject = [
			"slots",
			"locale",
			"sidebarRightTabs",
			"sidebarRight",
			"remote",
			"remote.workspaceFiles"
		];
		/**
		* Client plugin body: register the type, its dictionaries, its body, and its chip title.
		* @param ctx - client root context carrying the registry, the slots, and the Remote face.
		*/
		function apply(ctx) {
			const t = ctx.locale.bind(NS);
			ctx.inject(["shortcuts"], (ctx) => {
				ctx.effect(() => ctx.shortcuts.register({
					id: "workspace.files",
					label: () => t("guide.title"),
					aliases: ["workspace files", "files"],
					defaults: {
						"desktop:macos": {
							code: "KeyP",
							modifiers: ["primary"]
						},
						"desktop:windows": {
							code: "KeyP",
							modifiers: ["primary"]
						},
						"desktop:linux": {
							code: "KeyP",
							modifiers: ["primary"]
						},
						"web:macos": {
							code: "KeyP",
							modifiers: ["primary", "alt"]
						},
						"web:windows": {
							code: "KeyP",
							modifiers: ["primary", "alt"]
						}
					},
					regions: [
						"page",
						"editable",
						"terminal"
					],
					modals: [],
					resolve: ({ target: element }) => {
						const target = ctx.sidebarRight.commandTarget(element);
						if (target === void 0) return {
							status: "blocked",
							reason: t("shortcut.noSession")
						};
						return {
							status: "handled",
							run: () => {
								ctx.sidebarRight.openTabFromTarget("files", target);
							}
						};
					}
				}), "ui-sidebar-files: shortcut");
			});
			ctx.effect(() => ctx.sidebarRightTabs.register(filesDefinition(t)), "ui-sidebar-files: files type");
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}), "ui-sidebar-files: dictionaries");
			const store = createFilesStore();
			const inject = filesFace(createList(ctx.remote), createWatch(ctx.remote));
			ctx.effect(() => ctx.slots.inject("sidebar.right.pane.tab", () => ctx.slots.register({
				name: "sidebar.right.pane.tab",
				key: FILES_ID,
				locale: NS,
				store,
				inject,
				children: { "sidebar.right.tab.files.actions": {
					kind: "list",
					scope: "session"
				} }
			}, FilesBody)), "ui-sidebar-files: files tab body");
			ctx.effect(() => ctx.slots.inject("sidebar.right.pane.tab.title", () => ctx.slots.register({
				name: "sidebar.right.pane.tab.title",
				key: FILES_ID
			}, FilesTitle)), "ui-sidebar-files: files tab title");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
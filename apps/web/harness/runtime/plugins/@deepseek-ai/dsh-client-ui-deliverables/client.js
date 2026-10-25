window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-deliverables",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region lib/types/changes.js
		/** Authenticated GET route serving one announced change summary while its Session lives. */
		const CHANGED_FILES_PATH = "/api/changes.summary";
		/** Authenticated GET route serving one listed file's turn-start and turn-end comparison while its Session lives. */
		const CHANGES_DIFF_PATH = "/api/changes.diff";
		/** Authenticated POST route for opening a changed file on the Host desktop. */
		const CHANGES_OPEN_PATH = "/api/changes.open";
		/**
		* Browser-relative form of {@link CHANGED_FILES_PATH}; see
		* .agents/notes/implemented/architecture/2026-09-14-web-document-relative-app-routes.md.
		*/
		const CHANGED_FILES_ROUTE = CHANGED_FILES_PATH.slice(1);
		/** Browser-relative form of {@link CHANGES_DIFF_PATH}. */
		const CHANGES_DIFF_ROUTE = CHANGES_DIFF_PATH.slice(1);
		/** Browser-relative form of {@link CHANGES_OPEN_PATH}. */
		const CHANGES_OPEN_ROUTE = CHANGES_OPEN_PATH.slice(1);
		/** Resource-address prefix of a turn's review tab in the right Sidebar. */
		const CHANGES_REVIEW_ADDRESS = "dsh-resource://changes-review/session/";
		function isRecord$1(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		/**
		* Validate one changed-file record read from the summary route.
		* @param value - decoded JSON.
		* @returns whether the record carries a path, a display path, and line counts.
		*/
		function isChangedFile(value) {
			if (!isRecord$1(value)) return false;
			const { path, display, added, deleted, binary, oversized } = value;
			return typeof path === "string" && path.length > 0 && typeof display === "string" && display.length > 0 && Number.isSafeInteger(added) && Number.isSafeInteger(deleted) && (binary === void 0 || binary === true) && (oversized === void 0 || oversized === true);
		}
		/**
		* Validate a summary read from the summary route.
		* @param value - decoded JSON.
		* @returns whether the value identifies a turn, a complete file list, the total count, and the line totals.
		*/
		function isChangesSummary(value) {
			if (!isRecord$1(value)) return false;
			const { turn, files, total, added, deleted } = value;
			return Number.isSafeInteger(turn) && turn >= 1 && Number.isSafeInteger(total) && Number.isSafeInteger(added) && Number.isSafeInteger(deleted) && Array.isArray(files) && files.every(isChangedFile);
		}
		function isHunk(value) {
			if (!isRecord$1(value)) return false;
			const { oldStart, oldLines, newStart, newLines, lines } = value;
			return [
				oldStart,
				oldLines,
				newStart,
				newLines
			].every((field) => Number.isSafeInteger(field) && field >= 0) && Array.isArray(lines) && lines.every((line) => typeof line === "string" && /^[+ -]/.test(line));
		}
		/**
		* Validate a comparison read from the comparison route.
		* @param value - decoded JSON.
		* @returns whether the value is a text comparison with well-formed hunks, or a binary or oversized refusal.
		*/
		function isChangesDiff(value) {
			if (!isRecord$1(value)) return false;
			const { kind, path, display } = value;
			if (typeof path !== "string" || path.length === 0 || typeof display !== "string" || display.length === 0) return false;
			if (kind === "binary" || kind === "oversized") return true;
			if (kind !== "text") return false;
			const { before, after, hunks, coarse } = value;
			return typeof before === "boolean" && typeof after === "boolean" && typeof coarse === "boolean" && Array.isArray(hunks) && hunks.every(isHunk);
		}
		/**
		* Validate the `workspace/changes` event data read from a Session log.
		* @param value - decoded durable event data.
		* @returns whether the event names a turn.
		*/
		function isChangesEvent(value) {
			return isRecord$1(value) && Number.isSafeInteger(value.turn) && value.turn >= 1;
		}
		/**
		* Build authenticated coordinates for the summary one `workspace/changes` event announced.
		* @param sessionId - owning Session.
		* @param seq - event sequence.
		* @returns document-relative summary route.
		*/
		function changesSummaryUrl(sessionId, seq) {
			return `${CHANGED_FILES_ROUTE}?${new URLSearchParams({
				sessionId,
				seq: String(seq)
			})}`;
		}
		/**
		* Build authenticated coordinates for one listed file's comparison.
		* @param sessionId - owning Session.
		* @param seq - workspace/changes event sequence.
		* @param index - original index in the summary's files array.
		* @returns document-relative comparison route.
		*/
		function changesDiffUrl(sessionId, seq, index) {
			return `${CHANGES_DIFF_ROUTE}?${new URLSearchParams({
				sessionId,
				seq: String(seq),
				index: String(index)
			})}`;
		}
		/**
		* Build authenticated coordinates for a changed file's native open.
		* @param sessionId - owning Session.
		* @param seq - workspace/changes event sequence.
		* @param index - original index in the summary's files array.
		* @returns document-relative action route.
		*/
		function changedFileUrl(sessionId, seq, index) {
			return `${CHANGES_OPEN_ROUTE}?${new URLSearchParams({
				sessionId,
				seq: String(seq),
				index: String(index)
			})}`;
		}
		/**
		* The right-Sidebar address of one turn's review. The Session and the event
		* sequence identify the content; the turn rides along for the tab title.
		* @param coordinates - viewed Session, announcing event, and turn.
		* @returns a `dsh-resource://changes-review/session/…` address.
		*/
		function changesReviewAddress(coordinates) {
			const { sessionId, seq, turn } = coordinates;
			return `${CHANGES_REVIEW_ADDRESS}${encodeURIComponent(sessionId)}/${seq}/${turn}`;
		}
		/**
		* Read the coordinates back out of a review address.
		* @param address - a resource address.
		* @returns the coordinates, or undefined for any other address.
		*/
		function parseChangesReviewAddress(address) {
			if (!address.startsWith("dsh-resource://changes-review/session/")) return void 0;
			const parts = address.slice(38).split("/");
			if (parts.length !== 3) return void 0;
			const [sessionId, seq, turn] = parts;
			if (sessionId === "" || !/^\d+$/.test(seq) || !/^[1-9]\d*$/.test(turn)) return void 0;
			try {
				return {
					sessionId: decodeURIComponent(sessionId),
					seq: Number(seq),
					turn: Number(turn)
				};
			} catch {
				return;
			}
		}
		//#endregion
		//#region lib/types/client/host-read-store.js
		/**
		* Fetch-once cache of Host-served records keyed by their authenticated URL:
		* one read per URL while a state stands, cleared on connection replacement,
		* cancelled on disposal. Each store decides what a response means and which
		* states a later request reads again.
		*/
		/** One browser plugin's reads of one record kind. */
		var HostReadStore = class {
			policy;
			/** Record URLs key the state across Sessions and turns. */
			state = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({});
			lifetime = new AbortController();
			/** The connection generation the current states belong to; a reset aborts it so no older read publishes. */
			generation = new AbortController();
			pending = /* @__PURE__ */ new Set();
			constructor(policy) {
				this.policy = policy;
			}
			/**
			* Read one URL unless a state the policy keeps already stands for it.
			* @param url - the record's authenticated URL.
			* @returns after the state is published.
			*/
			async loadUrl(url) {
				const current = this.state.getSnapshot()[url];
				if (this.lifetime.signal.aborted || current !== void 0 && !this.policy.retryable(current)) return;
				this.state.update((state) => {
					state[url] = this.policy.loading;
				});
				const task = this.read(url, AbortSignal.any([this.lifetime.signal, this.generation.signal]));
				this.pending.add(task);
				try {
					await task;
				} finally {
					this.pending.delete(task);
				}
			}
			/** Forget every state and abandon in-flight reads; a replaced connection may reach a Host that no longer serves them. */
			reset() {
				this.generation.abort();
				this.generation = new AbortController();
				this.state.set({});
			}
			/** Cancel outstanding reads and wait until none can publish state. */
			async dispose() {
				this.lifetime.abort();
				await Promise.all(this.pending);
			}
			async read(url, signal) {
				let next;
				try {
					next = await this.policy.decode(await fetch(url, { signal }));
				} catch {
					next = this.policy.failed;
				}
				if (!signal.aborted) this.state.update((state) => {
					state[url] = next;
				});
			}
		};
		//#endregion
		//#region lib/types/client/changes-diff.js
		/** One browser plugin's comparison reads; a failed read is the one state a later request replaces. */
		var ChangesDiffStore = class extends HostReadStore {
			constructor() {
				super({
					loading: "loading",
					failed: "error",
					retryable: (state) => state === "error",
					decode: async (response) => {
						if (response.status === 404) return "missing";
						if (!response.ok) return "error";
						const value = await response.json();
						return isChangesDiff(value) ? value : "error";
					}
				});
			}
			/**
			* Read one comparison; a cached comparison or a missing one is kept, a failed one is read again.
			* @param sessionId - viewed Session.
			* @param seq - the announcing event's sequence.
			* @param index - the file's index in the summary.
			* @returns after the state is published.
			*/
			load(sessionId, seq, index) {
				return this.loadUrl(changesDiffUrl(sessionId, seq, index));
			}
		};
		//#endregion
		//#region lib/types/client/changes-summary.js
		/** One browser plugin's summary reads; a summary or a missing answer is kept until the connection is replaced. */
		var ChangesSummaryStore = class extends HostReadStore {
			constructor() {
				super({
					loading: "loading",
					failed: "missing",
					retryable: () => false,
					decode: async (response) => {
						if (!response.ok) return "missing";
						const value = await response.json();
						return isChangesSummary(value) ? value : "missing";
					}
				});
			}
			/**
			* Read one summary once; a later read of the same coordinates returns the cached state.
			* @param sessionId - viewed Session.
			* @param seq - the announcing event's sequence.
			* @returns after the state is published.
			*/
			load(sessionId, seq) {
				return this.loadUrl(changesSummaryUrl(sessionId, seq));
			}
		};
		//#endregion
		//#region lib/types/presented.js
		/** Authenticated POST route for opening a workspace file on the Host desktop. */
		const PRESENT_OPEN_PATH = "/api/present.open";
		/** Authenticated desktop availability and destination metadata. */
		const PRESENT_HOST_PATH = "/api/present.host";
		/**
		* Browser-relative form of {@link PRESENT_OPEN_PATH}; see
		* .agents/notes/implemented/architecture/2026-09-14-web-document-relative-app-routes.md.
		*/
		const PRESENT_OPEN_ROUTE = PRESENT_OPEN_PATH.slice(1);
		/** Browser-relative form of {@link PRESENT_HOST_PATH}. */
		const PRESENT_HOST_ROUTE = PRESENT_HOST_PATH.slice(1);
		/**
		* Validate desktop metadata received over HTTP.
		* @param value - decoded response.
		* @returns whether all displayed and actionable fields are supported.
		*/
		function isPresentedHost(value) {
			if (typeof value !== "object" || value === null) return false;
			const host = value;
			return typeof host.name === "string" && typeof host.available === "boolean" && (host.fileManager === null || host.fileManager === "finder" || host.fileManager === "explorer" || host.fileManager === "directory");
		}
		/**
		* Validate a file declaration read from a Session log.
		* @param value - decoded durable data.
		* @returns whether the declaration contains a path and optional description.
		*/
		function isPresentedFile(value) {
			if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
			const { path, description } = value;
			return typeof path === "string" && path.trim().length > 0 && (description === void 0 || typeof description === "string");
		}
		/**
		* Build authenticated coordinates for a declared file.
		* @param sessionId - owning Session.
		* @param seq - deliverables/presented event sequence.
		* @param index - original index in the event's files array.
		* @returns document-relative file action route.
		*/
		function presentedFileUrl(sessionId, seq, index) {
			return `${PRESENT_OPEN_ROUTE}?${new URLSearchParams({
				sessionId,
				seq: String(seq),
				index: String(index)
			})}`;
		}
		/**
		* Validate a delivery event before reading its turn or file declarations.
		* @param value - decoded durable event data.
		* @returns whether the event identifies a turn, call, and file list.
		*/
		function isPresentedData(value) {
			if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
			const { turn, callId, files } = value;
			return typeof turn === "number" && Number.isSafeInteger(turn) && turn >= 1 && typeof callId === "string" && callId.length > 0 && Array.isArray(files);
		}
		/**
		* Trailing path segment, the part that identifies the file at a glance.
		* @param path - Slash- or backslash-separated path.
		* @returns The final segment, or the whole string when separator-free.
		*/
		function basename(path) {
			const at = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
			return at === -1 ? path : path.slice(at + 1);
		}
		//#endregion
		//#region lib/types/client/present-open.js
		/** Shared native-open status for delivery cards, the changed-files card, and closing-message file mentions. */
		/** Success feedback remains fully visible for five seconds before fading. */
		const PRESENTED_SUCCESS_HOLD_MS = 5e3;
		/** One browser plugin's file-open requests, cancelled when that plugin is disposed. */
		var PresentedOpenController = class {
			/** File action URLs key the state across Sessions, turns, and both clickable surfaces. */
			state = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({});
			/** Native destination metadata, or a retryable read failure. */
			host = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(null);
			expiry = /* @__PURE__ */ new Map();
			loading;
			metadata = new AbortController();
			lifetime = new AbortController();
			pending = /* @__PURE__ */ new Set();
			/**
			* Open a declared file once while a request for the same coordinates is pending.
			* Failures remain visible on the card and a later gesture retries them.
			* @param sessionId - viewed Session, including a fork's own identity.
			* @param seq - durable delivery event sequence.
			* @param index - original file index within that event.
			* @param action - default application open or file-manager reveal.
			* @param application - registered handler identifier for an explicit application choice.
			* @returns null after a successful handoff, or the failure to announce after publishing card status.
			*/
			open(sessionId, seq, index, action = "open", application) {
				return this.openUrl(presentedFileUrl(sessionId, seq, index), action, application);
			}
			/**
			* Open one recorded changed file in the Host's default application.
			* @param sessionId - viewed Session.
			* @param seq - durable workspace/changes event sequence.
			* @param index - original file index within that event.
			* @param action - application open or file-manager reveal.
			* @param application - registered handler identifier for an explicit application choice.
			* @returns null after a successful handoff, or the failure to announce after publishing card status.
			*/
			openChanged(sessionId, seq, index, action = "open", application) {
				return this.openUrl(changedFileUrl(sessionId, seq, index), action, application);
			}
			async openUrl(url, action, application) {
				const phase = this.state.getSnapshot()[url];
				if (this.lifetime.signal.aborted || phase === "opening" || phase === "revealing") return null;
				this.clearExpiry(url);
				this.state.update((state) => {
					state[url] = action === "open" ? "opening" : "revealing";
				});
				const task = this.request(url, action, application);
				this.pending.add(task);
				try {
					return await task;
				} finally {
					this.pending.delete(task);
				}
			}
			/**
			* Read the serving desktop metadata, coalescing concurrent reads; a later call retries failure.
			* @returns after metadata or a retryable error is published.
			*/
			async loadHost() {
				if (this.lifetime.signal.aborted) return;
				if (this.loading !== void 0) return this.loading;
				this.host.set(null);
				const task = this.readHost(AbortSignal.any([this.lifetime.signal, this.metadata.signal]));
				this.loading = task;
				this.pending.add(task);
				try {
					await task;
				} finally {
					if (this.loading === task) this.loading = void 0;
					this.pending.delete(task);
				}
			}
			/** Invalidate desktop metadata on connection replacement; mounted cards request the new Host. */
			resetHost() {
				const wasLoading = this.loading !== void 0;
				this.metadata.abort();
				this.metadata = new AbortController();
				this.loading = void 0;
				this.host.set(null);
				if (wasLoading) this.loadHost();
			}
			async readHost(signal) {
				let host = "error";
				try {
					const response = await fetch(PRESENT_HOST_ROUTE, { signal });
					if (response.ok) {
						const value = await response.json();
						if (isPresentedHost(value)) host = value;
					}
				} catch {
					host = "error";
				}
				if (!signal.aborted) this.host.set(host);
			}
			/** Cancel outstanding requests and wait until no request can publish state. */
			async dispose() {
				this.lifetime.abort();
				for (const url of this.expiry.keys()) this.clearExpiry(url);
				await Promise.all(this.pending);
			}
			clearExpiry(url) {
				clearTimeout(this.expiry.get(url));
				this.expiry.delete(url);
			}
			async request(url, action, application) {
				const failure = action === "open" ? "error" : "revealError";
				let phase = action === "open" ? "opened" : "revealed";
				try {
					const target = action === "reveal" ? `${url}&action=reveal` : application === void 0 ? url : `${url}&application=${encodeURIComponent(application)}`;
					const response = await fetch(target, {
						method: "POST",
						signal: this.lifetime.signal
					});
					if (!response.ok) phase = response.status === 422 ? "nativeUnavailable" : failure;
				} catch {
					phase = failure;
				}
				if (!this.lifetime.signal.aborted) {
					if (phase === "opened" || phase === "revealed") this.expiry.set(url, setTimeout(() => {
						this.expiry.delete(url);
						this.state.update((state) => {
							Reflect.deleteProperty(state, url);
						});
					}, 5200));
					this.state.update((state) => {
						state[url] = phase;
					});
				}
				return phase === "opened" || phase === "revealed" ? null : action === "reveal" ? "revealError" : "openError";
			}
		};
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-deliverables/src/client/PresentRow.module.css.mjs
		const css$4 = "._30ZWma_summary{min-width:0;color:inherit;align-items:center;gap:8px;margin-left:8px;font-size:12px;display:flex}._30ZWma_summary>:first-child{flex-shrink:0}._30ZWma_paths{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}._30ZWma_output{border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);white-space:pre-wrap;overflow-wrap:anywhere;margin:8px 0;padding:12px;font-size:12px}._30ZWma_inspect{color:var(--dsw-alias-link);font:inherit;cursor:pointer;background:0 0;border:none;align-self:flex-start;padding:4px 0;font-size:12px}";
		const tagId$4 = "@deepseek-ai/dsh-client-ui-deliverables/PresentRow.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$4) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-deliverables";
			tag.dataset.pluginCss = tagId$4;
			tag.textContent = css$4;
			document.head.appendChild(tag);
		}
		var PresentRow_module_css_default = {
			"inspect": "_30ZWma_inspect",
			"output": "_30ZWma_output",
			"paths": "_30ZWma_paths",
			"summary": "_30ZWma_summary"
		};
		//#endregion
		//#region lib/types/client/PresentRow.js
		/** Present call status and expandable durable result text. */
		/* v8 ignore next -- Non-expandable rows never invoke DisclosureRow's required toggle callback. */
		const noop = () => void 0;
		/** Raw arguments can be partial while a call is streaming. */
		function fileNames(raw) {
			let args;
			try {
				args = JSON.parse(raw);
			} catch {
				return raw;
			}
			if (typeof args !== "object" || args === null || !("files" in args) || !Array.isArray(args.files)) return raw;
			return args.files.flatMap((file) => typeof file === "object" && file !== null && "path" in file && typeof file.path === "string" ? [file.path] : []).join(", ");
		}
		/**
		* Render a present call using its recorded arguments and result.
		* @param props - tool call and localized status copy.
		* @returns a status row with a result disclosure.
		*/
		function PresentRow(props) {
			return props.phase === "preparing" ? (0, react_jsx_runtime.jsx)(PreparingPresentRow, { ...props }) : (0, react_jsx_runtime.jsx)(StartedPresentRow, { ...props });
		}
		function PreparingPresentRow({ t }) {
			return (0, react_jsx_runtime.jsx)("div", {
				"data-tool": "present",
				"data-state": "preparing",
				"aria-label": t("row.preparing"),
				children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.DisclosureRow, {
					title: t("row.title"),
					icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDeliverDocRegular, { size: 14 }),
					open: false,
					expandable: false,
					onToggle: noop,
					running: true
				})
			});
		}
		function StartedPresentRow({ block, inspect, t }) {
			const settled = "kind" in block;
			const state = !settled ? "running" : block.error?.code === "interrupted" ? "stopped" : block.isError ? "error" : "ok";
			const args = (settled ? block.call?.argsRaw : block.argsRaw) ?? "";
			const details = (settled ? block.content.map((item) => item.type === "text" ? item.text : JSON.stringify(item)).join("\n") : "") || (settled && block.error ? `${block.error.name}: ${block.error.code}` : "");
			const [expanded, setExpanded] = (0, react.useState)(false);
			return (0, react_jsx_runtime.jsx)("div", {
				"data-tool": "present",
				"data-state": state,
				children: (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.DisclosureRow, {
					title: t("row.title"),
					icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDeliverDocRegular, { size: 14 }),
					open: expanded && details !== "",
					expandable: details !== "",
					expandOnRowClick: true,
					keepContentWhenOpen: true,
					onToggle: () => {
						setExpanded((value) => !value);
					},
					collapsedContent: (0, react_jsx_runtime.jsxs)("span", {
						className: PresentRow_module_css_default.summary,
						children: [(0, react_jsx_runtime.jsx)("span", { children: t(`row.${state}`) }), (0, react_jsx_runtime.jsx)("span", {
							className: PresentRow_module_css_default.paths,
							children: fileNames(args)
						})]
					}),
					children: [(0, react_jsx_runtime.jsx)("pre", {
						className: PresentRow_module_css_default.output,
						children: details
					}), inspect && (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: PresentRow_module_css_default.inspect,
						onClick: inspect,
						children: t("row.inspect")
					})]
				})
			});
		}
		//#endregion
		//#region ../../util/workspace-path/lib/index.js
		/**
		* The `dsh-resource://file/…` address grammar: how a file is named across the
		* Sidebar and the resource model, built and parsed without touching a
		* filesystem.
		* @module
		*/
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
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-deliverables/src/client/FileDiff.module.css.mjs
		const css$3 = ".UPE3wW_root{--diff-empty-fill:color-mix(in srgb, var(--dsw-alias-interactive-bg-hover) 50%, transparent);box-sizing:border-box;width:100%;min-height:0;color:var(--dsw-alias-label-primary);flex-direction:column;display:flex}.UPE3wW_header{box-sizing:border-box;border-bottom:.5px solid var(--dsw-alias-border-l3);flex:none;align-items:center;gap:6px;height:38px;padding:0 6px 0 8px;display:flex}.UPE3wW_status{color:var(--dsw-alias-label-secondary);align-items:center;gap:12px;margin:0;padding:16px;font-size:13px;display:flex}.UPE3wW_body{min-height:0;font:var(--dsw-font-markdown-code-block);flex-direction:column;flex:auto;padding:8px 0 16px;display:flex;overflow:auto}.UPE3wW_columns{flex:auto;grid-template-columns:minmax(0,1fr) minmax(0,1fr);min-height:0;display:grid}.UPE3wW_column,.UPE3wW_body[data-review-view=unified]:not([data-review-wrap]){grid-template-columns:minmax(max-content,100%);align-content:start;display:grid}.UPE3wW_column{overscroll-behavior:none;min-width:0;overflow-x:scroll}.UPE3wW_column+.UPE3wW_column{border-left:.5px solid var(--dsw-alias-border-l3)}.UPE3wW_sideLine{box-sizing:border-box;white-space:pre;grid-template-columns:3.5em max-content;width:max-content;min-width:100%;min-height:22px;line-height:22px;display:grid}.UPE3wW_note{font:var(--dsw-font-xs-13);color:var(--dsw-alias-label-tertiary);margin:0;padding:4px 16px 8px}.UPE3wW_hunk{margin-bottom:8px}.UPE3wW_hunkHeader{color:var(--dsw-alias-label-tertiary);white-space:pre;padding:4px 16px}.UPE3wW_line{box-sizing:border-box;white-space:pre;grid-template-columns:3.5em 3.5em 1.2em minmax(0,1fr);min-height:22px;line-height:22px;display:grid}.UPE3wW_splitLine{white-space:pre;grid-template-columns:minmax(0,1fr) minmax(0,1fr);min-height:22px;line-height:22px;display:grid}.UPE3wW_cell{box-sizing:border-box;grid-template-columns:3.5em minmax(0,1fr);min-width:0;display:grid}.UPE3wW_cell+.UPE3wW_cell{border-left:.5px solid var(--dsw-alias-border-l3)}.UPE3wW_number{color:var(--dsw-alias-label-tertiary);text-align:right;user-select:none;padding-right:8px}.UPE3wW_sign{text-align:center;user-select:none}.UPE3wW_text{padding-right:16px}.UPE3wW_body[data-review-wrap] .UPE3wW_line,.UPE3wW_body[data-review-wrap] .UPE3wW_splitLine{white-space:pre-wrap}.UPE3wW_body[data-review-wrap] .UPE3wW_text{overflow-wrap:anywhere}.UPE3wW_add{--diff-gutter-fill:var(--dsw-alias-file-diff-added-gutter);--diff-marker:var(--dsw-alias-file-diff-added-marker);background:var(--dsw-alias-file-diff-added-bg)}.UPE3wW_del{--diff-gutter-fill:var(--dsw-alias-file-diff-deleted-gutter);--diff-marker:var(--dsw-alias-file-diff-deleted-marker);background:var(--dsw-alias-file-diff-deleted-bg)}.UPE3wW_add .UPE3wW_number,.UPE3wW_del .UPE3wW_number{background:var(--diff-gutter-fill);color:var(--diff-marker)}.UPE3wW_add .UPE3wW_number:first-child,.UPE3wW_del .UPE3wW_number:first-child{box-shadow:inset 3px 0 0 var(--diff-marker)}.UPE3wW_add .UPE3wW_sign,.UPE3wW_del .UPE3wW_sign{color:var(--diff-marker)}.UPE3wW_context .UPE3wW_text{color:var(--dsw-alias-label-secondary)}.UPE3wW_empty{background:var(--diff-empty-fill)}";
		const tagId$3 = "@deepseek-ai/dsh-client-ui-deliverables/FileDiff.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$3) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-deliverables";
			tag.dataset.pluginCss = tagId$3;
			tag.textContent = css$3;
			document.head.appendChild(tag);
		}
		var FileDiff_module_css_default = {
			"add": "UPE3wW_add",
			"body": "UPE3wW_body",
			"cell": "UPE3wW_cell",
			"column": "UPE3wW_column",
			"columns": "UPE3wW_columns",
			"context": "UPE3wW_context",
			"del": "UPE3wW_del",
			"empty": "UPE3wW_empty",
			"header": "UPE3wW_header",
			"hunk": "UPE3wW_hunk",
			"hunkHeader": "UPE3wW_hunkHeader",
			"line": "UPE3wW_line",
			"note": "UPE3wW_note",
			"number": "UPE3wW_number",
			"root": "UPE3wW_root",
			"sideLine": "UPE3wW_sideLine",
			"sign": "UPE3wW_sign",
			"splitLine": "UPE3wW_splitLine",
			"status": "UPE3wW_status",
			"text": "UPE3wW_text"
		};
		//#endregion
		//#region lib/types/client/FileDiff.js
		/** Shared file comparison for the turn-tail hover preview and Sidebar review. */
		/** Maximum rendered lines per comparison. */
		const MAX_RENDERED_LINES = 5e3;
		function highlightedSide(rows, side, highlighter) {
			const source = rows.flatMap((row) => {
				const no = row[side];
				return no === void 0 ? [] : [{
					no,
					text: row.text
				}];
			});
			if (source.length === 0) return /* @__PURE__ */ new Map();
			const highlighted = highlighter(source.map((line) => line.text).join("\n"));
			if (highlighted === void 0) return void 0;
			return new Map(source.map((line, index) => {
				return [line.no, highlighted[index] ?? []];
			}));
		}
		function hunkHighlights(hunk, highlighter) {
			const rows = hunkRows(hunk);
			return {
				old: highlightedSide(rows, "old", highlighter),
				new: highlightedSide(rows, "new", highlighter)
			};
		}
		function DiffText({ text, spans }) {
			return (0, react_jsx_runtime.jsx)("span", {
				className: FileDiff_module_css_default.text,
				"data-diff-code": spans === void 0 ? void 0 : "",
				children: spans === void 0 ? text : spans.map((span, index) => (0, react_jsx_runtime.jsx)("span", {
					style: span.style,
					children: span.text
				}, index))
			});
		}
		/**
		* Number a hunk's lines: context lines count on both sides, deletions on the
		* old side, additions on the new side.
		* @param hunk - a served hunk.
		* @returns the rows in order.
		*/
		function hunkRows(hunk) {
			let oldNo = hunk.oldStart;
			let newNo = hunk.newStart;
			return hunk.lines.map((line) => {
				const text = line.slice(1);
				switch (line[0]) {
					case "+": return {
						kind: "add",
						old: void 0,
						new: newNo++,
						text
					};
					case "-": return {
						kind: "del",
						old: oldNo++,
						new: void 0,
						text
					};
					default: return {
						kind: "context",
						old: oldNo++,
						new: newNo++,
						text
					};
				}
			});
		}
		/**
		* Pair a hunk's lines for the side-by-side view: each run of deletions is
		* aligned with the run of additions that follows it, row by row, and context
		* lines sit on both sides.
		* @param hunk - a served hunk.
		* @returns the rows in order.
		*/
		function splitRows(hunk) {
			const rows = [];
			let dels = [];
			let adds = [];
			const flush = () => {
				for (let at = 0; at < Math.max(dels.length, adds.length); at += 1) {
					const left = dels[at];
					const right = adds[at];
					rows.push({
						...left === void 0 ? {} : { left },
						...right === void 0 ? {} : { right }
					});
				}
				dels = [];
				adds = [];
			};
			for (const row of hunkRows(hunk)) if (row.kind === "del") dels.push({
				no: row.old,
				text: row.text,
				kind: "del"
			});
			else if (row.kind === "add") adds.push({
				no: row.new,
				text: row.text,
				kind: "add"
			});
			else {
				flush();
				rows.push({
					left: {
						no: row.old,
						text: row.text,
						kind: "context"
					},
					right: {
						no: row.new,
						text: row.text,
						kind: "context"
					}
				});
			}
			flush();
			return rows;
		}
		/**
		* The hunks to draw, cut at {@link MAX_RENDERED_LINES} lines in total.
		* @param hunks - served hunks.
		* @returns the hunks with the last one shortened as needed, and whether anything was cut.
		*/
		function renderedHunks(hunks) {
			let budget = MAX_RENDERED_LINES;
			const kept = [];
			for (const hunk of hunks) {
				if (budget === 0) return {
					hunks: kept,
					truncated: true
				};
				kept.push(hunk.lines.length <= budget ? hunk : {
					...hunk,
					lines: hunk.lines.slice(0, budget)
				});
				budget -= Math.min(budget, hunk.lines.length);
			}
			return {
				hunks: kept,
				truncated: hunks.some((hunk, at) => kept[at] !== hunk)
			};
		}
		/** The one-line fact about a text comparison worth stating above its hunks, if any. */
		function noteOf(diff) {
			if (!diff.before) return "diff.created";
			if (!diff.after) return "diff.deleted";
			if (diff.hunks.length === 0) return "diff.unchanged";
		}
		/**
		* Render a file comparison with the same states and highlighting in previews and review tabs.
		* Addition-only and deletion-only comparisons use one column without changing the requested layout.
		* @param props - comparison state, layout choices, retry action, and localized copy.
		* @returns the comparison or its loading, unavailable, or error state.
		*/
		function FileDiff({ state, split, wrap, retry, t }) {
			if (state === void 0 || state === "loading") return (0, react_jsx_runtime.jsx)("p", {
				className: FileDiff_module_css_default.status,
				role: "status",
				children: t("diff.loading")
			});
			if (state === "missing") return (0, react_jsx_runtime.jsx)("p", {
				className: FileDiff_module_css_default.status,
				children: t("diff.missing")
			});
			if (state === "error") return (0, react_jsx_runtime.jsxs)("div", {
				className: FileDiff_module_css_default.status,
				children: [(0, react_jsx_runtime.jsx)("span", { children: t("diff.error") }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					size: "sm",
					onClick: retry,
					children: t("presented.retry")
				})]
			});
			if (state.kind === "binary") return (0, react_jsx_runtime.jsx)("p", {
				className: FileDiff_module_css_default.status,
				children: t("diff.binary")
			});
			if (state.kind === "oversized") return (0, react_jsx_runtime.jsx)("p", {
				className: FileDiff_module_css_default.status,
				children: t("diff.oversized")
			});
			const oneSided = state.hunks.some((hunk) => hunk.lines.some((line) => line.startsWith("+"))) !== state.hunks.some((hunk) => hunk.lines.some((line) => line.startsWith("-")));
			return (0, react_jsx_runtime.jsx)(TextDiff, {
				diff: state,
				split: split && !oneSided,
				wrap,
				t
			});
		}
		/** The kind a paired row carries: a deletion or addition on either side, otherwise context. */
		function splitRowKind(row) {
			return row.left?.kind === "del" ? "del" : row.right?.kind === "add" ? "add" : "context";
		}
		function hunkHeader(hunk) {
			return `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`;
		}
		/**
		* The side-by-side view without wrapping: two columns that clip their long
		* lines and scroll together on both axes, so a long line on one side never
		* runs under the other and both sides show the same rows and columns of text.
		* Every line is one fixed-height row, which keeps the sides aligned.
		* The columns suppress elastic overscroll while retaining native in-range scrolling.
		*/
		function SplitColumns({ hunks, highlights }) {
			const paired = (0, react.useMemo)(() => hunks.map((hunk) => ({
				header: hunkHeader(hunk),
				rows: splitRows(hunk)
			})), [hunks]);
			const columns = (0, react.useRef)({
				left: null,
				right: null
			});
			const offsets = (0, react.useRef)({
				left: {
					scrollLeft: 0,
					scrollTop: 0
				},
				right: {
					scrollLeft: 0,
					scrollTop: 0
				}
			});
			const follow = (side) => (event) => {
				const peer = side === "left" ? "right" : "left";
				const other = columns.current[peer];
				/* v8 ignore next -- Both column refs are attached before browser scroll events can run. */
				if (other === null) return;
				for (const axis of ["scrollLeft", "scrollTop"]) {
					const value = event.currentTarget[axis];
					if (offsets.current[side][axis] === value) continue;
					offsets.current[side][axis] = value;
					other[axis] = value;
					offsets.current[peer][axis] = other[axis];
				}
			};
			return (0, react_jsx_runtime.jsx)("div", {
				className: FileDiff_module_css_default.columns,
				children: ["left", "right"].map((side) => (0, react_jsx_runtime.jsx)("div", {
					className: FileDiff_module_css_default.column,
					"data-diff-side": side,
					ref: (element) => {
						columns.current[side] = element;
					},
					onScroll: follow(side),
					children: paired.map((hunk, position) => (0, react_jsx_runtime.jsxs)("section", {
						className: FileDiff_module_css_default.hunk,
						children: [(0, react_jsx_runtime.jsx)("div", {
							className: FileDiff_module_css_default.hunkHeader,
							"data-diff-hunk-header": true,
							children: hunk.header
						}), hunk.rows.map((row, at) => {
							const cell = row[side];
							const spans = cell === void 0 ? void 0 : highlights[position]?.[side === "left" ? "old" : "new"]?.get(cell.no);
							return (0, react_jsx_runtime.jsxs)("div", {
								className: `${FileDiff_module_css_default.sideLine} ${cell === void 0 ? FileDiff_module_css_default.empty : FileDiff_module_css_default[cell.kind]}`,
								"data-diff-line": splitRowKind(row),
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: FileDiff_module_css_default.number,
									children: cell?.no ?? ""
								}), (0, react_jsx_runtime.jsx)(DiffText, {
									text: cell?.text ?? "",
									spans
								})]
							}, at);
						})]
					}, position))
				}, side))
			});
		}
		/** The hunks of a text comparison with their line numbers, unified or side by side. */
		function TextDiff({ diff, split, wrap, t }) {
			const note = noteOf(diff);
			const { hunks, truncated } = (0, react.useMemo)(() => renderedHunks(diff.hunks), [diff.hunks]);
			const highlighter = (0, _deepseek_ai_dsh_client_ui_primitives.useCodeHighlighter)((0, _deepseek_ai_dsh_client_ui_primitives.languageForPath)(diff.path));
			const highlights = (0, react.useMemo)(() => hunks.map((hunk) => hunkHighlights(hunk, highlighter)), [hunks, highlighter]);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: FileDiff_module_css_default.body,
				"data-review-view": split ? "split" : "unified",
				"data-review-wrap": wrap || void 0,
				children: [
					note !== void 0 && (0, react_jsx_runtime.jsx)("p", {
						className: FileDiff_module_css_default.note,
						"data-diff-note": hunks.length === 0 ? "empty" : "metadata",
						children: t(note)
					}),
					diff.coarse && (0, react_jsx_runtime.jsx)("p", {
						className: FileDiff_module_css_default.note,
						"data-diff-coarse": true,
						children: t("diff.coarse")
					}),
					truncated && (0, react_jsx_runtime.jsx)("p", {
						className: FileDiff_module_css_default.note,
						"data-diff-truncated": true,
						children: t("diff.truncated", { count: String(5e3) })
					}),
					split && !wrap ? (0, react_jsx_runtime.jsx)(SplitColumns, {
						hunks,
						highlights
					}) : hunks.map((hunk, position) => {
						const highlighted = highlights[position];
						return (0, react_jsx_runtime.jsxs)("section", {
							className: FileDiff_module_css_default.hunk,
							children: [(0, react_jsx_runtime.jsx)("div", {
								className: FileDiff_module_css_default.hunkHeader,
								"data-diff-hunk-header": true,
								children: hunkHeader(hunk)
							}), split ? splitRows(hunk).map((row, at) => (0, react_jsx_runtime.jsxs)("div", {
								className: FileDiff_module_css_default.splitLine,
								"data-diff-line": splitRowKind(row),
								children: [(0, react_jsx_runtime.jsxs)("span", {
									className: `${FileDiff_module_css_default.cell} ${row.left === void 0 ? FileDiff_module_css_default.empty : FileDiff_module_css_default[row.left.kind]}`,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: FileDiff_module_css_default.number,
										children: row.left?.no ?? ""
									}), (0, react_jsx_runtime.jsx)(DiffText, {
										text: row.left?.text ?? "",
										spans: row.left === void 0 ? void 0 : highlighted?.old?.get(row.left.no)
									})]
								}), (0, react_jsx_runtime.jsxs)("span", {
									className: `${FileDiff_module_css_default.cell} ${row.right === void 0 ? FileDiff_module_css_default.empty : FileDiff_module_css_default[row.right.kind]}`,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: FileDiff_module_css_default.number,
										children: row.right?.no ?? ""
									}), (0, react_jsx_runtime.jsx)(DiffText, {
										text: row.right?.text ?? "",
										spans: row.right === void 0 ? void 0 : highlighted?.new?.get(row.right.no)
									})]
								})]
							}, at)) : hunkRows(hunk).map((row, at) => (0, react_jsx_runtime.jsxs)("div", {
								className: `${FileDiff_module_css_default.line} ${FileDiff_module_css_default[row.kind]}`,
								"data-diff-line": row.kind,
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										className: FileDiff_module_css_default.number,
										children: row.old ?? ""
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: FileDiff_module_css_default.number,
										children: row.new ?? ""
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: FileDiff_module_css_default.sign,
										children: row.kind === "add" ? "+" : row.kind === "del" ? "-" : " "
									}),
									(0, react_jsx_runtime.jsx)(DiffText, {
										text: row.text,
										spans: row.kind === "add" ? highlighted?.new?.get(row.new) : highlighted?.old?.get(row.old)
									})
								]
							}, at))]
						}, position);
					})
				]
			});
		}
		//#endregion
		//#region ../../core/session/lib/types/surface.js
		/** Runtime counterpart of the message-producing event union. */
		const SURFACE_EVENT_TYPES = new Set([
			"system/message",
			"developer/message",
			"user/message",
			"assistant/message",
			"tool/result"
		]);
		/**
		* Narrow an event to a surface-eligible event carrying its required marker.
		* @param event - event to test.
		* @returns true when both the type and marker identify a surface event.
		*/
		function isSurfaceEvent(event) {
			if (!SURFACE_EVENT_TYPES.has(event.type)) return false;
			return event.surfaceOp !== void 0;
		}
		/**
		* Narrow an event to an append-origin surface event: one that entered the
		* surface at its own log position and was never itself a replacement copy.
		*
		* The model-visible surface deliberately shadows replaced ranges, so it is the
		* wrong source for a human transcript — a landed replacement would erase
		* conversation the user already saw. Append-origin events are that transcript's
		* durable source material; replacement copies stay model-only.
		* @param event - event to test.
		* @returns true when the event appended to the surface tail.
		*/
		function isAppendSurfaceEvent(event) {
			return isSurfaceEvent(event) && event.surfaceOp === "append";
		}
		//#endregion
		//#region lib/types/client/turn-deliverables.js
		/**
		* Turn-scoped produced-file Definition and readers. Client-only and
		* model-free: produced paths come from successful first-party mutation calls and
		* their recorded file targets, changed files from the Host's recorded git
		* summary, and deliveries from `present`; never from presentation data or
		* the closing prose.
		*/
		/**
		* Extract the path from a supported first-party mutation call. Session
		* `tool/call` events are root calls; PTC dispatch children do not enter this
		* Definition independently.
		* @param name - wire tool name.
		* @param argsRaw - model-produced JSON arguments.
		* @returns the mutation path, or null when the call is not a supported mutation.
		*/
		function mutationPath(name, argsRaw) {
			let args;
			try {
				args = JSON.parse(argsRaw);
			} catch {
				return null;
			}
			if (!isRecord(args)) return null;
			switch (name) {
				case "write": return typeof args.content === "string" ? pathValue(args.file_path) : null;
				case "edit": return validEditArgs(args) ? pathValue(args.file_path) : null;
				case "str_replace_editor": return editorMutationPath(args);
				default: return null;
			}
		}
		/** Validate the fields that an `edit` execution requires. */
		function validEditArgs(args) {
			return typeof args.old_string === "string" && args.old_string.length > 0 && typeof args.new_string === "string" && args.old_string !== args.new_string && (args.replace_all === void 0 || typeof args.replace_all === "boolean");
		}
		/** Extract a path only from a complete mutating editor command. */
		function editorMutationPath(args) {
			const path = pathValue(args.path);
			if (path === null) return null;
			switch (args.command) {
				case "create": return typeof args.file_text === "string" ? path : null;
				case "str_replace": return typeof args.old_str === "string" && args.old_str.length > 0 && (args.new_str === void 0 || typeof args.new_str === "string") ? path : null;
				case "insert": return typeof args.insert_line === "number" && Number.isInteger(args.insert_line) && args.insert_line >= 0 && typeof args.new_str === "string" ? path : null;
				default: return null;
			}
		}
		/** A non-blank path preserves the exact spelling supplied to the tool. */
		function pathValue(value) {
			return typeof value === "string" && value.trim().length > 0 ? value : null;
		}
		/** Resolve a settled mutation from recorded metadata, retaining legacy argument paths. */
		function mutationResultPath(argumentPath, meta) {
			if (!isRecord(meta) || !Object.hasOwn(meta, "path")) return argumentPath;
			if (typeof meta.path === "string" && isAbsoluteWorkspacePath(meta.path)) return meta.path;
			return isAbsoluteWorkspacePath(argumentPath) ? argumentPath : null;
		}
		/** Narrow parsed JSON to an argument object. */
		function isRecord(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		/**
		* Files produced by one Turn data value.
		*
		* The source is successful `write`, `edit`, and mutating `str_replace_editor`
		* calls and their recorded absolute targets; legacy results use arguments. A produced file must be
		* listed whether or not the model remembered to name it. Reads, unsupported
		* tools, malformed calls, and failed results contribute nothing. Paths keep
		* first-seen order and appear once, so a file written and then edited in the
		* same turn is one entry.
		*
		* The Conversation Location index owns turn membership before this function
		* runs, so paths cannot spill across turns and this derivation does not infer
		* boundaries from neighboring presentation Nodes. Mutations settled after the
		* closing reply are included, matching {@link presentedForClosing}.
		* @param data - engine-published Deliverables data for one Turn.
		* @returns Produced paths in first-seen order; empty when the turn wrote nothing.
		*/
		function producedForClosing(data) {
			if (data === void 0) return [];
			const paths = [];
			const seen = /* @__PURE__ */ new Set();
			for (const produced of data.produced) {
				if (seen.has(produced.path)) continue;
				seen.add(produced.path);
				paths.push(produced.path);
			}
			return paths;
		}
		/**
		* Claim the turn-tail chain only when its closing turn produced files.
		* @param owner - Turn-tail owner currency for the closing assistant.
		* @returns Produced paths as the component's match, or null to decline before mount.
		*/
		function selectProducedFiles(owner) {
			const paths = producedForClosing(owner.turn.data.get("deliverables"));
			return paths.length === 0 ? null : paths;
		}
		/** Turn-local successful mutation accumulator; it publishes no view Node. */
		const deliverablesDefinition = {
			kind: "deliverables",
			match: (event) => {
				if (event.type === "turn/start") return {
					id: String(event.data.turn),
					role: "start"
				};
				if (event.type === "tool/call") return {
					id: String(event.data.turn),
					role: "update"
				};
				if (event.type === "deliverables/presented") return isPresentedData(event.data) ? {
					id: String(event.data.turn),
					role: "update"
				} : null;
				if (event.type === "workspace/changes") return isChangesEvent(event.data) ? {
					id: String(event.data.turn),
					role: "update"
				} : null;
				if (event.type === "tool/result" && isAppendSurfaceEvent(event)) return {
					id: String(event.data.turn),
					role: "update"
				};
				return null;
			},
			start: (_context, match) => {
				if (match.event.type !== "turn/start") throw new Error("deliverables start requires turn/start");
				return {
					turn: match.event.data.turn,
					calls: /* @__PURE__ */ new Map(),
					produced: []
				};
			},
			update: (context, match) => {
				if (match.event.type === "workspace/changes") return {
					...context.state,
					changes: { seq: match.event.seq }
				};
				if (match.event.type === "deliverables/presented") {
					const { files } = match.event.data;
					const seq = match.event.seq;
					const presented = [];
					for (let index = 0; index < files.length; index += 1) {
						const file = files[index];
						if (isPresentedFile(file)) presented.push({
							...file,
							seq,
							index
						});
					}
					if (presented.length === 0) return context.state;
					return {
						...context.state,
						presented: [...context.state.presented ?? [], ...presented]
					};
				}
				if (match.event.type === "tool/call") {
					const calls = new Map(context.state.calls);
					calls.set(String(match.event.data.callId), mutationPath(match.event.data.name, match.event.data.arguments));
					return {
						...context.state,
						calls
					};
				}
				if (match.event.type !== "tool/result") return context.state;
				if (match.event.data.message.isError === true) return context.state;
				const callId = String(match.event.data.message.source.callId);
				const argumentPath = context.state.calls.get(callId);
				if (argumentPath === null || argumentPath === void 0) return context.state;
				const path = mutationResultPath(argumentPath, match.event.data.meta);
				return path === null ? context.state : {
					...context.state,
					produced: [...context.state.produced, {
						path,
						...path === argumentPath ? {} : { argumentPath }
					}]
				};
			},
			buildLocationData: (context, scope, previous) => {
				if (scope !== "turn" || context.state === void 0) return null;
				if (previous?.kind === "turn" && previous.turn === context.state.turn && previous.key === "deliverables" && previous.value.produced === context.state.produced && previous.value.presented === context.state.presented && previous.value.changes === context.state.changes) return previous;
				return {
					kind: "turn",
					turn: context.state.turn,
					key: "deliverables",
					value: {
						produced: context.state.produced,
						...context.state.presented === void 0 ? {} : { presented: context.state.presented },
						...context.state.changes === void 0 ? {} : { changes: context.state.changes }
					}
				};
			}
		};
		/**
		* The turn's latest change announcement.
		* @param owner - closing turn.
		* @returns the announcement, or null when the Host recorded none.
		*/
		function changesForClosing(owner) {
			return owner.turn.data.get("deliverables")?.changes ?? null;
		}
		/**
		* Select the latest declaration of each path in the closing turn, including
		* declarations recorded after the closing reply.
		* @param owner - closing turn.
		* @returns replayable deliveries in first-seen path order.
		*/
		function presentedForClosing(owner) {
			const files = /* @__PURE__ */ new Map();
			for (const file of owner.turn.data.get("deliverables")?.presented ?? []) files.set(file.path, file);
			return [...files.values()];
		}
		/**
		* Resolves inline-code references against one turn's produced or delivered
		* paths and explicit mutation arguments. A reference resolves only when every
		* exact or basename match identifies one target. Ambiguous and unknown tokens stay inert.
		* @param paths - The turn's produced or delivered paths, already deduplicated.
		* @param openFile - The chat view's file opener.
		* @param label - Localizes the accessible open-label for a resolved path.
		* @param operations - successful mutations whose literal arguments may name the same canonical targets.
		* @returns The resolver MarkdownText consumes; the full path rides `title`,
		* the same disambiguator the row's chips carry.
		*/
		function producedFileMentions(paths, openFile, label, operations = []) {
			return { resolve(value) {
				const matches = new Set(paths.filter((path) => path === value || basename(path) === value));
				for (const operation of operations) if (operation.argumentPath === value) matches.add(operation.path);
				const path = matches.size === 1 ? matches.values().next().value : void 0;
				if (path === void 0) return void 0;
				return {
					open: () => {
						openFile(path);
					},
					label: label(path),
					title: path
				};
			} };
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-deliverables/src/client/ChangedFiles.module.css.mjs
		const css$2 = "._8gLCIG_card{--changes-fill:var(--dsw-static-neutral-50);--changes-hover:var(--dsw-static-neutral-100);border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-1);min-width:0;color:var(--dsw-alias-label-primary);flex-direction:column;margin-top:4px;display:flex;overflow:hidden}._8gLCIG_card[data-single=true]{border-color:var(--dsw-alias-border-l1)}body[data-ds-dark-theme] ._8gLCIG_card{--changes-fill:var(--dsw-static-neutral-850);--changes-hover:var(--dsw-static-neutral-800)}._8gLCIG_header{box-sizing:border-box;background:var(--changes-fill);width:100%;min-width:0;height:60px;color:inherit;font:inherit;text-align:left;border:0;align-items:center;gap:10px;margin:0;padding:8px 10px;display:flex}button._8gLCIG_header{cursor:pointer;transition:background-color .12s}button._8gLCIG_header:focus-visible{background:var(--changes-hover)}@media (hover:hover){button._8gLCIG_header:hover:not(:disabled){background:var(--changes-hover)}}button._8gLCIG_header:focus-visible{box-shadow:inset 0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline:none}button._8gLCIG_header:disabled{cursor:progress}._8gLCIG_tile{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l1);background:color-mix(in srgb, var(--dsw-static-neutral-00) 50%, transparent);border-radius:10px;flex:none;place-items:center;width:40px;height:40px;display:grid}body[data-ds-dark-theme] ._8gLCIG_tile{background:color-mix(in srgb, var(--dsw-static-neutral-00) 5%, transparent)}._8gLCIG_titles{flex-direction:column;flex:1;min-width:0;display:flex}._8gLCIG_title{text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:500;line-height:20px;overflow:hidden}._8gLCIG_stat{color:var(--dsw-alias-label-tertiary);font-size:10px;line-height:16px;display:inline-flex}._8gLCIG_statCounts{font-family:var(--ds-font-family-code);gap:6px;display:inline-flex}._8gLCIG_previewHint,._8gLCIG_header:focus-visible ._8gLCIG_statCounts{display:none}@media (hover:hover){._8gLCIG_header:hover ._8gLCIG_statCounts{display:none}}._8gLCIG_header:focus-visible ._8gLCIG_previewHint{display:inline}@media (hover:hover){._8gLCIG_header:hover ._8gLCIG_previewHint{display:inline}}._8gLCIG_stat[data-error=true],._8gLCIG_counts[data-error=true]{color:var(--dsw-alias-state-error-primary)}._8gLCIG_added{color:var(--dsw-alias-state-success-primary)}._8gLCIG_deleted{color:var(--dsw-alias-state-error-primary)}._8gLCIG_list{border-top:.5px solid var(--dsw-alias-border-l2);margin:0;padding:0;list-style:none}._8gLCIG_row{box-sizing:border-box;width:100%;min-width:0;min-height:24px;color:var(--dsw-alias-label-tertiary);cursor:pointer;font-family:var(--ds-font-family-code);text-align:left;background:0 0;border:0;justify-content:space-between;align-items:center;gap:10px;margin:0;padding:7px 18px 7px 14px;font-size:11px;line-height:18px;display:flex}._8gLCIG_row:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}@media (hover:hover){._8gLCIG_row:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}}._8gLCIG_row:focus-visible{box-shadow:inset 0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline:none}._8gLCIG_row:disabled{cursor:progress}._8gLCIG_path{min-width:0;font-family:var(--dsw-font-family);text-overflow:ellipsis;white-space:nowrap;font-size:12px;overflow:hidden}._8gLCIG_counts{white-space:nowrap;color:var(--dsw-alias-label-tertiary);flex:none;gap:6px;display:inline-flex}._8gLCIG_toggle{box-sizing:border-box;width:100%;color:var(--dsw-alias-label-tertiary);cursor:pointer;font:inherit;text-align:left;background:0 0;border:0;justify-content:flex-start;align-items:center;gap:4px;margin:0;padding:10px 18px 10px 14px;font-size:12px;line-height:18px;display:inline-flex}@media (hover:hover){._8gLCIG_toggle:hover{background:var(--dsw-alias-interactive-bg-hover)}}._8gLCIG_toggle svg{flex:none;width:14px;height:14px}@media (pointer:coarse){._8gLCIG_row,._8gLCIG_toggle{min-height:44px}}._8gLCIG_preview{max-height:100%;overflow:hidden}._8gLCIG_previewPath{min-width:0;color:var(--dsw-alias-label-tertiary);font-family:var(--ds-font-family-code);white-space:nowrap;flex:auto;font-size:12px;line-height:20px;overflow:auto hidden}._8gLCIG_preview [data-diff-note=metadata],._8gLCIG_preview [data-diff-hunk-header]{display:none}";
		const tagId$2 = "@deepseek-ai/dsh-client-ui-deliverables/ChangedFiles.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$2) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-deliverables";
			tag.dataset.pluginCss = tagId$2;
			tag.textContent = css$2;
			document.head.appendChild(tag);
		}
		var ChangedFiles_module_css_default = {
			"added": "_8gLCIG_added",
			"card": "_8gLCIG_card",
			"counts": "_8gLCIG_counts",
			"deleted": "_8gLCIG_deleted",
			"header": "_8gLCIG_header",
			"list": "_8gLCIG_list",
			"path": "_8gLCIG_path",
			"preview": "_8gLCIG_preview",
			"previewHint": "_8gLCIG_previewHint",
			"previewPath": "_8gLCIG_previewPath",
			"row": "_8gLCIG_row",
			"stat": "_8gLCIG_stat",
			"statCounts": "_8gLCIG_statCounts",
			"tile": "_8gLCIG_tile",
			"title": "_8gLCIG_title",
			"titles": "_8gLCIG_titles",
			"toggle": "_8gLCIG_toggle"
		};
		//#endregion
		//#region lib/types/client/ChangedFiles.js
		/** Turn changes use a compact single-file card or a header with a folded file list. */
		/** Rows shown before the fold; the design's summary height for a closing message. */
		const COLLAPSED_ROWS = 4;
		const GROUPED$1 = new Intl.NumberFormat("en-US");
		/** Added and deleted line counts in the card's colors. */
		function Counts$1({ added, deleted, t }) {
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
				className: ChangedFiles_module_css_default.added,
				children: t("changes.added", { count: GROUPED$1.format(added) })
			}), (0, react_jsx_runtime.jsx)("span", {
				className: ChangedFiles_module_css_default.deleted,
				children: t("changes.deleted", { count: GROUPED$1.format(deleted) })
			})] });
		}
		/**
		* Render one turn's changed files. The header opens the turn's review in the
		* right Sidebar on its first file. A single file uses only the header; it and
		* multi-file rows preview their comparison after a 500ms hover.
		* @param props - the recorded summary, the review opener, and localized copy.
		* @returns the card.
		*/
		function ChangedFiles({ changes, cwd, openReview, t, sessionId, useChangesDiff, loadChangesDiff }) {
			const cardRef = (0, react.useRef)(null);
			const pathDescriptionId = (0, react.useId)();
			const [expanded, setExpanded] = (0, react.useState)(false);
			const singleFile = changes.total === 1 ? changes.files[0] : void 0;
			const foldable = changes.files.length > COLLAPSED_ROWS;
			const rows = foldable && !expanded ? changes.files.slice(0, COLLAPSED_ROWS) : changes.files;
			const header = (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: ChangedFiles_module_css_default.header,
				"aria-label": singleFile === void 0 ? t("changes.openReview") : t("changes.viewDiff", { name: singleFile.display }),
				"aria-describedby": singleFile === void 0 ? void 0 : pathDescriptionId,
				onClick: () => {
					openReview(0);
				},
				children: [(0, react_jsx_runtime.jsx)("span", {
					className: ChangedFiles_module_css_default.tile,
					children: singleFile === void 0 ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, {
						kind: "code",
						size: 20
					}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, {
						path: singleFile.path,
						size: 20
					})
				}), (0, react_jsx_runtime.jsxs)("span", {
					className: ChangedFiles_module_css_default.titles,
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: ChangedFiles_module_css_default.title,
						children: singleFile === void 0 ? t("changes.title", { count: String(changes.total) }) : t("changes.singleTitle", { name: basename(singleFile.path) })
					}), (0, react_jsx_runtime.jsxs)("span", {
						className: ChangedFiles_module_css_default.stat,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: ChangedFiles_module_css_default.statCounts,
							children: singleFile?.binary === true ? t("changes.binary") : singleFile?.oversized === true ? t("changes.oversized") : (0, react_jsx_runtime.jsx)(Counts$1, {
								t,
								added: changes.added,
								deleted: changes.deleted
							})
						}), (0, react_jsx_runtime.jsx)("span", {
							className: ChangedFiles_module_css_default.previewHint,
							children: t("presented.preview")
						})]
					})]
				})]
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: cardRef,
				className: ChangedFiles_module_css_default.card,
				"data-changed-files": true,
				"data-single": singleFile !== void 0 || void 0,
				children: [
					singleFile === void 0 ? header : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.HoverCard, {
						variant: "preview",
						widthAnchorRef: cardRef,
						openDelayMs: 500,
						anchor: header,
						content: (0, react_jsx_runtime.jsx)(ChangedFilePreview, {
							sessionId,
							seq: changes.seq,
							index: 0,
							display: resolveWorkspacePath(cwd, singleFile.path),
							useChangesDiff,
							loadChangesDiff,
							t
						})
					}), (0, react_jsx_runtime.jsx)("span", {
						id: pathDescriptionId,
						hidden: true,
						children: resolveWorkspacePath(cwd, singleFile.path)
					})] }),
					singleFile === void 0 && (0, react_jsx_runtime.jsx)("ul", {
						className: ChangedFiles_module_css_default.list,
						children: rows.map((file, index) => (0, react_jsx_runtime.jsxs)("li", { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.HoverCard, {
							variant: "preview",
							widthAnchorRef: cardRef,
							openDelayMs: 500,
							content: (0, react_jsx_runtime.jsx)(ChangedFilePreview, {
								sessionId,
								seq: changes.seq,
								index,
								display: resolveWorkspacePath(cwd, file.path),
								useChangesDiff,
								loadChangesDiff,
								t
							}),
							anchor: (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: ChangedFiles_module_css_default.row,
								"aria-label": t("changes.viewDiff", { name: file.display }),
								"aria-describedby": `${pathDescriptionId}-${index}`,
								onClick: () => {
									openReview(index);
								},
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: ChangedFiles_module_css_default.path,
									children: file.display
								}), (0, react_jsx_runtime.jsx)("span", {
									className: ChangedFiles_module_css_default.counts,
									children: file.binary === true ? t("changes.binary") : file.oversized === true ? t("changes.oversized") : (0, react_jsx_runtime.jsx)(Counts$1, {
										t,
										added: file.added,
										deleted: file.deleted
									})
								})]
							})
						}), (0, react_jsx_runtime.jsx)("span", {
							id: `${pathDescriptionId}-${index}`,
							hidden: true,
							children: resolveWorkspacePath(cwd, file.path)
						})] }, file.display))
					}),
					foldable && (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: ChangedFiles_module_css_default.toggle,
						"aria-expanded": expanded,
						"aria-label": t(expanded ? "changes.collapseAria" : "changes.expandAria", { count: String(changes.files.length) }),
						onClick: () => {
							setExpanded((value) => !value);
						},
						children: [(0, react_jsx_runtime.jsx)("span", { children: t(expanded ? "changes.collapse" : "changes.all", { count: String(changes.files.length) }) }), expanded ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronUpOutlineRegular, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {})]
					})
				]
			});
		}
		/** Mounted only while its hover card is open, so passing over a row does not read a comparison. */
		function ChangedFilePreview({ sessionId, seq, index, display, useChangesDiff, loadChangesDiff, t }) {
			const state = useChangesDiff((value) => value[changesDiffUrl(sessionId, seq, index)]);
			(0, react.useEffect)(() => {
				if (state === void 0) loadChangesDiff(sessionId, seq, index);
			}, [
				state,
				sessionId,
				seq,
				index,
				loadChangesDiff
			]);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: `${FileDiff_module_css_default.root} ${ChangedFiles_module_css_default.preview}`,
				"data-changes-hover-preview": true,
				children: [(0, react_jsx_runtime.jsx)("div", {
					className: FileDiff_module_css_default.header,
					children: (0, react_jsx_runtime.jsx)("span", {
						className: ChangedFiles_module_css_default.previewPath,
						"data-changes-preview-path": true,
						children: display
					})
				}), (0, react_jsx_runtime.jsx)(FileDiff, {
					state,
					split: false,
					wrap: false,
					t,
					retry: () => {
						loadChangesDiff(sessionId, seq, index);
					}
				})]
			});
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-deliverables/src/client/Deliverables.module.css.mjs
		const css$1 = ".Wjck8a_root{--deliverable-fill:var(--dsw-static-neutral-50);--deliverable-hover:var(--dsw-static-neutral-100);flex-direction:column;gap:16px;min-width:0;margin-top:4px;display:flex;container-type:inline-size}.Wjck8a_root[data-after-changes=true]{margin-top:0}body[data-ds-dark-theme] .Wjck8a_root{--deliverable-fill:var(--dsw-static-neutral-850);--deliverable-hover:var(--dsw-static-neutral-800)}.Wjck8a_hostStatus{color:var(--dsw-alias-label-secondary);align-items:center;gap:8px;font-size:12px;line-height:18px;display:flex}.Wjck8a_presented{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;min-width:0;display:grid}.Wjck8a_presented[data-single=true]{grid-template-columns:minmax(0,1fr)}.Wjck8a_file{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg);background:var(--deliverable-fill);min-width:0;height:60px;color:var(--dsw-alias-label-primary);align-items:center;gap:10px;padding:8px 10px;transition:background-color .12s;display:flex;position:relative;overflow:hidden}@media (hover:hover){.Wjck8a_file:hover{background:var(--deliverable-hover)}}.Wjck8a_cardPreview{z-index:1;border-radius:inherit;cursor:pointer;background:0 0;border:0;width:100%;padding:0;position:absolute;inset:0}.Wjck8a_cardPreview:focus-visible{box-shadow:inset 0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline:none}.Wjck8a_fileIcon{z-index:2;box-sizing:border-box;pointer-events:none;border:.5px solid var(--dsw-alias-border-l1);background:color-mix(in srgb, var(--dsw-static-neutral-00) 50%, transparent);width:40px;height:40px;color:var(--dsw-alias-link);border-radius:10px;flex:none;place-items:center;display:grid;position:relative;overflow:hidden}body[data-ds-dark-theme] .Wjck8a_fileIcon{background:color-mix(in srgb, var(--dsw-static-neutral-00) 5%, transparent)}.Wjck8a_fileBody{z-index:2;pointer-events:none;flex:1;justify-content:space-between;align-items:center;gap:12px;min-width:0;display:flex;position:relative}.Wjck8a_details{flex-direction:column;flex:1;justify-content:center;gap:2px;min-width:0;display:flex}.Wjck8a_fileName{text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:500;line-height:20px;overflow:hidden}.Wjck8a_description{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:10px;font-weight:400;line-height:16px;overflow:hidden}.Wjck8a_description[data-error=true]{color:var(--dsw-alias-state-error-primary)}.Wjck8a_previewHint{display:none}@media (hover:hover){.Wjck8a_file:hover .Wjck8a_description:not([role=status]) .Wjck8a_secondaryText{display:none}.Wjck8a_file:hover .Wjck8a_description:not([role=status]) .Wjck8a_previewHint{display:inline}}.Wjck8a_toggle{border-radius:var(--dsw-radius-sm);min-width:0;color:var(--dsw-alias-label-tertiary);cursor:pointer;font:inherit;background:0 0;border:0;align-self:center;align-items:center;gap:4px;padding:1px 11px;font-size:12px;line-height:18px;display:inline-flex}@media (hover:hover){.Wjck8a_toggle:hover{background:var(--dsw-alias-interactive-bg-hover)}}.Wjck8a_toggle svg{flex:none;width:14px;height:14px}@container (width<=620px){.Wjck8a_presented{grid-template-columns:minmax(0,1fr)}}.Wjck8a_actions{pointer-events:auto;flex:none;display:inline-flex}.Wjck8a_secondaryText[data-success]{animation-name:Wjck8a_success-fade;animation-timing-function:ease-out;animation-fill-mode:forwards}@keyframes Wjck8a_success-fade{to{opacity:0}}@media (prefers-reduced-motion:reduce){.Wjck8a_secondaryText[data-success]{animation-name:none}}";
		const tagId$1 = "@deepseek-ai/dsh-client-ui-deliverables/Deliverables.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-deliverables";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var Deliverables_module_css_default = {
			"actions": "Wjck8a_actions",
			"cardPreview": "Wjck8a_cardPreview",
			"description": "Wjck8a_description",
			"details": "Wjck8a_details",
			"file": "Wjck8a_file",
			"fileBody": "Wjck8a_fileBody",
			"fileIcon": "Wjck8a_fileIcon",
			"fileName": "Wjck8a_fileName",
			"hostStatus": "Wjck8a_hostStatus",
			"presented": "Wjck8a_presented",
			"previewHint": "Wjck8a_previewHint",
			"root": "Wjck8a_root",
			"secondaryText": "Wjck8a_secondaryText",
			"success-fade": "Wjck8a_success-fade",
			"toggle": "Wjck8a_toggle"
		};
		//#endregion
		//#region lib/types/client/PresentedFileCard.js
		function cardDescription(description, fallback) {
			const trimmed = description?.replace(/\s*(?:\([^()]*\)|（[^（）]*）)\s*$/u, "").trim();
			return trimmed === void 0 || trimmed === "" ? fallback : trimmed;
		}
		/**
		* Render independent file actions without nesting buttons inside a clickable card.
		* @param props - durable file metadata, Sidebar preview, Host capabilities, gesture status, and localized copy.
		* @returns the file card and its anchored action menu.
		*/
		function PresentedFileCard({ file, cwd, phase, host, onPreview, actions, t }) {
			const succeeded = phase === "opened" || phase === "revealed";
			const reveal = host?.fileManager ?? "directory";
			const name = basename(file.path);
			const metadata = (0, _deepseek_ai_dsh_client_ui_primitives.fileExtension)(name).toUpperCase() || t("presented.file");
			const status = phase === void 0 ? cardDescription(file.description, metadata) : t(reveal === "directory" && phase === "revealed" ? "presented.directoryOpened" : reveal === "directory" && phase === "revealing" ? "presented.directoryOpening" : reveal === "directory" && phase === "revealError" ? "presented.directoryError" : `presented.${phase}`);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: Deliverables_module_css_default.file,
				"data-presented-file": true,
				children: [
					(0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: Deliverables_module_css_default.cardPreview,
						title: resolveWorkspacePath(cwd, file.path),
						"aria-label": t("presented.previewCard", { name: file.path }),
						onClick: onPreview
					}),
					(0, react_jsx_runtime.jsx)("span", {
						className: Deliverables_module_css_default.fileIcon,
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, {
							path: file.path,
							size: 20
						})
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: Deliverables_module_css_default.fileBody,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: Deliverables_module_css_default.details,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: Deliverables_module_css_default.fileName,
								children: name
							}), (0, react_jsx_runtime.jsxs)("span", {
								className: Deliverables_module_css_default.description,
								"data-presented-description": true,
								role: phase === void 0 ? void 0 : "status",
								"data-error": phase === "error" || phase === "revealError" || phase === "nativeUnavailable" ? true : void 0,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: Deliverables_module_css_default.secondaryText,
									"data-success": succeeded || void 0,
									style: succeeded ? {
										animationDelay: `${PRESENTED_SUCCESS_HOLD_MS}ms`,
										animationDuration: `200ms`
									} : void 0,
									children: status
								}), (0, react_jsx_runtime.jsx)("span", {
									className: Deliverables_module_css_default.previewHint,
									children: t("presented.preview")
								})]
							})]
						}), (0, react_jsx_runtime.jsx)("div", {
							className: Deliverables_module_css_default.actions,
							children: actions
						})]
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/Deliverables.js
		/** The changed-files card, shown only while the Host serves the turn's summary, and explicitly declared files for a closing turn. */
		const COLLAPSED_PRESENTED_COUNT = 4;
		/**
		* Claim turns with a change announcement or declared files.
		* @param owner - closing turn.
		* @returns matched announcement and deliveries, or null for a turn with neither.
		*/
		function selectDeliverables(owner) {
			const changes = changesForClosing(owner);
			const presented = presentedForClosing(owner);
			return changes === null && presented.length === 0 ? null : {
				changes,
				presented
			};
		}
		/**
		* Contribute file deliveries alongside other completed-Turn artifacts.
		* @param props - closing Turn, file actions, and localized copy.
		* @returns file rows, or null when the Turn declares none.
		*/
		function DeliverablesTail(props) {
			const matched = selectDeliverables(props);
			return matched === null ? null : (0, react_jsx_runtime.jsx)(Deliverables, {
				...props,
				matched
			});
		}
		/**
		* Render the changed-files card, once the Host has served the announced
		* summary and it lists a file, and shared native opening controls for declared
		* files. A summary the Host no longer serves leaves no card.
		* @param props - matched announcement and files, workspace opener, and localized copy.
		* @returns the closing turn's file rows.
		*/
		function Deliverables({ matched, openFile, t, sessionId, useSessions, openPresented, openChangesReview, usePresentedOpen, usePresentedHost, useChangesDiff, loadChangesDiff, useChangesSummary, reloadPresentedHost, loadChangesSummary, useShowCodeDiff, renderSlot }) {
			const [expanded, setExpanded] = (0, react.useState)(false);
			const showCodeDiff = useShowCodeDiff((value) => value);
			const cwd = useSessions((state) => state.byId[sessionId]?.cwd);
			const states = usePresentedOpen((value) => value);
			const host = usePresentedHost((value) => value);
			const announced = showCodeDiff ? matched.changes : null;
			const summary = useChangesSummary((value) => announced === null ? void 0 : value[changesSummaryUrl(sessionId, announced.seq)]);
			(0, react.useEffect)(() => {
				if (announced !== null && summary === void 0) loadChangesSummary(sessionId, announced.seq);
			}, [
				announced,
				summary,
				sessionId,
				loadChangesSummary
			]);
			const changes = announced !== null && typeof summary === "object" && summary.files.length > 0 ? {
				seq: announced.seq,
				...summary
			} : null;
			const collapsible = matched.presented.length > COLLAPSED_PRESENTED_COUNT;
			const presented = collapsible && !expanded ? matched.presented.slice(0, COLLAPSED_PRESENTED_COUNT) : matched.presented;
			(0, react.useEffect)(() => {
				if (host === null) reloadPresentedHost();
			}, [host, reloadPresentedHost]);
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [changes !== null && (0, react_jsx_runtime.jsx)(ChangedFiles, {
				changes,
				cwd,
				t,
				sessionId,
				useChangesDiff,
				loadChangesDiff,
				openReview: (index) => {
					openChangesReview({
						sessionId,
						seq: changes.seq,
						turn: changes.turn
					}, index);
				}
			}), matched.presented.length > 0 && (0, react_jsx_runtime.jsxs)("div", {
				className: Deliverables_module_css_default.root,
				"data-after-changes": changes !== null || void 0,
				children: [
					host === "error" && (0, react_jsx_runtime.jsxs)("div", {
						className: Deliverables_module_css_default.hostStatus,
						children: [(0, react_jsx_runtime.jsx)("span", { children: t("presented.hostError") }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							size: "sm",
							onClick: () => {
								reloadPresentedHost();
							},
							children: t("presented.retry")
						})]
					}),
					host !== null && host !== "error" && !host.available && (0, react_jsx_runtime.jsx)("span", {
						className: Deliverables_module_css_default.hostStatus,
						children: t("presented.unavailable")
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: Deliverables_module_css_default.presented,
						"data-presented-files-row": true,
						"data-single": matched.presented.length === 1 ? true : void 0,
						children: presented.map((file) => (0, react_jsx_runtime.jsx)(PresentedFileCard, {
							file,
							cwd,
							phase: states[presentedFileUrl(sessionId, file.seq, file.index)],
							host: host === "error" ? null : host,
							t,
							onPreview: () => {
								openFile(file.path);
							},
							actions: renderSlot("deliverables.file.actions", {
								actionUrl: presentedFileUrl(sessionId, file.seq, file.index),
								available: host !== null && host !== "error" && host.available,
								pending: states[presentedFileUrl(sessionId, file.seq, file.index)] === "opening" || states[presentedFileUrl(sessionId, file.seq, file.index)] === "revealing",
								onAction: (action, application) => openPresented(sessionId, file.seq, file.index, action, application)
							})
						}, `${file.seq}:${file.index}`))
					}),
					collapsible && (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: Deliverables_module_css_default.toggle,
						"aria-expanded": expanded,
						"aria-label": t(expanded ? "presented.collapseAria" : "presented.expandAria", { count: matched.presented.length }),
						onClick: () => {
							setExpanded((value) => !value);
						},
						children: [(0, react_jsx_runtime.jsx)("span", { children: t(expanded ? "presented.collapse" : "presented.all", { count: matched.presented.length }) }), expanded ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronUpOutlineRegular, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {})]
					})
				]
			})] });
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-deliverables/src/client/ReviewTab.module.css.mjs
		const css = ".bJoWxq_root{height:100%}.bJoWxq_selector{flex:0 auto;min-width:0}.bJoWxq_selectorLabel{text-overflow:ellipsis;white-space:nowrap;flex:auto;min-width:0;font-size:12px;overflow:hidden}.bJoWxq_selectorButton{box-sizing:border-box;border-radius:var(--dsw-radius-sm);max-width:100%;height:28px;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;background:0 0;border:0;align-items:center;gap:4px;padding:0 6px 0 8px;font-size:12px;line-height:20px;display:inline-flex}.bJoWxq_selectorButton[aria-expanded=true]{background:var(--dsw-alias-interactive-bg-hover)}@media (hover:hover){.bJoWxq_selectorButton:hover{background:var(--dsw-alias-interactive-bg-hover)}}.bJoWxq_selectorButton svg{flex:none;display:block}.bJoWxq_item{justify-content:space-between;align-items:center;gap:12px;min-width:0;display:flex}.bJoWxq_itemPath{text-overflow:ellipsis;white-space:nowrap;min-width:0;line-height:20px;overflow:hidden}.bJoWxq_itemCounts,.bJoWxq_counts{font-family:var(--ds-font-family-code);color:var(--dsw-alias-label-tertiary);flex:none;align-items:center;gap:6px;font-size:12px;line-height:20px;display:inline-flex}.bJoWxq_counts{min-width:0;margin-right:auto}.bJoWxq_added{color:var(--dsw-alias-state-success-primary)}.bJoWxq_deleted{color:var(--dsw-alias-state-error-primary)}.bJoWxq_label{color:var(--dsw-alias-label-tertiary)}.bJoWxq_tools{flex:none;align-items:center;gap:2px;margin-left:auto;display:inline-flex}.bJoWxq_tool{border-radius:var(--dsw-radius-sm);width:28px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;flex:none;justify-content:center;align-items:center;padding:6px;display:inline-flex}.bJoWxq_tool svg{width:15px;height:15px}@media (hover:hover){.bJoWxq_tool:hover:not(:disabled){color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}}.bJoWxq_tool[aria-pressed=true] .bJoWxq_compareIcon{transform:rotate(90deg)}.bJoWxq_tool:disabled{cursor:progress}.bJoWxq_tool[data-error]{color:var(--dsw-alias-state-error-primary)}";
		const tagId = "@deepseek-ai/dsh-client-ui-deliverables/ReviewTab.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-deliverables";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var ReviewTab_module_css_default = {
			"added": "bJoWxq_added",
			"compareIcon": "bJoWxq_compareIcon",
			"counts": "bJoWxq_counts",
			"deleted": "bJoWxq_deleted",
			"item": "bJoWxq_item",
			"itemCounts": "bJoWxq_itemCounts",
			"itemPath": "bJoWxq_itemPath",
			"label": "bJoWxq_label",
			"root": "bJoWxq_root",
			"selector": "bJoWxq_selector",
			"selectorButton": "bJoWxq_selectorButton",
			"selectorLabel": "bJoWxq_selectorLabel",
			"tool": "bJoWxq_tool",
			"tools": "bJoWxq_tools"
		};
		//#endregion
		//#region lib/types/client/ReviewTab.js
		/**
		* The review tab: one turn's changed files behind a file selector, with the
		* selected file's turn-start and turn-end comparison drawn unified or side by
		* side, wrapped or scrolling, and controls to open the file itself.
		*/
		const GROUPED = new Intl.NumberFormat("en-US");
		/** The file index a navigation names, when it names one. */
		function navigatedIndex(params) {
			const index = params?.index;
			return typeof index === "number" && Number.isSafeInteger(index) && index >= 0 ? index : void 0;
		}
		/** Added and deleted line counts in the card's colors. */
		function Counts({ file, t }) {
			if (file.binary === true) return (0, react_jsx_runtime.jsx)("span", {
				className: ReviewTab_module_css_default.label,
				children: t("changes.binary")
			});
			if (file.oversized === true) return (0, react_jsx_runtime.jsx)("span", {
				className: ReviewTab_module_css_default.label,
				children: t("changes.oversized")
			});
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
				className: ReviewTab_module_css_default.added,
				children: t("changes.added", { count: GROUPED.format(file.added) })
			}), (0, react_jsx_runtime.jsx)("span", {
				className: ReviewTab_module_css_default.deleted,
				children: t("changes.deleted", { count: GROUPED.format(file.deleted) })
			})] });
		}
		/**
		* The review type's body, registered under `sidebar.right.pane.tab` as `changes-review`.
		* @param props - composed slot props.
		* @returns the selected file's comparison behind the file selector, or the state that stands in for it.
		*/
		function ReviewTab({ useTabInfo, sessionId, useSessions, useStore, actions, useChangesSummary, useChangesDiff, usePresentedOpen, usePresentedHost, loadChangesSummary, loadChangesDiff, reloadPresentedHost, openChanged, t, renderSlot }) {
			const { tab } = useTabInfo();
			const { navigation, signal } = tab;
			const coordinates = (0, react.useMemo)(() => parseChangesReviewAddress(tab.contentId), [tab.contentId]);
			if (coordinates === void 0) throw new Error(`ui-deliverables: not a review address "${tab.contentId}"`);
			const { seq } = coordinates;
			const cwd = useSessions((sessions) => sessions.byId[sessionId]?.cwd);
			const summary = useChangesSummary((value) => value[changesSummaryUrl(sessionId, seq)]);
			const state = useStore((store) => store.byTab[tab.id]);
			const host = usePresentedHost((value) => value);
			(0, react.useEffect)(() => {
				if (state?.navigated === navigation.revision) return;
				actions.navigated(tab.id, navigation.revision, navigatedIndex(navigation.params) ?? state?.index ?? 0);
			}, [
				state,
				navigation.revision,
				navigation.params,
				actions,
				tab.id
			]);
			(0, react.useEffect)(() => {
				const forget = () => {
					actions.forget(tab.id);
				};
				signal.addEventListener("abort", forget, { once: true });
				return () => {
					signal.removeEventListener("abort", forget);
				};
			}, [
				signal,
				actions,
				tab.id
			]);
			(0, react.useEffect)(() => {
				if (summary === void 0) loadChangesSummary(sessionId, seq);
			}, [
				summary,
				sessionId,
				seq,
				loadChangesSummary
			]);
			(0, react.useEffect)(() => {
				if (host === null) reloadPresentedHost();
			}, [host, reloadPresentedHost]);
			const files = typeof summary === "object" ? summary.files : [];
			const index = state !== void 0 && files[state.index] !== void 0 ? state.index : 0;
			const file = files[index];
			const diffState = useChangesDiff((value) => file === void 0 ? void 0 : value[changesDiffUrl(sessionId, seq, index)]);
			(0, react.useEffect)(() => {
				if (file !== void 0 && diffState === void 0) loadChangesDiff(sessionId, seq, index);
			}, [
				file,
				diffState,
				sessionId,
				seq,
				index,
				loadChangesDiff
			]);
			const phase = usePresentedOpen((value) => file === void 0 ? void 0 : value[changedFileUrl(sessionId, seq, index)]);
			const [menuOpen, setMenuOpen] = (0, react.useState)(false);
			const split = state?.split === true;
			const wrap = state?.wrap === true;
			const native = host !== null && host !== "error" && host.available && phase !== "nativeUnavailable";
			const summaryState = summary === void 0 || summary === "loading" ? "loading" : summary === "missing" ? "missing" : "ready";
			return (0, react_jsx_runtime.jsxs)("div", {
				className: `${FileDiff_module_css_default.root} ${ReviewTab_module_css_default.root}`,
				"data-changes-review": true,
				"data-review-state": summaryState,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: FileDiff_module_css_default.header,
						children: [
							file === void 0 ? (0, react_jsx_runtime.jsx)("span", {
								className: ReviewTab_module_css_default.selectorLabel,
								children: t("review.title", { turn: String(coordinates.turn) })
							}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
								className: ReviewTab_module_css_default.selector,
								open: menuOpen,
								autoFocus: true,
								portal: true,
								align: "start",
								dense: true,
								onClose: () => {
									setMenuOpen(false);
								},
								anchor: (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: ReviewTab_module_css_default.selectorButton,
									"aria-haspopup": "menu",
									"aria-expanded": menuOpen,
									"aria-label": t("review.selectFile"),
									title: file.display,
									"data-review-file": file.path,
									onClick: () => {
										setMenuOpen((value) => !value);
									},
									children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.PathLabel, { path: file.display }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { size: 12 })]
								}),
								items: files.map((entry, at) => ({
									id: String(at),
									label: (0, react_jsx_runtime.jsxs)("span", {
										className: ReviewTab_module_css_default.item,
										children: [(0, react_jsx_runtime.jsx)("span", {
											className: ReviewTab_module_css_default.itemPath,
											children: entry.display
										}), (0, react_jsx_runtime.jsx)("span", {
											className: ReviewTab_module_css_default.itemCounts,
											children: (0, react_jsx_runtime.jsx)(Counts, {
												file: entry,
												t
											})
										})]
									})
								})),
								selectedId: String(index),
								onSelect: (id) => {
									actions.selected(tab.id, Number(id));
									setMenuOpen(false);
								}
							}),
							file !== void 0 && (0, react_jsx_runtime.jsx)("span", {
								className: ReviewTab_module_css_default.counts,
								children: (0, react_jsx_runtime.jsx)(Counts, {
									file,
									t
								})
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: ReviewTab_module_css_default.tools,
								children: [
									(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
										label: t(split ? "review.unified" : "review.split"),
										side: "bottom",
										delayMs: 500,
										children: (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: ReviewTab_module_css_default.tool,
											"aria-pressed": split,
											"aria-label": t("review.splitAria"),
											"data-review-tool": "split",
											onClick: () => {
												actions.toggledSplit(tab.id);
											},
											children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCompareSplitOutlineRegular, { className: ReviewTab_module_css_default.compareIcon })
										})
									}),
									(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
										label: t(wrap ? "review.nowrap" : "review.wrap"),
										side: "bottom",
										delayMs: 500,
										children: (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: ReviewTab_module_css_default.tool,
											"aria-pressed": wrap,
											"aria-label": t("review.wrapAria"),
											"data-review-tool": "wrap",
											onClick: () => {
												actions.toggledWrap(tab.id);
											},
											children: wrap ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconNowrapFillRegular, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWrapFillRegular, {})
										})
									}),
									file !== void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
										label: t("review.openFile"),
										side: "bottom",
										delayMs: 500,
										children: (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: ReviewTab_module_css_default.tool,
											"aria-label": t("review.openFileAria", { name: file.display }),
											"data-review-tool": "open-file",
											onClick: () => {
												tab.actions.openResource(fileAddressFor(sessionId, cwd, file.path));
											},
											children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconInspectOutlineRegular, {})
										})
									}),
									file !== void 0 && renderSlot("deliverables.review.file.actions", {
										actionUrl: changedFileUrl(sessionId, seq, index),
										available: native,
										pending: phase === "opening" || phase === "revealing",
										onAction: (action, application) => openChanged(sessionId, seq, index, action, application)
									})
								]
							})
						]
					}),
					summaryState === "loading" && (0, react_jsx_runtime.jsx)("p", {
						className: FileDiff_module_css_default.status,
						role: "status",
						children: t("diff.loading")
					}),
					summaryState === "missing" && (0, react_jsx_runtime.jsx)("p", {
						className: FileDiff_module_css_default.status,
						children: t("diff.missing")
					}),
					file !== void 0 && (0, react_jsx_runtime.jsx)(FileDiff, {
						state: diffState,
						split,
						wrap,
						t,
						retry: () => {
							loadChangesDiff(sessionId, seq, index);
						}
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/review-definition.js
		/** The tab kind this package owns. */
		const CHANGES_REVIEW_KIND = "changes-review";
		/** This implementation's identity in the tab system, and the key its body registers under. */
		const CHANGES_REVIEW_ID = "@deepseek-ai/dsh-client-ui-deliverables";
		/**
		* The review type's registry definition.
		* @param t - namespace-bound translate, read fresh on every title call.
		* @returns the definition to register.
		*/
		function changesReviewDefinition(t) {
			return {
				id: CHANGES_REVIEW_ID,
				kind: CHANGES_REVIEW_KIND,
				patterns: ["dsh-resource://changes-review/**"],
				priority: "builtin",
				canOpen: (address) => parseChangesReviewAddress(address) !== void 0,
				title: (address) => {
					const turn = parseChangesReviewAddress(address)?.turn;
					return turn === void 0 ? address : t("review.title", { turn: String(turn) });
				}
			};
		}
		//#endregion
		//#region lib/types/client/review-store.js
		/**
		* The review tab's view state: which listed file is shown, whether hunks are
		* drawn side by side, and whether long lines wrap. One bucket per tab, so two
		* reviews in one session keep their own choices; the bucket ends with the
		* tab record's signal.
		*/
		function bucket(state, tabId) {
			const tab = state.byTab[tabId];
			if (tab === void 0) throw new Error(`ui-deliverables: no review state for tab "${tabId}"`);
			return tab;
		}
		/**
		* Declare the review tab's store; the registration declares it as an
		* exclusive store, so the framework mints one instance per session.
		* @returns the store handle to declare on the registration.
		*/
		function createReviewStore() {
			return (0, _deepseek_ai_dsh_client_store.defineStore)({
				init: () => ({ byTab: {} }),
				actions: {
					/**
					* Apply a navigation: seed a side-by-side, unwrapped tab on its first one, then show the navigated file.
					* @param d - draft state.
					* @param tabId - the tab being drawn.
					* @param revision - the navigation revision being applied.
					* @param index - the file index the navigation named, or the current one.
					*/
					navigated: (d, tabId, revision, index) => {
						const tab = d.byTab[tabId];
						if (tab === void 0) d.byTab[tabId] = {
							index,
							split: true,
							wrap: false,
							navigated: revision
						};
						else {
							tab.index = index;
							tab.navigated = revision;
						}
					},
					/**
					* Show another listed file.
					* @param d - draft state.
					* @param tabId - the tab being drawn.
					* @param index - original index in the summary's files array.
					*/
					selected: (d, tabId, index) => {
						bucket(d, tabId).index = index;
					},
					/**
					* Switch between the unified and the side-by-side view.
					* @param d - draft state.
					* @param tabId - the tab being drawn.
					*/
					toggledSplit: (d, tabId) => {
						const tab = bucket(d, tabId);
						tab.split = !tab.split;
					},
					/**
					* Switch line wrapping.
					* @param d - draft state.
					* @param tabId - the tab being drawn.
					*/
					toggledWrap: (d, tabId) => {
						const tab = bucket(d, tabId);
						tab.wrap = !tab.wrap;
					},
					/**
					* Drop a tab's bucket once its record is gone.
					* @param d - draft state.
					* @param tabId - the tab that ended.
					*/
					forget: (d, tabId) => {
						d.byTab = Object.fromEntries(Object.entries(d.byTab).filter(([id]) => id !== tabId));
					}
				}
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** `deliverables` namespace dictionaries: cards, comparison tab, and file-mention copy. */
		/** Dictionary namespace owned by this plugin. */
		const NS = "deliverables";
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"presented.nativeUnavailable": "此文件没有可用的主机路径，请在侧边栏预览",
			"presented.revealError": "无法在文件管理器中显示，请重试",
			"presented.directoryError": "无法打开所在文件夹，请重试",
			"presented.directoryOpening": "正在打开所在文件夹…",
			"presented.directoryOpened": "已请求打开所在文件夹",
			"presented.revealed": "已请求在文件管理器中显示",
			"presented.revealing": "正在文件管理器中显示…",
			"presented.unavailable": "此主机没有可用的桌面，无法使用外部程序打开文件或文件夹；文件仍可在侧边栏预览",
			"presented.retry": "重试",
			"presented.hostError": "无法读取主机桌面信息",
			"presented.preview": "在侧边栏预览",
			"presented.previewButton": "在侧边栏打开 {name}",
			"presented.previewCard": "在侧边栏预览 {name}",
			"presented.all": "全部 {count} 个文件",
			"presented.expandAria": "展开全部 {count} 个交付文件",
			"presented.collapse": "收起",
			"presented.collapseAria": "收起交付文件列表",
			"presented.opening": "正在打开…",
			"presented.opened": "已请求打开",
			"presented.error": "打开失败，点击重试",
			"presented.file": "文件",
			"row.title": "交付文件",
			"row.running": "正在交付",
			"row.preparing": "准备交付",
			"row.ok": "已交付",
			"row.error": "交付失败",
			"row.stopped": "已中断",
			"row.inspect": "查看调用",
			"changes.title": "已编辑 {count} 个文件",
			"changes.singleTitle": "已编辑 {name}",
			"changes.added": "+{count}",
			"changes.deleted": "-{count}",
			"changes.binary": "二进制",
			"changes.openReview": "在侧边栏查看本轮改动",
			"changes.all": "全部 {count} 个文件",
			"changes.expandAria": "展开全部 {count} 个改动文件",
			"changes.collapse": "收起",
			"changes.collapseAria": "收起改动文件列表",
			"changes.oversized": "过大",
			"changes.viewDiff": "查看 {name} 的改动",
			"review.title": "第 {turn} 轮改动",
			"review.selectFile": "选择要查看的文件",
			"review.split": "切换为左右对比",
			"review.unified": "切换为单栏对比",
			"review.splitAria": "左右对比",
			"review.wrap": "开启自动换行",
			"review.nowrap": "关闭自动换行",
			"review.wrapAria": "自动换行",
			"review.openFile": "在侧边栏打开整个文件",
			"review.openFileAria": "在侧边栏打开 {name}",
			"diff.loading": "正在读取改动…",
			"diff.missing": "这轮改动的内容已不可用",
			"diff.error": "无法读取改动",
			"diff.binary": "二进制文件，无法显示改动",
			"diff.oversized": "文件过大，无法显示改动",
			"diff.created": "本轮新建的文件",
			"diff.deleted": "本轮删除的文件",
			"diff.unchanged": "两侧内容相同",
			"diff.coarse": "逐行对比超时，按整个文件替换显示",
			"diff.truncated": "只显示前 {count} 行"
		};
		/** English dictionary (same key set). */
		const en = {
			"presented.nativeUnavailable": "This file has no available Host path. Preview it in the sidebar.",
			"presented.revealError": "Could not show in file manager. Try again.",
			"presented.directoryError": "Could not open containing folder. Try again.",
			"presented.directoryOpening": "Opening containing folder…",
			"presented.directoryOpened": "Requested opening containing folder",
			"presented.revealed": "Requested display in file manager",
			"presented.revealing": "Showing in file manager…",
			"presented.unavailable": "This Host has no desktop available to open files or folders in external apps. Files can still be previewed in the sidebar.",
			"presented.retry": "Retry",
			"presented.hostError": "Could not read the Host desktop information",
			"presented.preview": "Preview in sidebar",
			"presented.previewButton": "Open {name} in sidebar",
			"presented.previewCard": "Preview {name} in sidebar",
			"presented.all": "All {count} files",
			"presented.expandAria": "Show all {count} delivered files",
			"presented.collapse": "Collapse",
			"presented.collapseAria": "Collapse delivered files",
			"presented.opening": "Opening…",
			"presented.opened": "Open requested",
			"presented.error": "Could not open. Click to retry.",
			"presented.file": "File",
			"row.title": "Present files",
			"row.running": "Delivering",
			"row.preparing": "Preparing deliverables",
			"row.ok": "Delivered",
			"row.error": "Delivery failed",
			"row.stopped": "Interrupted",
			"row.inspect": "Inspect call",
			"changes.title": "Edited {count} files",
			"changes.singleTitle": "Edited {name}",
			"changes.added": "+{count}",
			"changes.deleted": "-{count}",
			"changes.binary": "binary",
			"changes.openReview": "Review this turn’s changes in the sidebar",
			"changes.all": "All {count} files",
			"changes.expandAria": "Show all {count} changed files",
			"changes.collapse": "Collapse",
			"changes.collapseAria": "Collapse changed files",
			"changes.oversized": "too large",
			"changes.viewDiff": "View changes to {name}",
			"review.title": "Review · turn {turn}",
			"review.selectFile": "Choose the file to review",
			"review.split": "Switch to split view",
			"review.unified": "Switch to unified view",
			"review.splitAria": "Split view",
			"review.wrap": "Enable line wrap",
			"review.nowrap": "Disable line wrap",
			"review.wrapAria": "Line wrap",
			"review.openFile": "Open the whole file in the sidebar",
			"review.openFileAria": "Open {name} in sidebar",
			"diff.loading": "Reading changes…",
			"diff.missing": "The contents of this turn’s changes are no longer available",
			"diff.error": "Could not read the changes",
			"diff.binary": "Binary file; changes cannot be shown",
			"diff.oversized": "File too large; changes cannot be shown",
			"diff.created": "Created in this turn",
			"diff.deleted": "Deleted in this turn",
			"diff.unchanged": "Both sides hold the same lines",
			"diff.coarse": "Line comparison timed out; shown as a whole-file replacement",
			"diff.truncated": "Showing the first {count} lines"
		};
		/** Japanese copy, checked against the English keys. */
		const ja = {
			"presented.nativeUnavailable": "このファイルには利用可能なHostパスがありません。サイドバーでプレビューしてください。",
			"presented.revealError": "ファイルマネージャーで表示できませんでした。再試行してください。",
			"presented.directoryError": "含まれるフォルダーを開けませんでした。再試行してください。",
			"presented.directoryOpening": "含まれるフォルダーを開いています…",
			"presented.directoryOpened": "含まれるフォルダーの表示をリクエストしました",
			"presented.revealed": "ファイルマネージャーでの表示をリクエストしました",
			"presented.revealing": "ファイルマネージャーで表示しています…",
			"presented.unavailable": "このHostには、外部アプリでファイルやフォルダーを開くためのデスクトップがありません。ファイルはサイドバーで引き続きプレビューできます。",
			"presented.retry": "再試行",
			"presented.hostError": "Hostのデスクトップ情報を読み取れませんでした",
			"presented.preview": "サイドバーでプレビュー",
			"presented.previewButton": "{name}をサイドバーで開く",
			"presented.previewCard": "{name}をサイドバーでプレビュー",
			"presented.all": "全{count}ファイル",
			"presented.expandAria": "配信された全{count}ファイルを表示",
			"presented.collapse": "折りたたむ",
			"presented.collapseAria": "配信されたファイルを折りたたむ",
			"presented.opening": "開いています…",
			"presented.opened": "表示をリクエストしました",
			"presented.error": "開けませんでした。クリックして再試行してください。",
			"presented.file": "ファイル",
			"row.title": "ファイルを提示",
			"row.running": "配信中",
			"row.preparing": "成果物を準備中",
			"row.ok": "配信済み",
			"row.error": "配信に失敗しました",
			"row.stopped": "中断されました",
			"row.inspect": "呼び出しを検査",
			"changes.title": "{count}ファイルを編集しました",
			"changes.singleTitle": "{name}を編集しました",
			"changes.added": "+{count}",
			"changes.deleted": "-{count}",
			"changes.binary": "バイナリ",
			"changes.openReview": "このターンの変更をサイドバーで確認",
			"changes.all": "全{count}ファイル",
			"changes.expandAria": "変更された全{count}ファイルを表示",
			"changes.collapse": "折りたたむ",
			"changes.collapseAria": "変更されたファイルを折りたたむ",
			"changes.oversized": "サイズが大きすぎます",
			"changes.viewDiff": "{name}の変更を表示",
			"review.title": "レビュー · ターン{turn}",
			"review.selectFile": "レビューするファイルを選択",
			"review.split": "分割ビューに切り替え",
			"review.unified": "統合ビューに切り替え",
			"review.splitAria": "分割ビュー",
			"review.wrap": "行の折り返しを有効化",
			"review.nowrap": "行の折り返しを無効化",
			"review.wrapAria": "行の折り返し",
			"review.openFile": "ファイル全体をサイドバーで開く",
			"review.openFileAria": "{name}をサイドバーで開く",
			"diff.loading": "変更を読み込んでいます…",
			"diff.missing": "このターンの変更内容は利用できなくなりました",
			"diff.error": "変更を読み取れませんでした",
			"diff.binary": "バイナリファイルのため、変更を表示できません",
			"diff.oversized": "ファイルが大きすぎるため、変更を表示できません",
			"diff.created": "このターンで作成",
			"diff.deleted": "このターンで削除",
			"diff.unchanged": "両方の行内容が同一です",
			"diff.coarse": "行比較がタイムアウトしたため、ファイル全体の置換として表示しています",
			"diff.truncated": "最初の{count}行を表示"
		};
		/** Spanish dictionary, checked against the English keys. */
		const es = {
			"presented.nativeUnavailable": "Este archivo no tiene una ruta de host disponible. Vista previa en la barra lateral.",
			"presented.revealError": "No se pudo mostrar en el administrador de archivos. Intentar otra vez.",
			"presented.directoryError": "No se pudo abrir la carpeta que lo contiene. Intentar otra vez.",
			"presented.directoryOpening": "Abriendo la carpeta que contiene...",
			"presented.directoryOpened": "Apertura solicitada que contiene la carpeta",
			"presented.revealed": "Visualización solicitada en el administrador de archivos.",
			"presented.revealing": "Mostrando en el administrador de archivos…",
			"presented.unavailable": "Este Host no tiene un escritorio disponible para abrir archivos o carpetas en aplicaciones externas. Los archivos aún se pueden obtener una vista previa en la barra lateral.",
			"presented.retry": "Reintentar",
			"presented.hostError": "No se pudo leer la información del escritorio del host",
			"presented.preview": "Vista previa en la barra lateral",
			"presented.previewButton": "Abra {name} en la barra lateral",
			"presented.previewCard": "Vista previa de {name} en la barra lateral",
			"presented.all": "Todos los archivos {count}",
			"presented.expandAria": "Mostrar todos los archivos entregados {count}",
			"presented.collapse": "Contraer",
			"presented.collapseAria": "Contraer archivos entregados",
			"presented.opening": "Abriendo…",
			"presented.opened": "Abierto solicitado",
			"presented.error": "No se pudo abrir. Haga clic para volver a intentarlo.",
			"presented.file": "Archivo",
			"row.title": "Presentar archivos",
			"row.running": "Entregando",
			"row.preparing": "Preparando entregables",
			"row.ok": "Entregado",
			"row.error": "Entrega fallida",
			"row.stopped": "interrumpido",
			"row.inspect": "inspeccionar llamada",
			"changes.title": "Archivos {count} editados",
			"changes.singleTitle": "Editado {name}",
			"changes.added": "+{count}",
			"changes.deleted": "-{count}",
			"changes.binary": "binario",
			"changes.openReview": "Revisa los cambios de este turno en la barra lateral.",
			"changes.all": "Todos los archivos {count}",
			"changes.expandAria": "Mostrar todos los archivos modificados {count}",
			"changes.collapse": "Contraer",
			"changes.collapseAria": "Contraer archivos modificados",
			"changes.oversized": "demasiado grande",
			"changes.viewDiff": "Ver cambios en {name}",
			"review.title": "Revisión · turno {turn}",
			"review.selectFile": "Elija el archivo para revisar",
			"review.split": "Cambiar a vista dividida",
			"review.unified": "Cambiar a vista unificada",
			"review.splitAria": "Vista dividida",
			"review.wrap": "Habilitar ajuste de línea",
			"review.nowrap": "Desactivar ajuste de línea",
			"review.wrapAria": "Ajuste de línea",
			"review.openFile": "Abra el archivo completo en la barra lateral.",
			"review.openFileAria": "Abra {name} en la barra lateral",
			"diff.loading": "Cambios de lectura…",
			"diff.missing": "El contenido de los cambios de este turno ya no está disponible.",
			"diff.error": "No se pudieron leer los cambios.",
			"diff.binary": "Archivo binario; los cambios no se pueden mostrar",
			"diff.oversized": "Archivo demasiado grande; los cambios no se pueden mostrar",
			"diff.created": "Creado en este turno",
			"diff.deleted": "Eliminado en este turno",
			"diff.unchanged": "Ambos lados mantienen las mismas líneas.",
			"diff.coarse": "Se agotó el tiempo de espera para la comparación de líneas; se muestra como un reemplazo de archivo completo",
			"diff.truncated": "Mostrando las primeras líneas {count}"
		};
		/** French dictionary, checked against the English keys. */
		const fr = {
			"presented.nativeUnavailable": "Ce fichier n'a pas de chemin d'hôte disponible. Prévisualisez-le dans la barre latérale.",
			"presented.revealError": "Impossible d'afficher dans le gestionnaire de fichiers. Essayer à nouveau.",
			"presented.directoryError": "Impossible d'ouvrir le dossier contenant. Essayer à nouveau.",
			"presented.directoryOpening": "Ouverture du dossier contenant…",
			"presented.directoryOpened": "Ouverture demandée contenant le dossier",
			"presented.revealed": "Affichage demandé dans le gestionnaire de fichiers",
			"presented.revealing": "Affichage dans le gestionnaire de fichiers…",
			"presented.unavailable": "Cet hôte ne dispose pas de bureau disponible pour ouvrir des fichiers ou des dossiers dans des applications externes. Les fichiers peuvent toujours être prévisualisés dans la barre latérale.",
			"presented.retry": "Réessayer",
			"presented.hostError": "Impossible de lire les informations du bureau hôte",
			"presented.preview": "Aperçu dans la barre latérale",
			"presented.previewButton": "Ouvrir {name} dans la barre latérale",
			"presented.previewCard": "Aperçu de {name} dans la barre latérale",
			"presented.all": "Tous les fichiers {count}",
			"presented.expandAria": "Afficher tous les fichiers livrés {count}",
			"presented.collapse": "Réduire",
			"presented.collapseAria": "Réduire les fichiers livrés",
			"presented.opening": "Ouverture…",
			"presented.opened": "Ouvert demandé",
			"presented.error": "Impossible d'ouvrir. Cliquez pour réessayer.",
			"presented.file": "Fichier",
			"row.title": "Présenter des fichiers",
			"row.running": "Livrer",
			"row.preparing": "Préparation des livrables",
			"row.ok": "Livré",
			"row.error": "La livraison a échoué",
			"row.stopped": "Interrompu",
			"row.inspect": "Inspecter l'appel",
			"changes.title": "Fichiers {count} modifiés",
			"changes.singleTitle": "Modifié {name}",
			"changes.added": "+{count}",
			"changes.deleted": "-{count}",
			"changes.binary": "binaire",
			"changes.openReview": "Consultez les modifications de ce tour dans la barre latérale",
			"changes.all": "Tous les fichiers {count}",
			"changes.expandAria": "Afficher tous les fichiers modifiés {count}",
			"changes.collapse": "Réduire",
			"changes.collapseAria": "Réduire les fichiers modifiés",
			"changes.oversized": "trop grand",
			"changes.viewDiff": "Afficher les modifications apportées à {name}",
			"review.title": "Révision · tour {turn}",
			"review.selectFile": "Choisissez le fichier à examiner",
			"review.split": "Passer à la vue fractionnée",
			"review.unified": "Passer à la vue unifiée",
			"review.splitAria": "Vue fractionnée",
			"review.wrap": "Activer le retour à la ligne",
			"review.nowrap": "Désactiver le retour à la ligne",
			"review.wrapAria": "Retour à la ligne",
			"review.openFile": "Ouvrez l'intégralité du fichier dans la barre latérale",
			"review.openFileAria": "Ouvrir {name} dans la barre latérale",
			"diff.loading": "La lecture change…",
			"diff.missing": "Le contenu des modifications de ce tour n'est plus disponible",
			"diff.error": "Impossible de lire les modifications",
			"diff.binary": "Fichier binaire\xA0; les modifications ne peuvent pas être affichées",
			"diff.oversized": "Fichier trop volumineux\xA0; les modifications ne peuvent pas être affichées",
			"diff.created": "Créé à ce tour",
			"diff.deleted": "Supprimé à ce tour",
			"diff.unchanged": "Les deux côtés tiennent les mêmes lignes",
			"diff.coarse": "La comparaison de lignes a expiré\xA0; affiché en remplacement de l'ensemble du fichier",
			"diff.truncated": "Affichage des premières lignes {count}"
		};
		/** German dictionary, checked against the English keys. */
		const de = {
			"presented.nativeUnavailable": "Für diese Datei ist kein Hostpfad verfügbar. Sehen Sie sich die Vorschau in der Seitenleiste an.",
			"presented.revealError": "Konnte im Dateimanager nicht angezeigt werden. Versuchen Sie es erneut.",
			"presented.directoryError": "Der enthaltende Ordner konnte nicht geöffnet werden. Versuchen Sie es erneut.",
			"presented.directoryOpening": "Öffnen des enthaltenden Ordners…",
			"presented.directoryOpened": "Angeforderte Öffnung mit Ordner",
			"presented.revealed": "Angeforderte Anzeige im Dateimanager",
			"presented.revealing": "Wird im Dateimanager angezeigt…",
			"presented.unavailable": "Auf diesem Host steht kein Desktop zum Öffnen von Dateien oder Ordnern in externen Apps zur Verfügung. Dateien können weiterhin in der Seitenleiste in der Vorschau angezeigt werden.",
			"presented.retry": "Erneut versuchen",
			"presented.hostError": "Die Host-Desktop-Informationen konnten nicht gelesen werden",
			"presented.preview": "Vorschau in der Seitenleiste",
			"presented.previewButton": "Öffnen Sie {name} in der Seitenleiste",
			"presented.previewCard": "Vorschau von {name} in der Seitenleiste",
			"presented.all": "Alle {count}-Dateien",
			"presented.expandAria": "Alle von {count} gelieferten Dateien anzeigen",
			"presented.collapse": "Einklappen",
			"presented.collapseAria": "Gelieferte Dateien ausblenden",
			"presented.opening": "Eröffnung…",
			"presented.opened": "Öffnung erbeten",
			"presented.error": "Konnte nicht geöffnet werden. Klicken Sie, um es erneut zu versuchen.",
			"presented.file": "Datei",
			"row.title": "Vorhandene Akten",
			"row.running": "Liefern",
			"row.preparing": "Vorbereiten von Liefergegenständen",
			"row.ok": "Geliefert",
			"row.error": "Die Lieferung ist fehlgeschlagen",
			"row.stopped": "Unterbrochen",
			"row.inspect": "Aufruf prüfen",
			"changes.title": "Bearbeitete {count}-Dateien",
			"changes.singleTitle": "Bearbeitet {name}",
			"changes.added": "+{count}",
			"changes.deleted": "-{count}",
			"changes.binary": "binär",
			"changes.openReview": "Überprüfen Sie die Änderungen dieser Runde in der Seitenleiste",
			"changes.all": "Alle {count}-Dateien",
			"changes.expandAria": "Alle von {count} geänderten Dateien anzeigen",
			"changes.collapse": "Einklappen",
			"changes.collapseAria": "Geänderte Dateien reduzieren",
			"changes.oversized": "zu groß",
			"changes.viewDiff": "Änderungen an {name} anzeigen",
			"review.title": "Überprüfung · Runde {turn}",
			"review.selectFile": "Wählen Sie die zu überprüfende Datei aus",
			"review.split": "Wechseln Sie zur geteilten Ansicht",
			"review.unified": "Wechseln Sie zur einheitlichen Ansicht",
			"review.splitAria": "Geteilte Ansicht",
			"review.wrap": "Zeilenumbruch aktivieren",
			"review.nowrap": "Zeilenumbruch deaktivieren",
			"review.wrapAria": "Zeilenumbruch",
			"review.openFile": "Öffnen Sie die gesamte Datei in der Seitenleiste",
			"review.openFileAria": "Öffnen Sie {name} in der Seitenleiste",
			"diff.loading": "Änderungen lesen…",
			"diff.missing": "Der Inhalt der Änderungen dieser Runde ist nicht mehr verfügbar",
			"diff.error": "Die Änderungen konnten nicht gelesen werden",
			"diff.binary": "Binärdatei; Änderungen können nicht angezeigt werden",
			"diff.oversized": "Datei zu groß; Änderungen können nicht angezeigt werden",
			"diff.created": "In dieser Runde erstellt",
			"diff.deleted": "In dieser Runde gelöscht",
			"diff.unchanged": "Beide Seiten vertreten die gleichen Linien",
			"diff.coarse": "Zeitüberschreitung beim Leitungsvergleich; wird als vollständige Dateiersetzung angezeigt",
			"diff.truncated": "Zeigt die ersten {count}-Zeilen"
		};
		/** Russian dictionary, checked against the English keys. */
		const ru = {
			"presented.nativeUnavailable": "У этого файла нет доступного пути к хосту. Предварительный просмотр на боковой панели.",
			"presented.revealError": "Не удалось отобразить в файловом менеджере. Попробуйте еще раз.",
			"presented.directoryError": "Не удалось открыть содержащую папку. Попробуйте еще раз.",
			"presented.directoryOpening": "Открытие папки, содержащей…",
			"presented.directoryOpened": "Запрошенное открытие, содержащее папку",
			"presented.revealed": "Запрошенное отображение в файловом менеджере",
			"presented.revealing": "Отображается в файловом менеджере…",
			"presented.unavailable": "У этого хоста нет рабочего стола, на котором можно было бы открывать файлы или папки во внешних приложениях. Файлы по-прежнему можно просматривать на боковой панели.",
			"presented.retry": "Повторить",
			"presented.hostError": "Не удалось прочитать информацию о рабочем столе хоста.",
			"presented.preview": "Предварительный просмотр в боковой панели",
			"presented.previewButton": "Откройте {name} на боковой панели.",
			"presented.previewCard": "Предварительный просмотр {name} на боковой панели",
			"presented.all": "Все файлы {count}",
			"presented.expandAria": "Показать все доставленные файлы {count}",
			"presented.collapse": "Свернуть",
			"presented.collapseAria": "Свернуть доставленные файлы",
			"presented.opening": "Открытие…",
			"presented.opened": "Открыть запрос",
			"presented.error": "Не удалось открыть. Нажмите, чтобы повторить попытку.",
			"presented.file": "Файл",
			"row.title": "Представление файлов",
			"row.running": "Доставка",
			"row.preparing": "Подготовка результатов",
			"row.ok": "Доставлено",
			"row.error": "Доставка не удалась",
			"row.stopped": "Прерванный",
			"row.inspect": "Проверить вызов",
			"changes.title": "Отредактированные файлы {count}.",
			"changes.singleTitle": "Отредактировано {name}",
			"changes.added": "+{count}",
			"changes.deleted": "-{count}",
			"changes.binary": "двоичный",
			"changes.openReview": "Просмотрите изменения этого хода на боковой панели.",
			"changes.all": "Все файлы {count}",
			"changes.expandAria": "Показать все измененные файлы {count}",
			"changes.collapse": "Свернуть",
			"changes.collapseAria": "Свернуть измененные файлы",
			"changes.oversized": "слишком большой",
			"changes.viewDiff": "Посмотреть изменения в {name}",
			"review.title": "Проверка · ход {turn}",
			"review.selectFile": "Выберите файл для просмотра",
			"review.split": "Переключиться на разделенный вид",
			"review.unified": "Переключиться на единый вид",
			"review.splitAria": "Разделенный вид",
			"review.wrap": "Включить перенос строк",
			"review.nowrap": "Отключить перенос строк",
			"review.wrapAria": "Перенос строки",
			"review.openFile": "Открыть весь файл на боковой панели",
			"review.openFileAria": "Откройте {name} на боковой панели.",
			"diff.loading": "Чтение изменений…",
			"diff.missing": "Содержимое изменений этого хода больше не доступно.",
			"diff.error": "Не удалось прочитать изменения",
			"diff.binary": "Бинарный файл; изменения не могут быть показаны",
			"diff.oversized": "Файл слишком большой; изменения не могут быть показаны",
			"diff.created": "Создано в этом ходу",
			"diff.deleted": "Удален на этом ходу",
			"diff.unchanged": "Обе стороны держат одни и те же линии",
			"diff.coarse": "Время сравнения строк истекло; отображается как замена всего файла",
			"diff.truncated": "Показаны первые строки {count}"
		};
		/** Portuguese dictionary, checked against the English keys. */
		const pt = {
			"presented.nativeUnavailable": "Este arquivo não possui caminho de host disponível. Visualize-o na barra lateral.",
			"presented.revealError": "Não foi possível mostrar no gerenciador de arquivos. Tente novamente.",
			"presented.directoryError": "Não foi possível abrir a pasta que contém. Tente novamente.",
			"presented.directoryOpening": "Abrindo a pasta que contém…",
			"presented.directoryOpened": "Abertura solicitada contendo pasta",
			"presented.revealed": "Exibição solicitada no gerenciador de arquivos",
			"presented.revealing": "Mostrando no gerenciador de arquivos…",
			"presented.unavailable": "Este Host não possui área de trabalho disponível para abrir arquivos ou pastas em aplicativos externos. Os arquivos ainda podem ser visualizados na barra lateral.",
			"presented.retry": "Tentar novamente",
			"presented.hostError": "Não foi possível ler as informações da área de trabalho do Host",
			"presented.preview": "Pré-visualização na barra lateral",
			"presented.previewButton": "Abra {name} na barra lateral",
			"presented.previewCard": "Visualizar {name} na barra lateral",
			"presented.all": "Todos os {count} arquivos",
			"presented.expandAria": "Mostrar todos os {count} arquivos entregues",
			"presented.collapse": "Recolher",
			"presented.collapseAria": "Recolher arquivos entregues",
			"presented.opening": "Abrindo…",
			"presented.opened": "Aberto solicitado",
			"presented.error": "Não foi possível abrir. Clique para tentar novamente.",
			"presented.file": "Arquivo",
			"row.title": "Apresentar arquivos",
			"row.running": "Entregando",
			"row.preparing": "Preparando resultados",
			"row.ok": "Entregue",
			"row.error": "Falha na entrega",
			"row.stopped": "Interrompido",
			"row.inspect": "Inspecionar chamada",
			"changes.title": "{count} arquivos editados",
			"changes.singleTitle": "Editado {name}",
			"changes.added": "+{count}",
			"changes.deleted": "-{count}",
			"changes.binary": "binário",
			"changes.openReview": "Revise as mudanças deste turno na barra lateral",
			"changes.all": "Todos os {count} arquivos",
			"changes.expandAria": "Mostrar todos os {count} arquivos alterados",
			"changes.collapse": "Recolher",
			"changes.collapseAria": "Recolher arquivos alterados",
			"changes.oversized": "muito grande",
			"changes.viewDiff": "Ver alterações em {name}",
			"review.title": "Revisão · turno {turn}",
			"review.selectFile": "Escolha o arquivo para revisar",
			"review.split": "Mudar para visualização dividida",
			"review.unified": "Mudar para visualização unificada",
			"review.splitAria": "Visualização dividida",
			"review.wrap": "Ativar quebra de linha",
			"review.nowrap": "Desativar quebra de linha",
			"review.wrapAria": "Quebra de linha",
			"review.openFile": "Abra o arquivo inteiro na barra lateral",
			"review.openFileAria": "Abra {name} na barra lateral",
			"diff.loading": "A leitura muda…",
			"diff.missing": "O conteúdo das alterações deste turno não está mais disponível",
			"diff.error": "Não foi possível ler as alterações",
			"diff.binary": "Arquivo binário; as alterações não podem ser mostradas",
			"diff.oversized": "Arquivo muito grande; as alterações não podem ser mostradas",
			"diff.created": "Criado neste turno",
			"diff.deleted": "Excluído neste turno",
			"diff.unchanged": "Ambos os lados mantêm as mesmas linhas",
			"diff.coarse": "A comparação de linha expirou; mostrado como uma substituição de arquivo inteiro",
			"diff.truncated": "Mostrando as primeiras {count} linhas"
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Required services for the tail-slot and tab-type registrations and their dictionaries. */
		const inject = [
			"slots",
			"locale",
			"uiConversation",
			"remote",
			"remote.session",
			"sidebarRightTabs",
			"sidebarRight",
			"configForms"
		];
		/**
		* Client plugin body: register the dictionaries, the turn-tail entry, and the comparison tab type.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			const opener = new PresentedOpenController();
			const summaries = new ChangesSummaryStore();
			const diffs = new ChangesDiffStore();
			ctx.effect(() => () => Promise.all([
				opener.dispose(),
				summaries.dispose(),
				diffs.dispose()
			]));
			ctx.on("connection/reset", () => {
				opener.resetHost();
				summaries.reset();
				diffs.reset();
			});
			ctx.uiConversation.events.register(deliverablesDefinition);
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}), "ui-deliverables: dictionaries");
			ctx.slots.inject("conversation.chat.turnTail", () => ctx.slots.register({
				name: "conversation.chat.turnTail",
				id: "@deepseek-ai/dsh-client-ui-deliverables",
				locale: NS,
				children: { "deliverables.file.actions": {
					kind: "list",
					scope: "session"
				} },
				inject: () => ({
					hooks: {
						changesDiff: diffs.state,
						presentedOpen: opener.state,
						presentedHost: opener.host,
						changesSummary: summaries.state,
						showCodeDiff: ctx.configForms.developerTools.enabled
					},
					loadChangesDiff: (sessionId, seq, index) => diffs.load(sessionId, seq, index),
					reloadPresentedHost: () => opener.loadHost(),
					loadChangesSummary: (sessionId, seq) => summaries.load(sessionId, seq),
					openPresented: (sessionId, seq, index, action, application) => opener.open(sessionId, seq, index, action, application),
					openChanged: (sessionId, seq, index, action, application) => opener.openChanged(sessionId, seq, index, action, application),
					openChangesReview: (coordinates, index) => {
						ctx.sidebarRight.openResource(changesReviewAddress(coordinates), { params: { index } });
					}
				})
			}, DeliverablesTail));
			ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({
				name: "tool.call.toolview",
				key: "present",
				locale: NS
			}, PresentRow));
			const t = ctx.locale.bind(NS);
			ctx.effect(() => ctx.sidebarRightTabs.register(changesReviewDefinition(t)), "ui-deliverables: changes-review type");
			ctx.effect(() => ctx.slots.inject("sidebar.right.pane.tab", () => ctx.slots.register({
				name: "sidebar.right.pane.tab",
				key: CHANGES_REVIEW_ID,
				locale: NS,
				store: createReviewStore(),
				children: { "deliverables.review.file.actions": {
					kind: "list",
					scope: "session"
				} },
				inject: () => ({
					hooks: {
						changesSummary: summaries.state,
						changesDiff: diffs.state,
						presentedOpen: opener.state,
						presentedHost: opener.host
					},
					loadChangesSummary: (sessionId, seq) => summaries.load(sessionId, seq),
					loadChangesDiff: (sessionId, seq, index) => diffs.load(sessionId, seq, index),
					reloadPresentedHost: () => opener.loadHost(),
					openChanged: (sessionId, seq, index, action, application) => opener.openChanged(sessionId, seq, index, action, application)
				})
			}, ReviewTab)), "ui-deliverables: changes-review body");
			ctx.provide("chatFileMentions", { forClosing(owner) {
				const paths = selectProducedFiles(owner);
				const presented = presentedForClosing(owner);
				if (paths === null && presented.length === 0) return void 0;
				return producedFileMentions([...new Set([...paths ?? [], ...presented.map((file) => file.path)])], owner.openFile, (path) => t("presented.previewButton", { name: path }), owner.turn.data.get("deliverables")?.produced);
			} });
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
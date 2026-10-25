window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-open-in-app",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		let react_jsx_runtime = require("react/jsx-runtime");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		/** Browser-relative form of {@link OPEN_IN_APP_APPS_PATH}. */
		const OPEN_IN_APP_APPS_ROUTE = "/open-in-app/apps".slice(1);
		/** Browser-relative form of {@link OPEN_IN_APP_ICON_PREFIX_PATH}. */
		const OPEN_IN_APP_ICON_PREFIX_ROUTE = "/open-in-app/icon".slice(1);
		/** Browser-relative form of {@link OPEN_IN_APP_OPEN_PATH}. */
		const OPEN_IN_APP_OPEN_ROUTE = "/open-in-app/open".slice(1);
		//#endregion
		//#region lib/types/client/applications.js
		/** Label keys for applications supported by this client. */
		const APP_LABEL_KEY = {
			finder: "app.finder",
			explorer: "app.explorer",
			filemanager: "app.filemanager",
			cursor: "app.cursor",
			vscode: "app.vscode",
			vscodeinsiders: "app.vscodeinsiders",
			windsurf: "app.windsurf",
			zed: "app.zed",
			sublimetext: "app.sublimetext",
			xcode: "app.xcode",
			androidstudio: "app.androidstudio",
			intellij: "app.intellij",
			pycharm: "app.pycharm",
			webstorm: "app.webstorm",
			phpstorm: "app.phpstorm",
			goland: "app.goland",
			rider: "app.rider",
			rustrover: "app.rustrover",
			fork: "app.fork",
			sourcetree: "app.sourcetree",
			github: "app.github",
			tower: "app.tower",
			gitkraken: "app.gitkraken",
			smartgit: "app.smartgit",
			sublimemerge: "app.sublimemerge",
			ghostty: "app.ghostty",
			warp: "app.warp",
			iterm: "app.iterm",
			kitty: "app.kitty",
			terminal: "app.terminal",
			windowsterminal: "app.windowsterminal",
			gitbash: "app.gitbash",
			gnometerminal: "app.gnometerminal",
			konsole: "app.konsole"
		};
		//#endregion
		//#region lib/types/client/controller.js
		/** Browser availability/choice state and the launch carrier for the split button. */
		/**
		* Owns the once-per-page availability read, the persisted last choice, and
		* the launch POST. Availability and choice publish through uSES-safe sources
		* so every Session header shares one truth.
		*/
		var OpenInAppController = class {
			fetcher;
			/** Installed app ids in host menu order; null until the host answered. */
			apps = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(null);
			/** Last chosen app id, or empty before the first choice, shared across sessions and browser restarts. */
			choice = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)("", { persist: { name: "dsh.open-in-app.choice" } });
			/** Current launch, shared by pointer and keyboard gestures. */
			operation = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({
				phase: "idle",
				path: null
			});
			/**
			* Resolve the remembered nameable installed application, with the button's first-app fallback.
			* @returns the installed app id, or undefined while unavailable.
			*/
			currentApp() {
				const apps = (this.apps.getSnapshot() ?? []).filter((id) => APP_LABEL_KEY[id] !== void 0);
				const choice = this.choice.getSnapshot();
				return apps.includes(choice) ? choice : apps[0];
			}
			loading;
			/**
			* @param fetcher - HTTP carrier for the apps read and the launch POST.
			*/
			constructor(fetcher = (input, init) => fetch(input, init)) {
				this.fetcher = fetcher;
			}
			/**
			* Read availability once per controller life; concurrent calls share the read.
			* A failed read publishes an empty list, which renders no button at all.
			* @returns after availability is published.
			*/
			load() {
				this.loading ??= this.run();
				return this.loading;
			}
			/**
			* Remember one picked app id.
			* @param appId - catalog id from the availability list.
			*/
			choose(appId) {
				if (this.operation.getSnapshot().phase !== "busy") this.choice.set(appId);
			}
			/**
			* Launch one installed app on a workspace directory.
			* @param appId - catalog id from the availability list.
			* @param path - the session's absolute workspace directory.
			* Concurrent gestures are ignored until the current Host request settles.
			* @returns after the host acknowledged the launch; rejects on any failure.
			*/
			async launch(appId, path) {
				if (this.operation.getSnapshot().phase === "busy") return;
				this.operation.set({
					phase: "busy",
					path
				});
				const body = {
					app: appId,
					path
				};
				try {
					const response = await this.fetcher(OPEN_IN_APP_OPEN_ROUTE, {
						method: "POST",
						headers: { "content-type": "application/json" },
						body: JSON.stringify(body)
					});
					if (!response.ok) throw new Error(`open failed: HTTP ${String(response.status)}`);
					this.operation.set({
						phase: "idle",
						path
					});
				} catch (error) {
					this.operation.set({
						phase: "error",
						path
					});
					throw error;
				}
			}
			async run() {
				let apps = [];
				try {
					const response = await this.fetcher(OPEN_IN_APP_APPS_ROUTE, { headers: { accept: "application/json" } });
					if (response.ok) {
						const payload = await response.json();
						if (Array.isArray(payload.apps)) apps = payload.apps.filter((id) => typeof id === "string");
					}
				} catch {}
				this.apps.set(apps);
			}
		};
		//#endregion
		//#region lib/types/client/open-failure-toast.js
		/** Per-control failure banner for path gestures. */
		/**
		* Transient failure banner owned by the control that initiated the gesture,
		* so one failed request announces once, from the control the user pressed.
		* @returns `toast` owned by the control and `show` to announce one
		* failure with resolved copy; announcing again replays the banner.
		*/
		function useOpenFailureToast() {
			const seq = (0, react.useRef)(0);
			const [banner, setBanner] = (0, react.useState)(null);
			const dismiss = (0, react.useCallback)(() => {
				setBanner(null);
			}, []);
			return {
				toast: banner === null ? null : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
					text: banner.text,
					icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, {}),
					onDone: dismiss
				}, banner.seq),
				show: (text) => {
					seq.current += 1;
					setBanner({
						seq: seq.current,
						text
					});
				}
			};
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-open-in-app/src/client/OpenTargetButton.module.css.mjs
		const css = ".tvmsBq_menuAnchor{flex:none;align-self:center;display:inline-flex}.tvmsBq_split{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-sm);height:24px;font-family:var(--dsw-font-family);align-items:stretch;display:inline-flex;overflow:hidden}.tvmsBq_main,.tvmsBq_chevron{color:var(--dsw-alias-label-primary);white-space:nowrap;cursor:pointer;background:0 0;border:0;justify-content:center;align-items:center;font-size:11px;line-height:16px;display:inline-flex}.tvmsBq_main{gap:4px;padding:3px 5px}.tvmsBq_chevron{border-left:.5px solid var(--dsw-alias-border-l4);color:var(--dsw-alias-label-secondary);padding:3px 4px 3px 3px}.tvmsBq_main:focus-visible,.tvmsBq_chevron:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}@media (hover:hover){.tvmsBq_main:hover:not(:disabled),.tvmsBq_chevron:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}}.tvmsBq_main:disabled,.tvmsBq_chevron:disabled{cursor:default}.tvmsBq_appIcon{object-fit:contain}.tvmsBq_split[data-size=large]{border-radius:var(--dsw-radius-md);border-color:var(--dsw-alias-border-l2);height:36px}.tvmsBq_split[data-size=large] .tvmsBq_main{gap:6px;padding:6px 14px;font-size:14px}.tvmsBq_split[data-size=large] .tvmsBq_chevron{padding:6px 10px}.tvmsBq_skeleton{border-radius:var(--dsw-radius-xs);background:var(--dsw-alias-interactive-bg-hover);flex:none;display:inline-block}";
		const tagId = "@deepseek-ai/dsh-client-ui-open-in-app/OpenTargetButton.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-open-in-app";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var OpenTargetButton_module_css_default = {
			"appIcon": "tvmsBq_appIcon",
			"chevron": "tvmsBq_chevron",
			"main": "tvmsBq_main",
			"menuAnchor": "tvmsBq_menuAnchor",
			"skeleton": "tvmsBq_skeleton",
			"split": "tvmsBq_split"
		};
		//#endregion
		//#region lib/types/client/OpenTargetButton.js
		/** Shared file and directory opener: one default action, application menu, and per-gesture feedback. */
		/**
		* Serialize gestures and announce their failures through the initiating control's toast.
		* @param execute - target adapter that returns the failure to announce, or null.
		* @param t - localized control copy.
		* @returns the pending state, feedback, and guarded action callback.
		*/
		function useOpenTargetGesture(execute, t) {
			const [pending, setPending] = (0, react.useState)(false);
			const inFlight = (0, react.useRef)(false);
			const { toast, show } = useOpenFailureToast();
			return {
				pending,
				toast,
				act: (operation) => {
					if (inFlight.current) return;
					inFlight.current = true;
					setPending(true);
					execute(operation).then((failure) => {
						if (failure !== null) show(t(`path.${failure}`));
					}).finally(() => {
						inFlight.current = false;
						setPending(false);
					});
				}
			};
		}
		/** One application image with a per-image fallback, shared by main and menu buttons. */
		function ApplicationIcon({ source, size = 14 }) {
			const [failed, setFailed] = (0, react.useState)(false);
			return source === null || failed ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRightUpOutlineRegular, { size }) : (0, react_jsx_runtime.jsx)("img", {
				src: source,
				width: size,
				height: size,
				className: OpenTargetButton_module_css_default.appIcon,
				alt: "",
				draggable: false,
				onError: () => {
					setFailed(true);
				}
			});
		}
		/**
		* Render identical split buttons for files and directories. File reveal always
		* stays last; it is the default only when no application is registered.
		* @param props - target applications, default selection, and operations.
		* @returns the control and its transient failure feedback.
		*/
		function OpenTargetButton(props) {
			const { applications, defaultId, kind, t } = props;
			const [menuOpen, setMenuOpen] = (0, react.useState)(false);
			const { pending, toast, act } = useOpenTargetGesture(props.execute, t);
			const preferred = kind === "file" ? applications.find((app) => app.id === defaultId) ?? applications[0] : applications.find((app) => app.id === defaultId);
			const disabled = pending || props.busy === true || props.loading === true;
			const hasMenu = props.loading === true || props.failed || applications.length + (kind === "file" ? 1 : 0) > 1;
			const revealDefault = kind === "file" && preferred === void 0 && props.loading !== true;
			const primaryLabel = preferred === void 0 ? t("path.reveal") : t("open.title", { app: preferred.name });
			const run = (operation) => {
				setMenuOpen(false);
				act(operation);
			};
			const primary = () => {
				if (revealDefault) {
					run({ kind: "reveal" });
					return;
				}
				if (preferred !== void 0 && preferred.id !== defaultId) {
					run({
						kind: "application",
						id: preferred.id
					});
					return;
				}
				run({ kind: "default" });
			};
			const icon = props.loading === true && preferred === void 0 ? (0, react_jsx_runtime.jsx)("span", {
				className: OpenTargetButton_module_css_default.skeleton,
				"data-open-target-skeleton": true,
				"aria-hidden": "true",
				style: {
					width: props.prominent ? 18 : 13,
					height: props.prominent ? 18 : 13
				}
			}) : revealDefault ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderOpenOutlineRegular, { size: props.prominent ? 18 : 13 }) : (0, react_jsx_runtime.jsx)(ApplicationIcon, {
				source: preferred?.icon ?? null,
				size: props.prominent ? 18 : 13
			}, preferred?.icon);
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
				className: OpenTargetButton_module_css_default.menuAnchor,
				open: menuOpen && !disabled && hasMenu,
				autoFocus: true,
				portal: true,
				dense: true,
				align: "end",
				onClose: () => {
					setMenuOpen(false);
				},
				items: [...applications.map((app) => ({
					id: `app:${app.id}`,
					icon: (0, react_jsx_runtime.jsx)(ApplicationIcon, { source: app.icon }, app.icon),
					label: app.id === preferred?.id ? t("path.appDefault", { app: app.name }) : app.name
				})), ...props.failed ? [{
					id: "unavailable",
					label: t("path.appsError"),
					disabled: true
				}] : []],
				footer: kind === "file" ? [{
					id: "reveal",
					icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderOpenOutlineRegular, {}),
					label: revealDefault ? t("path.appDefault", { app: t("path.reveal") }) : t("path.reveal")
				}] : [],
				onSelect: (id) => {
					run(id === "reveal" ? { kind: "reveal" } : {
						kind: "application",
						id: id.slice(4)
					});
				},
				anchor: (0, react_jsx_runtime.jsxs)("div", {
					className: OpenTargetButton_module_css_default.split,
					"data-open-target": kind,
					"data-size": props.prominent ? "large" : "compact",
					"data-open-path": kind === "file" && !props.prominent ? "" : void 0,
					"data-state": disabled ? "busy" : "idle",
					children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
						portal: true,
						label: primaryLabel,
						shortcutKeys: props.shortcut?.keys,
						side: "bottom",
						delayMs: 500,
						children: (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: OpenTargetButton_module_css_default.main,
							disabled,
							"aria-label": props.prominent ? void 0 : primaryLabel,
							"aria-keyshortcuts": props.shortcut?.aria,
							"data-open-path-open": kind === "file" && !props.prominent ? "" : void 0,
							"data-open-path-unpreviewable": props.prominent ? "" : void 0,
							onClick: primary,
							children: [icon, props.prominent && (revealDefault ? t("path.reveal") : t("path.open"))]
						})
					}), hasMenu && (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: OpenTargetButton_module_css_default.chevron,
						disabled,
						"aria-haspopup": "menu",
						"aria-expanded": menuOpen && !disabled,
						"aria-label": t("path.more"),
						"data-open-path-more": kind === "file" && !props.prominent ? "" : void 0,
						onClick: () => {
							if (!menuOpen) props.refresh?.();
							setMenuOpen((value) => !value);
						},
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { size: props.prominent ? 14 : 10 })
					})]
				})
			}), toast] });
		}
		//#endregion
		//#region lib/types/client/OpenInAppAction.js
		/**
		* Adapt the installed directory catalog to the shared opening control.
		* @param props - displayed directory, installed catalog, and launch operations.
		* @returns the shared control, or null without an eligible application.
		*/
		function OpenInAppAction(props) {
			const { absolutePath, useOpenInAppApps, useOpenInAppChoice, t } = props;
			const available = useOpenInAppApps((apps) => apps);
			const choice = useOpenInAppChoice((id) => id);
			const operation = props.useOpenInAppLaunch((value) => value);
			const shortcut = props.useShortcuts((rows) => rows.find((row) => row.id === "workspace.openLocal"));
			const apps = (available ?? []).flatMap((id) => {
				const key = APP_LABEL_KEY[id];
				return key === void 0 ? [] : [{
					id,
					name: t(key),
					icon: props.iconUrl(id)
				}];
			});
			const preferred = apps.find((app) => app.id === choice) ?? apps[0];
			if (preferred === void 0) return null;
			return (0, react_jsx_runtime.jsx)(OpenTargetButton, {
				kind: "directory",
				applications: apps,
				defaultId: preferred.id,
				failed: false,
				t,
				busy: operation.phase === "busy",
				shortcut,
				execute: async (operation) => {
					const id = operation.kind === "application" ? operation.id : preferred.id;
					try {
						await props.launch(id, absolutePath);
					} catch (_error) {
						return "openError";
					}
					if (operation.kind === "application") props.choose(id);
					return null;
				}
			}, absolutePath);
		}
		//#endregion
		//#region lib/types/client/open-path.js
		/**
		* Host desktop availability, file associations, and open/reveal actions over the Session Remote.
		* The desktop answer is read once per page; a failed read renders no control.
		*/
		/** Page-lifetime desktop availability and the open/reveal carrier shared by every path control. */
		var OpenInAppPathController = class {
			remote;
			/** Whether the Host desktop can open paths; null until the Host answered, false also after a failed read. */
			desktop = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(null);
			loading;
			/**
			* @param remote - the Session Remote namespace answering availability and running gestures.
			*/
			constructor(remote) {
				this.remote = remote;
			}
			/**
			* Read desktop availability once per controller life; concurrent calls share the read.
			* @returns after availability is published.
			*/
			load() {
				this.loading ??= this.run();
				return this.loading;
			}
			/**
			* Open one Host path in its default application, or reveal it in the file manager.
			* @param path - absolute path on the Host, as the file's metadata reports it.
			* @param action - default application open, or file-manager reveal.
			* @param application - registered application path for an explicit open.
			* @returns the failure kind to announce, or `null` once the Host acknowledged.
			*/
			async openPath(path, action, application) {
				const request = action === "reveal" ? {
					path,
					action
				} : {
					path,
					...application === void 0 ? {} : { application }
				};
				let ok = false;
				try {
					ok = (await this.remote.session.openWorkspacePath(request)).ok;
				} catch {}
				return ok ? null : action === "open" ? "openError" : "revealError";
			}
			/**
			* Refresh the file's OS associations; failures remain distinct from an empty handler list.
			* @param path - file path reported by the Host.
			* @param signal - lifetime of the requesting preview.
			* @returns application metadata, or null when the query fails.
			*/
			async applications(path, signal) {
				let result;
				try {
					result = await this.remote.session.workspacePathApplications({ path }, signal);
				} catch (_error) {
					return null;
				}
				return result.ok ? result.value : null;
			}
			async run() {
				let available = false;
				try {
					const result = await this.remote.session.canOpenWorkspacePath();
					available = result.ok && result.value;
				} catch {}
				this.desktop.set(available);
			}
		};
		//#endregion
		//#region lib/types/client/file-applications.js
		/** File association reads shared by mounted controls using the same reader and target. */
		const EMPTY = {
			apps: [],
			loading: true,
			failed: false
		};
		const readers = /* @__PURE__ */ new WeakMap();
		/** Each mounted consumer retains the query; the last release cancels and discards it. */
		function subscribe(query, target, listener) {
			let targets = readers.get(query);
			if (targets === void 0) {
				targets = /* @__PURE__ */ new Map();
				readers.set(query, targets);
			}
			let entry = targets.get(target);
			const initial = entry === void 0;
			if (entry === void 0) {
				const created = {
					state: (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(EMPTY),
					users: 0,
					controller: null,
					refresh: () => {
						created.controller?.abort();
						const controller = new AbortController();
						created.controller = controller;
						query(target, controller.signal).then((apps) => {
							if (!controller.signal.aborted) created.state.set({
								apps: apps ?? [],
								loading: false,
								failed: apps === null
							});
						});
					}
				};
				entry = created;
				targets.set(target, entry);
			}
			const retained = entry;
			retained.users += 1;
			const release = retained.state.subscribe(listener);
			if (initial) retained.refresh();
			return () => {
				release();
				retained.users -= 1;
				if (retained.users === 0) {
					retained.controller?.abort();
					targets.delete(target);
				}
			};
		}
		/**
		* Share associations and refreshes across mounted controls for the same file and reader.
		* @param target - path or authenticated route identifying the current file.
		* @param query - stable reader scoped to the serving Host; failures resolve to null.
		* @param enabled - whether a native desktop is available.
		* @returns metadata, initial loading state, failure state, and a shared refresh callback.
		*/
		function useFileApplications(target, query, enabled) {
			const retain = (0, react.useCallback)((listener) => enabled ? subscribe(query, target, listener) : () => {}, [
				enabled,
				query,
				target
			]);
			const snapshot = (0, react.useCallback)(() => enabled ? readers.get(query)?.get(target)?.state.getSnapshot() ?? EMPTY : EMPTY, [
				enabled,
				query,
				target
			]);
			const state = (0, react.useSyncExternalStore)(retain, snapshot, snapshot);
			const refresh = (0, react.useCallback)(() => {
				readers.get(query)?.get(target)?.refresh();
			}, [query, target]);
			return {
				...state,
				refresh
			};
		}
		//#endregion
		//#region lib/types/client/OpenPathAction.js
		/** File association adapter for the shared file/directory opening control. */
		/**
		* Resolve file associations and adapt operations without embedding platform behavior in the control.
		* @param props - verified file path, desktop query, native operations, and display variant.
		* @returns the shared opening control, or null without a desktop.
		*/
		function FileOpenTarget(props) {
			const desktop = props.useOpenInAppDesktop((value) => value);
			const association = useFileApplications(props.absolutePath, props.applications, desktop === true);
			(0, react.useEffect)(() => {
				if (desktop === null) props.loadDesktop();
			}, [desktop, props.loadDesktop]);
			if (desktop !== true) return null;
			const { apps } = association;
			return (0, react_jsx_runtime.jsx)(OpenTargetButton, {
				kind: "file",
				applications: apps,
				defaultId: apps.find((app) => app.default)?.id,
				loading: association.loading,
				failed: association.failed,
				prominent: props.empty === true,
				t: props.t,
				refresh: association.refresh,
				execute: (operation) => props.openPath(props.absolutePath, operation.kind === "reveal" ? "reveal" : "open", operation.kind === "application" ? operation.id : void 0)
			}, props.absolutePath);
		}
		/**
		* Render the file adapter in the document header.
		* @param props - document owner inputs and injected opening capabilities.
		* @returns the shared split button.
		*/
		function OpenPathAction(props) {
			return (0, react_jsx_runtime.jsx)(FileOpenTarget, { ...props });
		}
		//#endregion
		//#region ../../util/native-command/src/types.ts
		/**
		* Validate file association metadata received from a native process or authenticated Host.
		* @param value - decoded application list.
		* @returns validated application metadata.
		* @throws Error for malformed entries or unsupported icon URLs.
		*/
		function parseNativeFileApplications(value) {
			if (!Array.isArray(value)) throw new Error("Invalid native application list");
			const applications = [];
			const entries = value;
			for (const entry of entries) {
				if (typeof entry !== "object" || entry === null || !("id" in entry) || !("name" in entry) || !("default" in entry) || !("icon" in entry) || typeof entry.id !== "string" || entry.id.length === 0 || typeof entry.name !== "string" || typeof entry.default !== "boolean" || !(entry.icon === null || typeof entry.icon === "string" && /^data:image\/(?:png|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(entry.icon))) throw new Error("Invalid native application entry");
				applications.push({
					id: entry.id,
					name: entry.name,
					default: entry.default,
					icon: entry.icon
				});
			}
			return applications;
		}
		//#endregion
		//#region lib/types/client/FileRouteAction.js
		async function queryRoute(url, signal) {
			try {
				const response = await fetch(url, { signal });
				if (!response.ok) return null;
				return parseNativeFileApplications(await response.json());
			} catch (_error) {
				return null;
			}
		}
		/**
		* Render file actions without bypassing the owning Session's authorization route.
		* @param props - authenticated route, desktop availability, and native gesture callback.
		* @returns the shared compact control, or null without a desktop.
		*/
		function FileRouteAction(props) {
			const association = useFileApplications(props.actionUrl, queryRoute, props.available);
			if (!props.available) return null;
			return (0, react_jsx_runtime.jsx)(OpenTargetButton, {
				kind: "file",
				applications: association.apps,
				defaultId: association.apps.find((app) => app.default)?.id,
				failed: association.failed,
				loading: association.loading,
				busy: props.pending,
				refresh: association.refresh,
				t: props.t,
				execute: async (operation) => {
					return props.onAction(operation.kind === "reveal" ? "reveal" : "open", operation.kind === "application" ? operation.id : void 0);
				}
			}, props.actionUrl);
		}
		//#endregion
		//#region lib/types/client/OpenPathEmptyAction.js
		/**
		* Render the shared file opening menu with a larger labeled main button.
		* @param props - unpreviewable file and injected opening capabilities.
		* @returns the shared file opening action.
		*/
		function OpenPathEmptyAction(props) {
			return (0, react_jsx_runtime.jsx)(FileOpenTarget, {
				...props,
				empty: true
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** `open-in-app` namespace dictionaries: the workspace split button and the document-preview path controls. */
		/** Dictionary namespace owned by this plugin. */
		const NS = "open-in-app";
		/** Application labels shared verbatim by both dictionaries (product names). */
		const PRODUCT_NAMES = {
			"app.cursor": "Cursor",
			"app.vscode": "VS Code",
			"app.vscodeinsiders": "VS Code Insiders",
			"app.windsurf": "Windsurf",
			"app.zed": "Zed",
			"app.sublimetext": "Sublime Text",
			"app.xcode": "Xcode",
			"app.androidstudio": "Android Studio",
			"app.intellij": "IntelliJ IDEA",
			"app.pycharm": "PyCharm",
			"app.webstorm": "WebStorm",
			"app.phpstorm": "PhpStorm",
			"app.goland": "GoLand",
			"app.rider": "Rider",
			"app.rustrover": "RustRover",
			"app.fork": "Fork",
			"app.sourcetree": "Sourcetree",
			"app.github": "GitHub Desktop",
			"app.tower": "Tower",
			"app.gitkraken": "GitKraken",
			"app.smartgit": "SmartGit",
			"app.sublimemerge": "Sublime Merge",
			"app.ghostty": "Ghostty",
			"app.warp": "Warp",
			"app.iterm": "iTerm2",
			"app.kitty": "kitty",
			"app.windowsterminal": "Windows Terminal",
			"app.gitbash": "Git Bash",
			"app.gnometerminal": "GNOME Terminal",
			"app.konsole": "Konsole"
		};
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"open.title": "用 {app} 打开",
			"path.appDefault": "{app}（默认）",
			"path.appsError": "无法获取应用列表",
			"shortcut.busy": "正在打开工作区",
			"shortcut.unavailable": "当前工作区或本地应用不可用",
			"open.tooltip": "在本地打开",
			"path.open": "打开",
			"path.more": "更多打开方式",
			"path.reveal": "显示文件位置",
			"path.openError": "打开失败，请重试",
			"path.revealError": "无法显示文件位置，请重试",
			...PRODUCT_NAMES,
			"app.finder": "访达",
			"app.explorer": "文件资源管理器",
			"app.filemanager": "文件管理器",
			"app.terminal": "终端"
		};
		/** English dictionary, key-identical to the Chinese source of truth. */
		const en = {
			"open.title": "Open in {app}",
			"path.appDefault": "{app} (default)",
			"path.appsError": "Could not load applications",
			"shortcut.busy": "Opening workspace",
			"shortcut.unavailable": "Current workspace or local application unavailable",
			"open.tooltip": "Open locally",
			"path.open": "Open",
			"path.more": "More ways to open",
			"path.reveal": "Show file location",
			"path.openError": "Could not open. Try again.",
			"path.revealError": "Could not show the file location. Try again.",
			...PRODUCT_NAMES,
			"app.finder": "Finder",
			"app.explorer": "File Explorer",
			"app.filemanager": "Files",
			"app.terminal": "Terminal"
		};
		/** Japanese copy, checked against the English keys. */
		const ja = {
			...PRODUCT_NAMES,
			"open.title": "{app}で開く",
			"path.appDefault": "{app}（デフォルト）",
			"path.appsError": "アプリケーションを読み込めませんでした",
			"shortcut.busy": "ワークスペースを開いています",
			"shortcut.unavailable": "現在のワークスペースまたはローカルアプリケーションを利用できません",
			"open.tooltip": "ローカルで開く",
			"path.open": "開く",
			"path.more": "その他の開き方",
			"path.reveal": "ファイルの場所を表示",
			"path.openError": "開けませんでした。もう一度お試しください。",
			"path.revealError": "ファイルの場所を表示できませんでした。もう一度お試しください。",
			"app.finder": "Finder",
			"app.explorer": "エクスプローラー",
			"app.filemanager": "ファイル",
			"app.terminal": "ターミナル"
		};
		/** Spanish dictionary, checked against the English keys. */
		const es = {
			"open.title": "Abrir en {app}",
			"path.appDefault": "{app} (predeterminado)",
			"path.appsError": "No se pudieron cargar aplicaciones",
			"shortcut.busy": "Abrir espacio de trabajo",
			"shortcut.unavailable": "El espacio de trabajo actual o la aplicación local no están disponibles",
			"open.tooltip": "Abierto localmente",
			"path.open": "Abrir",
			"path.more": "Más formas de abrir",
			"path.reveal": "Mostrar ubicación del archivo",
			"path.openError": "No se pudo abrir. Intentar otra vez.",
			"path.revealError": "No se pudo mostrar la ubicación del archivo. Intentar otra vez.",
			...PRODUCT_NAMES,
			"app.finder": "Finder",
			"app.explorer": "Explorador de archivos",
			"app.filemanager": "Archivos",
			"app.terminal": "terminales"
		};
		/** French dictionary, checked against the English keys. */
		const fr = {
			"open.title": "Ouvrir dans {app}",
			"path.appDefault": "{app} (par défaut)",
			"path.appsError": "Impossible de charger les applications",
			"shortcut.busy": "Ouverture de l'espace de travail",
			"shortcut.unavailable": "Espace de travail actuel ou application locale indisponible",
			"open.tooltip": "Ouvrir localement",
			"path.open": "Ouvrir",
			"path.more": "Plus de façons d'ouvrir",
			"path.reveal": "Afficher l'emplacement du fichier",
			"path.openError": "Impossible d'ouvrir. Essayer à nouveau.",
			"path.revealError": "Impossible d'afficher l'emplacement du fichier. Essayer à nouveau.",
			...PRODUCT_NAMES,
			"app.finder": "Finder",
			"app.explorer": "Explorateur de fichiers",
			"app.filemanager": "Fichiers",
			"app.terminal": "Borne"
		};
		/** German dictionary, checked against the English keys. */
		const de = {
			"open.title": "In {app} öffnen",
			"path.appDefault": "{app} (Standard)",
			"path.appsError": "Anwendungen konnten nicht geladen werden",
			"shortcut.busy": "Arbeitsbereich öffnen",
			"shortcut.unavailable": "Aktueller Arbeitsbereich oder lokale Anwendung nicht verfügbar",
			"open.tooltip": "Vor Ort geöffnet",
			"path.open": "Öffnen",
			"path.more": "Mehr Möglichkeiten zum Öffnen",
			"path.reveal": "Dateispeicherort anzeigen",
			"path.openError": "Konnte nicht geöffnet werden. Versuchen Sie es erneut.",
			"path.revealError": "Der Dateispeicherort konnte nicht angezeigt werden. Versuchen Sie es erneut.",
			...PRODUCT_NAMES,
			"app.finder": "Finder",
			"app.explorer": "Datei-Explorer",
			"app.filemanager": "Dateien",
			"app.terminal": "Terminal"
		};
		/** Russian dictionary, checked against the English keys. */
		const ru = {
			"open.title": "Открыть в {app}",
			"path.appDefault": "{app} (по умолчанию)",
			"path.appsError": "Не удалось загрузить приложения",
			"shortcut.busy": "Открытие рабочей области",
			"shortcut.unavailable": "Текущая рабочая область или локальное приложение недоступно.",
			"open.tooltip": "Открыть локально",
			"path.open": "Открыть",
			"path.more": "Больше способов открыть",
			"path.reveal": "Показать местоположение файла",
			"path.openError": "Не удалось открыть. Попробуйте еще раз.",
			"path.revealError": "Не удалось показать местоположение файла. Попробуйте еще раз.",
			...PRODUCT_NAMES,
			"app.finder": "Finder",
			"app.explorer": "Проводник файлов",
			"app.filemanager": "Файлы",
			"app.terminal": "Терминал"
		};
		/** Portuguese dictionary, checked against the English keys. */
		const pt = {
			"open.title": "Abrir em {app}",
			"path.appDefault": "{app} (padrão)",
			"path.appsError": "Não foi possível carregar aplicativos",
			"shortcut.busy": "Abrindo espaço de trabalho",
			"shortcut.unavailable": "Espaço de trabalho atual ou aplicativo local indisponível",
			"open.tooltip": "Abrir localmente",
			"path.open": "Abrir",
			"path.more": "Mais maneiras de abrir",
			"path.reveal": "Mostrar localização do arquivo",
			"path.openError": "Não foi possível abrir. Tente novamente.",
			"path.revealError": "Não foi possível mostrar o local do arquivo. Tente novamente.",
			...PRODUCT_NAMES,
			"app.finder": "Finder",
			"app.explorer": "Explorador de arquivos",
			"app.filemanager": "Arquivos",
			"app.terminal": "Terminais"
		};
		//#endregion
		//#region lib/types/client/index.js
		/**
		* Shared native opening controls for workspace directories, document previews,
		* delivery cards, and changed-file review. Directory choices persist in the browser;
		* file defaults and application lists come from the serving Host desktop.
		*/
		/** Required services: sessions, layout selection, the slot registry, copy, Remote calls, and shortcuts. */
		const inject = [
			"sessions",
			"slots",
			"locale",
			"remote",
			"remote.session",
			"shortcuts",
			"layout"
		];
		/**
		* Client plugin body: register dictionaries, workspace directory controls, and
		* document preview path controls.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			const controller = new OpenInAppController();
			controller.load();
			const paths = new OpenInAppPathController(ctx.remote);
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}), "open-in-app: dictionaries");
			const t = ctx.locale.bind(NS);
			const target = () => {
				if (ctx.layout.panelInfo.getSnapshot().activePanelId !== null) return void 0;
				const session = Object.values(ctx.sessions.list.getSnapshot().byId).find((row) => (row.retainedBy.mainView ?? 0) > 0);
				const appId = controller.currentApp();
				return session?.cwd && appId !== void 0 ? {
					appId,
					path: session.cwd
				} : void 0;
			};
			ctx.effect(() => ctx.shortcuts.register({
				id: "workspace.openLocal",
				label: () => t("open.tooltip"),
				aliases: ["open workspace locally", "open in app"],
				defaults: {
					"desktop:macos": {
						code: "KeyO",
						modifiers: ["primary", "alt"]
					},
					"desktop:windows": {
						code: "KeyO",
						modifiers: ["primary", "alt"]
					},
					"desktop:linux": {
						code: "KeyO",
						modifiers: ["primary", "alt"]
					},
					"web:macos": {
						code: "KeyO",
						modifiers: ["primary", "shift"]
					},
					"web:windows": {
						code: "KeyO",
						modifiers: ["primary", "shift"]
					}
				},
				regions: ["page", "editable"],
				modals: [],
				resolve: () => {
					if (controller.operation.getSnapshot().phase === "busy") return {
						status: "blocked",
						reason: t("shortcut.busy")
					};
					const selected = target();
					if (selected === void 0) return {
						status: "blocked",
						reason: t("shortcut.unavailable")
					};
					return {
						status: "handled",
						run: () => {
							controller.launch(selected.appId, selected.path).catch((error) => {
								console.warn("workspace open rejected:", error);
							});
						}
					};
				}
			}), "open-in-app: workspace command");
			const directoryInjected = () => ({
				hooks: {
					openInAppApps: controller.apps,
					openInAppChoice: controller.choice,
					openInAppLaunch: controller.operation,
					shortcuts: ctx.shortcuts.catalog
				},
				launch: (appId, path) => controller.launch(appId, path),
				choose: (appId) => {
					controller.choose(appId);
				},
				iconUrl: (appId) => `${OPEN_IN_APP_ICON_PREFIX_ROUTE}/${appId}`
			});
			function SessionOpenInAppAction(props) {
				const { sessionId, useSessions } = props;
				const cwd = useSessions((state) => state.byId[sessionId]?.cwd);
				return cwd ? (0, react.createElement)(OpenInAppAction, {
					...props,
					absolutePath: cwd
				}) : null;
			}
			ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register({
				name: "conversation.session.header.utilities",
				id: "open-in-app",
				order: -10,
				locale: NS,
				inject: directoryInjected
			}, SessionOpenInAppAction));
			ctx.slots.inject("sidebar.right.tab.files.actions", () => ctx.slots.register({
				name: "sidebar.right.tab.files.actions",
				id: "open-in-app",
				locale: NS,
				inject: directoryInjected
			}, OpenInAppAction));
			const applications = (path, signal) => paths.applications(path, signal);
			const pathInjected = () => ({
				hooks: { openInAppDesktop: paths.desktop },
				loadDesktop: () => paths.load(),
				openPath: (path, action, application) => paths.openPath(path, action, application),
				applications
			});
			ctx.slots.inject("sidebar.right.tab.document.actions", () => ctx.slots.register({
				name: "sidebar.right.tab.document.actions",
				id: "open-in-app",
				locale: NS,
				inject: pathInjected
			}, OpenPathAction));
			ctx.slots.inject("sidebar.right.tab.document.unpreviewable", () => ctx.slots.register({
				name: "sidebar.right.tab.document.unpreviewable",
				id: "open-in-app",
				locale: NS,
				inject: pathInjected
			}, OpenPathEmptyAction));
			ctx.slots.inject("deliverables.file.actions", () => ctx.slots.register({
				name: "deliverables.file.actions",
				id: "open-in-app",
				locale: NS
			}, FileRouteAction));
			ctx.slots.inject("deliverables.review.file.actions", () => ctx.slots.register({
				name: "deliverables.review.file.actions",
				id: "open-in-app",
				locale: NS
			}, FileRouteAction));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
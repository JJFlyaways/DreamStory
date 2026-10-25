window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-session-log-export",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		/** Browser-relative form of {@link SESSION_LOG_EXPORT_PATH}. */
		const SESSION_LOG_EXPORT_ROUTE = "/api/session.export".slice(1);
		/** Browser-relative form of {@link SESSION_MARKDOWN_EXPORT_PATH}. */
		const SESSION_MARKDOWN_EXPORT_ROUTE = "/api/session.markdown".slice(1);
		//#endregion
		//#region lib/types/client/controller.js
		/** Browser download state shared by the Session Header button and `/export`. */
		const INITIAL$1 = { bySession: {} };
		/**
		* Collapse an untrusted Session id into the filename convention owned by the host endpoint.
		* @param sessionId - Session whose archive is downloaded.
		* @returns one safe browser download filename.
		*/
		function sessionLogZipFilename(sessionId) {
			return `dsh-session-${String(sessionId).replace(/[^A-Za-z0-9_-]/g, "_")}.zip`;
		}
		/**
		* Hand a Host download route to the browser download manager, which resolves it
		* against the document's own base.
		* @param url - document-relative Host download route.
		* @param filename - browser download filename.
		*/
		function downloadUrl(url, filename) {
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = filename;
			anchor.click();
		}
		function messageOf(error) {
			return error instanceof Error ? error.message : String(error);
		}
		/** Owns one in-flight browser download per Session and publishes modal state. */
		var SessionLogDownloadController = class {
			fetcher;
			save;
			/** uSES-safe state source shared by every Session-scoped modal contribution. */
			store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(INITIAL$1);
			active = /* @__PURE__ */ new Map();
			disposed = false;
			/**
			* @param fetcher - HTTP carrier used to read the host-streamed ZIP.
			* @param save - browser save operation.
			*/
			constructor(fetcher = (input, init) => fetch(input, init), save = downloadUrl) {
				this.fetcher = fetcher;
				this.save = save;
			}
			/**
			* Download one Session tree; concurrent gestures for the same Session share one operation.
			* @param sessionId - root Session whose ZIP includes descendants and attachments.
			* @returns after the browser save starts, an error state is published, or a late post-disposal request is ignored.
			*/
			download(sessionId) {
				const existing = this.active.get(sessionId);
				if (existing !== void 0) return existing.done;
				if (this.disposed) return Promise.resolve();
				const abort = new AbortController();
				const done = this.run(sessionId, abort.signal).finally(() => {
					this.active.delete(sessionId);
				});
				this.active.set(sessionId, {
					abort,
					done
				});
				return done;
			}
			/**
			* Close one Session's dialog without cancelling an in-flight browser download.
			* @param sessionId - Session whose modal closes.
			*/
			dismiss(sessionId) {
				const current = this.store.getSnapshot().bySession[String(sessionId)];
				if (current === void 0 || !current.open) return;
				this.publish(sessionId, {
					...current,
					open: false
				});
			}
			/**
			* Abort active fetches and reach quiescence.
			* @returns after every active operation settles.
			*/
			async dispose() {
				this.disposed = true;
				const active = [...this.active.values()];
				for (const operation of active) operation.abort.abort();
				await Promise.allSettled(active.map((operation) => operation.done));
			}
			async run(sessionId, signal) {
				this.publish(sessionId, {
					open: true,
					status: "downloading",
					error: null
				});
				try {
					const route = `${SESSION_LOG_EXPORT_ROUTE}?${new URLSearchParams({
						sessionId,
						includeDescendants: "true"
					}).toString()}`;
					const response = await this.fetcher(route, {
						method: "HEAD",
						signal
					});
					if (!response.ok) {
						const detail = await response.text().catch(() => "");
						throw new Error(`Export failed: HTTP ${response.status}${detail === "" ? "" : ` ${detail}`}`);
					}
					this.save(route, sessionLogZipFilename(sessionId));
					const open = this.store.getSnapshot().bySession[String(sessionId)]?.open ?? true;
					this.publish(sessionId, {
						open,
						status: "success",
						error: null
					});
				} catch (error) {
					if (signal.aborted) return;
					const open = this.store.getSnapshot().bySession[String(sessionId)]?.open ?? true;
					this.publish(sessionId, {
						open,
						status: "error",
						error: messageOf(error)
					});
				}
			}
			publish(sessionId, entry) {
				this.store.update((state) => {
					state.bySession = {
						...state.bySession,
						[String(sessionId)]: entry
					};
				});
			}
		};
		//#endregion
		//#region lib/types/client/copy-controller.js
		/**
		* Browser controller for the Session Header's "Copy Session as Markdown" action. One
		* plugin instance owns one pending copy: the clipboard is a browser-wide
		* destination, so a second request joins the pending operation instead of
		* racing it.
		*
		* On hosts with `ClipboardItem` and `navigator.clipboard.write`, the controller
		* starts that write synchronously from the click with a promised text Blob, so
		* the browser keeps the user activation while the Host prepares the
		* transcript. Other hosts fall back to `writeClipboard` after preparation. A
		* disposal aborts the read and prevents later text from reaching the Blob, but
		* an accepted operating-system clipboard write cannot be rolled back.
		* @module
		*/
		const INITIAL = {
			copying: false,
			notice: null
		};
		const browserClipboard = {
			supportsDeferredWrite() {
				const clipboard = Reflect.get(navigator, "clipboard");
				return typeof globalThis.ClipboardItem === "function" && typeof clipboard === "object" && clipboard !== null && typeof Reflect.get(clipboard, "write") === "function";
			},
			writeDeferred(data) {
				return navigator.clipboard.write([new ClipboardItem({ "text/plain": data })]);
			},
			writeText: _deepseek_ai_dsh_client_ui_primitives.writeClipboard
		};
		function startWrite(start) {
			try {
				return start();
			} catch (error) {
				return Promise.reject(new Error("clipboard write could not start", { cause: error }));
			}
		}
		/** Owns the one pending Markdown copy for this plugin instance. */
		var SessionMarkdownCopyController = class {
			fetcher;
			clipboard;
			/** uSES-safe state source shared by every Header row and the overlay toast. */
			store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(INITIAL);
			pending;
			disposed = false;
			noticeSeq = 0;
			constructor(fetcher = (input, init) => fetch(input, init), clipboard = browserClipboard) {
				this.fetcher = fetcher;
				this.clipboard = clipboard;
			}
			/**
			* Copy one Session's complete transcript. A request received while a copy is
			* pending joins that operation and keeps its originally captured Session.
			* @param sessionId - Session captured by the click.
			* @returns after the clipboard work settles, a failure notice is published, or a late post-disposal request is ignored.
			*/
			copy(sessionId) {
				if (this.disposed) return Promise.resolve();
				if (this.pending !== void 0) return this.pending.done;
				const abort = new AbortController();
				const done = this.run(sessionId, abort.signal).finally(() => {
					this.pending = void 0;
				});
				this.pending = {
					abort,
					done
				};
				return done;
			}
			/** Clear the shown toast without affecting a pending copy. */
			dismiss() {
				if (this.store.getSnapshot().notice === null) return;
				this.store.update((state) => {
					state.notice = null;
				});
			}
			/**
			* Abort a pending read, suppress a late clipboard write or notice, and reach
			* quiescence. A write already accepted by the operating system cannot be
			* undone.
			* @returns after the pending operation and any admitted clipboard work settle.
			*/
			async dispose() {
				this.disposed = true;
				const pending = this.pending;
				pending?.abort.abort();
				await pending?.done;
				this.store.set(INITIAL);
			}
			run(sessionId, signal) {
				this.store.update((state) => {
					state.copying = true;
				});
				const preparation = this.prepare(sessionId, signal);
				if (this.clipboard.supportsDeferredWrite()) {
					const data = preparation.then((markdown) => {
						if (this.isCancelled() || signal.aborted) throw new Error("Session Markdown copy cancelled");
						return new Blob([markdown], { type: "text/plain" });
					});
					const write = startWrite(() => this.clipboard.writeDeferred(data));
					return this.settleDeferred(preparation, data, write);
				}
				return this.settleFallback(preparation);
			}
			async prepare(sessionId, signal) {
				const route = `${SESSION_MARKDOWN_EXPORT_ROUTE}?${new URLSearchParams({ sessionId }).toString()}`;
				const response = await this.fetcher(route, { signal });
				if (!response.ok) throw new Error(`Session Markdown request failed: HTTP ${String(response.status)}`);
				return response.text();
			}
			async settleDeferred(preparation, data, write) {
				try {
					const [prepared, blob, written] = await Promise.allSettled([
						preparation,
						data,
						write
					]);
					if (this.isCancelled()) return;
					if (prepared.status === "rejected" || blob.status === "rejected") {
						this.publishNotice("preparationFailed");
						return;
					}
					if (written.status === "rejected") {
						this.publishNotice("clipboardFailed");
						return;
					}
					this.publishNotice("success");
				} finally {
					this.store.update((state) => {
						state.copying = false;
					});
				}
			}
			async settleFallback(preparation) {
				try {
					let markdown;
					try {
						markdown = await preparation;
					} catch {
						if (!this.isCancelled()) this.publishNotice("preparationFailed");
						return;
					}
					if (this.isCancelled()) return;
					let accepted = false;
					try {
						accepted = await this.clipboard.writeText(markdown);
					} catch {
						accepted = false;
					}
					if (this.isCancelled()) return;
					this.publishNotice(accepted ? "success" : "clipboardFailed");
				} finally {
					this.store.update((state) => {
						state.copying = false;
					});
				}
			}
			isCancelled() {
				return this.disposed;
			}
			publishNotice(kind) {
				this.store.update((state) => {
					state.notice = {
						kind,
						seq: ++this.noticeSeq
					};
				});
			}
		};
		//#endregion
		//#region lib/types/client/CopyToast.js
		/**
		* Show the settled copy outcome outside the Session Header and menu lifetime.
		* @param props - copy notice hook, dismissal action, and localized copy.
		* @returns the success or failure toast, or null while no notice shows.
		*/
		function SessionMarkdownCopyToast({ useSessionMarkdownCopy, dismiss, t }) {
			const notice = useSessionMarkdownCopy((state) => state.notice);
			if (notice === null) return null;
			return notice.kind === "success" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
				text: t("toast.copied"),
				tone: "success",
				onDone: dismiss
			}, notice.seq) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
				text: t(notice.kind === "preparationFailed" ? "toast.preparationFailed" : "toast.clipboardFailed"),
				icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, {}),
				onDone: dismiss
			}, notice.seq);
		}
		//#endregion
		//#region lib/types/client/Dialog.js
		/**
		* Modal shared by the Session Header download menu item and this browser's `/export` command.
		* @param props - Session runtime, bound controller state, actions, and localized copy.
		* @returns the modal portal contribution.
		*/
		function SessionLogDownloadDialog({ sessionId, useSessionLogDownload, dismiss, t }) {
			const entry = useSessionLogDownload((state) => state.bySession[String(sessionId)]);
			const status = entry?.status;
			const open = entry?.open === true;
			const error = status === "error" ? entry?.error || t("dialog.commandFailed") : null;
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open,
				onClose: () => {
					dismiss(sessionId);
				},
				title: status === "downloading" ? t("dialog.preparingTitle") : status === "success" ? t("dialog.successTitle") : t("dialog.errorTitle"),
				description: status === "downloading" ? t("dialog.preparingDescription") : status === "success" ? t("dialog.successDescription") : error ?? t("dialog.commandFailed"),
				closeLabel: t("dialog.close"),
				footer: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "primary",
					onClick: () => {
						dismiss(sessionId);
					},
					children: t("dialog.close")
				})
			});
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/session-query/session-log-export/src/client/HeaderAction.module.css.mjs
		const css = "._6fe4LG_moreButton{width:28px;color:var(--dsw-alias-label-secondary);flex:none;padding:0}._6fe4LG_moreButton svg{width:15px;height:15px}";
		const tagId = "@deepseek-ai/dsh-session-log-export/HeaderAction.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-session-log-export";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var HeaderAction_module_css_default = { "moreButton": "_6fe4LG_moreButton" };
		//#endregion
		//#region lib/types/client/HeaderAction.js
		/**
		* Render the Session Header menu with Markdown copy, download, and optional
		* feedback actions.
		* @param props - Session runtime, download and copy state, and localized copy.
		* @returns the persistent Header action and Session-scoped dialog.
		*/
		function SessionLogDownloadHeaderAction(props) {
			const { sessionId, useSessionLogDownload, useSessionMarkdownCopy, useFeedbackAvailable, request, copyMarkdown, openFeedback, t } = props;
			const feedbackAvailable = useFeedbackAvailable((value) => value);
			const entry = useSessionLogDownload((state) => state.bySession[String(sessionId)]);
			const copying = useSessionMarkdownCopy((state) => state.copying);
			const busy = entry?.status === "downloading";
			const [open, setOpen] = (0, react.useState)(false);
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
				open,
				align: "end",
				dense: true,
				onClose: () => {
					setOpen(false);
				},
				items: [
					{
						id: "copy",
						label: t("menu.copyMarkdown"),
						icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCopyOutlineRegular, {}),
						disabled: copying
					},
					{
						id: "download",
						label: t("menu.download"),
						icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDownloadOutlineRegular, {}),
						disabled: busy
					},
					...feedbackAvailable ? [{
						id: "feedback",
						label: t("menu.feedback"),
						icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPaperPlaneOutlineRegular, {})
					}] : []
				],
				onSelect: (id) => {
					setOpen(false);
					if (id === "feedback") openFeedback(sessionId);
					else if (id === "copy") copyMarkdown(sessionId);
					else request(sessionId);
				},
				anchor: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					size: "sm",
					className: HeaderAction_module_css_default.moreButton,
					"aria-label": t("header.more"),
					"aria-haspopup": "menu",
					"aria-expanded": open,
					"aria-busy": busy || copying,
					onClick: () => {
						setOpen((value) => !value);
					},
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEllipsisOutlineRegular, {})
				})
			}), (0, react_jsx_runtime.jsx)(SessionLogDownloadDialog, { ...props })] });
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** Locale namespace owned by Session export browser feedback. */
		const NS = "session-log-download";
		/** Simplified-Chinese Session export strings. */
		const zh = {
			"header.more": "更多操作",
			"menu.copyMarkdown": "复制会话为 Markdown",
			"menu.download": "下载 Session 日志",
			"menu.feedback": "反馈",
			"toast.copied": "Session 已复制为 Markdown",
			"toast.preparationFailed": "无法读取 Session 进行复制，请重试",
			"toast.clipboardFailed": "无法写入剪贴板，请检查剪贴板权限后重试",
			"dialog.preparingTitle": "正在导出 Session",
			"dialog.preparingDescription": "正在准备包含当前 Session、子 Session 和附件的 ZIP 文件。",
			"dialog.successTitle": "Session 导出已开始下载",
			"dialog.successDescription": "浏览器正在下载 Session ZIP 文件。",
			"dialog.errorTitle": "Session 导出失败",
			"dialog.close": "关闭",
			"dialog.commandFailed": "无法启动 Session 导出。"
		};
		/** English Session export strings. */
		const en = {
			"header.more": "More actions",
			"menu.copyMarkdown": "Copy Session as Markdown",
			"menu.download": "Download session log",
			"menu.feedback": "Feedback",
			"toast.copied": "Session copied as Markdown.",
			"toast.preparationFailed": "Could not read the Session for copying. Try again.",
			"toast.clipboardFailed": "Could not write to the clipboard. Check clipboard permission and try again.",
			"dialog.preparingTitle": "Exporting Session",
			"dialog.preparingDescription": "Preparing a ZIP containing this Session, its sub-Sessions, and attachments.",
			"dialog.successTitle": "Session download started",
			"dialog.successDescription": "The browser is downloading the Session ZIP.",
			"dialog.errorTitle": "Session export failed",
			"dialog.close": "Close",
			"dialog.commandFailed": "Could not start the Session export."
		};
		/** Japanese copy, checked against the English keys. */
		const ja = {
			"header.more": "その他の操作",
			"menu.copyMarkdown": "セッションを Markdown としてコピー",
			"menu.download": "セッションログをダウンロード",
			"menu.feedback": "フィードバック",
			"toast.copied": "セッションを Markdown としてコピーしました",
			"toast.preparationFailed": "コピーするセッションを読み取れませんでした。再試行してください。",
			"toast.clipboardFailed": "クリップボードに書き込めませんでした。クリップボードの権限を確認して再試行してください。",
			"dialog.preparingTitle": "セッションをエクスポート中",
			"dialog.preparingDescription": "このセッション、そのサブセッション、添付ファイルを含むZIPを準備しています。",
			"dialog.successTitle": "セッションのダウンロードを開始しました",
			"dialog.successDescription": "ブラウザがセッションZIPをダウンロードしています。",
			"dialog.errorTitle": "セッションのエクスポートに失敗しました",
			"dialog.close": "閉じる",
			"dialog.commandFailed": "セッションのエクスポートを開始できませんでした。"
		};
		/** Spanish dictionary, checked against the English keys. */
		const es = {
			"header.more": "Más acciones",
			"menu.copyMarkdown": "Copiar sesión como Markdown",
			"menu.download": "Descargar registro de sesión",
			"menu.feedback": "Comentarios",
			"toast.copied": "Sesión copiada como Markdown.",
			"toast.preparationFailed": "No se pudo leer la sesión para copiarla. Intentar otra vez.",
			"toast.clipboardFailed": "No se pudo escribir en el portapapeles. Verifique los permisos del portapapeles e inténtelo nuevamente.",
			"dialog.preparingTitle": "Sesión de exportación",
			"dialog.preparingDescription": "Preparar un ZIP que contenga esta Sesión, sus subsesiones y archivos adjuntos.",
			"dialog.successTitle": "Descarga de sesión iniciada",
			"dialog.successDescription": "El navegador está descargando el ZIP de la sesión.",
			"dialog.errorTitle": "Error al exportar la sesión",
			"dialog.close": "Cerrar",
			"dialog.commandFailed": "No se pudo iniciar la exportación de la sesión."
		};
		/** French dictionary, checked against the English keys. */
		const fr = {
			"header.more": "Autres actions",
			"menu.copyMarkdown": "Copier la session sous Markdown",
			"menu.download": "Télécharger le journal de session",
			"menu.feedback": "Commentaires",
			"toast.copied": "Session copiée sous le nom Markdown.",
			"toast.preparationFailed": "Impossible de lire la session pour la copier. Essayer à nouveau.",
			"toast.clipboardFailed": "Impossible d'écrire dans le presse-papiers. Vérifiez l'autorisation du presse-papiers et réessayez.",
			"dialog.preparingTitle": "Session d'exportation",
			"dialog.preparingDescription": "Préparation d'un ZIP contenant cette session, ses sous-sessions et les pièces jointes.",
			"dialog.successTitle": "Le téléchargement de la session a commencé",
			"dialog.successDescription": "Le navigateur télécharge le ZIP de la session.",
			"dialog.errorTitle": "Échec de l'exportation de la session",
			"dialog.close": "Fermer",
			"dialog.commandFailed": "Impossible de démarrer l'exportation de session."
		};
		/** German dictionary, checked against the English keys. */
		const de = {
			"header.more": "Weitere Aktionen",
			"menu.copyMarkdown": "Kopieren Sie die Sitzung als Markdown",
			"menu.download": "Sitzungsprotokoll herunterladen",
			"menu.feedback": "Rückmeldung",
			"toast.copied": "Sitzung als Markdown kopiert.",
			"toast.preparationFailed": "Die Sitzung zum Kopieren konnte nicht gelesen werden. Versuchen Sie es erneut.",
			"toast.clipboardFailed": "Es konnte nicht in die Zwischenablage geschrieben werden. Überprüfen Sie die Berechtigung für die Zwischenablage und versuchen Sie es erneut.",
			"dialog.preparingTitle": "Sitzung exportieren",
			"dialog.preparingDescription": "Vorbereiten einer ZIP-Datei mit dieser Sitzung, ihren Untersitzungen und Anhängen.",
			"dialog.successTitle": "Sitzungsdownload gestartet",
			"dialog.successDescription": "Der Browser lädt die Sitzungs-ZIP herunter.",
			"dialog.errorTitle": "Der Sitzungsexport ist fehlgeschlagen",
			"dialog.close": "Schließen",
			"dialog.commandFailed": "Der Sitzungsexport konnte nicht gestartet werden."
		};
		/** Russian dictionary, checked against the English keys. */
		const ru = {
			"header.more": "Другие действия",
			"menu.copyMarkdown": "Скопировать сеанс как Markdown",
			"menu.download": "Скачать журнал сеанса",
			"menu.feedback": "Обратная связь",
			"toast.copied": "Сессия скопирована как Markdown.",
			"toast.preparationFailed": "Не удалось прочитать сеанс для копирования. Попробуйте еще раз.",
			"toast.clipboardFailed": "Не удалось записать в буфер обмена. Проверьте разрешение буфера обмена и повторите попытку.",
			"dialog.preparingTitle": "Экспорт сеанса",
			"dialog.preparingDescription": "Подготовка ZIP-файла, содержащего этот сеанс, его подсеансы и вложения.",
			"dialog.successTitle": "Загрузка сеанса началась",
			"dialog.successDescription": "Браузер загружает ZIP-файл сеанса.",
			"dialog.errorTitle": "Экспорт сеанса не удался",
			"dialog.close": "Закрыть",
			"dialog.commandFailed": "Не удалось начать экспорт сеанса."
		};
		/** Portuguese dictionary, checked against the English keys. */
		const pt = {
			"header.more": "Mais ações",
			"menu.copyMarkdown": "Copiar sessão como Markdown",
			"menu.download": "Baixar registro da sessão",
			"menu.feedback": "Comentários",
			"toast.copied": "Sessão copiada como Markdown.",
			"toast.preparationFailed": "Não foi possível ler a sessão para cópia. Tente novamente.",
			"toast.clipboardFailed": "Não foi possível gravar na área de transferência. Verifique a permissão da área de transferência e tente novamente.",
			"dialog.preparingTitle": "Exportando Sessão",
			"dialog.preparingDescription": "Preparando um ZIP contendo esta Sessão, suas subsessões e anexos.",
			"dialog.successTitle": "Download da sessão iniciado",
			"dialog.successDescription": "O navegador está baixando o ZIP da sessão.",
			"dialog.errorTitle": "Falha na exportação da sessão",
			"dialog.close": "Fechar",
			"dialog.commandFailed": "Não foi possível iniciar a exportação da sessão."
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Browser plugin owning ZIP download and Markdown copy state, plus feedback controls. */
		const inject = ["slots", "locale"];
		/**
		* Provide the download controller and mount its modal, the Markdown copy
		* controller and its root toast, and both Header actions.
		* @param ctx - browser context carrying slots and locale services.
		*/
		function apply(ctx) {
			const controller = new SessionLogDownloadController();
			const copyController = new SessionMarkdownCopyController();
			ctx.provide("sessionLogDownload", controller);
			ctx.effect(() => async () => {
				await controller.dispose();
			}, "session-log-download: browser download lifecycle");
			ctx.effect(() => async () => {
				await copyController.dispose();
			}, "session-log-download: browser Markdown copy lifecycle");
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}), "session-log-download: browser dictionaries");
			const feedbackAvailable = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(false);
			ctx.inject(["feedbackUi"], (scope) => {
				scope.effect(() => {
					feedbackAvailable.set(true);
					return () => {
						feedbackAvailable.set(false);
					};
				}, "session-log-download: feedback availability");
			});
			ctx.on("command/executed", (sessionId, commandName, result) => {
				if (commandName === "export" && result.kind === "success") controller.download(sessionId);
			});
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "session-log-download.copy-toast",
				locale: NS,
				inject: () => ({
					hooks: { sessionMarkdownCopy: copyController.store },
					dismiss: () => {
						copyController.dismiss();
					}
				})
			}, SessionMarkdownCopyToast));
			ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register({
				name: "conversation.session.header.utilities",
				id: "session-log-download",
				locale: NS,
				inject: () => ({
					hooks: {
						sessionLogDownload: controller.store,
						sessionMarkdownCopy: copyController.store,
						feedbackAvailable
					},
					request: (sessionId) => controller.download(sessionId),
					copyMarkdown: (sessionId) => copyController.copy(sessionId),
					dismiss: (sessionId) => {
						controller.dismiss(sessionId);
					},
					openFeedback: (sessionId) => {
						ctx.get("feedbackUi")?.openSession(sessionId);
					}
				})
			}, SessionLogDownloadHeaderAction));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
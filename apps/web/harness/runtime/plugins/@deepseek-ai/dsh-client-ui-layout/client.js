window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-layout",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		/** Viewport width below which the sidebar auto-collapses to the rail (deepsuite
		* LG breakpoint); a manual toggle below it re-expands over the squeezed center
		* (stores.ts narrowExpanded). */
		const SIDEBAR_AUTO_COLLAPSE = 1024;
		/** Maximum normal right panel width as a fraction of the frame. */
		const RIGHTBAR_MAX_RATIO = .7;
		/** First-open right panel preference as a fraction of the frame. */
		const RIGHTBAR_DEFAULT_RATIO = .45;
		/**
		* Clamp a panel width into its contract range.
		* @param px - requested width.
		* @param min - range lower bound.
		* @param max - range upper bound.
		* @returns the clamped width.
		*/
		function clampWidth(px, min, max) {
			return Math.min(max, Math.max(min, Math.round(px)));
		}
		/**
		* Solve the three column widths for one viewport frame.
		* @param viewport - available frame width in px.
		* @param sidebar - sidebar width preference in px (0 = closed).
		* @param rightbar - requested right panel width in px (0 = no track).
		* @param collapsedWidth - track width of the closed sidebar; the default keeps
		*   the icon rail, 0 hides the column entirely (macOS desktop).
		* @returns actual widths after shrinking or removing the right track; only
		*   without that track may the center fall below its minimum, down to zero.
		*/
		function computeColumns(viewport, sidebar, rightbar, collapsedWidth = 56) {
			const s = sidebar === 0 ? collapsedWidth : clampWidth(sidebar, 264, 420);
			const available = viewport - s - 400;
			const r = rightbar === 0 || available < 300 ? 0 : Math.min(available, clampWidth(rightbar, 300, viewport * RIGHTBAR_MAX_RATIO));
			return {
				sidebar: s,
				center: Math.max(0, viewport - s - r),
				rightbar: r
			};
		}
		//#endregion
		//#region lib/types/client/DocumentTitle.js
		/** Browser title selection follows the active main panel without subscribing the frame. */
		/**
		* Project the selected durable session title into the browser title and
		* restore the build-selected product title when unmounted.
		* @param props - Selected session title projection.
		* @returns No rendered content.
		*/
		function DocumentTitle({ useSessions, usePanelInfo, productTitle }) {
			const showSessionTitle = usePanelInfo((info) => info.activePanelId === null);
			const title = useSessions((state) => {
				const current = Object.values(state.byId).find((session) => (session.retainedBy.mainView ?? 0) > 0)?.id;
				return !showSessionTitle || current === void 0 ? void 0 : state.byId[current]?.title;
			});
			(0, react.useEffect)(() => {
				document.title = title === void 0 ? productTitle : `${title} — ${productTitle}`;
				return () => {
					document.title = productTitle;
				};
			}, [productTitle, title]);
			return null;
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-layout/src/client/AppFrame.module.css.mjs
		const css = "._-vcqW_frame{background:var(--dsw-alias-bg-base);grid-template-rows:minmax(0,1fr) auto;height:100%;display:grid;position:relative;overflow:hidden}._-vcqW_frame[data-animating]{transition:grid-template-columns var(--ds-transition-duration-slow) var(--ds-ease-in-out)}._-vcqW_frame[data-dragging]{transition:none}[data-windows-titlebar] ._-vcqW_frame{--dsh-windows-content-radius:16px;box-sizing:border-box;padding-top:var(--dsh-windows-titlebar-height);background:var(--dsw-specific-sidebar-fill)}[data-windows-titlebar] ._-vcqW_centerCol{background:var(--dsw-alias-bg-base);border-radius:var(--dsh-windows-content-radius) 0 0 0;corner-shape:round}[data-windows-titlebar] ._-vcqW_frame:before{content:\"\";height:var(--dsh-windows-titlebar-height);background:var(--dsw-specific-sidebar-fill);-webkit-app-region:drag;position:absolute;inset:0 0 auto}[data-windows-titlebar] ._-vcqW_sidebarCol{border-right:none}@media (prefers-reduced-motion:reduce){._-vcqW_frame[data-animating]{transition:none}}._-vcqW_sidebarCol{background:var(--dsw-specific-sidebar-fill);border-right:.5px solid var(--dsw-alias-border-l3);min-width:0;overflow:hidden}._-vcqW_centerCol{flex-direction:column;min-width:0;display:flex;overflow:hidden}[data-platform=darwin] ._-vcqW_frame{background:0 0}html[data-platform=darwin]{--dsh-frame-top-clearance:48px}html[data-windows-titlebar]{--dsh-frame-top-clearance:var(--dsh-windows-titlebar-height);--dsh-frame-chrome-top:var(--dsh-windows-titlebar-height)}html[data-platform=darwin],html[data-windows-titlebar]{--dsh-frame-overlay-top:calc(var(--dsh-frame-top-clearance) + 20px)}html[data-platform=darwin][data-fullscreen],html[data-windows-titlebar][data-fullscreen]{--dsh-frame-overlay-top:20px;--dsh-frame-chrome-top:0px}[data-platform=darwin] ._-vcqW_sidebarCol{background:linear-gradient(to bottom, #7a9bf01a, #7a9bf000 35%, #8f89b800 68%, #8f89b817), color-mix(in srgb, color-mix(in srgb, var(--dsw-specific-sidebar-fill) 97%, #7a9bf0) 40%, transparent);border-right:none}[data-platform=darwin] [data-ds-dark-theme] ._-vcqW_sidebarCol{background:linear-gradient(to bottom, #7a9bf014, #7a9bf000 35%, #8f89b800 68%, #8f89b812), color-mix(in srgb, var(--dsw-specific-sidebar-fill) 50%, transparent)}@media (prefers-reduced-transparency:reduce){[data-platform=darwin] ._-vcqW_sidebarCol,[data-platform=darwin] [data-ds-dark-theme] ._-vcqW_sidebarCol{background:color-mix(in srgb, var(--dsw-specific-sidebar-fill) 90%, transparent)}}[data-platform=darwin] ._-vcqW_centerCol{background:var(--dsw-alias-bg-base);border-left:.5px solid var(--dsw-alias-border-l3)}[data-platform=darwin] ._-vcqW_rightbarCol{background:var(--dsw-alias-bg-base)}[data-platform=darwin] [data-sidebar-collapsed] ._-vcqW_centerCol{border-left:none}[data-platform=darwin] ._-vcqW_frame[data-sidebar-collapsed]{--dsh-frame-leading-clearance:160px}[data-platform=darwin][data-fullscreen] ._-vcqW_frame[data-sidebar-collapsed]{--dsh-frame-leading-clearance:84px}[data-platform=darwin][data-fullscreen] ._-vcqW_leadingSeat{left:12px}._-vcqW_leadingSeat{z-index:15;-webkit-app-region:no-drag;align-items:center;display:flex;position:absolute;top:11px;left:88px}._-vcqW_handle{cursor:col-resize;z-index:11;touch-action:none;grid-area:1/1/2/-1;width:8px;margin-left:-4px;position:absolute;top:0;bottom:0}._-vcqW_frame[data-animating] ._-vcqW_handle{transition:left var(--ds-transition-duration-slow) var(--ds-ease-in-out)}._-vcqW_frame[data-dragging] ._-vcqW_handle,._-vcqW_frame[data-rightbar-fullscreen],._-vcqW_frame[data-rightbar-fullscreen] ._-vcqW_handle,._-vcqW_frame[data-rightbar-instant],._-vcqW_frame[data-rightbar-instant] ._-vcqW_handle{transition:none}@media (prefers-reduced-motion:reduce){._-vcqW_frame[data-animating] ._-vcqW_handle{transition:none}}._-vcqW_rightbarCol{min-width:0;position:relative;overflow:visible}._-vcqW_bottomRow{background:var(--dsw-alias-bg-base);grid-column:1/-1;min-width:0;min-height:0;overflow:auto}._-vcqW_overlayLayer{z-index:20;pointer-events:none;position:absolute;inset:0}._-vcqW_overlayLayer>*{pointer-events:auto}";
		const tagId = "@deepseek-ai/dsh-client-ui-layout/AppFrame.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-layout";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var AppFrame_module_css_default = {
			"bottomRow": "_-vcqW_bottomRow",
			"centerCol": "_-vcqW_centerCol",
			"frame": "_-vcqW_frame",
			"handle": "_-vcqW_handle",
			"leadingSeat": "_-vcqW_leadingSeat",
			"overlayLayer": "_-vcqW_overlayLayer",
			"rightbarCol": "_-vcqW_rightbarCol",
			"sidebarCol": "_-vcqW_sidebarCol"
		};
		//#endregion
		//#region lib/types/client/AppFrame.js
		/**
		* Three-column shell frame, registered into the built-in 'root' slot (the web
		* shell renders only 'root'). Owns the grid tracks (sidebar | center |
		* rightbar), the drag handles (pointer capture + rAF throttle), the column
		* solve (columns.ts), and the child-slot render decisions: the sidebar slot
		* receives live parameters from that solve. The root-scoped main slot selects
		* the Conversation or a global panel. Each column occupant owns its Session
		* binding and reports the geometry it needs.
		*
		* The right column is a track, not a box: its occupant draws its panel anchored
		* to the frame's right edge at the resolved normal width, and the
		* track only decides whether the centre makes room for it. The occupant reports
		* shown/track/fullscreen through `ctx.layout`; fullscreen keeps the reported
		* track but hides the outer resize handle. Everything arrives through the framework
		* shares — zero cordis or framework imports, zero self-made hooks.
		*/
		/** Center column grid item (session-body building block). */
		function CenterColumn(props) {
			return (0, react_jsx_runtime.jsx)("div", {
				className: AppFrame_module_css_default.centerCol,
				children: props.children
			});
		}
		/** Subscribe to the main key without subscribing the column frame to each panel id. */
		function MainPanel({ usePanelInfo, renderSlot }) {
			return renderSlot("main", {}, { entryKey: usePanelInfo((info) => info.activePanelId) ?? "conversation" });
		}
		/**
		* Right column grid item. Zero-width unless the occupant asked for a track; the
		* occupant's panel is positioned against the column's right edge, which never
		* moves, so it can hang over the centre when there is no track.
		*/
		function RightbarColumn(props) {
			return (0, react_jsx_runtime.jsx)("div", {
				className: AppFrame_module_css_default.rightbarCol,
				"data-rightbar-col": true,
				children: props.children
			});
		}
		/**
		* One drag handle: pointer capture, rAF-throttled dx reports against the drag-start origin.
		* `side` keys the hover-reveal CSS to the owning column.
		*/
		function DragHandle(props) {
			const [dragging, setDragging] = (0, react.useState)(false);
			const origin = (0, react.useRef)(0);
			const latest = (0, react.useRef)(0);
			const frame = (0, react.useRef)(null);
			const capture = (0, react.useRef)(null);
			const callbacks = (0, react.useRef)({
				onStart: props.onStart,
				onDrag: props.onDrag,
				onEnd: props.onEnd
			});
			callbacks.current = {
				onStart: props.onStart,
				onDrag: props.onDrag,
				onEnd: props.onEnd
			};
			const endDrag = (0, react.useCallback)(() => {
				const active = capture.current;
				if (active === null) return;
				capture.current = null;
				if (frame.current !== null) {
					cancelAnimationFrame(frame.current);
					frame.current = null;
				}
				if (active.element.hasPointerCapture(active.id)) active.element.releasePointerCapture(active.id);
				setDragging(false);
				callbacks.current.onEnd();
			}, []);
			(0, react.useEffect)(() => endDrag, [endDrag]);
			const onPointerDown = (0, react.useCallback)((e) => {
				if (e.button !== 0 || capture.current !== null) return;
				e.preventDefault();
				e.currentTarget.setPointerCapture(e.pointerId);
				capture.current = {
					element: e.currentTarget,
					id: e.pointerId
				};
				origin.current = e.clientX;
				latest.current = e.clientX;
				callbacks.current.onStart();
				setDragging(true);
			}, []);
			const onPointerMove = (0, react.useCallback)((e) => {
				if (capture.current?.id !== e.pointerId) return;
				latest.current = e.clientX;
				frame.current ??= requestAnimationFrame(() => {
					frame.current = null;
					callbacks.current.onDrag(latest.current - origin.current);
				});
			}, []);
			const onPointerUp = (0, react.useCallback)((e) => {
				if (capture.current?.id !== e.pointerId) return;
				callbacks.current.onDrag(e.clientX - origin.current);
				endDrag();
			}, [endDrag]);
			const onPointerCancel = (0, react.useCallback)((e) => {
				if (capture.current?.id === e.pointerId) endDrag();
			}, [endDrag]);
			return (0, react_jsx_runtime.jsx)("div", {
				className: AppFrame_module_css_default.handle,
				style: { left: props.left },
				"data-side": props.side,
				"data-dragging": dragging || void 0,
				onPointerDown,
				onPointerMove,
				onPointerUp,
				onPointerCancel,
				onLostPointerCapture: onPointerCancel
			});
		}
		/** The three-column frame (see module doc). */
		function AppFrame({ useStore, useSessions, usePanelInfo, actions, renderSlot, t }) {
			const layoutInfo = useStore((state) => state.layoutInfo);
			const frameRef = (0, react.useRef)(null);
			const viewport = layoutInfo.viewportWidth;
			(0, react.useLayoutEffect)(() => {
				const el = frameRef.current;
				/* v8 ignore next -- the ref is always attached by effect time: the frame div renders unconditionally. */
				if (el === null) return;
				let raf = null;
				let disposed = false;
				const measure = () => {
					const width = el.getBoundingClientRect().width;
					if (width > 0) actions.setViewportWidth(width);
				};
				measure();
				const observer = new ResizeObserver(() => {
					if (disposed) return;
					raf ??= requestAnimationFrame(() => {
						raf = null;
						measure();
					});
				});
				observer.observe(el);
				return () => {
					disposed = true;
					observer.disconnect();
					if (raf !== null) cancelAnimationFrame(raf);
				};
			}, [actions]);
			const narrow = viewport < SIDEBAR_AUTO_COLLAPSE;
			const sidebarCollapsed = narrow ? !layoutInfo.narrowExpanded : layoutInfo.sidebar === 0;
			const sidebarPreference = sidebarCollapsed ? 0 : layoutInfo.sidebar === 0 ? 280 : layoutInfo.sidebar;
			const rightbarPreference = layoutInfo.rightbar ?? viewport * .45;
			const darwin = document.documentElement.dataset.platform === "darwin";
			const collapsedWidth = darwin || document.documentElement.hasAttribute("data-windows-titlebar") ? 0 : 56;
			const normal = computeColumns(viewport, !layoutInfo.rightbarShown && narrow ? 0 : sidebarPreference, rightbarPreference, collapsedWidth);
			const cols = computeColumns(viewport, sidebarPreference, layoutInfo.rightbarTrack ? rightbarPreference : 0, collapsedWidth);
			const colsRef = (0, react.useRef)(cols);
			colsRef.current = cols;
			const rightbarWidth = (0, react.useRef)(normal.rightbar);
			rightbarWidth.current = normal.rightbar;
			const sidebarBase = (0, react.useRef)(0);
			const rightbarBase = (0, react.useRef)(0);
			const [dragging, setDragging] = (0, react.useState)(false);
			const [animating, setAnimating] = (0, react.useState)(0);
			const trackToggle = `${sidebarCollapsed}:${layoutInfo.rightbarTrack}`;
			const previousToggle = (0, react.useRef)(trackToggle);
			const previousViewport = (0, react.useRef)(viewport);
			(0, react.useLayoutEffect)(() => {
				const viewportChanged = previousViewport.current !== viewport;
				previousViewport.current = viewport;
				if (previousToggle.current === trackToggle) return;
				previousToggle.current = trackToggle;
				if (viewportChanged) return;
				setAnimating((token) => token + 1);
			}, [trackToggle, viewport]);
			(0, react.useEffect)(() => {
				if (animating === 0) return;
				const frame = frameRef.current;
				/* v8 ignore next -- the ref is always attached by effect time: the frame div renders unconditionally. */
				if (frame === null) return;
				const settle = () => {
					setAnimating(0);
				};
				const onTransitionEnd = (event) => {
					if (event.target === frame && event.propertyName === "grid-template-columns") settle();
				};
				frame.addEventListener("transitionend", onTransitionEnd);
				const timer = setTimeout(settle, 600);
				return () => {
					frame.removeEventListener("transitionend", onTransitionEnd);
					clearTimeout(timer);
				};
			}, [animating]);
			const onDragEnd = (0, react.useCallback)(() => {
				setDragging(false);
			}, []);
			const onSidebarStart = (0, react.useCallback)(() => {
				sidebarBase.current = colsRef.current.sidebar;
				setDragging(true);
			}, []);
			const onSidebarDrag = (0, react.useCallback)((dx) => {
				actions.setSidebar(sidebarBase.current + dx);
			}, [actions]);
			const onRightbarStart = (0, react.useCallback)(() => {
				rightbarBase.current = rightbarWidth.current;
				setDragging(true);
			}, []);
			const onRightbarDrag = (0, react.useCallback)((dx) => {
				actions.setRightbar(rightbarBase.current - dx);
			}, [actions]);
			const productTitle = "DreamStory";
			const rightbarMax = cols.rightbar === 0 ? 0 : clampWidth(rightbarPreference, 300, viewport * RIGHTBAR_MAX_RATIO);
			const sidebar = (0, react.useMemo)(() => renderSlot("sidebar", {
				collapsed: sidebarCollapsed,
				width: cols.sidebar
			}), [
				renderSlot,
				sidebarCollapsed,
				cols.sidebar
			]);
			const main = (0, react.useMemo)(() => (0, react_jsx_runtime.jsx)(MainPanel, {
				usePanelInfo,
				renderSlot
			}), [usePanelInfo, renderSlot]);
			const overlays = (0, react.useMemo)(() => renderSlot("shell.overlay", {}), [renderSlot]);
			const leading = (0, react.useMemo)(() => renderSlot("shell.leading", {}), [renderSlot]);
			const leadingMounted = darwin && sidebarCollapsed;
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: frameRef,
				className: AppFrame_module_css_default.frame,
				style: {
					...document.documentElement.hasAttribute("data-windows-titlebar") ? { "--dsh-windows-sidebar-width": `${cols.sidebar}px` } : {},
					gridTemplateColumns: `${cols.sidebar}px minmax(${cols.rightbar === 0 ? 0 : 400}px, 1fr) minmax(0px, ${rightbarMax}px)`
				},
				"data-sidebar-collapsed": sidebarCollapsed || void 0,
				"data-rightbar-collapsed": cols.rightbar === 0 || void 0,
				"data-rightbar-fullscreen": layoutInfo.rightbarFullscreen || void 0,
				"data-rightbar-instant": layoutInfo.rightbarInstant || void 0,
				"data-dragging": dragging || void 0,
				"data-animating": animating > 0 || void 0,
				children: [
					(0, react_jsx_runtime.jsx)(DocumentTitle, {
						productTitle,
						useSessions,
						usePanelInfo
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: AppFrame_module_css_default.sidebarCol,
						children: sidebar
					}),
					(0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(CenterColumn, { children: main }), (0, react_jsx_runtime.jsx)(RightbarColumn, { children: renderSlot("rightbar", {
						width: normal.rightbar,
						viewportWidth: viewport,
						canShow: normal.rightbar > 0
					}) })] }),
					(0, react_jsx_runtime.jsx)("div", {
						className: AppFrame_module_css_default.bottomRow,
						"data-shell-bottom": true,
						children: renderSlot("shell.bottom", {})
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: AppFrame_module_css_default.overlayLayer,
						"data-shell-overlay": true,
						children: overlays
					}),
					leadingMounted && (0, react_jsx_runtime.jsx)("div", {
						className: AppFrame_module_css_default.leadingSeat,
						"data-shell-leading": true,
						children: leading
					}),
					!sidebarCollapsed && (0, react_jsx_runtime.jsx)(DragHandle, {
						side: "sidebar",
						left: cols.sidebar,
						onStart: onSidebarStart,
						onDrag: onSidebarDrag,
						onEnd: onDragEnd
					}),
					layoutInfo.rightbarShown && !layoutInfo.rightbarFullscreen && normal.rightbar > 0 && (0, react_jsx_runtime.jsx)(DragHandle, {
						side: "rightbar",
						left: viewport - normal.rightbar,
						onStart: onRightbarStart,
						onDrag: onRightbarDrag,
						onEnd: onDragEnd
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/stores.js
		/**
		* Root-owned frame measurement, panel preferences, and presentation reports.
		* The registration supplies a fresh store and binds its actions to ctx.layout.
		*/
		/**
		* Create the layout panel store handle. For the sidebar the preference IS the
		* width, so closing it forgets its drag width — reopening restores the contract
		* default. The right panel initializes at 45% of the frame on first opening
		* and keeps that px preference across resizes and close. Drag writes clamp to
		* the current frame's range. Narrow sidebar toggles change only the expansion
		* override; opening the right panel clears that override.
		* @returns the store handle (spec + type + identity + factory in one).
		*/
		function createLayoutStore() {
			return (0, _deepseek_ai_dsh_client_store.defineStore)({
				init: () => ({
					panelInfo: { activePanelId: null },
					layoutInfo: {
						sidebar: 280,
						viewportWidth: window.innerWidth,
						narrowExpanded: false,
						rightbar: null,
						rightbarShown: false,
						rightbarTrack: false,
						rightbarFullscreen: false,
						rightbarInstant: false
					}
				}),
				actions: {
					selectPanel: (d, panelId) => {
						d.panelInfo.activePanelId = panelId;
					},
					retainMainPanels: (d, panelIds) => {
						if (d.panelInfo.activePanelId !== null && !panelIds.includes(d.panelInfo.activePanelId)) d.panelInfo.activePanelId = null;
					},
					setSidebar: (d, px) => {
						d.layoutInfo.rightbarInstant = false;
						d.layoutInfo.sidebar = clampWidth(px, 264, 420);
					},
					toggleSidebar: (d) => {
						d.layoutInfo.rightbarInstant = false;
						if (d.layoutInfo.viewportWidth < 1024) d.layoutInfo.narrowExpanded = !d.layoutInfo.narrowExpanded;
						else d.layoutInfo.sidebar = d.layoutInfo.sidebar === 0 ? 280 : 0;
					},
					setViewportWidth: (d, width) => {
						if (d.layoutInfo.viewportWidth === width) return;
						d.layoutInfo.rightbarInstant = false;
						if (d.layoutInfo.viewportWidth < 1024 !== width < 1024) d.layoutInfo.narrowExpanded = false;
						d.layoutInfo.viewportWidth = width;
					},
					setRightbar: (d, px) => {
						d.layoutInfo.rightbarInstant = false;
						d.layoutInfo.rightbar = clampWidth(px, 300, Math.max(300, d.layoutInfo.viewportWidth * RIGHTBAR_MAX_RATIO));
					},
					openRightbar: (d, track, fullscreen) => {
						if (!d.layoutInfo.rightbarShown || d.layoutInfo.rightbarTrack !== track || d.layoutInfo.rightbarFullscreen !== fullscreen) d.layoutInfo.rightbarInstant = d.layoutInfo.rightbarFullscreen && !fullscreen;
						if (!d.layoutInfo.rightbarShown && d.layoutInfo.viewportWidth < 1024) d.layoutInfo.narrowExpanded = false;
						d.layoutInfo.rightbar ??= Math.max(300, Math.round(d.layoutInfo.viewportWidth * RIGHTBAR_DEFAULT_RATIO));
						d.layoutInfo.rightbarShown = true;
						d.layoutInfo.rightbarTrack = track;
						d.layoutInfo.rightbarFullscreen = fullscreen;
					},
					closeRightbar: (d) => {
						if (d.layoutInfo.rightbarShown) d.layoutInfo.rightbarInstant = d.layoutInfo.rightbarFullscreen;
						d.layoutInfo.rightbarShown = false;
						d.layoutInfo.rightbarTrack = false;
						d.layoutInfo.rightbarFullscreen = false;
					}
				}
			});
		}
		//#endregion
		//#region lib/types/client/service.js
		/** Cross-plugin panel-action face (ctx.layout). */
		var LayoutController = class {
			panels;
			hasMainPanel;
			panelInfo;
			navigation = new AbortController();
			/**
			* @param panels - actions of the instance shared with the root entry.
			* @param hasMainPanel - checks the live main-slot registry for a panel id.
			* @param panelInfo - root store's shared central-panel selection source.
			*/
			constructor(panels, hasMainPanel, panelInfo) {
				this.panels = panels;
				this.hasMainPanel = hasMainPanel;
				this.panelInfo = panelInfo;
			}
			/** Select a global panel or return to the Conversation. */
			selectPanel(panelId) {
				if (panelId !== null && !this.hasMainPanel(panelId)) throw new Error(`layout.selectPanel: main panel "${panelId}" is not registered`);
				this.navigation.abort();
				this.panels.selectPanel(panelId);
			}
			/** @returns the new pending navigation's cancellation signal. */
			beginNavigation() {
				this.navigation.abort();
				this.navigation = new AbortController();
				return this.navigation.signal;
			}
			/** Invalidate pending navigations when the layout owner is unloaded. */
			dispose() {
				this.navigation.abort();
			}
			/** Toggle the sidebar panel (closed ⟷ contract default width). */
			toggleSidebar() {
				this.panels.toggleSidebar();
			}
			/** Report the right panel's track and fullscreen presentation. */
			openRightbar(track, fullscreen) {
				this.panels.openRightbar(track, fullscreen);
			}
			/** Report the right panel as hidden: no track, no handle. */
			closeRightbar() {
				this.panels.closeRightbar();
			}
		};
		//#endregion
		//#region lib/types/client/shortcut-locales.js
		/** Layout command labels. */
		const zh = { toggle: "展开／收起左侧栏" };
		/** English labels for the same layout commands. */
		const en = { toggle: "Toggle left sidebar" };
		/** Japanese copy, checked against the English keys. */
		const ja = { "toggle": "左サイドバーを切り替え" };
		/** Spanish dictionary, checked against the English keys. */
		const es = { toggle: "Alternar barra lateral izquierda" };
		/** French dictionary, checked against the English keys. */
		const fr = { toggle: "Basculer la barre latérale gauche" };
		/** German dictionary, checked against the English keys. */
		const de = { toggle: "Linke Seitenleiste umschalten" };
		/** Russian dictionary, checked against the English keys. */
		const ru = { toggle: "Переключить левую боковую панель" };
		/** Portuguese dictionary, checked against the English keys. */
		const pt = { toggle: "Alternar barra lateral esquerda" };
		//#endregion
		//#region lib/types/client/theme-presenter.js
		/** Body attribute selecting the dark base palette in the token stylesheets. */
		const DARK_ATTRIBUTE = "data-ds-dark-theme";
		/**
		* Root attribute publishing the theme source (`light`, `dark`, or `system`)
		* for host shells that mirror it into the native theme (the Electron preload
		* forwards it to `nativeTheme.themeSource`, so native chrome, renderer
		* `prefers-color-scheme` queries, and Platform login links follow the app
		* palette on every platform). `system` only when the preference is `system`;
		* a fixed preference (including registered theme ids) publishes its resolved
		* scheme.
		*/
		const THEME_SOURCE_ATTRIBUTE = "data-ds-theme-source";
		/** Body variables carrying the user's font sizes in px by role. */
		const FONT_SIZE_VARIABLES = {
			text: "--dsh-content-font-size",
			code: "--dsh-code-font-size",
			terminal: "--dsh-terminal-font-size"
		};
		/** Body variables carrying the user's normalized font lists; absent selects the built-in stack. */
		const FONT_FAMILY_VARIABLES = {
			text: "--dsh-font-family-text",
			code: "--dsh-font-family-code",
			terminal: "--dsh-font-family-terminal"
		};
		/** Applies theme snapshots to the document; one instance per plugin fiber. */
		var ThemePresenter = class {
			/** Token names this presenter wrote in the last apply (its retraction set). */
			appliedTokens = [];
			/** The single metadata node this presenter inserts and removes. */
			themeColorMeta;
			/** Create the presenter-owned metadata node before the first snapshot arrives. */
			constructor() {
				this.themeColorMeta = document.createElement("meta");
				this.themeColorMeta.name = "theme-color";
			}
			/**
			* Project a snapshot onto the document: set root `color-scheme` and the body
			* palette attribute from `active.colorScheme` (never the id — `system` is
			* resolved upstream), publish the font sizes and font lists, then replace the
			* previously applied token variables with `active.tokens`. Browser
			* theme-color metadata follows the computed body background after those
			* writes, so the rendered palette remains the color authority.
			* @param snapshot - resolved theme snapshot from ctx.theme.
			*/
			apply(snapshot) {
				const scheme = snapshot.active.colorScheme;
				document.documentElement.style.colorScheme = scheme;
				document.documentElement.setAttribute(THEME_SOURCE_ATTRIBUTE, snapshot.preference === "system" ? "system" : scheme);
				const body = document.body;
				if (scheme === "dark") body.setAttribute(DARK_ATTRIBUTE, "");
				else body.removeAttribute(DARK_ATTRIBUTE);
				for (const [role, name] of Object.entries(FONT_SIZE_VARIABLES)) body.style.setProperty(name, `${snapshot.fontSizes[role]}px`);
				for (const [kind, name] of Object.entries(FONT_FAMILY_VARIABLES)) {
					const list = snapshot.fontFamilies[kind];
					if (list === "") body.style.removeProperty(name);
					else body.style.setProperty(name, list);
				}
				for (const name of this.appliedTokens) body.style.removeProperty(name);
				this.appliedTokens = [];
				for (const [name, value] of Object.entries(snapshot.active.tokens)) {
					body.style.setProperty(name, value);
					this.appliedTokens.push(name);
				}
				this.themeColorMeta.content = getComputedStyle(body).backgroundColor;
				if (!this.themeColorMeta.isConnected) document.head.append(this.themeColorMeta);
			}
			/**
			* Retract root color-scheme, the theme-source attribute, the palette
			* attribute, token variables, the font sizes, font lists, and the owned metadata node.
			*/
			dispose() {
				document.documentElement.style.removeProperty("color-scheme");
				document.documentElement.removeAttribute(THEME_SOURCE_ATTRIBUTE);
				const body = document.body;
				body.removeAttribute(DARK_ATTRIBUTE);
				for (const name of Object.values(FONT_SIZE_VARIABLES)) body.style.removeProperty(name);
				for (const name of Object.values(FONT_FAMILY_VARIABLES)) body.style.removeProperty(name);
				for (const name of this.appliedTokens) body.style.removeProperty(name);
				this.appliedTokens = [];
				this.themeColorMeta.remove();
			}
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Required services (cordis fiber inject — the loader passes all module exports as an object plugin). */
		const inject = [
			"slots",
			"theme",
			"locale",
			"shortcuts"
		];
		/**
		* Client plugin body: provide ctx.layout, then one register() call — AppFrame
		* into 'root' with its child-slot declarations, the layout store seat,
		* and the shared root instance supplying commands and the panel-info source.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register("shortcuts.layout", {
				zh,
				en,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}), "layout: command labels");
			const t = ctx.locale.bind("shortcuts.layout");
			ctx.effect(() => {
				const handle = createLayoutStore();
				const instance = handle.create();
				const store = {
					...handle,
					create: () => instance
				};
				const retainMainPanels = () => {
					instance.actions.retainMainPanels(ctx.slots.entries("main").flatMap((entry) => entry.options.key === void 0 ? [] : [entry.options.key]));
				};
				const layout = new LayoutController(instance.actions, (id) => ctx.slots.entries("main").some((entry) => entry.options.key === id), {
					getSnapshot: () => instance.getSnapshot().panelInfo,
					subscribe: (listener) => instance.subscribe(listener)
				});
				const disposePanelInfo = ctx.slots.provideRoot({ hooks: { panelInfo: layout.panelInfo } });
				const disposeService = ctx.reflect.provide("layout", layout);
				const disposeRegistration = ctx.slots.register({
					name: "root",
					locale: "common",
					children: {
						"sidebar": {
							kind: "single",
							scope: "root"
						},
						"main": {
							kind: "keyed",
							scope: "root"
						},
						"rightbar": {
							kind: "single",
							scope: "root"
						},
						"shell.bottom": {
							kind: "single",
							scope: "root"
						},
						"shell.overlay": {
							kind: "list",
							scope: "root"
						},
						"shell.leading": {
							kind: "single",
							scope: "root"
						}
					},
					store
				}, AppFrame);
				const disposeShortcut = ctx.shortcuts.register({
					id: "sidebar.left.toggle",
					label: () => t("toggle"),
					aliases: ["sidebar", "toggle left sidebar"],
					defaults: {
						"desktop:macos": {
							code: "KeyB",
							modifiers: ["primary"]
						},
						"desktop:windows": {
							code: "KeyB",
							modifiers: ["primary"]
						},
						"desktop:linux": {
							code: "KeyB",
							modifiers: ["primary"]
						},
						"web:macos": {
							code: "KeyB",
							modifiers: ["primary", "alt"]
						},
						"web:windows": {
							code: "KeyB",
							modifiers: ["primary", "alt"]
						}
					},
					regions: ["page", "editable"],
					modals: [],
					resolve: () => ({
						status: "handled",
						run: () => {
							layout.toggleSidebar();
						}
					})
				});
				const disposePanels = ctx.slots.subscribe("main", retainMainPanels);
				retainMainPanels();
				return () => {
					disposeShortcut();
					layout.dispose();
					disposePanels();
					disposeRegistration();
					disposePanelInfo();
					disposeService();
				};
			}, "ui-layout: service + root registration");
			ctx.effect(() => {
				const presenter = new ThemePresenter();
				presenter.apply(ctx.theme.getTheme());
				const off = ctx.on("theme/change", (snapshot) => {
					presenter.apply(snapshot);
				});
				return () => {
					off();
					presenter.dispose();
				};
			}, "ui-layout: theme presenter");
		}
		//#endregion
		exports.LayoutController = LayoutController;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
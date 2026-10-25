window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-renderer",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
		//#endregion
		let react = require("react");
		let react_dom = require("react-dom");
		let react_dom_client = require("react-dom/client");
		let react_jsx_runtime = require("react/jsx-runtime");
		let _deepseek_ai_dsh_client_ui_slots = require("@deepseek-ai/dsh-client-ui-slots");
		let _deepseek_ai_cordis = require("@deepseek-ai/cordis");
		//#region ../../../node_modules/.pnpm/use-sync-external-store@1.6.0_react@18.3.1/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.production.js
		/**
		* @license React
		* use-sync-external-store-shim.production.js
		*
		* Copyright (c) Meta Platforms, Inc. and affiliates.
		*
		* This source code is licensed under the MIT license found in the
		* LICENSE file in the root directory of this source tree.
		*/
		var require_use_sync_external_store_shim_production = /* @__PURE__ */ __commonJSMin(((exports) => {
			var React$1 = require("react");
			function is(x, y) {
				return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
			}
			var objectIs = "function" === typeof Object.is ? Object.is : is, useState = React$1.useState, useEffect = React$1.useEffect, useLayoutEffect = React$1.useLayoutEffect, useDebugValue = React$1.useDebugValue;
			function useSyncExternalStore$2(subscribe, getSnapshot) {
				var value = getSnapshot(), _useState = useState({ inst: {
					value,
					getSnapshot
				} }), inst = _useState[0].inst, forceUpdate = _useState[1];
				useLayoutEffect(function() {
					inst.value = value;
					inst.getSnapshot = getSnapshot;
					checkIfSnapshotChanged(inst) && forceUpdate({ inst });
				}, [
					subscribe,
					value,
					getSnapshot
				]);
				useEffect(function() {
					checkIfSnapshotChanged(inst) && forceUpdate({ inst });
					return subscribe(function() {
						checkIfSnapshotChanged(inst) && forceUpdate({ inst });
					});
				}, [subscribe]);
				useDebugValue(value);
				return value;
			}
			function checkIfSnapshotChanged(inst) {
				var latestGetSnapshot = inst.getSnapshot;
				inst = inst.value;
				try {
					var nextValue = latestGetSnapshot();
					return !objectIs(inst, nextValue);
				} catch (error) {
					return !0;
				}
			}
			function useSyncExternalStore$1(subscribe, getSnapshot) {
				return getSnapshot();
			}
			var shim = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? useSyncExternalStore$1 : useSyncExternalStore$2;
			exports.useSyncExternalStore = void 0 !== React$1.useSyncExternalStore ? React$1.useSyncExternalStore : shim;
		}));
		//#endregion
		//#region ../../../node_modules/.pnpm/use-sync-external-store@1.6.0_react@18.3.1/node_modules/use-sync-external-store/shim/index.js
		var require_shim = /* @__PURE__ */ __commonJSMin(((exports, module) => {
			module.exports = require_use_sync_external_store_shim_production();
		}));
		//#endregion
		//#region ../../../node_modules/.pnpm/use-sync-external-store@1.6.0_react@18.3.1/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.production.js
		/**
		* @license React
		* use-sync-external-store-shim/with-selector.production.js
		*
		* Copyright (c) Meta Platforms, Inc. and affiliates.
		*
		* This source code is licensed under the MIT license found in the
		* LICENSE file in the root directory of this source tree.
		*/
		var require_with_selector_production = /* @__PURE__ */ __commonJSMin(((exports) => {
			var React = require("react"), shim = require_shim();
			function is(x, y) {
				return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
			}
			var objectIs = "function" === typeof Object.is ? Object.is : is, useSyncExternalStore = shim.useSyncExternalStore, useRef = React.useRef, useEffect = React.useEffect, useMemo = React.useMemo, useDebugValue = React.useDebugValue;
			exports.useSyncExternalStoreWithSelector = function(subscribe, getSnapshot, getServerSnapshot, selector, isEqual) {
				var instRef = useRef(null);
				if (null === instRef.current) {
					var inst = {
						hasValue: !1,
						value: null
					};
					instRef.current = inst;
				} else inst = instRef.current;
				instRef = useMemo(function() {
					function memoizedSelector(nextSnapshot) {
						if (!hasMemo) {
							hasMemo = !0;
							memoizedSnapshot = nextSnapshot;
							nextSnapshot = selector(nextSnapshot);
							if (void 0 !== isEqual && inst.hasValue) {
								var currentSelection = inst.value;
								if (isEqual(currentSelection, nextSnapshot)) return memoizedSelection = currentSelection;
							}
							return memoizedSelection = nextSnapshot;
						}
						currentSelection = memoizedSelection;
						if (objectIs(memoizedSnapshot, nextSnapshot)) return currentSelection;
						var nextSelection = selector(nextSnapshot);
						if (void 0 !== isEqual && isEqual(currentSelection, nextSelection)) return memoizedSnapshot = nextSnapshot, currentSelection;
						memoizedSnapshot = nextSnapshot;
						return memoizedSelection = nextSelection;
					}
					var hasMemo = !1, memoizedSnapshot, memoizedSelection, maybeGetServerSnapshot = void 0 === getServerSnapshot ? null : getServerSnapshot;
					return [function() {
						return memoizedSelector(getSnapshot());
					}, null === maybeGetServerSnapshot ? void 0 : function() {
						return memoizedSelector(maybeGetServerSnapshot());
					}];
				}, [
					getSnapshot,
					getServerSnapshot,
					selector,
					isEqual
				]);
				var value = useSyncExternalStore(subscribe, instRef[0], instRef[1]);
				useEffect(function() {
					inst.hasValue = !0;
					inst.value = value;
				}, [value]);
				useDebugValue(value);
				return value;
			};
		}));
		//#endregion
		//#region lib/types/client/bind.js
		var import_with_selector = (/* @__PURE__ */ __commonJSMin(((exports, module) => {
			module.exports = require_with_selector_production();
		})))();
		/**
		* Bind a bare observable source to a typed uSES selector hook.
		* subscribe/getSnapshot are captured once per source into stable closures
		* (also re-binds `this` for method-based sources), so components never
		* resubscribe across renders. Equality defaults to Object.is.
		* @param w - snapshot source (engine store, Session object, store instance).
		* @returns the selector hook.
		*/
		function bindSnapshotSelector(w) {
			const subscribe = (fn) => w.subscribe(fn);
			const getSnapshot = () => w.getSnapshot();
			return function useSelector(sel, eq) {
				return (0, import_with_selector.useSyncExternalStoreWithSelector)(subscribe, getSnapshot, void 0, sel, eq);
			};
		}
		//#endregion
		//#region lib/types/client/errors.js
		/** Shared renderer failure categories. @module */
		/** Renderer assembly failures that must escape component error boundaries. */
		var SlotAssemblyError = class extends Error {};
		//#endregion
		//#region lib/types/client/bindings.js
		/** Internal React bindings for renderer hosts and standard-source scopes. */
		/** In-package renderer host context. */
		const HostContext = (0, react.createContext)(null);
		/**
		* Read the installed renderer host.
		* @returns the host API.
		*/
		function useHost() {
			const host = (0, react.useContext)(HostContext);
			if (host === null) throw new SlotAssemblyError("slot machinery rendered outside the installed renderer tree");
			return host;
		}
		const RootBindingContext = (0, react.createContext)(null);
		const ScopeBindingContext = (0, react.createContext)(null);
		/**
		* Read the root standard-source binding.
		* @returns the current root binding.
		*/
		function useRootBinding() {
			const binding = (0, react.useContext)(RootBindingContext);
			if (binding === null) throw new SlotAssemblyError("slot rendered outside the root standard-source provider");
			return binding;
		}
		/**
		* Read the current-session-optional binding.
		* @returns a binding whose key is absent when no Session is selected.
		*/
		function useScopeBinding() {
			const binding = (0, react.useContext)(ScopeBindingContext);
			if (binding === null) throw new SlotAssemblyError("scoped slot rendered outside its scope provider");
			return binding;
		}
		/**
		* Publish one resolved scope binding to a renderer subtree.
		* @param props - provider inputs.
		* @param props.binding - binding exposed to scoped entries.
		* @param props.children - subtree that inherits the binding.
		* @returns the scoped React provider.
		*/
		function ScopeBindingProvider({ binding, children }) {
			return (0, react_jsx_runtime.jsx)(ScopeBindingContext.Provider, {
				value: binding,
				children
			});
		}
		/**
		* Bind one observable source to an identity-stable selector Hook.
		* @param source - observable source.
		* @returns cached selector Hook.
		*/
		function observableHook(source) {
			let hook = hookCache.get(source);
			if (hook === void 0) {
				hook = bindSnapshotSelector(source);
				hookCache.set(source, hook);
			}
			return hook;
		}
		const hookCache = /* @__PURE__ */ new WeakMap();
		const absentSource = {
			getSnapshot: () => void 0,
			subscribe: () => () => {}
		};
		/**
		* Bind an optional source without changing Hook call order.
		* @param source - current source, or absence.
		* @returns selector Hook returning `undefined` while absent.
		*/
		function maybeObservableHook(source) {
			if (source !== void 0) return observableHook(source);
			return useAbsentSnapshot;
		}
		function useAbsentSnapshot(_selector, _equal) {
			observableHook(absentSource)(() => void 0);
		}
		/** Read the `(key, member)`, `(key, selector?, equal?)`, or `(selector, equal?)` call forms. */
		function keyedHookCall(defaultKey, keyOrSelector, second, equal) {
			if (typeof keyOrSelector !== "string") return {
				key: defaultKey,
				member: void 0,
				selector: keyOrSelector,
				equal: second
			};
			if (typeof second === "string") return {
				key: keyOrSelector,
				member: second,
				selector: void 0,
				equal: void 0
			};
			return {
				key: keyOrSelector,
				member: void 0,
				selector: second,
				equal
			};
		}
		/**
		* Bind an open-key source family.
		* @param source - keyed resolver, or absence for an optional scope.
		* @returns cached keyed selector Hook.
		*/
		function keyedObservableHook(source, defaultKey) {
			if (source === void 0) return absentKeyedHook;
			let hooks = keyedHookCache.get(source);
			if (hooks === void 0) {
				hooks = /* @__PURE__ */ new Map();
				keyedHookCache.set(source, hooks);
			}
			const cacheKey = defaultKey ?? NO_DEFAULT_KEY;
			let hook = hooks.get(cacheKey);
			if (hook === void 0) {
				hook = (keyOrSelector, second, equal) => {
					const call = keyedHookCall(defaultKey, keyOrSelector, second, equal);
					return observableHook((call.key === void 0 ? void 0 : call.member === void 0 ? source(call.key) : source(call.key, call.member)) ?? absentSource)(call.selector ?? identity, call.equal);
				};
				hooks.set(cacheKey, hook);
			}
			return hook;
		}
		const NO_DEFAULT_KEY = Symbol("no default key");
		const keyedHookCache = /* @__PURE__ */ new WeakMap();
		const identity = (value) => value;
		const absentKeyedHook = (keyOrSelector, second, equal) => {
			const call = keyedHookCall(void 0, keyOrSelector, second, equal);
			return observableHook(absentSource)(call.selector ?? identity, call.equal);
		};
		/** Subscribe the tree to the atomically assembled root standard-source roster. */
		function RootStandardProvider({ children }) {
			const binding = observableHook(useHost().root)((value) => value);
			return (0, react_jsx_runtime.jsx)(RootBindingContext.Provider, {
				value: binding,
				children
			});
		}
		/** Subscribe to the scope roster before resolving and binding its current adapter. */
		function ScopeProvider({ scope, children }) {
			const host = useHost();
			observableHook(host.scopeRevision)((value) => value);
			const adapter = host.scope(scope);
			if (adapter === void 0) throw new SlotAssemblyError(`scope '${scope}' rendered without an installed adapter`);
			const binding = observableHook(adapter.current)((value) => value);
			return (0, react_jsx_runtime.jsx)(ScopeBindingContext.Provider, {
				value: binding,
				children
			});
		}
		//#endregion
		//#region lib/types/client/scoped-slots.js
		/**
		* React renderer for declarative slots. Per-entry bindings enforce child
		* authorization, and entry boundaries contain registrant failures.
		*/
		const factoryRenderCache = /* @__PURE__ */ new WeakMap();
		function boundRenderFactorySlot(caller) {
			let render = factoryRenderCache.get(caller);
			if (render !== void 0) return render;
			render = ((name, props, options) => (0, react_jsx_runtime.jsx)(FactoryOutlet, {
				name,
				inputProps: props,
				slots: options?.slots,
				fallback: options?.fallback,
				caller
			}));
			factoryRenderCache.set(caller, render);
			return render;
		}
		/**
		* Per-entry renderSlot bindings. The binding is identity-stable per entry
		* (memoized components must not resubscribe on unrelated re-renders) and dies
		* with the entry: a retained closure calling after the entry's disposal hits
		* the in-ledger check and throws.
		*/
		const renderSlotCache = /* @__PURE__ */ new WeakMap();
		function boundRenderSlot(host, entry) {
			let binding = renderSlotCache.get(entry);
			if (!binding) {
				binding = (key, owner, opts) => {
					if (!host.isLive(entry)) throw new _deepseek_ai_dsh_client_ui_slots.StaleAuthorizationError(`renderSlot('${key}') from a disposed registration`);
					const declared = entry.children?.[key];
					if (declared === void 0) throw new _deepseek_ai_dsh_client_ui_slots.SlotOwnershipError(`slot '${key}' is not declared by this entry's children`);
					if (declared.kind === "chain") throw new _deepseek_ai_dsh_client_ui_slots.SlotOwnershipError(`slot '${key}' is declared 'chain' — use renderSlotChain`);
					return (0, react_jsx_runtime.jsx)(SlotOutlet, {
						slotKey: key,
						ownerProps: owner,
						opts,
						declaredInline: declared.inline === true
					});
				};
				renderSlotCache.set(entry, binding);
			}
			return binding;
		}
		/**
		* Per-entry renderSlotChain bindings: identity-stable per entry (same cache
		* axis as renderSlot — a per-frame dispatch must not rebuild the binding) and
		* dead with the entry. The chain-kind check is the plain-JS backstop twin of
		* the declaration check; typed callers are narrowed to chain keys.
		*/
		const renderSlotChainCache = /* @__PURE__ */ new WeakMap();
		function boundRenderSlotChain(host, entry) {
			let binding = renderSlotChainCache.get(entry);
			if (!binding) {
				binding = (key, owner, opts) => {
					if (!host.isLive(entry)) throw new _deepseek_ai_dsh_client_ui_slots.StaleAuthorizationError(`renderSlotChain('${key}') from a disposed registration`);
					const declared = entry.children?.[key];
					if (declared === void 0) throw new _deepseek_ai_dsh_client_ui_slots.SlotOwnershipError(`slot '${key}' is not declared by this entry's children`);
					if (declared.kind !== "chain") throw new _deepseek_ai_dsh_client_ui_slots.SlotOwnershipError(`slot '${key}' is declared '${declared.kind}', not 'chain' — use renderSlot`);
					return (0, react_jsx_runtime.jsx)(SlotOutlet, {
						slotKey: key,
						ownerProps: owner,
						opts,
						declaredInline: declared.inline === true
					});
				};
				renderSlotChainCache.set(entry, binding);
			}
			return binding;
		}
		const factoryRenderSlotCache = /* @__PURE__ */ new WeakMap();
		const factoryRenderSlotChainCache = /* @__PURE__ */ new WeakMap();
		function boundFactoryRenderSlot(host, definition) {
			let binding = factoryRenderSlotCache.get(definition);
			if (binding !== void 0) return binding;
			binding = (key, owner, opts) => {
				if (!host.isFactoryLive(definition)) throw new _deepseek_ai_dsh_client_ui_slots.StaleAuthorizationError(`renderSlot('${key}') from a disposed Factory`);
				const declared = definition.children?.[key];
				if (declared === void 0) throw new _deepseek_ai_dsh_client_ui_slots.SlotOwnershipError(`slot '${key}' is not declared by this Factory`);
				if (declared.kind === "chain") throw new _deepseek_ai_dsh_client_ui_slots.SlotOwnershipError(`slot '${key}' is declared 'chain' — use renderSlotChain`);
				return (0, react_jsx_runtime.jsx)(SlotOutlet, {
					slotKey: key,
					ownerProps: owner,
					opts,
					declaredInline: declared.inline === true
				});
			};
			factoryRenderSlotCache.set(definition, binding);
			return binding;
		}
		function boundFactoryRenderSlotChain(host, definition) {
			let binding = factoryRenderSlotChainCache.get(definition);
			if (binding !== void 0) return binding;
			binding = (key, owner, opts) => {
				if (!host.isFactoryLive(definition)) throw new _deepseek_ai_dsh_client_ui_slots.StaleAuthorizationError(`renderSlotChain('${key}') from a disposed Factory`);
				const declared = definition.children?.[key];
				if (declared === void 0) throw new _deepseek_ai_dsh_client_ui_slots.SlotOwnershipError(`slot '${key}' is not declared by this Factory`);
				if (declared.kind !== "chain") throw new _deepseek_ai_dsh_client_ui_slots.SlotOwnershipError(`slot '${key}' is declared '${declared.kind}', not 'chain' — use renderSlot`);
				return (0, react_jsx_runtime.jsx)(SlotOutlet, {
					slotKey: key,
					ownerProps: owner,
					opts,
					declaredInline: declared.inline === true
				});
			};
			factoryRenderSlotChainCache.set(definition, binding);
			return binding;
		}
		/**
		* Inject results cache: root entries per entry, session entries per
		* (entry x scope binding). WeakMap keys are entry/binding objects (both
		* identity-stable per registration/session scope), so cache lifetime rides
		* the same axes as the values it memoizes.
		*/
		const rootInjectCache = /* @__PURE__ */ new WeakMap();
		const sessionInjectCache = /* @__PURE__ */ new WeakMap();
		const sessionMaybeInjectCache = /* @__PURE__ */ new WeakMap();
		const EMPTY_INJECTED_PROPS = {};
		function runInject(entry, binding, actions) {
			const inject = entry.inject;
			if (!inject) return EMPTY_INJECTED_PROPS;
			const args = [];
			if (binding !== void 0) args.push(binding.key);
			if (actions !== void 0) args.push(actions);
			return bindInjectSources(inject(...args));
		}
		/** Bind one entry-owned inject face on its existing cache axis. */
		function bindInjectSources(face) {
			const sources = face["hooks"];
			const keyedSources = face["keyedHooks"];
			if (sources === void 0 && keyedSources === void 0) return face;
			const { hooks: _hooks, keyedHooks: _keyedHooks, ...rest } = face;
			const bound = rest;
			for (const [name, source] of Object.entries(sources ?? {})) {
				const hookName = (0, _deepseek_ai_dsh_client_ui_slots.standardHookPropName)(name);
				bound[hookName] = observableHook(source);
			}
			for (const [name, source] of Object.entries(keyedSources ?? {})) {
				const hookName = (0, _deepseek_ai_dsh_client_ui_slots.standardHookPropName)(name);
				bound[hookName] = keyedObservableHook(source);
			}
			return bound;
		}
		const slotInjectCache = /* @__PURE__ */ new WeakMap();
		const EMPTY_SLOT_INJECT = { props: EMPTY_INJECTED_PROPS };
		/** Normalize one dispatcher-owned inject face by its stable object identity. */
		function cachedSlotInject(face) {
			if (face === void 0) return EMPTY_SLOT_INJECT;
			let bound = slotInjectCache.get(face);
			if (bound !== void 0) return bound;
			const definitions = face["hooks"];
			if (definitions === void 0) {
				bound = { props: face };
				slotInjectCache.set(face, bound);
				return bound;
			}
			const { hooks: _hooks, ...rest } = face;
			const props = rest;
			let factories;
			for (const [name, definition] of Object.entries(definitions)) {
				const hookName = (0, _deepseek_ai_dsh_client_ui_slots.standardHookPropName)(name);
				if (typeof definition === "function") {
					factories ??= {};
					factories[name] = definition;
				} else props[hookName] = observableHook(definition);
			}
			bound = factories === void 0 ? { props } : {
				props,
				slotHookFactories: factories
			};
			slotInjectCache.set(face, bound);
			return bound;
		}
		/** Bind deferred slot-level factories for one stable renderSlot occurrence. */
		function bindSlotHookFactories(factories, standard, hookContext) {
			const hooks = {};
			for (const [name, factory] of Object.entries(factories)) {
				const hookName = (0, _deepseek_ai_dsh_client_ui_slots.standardHookPropName)(name);
				hooks[hookName] = factory(standard, hookContext);
			}
			return hooks;
		}
		function cachedRootInject(entry, actions) {
			let props = rootInjectCache.get(entry);
			if (!props) {
				props = runInject(entry, void 0, actions);
				rootInjectCache.set(entry, props);
			}
			return props;
		}
		function cachedSessionInject(entry, binding, actions) {
			let perBinding = sessionInjectCache.get(entry);
			if (!perBinding) {
				perBinding = /* @__PURE__ */ new WeakMap();
				sessionInjectCache.set(entry, perBinding);
			}
			let props = perBinding.get(binding);
			if (!props) {
				props = runInject(entry, binding, actions);
				perBinding.set(binding, props);
			}
			return props;
		}
		function cachedSessionMaybeInject(entry, binding, actions) {
			let perBinding = sessionMaybeInjectCache.get(entry);
			if (!perBinding) {
				perBinding = /* @__PURE__ */ new WeakMap();
				sessionMaybeInjectCache.set(entry, perBinding);
			}
			let props = perBinding.get(binding);
			if (!props) {
				props = runInject(entry, binding, actions);
				perBinding.set(binding, props);
			}
			return props;
		}
		/**
		* Locale `t` seat bindings, cached per (face, namespace, revision). The
		* revision is part of the cache key ON PURPOSE: a locale switch mints a NEW
		* function reference per namespace, so `React.memo` components taking `t`
		* re-render through ordinary shallow comparison — freshness rides identity,
		* no extra invalidation channel. Within one revision the reference is stable
		* (memoized children do not churn on unrelated re-renders).
		*/
		const localeSeatCache = /* @__PURE__ */ new WeakMap();
		function localeSeat(face, ns) {
			let perNs = localeSeatCache.get(face);
			if (!perNs) {
				perNs = /* @__PURE__ */ new Map();
				localeSeatCache.set(face, perNs);
			}
			const revision = face.getSnapshot().revision;
			const cached = perNs.get(ns);
			if (cached && cached.revision === revision) return cached.t;
			const bound = face.bind(ns);
			const t = (key, params) => bound(key, params);
			perNs.set(ns, {
				revision,
				t
			});
			return t;
		}
		const noopSubscribe = () => () => {};
		const zeroRevision = () => 0;
		/**
		* Per-face subscribe/getSnapshot closure pair. Cached by face identity: the
		* face is one global source shared by every outlet, and uSES resubscribes
		* whenever the subscribe reference changes — fresh closures per render would
		* churn one unsubscribe/resubscribe pair per outlet per render.
		*/
		const localeSubscriptionCache = /* @__PURE__ */ new WeakMap();
		function localeSubscription(face) {
			let cached = localeSubscriptionCache.get(face);
			if (!cached) {
				cached = {
					subscribe: (fn) => face.subscribe(fn),
					getRevision: () => face.getSnapshot().revision
				};
				localeSubscriptionCache.set(face, cached);
			}
			return cached;
		}
		/**
		* Subscribe an outlet to the installed locale face's revision (0 while none
		* is installed — exactly one uSES call either way, keeping hook order
		* stable). Every outlet re-renders on a locale switch; entry bodies then
		* re-derive their `t` seat at the new revision. The face must be installed
		* before the first render that needs it — a face appearing later has no
		* notification channel to already-mounted outlets.
		*/
		function useLocaleRevision(face) {
			const subscription = face !== void 0 ? localeSubscription(face) : void 0;
			return (0, react.useSyncExternalStore)(subscription?.subscribe ?? noopSubscribe, subscription?.getRevision ?? zeroRevision);
		}
		/**
		* Entry-identity React keys for entry boundaries. An outlet renders one
		* winner per position (single/keyed/list cell head, chain election) through
		* an error boundary; without a key, a boundary that failed on entry A would
		* survive a winner change (re-election, shadowing fallback after an
		* abdication, HMR re-registration) and keep a healthy entry B blacked out.
		* Keying by entry identity remounts the boundary fresh whenever the winner
		* changes (entries are identity-stable per registration, so the key is
		* stable while the same entry stays the winner).
		*/
		let nextEntryKey = 0;
		const entryKeys = /* @__PURE__ */ new WeakMap();
		function entryKeyOf(entry) {
			let key = entryKeys.get(entry);
			if (key === void 0) {
				key = nextEntryKey++;
				entryKeys.set(entry, key);
			}
			return key;
		}
		let nextSessionGenerationKey = 0;
		const sessionGenerationKeys = /* @__PURE__ */ new WeakMap();
		function sessionGenerationKeyOf(binding) {
			let key = sessionGenerationKeys.get(binding.ctx);
			if (key === void 0) {
				key = nextSessionGenerationKey++;
				sessionGenerationKeys.set(binding.ctx, key);
			}
			return key;
		}
		/**
		* Per-entry isolation: one registrant crashing (component render or inject
		* factory) must not take down siblings. Assembly errors (missing providers)
		* rethrow — a miswired shell must fail loud, not degrade into fallbacks.
		* Every catch reports through `onEntryError` (the ledger's supervision
		* seam); for shadowing kinds the report abdicates the entry, the outlet
		* re-renders onto the cell's next survivor, and this boundary's crash face
		* only shows until that re-render lands (permanently once the cell is dry —
		* the outlet then owns the crash face).
		*/
		var SlotErrorBoundary = class extends react.Component {
			state = { failed: false };
			static getDerivedStateFromError(error) {
				if (error instanceof SlotAssemblyError) throw error;
				return { failed: true };
			}
			componentDidCatch(error) {
				console.error(`slot entry crashed in '${this.props.slotKey}':`, error);
				this.props.onEntryError(error);
			}
			render() {
				const Anchor = this.props.anchor ?? "div";
				if (this.state.failed) return (0, react_jsx_runtime.jsx)(Anchor, { "data-slot-error": this.props.slotKey });
				return this.props.children;
			}
		};
		/** Contain one Factory occurrence without retiring the shared definition. */
		var FactoryErrorBoundary = class extends react.Component {
			state = { failed: false };
			static getDerivedStateFromError(error) {
				if (error instanceof SlotAssemblyError) throw error;
				return { failed: true };
			}
			componentDidCatch(error) {
				console.error(`slot factory occurrence crashed in '${this.props.name}':`, error);
				this.props.onEntryError(error);
			}
			render() {
				if (this.state.failed) return (0, react_jsx_runtime.jsx)("div", { "data-factory-error": this.props.name });
				return this.props.children;
			}
		};
		const rootStandardCache = /* @__PURE__ */ new WeakMap();
		const sessionStandardCache = /* @__PURE__ */ new WeakMap();
		const sessionMaybeStandardCache = /* @__PURE__ */ new WeakMap();
		/** Materialize one binding into stable framework Hook and plain-prop seats. */
		function materializeStandardBinding(binding, optional, defaultKey) {
			const standard = { ...binding.props };
			for (const [name, source] of Object.entries(binding.hooks)) {
				if (source === void 0 && !optional) throw new SlotAssemblyError(`strict standard hook '${name}' has no source`);
				standard[(0, _deepseek_ai_dsh_client_ui_slots.standardHookPropName)(name)] = optional ? maybeObservableHook(source) : observableHook(source);
			}
			for (const [name, source] of Object.entries(binding.keyedHooks)) {
				if (source === void 0 && !optional) throw new SlotAssemblyError(`strict keyed standard hook '${name}' has no source resolver`);
				standard[(0, _deepseek_ai_dsh_client_ui_slots.standardHookPropName)(name)] = keyedObservableHook(source, defaultKey);
			}
			return standard;
		}
		/** Stable official-props object used by contextual Hook factories. */
		function standardProps(scope, rootBinding, scopeBinding) {
			let root = rootStandardCache.get(rootBinding);
			if (root === void 0) {
				root = materializeStandardBinding(rootBinding, false);
				rootStandardCache.set(rootBinding, root);
			}
			if (scope === "root") return root;
			if (scopeBinding === void 0) throw new SlotAssemblyError(`scope '${scope}' rendered without a standard-source binding`);
			const cache = scope === "session" ? sessionStandardCache : sessionMaybeStandardCache;
			let perScope = cache.get(rootBinding);
			if (perScope === void 0) {
				perScope = /* @__PURE__ */ new WeakMap();
				cache.set(rootBinding, perScope);
			}
			let standard = perScope.get(scopeBinding);
			if (standard !== void 0) return standard;
			standard = {
				...materializeStandardBinding(rootBinding, false, scopeBinding.key),
				...materializeStandardBinding(scopeBinding, scope === "session-maybe")
			};
			perScope.set(scopeBinding, standard);
			return standard;
		}
		const scopeAreaCache = /* @__PURE__ */ new WeakMap();
		/** Bind one domain-owned scope area renderer to the current scope binding. */
		function scopeAreaProvider(adapter) {
			let Provider = scopeAreaCache.get(adapter);
			if (Provider !== void 0) return Provider;
			if (adapter.renderArea === void 0) throw new SlotAssemblyError("scope 'session' adapter does not provide its area renderer");
			const renderArea = adapter.renderArea.bind(adapter);
			Provider = function ScopeAreaProvider(props) {
				const inherited = useScopeBinding();
				const explicit = Object.hasOwn(props, "session");
				const source = adapter.bindingSource(props.session);
				const resolved = (0, react.useSyncExternalStore)((listener) => source.subscribe(listener), () => source.getSnapshot(), () => source.getSnapshot());
				const binding = explicit ? resolved : inherited;
				return (0, react_jsx_runtime.jsx)(ScopeBindingProvider, {
					binding,
					children: renderArea(binding, props)
				});
			};
			scopeAreaCache.set(adapter, Provider);
			return Provider;
		}
		/**
		* Standard-kit synthesis shared by both scope branches: the global
		* useSessions/useWorkspaces hooks, the per-session provide bundle (every
		* `hooks` source becomes a `use<Name>` selector hook — useSession is the
		* runtime's own 'session' contribution, no special case — and `props` spread
		* verbatim), the store pair when declared, the renderSlot binding when
		* children are declared, and the SessionProvider seat when the children
		* declare a session-scope slot. Hosts hand out BARE observable sources
		* (hooks never cross the host contract); every hook is bound HERE, cached
		* per source (observableHook), so spreading a fresh kit object per render
		* never churns child subscriptions.
		*/
		function standardKit(host, entry, scope, rootBinding, scopeBinding) {
			const standard = standardProps(scope, rootBinding, scopeBinding);
			const kit = {
				...standard,
				renderFactorySlot: boundRenderFactorySlot(entry)
			};
			if (entry.locale !== void 0) {
				const face = host.locale;
				if (face === void 0) throw new SlotAssemblyError(`entry declares locale namespace '${entry.locale}' but no locale face is installed (locale plugin missing from the composition?)`);
				kit["t"] = localeSeat(face, entry.locale);
			}
			const scopedStoreBinding = scopeBinding?.key === void 0 ? void 0 : scopeBinding;
			const store = host.storeOf(entry, scopedStoreBinding);
			if (store !== void 0) {
				kit["useStore"] = observableHook(store);
				kit["actions"] = store.actions;
			}
			if (entry.children !== void 0) {
				kit["renderSlot"] = boundRenderSlot(host, entry);
				if (Object.values(entry.children).some((spec) => spec.kind === "chain")) kit["renderSlotChain"] = boundRenderSlotChain(host, entry);
				if (Object.values(entry.children).some((spec) => spec.scope !== "root")) {
					const adapter = host.scope("session");
					if (adapter === void 0) throw new SlotAssemblyError("entry declares a session child without an installed 'session' scope adapter");
					kit["SessionProvider"] = scopeAreaProvider(adapter);
				}
			}
			return {
				kit,
				standard,
				actions: store?.actions
			};
		}
		/**
		* One rendered entry: standard kit + cached entry inject + common slot inject
		* + owner props (owner wins). The shares are erased at this render boundary;
		* the registration and renderSlot seams already proved their contracts.
		*/
		function ContextualEntry({ slotKey, Comp, kit, standard, injected, slotInjected, ownerProps, hookContext, hasHookContext }) {
			const contextual = (0, react.useMemo)(() => {
				if (!hasHookContext) throw new SlotAssemblyError(`slot '${slotKey}' has contextual injected Hooks but no hookContext`);
				return bindSlotHookFactories(slotInjected.slotHookFactories, standard, hookContext);
			}, [
				hasHookContext,
				hookContext,
				slotInjected.slotHookFactories,
				slotKey,
				standard
			]);
			return (0, react_jsx_runtime.jsx)(Comp, {
				...kit,
				...injected,
				...slotInjected.props,
				...contextual,
				...ownerProps
			});
		}
		function renderEntry(slotKey, Comp, kit, standard, injected, slotInjected, ownerProps, hookContext, hasHookContext) {
			if (slotInjected.slotHookFactories === void 0) return (0, react_jsx_runtime.jsx)(Comp, {
				...kit,
				...injected,
				...slotInjected.props,
				...ownerProps
			});
			return (0, react_jsx_runtime.jsx)(ContextualEntry, {
				slotKey,
				Comp,
				kit,
				standard,
				injected,
				slotInjected,
				ownerProps,
				hookContext,
				hasHookContext
			});
		}
		function SessionEntry({ entry, ownerProps, binding, slotKey, slotInjected, hookContext, hasHookContext }) {
			const host = useHost();
			const rootBinding = useRootBinding();
			const Comp = entry.component;
			const { kit, standard, actions } = standardKit(host, entry, "session", rootBinding, binding);
			return renderEntry(slotKey, Comp, kit, standard, cachedSessionInject(entry, binding, actions), slotInjected, ownerProps, hookContext, hasHookContext);
		}
		function SessionMaybeEntryBody({ entry, ownerProps, binding, slotKey, slotInjected, hookContext, hasHookContext }) {
			const host = useHost();
			const rootBinding = useRootBinding();
			const Comp = entry.component;
			const { kit, standard, actions } = standardKit(host, entry, "session-maybe", rootBinding, binding);
			return renderEntry(slotKey, Comp, kit, standard, cachedSessionMaybeInject(entry, binding, actions), slotInjected, ownerProps, hookContext, hasHookContext);
		}
		/**
		* Session-maybe identity: adoption — the ONLY behavior (there is no
		* hold-identity-forever mode). An incarnation born session-less ADOPTS the
		* first session that arrives: identity holds across that one transition
		* (undefined → first id), so a blank shell's DOM survives the moment a
		* session appears. From then on the entry behaves exactly like a strict
		* session entry: switching to a DIFFERENT session remounts (component-local
		* state must not leak between sessions), and dropping back to no-session
		* remounts into a fresh blank incarnation, which will adopt again.
		* Component-local per-session state therefore clears by construction; state
		* that must SURVIVE a switch belongs in session-bound sources (machine,
		* store, hooks) — the existing layering rule, now load-bearing.
		*/
		function SessionMaybeEntry({ entry, ownerProps, slotKey, slotInjected, hookContext, hasHookContext }) {
			const binding = useScopeBinding();
			const epoch = useMaybeIncarnation(binding);
			return (0, react_jsx_runtime.jsx)(SessionMaybeEntryBody, {
				entry,
				ownerProps,
				binding,
				slotKey,
				slotInjected,
				hookContext,
				hasHookContext
			}, epoch);
		}
		const FIRST_INCARNATION = {
			adopted: void 0,
			epoch: 0
		};
		function useMaybeIncarnation(binding) {
			const identity = binding.key === void 0 ? void 0 : binding.ctx;
			const [state, setState] = (0, react.useState)(FIRST_INCARNATION);
			let { adopted, epoch } = state;
			if (identity !== void 0 && adopted === void 0) {
				adopted = identity;
				setState({
					adopted,
					epoch
				});
			} else if (adopted !== void 0 && identity !== void 0 && identity !== adopted) {
				adopted = identity;
				epoch += 1;
				setState({
					adopted,
					epoch
				});
			} else if (adopted !== void 0 && identity === void 0) {
				adopted = void 0;
				epoch += 1;
				setState({
					adopted,
					epoch
				});
			}
			return epoch;
		}
		function RootEntry({ entry, ownerProps, slotKey, slotInjected, hookContext, hasHookContext }) {
			const host = useHost();
			const rootBinding = useRootBinding();
			const Comp = entry.component;
			const { kit, standard, actions } = standardKit(host, entry, "root", rootBinding, void 0);
			return renderEntry(slotKey, Comp, kit, standard, cachedRootInject(entry, actions), slotInjected, ownerProps, hookContext, hasHookContext);
		}
		const FactoryOccurrenceContext = (0, react.createContext)(null);
		const FactoryAncestryContext = (0, react.createContext)(/* @__PURE__ */ new Set());
		const EMPTY_FACTORY_SELECTION = {};
		function useFactorySlotRuntime(name, fallback) {
			const occurrence = (0, react.useContext)(FactoryOccurrenceContext);
			if (occurrence === null) throw new SlotAssemblyError("useFactorySlot() called outside a Factory occurrence");
			if (!occurrence.host.isFactoryLive(occurrence.definition)) throw new _deepseek_ai_dsh_client_ui_slots.StaleAuthorizationError(`useFactorySlot('${name}') from a disposed Factory`);
			const declared = occurrence.definition.slots?.[name];
			if (declared === void 0) throw new _deepseek_ai_dsh_client_ui_slots.SlotOwnershipError(`local slot '${name}' is not declared by factory '${occurrence.definition.name}'`);
			const selected = occurrence.selected[name];
			const Selected = selected ?? fallback;
			const usesFallback = selected === void 0;
			const { definition, host } = occurrence;
			return (0, react.useMemo)(function bindFactoryLocalComponent() {
				return function BoundFactoryLocalComponent(localProps) {
					const current = (0, react.useContext)(FactoryOccurrenceContext);
					const localScopeBinding = useScopeBinding();
					const localMaybeEpoch = useMaybeIncarnation(localScopeBinding);
					if (!host.isFactoryLive(definition)) throw new _deepseek_ai_dsh_client_ui_slots.StaleAuthorizationError(`local slot '${name}' from a disposed Factory`);
					if (current === null || current.definition !== definition) throw new _deepseek_ai_dsh_client_ui_slots.SlotOwnershipError(`local slot '${name}' rendered outside factory '${definition.name}'`);
					if (declared.scope === "session" && localScopeBinding.key === void 0) throw new SlotAssemblyError(`strict session local slot '${name}' from factory '${definition.name}' rendered without a scope binding`);
					const localOwner = usesFallback ? definition : current.caller;
					const localScopeIdentity = declared.scope === "root" ? "root" : declared.scope === "session" ? `session:${sessionGenerationKeyOf(localScopeBinding)}` : `session-maybe:${localMaybeEpoch}`;
					const localStandard = standardProps(declared.scope, current.rootBinding, localScopeBinding);
					const localRegistrationKit = {
						...current.registrationKit,
						renderFactorySlot: boundRenderFactorySlot(localOwner)
					};
					assertNoPropOverlap(`factory '${definition.name}' local slot '${name}'`, localRegistrationKit, localStandard);
					const provided = {
						...localRegistrationKit,
						...localStandard
					};
					assertNoPropOverlap(`factory '${definition.name}' local slot '${name}'`, provided, localProps);
					return (0, react_jsx_runtime.jsx)(FactoryErrorBoundary, {
						name: `${definition.name}:${name}`,
						onEntryError: (error) => {
							host.reportFactoryError(definition.name, localOwner, error);
						},
						children: (0, react_jsx_runtime.jsx)(Selected, {
							...provided,
							...localProps
						})
					}, `${definition.name}:${name}:${localScopeIdentity}`);
				};
			}, [
				Selected,
				declared.scope,
				definition,
				host,
				name,
				usesFallback
			]);
		}
		function assertNoPropOverlap(owner, provided, received) {
			for (const name of Object.keys(received)) if (Object.hasOwn(provided, name)) throw new SlotAssemblyError(`${owner} received duplicate prop '${name}'`);
		}
		function factoryKit(host, definition, rootBinding, scopeBinding, occurrence) {
			const standard = standardProps(definition.scope, rootBinding, scopeBinding);
			const registrationKit = { renderFactorySlot: boundRenderFactorySlot(definition) };
			if (definition.locale !== void 0) {
				const face = host.locale;
				if (face === void 0) throw new SlotAssemblyError(`factory declares locale namespace '${definition.locale}' but no locale face is installed`);
				registrationKit["t"] = localeSeat(face, definition.locale);
			}
			const scoped = scopeBinding?.key === void 0 ? void 0 : scopeBinding;
			const store = host.factoryStoreOf(definition, scoped, occurrence);
			if (store !== void 0) {
				registrationKit["useStore"] = observableHook(store);
				registrationKit["actions"] = store.actions;
			}
			if (definition.children !== void 0) {
				registrationKit["renderSlot"] = boundFactoryRenderSlot(host, definition);
				if (Object.values(definition.children).some((spec) => spec.kind === "chain")) registrationKit["renderSlotChain"] = boundFactoryRenderSlotChain(host, definition);
				if (Object.values(definition.children).some((spec) => spec.scope !== "root")) {
					const sessionAdapter = host.scope("session");
					if (sessionAdapter === void 0) throw new SlotAssemblyError("factory declares a session child without an installed 'session' scope adapter");
					registrationKit["SessionProvider"] = scopeAreaProvider(sessionAdapter);
				}
			}
			return {
				kit: {
					...standard,
					...registrationKit
				},
				registrationKit,
				actions: store?.actions
			};
		}
		function FactoryOccurrence({ definition, inputProps, selected, caller, binding, maybeEpoch }) {
			if (definition.scope === "root") return (0, react_jsx_runtime.jsx)(FactoryOccurrenceBody, {
				definition,
				inputProps,
				selected,
				caller
			});
			if (definition.scope === "session") {
				if (binding.key === void 0) throw new SlotAssemblyError(`strict session factory '${definition.name}' rendered without a scope binding`);
				return (0, react_jsx_runtime.jsx)(FactoryOccurrenceBody, {
					definition,
					inputProps,
					selected,
					caller,
					scopeBinding: binding
				}, sessionGenerationKeyOf(binding));
			}
			return (0, react_jsx_runtime.jsx)(FactoryOccurrenceBody, {
				definition,
				inputProps,
				selected,
				caller,
				scopeBinding: binding
			}, maybeEpoch);
		}
		function FactoryOccurrenceBody({ definition, inputProps, selected, caller, scopeBinding }) {
			const host = useHost();
			const rootBinding = useRootBinding();
			const occurrence = (0, react.useRef)({}).current;
			const localeRevision = useLocaleRevision(host.locale);
			(0, react.useEffect)(() => host.retainFactoryOccurrence(definition, occurrence), [
				definition,
				host,
				occurrence
			]);
			const { kit, registrationKit, actions } = (0, react.useMemo)(() => factoryKit(host, definition, rootBinding, scopeBinding, occurrence), [
				definition,
				host,
				localeRevision,
				occurrence,
				rootBinding,
				scopeBinding
			]);
			const injected = (0, react.useMemo)(() => runInject(definition, scopeBinding, actions), [
				actions,
				definition,
				scopeBinding
			]);
			assertNoPropOverlap(`factory '${definition.name}' inject`, kit, injected);
			const provided = {
				...kit,
				...injected,
				useFactorySlot: useFactorySlotRuntime
			};
			assertNoPropOverlap(`factory '${definition.name}' occurrence`, provided, inputProps);
			const context = (0, react.useMemo)(() => ({
				host,
				definition,
				selected,
				registrationKit: {
					...registrationKit,
					...injected
				},
				rootBinding,
				caller
			}), [
				caller,
				definition,
				host,
				injected,
				registrationKit,
				rootBinding,
				selected
			]);
			const Comp = definition.component;
			return (0, react_jsx_runtime.jsx)(FactoryOccurrenceContext.Provider, {
				value: context,
				children: (0, react_jsx_runtime.jsx)(Comp, {
					...provided,
					...inputProps
				})
			});
		}
		function FactoryOutlet({ name, inputProps, slots: selected = EMPTY_FACTORY_SELECTION, fallback, caller }) {
			const host = useHost();
			const ancestors = (0, react.useContext)(FactoryAncestryContext);
			const binding = useScopeBinding();
			const maybeEpoch = useMaybeIncarnation(binding);
			const version = (0, react.useSyncExternalStore)((listener) => host.subscribeFactory(name, listener), () => host.getFactoryVersion(name));
			const definition = host.factoryOf(name);
			const nextAncestors = (0, react.useMemo)(() => new Set(ancestors).add(name), [ancestors, name]);
			if (definition === void 0) return (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: fallback ?? null });
			if (ancestors.has(name)) throw new _deepseek_ai_dsh_client_ui_slots.SlotOwnershipError(`recursive render of factory '${name}'`);
			for (const localName of Object.keys(selected)) if (definition.slots?.[localName] === void 0) throw new _deepseek_ai_dsh_client_ui_slots.SlotOwnershipError(`local slot '${localName}' is not declared by factory '${name}'`);
			const scopeIdentity = definition.scope === "root" ? "root" : definition.scope === "session" ? binding.key === void 0 ? "session:absent" : `session:${sessionGenerationKeyOf(binding)}` : `session-maybe:${maybeEpoch}`;
			return (0, react_jsx_runtime.jsx)(FactoryErrorBoundary, {
				name,
				onEntryError: (error) => {
					host.reportFactoryError(name, definition, error);
				},
				children: (0, react_jsx_runtime.jsx)(FactoryAncestryContext.Provider, {
					value: nextAncestors,
					children: (0, react_jsx_runtime.jsx)(FactoryOccurrence, {
						definition,
						inputProps,
						selected,
						caller,
						binding,
						maybeEpoch
					})
				})
			}, `${name}:${version}:${scopeIdentity}`);
		}
		function StrictSessionEntry({ slotKey, anchor, entry, ownerProps, slotInjected, hookContext, hasHookContext, onEntryError }) {
			const binding = useScopeBinding();
			if (binding.key === void 0) throw new SlotAssemblyError(`strict session slot '${slotKey}' rendered without a scope binding`);
			const scopedBinding = binding;
			return (0, react_jsx_runtime.jsx)(SlotErrorBoundary, {
				slotKey,
				anchor,
				onEntryError,
				children: (0, react_jsx_runtime.jsx)(SessionEntry, {
					entry,
					ownerProps,
					binding: scopedBinding,
					slotKey,
					slotInjected,
					hookContext,
					hasHookContext
				})
			}, sessionGenerationKeyOf(scopedBinding));
		}
		/**
		* Anchor style shared by every outlet wrapper: `display:contents` keeps the
		* wrapper out of layout (grid/flex parents see the slot's own children), so
		* the anchor is purely addressable surface. Module-level constant — a stable
		* reference so the wrapper never diffs its style prop.
		*/
		const ANCHOR_STYLE = { display: "contents" };
		function SlotOutlet({ slotKey, ownerProps, opts, declaredInline }) {
			const host = useHost();
			(0, react.useSyncExternalStore)((fn) => host.subscribe(slotKey, fn), () => host.getVersion(slotKey));
			useLocaleRevision(host.locale);
			const scopeBinding = useScopeBinding();
			const spec = host.specOf(slotKey);
			return (0, react_jsx_runtime.jsx)((spec === void 0 ? declaredInline : spec.inline === true) ? "span" : "div", {
				"data-slot": slotKey,
				style: ANCHOR_STYLE,
				children: spec === void 0 ? null : renderOutletContent(host, slotKey, ownerProps, opts, scopeBinding, spec)
			});
		}
		/** Kind dispatch behind the outlet anchor (single/keyed/list/chain, fallbacks, crash faces). */
		function renderOutletContent(host, slotKey, ownerProps, opts, scopeBinding, spec) {
			const Anchor = spec.inline === true ? "span" : "div";
			if (spec.kind === "chain" && opts?.fallbackOnly === true) return renderChainResult(slotKey, null, opts, Anchor);
			if (spec.scope === "session" && scopeBinding.key === void 0) throw new SlotAssemblyError(`strict session slot '${slotKey}' rendered without a scope binding`);
			const entries = host.entriesOf(slotKey);
			const slotInjected = cachedSlotInject(spec.inject);
			const guarded = (entry, key, owner = ownerProps) => {
				const hasHookContext = opts !== void 0 && Object.hasOwn(opts, "hookContext");
				const hookContext = opts?.hookContext;
				const onEntryError = (error) => {
					host.reportEntryError(slotKey, entry, error, { abdicate: spec.kind !== "chain" });
				};
				return spec.scope === "session" ? (0, react_jsx_runtime.jsx)(StrictSessionEntry, {
					slotKey,
					anchor: Anchor,
					entry,
					ownerProps: owner,
					slotInjected,
					hookContext,
					hasHookContext,
					onEntryError
				}, key) : (0, react_jsx_runtime.jsx)(SlotErrorBoundary, {
					slotKey,
					anchor: Anchor,
					onEntryError,
					children: spec.scope === "session-maybe" ? (0, react_jsx_runtime.jsx)(SessionMaybeEntry, {
						entry,
						ownerProps: owner,
						slotKey,
						slotInjected,
						hookContext,
						hasHookContext
					}) : (0, react_jsx_runtime.jsx)(RootEntry, {
						entry,
						ownerProps: owner,
						slotKey,
						slotInjected,
						hookContext,
						hasHookContext
					})
				}, key);
			};
			const deadCell = () => (0, react_jsx_runtime.jsx)(Anchor, { "data-slot-error": slotKey });
			if (spec.kind === "single") {
				const entry = host.entriesOfSlot(slotKey)[0];
				if (!entry) return entries.length > 0 ? deadCell() : (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: opts?.fallback ?? null });
				return guarded(entry, entryKeyOf(entry));
			}
			if (spec.kind === "keyed") {
				const entry = host.entriesOfSlot(slotKey).find((e) => e.options.key === opts?.entryKey);
				if (!entry) return entries.some((e) => e.options.key === opts?.entryKey) ? deadCell() : (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: opts?.fallback ?? null });
				return guarded(entry, entryKeyOf(entry));
			}
			if (spec.kind === "chain") {
				let elected = null;
				for (const entry of entries) {
					let matched;
					try {
						matched = entry.select(ownerProps);
					} catch (error) {
						console.error(`chain selector crashed in '${slotKey}' (${entry.registrant ?? "unknown registrant"}), treating as declined:`, error);
						continue;
					}
					if (matched !== null) {
						elected = guarded(entry, entryKeyOf(entry), {
							...ownerProps,
							matched
						});
						break;
					}
				}
				return renderChainResult(slotKey, elected, opts, Anchor);
			}
			const rows = host.entriesOfSlot(slotKey).map((entry) => ({
				entry,
				id: entry.options.id,
				order: entry.options.order ?? 0
			}));
			const rowIds = new Set(rows.map((row) => row.id));
			for (const entry of entries) {
				if (rowIds.has(entry.options.id)) continue;
				rowIds.add(entry.options.id);
				rows.push({
					entry: void 0,
					id: entry.options.id,
					order: entry.options.order ?? 0
				});
			}
			let list = [...rows].sort((a, b) => a.order - b.order);
			if (opts?.only !== void 0) list = list.filter((item) => item.id === opts.only);
			if (list.length === 0) return (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: opts?.fallback ?? null });
			return (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: list.map((item, i) => item.entry !== void 0 ? guarded(item.entry, `e${entryKeyOf(item.entry)}`) : (0, react_jsx_runtime.jsx)(Anchor, { "data-slot-error": slotKey }, `x${item.id ?? i}`)) });
		}
		/** Render a chain election while preserving the overlay fallback's tree position. */
		function renderChainResult(slotKey, elected, opts, Anchor) {
			if (!opts?.overlay) return elected ?? (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: opts?.fallback ?? null });
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(Anchor, {
				"data-chain-overlay-fallback": slotKey,
				style: { display: elected === null ? "contents" : "none" },
				children: opts.fallback ?? null
			}), elected] });
		}
		/** Root outlet: the shell's single ctx-level render entry — an unregistered 'root' is a boot-order failure, never a silent blank. */
		function RootOutlet({ ownerProps }) {
			const host = useHost();
			(0, react.useSyncExternalStore)((fn) => host.subscribe("root", fn), () => host.getVersion("root"));
			useLocaleRevision(host.locale);
			const entry = host.entriesOfSlot("root")[0];
			if (!entry) {
				if (host.entriesOf("root").length > 0) return (0, react_jsx_runtime.jsx)("div", { "data-slot-error": "root" });
				throw new SlotAssemblyError("renderSlot('root') before any 'root' registration (boot order)");
			}
			return (0, react_jsx_runtime.jsx)("div", {
				"data-slot": "root",
				style: ANCHOR_STYLE,
				children: (0, react_jsx_runtime.jsx)(SlotErrorBoundary, {
					slotKey: "root",
					onEntryError: (error) => {
						host.reportEntryError("root", entry, error, { abdicate: true });
					},
					children: (0, react_jsx_runtime.jsx)(RootEntry, {
						entry,
						ownerProps,
						slotKey: "root",
						slotInjected: EMPTY_SLOT_INJECT,
						hookContext: void 0,
						hasHookContext: false
					})
				}, entryKeyOf(entry))
			});
		}
		/**
		* Build the renderer installed into the `ui-renderer` SlotRegistry
		* (ctx.slots.install(createSlotRenderer()) at boot; the service owns the
		* install/renderSlot contract and the double-install/not-installed throws).
		* @returns the renderer.
		*/
		function createSlotRenderer() {
			return { renderRoot(host, ownerProps) {
				return (0, react_jsx_runtime.jsx)(HostContext.Provider, {
					value: host,
					children: (0, react_jsx_runtime.jsx)(RootStandardProvider, { children: (0, react_jsx_runtime.jsx)(ScopeProvider, {
						scope: "session-maybe",
						children: (0, react_jsx_runtime.jsx)(RootOutlet, { ownerProps })
					}) })
				});
			} };
		}
		//#endregion
		//#region lib/types/client/app.js
		/**
		* Build the assembled application factory.
		* @param deps - Active UI-renderer dependencies.
		* @returns Factory producing the application React tree.
		*/
		function buildRenderApp(deps) {
			const { ctx } = deps;
			return () => ctx.slots.renderSlot("root", {});
		}
		//#endregion
		//#region lib/types/client/registry.js
		/**
		* SlotRegistry: the renderer-owned Cordis service over the pure
		* SlotCore (ui-slots owns registration semantics, the declaration ledger,
		* the load-time validations, and the unload cascade). This layer owns what
		* needs a live application: the 'slots/changed' event bridge, register and
		* declaration injection through the caller's ctx.effect (fiber unload
		* collects both), the renderer installation contract (install()/renderSlot('root') +
		* the SlotRendererHost face), and the store INSTANCE axis — handle x scope
		* key -> create/cache, dropped with the last holding entry, and in-memory
		* session instances released without clearing persisted state on scope death.
		*/
		/** Instance key for root-scoped store records (session records key by session id, so the literal cannot collide). */
		const ROOT_INSTANCE_KEY = "root";
		/** cordis Service layer of the slot system; see the module doc for the split with SlotCore. */
		var SlotRegistry = class extends _deepseek_ai_cordis.Service {
			_core = new _deepseek_ai_dsh_client_ui_slots.SlotCore();
			/** Store-instance axis: handle -> mounted scope, refcount, resolved instances. */
			_stores = /* @__PURE__ */ new Map();
			_factoryStores = /* @__PURE__ */ new Map();
			/** Latest live Context generation for each scoped store key. */
			_storeScopeOwners = /* @__PURE__ */ new Map();
			_renderer;
			_locale;
			_host;
			_rootContributions = [];
			_rootListeners = /* @__PURE__ */ new Set();
			_rootBinding = {
				key: void 0,
				hooks: {},
				keyedHooks: {},
				props: {}
			};
			_rootSource = {
				getSnapshot: () => this._rootBinding,
				subscribe: (listener) => {
					this._rootListeners.add(listener);
					return () => {
						this._rootListeners.delete(listener);
					};
				}
			};
			_scopes = /* @__PURE__ */ new Map();
			_scopeRevision = 0;
			_scopeListeners = /* @__PURE__ */ new Set();
			_scopeRevisionSource = {
				getSnapshot: () => this._scopeRevision,
				subscribe: (listener) => {
					this._scopeListeners.add(listener);
					return () => {
						this._scopeListeners.delete(listener);
					};
				}
			};
			/**
			* @param ctx - owning root context.
			*/
			constructor(ctx) {
				super(ctx, "slots");
				this._core.onMutate((key) => {
					ctx.emit("slots/changed", key);
				});
			}
			/**
			* Install an effect for each declaration lifetime of a slot. The callback
			* runs synchronously when the declaration already exists; otherwise it runs
			* inside the declaring `register()` call after the declaration is committed.
			* Collapse disposes the effect and a later declaration runs it again.
			* Callback effects are synchronous disposers; iterable effects install
			* transactionally and dispose in reverse order. The controller belongs to
			* the caller's fiber, so plugin unload cancels a pending wait and removes any
			* active contribution.
			*
			* @param key - declared SlotMap key to depend on.
			* @param callback - creates one disposer or an iterable of disposers.
			* @returns idempotent disposer for the wait and active effect.
			* @throws callback setup failures synchronously when the slot is already declared.
			*/
			inject(key, callback) {
				const ctx = this.ctx;
				const disposeController = ctx.effect(() => {
					let active;
					let activeEpoch;
					let stopped = false;
					let unsubscribe = () => {};
					const stop = () => {
						if (stopped) return;
						stopped = true;
						unsubscribe();
						const dispose = active;
						active = void 0;
						activeEpoch = void 0;
						dispose?.();
					};
					const reconcile = () => {
						if (stopped) return;
						const spec = this._core.specDynamic(key);
						const epoch = this._core.declarationEpoch(key);
						if (active !== void 0 && activeEpoch === epoch) return;
						const dispose = active;
						active = void 0;
						activeEpoch = void 0;
						dispose?.();
						if (spec === void 0) return;
						const disposeEffect = ctx.effect(callback, `slots.inject(${JSON.stringify(key)}): declaration`);
						active = () => {
							disposeEffect();
						};
						activeEpoch = epoch;
					};
					const changed = () => {
						try {
							reconcile();
						} catch (error) {
							if (error?.code === "INACTIVE_EFFECT") {
								stop();
								return;
							}
							stop();
							const failure = error instanceof Error ? error : new Error(String(error));
							queueMicrotask(() => {
								throw failure;
							});
						}
					};
					unsubscribe = this._core.subscribeDeclaration(key, changed);
					try {
						reconcile();
					} catch (error) {
						stop();
						throw error;
					}
					return stop;
				}, `slots.inject(${JSON.stringify(key)})`);
				return () => {
					disposeController();
				};
			}
			/**
			* Install the shell's renderer (ui-renderer's createSlotRenderer product).
			* Boot-once: a second install throws. Runs through the caller's ctx.effect,
			* so shell fiber unload uninstalls the renderer.
			* @param renderer - the outlet machinery implementing SlotRenderer.
			*/
			install(renderer) {
				if (this._renderer !== void 0) throw new Error("slot renderer already installed (install() is boot-once)");
				this.ctx.effect(() => {
					this._renderer = renderer;
					return () => {
						if (this._renderer === renderer) this._renderer = void 0;
					};
				}, "slots.install()");
			}
			/**
			* Install the locale face backing the `t` standard seat (the locale
			* plugin's product; same boot-once discipline as the renderer install).
			* Runs through the caller's ctx.effect, so the installing fiber's unload
			* uninstalls the face.
			* @param face - namespace binder + revision observable.
			*/
			installLocale(face) {
				if (this._locale !== void 0) throw new Error("locale face already installed (installLocale() is boot-once)");
				this.ctx.effect(() => {
					this._locale = face;
					return () => {
						if (this._locale === face) this._locale = void 0;
					};
				}, "slots.installLocale()");
			}
			/**
			* Contribute domain-owned root data. Hook names must be globally unique;
			* registration and disposal republish one atomic root binding.
			* @param contribution - bare sources and stable props.
			* @returns disposer owned by the caller's Cordis fiber.
			*/
			provideRoot(contribution) {
				const dispose = this.ctx.effect(() => {
					this._rootContributions.push(contribution);
					try {
						this.rebuildRootBinding();
					} catch (error) {
						this._rootContributions.pop();
						throw error;
					}
					return () => {
						const index = this._rootContributions.indexOf(contribution);
						if (index === -1) return;
						this._rootContributions.splice(index, 1);
						this.rebuildRootBinding();
					};
				}, "slots.provideRoot()");
				return () => {
					dispose();
				};
			}
			/**
			* Install the owner adapter for one strict scope. Its optional counterpart
			* resolves through the same adapter.
			* @param scope - strict scope name.
			* @param adapter - current/resolved binding source and release notifications.
			*/
			installScope(scope, adapter) {
				if (this._scopes.has(scope)) throw new Error(`slot scope '${scope}' already has an adapter`);
				this.ctx.effect(() => {
					this._scopes.set(scope, adapter);
					this.publishScopeRevision();
					return () => {
						if (this._scopes.get(scope) === adapter) {
							this._scopes.delete(scope);
							this.publishScopeRevision();
						}
					};
				}, `slots.installScope(${JSON.stringify(scope)})`);
			}
			/**
			* Bind scoped Store instances to one Context generation. Rebinding the key
			* drops the previous generation's memory instances before the new owner can
			* resolve them. Cleanup never clears persisted state, which belongs to the
			* durable scope key, or drops a replacement generation's instances.
			*
			* @param binding - materialized scope identity and its owning Context.
			*/
			bindStoreScope(binding) {
				const current = this._storeScopeOwners.get(binding.key);
				if (current === binding.ctx) return;
				if (current !== void 0) this.releaseStoreScope(binding.key);
				this._storeScopeOwners.set(binding.key, binding.ctx);
				binding.ctx.effect(() => () => {
					if (this._storeScopeOwners.get(binding.key) !== binding.ctx) return;
					this._storeScopeOwners.delete(binding.key);
					this.releaseStoreScope(binding.key);
				}, `slots: store scope ${binding.key}`);
			}
			/**
			* The single ctx-level render entry: the shell renders 'root'; every other
			* key renders inside components through the props renderSlot face. All
			* three guards are fail-loud boot-order checks, no fallback.
			* @param key - must be 'root' (runtime-enforced for dynamically composed callers).
			* @param owner - owner share for the root entry (the shell supplies {}).
			* @returns the rendered root tree.
			*/
			renderSlot(key, owner) {
				if (key !== "root") throw new Error(`ctx-level renderSlot only renders 'root' (got "${key}"); child slots render through the component props face`);
				if (this._renderer === void 0) throw new Error("slot renderer not installed — boot must call ctx.slots.install(createSlotRenderer()) before rendering 'root'");
				if (this._core.entries("root").length === 0) throw new Error("'root' has no registration — a layout entry must register into 'root' before the shell renders it");
				return this._renderer.renderRoot(this.hostFace(), owner);
			}
			/**
			* Snapshot entries for a key (render-erased view; stable reference between mutations).
			* @param key - SlotMap key.
			* @returns registered entries.
			*/
			entries(key) {
				return this._core.entries(key);
			}
			/**
			* Shadowing winners per cell for a key: the first live (non-abdicated)
			* entry of each cell in priority order — what outlets render; chain keys
			* pass through unchanged (election consumes every entry). The raw
			* {@link SlotRegistry.entries} view stays the inspection surface. Fresh
			* array per call, not a uSES getSnapshot source.
			* @param key - SlotMap key.
			* @returns the winning entry per occupied cell.
			*/
			entriesOfSlot(key) {
				return this._core.entriesOfSlot(key);
			}
			/**
			* Export the current JSON-safe Slot and Factory declaration trees for read-only inspection.
			* @param root - exact live Slot key or `factory:<name>`; omitted returns all roots.
			* @returns selected composition trees.
			*/
			snapshot(root) {
				return this._core.snapshot(root);
			}
			/**
			* Observe ordinary entry and Factory occurrence crashes through one
			* supervision channel. Fires synchronously after any ordinary-entry
			* abdication mutation. Callers own the disposer (wire it through ctx.effect
			* for fiber-lifetime cleanup, as with {@link SlotRegistry.subscribe}).
			* @param fn - called with the Slot or `factory:<name>` key, crashed
			* registration, cause, and whether an ordinary entry was retired.
			* @returns unsubscribe.
			*/
			onEntryError(fn) {
				return this._core.onEntryError(fn);
			}
			/**
			* Look up a declared spec (register-declared or the built-in 'root').
			* @param key - SlotMap key.
			* @returns spec or undefined.
			*/
			spec(key) {
				return this._core.spec(key);
			}
			/**
			* Subscribe to a key's registration changes (microtask-batched).
			* @param key - SlotMap key.
			* @param fn - change callback.
			* @returns unsubscribe.
			*/
			subscribe(key, fn) {
				return this._core.subscribe(key, fn);
			}
			/**
			* Version counter for uSES pairing.
			* @param key - SlotMap key.
			* @returns current version.
			*/
			getVersion(key) {
				return this._core.getVersion(key);
			}
			/** Delegating registration path: factory minting + registrant stamp + core write + instance-axis bookkeeping. */
			_register(options, component) {
				const store = typeof options.store === "function" ? options.store() : options.store;
				const registrant = options.registrant ?? this.ctx.fiber?.name;
				const erased = {
					...options,
					...store !== void 0 ? { store } : {},
					...registrant !== void 0 ? { registrant } : {}
				};
				const dispose = this._core.register(erased, component);
				if (store !== void 0) {
					const scope = this._core.specDynamic(options.name).scope;
					this._acquire(store, scope);
				}
				let disposed = false;
				return () => {
					if (disposed) return;
					disposed = true;
					dispose();
					if (store !== void 0) this._release(store);
				};
			}
			_registerFactory(options, component) {
				const registrant = this.ctx.fiber?.name;
				const erased = {
					...options,
					...registrant === void 0 ? {} : { registrant }
				};
				const dispose = this._core.registerFactory(erased, component);
				const definition = this._core.factory(options.name);
				if (definition === void 0) throw new Error(`slot factory "${options.name}" disappeared during registration`);
				if (definition.store !== void 0 && typeof definition.store !== "function") this._acquire(definition.store, definition.scope);
				else if (typeof definition.store === "function") this._factoryStores.set(definition, {
					occurrences: /* @__PURE__ */ new WeakMap(),
					mounted: /* @__PURE__ */ new Map()
				});
				let disposed = false;
				return () => {
					if (disposed) return;
					disposed = true;
					dispose();
					this._factoryStores.delete(definition);
					if (definition.store !== void 0 && typeof definition.store !== "function") this._release(definition.store);
				};
			}
			/** Build the domain-neutral host face once; installed adapters remain live through getters. */
			hostFace() {
				if (this._host !== void 0) return this._host;
				const service = this;
				this._host = {
					subscribe: (key, fn) => this._core.subscribe(key, fn),
					getVersion: (key) => this._core.getVersion(key),
					entriesOf: (key) => this._core.entries(key),
					entriesOfSlot: (key) => this._core.entriesOfSlot(key),
					reportEntryError: (key, entry, error, info) => {
						this._core.reportEntryError(key, entry, error, info);
					},
					reportFactoryError: (name, registration, error) => {
						this._core.reportFactoryError(name, registration, error);
					},
					specOf: (key) => this._core.specDynamic(key),
					isLive: (entry) => this._core.isLive(entry),
					storeOf: (entry, scopeBinding) => entry.store === void 0 ? void 0 : this.resolveStore(entry.store, scopeBinding),
					factoryStoreOf: (definition, scopeBinding, occurrence) => this.resolveFactoryStore(definition, scopeBinding, occurrence),
					retainFactoryOccurrence: (definition, occurrence) => this.retainFactoryOccurrence(definition, occurrence),
					subscribeFactory: (name, fn) => this._core.subscribeFactory(name, fn),
					getFactoryVersion: (name) => this._core.factoryVersion(name),
					factoryOf: (name) => this._core.factory(name),
					isFactoryLive: (definition) => this._core.isFactoryLive(definition),
					root: this._rootSource,
					scopeRevision: this._scopeRevisionSource,
					scope: (scope) => service._scopes.get(scope === "session-maybe" ? "session" : scope),
					get locale() {
						return service._locale;
					}
				};
				return this._host;
			}
			/** Validate and atomically publish the current root contribution roster. */
			rebuildRootBinding() {
				const hooks = {};
				const keyedHooks = {};
				const props = {};
				const finalProps = /* @__PURE__ */ new Set();
				for (const contribution of this._rootContributions) {
					copyUnique("hook", hooks, contribution.hooks, finalProps, _deepseek_ai_dsh_client_ui_slots.standardHookPropName);
					copyUnique("keyed hook", keyedHooks, contribution.keyedHooks, finalProps, _deepseek_ai_dsh_client_ui_slots.standardHookPropName);
					copyUnique("prop", props, contribution.props, finalProps, (name) => name);
				}
				this._rootBinding = {
					key: void 0,
					hooks,
					keyedHooks,
					props
				};
				for (const listener of [...this._rootListeners]) try {
					listener();
				} catch (error) {
					console.error("root standard-source subscriber failed:", error);
				}
			}
			/** Publish one installed-scope roster transition after the map is authoritative. */
			publishScopeRevision() {
				this._scopeRevision += 1;
				for (const listener of [...this._scopeListeners]) try {
					listener();
				} catch (error) {
					console.error("scope-adapter subscriber failed:", error);
				}
			}
			/** Resolve (create or reuse) the store instance for a registered handle under a scope key. */
			resolveStore(handle, scopeBinding) {
				const record = this._stores.get(handle);
				if (record === void 0) throw new Error("store handle is not registered (entry unloaded, or the handle never went through register)");
				let key;
				if (record.scope === "root") key = ROOT_INSTANCE_KEY;
				else {
					if (scopeBinding === void 0) throw new Error(`${record.scope} store resolution requires a session id`);
					key = scopeBinding.key;
					this.bindStoreScope(scopeBinding);
				}
				let instance = record.instances.get(key);
				if (instance === void 0) {
					instance = record.scope === "root" ? handle.create() : handle.create(key);
					record.instances.set(key, instance);
				}
				return instance;
			}
			resolveFactoryStore(definition, scopeBinding, occurrence) {
				if (!this._core.isFactoryLive(definition)) throw new _deepseek_ai_dsh_client_ui_slots.StaleAuthorizationError(`slot factory "${definition.name}" is not registered`);
				const declaration = definition.store;
				if (declaration === void 0) return void 0;
				if (typeof declaration !== "function") return this.resolveStore(declaration, scopeBinding);
				const axis = this._factoryStores.get(definition);
				const scopeKey = definition.scope === "root" ? ROOT_INSTANCE_KEY : requireScopeKey(definition, scopeBinding);
				if (scopeBinding !== void 0 && definition.scope !== "root") this.bindStoreScope(scopeBinding);
				let record = axis.occurrences.get(occurrence);
				if (record === void 0) {
					const handle = declaration();
					if (handle.spec.persist !== void 0) throw new SlotAssemblyError(`exclusive store for factory "${definition.name}" cannot declare persistence`);
					record = {
						handle,
						instances: /* @__PURE__ */ new Map(),
						retainers: 0
					};
					axis.occurrences.set(occurrence, record);
				}
				const existing = record.instances.get(scopeKey);
				if (existing !== void 0) return existing;
				const instance = definition.scope === "root" || scopeBinding === void 0 ? record.handle.create() : record.handle.create(scopeBinding.key);
				record.instances.set(scopeKey, instance);
				return instance;
			}
			retainFactoryOccurrence(definition, occurrence) {
				if (!this._core.isFactoryLive(definition)) return () => {};
				if (typeof definition.store !== "function") return () => {};
				const axis = this._factoryStores.get(definition);
				const record = axis.occurrences.get(occurrence);
				record.retainers += 1;
				axis.mounted.set(occurrence, record);
				let released = false;
				return () => {
					if (released) return;
					released = true;
					record.retainers -= 1;
					if (record.retainers !== 0) return;
					axis.mounted.delete(occurrence);
				};
			}
			/** Drop every materialized non-root Store instance for one ended Context generation. */
			releaseStoreScope(key) {
				for (const record of this._stores.values()) {
					if (record.scope === "root") continue;
					record.instances.delete(key);
				}
				for (const axis of this._factoryStores.values()) for (const record of axis.mounted.values()) record.instances.delete(key);
			}
			/** Bind (or re-reference) a handle on the axis; cross-scope conflicts already threw in the core. */
			_acquire(handle, scope) {
				const record = this._stores.get(handle);
				if (record === void 0) {
					this._stores.set(handle, {
						scope,
						refs: 1,
						instances: /* @__PURE__ */ new Map()
					});
					return;
				}
				record.refs += 1;
			}
			/** Drop one reference; the last holder's unload drops the record (instances go with it — engine stores need no explicit dispose). */
			_release(handle) {
				const record = this._stores.get(handle);
				/* v8 ignore next -- defensive: release only runs from a disposer whose
				* register acquired the same handle, so the record must exist; kept so a
				* future call site cannot underflow the axis. */
				if (record === void 0) return;
				record.refs -= 1;
				if (record.refs !== 0) return;
				this._stores.delete(handle);
			}
		};
		function copyUnique(kind, target, values, finalProps, propNameOf) {
			if (values === void 0) return;
			for (const [name, value] of Object.entries(values)) {
				const propName = propNameOf(name);
				if (finalProps.has(propName)) throw new Error(`duplicate root standard ${kind} '${name}' at prop '${propName}'`);
				finalProps.add(propName);
				target[name] = value;
			}
		}
		SlotRegistry.prototype.register = function register(rawOptions, component) {
			const options = rawOptions;
			return this.ctx.effect(() => this["_register"](options, component), "slots.register()");
		};
		SlotRegistry.prototype.registerFactory = function registerFactory(rawOptions, component) {
			const options = rawOptions;
			return this.ctx.effect(() => this["_registerFactory"](options, component), "slots.registerFactory()");
		};
		function requireScopeKey(definition, binding) {
			if (binding === void 0) throw new Error(`${definition.scope} factory store resolution requires a session id`);
			return binding.key;
		}
		//#endregion
		//#region lib/types/client/index.js
		/**
		* Browser UI renderer. It installs the slot renderer after its Cordis
		* dependencies activate and exposes the mount operation used by the web boot
		* kernel after the complete client roster settles.
		*/
		/** Services required before application assembly. */
		const inject = [];
		/** Hydrate the kernel-owned loading DOM before replacing it with the application. */
		function BootHandoff(props) {
			const [ready, setReady] = (0, react.useState)(false);
			(0, react.useLayoutEffect)(() => {
				setReady(true);
			}, []);
			if (ready) return props.app();
			return (0, react.createElement)("div", {
				className: props.boot.className,
				"data-dsh-boot": "",
				dangerouslySetInnerHTML: { __html: props.boot.html }
			});
		}
		/** Mount React while preserving the framework-free boot DOM through hydration. */
		function mountApp(container, app) {
			const boot = container.querySelector(":scope > [data-dsh-boot]");
			if (boot !== null) return (0, react_dom_client.hydrateRoot)(container, (0, react.createElement)(BootHandoff, {
				app,
				boot: {
					className: boot.className,
					html: boot.innerHTML
				}
			}));
			const root = (0, react_dom_client.createRoot)(container);
			(0, react_dom.flushSync)(() => {
				root.render(app());
			});
			return root;
		}
		/**
		* Install the slot renderer and provide the application mount face.
		* @param ctx - Plugin context.
		*/
		function apply(ctx) {
			new SlotRegistry(ctx).install(createSlotRenderer());
			ctx.reflect.provide("uiRenderer", { mount: (container) => {
				const root = mountApp(container, buildRenderApp({ ctx }));
				return () => {
					root.unmount();
				};
			} });
		}
		//#endregion
		exports.SlotRegistry = SlotRegistry;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
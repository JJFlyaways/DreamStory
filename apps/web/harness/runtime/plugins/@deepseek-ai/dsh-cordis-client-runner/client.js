window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-cordis-client-runner",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		//#endregion
		let _deepseek_ai_cordis = require("@deepseek-ai/cordis");
		let react = require("react");
		react = __toESM(react, 1);
		//#region ../../../vendor/timer/src/index.ts
		/** Disposable timer helpers mixed into Cordis contexts. */
		var TimerService = class extends _deepseek_ai_cordis.Service {
			constructor(ctx) {
				super(ctx, "timer");
				ctx.mixin("timer", [
					"timeout",
					"interval",
					"throttle",
					"debounce",
					"setTimeout",
					"setInterval"
				]);
			}
			/** @deprecated use `ctx.timeout()` instead */
			setTimeout(callback, delay) {
				return this.timeout(callback, delay);
			}
			/** @deprecated use `ctx.interval()` instead */
			setInterval(callback, delay) {
				return this.interval(callback, delay);
			}
			timeout(...args) {
				const callback = typeof args[0] === "function" ? args.shift() : void 0;
				const delay = args[0];
				if (callback) {
					const dispose = this.ctx.effect(() => {
						const timer = setTimeout(() => {
							dispose();
							callback();
						}, delay);
						return () => clearTimeout(timer);
					}, "ctx.timeout()");
					return dispose;
				} else {
					const { promise, resolve, reject } = Promise.withResolvers();
					const dispose = this.ctx.effect(() => {
						const timer = setTimeout(resolve, delay);
						return () => {
							clearTimeout(timer);
							reject(/* @__PURE__ */ new Error("Context has been disposed"));
						};
					}, "ctx.timeout()");
					return promise.finally(dispose);
				}
			}
			interval(...args) {
				const callback = typeof args[0] === "function" ? args.shift() : void 0;
				const delay = args[0];
				if (callback) return this.ctx.effect(() => {
					const timer = setInterval(callback, delay);
					return () => clearInterval(timer);
				}, "ctx.interval()");
				else {
					let done;
					const nextTasks = [];
					const dispose = this.ctx.effect(() => {
						const timer = setInterval(() => {
							nextTasks.shift()?.resolve({
								done: false,
								value: void 0
							});
						}, delay);
						return () => {
							clearInterval(timer);
							if (done) return;
							done = {
								kind: "throw",
								reason: /* @__PURE__ */ new Error("Context has been disposed")
							};
							for (const task of nextTasks.splice(0)) task.reject(done.reason);
						};
					}, "ctx.interval()");
					return {
						next: () => {
							if (!done) {
								const task = Promise.withResolvers();
								nextTasks.push(task);
								return task.promise;
							}
							if (done.kind === "return") return Promise.resolve({
								done: true,
								value: done.value
							});
							return Promise.reject(done.reason);
						},
						return: (value) => {
							if (!done) done = {
								kind: "return",
								value
							};
							for (const task of nextTasks.splice(0)) task.resolve({
								done: true,
								value
							});
							dispose();
							return Promise.resolve({
								done: true,
								value
							});
						},
						throw: (reason) => {
							if (!done) done = {
								kind: "throw",
								reason
							};
							for (const task of nextTasks.splice(0)) task.reject(reason);
							dispose();
							return Promise.resolve({
								done: true,
								value: void 0
							});
						},
						[Symbol.asyncIterator]() {
							return this;
						}
					};
				}
			}
			_schedule(label, trigger) {
				let timer;
				let isDisposed = false;
				const dispose = this.ctx.effect(() => () => {
					isDisposed = true;
					clearTimeout(timer);
					timer = void 0;
				}, label);
				const wrapper = (...args) => {
					if (isDisposed) return;
					clearTimeout(timer);
					timer = trigger(args);
				};
				wrapper.dispose = dispose;
				return wrapper;
			}
			/** Return a throttled function whose timer is disposed with the current fiber. */
			throttle(callback, delay, noTrailing) {
				let lastCall = -Infinity;
				const execute = (...args) => {
					lastCall = Date.now();
					callback(...args);
				};
				return this._schedule("ctx.throttle()", (args) => {
					const remaining = delay - Date.now() + lastCall;
					if (remaining <= 0) execute(...args);
					else if (!noTrailing) return setTimeout(execute, remaining, ...args);
				});
			}
			/** Return a debounced function whose timer is disposed with the current fiber. */
			debounce(callback, delay) {
				return this._schedule("ctx.debounce()", (args) => {
					return setTimeout(callback, delay, ...args);
				});
			}
		};
		//#endregion
		//#region lib/types/client/evaluator.js
		/**
		* Browser-half closure evaluation: the package source runs as the body of an
		* async function whose parameters ARE the symbol surface. Shadowing parameters
		* (setTimeout/fetch/require/…) turn the ambient browser globals into teaching
		* redirects without touching the page. The host syntax-prechecked the source at
		* define time; SyntaxError handling here is the engine-divergence fallback and
		* reaches the model through the load report.
		*/
		const TIMER_REDIRECT = "browser timer globals are unavailable in dynamic packages. Declare inject: ['timer'] on the returned plugin, query Client Service.listService for the exact API, and close over that plugin ctx. In React, create timers from an event handler or React.useEffect and return callback-form disposers from the effect cleanup.";
		/**
		* Where each withheld browser global sends the author instead. One home for two
		* consumers: the closure traps below throw these, and a render crash whose
		* message names one of them gets the same redirect appended — a package that
		* reached the global some other way (`window.setInterval`) crashes with the
		* engine's own bare text, and the author needs the redirect either way.
		*/
		const DYNAMIC_CLIENT_REDIRECTS = {
			setTimeout: TIMER_REDIRECT,
			setInterval: TIMER_REDIRECT,
			clearTimeout: TIMER_REDIRECT,
			clearInterval: TIMER_REDIRECT,
			fetch: "network belongs to the HOST half: register a handler there with harness.handle(method, fn) and call it here via host.call(method, args).",
			require: "modules cannot be imported here. React arrives as the `React` closure symbol; everything else goes through ctx services or host.call."
		};
		/** Callable teaching traps shadowing the ambient globals the closure must not reach. */
		function closureTraps() {
			const traps = {};
			for (const [name, redirect] of Object.entries(DYNAMIC_CLIENT_REDIRECTS)) traps[name] = () => {
				throw new Error(`${name} is not available in a dynamic client half — ${redirect}`);
			};
			return traps;
		}
		/** The `harness` seat exists only host-side; any touch teaches the split. */
		function harnessTrap() {
			return new Proxy({}, { get(_target, prop) {
				throw new Error(`harness.${String(prop)} belongs to the HOST half (\`code\`): register handlers there with harness.handle(method, fn); the browser half calls them via host.call(method, args).`);
			} });
		}
		/** Per-package style-tag bookkeeping behind the `styles.insert` symbol. */
		var DynamicCordisStyles = class {
			pluginId;
			tags = /* @__PURE__ */ new Set();
			/** @param pluginId - owning Plugin ID, stamped as `data-dyn` on every tag. */
			constructor(pluginId) {
				this.pluginId = pluginId;
			}
			/**
			* Inject one stylesheet, removed automatically on package unload.
			* @param css - raw CSS text.
			* @returns disposer removing this one tag early.
			*/
			insert(css) {
				if (typeof css !== "string") throw new Error("styles.insert(css) needs a CSS string");
				const tag = document.createElement("style");
				tag.dataset.dyn = this.pluginId;
				tag.textContent = css;
				document.head.append(tag);
				this.tags.add(tag);
				return () => {
					this.tags.delete(tag);
					tag.remove();
				};
			}
			/** Live tag count (load-report contribution summary). */
			get count() {
				return this.tags.size;
			}
			/** Remove every tag this package still owns (unload path). */
			dispose() {
				for (const tag of this.tags) tag.remove();
				this.tags.clear();
			}
		};
		/** Stringify one console argument for the error mirror. */
		function errorText(arg) {
			if (arg instanceof Error) return arg.message;
			if (typeof arg === "string") return arg;
			if (arg === void 0) return "undefined";
			try {
				return JSON.stringify(arg);
			} catch {
				return "[unserializable console argument]";
			}
		}
		/** Tagged write-through console; error lines additionally copy into the load report. */
		function taggedConsole(pluginId, noteError) {
			const tag = `[cordis:${pluginId}]`;
			const forward = (level) => (...args) => {
				console[level](tag, ...args);
				if (level !== "error") return;
				noteError(args.map(errorText).join(" ").slice(0, 500));
			};
			return {
				...console,
				log: forward("log"),
				info: forward("info"),
				warn: forward("warn"),
				error: forward("error"),
				debug: forward("debug")
			};
		}
		/**
		* Narrow a closure return value to a mountable plugin (host guard mirror).
		* @param value - whatever the closure returned.
		* @returns whether the value is mountable.
		*/
		function isDynamicCordisPlugin(value) {
			if (typeof value === "function") return true;
			return typeof value === "object" && value !== null && typeof value.apply === "function";
		}
		/**
		* Evaluate one package's browser half and return the (un-guarded) plugin.
		* @param pluginId - stable Plugin ID (console tag and style ownership).
		* @param clientCode - the browser half's source: an async function body returning a plugin.
		* @param env - runner wiring for `host.call` and error mirroring.
		* @param styles - the package's style bookkeeping (owned by the caller so unload can dispose it).
		* @returns the plugin the closure returned.
		* @throws teaching errors for syntax failures and non-plugin returns.
		*/
		async function evaluateClientHalf(pluginId, clientCode, env, styles) {
			const traps = closureTraps();
			const parameters = [
				"React",
				"console",
				"styles",
				"host",
				"harness",
				...Object.keys(traps),
				"process",
				"Buffer"
			];
			let closure;
			try {
				closure = new Function(...parameters, `return (async () => {\n${clientCode}\n})()`);
			} catch (error) {
				if (!(error instanceof SyntaxError)) throw error;
				throw new Error(`client half failed to parse in this browser: ${error.message}\nThe browser half is plain JavaScript (no JSX, no TypeScript); build elements with React.createElement.`);
			}
			const returned = await closure(react, taggedConsole(pluginId, (message) => {
				env.noteError(message);
			}), styles, { 
			/**
			* Call a host-half handler of THIS package (harness.handle pairing). A call
			* with nothing to pass omits the argument: it arrives at the handler as
			* `null`, because the wire carries JSON and `undefined` is not JSON —
			* requiring `host.call('m', {})` would be a ritual, and defaulting to `{}`
			* would invent an empty argument the caller never wrote.
			*/
call: (method, args = null) => env.invoke(method, args) }, harnessTrap(), ...Object.values(traps), void 0, void 0);
			if (!isDynamicCordisPlugin(returned)) {
				if (returned === void 0) throw new Error("client half returned `undefined` — did you forget `return`?\n  ✓ return (ctx) => { … }\n  ✓ return { name: '…', inject: ['slots'], apply(ctx) { … } }");
				throw new Error("client half must `return` a plugin: a function, or an object with an `apply(ctx)` method");
			}
			return returned;
		}
		//#endregion
		//#region lib/types/client/guard.js
		/**
		* The browser twin of the tool-cordis context facade: a whitelist of
		* lifecycle-safe verbs plus optional `ctx.get()` lookup and declared-service
		* property access, with
		* framework internals withheld and Context-valued returns denied. Two seats
		* carry extra machinery: `slots`, where the registration proxy assigns any
		* shadowing priority and ledgers ordinary entries or Factory definitions — invoking the service with
		* the traced receiver so the effect lands on the CALLING plugin's fiber
		* (SlotRegistry.register must stay a prototype method for exactly that
		* reason) — and `theme`, whose override source is pinned to the package id.
		*
		* This is API discipline, not a security boundary: a dynamic package's code is
		* as trusted as the host process that accepted its definition.
		*/
		/** Facade verbs beyond declared services (host CTX_VERBS twin). */
		const CTX_VERBS = new Set([
			"effect",
			"on",
			"once",
			"provide",
			"timeout",
			"interval",
			"setTimeout",
			"setInterval",
			"throttle",
			"debounce"
		]);
		const TIMER_VERBS = new Set([
			"timeout",
			"interval",
			"setTimeout",
			"setInterval",
			"throttle",
			"debounce"
		]);
		/** Reject any service return that is a cordis Context (host guard twin). */
		function denyContext(value, service, env) {
			if (value instanceof _deepseek_ai_cordis.Context) return rejectGuard(env, `service "${service}" returned a cordis Context, which the dynamic facade does not expose. Operate through your own plugin ctx and the services you declared — never another context.`);
			return value;
		}
		/**
		* Forward service methods with the traced service as receiver — `this.ctx`
		* inside prototype methods (slots.register) must stay the CALLER's ctx so
		* effects land on the calling plugin's fiber — while denying Context returns.
		*/
		function guardedService(service, name, env) {
			return new Proxy(service, { get(target, prop) {
				const value = Reflect.get(target, prop, target);
				if (typeof value !== "function") return denyContext(value, name, env);
				return (...args) => {
					const result = Reflect.apply(value, target, args);
					if (result instanceof Promise) return result.then((resolved) => denyContext(resolved, name, env));
					return denyContext(result, name, env);
				};
			} });
		}
		/**
		* The slots seat: automatic shadowing priority and ledger recording around the
		* traced service's own Slot and Factory registration methods.
		*/
		function guardedSlots(slots, env) {
			return new Proxy(slots, { get(target, prop) {
				const value = Reflect.get(target, prop, target);
				if (prop !== "register" && prop !== "registerFactory") {
					if (typeof value !== "function") return denyContext(value, "slots", env);
					return (...args) => denyContext(Reflect.apply(value, target, args), "slots", env);
				}
				return (rawOptions, component) => {
					if (typeof rawOptions !== "object" || rawOptions === null) return rejectGuard(env, "slots.register(options, component) needs an options object with a `name`");
					const options = { ...rawOptions };
					const slot = options.name;
					if (typeof slot !== "string" || slot.length === 0) return rejectGuard(env, `slots.${prop} options need a string \`name\``);
					if (prop === "registerFactory") {
						const dispose = Reflect.apply(value, target, [options, component]);
						env.ledger.push({
							slot: `factory:${slot}`,
							priority: void 0
						});
						env.claim(component);
						return dispose;
					}
					if (slot === "tool.view.cordis") {
						if (options.key !== "self") return rejectGuard(env, "tool.view.cordis only accepts key \"self\"; the runtime binds it to this Package");
						options.key = `${env.pkg.pluginId}.${env.pkg.packageId}`;
					}
					const spec = slots.spec(slot);
					let priority = options.priority;
					if (spec === void 0 || spec.kind !== "chain") {
						priority = env.allocatePriority();
						options.priority = priority;
					}
					const dispose = Reflect.get(target, "register", target).call(target, options, component);
					env.ledger.push({
						slot,
						priority
					});
					env.claim(component);
					return dispose;
				};
			} });
		}
		/**
		* The theme seat: `overrideTokens`' source is FORCED to the package id — a
		* dynamic package can never impersonate (or evict) another source's layer, and
		* its own layers converge under one identity unload can reason about. The
		* layer's disposer is additionally hung on the calling fiber, because the
		* documented contract is "unload restores" and model code cannot be trusted to
		* keep the returned handle (slots parity — register hangs its own cleanup).
		* Everything else forwards through the generic guard.
		*/
		function guardedTheme(theme, env, ctx) {
			return new Proxy(theme, { get(target, prop) {
				if (prop !== "overrideTokens") {
					const value = Reflect.get(target, prop, target);
					if (typeof value !== "function") return denyContext(value, "theme", env);
					return (...args) => {
						const result = Reflect.apply(value, target, args);
						if (result instanceof Promise) return result.then((resolved) => denyContext(resolved, "theme", env));
						return denyContext(result, "theme", env);
					};
				}
				return (source, tokens) => {
					if (tokens === void 0 && typeof source === "object" && source !== null) return rejectGuard(env, "theme.overrideTokens(source, tokens) takes two arguments; source is replaced with your package id, so pass any string first and the token map second: overrideTokens('mine', { '--dsw-alias-…': { light: '…', dark: '…' } })");
					const method = Reflect.get(target, "overrideTokens", target);
					const dispose = Reflect.apply(method, target, [`${env.pkg.pluginId}.${env.pkg.packageId}`, tokens]);
					ctx.effect(() => dispose, "cordis-client-runner: dynamic theme override layer");
					return dispose;
				};
			} });
		}
		/**
		* Build the facade one dynamic plugin's `apply` receives (host sandboxContext
		* twin, browser seats). `ctx.get(name)` performs optional lookup; direct
		* `ctx.serviceName` access is gated by the fiber's `inject` declaration.
		* @param ctx - the plugin's real fiber ctx (loader-created).
		* @param env - package row + ledger sink.
		* @returns the whitelisting proxy standing in for ctx.
		*/
		function dynamicCordisContext(ctx, env) {
			const declared = new Set(Object.keys(ctx.fiber.inject));
			const denyRead = (prop) => {
				if (ctx.get(prop) !== void 0) return rejectGuard(env, `service "${prop}" is not declared by your plugin. Declare it on the plugin you return: { inject: ['${prop}', …], apply(ctx) { … } } — a plain \`function\` has no declaration site, so use the object form. The runtime then parks the package if the provider unloads.`);
				return rejectGuard(env, `dynamic ctx does not expose "${prop}". Available: ctx.on / ctx.provide / timer helpers after injecting timer, and any service your returned plugin declared in inject (slots and theme are the usual UI seats). Framework internals are withheld by design.`);
			};
			const readService = (name, requireDeclaration) => {
				if (requireDeclaration && !declared.has(name)) return denyRead(name);
				const service = denyContext(ctx.get(name), name, env);
				if (service === null || typeof service !== "object" && typeof service !== "function") return service;
				if (name === "slots") return guardedSlots(service, env);
				if (name === "theme") return guardedTheme(service, env, ctx);
				return guardedService(service, name, env);
			};
			return new Proxy({}, {
				get(_target, prop) {
					if (prop === "get") return (name) => readService(name, false);
					if (typeof prop !== "string") return void 0;
					if (CTX_VERBS.has(prop)) return (...args) => {
						if (TIMER_VERBS.has(prop) && !declared.has("timer")) return denyRead("timer");
						const method = ctx[prop];
						return Reflect.apply(method, ctx, args);
					};
					return readService(prop, true);
				},
				set(_target, prop) {
					return rejectGuard(env, `dynamic ctx is read-only; cannot assign "${String(prop)}"`);
				},
				has: (_target, prop) => prop === "get" || typeof prop === "string" && (CTX_VERBS.has(prop) && (!TIMER_VERBS.has(prop) || declared.has("timer")) || declared.has(prop))
			});
		}
		function rejectGuard(env, message) {
			const error = new Error(message);
			env.reportFailure(error);
			throw error;
		}
		//#endregion
		//#region lib/types/client/runtime.js
		/**
		* Per-package browser lifecycle: evaluate the closure, wrap `apply` in the guard
		* facade, seat a ready-made factory in the module table, and create a loader
		* entry — so dynamic packages ride the exact machinery static plugins do
		* (activation gating on inject, fiber-effect cleanup, status projection). Unload
		* = loader entry removal (fiber disposal cascades slot entries and facade
		* effects) + factory invalidation + style removal.
		*
		* The engine answers its caller: `load` resolves with what this page ended up
		* with, which is what the run orchestration reports back to the host. Loads
		* converge by Plugin Run ID against live state, not history: loading the exact
		* activation this page already runs is a no-op that still answers, another run
		* replaces it, and the same Package after a retract loads afresh. Per-Plugin
		* serialization keeps a second request from interleaving with one in flight.
		*/
		/** Module-table id of one package (also its loader entry name and fiber name). */
		function moduleIdOf(id) {
			return `dyn/${id}`;
		}
		/** The browser-side load engine for dynamic packages. */
		var DynamicCordisPackageRunner = class {
			env;
			live = /* @__PURE__ */ new Map();
			/** Serializes load/unload per package id (a second request can outrun a slow load). */
			queues = /* @__PURE__ */ new Map();
			changeListeners = /* @__PURE__ */ new Set();
			/** Page-local shadowing rank. A later registration receives a lower priority. */
			nextPriority = 0;
			/**
			* Which package seated which component, and for whom. Component identity is the
			* only attribution key that holds:
			* - the registry stores the component verbatim, so a crashed entry carries its
			*   own way back — no parallel entry ledger to keep in step;
			* - `entry.registrant` is `options.registrant ?? fiber.name` and the facade does
			*   not strip a package-supplied one, so a package could name itself something
			*   else — attributing by it would let a package impersonate another;
			* - the assigned shadowing priority is unique but absent on chain entries (their
			*   election is deliberately left alone), so it would miss chain crashes;
			* - a package torn down between the crash and the report is still attributable,
			*   because this index does not depend on the live record.
			*
			* Two packages cannot collide here: each browser half is evaluated in its own
			* closure, so no component object reaches two of them. A collision is only
			* possible inside ONE package (the same component seated twice), where both
			* entries map to the same id and the value is identical.
			*/
			owners = /* @__PURE__ */ new WeakMap();
			/** This page's last render crash per package: what a run surface shows on the row. */
			failures = /* @__PURE__ */ new Map();
			unwatch;
			snapshotCache;
			failureCache;
			/** @param env - loader/module/slot wiring plus the two host verbs this engine uses. */
			constructor(env) {
				this.env = env;
				this.unwatch = env.slots.onEntryError((slot, entry, error, info) => {
					const component = entry.component;
					const owner = indexable(component) ? this.owners.get(component) : void 0;
					if (owner === void 0) return;
					const details = errorDetails(error);
					const failure = {
						slot,
						message: renderFailureMessage(slot, details.message),
						...details.stack === void 0 ? {} : { stack: details.stack },
						abdicated: info.abdicated
					};
					env.reportRenderFailure(owner.agentId, owner.pluginId, owner.pluginRunId, failure);
					this.failures.set(owner.pluginId, failure);
					this.notify();
				});
			}
			/**
			* Observe live-set changes (the run-state surface's re-render seam).
			* @param fn - notified after every converged mutation.
			* @returns unsubscribe.
			*/
			subscribe(fn) {
				this.changeListeners.add(fn);
				return () => {
					this.changeListeners.delete(fn);
				};
			}
			/**
			* This page's last render crash per package, on the same notification channel as
			* the live set — a surface that already subscribed learns about a crash without
			* a second mechanism to wire.
			*/
			renderFailures = {
				getSnapshot: () => this.failureCache ??= new Map(this.failures),
				subscribe: (fn) => this.subscribe(fn)
			};
			/**
			* What this page currently has loaded (stable reference between mutations, so
			* it can back a snapshot selector).
			* @returns one row per live package.
			*/
			getSnapshot() {
				return this.snapshotCache ??= [...this.live.values()].map(({ pkg, ledger, styles }) => ({
					pluginId: pkg.pluginId,
					packageId: pkg.packageId,
					pluginRunId: pkg.pluginRunId,
					name: pkg.name,
					slots: [...new Set(ledger.map((row) => row.slot))],
					styleCount: styles.count
				}));
			}
			/**
			* Whether this page has the browser half loaded — page-local truth, never the
			* host's "it is running".
			* @param pluginId - stable Plugin identity.
			* @returns true while one activation of the Plugin is live here.
			*/
			isLoaded(pluginId) {
				return this.live.has(pluginId);
			}
			/**
			* Load one browser half into this page and answer what happened.
			* @param half - source for one exact Host activation.
			* @returns the outcome the run orchestration reports to the host.
			*/
			load(half) {
				return this.enqueue(half.pluginId, async () => {
					const current = this.live.get(half.pluginId);
					if (current !== void 0) {
						if (current.pkg.pluginRunId === half.pluginRunId) return settled(current);
						await this.teardown(current.pkg.pluginId, current.entryId, current.styles);
					}
					const result = await this.mount(half);
					this.notify();
					return result;
				});
			}
			/**
			* Unload one package (`cordis/dynamic-retract`: a stop, or an undefine
			* that stops first).
			* @param pluginId - stable Plugin identity.
			* @param pluginRunId - exact activation being retracted; a newer run survives.
			*/
			retract(pluginId, pluginRunId) {
				this.enqueue(pluginId, async () => {
					const current = this.live.get(pluginId);
					if (current === void 0 || current.pkg.pluginRunId !== pluginRunId) return;
					await this.teardown(pluginId, current.entryId, current.styles);
					this.notify();
				});
			}
			/** Unload everything (plugin disposal path). */
			async dispose() {
				this.unwatch();
				for (const current of [...this.live.values()]) await this.teardown(current.pkg.pluginId, current.entryId, current.styles);
				this.notify();
			}
			notify() {
				this.snapshotCache = void 0;
				this.failureCache = void 0;
				for (const fn of [...this.changeListeners]) fn();
			}
			/** Queue one package operation behind that package's previous ones. */
			enqueue(id, op) {
				const next = (this.queues.get(id) ?? Promise.resolve()).then(op);
				this.queues.set(id, next.then(() => {}, () => {}));
				return next;
			}
			async mount(half) {
				const styles = new DynamicCordisStyles(half.pluginId);
				const ledger = [];
				let plugin;
				try {
					plugin = await evaluateClientHalf(half.pluginId, half.code, {
						invoke: (method, args) => this.env.invoke(half.pluginId, half.pluginRunId, method, args),
						noteError: (message) => {
							console.error(`[cordis-client-runner] ${half.pluginId} logged an error:`, message);
						}
					}, styles);
				} catch (error) {
					styles.dispose();
					return {
						ok: false,
						cause: "evaluate",
						...errorDetails(error),
						error
					};
				}
				const pkg = {
					pluginId: half.pluginId,
					packageId: half.packageId,
					pluginRunId: half.pluginRunId,
					name: half.name
				};
				const surface = this.guardedSurface(pkg, half.agentId, plugin, ledger);
				const moduleId = moduleIdOf(half.pluginId);
				this.env.modules.invalidate(moduleId);
				const sink = globalThis.__ModuleLoader__;
				if (sink === void 0) throw new Error("cordis-client-runner: window.__ModuleLoader__ is missing (booted outside the web shell?)");
				sink.load({
					id: moduleId,
					factory: () => surface
				});
				const entryId = await this.env.loader.create({ name: moduleId });
				const fiber = this.env.loader.resolve(entryId).fiber;
				if (fiber === void 0) {
					await this.teardown(half.pluginId, entryId, styles);
					return {
						ok: false,
						cause: "module-import",
						message: "module import failed (see the browser console)"
					};
				}
				try {
					await fiber.await();
				} catch (error) {
					await this.teardown(half.pluginId, entryId, styles);
					return {
						ok: false,
						cause: "activate",
						...errorDetails(error),
						error
					};
				}
				const record = {
					pkg,
					entryId,
					styles,
					ledger,
					waitingFor: Object.keys(fiber.inject).filter((name) => this.env.ctx.get(name) === void 0)
				};
				this.live.set(half.pluginId, record);
				this.failures.delete(half.pluginId);
				return settled(record);
			}
			/**
			* Wrap the evaluated plugin so `apply` sees the guard facade; the surface
			* doubles as the module-table module. The plugin's OWN `inject` survives (the
			* object form's declaration is the facade's service gate, mirroring the host
			* sandbox reading `ctx.fiber.inject`); the function form has no declaration
			* site and therefore reaches no service.
			*/
			guardedSurface(pkg, agentId, plugin, ledger) {
				const claim = (component) => {
					if (indexable(component)) this.owners.set(component, {
						pluginId: pkg.pluginId,
						pluginRunId: pkg.pluginRunId,
						agentId
					});
				};
				const guarded = (ctx) => dynamicCordisContext(ctx, {
					pkg,
					ledger,
					claim,
					allocatePriority: () => --this.nextPriority,
					reportFailure: (error) => {
						this.env.reportGuardFailure(agentId, pkg.pluginId, pkg.pluginRunId, errorDetails(error));
					}
				});
				if (typeof plugin === "function") return {
					name: moduleIdOf(pkg.pluginId),
					apply: (ctx) => plugin(guarded(ctx))
				};
				return {
					...plugin,
					name: moduleIdOf(pkg.pluginId),
					apply: (ctx, config) => plugin.apply(guarded(ctx), config)
				};
			}
			/**
			* Unload one package's contributions. Takes the pieces rather than the record
			* because a load can fail before any record is seated.
			*/
			async teardown(id, entryId, styles) {
				this.live.delete(id);
				this.failures.delete(id);
				const disposal = this.env.loader.resolve(entryId).fiber?.dispose();
				this.env.loader.remove(entryId);
				await disposal;
				this.env.modules.invalidate(moduleIdOf(id));
				styles.dispose();
			}
		};
		/** The success answer for a package that is live here, parked or active. */
		function settled(record) {
			return {
				ok: true,
				pluginRunId: record.pkg.pluginRunId,
				...record.waitingFor.length > 0 ? { waitingFor: record.waitingFor } : {}
			};
		}
		/**
		* Whether a component can key the ownership index. Identity is the key, so only
		* objects and functions qualify — a package may register anything, and what it
		* registered is what a crash report carries back.
		* @param component - whatever a package passed as its component.
		* @returns true when the value can be indexed by identity.
		*/
		function indexable(component) {
			return typeof component === "object" && component !== null || typeof component === "function";
		}
		/**
		* Preserve error fields for a load result without fabricating a stack.
		* @param error - original thrown value.
		* @returns its message and original string stack, when present.
		*/
		function errorDetails(error) {
			if (typeof error !== "object" || error === null) return { message: String(error) };
			const message = "message" in error && typeof error.message === "string" ? error.message : Object.prototype.toString.call(error);
			const stack = "stack" in error && typeof error.stack === "string" ? error.stack : void 0;
			return {
				message,
				...stack === void 0 ? {} : { stack }
			};
		}
		/**
		* What the authoring session reads about one render crash. The slot says where it
		* happened, the crash message says what broke, and a withheld global named in that
		* text pulls in its redirect — a package that reached `window.setInterval` around
		* the closure trap crashes with the engine's bare message, which teaches nothing.
		*/
		function renderFailureMessage(slot, message) {
			const redirect = Object.entries(DYNAMIC_CLIENT_REDIRECTS).find(([name, text]) => message.includes(name) && !message.includes(text))?.[1];
			return `${slot.startsWith("factory:") ? `your component in Factory "${slot.slice(8)}"` : `your entry in slot "${slot}"`} crashed while React rendered it: ${message}` + (redirect === void 0 ? "" : `\n${redirect}`);
		}
		//#endregion
		//#region lib/types/client/orchestrator.js
		/**
		* Page-side run orchestration for model approvals and direct panel gestures.
		* Host activation always precedes Client loading. The same Plugin-keyed state
		* drives every surface, so remounting a panel never loses an open approval or
		* an in-flight transition.
		*/
		/** Drives Host → Client activation and publishes Plugin-keyed activity. */
		var CordisRunOrchestrator = class {
			env;
			requests = /* @__PURE__ */ new Map();
			activity = /* @__PURE__ */ new Map();
			failures = /* @__PURE__ */ new Map();
			inFlight = /* @__PURE__ */ new Map();
			listeners = /* @__PURE__ */ new Set();
			activityCache;
			failureCache;
			/** @param env - Client loader and folded Host operations. */
			constructor(env) {
				this.env = env;
			}
			/** Open approvals and current activation attempts, keyed by stable Plugin ID. */
			activeRuns = {
				getSnapshot: () => this.activityCache ??= new Map(this.activity),
				subscribe: (fn) => this.observe(fn)
			};
			/** Latest page-side activation failure for each Plugin. */
			lastRunError = {
				getSnapshot: () => this.failureCache ??= new Map(this.failures),
				subscribe: (fn) => this.observe(fn)
			};
			/**
			* Register a Client activation request, starting it immediately when the Plugin is already authorized.
			* @param request - forwarded approval and activation metadata.
			*/
			open(request) {
				this.requests.set(request.requestId, request);
				if (!request.requiresApproval) {
					this.orchestrate({
						agentId: request.agentId,
						pluginId: request.pluginId,
						packageId: request.packageId,
						mode: request.mode,
						requestId: request.requestId,
						hasClientHalf: true
					}).catch((error) => {
						console.error(`[cordis-client-runner] automatic activation ${request.requestId} failed:`, error);
					});
					return;
				}
				if (this.activity.get(request.pluginId)?.phase !== "orchestrating") this.activity.set(request.pluginId, {
					phase: "awaiting-approval",
					requestId: request.requestId,
					agentId: request.agentId,
					packageId: request.packageId,
					mode: request.mode,
					name: request.name,
					purpose: request.purpose
				});
				this.commit();
			}
			/**
			* Rebuild pending approvals and automatic Client activations from an authoritative Host inventory read.
			* @param rows - complete process-wide Plugin inventory.
			*/
			reconcileApprovals(rows) {
				const expected = /* @__PURE__ */ new Map();
				for (const row of rows) {
					const attempt = row.latestRun;
					if (attempt?.approvalRequestId === void 0 || attempt.status !== "awaiting-approval" && attempt.status !== "starting-host" && attempt.status !== "client-pending") continue;
					const pkg = row.packages.find((candidate) => candidate.packageId === attempt.packageId);
					if (pkg === void 0) continue;
					expected.set(attempt.approvalRequestId, {
						requestId: attempt.approvalRequestId,
						agentId: row.agentId,
						pluginId: row.pluginId,
						packageId: attempt.packageId,
						mode: attempt.mode,
						name: pkg.name,
						purpose: pkg.purpose,
						requiresApproval: attempt.requiresApproval ?? attempt.status === "awaiting-approval"
					});
				}
				let changed = false;
				for (const [requestId, request] of [...this.requests]) {
					if (expected.has(requestId)) continue;
					this.requests.delete(requestId);
					const current = this.activity.get(request.pluginId);
					if (current?.phase === "awaiting-approval" && current.requestId === requestId) this.activity.delete(request.pluginId);
					changed = true;
				}
				for (const [requestId, request] of expected) {
					const previous = this.requests.get(requestId);
					const current = this.activity.get(request.pluginId);
					if (!request.requiresApproval && current?.phase === "orchestrating") continue;
					if (request.requiresApproval && sameRequest(previous, request) && current?.phase === "awaiting-approval" && current.requestId === requestId) continue;
					if (!request.requiresApproval) {
						this.open(request);
						changed = true;
						continue;
					}
					this.requests.set(requestId, request);
					if (current?.phase !== "orchestrating") this.activity.set(request.pluginId, {
						phase: "awaiting-approval",
						requestId,
						agentId: request.agentId,
						packageId: request.packageId,
						mode: request.mode,
						name: request.name,
						purpose: request.purpose
					});
					changed = true;
				}
				if (changed) this.commit();
			}
			/**
			* Close an approval settled by another page or by cancellation.
			* @param requestId - approval request that can no longer be answered here.
			*/
			close(requestId) {
				const request = this.requests.get(requestId);
				if (request === void 0) return;
				this.requests.delete(requestId);
				const current = this.activity.get(request.pluginId);
				if (current?.phase === "awaiting-approval" && current.requestId === requestId) this.activity.delete(request.pluginId);
				this.commit();
			}
			/**
			* Approve and execute one still-open model request.
			* @param requestId - approval request to execute.
			* @param approveFutureVersions - whether this approval covers later Packages for the same Plugin.
			*/
			approve(requestId, approveFutureVersions) {
				const request = this.requests.get(requestId);
				if (request === void 0 || !request.requiresApproval) return Promise.resolve();
				return this.orchestrate({
					agentId: request.agentId,
					pluginId: request.pluginId,
					packageId: request.packageId,
					mode: request.mode,
					requestId,
					approveFutureVersions,
					hasClientHalf: true
				});
			}
			/**
			* Reject one still-open model request without executing either half.
			* @param requestId - approval request to reject.
			*/
			async decline(requestId) {
				const request = this.requests.get(requestId);
				if (request === void 0 || !request.requiresApproval) return;
				const current = this.activity.get(request.pluginId);
				if (current?.phase !== "awaiting-approval" || current.requestId !== requestId) return;
				this.requests.delete(requestId);
				this.activity.delete(request.pluginId);
				this.commit();
				await this.answer(requestId, {
					ok: false,
					reason: "rejected"
				});
			}
			/**
			* Execute a direct panel run; the user gesture itself authorizes it.
			* @param request - exact Package activation selected by the user.
			*/
			startUserRun(request) {
				return this.orchestrate(request);
			}
			observe(fn) {
				this.listeners.add(fn);
				return () => {
					this.listeners.delete(fn);
				};
			}
			commit() {
				this.activityCache = void 0;
				this.failureCache = void 0;
				for (const fn of [...this.listeners]) fn();
			}
			orchestrate(plan) {
				const running = this.inFlight.get(plan.pluginId);
				if (running !== void 0) return running;
				this.activity.set(plan.pluginId, {
					phase: "orchestrating",
					agentId: plan.agentId,
					packageId: plan.packageId,
					mode: plan.mode
				});
				this.failures.delete(plan.pluginId);
				if (plan.requestId !== void 0) this.requests.delete(plan.requestId);
				this.commit();
				const attempt = this.drive(plan).finally(() => {
					this.inFlight.delete(plan.pluginId);
					this.activity.delete(plan.pluginId);
					this.commit();
				});
				this.inFlight.set(plan.pluginId, attempt);
				return attempt;
			}
			async drive(plan) {
				const started = await this.startHost(plan);
				if (!started.ok) {
					this.fail(plan, "host-half-failed", started);
					if (plan.requestId !== void 0) await this.answer(plan.requestId, {
						...started,
						reason: "host-half-failed"
					});
					return;
				}
				if (!plan.hasClientHalf) return;
				let source;
				try {
					source = await this.env.host.getClientCode(plan.agentId, plan.pluginId, started.pluginRunId);
				} catch (error) {
					await this.finishClientFailure(plan, started.pluginRunId, started.startedHere, errorDetails(error), error);
					return;
				}
				const loaded = await this.env.runner.load({
					pluginId: source.pluginId,
					packageId: source.packageId,
					pluginRunId: source.pluginRunId,
					agentId: plan.agentId,
					name: source.name,
					code: source.code
				}).catch((error) => ({
					ok: false,
					cause: "evaluate",
					...errorDetails(error),
					error
				}));
				if (!loaded.ok) {
					await this.finishClientFailure(plan, started.pluginRunId, started.startedHere, {
						message: `${loaded.cause}: ${loaded.message}`,
						...loaded.stack === void 0 ? {} : { stack: loaded.stack }
					}, loaded.error);
					return;
				}
				const resolution = {
					ok: true,
					pluginRunId: loaded.pluginRunId,
					...loaded.waitingFor === void 0 ? {} : { waitingFor: loaded.waitingFor }
				};
				if (plan.requestId !== void 0) {
					await this.answer(plan.requestId, resolution);
					return;
				}
				await this.settleDirect(plan, resolution);
			}
			async startHost(plan) {
				try {
					return await this.env.host.runHostHalf(plan.agentId, plan.pluginId, plan.packageId, plan.mode, plan.requestId ?? null, plan.approveFutureVersions ?? false);
				} catch (error) {
					return {
						ok: false,
						...errorDetails(error)
					};
				}
			}
			async finishClientFailure(plan, pluginRunId, startedHere, failure, originalError) {
				console.error(`[cordis-client-runner] Client activation ${plan.pluginId}/${plan.packageId} (${pluginRunId}) failed:`, originalError ?? failure);
				this.fail(plan, "client-half-failed", failure);
				const resolution = {
					ok: false,
					reason: "client-half-failed",
					pluginRunId,
					startedHere,
					...failure
				};
				if (plan.requestId !== void 0) await this.answer(plan.requestId, resolution);
				else await this.settleDirect(plan, resolution);
			}
			async settleDirect(plan, resolution) {
				try {
					const response = await this.env.host.settleUserRun(plan.agentId, plan.pluginId, resolution);
					if (!response.ok) this.fail(plan, "client-half-failed", response);
				} catch (error) {
					this.fail(plan, "client-half-failed", errorDetails(error));
				}
			}
			async answer(requestId, resolution) {
				try {
					await this.env.host.resolveRequestRun(requestId, resolution);
				} catch (error) {
					console.error(`[cordis-client-runner] answering run request ${requestId} failed:`, error);
				}
			}
			fail(plan, reason, failure) {
				this.failures.set(plan.pluginId, {
					packageId: plan.packageId,
					reason,
					...failure
				});
				this.commit();
			}
		};
		function sameRequest(left, right) {
			return left?.requestId === right.requestId && left.agentId === right.agentId && left.pluginId === right.pluginId && left.packageId === right.packageId && left.mode === right.mode && left.name === right.name && left.purpose === right.purpose && left.requiresApproval === right.requiresApproval;
		}
		//#endregion
		//#region lib/types/client/inspect-registry.js
		/** Browser registry for read-only Cordis capability providers. */
		/** Client provider registry, manifest publisher, and live query dispatcher. */
		var ClientCordisInspectRegistry = class {
			host;
			providers = /* @__PURE__ */ new Map();
			active = /* @__PURE__ */ new Map();
			publishQueued = false;
			syncChain = Promise.resolve();
			/** @param host - folded manifest and query result transport. */
			constructor(host) {
				this.host = host;
			}
			/**
			* Register one Client provider and publish a new complete manifest.
			* @param registration - provider manifest and local handler.
			* @returns idempotent disposer.
			*/
			register(registration) {
				const { manifest } = registration;
				if (manifest.id.trim() === "") throw new Error("Client Cordis inspect provider id must not be empty");
				if (this.providers.has(manifest.id)) throw new Error(`Client Cordis inspect provider "${manifest.id}" is already registered`);
				const names = /* @__PURE__ */ new Set();
				for (const method of manifest.methods) {
					if (names.has(method.name)) throw new Error(`Client Cordis inspect provider "${manifest.id}" repeats method "${method.name}"`);
					names.add(method.name);
				}
				this.providers.set(manifest.id, registration);
				this.publish();
				let disposed = false;
				return () => {
					if (disposed) return;
					disposed = true;
					if (this.providers.get(manifest.id) === registration) {
						this.providers.delete(manifest.id);
						this.publish();
					}
				};
			}
			/** Publish the current complete manifest, including after reconnect. */
			publish() {
				if (this.publishQueued) return;
				this.publishQueued = true;
				queueMicrotask(() => {
					this.publishQueued = false;
					const manifests = [...this.providers.values()].map((provider) => provider.manifest);
					this.syncChain = this.syncChain.then(async () => {
						await this.host.sync(manifests);
					}).catch((error) => {
						console.error("[cordis-client-runner] syncing inspect providers failed:", error);
					});
				});
			}
			/**
			* Execute and answer one Host-broadcast query.
			* @param request - exact provider query and Session correlation received from Host.
			* @returns after the first local result has been sent back to Host.
			*/
			async query(request) {
				if (this.active.has(request.requestId)) return;
				const controller = new AbortController();
				this.active.set(request.requestId, controller);
				let resolution;
				try {
					const provider = this.providers.get(request.provider);
					if (provider === void 0) resolution = {
						ok: false,
						reason: "provider-missing",
						message: `Client inspect provider "${request.provider}" is unavailable`
					};
					else if (!provider.manifest.methods.some((method) => method.name === request.method)) resolution = {
						ok: false,
						reason: "method-missing",
						message: `Client inspect provider "${request.provider}" has no method "${request.method}"`
					};
					else {
						const data = await provider.query(request.method, request.input, {
							signal: controller.signal,
							sessionId: request.agentId
						});
						resolution = controller.signal.aborted ? {
							ok: false,
							reason: "cancelled",
							message: "Client inspect query was cancelled"
						} : {
							ok: true,
							data
						};
					}
				} catch (error) {
					resolution = controller.signal.aborted ? {
						ok: false,
						reason: "cancelled",
						message: "Client inspect query was cancelled"
					} : {
						ok: false,
						reason: "provider-error",
						message: error instanceof Error ? error.message : String(error)
					};
				} finally {
					this.active.delete(request.requestId);
				}
				if (controller.signal.aborted) return;
				await this.host.resolve(request.agentId, request.requestId, resolution);
			}
			/**
			* Cancel local work after another page answered or the Tool call ended.
			* @param requestId - query correlation that is no longer answerable.
			*/
			close(requestId) {
				this.active.get(requestId)?.abort();
				this.active.delete(requestId);
			}
		};
		/**
		* Provide the registry as a normal Client service.
		* @param ctx - Client Cordis context receiving the service.
		* @param registry - page-local inspect registry to publish.
		*/
		function provideClientCordisInspect(ctx, registry) {
			ctx.provide("cordisInspect", registry);
		}
		//#endregion
		//#region lib/types/client/api-catalog.js
		/**
		* Generated by scripts/gen-cordis-inspect-catalog.ts — do not edit by hand; run
		* `pnpm run gen-cordis-inspect-catalog` to regenerate (freshness-gated by
		* `pnpm run verify-cordis-inspect-catalog` in doc-sync).
		*
		* The machine-readable cordis API catalog `cordis_inspect` serves to the
		* model: harness services (summary + structured public method contracts),
		* harness events (mode + structured listener contracts), and the inherited `ctx` API. Produced by
		* the same AST walk as docs/cordis-catalog, so this data and the rendered
		* docs cannot diverge.
		*
		* @module @deepseek-ai/dsh-cordis-client-runner/client/api-catalog
		*/
		/** Every harness `ctx.<key>` service, sorted by key. */
		const SERVICE_API = [
			{
				key: "layout",
				summary: "Panel navigation and geometry actions exposed through ctx.layout.",
				description: "Panel navigation and geometry actions exposed through ctx.layout.",
				methods: [
					{
						signature: "selectPanel(panelId: MainPanelId | null): void",
						description: "Select a global central panel without changing the current Session.",
						parameters: [{
							name: "panelId",
							description: "registered main key, or null to show the Conversation."
						}],
						throws: ["if the selected main key is not registered; preserves the current selection."]
					},
					{
						signature: "beginNavigation(): AbortSignal",
						description: "Start an asynchronous navigation, superseding any earlier pending navigation.",
						parameters: [],
						returns: "a signal aborted by the next navigation or layout disposal; check it before committing UI state."
					},
					{
						signature: "toggleSidebar(): void",
						description: "Toggle the sidebar panel (closed ⟷ contract default width).",
						parameters: []
					},
					{
						signature: "openRightbar(track: boolean, fullscreen: boolean): void",
						description: "Report the right panel's presentation without changing its expanded state.",
						parameters: [{
							name: "track",
							description: "whether the normal panel width reserves a grid track, including beneath a fullscreen overlay."
						}, {
							name: "fullscreen",
							description: "whether the panel covers the frame and hides its outer resize handle; independent of the underlying grid track."
						}]
					},
					{
						signature: "closeRightbar(): void",
						description: "Report the right panel as hidden: no track, no handle.",
						parameters: []
					}
				]
			},
			{
				key: "locale",
				summary: "Dictionary registry plus locale preference.",
				description: "Dictionary registry plus locale preference. Lookup walks the active language's declared fallback chain in the entry namespace, then repeats it in the shared common namespace before showing the key itself. Reads go through getLocale; preferences change only through setLocale, while language packs extend the catalog through addLanguage. Continuous sync uses the `locale/change` event or the LocaleFace getSnapshot/subscribe pair installed through `ctx.slots.installLocale`.",
				methods: [
					{
						signature: "getLocale(): LocaleSnapshot",
						description: "Read the current immutable locale snapshot.",
						parameters: [],
						returns: "the current snapshot (stable reference until the next change)."
					},
					{
						signature: "getSnapshot(): LocaleSnapshot",
						description: "LocaleFace getSnapshot: the current snapshot (carries `revision`; stable reference between changes, uSES-safe).",
						parameters: [],
						returns: "the current snapshot."
					},
					{
						signature: "subscribe(fn: () => void): () => void",
						description: "LocaleFace subscribe: notified on every snapshot change (locale switch or dictionary registration — registrations bump the revision so already rendered outlets pick up late-arriving dictionaries and locale definitions).",
						parameters: [{
							name: "fn",
							description: "change callback."
						}],
						returns: "unsubscribe."
					},
					{
						signature: "setLocale(id: string): void",
						description: "Switch the active locale — the only user preference write entry.\n\nThe durable write happens even when the id already matches the active locale, because the active value may be a provisional browser-derived or fallback resolution that nothing has stored yet. Picking the language already on screen is still an explicit choice, and it must survive a different browser sharing the same DSH home. Only the render notification is conditional: republishing an unchanged locale would churn every subscriber for nothing.",
						parameters: [{
							name: "id",
							description: "a registered locale id; unknown ids throw."
						}]
					},
					{
						signature: "addLanguage(input: LanguageRegistration): () => void",
						description: "Add one selectable language to the shared catalog. Its fallback must already be registered, and following fallback definitions must terminate at English. Dictionaries may register before or after this definition. Registration rechecks an unresolved Host preference and the browser's ordered language list. The caller owns the returned disposer; removing an active language falls back without clearing the stored id.",
						parameters: [{
							name: "input",
							description: "stable id, self-described label, and fallback language id."
						}],
						returns: "idempotent disposer removing this exact definition.",
						throws: ["when fields are malformed, the id is occupied, or the fallback target is unknown or creates a cycle."]
					},
					{
						signature: "register<N extends Extract<keyof LocaleNamespaceMap, string>>( ns: N, dicts: Record<BuiltInLocaleId, LocaleDictOf<N>> & Record<LocaleId, LocaleDictOf<N>>, ): () => void",
						description: "Register a declared namespace's dictionaries, all locales in one call — the typed form: each dictionary is checked against the namespace's LocaleNamespaceMap key union (a missing or extra key is a compile error), and both baseline locales are required (bilingual balance enforced at registration). Duplicate (ns, locale) throws (single occupant; a namespace's texts have one owner). Registration bumps the revision so mounted outlets pick up late-arriving dictionaries.",
						parameters: [{
							name: "ns",
							description: "a namespace merged into LocaleNamespaceMap."
						}, {
							name: "dicts",
							description: "complete baseline dictionaries and optional dictionaries for additional locale ids."
						}],
						returns: "disposer removing every locale registered by this call (idempotent)."
					},
					{
						signature: "register(ns: string, locale: string, dict: LocaleDict): () => void",
						description: "Single-locale untyped form for language-pack contributions and namespaces outside the merge table.",
						parameters: [
							{
								name: "ns",
								description: "namespace."
							},
							{
								name: "locale",
								description: "locale tag."
							},
							{
								name: "dict",
								description: "dictionary."
							}
						],
						returns: "disposer (idempotent).",
						throws: ["when locale is not a BCP 47-style tag."]
					},
					{
						signature: "bind<N extends Extract<keyof LocaleNamespaceMap, string>>(ns: N): TranslateNS<N>",
						description: "Bind a declared namespace to a translate function typed to its dictionary key union (plus the shared common vocabulary) — the same key domain the framework-injected `t` seat carries. The returned reference is stable per namespace (repeat binds return the same function), so it can ride inject surfaces without breaking memoization.",
						parameters: [{
							name: "ns",
							description: "a namespace merged into LocaleNamespaceMap."
						}],
						returns: "the typed translate function (reads the active locale at call time)."
					},
					{
						signature: "bind(ns: string): Translate",
						description: "Untyped form for namespaces outside the merge table (dynamic composition, tests).",
						parameters: [{
							name: "ns",
							description: "namespace."
						}],
						returns: "the translate function."
					}
				]
			},
			{
				key: "sessions",
				summary: "The sessions-service face injected as `ctx.sessions`.",
				description: "The sessions-service face injected as `ctx.sessions`.",
				methods: [
					{
						signature: "retain(target: SessionTarget, options: SessionRetainOptions): SessionReference",
						description: "Retain an exact Client generation and start its shared initial history opening.",
						parameters: [{
							name: "target",
							description: "known identity or durable direct-parent address."
						}, {
							name: "options",
							description: "required consumer source and optional independent waiter cancellation."
						}],
						returns: "an owned reference immediately; await `reference.ready` when the initial open attempt must settle first."
					},
					{
						signature: "using<T>(target: SessionTarget, options: SessionRetainOptions, operation: (reference: SessionReference) => T | Promise<T>): Promise<T>",
						description: "Hold one reference through callback settlement, including synchronous and asynchronous failures.",
						parameters: [
							{
								name: "target",
								description: "Session to acquire."
							},
							{
								name: "options",
								description: "source and acquisition cancellation."
							},
							{
								name: "operation",
								description: "callback using the reference only until its returned value or Promise settles."
							}
						],
						returns: "the callback result after release; acquisition and callback failures propagate unchanged."
					},
					{
						signature: "retainInfo(id: SessionId): ObservableSnapshot<SessionRetainInfo>",
						description: "Observe local reference counts without retaining, creating a scope, or opening history. The returned source keeps stable identity across same-id generations and remains allocated until the Client root is disposed, even after its final subscriber leaves.",
						parameters: [{
							name: "id",
							description: "explicit Session identity; Host existence is not implied."
						}],
						returns: "a stable read-only source across same-id generations, with zero counts when none is live."
					},
					{
						signature: "refreshProjections(sessionId: SessionId): Promise<void>",
						description: "Read projections without starting migration; retry failed or migration-deferred reads.",
						parameters: [{
							name: "sessionId",
							description: "Session to inspect without opening its conversation."
						}],
						returns: "completion of the current or newly started refresh."
					},
					{
						signature: "search( query: string, signal: AbortSignal, ): Promise<RemoteResult<{ items: SessionSearchResultItem[]; hasMore: boolean }>>",
						description: "Search the Host's visible message-content index. Results stay request-local; the list snapshot remains the metadata authority.",
						parameters: [{
							name: "query",
							description: "non-blank literal phrase."
						}, {
							name: "signal",
							description: "cancellation for a superseded search."
						}],
						returns: "bounded results, or a business/transport error."
					},
					{
						signature: "fork(opts: { sessionId: SessionId atSeq?: number increaseTitle?: boolean onCreated?: (childId: SessionId) => void /** False refuses source migration; omission preserves the Host default. */ allowMigration?: boolean }): Promise<SessionId>",
						description: "Fork a session from an exact inclusive prefix of the source; on resolution the child is catalogued and can be explicitly retained.",
						parameters: [{
							name: "opts",
							description: "source session id, the optional exact inclusive boundary seq (a real event seq the caller already knows; a cut inside an open turn is balanced Host-side with synthetic closers, and omission selects the latest completed-turn prefix), and whether to increment an inherited durable title before resolving. `onCreated` observes the catalogued child before that optional rename."
						}],
						returns: "the child session id.",
						throws: ["when the fork fails, or when a requested child-title rename fails after creation."]
					},
					{
						signature: "scope(id: SessionId): AgentContext | undefined",
						description: "Borrow an already-retained Agent-scoped Context without extending its lifetime.",
						parameters: [{
							name: "id",
							description: "session id."
						}],
						returns: "the live scoped Context, or undefined without a retained generation."
					},
					{
						signature: "binding(id: SessionId): SessionBinding | undefined",
						description: "Borrow an already-retained Session binding without extending its lifetime.",
						parameters: [{
							name: "id",
							description: "session id."
						}],
						returns: "the live binding, or undefined without a retained generation."
					}
				]
			},
			{
				key: "slots",
				summary: "cordis Service layer of the slot system; see the module doc for the split with SlotCore.",
				description: "cordis Service layer of the slot system; see the module doc for the split with SlotCore.",
				methods: [
					{
						signature: "declare readonly register: SlotCore['register']",
						description: "The ordinary Slot registration API. The typed face IS the core's register (both overloads reused verbatim — one authority, no structural copy; see SlotCore.register for children declaration, store seat, inject face, load-time validation, and the unload cascade). This layer adds: disposal through the caller's ctx.effect (fiber unload = cascade), exclusive-factory minting (`store: createXxxStore` becomes a per-entry handle), the registrant diagnostics stamp, and store-instance lifecycle on the entry axis.\n\nDeclared here, implemented by prototype assignment below the class: it MUST stay a prototype method (never an instance arrow) — the cordis service proxy binds `this.ctx` to the CALLER's context at call time, which is what routes the effect (and the unload cascade) into the caller's fiber. An arrow property would freeze `this` to the service's own root ctx and silently break per-plugin disposal.",
						parameters: []
					},
					{
						signature: "declare readonly registerFactory: RegisterFactory",
						description: "Register one reusable Component Factory under the caller's effect lifetime. A Store factory mints one handle per rendered occurrence rather than per definition. Like SlotRegistry.register, this remains a prototype method so the Cordis proxy binds `this.ctx` to the caller's Context.",
						parameters: [{
							name: "options",
							description: "runtime definition checked against `SlotFactoryMap`."
						}, {
							name: "component",
							description: "reusable Factory Component."
						}],
						returns: "the idempotent definition disposer."
					},
					{
						signature: "inject(key: keyof SlotMap & string, callback: () => SlotInjectionEffect): () => void",
						description: "Install an effect for each declaration lifetime of a slot. The callback runs synchronously when the declaration already exists; otherwise it runs inside the declaring `register()` call after the declaration is committed. Collapse disposes the effect and a later declaration runs it again. Callback effects are synchronous disposers; iterable effects install transactionally and dispose in reverse order. The controller belongs to the caller's fiber, so plugin unload cancels a pending wait and removes any active contribution.",
						parameters: [{
							name: "key",
							description: "declared SlotMap key to depend on."
						}, {
							name: "callback",
							description: "creates one disposer or an iterable of disposers."
						}],
						returns: "idempotent disposer for the wait and active effect.",
						throws: ["callback setup failures synchronously when the slot is already declared."]
					}
				]
			},
			{
				key: "theme",
				summary: "Theme registry and preference owner.",
				description: "Theme registry and preference owner. `light`/`dark` are built in (the base stylesheets carry both palettes); third-party themes register alias-layer overrides. Reads go through getTheme; preference writes only through setTheme; continuous sync only through the `theme/change` event. overrideTokens stacks partial token layers over the active theme without touching the registry. The service holds the `prefers-color-scheme` media query (environment sensing, not presentation) and re-emits when the OS scheme flips while the preference is `system`.",
				methods: [
					{
						signature: "getTheme(): ThemeSnapshot",
						description: "Read the current immutable theme snapshot.",
						parameters: [],
						returns: "the current snapshot (stable reference until the next change)."
					},
					{
						signature: "setTheme(id: string): void",
						description: "Switch the theme preference — the only user preference write entry. Built-in preferences are written through the settings scope and every accepted value emits `theme/change`.",
						parameters: [{
							name: "id",
							description: "a registered theme id or `system`; unknown ids throw."
						}]
					},
					{
						signature: "setFontSize(role: FontRole, px: number): void",
						description: "Change one role's font size. Accepted values are written through the settings scope and emit `theme/change`.",
						parameters: [{
							name: "role",
							description: "font role."
						}, {
							name: "px",
							description: "integer px within the role's `FONT_SIZE_SPECS` range; out-of-range or fractional values throw."
						}]
					},
					{
						signature: "register(definition: ThemeDefinition): () => void",
						description: "Register a theme. Duplicate id throws (single occupant per id; the built-in pair counts; `system` is a preference, not a registrable id).",
						parameters: [{
							name: "definition",
							description: "theme id, colorScheme, alias-token overrides, and optional icon replacements; the runtime keeps a frozen copy of `icons`. Invalid icon replacements throw a `TypeError` naming the theme and icon."
						}],
						returns: "disposer. Disposing the theme backing the active preference resets the preference to the default so the UI never keeps tokens of an unregistered theme."
					},
					{
						signature: "overrideTokens(source: string, tokens: ThemeTokenOverrides): () => void",
						description: "Stack a token override layer on top of the active theme — the token-level analogue of slot shading: the base theme stays untouched, layers compose in seq order with later layers winning per-token, and removing a layer restores whatever it covered. Calling again with the same source replaces that source's whole layer and restacks it on top (effect re-registration semantics). Emits `theme/change` with the recomposed snapshot.",
						parameters: [{
							name: "source",
							description: "layer identity; one layer per source (dynamic packages pass their package id — the façade pins it, so it also names the layer's origin for inspection)."
						}, {
							name: "tokens",
							description: "token-name → `{ light, dark }` value pairs. Validated at runtime (model-authored callers reach this boundary with untyped JS); a bare string value throws a teaching error."
						}],
						returns: "disposer removing exactly the layer this call created; a no-op once the source has re-overridden (the newer layer is not torn down)."
					}
				]
			},
			{
				key: "timer",
				summary: "Disposable timer helpers mixed into Cordis contexts.",
				description: "Disposable timer helpers mixed into Cordis contexts.",
				methods: [
					{
						signature: "timeout(callback: () => void, delay: number): () => void",
						description: "Run a callback once and return its disposer.",
						parameters: []
					},
					{
						signature: "timeout(delay: number): Promise<void>",
						description: "Resolve after a delay; disposal rejects the pending promise.",
						parameters: []
					},
					{
						signature: "interval(callback: () => void, delay: number): () => void",
						description: "Run a callback repeatedly and return its disposer.",
						parameters: []
					},
					{
						signature: "interval<R = any>(delay: number): AsyncIterableIterator<void, R, void>",
						description: "Return an async iterator of timer ticks.",
						parameters: []
					},
					{
						signature: "throttle<F extends (...args: any[]) => any>(callback: F, delay: number, noTrailing?: boolean): ((...args: Parameters<F>) => void) & { dispose: () => void }",
						description: "Return a throttled function whose timer is disposed with the current fiber.",
						parameters: []
					},
					{
						signature: "debounce<F extends (...args: any[]) => any>(callback: F, delay: number): ((...args: Parameters<F>) => void) & { dispose: () => void }",
						description: "Return a debounced function whose timer is disposed with the current fiber.",
						parameters: []
					}
				]
			},
			{
				key: "uiWorkspace",
				summary: "Workspace archive and directory operations consumed by Client UI domains.",
				description: "Workspace archive and directory operations consumed by Client UI domains.",
				methods: [
					{
						signature: "openSession(target: SessionTarget): void",
						description: "Select a Session and show its Conversation as one UI navigation action.",
						parameters: [{
							name: "target",
							description: "known Session identity or durable direct-parent subagent address to display."
						}]
					},
					{
						signature: "openWorkspace( workspaceId: WorkspaceId, beforeOpen?: (sessionId: SessionId) => void, options?: Pick<StartSessionOptions, 'agentPreset'>, ): Promise<void>",
						description: "Connect a Workspace and open its Session unless a later navigation supersedes it.",
						parameters: [
							{
								name: "workspaceId",
								description: "target Workspace."
							},
							{
								name: "beforeOpen",
								description: "optional synchronous preparation for the selected Session, skipped after supersession; a throw aborts the open and releases the retained reference."
							},
							{
								name: "options",
								description: "choices for the Session the connection creates or reuses."
							}
						],
						returns: "completion; a superseded request may create a Session but does not open it.",
						throws: ["on failure; a refused creation is also shown through the Workspace notice unless a later navigation or disposal superseded the request."]
					},
					{
						signature: "forkSession( sessionId: SessionId, onCreated?: (childId: SessionId) => void, options?: Pick<Parameters<ISessions['fork']>[0], 'allowMigration'>, ): Promise<SessionId>",
						description: "Fork a Session without changing the current selection.",
						parameters: [
							{
								name: "sessionId",
								description: "source Session."
							},
							{
								name: "onCreated",
								description: "observer before the optional child-title update."
							},
							{
								name: "options",
								description: "optional permission to start source migration; omission preserves the Host default."
							}
						],
						returns: "the child SessionId after creation and inherited-title increment."
					},
					{
						signature: "connectWorkspace(workspaceId: WorkspaceId, options?: Pick<StartSessionOptions, 'agentPreset'>): Promise<SessionId>",
						description: "Resolve the Session for a new conversation in a Workspace: navigation names the first reusable blank member — listed in the Workspace, not archived, and listing no preset or the requested one — and the Host reuses it under the requested preset or its default, creating another Session when it reuses none. Concurrent calls for the same Workspace and preset share one attempt.",
						parameters: [{
							name: "workspaceId",
							description: "target Workspace."
						}, {
							name: "options",
							description: "choices for the created or reused Session."
						}],
						returns: "a Session already addressable through the Session Controller."
					},
					{
						signature: "startSession(workspaceId?: WorkspaceId, options?: StartSessionOptions): void",
						description: "Open the Workspace blank `connectWorkspace` resolves, so New Session returns to that blank's unsent draft. A creation the Host refuses is shown through the Workspace notice and leaves the selection as it was.",
						parameters: [{
							name: "workspaceId",
							description: "explicit target; absent inherits the current or most recent Workspace."
						}, {
							name: "options",
							description: "initial content, the blank's preset, and `whenDraftExists`, which decides whether existing text or attachments are kept, replaced, or followed by the prompt."
						}]
					},
					{
						signature: "archiveSession(sessionId: SessionId, options?: { readonly stopActivity?: boolean }): Promise<void>",
						description: "Archive a Session and clear it when it is the current selection.",
						parameters: [{
							name: "sessionId",
							description: "Session to archive."
						}, {
							name: "options",
							description: "`stopActivity` asks the Host to stop the Session's running work instead of refusing."
						}]
					},
					{
						signature: "unarchiveSession(sessionId: SessionId): Promise<void>",
						description: "Unarchive a Session, restoring it to its recorded Workspace position.",
						parameters: [{
							name: "sessionId",
							description: "Session to unarchive."
						}]
					},
					{
						signature: "pickDirectory(): Promise<string | null>",
						description: "Open the Host-native directory picker.",
						parameters: [],
						returns: "the selected directory, or null when cancelled."
					},
					{
						signature: "listDirectory(path?: string, signal?: AbortSignal): Promise<DirectoryListing>",
						description: "List one Host directory level.",
						parameters: [{
							name: "path",
							description: "directory path; absent selects the Host home."
						}, {
							name: "signal",
							description: "cancellation for a superseded scan."
						}],
						returns: "directory entries and breadcrumb ancestry."
					},
					{
						signature: "createDirectory(path: string, name: string): Promise<string>",
						description: "Create a child directory.",
						parameters: [{
							name: "path",
							description: "existing parent directory."
						}, {
							name: "name",
							description: "child directory name."
						}],
						returns: "created absolute path."
					}
				]
			},
			{
				key: "workspaces",
				summary: "Workspace Controller's Client service face.",
				description: "Workspace Controller's Client service face.",
				methods: [
					{
						signature: "create(input: { path: string }): Promise<WorkspaceView>",
						description: "Register an existing path as a Workspace.",
						parameters: [{
							name: "input",
							description: "Host create payload."
						}],
						returns: "the created or idempotently resolved Workspace."
					},
					{
						signature: "rename(workspaceId: WorkspaceId, title: string): Promise<WorkspaceView>",
						description: "Rename a Workspace.",
						parameters: [{
							name: "workspaceId",
							description: "target Workspace."
						}, {
							name: "title",
							description: "new display title."
						}],
						returns: "the renamed Workspace."
					},
					{
						signature: "delete(workspaceId: WorkspaceId): Promise<void>",
						description: "Delete a Workspace registration without deleting Sessions or files.",
						parameters: [{
							name: "workspaceId",
							description: "target Workspace."
						}]
					},
					{
						signature: "archiveSession(sessionId: SessionId, options?: { readonly stopActivity?: boolean }): Promise<void>",
						description: "Archive a Session from Workspace grouping surfaces.",
						parameters: [{
							name: "sessionId",
							description: "Session to archive."
						}, {
							name: "options",
							description: "`stopActivity` asks the Host to stop the Session's running work instead of refusing."
						}],
						throws: ["{WorkspaceArchiveError} when the Host refuses; without `stopActivity` a Session with running work fails as `workspace/session-active`, its details naming what runs."]
					},
					{
						signature: "unarchiveSession(sessionId: SessionId): Promise<void>",
						description: "Unarchive a Session from the archived Session list.",
						parameters: [{
							name: "sessionId",
							description: "Session to unarchive."
						}]
					},
					{
						signature: "insertSessionBefore( workspaceId: WorkspaceId, sessionId: SessionId, beforeSessionId?: SessionId, ): Promise<WorkspaceView>",
						description: "Move a Session within one Workspace account.",
						parameters: [
							{
								name: "workspaceId",
								description: "owning Workspace."
							},
							{
								name: "sessionId",
								description: "Session to move."
							},
							{
								name: "beforeSessionId",
								description: "anchor Session; omitted appends."
							}
						],
						returns: "the changed Workspace."
					}
				]
			}
		];
		/** Every harness event, sorted by name. */
		const EVENT_API = [
			{
				name: "connection/reset",
				mode: "emit",
				signature: "'connection/reset'(): void",
				summary: "A connection generation was established.",
				description: "A connection generation was established. Wire-derived caches must repull; long-lived streams own their own resume and baseline lifecycle.",
				parameters: []
			},
			{
				name: "locale/change",
				mode: "emit",
				signature: "'locale/change'(snapshot: LocaleSnapshot): void",
				summary: "The active locale switched.",
				description: "The active locale switched. Dictionary registrations do NOT emit this event (listeners may re-register slots in response, and boot registers one namespace per package); continuous render refresh rides the LocaleFace revision instead.",
				parameters: [{
					name: "snapshot",
					description: "Current immutable locale snapshot."
				}]
			},
			{
				name: "slots/changed",
				mode: "emit",
				signature: "'slots/changed'(key: string): void",
				summary: "An ordinary Slot declaration or entry registration set changed.",
				description: "An ordinary Slot declaration or entry registration set changed. Factory definitions publish through `subscribeFactory()` instead.",
				parameters: [{
					name: "key",
					description: "mutated SlotMap key."
				}]
			},
			{
				name: "theme/change",
				mode: "emit",
				signature: "'theme/change'(snapshot: ThemeSnapshot): void",
				summary: "Theme state changed (preference switched, registry updated, or the OS color scheme changed while the preference is `system`).",
				description: "Theme state changed (preference switched, registry updated, or the OS color scheme changed while the preference is `system`).",
				parameters: [{
					name: "snapshot",
					description: "Current immutable theme snapshot."
				}]
			}
		];
		/** Shapes of every exported type the Service and Event signatures reference (transitively), sorted by name. */
		const TYPE_API = [
			{
				name: "ActionsDecl",
				declaration: "export type ActionsDecl<T> = Record<string, (draft: T, ...params: any[]) => void>;"
			},
			{
				name: "AgentContext",
				declaration: "export type AgentContext = Omit<Context, 'remote'> & {\n    readonly remote: ClientRemote & TypertRemoteScopeApi<'agent'>;\n};"
			},
			{
				name: "AssistantLiveChunkEvent",
				declaration: "export interface AssistantLiveChunkEvent {\n    readonly type: 'assistant/live-chunk';\n    readonly seq: number;\n    readonly time: number;\n    readonly data: {\n        readonly attemptId: LlmAttemptId;\n        readonly turn: number;\n        readonly step: number;\n        readonly chunk: StreamChunk;\n    };\n}"
			},
			{
				name: "BakedActions",
				declaration: "export type BakedActions<T, A extends ActionsDecl<T>> = {\n    [K in keyof A]: A[K] extends (draft: T, ...params: infer P) => void ? (...params: P) => void : never;\n};"
			},
			{
				name: "BeginSubmissionInput",
				declaration: "export interface BeginSubmissionInput {\n    readonly mode: 'queue' | 'steer';\n    readonly text: string;\n    readonly attachments: readonly PendingSubmissionAttachment[];\n    readonly onRetire?: (retirement: PendingSubmissionRetirement) => void;\n}"
			},
			{
				name: "BoundActions",
				declaration: "export type BoundActions<H> = H extends StoreHandle<infer T, infer A> ? BakedActions<T, A> : never;"
			},
			{
				name: "BuiltInLocaleId",
				declaration: "export type BuiltInLocaleId = typeof LOCALE_IDS[number];"
			},
			{
				name: "ChainKeysOf",
				declaration: "export type ChainKeysOf<S extends keyof SlotMap & string> = S extends unknown ? (SlotMap[S]['kind'] extends 'chain' ? S : never) : never;"
			},
			{
				name: "ChainRenderOpts",
				declaration: "export interface ChainRenderOpts {\n    fallback?: ReactNode;\n    fallbackOnly?: boolean;\n    overlay?: boolean;\n}"
			},
			{
				name: "ChildrenDecl",
				declaration: "export type ChildrenDecl = {\n    [P in keyof SlotMap & string]?: SlotSpec<SlotMap[P]>;\n};"
			},
			{
				name: "ClientConnectionRpc",
				declaration: "export interface ClientConnectionRpc {\n    call(channel: string, endpoint: string, payload: unknown, signal?: AbortSignal): Promise<ConnectionRpcResult<unknown>>;\n    readonly open?: (channel: string, endpoint: string, payload: unknown, signal: AbortSignal, uplink?: AsyncIterable<unknown>) => AsyncIterable<unknown>;\n}"
			},
			{
				name: "ClientRemote",
				declaration: "export interface ClientRemote extends TypertClientRemote {\n    $stream<Item>(options: RemoteStreamOptions<Item>): RemoteStream<Item>;\n    readonly $host: RemoteHostFacts;\n}"
			},
			{
				name: "CommonKeyOf",
				declaration: "export type CommonKeyOf = LocaleNamespaceMap extends {\n    common: infer C;\n} ? C & string : never;"
			},
			{
				name: "ComposedProps",
				declaration: "export type ComposedProps<K extends keyof SlotMap & string, EntryKey extends EntryKeyOf<K>, S extends keyof SlotMap & string, H, I extends object, M = never, N = undefined> = PropsRuntime<K, EntryKey> & PropsRenderSlots<S> & PropsRenderFactories & PropsStore<H> & InjectFace<I> & MatchedShare<SlotMap[K], M> & PropsLocale<N>;"
			},
			{
				name: "ConnectionGeneration",
				declaration: "export interface ConnectionGeneration {\n    readonly id: number;\n    readonly host: ConnectionHostInfo;\n}"
			},
			{
				name: "ConnectionGenerationSource",
				declaration: "export type ConnectionGenerationSource = (signal: AbortSignal, ready: (host: ConnectionHostInfo) => void) => Promise<void>;"
			},
			{
				name: "ConnectionGenerationState",
				declaration: "export interface ConnectionGenerationState {\n    getSnapshot(): ConnectionGeneration | undefined;\n    subscribe(listener: () => void): () => void;\n}"
			},
			{
				name: "ConnectionHandle",
				declaration: "export interface ConnectionHandle {\n    readonly interactions: ConnectionInteractions;\n    readonly isLoopback: boolean;\n    readonly generation: ConnectionGenerationState;\n    readonly state: ConnectionStateSource;\n    readonly rpc: ClientConnectionRpc;\n    openWebSocket(path: string): ConnectionWebSocket;\n    reconnect(): void;\n    registerGenerationSource(source: ConnectionGenerationSource): () => void;\n    start(sinks: ConnectionSinks, config?: ConnectionRecoveryConfig): ConnectionLoop;\n}"
			},
			{
				name: "ConnectionHostInfo",
				declaration: "export interface ConnectionHostInfo {\n    readonly home: string;\n}"
			},
			{
				name: "ConnectionInteractions",
				declaration: "export type ConnectionInteractions = 'answer' | 'none';"
			},
			{
				name: "ConnectionLoop",
				declaration: "export interface ConnectionLoop {\n    stop(): void;\n}"
			},
			{
				name: "ConnectionRecoveryConfig",
				declaration: "export interface ConnectionRecoveryConfig {\n    backoffBaseMs?: number;\n    backoffFactor?: number;\n    backoffMaxMs?: number;\n    generationReadyWarnMs?: number;\n    generationReadyTimeoutMs?: number;\n}"
			},
			{
				name: "ConnectionRpcFailure",
				declaration: "export interface ConnectionRpcFailure {\n    readonly code: string;\n    readonly message: string;\n    readonly details: object;\n}"
			},
			{
				name: "ConnectionRpcResult",
				declaration: "export type ConnectionRpcResult<T> = {\n    readonly ok: true;\n    readonly value: T;\n} | {\n    readonly ok: false;\n    readonly error: ConnectionRpcFailure;\n};"
			},
			{
				name: "ConnectionSinks",
				declaration: "export interface ConnectionSinks {\n    onConnected?: (host: ConnectionHostInfo) => void;\n    onStateChange?: (state: ConnectionState) => void;\n    onReconnectRequested?: () => void;\n}"
			},
			{
				name: "ConnectionState",
				declaration: "export type ConnectionState = 'connected' | 'disconnected' | 'connecting';"
			},
			{
				name: "ConnectionStateSource",
				declaration: "export interface ConnectionStateSource {\n    getSnapshot(): ConnectionState | undefined;\n    subscribe(listener: () => void): () => void;\n}"
			},
			{
				name: "ConnectionWebSocket",
				declaration: "export interface ConnectionWebSocket {\n    readonly readyState: number;\n    send(data: string): void;\n    close(code?: number, reason?: string): void;\n    addEventListener<Event extends keyof ConnectionWebSocketEventMap>(event: Event, listener: (event: ConnectionWebSocketEventMap[Event]) => void, options?: {\n        readonly once?: boolean;\n    }): void;\n    removeEventListener<Event extends keyof ConnectionWebSocketEventMap>(event: Event, listener: (event: ConnectionWebSocketEventMap[Event]) => void): void;\n}"
			},
			{
				name: "ConnectionWebSocketEventMap",
				declaration: "export interface ConnectionWebSocketEventMap {\n    readonly open: object;\n    readonly error: object;\n    readonly close: object;\n    readonly message: {\n        readonly data: unknown;\n    };\n}"
			},
			{
				name: "DraftInitializationOptions",
				declaration: "export interface DraftInitializationOptions {\n    readonly prompt?: string;\n    readonly clearPreviousDraft?: boolean;\n    readonly whenDraftExists?: 'replace' | 'append' | 'keep';\n}"
			},
			{
				name: "EntryKeyOf",
				declaration: "export type EntryKeyOf<K extends keyof SlotMap & string> = SlotMap[K] extends {\n    kind: 'keyed';\n    keyProps: infer P extends object;\n} ? keyof P & string : string;"
			},
			{
				name: "FactoryComponentPropsOf",
				declaration: "export type FactoryComponentPropsOf<F extends keyof SlotFactoryMap & string> = FactoryInputPropsOf<F> & FactoryRegistrationPropsOf<F> & ScopeStandardProps<FactoryDefOf<F>['scope']> & {\n    useFactorySlot: UseFactorySlot<F>;\n};"
			},
			{
				name: "FactoryInjectParams",
				declaration: "export type FactoryInjectParams<F extends keyof SlotFactoryMap & string> = FactoryDefOf<F>['scope'] extends 'session' ? ([\n    FactoryStoreOf<F>\n] extends [\n    StoreDecl\n] ? [\n    sessionId: SessionIdOf,\n    actions: BoundActions<FactoryStoreOf<F>>\n] : [\n    sessionId: SessionIdOf\n]) : FactoryDefOf<F>['scope'] extends 'session-maybe' ? ([\n    FactoryStoreOf<F>\n] extends [\n    StoreDecl\n] ? [\n    sessionId: SessionIdOf | undefined,\n    actions: BoundActions<FactoryStoreOf<F>> | undefined\n] : [\n    sessionId: SessionIdOf | undefined\n]) : ([\n    FactoryStoreOf<F>\n] extends [\n    StoreDecl\n] ? [\n    actions: BoundActions<FactoryStoreOf<F>>\n] : [\n]);"
			},
			{
				name: "FactoryLocalComponent",
				declaration: "export type FactoryLocalComponent<F extends keyof SlotFactoryMap & string, N extends FactoryLocalNameOf<F>> = SlotComponent<FactoryLocalComponentPropsOf<F, N>>;"
			},
			{
				name: "FactoryLocalComponentPropsOf",
				declaration: "export type FactoryLocalComponentPropsOf<F extends keyof SlotFactoryMap & string, N extends FactoryLocalNameOf<F>> = FactoryLocalInputPropsOf<F, N> & FactoryRegistrationPropsOf<F> & ScopeStandardProps<FactoryLocalDefOf<F, N>['scope']>;"
			},
			{
				name: "FactoryRegistrationPropsOf",
				declaration: "export type FactoryRegistrationPropsOf<F extends keyof SlotFactoryMap & string> = FactoryRenderPropsOf<F> & PropsStore<FactoryStoreOf<F>> & InjectFace<FactoryInjectOf<F>> & PropsLocale<FactoryLocaleOf<F>> & PropsRenderFactories;"
			},
			{
				name: "FontFamilies",
				declaration: "export type FontFamilies = Readonly<Record<FontRole, string>>;"
			},
			{
				name: "FontRole",
				declaration: "export type FontRole = typeof FONT_ROLES[number];"
			},
			{
				name: "FontSizes",
				declaration: "export type FontSizes = Readonly<Record<FontRole, number>>;"
			},
			{
				name: "GlobalStandardProps",
				declaration: "export interface GlobalStandardProps {\n}"
			},
			{
				name: "HandleOf",
				declaration: "export type HandleOf<H> = H extends () => infer R ? R : H;"
			},
			{
				name: "HooksSources",
				declaration: "export type HooksSources = Record<string, HostObservable<unknown>>;"
			},
			{
				name: "HostObservable",
				declaration: "export type HostObservable<T> = ObservableSnapshot<T>;"
			},
			{
				name: "IconGlyph",
				declaration: "export type IconGlyph = keyof typeof ICON_ARTWORK;"
			},
			{
				name: "IconReplacements",
				declaration: "export type IconReplacements = Readonly<Partial<Record<IconSymbolId, string>>>;"
			},
			{
				name: "IconSymbolId",
				declaration: "export type IconSymbolId = `dsw-icon-${IconGlyph}-${IconWeight}`;"
			},
			{
				name: "IconWeight",
				declaration: "export type IconWeight = 'regular' | 'medium';"
			},
			{
				name: "InjectFace",
				declaration: "export type InjectFace<I extends object> = I extends {\n    hooks: infer HS extends HooksSources;\n} ? I extends {\n    keyedHooks: infer KS extends KeyedHooksSources;\n} ? Omit<I, 'hooks' | 'keyedHooks'> & PropsHooks<HS> & PropsKeyedHooks<KS> : Omit<I, 'hooks'> & PropsHooks<HS> : I extends {\n    keyedHooks: infer KS extends KeyedHooksSources;\n} ? Omit<I, 'keyedHooks'> & PropsKeyedHooks<KS> : I;"
			},
			{
				name: "InjectParams",
				declaration: "export type InjectParams<K extends keyof SlotMap & string, H> = ScopeOf<K> extends 'session' ? ([\n    H\n] extends [\n    StoreDecl\n] ? [\n    sessionId: SessionIdOf,\n    actions: BoundActions<HandleOf<H>>\n] : [\n    sessionId: SessionIdOf\n]) : ScopeOf<K> extends 'session-maybe' ? ([\n    H\n] extends [\n    StoreDecl\n] ? [\n    sessionId: SessionIdOf | undefined,\n    actions: BoundActions<HandleOf<H>> | undefined\n] : [\n    sessionId: SessionIdOf | undefined\n]) : ([\n    H\n] extends [\n    StoreDecl\n] ? [\n    actions: BoundActions<HandleOf<H>>\n] : [\n]);"
			},
			{
				name: "ISession",
				declaration: "export interface ISession {\n    readonly sessionId: SessionId;\n    readonly projections: ProjectionsFace;\n    beginSubmission(input: BeginSubmissionInput): SubmissionHandle;\n    prompt(content: PromptContentPart[], mode: 'queue' | 'steer', signal?: AbortSignal, requestId?: SessionRequestId): Promise<RemoteResult<{\n        accepted: true;\n    }>>;\n    readAttachment(attachmentId: AttachmentIdType): Promise<RemoteResult<{\n        attachment: ImageAttachmentRef;\n        data: Uint8Array;\n    }>>;\n    updateQueue(itemId: MessageId, action: QueueAction): Promise<RemoteResult<{\n        accepted: true;\n    }>>;\n    cancel(): Promise<RemoteResult<{\n        accepted: true;\n    }>>;\n    rename(title: string): Promise<RemoteResult<{\n        title: string;\n        seq: SessionSeq;\n    }>>;\n    loadOlder(): Promise<void>;\n    loadThrough(seq: SessionSeq): Promise<void>;\n    command(line: string): Promise<RemoteResult<{\n        matched: boolean;\n    }>>;\n}"
			},
			{
				name: "ISessions",
				declaration: "export interface ISessions {\n    readonly list: ObservableSnapshot<SessionListState>;\n    retain(target: SessionTarget, options: SessionRetainOptions): SessionReference;\n    using<T>(target: SessionTarget, options: SessionRetainOptions, operation: (reference: SessionReference) => T | Promise<T>): Promise<T>;\n    retainInfo(id: SessionId): ObservableSnapshot<SessionRetainInfo>;\n    readonly searchResultLimit: number;\n    create(opts?: {\n        workspaceId?: WorkspaceId;\n        cwd?: string;\n        sessionId?: SessionId;\n        agentPreset?: string;\n    }): Promise<SessionId>;\n    subagentAddress(id: SessionId): SubagentAddress | undefined;\n    refreshProjections(sessionId: SessionId): Promise<void>;\n    refresh(): Promise<void>;\n    search(query: string, signal: AbortSignal): Promise<RemoteResult<{\n        items: SessionSearchResultItem[];\n        hasMore: boolean;\n    }>>;\n    fork(opts: {\n        sessionId: SessionId;\n        atSeq?: number;\n        increaseTitle?: boolean;\n        onCreated?: (childId: SessionId) => void;\n        allowMigration?: boolean;\n    }): Promise<SessionId>;\n    scope(id: SessionId): AgentContext | undefined;\n    scopeOf(ctx: Context): SessionId | undefined;\n    sessionOf(ctx: Context): SessionFace | undefined;\n    binding(id: SessionId): SessionBinding | undefined;\n}"
			},
			{
				name: "KeyedHooksSources",
				declaration: "export type KeyedHooksSources = Record<string, KeyedStandardSource>;"
			},
			{
				name: "KeyedSnapshotSelectorHook",
				declaration: "export type KeyedSnapshotSelectorHook<Snapshot> = {\n    (key: string): Snapshot | undefined;\n    <Selected>(key: string, selector: (value: Snapshot | undefined) => Selected, equal?: (left: Selected, right: Selected) => boolean): Selected;\n};"
			},
			{
				name: "KeyedStandardSource",
				declaration: "export type KeyedStandardSource = (key: string, member?: string) => HostObservable<unknown> | undefined;"
			},
			{
				name: "KeyPropsOf",
				declaration: "export type KeyPropsOf<K extends keyof SlotMap & string, EntryKey extends EntryKeyOf<K>> = SlotMap[K] extends {\n    kind: 'keyed';\n    keyProps: infer P extends object;\n} ? EntryKey extends keyof P ? P[EntryKey] extends object ? P[EntryKey] : never : never : object;"
			},
			{
				name: "LanguageRegistration",
				declaration: "export interface LanguageRegistration {\n    id: LocaleId;\n    label: string;\n    fallback: LocaleId;\n}"
			},
			{
				name: "LiveCompositionNode",
				declaration: "export type LiveCompositionNode = LiveSlotNode | LiveFactoryNode;"
			},
			{
				name: "LiveFactoryNode",
				declaration: "export interface LiveFactoryNode {\n    type: 'factory';\n    name: string;\n    scope: SlotScope;\n    registrant?: string;\n    children: LiveSlotNode[];\n}"
			},
			{
				name: "LiveSlotNode",
				declaration: "export interface LiveSlotNode {\n    type: 'slot';\n    name: string;\n    kind: SlotKind;\n    scope: SlotScope;\n    declaredBy?: string;\n    occupants: LiveSlotOccupant[];\n    children: LiveSlotNode[];\n}"
			},
			{
				name: "LiveSlotOccupant",
				declaration: "export interface LiveSlotOccupant {\n    registrant?: string;\n    key?: string;\n    id?: string;\n    order?: number;\n    priority: number;\n    active: boolean;\n}"
			},
			{
				name: "LocaleDefinition",
				declaration: "export interface LocaleDefinition {\n    readonly id: LocaleId;\n    readonly label: string;\n    readonly fallback?: LocaleId;\n}"
			},
			{
				name: "LocaleDict",
				declaration: "export type LocaleDict = Record<string, string>;"
			},
			{
				name: "LocaleDictOf",
				declaration: "export type LocaleDictOf<N extends keyof LocaleNamespaceMap & string> = Record<LocaleNamespaceMap[N] & string, string>;"
			},
			{
				name: "LocaleId",
				declaration: "export type LocaleId = string;"
			},
			{
				name: "LocaleKeysOf",
				declaration: "export type LocaleKeysOf<N extends keyof LocaleNamespaceMap & string> = (LocaleNamespaceMap[N] & string) | CommonKeyOf;"
			},
			{
				name: "LocaleNamespaceMap",
				declaration: "export interface LocaleNamespaceMap {\n}"
			},
			{
				name: "LocaleSnapshot",
				declaration: "export interface LocaleSnapshot {\n    active: LocaleId;\n    locales: readonly LocaleDefinition[];\n    revision: number;\n}"
			},
			{
				name: "MainPanelId",
				declaration: "export type MainPanelId = Branded<'MainPanelId'>;"
			},
			{
				name: "MatchedShare",
				declaration: "export type MatchedShare<E extends SlotEntryDef, M> = E['kind'] extends 'chain' ? {\n    matched: M;\n} : object;"
			},
			{
				name: "ObservableSnapshot",
				declaration: "export interface ObservableSnapshot<T> {\n    getSnapshot(): T;\n    subscribe(fn: () => void): () => void;\n}"
			},
			{
				name: "OpenState",
				declaration: "export type OpenState = 'cold' | 'loading' | 'open' | 'error';"
			},
			{
				name: "OwnerOf",
				declaration: "export type OwnerOf<K extends keyof SlotMap & string> = SlotMap[K] extends {\n    owner: infer O extends object;\n} ? O : object;"
			},
			{
				name: "PendingSubmission",
				declaration: "export interface PendingSubmission {\n    readonly requestId: SessionRequestId;\n    readonly placement: PendingSubmissionPlacement;\n    readonly time: number;\n    readonly text: string;\n    readonly attachments: readonly PendingSubmissionAttachment[];\n}"
			},
			{
				name: "PendingSubmissionAttachment",
				declaration: "export type PendingSubmissionAttachment = PendingSubmissionImageAttachment | PendingSubmissionFileAttachment;"
			},
			{
				name: "PendingSubmissionFileAttachment",
				declaration: "export interface PendingSubmissionFileAttachment {\n    readonly type: 'file';\n    readonly value: FileAttachmentRef;\n}"
			},
			{
				name: "PendingSubmissionImage",
				declaration: "export interface PendingSubmissionImage {\n    readonly previewUrl: string;\n    readonly name?: string;\n    readonly width?: number;\n    readonly height?: number;\n}"
			},
			{
				name: "PendingSubmissionImageAttachment",
				declaration: "export interface PendingSubmissionImageAttachment {\n    readonly type: 'image';\n    readonly value: PendingSubmissionImage;\n}"
			},
			{
				name: "PendingSubmissionPlacement",
				declaration: "export type PendingSubmissionPlacement = 'transcript' | 'queued' | 'steering';"
			},
			{
				name: "PendingSubmissionRetirement",
				declaration: "export type PendingSubmissionRetirement = {\n    readonly reason: 'observed';\n    readonly attachments: readonly (ImageAttachmentRef | FileAttachmentRef)[];\n} | {\n    readonly reason: 'failed';\n};"
			},
			{
				name: "ProjectionsFace",
				declaration: "export interface ProjectionsFace {\n    faceOf(key: string): ObservableSnapshot<unknown>;\n}"
			},
			{
				name: "PromptContentPart",
				declaration: "export type PromptContentPart = {\n    readonly type: 'text';\n    readonly text: string;\n} | {\n    readonly type: 'image';\n    readonly mediaType: ImageMediaType;\n    readonly data: string;\n    readonly name?: string;\n} | {\n    readonly type: 'file';\n    readonly receiptId: Branded<'file-upload-receipt-id'>;\n};"
			},
			{
				name: "PromptError",
				declaration: "export interface PromptError {\n    readonly op: 'send' | 'stop';\n    readonly error: RemoteFailure;\n}"
			},
			{
				name: "PropsHooks",
				declaration: "export type PropsHooks<HS extends HooksSources> = {\n    [N in keyof HS & string as `use${Capitalize<N>}`]: SnapshotSelectorHook<HS[N] extends HostObservable<infer T> ? T : never>;\n};"
			},
			{
				name: "PropsKeyedHooks",
				declaration: "export type PropsKeyedHooks<HS extends KeyedHooksSources> = {\n    [N in keyof HS & string as `use${Capitalize<N>}`]: KeyedSnapshotSelectorHook<HS[N] extends (key: string) => HostObservable<infer T> | undefined ? T : never>;\n};"
			},
			{
				name: "PropsLocale",
				declaration: "export type PropsLocale<N> = N extends keyof LocaleNamespaceMap & string ? {\n    t: TranslateNS<N>;\n} : object;"
			},
			{
				name: "PropsRenderFactories",
				declaration: "export interface PropsRenderFactories {\n    renderFactorySlot: RenderFactorySlot;\n}"
			},
			{
				name: "PropsRenderSlots",
				declaration: "export type PropsRenderSlots<S extends keyof SlotMap & string> = {\n    renderSlot: RenderSlotFn<Exclude<S, ChainKeysOf<S>>>;\n    readonly __renders?: ((key: S) => void) | undefined;\n} & ([\n    ChainKeysOf<S>\n] extends [\n    never\n] ? object : {\n    renderSlotChain: <K extends ChainKeysOf<S>>(key: K, owner: OwnerOf<K>, opts?: ChainRenderOpts) => ReactNode;\n}) & ([\n    Extract<ScopeOf<S>, 'session' | 'session-maybe'>\n] extends [\n    never\n] ? object : {\n    SessionProvider: SessionProviderComponent;\n});"
			},
			{
				name: "PropsRuntime",
				declaration: "export type PropsRuntime<K extends keyof SlotMap & string, EntryKey extends EntryKeyOf<K> = EntryKeyOf<K>> = OwnerOf<K> & KeyPropsOf<K, EntryKey> & SlotInjectFace<SlotInjectOf<K>> & ScopeStandardProps<ScopeOf<K>>;"
			},
			{
				name: "PropsSlotHooks",
				declaration: "export type PropsSlotHooks<HS extends object> = {\n    [N in keyof HS & string as `use${Capitalize<N>}`]: BoundHookOf<HS[N]>;\n};"
			},
			{
				name: "PropsStore",
				declaration: "export type PropsStore<H> = H extends StoreHandle<infer T, infer A> ? {\n    useStore: SnapshotSelectorHook<T>;\n    actions: BakedActions<T, A>;\n} : object;"
			},
			{
				name: "QueueAction",
				declaration: "export type QueueAction = {\n    readonly kind: 'edit';\n    readonly content: readonly TextBlock[];\n} | {\n    readonly kind: 'remove';\n} | {\n    readonly kind: 'steer';\n};"
			},
			{
				name: "RegisterFactory",
				declaration: "export interface RegisterFactory {\n    <F extends keyof SlotFactoryMap & string>(options: RegisterFactoryOptions<F>, component: SlotComponent<FactoryComponentPropsOf<F>>): () => void;\n}"
			},
			{
				name: "RegisterFactoryOptions",
				declaration: "export type RegisterFactoryOptions<F extends keyof SlotFactoryMap & string> = {\n    name: F;\n    scope: FactoryDefOf<F>['scope'];\n} & FactoryField<F, 'children', FactoryChildrenOf<F>> & FactoryField<F, 'store', FactoryStoreOf<F> | (() => FactoryStoreOf<F>)> & FactoryField<F, 'inject', (...args: FactoryInjectParams<F>) => FactoryInjectOf<F>> & FactoryField<F, 'locale', FactoryLocaleOf<F>> & FactoryField<F, 'slots', RuntimeFactorySlots<F>> & FactoryCollisionCheck<F> & FactoryChildrenCheck<F>;"
			},
			{
				name: "RemoteHostFacts",
				declaration: "export interface RemoteHostFacts {\n    readonly home: string | undefined;\n    readonly isLoopback: boolean;\n}"
			},
			{
				name: "RemoteStream",
				declaration: "export class RemoteStream<Item> implements AsyncIterable<RemoteStreamItem<Item>> {\n    constructor(private readonly connection: Pick<ConnectionHandle, 'generation'>, private readonly options: RemoteStreamOptions<Item>);\n    get signal(): AbortSignal;\n    restart(): void;\n    dispose(): Promise<void>;\n    [Symbol.asyncIterator](): AsyncIterator<RemoteStreamItem<Item>>;\n}"
			},
			{
				name: "RemoteStreamCarrierError",
				declaration: "export class RemoteStreamCarrierError extends Error {\n    constructor(message: string, options?: ErrorOptions);\n}"
			},
			{
				name: "RemoteStreamItem",
				declaration: "export interface RemoteStreamItem<Item> {\n    readonly generation: number;\n    readonly value: Item;\n    readonly signal: AbortSignal;\n    accept(): void;\n}"
			},
			{
				name: "RemoteStreamOptions",
				declaration: "export interface RemoteStreamOptions<Item> {\n    readonly name: string;\n    readonly open: (signal: AbortSignal) => AsyncIterable<Item>;\n    readonly ended: (accepted: boolean) => Error;\n    readonly carrierFailed?: (error: RemoteStreamCarrierError) => void;\n}"
			},
			{
				name: "RenderFactorySlot",
				declaration: "export type RenderFactorySlot = <F extends keyof SlotFactoryMap & string>(name: F, props: FactoryInputPropsOf<F>, options?: {\n    slots?: Partial<{\n        [N in FactoryLocalNameOf<F>]: FactoryLocalComponent<F, N>;\n    }>;\n    fallback?: ReactNode;\n}) => ReactNode;"
			},
			{
				name: "ScopeOf",
				declaration: "export type ScopeOf<K extends keyof SlotMap & string> = SlotMap[K]['scope'];"
			},
			{
				name: "ScopeStandardProps",
				declaration: "export type ScopeStandardProps<S extends SlotScope> = (S extends 'session' ? SessionStandardProps : S extends 'session-maybe' ? SessionMaybeStandardProps : object) & GlobalStandardProps;"
			},
			{
				name: "SessionAreaProps",
				declaration: "export interface SessionAreaProps {\n    readonly session?: SlotScopeTargetMap[keyof SlotScopeTargetMap & 'session'] | undefined;\n    empty?: (() => ReactNode) | undefined;\n    children: ReactNode;\n}"
			},
			{
				name: "SessionAssistantSettlementEntry",
				declaration: "export interface SessionAssistantSettlementEntry {\n    readonly type: 'event';\n    readonly event: SessionEvent<'assistant/message'> | SessionEvent<'assistant/attempt'>;\n}"
			},
			{
				name: "SessionBinding",
				declaration: "export interface SessionBinding {\n    readonly sessionId: SessionId;\n    readonly session: SessionFace;\n    readonly eventSource: SessionEventSource;\n    readonly ctx: AgentContext;\n}"
			},
			{
				name: "SessionEventChange",
				declaration: "export type SessionEventChange = {\n    readonly kind: 'replace';\n    readonly entries: readonly SessionEventLikeEntry[];\n} | {\n    readonly kind: 'prepend';\n    readonly entries: readonly SessionEventLikeEntry[];\n} | {\n    readonly kind: 'append';\n    readonly entries: readonly SessionEventLikeEntry[];\n} | {\n    readonly kind: 'settle-assistant';\n    readonly attemptId: LlmAttemptId;\n    readonly entry?: SessionAssistantSettlementEntry;\n};"
			},
			{
				name: "SessionEventLikeEntry",
				declaration: "export type SessionEventLikeEntry = {\n    readonly type: 'event';\n    readonly event: SessionEvent;\n} | {\n    readonly type: 'transient';\n    readonly event: AssistantLiveChunkEvent;\n};"
			},
			{
				name: "SessionEventSource",
				declaration: "export type SessionEventSource = ObservableSnapshot<SessionEventWindow>;"
			},
			{
				name: "SessionEventWindow",
				declaration: "export interface SessionEventWindow {\n    readonly entries: readonly SessionEventLikeEntry[];\n    readonly hasMore: boolean;\n    readonly revision: number;\n    readonly change: SessionEventChange;\n}"
			},
			{
				name: "SessionFace",
				declaration: "export type SessionFace = ISession & ObservableSnapshot<SessionSnapshot>;"
			},
			{
				name: "SessionIdOf",
				declaration: "export type SessionIdOf = SessionStandardProps extends {\n    sessionId: infer S;\n} ? S : string;"
			},
			{
				name: "SessionListPhase",
				declaration: "export type SessionListPhase = 'pending' | 'ready';"
			},
			{
				name: "SessionListState",
				declaration: "export interface SessionListState {\n    ids: SessionId[];\n    byId: Record<SessionId, SessionSummary>;\n    phase: SessionListPhase;\n    projectionsBySession: Readonly<Record<SessionId, SessionProjectionSnapshot>>;\n}"
			},
			{
				name: "SessionMaybeStandardProps",
				declaration: "export interface SessionMaybeStandardProps {\n}"
			},
			{
				name: "SessionProjectionSnapshot",
				declaration: "export interface SessionProjectionSnapshot {\n    readonly values: Readonly<Partial<SessionProjectionViewValues>>;\n    readonly state: 'idle' | 'loading' | 'ready' | 'migration-required' | 'error';\n    readonly error: RemoteFailure | null;\n}"
			},
			{
				name: "SessionProviderComponent",
				declaration: "export type SessionProviderComponent = (props: SessionAreaProps) => ReactNode;"
			},
			{
				name: "SessionReference",
				declaration: "export interface SessionReference extends Disposable {\n    readonly sessionId: SessionId;\n    readonly binding: SessionBinding;\n    readonly ready: Promise<SessionBinding>;\n    release(): void;\n}"
			},
			{
				name: "SessionReferenceSource",
				declaration: "export type SessionReferenceSource = Extract<keyof SessionReferenceSourceMap, string>;"
			},
			{
				name: "SessionReferenceSourceMap",
				declaration: "export interface SessionReferenceSourceMap {\n    controllerOperation: unknown;\n    gateway: unknown;\n}"
			},
			{
				name: "SessionRequestId",
				declaration: "export type SessionRequestId = Branded<'session-request-id'>;"
			},
			{
				name: "SessionRetainInfo",
				declaration: "export interface SessionRetainInfo {\n    readonly referenceCount: number;\n    readonly retainedBy: Readonly<Partial<Record<SessionReferenceSource, number>>>;\n}"
			},
			{
				name: "SessionRetainOptions",
				declaration: "export interface SessionRetainOptions {\n    readonly source: SessionReferenceSource;\n    readonly signal?: AbortSignal | undefined;\n}"
			},
			{
				name: "SessionSearchResultItem",
				declaration: "export interface SessionSearchResultItem {\n    sessionId: SessionId;\n    snippet: string;\n}"
			},
			{
				name: "SessionSnapshot",
				declaration: "export interface SessionSnapshot {\n    readonly sessionId: SessionId;\n    readonly pendingSubmissions: readonly PendingSubmission[];\n    readonly running: boolean;\n    readonly subagent: {\n        readonly address: SubagentAddress;\n        readonly parentAvailable?: boolean;\n    } | null;\n    readonly removed: boolean;\n    readonly openState: OpenState;\n    readonly openError: RemoteFailure | null;\n    readonly hasMore: boolean;\n    readonly loadingOlder: boolean;\n    readonly promptError: PromptError | null;\n    readonly blank: boolean;\n    readonly lastAgentError: string | null;\n    readonly promptAttempted: boolean;\n    readonly awaitingFirstTurn: boolean;\n}"
			},
			{
				name: "SessionStandardProps",
				declaration: "export interface SessionStandardProps {\n}"
			},
			{
				name: "SessionTarget",
				declaration: "export type SessionTarget = SessionId | SubagentAddress;"
			},
			{
				name: "SlotComponent",
				declaration: "export type SlotComponent<P> = (props: P) => ReactNode;"
			},
			{
				name: "SlotCore",
				declaration: "export class SlotCore {\n    constructor();\n    readonly registerFactory: RegisterFactory;\n    factory(name: string): StoredFactory | undefined;\n    factoryVersion(name: string): number;\n    subscribeFactory(name: string, listener: () => void): () => void;\n    isFactoryLive(definition: StoredFactory): boolean;\n    register<K extends keyof SlotMap & string, const EntryKey extends EntryKeyOf<K> = EntryKeyOf<K>, const D extends ChildrenDecl = Record<never, never>, H extends StoreDecl | undefined = undefined, M = never, N extends (keyof LocaleNamespaceMap & string) | undefined = undefined, C extends SlotComponent<never> = SlotComponent<never>>(options: BaseOptions<K, EntryKey, D, H, M, N> & {\n        inject?: undefined;\n    }, component: C & SlotComponent<ComposedProps<K, NoInfer<EntryKey>, keyof NoInfer<D> & keyof SlotMap & string, HandleOf<NoInfer<H>>, object, NoInfer<M>, NoInfer<N>>> & RendersCheck<C, D>): () => void;\n    register<K extends keyof SlotMap & string, I extends object, const EntryKey extends EntryKeyOf<K> = EntryKeyOf<K>, const D extends ChildrenDecl = Record<never, never>, H extends StoreDecl | undefined = undefined, M = never, N extends (keyof LocaleNamespaceMap & string) | undefined = undefined, C extends SlotComponent<never> = SlotComponent<never>>(options: BaseOptions<K, EntryKey, D, H, M, N> & {\n        inject: (...args: InjectParams<K, H>) => I;\n    }, component: C & SlotComponent<ComposedProps<K, NoInfer<EntryKey>, keyof NoInfer<D> & keyof SlotMap & string, HandleOf<NoInfer<H>>, I, NoInfer<M>, NoInfer<N>>> & RendersCheck<C, D>): () => void;\n    register(options: ErasedOptions, component: unknown): () => void;\n    isLive(entry: StoredEntry): boolean;\n    entries(key: string): readonly StoredEntry[];\n    entriesOfSlot(key: string): readonly StoredEntry[];\n    spec<K extends keyof SlotMap & string>(key: K): SlotSpec<SlotMap[K]> | undefined;\n    specDynamic(key: string): SlotSpec<SlotEntryDef> | undefined;\n    snapshot(root?: string): LiveCompositionNode[];\n    declarationEpoch(key: string): number;\n    subscribe(key: string, fn: () => void): () => void;\n    subscribeDeclaration(key: string, fn: () => void): () => void;\n    getVersion(key: string): number;\n    onMutate(fn: (key: string) => void): () => void;\n    reportEntryError(key: string, entry: StoredEntry, error: unknown, info: {\n        abdicate: boolean;\n    }): void;\n    reportFactoryError(name: string, registration: StoredEntry | StoredFactory, error: unknown): void;\n    onEntryError(fn: (key: string, registration: StoredEntry | StoredFactory, error: unknown, info: {\n        abdicated: boolean;\n    }) => void): () => void;\n}"
			},
			{
				name: "SlotEntryDef",
				declaration: "export interface SlotEntryDef {\n    kind: SlotKind;\n    scope: SlotScope;\n    inline?: true;\n    owner?: object;\n    keyProps?: Record<string, object>;\n    hookContext?: unknown;\n    inject?: object;\n}"
			},
			{
				name: "SlotFactoryMap",
				declaration: "export interface SlotFactoryMap {\n}"
			},
			{
				name: "SlotInjectFace",
				declaration: "export type SlotInjectFace<I extends object> = I extends {\n    hooks: infer HS extends object;\n} ? Omit<I, 'hooks'> & PropsSlotHooks<HS> : I;"
			},
			{
				name: "SlotInjectOf",
				declaration: "export type SlotInjectOf<K extends keyof SlotMap & string> = SlotMap[K] extends {\n    inject: infer Injected extends object;\n} ? Injected : object;"
			},
			{
				name: "SlotKind",
				declaration: "export type SlotKind = 'single' | 'list' | 'keyed' | 'chain';"
			},
			{
				name: "SlotLabel",
				declaration: "export type SlotLabel = string | (() => string);"
			},
			{
				name: "SlotMap",
				declaration: "export interface SlotMap {\n}"
			},
			{
				name: "SlotScope",
				declaration: "export type SlotScope = 'root' | 'session-maybe' | 'session';"
			},
			{
				name: "SlotScopeTargetMap",
				declaration: "export interface SlotScopeTargetMap {\n}"
			},
			{
				name: "SlotSpec",
				declaration: "export type SlotSpec<E extends SlotEntryDef> = {\n    kind: E['kind'];\n    scope: E['scope'];\n    inline?: true;\n} & ('inject' extends keyof E ? E extends {\n    inject: infer Injected extends object;\n} ? {\n    inject: Injected;\n} : {\n    inject?: object;\n} : {\n    inject?: never;\n});"
			},
			{
				name: "SnapshotSelectorHook",
				declaration: "export type SnapshotSelectorHook<T> = <S>(sel: (s: T) => S, eq?: (a: S, b: S) => boolean) => S;"
			},
			{
				name: "StartSessionOptions",
				declaration: "export interface StartSessionOptions extends DraftInitializationOptions {\n    readonly agentPreset?: string;\n}"
			},
			{
				name: "StoreDecl",
				declaration: "export type StoreDecl = StoreHandle<any, any> | StoreFactory;"
			},
			{
				name: "StoredEntry",
				declaration: "export interface StoredEntry {\n    component: unknown;\n    options: {\n        key?: string;\n        id?: string;\n        order?: number;\n        label?: SlotLabel;\n        priority?: number;\n    };\n    select?: ((owner: never) => unknown) | undefined;\n    inject?: ((...args: never[]) => Record<string, unknown>) | undefined;\n    children?: Readonly<Record<string, SlotSpec<SlotEntryDef>>> | undefined;\n    store?: StoreDecl | undefined;\n    locale?: string | undefined;\n    registrant?: string | undefined;\n}"
			},
			{
				name: "StoredFactory",
				declaration: "export interface StoredFactory {\n    readonly name: string;\n    readonly component: unknown;\n    readonly scope: SlotScope;\n    readonly children?: Readonly<Record<string, SlotSpec<SlotEntryDef>>> | undefined;\n    readonly store?: StoreDecl | undefined;\n    readonly inject?: ((...args: never[]) => Record<string, unknown>) | undefined;\n    readonly locale?: string | undefined;\n    readonly slots?: Readonly<Record<string, {\n        scope: SlotScope;\n    }>> | undefined;\n    readonly registrant?: string | undefined;\n}"
			},
			{
				name: "StoreFactory",
				declaration: "export type StoreFactory = () => StoreHandle<any, any>;"
			},
			{
				name: "StoreHandle",
				declaration: "export interface StoreHandle<T, A extends ActionsDecl<T>> {\n    readonly spec: StoreSpec<T, A>;\n    create(scopeKey?: string): StoreInstance<T, A>;\n}"
			},
			{
				name: "StoreInstance",
				declaration: "export interface StoreInstance<T, A extends ActionsDecl<T>> {\n    readonly actions: BakedActions<T, A>;\n    getSnapshot(): T;\n    subscribe(fn: () => void): () => void;\n    clearPersisted(): void;\n}"
			},
			{
				name: "StoreSpec",
				declaration: "export interface StoreSpec<T, A extends ActionsDecl<T>> {\n    init: () => T;\n    persist?: string;\n    actions: A;\n}"
			},
			{
				name: "SubmissionHandle",
				declaration: "export interface SubmissionHandle {\n    readonly requestId: SessionRequestId;\n    abandon(): void;\n}"
			},
			{
				name: "ThemeDefinition",
				declaration: "export interface ThemeDefinition {\n    id: string;\n    colorScheme: 'light' | 'dark';\n    tokens: ThemeTokens;\n    icons?: IconReplacements | undefined;\n}"
			},
			{
				name: "ThemePreference",
				declaration: "export type ThemePreference = typeof THEME_PREFERENCES[number];"
			},
			{
				name: "ThemeSnapshot",
				declaration: "export interface ThemeSnapshot {\n    preference: ThemePreference;\n    fontSizes: FontSizes;\n    fontFamilies: FontFamilies;\n    active: ThemeDefinition;\n    themes: readonly ThemeDefinition[];\n    revision: number;\n}"
			},
			{
				name: "ThemeTokenModes",
				declaration: "export interface ThemeTokenModes {\n    light: string;\n    dark: string;\n}"
			},
			{
				name: "ThemeTokenOverrides",
				declaration: "export type ThemeTokenOverrides = Record<string, ThemeTokenModes>;"
			},
			{
				name: "ThemeTokens",
				declaration: "export type ThemeTokens = Record<string, string>;"
			},
			{
				name: "TranslateNS",
				declaration: "export type TranslateNS<N extends keyof LocaleNamespaceMap & string> = Translate<LocaleKeysOf<N>>;"
			},
			{
				name: "UseFactorySlot",
				declaration: "export type UseFactorySlot<F extends keyof SlotFactoryMap & string> = <N extends FactoryLocalNameOf<F>>(name: N, fallback: FactoryLocalComponent<F, N>) => SlotComponent<FactoryLocalInputPropsOf<F, N>>;"
			},
			{
				name: "WorkspaceView",
				declaration: "export interface WorkspaceView {\n    readonly workspaceId: WorkspaceId;\n    readonly path: string;\n    readonly title: string;\n    readonly sessionIds: readonly SessionId[];\n    readonly createdAt: string;\n    readonly updatedAt: string;\n}"
			}
		];
		function referencedTypeClosure(seeds) {
			const included = /* @__PURE__ */ new Set();
			let frontier = [...seeds];
			while (frontier.length > 0) {
				const next = [];
				for (const entry of TYPE_API) {
					if (included.has(entry.name)) continue;
					const pattern = new RegExp(`\\b${entry.name}\\b`);
					if (!frontier.some((text) => pattern.test(text))) continue;
					included.add(entry.name);
					next.push(entry.declaration);
				}
				frontier = next;
			}
			return TYPE_API.filter((entry) => included.has(entry.name));
		}
		function contextProperty(key) {
			return /^[A-Za-z_$][\w$]*$/.test(key) ? `ctx.${key}` : `ctx[${JSON.stringify(key)}]`;
		}
		/**
		* Project the Service Catalog as a compact directory or one exact coding contract.
		* @param key - exact Service key; omit it to list all Services and method signatures.
		* @param services - platform-specific visible Service entries.
		* @returns compact navigation data or one detailed Service with its referenced type closure.
		*/
		function queryServiceApi(key, services = SERVICE_API) {
			if (key === void 0) return {
				mode: "catalog",
				services: services.map((service) => ({
					key: service.key,
					description: service.summary,
					methods: service.methods.map((method) => ({ signature: method.signature }))
				}))
			};
			const service = services.find((candidate) => candidate.key === key);
			if (service === void 0) throw new Error(`no catalogued Service named "${key}"`);
			return {
				mode: "service",
				service: {
					key: service.key,
					description: service.description,
					access: {
						optional: {
							expression: `ctx.get(${JSON.stringify(service.key)})`,
							requiresUndefinedCheck: true
						},
						hardDependency: {
							inject: [service.key],
							expression: contextProperty(service.key)
						}
					},
					methods: service.methods
				},
				referencedTypes: referencedTypeClosure(service.methods.map((method) => method.signature))
			};
		}
		/**
		* Project the Event Catalog as a compact directory or one exact listener contract.
		* @param name - exact Event name; omit it to list all Events and listener signatures.
		* @param events - platform-specific visible Event entries.
		* @returns compact navigation data or one detailed Event with its referenced type closure.
		*/
		function queryEventApi(name, events = EVENT_API) {
			if (name === void 0) return {
				mode: "catalog",
				events: events.map((event) => ({
					name: event.name,
					description: event.summary,
					mode: event.mode,
					signature: event.signature
				}))
			};
			const event = events.find((candidate) => candidate.name === name);
			if (event === void 0) throw new Error(`no catalogued Event named "${name}"`);
			return {
				mode: "event",
				event: {
					name: event.name,
					description: event.description,
					mode: event.mode,
					signature: event.signature,
					parameters: event.parameters
				},
				referencedTypes: referencedTypeClosure([event.signature])
			};
		}
		//#endregion
		//#region lib/types/client/slot-catalog.js
		/** Every slot the shipped web bundle declares, sorted by key. */
		const CLIENT_SLOT_API = [
			{
				key: "conversation.approval.detail",
				kind: "single",
				scope: "session",
				summary: "Optional detail for the Tool call correlated with an approval request.",
				doc: "Optional detail for the Tool call correlated with an approval request.",
				registerOptions: [],
				ownerProps: ["/** Stable identity handed to an optional approval-detail renderer. */\nexport interface ApprovalDetailOwnerProps {\n  /** Tool call correlated with the request. */\n  callId: ToolCallId\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "factory 'conversation.approval.card' (client-ui-approval), so it exists while that definition is registered",
				occupants: ["client-ui-chat ApprovalCommand"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.approval.detail', () => ctx.slots.register(\n      { name: 'conversation.approval.detail' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-approval/src/client/contract/slots.ts:47"
			},
			{
				key: "conversation.chat.assistant-actions",
				kind: "list",
				scope: "session",
				summary: "Ordered actions for one finalized assistant message.",
				doc: "Ordered actions for one finalized assistant message. Each entry receives\nthe durable message id; a fresh `id` adds an action and reusing one replaces\nthat entry. With no entries, the standard action row remains unchanged.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/** Owner currency of finalized-assistant actions. */\nexport interface AssistantActionOwnerProps {\n  messageId: MessageId\n}"],
				ownerPropsReferences: ["MessageId"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.chat.node' (client-ui-chat), so it exists while that entry is mounted",
				occupants: ["client-ui-message-feedback MessageFeedbackActions id 'feedback'"],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.chat.assistant-actions', () => ctx.slots.register(\n      { name: 'conversation.chat.assistant-actions', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-chat/src/client/contract/slots.ts:457"
			},
			{
				key: "conversation.chat.commandview",
				kind: "keyed",
				scope: "session",
				summary: "Command row keyed by the command name.",
				doc: "Command row keyed by the command name. The component receives the folded\ncommand lifecycle and linked compaction when present. Reusing a key\nreplaces that command renderer; an unoccupied key uses the generic card.",
				registerOptions: [{
					name: "key",
					requirement: "required",
					type: "string",
					doc: "Your cell key: the entry renders where the owner dispatches this exact key. Registering an already-occupied key replaces that occupant."
				}],
				ownerProps: ["/** Command-row owner share. */\nexport interface CommandRowOwnerProps {\n  node: CommandNode\n  compaction?: CompactionSummaryNode\n}"],
				ownerPropsReferences: [
					"Command",
					"CommandNode",
					"CompactionSummaryNode"
				],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "open: any string the owner dispatches (no compile-time key set), none are taken yet",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.chat.node' (client-ui-chat), so it exists while that entry is mounted",
				occupants: [],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.chat.commandview', () => ctx.slots.register(\n      { name: 'conversation.chat.commandview', key: '<one key the owner dispatches>' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-chat/src/client/contract/slots.ts:439"
			},
			{
				key: "conversation.chat.flow",
				kind: "single",
				scope: "session",
				summary: "Ordered Chat rows and local echoes with viewport-bound visibility hooks.",
				doc: "Ordered Chat rows and local echoes with viewport-bound visibility hooks.",
				registerOptions: [],
				ownerProps: ["/** Ordered rows and reconciled local echoes rendered inside one Chat viewport. */\nexport interface ChatFlowOwnerProps extends Pick<ChatNodeOwnerProps,\n  'cwd' | 'openFile' | 'inspectCall' | 'forkAt' | 'loadImage' | 'fileMentions'> {\n  readonly entries: readonly RenderEntry[]\n  readonly pendingInputs: readonly (PendingSubmission | InboxState['next-step'][number])[]\n  readonly lastInputTurn: number | undefined\n  readonly deferCollapse: boolean\n}"],
				ownerPropsReferences: [
					"ChatNodeOwnerProps",
					"PendingSubmission",
					"RenderEntry"
				],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "ChatFlowHookContext",
				slotInject: "ChatFlowInjected",
				declaredBy: "an entry in 'conversation.view' (client-ui-chat), so it exists while that entry is mounted",
				occupants: ["client-ui-chat ChatFlow"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.chat.flow', () => ctx.slots.register(\n      { name: 'conversation.chat.flow' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-chat/src/client/contract/slots.ts:406"
			},
			{
				key: "conversation.chat.message.images",
				kind: "single",
				scope: "session",
				summary: "Renderer for one consecutive group of durable message images.",
				doc: "Renderer for one consecutive group of durable message images. The owner\nsupplies image references, an authorized loader, and alignment. A\nregistration replaces the shipped gallery; without one, images are omitted.",
				registerOptions: [],
				ownerProps: ["/** Message image group handed to the optional attachment presentation plugin. */\nexport interface MessageImagesOwnerProps {\n  /** Durable references or submission-echo previews in source order. */\n  images: readonly MessageImageSource[]\n  /** Session-authorized image URL loader for the durable arm. */\n  loadImage: MessageImageLoader\n  /** Horizontal placement inside the owning record. */\n  align: 'start' | 'end'\n  /** Force every image into the compact message-attachment tile size. */\n  compact?: boolean\n  /** Fixed, uncropped thumbnail for an attachment list row. */\n  thumbnail?: boolean\n}"],
				ownerPropsReferences: [
					"Message",
					"MessageImageLoader",
					"MessageImageSource"
				],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.chat.node' (client-ui-chat), so it exists while that entry is mounted",
				occupants: ["client-ui-attachment MessageImages"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.chat.message.images', () => ctx.slots.register(\n      { name: 'conversation.chat.message.images' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-chat/src/client/contract/slots.ts:431"
			},
			{
				key: "conversation.chat.node",
				kind: "keyed",
				scope: "session",
				summary: "Final Chat node renderer, keyed by `ChatNodeKind`.",
				doc: "Final Chat node renderer, keyed by `ChatNodeKind`. The component receives\nthe typed node, shared Chat actions, and Turn-data hook. Reusing a key\nreplaces that node renderer; a kind with no occupant renders no row.",
				registerOptions: [{
					name: "key",
					requirement: "required",
					type: "string",
					doc: "Your cell key: the entry renders where the owner dispatches this exact key. Registering an already-occupied key replaces that occupant."
				}],
				ownerProps: ["/** Stable owner currency delivered to a keyed Chat renderer. */\nexport interface ChatNodeOwnerProps {\n  /** Renderer-owned Node portion selected by the grouping Definition. */\n  groupPart?: string\n  cwd?: string | undefined\n  openFile: (path: string, options?: OpenFileOptions) => void\n  inspectCall: ((callId: ToolCallId) => void) | undefined\n  forkAt: (seq: number) => void\n  /** Session-authorized image loader supplied by the Chat view. */\n  loadImage: MessageImageLoader\n  fileMentions: (owner: TurnTailOwnerProps) => MarkdownFileMentions | undefined\n  /** Turn-process state when this Node belongs to a projected Turn. */\n  turnProcess?: TurnProcessOwnerProps | undefined\n}"],
				ownerPropsReferences: [
					"MarkdownFileMentions",
					"MessageImageLoader",
					"OpenFileOptions",
					"TurnProcessOwnerProps",
					"TurnTailOwnerProps"
				],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "fixed by the owner's key table { [Kind in ChatNodeKind]: { node: ChatNode<Kind> } }, already taken: assistant-step, command, command-input, compaction, context, manual-compaction, model-retry, question-reply, steering, system-prompt, tool-call, turn-error, turn-max-tokens, turn-process, turn-tail, turn-trigger, unknown, user, workflow-run",
				hookContext: "ChatNodeHookContext",
				slotInject: "ChatNodeInjected",
				declaredBy: "an entry in 'conversation.chat.flow' (client-ui-chat), so it exists while that entry is mounted",
				occupants: [
					"client-ui-chat UserMessageNodeView key 'user'",
					"client-ui-chat UserMessageNodeView key 'steering'",
					"client-ui-chat ContextMessageNodeView key 'context'",
					"client-ui-chat TurnTriggerNodeView key 'turn-trigger'",
					"client-ui-chat SystemPromptNodeView key 'system-prompt'",
					"client-ui-chat AssistantNodeView key 'assistant-step'",
					"client-ui-chat CommandNodeView key 'command'",
					"client-ui-chat ManualCompactionNodeView key 'manual-compaction'",
					"client-ui-chat CompactionNodeView key 'compaction'",
					"client-ui-chat RetryNodeView key 'model-retry'",
					"client-ui-chat TurnErrorNodeView key 'turn-error'",
					"client-ui-chat TurnMaxTokensNodeView key 'turn-max-tokens'",
					"client-ui-chat TurnProcessNodeView key 'turn-process'",
					"client-ui-chat TurnTailNodeView key 'turn-tail'",
					"client-ui-chat UnknownNodeView key 'unknown'",
					"client-ui-goal GoalCommandInputView key 'command-input'",
					"client-ui-tool ToolCallTree key 'tool-call'",
					"client-ui-user-questions QuestionReplyView key 'question-reply'",
					"client-ui-workflow-run WorkflowRunPanel key 'workflow-run'"
				],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.chat.node', () => ctx.slots.register(\n      { name: 'conversation.chat.node', key: '<one key the owner dispatches>' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-chat/src/client/contract/slots.ts:418"
			},
			{
				key: "conversation.chat.reasoning.body",
				kind: "single",
				scope: "session",
				summary: "Expanded reasoning body with the unchanged model text.",
				doc: "Expanded reasoning body with the unchanged model text. The official entry\nhas priority 100 and calls the reasoning Content Factory; smaller priority\nvalues replace it. Contributions must preserve access to the original text.",
				registerOptions: [],
				ownerProps: ["/** Original model-provided reasoning offered to the expanded Body Slot. */\nexport interface ReasoningBodyOwnerProps {\n  /** Complete or streaming reasoning text. */\n  readonly text: string\n  /** Whether the reasoning tail is still streaming. */\n  readonly running: boolean\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.chat.node' (client-ui-chat), so it exists while that entry is mounted",
				occupants: ["client-ui-chat DefaultReasoningBody", "experimental-client-ui-cot-translation TranslationBody"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.chat.reasoning.body', () => ctx.slots.register(\n      { name: 'conversation.chat.reasoning.body' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-chat/src/client/contract/slots.ts:445"
			},
			{
				key: "conversation.chat.text-interaction",
				kind: "keyed",
				scope: "session",
				summary: "Area-local text gestures and surfaces; each consumer registers its own synchronous admission.",
				doc: "Area-local text gestures and surfaces; each consumer registers its own synchronous admission.",
				registerOptions: [{
					name: "key",
					requirement: "required",
					type: "string",
					doc: "Your cell key: the entry renders where the owner dispatches this exact key. Registering an already-occupied key replaces that occupant."
				}],
				ownerProps: ["/** Area-local actions provided to the currently selected plugin component. */\nexport interface TextInteractionSurface {\n  readonly trigger: TextInteractionTrigger\n  readonly dismiss: () => void\n  readonly readText: () => string | null\n  readonly clearSelection: () => void\n}"],
				ownerPropsReferences: ["TextInteractionTrigger"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "open: any string the owner dispatches (no compile-time key set), already taken: quote",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.view' (client-ui-chat), so it exists while that entry is mounted",
				occupants: ["message-quotes QuoteSelectionAction key 'quote'"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.chat.text-interaction', () => ctx.slots.register(\n      { name: 'conversation.chat.text-interaction', key: '<one key the owner dispatches>' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-chat/src/client/contract/slots.ts:403"
			},
			{
				key: "conversation.chat.turnTail",
				kind: "list",
				scope: "session",
				summary: "Ordered feature contributions before a completed Turn's action row.",
				doc: "Ordered feature contributions before a completed Turn's action row. Each\nentry receives the Turn, closing sequence, and file opener. A fresh `id`\nadds an entry; entries without content return null.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/** Owner currency of the completed-Turn extension chain. */\nexport interface TurnTailOwnerProps {\n  turn: TurnLocation\n  seq: number\n  openFile: (path: string) => void\n}"],
				ownerPropsReferences: ["TurnLocation"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.chat.node' (client-ui-chat), so it exists while that entry is mounted",
				occupants: [
					"client-ui-deliverables DeliverablesTail id '@deepseek-ai/dsh-client-ui-deliverables'",
					"client-ui-plan PlanCards",
					"client-ui-schedule ScheduleTurnCard id 'schedule-created'",
					"client-ui-action-cards ActionCardTail id '@deepseek-ai/dsh-client-ui-action-cards'"
				],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.chat.turnTail', () => ctx.slots.register(\n      { name: 'conversation.chat.turnTail', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-chat/src/client/contract/slots.ts:451"
			},
			{
				key: "conversation.chat.user.images",
				kind: "single",
				scope: "session",
				summary: "User-message images, including pending and local-echo previews, independently replaceable from output images.",
				doc: "User-message images, including pending and local-echo previews, independently replaceable from output images.",
				registerOptions: [],
				ownerProps: ["/** Message image group handed to the optional attachment presentation plugin. */\nexport interface MessageImagesOwnerProps {\n  /** Durable references or submission-echo previews in source order. */\n  images: readonly MessageImageSource[]\n  /** Session-authorized image URL loader for the durable arm. */\n  loadImage: MessageImageLoader\n  /** Horizontal placement inside the owning record. */\n  align: 'start' | 'end'\n  /** Force every image into the compact message-attachment tile size. */\n  compact?: boolean\n  /** Fixed, uncropped thumbnail for an attachment list row. */\n  thumbnail?: boolean\n}"],
				ownerPropsReferences: [
					"Message",
					"MessageImageLoader",
					"MessageImageSource"
				],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "factory 'conversation.chat.user.content' (client-ui-chat), so it exists while that definition is registered",
				occupants: ["client-ui-attachment MessageImages"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.chat.user.images', () => ctx.slots.register(\n      { name: 'conversation.chat.user.images' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-chat/src/client/contract/slots.ts:433"
			},
			{
				key: "conversation.composer",
				kind: "chain",
				scope: "session",
				summary: "Selector-routed replacements for the current Session's resident composer.",
				doc: "Selector-routed replacements for the current Session's resident composer.",
				registerOptions: [{
					name: "select",
					requirement: "required",
					type: "(owner) => unknown | null",
					doc: "Pure routing selector. Entries are tried in ascending order; the first non-null result wins and arrives as the component's `matched` prop. All-null falls through to the owner's fallback."
				}],
				ownerProps: ["/** Owner values used to elect a composer takeover. */\nexport interface ComposerChainProps {\n  /** Current Session identity used by temporary business-owned entries. */\n  sessionId: SessionId | undefined\n  /** Current Session lifecycle state, absent without a selected Session. */\n  session: SessionSnapshot | undefined\n  /** Effective business-owned interaction awaiting the user in this Session. */\n  pendingInteraction: SessionPendingInteraction | undefined\n}"],
				ownerPropsReferences: [
					"SessionId",
					"SessionPendingInteraction",
					"SessionSnapshot"
				],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "factory 'conversation.content' (client-ui-conversation), so it exists while that definition is registered",
				occupants: [
					"client-ui-approval ApprovalPanel",
					"client-ui-subagent SubagentReadOnlyComposer",
					"client-ui-user-questions QuestionComposer",
					"cua ApplicationApproval"
				],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.composer', () => ctx.slots.register(\n      { name: 'conversation.composer', select: owner => null },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-conversation/src/client/contract/slots.ts:280"
			},
			{
				key: "conversation.composer.bar",
				kind: "single",
				scope: "session-maybe",
				summary: "Resident composer body, including the no-Session inert state.",
				doc: "Resident composer body, including the no-Session inert state.",
				registerOptions: [],
				ownerProps: ["/** Owner share of the resident composer bar. */\nexport interface ComposerBarOwnerProps {\n  /** Hero uses centered placement; composer uses the active bottom placement. */\n  variant: 'hero' | 'composer'\n  /** A feature-owned reason that makes message input inert while leaving model selection live. */\n  blocked?: { readonly reason: string }\n  /** Lock all message actions while preserving the resident composer surface. */\n  disabled?: boolean\n  /** Whether the shared Workspace picker is expanded. */\n  workspacePickerOpen?: boolean\n  /** Open the Workspace picker from the inert composer surface. */\n  onRequestWorkspace?: () => void\n  placeholder?: string\n  /** Optional content rendered above the composer surface. */\n  accessory?: ReactNode\n}"],
				ownerPropsReferences: ["Workspace"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useConversation: MaybeSnapshotSelectorHook<ConversationSnapshot>",
					"useInput: MaybeSnapshotSelectorHook<InputState>",
					"inputActions: InputActions | undefined",
					"useSession: MaybeSnapshotSelectorHook<SessionSnapshot>",
					"sessionId: SessionId | undefined",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean | undefined"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "factory 'conversation.content' (client-ui-conversation), so it exists while that definition is registered",
				occupants: ["client-ui-conversation InputBar"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.composer.bar', () => ctx.slots.register(\n      { name: 'conversation.composer.bar' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-conversation/src/client/contract/slots.ts:302"
			},
			{
				key: "conversation.composer.dock",
				kind: "list",
				scope: "session",
				summary: "Ambient entries below the composer card.",
				doc: "Ambient entries below the composer card.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: [],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.composer.bar' (client-ui-conversation), so it exists while that entry is mounted",
				occupants: ["client-ui-chat ActivityPill id 'activity'", "client-ui-chat UsagePill id 'usage'"],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register(\n      { name: 'conversation.composer.dock', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-conversation/src/client/contract/slots.ts:294"
			},
			{
				key: "conversation.header",
				kind: "single",
				scope: "session-maybe",
				summary: "Resident navigation container, including when no Session is selected.",
				doc: "Resident navigation container, including when no Session is selected.",
				registerOptions: [],
				ownerProps: [],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useConversation: MaybeSnapshotSelectorHook<ConversationSnapshot>",
					"useInput: MaybeSnapshotSelectorHook<InputState>",
					"inputActions: InputActions | undefined",
					"useSession: MaybeSnapshotSelectorHook<SessionSnapshot>",
					"sessionId: SessionId | undefined",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean | undefined"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'main.conversation' (client-ui-conversation), so it exists while that entry is mounted",
				occupants: ["client-ui-conversation ConversationHeader"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.header', () => ctx.slots.register(\n      { name: 'conversation.header' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-conversation/src/client/contract/slots.ts:230"
			},
			{
				key: "conversation.header.leading",
				kind: "single",
				scope: "root",
				summary: "Global navigation before the Session title, available without a Session.",
				doc: "Global navigation before the Session title, available without a Session.",
				registerOptions: [],
				ownerProps: ["/** The leading seat exposes global navigation independently of a Session. */\nexport interface ConversationHeaderLeadingOwnerProps {\n  /** Marker field: the occupant receives no owner-specific values. */\n  children?: never\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.header' (client-ui-conversation), so it exists while that entry is mounted",
				occupants: [],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.header.leading', () => ctx.slots.register(\n      { name: 'conversation.header.leading' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-conversation/src/client/contract/slots.ts:259"
			},
			{
				key: "conversation.hero.agentPreset",
				kind: "single",
				scope: "session-maybe",
				summary: "Agent-preset control staged for a New Session.",
				doc: "Agent-preset control staged for a New Session.",
				registerOptions: [],
				ownerProps: ["/** Owner share of the Hero agent-preset control. */\nexport interface HeroAgentPresetOwnerProps {\n  /** Marker field: the occupant owns its roster and staged selection. */\n  children?: never\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useConversation: MaybeSnapshotSelectorHook<ConversationSnapshot>",
					"useInput: MaybeSnapshotSelectorHook<InputState>",
					"inputActions: InputActions | undefined",
					"useSession: MaybeSnapshotSelectorHook<SessionSnapshot>",
					"sessionId: SessionId | undefined",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean | undefined"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "factory 'conversation.content' (client-ui-conversation), so it exists while that definition is registered",
				occupants: ["client-ui-agent-preset AgentPresetSeat"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.hero.agentPreset', () => ctx.slots.register(\n      { name: 'conversation.hero.agentPreset' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-conversation/src/client/contract/slots.ts:286"
			},
			{
				key: "conversation.hero.brand.mark",
				kind: "single",
				scope: "root",
				summary: "Brand mark shown before the blank-session headline.",
				doc: "Brand mark shown before the blank-session headline.",
				registerOptions: [],
				ownerProps: ["/** Presentation props supplied to the blank-session brand mark. */\nexport interface HeroBrandMarkOwnerProps {\n  /** Requested square edge in pixels. */\n  size: number\n  /** Host class preserving the surrounding mark geometry. */\n  className?: string | undefined\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "factory 'conversation.content' (client-ui-conversation), so it exists while that definition is registered",
				occupants: [],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.hero.brand.mark', () => ctx.slots.register(\n      { name: 'conversation.hero.brand.mark' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-conversation/src/client/contract/slots.ts:284"
			},
			{
				key: "conversation.hero.options",
				kind: "list",
				scope: "session",
				summary: "Compact options right-aligned in the New Session row after the workspace and preset controls; rendered only with a Session.",
				doc: "Compact options right-aligned in the New Session row after the workspace and preset controls; rendered only with a Session.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: [],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "factory 'conversation.content' (client-ui-conversation), so it exists while that definition is registered",
				occupants: [],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.hero.options', () => ctx.slots.register(\n      { name: 'conversation.hero.options', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-conversation/src/client/contract/slots.ts:288"
			},
			{
				key: "conversation.hero.workspace",
				kind: "single",
				scope: "root",
				summary: "Workspace picker shown by the blank-session Hero.",
				doc: "Workspace picker shown by the blank-session Hero.",
				registerOptions: [],
				ownerProps: ["/** Owner share common to blank-session Workspace pickers. */\nexport interface EmptyWorkspaceOwnerProps {\n  open: boolean\n  anchorRef?: RefObject<HTMLElement>\n  /** Currently selected Workspace, when available. */\n  selectedId?: WorkspaceId | undefined\n  onPick: (workspaceId: WorkspaceId) => void\n  onClose: () => void\n}"],
				ownerPropsReferences: ["Workspace"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "factory 'conversation.content' (client-ui-conversation), so it exists while that definition is registered",
				occupants: ["client-ui-workspace WorkspacePicker"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.hero.workspace', () => ctx.slots.register(\n      { name: 'conversation.hero.workspace' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-conversation/src/client/contract/slots.ts:282"
			},
			{
				key: "conversation.hero.workspace.directoryFlow",
				kind: "single",
				scope: "root",
				summary: "Directory-flow hole under the conversation empty-state picker (declared by the WorkspacePicker entry).",
				doc: "Directory-flow hole under the conversation empty-state picker (declared by the WorkspacePicker entry).",
				registerOptions: [],
				ownerProps: ["/**\n * Owner share of the directory-flow holes: the complete conversation between\n * the trigger surface and the picking interaction. The occupant reads `open`\n * to run/render its interaction and reports exactly one outcome per open.\n */\nexport interface DirectoryFlowOwnerProps {\n  /** True while a picking interaction is requested; flipping back to false withdraws the request. */\n  open: boolean\n  /** True while the owner adopts a picked path (`createWorkspace` in flight); occupants disable their commit affordances. */\n  busy: boolean\n  /** The operator picked a directory (absolute host path); the owner adopts it. */\n  onPicked: (path: string) => void\n  /** The operator dismissed the interaction; the owner just closes the flow. */\n  onCancel: () => void\n  /** The interaction itself failed (chooser missing, listing denied); the owner shows its error surface. */\n  onError: (message: string) => void\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.hero.workspace' (client-ui-workspace), so it exists while that entry is mounted",
				occupants: ["client-ui-directory-picker-browse BrowseDirectoryFlow", "client-ui-directory-picker-native NativeDirectoryFlow"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.hero.workspace.directoryFlow', () => ctx.slots.register(\n      { name: 'conversation.hero.workspace.directoryFlow' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-workspace/src/client/contract/slots.ts:125"
			},
			{
				key: "conversation.input.activity",
				kind: "single",
				scope: "session",
				summary: "Compact action after the model selector; it can expand across the toolbar while retaining the editor and submit action.",
				doc: "Compact action after the model selector; it can expand across the toolbar while retaining the editor and submit action.",
				registerOptions: [],
				ownerProps: ["/** A toolbar activity hides ordinary accessory controls while expanded; its occupant must release expansion on unmount. */\nexport interface InputActivityOwnerProps extends InputControlOwnerProps {\n  /** @param active - whether the occupant needs the toolbar width before the submit action. */\n  onActiveChange: (active: boolean) => void\n}"],
				ownerPropsReferences: ["InputControlOwnerProps"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.composer.bar' (client-ui-conversation), so it exists while that entry is mounted",
				occupants: ["experimental-client-ui-voice-input VoiceInput"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.input.activity', () => ctx.slots.register(\n      { name: 'conversation.input.activity' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-conversation/src/client/contract/slots.ts:300"
			},
			{
				key: "conversation.input.attachments",
				kind: "single",
				scope: "session-maybe",
				summary: "Optional draft-attachment rail and drop target.",
				doc: "Optional draft-attachment rail and drop target.",
				registerOptions: [],
				ownerProps: ["/** Input state handed to the optional attachment presentation plugin. */\nexport interface ComposerAttachmentsOwnerProps {\n  /** Browser-owned draft attachments in input order. */\n  attachments: readonly ComposerAttachment[]\n  /** Whether a document-level file drop may add attachments now. */\n  canAcceptDrop: boolean\n  /**\n   * Add one dropped batch through the composer's validation path.\n   * @param files - dropped, pasted, or picked browser files in source order.\n   * @param directories - members of `files` the drop source identified as directories.\n   */\n  onAddFiles: (files: readonly File[], directories?: ReadonlySet<File>) => void\n  /** Remove one draft attachment through the Conversation service. */\n  onRemoveAttachment: (id: DraftAttachmentId) => void\n  /** Current per-draft upload states for file-kind attachments. */\n  uploads: DraftFileUploads\n  /** Restart one failed file upload. */\n  onRetryFile: (id: DraftAttachmentId) => void\n  /**\n   * Explain one upload the Host refused; such a draft cannot be retried and\n   * stays until it is removed.\n   * @param reason - the refusal `reason` the failed upload carries.\n   * @returns localized text naming the limit or the way out.\n  /* …truncated — full shape in source */"],
				ownerPropsReferences: [
					"ComposerAttachment",
					"DraftAttachmentId",
					"DraftFileUploads"
				],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useConversation: MaybeSnapshotSelectorHook<ConversationSnapshot>",
					"useInput: MaybeSnapshotSelectorHook<InputState>",
					"inputActions: InputActions | undefined",
					"useSession: MaybeSnapshotSelectorHook<SessionSnapshot>",
					"sessionId: SessionId | undefined",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean | undefined"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.composer.bar' (client-ui-conversation), so it exists while that entry is mounted",
				occupants: ["client-ui-attachment ComposerAttachments"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.input.attachments', () => ctx.slots.register(\n      { name: 'conversation.input.attachments' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-conversation/src/client/contract/slots.ts:304"
			},
			{
				key: "conversation.input.dock",
				kind: "list",
				scope: "session",
				summary: "Full-width entries above the composer card.",
				doc: "Full-width entries above the composer card.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/** Point-in-time owner values for composer extension entries. */\nexport interface InputZone {\n  readonly session: SessionSnapshot\n  readonly input: InputState\n}"],
				ownerPropsReferences: ["InputState", "SessionSnapshot"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "factory 'conversation.content' (client-ui-conversation), so it exists while that definition is registered",
				occupants: [
					"client-ui-conversation QueueDock id 'queue'",
					"client-ui-conversation TodoDock id 'todo'",
					"client-ui-goal GoalDock id 'goal'",
					"experimental-client-ui-claude-code-mods Band id 'claude-code-mods'"
				],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.input.dock', () => ctx.slots.register(\n      { name: 'conversation.input.dock', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-conversation/src/client/contract/slots.ts:290"
			},
			{
				key: "conversation.input.left",
				kind: "list",
				scope: "session",
				summary: "Compact controls at the left of the composer tool row.",
				doc: "Compact controls at the left of the composer tool row.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: [],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.composer.bar' (client-ui-conversation), so it exists while that entry is mounted",
				occupants: [],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.input.left', () => ctx.slots.register(\n      { name: 'conversation.input.left', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-conversation/src/client/contract/slots.ts:296"
			},
			{
				key: "conversation.input.model",
				kind: "single",
				scope: "session",
				summary: "Model selector inside the composer tool row.",
				doc: "Model selector inside the composer tool row. When expanded controls cannot\nshare a line, the row sets --dsh-composer-model-text-display to none and\n--dsh-composer-model-icon-display to block for an occupant's compact display.",
				registerOptions: [],
				ownerProps: ["/** Owner share of the named plan, permission, and model controls. */\nexport interface InputControlOwnerProps {\n  /** Whether the composer currently refuses interaction. */\n  locked: boolean\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.composer.bar' (client-ui-conversation), so it exists while that entry is mounted",
				occupants: ["client-ui-model-selection ModelSelect"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.input.model', () => ctx.slots.register(\n      { name: 'conversation.input.model' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-conversation/src/client/contract/slots.ts:318"
			},
			{
				key: "conversation.input.model.label",
				kind: "single",
				scope: "session",
				summary: "Non-interactive inline model label; selection controls remain owner-managed.",
				doc: "Non-interactive inline model label; selection controls remain owner-managed.\nWithout a contribution, the composer displays the catalog name.",
				registerOptions: [],
				ownerProps: ["/** Catalog data for a model name inside the composer's existing controls. */\nexport interface ModelLabelOwner {\n  /** Provider identity and localized display name; contains no connection configuration. */\n  provider: Pick<ModelProviderGroup, 'id' | 'name'>\n  /** The exact provider's model catalog entry. */\n  model: ModelCatalogModel\n  /** Trigger caption, root-menu current value, or selectable model row. */\n  placement: 'trigger' | 'menu' | 'option'\n  /** Whether this provider/model pair is the current selection. */\n  selected: boolean\n}"],
				ownerPropsReferences: ["ModelCatalogModel", "ModelProviderGroup"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.input.model' (client-ui-model-selection), so it exists while that entry is mounted",
				occupants: ["client-ui-deepseek-model-label-1017 DeepSeekModelLabel"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.input.model.label', () => ctx.slots.register(\n      { name: 'conversation.input.model.label' },\n      ({ provider, model }) => React.createElement('span', { title: provider.name }, model.name),\n    ))\n  },\n}",
				source: "packages/client/ui-model-selection/src/client/slots.ts:36"
			},
			{
				key: "conversation.input.overlay",
				kind: "list",
				scope: "session",
				summary: "Floating entries rendered inside the resident composer card.",
				doc: "Floating entries rendered inside the resident composer card.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: [],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.composer.bar' (client-ui-conversation), so it exists while that entry is mounted",
				occupants: [
					"client-ui-commands PopupSelectView id 'command-popup'",
					"client-ui-input-trigger MenuView id 'slash-menu'",
					"client-ui-message-feedback FeedbackDialog id 'feedback-dialog'"
				],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.input.overlay', () => ctx.slots.register(\n      { name: 'conversation.input.overlay', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-conversation/src/client/contract/slots.ts:292"
			},
			{
				key: "conversation.input.permission",
				kind: "single",
				scope: "session",
				summary: "Current-session permission control inside the composer tool row.",
				doc: "Current-session permission control inside the composer tool row.",
				registerOptions: [],
				ownerProps: ["/** Owner share of the named plan, permission, and model controls. */\nexport interface InputControlOwnerProps {\n  /** Whether the composer currently refuses interaction. */\n  locked: boolean\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.composer.bar' (client-ui-conversation), so it exists while that entry is mounted",
				occupants: ["client-ui-permission-presets PermissionSelect"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.input.permission', () => ctx.slots.register(\n      { name: 'conversation.input.permission' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-conversation/src/client/contract/slots.ts:312"
			},
			{
				key: "conversation.input.plan",
				kind: "single",
				scope: "session",
				summary: "Plan control inside the composer tool row.",
				doc: "Plan control inside the composer tool row.",
				registerOptions: [],
				ownerProps: ["/** Owner share of the named plan, permission, and model controls. */\nexport interface InputControlOwnerProps {\n  /** Whether the composer currently refuses interaction. */\n  locked: boolean\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.composer.bar' (client-ui-conversation), so it exists while that entry is mounted",
				occupants: ["client-ui-plan PlanChip"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.input.plan', () => ctx.slots.register(\n      { name: 'conversation.input.plan' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-conversation/src/client/contract/slots.ts:310"
			},
			{
				key: "conversation.input.right",
				kind: "list",
				scope: "session",
				summary: "Compact controls before the composer submit action.",
				doc: "Compact controls before the composer submit action.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: [],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.composer.bar' (client-ui-conversation), so it exists while that entry is mounted",
				occupants: [],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.input.right', () => ctx.slots.register(\n      { name: 'conversation.input.right', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-conversation/src/client/contract/slots.ts:298"
			},
			{
				key: "conversation.plan-review.actions",
				kind: "list",
				scope: "session",
				summary: "Actions for the exact plan under review; approval remains with the question composer.",
				doc: "Actions for the exact plan under review; approval remains with the question composer.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/**\n * A request narrowed to the `plan-review` presentation intent: everything the\n * decision card renders and answers with, so the panel never re-reads the\n * request fields. `approve` and `decline` are the asker's own options — an\n * answer must carry one of those labels verbatim — and `plan` is the markdown\n * body under review.\n */\nexport interface PlanReview {\n  /** The reviewed question's id, echoed in the answer. */\n  id: string\n  /** The question text, kept as the card's accessible name. */\n  question: string\n  /** The plan markdown under review. */\n  plan: string\n  /** Logged tool invocation used to reopen this plan. */\n  callId?: ToolCallId\n  /** The option that approves the plan. */\n  approve: QuestionOption\n  /** The option that declines it; absent when the asker offered no other option. */\n  decline?: QuestionOption\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.composer' (client-ui-user-questions), so it exists while that entry is mounted",
				occupants: ["client-ui-plan PlanReviewOpen"],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.plan-review.actions', () => ctx.slots.register(\n      { name: 'conversation.plan-review.actions', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-user-questions/src/client/contract/slots.ts:21"
			},
			{
				key: "conversation.session",
				kind: "single",
				scope: "session",
				summary: "Strict per-Session Conversation body.",
				doc: "Strict per-Session Conversation body.",
				registerOptions: [],
				ownerProps: [],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "factory 'conversation.content' (client-ui-conversation), so it exists while that definition is registered",
				occupants: ["client-ui-conversation ConversationSession"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.session', () => ctx.slots.register(\n      { name: 'conversation.session' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-conversation/src/client/contract/slots.ts:224"
			},
			{
				key: "conversation.session.header",
				kind: "single",
				scope: "session",
				summary: "Strict per-Session title, actions, and View navigation.",
				doc: "Strict per-Session title, actions, and View navigation.",
				registerOptions: [],
				ownerProps: [],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.header' (client-ui-conversation), so it exists while that entry is mounted",
				occupants: ["client-ui-conversation ConversationSessionHeader"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.session.header', () => ctx.slots.register(\n      { name: 'conversation.session.header' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-conversation/src/client/contract/slots.ts:232"
			},
			{
				key: "conversation.session.header.actions",
				kind: "list",
				scope: "session",
				summary: "Title-adjacent Session actions in ascending order.",
				doc: "Title-adjacent Session actions in ascending order.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/** Header actions derive their state from standard Session props. */\nexport interface ConversationHeaderActionOwnerProps {\n  /** Marker field: entries receive no owner-specific values. */\n  children?: never\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.session.header' (client-ui-conversation), so it exists while that entry is mounted",
				occupants: [
					"client-ui-agent-preset AgentPresetLabel id 'agent-preset'",
					"client-ui-jobs JobListAction id 'job-list'",
					"client-ui-subagent SubagentCatalogAction id 'subagent-catalog'",
					"experimental-client-ui-agent-team TeamAction id 'agent-team'"
				],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.session.header.actions', () => ctx.slots.register(\n      { name: 'conversation.session.header.actions', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-conversation/src/client/contract/slots.ts:247"
			},
			{
				key: "conversation.session.header.corner",
				kind: "single",
				scope: "session",
				summary: "The header's far-right corner, past the utilities' edge and into the header's own padding, for one control.",
				doc: "The header's far-right corner, past the utilities' edge and into the\nheader's own padding, for one control. The corner is laid out only while\nits occupant renders something; an occupant with nothing to show renders\nnothing, and the utilities take the header's edge.",
				registerOptions: [],
				ownerProps: ["/** The header corner's occupant derives its state from standard Session props. */\nexport interface ConversationHeaderCornerOwnerProps {\n  /** Marker field: the occupant receives no owner-specific values. */\n  children?: never\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.session.header' (client-ui-conversation), so it exists while that entry is mounted",
				occupants: ["client-ui-sidebar-right ExpandButton"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.session.header.corner', () => ctx.slots.register(\n      { name: 'conversation.session.header.corner' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-conversation/src/client/contract/slots.ts:270"
			},
			{
				key: "conversation.session.header.lineage",
				kind: "single",
				scope: "session",
				summary: "Optional replacement for one Session breadcrumb title.",
				doc: "Optional replacement for one Session breadcrumb title.",
				registerOptions: [],
				ownerProps: ["/** Plain breadcrumb data handed to the optional lineage renderer. */\nexport interface ConversationHeaderLineageOwnerProps {\n  /** Session represented by this breadcrumb title. */\n  lineageSessionId: SessionId\n  /** Display title available to a combined title/control renderer. */\n  displayTitle: string\n  /** Navigate to an ancestor title when present. */\n  openTitle?: () => void\n}"],
				ownerPropsReferences: ["SessionId"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.session.header' (client-ui-conversation), so it exists while that entry is mounted",
				occupants: ["client-ui-subagent SubagentHeaderLineage"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.session.header.lineage', () => ctx.slots.register(\n      { name: 'conversation.session.header.lineage' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-conversation/src/client/contract/slots.ts:241"
			},
			{
				key: "conversation.session.header.utilities",
				kind: "list",
				scope: "session",
				summary: "Right-aligned Session utilities in ascending order.",
				doc: "Right-aligned Session utilities in ascending order.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/** Header actions derive their state from standard Session props. */\nexport interface ConversationHeaderActionOwnerProps {\n  /** Marker field: entries receive no owner-specific values. */\n  children?: never\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.session.header' (client-ui-conversation), so it exists while that entry is mounted",
				occupants: [
					"client-ui-open-in-app SessionOpenInAppAction id 'open-in-app'",
					"client-ui-schedule ScheduleCatalogAction id 'schedule-catalog'",
					"session-log-export SessionLogDownloadHeaderAction id 'session-log-download'"
				],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register(\n      { name: 'conversation.session.header.utilities', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-conversation/src/client/contract/slots.ts:253"
			},
			{
				key: "conversation.session.header.views.actions",
				kind: "list",
				scope: "root",
				summary: "Rows of the View tab row's More menu; the header shows More only while this list has registrations.",
				doc: "Rows of the View tab row's More menu; the header shows More only while this list has registrations.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/** Owner share of the View tab row's More menu rows. */\nexport interface ConversationViewActionsOwnerProps {\n  /** Views outside the header in registration order. */\n  readonly entries: readonly ConversationViewActionEntry[]\n  /**\n   * Select a View in this Session without changing its pin state.\n   * @param id - Listed View id.\n   */\n  readonly onOpen: (id: string) => void\n  /**\n   * Pin or unpin a View in every Session.\n   * @param id - Listed View id.\n   * @param pinned - Whether the View is manually pinned; the width budget can still fold it into More.\n   */\n  readonly onPinnedChange: (id: string, pinned: boolean) => void\n  /** Close the More menu. */\n  readonly onDismiss: () => void\n}"],
				ownerPropsReferences: ["ConversationViewActionEntry"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.session.header' (client-ui-conversation), so it exists while that entry is mounted",
				occupants: ["client-ui-entry-customization EntryMenuContent id 'entry-customization'"],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.session.header.views.actions', () => ctx.slots.register(\n      { name: 'conversation.session.header.views.actions', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-conversation/src/client/contract/slots.ts:276"
			},
			{
				key: "conversation.trajectory.images",
				kind: "single",
				scope: "session",
				summary: "Renderer for one group of durable record images in the Trajectory ledger.",
				doc: "Renderer for one group of durable record images in the Trajectory\nledger. The owner supplies image references, an authorized loader, and\nalignment. A registration replaces the shipped gallery; without one,\nimages are omitted.",
				registerOptions: [],
				ownerProps: ["/** Message image group handed to the optional attachment presentation plugin. */\nexport interface MessageImagesOwnerProps {\n  /** Durable references or submission-echo previews in source order. */\n  images: readonly MessageImageSource[]\n  /** Session-authorized image URL loader for the durable arm. */\n  loadImage: MessageImageLoader\n  /** Horizontal placement inside the owning record. */\n  align: 'start' | 'end'\n  /** Force every image into the compact message-attachment tile size. */\n  compact?: boolean\n  /** Fixed, uncropped thumbnail for an attachment list row. */\n  thumbnail?: boolean\n}"],
				ownerPropsReferences: [
					"Message",
					"MessageImageLoader",
					"MessageImageSource"
				],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.view' (client-ui-trajectory), so it exists while that entry is mounted",
				occupants: ["client-ui-attachment MessageImages"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.trajectory.images', () => ctx.slots.register(\n      { name: 'conversation.trajectory.images' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-trajectory/src/client/trajectory-contract.ts:103"
			},
			{
				key: "conversation.user.text.node",
				kind: "keyed",
				scope: "session",
				summary: "One business-owned inline renderer for a pure JSON text node.",
				doc: "One business-owned inline renderer for a pure JSON text node.",
				registerOptions: [{
					name: "key",
					requirement: "required",
					type: "string",
					doc: "Your cell key: the entry renders where the owner dispatches this exact key. Registering an already-occupied key replaces that occupant."
				}],
				ownerProps: ["/** JSON-only owner data common to every business text node. */\nexport interface UserTextNodeOwnerProps {\n  readonly raw: string\n  readonly interactive: boolean\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "fixed by the owner's key table { [Id in UserTextId]: { node: UserTextNode<Id> } }, already taken: command, file, folder, quote, secret, session, skill, text",
				hookContext: "",
				slotInject: "",
				declaredBy: "factory 'conversation.user.text' (client-ui-conversation), so it exists while that definition is registered",
				occupants: [
					"client-ui-conversation PlainUserText key 'text'",
					"client-ui-conversation SessionReference key 'session'",
					"client-ui-goal GoalCommandReference key 'command'",
					"client-ui-reference FileReference key 'file'",
					"client-ui-reference FolderReference key 'folder'",
					"client-ui-secret-mask SecretText key 'secret'",
					"client-ui-skill SkillReference key 'skill'",
					"message-quotes QuotedUserText key 'quote'"
				],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.user.text.node', () => ctx.slots.register(\n      { name: 'conversation.user.text.node', key: '<one key the owner dispatches>' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-conversation/src/client/contract/slots.ts:214"
			},
			{
				key: "conversation.view",
				kind: "list",
				scope: "session",
				summary: "Registered Conversation target Views, rendered one at a time.",
				doc: "Registered Conversation target Views, rendered one at a time.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/** Conversation View entries obtain their data from registered standard hooks. */\nexport interface ConvViewOwnerProps {\n  /** Open a tool call's inspector when an inspection target is available. */\n  inspectCall: ((callId: string) => void) | undefined\n  /** Focus request addressed to the selected View. */\n  viewRequest: import('./views.ts').ConversationViewRequest | null\n  /** Select a View and address one opaque focus identity to it. */\n  openView: (view: string, focus: string) => void\n  /** Acknowledge the current one-shot focus request. */\n  completeViewRequest: () => void\n}"],
				ownerPropsReferences: ["ConversationViewRequest"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.session' (client-ui-conversation), so it exists while that entry is mounted",
				occupants: ["client-ui-chat ChatView id 'chat'", "client-ui-trajectory TrajectoryView id 'trajectory'"],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.view', () => ctx.slots.register(\n      { name: 'conversation.view', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-conversation/src/client/contract/slots.ts:278"
			},
			{
				key: "deliverables.file.actions",
				kind: "list",
				scope: "session",
				summary: "Open one file through its authorized Session event coordinates.",
				doc: "Open one file through its authorized Session event coordinates.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/** Native file action selected by an explicit user gesture. */\nexport type PresentedAction = 'open' | 'reveal'", "/** Failure feedback for the shared native opening control. */\nexport type PresentedOpenFailure = 'openError' | 'revealError' | null"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.chat.turnTail' (client-ui-deliverables), so it exists while that entry is mounted",
				occupants: ["client-ui-open-in-app FileRouteAction id 'open-in-app'"],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('deliverables.file.actions', () => ctx.slots.register(\n      { name: 'deliverables.file.actions', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-deliverables/src/client/file-actions.ts:8"
			},
			{
				key: "deliverables.review.file.actions",
				kind: "list",
				scope: "session",
				summary: "The same file actions owned by a changed-file review tab.",
				doc: "The same file actions owned by a changed-file review tab.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/** Slot contract table. Owners extend via declaration merging; entries are {@link SlotEntryDef}. */\nexport interface SlotMap {}"],
				ownerPropsReferences: ["SlotEntryDef"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'sidebar.right.pane.tab' (client-ui-deliverables), so it exists while that entry is mounted",
				occupants: ["client-ui-open-in-app FileRouteAction id 'open-in-app'"],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('deliverables.review.file.actions', () => ctx.slots.register(\n      { name: 'deliverables.review.file.actions', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-deliverables/src/client/file-actions.ts:21"
			},
			{
				key: "main",
				kind: "keyed",
				scope: "root",
				summary: "Central panel selected by sidebar entry id.",
				doc: "Central panel selected by sidebar entry id. The reserved `conversation`\nkey hosts the Conversation; other keys receive no Session binding.",
				registerOptions: [{
					name: "key",
					requirement: "required",
					type: "string",
					doc: "Your cell key: the entry renders where the owner dispatches this exact key. Registering an already-occupied key replaces that occupant."
				}],
				ownerProps: [],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "open: any string the owner dispatches (no compile-time key set), already taken: conversation",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'root' (client-ui-layout), so it exists while that entry is mounted",
				occupants: [
					"client-ui-conversation ConversationPanel key 'conversation'",
					"client-ui-plugin-manager PluginManagerPage",
					"client-ui-schedule TaskManagerPage"
				],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('main', () => ctx.slots.register(\n      { name: 'main', key: '<one key the owner dispatches>' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-layout/src/client/index.ts:73"
			},
			{
				key: "main.conversation",
				kind: "single",
				scope: "session-maybe",
				summary: "Conversation shell beneath its root-scoped main-panel entry.",
				doc: "Conversation shell beneath its root-scoped main-panel entry.",
				registerOptions: [],
				ownerProps: [],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useConversation: MaybeSnapshotSelectorHook<ConversationSnapshot>",
					"useInput: MaybeSnapshotSelectorHook<InputState>",
					"inputActions: InputActions | undefined",
					"useSession: MaybeSnapshotSelectorHook<SessionSnapshot>",
					"sessionId: SessionId | undefined",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean | undefined"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'main' (client-ui-conversation), so it exists while that entry is mounted",
				occupants: ["client-ui-conversation ConversationRoot"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('main.conversation', () => ctx.slots.register(\n      { name: 'main.conversation' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-conversation/src/client/contract/slots.ts:222"
			},
			{
				key: "plugins.add.actions",
				kind: "list",
				scope: "root",
				summary: "Additional MenuItemButton rows after installation: 72px high, with a title and a description capped at two lines.",
				doc: "Additional MenuItemButton rows after installation: 72px high, with a title and a description capped at two lines.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/** Add-plugin menu actions, independent of any selected bundle or Session. */\nexport interface PluginAddActionsProps {\n  /** Close the add-plugin menu before starting the contributed action. */\n  readonly onDismiss: () => void\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'main' (client-ui-plugin-manager), so it exists while that entry is mounted",
				occupants: ["client-ui-agent-preset CreatePluginMenuItem id 'create-plugin'"],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('plugins.add.actions', () => ctx.slots.register(\n      { name: 'plugins.add.actions', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-plugin-manager/src/client/slot-contract.ts:118"
			},
			{
				key: "plugins.bundle.activation",
				kind: "keyed",
				scope: "root",
				summary: "Optional guidance after the user enables a bundle from the list, keyed by npm package name.",
				doc: "Optional guidance after the user enables a bundle from the list, keyed by npm package name.",
				registerOptions: [{
					name: "key",
					requirement: "required",
					type: "string",
					doc: "Your cell key: the entry renders where the owner dispatches this exact key. Registering an already-occupied key replaces that occupant."
				}],
				ownerProps: ["/** One user-requested bundle activation and navigation to its configuration page. */\nexport interface PluginActivationOwnerProps {\n  readonly packageName: string\n  /** Dismiss guidance for this activation. */\n  readonly onDismiss: () => void\n  /** Dismiss guidance and open this bundle's detail page. */\n  readonly onOpenDetails: () => void\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "open: any string the owner dispatches (no compile-time key set), already taken: @deepseek-ai/dsh-cua-bundle, @deepseek-ai/dsh-experimental-voice-input-bundle",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'main' (client-ui-plugin-manager), so it exists while that entry is mounted",
				occupants: ["experimental-client-ui-voice-input VoiceSetupPrompt key '@deepseek-ai/dsh-experimental-voice-input-bundle'", "cua PermissionSetup key '@deepseek-ai/dsh-cua-bundle'"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('plugins.bundle.activation', () => ctx.slots.register(\n      { name: 'plugins.bundle.activation', key: '<one key the owner dispatches>' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-plugin-manager/src/client/slot-contract.ts:126"
			},
			{
				key: "plugins.bundle.config",
				kind: "keyed",
				scope: "root",
				summary: "A bundle's own configuration, keyed by the bundle's package name and rendered on the bundle's page between its description and its rows (`view: 'page'` only).",
				doc: "A bundle's own configuration, keyed by the bundle's package name and\nrendered on the bundle's page between its description and its rows\n(`view: 'page'` only).",
				registerOptions: [{
					name: "key",
					requirement: "required",
					type: "string",
					doc: "Your cell key: the entry renders where the owner dispatches this exact key. Registering an already-occupied key replaces that occupant."
				}],
				ownerProps: ["/** The view the page asks a configuration entry for. */\nexport interface PluginConfigViewProps {\n  /** `summary` renders the one-liner alone, as text or inline nodes; `page` renders the form with its save control. */\n  readonly view: 'summary' | 'page'\n  /** Host-owned configuration values and write actions for this page's entry. */\n  readonly form?: ConfigPageForm | undefined\n}"],
				ownerPropsReferences: ["ConfigPageForm"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "open: any string the owner dispatches (no compile-time key set), already taken: @deepseek-ai/dsh-cua-bundle, @deepseek-ai/dsh-experimental-cot-translation-bundle, @deepseek-ai/dsh-experimental-voice-input-bundle",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'main' (client-ui-plugin-manager), so it exists while that entry is mounted",
				occupants: [
					"experimental-client-ui-cot-translation TranslationSettings key '@deepseek-ai/dsh-experimental-cot-translation-bundle'",
					"experimental-client-ui-voice-input VoicePreparation key '@deepseek-ai/dsh-experimental-voice-input-bundle'",
					"cua PermissionPanel key '@deepseek-ai/dsh-cua-bundle'"
				],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register(\n      { name: 'plugins.bundle.config', key: '<one key the owner dispatches>' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-plugin-manager/src/client/slot-contract.ts:142"
			},
			{
				key: "plugins.detail.actions",
				kind: "list",
				scope: "root",
				summary: "Controls at the head of a detail page, before the page's own switch and uninstall, rendered with the page's subject.",
				doc: "Controls at the head of a detail page, before the page's own switch and\nuninstall, rendered with the page's subject. An entry renders null for a\nsubject it has no control for.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/** The owner props every detail contribution is rendered with. */\nexport interface PluginDetailProps {\n  /** The subject of the open page; an entry renders null for a subject it has nothing for. */\n  readonly subject: PluginsSubject\n}"],
				ownerPropsReferences: ["PluginsSubject"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'main' (client-ui-plugin-manager), so it exists while that entry is mounted",
				occupants: [],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('plugins.detail.actions', () => ctx.slots.register(\n      { name: 'plugins.detail.actions', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-plugin-manager/src/client/slot-contract.ts:156"
			},
			{
				key: "plugins.detail.badge",
				kind: "list",
				scope: "root",
				summary: "Tags beside a detail page's title, after the version, beta, and problem tags the page draws itself, rendered with the page's subject.",
				doc: "Tags beside a detail page's title, after the version, beta, and problem\ntags the page draws itself, rendered with the page's subject.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/** The owner props every detail contribution is rendered with. */\nexport interface PluginDetailProps {\n  /** The subject of the open page; an entry renders null for a subject it has nothing for. */\n  readonly subject: PluginsSubject\n}"],
				ownerPropsReferences: ["PluginsSubject"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'main' (client-ui-plugin-manager), so it exists while that entry is mounted",
				occupants: [],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('plugins.detail.badge', () => ctx.slots.register(\n      { name: 'plugins.detail.badge', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-plugin-manager/src/client/slot-contract.ts:161"
			},
			{
				key: "plugins.detail.section",
				kind: "list",
				scope: "root",
				summary: "Sections under a detail page's own content: after the source on a bundle's page, after the configuration on a row's or an official plugin's page.",
				doc: "Sections under a detail page's own content: after the source on a bundle's\npage, after the configuration on a row's or an official plugin's page.\nAn entry draws its own section chrome and renders null for a subject it\nhas nothing for.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/** The owner props every detail contribution is rendered with. */\nexport interface PluginDetailProps {\n  /** The subject of the open page; an entry renders null for a subject it has nothing for. */\n  readonly subject: PluginsSubject\n}"],
				ownerPropsReferences: ["PluginsSubject"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'main' (client-ui-plugin-manager), so it exists while that entry is mounted",
				occupants: [],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('plugins.detail.section', () => ctx.slots.register(\n      { name: 'plugins.detail.section', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-plugin-manager/src/client/slot-contract.ts:168"
			},
			{
				key: "plugins.item",
				kind: "list",
				scope: "root",
				summary: "One official plugin the Plugins page lists in its Official group after the official bundles: `label` is the card's title and `order` its place.",
				doc: "One official plugin the Plugins page lists in its Official group after\nthe official bundles: `label` is the card's title and `order` its place.\nThe page renders the entry as the card's one-liner (`view: 'summary'`)\nand, once the card is opened, as the body of the plugin's own page\n(`view: 'page'`). OCCUPIED by the official settings pages, one companion\npackage per host-plane namespace; a bundle's configuration belongs in\n`plugins.bundle.config` or `plugins.row.config` instead.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/** The view the page asks a configuration entry for. */\nexport interface PluginConfigViewProps {\n  /** `summary` renders the one-liner alone, as text or inline nodes; `page` renders the form with its save control. */\n  readonly view: 'summary' | 'page'\n  /** Host-owned configuration values and write actions for this page's entry. */\n  readonly form?: ConfigPageForm | undefined\n}"],
				ownerPropsReferences: ["ConfigPageForm"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'main' (client-ui-plugin-manager), so it exists while that entry is mounted",
				occupants: [
					"client-ui-settings-agent-loop AgentLoopCard id 'agent-loop'",
					"client-ui-settings-shell ShellCard id 'shell'",
					"client-ui-settings-subagent SubagentCard id 'subagent'",
					"client-ui-settings-web-search WebSearchCard id 'web-search'"
				],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('plugins.item', () => ctx.slots.register(\n      { name: 'plugins.item', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-plugin-manager/src/client/slot-contract.ts:136"
			},
			{
				key: "plugins.row.config",
				kind: "keyed",
				scope: "root",
				summary: "The configuration of one row a bundle declares, keyed by `<package name>#<row id>` with the row id as the bundle's patch declares it: the row on the bundle's page gains a configure control that opens the entry's page, headed by the plugin's display title and description.",
				doc: "The configuration of one row a bundle declares, keyed by\n`<package name>#<row id>` with the row id as the bundle's patch declares\nit: the row on the bundle's page gains a configure control that opens\nthe entry's page, headed by the plugin's display title and description.\nAn absent description falls back to the entry's `view: 'summary'`.",
				registerOptions: [{
					name: "key",
					requirement: "required",
					type: "string",
					doc: "Your cell key: the entry renders where the owner dispatches this exact key. Registering an already-occupied key replaces that occupant."
				}],
				ownerProps: ["/** The view the page asks a configuration entry for. */\nexport interface PluginConfigViewProps {\n  /** `summary` renders the one-liner alone, as text or inline nodes; `page` renders the form with its save control. */\n  readonly view: 'summary' | 'page'\n  /** Host-owned configuration values and write actions for this page's entry. */\n  readonly form?: ConfigPageForm | undefined\n}"],
				ownerPropsReferences: ["ConfigPageForm"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "open: any string the owner dispatches (no compile-time key set), none are taken yet",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'main' (client-ui-plugin-manager), so it exists while that entry is mounted",
				occupants: [],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('plugins.row.config', () => ctx.slots.register(\n      { name: 'plugins.row.config', key: '<one key the owner dispatches>' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-plugin-manager/src/client/slot-contract.ts:150"
			},
			{
				key: "plugins.tab",
				kind: "list",
				scope: "root",
				summary: "Tabs after the page's own Installed tab, such as Discover: `label` names the tab and `order` places it.",
				doc: "Tabs after the page's own Installed tab, such as Discover: `label` names the tab and `order` places it. The\npage renders the selected entry under its header and tabs; the entry draws its own content and installs\nthrough the owner's `install`.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/** Owner props of a page tab another plugin contributes, such as Discover. */\nexport interface PluginTabProps {\n  /**\n   * Install an exact version the person already confirmed: the page's install dialog opens at its check and progress\n   * screens, without the spec form, and names the plugin and version above the spec.\n   * @param target - the spec, optional registry, and display text.\n   */\n  readonly install: (target: PluginTabInstall) => void\n  /**\n   * Switch to the Installed tab and open a bundle's page, whose back button returns to the calling tab.\n   * @param packageName - npm package name of the bundle.\n   */\n  readonly openPackage: (packageName: string) => void\n}"],
				ownerPropsReferences: ["PluginTabInstall"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'main' (client-ui-plugin-manager), so it exists while that entry is mounted",
				occupants: ["client-ui-plugin-market DiscoverSection id 'discover'"],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('plugins.tab', () => ctx.slots.register(\n      { name: 'plugins.tab', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-plugin-manager/src/client/slot-contract.ts:124"
			},
			{
				key: "rightbar",
				kind: "single",
				scope: "root",
				summary: "The right column: a track the centre makes room for, or nothing.",
				doc: "The right column: a track the centre makes room for, or nothing. OCCUPIED\nby the right Sidebar, which uses the resolved column width in normal\nmode and covers the viewport in fullscreen, retaining the wide-screen\ncolumn reservation underneath.\n\nWhether the panel is shown, and whether it takes a track, is the\noccupant's own recorded business — it reports the composition of its\nexpanded and presentation state through `ctx.layout`, and the frame sizes\nthe track and places the resize handle from that. The expand control is\nnot this column's: it is a button in the conversation header. The root\noccupant decides when to render its Session-bound content.",
				registerOptions: [],
				ownerProps: ["/** Right column owner share: resolved normal geometry and opening eligibility. */\nexport interface RightbarOwnerProps {\n  /** Resolved normal panel width in px, not the saved preference; zero if it cannot fit. */\n  width: number\n  /** Current frame width in px. */\n  viewportWidth: number\n  /**\n   * Whether a normal right panel can retain 300px beside a 400px center.\n   * Before a narrow opening, includes the space from collapsing the left sidebar.\n   */\n  canShow: boolean\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'root' (client-ui-layout), so it exists while that entry is mounted",
				occupants: ["client-ui-sidebar-right RightbarRoot"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('rightbar', () => ctx.slots.register(\n      { name: 'rightbar' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-layout/src/client/index.ts:87"
			},
			{
				key: "rightbar.session",
				kind: "single",
				scope: "session",
				summary: "Session content selected by the root-scoped right Sidebar controller.",
				doc: "Session content selected by the root-scoped right Sidebar controller.",
				registerOptions: [],
				ownerProps: ["/** Right column owner share: resolved normal geometry and opening eligibility. */\nexport interface RightbarOwnerProps {\n  /** Resolved normal panel width in px, not the saved preference; zero if it cannot fit. */\n  width: number\n  /** Current frame width in px. */\n  viewportWidth: number\n  /**\n   * Whether a normal right panel can retain 300px beside a 400px center.\n   * Before a narrow opening, includes the space from collapsing the left sidebar.\n   */\n  canShow: boolean\n}", "/** Identity of one open tab; distinct copies of one content share `contentId`, never `TabId`. */\nexport type TabId = Branded<'TabId'>"],
				ownerPropsReferences: ["Branded"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'rightbar' (client-ui-sidebar-right), so it exists while that entry is mounted",
				occupants: ["client-ui-sidebar-right RightbarSeat"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('rightbar.session', () => ctx.slots.register(\n      { name: 'rightbar.session' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-sidebar-right/src/client/contract/slots.ts:43"
			},
			{
				key: "root",
				kind: "single",
				scope: "root",
				summary: "The built-in render-tree root hole (seeded by SlotCore): the one slot the shell itself renders, and the ancestor of every other seat.",
				doc: "The built-in render-tree root hole (seeded by SlotCore): the one slot the\nshell itself renders, and the ancestor of every other seat. OCCUPIED by\nui-layout's AppFrame, which declares the sidebar, conversation, details,\nand shell.overlay seats inside it.\n\nDO NOT register here. This is a single slot, so a second entry does not\nsit beside the frame — it shadows it, and a dynamically registered entry\nis assigned a lower priority than the shipped one, which makes it the\nwinner: the page would render your component alone, with every seat the\nframe declares gone. For a surface of your own that floats over the whole\napp, register into `shell.overlay` instead (a list slot: additive, and\nclick-through until your entry opts into pointer events).",
				registerOptions: [],
				ownerProps: ["/** Root owner share: the shell supplies nothing — the frame is inject-assembled. */\nexport interface RootOwnerProps { children?: never }"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "the runtime itself (built in; always present)",
				occupants: ["client-ui-layout AppFrame"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('root', () => ctx.slots.register(\n      { name: 'root' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-renderer/src/client/registry.ts:44"
			},
			{
				key: "settings.action",
				kind: "list",
				scope: "root",
				summary: "Optional actions rendered in the content-column header before Close.",
				doc: "Optional actions rendered in the content-column header before Close.\nRegistrants own visibility, behavior, copy, and failure presentation;\nthe shell supplies only the ordered render site.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/** Owner share of the header title seat (the shell supplies nothing). */\nexport interface SettingsHeaderOwnerProps {\n  /** Marker field: header owner props are intentionally empty. */\n  children?: never\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'sidebar.settings' (client-ui-settings-general), so it exists while that entry is mounted",
				occupants: ["client-ui-settings-general SettingsDocumentAction id 'open-document'"],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('settings.action', () => ctx.slots.register(\n      { name: 'settings.action', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-settings/src/client/contract/slots.ts:39"
			},
			{
				key: "settings.close",
				kind: "single",
				scope: "root",
				summary: "The close button's visually-hidden label text (the button itself — icon, geometry, focus — is shell chrome).",
				doc: "The close button's visually-hidden label text (the button itself —\nicon, geometry, focus — is shell chrome). Absent contribution leaves\nthe button without an accessible name (broken-composition state).",
				registerOptions: [],
				ownerProps: ["/** Owner share of the header title seat (the shell supplies nothing). */\nexport interface SettingsHeaderOwnerProps {\n  /** Marker field: header owner props are intentionally empty. */\n  children?: never\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'sidebar.settings' (client-ui-settings-general), so it exists while that entry is mounted",
				occupants: ["client-ui-settings-general CloseLabel"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('settings.close', () => ctx.slots.register(\n      { name: 'settings.close' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-settings/src/client/contract/slots.ts:45"
			},
			{
				key: "settings.general.item",
				kind: "list",
				scope: "root",
				summary: "One preference row inside the General section — the additive seat for a single setting that needs no page of its own (a whole page is `settings.section`), contributed by the feature plugin that owns the preference (locale → Language, ui-theme → Appearance, ui-conversation → Composer Enter).",
				doc: "One preference row inside the General section — the additive seat for a\nsingle setting that needs no page of its own (a whole page is\n`settings.section`), contributed by the feature plugin that owns the\npreference (locale → Language, ui-theme → Appearance, ui-conversation →\nComposer Enter). Options: `id` (row key), `order` (row position). The\nsection column only stacks rows, so a row draws its own internals,\nincluding its label: nothing projects a `label` here and the owner passes\nno props at all — copy, current value, and the write path are all yours,\nthrough your own inject face and `host.call`. Declared at runtime by\nui-settings-general's General entry; the type lives here with every other\nsettings slot type, because this package is the settings domain's base\nlayer and every registrant already depends on it for `ctx.configForms`.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/** Owner share of a General preference row (the section supplies nothing). */\nexport interface SettingsGeneralItemOwnerProps {\n  /** Marker field: item owner props are intentionally empty. */\n  children?: never\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'settings.section' (client-ui-settings-general), so it exists while that entry is mounted",
				occupants: [
					"client-locale LanguageRow id 'language'",
					"client-ui-chat LinkOpeningRow id 'link-opening'",
					"client-ui-chat PerformanceUsageRow id 'performance-usage'",
					"client-ui-chat TranscriptViewRow id 'transcript-view'",
					"client-ui-conversation EnterBehaviorRow id 'composer-enter'",
					"client-ui-permission-presets PermissionRow id 'permission'",
					"client-ui-settings-general DeveloperToolsRow id 'developer-tools'",
					"client-ui-settings-general CurrentVersionRow id 'current-version'",
					"client-ui-settings-session-log UploadRow",
					"client-ui-shortcuts ShortcutsRow id 'shortcuts'",
					"client-ui-theme AppearanceRow id 'appearance'",
					"client-ui-theme FontSettingsGroup id 'font-size'"
				],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('settings.general.item', () => ctx.slots.register(\n      { name: 'settings.general.item', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-settings/src/client/contract/slots.ts:92"
			},
			{
				key: "settings.header",
				kind: "single",
				scope: "root",
				summary: "The panel title text seat.",
				doc: "The panel title text seat. Content renders inside the nav heading row;\nthe dialog's accessible name points at that node via aria-labelledby.\nAbsent contribution leaves the heading empty.",
				registerOptions: [],
				ownerProps: ["/** Owner share of the header title seat (the shell supplies nothing). */\nexport interface SettingsHeaderOwnerProps {\n  /** Marker field: header owner props are intentionally empty. */\n  children?: never\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'sidebar.settings' (client-ui-settings-general), so it exists while that entry is mounted",
				occupants: ["client-ui-settings-general HeaderContent"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('settings.header', () => ctx.slots.register(\n      { name: 'settings.header' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-settings/src/client/contract/slots.ts:33"
			},
			{
				key: "settings.launcher",
				kind: "single",
				scope: "root",
				summary: "Optional sidebar account launcher; opens the shell-owned settings panel.",
				doc: "Optional sidebar account launcher; opens the shell-owned settings panel.",
				registerOptions: [],
				ownerProps: ["/** Sidebar launcher geometry and settings navigation. */\nexport interface SettingsLauncherOwnerProps {\n  /** Whether the sidebar shows labels. */\n  wide: boolean\n  /** Whether the settings dialog covers the sidebar; a launcher may treat a false-to-true edge as one Settings entry. */\n  settingsOpen: boolean\n  /** Effective Settings key labels and accessible combination; omitted when unbound. */\n  settingsShortcut?: { readonly keys: readonly string[]; readonly aria?: string | undefined }\n  /** Open the settings panel. */\n  openSettings: () => void\n  /** @param id - registered onboarding editor to open explicitly. */\n  openOnboarding: (id: string) => void\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'sidebar.settings' (client-ui-settings-general), so it exists while that entry is mounted",
				occupants: ["client-ui-settings-account AccountMenu"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('settings.launcher', () => ctx.slots.register(\n      { name: 'settings.launcher' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-settings/src/client/contract/slots.ts:17"
			},
			{
				key: "settings.models.footer",
				kind: "list",
				scope: "root",
				summary: "Ordered extension area after the provider rows and the add controls.",
				doc: "Ordered extension area after the provider rows and the add controls.\nWithout a registrant the area renders nothing.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/** Owner share of the footer area (the section supplies nothing). */\nexport interface ModelsFooterOwnerProps {\n  /** Marker field: footer owner props are intentionally empty. */\n  children?: never\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'settings.section' (client-ui-settings-models), so it exists while that entry is mounted",
				occupants: [],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('settings.models.footer', () => ctx.slots.register(\n      { name: 'settings.models.footer', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-settings-models/src/client/slot-contract.ts:40"
			},
			{
				key: "settings.models.provider-card",
				kind: "keyed",
				scope: "root",
				summary: "One provider card's adapter extension area, dispatched with `entryKey = settingsNs` on every card that renders a directory row: a saved row's card (its first-run setup posture included) and the add-provider draft card.",
				doc: "One provider card's adapter extension area, dispatched with\n`entryKey = settingsNs` on every card that renders a directory row: a\nsaved row's card (its first-run setup posture included) and the\nadd-provider draft card. The hand-declared draft card has no directory\nrow yet, so it dispatches nothing until saved. Without a registrant the\narea renders nothing.",
				registerOptions: [{
					name: "key",
					requirement: "required",
					type: "string",
					doc: "Your cell key: the entry renders where the owner dispatches this exact key. Registering an already-occupied key replaces that occupant."
				}],
				ownerProps: ["/** Owner share of one provider-card extension occurrence. */\nexport interface ProviderCardExtrasOwnerProps {\n  /** The card's directory row (route id, display name, settings address, live state). */\n  provider: ProviderDirectoryEntry\n  /** Whether any layer configures this provider (its profile resolves); `false` while the add-provider draft edits a dormant row. */\n  configured: boolean\n  /** Whether the row's referenced api-key credential is confirmed configured (the page's credential join). */\n  keyConfigured: boolean\n}"],
				ownerPropsReferences: ["ProviderDirectoryEntry"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "open: any string the owner dispatches (no compile-time key set), none are taken yet",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'settings.section' (client-ui-settings-models), so it exists while that entry is mounted",
				occupants: [],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('settings.models.provider-card', () => ctx.slots.register(\n      { name: 'settings.models.provider-card', key: '<one key the owner dispatches>' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-settings-models/src/client/slot-contract.ts:33"
			},
			{
				key: "settings.models.sign-in",
				kind: "single",
				scope: "root",
				summary: "Optional account login choice before the credential editor.",
				doc: "Optional account login choice before the credential editor.",
				registerOptions: [],
				ownerProps: [],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'settings.onboarding' (client-ui-settings-models), so it exists while that entry is mounted",
				occupants: ["client-ui-settings-account AccountOnboarding"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('settings.models.sign-in', () => ctx.slots.register(\n      { name: 'settings.models.sign-in' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-settings-models/src/client/slot-contract.ts:35"
			},
			{
				key: "settings.onboarding",
				kind: "list",
				scope: "root",
				summary: "Root-scoped onboarding steps contributed by settings features.",
				doc: "Root-scoped onboarding steps contributed by settings features. The\nshell mounts one ordered step at a time; the active registrant either\ncompletes itself or keeps ownership until the user completes its sole\npath. Registrants own readiness, copy, dialog behavior, AND visible\nchrome: a step wraps its visible content in its modal surface (including\n`#root` inert ownership) and renders null while private facts are still\nloading. The shell paints no chrome of its own, so a mounted-but-deciding\nstep shows and blocks nothing.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/** Owner share of the currently active settings-backed onboarding step. */\nexport interface SettingsOnboardingOwnerProps {\n  /** Stable id of the step currently selected by the coordinator. */\n  stepId: string\n  /** User explicitly reopened this step outside first-run onboarding. */\n  explicit?: boolean\n  /** Complete or skip this step and transfer ownership to the next entry. */\n  complete: () => void\n  /** Open the settings panel directly on one registered section. */\n  openSection: (id: string) => void\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'sidebar.settings' (client-ui-settings-general), so it exists while that entry is mounted",
				occupants: ["client-ui-settings-models WelcomeNotice id 'welcome-notice'", "client-ui-settings-models DeepSeekOnboardingDialog id 'deepseek-official'"],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('settings.onboarding', () => ctx.slots.register(\n      { name: 'settings.onboarding', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-settings/src/client/contract/slots.ts:77"
			},
			{
				key: "settings.plugins.tab",
				kind: "list",
				scope: "root",
				summary: "One page inside the Plugins settings section.",
				doc: "One page inside the Plugins settings section. The section owner renders\nlocalized entry labels as tabs and mounts each contribution inside its\ncorresponding tab panel. Options: `id` (tab key), `order` (tab order),\nand `label` (registrant-localized tab text). Declared at runtime by the\nfeature that owns the Plugins section; the type lives here so inventory\nand configuration plugins collaborate without depending on one another.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/** Owner share of a Plugins tab (the section supplies nothing). */\nexport interface SettingsPluginsTabOwnerProps {\n  /** Marker field: tab owner props are intentionally empty. */\n  children?: never\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'settings.section' (client-ui-settings-plugins), so it exists while that entry is mounted",
				occupants: ["client-ui-settings-plugin-inventory PluginInventorySettingsTab id 'all'"],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register(\n      { name: 'settings.plugins.tab', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-settings/src/client/contract/slots.ts:66"
			},
			{
				key: "settings.section",
				kind: "list",
				scope: "root",
				summary: "One settings page per list entry.",
				doc: "One settings page per list entry. Registrant options carry the nav\nidentity: `id` (section key, drives `only` filtering), `order` (nav\nposition), `label` (registrant-localized display text — the registrant\nre-registers with fresh text on locale change, so the shell never\nsubscribes locale state; the ledger bump doubles as the shell's\nre-render trigger). Sections render inside the panel content column.\n(`settings.general.item`, declared by ui-settings-general's General\nentry, is typed in the locale package — the common dependency of every\nitem registrant; the shell neither declares nor renders it.)",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/**\n * Owner share of a settings section entry. The shell owns modal visibility\n * and navigation; a section's data arrives through its own inject faces and\n * stores. `close` is the one shell affordance a section receives, for flows\n * that leave settings altogether (starting a session from a section) — the\n * onboarding coordinator's `openSection`/`complete` precedent, inverted.\n */\nexport interface SettingsSectionOwnerProps {\n  /** Close the settings panel (the shell owns the open state). */\n  close: () => void\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'sidebar.settings' (client-ui-settings-general), so it exists while that entry is mounted",
				occupants: [
					"client-ui-agent-preset AgentPresetSection id 'agent-presets'",
					"client-ui-settings-account AccountSection id 'account'",
					"client-ui-settings-general GeneralSection id 'general'",
					"client-ui-settings-models ModelsSection id 'models'",
					"client-ui-settings-plugins PluginsSettingsSection id 'plugins'"
				],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('settings.section', () => ctx.slots.register(\n      { name: 'settings.section', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-settings/src/client/contract/slots.ts:57"
			},
			{
				key: "settings.trigger",
				kind: "single",
				scope: "root",
				summary: "The sidebar-foot trigger row content: icon + label, supplied as slot content (the accessible name comes from the content — rail state renders the label visually hidden).",
				doc: "The sidebar-foot trigger row content: icon + label, supplied as slot\ncontent (the accessible name comes from the content — rail state\nrenders the label visually hidden). The shell renders the button\nchrome and owns open state. Absent contribution degrades to an\nicon-only button without an accessible name (broken-composition state;\nthe shipped composition always registers the seat).",
				registerOptions: [],
				ownerProps: ["/** Owner share of the trigger content seat: the sidebar column state. */\nexport interface SettingsTriggerOwnerProps {\n  /** Whether the sidebar renders wide content (false = 56px rail, icon only). */\n  wide: boolean\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'sidebar.settings' (client-ui-settings-general), so it exists while that entry is mounted",
				occupants: ["client-ui-settings-general TriggerContent"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('settings.trigger', () => ctx.slots.register(\n      { name: 'settings.trigger' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-settings/src/client/contract/slots.ts:27"
			},
			{
				key: "shell.bottom",
				kind: "single",
				scope: "root",
				summary: "Full-width bottom content below all three columns.",
				doc: "Full-width bottom content below all three columns. Its rendered height\nreduces the columns' available height; empty content reserves no space.\nThe occupant owns its height, visibility, and controls. It receives no\nSession binding and remains mounted across main-panel navigation.",
				registerOptions: [],
				ownerProps: [],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'root' (client-ui-layout), so it exists while that entry is mounted",
				occupants: ["experimental-inspector InspectorPage"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('shell.bottom', () => ctx.slots.register(\n      { name: 'shell.bottom' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-layout/src/client/index.ts:94"
			},
			{
				key: "shell.leading",
				kind: "single",
				scope: "root",
				summary: "Window-chrome seat at the frame's top-left, over every main panel.",
				doc: "Window-chrome seat at the frame's top-left, over every main panel.\nMounted only while the sidebar column is fully hidden (macOS desktop\ncollapse; other platforms keep the rail), so the occupant can assume the\nframe edge is the window edge and the macOS traffic lights sit before it.\nOCCUPIED by ui-sidebar's reopen/New Session controls.\n\nWhile the seat is mounted the frame publishes\n`--dsh-frame-leading-clearance` (the inline inset the seat's band\noccupies, measured from the frame's left edge); a main panel whose\ncontent reaches the top-left corner pads by it so nothing lands under\nthe lights or the controls.",
				registerOptions: [],
				ownerProps: [],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'root' (client-ui-layout), so it exists while that entry is mounted",
				occupants: ["client-ui-sidebar HeaderLeadingControls"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('shell.leading', () => ctx.slots.register(\n      { name: 'shell.leading' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-layout/src/client/index.ts:119"
			},
			{
				key: "shell.overlay",
				kind: "list",
				scope: "root",
				summary: "Frame-wide floating layer, above every column and outside their scroll containers.",
				doc: "Frame-wide floating layer, above every column and outside their scroll\ncontainers. Deliberately generic and unowned by any feature: a badge, a\ntoast stack or a status pill all belong here, and entries order among\nthemselves. The layer itself is click-through — entries opt back into\npointer events — so an occupant never blocks the app underneath.\n\nThis is the additive seat for a frame-wide surface of your own: a fresh\n`id` is added beside the shipped entries instead of replacing them.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: [],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'root' (client-ui-layout), so it exists while that entry is mounted",
				occupants: [
					"client-ui-chat QuotaNoticeHost id 'chat.quota-notice'",
					"client-ui-file-drag FileDragFeedback id 'file-drag.feedback'",
					"client-ui-plugin-manager PluginRefreshToast id 'plugin-manager.refresh-toast'",
					"client-ui-schedule ScheduleDeleteToast id 'schedule.delete-toast'",
					"client-ui-settings-account DesktopOnboardingEntry id 'desktop-onboarding'",
					"client-ui-settings-account AccountPlatformHost id 'account.platform-page'",
					"client-ui-settings-general HostReleasePrompt id 'host-release-change'",
					"client-ui-settings-session-log UploadToast id 'session-log-upload-toast'",
					"client-ui-shortcuts ShortcutReference id 'shortcuts'",
					"client-ui-workspace SessionRenameDialog id 'workspace.session-rename'",
					"client-ui-workspace SessionArchiveConfirmDialog id 'workspace.session-archive'",
					"client-ui-workspace RowActionToast id 'workspace.row-toast'",
					"cua PermissionToast id 'cua-permission-outcome'",
					"session-log-export SessionMarkdownCopyToast id 'session-log-download.copy-toast'"
				],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('shell.overlay', () => ctx.slots.register(\n      { name: 'shell.overlay', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-layout/src/client/index.ts:105"
			},
			{
				key: "shell.quota-notice",
				kind: "chain",
				scope: "root",
				summary: "Frame-wide quota notice chain.",
				doc: "Frame-wide quota notice chain. The Chat-owned host in `shell.overlay`\noffers the one live notice; the first entry whose selector claims its\ncode takes over the surface, and the all-decline case renders the host's\ngeneric warning Toast. The host lives outside the Chat panel, so a notice\nsurvives switching or closing the panel that reported it.",
				registerOptions: [{
					name: "select",
					requirement: "required",
					type: "(owner) => unknown | null",
					doc: "Pure routing selector. Entries are tried in ascending order; the first non-null result wins and arrives as the component's `matched` prop. All-null falls through to the owner's fallback."
				}],
				ownerProps: ["/** Owner currency of one quota notice offered to the frame-wide chain. */\nexport interface QuotaNoticeOwnerProps {\n  /** Stable failure code retained in the Session log. */\n  code: QuotaNoticeCode\n  /** Provider-neutral notice copy in the active locale. */\n  message: string\n  /** Take the notice down. */\n  dismiss: () => void\n  /**\n   * Prevent later quota failures from replacing this notice. Dismissal clears\n   * all holds; releasing the last hold resumes future notices without replay.\n   * Callers must release on unmount.\n   * @returns idempotent release that cannot clear another hold.\n   */\n  keepOpen: () => () => void\n}"],
				ownerPropsReferences: ["QuotaNoticeCode"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'shell.overlay' (client-ui-chat), so it exists while that entry is mounted",
				occupants: ["client-ui-settings-account AccountQuotaNotice"],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('shell.quota-notice', () => ctx.slots.register(\n      { name: 'shell.quota-notice', select: owner => null },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-chat/src/client/contract/slots.ts:465"
			},
			{
				key: "sidebar",
				kind: "single",
				scope: "root",
				summary: "The whole left column.",
				doc: "The whole left column. OCCUPIED by ui-sidebar's SidebarRoot, which\ndeclares the workspace and settings seats inside it — registering here\nreplaces the navigation column outright rather than adding to it, and\nthe seats it declares disappear with it. To add something to the\nsidebar, register into one of those inner seats instead.\n\nThe occupant receives the frame's live column state (collapsed, width)\nand is expected to render the compact control rail while collapsed.",
				registerOptions: [],
				ownerProps: ["/** Sidebar owner share: live column state from the frame's concession solve. */\nexport interface SidebarOwnerProps {\n  /** True when the sidebar is closed (the column renders the compact control rail). */\n  collapsed: boolean\n  /** Rendered column width in px (SIDEBAR_COLLAPSED when collapsed). */\n  width: number\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'root' (client-ui-layout), so it exists while that entry is mounted",
				occupants: ["client-ui-sidebar SidebarRoot"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('sidebar', () => ctx.slots.register(\n      { name: 'sidebar' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-layout/src/client/index.ts:68"
			},
			{
				key: "sidebar.brand.mark",
				kind: "single",
				scope: "root",
				summary: "Brand mark rendered in the expanded brand row and collapsed rail.",
				doc: "Brand mark rendered in the expanded brand row and collapsed rail.\nDeclared by this package's `sidebar` entry; deployments may replace\nthe shell's fish fallback without replacing the surrounding controls.",
				registerOptions: [],
				ownerProps: ["/** Geometry supplied to the sidebar brand-mark occupant. */\nexport interface SidebarBrandMarkOwnerProps {\n  /** Requested square edge in pixels. */\n  size: number\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'sidebar' (client-ui-sidebar), so it exists while that entry is mounted",
				occupants: ["client-ui-brand-official OfficialBrandMark"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('sidebar.brand.mark', () => ctx.slots.register(\n      { name: 'sidebar.brand.mark' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-sidebar/src/client/contract/slots.ts:26"
			},
			{
				key: "sidebar.brand.name",
				kind: "single",
				scope: "root",
				summary: "Brand name rendered beside the expanded mark.",
				doc: "Brand name rendered beside the expanded mark. Declared by this\npackage's `sidebar` entry; the shell supplies a generic text fallback.",
				registerOptions: [],
				ownerProps: ["/** Empty owner share for the sidebar brand-name occupant. */\nexport interface SidebarBrandNameOwnerProps {\n  /** Marker field: the occupant owns its own content and width. */\n  children?: never\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'sidebar' (client-ui-sidebar), so it exists while that entry is mounted",
				occupants: ["client-ui-brand-official OfficialBrandName"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('sidebar.brand.name', () => ctx.slots.register(\n      { name: 'sidebar.brand.name' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-sidebar/src/client/contract/slots.ts:31"
			},
			{
				key: "sidebar.chat.conversation",
				kind: "single",
				scope: "session",
				summary: "Session-scoped Conversation occurrence hosted by one Sidebar chat tab.",
				doc: "Session-scoped Conversation occurrence hosted by one Sidebar chat tab.",
				registerOptions: [],
				ownerProps: [],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'sidebar.right.pane.tab' (client-ui-subagent), so it exists while that entry is mounted",
				occupants: ["client-ui-subagent ConversationSlotPanel"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('sidebar.chat.conversation', () => ctx.slots.register(\n      { name: 'sidebar.chat.conversation' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-subagent/src/client/sidebar-chat/index.tsx:42"
			},
			{
				key: "sidebar.footer.action",
				kind: "list",
				scope: "root",
				summary: "Optional actions beside Settings at the sidebar foot.",
				doc: "Optional actions beside Settings at the sidebar foot. Declared by this\npackage's 'sidebar' entry; each action receives only the column state.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/** Owner share of an action rendered beside Settings at the sidebar foot. */\nexport interface SidebarFooterActionOwnerProps {\n  /** Whether the sidebar renders wide content (false = 56px rail). */\n  wide: boolean\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'sidebar' (client-ui-sidebar), so it exists while that entry is mounted",
				occupants: ["client-ui-cordis CordisPanel id 'cordis-panel'"],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register(\n      { name: 'sidebar.footer.action', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-sidebar/src/client/contract/slots.ts:56"
			},
			{
				key: "sidebar.panellist",
				kind: "list",
				scope: "root",
				summary: "Global panel icons.",
				doc: "Global panel icons. Each list id addresses the matching main panel;\nthe sidebar owns the button and resolves its label from list metadata.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/** Icon presentation supplied by the global panel row. */\nexport interface SidebarPanelIconOwnerProps {\n  /** Requested square edge in pixels. */\n  size: number\n  /** Whether this panel is selected in the main column. */\n  active: boolean\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'sidebar' (client-ui-sidebar), so it exists while that entry is mounted",
				occupants: ["client-ui-plugin-manager PluginsPanelIcon", "client-ui-schedule TaskManagerIcon"],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('sidebar.panellist', () => ctx.slots.register(\n      { name: 'sidebar.panellist', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-sidebar/src/client/contract/slots.ts:36"
			},
			{
				key: "sidebar.panellist.actions",
				kind: "list",
				scope: "root",
				summary: "Rows of the panel list's More menu; the sidebar shows More only while this list has registrations.",
				doc: "Rows of the panel list's More menu; the sidebar shows More only while this list has registrations.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/** Owner share of the panel list's More menu rows. */\nexport interface SidebarPanelActionsOwnerProps {\n  /** Customizable panels in registration order; Plugins is never listed. */\n  readonly entries: readonly SidebarPanelActionEntry[]\n  /**\n   * Open a panel without changing its pin state.\n   * @param id - Listed panel id.\n   */\n  readonly onOpen: (id: string) => void\n  /**\n   * Show (true) or unpin (false) a panel launcher.\n   * @param id - Listed panel id.\n   * @param pinned - Whether the launcher shows in the sidebar.\n   */\n  readonly onPinnedChange: (id: string, pinned: boolean) => void\n  /** Close the More menu. */\n  readonly onDismiss: () => void\n}"],
				ownerPropsReferences: ["SidebarPanelActionEntry"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'sidebar' (client-ui-sidebar), so it exists while that entry is mounted",
				occupants: ["client-ui-entry-customization EntryMenuContent id 'entry-customization'"],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('sidebar.panellist.actions', () => ctx.slots.register(\n      { name: 'sidebar.panellist.actions', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-sidebar/src/client/contract/slots.ts:38"
			},
			{
				key: "sidebar.right.pane.tab",
				kind: "keyed",
				scope: "session",
				summary: "One tab's body, dispatched with the `id` of the type in force for `tab.kind`.",
				doc: "One tab's body, dispatched with the `id` of the type in force for\n`tab.kind`. A tab type registers here under its definition's `id` and\nreceives every tab of that kind, in every pane, docked or floating. A kind\nwith no type in force renders the owner's \"nothing can view this\" notice\nrather than an empty pane.",
				registerOptions: [{
					name: "key",
					requirement: "required",
					type: "string",
					doc: "Your cell key: the entry renders where the owner dispatches this exact key. Registering an already-occupied key replaces that occupant."
				}],
				ownerProps: [],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "open: any string the owner dispatches (no compile-time key set), none are taken yet",
				hookContext: "TabHookContext",
				slotInject: "SidebarRightTabInjected",
				declaredBy: "an entry in 'rightbar.session' (client-ui-sidebar-right), so it exists while that entry is mounted",
				occupants: [
					"client-ui-deliverables ReviewTab",
					"client-ui-plan PlanPreview",
					"client-ui-schedule ScheduleTaskTab",
					"client-ui-sidebar-browser BrowserBody",
					"client-ui-sidebar-documentpreview TextPreview",
					"client-ui-sidebar-files FilesBody",
					"client-ui-sidebar-right GuideBody",
					"client-ui-sidebar-terminal LazyTerminalBody",
					"client-ui-subagent SidebarChatTab",
					"experimental-session-inspector SessionInspectorView"
				],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register(\n      { name: 'sidebar.right.pane.tab', key: '<one key the owner dispatches>' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-sidebar-right/src/client/contract/slots.ts:59"
			},
			{
				key: "sidebar.right.pane.tab.title",
				kind: "keyed",
				scope: "session",
				summary: "A tab's title as its chip (and a floating panel's header) shows it, dispatched with the same key and information hook as the body.",
				doc: "A tab's title as its chip (and a floating panel's header) shows it,\ndispatched with the same key and information hook as the body. A type with a\nlive title — a terminal named after its shell, a chat after its first\nline — registers here and reads its own store; one without registers\nnothing and the chip shows the registry's `title(address)` text captured\nat open time.",
				registerOptions: [{
					name: "key",
					requirement: "required",
					type: "string",
					doc: "Your cell key: the entry renders where the owner dispatches this exact key. Registering an already-occupied key replaces that occupant."
				}],
				ownerProps: [],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "open: any string the owner dispatches (no compile-time key set), none are taken yet",
				hookContext: "TabHookContext",
				slotInject: "SidebarRightTabInjected",
				declaredBy: "an entry in 'rightbar.session' (client-ui-sidebar-right), so it exists while that entry is mounted",
				occupants: [
					"client-ui-plan PlanTitle",
					"client-ui-schedule ScheduleTaskTabTitle",
					"client-ui-sidebar-browser BrowserTitle",
					"client-ui-sidebar-documentpreview TextTitle",
					"client-ui-sidebar-files FilesTitle",
					"client-ui-sidebar-right GuideTitle",
					"client-ui-sidebar-terminal TerminalTitle"
				],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('sidebar.right.pane.tab.title', () => ctx.slots.register(\n      { name: 'sidebar.right.pane.tab.title', key: '<one key the owner dispatches>' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-sidebar-right/src/client/contract/slots.ts:73"
			},
			{
				key: "sidebar.right.tab.document",
				kind: "keyed",
				scope: "session",
				summary: "Document body selected by a registered implementation id.",
				doc: "Document body selected by a registered implementation id.",
				registerOptions: [{
					name: "key",
					requirement: "required",
					type: "string",
					doc: "Your cell key: the entry renders where the owner dispatches this exact key. Registering an already-occupied key replaces that occupant."
				}],
				ownerProps: ["/** Content and viewing inputs shared by document bodies and nested PDF presentation. */\nexport interface DocumentBodyOwner {\n  /** Observe a file read by this renderer. @param address - complete file resource address. */\n  readonly addResource: (address: string) => void\n  /** Replace this renderer's dependencies. @param addresses - complete file resource addresses. */\n  readonly setResources: (addresses: readonly string[]) => void\n  /** Original file address, also readable through the standard useResource hook. */\n  readonly resourceAddress: string\n  /** Ordinary file content or a renderer-owned loading request; text accumulates until eof. */\n  readonly content: DocumentContent\n  /** The document toolbar's current wrapping preference. */\n  readonly wrap: boolean\n  /** Report a renderer-owned scrollport; passing `null` restores the shared body as the owner. */\n  readonly scrollportRef: RefCallback<HTMLElement>\n}"],
				ownerPropsReferences: ["DocumentContent"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "open: any string the owner dispatches (no compile-time key set), none are taken yet",
				hookContext: "UseSidebarRightTabInfo",
				slotInject: "{ hooks: { tabInfo: SlotHookFactory<'sidebar.right.tab.document', UseSidebarRightTabInfo> } }",
				declaredBy: "an entry in 'sidebar.right.pane.tab' (client-ui-sidebar-documentpreview), so it exists while that entry is mounted",
				occupants: [
					"client-ui-sidebar-documentpreview CodeBody",
					"client-ui-sidebar-documentpreview LazyExcelBody",
					"client-ui-sidebar-documentpreview HtmlBody",
					"client-ui-sidebar-documentpreview ImageBody",
					"client-ui-sidebar-documentpreview MarkdownBody",
					"client-ui-sidebar-documentpreview OfficeBody",
					"client-ui-sidebar-documentpreview LazyPdfBody",
					"client-ui-sidebar-documentpreview TextBody"
				],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('sidebar.right.tab.document', () => ctx.slots.register(\n      { name: 'sidebar.right.tab.document', key: '<one key the owner dispatches>' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-sidebar-documentpreview/src/client/document/contract.ts:51"
			},
			{
				key: "sidebar.right.tab.document.action",
				kind: "keyed",
				scope: "session",
				summary: "Renderer-specific controls before the document toolbar's reload button.",
				doc: "Renderer-specific controls before the document toolbar's reload button.",
				registerOptions: [{
					name: "key",
					requirement: "required",
					type: "string",
					doc: "Your cell key: the entry renders where the owner dispatches this exact key. Registering an already-occupied key replaces that occupant."
				}],
				ownerProps: ["/**\n * Ordinary file contents, or a request for the selected renderer to load its content.\n * Byte arrays are transient UI input, never persisted layout or Session data.\n */\nexport type DocumentContent =\n  | { readonly kind: 'text'; readonly text: string; readonly pages: readonly DocumentTextPage[]; readonly eof: boolean }\n  | { readonly kind: 'bytes'; readonly data: Uint8Array<ArrayBuffer> }\n  | {\n    readonly kind: 'renderer'\n    /** Changes on reload or implementation replacement; retained contents belong to one revision. */\n    readonly revision: number\n    /** Report the displayed source version; stale revisions cannot update the owner. @param version - loaded source version. */\n    readonly loaded: (version: string) => void\n    /** End a failed load; a later file change can start another revision. */\n    readonly failed: () => void\n    /** Cancel the current load and start a new revision. */\n    readonly reload: () => void\n  }"],
				ownerPropsReferences: ["DocumentTextPage"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "open: any string the owner dispatches (no compile-time key set), none are taken yet",
				hookContext: "UseSidebarRightTabInfo",
				slotInject: "{ hooks: { tabInfo: SlotHookFactory<'sidebar.right.tab.document', UseSidebarRightTabInfo> } }",
				declaredBy: "an entry in 'sidebar.right.pane.tab' (client-ui-sidebar-documentpreview), so it exists while that entry is mounted",
				occupants: ["client-ui-sidebar-documentpreview OfficeFontAction"],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('sidebar.right.tab.document.action', () => ctx.slots.register(\n      { name: 'sidebar.right.tab.document.action', key: '<one key the owner dispatches>' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-sidebar-documentpreview/src/client/document/contract.ts:87"
			},
			{
				key: "sidebar.right.tab.document.actions",
				kind: "list",
				scope: "session",
				summary: "Header toolbar contributions acting on the previewed file, rendered after the preview's own controls once the file's Host path is known.",
				doc: "Header toolbar contributions acting on the previewed file, rendered\nafter the preview's own controls once the file's Host path is known.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: [],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'sidebar.right.pane.tab' (client-ui-sidebar-documentpreview), so it exists while that entry is mounted",
				occupants: ["client-ui-open-in-app OpenPathAction id 'open-in-app'"],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('sidebar.right.tab.document.actions', () => ctx.slots.register(\n      { name: 'sidebar.right.tab.document.actions', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-sidebar-documentpreview/src/client/document/contract.ts:66"
			},
			{
				key: "sidebar.right.tab.document.office.pdf",
				kind: "keyed",
				scope: "session",
				summary: "PDF presentation supplied with Office-owned converted bytes.",
				doc: "PDF presentation supplied with Office-owned converted bytes.",
				registerOptions: [{
					name: "key",
					requirement: "required",
					type: "string",
					doc: "Your cell key: the entry renders where the owner dispatches this exact key. Registering an already-occupied key replaces that occupant."
				}],
				ownerProps: ["/** Content and viewing inputs shared by document bodies and nested PDF presentation. */\nexport interface DocumentBodyOwner {\n  /** Observe a file read by this renderer. @param address - complete file resource address. */\n  readonly addResource: (address: string) => void\n  /** Replace this renderer's dependencies. @param addresses - complete file resource addresses. */\n  readonly setResources: (addresses: readonly string[]) => void\n  /** Original file address, also readable through the standard useResource hook. */\n  readonly resourceAddress: string\n  /** Ordinary file content or a renderer-owned loading request; text accumulates until eof. */\n  readonly content: DocumentContent\n  /** The document toolbar's current wrapping preference. */\n  readonly wrap: boolean\n  /** Report a renderer-owned scrollport; passing `null` restores the shared body as the owner. */\n  readonly scrollportRef: RefCallback<HTMLElement>\n}"],
				ownerPropsReferences: ["DocumentContent"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "open: any string the owner dispatches (no compile-time key set), none are taken yet",
				hookContext: "UseSidebarRightTabInfo",
				slotInject: "{ hooks: { tabInfo: SlotHookFactory<'sidebar.right.tab.document', UseSidebarRightTabInfo> } }",
				declaredBy: "an entry in 'sidebar.right.tab.document' (client-ui-sidebar-documentpreview), so it exists while that entry is mounted",
				occupants: ["client-ui-sidebar-documentpreview LazyPdfBody"],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('sidebar.right.tab.document.office.pdf', () => ctx.slots.register(\n      { name: 'sidebar.right.tab.document.office.pdf', key: '<one key the owner dispatches>' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-sidebar-documentpreview/src/client/office/OfficeBody.tsx:19"
			},
			{
				key: "sidebar.right.tab.document.unpreviewable",
				kind: "list",
				scope: "session",
				summary: "Empty-state contributions for a file this preview cannot render, offered where Retry would stand once the file's Host path is known.",
				doc: "Empty-state contributions for a file this preview cannot render,\noffered where Retry would stand once the file's Host path is known.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: [],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'sidebar.right.pane.tab' (client-ui-sidebar-documentpreview), so it exists while that entry is mounted",
				occupants: ["client-ui-open-in-app OpenPathEmptyAction id 'open-in-app'"],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('sidebar.right.tab.document.unpreviewable', () => ctx.slots.register(\n      { name: 'sidebar.right.tab.document.unpreviewable', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-sidebar-documentpreview/src/client/document/contract.ts:78"
			},
			{
				key: "sidebar.right.tab.files.actions",
				kind: "list",
				scope: "session",
				summary: "Workspace directory actions after the file tree's reload control.",
				doc: "Workspace directory actions after the file tree's reload control.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: [],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'sidebar.right.pane.tab' (client-ui-sidebar-files), so it exists while that entry is mounted",
				occupants: ["client-ui-open-in-app OpenInAppAction id 'open-in-app'"],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('sidebar.right.tab.files.actions', () => ctx.slots.register(\n      { name: 'sidebar.right.tab.files.actions', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-sidebar-files/src/client/index.ts:34"
			},
			{
				key: "sidebar.right.tab.guide",
				kind: "chain",
				scope: "session",
				summary: "The guide tab's body.",
				doc: "The guide tab's body. Selectors run in chain order and the first\nnon-declining entry replaces the shipped guide entirely; with no entry, or\nwith every entry declining, the shipped guide renders.",
				registerOptions: [{
					name: "select",
					requirement: "required",
					type: "(owner) => unknown | null",
					doc: "Pure routing selector. Entries are tried in ascending order; the first non-null result wins and arrives as the component's `matched` prop. All-null falls through to the owner's fallback."
				}],
				ownerProps: [],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "UseSidebarRightTabInfo",
				slotInject: "{ hooks: { tabInfo: SlotHookFactory<'sidebar.right.tab.guide', UseSidebarRightTabInfo> } }",
				declaredBy: "an entry in 'sidebar.right.pane.tab' (client-ui-sidebar-right), so it exists while that entry is mounted",
				occupants: [],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('sidebar.right.tab.guide', () => ctx.slots.register(\n      { name: 'sidebar.right.tab.guide', select: owner => null },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-sidebar-right/src/client/contract/slots.ts:84"
			},
			{
				key: "sidebar.right.tab.guide.actions",
				kind: "list",
				scope: "root",
				summary: "Rows of the guide's More menu; the guide shows More only while this list has registrations.",
				doc: "Rows of the guide's More menu; the guide shows More only while this list has registrations.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/** Owner share of the guide's More menu rows. */\nexport interface SidebarRightGuideActionsOwnerProps {\n  /** Guide cards in registry order; cards of kind `files` are never listed. */\n  readonly entries: readonly SidebarRightGuideActionEntry[]\n  /**\n   * Open a card's tab type in the guide's place without changing its pin state.\n   * @param id - Listed card id.\n   */\n  readonly onOpen: (id: string) => void\n  /**\n   * Show (true) or unpin (false) a guide card.\n   * @param id - Listed card id.\n   * @param pinned - Whether the card shows on the guide.\n   */\n  readonly onPinnedChange: (id: string, pinned: boolean) => void\n  /** Close the More menu. */\n  readonly onDismiss: () => void\n}"],
				ownerPropsReferences: ["SidebarRightGuideActionEntry"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'sidebar.right.pane.tab' (client-ui-sidebar-right), so it exists while that entry is mounted",
				occupants: ["client-ui-entry-customization EntryMenuContent id 'entry-customization'"],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('sidebar.right.tab.guide.actions', () => ctx.slots.register(\n      { name: 'sidebar.right.tab.guide.actions', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-sidebar-right/src/client/contract/slots.ts:91"
			},
			{
				key: "sidebar.right.tab.guide.entry",
				kind: "keyed",
				scope: "session",
				summary: "One provider's guide card, with the standard card as the owner's fallback.",
				doc: "One provider's guide card, with the standard card as the owner's fallback.",
				registerOptions: [{
					name: "key",
					requirement: "required",
					type: "string",
					doc: "Your cell key: the entry renders where the owner dispatches this exact key. Registering an already-occupied key replaces that occupant."
				}],
				ownerProps: ["/** Resolved guide copy and entry identity supplied to a provider's card renderer. */\nexport interface SidebarRightGuideEntryOwnerProps {\n  readonly entryId: string\n  readonly kind: string\n  readonly title: string\n  readonly description?: string\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "open: any string the owner dispatches (no compile-time key set), none are taken yet",
				hookContext: "UseSidebarRightTabInfo",
				slotInject: "{ hooks: { tabInfo: SlotHookFactory<'sidebar.right.tab.guide.entry', UseSidebarRightTabInfo> } }",
				declaredBy: "an entry in 'sidebar.right.pane.tab' (client-ui-sidebar-right), so it exists while that entry is mounted",
				occupants: ["client-ui-sidebar-terminal TerminalGuide"],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('sidebar.right.tab.guide.entry', () => ctx.slots.register(\n      { name: 'sidebar.right.tab.guide.entry', key: '<one key the owner dispatches>' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-sidebar-right/src/client/contract/slots.ts:93"
			},
			{
				key: "sidebar.right.tab.menu.item",
				kind: "list",
				scope: "session",
				summary: "Extra items at the end of one tab's actions menu, in registration order.",
				doc: "Extra items at the end of one tab's actions menu, in registration order.\nEntries decide their own visibility from the tab they are given. Without a\nregistrant the menu shows only the kit's own layout actions.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/** Owner share of one tab-menu item occurrence. */\nexport interface SidebarRightTabMenuOwnerProps {\n  /** The tab whose menu is open. */\n  tab: TabRecord\n  /**\n   * Dismiss the menu.\n   *\n   * An item that acts MUST call this: the menu is the kit's, and it closes on\n   * its own actions only. An item that leaves it open leaves a menu floating\n   * over content the action may have just replaced.\n   */\n  dismiss: () => void\n}"],
				ownerPropsReferences: ["TabRecord"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'rightbar.session' (client-ui-sidebar-right), so it exists while that entry is mounted",
				occupants: [],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('sidebar.right.tab.menu.item', () => ctx.slots.register(\n      { name: 'sidebar.right.tab.menu.item', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-sidebar-right/src/client/contract/slots.ts:105"
			},
			{
				key: "sidebar.session.row.hover",
				kind: "list",
				scope: "root",
				summary: "Section of the Session row's hover card between its relative time and its trailing status line.",
				doc: "Section of the Session row's hover card between its relative time and\nits trailing status line. Mounted only while that card is open.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/**\n * Owner share of the two Session-row schedule seats. Both receive only the\n * row's Session identity: the occupant reads that Session's own scheduled\n * tasks, and reading them activates nothing.\n */\nexport interface SessionRowScheduleOwnerProps {\n  /** Session this row shows; the occupant addresses its own data by this id. */\n  readonly sessionId: SessionId\n}"],
				ownerPropsReferences: ["SessionId"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'sidebar.workspaces' (client-ui-workspace), so it exists while that entry is mounted",
				occupants: ["client-ui-schedule SessionScheduleHover id 'schedule-tasks'"],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('sidebar.session.row.hover', () => ctx.slots.register(\n      { name: 'sidebar.session.row.hover', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-workspace/src/client/contract/slots.ts:151"
			},
			{
				key: "sidebar.session.row.leading",
				kind: "list",
				scope: "root",
				summary: "Leading decoration of one Session row, in the 16px cell before the title that the row's own state dot otherwise occupies.",
				doc: "Leading decoration of one Session row, in the 16px cell before the title\nthat the row's own state dot otherwise occupies. A higher-priority state\n(a pending interaction, a new message, live activity) replaces the seat\nwith that dot for the same row, so an occupant here never renders beside\na status dot and is mounted only by a row whose primary state is idle.\nAn archived row keeps that cell blank — neither its status dot nor this\nseat renders there, and its live status appears on the hover card only.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/**\n * Owner share of the two Session-row schedule seats. Both receive only the\n * row's Session identity: the occupant reads that Session's own scheduled\n * tasks, and reading them activates nothing.\n */\nexport interface SessionRowScheduleOwnerProps {\n  /** Session this row shows; the occupant addresses its own data by this id. */\n  readonly sessionId: SessionId\n}"],
				ownerPropsReferences: ["SessionId"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'sidebar.workspaces' (client-ui-workspace), so it exists while that entry is mounted",
				occupants: ["client-ui-schedule SessionScheduleMark id 'schedule-mark'"],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('sidebar.session.row.leading', () => ctx.slots.register(\n      { name: 'sidebar.session.row.leading', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-workspace/src/client/contract/slots.ts:137"
			},
			{
				key: "sidebar.session.row.trailing",
				kind: "list",
				scope: "root",
				summary: "Non-interactive icons after the row's time label, before its pin marker, in ascending `order`.",
				doc: "Non-interactive icons after the row's time label, before its pin marker,\nin ascending `order`. On hover-capable devices, hidden while the row is\nhovered, has keyboard focus on itself or its actions, or has an open menu.\nHoverless devices keep the icons beside the menu trigger. Blank Sessions\nomit the slot. Occupants address their own data by Session id; they must not\nbind or retain the Session.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/** Owner share of the trailing icon list; rendering does not bind the Session. */\nexport interface SessionRowTrailingOwnerProps {\n  /** Session this row shows. */\n  readonly sessionId: SessionId\n}"],
				ownerPropsReferences: ["SessionId"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'sidebar.workspaces' (client-ui-workspace), so it exists while that entry is mounted",
				occupants: [],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('sidebar.session.row.trailing', () => ctx.slots.register(\n      { name: 'sidebar.session.row.trailing', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-workspace/src/client/contract/slots.ts:146"
			},
			{
				key: "sidebar.settings",
				kind: "single",
				scope: "root",
				summary: "The settings seat at the sidebar foot.",
				doc: "The settings seat at the sidebar foot. Declared by this package's\n'sidebar' entry; ui-settings registers its trigger row + modal panel.\nThe sidebar passes only its column state — it holds no settings state.",
				registerOptions: [],
				ownerProps: ["/**\n * Owner share of the sidebar settings seat: the column display state the\n * occupant's trigger row must render against (wide row vs rail icon).\n */\nexport interface SidebarSettingsOwnerProps {\n  /** Whether the sidebar renders wide content (false = 56px rail). */\n  wide: boolean\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'sidebar' (client-ui-sidebar), so it exists while that entry is mounted",
				occupants: ["client-ui-settings-general SettingsRoot"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('sidebar.settings', () => ctx.slots.register(\n      { name: 'sidebar.settings' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-sidebar/src/client/contract/slots.ts:51"
			},
			{
				key: "sidebar.toggle.badge",
				kind: "single",
				scope: "root",
				summary: "Non-interactive notification inside the collapsed sidebar expand button.",
				doc: "Non-interactive notification inside the collapsed sidebar expand button.",
				registerOptions: [],
				ownerProps: [],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'sidebar' (client-ui-sidebar), so it exists while that entry is mounted",
				occupants: ["client-ui-settings-general DesktopUpdateBadge"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('sidebar.toggle.badge', () => ctx.slots.register(\n      { name: 'sidebar.toggle.badge' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-sidebar/src/client/contract/slots.ts:20"
			},
			{
				key: "sidebar.workspaces",
				kind: "single",
				scope: "root",
				summary: "The workspace/session browsing region: section header, search, the grouped/flat session list, and every workspace dialog.",
				doc: "The workspace/session browsing region: section header, search, the\ngrouped/flat session list, and every workspace dialog. Declared by this\npackage's 'sidebar' entry (declaring is claiming); ui-workspace\nregisters the browser.",
				registerOptions: [],
				ownerProps: ["/**\n * Owner share of the browser hole — the only facts crossing the shell/region\n * boundary. Business data and actions arrive through the region's own inject.\n */\nexport interface SidebarSectionOwnerProps {\n  /** Shell fold-state output: wide renders the full browser, rail the icon column. */\n  wide: boolean\n  /** Rail icons request expansion; the browser rides the wide flip for focus. */\n  expandSidebar: () => void\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'sidebar' (client-ui-sidebar), so it exists while that entry is mounted",
				occupants: ["client-ui-workspace WorkspaceBrowser"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('sidebar.workspaces', () => ctx.slots.register(\n      { name: 'sidebar.workspaces' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-sidebar/src/client/contract/slots.ts:45"
			},
			{
				key: "sidebar.workspaces.directoryFlow",
				kind: "single",
				scope: "root",
				summary: "Directory-flow hole under the sidebar browsing region (declared by the WorkspaceBrowser entry).",
				doc: "Directory-flow hole under the sidebar browsing region (declared by the WorkspaceBrowser entry).",
				registerOptions: [],
				ownerProps: ["/**\n * Owner share of the directory-flow holes: the complete conversation between\n * the trigger surface and the picking interaction. The occupant reads `open`\n * to run/render its interaction and reports exactly one outcome per open.\n */\nexport interface DirectoryFlowOwnerProps {\n  /** True while a picking interaction is requested; flipping back to false withdraws the request. */\n  open: boolean\n  /** True while the owner adopts a picked path (`createWorkspace` in flight); occupants disable their commit affordances. */\n  busy: boolean\n  /** The operator picked a directory (absolute host path); the owner adopts it. */\n  onPicked: (path: string) => void\n  /** The operator dismissed the interaction; the owner just closes the flow. */\n  onCancel: () => void\n  /** The interaction itself failed (chooser missing, listing denied); the owner shows its error surface. */\n  onError: (message: string) => void\n}"],
				ownerPropsReferences: [],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'sidebar.workspaces' (client-ui-workspace), so it exists while that entry is mounted",
				occupants: ["client-ui-directory-picker-browse BrowseDirectoryFlow", "client-ui-directory-picker-native NativeDirectoryFlow"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('sidebar.workspaces.directoryFlow', () => ctx.slots.register(\n      { name: 'sidebar.workspaces.directoryFlow' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-workspace/src/client/contract/slots.ts:127"
			},
			{
				key: "sidebar.workspaces.session.menu.item",
				kind: "list",
				scope: "root",
				summary: "The rows of one Session's \"...\" menu, in ascending `order`.",
				doc: "The rows of one Session's \"...\" menu, in ascending `order`. ui-workspace\nregisters the shipped rows here — `pin` (100), `rename` (200), `fork`\n(300), `archive` (400), and `session-id` (450) — so a plugin row is placed\nby its own `order` among them. Use a package-namespaced `id`; reusing a shipped id at\nanother `priority` shadows that row. Each entry renders one\n`role=\"menuitem\"` `<button>` (the shipped rows use ui-primitives'\n`MenuItemButton`, which adds the host styling and `separatorBefore`),\ndecides its own visibility from its own state, and dismisses the menu\nthrough the injected `useMenuOpenState` hook after acting; the list's\nkeyboard walk and focus return read the DOM, so any such button joins\nthem. Labels come from the contributing package's locale namespace.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/** Owner share of one Session row action occurrence: the row the action belongs to. */\nexport interface SessionRowOwnerProps {\n  /** Session the row shows. */\n  sessionId: SessionId\n  /** Row display title: persisted title, or empty when the Session has none. */\n  displayTitle: string\n}"],
				ownerPropsReferences: ["SessionId"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "MenuOpenState",
				slotInject: "{ hooks: { menuOpenState: SlotHookFactory<'sidebar.workspaces.session.menu.item', UseMenuOpenState> shortcuts: HostObservable<readonly ShortcutCatalogEntry[]> } }",
				declaredBy: "an entry in 'sidebar.workspaces' (client-ui-workspace), so it exists while that entry is mounted",
				occupants: [
					"client-ui-workspace PinSessionMenuItem id 'pin'",
					"client-ui-workspace RenameSessionMenuItem id 'rename'",
					"client-ui-workspace ForkSessionMenuItem id 'fork'",
					"client-ui-workspace ArchiveSessionMenuItem id 'archive'",
					"client-ui-workspace SessionIdMenuItem id 'session-id'"
				],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    const copyLabel = 'Copy session title' // Localize in the contributing package.\n    ctx.slots.inject('sidebar.workspaces.session.menu.item', () => ctx.slots.register(\n      { name: 'sidebar.workspaces.session.menu.item', id: 'copy-session-title', order: 500 },\n      ({ displayTitle, useMenuOpenState }) => {\n        const [, setMenuOpen] = useMenuOpenState()\n        return React.createElement(\n          'button',\n          {\n            type: 'button', role: 'menuitem',\n            onClick: () => { setMenuOpen(false); void navigator.clipboard.writeText(displayTitle) },\n          },\n          copyLabel,\n        )\n      },\n    ))\n  },\n}",
				source: "packages/client/ui-workspace/src/client/contract/slots.ts:186"
			},
			{
				key: "sidebar.workspaces.session.row.action",
				kind: "list",
				scope: "root",
				summary: "The hover buttons at the end of one Session row, in ascending `order`, after the \"...\" menu trigger.",
				doc: "The hover buttons at the end of one Session row, in ascending `order`,\nafter the \"...\" menu trigger. ui-workspace registers `archive` (100) and\n`pin` (200) here. An entry renders one icon button (or nothing, when its\naction does not apply to the row) and owns the action it performs. Clicks\ninside the strip stay in the strip, so the button needs no propagation\nhandling to keep the row from opening. Hoverless devices hide this slot;\ncontribute the action to the menu list as well for touch access.",
				registerOptions: [
					{
						name: "id",
						requirement: "required",
						type: "string",
						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
					},
					{
						name: "order",
						requirement: "optional",
						type: "number",
						doc: "Position among the entries, ascending (default 0)."
					},
					{
						name: "label",
						requirement: "optional",
						type: "string | (() => string)",
						doc: "Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."
					}
				],
				ownerProps: ["/** Owner share of one Session row action occurrence: the row the action belongs to. */\nexport interface SessionRowOwnerProps {\n  /** Session the row shows. */\n  sessionId: SessionId\n  /** Row display title: persisted title, or empty when the Session has none. */\n  displayTitle: string\n}"],
				ownerPropsReferences: ["SessionId"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'sidebar.workspaces' (client-ui-workspace), so it exists while that entry is mounted",
				occupants: ["client-ui-workspace ArchiveSessionRowButton id 'archive'", "client-ui-workspace PinSessionRowButton id 'pin'"],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('sidebar.workspaces.session.row.action', () => ctx.slots.register(\n      { name: 'sidebar.workspaces.session.row.action', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-workspace/src/client/contract/slots.ts:205"
			},
			{
				key: "tool.call.images",
				kind: "single",
				scope: "session",
				summary: "Durable images of a settled image-bearing Tool call, rendered through the attachment presentation plugin.",
				doc: "Durable images of a settled image-bearing Tool call, rendered through\nthe attachment presentation plugin. The Tool layer never imports an\nattachment implementation: a toolview declares this slot as a child and\nrenders it with the image card's references plus the session-authorized\nloader it received in its owner, and the attachment plugin fills the\ngallery. Composing no attachment presentation plugin renders nothing,\nwhich is why the image card keeps its own envelope text beside the\ngallery. A child slot is declared by exactly one entry: registering a\nsecond toolview that declares the same child throws at load, so a\nfuture image-bearing tool must reuse this entry or own a distinct\nslot.",
				registerOptions: [],
				ownerProps: ["/** Owner currency of the Tool image gallery slot: references plus the loader. */\nexport interface ToolImagesOwnerProps {\n  /** Durable references or submission-echo previews in result order. */\n  images: readonly MessageImageSource[]\n  /** Session-authorized image URL loader for the durable arm. */\n  loadImage: MessageImageLoader\n  /** Horizontal placement inside the owning record. */\n  align: 'start' | 'end'\n}"],
				ownerPropsReferences: ["MessageImageLoader", "MessageImageSource"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'tool.call.toolview' (client-ui-tool), so it exists while that entry is mounted",
				occupants: ["client-ui-attachment MessageImages"],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('tool.call.images', () => ctx.slots.register(\n      { name: 'tool.call.images' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-tool/src/client/contract/slots.ts:44"
			},
			{
				key: "tool.call.toolview",
				kind: "keyed",
				scope: "session",
				summary: "Keyed Tool call view dispatched by wire Tool name.",
				doc: "Keyed Tool call view dispatched by wire Tool name. Any name is allowed,\nincluding tools registered by your package. Register with\n`key: '<tool name>'`; a typo never renders.\n\nRegistering an occupied key replaces its view; unclaimed keys use the\ngeneric row. The owner supplies the call identity and running\nor settled node through explicit phase props. Every stage supplies\n`name` and a lazy `args` view; preparing arguments may be incomplete.",
				registerOptions: [{
					name: "key",
					requirement: "required",
					type: "string",
					doc: "Your cell key: the entry renders where the owner dispatches this exact key. Registering an already-occupied key replaces that occupant."
				}],
				ownerProps: [
					"/** Standard owner currency supplied to every atomic Tool view. */\nexport interface ToolCallCommonProps {\n  /** Stable Hook; each invocation owns its open state and subscribes to enclosing-Turn resets. */\n  useDisclosure: UseDisclosure\n  /** Call identity, stable across all stages. */\n  callId: string\n  /** Wire Tool name and keyed dispatch value. */\n  toolName: string\n  /** Session workspace root for relative summaries. */\n  cwd?: string | undefined\n  /** Host account home; POSIX home-rooted summaries display as `~`. */\n  home?: string | undefined\n  /** Open an argument path at its optional requested line. */\n  openFile: (path: string, options?: OpenFileOptions) => void\n  /** Chat-supplied, session-authorized loader for durable images; Tool views do not manage attachment URLs. */\n  loadImage: MessageImageLoader\n  /** Inspect this call in the trajectory view when available. */\n  inspect?: (() => void) | undefined\n}",
					"/** Common owner callbacks and the data admitted at the current tool stage. */\nexport type ToolCallOwnerProps = ToolCallCommonProps & ToolCallPhaseProps",
					"/** Stage-specific tool data; only start/result expose the dispatched call material. */\nexport type ToolCallPhaseProps =\n  | { readonly phase: 'preparing'; readonly block: PreparingToolCall }\n  | { readonly phase: 'start'; readonly block: StartedToolCall }\n  | { readonly phase: 'result'; readonly block: ToolResultNode }"
				],
				ownerPropsReferences: [
					"MessageImageLoader",
					"OpenFileOptions",
					"PreparingToolCall",
					"StartedToolCall",
					"ToolResultNode",
					"UseDisclosure"
				],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "open: any string the owner dispatches (no compile-time key set), already taken: ask_user_question, bash, cordis_define, cordis_inspect_list, cordis_inspect_query, cordis_inspect_self, cordis_run, cordis_stop, cordis_undefine, create_goal, edit, get_goal, glob, grep, interrupt_agent, job_kill, job_list, job_output, list_agents, list_subagent_models, lsp, present, propose_action, ralph, read, read_image, schedule_create, schedule_delete, schedule_list, schedule_update, send_message, session_event_read, session_event_search, session_event_trace, session_search, session_trace, skill, spawn_teammate, subagent, team_task_create, team_task_get, team_task_list, team_task_update, terminal_close, terminal_list, terminal_open, terminal_read, terminal_signal, todo_write, update_goal, wait_agent, web_fetch, web_search, workflow, write",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'conversation.chat.node' (client-ui-tool), so it exists while that entry is mounted",
				occupants: [
					"client-ui-deliverables PresentRow key 'present'",
					"client-ui-skill SkillRow key 'skill'",
					"client-ui-tool AskQuestionRow key 'ask_user_question'",
					"client-ui-tool BashRow key 'bash'",
					"client-ui-tool DetailsRow key 'create_goal'",
					"client-ui-tool DetailsRow key 'get_goal'",
					"client-ui-tool DetailsRow key 'update_goal'",
					"client-ui-tool DetailsRow key 'schedule_create'",
					"client-ui-tool DetailsRow key 'schedule_list'",
					"client-ui-tool DetailsRow key 'schedule_delete'",
					"client-ui-tool DetailsRow key 'schedule_update'",
					"client-ui-tool DetailsRow key 'cordis_inspect_list'",
					"client-ui-tool DetailsRow key 'cordis_inspect_query'",
					"client-ui-tool DetailsRow key 'cordis_inspect_self'",
					"client-ui-tool DetailsRow key 'workflow'",
					"client-ui-tool DetailsRow key 'ralph'",
					"client-ui-tool DetailsRow key 'session_event_read'",
					"client-ui-tool DetailsRow key 'session_event_search'",
					"client-ui-tool DetailsRow key 'session_event_trace'",
					"client-ui-tool DetailsRow key 'session_search'",
					"client-ui-tool DetailsRow key 'session_trace'",
					"client-ui-tool DetailsRow key 'list_subagent_models'",
					"client-ui-tool DetailsRow key 'subagent'",
					"client-ui-tool DetailsRow key 'list_agents'",
					"client-ui-tool DetailsRow key 'send_message'",
					"client-ui-tool DetailsRow key 'interrupt_agent'",
					"client-ui-tool DetailsRow key 'job_list'",
					"client-ui-tool DetailsRow key 'job_output'",
					"client-ui-tool DetailsRow key 'job_kill'",
					"client-ui-tool DetailsRow key 'terminal_open'",
					"client-ui-tool DetailsRow key 'terminal_read'",
					"client-ui-tool DetailsRow key 'terminal_list'",
					"client-ui-tool DetailsRow key 'terminal_signal'",
					"client-ui-tool DetailsRow key 'terminal_close'",
					"client-ui-tool DetailsRow key 'lsp'",
					"client-ui-tool DetailsRow key 'spawn_teammate'",
					"client-ui-tool DetailsRow key 'team_task_create'",
					"client-ui-tool DetailsRow key 'team_task_get'",
					"client-ui-tool DetailsRow key 'team_task_update'",
					"client-ui-tool DetailsRow key 'team_task_list'",
					"client-ui-tool DetailsRow key 'wait_agent'",
					"client-ui-tool FileMutationRow key 'edit'",
					"client-ui-tool FileMutationRow key 'write'",
					"client-ui-tool ReadImageRow key 'read_image'",
					"client-ui-tool ReadRow key 'read'",
					"client-ui-tool SearchRow key 'grep'",
					"client-ui-tool SearchRow key 'glob'",
					"client-ui-tool TodoRow key 'todo_write'",
					"client-ui-tool WebRow key 'web_search'",
					"client-ui-tool WebRow key 'web_fetch'",
					"client-ui-action-cards ProposeRow key 'propose_action'",
					"client-ui-cordis CordisDefineRow key 'cordis_define'",
					"client-ui-cordis CordisRunRow key 'cordis_run'",
					"client-ui-cordis CordisActionRow key 'cordis_stop'",
					"client-ui-cordis CordisActionRow key 'cordis_undefine'"
				],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('tool.call.toolview', () => ctx.slots.register(\n      { name: 'tool.call.toolview', key: '<one key the owner dispatches>' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-tool/src/client/contract/slots.ts:26"
			},
			{
				key: "tool.view.cordis",
				kind: "keyed",
				scope: "session",
				summary: "Interactive Package-owned region rendered inside the latest eligible `cordis_run` card in the conversation flow.",
				doc: "Interactive Package-owned region rendered inside the latest eligible\n`cordis_run` card in the conversation flow. Use it for controls and other\nUI the user can interact with. Dynamic Client code registers with\n`key: 'self'`; the Guard binds that key to the current Plugin and Package.",
				registerOptions: [{
					name: "key",
					requirement: "required",
					type: "string",
					doc: "Your cell key: the entry renders where the owner dispatches this exact key. Registering an already-occupied key replaces that occupant."
				}],
				ownerProps: ["/** Owner currency delivered to a dynamic Package's business view. */\nexport interface CordisToolViewOwnerProps {\n  readonly pluginId: CordisDynamicPluginId\n  readonly packageId: CordisDynamicPackageId\n  readonly pluginRunId: CordisDynamicPluginRunId\n}"],
				ownerPropsReferences: [
					"CordisDynamicPackageId",
					"CordisDynamicPluginId",
					"CordisDynamicPluginRunId"
				],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean",
					"useChat: UseChat",
					"useConversation: UseConversation",
					"useInput: SnapshotSelectorHook<InputState>",
					"inputActions: InputActions",
					"useSession: SessionSnapshotSelector",
					"sessionId: SessionId",
					"useProjection: UseProjection",
					"useAccess: (action: RemoteEndpoint) => boolean",
					"useTrajectory: UseTrajectory"
				],
				keyDomain: "open: any string the owner dispatches (no compile-time key set), none are taken yet",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'tool.call.toolview' (client-ui-cordis), so it exists while that entry is mounted",
				occupants: [],
				replaceRisk: "none",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('tool.view.cordis', () => ctx.slots.register(\n      { name: 'tool.view.cordis', key: '<one key the owner dispatches>' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/extensions/ui-cordis/src/client/slots.ts:31"
			},
			{
				key: "workspace.toast",
				kind: "keyed",
				scope: "root",
				summary: "Workspace notices selected by their existing business discriminator.",
				doc: "Workspace notices selected by their existing business discriminator.",
				registerOptions: [{
					name: "key",
					requirement: "required",
					type: "string",
					doc: "Your cell key: the entry renders where the owner dispatches this exact key. Registering an already-occupied key replaces that occupant."
				}],
				ownerProps: ["/** Owner operations available to every keyed Workspace notice. */\nexport interface WorkspaceToastOwnerProps {\n  /** Dismiss the displayed notice. */\n  dismissToast: () => void\n}"],
				ownerPropsReferences: ["Workspace"],
				standardProps: [
					"useRemoteAccess: (action: RemoteEndpoint) => boolean",
					"useResource: UseResource",
					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
					"usePanelInfo: UsePanelInfo",
					"useSessions: UseSessions",
					"useSessionStatus: UseSessionStatus",
					"useSessionRetainInfo: UseSessionRetainInfo",
					"useSessionAccess: (sessionId: SessionId, action: RemoteEndpoint) => boolean",
					"useWorkspaceAccess: (workspaceId: WorkspaceId, action: RemoteEndpoint) => boolean"
				],
				keyDomain: "fixed by the owner's key table { [K in ToastKind]: ToastNotice<K> }, already taken: archived, archivedNotOpenable, createFailed, defaultWorkspaceFailed, forkRequiresOpen, pinFailed, sessionIdCopied, sessionIdCopyFailed, shortcutForkFailed, stoppedAndArchived, unpinFailed",
				hookContext: "",
				slotInject: "",
				declaredBy: "an entry in 'shell.overlay' (client-ui-workspace), so it exists while that entry is mounted",
				occupants: [
					"client-ui-workspace ToastEntry<PropsRuntime<'workspace.toast', 'sessionIdCopi… key 'sessionIdCopied'",
					"client-ui-workspace ToastEntry<PropsRuntime<'workspace.toast', 'sessionIdCopy… key 'sessionIdCopyFailed'",
					"client-ui-workspace ToastEntry<PropsRuntime<'workspace.toast', 'pinFailed'>> key 'pinFailed'",
					"client-ui-workspace ToastEntry<PropsRuntime<'workspace.toast', 'unpinFailed'>> key 'unpinFailed'",
					"client-ui-workspace ToastEntry<PropsRuntime<'workspace.toast', 'archivedNotOp… key 'archivedNotOpenable'",
					"client-ui-workspace ToastEntry<PropsRuntime<'workspace.toast', 'defaultWorksp… key 'defaultWorkspaceFailed'",
					"client-ui-workspace ToastEntry<PropsRuntime<'workspace.toast', 'shortcutForkF… key 'shortcutForkFailed'",
					"client-ui-workspace ToastEntry<PropsRuntime<'workspace.toast', 'createFailed'>> key 'createFailed'",
					"client-ui-workspace ToastEntry<PropsRuntime<'workspace.toast', 'forkRequiresO… key 'forkRequiresOpen'",
					"client-ui-workspace ArchiveToastEntry key 'archived'",
					"client-ui-workspace ArchiveToastEntry key 'stoppedAndArchived'"
				],
				replaceRisk: "shadows-shipped-ui",
				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('workspace.toast', () => ctx.slots.register(\n      { name: 'workspace.toast', key: '<one key the owner dispatches>' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
				source: "packages/client/ui-workspace/src/client/contract/toast.ts:53"
			}
		];
		//#endregion
		//#region lib/types/client/providers.js
		/** Built-in Client inspect providers over live Client-owned services. */
		const EMPTY_INPUT = {
			type: "object",
			properties: {},
			additionalProperties: false
		};
		const ANY_OUTPUT = { description: "JSON data owned by this inspect provider." };
		const SERVICE_INPUT = exactInput("service", "Exact Service key. Omit it for the compact Service and method-signature directory.");
		const EVENT_INPUT = exactInput("event", "Exact Event name. Omit it for the compact Event and listener-signature directory.");
		const SERVICE_OUTPUT = { description: "Compact Service directory, or one exact Service contract with only its referenced type declarations." };
		const EVENT_OUTPUT = { description: "Compact Event directory, or one exact Event contract with only its referenced type declarations." };
		const SUBTREE_OUTPUT = { description: "Compact topology trees. An exact Slot includes its catalog and occupants; an exact Factory includes identity, scope, and registrant." };
		const SUBTREE_INPUT = {
			type: "object",
			properties: { root: {
				type: "string",
				description: "Exact live Slot key or factory:<name>. When supplied, selected contains that declaration."
			} },
			additionalProperties: false
		};
		/** Exact Client closure symbols exposed by the evaluator and guard. */
		const CLIENT_BUILTIN_INSPECTION = [
			{
				name: "ctx",
				description: "Restricted Cordis Context. Prefer ctx.get(name) with an undefined check; use inject only for hard dependencies.",
				signatures: [
					"ctx.get(name: string): unknown | undefined",
					"ctx.on(name: string, listener: Function): () => void",
					"ctx.provide(name: string, value: unknown): () => void",
					"ctx.effect(callback: Function, label?: string): () => void"
				]
			},
			{
				name: "React",
				description: "React runtime exposed without JSX transformation.",
				signatures: [
					"React.createElement(type, props, ...children): ReactElement",
					"React.useState(initial)",
					"React.useEffect(effect, deps)"
				]
			},
			{
				name: "host",
				description: "Package-private JSON RPC from Client to this Package's Host half.",
				signatures: ["host.call(method: string, args?: JsonValue): Promise<JsonValue>"]
			},
			{
				name: "styles",
				description: "Package-owned stylesheet insertion cleaned up with the Client run.",
				signatures: ["styles.insert(css: string): () => void"]
			},
			{
				name: "console",
				description: "Package-tagged browser logging.",
				signatures: ["console.log(...values): void", "console.error(...values): void"]
			}
		];
		/**
		* Construct the first-party Client provider registrations.
		* @param ctx - Client context used for live Service-backed queries.
		* @returns registrations for static catalogs and live Client capabilities.
		*/
		function clientInspectProviders(ctx) {
			return [
				registration("Service", "Progressive Client Service discovery: compact capability/signature directory, then one exact coding contract.", "listService", (input) => queryServiceApi(readExact(input, "service")), SERVICE_INPUT, SERVICE_OUTPUT),
				registration("Event", "Progressive Client Event discovery: compact listener directory, then one exact event contract.", "listEvents", (input) => queryEventApi(readExact(input, "event")), EVENT_INPUT, EVENT_OUTPUT),
				registration("Builtin", "Plain-JavaScript symbols available to a dynamic Client half.", "listBuiltins", () => ({
					builtins: [...CLIENT_BUILTIN_INSPECTION],
					referencedTypes: []
				})),
				{
					manifest: {
						id: "Slots",
						description: "Progressive live Slot inspection with explicit Slot and Factory topology nodes.",
						methods: [{
							name: "listSubTree",
							description: "Return compact live Slot and Factory trees, plus available detail for one exact root.",
							inputSchema: SUBTREE_INPUT,
							outputSchema: SUBTREE_OUTPUT
						}]
					},
					query(method, input) {
						if (method !== "listSubTree") throw new Error(`unknown Slots inspect method "${method}"`);
						const slots = ctx.get("slots");
						if (slots === void 0) throw new Error("Client Slots service is not running");
						const root = typeof input === "object" && input !== null && !Array.isArray(input) && typeof input.root === "string" ? input.root : void 0;
						const trees = slots.snapshot(root);
						const selected = trees[0];
						return Promise.resolve({
							...root === void 0 ? {} : { requestedRoot: {
								name: root,
								available: trees.length > 0
							} },
							trees: trees.map(compactSlotTree),
							...root === void 0 || selected === void 0 ? {} : { selected: inspectLiveSlot(selected) },
							referencedTypes: []
						});
					}
				},
				registration("Theme", "Current theme token names and light/dark override requirements.", "listTokens", () => {
					const theme = ctx.get("theme");
					if (theme === void 0) throw new Error("Client Theme service is not running");
					return {
						tokens: theme.exportInspectTokens(),
						referencedTypes: []
					};
				})
			];
		}
		function registration(id, description, method, query, inputSchema = EMPTY_INPUT, outputSchema = ANY_OUTPUT) {
			return {
				manifest: {
					id,
					description,
					methods: [{
						name: method,
						description,
						inputSchema,
						outputSchema
					}]
				},
				async query(requested, input) {
					if (requested !== method) throw new Error(`unknown ${id} inspect method "${requested}"`);
					return await query(input);
				}
			};
		}
		function exactInput(field, description) {
			return {
				type: "object",
				properties: { [field]: {
					type: "string",
					description
				} },
				additionalProperties: false
			};
		}
		function readExact(input, field) {
			if (input === void 0 || input === null || Array.isArray(input) || typeof input !== "object") return void 0;
			const value = input[field];
			return typeof value === "string" ? value : void 0;
		}
		const SLOT_CATALOG = new Map(CLIENT_SLOT_API.map((entry) => [entry.key, entry]));
		const GUARDED_SLOT_KEYS = new Map([["tool.view.cordis", {
			description: "fixed by the dynamic Client Guard",
			values: [{
				value: "self",
				description: "The only accepted key. The Guard binds it to this Package's pluginId and packageId."
			}]
		}]]);
		function compactSlotTree(node) {
			if (node.type === "factory") return {
				type: node.type,
				name: node.name,
				scope: node.scope,
				children: node.children.map(compactSlotTree)
			};
			const catalog = SLOT_CATALOG.get(node.name);
			const guardedKeys = catalog === void 0 ? void 0 : GUARDED_SLOT_KEYS.get(catalog.key);
			return {
				type: node.type,
				name: node.name,
				kind: node.kind,
				scope: node.scope,
				...catalog === void 0 ? {} : {
					purpose: catalog.summary,
					replaceRisk: catalog.replaceRisk,
					...catalog.registerOptions.length === 0 ? {} : { registration: catalog.registerOptions.map((option) => ({
						name: option.name,
						type: option.type,
						required: option.requirement === "required"
					})) },
					...catalog.keyDomain === "" ? {} : {
						keyDomain: guardedKeys?.description ?? catalog.keyDomain,
						...guardedKeys === void 0 ? {} : { allowedKeys: guardedKeys.values.map((value) => ({ ...value })) }
					}
				},
				children: node.children.map(compactSlotTree)
			};
		}
		function inspectLiveSlot(node) {
			if (node.type === "factory") return {
				type: node.type,
				name: node.name,
				scope: node.scope,
				...node.registrant === void 0 ? {} : { registrant: node.registrant }
			};
			const catalog = SLOT_CATALOG.get(node.name);
			return {
				type: node.type,
				name: node.name,
				kind: node.kind,
				scope: node.scope,
				...node.declaredBy === void 0 ? {} : { declaredBy: node.declaredBy },
				occupants: node.occupants.map((occupant) => ({ ...occupant })),
				...catalog === void 0 ? {} : { catalog: inspectSlotCatalog(catalog) }
			};
		}
		function inspectSlotCatalog(entry) {
			const guardedKeys = GUARDED_SLOT_KEYS.get(entry.key);
			return {
				description: entry.doc,
				registration: entry.registerOptions.map((option) => ({
					name: option.name,
					type: option.type,
					required: option.requirement === "required",
					description: option.doc
				})),
				ownerProps: [...entry.ownerProps],
				ownerPropsReferences: [...entry.ownerPropsReferences],
				standardProps: [...entry.standardProps],
				keyDomain: guardedKeys?.description ?? entry.keyDomain,
				...guardedKeys === void 0 ? {} : { allowedKeys: guardedKeys.values.map((value) => ({ ...value })) },
				hookContext: entry.hookContext,
				slotInject: entry.slotInject,
				replaceRisk: entry.replaceRisk
			};
		}
		//#endregion
		//#region lib/types/client/index.js
		/**
		* Dynamic-package runner, browser half: the load engine that turns one browser
		* half's source into a live cordis plugin (closure → guard → module table →
		* loader entry, ./runtime.ts), plus the retract announcement that unloads it.
		*
		* Nothing loads on activation: this page holds no dynamic package until a
		* dispatch arrives, and a dispatch only follows a model `cordis_run` or a user
		* pressing a card's start control. A refresh therefore starts clean by design —
		* host process memory still holds the definition, the page simply does not run
		* it until asked again.
		*/
		/** Teaching text for a routing failure the infrastructure itself reports. */
		function invokeFailure(pluginId, method, result) {
			const where = `host.call("${method}") on ${pluginId}`;
			if (result.code === "plugin-not-running") return `${where} found no active Host half — the Plugin is stopped or was removed.`;
			if (result.code === "stale-run") return `${where} belongs to an activation that has already been replaced.`;
			if (result.code === "method-not-found") return `${where} is not registered: the host half must declare it with harness.handle("${method}", fn).`;
			return `${where} failed inside the host handler: ${result.message}`;
		}
		/** Preserve a Host handler's stack while adding the Client call site diagnosis. */
		function invokeError(pluginId, method, result) {
			const error = new Error(invokeFailure(pluginId, method, result));
			if (result.stack !== void 0) error.stack = `${error.stack ?? error.message}\nHost stack:\n${result.stack}`;
			return error;
		}
		/**
		* Teaching text for a `host.call` the wire itself refused: the generated codec
		* rejected the argument before sending, or the result on the way back, or the
		* transport broke. The infrastructure's message names the field it refused but
		* not the call it belonged to, and the model authored both halves — so this adds
		* the call and the contract it has to satisfy.
		*/
		function wireFailure(id, method, error) {
			return `host.call("${method}") on ${id} did not complete: ${error instanceof Error ? error.message : String(error)}\nBoth directions carry JSON only: pass plain JSON data as the argument — or omit it, and the handler receives null — and answer from harness.handle("${method}", fn) with JSON (\`return null\` when there is nothing to report).`;
		}
		/** Stable Cordis plugin name. */
		const name = "cordis-client-runner";
		/**
		* Required services: the loader/module chain for entries, the slot registry for
		* contributions, and the `dynamicCordisRunner` Remote namespace. Declaring the
		* namespace parks this plugin until the host side exists, so a page never loads
		* a browser half whose host half it could not reach.
		*/
		const inject = [
			"loader",
			"modules",
			"slots",
			"remote",
			"remote.dynamicCordisRunner"
		];
		/**
		* Client plugin body: build the runner and subscribe the dispatch family.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			new TimerService(ctx);
			const inspect = new ClientCordisInspectRegistry({
				sync: async (providers) => {
					const answered = await ctx.remote.dynamicCordisRunner.syncInspectManifest(providers);
					if (!answered.ok) throw new Error(`${answered.error.code}: ${answered.error.message}`);
				},
				resolve: async (agentId, requestId, resolution) => {
					const answered = await ctx.remote.dynamicCordisRunner.resolveInspectQuery(agentId, requestId, resolution);
					if (!answered.ok) throw new Error(`${answered.error.code}: ${answered.error.message}`);
				}
			});
			provideClientCordisInspect(ctx, inspect);
			for (const provider of clientInspectProviders(ctx)) ctx.effect(() => inspect.register(provider), `cordis-client-runner: inspect ${provider.manifest.id}`);
			ctx.on("connection/reset", () => {
				inspect.publish();
			});
			const runner = new DynamicCordisPackageRunner({
				ctx,
				loader: ctx.loader,
				modules: ctx.get("modules"),
				slots: ctx.get("slots"),
				invoke: async (pluginId, pluginRunId, method, args) => {
					const answered = await ctx.remote.dynamicCordisRunner.invoke(pluginId, pluginRunId, method, args).catch((error) => {
						throw new Error(wireFailure(pluginId, method, error));
					});
					if (!answered.ok) throw new Error(wireFailure(pluginId, method, `${answered.error.code}: ${answered.error.message}`));
					const result = answered.value;
					if (result.ok) return result.value;
					throw invokeError(pluginId, method, result);
				},
				reportRenderFailure: (agentId, pluginId, pluginRunId, failure) => {
					ctx.remote.dynamicCordisRunner.reportRenderFailure(agentId, pluginId, pluginRunId, failure).then((result) => {
						if (!result.ok) console.error(`[cordis-client-runner] reporting a render failure of ${pluginId} failed:`, result.error);
					}, (error) => {
						console.error(`[cordis-client-runner] reporting a render failure of ${pluginId} failed:`, error);
					});
				},
				reportGuardFailure: (agentId, pluginId, pluginRunId, failure) => {
					ctx.remote.dynamicCordisRunner.reportClientGuardFailure(agentId, pluginId, pluginRunId, failure).then((result) => {
						if (!result.ok) console.error(`[cordis-client-runner] reporting a guard failure of ${pluginId} failed:`, result.error);
					}, (error) => {
						console.error(`[cordis-client-runner] reporting a guard failure of ${pluginId} failed:`, error);
					});
				}
			});
			const orchestrator = new CordisRunOrchestrator({
				runner,
				host: {
					runHostHalf: async (agentId, pluginId, packageId, mode, requestId, approveFutureVersions) => {
						const answered = await ctx.remote.dynamicCordisRunner.runHostHalf(agentId, pluginId, packageId, mode, requestId, approveFutureVersions);
						return answered.ok ? answered.value : {
							ok: false,
							message: `${answered.error.code}: ${answered.error.message}`
						};
					},
					getClientCode: async (agentId, pluginId, pluginRunId) => {
						const answered = await ctx.remote.dynamicCordisRunner.getClientCode(agentId, pluginId, pluginRunId);
						if (!answered.ok) throw new Error(`${answered.error.code}: ${answered.error.message}`);
						return answered.value;
					},
					resolveRequestRun: async (requestId, resolution) => {
						const answered = await ctx.remote.dynamicCordisRunner.resolveRequestRun(requestId, resolution);
						if (!answered.ok) throw new Error(`${answered.error.code}: ${answered.error.message}`);
						return answered.value;
					},
					settleUserRun: async (agentId, pluginId, resolution) => {
						const answered = await ctx.remote.dynamicCordisRunner.settleUserRun(agentId, pluginId, resolution);
						if (!answered.ok) throw new Error(`${answered.error.code}: ${answered.error.message}`);
						return answered.value;
					}
				}
			});
			const face = {
				activeRuns: orchestrator.activeRuns,
				lastRunError: orchestrator.lastRunError,
				renderFailures: runner.renderFailures,
				reconcileApprovals: (rows) => {
					orchestrator.reconcileApprovals(rows);
				},
				approve: (requestId, approveFutureVersions) => orchestrator.approve(requestId, approveFutureVersions),
				decline: (requestId) => orchestrator.decline(requestId),
				startUserRun: (request) => orchestrator.startUserRun(request),
				subscribe: (fn) => runner.subscribe(fn),
				getSnapshot: () => runner.getSnapshot(),
				isLoaded: (id) => runner.isLoaded(id)
			};
			ctx.provide("dynamicCordisRunner", face);
			ctx.effect(() => () => {
				runner.dispose();
			}, "cordis-client-runner: dynamic package runner");
			ctx.remote.$on("cordis/request-run", (request) => {
				orchestrator.open(request);
			});
			ctx.remote.$on("cordis/request-run-resolved", (resolved) => {
				orchestrator.close(resolved.requestId);
			});
			ctx.remote.$on("cordis/dynamic-retract", (retracted) => {
				runner.retract(retracted.pluginId, retracted.pluginRunId);
			});
			ctx.remote.$on("cordis/inspect-query", (request) => {
				inspect.query(request).catch((error) => {
					console.error(`[cordis-client-runner] inspect query ${request.provider}.${request.method} failed:`, error);
				});
			});
			ctx.remote.$on("cordis/inspect-query-resolved", (resolved) => {
				inspect.close(resolved.requestId);
			});
		}
		//#endregion
		exports.ClientCordisInspectRegistry = ClientCordisInspectRegistry;
		exports.CordisRunOrchestrator = CordisRunOrchestrator;
		exports.DynamicCordisPackageRunner = DynamicCordisPackageRunner;
		exports.DynamicCordisStyles = DynamicCordisStyles;
		exports.apply = apply;
		exports.dynamicCordisContext = dynamicCordisContext;
		exports.evaluateClientHalf = evaluateClientHalf;
		exports.inject = inject;
		exports.isDynamicCordisPlugin = isDynamicCordisPlugin;
		exports.name = name;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
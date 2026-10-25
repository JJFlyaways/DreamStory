window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-api-remote-access",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let zod = require("zod");
		let _deepseek_ai_cordis = require("@deepseek-ai/cordis");
		let _deepseek_ai_dsh_api_gateway_client = require("@deepseek-ai/dsh-api-gateway/client");
		//#region ../../typert/protocol/lib/types/remote-info.js
		/** Lazy assembly of generated Remote definitions using caller-supplied Zod; no runtime imports. */
		/**
		* Retain one generated definition per endpoint without constructing parsers or projections.
		* The class instance builds its shared descriptor/method index on first access;
		* input schemas and JSON Schema projections are cached only when requested.
		* @param spec - compiler-produced method facts and Zod factories.
		* @param zod - the generated artifact's Zod runtime for named-input parsers.
		* @returns a lazy, mountable info instance with no registration or transport effects.
		*/
		function createTypertRemoteInfo(spec, zod) {
			return new RemoteInfo(spec, zod);
		}
		var RemoteInfo = class {
			spec;
			zod;
			index;
			constructor(spec, zod) {
				this.spec = spec;
				this.zod = zod;
			}
			get package() {
				return this.spec.package;
			}
			get descriptors() {
				return this.resolve().descriptors;
			}
			get methods() {
				return this.resolve().methods;
			}
			resolve() {
				if (this.index !== void 0) return this.index;
				const zod = this.zod;
				const descriptors = [];
				const methods = Object.create(null);
				for (const [endpoint, definition] of Object.entries(this.spec.methods)) {
					const separator = endpoint.indexOf("/");
					const namespace = endpoint.slice(0, separator);
					const method = endpoint.slice(separator + 1);
					const parameters = definition.parameters.map((parameter) => ({
						...parameter,
						wire: parameter.wire ?? parameter.name
					}));
					const descriptor = {
						...definition,
						id: `${this.spec.package}#${endpoint}`,
						namespace,
						method,
						parameters,
						result: definition.result.description === void 0 ? definition.result : new ResultValue(definition.result)
					};
					if (definition.invocation.kind === "direct") {
						const inputs = [];
						methods[endpoint] = Object.assign(descriptor, {
							input(options) {
								const strict = options?.strict === true;
								return inputs[strict ? 1 : 0] ??= new NamedInput(parameters, strict, zod);
							},
							invoke(remote, input, signal) {
								const named = input;
								const values = parameters.map((parameter) => named[parameter.wire]);
								if (definition.cancellation !== void 0) values.push(signal);
								const receiver = Reflect.get(remote, namespace);
								return Reflect.get(receiver, method).apply(receiver, values);
							}
						});
					}
					descriptors.push(descriptor);
				}
				return this.index = {
					descriptors,
					methods
				};
			}
		};
		function optional(parameter) {
			return parameter.source === "json" && parameter.acceptsUndefined === true;
		}
		var NamedInput = class {
			parameters;
			strict;
			zod;
			schema;
			projection;
			constructor(parameters, strict, zod) {
				this.parameters = parameters;
				this.strict = strict;
				this.zod = zod;
			}
			codec(parameter) {
				return this.strict ? parameter.strictCodec : parameter.codec;
			}
			create = () => this.schema ??= this.zod.strictObject(Object.fromEntries(this.parameters.map((parameter) => {
				const value = this.codec(parameter).create();
				return [parameter.wire, optional(parameter) ? value.optional() : value.nonoptional()];
			})));
			get jsonSchema() {
				return this.project().jsonSchema;
			}
			get jsonSchemaError() {
				return this.project().jsonSchemaError;
			}
			project() {
				if (this.projection !== void 0) return this.projection;
				const unavailable = this.parameters.find((parameter) => this.codec(parameter).jsonSchema === void 0);
				if (unavailable !== void 0) return this.projection = { jsonSchemaError: this.codec(unavailable).jsonSchemaError ?? `No JSON Schema for parameter ${unavailable.wire}` };
				return this.projection = { jsonSchema: {
					type: "object",
					properties: Object.fromEntries(this.parameters.map((parameter) => [parameter.wire, {
						...this.codec(parameter).jsonSchema,
						...parameter.description === void 0 ? {} : { description: parameter.description }
					}])),
					required: this.parameters.filter((parameter) => !optional(parameter)).map((parameter) => parameter.wire),
					additionalProperties: false
				} };
			}
		};
		var ResultValue = class {
			spec;
			projection;
			constructor(spec) {
				this.spec = spec;
			}
			get mode() {
				return this.spec.mode;
			}
			get typeSymbol() {
				return this.spec.typeSymbol;
			}
			get create() {
				return this.spec.create;
			}
			get decode() {
				return this.spec.decode;
			}
			get encode() {
				return this.spec.encode;
			}
			get description() {
				return this.spec.description;
			}
			get jsonSchemaError() {
				return this.spec.jsonSchemaError;
			}
			get jsonSchema() {
				if (this.projection === void 0) {
					const schema = this.spec.jsonSchema;
					this.projection = { value: schema === void 0 ? void 0 : {
						...schema,
						description: this.spec.description
					} };
				}
				return this.projection.value;
			}
		};
		//#endregion
		//#region lib/typert.remote-client.js
		let _deepseek_ai_dsh_api_remote_access_remoteAccess_follow_result$schema$value;
		const _deepseek_ai_dsh_api_remote_access_remoteAccess_follow_result$schema = () => _deepseek_ai_dsh_api_remote_access_remoteAccess_follow_result$schema$value ??= zod.z.union([
			zod.z.object({
				"type": zod.z.literal("baseline").readonly(),
				"owner": zod.z.literal(true).readonly()
			}),
			zod.z.object({
				"type": zod.z.literal("baseline").readonly(),
				"owner": zod.z.literal(false).readonly(),
				"grants": zod.z.array(zod.z.object({
					"resource": zod.z.union([
						zod.z.object({ "kind": zod.z.literal("global").readonly() }),
						zod.z.object({
							"kind": zod.z.literal("session").readonly(),
							"id": zod.z.string().readonly()
						}),
						zod.z.object({
							"kind": zod.z.literal("workspace").readonly(),
							"id": zod.z.string().readonly()
						})
					]).readonly(),
					"actions": zod.z.array(zod.z.string()).readonly().describe("Endpoint actions allowed on this resource without call arguments, sorted; plain strings because Typert generates no codec for template literal types.")
				})).readonly()
			}),
			zod.z.object({
				"type": zod.z.literal("upsert").readonly(),
				"grant": zod.z.object({
					"resource": zod.z.union([
						zod.z.object({ "kind": zod.z.literal("global").readonly() }),
						zod.z.object({
							"kind": zod.z.literal("session").readonly(),
							"id": zod.z.string().readonly()
						}),
						zod.z.object({
							"kind": zod.z.literal("workspace").readonly(),
							"id": zod.z.string().readonly()
						})
					]).readonly(),
					"actions": zod.z.array(zod.z.string()).readonly().describe("Endpoint actions allowed on this resource without call arguments, sorted; plain strings because Typert generates no codec for template literal types.")
				}).readonly()
			}),
			zod.z.object({
				"type": zod.z.literal("remove").readonly(),
				"resource": zod.z.union([
					zod.z.object({ "kind": zod.z.literal("global").readonly() }),
					zod.z.object({
						"kind": zod.z.literal("session").readonly(),
						"id": zod.z.string().readonly()
					}),
					zod.z.object({
						"kind": zod.z.literal("workspace").readonly(),
						"id": zod.z.string().readonly()
					})
				]).readonly()
			})
		]);
		const TYPERT_REMOTE = createTypertRemoteInfo({
			package: "@deepseek-ai/dsh-api-remote-access",
			methods: { "remoteAccess/follow": {
				service: "remoteAccess",
				description: "Stream the calling Peer's access snapshot: one baseline, then `upsert` and `remove` frames after each `invalidate()` and each policy registration or removal that changes a grant. The owner receives only `{ owner: true }`. The generation ends when `signal` aborts or this service unloads, so a reloaded service starts every reader from a fresh baseline.",
				mode: "stream",
				invocation: { kind: "direct" },
				parameters: [],
				cancellation: { parameter: "signal" },
				result: {
					mode: "strict",
					typeSymbol: "@deepseek-ai/dsh-api-remote-access/types#RemoteAccessFrame",
					create: _deepseek_ai_dsh_api_remote_access_remoteAccess_follow_result$schema,
					description: "the access frames of one generation.",
					jsonSchema: { "oneOf": [
						{
							"type": "object",
							"properties": {
								"type": {
									"type": "string",
									"const": "baseline"
								},
								"owner": {
									"type": "boolean",
									"const": true
								}
							},
							"required": ["type", "owner"],
							"additionalProperties": true
						},
						{
							"type": "object",
							"properties": {
								"type": {
									"type": "string",
									"const": "baseline"
								},
								"owner": {
									"type": "boolean",
									"const": false
								},
								"grants": {
									"type": "array",
									"items": {
										"type": "object",
										"properties": {
											"resource": { "oneOf": [
												{
													"type": "object",
													"properties": { "kind": {
														"type": "string",
														"const": "global"
													} },
													"required": ["kind"],
													"additionalProperties": true
												},
												{
													"type": "object",
													"properties": {
														"kind": {
															"type": "string",
															"const": "session"
														},
														"id": { "type": "string" }
													},
													"required": ["kind", "id"],
													"additionalProperties": true
												},
												{
													"type": "object",
													"properties": {
														"kind": {
															"type": "string",
															"const": "workspace"
														},
														"id": { "type": "string" }
													},
													"required": ["kind", "id"],
													"additionalProperties": true
												}
											] },
											"actions": {
												"type": "array",
												"items": { "type": "string" },
												"description": "Endpoint actions allowed on this resource without call arguments, sorted; plain strings because Typert generates no codec for template literal types."
											}
										},
										"required": ["resource", "actions"],
										"additionalProperties": true
									}
								}
							},
							"required": [
								"type",
								"owner",
								"grants"
							],
							"additionalProperties": true
						},
						{
							"type": "object",
							"properties": {
								"type": {
									"type": "string",
									"const": "upsert"
								},
								"grant": {
									"type": "object",
									"properties": {
										"resource": { "oneOf": [
											{
												"type": "object",
												"properties": { "kind": {
													"type": "string",
													"const": "global"
												} },
												"required": ["kind"],
												"additionalProperties": true
											},
											{
												"type": "object",
												"properties": {
													"kind": {
														"type": "string",
														"const": "session"
													},
													"id": { "type": "string" }
												},
												"required": ["kind", "id"],
												"additionalProperties": true
											},
											{
												"type": "object",
												"properties": {
													"kind": {
														"type": "string",
														"const": "workspace"
													},
													"id": { "type": "string" }
												},
												"required": ["kind", "id"],
												"additionalProperties": true
											}
										] },
										"actions": {
											"type": "array",
											"items": { "type": "string" },
											"description": "Endpoint actions allowed on this resource without call arguments, sorted; plain strings because Typert generates no codec for template literal types."
										}
									},
									"required": ["resource", "actions"],
									"additionalProperties": true
								}
							},
							"required": ["type", "grant"],
							"additionalProperties": true
						},
						{
							"type": "object",
							"properties": {
								"type": {
									"type": "string",
									"const": "remove"
								},
								"resource": { "oneOf": [
									{
										"type": "object",
										"properties": { "kind": {
											"type": "string",
											"const": "global"
										} },
										"required": ["kind"],
										"additionalProperties": true
									},
									{
										"type": "object",
										"properties": {
											"kind": {
												"type": "string",
												"const": "session"
											},
											"id": { "type": "string" }
										},
										"required": ["kind", "id"],
										"additionalProperties": true
									},
									{
										"type": "object",
										"properties": {
											"kind": {
												"type": "string",
												"const": "workspace"
											},
											"id": { "type": "string" }
										},
										"required": ["kind", "id"],
										"additionalProperties": true
									}
								] }
							},
							"required": ["type", "resource"],
							"additionalProperties": true
						}
					] }
				},
				sourceLocation: {
					"file": "packages/api/remote-access/src/index.ts",
					"line": 270,
					"column": 10
				}
			} }
		}, zod.z);
		//#endregion
		//#region lib/types/snapshot.js
		/**
		* The index global carrying a page's first access snapshot, shared by the
		* Host row that writes it and the Client mount that reads it.
		* @module @deepseek-ai/dsh-api-remote-access/src/snapshot
		*/
		/** `globalThis` property an index injection row assigns to the page's opening baseline. */
		const REMOTE_ACCESS_SNAPSHOT_KEY = "__DSH_REMOTE_ACCESS__";
		//#endregion
		//#region lib/types/client/state.js
		/**
		* React-free Client access state: the latest `remoteAccess/follow` snapshot
		* and identity-stable boolean sources per resource and action.
		* @module @deepseek-ai/dsh-api-remote-access/src/client/state
		*/
		const CLOSED = Object.freeze({ kind: "closed" });
		const OWNER_SNAPSHOT = Object.freeze({ kind: "owner" });
		const GLOBAL_KEY = "\0global";
		/**
		* Validate the opening baseline an index injection row assigned to the page.
		* @param value - the injected global; `undefined` when the page carries none.
		* @returns the baseline, or `undefined` when none was injected.
		* @throws TypeError when the injected value is not a baseline frame.
		*/
		function parseInjectedBaseline(value) {
			if (value === void 0) return void 0;
			if (!isRecord(value) || value["type"] !== "baseline") throw new TypeError("remote access: the injected access snapshot is not a baseline frame");
			if (value["owner"] === true) return {
				type: "baseline",
				owner: true
			};
			const grants = value["grants"];
			if (value["owner"] !== false || !Array.isArray(grants) || !grants.every(isGrant)) throw new TypeError("remote access: the injected access snapshot carries malformed grants");
			return {
				type: "baseline",
				owner: false,
				grants
			};
		}
		function isGrant(value) {
			if (!isRecord(value) || !isResource(value["resource"])) return false;
			const actions = value["actions"];
			return Array.isArray(actions) && actions.every((action) => typeof action === "string");
		}
		function isResource(value) {
			if (!isRecord(value) || typeof value["kind"] !== "string") return false;
			return value["kind"] === "global" || typeof value["id"] === "string";
		}
		function isRecord(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		/**
		* Snapshot owner for one Client generation. Sources are cached per
		* `(kind, id, action)` so Hook bindings keep their identity; each source
		* computes its boolean from the current snapshot.
		*/
		var ClientAccessState = class {
			snapshot = CLOSED;
			/** @param initial - the page's injected opening baseline; without one every answer is false until a baseline arrives. */
			constructor(initial) {
				if (initial !== void 0) this.replace(initial);
			}
			listeners = /* @__PURE__ */ new Set();
			sources = /* @__PURE__ */ new Map();
			/**
			* Answer for one action on the global resource.
			* @param action - endpoint action the caller may invoke.
			* @returns identity-stable boolean source.
			*/
			global(action) {
				return this.cached(GLOBAL_KEY, "", action);
			}
			/**
			* Answer for one action on one resource of a declared kind.
			* @param kind - declared resource kind.
			* @param id - resource identity.
			* @param action - endpoint action the caller may invoke.
			* @returns identity-stable boolean source.
			*/
			resource(kind, id, action) {
				return this.cached(kind, id, action);
			}
			/**
			* Replace the snapshot from one generation's opening frame.
			* @param frame - owner or non-owner baseline.
			*/
			replace(frame) {
				if (frame.owner) {
					this.publish(OWNER_SNAPSHOT);
					return;
				}
				let global = /* @__PURE__ */ new Set();
				const resources = /* @__PURE__ */ new Map();
				for (const { resource, actions } of frame.grants) {
					if (resource.kind === "global") {
						global = new Set(actions);
						continue;
					}
					let grants = resources.get(resource.kind);
					if (grants === void 0) {
						grants = /* @__PURE__ */ new Map();
						resources.set(resource.kind, grants);
					}
					grants.set(resource.id, new Set(actions));
				}
				this.publish({
					kind: "granted",
					global,
					resources
				});
			}
			/**
			* Apply one increment of the current generation.
			* @param frame - `upsert` or `remove`.
			*/
			update(frame) {
				const current = this.snapshot;
				if (current.kind !== "granted") return;
				switch (frame.type) {
					case "upsert":
						this.publish(withGrant(current, frame.grant));
						return;
					case "remove":
						this.publish(withGrant(current, {
							resource: frame.resource,
							actions: []
						}, true));
						return;
					/* v8 ignore next -- the generated Remote codec validates this closed union. */
					default: return assertNever(frame);
				}
			}
			/** Whether the current snapshot is the owner's, whose answers never depend on the stream. */
			get owner() {
				return this.snapshot.kind === "owner";
			}
			/** The stream failed terminally: the owner keeps every answer; a non-owner's answers become false. */
			unavailable() {
				if (this.snapshot.kind !== "owner") this.publish(CLOSED);
			}
			cached(kind, id, action) {
				const key = `${kind}\u0000${id}\u0000${action}`;
				let source = this.sources.get(key);
				if (source === void 0) {
					source = {
						getSnapshot: () => answer(this.snapshot, kind, id, action),
						subscribe: (listener) => {
							this.listeners.add(listener);
							return () => {
								this.listeners.delete(listener);
							};
						}
					};
					this.sources.set(key, source);
				}
				return source;
			}
			publish(next) {
				this.snapshot = next;
				for (const listener of [...this.listeners]) listener();
			}
		};
		function answer(snapshot, kind, id, action) {
			switch (snapshot.kind) {
				case "closed": return false;
				case "owner": return true;
				case "granted": return (kind === GLOBAL_KEY ? snapshot.global : snapshot.resources.get(kind)?.get(id))?.has(action) ?? false;
				/* v8 ignore next -- closed union. */
				default: return assertNever(snapshot);
			}
		}
		function withGrant(snapshot, grant, remove = false) {
			const resource = grant.resource;
			if (resource.kind === "global") return {
				...snapshot,
				global: new Set(grant.actions)
			};
			const resources = new Map(snapshot.resources);
			const grants = new Map(resources.get(resource.kind));
			if (remove) grants.delete(resource.id);
			else grants.set(resource.id, new Set(grant.actions));
			resources.set(resource.kind, grants);
			return {
				...snapshot,
				resources
			};
		}
		/* v8 ignore next 3 -- closed-union backstop. */
		function assertNever(value) {
			throw new Error(`unreachable access frame: ${JSON.stringify(value)}`);
		}
		//#endregion
		//#region lib/types/client/when-allowed.js
		/**
		* The effect controller behind `whenAccess`: install a callback's effects
		* while one access answer is true and dispose them while it is false.
		* @module @deepseek-ai/dsh-api-remote-access/src/client/when-allowed
		*/
		/**
		* Install `callback`'s effects while `answer` is true. The callback runs
		* synchronously when the answer is already true; a later true runs it again
		* after a false disposed the previous installation in reverse order. The
		* controller belongs to `ctx`'s fiber.
		* @param ctx - the caller's Context; it owns the controller and every installation.
		* @param answer - the access answer to follow.
		* @param callback - creates one disposer or an iterable of disposers.
		* @param label - effect label for diagnostics.
		* @returns idempotent disposer for the controller and any installed effects.
		* @throws callback setup failures synchronously when the answer is already true.
		*/
		function whenAllowed(ctx, answer, callback, label) {
			const disposeController = ctx.effect(() => {
				let installed;
				let stopped = false;
				const uninstall = () => {
					const dispose = installed;
					installed = void 0;
					dispose?.();
				};
				const reconcile = () => {
					if (stopped) return;
					const allowed = answer.getSnapshot();
					if (allowed === (installed !== void 0)) return;
					if (!allowed) {
						uninstall();
						return;
					}
					const disposeEffect = ctx.effect(callback, `${label}: allowed`);
					installed = () => {
						disposeEffect();
					};
				};
				const unsubscribe = answer.subscribe(() => {
					changed();
				});
				const stop = () => {
					if (stopped) return;
					stopped = true;
					unsubscribe();
					uninstall();
				};
				const changed = () => {
					try {
						reconcile();
					} catch (error) {
						stop();
						if (error?.code === "INACTIVE_EFFECT") return;
						const failure = error instanceof Error ? error : new Error(String(error));
						queueMicrotask(() => {
							throw failure;
						});
					}
				};
				try {
					reconcile();
				} catch (error) {
					stop();
					throw error;
				}
				return stop;
			}, label);
			return () => {
				disposeController();
			};
		}
		//#endregion
		//#region lib/types/client/mount.js
		/**
		* Client access mount: follows the calling Peer's access snapshot, provides
		* the `remoteAccess` Client service, and publishes the global-resource `useRemoteAccess` Hook.
		* The entry module supplies the generated `remoteAccess` contribution, so
		* specs mount a fake one.
		* @module @deepseek-ai/dsh-api-remote-access/src/client/mount
		*/
		/** The `remoteAccess` Client service over one snapshot owner. */
		var ClientRemoteAccessService = class extends _deepseek_ai_cordis.Service {
			state;
			/**
			* @param ctx - Client Context the service is provided on.
			* @param state - snapshot owner answering every source.
			*/
			constructor(ctx, state) {
				super(ctx, "remoteAccess");
				this.state = state;
			}
			source(kind, id, action) {
				return this.state.resource(kind, id, action);
			}
			whenAccess(action, callback) {
				return whenAllowed(this.ctx, this.state.global(action), callback, `remoteAccess.whenAccess(${JSON.stringify(action)})`);
			}
			whenResourceAccess(kind, id, action, callback) {
				return whenAllowed(this.ctx, this.state.resource(kind, id, action), callback, `remoteAccess.whenResourceAccess(${JSON.stringify(kind)}, ${JSON.stringify(id)}, ${JSON.stringify(action)})`);
			}
		};
		/**
		* Mount the `remoteAccess` namespace, follow the access snapshot, provide the
		* `remoteAccess` Client service, and publish the global-resource `useRemoteAccess` Hook.
		* Answers start from the page's injected baseline, or false without one,
		* and follow the stream's frames from then on.
		* @param ctx - Client root Context injecting `remote` and `slots`.
		* @param contribution - generated `remoteAccess` Remote contribution.
		* @param initial - the page's injected opening baseline, read before the stream connects.
		* @returns disposer that withdraws the namespace after the stream stops.
		*/
		async function mountAccess(ctx, contribution, initial) {
			const state = new ClientAccessState(initial);
			new ClientRemoteAccessService(ctx, state);
			ctx.slots.provideRoot({ keyedHooks: { remoteAccess: (action) => state.global(action) } });
			const unmount = await ctx.remote.$mount(contribution);
			const follow = ctx.inject(["remote.remoteAccess"], (remoteCtx) => {
				const control = createAccessStream(remoteCtx.remote, state, remoteCtx.logger);
				control.start();
				remoteCtx.effect(() => async () => {
					await control.dispose();
				}, "remote-access.client.follow");
			});
			return async () => {
				await follow.dispose();
				await unmount();
			};
		}
		/**
		* Create the reconnecting access snapshot stream. A carrier loss keeps the
		* last snapshot while the stream reconnects; a terminal failure keeps the
		* owner's answers and turns a non-owner's answers false.
		*/
		function createAccessStream(remote, state, logger) {
			return new _deepseek_ai_dsh_api_gateway_client.RemoteSnapshotStream(remote.$stream({
				name: "Remote access stream",
				open: (signal) => remote.remoteAccess.follow(signal),
				ended: (accepted) => accepted ? new _deepseek_ai_dsh_api_gateway_client.RemoteStreamCarrierError("Remote access stream ended without a terminal result") : /* @__PURE__ */ new Error("Remote access stream ended before its opening snapshot")
			}), {
				name: "Remote access stream",
				isSnapshot: (frame) => frame.type === "baseline",
				replace: (frame) => {
					state.replace(frame);
				},
				update: (frame) => {
					state.update(frame);
				},
				failed: (error) => {
					if (state.owner) logger.error("access snapshot stream failed; owner access answers are unaffected", error);
					else logger.error("access snapshot stream failed; reload the page to reconnect", error);
					state.unavailable();
				}
			});
		}
		//#endregion
		//#region lib/types/client/index.js
		/**
		* Client face: starts from the access snapshot the index injected, follows
		* the calling Peer's snapshot stream, provides the `remoteAccess` Client
		* service whose `source(kind, id, action)` answers for any declared-kind
		* resource and whose `whenAccess(action, callback)` keeps effects installed
		* while the global resource allows an action, and publishes
		* `useRemoteAccess(action)` on the global resource. Domain UI adapters
		* publish their own resource Hooks over `source()` and their own
		* `whenAccess` over `whenResourceAccess()`. Every
		* answer is a boolean: true for the owner, false without a snapshot or after
		* a non-owner stream fails; the Host enforces every call regardless.
		* @module @deepseek-ai/dsh-api-remote-access/client
		*/
		/** Required Client services: the Remote mount face and the Slot registry. */
		const inject = ["remote", "slots"];
		/**
		* Mount the generated `remoteAccess` namespace and publish the access Hooks.
		* @param ctx - Client root Context.
		* @returns disposer that withdraws the namespace after the stream stops.
		*/
		function apply(ctx) {
			return mountAccess(ctx, TYPERT_REMOTE, parseInjectedBaseline(Reflect.get(globalThis, REMOTE_ACCESS_SNAPSHOT_KEY)));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
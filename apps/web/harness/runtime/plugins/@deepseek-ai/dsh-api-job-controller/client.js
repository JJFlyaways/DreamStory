window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-api-job-controller",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		let _deepseek_ai_cordis = require("@deepseek-ai/cordis");
		let _deepseek_ai_dsh_api_gateway_client = require("@deepseek-ai/dsh-api-gateway/client");
		//#region lib/types/client/model.js
		/**
		* React-free client job state: the roster each watched session can see, fed
		* by `job.list` frames, and per-job accumulated output views fed by
		* `job.follow` frames. Pure data plus subscriptions — transport wiring stays
		* in the client service, UI stays in slot components.
		* @module @deepseek-ai/dsh-api-job-controller/client/model
		*/
		/** Bounded per-job render tail, in UTF-16 code units. */
		const RENDER_TAIL_LIMIT = 128 * 1024;
		/** Owns the per-session rosters and per-job observation state. */
		var ClientJobsModel = class {
			rowsBySession = /* @__PURE__ */ new Map();
			observedStates = /* @__PURE__ */ new Map();
			listeners = /* @__PURE__ */ new Set();
			snapshotCache = {
				rows: {},
				observed: {}
			};
			snapshotDirty = false;
			getSnapshot() {
				if (this.snapshotDirty) {
					const rows = {};
					for (const [id, jobs] of this.rowsBySession) rows[id] = jobs;
					const observed = {};
					for (const [id, state] of this.observedStates) observed[id] = state.view;
					this.snapshotCache = {
						rows,
						observed
					};
					this.snapshotDirty = false;
				}
				return this.snapshotCache;
			}
			subscribe(listener) {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			}
			/**
			* Replace one session's roster with a `rows` frame's whole set. An empty
			* set is stored as an absent key.
			* @param sessionId - the watched session.
			* @param jobs - the complete visible set.
			*/
			rowsReplaced(sessionId, jobs) {
				const key = String(sessionId);
				if (jobs.length === 0) {
					if (!this.rowsBySession.delete(key)) return;
				} else this.rowsBySession.set(key, jobs);
				this.changed();
			}
			/**
			* Drop one session's roster after its last watcher stops or its stream fails.
			* @param sessionId - the no-longer-watched session.
			*/
			rowsDropped(sessionId) {
				if (!this.rowsBySession.delete(String(sessionId))) return;
				this.changed();
			}
			/**
			* The resume offset for one job's next observation generation.
			* @param id - observed job.
			* @returns the last accepted `next`, or undefined for a fresh observation.
			*/
			cursorOf(id) {
				return this.observedStates.get(String(id))?.cursor;
			}
			/**
			* Install or reset observation state when a generation's anchor arrives.
			* @param id - observed job.
			* @param frame - the generation's `opened` anchor.
			*/
			observeOpened(id, frame) {
				const existing = this.observedStates.get(String(id));
				const freshPastHead = (existing === void 0 || existing.view.text === "") && frame.from > 0;
				const view = {
					jobId: id,
					text: existing?.view.text ?? "",
					gapBefore: (existing?.view.gapBefore ?? false) || frame.from < frame.job.output.earliest || freshPastHead,
					streaming: true
				};
				this.observedStates.set(String(id), {
					view,
					cursor: frame.from
				});
				this.changed();
			}
			/**
			* Append one output frame's chunks to the bounded render tail.
			* @param id - observed job.
			* @param frame - a coalesced `output` frame.
			*/
			observeOutput(id, frame) {
				const state = this.observedStates.get(String(id));
				/* v8 ignore next -- frames arrive only between opened and stop for a tracked id. */
				if (state === void 0) return;
				let text = state.view.text + frame.chunks.map((chunk) => chunk.text).join("");
				let gapBefore = state.view.gapBefore || frame.lossy === true || frame.chunks.some((chunk) => chunk.gapBefore === true);
				if (text.length > RENDER_TAIL_LIMIT) {
					let cut = text.length - RENDER_TAIL_LIMIT;
					const unit = text.charCodeAt(cut);
					if (unit >= 56320 && unit <= 57343) cut += 1;
					text = text.slice(cut);
					gapBefore = true;
				}
				state.view = {
					...state.view,
					text,
					gapBefore
				};
				state.cursor = frame.next;
				this.changed();
			}
			/**
			* Close the live view once the terminal `status` frame arrived: the ring is
			* drained and the roster row carries the settled projection.
			* @param id - observed job.
			*/
			observeSettled(id) {
				const state = this.observedStates.get(String(id));
				/* v8 ignore next -- frames arrive only between opened and stop for a tracked id. */
				if (state === void 0) return;
				state.view = {
					...state.view,
					streaming: false
				};
				this.changed();
			}
			/**
			* Record a terminal observation failure.
			* @param id - observed job.
			* @param error - the stream's terminal failure.
			*/
			observeFailed(id, error) {
				const state = this.observedStates.get(String(id));
				if (state === void 0) {
					this.observedStates.set(String(id), {
						view: {
							jobId: id,
							text: "",
							gapBefore: false,
							streaming: false,
							error: String(error)
						},
						cursor: void 0
					});
					this.changed();
					return;
				}
				state.view = {
					...state.view,
					streaming: false,
					error: String(error)
				};
				this.changed();
			}
			/**
			* Drop observation state after the last observer stops.
			* @param id - the no-longer-observed job.
			*/
			observeStopped(id) {
				if (!this.observedStates.delete(String(id))) return;
				this.changed();
			}
			changed() {
				this.snapshotDirty = true;
				(0, _deepseek_ai_dsh_client_store.notifySubscribers)(this.listeners, "jobs");
			}
		};
		//#endregion
		//#region lib/types/client/service.js
		/**
		* The `ctx.jobs` client service: reference-counted streams over the `job`
		* namespace — one `job.list` roster stream per watched session and one
		* `job.follow` stream per observed job — so overlapping viewers share a
		* stream, rosters resume whole after a reconnect, and observations resume
		* from the model's cursor, plus the human kill passthrough over `job.kill`.
		* @module @deepseek-ai/dsh-api-job-controller/client/service
		*/
		/** Owns the bare jobs snapshot and the per-session and per-job streams. */
		var ClientJobs = class extends _deepseek_ai_cordis.Service {
			remote;
			model;
			state;
			rowsEntries = /* @__PURE__ */ new Map();
			observations = /* @__PURE__ */ new Map();
			/**
			* @param ctx - client root Context.
			* @param remote - the Gateway stream factory plus the generated `job` namespace, both resolved by the caller.
			* @param model - shared client jobs model.
			*/
			constructor(ctx, remote, model) {
				super(ctx, "jobs");
				this.remote = remote;
				this.model = model;
				this.state = model;
				ctx.effect(() => async () => {
					const open = [...this.rowsEntries.values(), ...this.observations.values()];
					this.rowsEntries.clear();
					this.observations.clear();
					for (const entry of open) entry.stopped = true;
					await Promise.allSettled(open.map((entry) => entry.dispose()));
				}, "job-controller.client.streams");
			}
			kill(sessionId, id) {
				return this.remote.job.kill({
					sessionId,
					jobId: id
				});
			}
			watchRows(sessionId) {
				return this.acquire(this.rowsEntries, String(sessionId), () => this.startRows(sessionId), () => {
					this.model.rowsDropped(sessionId);
				});
			}
			observe(sessionId, id) {
				return this.acquire(this.observations, String(id), () => this.startObservation(sessionId, id), () => {
					this.model.observeStopped(id);
				});
			}
			/** Share the live entry under `key` or start one, and hand back its release. */
			acquire(entries, key, start, cleared) {
				const existing = entries.get(key);
				if (existing !== void 0 && !existing.stopped) {
					existing.refs += 1;
					return this.releaser(entries, key, existing, cleared);
				}
				const entry = start();
				entries.set(key, entry);
				return this.releaser(entries, key, entry, cleared);
			}
			/**
			* Release closures bind the exact entry they were minted for, never the
			* map's current occupant: a later acquire on the same key may have replaced
			* a stopped entry, and decrementing or disposing through the key alone
			* would tear down that newer stream's references.
			*/
			releaser(entries, key, entry, cleared) {
				let released = false;
				return () => {
					if (released) return;
					released = true;
					entry.refs -= 1;
					if (entry.refs > 0) return;
					if (entries.get(key) === entry) entries.delete(key);
					entry.stopped = true;
					entry.dispose().then(() => {
						if (entries.has(key)) return;
						cleared();
					});
				};
			}
			startRows(sessionId) {
				const name = `job rows ${String(sessionId)}`;
				const stream = this.remote.$stream({
					name,
					open: (signal) => this.remote.job.list({ sessionId }, signal),
					ended: (accepted) => accepted ? new _deepseek_ai_dsh_api_gateway_client.RemoteStreamCarrierError(`${name} ended before release`) : /* @__PURE__ */ new Error(`${name} ended before its first frame`)
				});
				const entry = {
					refs: 1,
					stopped: false,
					dispose: () => stream.dispose()
				};
				(async () => {
					try {
						for await (const item of stream) {
							this.model.rowsReplaced(sessionId, item.value.jobs);
							item.accept();
						}
					} catch {
						if (!entry.stopped) this.model.rowsDropped(sessionId);
					} finally {
						entry.stopped = true;
						entry.dispose();
					}
				})();
				return entry;
			}
			startObservation(sessionId, id) {
				const name = `job observation ${String(id)}`;
				const stream = this.remote.$stream({
					name,
					open: (signal) => {
						const from = this.model.cursorOf(id);
						return this.remote.job.follow({
							jobId: id,
							...sessionId !== void 0 ? { sessionId } : {},
							...from !== void 0 ? { from } : {}
						}, signal);
					},
					ended: (accepted) => accepted ? new _deepseek_ai_dsh_api_gateway_client.RemoteStreamCarrierError(`${name} ended before settlement`) : /* @__PURE__ */ new Error(`${name} ended before its anchor`)
				});
				const entry = {
					refs: 1,
					stopped: false,
					dispose: () => stream.dispose()
				};
				(async () => {
					try {
						for await (const item of stream) {
							const frame = item.value;
							if (frame.type === "opened") {
								this.model.observeOpened(id, frame);
								item.accept();
								continue;
							}
							if (frame.type === "output") {
								this.model.observeOutput(id, frame);
								continue;
							}
							this.model.observeSettled(id);
							break;
						}
					} catch (error) {
						if (!entry.stopped) this.model.observeFailed(id, error);
					} finally {
						entry.stopped = true;
						entry.dispose();
					}
				})();
				return entry;
			}
		};
		//#endregion
		//#region lib/types/client/index.js
		/**
		* Job Controller client half: installs `ctx.jobs` (rosters, observations, and
		* the human kill) over the generated `job` Remote namespace. The plugin resolves both Remote faces it drives while its
		* own context is current, because stream (re)opens run on caller stacks — a
		* React event, a carrier retry — whose dynamic context has not declared
		* `remote.job`.
		* @module @deepseek-ai/dsh-api-job-controller/client
		*/
		/** Required Client Remote services. */
		const inject = ["remote", "remote.job"];
		/**
		* Install the client jobs service.
		* @param ctx - Client root Context.
		*/
		function apply(ctx) {
			const { remote } = ctx;
			const { job } = remote;
			new ClientJobs(ctx, {
				$stream: (options) => remote.$stream(options),
				job
			}, new ClientJobsModel());
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-product-analytics",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_cordis = require("@deepseek-ai/cordis");
		//#region lib/types/client/index.js
		/** Desktop renderer analytics sender; browser applications have no collection capability. */
		var DesktopAnalytics = class extends _deepseek_ai_cordis.Service {
			collecting = false;
			submit;
			constructor(ctx) {
				super(ctx, "productAnalytics");
				this.submit = async (event) => {
					try {
						await ctx.remote.productAnalytics.report(event);
					} catch (_error) {}
				};
				if (!("dshDesktop" in globalThis)) return;
				const stream = ctx.remote.$stream({
					name: "product analytics policy",
					open: (signal) => ctx.remote.productAnalytics.watchPolicy(signal),
					ended: () => /* @__PURE__ */ new Error("product analytics policy stream ended"),
					carrierFailed: () => {
						this.collecting = false;
					}
				});
				ctx.effect(() => () => {
					this.collecting = false;
					return stream.dispose();
				});
				(async () => {
					for await (const frame of stream) {
						this.collecting = frame.value;
						frame.accept();
					}
				})().catch(() => {
					this.collecting = false;
				});
			}
			/** Whether the synchronized Host configuration currently permits collection. */
			get enabled() {
				return this.collecting;
			}
			/**
			* Send an event without retaining it for reconnect or later enablement.
			* @param name - event name.
			* @param attributes - approved business fields.
			* @param timestamp - occurrence time; defaults to the current time.
			*/
			track(name, attributes, timestamp = Date.now()) {
				if (!this.enabled) return;
				const event = {
					eventName: name,
					attributes,
					timestamp
				};
				this.submit(event);
			}
		};
		/** Analytics consumes authenticated RPC and its reconnecting policy stream. */
		const inject = ["remote", "remote.productAnalytics"];
		/** @param ctx - browser application context. */
		function apply(ctx) {
			ctx.plugin(DesktopAnalytics);
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
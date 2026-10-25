window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-plugin-manager",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let react_dom = require("react-dom");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let _deepseek_ai_dsh_client_ui_slots = require("@deepseek-ai/dsh-client-ui-slots");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		//#region ../../util/official-bundles/lib/index.js
		/**
		* Built-in profile bundles and persistent terminals, which have no plugin manager page.
		* Their Host availability and activation stay intact.
		*/
		const HIDDEN_BUNDLES = new Set([
			"@deepseek-ai/dsh-base",
			"@deepseek-ai/dsh-web-app",
			"@deepseek-ai/dsh-headless",
			"@deepseek-ai/dsh-sdk-app",
			"@deepseek-ai/dsh-acp-app",
			"@deepseek-ai/dsh-sdk-minimal",
			"@deepseek-ai/dsh-experimental-terminal-bundle"
		]);
		/**
		* The optional bundles the plugin manager's main and More lists rank first, in this order. {@link MORE_BUNDLES}, not
		* this list, decides whether a bundle appears on the main list.
		*/
		const EXTENSION_BUNDLES = [
			"@deepseek-ai/dsh-experimental-agent-team-profile",
			"@deepseek-ai/dsh-experimental-voice-input-bundle",
			"@deepseek-ai/dsh-experimental-plugin-market-bundle",
			"@deepseek-ai/dsh-experimental-auto-review"
		];
		/**
		* The optional bundles the plugin manager's main list leaves out until the profile enables them; its More list,
		* which includes every eligible bundle, ranks them last in this order.
		*/
		const MORE_BUNDLES = [
			"@deepseek-ai/dsh-personalized-recommendations",
			"@deepseek-ai/dsh-experimental-inspector-profile",
			"@deepseek-ai/dsh-cua-bundle",
			"@deepseek-ai/dsh-experimental-tool-worktree",
			"@deepseek-ai/dsh-experimental-cot-translation-bundle",
			"@deepseek-ai/dsh-experimental-session-search",
			"@deepseek-ai/dsh-experimental-session-titles-bundle",
			"@deepseek-ai/dsh-experimental-badge-skill-bundle",
			"@deepseek-ai/dsh-experimental-ralph-bundle",
			"@deepseek-ai/dsh-subagent-codex",
			"@deepseek-ai/dsh-subagent-claude-code"
		];
		/** Official bundles the plugin manager marks with the Experimental badge. */
		const EXPERIMENTAL_BUNDLES = new Set([
			"@deepseek-ai/dsh-personalized-recommendations",
			"@deepseek-ai/dsh-cua-bundle",
			"@deepseek-ai/dsh-experimental-agent-team-profile",
			"@deepseek-ai/dsh-experimental-voice-input-bundle",
			"@deepseek-ai/dsh-experimental-auto-review",
			"@deepseek-ai/dsh-experimental-inspector-profile",
			"@deepseek-ai/dsh-experimental-tool-worktree",
			"@deepseek-ai/dsh-experimental-cot-translation-bundle",
			"@deepseek-ai/dsh-experimental-session-search",
			"@deepseek-ai/dsh-experimental-session-titles-bundle",
			"@deepseek-ai/dsh-experimental-badge-skill-bundle",
			"@deepseek-ai/dsh-experimental-ralph-bundle",
			"@deepseek-ai/dsh-experimental-plugin-market-bundle"
		]);
		//#endregion
		//#region lib/types/client/config-ledger.js
		/**
		* Which plugins bring their own configuration to the Plugins page, read from
		* the three slots the page declares: the official plugins listed beside the
		* official bundles, the bundles with a form on their page, and the rows with a
		* page of their own. The projection follows the slot ledgers and the active
		* locale and keeps its snapshot until one of them moves.
		*/
		/**
		* The key a row's configuration registers under.
		* @param bundle - the bundle's package name.
		* @param rowId - the row id the bundle's patch declares.
		* @returns the `plugins.row.config` key.
		*/
		function rowConfigKey(bundle, rowId) {
			return `${bundle}#${rowId}`;
		}
		const SLOTS = [
			"plugins.item",
			"plugins.bundle.config",
			"plugins.row.config"
		];
		/**
		* Project the configuration ledgers as one observable the page binds.
		* @param ctx - the page plugin's context, whose slot registry and locale the projection follows.
		* @returns the ledger source; its snapshot changes only when a ledger or the locale does.
		*/
		function configLedgerSource(ctx) {
			let versions = [];
			let revision = -1;
			let ledger = {
				items: [],
				bundles: /* @__PURE__ */ new Set(),
				rows: /* @__PURE__ */ new Set()
			};
			const keysOf = (name) => new Set(ctx.slots.entries(name).flatMap((entry) => entry.options.key === void 0 ? [] : [entry.options.key]));
			return {
				getSnapshot: () => {
					const next = SLOTS.map((name) => ctx.slots.getVersion(name));
					const current = ctx.locale.getSnapshot().revision;
					if (current !== revision || next.some((version, index) => version !== versions[index])) {
						versions = next;
						revision = current;
						ledger = {
							items: ctx.slots.entries("plugins.item").map((entry) => ({
								/* v8 ignore next -- list-slot registration requires id */
								id: entry.options.id ?? "",
								label: (0, _deepseek_ai_dsh_client_ui_slots.resolveSlotLabel)(entry.options.label) ?? ""
							})),
							bundles: keysOf("plugins.bundle.config"),
							rows: keysOf("plugins.row.config")
						};
					}
					return ledger;
				},
				subscribe: (listener) => {
					const offs = [...SLOTS.map((name) => ctx.slots.subscribe(name, listener)), ctx.locale.subscribe(listener)];
					return () => {
						for (const off of offs) off();
					};
				}
			};
		}
		/** Simplified Chinese dictionary and key source of truth. */
		const zh = {
			panel: "插件",
			title: "插件",
			intro: "安装、启用和配置插件",
			infoLabel: "插件说明",
			infoDescription: "在这里配置官方插件，安装和管理其他插件。内置插件列表及运行状态可在「设置 → 内置插件」中查看",
			loading: "正在读取插件…",
			error: "可能由于网络问题，无法读取全部插件",
			unavailable: "本部署没有可管理的 profile，无法安装或启停插件。",
			retry: "重试",
			refresh: "刷新",
			refreshError: "刷新失败，请重试",
			empty: "还没有安装任何插件。",
			addPlugin: "添加插件",
			chooseAddMethod: "选择添加插件方式",
			installExisting: "安装第三方插件",
			installExistingDescription: "支持 npm 包、Git 仓库和本地目录",
			restartNotice: "请重启 DSH 使更改生效。{reason}",
			restartReasonNoHmr: "这个 profile 只在启动时应用更改。",
			restartReasonPackageMoved: "已安装的插件包解析到了另一个目录，或者更改替换了 DSH 安装自带的包。从其他位置安装前请先卸载。",
			restartReasonHostModule: "更改涉及 DSH 自身已加载的模块。",
			restartReasonUnmanagedPlugin: "更改涉及一个不受插件列表管理的插件。",
			restartReasonModuleComparison: "DSH 无法将已加载的插件与磁盘上的文件进行比较。",
			overriddenNotice: "{name} 已保存，但被更高优先级的配置覆盖，当前未生效",
			bundlesTitle: "已安装插件",
			basicTitle: "内置插件配置",
			extensionsTitle: "实验性插件",
			moreTitle: "实验性插件",
			moreAction: "更多",
			tabsLabel: "插件视图",
			installedTab: "已安装",
			statusProblem: "异常",
			statusBeta: "实验性",
			reasonLabel: "原因",
			metadataError: "包元信息错误：{error}",
			versionTag: "v{version}",
			partsLabel: "包含的组件",
			sourceTitle: "来源信息",
			sourceSpec: "代码来源",
			sourceBuiltIn: "内置",
			sourceVersion: "当前版本",
			partsEmpty: "这个插件包不包含任何组件。",
			partsCountTotal: "共 {count} 个",
			partsCountRunning: "{count} 运行中",
			partsCountOff: "{count} 已停用",
			partOff: "已关闭",
			partsCountFailed: "{count} 异常",
			partsFilter: "筛选组件",
			partsFilterEmpty: "没有匹配的组件。",
			partToggle: "启用组件 {name}",
			rowPhasePending: "等待依赖",
			rowPhaseLoading: "加载中",
			rowPhaseActive: "运行中",
			rowPhaseFailed: "异常",
			rowPhaseUnloading: "卸载中",
			enableToggle: "启用 {name}",
			applyingChange: "正在应用 {name} 的更改",
			openDetail: "查看 {name}",
			backToList: "返回插件",
			crumbRoot: "插件",
			backToPackage: "返回 {name}",
			configureRow: "配置 {name}",
			rowStateIdle: "未运行",
			uninstall: "卸载",
			uninstallLabel: "卸载 {name}",
			installTitle: "添加插件",
			installDescription: "输入插件的包名、GitHub 仓库地址或本地目录路径。",
			installSpecLabel: "包名或地址",
			installSpecPlaceholder: "例如 dsh-plugin-whale-pet",
			installGuideToggle: "插件安装引导和示例",
			installGuideHide: "收起引导",
			installGuideIdTitle: "填入插件 npm 包名",
			installGuideIdExample: "dsh-plugin-whale-pet",
			installGuideIdHint: "插件包名即 npm 包名（如 dsh-xxx 或 @作者/插件名），社区插件的 README 安装命令中 dsh plugin add 或 pnpm add 之后的部分。",
			installGuideExampleLabel: "示例：",
			installGitTemplateHint: "请替换为实际的 Git 仓库地址",
			installPathTemplateHint: "请替换为本机插件目录的实际路径",
			installGuideFill: "填入示例",
			installGuideFillAria: "填入示例 {example}",
			installGuideSafety: "请确认插件来源可信。插件在本机以你的权限运行，来源不明的插件可能损坏 DeepSeek Harness，或读取和泄露你的数据。",
			installUpgradeNotice: "按需安装的官方插件会在版本与 DSH 不同时提供“更新”。其他插件请先卸载再安装新版。",
			registryToggle: "安装源",
			registryLegend: "从哪个 npm 源下载插件",
			registryDefault: "默认安装源",
			registryOfficial: "npm 官方源",
			registryNpmmirror: "中国大陆镜像源",
			registryCustom: "自定义地址",
			registryCustomPlaceholder: "https://npm.example.com/",
			registryCustomHint: "填写内网或私有 npm 源地址，以 http:// 或 https:// 开头。若为需要登录的源，请把凭据放在本机的 ~/.npmrc 里。",
			registryCustomInvalid: "请输入以 http:// 或 https:// 开头的地址",
			registryListSeparator: "、",
			sentenceSeparator: "",
			installRun: "安装",
			installChecking: "正在检查…",
			installConfirmedTitle: "安装插件",
			installConfirmedRefused: "无法安装此插件",
			installProblemInvalid: "无法识别这个包名或地址：{reason}",
			installProblemInstalled: "该插件已安装。如需升级，请卸载后重新安装",
			installProblemShipped: "该插件随 DSH 提供，升级 DSH 即可获得新版本",
			installBundledTitle: "插件已随 DSH 提供",
			installBundledDescription: "无需下载，启用即可使用",
			installProblemNotFound: "未找到相关插件",
			installProblemNotPackage: "该路径不存在或不是有效的插件包",
			installProblemNotBundle: "这个包没有声明组合包，无法作为插件安装：{reason}",
			installProblemNetwork: "无法连接插件源，请检查网络后重试",
			installProblemNetworkAll: "所有安装源都无法连接（已尝试：{registries}），请检查网络或代理设置，或更换安装源",
			installProblemUnknown: "无法获取插件信息：{reason}",
			installingTitle: "插件安装中…",
			installedTitle: "已安装",
			statusNotInstalled: "未安装",
			statusMissingFiles: "包不可用",
			statusUpdateAvailable: "可更新",
			sourceNotInstalled: "未安装",
			sourceTargetSpec: "当前 DSH 对应来源",
			sourceTargetVersion: "当前 DSH 对应版本",
			update: "更新",
			updateLabel: "更新 {name}",
			versionsTitle: "版本",
			versionsRecheck: "重新检查",
			versionsChecking: "正在检查更新",
			versionsAvailable: "可更新到 {version}",
			versionsPublished: "发布于 {date}",
			versionsLatest: "已是最新版本",
			versionsCheckedAt: "上次检查于 {time}",
			versionsBlocked: "新版本需要更新 DSH",
			versionsBlockedDetail: "{version} 需要 {peers}，当前 DSH 为 {runtime}",
			versionsNoneInstallable: "没有可直接安装的新版本",
			versionsNoneInstallableDetail: "新版本已弃用、为预发布版本或没有声明组合包，展开查看",
			versionsFailedNetwork: "无法连接安装源",
			versionsFailedOther: "无法检查更新",
			versionsDetails: "详情",
			versionsNewerCount: "{count} 个新版本",
			versionsCollapse: "收起",
			versionsInstalledTag: "已安装",
			versionsPrereleaseTag: "预发布",
			versionsDeprecatedTag: "已弃用",
			versionsNeedsDsh: "需要 {peers}",
			versionsNotBundle: "这个版本没有声明组合包，无法安装",
			versionsUpdateLabel: "更新到 {version}",
			versionsRegistry: "安装源",
			versionsCheckedAtLabel: "检查于",
			versionsFallbackTag: "备选源",
			versionsFallbackHint: "{registry} 无法连接，版本列表来自备选源",
			versionsPrimaryTag: "首选源",
			versionsShowPrerelease: "显示预发布版本",
			versionsOmitted: "另有 {count} 个比已安装版本新的版本未列出",
			versionsProblemNetwork: "无法连接",
			versionsProblemNotFound: "未找到",
			versionsProblemUnknown: "失败",
			updatesAvailable: "{count} 个插件可更新",
			updatesNone: "所有插件均为最新版本",
			updatesFailed: "部分插件检查更新失败",
			updateTitle: "更新 {name}",
			updateSource: "安装来源",
			updateDescription: "将从 {from} 更新到 {to}，期间插件可能短暂停止。安装失败时会保留或重新安装 {from}。",
			updateRunning: "正在更新",
			updateStepChecking: "检查 {version}",
			updateStepRemoving: "停止并移除 {version}",
			updateStepInstalling: "从 {registry} 安装 {version}",
			updateStepRestoring: "重新安装 {version}",
			updateDone: "已更新到 {version}",
			updateDoneDetail: "新版本已经开始运行。",
			updateRestart: "已安装 {version}，重启后生效",
			updateRefused: "无法更新到 {version}",
			updateRemoveFailed: "无法移除 {version}",
			updateRestored: "更新失败，已恢复到 {version}",
			updateRestoredDetail: "{to} 安装失败，插件已重新安装 {from}。",
			updateKept: "无法更新到 {version}",
			updateKeptDetail: "{from} 未被移除，仍在使用。{reason}",
			updateBroken: "更新失败，插件未安装",
			updateBrokenDetail: "{to} 安装失败，重新安装 {from} 也未成功。请从“添加插件”重新安装 {name}。",
			updateLost: "无法确认更新结果",
			updateLostDetail: "与 DSH 的连接中断：{reason}。刷新插件列表可查看当前版本。",
			updateOutput: "查看安装输出",
			updateFinish: "完成",
			installFailedTitle: "插件安装失败",
			installGithubFailedTitle: "无法访问 GitHub",
			installGithubTimeoutTitle: "连接 GitHub 超时",
			installGithubFailedDescription: "请尝试其他安装来源。",
			installUseGithubMirror: "改用国内镜像",
			installTryAnotherWay: "试试其他方式",
			installPackageLabel: "插件包名",
			installEdit: "编辑",
			installEditAria: "返回编辑",
			installCancelAndEdit: "取消安装并返回编辑",
			installApplyingCancellationError: "取消请求未得到确认；安装已进入收尾阶段，请等待结果。{reason}",
			installReconcile: "核对安装状态",
			installUnknownTitle: "未能获取安装结果",
			installUnknownDescription: "后端当前没有此安装任务。请检查插件列表后再尝试安装。",
			installResultUnconfirmed: "未收到安装结果，请核对安装状态。{reason}",
			installAwaitingAcceptance: "正在等待后端接收安装任务，收到确认后会自动重试取消。",
			installBackgroundUnknown: "未能获取安装结果，请检查插件列表。",
			installCancel: "取消安装",
			installCloseCancels: "取消安装并关闭",
			installViewTask: "查看安装任务",
			installUnconfirmedTitle: "安装状态尚未确认",
			installBackgroundDone: "插件安装已完成，可查看安装结果。",
			installBackgroundFailed: "插件安装失败，可查看安装详情。",
			installBackgroundUnconfirmed: "安装状态暂未确认，请查看安装任务了解详情。",
			installBackgroundApplying: "安装已进入收尾阶段，无法取消，可查看安装进度。",
			installStarting: "正在准备安装…",
			installCancelling: "正在停止安装…",
			installApplying: "正在应用配置，请稍候…",
			installCancelledShort: "已取消",
			installCancelled: "已取消安装，插件未启用，下载的文件可能保留",
			installCancelUnconfirmed: "尚未确认安装已停止，请重试取消或等待安装结果。{reason}",
			installEnableNow: "立即启用",
			installDetailsShow: "查看安装详情",
			installDetailsHide: "收起安装详情",
			installVersion: "版本 {version}",
			installSubjectPath: "本地目录",
			installSubjectGit: "Git 仓库",
			installSubjectTarball: "压缩包",
			installLocation: "安装位置：{dir}",
			installRetry: "重试",
			installChangeRegistry: "更换安装源",
			installAttempt: "{previous} 不可用，正在改用 {registry} 重试（第 {index} 个源，共 {total} 个）",
			installAttemptBadge: "第 {index} 次 · {registry}",
			installFailureNetwork: "网络连接失败",
			installFailureNetworkAll: "所有安装源都无法连接（已尝试：{registries}）。请检查网络或代理设置，或更换安装源后重试。",
			installFailureNetworkHost: "无法连接 {host}。GitHub 地址和 .tgz 直链不经过安装源，需要本机能直接访问它或配置代理；如果这个插件也发布到了 npm，请改填包名。",
			installFailureNotFound: "未找到相关插件",
			installFailureNoMatchingVersion: "没有匹配的版本",
			installFailureDiskFull: "磁盘空间不足，安装已停止",
			installFailurePermission: "没有写入权限，无法安装",
			installFailureBuildBlocked: "有依赖的安装脚本需要你允许后才能继续",
			installFailureBuildBlockedManual: "有依赖的安装脚本被 pnpm 拦下，请在 profile 的 pnpm-workspace.yaml 的 allowBuilds 中放行后重试",
			installFailureIntegrity: "下载的安装包校验失败",
			installFailureTimeout: "安装超时",
			installFailurePnpmMissing: "没有找到 pnpm，无法安装",
			installFailureGeneric: "安装过程中出错，原因见安装详情",
			terminalCommandLine: "命令第 {n} 行",
			terminalRunning: "运行中",
			terminalFailed: "失败",
			terminalDone: "已完成",
			terminalCopy: "复制",
			terminalCopied: "复制成功",
			terminalNoOutput: "无输出",
			terminalCollapseAria: "收起输出",
			terminalCollapse: "收起",
			terminalExpandAria: "展开其余 {n} 行输出",
			terminalExpand: "… 其余 {n} 行",
			terminalExitCode: "退出码 {code}",
			terminalSignal: "信号 {signal}",
			terminalNoExitCode: "未正常退出",
			installDoneNothing: "安装完成，没有新增依赖。",
			installDoneRestart: "已安装，请重启 DSH 加载它。{reason}",
			installDoneApproved: "已允许运行安装脚本：{names}",
			installDoneOtherVersion: "根据 pnpm 供应链安全策略（minimumReleaseAge），发布时间未满规定时长的版本不会被自动安装，因此本次安装的是 {installed}，而非最新版本 {version}。新发布的版本尚未经过该观察期，可能存在未被发现的恶意代码或缺陷。如确需使用 {version}，请先卸载当前版本，再安装 {exact} 以指定该版本。",
			installApprovalTitle: "需要允许安装脚本",
			installApprovalDescription: "以下包声明了安装脚本，pnpm 默认不运行。",
			installApprovalConsequence: "允许后，脚本会以你的权限在本机运行，授权保存在当前 profile，之后不再询问。",
			installApprovalCaution: "只在信任这些包时允许。",
			installApproveAndRetry: "允许这些脚本并重试",
			installClose: "完成",
			close: "关闭",
			cancel: "取消",
			confirmUninstallTitle: "卸载「{name}」？",
			confirmUninstallDescription: "卸载后它提供的功能会消失。",
			confirmUninstall: "卸载",
			failedEnable: "启用失败：{reason}",
			failedDisable: "停用失败：{reason}",
			failedUninstall: "卸载失败：{reason}",
			failedRowEnable: "组件启用失败：{reason}",
			failedRowDisable: "组件停用失败：{reason}",
			reasonManagementRequired: "插件管理所需，不能停用或卸载",
			reasonUnaddressable: "当前 profile 的 patch 无法唯一定位这一项",
			reasonUnknownPlugin: "找不到该插件",
			reasonInvalidSpec: "请输入有效的包名或地址",
			reasonAlreadyInstalled: "这个包已经安装；要安装其他版本，请先卸载它",
			reasonAmbiguousInstall: "无法从依赖变更中确定安装了哪一个包",
			reasonNotBundle: "这个包没有声明组合包，不能作为插件管理",
			reasonNotRemovable: "这个包不属于当前 profile，或者是插件管理所需的组件",
			reasonStopProfile: "这个 profile 没有启用 HMR，正在使用的包要停止后用 dsh plugin 卸载",
			reasonBundleInUse: "其他配置仍在使用这个组合包的组件，请先停用它们",
			reasonStaleApproval: "待允许的安装脚本列表已变化，请重新安装以刷新",
			reasonIncompatibleVersion: "{plugin} 与 DSH {runtime} 不兼容（要求 {requirements}），运行它可能导致崩溃或数据丢失。",
			reasonIncompatibleVersionUnnamed: "这个插件与当前 DSH 版本不兼容，运行它可能导致崩溃或数据丢失。",
			reasonIncompatibleInstall: "请安装与当前 DSH 兼容的插件版本。",
			reasonIncompatibleInstalled: "请卸载后重新安装与当前 DSH 兼容的版本。",
			reasonOperationError: "Host 报告了一个错误",
			detailTitle: "详细介绍",
			detailLoading: "正在读取详细介绍",
			detailTooLarge: "详细介绍超过大小限制，未加载",
			detailNetwork: "无法连接到详细介绍的来源",
			detailInvalid: "插件声明的详细介绍文件无效",
			detailFailed: "无法读取详细介绍",
			detailFootnotes: "脚注"
		};
		/** English dictionary checked against the Chinese key set. */
		const en = {
			panel: "Plugins",
			title: "Plugins",
			intro: "Install, enable, and configure plugins",
			infoLabel: "About plugins",
			infoDescription: "Configure official plugins and install or manage other plugins here. View the built-in plugin list and runtime status in Settings → Built-in plugins.",
			loading: "Reading plugins…",
			error: "Could not read all plugins, possibly due to a network problem",
			unavailable: "This deployment runs without a manageable profile, so plugins cannot be installed or switched here.",
			retry: "Retry",
			refresh: "Refresh",
			refreshError: "Refresh failed. Please try again.",
			empty: "No plugins are installed yet.",
			addPlugin: "Add plugin",
			chooseAddMethod: "Choose how to add a plugin",
			installExisting: "Install a third-party plugin",
			installExistingDescription: "Supports npm packages, Git repositories, and local directories",
			restartNotice: "Restart DSH to apply the change. {reason}",
			restartReasonNoHmr: "This profile applies changes only at startup.",
			restartReasonPackageMoved: "An installed package now resolves to another directory, or the change replaces a package the DSH installation provides. Uninstall a package before installing it from another location.",
			restartReasonHostModule: "The change reaches modules DSH itself loaded.",
			restartReasonUnmanagedPlugin: "The change reaches a plugin running outside the plugin list.",
			restartReasonModuleComparison: "DSH could not compare the loaded plugins with their files.",
			overriddenNotice: "{name} was saved, but a higher-priority configuration overrides it, so it is not in effect",
			bundlesTitle: "Installed plugins",
			basicTitle: "Built-in plugin settings",
			extensionsTitle: "Experimental plugins",
			moreTitle: "Experimental plugins",
			moreAction: "More",
			tabsLabel: "Plugin views",
			installedTab: "Installed",
			statusProblem: "Problem",
			statusBeta: "Experimental",
			reasonLabel: "Reason",
			metadataError: "Package metadata error: {error}",
			versionTag: "v{version}",
			partsLabel: "Components",
			sourceTitle: "Source",
			sourceSpec: "Code source",
			sourceBuiltIn: "Built in",
			sourceVersion: "Current version",
			partsEmpty: "This plugin pack contains no components.",
			partsCountTotal: "{count} total",
			partsCountRunning: "{count} running",
			partsCountOff: "{count} off",
			partOff: "Off",
			partsCountFailed: "{count} failed",
			partsFilter: "Filter components",
			partsFilterEmpty: "No component matches.",
			partToggle: "Enable component {name}",
			rowPhasePending: "Waiting for dependencies",
			rowPhaseLoading: "Loading",
			rowPhaseActive: "Running",
			rowPhaseFailed: "Problem",
			rowPhaseUnloading: "Unloading",
			enableToggle: "Enable {name}",
			applyingChange: "Applying changes to {name}",
			openDetail: "View {name}",
			backToList: "Back to plugins",
			crumbRoot: "Plugins",
			backToPackage: "Back to {name}",
			configureRow: "Configure {name}",
			rowStateIdle: "Not running",
			uninstall: "Uninstall",
			uninstallLabel: "Uninstall {name}",
			installTitle: "Add plugin",
			installDescription: "Enter the plugin's package name, GitHub repository address, or local directory path.",
			installSpecLabel: "Package name or address",
			installSpecPlaceholder: "for example dsh-plugin-whale-pet",
			installGuideToggle: "Install guide and examples",
			installGuideHide: "Hide the guide",
			installGuideIdTitle: "Enter the plugin's npm package name",
			installGuideIdExample: "dsh-plugin-whale-pet",
			installGuideIdHint: "The plugin package name is the npm package name (like dsh-xxx or @author/plugin): the part after dsh plugin add or pnpm add in a community plugin's README install command.",
			installGuideExampleLabel: "Example: ",
			installGitTemplateHint: "Replace this with the actual Git repository address.",
			installPathTemplateHint: "Replace this with the actual path to your local plugin directory.",
			installGuideFill: "Use example",
			installGuideFillAria: "Use the example {example}",
			installGuideSafety: "Install only plugins you trust: they run with your permissions and can damage DeepSeek Harness or leak your data.",
			installUpgradeNotice: "On-demand official plugins offer Update when their version differs from DSH. To update other plugins, uninstall and reinstall them.",
			registryToggle: "Registry",
			registryLegend: "The npm registry the plugin is downloaded from",
			registryDefault: "Default registry",
			registryOfficial: "Official npm registry",
			registryNpmmirror: "Mainland China mirror",
			registryCustom: "Custom address",
			registryCustomPlaceholder: "https://npm.example.com/",
			registryCustomHint: "Enter an internal or private npm registry address starting with http:// or https://. If it requires a login, store the credentials in ~/.npmrc on this machine.",
			registryCustomInvalid: "Enter an address starting with http:// or https://",
			registryListSeparator: ", ",
			sentenceSeparator: " ",
			installRun: "Install",
			installChecking: "Checking…",
			installConfirmedTitle: "Install plugin",
			installConfirmedRefused: "This plugin cannot be installed",
			installProblemInvalid: "This is not a package name or address that can be installed: {reason}",
			installProblemInstalled: "This plugin is already installed. To upgrade it, uninstall it and install it again",
			installProblemShipped: "This plugin ships with DSH; upgrading DSH updates it",
			installBundledTitle: "This plugin ships with DSH",
			installBundledDescription: "Enable it without downloading another copy",
			installProblemNotFound: "No such plugin was found",
			installProblemNotPackage: "The path does not exist or is not a valid plugin package",
			installProblemNotBundle: "This package declares no bundle, so it cannot be installed as a plugin: {reason}",
			installProblemNetwork: "The plugin registry could not be reached; check the network and try again",
			installProblemNetworkAll: "No registry could be reached (tried: {registries}); check the network or proxy settings, or change the registry",
			installProblemUnknown: "The plugin could not be looked up: {reason}",
			installingTitle: "Installing the plugin…",
			installedTitle: "Installed",
			statusNotInstalled: "Not installed",
			statusMissingFiles: "Package unavailable",
			statusUpdateAvailable: "Update available",
			sourceNotInstalled: "Not installed",
			sourceTargetSpec: "Source for this DSH",
			sourceTargetVersion: "Version for this DSH",
			update: "Update",
			updateLabel: "Update {name}",
			versionsTitle: "Versions",
			versionsRecheck: "Check again",
			versionsChecking: "Checking for updates",
			versionsAvailable: "Update to {version} available",
			versionsPublished: "Published {date}",
			versionsLatest: "Up to date",
			versionsCheckedAt: "Last checked at {time}",
			versionsBlocked: "Newer versions need a DSH update",
			versionsBlockedDetail: "{version} needs {peers}; this DSH is {runtime}",
			versionsNoneInstallable: "No newer version to install directly",
			versionsNoneInstallableDetail: "The newer versions are deprecated, prereleases, or declare no bundle. Expand to see them",
			versionsFailedNetwork: "Could not reach the registry",
			versionsFailedOther: "Could not check for updates",
			versionsDetails: "Details",
			versionsNewerCount: "{count} newer",
			versionsCollapse: "Collapse",
			versionsInstalledTag: "Installed",
			versionsPrereleaseTag: "Prerelease",
			versionsDeprecatedTag: "Deprecated",
			versionsNeedsDsh: "Needs {peers}",
			versionsNotBundle: "This version declares no bundle and cannot be installed",
			versionsUpdateLabel: "Update to {version}",
			versionsRegistry: "Registry",
			versionsCheckedAtLabel: "Checked at",
			versionsFallbackTag: "Fallback",
			versionsFallbackHint: "{registry} could not be reached; the list comes from a fallback registry",
			versionsPrimaryTag: "First",
			versionsShowPrerelease: "Show prereleases",
			versionsOmitted: "{count} more versions newer than the installed one are not listed",
			versionsProblemNetwork: "Unreachable",
			versionsProblemNotFound: "Not found",
			versionsProblemUnknown: "Failed",
			updatesAvailable: "Updates available: {count}",
			updatesNone: "All plugins are up to date",
			updatesFailed: "Some plugins could not be checked",
			updateTitle: "Update {name}",
			updateSource: "Install from",
			updateDescription: "The update replaces {from} with {to}; the plugin may stop briefly. If the installation fails, {from} is kept or installed again.",
			updateRunning: "Updating",
			updateStepChecking: "Check {version}",
			updateStepRemoving: "Stop and remove {version}",
			updateStepInstalling: "Install {version} from {registry}",
			updateStepRestoring: "Install {version} again",
			updateDone: "Updated to {version}",
			updateDoneDetail: "The new version is running.",
			updateRestart: "{version} installed; it takes effect after a restart",
			updateRefused: "Cannot update to {version}",
			updateRemoveFailed: "Could not remove {version}",
			updateRestored: "Update failed; restored {version}",
			updateRestoredDetail: "{to} failed to install; {from} was installed again.",
			updateKept: "Could not update to {version}",
			updateKeptDetail: "{from} was not removed and stays in use. {reason}",
			updateBroken: "Update failed; the plugin is not installed",
			updateBrokenDetail: "{to} failed to install, and installing {from} again failed too. Install {name} again from Add plugin.",
			updateLost: "The update result is unknown",
			updateLostDetail: "The connection to DSH was interrupted: {reason}. Refresh the plugin list to see the installed version.",
			updateOutput: "Show installation output",
			updateFinish: "Done",
			installFailedTitle: "The plugin could not be installed",
			installGithubFailedTitle: "Cannot access GitHub",
			installGithubTimeoutTitle: "GitHub connection timed out",
			installGithubFailedDescription: "Try another installation source.",
			installUseGithubMirror: "Use mainland China mirror",
			installTryAnotherWay: "Try another way",
			installPackageLabel: "Plugin package name",
			installEdit: "Edit",
			installEditAria: "Back to editing",
			installCancelAndEdit: "Cancel installation and return to editing",
			installApplyingCancellationError: "Cancellation was not confirmed. Installation is being applied; wait for its result. {reason}",
			installReconcile: "Check installation status",
			installUnknownTitle: "Installation result unavailable",
			installUnknownDescription: "The Host has no active installation with this request id. Check the plugin list before trying again.",
			installResultUnconfirmed: "The installation result was not received. Check installation status. {reason}",
			installAwaitingAcceptance: "Waiting for the Host to accept installation. Cancellation will retry automatically after confirmation.",
			installBackgroundUnknown: "Installation result unavailable. Check the plugin list.",
			installCancel: "Cancel install",
			installCloseCancels: "Cancel install and close",
			installViewTask: "View installation",
			installUnconfirmedTitle: "Installation status unconfirmed",
			installBackgroundDone: "Installation finished. View installation details.",
			installBackgroundFailed: "Installation failed. View installation details.",
			installBackgroundUnconfirmed: "Installation status is unconfirmed. View the installation for details.",
			installBackgroundApplying: "Installation is being applied and cannot be cancelled. View installation progress.",
			installStarting: "Preparing installation…",
			installCancelling: "Stopping installation…",
			installApplying: "Applying configuration, please wait…",
			installCancelledShort: "Cancelled",
			installCancelled: "Installation cancelled; the plugin is not enabled, and downloaded files may remain",
			installCancelUnconfirmed: "Installation has not been confirmed stopped. Retry cancellation or wait for the installation result. {reason}",
			installEnableNow: "Enable now",
			installDetailsShow: "Show install details",
			installDetailsHide: "Hide install details",
			installVersion: "Version {version}",
			installSubjectPath: "Local directory",
			installSubjectGit: "Git repository",
			installSubjectTarball: "Tarball",
			installLocation: "Installs into {dir}",
			installRetry: "Retry",
			installChangeRegistry: "Change registry",
			installAttempt: "{previous} could not serve the package; retrying through {registry} (registry {index} of {total})",
			installAttemptBadge: "Attempt {index} · {registry}",
			installFailureNetwork: "The network connection failed",
			installFailureNetworkAll: "No registry could be reached (tried: {registries}). Check the network or proxy settings, or change the registry and retry.",
			installFailureNetworkHost: "{host} could not be reached. A GitHub address or a .tgz link is not fetched through the registry: this machine must reach it directly or through a proxy. If the plugin is also published to npm, enter its package name instead.",
			installFailureNotFound: "No such plugin was found",
			installFailureNoMatchingVersion: "No version matches the request",
			installFailureDiskFull: "The disk is full; the install stopped",
			installFailurePermission: "No write permission; the plugin cannot be installed",
			installFailureBuildBlocked: "A dependency's install scripts need your permission before the install can continue",
			installFailureBuildBlockedManual: "pnpm blocked install scripts; allow them under allowBuilds in pnpm-workspace.yaml and retry",
			installFailureIntegrity: "The downloaded package failed its integrity check",
			installFailureTimeout: "The install timed out",
			installFailurePnpmMissing: "pnpm was not found, so nothing can be installed",
			installFailureGeneric: "Something went wrong during the install; the details say what",
			terminalCommandLine: "Command line {n}",
			terminalRunning: "Running",
			terminalFailed: "Failed",
			terminalDone: "Done",
			terminalCopy: "Copy",
			terminalCopied: "Copied",
			terminalNoOutput: "No output",
			terminalCollapseAria: "Collapse output",
			terminalCollapse: "Collapse",
			terminalExpandAria: "Expand the remaining {n} output lines",
			terminalExpand: "… {n} more lines",
			terminalExitCode: "exit code {code}",
			terminalSignal: "signal {signal}",
			terminalNoExitCode: "no exit code",
			installDoneNothing: "Install finished with no new dependency.",
			installDoneRestart: "Installed; restart DSH to load it. {reason}",
			installDoneApproved: "Install scripts allowed for {names}",
			installDoneOtherVersion: "Under pnpm's supply-chain security policy (minimumReleaseAge), versions published more recently than the required age are not installed automatically, so this installation used {installed} instead of the latest version {version}. A newly published version has not completed this waiting period and may contain undetected malicious code or defects. If you need {version}, uninstall the current version and then install {exact} to request that version.",
			installApprovalTitle: "Install scripts need permission",
			installApprovalDescription: "These packages have install scripts that pnpm did not run.",
			installApprovalConsequence: "Once allowed, the scripts run here with your permissions, and the permission is saved in this profile.",
			installApprovalCaution: "Allow only packages you trust.",
			installApproveAndRetry: "Allow these scripts and retry",
			installClose: "Done",
			close: "Close",
			cancel: "Cancel",
			confirmUninstallTitle: "Uninstall \"{name}\"?",
			confirmUninstallDescription: "What it provides goes away once it is uninstalled.",
			confirmUninstall: "Uninstall",
			failedEnable: "Could not enable: {reason}",
			failedDisable: "Could not disable: {reason}",
			failedUninstall: "Could not uninstall: {reason}",
			failedRowEnable: "Could not enable the component: {reason}",
			failedRowDisable: "Could not disable the component: {reason}",
			reasonManagementRequired: "Plugin management needs it; it cannot be switched off or uninstalled.",
			reasonUnaddressable: "The profile patch cannot address this one uniquely.",
			reasonUnknownPlugin: "No such plugin.",
			reasonInvalidSpec: "Enter a valid package name or address.",
			reasonAlreadyInstalled: "This package is already installed; uninstall it before installing another version.",
			reasonAmbiguousInstall: "Which package was installed cannot be told from the dependency change.",
			reasonNotBundle: "This package declares no bundle, so it cannot be managed as a plugin.",
			reasonNotRemovable: "This package is not owned by the profile, or plugin management needs it.",
			reasonStopProfile: "This profile runs without HMR; stop it and uninstall the package with dsh plugin.",
			reasonBundleInUse: "Other configuration still uses this bundle's components; switch them off first.",
			reasonStaleApproval: "The pending script approvals changed; install again to refresh them.",
			reasonIncompatibleVersion: "{plugin} is incompatible with DSH {runtime} (requires {requirements}); running it may cause crashes or data loss.",
			reasonIncompatibleVersionUnnamed: "This plugin is incompatible with the running DSH version; running it may cause crashes or data loss.",
			reasonIncompatibleInstall: "Install a plugin version compatible with this DSH.",
			reasonIncompatibleInstalled: "Uninstall it and install a version compatible with this DSH.",
			reasonOperationError: "The Host reported an error.",
			detailTitle: "Details",
			detailLoading: "Reading details",
			detailTooLarge: "The details exceed the size limit and were not loaded.",
			detailNetwork: "Could not reach the source of the details.",
			detailInvalid: "The plugin declares an invalid details file.",
			detailFailed: "Could not read the details.",
			detailFootnotes: "Footnotes"
		};
		/** Japanese copy, checked against the English keys. */
		const ja = {
			"panel": "プラグイン",
			"title": "プラグイン",
			"intro": "プラグインのインストール、有効化、設定",
			"infoLabel": "プラグインについて",
			"infoDescription": "公式プラグインの設定や、その他のプラグインのインストール・管理はここで行えます。組み込みプラグインの一覧と実行状態は「設定 → 組み込みプラグイン」で確認できます。",
			"loading": "プラグインを読み込み中…",
			"error": "一部のプラグインを読み込めませんでした。ネットワークの問題が考えられます",
			"unavailable": "このデプロイでは管理可能なプロファイルが実行されていないため、ここでプラグインのインストールや切り替えはできません。",
			"retry": "再試行",
			"refresh": "更新",
			"refreshError": "更新に失敗しました。もう一度お試しください。",
			"empty": "プラグインはまだインストールされていません。",
			"addPlugin": "プラグインを追加",
			"chooseAddMethod": "プラグインの追加方法を選択",
			"installExisting": "サードパーティのプラグインをインストール",
			"installExistingDescription": "npm パッケージ、Git リポジトリ、ローカルディレクトリに対応",
			"restartNotice": "変更を適用するには DSH を再起動してください。{reason}",
			"restartReasonNoHmr": "このプロファイルでは起動時にのみ変更が適用されます。",
			"restartReasonPackageMoved": "インストール済みパッケージの解決先が別のディレクトリになったか、変更によって DSH インストールが提供するパッケージが置き換えられました。別の場所からインストールする前に、そのパッケージをアンインストールしてください。",
			"restartReasonHostModule": "変更はDSH自身が読み込んだモジュールにも及びます。",
			"restartReasonUnmanagedPlugin": "変更はプラグイン一覧外で動作しているプラグインにも及びます。",
			"restartReasonModuleComparison": "DSHは読み込まれたプラグインとそのファイルを比較できませんでした。",
			"overriddenNotice": "{name}は保存されましたが、優先度の高い設定が上書きしているため有効になっていません",
			"bundlesTitle": "インストール済みプラグイン",
			"basicTitle": "組み込みプラグイン設定",
			"extensionsTitle": "実験的プラグイン",
			"moreTitle": "実験的プラグイン",
			"moreAction": "その他",
			"tabsLabel": "プラグインビュー",
			"installedTab": "インストール済み",
			"statusProblem": "問題",
			"statusBeta": "実験的",
			"reasonLabel": "理由",
			"metadataError": "パッケージメタデータのエラー: {error}",
			"versionTag": "v{version}",
			"partsLabel": "コンポーネント",
			"sourceTitle": "ソース",
			"sourceSpec": "コードソース",
			"sourceBuiltIn": "組み込み",
			"sourceVersion": "現在のバージョン",
			"partsEmpty": "このプラグインパックにはコンポーネントが含まれていません。",
			"partsCountTotal": "計{count}件",
			"partsCountRunning": "{count}件稼働中",
			"partsCountOff": "{count}件オフ",
			"partOff": "オフ",
			"partsCountFailed": "{count}件失敗",
			"partsFilter": "コンポーネントを絞り込む",
			"partsFilterEmpty": "一致するコンポーネントはありません。",
			"partToggle": "コンポーネント{name}を有効化",
			"rowPhasePending": "依存関係を待機中",
			"rowPhaseLoading": "読み込み中",
			"rowPhaseActive": "稼働中",
			"rowPhaseFailed": "問題",
			"rowPhaseUnloading": "アンロード中",
			"applyingChange": "{name} の変更を適用中",
			"installBundledTitle": "このプラグインは DSH に同梱されています",
			"installBundledDescription": "追加のダウンロードなしで有効にできます",
			"enableToggle": "{name}を有効化",
			"openDetail": "{name}を表示",
			"backToList": "プラグイン一覧に戻る",
			"crumbRoot": "プラグイン",
			"backToPackage": "{name}に戻る",
			"configureRow": "{name}を設定",
			"rowStateIdle": "未稼働",
			"uninstall": "アンインストール",
			"uninstallLabel": "{name}をアンインストール",
			"installTitle": "プラグインを追加",
			"installDescription": "プラグインのパッケージ名、GitHubリポジトリのアドレス、またはローカルディレクトリのパスを入力してください。",
			"installSpecLabel": "パッケージ名またはアドレス",
			"installSpecPlaceholder": "例: dsh-plugin-whale-pet",
			"installGuideToggle": "インストールガイドと例",
			"installGuideHide": "ガイドを隠す",
			"installGuideIdTitle": "プラグインのnpmパッケージ名を入力",
			"installGuideIdExample": "dsh-plugin-whale-pet",
			"installGuideIdHint": "プラグインパッケージ名とはnpmパッケージ名(dsh-xxxや@author/pluginなど)です。コミュニティプラグインのREADMEのインストールコマンドにあるdsh plugin addやpnpm addの後ろの部分です。",
			"installGuideExampleLabel": "例: ",
			"installGitTemplateHint": "実際のGitリポジトリのアドレスに置き換えてください。",
			"installPathTemplateHint": "ローカルプラグインディレクトリの実際のパスに置き換えてください。",
			"installGuideFill": "例を使用",
			"installGuideFillAria": "例{example}を使用",
			"installGuideSafety": "信頼できるプラグインのみをインストールしてください。プラグインはあなたの権限で動作し、DeepSeek Harnessを破壊したりデータを漏洩させたりする可能性があります。",
			"installUpgradeNotice": "オンデマンドの公式プラグインは、バージョンがDSHと異なる場合に更新を提供します。その他のプラグインを更新するには、アンインストールして再インストールしてください。",
			"registryToggle": "レジストリ",
			"registryLegend": "プラグインのダウンロード元のnpmレジストリ",
			"registryDefault": "デフォルトレジストリ",
			"registryOfficial": "公式npmレジストリ",
			"registryNpmmirror": "中国本土ミラー",
			"registryCustom": "カスタムアドレス",
			"registryCustomPlaceholder": "https://npm.example.com/",
			"registryCustomHint": "http://またはhttps://で始まる社内・プライベートのnpmレジストリのアドレスを入力してください。ログインが必要な場合は、このマシンの~/.npmrcに認証情報を保存してください。",
			"registryCustomInvalid": "http://またはhttps://で始まるアドレスを入力してください",
			"registryListSeparator": ", ",
			"sentenceSeparator": " ",
			"installRun": "インストール",
			"installChecking": "確認中…",
			"installConfirmedTitle": "プラグインをインストール",
			"installConfirmedRefused": "このプラグインはインストールできません",
			"installProblemInvalid": "パッケージ名またはインストール可能なアドレスではありません: {reason}",
			"installProblemInstalled": "このプラグインはすでにインストールされています。アップグレードするには、アンインストールしてから再インストールしてください",
			"installProblemShipped": "このプラグインはDSHに同梱されています。DSHをアップグレードすると更新されます",
			"installProblemNotFound": "該当するプラグインが見つかりません",
			"installProblemNotPackage": "パスが存在しないか、有効なプラグインパッケージではありません",
			"installProblemNotBundle": "このパッケージはバンドルを宣言していないため、プラグインとしてインストールできません: {reason}",
			"installProblemNetwork": "プラグインレジストリに接続できませんでした。ネットワークを確認して再試行してください",
			"installProblemNetworkAll": "どのレジストリにも接続できませんでした（試行: {registries}）。ネットワークまたはプロキシ設定を確認するか、レジストリを変更してください",
			"installProblemUnknown": "プラグインを照会できませんでした: {reason}",
			"installingTitle": "プラグインをインストール中…",
			"installedTitle": "インストール済み",
			"statusNotInstalled": "未インストール",
			"statusMissingFiles": "パッケージ利用不可",
			"statusUpdateAvailable": "アップデートあり",
			"sourceNotInstalled": "未インストール",
			"sourceTargetSpec": "このDSH用のソース",
			"sourceTargetVersion": "このDSH用のバージョン",
			"update": "アップデート",
			"updateLabel": "{name}をアップデート",
			"versionsTitle": "バージョン",
			"versionsRecheck": "再確認",
			"versionsChecking": "アップデートを確認中",
			"versionsAvailable": "{version}へアップデート可能",
			"versionsPublished": "{date}に公開",
			"versionsLatest": "最新です",
			"versionsCheckedAt": "最終確認: {time}",
			"versionsBlocked": "新しいバージョンにはDSHのアップデートが必要です",
			"versionsBlockedDetail": "{version}には{peers}が必要です。このDSHは{runtime}です",
			"versionsNoneInstallable": "直接インストールできる新しいバージョンはありません",
			"versionsNoneInstallableDetail": "新しいバージョンは非推奨、プレリリース、またはバンドル未宣言です。展開して確認してください",
			"versionsFailedNetwork": "レジストリに接続できませんでした",
			"versionsFailedOther": "アップデートを確認できませんでした",
			"versionsDetails": "詳細",
			"versionsNewerCount": "新しいバージョン {count} 件",
			"versionsCollapse": "折りたたむ",
			"versionsInstalledTag": "インストール済み",
			"versionsPrereleaseTag": "プレリリース",
			"versionsDeprecatedTag": "非推奨",
			"versionsNeedsDsh": "{peers}が必要",
			"versionsNotBundle": "このバージョンはバンドルを宣言していないためインストールできません",
			"versionsUpdateLabel": "{version}へアップデート",
			"versionsRegistry": "レジストリ",
			"versionsCheckedAtLabel": "確認日時",
			"versionsFallbackTag": "フォールバック",
			"versionsFallbackHint": "{registry}に接続できませんでした。リストはフォールバックレジストリからのものです",
			"versionsPrimaryTag": "プライマリ",
			"versionsShowPrerelease": "プレリリースを表示",
			"versionsOmitted": "インストール済みより新しいバージョンが他に {count} 件ありますが、表示されていません",
			"versionsProblemNetwork": "到達不能",
			"versionsProblemNotFound": "見つかりません",
			"versionsProblemUnknown": "失敗",
			"updatesAvailable": "アップデートあり: {count}",
			"updatesNone": "すべてのプラグインは最新です",
			"updatesFailed": "一部のプラグインを確認できませんでした",
			"updateTitle": "{name}をアップデート",
			"updateSource": "インストール元",
			"updateDescription": "アップデートにより{from}が{to}に置き換わります。プラグインが一時停止する場合があります。インストールに失敗した場合、{from}は保持されるか再インストールされます。",
			"updateRunning": "アップデート中",
			"updateStepChecking": "{version}を確認",
			"updateStepRemoving": "{version}を停止して削除",
			"updateStepInstalling": "{registry}から{version}をインストール",
			"updateStepRestoring": "{version}を再インストール",
			"updateDone": "{version}にアップデートしました",
			"updateDoneDetail": "新しいバージョンが実行中です。",
			"updateRestart": "{version}をインストールしました。再起動後に有効になります",
			"updateRefused": "{version}へアップデートできません",
			"updateRemoveFailed": "{version}を削除できませんでした",
			"updateRestored": "アップデートに失敗しました。{version}を復元しました",
			"updateRestoredDetail": "{to}のインストールに失敗しました。{from}を再インストールしました。",
			"updateKept": "{version}へアップデートできませんでした",
			"updateKeptDetail": "{from}は削除されず、引き続き使用されます。{reason}",
			"updateBroken": "アップデートに失敗しました。プラグインはインストールされていません",
			"updateBrokenDetail": "{to}のインストールに失敗し、{from}の再インストールにも失敗しました。プラグインを追加から{name}を再インストールしてください。",
			"updateLost": "アップデート結果が不明です",
			"updateLostDetail": "DSHへの接続が中断されました: {reason}。プラグインリストを更新してインストール済みバージョンを確認してください。",
			"updateOutput": "インストール出力を表示",
			"updateFinish": "完了",
			"installFailedTitle": "プラグインをインストールできませんでした",
			"installGithubFailedTitle": "GitHubにアクセスできません",
			"installGithubTimeoutTitle": "GitHubへの接続がタイムアウトしました",
			"installGithubFailedDescription": "別のインストール元を試してください。",
			"installUseGithubMirror": "中国本土ミラーを使用",
			"installTryAnotherWay": "別の方法を試す",
			"installPackageLabel": "プラグインパッケージ名",
			"installEdit": "編集",
			"installEditAria": "編集に戻る",
			"installCancelAndEdit": "インストールをキャンセルして編集に戻る",
			"installApplyingCancellationError": "キャンセルが確認されませんでした。インストールを適用中です。結果をお待ちください。{reason}",
			"installReconcile": "インストール状態を確認",
			"installUnknownTitle": "インストール結果を取得できません",
			"installUnknownDescription": "HostにこのリクエストIDの有効なインストールがありません。再試行する前にプラグイン一覧を確認してください。",
			"installResultUnconfirmed": "インストール結果を受信できませんでした。インストール状態を確認してください。{reason}",
			"installAwaitingAcceptance": "Hostがインストールを承認するのを待っています。承認後、キャンセルは自動的に再試行されます。",
			"installBackgroundUnknown": "インストール結果を取得できません。プラグイン一覧を確認してください。",
			"installCancel": "インストールをキャンセル",
			"installCloseCancels": "インストールをキャンセルして閉じる",
			"installViewTask": "インストールを表示",
			"installUnconfirmedTitle": "インストール状態が未確認です",
			"installBackgroundDone": "インストールが完了しました。インストール詳細を表示します。",
			"installBackgroundFailed": "インストールに失敗しました。インストール詳細を表示します。",
			"installBackgroundUnconfirmed": "インストール状態が未確認です。インストールを表示して詳細を確認してください。",
			"installBackgroundApplying": "インストールを適用中のためキャンセルできません。インストールの進行状況を表示します。",
			"installStarting": "インストールを準備中…",
			"installCancelling": "インストールを停止中…",
			"installApplying": "設定を適用しています。お待ちください…",
			"installCancelledShort": "キャンセル済み",
			"installCancelled": "インストールをキャンセルしました。プラグインは有効化されておらず、ダウンロードしたファイルが残る場合があります",
			"installCancelUnconfirmed": "インストールの停止が確認されていません。キャンセルを再試行するか、インストール結果をお待ちください。{reason}",
			"installEnableNow": "今すぐ有効化",
			"installDetailsShow": "インストール詳細を表示",
			"installDetailsHide": "インストール詳細を隠す",
			"installVersion": "バージョン {version}",
			"installSubjectPath": "ローカルディレクトリ",
			"installSubjectGit": "Gitリポジトリ",
			"installSubjectTarball": "Tarball",
			"installLocation": "{dir} にインストール",
			"installRetry": "再試行",
			"installChangeRegistry": "レジストリを変更",
			"installAttempt": "{previous} ではパッケージを提供できませんでした。{registry} 経由で再試行しています（レジストリ {index}/{total}）",
			"installAttemptBadge": "試行 {index} · {registry}",
			"installFailureNetwork": "ネットワーク接続に失敗しました",
			"installFailureNetworkAll": "レジストリに接続できませんでした（試行: {registries}）。ネットワークまたはプロキシ設定を確認するか、レジストリを変更して再試行してください。",
			"installFailureNetworkHost": "{host} に接続できませんでした。GitHubアドレスや.tgzリンクはレジストリ経由では取得されません。このマシンが直接またはプロキシ経由で接続できる必要があります。プラグインがnpmにも公開されている場合は、パッケージ名を入力してください。",
			"installFailureNotFound": "該当するプラグインが見つかりません",
			"installFailureNoMatchingVersion": "要求に一致するバージョンがありません",
			"installFailureDiskFull": "ディスクの容量が不足しているため、インストールを停止しました",
			"installFailurePermission": "書き込み権限がないため、プラグインをインストールできません",
			"installFailureBuildBlocked": "インストールを続行するには、依存関係のインストールスクリプトに許可を与える必要があります",
			"installFailureBuildBlockedManual": "pnpmがインストールスクリプトをブロックしました。pnpm-workspace.yamlのallowBuildsで許可して再試行してください",
			"installFailureIntegrity": "ダウンロードしたパッケージの整合性チェックに失敗しました",
			"installFailureTimeout": "インストールがタイムアウトしました",
			"installFailurePnpmMissing": "pnpmが見つからないため、インストールできません",
			"installFailureGeneric": "インストール中に問題が発生しました。詳細をご確認ください",
			"terminalCommandLine": "コマンドライン {n}",
			"terminalRunning": "実行中",
			"terminalFailed": "失敗",
			"terminalDone": "完了",
			"terminalCopy": "コピー",
			"terminalCopied": "コピー済み",
			"terminalNoOutput": "出力なし",
			"terminalCollapseAria": "出力を折りたたむ",
			"terminalCollapse": "折りたたむ",
			"terminalExpandAria": "残り {n} 行の出力を展開",
			"terminalExpand": "… さらに {n} 行",
			"terminalExitCode": "終了コード {code}",
			"terminalSignal": "シグナル {signal}",
			"terminalNoExitCode": "終了コードなし",
			"installDoneNothing": "新しい依存関係はなく、インストールが完了しました。",
			"installDoneRestart": "インストール済みです。読み込むにはDSHを再起動してください。{reason}",
			"installDoneApproved": "{names} のインストールスクリプトを許可しました",
			"installDoneOtherVersion": "pnpm のサプライチェーンセキュリティポリシー（minimumReleaseAge）では、必須の経過時間より新しく公開されたバージョンは自動的にインストールされないため、このインストールでは最新バージョン {version} ではなく {installed} を使用しました。新しく公開されたバージョンはこの待機期間を経過しておらず、検出されていない悪意のあるコードや欠陥を含む可能性があります。{version} が必要な場合は、現在のバージョンをアンインストールしてから {exact} をインストールしてそのバージョンを要求してください。",
			"installApprovalTitle": "インストールスクリプトには許可が必要です",
			"installApprovalDescription": "これらのパッケージには pnpm が実行しなかったインストールスクリプトがあります。",
			"installApprovalConsequence": "許可すると、スクリプトはここであなたの権限で実行され、許可はこのプロファイルに保存されます。",
			"installApprovalCaution": "信頼できるパッケージのみ許可してください。",
			"installApproveAndRetry": "これらのスクリプトを許可して再試行",
			"installClose": "完了",
			"close": "閉じる",
			"cancel": "キャンセル",
			"confirmUninstallTitle": "「{name}」をアンインストールしますか？",
			"confirmUninstallDescription": "アンインストールすると、提供している機能は利用できなくなります。",
			"confirmUninstall": "アンインストール",
			"failedEnable": "有効化できませんでした: {reason}",
			"failedDisable": "無効化できませんでした: {reason}",
			"failedUninstall": "アンインストールできませんでした: {reason}",
			"failedRowEnable": "コンポーネントを有効化できませんでした: {reason}",
			"failedRowDisable": "コンポーネントを無効化できませんでした: {reason}",
			"reasonManagementRequired": "プラグイン管理に必要です。無効化もアンインストールもできません。",
			"reasonUnaddressable": "プロファイルパッチでこれを一意に指定できません。",
			"reasonUnknownPlugin": "そのようなプラグインはありません。",
			"reasonInvalidSpec": "有効なパッケージ名またはアドレスを入力してください。",
			"reasonAlreadyInstalled": "このパッケージはすでにインストールされています。別のバージョンをインストールする前にアンインストールしてください。",
			"reasonAmbiguousInstall": "依存関係の変更から、どのパッケージがインストールされたか判断できません。",
			"reasonNotBundle": "このパッケージはバンドルを宣言していないため、プラグインとして管理できません。",
			"reasonNotRemovable": "このパッケージはプロファイル所有ではないか、プラグイン管理に必要です。",
			"reasonStopProfile": "このプロファイルは HMR なしで動作します。停止してから dsh plugin でパッケージをアンインストールしてください。",
			"reasonBundleInUse": "他の設定がこのバンドルのコンポーネントをまだ使用しています。先にそれらを無効にしてください。",
			"reasonStaleApproval": "保留中のスクリプト承認が変更されました。インストールをやり直して更新してください。",
			"reasonIncompatibleVersion": "{plugin} は DSH {runtime} と互換性がありません（{requirements} が必要）。実行するとクラッシュやデータ損失を引き起こす可能性があります。",
			"reasonIncompatibleVersionUnnamed": "このプラグインは実行中の DSH バージョンと互換性がありません。実行するとクラッシュやデータ損失を引き起こす可能性があります。",
			"reasonIncompatibleInstall": "この DSH と互換性のあるプラグインバージョンをインストールしてください。",
			"reasonIncompatibleInstalled": "アンインストールして、この DSH と互換性のあるバージョンをインストールしてください。",
			"reasonOperationError": "Host がエラーを報告しました。",
			"detailTitle": "詳細",
			"detailLoading": "詳細を読み込み中",
			"detailTooLarge": "詳細がサイズ上限を超えているため読み込まれませんでした。",
			"detailNetwork": "詳細の取得元に接続できませんでした。",
			"detailInvalid": "プラグインが無効な詳細ファイルを宣言しています。",
			"detailFailed": "詳細を読み込めませんでした。",
			"detailFootnotes": "脚注"
		};
		/** Spanish dictionary, checked against the English keys. */
		const es = {
			panel: "Complementos",
			title: "Complementos",
			intro: "Instalar, habilitar y configurar complementos",
			infoLabel: "Acerca de los complementos",
			infoDescription: "Configure complementos oficiales e instale o administre otros complementos aquí. Vea la lista de complementos integrados y el estado del tiempo de ejecución en Configuración → Complementos integrados.",
			loading: "Leyendo complementos…",
			error: "No se pudieron leer todos los complementos, posiblemente debido a un problema de red",
			unavailable: "Esta implementación se ejecuta sin un perfil manejable, por lo que los complementos no se pueden instalar ni cambiar aquí.",
			retry: "Reintentar",
			refresh: "Actualizar",
			refreshError: "Error al actualizar. Por favor inténtalo de nuevo.",
			empty: "Aún no hay complementos instalados.",
			addPlugin: "Agregar complemento",
			chooseAddMethod: "Elija cómo agregar un complemento",
			installExisting: "Instalar un complemento de terceros",
			installExistingDescription: "Admite paquetes npm, repositorios Git y directorios locales",
			restartNotice: "Reinicie DSH para aplicar el cambio. {reason}",
			restartReasonNoHmr: "Este perfil aplica cambios solo al inicio.",
			restartReasonPackageMoved: "Un paquete instalado ahora se resuelve en otro directorio o el cambio reemplaza un paquete que proporciona la instalación de DSH. Desinstale un paquete antes de instalarlo desde otra ubicación.",
			restartReasonHostModule: "El cambio llega a los módulos DSH propiamente cargados.",
			restartReasonUnmanagedPlugin: "El cambio afecta a un complemento que se ejecuta fuera de la lista de complementos.",
			restartReasonModuleComparison: "DSH no pudo comparar los complementos cargados con sus archivos.",
			overriddenNotice: "{name} se guardó, pero una configuración de mayor prioridad lo anula, por lo que no está vigente",
			bundlesTitle: "Complementos instalados",
			basicTitle: "Configuración del complemento incorporado",
			extensionsTitle: "Complementos experimentales",
			moreTitle: "Complementos experimentales",
			moreAction: "Más",
			tabsLabel: "Vistas de complementos",
			installedTab: "Instalado",
			statusProblem: "problema",
			statusBeta: "Experimental",
			reasonLabel: "Razón",
			metadataError: "Error de metadatos del paquete: {error}",
			versionTag: "v{version}",
			partsLabel: "Componentes",
			sourceTitle: "Fuente",
			sourceSpec: "fuente del código",
			sourceBuiltIn: "Construido en",
			sourceVersion: "Versión actual",
			partsEmpty: "Este paquete de complementos no contiene componentes.",
			partsCountTotal: "{count} total",
			partsCountRunning: "{count} corriendo",
			partsCountOff: "{count} apagado",
			partOff: "Apagado",
			partsCountFailed: "{count} falló",
			partsFilter: "Componentes del filtro",
			partsFilterEmpty: "Ningún componente coincide.",
			partToggle: "Habilitar componente {name}",
			rowPhasePending: "Esperando dependencias",
			rowPhaseLoading: "Cargando",
			rowPhaseActive: "corriendo",
			rowPhaseFailed: "problema",
			rowPhaseUnloading: "Descarga",
			enableToggle: "Habilitar {name}",
			applyingChange: "Aplicar cambios a {name}",
			openDetail: "Ver {name}",
			backToList: "Volver a complementos",
			crumbRoot: "Complementos",
			backToPackage: "Volver a {name}",
			configureRow: "Configurar {name}",
			rowStateIdle: "no corriendo",
			uninstall: "Desinstalar",
			uninstallLabel: "Desinstalar {name}",
			installTitle: "Agregar complemento",
			installDescription: "Ingrese el nombre del paquete del complemento, la dirección del repositorio GitHub o la ruta del directorio local.",
			installSpecLabel: "Nombre o dirección del paquete",
			installSpecPlaceholder: "por ejemplo dsh-plugin-ballena-mascota",
			installGuideToggle: "Guía de instalación y ejemplos.",
			installGuideHide: "Ocultar la guía",
			installGuideIdTitle: "Ingrese el nombre del paquete npm del complemento",
			installGuideIdExample: "dsh-plugin-ballena-mascota",
			installGuideIdHint: "El nombre del paquete del complemento es el nombre del paquete npm (como dsh-xxx o @author/plugin): la parte después de dsh plugin add o pnpm add en el comando de instalación README de un complemento comunitario.",
			installGuideExampleLabel: "Ejemplo: ",
			installGitTemplateHint: "Reemplace esto con la dirección real del repositorio de Git.",
			installPathTemplateHint: "Reemplace esto con la ruta real a su directorio de complementos local.",
			installGuideFill: "ejemplo de uso",
			installGuideFillAria: "Utilice el ejemplo {example}",
			installGuideSafety: "Instale sólo complementos en los que confíe: se ejecutan con sus permisos y pueden dañar DeepSeek Harness o filtrar sus datos.",
			installUpgradeNotice: "Los complementos oficiales bajo demanda ofrecen actualización cuando su versión difiere de DSH. Para actualizar otros complementos, desinstálelos y vuelva a instalarlos.",
			registryToggle: "Registro",
			registryLegend: "El registro npm desde el que se descarga el complemento",
			registryDefault: "Registro predeterminado",
			registryOfficial: "Registro oficial de npm",
			registryNpmmirror: "Espejo de China continental",
			registryCustom: "Dirección personalizada",
			registryCustomPlaceholder: "https://npm.example.com/",
			registryCustomHint: "Ingrese una dirección de registro npm interna o privada que comience con http:// o https://.. Si requiere iniciar sesión, almacene las credenciales en ~/.npmrc en esta máquina.",
			registryCustomInvalid: "Introduzca una dirección que comience con http:// o https://",
			registryListSeparator: ", ",
			sentenceSeparator: "  ",
			installRun: "Instalar",
			installChecking: "Comprobando…",
			installConfirmedTitle: "Instalar complemento",
			installConfirmedRefused: "Este complemento no se puede instalar",
			installProblemInvalid: "Este no es un nombre o dirección de paquete que se pueda instalar: {reason}",
			installProblemInstalled: "Este complemento ya está instalado. Para actualizarlo, desinstálelo e instálelo nuevamente.",
			installProblemShipped: "Este complemento se envía con DSH; actualizar DSH lo actualiza",
			installBundledTitle: "Este complemento se envía con DSH",
			installBundledDescription: "Habilítelo sin descargar otra copia",
			installProblemNotFound: "No se encontró tal complemento",
			installProblemNotPackage: "La ruta no existe o no es un paquete de complemento válido",
			installProblemNotBundle: "Este paquete no declara ningún paquete, por lo que no se puede instalar como complemento: {reason}",
			installProblemNetwork: "No se pudo acceder al registro del complemento; comprueba la red y vuelve a intentarlo",
			installProblemNetworkAll: "No se pudo acceder a ningún registro (probado: {registries}); verifique la configuración de red o proxy, o cambie el registro",
			installProblemUnknown: "No se pudo buscar el complemento: {reason}",
			installingTitle: "Instalando el complemento…",
			installedTitle: "Instalado",
			statusNotInstalled: "No instalado",
			statusMissingFiles: "Paquete no disponible",
			statusUpdateAvailable: "Actualización disponible",
			sourceNotInstalled: "No instalado",
			sourceTargetSpec: "Fuente de este DSH",
			sourceTargetVersion: "Versión para este DSH",
			update: "Actualizar",
			updateLabel: "Actualización {name}",
			versionsTitle: "Versiones",
			versionsRecheck: "comprobar de nuevo",
			versionsChecking: "Buscando actualizaciones",
			versionsAvailable: "Actualización a {version} disponible",
			versionsPublished: "Publicado {date}",
			versionsLatest: "actualizado",
			versionsCheckedAt: "Última comprobación en {time}",
			versionsBlocked: "Las versiones más nuevas necesitan una actualización DSH",
			versionsBlockedDetail: "{version} necesita {peers}; este DSH es {runtime}",
			versionsNoneInstallable: "No hay una versión más nueva para instalar directamente",
			versionsNoneInstallableDetail: "Las versiones más recientes están obsoletas, son versiones preliminares o no declaran ningún paquete. Ampliar para verlos",
			versionsFailedNetwork: "No se pudo acceder al registro",
			versionsFailedOther: "No se pudo buscar actualizaciones",
			versionsDetails: "Detalles",
			versionsNewerCount: "{count} más nuevo",
			versionsCollapse: "Contraer",
			versionsInstalledTag: "Instalado",
			versionsPrereleaseTag: "Presentación",
			versionsDeprecatedTag: "En desuso",
			versionsNeedsDsh: "Necesita {peers}",
			versionsNotBundle: "Esta versión no declara ningún paquete y no se puede instalar.",
			versionsUpdateLabel: "Actualización a {version}",
			versionsRegistry: "Registro",
			versionsCheckedAtLabel: "Comprobado en",
			versionsFallbackTag: "Respaldo",
			versionsFallbackHint: "No se pudo alcanzar {registry}; la lista proviene de un registro alternativo",
			versionsPrimaryTag: "primero",
			versionsShowPrerelease: "Mostrar presentaciones preliminares",
			versionsOmitted: "{count} no se enumeran más versiones más recientes que la instalada",
			versionsProblemNetwork: "Inalcanzable",
			versionsProblemNotFound: "No encontrado",
			versionsProblemUnknown: "Fallido",
			updatesAvailable: "Actualizaciones disponibles: {count}",
			updatesNone: "Todos los complementos están actualizados.",
			updatesFailed: "Algunos complementos no se pudieron verificar",
			updateTitle: "Actualización {name}",
			updateSource: "Instalar desde",
			updateDescription: "La actualización reemplaza {from} por {to}; el complemento puede detenerse brevemente. Si la instalación falla, {from} se conserva o se vuelve a instalar.",
			updateRunning: "Actualizando",
			updateStepChecking: "Comprobar {version}",
			updateStepRemoving: "Detener y eliminar {version}",
			updateStepInstalling: "Instale {version} desde {registry}",
			updateStepRestoring: "Instale {version} nuevamente",
			updateDone: "Actualizado a {version}",
			updateDoneDetail: "La nueva versión se está ejecutando.",
			updateRestart: "{version} instalado; entra en vigor después de un reinicio",
			updateRefused: "No se puede actualizar a {version}",
			updateRemoveFailed: "No se pudo eliminar {version}",
			updateRestored: "La actualización falló; restaurado {version}",
			updateRestoredDetail: "{to} no pudo instalarse; {from} se instaló nuevamente.",
			updateKept: "No se pudo actualizar a {version}",
			updateKeptDetail: "{from} no se eliminó y permanece en uso. {reason}",
			updateBroken: "La actualización falló; el complemento no está instalado",
			updateBrokenDetail: "{to} no se pudo instalar y la instalación de {from} nuevamente también falló. Instale {name} nuevamente desde Agregar complemento.",
			updateLost: "Se desconoce el resultado de la actualización.",
			updateLostDetail: "Se interrumpió la conexión con DSH: {reason}. Actualice la lista de complementos para ver la versión instalada.",
			updateOutput: "Mostrar resultado de instalación",
			updateFinish: "hecho",
			installFailedTitle: "No se pudo instalar el complemento",
			installGithubFailedTitle: "No se puede acceder a GitHub",
			installGithubTimeoutTitle: "Se agotó el tiempo de espera de la conexión GitHub",
			installGithubFailedDescription: "Pruebe con otra fuente de instalación.",
			installUseGithubMirror: "Utilice el espejo de China continental",
			installTryAnotherWay: "Prueba de otra manera",
			installPackageLabel: "Nombre del paquete del complemento",
			installEdit: "Editar",
			installEditAria: "Volver a editar",
			installCancelAndEdit: "Cancelar la instalación y volver a editar",
			installApplyingCancellationError: "La cancelación no fue confirmada. Se está aplicando la instalación; espera su resultado. {reason}",
			installReconcile: "Verificar el estado de la instalación",
			installUnknownTitle: "El resultado de la instalación no está disponible",
			installUnknownDescription: "El Host no tiene ninguna instalación activa con esta identificación de solicitud. Consulte la lista de complementos antes de volver a intentarlo.",
			installResultUnconfirmed: "No se recibió el resultado de la instalación. Verificar el estado de la instalación. {reason}",
			installAwaitingAcceptance: "Esperando que el Host acepte la instalación. La cancelación se volverá a intentar automáticamente después de la confirmación.",
			installBackgroundUnknown: "El resultado de la instalación no está disponible. Consulte la lista de complementos.",
			installCancel: "Cancelar instalación",
			installCloseCancels: "Cancelar instalación y cerrar",
			installViewTask: "Ver instalación",
			installUnconfirmedTitle: "Estado de instalación no confirmado",
			installBackgroundDone: "Instalación finalizada. Ver detalles de instalación.",
			installBackgroundFailed: "La instalación falló. Ver detalles de instalación.",
			installBackgroundUnconfirmed: "El estado de la instalación no está confirmado. Vea la instalación para más detalles.",
			installBackgroundApplying: "La instalación se está aplicando y no se puede cancelar. Ver el progreso de la instalación.",
			installStarting: "Preparando la instalación…",
			installCancelling: "Deteniendo la instalación…",
			installApplying: "Aplicando configuración, espere...",
			installCancelledShort: "Cancelado",
			installCancelled: "Instalación cancelada; el complemento no está habilitado y los archivos descargados pueden permanecer",
			installCancelUnconfirmed: "No se ha confirmado que la instalación se haya detenido. Vuelva a intentar la cancelación o espere el resultado de la instalación. {reason}",
			installEnableNow: "Habilitar ahora",
			installDetailsShow: "Mostrar detalles de instalación",
			installDetailsHide: "Ocultar detalles de instalación",
			installVersion: "Versión {version}",
			installSubjectPath: "directorio local",
			installSubjectGit: "repositorio git",
			installSubjectTarball: "bola de tar",
			installLocation: "Se instala en {dir}",
			installRetry: "Reintentar",
			installChangeRegistry: "Cambiar registro",
			installAttempt: "{previous} no pudo entregar el paquete; reintentando a través de {registry} (registro {index} de {total})",
			installAttemptBadge: "Intento {index} · {registry}",
			installFailureNetwork: "La conexión de red falló",
			installFailureNetworkAll: "No se pudo acceder a ningún registro (probado: {registries}). Verifique la configuración de red o proxy, o cambie el registro y vuelva a intentarlo.",
			installFailureNetworkHost: "No se pudo contactar con {host}. Una dirección GitHub o un enlace .tgz no se recupera a través del registro: esta máquina debe llegar directamente o mediante un proxy. Si el complemento también está publicado en npm, ingrese el nombre del paquete.",
			installFailureNotFound: "No se encontró tal complemento",
			installFailureNoMatchingVersion: "Ninguna versión coincide con la solicitud",
			installFailureDiskFull: "El disco está lleno; la instalación se detuvo",
			installFailurePermission: "Sin permiso de escritura; el complemento no se puede instalar",
			installFailureBuildBlocked: "Los scripts de instalación de una dependencia necesitan su permiso antes de que la instalación pueda continuar",
			installFailureBuildBlockedManual: "pnpm bloqueó los scripts de instalación; permítalos en enableBuilds en pnpm-workspace.yaml y vuelva a intentarlo",
			installFailureIntegrity: "El paquete descargado no pasó la verificación de integridad",
			installFailureTimeout: "La instalación expiró",
			installFailurePnpmMissing: "No se encontró pnpm, por lo que no se puede instalar nada.",
			installFailureGeneric: "Algo salió mal durante la instalación; los detalles dicen lo que",
			terminalCommandLine: "Línea de comando {n}",
			terminalRunning: "corriendo",
			terminalFailed: "Fallido",
			terminalDone: "hecho",
			terminalCopy: "Copiar",
			terminalCopied: "Copiado",
			terminalNoOutput: "Sin salida",
			terminalCollapseAria: "Contraer salida",
			terminalCollapse: "Contraer",
			terminalExpandAria: "Expanda las líneas de salida {n} restantes",
			terminalExpand: "… {n} más líneas",
			terminalExitCode: "código de salida {code}",
			terminalSignal: "señal {signal}",
			terminalNoExitCode: "sin código de salida",
			installDoneNothing: "Instalación finalizada sin nuevas dependencias.",
			installDoneRestart: "Instalado; reinicie DSH para cargarlo. {reason}",
			installDoneApproved: "Instalar scripts permitidos para {names}",
			installDoneOtherVersion: "Según la política de seguridad de la cadena de suministro de pnpm (minimumReleaseAge), las versiones publicadas más recientemente que la antigüedad requerida no se instalan automáticamente, por lo que esta instalación utilizó {installed} en lugar de la última versión {version}. Una versión recién publicada no ha completado este período de espera y puede contener códigos maliciosos o defectos no detectados. Si necesita {version}, desinstale la versión actual y luego instale {exact} para solicitar esa versión.",
			installApprovalTitle: "Instalar scripts necesita permiso",
			installApprovalDescription: "Estos paquetes tienen scripts de instalación que pnpm no ejecutó.",
			installApprovalConsequence: "Una vez permitidos, los scripts se ejecutan aquí con sus permisos y el permiso se guarda en este perfil.",
			installApprovalCaution: "Permita solo paquetes en los que confíe.",
			installApproveAndRetry: "Permita estos scripts y vuelva a intentarlo",
			installClose: "hecho",
			close: "Cerrar",
			cancel: "Cancelar",
			confirmUninstallTitle: "¿Desinstalar \"{name}\"?",
			confirmUninstallDescription: "Lo que proporciona desaparece una vez que se desinstala.",
			confirmUninstall: "Desinstalar",
			failedEnable: "No se pudo habilitar: {reason}",
			failedDisable: "No se pudo desactivar: {reason}",
			failedUninstall: "No se pudo desinstalar: {reason}",
			failedRowEnable: "No se pudo habilitar el componente: {reason}",
			failedRowDisable: "No se pudo desactivar el componente: {reason}",
			reasonManagementRequired: "La gestión de complementos lo necesita; no se puede apagar ni desinstalar.",
			reasonUnaddressable: "El parche de perfil no puede abordar este de forma única.",
			reasonUnknownPlugin: "No existe tal complemento.",
			reasonInvalidSpec: "Ingrese un nombre o dirección de paquete válido.",
			reasonAlreadyInstalled: "Este paquete ya está instalado; desinstálelo antes de instalar otra versión.",
			reasonAmbiguousInstall: "No se puede saber qué paquete se instaló a partir del cambio de dependencia.",
			reasonNotBundle: "Este paquete no declara ningún paquete, por lo que no se puede administrar como un complemento.",
			reasonNotRemovable: "Este paquete no es propiedad del perfil o la administración del complemento lo necesita.",
			reasonStopProfile: "Este perfil se ejecuta sin HMR; deténgalo y desinstale el paquete con el complemento dsh.",
			reasonBundleInUse: "Otra configuración todavía usa los componentes de este paquete; apáguelos primero.",
			reasonStaleApproval: "Las aprobaciones de guiones pendientes cambiaron; instálelo nuevamente para actualizarlos.",
			reasonIncompatibleVersion: "{plugin} es incompatible con DSH {runtime} (requiere {requirements}); ejecutarlo puede causar fallas o pérdida de datos.",
			reasonIncompatibleVersionUnnamed: "Este complemento es incompatible con la versión DSH en ejecución; ejecutarlo puede causar fallas o pérdida de datos.",
			reasonIncompatibleInstall: "Instale una versión del complemento compatible con este DSH.",
			reasonIncompatibleInstalled: "Desinstálalo e instala una versión compatible con este DSH.",
			reasonOperationError: "El anfitrión informó un error.",
			detailTitle: "Detalles",
			detailLoading: "Detalles de lectura",
			detailTooLarge: "Los detalles exceden el límite de tamaño y no se cargaron.",
			detailNetwork: "No se pudo llegar a la fuente de los detalles.",
			detailInvalid: "El complemento declara un archivo de detalles no válido.",
			detailFailed: "No se pudieron leer los detalles.",
			detailFootnotes: "Notas a pie de página"
		};
		/** French dictionary, checked against the English keys. */
		const fr = {
			panel: "Plugins",
			title: "Plugins",
			intro: "Installer, activer et configurer les plugins",
			infoLabel: "À propos des plugins",
			infoDescription: "Configurez les plugins officiels et installez ou gérez d'autres plugins ici. Affichez la liste des plugins intégrés et l'état d'exécution dans Paramètres → Plugins intégrés.",
			loading: "Plugins de lecture…",
			error: "Impossible de lire tous les plugins, probablement à cause d'un problème de réseau",
			unavailable: "Ce déploiement s'exécute sans profil gérable, les plugins ne peuvent donc pas être installés ou commutés ici.",
			retry: "Réessayer",
			refresh: "Actualiser",
			refreshError: "L'actualisation a échoué. Veuillez réessayer.",
			empty: "Aucun plugin n'est encore installé.",
			addPlugin: "Ajouter un plugin",
			chooseAddMethod: "Choisissez comment ajouter un plugin",
			installExisting: "Installer un plugin tiers",
			installExistingDescription: "Prend en charge les packages npm, les référentiels Git et les répertoires locaux",
			restartNotice: "Redémarrez DSH pour appliquer la modification. {reason}",
			restartReasonNoHmr: "Ce profil applique les modifications uniquement au démarrage.",
			restartReasonPackageMoved: "Un package installé est désormais résolu dans un autre répertoire ou la modification remplace un package fourni par l'installation de DSH. Désinstallez un package avant de l’installer à partir d’un autre emplacement.",
			restartReasonHostModule: "Le changement atteint les modules DSH lui-même chargés.",
			restartReasonUnmanagedPlugin: "La modification atteint un plugin exécuté en dehors de la liste des plugins.",
			restartReasonModuleComparison: "DSH n'a pas pu comparer les plugins chargés avec leurs fichiers.",
			overriddenNotice: "{name} a été enregistré, mais une configuration de priorité plus élevée l'écrase, elle n'est donc pas effective",
			bundlesTitle: "Plugins installés",
			basicTitle: "Paramètres du plugin intégré",
			extensionsTitle: "Plugins expérimentaux",
			moreTitle: "Plugins expérimentaux",
			moreAction: "Plus",
			tabsLabel: "Vues des plugins",
			installedTab: "Installé",
			statusProblem: "Problème",
			statusBeta: "Expérimental",
			reasonLabel: "Raison",
			metadataError: "Erreur de métadonnées du package\xA0: {error}",
			versionTag: "v{version}",
			partsLabel: "Composants",
			sourceTitle: "Source",
			sourceSpec: "Source du code",
			sourceBuiltIn: "Intégré",
			sourceVersion: "Version actuelle",
			partsEmpty: "Ce pack de plugins ne contient aucun composant.",
			partsCountTotal: "Total {count}",
			partsCountRunning: "{count} en cours d'exécution",
			partsCountOff: "{count} désactivé",
			partOff: "Désactivé",
			partsCountFailed: "Échec du {count}",
			partsFilter: "Composants du filtre",
			partsFilterEmpty: "Aucun composant ne correspond.",
			partToggle: "Activer le composant {name}",
			rowPhasePending: "En attente de dépendances",
			rowPhaseLoading: "Chargement",
			rowPhaseActive: "Courir",
			rowPhaseFailed: "Problème",
			rowPhaseUnloading: "Déchargement",
			enableToggle: "Activer {name}",
			applyingChange: "Application des modifications à {name}",
			openDetail: "Voir {name}",
			backToList: "Retour aux plugins",
			crumbRoot: "Plugins",
			backToPackage: "Retour à {name}",
			configureRow: "Configurer {name}",
			rowStateIdle: "Ne fonctionne pas",
			uninstall: "Désinstaller",
			uninstallLabel: "Désinstaller {name}",
			installTitle: "Ajouter un plugin",
			installDescription: "Entrez le nom du package du plugin, l'adresse du référentiel GitHub ou le chemin du répertoire local.",
			installSpecLabel: "Nom ou adresse du colis",
			installSpecPlaceholder: "par exemple dsh-plugin-whale-pet",
			installGuideToggle: "Guide d'installation et exemples",
			installGuideHide: "Masquer le guide",
			installGuideIdTitle: "Entrez le nom du package npm du plugin",
			installGuideIdExample: "dsh-plugin-baleine-animal de compagnie",
			installGuideIdHint: "Le nom du package du plugin est le nom du package npm (comme dsh-xxx ou @author/plugin) : la partie après dsh plugin add ou pnpm add dans la commande d'installation README d'un plugin communautaire.",
			installGuideExampleLabel: "Exemple\xA0: ",
			installGitTemplateHint: "Remplacez-le par l'adresse réelle du référentiel Git.",
			installPathTemplateHint: "Remplacez-le par le chemin réel vers votre répertoire de plugin local.",
			installGuideFill: "Utiliser l'exemple",
			installGuideFillAria: "Utilisez l'exemple {example}",
			installGuideSafety: "Installez uniquement les plugins en qui vous avez confiance\xA0: ils s'exécutent avec vos autorisations et peuvent endommager DeepSeek Harness ou divulguer vos données.",
			installUpgradeNotice: "Les plugins officiels à la demande proposent la mise à jour lorsque leur version diffère de DSH. Pour mettre à jour d'autres plugins, désinstallez-les et réinstallez-les.",
			registryToggle: "Registre",
			registryLegend: "Le registre npm à partir duquel le plugin est téléchargé",
			registryDefault: "Registre par défaut",
			registryOfficial: "Registre officiel npm",
			registryNpmmirror: "Miroir de Chine continentale",
			registryCustom: "Adresse personnalisée",
			registryCustomPlaceholder: "https://npm.example.com/",
			registryCustomHint: "Entrez une adresse de registre npm interne ou privée commençant par http:// ou https://.. Si cela nécessite une connexion, stockez les informations d'identification dans ~/.npmrc sur cette machine.",
			registryCustomInvalid: "Saisissez une adresse commençant par http:// ou https://",
			registryListSeparator: ", ",
			sentenceSeparator: "  ",
			installRun: "Installer",
			installChecking: "Vérification…",
			installConfirmedTitle: "Installer le plug-in",
			installConfirmedRefused: "Ce plugin ne peut pas être installé",
			installProblemInvalid: "Il ne s'agit pas d'un nom ou d'une adresse de package pouvant être installé\xA0: {reason}",
			installProblemInstalled: "Ce plugin est déjà installé. Pour le mettre à niveau, désinstallez-le et réinstallez-le",
			installProblemShipped: "Ce plugin est livré avec DSH\xA0; la mise à niveau de DSH le met à jour",
			installBundledTitle: "Ce plugin est livré avec DSH",
			installBundledDescription: "Activez-le sans télécharger une autre copie",
			installProblemNotFound: "Aucun plugin de ce type n'a été trouvé",
			installProblemNotPackage: "Le chemin n'existe pas ou n'est pas un package de plugin valide",
			installProblemNotBundle: "Ce package ne déclare aucun bundle, il ne peut donc pas être installé en tant que plugin\xA0: {reason}",
			installProblemNetwork: "Le registre du plugin n'a pas pu être atteint\xA0; vérifie le réseau et réessaye",
			installProblemNetworkAll: "Aucun registre n'a pu être atteint (essayé\xA0: {registries})\xA0; vérifiez les paramètres réseau ou proxy, ou modifiez le registre",
			installProblemUnknown: "Le plugin n'a pas pu être recherché\xA0: {reason}",
			installingTitle: "Installation du plugin…",
			installedTitle: "Installé",
			statusNotInstalled: "Non installé",
			statusMissingFiles: "Forfait indisponible",
			statusUpdateAvailable: "Mise à jour disponible",
			sourceNotInstalled: "Non installé",
			sourceTargetSpec: "Source pour ce DSH",
			sourceTargetVersion: "Version pour ce DSH",
			update: "Mise à jour",
			updateLabel: "Mettre à jour {name}",
			versionsTitle: "Versions",
			versionsRecheck: "Vérifiez à nouveau",
			versionsChecking: "Vérification des mises à jour",
			versionsAvailable: "Mise à jour vers {version} disponible",
			versionsPublished: "Publié {date}",
			versionsLatest: "À jour",
			versionsCheckedAt: "Dernière vérification à {time}",
			versionsBlocked: "Les versions plus récentes nécessitent une mise à jour DSH",
			versionsBlockedDetail: "{version} a besoin de {peers}\xA0; ce DSH est {runtime}",
			versionsNoneInstallable: "Aucune version plus récente à installer directement",
			versionsNoneInstallableDetail: "Les versions les plus récentes sont obsolètes, sont des versions préliminaires ou ne déclarent aucun bundle. Agrandissez pour les voir",
			versionsFailedNetwork: "Impossible d'accéder au registre",
			versionsFailedOther: "Impossible de vérifier les mises à jour",
			versionsDetails: "Détails",
			versionsNewerCount: "{count} plus récent",
			versionsCollapse: "Réduire",
			versionsInstalledTag: "Installé",
			versionsPrereleaseTag: "Avant-première",
			versionsDeprecatedTag: "Obsolète",
			versionsNeedsDsh: "Besoins {peers}",
			versionsNotBundle: "Cette version ne déclare aucun bundle et ne peut pas être installée",
			versionsUpdateLabel: "Mise à jour vers {version}",
			versionsRegistry: "Registre",
			versionsCheckedAtLabel: "Vérifié à",
			versionsFallbackTag: "Repli",
			versionsFallbackHint: "{registry} n'a pas pu être atteint\xA0; la liste provient d'un registre de secours",
			versionsPrimaryTag: "D'abord",
			versionsShowPrerelease: "Afficher les avant-premières",
			versionsOmitted: "{count} et les versions plus récentes que celle installée ne sont pas répertoriées",
			versionsProblemNetwork: "Injoignable",
			versionsProblemNotFound: "Pas trouvé",
			versionsProblemUnknown: "Échec",
			updatesAvailable: "Mises à jour disponibles\xA0: {count}",
			updatesNone: "Tous les plugins sont à jour",
			updatesFailed: "Certains plugins n'ont pas pu être vérifiés",
			updateTitle: "Mettre à jour {name}",
			updateSource: "Installer à partir de",
			updateDescription: "La mise à jour remplace {from} par {to} ; le plugin peut s'arrêter brièvement. Si l'installation échoue, {from} est conservé ou réinstallé.",
			updateRunning: "Mise à jour",
			updateStepChecking: "Vérifiez {version}",
			updateStepRemoving: "Arrêtez et supprimez {version}",
			updateStepInstalling: "Installez {version} à partir de {registry}",
			updateStepRestoring: "Installez à nouveau {version}",
			updateDone: "Mis à jour vers {version}",
			updateDoneDetail: "La nouvelle version est en cours d'exécution.",
			updateRestart: "{version} installé\xA0; cela prend effet après un redémarrage",
			updateRefused: "Impossible de mettre à jour vers {version}",
			updateRemoveFailed: "Impossible de supprimer {version}",
			updateRestored: "La mise à jour a échoué\xA0; restauré {version}",
			updateRestoredDetail: "Échec de l'installation de {to}\xA0; {from} a été réinstallé.",
			updateKept: "Impossible de mettre à jour vers {version}",
			updateKeptDetail: "{from} n’a pas été supprimé et reste utilisé. {reason}",
			updateBroken: "La mise à jour a échoué\xA0; le plugin n'est pas installé",
			updateBrokenDetail: "L'installation de {to} a échoué et l'installation de {from} a également échoué. Installez à nouveau {name} à partir d'Ajouter un plugin.",
			updateLost: "Le résultat de la mise à jour est inconnu",
			updateLostDetail: "La connexion à DSH a été interrompue : {reason}. Actualisez la liste des plugins pour voir la version installée.",
			updateOutput: "Afficher le résultat de l'installation",
			updateFinish: "Terminé",
			installFailedTitle: "Le plugin n'a pas pu être installé",
			installGithubFailedTitle: "Impossible d'accéder à GitHub",
			installGithubTimeoutTitle: "La connexion GitHub a expiré",
			installGithubFailedDescription: "Essayez une autre source d'installation.",
			installUseGithubMirror: "Utiliser un miroir de Chine continentale",
			installTryAnotherWay: "Essayez une autre façon",
			installPackageLabel: "Nom du package du plugin",
			installEdit: "Modifier",
			installEditAria: "Retour à l'édition",
			installCancelAndEdit: "Annuler l'installation et revenir à l'édition",
			installApplyingCancellationError: "L'annulation n'a pas été confirmée. L'installation est en cours d'application\xA0; attendre son résultat. {reason}",
			installReconcile: "Vérifier l'état de l'installation",
			installUnknownTitle: "Résultat de l'installation indisponible",
			installUnknownDescription: "L'hôte n'a aucune installation active avec cet identifiant de demande. Vérifiez la liste des plugins avant de réessayer.",
			installResultUnconfirmed: "Le résultat de l'installation n'a pas été reçu. Vérifiez l'état de l'installation. {reason}",
			installAwaitingAcceptance: "En attente que l'hôte accepte l'installation. L'annulation sera réessayée automatiquement après confirmation.",
			installBackgroundUnknown: "Résultat de l'installation indisponible. Vérifiez la liste des plugins.",
			installCancel: "Annuler l'installation",
			installCloseCancels: "Annuler l'installation et fermer",
			installViewTask: "Voir l'installation",
			installUnconfirmedTitle: "État de l'installation non confirmé",
			installBackgroundDone: "Installation terminée. Afficher les détails de l'installation.",
			installBackgroundFailed: "L'installation a échoué. Afficher les détails de l'installation.",
			installBackgroundUnconfirmed: "L'état de l'installation n'est pas confirmé. Consultez l'installation pour plus de détails.",
			installBackgroundApplying: "L'installation est en cours d'application et ne peut pas être annulée. Afficher la progression de l'installation.",
			installStarting: "Préparation de l'installation…",
			installCancelling: "Arrêt de l'installation…",
			installApplying: "Application de la configuration, veuillez patienter…",
			installCancelledShort: "Annulé",
			installCancelled: "Installation annulée\xA0; le plugin n'est pas activé et les fichiers téléchargés peuvent rester",
			installCancelUnconfirmed: "L'installation n'a pas été confirmée arrêtée. Réessayez l'annulation ou attendez le résultat de l'installation. {reason}",
			installEnableNow: "Activer maintenant",
			installDetailsShow: "Afficher les détails de l'installation",
			installDetailsHide: "Masquer les détails de l'installation",
			installVersion: "Version {version}",
			installSubjectPath: "Annuaire local",
			installSubjectGit: "Dépôt Git",
			installSubjectTarball: "Tarball",
			installLocation: "S'installe dans {dir}",
			installRetry: "Réessayer",
			installChangeRegistry: "Changer de registre",
			installAttempt: "{previous} n'a pas pu servir le package\xA0; nouvelle tentative via {registry} (registre {index} de {total})",
			installAttemptBadge: "Tentative {index} · {registry}",
			installFailureNetwork: "La connexion réseau a échoué",
			installFailureNetworkAll: "Aucun registre n'a pu être atteint (essayé : {registries}). Vérifiez les paramètres réseau ou proxy, ou modifiez le registre et réessayez.",
			installFailureNetworkHost: "{host} n'a pas pu être atteint. Une adresse GitHub ou un lien .tgz ne sont pas récupérés via le registre : cette machine doit y accéder directement ou via un proxy. Si le plugin est également publié sur npm, saisissez plutôt le nom de son package.",
			installFailureNotFound: "Aucun plugin de ce type n'a été trouvé",
			installFailureNoMatchingVersion: "Aucune version ne correspond à la demande",
			installFailureDiskFull: "Le disque est plein ; l'installation s'est arrêtée",
			installFailurePermission: "Aucune autorisation d'écriture\xA0; le plugin ne peut pas être installé",
			installFailureBuildBlocked: "Les scripts d'installation d'une dépendance ont besoin de votre autorisation avant que l'installation puisse continuer",
			installFailureBuildBlockedManual: "pnpm a bloqué les scripts d'installation\xA0; autorisez-les sous AllowBuilds dans pnpm-workspace.yaml et réessayez",
			installFailureIntegrity: "Le package téléchargé a échoué à sa vérification d'intégrité",
			installFailureTimeout: "L'installation a expiré",
			installFailurePnpmMissing: "pnpm n'a pas été trouvé, donc rien ne peut être installé",
			installFailureGeneric: "Quelque chose s'est mal passé lors de l'installation\xA0; les détails disent quoi",
			terminalCommandLine: "Ligne de commande {n}",
			terminalRunning: "Courir",
			terminalFailed: "Échec",
			terminalDone: "Terminé",
			terminalCopy: "Copier",
			terminalCopied: "Copié",
			terminalNoOutput: "Aucune sortie",
			terminalCollapseAria: "Réduire la sortie",
			terminalCollapse: "Réduire",
			terminalExpandAria: "Développez les lignes de sortie {n} restantes",
			terminalExpand: "… {n} plus de lignes",
			terminalExitCode: "code de sortie {code}",
			terminalSignal: "signal {signal}",
			terminalNoExitCode: "pas de code de sortie",
			installDoneNothing: "Installation terminée sans nouvelle dépendance.",
			installDoneRestart: "Installé\xA0; redémarrez DSH pour le charger. {reason}",
			installDoneApproved: "Scripts d'installation autorisés pour {names}",
			installDoneOtherVersion: "Conformément à la politique de sécurité de la chaîne d'approvisionnement de pnpm (minimumReleaseAge), les versions publiées plus récemment que l'âge requis ne sont pas installées automatiquement. Cette installation a donc utilisé {installed} au lieu de la dernière version {version}. Une version nouvellement publiée n'a pas dépassé cette période d'attente et peut contenir du code malveillant ou des défauts non détectés. Si vous avez besoin de {version}, désinstallez la version actuelle, puis installez {exact} pour demander cette version.",
			installApprovalTitle: "Les scripts d'installation nécessitent une autorisation",
			installApprovalDescription: "Ces packages contiennent des scripts d'installation que pnpm n'a pas exécutés.",
			installApprovalConsequence: "Une fois autorisés, les scripts s'exécutent ici avec vos autorisations et l'autorisation est enregistrée dans ce profil.",
			installApprovalCaution: "Autorisez uniquement les packages auxquels vous faites confiance.",
			installApproveAndRetry: "Autoriser ces scripts et réessayer",
			installClose: "Terminé",
			close: "Fermer",
			cancel: "Annuler",
			confirmUninstallTitle: "Désinstaller \"{name}\"\xA0?",
			confirmUninstallDescription: "Ce qu'il fournit disparaît une fois désinstallé.",
			confirmUninstall: "Désinstaller",
			failedEnable: "Impossible d'activer\xA0: {reason}",
			failedDisable: "Impossible de désactiver\xA0: {reason}",
			failedUninstall: "Impossible de désinstaller\xA0: {reason}",
			failedRowEnable: "Impossible d'activer le composant\xA0: {reason}",
			failedRowDisable: "Impossible de désactiver le composant\xA0: {reason}",
			reasonManagementRequired: "La gestion des plugins en a besoin\xA0; il ne peut pas être éteint ou désinstallé.",
			reasonUnaddressable: "Le correctif de profil ne peut pas résoudre ce problème de manière unique.",
			reasonUnknownPlugin: "Aucun plugin de ce type.",
			reasonInvalidSpec: "Entrez un nom ou une adresse de package valide.",
			reasonAlreadyInstalled: "Ce package est déjà installé ; désinstallez-le avant d'installer une autre version.",
			reasonAmbiguousInstall: "Le changement de dépendance ne permet pas de déterminer quel package a été installé.",
			reasonNotBundle: "Ce package ne déclare aucun bundle, il ne peut donc pas être géré comme un plugin.",
			reasonNotRemovable: "Ce package n'appartient pas au profil, ou la gestion des plugins en a besoin.",
			reasonStopProfile: "Ce profil s'exécute sans HMR\xA0; arrêtez-le et désinstallez le package avec le plugin dsh.",
			reasonBundleInUse: "Une autre configuration utilise toujours les composants de ce bundle\xA0; éteignez-les d'abord.",
			reasonStaleApproval: "Les approbations de script en attente ont changé\xA0; réinstallez-les pour les actualiser.",
			reasonIncompatibleVersion: "{plugin} est incompatible avec DSH {runtime} (nécessite {requirements}) ; son exécution peut provoquer des plantages ou une perte de données.",
			reasonIncompatibleVersionUnnamed: "Ce plugin est incompatible avec la version DSH en cours d'exécution\xA0; son exécution peut provoquer des plantages ou une perte de données.",
			reasonIncompatibleInstall: "Installez une version du plugin compatible avec ce DSH.",
			reasonIncompatibleInstalled: "Désinstallez-le et installez une version compatible avec ce DSH.",
			reasonOperationError: "L'hôte a signalé une erreur.",
			detailTitle: "Détails",
			detailLoading: "Détails de lecture",
			detailTooLarge: "Les détails dépassent la limite de taille et n'ont pas été chargés.",
			detailNetwork: "Impossible d'atteindre la source des détails.",
			detailInvalid: "Le plugin déclare un fichier de détails invalide.",
			detailFailed: "Impossible de lire les détails.",
			detailFootnotes: "Notes de bas de page"
		};
		/** German dictionary, checked against the English keys. */
		const de = {
			panel: "Plugins",
			title: "Plugins",
			intro: "Plugins installieren, aktivieren und konfigurieren",
			infoLabel: "Über Plugins",
			infoDescription: "Konfigurieren Sie hier offizielle Plugins und installieren oder verwalten Sie andere Plugins. Sehen Sie sich die Liste der integrierten Plugins und den Laufzeitstatus unter Einstellungen → Integrierte Plugins an.",
			loading: "Plugins lesen…",
			error: "Es konnten nicht alle Plugins gelesen werden, möglicherweise aufgrund eines Netzwerkproblems",
			unavailable: "Diese Bereitstellung läuft ohne verwaltbares Profil, daher können hier keine Plugins installiert oder gewechselt werden.",
			retry: "Erneut versuchen",
			refresh: "Aktualisieren",
			refreshError: "Aktualisierung fehlgeschlagen. Bitte versuchen Sie es erneut.",
			empty: "Es sind noch keine Plugins installiert.",
			addPlugin: "Plugin hinzufügen",
			chooseAddMethod: "Wählen Sie aus, wie Sie ein Plugin hinzufügen möchten",
			installExisting: "Installieren Sie ein Drittanbieter-Plugin",
			installExistingDescription: "Unterstützt npm-Pakete, Git-Repositorys und lokale Verzeichnisse",
			restartNotice: "Starten Sie DSH neu, um die Änderung zu übernehmen. {reason}",
			restartReasonNoHmr: "Dieses Profil wendet Änderungen nur beim Start an.",
			restartReasonPackageMoved: "Ein installiertes Paket wird nun in ein anderes Verzeichnis aufgelöst, oder die Änderung ersetzt ein Paket, das die DSH-Installation bereitstellt. Deinstallieren Sie ein Paket, bevor Sie es von einem anderen Speicherort installieren.",
			restartReasonHostModule: "Die Änderung erreicht die geladenen Module DSH selbst.",
			restartReasonUnmanagedPlugin: "Die Änderung betrifft ein Plugin, das außerhalb der Plugin-Liste ausgeführt wird.",
			restartReasonModuleComparison: "DSH konnte die geladenen Plugins nicht mit ihren Dateien vergleichen.",
			overriddenNotice: "{name} wurde gespeichert, aber eine Konfiguration mit höherer Priorität überschreibt es, sodass es nicht wirksam ist",
			bundlesTitle: "Installierte Plugins",
			basicTitle: "Integrierte Plugin-Einstellungen",
			extensionsTitle: "Experimentelle Plugins",
			moreTitle: "Experimentelle Plugins",
			moreAction: "Mehr",
			tabsLabel: "Plugin-Ansichten",
			installedTab: "Installiert",
			statusProblem: "Problem",
			statusBeta: "Experimentell",
			reasonLabel: "Grund",
			metadataError: "Paketmetadatenfehler: {error}",
			versionTag: "v{version}",
			partsLabel: "Komponenten",
			sourceTitle: "Quelle",
			sourceSpec: "Codequelle",
			sourceBuiltIn: "Eingebaut",
			sourceVersion: "Aktuelle Version",
			partsEmpty: "Dieses Plugin-Paket enthält keine Komponenten.",
			partsCountTotal: "{count} insgesamt",
			partsCountRunning: "{count} läuft",
			partsCountOff: "{count} aus",
			partOff: "Aus",
			partsCountFailed: "{count} ist fehlgeschlagen",
			partsFilter: "Komponenten filtern",
			partsFilterEmpty: "Keine Komponentenübereinstimmungen.",
			partToggle: "Aktivieren Sie die Komponente {name}",
			rowPhasePending: "Warten auf Abhängigkeiten",
			rowPhaseLoading: "Laden",
			rowPhaseActive: "Laufen",
			rowPhaseFailed: "Problem",
			rowPhaseUnloading: "Entladen",
			enableToggle: "Aktivieren Sie {name}",
			applyingChange: "Anwenden von Änderungen auf {name}",
			openDetail: "Siehe {name}",
			backToList: "Zurück zu Plugins",
			crumbRoot: "Plugins",
			backToPackage: "Zurück zu {name}",
			configureRow: "Konfigurieren Sie {name}",
			rowStateIdle: "Läuft nicht",
			uninstall: "Deinstallieren",
			uninstallLabel: "Deinstallieren Sie {name}",
			installTitle: "Plugin hinzufügen",
			installDescription: "Geben Sie den Paketnamen des Plugins, die GitHub-Repository-Adresse oder den lokalen Verzeichnispfad ein.",
			installSpecLabel: "Name oder Adresse des Pakets",
			installSpecPlaceholder: "zum Beispiel dsh-plugin-whale-pet",
			installGuideToggle: "Installationsanleitung und Beispiele",
			installGuideHide: "Verstecke den Leitfaden",
			installGuideIdTitle: "Geben Sie den NPM-Paketnamen des Plugins ein",
			installGuideIdExample: "dsh-plugin-whale-pet",
			installGuideIdHint: "Der Plugin-Paketname ist der npm-Paketname (wie dsh-xxx oder @author/plugin): der Teil nach dshplugin add oder pnpm add im README-Installationsbefehl eines Community-Plugins.",
			installGuideExampleLabel: "Beispiel: ",
			installGitTemplateHint: "Ersetzen Sie dies durch die tatsächliche Git-Repository-Adresse.",
			installPathTemplateHint: "Ersetzen Sie dies durch den tatsächlichen Pfad zu Ihrem lokalen Plugin-Verzeichnis.",
			installGuideFill: "Beispiel verwenden",
			installGuideFillAria: "Verwenden Sie das Beispiel {example}",
			installGuideSafety: "Installieren Sie nur Plugins, denen Sie vertrauen: Sie werden mit Ihren Berechtigungen ausgeführt und können DeepSeek Harness beschädigen oder Ihre Daten preisgeben.",
			installUpgradeNotice: "Offizielle On-Demand-Plugins bieten Updates an, wenn ihre Version von DSH abweicht. Um andere Plugins zu aktualisieren, deinstallieren Sie sie und installieren Sie sie erneut.",
			registryToggle: "Registrierung",
			registryLegend: "Die NPM-Registrierung, aus der das Plugin heruntergeladen wird",
			registryDefault: "Standardregistrierung",
			registryOfficial: "Offizielle npm-Registrierung",
			registryNpmmirror: "Spiegel vom chinesischen Festland",
			registryCustom: "Benutzerdefinierte Adresse",
			registryCustomPlaceholder: "https://npm.example.com/",
			registryCustomHint: "Geben Sie eine interne oder private NPM-Registrierungsadresse ein, beginnend mit http:// oder https://.. Wenn eine Anmeldung erforderlich ist, speichern Sie die Anmeldeinformationen in ~/.npmrc auf diesem Computer.",
			registryCustomInvalid: "Geben Sie eine Adresse ein, die mit http:// oder https:// beginnt.",
			registryListSeparator: ", ",
			sentenceSeparator: "  ",
			installRun: "Installieren",
			installChecking: "Überprüfen…",
			installConfirmedTitle: "Plugin installieren",
			installConfirmedRefused: "Dieses Plugin kann nicht installiert werden",
			installProblemInvalid: "Dies ist kein Paketname oder keine Adresse, die installiert werden kann: {reason}",
			installProblemInstalled: "Dieses Plugin ist bereits installiert. Um es zu aktualisieren, deinstallieren Sie es und installieren Sie es erneut",
			installProblemShipped: "Dieses Plugin wird mit DSH geliefert; Durch das Aktualisieren von DSH wird es aktualisiert",
			installBundledTitle: "Dieses Plugin wird mit DSH geliefert",
			installBundledDescription: "Aktivieren Sie es, ohne eine weitere Kopie herunterzuladen",
			installProblemNotFound: "Es wurde kein solches Plugin gefunden",
			installProblemNotPackage: "Der Pfad existiert nicht oder ist kein gültiges Plugin-Paket",
			installProblemNotBundle: "Dieses Paket deklariert kein Bundle und kann daher nicht als Plugin installiert werden: {reason}",
			installProblemNetwork: "Die Plugin-Registrierung konnte nicht erreicht werden; Überprüfen Sie das Netzwerk und versuchen Sie es erneut",
			installProblemNetworkAll: "Es konnte keine Registry erreicht werden (versucht: {registries}); Überprüfen Sie die Netzwerk- oder Proxy-Einstellungen oder ändern Sie die Registrierung",
			installProblemUnknown: "Das Plugin konnte nicht gefunden werden: {reason}",
			installingTitle: "Plugin installieren…",
			installedTitle: "Installiert",
			statusNotInstalled: "Nicht installiert",
			statusMissingFiles: "Paket nicht verfügbar",
			statusUpdateAvailable: "Update verfügbar",
			sourceNotInstalled: "Nicht installiert",
			sourceTargetSpec: "Quelle hierfür DSH",
			sourceTargetVersion: "Version für dieses DSH",
			update: "Aktualisieren",
			updateLabel: "Aktualisieren Sie {name}",
			versionsTitle: "Versionen",
			versionsRecheck: "Überprüfen Sie es noch einmal",
			versionsChecking: "Suche nach Updates",
			versionsAvailable: "Update auf {version} verfügbar",
			versionsPublished: "Veröffentlicht {date}",
			versionsLatest: "Auf dem neuesten Stand",
			versionsCheckedAt: "Zuletzt überprüft bei {time}",
			versionsBlocked: "Neuere Versionen benötigen ein DSH-Update",
			versionsBlockedDetail: "{version} benötigt {peers}; dieser DSH ist {runtime}",
			versionsNoneInstallable: "Keine neuere Version zur direkten Installation",
			versionsNoneInstallableDetail: "Die neueren Versionen sind veraltet, Vorabversionen oder deklarieren kein Bundle. Erweitern Sie, um sie zu sehen",
			versionsFailedNetwork: "Die Registrierung konnte nicht erreicht werden",
			versionsFailedOther: "Es konnte nicht nach Updates gesucht werden",
			versionsDetails: "Details",
			versionsNewerCount: "{count} neuer",
			versionsCollapse: "Einklappen",
			versionsInstalledTag: "Installiert",
			versionsPrereleaseTag: "Vorabversion",
			versionsDeprecatedTag: "Veraltet",
			versionsNeedsDsh: "Benötigt {peers}",
			versionsNotBundle: "Diese Version deklariert kein Bundle und kann nicht installiert werden",
			versionsUpdateLabel: "Update auf {version}",
			versionsRegistry: "Registrierung",
			versionsCheckedAtLabel: "Geprüft bei",
			versionsFallbackTag: "Rückfall",
			versionsFallbackHint: "{registry} konnte nicht erreicht werden; Die Liste stammt aus einer Fallback-Registrierung",
			versionsPrimaryTag: "Erstens",
			versionsShowPrerelease: "Vorabversionen anzeigen",
			versionsOmitted: "{count} Weitere Versionen, die neuer als die installierte sind, werden nicht aufgeführt",
			versionsProblemNetwork: "Unerreichbar",
			versionsProblemNotFound: "Nicht gefunden",
			versionsProblemUnknown: "Fehlgeschlagen",
			updatesAvailable: "Verfügbare Updates: {count}",
			updatesNone: "Alle Plugins sind auf dem neuesten Stand",
			updatesFailed: "Einige Plugins konnten nicht überprüft werden",
			updateTitle: "Aktualisieren Sie {name}",
			updateSource: "Installieren von",
			updateDescription: "Das Update ersetzt {from} durch {to}; Das Plugin stoppt möglicherweise kurzzeitig. Wenn die Installation fehlschlägt, bleibt {from} erhalten oder wird erneut installiert.",
			updateRunning: "Aktualisierung",
			updateStepChecking: "Überprüfen Sie {version}",
			updateStepRemoving: "Stoppen und entfernen Sie {version}",
			updateStepInstalling: "Installieren Sie {version} von {registry}",
			updateStepRestoring: "Installieren Sie {version} erneut",
			updateDone: "Aktualisiert auf {version}",
			updateDoneDetail: "Die neue Version läuft.",
			updateRestart: "{version} installiert; es wird erst nach einem Neustart wirksam",
			updateRefused: "Aktualisierung auf {version} nicht möglich",
			updateRemoveFailed: "{version} konnte nicht entfernt werden",
			updateRestored: "Aktualisierung fehlgeschlagen; wiederhergestellt {version}",
			updateRestoredDetail: "{to} konnte nicht installiert werden; {from} wurde erneut installiert.",
			updateKept: "Konnte nicht auf {version} aktualisiert werden",
			updateKeptDetail: "{from} wurde nicht entfernt und wird weiterhin verwendet. {reason}",
			updateBroken: "Aktualisierung fehlgeschlagen; Das Plugin ist nicht installiert",
			updateBrokenDetail: "Die Installation von {to} ist fehlgeschlagen, und auch die erneute Installation von {from} schlug fehl. Installieren Sie {name} erneut über Plugin hinzufügen.",
			updateLost: "Das Update-Ergebnis ist unbekannt",
			updateLostDetail: "Die Verbindung zu DSH wurde unterbrochen: {reason}. Aktualisieren Sie die Plugin-Liste, um die installierte Version anzuzeigen.",
			updateOutput: "Installationsausgabe anzeigen",
			updateFinish: "Fertig",
			installFailedTitle: "Das Plugin konnte nicht installiert werden",
			installGithubFailedTitle: "Auf GitHub kann nicht zugegriffen werden",
			installGithubTimeoutTitle: "Zeitüberschreitung bei der GitHub-Verbindung",
			installGithubFailedDescription: "Versuchen Sie es mit einer anderen Installationsquelle.",
			installUseGithubMirror: "Verwenden Sie einen Spiegel vom chinesischen Festland",
			installTryAnotherWay: "Versuchen Sie es anders",
			installPackageLabel: "Name des Plugin-Pakets",
			installEdit: "Bearbeiten",
			installEditAria: "Zurück zur Bearbeitung",
			installCancelAndEdit: "Brechen Sie die Installation ab und kehren Sie zur Bearbeitung zurück",
			installApplyingCancellationError: "Die Stornierung wurde nicht bestätigt. Installation wird angewendet; warte auf das Ergebnis. {reason}",
			installReconcile: "Überprüfen Sie den Installationsstatus",
			installUnknownTitle: "Installationsergebnis nicht verfügbar",
			installUnknownDescription: "Der Host verfügt über keine aktive Installation mit dieser Anforderungs-ID. Überprüfen Sie die Plugin-Liste, bevor Sie es erneut versuchen.",
			installResultUnconfirmed: "Das Installationsergebnis wurde nicht empfangen. Überprüfen Sie den Installationsstatus. {reason}",
			installAwaitingAcceptance: "Warten darauf, dass der Host die Installation akzeptiert. Die Stornierung wird nach der Bestätigung automatisch wiederholt.",
			installBackgroundUnknown: "Installationsergebnis nicht verfügbar. Überprüfen Sie die Plugin-Liste.",
			installCancel: "Installation abbrechen",
			installCloseCancels: "Installation abbrechen und schließen",
			installViewTask: "Installation ansehen",
			installUnconfirmedTitle: "Installationsstatus unbestätigt",
			installBackgroundDone: "Installation abgeschlossen. Installationsdetails anzeigen.",
			installBackgroundFailed: "Die Installation ist fehlgeschlagen. Installationsdetails anzeigen.",
			installBackgroundUnconfirmed: "Der Installationsstatus ist unbestätigt. Weitere Informationen finden Sie in der Installation.",
			installBackgroundApplying: "Die Installation wird ausgeführt und kann nicht abgebrochen werden. Installationsfortschritt anzeigen.",
			installStarting: "Installation vorbereiten…",
			installCancelling: "Installation wird gestoppt…",
			installApplying: "Konfiguration wird angewendet, bitte warten…",
			installCancelledShort: "Abgesagt",
			installCancelled: "Installation abgebrochen; Das Plugin ist nicht aktiviert und heruntergeladene Dateien bleiben möglicherweise bestehen",
			installCancelUnconfirmed: "Die Installation wurde nicht bestätigt und gestoppt. Versuchen Sie den Abbruch erneut oder warten Sie auf das Installationsergebnis. {reason}",
			installEnableNow: "Jetzt aktivieren",
			installDetailsShow: "Installationsdetails anzeigen",
			installDetailsHide: "Installationsdetails ausblenden",
			installVersion: "Version {version}",
			installSubjectPath: "Lokales Verzeichnis",
			installSubjectGit: "Git-Repository",
			installSubjectTarball: "Tarball",
			installLocation: "Wird in {dir} installiert",
			installRetry: "Erneut versuchen",
			installChangeRegistry: "Registrierung ändern",
			installAttempt: "{previous} konnte das Paket nicht bereitstellen; erneuter Versuch über {registry} (Registrierung {index} von {total})",
			installAttemptBadge: "Versuchen Sie {index} · {registry}",
			installFailureNetwork: "Die Netzwerkverbindung ist fehlgeschlagen",
			installFailureNetworkAll: "Es konnte keine Registry erreicht werden (versucht: {registries}). Überprüfen Sie die Netzwerk- oder Proxy-Einstellungen oder ändern Sie die Registrierung und versuchen Sie es erneut.",
			installFailureNetworkHost: "{host} konnte nicht erreicht werden. Eine GitHub-Adresse oder ein .tgz-Link wird nicht über die Registrierung abgerufen: Dieser Computer muss sie direkt oder über einen Proxy erreichen. Wenn das Plugin auch auf npm veröffentlicht wird, geben Sie stattdessen seinen Paketnamen ein.",
			installFailureNotFound: "Es wurde kein solches Plugin gefunden",
			installFailureNoMatchingVersion: "Keine Version entspricht der Anfrage",
			installFailureDiskFull: "Die Festplatte ist voll; Die Installation wurde gestoppt",
			installFailurePermission: "Keine Schreibberechtigung; Das Plugin kann nicht installiert werden",
			installFailureBuildBlocked: "Die Installationsskripte einer Abhängigkeit benötigen Ihre Erlaubnis, bevor die Installation fortgesetzt werden kann",
			installFailureBuildBlockedManual: "pnpm blockierte Installationsskripte; Erlauben Sie sie unter „allowBuilds“ in „pnpm-workspace.yaml“ und versuchen Sie es erneut",
			installFailureIntegrity: "Das heruntergeladene Paket hat die Integritätsprüfung nicht bestanden",
			installFailureTimeout: "Bei der Installation ist eine Zeitüberschreitung aufgetreten",
			installFailurePnpmMissing: "pnpm wurde nicht gefunden, daher kann nichts installiert werden",
			installFailureGeneric: "Bei der Installation ist ein Fehler aufgetreten. Die Details sagen was",
			terminalCommandLine: "Befehlszeile {n}",
			terminalRunning: "Laufen",
			terminalFailed: "Fehlgeschlagen",
			terminalDone: "Fertig",
			terminalCopy: "Kopieren",
			terminalCopied: "Kopiert",
			terminalNoOutput: "Keine Ausgabe",
			terminalCollapseAria: "Ausgabe reduzieren",
			terminalCollapse: "Einklappen",
			terminalExpandAria: "Erweitern Sie die verbleibenden {n}-Ausgabezeilen",
			terminalExpand: "… {n} weitere Zeilen",
			terminalExitCode: "Exit-Code {code}",
			terminalSignal: "Signal {signal}",
			terminalNoExitCode: "kein Exit-Code",
			installDoneNothing: "Die Installation ist ohne neue Abhängigkeit abgeschlossen.",
			installDoneRestart: "Installiert; Starten Sie DSH neu, um es zu laden. {reason}",
			installDoneApproved: "Für {names} zulässige Installationsskripte",
			installDoneOtherVersion: "Gemäß der Supply-Chain-Sicherheitsrichtlinie von pnpm (minimumReleaseAge) werden Versionen, die jünger als das erforderliche Alter veröffentlicht wurden, nicht automatisch installiert. Daher wurde bei dieser Installation {installed} anstelle der neuesten Version {version} verwendet. Eine neu veröffentlichte Version hat diese Wartezeit nicht durchlaufen und kann unerkannten Schadcode oder Mängel enthalten. Wenn Sie {version} benötigen, deinstallieren Sie die aktuelle Version und installieren Sie dann {exact}, um diese Version anzufordern.",
			installApprovalTitle: "Installationsskripte benötigen eine Genehmigung",
			installApprovalDescription: "Diese Pakete verfügen über Installationsskripte, die pnpm nicht ausgeführt hat.",
			installApprovalConsequence: "Sobald sie zugelassen sind, werden die Skripte hier mit Ihren Berechtigungen ausgeführt und die Berechtigung wird in diesem Profil gespeichert.",
			installApprovalCaution: "Lassen Sie nur Pakete zu, denen Sie vertrauen.",
			installApproveAndRetry: "Lassen Sie diese Skripte zu und versuchen Sie es erneut",
			installClose: "Fertig",
			close: "Schließen",
			cancel: "Abbrechen",
			confirmUninstallTitle: "„{name}“ deinstallieren?",
			confirmUninstallDescription: "Was es bietet, verschwindet, sobald es deinstalliert wird.",
			confirmUninstall: "Deinstallieren",
			failedEnable: "Konnte nicht aktiviert werden: {reason}",
			failedDisable: "Konnte nicht deaktiviert werden: {reason}",
			failedUninstall: "Konnte nicht deinstalliert werden: {reason}",
			failedRowEnable: "Die Komponente {reason} konnte nicht aktiviert werden",
			failedRowDisable: "Die Komponente {reason} konnte nicht deaktiviert werden",
			reasonManagementRequired: "Das Plugin-Management braucht es; Es kann nicht ausgeschaltet oder deinstalliert werden.",
			reasonUnaddressable: "Der Profil-Patch kann dieses Problem nicht eindeutig beheben.",
			reasonUnknownPlugin: "Kein solches Plugin.",
			reasonInvalidSpec: "Geben Sie einen gültigen Paketnamen oder eine gültige Paketadresse ein.",
			reasonAlreadyInstalled: "Dieses Paket ist bereits installiert; Deinstallieren Sie es, bevor Sie eine andere Version installieren.",
			reasonAmbiguousInstall: "Welches Paket installiert wurde, lässt sich anhand der Abhängigkeitsänderung nicht erkennen.",
			reasonNotBundle: "Dieses Paket deklariert kein Bundle und kann daher nicht als Plugin verwaltet werden.",
			reasonNotRemovable: "Dieses Paket gehört nicht dem Profil oder die Plugin-Verwaltung benötigt es.",
			reasonStopProfile: "Dieses Profil läuft ohne HMR; Stoppen Sie es und deinstallieren Sie das Paket mit dem dsh-Plugin.",
			reasonBundleInUse: "Andere Konfigurationen verwenden weiterhin die Komponenten dieses Bundles; Schalten Sie sie zuerst aus.",
			reasonStaleApproval: "Die ausstehenden Drehbuchgenehmigungen haben sich geändert; Installieren Sie es erneut, um sie zu aktualisieren.",
			reasonIncompatibleVersion: "{plugin} ist nicht kompatibel mit DSH {runtime} (erfordert {requirements}); Die Ausführung kann zu Abstürzen oder Datenverlust führen.",
			reasonIncompatibleVersionUnnamed: "Dieses Plugin ist nicht mit der laufenden DSH-Version kompatibel. Die Ausführung kann zu Abstürzen oder Datenverlust führen.",
			reasonIncompatibleInstall: "Installieren Sie eine mit diesem DSH kompatible Plugin-Version.",
			reasonIncompatibleInstalled: "Deinstallieren Sie es und installieren Sie eine mit diesem DSH kompatible Version.",
			reasonOperationError: "Der Host hat einen Fehler gemeldet.",
			detailTitle: "Details",
			detailLoading: "Details lesen",
			detailTooLarge: "Die Details überschreiten die Größenbeschränkung und wurden nicht geladen.",
			detailNetwork: "Die Quelle der Details konnte nicht erreicht werden.",
			detailInvalid: "Das Plugin deklariert eine ungültige Detaildatei.",
			detailFailed: "Die Details konnten nicht gelesen werden.",
			detailFootnotes: "Fußnoten"
		};
		/** Russian dictionary, checked against the English keys. */
		const ru = {
			panel: "Плагины",
			title: "Плагины",
			intro: "Установите, включите и настройте плагины",
			infoLabel: "О плагинах",
			infoDescription: "Настройте официальные плагины, а также установите или управляйте другими плагинами здесь. Посмотреть список встроенных плагинов и статус выполнения можно в разделе «Настройки» → «Встроенные плагины».",
			loading: "Чтение плагинов…",
			error: "Не удалось прочитать все плагины, возможно, из-за проблем с сетью.",
			unavailable: "Это развертывание выполняется без управляемого профиля, поэтому здесь нельзя устанавливать или переключать плагины.",
			retry: "Повторить",
			refresh: "Обновить",
			refreshError: "Обновить не удалось. Пожалуйста, попробуйте еще раз.",
			empty: "Плагины пока не установлены.",
			addPlugin: "Добавить плагин",
			chooseAddMethod: "Выберите, как добавить плагин",
			installExisting: "Установите сторонний плагин",
			installExistingDescription: "Поддерживает пакеты npm, репозитории Git и локальные каталоги.",
			restartNotice: "Перезапустите DSH, чтобы применить изменения. {reason}",
			restartReasonNoHmr: "Этот профиль применяет изменения только при запуске.",
			restartReasonPackageMoved: "Установленный пакет теперь разрешается в другой каталог, или изменение заменяет пакет, предоставляемый установкой DSH. Удалите пакет перед установкой его из другого места.",
			restartReasonHostModule: "Изменение доходит до загруженных модулей DSH.",
			restartReasonUnmanagedPlugin: "Изменение достигает плагина, работающего за пределами списка плагинов.",
			restartReasonModuleComparison: "DSH не смог сравнить загруженные плагины с их файлами.",
			overriddenNotice: "{name} был сохранен, но конфигурация с более высоким приоритетом переопределяет его, поэтому он не действует.",
			bundlesTitle: "Установленные плагины",
			basicTitle: "Встроенные настройки плагина",
			extensionsTitle: "Экспериментальные плагины",
			moreTitle: "Экспериментальные плагины",
			moreAction: "Ещё",
			tabsLabel: "Просмотры плагинов",
			installedTab: "Установлено",
			statusProblem: "Проблема",
			statusBeta: "Экспериментальный",
			reasonLabel: "Причина",
			metadataError: "Ошибка метаданных пакета: {error}.",
			versionTag: "v{version}",
			partsLabel: "Компоненты",
			sourceTitle: "Источник",
			sourceSpec: "Источник кода",
			sourceBuiltIn: "Встроенный",
			sourceVersion: "Текущая версия",
			partsEmpty: "Этот пакет плагинов не содержит компонентов.",
			partsCountTotal: "{count} всего",
			partsCountRunning: "{count} работает",
			partsCountOff: "{count} выкл.",
			partOff: "Выкл.",
			partsCountFailed: "{count} не удалось",
			partsFilter: "Компоненты фильтра",
			partsFilterEmpty: "Ни один компонент не соответствует.",
			partToggle: "Включить компонент {name}",
			rowPhasePending: "Ожидание зависимостей",
			rowPhaseLoading: "Загрузка",
			rowPhaseActive: "Бег",
			rowPhaseFailed: "Проблема",
			rowPhaseUnloading: "Разгрузка",
			enableToggle: "Включить {name}",
			applyingChange: "Применение изменений в {name}",
			openDetail: "Посмотреть {name}",
			backToList: "Вернуться к плагинам",
			crumbRoot: "Плагины",
			backToPackage: "Вернуться к {name}",
			configureRow: "Настроить {name}",
			rowStateIdle: "Не работает",
			uninstall: "Удалить",
			uninstallLabel: "Удалить {name}",
			installTitle: "Добавить плагин",
			installDescription: "Введите имя пакета плагина, адрес репозитория GitHub или путь к локальному каталогу.",
			installSpecLabel: "Название или адрес пакета",
			installSpecPlaceholder: "например dsh-plugin-whale-pet",
			installGuideToggle: "Руководство по установке и примеры",
			installGuideHide: "Скрыть руководство",
			installGuideIdTitle: "Введите имя пакета npm плагина.",
			installGuideIdExample: "dsh-плагин-кит-питомец",
			installGuideIdHint: "Имя пакета плагина — это имя пакета npm (например, dsh-xxx или @author/plugin): часть после добавления плагина dsh или добавления pnpm в команде установки README плагина сообщества.",
			installGuideExampleLabel: "Пример: ",
			installGitTemplateHint: "Замените это фактическим адресом репозитория Git.",
			installPathTemplateHint: "Замените это фактическим путем к вашему локальному каталогу плагина.",
			installGuideFill: "Используйте пример",
			installGuideFillAria: "Используйте пример {example}",
			installGuideSafety: "Устанавливайте только те плагины, которым вы доверяете: они запускаются с вашими разрешениями и могут повредить DeepSeek Harness или привести к утечке ваших данных.",
			installUpgradeNotice: "Официальные плагины по требованию предлагают обновление, если их версия отличается от DSH. Чтобы обновить другие плагины, удалите и переустановите их.",
			registryToggle: "Реестр",
			registryLegend: "Реестр npm, из которого загружается плагин.",
			registryDefault: "Реестр по умолчанию",
			registryOfficial: "Официальный реестр npm",
			registryNpmmirror: "Зеркало материкового Китая",
			registryCustom: "Пользовательский адрес",
			registryCustomPlaceholder: "https://npm.example.com/",
			registryCustomHint: "Введите внутренний или частный адрес реестра npm, начинающийся с http:// или https://.. Если требуется вход в систему, сохраните учетные данные в ~/.npmrc на этом компьютере.",
			registryCustomInvalid: "Введите адрес, начинающийся с http:// или https://.",
			registryListSeparator: ", ",
			sentenceSeparator: "  ",
			installRun: "Установить",
			installChecking: "Проверка…",
			installConfirmedTitle: "Установить плагин",
			installConfirmedRefused: "Этот плагин не может быть установлен",
			installProblemInvalid: "Это не имя или адрес пакета, который можно установить: {reason}.",
			installProblemInstalled: "Этот плагин уже установлен. Чтобы обновить его, удалите его и установите снова.",
			installProblemShipped: "Этот плагин поставляется с DSH; обновление DSH обновляет его",
			installBundledTitle: "Этот плагин поставляется с DSH.",
			installBundledDescription: "Включите его, не загружая другую копию.",
			installProblemNotFound: "Такой плагин не найден",
			installProblemNotPackage: "Путь не существует или не является допустимым пакетом плагина.",
			installProblemNotBundle: "Этот пакет не декларирует отсутствие пакета, поэтому его нельзя установить как плагин: {reason}",
			installProblemNetwork: "Не удалось получить доступ к реестру плагинов; проверьте сеть и попробуйте еще раз",
			installProblemNetworkAll: "Не удалось получить доступ к реестру (пробовал: {registries}); проверьте настройки сети или прокси или измените реестр",
			installProblemUnknown: "Не удалось найти плагин: {reason}.",
			installingTitle: "Установка плагина…",
			installedTitle: "Установлено",
			statusNotInstalled: "Не установлено",
			statusMissingFiles: "Пакет недоступен",
			statusUpdateAvailable: "Доступно обновление",
			sourceNotInstalled: "Не установлено",
			sourceTargetSpec: "Источник для этого DSH",
			sourceTargetVersion: "Версия для этого DSH",
			update: "Обновить",
			updateLabel: "Обновление {name}",
			versionsTitle: "Версии",
			versionsRecheck: "Проверьте еще раз",
			versionsChecking: "Проверка обновлений",
			versionsAvailable: "Доступно обновление до {version}.",
			versionsPublished: "Опубликовано {date}",
			versionsLatest: "Актуально",
			versionsCheckedAt: "Последняя проверка на {time}.",
			versionsBlocked: "Для более новых версий требуется обновление DSH.",
			versionsBlockedDetail: "{version} нужен {peers}; этот DSH - это {runtime}",
			versionsNoneInstallable: "Нет более новой версии для установки напрямую",
			versionsNoneInstallableDetail: "Более новые версии устарели, являются предварительными выпусками или не содержат пакетов. Разверните, чтобы увидеть их",
			versionsFailedNetwork: "Не удалось войти в реестр",
			versionsFailedOther: "Не удалось проверить наличие обновлений",
			versionsDetails: "Подробности",
			versionsNewerCount: "{count} новее",
			versionsCollapse: "Свернуть",
			versionsInstalledTag: "Установлено",
			versionsPrereleaseTag: "Пререлиз",
			versionsDeprecatedTag: "Устарело",
			versionsNeedsDsh: "Требуется {peers}",
			versionsNotBundle: "Эта версия не декларирует отсутствие пакета и не может быть установлена.",
			versionsUpdateLabel: "Обновление до {version}",
			versionsRegistry: "Реестр",
			versionsCheckedAtLabel: "Проверено в",
			versionsFallbackTag: "Резервный вариант",
			versionsFallbackHint: "{registry} не удалось связаться; список взят из резервного реестра",
			versionsPrimaryTag: "Первый",
			versionsShowPrerelease: "Показать пререлизы",
			versionsOmitted: "{count} больше версий новее установленной не указано",
			versionsProblemNetwork: "недостижимый",
			versionsProblemNotFound: "Не найден",
			versionsProblemUnknown: "Не удалось",
			updatesAvailable: "Доступные обновления: {count}",
			updatesNone: "Все плагины актуальны",
			updatesFailed: "Некоторые плагины не удалось проверить",
			updateTitle: "Обновление {name}",
			updateSource: "Установить из",
			updateDescription: "Обновление заменяет {from} на {to}; плагин может ненадолго остановиться. Если установка не удалась, {from} сохраняется или устанавливается снова.",
			updateRunning: "Обновление",
			updateStepChecking: "Проверьте {version}",
			updateStepRemoving: "Остановите и удалите {version}.",
			updateStepInstalling: "Установите {version} из {registry}.",
			updateStepRestoring: "Установите {version} еще раз.",
			updateDone: "Обновлено до {version}.",
			updateDoneDetail: "Новая версия работает.",
			updateRestart: "{version} установлен; оно вступит в силу после перезагрузки",
			updateRefused: "Не могу обновиться до {version}.",
			updateRemoveFailed: "Не удалось удалить {version}.",
			updateRestored: "Обновление не удалось; восстановлен {version}",
			updateRestoredDetail: "{to} не удалось установить; {from} был установлен снова.",
			updateKept: "Не удалось обновиться до {version}.",
			updateKeptDetail: "{from} не был удален и продолжает использоваться. {reason}",
			updateBroken: "Обновление не удалось; плагин не установлен",
			updateBrokenDetail: "{to} не удалось установить, и повторная установка {from} также не удалась. Установите {name} снова из меню «Добавить плагин».",
			updateLost: "Результат обновления неизвестен",
			updateLostDetail: "Соединение с DSH было прервано: {reason}. Обновите список плагинов, чтобы увидеть установленную версию.",
			updateOutput: "Показать выходные данные установки",
			updateFinish: "Готово",
			installFailedTitle: "Плагин не удалось установить",
			installGithubFailedTitle: "Не могу получить доступ к GitHub",
			installGithubTimeoutTitle: "Время ожидания соединения GitHub истекло",
			installGithubFailedDescription: "Попробуйте другой источник установки.",
			installUseGithubMirror: "Используйте зеркало материкового Китая.",
			installTryAnotherWay: "Попробуйте другой способ",
			installPackageLabel: "Название пакета плагина",
			installEdit: "Редактировать",
			installEditAria: "Вернуться к редактированию",
			installCancelAndEdit: "Отменить установку и вернуться к редактированию",
			installApplyingCancellationError: "Отмена не подтвердилась. Установка применяется; дождитесь его результата. {reason}",
			installReconcile: "Проверьте статус установки",
			installUnknownTitle: "Результат установки недоступен",
			installUnknownDescription: "На хосте нет активной установки с этим идентификатором запроса. Прежде чем повторить попытку, проверьте список плагинов.",
			installResultUnconfirmed: "Результат установки не получен. Проверьте статус установки. {reason}",
			installAwaitingAcceptance: "Ожидание, пока хост примет установку. Отмена будет повторена автоматически после подтверждения.",
			installBackgroundUnknown: "Результат установки недоступен. Проверьте список плагинов.",
			installCancel: "Отменить установку",
			installCloseCancels: "Отменить установку и закрыть",
			installViewTask: "Посмотреть установку",
			installUnconfirmedTitle: "Статус установки не подтвержден",
			installBackgroundDone: "Установка завершена. Посмотреть подробности установки.",
			installBackgroundFailed: "Установка не удалась. Посмотреть подробности установки.",
			installBackgroundUnconfirmed: "Статус установки не подтвержден. Подробности смотрите в установке.",
			installBackgroundApplying: "Установка применяется и не может быть отменена. Просмотр хода установки.",
			installStarting: "Подготовка к установке…",
			installCancelling: "Остановка установки…",
			installApplying: "Применяется конфигурация, пожалуйста, подождите…",
			installCancelledShort: "Отменено",
			installCancelled: "Установка отменена; плагин не включен и скачанные файлы могут остаться",
			installCancelUnconfirmed: "Установка не подтверждена, остановлена. Повторите попытку отмены или дождитесь результата установки. {reason}",
			installEnableNow: "Включить сейчас",
			installDetailsShow: "Показать детали установки",
			installDetailsHide: "Скрыть сведения об установке",
			installVersion: "Версия {version}",
			installSubjectPath: "Локальный каталог",
			installSubjectGit: "Git-репозиторий",
			installSubjectTarball: "Тарбол",
			installLocation: "Устанавливается в {dir}",
			installRetry: "Повторить",
			installChangeRegistry: "Изменить реестр",
			installAttempt: "{previous} не смог обслужить пакет; повторная попытка через {registry} (реестр {index} из {total})",
			installAttemptBadge: "Попытка {index} · {registry}",
			installFailureNetwork: "Сетевое подключение не удалось",
			installFailureNetworkAll: "Не удалось достичь реестра (пробовал: {registries}). Проверьте настройки сети или прокси-сервера или измените реестр и повторите попытку.",
			installFailureNetworkHost: "Не удалось связаться с {host}. Адрес GitHub или ссылка .tgz не извлекаются через реестр: этот компьютер должен получить доступ к ним напрямую или через прокси. Если плагин также опубликован в npm, вместо этого введите имя его пакета.",
			installFailureNotFound: "Такой плагин не найден",
			installFailureNoMatchingVersion: "Ни одна версия не соответствует запросу",
			installFailureDiskFull: "Диск заполнен; установка остановлена",
			installFailurePermission: "Нет разрешения на запись; плагин не может быть установлен",
			installFailureBuildBlocked: "Для продолжения установки сценариям установки зависимости требуется ваше разрешение.",
			installFailureBuildBlockedManual: "pnpm блокировал сценарии установки; разрешите их в разделеallowBuilds в pnpm-workspace.yaml и повторите попытку.",
			installFailureIntegrity: "Загруженный пакет не прошел проверку целостности.",
			installFailureTimeout: "Время установки истекло",
			installFailurePnpmMissing: "pnpm не найден, поэтому ничего установить невозможно",
			installFailureGeneric: "Во время установки что-то пошло не так; детали говорят о чем",
			terminalCommandLine: "Командная строка {n}",
			terminalRunning: "Бег",
			terminalFailed: "Не удалось",
			terminalDone: "Готово",
			terminalCopy: "Копировать",
			terminalCopied: "Скопировано",
			terminalNoOutput: "Нет вывода",
			terminalCollapseAria: "Свернуть вывод",
			terminalCollapse: "Свернуть",
			terminalExpandAria: "Разверните оставшиеся выходные строки {n}.",
			terminalExpand: "… {n} еще строки",
			terminalExitCode: "код выхода {code}",
			terminalSignal: "сигнал {signal}",
			terminalNoExitCode: "нет кода выхода",
			installDoneNothing: "Установка завершена без новых зависимостей.",
			installDoneRestart: "Установлен; перезапустите DSH, чтобы загрузить его. {reason}",
			installDoneApproved: "Скрипты установки разрешены для {names}",
			installDoneOtherVersion: "В соответствии с политикой безопасности цепочки поставок pnpm (minimumReleaseAge) версии, опубликованные позже требуемого возраста, не устанавливаются автоматически, поэтому в этой установке использовалась {installed} вместо последней версии {version}. Недавно опубликованная версия не завершила этот период ожидания и может содержать необнаруженный вредоносный код или дефекты. Если вам нужен {version}, удалите текущую версию, а затем установите {exact}, чтобы запросить эту версию.",
			installApprovalTitle: "Для установки скриптов требуется разрешение",
			installApprovalDescription: "Эти пакеты содержат сценарии установки, которые pnpm не запускал.",
			installApprovalConsequence: "После разрешения сценарии запускаются здесь с вашими разрешениями, а разрешение сохраняется в этом профиле.",
			installApprovalCaution: "Разрешите только те пакеты, которым вы доверяете.",
			installApproveAndRetry: "Разрешите эти сценарии и повторите попытку.",
			installClose: "Готово",
			close: "Закрыть",
			cancel: "Отмена",
			confirmUninstallTitle: "Удалить \"{name}\"?",
			confirmUninstallDescription: "То, что он предоставляет, исчезает после его удаления.",
			confirmUninstall: "Удалить",
			failedEnable: "Не удалось включить: {reason}",
			failedDisable: "Не удалось отключить: {reason}",
			failedUninstall: "Не удалось удалить: {reason}",
			failedRowEnable: "Не удалось включить компонент: {reason}.",
			failedRowDisable: "Не удалось отключить компонент: {reason}.",
			reasonManagementRequired: "Управление плагинами нуждается в этом; его нельзя отключить или удалить.",
			reasonUnaddressable: "Патч профиля не может решить эту проблему однозначно.",
			reasonUnknownPlugin: "Нет такого плагина.",
			reasonInvalidSpec: "Введите действительное имя или адрес пакета.",
			reasonAlreadyInstalled: "Этот пакет уже установлен; удалите его перед установкой другой версии.",
			reasonAmbiguousInstall: "Какой пакет был установлен, невозможно определить по изменению зависимостей.",
			reasonNotBundle: "В этом пакете не объявлен пакет, поэтому им нельзя управлять как плагином.",
			reasonNotRemovable: "Этот пакет не принадлежит профилю, или он нужен управлению плагинами.",
			reasonStopProfile: "Этот профиль работает без HMR; остановите его и удалите пакет с плагином dsh.",
			reasonBundleInUse: "Другая конфигурация по-прежнему использует компоненты этого пакета; сначала выключите их.",
			reasonStaleApproval: "Ожидаемые утверждения сценария изменились; установите еще раз, чтобы обновить их.",
			reasonIncompatibleVersion: "{plugin} несовместим с DSH {runtime} (требуется {requirements}); его запуск может привести к сбоям или потере данных.",
			reasonIncompatibleVersionUnnamed: "Этот плагин несовместим с работающей версией DSH; его запуск может привести к сбоям или потере данных.",
			reasonIncompatibleInstall: "Установите версию плагина, совместимую с этим DSH.",
			reasonIncompatibleInstalled: "Удалите его и установите версию, совместимую с этим DSH.",
			reasonOperationError: "Хост сообщил об ошибке.",
			detailTitle: "Подробности",
			detailLoading: "Читаем подробности",
			detailTooLarge: "Детали превышают лимит размера и не были загружены.",
			detailNetwork: "До источника подробностей добраться не удалось.",
			detailInvalid: "Плагин объявляет неверный файл сведений.",
			detailFailed: "Подробности прочитать не удалось.",
			detailFootnotes: "Сноски"
		};
		/** Portuguese dictionary, checked against the English keys. */
		const pt = {
			panel: "Plug-ins",
			title: "Plug-ins",
			intro: "Instalar, habilitar e configurar plug-ins",
			infoLabel: "Sobre plug-ins",
			infoDescription: "Configure plugins oficiais e instale ou gerencie outros plugins aqui. Veja a lista de plug-ins integrados e o status do tempo de execução em Configurações → Plug-ins integrados.",
			loading: "Lendo plug-ins…",
			error: "Não foi possível ler todos os plugins, possivelmente devido a um problema de rede",
			unavailable: "Esta implantação é executada sem um perfil gerenciável, portanto, os plug-ins não podem ser instalados ou trocados aqui.",
			retry: "Tentar novamente",
			refresh: "Atualizar",
			refreshError: "Falha na atualização. Por favor, tente novamente.",
			empty: "Nenhum plug-in está instalado ainda.",
			addPlugin: "Adicionar plug-in",
			chooseAddMethod: "Escolha como adicionar um plugin",
			installExisting: "Instale um plugin de terceiros",
			installExistingDescription: "Suporta pacotes npm, repositórios Git e diretórios locais",
			restartNotice: "Reinicie DSH para aplicar a alteração. {reason}",
			restartReasonNoHmr: "Este perfil aplica alterações somente na inicialização.",
			restartReasonPackageMoved: "Um pacote instalado agora é resolvido para outro diretório ou a alteração substitui um pacote fornecido pela instalação DSH. Desinstale um pacote antes de instalá-lo de outro local.",
			restartReasonHostModule: "A mudança atinge os módulos DSH carregados.",
			restartReasonUnmanagedPlugin: "A mudança atinge um plugin rodando fora da lista de plugins.",
			restartReasonModuleComparison: "DSH não conseguiu comparar os plug-ins carregados com seus arquivos.",
			overriddenNotice: "{name} foi salvo, mas uma configuração de prioridade mais alta o substitui, portanto não está em vigor",
			bundlesTitle: "Plug-ins instalados",
			basicTitle: "Configurações de plug-in integradas",
			extensionsTitle: "Plug-ins experimentais",
			moreTitle: "Plug-ins experimentais",
			moreAction: "Mais",
			tabsLabel: "Visualizações de plug-in",
			installedTab: "Instalado",
			statusProblem: "Problema",
			statusBeta: "Experimental",
			reasonLabel: "Razão",
			metadataError: "Erro de metadados do pacote: {error}",
			versionTag: "v{version}",
			partsLabel: "Componentes",
			sourceTitle: "Fonte",
			sourceSpec: "Fonte do código",
			sourceBuiltIn: "Construído em",
			sourceVersion: "Versão atual",
			partsEmpty: "Este pacote de plugins não contém componentes.",
			partsCountTotal: "{count} total",
			partsCountRunning: "{count} em execução",
			partsCountOff: "{count} desativado",
			partOff: "Desligado",
			partsCountFailed: "{count} falhou",
			partsFilter: "Filtrar componentes",
			partsFilterEmpty: "Nenhum componente corresponde.",
			partToggle: "Ativar componente {name}",
			rowPhasePending: "Esperando por dependências",
			rowPhaseLoading: "Carregando",
			rowPhaseActive: "Correndo",
			rowPhaseFailed: "Problema",
			rowPhaseUnloading: "Descarregando",
			enableToggle: "Ativar {name}",
			applyingChange: "Aplicando alterações em {name}",
			openDetail: "Ver {name}",
			backToList: "Voltar aos plug-ins",
			crumbRoot: "Plug-ins",
			backToPackage: "Voltar para {name}",
			configureRow: "Configurar {name}",
			rowStateIdle: "Não está em execução",
			uninstall: "Desinstalar",
			uninstallLabel: "Desinstalar {name}",
			installTitle: "Adicionar plug-in",
			installDescription: "Insira o nome do pacote do plug-in, o endereço do repositório GitHub ou o caminho do diretório local.",
			installSpecLabel: "Nome ou endereço do pacote",
			installSpecPlaceholder: "por exemplo dsh-plugin-baleia-animal de estimação",
			installGuideToggle: "Guia de instalação e exemplos",
			installGuideHide: "Ocultar o guia",
			installGuideIdTitle: "Digite o nome do pacote npm do plugin",
			installGuideIdExample: "dsh-plugin-baleia-animal de estimação",
			installGuideIdHint: "O nome do pacote do plug-in é o nome do pacote npm (como dsh-xxx ou @author/plugin): a parte após dsh plugin add ou pnpm add no comando de instalação README de um plug-in da comunidade.",
			installGuideExampleLabel: "Exemplo: ",
			installGitTemplateHint: "Substitua pelo endereço real do repositório Git.",
			installPathTemplateHint: "Substitua isso pelo caminho real para o diretório local do plugin.",
			installGuideFill: "Exemplo de uso",
			installGuideFillAria: "Use o exemplo {example}",
			installGuideSafety: "Instale apenas plug-ins em que você confia: eles são executados com suas permissões e podem danificar DeepSeek Harness ou vazar seus dados.",
			installUpgradeNotice: "Plug-ins oficiais sob demanda oferecem atualização quando sua versão é diferente de DSH. Para atualizar outros plug-ins, desinstale-os e reinstale-os.",
			registryToggle: "Registro",
			registryLegend: "O registro npm do qual o plugin é baixado",
			registryDefault: "Registro padrão",
			registryOfficial: "Registro oficial do npm",
			registryNpmmirror: "Espelho da China Continental",
			registryCustom: "Endereço personalizado",
			registryCustomPlaceholder: "https://npm.example.com/",
			registryCustomHint: "Insira um endereço de registro npm interno ou privado começando com http:// ou https://. Se for necessário um login, armazene as credenciais em ~/.npmrc nesta máquina.",
			registryCustomInvalid: "Insira um endereço começando com http:// ou https://",
			registryListSeparator: ", ",
			sentenceSeparator: "  ",
			installRun: "Instalar",
			installChecking: "Verificando…",
			installConfirmedTitle: "Instalar plug-in",
			installConfirmedRefused: "Este plugin não pode ser instalado",
			installProblemInvalid: "Este não é um nome ou endereço de pacote que pode ser instalado: {reason}",
			installProblemInstalled: "Este plugin já está instalado. Para atualizá-lo, desinstale-o e instale-o novamente",
			installProblemShipped: "Este plug-in é fornecido com DSH; atualizar DSH atualiza-o",
			installBundledTitle: "Este plug-in é fornecido com DSH",
			installBundledDescription: "Habilite-o sem baixar outra cópia",
			installProblemNotFound: "Nenhum plugin desse tipo foi encontrado",
			installProblemNotPackage: "O caminho não existe ou não é um pacote de plugin válido",
			installProblemNotBundle: "Este pacote não declara nenhum pacote, portanto não pode ser instalado como um plug-in: {reason}",
			installProblemNetwork: "O registro do plugin não pôde ser acessado; verifique a rede e tente novamente",
			installProblemNetworkAll: "Nenhum registro pôde ser acessado (tentativa: {registries}); verifique as configurações de rede ou proxy ou altere o registro",
			installProblemUnknown: "Não foi possível pesquisar o plug-in: {reason}",
			installingTitle: "Instalando o plug-in…",
			installedTitle: "Instalado",
			statusNotInstalled: "Não instalado",
			statusMissingFiles: "Pacote indisponível",
			statusUpdateAvailable: "Atualização disponível",
			sourceNotInstalled: "Não instalado",
			sourceTargetSpec: "Fonte para este DSH",
			sourceTargetVersion: "Versão para este DSH",
			update: "Atualizar",
			updateLabel: "Atualizar {name}",
			versionsTitle: "Versões",
			versionsRecheck: "Verifique novamente",
			versionsChecking: "Verificando atualizações",
			versionsAvailable: "Atualização para {version} disponível",
			versionsPublished: "Publicado {date}",
			versionsLatest: "Atualizado",
			versionsCheckedAt: "Última verificação em {time}",
			versionsBlocked: "Versões mais recentes precisam de uma atualização DSH",
			versionsBlockedDetail: "{version} precisa de {peers}; este DSH é {runtime}",
			versionsNoneInstallable: "Nenhuma versão mais recente para instalar diretamente",
			versionsNoneInstallableDetail: "As versões mais recentes estão obsoletas, são pré-lançamentos ou não declaram nenhum pacote. Expanda para vê-los",
			versionsFailedNetwork: "Não foi possível acessar o registro",
			versionsFailedOther: "Não foi possível verificar atualizações",
			versionsDetails: "Detalhes",
			versionsNewerCount: "{count} mais recente",
			versionsCollapse: "Recolher",
			versionsInstalledTag: "Instalado",
			versionsPrereleaseTag: "Pré-lançamento",
			versionsDeprecatedTag: "Obsoleto",
			versionsNeedsDsh: "Precisa de {peers}",
			versionsNotBundle: "Esta versão não declara nenhum pacote e não pode ser instalada",
			versionsUpdateLabel: "Atualizar para {version}",
			versionsRegistry: "Registro",
			versionsCheckedAtLabel: "Verificado em",
			versionsFallbackTag: "Alternativa",
			versionsFallbackHint: "{registry} não pôde ser contatado; a lista vem de um registro substituto",
			versionsPrimaryTag: "Primeiro",
			versionsShowPrerelease: "Mostrar pré-lançamentos",
			versionsOmitted: "{count} mais versões mais recentes que a instalada não estão listadas",
			versionsProblemNetwork: "Inacessível",
			versionsProblemNotFound: "Não encontrado",
			versionsProblemUnknown: "Falha",
			updatesAvailable: "Atualizações disponíveis: {count}",
			updatesNone: "Todos os plug-ins estão atualizados",
			updatesFailed: "Alguns plug-ins não puderam ser verificados",
			updateTitle: "Atualizar {name}",
			updateSource: "Instalar de",
			updateDescription: "A atualização substitui {from} por {to}; o plugin pode parar brevemente. Se a instalação falhar, {from} será mantido ou instalado novamente.",
			updateRunning: "Atualizando",
			updateStepChecking: "Verifique {version}",
			updateStepRemoving: "Pare e remova {version}",
			updateStepInstalling: "Instalar {version} de {registry}",
			updateStepRestoring: "Instale {version} novamente",
			updateDone: "Atualizado para {version}",
			updateDoneDetail: "A nova versão está em execução.",
			updateRestart: "{version} instalado; entra em vigor após uma reinicialização",
			updateRefused: "Não é possível atualizar para {version}",
			updateRemoveFailed: "Não foi possível remover {version}",
			updateRestored: "Falha na atualização; restaurado {version}",
			updateRestoredDetail: "{to} falhou ao instalar; {from} foi instalado novamente.",
			updateKept: "Não foi possível atualizar para {version}",
			updateKeptDetail: "{from} não foi removido e permanece em uso. {reason}",
			updateBroken: "Falha na atualização; o plugin não está instalado",
			updateBrokenDetail: "{to} falhou ao instalar e instalar {from} novamente também falhou. Instale {name} novamente em Adicionar plug-in.",
			updateLost: "O resultado da atualização é desconhecido",
			updateLostDetail: "A conexão com DSH foi interrompida: {reason}. Atualize a lista de plugins para ver a versão instalada.",
			updateOutput: "Mostrar resultado da instalação",
			updateFinish: "Concluído",
			installFailedTitle: "O plugin não pôde ser instalado",
			installGithubFailedTitle: "Não é possível acessar GitHub",
			installGithubTimeoutTitle: "GitHub conexão expirou",
			installGithubFailedDescription: "Tente outra fonte de instalação.",
			installUseGithubMirror: "Use o espelho da China continental",
			installTryAnotherWay: "Tente outra maneira",
			installPackageLabel: "Nome do pacote de plug-ins",
			installEdit: "Editar",
			installEditAria: "Voltar para edição",
			installCancelAndEdit: "Cancele a instalação e retorne à edição",
			installApplyingCancellationError: "O cancelamento não foi confirmado. A instalação está sendo aplicada; espere pelo seu resultado. {reason}",
			installReconcile: "Verifique o status da instalação",
			installUnknownTitle: "Resultado da instalação indisponível",
			installUnknownDescription: "O Host não possui instalação ativa com este ID de solicitação. Verifique a lista de plugins antes de tentar novamente.",
			installResultUnconfirmed: "O resultado da instalação não foi recebido. Verifique o status da instalação. {reason}",
			installAwaitingAcceptance: "Aguardando o Host aceitar a instalação. O cancelamento será tentado novamente automaticamente após a confirmação.",
			installBackgroundUnknown: "Resultado da instalação indisponível. Verifique a lista de plugins.",
			installCancel: "Cancelar instalação",
			installCloseCancels: "Cancelar instalação e fechar",
			installViewTask: "Ver instalação",
			installUnconfirmedTitle: "Status de instalação não confirmado",
			installBackgroundDone: "Instalação concluída. Veja detalhes da instalação.",
			installBackgroundFailed: "A instalação falhou. Veja detalhes da instalação.",
			installBackgroundUnconfirmed: "O status da instalação não foi confirmado. Veja a instalação para obter detalhes.",
			installBackgroundApplying: "A instalação está sendo aplicada e não pode ser cancelada. Veja o progresso da instalação.",
			installStarting: "Preparando a instalação…",
			installCancelling: "Parando a instalação…",
			installApplying: "Aplicando configuração, aguarde…",
			installCancelledShort: "Cancelado",
			installCancelled: "Instalação cancelada; o plugin não está habilitado e os arquivos baixados podem permanecer",
			installCancelUnconfirmed: "A instalação não foi confirmada interrompida. Tente novamente o cancelamento ou aguarde o resultado da instalação. {reason}",
			installEnableNow: "Ativar agora",
			installDetailsShow: "Mostrar detalhes da instalação",
			installDetailsHide: "Ocultar detalhes de instalação",
			installVersion: "Versão {version}",
			installSubjectPath: "Diretório local",
			installSubjectGit: "Repositório Git",
			installSubjectTarball: "Tarball",
			installLocation: "Instala em {dir}",
			installRetry: "Tentar novamente",
			installChangeRegistry: "Alterar registro",
			installAttempt: "{previous} não pôde entregar o pacote; tentando novamente através de {registry} (registro {index} de {total})",
			installAttemptBadge: "Tentativa {index} · {registry}",
			installFailureNetwork: "A conexão de rede falhou",
			installFailureNetworkAll: "Nenhum registro pôde ser acessado (tentativa: {registries}). Verifique as configurações de rede ou proxy ou altere o registro e tente novamente.",
			installFailureNetworkHost: "{host} não pôde ser alcançado. Um endereço GitHub ou um link .tgz não é obtido através do registro: esta máquina deve acessá-lo diretamente ou através de um proxy. Se o plugin também for publicado no npm, insira o nome do pacote.",
			installFailureNotFound: "Nenhum plugin desse tipo foi encontrado",
			installFailureNoMatchingVersion: "Nenhuma versão corresponde à solicitação",
			installFailureDiskFull: "O disco está cheio; a instalação parou",
			installFailurePermission: "Sem permissão de gravação; o plugin não pode ser instalado",
			installFailureBuildBlocked: "Os scripts de instalação de uma dependência precisam da sua permissão antes que a instalação possa continuar",
			installFailureBuildBlockedManual: "scripts de instalação bloqueados por pnpm; permita-os em permitBuilds em pnpm-workspace.yaml e tente novamente",
			installFailureIntegrity: "O pacote baixado falhou na verificação de integridade",
			installFailureTimeout: "A instalação expirou",
			installFailurePnpmMissing: "pnpm não foi encontrado, então nada pode ser instalado",
			installFailureGeneric: "Algo deu errado durante a instalação; os detalhes dizem o que",
			terminalCommandLine: "Linha de comando {n}",
			terminalRunning: "Correndo",
			terminalFailed: "Falha",
			terminalDone: "Concluído",
			terminalCopy: "Copiar",
			terminalCopied: "Copiado",
			terminalNoOutput: "Sem saída",
			terminalCollapseAria: "Recolher saída",
			terminalCollapse: "Recolher",
			terminalExpandAria: "Expanda as {n} linhas de saída restantes",
			terminalExpand: "… mais {n} linhas",
			terminalExitCode: "código de saída {code}",
			terminalSignal: "sinal {signal}",
			terminalNoExitCode: "sem código de saída",
			installDoneNothing: "A instalação foi concluída sem nenhuma nova dependência.",
			installDoneRestart: "Instalado; reinicie DSH para carregá-lo. {reason}",
			installDoneApproved: "Instalar scripts permitidos para {names}",
			installDoneOtherVersion: "De acordo com a política de segurança da cadeia de fornecimento do pnpm (minimumReleaseAge), as versões publicadas mais recentemente do que a idade exigida não são instaladas automaticamente, portanto, esta instalação usou {installed} em vez da versão mais recente {version}. Uma versão recém-publicada não completou esse período de espera e pode conter códigos maliciosos ou defeitos não detectados. Se precisar de {version}, desinstale a versão atual e instale {exact} para solicitar essa versão.",
			installApprovalTitle: "Os scripts de instalação precisam de permissão",
			installApprovalDescription: "Esses pacotes possuem scripts de instalação que o pnpm não executou.",
			installApprovalConsequence: "Uma vez permitido, os scripts são executados aqui com suas permissões, e a permissão é salva neste perfil.",
			installApprovalCaution: "Permita apenas pacotes em que você confia.",
			installApproveAndRetry: "Permita esses scripts e tente novamente",
			installClose: "Concluído",
			close: "Fechar",
			cancel: "Cancelar",
			confirmUninstallTitle: "Desinstalar \"{name}\"?",
			confirmUninstallDescription: "O que ele fornece desaparece quando é desinstalado.",
			confirmUninstall: "Desinstalar",
			failedEnable: "Não foi possível ativar: {reason}",
			failedDisable: "Não foi possível desativar: {reason}",
			failedUninstall: "Não foi possível desinstalar: {reason}",
			failedRowEnable: "Não foi possível ativar o componente: {reason}",
			failedRowDisable: "Não foi possível desativar o componente: {reason}",
			reasonManagementRequired: "O gerenciamento de plug-ins precisa disso; ele não pode ser desligado ou desinstalado.",
			reasonUnaddressable: "O patch de perfil não pode resolver este problema exclusivamente.",
			reasonUnknownPlugin: "Não existe tal plugin.",
			reasonInvalidSpec: "Insira um nome ou endereço de pacote válido.",
			reasonAlreadyInstalled: "Este pacote já está instalado; desinstale-o antes de instalar outra versão.",
			reasonAmbiguousInstall: "Qual pacote foi instalado não pode ser informado a partir da mudança de dependência.",
			reasonNotBundle: "Este pacote não declara nenhum pacote, portanto não pode ser gerenciado como um plugin.",
			reasonNotRemovable: "Este pacote não pertence ao perfil ou o gerenciamento do plugin precisa dele.",
			reasonStopProfile: "Este perfil é executado sem HMR; pare e desinstale o pacote com o plugin dsh.",
			reasonBundleInUse: "Outras configurações ainda usam os componentes deste pacote configurável; desligue-os primeiro.",
			reasonStaleApproval: "As aprovações de script pendentes foram alteradas; instale novamente para atualizá-los.",
			reasonIncompatibleVersion: "{plugin} é incompatível com DSH {runtime} (requer {requirements}); executá-lo pode causar travamentos ou perda de dados.",
			reasonIncompatibleVersionUnnamed: "Este plug-in é incompatível com a versão DSH em execução; executá-lo pode causar travamentos ou perda de dados.",
			reasonIncompatibleInstall: "Instale uma versão de plug-in compatível com este DSH.",
			reasonIncompatibleInstalled: "Desinstale-o e instale uma versão compatível com este DSH.",
			reasonOperationError: "O Host relatou um erro.",
			detailTitle: "Detalhes",
			detailLoading: "Lendo detalhes",
			detailTooLarge: "Os detalhes excedem o limite de tamanho e não foram carregados.",
			detailNetwork: "Não foi possível acessar a fonte dos detalhes.",
			detailInvalid: "O plugin declara um arquivo de detalhes inválido.",
			detailFailed: "Não foi possível ler os detalhes.",
			detailFootnotes: "Notas de rodapé"
		};
		//#endregion
		//#region lib/types/client/sanitize-install-input.js
		/** Privacy-safe installation input classification shared by click and result events. */
		/**
		* Keep registry package names and plain versions; classify other installer inputs without their contents.
		* @param spec - user-entered installation spec.
		* @returns an identifier safe to send without URL credentials, tokens, or local paths.
		*/
		function sanitizeInstallInput(spec) {
			if (/^(?:@[a-z0-9._-]+\/)?[a-z0-9][a-z0-9._-]*(?:@[a-z0-9.*^~+<>=| -]+)?$/iu.test(spec)) return spec;
			if (/^(?:git[+:]|git@|github:|gitlab:|bitbucket:)/iu.test(spec)) return "[git]";
			if (/^[a-z][a-z0-9+.-]*:\/\//iu.test(spec)) return "[url]";
			return "[path-or-other]";
		}
		//#endregion
		//#region ../../util/crypto/lib/index.js
		/**
		* Random v4 UUID, minted from `crypto.getRandomValues`.
		* @returns the UUID string.
		*/
		function randomUUID() {
			const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
			const hex = Array.from(bytes, (byte, index) => {
				return (index === 6 ? byte & 15 | 64 : index === 8 ? byte & 63 | 128 : byte).toString(16).padStart(2, "0");
			}).join("");
			return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
		}
		/** Public npmmirror URL shared by the fallback configuration and public-registry comparison. */
		const NPMMIRROR_REGISTRY = "https://registry.npmmirror.com/";
		/** An http(s) URL, as pnpm's `--registry` takes it. */
		const REGISTRY_URL = /^https?:\/\/\S+$/;
		/**
		* Parse a registry URL into the form pnpm compares registries in: lower-case host, trailing slash.
		* @param url - the registry as configured or requested.
		* @returns the normalized URL.
		* @throws {Error} for anything but an http(s) URL.
		*/
		function normalizeRegistry(url) {
			let parsed;
			try {
				parsed = new URL(url);
			} catch {}
			if (parsed === void 0 || parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error(`a registry must be an http(s) URL: ${url}`);
			if (!parsed.pathname.endsWith("/")) parsed.pathname += "/";
			return parsed.href;
		}
		//#endregion
		//#region lib/types/client/presentation.js
		/** Display labels and toast sentences for global plugin management. */
		/** The registries with a name of their own, by host. */
		const REGISTRY_COPY = new Map([["registry.npmmirror.com", "registryNpmmirror"]]);
		/** npm's own registry, which reads by name rather than by host. */
		const OFFICIAL_NPM_HOST = "registry.npmjs.org";
		/**
		* What a registry reads as: npm's own by its name, a known mirror by its name, any other registry by its host;
		* and the host each names, for where the name alone would leave it unsaid. The registry pnpm's own configuration
		* names reads by the registry it names, so the label never claims npm's own for another one.
		* @param registry - the registry, null for the one pnpm's own configuration names.
		* @param t - the manager's translate seat.
		* @param resolved - the URL pnpm's own configuration names, null while the Host could not read it.
		* @returns the name and the host.
		*/
		function registryText(registry, t, resolved) {
			const url = registry ?? resolved;
			if (url === null) return {
				name: t("registryDefault"),
				host: OFFICIAL_NPM_HOST
			};
			const host = registryHost(url);
			const key = host === OFFICIAL_NPM_HOST ? "registryOfficial" : REGISTRY_COPY.get(host);
			return {
				name: key === void 0 ? host : t(key),
				host
			};
		}
		/** The host of a registry URL; the URL as written when it does not parse. */
		function registryHost(registry) {
			try {
				return new URL(registry).host;
			} catch {
				return registry;
			}
		}
		/** The sentence each of the Host's refusal codes reads as. */
		const CODE_KEYS = {
			"management-required": "reasonManagementRequired",
			"unaddressable": "reasonUnaddressable",
			"unknown-plugin": "reasonUnknownPlugin",
			"invalid-spec": "reasonInvalidSpec",
			"already-installed": "reasonAlreadyInstalled",
			"ambiguous-install": "reasonAmbiguousInstall",
			"not-bundle": "reasonNotBundle",
			"not-removable": "reasonNotRemovable",
			"stop-profile": "reasonStopProfile",
			"bundle-in-use": "reasonBundleInUse",
			"stale-approval": "reasonStaleApproval",
			"incompatible-version": "reasonIncompatibleVersionUnnamed",
			"operation-error": "reasonOperationError"
		};
		/** The sentence a failed action opens with, by what was being done. */
		const FAILED_KEYS = {
			enable: "failedEnable",
			disable: "failedDisable",
			uninstall: "failedUninstall",
			rowEnable: "failedRowEnable",
			rowDisable: "failedRowDisable"
		};
		/**
		* What a management error reads as: the code's sentence; for an incompatibility, one sentence per
		* package it names, then the remedy for an install or for an installed plugin; or, for an operation error, the Host's diagnostic as it is.
		* @param error - the Host's code, its diagnostic, and the packages an incompatibility names.
		* @param t - the manager's translate seat.
		* @returns the sentence.
		*/
		function managementText(error, t) {
			if (error.code === "incompatible-version") {
				const named = error.incompatible ?? [];
				return [...named.length === 0 ? [t("reasonIncompatibleVersionUnnamed")] : named.map((plugin) => t("reasonIncompatibleVersion", {
					plugin: `${plugin.name}@${plugin.version}`,
					runtime: plugin.runtimeVersion,
					requirements: Object.entries(plugin.requirements).map(([name, range]) => `${name} ${range}`).join(", ")
				})), t(error.installing ? "reasonIncompatibleInstall" : "reasonIncompatibleInstalled")].join(t("sentenceSeparator"));
			}
			if (error.code !== "operation-error") return t(CODE_KEYS[error.code]);
			return error.diagnostic === void 0 || error.diagnostic === "" ? t("reasonOperationError") : error.diagnostic;
		}
		/**
		* Compact a package name to what a person calls it.
		* @param name - the package name.
		* @returns the unscoped name without the harness prefixes.
		*/
		function shortName(name) {
			return (name.startsWith("@") ? name.slice(name.indexOf("/") + 1) : name).replace(/^dsh-(?:host-|client-)?/, "");
		}
		/**
		* Resolve installed package metadata without changing its technical identity.
		* @param pkg - package identity and local metadata.
		* @param resolveText - current-locale package text resolver.
		* @returns localized copy with a technical-name fallback and the independent beta status.
		*/
		function packageText(pkg, resolveText) {
			return {
				title: pkg.meta?.title === void 0 ? pkg.name : resolveText(pkg.meta.title),
				description: pkg.meta?.description === void 0 ? void 0 : resolveText(pkg.meta.description) || void 0,
				beta: EXPERIMENTAL_BUNDLES.has(pkg.name)
			};
		}
		/**
		* Resolve a bundle row's plugin metadata, using its full module specifier as the final title fallback.
		* @param row - row identity and local metadata.
		* @param resolveText - current-locale package text resolver.
		* @returns the row's display title and optional description.
		*/
		function rowText(row, resolveText) {
			return {
				title: row.meta?.title === void 0 ? row.moduleName : resolveText(row.meta.title),
				description: row.meta?.description === void 0 ? void 0 : resolveText(row.meta.description) || void 0
			};
		}
		/** The sentence naming why a change waits for a restart. */
		const RESTART_REASON_KEYS = {
			"no-hmr": "restartReasonNoHmr",
			"package-moved": "restartReasonPackageMoved",
			"host-module": "restartReasonHostModule",
			"unmanaged-plugin": "restartReasonUnmanagedPlugin",
			"module-comparison": "restartReasonModuleComparison"
		};
		/**
		* A restart prompt with its reason.
		* @param key - the prompt's sentence, which takes the reason as `{reason}`.
		* @param reason - why the change waits for a restart.
		* @param t - the manager's translate seat.
		* @returns the prompt.
		*/
		function restartText(key, reason, t) {
			return t(key, { reason: reason === void 0 ? "" : t(RESTART_REASON_KEYS[reason]) }).trimEnd();
		}
		/**
		* The sentence one notice shows.
		* @param notice - the last action's outcome.
		* @param t - the manager's translate seat.
		* @returns the sentence.
		*/
		function noticeText(notice, t) {
			switch (notice.kind) {
				case "restart": return restartText("restartNotice", notice.reason, t);
				case "overridden": return t("overriddenNotice", { name: notice.packageName });
				case "cancelled": return t("installCancelled");
				case "refresh-failed": return t("refreshError");
				case "install": return t({
					done: "installBackgroundDone",
					failed: "installBackgroundFailed",
					unconfirmed: "installBackgroundUnconfirmed",
					applying: "installBackgroundApplying",
					unknown: "installBackgroundUnknown"
				}[notice.outcome]);
				case "failed": {
					const reason = notice.code === void 0 ? notice.reason : managementText({
						code: notice.code,
						diagnostic: notice.reason,
						...notice.incompatible === void 0 ? {} : { incompatible: notice.incompatible }
					}, t);
					return t(FAILED_KEYS[notice.action], { reason: reason === "" ? t("reasonOperationError") : reason });
				}
			}
		}
		//#endregion
		//#region lib/types/client/detail-store.js
		/**
		* The identity of a bundle detail read: the bundle, its installed version, and the display language.
		* @param name - the bundle's package name.
		* @param version - the installed or offered version, so an updated bundle reads again.
		* @param language - the display language.
		* @returns the key of the read in {@link BundleDetailsState}.
		*/
		function bundleDetailKey(name, version, language) {
			return JSON.stringify([
				name,
				version ?? null,
				language
			]);
		}
		/** The Host route of images beside bundle detail documents, relative to the application base. */
		const DETAIL_FILE_ROUTE = "api/plugin-manager/detail-file";
		function failureOf$1(failure) {
			return failure.code === "plugin-manager/detail-unavailable" ? failure.details.reason : "other";
		}
		/** Reads bundle detail documents and publishes them to the page. */
		var BundleDetailController = class {
			ctx;
			base;
			/** Detail reads published to the page. */
			store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({});
			/** The latest read of each key, numbered across the controller's lifetime; an older read's answer is dropped. */
			reads = /* @__PURE__ */ new Map();
			sequence = 0;
			/** npm file CDNs to ask first, from the Host's latest registry comparison: npmmirror when its registry answered fastest. */
			npmFileSources = [];
			disposed = false;
			/**
			* @param ctx - the page plugin's context, whose `remote.pluginManager` namespace answers.
			* @param base - the application base URL that Host routes resolve against.
			*/
			constructor(ctx, base) {
				this.ctx = ctx;
				this.base = base;
			}
			/**
			* Read a bundle's document unless the read already ran or runs.
			* @param name - the bundle's package name.
			* @param version - its installed or offered version.
			* @param language - the display language.
			* @param fromNpm - whether the bundle's files are unavailable, so the Host reads its offered version from the npm file CDNs.
			*/
			load(name, version, language, fromNpm) {
				if (!this.reads.has(bundleDetailKey(name, version, language))) this.read(name, version, language, fromNpm);
			}
			/**
			* Read a bundle's document again.
			* @param name - the bundle's package name.
			* @param version - its installed or offered version.
			* @param language - the display language.
			* @param fromNpm - whether the Host reads the bundle from the npm file CDNs.
			*/
			retry(name, version, language, fromNpm) {
				this.read(name, version, language, fromNpm);
			}
			/**
			* The URL of an image beside a bundle's document.
			* @param name - the bundle's package name.
			* @param document - the document's path inside the bundle.
			* @param destination - the image destination as the document writes it.
			* @param fromNpm - whether the Host reads the bundle from the npm file CDNs.
			* @returns the authenticated Host URL, or undefined for an absolute, protocol-relative, or fragment destination.
			*/
			image(name, document, destination, fromNpm) {
				if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/iu.test(destination)) return void 0;
				const sources = fromNpm ? this.npmFileSources : [];
				const query = new URLSearchParams({
					bundle: name,
					document,
					path: destination,
					...sources.length > 0 ? { sources: sources.join(",") } : {}
				});
				return new URL(`${DETAIL_FILE_ROUTE}?${query.toString()}`, this.base()).href;
			}
			/** Invalidate reads while retaining settled documents until their replacements arrive. */
			reset() {
				this.reads.clear();
				this.store.set(Object.fromEntries(Object.entries(this.store.getSnapshot()).filter(([, value]) => value.status === "ready")));
			}
			/** Stop publishing late settlements. */
			dispose() {
				this.disposed = true;
			}
			async read(name, version, language, fromNpm) {
				const key = bundleDetailKey(name, version, language);
				const read = ++this.sequence;
				this.reads.set(key, read);
				if (this.store.getSnapshot()[key]?.status !== "ready") this.publish(key, { status: "loading" });
				const { remote } = this.ctx;
				const current = () => !this.disposed && this.reads.get(key) === read;
				if (fromNpm) {
					const fastest = await remote.pluginRegistryProbe.fastest();
					if (!current()) return;
					this.npmFileSources = fastest.ok && fastest.value === "https://registry.npmmirror.com/" ? ["npmmirror"] : [];
				}
				const answer = await remote.pluginManager.readBundleDetail(name, language, { npmFileSources: fromNpm ? this.npmFileSources : [] });
				if (current()) this.publish(key, answer.ok ? {
					status: "ready",
					detail: answer.value
				} : {
					status: "error",
					failure: failureOf$1(answer.error)
				});
			}
			publish(key, state) {
				this.store.set({
					...this.store.getSnapshot(),
					[key]: state
				});
			}
		};
		//#endregion
		//#region lib/types/client/manager-store.js
		/**
		* Read whether a bundle has a pending management action.
		* @param state Current manager snapshot.
		* @param packageName Bundle whose controls and observers must wait.
		* @returns Whether the bundle's management operation is still pending.
		*/
		function bundleBusy(state, packageName) {
			return state.busy.includes(packageName) || state.update?.packageName === packageName || state.install.subject?.name === packageName && (isInstallPending(state.install.phase) || state.install.phase === "checking");
		}
		/** The choice shown until the Host has said which registry it asks first: the one pnpm's own configuration names. */
		const OFFICIAL_REGISTRY = {
			kind: "offered",
			registry: null
		};
		/** Hold the manual-refresh spinner at least this long so a fast read does not flash it. */
		const REFRESH_SPINNER_MIN_MS = 400;
		/**
		* The registry a choice asks, as the Host's install plan compares registries: pnpm's own configuration stands for
		* the URL it names, once the Host has read it.
		* @param registry - the registry, null for the one pnpm's own configuration names.
		* @param resolved - the URL pnpm's own configuration names, null while the Host could not read it.
		* @returns the comparison key; a registry that does not parse compares as written.
		*/
		function registryKey(registry, resolved) {
			const url = registry ?? resolved;
			if (url === null) return "";
			try {
				return normalizeRegistry(url);
			} catch {
				return url;
			}
		}
		/**
		* The registries the dialog offers: the Host's first, its fallbacks, and pnpm's own, each once. pnpm's own
		* configuration stands for the registry it names, so it never repeats a registry the Host already offers.
		* @param registries - what the Host configured, or null while unread.
		* @returns the registries in the order the dialog lists them.
		*/
		function offeredRegistries(registries) {
			const offered = [];
			const keys = [];
			for (const registry of [...registries === null ? [] : [registries.registry, ...registries.fallbackRegistries], null]) {
				const key = registryKey(registry, registries?.resolved ?? null);
				if (keys.includes(key)) continue;
				offered.push(registry);
				keys.push(key);
			}
			return offered;
		}
		/**
		* Whether an installation is still owned by the Host.
		* @param phase - the dialog's current installation phase.
		* @returns true while a Host result or a check for an active request is outstanding.
		*/
		function isInstallPending(phase) {
			return phase === "starting" || phase === "running" || phase === "cancelling" || phase === "applying" || phase === "unconfirmed";
		}
		/**
		* Offer the configured mainland mirror after a confirmed GitHub connection failure.
		* @param install - the installation and the Host's failure attribution.
		* @returns the offered entry that asks npmmirror, null when that entry is pnpm's own configuration, or undefined when
		* this recovery does not apply; test for undefined, because null is a valid entry.
		*/
		function githubRecoveryRegistry(install) {
			if (install.confirmed !== void 0 || install.phase !== "failed" || install.failure?.failedAt !== "spec-host" || install.failure.kind !== "network" && install.failure.kind !== "timeout") return void 0;
			const host = install.subject?.host?.toLowerCase().split(":")[0];
			if (host !== "github.com" && !host?.endsWith(".github.com")) return void 0;
			const resolved = install.registries?.resolved ?? null;
			return offeredRegistries(install.registries).find((registry) => registryKey(registry, resolved) === NPMMIRROR_REGISTRY);
		}
		/**
		* Whether the install already asks npmmirror first, so switching to the offered mirror would not change the registry.
		* @param install - the installation and its registry choice.
		* @returns true when the chosen registry, offered or typed, compares as npmmirror.
		*/
		function asksMirror(install) {
			const choice = install.registry;
			return registryKey(choice.kind === "custom" ? choice.url.trim() : choice.registry, install.registries?.resolved ?? null) === NPMMIRROR_REGISTRY;
		}
		/**
		* The version an update offers first: the newest one that declares a bundle, accepts the running DSH version, and is
		* neither deprecated nor a prerelease.
		* @param list - the Host's version list.
		* @returns the version, or undefined when none qualifies or the list was refused.
		*/
		function updateCandidate(list) {
			if (list.status !== "listed") return void 0;
			return list.versions.find((version) => installable(version) && version.deprecated === void 0 && !version.prerelease);
		}
		/**
		* Whether the Host can install a listed version in place of the installed one.
		* @param version - one listed version.
		* @returns true when it declares a bundle and accepts the running DSH version.
		*/
		function installable(version) {
			return version.bundle && version.incompatible === void 0;
		}
		/** A refused answer or a change the Host could not apply, carrying what it said and, for a refusal, its code. */
		var RemoteAnswerError = class extends Error {
			reason;
			code;
			incompatible;
			constructor(reason, code, incompatible) {
				super(reason);
				this.reason = reason;
				this.code = code;
				this.incompatible = incompatible;
				this.name = "RemoteAnswerError";
			}
		};
		/** The dialog's reading of a failed change: the Host's code and diagnostic, and the run's classified failure. */
		function failureOf(error, kind, pendingBuilds, failedAt) {
			return {
				reason: error?.diagnostic ?? "",
				...error === void 0 ? {} : { code: error.code },
				...error?.incompatible === void 0 ? {} : { incompatible: error.incompatible },
				...kind === void 0 ? {} : { kind },
				...failedAt === void 0 ? {} : { failedAt },
				...pendingBuilds === void 0 || pendingBuilds.length === 0 ? {} : { pendingBuilds }
			};
		}
		/** The notice a thrown failure becomes: a refusal keeps its code, anything else its words. */
		function failedNotice(error, subject, seq) {
			const code = error instanceof RemoteAnswerError ? error.code : void 0;
			const incompatible = error instanceof RemoteAnswerError ? error.incompatible : void 0;
			return {
				kind: "failed",
				reason: reasonOf(error),
				...code === void 0 ? {} : { code },
				...incompatible === void 0 ? {} : { incompatible },
				...subject,
				seq
			};
		}
		/** The runs with every one still open settled at `exitCode`. */
		function settledRuns(runs, exitCode) {
			return runs.map((run) => run.exitCode === void 0 ? {
				...run,
				exitCode
			} : run);
		}
		/**
		* The key one row occupies in the busy list.
		* @param entryId - the row's Loader entry id.
		* @returns the busy key.
		*/
		function rowKey(entryId) {
			return `row:${entryId}`;
		}
		/**
		* One bundle as the page shows it: its rows joined with the Host's entries.
		* @param bundle - the Host's bundle.
		* @param plugins - the Host's plugin entries.
		* @returns the package view.
		*/
		function packageView(bundle, plugins) {
			const rows = bundle.rows.map((row) => {
				const live = row.entryId === void 0 ? void 0 : plugins.find((plugin) => plugin.entryId === row.entryId);
				return {
					rowId: row.rowId,
					moduleName: row.moduleName,
					enabled: live?.enabled ?? false,
					phase: live?.fiberPhase ?? null,
					...row.meta === void 0 ? {} : { meta: row.meta },
					...row.entryId === void 0 ? {} : { entryId: row.entryId },
					...live?.readOnlyReason === void 0 ? {} : { readOnlyReason: live.readOnlyReason }
				};
			});
			return {
				name: bundle.name,
				official: bundle.official,
				availability: bundle.availability,
				...bundle.installTarget === void 0 ? {} : { installTarget: bundle.installTarget },
				installed: bundle.installed,
				...bundle.listedByDefault === void 0 ? {} : { listedByDefault: bundle.listedByDefault },
				optional: bundle.optional,
				removable: bundle.removable,
				updatable: bundle.updatable,
				enabled: bundle.enabled,
				rows,
				...bundle.version === void 0 ? {} : { version: bundle.version },
				...bundle.source === void 0 ? {} : { source: bundle.source },
				...bundle.description === void 0 ? {} : { description: bundle.description },
				...bundle.meta === void 0 ? {} : { meta: bundle.meta },
				...bundle.readOnlyReason === void 0 ? {} : { readOnlyReason: bundle.readOnlyReason },
				...bundle.error === void 0 ? {} : { error: bundle.error }
			};
		}
		/**
		* The order the list shows packages in: by the short name a person reads, so a
		* card stays put when its bundle is switched, whatever order the Host answers in.
		* @param packages - the Host's bundles as views.
		* @returns the views sorted by short name.
		*/
		function sortPackages(packages) {
			return [...packages].sort((a, b) => shortName(a.name).localeCompare(shortName(b.name)));
		}
		const IDLE_INSTALL = {
			open: false,
			spec: "",
			registries: null,
			registry: OFFICIAL_REGISTRY,
			registryOpen: false,
			registryError: false,
			attempts: null,
			phase: "idle",
			inputError: null,
			subject: null,
			runs: [],
			detailsOpen: false,
			installed: null,
			installedVersion: null,
			restartRequired: false,
			failure: null,
			approvedBuilds: [],
			enabling: false
		};
		/** The dialog back at its spec: the run and its outcome forgotten, the spec and the registries kept. */
		function specAgain(install) {
			const { open, spec, registries, registry, mirrorRecovery, confirmed } = install;
			return {
				...IDLE_INSTALL,
				open,
				spec,
				registries,
				registry,
				...install.subject?.selection === void 0 ? {} : { subject: install.subject },
				...mirrorRecovery === void 0 ? {} : { mirrorRecovery },
				...confirmed === void 0 ? {} : { confirmed }
			};
		}
		/**
		* The choice as the dialog can show it once the Host has answered: nothing remembered starts from the registry the
		* Host asks first; a remembered registry the Host now asks under another entry takes that entry, and one it no
		* longer offers is kept as a typed one.
		*/
		function reconciled(remembered, registries) {
			if (remembered === null) return {
				kind: "offered",
				registry: registries.registry
			};
			if (remembered.kind === "custom" || remembered.registry === null) return remembered;
			const key = registryKey(remembered.registry, registries.resolved);
			const offered = offeredRegistries(registries).find((registry) => registryKey(registry, registries.resolved) === key);
			return offered === void 0 ? {
				kind: "custom",
				url: remembered.registry
			} : {
				kind: "offered",
				registry: offered
			};
		}
		/** Only the shipped public mirror can replace an unconfigured official npm default. */
		function eligibleMirror(registries) {
			if (registries.registry !== null || registries.resolved === null) return void 0;
			let resolved;
			try {
				resolved = normalizeRegistry(registries.resolved);
			} catch (_error) {
				return;
			}
			if (resolved !== "https://registry.npmjs.org/") return void 0;
			return registries.fallbackRegistries.find((registry) => registry === NPMMIRROR_REGISTRY);
		}
		/** Reads and mutates the profile's plugins through the `pluginManager` Remote. */
		var PluginManagerController = class {
			ctx;
			store;
			inFlight;
			rerun = false;
			generation = 0;
			disposed = false;
			/** A successful managed-profile read remains usable even when it returned no bundles. */
			hasCachedInventory = false;
			pendingConfirm;
			/** Cancels the check the dialog has in flight. */
			inspectAbort;
			request;
			noticeSeq = 0;
			analyticsAttempt;
			registryRead;
			/** A Discover entry chose the dialog's registry; that choice applies to this dialog only and is never remembered. */
			transientRegistry = false;
			/** Bundle detail documents the page shows. */
			details;
			/** The registry last used from this browser, kept across dialogs and page loads; null until one was used. */
			registryMemory = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(null, { persist: { name: "dsh.plugin-manager.install-registry" } });
			/**
			* @param ctx - the tab plugin's context, whose `remote.pluginManager` and `remote.pluginInventory` namespaces answer.
			*/
			constructor(ctx) {
				this.ctx = ctx;
				this.details = new BundleDetailController(ctx, () => document.baseURI);
				this.store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({
					status: "idle",
					refreshStatus: "idle",
					packages: [],
					busy: [],
					notice: null,
					install: IDLE_INSTALL,
					confirm: null,
					highlight: null,
					versions: {},
					update: null
				});
			}
			/**
			* Read the tab's state.
			* @returns the current sync snapshot (stable reference until the next change).
			*/
			getSnapshot() {
				return this.store.getSnapshot();
			}
			/**
			* Observe existing bundle and row operations independently of the page's lifetime.
			* @param packageName Bundle whose management activity is observed.
			* @returns A read-only source; unsubscribe releases the caller's observation.
			*/
			observeChanges(packageName) {
				return {
					getSnapshot: () => {
						const state = this.getSnapshot();
						return bundleBusy(state, packageName) || (state.packages.find((pkg) => pkg.name === packageName)?.rows.some((row) => row.entryId !== void 0 && state.busy.includes(rowKey(row.entryId))) ?? false);
					},
					subscribe: (listener) => this.store.subscribe(listener)
				};
			}
			/** Stop publishing and drop every late settlement. */
			dispose() {
				this.disposed = true;
				this.details.dispose();
				this.registryRead = void 0;
				this.request = void 0;
				this.generation += 1;
			}
			/**
			* Build the face the tab's slot registration injects.
			* @param configLedger - the projection of the plugins carrying configuration, bound beside the tab's own state.
			* @param pluginTabs - the tabs other plugins contribute through `plugins.tab`.
			* @param resolveText - render-time package text resolution supplied by the locale service.
			* @returns the tab's snapshot sources and its actions.
			*/
			inject(configLedger, pluginTabs, resolveText) {
				const details = this.details;
				return {
					resolveText,
					hooks: {
						pluginManager: this.store,
						configLedger,
						pluginTabs,
						configurations: this.ctx.configForms.describe(),
						bundleDetails: details.store,
						locale: this.ctx.locale
					},
					loadDetail: (name, version, language, fromNpm) => {
						details.load(name, version, language, fromNpm);
					},
					retryDetail: (name, version, language, fromNpm) => {
						details.retry(name, version, language, fromNpm);
					},
					detailImage: (name, document, destination, fromNpm) => details.image(name, document, destination, fromNpm),
					configForm: (id) => this.ctx.configForms.get(id),
					ensure: () => {
						if (this.getSnapshot().status === "idle") this.load();
					},
					refresh: () => {
						this.refresh();
					},
					openInstall: () => {
						this.ctx.get("productAnalytics")?.track("plugin_add_button_click", {});
						this.openDialog();
					},
					installFrom: ({ spec, registry, title, version }) => {
						if (!this.openDialog()) return;
						this.transientRegistry = registry !== void 0;
						this.patchInstall({
							spec,
							confirmed: {
								title,
								version
							},
							...registry === void 0 ? {} : { registry: {
								kind: "custom",
								url: registry
							} }
						});
						this.runInstall();
					},
					closeInstall: () => {
						if (isInstallPending(this.getSnapshot().install.phase)) {
							this.patchInstall({ open: false });
							this.cancelInstall();
							return;
						}
						if (this.getSnapshot().install.phase === "checking" || this.getSnapshot().install.subject?.bundled) this.finishAnalytics("cancelled");
						this.abortInspect();
						this.registryRead = void 0;
						this.patch({ install: IDLE_INSTALL });
					},
					editInstallSpec: (text) => {
						const install = this.getSnapshot().install;
						if (install.phase === "checking" || isInstallPending(install.phase)) return;
						this.patchInstall(install.phase === "idle" ? {
							spec: text,
							inputError: null,
							subject: null
						} : {
							...specAgain(install),
							spec: text,
							subject: null
						});
					},
					runInstall: () => {
						this.runInstall();
					},
					toggleRegistryOptions: () => {
						this.patchInstall({ registryOpen: !this.getSnapshot().install.registryOpen });
					},
					chooseRegistry: (choice) => {
						if (this.getSnapshot().install.phase !== "idle") return;
						this.transientRegistry = false;
						this.patchInstall({
							registry: choice,
							registryError: false
						});
					},
					changeRegistry: () => {
						const install = this.getSnapshot().install;
						if (install.phase === "failed") this.patch({ install: {
							...specAgain(install),
							registryOpen: true
						} });
					},
					useGithubMirror: () => {
						const install = this.getSnapshot().install;
						const mirror = githubRecoveryRegistry(install);
						if (mirror === void 0) return;
						const recovered = {
							...specAgain(install),
							spec: "",
							mirrorRecovery: true
						};
						if (asksMirror(install)) {
							this.patch({ install: recovered });
							return;
						}
						const registry = {
							kind: "offered",
							registry: mirror
						};
						this.registryMemory.set(registry);
						this.patch({ install: {
							...recovered,
							registry
						} });
					},
					approveBuildsAndRetry: () => {
						this.approveBuildsAndRetry();
					},
					cancelInstall: () => {
						this.cancelInstall();
					},
					reconcileInstall: () => {
						this.reconcileInstall();
					},
					toggleInstallDetails: () => {
						this.patchInstall({ detailsOpen: !this.getSnapshot().install.detailsOpen });
					},
					enableInstalled: () => {
						this.enableInstalled();
					},
					clearHighlight: () => {
						if (this.getSnapshot().highlight !== null) this.patch({ highlight: null });
					},
					setEnabled: (packageName, enabled) => {
						const pkg = this.getSnapshot().packages.find((pkg) => pkg.name === packageName);
						if (enabled && pkg?.availability === "missing" && pkg.installTarget !== void 0) {
							this.openCatalogInstall(pkg, pkg.installTarget, true);
							return;
						}
						this.run(packageName, {
							packageName,
							action: enabled ? "enable" : "disable"
						}, async () => {
							const result = await this.ctx.remote.pluginManager.setBundleEnabled(packageName, enabled);
							this.applied(result, packageName);
							if (result.ok && (result.value.application === "applied" || result.value.application === "restart-required")) this.trackToggle(packageName, enabled);
						});
					},
					update: (packageName) => {
						const pkg = this.getSnapshot().packages.find((pkg) => pkg.name === packageName);
						const target = pkg?.installTarget;
						if (pkg === void 0 || target === void 0 || pkg.availability === "installation") return;
						if (!pkg.installed) {
							this.openCatalogInstall(pkg, target, pkg.enabled);
							return;
						}
						this.run(packageName, {
							packageName,
							action: "uninstall"
						}, async () => {
							const removed = await this.ctx.remote.pluginManager.removeBundle(packageName);
							if (removed.ok && removed.value.error?.code === "stop-profile") {
								this.openCatalogInstall(pkg, target, pkg.enabled);
								return;
							}
							this.applied(removed, packageName);
							this.openCatalogInstall(pkg, target, pkg.enabled);
						});
					},
					uninstall: (packageName) => {
						this.pendingConfirm = () => this.run(packageName, {
							packageName,
							action: "uninstall"
						}, async () => {
							this.ctx.get("productAnalytics")?.track("confirm_uninstall_plugin", { plugin_name: packageName });
							this.applied(await this.ctx.remote.pluginManager.removeBundle(packageName), packageName);
						});
						this.patch({ confirm: {
							action: "uninstall",
							packageName
						} });
					},
					confirm: () => {
						this.confirm();
					},
					cancelConfirm: () => {
						this.pendingConfirm = void 0;
						this.patch({ confirm: null });
					},
					setRowEnabled: (entryId, enabled) => {
						this.run(rowKey(entryId), {
							packageName: entryId,
							action: enabled ? "rowEnable" : "rowDisable"
						}, async () => {
							const result = await this.ctx.remote.pluginManager.setPluginEnabled(entryId, enabled);
							this.applied(result, entryId);
							if (result.ok && (result.value.application === "applied" || result.value.application === "restart-required")) this.trackToggle(entryId, enabled, true);
						});
					},
					dismissNotice: () => {
						this.patch({ notice: null });
					},
					checkVersions: (packageName) => {
						this.checkVersions(packageName);
					},
					ensureVersions: (packageName) => {
						if (this.getSnapshot().versions[packageName] === void 0) this.checkVersions(packageName);
					},
					openUpdate: (packageName, version) => {
						const check = this.getSnapshot().versions[packageName];
						if (this.getSnapshot().update?.phase === "running" || check?.phase !== "done" || check.list.status !== "listed") return;
						this.patch({ update: {
							packageName,
							from: check.list.installed,
							to: version,
							registry: check.list.registry,
							phase: "confirm",
							steps: [],
							result: null,
							outputOpen: false
						} });
					},
					runUpdate: () => {
						this.runUpdate();
					},
					closeUpdate: () => {
						if (this.getSnapshot().update?.phase !== "running") this.patch({ update: null });
					},
					toggleUpdateOutput: () => {
						const update = this.getSnapshot().update;
						if (update !== null) this.patch({ update: {
							...update,
							outputOpen: !update.outputOpen
						} });
					}
				};
			}
			/**
			* Open the install dialog: a new one starts from the registry last used here and reads what the Host offers; a hidden
			* installation reopens as it is.
			* @returns whether a new dialog started.
			*/
			openDialog() {
				const started = this.getSnapshot().install.requestId === void 0;
				if (started) {
					this.transientRegistry = false;
					this.patch({ install: {
						...IDLE_INSTALL,
						open: true,
						registry: this.registryMemory.getSnapshot() ?? OFFICIAL_REGISTRY
					} });
					const read = { choice: this.getSnapshot().install.registry };
					this.registryRead = read;
					read.done = this.readRegistries(read).finally(() => {
						delete read.done;
					});
				} else this.patchInstall({ open: true });
				this.reconcileInstall();
				return started;
			}
			/**
			* Follow the Host's steps of this tab's update.
			* @param progress - a request id and step received from the Host.
			*/
			updateProgress(progress) {
				const update = this.getSnapshot().update;
				if (update?.phase !== "running" || update.requestId !== progress.requestId || update.steps.includes(progress.step)) return;
				this.patch({ update: {
					...update,
					steps: [...update.steps, progress.step]
				} });
			}
			/** Read one package's newer versions; a transport failure reads as an unknown refusal. */
			async checkVersions(packageName) {
				const { versions, update } = this.getSnapshot();
				if (this.disposed || versions[packageName]?.phase === "checking" || update?.phase === "running" && update.packageName === packageName) return;
				this.patchVersions(packageName, { phase: "checking" });
				const answer = await this.ctx.remote.pluginManager.listVersions(packageName, {});
				const list = answer.ok ? answer.value : {
					status: "refused",
					problem: "unknown",
					reason: answer.error.message,
					attempts: []
				};
				this.patchVersions(packageName, {
					phase: "done",
					list,
					checkedAt: Date.now()
				});
			}
			/** Check the updatable packages one after another, so one click starts at most one package's registry lookups. */
			async checkAllVersions() {
				for (const pkg of this.getSnapshot().packages.filter((item) => item.updatable)) await this.checkVersions(pkg.name);
			}
			/** Hand the confirmed update to the Host, keep its outcome, then read the package and its versions again. */
			async runUpdate() {
				const update = this.getSnapshot().update;
				if (this.disposed || update === null || update.phase !== "confirm") return;
				const requestId = randomUUID();
				const running = {
					...update,
					phase: "running",
					steps: [],
					requestId,
					result: null
				};
				this.patch({ update: running });
				const answer = await this.ctx.remote.pluginManager.updateBundle(update.packageName, update.to, {
					registry: update.registry,
					requestId
				});
				const current = this.getSnapshot().update;
				this.patch({ update: {
					...current,
					phase: "done",
					...answer.ok ? { result: answer.value } : { lost: answer.error.message }
				} });
				await this.load();
				await this.checkVersions(update.packageName);
			}
			/**
			* Forget the checks that no longer describe a listed package: one that left the list or stopped being updatable, and
			* one answered for another installed version, after a reinstallation or a change from another surface.
			*/
			dropStaleVersions() {
				const { packages, versions } = this.getSnapshot();
				const current = Object.fromEntries(Object.entries(versions).filter(([name, check]) => {
					const pkg = packages.find((item) => item.name === name);
					return pkg?.updatable === true && (check.phase === "checking" || check.list.status !== "listed" || check.list.installed === pkg.version);
				}));
				if (Object.keys(current).length !== Object.keys(versions).length) this.patch({ versions: current });
			}
			patchVersions(packageName, check) {
				this.patch({ versions: {
					...this.getSnapshot().versions,
					[packageName]: check
				} });
			}
			/**
			* Follow the Host's cancellation window for this dialog's installation.
			* @param progress - a request id and phase received from the Host.
			*/
			installProgress(progress) {
				const install = this.getSnapshot().install;
				if (install.requestId !== progress.requestId || !isInstallPending(install.phase)) return;
				const request = this.request;
				if (request === void 0) return;
				request.acknowledged = true;
				if (install.phase === "applying") return;
				if (progress.phase === "installing" && request.cancellation !== void 0) {
					if (request.cancellation.waitingForStart) this.sendCancellation(request, request.cancellation);
					return;
				}
				const attempt = progress.attempt;
				this.patchInstall({
					phase: progress.phase === "installing" ? "running" : progress.phase,
					...attempt === void 0 ? {} : { attempts: {
						registries: [...install.attempts?.registries ?? [], attempt.registry],
						total: attempt.total
					} }
				});
			}
			currentRegistryRead(read) {
				return !this.disposed && this.registryRead === read;
			}
			/** Read the registries the Host offers, for the dialog just opened; a refused read leaves pnpm's own and a typed one. */
			async readRegistries(read) {
				const answer = await this.ctx.remote.pluginManager.registries();
				const install = this.getSnapshot().install;
				if (!this.currentRegistryRead(read) || !install.open || !answer.ok) return;
				const remembered = this.registryMemory.getSnapshot();
				const untouched = install.registry === read.choice && (install.phase === "idle" || install.phase === "checking");
				if (untouched) read.choice = reconciled(remembered, answer.value);
				this.patchInstall({
					registries: answer.value,
					...untouched ? { registry: read.choice } : {}
				});
				const mirror = eligibleMirror(answer.value);
				if (!untouched || remembered !== null || mirror === void 0) return;
				const fastest = await this.ctx.remote.pluginRegistryProbe.fastest();
				const current = this.getSnapshot().install;
				if (!this.currentRegistryRead(read) || !current.open || current.phase !== "idle" && current.phase !== "checking" || current.registry !== read.choice || !fastest.ok || fastest.value !== mirror) return;
				read.choice = {
					kind: "offered",
					registry: mirror
				};
				this.patchInstall({ registry: read.choice });
			}
			/**
			* Fold a chunk belonging to this installation into its pnpm command.
			* A final chunk may arrive after the install answer and still updates an existing run.
			* @param chunk - the chunk the Host forwarded.
			*/
			appendLog(chunk) {
				const install = this.getSnapshot().install;
				if (chunk.requestId !== install.requestId) return;
				if (install.requestId !== void 0 && (install.phase === "starting" || install.phase === "cancelling" || install.phase === "unconfirmed")) this.installProgress({
					requestId: install.requestId,
					phase: "installing"
				});
				const index = install.runs.findIndex((run) => run.jobId === chunk.jobId);
				if (index === -1 && !isInstallPending(install.phase)) return;
				const settled = chunk.exitCode === void 0 ? {} : { exitCode: chunk.exitCode };
				const runs = index === -1 ? [...install.runs, {
					jobId: chunk.jobId,
					command: chunk.argv.join(" "),
					cwd: chunk.cwd,
					output: chunk.text,
					...settled
				}] : install.runs.map((run, at) => at === index ? {
					...run,
					output: run.output + chunk.text,
					...settled
				} : run);
				this.patchInstall({ runs });
			}
			/**
			* Read the bundles and the entries their rows run as. A call during an
			* in-flight read marks one rerun after it settles.
			* @returns settlement after this call's freshness is reflected.
			*/
			load() {
				if (this.disposed) return Promise.resolve();
				this.reconcileInstall();
				if (this.inFlight !== void 0) {
					this.rerun = true;
					return this.inFlight;
				}
				const run = Promise.resolve().then(() => this.read());
				this.inFlight = run;
				return run;
			}
			/**
			* Keep manual refresh feedback until its coalesced reads and the version checks of the updatable packages settle,
			* without clearing cached cards; a failed read checks nothing.
			*/
			async refresh() {
				if (this.disposed || this.getSnapshot().refreshStatus === "refreshing") return;
				const startedAt = Date.now();
				this.patch({
					refreshStatus: "refreshing",
					...this.getSnapshot().notice?.kind === "refresh-failed" ? { notice: null } : {}
				});
				try {
					await this.load();
					if (this.getSnapshot().status !== "error") await this.checkAllVersions();
				} catch (_error) {
					this.patch({ status: "error" });
				} finally {
					const remaining = REFRESH_SPINNER_MIN_MS - (Date.now() - startedAt);
					if (remaining > 0) await new Promise((resolve) => {
						setTimeout(resolve, remaining);
					});
					this.settleRefresh();
				}
			}
			/** Publish refresh feedback only before disposal. */
			settleRefresh() {
				if (this.disposed) return;
				const failed = this.getSnapshot().status === "error";
				this.patch(failed && this.hasCachedInventory ? {
					status: "ready",
					refreshStatus: "idle",
					notice: {
						kind: "refresh-failed",
						seq: ++this.noticeSeq
					}
				} : { refreshStatus: failed ? "failed" : "idle" });
			}
			async read() {
				try {
					do {
						this.rerun = false;
						const generation = ++this.generation;
						if (this.getSnapshot().status === "idle") this.patch({ status: "loading" });
						const inventory = await this.ctx.remote.pluginInventory.list();
						if (generation !== this.generation) return;
						if (!inventory.ok) {
							this.patch({ status: "error" });
							continue;
						}
						if (inventory.value.managementAvailable !== true) {
							this.hasCachedInventory = false;
							this.patch({
								status: "unavailable",
								packages: []
							});
							continue;
						}
						const [bundles, plugins] = await Promise.all([this.ctx.remote.pluginManager.listBundles(), this.ctx.remote.pluginManager.listPlugins()]);
						if (generation !== this.generation) return;
						if (!bundles.ok || !plugins.ok) {
							this.patch({ status: "error" });
							continue;
						}
						this.hasCachedInventory = true;
						this.patch({
							status: "ready",
							refreshStatus: this.getSnapshot().refreshStatus === "refreshing" ? "refreshing" : "idle",
							packages: sortPackages(bundles.value.map((bundle) => packageView(bundle, plugins.value)))
						});
						this.dropStaleVersions();
					} while (this.shouldRerun());
				} finally {
					this.inFlight = void 0;
				}
			}
			shouldRerun() {
				return this.rerun;
			}
			async confirm() {
				const pending = this.pendingConfirm;
				this.pendingConfirm = void 0;
				this.patch({ confirm: null });
				if (pending !== void 0) await pending();
			}
			/** Drop the check in flight; its answer is ignored. */
			abortInspect() {
				this.inspectAbort?.abort();
				this.inspectAbort = void 0;
			}
			/** Whether a settlement arrives too late to matter: the store is disposed, or the dialog moved on. */
			gone(signal) {
				return this.disposed || signal.aborted;
			}
			/** Reuse the install dialog with an exact catalog target and an explicit selection outcome. */
			openCatalogInstall(pkg, target, enabled) {
				if (this.disposed) return;
				const { phase } = this.getSnapshot().install;
				if (phase === "checking" || isInstallPending(phase)) {
					this.patchInstall({ open: true });
					return;
				}
				this.abortInspect();
				const registry = this.registryMemory.getSnapshot() ?? OFFICIAL_REGISTRY;
				const local = target.spec.startsWith("link:");
				const subject = {
					status: "accepted",
					kind: local ? "path" : "registry",
					name: pkg.name,
					version: target.version,
					bundle: true,
					spec: target.spec,
					registry: registry.kind === "custom" ? registry.url : registry.registry,
					selection: enabled,
					...local ? {} : { saveExact: true }
				};
				this.patch({ install: {
					...IDLE_INSTALL,
					open: true,
					spec: subject.spec,
					registry,
					subject
				} });
				const read = { choice: registry };
				this.registryRead = read;
				read.done = this.readRegistries(read).finally(() => {
					delete read.done;
				});
				this.runInstall();
			}
			/**
			* Offer a default-hidden shipped bundle for explicit enablement, or check
			* and install the typed spec. A refused spec returns to the field with its
			* reason; an accepted one becomes the subject shown while pnpm runs.
			*/
			async runInstall() {
				const state = this.getSnapshot();
				const install = state.install;
				const spec = install.spec.trim();
				if (install.phase === "checking" || isInstallPending(install.phase) || spec === "") return;
				if (this.ctx.get("productAnalytics")?.enabled) {
					this.analyticsAttempt = {
						input: sanitizeInstallInput(spec),
						started: Date.now()
					};
					this.ctx.get("productAnalytics")?.track("plugin_install_click", { input_value: sanitizeInstallInput(spec) });
				}
				const listed = state.packages.find((pkg) => pkg.name === spec);
				const catalogSubject = install.subject?.selection === void 0 || install.subject.spec !== spec ? void 0 : install.subject;
				if (listed?.availability === "installation" && listed.optional && listed.listedByDefault === false && !listed.enabled && listed.error === void 0 && listed.readOnlyReason === void 0) {
					this.abortInspect();
					this.patch({ install: {
						...IDLE_INSTALL,
						open: true,
						spec,
						registries: install.registries,
						registry: install.registry,
						phase: "done",
						installed: listed.name,
						installedVersion: listed.version ?? null,
						subject: {
							status: "accepted",
							kind: "registry",
							bundle: true,
							name: listed.name,
							spec,
							registry: null,
							bundled: true,
							...listed.version === void 0 ? {} : { version: listed.version },
							...listed.description === void 0 ? {} : { description: listed.description }
						}
					} });
					return;
				}
				if (listed !== void 0 && listed.availability !== "missing" && catalogSubject === void 0) {
					this.finishAnalytics("failed", "already-installed");
					this.patchInstall({
						phase: "idle",
						inputError: {
							problem: listed.availability === "installation" ? "shipped" : "already-installed",
							reason: spec
						}
					});
					return;
				}
				const choice = install.registry;
				const typed = choice.kind === "custom" ? choice.url.trim() : void 0;
				if (typed !== void 0 && !REGISTRY_URL.test(typed)) {
					this.finishAnalytics("failed", "invalid-registry");
					this.patchInstall({
						phase: "idle",
						registryError: true,
						registryOpen: true
					});
					return;
				}
				this.abortInspect();
				const controller = new AbortController();
				this.inspectAbort = controller;
				this.patchInstall({
					phase: "checking",
					inputError: null,
					subject: catalogSubject ?? null,
					runs: [],
					detailsOpen: false,
					attempts: null,
					registryOpen: false,
					installed: null,
					installedVersion: null,
					restartRequired: false,
					failure: null,
					approvedBuilds: []
				});
				const read = this.registryRead;
				if (read !== void 0 && choice === read.choice && read.done !== void 0) {
					await read.done;
					if (this.gone(controller.signal) || this.registryRead !== read) return;
				}
				const currentChoice = this.getSnapshot().install.registry;
				const selected = currentChoice.kind === "custom" ? {
					...currentChoice,
					url: currentChoice.url.trim()
				} : currentChoice;
				const registry = selected.kind === "custom" ? selected.url : selected.registry;
				if (!this.transientRegistry) this.registryMemory.set(selected);
				if (catalogSubject !== void 0) {
					this.inspectAbort = void 0;
					await this.startInstall({
						...catalogSubject,
						registry
					});
					return;
				}
				const inspected = await this.ctx.remote.pluginManager.inspect(spec, { registry }, controller.signal);
				if (this.gone(controller.signal)) return;
				this.inspectAbort = void 0;
				if (!inspected.ok) {
					this.finishAnalytics("failed", inspected.error.code);
					this.patchInstall({
						phase: "idle",
						inputError: {
							problem: "unknown",
							reason: inspected.error.message
						}
					});
					return;
				}
				if (inspected.value.status === "refused") {
					const { problem, reason, registries } = inspected.value;
					this.finishAnalytics("failed", problem);
					this.patchInstall({
						phase: "idle",
						inputError: {
							problem,
							reason,
							...registries === void 0 ? {} : { registries }
						}
					});
					return;
				}
				await this.startInstall({
					spec,
					...inspected.value
				});
			}
			/**
			* Hand the checked spec to the Host and settle the dialog from its answer.
			* `approvedBuilds` names the pending install scripts the person allowed;
			* the Host saves that permission for this profile before pnpm runs.
			*/
			async startInstall(subject, approvedBuilds) {
				const { spec, registry } = subject;
				const requestId = randomUUID();
				const request = {
					requestId,
					acknowledged: false,
					replyLost: false,
					recovering: false
				};
				this.request = request;
				this.patchInstall({
					phase: "starting",
					requestId,
					subject,
					runs: [],
					attempts: null,
					failure: null,
					installed: null,
					installedVersion: null,
					approvedBuilds: []
				});
				const result = await this.ctx.remote.pluginManager.installBundle(spec, {
					enabled: subject.selection ?? false,
					requestId,
					registry,
					...subject.saveExact === void 0 ? {} : { saveExact: subject.saveExact },
					...approvedBuilds === void 0 ? {} : { approvedBuilds: [...approvedBuilds] }
				});
				if (this.disposed || this.request !== request) return;
				if (!result.ok) {
					request.replyLost = true;
					this.installUncertain("result", result.error.message);
					this.reconcileInstall();
					return;
				}
				this.settleInstall(result.value);
			}
			/** A recovery call shares the Host's active result; absent results are explicitly unknown. */
			async reconcileInstall() {
				const request = this.request;
				if (request === void 0 || !request.replyLost || request.recovering) return;
				request.recovering = true;
				const result = await this.ctx.remote.pluginManager.waitForInstall(request.requestId);
				if (this.disposed || this.request !== request) return;
				request.recovering = false;
				if (!result.ok) {
					this.installUncertain("result", result.error.message);
					return;
				}
				if (result.value !== null) {
					this.settleInstall(result.value);
					return;
				}
				this.request = void 0;
				this.finishAnalytics("unknown");
				this.patchInstall({
					phase: "unknown",
					failure: null,
					runs: settledRuns(this.getSnapshot().install.runs, null)
				});
				this.notifyHiddenInstall("unknown");
				this.load();
			}
			settleInstall(result) {
				this.finishAnalytics(result.application === "failed" ? "failed" : result.application === "cancelled" ? "cancelled" : "success", result.application === "failed" ? result.error?.code : void 0, result.bundle);
				const { runs, attempts } = this.getSnapshot().install;
				this.request = void 0;
				const asked = result.registries === void 0 ? {} : { attempts: {
					registries: result.registries,
					total: Math.max(attempts?.total ?? 0, result.registries.length)
				} };
				if (result.application === "cancelled") this.offerSpecAgain({
					kind: "cancelled",
					seq: ++this.noticeSeq
				});
				else if (result.application === "failed") {
					const packages = result.packageResult;
					this.patchInstall({
						phase: "failed",
						runs: settledRuns(runs, packages?.exitCode ?? null),
						failure: failureOf(result.error, packages?.kind, result.pendingBuilds, result.failedAt),
						...asked
					});
				} else this.patchInstall({
					phase: "done",
					runs: settledRuns(runs, 0),
					failure: null,
					installed: result.bundle ?? null,
					installedVersion: result.version ?? null,
					restartRequired: result.application === "restart-required",
					...result.restartReason === void 0 ? {} : { restartReason: result.restartReason },
					approvedBuilds: result.approvedBuilds ?? [],
					...asked
				});
				const completed = this.getSnapshot().install;
				if (completed.phase === "done" && completed.subject?.selection !== void 0 && result.bundle !== void 0) {
					this.applied({
						ok: true,
						value: result
					}, result.bundle);
					this.patch({ highlight: result.bundle });
					if (completed.subject.selection) this.trackToggle(result.bundle, true);
				}
				const phase = this.getSnapshot().install.phase;
				if (phase === "done" || phase === "failed") this.notifyHiddenInstall(phase);
				this.load();
			}
			installUncertain(uncertainty, reason) {
				this.patchInstall({
					phase: this.getSnapshot().install.phase === "applying" ? "applying" : "unconfirmed",
					failure: {
						reason,
						uncertainty
					}
				});
				this.notifyHiddenInstall("unconfirmed");
			}
			/**
			* Allow the install scripts the failed run left pending and run the same
			* spec again. Only the failed screen with pending names offers this.
			*/
			async approveBuildsAndRetry() {
				const install = this.getSnapshot().install;
				const pending = install.failure?.pendingBuilds;
				if (install.phase !== "failed" || install.subject === null || pending === void 0 || pending.length === 0) return;
				if (this.ctx.get("productAnalytics")?.enabled) this.analyticsAttempt = {
					input: sanitizeInstallInput(install.subject.spec),
					started: Date.now()
				};
				await this.startInstall(install.subject, pending);
			}
			/**
			* Leave the check or the failed screen for the spec at once; a Host-owned
			* run is asked to stop and its state waits for the Host's word, since
			* neither a dropped RPC nor a closed connection means pnpm has stopped.
			*/
			async cancelInstall() {
				const install = this.getSnapshot().install;
				if (install.phase === "checking" || install.phase === "failed" || install.phase === "unknown") {
					if (install.phase === "checking") this.finishAnalytics("cancelled");
					this.abortInspect();
					this.offerSpecAgain();
					return;
				}
				const request = this.request;
				if (install.phase !== "starting" && install.phase !== "running" && install.phase !== "unconfirmed" || request === void 0) return;
				if (request.cancellation !== void 0 && !request.cancellation.waitingForStart) return;
				const cancellation = { waitingForStart: false };
				request.cancellation = cancellation;
				await this.sendCancellation(request, cancellation);
			}
			/** A cancellation that overtakes installation is retried after the Host acknowledges that request. */
			async sendCancellation(request, cancellation) {
				const acknowledged = request.acknowledged;
				cancellation.waitingForStart = false;
				this.patchInstall({
					phase: "cancelling",
					failure: null
				});
				const result = await this.ctx.remote.pluginManager.cancelInstall(request.requestId);
				if (this.disposed || this.request !== request || request.cancellation !== cancellation) return;
				if (!result.ok) {
					cancellation.waitingForStart = !request.acknowledged;
					if (request.acknowledged) request.cancellation = void 0;
					this.installUncertain(request.replyLost ? "result" : "cancellation", result.error.message);
					return;
				}
				if (result.value.status === "cancelled") {
					this.finishAnalytics("cancelled");
					this.offerSpecAgain({
						kind: "cancelled",
						seq: ++this.noticeSeq
					});
					this.load();
				} else if (result.value.status === "too-late") {
					request.acknowledged = true;
					request.cancellation = void 0;
					this.patchInstall({ phase: "applying" });
					this.notifyHiddenInstall("applying");
					this.reconcileInstall();
				} else if (request.replyLost) {
					request.cancellation = void 0;
					this.installUncertain("result", "");
					this.reconcileInstall();
				} else if (!acknowledged && this.getSnapshot().install.phase !== "applying") if (request.acknowledged) await this.sendCancellation(request, cancellation);
				else {
					cancellation.waitingForStart = true;
					this.installUncertain("acceptance", "");
				}
				else {
					request.cancellation = void 0;
					this.installUncertain("cancellation", "");
				}
			}
			notifyHiddenInstall(outcome) {
				if (!this.getSnapshot().install.open) this.patch({ notice: {
					kind: "install",
					outcome,
					seq: ++this.noticeSeq
				} });
			}
			/**
			* Release the tracked request and return to editing with its spec retained.
			* A cancellation notice is supplied only after the Host confirms it stopped.
			*/
			offerSpecAgain(notice = null) {
				this.request = void 0;
				this.patch({
					install: specAgain(this.getSnapshot().install),
					...notice === null ? {} : { notice }
				});
			}
			/**
			* Enable the bundle ready from an install or the installation, then close the dialog and
			* mark it in the list. A refusal toasts and still closes.
			*/
			async enableInstalled() {
				const install = this.getSnapshot().install;
				if (install.phase !== "done" || install.enabling) return;
				const name = install.installed;
				this.patchInstall({ enabling: true });
				if (name !== null) {
					const result = await this.ctx.remote.pluginManager.setBundleEnabled(name, true);
					if (this.disposed) return;
					this.finishAnalytics(result.ok && result.value.application !== "failed" ? "success" : "failed", result.ok ? result.value.error?.code : result.error.code, name);
					try {
						this.applied(result, name);
						if (result.ok && (result.value.application === "applied" || result.value.application === "restart-required")) this.trackToggle(name, true);
					} catch (error) {
						this.patch({ notice: failedNotice(error, {
							packageName: name,
							action: "enable"
						}, ++this.noticeSeq) });
					}
				}
				this.patch({
					install: IDLE_INSTALL,
					highlight: name
				});
				await this.load();
			}
			/**
			* Run one action under a busy key, turn its failure into the notice, and
			* re-read the Host afterwards whatever happened.
			*/
			async run(key, subject, action) {
				if (this.disposed || this.getSnapshot().busy.includes(key)) return;
				this.patch({
					busy: [...this.getSnapshot().busy, key],
					notice: null
				});
				try {
					await action();
				} catch (error) {
					this.patch({ notice: failedNotice(error, subject, ++this.noticeSeq) });
				} finally {
					this.patch({ busy: this.getSnapshot().busy.filter((entry) => entry !== key) });
				}
				await this.load();
			}
			/**
			* Publish a change's outcome: a refused answer or a change the Host could
			* not apply throws for {@link run} to report; a change that waits for the
			* next start, that a higher layer overrides, or that the Host stopped is
			* said in passing.
			*/
			applied(answer, packageName) {
				if (!answer.ok) throw new RemoteAnswerError(answer.error.message);
				const result = answer.value;
				switch (result.application) {
					case "failed": throw new RemoteAnswerError(result.error?.diagnostic ?? "", result.error?.code, result.error?.incompatible);
					case "cancelled":
						this.patch({ notice: {
							kind: "cancelled",
							seq: ++this.noticeSeq
						} });
						return;
					case "restart-required":
						this.patch({ notice: {
							kind: "restart",
							packageName,
							reason: result.restartReason,
							seq: ++this.noticeSeq
						} });
						return;
					case "overridden":
						this.patch({ notice: {
							kind: "overridden",
							packageName,
							seq: ++this.noticeSeq
						} });
						return;
					case "applied": return;
				}
			}
			trackToggle(name, enabled, row = false) {
				const bundle = this.getSnapshot().packages.find((pkg) => row ? pkg.rows.some((item) => item.entryId === name) : pkg.name === name);
				const pluginName = row ? bundle?.rows.find((item) => item.entryId === name)?.moduleName : name;
				if (bundle === void 0 || pluginName === void 0) return;
				this.ctx.get("productAnalytics")?.track("plugin_toggle", {
					plugin_name: pluginName,
					plugin_type: row ? "plugin" : "bundle",
					is_enabled: enabled,
					is_builtin: bundle.availability === "installation"
				});
			}
			finishAnalytics(status, reason, name) {
				const attempt = this.analyticsAttempt;
				this.analyticsAttempt = void 0;
				if (attempt === void 0 || this.disposed) return;
				const errorReason = status === "cancelled" ? "user_cancelled" : status === "unknown" ? "unknown_result" : reason;
				this.ctx.get("productAnalytics")?.track("install_plugin_result", {
					input_value: attempt.input,
					is_success: status === "success",
					duration: Math.max(0, Date.now() - attempt.started),
					...errorReason === void 0 ? {} : { error_reason: errorReason },
					...name === void 0 ? {} : { plugin_name: name }
				});
			}
			patch(next) {
				if (this.disposed) return;
				this.store.set({
					...this.getSnapshot(),
					...next
				});
			}
			patchInstall(next) {
				this.patch({ install: {
					...this.getSnapshot().install,
					...next
				} });
			}
		};
		/** What a thrown failure said: a refused answer's reason, else the error's message. */
		function reasonOf(error) {
			return error instanceof Error ? error.message : String(error);
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-plugin-manager/src/client/PluginManagerPage.module.css.mjs
		const css = ".jh5nvW_page{--plugin-page-inset:clamp(24px, 4vw, 48px);--plugin-page-top-inset:28px;--bundle-progress-size:14px;--bundle-toggle-gap:8px;box-sizing:border-box;height:100%;padding:0 var(--plugin-page-inset);color:var(--dsw-alias-label-primary);flex-direction:column;align-items:center;display:flex}.jh5nvW_page>*{flex:none;width:100%;max-width:960px}.jh5nvW_pageBody>.jh5nvW_pageBar{width:calc(100% + 2 * var(--plugin-page-inset) + var(--plugin-page-scrollbar-width,0px));max-width:none;margin-inline:calc(-1 * var(--plugin-page-inset));box-sizing:border-box;padding-inline:var(--plugin-page-inset);flex-direction:column;align-self:flex-start;display:flex;position:relative;container:jh5nvW_plugin-page-bar/inline-size}.jh5nvW_pageBar>.jh5nvW_pageHead{align-self:center;width:100%;max-width:960px}.jh5nvW_page>.jh5nvW_pageBody{min-height:0;width:calc(100% + 2 * var(--plugin-page-inset));max-width:none;margin-inline:calc(-1 * var(--plugin-page-inset));box-sizing:border-box;padding:0 var(--plugin-page-inset) 48px;scroll-padding-top:var(--plugin-header-scroll-padding,0px);flex-direction:column;flex:1;align-items:center;gap:32px;display:flex;position:relative;overflow:hidden auto}.jh5nvW_page>:not(.jh5nvW_pageBody)+.jh5nvW_pageBody{padding-top:32px}.jh5nvW_pageBody>*{flex:none;width:100%;max-width:960px}.jh5nvW_pageBody>.jh5nvW_pageBar[data-measuring]{visibility:hidden;pointer-events:none;margin:0;position:absolute;top:0;left:0}.jh5nvW_pageBody>.jh5nvW_pageBar[data-natural]{z-index:2;pointer-events:none;position:sticky;top:0}.jh5nvW_pageBar[data-natural] .jh5nvW_pageHead{height:var(--plugin-header-rest-height);clip-path:inset(0 0 max(0px, calc(var(--plugin-header-rest-height) - var(--plugin-header-paint-height))) 0);pointer-events:auto;position:relative}.jh5nvW_pageBar[data-natural] .jh5nvW_pageHeading{display:contents}.jh5nvW_pageBar[data-natural] [data-plugin-header-part]{left:var(--plugin-part-x);top:var(--plugin-part-y);width:var(--plugin-part-width);pointer-events:auto;margin:0;position:absolute}.jh5nvW_pageBar[data-natural] .jh5nvW_pageTabs{z-index:2;pointer-events:none}.jh5nvW_pageBar[data-natural] .jh5nvW_pageTabList{pointer-events:auto}.jh5nvW_pageBar[data-natural]:before{content:\"\";height:var(--plugin-header-paint-height,var(--plugin-header-rest-height));background:var(--dsw-alias-bg-base);pointer-events:none;position:absolute;inset:0 0 auto}.jh5nvW_pageBar[data-natural][data-compact]:after{content:\"\";inset-inline:0;height:var(--plugin-header-compact-height);box-sizing:border-box;border-bottom:.5px solid var(--dsw-alias-border-l3);position:absolute;top:0}.jh5nvW_pageHead{box-sizing:border-box;padding-top:var(--plugin-page-top-inset);flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:16px;display:flex}[data-platform=darwin] .jh5nvW_pageHead{padding-top:calc(var(--plugin-page-top-inset) + var(--dsh-frame-top-clearance,0px))}.jh5nvW_pageHeading{order:1;min-width:0;max-width:100%}.jh5nvW_pageTitle{margin:0;font-size:20px;font-weight:500;line-height:28px}.jh5nvW_pageIntro{color:var(--dsw-alias-label-secondary);align-items:center;gap:4px;margin:4px 0 0;font-size:13px;line-height:20px;display:flex}.jh5nvW_infoButton{width:20px;height:20px;color:var(--dsw-alias-label-caption);flex:none;padding:0}.jh5nvW_toolbar{white-space:nowrap;flex-wrap:wrap;flex:0 auto;order:2;justify-content:flex-end;align-items:center;gap:8px 16px;min-width:0;display:flex}.jh5nvW_addMenu{width:320px;max-width:calc(100vw - 48px)}.jh5nvW_addMenu [role=menuitem]{box-sizing:border-box;gap:10px;height:72px;padding:6px 12px}.jh5nvW_addMenuItem{white-space:normal;flex-direction:column;gap:2px;display:flex}.jh5nvW_addMenuDescription{overflow-wrap:anywhere;max-height:36px;color:var(--dsw-alias-label-secondary);-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:12px;line-height:18px;display:-webkit-box;overflow:hidden}.jh5nvW_status,.jh5nvW_failure p,.jh5nvW_empty{color:var(--dsw-alias-label-tertiary);margin:0;font-size:13px;line-height:20px}.jh5nvW_failure{color:var(--dsw-alias-state-error-primary);align-items:center;gap:10px;display:flex}.jh5nvW_statusWithDot{align-items:center;gap:6px;display:inline-flex}.jh5nvW_group{flex-direction:column;gap:8px;display:flex}.jh5nvW_groupHead{align-items:center;gap:8px;display:flex}.jh5nvW_groupTitle{flex:1;margin:0;font-size:14px;font-weight:500;line-height:22px}.jh5nvW_groupMore{color:color-mix(in srgb, var(--dsw-alias-label-secondary) 60%, var(--dsw-alias-label-tertiary));flex:none;gap:4px;padding-inline-end:0;font-size:14px;font-weight:400;line-height:22px}.jh5nvW_groupMore:focus-visible{color:var(--dsw-alias-label-secondary)}@media (hover:hover){.jh5nvW_groupMore:hover{color:var(--dsw-alias-label-secondary)}}.jh5nvW_moreHead{align-items:center;gap:8px}.jh5nvW_moreBack{width:28px;color:var(--dsw-alias-label-secondary);padding:0}.jh5nvW_statusTag{height:18px;padding:0 7px;font-size:10px;line-height:1}.jh5nvW_card[data-plugin-highlight]{animation:2.4s ease-out jh5nvW_dsh-plugin-highlight}@keyframes jh5nvW_dsh-plugin-highlight{0%,55%{box-shadow:0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary) 40%, transparent)}to{box-shadow:0 0 #0000}}@media (prefers-reduced-motion:reduce){.jh5nvW_card[data-plugin-highlight]{box-shadow:0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary) 40%, transparent);animation:none}}.jh5nvW_iconButton:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}.jh5nvW_cards{flex-direction:column;gap:2px;margin:0;padding:0;list-style:none;display:flex}.jh5nvW_card{border-radius:var(--dsw-radius-xl);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);min-width:0;margin:0 -8px}.jh5nvW_cardHead{align-items:center;gap:14px;padding:8px;display:flex}.jh5nvW_cardIcon{border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-lg);width:48px;height:48px;color:var(--dsw-alias-label-secondary);flex:none;justify-content:center;align-items:center;display:inline-flex}.jh5nvW_packageImage{object-fit:contain}.jh5nvW_cardMain{flex-direction:column;flex:1;gap:4px;min-width:0;display:flex}.jh5nvW_titleRow{flex-wrap:wrap;align-items:center;gap:8px;min-width:0;display:flex}.jh5nvW_cardTitle{text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:500;line-height:20px;overflow:hidden}.jh5nvW_cardLink{position:relative}.jh5nvW_cardLink:active{background:var(--dsw-alias-interactive-bg-active)}@media (hover:hover){.jh5nvW_cardLink:hover{background:var(--dsw-alias-interactive-bg-hover)}}.jh5nvW_cardOpen{max-width:100%;color:inherit;font:inherit;text-align:left;cursor:pointer;background:0 0;border:0;padding:0;font-size:14px;font-weight:500;line-height:20px}.jh5nvW_cardOpen:after{content:\"\";border-radius:var(--dsw-radius-xl);position:absolute;inset:0}.jh5nvW_cardOpen:focus-visible{outline:none}.jh5nvW_cardOpen:focus-visible:after{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}.jh5nvW_cardDesc{color:var(--dsw-alias-label-tertiary);-webkit-line-clamp:1;-webkit-box-orient:vertical;font-size:13px;line-height:18px;display:-webkit-box;overflow:hidden}.jh5nvW_skeletonFill{background:var(--dsw-alias-bg-skeleton);animation:2s cubic-bezier(.36,0,.64,1) infinite jh5nvW_dsh-plugin-skeleton}.jh5nvW_skeletonText{align-items:center;height:1lh;display:flex}.jh5nvW_skeletonBar{border-radius:var(--dsw-radius-xs);width:100%;height:12px}.jh5nvW_skeletonHeading{width:48px}.jh5nvW_skeletonTitle{width:min(144px,60%)}.jh5nvW_skeletonDescription{width:min(280px,85%)}.jh5nvW_skeletonIcon{border-color:#0000}.jh5nvW_skeletonActions{width:calc(36px + var(--bundle-toggle-gap) + var(--bundle-progress-size));height:20px}@keyframes jh5nvW_dsh-plugin-skeleton{0%{opacity:1}40%{opacity:.6}80%,to{opacity:1}}@media (prefers-reduced-motion:reduce){.jh5nvW_skeletonFill{animation:none}}.jh5nvW_cardEnd{z-index:1;flex:none;align-items:center;gap:8px;display:inline-flex;position:relative}.jh5nvW_bundleToggle{align-items:center;gap:var(--bundle-toggle-gap);display:inline-flex}.jh5nvW_toggleProgress{width:var(--bundle-progress-size);height:var(--bundle-progress-size);display:inline-flex}.jh5nvW_toggleProgress>svg{width:100%;height:100%}.jh5nvW_progressAnnouncement{clip-path:inset(50%);white-space:nowrap;width:1px;height:1px;position:absolute;overflow:hidden}.jh5nvW_iconButton{border-radius:var(--dsw-radius-sm);width:28px;height:28px;color:var(--dsw-alias-label-caption);cursor:pointer;background:0 0;border:0;justify-content:center;align-items:center;display:inline-flex}.jh5nvW_iconButton:active:not(:disabled){background:var(--dsw-alias-interactive-bg-active)}@media (hover:hover){.jh5nvW_iconButton:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}}.jh5nvW_iconButton:disabled{opacity:.5;cursor:default}.jh5nvW_addButton,.jh5nvW_addPrimary,.jh5nvW_addMore{border-radius:var(--dsw-radius-md);height:32px;padding:0 12px;font-size:13px;line-height:20px}.jh5nvW_addGroup{flex:none;align-items:stretch;display:inline-flex}.jh5nvW_addPrimary{border-top-right-radius:0;border-bottom-right-radius:0}.jh5nvW_addMore{border-left:.5px solid color-mix(in srgb, var(--dsw-alias-label-primary-foreground) 30%, transparent);border-top-left-radius:0;border-bottom-left-radius:0;width:32px;padding:0}.jh5nvW_iconWrap{display:inline-flex}.jh5nvW_danger{color:var(--dsw-alias-state-error-primary);--dsh-button-outline-color:color-mix(in srgb, var(--dsw-alias-state-error-primary) 30%, transparent);--dsw-alias-interactive-bg-hover:color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent)}.jh5nvW_detailActions{flex:none;align-items:center;gap:16px;display:flex}.jh5nvW_actions{align-items:center;gap:16px;display:flex}.jh5nvW_deleteButton{border-radius:var(--dsw-radius-sm);width:28px;height:28px;color:var(--dsw-alias-state-error-primary);cursor:pointer;background:0 0;border:0;justify-content:center;align-items:center;display:inline-flex}.jh5nvW_deleteButton:active:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger,var(--dsw-alias-interactive-bg-hover))}@media (hover:hover){.jh5nvW_deleteButton:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger,var(--dsw-alias-interactive-bg-hover))}}.jh5nvW_deleteButton:disabled{opacity:.5;cursor:default}.jh5nvW_deleteButton:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}.jh5nvW_reason{color:var(--dsw-alias-state-error-primary);overflow-wrap:anywhere;white-space:pre-wrap;margin:0;font-size:12px;line-height:18px}.jh5nvW_partsHead .jh5nvW_subLabel{margin:0}.jh5nvW_partsFilter{width:200px}.jh5nvW_partsFilter:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}.jh5nvW_installDialog{width:min(560px,100%);max-height:min(800px,100%)}.jh5nvW_installContent{min-height:0;overflow-y:auto}.jh5nvW_installBody{flex-direction:column;gap:12px;min-width:0;display:flex}.jh5nvW_installFooter{flex-direction:column;flex:1;gap:20px;min-width:0;display:flex}.jh5nvW_templateHint{color:var(--dsw-alias-label-secondary);margin:-4px 0 0;font-size:12px;line-height:18px}.jh5nvW_installLocation{color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere;margin:0;font-size:12px;line-height:18px}.jh5nvW_installField{flex-direction:column;gap:6px;font-size:13px;display:flex}.jh5nvW_installField input[type=text]{border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-3);height:40px;font:inherit;color:var(--dsw-alias-label-primary);outline:none;padding:0 14px;font-size:13px}.jh5nvW_installField input[type=text]:focus,.jh5nvW_registryCustomField:focus{border-color:var(--dsw-alias-state-business-primary);box-shadow:inset 0 0 0 .5px var(--dsw-alias-state-business-primary)}.jh5nvW_installField input[type=text][aria-invalid=true],.jh5nvW_registryCustomField[aria-invalid=true]{border-color:var(--dsw-alias-state-error-primary);box-shadow:none}.jh5nvW_installField input[type=text][aria-invalid=true]:focus,.jh5nvW_registryCustomField[aria-invalid=true]:focus{box-shadow:inset 0 0 0 .5px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}.jh5nvW_guideToggle{font:inherit;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;align-self:flex-start;align-items:center;gap:4px;margin-top:4px;padding:0;font-size:12.5px;display:inline-flex}@media (hover:hover){.jh5nvW_guideToggle:hover{color:var(--dsw-alias-label-primary)}}.jh5nvW_guideChevron{transition:transform .16s}.jh5nvW_guideToggle[aria-expanded=true] .jh5nvW_guideChevron{transform:rotate(180deg)}.jh5nvW_guide{border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-1);flex-direction:column;gap:10px;padding:8px 14px;display:flex}.jh5nvW_guideHint{color:var(--dsw-alias-label-tertiary);margin:6px 0 0;font-size:12px;line-height:18px}.jh5nvW_installSafety{border-radius:var(--dsw-radius-md);background:var(--dsw-alias-state-warn-tertiary);color:var(--dsw-alias-label-secondary);align-items:flex-start;gap:8px;margin:0;padding:10px 12px;font-size:12px;line-height:18px;display:flex}.jh5nvW_installSafetyText{flex-direction:column;gap:4px;min-width:0;display:flex}.jh5nvW_installSafety>svg{color:var(--dsw-alias-state-warn-primary);flex:none;margin-top:2px}.jh5nvW_guideList{flex-direction:column;gap:2px;margin:0;padding:0;list-style:none;display:flex}.jh5nvW_guideItem{align-items:flex-start;gap:10px;padding:8px 0;display:flex}.jh5nvW_guideItem>button{align-self:center}.jh5nvW_guideMain{flex-direction:column;flex:1;gap:0;min-width:0;display:flex}.jh5nvW_guideTitle{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500;line-height:20px}.jh5nvW_guideExample{color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere;font-size:12px;line-height:20px}.jh5nvW_guideExample code{font-family:var(--ds-font-family-code)}.jh5nvW_guideExampleLabel{color:var(--dsw-alias-label-tertiary)}.jh5nvW_optionsRow{flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px 12px;display:flex}.jh5nvW_registryToggle{border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-2);height:28px;font:inherit;color:var(--dsw-alias-label-secondary);cursor:pointer;align-items:center;gap:6px;padding:0 8px 0 10px;font-size:12.5px;display:inline-flex}@media (hover:hover){.jh5nvW_registryToggle:hover:not(:disabled){color:var(--dsw-alias-label-primary)}}.jh5nvW_registryToggle:disabled{cursor:default;opacity:.6}.jh5nvW_registryToggle[aria-expanded=true]{border-color:var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-layer-3)}.jh5nvW_registryToggle[aria-expanded=true] .jh5nvW_guideChevron{transform:rotate(180deg)}.jh5nvW_registryChosen{color:var(--dsw-alias-label-primary);font-weight:500}.jh5nvW_registry{z-index:1100;box-sizing:border-box;background:var(--dsw-alias-bg-layer-2);border-radius:var(--dsw-radius-lg);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);width:min(440px,100vw - 24px);box-shadow:var(--dsw-elevation-prominent);border:0;flex-direction:column;gap:4px;min-width:0;margin:0;padding:8px;display:flex;position:fixed}.jh5nvW_registryOption{border-radius:var(--dsw-radius-md);cursor:pointer;border:0;flex-direction:column;gap:4px;padding:8px 10px;display:flex}@media (hover:hover){.jh5nvW_registryOption:hover{background:var(--dsw-alias-interactive-bg-hover)}}label.jh5nvW_registryOption{flex-direction:row;align-items:flex-start;gap:10px}.jh5nvW_registryOption input[type=radio]{width:16px;height:16px;accent-color:var(--dsw-alias-brand-primary);flex:none;margin:2px 0 0}.jh5nvW_registryTitle{color:var(--dsw-alias-label-primary);flex-wrap:wrap;align-items:center;gap:8px;font-size:13px;line-height:20px;display:flex}.jh5nvW_registryHint{color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere;font-size:12px;line-height:18px}.jh5nvW_registryCustomPick{cursor:pointer;align-items:flex-start;gap:10px;display:flex}.jh5nvW_registryCustomField{border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-3);height:32px;font:inherit;color:var(--dsw-alias-label-primary);outline:none;margin-left:26px;padding:0 10px;font-size:13px}.jh5nvW_registryOption>.jh5nvW_inputError,.jh5nvW_registryOption>.jh5nvW_registryHint{margin-left:26px}.jh5nvW_inputError{color:var(--dsw-alias-state-error-primary);margin:-4px 0 0;font-size:12px;line-height:18px}.jh5nvW_wide{border-radius:var(--dsw-radius-md);justify-content:center;width:100%;height:40px}.jh5nvW_wizard{flex-direction:column;flex:auto;gap:16px;min-width:0;min-height:0;padding:16px 20px 0;display:flex}.jh5nvW_wizardScroll{flex-direction:column;flex:auto;gap:16px;min-height:0;display:flex;overflow-y:auto}.jh5nvW_wizardHead{justify-content:space-between;align-items:center;min-height:24px;display:flex}.jh5nvW_wizardBack{font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;background:0 0;border:0;align-items:center;gap:4px;padding:0;font-size:15px;font-weight:600;display:inline-flex}.jh5nvW_wizardClose{border-radius:var(--dsw-radius-sm);width:24px;height:24px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;justify-content:center;align-items:center;padding:0;display:inline-flex}@media (hover:hover){.jh5nvW_wizardClose:hover{background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary)}}.jh5nvW_wizardHero{text-align:center;flex-direction:column;align-items:center;gap:10px;padding:8px 0 4px;display:flex}.jh5nvW_wizardIcon{width:44px;height:44px;color:var(--dsw-alias-label-secondary);justify-content:center;align-items:center;display:inline-flex}.jh5nvW_wizardIcon[data-state=done]{color:var(--dsw-alias-state-success-secondary)}.jh5nvW_wizardIcon[data-state=error]{color:var(--dsw-alias-state-warn-label)}.jh5nvW_wizardTitle{margin:0;font-size:18px;font-weight:600;line-height:26px}.jh5nvW_wizardSub{color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere;margin:0;font-size:13px;line-height:20px}.jh5nvW_subject{border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-lg);text-align:center;flex-direction:column;align-items:center;gap:6px;padding:16px;display:flex}.jh5nvW_subjectName{overflow-wrap:anywhere;margin:0;font-size:15px;font-weight:600;line-height:22px}.jh5nvW_subjectSpec{font-family:var(--ds-font-family-code);color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere;margin:0;font-size:12px;line-height:18px}.jh5nvW_subjectDesc,.jh5nvW_subjectMeta{color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere;margin:0;font-size:13px;line-height:20px}.jh5nvW_wizardFoot{justify-content:space-between;align-items:center;gap:12px;display:flex}.jh5nvW_footAction{border-radius:var(--dsw-radius-md);height:32px}.jh5nvW_detailsToggle{font:inherit;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;align-items:center;gap:4px;padding:0;font-size:13px;display:inline-flex}.jh5nvW_detailsChevron{transition:transform .16s}.jh5nvW_detailsToggle[aria-expanded=true] .jh5nvW_detailsChevron{transform:rotate(180deg)}.jh5nvW_detailsBody{flex-direction:column;gap:8px;min-width:0;display:flex}.jh5nvW_wizardActions{align-items:center;gap:8px;display:flex}.jh5nvW_run{flex-direction:column;gap:4px;min-width:0;display:flex}.jh5nvW_attemptBadge{border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-secondary);align-self:flex-start;margin:0;padding:0 6px;font-size:11px;line-height:18px}@media (prefers-reduced-motion:reduce){.jh5nvW_detailsChevron{transition:none}}.jh5nvW_result,.jh5nvW_resultWarn{border-radius:var(--dsw-radius-md);background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 10%, transparent);color:var(--dsw-alias-label-primary);margin:0;padding:8px 12px;font-size:13px;line-height:20px}.jh5nvW_resultWarn{background:var(--dsw-alias-state-warn-tertiary)}.jh5nvW_approval{border:.5px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary) 40%, transparent);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-state-warn-tertiary);flex-direction:column;gap:8px;padding:12px 14px;display:flex}.jh5nvW_approvalTitle{color:var(--dsw-alias-label-primary);margin:0;font-size:13px;font-weight:600}.jh5nvW_approvalText{color:var(--dsw-alias-label-secondary);margin:0;font-size:12.5px;line-height:18px}.jh5nvW_approvalCaution{color:var(--dsw-alias-label-secondary);margin:0;font-size:12.5px;font-weight:500;line-height:18px}.jh5nvW_approvalList{flex-wrap:wrap;gap:6px;margin:0;padding:0;list-style:none;display:flex}.jh5nvW_approvalList code{border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-bg-layer-3);font-family:var(--ds-font-family-code);color:var(--dsw-alias-label-primary);padding:2px 8px;font-size:12px;display:inline-block}.jh5nvW_terminal{--dsl-terminal-font:var(--dsw-font-markdown-code-block-small);--dsl-terminal-line-height:18px;--dsl-terminal-output-max-height:240px;border:.5px solid var(--dsw-alias-border-l1);margin:4px 0 0}.jh5nvW_dependents{color:var(--dsw-alias-label-secondary);margin:8px 0 0;padding-left:18px;font-size:13px;line-height:20px}.jh5nvW_dangerButton{--dsw-alias-button-primary-fill:var(--dsw-alias-state-error-primary);--dsw-alias-button-primary-hover:var(--dsw-alias-state-error-primary)}.jh5nvW_detail{flex-direction:column;display:flex}.jh5nvW_detailTop,.jh5nvW_moreHead{padding-top:var(--plugin-page-top-inset);display:flex}.jh5nvW_detailTop{flex-direction:column}[data-platform=darwin] .jh5nvW_detailTop,[data-platform=darwin] .jh5nvW_moreHead{padding-top:calc(var(--plugin-page-top-inset) + var(--dsh-frame-top-clearance,0px))}.jh5nvW_crumb{color:var(--dsw-alias-label-tertiary);font:inherit;cursor:pointer;background:0 0;border:0;align-items:center;gap:6px;padding:0;font-size:12.5px;display:inline-flex}@media (hover:hover){.jh5nvW_crumb:hover{color:var(--dsw-alias-label-primary)}}.jh5nvW_crumb:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}.jh5nvW_crumbIcon{transform:rotate(90deg)}.jh5nvW_detailHead{justify-content:space-between;align-items:center;gap:12px;margin:32px 0 0;display:flex}.jh5nvW_detailMain{flex-direction:column;gap:8px;min-width:0;margin-top:20px;display:flex}.jh5nvW_detailTitle{margin:0;font-size:20px;font-weight:500;line-height:28px}.jh5nvW_versionTag{font-variant-numeric:tabular-nums;flex:none}.jh5nvW_detailDesc{color:var(--dsw-alias-label-secondary);margin:0;font-size:14px;line-height:22px}.jh5nvW_detailName{color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere;margin:0;font-size:12px;line-height:18px}.jh5nvW_detailName code{font-family:var(--dsw-font-mono,ui-monospace, SFMono-Regular, Menlo, monospace)}.jh5nvW_detail>.jh5nvW_detailDesc{margin-top:12px}.jh5nvW_detailSections{flex-direction:column;gap:32px;margin-top:32px;display:flex}.jh5nvW_detailSection{flex-direction:column;gap:12px;display:flex}.jh5nvW_sectionHead{align-items:baseline;gap:10px;display:flex}.jh5nvW_sectionTitle{margin:0;font-size:14px;font-weight:500;line-height:20px}.jh5nvW_sectionCount{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}.jh5nvW_facts{margin:0}.jh5nvW_facts div{border-bottom:.5px solid var(--dsw-alias-border-l2);justify-content:space-between;align-items:center;gap:16px;min-height:44px;padding:8px 2px;display:flex}.jh5nvW_facts dt{color:var(--dsw-alias-label-secondary);flex:none;font-size:13px;line-height:20px}.jh5nvW_facts dd{text-align:end;overflow-wrap:anywhere;min-width:0;margin:0;font-size:13px;line-height:20px}.jh5nvW_facts code{background:var(--dsw-alias-bg-module-platform);box-decoration-break:clone;font-family:var(--dsw-font-mono,ui-monospace, SFMono-Regular, Menlo, monospace);border-radius:4px;padding:2px 6px;font-size:12px}.jh5nvW_cardArrow{color:var(--dsw-alias-label-tertiary);flex:none}.jh5nvW_rows{flex-direction:column;margin:0;padding:0;list-style:none;display:flex}.jh5nvW_row{border-bottom:.5px solid var(--dsw-alias-border-l2);padding:12px 2px}.jh5nvW_row:last-child{border-bottom:0}.jh5nvW_rowLine{align-items:center;gap:16px;min-width:0;display:flex}.jh5nvW_rowIcon{border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-md);width:40px;height:40px;color:var(--dsw-alias-label-secondary);flex:none;justify-content:center;align-items:center;display:inline-flex}.jh5nvW_rowMain{flex-direction:column;flex:1;gap:2px;min-width:0;display:flex}.jh5nvW_rowId{color:var(--dsw-alias-label-primary);overflow-wrap:anywhere;font-size:13.5px;font-weight:500;line-height:20px}.jh5nvW_row[data-state=off] .jh5nvW_rowId{color:var(--dsw-alias-label-secondary)}.jh5nvW_rowModule{font-family:var(--dsw-font-mono,ui-monospace, SFMono-Regular, Menlo, monospace);color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere;font-size:11.5px;line-height:16px}.jh5nvW_rowOpen{color:inherit;font:inherit;text-align:left;cursor:pointer;background:0 0;border:0;align-items:center;gap:2px;padding:0;display:inline-flex}@media (hover:hover){.jh5nvW_rowOpen:hover .jh5nvW_rowId{text-underline-offset:3px;text-decoration:underline}}.jh5nvW_rowOpenIcon{color:var(--dsw-alias-label-tertiary);flex:none}@media (hover:hover){.jh5nvW_rowOpen:hover .jh5nvW_rowOpenIcon{color:var(--dsw-alias-label-primary)}}.jh5nvW_rowState{color:var(--dsw-alias-label-secondary);white-space:nowrap;flex:none;align-items:center;gap:6px;font-size:12.5px;line-height:18px;display:inline-flex}.jh5nvW_row[data-state=failed] .jh5nvW_rowState{color:var(--dsw-alias-state-error-primary)}.jh5nvW_rowFailure{color:var(--dsw-alias-state-error-primary);overflow-wrap:anywhere;margin:4px 0 0 56px;font-size:12px;line-height:18px}.jh5nvW_toolbar[hidden]{display:none}.jh5nvW_pageTabs{flex:100%;order:3;display:flex}.jh5nvW_pageBar[data-compact]:not([data-natural]){--plugin-page-top-inset:16px;padding-bottom:16px}[data-platform=darwin] .jh5nvW_pageBar[data-compact]:not([data-natural]) .jh5nvW_pageHead{padding-top:var(--plugin-page-top-inset)}[data-platform=darwin] [data-sidebar-collapsed] .jh5nvW_pageBar[data-compact]:not([data-natural]) .jh5nvW_pageHead{--plugin-page-top-inset:8px;padding-top:calc(var(--plugin-page-top-inset) + var(--dsh-frame-top-clearance,0px))}.jh5nvW_pageBar[data-compact]:not([data-natural]):after{content:\"\";inset-inline:0;border-bottom:.5px solid var(--dsw-alias-border-l3);pointer-events:none;position:absolute;bottom:0}.jh5nvW_pageBar[data-compact]:not([data-natural]) .jh5nvW_pageHead{align-items:center}.jh5nvW_pageBar[data-compact]:not([data-natural]) .jh5nvW_pageIntro{display:none}.jh5nvW_pageBarWithTabs[data-compact]:not([data-natural]) .jh5nvW_pageHeading{clip:rect(0 0 0 0);white-space:nowrap;width:1px;height:1px;position:absolute;overflow:hidden}.jh5nvW_pageBarWithTabs[data-compact]:not([data-natural]) .jh5nvW_pageTabs{flex:none;order:1}.jh5nvW_pageTabList{width:fit-content;min-width:240px}@container jh5nvW_plugin-page-bar (width<600px){.jh5nvW_pageBarWithTabs .jh5nvW_pageHead{align-items:center}.jh5nvW_pageBarWithTabs .jh5nvW_pageHeading{flex-basis:100%}.jh5nvW_pageBarWithTabs .jh5nvW_pageTabs{flex:none;order:2}.jh5nvW_pageBarWithTabs .jh5nvW_toolbar{order:3}.jh5nvW_toolbarLabel{display:none}.jh5nvW_pageHead .jh5nvW_addButton,.jh5nvW_pageHead .jh5nvW_addPrimary{width:32px;min-width:32px;padding-inline:0}.jh5nvW_toolbar{flex-shrink:0;max-width:100%}.jh5nvW_updatesNote{white-space:normal;flex-basis:100%;order:3;min-width:0}}@container jh5nvW_plugin-page-bar (width<372px){.jh5nvW_pageTabList{min-width:0}}.jh5nvW_installedPanel{flex-direction:column;gap:32px;display:flex}.jh5nvW_tabPanel{flex-direction:column;gap:24px;display:flex}.jh5nvW_updatesNote{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}.jh5nvW_updatesNote[data-tone=info]{color:var(--dsw-alias-state-business-primary)}.jh5nvW_updatesNote[data-tone=error]{color:var(--dsw-alias-state-error-primary)}.jh5nvW_versionPanel{border:.5px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-xl);background:var(--dsw-alias-settings-card-fill);overflow:hidden;container-type:inline-size}.jh5nvW_versionSummary{box-sizing:border-box;width:100%;min-height:64px;color:inherit;font:inherit;text-align:left;background:0 0;border:0;align-items:center;gap:12px;padding:12px 16px;display:flex}button.jh5nvW_versionSummary{cursor:pointer}@media (hover:hover){button.jh5nvW_versionSummary:hover{background:var(--dsw-alias-interactive-bg-hover)}}.jh5nvW_versionSummary[aria-expanded=true]{background:var(--dsw-alias-bg-module-platform)}button.jh5nvW_versionSummary:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}.jh5nvW_versionSummary[aria-expanded=true] .jh5nvW_detailsChevron,.jh5nvW_versionSummaryEnd [aria-expanded=true] .jh5nvW_detailsChevron{transform:rotate(180deg)}.jh5nvW_versionGlyph{background:var(--dsw-alias-bg-module-platform);width:32px;height:32px;color:var(--dsw-alias-label-secondary);corner-shape:round;border-radius:50%;flex:none;justify-content:center;align-items:center;display:inline-flex}.jh5nvW_versionGlyph[data-tone=info]{background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 10%, transparent);color:var(--dsw-alias-state-business-primary)}.jh5nvW_versionGlyph[data-tone=success]{background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 10%, transparent);color:var(--dsw-alias-state-success-primary)}.jh5nvW_versionGlyph[data-tone=warn]{background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 12%, transparent);color:var(--dsw-alias-state-warn-primary)}.jh5nvW_versionGlyph[data-tone=error]{background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, transparent);color:var(--dsw-alias-state-error-primary)}.jh5nvW_versionSummaryText{flex-direction:column;flex:1;gap:2px;min-width:0;display:flex}.jh5nvW_versionSummaryTitle{font-size:14px;font-weight:500;line-height:20px}.jh5nvW_versionSummarySub{color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere;font-size:12.5px;line-height:18px}.jh5nvW_versionSummaryEnd{color:var(--dsw-alias-label-secondary);white-space:nowrap;flex:none;align-items:center;gap:8px;font-size:12.5px;display:inline-flex}.jh5nvW_versionBody{border-top:.5px solid var(--dsw-alias-border-l2);padding:0 16px}.jh5nvW_versionRows{flex-direction:column;margin:0;padding:0;list-style:none;display:flex}.jh5nvW_versionRow{border-bottom:.5px solid var(--dsw-alias-border-l2);grid-template-columns:minmax(0,1fr) max-content 56px;align-items:center;gap:16px;min-height:28px;padding:12px 0;display:grid}.jh5nvW_versionRow:last-child{border-bottom:0}.jh5nvW_versionMain{flex-direction:column;flex:1;gap:2px;min-width:0;display:flex}.jh5nvW_versionTitle{flex-wrap:wrap;align-items:center;gap:8px;display:flex}.jh5nvW_versionNumber{font-family:var(--ds-font-family-code);font-variant-numeric:tabular-nums;overflow-wrap:anywhere;font-size:13px;font-weight:500;line-height:20px}.jh5nvW_versionRow[data-blocked] .jh5nvW_versionNumber,.jh5nvW_versionNumber[data-old]{color:var(--dsw-alias-label-tertiary)}.jh5nvW_versionNote{color:var(--dsw-alias-label-secondary);margin:0;font-size:12px;line-height:18px}.jh5nvW_versionNote[data-tone=warn]{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}.jh5nvW_versionDate{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;flex:none;font-size:12.5px;line-height:18px}.jh5nvW_versionAction{flex:none;justify-content:flex-end;min-width:56px;display:flex}.jh5nvW_versionLog{font-family:var(--ds-font-family-code);color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere;white-space:pre-wrap;margin-top:4px;font-size:11.5px;line-height:16px;display:block}.jh5nvW_versionMeta{border-top:.5px solid var(--dsw-alias-border-l2);flex-wrap:wrap;align-items:center;gap:8px 24px;padding:12px 0;display:flex}.jh5nvW_versionFact{align-items:center;gap:8px;margin:0;font-size:12px;line-height:18px;display:inline-flex}.jh5nvW_versionFact dt{color:var(--dsw-alias-label-tertiary)}.jh5nvW_versionFact dd{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;align-items:center;gap:6px;margin:0;display:inline-flex}.jh5nvW_versionHint{corner-shape:round;border-radius:999px;display:inline-flex}.jh5nvW_versionHint:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}.jh5nvW_versionSpacer{flex:1}.jh5nvW_updateDialog{width:min(460px,100%)}.jh5nvW_updateBody{flex-direction:column;gap:16px;min-width:0;display:flex}.jh5nvW_updateVersions{border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-tertiary);justify-content:center;align-items:center;gap:16px;padding:20px 16px;display:flex}.jh5nvW_updateVersions .jh5nvW_versionNumber{color:var(--dsw-alias-label-primary);font-size:16px;line-height:24px}.jh5nvW_updateVersions .jh5nvW_versionNumber[data-old]{color:var(--dsw-alias-label-tertiary)}.jh5nvW_updateText{color:var(--dsw-alias-label-secondary);margin:0;font-size:13px;line-height:20px}.jh5nvW_updateOutcome{align-items:flex-start;gap:12px;display:flex}.jh5nvW_updateOutput{border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-module-platform);max-height:200px;font-family:var(--ds-font-family-code);color:var(--dsw-alias-label-secondary);white-space:pre-wrap;overflow-wrap:anywhere;margin:0;padding:10px 12px;font-size:11.5px;line-height:16px;overflow:auto}.jh5nvW_updateSteps{border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-module-platform);flex-direction:column;gap:12px;margin:0;padding:12px 16px;list-style:none;display:flex}.jh5nvW_updateStep{align-items:center;gap:10px;font-size:13px;line-height:20px;display:flex}.jh5nvW_updateStep>:last-child{overflow-wrap:anywhere;min-width:0}.jh5nvW_updateStepDot{width:20px;height:20px;color:var(--dsw-alias-label-secondary);corner-shape:round;border-radius:50%;flex:none;justify-content:center;align-items:center;display:inline-flex}.jh5nvW_updateStep[data-state=done] .jh5nvW_updateStepDot{background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 12%, transparent);color:var(--dsw-alias-state-success-primary)}.jh5nvW_updateStep[data-state=failed] .jh5nvW_updateStepDot{background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, transparent);color:var(--dsw-alias-state-error-primary)}.jh5nvW_updateStep[data-state=unknown] .jh5nvW_updateStepDot{border:.5px solid var(--dsw-alias-border-l3)}@container (width<=460px){.jh5nvW_versionRow{grid-template-columns:minmax(0,1fr) 56px;gap:4px 12px}.jh5nvW_versionMain{grid-area:1/1}.jh5nvW_versionDate{grid-area:2/1}.jh5nvW_versionAction{grid-area:1/2/span 2}.jh5nvW_versionMeta{gap:8px 16px}.jh5nvW_versionMeta>label{flex-basis:100%}.jh5nvW_versionSpacer{display:none}}@media (pointer:coarse){.jh5nvW_installField input[type=text],.jh5nvW_registryCustomField,.jh5nvW_partsFilter input{font-size:16px}}";
		const tagId = "@deepseek-ai/dsh-client-ui-plugin-manager/PluginManagerPage.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-plugin-manager";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var PluginManagerPage_module_css_default = {
			"actions": "jh5nvW_actions",
			"addButton": "jh5nvW_addButton",
			"addGroup": "jh5nvW_addGroup",
			"addMenu": "jh5nvW_addMenu",
			"addMenuDescription": "jh5nvW_addMenuDescription",
			"addMenuItem": "jh5nvW_addMenuItem",
			"addMore": "jh5nvW_addMore",
			"addPrimary": "jh5nvW_addPrimary",
			"approval": "jh5nvW_approval",
			"approvalCaution": "jh5nvW_approvalCaution",
			"approvalList": "jh5nvW_approvalList",
			"approvalText": "jh5nvW_approvalText",
			"approvalTitle": "jh5nvW_approvalTitle",
			"attemptBadge": "jh5nvW_attemptBadge",
			"bundleToggle": "jh5nvW_bundleToggle",
			"card": "jh5nvW_card",
			"cardArrow": "jh5nvW_cardArrow",
			"cardDesc": "jh5nvW_cardDesc",
			"cardEnd": "jh5nvW_cardEnd",
			"cardHead": "jh5nvW_cardHead",
			"cardIcon": "jh5nvW_cardIcon",
			"cardLink": "jh5nvW_cardLink",
			"cardMain": "jh5nvW_cardMain",
			"cardOpen": "jh5nvW_cardOpen",
			"cardTitle": "jh5nvW_cardTitle",
			"cards": "jh5nvW_cards",
			"crumb": "jh5nvW_crumb",
			"crumbIcon": "jh5nvW_crumbIcon",
			"danger": "jh5nvW_danger",
			"dangerButton": "jh5nvW_dangerButton",
			"deleteButton": "jh5nvW_deleteButton",
			"dependents": "jh5nvW_dependents",
			"detail": "jh5nvW_detail",
			"detailActions": "jh5nvW_detailActions",
			"detailDesc": "jh5nvW_detailDesc",
			"detailHead": "jh5nvW_detailHead",
			"detailMain": "jh5nvW_detailMain",
			"detailName": "jh5nvW_detailName",
			"detailSection": "jh5nvW_detailSection",
			"detailSections": "jh5nvW_detailSections",
			"detailTitle": "jh5nvW_detailTitle",
			"detailTop": "jh5nvW_detailTop",
			"detailsBody": "jh5nvW_detailsBody",
			"detailsChevron": "jh5nvW_detailsChevron",
			"detailsToggle": "jh5nvW_detailsToggle",
			"dsh-plugin-highlight": "jh5nvW_dsh-plugin-highlight",
			"dsh-plugin-skeleton": "jh5nvW_dsh-plugin-skeleton",
			"empty": "jh5nvW_empty",
			"facts": "jh5nvW_facts",
			"failure": "jh5nvW_failure",
			"footAction": "jh5nvW_footAction",
			"group": "jh5nvW_group",
			"groupHead": "jh5nvW_groupHead",
			"groupMore": "jh5nvW_groupMore",
			"groupTitle": "jh5nvW_groupTitle",
			"guide": "jh5nvW_guide",
			"guideChevron": "jh5nvW_guideChevron",
			"guideExample": "jh5nvW_guideExample",
			"guideExampleLabel": "jh5nvW_guideExampleLabel",
			"guideHint": "jh5nvW_guideHint",
			"guideItem": "jh5nvW_guideItem",
			"guideList": "jh5nvW_guideList",
			"guideMain": "jh5nvW_guideMain",
			"guideTitle": "jh5nvW_guideTitle",
			"guideToggle": "jh5nvW_guideToggle",
			"iconButton": "jh5nvW_iconButton",
			"iconWrap": "jh5nvW_iconWrap",
			"infoButton": "jh5nvW_infoButton",
			"inputError": "jh5nvW_inputError",
			"installBody": "jh5nvW_installBody",
			"installContent": "jh5nvW_installContent",
			"installDialog": "jh5nvW_installDialog",
			"installField": "jh5nvW_installField",
			"installFooter": "jh5nvW_installFooter",
			"installLocation": "jh5nvW_installLocation",
			"installSafety": "jh5nvW_installSafety",
			"installSafetyText": "jh5nvW_installSafetyText",
			"installedPanel": "jh5nvW_installedPanel",
			"moreBack": "jh5nvW_moreBack",
			"moreHead": "jh5nvW_moreHead",
			"optionsRow": "jh5nvW_optionsRow",
			"packageImage": "jh5nvW_packageImage",
			"page": "jh5nvW_page",
			"pageBar": "jh5nvW_pageBar",
			"pageBarWithTabs": "jh5nvW_pageBarWithTabs",
			"pageBody": "jh5nvW_pageBody",
			"pageHead": "jh5nvW_pageHead",
			"pageHeading": "jh5nvW_pageHeading",
			"pageIntro": "jh5nvW_pageIntro",
			"pageTabList": "jh5nvW_pageTabList",
			"pageTabs": "jh5nvW_pageTabs",
			"pageTitle": "jh5nvW_pageTitle",
			"partsFilter": "jh5nvW_partsFilter",
			"partsHead": "jh5nvW_partsHead",
			"plugin-page-bar": "jh5nvW_plugin-page-bar",
			"progressAnnouncement": "jh5nvW_progressAnnouncement",
			"reason": "jh5nvW_reason",
			"registry": "jh5nvW_registry",
			"registryChosen": "jh5nvW_registryChosen",
			"registryCustomField": "jh5nvW_registryCustomField",
			"registryCustomPick": "jh5nvW_registryCustomPick",
			"registryHint": "jh5nvW_registryHint",
			"registryOption": "jh5nvW_registryOption",
			"registryTitle": "jh5nvW_registryTitle",
			"registryToggle": "jh5nvW_registryToggle",
			"result": "jh5nvW_result",
			"resultWarn": "jh5nvW_resultWarn",
			"row": "jh5nvW_row",
			"rowFailure": "jh5nvW_rowFailure",
			"rowIcon": "jh5nvW_rowIcon",
			"rowId": "jh5nvW_rowId",
			"rowLine": "jh5nvW_rowLine",
			"rowMain": "jh5nvW_rowMain",
			"rowModule": "jh5nvW_rowModule",
			"rowOpen": "jh5nvW_rowOpen",
			"rowOpenIcon": "jh5nvW_rowOpenIcon",
			"rowState": "jh5nvW_rowState",
			"rows": "jh5nvW_rows",
			"run": "jh5nvW_run",
			"sectionCount": "jh5nvW_sectionCount",
			"sectionHead": "jh5nvW_sectionHead",
			"sectionTitle": "jh5nvW_sectionTitle",
			"skeletonActions": "jh5nvW_skeletonActions",
			"skeletonBar": "jh5nvW_skeletonBar",
			"skeletonDescription": "jh5nvW_skeletonDescription",
			"skeletonFill": "jh5nvW_skeletonFill",
			"skeletonHeading": "jh5nvW_skeletonHeading",
			"skeletonIcon": "jh5nvW_skeletonIcon",
			"skeletonText": "jh5nvW_skeletonText",
			"skeletonTitle": "jh5nvW_skeletonTitle",
			"status": "jh5nvW_status",
			"statusTag": "jh5nvW_statusTag",
			"statusWithDot": "jh5nvW_statusWithDot",
			"subLabel": "jh5nvW_subLabel",
			"subject": "jh5nvW_subject",
			"subjectDesc": "jh5nvW_subjectDesc",
			"subjectMeta": "jh5nvW_subjectMeta",
			"subjectName": "jh5nvW_subjectName",
			"subjectSpec": "jh5nvW_subjectSpec",
			"tabPanel": "jh5nvW_tabPanel",
			"templateHint": "jh5nvW_templateHint",
			"terminal": "jh5nvW_terminal",
			"titleRow": "jh5nvW_titleRow",
			"toggleProgress": "jh5nvW_toggleProgress",
			"toolbar": "jh5nvW_toolbar",
			"toolbarLabel": "jh5nvW_toolbarLabel",
			"updateBody": "jh5nvW_updateBody",
			"updateDialog": "jh5nvW_updateDialog",
			"updateOutcome": "jh5nvW_updateOutcome",
			"updateOutput": "jh5nvW_updateOutput",
			"updateStep": "jh5nvW_updateStep",
			"updateStepDot": "jh5nvW_updateStepDot",
			"updateSteps": "jh5nvW_updateSteps",
			"updateText": "jh5nvW_updateText",
			"updateVersions": "jh5nvW_updateVersions",
			"updatesNote": "jh5nvW_updatesNote",
			"versionAction": "jh5nvW_versionAction",
			"versionBody": "jh5nvW_versionBody",
			"versionDate": "jh5nvW_versionDate",
			"versionFact": "jh5nvW_versionFact",
			"versionGlyph": "jh5nvW_versionGlyph",
			"versionHint": "jh5nvW_versionHint",
			"versionLog": "jh5nvW_versionLog",
			"versionMain": "jh5nvW_versionMain",
			"versionMeta": "jh5nvW_versionMeta",
			"versionNote": "jh5nvW_versionNote",
			"versionNumber": "jh5nvW_versionNumber",
			"versionPanel": "jh5nvW_versionPanel",
			"versionRow": "jh5nvW_versionRow",
			"versionRows": "jh5nvW_versionRows",
			"versionSpacer": "jh5nvW_versionSpacer",
			"versionSummary": "jh5nvW_versionSummary",
			"versionSummaryEnd": "jh5nvW_versionSummaryEnd",
			"versionSummarySub": "jh5nvW_versionSummarySub",
			"versionSummaryText": "jh5nvW_versionSummaryText",
			"versionSummaryTitle": "jh5nvW_versionSummaryTitle",
			"versionTag": "jh5nvW_versionTag",
			"versionTitle": "jh5nvW_versionTitle",
			"wide": "jh5nvW_wide",
			"wizard": "jh5nvW_wizard",
			"wizardActions": "jh5nvW_wizardActions",
			"wizardBack": "jh5nvW_wizardBack",
			"wizardClose": "jh5nvW_wizardClose",
			"wizardFoot": "jh5nvW_wizardFoot",
			"wizardHead": "jh5nvW_wizardHead",
			"wizardHero": "jh5nvW_wizardHero",
			"wizardIcon": "jh5nvW_wizardIcon",
			"wizardScroll": "jh5nvW_wizardScroll",
			"wizardSub": "jh5nvW_wizardSub",
			"wizardTitle": "jh5nvW_wizardTitle"
		};
		//#endregion
		//#region lib/types/client/versions.js
		/**
		* A registry bundle's Versions section and its update dialog. The section summarizes the Host's version check in one
		* row and unfolds into the newer versions; the dialog confirms one update, follows the Host's steps, and reports how
		* the update ended, including the reinstallation of the removed version after a failed installation.
		*/
		/** Two digits of a date or time field. */
		function pad(value) {
			return String(value).padStart(2, "0");
		}
		/** A version's local publication day as `YYYY-MM-DD`, which reads the same in every UI language. */
		function publishedDate(version) {
			if (version.publishedAt === void 0) return void 0;
			const day = new Date(version.publishedAt);
			return `${String(day.getFullYear())}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
		}
		/** The local time of day a check arrived, as 24-hour `HH:MM`. */
		function checkedTime(checkedAt) {
			const time = new Date(checkedAt);
			return `${pad(time.getHours())}:${pad(time.getMinutes())}`;
		}
		/** The registry by name: npm's own and the mainland mirror by theirs, pnpm's own configuration as the default, any other by host. */
		function registryName(registry, t) {
			return registryText(registry, t, null).name;
		}
		/** The DSH requirements an incompatible version states, as one phrase: `engines.dsh` or DSH peer ranges. */
		function peersText(incompatible) {
			return Object.entries(incompatible.requirements).map(([name, range]) => `${name} ${range}`).join(", ");
		}
		const PROBLEM_KEYS = {
			"network": "versionsProblemNetwork",
			"not-found": "versionsProblemNotFound",
			"unknown": "versionsProblemUnknown"
		};
		function Glyph({ tone, children }) {
			return (0, react_jsx_runtime.jsx)("span", {
				className: PluginManagerPage_module_css_default.versionGlyph,
				"data-tone": tone,
				"aria-hidden": "true",
				children
			});
		}
		function summaryOf(check, t) {
			if (check === void 0 || check.phase === "checking") return {
				tone: "neutral",
				glyph: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
					state: "ongoing",
					size: 14
				}),
				title: t("versionsChecking"),
				newer: 0
			};
			const { list } = check;
			if (list.status === "refused") {
				const failed = list.attempts.at(-1);
				return {
					tone: "error",
					glyph: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, { size: 14 }),
					title: t(list.problem === "network" ? "versionsFailedNetwork" : "versionsFailedOther"),
					sub: failed?.problem === void 0 ? list.reason : `${registryName(failed.registry, t)} ${t(PROBLEM_KEYS[failed.problem])}`,
					newer: 0
				};
			}
			const candidate = updateCandidate(list);
			if (candidate !== void 0) {
				const date = publishedDate(candidate);
				return {
					tone: "info",
					glyph: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDownloadOutlineRegular, { size: 14 }),
					title: t("versionsAvailable", { version: candidate.version }),
					...date === void 0 ? {} : { sub: t("versionsPublished", { date }) },
					newer: list.versions.length
				};
			}
			if (list.versions.length === 0) return {
				tone: "success",
				glyph: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, { size: 14 }),
				title: t("versionsLatest"),
				sub: t("versionsCheckedAt", { time: checkedTime(check.checkedAt) }),
				newer: 0
			};
			const blocked = list.versions.find((version) => !version.prerelease && version.incompatible !== void 0)?.incompatible;
			return blocked === void 0 ? {
				tone: "warn",
				glyph: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, { size: 14 }),
				title: t("versionsNoneInstallable"),
				sub: t("versionsNoneInstallableDetail"),
				newer: list.versions.length
			} : {
				tone: "warn",
				glyph: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, { size: 14 }),
				title: t("versionsBlocked"),
				newer: list.versions.length,
				sub: t("versionsBlockedDetail", {
					version: blocked.version,
					peers: peersText(blocked),
					runtime: blocked.runtimeVersion
				})
			};
		}
		/** One version row: its number and tags, why it cannot or should not be installed, its date, and its update action. */
		function VersionRow({ version, installed, t, busy, onUpdate }) {
			if ("installedRow" in version) return (0, react_jsx_runtime.jsx)("li", {
				className: PluginManagerPage_module_css_default.versionRow,
				"data-plugin-version": version.version,
				children: (0, react_jsx_runtime.jsx)("div", {
					className: PluginManagerPage_module_css_default.versionMain,
					children: (0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.versionTitle,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: PluginManagerPage_module_css_default.versionNumber,
							children: version.version
						}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
							className: PluginManagerPage_module_css_default.statusTag,
							tone: "neutral",
							children: t("versionsInstalledTag")
						})]
					})
				})
			});
			const usable = installable(version);
			const note = version.incompatible !== void 0 ? t("versionsNeedsDsh", { peers: peersText(version.incompatible) }) : !version.bundle ? t("versionsNotBundle") : version.deprecated;
			const date = publishedDate(version);
			return (0, react_jsx_runtime.jsxs)("li", {
				className: PluginManagerPage_module_css_default.versionRow,
				"data-plugin-version": version.version,
				...usable ? {} : { "data-blocked": "" },
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.versionMain,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: PluginManagerPage_module_css_default.versionTitle,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: PluginManagerPage_module_css_default.versionNumber,
									children: version.version
								}),
								version.tags.map((tag) => (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
									className: PluginManagerPage_module_css_default.statusTag,
									tone: "outline",
									children: tag
								}, tag)),
								version.prerelease ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
									className: PluginManagerPage_module_css_default.statusTag,
									tone: "outline",
									children: t("versionsPrereleaseTag")
								}) : null,
								version.deprecated === void 0 ? null : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
									className: PluginManagerPage_module_css_default.statusTag,
									tone: "warning",
									children: t("versionsDeprecatedTag")
								})
							]
						}), note === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
							className: PluginManagerPage_module_css_default.versionNote,
							"data-tone": usable && version.deprecated !== void 0 ? "warn" : void 0,
							children: note
						})]
					}),
					date === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
						className: PluginManagerPage_module_css_default.versionDate,
						children: date
					}),
					(0, react_jsx_runtime.jsx)("span", {
						className: PluginManagerPage_module_css_default.versionAction,
						children: usable && version.version !== installed ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: version.deprecated === void 0 && !version.prerelease ? "outline" : "ghost",
							size: "sm",
							disabled: busy,
							"aria-label": t("versionsUpdateLabel", { version: version.version }),
							onClick: () => {
								onUpdate(version.version);
							},
							children: t("update")
						}) : null
					})
				]
			});
		}
		/** The registries a refused check asked, each with what it answered. */
		function AttemptRows({ attempts, t }) {
			return (0, react_jsx_runtime.jsx)("ul", {
				className: PluginManagerPage_module_css_default.versionRows,
				children: attempts.map((attempt, index) => (0, react_jsx_runtime.jsx)("li", {
					className: PluginManagerPage_module_css_default.versionRow,
					children: (0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.versionMain,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: PluginManagerPage_module_css_default.versionTitle,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: PluginManagerPage_module_css_default.versionNumber,
									children: registryName(attempt.registry, t)
								}),
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
									className: PluginManagerPage_module_css_default.statusTag,
									tone: "outline",
									children: t(index === 0 ? "versionsPrimaryTag" : "versionsFallbackTag")
								}),
								attempt.problem === void 0 ? null : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
									className: PluginManagerPage_module_css_default.statusTag,
									tone: "danger",
									children: t(PROBLEM_KEYS[attempt.problem])
								})
							]
						}), attempt.reason === void 0 ? null : (0, react_jsx_runtime.jsx)("code", {
							className: PluginManagerPage_module_css_default.versionLog,
							children: attempt.reason
						})]
					})
				}, `${String(attempt.registry)}:${String(index)}`))
			});
		}
		/** The unfolded list: newer versions, the installed one, and where and when the list was read. */
		function VersionList({ list, checkedAt, t, busy, onUpdate }) {
			const [prereleases, setPrereleases] = (0, react.useState)(false);
			const shown = list.versions.filter((version) => prereleases || !version.prerelease);
			const fallback = list.attempts.length > 1 ? list.attempts[0] : void 0;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: PluginManagerPage_module_css_default.versionBody,
				children: [
					(0, react_jsx_runtime.jsxs)("ul", {
						className: PluginManagerPage_module_css_default.versionRows,
						children: [shown.map((version) => (0, react_jsx_runtime.jsx)(VersionRow, {
							version,
							installed: list.installed,
							t,
							busy,
							onUpdate
						}, version.version)), (0, react_jsx_runtime.jsx)(VersionRow, {
							version: {
								version: list.installed,
								installedRow: true
							},
							installed: list.installed,
							t,
							busy,
							onUpdate
						})]
					}),
					list.omitted > 0 ? (0, react_jsx_runtime.jsx)("p", {
						className: PluginManagerPage_module_css_default.versionNote,
						children: t("versionsOmitted", { count: String(list.omitted) })
					}) : null,
					(0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.versionMeta,
						children: [
							(0, react_jsx_runtime.jsxs)("dl", {
								className: PluginManagerPage_module_css_default.versionFact,
								children: [(0, react_jsx_runtime.jsx)("dt", { children: t("versionsRegistry") }), (0, react_jsx_runtime.jsxs)("dd", { children: [registryName(list.registry, t), fallback === void 0 ? null : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
									label: t("versionsFallbackHint", { registry: registryName(fallback.registry, t) }),
									side: "top",
									portal: true,
									children: (0, react_jsx_runtime.jsx)("span", {
										className: PluginManagerPage_module_css_default.versionHint,
										tabIndex: 0,
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
											className: PluginManagerPage_module_css_default.statusTag,
											tone: "outline",
											children: t("versionsFallbackTag")
										})
									})
								})] })]
							}),
							(0, react_jsx_runtime.jsxs)("dl", {
								className: PluginManagerPage_module_css_default.versionFact,
								children: [(0, react_jsx_runtime.jsx)("dt", { children: t("versionsCheckedAtLabel") }), (0, react_jsx_runtime.jsx)("dd", { children: checkedTime(checkedAt) })]
							}),
							(0, react_jsx_runtime.jsx)("span", { className: PluginManagerPage_module_css_default.versionSpacer }),
							list.versions.some((version) => version.prerelease) ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Checkbox, {
								checked: prereleases,
								onChange: setPrereleases,
								label: t("versionsShowPrerelease")
							}) : null
						]
					})
				]
			});
		}
		/**
		* The Versions section of an updatable bundle's page. It checks once when the page opens and folds the newer versions
		* behind a summary row.
		*/
		function VersionSection({ pkg, check, t, busy, onEnsure, onCheck, onUpdate }) {
			const [open, setOpen] = (0, react.useState)(false);
			const { name, updatable } = pkg;
			(0, react.useEffect)(() => {
				if (updatable) onEnsure(name);
			}, [
				name,
				updatable,
				onEnsure
			]);
			if (!updatable) return null;
			const done = check?.phase === "done" ? check : void 0;
			const summary = summaryOf(check, t);
			const refused = done?.list.status === "refused" ? done.list : void 0;
			const listed = done?.list.status === "listed" ? done.list : void 0;
			const unfolds = summary.newer > 0 || refused !== void 0 && refused.attempts.length > 0;
			const expanded = open && unfolds;
			const text = (0, react_jsx_runtime.jsxs)("span", {
				className: PluginManagerPage_module_css_default.versionSummaryText,
				children: [(0, react_jsx_runtime.jsx)("span", {
					className: PluginManagerPage_module_css_default.versionSummaryTitle,
					children: summary.title
				}), summary.sub === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
					className: PluginManagerPage_module_css_default.versionSummarySub,
					children: summary.sub
				})]
			});
			return (0, react_jsx_runtime.jsxs)("section", {
				className: PluginManagerPage_module_css_default.detailSection,
				"data-plugin-versions": true,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: PluginManagerPage_module_css_default.sectionHead,
					children: [
						(0, react_jsx_runtime.jsx)("h4", {
							className: PluginManagerPage_module_css_default.sectionTitle,
							children: t("versionsTitle")
						}),
						(0, react_jsx_runtime.jsx)("span", { className: PluginManagerPage_module_css_default.versionSpacer }),
						refused === void 0 ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "ghost",
							size: "sm",
							icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutlineRegular, { size: 13 }),
							disabled: check?.phase !== "done",
							onClick: onCheck,
							children: t("versionsRecheck")
						}) : null
					]
				}), (0, react_jsx_runtime.jsxs)("div", {
					className: PluginManagerPage_module_css_default.versionPanel,
					children: [
						listed !== void 0 && summary.newer > 0 ? (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: PluginManagerPage_module_css_default.versionSummary,
							"aria-expanded": expanded,
							onClick: () => {
								setOpen(!open);
							},
							children: [
								(0, react_jsx_runtime.jsx)(Glyph, {
									tone: summary.tone,
									children: summary.glyph
								}),
								text,
								(0, react_jsx_runtime.jsxs)("span", {
									className: PluginManagerPage_module_css_default.versionSummaryEnd,
									children: [expanded ? t("versionsCollapse") : t("versionsNewerCount", { count: String(summary.newer) }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
										className: PluginManagerPage_module_css_default.detailsChevron,
										"aria-hidden": "true"
									})]
								})
							]
						}) : (0, react_jsx_runtime.jsxs)("div", {
							className: PluginManagerPage_module_css_default.versionSummary,
							role: "status",
							children: [
								(0, react_jsx_runtime.jsx)(Glyph, {
									tone: summary.tone,
									children: summary.glyph
								}),
								text,
								refused === void 0 ? null : (0, react_jsx_runtime.jsxs)("span", {
									className: PluginManagerPage_module_css_default.versionSummaryEnd,
									children: [unfolds ? (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: PluginManagerPage_module_css_default.detailsToggle,
										"aria-expanded": expanded,
										onClick: () => {
											setOpen(!open);
										},
										children: [t("versionsDetails"), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
											className: PluginManagerPage_module_css_default.detailsChevron,
											"aria-hidden": "true"
										})]
									}) : null, (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "outline",
										size: "sm",
										onClick: onCheck,
										children: t("retry")
									})]
								})
							]
						}),
						expanded && listed !== void 0 && done !== void 0 ? (0, react_jsx_runtime.jsx)(VersionList, {
							list: listed,
							checkedAt: done.checkedAt,
							t,
							busy,
							onUpdate
						}) : null,
						expanded && refused !== void 0 ? (0, react_jsx_runtime.jsx)("div", {
							className: PluginManagerPage_module_css_default.versionBody,
							children: (0, react_jsx_runtime.jsx)(AttemptRows, {
								attempts: refused.attempts,
								t
							})
						}) : null
					]
				})]
			});
		}
		/** The step labels of an update; the Host announces each step as it starts. */
		function stepLabel(step, update, t) {
			switch (step) {
				case "checking": return t("updateStepChecking", { version: update.to });
				case "removing": return t("updateStepRemoving", { version: update.from });
				case "installing": return t("updateStepInstalling", {
					version: update.to,
					registry: registryName(update.registry, t)
				});
				case "restoring": return t("updateStepRestoring", { version: update.from });
			}
		}
		/** Whether a change result left its operation undone. */
		function failed(application) {
			return application === "failed" || application === "cancelled";
		}
		/** The steps in the order the Host runs them. */
		const STEP_ORDER = [
			"checking",
			"removing",
			"installing",
			"restoring"
		];
		/** The steps an answer implies, joined with the announced ones, so a lost announcement does not drop a step that ran. */
		function settledSteps(announced, result) {
			const implied = new Set(["checking", ...announced]);
			if (result.step === "remove") implied.add("removing");
			if (result.step === "install") implied.add("installing");
			if (result.restore !== void 0) implied.add("restoring");
			return STEP_ORDER.filter((step) => implied.has(step));
		}
		/** How one step ended, or that it still runs. */
		function stepState(step, update, last) {
			const result = update.result;
			if (update.phase === "running") return last ? "running" : "done";
			if (result === null) return last ? "unknown" : "done";
			switch (step) {
				case "checking": return result.step === "check" ? "failed" : "done";
				case "removing": return result.step === "remove" ? "failed" : "done";
				case "installing": return failed(result.result.application) ? "failed" : "done";
				case "restoring": return result.restore !== void 0 && failed(result.restore.application) ? "failed" : "done";
			}
		}
		const STEP_GLYPHS = {
			running: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
				state: "ongoing",
				size: 12
			}),
			done: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, { size: 12 }),
			failed: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, { size: 12 }),
			unknown: null
		};
		/** What the update's outcome reads as: its glyph, title, and the sentence under it. */
		function outcomeOf(update, title, t) {
			const error = {
				tone: "error",
				glyph: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, { size: 14 })
			};
			const result = update.result;
			if (result === null) return {
				...error,
				title: t("updateLost"),
				detail: t("updateLostDetail", { reason: String(update.lost) })
			};
			const reason = (change) => managementText({
				code: "operation-error",
				...change.error,
				installing: true
			}, t);
			if (result.step === "check") return {
				...error,
				title: t("updateRefused", { version: update.to }),
				detail: reason(result.result)
			};
			if (result.step === "remove") return {
				...error,
				title: t("updateRemoveFailed", { version: update.from }),
				detail: reason(result.result)
			};
			if (!failed(result.result.application)) return result.result.application === "restart-required" ? {
				tone: "warn",
				glyph: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, { size: 14 }),
				title: t("updateRestart", { version: update.to }),
				detail: restartText("restartNotice", result.result.restartReason, t)
			} : {
				tone: "success",
				glyph: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, { size: 14 }),
				title: t("updateDone", { version: update.to }),
				detail: t("updateDoneDetail")
			};
			if (result.restore === void 0) return {
				...error,
				title: t("updateKept", { version: update.to }),
				detail: t("updateKeptDetail", {
					from: update.from,
					reason: reason(result.result)
				})
			};
			return failed(result.restore.application) ? {
				...error,
				title: t("updateBroken"),
				detail: t("updateBrokenDetail", {
					from: update.from,
					to: update.to,
					name: title
				})
			} : {
				...error,
				title: t("updateRestored", { version: update.from }),
				detail: t("updateRestoredDetail", {
					from: update.from,
					to: update.to
				})
			};
		}
		/** The update dialog: confirmation, then the Host's steps, then the outcome. */
		function UpdateDialog({ update, title, t, onRun, onClose, onToggleOutput }) {
			const running = update.phase === "running";
			const steps = update.result === null ? update.steps : settledSteps(update.steps, update.result);
			const outcome = update.phase === "done" ? outcomeOf(update, title, t) : void 0;
			const output = [update.result?.result, update.result?.restore].map((change) => change !== void 0 && failed(change.application) ? change.packageResult?.output : void 0).find((text) => text !== void 0 && text !== "");
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open: true,
				onClose: () => {
					if (!running) onClose();
				},
				title: t("updateTitle", { name: title }),
				closeLabel: t("close"),
				className: PluginManagerPage_module_css_default.updateDialog,
				footer: update.phase === "confirm" ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "outline",
					onClick: onClose,
					children: t("cancel")
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "primary",
					onClick: onRun,
					children: t("update")
				})] }) : running ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "outline",
					disabled: true,
					children: t("updateRunning")
				}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "primary",
					onClick: onClose,
					children: t("updateFinish")
				}),
				children: (0, react_jsx_runtime.jsx)("div", {
					className: PluginManagerPage_module_css_default.updateBody,
					"data-plugin-update": update.phase,
					children: update.phase === "confirm" ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						(0, react_jsx_runtime.jsxs)("div", {
							className: PluginManagerPage_module_css_default.updateVersions,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: PluginManagerPage_module_css_default.versionNumber,
									"data-old": "",
									children: update.from
								}),
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {
									size: 14,
									"aria-hidden": "true"
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: PluginManagerPage_module_css_default.versionNumber,
									children: update.to
								})
							]
						}),
						(0, react_jsx_runtime.jsxs)("dl", {
							className: PluginManagerPage_module_css_default.versionFact,
							children: [(0, react_jsx_runtime.jsx)("dt", { children: t("updateSource") }), (0, react_jsx_runtime.jsx)("dd", { children: registryName(update.registry, t) })]
						}),
						(0, react_jsx_runtime.jsx)("p", {
							className: PluginManagerPage_module_css_default.updateText,
							children: t("updateDescription", {
								from: update.from,
								to: update.to
							})
						})
					] }) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						outcome === void 0 ? null : (0, react_jsx_runtime.jsxs)("div", {
							className: PluginManagerPage_module_css_default.updateOutcome,
							role: "status",
							children: [(0, react_jsx_runtime.jsx)(Glyph, {
								tone: outcome.tone,
								children: outcome.glyph
							}), (0, react_jsx_runtime.jsxs)("span", {
								className: PluginManagerPage_module_css_default.versionSummaryText,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: PluginManagerPage_module_css_default.versionSummaryTitle,
									children: outcome.title
								}), (0, react_jsx_runtime.jsx)("span", {
									className: PluginManagerPage_module_css_default.versionSummarySub,
									children: outcome.detail
								})]
							})]
						}),
						output === void 0 ? null : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: PluginManagerPage_module_css_default.detailsToggle,
							"aria-expanded": update.outputOpen,
							onClick: onToggleOutput,
							children: [t("updateOutput"), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
								className: PluginManagerPage_module_css_default.detailsChevron,
								"aria-hidden": "true"
							})]
						}), update.outputOpen ? (0, react_jsx_runtime.jsx)("pre", {
							className: PluginManagerPage_module_css_default.updateOutput,
							children: output
						}) : null] }),
						(0, react_jsx_runtime.jsx)("ol", {
							className: PluginManagerPage_module_css_default.updateSteps,
							children: steps.map((step, index) => {
								const state = stepState(step, update, index === steps.length - 1);
								return (0, react_jsx_runtime.jsxs)("li", {
									className: PluginManagerPage_module_css_default.updateStep,
									"data-state": state,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: PluginManagerPage_module_css_default.updateStepDot,
										"aria-hidden": "true",
										children: STEP_GLYPHS[state]
									}), (0, react_jsx_runtime.jsx)("span", { children: stepLabel(step, update, t) })]
								}, step);
							})
						})
					] })
				})
			});
		}
		//#endregion
		//#region lib/types/client/BundleDetailSection.js
		/** A bundle's long description on its page: the Markdown document the Host reads for it. */
		const FAILURE_KEYS = {
			"too-large": "detailTooLarge",
			"network": "detailNetwork",
			"denied": "detailFailed",
			"git-unavailable": "detailFailed",
			"invalid": "detailInvalid",
			"other": "detailFailed"
		};
		/**
		* Read and render a bundle's detail document in the active language; relative images load from the Host beside it.
		* @param props - the bundle, the language, the reads, and the page's callbacks.
		* @returns the section, or null when the bundle has no document.
		*/
		function BundleDetailSection(props) {
			const { name, version, fromNpm, language, details, t, load, retry, image } = props;
			const key = bundleDetailKey(name, version, language);
			const state = details[key];
			(0, react.useEffect)(() => {
				load(name, version, language, fromNpm);
			}, [key, details]);
			const labels = (0, _deepseek_ai_dsh_client_ui_primitives.useDetailDocumentLabels)({
				title: t("detailTitle"),
				loading: t("detailLoading"),
				retry: t("retry"),
				copy: t("copy"),
				copied: t("copied"),
				codeBlock: t("codeBlock.title"),
				wrap: t("codeBlock.wrap"),
				unwrap: t("codeBlock.unwrap"),
				footnotes: t("detailFootnotes")
			});
			const detail = state?.status === "ready" ? state.detail : void 0;
			const document = detail?.status === "found" ? detail.path : void 0;
			const images = (0, react.useMemo)(() => document === void 0 ? void 0 : { resolve: (value) => image(name, document, value, fromNpm) }, [
				name,
				document,
				fromNpm,
				image
			]);
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.DetailDocument, {
				state: (0, _deepseek_ai_dsh_client_ui_primitives.detailDocumentState)(state?.status === "error" ? {
					status: "error",
					message: t(FAILURE_KEYS[state.failure])
				} : state === void 0 || state.status === "loading" ? state : {
					status: "ready",
					markdown: detail?.status === "found" ? detail.markdown : void 0
				}),
				labels,
				images,
				onRetry: () => {
					retry(name, version, language, fromNpm);
				}
			});
		}
		//#endregion
		//#region lib/types/client/PluginManagerPage.js
		/**
		* Global plugin management: grouped cards for official configuration and
		* optional bundles, the Installed group's cards for the profile's bundles,
		* their row switches, the install dialog with its guide and folded pnpm
		* output, the uninstall confirmation, and the toasts an action's outcome
		* becomes. A bundle's page lists the rows it contributes as the Host runs
		* them; a plugin's configuration renders on its own page through the slots
		* the page declares.
		*/
		/** The primary action installs; the adjacent menu offers every add-plugin path. */
		function AddPluginMenu({ t, disabled, openInstall, renderSlot }) {
			const [open, setOpen] = (0, react.useState)(false);
			const onDismiss = () => {
				setOpen(false);
			};
			return (0, react_jsx_runtime.jsxs)("span", {
				className: PluginManagerPage_module_css_default.addGroup,
				role: "group",
				"aria-label": t("addPlugin"),
				children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
					label: t("addPlugin"),
					side: "bottom",
					delayMs: 500,
					focusDelayMs: 500,
					portal: true,
					disabled,
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "primary",
						size: "sm",
						className: PluginManagerPage_module_css_default.addPrimary,
						icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutlineRegular, { size: 13 }),
						"aria-label": t("addPlugin"),
						disabled,
						onClick: () => {
							onDismiss();
							openInstall();
						},
						children: (0, react_jsx_runtime.jsx)("span", {
							className: PluginManagerPage_module_css_default.toolbarLabel,
							children: t("addPlugin")
						})
					})
				}), (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
					open,
					onClose: onDismiss,
					align: "end",
					portal: true,
					autoFocus: true,
					listClassName: PluginManagerPage_module_css_default.addMenu,
					anchor: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "primary",
						size: "sm",
						className: PluginManagerPage_module_css_default.addMore,
						disabled,
						"aria-label": t("chooseAddMethod"),
						"aria-haspopup": "menu",
						"aria-expanded": open,
						onClick: () => {
							setOpen((value) => !value);
						},
						onKeyDown: (event) => {
							if (!open && event.key === "ArrowDown") {
								event.preventDefault();
								setOpen(true);
							}
						},
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
							size: 12,
							"aria-hidden": "true"
						})
					}),
					children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MenuItemButton, {
						icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDownloadOutlineRegular, { size: 14 }),
						onSelect: () => {
							onDismiss();
							openInstall();
						},
						children: (0, react_jsx_runtime.jsxs)("span", {
							className: PluginManagerPage_module_css_default.addMenuItem,
							children: [(0, react_jsx_runtime.jsx)("span", { children: t("installExisting") }), (0, react_jsx_runtime.jsx)("span", {
								className: PluginManagerPage_module_css_default.addMenuDescription,
								children: t("installExistingDescription")
							})]
						})
					}), renderSlot("plugins.add.actions", { onDismiss })]
				})]
			});
		}
		/** How long the list marks a package an install just enabled. */
		const HIGHLIGHT_MS = 2400;
		/**
		* Whether the main list shows an official optional bundle: any bundle outside `MORE_BUNDLES`, and any held-back one the profile enabled.
		* @param pkg - the official bundle as the Host reports it.
		* @returns whether the main list shows it.
		*/
		function pinnedToMainList(pkg) {
			return !MORE_BUNDLES.includes(pkg.name) || pkg.enabled;
		}
		/**
		* Where an optional bundle sits on both lists: the `EXTENSION_BUNDLES` in their order, then the bundles neither list
		* ranks, then the held-back ones in theirs, so Codex and Claude Code stay last on the More list.
		* @param name - the bundle's package name.
		* @returns the rank; bundles of equal rank keep the order the Host reported.
		*/
		function optionalBundleRank(name) {
			const ranked = EXTENSION_BUNDLES.indexOf(name);
			if (ranked >= 0) return ranked;
			const heldBack = MORE_BUNDLES.indexOf(name);
			return heldBack < 0 ? EXTENSION_BUNDLES.length : EXTENSION_BUNDLES.length + 1 + heldBack;
		}
		/**
		* Order the official optional bundles as both lists show them, so a bundle the profile picks from the More list
		* keeps its place among the neighbours the main list already holds.
		* @param packages - the official bundles the Host offers.
		* @returns the bundles in display order.
		*/
		function orderOptionalBundles(packages) {
			return [...packages].sort((a, b) => optionalBundleRank(a.name) - optionalBundleRank(b.name));
		}
		/** How long a toast holds: long enough to read a failure that names what broke. */
		function toastHoldMs(text) {
			return Math.min(8e3, Math.max(3e3, text.length * 80));
		}
		const PHASE_KEYS = {
			pending: "rowPhasePending",
			loading: "rowPhaseLoading",
			active: "rowPhaseActive",
			failed: "rowPhaseFailed",
			unloading: "rowPhaseUnloading"
		};
		/** Status dot naming a root-fiber phase; loading and unloading are live transitions. */
		const PHASE_STATES = {
			pending: "idle",
			loading: "ongoing",
			active: "done",
			failed: "error",
			unloading: "ongoing"
		};
		/** The count line over a pack's components: the total, then only the states that occur. */
		function partsSummary(rows, t) {
			const failed = rows.filter((row) => row.phase === "failed").length;
			const off = rows.filter((row) => !row.enabled).length;
			const running = rows.filter((row) => row.enabled && row.phase === "active").length;
			return [
				t("partsCountTotal", { count: String(rows.length) }),
				...running > 0 ? [t("partsCountRunning", { count: String(running) })] : [],
				...off > 0 ? [t("partsCountOff", { count: String(off) })] : [],
				...failed > 0 ? [t("partsCountFailed", { count: String(failed) })] : []
			].join(" · ");
		}
		/** Rows beyond this count get a filter box above the list. */
		const ROW_FILTER_THRESHOLD = 10;
		/** The size the 36-viewBox plugin artwork renders at inside a card's 48px frame. */
		const CARD_ARTWORK_SIZE = 36;
		/** The size the artwork renders at inside a row's 40px frame. */
		const ROW_ARTWORK_SIZE = 30;
		/** The artwork of the official plugins that registered their configuration, by registration id. */
		const ITEM_ARTWORK = new Map([
			["shell", _deepseek_ai_dsh_client_ui_primitives.PluginArtworkTerminal],
			["agent-loop", _deepseek_ai_dsh_client_ui_primitives.PluginArtworkLoop],
			["subagent", _deepseek_ai_dsh_client_ui_primitives.PluginArtworkSubagent],
			["web-search", _deepseek_ai_dsh_client_ui_primitives.PluginArtworkSearch]
		]);
		/** An official plugin's card and page artwork; plugins without their own get the default. */
		function itemArtwork(id) {
			return (0, react_jsx_runtime.jsx)(ITEM_ARTWORK.get(id) ?? _deepseek_ai_dsh_client_ui_primitives.PluginArtworkDefault, { size: CARD_ARTWORK_SIZE });
		}
		/** Manifest images remain isolated from the page DOM; a failed decode keeps the position's default artwork. */
		function PackageArtwork({ src, row = false, size = row ? ROW_ARTWORK_SIZE : CARD_ARTWORK_SIZE }) {
			const [failedSource, setFailedSource] = (0, react.useState)();
			return src === void 0 || src === failedSource ? (0, react_jsx_runtime.jsx)(row ? _deepseek_ai_dsh_client_ui_primitives.PluginArtworkSubagent : _deepseek_ai_dsh_client_ui_primitives.PluginArtworkDefault, { size }) : (0, react_jsx_runtime.jsx)("img", {
				className: PluginManagerPage_module_css_default.packageImage,
				src,
				width: size,
				height: size,
				alt: "",
				onError: () => {
					setFailedSource(src);
				}
			});
		}
		/** A row's switch: locked, saying why, when the Host refuses to address the row through the profile patch. */
		function RowSwitch({ row, title, t, busy, onChange }) {
			const locked = row.readOnlyReason !== void 0 || row.entryId === void 0;
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
				checked: row.enabled,
				label: t("partToggle", { name: title }),
				disabled: busy || locked,
				...row.readOnlyReason === void 0 ? {} : { title: managementText({ code: row.readOnlyReason }, t) },
				onChange
			});
		}
		/** What a row's state line says: off, or the phase its fiber is in. */
		function rowStateText(row, t) {
			if (!row.enabled) return t("partOff");
			return row.phase === null ? t("rowStateIdle") : t(PHASE_KEYS[row.phase]);
		}
		/** The dot beside a row: its fiber phase, or idle. */
		function rowDotState(row) {
			if (!row.enabled || row.phase === null) return "idle";
			return PHASE_STATES[row.phase];
		}
		/** A Host metadata diagnostic does not change the package's management permissions. */
		function MetadataError({ error, t }) {
			return error === void 0 ? null : (0, react_jsx_runtime.jsx)("p", {
				className: PluginManagerPage_module_css_default.reason,
				role: "status",
				"data-package-meta-error": true,
				children: t("metadataError", { error })
			});
		}
		/**
		* A pack's rows as a list in the order the pack declares them: a state dot,
		* the row id, one line saying its state, a configure control for a row that
		* registered a page, and, when the pack is on, a switch. A pack like base
		* carries close to a hundred rows, so a long list gets a filter.
		*/
		function RowsSection({ rows, t, resolveText, toggle, configure }) {
			const [filter, setFilter] = (0, react.useState)("");
			const query = filter.trim().toLowerCase();
			const localized = rows.map((row) => ({
				row,
				...rowText(row, resolveText)
			}));
			const shown = query === "" ? localized : localized.filter(({ row, title, description }) => [
				title,
				description,
				row.rowId,
				row.moduleName
			].some((value) => value?.toLowerCase().includes(query)));
			return (0, react_jsx_runtime.jsxs)("section", {
				className: PluginManagerPage_module_css_default.detailSection,
				"data-plugin-rows": true,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.sectionHead,
						children: [(0, react_jsx_runtime.jsx)("h4", {
							className: PluginManagerPage_module_css_default.sectionTitle,
							children: t("partsLabel")
						}), rows.length === 0 ? null : (0, react_jsx_runtime.jsx)("span", {
							className: PluginManagerPage_module_css_default.sectionCount,
							children: partsSummary(rows, t)
						})]
					}),
					rows.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
						className: PluginManagerPage_module_css_default.status,
						children: t("partsEmpty")
					}) : null,
					rows.length > ROW_FILTER_THRESHOLD ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
						type: "search",
						className: PluginManagerPage_module_css_default.partsFilter,
						placeholder: t("partsFilter"),
						"aria-label": t("partsFilter"),
						value: filter,
						onChange: (event) => {
							setFilter(event.target.value);
						}
					}) : null,
					rows.length > 0 && shown.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
						className: PluginManagerPage_module_css_default.status,
						children: t("partsFilterEmpty")
					}) : null,
					shown.length === 0 ? null : (0, react_jsx_runtime.jsx)("ul", {
						className: PluginManagerPage_module_css_default.rows,
						children: shown.map(({ row, title, description }) => (0, react_jsx_runtime.jsxs)("li", {
							className: PluginManagerPage_module_css_default.row,
							"data-plugin-row": row.entryId ?? row.rowId,
							...row.phase === "failed" ? { "data-state": "failed" } : row.enabled ? {} : { "data-state": "off" },
							children: [(0, react_jsx_runtime.jsxs)("div", {
								className: PluginManagerPage_module_css_default.rowLine,
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										className: PluginManagerPage_module_css_default.rowIcon,
										"aria-hidden": "true",
										children: (0, react_jsx_runtime.jsx)(PackageArtwork, {
											src: row.meta?.icon,
											row: true
										}, row.meta?.icon)
									}),
									(0, react_jsx_runtime.jsxs)("div", {
										className: PluginManagerPage_module_css_default.rowMain,
										children: [
											configure?.has(row) === true ? (0, react_jsx_runtime.jsxs)("button", {
												type: "button",
												className: PluginManagerPage_module_css_default.rowOpen,
												"aria-label": t("configureRow", { name: title }),
												onClick: () => {
													configure.open(row);
												},
												children: [(0, react_jsx_runtime.jsx)("span", {
													className: PluginManagerPage_module_css_default.rowId,
													children: title
												}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {
													className: PluginManagerPage_module_css_default.rowOpenIcon,
													"aria-hidden": "true"
												})]
											}) : (0, react_jsx_runtime.jsx)("span", {
												className: PluginManagerPage_module_css_default.rowId,
												children: title
											}),
											description === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
												className: PluginManagerPage_module_css_default.rowModule,
												children: description
											}),
											title === row.rowId ? null : (0, react_jsx_runtime.jsx)("code", {
												className: PluginManagerPage_module_css_default.rowModule,
												children: row.rowId
											}),
											title === row.moduleName ? null : (0, react_jsx_runtime.jsx)("code", {
												className: PluginManagerPage_module_css_default.rowModule,
												children: row.moduleName
											})
										]
									}),
									(0, react_jsx_runtime.jsxs)("span", {
										className: PluginManagerPage_module_css_default.rowState,
										children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: rowDotState(row) }), rowStateText(row, t)]
									}),
									toggle === void 0 ? null : (0, react_jsx_runtime.jsx)(RowSwitch, {
										row,
										title,
										t,
										busy: toggle.busy(row),
										onChange: (enabled) => {
											toggle.onSetEnabled(row, enabled);
										}
									})
								]
							}), (0, react_jsx_runtime.jsx)(MetadataError, {
								error: row.meta?.error,
								t
							})]
						}, row.rowId))
					})
				]
			});
		}
		/** Declared install source and versions; unavailable files retain their recorded dependency spec. */
		function SourceSection({ pkg, t }) {
			if (pkg.source === void 0 && !pkg.installed && pkg.availability === "installation" && !pkg.optional) return null;
			return (0, react_jsx_runtime.jsxs)("section", {
				className: PluginManagerPage_module_css_default.detailSection,
				"data-plugin-source": true,
				children: [(0, react_jsx_runtime.jsx)("h4", {
					className: PluginManagerPage_module_css_default.sectionTitle,
					children: t("sourceTitle")
				}), (0, react_jsx_runtime.jsxs)("dl", {
					className: PluginManagerPage_module_css_default.facts,
					children: [
						(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("sourceSpec") }), (0, react_jsx_runtime.jsx)("dd", { children: pkg.source !== void 0 ? (0, react_jsx_runtime.jsx)("code", { children: pkg.source }) : pkg.availability === "missing" ? t(pkg.installed ? "statusMissingFiles" : "sourceNotInstalled") : t("sourceBuiltIn") })] }),
						pkg.version === void 0 ? null : (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("sourceVersion") }), (0, react_jsx_runtime.jsx)("dd", { children: pkg.version })] }),
						pkg.installTarget === void 0 ? null : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("sourceTargetSpec") }), (0, react_jsx_runtime.jsx)("dd", { children: (0, react_jsx_runtime.jsx)("code", { children: pkg.installTarget.spec }) })] }), (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("sourceTargetVersion") }), (0, react_jsx_runtime.jsx)("dd", { children: pkg.installTarget.version })] })] })
					]
				})]
			});
		}
		/**
		* A bundle's enable switch on its card and its page: locked, saying why, for
		* one the Host protects; off and locked for one it cannot read.
		*/
		function EnableSwitch({ pkg, title, t, busy, onSetEnabled }) {
			return (0, react_jsx_runtime.jsxs)("span", {
				className: PluginManagerPage_module_css_default.bundleToggle,
				children: [(0, react_jsx_runtime.jsxs)("span", {
					className: PluginManagerPage_module_css_default.toggleProgress,
					role: "status",
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: PluginManagerPage_module_css_default.progressAnnouncement,
						children: busy ? t("applyingChange", { name: title }) : ""
					}), busy ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "ongoing" }) : null]
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
					checked: pkg.enabled,
					label: t("enableToggle", { name: title }),
					disabled: busy || pkg.readOnlyReason !== void 0 || !pkg.enabled && pkg.error !== void 0 && !(pkg.availability === "missing" && pkg.installTarget !== void 0),
					...pkg.readOnlyReason === void 0 ? {} : { title: managementText({ code: pkg.readOnlyReason }, t) },
					onChange: onSetEnabled
				})]
			});
		}
		/** The status one card carries: running, off, or a problem the Host reported. */
		function packageStatus(pkg) {
			if (pkg.error !== void 0) return "problem";
			return pkg.enabled ? "running" : "disabled";
		}
		/** The head every card shares: the artwork, the name that opens the page beside its tags, its one-liner, and what sits at the end. */
		function CardHead({ title, t, onOpen, icon, tags, description, end }) {
			const descriptionId = (0, react.useId)();
			return (0, react_jsx_runtime.jsxs)("div", {
				className: PluginManagerPage_module_css_default.cardHead,
				children: [
					(0, react_jsx_runtime.jsx)("span", {
						className: PluginManagerPage_module_css_default.cardIcon,
						"aria-hidden": "true",
						children: icon
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.cardMain,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: PluginManagerPage_module_css_default.titleRow,
							children: [(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: `${PluginManagerPage_module_css_default.cardTitle} ${PluginManagerPage_module_css_default.cardOpen}`,
								"aria-label": t("openDetail", { name: title }),
								"aria-describedby": description === void 0 ? void 0 : descriptionId,
								onClick: onOpen,
								children: title
							}), tags]
						}), description === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
							className: PluginManagerPage_module_css_default.cardDesc,
							id: descriptionId,
							children: description
						})]
					}),
					end === void 0 ? null : (0, react_jsx_runtime.jsx)("div", {
						className: PluginManagerPage_module_css_default.cardEnd,
						children: end
					})
				]
			});
		}
		/** First-read placeholders share the core configuration group's card and text-line layout. */
		function ListSkeleton({ label }) {
			return (0, react_jsx_runtime.jsxs)("section", {
				className: PluginManagerPage_module_css_default.group,
				role: "status",
				"aria-label": label,
				"data-plugin-loading": true,
				children: [(0, react_jsx_runtime.jsx)("div", {
					className: PluginManagerPage_module_css_default.groupHead,
					"aria-hidden": "true",
					children: (0, react_jsx_runtime.jsx)("span", {
						className: `${PluginManagerPage_module_css_default.groupTitle} ${PluginManagerPage_module_css_default.skeletonText} ${PluginManagerPage_module_css_default.skeletonHeading}`,
						children: (0, react_jsx_runtime.jsx)("span", { className: `${PluginManagerPage_module_css_default.skeletonFill} ${PluginManagerPage_module_css_default.skeletonBar}` })
					})
				}), (0, react_jsx_runtime.jsx)("ul", {
					className: PluginManagerPage_module_css_default.cards,
					"aria-hidden": "true",
					children: [
						0,
						1,
						2,
						3
					].map((index) => (0, react_jsx_runtime.jsx)("li", {
						className: PluginManagerPage_module_css_default.card,
						children: (0, react_jsx_runtime.jsxs)("div", {
							className: PluginManagerPage_module_css_default.cardHead,
							children: [
								(0, react_jsx_runtime.jsx)("span", { className: `${PluginManagerPage_module_css_default.cardIcon} ${PluginManagerPage_module_css_default.skeletonFill} ${PluginManagerPage_module_css_default.skeletonIcon}` }),
								(0, react_jsx_runtime.jsxs)("div", {
									className: PluginManagerPage_module_css_default.cardMain,
									children: [(0, react_jsx_runtime.jsx)("div", {
										className: PluginManagerPage_module_css_default.titleRow,
										children: (0, react_jsx_runtime.jsx)("span", {
											className: `${PluginManagerPage_module_css_default.cardTitle} ${PluginManagerPage_module_css_default.skeletonText} ${PluginManagerPage_module_css_default.skeletonTitle}`,
											children: (0, react_jsx_runtime.jsx)("span", { className: `${PluginManagerPage_module_css_default.skeletonFill} ${PluginManagerPage_module_css_default.skeletonBar}` })
										})
									}), (0, react_jsx_runtime.jsx)("span", {
										className: `${PluginManagerPage_module_css_default.cardDesc} ${PluginManagerPage_module_css_default.skeletonText} ${PluginManagerPage_module_css_default.skeletonDescription}`,
										children: (0, react_jsx_runtime.jsx)("span", { className: `${PluginManagerPage_module_css_default.skeletonFill} ${PluginManagerPage_module_css_default.skeletonBar}` })
									})]
								}),
								(0, react_jsx_runtime.jsx)("div", { className: `${PluginManagerPage_module_css_default.cardEnd} ${PluginManagerPage_module_css_default.skeletonActions}` })
							]
						})
					}, index))
				})]
			});
		}
		/** The top every page shares: the crumb that leads back, then the icon with the page's actions at its right. */
		function DetailTop({ crumbLabel, crumbText, onBack, icon, actions }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: PluginManagerPage_module_css_default.detailTop,
				"data-window-drag": true,
				children: [(0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: PluginManagerPage_module_css_default.crumb,
					"aria-label": crumbLabel,
					onClick: onBack,
					children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
						className: PluginManagerPage_module_css_default.crumbIcon,
						"aria-hidden": "true"
					}), (0, react_jsx_runtime.jsx)("span", { children: crumbText })]
				}), (0, react_jsx_runtime.jsxs)("div", {
					className: PluginManagerPage_module_css_default.detailHead,
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: PluginManagerPage_module_css_default.cardIcon,
						"aria-hidden": "true",
						children: icon
					}), actions]
				})]
			});
		}
		/** The registry version a finished version check offers for a package, when it offers one. */
		function versionUpdate(check) {
			return check?.phase === "done" ? updateCandidate(check.list)?.version : void 0;
		}
		/** The list toolbar's sentence about the last update check of every updatable package. */
		function updatesNote(packages, versions, t) {
			const checks = packages.filter((pkg) => pkg.updatable).map((pkg) => versions[pkg.name]);
			if (checks.length === 0 || checks.some((check) => check === void 0 || check.phase === "checking")) return void 0;
			const available = checks.filter((check) => versionUpdate(check) !== void 0).length;
			if (available > 0) return {
				text: t("updatesAvailable", { count: String(available) }),
				tone: "info"
			};
			if (checks.some((check) => check?.phase === "done" && check.list.status === "refused")) return {
				text: t("updatesFailed"),
				tone: "error"
			};
			return { text: t("updatesNone") };
		}
		function updateAvailable(pkg) {
			const target = pkg.installTarget;
			if (!pkg.installed || !pkg.removable || pkg.availability === "installation" || target === void 0) return false;
			return pkg.version !== target.version || (target.spec.startsWith("link:") || pkg.source?.startsWith("link:") === true) && pkg.source !== target.spec;
		}
		/** One package as a card that opens its page: its name, its one-liner, its tags, and its bundle switch. */
		function PackageCard({ pkg, t, resolveText, busy, highlighted, newer, onOpen, onSetEnabled }) {
			const { title, description, beta } = packageText(pkg, resolveText);
			const status = packageStatus(pkg);
			return (0, react_jsx_runtime.jsxs)("li", {
				className: `${PluginManagerPage_module_css_default.card} ${PluginManagerPage_module_css_default.cardLink}`,
				"data-plugin-package": pkg.name,
				"data-plugin-status": status,
				...highlighted ? { "data-plugin-highlight": "" } : {},
				children: [(0, react_jsx_runtime.jsx)(CardHead, {
					title,
					t,
					onOpen,
					icon: (0, react_jsx_runtime.jsx)(PackageArtwork, { src: pkg.meta?.icon }, pkg.meta?.icon),
					tags: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						beta ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
							className: PluginManagerPage_module_css_default.statusTag,
							tone: "info",
							children: t("statusBeta")
						}) : null,
						status === "problem" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
							className: PluginManagerPage_module_css_default.statusTag,
							tone: "danger",
							children: t("statusProblem")
						}) : null,
						pkg.availability === "missing" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
							className: PluginManagerPage_module_css_default.statusTag,
							children: t(pkg.installed ? "statusMissingFiles" : "statusNotInstalled")
						}) : null,
						updateAvailable(pkg) || newer !== void 0 ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
							className: PluginManagerPage_module_css_default.statusTag,
							tone: "info",
							children: t("statusUpdateAvailable")
						}) : null
					] }),
					description,
					end: (0, react_jsx_runtime.jsx)(EnableSwitch, {
						pkg,
						title,
						t,
						busy,
						onSetEnabled
					})
				}), (0, react_jsx_runtime.jsx)(MetadataError, {
					error: pkg.meta?.error,
					t
				})]
			});
		}
		/**
		* One official plugin as a card that opens its page: its icon, its title from
		* the registration, and the one-liner the entry renders in its summary view.
		*/
		function ItemCard({ item, t, onOpen, renderSlot }) {
			return (0, react_jsx_runtime.jsx)("li", {
				className: `${PluginManagerPage_module_css_default.card} ${PluginManagerPage_module_css_default.cardLink}`,
				"data-plugin-item": item.id,
				children: (0, react_jsx_runtime.jsx)(CardHead, {
					title: item.label,
					t,
					onOpen,
					icon: itemArtwork(item.id),
					description: renderSlot("plugins.item", { view: "summary" }, { only: item.id })
				})
			});
		}
		/** One row as the detail slots see it. */
		function rowRef(row) {
			return {
				rowId: row.rowId,
				moduleName: row.moduleName,
				enabled: row.enabled
			};
		}
		/** One bundle as the detail slots see it. */
		function packageRef(pkg) {
			return {
				name: pkg.name,
				...pkg.version === void 0 ? {} : { version: pkg.version },
				installed: pkg.installed,
				availability: pkg.availability,
				official: pkg.official,
				enabled: pkg.enabled,
				rows: pkg.rows.map(rowRef)
			};
		}
		/**
		* An official plugin's page: the crumb back to the cards, its icon with the
		* contributed actions, its title with the contributed badges over its
		* one-liner, the form the entry renders, and the contributed sections.
		*/
		function ItemDetail({ item, t, onBack, renderSlot, form }) {
			const subject = {
				kind: "item",
				id: item.id
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: PluginManagerPage_module_css_default.detail,
				"data-plugin-item-detail": item.id,
				children: [
					(0, react_jsx_runtime.jsx)(DetailTop, {
						crumbLabel: t("backToList"),
						crumbText: t("crumbRoot"),
						onBack,
						icon: itemArtwork(item.id),
						actions: (0, react_jsx_runtime.jsx)("div", {
							className: PluginManagerPage_module_css_default.detailActions,
							children: renderSlot("plugins.detail.actions", { subject })
						})
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.detailMain,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: PluginManagerPage_module_css_default.titleRow,
							children: [(0, react_jsx_runtime.jsx)("h3", {
								className: PluginManagerPage_module_css_default.detailTitle,
								children: item.label
							}), renderSlot("plugins.detail.badge", { subject })]
						}), (0, react_jsx_runtime.jsx)("p", {
							className: PluginManagerPage_module_css_default.detailDesc,
							children: renderSlot("plugins.item", { view: "summary" }, { only: item.id })
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.detailSections,
						children: [(0, react_jsx_runtime.jsx)("section", {
							className: PluginManagerPage_module_css_default.detailSection,
							"data-plugin-config": true,
							children: renderSlot("plugins.item", {
								view: "page",
								form
							}, { only: item.id })
						}), renderSlot("plugins.detail.section", { subject })]
					})
				]
			});
		}
		/**
		* A row's configuration page keeps its technical identity beside local package
		* text and the form supplied by its configuration entry.
		*/
		function RowDetail({ pkg, row, t, resolveText, onBack, renderSlot, form }) {
			const { title } = packageText(pkg, resolveText);
			const { title: rowTitle, description } = rowText(row, resolveText);
			const key = rowConfigKey(pkg.name, row.rowId);
			const subject = {
				kind: "row",
				pkg: packageRef(pkg),
				row: rowRef(row)
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: PluginManagerPage_module_css_default.detail,
				"data-plugin-row-detail": key,
				children: [
					(0, react_jsx_runtime.jsx)(DetailTop, {
						crumbLabel: t("backToPackage", { name: title }),
						crumbText: title,
						onBack,
						icon: (0, react_jsx_runtime.jsx)(PackageArtwork, {
							src: row.meta?.icon,
							row: true,
							size: CARD_ARTWORK_SIZE
						}, row.meta?.icon),
						actions: (0, react_jsx_runtime.jsx)("div", {
							className: PluginManagerPage_module_css_default.detailActions,
							children: renderSlot("plugins.detail.actions", { subject })
						})
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.detailMain,
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: PluginManagerPage_module_css_default.titleRow,
								children: [(0, react_jsx_runtime.jsx)("h3", {
									className: PluginManagerPage_module_css_default.detailTitle,
									children: rowTitle
								}), renderSlot("plugins.detail.badge", { subject })]
							}),
							rowTitle === row.rowId ? null : (0, react_jsx_runtime.jsx)("p", {
								className: PluginManagerPage_module_css_default.detailName,
								children: (0, react_jsx_runtime.jsx)("code", { children: row.rowId })
							}),
							(0, react_jsx_runtime.jsx)("p", {
								className: PluginManagerPage_module_css_default.detailName,
								children: (0, react_jsx_runtime.jsx)("code", { children: row.moduleName })
							}),
							(0, react_jsx_runtime.jsx)("p", {
								className: PluginManagerPage_module_css_default.detailDesc,
								children: description ?? renderSlot("plugins.row.config", { view: "summary" }, { entryKey: key })
							})
						]
					}),
					(0, react_jsx_runtime.jsx)(MetadataError, {
						error: row.meta?.error,
						t
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.detailSections,
						"data-plugin-config": true,
						children: [renderSlot("plugins.row.config", {
							view: "page",
							form
						}, { entryKey: key }), renderSlot("plugins.detail.section", { subject })]
					})
				]
			});
		}
		/**
		* One package's page: the crumb back to the list; its icon with its switch
		* and, for a package the profile installed or a selection the Host can remove, uninstall; its title beside its
		* version tag, its beta tag, and its problem tag; the package name the title
		* stands for; its one-liner; the Host's problem when it reports one; the
		* configuration the bundle registered for itself; its rows with their switches
		* and configure controls; and where it comes from.
		*/
		function PackageDetail({ pkg, t, resolveText, busy, rowBusy, configured, configure, renderSlot, inMore, versions, detail, onBack, onSetEnabled, onUninstall, onUpdate, onSetRowEnabled, onEnsureVersions, onCheckVersions, onUpdateVersion }) {
			const { title, description, beta } = packageText(pkg, resolveText);
			const newer = versionUpdate(versions);
			const status = packageStatus(pkg);
			const subject = {
				kind: "bundle",
				pkg: packageRef(pkg)
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: PluginManagerPage_module_css_default.detail,
				"data-plugin-detail": pkg.name,
				children: [
					(0, react_jsx_runtime.jsx)(DetailTop, {
						crumbLabel: inMore ? t("backToPackage", { name: t("moreTitle") }) : t("backToList"),
						crumbText: t(inMore ? "moreTitle" : "crumbRoot"),
						onBack,
						icon: (0, react_jsx_runtime.jsx)(PackageArtwork, { src: pkg.meta?.icon }, pkg.meta?.icon),
						actions: (0, react_jsx_runtime.jsxs)("div", {
							className: PluginManagerPage_module_css_default.detailActions,
							children: [
								renderSlot("plugins.detail.actions", { subject }),
								updateAvailable(pkg) ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									size: "sm",
									icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutlineRegular, { size: 13 }),
									disabled: busy,
									"aria-label": t("updateLabel", { name: title }),
									onClick: onUpdate,
									children: t("update")
								}) : null,
								newer === void 0 ? null : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "primary",
									size: "sm",
									icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutlineRegular, { size: 13 }),
									disabled: busy,
									"aria-label": t("versionsUpdateLabel", { version: newer }),
									onClick: () => {
										onUpdateVersion(newer);
									},
									children: t("versionsUpdateLabel", { version: newer })
								}),
								pkg.installed || pkg.removable ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									size: "sm",
									className: PluginManagerPage_module_css_default.danger,
									icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutlineRegular, { size: 13 }),
									"aria-label": t("uninstallLabel", { name: title }),
									disabled: busy || !pkg.removable || pkg.readOnlyReason !== void 0,
									onClick: onUninstall,
									children: t("uninstall")
								}) : null,
								(0, react_jsx_runtime.jsx)(EnableSwitch, {
									pkg,
									title,
									t,
									busy,
									onSetEnabled
								})
							]
						})
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.detailMain,
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: PluginManagerPage_module_css_default.titleRow,
								children: [
									(0, react_jsx_runtime.jsx)("h3", {
										className: PluginManagerPage_module_css_default.detailTitle,
										children: title
									}),
									pkg.version === void 0 ? null : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
										className: PluginManagerPage_module_css_default.versionTag,
										tone: "neutral",
										children: t("versionTag", { version: pkg.version })
									}),
									beta ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
										className: PluginManagerPage_module_css_default.statusTag,
										tone: "info",
										children: t("statusBeta")
									}) : null,
									status === "problem" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
										className: PluginManagerPage_module_css_default.statusTag,
										tone: "danger",
										children: t("statusProblem")
									}) : null,
									pkg.availability === "missing" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
										className: PluginManagerPage_module_css_default.statusTag,
										children: t(pkg.installed ? "statusMissingFiles" : "statusNotInstalled")
									}) : null,
									updateAvailable(pkg) || newer !== void 0 ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
										className: PluginManagerPage_module_css_default.statusTag,
										tone: "info",
										children: t("statusUpdateAvailable")
									}) : null,
									renderSlot("plugins.detail.badge", { subject })
								]
							}),
							(0, react_jsx_runtime.jsx)("p", {
								className: PluginManagerPage_module_css_default.detailName,
								children: (0, react_jsx_runtime.jsx)("code", {
									"data-plugin-name": true,
									children: pkg.name
								})
							}),
							description === void 0 ? null : (0, react_jsx_runtime.jsx)("p", {
								className: PluginManagerPage_module_css_default.detailDesc,
								children: description
							})
						]
					}),
					(0, react_jsx_runtime.jsx)(MetadataError, {
						error: pkg.meta?.error,
						t
					}),
					pkg.error === void 0 ? null : (0, react_jsx_runtime.jsxs)("p", {
						className: PluginManagerPage_module_css_default.reason,
						role: "status",
						children: [
							t("reasonLabel"),
							": ",
							managementText(pkg.error, t)
						]
					}),
					pkg.readOnlyReason === void 0 ? null : (0, react_jsx_runtime.jsx)("p", {
						className: PluginManagerPage_module_css_default.reason,
						role: "status",
						children: managementText({ code: pkg.readOnlyReason }, t)
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.detailSections,
						children: [
							detail,
							configured ? (0, react_jsx_runtime.jsx)("section", {
								className: PluginManagerPage_module_css_default.detailSection,
								"data-plugin-config": true,
								children: renderSlot("plugins.bundle.config", { view: "page" }, { entryKey: pkg.name })
							}) : null,
							pkg.availability === "missing" ? null : (0, react_jsx_runtime.jsx)(RowsSection, {
								rows: pkg.rows,
								t,
								resolveText,
								toggle: pkg.enabled ? {
									busy: (row) => busy || rowBusy(row),
									onSetEnabled: onSetRowEnabled
								} : void 0,
								configure
							}),
							(0, react_jsx_runtime.jsx)(VersionSection, {
								pkg,
								check: versions,
								t,
								busy,
								onEnsure: onEnsureVersions,
								onCheck: onCheckVersions,
								onUpdate: onUpdateVersion
							}),
							(0, react_jsx_runtime.jsx)(SourceSection, {
								pkg,
								t
							}),
							renderSlot("plugins.detail.section", { subject })
						]
					})
				]
			});
		}
		/** Output lines an install run's terminal shows before its middle folds: the first and last six of a long pnpm log. */
		const INSTALL_TERMINAL_LINES = 12;
		/** The install terminal's display copy, from the tab's dictionary. */
		function terminalLabels(t) {
			return {
				commandLine: (line) => t("terminalCommandLine", { n: String(line) }),
				/* v8 ignore next -- the Host reports a killed pnpm as a null exit code, never a signal name; the label interface needs one */
				signal: (signal) => t("terminalSignal", { signal }),
				exitCode: (code) => t("terminalExitCode", { code: String(code) }),
				noExitCode: t("terminalNoExitCode"),
				running: t("terminalRunning"),
				failed: t("terminalFailed"),
				done: t("terminalDone"),
				copy: t("terminalCopy"),
				copied: t("terminalCopied"),
				noOutput: t("terminalNoOutput"),
				collapseAria: t("terminalCollapseAria"),
				collapse: t("terminalCollapse"),
				expandAria: (hidden) => t("terminalExpandAria", { n: String(hidden) }),
				expand: (hidden) => t("terminalExpand", { n: String(hidden) })
			};
		}
		/** The sentence under the field for a spec the check refused. */
		const INPUT_PROBLEM_KEYS = {
			"invalid-spec": "installProblemInvalid",
			"already-installed": "installProblemInstalled",
			"shipped": "installProblemShipped",
			"not-found": "installProblemNotFound",
			"not-a-package": "installProblemNotPackage",
			"not-a-bundle": "installProblemNotBundle",
			"network": "installProblemNetwork",
			"unknown": "installProblemUnknown"
		};
		/** The spec form the install guide shows, with an example the person can drop into the field. */
		const GUIDE_EXAMPLES = [{
			key: "id",
			titleKey: "installGuideIdTitle",
			exampleKey: "installGuideIdExample",
			hintKey: "installGuideIdHint"
		}];
		/** The one-line reading of a classified pnpm failure. */
		const FAILURE_KIND_KEYS = {
			"pnpm-missing": "installFailurePnpmMissing",
			"timeout": "installFailureTimeout",
			"not-found": "installFailureNotFound",
			"no-matching-version": "installFailureNoMatchingVersion",
			"network": "installFailureNetwork",
			"disk-full": "installFailureDiskFull",
			"permission": "installFailurePermission",
			"build-blocked": "installFailureBuildBlocked",
			"integrity": "installFailureIntegrity",
			"unknown": "installFailureGeneric"
		};
		/** The navigation value of the page's own tab; contributed tabs use their registration ids. */
		const INSTALLED_TAB = "installed";
		/** The heading of each screen past the spec. */
		const SCREEN_TITLE_KEYS = {
			starting: "installStarting",
			running: "installingTitle",
			cancelling: "installCancelling",
			applying: "installApplying",
			unconfirmed: "installUnconfirmedTitle",
			unknown: "installUnknownTitle",
			done: "installedTitle",
			failed: "installFailedTitle"
		};
		/** What the spec's kind reads as when the package carries no description of its own. */
		const SUBJECT_KIND_KEYS = {
			registry: void 0,
			path: "installSubjectPath",
			git: "installSubjectGit",
			tarball: "installSubjectTarball"
		};
		/** A check no registry answered names every registry asked; any other refusal reads by its problem. */
		function inputProblemSentence(problem, t, resolved) {
			const asked = problem.registries ?? [];
			return problem.problem === "network" && asked.length > 1 ? t("installProblemNetworkAll", { registries: registryList(asked, t, resolved) }) : t(INPUT_PROBLEM_KEYS[problem.problem], { reason: problem.reason });
		}
		/** The registries asked, by name, in the dictionary's list form. */
		function registryList(registries, t, resolved) {
			return registries.map((registry) => registryText(registry, t, resolved).name).join(t("registryListSeparator"));
		}
		/** An option's name with its host in tertiary text, unless the host is the name. */
		function registryOption(registry, t, resolved) {
			const { name, host } = registryText(registry, t, resolved);
			return name === host ? name : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				name,
				" ",
				(0, react_jsx_runtime.jsx)("span", {
					className: PluginManagerPage_module_css_default.registryHint,
					children: host
				})
			] });
		}
		/**
		* The failed screen's one line: a pnpm failure by its kind, a refusal by its
		* code, any other failure in the Host's words; the run's output stays behind the details.
		* A run the Host laid at the spec's own host says so; one it laid at a registry
		* names every registry asked when there were several.
		*/
		function failureText(failure, t, install) {
			if (failure === null) return t("installFailureGeneric");
			if (failure.code === "incompatible-version") {
				const incompatible = failure.incompatible === void 0 ? {} : { incompatible: failure.incompatible };
				return managementText({
					code: failure.code,
					installing: true,
					...incompatible
				}, t);
			}
			if (failure.kind === "build-blocked" && !failure.pendingBuilds?.length) return t("installFailureBuildBlockedManual");
			const host = install?.subject?.host;
			if (failure.failedAt === "spec-host" && host !== void 0) return t("installFailureNetworkHost", { host });
			const asked = install?.attempts?.registries ?? [];
			if (failure.failedAt === "registry" && (failure.kind === "network" || failure.kind === "timeout") && asked.length > 1) return t("installFailureNetworkAll", { registries: registryList(asked, t, install?.registries?.resolved ?? null) });
			if (failure.kind !== void 0) return t(FAILURE_KIND_KEYS[failure.kind]);
			if (failure.code !== void 0) return managementText({
				code: failure.code,
				diagnostic: failure.reason
			}, t);
			return failure.reason === "" ? t("installFailureGeneric") : failure.reason;
		}
		/** The package an install is about: its name, one-liner, version, and, when `showSpec` is set, its spec. */
		function SubjectBlock({ lines, t }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: PluginManagerPage_module_css_default.subject,
				"data-install-subject": lines.spec,
				children: [
					(0, react_jsx_runtime.jsx)("p", {
						className: PluginManagerPage_module_css_default.subjectName,
						children: lines.title
					}),
					lines.description === void 0 ? null : (0, react_jsx_runtime.jsx)("p", {
						className: PluginManagerPage_module_css_default.subjectDesc,
						children: lines.description
					}),
					lines.version === void 0 ? null : (0, react_jsx_runtime.jsx)("p", {
						className: PluginManagerPage_module_css_default.subjectMeta,
						children: t("installVersion", { version: lines.version })
					}),
					lines.showSpec ? (0, react_jsx_runtime.jsx)("p", {
						className: PluginManagerPage_module_css_default.subjectSpec,
						children: lines.spec
					}) : null
				]
			});
		}
		/** The checked package as the Host read it before installing; a confirmed version keeps its tab's name and version. */
		function SubjectCard({ subject, confirmed, t }) {
			const kindKey = SUBJECT_KIND_KEYS[subject.kind];
			return (0, react_jsx_runtime.jsx)(SubjectBlock, {
				t,
				lines: {
					spec: subject.spec,
					title: confirmed?.title ?? subject.name ?? subject.spec,
					description: subject.description ?? (kindKey === void 0 ? void 0 : t(kindKey)),
					version: subject.version ?? confirmed?.version,
					showSpec: confirmed !== void 0
				}
			});
		}
		/** Track one install field's composition, including Safari's 10ms post-composition Enter window. */
		function useInstallComposition(active) {
			const composition = (0, react.useRef)({
				active: false,
				until: 0
			});
			(0, react.useEffect)(() => {
				composition.current = {
					active: false,
					until: 0
				};
			}, [active]);
			return {
				onCompositionStart: () => {
					composition.current.active = true;
				},
				onCompositionEnd: () => {
					composition.current = {
						active: false,
						until: Date.now() + 10
					};
				},
				onBlur: () => {
					composition.current = {
						active: false,
						until: 0
					};
				},
				isComposing: (event) => event.isComposing || Reflect.get(event, "keyCode") === 229 || composition.current.active || Date.now() < composition.current.until
			};
		}
		/**
		* The install dialog: the spec and its check, then the installing, installed,
		* and failed screens over the same subject card. A failed run that left
		* install scripts undecided shows them for approval in place of plain retry.
		*/
		function InstallDialog({ install, t, onClose, onEditSpec, onRun, onCancel, onReconcile, onToggleDetails, onEnableNow, onApproveBuilds, onToggleRegistry, onChooseRegistry, onChangeRegistry, onUseGithubMirror }) {
			const errorId = (0, react.useId)();
			const templateHintId = (0, react.useId)();
			const guideId = (0, react.useId)();
			const approvalId = (0, react.useId)();
			const registryId = (0, react.useId)();
			const registryErrorId = (0, react.useId)();
			const [guideOpen, setGuideOpen] = (0, react.useState)(false);
			const [customRegistryDraft, setCustomRegistryDraft] = (0, react.useState)("");
			const { phase } = install;
			const registryToggleRef = (0, react.useRef)(null);
			const registryPanelRef = (0, react.useRef)(null);
			const registryCustomRef = (0, react.useRef)(null);
			const registryShown = install.registryOpen && phase === "idle";
			const specComposition = useInstallComposition(install.open && phase === "idle");
			const registryComposition = useInstallComposition(install.open && registryShown);
			const registryPosition = (0, _deepseek_ai_dsh_client_ui_primitives.useAnchoredPosition)({
				open: registryShown,
				anchorRef: registryToggleRef,
				panelRef: registryPanelRef,
				align: "end",
				gap: 6,
				margin: 12
			});
			const registryReady = registryShown && registryPosition !== null;
			(0, react.useEffect)(() => {
				if (registryReady && install.registryError) registryCustomRef.current?.focus();
			}, [registryReady, install.registryError]);
			(0, _deepseek_ai_dsh_client_ui_primitives.useDismissOnOutsidePointer)(registryToggleRef, registryShown, onToggleRegistry, registryPanelRef);
			(0, react.useEffect)(() => {
				if (!registryShown) return;
				const onKeyDown = (event) => {
					if (event.key !== "Escape") return;
					event.stopPropagation();
					onToggleRegistry();
				};
				document.addEventListener("keydown", onKeyDown, true);
				return () => {
					document.removeEventListener("keydown", onKeyDown, true);
				};
			}, [registryShown, onToggleRegistry]);
			if (githubRecoveryRegistry(install) !== void 0) {
				const anotherWay = asksMirror(install);
				return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
					open: install.open,
					onClose,
					title: t(install.failure?.kind === "timeout" ? "installGithubTimeoutTitle" : "installGithubFailedTitle"),
					closeLabel: t("close"),
					description: t("installGithubFailedDescription"),
					footer: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "outline",
						onClick: onClose,
						children: t("cancel")
					}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "primary",
						autoFocus: true,
						onClick: () => {
							if (anotherWay) setGuideOpen(true);
							onUseGithubMirror();
						},
						children: t(anotherWay ? "installTryAnotherWay" : "installUseGithubMirror")
					})] })
				});
			}
			if ((phase === "idle" || phase === "checking") && install.confirmed !== void 0) {
				const checking = phase === "checking";
				const problem = install.inputError;
				return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
					open: install.open,
					onClose,
					title: t(problem === null ? "installConfirmedTitle" : "installConfirmedRefused"),
					closeLabel: t("close"),
					className: PluginManagerPage_module_css_default.installDialog,
					footer: checking ? void 0 : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "outline",
						onClick: onClose,
						children: t("close")
					}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "primary",
						autoFocus: true,
						onClick: onRun,
						children: t(problem === null ? "installRun" : "retry")
					})] }),
					children: (0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.installBody,
						"data-install-phase": phase,
						children: [(0, react_jsx_runtime.jsx)(SubjectBlock, {
							t,
							lines: {
								spec: install.spec,
								...install.confirmed,
								showSpec: true
							}
						}), checking ? (0, react_jsx_runtime.jsxs)("p", {
							className: `${PluginManagerPage_module_css_default.status} ${PluginManagerPage_module_css_default.statusWithDot}`,
							role: "status",
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "ongoing" }), t("installChecking")]
						}) : problem === null ? null : (0, react_jsx_runtime.jsx)("p", {
							className: PluginManagerPage_module_css_default.inputError,
							role: "alert",
							children: inputProblemSentence(problem, t, install.registries?.resolved ?? null)
						})]
					})
				});
			}
			if (phase === "idle" || phase === "checking") {
				const checking = phase === "checking";
				const empty = install.spec.trim() === "";
				const choice = install.registry;
				const resolved = install.registries?.resolved ?? null;
				const chosenTitle = choice.kind === "custom" ? t("registryCustom") : registryText(choice.registry, t, resolved).name;
				const inputSentence = install.inputError === null ? null : inputProblemSentence(install.inputError, t, resolved);
				const templateHint = install.spec === "https://github.com/author/dsh-plugin" ? t("installGitTemplateHint") : install.spec === "/Users/name/my-plugin" ? t("installPathTemplateHint") : null;
				return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
					open: install.open,
					onClose,
					title: t("installTitle"),
					closeLabel: t("close"),
					...install.mirrorRecovery ? {} : { description: t("installDescription") },
					className: PluginManagerPage_module_css_default.installDialog,
					contentClassName: PluginManagerPage_module_css_default.installContent,
					footer: (0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.installFooter,
						children: [(0, react_jsx_runtime.jsxs)("p", {
							className: PluginManagerPage_module_css_default.installSafety,
							role: "note",
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, {
								size: 14,
								"aria-hidden": "true"
							}), (0, react_jsx_runtime.jsxs)("span", {
								className: PluginManagerPage_module_css_default.installSafetyText,
								children: [(0, react_jsx_runtime.jsx)("span", { children: t("installGuideSafety") }), (0, react_jsx_runtime.jsx)("span", { children: t("installUpgradeNotice") })]
							})]
						}), (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "primary",
							className: PluginManagerPage_module_css_default.wide,
							disabled: checking || empty,
							"aria-busy": checking,
							onClick: onRun,
							children: [checking ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "ongoing" }) : null, t(checking ? "installChecking" : "installRun")]
						})]
					}),
					children: (0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.installBody,
						children: [
							(0, react_jsx_runtime.jsx)("div", {
								className: PluginManagerPage_module_css_default.installField,
								children: (0, react_jsx_runtime.jsx)("input", {
									type: "text",
									autoFocus: install.mirrorRecovery === true,
									"data-modal-autofocus": true,
									value: install.spec,
									placeholder: t("installSpecPlaceholder"),
									disabled: checking,
									"aria-label": t(install.mirrorRecovery ? "installPackageLabel" : "installSpecLabel"),
									"aria-invalid": install.inputError !== null,
									"aria-describedby": inputSentence !== null ? errorId : templateHint !== null ? templateHintId : void 0,
									onChange: (event) => {
										onEditSpec(event.currentTarget.value);
									},
									onCompositionStart: specComposition.onCompositionStart,
									onCompositionEnd: specComposition.onCompositionEnd,
									onBlur: specComposition.onBlur,
									onKeyDown: (event) => {
										if (specComposition.isComposing(event.nativeEvent)) return;
										if (event.key === "Enter" && !empty && !checking) onRun();
									}
								})
							}),
							inputSentence === null ? null : (0, react_jsx_runtime.jsx)("p", {
								id: errorId,
								className: PluginManagerPage_module_css_default.inputError,
								role: "alert",
								children: inputSentence
							}),
							inputSentence === null && templateHint !== null ? (0, react_jsx_runtime.jsx)("p", {
								id: templateHintId,
								className: PluginManagerPage_module_css_default.templateHint,
								role: "status",
								children: templateHint
							}) : null,
							(0, react_jsx_runtime.jsxs)("div", {
								className: PluginManagerPage_module_css_default.optionsRow,
								children: [(0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: PluginManagerPage_module_css_default.guideToggle,
									"aria-expanded": guideOpen,
									"aria-controls": guideId,
									onClick: () => {
										setGuideOpen((open) => !open);
									},
									children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
										className: PluginManagerPage_module_css_default.guideChevron,
										"aria-hidden": "true"
									}), (0, react_jsx_runtime.jsx)("span", { children: t(guideOpen ? "installGuideHide" : "installGuideToggle") })]
								}), (0, react_jsx_runtime.jsxs)("button", {
									ref: registryToggleRef,
									type: "button",
									className: PluginManagerPage_module_css_default.registryToggle,
									"aria-expanded": install.registryOpen,
									"aria-controls": registryId,
									"aria-haspopup": "dialog",
									disabled: checking,
									onClick: onToggleRegistry,
									children: [
										(0, react_jsx_runtime.jsx)("span", { children: t("registryToggle") }),
										" ",
										(0, react_jsx_runtime.jsx)("span", {
											className: PluginManagerPage_module_css_default.registryChosen,
											children: chosenTitle
										}),
										(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
											className: PluginManagerPage_module_css_default.guideChevron,
											"aria-hidden": "true"
										})
									]
								})]
							}),
							guideOpen ? (0, react_jsx_runtime.jsx)("div", {
								id: guideId,
								className: PluginManagerPage_module_css_default.guide,
								"data-install-guide": true,
								children: (0, react_jsx_runtime.jsx)("ol", {
									className: PluginManagerPage_module_css_default.guideList,
									children: GUIDE_EXAMPLES.map(({ key, titleKey, exampleKey, hintKey }) => (0, react_jsx_runtime.jsxs)("li", {
										className: PluginManagerPage_module_css_default.guideItem,
										children: [(0, react_jsx_runtime.jsxs)("div", {
											className: PluginManagerPage_module_css_default.guideMain,
											children: [
												(0, react_jsx_runtime.jsx)("span", {
													className: PluginManagerPage_module_css_default.guideTitle,
													children: t(titleKey)
												}),
												(0, react_jsx_runtime.jsx)("span", {
													className: PluginManagerPage_module_css_default.guideHint,
													children: t(hintKey)
												}),
												(0, react_jsx_runtime.jsxs)("span", {
													className: PluginManagerPage_module_css_default.guideExample,
													children: [(0, react_jsx_runtime.jsx)("span", {
														className: PluginManagerPage_module_css_default.guideExampleLabel,
														children: t("installGuideExampleLabel")
													}), (0, react_jsx_runtime.jsx)("code", { children: t(exampleKey) })]
												})
											]
										}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "outline",
											size: "sm",
											"aria-label": t("installGuideFillAria", { example: t(exampleKey) }),
											disabled: checking,
											onClick: () => {
												onEditSpec(t(exampleKey));
											},
											children: t("installGuideFill")
										})]
									}, key))
								})
							}) : null,
							registryShown ? (0, react_dom.createPortal)((0, react_jsx_runtime.jsxs)("fieldset", {
								ref: registryPanelRef,
								id: registryId,
								className: PluginManagerPage_module_css_default.registry,
								style: registryPosition ?? {
									visibility: "hidden",
									left: 0,
									top: 0
								},
								"data-install-registry": true,
								"aria-label": t("registryLegend"),
								onKeyDown: (event) => {
									if (event.key !== "Tab" || event.ctrlKey || event.altKey || event.metaKey || event.nativeEvent.isComposing) return;
									event.preventDefault();
									event.stopPropagation();
									const radio = event.currentTarget.querySelector("input[type=\"radio\"]:checked");
									const field = registryCustomRef.current;
									if (event.shiftKey && event.target === field) radio?.focus();
									else if (!event.shiftKey && event.target !== field) field?.focus();
									else {
										onToggleRegistry();
										registryToggleRef.current?.focus();
									}
								},
								children: [offeredRegistries(install.registries).map((registry) => {
									const checked = choice.kind === "offered" && choice.registry === registry;
									return (0, react_jsx_runtime.jsxs)("label", {
										className: PluginManagerPage_module_css_default.registryOption,
										"data-checked": checked,
										children: [(0, react_jsx_runtime.jsx)("input", {
											type: "radio",
											name: registryId,
											checked,
											onChange: () => {
												if (choice.kind === "custom") setCustomRegistryDraft(choice.url);
												onChooseRegistry({
													kind: "offered",
													registry
												});
											}
										}), (0, react_jsx_runtime.jsx)("span", {
											className: PluginManagerPage_module_css_default.registryTitle,
											children: registryOption(registry, t, resolved)
										})]
									}, registry ?? "");
								}), (0, react_jsx_runtime.jsxs)("div", {
									className: PluginManagerPage_module_css_default.registryOption,
									"data-checked": choice.kind === "custom",
									onClick: (event) => {
										if (!(event.target instanceof HTMLInputElement)) event.preventDefault();
										registryCustomRef.current?.focus();
									},
									children: [
										(0, react_jsx_runtime.jsxs)("label", {
											className: PluginManagerPage_module_css_default.registryCustomPick,
											children: [(0, react_jsx_runtime.jsx)("input", {
												type: "radio",
												name: registryId,
												checked: choice.kind === "custom",
												onChange: () => {
													onChooseRegistry({
														kind: "custom",
														url: customRegistryDraft
													});
													registryCustomRef.current?.focus();
												}
											}), (0, react_jsx_runtime.jsx)("span", {
												className: PluginManagerPage_module_css_default.registryTitle,
												children: (0, react_jsx_runtime.jsx)("span", { children: t("registryCustom") })
											})]
										}),
										(0, react_jsx_runtime.jsx)("input", {
											ref: registryCustomRef,
											type: "text",
											className: PluginManagerPage_module_css_default.registryCustomField,
											"aria-label": t("registryCustom"),
											placeholder: t("registryCustomPlaceholder"),
											value: choice.kind === "custom" ? choice.url : customRegistryDraft,
											"aria-invalid": install.registryError,
											"aria-describedby": install.registryError ? registryErrorId : void 0,
											onFocus: () => {
												if ((0, _deepseek_ai_dsh_client_ui_primitives.pointerModality)() && choice.kind !== "custom") onChooseRegistry({
													kind: "custom",
													url: customRegistryDraft
												});
											},
											onChange: (event) => {
												onChooseRegistry({
													kind: "custom",
													url: event.currentTarget.value
												});
											},
											onCompositionStart: registryComposition.onCompositionStart,
											onCompositionEnd: registryComposition.onCompositionEnd,
											onBlur: registryComposition.onBlur,
											onKeyDown: (event) => {
												if (registryComposition.isComposing(event.nativeEvent)) return;
												if (event.key === "Enter" && !empty) onRun();
											}
										}),
										install.registryError ? (0, react_jsx_runtime.jsx)("p", {
											id: registryErrorId,
											className: PluginManagerPage_module_css_default.inputError,
											role: "alert",
											children: t("registryCustomInvalid")
										}) : null,
										(0, react_jsx_runtime.jsx)("span", {
											className: PluginManagerPage_module_css_default.registryHint,
											children: t("registryCustomHint")
										})
									]
								})]
							}), document.body) : null
						]
					})
				});
			}
			const heading = t(phase === "done" && install.subject?.bundled ? "installBundledTitle" : SCREEN_TITLE_KEYS[phase]);
			const pending = isInstallPending(phase);
			const cancellable = phase === "starting" || phase === "running" || phase === "unconfirmed";
			const stoppable = cancellable || phase === "failed" || phase === "unknown";
			const failure = install.failure;
			const uncertainty = failure?.uncertainty;
			const uncertaintyText = failure?.uncertainty === void 0 ? null : t({
				result: "installResultUnconfirmed",
				cancellation: phase === "applying" ? "installApplyingCancellationError" : "installCancelUnconfirmed",
				acceptance: "installAwaitingAcceptance"
			}[failure.uncertainty], { reason: failure.reason });
			const pendingBuilds = phase === "failed" ? install.failure?.pendingBuilds ?? [] : [];
			const approvable = pendingBuilds.length > 0;
			const firstRun = install.runs[0];
			const asked = install.attempts !== null && install.attempts.registries.length > 1 ? install.attempts : null;
			const current = asked === null ? void 0 : asked.registries.at(-1);
			const previous = asked === null ? void 0 : asked.registries.at(-2);
			const resolved = install.registries?.resolved ?? null;
			const attemptLine = pending && asked !== null && current !== void 0 && previous !== void 0 ? t("installAttempt", {
				previous: registryText(previous, t, resolved).name,
				registry: registryText(current, t, resolved).name,
				index: String(asked.registries.length),
				total: String(asked.total)
			}) : null;
			const changeable = phase === "failed" && !approvable && install.failure?.failedAt === "registry" && install.confirmed === void 0;
			const subject = install.subject;
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open: install.open,
				onClose,
				title: heading,
				headless: true,
				className: PluginManagerPage_module_css_default.installDialog,
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: PluginManagerPage_module_css_default.wizard,
					"data-install-phase": phase,
					children: [(0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.wizardHead,
						children: [phase === "done" || install.confirmed !== void 0 && !pending ? (0, react_jsx_runtime.jsx)("span", {}) : (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: PluginManagerPage_module_css_default.wizardBack,
							"aria-label": t(install.confirmed !== void 0 ? "cancel" : pending ? "installCancelAndEdit" : "installEditAria"),
							disabled: !stoppable,
							onClick: onCancel,
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronLeftOutlineMedium, { "aria-hidden": "true" }), (0, react_jsx_runtime.jsx)("span", { children: t(install.confirmed !== void 0 ? "cancel" : pending ? "installCancelAndEdit" : "installEdit") })]
						}), (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: PluginManagerPage_module_css_default.wizardClose,
							"aria-label": t(cancellable ? "installCloseCancels" : "close"),
							onClick: onClose,
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineMedium, { size: 14 })
						})]
					}), (0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.wizardScroll,
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: PluginManagerPage_module_css_default.wizardHero,
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										className: PluginManagerPage_module_css_default.wizardIcon,
										"data-state": pending ? "ongoing" : phase === "done" ? "done" : "error",
										"aria-hidden": "true",
										children: pending ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
											state: "ongoing",
											size: 28
										}) : phase === "done" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckCircleFillRegular, { size: 28 }) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, { size: 28 })
									}),
									(0, react_jsx_runtime.jsx)("h2", {
										className: PluginManagerPage_module_css_default.wizardTitle,
										role: phase === "failed" ? "alert" : "status",
										children: heading
									}),
									phase === "done" && subject?.bundled ? (0, react_jsx_runtime.jsx)("p", {
										className: PluginManagerPage_module_css_default.wizardSub,
										children: t("installBundledDescription")
									}) : null,
									phase === "failed" ? (0, react_jsx_runtime.jsx)("p", {
										className: PluginManagerPage_module_css_default.wizardSub,
										children: failureText(install.failure, t, install)
									}) : null,
									attemptLine === null ? null : (0, react_jsx_runtime.jsx)("p", {
										className: PluginManagerPage_module_css_default.wizardSub,
										children: attemptLine
									}),
									uncertaintyText === null ? null : (0, react_jsx_runtime.jsx)("p", {
										className: PluginManagerPage_module_css_default.wizardSub,
										role: "alert",
										children: uncertaintyText
									}),
									phase === "unknown" ? (0, react_jsx_runtime.jsx)("p", {
										className: PluginManagerPage_module_css_default.wizardSub,
										children: t("installUnknownDescription")
									}) : null
								]
							}),
							subject === null ? null : (0, react_jsx_runtime.jsx)(SubjectCard, {
								subject: phase === "done" && install.installedVersion !== null ? {
									...subject,
									version: install.installedVersion
								} : subject,
								confirmed: install.confirmed,
								t
							}),
							approvable ? (0, react_jsx_runtime.jsxs)("section", {
								className: PluginManagerPage_module_css_default.approval,
								role: "group",
								"aria-labelledby": approvalId,
								"data-install-approval": true,
								children: [
									(0, react_jsx_runtime.jsx)("h3", {
										id: approvalId,
										className: PluginManagerPage_module_css_default.approvalTitle,
										children: t("installApprovalTitle")
									}),
									(0, react_jsx_runtime.jsx)("p", {
										className: PluginManagerPage_module_css_default.approvalText,
										children: t("installApprovalDescription")
									}),
									(0, react_jsx_runtime.jsx)("ul", {
										className: PluginManagerPage_module_css_default.approvalList,
										children: pendingBuilds.map((name) => (0, react_jsx_runtime.jsx)("li", { children: (0, react_jsx_runtime.jsx)("code", { children: name }) }, name))
									}),
									(0, react_jsx_runtime.jsx)("p", {
										className: PluginManagerPage_module_css_default.approvalText,
										children: t("installApprovalConsequence")
									}),
									(0, react_jsx_runtime.jsx)("p", {
										className: PluginManagerPage_module_css_default.approvalCaution,
										children: t("installApprovalCaution")
									}),
									(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "primary",
										className: PluginManagerPage_module_css_default.wide,
										onClick: onApproveBuilds,
										children: t("installApproveAndRetry")
									})
								]
							}) : null,
							phase === "done" && install.installed === null ? (0, react_jsx_runtime.jsx)("p", {
								className: PluginManagerPage_module_css_default.result,
								role: "status",
								children: t("installDoneNothing")
							}) : null,
							phase === "done" && install.restartRequired ? (0, react_jsx_runtime.jsx)("p", {
								className: PluginManagerPage_module_css_default.resultWarn,
								role: "status",
								children: restartText("installDoneRestart", install.restartReason, t)
							}) : null,
							phase === "done" && subject?.kind === "registry" && subject.name !== void 0 && subject.version !== void 0 && install.installedVersion !== null && install.installedVersion !== subject.version && (install.attempts?.registries.length ?? 1) === 1 ? (0, react_jsx_runtime.jsx)("p", {
								className: PluginManagerPage_module_css_default.resultWarn,
								role: "status",
								children: t("installDoneOtherVersion", {
									installed: install.installedVersion,
									version: subject.version,
									exact: `${subject.name}@${subject.version}`
								})
							}) : null,
							phase === "done" && install.approvedBuilds.length > 0 ? (0, react_jsx_runtime.jsx)("p", {
								className: PluginManagerPage_module_css_default.result,
								role: "status",
								children: t("installDoneApproved", { names: install.approvedBuilds.join(", ") })
							}) : null,
							(0, react_jsx_runtime.jsxs)("div", {
								className: PluginManagerPage_module_css_default.wizardFoot,
								children: [
									subject?.bundled ? null : (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: PluginManagerPage_module_css_default.detailsToggle,
										"aria-expanded": install.detailsOpen,
										onClick: onToggleDetails,
										children: [(0, react_jsx_runtime.jsx)("span", { children: t(install.detailsOpen ? "installDetailsHide" : "installDetailsShow") }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
											className: PluginManagerPage_module_css_default.detailsChevron,
											"aria-hidden": "true"
										})]
									}),
									uncertainty === "result" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "outline",
										size: "sm",
										className: PluginManagerPage_module_css_default.footAction,
										onClick: onReconcile,
										children: t("installReconcile")
									}) : null,
									pending ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "outline",
										size: "sm",
										className: PluginManagerPage_module_css_default.footAction,
										disabled: !cancellable,
										onClick: onCancel,
										children: t(phase === "cancelling" ? "installCancelling" : "installCancel")
									}) : null,
									phase === "failed" && !approvable ? (0, react_jsx_runtime.jsxs)("span", {
										className: PluginManagerPage_module_css_default.wizardActions,
										children: [changeable ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "outline",
											size: "sm",
											className: PluginManagerPage_module_css_default.footAction,
											onClick: onChangeRegistry,
											children: t("installChangeRegistry")
										}) : null, (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "primary",
											size: "sm",
											className: PluginManagerPage_module_css_default.footAction,
											onClick: onRun,
											children: t("installRetry")
										})]
									}) : null
								]
							}),
							install.detailsOpen ? (0, react_jsx_runtime.jsxs)("div", {
								className: PluginManagerPage_module_css_default.detailsBody,
								children: [(0, react_jsx_runtime.jsx)("p", {
									className: PluginManagerPage_module_css_default.installLocation,
									children: firstRun === void 0 ? t("terminalNoOutput") : t("installLocation", { dir: firstRun.cwd })
								}), install.runs.map((run, index) => {
									const registry = asked?.registries[index];
									return (0, react_jsx_runtime.jsxs)("div", {
										className: PluginManagerPage_module_css_default.run,
										children: [registry === void 0 ? null : (0, react_jsx_runtime.jsx)("p", {
											className: PluginManagerPage_module_css_default.attemptBadge,
											children: t("installAttemptBadge", {
												index: String(index + 1),
												registry: registryText(registry, t, resolved).name
											})
										}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TerminalBlock, {
											command: run.command,
											output: run.output,
											running: run.exitCode === void 0,
											exitCode: run.exitCode,
											maxLines: INSTALL_TERMINAL_LINES,
											labels: {
												...terminalLabels(t),
												...phase === "cancelling" ? { failed: t("installCancelledShort") } : {}
											},
											className: PluginManagerPage_module_css_default.terminal
										})]
									}, run.jobId);
								})]
							}) : null,
							phase !== "done" ? null : install.installed !== null && install.subject?.selection === void 0 ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "primary",
								className: PluginManagerPage_module_css_default.wide,
								disabled: install.enabling,
								"aria-busy": install.enabling,
								onClick: onEnableNow,
								children: t("installEnableNow")
							}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "primary",
								className: PluginManagerPage_module_css_default.wide,
								onClick: onClose,
								children: t("installClose")
							})
						]
					})]
				})
			});
		}
		/** The confirmation an uninstall waits on. */
		function ConfirmDialog({ name, t, onConfirm, onCancel }) {
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open: true,
				onClose: onCancel,
				title: t("confirmUninstallTitle", { name }),
				closeLabel: t("close"),
				description: t("confirmUninstallDescription"),
				footer: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "outline",
					onClick: onCancel,
					children: t("cancel")
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "primary",
					className: PluginManagerPage_module_css_default.dangerButton,
					onClick: onConfirm,
					children: t("confirmUninstall")
				})] })
			});
		}
		/** Render the plugin manager: the official plugins and installed bundles, their pages, the install dialog, and the confirmation. */
		function PluginManagerPage(props) {
			const { t, ensure, renderSlot, resolveText } = props;
			const configurations = props.useConfigurations((snapshot) => snapshot.view?.namespaces);
			const formFor = (id) => {
				if (!configurations?.some((view) => view.ns === id)) return void 0;
				const form = props.configForm(id);
				return {
					state: form.getSnapshot(),
					mutate: (ops, revision) => form.mutate(ops, revision)
				};
			};
			const state = props.usePluginManager((snapshot) => snapshot);
			const ledger = props.useConfigLedger((snapshot) => snapshot);
			const view = props.useStore((state) => state.view), { setView, setTab } = props.actions;
			const tabs = props.usePluginTabs((snapshot) => snapshot);
			const bundleDetails = props.useBundleDetails((snapshot) => snapshot);
			const language = props.useLocale((snapshot) => snapshot.active);
			const selectedTab = props.useStore((state) => state.tab);
			const tab = tabs.some((item) => item.id === selectedTab) ? selectedTab : INSTALLED_TAB;
			(0, react.useEffect)(() => {
				if (tab !== selectedTab) setTab(tab);
			}, [
				tab,
				selectedTab,
				setTab
			]);
			const tabsId = (0, react.useId)();
			const [activation, setActivation] = (0, react.useState)(null);
			const [headerRef] = (0, react.useState)(props.createHeaderRef);
			(0, react.useEffect)(() => {
				ensure();
			}, [ensure]);
			const { highlight, clearHighlight } = {
				highlight: state.highlight,
				clearHighlight: props.clearHighlight
			};
			(0, react.useEffect)(() => {
				if (highlight === null) return;
				const card = document.querySelector(`[data-plugin-package="${highlight}"]`);
				if (card !== null && typeof card.scrollIntoView === "function") card.scrollIntoView({
					block: "center",
					behavior: "smooth"
				});
				const timer = setTimeout(clearHighlight, HIGHLIGHT_MS);
				return () => {
					clearTimeout(timer);
				};
			}, [highlight, clearHighlight]);
			const noticeLine = state.notice === null || state.notice.kind === "refresh-failed" ? null : noticeText(state.notice, t);
			const listed = state.packages.filter((pkg) => !HIDDEN_BUNDLES.has(pkg.name) && (pkg.listedByDefault !== false || pkg.enabled || pkg.installed) && (pkg.installed || pkg.official || pkg.error !== void 0));
			const mine = listed.filter((pkg) => !pkg.official);
			const official = listed.filter((pkg) => pkg.official);
			const ordered = orderOptionalBundles(official);
			const pinned = new Set(official.filter(pinnedToMainList).map((pkg) => pkg.name));
			const extensions = ordered.filter((pkg) => pinned.has(pkg.name));
			const more = ordered;
			const loaded = state.status === "ready" || state.status === "error";
			const refreshing = state.refreshStatus === "refreshing";
			const openPkg = view.kind === "package" || view.kind === "row" ? listed.find((pkg) => pkg.name === view.name) : void 0;
			const openItem = view.kind === "item" ? ledger.items.find((item) => item.id === view.id) : void 0;
			const openRow = view.kind === "row" && openPkg !== void 0 ? openPkg.rows.find((row) => row.rowId === view.rowId) : void 0;
			const onInstalled = tab === INSTALLED_TAB;
			const showsCards = !onInstalled || openPkg === void 0 && openItem === void 0;
			const detailFromMore = (view.kind === "package" || view.kind === "row") && (view.from === "more" || openPkg !== void 0 && MORE_BUNDLES.includes(view.name) && !pinned.has(view.name));
			const showsMoreList = onInstalled && showsCards && (view.kind === "more" || detailFromMore);
			const showsMainList = showsCards && !showsMoreList;
			const installedCards = onInstalled && showsCards;
			const openPkgInMore = openPkg !== void 0 && openPkg.official && detailFromMore;
			const returnTab = view.kind === "package" || view.kind === "row" ? view.returnTab : void 0;
			const backToMore = openPkgInMore && returnTab === void 0;
			const pkgOrigin = returnTab !== void 0 ? { returnTab } : backToMore ? { from: "more" } : {};
			const installedPanel = tabs.length === 0 || showsMoreList ? {} : {
				role: "tabpanel",
				id: `${tabsId}-${INSTALLED_TAB}-panel`,
				"aria-labelledby": `${tabsId}-${INSTALLED_TAB}`
			};
			const activated = listed.find((pkg) => pkg.name === activation && pkg.enabled && !state.busy.includes(pkg.name));
			const setRowEnabled = (row, enabled) => {
				/* v8 ignore next -- a row without a live entry has its switch disabled */
				if (row.entryId !== void 0) props.setRowEnabled(row.entryId, enabled);
			};
			const configure = (pkg) => ({
				has: (row) => ledger.rows.has(rowConfigKey(pkg.name, row.rowId)),
				open: (row) => {
					setView({
						kind: "row",
						name: pkg.name,
						rowId: row.rowId,
						...pkgOrigin
					});
				}
			});
			const updates = updatesNote(mine, state.versions, t);
			const updatePkg = state.update === null ? void 0 : state.packages.find((pkg) => pkg.name === state.update?.packageName);
			const packageBusy = (pkg) => bundleBusy(state, pkg.name);
			const packageCard = (pkg) => (0, react_jsx_runtime.jsx)(PackageCard, {
				pkg,
				t,
				resolveText,
				busy: packageBusy(pkg),
				highlighted: state.highlight === pkg.name,
				newer: versionUpdate(state.versions[pkg.name]),
				onOpen: () => {
					setActivation(null);
					setView({
						kind: "package",
						name: pkg.name,
						...showsMoreList ? { from: "more" } : {}
					});
				},
				onSetEnabled: (enabled) => {
					setActivation(enabled ? pkg.name : null);
					props.setEnabled(pkg.name, enabled);
				}
			}, pkg.name);
			const basicCards = ledger.items.map((item) => (0, react_jsx_runtime.jsx)(ItemCard, {
				item,
				t,
				renderSlot,
				onOpen: () => {
					setView({
						kind: "item",
						id: item.id
					});
				}
			}, `item:${item.id}`));
			const renderGroup = (id, heading, cards) => {
				const offersMore = id === "extensions" && more.length > 0;
				if (cards.length === 0 && !offersMore) return null;
				return (0, react_jsx_runtime.jsxs)("section", {
					className: PluginManagerPage_module_css_default.group,
					"data-plugin-scope": "global",
					"data-plugin-group": id,
					children: [(0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.groupHead,
						children: [(0, react_jsx_runtime.jsx)("h3", {
							className: PluginManagerPage_module_css_default.groupTitle,
							children: heading
						}), offersMore ? (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							size: "sm",
							className: PluginManagerPage_module_css_default.groupMore,
							onClick: () => {
								setView({ kind: "more" });
							},
							children: [t("moreAction"), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {
								size: 14,
								"aria-hidden": "true"
							})]
						}) : null]
					}), cards.length > 0 ? (0, react_jsx_runtime.jsx)("ul", {
						className: PluginManagerPage_module_css_default.cards,
						children: cards
					}) : null]
				});
			};
			return (0, react_jsx_runtime.jsxs)("section", {
				className: PluginManagerPage_module_css_default.page,
				"data-plugin-panel": true,
				"aria-busy": state.status === "loading" || refreshing,
				children: [
					showsMoreList ? (0, react_jsx_runtime.jsxs)("header", {
						className: PluginManagerPage_module_css_default.moreHead,
						"data-window-drag": true,
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							size: "sm",
							className: PluginManagerPage_module_css_default.moreBack,
							"aria-label": t("backToList"),
							onClick: () => {
								setView({ kind: "list" });
							},
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronLeftOutlineMedium, {
								size: 20,
								"aria-hidden": "true"
							})
						}), (0, react_jsx_runtime.jsx)("h1", {
							className: PluginManagerPage_module_css_default.pageTitle,
							children: t("moreTitle")
						})]
					}) : null,
					(0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.pageBody,
						"data-plugin-body": true,
						children: [
							showsMainList ? (0, react_jsx_runtime.jsx)("div", {
								className: `${PluginManagerPage_module_css_default.pageBar}${tabs.length > 0 ? ` ${PluginManagerPage_module_css_default.pageBarWithTabs}` : ""}`,
								"data-plugin-bar": true,
								ref: headerRef,
								children: (0, react_jsx_runtime.jsxs)("header", {
									className: PluginManagerPage_module_css_default.pageHead,
									"data-window-drag": true,
									children: [
										(0, react_jsx_runtime.jsxs)("div", {
											className: PluginManagerPage_module_css_default.pageHeading,
											children: [(0, react_jsx_runtime.jsx)("h1", {
												className: PluginManagerPage_module_css_default.pageTitle,
												"data-plugin-header-part": "title",
												children: t("title")
											}), (0, react_jsx_runtime.jsxs)("div", {
												className: PluginManagerPage_module_css_default.pageIntro,
												"data-plugin-header-part": "intro",
												children: [(0, react_jsx_runtime.jsx)("span", { children: t("intro") }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
													label: t("infoDescription"),
													side: "bottom",
													delayMs: 300,
													maxWidth: 300,
													portal: true,
													openOnClick: true,
													children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
														variant: "ghost",
														size: "sm",
														className: PluginManagerPage_module_css_default.infoButton,
														"aria-label": t("infoLabel"),
														children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconInfoOutlineRegular, {
															size: 11,
															"aria-hidden": "true"
														})
													})
												})]
											})]
										}),
										(0, react_jsx_runtime.jsxs)("div", {
											className: PluginManagerPage_module_css_default.toolbar,
											"data-plugin-toolbar": true,
											"data-plugin-header-part": "toolbar",
											hidden: !onInstalled,
											children: [
												updates === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
													className: PluginManagerPage_module_css_default.updatesNote,
													"data-tone": updates.tone,
													children: updates.text
												}),
												(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
													label: t("refresh"),
													delayMs: 500,
													focusDelayMs: 500,
													side: "bottom",
													portal: true,
													disabled: !loaded || refreshing,
													children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
														variant: "outline",
														size: "sm",
														className: PluginManagerPage_module_css_default.addButton,
														"aria-label": t("refresh"),
														"aria-busy": refreshing,
														disabled: !loaded || refreshing,
														onClick: props.refresh,
														icon: refreshing ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
															state: "ongoing",
															size: 13
														}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutlineRegular, { size: 13 }),
														children: (0, react_jsx_runtime.jsx)("span", {
															className: PluginManagerPage_module_css_default.toolbarLabel,
															children: t("refresh")
														})
													})
												}),
												state.install.requestId === void 0 ? (0, react_jsx_runtime.jsx)(AddPluginMenu, {
													t,
													disabled: !loaded,
													openInstall: props.openInstall,
													renderSlot
												}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
													label: t("installViewTask"),
													side: "bottom",
													delayMs: 500,
													focusDelayMs: 500,
													portal: true,
													disabled: !loaded,
													children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
														variant: "primary",
														size: "sm",
														className: PluginManagerPage_module_css_default.addButton,
														icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutlineRegular, { size: 13 }),
														"aria-label": t("installViewTask"),
														disabled: !loaded,
														onClick: props.openInstall,
														children: (0, react_jsx_runtime.jsx)("span", {
															className: PluginManagerPage_module_css_default.toolbarLabel,
															children: t("installViewTask")
														})
													})
												})
											]
										}),
										tabs.length > 0 ? (0, react_jsx_runtime.jsx)("div", {
											className: PluginManagerPage_module_css_default.pageTabs,
											"data-plugin-header-part": "tabs",
											children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SegmentedTabs, {
												size: "sm",
												className: PluginManagerPage_module_css_default.pageTabList,
												label: t("tabsLabel"),
												value: tab,
												onChange: (next) => {
													setTab(next);
												},
												items: [{
													value: INSTALLED_TAB,
													label: t("installedTab"),
													id: `${tabsId}-${INSTALLED_TAB}`,
													panelId: `${tabsId}-${INSTALLED_TAB}-panel`
												}, ...tabs.map((item) => ({
													value: item.id,
													label: item.label,
													id: `${tabsId}-${item.id}`,
													panelId: `${tabsId}-${item.id}-panel`
												}))]
											})
										}) : null
									]
								})
							}) : null,
							!onInstalled ? (0, react_jsx_runtime.jsx)("div", {
								role: "tabpanel",
								id: `${tabsId}-${tab}-panel`,
								"aria-labelledby": `${tabsId}-${tab}`,
								className: PluginManagerPage_module_css_default.tabPanel,
								children: renderSlot("plugins.tab", {
									install: props.installFrom,
									openPackage: (name) => {
										setTab(INSTALLED_TAB);
										setView({
											kind: "package",
											name,
											returnTab: tab
										});
									}
								}, { only: tab })
							}) : null,
							installedCards && !loaded ? (0, react_jsx_runtime.jsxs)("div", {
								className: PluginManagerPage_module_css_default.installedPanel,
								...installedPanel,
								children: [state.status === "loading" ? (0, react_jsx_runtime.jsx)(ListSkeleton, { label: t("loading") }) : null, state.status === "unavailable" ? (0, react_jsx_runtime.jsxs)("p", {
									className: `${PluginManagerPage_module_css_default.status} ${PluginManagerPage_module_css_default.statusWithDot}`,
									role: "status",
									children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "idle" }), t("unavailable")]
								}) : null]
							}) : null,
							state.notice === null || noticeLine === null ? null : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
								text: noticeLine,
								icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, {}),
								holdMs: toastHoldMs(noticeLine),
								onDone: props.dismissNotice
							}, state.notice.seq),
							!showsCards && state.status === "error" && !refreshing ? (0, react_jsx_runtime.jsxs)("div", {
								className: PluginManagerPage_module_css_default.failure,
								children: [(0, react_jsx_runtime.jsxs)("p", {
									className: PluginManagerPage_module_css_default.statusWithDot,
									role: "alert",
									children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "error" }), t(state.refreshStatus === "failed" ? "refreshError" : "error")]
								}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									size: "sm",
									onClick: props.refresh,
									children: t("retry")
								})]
							}) : null,
							onInstalled && loaded && openPkg !== void 0 && openRow !== void 0 ? (0, react_jsx_runtime.jsx)(RowDetail, {
								pkg: openPkg,
								row: openRow,
								form: formFor(openRow.rowId),
								t,
								resolveText,
								renderSlot,
								onBack: () => {
									setView({
										kind: "package",
										name: openPkg.name,
										...pkgOrigin
									});
								}
							}) : null,
							onInstalled && loaded && openPkg !== void 0 && openRow === void 0 ? (0, react_jsx_runtime.jsx)(PackageDetail, {
								pkg: openPkg,
								t,
								resolveText,
								busy: packageBusy(openPkg),
								rowBusy: (row) => row.entryId !== void 0 && state.busy.includes(rowKey(row.entryId)),
								configured: ledger.bundles.has(openPkg.name),
								configure: configure(openPkg),
								renderSlot,
								inMore: backToMore,
								detail: (0, react_jsx_runtime.jsx)(BundleDetailSection, {
									name: openPkg.name,
									version: openPkg.version,
									fromNpm: openPkg.availability === "missing",
									language,
									details: bundleDetails,
									t,
									load: props.loadDetail,
									retry: props.retryDetail,
									image: props.detailImage
								}),
								onBack: () => {
									if (returnTab !== void 0) setTab(returnTab);
									setView({ kind: backToMore ? "more" : "list" });
								},
								onSetEnabled: (enabled) => {
									props.setEnabled(openPkg.name, enabled);
								},
								onUninstall: () => {
									props.uninstall(openPkg.name);
								},
								onUpdate: () => {
									props.update(openPkg.name);
								},
								onSetRowEnabled: setRowEnabled,
								versions: state.versions[openPkg.name],
								onEnsureVersions: props.ensureVersions,
								onCheckVersions: () => {
									props.checkVersions(openPkg.name);
								},
								onUpdateVersion: (version) => {
									props.openUpdate(openPkg.name, version);
								}
							}) : null,
							onInstalled && loaded && openItem !== void 0 ? (0, react_jsx_runtime.jsx)(ItemDetail, {
								form: formFor(openItem.id),
								item: openItem,
								t,
								renderSlot,
								onBack: () => {
									setView({ kind: "list" });
								}
							}) : null,
							loaded && installedCards ? basicCards.length === 0 && official.length === 0 && mine.length === 0 && state.status !== "error" ? (0, react_jsx_runtime.jsx)("div", {
								className: PluginManagerPage_module_css_default.installedPanel,
								...installedPanel,
								children: (0, react_jsx_runtime.jsx)("p", {
									className: PluginManagerPage_module_css_default.empty,
									children: t("empty")
								})
							}) : (0, react_jsx_runtime.jsxs)("div", {
								className: PluginManagerPage_module_css_default.installedPanel,
								...installedPanel,
								children: [showsMoreList ? (0, react_jsx_runtime.jsx)("section", {
									className: PluginManagerPage_module_css_default.group,
									"data-plugin-scope": "global",
									"data-plugin-group": "more",
									children: (0, react_jsx_runtime.jsx)("ul", {
										className: PluginManagerPage_module_css_default.cards,
										children: more.map(packageCard)
									})
								}) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
									renderGroup("basic", t("basicTitle"), basicCards),
									renderGroup("extensions", t("extensionsTitle"), extensions.map(packageCard)),
									renderGroup("bundles", t("bundlesTitle"), mine.map(packageCard))
								] }), state.status === "error" && !refreshing ? (0, react_jsx_runtime.jsxs)("div", {
									className: PluginManagerPage_module_css_default.failure,
									children: [(0, react_jsx_runtime.jsxs)("p", {
										className: PluginManagerPage_module_css_default.statusWithDot,
										role: "alert",
										children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "error" }), t(state.refreshStatus === "failed" ? "refreshError" : "error")]
									}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "outline",
										size: "sm",
										onClick: props.refresh,
										children: t("retry")
									})]
								}) : null]
							}) : null,
							installedCards && activated !== void 0 && !state.install.open ? renderSlot("plugins.bundle.activation", {
								packageName: activated.name,
								onDismiss: () => {
									setActivation(null);
								},
								onOpenDetails: () => {
									setActivation(null);
									setView({
										kind: "package",
										name: activated.name,
										...showsMoreList ? { from: "more" } : {}
									});
								}
							}, { entryKey: activated.name }) : null
						]
					}),
					state.update === null ? null : (0, react_jsx_runtime.jsx)(UpdateDialog, {
						update: state.update,
						title: updatePkg === void 0 ? state.update.packageName : packageText(updatePkg, resolveText).title,
						t,
						onRun: props.runUpdate,
						onClose: props.closeUpdate,
						onToggleOutput: props.toggleUpdateOutput
					}),
					(0, react_jsx_runtime.jsx)(InstallDialog, {
						install: state.install,
						t,
						onClose: props.closeInstall,
						onEditSpec: props.editInstallSpec,
						onRun: props.runInstall,
						onCancel: props.cancelInstall,
						onReconcile: props.reconcileInstall,
						onToggleDetails: props.toggleInstallDetails,
						onEnableNow: () => {
							setActivation(state.install.installed);
							props.enableInstalled();
						},
						onApproveBuilds: props.approveBuildsAndRetry,
						onToggleRegistry: props.toggleRegistryOptions,
						onChooseRegistry: props.chooseRegistry,
						onChangeRegistry: props.changeRegistry,
						onUseGithubMirror: props.useGithubMirror
					}),
					state.confirm === null ? null : (0, react_jsx_runtime.jsx)(ConfirmDialog, {
						name: packageText(state.packages.find((pkg) => pkg.name === state.confirm?.packageName) ?? { name: state.confirm.packageName }, resolveText).title,
						t,
						onConfirm: props.confirm,
						onCancel: props.cancelConfirm
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/header-scroll.js
		/** Scroll-linked header geometry keeps both responsive layouts without changing the list's flow height. */
		const PARTS = [
			"title",
			"intro",
			"toolbar",
			"tabs"
		];
		/**
		* Measure the existing resting and compact CSS layouts in an inert, out-of-flow copy.
		* Their independent flex wrapping requires pixel measurements; interpolating only positioned
		* contents leaves the real header's resting footprint and the scroll range unchanged.
		* @returns A ref callback that disposes its element observers and scroll listener on detachment.
		*/
		function createPluginHeaderRef() {
			let dispose;
			return (element) => {
				dispose?.();
				dispose = element === null ? void 0 : attach(element);
			};
		}
		function attach(bar) {
			const body = bar.parentElement;
			const parts = [];
			let distance = 1;
			let restHeight = 0;
			let compactHeight = 0;
			let disposed = false;
			const scroll = () => {
				const offset = Math.max(0, body.scrollTop);
				bar.toggleAttribute("data-compact", offset >= distance);
				bar.toggleAttribute("data-scrolled", offset > 0);
				for (const part of parts) {
					const progress = Math.min(1, offset / part.distance);
					part.element.style.translate = `${(part.to.x - part.from.x) * progress}px ${(part.to.y - part.from.y) * progress}px`;
					part.element.style.width = `${part.from.width + (part.to.width - part.from.width) * progress}px`;
					if (part.clipStart !== void 0 && part.clipEnd !== void 0) {
						const clip = Math.max(0, Math.min(1, (offset - part.clipStart) / (part.clipEnd - part.clipStart)));
						part.element.style.clipPath = `inset(${clip * 100}% 0 0)`;
					} else part.element.style.removeProperty("clip-path");
					if (part.element.dataset.pluginHeaderPart === "intro") part.element.inert = offset >= (part.clipEnd ?? part.distance);
				}
				bar.style.setProperty("--plugin-header-paint-height", `${Math.max(compactHeight, restHeight - offset)}px`);
			};
			const measure = () => {
				if (disposed) return;
				body.style.setProperty("--plugin-page-scrollbar-width", `${body.offsetWidth - body.clientWidth}px`);
				const clone = bar.cloneNode(true);
				clone.removeAttribute("data-natural");
				clone.removeAttribute("data-compact");
				clone.removeAttribute("data-scrolled");
				clone.setAttribute("data-measuring", "");
				clone.setAttribute("aria-hidden", "true");
				clone.inert = true;
				clone.style.width = `${bar.getBoundingClientRect().width}px`;
				for (const element of clone.querySelectorAll("[id], [data-plugin-header-part]")) {
					element.removeAttribute("id");
					if (element.hasAttribute("data-plugin-header-part")) element.removeAttribute("style");
				}
				body.append(clone);
				const snapshot = () => {
					const head = clone.querySelector("header").getBoundingClientRect();
					const boxes = /* @__PURE__ */ new Map();
					for (const name of PARTS) {
						const element = clone.querySelector(`[data-plugin-header-part="${name}"]`);
						if (element === null) continue;
						const box = element.getBoundingClientRect();
						boxes.set(name, {
							x: box.x - head.x,
							y: box.y - head.y,
							width: box.width,
							height: box.height
						});
					}
					return {
						height: clone.getBoundingClientRect().height,
						boxes
					};
				};
				let resting;
				let compact;
				try {
					resting = snapshot();
					clone.setAttribute("data-compact", "");
					compact = snapshot();
				} finally {
					clone.remove();
				}
				restHeight = resting.height;
				compactHeight = compact.height;
				distance = Math.max(1, restHeight - compactHeight);
				parts.length = 0;
				const hasTabs = resting.boxes.has("tabs");
				const compactTitle = compact.boxes.get("title");
				for (const name of PARTS) {
					const from = resting.boxes.get(name);
					if (from === void 0) continue;
					const element = bar.querySelector(`[data-plugin-header-part="${name}"]`);
					let to = compact.boxes.get(name);
					let clipStart;
					let clipEnd;
					if (name === "intro" || name === "title" && hasTabs) {
						to = {
							...from,
							y: -from.height
						};
						if (name === "intro" && !hasTabs) {
							clipStart = Math.max(0, from.y - compactTitle.y - compactTitle.height);
							clipEnd = clipStart + from.height;
							to.y = from.y - clipEnd;
						}
					}
					const travel = Math.max(1, Math.abs(to.y - from.y));
					distance = Math.max(distance, travel);
					element.style.setProperty("--plugin-part-x", `${from.x}px`);
					element.style.setProperty("--plugin-part-y", `${from.y}px`);
					element.style.setProperty("--plugin-part-width", `${from.width}px`);
					parts.push({
						element,
						from,
						to,
						distance: travel,
						...clipStart !== void 0 && clipEnd !== void 0 ? {
							clipStart,
							clipEnd
						} : {}
					});
				}
				bar.style.setProperty("--plugin-header-rest-height", `${restHeight}px`);
				bar.style.setProperty("--plugin-header-compact-height", `${compactHeight}px`);
				bar.style.setProperty("--plugin-header-travel", `${distance}px`);
				body.style.setProperty("--plugin-header-scroll-padding", `${compactHeight + 8}px`);
				bar.setAttribute("data-natural", "");
				scroll();
			};
			measure();
			const resize = new ResizeObserver(measure);
			resize.observe(body);
			const mutation = new MutationObserver(measure);
			mutation.observe(bar.querySelector("header"), {
				childList: true,
				characterData: true,
				subtree: true,
				attributes: true,
				attributeFilter: ["hidden"]
			});
			body.addEventListener("scroll", scroll, { passive: true });
			document.fonts.addEventListener("loadingdone", measure);
			return () => {
				disposed = true;
				resize.disconnect();
				mutation.disconnect();
				body.removeEventListener("scroll", scroll);
				document.fonts.removeEventListener("loadingdone", measure);
				body.style.removeProperty("--plugin-header-scroll-padding");
				body.style.removeProperty("--plugin-page-scrollbar-width");
			};
		}
		//#endregion
		//#region lib/types/client/PluginRefreshToast.js
		/**
		* Display refresh failures even after navigation leaves the Plugins panel.
		* @param props - shared notice hook, dismissal action, and locale seat.
		* @returns the refresh failure toast, or null for other notices.
		*/
		function PluginRefreshToast({ usePluginManager, dismissNotice, t }) {
			const notice = usePluginManager((state) => state.notice);
			if (notice?.kind !== "refresh-failed") return null;
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
				text: noticeText(notice, t),
				icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, {}),
				onDone: dismissNotice
			}, notice.seq);
		}
		//#endregion
		//#region lib/types/client/PluginsPanelIcon.js
		/**
		* Render the plugin glyph at the size the sidebar asks for.
		* @param props - the sidebar's icon share: the requested edge and whether the panel is selected.
		* @returns the icon element.
		*/
		function PluginsPanelIcon({ size }) {
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPluginPinwheelOutlineRegular, { size });
		}
		//#endregion
		//#region lib/types/client/tab-ledger.js
		/** The tabs other plugins contribute to the Plugins page through `plugins.tab`, in the active locale. */
		/**
		* Project the `plugins.tab` ledger as one observable the page binds.
		* @param ctx - the page plugin's context, whose slot registry and locale the projection follows.
		* @returns the tab source; its snapshot changes only when the ledger or the locale does.
		*/
		function tabLedgerSource(ctx) {
			let version = -1;
			let revision = -1;
			let tabs = [];
			return {
				getSnapshot: () => {
					const next = ctx.slots.getVersion("plugins.tab");
					const current = ctx.locale.getSnapshot().revision;
					if (next !== version || current !== revision) {
						version = next;
						revision = current;
						tabs = ctx.slots.entries("plugins.tab").map((entry) => ({
							/* v8 ignore next -- list-slot registration requires id */
							id: entry.options.id ?? "",
							label: (0, _deepseek_ai_dsh_client_ui_slots.resolveSlotLabel)(entry.options.label) ?? ""
						}));
					}
					return tabs;
				},
				subscribe: (listener) => {
					const offs = [ctx.slots.subscribe("plugins.tab", listener), ctx.locale.subscribe(listener)];
					return () => {
						for (const off of offs) off();
					};
				}
			};
		}
		//#endregion
		//#region lib/types/client/navigation-store.js
		/** Plugin page selection shared by the page and cross-plugin navigation. */
		/**
		* Create plugin page selection before the first page render.
		* @returns the registration-owned navigation store handle.
		*/
		function createNavigationStore() {
			return (0, _deepseek_ai_dsh_client_store.defineStore)({
				init: () => ({
					view: { kind: "list" },
					tab: "installed"
				}),
				actions: {
					setView: (draft, view) => {
						draft.view = view;
					},
					setTab: (draft, tab) => {
						draft.tab = tab;
					}
				}
			});
		}
		//#endregion
		//#region lib/types/client/index.js
		/** Dictionary namespace owned by this plugin. */
		const NS = "pluginManager";
		/** The id shared by the sidebar entry and the main panel it opens. */
		const PANEL_ID = "plugins";
		/** Services required by the sidebar registration, the Remote methods, and access; the inventory says whether the Host manages a profile. */
		const inject = [
			"slots",
			"locale",
			"remote",
			"remote.pluginManager",
			"remote.pluginInventory",
			"remote.pluginRegistryProbe",
			"configForms",
			"layout",
			"remoteAccess"
		];
		/**
		* Contribute the Plugins entry to the sidebar with the management page it
		* opens, and keep it current on the Host's change events, while the current
		* Peer may list the installed bundles.
		* @param ctx - the browser plugin context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}), "ui-plugin-manager: dictionaries");
			const t = ctx.locale.bind(NS);
			const controller = new PluginManagerController(ctx);
			ctx.effect(() => () => {
				controller.dispose();
			}, "ui-plugin-manager: controller");
			ctx.provide("pluginChanges", { bundle: (packageName) => controller.observeChanges(packageName) });
			const configLedger = configLedgerSource(ctx);
			const face = controller.inject(configLedger, tabLedgerSource(ctx), (text) => ctx.locale.resolveText(text));
			ctx.remoteAccess.whenAccess("pluginManager/listBundles", function* () {
				const refresh = () => {
					controller.details.reset();
					if (controller.getSnapshot().status !== "idle") controller.load();
				};
				refresh();
				yield ctx.remote.$on("plugin-manager/changed", refresh);
				yield ctx.remote.$on("plugin-manager/install-log", (chunk) => {
					controller.appendLog(chunk);
				});
				yield ctx.remote.$on("plugin-manager/install-state", (progress) => {
					controller.installProgress(progress);
				});
				yield ctx.remote.$on("plugin-manager/update-state", (progress) => {
					controller.updateProgress(progress);
				});
				yield ctx.on("connection/reset", refresh);
				yield ctx.slots.inject("shell.overlay", () => ctx.slots.register({
					name: "shell.overlay",
					id: "plugin-manager.refresh-toast",
					locale: NS,
					inject: () => ({
						hooks: { pluginManager: face.hooks.pluginManager },
						dismissNotice: face.dismissNotice
					})
				}, PluginRefreshToast));
				yield ctx.slots.inject("main", function* () {
					const handle = createNavigationStore(), instance = handle.create();
					const store = {
						...handle,
						create: () => instance
					};
					yield ctx.slots.register({
						name: "main",
						key: PANEL_ID,
						locale: NS,
						store,
						inject: () => ({
							...face,
							createHeaderRef: createPluginHeaderRef
						}),
						children: {
							"plugins.add.actions": {
								kind: "list",
								scope: "root"
							},
							"plugins.tab": {
								kind: "list",
								scope: "root"
							},
							"plugins.item": {
								kind: "list",
								scope: "root"
							},
							"plugins.bundle.activation": {
								kind: "keyed",
								scope: "root"
							},
							"plugins.bundle.config": {
								kind: "keyed",
								scope: "root"
							},
							"plugins.row.config": {
								kind: "keyed",
								scope: "root"
							},
							"plugins.detail.actions": {
								kind: "list",
								scope: "root"
							},
							"plugins.detail.badge": {
								kind: "list",
								scope: "root"
							},
							"plugins.detail.section": {
								kind: "list",
								scope: "root"
							}
						}
					}, PluginManagerPage);
					yield ctx.layout.panelInfo.subscribe(() => {
						if (ctx.layout.panelInfo.getSnapshot().activePanelId !== "plugins") instance.actions.setView({ kind: "list" });
					});
					const disposeNavigation = ctx.reflect.provide("pluginNavigation", {
						openList: () => {
							ctx.layout.selectPanel(PANEL_ID);
							instance.actions.setTab("installed");
							instance.actions.setView({ kind: "list" });
						},
						openBundle: (packageName) => {
							ctx.layout.selectPanel(PANEL_ID);
							instance.actions.setTab("installed");
							instance.actions.setView({
								kind: "package",
								name: packageName
							});
						}
					});
					yield () => {
						disposeNavigation();
					};
				});
				yield ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
					name: "sidebar.panellist",
					id: PANEL_ID,
					order: 0,
					label: () => t("panel"),
					locale: NS
				}, PluginsPanelIcon));
			});
		}
		//#endregion
		exports.NS = NS;
		exports.PANEL_ID = PANEL_ID;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
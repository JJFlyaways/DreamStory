# Harness source lock for P3.6

`source-manifest.json` locks the upstream Git commit and the Web composition's client-plugin and static-module roster. Verify a checkout with:

```sh
node apps/web/harness/verify-source.mjs /path/to/deepseek-harness
```

The path is a verification input only. DreamStory must not require that checkout at build or runtime. The official brand plugin is listed to account for the upstream graph, but must be replaced with an equal-size neutral occupant before a DreamStory artifact is shipped.

The npm `0.2.1-rc.3` packages were published before the pinned commit. In particular, that commit changes `ui-chat` spacing and `ui-dockkit` tab motion. Published packages alone are therefore **not** an exact implementation of this lock; the P3.6 build must use pinned source for those components and prove Gate A parity. The product continues to use DreamStory's own API, state, and brand. Preserve the upstream MIT notice and Montserrat OFL notice whenever their code or font is redistributed.

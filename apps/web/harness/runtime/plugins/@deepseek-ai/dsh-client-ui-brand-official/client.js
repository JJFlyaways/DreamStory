// P3.6 Gate A: replace only the upstream brand occupants, retaining slot sizes.
window.__ModuleLoader__.load({
  id: '@deepseek-ai/dsh-client-ui-brand-official',
  factory(require) {
    const { jsx } = require('react/jsx-runtime');
    const NeutralMark = ({ size = 24, className }) =>
      jsx('span', {
        className,
        'aria-hidden': true,
        'data-brand-placeholder': 'true',
        style: {
          display: 'inline-block',
          width: size,
          height: size,
          flex: 'none',
          borderRadius: '50%',
          border: '1px solid currentColor',
          opacity: 0.35,
        },
      });
    const NeutralName = () =>
      jsx('span', {
        'data-brand-placeholder': 'true',
        style: { display: 'inline-block', width: 96, height: 18, opacity: 0.35 },
      });
    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('sidebar.brand.mark', () =>
          ctx.slots.inject('sidebar.brand.name', function* () {
            yield ctx.slots.register({ name: 'sidebar.brand.mark' }, NeutralMark);
            yield ctx.slots.register({ name: 'sidebar.brand.name' }, NeutralName);
          }),
        );
        ctx.slots.inject('conversation.hero.brand.mark', function* () {
          yield ctx.slots.register({ name: 'conversation.hero.brand.mark' }, NeutralMark);
        });
      },
    };
  },
});

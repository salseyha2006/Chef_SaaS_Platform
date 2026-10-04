export default function OnboardingSlide({ icon: Icon, tone, title, description, active }) {
  return (
    <div aria-hidden={!active} className="flex w-full shrink-0 flex-col items-center px-8 text-center">
      <div className={`flex h-40 w-40 items-center justify-center rounded-full ${tone}`}>
        <Icon width={72} height={72} strokeWidth={1.5} />
      </div>
      <h2 className="mt-10 text-2xl font-bold leading-normal text-slate-900">{title}</h2>
      <p className="mt-3 max-w-xs text-base text-slate-500">{description}</p>
    </div>
  );
}

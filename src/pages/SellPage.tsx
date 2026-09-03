export default function SellPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-4xl font-headline font-bold text-on-surface mb-4">Sell on MarketGrid</h1>
      <p className="text-lg text-on-surface-variant max-w-2xl mb-8">
        Join our network of premium vendors and reach a global audience.
      </p>
      <button className="px-8 py-3 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-sm">
        Apply Now
      </button>
    </div>
  );
}

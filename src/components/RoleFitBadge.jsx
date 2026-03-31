export default function RoleFitBadge({ fitTier }) {
  const tiers = ['Uphill Battle', 'Positioning Play', 'Strong Fit'];

  return (
    <div className="flex gap-1">
      {tiers.map((tier) => {
        const isActive = fitTier === tier;
        return (
          <div
            key={tier}
            className={`flex-1 px-4 py-3 text-center rounded-[5px] ${
              isActive
                ? 'bg-[#8B2635] text-white'
                : 'bg-[#F0EBE5] text-[#9A9A9A]'
            }`}
            style={{ borderRadius: '5px' }}
          >
            <span className="text-sm font-medium">
              {tier}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function RoleFitBadge({ fitTier }) {
  const tiers = ['Uphill Battle', 'Positioning Play', 'Strong Fit'];

  return (
    <div className="flex" style={{ borderRadius: '5px', overflow: 'hidden' }}>
      {tiers.map((tier, index) => {
        const isActive = fitTier === tier;
        let borderRadius = '0px';
        if (index === 0) borderRadius = '5px 0 0 5px';
        if (index === tiers.length - 1) borderRadius = '0 5px 5px 0';

        return (
          <div
            key={tier}
            className={`flex-1 px-4 py-3 text-center ${isActive ? 'text-white' : 'text-[#B5B0A8]'}`}
            style={{
              backgroundColor: isActive ? '#8B2635' : '#EDE8E2',
              borderRadius,
              cursor: 'default',
            }}
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

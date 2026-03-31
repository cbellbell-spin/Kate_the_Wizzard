export default function RoleFitBadge({ fitTier }) {
  const tiers = ['Uphill Battle', 'Positioning Play', 'Strong Fit'];

  return (
    <div className="flex items-center justify-center gap-4">
      {tiers.map((tier) => {
        const isActive = fitTier === tier;
        if (isActive) {
          return (
            <span
              key={tier}
              className="text-[16px] font-medium text-[#FAF8F5] px-6 py-1.5"
              style={{
                backgroundColor: '#8B2635',
                borderRadius: '999px',
                fontWeight: 500,
              }}
            >
              {tier}
            </span>
          );
        }
        return (
          <span
            key={tier}
            className="text-[13px] text-[#B5B0A8]"
            style={{ cursor: 'default' }}
          >
            {tier}
          </span>
        );
      })}
    </div>
  );
}

const SocialProof = () => {
  // Honest, verifiable value statements — not fabricated counts/dollars. If real
  // verified metrics become available, swap these for numbers with a source.
  const stats = [
    { value: 'OCAP®', label: 'Built around data sovereignty' },
    { value: 'Canada', label: 'Your data stored in-country' },
    { value: 'All-in-one', label: 'Funding, planning & training' },
  ];

  return (
    <>
      {/* Divider */}
      <div className="border-t border-neutral-200"></div>
      
      {/* Stats band */}
      <section id="stats" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 sm:py-12">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`relative ${
                  index === 1 ? 'border-t border-neutral-200 pt-8 md:pt-0 md:border-t-0 md:border-l md:border-neutral-200 md:pl-8' : ''
                } ${
                  index === 2 ? 'border-t border-neutral-200 pt-8 md:pt-0 md:border-t-0 md:border-l md:border-neutral-200 md:pl-8' : ''
                }`}
              >
                <div className="text-4xl sm:text-5xl font-medium text-primary tracking-tighter">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Divider */}
      <div className="border-t border-neutral-200"></div>
    </>
  );
};

export default SocialProof;

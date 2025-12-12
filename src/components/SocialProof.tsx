const SocialProof = () => {
  const stats = [
    { value: '500+', label: 'Indigenous Businesses Supported' },
    { value: '2,500+', label: 'Entrepreneurs Connected' },
    { value: '$12M+', label: 'Funding Matched' },
    { value: '150+', label: 'Community Partners' },
  ];

  return (
    <>
      {/* Divider */}
      <div className="border-t border-neutral-200"></div>
      
      {/* Stats band */}
      <section id="stats" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 sm:py-12">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`relative ${
                  index === 1 ? 'border-l border-neutral-200 pl-8 md:pl-0 md:border-l-0' : ''
                } ${
                  index === 2 ? 'border-t border-neutral-200 pt-8 md:pt-0 md:border-t-0 md:border-l md:border-neutral-200 md:pl-8 lg:pl-0 lg:border-l-0' : ''
                } ${
                  index === 3 ? 'border-l border-neutral-200 pl-8 border-t pt-8 md:pt-0 md:border-t-0 md:pl-0 md:border-l-0 lg:border-l lg:border-neutral-200 lg:pl-8' : ''
                }`}
              >
                <div className="text-4xl sm:text-5xl font-geist font-medium text-primary tracking-tighter">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-muted-foreground font-geist">
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

import { Building, Users, Award, TrendingUp, Star } from 'lucide-react';

const SocialProof = () => {
  const organizations = [
    { name: 'NACCA', fullName: 'National Aboriginal Capital Corporations Association' },
    { name: 'CCIB', fullName: 'Canadian Council for Indigenous Business' },
    { name: 'AFN', fullName: 'Assembly of First Nations' },
    { name: 'INAC', fullName: 'Indigenous Services Canada' },
    { name: 'NIEDB', fullName: 'National Indigenous Economic Development Board' },
    { name: 'CANDO', fullName: 'Council for the Advancement of Native Development Officers' },
  ];

  const stats = [
    {
      icon: Users,
      value: '2,500+',
      label: 'Active Users',
      color: 'text-amber-400'
    },
    {
      icon: Building,
      value: '850+',
      label: 'Businesses Launched',
      color: 'text-emerald-400'
    },
    {
      icon: Award,
      value: '95%',
      label: 'Success Rate',
      color: 'text-amber-400'
    },
    {
      icon: TrendingUp,
      value: '$12M+',
      label: 'Funding Connected',
      color: 'text-emerald-400'
    }
  ];

  return (
    <section className="z-10 px-4 sm:px-6 max-w-7xl mx-auto mb-20 animate-fade-slide-in">
      {/* Section header */}
      <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
        <Star className="h-4 w-4" />
        <span>Customer Success</span>
      </div>
      
      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tighter text-white mb-1">
        Results.
      </h2>
      <p className="text-sm sm:text-base text-zinc-400">
        Real impact from real workflows
      </p>

      {/* Stats grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Main metrics card */}
        <article className="stats-card border-gradient">
          <div className="space-y-5">
            <div className="flex items-end gap-2">
              <span className="text-5xl sm:text-6xl text-white tracking-tighter">
                99.8
              </span>
              <span className="text-zinc-400 text-base">%</span>
            </div>
            <p className="text-sm text-zinc-300">
              We've supported{' '}
              <span className="font-medium text-white">500+ businesses</span>
              {' '}with industry-leading success rates.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-white">Indigenous Rising AI®</span>
            </div>
            <div className="flex items-center gap-2">
              {stats.slice(0, 3).map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={idx}
                    className="h-7 w-7 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-full flex items-center justify-center border border-zinc-700"
                    style={{ marginLeft: idx > 0 ? '-8px' : '0' }}
                  >
                    <Icon className="h-3 w-3 text-zinc-300" />
                  </div>
                );
              })}
              <span className="inline-flex items-center justify-center -ml-1 h-7 px-2 rounded-full bg-white text-zinc-900 text-xs font-normal">
                500+
              </span>
            </div>
            <div className="flex items-center gap-1 text-emerald-500">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs text-zinc-400">
                Active across 50+ communities
              </span>
            </div>
          </div>
          <button 
            className="mt-6 h-11 w-full rounded-full bg-white text-zinc-900 text-sm font-normal hover:bg-zinc-100 transition"
            onClick={() => {
              const element = document.querySelector('#pricing');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Start your journey
          </button>
        </article>

        {/* Individual stat cards */}
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <article 
              key={index}
              className="glass-card rounded-2xl p-5 sm:p-6 border-gradient hover:border-zinc-700 transition animate-fade-slide-in"
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 ${stat.color}`} />
                <span className="badge-emerald">
                  NEW
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-medium text-white tracking-tighter mb-2">
                {stat.value}
              </div>
              <p className="text-sm text-zinc-400">
                {stat.label}
              </p>
            </article>
          );
        })}
      </div>

      {/* Trust Indicators */}
      <div className="mt-8 glass-card rounded-2xl p-6 border-gradient">
        <h3 className="font-medium text-center text-white mb-4">
          Trusted By Leading Indigenous Organizations
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {organizations.map((org) => (
            <div 
              key={org.name}
              className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-default group"
              title={org.fullName}
            >
              <span className="font-medium text-lg text-white group-hover:text-amber-400 transition-colors">
                {org.name}
              </span>
              <span className="text-xs text-zinc-500 text-center mt-1 line-clamp-2">
                {org.fullName}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;

import logoNacca from '@/assets/logo-nacca.png';
import logoCcib from '@/assets/logo-ccib.png';
import logoAfn from '@/assets/logo-afn.png';
import logoIsc from '@/assets/logo-isc.png';
import logoMnc from '@/assets/logo-mnc.png';
import logoItk from '@/assets/logo-itk.png';

const partners = [
  { name: 'NACCA', fullName: 'National Aboriginal Capital Corporations Association', logo: logoNacca },
  { name: 'CCIB', fullName: 'Canadian Council for Indigenous Business', logo: logoCcib },
  { name: 'AFN', fullName: 'Assembly of First Nations', logo: logoAfn },
  { name: 'ISC', fullName: 'Indigenous Services Canada', logo: logoIsc },
  { name: 'MNC', fullName: 'Métis National Council', logo: logoMnc },
  { name: 'ITK', fullName: 'Inuit Tapiriit Kanatami', logo: logoItk },
];

const PartnerLogos = () => {
  return (
    <section className="py-16 bg-card/30 border-y border-border/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Trusted by Leading Indigenous Organizations
          </p>
        </div>
        
        {/* Logo grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
          {partners.map((partner, index) => (
            <div 
              key={partner.name}
              className="group flex flex-col items-center gap-3 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl bg-background p-3 border border-border/50 shadow-sm group-hover:shadow-natural group-hover:border-primary/30 transition-all duration-300">
                <img 
                  src={partner.logo} 
                  alt={`${partner.fullName} logo`}
                  className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  loading="lazy"
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-foreground/80 group-hover:text-primary transition-colors">
                  {partner.name}
                </p>
                <p className="text-[10px] text-muted-foreground max-w-[120px] leading-tight hidden md:block">
                  {partner.fullName}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Trust statement */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Working together with First Nations, Métis, and Inuit organizations to advance 
            Indigenous economic sovereignty and data self-determination.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PartnerLogos;

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';

// Import gallery images
import galleryArtisan from '@/assets/gallery-artisan.jpg';
import galleryForestry from '@/assets/gallery-forestry.jpg';
import galleryCulinary from '@/assets/gallery-culinary.jpg';
import galleryTourism from '@/assets/gallery-tourism.jpg';
import galleryTech from '@/assets/gallery-tech.jpg';
import galleryWellness from '@/assets/gallery-wellness.jpg';

const galleryItems = [
  {
    image: galleryArtisan,
    title: "Traditional Artisan Crafts",
    description: "Creating beautiful beadwork and traditional art for global markets",
    business: "Indigenous Arts Collective",
    location: "Manitoba"
  },
  {
    image: galleryForestry,
    title: "Sustainable Forestry",
    description: "Managing traditional territories with sustainable forestry practices",
    business: "Northern Nations Forestry",
    location: "British Columbia"
  },
  {
    image: galleryCulinary,
    title: "Indigenous Culinary Arts",
    description: "Bringing traditional ingredients and recipes to modern cuisine",
    business: "Turtle Island Kitchen",
    location: "Ontario"
  },
  {
    image: galleryTourism,
    title: "Eco-Tourism Adventures",
    description: "Sharing traditional knowledge through guided eco-tourism experiences",
    business: "Spirit Trail Tours",
    location: "Alberta"
  },
  {
    image: galleryTech,
    title: "Tech Innovation",
    description: "Building technology solutions that serve Indigenous communities",
    business: "First Code Technologies",
    location: "Saskatchewan"
  },
  {
    image: galleryWellness,
    title: "Traditional Wellness",
    description: "Integrating traditional healing practices with modern wellness services",
    business: "Sacred Circle Wellness",
    location: "Quebec"
  }
];

const SuccessGallery = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);
  
  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? galleryItems.length - 1 : selectedIndex - 1);
    }
  };
  
  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === galleryItems.length - 1 ? 0 : selectedIndex + 1);
    }
  };

  return (
    <section className="py-20 bg-muted/30" id="success-gallery">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center space-x-2 bg-card/80 backdrop-blur-sm border border-border rounded-full px-4 py-2 shadow-natural">
            <Camera className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Mazinaakoziwin • Success in Action
            </span>
          </div>
          
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Indigenous Entrepreneurs
            <span className="block gradient-earth bg-clip-text text-transparent">
              Thriving Across Canada
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Real businesses, real people, real impact. See how Indigenous entrepreneurs are 
            building successful ventures while honoring cultural traditions.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item, index) => (
            <div 
              key={item.title}
              className="group relative overflow-hidden rounded-2xl bg-card shadow-natural hover:shadow-elevated transition-all duration-500 cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => openLightbox(index)}
            >
              {/* Image */}
              <div className="aspect-square overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-display text-xl font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-white/80 text-sm mb-3">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>{item.business}</span>
                    <span>{item.location}</span>
                  </div>
                </div>
              </div>
              
              {/* Default Label */}
              <div className="absolute bottom-4 left-4 right-4 group-hover:opacity-0 transition-opacity duration-300">
                <div className="bg-card/90 backdrop-blur-sm rounded-xl p-3 border border-border/50">
                  <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        <Dialog open={selectedIndex !== null} onOpenChange={() => closeLightbox()}>
          <DialogContent className="max-w-5xl p-0 bg-black/95 border-none">
            {selectedIndex !== null && (
              <div className="relative">
                {/* Close button */}
                <button 
                  onClick={closeLightbox}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
                
                {/* Navigation */}
                <button 
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button 
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
                
                {/* Image */}
                <img 
                  src={galleryItems[selectedIndex].image} 
                  alt={galleryItems[selectedIndex].title}
                  className="w-full max-h-[70vh] object-contain"
                />
                
                {/* Caption */}
                <div className="p-6 bg-black/80">
                  <h3 className="font-display text-2xl font-bold text-white mb-2">
                    {galleryItems[selectedIndex].title}
                  </h3>
                  <p className="text-white/80 mb-3">
                    {galleryItems[selectedIndex].description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span className="font-medium">{galleryItems[selectedIndex].business}</span>
                    <span>•</span>
                    <span>{galleryItems[selectedIndex].location}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default SuccessGallery;

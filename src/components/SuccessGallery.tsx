import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';

// Import gallery images
import galleryArtisan from '@/assets/gallery-artisan.jpg';
import galleryForestry from '@/assets/gallery-forestry.jpg';
import galleryCulinary from '@/assets/gallery-culinary.jpg';
import galleryTourism from '@/assets/gallery-tourism.jpg';
import galleryTech from '@/assets/gallery-tech.jpg';
import galleryWellness from '@/assets/gallery-wellness.jpg';

// Illustrative of the SECTORS Indigenous entrepreneurs build in — not named
// customer stories. We do not attach invented business names or claim these are
// specific real customers; real, named, consented case studies will replace
// these as the community grows. Titles describe the sector; locations describe
// where Indigenous business thrives across Canada.
const galleryItems = [
  {
    image: galleryArtisan,
    title: "Traditional Artisan Crafts",
    description: "Beadwork and traditional art reaching global markets.",
    location: "Prairies"
  },
  {
    image: galleryForestry,
    title: "Sustainable Forestry",
    description: "Managing traditional territories with sustainable practices.",
    location: "West Coast"
  },
  {
    image: galleryCulinary,
    title: "Indigenous Culinary Arts",
    description: "Traditional ingredients and recipes in modern cuisine.",
    location: "Central Canada"
  },
  {
    image: galleryTourism,
    title: "Eco-Tourism & Land-Based Experiences",
    description: "Sharing traditional knowledge through guided experiences.",
    location: "The Rockies"
  },
  {
    image: galleryTech,
    title: "Technology & Innovation",
    description: "Building technology that serves Indigenous communities.",
    location: "Prairies"
  },
  {
    image: galleryWellness,
    title: "Traditional Wellness",
    description: "Traditional healing alongside modern wellness services.",
    location: "Eastern Canada"
  }
];

interface SuccessGalleryProps {
  limit?: number;
  showCta?: boolean;
}

const SuccessGallery = ({ limit, showCta = true }: SuccessGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const visibleItems = typeof limit === 'number' ? galleryItems.slice(0, limit) : galleryItems;

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);
  
  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? visibleItems.length - 1 : selectedIndex - 1);
    }
  };
  
  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === visibleItems.length - 1 ? 0 : selectedIndex + 1);
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
              Across every sector
            </span>
          </div>
          
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Indigenous Entrepreneurs
            <span className="block gradient-earth bg-clip-text text-transparent">
              Thriving Across Canada
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            From traditional crafts to clean tech, Indigenous entrepreneurs build across every
            sector. The examples below are illustrative of the kinds of businesses Indigenous Rising
            is built to support — we&apos;ll share named, consented stories as our community grows.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleItems.map((item, index) => (
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
                  <div className="flex items-center justify-end text-xs text-white/60">
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
                  src={visibleItems[selectedIndex].image} 
                  alt={visibleItems[selectedIndex].title}
                  className="w-full max-h-[70vh] object-contain"
                />
                
                {/* Caption */}
                <div className="p-6 bg-black/80">
                  <h3 className="font-display text-2xl font-bold text-white mb-2">
                    {visibleItems[selectedIndex].title}
                  </h3>
                  <p className="text-white/80 mb-3">
                    {visibleItems[selectedIndex].description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span>{visibleItems[selectedIndex].location}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {showCta && (
          <div className="text-center mt-10">
            <Link
              to="/success-stories"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-border rounded-lg font-semibold hover:bg-muted/50 transition-colors"
            >
              View All Success Stories
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default SuccessGallery;

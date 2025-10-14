import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Camera, Users, Trophy, Code, Palette, Gamepad2, ChevronLeft, ChevronRight } from "lucide-react";
import Footer from "@/components/Footer";

// Import organizer photos
import abhivanCharan from "@/assets/organizers/pic1.png";
import hemanth from "@/assets/organizers/pic2.png";
import jaheer from "@/assets/organizers/pic3.png";
import murali from "@/assets/organizers/pic4.png";
import nagaDurga from "@/assets/organizers/pic5.png";
import raghava from "@/assets/organizers/raghava.png";
import santhosh from "@/assets/organizers/santhosh.png";
import vinod from "@/assets/organizers/vinod.png";

// Organizer photos for carousel - just the images
const organizerPhotos = [
  abhivanCharan,
  hemanth,
  jaheer,
  murali,
  nagaDurga,
  // raghava,
  // santhosh,
  // vinod
];

// Sample gallery data - replace with actual event photos
const galleryCategories = [
  {
    id: "technical",
    title: "Technical Events",
    icon: Code,
    color: "primary",
    events: [
      {
        id: "web-dev",
        name: "Web Development Challenge",
        photos: [
          {
            id: 1,
            url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
            caption: "Participants working on their web applications",
            category: "Technical"
          },
          {
            id: 2,
            url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop",
            caption: "Judges evaluating the projects",
            category: "Technical"
          },
          {
            id: 3,
            url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop",
            caption: "Team collaboration in action",
            category: "Technical"
          }
        ]
      },
      {
        id: "poster",
        name: "Poster Presentation",
        photos: [
          {
            id: 4,
            url: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=600&fit=crop",
            caption: "Students presenting their research posters",
            category: "Technical"
          },
          {
            id: 5,
            url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop",
            caption: "Detailed poster presentations",
            category: "Technical"
          }
        ]
      },
      {
        id: "tech-expo",
        name: "Tech Expo",
        photos: [
          {
            id: 6,
            url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop",
            caption: "Innovative projects on display",
            category: "Technical"
          }
        ]
      }
    ]
  },
  {
    id: "non-technical",
    title: "Non-Technical Events",
    icon: Palette,
    color: "secondary",
    events: [
      {
        id: "photography",
        name: "Photography Contest",
        photos: [
          {
            id: 7,
            url: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop",
            caption: "Creative photography submissions",
            category: "Non-Technical"
          },
          {
            id: 8,
            url: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=600&fit=crop",
            caption: "Photo exhibition setup",
            category: "Non-Technical"
          }
        ]
      },
      {
        id: "gaming",
        name: "Esports Championships",
        photos: [
          {
            id: 9,
            url: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&h=600&fit=crop",
            caption: "Intense gaming competitions",
            category: "Non-Technical"
          },
          {
            id: 10,
            url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
            caption: "Gaming setup and equipment",
            category: "Non-Technical"
          }
        ]
      }
    ]
  },
  {
    id: "awards",
    title: "Awards & Ceremony",
    icon: Trophy,
    color: "accent",
    events: [
      {
        id: "awards",
        name: "Award Ceremony",
        photos: [
          {
            id: 11,
            url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600&fit=crop",
            caption: "Winners receiving their awards",
            category: "Awards"
          },
          {
            id: 12,
            url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop",
            caption: "Group photo of all participants",
            category: "Awards"
          },
          {
            id: 13,
            url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
            caption: "Organizers and volunteers",
            category: "Awards"
          }
        ]
      }
    ]
  }
];

// Auto-sliding Carousel Component - Full Width Photos Only
const OrganizerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === organizerPhotos.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? organizerPhotos.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === organizerPhotos.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full mb-16">
      {/* Full Width Carousel */}
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {organizerPhotos.map((photo, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <div className="relative aspect-[16/9] w-full">
                <img
                  src={photo}
                  alt={`Organizer photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors duration-200 z-10"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors duration-200 z-10"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-6 space-x-2">
        {organizerPhotos.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors duration-200 ${
              index === currentIndex ? 'bg-primary' : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    caption: string;
    category: string;
  } | null>(null);

  const openImageModal = (image: { url: string; caption: string; category: string }) => {
    setSelectedImage(image);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl font-bold mb-6 text-gradient">
            Cache 2025 Gallery
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Relive the amazing moments from Cache 2025! Browse through photos from all our events, 
            competitions, and the award ceremony.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-4 py-2">
              📸 {galleryCategories.reduce((total, cat) => total + cat.events.reduce((sum, event) => sum + event.photos.length, 0), 0)} Photos
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-4 py-2">
              🏆 Award Ceremony Included
            </Badge>
          </div>
        </div>

        {/* Photo Carousel */}
        <div className="mb-16 animate-slide-up">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-gradient">
              Event Highlights
            </h2>
            <p className="text-lg text-muted-foreground">
              Capturing the best moments from Cache 2025
            </p>
          </div>
          <OrganizerCarousel />
        </div>

        {/* Gallery Categories */}
        {galleryCategories.map((category, categoryIndex) => {
          const IconComponent = category.icon;
          const totalPhotos = category.events.reduce((sum, event) => sum + event.photos.length, 0);
          
          return (
            <section key={category.id} className="mb-16 animate-slide-up">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <IconComponent className={`w-8 h-8 text-${category.color}`} />
                  <h2 className="text-4xl font-bold text-primary">
                    {category.title}
                  </h2>
                </div>
                <p className="text-lg text-muted-foreground">
                  {totalPhotos} photos from {category.events.length} events
                </p>
              </div>

              {/* Event Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {category.events.map((event) => (
                  <Card key={event.id} className="group card-gradient border-border hover:scale-105 smooth-transition overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-xl group-hover:text-gradient smooth-transition">
                        {event.name}
                      </CardTitle>
                      <CardDescription>
                        {event.photos.length} photos
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      {/* Photo Preview Grid */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {event.photos.slice(0, 4).map((photo, index) => (
                          <div
                            key={photo.id}
                            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                            onClick={() => openImageModal(photo)}
                          >
                            <img
                              src={photo.url}
                              alt={photo.caption}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            {index === 3 && event.photos.length > 4 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                  +{event.photos.length - 4}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          // Scroll to photos section for this event
                          const element = document.getElementById(`${event.id}-photos`);
                          element?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        View All Photos
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Full Photo Gallery for Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {category.events.map((event) => (
                  <div key={`${event.id}-photos`} id={`${event.id}-photos`} className="space-y-6">
                    <h3 className="text-2xl font-semibold text-center text-gradient">
                      {event.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {event.photos.map((photo) => (
                        <div
                          key={photo.id}
                          className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer"
                          onClick={() => openImageModal(photo)}
                        >
                          <img
                            src={photo.url}
                            alt={photo.caption}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-4 left-4 right-4">
                              <p className="text-white text-sm font-medium line-clamp-2">
                                {photo.caption}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* Thank You Section */}
        <div className="text-center animate-slide-up mt-16">
          <Card className="card-gradient border-border p-8">
            <h2 className="text-3xl font-bold mb-4 text-gradient">
              Thank You, Cache 2025!
            </h2>
            <p className="text-muted-foreground mb-2 max-w-2xl mx-auto">
              These photos capture the spirit of innovation, creativity, and collaboration that made Cache 2025 unforgettable.
            </p>
            <p className="text-sm text-accent mb-6">
              Special thanks to all participants, volunteers, judges, and organizers!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-gradient-primary hover:opacity-90">
                <a href="#top">Back to Top</a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="/events">View Events</a>
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={closeImageModal}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-center">
              {selectedImage?.caption}
            </DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <img
                src={selectedImage.url}
                alt={selectedImage.caption}
                className="w-full h-auto rounded-lg"
              />
              <div className="text-center">
                <Badge variant="secondary">
                  {selectedImage.category}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Gallery;

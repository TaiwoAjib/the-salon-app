
import { useState, useEffect } from 'react';
import { galleryService, GalleryItem } from '@/services/galleryService';

const Gallery = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await galleryService.getAllItems();
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          console.error('Gallery items data is not an array:', data);
          setItems([]);
        }
      } catch (error) {
        console.error('Failed to load gallery items', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const categories = ['All', ...new Set(items?.map ? items.map((item) => item.category) : [])];

  const filteredItems =
    activeCategory === 'All'
      ? items
      : items.filter((item) => item.category === activeCategory);

  if (loading) {
    return <div className="py-24 text-center">Loading gallery...</div>;
  }

  if (items.length === 0) {
    return null; // Don't show section if no items
  }

  return (
    <section id="gallery" className="py-24 lg:py-32 bg-charcoal-light">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="font-sans text-primary uppercase tracking-[0.3em] text-sm mb-4">
            Our Portfolio
          </p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground">
            Style Gallery
          </h2>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`font-sans text-sm uppercase tracking-widest px-4 md:px-6 py-2 rounded-full transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Overlay Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0">
                <span className="font-sans text-primary text-sm uppercase tracking-widest mb-2">
                  {item.category}
                </span>
                <h3 className="font-serif text-xl text-foreground">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;

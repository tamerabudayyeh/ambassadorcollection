export interface HotelProperty {
  id: string
  name: string
  location: string
  description: string
  image: string
  stars: number
  price: number
  amenities: string[]
}

export interface Location {
  name: string
  description: string
  image: string
  hotels: number
  attractions: string[]
}

export const hotels = [
  {
    id: "ambassador-jerusalem",
    name: "Ambassador Jerusalem",
    location: "Nablus Road 5, Jerusalem",
    description: "A Jerusalem landmark — trusted by generations, blending timeless heritage with modern luxury.",
    image: "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    stars: 5,
    price: 450,
    amenities: ["Free Wi-Fi", "Modern Rooms", "Restaurant", "Meeting Rooms", "24/7 Reception"]
  },
  {
    id: "ambassador-boutique",
    name: "Ambassador Boutique",
    location: "Ali Ibn Abu Taleb 5, Jerusalem",
    description: "An intimate retreat by the Old City — elegant, stylish, and authentically Jerusalem.",
    image: "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    stars: 4.5,
    price: 350,
    amenities: ["Old City Access", "Boutique Design", "Free Wi-Fi", "Restaurant", "Business Center"]
  },
  {
    id: "ambassador-city",
    name: "Ambassador City Bethlehem",
    location: "Star Street, Bethlehem",
    description: "Your haven in Bethlehem — a warm welcome for pilgrims and travelers alike.",
    image: "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    stars: 4,
    price: 280,
    amenities: ["Rooftop Restaurant", "City Views", "Modern Rooms", "Free Wi-Fi", "Tour Desk"]
  },
  {
    id: "ambassador-comfort",
    name: "Ambassador Comfort",
    location: "Ibn Khaldoun 8, East Jerusalem",
    description: "Modern comfort in the heart of East Jerusalem — practical, welcoming, and always attentive.",
    image: "https://images.pexels.com/photos/2467285/pexels-photo-2467285.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    stars: 4,
    price: 320,
    amenities: ["Mount Scopus Views", "Private Balconies", "Restaurant", "Free Wi-Fi", "Conference Room"]
  }
]

export const locations = [
  {
    name: "Jerusalem",
    description: "Experience the eternal city with our three distinctive properties in Jerusalem, each offering unique access to historical sites and modern amenities.",
    image: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Jerusalem_night_2019.jpg", // Dome of the Rock and Old City, Wikimedia Commons, CC BY-SA 4.0
    hotels: 3,
    attractions: ["Old City", "Western Wall", "Church of the Holy Sepulchre", "Mount of Olives"]
  },
  {
    name: "Bethlehem",
    description: "Stay at our modern Ambassador City Hotel, perfectly positioned at the entrance of historic Star Street with stunning views of Bethlehem and Jerusalem.",
    image: "https://upload.wikimedia.org/wikipedia/commons/0/01/Bethlehem-street2.JPG", // Bethlehem street, Wikimedia Commons, CC BY-SA 2.5
    hotels: 1,
    attractions: ["Church of the Nativity", "Star Street", "Shepherd's Field", "Old City Market"]
  }
]

export const featuredHotels = hotels.slice(0, 3)
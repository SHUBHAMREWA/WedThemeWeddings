export const EVENT_TYPES = [
  "Wedding",
  "Pre-Wedding",
  "Engagement",
  "Haldi & Mehendi",
  "Sangeet",
  "Reception",
  "Birthday",
  "Baby Shoot",
  "Maternity",
  "Corporate Event",
  "Concert & Live Event",
  "Commercial & Product",
] as const;

export const SERVICE_CATEGORIES = [
  "Photography",
  "Cinematography",
  "Drone",
  "Candid",
  "Pre-Wedding",
  "Albums & Prints",
  "Live Streaming",
] as const;

export const GEAR_CATEGORIES = ["Drone", "Camera", "Lens", "Gimbal & Stabilizer", "Lighting", "Audio"] as const;

export const INQUIRY_STATUSES = ["new", "contacted", "booked", "closed"] as const;

export const BUDGETS = [
  "Under ₹50,000",
  "₹50,000 – ₹1,00,000",
  "₹1,00,000 – ₹2,50,000",
  "₹2,50,000 – ₹5,00,000",
  "Above ₹5,00,000",
] as const;

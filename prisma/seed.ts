import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding ChocoFusion database for Hyderabad...");

  // Clean existing tables (in order of relations)
  await prisma.notificationLog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.deliverySlot.deleteMany();
  await prisma.serviceablePincode.deleteMany();
  await prisma.blockedDate.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.storeSetting.deleteMany();

  // 1. Categories matching the brand menu
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Nut Delights (100g)",
        slug: "nut-delights",
        description: "Freshly roasted premium nuts folded into decadent handcrafted chocolate. Sold per 100g.",
        icon: "Sparkles",
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: "Viral Kunafa",
        slug: "kunafa-collection",
        description: "Crispy butter-toasted kataifi pastry and rich pistachio cream encased in Belgian chocolate.",
        icon: "Flame",
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: "Dry Fruit Bars (Each)",
        slug: "dry-fruit-bars",
        description: "Gourmet chocolate slabs generously studded with whole dried fruits and crunchy roasted nuts.",
        icon: "Layers",
        sortOrder: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: "Customised Gift Hampers",
        slug: "gift-hampers",
        description: "Royal celebration gift hampers customized with velvet keepsake packaging.",
        icon: "Gift",
        sortOrder: 4,
      },
    }),
  ]);

  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  // 2. Official Products from ChocoFusion Luxury Menu
  // Rule: If not mentioned as "each", weight is 100 gram!
  const products = [
    {
      name: "Roasted Almond Delight",
      slug: "roasted-almond-delight",
      shortDesc: "Golden roasted California almonds encased in rich handcrafted chocolate. 100g portion.",
      description: "Our signature favorite! Slow-roasted whole California almonds tossed in light caramel and draped in velvety milk chocolate. 100g base portion.",
      ingredients: "Fine Belgian Cocoa Solids, Roasted California Almonds, Cocoa Butter, Pure Dairy Milk, Cane Sugar.",
      price: 120,
      originalPrice: 140,
      weight: "100g",
      imageUrl: "https://images.unsplash.com/photo-1526081347589-7fa3cb41b4b2?auto=format&fit=crop&w=800&q=80",
      isVeg: true,
      isEggless: true,
      inStock: true,
      featured: true,
      bestSeller: true,
      rating: 4.9,
      reviewCount: 168,
      variants: JSON.stringify([
        { name: "100g Pouch", price: 120 },
        { name: "250g Box", price: 290 },
        { name: "500g Tub", price: 550 },
      ]),
      categoryId: catMap["nut-delights"],
    },
    {
      name: "Creamy Cashew Delight",
      slug: "creamy-cashew-delight",
      shortDesc: "Tender Mangalore cashews bathed in silky-smooth gourmet chocolate. 100g portion.",
      description: "Buttery, tender cashews carefully roasted to perfection and combined with our creamy milk chocolate base for an intensely smooth, melt-in-the-mouth texture.",
      ingredients: "Cocoa Mass, Mangalore Cashew Nuts, Cocoa Butter, Dairy Milk Solids, Natural Vanilla.",
      price: 120,
      originalPrice: 140,
      weight: "100g",
      imageUrl: "https://images.unsplash.com/photo-1548741487-18d16a1a088c?auto=format&fit=crop&w=800&q=80",
      isVeg: true,
      isEggless: true,
      inStock: true,
      featured: true,
      bestSeller: false,
      rating: 4.88,
      reviewCount: 94,
      variants: JSON.stringify([
        { name: "100g Pouch", price: 120 },
        { name: "250g Box", price: 290 },
        { name: "500g Tub", price: 550 },
      ]),
      categoryId: catMap["nut-delights"],
    },
    {
      name: "Choco Walnut Delight",
      slug: "choco-walnut-delight",
      shortDesc: "Crisp California walnut halves folded into deep single-origin dark chocolate. 100g portion.",
      description: "For true dark chocolate lovers. Crisp, earthy Californian walnut halves balanced with 60% rich cocoa chocolate for an aromatic and deeply satisfying treat.",
      ingredients: "60% Dark Cocoa Solids, Toasted California Walnuts, Cocoa Butter, Raw Cane Sugar.",
      price: 130,
      originalPrice: 150,
      weight: "100g",
      imageUrl: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80",
      isVeg: true,
      isEggless: true,
      inStock: true,
      featured: true,
      bestSeller: false,
      rating: 4.92,
      reviewCount: 110,
      variants: JSON.stringify([
        { name: "100g Pouch", price: 130 },
        { name: "250g Box", price: 310 },
        { name: "500g Tub", price: 590 },
      ]),
      categoryId: catMap["nut-delights"],
    },
    {
      name: "Pistachio Royal Delight",
      slug: "pistachio-royal-delight",
      shortDesc: "Royal delicacy filled with Iranian emerald pistachios & smooth chocolate. 100g portion.",
      description: "Indulge like royalty. Handpicked Iranian green pistachios gently roasted and enrobed in a special ivory and milk chocolate swirl with a hint of cardamom essence.",
      ingredients: "Cocoa Solids, Iranian Green Pistachios, Cocoa Butter, Whole Milk Solids, Natural Cardamom.",
      price: 150,
      originalPrice: 175,
      weight: "100g",
      imageUrl: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=800&q=80",
      isVeg: true,
      isEggless: true,
      inStock: true,
      featured: true,
      bestSeller: true,
      rating: 4.96,
      reviewCount: 205,
      variants: JSON.stringify([
        { name: "100g Pouch", price: 150 },
        { name: "250g Box", price: 360 },
        { name: "500g Tub", price: 690 },
      ]),
      categoryId: catMap["nut-delights"],
    },
    {
      name: "Honey Hazelnut Delight",
      slug: "honey-hazelnut-delight",
      shortDesc: "Golden roasted Turkish hazelnuts glazed with pure honey & rich chocolate. 100g portion.",
      description: "Crunchy Turkish hazelnuts toasted to a deep aroma, lightly glazed with raw organic forest honey, and wrapped in rich dark chocolate.",
      ingredients: "Roasted Turkish Hazelnuts, Pure Forest Honey, Cocoa Solids, Cocoa Butter, Sunflower Lecithin.",
      price: 100,
      originalPrice: 120,
      weight: "100g",
      imageUrl: "https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80",
      isVeg: true,
      isEggless: true,
      inStock: true,
      featured: false,
      bestSeller: false,
      rating: 4.85,
      reviewCount: 82,
      variants: JSON.stringify([
        { name: "100g Pouch", price: 100 },
        { name: "250g Box", price: 240 },
        { name: "500g Tub", price: 460 },
      ]),
      categoryId: catMap["nut-delights"],
    },
    {
      name: "All Nuts Festival Delight",
      slug: "all-nuts-festival-delight",
      shortDesc: "The ultimate crunch: almonds, cashews, walnuts & pistachios in every bite. 100g portion.",
      description: "Our signature celebration piece. A powerhouse fusion of four royal nuts (almonds, cashews, walnuts, and pistachios) enveloped in smooth gourmet chocolate.",
      ingredients: "Almonds, Cashews, Walnuts, Pistachios, Cocoa Solids, Cocoa Butter, Milk Solids.",
      price: 130,
      originalPrice: 150,
      weight: "100g",
      imageUrl: "https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=800&q=80",
      isVeg: true,
      isEggless: true,
      inStock: true,
      featured: true,
      bestSeller: true,
      rating: 4.97,
      reviewCount: 310,
      variants: JSON.stringify([
        { name: "100g Pouch", price: 130 },
        { name: "250g Box", price: 310 },
        { name: "500g Tub", price: 590 },
      ]),
      categoryId: catMap["nut-delights"],
    },
    {
      name: "Assorted Chocolate Delight",
      slug: "assorted-chocolate-delight",
      shortDesc: "A delightful medley featuring dark, milk & nutty artisanal creations. 100g portion.",
      description: "Can't decide? Treat yourself to our chef's handpicked assortment of gourmet chocolate textures and roasted nuts. Perfect for sharing.",
      ingredients: "Assorted Dark, Milk & White Chocolate, Mixed Roasted Nuts, Pure Vanilla Extract.",
      price: 130,
      originalPrice: 150,
      weight: "100g",
      imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
      isVeg: true,
      isEggless: true,
      inStock: true,
      featured: true,
      bestSeller: true,
      rating: 4.93,
      reviewCount: 145,
      variants: JSON.stringify([
        { name: "100g Assorted Box", price: 130 },
        { name: "250g Box", price: 310 },
        { name: "500g Tub", price: 590 },
      ]),
      categoryId: catMap["nut-delights"],
    },
    {
      name: "Dry Fruits Bar",
      slug: "dry-fruits-bar",
      shortDesc: "Full-sized gourmet slab loaded with cranberries, raisins, almonds & cashews. Sold each.",
      description: "Generous chocolate bar bursting with chewy dried cranberries, black raisins, roasted almonds, and cashew chunks. A wholesome, high-energy gourmet bar.",
      ingredients: "Cocoa Solids, Whole Dried Cranberries, Golden Raisins, Roasted Almonds, Cashews, Cocoa Butter.",
      price: 110,
      originalPrice: 130,
      weight: "Each (85g Bar)",
      imageUrl: "https://images.unsplash.com/photo-1623334044303-241021148842?auto=format&fit=crop&w=800&q=80",
      isVeg: true,
      isEggless: true,
      inStock: true,
      featured: true,
      bestSeller: false,
      rating: 4.86,
      reviewCount: 98,
      variants: JSON.stringify([
        { name: "1 Bar (Each)", price: 110 },
        { name: "Twin Pack (2 Bars)", price: 210 },
      ]),
      categoryId: catMap["dry-fruit-bars"],
    },
    {
      name: "Dry Fruits Mini Bar",
      slug: "dry-fruits-mini-bar",
      shortDesc: "Pocket-sized chocolate bar with crunchy roasted dry fruits. Sold each.",
      description: "Miniature indulgence packed with the goodness of roasted nuts and dried fruits. Ideal for gifting, party hampers, or on-the-go cravings.",
      ingredients: "Chocolate Blend, Toasted Almonds, Cashew Bits, Dried Raisins.",
      price: 50,
      originalPrice: 60,
      weight: "Each (35g Mini Bar)",
      imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=800&q=80",
      isVeg: true,
      isEggless: true,
      inStock: true,
      featured: false,
      bestSeller: true,
      rating: 4.81,
      reviewCount: 160,
      variants: JSON.stringify([
        { name: "1 Mini Bar (Each)", price: 50 },
        { name: "Pack of 5 Minis", price: 235 },
        { name: "Pack of 10 Minis", price: 450 },
      ]),
      categoryId: catMap["dry-fruit-bars"],
    },
    {
      name: "Kunafa Bites",
      slug: "kunafa-bites",
      shortDesc: "Crisp butter-toasted kataifi pastry & pistachio cream in bite cubes. 100g portion.",
      description: "The viral sensation in convenient bite sizes! Golden kataifi pastry fried to a heavenly crunch in pure ghee, blended with pistachio tahini cream, and coated in rich milk chocolate.",
      ingredients: "Kataifi Pastry Dough, Clarified Butter (Ghee), Roasted Pistachio Paste, Tahini, Belgian Milk Chocolate (38%).",
      price: 149,
      originalPrice: 180,
      weight: "100g",
      imageUrl: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=800&q=80",
      isVeg: true,
      isEggless: true,
      inStock: true,
      featured: true,
      bestSeller: true,
      rating: 4.98,
      reviewCount: 320,
      variants: JSON.stringify([
        { name: "100g Box (approx 4 Bites)", price: 149 },
        { name: "200g Box", price: 289 },
      ]),
      categoryId: catMap["kunafa-collection"],
    },
    {
      name: "Kunafa Big Bar",
      slug: "kunafa-big-bar",
      shortDesc: "The viral Dubai chocolate bar: thick chocolate shell packed with crispy kunafa & pistachio cream.",
      description: "The internet-famous Dubai chocolate bar, handcrafted fresh every morning in Hyderabad. A thick, glossy milk chocolate bar stuffed to maximum capacity with crispy browned kataifi shreds and velvety pistachio cream.",
      ingredients: "Belgian Milk Chocolate, Crispy Kataifi Threads, Clarified Butter, Sicilian Pistachio Butter, Sesame Tahini, Sea Salt.",
      price: 349,
      originalPrice: 399,
      weight: "180g Giant Bar (Each)",
      imageUrl: "https://images.unsplash.com/photo-1548741487-18d16a1a088c?auto=format&fit=crop&w=800&q=80",
      isVeg: true,
      isEggless: true,
      inStock: true,
      featured: true,
      bestSeller: true,
      rating: 4.99,
      reviewCount: 480,
      variants: JSON.stringify([
        { name: "180g Giant Bar (Each)", price: 349 },
        { name: "Twin Pack (360g)", price: 669 },
      ]),
      categoryId: catMap["kunafa-collection"],
    },
    {
      name: "Customised Gift Hamper",
      slug: "customised-gift-hamper",
      shortDesc: "Bespoke luxury hamper with velvet box, personalized card & assorted delights (₹800 - ₹1399).",
      description: "An opulent royal gift designed for weddings, birthdays, festivals, and corporate gifting across Hyderabad. Packaged in a velvet keepsake box with custom ribbon and handwritten gold foil card.",
      ingredients: "Curated selection of Roasted Nut Delights, Dry Fruit Bars, Kunafa treats, and customized message card.",
      price: 800,
      originalPrice: 950,
      weight: "Luxury Keepsake Hamper (Custom)",
      imageUrl: "https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?auto=format&fit=crop&w=800&q=80",
      isVeg: true,
      isEggless: true,
      inStock: true,
      featured: true,
      bestSeller: true,
      rating: 4.98,
      reviewCount: 240,
      variants: JSON.stringify([
        { name: "Classic Hamper (Nut Delights + Dry Fruit Bar)", price: 800 },
        { name: "Royal Hamper (Includes Kunafa Bar + 6 Nut Delights)", price: 1099 },
        { name: "Grand Celebration Hamper (Complete Luxury Collection)", price: 1399 },
      ]),
      categoryId: catMap["gift-hampers"],
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  // 3. Delivery Slots
  const slots = [
    { startTime: "10:00", endTime: "12:00", label: "10:00 AM - 12:00 PM (Morning Slot)", maxOrdersPerDay: 25, sortOrder: 1 },
    { startTime: "12:00", endTime: "14:00", label: "12:00 PM - 02:00 PM (Afternoon Slot)", maxOrdersPerDay: 25, sortOrder: 2 },
    { startTime: "14:00", endTime: "16:00", label: "02:00 PM - 04:00 PM (Mid-Day Slot)", maxOrdersPerDay: 25, sortOrder: 3 },
    { startTime: "16:00", endTime: "18:00", label: "04:00 PM - 06:00 PM (Evening Slot)", maxOrdersPerDay: 30, sortOrder: 4 },
    { startTime: "18:00", endTime: "20:00", label: "06:00 PM - 08:00 PM (Night Slot)", maxOrdersPerDay: 30, sortOrder: 5 },
  ];

  for (const slot of slots) {
    await prisma.deliverySlot.create({ data: slot });
  }

  // 4. Serviceable Pincodes across HYDERABAD
  const pincodes = [
    { pincode: "500034", areaName: "Banjara Hills", city: "Hyderabad" },
    { pincode: "500033", areaName: "Jubilee Hills", city: "Hyderabad" },
    { pincode: "500081", areaName: "Madhapur / HITEC City", city: "Hyderabad" },
    { pincode: "500032", areaName: "Gachibowli / Financial District", city: "Hyderabad" },
    { pincode: "500084", areaName: "Kondapur", city: "Hyderabad" },
    { pincode: "500016", areaName: "Begumpet / Prakash Nagar", city: "Hyderabad" },
    { pincode: "500003", areaName: "Secunderabad", city: "Hyderabad" },
    { pincode: "500082", areaName: "Somajiguda / Panjagutta", city: "Hyderabad" },
    { pincode: "500028", areaName: "Masab Tank / Mehdipatnam", city: "Hyderabad" },
    { pincode: "500008", areaName: "Toli Chowki / Shaikpet", city: "Hyderabad" },
    { pincode: "500072", areaName: "Kukatpally / KPHB Colony", city: "Hyderabad" },
    { pincode: "500001", areaName: "Abids / Koti", city: "Hyderabad" },
    { pincode: "500029", areaName: "Himayatnagar / Narayanguda", city: "Hyderabad" },
    { pincode: "500018", areaName: "Ameerpet / Sanath Nagar", city: "Hyderabad" },
  ];

  for (const pin of pincodes) {
    await prisma.serviceablePincode.create({ data: pin });
  }

  // 5. Coupons
  const coupons = [
    {
      code: "CHOCO10",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderValue: 399,
      maxDiscount: 150,
      description: "10% off on orders above ₹399 across Hyderabad",
      isActive: true,
    },
    {
      code: "FIRSTBITE",
      discountType: "FLAT",
      discountValue: 50,
      minOrderValue: 299,
      description: "Flat ₹50 off on your first Hyderabad order",
      isActive: true,
    },
    {
      code: "FUSION20",
      discountType: "PERCENTAGE",
      discountValue: 20,
      minOrderValue: 800,
      maxDiscount: 250,
      description: "20% off on luxury hampers and orders above ₹800",
      isActive: true,
    },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.create({ data: coupon });
  }

  // 6. Store Settings
  const settings = [
    { key: "city", value: "Hyderabad" },
    { key: "delivery_fee", value: "75" },
    { key: "free_delivery_threshold", value: "999" },
    { key: "min_lead_time_hours", value: "24" },
    { key: "owner_phone", value: "+919986120044" },
    { key: "owner_whatsapp", value: "+919986120044" },
    { key: "brand_tagline", value: "Premium Handcrafted Chocolates • Freshly Roasted Nuts • Finest Quality Dry Fruits" },
  ];

  for (const setting of settings) {
    await prisma.storeSetting.create({ data: setting });
  }

  console.log("✅ Seed completed for Hyderabad with 100g portions and official menu!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

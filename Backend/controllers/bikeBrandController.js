const BikeBrand = require("../models/BikeBrand");

const DEFAULT_BRANDS = [
  { name: "Royal Enfield", models: ["Classic 350", "Bullet 350", "Meteor 350", "Himalayan", "Continental GT", "Interceptor 650"] },
  { name: "Bajaj", models: ["Pulsar 150", "Pulsar 180", "Pulsar 220", "Dominar 400", "Avenger"] },
  { name: "Hero", models: ["Splendor", "HF Deluxe", "Passion Pro", "Glamour", "Xtreme 160R"] },
  { name: "Honda", models: ["Shine", "Unicorn", "Hornet 2.0", "CB350", "CB500X"] },
  { name: "TVS", models: ["Apache RTR 160", "Apache RTR 200", "Raider", "Ronin", "Jupiter"] },
  { name: "Yamaha", models: ["FZ", "MT-15", "R15", "FZ25", "Fascino"] },
  { name: "KTM", models: ["Duke 125", "Duke 200", "Duke 390", "RC 200", "RC 390", "Adventure 390"] },
  { name: "Suzuki", models: ["Gixxer", "Access 125", "Burgman Street", "V-Strom SX", "Hayabusa"] },
  { name: "Jawa", models: ["Jawa", "Forty Two", "Perak"] },
  { name: "Other", models: ["Custom"] },
];

const seedBrandsIfEmpty = async () => {
  try {
    const count = await BikeBrand.countDocuments();
    if (count === 0) {
      await BikeBrand.insertMany(DEFAULT_BRANDS);
      console.log("🌱 Bike brands database seeded with defaults.");
    }
  } catch (error) {
    console.error("❌ Seeding bike brands failed:", error);
  }
};

const getAllBrands = async (req, res) => {
  try {
    await seedBrandsIfEmpty();
    const brands = await BikeBrand.find().sort({ name: 1 });
    res.json({ brands });
  } catch (error) {
    console.error("Get brands error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createBrand = async (req, res) => {
  try {
    const { name, models } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Brand name is required" });
    }
    const brand = new BikeBrand({ name, models: models || [] });
    await brand.save();
    res.status(201).json({ message: "Brand created successfully", brand });
  } catch (error) {
    console.error("Create brand error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, models } = req.body;
    const brand = await BikeBrand.findById(id);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    if (name) brand.name = name;
    if (models) brand.models = models;
    await brand.save();
    res.json({ message: "Brand updated successfully", brand });
  } catch (error) {
    console.error("Update brand error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await BikeBrand.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Brand not found" });
    }
    res.json({ message: "Brand deleted successfully", brand: deleted });
  } catch (error) {
    console.error("Delete brand error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllBrands,
  createBrand,
  updateBrand,
  deleteBrand,
};

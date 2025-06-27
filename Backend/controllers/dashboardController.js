const User = require("../models/User");
const Bike = require("../models/Bike");
const Fuel = require("../models/Fuel");
const Service = require("../models/Service");

// 1. Bike Status Endpoint
const getRandomFuelLevel = () => Math.floor(Math.random() * 91) + 10; // 10% to 100%

exports.getBikeStatus = async (req, res) => {
  try {
    const { bikeId } = req.params;
    const bike = await Bike.findById(bikeId);
    if (!bike) return res.status(404).json({ message: "Bike not found" });

    // Get all fuel and service logs
    const fuelLogs = await Fuel.find({ bike: bikeId });
    const serviceLogs = await Service.find({ bike: bikeId });

    // Calculate fuelEconomy as per frontend logic
    let fuelEconomy = null;
    if (fuelLogs.length >= 2) {
      // Sort logs by odometer ascending
      const sortedLogs = [...fuelLogs].sort((a, b) => a.odometer - b.odometer);
      let totalKm = 0;
      let totalFuel = 0;
      for (let i = 1; i < sortedLogs.length; i++) {
        const km = sortedLogs[i].odometer - sortedLogs[i - 1].odometer;
        if (km > 0 && sortedLogs[i].amount > 0) {
          totalKm += km;
          totalFuel += sortedLogs[i].amount;
        }
      }
      fuelEconomy =
        totalFuel > 0 ? Number((totalKm / totalFuel).toFixed(1)) : null;
    }

    // Get last and next service
    const latestService = serviceLogs.sort((a, b) => b.date - a.date)[0];

    // Calculate costPerKm (total fuel+service cost / total km)
    const totalFuelCost = fuelLogs.reduce(
      (sum, log) => sum + (log.totalCost || 0),
      0
    );
    const totalServiceCost = serviceLogs.reduce(
      (sum, log) => sum + (log.cost || 0),
      0
    );
    const totalCost = totalFuelCost + totalServiceCost;

    let costPerKm = null;
    if (bike.odometer && bike.odometer > 0) {
      costPerKm = Number((totalCost / bike.odometer).toFixed(2));
    }

    // Fuel level: random per fetch
    const fuelLevel = getRandomFuelLevel();

    res.json({
      fuelLevel,
      fuelEconomy,
      totalKm: bike.odometer,
      lastServiceKm: latestService?.odometer || null,
      nextServiceDue: latestService?.nextService || null,
      costPerKm,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 2. Upcoming Tasks Endpoint
exports.getUpcomingTasks = async (req, res) => {
  try {
    const { bikeId } = req.params;
    // Find next service due
    const latestService = await Service.findOne({ bike: bikeId }).sort({
      date: -1,
    });
    const bike = await Bike.findById(bikeId);
    if (!bike) return res.status(404).json({ message: "Bike not found" });

    const tasks = [];

    if (latestService && latestService.nextService) {
      const dueInKm = latestService.nextService - bike.odometer;
      tasks.push({
        id: 1,
        title: latestService.serviceType || "Service",
        dueIn: `${dueInKm > 0 ? dueInKm : 0} km`,
        priority: dueInKm < 500 ? "high" : "medium",
        type: "service",
      });
    }

    // Example: Add chain lube every 1000km
    if (bike.odometer % 1000 > 900) {
      tasks.push({
        id: 2,
        title: "Chain Lubrication",
        dueIn: `${1000 - (bike.odometer % 1000)} km`,
        priority: "medium",
        type: "maintenance",
      });
    }

    // Example: Tire pressure check every 2 weeks (logic can be improved)
    tasks.push({
      id: 3,
      title: "Tire Pressure Check",
      dueIn: "1 week", // Simplified for demo
      priority: "low",
      type: "maintenance",
    });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 3. Recent Activities Endpoint
exports.getRecentActivities = async (req, res) => {
  try {
    const { bikeId } = req.params;
    // Get recent fuel and service logs
    const fuels = await Fuel.find({ bike: bikeId }).sort({ date: -1 }).limit(5);
    const services = await Service.find({ bike: bikeId })
      .sort({ date: -1 })
      .limit(5);

    // Merge and sort by date
    const activities = [
      ...fuels.map((f) => ({
        id: f._id,
        type: "fuel",
        description: `Fuel added - ${f.amount}L`,
        date: f.date,
        amount: `৳${f.totalCost}`,
      })),
      ...services.map((s) => ({
        id: s._id,
        type: "service",
        description: s.serviceType,
        date: s.date,
        amount: `৳${s.cost}`,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Format date as "x days ago" for frontend
    const formattedActivities = activities.slice(0, 5).map((a) => ({
      ...a,
      date: timeAgo(a.date),
    }));

    res.json(formattedActivities);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Utility function for "x days ago"
function timeAgo(date) {
  const now = new Date();
  const diff = (now - date) / 1000; // seconds
  if (diff < 60 * 60 * 24) return "today";
  if (diff < 60 * 60 * 24 * 2) return "1 day ago";
  if (diff < 60 * 60 * 24 * 7)
    return `${Math.floor(diff / (60 * 60 * 24))} days ago`;
  return date.toLocaleDateString();
}
//report

exports.getBikeReport = async (req, res) => {
  try {
    const { bikeId } = req.params;

    // 1. Bike data
    const bike = await Bike.findById(bikeId);
    if (!bike) return res.status(404).json({ message: "Bike not found" });

    // 2. Last service data
    const lastService = await Service.findOne({ bike: bikeId }).sort({
      date: -1,
    });

    // 3. All fuel logs (lifetime)
    const allFuelLogs = await Fuel.find({ bike: bikeId }).sort({ date: -1 });

    // 4. All service logs (lifetime)
    const allServiceLogs = await Service.find({ bike: bikeId });

    // 5. Last 8 fuel logs for chart
    const recentFuelLogs = allFuelLogs.slice(0, 8);

    // 6. Last 30 days for monthly spending
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const last30Fuel = allFuelLogs.filter(
      (log) => log.date >= thirtyDaysAgo && log.date <= today
    );
    const last30Service = allServiceLogs.filter(
      (log) => log.date >= thirtyDaysAgo && log.date <= today
    );
    const monthlySpending =
      last30Fuel.reduce((sum, log) => sum + (log.totalCost || 0), 0) +
      last30Service.reduce((sum, log) => sum + (log.cost || 0), 0);

    // 7. Lifetime totals
    const totalFuel = allFuelLogs.reduce(
      (sum, log) => sum + (log.amount || 0),
      0
    );
    const totalFuelSpend = allFuelLogs.reduce(
      (sum, log) => sum + (log.totalCost || 0),
      0
    );
    const totalServiceSpend = allServiceLogs.reduce(
      (sum, log) => sum + (log.cost || 0),
      0
    );
    const totalSpend = totalFuelSpend + totalServiceSpend;
    const avgCostPerLitre = totalFuel > 0 ? totalFuelSpend / totalFuel : 0;

    // 8. Lifetime fuel efficiency (km/l)
    let fuelEfficiency = 0;
    if (allFuelLogs.length >= 2) {
      const sorted = [...allFuelLogs].sort((a, b) => a.odometer - b.odometer);
      let km = 0,
        fuel = 0;
      for (let i = 1; i < sorted.length; i++) {
        const thisKm = sorted[i].odometer - sorted[i - 1].odometer;
        if (thisKm > 0 && sorted[i].amount > 0) {
          km += thisKm;
          fuel += sorted[i].amount;
        }
      }
      fuelEfficiency = fuel > 0 ? km / fuel : 0;
    }

    // 9. Monthly spending/fuel trends (all time)
    const monthlyStats = {};
    allFuelLogs.forEach((log) => {
      const month = `${log.date.getFullYear()}-${String(
        log.date.getMonth() + 1
      ).padStart(2, "0")}`;
      if (!monthlyStats[month])
        monthlyStats[month] = { spending: 0, litres: 0, month };
      monthlyStats[month].spending += log.totalCost;
      monthlyStats[month].litres += log.amount;
    });
    const monthlyData = Object.values(monthlyStats).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    // 10. Fuel consumption trend (litres by month, lifetime)
    const fuelConsumptionTrend = monthlyData.map((d) => ({
      month: d.month,
      litres: d.litres,
    }));

    // 11. Fuel price trend (unitCost, last 8 refuels)
    const fuelPriceTrend = recentFuelLogs
      .map((log) => ({
        date: log.date.toISOString().split("T")[0],
        unitCost: log.unitCost,
      }))
      .reverse();

    // 12. Cost breakdown (lifetime)
    const fuelCost = totalFuelSpend;
    const serviceCost = totalServiceSpend;
    // You may add partsCost etc. if you want
    const partsCost = 0;
    const costBreakdown = [
      { name: "Fuel", value: fuelCost },
      { name: "Service", value: serviceCost },
      { name: "Parts", value: partsCost },
    ];

    res.json({
      bikeData: {
        _id: bike._id,
        brand: bike.brand,
        model: bike.model,
        year: bike.year,
        registrationNumber: bike.registrationNumber,
        odometer: bike.odometer,
        lastServiceDate: lastService?.date
          ? lastService.date.toISOString().split("T")[0]
          : null,
        lastServiceOdometer: lastService?.odometer || null,
      },
      fuelLogs: recentFuelLogs.map((log) => ({
        date: log.date.toISOString().split("T")[0],
        amount: log.amount,
        unitCost: log.unitCost,
        totalCost: log.totalCost,
        odometer: log.odometer,
      })),
      totalFuel: Number(totalFuel.toFixed(1)),
      totalSpend: Number(totalSpend.toFixed(0)),
      avgCostPerLitre: Number(avgCostPerLitre.toFixed(1)),
      fuelEfficiency: Number(fuelEfficiency.toFixed(1)),
      monthlySpending: Number(monthlySpending.toFixed(0)),
      fuelConsumptionTrend, // [{month, litres}]
      costBreakdown, // [{name,value}]
      fuelPriceTrend, // [{date,unitCost}]
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

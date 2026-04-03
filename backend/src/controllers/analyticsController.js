import Token from '../models/Token.js';
import Counter from '../models/Counter.js';
import Service from '../models/Service.js';
import User from '../models/User.js';

export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Single aggregation for counts and wait time
    const stats = await Token.aggregate([
      { $match: { bookedAt: { $gte: today } } },
      {
        $group: {
          _id: null,
          totalTokensToday: { $sum: 1 },
          completedToday: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          pendingToday: { $sum: { $cond: [{ $eq: ["$status", "waiting"] }, 1, 0] } },
          totalWaitTime: { 
            $sum: { 
              $cond: [
                { $and: [{ $eq: ["$status", "completed"] }, { $gt: ["$completedAt", null] }] }, 
                { $subtract: ["$completedAt", "$bookedAt"] }, 
                0 
              ] 
            } 
          }
        }
      }
    ]);

    const dashboardStats = stats[0] || {
      totalTokensToday: 0,
      completedToday: 0,
      pendingToday: 0,
      totalWaitTime: 0
    };

    const avgWaitTime = dashboardStats.completedToday > 0 
      ? (dashboardStats.totalWaitTime / dashboardStats.completedToday / 60000).toFixed(1) 
      : 0;

    // Service-wise distribution using aggregation
    const serviceStats = await Token.aggregate([
      { $match: { bookedAt: { $gte: today } } },
      {
        $group: {
          _id: "$service",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "_id",
          as: "serviceInfo"
        }
      },
      { $unwind: "$serviceInfo" },
      {
        $project: {
          _id: 0,
          name: "$serviceInfo.name",
          count: 1
        }
      }
    ]);

    // REAL Pending Documents Count
    const pendingDocsCount = await User.aggregate([
      { $unwind: "$documents" },
      { $match: { "documents.status": "pending" } },
      { $count: "count" }
    ]);

    res.json({
      totalTokensToday: dashboardStats.totalTokensToday,
      completedToday: dashboardStats.completedToday,
      pendingToday: dashboardStats.pendingToday,
      avgWaitTime,
      serviceStats,
      activeCounters: await Counter.countDocuments({ status: 'active' }),
      pendingDocuments: pendingDocsCount[0]?.count || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    // 1. Fetch recent token activities
    const recentTokens = await Token.find()
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate('service student counter')
      .lean();

    const tokenActivities = recentTokens.map(t => ({
      id: `TX-${t._id.toString().slice(-5).toUpperCase()}`,
      module: 'Queue',
      desc: `Token ${t.number} ${t.status}`,
      sub: t.counter ? `Counter ${t.counter.number.toString().padStart(2, '0')}` : 'Portal',
      status: t.status.charAt(0).toUpperCase() + t.status.slice(1),
      color: t.status === 'completed' ? 'text-green-500' : (t.status === 'serving' ? 'text-blue-500' : 'text-stone-500'),
      timestamp: t.updatedAt
    }));

    // 2. Fetch recent user document activities
    const usersWithRecentDocs = await User.find({ 'documents.0': { $exists: true } })
      .sort({ 'documents.uploadedAt': -1 })
      .limit(10)
      .lean();

    const docActivities = [];
    usersWithRecentDocs.forEach(u => {
      u.documents.forEach(doc => {
        docActivities.push({
          id: `DOC-${doc._id.toString().slice(-5).toUpperCase()}`,
          module: 'Docs',
          desc: `Ref: ${doc._id.toString().slice(-4).toUpperCase()}`,
          sub: u.name,
          status: doc.status.charAt(0).toUpperCase() + doc.status.slice(1),
          color: doc.status === 'verified' ? 'text-green-500' : (doc.status === 'pending' ? 'text-amber-500' : 'text-red-500'),
          timestamp: doc.uploadedAt
        });
      });
    });

    // Combine and sort
    const allActivities = [...tokenActivities, ...docActivities]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    res.json(allActivities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPeakHours = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await Token.aggregate([
      { $match: { bookedAt: { $gte: today } } },
      {
        $group: {
          _id: { $hour: "$bookedAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const hours = Array(24).fill(0);
    stats.forEach(s => {
      if (s._id !== null) hours[s._id] = s.count;
    });

    res.json(hours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStaffPerformance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const performance = await Token.aggregate([
      { $match: { bookedAt: { $gte: today }, status: 'completed' } },
      {
        $group: {
          _id: "$counter",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "counters",
          localField: "_id",
          foreignField: "_id",
          as: "counterInfo"
        }
      },
      { $unwind: "$counterInfo" },
      {
        $lookup: {
          from: "users",
          localField: "counterInfo.facultyAdvisor",
          foreignField: "_id",
          as: "staffInfo"
        }
      },
      {
        $project: {
          _id: 0,
          name: { 
            $ifNull: [
              { $arrayElemAt: ["$staffInfo.name", 0] }, 
              { $concat: ["Counter ", { $toString: "$counterInfo.number" }] }
            ] 
          },
          count: 1
        }
      }
    ]);

    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


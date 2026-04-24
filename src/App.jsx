import { useState, useEffect, useMemo, useRef } from "react";
import LoginPage from "./LoginPage.jsx";
import UserManagement from "./UserManagement.jsx";
import FileImport from "./FileImport.jsx";
import { createClient } from '@supabase/supabase-js';
import {
  LayoutDashboard, Building2, GitFork, Users, Map, BarChart2,
  Shield, Search, Bell, Plus, Phone, Package, LogOut, Download, Upload,
  X, Truck, ChevronRight, Check, AlertTriangle, Clock, Navigation,
  Activity, RefreshCw, MapPin, XCircle, ChevronDown, Zap, Wind,
  Moon, Sun, Filter, Eye, MoreHorizontal, Edit2, Trash2, FileText
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend
} from "recharts";

/* ═══════════════════ SUPABASE CONFIG ═══════════════════ */
const SUPABASE_URL = "https://ivkektiowfhmvkjwzgcz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2a2VrdGlvd2ZobXZrand6Z2N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NTAzMDEsImV4cCI6MjA5MjMyNjMwMX0.5wt7bNO5Z0mFVTHi6X8Tj8nySy6WjAWCQ8z9cIKmUQw";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/* ═══════════════════ MODELS ═══════════════════ */
const MODELS = {
  SDD: { key:"SDD", label:"Same Day Delivery", short:"SDD", icon:"☀️", color:"#F59E0B", bg:"#FEF3C7", text:"#92400E", border:"#FCD34D", desc:"Morning cutoff · Delivered same day" },
  AIR: { key:"AIR", label:"Air Freight",       short:"AIR", icon:"✈️", color:"#06B6D4", bg:"#CFFAFE", text:"#164E63", border:"#67E8F9", desc:"Midday cutoff · Air priority"         },
  NDD: { key:"NDD", label:"Next Day Delivery",  short:"NDD", icon:"🌙", color:"#6366F1", bg:"#EEF2FF", text:"#3730A3", border:"#A5B4FC", desc:"Night cutoff · Delivered next day"    },
};

const CATEGORIES = ["Myntra PPMP","PPMP Myntra","C1 Feeder","Other Feeders","AIR NDD Feeders","Airport Feeder","FK/ MYN Feeders","FM SDD Feeders","Large NDD Feeders","NDD Feeders","C1 Feeder (SDD)","C1 Feeder(Air NDD)","C1 Feeder (Intra&zonal)"];
const RIDERS_DATA = [
  {id:1,name:"Arjun Sharma",phone:"+91-9876543210",assignedCluster:"Shadowfax Cluster 1",riderId:"SF001",status:"active",vehicle:"Bike",totalDeliveries:245,onTimeRate:94,currentLocation:{lat:28.7041,lng:77.1025},activeOrders:5,todayOrders:12,role:"rider",schedule:{start:"08:00",end:"18:00"}},
  {id:2,name:"Priya Singh",phone:"+91-9876543211",assignedCluster:"Shadowfax Cluster 2",riderId:"SF002",status:"active",vehicle:"Van",totalDeliveries:312,onTimeRate:96,currentLocation:{lat:28.5355,lng:77.3910},activeOrders:3,todayOrders:10,role:"rider",schedule:{start:"09:00",end:"19:00"}},
  {id:3,name:"Rahul Verma",phone:"+91-9876543212",assignedCluster:"Shadowfax Cluster 1",riderId:"SF003",status:"inactive",vehicle:"Bike",totalDeliveries:198,onTimeRate:91,currentLocation:{lat:28.6692,lng:77.4538},activeOrders:0,todayOrders:0,role:"rider",schedule:{start:"08:00",end:"18:00"}},
  {id:4,name:"Sneha Patel",phone:"+91-9876543213",assignedCluster:"Shadowfax Cluster 3",riderId:"SF004",status:"active",vehicle:"Bike",totalDeliveries:276,onTimeRate:95,currentLocation:{lat:28.4595,lng:77.0266},activeOrders:7,todayOrders:15,role:"rider",schedule:{start:"07:00",end:"17:00"}},
  {id:5,name:"Amit Kumar",phone:"+91-9876543214",assignedCluster:"Shadowfax Cluster 2",riderId:"SF005",status:"active",vehicle:"Van",totalDeliveries:334,onTimeRate:97,currentLocation:{lat:28.6139,lng:77.2090},activeOrders:4,todayOrders:11,role:"rider",schedule:{start:"10:00",end:"20:00"}},
  {id:6,name:"Neha Gupta",phone:"+91-9876543215",assignedCluster:"Shadowfax Cluster 1",riderId:"SF006",status:"inactive",vehicle:"Bike",totalDeliveries:187,onTimeRate:89,currentLocation:{lat:28.5244,lng:77.1855},activeOrders:0,todayOrders:0,role:"rider",schedule:{start:"08:00",end:"18:00"}},
  {id:7,name:"Vikram Rao",phone:"+91-9876543216",assignedCluster:"Shadowfax Cluster 3",riderId:"SF007",status:"active",vehicle:"Bike",totalDeliveries:301,onTimeRate:93,currentLocation:{lat:28.6700,lng:77.4500},activeOrders:6,todayOrders:13,role:"rider",schedule:{start:"09:00",end:"19:00"}},
  {id:8,name:"Anjali Desai",phone:"+91-9876543217",assignedCluster:"Shadowfax Cluster 2",riderId:"SF008",status:"active",vehicle:"Van",totalDeliveries:289,onTimeRate:94,currentLocation:{lat:28.4800,lng:77.0800},activeOrders:5,todayOrders:12,role:"rider",schedule:{start:"08:00",end:"18:00"}}
];

const CLIENTS_DATA = [
  {id:1,name:"Myntra PPMP",address:"Sector 18, Gurugram",contact:"+91-124-4567890",category:"Myntra PPMP",status:"active",cutoffTime:"10:00 AM",riders:[{id:1,name:"Arjun Sharma"},{id:2,name:"Priya Singh"}],geofence:{center:{lat:28.4595,lng:77.0266},radius:500},pickupType:"SDD",monthlyPickups:450,onTimeRate:96,lat:28.4595,lng:77.0266},
  {id:2,name:"Airport Feeder Hub",address:"Terminal 3, IGI Airport",contact:"+91-11-2567-3000",category:"Airport Feeder",status:"active",cutoffTime:"2:00 PM",riders:[{id:3,name:"Rahul Verma"}],geofence:{center:{lat:28.5562,lng:77.1000},radius:300},pickupType:"AIR",monthlyPickups:380,onTimeRate:94,lat:28.5562,lng:77.1000},
  {id:3,name:"C1 Feeder SDD",address:"Udyog Vihar Phase 1",contact:"+91-124-4321098",category:"C1 Feeder (SDD)",status:"active",cutoffTime:"11:00 AM",riders:[{id:4,name:"Sneha Patel"},{id:5,name:"Amit Kumar"}],geofence:{center:{lat:28.4940,lng:77.0787},radius:600},pickupType:"SDD",monthlyPickups:520,onTimeRate:97,lat:28.4940,lng:77.0787},
  {id:4,name:"Large NDD Feeders",address:"Manesar Industrial Area",contact:"+91-124-2345678",category:"Large NDD Feeders",status:"active",cutoffTime:"8:00 PM",riders:[{id:6,name:"Neha Gupta"}],geofence:{center:{lat:28.3614,lng:76.9311},radius:700},pickupType:"NDD",monthlyPickups:610,onTimeRate:95,lat:28.3614,lng:76.9311},
  {id:5,name:"FM SDD Feeders",address:"DLF Cyber City",contact:"+91-124-6789012",category:"FM SDD Feeders",status:"active",cutoffTime:"12:00 PM",riders:[{id:7,name:"Vikram Rao"},{id:8,name:"Anjali Desai"}],geofence:{center:{lat:28.4950,lng:77.0890},radius:400},pickupType:"SDD",monthlyPickups:490,onTimeRate:93,lat:28.4950,lng:77.0890},
  {id:6,name:"Other Feeders Central",address:"Sohna Road, Sector 47",contact:"+91-124-8901234",category:"Other Feeders",status:"inactive",cutoffTime:"3:00 PM",riders:[],geofence:{center:{lat:28.4089,lng:77.0601},radius:350},pickupType:"AIR",monthlyPickups:0,onTimeRate:0,lat:28.4089,lng:77.0601}
];

const CLUSTERS_DATA = [
  {id:1,name:"Shadowfax Cluster 1",region:"North Delhi",clients:[CLIENTS_DATA[0],CLIENTS_DATA[2]],riders:[RIDERS_DATA[0],RIDERS_DATA[2],RIDERS_DATA[5]],status:"active",capacity:15,currentLoad:8,efficiency:92,avgDeliveryTime:"45 min",coverage:{lat:28.7041,lng:77.1025,radius:5000}},
  {id:2,name:"Shadowfax Cluster 2",region:"South Delhi",clients:[CLIENTS_DATA[1]],riders:[RIDERS_DATA[1],RIDERS_DATA[4],RIDERS_DATA[7]],status:"active",capacity:12,currentLoad:6,efficiency:88,avgDeliveryTime:"52 min",coverage:{lat:28.5355,lng:77.3910,radius:4500}},
  {id:3,name:"Shadowfax Cluster 3",region:"Gurugram",clients:[CLIENTS_DATA[3],CLIENTS_DATA[4]],riders:[RIDERS_DATA[3],RIDERS_DATA[6]],status:"active",capacity:18,currentLoad:12,efficiency:95,avgDeliveryTime:"38 min",coverage:{lat:28.4595,lng:77.0266,radius:6000}}
];

const PICKUPS_DATA = [
  {id:1,clientId:1,clientName:"Myntra PPMP",riderId:1,riderName:"Arjun Sharma",status:"completed",scheduledTime:"10:30 AM",completedTime:"10:25 AM",type:"SDD",packages:12,weight:"45 kg",location:{lat:28.4595,lng:77.0266},delay:0},
  {id:2,clientId:2,clientName:"Airport Feeder Hub",riderId:3,riderName:"Rahul Verma",status:"in-progress",scheduledTime:"2:00 PM",completedTime:null,type:"AIR",packages:8,weight:"32 kg",location:{lat:28.5562,lng:77.1000},delay:0},
  {id:3,clientId:3,clientName:"C1 Feeder SDD",riderId:4,riderName:"Sneha Patel",status:"pending",scheduledTime:"11:00 AM",completedTime:null,type:"SDD",packages:15,weight:"58 kg",location:{lat:28.4940,lng:77.0787},delay:5},
  {id:4,clientId:4,clientName:"Large NDD Feeders",riderId:6,riderName:"Neha Gupta",status:"delayed",scheduledTime:"8:00 PM",completedTime:null,type:"NDD",packages:20,weight:"78 kg",location:{lat:28.3614,lng:76.9311},delay:15},
  {id:5,clientId:5,clientName:"FM SDD Feeders",riderId:7,riderName:"Vikram Rao",status:"completed",scheduledTime:"12:00 PM",completedTime:"11:55 AM",type:"SDD",packages:10,weight:"38 kg",location:{lat:28.4950,lng:77.0890},delay:0}
];

/* ═══════════════════ NAV & TITLES ═══════════════════ */
const NAV = [
  { id:"dashboard", icon:LayoutDashboard, label:"Dashboard", roles:["admin", "supervisor", "rider"] },
  { id:"import",    icon:Upload,          label:"Daily Import", roles:["admin", "supervisor"] },
  { id:"clients",   icon:Building2,       label:"Client Master", roles:["admin", "supervisor"] },
  { id:"clusters",  icon:GitFork,         label:"Cluster Board", roles:["admin", "supervisor"] },
  { id:"riders",    icon:Users,           label:"Rider Management", roles:["admin", "supervisor"] },
  { id:"live",      icon:Map,             label:"Live Tracking", roles:["admin", "supervisor", "rider"] },
  { id:"reports",   icon:BarChart2,       label:"Reports", roles:["admin", "supervisor"] },
  { id:"users",     icon:Shield,          label:"User Management", roles:["admin"] }
];

const TITLES = {
  dashboard:"Dashboard", import:"Daily Import", clients:"Client Master", clusters:"Cluster Board",
  riders:"Rider Management", live:"Live Tracking", reports:"Reports", users:"User Management"
};


/* ═══════════════════ DASHBOARD COMPONENT ═══════════════════ */
function Dashboard({ clients = [], clusters = [], riders = [], pickups = [] }) {
  const stats = useMemo(() => {
    const activeClients = clients.filter(c => c.status === "active").length;
    const activeRiders = riders.filter(r => r.status === "active").length;
    const completedPickups = pickups.filter(p => p.status === "completed").length;
    const pendingPickups = pickups.filter(p => p.status === "pending" || p.status === "in-progress").length;
    const onTimeDeliveries = pickups.filter(p => p.status === "completed" && p.delay === 0).length;
    const onTimeRate = completedPickups > 0 ? Math.round((onTimeDeliveries / completedPickups) * 100) : 0;
    
    return [
      { label: "Active Clients", value: activeClients, icon: Building2, color: "#F59E0B", trend: "+12%" },
      { label: "Active Riders", value: activeRiders, icon: Users, color: "#06B6D4", trend: "+8%" },
      { label: "Today's Pickups", value: completedPickups, icon: Package, color: "#10B981", trend: "+15%" },
      { label: "On-Time Rate", value: `${onTimeRate}%`, icon: Clock, color: "#6366F1", trend: "+3%" }
    ];
  }, [clients, riders, pickups]);

  const chartData = [
    { name: "Mon", SDD: 65, AIR: 28, NDD: 45 },
    { name: "Tue", SDD: 78, AIR: 35, NDD: 52 },
    { name: "Wed", SDD: 85, AIR: 42, NDD: 48 },
    { name: "Thu", SDD: 72, AIR: 38, NDD: 55 },
    { name: "Fri", SDD: 90, AIR: 45, NDD: 60 },
    { name: "Sat", SDD: 68, AIR: 32, NDD: 42 },
    { name: "Sun", SDD: 55, AIR: 25, NDD: 35 }
  ];

  const typeData = [
    { name: "SDD", value: 513, color: MODELS.SDD.color },
    { name: "AIR", value: 245, color: MODELS.AIR.color },
    { name: "NDD", value: 337, color: MODELS.NDD.color }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}20` }}>
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
              <span className="text-sm font-medium text-green-600">{stat.trend}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Pickup Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "none", borderRadius: "8px", color: "#fff" }} />
              <Legend />
              <Area type="monotone" dataKey="SDD" stackId="1" stroke={MODELS.SDD.color} fill={MODELS.SDD.color} fillOpacity={0.6} />
              <Area type="monotone" dataKey="AIR" stackId="1" stroke={MODELS.AIR.color} fill={MODELS.AIR.color} fillOpacity={0.6} />
              <Area type="monotone" dataKey="NDD" stackId="1" stroke={MODELS.NDD.color} fill={MODELS.NDD.color} fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pickup Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={typeData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label>
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Pickups</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Packages</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pickups.slice(0, 5).map(pickup => (
                <tr key={pickup.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{pickup.clientName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{pickup.riderName}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: MODELS[pickup.type].bg, color: MODELS[pickup.type].text }}>
                      {MODELS[pickup.type].icon} {pickup.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      pickup.status === "completed" ? "bg-green-100 text-green-800" :
                      pickup.status === "in-progress" ? "bg-blue-100 text-blue-800" :
                      pickup.status === "delayed" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {pickup.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{pickup.completedTime || pickup.scheduledTime}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{pickup.packages}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ CLIENT MASTER COMPONENT ═══════════════════ */
function ClientMaster({ clients, setClients, clusters }) {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.address.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "all" || c.category === filterCategory;
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this client?")) {
      setClients(clients.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Client Master</h2>
          <p className="text-gray-500">Manage pickup locations and client details</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-400 text-gray-900 rounded-lg hover:bg-amber-500 font-medium">
          <Plus className="w-5 h-5" />
          Add Client
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
          </div>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent">
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map(client => (
          <div key={client.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${client.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {client.status}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: MODELS[client.pickupType].bg, color: MODELS[client.pickupType].text }}>
                    {MODELS[client.pickupType].icon} {client.pickupType}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="text-gray-400">Address:</span> {client.address}
                  </div>
                  <div>
                    <span className="text-gray-400">Category:</span> {client.category}
                  </div>
                  <div>
                    <span className="text-gray-400">Cutoff:</span> {client.cutoffTime}
                  </div>
                  <div>
                    <span className="text-gray-400">Monthly Pickups:</span> {client.monthlyPickups}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{client.riders.length} Riders</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{client.onTimeRate}% On-Time</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingClient(client)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg">
                  <Edit2 className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(client.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════ CLUSTER BOARD COMPONENT ═══════════════════ */
function ClusterBoard({ clients = [], clusters = [], setClusters, riders = [] }) {
  const [selectedCluster, setSelectedCluster] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Cluster Board</h2>
        <p className="text-gray-500">Manage rider clusters and assignments</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {clusters.map(cluster => (
          <div key={cluster.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedCluster(cluster)}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{cluster.name}</h3>
                <p className="text-sm text-gray-500">{cluster.region}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${cluster.currentLoad / cluster.capacity > 0.8 ? "bg-red-100" : "bg-green-100"}`}>
                <GitFork className={`w-6 h-6 ${cluster.currentLoad / cluster.capacity > 0.8 ? "text-red-600" : "text-green-600"}`} />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Capacity</span>
                  <span className="font-medium text-gray-900">{cluster.currentLoad}/{cluster.capacity}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-amber-500 rounded-full" style={{ width: `${(cluster.currentLoad / cluster.capacity) * 100}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                <div>
                  <div className="text-xs text-gray-500">Clients</div>
                  <div className="text-lg font-semibold text-gray-900">{cluster.clients.length}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Riders</div>
                  <div className="text-lg font-semibold text-gray-900">{cluster.riders.length}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Efficiency</div>
                  <div className="text-lg font-semibold text-green-600">{cluster.efficiency}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Avg Time</div>
                  <div className="text-lg font-semibold text-gray-900">{cluster.avgDeliveryTime}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════ RIDER MANAGEMENT COMPONENT ═══════════════════ */
function RiderManagement({ riders, setRiders }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = riders.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.riderId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rider Management</h2>
          <p className="text-gray-500">Monitor and manage delivery riders</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-400 text-gray-900 rounded-lg hover:bg-amber-500 font-medium">
          <Plus className="w-5 h-5" />
          Add Rider
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search riders..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cluster</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map(rider => (
                <tr key={rider.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold">
                        {rider.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{rider.name}</div>
                        <div className="text-sm text-gray-500">{rider.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">{rider.riderId}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{rider.assignedCluster}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {rider.vehicle}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${rider.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {rider.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{rider.activeOrders}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${rider.onTimeRate}%` }} />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{rider.onTimeRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ LIVE MAP COMPONENT ═══════════════════ */
function LiveMap({ riders = [], clients = [], pickups = [] }) {
  const mapRef = useRef(null);
  const [selectedRider, setSelectedRider] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (mapLoaded && mapRef.current && window.google) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 28.6139, lng: 77.2090 },
        zoom: 11,
        styles: [
          { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
        ]
      });

      riders.filter(r => r.status === "active").forEach(rider => {
        const marker = new window.google.maps.Marker({
          position: rider.currentLocation,
          map: map,
          title: rider.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#F59E0B",
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 2
          }
        });

        marker.addListener("click", () => {
          setSelectedRider(rider);
        });
      });

      clients.forEach(client => {
        new window.google.maps.Marker({
          position: { lat: client.lat, lng: client.lng },
          map: map,
          title: client.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: MODELS[client.pickupType].color,
            fillOpacity: 0.8,
            strokeColor: "#fff",
            strokeWeight: 2
          }
        });
      });
    }
  }, [mapLoaded, riders, clients]);

  const activeRiders = riders.filter(r => r.status === "active");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Live Tracking</h2>
        <p className="text-gray-500">Real-time rider locations and active deliveries</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ height: "600px" }}>
            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Active Riders ({activeRiders.length})</h3>
            <div className="space-y-2 max-h-[550px] overflow-y-auto">
              {activeRiders.map(rider => (
                <div key={rider.id} onClick={() => setSelectedRider(rider)} className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedRider?.id === rider.id ? "border-amber-400 bg-amber-50" : "border-gray-200 hover:border-amber-300"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-semibold">
                      {rider.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">{rider.name}</div>
                      <div className="text-xs text-gray-500">{rider.riderId}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Active Orders</span>
                      <span className="font-medium text-gray-900">{rider.activeOrders}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Today</span>
                      <span className="font-medium text-gray-900">{rider.todayOrders}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ REPORTS COMPONENT ═══════════════════ */
function Reports() {
  const performanceData = [
    { date: "Jan 15", sdd: 85, air: 72, ndd: 88 },
    { date: "Jan 16", sdd: 88, air: 75, ndd: 90 },
    { date: "Jan 17", sdd: 82, air: 78, ndd: 85 },
    { date: "Jan 18", sdd: 90, air: 80, ndd: 92 },
    { date: "Jan 19", sdd: 87, air: 82, ndd: 89 },
    { date: "Jan 20", sdd: 92, air: 85, ndd: 94 },
    { date: "Jan 21", sdd: 89, air: 83, ndd: 91 }
  ];

  const categoryData = [
    { category: "Myntra PPMP", pickups: 450, onTime: 96 },
    { category: "Airport Feeder", pickups: 380, onTime: 94 },
    { category: "C1 Feeder (SDD)", pickups: 520, onTime: 97 },
    { category: "Large NDD Feeders", pickups: 610, onTime: 95 },
    { category: "FM SDD Feeders", pickups: 490, onTime: 93 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <p className="text-gray-500">Performance insights and trends</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-sm text-gray-500 mb-1">Total Pickups</div>
          <div className="text-3xl font-bold text-gray-900">2,450</div>
          <div className="text-sm text-green-600 mt-1">↑ 12% vs last month</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-sm text-gray-500 mb-1">Avg On-Time Rate</div>
          <div className="text-3xl font-bold text-gray-900">95.2%</div>
          <div className="text-sm text-green-600 mt-1">↑ 2.1% improvement</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-sm text-gray-500 mb-1">Active Clients</div>
          <div className="text-3xl font-bold text-gray-900">342</div>
          <div className="text-sm text-green-600 mt-1">↑ 18 new clients</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-sm text-gray-500 mb-1">Rider Efficiency</div>
          <div className="text-3xl font-bold text-gray-900">93.8%</div>
          <div className="text-sm text-green-600 mt-1">↑ 1.5% increase</div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">On-Time Performance Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "none", borderRadius: "8px", color: "#fff" }} />
            <Legend />
            <Area type="monotone" dataKey="sdd" stroke={MODELS.SDD.color} fill={MODELS.SDD.color} fillOpacity={0.2} name="SDD" />
            <Area type="monotone" dataKey="air" stroke={MODELS.AIR.color} fill={MODELS.AIR.color} fillOpacity={0.2} name="AIR" />
            <Area type="monotone" dataKey="ndd" stroke={MODELS.NDD.color} fill={MODELS.NDD.color} fillOpacity={0.2} name="NDD" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Performance by Category</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monthly Pickups</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">On-Time Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categoryData.map((cat, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{cat.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cat.pickups}</td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600">{cat.onTime}%</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-xs">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${cat.onTime}%` }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ MAIN APP COMPONENT ═══════════════════ */
function MainApp({ user, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [clients, setClients] = useState(CLIENTS_DATA);
  const [clusters, setClusters] = useState(CLUSTERS_DATA);
  const [riders, setRiders] = useState(RIDERS_DATA);
  const [pickups, setPickups] = useState(PICKUPS_DATA);

  const visibleNav = NAV.filter(item => item.roles.includes(user.role));

  const content = {
    dashboard: <Dashboard clients={clients} clusters={clusters} riders={riders} pickups={pickups} />,
    import:    <FileImport supabase={supabase} onImportSuccess={(validRows, pickupType) => console.log(`Imported ${validRows.length} ${pickupType} assignments`)} />,
    clients:   <ClientMaster clients={clients} setClients={setClients} clusters={clusters} />,
    clusters:  <ClusterBoard clients={clients} clusters={clusters} setClusters={setClusters} riders={riders} />,
    riders:    <RiderManagement riders={riders} setRiders={setRiders} />,
    live:      <LiveMap riders={riders} clients={clients} pickups={pickups} />,
    reports:   <Reports />,
    users:     <UserManagement />
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-[#0C111D] border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-lg">PickupOS</div>
              <div className="text-gray-400 text-xs">SHADOWFAX · NCR · MIDDLE MILE OPS</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
            OPERATIONS
          </div>
          {visibleNav.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex gap-2 mb-3">
            <button className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 text-gray-300">
              ADMIN
            </button>
            <button className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-400 text-gray-900">
              SUPERVISOR
            </button>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold text-sm">
              AS
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">Arjun Sharma</div>
              <div className="text-xs text-gray-400">Team Director</div>
            </div>
            <button onClick={onLogout} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Shadowfax · NCR · Middle Mile Ops</div>
              <h1 className="text-2xl font-bold text-gray-900">{TITLES[activePage]}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent w-80"
                />
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">05:14 pm</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium">
                <Shield className="w-4 h-4" />
                <span>SUPERVISOR</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Kuldeep Kumar</span>
                <div className="text-xs text-gray-500">user851518@shadowfax.in</div>
              </div>
              <button onClick={onLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium text-sm flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8">
          {content[activePage]}
        </main>
      </div>
    </div>
  );
}

/* ═══════════════════ ROOT COMPONENT ═══════════════════ */
export default function PickupOSDesktop() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <LoginPage onLogin={setUser} supabase={supabase} />;
  }

  return <MainApp user={user} onLogout={() => setUser(null)} />;
}

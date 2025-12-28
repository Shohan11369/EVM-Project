import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  LabelList
} from "recharts";
import { Card, Typography, Box, Grid } from "@mui/material";
import { BarChart3, Users } from "lucide-react";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

function AdminDashboard() {
  const [data, setData] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchResults = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/voter/results?t=${new Date().getTime()}`
        );
        const result = await res.json();
        if (result.success && isMounted) {
          setData(result.results);
          const total = result.results.reduce((acc, curr) => acc + curr.count, 0);
          setTotalVotes(total);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchResults();
    const interval = setInterval(fetchResults, 10000); 
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-slate-50 overflow-x-hidden">
      
      {/* Header section */}
      <div className="bg-white border-b p-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <BarChart3 size={24} />
          </div>
          <Typography variant="h5" className="font-black text-gray-800 uppercase tracking-tight">
            Election Results (নির্বাচনী ফলাফল)
          </Typography>
        </div>

        <div className="bg-indigo-50 text-indigo-700 px-6 py-2 rounded-2xl font-bold flex items-center gap-3 border border-indigo-100">
          <Users size={30} />
          <div className="flex flex-col">
            <span className="text-[20px] text-black uppercase ">Total Votes</span>
            <div className="text-xl text-black font-extrabold leading-none mt-4">{totalVotes}</div>
          </div>
        </div>
      </div>

      {/* main chart */}
      <div className="w-full p-0">
        <Card className="rounded-none border-none shadow-none bg-white w-full">
         
          <Box className="h-[700px] w-full pt-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                
                margin={{ top: 30, right: 30, left: 0, bottom: 120 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                
                <XAxis
                  dataKey="_id"
                  tick={{ fill: "#4b5563", fontWeight: "bold", fontSize: 14 }}
                  interval={0}       
                  angle={-25}         
                  textAnchor="end"   
                  height={100}        
                  axisLine={false}
                  tickLine={false}
                />
                
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#94a3b8", fontWeight: "bold" }}
                  axisLine={false}
                  tickLine={false}
                />
                
                <Tooltip 
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />

                <Bar dataKey="count" radius={[15, 15, 0, 0]} barSize={100}>
                  {/* number*/}
                  <LabelList 
                    dataKey="count" 
                    position="top" 
                    offset={10}
                    style={{ fill: '#4b5563', fontWeight: 'bold', fontSize: '16px' }} 
                  />
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      </div>

      {/* info card*/}
      <div className="p-8">
        <Grid container spacing={3}>
          {data.map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card className="p-6 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center bg-white transition-transform hover:scale-105">
                <div>
                  <Typography className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                    {item._id}
                  </Typography>
                  <Typography variant="h4" className="font-black text-slate-800">
                    {item.count} <span className="text-sm font-normal text-slate-400 uppercase">Votes</span>
                  </Typography>
                </div>
                <div className="h-12 w-2 rounded-full" 
                     style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  );
}

export default AdminDashboard;
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, Typography, Box, Grid } from "@mui/material";
import { BarChart3, Users } from "lucide-react";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

function AdminDashboard() {
  const [data, setData] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/voter/results");
        const result = await res.json();
        if (result.success) {
          setData(result.results);
          const total = result.results.reduce(
            (acc, curr) => acc + curr.count,
            0
          );
          setTotalVotes(total);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchResults();
    const interval = setInterval(fetchResults, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between mb-8">
        <Typography variant="h4" className="font-black text-gray-800">
          Election Dashboard (নির্বাচনী ড্যাশবোর্ড)
        </Typography>

        <div className="bg-indigo-100 text-black px-6 py-2 rounded-2xl font-bold flex items-center gap-2">
          <Users size={40} />
          Total Votes (মোট ভোট):
          <div className="text-2xl font-extrabold text-black">{totalVotes}</div>
        </div>
      </div>

      <Grid container spacing={4}>
        {/* Bar Chart */}
        <Grid item xs={12}>
          <Card className="p-8 rounded-[2rem] shadow-xl border-none bg-white">
            <div className="flex items-center gap-2 mb-8">
              <BarChart3 className="text-indigo-600" />
              <Typography variant="h6" className="font-bold">
                Live Voting Result Chart ( লাইভ ভোটের ফলাফল গ্রাফ)
              </Typography>
            </div>

            <Box className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis dataKey="_id" />
                  <YAxis allowDecimals={false} />
                  <Tooltip cursor={{ fill: "transparent" }} />
                  <Bar dataKey="count" radius={[10, 10, 0, 0]}>
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
        </Grid>

        {/* Candidate Cards */}
        <Grid item xs={12}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.map((item, index) => (
              <Card
                key={index}
                className="p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center"
              >
                <div>
                  <Typography className="text-gray-500 text-sm uppercase font-bold tracking-wider">
                    {item._id} (Candidate)
                  </Typography>
                  <Typography variant="h4" className="font-black text-gray-800">
                    {item.count} Votes
                  </Typography>
                </div>

                <div
                  className="w-3 h-12 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
              </Card>
            ))}
          </div>
        </Grid>
      </Grid>
    </div>
  );
}

export default AdminDashboard;

import React, { useState, useEffect } from "react";
import { Search, Users, Loader2 } from "lucide-react";

function VoterList() {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchVoters = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/voter/all");
        const data = await res.json();
        if (data.success) setVoters(data.voters);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVoters();
  }, []);

  const filteredVoters = voters.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.voterId.includes(searchTerm.toUpperCase())
  );

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-xl min-h-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h2 className="text-3xl font-black text-gray-800">Voter List</h2>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search with name or id..."
            className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-indigo-500"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin text-indigo-600" size={48} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-100 text-gray-400 uppercase text-sm tracking-wider">
                <th className="px-4 py-4">Voter Name</th>
                <th className="px-4 py-4">NID Number</th>
                <th className="px-4 py-4">Division</th>
                <th className="px-4 py-4 text-center">Image</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredVoters.map((v, i) => (
                <tr key={i} className="hover:bg-indigo-50 transition-colors">
                  <td className="px-4 py-5 font-bold text-gray-700">
                    {v.name}
                  </td>
                  <td className="px-4 py-5 font-mono text-indigo-600 font-bold">
                    {v.voterId}
                  </td>
                  <td className="px-4 py-5 text-gray-500">{v.division}</td>
                  <td className="px-4 py-5">
                    <div className="flex justify-center">
                      <img
                        src={v.image}
                        className="w-20 h-20 rounded-xl object-cover shadow-sm ring-2 ring-white"
                        alt="voter"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default VoterList;

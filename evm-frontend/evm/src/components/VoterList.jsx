import React, { useState, useEffect } from "react";
import { Search, Users, Loader2, CreditCard, MapPin } from "lucide-react";

function VoterList() {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchVoters = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/voter/all?t=${new Date().getTime()}`
        );
        const data = await res.json();
        if (data.success && isMounted) setVoters(data.voters);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchVoters();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredVoters = voters.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.voterId.includes(searchTerm.toUpperCase())
  );

  return (
    <div className="bg-white p-4 md:p-8 rounded-2xl md:rounded-[2rem] shadow-xl min-h-full">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 gap-4">
        <h2 className="text-2xl md:text-3xl font-black text-gray-800 flex items-center gap-2">
          <Users className="text-indigo-600 md:hidden" size={24} />
          Voter List
        </h2>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search name or ID..."
            className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-gray-200 rounded-xl md:rounded-2xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 md:p-20 gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={48} />
          <p className="text-gray-500 font-bold animate-pulse">
            Loading Voters...
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View (Visible on md screens and up) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-gray-400 uppercase text-xs tracking-wider">
                  <th className="px-6 py-4">Voter Name</th>
                  <th className="px-6 py-4">NID Number</th>
                  <th className="px-6 py-4">Division</th>
                  <th className="px-6 py-4 text-center">Image</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredVoters.map((v, i) => (
                  <tr
                    key={i}
                    className="hover:bg-indigo-50/50 transition-colors group"
                  >
                    <td className="px-6 py-5 font-bold text-gray-700">
                      {v.name}
                    </td>
                    <td className="px-6 py-5 font-mono text-indigo-600 font-bold">
                      {v.voterId}
                    </td>
                    <td className="px-6 py-5 text-gray-500">{v.division}</td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <img
                          src={v.image}
                          className="w-14 h-14 rounded-xl object-cover shadow-sm ring-2 ring-white group-hover:ring-indigo-200 transition-all"
                          alt="voter"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (Visible only on small screens) */}
          <div className="md:hidden space-y-4">
            {filteredVoters.length > 0 ? (
              filteredVoters.map((v, i) => (
                <div
                  key={i}
                  className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-4"
                >
                  <img
                    src={v.image}
                    className="w-20 h-20 rounded-xl object-cover shadow-md shrink-0"
                    alt="voter"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 truncate">
                      {v.name}
                    </h3>
                    <div className="flex items-center gap-2 text-indigo-600 font-mono text-sm font-bold mt-1">
                      <CreditCard size={14} />
                      {v.voterId}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-xs mt-1">
                      <MapPin size={14} />
                      {v.division}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400 font-medium">
                No voters found matching your search.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default VoterList;

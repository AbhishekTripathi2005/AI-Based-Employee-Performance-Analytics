import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaSort, FaUserTie, FaChartLine } from 'react-icons/fa';
import { motion } from 'framer-motion';

const EmployeeList = ({ API_BASE, token }) => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [sortBy, setSortBy] = useState('performanceScore');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_BASE}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSorted = [...employees]
    .filter(emp => 
      (emp.name.toLowerCase().includes(search.toLowerCase()) ||
       emp.email.toLowerCase().includes(search.toLowerCase())) &&
      (filterDept === '' || emp.department === filterDept)
    )
    .sort((a, b) => {
      if (sortBy === 'performanceScore') return b.performanceScore - a.performanceScore;
      if (sortBy === 'experience') return b.experience - a.experience;
      return 0;
    });

  const departments = [...new Set(employees.map(emp => emp.department))];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <FaUserTie /> Employee Directory
          </h1>
          <p className="text-gray-400 mt-2">Real-time performance analytics</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-2xl w-80 focus:outline-none focus:border-purple-500 text-white"
            />
          </div>

          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-2xl px-4 text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-2xl px-4 text-white focus:outline-none focus:border-purple-500"
          >
            <option value="performanceScore">Sort by Score</option>
            <option value="experience">Sort by Experience</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg text-purple-500"></span>
        </div>
      ) : (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-700">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-950">
                <th className="p-5 text-left text-purple-400">Employee</th>
                <th className="p-5 text-left">Department</th>
                <th className="p-5 text-left">Skills</th>
                <th className="p-5 text-center">Performance</th>
                <th className="p-5 text-center">Experience</th>
                {/* <th className="p-5 text-center">Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((emp, index) => (
                <motion.tr
                  key={emp._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-800 hover:bg-gray-800/50 transition-all"
                >
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{emp.name}</p>
                        <p className="text-sm text-gray-400">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="badge badge-primary badge-outline">{emp.department}</span>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-wrap gap-2">
                      {emp.skills.map((skill, i) => (
                        <span key={i} className="text-xs bg-gray-800 px-3 py-1 rounded-full text-gray-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-lg
                      ${emp.performanceScore >= 85 ? 'bg-green-500/20 text-green-400' : 
                        emp.performanceScore >= 70 ? 'bg-yellow-500/20 text-yellow-400' : 
                        'bg-red-500/20 text-red-400'}`}>
                      {emp.performanceScore}
                      <FaChartLine />
                    </div>
                  </td>
                  <td className="p-5 text-center text-gray-300">
                    {emp.experience} Years
                  </td>
                  {/* <td className="p-5 text-center">
                    <button className="btn btn-sm btn-outline btn-accent"></button>
                  </td> */}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default EmployeeList;
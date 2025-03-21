import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';


const AdminDashboard = () => {
  const { 
    users, 
    activities, 
    rewards, 
    redemptions,
    currentUser, 
    loading, 
    error 
  } = useAppContext();

  const [activeTab, setActiveTab] = useState('users');

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!currentUser) return <div className="text-center">No user selected</div>;
  
  // Check if user is admin
  if (currentUser.role !== 'admin') {
    return (
      <div className="alert alert-danger">
        You do not have permission to access this page
      </div>
    );
  }

  // Count total points in the system
  const totalPoints = users.reduce((sum, user) => sum + user.points, 0);
  
  // Count total rewards redeemed
  const totalRedeemed = redemptions.length;
  
  // Calculate pending redemptions
  const pendingRedemptions = redemptions.filter(
    redemption => redemption.status === 'pending'
  ).length;

  // Get most popular reward
  const rewardCounts = redemptions.reduce((acc, redemption) => {
    acc[redemption.rewardId] = (acc[redemption.rewardId] || 0) + 1;
    return acc;
  }, {});
  
  let mostPopularRewardId = null;
  let maxCount = 0;
  
  Object.entries(rewardCounts).forEach(([rewardId, count]) => {
    if (count > maxCount) {
      mostPopularRewardId = parseInt(rewardId);
      maxCount = count;
    }
  });
  
  const mostPopularReward = rewards.find(r => r.id === mostPopularRewardId);

  return (
    <div>
      <h1 className="mb-4">Admin Dashboard</h1>
      
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="dashboard-stat-card bg-primary text-white">
            <h3>{users.length}</h3>
            <p className="mb-0">Total Users</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="dashboard-stat-card bg-success text-white">
            <h3>{totalPoints}</h3>
            <p className="mb-0">Total Points</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="dashboard-stat-card bg-warning text-dark">
            <h3>{totalRedeemed}</h3>
            <p className="mb-0">Total Redemptions</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="dashboard-stat-card bg-info text-white">
            <h3>{pendingRedemptions}</h3>
            <p className="mb-0">Pending Approvals</p>
          </div>
        </div>
      </div>
      
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Quick Stats</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p><strong>Most Active User:</strong> {
                users.sort((a, b) => {
                  const aCount = activities.filter(act => act.userId === a.id).length;
                  const bCount = activities.filter(act => act.userId === b.id).length;
                  return bCount - aCount;
                })[0]?.name || 'None'
              }</p>
              <p><strong>Total Activities Logged:</strong> {activities.length}</p>
              <p><strong>Average Points Per User:</strong> {
                users.length ? Math.round(totalPoints / users.length) : 0
              }</p>
            </div>
            <div className="col-md-6">
              <p><strong>Most Popular Reward:</strong> {mostPopularReward?.title || 'None'}</p>
              <p><strong>Total Rewards Available:</strong> {
                rewards.filter(r => r.available).length
              }</p>
              <p><strong>Recent Redemptions (Last 7 Days):</strong> {
                redemptions.filter(r => {
                  const date = new Date(r.timestamp);
                  const now = new Date();
                  const diffTime = Math.abs(now - date);
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays <= 7;
                }).length
              }</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                Users
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'rewards' ? 'active' : ''}`}
                onClick={() => setActiveTab('rewards')}
              >
                Rewards
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'redemptions' ? 'active' : ''}`}
                onClick={() => setActiveTab('redemptions')}
              >
                Redemptions
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body">
          {activeTab === 'users' && (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Points</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.points}</td>
                      <td>{user.role}</td>
                      <td>
                        <button className="btn btn-sm btn-primary me-2">Edit</button>
                        <button className="btn btn-sm btn-danger">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Points</th>
                    <th>Available</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rewards.map(reward => (
                    <tr key={reward.id}>
                      <td>{reward.id}</td>
                      <td>{reward.title}</td>
                      <td>{reward.description}</td>
                      <td>{reward.pointCost}</td>
                      <td>
                        <span className={`badge ${reward.available ? 'bg-success' : 'bg-danger'}`}>
                          {reward.available ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-primary me-2">Edit</button>
                        <button className="btn btn-sm btn-danger">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'redemptions' && (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Reward</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptions.map(redemption => {
                    const user = users.find(u => u.id === redemption.userId);
                    const reward = rewards.find(r => r.id === redemption.rewardId);
                    return (
                      <tr key={redemption.id}>
                        <td>{redemption.id}</td>
                        <td>{user ? user.name : 'Unknown'}</td>
                        <td>{reward ? reward.title : 'Unknown'}</td>
                        <td>{new Date(redemption.timestamp).toLocaleString()}</td>
                        <td>
                          <span className={`badge redemption-${redemption.status}`}>
                            {redemption.status}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group">
                            <button className="btn btn-sm btn-success me-2">Approve</button>
                            <button className="btn btn-sm btn-danger">Deny</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
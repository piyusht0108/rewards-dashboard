import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Dashboard = () => {
  const { 
    currentUser, 
    activities, 
    rewards, 
    redemptions,
    loading,
    error
  } = useAppContext();

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!currentUser) return <div className="text-center">No user selected</div>;

  // Get user's activities
  const userActivities = activities.filter(activity => 
    activity.userId === currentUser.id
  ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Get user's redemptions
  const userRedemptions = redemptions.filter(redemption => 
    redemption.userId === currentUser.id
  ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Calculate total points earned
  const totalPointsEarned = userActivities.reduce(
    (sum, activity) => sum + activity.points, 
    0
  );

  // Calculate total points spent
  const totalPointsSpent = userRedemptions.reduce((sum, redemption) => {
    const reward = rewards.find(r => r.id === redemption.rewardId);
    return sum + (reward ? reward.pointCost : 0);
  }, 0);

  // Get recent activities (last 3)
  const recentActivities = userActivities.slice(0, 3);

  // Get recent redemptions (last 3)
  const recentRedemptions = userRedemptions.slice(0, 3);

  return (
    <div>
      <h1 className="mb-4">Welcome, {currentUser.name}!</h1>
      
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="dashboard-stat-card bg-primary text-white">
            <h3>{currentUser.points}</h3>
            <p className="mb-0">Available Points</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="dashboard-stat-card bg-success text-white">
            <h3>{totalPointsEarned}</h3>
            <p className="mb-0">Total Points Earned</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="dashboard-stat-card bg-info text-white">
            <h3>{totalPointsSpent}</h3>
            <p className="mb-0">Total Points Spent</p>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Activities</h5>
              <Link to="/activities" className="btn btn-sm btn-outline-primary">View All</Link>
            </div>
            <div className="card-body">
              {recentActivities.length > 0 ? (
                recentActivities.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <h6>{activity.title}</h6>
                    <p className="text-muted mb-1">{activity.description}</p>
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">
                        {new Date(activity.timestamp).toLocaleString()}
                      </small>
                      <span className="badge bg-success">+{activity.points} points</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted">No recent activities</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Redemptions</h5>
              <Link to="/rewards" className="btn btn-sm btn-outline-primary">View Rewards</Link>
            </div>
            <div className="card-body">
              {recentRedemptions.length > 0 ? (
                recentRedemptions.map(redemption => {
                  const reward = rewards.find(r => r.id === redemption.rewardId);
                  return (
                    <div key={redemption.id} className="activity-item">
                      <h6>{reward ? reward.title : 'Unknown Reward'}</h6>
                      <div className="d-flex justify-content-between">
                        <small className="text-muted">
                          {new Date(redemption.timestamp).toLocaleString()}
                        </small>
                        <span className={`badge redemption-${redemption.status}`}>
                          {redemption.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-muted">No recent redemptions</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
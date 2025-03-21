import React from 'react';
import { useAppContext } from '../context/AppContext';

const UserProfile = () => {
  const { 
    currentUser, 
    activities, 
    rewards, 
    redemptions,
    users,
    loading, 
    error 
  } = useAppContext();

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!currentUser) return <div className="text-center">No user selected</div>;

  // Get user's activities
  const userActivities = activities
    .filter(activity => activity.userId === currentUser.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Get user's redemptions
  const userRedemptions = redemptions
    .filter(redemption => redemption.userId === currentUser.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Create a leaderboard
  const leaderboard = [...users]
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);
  
  const userRank = users
    .sort((a, b) => b.points - a.points)
    .findIndex(user => user.id === currentUser.id) + 1;

  return (
    <div>
      <h1 className="mb-4">My Profile</h1>
      
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">User Information</h5>
              <p><strong>Name:</strong> {currentUser.name}</p>
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p>
                <strong>Available Points:</strong>{' '}
                <span className="points-badge">{currentUser.points}</span>
              </p>
              <p><strong>Ranking:</strong> #{userRank} out of {users.length}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Leaderboard</h5>
            </div>
            <div className="card-body">
              {leaderboard.map((user, index) => (
                <div 
                  key={user.id} 
                  className={`leaderboard-item ${user.id === currentUser.id ? 'bg-light' : ''}`}
                >
                  <div className="leaderboard-rank">{index + 1}</div>
                  <div className="flex-grow-1">
                    <strong>{user.name}</strong>
                    {user.id === currentUser.id && <span className="ms-2">(You)</span>}
                  </div>
                  <div>
                    <span className="badge bg-success">{user.points} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Points Transaction History</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Type</th>
                      <th>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Combine activities and redemptions for a complete history */}
                    {[
                      ...userActivities.map(activity => ({
                        id: `activity-${activity.id}`,
                        date: new Date(activity.timestamp),
                        description: activity.title,
                        detail: activity.description,
                        type: 'Earned',
                        points: activity.points
                      })),
                      ...userRedemptions.map(redemption => {
                        const reward = rewards.find(r => r.id === redemption.rewardId);
                        return {
                          id: `redemption-${redemption.id}`,
                          date: new Date(redemption.timestamp),
                          description: reward ? `Redeemed: ${reward.title}` : 'Unknown Redemption',
                          detail: redemption.status,
                          type: 'Spent',
                          points: reward ? -reward.pointCost : 0
                        };
                      })
                    ]
                      .sort((a, b) => b.date - a.date)
                      .map(transaction => (
                        <tr key={transaction.id}>
                          <td>{transaction.date.toLocaleString()}</td>
                          <td>
                            <div>{transaction.description}</div>
                            <small className="text-muted">{transaction.detail}</small>
                          </td>
                          <td>{transaction.type}</td>
                          <td className={transaction.points >= 0 ? 'text-success' : 'text-danger'}>
                            {transaction.points >= 0 ? '+' : ''}{transaction.points}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const RewardsList = () => {
  const { 
    rewards, 
    currentUser,
    redemptions, 
    redeemReward,
    loading, 
    error 
  } = useAppContext();

  const [sortOption, setSortOption] = useState('pointsAsc');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRedemptionHistory, setShowRedemptionHistory] = useState(false);

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!currentUser) return <div className="text-center">No user selected</div>;

  // Filter rewards based on search term
  let filteredRewards = rewards.filter(reward => reward.available);
  
  if (searchTerm) {
    filteredRewards = filteredRewards.filter(
      reward => 
        reward.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  // Sort rewards
  switch (sortOption) {
    case 'pointsAsc':
      filteredRewards = filteredRewards.sort((a, b) => a.pointCost - b.pointCost);
      break;
    case 'pointsDesc':
      filteredRewards = filteredRewards.sort((a, b) => b.pointCost - a.pointCost);
      break;
    case 'nameAsc':
      filteredRewards = filteredRewards.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'nameDesc':
      filteredRewards = filteredRewards.sort((a, b) => b.title.localeCompare(a.title));
      break;
    default:
      break;
  }

  // Get user's redemption history
  const userRedemptions = redemptions
    .filter(redemption => redemption.userId === currentUser.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Handle reward redemption
  const handleRedeemReward = async (rewardId) => {
    const reward = rewards.find(r => r.id === rewardId);
    
    if (!reward) {
      alert('Reward not found');
      return;
    }
    
    if (currentUser.points < reward.pointCost) {
      alert('Not enough points to redeem this reward');
      return;
    }
    
    if (window.confirm(`Are you sure you want to redeem "${reward.title}" for ${reward.pointCost} points?`)) {
      const newRedemption = {
        userId: currentUser.id,
        rewardId,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };
      
      try {
        await redeemReward(newRedemption);
        alert('Reward redeemed successfully!');
      } catch (err) {
        console.error('Failed to redeem reward', err);
        alert('Failed to redeem reward');
      }
    }
  };

  return (
    <div>
      <h1 className="mb-4">Rewards Marketplace</h1>
      
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card bg-primary text-white">
            <div className="card-body d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Your Available Points</h5>
              <h3 className="mb-0">{currentUser.points}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body d-flex justify-content-between align-items-center">
              <button 
                className="btn btn-outline-primary"
                onClick={() => setShowRedemptionHistory(!showRedemptionHistory)}
              >
                {showRedemptionHistory ? 'Browse Rewards' : 'View Redemption History'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {showRedemptionHistory ? (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Your Redemption History</h5>
          </div>
          <div className="card-body">
            {userRedemptions.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Reward</th>
                      <th>Points</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userRedemptions.map(redemption => {
                      const reward = rewards.find(r => r.id === redemption.rewardId);
                      return (
                        <tr key={redemption.id}>
                          <td>{new Date(redemption.timestamp).toLocaleString()}</td>
                          <td>{reward ? reward.title : 'Unknown Reward'}</td>
                          <td>{reward ? reward.pointCost : 'N/A'}</td>
                          <td>
                            <span className={`badge redemption-${redemption.status}`}>
                              {redemption.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-muted">No redemption history</p>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="card mb-4">
            <div className="card-header">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h5 className="mb-0">Available Rewards</h5>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="pointsAsc">Points: Low to High</option>
                    <option value="pointsDesc">Points: High to Low</option>
                    <option value="nameAsc">Name: A to Z</option>
                    <option value="nameDesc">Name: Z to A</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search rewards..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="row">
                {filteredRewards.length > 0 ? (
                  filteredRewards.map(reward => (
                    <div key={reward.id} className="col-lg-4 col-md-6 mb-4">
                      <div className="card rewards-card h-100">
                        <img 
                          src={reward.imageUrl} 
                          className="card-img-top" 
                          alt={reward.title}
                          style={{ height: '150px', objectFit: 'cover' }}
                        />
                        <div className="card-body d-flex flex-column">
                          <h5 className="card-title">{reward.title}</h5>
                          <p className="card-text flex-grow-1">{reward.description}</p>
                          <div className="d-flex justify-content-between align-items-center mt-3">
                            <span className="badge bg-primary">{reward.pointCost} points</span>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleRedeemReward(reward.id)}
                              disabled={currentUser.points < reward.pointCost}
                            >
                              Redeem
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <p className="text-center text-muted">No rewards found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RewardsList;

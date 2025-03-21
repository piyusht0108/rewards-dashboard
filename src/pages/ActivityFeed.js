import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const ActivityFeed = () => {
  const { 
    activities, 
    users, 
    currentUser, 
    addActivity,
    loading, 
    error 
  } = useAppContext();
  
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!currentUser) return <div className="text-center">No user selected</div>;

  // Define activity types
  const activityTypes = [
    { id: 'survey', name: 'Survey Completion', points: 50 },
    { id: 'review', name: 'Product Review', points: 100 },
    { id: 'referral', name: 'Referral', points: 250 },
    { id: 'social', name: 'Social Media Share', points: 75 }
  ];

  // Filter activities
  let filteredActivities = activities;
  
  if (filter === 'my') {
    filteredActivities = activities.filter(
      activity => activity.userId === currentUser.id
    );
  }
  
  if (searchTerm) {
    filteredActivities = filteredActivities.filter(
      activity => 
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  // Sort by most recent
  filteredActivities = filteredActivities.sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  // Create a new activity
  const handleAddActivity = async (values, { resetForm }) => {
    const newActivity = {
      ...values,
      userId: currentUser.id,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };
    
    try {
      await addActivity(newActivity);
      resetForm();
    } catch (err) {
      console.error('Failed to add activity', err);
    }
  };

  // Validation schema
  const activitySchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    points: Yup.number()
      .required('Points are required')
      .min(1, 'Points must be at least 1')
  });

  return (
    <div>
      <h1 className="mb-4">Activities</h1>
      
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Log an Activity</h5>
            </div>
            <div className="card-body">
              <Formik
                initialValues={{
                  title: '',
                  description: '',
                  points: 50
                }}
                validationSchema={activitySchema}
                onSubmit={handleAddActivity}
              >
                {({ isSubmitting, setFieldValue }) => (
                  <Form>
                    <div className="mb-3">
                      <label htmlFor="activityType" className="form-label">Activity Type</label>
                      <Field
                        as="select"
                        className="form-select"
                        name="title"
                        onChange={(e) => {
                          const selectedType = activityTypes.find(
                            type => type.name === e.target.value
                          );
                          setFieldValue('title', e.target.value);
                          if (selectedType) {
                            setFieldValue('points', selectedType.points);
                          }
                        }}
                      >
                        <option value="">Select an activity type</option>
                        {activityTypes.map(type => (
                          <option key={type.id} value={type.name}>
                            {type.name} ({type.points} points)
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="title" component="div" className="text-danger" />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">Description</label>
                      <Field
                        as="textarea"
                        className="form-control"
                        name="description"
                        rows="3"
                      />
                      <ErrorMessage name="description" component="div" className="text-danger" />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="points" className="form-label">Points</label>
                      <Field
                        type="number"
                        className="form-control"
                        name="points"
                      />
                      <ErrorMessage name="points" component="div" className="text-danger" />
                    </div>
                    
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Log Activity'}
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Activity Stats</h5>
            </div>
            <div className="card-body">
              <p><strong>Total Activities:</strong> {activities.length}</p>
              <p>
                <strong>Your Activities:</strong>{' '}
                {activities.filter(a => a.userId === currentUser.id).length}
              </p>
              <p>
                <strong>Points Earned:</strong>{' '}
                {activities
                  .filter(a => a.userId === currentUser.id)
                  .reduce((sum, activity) => sum + activity.points, 0)
                }
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h5 className="mb-0">Activity Feed</h5>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Activities</option>
                <option value="my">My Activities</option>
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="card-body">
          {filteredActivities.length > 0 ? (
            filteredActivities.map(activity => {
              const user = users.find(u => u.id === activity.userId);
              return (
                <div key={activity.id} className="activity-item">
                  <h6>{activity.title}</h6>
                  <p className="text-muted mb-1">{activity.description}</p>
                  <div className="d-flex justify-content-between">
                    <small className="text-muted">
                      {user ? user.name : 'Unknown User'} • {new Date(activity.timestamp).toLocaleString()}
                    </small>
                    <span className="badge bg-success">+{activity.points} points</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-muted">No activities found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;
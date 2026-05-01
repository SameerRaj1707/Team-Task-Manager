import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`http://localhost:5000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/projects/${id}/members`,
        { email: memberEmail, role: memberRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowAddMember(false);
      setMemberEmail('');
      fetchProject();
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Remove this member from the project?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/projects/${id}/members`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { memberId: userId }
        });
        fetchProject();
      } catch (error) {
        console.error('Error removing member:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  const isOwner = project.owner._id === localStorage.getItem('userId');

  return (
    <div className="project-detail-page">
      <div className="page-header">
        <div>
          <h2>{project.name}</h2>
          <p className="project-description">{project.description}</p>
        </div>
        <div className="header-actions">
          <Link to={`/projects/${id}/tasks`} className="btn-primary">
            View Tasks
          </Link>
          <button onClick={() => setShowAddMember(true)} className="btn-secondary">
            Add Member
          </button>
        </div>
      </div>

      <div className="project-stats">
        <div className="stat-card">
          <h4>Total Tasks</h4>
          <p className="stat-number">{project.tasks?.length || 0}</p>
        </div>
        <div className="stat-card">
          <h4>Members</h4>
          <p className="stat-number">{project.members?.length || 0}</p>
        </div>
        <div className="stat-card">
          <h4>Status</h4>
          <p className="stat-number">{project.status}</p>
        </div>
      </div>

      <div className="team-section">
        <h3>Team Members</h3>
        <div className="member-list">
          {project.members?.map(member => (
            <div key={member.user._id} className="member-card">
              <div className="member-info">
                <span className="member-name">{member.user.name}</span>
                <span className="member-email">{member.user.email}</span>
                <span className={`member-role role-${member.role}`}>{member.role}</span>
              </div>
              {isOwner && member.role !== 'admin' && (
                <button 
                  onClick={() => handleRemoveMember(member.user._id)}
                  className="btn-danger btn-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {showAddMember && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Team Member</h3>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label>Member Email</label>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select 
                  value={memberRole} 
                  onChange={(e) => setMemberRole(e.target.value)}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Add Member
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddMember(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;

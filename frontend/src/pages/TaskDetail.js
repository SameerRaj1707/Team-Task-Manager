import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [task, setTask] = useState(null);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    project: '',
    dueDate: ''
  });

  useEffect(() => {
    fetchProjects();
    if (id !== 'new') {
      fetchTask();
    }
    // Set default project from URL if coming from project page
    if (location.state?.projectId) {
      setFormData(prev => ({ ...prev, project: location.state.projectId }));
    }
  }, [id, location.state]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5000/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchTask = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`http://localhost:5000/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTask(data);
      setFormData({
        title: data.title,
        description: data.description || '',
        status: data.status,
        priority: data.priority,
        project: data.project?._id || '',
        dueDate: data.dueDate ? data.dueDate.split('T')[0] : ''
      });
    } catch (error) {
      console.error('Error fetching task:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (id === 'new') {
        await axios.post('http://localhost:5000/api/tasks', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.put(`http://localhost:5000/api/tasks/${id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      navigate(-1);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  if (!task && id !== 'new') {
    return <div>Loading...</div>;
  }

  return (
    <div className="task-detail-page">
      <h2>{id === 'new' ? 'Create New Task' : 'Edit Task'}</h2>
      
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label>Project *</label>
          <select 
            name="project" 
            value={formData.project} 
            onChange={handleChange}
            required
          >
            <option value="">Select Project</option>
            {projects.map(project => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Priority</label>
            <select name="priority" value={formData.priority} onChange={handleChange}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label>Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {id === 'new' ? 'Create' : 'Update'}
          </button>
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskDetail;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ 
    todo: 0, 
    inProgress: 0, 
    done: 0, 
    overdue: 0,
    dueToday: 0,
    total: 0 
  });
  const [projects, setProjects] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch stats
      const statsRes = await axios.get('http://localhost:5000/api/tasks/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(statsRes.data);

      // Fetch recent tasks
      const tasksRes = await axios.get('http://localhost:5000/api/tasks?status=todo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasksRes.data.slice(0, 5));

      // Fetch projects
      const projectsRes = await axios.get('http://localhost:5000/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(projectsRes.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="dashboard">
      <h2>Welcome back, {user?.name}!</h2>
      <p className="dashboard-subtitle">Here's your team overview</p>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon todo-icon">📋</div>
          <div className="stat-info">
            <h3>To Do</h3>
            <p className="stat-number">{stats.todo}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon inprogress-icon">🔄</div>
          <div className="stat-info">
            <h3>In Progress</h3>
            <p className="stat-number">{stats.inProgress}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon done-icon">✅</div>
          <div className="stat-info">
            <h3>Done</h3>
            <p className="stat-number">{stats.done}</p>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon overdue-icon">⚠️</div>
          <div className="stat-info">
            <h3>Overdue</h3>
            <p className="stat-number">{stats.overdue}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon today-icon">📅</div>
          <div className="stat-info">
            <h3>Due Today</h3>
            <p className="stat-number">{stats.dueToday}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon total-icon">📊</div>
          <div className="stat-info">
            <h3>Total Tasks</h3>
            <p className="stat-number">{stats.total}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <div className="section-header">
            <h3>Active Projects</h3>
            <Link to="/projects" className="view-all">View All</Link>
          </div>
          {projects.length === 0 ? (
            <p className="empty-message">No projects yet. Create your first project!</p>
          ) : (
            <div className="project-list-mini">
              {projects.map(project => (
                <Link key={project._id} to={`/projects/${project._id}`} className="project-item">
                  <div className="project-info">
                    <h4>{project.name}</h4>
                    <p>{project.members?.length || 0} members</p>
                  </div>
                  <span className={`status-badge status-${project.status}`}>
                    {project.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h3>Pending Tasks</h3>
            <Link to="/tasks" className="view-all">View All</Link>
          </div>
          {tasks.length === 0 ? (
            <p className="empty-message">No pending tasks. Great job!</p>
          ) : (
            <div className="task-list-mini">
              {tasks.map(task => (
                <Link key={task._id} to={`/tasks/${task._id}`} className="task-item">
                  <div className="task-info">
                    <h4>{task.title}</h4>
                    <p>{task.project?.name}</p>
                  </div>
                  <div className="task-meta">
                    <span className={`priority-badge priority-${task.priority}`}>
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className={`due-date ${isOverdue(task.dueDate) ? 'overdue' : ''}`}>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

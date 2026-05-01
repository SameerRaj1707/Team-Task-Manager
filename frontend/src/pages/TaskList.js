import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const TaskList = () => {
  const { id: projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState({ status: 'all', priority: 'all', project: projectId || '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [filter]);

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

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      let queryParams = '';
      
      if (filter.status !== 'all') queryParams += `status=${filter.status}&`;
      if (filter.priority !== 'all') queryParams += `priority=${filter.priority}&`;
      if (filter.project) queryParams += `project=${filter.project}`;
      
      const url = queryParams 
        ? `http://localhost:5000/api/tasks?${queryParams}` 
        : 'http://localhost:5000/api/tasks';
        
      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="task-list-page">
      <div className="page-header">
        <h2>Tasks {projectId ? `- ${projects.find(p => p._id === projectId)?.name || ''}` : ''}</h2>
        <Link 
          to={projectId ? `/tasks/new` : `/tasks/new`} 
          state={projectId ? { projectId } : {}}
          className="btn-primary"
        >
          Create New Task
        </Link>
      </div>
      
      <div className="filter-container">
        <div className="filter-group">
          <label>Status:</label>
          <select value={filter.status} onChange={(e) => setFilter({...filter, status: e.target.value})}>
            <option value="all">All</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Priority:</label>
          <select value={filter.priority} onChange={(e) => setFilter({...filter, priority: e.target.value})}>
            <option value="all">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        
        {!projectId && (
          <div className="filter-group">
            <label>Project:</label>
            <select value={filter.project} onChange={(e) => setFilter({...filter, project: e.target.value})}>
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {loading ? (
        <div>Loading...</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <p>No tasks found. Create your first task!</p>
        </div>
      ) : (
        <table className="task-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Project</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task._id}>
                <td>
                  <Link to={`/tasks/${task._id}`}>{task.title}</Link>
                </td>
                <td>{task.project?.name || '-'}</td>
                <td>
                  <span className={`status-badge status-${task.status}`}>
                    {task.status.replace('-', ' ')}
                  </span>
                </td>
                <td>
                  <span className={`priority-badge priority-${task.priority}`}>
                    {task.priority}
                  </span>
                </td>
                <td>
                  {task.dueDate ? (
                    <span className={isOverdue(task.dueDate) ? 'overdue' : ''}>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  ) : '-'}
                </td>
                <td>
                  <button 
                    onClick={() => handleDelete(task._id)}
                    className="btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TaskList;

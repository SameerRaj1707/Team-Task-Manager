const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, project, assignee, dueDate, startDate } = req.body;
    
    // Verify project exists and user has access
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = projectDoc.members.some(
      m => m.user.toString() === req.user._id.toString()
    );
    const isOwner = projectDoc.owner.toString() === req.user._id.toString();
    
    if (!isMember && !isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied to this project' });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      project,
      assignee,
      createdBy: req.user._id,
      dueDate,
      startDate
    });

    // Add task to project
    await Project.findByIdAndUpdate(project, {
      $push: { tasks: task._id }
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all tasks for a user (across all projects)
exports.getTasks = async (req, res) => {
  try {
    const { project, status, priority, overdue } = req.query;
    
    // Get user's projects
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    }).select('_id');

    const projectIds = projects.map(p => p._id);
    
    const query = { project: { $in: projectIds } };
    
    if (project) {
      query.project = project;
    }
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    if (overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: 'done' };
    }

    const tasks = await Task.find(query)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name')
      .sort('-createdAt');

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single task
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .populate('project');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { title, description, status, priority, assignee, dueDate } = req.body;
    const updates = {};
    
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status) {
      updates.status = status;
      if (status === 'done') {
        updates.completedAt = new Date();
      }
    }
    if (priority) updates.priority = priority;
    if (assignee) updates.assignee = assignee;
    if (dueDate) updates.dueDate = dueDate;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
    .populate('assignee', 'name email')
    .populate('createdBy', 'name email');

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Remove task from project
    await Project.findByIdAndUpdate(task.project, {
      $pull: { tasks: req.params.id }
    });

    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const { project } = req.query;
    
    // Get user's projects
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    }).select('_id');

    const projectIds = project ? [project] : projects.map(p => p._id);
    const now = new Date();

    // Get task counts by status
    const todoCount = await Task.countDocuments({ 
      project: { $in: projectIds },
      status: 'todo' 
    });
    
    const inProgressCount = await Task.countDocuments({ 
      project: { $in: projectIds },
      status: 'in-progress' 
    });
    
    const doneCount = await Task.countDocuments({ 
      project: { $in: projectIds },
      status: 'done' 
    });

    // Get overdue tasks
    const overdueCount = await Task.countDocuments({
      project: { $in: projectIds },
      dueDate: { $lt: now },
      status: { $ne: 'done' }
    });

    // Get tasks due today
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));
    
    const dueTodayCount = await Task.countDocuments({
      project: { $in: projectIds },
      dueDate: { $gte: todayStart, $lte: todayEnd },
      status: { $ne: 'done' }
    });

    res.status(200).json({
      todo: todoCount,
      inProgress: inProgressCount,
      done: doneCount,
      overdue: overdueCount,
      dueToday: dueTodayCount,
      total: todoCount + inProgressCount + doneCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

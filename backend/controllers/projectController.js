const Project = require('../models/Project');
const User = require('../models/User');

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    // Add project to user's projects
    await User.findByIdAndUpdate(req.user._id, {
      $push: { projects: project._id }
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all projects for a user
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    })
    .populate('owner', 'name email')
    .populate('members.user', 'name email')
    .sort('-createdAt');

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single project with tasks
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email')
      .populate({
        path: 'tasks',
        populate: [
          { path: 'assignee', select: 'name email' },
          { path: 'createdBy', select: 'name email' }
        ]
      });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is member or owner
    const isMember = project.members.some(
      member => member.user._id.toString() === req.user._id.toString()
    );
    const isOwner = project.owner._id.toString() === req.user._id.toString();

    if (!isMember && !isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner or admin
    const isOwner = project.owner.toString() === req.user._id.toString();
    const member = project.members.find(
      m => m.user.toString() === req.user._id.toString() && m.role === 'admin'
    );

    if (!isOwner && !member && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, description, status } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (status) updates.status = status;

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('members.user', 'name email');

    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can delete
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only owner can delete project' });
    }

    await Project.findByIdAndDelete(req.params.id);
    
    // Remove project from all members
    await User.updateMany(
      { projects: req.params.id },
      { $pull: { projects: req.params.id } }
    );

    res.status(200).json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add member to project
exports.addMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner or admin
    const isOwner = project.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already a member
    const isAlreadyMember = project.members.some(
      member => member.user.toString() === user._id.toString()
    );
    if (isAlreadyMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    // Add member
    project.members.push({ user: user._id, role: role || 'member' });
    await project.save();

    // Add project to user's projects
    await User.findByIdAndUpdate(user._id, {
      $push: { projects: project._id }
    });

    res.status(200).json({ message: 'Member added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove member from project
exports.removeMember = async (req, res) => {
  try {
    const { memberId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner or admin
    const isOwner = project.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove member
    project.members = project.members.filter(
      member => member.user.toString() !== memberId
    );
    await project.save();

    // Remove project from user's projects
    await User.findByIdAndUpdate(memberId, {
      $pull: { projects: project._id }
    });

    res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get project team members
exports.getProjectMembers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members.user', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(project.members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

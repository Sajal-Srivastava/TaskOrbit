import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import AppShell from '../components/AppShell';
import { useAuth } from '../context/AuthContext';

const statusLabels = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

export default function ProjectPage() {
  const { user } = useAuth();
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [memberUserId, setMemberUserId] = useState('');
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    dueDate: '',
    assigneeId: '',
  });
  const [error, setError] = useState('');

  const canManageMembers =
    user?.role === 'admin' || Number(project?.owner_id) === Number(user?.id);

  const loadData = async () => {
    setError('');
    try {
      const [{ data: projectData }, { data: tasksData }, { data: usersData }] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`),
        api.get('/projects/users'),
      ]);

      setProject(projectData.project);
      setMembers(projectData.members);
      setTasks(tasksData.tasks);
      setUsers(usersData.users);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project.');
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const addMember = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await api.post(`/projects/${id}/members`, { userId: Number(memberUserId) });
      setMemberUserId('');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member.');
    }
  };

  const removeMember = async (targetUserId) => {
    setError('');
    try {
      await api.delete(`/projects/${id}/members/${targetUserId}`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member.');
    }
  };

  const createTask = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await api.post(`/projects/${id}/tasks`, {
        ...taskForm,
        dueDate: taskForm.dueDate || null,
        assigneeId: taskForm.assigneeId ? Number(taskForm.assigneeId) : null,
      });
      setTaskForm({
        title: '',
        description: '',
        status: 'todo',
        dueDate: '',
        assigneeId: '',
      });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task.');
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    setError('');
    try {
      await api.patch(`/tasks/${taskId}`, { status });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task.');
    }
  };

  const deleteTask = async (taskId) => {
    setError('');
    try {
      await api.delete(`/tasks/${taskId}`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  return (
    <AppShell>
      <section className="card">
        <h1>{project?.name || 'Project'}</h1>
        <p>{project?.description || 'No description provided.'}</p>
        {error ? <p className="error-text">{error}</p> : null}
      </section>

      <section className="grid two">
        <article className="card">
          <h2>Team Members</h2>
          <ul className="member-list">
            {members.map((member) => (
              <li key={member.id}>
                <div>
                  <strong>{member.name}</strong>
                  <p>
                    {member.email} | {member.role}
                  </p>
                </div>
                {canManageMembers && Number(project?.owner_id) !== Number(member.id) ? (
                  <button
                    type="button"
                    className="danger-btn"
                    onClick={() => removeMember(member.id)}
                  >
                    Remove
                  </button>
                ) : null}
              </li>
            ))}
          </ul>

          {canManageMembers ? (
            <form onSubmit={addMember} className="inline-form">
              <select
                value={memberUserId}
                onChange={(event) => setMemberUserId(event.target.value)}
                required
              >
                <option value="">Select user</option>
                {users
                  .filter((candidate) => !members.some((member) => member.id === candidate.id))
                  .map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.name} ({candidate.email})
                    </option>
                  ))}
              </select>
              <button type="submit" className="secondary-btn">
                Add Member
              </button>
            </form>
          ) : null}
        </article>

        <article className="card">
          <h2>Create Task</h2>
          <form onSubmit={createTask} className="form-grid">
            <input
              placeholder="Task title"
              value={taskForm.title}
              onChange={(event) =>
                setTaskForm((prev) => ({ ...prev, title: event.target.value }))
              }
              required
            />
            <textarea
              placeholder="Task description"
              rows={3}
              value={taskForm.description}
              onChange={(event) =>
                setTaskForm((prev) => ({ ...prev, description: event.target.value }))
              }
            />
            <div className="form-row">
              <select
                value={taskForm.status}
                onChange={(event) =>
                  setTaskForm((prev) => ({ ...prev, status: event.target.value }))
                }
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(event) =>
                  setTaskForm((prev) => ({ ...prev, dueDate: event.target.value }))
                }
              />
              <select
                value={taskForm.assigneeId}
                onChange={(event) =>
                  setTaskForm((prev) => ({ ...prev, assigneeId: event.target.value }))
                }
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="primary-btn">
              Create Task
            </button>
          </form>
        </article>
      </section>

      <section className="card">
        <h2>Tasks</h2>
        <div className="task-table">
          <div className="task-head">
            <span>Title</span>
            <span>Status</span>
            <span>Due Date</span>
            <span>Assignee</span>
            <span>Actions</span>
          </div>
          {tasks.map((task) => (
            <div key={task.id} className={task.is_overdue ? 'task-row overdue' : 'task-row'}>
              <span>{task.title}</span>
              <span>
                <select
                  value={task.status}
                  onChange={(event) => updateTaskStatus(task.id, event.target.value)}
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </span>
              <span>{task.due_date || '-'}</span>
              <span>{task.assignee_name || '-'}</span>
              <span>
                <button
                  type="button"
                  className="danger-btn"
                  onClick={() => deleteTask(task.id)}
                >
                  Delete
                </button>
              </span>
            </div>
          ))}
          {!tasks.length ? <p>No tasks in this project yet.</p> : null}
        </div>
      </section>
    </AppShell>
  );
}

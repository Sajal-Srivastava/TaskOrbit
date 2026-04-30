import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import AppShell from '../components/AppShell';

const statusOptions = [
  { label: 'All', value: '' },
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
];

const formatStatus = (status) =>
  ({ todo: 'To Do', in_progress: 'In Progress', done: 'Done' }[status] || status);

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ status: '', projectId: '', overdue: false });
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    const { data } = await api.get('/projects');
    setProjects(data.projects);
  };

  const loadTasks = async (activeFilters = filters) => {
    const query = new URLSearchParams();
    if (activeFilters.status) {
      query.set('status', activeFilters.status);
    }
    if (activeFilters.projectId) {
      query.set('projectId', activeFilters.projectId);
    }
    if (activeFilters.overdue) {
      query.set('overdue', 'true');
    }

    const { data } = await api.get(`/tasks/dashboard?${query.toString()}`);
    setTasks(data.tasks);
  };

  const loadAll = async () => {
    setError('');
    setLoading(true);
    try {
      await Promise.all([loadProjects(), loadTasks()]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const overdueCount = useMemo(
    () => tasks.filter((task) => task.is_overdue).length,
    [tasks],
  );

  const handleCreateProject = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await api.post('/projects', projectForm);
      setProjectForm({ name: '', description: '' });
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.');
    }
  };

  const applyFilters = async (nextFilters) => {
    setFilters(nextFilters);
    try {
      await loadTasks(nextFilters);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to filter tasks.');
    }
  };

  return (
    <AppShell>
      <section className="grid two">
        <article className="card stat-card">
          <h2>Task Overview</h2>
          <p className="stat-value">{tasks.length}</p>
          <p>Total tasks in your scope</p>
          <p className={overdueCount ? 'overdue-pill' : 'ok-pill'}>
            {overdueCount} overdue task{overdueCount === 1 ? '' : 's'}
          </p>
        </article>

        <article className="card">
          <h2>Create Project</h2>
          <form onSubmit={handleCreateProject} className="form-grid">
            <input
              placeholder="Project name"
              value={projectForm.name}
              onChange={(event) =>
                setProjectForm((prev) => ({ ...prev, name: event.target.value }))
              }
              required
            />
            <textarea
              placeholder="Project description"
              value={projectForm.description}
              onChange={(event) =>
                setProjectForm((prev) => ({ ...prev, description: event.target.value }))
              }
              rows={3}
            />
            <button type="submit" className="primary-btn">
              Add Project
            </button>
          </form>
        </article>
      </section>

      <section className="card">
        <h2>Projects</h2>
        <div className="project-list">
          {projects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`} className="project-tile">
              <h3>{project.name}</h3>
              <p>{project.description || 'No description'}</p>
              <span>{project.task_count} task(s)</span>
            </Link>
          ))}
          {!projects.length && !loading ? <p>No projects found.</p> : null}
        </div>
      </section>

      <section className="card">
        <div className="row-between">
          <h2>All Tasks</h2>
          <div className="filter-row">
            <select
              value={filters.status}
              onChange={(event) => applyFilters({ ...filters, status: event.target.value })}
            >
              {statusOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <select
              value={filters.projectId}
              onChange={(event) => applyFilters({ ...filters, projectId: event.target.value })}
            >
              <option value="">All Projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <label className="check-wrap">
              <input
                type="checkbox"
                checked={filters.overdue}
                onChange={(event) =>
                  applyFilters({ ...filters, overdue: event.target.checked })
                }
              />
              Overdue only
            </label>
          </div>
        </div>

        {error ? <p className="error-text">{error}</p> : null}

        <div className="task-table">
          <div className="task-head">
            <span>Task</span>
            <span>Project</span>
            <span>Status</span>
            <span>Due</span>
            <span>Assignee</span>
          </div>
          {tasks.map((task) => (
            <div key={task.id} className={task.is_overdue ? 'task-row overdue' : 'task-row'}>
              <span>{task.title}</span>
              <span>{task.project_name}</span>
              <span>{formatStatus(task.status)}</span>
              <span>{task.due_date || '-'}</span>
              <span>{task.assignee_name || '-'}</span>
            </div>
          ))}
          {!tasks.length && !loading ? <p>No tasks for selected filters.</p> : null}
        </div>
      </section>
    </AppShell>
  );
}

const API_BASE = "https://api.todoist.com/rest/v2";

export type TodoistProject = {
  id: string;
  name: string;
  color: string;
  is_favorite: boolean;
};

export type TodoistSection = {
  id: string;
  name: string;
  project_id: string;
  order: number;
};

export type TodoistTask = {
  id: string;
  content: string;
  project_id: string;
  section_id: string | null;
};

export interface TodoistApi {
  listProjects(): Promise<TodoistProject[]>;
  listSections(projectId: string): Promise<TodoistSection[]>;
  addTask(args: {
    content: string;
    projectId: string;
    sectionId?: string;
  }): Promise<TodoistTask>;
}

async function todoistGet<T>(path: string, token: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  }
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Todoist API ${path} failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as T;
}

async function todoistPost<T>(path: string, token: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Todoist API POST ${path} failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as T;
}

export function createTodoistApi(token: string): TodoistApi {
  return {
    listProjects() {
      return todoistGet<TodoistProject[]>("/projects", token);
    },

    listSections(projectId: string) {
      return todoistGet<TodoistSection[]>("/sections", token, { project_id: projectId });
    },

    async addTask(args) {
      const payload: Record<string, unknown> = {
        content: args.content,
        project_id: args.projectId,
      };
      if (args.sectionId !== undefined) {
        payload.section_id = args.sectionId;
      }
      return todoistPost<TodoistTask>("/tasks", token, payload);
    },
  };
}

export function getTodoistToken(): string {
  const token = process.env.TODOIST_API_TOKEN;
  if (!token) {
    throw new Error(
      "TODOIST_API_TOKEN is not set. Add it to .env — get your token from https://app.todoist.com/app/settings/integrations/developer",
    );
  }
  return token;
}
